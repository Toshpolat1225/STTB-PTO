"""Smenadagi xodimlar joylashuvi (faqat xotirada), bosib oʻtilgan yoʻl, manzil aniqlash va OCR."""
from __future__ import annotations

import asyncio
import datetime as dt
import json
import logging
import math
import os
import re
import secrets
import shutil
import tempfile
import time

from starlette.requests import Request
from starlette.responses import Response

from app.core import database as db
from app.services import geo
from app.core.permissions import sees_all_positions
from app.core.config import settings
from app.core.audit import audit
from app.core.utils import clean_tabel, clip, js_str
from app.core.http_utils import TooBig, body_obj, err, read_body, read_raw, send

log = logging.getLogger('agmk')
POS: dict[str, dict] = {}
TRAIL: dict[str, list] = {}
POS_TTL = 12 * 3600 * 1000


def _f(v) -> float:
    """JavaScript +v (NaN — math.nan)."""
    if isinstance(v, bool):
        return float(v)
    if v is None:
        return math.nan
    try:
        return float(v) if not isinstance(v, str) or v.strip() else 0.0
    except (TypeError, ValueError):
        return math.nan


def _fin(x: float) -> bool:
    return not (math.isnan(x) or math.isinf(x))


def _r(x: float) -> int:
    return int(math.floor(x + 0.5))


def _fx6(x: float) -> float:
    return float('%.6f' % x)


def _num(x, a, z):
    x = _f(x)
    return _r(x) if _fin(x) and a <= x <= z else None


# ------------------------------------------------------------------ jonli joylashuv
async def pos_trail(req: Request, u: dict) -> Response:
    t = clean_tabel(req.query_params.get('tabel'))
    if not await sees_all_positions(u) and t != u['tabel']:
        return err(403, 'Ruxsat yoʻq')
    return send(200, TRAIL.get(t) or [])


async def pos(req: Request, u: dict) -> Response | None:
    now = time.time() * 1000
    for k in [k for k, v in POS.items() if now - v['t'] > POS_TTL]:
        POS.pop(k, None)
        TRAIL.pop(k, None)
    if req.method == 'POST':
        b = body_obj(await read_body(req, 60_000))
        lat, lon = _f(b.get('lat')), _f(b.get('lon'))
        if b.get('off'):  # smena topshirildi — joylashuv va iz darhol oʻchiriladi
            POS.pop(u['tabel'], None)
            TRAIL.pop(u['tabel'], None)
            return send(200, {'ok': True})
        if not _fin(lat) or not _fin(lon) or abs(lat) > 90 or abs(lon) > 180:
            return err(400, "Joylashuv noto'g'ri")
        acc = _f(b.get('acc'))
        acc = min(9999, _r(acc)) if _fin(acc) and acc else 0
        POS[u['tabel']] = {'tabel': u['tabel'], 'name': clip(u.get('name'), 120), 'lat': _fx6(lat), 'lon': _fx6(lon), 'acc': acc, 'unit': clip(b.get('unit'), 120),
                           'uid': clip(b.get('uid'), 40), 'sos': clip(b.get('sos'), 2), 'spd': _num(b.get('spd'), 0, 250), 'brg': _num(b.get('brg'), 0, 360),
                           'lav': clip(b.get('lav'), 120), 'model': clip(b.get('model'), 80), 'kind': clip(b.get('kind'), 8), 'bat': _num(b.get('bat'), 0, 100),
                           'chg': 1 if b.get('chg') else 0, 'gps': 0 if b.get('gps') == 0 else 1, 'ft': _num(b.get('ft'), 0, 4e12), 't': now}
        T = TRAIL.get(u['tabel']) or []
        P = []
        for x in (b.get('pts') if isinstance(b.get('pts'), list) else [])[:600]:
            if not isinstance(x, list) or len(x) < 3:
                continue
            x0, x1, x2 = _f(x[0]), _f(x[1]), _f(x[2])
            if not _fin(x0) or not abs(x1) <= 90 or not abs(x2) <= 180:
                continue
            x3 = _f(x[3]) if len(x) > 3 else math.nan
            x4 = _f(x[4]) if len(x) > 4 else math.nan
            P.append([_r(x0), _fx6(x1), _fx6(x2), min(9999, _r(x3) if _fin(x3) and x3 else 0), _r(x4) if _fin(x4) and x4 >= 0 else -1])
        if not P:
            spd = _num(b.get('spd'), 0, 250)
            P.append([_r(now / 1000), _fx6(lat), _fx6(lon), acc, -1 if spd is None else spd])
        seen = {x[0] for x in T}
        for x in P:
            if x[0] not in seen:
                T.append(x)
                seen.add(x[0])
        T.sort(key=lambda x: x[0])
        lim = _r(now / 1000) - 12 * 3600
        while T and (len(T) > 3000 or T[0][0] < lim):
            T.pop(0)
        TRAIL[u['tabel']] = T  # oflayn yigʻilgan nuqtalar ham vaqt tartibida
        return send(200, {'ok': True})
    if req.method == 'GET':
        all_ = await sees_all_positions(u)
        return send(200, [dict(v, ago=_r((now - v['t']) / 1000)) for v in POS.values() if all_ or v['tabel'] == u['tabel']])
    return None


# ------------------------------------------------------------------ bosib oʻtilgan yoʻl (kun boʻyicha; AGMK_TRK_DAYS kundan keyin oʻchiriladi)
async def trk(req: Request, u: dict) -> Response | None:
    if req.method == 'POST':
        b = body_obj(await read_body(req, 400_000))
        uid = clip(b.get('uid'), 40)
        day = js_str(b.get('day') or '')[:10]
        if not uid or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day):
            return err(400, "Ma'lumot noto'g'ri")
        P = []
        for x in (b.get('pts') if isinstance(b.get('pts'), list) else [])[:2000]:
            if not isinstance(x, list) or len(x) < 3:
                continue
            x0, x1, x2 = _f(x[0]), _f(x[1]), _f(x[2])
            if not _fin(x0) or not abs(x1) <= 90 or not abs(x2) <= 180:
                continue
            x3 = _f(x[3]) if len(x) > 3 else math.nan
            P.append([_r(x0), _fx6(x1), _fx6(x2), min(999, _r(x3) if _fin(x3) and x3 else 0)])
        if not P:
            return send(200, {'ok': True, 'n': 0})
        async with db.conn() as c:
            async with c.transaction():
                cur = await (await c.execute('SELECT pts::text AS p FROM trk WHERE tabel = %s AND uid = %s AND day = %s FOR UPDATE', (u['tabel'], uid, day))).fetchone()
                allp = (json.loads(cur['p']) if cur else []) + P
                if len(allp) > 20000:
                    allp = allp[-20000:]
                await c.execute('INSERT INTO trk (tabel, uid, day, unit, pts, upd) VALUES (%s, %s, %s, %s, %s::json, %s) '
                                'ON CONFLICT (tabel, uid, day) DO UPDATE SET unit = excluded.unit, pts = excluded.pts, upd = excluded.upd',
                                (u['tabel'], uid, day, clip(b.get('unit'), 120), json.dumps(allp, separators=(',', ':')), int(time.time() * 1000)))
        return send(200, {'ok': True, 'n': len(allp)})
    if req.method == 'GET':
        q = req.query_params
        uid, day, t = q.get('uid'), (q.get('day') or '')[:10], q.get('tabel')
        all_ = await sees_all_positions(u)
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day):
            return err(400, 'Kun koʻrsatilmagan')
        if uid:
            rows = await db.all_('SELECT tabel, uid, day, unit, pts::text AS pts FROM trk WHERE uid = %s AND day = %s', str(uid), day)
        else:
            rows = await db.all_('SELECT tabel, uid, day, unit, pts::text AS pts FROM trk WHERE tabel = %s AND day = %s', str(t or u['tabel']), day)
        if not all_:
            rows = [r for r in rows if r['tabel'] == u['tabel']]
        return send(200, [{'tabel': r['tabel'], 'uid': r['uid'], 'day': r['day'].isoformat() if isinstance(r['day'], dt.date) else r['day'], 'unit': r['unit'], 'pts': json.loads(r['pts'])} for r in rows])
    return None


async def trk_clean() -> None:
    d = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=settings.trk_days)).date().isoformat()
    await db.run('DELETE FROM trk WHERE day < %s', d)


# ------------------------------------------------------------------ manzil (teskari geokodlash)
async def geo_rev_get(req: Request, u: dict) -> Response:
    la, lo = _f(req.query_params.get('lat')), _f(req.query_params.get('lon'))
    if not _fin(la) or not _fin(lo) or abs(la) > 90 or abs(lo) > 180:
        return err(400, 'Joylashuv notoʻgʻri')
    return send(200, await asyncio.to_thread(geo.rev, settings.paket_dir, la, lo))


async def geo_rev_post(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 200_000))
    L = (b.get('pts') if isinstance(b.get('pts'), list) else [])[:300]

    def work():
        out = []
        for x in L:
            if isinstance(x, list) and len(x) >= 2 and _fin(_f(x[0])) and _fin(_f(x[1])):
                out.append(geo.rev(settings.paket_dir, _f(x[0]), _f(x[1])).get('t') or '')
            else:
                out.append('')
        return out
    return send(200, await asyncio.to_thread(work))


async def geo_info(req: Request, u: dict) -> Response:
    return send(200, await asyncio.to_thread(geo.info, settings.paket_dir))


# ------------------------------------------------------------------ OCR (Tesseract — serverning oʻzida, internetga hech narsa ketmaydi)
_OCR: dict = {'at': 0, 'bin': None, 'langs': []}
_OCR_BUSY = 0


async def _ocr_run(binp: str, args: list[str], timeout: float) -> str:
    env = dict(os.environ, OMP_THREAD_LIMIT='2')
    p = await asyncio.create_subprocess_exec(binp, *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, env=env)
    try:
        out, se = await asyncio.wait_for(p.communicate(), timeout)
    except asyncio.TimeoutError:
        p.kill()
        raise RuntimeError('vaqt tugadi')
    if p.returncode:
        raise RuntimeError((se.decode(errors='replace').strip().split('\n') or [''])[-1])
    return out.decode('utf8', errors='replace')


async def ocr_info() -> dict:
    if _OCR['at'] and time.time() - _OCR['at'] < (3600 if _OCR['bin'] else 60):
        return _OCR
    for b in [x for x in (settings.tesseract, shutil.which('tesseract')) if x]:
        try:
            out = await _ocr_run(b, ['--list-langs'], 15)
            langs = [x.strip() for x in out.splitlines() if re.fullmatch(r'[a-z_]+', x.strip(), re.I) and x.strip() != 'osd']
            _OCR.update(at=time.time(), bin=b, langs=langs)
            return _OCR
        except Exception:  # noqa: BLE001
            continue
    _OCR.update(at=time.time(), bin=None, langs=[])
    return _OCR


def ocr_parse(tsv: str) -> dict:
    """Tesseract TSV → qatorlar va soʻzlar (ishonch darajasi bilan)."""
    L: dict[str, dict] = {}
    W = H = 0
    for r in tsv.splitlines()[1:]:
        c = r.split('\t')
        if len(c) < 12:
            continue
        lv = int(float(c[0] or 0))
        if lv == 1:
            W, H = int(float(c[8])), int(float(c[9]))
            continue
        if lv != 5:
            continue
        s = '\t'.join(c[11:])
        if not s.strip():
            continue
        k = c[2] + '.' + c[3] + '.' + c[4]
        ln = L.setdefault(k, {'b': int(c[2]), 'p': int(c[3]), 'words': []})
        ln['words'].append({'s': s, 'c': _r(float(c[10])), 'x': int(c[6]), 'y': int(c[7]), 'w': int(c[8]), 'h': int(c[9])})
    lines = []
    for ln in L.values():
        ws = ln['words']
        x, y = min(w['x'] for w in ws), min(w['y'] for w in ws)
        x2, y2 = max(w['x'] + w['w'] for w in ws), max(w['y'] + w['h'] for w in ws)
        lines.append({'b': ln['b'], 'p': ln['p'], 'x': x, 'y': y, 'w': x2 - x, 'h': y2 - y, 'words': ws})
    return {'w': W, 'h': H, 'lines': lines}


async def ocr_get(req: Request, u: dict) -> Response:
    o = await ocr_info()
    return send(200, {'ok': bool(o['bin']), 'langs': o['langs']})


async def ocr_post(req: Request, u: dict) -> Response:
    global _OCR_BUSY
    o = await ocr_info()
    if not o['bin']:
        return err(503, 'Serverda Tesseract-OCR oʻrnatilmagan (oʻrnatish yoʻriqnomasi — «OCR» boʻlimi)')
    if _OCR_BUSY >= 2:
        return err(429, 'Server hozir boshqa hujjatni oʻqiyapti — bir daqiqadan soʻng qayta urinib koʻring')
    try:
        buf = await read_raw(req, 12_000_000)
    except TooBig:
        return err(413, 'Rasm juda katta')
    if not (len(buf) > 100 and buf[0] == 0xff and buf[1] == 0xd8) and not (len(buf) > 1 and buf[0] == 0x89 and buf[1] == 0x50):
        return err(400, 'Faqat JPEG yoki PNG rasm')
    want = [x for x in (req.query_params.get('l') or 'uzb+uzb_cyrl+rus+eng').split('+') if x in o['langs']]
    langs = '+'.join(want or [x for x in o['langs'] if x in ('uzb', 'uzb_cyrl', 'rus', 'eng')]) or 'eng'
    f = os.path.join(tempfile.gettempdir(), 'agmk_ocr_' + secrets.token_hex(6) + ('.jpg' if buf[0] == 0xff else '.png'))
    _OCR_BUSY += 1
    try:
        with open(f, 'wb') as fh:
            fh.write(buf)
        psm = '6' if req.query_params.get('psm') == '6' else '3'
        tsv = await _ocr_run(o['bin'], [f, 'stdout', '-l', langs, '--psm', psm, 'tsv'], 90)
        await audit(u['tabel'], 'hujjat rasmi matnga oʻgirildi (OCR)', langs, req)
        return send(200, {'langs': langs, **ocr_parse(tsv)})
    except Exception as e:  # noqa: BLE001
        return err(500, 'OCR xatosi: ' + str(e)[:200])
    finally:
        _OCR_BUSY -= 1
        try:
            os.unlink(f)
        except OSError:
            pass
