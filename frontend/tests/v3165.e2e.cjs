// 3.16.5 sinovi: node frontend/tests/v3165.e2e.js <yigʻilgan ilova.html>  (Playwright kerak; haqiqiy vagonlar bazasi bilan)
const { chromium } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 412, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3000);
  await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = m => {}; showLockView('register'); $id('rgTabel').value = ADMIN_TABEL; $id('rgPw').value = '1111'; $id('rgPw2').value = '1111'; registerAccount(); }); await p.waitForTimeout(5000);
  let r = await p.evaluate(() => { const c = {}; onlyVagons().forEach(v => c[v.type] = (c[v.type] || 0) + 1); return { v: AGMK_VERSION, c, q: onlyVagons().filter(isQ115).length }; });
  ok(/^\d+\.\d+/.test(r.v), 'versiya ' + r.v); // avval 3.16.5 ga qatʼiy bogʻlangan edi
  ok(r.c['Dumpkar 2VS-105'] === 699 && r.c['Dumpkar 6VS-60'] === 137 && r.c['Sisterna'] === 130 && !r.c['Dumpkar 115'] && !r.c['Dumpkar 105'] && !r.c['Cisterna'], 'guruhlar: ' + JSON.stringify(r.c));
  ok(r.q === 96, 'Q-115: ' + r.q);
  r = await p.evaluate(() => { const v = onlyVagons().find(x => vagonNo(x) === '00018441'); recalcVagonStatus(v); return { t: vTypeFull(v), dr: v.tamirSanasi, k: v.keyingi, st: v.status, m: vDrMonths(v) }; });
  ok(r.t === 'Dumpkar 2VS-105 (Q-115)' && r.k === '2027-04-07' && r.st === 'Soz' && r.m === 24, '00018441: ' + JSON.stringify(r));
  r = await p.evaluate(() => { const v = onlyVagons().find(x => vagonNo(x) === '8121'); return { t: vTypeFull(v), m: vDrMonths(v) }; });
  ok(r.t === 'Dumpkar 2VS-105' && r.m === 12, '8121: ' + JSON.stringify(r));
  // tur tugmalari va kartochka
  await p.evaluate(() => openScreen('screen-vagonlar')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ tabs: [...document.querySelectorAll('#vagon-tabs .tab')].map(t => (t.getAttribute('title') || t.textContent.trim()) + ':' + (t.querySelector('.tab-cnt') || {}).textContent).slice(0, 5), card: vagonCardHtml(onlyVagons().find(x => vagonNo(x) === '00018441')).match(/vg-sub">([^<]*)/)[1] }));
  ok(r.tabs.some(t => /Dumpkar 2VS-105:699/.test(t)) && r.tabs.some(t => /Dumpkar 6VS-60:137/.test(t)) && r.tabs.some(t => /Sisterna:130/.test(t)), 'tur tugmalari: ' + r.tabs.join(' | '));
  ok(r.card === 'Dumpkar 2VS-105 (Q-115)', 'kartochka: ' + r.card);
  await p.screenshot({ path: '/tmp/claude-0/s3165_1.png' });
  await p.evaluate(() => setTypeFilter('Dumpkar 2VS-105', document.querySelector('#vagon-tabs .tvt'))); await p.waitForTimeout(800);
  await p.evaluate(() => { const v = onlyVagons().find(x => vagonNo(x) === '00018441'); openPassport(v.id); }); await p.waitForTimeout(1200);
  r = await p.evaluate(() => (document.getElementById('p-extra') || {}).innerText || '');
  ok(/GURUH:\s*Dumpkar 2VS-105 \(Q-115\)/.test(r) && /DR DAVRIYLIGI:\s*24 oy/.test(r), 'pasport: ' + r.replace(/\n/g, ' '));
  await p.screenshot({ path: '/tmp/claude-0/s3165_2.png' });
  // eski nomlar bilan saqlangan baza → migratsiya
  r = await p.evaluate(() => { const V = onlyVagons(); const a = V.find(x => vagonNo(x) === '00018442'), b = V.find(x => vagonNo(x) === '8113'), c = V.find(x => x.type === 'Sisterna'); a.type = 'Dumpkar 115'; delete a.q115; b.type = 'Dumpkar 105'; c.type = 'Cisterna'; const n = v3165Migrate(); return { n, a: vTypeFull(a), b: vTypeFull(b), c: c.type, ak: a.keyingi }; });
  ok(r.n === 3 && r.a === 'Dumpkar 2VS-105 (Q-115)' && r.b === 'Dumpkar 2VS-105' && r.c === 'Sisterna', 'eski nomlar yangilandi: ' + JSON.stringify(r));
  // grafik: 115 alohida boʻlim yoʻq
  await p.evaluate(() => { mdlClose && 0; pprOpen('2027-04'); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const d = vgD(); return { secs: d.secs.map(s => s.title), btn: !!document.querySelector('#pprModal .vr-btn'), apr: (d.mon['2027-04'] ? Object.entries(d.mon['2027-04']).map(([si, L]) => d.secs[si].title.slice(0, 40) + ':' + L.length) : []) }; });
  ok(!r.secs.some(t => /115/.test(t)) && r.secs.some(t => /2VS-105 tipidagi vagonlarning depo/.test(t)), 'grafik boʻlimlari: ' + r.secs.join(' | ').slice(0, 300));
  ok(r.btn, '«Rejani taqsimlash» tugmasi bor');
  await p.screenshot({ path: '/tmp/claude-0/s3165_3.png' });
  // reja: Q-115, 2027, 60 ta
  await p.evaluate(() => { VR.grp = 'q115'; VR.year = 2027; VR.n = 60; vrOpen(); }); await p.waitForTimeout(800);
  r = await p.evaluate(() => { const P = VR.plan; const reasons = {}; P.take.forEach(x => reasons[x.why] = (reasons[x.why] || 0) + 1); return { total: P.total, must: P.must, take: P.take.length, byM: P.byM, late: P.take.filter(x => x.late).length, lateOk: P.take.filter(x => x.late && x.why !== 'muddati oʻtgan').length, sum: Object.values(P.byM).reduce((a, b) => a + b, 0), reasons, txt: document.querySelector('#vrPlan .vr-ok,#vrPlan .vr-warn').innerText }; });
  ok(r.total === 96 && r.take === 60 && r.sum === 60 && r.lateOk === 0, 'reja: ' + JSON.stringify(r));
  await p.screenshot({ path: '/tmp/claude-0/s3165_4.png', fullPage: false });
  r = await p.evaluate(async () => { const before = onlyVagons().filter(v => v.vrPlan).length; await vrApply(); const L = onlyVagons().filter(v => v.vrPlan); const d = (VG.stale = true, vgD()); let n = 0; Object.keys(d.mon).forEach(m => Object.values(d.mon[m]).forEach(x => n += x.filter(z => !z.ghost && L.some(v => vagonNo(v) === z.v)).length)); return { before, after: L.length, ingraf: n, ex: L.slice(0, 2).map(v => vagonNo(v) + ' ' + v.keyingi + ' ' + v.status) }; });
  ok(r.before === 0 && r.after === 60 && r.ingraf >= 60, 'rejaga yozildi va grafikda: ' + JSON.stringify(r));
  ok(!errs.length, 'JS xatolar yoʻq ' + errs.join(' | ').slice(0, 300));
  console.log(fails ? fails + ' TA XATO' : 'ALL OK'); await b.close(); })();
