"""Shtat roʻyxati (xodimlar.json), huquq guruhlari va boshlangʻich parollar.

Roʻyxatdagi xodim roʻyxatdan oʻtganda ismi va lavozimi roʻyxatdan olinadi (telefon yuborganiga ishonilmaydi).
xodimlar.json korxona fayli boʻlib, repoga tushmaydi (AGMK_COMPANY_DIR ichida, faqat oʻqish uchun ulanadi).
"""
from __future__ import annotations

import json
import logging
import re

from app.core import database as db
from app.core.config import settings
from app.core.security import derive_pw, hash_pw, new_salt, sha256
from app.core.utils import clean_tabel, clip, now

log = logging.getLogger('agmk')

ROSTER: dict[str, dict] = {}
STATE = {'v': ''}  # xodimlar.json versiyasi
GROUPS: dict[str, list[str]] = {}
GR_ROLES = {'RAH': ['rahbar'], 'SEX': ['tex'], 'KADR': ['kadr'], 'BUX': ['bux'], 'MTIH': ['mtih'], 'MM': ['mm'], 'MTTB': ['mttb'],
            'PTO': ['tex', 'hisob'], 'DISP': ['hr'], 'MASH': ['mash'], 'TEXU': ['tex'], 'TX_VAG': ['tx_vag'], 'TX_AVTO': ['tx_avto'],
            'TX_TEPLO': ['tx_teplo'], 'TX_MOTO': ['tx_moto'], 'TX_EL': ['tx_el'], 'TX_YOL': ['tx_yol'], 'XARITA': ['xarita']}


def _num(x):
    try:
        v = float(x)
        return int(v) if v.is_integer() else v
    except (TypeError, ValueError):
        return None


async def roster_load() -> None:
    ROSTER.clear()
    STATE['v'] = ''
    f = settings.company_dir / 'xodimlar.json'
    try:
        j = json.loads(f.read_text(encoding='utf8'))
        for x in j.get('xodimlar') or []:
            t = clean_tabel(x.get('tabel'))
            if t:
                ROSTER[t] = {'name': clip(x.get('name'), 120), 'lavozim': clip(x.get('lavozim'), 160), 'bolinma': clip(x.get('bolinma'), 40),
                             'razryad': _num(x.get('razryad')) or None, 'oklad': _num(x.get('oklad')) or None}
        STATE['v'] = j.get('v') or ''
    except FileNotFoundError:
        pass
    except Exception as e:  # noqa: BLE001
        log.warning("xodimlar.json o'qilmadi: %s", e)
    # ilovada oʻzgartirilgan oklad / razryad (bazada) — fayl qayta yuklansa ham saqlanadi
    try:
        for r in await db.all_('SELECT tabel, oklad, razryad FROM oklad'):
            R = ROSTER.get(r['tabel'])
            if R:
                R['oklad'] = r['oklad'] or None
                R['razryad'] = r['razryad'] or None
    except Exception as e:  # noqa: BLE001
        log.warning('oklad jadvali oʻqilmadi: %s', e)


def groups_load() -> None:
    GROUPS.clear()
    f = settings.paket_dir / 'huquq_guruhlari.json'
    try:
        j = json.loads(f.read_text(encoding='utf8'))
        for k, gl in j.items():
            t = k.split('|')[0]
            r: list[str] = []
            for g in gl or []:
                r += GR_ROLES.get(g, [])
            GROUPS[t] = list(dict.fromkeys((GROUPS.get(t) or []) + r))
    except FileNotFoundError:
        pass
    except Exception as e:  # noqa: BLE001
        log.warning('huquq_guruhlari.json: %s', e)


_MASH = re.compile(r'mashinist|машинист|haydovchi|водител|shofyor|шофер|traktorist|тракторист|kranchi|крановщик|ekskavatorchi|машинист экскаватора|motorist|моторист')


def roster_roles(tabel: str) -> list[str]:
    """Shtat roʻyxatidagi lavozimdan kelib chiqadigan rollar + huquq guruhi."""
    R = ROSTER.get(str(tabel))
    l = str((R or {}).get('lavozim') or '').lower()
    out: list[str] = []
    if re.match(r'^(boshqarma boshlig.i|bosh muhandis)$', l):
        out.append('rahbar')
    if 'buxgalter' in l:
        out.append('bux')
    if 'kadr' in l:
        out.append('kadr')
    if _MASH.search(l) and not re.search(r'yo.riqchi|инструктор', l):
        out.append('mash')
    for r in GROUPS.get(str(tabel)) or []:
        if r not in out:
            out.append(r)
    return out


async def kir_seed_apply() -> None:
    """Administrator bergan 6 xonali boshlangʻich parollar (paketlar/kirish_kodlari.json).
    Fayl oʻzgarsa — oʻzgargan xodimlarniki yangilanadi; ilovada berilgan yangi parol saqlanib qoladi."""
    if settings.seed_off:
        return
    f = settings.paket_dir / 'kirish_kodlari.json'
    try:
        K = json.loads(f.read_text(encoding='utf8'))
    except FileNotFoundError:
        return
    except Exception as e:  # noqa: BLE001
        log.warning('kirish_kodlari.json: %s', e)
        return
    D = K.get('takror') or {}
    n = 0
    async with db.conn() as c:
        async def put(key: str, ch: str, fn) -> None:
            nonlocal n
            r = await (await c.execute('SELECT ch FROM kir_seed WHERE tabel = %s', (key,))).fetchone()
            if r and r['ch'] == ch:
                return
            await fn()
            await c.execute('INSERT INTO kir_seed (tabel, ch, at) VALUES (%s, %s, now()) ON CONFLICT (tabel) DO UPDATE SET ch = excluded.ch, at = excluded.at', (key, ch))
            n += 1

        for t, code in (K.get('kodlar') or {}).items():
            t = clean_tabel(t)
            if not t or not re.fullmatch(r'\d{6}', str(code)):
                continue

            async def apply(t=t, code=code):
                salt = new_salt()
                h = hash_pw(derive_pw(t, str(code)), salt)
                u = await (await c.execute('SELECT * FROM users WHERE tabel = %s', (t,))).fetchone()
                R = ROSTER.get(t)
                if not u:
                    nm = (D.get(t) or [{}])[0].get('n') if D.get(t) else None
                    await c.execute("INSERT INTO users (tabel, name, lavozim, salt, hash, role, status, created_at, device, demo, must_change) "
                                    "VALUES (%s, %s, %s, %s, %s, %s, 'active', now(), 'boshlangʻich parol', false, false)",
                                    (t, nm or (R['name'] if R else 'Tabel ' + t), R['lavozim'] if R else '', salt, h, 'admin' if t == settings.admin_tabel else 'editor'))
                else:
                    await c.execute('UPDATE users SET salt = %s, hash = %s, must_change = false WHERE tabel = %s', (salt, h, t))
                    if u['status'] in ('pending', 'reset'):
                        await c.execute("UPDATE users SET status = 'active' WHERE tabel = %s", (t,))
            await put(t, sha256('v1:%s:%s' % (t, code)), apply)

        for t, L in D.items():
            for i, x in enumerate(L or []):
                if not i:
                    continue
                key = '%s#%d' % (t, i)

                async def apply_alt(t=t, i=i, x=x):
                    salt = new_salt()
                    await c.execute('INSERT INTO kir_alt (tabel, i, name, salt, hash) VALUES (%s, %s, %s, %s, %s) '
                                    'ON CONFLICT (tabel, i) DO UPDATE SET name = excluded.name, salt = excluded.salt, hash = excluded.hash',
                                    (t, i, clip(x.get('n'), 120), salt, hash_pw(derive_pw(t, str(x.get('kod'))), salt)))
                await put(key, sha256('v1:%s:%s' % (key, x.get('kod'))), apply_alt)
    if n:
        log.info('Boshlangʻich parollar qoʻllandi: %d ta xodim', n)


__all__ = ['ROSTER', 'STATE', 'GROUPS', 'roster_load', 'groups_load', 'roster_roles', 'kir_seed_apply', 'now']
