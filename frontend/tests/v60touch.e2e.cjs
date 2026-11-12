// 6.0 (5-6-bandlar): tez surish va AI tugmasi barmoq bilan (touch) surilishi; pointer hodisalari kelmasa ham ishlaydi
// (APK dagi holat taqlidi); qoʻyib yuborilganda sakramaydi; teginish jurnali. Faqat SOXTA maʼlumot.
//   node frontend/tests/v60touch.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const noPointer of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 880 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    if (noPointer) await p.addInitScript(() => { // APK taqlidi: pointer hodisalari tugmaga yetmaydi
      const stop = e => { if (e.pointerType === 'touch') e.stopImmediatePropagation(); };
      ['pointerdown', 'pointermove', 'pointerup'].forEach(t => window.addEventListener(t, stop, true)); });
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); localStorage.removeItem('agmk_ai_pos'); localStorage.removeItem('agmk_tj60');
      vagonlarData.splice(0, vagonlarData.length); for (let i = 0; i < 300; i++) vagonlarData.push({ id: 90000 + i, num: String(99000 + i), inv: String(80000 + i), type: 'Dumpkar 2VS-105', model: 'soxta', seh: 'Boshqarma', sortOrder: i + 1, status: 'Soz', kun: 100, yil: 2000 });
      openScreen('screen-main'); });
    await p.waitForTimeout(900);
    const c = await ctx.newCDPSession(p); const T = (type, x, y) => c.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    const tag = noPointer ? '[pointer yoʻq — APK taqlidi] ' : '';
    // AI
    const a0 = await p.evaluate(() => { const r = document.getElementById('aiGlobal').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await T('touchStart', a0.x, a0.y); for (let k = 1; k <= 10; k++) await T('touchMove', a0.x - k * 8, a0.y - k * 25); await T('touchEnd'); await p.waitForTimeout(300);
    const a1 = await p.evaluate(() => { const r = document.getElementById('aiGlobal').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, saved: !!localStorage.getItem('agmk_ai_pos') }; });
    ok(a0.y - a1.y > 150 && a1.saved, tag + 'AI tugmasi barmoq bilan surildi va joyi saqlandi ' + JSON.stringify([a0, a1]));
    // tez surish
    await p.evaluate(() => { openScreen('screen-vagonlar'); filterVagonlar(true); }); await p.waitForTimeout(1000);
    await T('touchStart', 200, 700); for (let y = 700; y > 520; y -= 20) await T('touchMove', 200, y); await T('touchEnd'); await p.waitForTimeout(300);
    const th = await p.evaluate(() => { const d = document.getElementById('fs59'), r = d.querySelector('.fs60-hit').getBoundingClientRect(); return { on: d.classList.contains('on'), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
    ok(th.on && th.w >= 48, tag + 'tez surish tugmasi chiqdi, ushlash maydoni ' + th.w + ' px');
    const s0 = await p.evaluate(() => FS59.sc.scrollTop);
    await T('touchStart', th.x + 10, th.y); for (let k = 1; k <= 14; k++) await T('touchMove', th.x + 10, th.y + k * 30);
    const mid = await p.evaluate(() => ({ drag: FS59.drag, st: FS59.sc.scrollTop })); await T('touchEnd'); await p.waitForTimeout(500);
    const s1 = await p.evaluate(() => FS59.sc.scrollTop);
    ok(mid.drag && mid.st > s0 + 1000, tag + 'tortilganda roʻyxat tez suriladi (' + s0 + ' → ' + mid.st + ')');
    ok(Math.abs(s1 - mid.st) < 400, tag + 'qoʻyib yuborilganda sakramaydi (' + mid.st + ' → ' + s1 + ')');
    await p.waitForTimeout(1800); ok(await p.evaluate(() => document.getElementById('fs59').classList.contains('on')), tag + '2 s dan keyin ham koʻrinib turibdi');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('agmk_tj60') || '[]').length > 0), tag + 'teginish jurnali yozildi');
    await ctx.close();
  }
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
