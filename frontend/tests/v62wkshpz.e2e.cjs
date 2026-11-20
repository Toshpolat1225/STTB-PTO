// 6.2 (144): Haftalik achot — faqat ШПЗ 221*, 222*, 08100* hisobga olinadi. Faqat SOXTA maʼlumot.
//   node frontend/tests/v62wkshpz.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked');
    const head = [['Форма 30 (soxta)'], ['Параметры:', 'Период: 2026/11/01 - 2026/11/13'], [], ['Склад', 'Номенклатура', 'ШПЗ', 'Дата партии', 'Количество', 'Сумма']];
    const rows = head.concat([
      ['31 9201', 'Soxta podshipnik', '221101', '2026/10/01', 1, 1000],
      ['31 9201', 'Soxta prujina', '222182', '2024/10/01', 1, 2000],
      ['31 9202', 'Soxta kolodka', 81000, '2022/10/01', 1, 4000],      // 5 xonali → 081000
      ['31 9202', 'Qoʻlqop (soxta)', '351000', '2026/10/01', 10, 300],
      ['31 9203', 'Kir sovun (soxta)', '412000', '2026/09/01', 5, 50],
    ]);
    const P = wkParse(rows, ['9201', '9202', '9203']);
    const C = wkCompute(P.recs, '2026-11-13', ['9201', '9202', '9203']);
    // UI: toʻliq yuklash yoʻli (wkUpload) — hsReadExcel oʻrniga soxta qatorlar
    const _r = hsReadExcel; hsReadExcel = async () => rows;
    const d0 = wkDB(); d0.list = []; wkSave(d0);
    await wkUpload({ files: [{ name: 'soxta_f30.xlsx', arrayBuffer: async () => new ArrayBuffer(8) }], value: '' });
    hsReadExcel = _r;
    const d = wkDB(), rec = d.list[0], html = wkHtml();
    const noCol = wkParse(head.slice(0, 3).concat([['Склад', 'Номенклатура', 'Дата партии', 'Сумма'], ['31 9201', 'x', '2026/10/01', 5]]), ['9201']);
    return { n: P.recs.length, tot: C.tot.all, sh: P.shpz, rowsAll: P.rowsAll, fileTotal: P.fileTotal, recSh: !!(rec && rec.shpz && rec.shpz.ex), recTot: rec ? wkTot(rec, wkSel(d, rec)).all : -1,
      ex: /data-ws="ex"/.test(html) && /chiqarib tashlandi 2 ta qator/.test(html), tip: /faqat <b>221<\/b>/.test(html), none: !!(noCol.shpz && noCol.shpz.none), nonePass: noCol.recs.length, txt: wkText(rec) };
  });
  ok(r.n === 3 && Math.abs(r.tot - 7000) < 0.01, 'faqat 221/222/08100 qatorlari hisobga olindi: 3 qator, 7000 ' + JSON.stringify({ n: r.n, tot: r.tot }));
  ok(r.sh && r.sh.ex && r.sh.ex.n === 2 && Math.abs(r.sh.ex.s - 350) < 0.01, 'qoʻlqop va kir sovun chiqarib tashlandi (2 qator, 350) ' + JSON.stringify(r.sh && r.sh.ex && { n: r.sh.ex.n, s: r.sh.ex.s }));
  ok(r.rowsAll === 5 && Math.abs(r.fileTotal - 7350) < 0.01, 'fayl boʻyicha umumiy maʼlumot toʻliq (5 qator, 7350)');
  ok(r.recSh && Math.abs(r.recTot - 7000) < 0.01, 'yuklashda yozuvga ШПЗ maʼlumoti saqlanadi, jami 7000 ' + r.recTot);
  ok(r.ex && r.tip, 'ekranda ШПЗ izohi va chiqarib tashlanganlar roʻyxati');
  ok(r.none && r.nonePass === 1, 'ШПЗ ustuni yoʻq fayl — ogohlantirish bilan, avvalgidek hisoblanadi');
  ok(/ШПЗ: faqat 221, 222, 08100/.test(r.txt || ''), 'Telegram matnida ШПЗ qoidasi');
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
