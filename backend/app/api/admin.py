"""Boshqaruv paneli — faqat server kompyuterining oʻzidan (127.0.0.1:8080), tashqariga ochilmaydi."""
from __future__ import annotations

import asyncio
import datetime as dt
import json
import logging
import re
import secrets
from pathlib import Path

from starlette.requests import Request
from starlette.responses import FileResponse, Response

from app.core import database as db
from app.core.permissions import ROLES
from app.core.config import VERSION, settings
from app.core.audit import audit, user_get
from app.services.roster import ROSTER, STATE, roster_load
from app.api.sign import docs_all, sd_view
from app.core.security import Keys, derive_pw, enc, hash_pw, new_salt
from app.core.tls import TLS
from app.core.utils import clean_tabel, clip, iso, iso_to_micros, next_stamp, surname_key
from app.core.http_utils import BadJson, TooBig, body_obj, dumps, err, read_body, send

log = logging.getLogger('agmk')
STATIC = Path(__file__).resolve().parents[1] / 'static'
ADMIN_TOKEN = secrets.token_hex(24)  # har ishga tushishda yangi
ROLE_UZ = {'admin': 'Administrator', 'editor': 'Tahrirlovchi', 'viewer': "Faqat ko'rish"}
STATUS_UZ = {'pending': 'Tasdiq kutmoqda', 'active': 'Faol', 'blocked': 'Bloklangan'}
CSP = "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:"


# ------------------------------------------------------------------ tashqi manzil va ulanish maʼlumoti
async def ext_get() -> str:
    r = await db.one("SELECT value FROM settings WHERE key = 'ext'")
    e = (r['value'] or {}).get('e', '') if r else ''
    return e if re.fullmatch(r'https://[A-Za-z0-9.-]+(:\d+)?', e or '') else ''


def connect_info(ip: str, ext: str) -> str:
    o = {'u': 'https://%s:%d' % (ip, settings.public_port), 'k': Keys.anon_key, 'f': TLS.fp, 'n': 'AGMK-STTB'}
    if ext:
        o['e'] = ext
    return dumps(o)


# ------------------------------------------------------------------ imzo fayllari (egasi bergan, faqat oʻziniki)
async def sig_seed() -> None:
    """imzo_yuklash/<tabel>.png: hisob mavjud va imzosi boʻsh boʻlsa — bir marta yuklanadi (shifrlangan).
    Fayl oʻqish uchun ulangan papkada boʻlgani uchun qayta nomlanmaydi; yuklangani bazadagi belgidan bilinadi."""
    d = settings.company_dir / 'imzo_yuklash'
    try:
        if not d.exists():
            return
        for f in sorted(d.iterdir()):
            m = re.fullmatch(r'(\d{1,12})\.png', f.name, re.I)
            if not m:
                continue
            tabel = m.group(1)
            u = await user_get(tabel)
            if not u or u['sig']:
                continue
            if await db.one("SELECT 1 FROM settings WHERE key = %s", 'sigseed:' + f.name):
                continue
            b = f.read_bytes()
            if len(b) < 100 or len(b) > 2_000_000 or b[:4] != b'\x89PNG':
                continue
            import base64
            await db.run('UPDATE users SET sig = %s WHERE tabel = %s', enc('data:image/png;base64,' + base64.b64encode(b).decode()), tabel)
            await db.run("INSERT INTO settings (key, value) VALUES (%s, %s::json) ON CONFLICT (key) DO NOTHING", 'sigseed:' + f.name, dumps({'at': iso(dt.datetime.now(dt.timezone.utc))}))
            await audit(tabel, 'imzo yuklandi (egasi bergan fayl)', f.name)
            log.info('Tabel %s: imzo fayldan yuklandi', tabel)
    except Exception as e:  # noqa: BLE001
        log.warning('imzo_yuklash: %s', e)


# ------------------------------------------------------------------ zaxira nusxa (pg_dump)
def list_backups() -> list[dict]:
    d = settings.backup_dir
    if not d.exists():
        return []
    return sorted(({'f': f.name, 'size': f.stat().st_size} for f in d.glob('*.dump')), key=lambda x: x['f'], reverse=True)


BACKUP_ERR: dict = {'e': '', 'at': ''}  # oxirgi zaxira xatosi — panelda qizil koʻrinadi


def _now_local() -> dt.datetime:
    """Toshkent vaqti (K-36): zaxira fayl nomi va xato vaqti — UTC emas. tzdata boʻlmasa ham ishlaydi (+05:00, yozgi vaqt yoʻq)."""
    try:
        from zoneinfo import ZoneInfo
        import os
        return dt.datetime.now(ZoneInfo(os.environ.get('TZ') or 'Asia/Tashkent')).replace(tzinfo=None)
    except Exception:
        return dt.datetime.now(dt.timezone(dt.timedelta(hours=5))).replace(tzinfo=None)



async def backup_now(reason: str) -> str:
    d = settings.backup_dir
    d.mkdir(parents=True, exist_ok=True)
    name = _now_local().strftime('agmk_%Y-%m-%d_%H-%M-%S.dump')
    tmp = d / (name + '.tmp')
    p = await asyncio.create_subprocess_exec('pg_dump', '--format=custom', '--no-owner', '--file', str(tmp), '--dbname', settings.dsn,
                                             stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.PIPE)
    _, se = await p.communicate()
    if p.returncode:
        tmp.unlink(missing_ok=True)
        BACKUP_ERR.update(e='pg_dump: ' + se.decode(errors='replace').strip()[-300:], at=_now_local().strftime('%d.%m.%Y %H:%M'))
        raise RuntimeError(BACKUP_ERR['e'])
    tmp.replace(d / name)
    BACKUP_ERR.update(e='', at='')
    for x in list_backups()[settings.backup_keep:]:  # oxirgi N tasi saqlanadi
        (d / x['f']).unlink(missing_ok=True)
    log.info('Zaxira nusxa olindi (%s): %s', reason, name)
    return name


# ------------------------------------------------------------------ tabelni tuzatish
async def retabel_user(tabel: str, to: str) -> dict:
    """Eski (notoʻgʻri) tabel → shtat roʻyxatidagi tabel: hisob, imzo, hujjatlar va xabarlar koʻchadi.
    Parol tabel bilan birga xeshlangan — hisob «reset» holatiga oʻtadi: xodim yangi tabel bilan parol qoʻyadi, administrator tasdiqlaydi."""
    u = await user_get(tabel)
    if not u:
        return {'err': 'Foydalanuvchi topilmadi', 'code': 404}
    if not re.fullmatch(r'\d{1,12}', to) or to not in ROSTER:
        return {'err': 'Yangi tabel shtat roʻyxatida yoʻq', 'code': 400}
    if await user_get(to):
        return {'err': 'Bu tabel bilan hisob allaqachon bor', 'code': 409}
    R = ROSTER[to]
    try:
        async with db.conn() as c:
            async with c.transaction():
                await c.execute("UPDATE users SET tabel = %s, name = %s, lavozim = %s, status = 'reset' WHERE tabel = %s", (to, R['name'], R['lavozim'], tabel))
                await c.execute('UPDATE sign_acts SET tabel = %s WHERE tabel = %s', (to, tabel))
                await c.execute('UPDATE sign_seen SET tabel = %s WHERE tabel = %s', (to, tabel))
                for tb, col in (('kiy_issue', 'tabel'), ('kiy_issue', 'by_tabel'), ('my_rel', 'tabel'), ('my_rel', 'boss'), ('my_rel', 'by_tabel')):
                    await c.execute('UPDATE %s SET %s = %%s WHERE %s = %%s' % (tb, col, col), (to, tabel))
                for tb in ('kiy_person', 'hr_pd'):
                    await c.execute('UPDATE %s SET tabel = %%s WHERE tabel = %%s AND NOT EXISTS (SELECT 1 FROM %s WHERE tabel = %%s)' % (tb, tb), (to, tabel, to))
                await c.execute('UPDATE sign_docs SET created_by = %s WHERE created_by = %s', (to, tabel))
                for d in await (await c.execute('SELECT id, signers::text AS s FROM sign_docs')).fetchall():
                    S = json.loads(d['s'] or '[]')
                    if any(x.get('tabel') == tabel for x in S):
                        await c.execute('UPDATE sign_docs SET signers = %s::json WHERE id = %s', (dumps([dict(x, tabel=to) if x.get('tabel') == tabel else x for x in S]), d['id']))
                await c.execute('UPDATE messages SET to_tabel = %s WHERE to_tabel = %s', (to, tabel))
                await c.execute('UPDATE messages SET from_tabel = %s WHERE from_tabel = %s', (to, tabel))
                await c.execute('UPDATE files SET owner = %s WHERE owner = %s', (to, tabel))
                await c.execute('UPDATE files SET to_tabel = %s WHERE to_tabel = %s', (to, tabel))
                await c.execute('DELETE FROM refresh WHERE tabel = %s', (tabel,))
    except Exception as e:  # noqa: BLE001
        return {'err': 'Bajarilmadi: ' + str(e), 'code': 500}
    await audit(None, 'tabel oʻzgartirildi', '%s → %s (%s)' % (tabel, to, R['name']))
    log.info('Tabel %s → %s (%s). Xodim yangi tabel bilan «Roʻyxatdan oʻtish»ni bosib parol qoʻyadi — keyin panelda tasdiqlaysiz.', tabel, to, R['name'])
    return {'ok': True}


async def roster_suggest(u: dict) -> dict | None:
    """Roʻyxatda yoʻq tabel — familiyasi roʻyxatdagi (hali hisob ochmagan) bitta xodimga toʻgʻri kelsa."""
    k = surname_key(u['name'])
    if not k:
        return None
    have = {r['tabel'] for r in await db.all_('SELECT tabel FROM users')}
    L = [{'tabel': t, 'name': x['name'], 'lavozim': x['lavozim']} for t, x in ROSTER.items() if surname_key(x['name']) == k and t not in have]
    return L[0] if len(L) == 1 else None


USERS_SQL = ("SELECT tabel, name, lavozim, role, status, created_at, last_login, demo, must_change, (sig IS NOT NULL) AS has_sig FROM users "
             "ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, demo, created_at DESC")


# ------------------------------------------------------------------ bosh sahifa boʻlimlari (ilovadagi «🧩 Asosiy sahifa boʻlimlari» bilan bir xil kalit)
HOME_STAMP_LOCK = 7351002  # app.api.data.STAMP_LOCK bilan bir xil — yozuvlar vaqt belgisi ketma-ketligi


async def kv_value(key: str):
    x = await db.one('SELECT data::text AS d FROM records WHERE id = %s AND deleted = false', 'kv:' + key)
    try:
        d = json.loads(x['d']) if x else None
    except (TypeError, ValueError):
        d = None
    return d.get('v') if isinstance(d, dict) else None


async def home_state() -> dict:
    lst = await kv_value('agmk_home_list')
    rules = await kv_value('agmk_home_vis')
    return {'list': (lst or {}).get('l') or [] if isinstance(lst, dict) else [], 'rules': rules if isinstance(rules, dict) else {}}


async def home_set(tabel: str, show: dict) -> dict:
    """Xodim uchun boʻlimlar: {boʻlim_id: true/false}. Ilova faqat administrator (AGMK_ADMIN) yozgan qoidani qabul qiladi."""
    R = await kv_value('agmk_home_vis')
    R = R if isinstance(R, dict) else {}
    for k in ('all', 'role', 'user'):
        if not isinstance(R.get(k), dict):
            R[k] = {}
    R['user'][tabel] = {str(k)[:80]: bool(v) for k, v in list(show.items())[:100]}
    R['at'] = iso(dt.datetime.now(dt.timezone.utc))
    R['by'] = settings.admin_tabel
    data = dumps({'k': 'agmk_home_vis', 'v': R, 'by': settings.admin_tabel})
    async with db.conn() as c:
        async with c.transaction():
            await c.execute('SELECT pg_advisory_xact_lock(%s)', (HOME_STAMP_LOCK,))
            m = await (await c.execute('SELECT max(updated_at) AS m FROM records')).fetchone()
            st, _ = next_stamp(iso_to_micros(m['m']) if m and m['m'] else 0)
            await c.execute('INSERT INTO records (id, kind, data, deleted, updated_at, updated_by) VALUES (%s, %s, %s::json, false, %s, %s) '
                            'ON CONFLICT (id) DO UPDATE SET kind = excluded.kind, data = excluded.data, deleted = false, updated_at = excluded.updated_at, updated_by = excluded.updated_by',
                            ('kv:agmk_home_vis', 'kv', data, st, settings.admin_tabel))
            await c.execute('INSERT INTO history (id, kind, data, deleted, updated_at, updated_by) VALUES (%s, %s, %s::json, false, %s, %s)',
                            ('kv:agmk_home_vis', 'kv', data, st, settings.admin_tabel))
    return R


def _row(r: dict) -> dict:
    o = {}
    for k, v in r.items():
        o[k] = (1 if v else 0) if isinstance(v, bool) else iso(v) if isinstance(v, (dt.datetime, dt.date)) else v
    return o


async def admin_state() -> dict:
    ext = await ext_get()
    users = [_row(x) for x in await db.all_(USERS_SQL)]
    for x in users:
        x['in_roster'] = 1 if x['tabel'] in ROSTER else 0
        x['roster_name'] = ROSTER[x['tabel']]['name'] if x['tabel'] in ROSTER else ''
        x['suggest'] = await roster_suggest(x) if x['tabel'] not in ROSTER and not x['demo'] else None
    signs = []
    for d in (await docs_all())[:30]:
        v = await sd_view(d, False)
        signs.append({'id': v['id'], 'title': v['title'], 'status': v['status'], 'created_at': v['created_at'], 'created_by': v['created_by'], 'demo': v['demo'],
                      'signed': sum(1 for s in v['signers'] if s['state'] == 'sign'), 'n': len(v['signers']), 'rejected': sum(1 for s in v['signers'] if s['state'] == 'reject')})
    return {
        'version': VERSION, 'port': settings.public_port, 'fp': TLS.fp, 'ext': ext, 'ca': bool(TLS.ca_pem),
        'ips': [{'ip': h, 'name': 'server', 'text': connect_info(h, ext), 'svg': ''} for h in settings.public_hosts],
        'users': users,
        'roster': {'v': STATE['v'], 'n': len(ROSTER), 'reg': sum(1 for x in users if x['tabel'] in ROSTER and x['status'] == 'active')},
        'audit': [_row(x) for x in await db.all_('SELECT a.*, u.name FROM audit a LEFT JOIN users u ON u.tabel = a.tabel ORDER BY a.seq DESC LIMIT 40')],
        'signs': signs,
        'stats': await db.all_('SELECT kind, COUNT(*)::int AS n FROM records WHERE deleted = false GROUP BY kind ORDER BY kind'),
        'history': [_row(x) for x in await db.all_('SELECT h.seq, h.id, h.kind, h.deleted, h.updated_at, h.updated_by, u.name FROM history h LEFT JOIN users u ON u.tabel = h.updated_by ORDER BY h.seq DESC LIMIT 25')],
        'backups': list_backups()[:10],
        'backup_err': dict(BACKUP_ERR),
        'home': await home_state(),
    }


# ------------------------------------------------------------------ panel soʻrovlari
async def handle(req: Request) -> Response:
    host = req.headers.get('host', '')
    hostname = host.rsplit(':', 1)[0] if ':' in host and not host.endswith(']') else host
    if hostname not in settings.admin_hosts:
        return Response('403', status_code=403)
    p = req.url.path
    if req.method == 'GET' and p in ('/', '/index.html'):
        html = (STATIC / 'panel.html').read_text(encoding='utf8').replace('__ADMIN_TOKEN__', ADMIN_TOKEN)
        html = _names(html)  # demo hisoblardagi ismlar — obrazdagi NAMES.json dan (GitHub da yoʻq)
        return Response(html, media_type='text/html; charset=utf-8', headers={'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': CSP})
    if req.method == 'GET' and p == '/agmk-ca.bat' and TLS.ca_pem:  # 4.1: kompyuterga ichki CA ni oʻrnatish (bir marta)
        from app.api.router import ca_bat
        return Response(ca_bat(TLS.ca_pem), media_type='application/octet-stream', headers={'Content-Disposition': 'attachment; filename="AGMK-STTB_SERTIFIKAT_ORNATISH.bat"', 'Cache-Control': 'no-store'})
    if req.method == 'GET' and p == '/agmk-ca.crt' and TLS.ca_pem:
        return Response(TLS.ca_pem, media_type='application/x-x509-ca-cert', headers={'Content-Disposition': 'attachment; filename="AGMK-STTB-CA.crt"', 'Cache-Control': 'no-store'})
    if req.method == 'GET' and p == '/qrcode.js':
        return FileResponse(STATIC / 'qrcode.js', media_type='application/javascript', headers={'Cache-Control': 'no-store'})
    if not p.startswith('/admin/'):
        return Response(status_code=404)
    if req.headers.get('x-admin-token') != ADMIN_TOKEN:
        return err(403, 'Sahifani yangilang (F5)')
    if req.method == 'POST':
        asyncio.get_running_loop().call_later(0.05, lambda: asyncio.ensure_future(sig_seed()))  # yangi/tasdiqlangan hisob uchun egasining imzo fayli
    if p == '/admin/state' and req.method == 'GET':
        return send(200, await admin_state())
    if req.method != 'POST':
        return err(405, 'POST')
    b = body_obj(await read_body(req, 10_000))
    tabel = clean_tabel(b.get('tabel'))
    if p == '/admin/ext':  # tashqi manzil: «213.230.45.67» yoki «https://213.230.45.67:8443»; boʻsh — oʻchiriladi
        e = str(b.get('e') or '').strip()
        if e and not re.match(r'^https?://', e):
            e = 'https://' + e
        e = re.sub(r'/+$', '', re.sub(r'^http:', 'https:', e))
        if e and not re.search(r':\d+$', e):
            e += ':%d' % settings.public_port
        if e and not re.fullmatch(r'https://[A-Za-z0-9.-]+(:\d+)?', e):
            return err(400, 'Manzil notoʻgʻri')
        await db.run("INSERT INTO settings (key, value, at) VALUES ('ext', %s::json, now()) ON CONFLICT (key) DO UPDATE SET value = excluded.value, at = excluded.at", dumps({'e': e}))
        log.info('Tashqi manzil: %s', e) if e else log.info('Tashqi manzil oʻchirildi')
        return send(200, {'ok': True, 'e': e})
    if p == '/admin/user':
        u = await user_get(tabel)
        if not u:
            return err(404, 'Foydalanuvchi topilmadi')
        if b.get('action') == 'reset':  # 4.2: parolni tiklash — hisob oʻchirilmaydi (imzo, xabarlar, rol saqlanadi), xodim yangi parol qoʻyadi
            await db.run("UPDATE users SET status = 'reset' WHERE tabel = %s", tabel)
            await db.run('DELETE FROM refresh WHERE tabel = %s', tabel)
            await audit(None, 'panel: parol tiklandi', tabel)
            log.info('Panel: tabel %s paroli tiklandi — xodim ilovada «Roʻyxatdan oʻtish» orqali yangi parol qoʻyadi', tabel)
            return send(200, {'ok': True})
        if b.get('action') == 'delete':
            if await db.one('SELECT 1 FROM sign_acts WHERE tabel = %s LIMIT 1', tabel):  # 4.2: imzo — dalil, hisob oʻchirilmaydi
                return err(409, "Bu xodim hujjatlarni imzolagan — hisobni o'chirib bo'lmaydi (imzolar dalil sifatida saqlanadi). Uning o'rniga «Bloklangan» holatini tanlang.")
            await db.run('DELETE FROM users WHERE tabel = %s', tabel)
            await db.run('DELETE FROM refresh WHERE tabel = %s', tabel)
            await audit(None, "panel: hisob o'chirildi", tabel)
            log.info("Panel: tabel %s hisobi o'chirildi (qayta ro'yxatdan o'tishi mumkin)", tabel)
            return send(200, {'ok': True})
        role = b.get('role') if b.get('role') in ROLES else u['role']
        status = b.get('status') if b.get('status') in ('active', 'blocked', 'pending') else u['status']
        await db.run('UPDATE users SET role = %s, status = %s WHERE tabel = %s', role, status, tabel)
        if status != 'active':
            await db.run('DELETE FROM refresh WHERE tabel = %s', tabel)
        await audit(None, 'panel: rol/holat', '%s → %s, %s' % (tabel, role, status))
        log.info('Panel: tabel %s → %s, %s', tabel, ROLE_UZ.get(role), STATUS_UZ.get(status))
        if status == 'active' and not u['demo']:  # haqiqiy xodim tasdiqlanganda — shu familiyadagi DEMO hisob yopiladi
            k = surname_key(u['name'])
            if k:
                for dm in await db.all_('SELECT tabel, name FROM users WHERE demo = true'):
                    if surname_key(dm['name']) == k:
                        await db.run("UPDATE users SET role = 'viewer', status = 'blocked' WHERE tabel = %s", dm['tabel'])
                        await db.run('DELETE FROM refresh WHERE tabel = %s', dm['tabel'])
                        log.info('Panel: haqiqiy %s tasdiqlandi — demo hisob (tabel %s) yopildi', u['name'], dm['tabel'])
        return send(200, {'ok': True})
    if p == '/admin/home':  # xodim koʻradigan bosh sahifa boʻlimlari
        if not tabel or not isinstance(b.get('show'), dict):
            return err(400, 'Tabel va boʻlimlar kerak')
        await home_set(tabel, b['show'])
        hidden = [k for k, v in b['show'].items() if not v]
        await audit(None, 'panel: boʻlimlar', '%s → yopiq: %s' % (tabel, ', '.join(hidden)[:300] or 'yoʻq'))
        log.info('Panel: tabel %s — yopiq boʻlimlar: %d ta', tabel, len(hidden))
        return send(200, {'ok': True})
    if p == '/admin/create':  # hisob yaratish (demo yoki oddiy)
        t, name, pw = clean_tabel(b.get('tabel')), clip(b.get('name'), 120), str(b.get('password') or '')
        if not re.fullmatch(r'\d{1,12}', t):
            return err(400, "Tabel raqami noto'g'ri")
        if not name:
            return err(400, 'F.I.O. kiriting')
        if len(pw) < 6:
            return err(400, "Parol kamida 6 belgi bo'lsin")
        if await user_get(t):
            return err(409, 'Bu tabel raqami band')
        role = b.get('role') if b.get('role') in ROLES else 'editor'
        salt = new_salt()
        await db.run("INSERT INTO users (tabel, name, lavozim, salt, hash, role, status, created_at, device, demo, must_change) VALUES (%s, %s, %s, %s, %s, %s, 'active', now(), 'panel', %s, %s)",
                     t, name, clip(b.get('lavozim'), 160), salt, await asyncio.to_thread(hash_pw, derive_pw(t, pw), salt), role, bool(b.get('demo')), bool(b.get('must_change')))
        await audit(None, 'panel: hisob yaratildi', t + ' ' + name + (' (DEMO)' if b.get('demo') else ''))
        log.info('Panel: hisob yaratildi — tabel %s (%s)%s', t, name, ' [DEMO]' if b.get('demo') else '')
        return send(200, {'ok': True})
    if p == '/admin/demo-delete':
        L = await db.all_('SELECT tabel, name FROM users WHERE demo = true')
        for dm in L:
            await db.run('DELETE FROM sign_acts WHERE tabel = %s', dm['tabel'])
            await db.run('DELETE FROM sign_seen WHERE tabel = %s', dm['tabel'])
            for tb in ('kiy_issue', 'kiy_person', 'hr_pd'):
                await db.run('DELETE FROM %s WHERE tabel = %%s' % tb, dm['tabel'])
            await db.run('DELETE FROM my_rel WHERE tabel = %s OR boss = %s', dm['tabel'], dm['tabel'])
            await db.run('DELETE FROM refresh WHERE tabel = %s', dm['tabel'])
            await db.run('DELETE FROM users WHERE tabel = %s', dm['tabel'])
        await db.run('DELETE FROM sign_docs WHERE demo = true')
        await db.run('DELETE FROM sign_acts WHERE doc_id NOT IN (SELECT id FROM sign_docs)')
        await db.run('DELETE FROM sign_seen WHERE doc_id NOT IN (SELECT id FROM sign_docs)')
        await audit(None, "panel: demo hisoblar o'chirildi", '%d ta' % len(L))
        log.info("Panel: %d ta demo hisob va demo hujjatlar o'chirildi", len(L))
        return send(200, {'ok': True, 'n': len(L)})
    if p == '/admin/roster-approve':  # shtat roʻyxatidagi, tasdiq kutayotgan hammasi — «Tahrirlovchi» sifatida
        n = 0
        for x in await db.all_(USERS_SQL):
            if x['status'] == 'pending' and x['tabel'] in ROSTER:
                await db.run("UPDATE users SET role = %s, status = 'active' WHERE tabel = %s", 'admin' if x['role'] == 'admin' else 'editor', x['tabel'])
                n += 1
        await audit(None, 'panel: shtat roʻyxatidagilar tasdiqlandi', '%d ta' % n)
        log.info('Panel: shtat roʻyxatidagi %d ta hisob tasdiqlandi', n)
        return send(200, {'ok': True, 'n': n})
    if p == '/admin/roster-reload':
        await roster_load()
        log.info("Panel: xodimlar.json qayta o'qildi (%d ta xodim)", len(ROSTER))
        return send(200, {'ok': True, 'n': len(ROSTER)})
    if p == '/admin/retabel':
        r = await retabel_user(tabel, clean_tabel(b.get('to')))
        if r.get('err'):
            return err(r['code'], r['err'])
        return send(200, {'ok': True})
    if p == '/admin/backup':
        return send(200, {'ok': True, 'name': await backup_now("qo'lda")})
    if p == '/admin/open-backups':  # serverda papka ochilmaydi (eski panel bilan moslik uchun)
        return send(200, {'ok': True})
    return err(404, 'Topilmadi')


async def app(scope, receive, send_):
    if scope['type'] != 'http':
        return
    req = Request(scope, receive)
    try:
        resp = await handle(req)
    except (TooBig, BadJson) as e:
        resp = err(500, 'Server xatosi: ' + str(e))
    except Exception as e:  # noqa: BLE001
        log.exception('XATO (panel): %s', req.url.path)
        resp = err(500, 'Server xatosi: ' + str(e))
    await resp(scope, receive, send_)


def _names(html: str) -> str:
    """@@N:raqam@@ → xodim ismi (ilova bilan birga yigʻilgan NAMES.json; boʻlmasa «F.I.Sh.»)."""
    import json, os, re
    p = os.path.join(os.path.dirname(os.environ.get('AGMK_APP_HTML', '/app/ilova/index.html')), 'NAMES.json')
    try:
        names = json.loads(open(p, encoding='utf8').read())
    except Exception:  # noqa: BLE001
        names = {}
    return re.sub(r'@@N:(\d+)@@', lambda m: names.get(m.group(1)) or 'F.I.Sh.', html)
