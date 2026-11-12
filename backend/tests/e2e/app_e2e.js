// Ilova ↔ yangi server: haqiqiy ilova (frontend/dist dagi HTML) brauzerda ochiladi va yangi Python serverga ulanadi.
//   node tests/e2e/app_e2e.js <ilova.html> <admin_url> [tabel parol] [tabel2 parol2]
// Server: AGMK_API_TLS=1 bilan (yoki shlyuz orqasida) HTTPS da ishlashi kerak. Playwright kerak.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('playwright');
const [HTML, ADMIN, T1 = '0001', P1 = '111111', T2 = '0011', P2 = '269509'] = process.argv.slice(2);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function session(browser, qr, t, pw) {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = m => { window.__al = m; }; });
    await p.evaluate(q => srvConnect(srvParseQr(q)), qr); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', t); await p.fill('#lkPw', pw);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(6000);
    return { p, errs, ctx };
}

(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const st = await (await fetch(ADMIN + '/admin/state', { headers: { 'X-Admin-Token': TOK } })).json();
    ok(st.ips.length > 0, 'panel: QR maʼlumoti bor — ' + (st.ips[0] && st.ips[0].text.slice(0, 60)));
    const qr = st.ips[0].text;
    const b = await chromium.launch();

    // 1) administrator kiradi va sinxronlaydi (ilovadagi boshlangʻich maʼlumot serverga yuklanadi)
    const A = await session(b, qr, T1, P1);
    let r = await A.p.evaluate(() => ({ u: currentUser && currentUser.tabel, adm: isAdminReal(), locked: document.body.classList.contains('locked'), v: AGMK_VERSION, al: window.__al || '' }));
    ok(r.u === T1 && !r.locked, 'birinchi xodim kirdi: ' + JSON.stringify(r)); // isAdminReal — ilovadagi ADMIN_TABEL (2582) ga bogʻliq
    await A.p.evaluate(() => syncNow(true)).catch(e => console.log('   sync:', e.message)); await A.p.waitForTimeout(4000);
    r = await A.p.evaluate(() => ({ err: SYNC.err || '', st: SYNC.lastStat || null }));
    ok(!r.err, 'administrator: sinxron xatosiz ' + JSON.stringify(r).slice(0, 200));
    // ilovadagi kv yozuvini oʻzgartirib serverga yuborish
    const mark = 'e2e-' + Date.now();
    await A.p.evaluate(m => { localStorage.setItem('agmk_e2e_belgi', m); try { saveDB(); } catch (e) { } }, mark);
    await A.p.evaluate(() => syncNow(true)).catch(() => { }); await A.p.waitForTimeout(3000);

    // 2) ikkinchi xodim kiradi: administrator yuklagan maʼlumot unda ham koʻrinadi
    const B = await session(b, qr, T2, P2);
    r = await B.p.evaluate(() => ({ u: currentUser && currentUser.tabel, locked: document.body.classList.contains('locked'), al: window.__al || '' }));
    ok(r.u === T2 && !r.locked, 'ikkinchi xodim kirdi: ' + JSON.stringify(r));
    await B.p.evaluate(() => syncNow(true)).catch(() => { }); await B.p.waitForTimeout(4000);
    r = await B.p.evaluate(() => ({ err: SYNC.err || '', st: SYNC.lastStat || null }));
    ok(!r.err, 'ikkinchi xodim: sinxron xatosiz ' + JSON.stringify(r).slice(0, 200));

    // 3) xabar: ikkinchi xodim → administrator (ilovaning oʻz funksiyasi orqali, fayl bilan)
    r = await B.p.evaluate(async t => { try { await syncSendMsg({ tabel: t }, 'E2E salom', [{ name: 'e2e.txt', mime: 'text/plain', blob: new Blob(['fayl mazmuni']) }]); return 'ok'; } catch (e) { return 'XATO ' + e.message; } }, T1);
    ok(r === 'ok', 'xabar va fayl yuborildi: ' + r);
    await A.p.evaluate(() => syncNow(true)).catch(() => { }); await A.p.waitForTimeout(3000);
    const st2 = await (await fetch(ADMIN + '/admin/state', { headers: { 'X-Admin-Token': TOK } })).json();
    ok(st2.audit.some(x => x.action === 'xabar yubordi' && x.tabel === T2), 'serverda xabar qayd etilgan (audit)');
    ok(st2.stats.reduce((s, x) => s + x.n, 0) > 0, 'serverdagi yozuvlar: ' + JSON.stringify(st2.stats).slice(0, 200));

    // 4) ekranlar ochiladi, JS xatolari yoʻq
    for (const fn of [() => openScreen('screen-main'), () => openXodimTree(), () => openScreen('screen-vagonlar')]) { try { await A.p.evaluate(fn); } catch (e) { } await A.p.waitForTimeout(700); }
    ok(!A.errs.length && !B.errs.length, 'JS xatolari yoʻq ' + A.errs.concat(B.errs).join(' | ').slice(0, 300));
    await b.close();
    console.log(fails ? fails + ' TA XATO' : 'ALL OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
