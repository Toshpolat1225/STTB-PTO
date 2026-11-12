"""3.18: tuzilma boʻyicha koʻrinish va maxsus kiyim normasi (bazasiz, soxta xodimlar bilan)."""
import datetime as dt
import unittest

from app.services import org


def P(t, lav, unit, grp=None, pos=None, itr=True, uch=''):
    return {'tabel': t, 'name': 'X' + t, 'lav': lav, 'unit': unit, 'grp': grp, 'pos': pos, 'itr': itr, 'uch': uch, 'rank': org.rank(lav, not itr)}


PEOPLE = {x['tabel']: x for x in [
    P('1', "Boshqarma boshlig'i", 'u1', pos=1),
    P('3', "Umumiy masalalar bo'yicha boshliq o'rinbosari", 'u1', pos=3),
    P('57', "Sex boshlig'i", 'u2', pos=57),
    P('62', "Harakatlanuvchi sostav ekspluatatsiyasi bo'yicha sex boshlig'i o'rinbosari", 'u2', 'u2g1', pos=62),
    P('80', "Tashqi logistika bo'yicha sex boshlig'i o'rinbosari", 'u2', pos=80),
    P('59', "Mehnat bo'yicha I-toifali iqtisodchi", 'u2', pos=59),
    P('73', 'Uchastka ustasi', 'u2', 'u2g7', pos=73),
    P('70', 'Uchastka ustasi', 'u2', None, pos=None),   # oʻrni belgilanmagan usta
    P('w1', 'Elektrovoz mashinisti', 'u2', 'u2g1', itr=False),
    P('w2', "Vagonlarni ko'zdan kechirish bo'yicha chilangar", 'u2', 'u2g7', itr=False, uch='Пункт технического обслуживания вагонов'),
    P('w3', 'Binolar qoʻriqchisi', 'u12', itr=False),
    P('w4', "Temir yoʻl ishchisi (Razrezlarda, karyerlarda)", 'u5', 'u5g2', itr=False, uch='Кальмакырский участок'),
]}


class Rank(unittest.TestCase):
    def test_rank(self):
        self.assertEqual(org.rank("Boshqarma boshlig'i"), 1)
        self.assertEqual(org.rank("Sex boshlig'i"), 2)
        self.assertEqual(org.rank("Xizmat boshlig'i o'rinbosari"), 3)
        self.assertEqual(org.rank('Yetakchi muhandis'), 4)
        self.assertEqual(org.rank('Uchastka ustasi'), 5)
        self.assertEqual(org.rank('Tokar', True), 6)


class Visibility(unittest.TestCase):
    def v(self, t, all_=False):
        return org.auto_vis(PEOPLE[t], PEOPLE, all_)

    def test_head_sees_all(self):
        self.assertEqual(self.v('1'), set(PEOPLE))

    def test_sex_head_whole_unit(self):
        self.assertEqual(self.v('57'), {'57', '62', '80', '59', '73', '70', 'w1', 'w2'})

    def test_unit_deputy_sees_below_only(self):
        self.assertEqual(self.v('80'), {'59', '73', '70', 'w1', 'w2'})  # oʻzi va boshligʻi koʻrinmaydi

    def test_group_deputy_sees_own_group(self):
        self.assertEqual(self.v('62'), {'w1'})

    def test_usta_sees_own_uchastka_workers(self):
        self.assertEqual(self.v('73'), {'w2'})

    def test_unplaced_usta_and_specialist_see_nobody(self):
        self.assertEqual(self.v('70'), set())
        self.assertEqual(self.v('59'), set())
        self.assertEqual(self.v('w1'), set())

    def test_boss_tree(self):
        self.assertEqual(self.v('3'), set())  # 3 → u1g5, u11, u13 (bu yerda hech kim yoʻq)

    def test_all_roles(self):
        self.assertEqual(self.v('59', True), set(PEOPLE))


class Kiyim(unittest.TestCase):
    def test_groups(self):
        self.assertEqual(org.kiy_group('Elektrovoz mashinisti'), 'lok')
        self.assertEqual(org.kiy_group('Elektr-gaz payvandchi'), 'payvand')
        self.assertEqual(org.kiy_group("Yo'l ustasi"), 'usta')
        self.assertEqual(org.kiy_group('I-toifali buxgalter'), 'ofis')

    def test_conditions(self):
        self.assertIn('elektrovoz', org.kiy_shart(PEOPLE['w1']))
        self.assertIn('karyer', org.kiy_shart(PEOPLE['w4']))
        self.assertIn('TXP', org.kiy_shart(PEOPLE['w2']))

    def test_plan(self):
        today = dt.date(2026, 10, 14)
        iss = [{'item': 'kostum', 'issued': dt.date(2025, 9, 1), 'cancelled': None},
               {'item': 'kurtka_q', 'issued': dt.date(2025, 10, 1), 'cancelled': None},
               {'item': 'botinka', 'issued': dt.date(2026, 10, 1), 'cancelled': dt.datetime(2026, 10, 2)}]
        pl = org.kiy_plan(PEOPLE['w1'], None, iss, today)
        R = {r['b']: r for r in pl['rows']}
        self.assertEqual(pl['grp'], 'lok')
        self.assertEqual(R['kostum']['st'], 'kech')            # 12 oy oʻtgan
        self.assertEqual(R['kostum']['next'], '2026-09-01')
        self.assertEqual(R['kurtka_q']['st'], 'ok')            # 36 oy — 2028-10-01 gacha
        self.assertEqual(R['botinka']['st'], 'kerak')          # bekor qilingan yozuv hisoblanmaydi
        self.assertEqual(R['dielqolqop']['st'], 'navb')        # elektrovozda — navbatchi
        self.assertNotIn('kaska', R)                           # karyer sharti yoʻq
        pl2 = org.kiy_plan(PEOPLE['w1'], {'grp': 'ofis'}, iss, today)
        self.assertEqual(pl2['grp'], 'ofis')
        self.assertFalse(pl2['auto'])

    def test_add_months(self):
        self.assertEqual(org.add_months(dt.date(2026, 1, 31), 1), dt.date(2026, 2, 28))
        self.assertEqual(org.add_months(dt.date(2025, 10, 1), 36), dt.date(2028, 10, 1))


if __name__ == '__main__':
    unittest.main()
