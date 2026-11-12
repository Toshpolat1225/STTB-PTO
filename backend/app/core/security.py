"""Parollar, tokenlar va shifrlash — eski serverdagi bilan aynan bir xil algoritmlar
(mavjud parollar, sessiyalar va shifrlangan imzolar koʻchirishdan keyin ham ishlaydi)."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


# ------------------------------------------------------------------ maxfiy kalitlar
def _read_or_make(name: str, make, env: str = '') -> str:
    v = os.environ.get(env, '').strip() if env else ''
    if v:  # IT talabi: kalitlar .env da (AGMK_JWT_SECRET, AGMK_ANON_KEY); boʻlmasa — /secrets dagi fayl
        return v
    p = settings.secrets_dir / name
    if p.exists():
        return p.read_text(encoding='utf8').strip()
    settings.secrets_dir.mkdir(parents=True, exist_ok=True)
    v = make()
    tmp = p.with_suffix('.tmp')
    tmp.write_text(v, encoding='utf8')
    os.chmod(tmp, 0o600)
    tmp.replace(p)
    return v


class Keys:
    jwt_secret: str = ''
    anon_key: str = ''
    enc_key: bytes = b''

    @classmethod
    def load(cls) -> None:
        cls.jwt_secret = _read_or_make('jwt.secret', lambda: secrets.token_hex(48), 'AGMK_JWT_SECRET')
        cls.anon_key = _read_or_make('anon.key', lambda: 'agmk_' + base64.urlsafe_b64encode(os.urandom(24)).decode().rstrip('='), 'AGMK_ANON_KEY')
        cls.enc_key = hashlib.sha256(('agmk-sig:' + cls.jwt_secret).encode()).digest()


# ------------------------------------------------------------------ xeshlar
def sha256(s: Any) -> str:
    return hashlib.sha256(str(s).encode('utf8')).hexdigest()


def hash_pw(pw: Any, salt: str) -> str:
    """scrypt (N=16384, r=8, p=1, 32 bayt) — Node crypto.scryptSync bilan bir xil."""
    return hashlib.scrypt(str(pw).encode('utf8'), salt=salt.encode('utf8'), n=16384, r=8, p=1, dklen=32).hex()


def derive_pw(tabel: str, pw: str) -> str:
    """Ilova parolni shu koʻrinishda yuboradi (asl parol tarmoqqa chiqmaydi)."""
    return hashlib.sha256(('agmk:%s:%s' % (tabel, pw)).encode('utf8')).hexdigest()[:40]


def new_salt() -> str:
    return secrets.token_hex(16)


def pw_ok(pw: Any, salt: str, h: str) -> bool:
    return hmac.compare_digest(hash_pw(pw, salt), h)


# ------------------------------------------------------------------ AES-256-GCM (imzolar va fayllar)
def enc(txt: str | None) -> str | None:
    if txt is None:
        return None
    iv = os.urandom(12)
    ct = AESGCM(Keys.enc_key).encrypt(iv, str(txt).encode('utf8'), None)  # ct || tag
    return 'e1:' + base64.b64encode(iv + ct[-16:] + ct[:-16]).decode()


def dec(s: str | None) -> str | None:
    if not s:
        return None
    if not s.startswith('e1:'):
        return s
    try:
        b = base64.b64decode(s[3:])
        return AESGCM(Keys.enc_key).decrypt(b[:12], b[28:] + b[12:28], None).decode('utf8')
    except Exception:
        return None


def enc_buf(b: bytes) -> bytes:
    iv = os.urandom(12)
    ct = AESGCM(Keys.enc_key).encrypt(iv, bytes(b), None)
    return b'E1' + iv + ct[-16:] + ct[:-16]


def dec_buf(b: bytes) -> bytes:
    b = bytes(b)
    if b[:2] != b'E1':
        return b
    return AESGCM(Keys.enc_key).decrypt(b[2:14], b[30:] + b[14:30], None)


# ------------------------------------------------------------------ JWT (HS256)
def _b64u(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip('=')


def _b64u_dec(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def _js_json(o: Any) -> str:
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


def sign_jwt(payload: dict) -> str:
    h = _b64u(_js_json({'alg': 'HS256', 'typ': 'JWT'}).encode())
    p = _b64u(_js_json(payload).encode('utf8'))
    s = _b64u(hmac.new(Keys.jwt_secret.encode(), (h + '.' + p).encode(), hashlib.sha256).digest())
    return h + '.' + p + '.' + s


def verify_jwt(tok: str) -> dict | None:
    parts = str(tok or '').split('.')
    if len(parts) != 3:
        return None
    want = _b64u(hmac.new(Keys.jwt_secret.encode(), (parts[0] + '.' + parts[1]).encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(want.encode(), parts[2].encode()):
        return None
    try:
        p = json.loads(_b64u_dec(parts[1]))
        if not p.get('exp') or p['exp'] * 1000 < time.time() * 1000:
            return None
        return p
    except Exception:
        return None


# ------------------------------------------------------------------ xato urinishlar (xotirada)
# 5 marta xato → 15 s; keyin har xato: 30 s, 1, 2, 3, 4, 5 daqiqa (5 daqiqada qoladi) — toʻgʻri kiritilguncha
FAIL_DUR = [15, 30, 60, 120, 180, 240, 300]
_FAILS: dict[str, dict] = {}


def fail_locked(k: str) -> int:
    f = _FAILS.get(k)
    now = time.time() * 1000
    if f and f['until'] > now:
        return -(-int(f['until'] - now) // 1000)  # yuqoriga yaxlitlash
    return 0


def fail_add(k: str) -> None:
    f = _FAILS.get(k) or {'n': 0, 'lvl': 0, 'until': 0}
    f['n'] += 1
    if f['lvl'] or f['n'] >= 5:
        f['lvl'] = (f['lvl'] or 0) + 1
        f['until'] = time.time() * 1000 + FAIL_DUR[min(f['lvl'] - 1, len(FAIL_DUR) - 1)] * 1000
    _FAILS[k] = f


def fail_clear(k: str) -> None:
    _FAILS.pop(k, None)
