// 5.1: «Dalolatnomalar» har kirishda umumiy sahifadan; ОС-3 va Bildirgi kartalari HAQIQIY bosish bilan ochiladi.
// Faqat SOXTA maʼlumot. Telefon oʻlchami, mavzular: Klassik va glass.
//   node frontend/tests/v51nav.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    p.on('dialog', d => d.accept());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); themeApply(t, true); }, theme);
    const T = '[' + theme + '] ';
    const vis = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const st = getComputedStyle(e), rc = e.getBoundingClientRect(); return st.display !== 'none' && st.visibility !== 'hidden' && rc.width > 0 && rc.height > 0; }, sel);
    const cat = async re => { await p.click(`#screen-hisob .hs-grid .hs-card >> text=${re}`); await p.waitForTimeout(250); };
    ok(await p.evaluate(() => document.body.getAttribute('data-theme')) === theme, T + 'mavzu');

    // 1) ОС-3 ichida qolib, qayta kirish → umumiy roʻyxat
    await p.evaluate(() => openHisob('akt')); await p.waitForTimeout(250);
    ok(await p.locator('#screen-hisob .hs-grid .hs-card').count() >= 5, T + 'umumiy roʻyxat (kategoriyalar)');
    await cat('ОС-3');
    ok(await p.evaluate(() => HS.akt) === 'os3', T + 'ОС-3 kategoriyasi ochildi (bosish)');
    await p.evaluate(() => openScreen('screen-main')); await p.waitForTimeout(150);
    await p.evaluate(() => { openHisob(); HS.yon = HS.yon || 'vag'; hsRender(); }); await p.waitForTimeout(250);
    let r = await p.evaluate(() => ({ akt: HS.akt, cat: HS.cat, chk: HS.chk, n: document.querySelectorAll('#screen-hisob .hs-grid .hs-card').length }));
    ok(r.akt === null && r.cat === null && r.chk === null && r.n >= 5, T + 'qayta kirish → umumiy sahifa, HS.akt === null');

    // 2) ОС-3 tayyorlash — haqiqiy bosish (1-band xato boʻlsa ham keyingilari tekshirilsin)
    await p.evaluate(() => { HS.akt = null; hsRender(); }); await p.waitForTimeout(150);
    await cat('ОС-3');
    await p.click('#screen-hisob .hs-new .db-two'); await p.waitForTimeout(300);
    if (!(await vis('#os3M'))) { ok(false, T + '«ОС-3 tayyorlash» kartasi bosilsa — ОС-3 oynasi ochildi'); await p.evaluate(() => os3Open()); await p.waitForTimeout(300); } else
    ok(await vis('#os3M'), T + '«ОС-3 tayyorlash» kartasi bosilsa — ОС-3 oynasi ochildi');
    // oyna ichidagi tugmalar: fayl tanlash (change), Hisoblash, Excel
    const bin = await p.evaluate(() => { const ws = { A1: { v: 'soxta', t: 's' }, '!ref': 'A1:A1' }; return XLSX.write({ SheetNames: ['S'], Sheets: { S: ws } }, { type: 'binary', bookType: 'xlsx' }); });
    const inp = await p.$$('#os3M input[type=file]');
    ok(inp.length === 3, T + 'ОС-3: 3 ta fayl tanlash maydoni');
    if (inp.length) { await inp[0].setInputFiles({ name: 'soxta_m30.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(bin, 'binary') }); await p.waitForTimeout(300); }
    ok(await p.evaluate(() => !!(OS3.f && OS3.f.m30 && /soxta_m30/.test(OS3.f.m30.name))), T + 'ОС-3: fayl tanlash ishlaydi');
    // soxta toʻliq fayllar (v50os3 sinovidagi kabi) → «Hisoblash» va «Excel» ni bosish
    await p.evaluate(() => {
      const bin2ab = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u.buffer; },
        aoa = d => { const ws = {}; let C = 0; d.forEach((r, i) => r.forEach((v, j) => { if (v == null) return; ws[XLSX.utils.encode_cell({ r: i, c: j })] = { v: v, t: typeof v === 'number' ? 'n' : 's' }; if (j > C) C = j; })); ws['!ref'] = 'A1:' + XLSX.utils.encode_cell({ r: d.length - 1, c: C }); return ws; },
        ab = (ws, n) => bin2ab(XLSX.write({ SheetNames: [n], Sheets: { [n]: ws } }, { type: 'binary', bookType: 'xlsx' }));
      const m = [[], [], [], [], ['Требование', null, null, 'Номен', 'Номенклатура', 'Ед', null, null, null, 'ШПЗ', null, null, 'Кол-во', 'Цена', 'Сумма'],
        ['1', null, null, '9', 'Soxta detal', 'шт', null, '31', '10.10', '222101', null, null, 2, 1000, 2000]];
      const n = []; for (let i = 0; i < 9; i++) n.push([]); n.push([null, null, 'Кап.рем.д-р. 2вс-105 зав.№ 90001- 100%', null, null, null, null, null, 'шт', 1, 100, 3000]);
      const recs = [['02 материалы', 2220, '222101', 92, 2000, 2000], ['03 зар.плата', 2220, '222000', 92, 900, 900], ['04 соц.налог', 2220, '222000', 92, 100, 100]], cats = [...new Set(recs.map(x => x[0]))];
      const Fd = ['что', 'ш\\з Б', 'ш\\з', 'цех', 'сумма', 'сумма с 16'];
      const def = `<?xml version="1.0"?><pivotCacheDefinition xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cacheSource type="worksheet"><worksheetSource ref="A1:F4" sheet="свод"/></cacheSource><cacheFields count="6">` +
        Fd.map((f, i) => i === 0 ? `<cacheField name="${f}"><sharedItems count="${cats.length}">${cats.map(c => `<s v="${c}"/>`).join('')}</sharedItems></cacheField>` : `<cacheField name="${f}"><sharedItems/></cacheField>`).join('') + `</cacheFields></pivotCacheDefinition>`;
      const rec = `<?xml version="1.0"?><pivotCacheRecords xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${recs.map(x => `<r><x v="${cats.indexOf(x[0])}"/><n v="${x[1]}"/><s v="${x[2]}"/><n v="${x[3]}"/><n v="${x[4]}"/><n v="${x[5]}"/></r>`).join('')}</pivotCacheRecords>`;
      const z = new JSZip(); z.file('xl/pivotCache/pivotCacheDefinition1.xml', def); z.file('xl/pivotCache/pivotCacheRecords1.xml', rec);
      OS3.inv = { '90001': '38101' }; OS3.tuz = []; OS3.m = '2099-05';
      OS3.f = { m30: { name: 'm30.xlsx', buf: ab(aoa(m), 'TDSheet') }, nar: [{ name: 'n.xlsx', buf: ab(aoa(n), 'B') }], zat: { name: 'z.xlsx', buf: z.generate({ type: 'arraybuffer' }) } };
      window.__got = null; window.exOpen = f => { window.__got = f; };
    });
    await p.click('#os3M button:has-text("Hisoblash")'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => !!document.querySelector('#os3Res table') && /90001/.test(document.querySelector('#os3Res').textContent)), T + 'ОС-3: «Hisoblash» bosilsa — jadval');
    await p.click('#os3Res button:has-text("Excel")'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => !!(window.__got && /OS-3_2099-05\.xlsx/.test(window.__got[0].name))), T + 'ОС-3: «Excel» bosilsa — fayl tayyor');
    await p.click('#os3Res button:has-text("PDF")'); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => !!(window.__got && /OS-3_2099-05\.pdf/.test(window.__got[0].name))), T + 'ОС-3: «PDF» bosilsa — fayl tayyor');
    await p.evaluate(() => mdlClose('os3M'));

    // 3) Bildirgi — haqiqiy bosish
    await p.click('#screen-hisob .hs-back'); await p.waitForTimeout(250);
    ok(await p.evaluate(() => HS.akt) === null, T + '‹ (hs-back) — umumiy roʻyxatga');
    await cat('Bildirgi');
    await p.click('#screen-hisob #bgCat'); await p.waitForTimeout(400);
    ok(await vis('#bgModal'), T + '«Yangi bildirgi va dalolatnoma» bosilsa — bildirgi oynasi ochildi');
    await p.evaluate(() => mdlClose('bgModal'));

    // 4) Oddiy akt turi kartasi — qoʻlda kiritish oynasi (eski xatti-harakat)
    await p.click('#screen-hisob .hs-back'); await p.waitForTimeout(200);
    await cat('Boshqa ehtiyot');
    await p.click('#screen-hisob .hs-new .db-two >> nth=0'); await p.waitForTimeout(600);
    r = await p.evaluate(() => { const N = typeof ND !== 'undefined' ? ND : null; return { tur: N && N.form ? N.form.tur : null, mode: N && N.form ? N.form.mode || 'man' : null }; });
    ok(!!r.tur && r.mode !== 'ai', T + 'oddiy akt kartasi — qoʻlda kiritish oynasi (' + r.tur + ')');

    // 5) Kelgan joyga qaytish (4.9 b114) va «Mening ishlarim» chuqur havolasi buzilmagan
    await p.evaluate(() => ndGoBack()); await p.waitForTimeout(300);
    ok(await p.evaluate(() => HS.akt) === 'boshqa', T + 'akt oynasidan ‹ — oʻsha kategoriyaga qaytadi');
    await p.evaluate(() => { openScreen('screen-main'); HS.tab = 'hisob'; HS.cat = 'vagon'; HS.chk = null; openHisob('hisob'); }); await p.waitForTimeout(200);
    ok(await p.evaluate(() => HS.tab === 'hisob' && HS.cat === 'vagon'), T + 'chaqiruvchi qoʻygan holat saqlanadi (Mening ishlarim)');
    await p.evaluate(() => { openScreen('screen-main'); openHisob('akt'); }); await p.waitForTimeout(200);
    ok(await p.evaluate(() => HS.akt === null && HS.cat === null), T + 'keyingi oddiy kirish — yana umumiy');

    ok(errs.length === 0, T + 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
    await p.context().close();
  }
  await b.close();
  console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
