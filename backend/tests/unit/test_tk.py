"""4.9 b119: tugʻilgan kunlar (bugun / ertaga) — bazasiz, soxta xodimlar bilan. Sana javobga chiqmasligi tekshiriladi."""
import asyncio
import datetime as dt
import json
import unittest
from unittest import mock

from app.api import my as M


def X(t, lav='Usta', unit='u2', rank=5):
    return {'tabel': t, 'name': 'Soxta ' + t, 'lav': lav, 'unit': unit, 'grp': None, 'uch': '', 'rank': rank, 'itr': True, 'pos': None}


class TkDate(unittest.TestCase):
    def test_feb29(self):
        self.assertEqual(M._tk_md(dt.date(2000, 2, 29), 2027), dt.date(2027, 2, 28))
        self.assertEqual(M._tk_md(dt.date(2000, 2, 29), 2028), dt.date(2028, 2, 29))
        self.assertEqual(M._tk_md(dt.date(1990, 10, 27), 2026), dt.date(2026, 10, 27))


class TkList(unittest.TestCase):
    def run_tk(self, allv, mine):
        today = dt.date.today()
        tom = today + dt.timedelta(days=1)
        P = {t: X(t) for t in ['1', '2', '3', '4', '9']}
        B = {'1': today.replace(year=1990), '2': M._tk_md(tom, 1985) if tom.month != 2 or tom.day != 29 else dt.date(1984, 2, 29),
             '3': (today + dt.timedelta(days=5)).replace(year=1980), '4': today.replace(year=1975)}

        async def people():
            return P

        async def visible(t, a):
            return {x: {'via': 'auto'} for x in mine}

        async def sees_all(u):
            return allv

        async def births(ts):
            return {t: d for t, d in B.items() if t in ts}

        with mock.patch.object(M.org, 'people', people), mock.patch.object(M.org, 'visible', visible), \
                mock.patch.object(M.org, 'names', lambda: {'u': {}, 'g': {}}), mock.patch.object(M, '_sees_all', sees_all), \
                mock.patch.object(M, '_births', births):
            r = asyncio.run(M.my_tk(None, {'tabel': '9', 'role': 'editor'}))
        return json.loads(r.body)

    def test_rahbar_only_own(self):
        d = self.run_tk(False, ['1', '2', '3'])
        self.assertFalse(d['all'])
        self.assertEqual([(x['tabel'], x['kun']) for x in d['list']], [('1', 'bugun'), ('2', 'ertaga')])
        self.assertNotIn('4', [x['tabel'] for x in d['list']])

    def test_all_roles_see_everyone(self):
        d = self.run_tk(True, ['1'])
        self.assertTrue(d['all'])
        T = {x['tabel']: x for x in d['list']}
        self.assertEqual(set(T), {'1', '2', '4'})
        self.assertTrue(T['1']['mine'])
        self.assertFalse(T['4']['mine'])

    def test_no_birth_date_leaks(self):
        d = self.run_tk(True, [])
        s = json.dumps(d)
        for y in ('1990', '1985', '1984', '1975'):
            self.assertNotIn(y, s)
        for x in d['list']:
            self.assertFalse({'birth', 'birthDate', 'b'} & set(x))


if __name__ == '__main__':
    unittest.main()
