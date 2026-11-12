"""Shifrlash va xeshlar eski Node server bilan bayt-baraybar mosligi (qiymatlar Node.js crypto bilan olingan).

    python -m unittest discover -s tests/unit
"""
from __future__ import annotations

import os
import tempfile
import unittest

os.environ.setdefault('AGMK_SECRETS_DIR', tempfile.mkdtemp())

from app.core import security as S  # noqa: E402
from app.core.utils import iso_to_micros, micros_to_iso, next_stamp, surname_key  # noqa: E402

NODE = {  # node -e "crypto.scryptSync(...)" va h.k. bilan hisoblangan (jwt — HS256, soxta ism bilan qayta hisoblangan)
    'salt': '0123456789abcdef0123456789abcdef',
    'h': '6d27f620920195d00976b6872bb399b0a2661fc11c421db69fd44887fb829512',
    'd': '758a8f8f6c779a7a9260d2fbe56d648e5e4a0713',
    'enc': 'e1:BwcHBwcHBwcHBwcHPy6NkWlu+POSnAsdKCox0wqd42jMlM+xnyU=',
    'jwt': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTgyIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhcHBfcm9sZSI6ImFkbWluIiwibmFtZSI6IlNpbm92IFNveHRhIiwiZXhwIjo0MTAyNDQ0ODAwfQ.O8MCJAediwphERc_hSE0NBaY8n9qFuu68iNZdsX6n6E',
}


class Security(unittest.TestCase):
    def setUp(self):
        S.Keys.jwt_secret = 'testsecret'
        import hashlib
        S.Keys.enc_key = hashlib.sha256(b'agmk-sig:testsecret').digest()

    def test_scrypt_same_as_node(self):
        self.assertEqual(S.hash_pw('parol123', NODE['salt']), NODE['h'])

    def test_derive_same_as_node(self):
        self.assertEqual(S.derive_pw('2582', '111111'), NODE['d'])

    def test_decrypt_node_signature(self):
        self.assertEqual(S.dec(NODE['enc']), 'salom imzo')

    def test_encrypt_roundtrip(self):
        self.assertEqual(S.dec(S.enc('imzo ✍️')), 'imzo ✍️')
        self.assertEqual(S.dec_buf(S.enc_buf(b'\x00fayl')), b'\x00fayl')

    def test_node_jwt_accepted_and_ours_identical(self):
        p = S.verify_jwt(NODE['jwt'])
        self.assertEqual(p['sub'], '2582')
        self.assertEqual(S.sign_jwt({'sub': '2582', 'role': 'authenticated', 'app_role': 'admin', 'name': 'Sinov Soxta', 'exp': 4102444800}), NODE['jwt'])

    def test_jwt_tampered_rejected(self):
        self.assertIsNone(S.verify_jwt(NODE['jwt'][:-2] + 'xx'))
        self.assertIsNone(S.verify_jwt('a.b'))

    def test_fail_lock(self):
        k = 'test:%d' % id(self)
        for _ in range(4):
            S.fail_add(k)
        self.assertEqual(S.fail_locked(k), 0)
        S.fail_add(k)
        self.assertGreater(S.fail_locked(k), 10)
        S.fail_clear(k)
        self.assertEqual(S.fail_locked(k), 0)


class Util(unittest.TestCase):
    def test_stamp_monotonic_and_format(self):
        s1, m1 = next_stamp(0)
        s2, m2 = next_stamp(m1 + 10_000_000)  # soat orqada qolsa ham oʻsadi
        self.assertGreater(m2, m1)
        self.assertGreater(s2, s1)
        self.assertRegex(s1, r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$')
        self.assertEqual(iso_to_micros(micros_to_iso(m2)), m2)
        self.assertEqual(iso_to_micros('2026-10-08T03:12:45.123Z'), 1791429165123000)

    def test_surname_key(self):
        self.assertEqual(surname_key('Тўхтаев А.А.'), surname_key("To'xtayev Anvar"))


if __name__ == '__main__':
    unittest.main()
