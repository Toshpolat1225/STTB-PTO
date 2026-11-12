"""Tashkiliy tuzilma: kim kimga boʻysunadi («Mening hodimlarim») va maxsus kiyim normasi kimga qaysi.

Maʼlumot manbalari (hammasi serverda):
  • xodimlar.json — ITR shtat roʻyxati (lavozim, boʻlinma);
  • ishchilar.json — ishchilar roʻyxati 1C dan (boʻlinma, kasb, uchastka);
  • ilovadagi xodim kartalari (records, kind='xodim') — ITR ning shtatdagi oʻrni (posNo) kadrlar belgilagan;
  • tuzilma (shtat jadvali) — data/shtat_2026.json yoki ilovada tahrirlangani (kv:agmk_shtat_tree).
"""
from __future__ import annotations

import calendar
import datetime as dt
import json
import logging
import re
import time
from pathlib import Path

from app.core import database as db
from app.core.config import settings
from app.services.roster import ROSTER, STATE
from app.core.utils import clean_tabel, clip

log = logging.getLogger('agmk')
DATA = Path(__file__).resolve().parents[1] / 'data'
SHTAT = json.loads((DATA / 'shtat_2026.json').read_text(encoding='utf8'))
NORMA = json.loads((DATA / 'kiyim_normalari.json').read_text(encoding='utf8'))
KAT = {k['kod']: k for k in NORMA['katalog']}
GRP = {g['id']: g for g in NORMA['guruhlar']}

# Boshqarma darajasidagi rahbarlar (shtatdagi lavozim №) → qaysi boʻlim (g) va boʻlinmalar (u) ularga boʻysunadi.
# Tashkiliy tuzilma sxemasidagi kabi (ilovadagi ST_TREE). 1 — boshqarma boshligʻi, 2 — bosh muhandis: hammasi.
BOSS_ALL = {1, 2}
BOSS = {3: (['u1g5'], ['u11', 'u13']), 7: ([], ['u12']), 6: (['u1g1'], []), 4: (['u1g7'], []), 8: (['u1g6'], [])}

# Ishchilar roʻyxatidagi uchastka (1C, ruscha) → shtatdagi uchastka (guruh)
UCH = {
    'u2': [('эксплуатации подвижного', 'u2g1'), ('движения поездов', 'u2g2'), ('ремонту локомотивов', 'u2g4'), ('обслуживания локомотивов', 'u2g5'),
           ('ремонту вагонов', 'u2g6'), ('обслуживания вагонов', 'u2g7'), ('заготовительн', 'u2g8'), ('кузнечн', 'u2g3'), ('механическ', 'u2g3')],
    'u3': [('грузовой', 'u3g1'), ('эксплуатации подвижного', 'u3g2'), ('движения поездов', 'u3g3'), ('обслуживания локомотивов', 'u3g5'),
           ('вагоно-ремонтный', 'u3g6'), ('обслуживания вагонов', 'u3g7')],
    'u4': [('заготовительн', 'u4g2'), ('изобретательск', 'u4g3'), ('капитального ремонта тяговых', 'u4g4'), ('(тр-3)', 'u4g5'), ('электротехники', 'u4g6'),
           ('(тр-1 и тр-2)', 'u4g7'), ('тепловозов', 'u4g8'), ('автотракторной', 'u4g9'), ('кузнечн', 'u4g1'), ('механическ', 'u4g1')],
    'u5': [('звеносборочн', 'u5g1'), ('кальмакыр', 'u5g2'), ('внешнего транспорта', 'u5g3')],
    'u10': [('по ремонту вагонов', 'u10g1'), ('заготовительный и ремонтный', 'u10g1'), ('сварочн', 'u10g1'), ('автотормозн', 'u10g1'),
            ('механическ', 'u10g2'), ('кузнечн', 'u10g2'), ('колёс', 'u10g3'), ('колес', 'u10g3')],
}


def _n(s) -> str:
    s = str(s or '').lower().replace('ё', 'е').replace('"', '').replace('«', '').replace('»', '')
    s = re.sub(r"[ʻʼ‘’`']", "'", s)
    return re.sub(r'\s+', ' ', s).strip()


def rank(lav: str, ishchi: bool = False) -> int:
    """Lavozim darajasi: 1 — eng yuqori. Imzo tartibidagi bilan bir xil (ilovadagi v9Rank)."""
    if ishchi:
        return 6
    s = _n(lav)
    if re.search(r"o'rinbosar|заместител", s):
        return 3
    if re.search(r"^(boshqarma boshlig'i|bosh muhandis)$|директор|начальник управления", s):
        return 1
    if re.search(r"boshlig|начальник|bosh energetik|bosh mexanik$|^bosh buxgalter", s):
        return 2
    if re.search(r'usta\b|ustasi|мастер|brigadir|бригадир', s):
        return 5
    if re.search(r'muhandis|инженер|iqtisodchi|buxgalter|mutaxassis|marksheyder|yuriskonsult|inspektor|revizor|dispetcher|mexani|energetik|naryadchi|taftishchi|kassir|qo.riqchisi|mashinisti|texnolog|dasturlovchi', s):
        return 4
    return 6


def _unit_by_short() -> dict[str, str]:
    return {_n(u['short']): u['id'] for u in SHTAT['units']}


def _uch_group(uid: str, uch: str, kasb: str) -> str | None:
    s = _n(uch)
    for k, g in UCH.get(uid, []):
        if k in s:
            return g
    if uid == 'u8' and re.search(r'kontakt', _n(kasb)):
        return 'u8g1'
    return None


class _Cache:
    at = 0.0
    key = ''
    P: dict[str, dict] = {}
    tree: dict = SHTAT


C = _Cache()


def _workers_file() -> Path:
    return settings.company_dir / 'ishchilar.json'


async def people() -> dict[str, dict]:
    """Barcha xodimlar (ITR + ishchilar) — tuzilmadagi oʻrni bilan. 60 soniya keshlanadi (oʻzgarsa darhol yangilanadi)."""
    try:
        wf = _workers_file()
        wm = wf.stat().st_mtime if wf.exists() else 0
        m = await db.one("SELECT max(updated_at) AS m, count(*)::int AS n FROM records WHERE kind = 'xodim' OR id = 'kv:agmk_shtat_tree'")
        key = '%s|%s|%s|%s|%s' % (STATE['v'], len(ROSTER), wm, m and m['m'], m and m['n'])
    except Exception:  # noqa: BLE001
        key, wm = str(time.time()), 0
    if key == C.key and time.time() - C.at < 600:
        return C.P
    tree = SHTAT
    try:
        r = await db.one("SELECT data::text AS d FROM records WHERE id = 'kv:agmk_shtat_tree' AND deleted = false")
        v = (json.loads(r['d']) or {}).get('v') if r else None
        if isinstance(v, dict) and isinstance(v.get('pos'), list) and v['pos'] and isinstance(v.get('units'), list):
            tree = v
    except Exception:  # noqa: BLE001
        pass
    ubs = {_n(u.get('short')): u['id'] for u in tree.get('units') or []} or _unit_by_short()
    pos: dict[int, dict] = {}
    for p in tree.get('pos') or []:
        try:
            pos[int(p['no'])] = p
        except (TypeError, ValueError, KeyError):
            continue
    P: dict[str, dict] = {}
    # 1) ITR (shtat roʻyxati)
    for t, x in ROSTER.items():
        uid = ubs.get(_n(x.get('bolinma'))) or ('u1' if not x.get('bolinma') else None)
        P[t] = {'tabel': t, 'name': x['name'], 'lav': x['lavozim'], 'unit': uid, 'grp': None, 'uch': '', 'pos': None, 'itr': True, 'razryad': x.get('razryad')}
    # 2) ishchilar (1C)
    try:
        if wm:
            W = json.loads(_workers_file().read_text(encoding='utf8'))
            for r in W.get('rows') or []:
                t = clean_tabel(r[0]) if r else ''
                if not t or t in P:
                    continue
                uid = ubs.get(_n(r[2]))
                P[t] = {'tabel': t, 'name': clip(r[1], 120), 'lav': clip(r[3], 160), 'unit': uid, 'grp': _uch_group(uid or '', r[4] if len(r) > 4 else '', r[3]),
                        'uch': clip(r[4] if len(r) > 4 else '', 160), 'pos': None, 'itr': False, 'razryad': None}
    except Exception as e:  # noqa: BLE001
        log.warning('ishchilar.json oʻqilmadi: %s', e)
    # 3) ilovadagi kartalar: ITR ning shtatdagi oʻrni (kadrlar belgilagan), razryad
    try:
        for r in await db.all_("SELECT id, data::text AS d FROM records WHERE kind = 'xodim' AND deleted = false"):
            try:
                d = json.loads(r['d']) or {}
            except Exception:  # noqa: BLE001
                continue
            if not isinstance(d, dict):
                continue
            t = clean_tabel(d.get('tabel') or str(r['id'])[2:])
            if not t:
                continue
            p = pos.get(int(d['posNo'])) if str(d.get('posNo') or '').isdigit() else None
            x = P.get(t)
            if p and p.get('cat') != 'ishchi' and not (x and not x['itr']):
                if not x:
                    x = P[t] = {'tabel': t, 'name': clip(d.get('name'), 120), 'lav': clip(d.get('lavozim') or p.get('name'), 160), 'unit': None, 'grp': None, 'uch': '', 'pos': None, 'itr': True, 'razryad': None}
                x['pos'], x['unit'], x['grp'] = int(p['no']), p.get('u'), p.get('g')
            if x and d.get('razryad') and not x.get('razryad'):
                x['razryad'] = d.get('razryad')
    except Exception as e:  # noqa: BLE001
        log.warning('xodim kartalari oʻqilmadi: %s', e)
    # 4) shtatdagi oʻrni belgilanmagan ITR: lavozim nomi boʻlinmada yagona boʻlsa — oʻsha oʻrin
    by_name: dict[tuple, list] = {}
    for p in pos.values():
        if p.get('cat') != 'ishchi':
            by_name.setdefault((p.get('u'), _n(p.get('name'))), []).append(p)
    for x in P.values():
        if x['itr'] and not x['pos'] and x['unit']:
            L = by_name.get((x['unit'], _n(x['lav'])))
            if L and len(L) == 1:
                x['pos'], x['grp'] = int(L[0]['no']), L[0].get('g')
    for x in P.values():
        x['rank'] = rank(x['lav'], not x['itr'])
    C.P, C.key, C.at, C.tree = P, key, time.time(), tree
    return P


def names(tree: dict | None = None) -> dict:
    t = tree or C.tree
    return {'u': {u['id']: u.get('short') or u.get('name') for u in t.get('units') or []}, 'uf': {u['id']: u.get('name') for u in t.get('units') or []},
            'g': {g['id']: g.get('name') for g in t.get('groups') or []}}


def _active(r: dict, today: dt.date) -> bool:
    return not r['cancelled'] and r['dfrom'] <= today and (r['dto'] is None or r['dto'] >= today)


async def rels_for(boss: str) -> list[dict]:
    return await db.all_('SELECT * FROM my_rel WHERE boss = %s ORDER BY id', boss)


def auto_vis(me: dict | None, P: dict[str, dict], all_: bool) -> set[str]:
    """Struktura boʻyicha avtomatik: kimlar menga boʻysunadi."""
    if all_:
        return set(P)
    if not me:
        return set()
    out: set[str] = set()
    pno, rk, uid, gid = me.get('pos'), me['rank'], me.get('unit'), me.get('grp')
    if pno in BOSS_ALL or (uid == 'u1' and rk == 1):
        return set(P)
    if pno in BOSS:
        gs, us = BOSS[pno]
        return {t for t, x in P.items() if x.get('grp') in gs or x.get('unit') in us}
    if not uid or rk == 4 or rk == 6:
        return out  # mutaxassis (muhandis, iqtisodchi va h.k.) va ishchiga avtomatik hech kim boʻysunmaydi — kerak boʻlsa qoʻlda biriktiriladi
    if rk == 5 and not pno:
        return out  # usta shtatdagi oʻrni (qaysi uchastka) belgilanmagan — kadrlar strukturada joylashtirgach koʻrinadi
    for t, x in P.items():
        if x.get('unit') != uid:
            continue
        if gid:  # uchastka / boʻlim ichida: oʻzidan quyi lavozimdagilar
            if x.get('grp') == gid and x['rank'] > rk:
                out.add(t)
        elif uid != 'u1':  # boʻlinma (sex, xizmat) darajasida
            if rk <= 2:
                out.add(t)  # sex / xizmat boshligʻi — butun boʻlinma
            elif rk == 3 and x['rank'] > 3:
                out.add(t)  # sex boshligʻi oʻrinbosari — oʻzidan keyingilar
            elif rk == 5 and not x['itr']:
                out.add(t)  # boʻlinma darajasidagi usta (smena ustasi, katta usta) — ishchilar
    return out


async def visible(tabel: str, all_: bool) -> dict[str, dict]:
    """Menga koʻrinadigan xodimlar: {tabel: {'via': 'auto'|'add', 'rel': {...}}}. Oʻzim kirmayman."""
    P = await people()
    me = P.get(tabel)
    out = {t: {'via': 'auto'} for t in auto_vis(me, P, all_)}
    today = dt.date.today()
    for r in await rels_for(tabel):
        if not _active(r, today):
            continue
        if r['op'] == 'add':
            out[r['tabel']] = {'via': 'add', 'rel': rel_view(r)}
        else:
            out.pop(r['tabel'], None)
    out.pop(tabel, None)
    return out


def rel_view(r: dict) -> dict:
    return {'id': r['id'], 'boss': r['boss'], 'tabel': r['tabel'], 'op': r['op'], 'why': r['why'], 'from': r['dfrom'].isoformat(),
            'to': r['dto'].isoformat() if r['dto'] else None, 'by': r['by_tabel']}


# ------------------------------------------------------------------ maxsus kiyim normasi
def kiy_group(lav: str) -> str:
    s = _n(lav)
    for m in NORMA['moslash']:
        if re.search(m['regex'], s):
            return m['guruh']
    return 'ofis'


def kiy_shart(x: dict) -> list[str]:
    s = _n(x.get('lav')) + ' | ' + _n(x.get('uch'))
    out = [m['shart'] for m in NORMA['shartlar'] if re.search(m['regex'], s)]
    if re.search(r'кальмакыр|карьер|отвал|razrez|karyer|karer|okolotka|qolmaqir', s) and 'karyer' not in out:
        out.append('karyer')
    if re.search(r'пункт технического обслуживания|texnik xizmat ko.rsatish punkti', s):
        out.append('TXP')
    if re.search(r'химическ|kimyoviy', s):
        out.append('kimyoviy ombor')
    if re.search(r'yuvuvchi|hammom', s):
        out.append('nam ish')
    if re.search(r'gaz uskunalari|suvoqchi|plitkachi', s):
        out.append('chang/gaz')
    return list(dict.fromkeys(out))


def add_months(d: dt.date, n: int) -> dt.date:
    y, m = divmod(d.month - 1 + n, 12)
    y += d.year
    m += 1
    return dt.date(y, m, min(d.day, calendar.monthrange(y, m)[1]))


def kiy_plan(x: dict, person: dict | None, issues: list[dict], today: dt.date | None = None) -> dict:
    """Xodimning normasi va har bir buyum boʻyicha holati: oxirgi olgan sana, keyingi sana, holat."""
    today = today or dt.date.today()
    pr = person or {}
    gid = pr.get('grp') if pr.get('grp') in GRP else kiy_group(x.get('lav'))
    sh = set(kiy_shart(x)) | set(pr.get('shart') or [])
    last: dict[str, dict] = {}
    for i in issues:
        if i['cancelled']:
            continue
        o = last.get(i['item'])
        if not o or i['issued'] > o['issued']:
            last[i['item']] = i
    rows, due, soon = [], 0, 0
    for r in GRP[gid]['qator']:
        if r.get('shart') and r['shart'] not in sh:
            continue
        L = last.get(r['b'])
        nxt, st = None, 'ok'
        if r.get('navb'):
            st = 'navb'
        elif r['oy'] == 0:
            st = 'ok' if L else 'kerak'
        else:
            nxt = add_months(L['issued'], int(r['oy'])) if L else None
            if not L or nxt <= today:
                st = 'kerak' if not L else 'kech'
            elif (nxt - today).days <= 30:
                st = 'yaqin'
        if st in ('kerak', 'kech'):
            due += 1
        elif st == 'yaqin':
            soon += 1
        rows.append({'b': r['b'], 'nom': KAT[r['b']]['nom'], 'std': KAT[r['b']]['standart'], 'oy': r['oy'], 'soni': r.get('soni', 1), 'mavsum': r.get('mavsum'),
                     'shart': r.get('shart'), 'navb': bool(r.get('navb')), 'manba': r.get('manba'), 'last': L['issued'].isoformat() if L else None,
                     'next': nxt.isoformat() if nxt else None, 'st': st})
    return {'grp': gid, 'grpNom': GRP[gid]['nom'], 'band': GRP[gid].get('band'), 'auto': pr.get('grp') not in GRP, 'shart': sorted(sh), 'rows': rows, 'due': due, 'soon': soon}


# ------------------------------------------------------------------ 4.2: bazadagi shtat jadvali (xodimlar)
_XSYNC = {'h': None}


async def xodimlar_sync() -> int:
    """public.xodimlar ni shtat (ITR) va ishchilar roʻyxati bilan tenglaydi. Faqat F.I.Sh., lavozim, boʻlinma — oylik yoʻq.
    Roʻyxatdan chiqqan xodim oʻchirilmaydi (shtatda = false). Oʻzgarish boʻlmasa — hech narsa yozilmaydi."""
    if not (await db.one("SELECT to_regclass('public.xodimlar') AS r"))['r']:
        return 0
    P = await people()
    want = {t: (x.get('name') or None, x.get('lav') or None, x.get('unit') or None, x.get('uch') or None, bool(x.get('itr')))
            for t, x in P.items() if t}
    h = hash(tuple(sorted(want.items())))
    if h == _XSYNC['h']:
        return 0
    n = 0
    async with db.conn() as c:
        have = {r['tabel']: r for r in await (await c.execute('SELECT tabel, fio, lavozim, bolinma, uchastka, itr, shtatda, manba FROM xodimlar')).fetchall()}
        async with c.transaction():
            for t, (fio, lav, unit, uch, itr) in want.items():
                r = have.get(t)
                if r and r['shtatda'] and r['manba'] == 'shtat' and (r['fio'], r['lavozim'], r['bolinma'], r['uchastka'], r['itr']) == (fio, lav, unit, uch, itr):
                    continue
                await c.execute("INSERT INTO xodimlar (tabel, fio, lavozim, bolinma, uchastka, itr, shtatda, manba, yangilandi) VALUES (%s, %s, %s, %s, %s, %s, true, 'shtat', now()) "
                                "ON CONFLICT (tabel) DO UPDATE SET fio = excluded.fio, lavozim = excluded.lavozim, bolinma = excluded.bolinma, uchastka = excluded.uchastka, "
                                "itr = excluded.itr, shtatda = true, manba = 'shtat', yangilandi = now()", (t, fio, lav, unit, uch, itr))
                n += 1
            gone = [t for t, r in have.items() if r['shtatda'] and t not in want]
            if gone and want:  # roʻyxat umuman oʻqilmagan boʻlsa (fayl yoʻq) — hech kim «chiqdi» deb belgilanmaydi
                await c.execute('UPDATE xodimlar SET shtatda = false, yangilandi = now() WHERE tabel = ANY(%s)', (gone,))
                n += len(gone)
            # hisob bor, lekin shtatda yoʻq (demo, eski) — hech boʻlmasa F.I.Sh. koʻrinsin
            await c.execute("UPDATE xodimlar x SET fio = u.name, lavozim = coalesce(x.lavozim, nullif(u.lavozim, '')), yangilandi = now() FROM users u "
                            "WHERE u.tabel = x.tabel AND x.fio IS NULL AND u.name IS NOT NULL")
    _XSYNC['h'] = h
    if n:
        log.info('Shtat jadvali (xodimlar) yangilandi: %d ta', n)
    return n
