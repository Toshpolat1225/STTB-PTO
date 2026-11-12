"""5.5: davomat — grafik boʻyicha kech / erta / sababsiz hisobi. Bazasiz, soxta xodimlar bilan."""
import datetime as dt
import unittest

from app.services import attendance as L
from app.api import attendance as R

D = dt.date(2026, 11, 2)            # dushanba
PT = {k: dict(v, id=k) for k, v in L.PATTERNS.items()}


def at(d, h, m=0):
    return dt.datetime.combine(d, dt.time(h, m))


def ev(*xs):
    return [{'at': a, 'dir': d, 'obj': o} for a, d, o in xs]


def A(p, anchor=D):
    return [{'pattern': p, 'anchor': anchor, 'dfrom': D - dt.timedelta(days=30), 'dto': None}]


W = {'tabel': '900001', 'itr': False}
ITR = {'tabel': '900002', 'itr': True}
LATE = at(D + dt.timedelta(days=3), 0)       # kun toʻliq oʻtgan


class Cycle(unittest.TestCase):
    def test_dnvv(self):
        c = PT['dnvv']['cycle']
        self.assertEqual([L.code_on(c, D, D + dt.timedelta(days=i)) for i in range(6)], ['D', 'N', 'V', 'V', 'D', 'N'])

    def test_52_week(self):
        c = PT['w52']['cycle']
        self.assertEqual(''.join(L.code_on(c, dt.date(2024, 1, 1), D + dt.timedelta(days=i)) for i in range(7)), 'WWWWWVV')

    def test_night_window(self):
        a, b = L.window('N', D)
        self.assertEqual((a, b), (at(D, 19), at(D + dt.timedelta(days=1), 7)))


class Status(unittest.TestCase):
    def test_12h_left_after_9h_is_3h_early(self):
        s = R.evaluate(W, A('dnvv'), [], ev((at(D, 6, 55), 1, 'ЖДЦ-1'), (at(D, 16, 0), -1, 'ЖДЦ-1')), PT, D, LATE)
        self.assertEqual((s['code'], s['late'], s['early'], s['st']), ('D', 0, 180, 'ketgan'))

    def test_8h_worker_same_exit_is_ok(self):
        s = R.evaluate(W, A('w52', dt.date(2024, 1, 1)), [], ev((at(D, 6, 55), 1, ''), (at(D, 16, 0), -1, '')), PT, D, LATE)
        self.assertEqual((s['code'], s['early'], s['late']), ('W', 0, 0))

    def test_itr_default_and_late(self):
        s = R.evaluate(ITR, [], [], ev((at(D, 7, 53), 1, 'АБК УПЖТ'), (at(D, 16, 31), -1, 'АБК УПЖТ')), PT, D, LATE)
        self.assertEqual((s['code'], s['pat'], s['late'], s['early']), ('I', 'itr52', 23, 0))

    def test_night_shift_next_morning_exit(self):
        d2 = D + dt.timedelta(days=1)  # dnvv: 2-kun — noch
        s = R.evaluate(W, A('dnvv'), [], ev((at(d2, 18, 50), 1, ''), (at(d2 + dt.timedelta(days=1), 6, 20), -1, '')), PT, d2, LATE)
        self.assertEqual((s['code'], s['late'], s['early'], s['work']), ('N', 0, 40, 690))

    def test_rest_day_not_absent(self):
        s = R.evaluate(W, A('dnvv'), [], [], PT, D + dt.timedelta(days=2), LATE)
        self.assertEqual(s['st'], 'dam')

    def test_absent_without_reason(self):
        s = R.evaluate(W, A('dnvv'), [], [], PT, D, LATE)
        self.assertEqual(s['st'], 'sababsiz')

    def test_absent_with_reason(self):
        rs = [{'id': 1, 'kind': 'bol', 'dfrom': D - dt.timedelta(days=1), 'dto': D + dt.timedelta(days=5), 'note': ''}]
        s = R.evaluate(W, A('dnvv'), rs, [], PT, D, LATE)
        self.assertEqual((s['st'], s['reason']['kind']), ('sababli', 'bol'))

    def test_before_shift_waiting(self):
        s = R.evaluate(W, A('dnvv'), [], [], PT, D + dt.timedelta(days=1), at(D + dt.timedelta(days=1), 12))
        self.assertEqual(s['st'], 'kutish')

    def test_unassigned_without_events(self):
        s = R.evaluate(W, [], [], [], PT, D, LATE)
        self.assertEqual(s['st'], 'grafiksiz')

    def test_unassigned_guess(self):
        s = R.evaluate(W, [], [], ev((at(D, 6, 50), 1, ''), (at(D, 19, 5), -1, '')), PT, D, LATE)
        self.assertEqual((s['code'], s['guess'], s['early']), ('D', True, 0))

    def test_multiple_in_out_and_objects(self):
        E = ev((at(D, 6, 52), 1, 'ЖДЦ-1'), (at(D, 9, 40), -1, 'ЖДЦ-1'), (at(D, 10, 5), 1, 'Ст. Медная'), (at(D, 12, 10), -1, 'Ст. Медная'),
               (at(D, 12, 58), 1, 'ЖДЦ-1'), (at(D, 19, 6), -1, 'ЖДЦ-1'))
        s = R.evaluate(W, A('dnvv'), [], E, PT, D, LATE)
        self.assertEqual((s['n_out'], s['objs']['Ст. Медная'], s['early'], s['late']), (2, 125, 0, 0))
        self.assertEqual(L.tabel_mark(s['code'], s), '11')

    def test_inside_now(self):
        s = R.evaluate(W, A('dnvv'), [], ev((at(D, 6, 52), 1, 'КНСМ')), PT, D, at(D, 10))
        self.assertEqual((s['st'], s['inside'], s['obj']), ('ishda', True, 'КНСМ'))


class NoData(unittest.TestCase):
    def test_absent_without_data_is_not_sababsiz(self):
        s = R.nodata(R.evaluate(W, A('dnvv'), [], [], PT, D, LATE))
        self.assertEqual(s['st'], 'nodata')

    def test_reason_and_rest_unchanged(self):
        rs = [{'id': 1, 'kind': 'bol', 'dfrom': D, 'dto': D, 'note': ''}]
        self.assertEqual(R.nodata(R.evaluate(W, A('dnvv'), rs, [], PT, D, LATE))['st'], 'sababli')
        self.assertEqual(R.nodata(R.evaluate(W, A('dnvv'), [], [], PT, D + dt.timedelta(days=2), LATE))['st'], 'dam')


class Objects(unittest.TestCase):
    def test_match(self):
        self.assertEqual(R.obj_match('Турникет Ст.Медная вход'), 'Ст. Медная')
        self.assertEqual(R.obj_match('ВРП ЖДЦ-2 (турникет 2)'), 'ВРП ЖДЦ-2')
        self.assertEqual(R.obj_match('Новый пост'), 'Новый пост')
        self.assertEqual(R.obj_match('ЖДЦ-1'), 'ЖДЦ-1')
        self.assertEqual(R.obj_match('Турникет ЖДЦ-1 вход'), 'ЖДЦ-1')
        self.assertEqual(R.obj_match('Смотровая диспетчерской здания ждц-1'), 'Смотровая диспетчерской здания ЖДЦ-1')


if __name__ == '__main__':
    unittest.main()
