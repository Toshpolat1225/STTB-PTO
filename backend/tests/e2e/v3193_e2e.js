// 3.19.3: jonli QR skaner (jsQR zaxirasi), server QR havolasi, buzilgan matndan ulanish, maxsus kiyim shtat boʻyicha,
// pasport sarlavhasi, ikonkalar. Server shart emas. Soxta maʼlumotlar.
// Ishga tushirish: node v3193_e2e.js <app.html> [chiqish_papkasi]
const { chromium } = require('playwright');
const HTML = process.argv[2], OUT = process.argv[3] || '/tmp';
let bad = 0; const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 915 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + HTML); await p.waitForTimeout(2500);
  // --- 1) server QR: havola, JSON, buzilgan matn (kirishdan oldin) ---
  const r1 = await p.evaluate(async () => {
    const o = {}, F = 'ab'.repeat(32), K = 'agmk_' + 'x'.repeat(40);
    const J = JSON.stringify({ u: 'https://10.0.0.5:8443', k: K, f: F, n: 'AGMK-STTB' });
    o.json = srvParseQr(J); o.link = srvParseQr('agmk://ulan?h=10.0.0.5%3A8443&k=' + K + '&f=' + F);
    o.linkExt = srvParseQr('agmk://ulan?h=10.0.0.5:8443&k=' + K + '&f=' + F + '&e=' + encodeURIComponent('https://agmk.example.uz:8443'));
    o.broken = srvParseQr('{"u":"\n","k":"' + K + '","f":"' + F + '","n":"AGMK-STTB"}'); o.part = !!(Q3S.part && Q3S.part.k === K);
    o.brokenUrl = srvParseQr('{"u":"","k":"' + K + '",\n"f":"' + F + '"} https://10.0.0.7:8443');
    o.bad = srvParseQr('salom');
    // matn bilan ulash: manzil soʻraladi
    let conn = null; const sc = window.srvConnect; window.srvConnect = q => { conn = q; };
    const ans = ['{"u":"","k":"' + K + '","f":"' + F + '"}', '10.0.0.9']; const up = window.uiPrompt; window.uiPrompt = async () => ans.shift();
    await srvText(); o.textConn = conn; window.uiPrompt = up;
    // havola orqali (kirishdan oldin ham)
    conn = null; agmkDeepLink('agmk://ulan?h=10.0.0.5:8443&k=' + K + '&f=' + F); await new Promise(z => setTimeout(z, 500)); o.dlConn = conn;
    // jsQR: rasmdan oʻqish (BarcodeDetector yoʻq muhitda)
    const L = 'agmk://ulan?h=10.0.0.5:8443&k=' + K + '&f=' + F, q = qrLib()(0, 'L'); q.addData(L); q.make();
    const n = q.getModuleCount(), s = 8, cv = document.createElement('canvas'); cv.width = cv.height = (n + 8) * s; const cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.fillStyle = '#000';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) cx.fillRect((x + 4) * s, (y + 4) * s, s, s);
    const blob = await new Promise(z => cv.toBlob(z, 'image/png'));
    o.hasBD = 'BarcodeDetector' in window; o.det = await qrDetectAll(blob); o.detOk = o.det[0] === L;
    // skaner natijasi: server QR → ulanish
    conn = null; qrScanOpen('srv'); o.scanZ = document.getElementById('qrScan').style.zIndex; o.camShown = !document.getElementById('qrCamBox').classList.contains('hidden');
    o.hit = qrHit(L); await new Promise(z => setTimeout(z, 200)); o.hitConn = conn; o.closed = document.getElementById('qrScan').classList.contains('hidden');
    qrScanOpen('srv'); o.hitTech = qrHit('agmk://q/v/123'); o.srvMsg = document.getElementById('qrScanMsg').textContent; qrScanClose();
    window.srvConnect = sc;
    // kirish oynasi: jonli skaner tugmasi
    try { srvLockOpen(); o.liveBtn = !!document.querySelector('#srvBox .q3-live'); document.getElementById('srvModal').classList.add('hidden'); } catch (e) { o.liveErr = String(e); }
    return o;
  });
  ok(r1.json && r1.json.u === 'https://10.0.0.5:8443', 'JSON QR (eski) qabul qilinadi');
  ok(r1.link && r1.link.u === 'https://10.0.0.5:8443' && r1.link.f === 'ab'.repeat(32), 'agmk://ulan havola QR');
  ok(r1.linkExt && r1.linkExt.e === 'https://agmk.example.uz:8443', 'havolada tashqi manzil (e)');
  ok(!r1.broken && r1.part, 'manzili yoʻqolgan matn: kalit va sertifikat ajratildi');
  ok(r1.brokenUrl && r1.brokenUrl.u === 'https://10.0.0.7:8443', 'buzilgan JSON + matndagi manzil tiklandi');
  ok(r1.bad === null, 'begona matn rad etiladi');
  ok(r1.textConn && r1.textConn.u === 'https://10.0.0.9:8443', '«Matn bilan ulash»: manzil soʻralib ulanadi');
  ok(r1.dlConn && r1.dlConn.u === 'https://10.0.0.5:8443', 'kameradan havola (agmk://ulan) kirishdan oldin ulanadi');
  ok(r1.detOk, 'QR rasmdan oʻqildi (' + (r1.hasBD ? 'BarcodeDetector' : 'jsQR') + ')');
  ok(r1.scanZ === '30000' && r1.camShown, 'skaner oynasi kirish oynasi ustida, kamera maydoni koʻrinadi');
  ok(r1.hit && r1.hitConn && r1.closed, 'skaner: server QR → ulanish, oyna yopiladi');
  ok(!r1.hitTech && /server/.test(r1.srvMsg), 'server rejimida texnika QR i rad etiladi');
  ok(r1.liveBtn, 'Serverga ulanish oynasida «📷 QR kodni skanerlash (kamera)»');

  // --- 2) kirgandan keyin: maxsus kiyim shtat boʻyicha, pasport sarlavhasi, ikonkalar ---
  const r2 = await p.evaluate(async () => {
    try { hideLock(); } catch (e) {} document.body.classList.remove('locked');
    currentUser = currentUser || {}; currentUser.name = 'Sinov'; currentUser.tabel = ADMIN_TABEL; currentUser.role = 'admin';
    window.isAdmin = () => true; try { menuArrange(); } catch (e) {}
    const o = {};
    kxOpen(); await new Promise(z => setTimeout(z, 200));
    o.scr = (document.querySelector('.screen.active') || {}).id; o.title = document.getElementById('xtTitle').innerText;
    o.top = !!document.querySelector('#xtList .kx-top'); o.units = document.querySelectorAll('#xtList .xt-unit').length; o.rs = !!document.querySelector('#xtList .rs-card');
    // birinchi boʻlinma → lavozim → xodim
    const u = shtatTree.units[0]; xtGo(u.id); await new Promise(z => setTimeout(z, 100));
    o.inUnit = document.getElementById('xtTitle').innerText;
    const withX = shtatTree.pos.find(x => xodimsAt(x.no).length);
    if (withX) { xtGo(withX.u, withX.g || null, withX.no); await new Promise(z => setTimeout(z, 100));
      const btn = document.querySelector('#xtList button.details-btn'); o.btnTxt = btn && btn.textContent; o.btnOn = btn && btn.getAttribute('onclick');
      let kp = null; const _k = window.kxPerson; window.kxPerson = t => { kp = t; }; btn && btn.click(); window.kxPerson = _k; o.kp = kp; }
    // qidiruv
    document.getElementById('xtSearch').value = 'a'; xtRender(); o.searchBtn = (document.querySelector('#xtList button.details-btn') || {}).textContent;
    document.getElementById('xtSearch').value = '';
    XT.u = null; XT.g = null; XT.pos = null; XT.w = false; xtRender(); xtBack(); await new Promise(z => setTimeout(z, 100));
    o.back = (document.querySelector('.screen.active') || {}).id; o.kiyOff = !XT.kiy;
    // oddiy «Ishchi xodimlar» — pasport tugmasi oʻzgarmagan
    openXodimTree(); await new Promise(z => setTimeout(z, 100)); o.normalKiy = !!XT.kiy;
    // pasport sarlavhasi
    const v = vagonlarData.find(x => !x.kind); openPassport(v.id); await new Promise(z => setTimeout(z, 300));
    const bb = document.getElementById('pasportBackBtn').getBoundingClientRect(), tt = getComputedStyle(document.getElementById('pasport-header-title'));
    o.backW = Math.round(bb.width); o.backH = Math.round(bb.height); o.ttBg = tt.backgroundColor; o.backTxt = document.getElementById('pasportBackBtn').innerText;
    // ikonkalar
    o.mm = (MK_IMG.mm || '').length; o.icXod = (document.querySelector('[data-sec="grp-xod"] .btn-icon') || {}).dataset; o.icXod = o.icXod && o.icXod.mk;
    return o;
  });
  ok(r2.scr === 'screen-xt' && /🧥/.test(r2.title) && r2.top && r2.units > 0 && !r2.rs, 'MTTB → Maxsus kiyim: shtat boʻlinmalari (' + r2.units + '), yuqorida ombor tugmalari');
  ok(/🧥/.test(r2.inUnit), 'boʻlinma ichida ham maxsus kiyim rejimi');
  ok(!r2.btnTxt || (/Maxsus kiyim/.test(r2.btnTxt) && /^q3Kiy\(/.test(r2.btnOn) && r2.kp), 'xodim → maxsus kiyim kartasi (pasport emas)');
  ok(!r2.searchBtn || /Maxsus kiyim/.test(r2.searchBtn), 'qidiruv natijasida ham maxsus kiyim');
  ok(r2.kiyOff && r2.back !== 'screen-xt', 'orqaga — MTTB ga, rejim oʻchadi');
  ok(!r2.normalKiy, 'oddiy «Ishchi xodimlar» oʻzgarmagan');
  ok(r2.backW <= 46 && r2.backH <= 46 && r2.backW >= 40, 'pasport: orqaga — kichik dumaloq tugma (' + r2.backW + 'x' + r2.backH + ')');
  ok(/rgba/.test(r2.ttBg), 'pasport: raqam yarim shaffof karta ustida');
  ok(r2.mm > 1000 && r2.icXod === 'xodg', 'ikonkalar: Mehnat muhofazasi, Ishchi xodimlar guruhi');
  await p.screenshot({ path: OUT + '/v3193_pasport.png' });
  await p.evaluate(() => { kxOpen(); }); await p.waitForTimeout(300); await p.screenshot({ path: OUT + '/v3193_kiyim.png' });
  await p.evaluate(() => { openScreen('screen-main'); try { menuArrange(); } catch (e) {} }); await p.waitForTimeout(600); await p.screenshot({ path: OUT + '/v3193_main.png' });
  await p.evaluate(() => { menuGrpOpen('xod'); }); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v3193_xod.png' });
  await p.evaluate(() => { menuGrpOpen('mttb'); }); await p.waitForTimeout(400); await p.screenshot({ path: OUT + '/v3193_mttb.png' });
  ok(!errs.length, 'sahifa xatolari yoʻq' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(bad ? `\n❌ ${bad} ta xato` : '\nALL OK'); process.exit(bad ? 1 : 0);
})();
