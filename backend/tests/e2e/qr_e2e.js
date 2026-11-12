// 3.19.0: vagonga QR yorliq va QR skaner. Server shart emas.
// Ishga tushirish: node qr_e2e.js <app.html> [chiqish_papkasi]
// PDF yorliqlar chiqish papkasiga yoziladi — ularni qr_decode.py haqiqiy QR oʻquvchi bilan tekshiradi.
const { chromium } = require('playwright');
const fs = require('fs');
const HTML = process.argv[2], OUT = process.argv[3] || '/tmp';
let bad = 0; const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 1000 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + HTML); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    try { hideLock(); } catch (e) {} document.body.classList.remove('locked');
    const o = {};
    // sinov vagonlari (soxta raqamlar)
    const base = Date.now();
    const mk = (i, num, inv, type) => ({ id: base + i, num: num, inv: inv, type: type, model: '', seh: 'VX', tamirSanasi: '2026-03-10', keyingi: '2027-03-10', history: [], sortOrder: 9000 + i });
    vagonlarData.push(mk(1, '99001', '7701', 'Dumpkar 105'), mk(2, '99002', '7702', 'Dumpkar 60'), mk(3, '99001', '7799', 'Platforma'));
    o.txt = qrText(vagonlarData.find(v => v.id === base + 1));
    o.parse = qrParse(o.txt); o.parseBad = qrParse('https://example.com'); o.parseNum = qrParse('99002');
    o.find1 = (qrFind({ no: '99001', inv: '7799' }) || {}).id === base + 3; o.find2 = (qrFind({ no: '099002', inv: '' }) || {}).id === base + 2;
    o.findInv = (qrFind({ no: '12345678', inv: '7702' }) || {}).id === base + 2; o.findNo = qrFind({ no: '88888888', inv: '' }) === null;
    const M = qrMatrix(o.txt); o.n = M.length; o.svg = /<path d="M/.test(qrSvg(o.txt, 100));
    // pasport → «🏷 QR» tugmasi → yorliq
    openPassport(base + 1); await new Promise(z => setTimeout(z, 300));
    o.passBtn = !!document.getElementById('qrPassB');
    qrPassOpen(); o.oneModal = !!document.querySelector('#qrOne .qr-box svg');
    const f1 = qrPdf([vagonlarData.find(v => v.id === base + 1)], true, 'QR yorliq vagon 99001');
    const L = qrVagons().slice(0, 9); const f2 = qrPdf(L, false, 'QR yorliqlar');
    const b64 = async bl => { const u = new Uint8Array(await bl.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); };
    o.pdf1 = await b64(f1.blob); o.pdf2 = await b64(f2.blob); o.pdf2n = L.length; o.pdf2txt = L.map(v => qrText(v));
    o.exs = !!(window.EXS && EXS.get(f1.blob) && EXS.get(f1.blob).lay);
    // yagona oyna orqali
    mdlClose('qrOne'); qrPassPdf(false); await new Promise(z => setTimeout(z, 200)); o.exSheet = !!document.querySelector('#exSheet:not(.hidden)'); mdlClose('exSheet');
    // roʻyxat: raqamlar boʻyicha (diapazon bilan)
    o.nums = qrNums('99001, 99002 1-3'); QRV.sel = 'nums'; qrListOpen(); document.getElementById('qrNums').value = '99002 77777777';
    let got = null; const _o = exOpen; window.exOpen = (files, opt) => { got = { n: files.length, title: opt.title }; }; qrListGo(); window.exOpen = _o; o.listGo = got;
    // skaner: tanilgan / begona / topilmagan
    qrScanOpen(); o.scanModal = !!document.getElementById('qrScan'); o.camHidden = !!document.getElementById('qrScanMsg') && !!document.getElementById('qrFile'); /* 3.19.3: kamera har doim sinab koʻriladi (jsQR zaxira) */
    o.hitBad = qrHit('salom'); o.msgBad = document.getElementById('qrScanMsg').textContent;
    o.hitMiss = qrHit('AGMK-STTB VAGON 88888888'); o.msgMiss = document.getElementById('qrScanMsg').textContent;
    o.hitOk = qrHit('AGMK-STTB VAGON 99002 INV 7702'); await new Promise(z => setTimeout(z, 300));
    o.opened = activeVagonId === base + 2 && document.getElementById('screen-vagon-pasport').classList.contains('active');
    o.scanClosed = document.getElementById('qrScan').classList.contains('hidden');
    o.listBtns = document.querySelectorAll('#screen-vagonlar .qr-lb').length;
    // ilova (APK) rejimi: jonli kamera yoʻq → «📷 Rasmga olish» → rasm → QR oʻquvchi → pasport
    window.AgmkNative = window.AgmkNative || {}; const _BD = window.BarcodeDetector;
    window.BarcodeDetector = class { constructor() {} async detect() { return [{ rawValue: 'AGMK-STTB VAGON 99001 INV 7799' }]; } };
    qrScanOpen(); o.apkShot = /Rasmga olish/.test((document.querySelector('#qrScan .qr-act') || {}).textContent || ''); /* 3.19.3: APK da ham jonli kamera, «📷 Rasmga olish» — zaxira */
    const c = document.createElement('canvas'); c.width = c.height = 50; const blob = await new Promise(z => c.toBlob(z, 'image/png'));
    await qrFileGo({ files: [new File([blob], 'qr.png', { type: 'image/png' })] }); await new Promise(z => setTimeout(z, 300));
    o.apkOpened = activeVagonId === base + 3;
    window.BarcodeDetector = _BD; if (!_BD) delete window.BarcodeDetector;
    return o;
  });
  fs.writeFileSync(OUT + '/qr_bitta.pdf', Buffer.from(r.pdf1, 'base64')); fs.writeFileSync(OUT + '/qr_varaq.pdf', Buffer.from(r.pdf2, 'base64'));
  fs.writeFileSync(OUT + '/qr_kutilgan.json', JSON.stringify({ bitta: [r.txt], varaq: r.pdf2txt }));
  ok(r.txt === 'agmk://q/v/99001?inv=7701', 'QR matni (ilova havolasi, K-28): ' + r.txt);
  ok(r.parse && r.parse.no === '99001' && r.parse.inv === '7701' && r.parseBad === null && r.parseNum && r.parseNum.no === '99002', 'QR matnini oʻqish (begona QR rad etiladi, qoʻlda raqam qabul qilinadi)');
  ok(r.find1 && r.find2 && r.findInv && r.findNo, 'vagonni topish: bir xil raqam → inventar boʻyicha, nol bilan, raqami oʻzgargan → inventar, yoʻq → null');
  ok(r.n >= 21 && r.svg, 'QR matritsa ' + r.n + '×' + r.n + ' va SVG');
  ok(r.passBtn && r.oneModal, 'pasportda «🏷 QR» tugmasi va yorliq oynasi');
  ok(r.exs && r.exSheet, 'yorliq PDF — yagona oyna (yuklab olish · chop etish · yuborish, JPG ga oʻtkaziladi)');
  ok(JSON.stringify(r.nums) === JSON.stringify(['99001', '99002', '1', '2', '3']), 'raqamlar roʻyxati va diapazon');
  ok(r.listGo && r.listGo.n === 1 && /1 ta vagon/.test(r.listGo.title), 'roʻyxat: topilganlar uchun yorliq, topilmagani ogohlantiriladi');
  ok(r.scanModal && r.camHidden, 'skaner oynasi (jonli kamera, rasm va qoʻlda kiritish)');
  ok(!r.hitBad && /emas/.test(r.msgBad) && !r.hitMiss && /topilmadi/.test(r.msgMiss), 'begona va bazada yoʻq QR — xabar, pasport ochilmaydi');
  ok(r.hitOk && r.opened && r.scanClosed, 'QR → vagon pasporti ochildi, skaner yopildi');
  ok(r.listBtns === 2, 'Vagonlar ekranida «📷 QR skaner» va «🏷 QR yorliqlar»');
  ok(r.apkShot && r.apkOpened, 'ilova (APK): jonli kamera + zaxira «📷 Rasmga olish» → rasmdagi QR → pasport (bir xil raqamli vagonlar — inventar boʻyicha)');
  // 3.19.2 (K-27, K-33, K-28, K-32): yuqorida QR belgisi; «Mening ishchilarim» Ishchi xodimlar → Struktura tagida;
  // barcha texnika uchun QR havola va havola orqali pasport ochilishi
  const home = await p.evaluate(async () => {
    const W = window; currentUser.tabel = currentUser.tabel || '9001'; W.isAdmin = () => true; W.dispatchEvent(new CustomEvent('agmk:login'));
    await new Promise(r => setTimeout(r, 1800)); try { W.openScreen('screen-main'); } catch (e) { } try { W.myCards(); } catch (e) { }
    await new Promise(r => setTimeout(r, 300));
    const vis = id => { const e = document.getElementById(id); return !!(e && e.offsetParent !== null); };
    const btn = document.getElementById('qrTopBtn'); if (btn) btn.click(); await new Promise(r => setTimeout(r, 400));
    const m = !!document.getElementById('qrScan'); try { W.qrScanClose(); } catch (e) { }
    W.menuGrpOpen('xod'); await new Promise(r => setTimeout(r, 400));
    const grp = Array.from(document.querySelectorAll('#screen-grp .card-list .btn-card')).map(c => c.getAttribute('data-mn'));
    const U = (typeof vagonlarData !== 'undefined' ? vagonlarData : []), kinds = ['lok', 'avto', 'yol'].map(k => U.find(v => v.kind === k)).filter(Boolean);
    const round = kinds.length >= 3 && kinds.every(v => W.qrFind(W.qrParse(W.qrText(v))) === v) && /^agmk:\/\/q\/[lt]\//.test(W.qrText(kinds[0]));
    W.openScreen('screen-main'); const L = kinds[0]; if (L) W.agmkDeepLink(W.qrText(L)); await new Promise(r => setTimeout(r, 400));
    return { btn: !!btn, svg: !!(btn && btn.querySelector('svg')), m, onHome: ['myCard', 'kiyCard', 'v9ScanCard', 'qrMainCard'].some(vis), grp, round, n: kinds.length, dl: !!L && activeVagonId === L.id && document.querySelector('.screen.active').id === 'screen-vagon-pasport' };
  });
  ok(home.btn && home.svg && home.m && !home.onHome, 'bosh sahifa: yuqorida QR belgisi → skaner; bosh roʻyxatda ortiqcha karta yoʻq (K-27)');
  ok(home.grp.indexOf('2.3') > home.grp.indexOf('2.2') && home.grp.indexOf('2.2') >= 0, '«Mening ishchilarim» — Ishchi xodimlar → Struktura tagida (K-33): ' + home.grp.join(','));
  ok(home.round && home.dl, 'QR barcha texnikaga (lokomotiv, avto, yoʻl) va havola orqali pasport ochiladi (K-28, K-32)');
  ok(!errs.length, 'sahifa xatolarisiz' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(bad ? `❌ ${bad} ta xato` : '✅ ALL OK'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
