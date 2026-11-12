// 6.1 (138): 🔒 Yopiq kontur — tashqi xizmatlar yoʻq, tarmoq qoʻriqchisi, xarita fonlari, CSP. Faqat SOXTA maʼlumot.
//   node frontend/tests/v61yk.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
const fs = require('fs');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const html = fs.readFileSync(process.argv[2], 'utf8');
  ok(!/api\.anthropic\.com|generativelanguage\.googleapis|cognitiveservices|overpass-api|project-osrm|arcgisonline|tile\.openstreetmap|unpkg\.com|jsdelivr/i.test(html), 'yigʻilgan faylda tashqi xizmat manzillari yoʻq');
  ok(/http-equiv="Content-Security-Policy"[^>]*object-src 'none'/.test(html), 'CSP qoʻyilgan');
  const b = await chromium.launch(), errs = [], reqs = [];
  const ctx = await b.newContext(); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => { reqs.push(r.request().url()); r.abort(); }); // tashqariga chiqqan soʻrov boʻlsa — ushlaymiz
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked');
    localStorage.removeItem('agmk_net_block');
    const o = {};
    try { await fetch('https://example.com/x?secret=1'); o.f = 'otdi'; } catch (e) { o.f = String(e.message); }
    try { const x = new XMLHttpRequest(); x.open('GET', 'https://example.org/'); o.x = 'otdi'; } catch (e) { o.x = String(e.message); }
    try { new WebSocket('wss://example.net/s'); o.w = 'otdi'; } catch (e) { o.w = String(e.message); }
    o.beacon = navigator.sendBeacon('https://example.com/b', 'x');
    const im = new Image(); im.src = 'https://example.com/t.png'; o.img = im.src.slice(0, 14);
    const im2 = document.createElement('img'); im2.setAttribute('src', 'https://example.com/u.png'); o.img2 = im2.getAttribute('src').slice(0, 14);
    o.win = window.open('https://example.com') === null;
    o.lan = yk61Ok('https://192.168.1.20:8443/api') && yk61Ok('http://10.0.0.5/') && yk61Ok('https://sttb-server.local/') && yk61Ok('http://172.20.1.1/') && yk61Ok('tel:+998901234567') && yk61Ok('data:image/png;base64,AA');
    o.pub = !yk61Ok('https://8.8.8.8/') && !yk61Ok('http://172.32.0.1/') && !yk61Ok('https://google.com/');
    try { await fetch('http://127.0.0.1:1/health'); o.loc = 'otdi'; } catch (e) { o.loc = /Yopiq kontur/.test(e.message) ? 'bloklandi' : 'tarmoq'; }
    o.rep = agmkNetReport();
    o.ai = aiCloudReady() === false && aicGet().key === '' && aicGet().on === false;
    try { agmkNoNet('Tashqi AI'); } catch (e) { o.nonet = e.message; }
    const sc = document.getElementById('set-ai-sub'); const card = sc && sc.closest('.btn-card'); o.aiHidden = !card || card.style.display === 'none';
    // xarita foni
    const L0 = window.L; o.hasL = !!(L0 && L0.TileLayer);
    if (o.hasL) { const dv = document.createElement('div'); dv.style.cssText = 'width:200px;height:200px;position:fixed;left:-500px'; document.body.appendChild(dv); const mp = L0.map(dv).setView([40.8, 69.6], 3); const t = L0.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(mp); o.tile = t.getTileUrl({ x: 1, y: 2, z: 3 }).slice(0, 14);
      localStorage.setItem('agmk_tiles_on', '1'); const sv = window.syncCfg; window.syncCfg = () => ({ url: 'https://192.168.1.20:8443' }); o.tileSrv = t.getTileUrl({ x: 1, y: 2, z: 3 }); window.syncCfg = sv; localStorage.removeItem('agmk_tiles_on');
      const t2 = L0.tileLayer('https://example.com/{z}/{x}/{y}.png').addTo(mp); o.tileExt = t2.getTileUrl({ x: 1, y: 2, z: 3 }).slice(0, 14); }
    return o;
  });
  await p.waitForTimeout(800);
  ok(/Yopiq kontur/.test(r.f) && /Yopiq kontur/.test(r.x) && /Yopiq kontur/.test(r.w) && r.beacon === false, 'fetch, XMLHttpRequest, WebSocket, sendBeacon — tashqi manzil bloklandi');
  ok(r.img === 'data:image/gif' && r.img2 === 'data:image/gif' && r.win, 'rasm manzili va window.open — tashqi sayt bloklandi');
  ok(r.lan && r.pub, 'ichki tarmoq (192.168.*, 10.*, 172.16–31.*, *.local), tel:, data: — ruxsat; ommaviy internet — yoʻq');
  ok(r.loc === 'tarmoq', 'korxona serveri (127.0.0.1) bloklanmaydi');
  ok(r.rep && r.rep.n >= 6 && r.rep.hosts && r.rep.hosts['example.com'] >= 1 && !JSON.stringify(r.rep).includes('secret'), 'bloklanganlar hisobi (faqat host, maʼlumot yoʻq): ' + JSON.stringify(r.rep.hosts));
  ok(r.ai && /Yopiq kontur: Tashqi AI/.test(r.nonet || '') && r.aiHidden, 'bulut AI hech qachon yoqilmaydi, sozlamasi yashirilgan');
  ok(r.hasL && r.tile === 'data:image/gif' && /^https:\/\/192\.168\.1\.20:8443\/tiles\/esri\/World_Imagery\/MapServer\/tile\/3\/2\/1/.test(r.tileSrv || '') && r.tileExt === 'data:image/gif', 'xarita foni: internetdan emas — server /tiles yoki boʻsh ' + (r.tileSrv || ''));
  ok(reqs.length === 0, 'sahifa ochilganda internetga birorta ham soʻrov ketmadi ' + reqs.slice(0, 5).join(' '));
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
