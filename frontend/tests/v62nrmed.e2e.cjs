// 6.2: normani hujjat sahifasida tahrirlash — jonli jadval, miqdor, yangi qator, olib tashlash, yangi norma, tekshiruvga ulanish. Faqat SOXTA maʼlumot.
//   node frontend/tests/v62nrmed.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  await p.evaluate(() => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked');
    // soxta «ilova ichidagi» norma (haqiqiysi — frontend/private/NORMS.json)
    const seed = { id: 'nb52_0', title: '2099 SOXTA meʼyor 2VS-105 KR', kind: '105', rt: 'KR', year: 2099, file: 'soxta', sheet: '', items: [
      { no: '1', name: 'Soxta list δ 4', unit: 'кг', q: '1200', grp: 'Materiallar' }, { no: '2', name: 'Soxta vtulka', unit: 'шт', q: '20', grp: 'Ehtiyot qismlar' }] };
    NRM52_SETS.length = 0; NRM52_SETS.push(seed);
    ND_BUILTIN.push({ id: 'nrm52_0', code: 'Meʼyor 2099 · 2VS-105', cat: 'vagon', year: 2099, conf: 1, langs: ['uz', 'ru'], title: { uz: seed.title, ru: seed.title },
      items: [{ t: 'p', n: '', uz: 'soxta', ru: 'soxta' }, { t: 'table', n: '1', cap_uz: seed.title, cap_ru: seed.title, unit_uz: '', unit_ru: '', uz: '<table></table>', ru: '<table></table>' }] });
    const db = nrmDB(); db.sets = db.sets.filter(s => s.id !== 'nb52_0'); db.sets.push(JSON.parse(JSON.stringify(seed))); nrmSaveDB(db);
    let q = []; window.uiPrompt = async () => q.shift(); window.uiConfirm = async () => true; window.__q = a => { q = a.slice(); };
  });
  const tbl = () => p.evaluate(() => { const t = gostDoc('nrm52_0').items.find(i => i.t === 'table').uz; return t; });
  let t = await tbl();
  ok(/nr62-bar/.test(t) && /Tahrirlash/.test(t) && /Soxta list δ 4/.test(t) && />1200</.test(t), 'hujjat sahifasida: jadval bazadan, «Tahrirlash» tugmasi bor');
  // 1) miqdorni oʻzgartirish (mavjud muharrir) → sahifada ham, tekshiruvda ham yangi qiymat
  await p.evaluate(async () => { __q(['1350', 'Buyruq №99 (soxta)']); await nrmEditQ('nb52_0', 0); });
  t = await tbl();
  const pick = await p.evaluate(() => { const s = nrmPick(nrmDB(), '105', 'KR', 2099); return s && s.items[0].q; });
  ok(/>1350 ✏️</.test(t) && pick === '1350', 'miqdor 1200 → 1350: sahifada va tekshiruv algoritmida (nrmPick) — ' + pick);
  // 2) yangi qator
  await p.evaluate(async () => { __q(['Soxta tormoz kolodkasi', 'шт', '16', 'Ehtiyot qismlar', 'Buyruq №100']); await nrm62Add('nb52_0'); });
  t = await tbl();
  const it = await p.evaluate(() => nrmPick(nrmDB(), '105', 'KR', 2099).items.map(x => x.name + ':' + x.q + ':' + x.grp));
  ok(/Soxta tormoz kolodkasi/.test(t) && /yangi/.test(t) && it[2] === 'Soxta tormoz kolodkasi:16:Ehtiyot qismlar', 'yangi qator guruh oxirida, sahifada «yangi» belgisi: ' + it.join(' | '));
  // 3) olib tashlash
  await p.evaluate(async () => { __q(['Buyruq №101']); await nrm62Del('nb52_0', 1); });
  const it2 = await p.evaluate(() => nrmPick(nrmDB(), '105', 'KR', 2099).items.map(x => x.name));
  ok(it2.length === 2 && !it2.includes('Soxta vtulka'), 'qator olib tashlandi: ' + it2.join(' | '));
  // 4) tarix va versiya
  const h = await p.evaluate(() => { const s = nrmPick(nrmDB(), '105', 'KR', 2099); return { v: s.ver, n: (s.hist || []).length, a: (s.hist || []).map(x => x.a).join(' ; ') }; });
  ok(h.n === 3 && h.v >= 4 && /Buyruq №99/.test(h.a) && /Yangi qator/.test(h.a) && /Olib tashlandi/.test(h.a), 'tarix: 3 yozuv, versiya ' + h.v);
  // 5) muharrir oynasida ➕ va 🗑 tugmalari
  const ui = await p.evaluate(async () => { nrmView('nb52_0'); await new Promise(r => setTimeout(r, 200)); const m = document.getElementById('nrmModal'); return { add: !!m.querySelector('.nr62-add'), del: m.querySelectorAll('.nr62-del').length }; });
  ok(ui.add && ui.del === 2, 'muharrirda «➕ Yangi qator» va har qatorda 🗑: ' + JSON.stringify(ui));
  // 6) yangi norma (yangi tur) → tekshiruv shu yil uchun topadi
  const nw = await p.evaluate(async () => { __q(['hop', 'DR', '2100', 'SOXTA xopper DR 2100']); await nrm62New(); const s = nrmPick(nrmDB(), 'hop', 'DR', 2100); return s ? s.title + '|' + s.items.length : null; });
  ok(nw === 'SOXTA xopper DR 2100|0', 'yangi norma yaratildi va tekshiruvga ulandi: ' + nw);
  // 8) uchidan-uchiga: hisobot tekshiruvi (nrmEval) tahrirlangan va yangi qoʻshilgan meʼyor bilan ishlaydi
  const ev = await p.evaluate(() => {
    const blk = (items) => ({ kind: '105', rt: 'KR', year: 2099, N: 1, items: items.map(x => Object.assign({ n1: null, src: '' }, x)) });
    const r1 = nrmEval(blk([{ name: 'Soxta list δ 4', unit: 'кг', fakt: 1300 }, { name: 'Soxta tormoz kolodkasi', unit: 'шт', fakt: 20 }]));
    const r2 = nrmEval(blk([{ name: 'Soxta list δ 4', unit: 'кг', fakt: 1400 }, { name: 'Soxta tormoz kolodkasi', unit: 'шт', fakt: 16 }]));
    const red = r => r.F.filter(f => f.t === 'nrmf').map(f => f.name);
    return { a: red(r1), b: red(r2) };
  });
  ok(ev.a.length === 1 && ev.a[0] === 'Soxta tormoz kolodkasi', 'tekshiruv: list 1300 ≤ yangi meʼyor 1350 — xato emas; kolodka 20 > yangi qator 16 — ❌: ' + JSON.stringify(ev.a));
  ok(ev.b.length === 1 && ev.b[0] === 'Soxta list δ 4', 'tekshiruv: list 1400 > 1350 — ❌; kolodka 16 = 16 — xato emas: ' + JSON.stringify(ev.b));
  // 7) huquqi yoʻq foydalanuvchi — tugmalar yoʻq
  const ro = await p.evaluate(() => { const _c = nrmCanEdit; nrmCanEdit = () => false; const t = gostDoc('nrm52_0').items.find(i => i.t === 'table').uz; nrmCanEdit = _c; return /Tahrirlash/.test(t); });
  ok(!ro, 'huquqi yoʻq xodimga «Tahrirlash» koʻrinmaydi');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.join(' ; '));
  await b.close(); console.log(F ? `❌ ${F} ta xato` : '✅ Hammasi toʻgʻri'); process.exit(F ? 1 : 0);
})();
