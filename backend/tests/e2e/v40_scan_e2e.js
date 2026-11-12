// 4.0 (K-52): skaner — «toza hujjat»: imzo va muhr olib tashlanadi, jadval chiziqlari → haqiqiy jadval (birlashgan katak bilan),
// ikki ustunli sarlavha, imzo chizigʻi «____», rasm yoʻq; Word — haqiqiy jadval, PDF — matnli. Server shart emas:
// hujjat brauzerda chiziladi (soxta ismlar), OCR natijasi chizilgan matn joylashuvidan tuziladi.
// Ishga tushirish: node v40_scan_e2e.js <app.html>
const { chromium } = require('playwright');
const HTML = process.argv[2];
let bad = 0; const ok = (c, m) => { console.log((c ? '✅ ' : '❌ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 1200 } }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + HTML); await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    const W = 1654, H = 2339, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#000'; g.font = '30px serif'; g.textBaseline = 'top';
    const lines = []; let bn = 0;
    const put = (x, y, t, right) => { const ws = []; const tw = g.measureText(t).width; let cx = right ? x - tw : x; t.split(' ').forEach(s => { const w = g.measureText(s).width; g.fillText(s, cx, y); ws.push({ s, x: Math.round(cx), y, w: Math.round(w), h: 26, c: 95 }); cx += w + g.measureText(' ').width; });
      lines.push({ b: ++bn, p: 1, x: ws[0].x, y, w: Math.round(cx - ws[0].x), h: 26, words: ws }); };
    const ln = (x1, y1, x2, y2, col, w) => { g.strokeStyle = col || '#000'; g.lineWidth = w || 3; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
    // sarlavha: chapda «Kelishildi», oʻngda «Tasdiqlayman»
    put(120, 120, '"KELISHILDI"'); put(1530, 120, '"TASDIQLAYMAN"', true);
    put(120, 165, 'Bosh mexanik'); put(1530, 165, 'Bosh muhandis', true);
    ln(120, 238, 330, 238); put(345, 210, 'Soxtaov A.B.'); ln(1180, 238, 1360, 238); put(1530, 210, 'Namunov D.E.', true);
    put(825 - Math.round(g.measureText('HISOB-KITOB').width / 2), 320, 'HISOB-KITOB'); put(120, 380, '1. Materiallar:');
    // jadval: 4 ustun, oxirgi qatorda «Jami:» uch ustunni egallaydi
    const X = [120, 220, 900, 1100, 1530], Y = [430, 500, 570, 640, 710];
    Y.forEach(y => ln(X[0], y, X[4], y)); [0, 3, 4].forEach(i => ln(X[i], Y[0], X[i], Y[4])); [1, 2].forEach(i => ln(X[i], Y[0], X[i], Y[3]));
    const cell = [['№', 'Nomi', 'Soni', 'Summa'], ['1', 'Tormoz kolodkasi', '4', '800,00'], ['2', 'Avtoulagich', '1', '700,00']];
    cell.forEach((row, ri) => row.forEach((t, ci) => put(X[ci] + 15, Y[ri] + 20, t)));
    put(X[0] + 15, Y[3] + 20, 'Jami:'); put(X[3] + 15, Y[3] + 20, '1 500,00');
    // imzolar roʻyxati
    [['Usta', 'Karimov A.'], ['Hisobchi', 'Rahimova S.']].forEach((rw, i) => { const y = 820 + i * 80; put(120, y, rw[0]); ln(700, y + 28, 950, y + 28); put(1100, y, rw[1]); });
    // koʻk qoʻl imzosi va muhr — natijada boʻlmasligi kerak
    g.strokeStyle = '#1e3cc8'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60, xx = 1190 + t * 220, yy = 225 + Math.sin(t * 14) * 25; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
    g.beginPath(); g.arc(800, 840, 70, 0, 7); g.stroke();
    lines.push({ b: 99, p: 1, x: 1200, y: 205, w: 60, h: 40, words: [{ s: 'Ly', x: 1200, y: 205, w: 60, h: 40, c: 21 }] }); // OCR imzoni «soʻz» deb oʻqigan
    const img = c.toDataURL('image/jpeg', 0.92), ocr = { w: W, h: H, lines };
    const sent = [];
    window.sigSrv = () => true; window.upOcrOk = async () => '';
    window.srvRaw = async (u, o) => { sent.push({ u: u, b: o && o.body }); return { json: async () => /psm=6/.test(u) ? { w: 10, h: 10, lines: [] } : ocr }; };
    try { hideLock(); } catch (e) {} document.body.classList.remove('locked'); openHisob('up'); await new Promise(z => setTimeout(z, 500));
    UP.skOld = false; upReset(); UP.mode = 'scan'; UP.title = 'Skaner hujjat'; UP.scans = [{ cv: c, src: img, out: img, ow: W, oh: H, mode: 'bw', q: [[0, 0], [W, 0], [W, H], [0, H]], w: W, h: H }]; UP.st = 'scan'; UP.lang = 'uzb';
    await upScanGo();
    const o = { st: UP.st, html: UP.ocrHtml, langs: sent.map(x => x.u) };
    // OCR ga yuborilgan rasm: koʻk imzo va jadval chiziqlari yoʻq, matn bor
    const bm = await createImageBitmap(sent[0].b), cc = document.createElement('canvas'); cc.width = bm.width; cc.height = bm.height; const cg = cc.getContext('2d'); cg.drawImage(bm, 0, 0);
    const px = (x, y) => { const d = cg.getImageData(x - 1, y - 1, 3, 3).data; let m = 255; for (let i = 0; i < d.length; i += 4) m = Math.min(m, d[i]); return m; };
    o.inkGone = px(1300, 225 + Math.round(Math.sin((110 / 220) * 14) * 25)) > 200 && px(870, 840) > 200; o.lineGone = px(600, 570) > 200 && px(900, 600) > 200; o.textKept = (() => { const d = cg.getImageData(120, 120, 300, 30).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 120) n++; return n > 200; })();
    const box = document.createElement('div'); box.innerHTML = UP.ocrHtml; const t = box.querySelector('table.sk-t:not(.sk-nb)');
    o.rows = t ? [...t.rows].map(r => [...r.cells].map(td => (td.colSpan > 1 ? td.colSpan + '|' : '') + td.textContent.trim())) : null;
    const nb = box.querySelectorAll('table.sk-nb'); o.nb = [...nb].map(x => [...x.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()));
    o.title = (box.querySelector('.a-title') || {}).textContent;
    // tahrirdan keyin: jadval tuzilmasi saqlanadi
    UP.html = upClean(UP.ocrHtml); const b2 = document.createElement('div'); b2.innerHTML = UP.html; const t2 = b2.querySelector('table.sk-t:not(.sk-nb)');
    o.cleanKeep = !!t2 && !!t2.getAttribute('data-cw') && !b2.querySelector('mark,img');
    // Word va PDF
    const docx = docxFromHtml('<div>' + UP.html + '</div>'), pdf = pdfBlobFromHtml('<div>' + UP.html + '</div>');
    const dz = new TextDecoder('latin1').decode(new Uint8Array(await docx.arrayBuffer())), pz = new TextDecoder('latin1').decode(new Uint8Array(await pdf.arrayBuffer()));
    o.docxRaw = dz.length; o.docxMedia = /word\/media\//.test(dz); o.docxTok = /zzSKT/.test(dz); o.pdfImg = /\/Subtype \/Image/.test(pz); o.pdfTok = /zzSKT/.test(pz); o.pdfPages = (pz.match(/\/Type \/Page\b/g) || []).length;
    // docx ichidagi document.xml (siqilmagan boʻlishi mumkin) — jadval belgilari
    o.docxTbl = (dz.match(/<w:tbl>/g) || []).length; o.docxSpan3 = /<w:gridSpan w:val="3"\/>/.test(dz);
    // eski hujjatlar (skaner jadvali yoʻq) oʻzgarmaydi
    o.plain = pdfBlobFromHtml('<p>Oddiy matn</p><table><tr><td>a</td><td>b</td></tr></table>').size > 500;
    return o;
  });
  if (process.env.DBG) console.log(JSON.stringify(r, null, 1));
  ok(r.st === 'ocr', 'OCR tekshirish oynasi');
  ok(r.langs.length >= 1 && r.langs.every(u => /l=uzb/.test(u)), 'tanlangan til saqlandi (avtomatik almashtirilmadi)');
  ok(r.inkGone, 'OCR rasmida koʻk imzo va muhr yoʻq');
  ok(r.lineGone && r.textKept, 'OCR rasmida jadval chiziqlari yoʻq, matn bor');
  ok(!/<img/.test(r.html) && !/Ly/.test(r.html), 'hujjatda rasm ham, imzo qoldigʻi ham yoʻq');
  ok(JSON.stringify(r.rows) === JSON.stringify([['№', 'Nomi', 'Soni', 'Summa'], ['1', 'Tormoz kolodkasi', '4', '800,00'], ['2', 'Avtoulagich', '1', '700,00'], ['3|Jami:', '1 500,00']]), 'jadval kataklari va birlashgan katak: ' + JSON.stringify(r.rows));
  ok(r.nb[0] && /KELISHILDI/.test(r.nb[0][0]) && /Soxtaov/.test(r.nb[0][0]) && /TASDIQLAYMAN/.test(r.nb[0][1]) && /Namunov/.test(r.nb[0][1]), 'ikki ustunli sarlavha: ' + JSON.stringify(r.nb[0]));
  ok(r.nb[0] && /_{4,}\s*Soxtaov/.test(r.nb[0][0]) && /_{4,}\s*Namunov/.test(r.nb[0][1]), 'imzo oʻrnida «____»');
  ok(r.nb[1] && r.nb[1].length === 6 && r.nb[1][0] === 'Usta' && /^_{4,}$/.test(r.nb[1][1]) && r.nb[1][2] === 'Karimov A.', 'imzolar roʻyxati — chegarasiz jadval: ' + JSON.stringify(r.nb[1]));
  ok(r.title === 'HISOB-KITOB', 'sarlavha');
  ok(r.cleanKeep, 'tahrirdan keyin jadval tuzilmasi saqlanadi');
  ok(r.docxTbl >= 3 && r.docxSpan3 && !r.docxMedia && !r.docxTok, 'Word: haqiqiy jadvallar (gridSpan), rasm yoʻq');
  ok(!r.pdfImg && !r.pdfTok && r.pdfPages === 1, 'PDF: matnli, rasmsiz, 1 bet');
  ok(r.plain, 'oddiy hujjat PDF (oʻzgarmagan)');
  ok(!errs.length, 'sahifa xatolari yoʻq ' + errs.join(' | '));
  await b.close(); console.log(bad ? `\n❌ ${bad} ta xato` : '\nALL OK'); process.exit(bad ? 1 : 0);
})();
