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
    // 4–6) SVO
    await p.evaluate(async () => { openScreen('screen-main'); await dvOpen(); dvDemoOn(); }); await p.waitForTimeout(1200);
    await p.evaluate(async () => { DV.demo = false; window.dvDay = async () => ({ nodata: true, list: [], cnt: {} }); DV.d = '2099-03-01'; try { localStorage.removeItem('agmk_dv_nd_hide_2099-03-01'); localStorage.removeItem('agmk_dv_nd_hide_2099-03-02'); } catch (e) {} await dvRender(); }); await p.waitForTimeout(600);
    const w = await p.evaluate(() => { const bx = document.querySelector('.dv-box.n59-nd'); return bx ? { b: getComputedStyle(bx.querySelector('b')).color, bg: getComputedStyle(bx).backgroundImage, x: !!bx.querySelector('.n59-x') } : null; });
    ok(w && lum(w.b) > 0.9 && /rgba\(30, 41, 59/.test(w.bg) && w.x, theme + ': SVO ogohlantirishi — toʻq koʻkimtir kartochka, oq sarlavha, ✕ bor (6.0): ' + JSON.stringify(w));
    await p.click('.dv-box.n59-nd .n59-x'); await p.waitForTimeout(200);
    const h1 = await p.evaluate(async () => { const a = !document.querySelector('.n59-nd'); await dvRender(); await new Promise(r => setTimeout(r, 300)); const b2 = !document.querySelector('.n59-nd');
      DV.d = '2099-03-02'; await dvRender(); await new Promise(r => setTimeout(r, 300)); return { a, b2, next: !!document.querySelector('.n59-nd') }; });
    ok(h1.a && h1.b2 && h1.next, theme + ': ✕ — shu kunga yashiriladi, boshqa kunda yana chiqadi: ' + JSON.stringify(h1));
    const s = await p.evaluate(() => { const f = document.querySelector('.dv-fs'), sel = f && f.querySelector('select'), q = document.querySelector('.dv-q');
      return { f: f && getComputedStyle(f).backgroundColor, sel: sel && getComputedStyle(sel).color, q: q && getComputedStyle(q).backgroundColor, qc: q && getComputedStyle(q).color }; });
    ok(s.f && lum(s.f) < 0.2 && lum(s.sel) > 0.9 && lum(s.q) < 0.2 && lum(s.qc) > 0.9, theme + ': SVO tanlovlari va qidiruv — toʻq, oq yozuv: ' + JSON.stringify(s));
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), theme + ': 412 px — gorizontal siljish yoʻq');
    ok(errs.length === 0, theme + ': sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
