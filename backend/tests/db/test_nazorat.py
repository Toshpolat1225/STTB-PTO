"""4.2 nazorat (audit) sinovi — haqiqiy PostgreSQL da, faqat soxta maʼlumot bilan.

    PG_TEST_DSN='postgresql://postgres@/postgres?host=/var/run/postgresql' python -m unittest -v tests/db/test_nazorat.py

Sinov bazasi (agmk_nz_t, agmk_nz_t2) har safar qayta yaratiladi. PG_TEST_DSN berilmasa — sinov oʻtkazib yuboriladi.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import tempfile
import unittest
from urllib.parse import urlsplit, urlunsplit

ADMIN = os.environ.get('PG_TEST_DSN', '')


def dsn(name: str, app: str = 'agmk-backend', user: str | None = None) -> str:
    u = urlsplit(ADMIN)
    net = u.netloc if user is None else user + '@' + u.netloc.split('@')[-1]
    q = (u.query + '&' if u.query else '') + 'application_name=' + app
    return urlunsplit((u.scheme, net, '/' + name, q, ''))


@unittest.skipUnless(ADMIN, 'PG_TEST_DSN berilmagan')
class Nazorat(unittest.TestCase):
    DB = 'agmk_nz_t'

    @classmethod
    def setUpClass(cls):
        import psycopg
        cls.pg = psycopg
        with psycopg.connect(ADMIN, autocommit=True) as c:
            for d in (cls.DB, cls.DB + '2'):
                c.execute('DROP DATABASE IF EXISTS "%s"' % d)
            c.execute('CREATE DATABASE "%s"' % cls.DB)
        os.environ['AGMK_DB_URL'] = dsn(cls.DB)
        from app.core import database as db
        asyncio.run(db.migrate())
        from app.core.permissions import KV_ACL, MOD_ACL, PD_KEYS

        async def sync():
            await db.open_pool()
            await db.nazorat_sync(KV_ACL, PD_KEYS, ['kv:agmk_audit_v1'], ['m:%s:' % k for k in MOD_ACL])
            await db.close_pool()
        asyncio.run(sync())
        cls.app = psycopg.connect(dsn(cls.DB), autocommit=True)
        cls.qol = psycopg.connect(dsn(cls.DB, 'DBeaver 26.2.3 - Main'), autocommit=True)
        a = cls.app
        for t in ('9001', '9002', '9003'):
            a.execute("INSERT INTO users (tabel, name, salt, hash, status) VALUES (%s, 'Soxta ' || %s, 's', 'h', 'active')", (t, t))
        a.execute("INSERT INTO records (id, kind, data, updated_at, updated_by) VALUES ('v:1', 'vagon', '{\"num\":\"99001\"}', '2026-10-19T00:00:00.000001Z', '9001')")
        a.execute("INSERT INTO history (id, kind, data, deleted, updated_at, updated_by) VALUES ('v:1', 'vagon', '{\"num\":\"99001\"}', false, '2026-10-19T00:00:00.000001Z', '9001')")
        a.execute("""INSERT INTO records (id, kind, data, updated_at, updated_by) VALUES ('x:9001', 'xodim', '{"fio":"Soxta","oklad":5000000,"birthDate":"1990-01-01","lavozim":"usta"}', '2026-10-19T00:00:00.000002Z', '9001')""")
        a.execute("INSERT INTO records (id, kind, data, updated_at, updated_by) VALUES ('kv:agmk_bux', 'kv', '{\"maxfiy\":1}', '2026-10-19T00:00:00.000003Z', '9001')")
        a.execute("INSERT INTO sign_docs (id, title, html, hash, created_by, signers) VALUES ('sd1', 'Akt', '<p>x</p>', 'h1', '9001', '[]')")
        a.execute("INSERT INTO sign_acts (doc_id, tabel, action, hash) VALUES ('sd1', '9002', 'sign', 'h1')")
        a.execute("INSERT INTO messages (from_tabel, to_tabel, text) VALUES ('9001', '9003', 'salom')")
        a.execute("INSERT INTO refresh (token, tabel, expires) VALUES ('tok1', '9003', 1)")
        a.execute("INSERT INTO audit (tabel, action) VALUES ('9001', 'kirdi')")
        a.execute("INSERT INTO hr_pd (tabel, phone, address) VALUES ('9001', '+998000000000', 'Soxta koʻcha')")

    @classmethod
    def tearDownClass(cls):
        cls.app.close()
        cls.qol.close()

    def last(self, jadval: str):
        return self.app.execute('SELECT * FROM nazorat.ozgarishlar WHERE jadval = %s ORDER BY seq DESC LIMIT 1', ('public.' + jadval,)).fetchone()

    def test_01_ilova_insert_faqat_kalit(self):
        r = self.app.execute("SELECT amal, kalit, yangi, sql, dastur FROM nazorat.ozgarishlar WHERE jadval = 'public.records' AND kalit->>'id' = 'v:1'").fetchone()
        self.assertEqual(r[0], 'INSERT')
        self.assertIsNone(r[2])
        self.assertIsNone(r[3], 'ilova buyrugʻi yozilmaydi')
        self.assertEqual(r[4], 'agmk-backend')

    def test_02_qolda_update_kim_va_nima(self):
        self.qol.execute("""UPDATE records SET data = '{"num":"99999"}' WHERE id = 'v:1'""")
        r = self.last('records')
        self.assertEqual(r[3], 'UPDATE')
        self.assertEqual(r[5], ['data'])
        self.assertEqual(r[6], {'data': {'num': '99001'}})
        self.assertEqual(r[7], {'data': {'num': '99999'}})
        self.assertTrue(r[9].startswith('DBeaver'))
        self.assertIn('99999', r[11])
        v = self.app.execute("SELECT manba FROM nazorat.v_ozgarishlar ORDER BY seq DESC LIMIT 1").fetchone()[0]
        self.assertIn('(qoʻlda)', v)

    def test_03_ozgarmagan_update_yozilmaydi(self):
        n0 = self.app.execute('SELECT count(*) FROM nazorat.ozgarishlar').fetchone()[0]
        self.app.execute("UPDATE users SET name = name WHERE tabel = '9001'")
        self.assertEqual(self.app.execute('SELECT count(*) FROM nazorat.ozgarishlar').fetchone()[0], n0)

    def test_04_jurnallarni_ochirib_bolmaydi(self):
        for q in ("DELETE FROM history", "UPDATE history SET kind = 'x'", "TRUNCATE history", "DELETE FROM audit",
                  "DELETE FROM nazorat.ozgarishlar", "UPDATE nazorat.ozgarishlar SET amal = 'INSERT'", "TRUNCATE nazorat.ozgarishlar"):
            with self.assertRaises(self.pg.errors.InsufficientPrivilege, msg=q):
                self.qol.execute(q)

    def test_05_maxfiy_ustunlar_jurnalda_yoq(self):
        self.qol.execute("UPDATE users SET salt = 's2', hash = 'h2', lavozim = 'usta' WHERE tabel = '9002'")
        r = self.last('users')
        self.assertEqual(r[5], ['hash', 'lavozim', 'salt'])
        self.assertEqual(set(r[6]), {'lavozim'})
        self.qol.execute("UPDATE hr_pd SET phone = '+998111111111' WHERE tabel = '9001'")
        r = self.last('hr_pd')
        self.assertIn('phone', r[5])
        self.assertIsNone(r[6])
        self.assertIsNone(r[7])
        self.assertEqual(r[11], '(maxfiy — yozilmadi)')

    def test_06_imzo_chekkan_hisob_ochirilmaydi(self):
        with self.assertRaises(self.pg.errors.ForeignKeyViolation):
            self.qol.execute("DELETE FROM users WHERE tabel = '9002'")
        with self.assertRaises(self.pg.errors.ForeignKeyViolation):
            self.qol.execute("INSERT INTO sign_acts (doc_id, tabel, action) VALUES ('yoq', '9002', 'sign')")

    def test_07_retabel_kaskad(self):
        self.app.execute("UPDATE users SET tabel = '9902' WHERE tabel = '9002'")
        self.assertEqual(self.app.execute("SELECT tabel FROM sign_acts WHERE doc_id = 'sd1'").fetchone()[0], '9902')
        self.app.execute("UPDATE users SET tabel = '9002' WHERE tabel = '9902'")

    def test_08_hisob_ochsa_bogliqlari_ham(self):
        self.app.execute("DELETE FROM users WHERE tabel = '9003'")
        self.assertEqual(self.app.execute("SELECT count(*) FROM messages WHERE to_tabel = '9003'").fetchone()[0], 0)
        self.assertEqual(self.app.execute("SELECT count(*) FROM refresh WHERE tabel = '9003'").fetchone()[0], 0)
        r = self.last('messages')
        self.assertEqual(r[3], 'DELETE')
        self.assertEqual(r[6]['text'], 'salom', 'oʻchirilgan xabar jurnalda saqlanadi')

    def test_09_ddl_yoziladi(self):
        self.app.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())')
        n0 = self.app.execute("SELECT count(*) FROM nazorat.ozgarishlar WHERE amal = 'DDL'").fetchone()[0]
        self.qol.execute('ALTER TABLE records DISABLE TRIGGER nazorat')
        self.qol.execute('ALTER TABLE records ENABLE TRIGGER nazorat')
        r = self.app.execute("SELECT kalit, sql FROM nazorat.ozgarishlar WHERE amal = 'DDL' ORDER BY seq DESC LIMIT 2").fetchall()
        self.assertEqual(self.app.execute("SELECT count(*) FROM nazorat.ozgarishlar WHERE amal = 'DDL'").fetchone()[0], n0 + 2)
        self.assertIn('DISABLE TRIGGER', r[1][1])

    def test_10_oqish_roli(self):
        self.app.execute("ALTER ROLE agmk_oqish LOGIN PASSWORD 'sinov12345'")
        with self.pg.connect(dsn(self.DB, 'DBeaver', 'agmk_oqish:sinov12345'), autocommit=True) as c:
            d = c.execute("SELECT data FROM yozuvlar WHERE id = 'x:9001'").fetchone()[0]
            self.assertEqual(d, {'fio': 'Soxta', 'lavozim': 'usta'}, 'oklad va tugʻilgan sana yoʻq')
            self.assertIsNone(c.execute("SELECT data FROM yozuvlar WHERE id = 'kv:agmk_bux'").fetchone()[0])
            self.assertEqual(c.execute("SELECT data FROM yozuvlar WHERE id = 'v:1'").fetchone()[0], {'num': '99999'})
            self.assertEqual(c.execute('SELECT buzilgan FROM zanjir_tekshir()').fetchone()[0], 0)
            self.assertGreater(c.execute('SELECT count(*) FROM ozgarishlar').fetchone()[0], 5)
            self.assertGreater(c.execute('SELECT count(*) FROM jadvallar_hajmi').fetchone()[0], 15)
            for q in ('SELECT * FROM public.hr_pd', 'SELECT * FROM public.users', 'SELECT * FROM public.oklad', 'SELECT eski FROM nazorat.ozgarishlar'):
                with self.assertRaises(self.pg.errors.InsufficientPrivilege, msg=q):
                    c.execute(q)
            with self.assertRaises(self.pg.errors.ReadOnlySqlTransaction):
                c.execute("CREATE TABLE oqish.x (a int)")
        self.app.execute('ALTER ROLE agmk_oqish NOLOGIN PASSWORD NULL')

    def test_11_zanjir_va_zaxira(self):
        self.assertEqual(self.app.execute('SELECT buzilgan FROM nazorat.tekshir()').fetchone()[0], 0)
        n, xesh = self.app.execute('SELECT jami, oxirgi_xesh FROM nazorat.tekshir()').fetchone()
        # zaxira → tiklash: zanjir aynan saqlanadi (triggerlar maʼlumot yuklangandan keyin yaratiladi)
        pd, pr = shutil.which('pg_dump'), shutil.which('pg_restore')
        if pd and pr:
            with tempfile.TemporaryDirectory() as w:
                f = os.path.join(w, 'z.dump')
                subprocess.run([pd, '-Fc', '-f', f, dsn(self.DB)], check=True)
                with self.pg.connect(ADMIN, autocommit=True) as c:
                    c.execute('CREATE DATABASE "%s"' % (self.DB + '2'))
                subprocess.run([pr, '--no-owner', '-d', dsn(self.DB + '2'), f], check=True)
            with self.pg.connect(dsn(self.DB + '2'), autocommit=True) as c:
                self.assertEqual(c.execute('SELECT jami, buzilgan, oxirgi_xesh FROM nazorat.tekshir()').fetchone(), (n, 0, xesh))
                self.assertEqual(c.execute('SELECT count(*) FROM nazorat.boglanishlar').fetchone()[0], 34)
        # qasddan buzish (superuser triggerni oʻchirib yozuvni oʻzgartiradi) — tekshiruv aniqlaydi
        self.qol.execute('ALTER TABLE nazorat.ozgarishlar DISABLE TRIGGER taqiq')
        self.qol.execute("UPDATE nazorat.ozgarishlar SET db_user = 'boshqa' WHERE seq = 3")
        self.qol.execute('ALTER TABLE nazorat.ozgarishlar ENABLE TRIGGER taqiq')
        b, f = self.app.execute('SELECT buzilgan, birinchi_buzilgan FROM nazorat.tekshir()').fetchone()
        self.assertEqual((b, f), (1, 3))
        self.assertEqual(self.app.execute("SELECT count(*) FROM nazorat.ozgarishlar WHERE amal = 'DDL' AND sql ILIKE '%DISABLE TRIGGER taqiq%'").fetchone()[0], 1)

    def test_12_hamma_tabel_xodimlarga_bogliq(self):
        a = self.app
        self.assertEqual(a.execute('SELECT count(*), count(*) FILTER (WHERE tekshirilgan) FROM nazorat.boglanishlar').fetchone(), (34, 34))
        # bogʻlanmagan jadval faqat tizimniki: settings, schema_migrations
        yakka = {r[0] for r in a.execute("""SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.contype = 'f' AND (k.conrelid = c.oid OR k.confrelid = c.oid))""")}
        self.assertEqual(yakka, {'settings', 'schema_migrations'})
        # shtatda yoʻq tabel — avtomatik qoʻshiladi, ilova toʻxtamaydi
        a.execute("INSERT INTO kiy_issue (tabel, item, issued, by_tabel) VALUES ('7777', 'kurtka', '2026-10-19', '9001')")
        self.assertEqual(a.execute("SELECT shtatda, manba FROM xodimlar WHERE tabel = '7777'").fetchone(), (False, 'avto:kiy_issue'))
        a.execute("INSERT INTO kir_seed (tabel, ch) VALUES ('6666#1', 'x')")
        self.assertEqual(a.execute("SELECT manba FROM xodimlar WHERE tabel = '6666'").fetchone()[0], 'avto:kir_seed')
        # boʻsh matn → NULL
        a.execute("INSERT INTO records (id, kind, data, updated_at, updated_by) VALUES ('v:2', 'vagon', '{}', '2026-10-19T00:00:00.000009Z', '')")
        self.assertIsNone(a.execute("SELECT updated_by FROM records WHERE id = 'v:2'").fetchone()[0])
        # xodimni oʻchirib boʻlmaydi
        with self.assertRaises(self.pg.errors.InsufficientPrivilege):
            self.qol.execute("DELETE FROM xodimlar WHERE tabel = '7777'")
        # retabel yangi tabel bilan ham ishlaydi
        a.execute("UPDATE users SET tabel = '8801' WHERE tabel = '9001'")
        self.assertEqual(a.execute("SELECT manba FROM xodimlar WHERE tabel = '8801'").fetchone()[0], 'avto:users')
        a.execute("UPDATE users SET tabel = '9001' WHERE tabel = '8801'")
        self.assertEqual(a.execute('SELECT buzilgan FROM nazorat.tekshir()').fetchone()[0], 1, 'test_11 dagi qasddan buzish')


if __name__ == '__main__':
    unittest.main()
