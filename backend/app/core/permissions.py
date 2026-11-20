"""Huquqlar: rollar, maxfiy yozuvlar va shaxsiy maʼlumotlar kimga koʻrinishi."""
from __future__ import annotations

import json
import re

from app.core import database as db
from app.services.roster import roster_roles
from app.core.utils import today_local

ROLES = ['admin', 'editor', 'viewer']
ADMIN_KINDS = ['cfg']  # xavfsizlik sozlamalari — faqat administrator yozadi
ADMIN_IDS = ['kv:agmk_roles', 'kv:agmk_sec_cfg', 'kv:agmk_map_georef', 'kv:agmk_flags', 'kv:agmk_kir_ovr']
BUX_IDS = ['kv:agmk_bux']
BUX_ROLES = ['bux', 'rahbar']
PAY_ROLES = ['mtih', 'bux', 'rahbar']  # mehnatni tashkil etish va ish haqi
# maxfiy kv kalitlari — oʻqish/yozish faqat koʻrsatilgan rollarga (admin har doim). Roʻyxatda yoʻq kalit — hammaga.
KV_ACL = {
    'kv:agmk_bux': BUX_ROLES,
    'kv:agmk_fot_cfg_v1': PAY_ROLES, 'kv:agmk_fot_hist_v1': PAY_ROLES,
    'kv:agmk_nar_v1': PAY_ROLES, 'kv:agmk_nar_chk_v1': PAY_ROLES, 'kv:agmk_nar_wag_v1': PAY_ROLES,
    'kv:agmk_nar_vt_v1': PAY_ROLES + ['kadr'], 'kv:agmk_nar_vt_cfg': PAY_ROLES + ['kadr'],
}
PD_ROLES = ['kadr', 'rahbar', 'okl']
MOD_ACL = {'iqt': BUX_ROLES}  # modul toʻplamlari (m:<toʻplam>:<id>)
PD_KEYS = ['birthDate', 'yil', 'oilaviy', 'oilaAzolari', 'spravka', 'workHistory', 'yutuqlar', 'hafsanalar', 'tatillar', 'izoh',
           'passport', 'address', 'manzil', 'oklad', 'photo', 'gallery', 'email']
POS_ROLES = ['rahbar', 'hr', 'tex', 'okl', 'rl1', 'rl3']  # jonli xaritada hammani koʻradiganlar


YON_PREFIX = 'kv:agmk_yon_'  # 6.2: yoʻnalishlar boʻlimi maʼlumotlari («Dalolatnoma va hujjatlar tayyorlash»)
YON_ROLES = ['ichtb', 'rahbar']  # oʻqish/yozish — faqat ICHTB xodimlari, rahbariyat va administrator


def kv_acl(i: str) -> list[str] | None:
    s = str(i)
    if s.startswith(YON_PREFIX):
        return YON_ROLES
    return KV_ACL.get(s)


ICHTB_RE = re.compile(r'ishlab\s*chiqarish.{0,3}texnik|\bичтб\b|\bichtb\b|\bпто\b', re.I)


async def is_ichtb(tabel: str) -> bool:
    """6.2: xodim ICHTB (Ishlab chiqarish-texnik boʻlimi) tarkibidami — shtat tuzilmasidagi oʻrni boʻyicha (server tomonida)."""
    try:
        from app.services import org
        P = await org.people()
        x = P.get(str(tabel))
        if not x:
            return False
        T = getattr(org.C, 'tree', None) or {}
        names = []
        if x.get('grp'):
            names += [g.get('name') or '' for g in T.get('groups') or [] if g.get('id') == x['grp']]
        if x.get('unit'):
            names += [(u.get('name') or '') + ' ' + (u.get('short') or '') for u in T.get('units') or [] if u.get('id') == x['unit']]
        return any(ICHTB_RE.search(n or '') for n in names)
    except Exception:  # noqa: BLE001
        return False


KV_OWN_RE = re.compile(r'^kv:agmk_u_(\d{1,12})_[a-z0-9_]{1,40}$')  # 6.2: shaxsiy kalitlar — faqat egasi (boshqalarga, admin ham, yuborilmaydi)


def kv_owner(i: str) -> str | None:
    """Shaxsiy kv yozuvi boʻlsa — egasining tabeli, aks holda None."""
    m = KV_OWN_RE.match(str(i))
    return m.group(1) if m else None


def mod_acl(i: str) -> list[str] | None:
    m = re.match(r'^m:([a-z]{2,12}):', str(i))
    return MOD_ACL.get(m.group(1)) if m else None


async def vt_active() -> list[dict]:
    """Kuchga kirgan vaqtincha tayinlashlar (bugungi sana oraligʻida)."""
    try:
        t = today_local()
        return await db.all_('SELECT * FROM vt_act WHERE cancelled IS NULL AND done_at IS NOT NULL AND dfrom <= %s AND dto >= %s', t, t)
    except Exception:  # noqa: BLE001
        return []


async def app_roles_base(tabel: str) -> list[str]:
    try:
        r = await db.one("SELECT data::text AS d FROM records WHERE id = 'kv:agmk_roles' AND deleted = false")
        if r:
            d = json.loads(r['d'])
            return [str(x) for x in (((d or {}).get('v') or {}).get(tabel) or [])]
    except Exception:  # noqa: BLE001
        pass
    return []


async def app_roles(tabel: str) -> list[str]:
    """Ilovadagi rollar. Vaqtincha tayinlash muddatida: oʻrniga tayinlangan xodim asl xodimning rollarini oladi,
    asl xodimniki toʻxtatiladi (administratorga taʼsir qilmaydi)."""
    base = await app_roles_base(tabel)
    try:
        u = await db.one('SELECT role FROM users WHERE tabel = %s', str(tabel))
        if u and u['role'] == 'admin':
            return base
    except Exception:  # noqa: BLE001
        pass
    try:
        A = await vt_active()
        if any(x['a'] == tabel for x in A):
            return [r for r in base if r == 'rl3']
        inh: list[str] = []
        for x in A:
            if x['b'] == tabel:
                inh += await app_roles_base(x['a'])
        return list(dict.fromkeys(base + inh)) if inh else base
    except Exception:  # noqa: BLE001
        return base


async def can_role(u: dict, roles: list[str]) -> bool:
    if u['role'] == 'admin':
        return True
    have = (await app_roles(u['tabel'])) + roster_roles(u['tabel'])
    if any(x in roles for x in have):
        return True
    return 'ichtb' in roles and await is_ichtb(u['tabel'])


async def sees_all_positions(u: dict) -> bool:
    if await can_role(u, POS_ROLES):
        return True
    today = today_utc_str()
    return any(re.match(r'^rl2@', x) and x[4:] >= today for x in await app_roles(u['tabel']))


def today_utc_str() -> str:
    from app.core.utils import today_utc
    return today_utc()


def pd_strip(d: dict) -> dict:
    return {k: v for k, v in (d or {}).items() if k not in PD_KEYS}


def pd_only(d: dict) -> dict:
    return {k: v for k, v in (d or {}).items() if k in PD_KEYS}
