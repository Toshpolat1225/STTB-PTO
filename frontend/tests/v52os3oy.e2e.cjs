// 5.2: ОС-3 — oy fayldan aniqlanadi; tarixda «✏️ Tahrirlash» (oyni oʻzgartirish / oʻchirish). Faqat SOXTA maʼlumot, haqiqiy bosish bilan.
//   node frontend/tests/v52os3oy.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    let dlg = []; p.on('dialog', d => { dlg.push(d.message()); d.accept(); });
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); themeApply(t, true); localStorage.removeItem('agmk_os3_list'); }, theme);
    const T = '[' + theme + '] ';
    const vis = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const st = getComputedStyle(e), rc = e.getBoundingClientRect(); return st.display !== 'none' && rc.width > 0 && rc.height > 0; }, sel);

    // 1) matndan oy
    const mo = await p.evaluate(() => [
      'Стандартный период: 01.05.2025 - 31.05.2025', 'Стандартный период: 2025/05/01 - 2025/05/31', 'Затраты за 05.2025г..xlsx', 'Наряды май Алматов 2025г текширилди.xlsx',
      'Наряд № 03 на сдельную работу на марть месяц 2025год', 'ОС-3 за Январь 2025 г.', 'Ремонт 2025 без месяца', 'Майский 2025'].map(os3MonOf));
    ok(JSON.stringify(mo) === JSON.stringify(['2025-05', '2025-05', '2025-05', '2025-05', '2025-03', '2025-01', '', '']), T + 'matndan oy: ' + mo.join(','));

    // soxta fayllar (JSZip va XLSX kutubxonalari yuklanguncha kutiladi)
    await p.waitForFunction(() => { try { void window.XLSX; } catch (e) {} return typeof JSZip !== 'undefined'; }, null, { timeout: 30000 }).catch(() => {});
    const files = await p.evaluate(() => {
      const aoa = d => { const ws = {}; let C = 0; d.forEach((r, i) => r.forEach((v, j) => { if (v == null) return; ws[XLSX.utils.encode_cell({ r: i, c: j })] = { v: v, t: typeof v === 'number' ? 'n' : 's' }; if (j > C) C = j; })); ws['!ref'] = 'A1:' + XLSX.utils.encode_cell({ r: d.length - 1, c: C }); return ws; },
        bin = (ws, n) => XLSX.write({ SheetNames: [n], Sheets: { [n]: ws } }, { type: 'binary', bookType: 'xlsx' });
      const m = [[], ['Параметры:', null, 'Подразделение: 31'], [null, null, 'Стандартный период: 01.05.2099 - 31.05.2099'], [], ['Требование', null, null, 'Номен', 'Номенклатура', 'Ед', null, null, null, 'ШПЗ', null, null, 'Кол-во', 'Цена', 'Сумма'],
        ['1', null, null, '9', 'Soxta detal', 'шт', null, '31', '10.10', '222101', null, null, 2, 1000, 2000]];
      const n = []; for (let i = 0; i < 9; i++) n.push([]); n.push([null, null, 'Кап.рем.д-р. 2вс-105 зав.№ 90001- 100%', null, null, null, null, null, 'шт', 1, 100, 3000]);
      const recs = [['02 материалы', 2220, '222101', 92, 2000, 2000], ['03 зар.плата', 2220, '222000', 92, 900, 900], ['04 соц.налог', 2220, '222000', 92, 100, 100]], cats = [...new Set(recs.map(x => x[0]))];
      const Fd = ['что', 'ш\\з Б', 'ш\\з', 'цех', 'сумма', 'сумма с 16'];
      const def = `<?xml version="1.0"?><pivotCacheDefinition xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cacheSource type="worksheet"><worksheetSource ref="A1:F4" sheet="свод"/></cacheSource><cacheFields count="6">` +
        Fd.map((f, i) => i === 0 ? `<cacheField name="${f}"><sharedItems count="${cats.length}">${cats.map(c => `<s v="${c}"/>`).join('')}</sharedItems></cacheField>` : `<cacheField name="${f}"><sharedItems/></cacheField>`).join('') + `</cacheFields></pivotCacheDefinition>`;
      const rec = `<?xml version="1.0"?><pivotCacheRecords xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${recs.map(x => `<r><x v="${cats.indexOf(x[0])}"/><n v="${x[1]}"/><s v="${x[2]}"/><n v="${x[3]}"/><n v="${x[4]}"/><n v="${x[5]}"/></r>`).join('')}</pivotCacheRecords>`;
      const z = new JSZip(); z.file('xl/pivotCache/pivotCacheDefinition1.xml', def); z.file('xl/pivotCache/pivotCacheRecords1.xml', rec);
      OS3.inv = { '90001': '38101' }; OS3.tuz = []; OS3.m = '2099-09'; OS3.mHand = 0; OS3.f = { m30: null, nar: [], zat: null }; OS3.d = null; OS3.fm = null;
      return { m30: bin(aoa(m), 'TDSheet'), nar: bin(aoa(n), 'B'), zat: z.generate({ type: 'string' }) };
    });
    const X = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    await p.evaluate(() => { openHisob('akt'); HS.akt = 'os3'; hsRender(); }); await p.waitForTimeout(200);
    await p.click('#screen-hisob .hs-new .db-two'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('os3Mon').value) === '2099-09', T + 'boshida — oldingi oy (sinovda 2099-09)');

    // 2) M-30 yuklanganda oy oʻzi qoʻyiladi
    let inp = await p.$$('#os3M input[type=file]');
    await inp[0].setInputFiles({ name: 'май ф м-30.xlsx', mimeType: X, buffer: Buffer.from(files.m30, 'binary') }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => OS3.m === '2099-05' && document.getElementById('os3Mon').value === '2099-05'), T + 'M-30 yuklandi → oy «Май 2099» oʻzi qoʻyildi');
    ok(/fayldan aniqlandi/.test(await p.evaluate(() => (document.querySelector('#os3M .os3-mm') || {}).textContent || '')), T + 'yozuv: «Oy fayldan aniqlandi (M-30)»');
    inp = await p.$$('#os3M input[type=file]');
    await inp[1].setInputFiles([{ name: 'Наряды май Soxta 2099г.xlsx', mimeType: X, buffer: Buffer.from(files.nar, 'binary') }]); await p.waitForTimeout(300);
    inp = await p.$$('#os3M input[type=file]');
    await inp[2].setInputFiles({ name: 'Затраты за 05.2099г..xlsx', mimeType: X, buffer: Buffer.from(files.zat, 'binary') }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => OS3.m === '2099-05' && OS3.fm && OS3.fm.all.length >= 3), T + 'uchala fayl — bir xil oy');

    // 3) qoʻlda boshqa oy tanlansa — Hisoblashda soʻraydi va toʻgʻrilaydi
    await p.fill('#os3Mon', '2099-09'); await p.dispatchEvent('#os3Mon', 'change'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => OS3.m === '2099-09' && OS3.mHand === 1), T + 'qoʻlda boshqa oy tanlandi');
    dlg = [];
    await p.click('#os3M button:has-text("Hisoblash")'); await p.waitForTimeout(400);
    ok(dlg.some(m => /Май 2099/.test(m) && /Сентябрь 2099/.test(m)), T + 'Hisoblashda soʻradi: fayllar — Май, tanlangan — Сентябрь');
    ok(await p.evaluate(() => OS3.m === '2099-05' && /Май 2099/.test(document.querySelector('#os3Res .kq-h').textContent)), T + 'rozi boʻlinganda oy — Май 2099');
    await p.evaluate(() => { window.exOpen = () => {}; }); await p.click('#os3Res button:has-text("Excel")'); await p.waitForTimeout(400);
    await p.evaluate(() => mdlClose('os3M'));

    // 4) tarix: ✏️ Tahrirlash → oyni oʻzgartirish
    await p.evaluate(() => { const L = JSON.parse(localStorage.getItem('agmk_os3_list') || '[]'); L.push({ m: '2099-11', at: '2099-12-01T00:00:00Z', n: 6, T: 123.45, v: [], tuz: [] }); localStorage.setItem('agmk_os3_list', JSON.stringify(L)); hsRender(); }); await p.waitForTimeout(200);
    ok(await p.locator('#screen-hisob .hs-row .os3-ed').count() === 2, T + 'tarixda har yozuvda «✏️ Tahrirlash»');
    await p.click('#screen-hisob .hs-row:has-text("Ноябрь 2099") .os3-ed'); await p.waitForTimeout(300);
    ok(await vis('#os3E') && !(await vis('#os3M')), T + '«Tahrirlash» bosilsa — tahrir oynasi (ОС-3 oynasi emas)');
    await p.fill('#os3Em', '2099-10'); await p.click('#os3E button:has-text("Oyni saqlash")'); await p.waitForTimeout(300);
    let L = await p.evaluate(() => JSON.parse(localStorage.getItem('agmk_os3_list')).map(x => x.m).sort().join(','));
    ok(L === '2099-05,2099-10', T + 'oy oʻzgartirildi: ' + L);
    ok(/Октябрь 2099/.test(await p.textContent('#screen-hisob')), T + 'roʻyxatda yangi oy koʻrinadi');
    // mavjud oyga oʻzgartirish — soʻraydi va almashtiradi
    dlg = [];
    await p.click('#screen-hisob .hs-row:has-text("Октябрь 2099") .os3-ed'); await p.waitForTimeout(300);
    await p.fill('#os3Em', '2099-05'); await p.click('#os3E button:has-text("Oyni saqlash")'); await p.waitForTimeout(300);
    L = await p.evaluate(() => JSON.parse(localStorage.getItem('agmk_os3_list')).map(x => x.m + ':' + x.n).join(','));
    ok(dlg.some(m => /tarixda bor/.test(m)) && L === '2099-05:6', T + 'band oyga — soʻrab almashtirdi: ' + L);
    // 5) oʻchirish
    await p.click('#screen-hisob .hs-row:has-text("Май 2099") .os3-ed'); await p.waitForTimeout(300);
    await p.click('#os3E button:has-text("Oʻchirish")'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('agmk_os3_list')).length) === 0 && !(await vis('#os3E')), T + 'oʻchirildi, oyna yopildi');
    // 6) yozuv ustiga bosish — avvalgidek ochadi
    await p.evaluate(() => { localStorage.setItem('agmk_os3_list', JSON.stringify([{ m: '2099-03', at: '2099-04-01T00:00:00Z', n: 1, T: 1, v: [], tuz: [] }])); hsRender(); }); await p.waitForTimeout(150);
    await p.click('#screen-hisob .hs-row:has-text("Март 2099") b'); await p.waitForTimeout(300);
    ok(await vis('#os3M') && await p.evaluate(() => OS3.m) === '2099-03', T + 'yozuv bosilsa — ОС-3 oynasi oʻsha oy bilan');
    ok(errs.length === 0, T + 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
    await p.context().close();
  }
  await b.close();
  console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
