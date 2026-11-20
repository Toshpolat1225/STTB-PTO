// 5.7: ⋮ → Mobil / Web koʻrinish, chap panel, SVO namuna ⋮ dan, elektrovoz rasmlari. Faqat SOXTA maʼlumot:
//   node frontend/tests/v57web.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
const login = () => { currentUser = { tabel: ADMIN_TABEL, name: 'Soxta Test', role: 'admin' }; document.body.classList.remove('locked'); modRefresh(); };
(async () => {
  const b = await chromium.launch(), errs = [];
  // --- telefon ---
  const pc = await b.newContext({ viewport: { width: 412, height: 880 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await pc.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500); await p.evaluate(login); await p.waitForTimeout(400);
  const t1 = await p.evaluate(() => ({ v: WB.view, mob: document.body.classList.contains('agmk-mob'), vp: document.querySelector('meta[name=viewport]').content }));
  ok(t1.v === 'mob' && t1.mob && /device-width/.test(t1.vp), 'telefon: standart — Mobil (' + t1.vp + ')');
  await p.click('#d60h [data-k="more"]'); // 6.0: ⋮ — yangi tepa qismda await p.waitForTimeout(300);
  const t2 = await p.evaluate(() => { const m = document.getElementById('h9Menu'); return m ? Array.from(m.querySelectorAll('button')).map(x => x.textContent) : []; });
  ok(t2.length >= 4 && /Profil/.test(t2[0]) && /Logotip/.test(t2[2]) && /Web/.test(t2[3]), 'bosh sahifa ⋮: Profil, Parametrlar, Logotip, Web koʻrinish — ' + t2.join(' | '));
  const lg = await p.evaluate(async () => { const bg0 = getComputedStyle(document.querySelector('#screen-main > div')).backgroundImage.length; document.querySelector('#h9Menu button[data-i="2"]').click(); await new Promise(r => setTimeout(r, 600)); const l = document.querySelector('#screen-main .app-logo'); return { vis: getComputedStyle(l).visibility, bg: getComputedStyle(document.querySelector('#screen-main > div')).backgroundImage.length === bg0 }; });
  ok(lg.vis === 'hidden' && lg.bg, 'logotip yashirildi, yuqori fon rasmi oʻzgarmadi');
  await p.click('#d60h [data-k="more"]'); // 6.0: ⋮ — yangi tepa qismda await p.waitForTimeout(300);
  await p.evaluate(() => { document.querySelector('#h9Menu button[data-i="3"]').click(); }); await p.waitForTimeout(800);
  const t3 = await p.evaluate(() => ({ v: WB.view, st: localStorage.getItem('agmk_view'), vp: document.querySelector('meta[name=viewport]').content, w: window.innerWidth }));
  ok(t3.v === 'web' && t3.st === 'web' && /width=1280/.test(t3.vp) && /user-scalable=yes/.test(t3.vp), 'telefon: Web → sahifa 1280 px, kattalashtirish mumkin (' + t3.w + ')');
  // 6.2: SVO davomat yakuniy koddan olib tashlandi — uning ⋮ tekshiruvlari ham olib tashlandi
  { const nd = await p.evaluate(() => typeof window.dvOpen === 'undefined' && !document.getElementById('screen-dav')); ok(nd, 'SVO davomat ilovada yoʻq'); }
  // qayta ochilganda tanlov saqlanadi
  await p.reload(); await p.waitForTimeout(4500);
  const t6 = await p.evaluate(() => WB.view); ok(t6 === 'web', 'qayta ochilganda oxirgi tanlov (Web) qoʻllanadi');
  await pc.close();
  // --- kompyuter ---
  const dc = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const d = await dc.newPage(); d.on('pageerror', e => errs.push(e.message));
  await d.goto('file://' + process.argv[2]); await d.waitForTimeout(4500); await d.evaluate(login); await d.waitForTimeout(600);
  // 5.9 (8-band): doimiy chap panel oʻrniga bosh sahifa tepasida ☰ — bosilganda panel ochiladi
  const k1 = await d.evaluate(() => { const m = document.querySelector('#d60h .d60-menu') || document.getElementById('mn59Menu'); /* 6.0 */ const r = m && m.getBoundingClientRect(); return { v: WB.view, side: document.body.classList.contains('wb-side'), menu: !!(r && r.width && r.top < 120 && r.left < 200), grid: getComputedStyle(document.getElementById('main-card-list')).display, bf: getComputedStyle(document.querySelector('#main-card-list .btn-card')).backdropFilter }; });
  ok(k1.v === 'web' && !k1.side && k1.menu, 'kompyuter: standart — Web, chap panel doim ochiq emas, tepada ☰ (5.9)');
  await d.click('#d60h .d60-menu'); // 6.0: ☰ — yangi tepa qismda await d.waitForTimeout(500);
  const k1b = await d.evaluate(() => ({ drw: !!document.querySelector('#h9Drw .h9-di'), on: document.getElementById('h9Drw').classList.contains('on') }));
  ok(k1b.drw && k1b.on, '☰ bosilganda boʻlimlar paneli ochiladi');
  await d.evaluate(() => { try { h9DrawerClose(); } catch (e) {} }); await d.waitForTimeout(300);
  ok(k1.grid === 'grid' && (k1.bf === 'none' || !k1.bf), 'Web: kartalar panjarada, xiralashtirish yoʻq (' + k1.bf + ')');
  const k2 = await d.evaluate(() => { const L = h9MenuData(); const el = document.querySelector('#h9Drw .h9-di[data-k="1"]'); return { n: L.length, back: (() => { const a = document.querySelector('.screen.active').id; return a; })() }; });
  ok(k2.n >= 5, 'panelda boʻlimlar: ' + k2.n);
  const k3 = await d.evaluate(async () => { wbSet('mob'); await new Promise(r => setTimeout(r, 500)); return { grid: getComputedStyle(document.getElementById('main-card-list')).display, side: document.body.classList.contains('wb-side'), mw: getComputedStyle(document.getElementById('screen-main')).maxWidth, on: document.getElementById('h9Drw').classList.contains('on') }; });
  ok(k3.grid !== 'grid' && !k3.side && k3.mw === '600px' && !k3.on, 'kompyuter: Mobil → telefon koʻrinishi (' + k3.grid + ', ' + k3.mw + ')');
  const k4 = await d.evaluate(async () => { const s = document.createElement('style'); s.textContent = '@media (min-width:720px){#main-card-list{outline:3px solid red}}'; document.head.appendChild(s); await new Promise(r => setTimeout(r, 300)); return getComputedStyle(document.getElementById('main-card-list')).outlineStyle; });
  ok(k4 !== 'solid', 'Mobil: keyin qoʻshilgan modul uslubidagi katta ekran qoidasi ham oʻchadi');
  const k5 = await d.evaluate(async () => { wbSet('web'); await new Promise(r => setTimeout(r, 500)); return getComputedStyle(document.getElementById('main-card-list')).display; });
  ok(k5 === 'grid', 'Web ga qaytish — panjara qaytdi');
  const k6 = await d.evaluate(() => { const r = window.agmkBack ? window.agmkBack() : null; return { r: r, act: document.querySelector('.screen.active').id }; });
  ok(k6.act === 'screen-main', 'chap panel «Orqaga» ni egallamaydi');
  const k7 = await d.evaluate(() => ['ПЭ2М', 'ПЭ2У', 'МПЭ2У', 'ЕЛ-1'].every(t => techImgKey('lok', { type: t }) === 'lok-el'));
  ok(k7, 'ПЭ2М, ПЭ2У, МПЭ2У, ЕЛ-1 — elektrovoz rasmi');
  const n1 = await d.evaluate(async () => { openHisob(); HS.yon = HS.yon || 'vag'; hsRender(); await new Promise(r => setTimeout(r, 700)); const vis = Array.from(document.querySelectorAll('#screen-hisob [onclick]')).filter(c => c.offsetParent).map(c => c.getAttribute('onclick')); const o = { nox: vis.some(x => /HS\.akt='noxush'/.test(x)), grp: vis.some(x => /HS\.akt='nosozg'/.test(x)) };
    HS.akt = 'nosozg'; hsRender(); await new Promise(r => setTimeout(r, 300)); const k = Array.from(document.querySelectorAll('.wb-nsz [onclick]')).map(x => x.getAttribute('onclick')); o.k = k.some(x => /noxush/.test(x)) && k.some(x => /cxOpen\('nosoz'\)/.test(x));
    HS.akt = 'noxush'; hsRender(); await new Promise(r => setTimeout(r, 300)); document.querySelector('#screen-hisob .hs-back').click(); await new Promise(r => setTimeout(r, 300)); o.back1 = HS.akt;
    document.querySelector('#screen-hisob .hs-back').click(); await new Promise(r => setTimeout(r, 300)); o.back2 = HS.akt; return o; });
  ok(!n1.nox && n1.grp && n1.k, 'Dalolatnomalar: «Noxush hodisalar» alohida karta emas — «Nosozlik dalolatnomasi» ichida (gʻildirak sinishi + boshqa nosozliklar)');
  ok(n1.back1 === 'nosozg' && n1.back2 === null, '‹ Orqaga: gʻildirak sinishi → Nosozlik dalolatnomasi → roʻyxat');
  const nr = await d.evaluate(() => { const cur = pprCurM(), y = +cur.slice(0, 4); const D = { year: y, secs: [{ place: 'VX', key: 'VX|105|KR', kind: 'list', title: 'K', cells: [] }, { place: 'VX', key: 'VX|105|DR', kind: 'list', title: 'D', cells: [] }], mon: {} };
    for (let k = 0; k < 12; k++) D.mon[y + '-' + String(k + 1).padStart(2, '0')] = { 0: [], 1: [] };
    for (let i = 0; i < 30; i++) D.mon[cur][0].push({ v: String(1000 + i), vid: i, km: 120000 + i * 1000, st: '' }); for (let i = 0; i < 9; i++) D.mon[cur][1].push({ v: String(5000 + i), vid: 100 + i, st: '' });
    const c = vg57Apply(D, []); const L = D.mon[cur][0]; return { n: L.length, top: Math.min(...L.map(x => x.km)), dr: D.mon[cur][1].length, carry: c.length, total: Object.keys(D.mon).filter(m => m >= cur).reduce((s, m) => s + D.mon[m][0].length, 0) + c.length }; });
  ok(nr.n === 4 && nr.top === 146000 && nr.dr === 9 && nr.total === 30, 'Taʼmir grafigi: KR oyiga 4 ta (eng koʻp yurganlari), qolganlari keyingi oylarga koʻchadi, birortasi yoʻqolmaydi — ' + JSON.stringify(nr));
  const ed = await d.evaluate(() => { const cur = pprCurM(), y = +cur.slice(0, 4), nx = pprAddM(cur, 1); const mk = () => { const D = { year: y, secs: [{ place: 'VX', key: 'VX|105|KR', kind: 'list', title: 'K', cells: [] }, { place: 'VX', key: 'VX|105|DR', kind: 'list', title: 'D', cells: [] }], mon: {} };
      for (let k = 0; k < 12; k++) D.mon[y + '-' + String(k + 1).padStart(2, '0')] = { 0: [], 1: [] };
      for (let i = 0; i < 10; i++) D.mon[cur][0].push({ v: String(1000 + i), vid: i, km: 120000 + i * 1000, st: '' }); D.mon[cur][1].push({ v: '7777', vid: 77, km: 50000, st: '' }); return D; };
    const ids = M => (M || []).map(x => x.v);
    vg57Pin('1000', cur, 'KR', 'test'); vg57Del('1009', cur, 'KR'); vg57Pin('7777', nx, 'KR', 'test');
    let D = mk(); vg57Apply(D, []); const o = { cur: ids(D.mon[cur][0]), nx: ids(D.mon[nx][0]), dr: ids(D.mon[cur][1]), rm: D.removed.map(x => x.n) };
    vg57Back('1000'); vg57Back('1009'); vg57Back('7777'); D = mk(); vg57Apply(D, []); o.back = ids(D.mon[cur][0]); return o; });
  ok(ed.cur.length === 4 && ed.cur.includes('1000') && !ed.cur.includes('1009') && ed.rm.includes('1009') && ed.nx.includes('7777') && !ed.dr.includes('7777'), 'Grafik qoʻlda: qoʻshish (📌 normada), olib tashlash, DR→KR boshqa oyga; norma 4 saqlanadi — ' + JSON.stringify(ed));
  ok(ed.back.includes('1009') && !ed.back.includes('1000'), '↩ avtomatik rejaga qaytarish ishlaydi');
  const ss = await d.evaluate(() => { localStorage.setItem(SESSION_KEY, JSON.stringify({ tabel: ADMIN_TABEL })); const o = {};
    localStorage.setItem('agmk_alive', JSON.stringify({ t: ADMIN_TABEL, at: Date.now() - 13 * 3600000 })); showLock(); o.old = ss57Resume();
    localStorage.setItem('agmk_alive', JSON.stringify({ t: ADMIN_TABEL, at: Date.now() })); showLock(); o.ok = ss57Resume() && !document.body.classList.contains('locked');
    o.demo = wbDemoItems().map(x => x.t).join(' | '); return o; });
  ok(!ss.old && ss.ok, 'kutilmagan qayta ochilish: 12 soat ichida sessiya tiklanadi, eskisi — yoʻq');
  ok(!/SVO/.test(ss.demo) && /lokomotiv/.test(ss.demo) && /avtotraktor/.test(ss.demo), 'bosh sahifa ⋮: taqdimot demolari — ' + ss.demo);
  await dc.close();
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
