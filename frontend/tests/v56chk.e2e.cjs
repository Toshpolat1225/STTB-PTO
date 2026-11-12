// 5.6: hisobot (achot) tekshiruvi — aniqlik. Faqat SOXTA maʼlumot (haqiqiy hujjatlar shakli, soxta raqam va ismlar):
//   node frontend/tests/v56chk.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext()).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const o = {}, src = (f, s) => ({ f: f, s: s || 'L1' });
    const hid = (rows, set) => { Object.defineProperty(rows, '__hid', { value: new Set(set), enumerable: false }); return rows; };
    const sheet = (f, rows, s) => { const t = hpClassify(rows); return { f: f, s: s || 'L1', type: t, data: hpParseSheet(rows, t, src(f, s)) }; };
    const run = (sheets) => hpCheck({ sheets: sheets.filter(x => x.data), f30: null, month: '2026-10' }).findings;
    const has = (F, t, re) => F.some(f => f.t === t && (!re || re.test(f.name + ' ' + f.msg)));
    // 1) «СПРАВКА - РАСЧЕТ» (boʻshliq bilan), yorliqlar pastki qatorda, «на 183 ед» keyingi qatorda; «Замок автосцепки» — imzo emas
    const S1 = [['СПРАВКА - РАСЧЕТ'], ['На Октябрь 2026 г.'], ['', 'Склад', 'Вид опер', 'Получат', 'Шифр затрат'], ['', 336, 20, 9001, 221000], ['Ремонт думпкар 2 ВС-105 на участке ВРП'],
      ['№№ треб', 'Наименование', '', 'Ед.изм', 'Кол-во по норме', 'Факт-е кол-во'], ['', '', '', '', 'на 100 ед', ''], ['5,6', 'Шплинт Ø3 мм', '', 'шт', 400, 90], ['7', 'Замок автосцепки', '', 'шт', 10, 2], ['', 'Мастера ВРП', '', 'Soxtaev S.S.']];
    const a1 = sheet('a1.xls', S1); o.t1 = a1.type; const b1 = a1.data[0] || {};
    o.n1 = b1.N; o.ceh = b1.ceh; o.shpz = b1.shpz; o.zamok = (b1.items || []).some(it => /замок/i.test(it.name));
    // 2) «Кол-во на 236 шт.» + ikkinchi boʻlim («на 265 шт.») bir spravkada
    const S2 = [['СПРАВКА-РАСЧЕТ №___', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 331, 9232, 221000], ['Полное освидетельствование колесных пар 236 шт'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 236 шт. по норме', 'Факт кол-во'], [2, 'Бирки', 'шт', 1, 236, 200], [4, 'Болт М20х45', 'шт', 8, 1888, 213],
      ['Обыкновенное освидетельствование колесных пар 265 шт'], ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 265 шт. по норме', 'Факт кол-во'], [12, 'Смазка ЖРО', 'кг', 0.4, 106, 100], [20, 'Флюс АН-60', 'кг', 20, 5300, 1865]];
    const a2 = sheet('a2.xlsx', S2); o.blk2 = a2.data.map(x => x.N).join('/');
    const F2 = run([a2]); o.over2 = has(F2, 'over'); o.normcol2 = has(F2, 'normcol');
    // 3) blok sarlavhasida 22 ed., ustunda «на 2 шт» (raqamlar 22 boʻyicha) → 🔷, ❌ yoʻq
    const S3 = [['СПРАВКА-РАСЧЕТ №___', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 331, 9232, 221000], ['Ремонт электровозной колесной пары 22 ед.'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 2 шт. по норме', 'Факт кол-во'], [7, 'Шестерня тестовая', 'шт', 1, 22, 11], [5, 'Болт М-16х40', 'шт', 16, 352, 60]];
    const S3d = [['Дефектная ведомость за Октябрь 2026г на ремонт электровозных колесных пар 22 ед.'], ['Наименование работ', 'Материалы и зап.части', 'Ед.изм.', 'Потребное кол-во'],
      ['Замена деталей', 'Шестерня тестовая', 'шт', 11], ['', 'Болт М-16х40', 'шт', ''], ['', 'Болт М-20х45', 'шт', 60], ['Начальник', '', '', 'Soxtaev']];
    const F3 = run([sheet('a3.xlsx', S3, 'Справка'), sheet('a3.xlsx', S3d, 'Дефектовка')]); o.cnt3 = has(F3, 'cnthdr'); o.over3 = has(F3, 'over'); o.norm3 = has(F3, 'normcol'); o.size3 = has(F3, 'dvsize', /М-20х45.*М-16х40|М-16х40.*М-20х45/);
    // 4) metallolom: eskirish ulush (0,15), yashirin qator ИТОГО ga kirmaydi, xulosa matni («…металлолом в количестве 7,65 кг»)
    const L4 = hid([['АКТ'], ['Разбраковки металла б/у с вагонов'], ['за октябрь 2026г.'], ['№', 'Наименование', 'Ед.изм.', 'Кол-во', 'Вес 1 единицы, кг.', 'Процент износа %', 'Общий вес, кг. с учетом износа'],
      [1, 'Валик 30х90', 'шт', 5, 0.6, 0.15, 2.55], [2, 'Шплинт Ø3х110 мм', 'шт', 340, 0.015, 0, 5.1], ['', 'Валик 50х125', 'шт', 29, 2.1, 0.12, 53.592], ['', 'ИТОГО', '', '', '', '', 7.65], ['Бухгалтерии оприходовать металлолом в количестве 7,65 кг.']], [6]);
    const S4 = [['СПРАВКА-РАСЧЕТ №_А_', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 2023, 2023, 221000], ['Деповской ремонт думпкар 2ВС-105 №90011,90012'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.', 'Кол-во на 2 ед.', 'Факт кол-во'], ['Зап.части'], [31, 'Шплинт Ø3х110 мм', 'шт', 200, 400, 340], [32, 'Шплинт Ø4х110 мм', 'шт', 100, 200, 90], [33, 'Валик 30х90', 'шт', 4, 8, 5]];
    const S4b = [['СПРАВКА-РАСЧЕТ №_А_', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 2023, 2023, 221000], ['Деповской ремонт платформы 1 ед. №90021'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.', 'Кол-во на 1ед.', 'Факт кол-во'], [33, 'Валик 30х90', 'шт', 2, 2, 2]];
    const F4 = run([sheet('a4.xlsx', S4), sheet('a4b.xlsx', S4b), sheet('l4.xlsx', L4)]);
    o.lomrow4 = has(F4, 'lomrow'); o.lomtot4 = has(F4, 'lomtot'); o.lomstate4 = has(F4, 'lomstate'); o.lomhid4 = has(F4, 'lomhid', /Валик 50х125/); o.ø = has(F4, 'lomqty', /Ø3/); o.sprno4 = has(F4, 'sprno', /№ А/); o.trebdup4 = has(F4, 'trebdup', /№ 33/);
    // 5) boʻsh lom akti, xulosada kg
    const L5 = [['АКТ'], ['Разбраковки металла б/у с вагонов'], ['за октябрь 2026г.'], ['№', 'Наименование', 'Ед.изм.', 'Кол-во', 'Вес 1 единицы, кг.', 'Процент износа %', 'Общий вес, кг. с учетом износа'],
      ['', 'Автоцепка', 'шт', null, 207, 12, 0], ['', 'ИТОГО:', '', '', '', '', 0], ['В бухгалтерии оприходовать металлолом в количестве 1234,5 кг.']];
    const F5 = run([sheet('a4.xlsx', S4), sheet('l5.xlsx', L5)]); o.empty5 = has(F5, 'lomempty', /1 234,5/);
    // 6) nomlar
    o.vz = hpScore('Воздухозамедлитель', 'Воздухораспределитель'); o.pat = hpScore('Потрубка ф-20', 'Патрубка ф-20') > 0; o.bort = hpScore('Продольный борт', 'Борт') > 0;
    o.tri = typeof hp3Sim === 'function' ? hp3Sim('Подвеска триангеля', 'Триангель') : 0;
    return o;
  });
  ok(r.t1 === 'spr', '«СПРАВКА - РАСЧЕТ» (boʻshliq bilan) — spravka: ' + r.t1);
  ok(r.n1 === 100 && r.ceh === '9001' && r.shpz === '221000', 'yorliqlar pastki qatorda, «на 100 ед» keyingi qatorda: N=' + r.n1 + ', oluvchi ' + r.ceh + ', ШПЗ ' + r.shpz);
  ok(r.zamok, '«Замок автосцепки» — material (imzo emas)');
  ok(r.blk2 === '236/265', 'bir spravkada ikki boʻlim — alohida: ' + r.blk2);
  ok(!r.over2 && !r.normcol2, '«на 236 шт.» — normadan oshish / norma ustuni xatosi yoʻq');
  ok(r.cnt3 && !r.over3 && !r.norm3, 'sarlavhada 22, ustunda «на 2 шт» → 🔷 (soxta ❌ yoʻq)');
  ok(r.size3, 'defektovkada «Болт М-20х45» 60, spravkada «Болт М-16х40» 60 → ❌ oʻlcham farqi');
  ok(!r.lomrow4 && !r.lomtot4 && !r.lomstate4, 'lom: eskirish 0,15 = 15%, yashirin qator ИТОГО ga kirmaydi, xulosa mos');
  ok(r.lomhid4, 'lom: yashirin qatorda son → 🔷');
  ok(!r.ø, 'lom ↔ spravka: Ø3 va Ø4 qoʻshilmaydi');
  ok(r.sprno4, 'takroriy spravka raqami → ❌');
  ok(r.trebdup4, 'bitta talabnoma ikki spravkada → 🔷');
  ok(r.empty5, 'boʻsh lom akti (xulosada 1234,5 kg) → ❌');
  ok(r.vz === 0 && r.pat && r.bort, 'nomlar: воздухозамедлитель ≠ воздухораспределитель; Потрубка = Патрубка; Борт ↔ Продольный борт');
  ok(!r.tri, '«Подвеска триангеля» ≠ «Триангель»');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
