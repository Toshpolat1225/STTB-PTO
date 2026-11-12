"""6.2: shaxsiy kv kalitlari (kv:agmk_u_<tabel>_<nom>) — faqat egasi oʻqiydi va yozadi."""
import unittest

from app.core.permissions import kv_owner


class KvOwner(unittest.TestCase):
    def test_personal_key(self):
        self.assertEqual(kv_owner('kv:agmk_u_99901_hisob'), '99901')

    def test_shared_keys_not_personal(self):
        for k in ('kv:agmk_hisob', 'kv:agmk_mttb', 'kv:agmk_u__hisob', 'kv:agmk_u_abc_hisob', 'x:agmk_u_99901_hisob', 'kv:agmk_u_99901_HISOB'):
            self.assertIsNone(kv_owner(k), k)


if __name__ == '__main__':
    unittest.main()
