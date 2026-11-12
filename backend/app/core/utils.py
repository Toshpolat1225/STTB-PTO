"""Umumiy yordamchilar."""
from __future__ import annotations

import datetime as dt
import re
import time
from typing import Any

UTC = dt.timezone.utc


def clean_tabel(s: Any) -> str:
    return re.sub(r'\s+', '', js_str(s) if s else '').strip()


def js_str(v: Any) -> str:
    """JavaScript String(v) bilan bir xil (parol xeshlari mos kelishi uchun)."""
    if v is None:
        return 'undefined'
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, float) and v.is_integer() and abs(v) < 1e21:
        return str(int(v))
    if isinstance(v, (list, dict)):
        return ',' .join(js_str(x) for x in v) if isinstance(v, list) else '[object Object]'
    return str(v)


def clip(s: Any, n: int) -> str:
    s = '' if s is None else js_str(s)
    s = s.strip()
    return s[:n] if len(s) > n else s


def iso(v: Any) -> str | None:
    """timestamptz → JavaScript toISOString() koʻrinishi: 2026-10-08T03:12:45.123Z"""
    if v is None:
        return None
    if isinstance(v, str):
        return v
    if isinstance(v, dt.datetime):
        v = v.astimezone(UTC)
        return v.strftime('%Y-%m-%dT%H:%M:%S.') + '%03dZ' % (v.microsecond // 1000)
    if isinstance(v, dt.date):
        return v.isoformat()
    return str(v)


def now() -> dt.datetime:
    return dt.datetime.now(UTC)


def now_ms() -> int:
    return int(time.time() * 1000)


def today_local() -> str:
    """Server vaqt mintaqasidagi bugungi sana (vaqtincha tayinlash uchun; eski serverdagi kabi)."""
    return dt.date.today().isoformat()


def today_utc() -> str:
    return dt.datetime.now(UTC).date().isoformat()


# ---- yozuvlar vaqt belgisi: mikrosoniya aniqligida, doim oʻsuvchi («2026-10-08T03:12:45.123456Z»)
def iso_to_micros(s: str) -> int:
    sec = int(dt.datetime.strptime(s[:19], '%Y-%m-%dT%H:%M:%S').replace(tzinfo=UTC).timestamp())
    ms = int(s[20:23]) if s[20:23].isdigit() else 0
    us = int(s[23:26]) if s[23:26].isdigit() else 0
    return (sec * 1000 + ms) * 1000 + us


def micros_to_iso(m: int) -> str:
    ms, us = divmod(m, 1000)
    d = dt.datetime.fromtimestamp(ms / 1000, UTC)
    return d.strftime('%Y-%m-%dT%H:%M:%S.') + '%03d' % (ms % 1000) + '%03d' % us + 'Z'


def next_stamp(last_micros: int) -> tuple[str, int]:
    m = max(time.time_ns() // 1000, last_micros + 1)
    return micros_to_iso(m), m


# ---- familiya kaliti (kirill/lotin farqisiz): «Тўхтаев А.А.» ≈ «To'xtayev Anvar»
_CYR = {'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 's', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h'}


def surname_key(n: Any) -> str:
    w = (str(n or '').strip().split() or [''])[0]
    w = re.sub(r"[ʻʼ'`‘’]", '', w.lower())
    o = ''.join(_CYR.get(ch, ch) for ch in w)
    o = o.replace('q', 'k').replace('x', 'h')
    o = re.sub(r'yev$', 'ev', o)
    o = re.sub(r'yeva$', 'eva', o)
    o = re.sub(r'[aou]', 'a', o)
    return re.sub(r'[^a-z]', '', o)
