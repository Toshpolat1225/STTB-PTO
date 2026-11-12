// 3.19.4: bosh sahifa qidiruvi (boʻlimlar, holat, sinonim, qisqa soʻz), «Sex va boʻlinma ishchilari» (tabel ustuni, nom), rasmlar.
// Server shart emas; «Sex va boʻlinma ishchilari» maʼlumoti soxta (MY.d). Ishga tushirish: node v3194_e2e.js <app.html> [chiqish_papkasi]
const { chromium } = require('playwright');
const HTML = process.argv[2], OUT = process.argv[3] || '/tmp';
let bad = 0; const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + HTML); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    try { hideLock(); } catch (e) {} document.body.classList.remove('locked');
    currentUser = currentUser || {}; currentUser.name = 'Sinov'; currentUser.tabel = ADMIN_TABEL; currentUser.role = 'admin'; window.isAdmin = () => true;
    try { menuArrange(); } catch (e) {}
    const o = {}, G = q => gsRun(q), n = (R, k) => (R[k] || []).length;
    // shaxsiy maʼlumotsiz yigʻilgan ilovada (GitHub Actions) xodim/vagon roʻyxati boʻsh boʻlishi mumkin — u holda bu tekshiruv oʻtkazib yuboriladi
    const XS = allXodims(), v = vagonlarData.find(x => !x.kind), x = XS.length ? XS[Math.min(100, XS.length - 1)].item : null; o.skip = !v || !x;
    if (v) o.num = G(String(vagonNo(v))).t[0].id === v.id; if (x) { o.tab = G(x.tabel).x[0].id === x.id; o.name = G(x.name.split(' ')[0]).x.some(r => r.id === x.id); }
    const S = q => (G(q).s || []).map(r => r.n);
    o.kiy = S('maxsus kiyim'); o.pol = S('polojeniya'); o.gr = S('grafik'); o.mm = S('mehnat muhofazasi'); o.qr = S('qr'); o.vag = S('vagonlar');
    const H = G('muddati oʻtgan vagonlar').h; o.h1 = H && H[0] && H[0].n; o.h1st = H && H[0] && H[0].st;
    const H2 = G('taʼmirdagi teplovozlar').h; o.h2 = H2 && H2[0] && H2[0].n;
    o.akt = n(G('akt'), 'x'); o.qrx = n(G('qr'), 'x');
    o.synOk = typeof Q4_SYN === 'object' && gsScore(gsFold('Elektrogazosvarshik 4-razryad'), ['payvandchi']) > 0;
    // holat natijasini bosish → vagonlar roʻyxati shu filtr bilan
    document.getElementById('globalSearchInput').value = 'muddati oʻtgan vagonlar'; filterMainMenu(); await new Promise(z => setTimeout(z, 100));
    o.hBox = !!document.querySelector('#gsRes .gs-g'); o.firstGrp = (document.querySelector('#gsRes .gs-h') || {}).textContent || '';
    gsGo('h', 0); await new Promise(z => setTimeout(z, 300)); o.hScr = (document.querySelector('.screen.active') || {}).id; o.hFlt = activeStatusFilter;
    // boʻlim natijasi → ochiladi
    openScreen('screen-main'); document.getElementById('globalSearchInput').value = 'maxsus kiyim'; filterMainMenu(); const si = GS.R.s.findIndex(r => /Maxsus kiyim/.test(r.n));
    gsGo('s', si); await new Promise(z => setTimeout(z, 300)); o.sScr = (document.querySelector('.screen.active') || {}).id; o.sKiy = !!XT.kiy;
    openScreen('screen-main');
    // Sex va boʻlinma ishchilari: soxta roʻyxat
    MY.d = { me: { name: 'Sinov Rahbar', lav: 'Usta' }, n: 3, can: {}, rels: [], list: [
      { tabel: '1204', name: 'Soxtaov Uzunismli Familiyali Otasining ismi oʻgʻli', lav: 'Operator', grpN: 'Uchastka 1', unitN: 'Sex A', rank: 1 },
      { tabel: '2247', name: 'Qisqa Ism', lav: 'Operator', grpN: 'Uchastka 1', unitN: 'Sex A', rank: 1 },
      { tabel: '55', name: 'Ikkinchi Soxta', lav: 'Usta', grpN: 'Uchastka 1', unitN: 'Sex A', rank: 0 }] };
    secScreen('screen-my', 'x'); openScreen('screen-my'); MY.view = 'list'; myRender();
    o.myTitle = (document.querySelector('#screen-my .inner-header h2, #screen-my h2') || {}).textContent || '';
    const rows = [...document.querySelectorAll('#screen-my .my-row')]; o.rowTb = rows.map(r => { const t = r.querySelector('.q4-tb'); return t ? Math.round(t.getBoundingClientRect().left) + ':' + Math.round(t.getBoundingClientRect().width) : 'x'; });
    MY.view = 'st'; myRender(); await new Promise(z => setTimeout(z, 50));
    const tp = [...document.querySelectorAll('#screen-my .my-tp')]; o.tp = tp.map(e => { const s = e.querySelector('small'), b = e.querySelector('b'); return Math.round(s.getBoundingClientRect().left) + '<' + Math.round(b.getBoundingClientRect().left); });
    // karta nomi
    try { myCards(); } catch (e) {} await new Promise(z => setTimeout(z, 500));
    const mc = document.getElementById('myCard'); o.card = mc ? mc.querySelector('.btn-text').textContent : '(karta yoʻq — rahbar emas)';
    o.icX = (MK_IMG.xodg || '').length; o.icM = (MK_IMG.myw || '').length;
    return o;
  });
  ok(r.skip || (r.num && r.tab && r.name), 'eski qidiruv: raqam, tabel, familiya' + (r.skip ? ' (maʼlumot yoʻq — oʻtkazildi)' : ''));
  ok(r.kiy.some(t => /Maxsus kiyim/.test(t)), '«maxsus kiyim» → boʻlim: ' + r.kiy.slice(0, 2).join(', '));
  ok(r.pol.length > 0, '«polojeniya» → ' + r.pol.slice(0, 2).join(', '));
  ok(r.gr.length > 0, '«grafik» → ' + r.gr.slice(0, 2).join(', '));
  ok(r.mm.some(t => /Mehnat muhofazasi/.test(t)), '«mehnat muhofazasi» → boʻlim');
  ok(r.qr.some(t => /QR/.test(t)), '«qr» → QR skaner');
  ok(r.vag.some(t => /Vagonlar/.test(t)), '«vagonlar» → Vagonlar parki');
  ok(/Vagonlar — 🟠/.test(r.h1 || '') && r.h1st === "Ta'mir talab", '«muddati oʻtgan vagonlar» → ' + r.h1);
  ok(/Lokomotivlar — 🔵/.test(r.h2 || ''), '«taʼmirdagi teplovozlar» → ' + r.h2);
  ok(r.akt === 0 && r.qrx === 0, 'qisqa soʻz tasodifiy xodim natijasi bermaydi (akt: ' + r.akt + ', qr: ' + r.qrx + ')');
  ok(r.synOk, 'sinonim: «payvandchi» → elektrogazosvarshik');
  ok(r.hBox && /Holat/.test(r.firstGrp), 'holat natijasi birinchi guruhda');
  ok(r.hScr === 'screen-vagonlar' && r.hFlt === "Ta'mir talab", 'holat natijasi → vagonlar roʻyxati shu filtr bilan');
  ok(r.sScr === 'screen-xt' && r.sKiy, 'boʻlim natijasi → Maxsus kiyim ochildi');
  ok(/Sex va boʻlinma ishchilari/.test(r.myTitle), 'sahifa sarlavhasi: ' + r.myTitle);
  ok(r.rowTb.length === 3 && new Set(r.rowTb).size === 1, 'roʻyxat: tabel ustuni bir xil joyda (' + r.rowTb.join(' ') + ')');
  ok(r.tp.length === 3 && r.tp.every(t => { const [a, c] = t.split('<').map(Number); return a < c; }) && new Set(r.tp).size === 1, 'tuzilma: tabel chapda, ism oʻngda, bir tekis (' + r.tp.join(' ') + ')');
  ok(!/Mening/.test(r.card), 'karta nomi: ' + r.card);
  ok(r.icX > 5000 && r.icM > 5000, 'rasmlar: Ishchi xodimlar, Sex va boʻlinma ishchilari');
  await p.screenshot({ path: OUT + '/v3194_my.png' });
  await p.evaluate(() => { MY.view = 'list'; myRender(); }); await p.screenshot({ path: OUT + '/v3194_mylist.png' });
  await p.evaluate(() => { openScreen('screen-main'); const i = document.getElementById('globalSearchInput'); i.value = 'muddati oʻtgan vagonlar'; filterMainMenu(); }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/v3194_search.png' });
  await p.evaluate(() => { const i = document.getElementById('globalSearchInput'); i.value = ''; filterMainMenu(); menuGrpOpen('xod'); }); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v3194_xod.png' });
  await p.evaluate(() => { openScreen('screen-main'); }); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v3194_main.png' });
  ok(!errs.length, 'sahifa xatolari yoʻq' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(bad ? `\n❌ ${bad} ta xato` : '\nALL OK'); process.exit(bad ? 1 : 0);
})();
