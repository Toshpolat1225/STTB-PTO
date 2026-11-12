"""Kirish, roʻyxatdan oʻtish, parol almashtirish."""
from __future__ import annotations

import asyncio
import logging
import time

from starlette.requests import Request
from starlette.responses import Response

from app.core import database as db
from app.core.audit import EMAIL_RE, audit, issue_session, user_get, user_meta
from app.services.roster import ROSTER
from app.core.security import fail_add, fail_clear, fail_locked, hash_pw, new_salt, pw_ok
from app.core.utils import clip, js_str
from app.core.http_utils import body_obj, err, read_body, send, ua

log = logging.getLogger('agmk')


async def _pw_ok(pw, salt, h) -> bool:
    return await asyncio.to_thread(pw_ok, pw, salt, h)


async def token(req: Request) -> Response:
    body = body_obj(await read_body(req, 10_000))
    gt = req.query_params.get('grant_type')
    if gt == 'refresh_token':
        r = await db.one('SELECT * FROM refresh WHERE token = %s', str(body.get('refresh_token') or ''))
        if not r or r['expires'] < time.time() * 1000:
            return err(400, 'Sessiya tugagan — qayta kiring', {'error': 'invalid_grant'})
        await db.run('DELETE FROM refresh WHERE token = %s', r['token'])
        u = await user_get(r['tabel'])
        if not u or u['status'] != 'active':
            return err(400, 'Hisob faol emas', {'error': 'invalid_grant'})
        return send(200, await issue_session(u))
    if gt != 'password':
        return err(400, 'grant_type')
    m = EMAIL_RE.match(str(body.get('email') or ''))
    if not m:
        return err(400, "Tabel raqami noto'g'ri", {'error': 'invalid_grant'})
    tabel = m.group(1)
    wait = fail_locked(tabel)
    if wait:
        return err(429, f"Juda ko'p xato urinish. {wait} soniyadan keyin urinib ko'ring", {'error': 'too_many'})
    u = await user_get(tabel)
    if not u:
        return err(400, "Bu tabel raqami serverda ro'yxatdan o'tmagan", {'error': 'invalid_grant', 'code': 'no_user'})
    if u['status'] == 'reset':
        return err(403, 'Parolingiz tiklandi (yoki tabel raqamingiz tuzatildi) — ilovada «Roʻyxatdan oʻtish»ni bosing va yangi parol qoʻying', {'error': 'pending', 'code': 'reset'})
    pw = js_str(body.get('password'))
    main_ok = await _pw_ok(pw, u['salt'], u['hash'])
    alt = None
    if not main_ok:
        try:
            for a in await db.all_('SELECT * FROM kir_alt WHERE tabel = %s ORDER BY i', tabel):
                if await _pw_ok(pw, a['salt'], a['hash']):
                    alt = a
                    break
        except Exception:  # noqa: BLE001
            pass
    if not main_ok and not alt:
        fail_add(tabel)
        await audit(tabel, 'xato parol', '', req)
        log.info("Tabel %s: parol noto'g'ri", tabel)
        return err(400, "Parol noto'g'ri", {'error': 'invalid_grant', 'code': 'bad_password'})
    if u['status'] == 'pending':
        return err(403, "Hisobingiz administrator tasdig'ini kutmoqda", {'error': 'pending', 'code': 'pending'})
    if u['status'] == 'blocked':
        return err(403, 'Hisobingiz bloklangan — administratorga murojaat qiling', {'error': 'blocked', 'code': 'blocked'})
    await db.run('UPDATE users SET last_login = now() WHERE tabel = %s', tabel)
    fail_clear(tabel)
    uu = dict(u, name=alt['name']) if alt else u
    await audit(tabel, 'kirish' + (' (' + str(alt['name']) + ')' if alt else ''), clip(ua(req), 120), req)
    log.info('Tabel %s (%s) tizimga kirdi', tabel, uu.get('name') or '—')
    return send(200, await issue_session(uu))


async def signup(req: Request) -> Response:
    body = body_obj(await read_body(req, 10_000))
    m = EMAIL_RE.match(str(body.get('email') or ''))
    if not m:
        return err(400, "Tabel raqami noto'g'ri")
    tabel = m.group(1)
    pw = str(body.get('password') or '')
    if len(pw) < 8:
        return err(400, 'Parol juda qisqa')
    ex = await user_get(tabel)
    if ex and ex['status'] == 'reset':  # administrator tabelni tuzatgan — xodim yangi parol qoʻyadi, roli va imzosi saqlanadi
        salt = new_salt()
        await db.run("UPDATE users SET salt = %s, hash = %s, must_change = false, status = 'pending' WHERE tabel = %s", salt, await asyncio.to_thread(hash_pw, pw, salt), tabel)
        log.info('Tabel %s (%s) yangi parol qoʻydi — boshqaruv panelida tasdiqlang', tabel, ex.get('name'))
        return send(200, {'id': tabel, 'email': body.get('email'), 'pending': True})
    if ex:
        return err(422, 'Bu tabel raqami bilan hisob allaqachon bor', {'code': 'user_exists'})
    d = body_obj(body.get('data'))
    R = ROSTER.get(tabel)
    salt = new_salt()
    await db.run("INSERT INTO users (tabel, name, lavozim, salt, hash, role, status, created_at, device) VALUES (%s, %s, %s, %s, %s, 'editor', 'pending', now(), %s)",
                 tabel, R['name'] if R else clip(d.get('name'), 120), R['lavozim'] if R else clip(d.get('lavozim'), 160), salt,
                 await asyncio.to_thread(hash_pw, pw, salt), clip(ua(req), 200))
    log.info("YANGI SO'ROV: tabel %s (%s)%s — boshqaruv panelida tasdiqlang", tabel, (R['name'] if R else clip(d.get('name'), 60)) or "ismi yo'q",
             ' — ✅ shtat roʻyxatida' if R else ' — ⚠️ shtat roʻyxatida YOʻQ')
    return send(200, {'id': tabel, 'email': body.get('email'), 'pending': True})


async def user_get_me(req: Request, u: dict) -> Response:
    app, um = user_meta(u)
    return send(200, {'id': u['tabel'], 'app_metadata': app, 'user_metadata': um})


async def user_change_pw(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 10_000))
    pw = str(b.get('password') or '')
    if len(pw) < 8:
        return err(400, 'Parol juda qisqa')
    wait = fail_locked('pw:' + u['tabel'])
    if wait:
        return err(429, f"Juda ko'p xato urinish. {wait} soniyadan keyin urinib ko'ring")
    cur = await user_get(u['tabel'])
    if not cur or not await _pw_ok(str(b.get('old') or ''), cur['salt'], cur['hash']):
        fail_add('pw:' + u['tabel'])
        await audit(u['tabel'], 'parol almashtirish: eski parol xato', '', req)
        return err(400, "Eski parol noto'g'ri", {'code': 'bad_password'})
    if await _pw_ok(pw, cur['salt'], cur['hash']):
        return err(400, "Yangi parol eskisi bilan bir xil bo'lmasin")
    salt = new_salt()
    await db.run('UPDATE users SET salt = %s, hash = %s, must_change = false WHERE tabel = %s', salt, await asyncio.to_thread(hash_pw, pw, salt), u['tabel'])
    await audit(u['tabel'], 'parol almashtirildi', '', req)
    log.info('Tabel %s: parolini almashtirdi', u['tabel'])
    return send(200, {'ok': True})
