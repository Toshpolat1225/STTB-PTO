// 6.1 (139): 📁 Qabul qilingan ehtiyot qismlar — dalolatnoma, papka, foto, imzo → hisobot. Faqat SOXTA maʼlumot.
//   node frontend/tests/v61qabul.e2e.cjs <ilova.html>   (rasmlar: $AGMK_SHOT_DIR)
const { chromium } = require('playwright');
const SH = process.env.AGMK_SHOT_DIR || '';
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.body.classList.add('agmk-web')));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); try { themeApply('classic', true); } catch (e) {} window.alert = m => { window.__al = m; }; });
  // 1) modul roʻyxatda, ochiladi
  let r = await p.evaluate(() => ({ mod: AGMK_MODS.some(m => m.id === 'qabul'), fn: typeof qbOpen }));
  ok(r.mod && r.fn === 'function', 'boʻlim roʻyxatda: «📁 Qabul qilingan ehtiyot qismlar»');
  // MTTB kirimi (soxta)
  await p.evaluate(() => { const d = mtData(); d.kir.push({ id: 'k_soxta1', at: '2026-10-28T09:00:00Z', doc: 'N-455', items: [{ n: 'Tormoz kolodkasi (soxta)', q: 2000, u: 'dona' }, { n: 'Kolodka chekasi (soxta)', q: 60, u: 'dona' }], acc: { items: [{ got: 2000 }, { got: 58 }] } }); mtSave(d); qbOpen(); });
  await p.waitForTimeout(300);
  // 2) yangi dalolatnoma: MTTB kirimidan toʻldirish
  r = await p.evaluate(() => { qbEdit(); Object.assign(QBE, { sana: '2026-10-28', supplier: '«Namuna Metall» MChJ', sf: '1123', contract: '45/26', warranty: '12' }); qbFromMttb(); const has = !!document.querySelector('#qbK .qb-row'); qbKirPick('k_soxta1');
    QBE.items[0].price = '185000'; QBE.items[0].party = 'P-2610'; QBE.items[0].cert = true; QBE.items[1].price = '126667'; QBE.com[0].n = 'Soxtaev A.'; QBE.com[1].n = 'Namunova D.'; qbEditDraw(); qbEditSave();
    const L = qbS().all(); const d = L[L.length - 1]; return { has, no: d && d.no, items: d && d.items.length, q2: d && d.items[1].q, qd2: d && d.items[1].qDoc, kir: d && d.kirId, st: d && d.st, sum: d && qbSum(d), id: d && d.id }; });
  ok(r.has && r.items === 2 && +r.q2 === 58 && +r.qd2 === 60 && r.kir === 'k_soxta1', 'MTTB kirimidan toʻldirildi (hujjatda 60, qabul 58) ' + JSON.stringify(r));
  ok(/^QD-2026-\d{3}$/.test(r.no) && r.st === 'draft' && Math.round(r.sum) === Math.round(2000 * 185000 + 58 * 126667), 'raqam ' + r.no + ', qoralama, summa ' + r.sum);
  const ID = r.id;
  // 3) papka: rasm va sertifikat qoʻshish (soxta fayllar)
  r = await p.evaluate(async id => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; const g = cv.getContext('2d'); g.fillStyle = '#556'; g.fillRect(0, 0, 64, 48); g.fillStyle = '#ccd'; g.fillRect(8, 16, 48, 14);
    const png = await new Promise(res => cv.toBlob(res, 'image/png'));
    await qbAddFiles(id, [new File([png], 'qadoq.png', { type: 'image/png' })], 'foto');
    await qbAddFiles(id, [new File([new Blob(['%PDF-1.4 soxta'])], 'sertifikat_P-2610.pdf', { type: 'application/pdf' })], 'cert');
    await new Promise(s => setTimeout(s, 400));
    const d = qbS().get(id); const th = document.querySelector('#qbV .qb-th img');
    return { n: d.files.length, kinds: d.files.map(f => f.kind).join(','), by: d.files[0].by, thumb: !!th, html: /QABUL QILISH DALOLATNOMASI/.test(qbHtml(d)) && /Soxtaev A\./.test(qbHtml(d)) };
  }, ID);
  ok(r.n === 2 && r.kinds === 'foto,cert' && r.thumb, 'papkaga foto va sertifikat qoʻshildi, rasm koʻrinadi');
  ok(r.html, 'dalolatnoma matni: sarlavha, komissiya, qatorlar');
  if (SH) await p.screenshot({ path: SH + '/qabul_papka.png' });
  // 4) imzoga yuborish → imzoda; hamma imzoladi → imzolangan, tahrir yopiladi, PDF papkaga
  r = await p.evaluate(async id => {
    const origApi = window.sigApi.__orig || null; let sent = null;
    window.sigSendOpen = async opt => { SIG.pend = { html: opt.html, title: opt.title, rows: [] }; };
    await qbSign(id);
    // sigSendGo dagi POST ni taqlid: oʻralgan sigApi orqali (ichki asl chaqiruv — stub)
    const realInner = sbFetch; window.sbFetch = async (path, o) => { if (o && o.method === 'POST') { sent = JSON.parse(JSON.stringify(o.body)); return { id: 'sd_soxta1' }; } return { id: 'sd_soxta1', status: 'done', done_at: '2026-10-28T10:05:00Z', signers: [{ name: 'Soxtaev A.', state: 'sign', at: '2026-10-28T10:00:00Z' }, { name: 'Namunova D.', state: 'sign', at: '2026-10-28T10:05:00Z' }] }; };
    await sigApi('/api/sign/v1/docs', 'POST', { title: SIG.pend.title, html: SIG.pend.html, meta: SIG.pend.meta });
    const st1 = qbS().get(id).st, sigId = qbS().get(id).sig.id;
    window.sigPdfBlob = async () => new Blob(['%PDF-1.4 imzolangan soxta'], { type: 'application/pdf' });
    await qbSigCheck(id, false); await new Promise(s => setTimeout(s, 500));
    window.sbFetch = realInner;
    const d = qbS().get(id); let blocked = ''; qbEdit(id); blocked = window.__al || '';
    return { meta: sent && sent.meta, st1, sigId, st2: d.st, nf: d.files.length, pdf: d.files.some(f => f.kind === 'pdf'), blocked: /oʻzgartirib boʻlmaydi/.test(blocked) };
  }, ID);
  ok(r.meta && r.meta.kind === 'qabul' && r.st1 === 'imzoda' && r.sigId === 'sd_soxta1', 'imzoga yuborildi → «Imzoda»');
  ok(r.st2 === 'imzolangan' && r.pdf && r.nf === 3 && r.blocked, 'hamma imzoladi → «Imzolangan», imzolangan PDF papkada, tahrir yopiq');
  // 5) yillik hisobot va qoralama hisobotga kirmasligi
  r = await p.evaluate(() => { qbEdit(); Object.assign(QBE, { sana: '2026-11-02', supplier: 'Soxta Texnika AJ' }); QBE.items = [{ n: 'Podshipnik (soxta)', u: 'dona', qDoc: '24', q: '22', price: '1300000' }]; qbEditSave();
    QBF.y = 2026; const A = qbAgg(2026); qbReport(); const rep = !!document.querySelector('#qbR .qb-mon');
    let csv = ''; const oc = URL.createObjectURL; URL.createObjectURL = bl => { bl.text().then(t => { window.__csv = t; }); return 'blob:x'; }; qbCsv(); URL.createObjectURL = oc;
    return { tot: A.tot, docs: A.L.length, prod: A.prod.map(x => x.n), oct: A.mon[9], rep }; });
  ok(r.docs === 1 && Math.round(r.oct) === Math.round(2000 * 185000 + 58 * 126667) && r.rep, 'yillik hisobot: faqat imzolangan dalolatnoma (qoralama kirmaydi), oktabr summasi');
  await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ csv: window.__csv || '', bad: qbAll().filter(d => qbBad(d)).length }));
  ok(/Tormoz kolodkasi \(soxta\)/.test(r.csv) && /Podshipnik \(soxta\)/.test(r.csv) && r.bad === 2, 'Excel (CSV) va «kam keldi» belgisi');
  await p.evaluate(() => { mdlClose('qbR'); mdlClose('qbV'); mdlClose('qbE'); qbDraw(); }); await p.waitForTimeout(300);
  if (SH) await p.screenshot({ path: SH + '/qabul_royxat.png' });
  r = await p.evaluate(() => ({ rows: document.querySelectorAll('#screen-qb .qb-row').length, kpi: (document.querySelector('#screen-qb .qb-kpi') || {}).textContent || '' }));
  ok(r.rows === 2 && /Imzolangandalolatnomalar1/.test(r.kpi.replace(/\s+/g, '')), 'roʻyxat va koʻrsatkichlar');
  // 6) huquq: oddiy xodim tuza olmaydi
  r = await p.evaluate(() => { currentUser = { tabel: '99901', name: 'Soxta Xodim', role: 'user' }; window.__al = ''; qbEdit(); qbDraw(); return { al: window.__al, btn: !!document.querySelector('#screen-qb .qb-new') }; });
  ok(/MTTB/.test(r.al) && !r.btn, 'oddiy xodim dalolatnoma tuza olmaydi (koʻrishi mumkin)');
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
