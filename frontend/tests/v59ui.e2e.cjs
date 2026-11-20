// 5.9 (2–6-bandlar): Struktura maydoni toʻq, kartochkalar avvalgi rangda (oq) va oʻqiladigan; «server ulanmagan» — kichik, burchakda, bir marta;
// SVO ogohlantirishi — toʻq sarlavha va ✕ (shu kunga); SVO tanlovlari toʻq. Faqat SOXTA maʼlumot.
//   node frontend/tests/v59ui.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
const lum = s => { const m = String(s).match(/[\d.]+/g) || [0, 0, 0]; return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); if (t === 'glass') document.body.classList.add('glass'); }, theme);
    // 2) Struktura
    await p.evaluate(() => openStruct()); await p.waitForTimeout(1200);
    const c = await p.evaluate(() => { const g = (q, k) => { const e = document.querySelector(q); return e ? getComputedStyle(e)[k] : ''; };
      return { vp: g('.st-vp', 'backgroundColor'), box: g('.st-vp .st-box', 'backgroundColor'), bh: g('.st-vp .st-bh b', 'color'), ph: g('.st-vp .st-ph span', 'color') }; });
    ok(lum(c.vp) > 0.2 && lum(c.vp) < 0.45 && lum(c.box) > 0.95, theme + ': Struktura — maydon kulrang, kartochka avvalgidek oq: ' + c.vp + ' / ' + c.box);
    ok(lum(c.bh) < 0.15 && lum(c.ph) < 0.15, theme + ': Struktura — sarlavha va lavozim nomi toʻq/aniq: ' + c.bh + ' / ' + c.ph);
    // 3) server yozuvi
    const n = await p.evaluate(async () => { const m = '📴 Server ulanmagan — maʼlumotlar telefonda saqlangan, server yoqilganda oʻzi yuboriladi';
      showToast(m); await new Promise(r => setTimeout(r, 350)); const e = document.getElementById('n59Note'), r = e.getBoundingClientRect(), t = document.getElementById('toastMsg');
      const o = { left: r.left, bottom: innerHeight - r.bottom, w: r.width, vis: e.classList.contains('show'), toast: !!(t && t.classList.contains('show') && /Server ulanmagan/.test(t.innerText)) };
      e.classList.remove('show'); showToast(m); o.again = e.classList.contains('show');
      showToast('🟢 Server ulandi'); showToast(m); o.after = e.classList.contains('show'); return o; });
    ok(n.vis && !n.toast && n.left < 20 && n.bottom < 40 && n.w < 412 * 0.65, theme + ': «Server ulanmagan» — kichik, pastki chap burchakda: ' + JSON.stringify(n));
    ok(!n.again && n.after, theme + ': yozuv bir marta chiqadi, server ulangandan keyin yana chiqishi mumkin');
    const ptr = await p.evaluate(() => { PTR.busy = false; const vp = document.getElementById('stVp'), r = vp.getBoundingClientRect(), x = r.left + 150, y = r.top + 200;
      const T = (yy) => new Touch({ identifier: 1, target: vp, clientX: x, clientY: yy });
      vp.dispatchEvent(new TouchEvent('touchstart', { touches: [T(y)], bubbles: true })); vp.dispatchEvent(new TouchEvent('touchmove', { touches: [T(y + 220)], bubbles: true }));
      return { y0: PTR.y0, dy: PTR.dy }; });
    ok(ptr.y0 === null && !ptr.dy, theme + ': Struktura surilganda «pastga tortib yangilash» ishlamaydi');
    // 4–6) SVO — 6.2 da yakuniy koddan olib tashlandi
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), theme + ': 412 px — gorizontal siljish yoʻq');
    ok(errs.length === 0, theme + ': sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
