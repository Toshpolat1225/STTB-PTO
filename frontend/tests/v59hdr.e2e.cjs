// 6.0: ichki oraliq sahifalar sarlavhasi — Klassik va Vitrina. Kartalar oʻzgarmaydi, boshqa mavzular oʻzgarmaydi,
// ish oynalari (Vagonlar parki roʻyxati) oʻzgarmaydi, sarlavhada son izohlari yoʻq (muallif 19:32). Faqat SOXTA maʼlumot.
//   node frontend/tests/v59hdr.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const run = async (theme, vw, fn) => { const p = await (await b.newContext({ viewport: { width: vw, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); themeApply(t); }, theme);
    await fn(p); await p.close(); };
  const cards = p => p.evaluate(() => [...document.querySelectorAll('.screen.active .sec-body .btn-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim()));
  for (const vw of [412, 1440]) {
    await run('classic', vw, async p => {
      await p.evaluate(() => menuGrpOpen('sttb')); await p.waitForTimeout(500);
      const r = await p.evaluate(() => { const h = document.querySelector('#screen-grp .h9-head'), x = h.querySelector('.h59x'); const sum = [...document.querySelectorAll('#screen-grp .mn-cnt')].reduce((a, e) => a + (+(e.textContent.match(/\d+/) || [0])[0]), 0); return { k: h.classList.contains('h59-k'), crumb: (x.querySelector('.h59-crumb') || {}).textContent, h1: (x.querySelector('h1') || {}).textContent, chips: x.querySelectorAll('.h59-chips, .h59-chips span').length, txt: x.textContent, n: document.querySelectorAll('#screen-grp .sec-body .btn-card').length, sum: sum, bar: !!h.querySelector('.h9-bar .h9-menu') && !!h.querySelector('.h9-mo'), hgt: h.offsetHeight }; });
      ok(r.k && /Bosh sahifa › Texnika/.test(r.crumb) && r.h1 === 'STTB texnikalari', vw + ' Klassik: STTB — yoʻl yozuvi va sarlavha ' + JSON.stringify(r));
      ok(r.chips === 0 && !/park|birlik|boʻlim/.test(r.txt), vw + ' Klassik: son izohlari (park, birlik, boʻlim) yoʻq — muallif 19:32');
      ok(r.bar && r.hgt >= (vw > 700 ? 290 : 250), vw + ' Klassik: ☰ va ⋮ joyida, sarlavha balandligi ' + r.hgt);
      await p.evaluate(() => vgmOpen('screen-grp')); await p.waitForTimeout(400);
      ok(await p.evaluate(() => /Texnika › STTB texnikalari/.test((document.querySelector('#screen-vagmenu .h59-crumb') || {}).textContent || '')), vw + ' Klassik: uchinchi pogʻona — ikki pogʻonali yoʻl yozuvi');
      await p.evaluate(() => openScreen('screen-vagonlar')); await p.waitForTimeout(400);
      ok(await p.evaluate(() => !document.querySelector('#screen-vagonlar .h59x')), vw + ' Klassik: «Vagonlar parki» ish oynasi oʻzgarmadi');
    });
    await run('vitrina', vw, async p => {
      await p.evaluate(() => menuGrpOpen('sttb')); await p.waitForTimeout(500);
      const r = await p.evaluate(() => { const h = document.querySelector('#screen-grp .h9-head'), x = h.querySelector('.h59v'); return { v: h.classList.contains('h59-v'), org: (x.querySelector('.h59v-org') || {}).textContent, sec: (x.querySelector('.h59v-sec b') || {}).textContent, h1: (x.querySelector('h1') || {}).textContent, nums: x.querySelectorAll('.h59v-nums').length, txt: x.textContent, rad: getComputedStyle(h.querySelector('.h9-c')).borderRadius }; });
      ok(r.v && /SANOAT TEMIR/.test(r.org) && r.sec === 'Texnika' && r.h1 === 'STTB texnikalari' && r.rad === '14px', vw + ' Vitrina: profil kartasi uslubi ' + JSON.stringify(r));
      ok(r.nums === 0 && !/\d+ ta park|Jami \d|birlik/.test(r.txt), vw + ' Vitrina: son izohlari yoʻq');
    });
  }
  // kartalar oʻzgarmaydi (mavzu almashganda ham bir xil roʻyxat) va boshqa mavzular tegilmaydi
  let A = null, B = null;
  await run('glass', 412, async p => { await p.evaluate(() => menuGrpOpen('sttb')); await p.waitForTimeout(400); A = await cards(p); ok(await p.evaluate(() => !document.querySelector('#screen-grp .h59x')), 'glass mavzusi: sarlavha oʻzgarmadi'); });
  await run('classic', 412, async p => { await p.evaluate(() => menuGrpOpen('sttb')); await p.waitForTimeout(400); B = await cards(p); });
  ok(JSON.stringify(A) === JSON.stringify(B) && A.length === 7, 'pastdagi kartalar oʻsha-oʻsha (' + (A || []).length + ' ta)');
  await run('classic', 412, async p => { await p.evaluate(() => openHR()); await p.waitForTimeout(500); ok(await p.evaluate(() => (document.querySelector('#screen-hr .h59x h1') || {}).textContent === 'Dispetcherlik'), 'Dispetcherlik: sarlavha bor'); });
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
