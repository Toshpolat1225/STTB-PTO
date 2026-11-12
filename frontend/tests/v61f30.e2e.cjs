// 6.1 (138): 1C (Forma-30) ga urilgan, lekin spravka-raschetda yoʻq talabnomalar → ❌. Faqat SOXTA maʼlumot.
//   node frontend/tests/v61f30.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext()).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const src = (f, s) => ({ f: f, s: s || 'L1' });
    const sheet = (f, rows) => { const t = hpClassify(rows); return { f: f, s: 'L1', type: t, data: hpParseSheet(rows, t, src(f)) }; };
    // spravka: sex 9232 (1C da 31 18 9205), talabnomalar 5, 7
    const S = [['СПРАВКА-РАСЧЕТ №___', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], ['на октябрь 2026г.', '', 20, 331, 9232, 221000], ['Ремонт думпкар 2ВС-105 10 ед.'],
      ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 10 шт. по норме', 'Факт кол-во'], [5, 'Шплинт тестовый', 'шт', 4, 40, 30], [7, 'Болт тестовый М20', 'шт', 2, 20, 12]];
    const sp = sheet('soxta_spravka.xlsx', S);
    const row = (i, tid, name, qty, sum, sklad, shpz) => ({ i: i, tid: String(tid), tref: 'от 10.10.2026', nom: '', name: name, unit: 'шт', sklad: sklad, shpz: shpz, qty: qty, price: sum / qty, sum: sum, pogr: false, src: src('soxta_f30.xlsx') });
    const f30 = { month: '2026-10', items: [
      row(10, 5, 'Шплинт тестовый', 30, 30000, 'Soxta ombor 31 18 9205', '221000'),
      row(11, 7, 'Болт тестовый М20', 12, 60000, 'Soxta ombor 31 18 9205', '221000'),
      row(12, 174, 'Подшипник тестовый', 2, 1800000, 'Soxta ombor 31 18 9205', '221000'),   // shu ШПЗ — spravkada yoʻq
      row(13, 227, 'Кран тестовый', 1, 450000, 'Soxta ombor 31 18 9205', '224000'),         // boshqa ШПЗ — avval umuman chiqmasdi
      row(14, 227, 'Прокладка тестовая', 4, 20000, 'Soxta ombor 31 18 9205', '224000'),
      row(15, 300, 'Boshqa master materiali', 5, 50000, 'Boshqa ombor 31 18 9201', '221000') // boshqa sklad — bu masterga tegishli emas
    ] };
    const R = hpCheck({ sheets: [sp], f30: f30, month: '2026-10' }).findings;
    const nos = R.filter(f => f.t === 'f30nospr');
    return { n: nos.map(f => f.name), lvl: nos.map(f => f.lvl), m227: (nos.find(f => /227/.test(f.name)) || {}).msg || '', sum: R.find(f => f.t === 'f30nosprS'),
      extra: R.filter(f => f.t === 'extra' && /№(174|227)\b/.test(f.msg)).length, oth: R.some(f => /300/.test(f.name + f.msg)),
      ok5: !R.some(f => f.t === 'f30nospr' && /№ (5|7)\b/.test(f.name)),
      src: (nos[0] || {}).src };
  });
  ok(JSON.stringify(r.n.map(s => s.replace(/ \(.*/, ''))) === JSON.stringify(['Talabnoma № 174', 'Talabnoma № 227']), '174 va 227 — «1C ga urilgan, spravkada yoʻq» ' + JSON.stringify(r.n));
  ok(r.lvl.every(l => l === 'red'), 'qizil xato (koʻk izoh emas)');
  ok(/Кран тестовый/.test(r.m227) && /Прокладка тестовая/.test(r.m227) && /ШПЗ 224000/.test(r.m227), 'boshqa ШПЗ bilan urilgan talabnoma ham chiqdi, barcha materiallari bilan');
  ok(r.sum && /2 ta talabnoma/.test(r.sum.name) && /174, 227/.test(r.sum.msg), 'jami qator: ' + (r.sum && r.sum.msg));
  ok(r.extra === 0, 'eski koʻk izoh takrorlanmadi');
  ok(!r.oth, 'boshqa sklad (boshqa master) talabnomasi chiqmadi');
  ok(r.ok5, 'spravkadagi talabnomalar (5, 7) xato emas');
  ok(Array.isArray(r.src) && r.src.length === 1 && r.src[0].r === 12, 'Forma-30 dagi qator raqami koʻrsatiladi');
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
