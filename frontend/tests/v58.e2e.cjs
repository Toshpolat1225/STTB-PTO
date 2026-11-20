// 5.8: chap panel (faqat Profil), Bildirgi kartochkasi, imzo oʻlchami, taʼmir grafigi imzo chekuvchilari, TB / kiyim demolari,
// Word (.rtf) oʻqish, 12 soatlik sessiya. Faqat SOXTA maʼlumot:  node frontend/tests/v58.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
const login = () => { currentUser = { tabel: ADMIN_TABEL, name: 'Soxta Test', role: 'admin' }; document.body.classList.remove('locked'); modRefresh(); };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500); await p.evaluate(login); await p.waitForTimeout(400);
  ok(await p.evaluate(() => parseFloat(AGMK_VERSION) >= 5.8 && AGMK_BUILD >= 133), 'versiya 5.8 yoki yangiroq');
  ok(await p.evaluate(() => SS57_MIN === 720), 'sessiya: 12 soat ichida qayta kirish soʻralmaydi');
  const d = await p.evaluate(async () => { h9DrawerOpen(); await new Promise(r => setTimeout(r, 300)); const D = document.getElementById('h9Drw'); if (!D) return null;
    return { um: Array.from(D.querySelectorAll('.h9-ds')).some(x => /umumiy/i.test(x.textContent)), f: Array.from(D.querySelectorAll('.h9-di[data-f]')).map(x => x.dataset.f) }; });
  ok(d && !d.um && d.f.length === 1 && d.f[0] === 'prof', 'chap panel: «Umumiy» yoʻq, faqat Profil — ' + JSON.stringify(d));
  const s = await p.evaluate(() => [sigSize(2.5, 10), sigSize(6, 10), sigSize(1, 10)]);
  ok(Math.abs(s[0].h - 24) < 0.01 && s[1].w <= 120 + 1e-6 && s[2].h <= 24 * 1.4 + 1e-6 && s[1].h >= 24 * 0.75 - 1e-6, 'imzo oʻlchami bir xil oraliqda — ' + JSON.stringify(s));
  const g = await p.evaluate(() => { const H0 = [['«KELISHILDI»', 'Soxta lav', '_______ Soxta A'], ['', '', ''], ['«TASDIQLAYMAN»', 'Soxta rahbar', '_______ Soxta B']], F0 = [['Tuzdi', 'Soxta C']];
    const a = JSON.stringify(pprSigHeads('VX', H0)) === JSON.stringify(H0) && JSON.stringify(pprSigFoot('VX', F0)) === JSON.stringify(F0);
    kvSet('agmk_ppr_sig', { VX: { ag: [{ l: 'L1', n: 'Namunaviy N.' }, { l: 'L2', n: 'Soxtaev S.' }], ap: { l: 'Bosh', n: 'Testov T.' }, bt: [{ l: 'Muhandis', n: 'Sinovov S.' }] } });
    const h = pprSigHeads('VX', H0), f = pprSigFoot('VX', F0); kvSet('agmk_ppr_sig', {});
    return a && h.length === 3 && /Namunaviy/.test(h[0][2]) && /Soxtaev/.test(h[1][2]) && /TASDIQLAYMAN/.test(h[2][0]) && /Testov/.test(h[2][2]) && f.length === 1 && f[0][1] === 'Sinovov S.'; });
  ok(g, 'taʼmir grafigi: tanlangan imzo chekuvchilar PDF ga tushadi, boʻsh boʻlsa — namunadagi');
  const dm = await p.evaluate(() => wbDemoItems().map(x => x.t).join(' | '));
  ok(/Mehnat muhofazasi/.test(dm) && /Maxsus kiyim/.test(dm), 'demo roʻyxati: TB va maxsus kiyim — ' + dm);
  const kd = await p.evaluate(async () => { dm58KiyOn(); await new Promise(r => setTimeout(r, 800)); const r = await sbFetch('/api/kiy/v1/due', { method: 'GET' }); dm58KiyOff(); return r; });
  ok(kd && JSON.stringify(kd).length > 50, 'kiyim demo: soxta muddatlar qaytadi');
  const rt = await p.evaluate(() => { const t = '{\\rtf1\\ansi\\ansicpg1251{\\fonttbl{\\f0 Arial;}}\\pard Sinov hujjati\\par\\trowd\\cellx1000\\cellx2000\\intbl Soxtaev S.\\cell 12,5\\cell\\row\\pard Tamom \\u1058?\\u1077?\\u1089?\\u1090?\\par}';
    return w58Rtf(new TextEncoder().encode(t).buffer); });
  ok(JSON.stringify(rt) === JSON.stringify([['Sinov hujjati'], ['Soxtaev S.', 12.5], ['Tamom Тест']]), 'Word (.rtf): paragraf, jadval, raqam, unicode — ' + JSON.stringify(rt));
  const ink = await p.evaluate(async () => { const c = document.createElement('canvas'); c.width = 800; c.height = 400; const g = c.getContext('2d'); g.fillStyle = '#f5f5f5'; g.fillRect(0, 0, 800, 400); g.strokeStyle = '#1d4ed8'; g.lineWidth = 3; g.beginPath(); g.moveTo(380, 180); g.lineTo(440, 230); g.stroke();
    const u = await sigInk(c.toDataURL('image/png')); const im = new Image(); await new Promise(r => { im.onload = r; im.src = u; }); const k = document.createElement('canvas'); k.width = im.width; k.height = im.height; const kg = k.getContext('2d'); kg.drawImage(im, 0, 0); return { w: im.width, h: im.height, a: kg.getImageData(0, 0, 1, 1).data[3] }; });
  ok(ink.w < 80 && ink.h < 70 && ink.a === 0, 'imzo: oq / kulrang fonli rasmda ham faqat siyoh qoladi, fon shaffof — ' + JSON.stringify(ink));
  // 6.2: SVO davomat yakuniy koddan olib tashlandi
  ok(!errs.length, 'Sahifa xatolari yoʻq ' + errs.join(' ; '));
  console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); await b.close(); process.exit(F ? 1 : 0);
})();
