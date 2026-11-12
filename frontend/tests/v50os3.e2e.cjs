// 5.0: 📊 ОС-3 — M-30 + naryadlar + «Затраты» (pivot kesh) → ОС-3 va vagon kalkulyatsiyalari. Faqat SOXTA maʼlumot (fayllarni sinovning oʻzi yasaydi):
//   node frontend/tests/v50os3.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked');
    const o = {}, bin2ab = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u.buffer; },
      ab = wb => bin2ab(XLSX.write(wb, { type: 'binary', bookType: 'xlsx' })),
      // SheetJS 0.8.20 da book_new / aoa_to_sheet yoʻq — qoʻlda
      aoa = d => { const ws = {}; let C = 0; d.forEach((r, i) => r.forEach((v, j) => { if (v == null) return; ws[XLSX.utils.encode_cell({ r: i, c: j })] = { v: v, t: typeof v === 'number' ? 'n' : 's' }; if (j > C) C = j; })); ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: d.length - 1, c: C } }); return ws; },
      book = (ws, n) => ({ SheetNames: [n], Sheets: { [n]: ws } });
    // --- soxta M-30: 5 qator sarlavha, keyin maʼlumot (A Требование, D Номен, E Номенклатура, F Ед, J ШПЗ, M Кол-во, N Цена, O Сумма)
    const m = [[], ['Параметры:', null, 'Подразделение: 31'], [null, null, 'Стандартный период: 01.05.2099 - 31.05.2099'], [], ['Требование', null, null, 'Номен номер', 'Номенклатура', 'Ед изм', null, 'Склад', 'Счет', 'ШПЗ', 'Дата', 'Аналитика', 'Количество', 'Цена', 'Сумма']];
    const row = (sh, name, ed, q, pr) => ['1', null, null, '9', name, ed, null, '31', '10.10', sh, null, null, q, pr, Math.round(q * pr * 100) / 100];
    m.push(row('222101', 'Soxta detal A', 'шт', 2, 1000), row('222101', 'Soxta detal B uzun nomli material qatori ikki qatorga oʻraladi', 'кг', 10.5, 200), row('222202', 'Soxta detal C', 'шт', 1, 5000), row('221000', 'Boshqa sex', 'шт', 1, 7));
    const wm = book(aoa(m), 'TDSheet');
    // --- soxta naryad: C — ish, J — bajarilgan ulush, L — расценка; J boʻsh qator hisobga olinmaydi
    const n = []; for (let i = 0; i < 9; i++) n.push([]);
    n.push([null, null, 'Кап.рем.д-р. 2вс-105 зав.№ 90001- 100%', null, null, null, null, null, 'шт', 1, 100, 3000]);
    n.push([null, null, 'Кап.рем.д-р. 2вс-105 зав.№ 00090002- 50%', null, null, null, null, null, 'шт', 0.5, 100, 2000]);
    n.push([null, null, 'Кап.рем.д-р. 2вс-105 зав.№ 90002- 50%', null, null, null, null, null, 'шт', null, 100, 9999]);
    n.push([null, null, 'Кап. Рем.д.р. Хоппер дозатор 07', null, null, null, null, null, 'шт', null, 100, 8888]);
    n.push(['Утверждаю к оплате в сумме :']);
    const wn = book(aoa(n), 'Soxta brigada');
    // --- soxta «Затраты»: faqat pivot kesh (свод) — что / ш\з Б / ш\з / цех / сумма / сумма с 16
    const recs = [['02 материалы', 2220, '222101', 92, 4100, 4110], ['01 топливо', 2220, '222101', 92, 50, 50], ['02 материалы', 2220, '222202', 92, 5000, 5012.5], ['02 материалы', 2220, '222303', 92, 77, 77.7],
      ['03 зар.плата', 2220, '222000', 92, 9000, 9000], ['07 спецпитание БП', 2220, '222000', 92, 1000, 1000], ['04 соц.налог', 2220, '222000', 92, 1080, 1080], ['07 спецпитание БП с/налог', 2220, '222000', 92, 120, 120],
      ['03 зар.plata boshqa sex', 2210, '221000', 92, 5, 5], ['02 материалы', 2220, '222101', 93, 999, 999]];
    const F = ['что', 'ш\\з Б', 'ш\\з', 'цех', 'сумма', 'сумма с 16'];
    const def = `<?xml version="1.0"?><pivotCacheDefinition xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cacheSource type="worksheet"><worksheetSource ref="A1:F11" sheet="свод"/></cacheSource><cacheFields count="6">${F.map((f, i) => i === 0 ? `<cacheField name="${f}"><sharedItems>${[...new Set(recs.map(x => x[0]))].map(s => `<s v="${s}"/>`).join('')}</sharedItems></cacheField>` : `<cacheField name="${f}"><sharedItems/></cacheField>`).join('')}</cacheFields></pivotCacheDefinition>`;
    const cats = [...new Set(recs.map(x => x[0]))];
    const rec = `<?xml version="1.0"?><pivotCacheRecords xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${recs.map(x => `<r><x v="${cats.indexOf(x[0])}"/><n v="${x[1]}"/><s v="${x[2]}"/><n v="${x[3]}"/><n v="${x[4]}"/><n v="${x[5]}"/></r>`).join('')}</pivotCacheRecords>`;
    const z = new JSZip(); z.file('xl/pivotCache/pivotCacheDefinition1.xml', def); z.file('xl/pivotCache/pivotCacheRecords1.xml', rec);
    const zb = z.generate({ type: 'arraybuffer' });
    // --- hisob
    OS3.inv = { '90001': '38101', '90002': '37202' }; OS3.tuz = [];
    const M = os3M30(ab(wm)), N = os3Naryad([{ name: 'n.xlsx', buf: ab(wn) }]), Z = os3Zatrat(zb), d = os3Calc(M, N, Z);
    o.per = M.per; o.zp = Z.zp; o.sc = Z.sc;
    o.V = d.ok.map(x => [x.v, x.sh, x.F, x.D, x.H, x.ZP, x.SC, x.T, x.items.length]); o.left = d.left; o.warn = d.warn; o.tot = d.tot;
    // tuzatish va inventar raqami yoʻq holat
    OS3.tuz = [{ v: '90001', s: 100, iz: 'soxta tuzatish' }]; const d2 = os3Calc(M, N, Z); o.tuz = d2.ok[0].D;
    OS3.inv = { '90001': '38101' }; OS3.tuz = []; const d3 = os3Calc(M, N, Z); o.noinv = d3.V.some(x => x.noinv && x.v === '90002') && d3.warn.some(w => /90002/.test(w));
    OS3.inv = { '90001': '38101', '90002': '37202' };
    // Excel
    const xb = await os3Xlsx(d, 'Май 2099').arrayBuffer(), wx = XLSX.read(o3Bin(xb), { type: 'binary' });
    o.sheets = wx.SheetNames; const s1 = wx.Sheets['90001'];
    o.xA2 = s1.A2 && s1.A2.v; o.xE4 = s1.E4 && s1.E4.v; o.xItogo = Object.keys(s1).filter(k => /^B\d+$/.test(k) && /ИТОГО|Итого затрат|Начальник ПТО/.test(s1[k].v)).length;
    o.merge = (s1['!merges'] || []).length;
    // PDF
    try { const pb = os3Html(d, 'Май 2099'); o.html = /page-break-after/.test(pb) && /Капитальный ремонт/.test(pb); } catch (e) { o.html = 'ERR ' + e.message; }
    // UI: Dalolatnomalar → ОС-3
    o.cat = Array.isArray(HS_AKT) && HS_AKT.some(c => c.k === 'os3');
    OS3.f = { m30: { name: 'm30.xlsx', buf: ab(wm) }, nar: [{ name: 'n.xlsx', buf: ab(wn) }], zat: { name: 'z.xlsx', buf: zb } }; OS3.m = '2099-05';
    os3Open(); os3Run(); await new Promise(r => setTimeout(r, 200));
    o.ui = !!document.querySelector('#os3Res .os3-t table') && /90001/.test(document.querySelector('#os3Res').textContent);
    let got = null; const ex = window.exOpen; window.exOpen = (f) => { got = f; }; os3Out('xlsx'); window.exOpen = ex; o.out = !!(got && got[0] && /OS-3_2099-05\.xlsx/.test(got[0].name));
    o.hist = /2099-05/.test(localStorage.getItem('agmk_os3_list') || '');
    return o;
  });
  // qoʻlda hisoblangan kutilgan qiymatlar:
  //  M-30: 222101 = 2000 + 2100 = 4100 (2 qator); 222202 = 5000. Затраты (2220/92): 222101 с16 = 4110 + 50 = 4160; 222202 = 5012.5; 222303 = 77.7 (roʻyxatda yoʻq → qoldiq)
  //  ZP = 9000 + 1000 = 10000; SC = 1080 + 120 = 1200. Naryad: 90001 = 1×3000; 90002 = 0.5×2000 = 1000 (J boʻsh qator va xopper — hisobga olinmaydi). Ulush 0.75 / 0.25
  ok(r.per === '01.05.2099 - 31.05.2099', 'M-30 davri oʻqildi');
  ok(Math.abs(r.zp - 10000) < 1e-9 && Math.abs(r.sc - 1200) < 1e-9, 'Затраты: ish haqi 03+07БП, soc.strax 04+07БП с/налог (faqat 2220 / 92)');
  const V = JSON.stringify(r.V);
  ok(V === JSON.stringify([['90001', '222101', 4100, 4160, 3000, 7500, 900, 12560, 2], ['90002', '222202', 5000, 5012.5, 1000, 2500, 300, 7812.5, 1]]), 'vagonlar: ШПЗ=222+inv[-3:], M-30, с16 (01 топливо ham), ulush, ZP, SC, jami ' + V);
  ok(JSON.stringify(r.left) === JSON.stringify([{ sh: '222303', D: 77.7 }]), 'qolib ketgan material (roʻyxatda yoʻq ШПЗ)');
  ok(Math.abs(r.tot.T - (4160 + 5012.5 + 77.7 + 10000 + 1200)) < 0.001, 'ИТОГО: jami = materiallar + qoldiq + ZP + SC');
  ok(r.tuz === 4260, 'shifr zatrat tuzatishi materiallarga qoʻshiladi');
  ok(r.noinv === true, 'inventar raqami yoʻq vagon — ogohlantirish va qoʻlda kiritish');
  ok(JSON.stringify(r.sheets) === JSON.stringify(['ОС-3', '90001', '90002']), 'Excel: ОС-3 + har vagonga varaq');
  ok(/Капитальный ремонт Думпкар типа 2ВС-105т\. № 90001/.test(r.xA2) && r.xE4 === 'Инв № 38101' && r.xItogo === 3 && r.merge === 3, 'Excel: muallif shabloni (sarlavha, inv, ИТОГО, imzolar, birlashtirilgan kataklar)');
  ok(r.html === true, 'PDF uchun sahifalar');
  ok(r.cat && r.ui && r.out && r.hist, 'Dalolatnomalar → ОС-3: oyna, hisob jadvali, Excel, tarix');
  ok(!errs.length, 'sahifa xatolari yoʻq ' + errs.slice(0, 2).join(' | '));
  console.log(F ? `❌ ${F} ta xato` : '✅ hammasi oʻtdi'); await b.close(); process.exit(F ? 1 : 0);
})();
