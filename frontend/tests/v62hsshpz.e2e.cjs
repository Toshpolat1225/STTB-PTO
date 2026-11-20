// 6.2 (144): Master hisoboti — 1C ga urilgan, spravkada yoʻq, ШПЗ 221/222/08100 dan tashqari (kir sovun, qoʻlqop) → 🔷 koʻk. Faqat SOXTA maʼlumot.
//   node frontend/tests/v62hsshpz.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext()).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const src = (f, s) => ({ f: f, s: s || 'L1' });
    const sheet = (f, rows) => { const t = hpClassify(rows); return { f: f, s: 'L1', type: t, data: hpParseSheet(rows, t, src(f)) }; };
    const S = [['СПРАВКА-РАСЧЕТ №___', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 331, 9232, 221000], ['Ремонт думпкар 2ВС-105 10 ед.'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 10 шт. по норме', 'Факт кол-во'], [5, 'Шплинт тестовый', 'шт', 4, 40, 30]];
    const sp = sheet('soxta_spravka.xlsx', S);
    const row = (i, tid, name, qty, sum, shpz) => ({ i: i, tid: String(tid), tref: 'от 10.10.2026', nom: '', name: name, unit: 'шт', sklad: 'Soxta ombor 31 18 9205', shpz: shpz, qty: qty, price: sum / qty, sum: sum, pogr: false, src: src('soxta_f30.xlsx') });
    const f30 = { month: '2026-10', items: [
      row(10, 5, 'Шплинт тестовый', 30, 30000, '221000'),
      row(11, 40, 'Мыло хозяйственное (soxta)', 20, 97200, '252075'),     // kir sovun — koʻk
      row(12, 41, 'Рукавицы ХБ (soxta)', 30, 503733, '252072'),           // qoʻlqop — koʻk
      row(13, 42, 'Подшипник тестовый', 2, 1800000, '222182'),            // 222 — qizil
      row(14, 43, 'Колодка тестовая', 4, 80000, 81000),                   // 08100 (5 xonali) — qizil
      row(15, 44, 'Болт тестовый', 10, 10000, '221000'),                  // aralash talabnoma: 221 qismi qizil,
      row(16, 44, 'Перчатки (soxta)', 5, 25000, '252072')                 //   qoʻlqop qismi koʻk
    ] };
    const R = hpCheck({ sheets: [sp], f30: f30, month: '2026-10' }).findings;
    const red = R.filter(f => f.t === 'f30nospr'), blue = R.filter(f => f.t === 'f30shpz');
    return { red: red.map(f => f.name.replace(/ \(.*/, '')), blue: blue.map(f => f.name.replace(/ \(.*/, '')), blvl: blue.map(f => f.lvl),
      r44: (red.find(f => /44/.test(f.name)) || {}).msg || '', b44: (blue.find(f => /44/.test(f.name)) || {}).msg || '',
      sum: R.find(f => f.t === 'f30nosprS'), fix: blue[0] ? hp3Fix(blue[0]) : '' };
  });
  ok(JSON.stringify(r.blue) === JSON.stringify(['Talabnoma № 40', 'Talabnoma № 41', 'Talabnoma № 44']) && r.blvl.every(l => l === 'blue'), 'kir sovun, qoʻlqop — koʻk izoh ' + JSON.stringify(r.blue));
  ok(JSON.stringify(r.red) === JSON.stringify(['Talabnoma № 42', 'Talabnoma № 43', 'Talabnoma № 44']), '221/222/08100 — qizil xato ' + JSON.stringify(r.red));
  ok(/Болт/.test(r.r44) && !/Перчатки/.test(r.r44) && /Перчатки/.test(r.b44) && !/Болт/.test(r.b44), 'aralash talabnoma ajratildi');
  ok(r.sum && /3 ta talabnoma/.test(r.sum.name) && /42, 43, 44/.test(r.sum.msg) && /1 890 000|1890000/.test(r.sum.msg.replace(/\s/g, ' ')), 'jami faqat qizillar boʻyicha: ' + (r.sum && r.sum.msg));
  ok(/xato emas/.test(r.fix), 'koʻk izoh tushuntirishi');
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
