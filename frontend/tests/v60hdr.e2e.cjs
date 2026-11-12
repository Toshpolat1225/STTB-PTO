// 6.0 (1, 14-16): bosh sahifa tepasi — D2 (Klassik) / Vitrina-D2. Eski tugmalar yashirin, yangilari ularni bosadi;
// sonlar koʻchadi; banner: ish joyi, Tab №, lavozim, F.I.Sh.; qidiruv ishlaydi. Faqat SOXTA maʼlumot.
//   node frontend/tests/v60hdr.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [vw, th] of [[412, 'classic'], [412, 'vitrina'], [1366, 'classic']]) {
    const p = await (await b.newContext({ viewport: { width: vw, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
    await p.evaluate(t => { currentUser = { tabel: '9902', name: 'Namunaviy', role: 'admin' }; sectionItemsDB.xodim = sectionItemsDB.xodim || {};
      (sectionItemsDB.xodim['Boshqaruv apparati'] = sectionItemsDB.xodim['Boshqaruv apparati'] || []).push({ id: 'x9902', tabel: '9902', name: 'Namunaviy Aziz Soxtaevich', posNo: 22 });
      document.body.classList.remove('locked'); themeApply(t); openScreen('screen-main'); }, th);
    await p.waitForTimeout(1200);
    const tag = vw + ' ' + th + ': ';
    await p.evaluate(() => { const s = document.querySelector('#d60h [data-k="srch"]'); if (s) s.click(); }); await p.waitForTimeout(150); // 6.1: qidiruv «Qidiruv» tugmasi bilan ochiladi
    const r = await p.evaluate(() => { const h = document.getElementById('d60h'), head = document.querySelector('#screen-main > .ui-head'); const vis = s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none'; };
      return { h: !!h, old: vis('#screen-main .header') || vis('#qrTopBtn'), wp: (h.querySelector('.d60-wp') || {}).textContent, tb: (h.querySelector('.d60-tb') || {}).textContent, lv: (h.querySelector('.d60-lv') || {}).textContent, nm: (h.querySelector('.d60-nm') || {}).textContent,
        vit: h.classList.contains('d60-vit'), inp: vis('#d60h .search-box'), over: document.documentElement.scrollWidth > innerWidth + 2, menu: vis('#d60h .d60-menu') }; });
    ok(r.h && !r.old && !r.over, tag + 'yangi tepa qism, eski tugmalar yashirin, ekrandan chiqmaydi');
    ok(r.wp === 'ICHTB' && r.tb === 'Tab № 9902' && /I-toifali muhandisi/.test(r.lv) && r.nm === 'Namunaviy Aziz Soxtaevich', tag + 'banner: ' + [r.wp, r.tb, r.lv, r.nm].join(' | '));
    ok(r.vit === (th === 'vitrina') && r.inp && r.menu === (vw > 700), tag + 'mavzu, qidiruv maydoni, ☰ (faqat Web)');
    // tugmalar eski funksiyalarni chaqiradi
    const calls = await p.evaluate(async () => { const c = []; window.openNotifs = () => c.push('bell'); window.dl59List = () => c.push('dl');
      const hook = (id, k) => { const e = document.getElementById(id); if (e) e.addEventListener('click', ev => { c.push(k); ev.stopImmediatePropagation(); }, true); };
      window.qrScanOpen = () => c.push('qr'); hook('chatTopBtn', 'chat'); hook('opsBtn', 'task'); // 6.1: QR → «Skaner» (banner ichida)
      ['scan', 'bell', 'chat', 'task', 'dl'].forEach(k => document.querySelector('#d60h [data-k="' + k + '"]').click()); await new Promise(r => setTimeout(r, 100));
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden')); return c; });
    ok(['qr', 'bell', 'chat', 'task', 'dl'].every(k => calls.includes(k)), tag + 'tugmalar eski vazifani bajaradi: ' + calls.join(','));
    // son koʻchadi
    const n = await p.evaluate(async () => { const bc = document.getElementById('bellCount'); bc.textContent = '3'; bc.classList.remove('hidden'); d60Counts(); return (document.querySelector('#d60h [data-k="bell"] .d60-n.on') || {}).textContent; });
    ok(n === '3', tag + '🔔 soni koʻrinadi: ' + n);
    // qidiruv
    const q = await p.evaluate(async () => { const i = document.querySelector('#d60h .search-box'); i.focus(); i.value = 'Dispetcher'; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); i.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
      await new Promise(r => setTimeout(r, 500)); const vis = [...document.querySelectorAll('#main-card-list > .btn-card')].filter(c => c.offsetParent).map(c => c.textContent.trim().slice(0, 20)); return vis; });
    ok(q.length >= 1 && q.length < 6 && q.some(t => /Dispetcher/.test(t)), tag + 'qidiruv ishlaydi: ' + q.join(' | '));
    await p.close();
  }
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
