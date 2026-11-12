"""5.5: Davomat — grafik (smena) boʻyicha hisob. Bazasiz, toza funksiyalar (unit testlar uchun).

Kodlar:  D — den 07:00–19:00 (12 soat) · N — noch 19:00–07:00 (ertasi kuni, 12 soat)
         I — ITR 07:30–16:30 (5/2, 8 soat) · W — ishchi 07:00–16:00 (5/2, 8 soat) · V — dam / otsypnoy
Grafik — kodlar sikli; «anchor» kuni siklning 1-kuni (5/2 uchun — dushanba).
"""
from __future__ import annotations

import datetime as dt

T = dt.time
CODES = {
    'D': (T(7, 0), T(19, 0), 0),
    'N': (T(19, 0), T(7, 0), 1),
    'I': (T(7, 30), T(16, 30), 0),
    'W': (T(7, 0), T(16, 0), 0),
}
CODE_NAME = {'D': '☀ den', 'N': '🌙 noch', 'I': 'ITR', 'W': '8 soat', 'V': 'dam'}
PATTERNS = {
    'itr52': {'name': '5/2 · ITR 07:30–16:30', 'cycle': ['I', 'I', 'I', 'I', 'I', 'V', 'V'], 'week': True},
    'w52': {'name': '5/2 · ishchilar 07:00–16:00', 'cycle': ['W', 'W', 'W', 'W', 'W', 'V', 'V'], 'week': True},
    'dnvv': {'name': 'Den–Noch–Dam–Dam · 12 soat', 'cycle': ['D', 'N', 'V', 'V']},
    'nnvv': {'name': '2 Noch – 2 Dam · 12 soat', 'cycle': ['N', 'N', 'V', 'V']},
    'ddvv': {'name': '2 Den – 2 Dam · 12 soat', 'cycle': ['D', 'D', 'V', 'V']},
}
GRACE = dt.timedelta(minutes=5)          # 5 daqiqagacha kech / erta — hisoblanmaydi
BEFORE = dt.timedelta(hours=3)           # smena boshlanishidan 3 soat oldin kirgan ham shu smenaga
AFTER = dt.timedelta(hours=5)            # smena tugagach 5 soat ichida chiqqan ham shu smenaga
REASONS = {'bol': '🩺 Balnichniy', 'tat': '🏖 Taʼtil', 'kom': '✈️ Komandirovka', 'oqi': '📚 Oʻqish', 'dam': '🏠 Dam olish', 'boshqa': '📝 Boshqa'}


def valid_cycle(c) -> list[str] | None:
    if not isinstance(c, list) or not 1 <= len(c) <= 62:
        return None
    out = [str(x).upper() for x in c]
    return out if all(x in CODES or x == 'V' for x in out) else None


def code_on(cycle: list[str], anchor: dt.date, day: dt.date) -> str:
    return cycle[(day - anchor).days % len(cycle)]


def window(code: str, day: dt.date) -> tuple[dt.datetime, dt.datetime] | None:
    if code not in CODES:
        return None
    s, e, nxt = CODES[code]
    a = dt.datetime.combine(day, s)
    b = dt.datetime.combine(day + dt.timedelta(days=nxt), e)
    return a, b


def guess_code(first_in: dt.datetime) -> str:
    """Grafik berilmagan ishchi: birinchi kirish vaqtidan taxmin (tasdiqlanmagan)."""
    h = first_in.hour + first_in.minute / 60
    if 16.5 <= h < 22:
        return 'N'
    if 5 <= h < 7.25:
        return 'D'
    return 'W'


def pairs(ev: list[dict]) -> list[tuple[dt.datetime, dt.datetime, str]]:
    """Kirdi → chiqdi juftlari (obyekt bilan). Yoʻnalish nomaʼlum (0) boʻlsa — navbat bilan."""
    out = []
    cur = None
    state = -1
    for e in sorted(ev, key=lambda x: x['at']):
        d = e['dir'] or (1 if state == -1 else -1)
        if d == 1:
            if cur is None:
                cur = e
            state = 1
        else:
            if cur is not None:
                out.append((cur['at'], e['at'], cur.get('obj') or e.get('obj') or ''))
                cur = None
            state = -1
    if cur is not None:
        out.append((cur['at'], None, cur.get('obj') or ''))
    return out


def day_status(code: str | None, guessed: bool, day: dt.date, ev: list[dict], reason: dict | None, now: dt.datetime) -> dict:
    """Bir kunlik holat. ev — shu smena oynasiga tegishli hodisalar (yoki grafiksiz — shu kun)."""
    r: dict = {'code': code, 'guess': guessed, 'plan': None, 'in': None, 'out': None, 'late': 0, 'early': 0, 'inside': False,
               'work': 0, 'objs': {}, 'n_out': 0, 'st': ''}
    w = window(code, day) if code else None
    if w:
        r['plan'] = [w[0].strftime('%H:%M'), w[1].strftime('%H:%M')]
    P = pairs(ev)
    if P:
        r['in'] = P[0][0].isoformat(timespec='minutes')
        last = ev[-1] if ev else None
        r['inside'] = P[-1][1] is None or bool(last and last['dir'] == 1)
        closed = [p for p in P if p[1] is not None]
        if closed and not r['inside']:
            r['out'] = closed[-1][1].isoformat(timespec='minutes')
        r['n_out'] = max(0, len(P) - 1)
        tot = 0
        for a, b, o in P:
            b2 = b or min(now, w[1] if w else now)
            if b2 > a:
                s = int((b2 - a).total_seconds() // 60)
                tot += s
                if o:
                    r['objs'][o] = r['objs'].get(o, 0) + s
        r['work'] = tot
        if w:
            if P[0][0] > w[0] + GRACE:
                r['late'] = int((P[0][0] - w[0]).total_seconds() // 60)
            if not r['inside'] and closed and closed[-1][1] < w[1] - GRACE:
                r['early'] = int((w[1] - closed[-1][1]).total_seconds() // 60)
        r['st'] = 'ishda' if r['inside'] else 'ketgan'
        return r
    if reason:
        r['st'] = 'sababli'
        return r
    if not code:
        r['st'] = 'grafiksiz' if not guessed else 'kelmagan'
        return r
    if code == 'V':
        r['st'] = 'dam'
        return r
    if w and now < w[0] + GRACE:
        r['st'] = 'kutish'
        return r
    r['st'] = 'sababsiz'
    return r


def tabel_mark(code: str | None, st: dict) -> str:
    """Oylik tabel katagi: ishlagan soat (0,5 ga yaxlitlab), V, B (sababli), PR (sababsiz), — (grafiksiz)."""
    s = st['st']
    if s in ('ishda', 'ketgan'):
        h = round(st['work'] / 30) / 2
        return ('%g' % h).replace('.', ',')
    if s == 'sababli':
        return 'B'
    if s == 'dam':
        return 'V'
    if s == 'sababsiz':
        return 'PR'
    return ''
