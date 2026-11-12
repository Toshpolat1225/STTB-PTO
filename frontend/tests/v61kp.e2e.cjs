// 6.1 (140): 🛞 Gʻildirak juftliklari — roʻyxat, namuna, yuklash, vagon pasportida almashtirish va tarix. Faqat SOXTA maʼlumot.
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); window.alert = m => { window.__al = m; };
    const mod = AGMK_MODS.some(m => m.id === 'kp'); kpOpen(); kpSamples(); const n = kpS().all().length, sam = kpS().all().filter(k => k.sample).length;
    const v = onlyVagons().filter(x => /2VS-105/.test(x.type))[0]; const on = kpOf(v.id).length;
    openPassport(v.id); await new Promise(s => setTimeout(s, 300)); const box = (document.getElementById('kp61Box') || {}).textContent || '';
    kpPass(); const ax = document.querySelectorAll('#kpP .kp-ax').length;
    const k = kpOf(v.id)[0]; kpOff(k.id); const off = !kpS().get(k.id).vid; kpPutGo(k.id, v.id, 1); const back = kpS().get(k.id).pos;
    kpEdit(k.id); document.getElementById('kpF_no').value = 'KP-SOXTA-1'; kpSave(k.id); const k2 = kpS().get(k.id);
    kpEdit('', v.id, 2); document.getElementById('kpF_no').value = 'KP-SOXTA-2'; document.getElementById('kpF_pos').value = '2'; window.__al = ''; kpSave(''); const busy = /oʻqda/.test(window.__al);
    const csv = 'Juftlik raqami;Turi;Vagon raqami;Oʻq;Prokat, mm\nKP-SOXTA-7;RU1-950;' + v.num + ';;3\n'; await kpImport({ files: [new File([csv], 'r.csv')], value: '' }); const imp = kpS().all().find(x => x.no === 'KP-SOXTA-7');
    currentUser = { tabel: '99901', name: 'Soxta Xodim', role: 'user' }; kpDraw(); const noBtn = !document.querySelector('#screen-kp .qb-new');
    const v6 = onlyVagons().find(x => /6VS-60/.test(x.type)); const ax6 = v6 ? (openPassport(v6.id), await new Promise(s => setTimeout(s, 200)), kpPass(), document.querySelectorAll('#kpP .kp-ax').length) : 4;
    return { ax6, mod, n, sam, on, box, ax, off, back, renamed: k2.no, sample: !!k2.sample, hist: (k2.hist || []).length, busy, imp: imp && { vid: String(imp.vid) === String(v.id), prokat: imp.prokat }, noBtn };
  });
  ok(r.mod && r.n === 10 && r.sam === 10 && r.on === 6, 'boʻlim, 10 ta NAMUNA, 6 tasi vagonda');
  ok(/Gʻildirak juftliklari\s*6\/6/.test(r.box) && r.ax === 6, '2VS-105 pasportida tugma (6/6) va 6 ta oʻq');
  ok(r.ax6 === 4, '6VS-60 — 4 ta oʻq');
  ok(r.off && r.back === 1 && r.hist === 3, 'olib qoʻyish va qayta oʻrnatish — tarixda');
  ok(r.renamed === 'KP-SOXTA-1' && !r.sample, 'asl raqam yozilganda NAMUNA belgisi olinadi');
  ok(r.busy, 'band oʻqqa ikkinchi juftlik qoʻyilmaydi');
  ok(r.imp && r.imp.vid && r.imp.prokat === '3', 'CSV roʻyxatdan yuklash va vagonga taqsimlash');
  ok(r.noBtn, 'oddiy xodim tahrirlay olmaydi');
  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
