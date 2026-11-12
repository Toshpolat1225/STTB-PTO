// 6.2 (142): Gʻildirak juftliklari — bosh sahifada emas, «Vagonlar parki» ichida (rasm bilan). Faqat SOXTA maʼlumot.
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); modRefresh(); openScreen('screen-main'); });
  await p.waitForTimeout(500);
  let r = await p.evaluate(() => ({ main: !!document.querySelector('#main-card-list [data-sec="mod-kp"]'), mods: AGMK_MODS.some(m => m.id === 'kp') }));
  ok(!r.main && r.mods, 'bosh sahifada «Gʻildirak juftliklari» kartasi yoʻq (modul oʻzi bor) ' + JSON.stringify(r));
  r = await p.evaluate(async () => { vgmOpen(); await new Promise(s => setTimeout(s, 200)); const c = document.querySelector('#screen-vagmenu .kn2-kp'); const n = document.querySelectorAll('#screen-vagmenu .btn-card').length; return { c: !!c, img: !!(c && c.querySelector('img')), n, t: c && c.textContent }; });
  ok(r.c && r.img && r.n === 4 && /Gʻildirak juftliklari/.test(r.t), 'Vagonlar parki ichida 4-karta, rasm bilan ' + JSON.stringify(r));
  r = await p.evaluate(async () => { document.querySelector('#screen-vagmenu .kn2-kp').click(); await new Promise(s => setTimeout(s, 300)); const on = document.querySelector('#screen-kp.active') || ($id('screen-kp') && getComputedStyle($id('screen-kp')).display !== 'none'); const back = document.querySelector('#screen-kp .back-btn').getAttribute('onclick'); return { on: !!on, back }; });
  ok(r.on && r.back === 'vgmOpen()', 'karta bosilganda ochiladi, orqaga — Vagonlar parki ' + JSON.stringify(r));
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
