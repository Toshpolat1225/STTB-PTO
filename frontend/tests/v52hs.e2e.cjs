// 5.2: hisobot tekshiruvi — Forma-30 oyi (ikkala 1C shakli), rasm hisobot bulutga yuborilmaydi. Faqat SOXTA maʼlumot.
//   node frontend/tests/v52hs.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const dlg = []; p.on('dialog', d => { dlg.push(d.message()); d.accept(); });
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked');
    const head = per => [['Форма 30 (soxta)'], ['Параметры:', null, 'Стандартный период: ' + per], [], ['Требование', 'Номен номер', 'Номенклатура', 'Ед изм', 'Склад', 'ШПЗ', 'Количество', 'Цена', 'Сумма'], ['1 Т-1', '9', 'Soxta detal', 'шт', '31', '222101', 2, 10, 20]];
    const o = {};
    o.p1 = hsF30Period(head('2099/05/01 - 2099/05/31')); o.p2 = hsF30Period(head('01.05.2099 - 31.05.2099')); o.p3 = hsF30Period([['Soxta'], ['sana yoʻq']]);
    o.f1 = (hpParseF30(head('2099/03/01 - 2099/03/31'), {}) || {}).month; o.f2 = (hpParseF30(head('01.03.2099 - 31.03.2099'), {}) || {}).month;
    o.f2n = ((hpParseF30(head('01.03.2099 - 31.03.2099'), {}) || {}).items || []).length;
    // rasm hisobot: bulut AI chaqirilmaydi
    let calls = 0; window.aiaktCloud = async () => { calls++; return { rows: [] }; }; window.aiCloudReady = () => true;
    try { await hsReadImageAI(new File([new Uint8Array([1, 2, 3])], 'hisobot.jpg', { type: 'image/jpeg' })); o.img = 'oʻtib ketdi'; } catch (e) { o.img = String(e.message || e); }
    o.calls = calls;
    // haqiqiy yoʻl: «Hisobotni tekshirish» → rasm fayli
    const inp = document.createElement('input'); inp.type = 'file'; const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array([1, 2, 3])], 'foto.jpg', { type: 'image/jpeg' })); inp.files = dt.files;
    await hsCheckStart('vagon', inp); await new Promise(r => setTimeout(r, 300)); o.calls2 = calls; o.pend = !!(HS.pend); o.warn = /Excel yoki PDF/.test(document.body.innerText);
    return o;
  });
  ok(r.p1 === '2099-05' && r.p2 === '2099-05' && r.p3 === '', 'oddiy tekshiruv — Forma-30 oyi: ' + [r.p1, r.p2, r.p3].join(' / '));
  ok(r.f1 === '2099-03' && r.f2 === '2099-03' && r.f2n === 1, 'oylik toʻplam — Forma-30 oyi: ' + r.f1 + ' / ' + r.f2 + ' (' + r.f2n + ' qator)');
  ok(/qabul qilinmaydi/.test(r.img) && r.calls === 0, 'rasm hisobot — AI ga yuborilmadi: ' + r.img.slice(0, 60));
  ok(r.calls2 === 0 && !r.pend && (r.warn || dlg.some(m => /Excel yoki PDF/.test(m))), 'Hisobotni tekshirish → rasm: ogohlantirish, hech narsa yuborilmadi');
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
