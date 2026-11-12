// 5.9 (8–12-bandlar): ☰ (web), ⬇️ Yuklab olinganlar, boʻsh vagon turi va «+ Vagon qoʻshish», tez surish, hisobot tekshiruvi
// (sex ↔ 1C ombor, bir talabnoma bir necha blokda, тн ↔ кг, taʼmir ↔ obtochka, yaxlitlash, zamechaniya fayllari). Faqat SOXTA maʼlumot.
//   node frontend/tests/v59b.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
const login = () => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); window.uiConfirm = async () => true; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  // ---------- 8) ☰: kompyuterda bor, telefonda yoʻq ----------
  for (const [w, h, want] of [[1600, 1000, true], [412, 880, false]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000); await p.evaluate(login); await p.evaluate(() => openScreen('screen-main')); await p.waitForTimeout(600);
    const r = await p.evaluate(() => { const m = document.querySelector('#d60h .d60-menu') || document.getElementById('mn59Menu'), c = document.querySelector('#d60h [data-k="qr"]') || document.getElementById('chatTopBtn'); /* 6.0: yangi tepa qism (D2) */ const a = m && m.getBoundingClientRect(), z = c && c.getBoundingClientRect();
      return { vis: !!(a && a.width), side: document.body.classList.contains('wb-side'), overlap: !!(a && z && a.width && z.width && !(a.bottom <= z.top || z.bottom <= a.top || a.right <= z.left || z.right <= a.left)) }; });
    ok(r.vis === want && !r.side && !r.overlap, w + ' px: ☰ ' + (want ? 'bor' : 'yoʻq') + ', doimiy panel yoʻq, tugmalar ustma-ust emas ' + JSON.stringify(r));
    await p.close();
  }
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000); await p.evaluate(login);
  // ---------- 10) Vagonlar parki ----------
  await p.evaluate(() => { vagonlarData.splice(0, vagonlarData.length); for (let i = 0; i < 150; i++) vagonlarData.push({ id: 90000 + i, num: String(99000 + i), inv: String(80000 + i), type: 'Dumpkar 2VS-105', model: 'soxta', seh: 'Boshqarma', sortOrder: i + 1, status: 'Soz', kun: 100, yil: 2000 }); openScreen('screen-vagonlar'); setTypeFilter('Barchasi'); });
  await p.waitForTimeout(800);
  const v1 = await p.evaluate(() => ({ btn: !!document.getElementById('vg59Add'), fabHid: document.querySelector('#screen-vagonlar .fab-btn').classList.contains('vg59-hide') }));
  ok(v1.btn && v1.fabHid, 'roʻyxat ustida «+ Vagon qoʻshish», yuqorida turganda «+» yashirin');
  await p.evaluate(() => { document.querySelector('#screen-vagonlar .ui-body').scrollTop = 2500; }); await p.waitForTimeout(500);
  ok(!(await p.evaluate(() => document.querySelector('#screen-vagonlar .fab-btn').classList.contains('vg59-hide'))), 'pastga surilganda «+» chiqadi');
  await p.evaluate(() => { const t = [...document.querySelectorAll('#vagon-tabs .tab.tvt.empty')].find(x => /Poluvagon/.test(x.title)); t.click(); }); await p.waitForTimeout(500);
  const v2 = await p.evaluate(() => ({ note: /Bu turdagi vagonlar hali kiritilmagan/.test(document.getElementById('vagon-list-container').innerText), op: getComputedStyle([...document.querySelectorAll('#vagon-tabs .tab.tvt.empty')][0]).opacity }));
  ok(v2.note && +v2.op === 1, 'boʻsh tur bosiladi (xira emas) va izoh chiqadi');
  await p.evaluate(() => vg59Add()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.getElementById('add-model').value === 'Poluvagon' && !document.getElementById('addVagonModal').classList.contains('hidden')), 'qoʻshish oynasida tur oʻzi tanlangan');
  await p.evaluate(() => { document.getElementById('addVagonModal').classList.add('hidden'); setTypeFilter('Barchasi'); }); await p.waitForTimeout(400);
  // ---------- 11) Tez surish ----------
  await p.evaluate(() => { const s = document.querySelector('#screen-vagonlar .ui-body'); s.scrollTop = 0; s.scrollTop = 900; }); await p.waitForTimeout(400);
  const th = await p.evaluate(() => { const e = document.getElementById('fs59'); const r = e.querySelector('.fs59-th').getBoundingClientRect(); return { on: e.classList.contains('on'), x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  ok(th.on, 'surilganda oʻng chetda tez surish tugmasi chiqadi');
  await p.mouse.move(th.x, th.y); await p.mouse.down(); await p.mouse.move(th.x, 780, { steps: 6 }); await p.waitForTimeout(500);
  const f1 = await p.evaluate(() => ({ lbl: document.querySelector('#fs59 .fs59-lbl').textContent, n: document.querySelectorAll('#vagon-list-container .vagon-card').length }));
  await p.mouse.up(); await p.waitForTimeout(300);
  ok(/\/ 150/.test(f1.lbl) && f1.n > 60, 'tortilganda yorliq (' + f1.lbl + ') va qolgan vagonlar yuklandi: ' + f1.n);
  await p.waitForTimeout(2900); // 6.0: tugma 2,5 s koʻrinib turadi (muallif)
  ok(!(await p.evaluate(() => document.getElementById('fs59').classList.contains('on'))), 'tegilmasa tugma yashirinadi');
  // ---------- 9) Yuklab olinganlar ----------
  await p.evaluate(() => { openHisob(); HS.tab = 'hisob'; hsRender(); }); await p.waitForTimeout(500);
  await p.evaluate(() => { try { localStorage.removeItem('agmk_dl59'); localStorage.removeItem('agmk_dl59_seen'); } catch (e) {} docDownload([{ name: 'Soxta_hisobot.xlsx', blob: new Blob([new Uint8Array(1500)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }]); });
  await p.waitForTimeout(500);
  ok(await p.evaluate(() => !document.getElementById('exSheet').classList.contains('hidden') && dl59All().length === 0), 'format oynasi ochildi — hali roʻyxatga yozilmadi');
  await p.evaluate(() => exGo('dl')); await p.waitForTimeout(2000);
  const d1 = await p.evaluate(() => ({ n: dl59All().length, toast: (document.getElementById('dl59T') || {}).className, snack: !!(document.getElementById('expSnack') && document.getElementById('expSnack').classList.contains('on')), old: /Загрузки/.test((document.getElementById('toastMsg') || {}).innerText || ''), badge: (document.querySelector('.dl59-btn i') || {}).textContent }));
  ok(d1.n === 1 && /on/.test(d1.toast) && !d1.snack && !d1.old && d1.badge === '1', 'yuklab olindi: roʻyxatda 1 ta, qisqa xabar, eski qator va takroriy xabar yoʻq, ⬇️ da «1» ' + JSON.stringify(d1));
  await p.waitForTimeout(4300);
  ok(!(await p.evaluate(() => document.getElementById('dl59T').classList.contains('on'))), 'qisqa xabar 4 s da yopiladi');
  await p.evaluate(() => dl59List()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /Soxta_hisobot\.xlsx/.test(document.getElementById('dl59M').innerText) && !document.querySelector('.dl59-btn i').textContent), 'roʻyxat ochiladi, koʻrilgach son yoʻqoladi');
  const opened = await p.evaluate(async () => { let u = ''; const o = window.open; window.open = (x) => { u = String(x); return {}; }; await dl59Open(dl59All()[0].id); window.open = o; return u; });
  ok(/^blob:/.test(opened), 'bosilsa fayl ochiladi (brauzerda — yangi oyna)');
  await p.evaluate(() => { const id = dl59All()[0].id; mediaDelete(id); }); await p.waitForTimeout(200);
  await p.evaluate(async () => { await dl59Open(dl59All()[0].id); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => dl59All().length === 0), 'fayl topilmasa — «topilmadi» va roʻyxatdan olinadi');
  await p.evaluate(() => mdlClose('dl59M'));
  // ---------- 12) Hisobot tekshiruvi ----------
  const r = await p.evaluate(() => {
    const src = (f, s) => ({ f: f, s: s || 'L1' });
    const sheet = (f, rows, s) => { const t = hpClassify(rows); return { f: f, s: s || 'L1', type: t, data: hpParseSheet(rows, t, src(f, s)) }; };
    const H = ['СПРАВКА-РАСЧЕТ №___', '', 'Вид операции', 'Склад', 'Цех,объект.пол.', 'Шифр затрат'], V = ['на октябрь 2026г.', '', 20, 331, 9232, 221000];
    const T = ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 2 шт. по норме', 'Факт кол-во'];
    const S = [H, V, ['Ремонт электровозной колесной пары 2 ед.'], T, [12, 'Смазка тестовая', 'кг', 100, 200, 170], 
      ['Наплавка и обточка колесных пар электровозов на КЖ-20 -20ед.'], ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 20 шт. по норме', 'Факт кол-во'], [12, 'Смазка тестовая', 'кг', 10, 200, 100],
      ['Обыкновенное освидетельствование колесных пар 265 шт'], ['№ треб.', 'Наименование', 'Ед.изм.', 'Кол-во на 1 ед.по норме', 'Кол-во на 265 шт. по норме', 'Факт кол-во'], [17, 'Сварочная проволока ф-4мм', 'тн', 0.018, 4.77, 1.25]];
    const FH = ['Требование', 'Номен номер', 'Номенклатура', 'Ед изм', 'Склад', 'Счет', 'ШПЗ', 'Дата партии', 'Аналитика расходов', 'Количество', 'Цена', 'Сумма'];
    const F30 = [['Параметры:', 'Подразделение: 31 Soxta'], ['Стандартный период: 2026/10/01 - 2026/10/31'], [], FH,
      ['12', '99000012', 'Смазка тестовая', 'кг', '31 18 9205', '10.30', '221000', '2026/10/07 09:00:00', '', 270, 1000, 270000],
      ['17', '99000017', 'Проволока Для сварки Св-0,8А d-4 мм', 'кг', '31 18 9205', '10.30', '221000', '2026/10/07 09:00:00', '', 1250, 10, 12500]];
    const f30 = hpParseF30(F30, src('f30.xlsx', 'TDSheet'));
    const R = hpCheck({ sheets: [sheet('s.xlsx', S)].filter(x => x.data), f30: f30, month: '2026-10' });
    return { all: R.findings.map(f => f.lvl + ' ' + f.t + ' ' + (f.name || '') + ' | ' + String(f.msg).slice(0, 90)), num: ck59Num('786.4560000000001 va 10.2026 va 31.10.2026'), map: ceh59Map()['9232'] };
  });
  const has = (t, re) => r.all.some(x => x.split(' ')[1] === t && (!re || re.test(x)));
  ok(r.map === '31 18 9205', 'bogʻlanish: 9232 → 31 18 9205');
  ok(!has('sklad'), '«Sklad (sex) mos emas» chiqmaydi (bogʻlangan ombor olinadi)');
  ok(!has('fakt', /Смазка/), 'bir talabnoma ikki blokda (170 + 100 = 270) — xato emas');
  ok(!has('size') && !has('over', /проволока/i) && !has('fakt', /проволока/i), '1,25 тн = 1 250 кг — «oʻlcham xatosi» emas, faqat izoh');
  ok(!has('cntx'), 'taʼmir (2) va obtochka (20) soni solishtirilmaydi');
  ok(r.num === '786,456 va 10.2026 va 31.10.2026', 'yaxlitlash sanalarni buzmaydi: ' + r.num);
  const zh = await p.evaluate(() => hp3ZamHtml({ files: ['Birinchi_soxta_fayl_juda_uzun_nom_' + 'x'.repeat(200) + '.xlsx', 'Ikkinchi_soxta.xlsx', 'Uchinchi_soxta.rtf'], at: new Date().toISOString() }, { findings: [], month: '2026-10' }, 'Soxta', '2026-11-07', false, false).html);
  ok(/Fayllar \(3 ta\):/.test(zh) && /3\) Uchinchi_soxta\.rtf/.test(zh), 'zamechaniyada fayllar roʻyxati toʻliq (3 ta)');
  await p.evaluate(() => { openHisob(); HS.tab = 'hisob'; HS.cat = 'vagon'; HS.chk = null; hsRender(); }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => { const d = document.getElementById('ceh59'); return !!d && /\(5\)/.test(d.textContent) && /9204/.test(d.innerHTML) && !!d.closest('.f61-cfg') && /31 18 9203/.test(d.innerHTML); }), 'Forma-30 oynasida «Sex kodi ↔ 1C ombor» (5 ta) — 6.1: «⚙️ Ombor sozlamalari» ichida');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '412 px — gorizontal siljish yoʻq');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  if (F) console.log(r.all.join('\n'));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
