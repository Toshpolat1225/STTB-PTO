// 6.2 (143): Qabul qilingan ehtiyot qismlar — bosh sahifada emas, «MTTB» guruhi ichida (rasm bilan). Faqat SOXTA maʼlumot.
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); modRefresh(); openScreen('screen-main'); });
  await p.waitForTimeout(600);
  let r = await p.evaluate(() => { const c = document.querySelector('#main-card-list [data-sec="mod-qabul"]'); const g = document.querySelector('#main-card-list [data-sec="grp-mttb"]');
    return { vis: !!(c && c.offsetParent), grp: g && g.textContent.replace(/\s+/g, ' ').trim() }; });
  ok(!r.vis && /3 boʻlim/.test(r.grp || ''), 'bosh sahifada «Qabul» kartasi koʻrinmaydi, MTTB guruhi — 3 boʻlim ' + JSON.stringify(r));
  r = await p.evaluate(async () => { menuGrpOpen('mttb'); await new Promise(s => setTimeout(s, 300)); const c = document.querySelector('#screen-grp [data-sec="mod-qabul"]'); const n = document.querySelectorAll('#screen-grp .card-list .btn-card').length; return { c: !!c, img: !!(c && c.querySelector('img')), n, last: c === [...document.querySelectorAll('#screen-grp .card-list .btn-card')].pop() }; });
  ok(r.c && r.img && r.n === 3 && r.last, 'MTTB guruhida 3-karta, rasm bilan ' + JSON.stringify(r));
  if (process.argv[3]) await p.screenshot({ path: process.argv[3] });
  r = await p.evaluate(async () => { document.querySelector('#screen-grp [data-sec="mod-qabul"]').click(); await new Promise(s => setTimeout(s, 300)); const s = $id('screen-qb'); return { on: !!(s && s.classList.contains('active')), back: s && s.querySelector('.back-btn').getAttribute('onclick') }; });
  ok(r.on && r.back === "menuGrpOpen('mttb')", 'karta bosilganda ochiladi, orqaga — MTTB guruhi ' + JSON.stringify(r));
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
