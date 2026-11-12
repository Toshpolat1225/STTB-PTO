"""Audit jurnali, sessiyalar va foydalanuvchini aniqlash."""
from __future__ import annotations

import json
import logging
import re
import secrets
import time

from starlette.requests import Request

from app.core import database as db
from app.services.roster import roster_roles
from app.core.security import hash_pw, new_salt, sign_jwt, verify_jwt
from app.core.utils import clip
from app.core.http_utils import client_ip

log = logging.getLogger('agmk')
EMAIL_RE = re.compile(r'^t(\d{1,12})@agmk-sttb\.app$')


async def audit(tabel: str | None, action: str, detail: str | None = '', req: Request | None = None) -> None:
    try:
        await db.run('INSERT INTO audit (at, tabel, action, detail, ip) VALUES (now(), %s, %s, %s, %s)',
                     tabel or None, action, clip(detail, 500), clip(client_ip(req), 60) if req else None)
    except Exception as e:  # noqa: BLE001
        log.warning('audit yozilmadi: %s', e)


def user_meta(u: dict) -> tuple[dict, dict]:
    app = {'role': u['role'], 'demo': bool(u.get('demo')), 'must_change': bool(u.get('must_change')), 'roles': roster_roles(u['tabel'])}
    return app, {'name': u.get('name'), 'lavozim': u.get('lavozim')}


async def issue_session(u: dict) -> dict:
    exp = int(time.time()) + 12 * 3600
    access = sign_jwt({'sub': u['tabel'], 'role': 'authenticated', 'app_role': u['role'], 'name': u.get('name'), 'exp': exp})
    refresh = secrets.token_urlsafe(32)
    await db.run('INSERT INTO refresh (token, tabel, expires) VALUES (%s, %s, %s)', refresh, u['tabel'], int(time.time() * 1000) + 60 * 24 * 3600 * 1000)
    app, um = user_meta(u)
    return {'access_token': access, 'token_type': 'bearer', 'expires_in': 12 * 3600, 'expires_at': exp, 'refresh_token': refresh,
            'user': {'id': u['tabel'], 'email': 't%s@agmk-sttb.app' % u['tabel'], 'app_metadata': app, 'user_metadata': um}}


async def auth_user(req: Request) -> dict | None:
    h = req.headers.get('authorization', '')
    p = verify_jwt(re.sub(r'^Bearer\s+', '', h, flags=re.I))
    if not p:
        return None
    u = await db.one('SELECT * FROM users WHERE tabel = %s', str(p.get('sub')))
    if not u or u['status'] != 'active':
        return None
    return u


async def user_get(tabel: str) -> dict | None:
    return await db.one('SELECT * FROM users WHERE tabel = %s', str(tabel))


async def set_password(tabel: str, pw: str) -> None:
    salt = new_salt()
    await db.run('UPDATE users SET salt = %s, hash = %s, must_change = false WHERE tabel = %s', salt, hash_pw(pw, salt), tabel)


async def pin_rec(t: str) -> dict | None:
    try:
        x = await user_get(t)
        return json.loads(x['sigpin']) if x and x.get('sigpin') else None
    except Exception:  # noqa: BLE001
        return None


async def pin_set(t: str, pin: str) -> None:
    s = secrets.token_hex(16)
    await db.run('UPDATE users SET sigpin = %s WHERE tabel = %s', json.dumps({'s': s, 'h': hash_pw(pin, s)}), t)
