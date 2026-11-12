// 5.9: Struktura PDF — ilovaning oʻzida, vektor (matn + chiziq), bitta bet, haqiqiy oʻlcham, oq fon, oklad yoʻq.
//   node frontend/tests/v59stpdf.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); });
  await p.evaluate(() => openStruct()); await p.waitForTimeout(1500);
  const s0 = await p.evaluate(() => ST.s);
  for (const full of [false, true]) {
    const r = await p.evaluate(async f => { const R = st59MakePdf(f); const t = await R.blob.text(); return { w: R.w, h: R.h, n: R.n, pages: (t.match(/\/Type \/Page\b/g) || []).length, img: /\/Subtype \/Image/.test(t), font: /LiberationSans/.test(t), white: /1 1 1 rg 0 0 /.test(t), ok: /oklad/i.test(t), size: R.blob.size }; }, full);
    ok(r.pages === 1 && !r.img && r.font && r.white, (full ? 'toʻliq' : 'ekrandagi') + ': 1 bet, rasm yoʻq, matn shrift bilan, oq fon ' + JSON.stringify(r));
    ok(r.w > 1000 && r.n > 50, (full ? 'toʻliq' : 'ekrandagi') + ': haqiqiy oʻlcham va yozuvlar soni');
  }
  ok(await p.evaluate(s => Math.abs(ST.s - s) < 1e-6 && !document.querySelector('#stCv .st-chs.cl.show'), s0), 'PDF’dan keyin ekran masshtabi va yigʻilgan roʻyxatlar oʻz holiga qaytdi');
  await p.evaluate(() => stPdf(false)); await p.waitForTimeout(800);
  ok(await p.evaluate(() => /AGMK_STTB_tuzilma\.pdf/.test(document.body.innerText)), 'tugma — PDF fayl tayyorlanadi (yuklab olish oynasi)');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
