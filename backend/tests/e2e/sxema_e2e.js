// 4.4: temir yoʻl sxemasi — serverdan bir bosishda, foiz bilan yuklab olish (Python serverda).
//   node tests/e2e/sxema_e2e.js <ilova.html> <admin_url> [tabel parol]
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('playwright');
const [HTML, ADMIN, T1 = '0001', P1 = '111111'] = process.argv.slice(2);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const st = await (await fetch(ADMIN + '/admin/state', { headers: { 'X-Admin-Token': TOK } })).json();
    const b = await chromium.launch(), ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = m => { window.__al = m; }; });
    // ulanmagan — tushunarli xabar
    let r = await p.evaluate(async () => { await sxdGo(true); return SXD.err; });
    ok(/Serverga ulanish/.test(r), 'ulanmagan: ' + r.slice(0, 80));
    await p.evaluate(q => srvConnect(srvParseQr(q)), st.ips[0].text); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', T1); await p.fill('#lkPw', P1);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(6000);
    r = await p.evaluate(async () => { const P = []; const t = setInterval(() => P.push(SXD.pct), 30); sxPackOpen(); for (let i = 0; i < 200 && (SXD.busy || !sxPackInfo()); i++) await new Promise(z => setTimeout(z, 100)); clearInterval(t); return { info: sxPackInfo(), loaded: SXP.loaded, err: SXD.err, steps: new Set(P).size, box: !!$id('sxdBox') }; });
    ok(r.info && r.info.size > 1e6 && r.loaded && !r.err && r.box, 'Parametrlar → sxema: oʻzi yuklandi ' + JSON.stringify({ size: r.info && r.info.size, steps: r.steps, err: r.err }));
    console.log(errs.length ? 'sahifa xatolari: ' + errs.join(' | ') : '✅ sahifa xatolarisiz'); await b.close(); process.exit(fails ? 1 : 0);
})();
