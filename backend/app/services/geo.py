"""Manzil aniqlash (teskari geokodlash) — butunlay serverning oʻzida, internetsiz.
Manba: paketlar/manzillar.json (OpenStreetMap asosida). Joylashuv hech qayerga yuborilmaydi."""
from __future__ import annotations

import json
import math
import time
from pathlib import Path

C = 0.01  # katak ~1 km
_G: dict | None = None
_GERR = ''


def _key(a: float, b: float) -> str:
    return '%d:%d' % (math.floor(a / C), math.floor(b / C))


def _undl(D: list) -> list:
    o = [D[0], D[1]]
    for i in range(2, len(D)):
        o.append(o[i - 2] + D[i])
    return o


def load(paket_dir: Path) -> dict | None:
    global _G, _GERR
    if _G:
        return _G
    f = paket_dir / 'manzillar.json'
    if not f.exists():
        _GERR = 'paketlar/manzillar.json yoʻq'
        return None
    t0 = time.time()
    J = json.loads(f.read_text(encoding='utf8'))
    q = J.get('q') or 1e5
    g = {'st': {}, 'ar': {}, 'pt': {}, 'poi': {}, 'hn': {}, 'areas': [], 'src': J.get('src'), 'n': {}}

    def put(m: dict, k: str, v) -> None:
        m.setdefault(k, []).append(v)

    for n, parts in J.get('st', []):
        for D in parts:
            P = [x / q for x in _undl(D)]
            for i in range(2, len(P), 2):
                s = (n, P[i - 2], P[i - 1], P[i], P[i + 1])
                a0, a1, b0, b1 = min(s[1], s[3]), max(s[1], s[3]), min(s[2], s[4]), max(s[2], s[4])
                for a in range(math.floor(a0 / C), math.floor(a1 / C) + 1):
                    for b in range(math.floor(b0 / C), math.floor(b1 / C) + 1):
                        put(g['st'], '%d:%d' % (a, b), s)
    for n, k, D in J.get('ar', []):
        P = [x / q for x in _undl(D)]
        a0, a1, b0, b1, ar = 90.0, -90.0, 180.0, -180.0, 0.0
        for i in range(0, len(P), 2):
            a0, a1, b0, b1 = min(a0, P[i]), max(a1, P[i]), min(b0, P[i + 1]), max(b1, P[i + 1])
        j = len(P) - 2
        for i in range(0, len(P), 2):
            ar += (P[j + 1] + P[i + 1]) * (P[j] - P[i])
            j = i
        A = {'n': n, 'k': k, 'P': P, 'bb': [a0, b0, a1, b1], 's': abs(ar)}
        g['areas'].append(A)
        if (a1 - a0) / C * (b1 - b0) / C > 4000:
            put(g['ar'], '*', A)
            continue
        for a in range(math.floor(a0 / C), math.floor(a1 / C) + 1):
            for b in range(math.floor(b0 / C), math.floor(b1 / C) + 1):
                put(g['ar'], '%d:%d' % (a, b), A)
    for n, k, la, lo in J.get('pt', []):
        put(g['pt'], _key(la / q, lo / q), {'n': n, 'k': k, 'la': la / q, 'lo': lo / q})
    for n, k, la, lo in J.get('poi', []):
        put(g['poi'], _key(la / q, lo / q), {'n': n, 'k': k, 'la': la / q, 'lo': lo / q})
    for s, h, la, lo in J.get('hn', []):
        put(g['hn'], _key(la / q, lo / q), {'s': s, 'h': h, 'la': la / q, 'lo': lo / q})
    g['n'] = {'st': len(J.get('st', [])), 'ar': len(J.get('ar', [])), 'poi': len(J.get('poi', [])), 'hn': len(J.get('hn', [])), 'ms': int((time.time() - t0) * 1000)}
    _G = g
    return g


def _dm(a: float, b: float, c: float, d: float) -> float:
    return math.hypot((d - b) * math.cos(a * math.pi / 180) * 111320, (c - a) * 110540)


def _seg_d(la: float, lo: float, s) -> float:
    kx, ky = math.cos(la * math.pi / 180) * 111320, 110540
    ax, ay, bx, by = (s[2] - lo) * kx, (s[1] - la) * ky, (s[4] - lo) * kx, (s[3] - la) * ky
    dx, dy = bx - ax, by - ay
    L = dx * dx + dy * dy
    t = -(ax * dx + ay * dy) / L if L else 0
    t = max(0.0, min(1.0, t))
    return math.hypot(ax + t * dx, ay + t * dy)


def _in_poly(la: float, lo: float, P: list) -> bool:
    c = False
    j = len(P) - 2
    for i in range(0, len(P), 2):
        if (P[i + 1] > lo) != (P[j + 1] > lo) and la < (P[j] - P[i]) * (lo - P[i + 1]) / (P[j + 1] - P[i + 1]) + P[i]:
            c = not c
        j = i
    return c


def _near(m: dict, la: float, lo: float, r: int) -> list:
    out: list = []
    a0, b0 = math.floor(la / C), math.floor(lo / C)
    for a in range(a0 - r, a0 + r + 1):
        for b in range(b0 - r, b0 + r + 1):
            out.extend(m.get('%d:%d' % (a, b), ()))
    return out


KN = {'school': 'maktab', 'kindergarten': 'bogʻcha', 'hospital': 'kasalxona', 'clinic': 'poliklinika', 'fuel': 'yoqilgʻi shoxobchasi',
      'stansiya': 'stansiya', 'marketplace': 'bozor', 'bus_station': 'avtostansiya'}


def _js_round(x: float) -> int:
    return int(math.floor(x + 0.5))


def rev(paket_dir: Path, la: float, lo: float) -> dict:
    g = load(paket_dir)
    if not g:
        return {'err': _GERR}
    st, sd = None, 1e9
    for s in _near(g['st'], la, lo, 1):
        d = _seg_d(la, lo, s)
        if d < sd:
            sd, st = d, s[0]
    hn, hd = None, 1e9
    for h in _near(g['hn'], la, lo, 1):
        d = _dm(la, lo, h['la'], h['lo'])
        if d < hd and (not st or sd > 60 or h['s'] == st or hd > 25):
            hd, hn = d, h
    poi, pd = None, 1e9
    for p in _near(g['poi'], la, lo, 1):
        d = _dm(la, lo, p['la'], p['lo'])
        if d < pd:
            pd, poi = d, p
    cand = _near(g['ar'], la, lo, 0) + list(g['ar'].get('*', ()))
    inA = sorted([A for A in cand if A['bb'][0] <= la <= A['bb'][2] and A['bb'][1] <= lo <= A['bb'][3] and _in_poly(la, lo, A['P'])], key=lambda A: A['s'])

    def pick(ks):
        return next((A for A in inA if A['k'] in ks), None)
    mah, aholi, tum, san = pick(['mahalla']), pick(['city', 'town', 'village', 'hamlet', 'locality']), pick(['tuman']), pick(['sanoat'])
    pt, ptd, ct, ctd = None, 1e9, None, 1e9
    import re
    for p in _near(g['pt'], la, lo, 8):
        d = _dm(la, lo, p['la'], p['lo'])
        if d < ptd:
            ptd, pt = d, p
        lim = 8000 if p['k'] == 'city' else 4000 if p['k'] == 'town' else 1500 if re.search('village|hamlet', p['k']) else 0
        if d < lim and d / lim < (ctd if ct else 1e9):
            ct, ctd = p, d / lim
    city = aholi['n'] if aholi else ct['n'] if ct else None
    mah_n = mah['n'] if mah else pt['n'] if pt and ptd < 700 and re.search('neighbourhood|quarter|suburb', pt['k']) else None
    R = {'city': city, 'mahalla': mah_n, 'street': st if st and sd <= 120 else None,
         'house': hn['h'] if hn and hd <= 30 and (not st or sd > 120 or hn['s'] == st) else None,
         'poi': poi['n'] if poi and pd <= 200 else None, 'poiK': (KN.get(poi['k'], poi['k'])) if poi and pd <= 200 else None,
         'zone': san['n'] if san else None, 'tuman': tum['n'] if tum else None, 'd': {'st': _js_round(sd), 'poi': _js_round(pd)}}
    parts: list[str] = []
    if R['city']:
        parts.append(R['city'])
    if R['mahalla'] and R['mahalla'] != R['city']:
        parts.append(R['mahalla'])
    if R['street']:
        parts.append(R['street'] + (' ' + str(R['house']) if R['house'] else ''))
    if not parts:
        if R['zone']:
            parts.append(R['zone'])
        elif pt and ptd < 15000:
            parts.append(pt['n'] + ' yaqinida (' + ('%.1f' % (ptd / 1000)).replace('.', ',') + ' km)')
        if R['tuman']:
            parts.append(R['tuman'])
    elif R['zone'] and not R['street']:
        parts.append(R['zone'])
    R['t'] = ', '.join(parts) + (' · ' + R['poi'] + ' yonida' if R['poi'] and not any(R['poi'] in p for p in parts) else '')
    return R


def info(paket_dir: Path) -> dict:
    g = load(paket_dir)
    return {'ok': True, 'src': g['src'], 'n': g['n']} if g else {'ok': False, 'err': _GERR}


def reset() -> None:
    global _G, _GERR
    _G, _GERR = None, ''
