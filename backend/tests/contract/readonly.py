"""Koʻchirish (migratsiya) sinovi: eski serverdagi baza yangi serverga koʻchirilgandan keyin
ikkala server bir xil maʼlumotni koʻrsatadimi. Eski server bergan sessiya tokeni yangi serverda ham ishlashi tekshiriladi."""
from __future__ import annotations

import argparse
import sys

from scenario import Side, derive, report

USERS = [('0001', '111111'), ('0011', '269509'), ('0055', '477639'), ('0060', '760211'), ('0072', 'yangi1'), ('0017', '111222'), ('0002', '350258')]


def reads(S: Side, tokens: dict) -> None:
    c, h = S.c, S.h
    S.tok.update(tokens)
    for t, _ in USERS:
        S.rec('user ' + t, c.get('/auth/v1/user', headers=h(t)))
        S.rec('yozuvlar ' + t, c.get('/rest/v1/agmk_records?limit=1000', headers=h(t)))
        S.rec('xabarlar ' + t, c.get('/rest/v1/agmk_messages?id=gt.0', headers=h(t)))
        S.rec('kiruvchi ' + t, c.get('/api/sign/v1/inbox', headers=h(t)))
        S.rec('imzo ' + t, c.get('/api/sig/v1/me', headers=h(t)))
        S.rec('kod ' + t, c.get('/api/sig/v1/pin', headers=h(t)))
        S.rec('oklad ' + t, c.get('/api/roster/v1/oklad', headers=h(t)))
        S.rec('trk ' + t, c.get('/api/trk/v1?uid=u1&day=2026-10-08', headers=h(t)))
    S.rec('roster', c.get('/api/roster/v1', headers=h('0001')))
    S.rec('users', c.get('/rest/v1/agmk_users', headers=h('0001')))
    S.rec('vt', c.get('/api/vt/v1/active', headers=h('0001')))
    for d in c.get('/api/sign/v1/inbox', headers=h('0001')).json():
        S.rec('hujjat ' + d['title'], c.get('/api/sign/v1/docs/' + d['id'], headers=h('0001')))
    msgs = c.get('/rest/v1/agmk_messages?id=gt.0', headers=h('0001')).json()
    for m in msgs:
        for f in m.get('files') or []:
            S.rec('fayl ' + f['name'], c.get('/api/files/v1/' + f['id'], headers=h('0001')))
    for t, pw in USERS[:3]:
        S.login('kirish ' + t, t, pw)
    S.login('alt kirish', '0011', '555555')
    S.login('retabel', '0300', '9999')
    r = S.a.get('/admin/state', headers={'X-Admin-Token': S.atok})
    st = r.json()
    for k in ('version', 'port', 'fp', 'ips', 'backups'):
        st.pop(k, None)
    st['users'] = sorted(st['users'], key=lambda x: x['tabel'])
    S.out.append(('panel holat', {'status': r.status_code, 'body': S.norm(st)}))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--old', required=True)
    ap.add_argument('--old-admin', required=True)
    ap.add_argument('--new', required=True)
    ap.add_argument('--new-admin', required=True)
    ap.add_argument('--apikey', required=True)
    a = ap.parse_args()
    O = Side(a.old, a.old_admin, a.apikey)
    tokens = {}
    for t, pw in USERS:  # tokenlar ESKI serverdan olinadi va ikkala serverda ishlatiladi
        r = O.c.post('/auth/v1/token?grant_type=password', headers=O.h(), json={'email': 't%s@agmk-sttb.app' % t, 'password': derive(t, pw)})
        tokens[t] = r.json()['access_token']
    N = Side(a.new, a.new_admin, a.apikey)
    for t, pw in USERS:  # audit jurnalida ikkala tomonda bir xil yozuvlar boʻlsin
        N.c.post('/auth/v1/token?grant_type=password', headers=N.h(), json={'email': 't%s@agmk-sttb.app' % t, 'password': derive(t, pw)})
    reads(O, tokens)
    reads(N, tokens)
    sys.exit(1 if report(O.out, N.out, 'Koʻchirish sinovi') else 0)


if __name__ == '__main__':
    main()
