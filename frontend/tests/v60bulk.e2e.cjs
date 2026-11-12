// 6.0 (4-band): «📥 Umumiy yuklash» — hamma masterlar fayllari + bitta Forma-30; masterga ajratish (ism, sklad),
// «❓ Kimniki?», har master alohida tekshiruv, umumiy natija. Fayllar — tests/fixtures/bk_*.xlsx (faqat SOXTA maʼlumot).
//   node frontend/tests/v60bulk.e2e.cjs <ilova.html>
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4000);
  const fx = ['bk_usta_a.xlsx', 'bk_usta_b.xlsx', 'bk_nomalum.xlsx', 'bk_forma30.xlsx'].map(n => ({ n, b: fs.readFileSync(path.join(__dirname, 'fixtures', n)).toString('base64') }));
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov', role: 'admin' }; document.body.classList.remove('locked'); window.uiConfirm = async () => true;
    kvSet('agmk_sklad_master', { '9100': 'Soxtaev Anvar', '9204': 'Namunaviy Bekzod' }); openHisob(); HS.tab = 'hisob'; HS.cat = 'vagon'; hsRender(); });
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !!document.querySelector('#hpBox .bk60-in')), 'Hisobotlarda «📥 Umumiy yuklash» tugmasi bor (anʼanaviy «Oylik toʻplam» ham joyida)');
  const n0 = await p.evaluate(() => hsChecks().length);
  await p.evaluate(async fx => { const files = fx.map(x => { const bin = atob(x.b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new File([u], x.n, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }); await bk60Start(files, 'vagon'); }, fx);
  await p.waitForTimeout(800);
  const g = await p.evaluate(() => ({ items: BK60.items.map(x => x.f + '=' + (x.who || '?') + '(' + (x.how || '') + ')'), f30: BK60.f30.length, month: BK60.month, ui: document.getElementById('bk60M').innerText }));
  ok(g.f30 === 1 && g.month === '2026-10', 'Forma-30 umumiy deb ajratildi, oy aniqlandi: ' + g.month);
  ok(g.items.some(s => /bk_usta_a.xlsx=Soxtaev Anvar\(ism\)/.test(s)), 'master fayldagi F.I.Sh. boʻyicha topildi: ' + g.items.join(' | '));
  ok(g.items.some(s => /bk_usta_b.xlsx=Namunaviy Bekzod\(sklad 9204\)/.test(s)), 'master sklad kodi boʻyicha topildi');
  ok(g.items.some(s => /bk_nomalum.xlsx=\?/.test(s)) && /Kimniki/.test(g.ui), 'aniqlanmagani — «❓ Kimniki?»');
  await p.evaluate(() => bk60Run()); await p.waitForTimeout(6000);
  const r = await p.evaluate(() => ({ last: BK60.last, left: BK60.items.length, ui: (document.getElementById('bk60R') || {}).innerText || '', n: hsChecks().length, who: hsChecks().slice(0, 2).map(x => x.who) }));
  ok(r.last && r.last.length === 2 && r.last.every(x => x.id) && r.n === n0 + 2, 'har master alohida tekshirildi (' + (r.last || []).map(x => x.who + ': ❌' + x.red + ' 🔵' + x.blue).join(', ') + ')');
  ok(r.who.indexOf('Soxtaev Anvar') >= 0 && r.who.indexOf('Namunaviy Bekzod') >= 0 && /Umumiy natija/.test(r.ui), 'umumiy natija oynasi va «Hisobotlar» roʻyxatida master nomi bilan');
  ok(r.left === 1, 'masteri aniqlanmagan fayl paketda qoldi');
  // Gmail → paketga qoʻshish (ekran sakramaydi)
  await p.evaluate(() => { document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden')); openScreen('screen-main'); });
  const scr = await p.evaluate(async fx => { const bin = atob(fx.b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); in59Open([new File([u], 'bk_usta_a2.xlsx')]); await new Promise(r => setTimeout(r, 200)); const has = !!document.querySelector('#in59M .bk60-add'); document.querySelector('#in59M .bk60-add').click(); await new Promise(r => setTimeout(r, 1200)); return { has, scr: document.querySelector('.screen.active').id, n: BK60.items.length }; }, fx[0]);
  ok(scr.has && scr.scr === 'screen-main' && scr.n === 2, 'Gmail fayli «Umumiy yuklashga qoʻshish» — paketga tushdi, ekran sakramadi ' + JSON.stringify(scr));
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
