"""3.18: «Mening hodimlarim» (qoʻl ostidagilar, qisqa pasport, qoʻlda biriktirish), kadrlar Excel importi va maxsus kiyim.

Shaxsiy maʼlumot (tugʻilgan sana, manzil, telefon, taʼtil oyi) faqat serverda saqlanadi va faqat:
oʻzi, uning rahbarlari (tuzilma boʻyicha yoki qoʻlda biriktirilgan), kadrlar / rahbariyat / «okl» va administratorga beriladi.
"""
from __future__ import annotations

import datetime as dt
import json
import re

from starlette.requests import Request
from starlette.responses import Response

from app.core import database as db
from app.services import org
from app.core.permissions import PD_ROLES, can_role
from app.core.audit import audit
from app.core.utils import clean_tabel, clip, iso
from app.core.http_utils import body_obj, err, read_body, send

ALL_ROLES = ['rahbar', 'kadr']          # butun korxona «mening hodimlarim» da
KIY_EDIT = ['ombor']                     # maxsus kiyim beradi (ombor)
KIY_VIEW = ['ombor', 'mm', 'rahbar', 'kadr']
HR_ROLES = ['kadr']


def _date(v, field: str, required: bool = False) -> dt.date | None:
    s = str(v or '').strip()[:10]
    if not s:
        if required:
            raise ValueError(field + ' kiritilmagan')
        return None
    try:
        d = dt.date.fromisoformat(s)
    except ValueError as e:
        raise ValueError(field + ' notoʻgʻri: ' + s) from e
    if not (1900 <= d.year <= 2100):
        raise ValueError(field + ' notoʻgʻri: ' + s)
    return d


async def _sees_all(u: dict) -> bool:
    return await can_role(u, ALL_ROLES)


async def _vis(u: dict) -> dict[str, dict]:
    return await org.visible(u['tabel'], await _sees_all(u))


def _pub(x: dict, N: dict) -> dict:
    return {'tabel': x['tabel'], 'name': x['name'], 'lav': x['lav'], 'unit': x.get('unit'), 'unitN': N['u'].get(x.get('unit')) or '', 'grp': x.get('grp'),
            'grpN': N['g'].get(x.get('grp')) or '', 'uch': x.get('uch') or '', 'rank': x['rank'], 'itr': x['itr'], 'pos': x.get('pos')}


async def _issues(tabels: list[str]) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    if not tabels:
        return out
    for r in await db.all_('SELECT * FROM kiy_issue WHERE tabel = ANY(%s) ORDER BY issued, id', tabels):
        out.setdefault(r['tabel'], []).append(r)
    return out


async def _persons(tabels: list[str]) -> dict[str, dict]:
    if not tabels:
        return {}
    return {r['tabel']: r for r in await db.all_('SELECT * FROM kiy_person WHERE tabel = ANY(%s)', tabels)}


# ------------------------------------------------------------------ Mening hodimlarim
async def my_list(req: Request, u: dict) -> Response:
    P = await org.people()
    N = org.names()
    V = await _vis(u)
    ts = [t for t in V if t in P]
    ISS = await _issues(ts)
    K = await _persons(ts)
    out = []
    for t in ts:
        x = P[t]
        pl = org.kiy_plan(x, K.get(t), ISS.get(t, []))
        o = _pub(x, N)
        o.update({'via': V[t]['via'], 'rel': V[t].get('rel'), 'kiy': {'due': pl['due'], 'soon': pl['soon']}})
        out.append(o)
    out.sort(key=lambda o: (o['rank'], o['unitN'], o['grpN'], o['lav'], o['name']))
    me = P.get(u['tabel'])
    rels = [org.rel_view(r) | {'cancelled': iso(r['cancelled']), 'name': (P.get(r['tabel']) or {}).get('name', '')}
            for r in await db.all_('SELECT * FROM my_rel WHERE boss = %s AND (cancelled IS NULL OR cancelled > now() - interval \'30 days\') ORDER BY id DESC LIMIT 200', u['tabel'])]
    return send(200, {'me': _pub(me, N) if me else {'tabel': u['tabel'], 'name': u.get('name') or '', 'lav': u.get('lavozim') or '', 'rank': 6},
                      'all': await _sees_all(u), 'n': len(out), 'list': out, 'rels': rels,
                      'can': {'hr': await can_role(u, HR_ROLES), 'ombor': await can_role(u, KIY_EDIT), 'kiy': await can_role(u, KIY_VIEW)}})


async def _can_pd(u: dict, t: str) -> bool:
    if t == u['tabel'] or await can_role(u, PD_ROLES):
        return True
    return t in await _vis(u)


async def my_passport(req: Request, u: dict) -> Response:
    t = clean_tabel(req.query_params.get('t'))
    P = await org.people()
    x = P.get(t)
    if not x:
        return err(404, 'Xodim topilmadi')
    if not await _can_pd(u, t):
        await audit(u['tabel'], 'hodim pasporti: ruxsat yoʻq', t, req)
        return err(403, 'Bu xodim sizga boʻysunmaydi')
    N = org.names()
    o = _pub(x, N)
    h = await db.one('SELECT * FROM hr_pd WHERE tabel = %s', t)
    birth = h['birth'].isoformat() if h and h['birth'] else None
    if not birth:  # ilovadagi kartochkadan (kadrlar kiritgan boʻlsa)
        try:
            r = await db.one("SELECT data::text AS d FROM records WHERE id = %s AND deleted = false", 'x:' + t)
            d = json.loads(r['d']) if r else {}
            b = str((d or {}).get('birthDate') or '')[:10]
            birth = b if re.fullmatch(r'\d{4}-\d\d-\d\d', b) else None
        except Exception:  # noqa: BLE001
            pass
    o.update({'birth': birth, 'phone': h['phone'] if h else None, 'address': h['address'] if h else None, 'tatil': h['tatil'] if h else None,
              'razryad': (h['razryad'] if h and h['razryad'] else None) or x.get('razryad'), 'hrAt': iso(h['at']) if h else None})
    ISS = await _issues([t])
    K = await _persons([t])
    o['kiy'] = org.kiy_plan(x, K.get(t), ISS.get(t, []))
    if t != u['tabel']:
        await audit(u['tabel'], 'hodim pasportini koʻrdi', t, req)
    return send(200, o)


# ------------------------------------------------------------------ 4.9 b119: tugʻilgan kunlar (bugun / ertaga)
# Tugʻilgan sana serverdan chiqmaydi: javobda faqat «bugun» / «ertaga» belgisi va ochiq maʼlumot (ism, lavozim, boʻlinma).
# Har bir rahbar — oʻziga boʻysunuvchilar (tuzilma + qoʻlda biriktirilganlar); administrator, kadrlar, rahbariyat — hamma (all).
def _tk_md(d: dt.date, y: int) -> dt.date:
    try:
        return d.replace(year=y)
    except ValueError:  # 29-fevral — kabisa boʻlmagan yilda 28-fevral
        return dt.date(y, 2, 28)


async def _births(ts: set[str]) -> dict[str, dt.date]:
    out: dict[str, dt.date] = {}
    if not ts:
        return out
    try:
        for r in await db.all_("SELECT id, data->>'birthDate' AS b FROM records WHERE kind = 'xodim' AND deleted = false AND left(id, 2) = 'x:' AND data->>'birthDate' IS NOT NULL"):
            t = str(r['id'])[2:]
            if t in ts:
                try:
                    out[t] = _date(r['b'], 'b')
                except ValueError:
                    pass
    except Exception:  # noqa: BLE001
        pass
    for r in await db.all_('SELECT tabel, birth FROM hr_pd WHERE birth IS NOT NULL AND tabel = ANY(%s)', list(ts)):
        out[r['tabel']] = r['birth']  # kadrlar (hr_pd) ustun
    return {t: d for t, d in out.items() if d}


async def my_tel(req: Request, u: dict) -> Response:
    """6.1: xodim pasportidagi «📞 Qoʻngʻiroq» — telefon raqami faqat bosilganda, faqat vakolatlilarga (oʻzi, kadrlar,
    rahbariyat, oklad roli, admin, oʻz boʻysunuvchilari). Raqam ilova faylida saqlanmaydi; har soʻrov audit jurnaliga yoziladi."""
    t = clean_tabel(req.query_params.get('t'))
    if not re.fullmatch(r'\d{1,12}', t or ''):
        return err(400, 'Tabel notoʻgʻri')
    if not await _can_pd(u, t):
        await audit(u['tabel'], 'telefon: ruxsat yoʻq', t, req)
        return err(403, 'Bu xodimning raqamini koʻrishga ruxsat yoʻq')
    h = await db.one('SELECT phone FROM hr_pd WHERE tabel = %s', t)
    raw = str((h or {}).get('phone') or '')
    out = []
    for p in re.split(r'[,;/\n]+', raw):
        d = re.sub(r'\D', '', p)
        if len(d) == 9:
            d = '998' + d
        if len(d) >= 9 and ('+' + d) not in out:
            out.append('+' + d)
    await audit(u['tabel'], 'telefon: koʻrildi', t, req)
    return send(200, {'tabel': t, 'phones': out[:5]})


async def my_tk(req: Request, u: dict) -> Response:
    P = await org.people()
    N = org.names()
    allv = await _sees_all(u)
    mine = set(await org.visible(u['tabel'], False))
    ts = (set(P) if allv else mine) - {u['tabel']}
    B = await _births(ts)
    t0 = dt.date.today()
    t1 = t0 + dt.timedelta(days=1)
    out = []
    for t, b in B.items():
        if t not in P:
            continue
        k = 'bugun' if _tk_md(b, t0.year) == t0 else 'ertaga' if _tk_md(b, t1.year) == t1 else ''
        if k:
            out.append(_pub(P[t], N) | {'kun': k, 'mine': t in mine})
    out.sort(key=lambda o: (o['kun'] != 'bugun', o['rank'], o['unitN'], o['name']))
    return send(200, {'date': t0.isoformat(), 'all': allv, 'list': out})


async def my_find(req: Request, u: dict) -> Response:
    q = org._n(req.query_params.get('q'))
    if len(q) < 2:
        return send(200, [])
    P = await org.people()
    N = org.names()
    out = [_pub(x, N) for t, x in P.items() if q in t or q in org._n(x['name'])][:30]
    return send(200, out)


async def my_rel(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 8_000))
    boss = clean_tabel(b.get('boss')) or u['tabel']
    t = clean_tabel(b.get('tabel'))
    op = 'del' if b.get('op') == 'del' else 'add'
    why = clip(b.get('why'), 300)
    P = await org.people()
    if not t or t not in P:
        return err(400, 'Xodim topilmadi')
    if boss not in P and boss != u['tabel']:
        return err(400, 'Rahbar topilmadi')
    if t == boss:
        return err(400, 'Oʻzini oʻziga biriktirib boʻlmaydi')
    if not why:
        return err(400, 'Sababini yozing (komandirovka, prikaz № va h.k.)')
    try:
        d1 = _date(b.get('from'), 'Boshlanish sanasi') or dt.date.today()
        d2 = _date(b.get('to'), 'Tugash sanasi')
    except ValueError as e:
        return err(400, str(e))
    if d2 and d2 < d1:
        return err(400, 'Tugash sanasi boshlanishidan oldin')
    if boss != u['tabel'] and not await _sees_all(u) and boss not in await _vis(u):
        return err(403, 'Faqat oʻzingizga yoki oʻzingizga boʻysunuvchi rahbarga biriktira olasiz')
    r = await db.one('INSERT INTO my_rel (boss, tabel, op, why, dfrom, dto, by_tabel) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *', boss, t, op, why, d1, d2, u['tabel'])
    await audit(u['tabel'], 'hodim biriktirildi' if op == 'add' else 'hodim roʻyxatdan olindi', '%s → %s (%s)' % (t, boss, why[:80]), req)
    return send(200, {'ok': True, 'rel': org.rel_view(r)})


async def my_rel_cancel(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 4_000))
    try:
        rid = int(b.get('id'))
    except (TypeError, ValueError):
        return err(400, 'Notoʻgʻri')
    r = await db.one('SELECT * FROM my_rel WHERE id = %s', rid)
    if not r:
        return err(404, 'Topilmadi')
    if u['tabel'] not in (r['boss'], r['by_tabel']) and not await _sees_all(u):
        return err(403, 'Faqat biriktirgan rahbar, kadrlar yoki administrator')
    await db.run('UPDATE my_rel SET cancelled = now(), cancel_by = %s WHERE id = %s AND cancelled IS NULL', u['tabel'], rid)
    await audit(u['tabel'], 'biriktirish bekor qilindi', '%s → %s' % (r['tabel'], r['boss']), req)
    return send(200, {'ok': True})


# ------------------------------------------------------------------ kadrlar (1C) Excel importi
async def hr_import(req: Request, u: dict) -> Response:
    if not await can_role(u, HR_ROLES):
        return err(403, 'Faqat kadrlar boʻlimi yoki administrator')
    b = body_obj(await read_body(req, 5_000_000))
    rows = b.get('rows') if isinstance(b.get('rows'), list) else []
    if not rows or len(rows) > 20000:
        return err(400, 'Qatorlar yoʻq')
    src = clip(b.get('src'), 160)
    P = await org.people()
    n = 0
    unknown, bad = [], []
    async with db.conn() as c:
        async with c.transaction():
            for x in rows:
                x = x if isinstance(x, dict) else {}
                t = clean_tabel(x.get('tabel'))
                if not re.fullmatch(r'\d{1,12}', t):
                    continue
                try:
                    birth = _date(x.get('birth'), 'Tugʻilgan sana')
                except ValueError:
                    birth = None
                    bad.append(t)
                try:
                    tatil = int(x['tatil']) if x.get('tatil') not in (None, '') else None
                    tatil = tatil if tatil and 1 <= tatil <= 12 else None
                except (TypeError, ValueError):
                    tatil = None
                try:
                    rz = int(float(x['razryad'])) if x.get('razryad') not in (None, '') else None
                    rz = rz if rz and 0 < rz <= 30 else None
                except (TypeError, ValueError):
                    rz = None
                phone = clip(x.get('phone'), 60) or None
                addr = clip(x.get('address'), 300) or None
                if not any([birth, tatil, rz, phone, addr]):
                    continue
                await c.execute('INSERT INTO hr_pd (tabel, birth, phone, address, tatil, razryad, src, at, by_tabel) VALUES (%s, %s, %s, %s, %s, %s, %s, now(), %s) '
                                'ON CONFLICT (tabel) DO UPDATE SET birth = COALESCE(excluded.birth, hr_pd.birth), phone = COALESCE(excluded.phone, hr_pd.phone), '
                                'address = COALESCE(excluded.address, hr_pd.address), tatil = COALESCE(excluded.tatil, hr_pd.tatil), razryad = COALESCE(excluded.razryad, hr_pd.razryad), '
                                'src = excluded.src, at = now(), by_tabel = excluded.by_tabel', (t, birth, phone, addr, tatil, rz, src, u['tabel']))
                n += 1
                if t not in P:
                    unknown.append(t)
    await audit(u['tabel'], 'kadrlar maʼlumoti import qilindi', '%d ta · %s' % (n, src), req)
    return send(200, {'ok': True, 'n': n, 'unknown': unknown[:50], 'nUnknown': len(unknown), 'badDate': bad[:50]})


# ------------------------------------------------------------------ maxsus kiyim
async def kiy_norma(req: Request, u: dict) -> Response:
    return send(200, {'katalog': org.NORMA['katalog'], 'guruhlar': [{'id': g['id'], 'nom': g['nom'], 'band': g.get('band'), 'qator': g['qator']} for g in org.NORMA['guruhlar']],
                      'qoidalar': org.NORMA['qoidalar'], 'versiya': org.NORMA.get('versiya'), 'manba': org.NORMA.get('manba')})


async def _kiy_can_view(u: dict, t: str) -> bool:
    return t == u['tabel'] or await can_role(u, KIY_VIEW) or t in await _vis(u)


def _iss_view(r: dict, P: dict) -> dict:
    return {'id': r['id'], 'b': r['item'], 'nom': (org.KAT.get(r['item']) or {}).get('nom', r['item']), 'qty': r['qty'], 'size': r['size'], 'date': r['issued'].isoformat(),
            'note': r['note'], 'by': r['by_tabel'], 'byN': (P.get(r['by_tabel']) or {}).get('name', ''), 'ack': iso(r['ack_at']), 'cancelled': iso(r['cancelled']), 'cancelWhy': r['cancel_why']}


async def kiy_person(req: Request, u: dict) -> Response:
    t = clean_tabel(req.query_params.get('t')) or u['tabel']
    P = await org.people()
    x = P.get(t)
    if not x:
        return err(404, 'Xodim topilmadi')
    if not await _kiy_can_view(u, t):
        return err(403, 'Bu xodimning maxsus kiyimini koʻrishga ruxsat yoʻq')
    IL = (await _issues([t])).get(t, [])
    K = (await _persons([t])).get(t)
    ed = await can_role(u, KIY_EDIT)
    return send(200, {'person': _pub(x, org.names()), 'plan': org.kiy_plan(x, K, IL), 'hist': [_iss_view(r, P) for r in reversed(IL)],
                      'size': {k: (K or {}).get(k) or '' for k in ('boy', 'kiyim', 'poyabzal', 'bosh')},
                      'can': {'issue': ed, 'size': ed or t == u['tabel'], 'grp': ed or await can_role(u, ['mm']), 'ack': t == u['tabel']},
                      'grps': [{'id': g['id'], 'nom': g['nom']} for g in org.NORMA['guruhlar']]})


async def kiy_issue(req: Request, u: dict) -> Response:
    if not await can_role(u, KIY_EDIT):
        return err(403, 'Maxsus kiyimni faqat ombor (kiyim beruvchi) kiritadi')
    b = body_obj(await read_body(req, 20_000))
    t = clean_tabel(b.get('tabel'))
    P = await org.people()
    if t not in P:
        return err(400, 'Xodim topilmadi')
    try:
        d = _date(b.get('date'), 'Berilgan sana') or dt.date.today()
    except ValueError as e:
        return err(400, str(e))
    if d > dt.date.today() + dt.timedelta(days=1):
        return err(400, 'Berilgan sana kelajakda boʻlishi mumkin emas')
    items = b.get('items') if isinstance(b.get('items'), list) else []
    items = [i for i in items if isinstance(i, dict) and i.get('b') in org.KAT][:30]
    if not items:
        return err(400, 'Hech qanday buyum tanlanmagan')
    note = clip(b.get('note'), 300) or None
    ids = []
    async with db.conn() as c:
        async with c.transaction():
            for i in items:
                try:
                    q = max(1, min(20, int(i.get('qty') or 1)))
                except (TypeError, ValueError):
                    q = 1
                r = await (await c.execute('INSERT INTO kiy_issue (tabel, item, qty, size, issued, note, by_tabel) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id',
                                           (t, i['b'], q, clip(i.get('size'), 20) or None, d, note, u['tabel']))).fetchone()
                ids.append(r['id'])
    await audit(u['tabel'], 'maxsus kiyim berildi', '%s · %s' % (t, ', '.join(i['b'] for i in items)), req)
    return send(200, {'ok': True, 'ids': ids})


async def kiy_cancel(req: Request, u: dict) -> Response:
    if not await can_role(u, KIY_EDIT):
        return err(403, 'Faqat ombor yoki administrator')
    b = body_obj(await read_body(req, 4_000))
    why = clip(b.get('why'), 200)
    if not why:
        return err(400, 'Bekor qilish sababini yozing')
    try:
        rid = int(b.get('id'))
    except (TypeError, ValueError):
        return err(400, 'Notoʻgʻri')
    n = await db.run('UPDATE kiy_issue SET cancelled = now(), cancel_by = %s, cancel_why = %s WHERE id = %s AND cancelled IS NULL', u['tabel'], why, rid)
    if not n:
        return err(404, 'Topilmadi')
    await audit(u['tabel'], 'maxsus kiyim yozuvi bekor qilindi', '#%d · %s' % (rid, why), req)
    return send(200, {'ok': True})


async def kiy_ack(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 4_000))
    ids = [int(x) for x in (b.get('ids') if isinstance(b.get('ids'), list) else [b.get('id')]) if str(x or '').isdigit()][:50]
    if not ids:
        return err(400, 'Notoʻgʻri')
    n = await db.run('UPDATE kiy_issue SET ack_at = now() WHERE id = ANY(%s) AND tabel = %s AND ack_at IS NULL AND cancelled IS NULL', ids, u['tabel'])
    await audit(u['tabel'], 'maxsus kiyimni olganini tasdiqladi', '%d ta' % n, req)
    return send(200, {'ok': True, 'n': n})


async def kiy_person_set(req: Request, u: dict) -> Response:
    b = body_obj(await read_body(req, 6_000))
    t = clean_tabel(b.get('tabel')) or u['tabel']
    P = await org.people()
    if t not in P:
        return err(400, 'Xodim topilmadi')
    ed = await can_role(u, KIY_EDIT)
    can_grp = ed or await can_role(u, ['mm'])
    if not (ed or t == u['tabel'] or can_grp):
        return err(403, 'Ruxsat yoʻq')
    cur = await db.one('SELECT * FROM kiy_person WHERE tabel = %s', t) or {}
    v = {k: cur.get(k) for k in ('boy', 'kiyim', 'poyabzal', 'bosh', 'grp', 'shart')}
    if ed or t == u['tabel']:
        for k in ('boy', 'kiyim', 'poyabzal', 'bosh'):
            if k in b:
                v[k] = clip(b.get(k), 20) or None
    if can_grp:
        if 'grp' in b:
            g = str(b.get('grp') or '')
            v['grp'] = g if g in org.GRP else None
        if 'shart' in b and isinstance(b.get('shart'), list):
            v['shart'] = [str(s)[:30] for s in b['shart'][:10]]
    shart = v.get('shart')
    await db.run('INSERT INTO kiy_person (tabel, boy, kiyim, poyabzal, bosh, grp, shart, at, by_tabel) VALUES (%s, %s, %s, %s, %s, %s, %s::json, now(), %s) '
                 'ON CONFLICT (tabel) DO UPDATE SET boy = excluded.boy, kiyim = excluded.kiyim, poyabzal = excluded.poyabzal, bosh = excluded.bosh, grp = excluded.grp, '
                 'shart = excluded.shart, at = now(), by_tabel = excluded.by_tabel',
                 t, v['boy'], v['kiyim'], v['poyabzal'], v['bosh'], v['grp'], json.dumps(shart) if shart is not None else None, u['tabel'])
    await audit(u['tabel'], 'maxsus kiyim: oʻlcham/norma', t, req)
    return send(200, {'ok': True})


async def kiy_due(req: Request, u: dict) -> Response:
    """Muddati kelgan / yaqinlashgan — ombor rejasi uchun (butun korxona yoki faqat mening hodimlarim)."""
    P = await org.people()
    allv = await can_role(u, KIY_VIEW)
    ts = list(P) if allv else [t for t in await _vis(u) if t in P]
    ISS = await _issues(ts)
    K = await _persons(ts)
    N = org.names()
    out = []
    for t in ts:
        pl = org.kiy_plan(P[t], K.get(t), ISS.get(t, []))
        R = [r for r in pl['rows'] if r['st'] in ('kerak', 'kech', 'yaqin')]
        if R:
            o = _pub(P[t], N)
            o.update({'kgrp': pl['grp'], 'kgrpNom': pl['grpNom'], 'items': [{'b': r['b'], 'nom': r['nom'], 'st': r['st'], 'next': r['next'], 'last': r['last']} for r in R]})
            out.append(o)
    out.sort(key=lambda o: (o['unitN'], o['grpN'], o['name']))
    return send(200, {'all': allv, 'n': len(out), 'list': out})
