"""Eski serverdan (Node.js + SQLite, 1.x) yangi serverga (Python + PostgreSQL) koʻchirish.

Korxona serverida bir marta ishga tushiriladi; maʼlumot korxonadan tashqariga chiqmaydi:

    python -m app.services.legacy_migration --old /eski/agmk-server            # eski server papkasi (data/, xodimlar.json …)
    python -m app.services.legacy_migration --old /eski/agmk-server --dry-run  # faqat tekshirish

Nimalar koʻchadi:
  • data/agmk.db — barcha jadvallar (hisoblar, yozuvlar va tarix, xabarlar, fayllar, imzolar, yoʻl izlari, audit …);
  • data/jwt.secret, data/anon.key — sessiyalar, shifrlangan imzolar va QR ulanishi ishlashda davom etadi;
  • data/server.crt, data/server.key — telefonlar sertifikatni barmoq izi boʻyicha taniydi, qayta ulash shart emas;
  • data/oklad.json, data/tashqi_manzil.json.
xodimlar.json, paketlar/ va imzo_yuklash/ koʻchirilmaydi — ular AGMK_COMPANY_DIR papkasiga nusxalanadi (oʻrnatish yoʻriqnomasi).
Yangi baza boʻsh boʻlishi shart (aks holda --force).
"""
from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import json
import os
import shutil
import sqlite3
import sys
import tempfile
from pathlib import Path

from psycopg import AsyncConnection
from psycopg.rows import dict_row

from app.core import database as db
from app.core.config import settings

UTC = dt.timezone.utc


def ts(v):
    """ISO matn (JavaScript toISOString) → timestamptz; boʻsh — None."""
    if v in (None, ''):
        return None
    s = str(v)
    try:
        return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).astimezone(UTC)
    except ValueError:
        return None


def b(v):
    return bool(v) if v is not None else None


def js(v):
    """SQLite dagi JSON matn — aynan oʻzi (kalitlar tartibi saqlanadi). Notoʻgʻri JSON boʻlsa — matn sifatida."""
    if v is None:
        return None
    try:
        json.loads(v)
        return v
    except (TypeError, ValueError):
        return json.dumps(v, ensure_ascii=False)


TABLES = {  # jadval: (ustunlar, aylantirish)
    'users': (['tabel', 'name', 'lavozim', 'salt', 'hash', 'role', 'status', 'created_at', 'last_login', 'device', 'demo', 'must_change', 'sig', 'sigpin'],
              {'created_at': ts, 'last_login': ts, 'demo': b, 'must_change': b}),
    'records': (['id', 'kind', 'data', 'deleted', 'updated_at', 'updated_by'], {'data': js, 'deleted': b}),
    'history': (['seq', 'id', 'kind', 'data', 'deleted', 'updated_at', 'updated_by'], {'data': js, 'deleted': b}),
    'messages': (['id', 'from_tabel', 'from_name', 'to_tabel', 'text', 'created_at', 'files'], {'created_at': ts, 'files': js}),
    'files': (['id', 'owner', 'to_tabel', 'name', 'mime', 'size', 'data', 'created_at'], {'created_at': ts, 'data': lambda v: bytes(v) if v is not None else None}),
    'refresh': (['token', 'tabel', 'expires'], {}),
    'sign_docs': (['id', 'title', 'html', 'hash', 'created_by', 'created_at', 'status', 'signers', 'done_at', 'demo', 'meta'],
                  {'created_at': ts, 'done_at': ts, 'signers': js, 'demo': b, 'meta': js}),
    'sign_acts': (['id', 'doc_id', 'tabel', 'action', 'reason', 'png', 'hash', 'at', 'device'], {'at': ts}),
    'sign_seen': (['doc_id', 'tabel', 'at'], {'at': ts}),
    'vt_act': (['doc_id', 'a', 'b', 'dfrom', 'dto', 'why', 'created_by', 'done_at', 'cancelled'], {'done_at': ts, 'cancelled': ts}),
    'trk': (['tabel', 'uid', 'day', 'unit', 'pts', 'upd'], {'pts': js}),
    'audit': (['seq', 'at', 'tabel', 'action', 'detail', 'ip'], {'at': ts}),
    'kir_seed': (['tabel', 'ch', 'at'], {'at': ts}),
    'kir_alt': (['tabel', 'i', 'name', 'salt', 'hash'], {}),
}
JSON_COLS = {'records': {'data'}, 'history': {'data'}, 'messages': {'files'}, 'sign_docs': {'signers', 'meta'}, 'trk': {'pts'}}
SERIALS = [('history', 'seq'), ('messages', 'id'), ('sign_acts', 'id'), ('audit', 'seq')]


def copy_secret(src: Path, dst: Path, force: bool, dry: bool) -> str:
    if not src.exists():
        return 'yoʻq (yangisi yaratiladi)'
    if dst.exists() and dst.read_bytes() != src.read_bytes() and not force:
        raise SystemExit('XATO: %s allaqachon bor va eskisidan farq qiladi (--force bilan almashtiriladi)' % dst)
    if not dry:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        dst.chmod(0o600)
        if os.geteuid() == 0:  # root sifatida ishga tushirilgan boʻlsa — egasi papka egasi (server foydalanuvchisi) boʻlsin
            st = dst.parent.stat()
            os.chown(dst, st.st_uid, st.st_gid)
    return 'koʻchirildi'


async def run(old: Path, dry: bool, force: bool) -> int:
    data = old / 'data'
    sq = data / 'agmk.db'
    if not sq.exists():
        raise SystemExit('XATO: %s topilmadi' % sq)
    print('Eski baza:', sq)
    for name, dst in (('jwt.secret', settings.secrets_dir / 'jwt.secret'), ('anon.key', settings.secrets_dir / 'anon.key'),
                      ('server.crt', settings.certs_dir / 'server.crt'), ('server.key', settings.certs_dir / 'server.key')):
        print('  %-11s → %s: %s' % (name, dst, copy_secret(data / name, dst, force, dry)))
    # asl baza oʻzgarmasin: nusxasi (WAL fayllari bilan) vaqtinchalik papkada ochiladi — eski server toʻgʻri yopilmagan boʻlsa ham
    tmp = Path(tempfile.mkdtemp(prefix='agmk_old_'))
    for suf in ('', '-wal', '-shm'):
        if (data / ('agmk.db' + suf)).exists():
            shutil.copyfile(data / ('agmk.db' + suf), tmp / ('agmk.db' + suf))
    src = sqlite3.connect(str(tmp / 'agmk.db'))
    src.row_factory = sqlite3.Row
    have = {r[0] for r in src.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    if not dry:
        await db.migrate()
    async with await AsyncConnection.connect(settings.dsn, row_factory=dict_row, autocommit=True) as c:
        if not dry:
            busy = (await (await c.execute('SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM records) AS n')).fetchone())['n']
            if busy and not force:
                raise SystemExit('XATO: yangi bazada maʼlumot bor (%d ta). Boʻsh bazaga koʻchiring yoki --force' % busy)
        report = []
        async with c.transaction(force_rollback=dry):
            for t, (cols, conv) in TABLES.items():
                if t not in have:
                    report.append((t, 0, 'eski bazada yoʻq'))
                    continue
                scols = {r[1] for r in src.execute('PRAGMA table_info(%s)' % t)}
                use = [x for x in cols if x in scols]
                rows = src.execute('SELECT %s FROM %s' % (', '.join(use), t)).fetchall()
                if dry:
                    report.append((t, len(rows), 'tekshirildi'))
                    continue
                ph = ', '.join('%s::json' if x in JSON_COLS.get(t, ()) else '%s' for x in use)
                sql = 'INSERT INTO %s (%s) VALUES (%s)' % (t, ', '.join(use), ph)
                batch = [tuple(conv.get(x, lambda v: v)(r[x]) for x in use) for r in rows]
                async with c.cursor() as cur:
                    for i in range(0, len(batch), 500):
                        await cur.executemany(sql, batch[i:i + 500])
                n = (await (await c.execute('SELECT count(*) AS n FROM %s' % t)).fetchone())['n']
                report.append((t, len(rows), 'OK' if n >= len(rows) else 'XATO: bazada %d' % n))
            if not dry:
                for t, col in SERIALS:
                    await c.execute("SELECT setval(pg_get_serial_sequence(%s, %s), GREATEST((SELECT COALESCE(MAX({}), 0) FROM {}), 1))".format(col, t), (t, col))
                ok = data / 'oklad.json'
                if ok.exists():
                    o = json.loads(ok.read_text(encoding='utf8')) or {}
                    for tb, x in o.items():
                        await c.execute('INSERT INTO oklad (tabel, oklad, razryad, at, by_tabel) VALUES (%s, %s, %s, %s, %s) ON CONFLICT (tabel) DO NOTHING',
                                        (tb, x.get('oklad'), x.get('razryad'), ts(x.get('at')) or dt.datetime.now(UTC), x.get('by')))
                    report.append(('oklad.json', len(o), 'OK'))
                ext = data / 'tashqi_manzil.json'
                if ext.exists():
                    e = json.loads(ext.read_text(encoding='utf8')).get('e', '')
                    await c.execute("INSERT INTO settings (key, value) VALUES ('ext', %s::json) ON CONFLICT (key) DO NOTHING", (json.dumps({'e': e}),))
                    report.append(('tashqi_manzil.json', 1, 'OK'))
    print('\n%-20s %8s  %s' % ('jadval', 'yozuv', 'holat'))
    for t, n, s in report:
        print('%-20s %8d  %s' % (t, n, s))
    bad = [r for r in report if r[2].startswith('XATO')]
    print('\n' + ('XATOLAR BOR' if bad else ('Tekshiruv tugadi (hech narsa yozilmadi)' if dry else 'Koʻchirish tugadi ✅')))
    return 1 if bad else 0


def main() -> None:
    ap = argparse.ArgumentParser(description='Eski AGMK-STTB serveridan (SQLite) PostgreSQL ga koʻchirish')
    ap.add_argument('--old', required=True, type=Path, help='eski server papkasi (ichida data/agmk.db)')
    ap.add_argument('--dry-run', action='store_true', help='faqat tekshirish, hech narsa yozilmaydi')
    ap.add_argument('--force', action='store_true', help='boʻsh boʻlmagan bazaga ham yozish / kalitlarni almashtirish')
    a = ap.parse_args()
    sys.exit(asyncio.run(run(a.old, a.dry_run, a.force)))


if __name__ == '__main__':
    main()
