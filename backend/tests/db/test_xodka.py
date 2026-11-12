"""4.4 xodka koʻrinishlari (oqish.xodkalar, oqish.vagon_xodka, oqish.smenalar) — haqiqiy PostgreSQL da, soxta maʼlumot bilan.

    PG_TEST_DSN='postgresql://postgres@/postgres?host=/var/run/postgresql' python -m unittest -v tests/db/test_xodka.py
"""
from __future__ import annotations

import asyncio
import json
import os
import unittest
from urllib.parse import urlsplit, urlunsplit

ADMIN = os.environ.get('PG_TEST_DSN', '')


def dsn(name: str) -> str:
    u = urlsplit(ADMIN)
    return urlunsplit((u.scheme, u.netloc, '/' + name, u.query, ''))


@unittest.skipUnless(ADMIN, 'PG_TEST_DSN berilmagan')
class Xodka(unittest.TestCase):
    DB = 'agmk_xk_t'

    @classmethod
    def setUpClass(cls):
        import psycopg
        with psycopg.connect(ADMIN, autocommit=True) as c:
            c.execute('DROP DATABASE IF EXISTS "%s"' % cls.DB)
            c.execute('CREATE DATABASE "%s"' % cls.DB)
        os.environ['AGMK_DB_URL'] = dsn(cls.DB)
        from app.core import database as db
        asyncio.run(db.migrate())
        cls.c = psycopg.connect(dsn(cls.DB), autocommit=True)
        put = lambda i, d, dl=False: cls.c.execute("INSERT INTO records (id, kind, data, deleted, updated_at, updated_by) VALUES (%s, 'mod', %s, %s, now(), '9001')", (i, json.dumps(d), dl))
        put('m:smena:s1', {'id': 's1', 'tabel': '9001', 'name': 'Soxta Mashinist', 'kind': 'lok', 'unitId': 77, 'unitName': 'Soxta lok 1', 'start': '2026-10-20T05:00:00.000Z', 'end': '2026-10-20T17:00:00.000Z', 'm': 60000})
        put('m:smena:s2', {'id': 's2', 'name': 'Soxta Mashinist', 'kind': 'yol', 'unitName': 'Soxta motovoz', 'tarkibId': 't9', 'start': '2026-10-20T05:00:00.000Z', 'end': '2026-10-20T09:00:00.000Z', 'm': 30000,
                               'seg': [{'a': '2026-10-20T05:10:00.000Z', 'm': 0, 'vag': [201]}, {'a': '2026-10-20T06:00:00.000Z', 'm': 12000, 'vag': [201, 202]}]})
        put('m:smena:s3', {'id': 's3', 'name': 'Soxta', 'kind': 'lok', 'start': '2026-10-20T05:00:00.000Z', 'm': 5000, 'seg': [{'m': 0, 'vag': [301]}]})  # yopilmagan
        put('m:xodka:a1', {'id': 'a1', 'sana': '2026-10-20', 'at': '2026-10-20T08:00:00.000Z', 'smId': 's1', 'tabel': '9001', 'name': 'Soxta Mashinist', 'lokId': 77, 'lokName': 'Soxta lok 1', 'tarkibNo': '3', 'vag': [101, 102, 103], 'mz': 'kkd', 'soni': 1.5, 'tn': 2300})
        put('m:xodka:a2', {'id': 'a2', 'sana': '2026-10-20', 'at': '2026-10-20T12:00:00.000Z', 'smId': 's1', 'tabel': '9001', 'name': 'Soxta Mashinist', 'lokId': 77, 'vag': [101, 102], 'mz': 'nak', 'soni': 1, 'tn': 0})
        put('m:xodka:a3', {'id': 'a3', 'sana': 'notoʻgʻri', 'vag': 'x', 'mz': 'bosh', 'soni': 'abc'})
        put('m:xodka:a4', {'id': 'a4', 'del': True})
        put('m:xodka:a5', {'id': 'a5', 'sana': '2026-10-19', 'vag': [1], 'mz': 'kkd', 'soni': 1}, True)

    @classmethod
    def tearDownClass(cls):
        cls.c.close()

    def test_xodkalar(self):
        R = self.c.execute('SELECT id, sana::text, manzil, xodka_soni, nakladnoy_t, vagonlar_soni FROM oqish.xodkalar ORDER BY id').fetchall()
        self.assertEqual([r[0] for r in R], ['a1', 'a2', 'a3'], 'oʻchirilganlar koʻrinmaydi')
        self.assertEqual(R[0][1:], ('2026-10-20', 'KKD (fabrika)', 1.5, 2300, 3))
        self.assertIsNone(R[1][4], 'nakladnoy 0 → NULL')
        self.assertEqual(R[2][1:], (None, 'Boʻsh jins', None, None, None), 'buzilgan yozuv toʻxtatmaydi')

    def test_vagon_xodka(self):
        R = self.c.execute("SELECT vagon_id, count(*), sum(xodka_soni) FROM oqish.vagon_xodka GROUP BY vagon_id ORDER BY vagon_id").fetchall()
        self.assertEqual([(r[0], r[1], float(r[2])) for r in R], [('101', 2, 2.5), ('102', 2, 2.5), ('103', 1, 1.5)])

    def test_smenalar(self):
        r = self.c.execute("SELECT xodim, texnika, gps_km, tugadi - boshlandi FROM oqish.smenalar WHERE id = 's1'").fetchone()
        self.assertEqual(r[0:3], ('Soxta Mashinist', 'Soxta lok 1', 60))
        self.assertEqual(str(r[3]), '12:00:00')

    def test_naryad(self):
        R = self.c.execute('SELECT vagon_id, sum(km) FROM oqish.vagon_naryad GROUP BY vagon_id ORDER BY vagon_id').fetchall()
        self.assertEqual([(r[0], float(r[1])) for r in R], [('201', 30.0), ('202', 18.0)], 'yopilmagan smena kirmaydi')

    def test_oqish_huquqi(self):
        r = self.c.execute("SELECT has_table_privilege('agmk_oqish', 'oqish.xodkalar', 'SELECT'), has_table_privilege('agmk_oqish', 'oqish.vagon_xodka', 'SELECT'), has_table_privilege('agmk_oqish', 'oqish.smenalar', 'SELECT'), has_table_privilege('agmk_oqish', 'oqish.vagon_naryad', 'SELECT')").fetchone()
        self.assertEqual(r, (True, True, True, True))


if __name__ == '__main__':
    unittest.main()
