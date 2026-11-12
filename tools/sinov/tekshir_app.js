// AGMK-STTB — TEST serveridagi sinov maʼlumotlari bilan ilovani tekshirish:
// kirish → sinxron (serverdan hamma yozuvlar) → bosh sahifadagi HAR BIR boʻlim, vagonlar roʻyxati, pasport tarixi,
// kunlik polojeniya (bugun va 1 yil oldin), taʼmir grafigi, MTTB, buxgalteriya — JS xatolari va vaqt oʻlchanadi.
//   node tekshir_app.js <ilova.html> <panel_url> <tabel> <parol>
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('playwright');
const [HTML, ADMIN, T, PW] = process.argv.slice(2);
let bad = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) bad++; };
(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const st = await (await fetch(ADMIN + '/admin/state', { headers: { 'X-Admin-Token': TOK } })).json();
    const qr = st.ips[0].text;
    const b = await chromium.launch();
    const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = m => { window.__al = m; }; });
    await p.evaluate(q => srvConnect(srvParseQr(q)), qr); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', T); await p.fill('#lkPw', PW);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(6000);
    let t0 = Date.now();
    for (let i = 0; i < 12; i++) {
        await p.evaluate(() => syncNow(true)).catch(() => {}); await p.waitForTimeout(3000);
        const n = await p.evaluate(() => vagonlarData.reduce((a, v) => a + (v.history || []).length, 0));
        if (n > 20000) break;
    }
    const s = await p.evaluate(() => ({ err: SYNC.err || '', units: vagonlarData.length, hist: vagonlarData.reduce((a, v) => a + (v.history || []).length, 0),
        tamirda: vagonlarData.filter(v => v.status === 'Tamirda').length, ber: (mtData().ber || []).length, kir: (mtData().kir || []).length, store: window.agmkStoreInfo ? agmkStoreInfo().chars : 0 }));
    ok(!s.err && s.hist > 20000 && s.ber > 5000, 'sinxron: ' + JSON.stringify(s) + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s');
    // har bir ekran
    const run = async (name, fn, arg) => {
        const e0 = errs.length, t = Date.now();
        const r = await p.evaluate(fn, arg).catch(e => ({ ex: e.message }));
        await p.waitForTimeout(400);
        const ms = Date.now() - t, ee = errs.slice(e0);
        ok(!(r && r.ex) && !ee.length && ms < 8000, name + ' — ' + ms + ' ms' + (r && r.info ? ' · ' + r.info : '') + (r && r.ex ? ' · ' + r.ex : '') + (ee.length ? ' · ' + ee.join(' | ').slice(0, 200) : ''));
    };
    await run('vagonlar roʻyxati', () => { openScreen('screen-vagonlar'); filterVagonlar(); return { info: document.querySelectorAll('#screen-vagonlar .vagon-card, #screen-vagonlar tr').length + ' qator' }; });
    await run('pasport (eng koʻp tarixli)', () => { const v = vagonlarData.slice().sort((a, b) => (b.history || []).length - (a.history || []).length)[0]; openPassport(v.id); return { info: '№' + vagonNo(v) + ', tarix ' + v.history.length }; });
    await run('polojeniya — bugun', () => { polOpen(todayISO()); const G = polItems(todayISO()); return { info: G.reduce((a, g) => a + g.list.length, 0) + ' ta vagon' }; });
    await run('polojeniya — 1 yil oldin', () => { const d = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10); polOpen(d); const G = polItems(d); return { info: d + ': ' + G.reduce((a, g) => a + g.list.length, 0) + ' ta' }; });
    await run('taʼmir grafigi', () => { pprOpen(); return {}; });
    await run('MTTB', () => { openMTTB(); return { info: 'berilgan ' + mtData().ber.length }; });
    await run('buxgalteriya', () => { openBux(); return {}; });
    const ids = await p.evaluate(() => { try { return V7.homeCards().map(c => V7.homeId(c)).filter(x => /^fn:/.test(x)).map(x => x.slice(3)); } catch (e) { return []; } });
    for (const f of ids) {
        await run('boʻlim ' + f, (f) => { const n = f.replace(/_$/, ''); const fn = window[f] || window[n]; if (typeof fn !== 'function') return { info: 'funksiya yoʻq' }; fn(); return {}; }, f).catch(() => {});
        await p.evaluate(() => { try { document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden')); goHome && goHome(); } catch (e) {} }).catch(() => {});
    }
    ok(!errs.length, 'JS xatolari yoʻq' + (errs.length ? ': ' + [...new Set(errs)].slice(0, 5).join(' | ') : ''));
    await b.close();
    console.log(bad ? '❌ ' + bad + ' ta xato' : '✅ ALL OK'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
