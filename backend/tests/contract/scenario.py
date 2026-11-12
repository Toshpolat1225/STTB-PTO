"""Shartnoma (contract) sinovi: eski Node server va yangi Python server bir xil soʻrovlarga bir xil javob beradimi.

Ikkala server ham bir xil boshlangʻich holatda (boʻsh baza, bir xil xodimlar.json, paketlar va maxfiy kalitlar) ishga tushiriladi.
Keyin bir xil soʻrovlar ketma-ketligi yuboriladi va javoblar (vaqt belgilari, tokenlar va tasodifiy id lar
normallashtirilgandan keyin) solishtiriladi.

    python tests/contract/scenario.py --old https://127.0.0.1:18443 --old-admin http://127.0.0.1:18080 \
                                      --new http://127.0.0.1:18000 --new-admin http://127.0.0.1:18081 --apikey ...
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import sys
import time

import httpx

ISO_RE = re.compile(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$')


def derive(t: str, pw: str) -> str:
    return hashlib.sha256(('agmk:%s:%s' % (t, pw)).encode()).hexdigest()[:40]


def pin(x: str) -> str:
    return hashlib.sha1(('pin:' + x).encode()).hexdigest()


PNG = 'data:image/png;base64,' + base64.b64encode(b'\x89PNG\r\n\x1a\n' + b'\0' * 120).decode()
JPG = b'\xff\xd8\xff\xe0' + b'\0' * 200


class Side:
    def __init__(self, base: str, admin: str, apikey: str):
        self.c = httpx.Client(base_url=base, verify=False, timeout=60)
        self.a = httpx.Client(base_url=admin, timeout=60, headers={'Host': 'localhost'})
        self.apikey = apikey
        self.tok: dict[str, str] = {}
        self.ref: dict[str, str] = {}
        self.out: list[tuple[str, object]] = []
        self.ids: dict[str, str] = {}
        html = self.a.get('/').text
        self.atok = re.search(r"const TOKEN = '([0-9a-f]+)'", html).group(1)

    def norm(self, o, key=None):
        if isinstance(o, dict):
            return {k: self.norm(v, k) for k, v in o.items()}
        if isinstance(o, list):
            return [self.norm(v, key) for v in o]
        if isinstance(o, str):
            if key in ('access_token', 'refresh_token'):
                return '<tok>'
            if ISO_RE.match(o) or (key in ('at', 'created_at', 'last_login', 'done_at', 'cancelled', 'updated_at') and o):
                return '<ts>'
            if re.fullmatch(r'sd[0-9a-z]{8,}[0-9a-f]{8}|f[0-9a-f]{24}', o):
                return self.ids.setdefault(o, '<id%d>' % len(self.ids))
            if key == 'ip':
                return '<ip>'
        if key in ('expires_at', 't', 'ago', 'ft', 'upd') and isinstance(o, (int, float)):
            return '<n>'
        return o

    def rec(self, name: str, r: httpx.Response, body=True, drop=()):
        ct = r.headers.get('content-type', '')
        if body and 'json' in ct and r.content:
            v = r.json()
            if isinstance(v, dict):
                for k in drop:
                    v.pop(k, None)
            v = self.norm(v)
        elif r.content:
            v = 'sha256:' + hashlib.sha256(r.content).hexdigest()[:16] + ' (%d bayt)' % len(r.content)
        else:
            v = ''
        self.out.append((name, {'status': r.status_code, 'body': v}))
        return r

    def h(self, who=None, extra=None):
        h = {'apikey': self.apikey}
        if who:
            h['authorization'] = 'Bearer ' + self.tok[who]
        if extra:
            h.update(extra)
        return h

    def login(self, name, t, code, raw=False):
        r = self.c.post('/auth/v1/token?grant_type=password', headers=self.h(), json={'email': 't%s@agmk-sttb.app' % t, 'password': code if raw else derive(t, code)})
        self.rec(name, r)
        if r.status_code == 200:
            self.tok[t] = r.json()['access_token']
            self.ref[t] = r.json()['refresh_token']
        return r

    def adm(self, name, path, body=None):
        if body is None:
            r = self.a.get(path, headers={'X-Admin-Token': self.atok})
        else:
            r = self.a.post(path, headers={'X-Admin-Token': self.atok}, json=body)
        return self.rec(name, r)


def scenario(S: Side) -> None:
    c, h = S.c, S.h
    # ---- ochiq manzillar
    S.rec('health', c.get('/health'), drop=('version',))
    S.rec('app/config', c.get('/app/config'))
    S.rec('crt', c.get('/agmk.crt'))
    S.rec('kalitsiz', c.get('/rest/v1/agmk_records'))
    S.rec('notoʻgʻri kalit', c.get('/rest/v1/agmk_records', headers={'apikey': 'x'}))
    S.rec('tokensiz', c.get('/rest/v1/agmk_records', headers=h()))
    S.rec('OPTIONS', c.options('/rest/v1/agmk_records'))
    # ---- kirish
    S.login('admin kirish', '0001', '111111')
    S.login('xato parol', '0011', '000000')
    S.login('notoʻgʻri email', 'x', '1')
    S.rec('grant yoʻq', c.post('/auth/v1/token?grant_type=xx', headers=h(), json={}))
    S.login('roʻyxatsiz', '7777', '123456')
    S.login('disp kirish', '0011', '269509')
    S.login('alt kirish', '0011', '555555')
    S.login('bux kirish', '0060', '760211')
    S.login('kadr kirish', '0055', '477639')
    S.login('mm kirish', '0009', '275460')
    S.login('rah kirish', '0002', '350258')
    S.login('mash kirish', '0072', '427172')
    for i in range(5):
        S.login('qulf %d' % i, '0017', '000000')
    S.login('qulflangan', '0017', '677122')
    r = c.post('/auth/v1/token?grant_type=refresh_token', headers=h(), json={'refresh_token': S.ref['0011']})
    S.rec('refresh', r)
    if r.status_code == 200:
        S.tok['0011'] = r.json()['access_token']
    S.rec('refresh qayta', c.post('/auth/v1/token?grant_type=refresh_token', headers=h(), json={'refresh_token': S.ref['0011']}))
    S.rec('signup qisqa', c.post('/auth/v1/signup', headers=h(), json={'email': 't9999@agmk-sttb.app', 'password': '123'}))
    S.rec('signup', c.post('/auth/v1/signup', headers=h(), json={'email': 't9999@agmk-sttb.app', 'password': derive('9999', '9999'), 'data': {'name': 'Sinov Xodim', 'lavozim': 'sinovchi'}}))
    S.rec('signup takror', c.post('/auth/v1/signup', headers=h(), json={'email': 't9999@agmk-sttb.app', 'password': derive('9999', '9999')}))
    S.login('pending kirish', '9999', '9999')
    S.rec('user', c.get('/auth/v1/user', headers=h('0011')))
    S.rec('parol: eski xato', c.put('/auth/v1/user', headers=h('0072'), json={'password': derive('0072', 'yangi1'), 'old': 'x'}))
    S.rec('parol: bir xil', c.put('/auth/v1/user', headers=h('0072'), json={'password': derive('0072', '427172'), 'old': derive('0072', '427172')}))
    S.rec('parol: yangi', c.put('/auth/v1/user', headers=h('0072'), json={'password': derive('0072', 'yangi1'), 'old': derive('0072', '427172')}))
    S.login('yangi parol bilan', '0072', 'yangi1')
    # ---- shtat, oklad
    S.rec('roster', c.get('/api/roster/v1', headers=h('0011')))
    S.rec('oklad: admin', c.get('/api/roster/v1/oklad', headers=h('0001')))
    S.rec('oklad: oddiy', c.get('/api/roster/v1/oklad', headers=h('0011')))
    S.rec('oklad put: huquqsiz', c.put('/api/roster/v1/oklad', headers=h('0011'), json={'tabel': '0011', 'oklad': 5000000}))
    S.rec('oklad put', c.put('/api/roster/v1/oklad', headers=h('0001'), json={'tabel': '0011', 'oklad': 5123456.4, 'razryad': '7'}))
    S.rec('oklad put: kichik', c.put('/api/roster/v1/oklad', headers=h('0001'), json={'tabel': '0011', 'oklad': 10}))
    S.rec('oklad put: kalitsiz', c.put('/api/roster/v1/oklad', headers=h('0001'), json={'tabel': '0011'}))
    S.rec('oklad put: null', c.put('/api/roster/v1/oklad', headers=h('0001'), json={'tabel': '0012', 'oklad': None, 'razryad': None}))
    S.rec('oklad put: yoʻq tabel', c.put('/api/roster/v1/oklad', headers=h('0001'), json={'tabel': '99999', 'oklad': 5000000}))
    S.rec('oklad: keyin', c.get('/api/roster/v1/oklad', headers=h('0011')))
    S.rec('agmk_users', c.get('/rest/v1/agmk_users', headers=h('0011')))
    # ---- imzo va kod
    S.rec('imzo: boʻsh', c.get('/api/sig/v1/me', headers=h('0011')))
    S.rec('imzo: xato', c.put('/api/sig/v1/me', headers=h('0011'), json={'png': 'data:x'}))
    for t in ('0011', '0001', '0055', '0060', '0002'):
        S.rec('imzo saqlash ' + t, c.put('/api/sig/v1/me', headers=h(t), json={'png': PNG}))
    S.rec('imzo: bor', c.get('/api/sig/v1/me', headers=h('0011')))
    S.rec('kod: yoʻq', c.get('/api/sig/v1/pin', headers=h('0011')))
    S.rec('kod: xato shakl', c.put('/api/sig/v1/pin', headers=h('0011'), json={'pin': '1234'}))
    S.rec('kod: oʻrnatish', c.put('/api/sig/v1/pin', headers=h('0011'), json={'pin': pin('0011')}))
    S.rec('kod: almashtirish xato', c.put('/api/sig/v1/pin', headers=h('0011'), json={'pin': pin('x'), 'old': pin('y')}))
    S.rec('kod: parol bilan', c.put('/api/sig/v1/pin', headers=h('0011'), json={'pin': pin('0011'), 'pw': derive('0011', '269509')}))
    S.rec('kod: bor', c.get('/api/sig/v1/pin', headers=h('0011')))
    # ---- administrator parol beradi
    S.rec('adm pw: huquqsiz', c.post('/api/adm/v1/pw', headers=h('0011'), json={'tabel': '0017', 'password': derive('0017', '111222')}))
    S.rec('adm pw: xato', c.post('/api/adm/v1/pw', headers=h('0001'), json={'tabel': 'ab', 'password': 'x'}))
    S.rec('adm pw', c.post('/api/adm/v1/pw', headers=h('0001'), json={'tabel': '0017', 'password': derive('0017', '111222')}))
    S.rec('adm pw alt', c.post('/api/adm/v1/pw', headers=h('0001'), json={'tabel': '0017', 'i': 2, 'password': derive('0017', '333444')}))
    S.rec('adm pw yangi', c.post('/api/adm/v1/pw', headers=h('0001'), json={'tabel': '8888', 'password': derive('8888', '888888')}))
    S.login('adm bergan parol', '0017', '111222')
    S.login('adm bergan alt', '0017', '333444')
    # ---- yozuvlar
    rec = [
        {'id': 'kv:agmk_roles', 'kind': 'kv', 'data': {'v': {'0060': ['bux'], '0055': ['kadr', 'okl'], '0011': ['rl2@2099-01-01'], '0009': ['iqt']}}},
        {'id': 'x:0011', 'kind': 'xodim', 'data': {'name': 'A', 'birthDate': '1990-01-01', 'passport': 'AA', 'z': 1, 'b': [1, 2.5, None, True]}},
        {'id': 'x:0012', 'kind': 'xodim', 'data': {'name': 'B', 'oklad': 9, 'manzil': 'M'}},
        {'id': 'v:1', 'kind': 'vagon', 'data': {'num': '1', 'ü': 'oʻzbek ✓', 'n': 1.0, 'big': 12345678901234567}},
        {'id': 'm:nosoz:1', 'kind': 'mod', 'data': {'lvl': 'j', 'unitName': 'Teplovoz', 'izoh': 'tormoz'}},
        {'id': 'kv:agmk_bux', 'kind': 'kv', 'data': {'s': 1}},
    ]
    S.rec('yozuv: admin', c.post('/rest/v1/agmk_records', headers=h('0001'), json=rec))
    S.rec('yozuv: notoʻgʻri', c.post('/rest/v1/agmk_records', headers=h('0011'), json={'id': 'a', 'kind': 'A1', 'data': 1}))
    S.rec('yozuv: data yoʻq', c.post('/rest/v1/agmk_records', headers=h('0011'), json={'id': 'a', 'kind': 'kv'}))
    S.rec('yozuv: admin sozlamasi', c.post('/rest/v1/agmk_records', headers=h('0011'), json=[{'id': 'kv:agmk_sec_cfg', 'kind': 'kv', 'data': {}}]))
    S.rec('yozuv: bux huquqsiz', c.post('/rest/v1/agmk_records', headers=h('0011'), json=[{'id': 'kv:agmk_bux', 'kind': 'kv', 'data': {}}]))
    S.rec('yozuv: modul huquqsiz', c.post('/rest/v1/agmk_records', headers=h('0011'), json=[{'id': 'm:iqt:1', 'kind': 'mod', 'data': {'x': 1}}, {'id': 'kv:agmk_fot_cfg_v1', 'kind': 'kv', 'data': {}}, {'id': 'v:2', 'kind': 'vagon', 'data': {'num': 2}}]))
    S.rec('yozuv: xodim pd', c.post('/rest/v1/agmk_records', headers=h('0011'), json=[{'id': 'x:0012', 'kind': 'xodim', 'data': {'name': 'B2', 'oklad': 1, 'izoh': 'q'}}, {'id': 'x:0011', 'kind': 'xodim', 'data': {'name': 'A2', 'passport': 'BB'}}]))
    S.rec('yozuv: kadr pd', c.post('/rest/v1/agmk_records', headers=h('0055'), json=[{'id': 'x:0012', 'kind': 'xodim', 'data': {'name': 'B3', 'oklad': 2}}]))
    S.rec('yozuv: bux', c.post('/rest/v1/agmk_records', headers=h('0060'), json=[{'id': 'm:iqt:1', 'kind': 'mod', 'data': {'x': 2}}, {'id': 'kv:agmk_bux', 'kind': 'kv', 'data': {'s': 2}}]))
    S.rec('yozuv: oʻchirish', c.post('/rest/v1/agmk_records', headers=h('0001'), json=[{'id': 'v:2', 'kind': 'vagon', 'data': None, 'deleted': True}]))
    S.rec('yozuv: 1001 ta', c.post('/rest/v1/agmk_records', headers=h('0001'), json=[{'id': 'q%d' % i, 'kind': 'kv', 'data': i} for i in range(1001)]))
    S.rec('yozuv: buzilgan json', c.post('/rest/v1/agmk_records', headers=h('0001', {'content-type': 'application/json'}), content=b'{x'))
    for who in ('0001', '0011', '0055', '0060', '0009'):
        S.rec('yozuvlar: ' + who, c.get('/rest/v1/agmk_records?updated_at=gt.1970-01-01T00:00:00Z&limit=1000', headers=h(who)))
    r = c.get('/rest/v1/agmk_records?limit=2', headers=h('0001'))
    S.rec('yozuvlar: limit 2', r)
    last = r.json()[-1]['updated_at']
    S.rec('yozuvlar: keyingisi', c.get('/rest/v1/agmk_records?updated_at=gt.%s&limit=3' % last, headers=h('0001')))
    # ---- xabarlar va fayllar
    S.rec('xabar: notoʻgʻri', c.post('/rest/v1/agmk_messages', headers=h('0011'), json={'to_tabel': '0001'}))
    S.rec('xabar: yoʻq odam', c.post('/rest/v1/agmk_messages', headers=h('0011'), json={'to_tabel': '5555', 'text': 'x'}))
    r = c.post('/api/files/v1?to=0001&name=a.txt&mime=text/plain', headers=h('0011'), content=b'salom fayl')
    S.rec('fayl yuklash', r)
    fid = r.json().get('id')
    S.rec('fayl: boʻsh', c.post('/api/files/v1?to=0001', headers=h('0011'), content=b''))
    S.rec('fayl: qabul qiluvchi yoʻq', c.post('/api/files/v1?to=5555', headers=h('0011'), content=b'x'))
    S.rec('fayl: guruh', c.post('/api/files/v1?to=*mttb&name=r.jpg&mime=image/jpeg', headers=h('0007' if '0007' in S.tok else '0011'), content=JPG))
    S.rec('xabar fayl bilan', c.post('/rest/v1/agmk_messages', headers=h('0011'), json={'to_tabel': '0001', 'text': 'Salom 👋', 'files': [fid, 'fzz']}))
    S.rec('xabar oddiy', c.post('/rest/v1/agmk_messages', headers=h('0055'), json={'to_tabel': '0001', 'text': ' ikkinchi '}))
    S.rec('xabarlar', c.get('/rest/v1/agmk_messages?id=gt.0', headers=h('0001')))
    S.rec('xabarlar: keyin', c.get('/rest/v1/agmk_messages?id=gt.1&limit=5', headers=h('0001')))
    S.rec('fayl olish: egasi', c.get('/api/files/v1/' + fid, headers=h('0011')))
    S.rec('fayl olish: qabul qiluvchi', c.get('/api/files/v1/' + fid, headers=h('0001')))
    S.rec('fayl olish: begona', c.get('/api/files/v1/' + fid, headers=h('0055')))
    # ---- imzolash
    S.rec('imzo: boʻsh hujjat', c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 't'}))
    S.rec('imzo: xesh xato', c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 't', 'html': '<p>x</p>', 'hash': 'abc'}))
    S.rec('imzo: imzochisiz', c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 't', 'html': '<p>x</p>', 'signers': [{'tabel': '5555'}]}))
    html = '<h1>Xizmat xati</h1><p>Sinov</p>'
    r = c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 'Xizmat xati', 'html': html, 'hash': hashlib.sha256(html.encode()).hexdigest(),
                                                            'signers': [{'tabel': '0011', 'label': 'Dispetcher'}, {'tabel': '0001', 'name': 'Admin'}, {'tabel': '0011'}, {'tabel': '0013'}, {'tabel': '5555'}],
                                                            'meta': {'vt': {'a': '0011', 'b': '0012', 'from': '2026-01-01', 'to': '2099-12-31', 'why': 'taʼtil'}}})
    S.rec('imzoga yuborish', r)
    did = r.json()['id']
    html2 = '<p>ikkinchi</p>'
    r2 = c.post('/api/sign/v1/docs', headers=h('0001'), json={'title': 'Ikkinchi', 'html': html2, 'signers': [{'tabel': '0011'}, {'tabel': '0060'}]})
    S.rec('imzoga yuborish 2', r2)
    did2 = r2.json()['id']
    S.rec('kiruvchi 0011', c.get('/api/sign/v1/inbox', headers=h('0011')))
    S.rec('hujjat', c.get('/api/sign/v1/docs/' + did, headers=h('0011')))
    S.rec('hujjat: begona', c.get('/api/sign/v1/docs/' + did, headers=h('0060')))
    S.rec('hujjat: yoʻq', c.get('/api/sign/v1/docs/sd000000', headers=h('0011')))
    hs = hashlib.sha256(html.encode()).hexdigest()
    S.rec('imzo: xesh mos emas', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0011'), json={'hash': 'x'}))
    S.rec('imzo: kodsiz', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0011'), json={'hash': hs}))
    S.rec('imzo: kod xato', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0011'), json={'hash': hs, 'pin': pin('boshqa')}))
    S.rec('imzo: 0011', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0011'), json={'hash': hs, 'pin': pin('0011')}))
    S.rec('imzo: takror', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0011'), json={'hash': hs, 'pin': pin('0011')}))
    S.rec('imzo: 0001', c.post('/api/sign/v1/docs/%s/sign' % did, headers=h('0001'), json={'hash': hs, 'pin': pin('0001')}))
    S.rec('rad: sababsiz', c.post('/api/sign/v1/docs/%s/reject' % did2, headers=h('0060'), json={'hash': hashlib.sha256(html2.encode()).hexdigest()}))
    S.rec('rad', c.post('/api/sign/v1/docs/%s/reject' % did2, headers=h('0060'), json={'hash': hashlib.sha256(html2.encode()).hexdigest(), 'reason': 'xato bor'}))
    S.rec('bekor: begona', c.post('/api/sign/v1/docs/%s/cancel' % did2, headers=h('0011'), json={}))
    S.rec('bekor', c.post('/api/sign/v1/docs/%s/cancel' % did2, headers=h('0001'), json={}))
    S.rec('imzo: bekor qilingan', c.post('/api/sign/v1/docs/%s/sign' % did2, headers=h('0011'), json={'hash': hashlib.sha256(html2.encode()).hexdigest(), 'pin': pin('0011')}))
    S.rec('imzo: GET usuli', c.get('/api/sign/v1/docs/%s/sign' % did, headers=h('0011')))
    S.rec('kiruvchi admin', c.get('/api/sign/v1/inbox', headers=h('0001')))
    S.rec('hujjat toʻliq', c.get('/api/sign/v1/docs/' + did, headers=h('0001')))
    # 3.17.0: navbat majburiy emas (seq eʼtiborsiz), tanishuvchi, kirish paroli bilan tasdiq, «Tanishdi» (birinchi ochish)
    html3 = '<p>buyruq</p>'
    hs3 = hashlib.sha256(html3.encode()).hexdigest()
    r3 = c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 'Buyruq', 'html': html3, 'seq': 1,
                                                             'signers': [{'tabel': '0001', 'label': 'Rahbar'}, {'tabel': '0060', 'kind': 'tan'}, {'tabel': '0011', 'kind': 'x'}]})
    S.rec('imzoga yuborish 3', r3)
    did3 = r3.json()['id']
    S.rec('0011 ochmasdan oldin', c.get('/api/sign/v1/inbox', headers=h('0055')))
    S.rec('0011 ochdi', c.get('/api/sign/v1/docs/' + did3, headers=h('0011')))
    S.rec('navbatsiz: 0011 birinchi', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0011'), json={'hash': hs3, 'pw': derive('0011', '269509')}))
    S.rec('tanishdi: parol xato', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0060'), json={'hash': hs3, 'pw': derive('0060', '000000')}))
    S.rec('tanishdi: shakl xato', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0060'), json={'hash': hs3, 'pw': '1234'}))
    S.rec('tanishdi', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0060'), json={'hash': hs3, 'pw': derive('0060', '760211')}))
    S.rec('parol: 0001', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0001'), json={'hash': hs3, 'pw': derive('0001', '111111')}))
    S.rec('0011 takror', c.post('/api/sign/v1/docs/%s/sign' % did3, headers=h('0011'), json={'hash': hs3, 'pw': derive('0011', '269509')}))
    html4 = '<p>alt</p>'
    r4 = c.post('/api/sign/v1/docs', headers=h('0055'), json={'title': 'Alt', 'html': html4, 'signers': [{'tabel': '0011'}]})
    S.rec('alt parol bilan imzo', c.post('/api/sign/v1/docs/%s/sign' % r4.json()['id'], headers=h('0011'), json={'hash': hashlib.sha256(html4.encode()).hexdigest(), 'pw': derive('0011', '555555')}))
    S.rec('hujjat 3', c.get('/api/sign/v1/docs/' + did3, headers=h('0055')))
    S.rec('kiruvchi 0060', c.get('/api/sign/v1/inbox', headers=h('0060')))
    S.rec('vt faol', c.get('/api/vt/v1/active', headers=h('0011')))
    # ---- joylashuv
    S.rec('pos: xato', c.post('/api/pos/v1', headers=h('0072'), json={'lat': 'x'}))
    S.rec('pos', c.post('/api/pos/v1', headers=h('0072'), json={'lat': 40.8412345678, 'lon': 69.5987654321, 'acc': 12.6, 'unit': 'TEM-2 №1', 'spd': 31.4, 'brg': 400, 'bat': 77, 'chg': True, 'gps': 0,
                                                              'pts': [[1760000000, 40.84, 69.59, 5, 3.6], [1760000010, 40.85, 69.6], ['x', 1, 1], [1760000000, 1, 1, 1, 1]]}))
    S.rec('pos 2', c.post('/api/pos/v1', headers=h('0011'), json={'lat': 40.8, 'lon': 69.5}))
    S.rec('pos: oddiy koʻradi', c.get('/api/pos/v1', headers=h('0072')))
    S.rec('pos: dispetcher (rl2)', c.get('/api/pos/v1', headers=h('0011')))
    S.rec('pos: admin', c.get('/api/pos/v1', headers=h('0001')))
    S.rec('iz', c.get('/api/pos/v1/trail?tabel=0072', headers=h('0001')))
    S.rec('iz: begona', c.get('/api/pos/v1/trail?tabel=0011', headers=h('0072')))
    S.rec('pos: off', c.post('/api/pos/v1', headers=h('0072'), json={'off': 1}))
    S.rec('pos: keyin', c.get('/api/pos/v1', headers=h('0001')))
    S.rec('trk: xato', c.post('/api/trk/v1', headers=h('0072'), json={'uid': 'u1', 'day': 'x'}))
    S.rec('trk: boʻsh', c.post('/api/trk/v1', headers=h('0072'), json={'uid': 'u1', 'day': '2026-10-08', 'pts': []}))
    S.rec('trk', c.post('/api/trk/v1', headers=h('0072'), json={'uid': 'u1', 'day': '2026-10-08', 'unit': 'TEM', 'pts': [[1, 40.1234567, 69.1, 3.7], [2, 40.2, 69.2]]}))
    S.rec('trk 2', c.post('/api/trk/v1', headers=h('0072'), json={'uid': 'u1', 'day': '2026-10-08', 'pts': [[3, 40.3, 69.3, 1000]]}))
    S.rec('trk olish', c.get('/api/trk/v1?uid=u1&day=2026-10-08', headers=h('0001')))
    S.rec('trk: begona', c.get('/api/trk/v1?tabel=0072&day=2026-10-08', headers=h('0060')))
    S.rec('trk: kunsiz', c.get('/api/trk/v1?uid=u1', headers=h('0001')))
    # ---- manzil, OCR, jurnal, paketlar
    S.rec('geo info', c.get('/api/geo/v1', headers=h('0011')), drop=('n',))
    S.rec('geo rev', c.get('/api/geo/v1/rev?lat=40.8436&lon=69.5996', headers=h('0011')))
    S.rec('geo rev 2', c.get('/api/geo/v1/rev?lat=41.3111&lon=69.2797', headers=h('0011')))
    S.rec('geo rev xato', c.get('/api/geo/v1/rev?lat=100&lon=1', headers=h('0011')))
    S.rec('geo rev post', c.post('/api/geo/v1/rev', headers=h('0011'), json={'pts': [[40.8436, 69.5996], [41.3111, 69.2797], ['a'], 5]}))
    S.rec('ocr info', c.get('/api/ocr/v1', headers=h('0011')))
    S.rec('jurnal', c.post('/api/log/v1', headers=h('0011'), json={'list': [{'v': '3.16.4', 'scr': 'main', 'n': 3, 'm': 'TypeError'}, 'x']}))
    S.rec('seed mbs: huquqsiz', c.get('/api/seed/v1/mbs', headers=h('0072')))
    S.rec('seed mbs', c.get('/api/seed/v1/mbs', headers=h('0055')))
    S.rec('seed nartar', c.get('/api/seed/v1/nartar', headers=h('0060')))
    S.rec('seed yoʻq', c.get('/api/seed/v1/zzz', headers=h('0060')))
    S.rec('sxema', c.get('/api/pack/v1/sxema', headers=h('0011')))
    S.rec('gps last', c.get('/api/gps/v1/last', headers=h('0011')))
    S.rec('yoʻq manzil', c.get('/api/nima', headers=h('0011')))
    S.rec('vt bekor: huquqsiz', c.post('/api/vt/v1/cancel', headers=h('0072'), json={'id': did}))
    S.rec('vt bekor', c.post('/api/vt/v1/cancel', headers=h('0055'), json={'id': did}))
    S.rec('vt keyin', c.get('/api/vt/v1/active', headers=h('0011')))
    # ---- boshqaruv paneli
    S.rec('panel: tokensiz', S.a.post('/admin/backup', json={}))
    S.adm('panel: hisob yaratish', '/admin/create', {'tabel': '0500', 'name': 'Demo Sinovchi', 'password': '123456', 'demo': 1})
    S.adm('panel: band', '/admin/create', {'tabel': '0500', 'name': 'X', 'password': '123456'})
    S.adm('panel: tasdiqlash', '/admin/roster-approve', {})
    S.adm('panel: rol', '/admin/user', {'tabel': '9999', 'role': 'viewer', 'status': 'active'})
    S.login('tasdiqlangan', '9999', '9999')
    S.adm('panel: tashqi manzil', '/admin/ext', {'e': '213.230.45.67'})
    S.adm('panel: tashqi xato', '/admin/ext', {'e': 'a b'})
    S.adm('panel: retabel', '/admin/retabel', {'tabel': '9999', 'to': '0300'})
    S.login('retabeldan keyin', '0300', '9999')
    S.adm('panel: demo oʻchirish', '/admin/demo-delete', {})
    S.adm('panel: oʻchirish', '/admin/user', {'tabel': '8888', 'action': 'delete'})
    S.adm('panel: boʻlimlar xato', '/admin/home', {'tabel': '0300'})
    S.adm('panel: boʻlimlar', '/admin/home', {'tabel': '0300', 'show': {'sec:bux': False, 'sec:mm': True}})
    S.adm('panel: boʻlimlar 2', '/admin/home', {'tabel': '0072', 'show': {'sec:bux': True}})
    r = S.a.get('/admin/state', headers={'X-Admin-Token': S.atok})
    st = r.json()
    for k in ('version', 'port', 'fp', 'ips', 'backups'):
        st.pop(k, None)
    st['users'] = sorted(st['users'], key=lambda x: x['tabel'])
    S.out.append(('panel: holat', {'status': r.status_code, 'body': S.norm(st)}))
    S.rec('yozuvlar oxiri', c.get('/rest/v1/agmk_records?limit=1000', headers=h('0001')))


def deep_diff(x, y, p='', out=None, lim=12):
    """Farqlar roʻyxati (yoʻl: eski | yangi)."""
    out = [] if out is None else out
    if len(out) >= lim:
        return out
    if type(x) is not type(y):
        out.append('%s: %s | %s' % (p or '/', json.dumps(x, ensure_ascii=False)[:160], json.dumps(y, ensure_ascii=False)[:160]))
    elif isinstance(x, dict):
        for k in list(dict.fromkeys(list(x) + list(y))):
            if k not in x or k not in y:
                out.append('%s/%s: %s' % (p, k, 'faqat eskida' if k in x else 'faqat yangida'))
            else:
                deep_diff(x[k], y[k], '%s/%s' % (p, k), out, lim)
    elif isinstance(x, list):
        if len(x) != len(y):
            out.append('%s: uzunlik %d | %d' % (p or '/', len(x), len(y)))
        for i, (u, v) in enumerate(zip(x, y)):
            deep_diff(u, v, '%s[%d]' % (p, i), out, lim)
    elif x != y:
        out.append('%s: %s | %s' % (p or '/', json.dumps(x, ensure_ascii=False)[:160], json.dumps(y, ensure_ascii=False)[:160]))
    return out


def report(O: list, N: list, title: str) -> int:
    bad = 0
    for (n1, v1), (n2, v2) in zip(O, N):
        if v1 != v2:
            bad += 1
            print('\n✗ %s' % n1)
            for line in deep_diff(v1, v2):
                print('   ', line)
    print('\n%s: %d / %d mos' % (title, len(O) - bad, len(O)))
    return bad


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--old', required=True)
    ap.add_argument('--old-admin', required=True)
    ap.add_argument('--new', required=True)
    ap.add_argument('--new-admin', required=True)
    ap.add_argument('--apikey', required=True)
    ap.add_argument('--dump')
    a = ap.parse_args()
    sides = {}
    for name, base, adm in (('old', a.old, a.old_admin), ('new', a.new, a.new_admin)):
        S = Side(base, adm, a.apikey)
        t0 = time.time()
        scenario(S)
        sides[name] = S
        print('%s: %d qadam, %.1f s' % (name, len(S.out), time.time() - t0))
    if a.dump:
        json.dump({k: v.out for k, v in sides.items()}, open(a.dump, 'w'), ensure_ascii=False, indent=1)
    sys.exit(1 if report(sides['old'].out, sides['new'].out, 'Shartnoma sinovi') else 0)


if __name__ == '__main__':
    main()
