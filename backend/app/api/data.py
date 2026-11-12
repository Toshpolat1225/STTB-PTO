"""Yozuvlarni sinxronlash, xabarlar, fayllar, paketlar va ilova xatolari jurnali."""
from __future__ import annotations

import json
import logging
import re
import secrets

from starlette.requests import Request
from starlette.responses import FileResponse, Response

from app.core import database as db
from app.core.permissions import ADMIN_IDS, ADMIN_KINDS, BUX_IDS, BUX_ROLES, PAY_ROLES, PD_ROLES, can_role, kv_acl, kv_owner, mod_acl, pd_only, pd_strip
from app.core.config import settings
from app.core.audit import audit, user_get
from app.core.security import dec_buf, enc_buf, fail_add, fail_locked
from app.core.utils import clean_tabel, clip, iso, iso_to_micros, next_stamp
from app.core.http_utils import BadJson, TooBig, body_obj, dumps, err, js_norm, read_body, read_raw, send

log = logging.getLogger('agmk')
FILE_GROUPS = {'*mttb', '*zam'}  # boʻlim fayllari — tizimga kirgan faol xodimlar oʻqiydi
NOSOZ_SEEN: set[str] = set()
STAMP_LOCK = 7351002  # yozuvlar vaqt belgisi ketma-ketligi uchun (pg_advisory_xact_lock)
FB_ROLES = ['rahbar']  # 6.1: shikoyat va takliflar (yozuv turi «fb») — oʻqiydi: admin, rahbar va yuboruvchining oʻzi


def _fb_owner(data) -> str:
    try:
        return clean_tabel(str(((data or {}).get('by') or {}).get('tabel') or ''))
    except Exception:  # noqa: BLE001
        return ''


# ------------------------------------------------------------------ yozuvlar (sinxronlash)
def _no_at(d):
    """kv mazmuni vaqt belgisisiz: {'k', 'v': {..., 'at'}, 'at'} → «at» olib tashlanadi."""
    if not isinstance(d, dict):
        return d
    d = {k: v for k, v in d.items() if k != 'at'}
    if isinstance(d.get('v'), dict):
        d['v'] = {k: v for k, v in d['v'].items() if k != 'at'}
    return d


async def records_get(req: Request, u: dict) -> Response:
    gtv = re.sub(r'^gt\.', '', req.query_params.get('updated_at') or 'gt.1970-01-01T00:00:00Z')
    try:
        lim = min(1000, max(1, int(float(req.query_params.get('limit') or 500))))
    except ValueError:
        lim = 500
    bux = await can_role(u, BUX_ROLES)  # noqa: F841 — eski serverdagi kabi hisoblanadi
    pd = await can_role(u, PD_ROLES)
    rows = await db.all_('SELECT id, kind, data::text AS data, deleted, updated_at, updated_by FROM records WHERE updated_at > %s ORDER BY updated_at ASC LIMIT %s', gtv, lim)
    acl_cache: dict[tuple, bool] = {}

    async def allowed(roles: list[str]) -> bool:
        k = tuple(roles)
        if k not in acl_cache:
            acl_cache[k] = await can_role(u, roles)
        return acl_cache[k]

    out = []
    for r in rows:
        head = {'id': r['id'], 'kind': r['kind']}
        data_raw = r['data']
        extra: dict = {}
        deleted = bool(r['deleted'])
        hidden = (r['id'] == 'kv:agmk_audit_v1' and u['role'] != 'admin') \
            or (r['kind'] == 'fb' and u['role'] != 'admin' and not await allowed(FB_ROLES)
                and _fb_owner(json.loads(data_raw) if data_raw and data_raw != 'null' else None) != clean_tabel(u['tabel'])) \
            or (kv_acl(r['id']) and not await allowed(kv_acl(r['id']))) \
            or (r['kind'] == 'mod' and mod_acl(r['id']) and not await allowed(mod_acl(r['id']))) \
            or (kv_owner(r['id']) is not None and kv_owner(r['id']) != clean_tabel(u['tabel']))
        if hidden:  # vakolati yoʻq — mazmuni yuborilmaydi (tartib raqami saqlanadi)
            data_raw, deleted, extra = 'null', True, {'hidden': 1}
        elif r['kind'] == 'xodim' and not pd and r['id'] != 'x:' + u['tabel']:
            d = json.loads(data_raw)
            if d:  # boshqalarning shaxsiy maʼlumotlari yuborilmaydi
                data_raw, extra = dumps(pd_strip(d) if isinstance(d, dict) else d), {'pd': 0}
        out.append('{"id":%s,"kind":%s,"data":%s,"deleted":%s,"updated_at":%s,"updated_by":%s%s}' % (
            dumps(head['id']), dumps(head['kind']), data_raw, 'true' if deleted else 'false', dumps(r['updated_at']), dumps(r['updated_by']),
            ''.join(',%s:%s' % (dumps(k), dumps(v)) for k, v in extra.items())))
    return send(200, raw='[' + ','.join(out) + ']')


async def records_post(req: Request, u: dict) -> Response:
    try:
        body = js_norm(await read_body(req, 50_000_000))
    except TooBig:
        return err(413, "Ma'lumot juda katta")
    except BadJson:
        return err(413, "Ma'lumot juda katta")  # eski server: oʻqishdagi har qanday xato — 413
    lst = body if isinstance(body, list) else [body]
    # 6.1: shikoyat/taklif («fb») — har bir xodim (koʻruvchi ham) faqat oʻz xabarini yozadi; boshqalarnikini — admin va rahbar
    if u['role'] == 'viewer' and not (lst and all(isinstance(r, dict) and r.get('kind') == 'fb' for r in lst)):
        return err(403, "Sizda faqat ko'rish huquqi bor")
    if len(lst) > 1000:
        return err(413, "Bir so'rovda 1000 tadan ko'p yozuv")
    for r in lst:
        if not isinstance(r, dict) or not isinstance(r.get('id'), str) or len(r['id']) > 200 or not re.fullmatch(r'[a-z]{1,20}', str(r.get('kind') if r.get('kind') is not None else '')):
            return err(400, "Yozuv noto'g'ri")
        if 'data' not in r:
            return err(400, "Yozuvda ma'lumot yo'q")
        rid = str(r['id'])
        if (r['kind'] in ADMIN_KINDS or rid in ADMIN_IDS) and u['role'] != 'admin' and not (rid == 'kv:agmk_map_georef' and await can_role(u, ['xarita'])):
            return err(403, "Bu sozlamani faqat administrator o'zgartiradi")
        if rid in BUX_IDS and not await can_role(u, BUX_ROLES):
            return err(403, 'Buxgalteriya maʼlumotini faqat buxgalteriya va rahbariyat oʻzgartiradi')
    denied = []
    fb_boss = u['role'] == 'admin' or await can_role(u, FB_ROLES)
    me = clean_tabel(u['tabel'])
    for r in lst:  # huquqsiz modul yozuvi — tashlab yuboriladi, qolganlari saqlanadi
        if (r['kind'] == 'mod' and mod_acl(r['id']) and not await can_role(u, mod_acl(r['id']))) or (kv_acl(r['id']) and not await can_role(u, kv_acl(r['id']))) \
                or (kv_owner(r['id']) is not None and kv_owner(r['id']) != me):
            denied.append(r)
        elif r['kind'] == 'fb' and not fb_boss:
            old = await db.one('SELECT data::text AS d FROM records WHERE id = %s', str(r['id']))
            if _fb_owner(r.get('data')) != me or (old and _fb_owner(json.loads(old['d'])) not in ('', me)):
                denied.append(r)
    if denied:
        await audit(u['tabel'], 'modul yozuvi: huquq yoʻq', ', '.join(r['id'] for r in denied[:5]), req)
        lst = [r for r in lst if not any(r is d for d in denied)]
    pd_ok = await can_role(u, PD_ROLES)
    async with db.conn() as c:
        async with c.transaction():
            await c.execute('SELECT pg_advisory_xact_lock(%s)', (STAMP_LOCK,))
            for r in lst:  # xodim kartasi: shaxsiy maʼlumotni faqat egasi va vakolatli rollar oʻzgartiradi; yuborilmagan maydon oʻchib ketmaydi
                if r['kind'] != 'xodim' or not r.get('data') or not isinstance(r['data'], dict):
                    continue
                old: dict = {}
                try:
                    x = await (await c.execute('SELECT data::text AS d FROM records WHERE id = %s', (r['id'],))).fetchone()
                    if x:
                        old = json.loads(x['d']) or {}
                        if not isinstance(old, dict):
                            old = {}
                except Exception:  # noqa: BLE001
                    old = {}
                r['data'] = {**pd_only(old), **r['data']} if (pd_ok or r['id'] == 'x:' + u['tabel']) else {**pd_strip(r['data']), **pd_only(old)}
            # 4.2: kv yozuvi faqat vaqt belgisi («at») bilan farq qilsa — qayta saqlanmaydi (history keraksiz nusxalar bilan toʻlmasin;
            # masalan, bosh sahifa boʻlimlari roʻyxati har 20 soniyada bir xil mazmun bilan kelardi)
            same = []
            for r in lst:
                if r['kind'] != 'kv':
                    continue
                x = await (await c.execute('SELECT data::text AS d, deleted, kind FROM records WHERE id = %s', (r['id'],))).fetchone()
                if x and x['kind'] == 'kv' and bool(x['deleted']) == bool(r.get('deleted')):
                    try:
                        if _no_at(json.loads(x['d'])) == _no_at(r.get('data')):
                            same.append(r)
                    except Exception:  # noqa: BLE001
                        pass
            if same:
                lst = [r for r in lst if not any(r is z for z in same)]
            m = await (await c.execute('SELECT max(updated_at) AS m FROM records')).fetchone()
            last = iso_to_micros(m['m']) if m and m['m'] else 0
            for r in lst:
                st, last = next_stamp(last)
                data = dumps(r['data'])
                dl = bool(r.get('deleted'))
                await c.execute('INSERT INTO records (id, kind, data, deleted, updated_at, updated_by) VALUES (%s, %s, %s::json, %s, %s, %s) '
                                'ON CONFLICT (id) DO UPDATE SET kind = excluded.kind, data = excluded.data, deleted = excluded.deleted, updated_at = excluded.updated_at, updated_by = excluded.updated_by',
                                (r['id'], r['kind'], data, dl, st, u['tabel']))
                await c.execute('INSERT INTO history (id, kind, data, deleted, updated_at, updated_by) VALUES (%s, %s, %s::json, %s, %s, %s)',
                                (r['id'], r['kind'], data, dl, st, u['tabel']))
    for r in lst:
        if re.match(r'^m:nosoz:', r['id']) and isinstance(r.get('data'), dict) and r['data'] and not r.get('deleted') and r['id'] not in NOSOZ_SEEN:
            NOSOZ_SEEN.add(r['id'])
            d = r['data']
            await audit(u['tabel'], '🆘 nosozlik', clip({'y': 'yengil', 'o': 'oʻrta', 'j': 'JIDDIY'}.get(d.get('lvl'), '?'), 10) + ' · ' + clip(d.get('unitName'), 80) + ' · ' + clip(d.get('izoh'), 160), req)
    if lst:
        log.info('Tabel %s: %d ta yozuv saqlandi%s', u['tabel'], len(lst), " (o'chirishlar bilan)" if any(r.get('deleted') for r in lst) else '')
    return send(201)


# ------------------------------------------------------------------ xabarlar
async def messages_get(req: Request, u: dict) -> Response:
    try:
        after = int(float(re.sub(r'^gt\.', '', req.query_params.get('id') or 'gt.0') or 0))
    except ValueError:
        after = 0
    try:
        lim = min(500, int(float(req.query_params.get('limit') or 200)))
    except ValueError:
        lim = 200
    rows = await db.all_('SELECT * FROM messages WHERE to_tabel = %s AND id > %s ORDER BY id ASC LIMIT %s', u['tabel'], after, lim)
    return send(200, [{'id': m['id'], 'from_tabel': m['from_tabel'], 'from_name': m['from_name'], 'to_tabel': m['to_tabel'], 'text': m['text'],
                       'created_at': iso(m['created_at']), 'files': m['files'] or []} for m in rows])


async def messages_post(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 100_000))
    to = clean_tabel(b.get('to_tabel'))
    text = clip(b.get('text'), 5000)
    F = []
    for fid in (b.get('files') if isinstance(b.get('files'), list) else [])[:20]:
        f = await db.one('SELECT id, owner, to_tabel, name, mime, size FROM files WHERE id = %s', str(fid))
        if f and f['owner'] == u['tabel'] and f['to_tabel'] == to:
            F.append({'id': f['id'], 'name': f['name'], 'mime': f['mime'], 'size': f['size']})
    if not to or (not text and not F):
        return err(400, "Xabar noto'g'ri")
    if not await user_get(to):
        return err(400, "Qabul qiluvchi serverda ro'yxatdan o'tmagan")
    await db.run('INSERT INTO messages (from_tabel, from_name, to_tabel, text, created_at, files) VALUES (%s, %s, %s, %s, now(), %s::json)',
                 u['tabel'], u.get('name') or clip(b.get('from_name'), 120), to, text or '', dumps(F) if F else None)
    await audit(u['tabel'], 'xabar yubordi', to + (' · %d fayl' % len(F) if F else ''), req)
    return send(201)


# ------------------------------------------------------------------ fayllar (shifrlangan)
async def files_post(req: Request, u: dict) -> Response:
    q = req.query_params
    to = clean_tabel(q.get('to'))
    name = clip(q.get('name') or 'fayl', 200)
    mime = clip(q.get('mime') or 'application/octet-stream', 120)
    if not to or (to not in FILE_GROUPS and not await user_get(to)):
        return err(400, 'Qabul qiluvchi topilmadi')
    try:
        buf = await read_raw(req, 30_000_000)
    except TooBig:
        return err(413, 'Fayl juda katta (30 MB gacha)')
    if not buf:
        return err(400, "Fayl bo'sh")
    fid = 'f' + secrets.token_hex(12)
    await db.run('INSERT INTO files (id, owner, to_tabel, name, mime, size, data, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, now())',
                 fid, u['tabel'], to, name, mime, len(buf), enc_buf(buf))
    return send(201, {'id': fid, 'name': name, 'mime': mime, 'size': len(buf)})


async def files_get(req: Request, u: dict, fid: str) -> Response:
    f = await db.one('SELECT * FROM files WHERE id = %s', fid)
    if not f or (f['owner'] != u['tabel'] and f['to_tabel'] != u['tabel'] and f['to_tabel'] not in FILE_GROUPS):
        return err(404, 'Topilmadi')
    data = dec_buf(f['data'])
    return Response(data, status_code=200, headers={'Content-Type': f['mime'] or 'application/octet-stream', 'Cache-Control': 'no-store'})


# ------------------------------------------------------------------ paketlar (maxfiy; APK ichida emas)
async def pack_sxema(req: Request, u: dict) -> Response:
    f = settings.paket_dir / 'temir_yol_sxemasi.agmkpack'
    if not f.exists():
        return err(404, "Serverda sxema paketi yo'q (paketlar papkasiga qo'ying)")
    await audit(u['tabel'], "temir yo'l sxemasini yuklab oldi", '', req)
    log.info("Tabel %s: temir yo'l sxemasini yuklab oldi", u['tabel'])
    return FileResponse(f, media_type='application/octet-stream', headers={'Cache-Control': 'no-store'})


SEEDS = {'mbs': ('mb_seed_2026.json', ['mm', 'kadr', 'rahbar'], 'bilimlar sinovi jadvali'), 'nartar': ('nar_tarif.json', PAY_ROLES, 'tarif stavkalari')}


async def seed(req: Request, u: dict, name: str) -> Response:
    S = SEEDS.get(name)
    if not S:
        return err(404, 'Topilmadi')
    if not await can_role(u, S[1]):
        await audit(u['tabel'], S[2] + ': ruxsat yoʻq', '', req)
        return err(403, 'Bu maʼlumot faqat vakolatli xodimlarga')
    f = settings.paket_dir / S[0]
    if not f.exists():
        return err(404, "Serverda bu paket yo'q (paketlar papkasi)")
    await audit(u['tabel'], S[2] + 'ni oldi', '', req)
    try:
        return send(200, raw=dumps(json.loads(f.read_text(encoding='utf8'))))
    except Exception:  # noqa: BLE001
        return err(500, 'Paket buzilgan')


# ------------------------------------------------------------------ ilova xatolari jurnali
async def app_log(req: Request, u: dict) -> Response:
    if fail_locked('log:' + u['tabel']):
        return err(429, 'Keyinroq')
    b = body_obj(await read_body(req, 64_000))
    L = (b.get('list') if isinstance(b.get('list'), list) else [])[:20]
    for x in L:
        x = x if isinstance(x, dict) else {}
        try:
            n = int(float(x.get('n'))) if x.get('n') else 1
        except (TypeError, ValueError):
            n = 1
        await audit(u['tabel'], 'ilova xatosi', 'v%s · %s · ×%s · %s' % (clip(x.get('v'), 12), clip(x.get('scr'), 40), n or 1, clip(x.get('m'), 300)), req)
    for _ in range(min(len(L), 4)):
        fail_add('log:' + u['tabel'])  # bir telefondan xato oqimi jurnalni toʻldirmaydi
    return send(200, {'ok': True, 'n': len(L)})
