"""Ichki elektron imzolash.

Hujjat serverga bir marta yuboriladi (HTML + SHA-256). Har bir imzo chekuvchi FAQAT oʻz hisobidan, FAQAT oʻz qatoriga imzo qoʻyadi.
Imzo rasmi — foydalanuvchining serverdagi shaxsiy imzosi (imzolash paytidagi nusxasi). Hujjat oʻzgarsa — xesh mos kelmaydi.
"""
from __future__ import annotations

import asyncio
import logging
import re
import secrets
import time

from starlette.requests import Request
from starlette.responses import Response

from app.core import database as db
from app.core.permissions import PAY_ROLES, can_role
from app.core.config import settings
from app.core.audit import audit, pin_rec, pin_set, user_get
from app.services.roster import ROSTER
from app.core.security import dec, enc, fail_add, fail_clear, fail_locked, pw_ok, sha256
from app.core.utils import clean_tabel, clip, iso
from app.core.http_utils import body_obj, dumps, err, read_body, send, ua

log = logging.getLogger('agmk')
DOC_RE = re.compile(r'^/api/sign/v1/docs(?:/([A-Za-z0-9_-]{6,40}))?(?:/(sign|reject|cancel))?$')


def _b36(n: int) -> str:
    d = '0123456789abcdefghijklmnopqrstuvwxyz'
    s = ''
    while n:
        n, r = divmod(n, 36)
        s = d[r] + s
    return s or '0'


async def sd_view(d: dict, with_html: bool, acts: list[dict] | None = None, seen: dict | None = None) -> dict:
    if acts is None:
        acts = await db.all_('SELECT * FROM sign_acts WHERE doc_id = %s ORDER BY id', d['id'])
    if seen is None:
        seen = {r['tabel']: r['at'] for r in await db.all_('SELECT tabel, at FROM sign_seen WHERE doc_id = %s', d['id'])}
    S = d['signers'] or []
    signers = []
    for x in S:
        mine = [z for z in acts if z['tabel'] == x.get('tabel')]
        a = mine[-1] if mine else None
        o = dict(x)
        o.update({'state': a['action'] if a else 'wait', 'at': iso(a['at']) if a else None, 'reason': a['reason'] if a else None, 'hash': a['hash'] if a else None,
                  'seen': iso(seen.get(x.get('tabel')) or (a['at'] if a else None))})
        if with_html and a and a['action'] == 'sign' and a['png']:
            o['png'] = dec(a['png'])
        signers.append(o)
    v = {'id': d['id'], 'title': d['title'], 'hash': d['hash'], 'created_by': d['created_by'], 'created_at': iso(d['created_at']), 'status': d['status'],
         'done_at': iso(d['done_at']), 'demo': bool(d['demo'])}
    if with_html:
        v['html'] = d['html']
    v['signers'] = signers
    return v


async def docs_all() -> list[dict]:
    return await db.all_('SELECT id, title, hash, created_by, created_at, status, signers, done_at, demo FROM sign_docs ORDER BY created_at DESC LIMIT 300')


async def sign_api(req: Request, u: dict, p: str) -> Response:
    m = DOC_RE.match(p)
    if p == '/api/sign/v1/inbox' and req.method == 'GET':
        mine = [d for d in await docs_all()
                if d['created_by'] == u['tabel'] or any(x.get('tabel') == u['tabel'] for x in (d['signers'] or [])) or u['role'] == 'admin']
        by: dict[str, list[dict]] = {d['id']: [] for d in mine}
        sn: dict[str, dict] = {d['id']: {} for d in mine}
        if mine:  # 3.16.8: barcha imzo harakatlari bitta soʻrovda (10 soniyalik tekshiruv uchun)
            for a in await db.all_('SELECT doc_id, tabel, action, reason, hash, at FROM sign_acts WHERE doc_id = ANY(%s) ORDER BY id', list(by)):
                by[a['doc_id']].append(a)
            for r in await db.all_('SELECT doc_id, tabel, at FROM sign_seen WHERE doc_id = ANY(%s)', list(by)):
                sn[r['doc_id']][r['tabel']] = r['at']
        return send(200, [await sd_view(d, False, by[d['id']], sn[d['id']]) for d in mine])
    if not m:
        return err(404, 'Topilmadi')
    if not m.group(1) and req.method == 'POST':
        if u['role'] == 'viewer':
            return err(403, "Sizda faqat ko'rish huquqi bor")
        b = body_obj(await read_body(req, 16_000_000))  # yuklangan PDF (sahifa rasmlari) uchun 16 MB
        html = str(b.get('html') or '')
        title = clip(b.get('title'), 200)
        if not html:
            return err(400, "Hujjat bo'sh")
        if b.get('hash') and b['hash'] != sha256(html):
            return err(400, "Hujjat yuborishda buzildi (hash mos emas) — qayta urinib ko'ring")
        users = {x['tabel']: x for x in await db.all_("SELECT tabel, name, lavozim, role, demo FROM users WHERE status = 'active' ORDER BY name")}
        S: list[dict] = []
        skip: list[str] = []
        for x in (b.get('signers') if isinstance(b.get('signers'), list) else []):
            x = x if isinstance(x, dict) else {}
            t = clean_tabel(x.get('tabel'))
            if not t or any(z['tabel'] == t for z in S):
                continue
            us, R = users.get(t), ROSTER.get(t)
            if not us and not R:
                skip.append(t)
                continue
            e = {'tabel': t, 'name': us['name'] if us else R['name'], 'label': clip(x.get('label') or x.get('name'), 160)}
            if not us:
                e['later'] = 1
            if x.get('kind') == 'tan':
                e['kind'] = 'tan'
            S.append(e)
        if not S:
            return err(400, 'Imzo chekuvchilar tanlanmagan (yoki ular serverda ham, shtat roʻyxatida ham yoʻq)')
        did = 'sd' + _b36(int(time.time() * 1000)) + secrets.token_hex(4)
        demo = any(users.get(x['tabel']) and users[x['tabel']]['demo'] for x in S)
        await db.run("INSERT INTO sign_docs (id, title, html, hash, created_by, created_at, status, signers, demo) VALUES (%s, %s, %s, %s, %s, now(), 'open', %s::json, %s)",
                     did, title, html, sha256(html), u['tabel'], dumps(S), demo)
        try:
            v = (b.get('meta') or {}).get('vt') if isinstance(b.get('meta'), dict) else None
            if v and isinstance(v, dict) and await can_role(u, PAY_ROLES + ['kadr']) and re.fullmatch(r'\d{3,6}', clean_tabel(v.get('a'))) \
                    and re.fullmatch(r'\d{3,6}', clean_tabel(v.get('b'))) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(v.get('from') or '')) \
                    and re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(v.get('to') or '')) and v['to'] >= v['from'] and clean_tabel(v.get('a')) != clean_tabel(v.get('b')):
                await db.run('UPDATE sign_docs SET meta = %s::json WHERE id = %s',
                             dumps({'vt': {'a': clean_tabel(v['a']), 'b': clean_tabel(v['b']), 'from': v['from'], 'to': v['to'], 'why': clip(v.get('why'), 120)}}), did)
        except Exception:  # noqa: BLE001
            pass
        await audit(u['tabel'], 'imzoga yubordi', title + ' → ' + ','.join(x['tabel'] for x in S), req)
        log.info('Tabel %s: «%s» imzoga yuborildi (%d kishi)', u['tabel'], title, len(S))
        return send(201, {'id': did, 'hash': sha256(html), 'signers': [{'tabel': x['tabel'], 'name': x['name'], 'later': bool(x.get('later'))} for x in S], 'skipped': skip})
    d = await db.one('SELECT * FROM sign_docs WHERE id = %s', m.group(1)) if m.group(1) else None
    if not d:
        return err(404, 'Hujjat topilmadi')
    S = d['signers'] or []
    me = next((x for x in S if x.get('tabel') == u['tabel']), None)
    if not me and d['created_by'] != u['tabel'] and u['role'] != 'admin':
        return err(403, 'Bu hujjat sizga tegishli emas')
    if not m.group(2) and req.method == 'GET':
        if me:  # 3.17.0: imzolovchi hujjatni birinchi marta ochdi — «✓✓ Tanishdi»
            await db.run('INSERT INTO sign_seen (doc_id, tabel, at) VALUES (%s, %s, now()) ON CONFLICT (doc_id, tabel) DO NOTHING', d['id'], u['tabel'])
        return send(200, await sd_view(d, True))
    if req.method != 'POST':
        return err(405, 'POST')
    b = body_obj(await read_body(req, 20_000))
    if m.group(2) == 'cancel':
        if d['created_by'] != u['tabel'] and u['role'] != 'admin':
            return err(403, 'Faqat yuborgan odam bekor qila oladi')
        await db.run("UPDATE sign_docs SET status = 'cancelled', done_at = now() WHERE id = %s", d['id'])
        await audit(u['tabel'], 'imzoni bekor qildi', d['title'], req)
        return send(200, {'ok': True})
    if not me:
        return err(403, 'Siz bu hujjatda imzo chekuvchi emassiz')
    if d['status'] != 'open':
        return err(409, 'Hujjat allaqachon toʻliq imzolangan' if d['status'] == 'done' else 'Hujjat bekor qilingan')
    acts = await db.all_('SELECT * FROM sign_acts WHERE doc_id = %s ORDER BY id', d['id'])
    if any(a['tabel'] == u['tabel'] and a['action'] == 'sign' for a in acts):
        return err(409, 'Siz allaqachon imzolagansiz')
    if str(b.get('hash') or '') != d['hash']:
        return err(409, "Hujjat o'zgargan — imzo qabul qilinmadi. Hujjatni qayta oching")
    device = clip(ua(req), 200)
    if m.group(2) == 'reject':
        reason = clip(b.get('reason'), 500)
        if not reason:
            return err(400, 'Rad etish sababini yozing')
        await db.run("INSERT INTO sign_acts (doc_id, tabel, action, reason, png, hash, at, device) VALUES (%s, %s, 'reject', %s, NULL, %s, now(), %s)", d['id'], u['tabel'], reason, d['hash'], device)
        await audit(u['tabel'], 'imzoni rad etdi', d['title'] + ': ' + reason, req)
        log.info('Tabel %s: «%s» ni rad etdi', u['tabel'], d['title'])
        return send(200, {'ok': True})
    # imzolash (3.16.8: tanishuvchi — «tanishdim», imzolovchi — navbat bilan; tasdiq — kirish paroli)
    tan = me.get('kind') == 'tan'
    # 3.17.0: majburiy navbat yoʻq — tartib faqat koʻrsatish uchun, kim tayyor boʻlsa imzolaydi
    full = await user_get(u['tabel'])
    sig = None if tan else dec(full['sig'])
    if not tan and not sig:
        return err(400, 'Avval imzongizni kiriting: Profil → «✍️ Mening imzom»')
    if b.get('pw') is not None:  # kirish paroli (ilova sha256('agmk:'+tabel+':'+parol) koʻrinishida yuboradi)
        wait = fail_locked('pin:' + u['tabel'])
        if wait:
            return err(429, f'Juda koʻp xato. {wait} soniyadan keyin urinib koʻring')
        pw = str(b.get('pw'))
        ok = bool(re.fullmatch(r'[a-f0-9]{40}', pw)) and await asyncio.to_thread(pw_ok, pw, full['salt'], full['hash'])
        if not ok and re.fullmatch(r'[a-f0-9]{40}', pw):  # bitta tabeldagi ikkinchi xodim (kirishdagi kabi)
            for a in await db.all_('SELECT salt, hash FROM kir_alt WHERE tabel = %s ORDER BY i', u['tabel']):
                if await asyncio.to_thread(pw_ok, pw, a['salt'], a['hash']):
                    ok = True
                    break
        if not ok:
            fail_add('pin:' + u['tabel'])
            await audit(u['tabel'], 'imzolashda parol xato', d['title'], req)
            return err(403, 'Kirish paroli notoʻgʻri', {'code': 'bad_password'})
        fail_clear('pin:' + u['tabel'])
    else:
        r = await _pin_check(req, u, d, str(b.get('pin') or ''))
        if r is not None:
            return r
    await db.run("INSERT INTO sign_acts (doc_id, tabel, action, reason, png, hash, at, device) VALUES (%s, %s, 'sign', NULL, %s, %s, now(), %s)", d['id'], u['tabel'], enc(sig) if sig else None, d['hash'], device)
    await audit(u['tabel'], 'tanishdi' if tan else 'imzoladi', d['title'], req)
    log.info('Tabel %s: «%s» ni %s', u['tabel'], d['title'], 'tanishdi' if tan else 'imzoladi')
    return await _after_sign(d, S)


async def _pin_check(req: Request, u: dict, d: dict, pin: str) -> Response | None:
    """Eski ilovalar uchun (3.9–3.16.7): 4 xonali imzo kodi (birinchi marta yuborilgani oʻrnatiladi)."""
    cur = await pin_rec(u['tabel'])
    wait = fail_locked('pin:' + u['tabel'])
    if wait:
        return err(429, f'Juda koʻp xato. {wait} soniyadan keyin urinib koʻring')
    if not pin:
        if not settings.seed_off:
            return err(428, 'Imzo kodi kerak — ilovani yangilang (3.9.0+)')
    elif not re.fullmatch(r'[a-f0-9]{40}', pin):
        return err(400, 'Imzo kodi notoʻgʻri')
    elif not cur:
        await pin_set(u['tabel'], pin)
    elif not await asyncio.to_thread(pw_ok, pin, cur['s'], cur['h']):
        fail_add('pin:' + u['tabel'])
        await audit(u['tabel'], 'imzo kodi xato', d['title'], req)
        return err(403, 'Imzo kodi notoʻgʻri')
    if pin:
        fail_clear('pin:' + u['tabel'])
    return None


async def _after_sign(d: dict, S: list[dict]) -> Response:
    acts = await db.all_('SELECT tabel, action FROM sign_acts WHERE doc_id = %s', d['id'])
    done = all(any(a['tabel'] == x.get('tabel') and a['action'] == 'sign' for a in acts) for x in S)
    if done:
        await db.run("UPDATE sign_docs SET status = 'done', done_at = now() WHERE id = %s", d['id'])
        log.info('«%s» — hamma imzoladi ✅', d['title'])
        try:
            mt = (await db.one('SELECT meta FROM sign_docs WHERE id = %s', d['id']))['meta']
            v = mt and mt.get('vt')
            if v:
                await db.run('INSERT INTO vt_act (doc_id, a, b, dfrom, dto, why, created_by, done_at) VALUES (%s, %s, %s, %s, %s, %s, %s, now()) '
                             'ON CONFLICT (doc_id) DO UPDATE SET a = excluded.a, b = excluded.b, dfrom = excluded.dfrom, dto = excluded.dto, why = excluded.why, created_by = excluded.created_by, done_at = excluded.done_at, cancelled = NULL',
                             d['id'], v['a'], v['b'], v['from'], v['to'], v.get('why') or '', d['created_by'])
                await audit(None, 'vaqtincha tayinlash kuchga kirdi', '%s ← %s (%s–%s)' % (v['b'], v['a'], v['from'], v['to']))
                log.info('Vaqtincha tayinlash: %s → %s oʻrniga (%s–%s)', v['b'], v['a'], v['from'], v['to'])
        except Exception as e:  # noqa: BLE001
            log.warning('vaqtincha tayinlash: %s', e)
    return send(200, {'ok': True, 'done': done})
