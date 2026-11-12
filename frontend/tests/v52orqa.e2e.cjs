// 5.2: «Dalolatnomalar» ichki boʻlimidan «Orqaga» — bir qadam (boʻlimlar roʻyxatiga), keyingisi — bosh menyu.
//       Gʻildirak sinishlari namunasi ilovada yoʻq; foydalanuvchi kiritgani saqlanadi. Faqat SOXTA maʼlumot.
//   node frontend/tests/v52orqa.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); if (t === 'glass') document.body.classList.add('glass'); }, theme);
    ok(await p.evaluate(() => Array.isArray(GJ26) && GJ26.length === 0), theme + ': gʻildirak sinishlari namunasi ilovada yoʻq (jadval boʻsh)');
    const st = () => p.evaluate(() => ({ scr: (document.querySelector('.screen.active') || {}).id, akt: HS.akt, tab: HS.tab }));
    for (const k of ['noxush', 'kirish', 'mahsinov', 'kolodka']) {
      await p.evaluate(() => { openScreen('screen-main'); }); await p.waitForTimeout(150);
      await p.evaluate(() => openHisob()); await p.waitForTimeout(300);
      await p.evaluate(() => { HS.tab = 'akt'; hsRender(); }); await p.waitForTimeout(200);
      if (k === 'noxush') { await p.click(`[onclick*="HS.akt='nosozg'"]`); await p.waitForTimeout(300); } // 5.7: Nosozlik dalolatnomasi ichida
      await p.click(`.hs-card[onclick*="HS.akt='${k}'"]`); await p.waitForTimeout(300);
      const a = await st();
      if (k === 'noxush') { await p.evaluate(() => window.agmkBack()); await p.waitForTimeout(450); const g = await st(); ok(g.akt === 'nosozg', theme + ': noxush → «Orqaga» → Nosozlik dalolatnomasi'); }
      await p.evaluate(() => window.agmkBack()); await p.waitForTimeout(450);
      const b1 = await st();
      await p.waitForTimeout(450); await p.evaluate(() => window.agmkBack()); await p.waitForTimeout(450);
      const b2 = await st();
      ok(a.akt === k && b1.scr === 'screen-hisob' && !b1.akt && b2.scr === 'screen-main', theme + ': ' + k + ' → «Orqaga» → boʻlimlar roʻyxati → «Orqaga» → bosh menyu: ' + JSON.stringify([a.akt, b1.scr + '/' + b1.akt, b2.scr]));
    }
    // yuqoridagi ‹ tugmasi ham bir qadam
    await p.evaluate(() => { openHisob(); HS.tab = 'akt'; HS.akt = 'noxush'; hsRender(); }); await p.waitForTimeout(300);
    await p.evaluate(() => { const b = [...document.querySelectorAll('#screen-hisob .back-btn')].find(x => x.getBoundingClientRect().width); b.click(); }); await p.waitForTimeout(300);
    const t1 = await st();
    ok(t1.scr === 'screen-hisob' && t1.akt === 'nosozg', theme + ': yuqoridagi ‹ — avval Nosozlik dalolatnomasiga (5.7)');
    // foydalanuvchi kiritgan jadval saqlanadi (namuna emas)
    await p.evaluate(() => { kvSet('agmk_gj_v1', { rows: [{ n: 1, sana: '01.01.2099', vagon: '99999001', gildirak: '1' }], file: 'soxta' }); });
    await p.reload(); await p.waitForTimeout(4500);
    ok(await p.evaluate(() => GJ26.length === 1 && GJ26[0].vagon === '99999001'), theme + ': foydalanuvchi jadvali qayta ochilganda ham saqlanadi');
    ok(errs.length === 0, theme + ': sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
