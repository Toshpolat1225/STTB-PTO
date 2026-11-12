// 3.18.1: skaner — rasm/chizma/muhr joyida (K-24) va qoʻlda imzolanganlar (K-25). Server shart emas:
// hujjat rasmi brauzerda chiziladi, OCR natijasi chizilgan matn joylashuvidan tuziladi (soxta ismlar).
// Ishga tushirish: node scan_e2e.js <app.html>
const { chromium } = require('playwright');
const HTML = process.argv[2];
let bad = 0; const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 1200 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + HTML); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    const W = 1654, H = 2339, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#000'; g.font = '34px serif'; g.textBaseline = 'top';
    const lines = []; let bn = 0;
    const put = (x, y, t, x2, t2) => { const ws = []; const seg = (cx, tt) => { tt.split(' ').forEach(s => { const w = g.measureText(s).width; g.fillText(s, cx, y); ws.push({ s, x: Math.round(cx), y, w: Math.round(w), h: 30, c: 95 }); cx += w + g.measureText(' ').width; }); return cx; };
      let e = seg(x, t); if (t2) e = seg(x2, t2); lines.push({ b: ++bn, p: 1, x, y, w: Math.round(e - x), h: 30, words: ws }); }; // Tesseract kabi: lavozim va familiya — bitta qator
    put(650, 140, 'DALOLATNOMA'); put(150, 236, 'Komissiya temir yoʻl uchastkasini koʻzdan kechirdi, rasmi quyida keltirilgan.');
    const gr = g.createLinearGradient(0, 330, 0, 750); gr.addColorStop(0, '#5a7090'); gr.addColorStop(1, '#c0c050'); g.fillStyle = gr; g.fillRect(470, 330, 700, 420);
    g.fillStyle = '#3a3a3a'; g.beginPath(); g.moveTo(470, 750); g.lineTo(720, 480); g.lineTo(920, 750); g.fill(); g.fillStyle = '#000';
    put(150, 800, 'Xulosa: relsni almashtirish talab etiladi.');
    const rows = [['Komissiya raisi', 'Karimov A.B.', 1], ['Yoʻl ustasi', 'Rahimov S.T.', 0], ['Muhandis', 'Toshev D.N.', 1], ['Defektoskopchi', 'Nazarov O.U.', 0]];
    let y = 1000; rows.forEach(rw => { put(150, y, rw[0], 1150, rw[1]); if (rw[2]) { g.strokeStyle = '#142878'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60, xx = 820 + t * 280, yy = y + 18 + Math.sin(t * 14) * 22 * (1 - Math.abs(t - 0.5)); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } y += 100; });
    g.strokeStyle = '#1e3cc8'; g.lineWidth = 6; g.beginPath(); g.arc(600, 1100, 110, 0, 7); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(600, 1100, 80, 0, 7); g.stroke();
    const img = c.toDataURL('image/jpeg', 0.9), ocr = { w: W, h: H, lines };
    // soxta server
    window.sigSrv = () => true; window.upOcrOk = async () => ''; window.srvRaw = async () => ({ json: async () => ocr }); window.upScanProc = async () => {};
    window.sigUsers = async () => (SIG.users = [['1001', 'Karimov Anvar B.'], ['1002', 'Rahimov Sardor T.'], ['1003', 'Toshev Doston N.'], ['1004', 'Nazarov Otabek U.']].map(x => ({ tabel: x[0], name: x[1], has_sig: true })));
    window.sigApi = async (u, m, body) => { if (body && body.signers) window.__sent = body; return m === 'POST' ? { id: 'x1' } : []; }; window.sigOpenDoc = () => {}; window.sigPoll = () => {}; window.upSentLoad = async () => {};
    try { hideLock(); } catch (e) {} document.body.classList.remove('locked'); openHisob('up'); await new Promise(z => setTimeout(z, 500));
    UP.skOld = true; upReset(); UP.mode = 'scan'; UP.title = 'Skaner hujjat'; UP.scans = [{ out: img, src: img, mode: 'bw', q: [[0, 0], [W, 0], [W, H], [0, H]], w: W, h: H }]; UP.st = 'scan'; UP.lang = 'uzb';
    await upScanGo();
    const o = { info: UP.scInfo, st: UP.st, ed: (document.getElementById('upOcrEd') || {}).innerHTML || '' };
    const clean = upClean(UP.ocrHtml);
    const docx = docxFromHtml('<div>' + clean + '</div>'), pdf = pdfBlobFromHtml('<div>' + clean + '</div>');
    const dz = new Uint8Array(await docx.arrayBuffer()), dtxt = new TextDecoder('latin1').decode(dz), ptxt = new TextDecoder('latin1').decode(new Uint8Array(await pdf.arrayBuffer()));
    o.docxMedia = new Set(dtxt.match(/word\/media\/rasm\d+\.jpeg/g) || []).size; o.docxAnchor = /wp:anchor/.test(dtxt) && /r:embed="rScIm/.test(dtxt); o.docxTok = /zzDXIMG/.test(dtxt);
    o.pdfImgs = (ptxt.match(/\/Subtype \/Image/g) || []).length; o.pdfMul = /\/BM \/Multiply/.test(ptxt); o.pdfTok = /zzFIG|zzOV/.test(ptxt);
    await upOcrDone(); await new Promise(z => setTimeout(z, 1200));
    const sb = document.querySelector('#exSheet .ex-sign'); o.signBtn = !!sb; if (sb) sb.click(); await new Promise(z => setTimeout(z, 1200));
    const box = document.getElementById('sgSend'); o.panel = !!(box && box.querySelector('.hs-hand'));
    o.rows = SIG.pend ? SIG.pend.rows.map(x => [x.label, x.on]) : [];
    hhSet('pend', 'tashev', false); o.rows2 = SIG.pend.rows.map(x => [x.label, x.on]);
    await sigSendGo(); const s = window.__sent || {}; o.signers = (s.signers || []).map(x => x.tabel); o.sentSigs = ((s.html || '').match(/class="up-hsig"/g) || []).length; o.sentOff = /data-off/.test(s.html || '');
    // oddiy hujjatlar oʻzgarmaydi
    const plain = pdfBlobFromHtml('<p>Oddiy matn</p>'); o.plainOk = plain.size > 500;
    return o;
  });
  if (process.env.DBG) console.log(JSON.stringify({ d: [r.docxMedia, r.docxAnchor, r.docxTok], rows: r.rows, signers: r.signers, sent: r.sentSigs, off: r.sentOff, ed: r.ed.replace(/src="[^"]*"/g, '') }));
  ok(r.st === 'ocr', 'OCR tekshirish oynasi');
  ok(r.info && r.info.figs === 2, 'rasm + muhr topildi: ' + JSON.stringify(r.info));
  ok(r.info && r.info.sigs === 2, 'ikki qoʻl imzosi topildi');
  ok(/data-k="karimav"/.test(r.ed) && /data-k="tashev"/.test(r.ed) && !/data-k="rahimav"/.test(r.ed), 'imzo egalari toʻgʻri (Karimov, Toshev; Rahimov emas — muhr imzo emas)');
  ok(/class="up-fig up-ov"/.test(r.ed), 'muhr matn ustida (qatorga bogʻlangan)');
  ok(r.docxMedia === 4 && r.docxAnchor && !r.docxTok, 'Word: 4 rasm, muhr matn ortida, belgilar qolmagan');
  ok(r.pdfImgs >= 4 && r.pdfMul && !r.pdfTok, 'PDF: rasmlar joyida, muhr/imzo matnni yopmaydi');
  ok(r.signBtn && r.panel, '«✍️ Imzoga» → «Qoʻlda imzolangan» soʻrovi');
  ok(JSON.stringify(r.rows) === JSON.stringify([['Karimov A.B.', false], ['Rahimov S.T.', true], ['Toshev D.N.', false], ['Nazarov O.U.', true]]), 'qoʻlda imzolaganlar yuborilmaydi: ' + JSON.stringify(r.rows));
  ok(r.rows2[2][1] === true, 'tozalangan imzo egasi roʻyxatga qaytdi');
  ok(JSON.stringify(r.signers.sort()) === JSON.stringify(['1002', '1003', '1004']) && r.sentSigs === 1 && !r.sentOff, 'yuborildi: faqat qolganlar; saqlangan imzo hujjatda, tozalangani yoʻq');
  ok(r.plainOk, 'oddiy hujjat PDF');
  ok(!errs.length, 'sahifa xatolari yoʻq ' + errs.join(' | '));
  await b.close(); console.log(bad ? `❌ ${bad} ta xato` : 'ALL OK'); process.exit(bad ? 1 : 0);
})();
