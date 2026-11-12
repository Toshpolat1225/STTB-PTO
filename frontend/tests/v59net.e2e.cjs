// 5.9 (1-band): server javob bermasa tugmalar qotmaydi. Server «osilib qolgan» holatini Playwright route bilan yasaymiz
// (soʻrovga hech qachon javob kelmaydi — xuddi oʻchiq noutbuk / boshqa Wi-Fi kabi). Faqat SOXTA maʼlumot.
//   node frontend/tests/v59net.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  let mode = 'hang';
  await p.route('http://10.99.99.99:8080/**', route => { if (mode === 'hang') return; /* javob yoʻq */ const u = route.request().url();
    if (/\/health/.test(u)) return route.fulfill({ status: 200, body: '{"ok":true}', contentType: 'application/json' });
    if (/\/api\/sign\/v1\/inbox/.test(u)) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'd1', title: 'Soxta hujjat', status: 'open', created_by: '99001', signers: [{ tabel: '99001', state: 'wait', label: 'Sinov' }] }]) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }); });
  await p.goto('file://' + process.argv[2]);
  await p.evaluate(() => { localStorage.setItem('agmk_sync_cfg', JSON.stringify({ url: 'http://10.99.99.99:8080', key: 'soxta', on: true })); localStorage.setItem('agmk_sync_ses', JSON.stringify({ access: 'soxta', refresh: '', tabel: '99001', role: 'admin', name: 'Sinov', at: Date.now() })); });
  await p.reload(); await p.waitForTimeout(4500);
  await p.evaluate(() => { currentUser = { tabel: '99001', name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); });
  // 1) server osilgan: Imzolash darhol ochiladi
  let t = await p.evaluate(async () => { const t0 = performance.now(); const pr = sigOpenList(); await new Promise(r => setTimeout(r, 50)); const vis = !!document.getElementById('sgList'); await pr; return { ms: performance.now() - t0, vis }; });
  ok(t.vis && t.ms < 1500, '«Imzolash» server javob bermasa ham darhol ochiladi: ' + Math.round(t.ms) + ' ms');
  await p.waitForTimeout(3200); // fon tekshiruvi (2,5 s) oflaynni aniqlaydi
  ok(await p.evaluate(() => n59Offline()), 'fon tekshiruvi serverni «oflayn» deb belgiladi (60 s)');
  t = await p.evaluate(async () => { const t0 = performance.now(); let err = ''; try { await sbFetch('/api/sign/v1/docs/d1'); } catch (e) { err = e.message; } return { ms: performance.now() - t0, err }; });
  ok(t.ms < 200 && /Server ulanmagan/.test(t.err), 'oflaynda soʻrov kutmaydi: ' + Math.round(t.ms) + ' ms — ' + t.err.slice(0, 40));
  t = await p.evaluate(async () => { const t0 = performance.now(); await sigOpenList('done'); return { ms: performance.now() - t0, warn: /Server ulanmagan/.test((document.getElementById('sgList') || {}).innerText || '') }; });
  ok(t.ms < 300 && t.warn, 'oyna ichidagi tablar ham qotmaydi va «server ulanmagan» yozuvi bor: ' + Math.round(t.ms) + ' ms');
  // 2) server qaytdi: tekshiruv tiklaydi, roʻyxat yangilanadi
  mode = 'up';
  const up = await p.evaluate(async () => { NET59.last = 0; return await n59Probe(); });
  ok(up && !(await p.evaluate(() => n59Offline())), 'server qaytganda «oflayn» belgisi olinadi');
  await p.evaluate(async () => { await sigOpenList('in'); });
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => /Soxta hujjat/.test((document.getElementById('sgList') || {}).innerText || '')), 'server ulangach roʻyxat orqa fonda yangilandi');
  // 3) GET soʻrovida kutish 6 s (oldin 20 s)
  mode = 'hang';
  t = await p.evaluate(async () => { NET59.off = 0; const t0 = performance.now(); let err = ''; try { await sbFetch('/rest/v1/agmk_users'); } catch (e) { err = e.message || e.name; } return { ms: performance.now() - t0, err }; });
  ok(t.ms > 5000 && t.ms < 8000, 'birinchi javobsiz GET soʻrovi 6 s da toʻxtaydi (oldin 20 s): ' + Math.round(t.ms) + ' ms');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
