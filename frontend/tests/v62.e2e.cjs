// 6.2 (141): imzolangan hujjat oflayn, hisobot tekshiruvlari akkaunt boʻyicha, qabul (rasm siqish, takroriy SF, narx farqi, toʻliqlik).
// Faqat SOXTA maʼlumot.   node frontend/tests/v62.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  await p.evaluate(() => { currentUser = { tabel: '99901', name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); window.alert = m => { window.__al = m; }; });

  // ---------- 1) imzolangan hujjat oflayn ----------
  let r = await p.evaluate(async () => {
    const doc = { id: 'sd_soxta9', title: 'Soxta dalolatnoma', status: 'done', html: '<p>soxta</p>', hash: 'x', created_by: '99901', created_at: '2026-11-08T10:00:00Z', signers: [{ tabel: '99901', name: 'Sinov Soxta', state: 'sign', at: '2026-11-08T10:05:00Z' }] };
    const real = window.sbFetch; let online = true;
    window.sbFetch = async (path) => { if (!online) throw new Error('Server ulanmagan'); if (path === '/api/sign/v1/docs/sd_soxta9') return JSON.parse(JSON.stringify(doc)); return []; };
    const a = await sigApi('/api/sign/v1/docs/sd_soxta9'); await new Promise(s => setTimeout(s, 300));
    online = false; let c = null, e2 = '';
    try { c = await sigApi('/api/sign/v1/docs/sd_soxta9'); } catch (e) { e2 = e.message; }
    let miss = ''; try { await sigApi('/api/sign/v1/docs/yoq_hujjat'); } catch (e) { miss = e.message; }
    window.sbFetch = real;
    return { a: a && a.id, off: c && c._offline, t: c && c.title, e2, miss: /ulanmagan/.test(miss) };
  });
  ok(r.a === 'sd_soxta9' && !!r.off && r.t === 'Soxta dalolatnoma' && r.miss, 'imzolangan hujjat: server bilan saqlandi, serversiz — oflayn nusxa; saqlanmagani — xato ' + JSON.stringify(r));
  r = await p.evaluate(async () => {
    SIG.cur = { id: 'sd_soxta9', _offline: '2026-11-08T10:06:00Z', signers: [] };
    mdl('sgDoc', '<div class="px-h"><b>✍️ Hujjat</b></div><div class="pk-btns"><button>✍️ Imzolash</button><button>❌ Rad etish</button><button>📄 PDF</button></div>', true);
    so2Mark();
    const box = $id('sgDoc'), vis = [...box.querySelectorAll('.pk-btns button')].filter(x => x.style.display !== 'none').map(x => x.textContent);
    mdlClose('sgDoc'); return { off: !!box.querySelector('.so2-off'), vis };
  });
  ok(r.off && r.vis.length === 1 && /PDF/.test(r.vis[0]), 'oflayn nusxa: «📴 Oflayn nusxa» belgisi, imzolash/rad tugmalari yashirin ' + JSON.stringify(r));

  // ---------- 2) hisobot tekshiruvlari akkaunt boʻyicha ----------
  r = await p.evaluate(async () => {
    window.dispatchEvent(new CustomEvent('agmk:login', { detail: {} })); await new Promise(s => setTimeout(s, 100));
    const k = 'agmk_u_99901_hisob', inSync = KV_SYNC.keys.includes(k);
    kvSet(HS_CHK_KEY, [{ id: 'c1', at: '2026-11-08T09:00:00Z', byT: '99901', file: 'meniki' }, { id: 'c2', at: '2026-11-08T08:00:00Z', byT: '99902', file: 'boshqaniki' }]);
    const own = kvGet(k, []);
    syncApply({ id: 'kv:' + k, kind: 'kv', data: { k: k, v: [{ id: 'c3', at: '2026-11-08T11:00:00Z', byT: '99901', file: 'planshetda' }].concat(own) } });
    const L = kvGet(HS_CHK_KEY, []);
    currentUser = { tabel: '99902', name: 'Boshqa Soxta', role: 'user' }; window.dispatchEvent(new CustomEvent('agmk:login', { detail: {} })); await new Promise(s => setTimeout(s, 100));
    const sw = { mine: KV_SYNC.keys.includes('agmk_u_99902_hisob'), other: KV_SYNC.keys.includes(k) };
    currentUser = { tabel: '99901', name: 'Sinov Soxta', role: 'admin' }; window.dispatchEvent(new CustomEvent('agmk:login', { detail: {} }));
    return { inSync, own: own.map(x => x.id), L: L.map(x => x.id), sw };
  });
  ok(r.inSync && r.own.join() === 'c1', 'shaxsiy kalit sinxron roʻyxatda; unga faqat oʻz tekshiruvlarim tushadi ' + JSON.stringify(r));
  ok(r.L.join() === 'c3,c1,c2', 'boshqa qurilmadagi tekshiruv mahalliy roʻyxatga qoʻshildi (vaqt boʻyicha) ' + JSON.stringify(r.L));
  ok(r.sw.mine && !r.sw.other, 'akkaunt almashsa — oldingi akkauntning shaxsiy kaliti sinxrondan chiqadi ' + JSON.stringify(r.sw));

  // ---------- 3) qabul ----------
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; qbOpen(); });
  r = await p.evaluate(async () => {
    qbEdit(); Object.assign(QBE, { sana: '2026-11-02', supplier: '«Namuna Metall» MChJ', sf: '7001' }); QBE.items = [{ n: 'Tormoz kolodkasi (soxta)', u: 'dona', q: '100', price: '180000' }]; qbEditSave();
    const d1 = qbS().all().find(x => x.sf === '7001');
    const cv = document.createElement('canvas'); cv.width = 2600; cv.height = 1800; const g = cv.getContext('2d'); const im = g.createImageData(2600, 1800); for (let i = 0; i < im.data.length; i++) im.data[i] = (Math.random() * 255) | 0; g.putImageData(im, 0, 0);
    const png = await new Promise(res => cv.toBlob(res, 'image/png'));
    await qbAddFiles(d1.id, [new File([png], 'katta.png', { type: 'image/png' })], 'foto');
    await new Promise(s => setTimeout(s, 300));
    const f = qbS().get(d1.id).files[0];
    return { big: png.size, mime: f.mime, size: f.size, name: f.name, id: d1.id };
  });
  ok(r.big > 600 * 1024 && r.mime === 'image/jpeg' && r.size < r.big && /\.jpg$/.test(r.name), `katta rasm siqildi: ${(r.big / 1048576).toFixed(1)} MB → ${(r.size / 1048576).toFixed(2)} MB (JPEG)`);
  const D1 = r.id;
  r = await p.evaluate(async () => {
    let msg = ''; window.uiConfirm = async m => { msg = m; return false; };
    qbEdit(); Object.assign(QBE, { sana: '2026-11-05', supplier: '«Namuna Metall» MChJ', sf: '7001' }); QBE.items = [{ n: 'Tormoz kolodkasi (soxta)', u: 'dona', q: '50', price: '260000' }]; qbEditSave();
    await new Promise(s => setTimeout(s, 200));
    const n1 = qbS().all().length;
    window.uiConfirm = async () => true; qbEditSave(); await new Promise(s => setTimeout(s, 300));
    return { dup: /7001/.test(msg) && /avval QD-/.test(msg), price: /\+44%/.test(msg), notSaved: n1, saved: qbS().all().length };
  });
  ok(r.dup && r.price, 'saqlashdan oldin: takroriy schyot-faktura va narx farqi (+44%) aytiladi ' + JSON.stringify(r));
  ok(r.saved === r.notSaved + 1, '«Yoʻq» — saqlanmadi, «Ha» — saqlandi ' + JSON.stringify(r));
  r = await p.evaluate(async (id) => {
    mdlClose('qbV'); mdlClose('qbE'); QBF.y = 2026; qbDraw();
    const row = [...document.querySelectorAll('#screen-qb .qb-row')].find(x => (x.getAttribute('onclick') || '').includes(id));
    const l = row && row.querySelector('.qx-l');
    await qbView(id); const w = ($id('qbV').querySelector('.qx-warn') || {}).textContent || '';
    return { l: l && l.textContent, tip: l && l.title, w };
  }, D1);
  ok(r.l === '🟡' && /schyot-faktura, sertifikat/.test(r.tip) && /yetishmaydi/.test(r.w), 'hujjatlar toʻliqligi: foto bor, SF va sertifikat yoʻq → 🟡 ' + JSON.stringify(r));

  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
