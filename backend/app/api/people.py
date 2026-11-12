"""Shtat roʻyxati, oklad, shaxsiy imzo va imzo kodi, administrator bergan parol, vaqtincha tayinlash."""
from __future__ import annotations

import asyncio
import logging
import re

from starlette.requests import Request
from starlette.responses import Response

from app.core import database as db
from app.core.permissions import app_roles, can_role
from app.core.audit import audit, pin_rec, pin_set, user_get
from app.services.roster import ROSTER, STATE, roster_roles
from app.core.security import dec, enc, fail_add, fail_clear, fail_locked, hash_pw, new_salt, pw_ok
from app.core.utils import clean_tabel, today_local
from app.core.http_utils import body_obj, err, read_body, send

log = logging.getLogger('agmk')


def _js_num(v):
    """JavaScript +v (son yoki NaN → None)."""
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (int, float)):
        return v
    try:
        s = str(v).strip()
        return 0 if s == '' else float(s)
    except (TypeError, ValueError):
        return None


def _round(v):
    import math
    return None if v is None else int(math.floor(v + 0.5))


async def oklad_put(req: Request, u: dict) -> Response:
    """Oklad / razryad oʻzgartirish — faqat administrator va iqtisodchi (ilovadagi «iqt» roli)."""
    if u['role'] != 'admin' and 'iqt' not in await app_roles(u['tabel']):
        return send(403, {'error': 'Oklad oʻzgartirishga huquqingiz yoʻq'})
    b = body_obj(await read_body(req, 10_000))
    t = clean_tabel(b.get('tabel'))
    R = ROSTER.get(t) if t else None
    if not R:
        return send(404, {'error': 'Tabel shtat roʻyxatida (xodimlar.json) yoʻq'})
    ok_v = b.get('oklad', ...)  # ... — kalit yoʻq (JS: undefined → NaN → xato)
    ok = None if ok_v is None or ok_v == '' or ok_v == 0 else 'nan' if ok_v is ... or _js_num(ok_v) is None else _round(_js_num(ok_v))
    rz_v = b.get('razryad')
    rz = R['razryad'] if (rz_v is None or rz_v == '') else (_round(_js_num(rz_v)) if _js_num(rz_v) is not None else 'nan')
    if ok is not None and not (isinstance(ok, int) and 1000 <= ok <= 1e9):
        return send(400, {'error': 'Oklad notoʻgʻri'})
    if rz is not None and not (isinstance(rz, int) and 0 <= rz <= 30):
        return send(400, {'error': 'Razryad notoʻgʻri'})
    await db.run('INSERT INTO oklad (tabel, oklad, razryad, at, by_tabel) VALUES (%s, %s, %s, now(), %s) '
                 'ON CONFLICT (tabel) DO UPDATE SET oklad = excluded.oklad, razryad = excluded.razryad, at = excluded.at, by_tabel = excluded.by_tabel',
                 t, ok, rz, u['tabel'])
    R['oklad'] = ok
    R['razryad'] = rz
    await audit(u['tabel'], 'oklad oʻzgartirildi', 'tabel ' + t, req)
    return send(200, {'ok': True, 'tabel': t, 'oklad': ok, 'razryad': rz})


async def oklad_get(req: Request, u: dict) -> Response:
    """Maosh — faqat administrator va «okl» roli; oddiy xodim faqat oʻzinikini oladi."""
    roles = (await app_roles(u['tabel'])) + roster_roles(u['tabel'])
    if u['role'] != 'admin' and 'okl' not in roles:
        x = ROSTER.get(u['tabel'])
        return send(200, {'v': STATE['v'], 'own': True, 'list': [{'tabel': u['tabel'], 'razryad': x['razryad'], 'oklad': x['oklad']}] if x else []})
    await audit(u['tabel'], 'oklad roʻyxatini oldi', '%d ta' % len(ROSTER), req)
    return send(200, {'v': STATE['v'], 'list': [{'tabel': t, 'razryad': x['razryad'], 'oklad': x['oklad']} for t, x in ROSTER.items()]})


async def roster_list(req: Request, u: dict) -> Response:
    reg = {r['tabel']: r['status'] for r in await db.all_('SELECT tabel, status FROM users')}
    return send(200, {'v': STATE['v'], 'n': len(ROSTER), 'list': [{'tabel': t, 'name': x['name'], 'lavozim': x['lavozim'], 'status': reg.get(t, '')} for t, x in ROSTER.items()]})


async def users_active(req: Request, u: dict) -> Response:
    rows = await db.all_("SELECT tabel, name, lavozim, role, demo, (sig IS NOT NULL) AS has_sig FROM users WHERE status = 'active' ORDER BY name")
    return send(200, [{'tabel': x['tabel'], 'name': x['name'], 'lavozim': x['lavozim'], 'role': x['role'], 'demo': bool(x['demo']), 'has_sig': bool(x['has_sig'])} for x in rows])


# ---- shaxsiy imzo (faqat egasi oʻqiydi/yozadi)
async def sig_get(req: Request, u: dict) -> Response:
    return send(200, {'png': dec((await user_get(u['tabel']))['sig'])})


async def sig_put(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 3_000_000))
    png = str(b.get('png') or '')
    if png and not re.fullmatch(r'data:image/(png|jpeg);base64,[A-Za-z0-9+/=]+', png):
        return err(400, "Imzo rasmi noto'g'ri")
    await db.run('UPDATE users SET sig = %s WHERE tabel = %s', enc(png) if png else None, u['tabel'])
    await audit(u['tabel'], 'imzo saqlandi' if png else "imzo o'chirildi", '', req)
    log.info('Tabel %s: %s', u['tabel'], 'imzosini saqladi' if png else "imzosini o'chirdi")
    return send(200, {'ok': True})


async def pin_get(req: Request, u: dict) -> Response:
    return send(200, {'set': bool((await user_get(u['tabel']))['sigpin'])})


async def pin_put(req: Request, u: dict) -> Response:
    """Imzo kodi (4 xonali; ilova xeshlab yuboradi). Almashtirish — eski kod yoki kirish paroli bilan."""
    b = body_obj(await read_body(req, 4_000))
    pin = str(b.get('pin') or '')
    if not re.fullmatch(r'[a-f0-9]{40}', pin):
        return err(400, 'Kod notoʻgʻri koʻrinishda')
    wait = fail_locked('pin:' + u['tabel'])
    if wait:
        return err(429, f'Juda koʻp xato. {wait} soniyadan keyin urinib koʻring')
    cur = await pin_rec(u['tabel'])
    full = await user_get(u['tabel'])
    if cur:
        old_ok = bool(b.get('old')) and await asyncio.to_thread(pw_ok, str(b.get('old')), cur['s'], cur['h'])
        pw_good = bool(b.get('pw')) and await asyncio.to_thread(pw_ok, str(b.get('pw')), full['salt'], full['hash'])
        if not old_ok and not pw_good:
            fail_add('pin:' + u['tabel'])
            await audit(u['tabel'], 'imzo kodi: tasdiq notoʻgʻri', '', req)
            return err(403, 'Eski kod yoki kirish paroli notoʻgʻri')
    await pin_set(u['tabel'], pin)
    fail_clear('pin:' + u['tabel'])
    await audit(u['tabel'], 'imzo kodi almashtirildi' if cur else 'imzo kodi oʻrnatildi', '', req)
    return send(200, {'ok': True})


async def adm_pw(req: Request, u: dict) -> Response:
    """Administrator xodimga yangi kirish paroli beradi (eskisi darhol ishlamay qoladi)."""
    if u['role'] != 'admin':
        return err(403, 'Faqat administrator')
    b = body_obj(await read_body(req, 4_000))
    t = clean_tabel(b.get('tabel'))
    pw = str(b.get('password') or '')
    try:
        i = max(0, min(9, int(float(b.get('i') or 0))))
    except (TypeError, ValueError):
        i = 0
    if not re.fullmatch(r'\d{1,12}', t) or not re.fullmatch(r'[a-f0-9]{40}', pw):
        return err(400, 'Maʼlumot notoʻgʻri')
    salt = new_salt()
    h = await asyncio.to_thread(hash_pw, pw, salt)
    if i > 0:
        await db.run("INSERT INTO kir_alt (tabel, i, name, salt, hash) VALUES (%s, %s, '', %s, %s) ON CONFLICT (tabel, i) DO UPDATE SET salt = excluded.salt, hash = excluded.hash", t, i, salt, h)
    else:
        x = await user_get(t)
        R = ROSTER.get(t)
        if not x:
            await db.run("INSERT INTO users (tabel, name, lavozim, salt, hash, role, status, created_at, device) VALUES (%s, %s, %s, %s, %s, 'editor', 'active', now(), 'administrator')",
                         t, R['name'] if R else 'Tabel ' + t, R['lavozim'] if R else '', salt, h)
        else:
            await db.run('UPDATE users SET salt = %s, hash = %s, must_change = false WHERE tabel = %s', salt, h, t)
            if x['status'] not in ('active', 'blocked'):
                await db.run("UPDATE users SET status = 'active' WHERE tabel = %s", t)
    fail_clear(t)
    await audit(u['tabel'], 'yangi kirish paroli berdi', t + ('#%d' % i if i else ''), req)
    log.info('Administrator tabel %s ga yangi parol berdi', t)
    return send(200, {'ok': True})


# ---- vaqtincha tayinlash
async def vt_list(req: Request, u: dict) -> Response:
    t = today_local()
    rows = await db.all_('SELECT doc_id, a, b, dfrom, dto, why, cancelled FROM vt_act WHERE done_at IS NOT NULL AND dto >= %s', t)
    from app.core.utils import iso
    return send(200, [{'id': x['doc_id'], 'a': x['a'], 'b': x['b'], 'from': iso(x['dfrom']), 'to': iso(x['dto']), 'why': x['why'], 'cancelled': iso(x['cancelled']) or None} for x in rows])


async def vt_cancel(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 4_000))
    x = await db.one('SELECT * FROM vt_act WHERE doc_id = %s', str(b.get('id') or ''))
    if not x:
        return err(404, 'Topilmadi')
    if u['role'] != 'admin' and x['created_by'] != u['tabel'] and not await can_role(u, ['kadr']):
        return err(403, 'Faqat xatni tuzgan xodim, kadrlar yoki administrator')
    await db.run('UPDATE vt_act SET cancelled = now() WHERE doc_id = %s', x['doc_id'])
    await audit(u['tabel'], 'vaqtincha tayinlash bekor qilindi', x['b'] + ' ← ' + x['a'], req)
    return send(200, {'ok': True})
