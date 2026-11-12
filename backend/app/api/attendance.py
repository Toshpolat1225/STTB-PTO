"""5.5: SVO — davomat (turniket kirish-chiqishi) nazorati.

Kim koʻradi: SVO («svo» roli), rahbariyat («rahbar»), administrator — hammani; sex / boʻlim boshligʻi, usta — faqat oʻziga
boʻysunuvchilarni (tuzilma + qoʻlda biriktirilganlar, «Mening hodimlarim» bilan bir xil). Qolganlar — hech narsa.
Turniket hodisalarini faqat SVO va administrator yuklaydi. Grafik va sababni — SVO yoki oʻsha ishchining rahbari kiritadi.
Kirish-chiqish vaqtlari faqat serverda; ilova faqat ochilgan sahifa uchun soʻraydi (saqlab qolmaydi).
"""
from __future__ import annotations

import datetime as dt
import json
import re

from starlette.requests import Request
from starlette.responses import Response

from app.services import attendance as L
from app.core import database as db
from app.services import org
from app.core.permissions import can_role
from app.core.audit import audit
from app.core.utils import clean_tabel, clip
from app.core.http_utils import body_obj, err, read_body, send

ALL_ROLES = ['svo', 'rahbar']
IMPORT_ROLES = ['svo']
OBJECTS = ['Ст. Отвальная', 'Ст. Породная', 'Ст. Колсевая', 'Сл. СЦБ и связь', 'ЖДЦ-2 Раскомандировка', 'ВРП ЖДЦ-2', 'Ст. Фабричная',
           'Ст. Медная', 'Смотровая диспетчерской здания ЖДЦ-1', 'К-сеть', 'Ст. Предгорная', 'АБК УПЖТ', 'ЖДЦ-3', 'КНСМ', 'ЖДЦ-1', 'Вагонная служба']


def _norm(s: str) -> str:
    return re.sub(r'[^0-9a-zа-яё]+', '', str(s or '').lower().replace('ст.', '').replace('сл.', ''))


def obj_match(raw: str) -> str:
    """Turniket nomini 16 obyektdan biriga moslash (topilmasa — oʻzi qoladi): aniq → nomi ichida → qisqartma."""
    n = _norm(raw)
    if not n:
        return ''
    K = [(o, _norm(o)) for o in OBJECTS]
    for o, k in K:
        if k == n:
            return o
    inside = [o for o, k in K if k and k in n]
    if inside:
        return max(inside, key=lambda o: len(_norm(o)))
    part = [o for o, k in K if len(n) >= 3 and n in k]
    if part:
        return min(part, key=lambda o: len(_norm(o)))
    return clip(raw, 80)


async def _ctx(u: dict) -> dict:
    allv = await can_role(u, ALL_ROLES)
    vis = set(await org.visible(u['tabel'], allv))
    return {'all': allv, 'vis': vis, 'imp': await can_role(u, IMPORT_ROLES)}


def _day(v, default: dt.date | None = None) -> dt.date:
    s = str(v or '').strip()[:10]
    if not s:
        return default or dt.date.today()
    return dt.date.fromisoformat(s)


async def _patterns() -> dict[str, dict]:
    P = {k: dict(v, id=k, builtin=True) for k, v in L.PATTERNS.items()}
    try:
        for r in await db.all_('SELECT id, name, cycle FROM dav_pattern WHERE deleted = false ORDER BY at'):
            c = r['cycle'] if isinstance(r['cycle'], list) else json.loads(r['cycle'])
            if L.valid_cycle(c):
                P[r['id']] = {'id': r['id'], 'name': r['name'], 'cycle': c, 'builtin': False}
    except Exception:  # noqa: BLE001
        pass
    return P


async def _assign(ts: list[str], d1: dt.date, d2: dt.date) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    if not ts:
        return out
    for r in await db.all_('SELECT * FROM dav_assign WHERE cancelled IS NULL AND tabel = ANY(%s) AND dfrom <= %s AND (dto IS NULL OR dto >= %s) ORDER BY dfrom, id',
                           ts, d2, d1):
        out.setdefault(r['tabel'], []).append(r)
    return out


async def _reasons(ts: list[str], d1: dt.date, d2: dt.date) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    if not ts:
        return out
    for r in await db.all_('SELECT * FROM dav_reason WHERE cancelled IS NULL AND tabel = ANY(%s) AND dfrom <= %s AND dto >= %s ORDER BY dfrom, id', ts, d2, d1):
        out.setdefault(r['tabel'], []).append(r)
    return out


async def _data_days(d1: dt.date, d2: dt.date) -> set[dt.date]:
    """5.6: turniket maʼlumoti yuklangan kunlar. Maʼlumot yoʻq kunda hech kim «sababsiz» deb belgilanmaydi."""
    a = dt.datetime.combine(d1, dt.time(0, 0))
    b = dt.datetime.combine(d2, dt.time(0, 0)) + dt.timedelta(days=1)
    rows = await db.all_("SELECT DISTINCT date_trunc('day', at)::date AS d FROM dav_event WHERE at >= %s AND at < %s", a, b)
    return {r['d'] for r in rows}


def nodata(s: dict) -> dict:
    """Maʼlumot yoʻq kun: «sababsiz» → «nodata» (sababli, dam, grafiksiz oʻzgarmaydi)."""
    if s.get('st') == 'sababsiz':
        s = dict(s, st='nodata')
    return s


async def _events(ts: list[str], a: dt.datetime, b: dt.datetime) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    if not ts:
        return out
    for r in await db.all_('SELECT tabel, at, dir, obj FROM dav_event WHERE tabel = ANY(%s) AND at >= %s AND at < %s ORDER BY at', ts, a, b):
        out.setdefault(r['tabel'], []).append(r)
    return out


def code_for(x: dict, A: list[dict], PT: dict, day: dt.date) -> tuple[str | None, str | None]:
    """(kod, grafik id). Biriktirilmagan ITR — 5/2 ITR; ishchi — grafiksiz (taxmin qilinadi)."""
    cur = None
    for a in A or []:
        if a['dfrom'] <= day and (a['dto'] is None or a['dto'] >= day):
            cur = a
    if cur and cur['pattern'] in PT:
        return L.code_on(PT[cur['pattern']]['cycle'], cur['anchor'], day), cur['pattern']
    if x.get('itr'):
        return L.code_on(PT['itr52']['cycle'], dt.date(2024, 1, 1), day), 'itr52'  # 01.01.2024 — dushanba
    return None, None


def evaluate(x: dict, A: list[dict], R: list[dict], E: list[dict], PT: dict, day: dt.date, now: dt.datetime) -> dict:
    code, pid = code_for(x, A, PT, day)
    w = L.window(code, day) if code else None
    if w:
        ev = [e for e in E if w[0] - L.BEFORE <= e['at'] <= w[1] + L.AFTER]
    else:
        a = dt.datetime.combine(day, dt.time(0, 0))
        ev = [e for e in E if a <= e['at'] < a + dt.timedelta(days=1)]
    guessed = False
    if not code and ev:
        first = next((e for e in ev if e['dir'] != -1), ev[0])
        code, guessed = L.guess_code(first['at']), True
        w = L.window(code, day)
        if w:
            ev = [e for e in E if w[0] - L.BEFORE <= e['at'] <= w[1] + L.AFTER]
    rs = next((r for r in R or [] if r['dfrom'] <= day <= r['dto']), None)
    st = L.day_status(code, guessed, day, ev, rs, now)
    st['pat'] = pid
    if rs:
        st['reason'] = {'id': rs['id'], 'kind': rs['kind'], 'name': L.REASONS.get(rs['kind'], rs['kind']), 'from': rs['dfrom'].isoformat(), 'to': rs['dto'].isoformat(), 'note': rs['note'] or ''}
    last = ev[-1] if ev else None
    st['obj'] = last['obj'] if last else ''
    return st


def _pub(x: dict, N: dict) -> dict:
    return {'tabel': x['tabel'], 'name': x['name'], 'lav': x['lav'], 'unit': x.get('unit'), 'unitN': N['u'].get(x.get('unit')) or '',
            'grpN': N['g'].get(x.get('grp')) or '', 'itr': bool(x.get('itr'))}


# ------------------------------------------------------------------ API
async def dav_cfg(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    PT = await _patterns()
    return send(200, {'all': c['all'], 'imp': c['imp'], 'n': len(c['vis']), 'can': c['all'] or bool(c['vis']), 'objects': OBJECTS,
                      'patterns': [{'id': k, 'name': v['name'], 'cycle': v['cycle'], 'builtin': v.get('builtin', False)} for k, v in PT.items()],
                      'reasons': [{'k': k, 'n': v} for k, v in L.REASONS.items()], 'codes': L.CODE_NAME})


async def dav_day(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not c['all'] and not c['vis']:
        return err(403, 'Bu boʻlim SVO, rahbariyat va boʻlim boshliqlari uchun')
    try:
        day = _day(req.query_params.get('d'))
    except ValueError:
        return err(400, 'Sana notoʻgʻri')
    P = await org.people()
    N = org.names()
    ts = sorted(t for t in c['vis'] if t in P)
    PT = await _patterns()
    A = await _assign(ts, day, day)
    R = await _reasons(ts, day, day)
    a = dt.datetime.combine(day, dt.time(0, 0)) - dt.timedelta(hours=4)
    E = await _events(ts, a, a + dt.timedelta(days=1, hours=17))
    now = dt.datetime.now()
    if day < now.date():
        now = dt.datetime.combine(day + dt.timedelta(days=2), dt.time(0, 0))
    out, cnt, objs = [], {}, {}
    nd = day not in await _data_days(day, day)
    for t in ts:
        s = evaluate(P[t], A.get(t, []), R.get(t, []), E.get(t, []), PT, day, now)
        if nd:
            s = nodata(s)
        tags = [s['st']] + (['kech'] if s['late'] else []) + (['erta'] if s['early'] else [])
        for k in set(tags):
            cnt[k] = cnt.get(k, 0) + 1
        if s['inside'] and s['obj']:
            objs[s['obj']] = objs.get(s['obj'], 0) + 1
        out.append(_pub(P[t], N) | s | {'tags': tags})
    last = await db.one('SELECT max(at) AS m FROM dav_event')
    return send(200, {'date': day.isoformat(), 'all': c['all'], 'list': out, 'cnt': cnt, 'inside': objs, 'nodata': nd, 'last': last and last['m'] and last['m'].isoformat(timespec='minutes')})


async def dav_person(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    t = clean_tabel(req.query_params.get('t'))
    if not t or (t not in c['vis'] and not c['all']):
        return err(403, 'Bu xodim sizga koʻrinmaydi')
    try:
        d2 = _day(req.query_params.get('d'))
        d1 = _day(req.query_params.get('from'), d2)
    except ValueError:
        return err(400, 'Sana notoʻgʻri')
    if (d2 - d1).days > 62:
        return err(400, 'Koʻpi bilan 2 oy')
    P = await org.people()
    if t not in P:
        return err(404, 'Xodim topilmadi')
    PT = await _patterns()
    A = (await _assign([t], d1, d2)).get(t, [])
    R = (await _reasons([t], d1, d2)).get(t, [])
    a = dt.datetime.combine(d1, dt.time(0, 0)) - dt.timedelta(hours=4)
    E = (await _events([t], a, dt.datetime.combine(d2, dt.time(0, 0)) + dt.timedelta(days=1, hours=13))).get(t, [])
    now = dt.datetime.now()
    have = await _data_days(d1, d2)
    days = []
    d = d1
    while d <= d2:
        s = evaluate(P[t], A, R, E, PT, d, now if d >= now.date() else dt.datetime.combine(d + dt.timedelta(days=2), dt.time(0, 0)))
        if d not in have:
            s = nodata(s)
        w = L.window(s['code'], d) if s['code'] else None
        lo = (w[0] - L.BEFORE) if w else dt.datetime.combine(d, dt.time(0, 0))
        hi = (w[1] + L.AFTER) if w else lo + dt.timedelta(days=1)
        s['ev'] = [{'at': e['at'].isoformat(timespec='minutes'), 'dir': e['dir'], 'obj': e['obj']} for e in E if lo <= e['at'] <= hi]
        s['date'] = d.isoformat()
        days.append(s)
        d += dt.timedelta(days=1)
    cur = next((a for a in reversed(A) if a['dfrom'] <= d2), None)
    return send(200, {'p': _pub(P[t], org.names()), 'days': days, 'pattern': cur and {'id': cur['pattern'], 'name': PT.get(cur['pattern'], {}).get('name', cur['pattern']),
                                                                                       'anchor': cur['anchor'].isoformat(), 'from': cur['dfrom'].isoformat()},
                      'reasons': [{'id': r['id'], 'kind': r['kind'], 'name': L.REASONS.get(r['kind'], r['kind']), 'from': r['dfrom'].isoformat(), 'to': r['dto'].isoformat()} for r in R]})


async def dav_tabel(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not c['all'] and not c['vis']:
        return err(403, 'Ruxsat yoʻq')
    m = str(req.query_params.get('m') or dt.date.today().strftime('%Y-%m'))
    if not re.match(r'^\d{4}-\d{2}$', m):
        return err(400, 'Oy notoʻgʻri')
    d1 = dt.date(int(m[:4]), int(m[5:7]), 1)
    d2 = (d1.replace(day=28) + dt.timedelta(days=4)).replace(day=1) - dt.timedelta(days=1)
    unit = str(req.query_params.get('unit') or '')
    P = await org.people()
    ts = sorted(t for t in c['vis'] if t in P and (not unit or P[t].get('unit') == unit))
    if len(ts) > 3000:
        ts = ts[:3000]
    PT = await _patterns()
    A = await _assign(ts, d1, d2)
    R = await _reasons(ts, d1, d2)
    a = dt.datetime.combine(d1, dt.time(0, 0)) - dt.timedelta(hours=4)
    E = await _events(ts, a, dt.datetime.combine(d2, dt.time(0, 0)) + dt.timedelta(days=1, hours=13))
    now = dt.datetime.now()
    N = org.names()
    have = await _data_days(d1, d2)
    rows = []
    for t in ts:
        cells, hrs, ke, pr = [], 0, 0, 0
        d = d1
        while d <= d2:
            if d > now.date():
                cells.append('')
            else:
                s = evaluate(P[t], A.get(t, []), R.get(t, []), E.get(t, []), PT, d, now if d == now.date() else dt.datetime.combine(d + dt.timedelta(days=2), dt.time(0, 0)))
                if d not in have:
                    s = nodata(s)
                mk = '' if s['st'] == 'nodata' else L.tabel_mark(s['code'], s)
                cells.append(mk + ('*' if (s['late'] or s['early']) and mk not in ('V', 'B', 'PR', '') else ''))
                hrs += s['work'] if s['st'] in ('ishda', 'ketgan') else 0
                ke += 1 if (s['late'] or s['early']) else 0
                pr += 1 if s['st'] == 'sababsiz' else 0
            d += dt.timedelta(days=1)
        rows.append(_pub(P[t], N) | {'c': cells, 'h': round(hrs / 60, 1), 'ke': ke, 'pr': pr})
    return send(200, {'m': m, 'days': (d2 - d1).days + 1, 'rows': rows})


async def dav_import(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not c['imp']:
        return err(403, 'Turniket maʼlumotini faqat SVO yoki administrator yuklaydi')
    b = body_obj(await read_body(req, 12_000_000))
    rows = b.get('rows') if isinstance(b.get('rows'), list) else []
    if not rows or len(rows) > 200_000:
        return err(400, 'Qatorlar yoʻq (yoki 200 000 dan koʻp)')
    P = await org.people()
    src = clip(b.get('src'), 120)
    ok, unk, bad, dup = 0, set(), 0, 0
    vals = []
    for r in rows:
        if not isinstance(r, dict):
            bad += 1
            continue
        t = clean_tabel(r.get('t'))
        try:
            at = dt.datetime.fromisoformat(str(r.get('at') or '')[:19])
        except ValueError:
            bad += 1
            continue
        if not t or not (2000 <= at.year <= 2100):
            bad += 1
            continue
        if t not in P:
            unk.add(t)
            continue
        d = r.get('dir')
        d = 1 if d in (1, '1', 'in') else -1 if d in (-1, '-1', 'out') else 0
        vals.append((t, at.replace(second=0, microsecond=0), d, obj_match(r.get('obj') or '')))
    async with db.conn() as cn:
        async with cn.transaction():
            for i in range(0, len(vals), 1000):
                part = vals[i:i + 1000]
                cur = await cn.execute('INSERT INTO dav_event (tabel, at, dir, obj, src, by_tabel) SELECT x.t, x.a, x.d, x.o, %s, %s FROM unnest(%s::text[], %s::timestamp[], %s::smallint[], %s::text[]) AS x(t, a, d, o) ON CONFLICT DO NOTHING',
                                       (src, u['tabel'], [v[0] for v in part], [v[1] for v in part], [v[2] for v in part], [v[3] for v in part]))
                ok += cur.rowcount
    dup = len(vals) - ok
    await audit(u['tabel'], 'turniket maʼlumoti yuklandi', '%s: %d yangi, %d takror, %d nomaʼlum tabel' % (src or 'fayl', ok, dup, len(unk)), req)
    return send(200, {'ok': ok, 'dup': dup, 'unknown': len(unk), 'unknownList': sorted(unk)[:30], 'bad': bad})


async def _can_edit(u: dict, c: dict, ts: list[str]) -> bool:
    return c['all'] or c['imp'] or all(t in c['vis'] for t in ts)


async def dav_assign(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    b = body_obj(await read_body(req, 200_000))
    ts = [clean_tabel(x) for x in (b.get('tabels') or []) if clean_tabel(x)]
    P = await org.people()
    ts = [t for t in dict.fromkeys(ts) if t in P]
    if not ts:
        return err(400, 'Xodim tanlanmagan')
    if not await _can_edit(u, c, ts):
        return err(403, 'Faqat oʻzingizga boʻysunuvchilarni')
    PT = await _patterns()
    pid = str(b.get('pattern') or '')
    if pid not in PT:
        return err(400, 'Grafik topilmadi')
    try:
        d1 = _day(b.get('from'))
        anchor = _day(b.get('anchor'), d1)
        d2 = _day(b.get('to')) if b.get('to') else None
    except ValueError:
        return err(400, 'Sana notoʻgʻri')
    if d2 and d2 < d1:
        return err(400, 'Tugash sanasi boshlanishidan oldin')
    async with db.conn() as cn:
        async with cn.transaction():
            for t in ts:
                if not d2:  # muddatsiz yangi grafik — eskisi shu kundan tugaydi
                    await cn.execute('UPDATE dav_assign SET dto = %s WHERE tabel = %s AND cancelled IS NULL AND dto IS NULL AND dfrom < %s', (d1 - dt.timedelta(days=1), t, d1))
                    await cn.execute('UPDATE dav_assign SET cancelled = now() WHERE tabel = %s AND cancelled IS NULL AND dto IS NULL AND dfrom >= %s', (t, d1))
                await cn.execute('INSERT INTO dav_assign (tabel, pattern, anchor, dfrom, dto, by_tabel) VALUES (%s, %s, %s, %s, %s, %s)', (t, pid, anchor, d1, d2, u['tabel']))
    await audit(u['tabel'], 'grafik biriktirildi', '%d kishi → %s (%s dan)' % (len(ts), PT[pid]['name'], d1), req)
    return send(200, {'ok': True, 'n': len(ts)})


async def dav_reason(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    b = body_obj(await read_body(req, 8_000))
    t = clean_tabel(b.get('tabel'))
    P = await org.people()
    if not t or t not in P:
        return err(400, 'Xodim topilmadi')
    if not await _can_edit(u, c, [t]):
        return err(403, 'Faqat oʻzingizga boʻysunuvchilarga')
    k = str(b.get('kind') or '')
    if k not in L.REASONS:
        return err(400, 'Sabab turi notoʻgʻri')
    try:
        d1 = _day(b.get('from'))
        d2 = _day(b.get('to'), d1)
    except ValueError:
        return err(400, 'Sana notoʻgʻri')
    if d2 < d1 or (d2 - d1).days > 366:
        return err(400, 'Muddat notoʻgʻri')
    r = await db.one('INSERT INTO dav_reason (tabel, kind, dfrom, dto, note, by_tabel) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id', t, k, d1, d2, clip(b.get('note'), 300), u['tabel'])
    await audit(u['tabel'], 'davomat sababi', '%s: %s %s–%s' % (t, L.REASONS[k], d1, d2), req)
    return send(200, {'ok': True, 'id': r['id']})


async def dav_reason_cancel(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    b = body_obj(await read_body(req, 2_000))
    try:
        rid = int(b.get('id'))
    except (TypeError, ValueError):
        return err(400, 'Notoʻgʻri')
    r = await db.one('SELECT * FROM dav_reason WHERE id = %s', rid)
    if not r:
        return err(404, 'Topilmadi')
    if not await _can_edit(u, c, [r['tabel']]):
        return err(403, 'Ruxsat yoʻq')
    await db.run('UPDATE dav_reason SET cancelled = now() WHERE id = %s AND cancelled IS NULL', rid)
    await audit(u['tabel'], 'davomat sababi bekor qilindi', '%s: %s' % (r['tabel'], r['kind']), req)
    return send(200, {'ok': True})


async def dav_reasons(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not c['all'] and not c['vis']:
        return err(403, 'Ruxsat yoʻq')
    try:
        day = _day(req.query_params.get('d'))
    except ValueError:
        return err(400, 'Sana notoʻgʻri')
    P = await org.people()
    N = org.names()
    ts = sorted(t for t in c['vis'] if t in P)
    R = await _reasons(ts, day, day)
    out = [_pub(P[t], N) | {'id': r['id'], 'kind': r['kind'], 'rname': L.REASONS.get(r['kind'], r['kind']), 'from': r['dfrom'].isoformat(), 'to': r['dto'].isoformat(), 'note': r['note'] or ''}
           for t, L_ in R.items() for r in L_]
    out.sort(key=lambda x: (x['kind'], x['name']))
    return send(200, {'date': day.isoformat(), 'list': out})


async def dav_pattern(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not (c['imp'] or c['all']):
        return err(403, 'Grafikni SVO yoki rahbariyat tuzadi')
    b = body_obj(await read_body(req, 4_000))
    name = clip(b.get('name'), 80)
    cyc = L.valid_cycle(b.get('cycle'))
    if not name or not cyc:
        return err(400, 'Nomi va kunlar ketma-ketligi (D, N, I, W, V) kerak')
    pid = 'p' + dt.datetime.now().strftime('%y%m%d%H%M%S')
    await db.run('INSERT INTO dav_pattern (id, name, cycle, by_tabel) VALUES (%s, %s, %s, %s)', pid, name, json.dumps(cyc), u['tabel'])
    await audit(u['tabel'], 'yangi smena grafigi', '%s: %s' % (name, ''.join(cyc)), req)
    return send(200, {'ok': True, 'id': pid})


async def dav_objects(req: Request, u: dict) -> Response:
    c = await _ctx(u)
    if not c['all'] and not c['imp']:
        return err(403, 'Ruxsat yoʻq')
    now = dt.datetime.now()
    rows = await db.all_('SELECT obj, max(at) AS last, count(*)::int AS n FROM dav_event WHERE at >= %s GROUP BY obj', now - dt.timedelta(days=1))
    R = {r['obj']: r for r in rows}
    out = []
    for o in OBJECTS + sorted(k for k in R if k not in OBJECTS and k):
        r = R.get(o)
        out.append({'obj': o, 'last': r and r['last'].isoformat(timespec='minutes'), 'n24': r['n'] if r else 0})
    return send(200, {'list': out, 'now': now.isoformat(timespec='minutes')})
