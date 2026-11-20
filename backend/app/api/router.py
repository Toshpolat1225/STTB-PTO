"""Telefonlar va brauzer uchun API (shlyuz orqasida). Manzillar va javoblar eski server bilan aynan bir xil —
ilova (APK 3.16.x) hech qanday oʻzgarishsiz ishlaydi."""
from __future__ import annotations

import logging
import re

from starlette.requests import Request
from starlette.responses import FileResponse, Response
from pathlib import Path

from app.api import auth as A
from app.api import data as D
from app import realtime as L
from app.api import my as M
from app.api import people as P
from app.core.config import VERSION, settings
from app.core.audit import auth_user
from app.api.sign import sign_api
from app.core.security import Keys
from app.core.tls import TLS
from app.core.http_utils import BadJson, TooBig, err, send

log = logging.getLogger('agmk')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'apikey, authorization, content-type, prefer, x-client-info, accept-profile, content-profile',
    'Access-Control-Max-Age': '86400',
}
APP_HEADERS = {'Cache-Control': 'no-cache', 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
               'Permissions-Policy': 'camera=(self), microphone=(self), geolocation=(self)'}
STATIC = Path(__file__).resolve().parents[1] / 'static'
MANIFEST = ('{"name":"AGMK STTB-AIT — Avtomatlashtirilgan Intellektual Tizim","short_name":"AGMK STTB-AIT","start_url":"/","scope":"/","display":"standalone",'
            '"background_color":"#0b0f19","theme_color":"#0b0f19","lang":"uz",'
            '"icons":[{"src":"/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any maskable"},'
            '{"src":"/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}')
_APP: dict = {'m': 0.0, 'b': b''}


def _app_html() -> bytes:
    """Ilova HTML (bir xil fayl APK ichida ham) + kompyuterda oʻrnatish uchun manifest havolasi. Fayl oʻzgarmaguncha keshda."""
    f = settings.app_html
    m = f.stat().st_mtime
    if _APP['m'] != m:
        h = f.read_bytes()
        tag = b'<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon-192.png"><meta name="theme-color" content="#0b0f19">'
        i = h.find(b'</head>')
        _APP['b'] = h[:i] + tag + h[i:] if i > 0 else h
        _APP['m'] = m
    return _APP['b']


def ca_bat(ca_pem: str) -> str:
    """Windows uchun: ichki CA ni joriy foydalanuvchining «Ishonchli ildiz markazlari» ga qoʻshadi (administrator shart emas).
    Windows bitta tasdiq soʻraydi. Faqat korxona kompyuterlarida ishlatiladi."""
    lines = ['@echo off', 'chcp 65001 >nul', 'rem AGMK-STTB ichki sertifikat markazi (CA) -- korxona kompyuterida bir marta ishga tushiriladi.',
             'set F=%TEMP%\\agmk-sttb-ca.crt', '(']
    lines += ['echo ' + x for x in ca_pem.strip().splitlines()]
    lines += [') > "%F%"', 'certutil -user -addstore Root "%F%"', 'del "%F%"', 'echo.',
              'echo Tayyor. Brauzerni (Chrome / Edge) yopib, qayta oching.', 'pause']
    return '\r\n'.join(lines) + '\r\n'


FILE_RE = re.compile(r'^/api/files/v1/(f[0-9a-f]{24})$')
SEED_RE = re.compile(r'^/api/seed/v1/([a-z]{2,12})$')

# (usul, manzil) → ishlovchi(req, user). Tartib ahamiyatsiz: manzillar aniq.
ROUTES = {
    ('GET', '/auth/v1/user'): A.user_get_me,
    ('PUT', '/auth/v1/user'): A.user_change_pw,
    ('POST', '/auth/v1/user'): A.user_change_pw,
    ('PUT', '/api/roster/v1/oklad'): P.oklad_put,
    ('GET', '/api/roster/v1/oklad'): P.oklad_get,
    ('GET', '/api/roster/v1'): P.roster_list,
    ('GET', '/rest/v1/agmk_users'): P.users_active,
    ('GET', '/api/sig/v1/me'): P.sig_get,
    ('PUT', '/api/sig/v1/me'): P.sig_put,
    ('GET', '/api/sig/v1/pin'): P.pin_get,
    ('PUT', '/api/sig/v1/pin'): P.pin_put,
    ('POST', '/api/adm/v1/pw'): P.adm_pw,
    ('GET', '/api/vt/v1/active'): P.vt_list,
    ('POST', '/api/vt/v1/cancel'): P.vt_cancel,
    ('GET', '/api/geo/v1/rev'): L.geo_rev_get,
    ('POST', '/api/geo/v1/rev'): L.geo_rev_post,
    ('GET', '/api/geo/v1'): L.geo_info,
    ('GET', '/api/ocr/v1'): L.ocr_get,
    ('POST', '/api/ocr/v1'): L.ocr_post,
    ('GET', '/api/pos/v1/trail'): L.pos_trail,
    ('POST', '/api/log/v1'): D.app_log,
    ('GET', '/rest/v1/agmk_records'): D.records_get,
    ('POST', '/rest/v1/agmk_records'): D.records_post,
    ('GET', '/rest/v1/agmk_messages'): D.messages_get,
    ('POST', '/rest/v1/agmk_messages'): D.messages_post,
    ('POST', '/api/files/v1'): D.files_post,
    ('GET', '/api/pack/v1/sxema'): D.pack_sxema,
    # 3.18: Mening hodimlarim, kadrlar importi, maxsus kiyim
    ('GET', '/api/my/v1'): M.my_list,
    ('GET', '/api/my/v1/p'): M.my_passport,
    ('GET', '/api/my/v1/tel'): M.my_tel,
    ('GET', '/api/my/v1/find'): M.my_find,
    ('GET', '/api/my/v1/tk'): M.my_tk,
    ('POST', '/api/my/v1/rel'): M.my_rel,
    ('POST', '/api/my/v1/rel/cancel'): M.my_rel_cancel,
    ('POST', '/api/hr/v1/import'): M.hr_import,
    ('GET', '/api/kiy/v1/norma'): M.kiy_norma,
    ('GET', '/api/kiy/v1/p'): M.kiy_person,
    ('POST', '/api/kiy/v1/issue'): M.kiy_issue,
    ('POST', '/api/kiy/v1/cancel'): M.kiy_cancel,
    ('POST', '/api/kiy/v1/ack'): M.kiy_ack,
    ('POST', '/api/kiy/v1/person'): M.kiy_person_set,
    ('GET', '/api/kiy/v1/due'): M.kiy_due,
}


async def dispatch(req: Request) -> Response:
    p, method = req.url.path, req.method
    # ---- ochiq manzillar: brauzer versiyasi, ulanish sozlamasi, sertifikat, holat
    if method == 'GET' and p in ('/', '/index.html') and settings.app_html.exists():
        return Response(_app_html(), media_type='text/html; charset=utf-8', headers=APP_HEADERS)
    # 4.1: kompyuterda «ilova» sifatida oʻrnatish (PWA) va ichki CA sertifikati (kompyuterga bir marta oʻrnatiladi)
    if method == 'GET' and p == '/manifest.webmanifest':
        return Response(MANIFEST, media_type='application/manifest+json', headers={'Cache-Control': 'no-cache'})
    if method == 'GET' and p in ('/icon-192.png', '/icon-512.png'):
        return FileResponse(STATIC / p[1:], media_type='image/png', headers={'Cache-Control': 'max-age=86400'})
    if method == 'GET' and p == '/agmk-ca.crt' and TLS.ca_pem:
        return Response(TLS.ca_pem, media_type='application/x-x509-ca-cert', headers={'Content-Disposition': 'attachment; filename="AGMK-STTB-CA.crt"'})
    if method == 'GET' and p == '/agmk-ca.bat' and TLS.ca_pem:
        return Response(ca_bat(TLS.ca_pem), media_type='application/octet-stream', headers={'Content-Disposition': 'attachment; filename="AGMK-STTB_SERTIFIKAT_ORNATISH.bat"'})
    if p == '/app/config' and method == 'GET':
        return send(200, {'k': Keys.anon_key, 'f': TLS.fp, 'n': 'AGMK-STTB'})
    if p == '/agmk.crt' and method == 'GET':
        return Response(TLS.cert_pem, media_type='application/x-x509-ca-cert', headers={'Content-Disposition': 'attachment; filename="agmk-sttb.crt"'})
    if p in ('/health', '/'):
        return send(200, {'ok': True, 'name': 'AGMK-STTB', 'version': VERSION})
    if req.headers.get('apikey', '') != Keys.anon_key:
        return err(401, "Server kaliti noto'g'ri — QR kodni qaytadan skanerlang")
    # ---- kirish
    if p == '/auth/v1/token' and method == 'POST':
        return await A.token(req)
    if p == '/auth/v1/signup' and method == 'POST':
        return await A.signup(req)
    # ---- qolgan hammasi — faqat kirgan foydalanuvchi
    u = await auth_user(req)
    if not u:
        return err(401, 'Avtorizatsiya kerak')
    h = ROUTES.get((method, p))
    if h:
        return await h(req, u)
    if p.startswith('/api/sign/v1/'):
        return await sign_api(req, u, p)
    if p == '/api/pos/v1':
        r = await L.pos(req, u)
        if r is not None:
            return r
    if p == '/api/trk/v1':
        r = await L.trk(req, u)
        if r is not None:
            return r
    m = FILE_RE.match(p)
    if m and method == 'GET':
        return await D.files_get(req, u, m.group(1))
    m = SEED_RE.match(p)
    if m and method == 'GET':
        return await D.seed(req, u, m.group(1))
    if p == '/api/gps/v1/last':
        return send(200, [])
    return err(404, 'Topilmadi')


async def app(scope, receive, send_):
    """ASGI ilova: CORS sarlavhalari har javobga; kutilmagan xato — «Server xatosi»."""
    if scope['type'] != 'http':
        return
    req = Request(scope, receive)
    if req.method == 'OPTIONS':
        resp = Response(status_code=204)
    else:
        try:
            resp = await dispatch(req)
        except (TooBig, BadJson) as e:
            resp = err(500, 'Server xatosi: ' + str(e))
        except Exception:  # noqa: BLE001 — 6.2: tafsilot faqat server jurnaliga, foydalanuvchiga umumiy xabar
            log.exception('XATO: %s %s', req.method, req.url.path)
            resp = err(500, 'Server xatosi — administratorga murojaat qiling')
    for k, v in CORS.items():
        resp.headers[k] = v
    await resp(scope, receive, send_)
