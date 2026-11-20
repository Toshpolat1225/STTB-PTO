// 6.2: «Dalolatnoma va hujjatlar tayyorlash» — yoʻnalishlar roʻyxati, 3 tugma, haftalik rasxod yoʻnalish boʻyicha. Faqat SOXTA maʼlumot.
//   node frontend/tests/v62yon.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); });
  // 1) kirish — yoʻnalishlar roʻyxati, yorliqlar yoʻq
  const a = await p.evaluate(async () => { openHisob(); await new Promise(r => setTimeout(r, 600));
    const s = document.getElementById('screen-hisob');
    return { title: s.querySelector('.sec-title').textContent, tabs: s.querySelectorAll('.sec-tabs i').length, n: s.querySelectorAll('.yon62-c').length,
      names: [...s.querySelectorAll('.yon62-c span')].map(x => x.textContent) }; });
  ok(a.title === '📄 Dalolatnoma va hujjatlar tayyorlash', 'sarlavha: ' + a.title);
  ok(a.tabs === 0 && a.n === 10, 'kirishda yorliqlar yoʻq, 10 ta yoʻnalish — ' + a.n);
  ok(a.names[0] === 'Temir yoʻl harakat tarkibi' && a.names.includes('Lokomotivlar (teplovozlar)') && !a.names.some(x => /Konstruktor/i.test(x)), 'yoʻnalishlar nomlari, Konstruktor yoʻq');
  // 2) yoʻnalishga kirish — 3 tugma, «Imzoga yuborish» yorligʻi yoʻq
  const c = await p.evaluate(async () => { yonPick('vag'); await new Promise(r => setTimeout(r, 500));
    const s = document.getElementById('screen-hisob'); return { tabs: [...s.querySelectorAll('.sec-tabs i')].map(x => x.textContent), crumb: !!s.querySelector('.yon62-crumb'), up: !!s.querySelector('.yon62-up') }; });
  ok(c.tabs.length === 3 && /Dalolatnoma tayyorlash/.test(c.tabs[0]) && /Hisobotlar/.test(c.tabs[1]) && /Haftalik rasxod/.test(c.tabs[2]), '3 ta tugma: ' + c.tabs.join(' | '));
  ok(!c.tabs.some(x => /Imzoga yuborish/.test(x)) && c.crumb && c.up, 'alohida «Imzoga yuborish» yoʻq; hujjat yuklash — Dalolatnoma ichida');
  // 3) hujjat yuklash ochiladi, yorliq «Dalolatnoma tayyorlash» da qoladi
  const u = await p.evaluate(async () => { yonTab('up'); await new Promise(r => setTimeout(r, 500)); const s = document.getElementById('screen-hisob');
    return { on: (s.querySelector('.sec-tabs i.on') || {}).textContent || '', up: /Hujjat yuklash va imzoga yuborish/.test(s.querySelector('.sec-body').textContent) }; });
  ok(/Dalolatnoma tayyorlash/.test(u.on) && u.up, 'hujjat yuklash oynasi: ' + u.on);
  // 4) boshqa yoʻnalish (teplovoz) — haftalik rasxod oʻz skladlari bilan, temir yoʻl maʼlumoti aralashmaydi
  const w = await p.evaluate(async () => {
    const head = [['Форма 30 (soxta)'], ['Параметры:', 'Период: 2026/11/01 - 2026/11/13'], [], ['Склад', 'Номенклатура', 'ШПЗ', 'Дата партии', 'Количество', 'Сумма']];
    const rows = head.concat([
      ['31 18 3001', 'Soxta vkladish', '221000', '2026/10/01', 1, 1000],
      ['31 18 3001', 'Soxta nalichnik', '222058', '2025/01/01', 1, 2000],
      ['31 3380', 'Soxta smazka', '221000', '2026/10/01', 1, 500],
      ['31 3380', 'Soxta yoqilgʻi', '231000', '2026/10/01', 1, 9000],
      ['31 18 3001', 'Рукавицы (soxta)', '221000', '2026/10/01', 1, 70],
      ['31 18 9201', 'Soxta vagon detali', '221101', '2026/10/01', 1, 7777],
    ]);
    yonBack(); yonPick('tep'); yonTab('haft'); await new Promise(r => setTimeout(r, 300));
    const _r = hsReadExcel; hsReadExcel = async () => rows;
    await wkUpload({ files: [{ name: 'soxta_tep.xlsx', arrayBuffer: async () => new ArrayBuffer(8) }], value: '' });
    hsReadExcel = _r;
    const d = wkDB(), rec = d.list[0], html = wkHtml(), key = WK_KEY, skl = d.skl.join(','), tot = wkTot(rec, wkSel(d, rec)).all;
    // smb: faqat 221000, qoʻlqop nomi boʻyicha chiqariladi
    yonBack(); yonPick('smb'); yonTab('haft');
    const rows2 = head.concat([['31 3140', 'Soxta rele', '221000', '2026/10/01', 1, 300], ['31 3140', 'Soxta kabel (qurilish)', '222900', '2026/10/01', 1, 5000], ['31 3140', 'Перчатки (soxta)', '221000', '2026/10/01', 1, 40]]);
    hsReadExcel = async () => rows2; await wkUpload({ files: [{ name: 'soxta_smb.xlsx', arrayBuffer: async () => new ArrayBuffer(8) }], value: '' }); hsReadExcel = _r;
    const d2 = wkDB(), r2 = d2.list[0], tot2 = wkTot(r2, wkSel(d2, r2)).all, key2 = WK_KEY;
    yonBack(); yonPick('vag'); yonTab('haft'); const d3 = wkDB();
    return { key, skl, tot, shared: /data-yw="shared"/.test(html) && /3380/.test(html), rasxod: /Haftalik rasxod/.test(html), key2, tot2, key3: WK_KEY, vagHasTep: d3.list.some(x => x.file === 'soxta_tep.xlsx'), vagSkl: d3.skl.join(',') };
  });
  ok(w.key === 'agmk_yon_wk_tep' && w.skl === '3001,3330,3130,3380', 'teplovoz: oʻz kaliti va skladlari — ' + w.key + ' · ' + w.skl);
  ok(Math.abs(w.tot - 3500) < 0.01, 'teplovoz: 3001 (221000 + 222058) + 3380 (221000) = 3500; yoqilgʻi 231000, qoʻlqop, boshqa sklad — yoʻq: ' + w.tot);
  ok(w.shared && w.rasxod, 'umumiy sklad (3380) alohida satrda, nom «Haftalik rasxod»');
  ok(w.key2 === 'agmk_yon_wk_smb' && Math.abs(w.tot2 - 300) < 0.01, 'avtomatlashtirish: faqat 221000, perchatka chiqarildi — ' + w.tot2);
  ok(w.key3 === 'agmk_weekly_v1' && !w.vagHasTep && w.vagSkl === '9201,9202,9203,9205,9208', 'temir yoʻl harakat tarkibi: avvalgi kalit, boshqa yoʻnalish maʼlumoti aralashmaydi');
  // 5) oʻzgacha joydan (Mening ishlarim, AI) ochilganda — oxirgi yoʻnalishda, roʻyxatda emas
  const dp = await p.evaluate(async () => { openScreen('screen-main'); openHisob('haft'); await new Promise(r => setTimeout(r, 400)); return { yon: HS.yon, tab: HS.tab, tabs: document.querySelectorAll('#screen-hisob .sec-tabs i').length }; });
  ok(dp.yon === 'vag' && dp.tab === 'haft' && dp.tabs === 3, 'chuqur havola: oxirgi yoʻnalishda ochiladi — ' + JSON.stringify(dp));
  const back = await p.evaluate(async () => { openScreen('screen-main'); openHisob(); await new Promise(r => setTimeout(r, 400)); return document.querySelectorAll('#screen-hisob .yon62-c').length; });
  ok(back === 10, 'oddiy kirishda — yana yoʻnalishlar roʻyxati');
  // 6) «‹ Orqaga» — bir qadam: ichki sahifa → yoʻnalish → roʻyxat → bosh sahifa (ekrandagi tugma ham, tizim orqaga tugmasi ham)
  const bk = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const scr = () => (document.querySelector('.screen.active') || {}).id;
    openScreen('screen-main'); openHisob(); await w(300); yonPick('vag'); await w(200); yonTab('haft'); await w(300);
    const bb = document.querySelector('#screen-hisob .back-btn'); const L = [];
    bb.click(); await w(300); L.push([scr(), HS.yon || '-', document.querySelectorAll('#screen-hisob .yon62-c').length]);
    bb.click(); await w(300); L.push([scr()]);
    openHisob(); await w(300); yonPick('vag'); await w(200); HS.akt = HS_AKT[0].k; hsRender(); await w(300);
    bb.click(); await w(300); L.push([scr(), HS.yon || '-', HS.akt || '-']);
    return L; });
  ok(bk[0][0] === 'screen-hisob' && bk[0][1] === '-' && bk[0][2] === 10, 'Haftalik rasxod → «Orqaga» → yoʻnalishlar roʻyxati: ' + JSON.stringify(bk[0]));
  ok(bk[1][0] === 'screen-main', 'roʻyxat → «Orqaga» → bosh sahifa');
  ok(bk[2][0] === 'screen-hisob' && bk[2][1] === 'vag' && bk[2][2] === '-', 'akt turi ichidan → «Orqaga» → shu yoʻnalish sahifasi: ' + JSON.stringify(bk[2]));
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.join(' ; '));
  await b.close(); console.log(F ? `❌ ${F} ta xato` : '✅ Hammasi toʻgʻri'); process.exit(F ? 1 : 0);
})();
