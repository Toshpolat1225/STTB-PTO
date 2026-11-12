// 6.1: muallif roʻyxatidagi 6–20-bandlar (docs/REJA_6.1.md). Faqat SOXTA maʼlumot.
//   node frontend/tests/v61.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const page = async (vw, web) => { const p = await (await b.newContext({ viewport: { width: vw, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
    if (web) await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => document.body.classList.add('agmk-web')));
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3500);
    await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); themeApply('classic', true); openScreen('screen-main'); window.dispatchEvent(new Event('agmk:login')); });
    await p.waitForTimeout(2200); return p; };

  // ---------- 6, 13: bosh sahifa tepasi E (telefon) ----------
  let p = await page(412);
  let r = await p.evaluate(() => { const h = document.getElementById('d60h'); const top = h.querySelector('.d60-top'), dk = [...h.querySelectorAll('.e61-bn .d60-dock .d60-d')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.textContent.trim());
    return { e61: h.classList.contains('e61'), qr: !!top.querySelector('[data-k="qr"]'), info: !!top.querySelector('[data-k="info"]'), ur: !!top.querySelector('.e61-ur .e61-un') && !!top.querySelector('.e61-ur .e61-re'), dk: dk, srVis: getComputedStyle(h.querySelector('.e61-sr')).display,
      urIcons: [...top.querySelectorAll('.e61-ur svg path')].length, who: (h.querySelector('.e61-who') || {}).textContent || '', oldBn: getComputedStyle(h.querySelector('.d60-bn')).display, ttR: h.querySelector('.d60-tt b').getBoundingClientRect().right, urL: top.querySelector('.e61-ur').getBoundingClientRect().left }; });
  ok(r.e61 && !r.qr && r.info && r.ur, '6: tepada ↶ ↷ (bitta qobiq), ⓘ; QR tugmasi yoʻq ' + JSON.stringify({ qr: r.qr, info: r.info, ur: r.ur }));
  ok(JSON.stringify(r.dk) === JSON.stringify(['Chat', 'Vazifalar', 'Nosozlik', 'Yuklangan', 'Qidiruv', 'Skaner']) || JSON.stringify(r.dk) === JSON.stringify(['Chat', 'Vazifalar', 'Yuklangan', 'Qidiruv', 'Skaner']), '6/13: banner ichida tugmalar (Kamchilik → Nosozlik) ' + JSON.stringify(r.dk));
  ok(r.urIcons >= 4, '6: ↶ ↷ belgilari chizilgan (boʻsh kvadrat emas)');
  ok(r.srVis === 'none' && r.oldBn === 'none' && /SANOAT TEMIR/.test(r.who), '6: qidiruv yopiq, banner maʼlumoti koʻrinadi');
  ok(r.urL - r.ttR >= 6, '6: ↶ ↷ «AGMK-STTB» yozuviga tegmaydi (oraliq ' + Math.round(r.urL - r.ttR) + ' px)');
  await p.evaluate(() => document.querySelector('#d60h [data-k="srch"]').click()); await p.waitForTimeout(200);
  r = await p.evaluate(() => { const h = document.getElementById('d60h'), sr = h.querySelector('.e61-sr'); return { vis: getComputedStyle(sr).display, inp: !!sr.querySelector('input.search-box, input'), foc: document.activeElement && sr.contains(document.activeElement), on: h.querySelector('[data-k="srch"]').classList.contains('on'), below: sr.getBoundingClientRect().top >= h.querySelector('.e61-bn').getBoundingClientRect().bottom - 1 }; });
  ok(r.vis === 'flex' && r.inp && r.on && r.below, '6: «Qidiruv» — banner ostida qidiruv maydoni ochildi ' + JSON.stringify(r));
  await p.evaluate(() => document.querySelector('#d60h .e61-x').click()); await p.waitForTimeout(150);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('#d60h .e61-sr')).display === 'none'), '6: ✕ — qidiruv yopildi');
  r = await p.evaluate(() => { let n = 0; const o = window.qrScanOpen; window.qrScanOpen = () => { n++; }; document.querySelector('#d60h [data-k="scan"]').click(); window.qrScanOpen = o; let u = 0; const ou = window.undoAction; window.undoAction = () => { u++; }; document.querySelector('#d60h .e61-un').click(); window.undoAction = ou; return { n, u }; });
  ok(r.n === 1 && r.u === 1, '6: «Skaner» — jonli skaner, ↶ — ortga qaytarish ' + JSON.stringify(r));
  // 7: suv belgisi
  r = await p.evaluate(() => { try { secShield(true, true); } catch (e) {} const el = document.getElementById('secWm'); return !el || getComputedStyle(el).display === 'none'; });
  ok(r, '7: suv belgisi chiqmaydi');
  // 8: server QR — jonli skaner
  r = await p.evaluate(() => { try { syncOpen(); } catch (e) {} const lv = document.querySelector('#syncBox .srv-lan .u61-live'); const gal = document.querySelector('#syncBox .srv-lan label.u61-gal input'); let n = 0, md = ''; const o = window.qrScanOpen; window.qrScanOpen = m => { n++; md = m; }; if (lv) lv.click(); window.qrScanOpen = o; return { lv: !!lv, cap: gal ? gal.hasAttribute('capture') : null, n, md }; });
  ok(r.lv && r.n === 1 && r.md === 'srv' && r.cap === false, '8: Server oynasida jonli skaner tugmasi, galereya zaxira ' + JSON.stringify(r));
  // 12: Buxgalteriya va Iqtisodiyot
  r = await p.evaluate(async () => { openBxHome(); await new Promise(r => setTimeout(r, 500)); const s = document.getElementById('screen-bxi'); const ic = [...s.querySelectorAll('.btn-card .btn-icon')]; return { h59: !!s.querySelector('.h59x'), crumb: (s.querySelector('.h59-crumb') || {}).textContent || '', white: ic.length && ic.every(e => /255, 255, 255/.test(getComputedStyle(e).backgroundColor)), hgt: Math.min(...[...s.querySelectorAll('.btn-card')].map(c => c.offsetHeight)) }; });
  ok(r.h59 && /Moliya/.test(r.crumb) && r.white && r.hgt >= 80, '12: Buxgalteriya va Iqtisodiyot — sarlavha va anʼanaviy kartochka ' + JSON.stringify(r));
  // 15: Struktura .st-n
  r = await p.evaluate(async () => { openStruct(); await new Promise(r => setTimeout(r, 1200)); const bad = [...document.querySelectorAll('#stCv *')].filter(e => !e.closest('.st-box') && !e.closest('.st-leg') && (getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(getComputedStyle(e).borderTopWidth) > 0) && e.classList.contains('st-n')); return bad.length; });
  ok(r === 0, '15: Struktura tugunlarida shaffof qoramtir fon/ramka yoʻq (' + r + ')');
  r = await p.evaluate(() => { const d = document.createElement('span'); d.className = 'st-n'; document.body.appendChild(d); const bg = getComputedStyle(d).backgroundColor; d.remove(); return bg; });
  ok(r !== 'rgba(0, 0, 0, 0)', '15: SVO davomatdagi «n» holat belgisi avvalgidek (' + r + ')');
  // 11: GPS demo tezligi
  r = await p.evaluate(() => { const L0 = LVD.items, c0 = LVD.clock; LVD.items = []; LVD.clock = 0; const out = {}; for (const k of [0, 0.5, 1, 3]) { g61SetSpd(k); LVD.clock = 0; lvDemoStep(10); out[k] = LVD.clock; } LVD.clock = 0; lvDemoStep(30); out.w = LVD.clock; LVD.items = L0; LVD.clock = c0; g61SetSpd(1); return out; });
  ok(r[0] === 0 && r[0.5] === 500 && r[1] === 1000 && r[3] === 3000 && r.w === 30000, '11a: demo tezligi ⏸/0,5×/1×/3× (1× — haqiqiy), oldindan hisob oʻzgarmadi ' + JSON.stringify(r));
  r = await p.evaluate(() => { const v = (vagonlarData || []).find(x => x.kind === 'lok'); if (!v) return { skip: 1 }; const route = [[40.85, 69.6], [40.851, 69.6], [40.852, 69.6], [40.853, 69.6]]; const cum = [0, 111, 222, 333];
    const d = { i: 0, D: { nm: 'Soxta', kmh: 20 }, v: v, route, cum, len: 333, f: 0.9, dir: 1, pause: 0, spd: 0, trail: [], pos: { lat: 40.8527, lon: 69.6 } }; const keep = { on: LVD.on, items: LVD.items, park: LVD.park };
    LVD.on = true; LVD.park = 'rail'; LVD.items = [d]; g61Tails(); const n = (d.g61v || []).length, p = typeof g61Tails === 'function'; Object.assign(LVD, keep); return { n, p }; });
  ok(r.skip || (r.n >= 6 && r.n <= 13), '11b: demo lokomotivga 6–13 vagon biriktiriladi ' + JSON.stringify(r));
  // 14: shikoyat — server yozuvi
  r = await p.evaluate(() => { saveFeedback([{ id: 'fb_s1', no: 1, type: 'Shikoyat', text: 'Soxta shikoyat', files: [], by: { name: 'Soxta', tabel: '99001', role: 'editor' }, at: '2026-11-03T05:00:00Z', seen: true, done: false }]);
    const out = syncLocal().filter(x => x.kind === 'fb'); syncApply({ id: 'fb:fb_s2', kind: 'fb', data: { id: 'fb_s2', no: 2, type: 'Taklif', text: 'Soxta taklif', files: [], by: { name: 'Boshqa', tabel: '99002' }, at: '2026-11-03T06:00:00Z', done: false } });
    const L = getFeedback(); saveFeedback([]); return { push: out.map(x => x.id), got: L.map(x => x.id + ':' + x.seen) }; });
  ok(r.push.includes('fb:fb_s1') && r.got.includes('fb_s2:false'), '14: shikoyat serverga ketadi, boshqa telefondagisi adminga keladi (yangi) ' + JSON.stringify(r));
  // 20: mavzular
  r = await p.evaluate(async () => { const out = {}; for (const t of ['classic2', 'vitrina2', 'classic']) { themeApply(t, true); await new Promise(r => setTimeout(r, 150)); const bi = getComputedStyle(document.body, '::before').backgroundImage; out[t] = { base: document.body.getAttribute('data-theme'), poly: document.body.classList.contains('th-poly'), img: /data:image\/jpeg/.test(bi), saved: localStorage.getItem(AGMK_THEME_KEY), bn: getComputedStyle(document.querySelector('#d60h .e61-bn')).backgroundImage }; } return out; });
  ok(r.classic2.base === 'classic' && r.classic2.poly && r.classic2.img && r.classic2.saved === 'classic2' && r.classic2.bn === 'none', '20: STTB Klassik 2 — yagona poligon rasm, banner rasmsiz shisha ' + JSON.stringify(r.classic2).slice(0, 160));
  ok(r.vitrina2.base === 'vitrina' && r.vitrina2.poly && r.vitrina2.img, '20: Vitrina 2 — Vitrina tuzilishi + poligon rasm');
  ok(r.classic.base === 'classic' && !r.classic.poly, '20: Klassik — avvalgidek');
  ok(await p.evaluate(() => AGMK_THEMES.some(x => x[0] === 'classic2') && AGMK_THEMES.some(x => x[0] === 'vitrina2')), '20: mavzular roʻyxatida ikkala yangi mavzu');
  // 19: QR yorliqlar 35 ta
  r = await p.evaluate(() => { const L = (vagonlarData || []).filter(v => !v.kind).slice(0, 40); if (L.length < 36) return { skip: L.length }; const lay = r61Layout35(L); return { pages: lay.pages.length, n1: lay.pages[0].filter(o => o.k === 't' && /^VAGON №$/.test(o.s)).length, n2: lay.pages[1].filter(o => o.k === 't' && /^VAGON №$/.test(o.s)).length, foot: lay.pages[0].some(o => o.k === 't' && /skanerlang/.test(o.s)) }; });
  ok(r.skip !== undefined || (r.pages === 2 && r.n1 === 35 && r.n2 === 5 && !r.foot), '19: 40 vagon → 2 varaq (35 + 5), pastki izoh yoʻq ' + JSON.stringify(r));
  r = await p.evaluate(async () => { const v = (vagonlarData || []).find(v => !v.kind); const u = r61QrSvg(qrText(v)); const im = new Image(); im.src = u; await im.decode(); const c = document.createElement('canvas'); c.width = c.height = 300; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 300, 300); g.drawImage(im, 0, 0, 300, 300);
    const J = typeof q3Jsqr === 'function' ? q3Jsqr() : (window.jsQR || null); let t = null; if (J) { const q = J(g.getImageData(0, 0, 300, 300).data, 300, 300); t = q && q.data; } return { t, want: qrText(v) }; });
  ok(r.t === r.want, '18/19: QR kod oʻqiladi va havola mos ' + JSON.stringify(r));

  // 16: skladlar — Excel filtri kabi
  r = await p.evaluate(async () => { const keep = { o: window.hsF30Of, j: window.hsJsonGet }; const items = [{ sklad: '31 18 9202', sum: 100 }, { sklad: '31 18 9203', sum: 50 }, { sklad: '31 18 9203', sum: 70 }, { sklad: '31 18 9205', sum: 10 }, { sklad: '', sum: 5 }];
    window.hsF30Of = () => [{ ref: 'soxta', month: '2026-10' }]; window.hsJsonGet = async () => ({ items: items });
    const all0 = (await hsF30Rows({ ref: 'soxta' }, 'vagon')).length;
    await f61Open('vagon'); const rows = [...document.querySelectorAll('#f61Box .f61-l .f61-r')].map(x => x.textContent.replace(/\s+/g, ' ').trim());
    ['31 18 9203', '31 18 9205'].forEach(k => { const i = document.querySelector('#f61Box .f61-l input[data-k="' + k + '"]'); i.checked = true; f61T(i); }); f61Apply(false);
    const sel = (await hsF30Rows({ ref: 'soxta' }, 'vagon')).length; f61Off('vagon'); const back = (await hsF30Rows({ ref: 'soxta' }, 'vagon')).length;
    window.hsF30Of = keep.o; window.hsJsonGet = keep.j; return { all0, rows, sel, back }; });
  ok(r.rows.length === 4 && r.rows.some(t => /9203.*2 qator/.test(t)) && r.rows.some(t => /Boʻsh/.test(t)) && r.sel === 3 && r.back === 5 && r.all0 === 5, '16: skladlar roʻyxati fayldan (qator soni bilan), tanlansa — faqat shular, ✕ — avtomatik ' + JSON.stringify(r).slice(0, 200));
  // 18: pasport PDF — QR va tanlash
  r = await p.evaluate(async () => { const v = (vagonlarData || []).find(x => !x.kind); openPassport(v.id); await new Promise(r => setTimeout(r, 700)); r61Pre('all'); const D1 = p8Collect(); const B1 = p8Blocks(D1);
    R61P.D = D1; r61Pre('kom'); const D2 = p8Collect(); const B2 = p8Blocks(D2); r61Pre('all');
    return { qr: !!D1.qr && /qr61/.test(B1[0].h) && !/class="st"/.test(B1[0].h), qrT: D1.qrT, m2: D2.main.map(x => x[0]), s2: D2.S.length, sg2: B2.some(b => /class="sg"/.test(b.h || '')), sg1: B1.some(b => /class="sg"/.test(b.h || '')) }; });
  ok(r.qr && /№/.test(r.qrT || ''), '18a: pasport PDF sarlavhasida QR kod (Soz oʻrnida) — ' + r.qrT);
  ok(r.m2.length >= 1 && r.m2.every(t => /inventar|ishlab chiqarilgan|chiqarilgan yil|model/i.test(t)) && r.s2 === 0 && !r.sg2 && r.sg1, '18b: «Komissiya uchun qisqa» — faqat QR, inventar, yil, model ' + JSON.stringify(r.m2));

  // qoʻngʻiroq tugmasi (xodim pasporti) — raqam serverdan, faylda yoʻq
  r = await p.evaluate(async () => { const keep = { f: window.sbFetch, c: window.syncCfg, o: window.chatOpenLink }; const asked = [], opened = [];
    window.syncCfg = () => ({ url: 'https://10.0.0.1:8443' }); window.sbFetch = async (u) => { asked.push(u); return { phones: ['+998900000001'] }; }; window.chatOpenLink = u => opened.push(u);
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Linux; Android 14) Mobile', configurable: true });
    sectionItemsDB.xodim = sectionItemsDB.xodim || {}; (sectionItemsDB.xodim['Soxta boʻlim'] = sectionItemsDB.xodim['Soxta boʻlim'] || []).push({ id: 'xs61', tabel: '99061', name: 'Soxta Xodim', lavozim: 'Usta' });
    let b = null; try { xtOpenXodim('xs61'); } catch (e) {} await new Promise(r => setTimeout(r, 600)); c61Btn(); b = document.getElementById('c61B');
    if (b) { b.click(); await new Promise(r => setTimeout(r, 300)); }
    Object.assign(window, { sbFetch: keep.f, syncCfg: keep.c, chatOpenLink: keep.o }); return { b: !!b, asked, opened, inHtml: /998900000001/.test(document.documentElement.outerHTML) }; });
  ok(r.b && r.asked.includes('/api/my/v1/tel?t=99061') && r.opened[0] === 'tel:+998900000001', 'qoʻngʻiroq: tugma bor, raqam serverdan olinadi, telefon oynasi raqam bilan ochiladi ' + JSON.stringify(r));
  await p.close();

  // ---------- 9: Web ----------
  p = await page(1400, true);
  r = await p.evaluate(() => { const bn = document.querySelector('#d60h .e61-bn'), dk = bn.querySelector('.d60-dock'); const cs = getComputedStyle(dk); const L = document.getElementById('main-card-list'); return { row: getComputedStyle(bn).flexDirection, cols: cs.gridTemplateColumns.split(' ').length, right: dk.getBoundingClientRect().left > bn.getBoundingClientRect().left + bn.offsetWidth / 2, grid: getComputedStyle(L).gridTemplateColumns.split(' ').length }; });
  ok(r.row === 'row' && r.cols === 3 && r.right && r.grid === 3, '9: Web — tugmalar oʻngda 3 × 2, kartochkalar 3 ustun ' + JSON.stringify(r));
  await p.keyboard.press('Control+k'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('d60h').classList.contains('e61-sopen')), '9: Ctrl+K — qidiruv ochildi');
  await p.evaluate(() => themeApply('vitrina', true)); await p.waitForTimeout(400);
  r = await p.evaluate(() => { const h = document.getElementById('d60h'); return { vit: h.classList.contains('d60-vit'), bi: getComputedStyle(h.querySelector('.e61-bn')).backgroundImage }; });
  ok(r.vit && /gradient/.test(r.bi) && !/url\(/.test(r.bi), '10: Vitrina — banner rasmsiz qoramtir kartochka ' + JSON.stringify(r).slice(0, 120));
  await p.close();
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
