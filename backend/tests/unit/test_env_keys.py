"""IT talabi: kalitlar .env (muhit oʻzgaruvchilari) dan oʻqiladi, boʻlmasa — fayldan."""
import os
import tempfile
import unittest
from pathlib import Path


class EnvKeys(unittest.TestCase):
    def test_env_overrides_files(self):
        from app.core import security
        from app.core.config import settings
        d = tempfile.mkdtemp()
        old = settings.secrets_dir
        try:
            object.__setattr__(settings, 'secrets_dir', Path(d))
            os.environ['AGMK_JWT_SECRET'] = 'j' * 64
            os.environ['AGMK_ANON_KEY'] = 'agmk_test_key'
            security.Keys.load()
            self.assertEqual(security.Keys.jwt_secret, 'j' * 64)
            self.assertEqual(security.Keys.anon_key, 'agmk_test_key')
            self.assertFalse((Path(d) / 'jwt.secret').exists())
            del os.environ['AGMK_JWT_SECRET'], os.environ['AGMK_ANON_KEY']
            security.Keys.load()
            self.assertTrue((Path(d) / 'jwt.secret').exists())
        finally:
            object.__setattr__(settings, 'secrets_dir', old)

    def test_db_password_env(self):
        from app.core.config import Settings
        os.environ['AGMK_DB_PASSWORD'] = 'p@ss:w/rd'
        try:
            s = Settings()
            self.assertIn('p%40ss%3Aw%2Frd@', s.dsn)
        finally:
            del os.environ['AGMK_DB_PASSWORD']


if __name__ == '__main__':
    unittest.main()
