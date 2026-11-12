// 5.9 (13-band): Gmail → ilova («Открыть в приложении»): «📥 Kelgan fayllar», toʻplam tekshiruvi, master ish turi
// boʻyicha eslab qolinadi; 9-band: APK saqlagan faylni takroriy nusxasiz ochish. AgmkNative — soxta (sinov). Faqat SOXTA maʼlumot.
//   node frontend/tests/v59in.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); window.uiConfirm = async () => true; try { localStorage.removeItem('agmk_in59_who'); } catch (e) {} });
  // soxta spravka (tests/fixtures/spravka_soxta.xlsx — faqat soxta maʼlumot)
  const b64 = require('fs').readFileSync(require('path').join(__dirname, 'fixtures', 'spravka_soxta.xlsx')).toString('base64');
  const give = async () => p.evaluate(b64 => { window.__opened = []; window.AgmkNative = Object.assign(window.AgmkNative || {}, { _in: JSON.stringify([{ name: 'Spravka_soxta_oktyabr.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', b64: b64 }]), takeIncoming() { const s = this._in; this._in = ''; return s; }, openUri(u, m) { window.__opened.push(u); return true; } }); agmkIncomingPoll(); }, b64);
  await give(); await p.waitForTimeout(600);
  const m1 = await p.evaluate(() => { const m = document.getElementById('in59M'); return m && !m.classList.contains('hidden') ? m.innerText : ''; });
  ok(/Kelgan fayllar \(1\)/.test(m1) && /Spravka_soxta_oktyabr\.xlsx/.test(m1), '«📥 Kelgan fayllar» oynasi ochildi');
  ok(await p.evaluate(() => AgmkNative.takeIncoming() === ''), 'fayl bir marta olinadi (qayta chiqmaydi)');
  await p.evaluate(() => in59Go('chk')); await p.waitForTimeout(2500);
  const d1 = await p.evaluate(() => ({ open: !!document.getElementById('hpModal') && !document.getElementById('hpModal').classList.contains('hidden'), who: document.getElementById('hp_who').value, tip: (document.querySelector('.in59-who') || {}).textContent || '', keys: HPK.pend.in59keys, sh: HPK.pend.sheets.map(x => x.type + ':' + (x.rows || []).length + ':' + JSON.stringify((x.rows || [])[2] || []).slice(0, 80) + (x.err || '')) }));
  ok(d1.open && d1.who === '' && /Bu kimniki/.test(d1.tip) && d1.keys.length > 0, 'toʻplam oynasi ochildi, master nomaʼlum — «Bu kimniki?» ' + JSON.stringify(d1));
  await p.evaluate(() => { document.getElementById('hp_who').value = 'Soxta Usta'; }); await p.evaluate(() => hpRun()); await p.waitForTimeout(3000);
  ok(await p.evaluate(() => /Soxta Usta/.test((hsChecks()[0] || {}).file || '')), 'tekshiruv saqlandi — master nomi bilan');
  await give(); await p.waitForTimeout(500); await p.evaluate(() => in59Go('chk')); await p.waitForTimeout(2500);
  const d2 = await p.evaluate(() => ({ who: document.getElementById('hp_who').value, tip: (document.querySelector('.in59-who') || {}).textContent || '' }));
  ok(d2.who === 'Soxta Usta' && /ish turi boʻyicha topildi/.test(d2.tip), 'ikkinchi safar master ish turi boʻyicha oʻzi topildi');
  await p.evaluate(() => mdlClose('hpModal'));
  // «Faqat saqlash»
  await give(); await p.waitForTimeout(500); await p.evaluate(() => { localStorage.removeItem('agmk_dl59'); }); await p.evaluate(() => in59Go('save')); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => dl59All().length === 1 && dl59All()[0].name === 'Spravka_soxta_oktyabr.xlsx'), '«Faqat saqlash» — «Yuklab olinganlar» roʻyxatida');
  // 9-band: APK saqlagan manzil
  await p.evaluate(() => { const id = dl59All()[0].id; agmkSaved('Spravka_soxta_oktyabr.xlsx', 'content://media/external/downloads/99'); }); await p.waitForTimeout(100);
  await p.evaluate(async () => { await dl59Open(dl59All()[0].id); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => window.__opened[0] === 'content://media/external/downloads/99' && dl59All()[0].uri === 'content://media/external/downloads/99'), 'APK: saqlangan fayl oʻz manzilidan ochiladi (takroriy nusxa yoʻq)');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
