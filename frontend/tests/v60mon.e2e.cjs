// 6.0 (8-band): SVO Monitoring oynasi telefonda — bitta ustun, yorliqlar, xodim kartochkalari; kompyuterda jadval qoladi.
//   node frontend/tests/v60mon.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const vw of [412, 1440]) {
    const p = await (await b.newContext({ viewport: { width: vw, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
    await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); dvDemoOn(); }); await p.waitForTimeout(1400);
    await p.evaluate(() => dvMonOpen()); await p.waitForTimeout(1400);
    const r = await p.evaluate(() => { const W = innerWidth, m = document.getElementById('dvMon'), s = m.querySelector('.dm-side').getBoundingClientRect(), top = m.querySelector('.dm-top').getBoundingClientRect();
      return { cards: m.querySelectorAll('.dm60-c').length, table: m.querySelectorAll('table.dm-t').length, over: m.scrollWidth > W + 2, sideW: Math.round(s.width), sideBelowTop: s.top >= top.bottom - 1 }; });
    if (vw < 720) ok(r.cards > 0 && r.table === 0 && !r.over && r.sideBelowTop && r.sideW > 300, 'telefon: kartochkalar, yorliqlar tepada (gorizontal), ekrandan chiqmaydi ' + JSON.stringify(r));
    else ok(r.table > 0 && r.cards === 0 && r.sideW >= 200, 'kompyuter: jadval va chap menyu oʻzgarmadi ' + JSON.stringify(r));
    await p.close();
  }
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
