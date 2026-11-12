// 6.0 mayda tuzatishlar: Oylik toʻplam tugmalari ustma-ust emas; SVO Demo tugmasi onlayn ham; ⏹ Toʻxtatish. Faqat SOXTA maʼlumot.
//   node frontend/tests/v60ui.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); });
  // 3) Oylik toʻplam
  await p.evaluate(() => { openHisob(); HS.tab = 'hisob'; HS.cat = 'vagon'; hsRender(); }); await p.waitForTimeout(700);
  const r = await p.evaluate(() => { const L = [...document.querySelectorAll('#hpBox .alb-btn')].map(e => e.getBoundingClientRect()); if (L.length < 2) return null; return { n: L.length, gap: L[1].top - L[0].bottom, w0: L[0].width, w1: L[1].width }; });
  ok(r && r.gap >= 0 && Math.abs(r.w0 - r.w1) < 2, 'Oylik toʻplam: «Fayllarni tanlash» va «Word» alohida qatorda, teng kenglikda ' + JSON.stringify(r));
  // 11) SVO demo
  await p.evaluate(() => dvDemoOn()); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => !!document.querySelector('#screen-dav .dv-demo .dv60-off')), 'SVO demo: «⏹ Toʻxtatish» tugmasi bor');
  await p.evaluate(async () => { DV.demo = false; await dvRender().catch(() => {}); }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => !!document.querySelector('#screen-dav .dv-acts .dv60-on') && !document.querySelector('#screen-dav .dv-demo')), 'SVO onlayn (server bilan): «🧪 Demo» tugmasi bor');
  // 9) Monitoring → «Orqaga» → ☰ va ⋮ joyida; keyin har bir boʻlim sahifasida ham
  await p.evaluate(() => { DV.demo = true; DV.cfg = null; dvOpen(); }); await p.waitForTimeout(1200);
  await p.evaluate(() => dvMonOpen()); await p.waitForTimeout(1200); await p.evaluate(() => history.back()); await p.waitForTimeout(800);
  const m = await p.evaluate(() => ({ scr: (document.querySelector('.screen.active') || {}).id, mon: !!document.getElementById('dvMon'), cls: document.body.classList.contains('dv-mon-on'), menu: !!document.querySelector('.screen.active .h9-menu'), more: !!document.querySelector('.screen.active .h9-mo') }));
  ok(m.scr === 'screen-dav' && !m.mon && !m.cls && m.menu && m.more, '«Orqaga» monitoringni yopadi, SVO da ☰ va ⋮ bor ' + JSON.stringify(m));
  const miss = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)), out = []; openScreen('screen-main'); await w(200);
    const n = [...document.querySelectorAll('#main-card-list > .btn-card')].filter(c => c.offsetParent).length;
    for (let i = 0; i < n; i++) { document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(x => x.classList.add('hidden')); openScreen('screen-main'); await w(120); const c = [...document.querySelectorAll('#main-card-list > .btn-card')].filter(c => c.offsetParent)[i]; const t = c.textContent.trim().slice(0, 25); c.click(); await w(500);
      const a = document.querySelector('.screen.active'); if (a && a.id !== 'screen-main' && !(a.querySelector('.h9-menu') && a.querySelector('.h9-mo'))) out.push(t + ' (' + a.id + ')'); }
    return out; });
  ok(miss.length === 0, 'hamma boʻlimlarda ☰ va ⋮ bor' + (miss.length ? ' — yoʻq: ' + miss.join(', ') : ''));
  // 7) standart kartochkalar
  const hs = await p.evaluate(async () => { menuGrpOpen('seh'); await new Promise(r => setTimeout(r, 500)); return [...document.querySelectorAll('#screen-grp .card-list > .btn-card')].map(c => { const i = c.querySelector('.btn-icon').getBoundingClientRect(); return [Math.round(c.getBoundingClientRect().height), Math.round(i.width)]; }); });
  ok(hs.length === 2 && hs[0][0] === hs[1][0] && hs[0][1] === hs[1][1], 'Seh va uchastkalar: ikkala kartochka bir xil (balandlik, belgi) ' + JSON.stringify(hs));
  // 12) pasport nomi
  const ps = await p.evaluate(async () => { vagonlarData.splice(0, vagonlarData.length, { id: 90001, num: '8121', inv: '1', type: 'Dumpkar 2VS-105', model: 'soxta', seh: 'Boshqarma', sortOrder: 1, status: 'Soz', kun: 100, yil: 2000 }); openPassport(90001); await new Promise(r => setTimeout(r, 700));
    const t = document.getElementById('pasport-header-title').getBoundingClientRect(), pc = document.querySelector('#screen-vagon-pasport .passport-container').getBoundingClientRect();
    return { mid: Math.abs((t.left + t.width / 2) - (pc.left + pc.width / 2)), w: t.width, pe: getComputedStyle(document.getElementById('pasport-header-title')).pointerEvents, und: /undefined/.test(document.querySelector('#screen-vagon-pasport .passport-grid').textContent) }; });
  ok(ps.mid < 3 && ps.w < 300 && ps.pe === 'none' && !ps.und, 'pasport: nom kartochkasi ixcham, oʻrtada, bosilmaydi; «undefined» yoʻq ' + JSON.stringify(ps));
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
