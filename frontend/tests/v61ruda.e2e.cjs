// 6.1 (138): Ruda tashish — korxona salohiyati 40 mln t, taʼmir ayiriladi (odatda 37–40). Faqat SOXTA / namuna maʼlumot.
//   node frontend/tests/v61ruda.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(3500);
  await p.evaluate(() => { currentUser = { tabel: ADMIN_TABEL, name: 'Sinov Soxta', role: 'admin' }; document.body.classList.remove('locked'); openScreen('screen-main'); });
  await p.waitForTimeout(800);
  await p.evaluate(() => { kvSet('agmk_sl_rf', {}); kvSet('agmk_sl_ruda61', null); slOpen(); slGo('ruda'); });
  await p.waitForTimeout(700);
  let r = await p.evaluate(() => {
    const ty = +todayISO().slice(0, 4), sumY = y => SLD.months.filter(m => +m.slice(0, 4) === y).reduce((a, m) => a + Object.keys(SLD.ruda[m]).reduce((q, t) => q + SLD.ruda[m][t].tn, 0), 0);
    const potY = y => SLD.months.filter(m => +m.slice(0, 4) === y).reduce((a, m) => a + Object.keys(SLD.ruda[m]).reduce((q, t) => q + SLD.ruda[m][t].pot, 0), 0);
    const day = slDailyRuda(Object.keys(SLD.nT)); let dPrev = 0; for (let i = 0; i < day.length; i++) if (+slDayISO(i).slice(0, 4) === ty - 1) dPrev += day[i];
    const el = Math.round((Date.UTC(ty, +todayISO().slice(5, 7) - 1, +todayISO().slice(8, 10)) - Date.UTC(ty, 0, 1)) / 864e5) + 1, din = (Date.UTC(ty + 1, 0, 1) - Date.UTC(ty, 0, 1)) / 864e5;
    return { ty, prev: sumY(ty - 1), cur: sumY(ty), curFull: sumY(ty) * din / el, dPrev, potPrev: potY(ty - 1), k: SLD.k61, goal: ru61Yil(),
      box: !!document.querySelector('#screen-sl-ruda .r61-b'), txt: (document.querySelector('#screen-sl-ruda .r61-b') || {}).textContent || '' };
  });
  const g = 38e6;
  ok(Object.keys(r.goal).length === 0, 'standart: sof ruda salohiyati 38 mln t (alohida sozlanmagan)');
  ok(Math.abs(r.potPrev - g) / g < 0.005, `oʻtgan yil (${r.ty - 1}) salohiyati = ${(r.potPrev / 1e6).toFixed(2)} mln t (salohiyat 38)`);
  ok(r.prev <= r.potPrev && r.prev > 0.8 * g, `oʻtgan yil tashilgan (taʼmirdagilar ayirilgan) = ${(r.prev / 1e6).toFixed(2)} mln t`);
  ok(r.curFull <= g * 1.001 && r.curFull > 0.8 * g, `joriy yil yil oxiriga = ${(r.curFull / 1e6).toFixed(2)} mln t`);
  ok(Math.abs(r.dPrev - r.prev) / r.prev < 0.01, `kunlik chiziq yigʻindisi = oylar yigʻindisi (${(r.dPrev / 1e6).toFixed(2)} mln t)`);
  ok(r.box && /Sof ruda salohiyati/.test(r.txt) && /Vskrysha.*13 mln t/.test(r.txt) && /jami tashish: 51 mln t/.test(r.txt) && /taʼmir ayirilgan/.test(r.txt) && /1 kunga/.test(r.txt) && /1 oyga/.test(r.txt) && /Oʻzgartirish/.test(r.txt) && /dumpkar reysi/.test(r.txt) && !/58 mln|69/.test(r.txt), 'sahifada meʼyor kartochkasi: yil, oy, kun ulushi ' + r.txt.replace(/\s+/g, ' ').slice(0, 160));
  r = await p.evaluate(() => { const t = document.querySelector('#screen-sl-ruda').innerText; return { old: /3 xodka × meʼyoriy yuk|× 3 xodka/.test(t), nw: /salohiyat/i.test(t) }; });
  ok(!r.old && r.nw, 'eski «vagon × 3 xodka × 105 t» izohi qolmadi ' + JSON.stringify(r));
  r = await p.evaluate(() => ru61Parts(+todayISO().slice(0, 4)));
  ok(Math.abs(r.day - 38e6 / 365) < 1 && Math.abs(r.mon - 38e6 / 12) < 1, `1 kunga ${Math.round(r.day)} t, 1 oyga ${Math.round(r.mon)} t, kuniga ≈ ${Math.round(r.xDay)} xodka`);

  // fakt kiritilgan oy — oʻzgarmaydi
  r = await p.evaluate(() => { const ty = +todayISO().slice(0, 4), m = (ty - 1) + '-03'; kvSet('agmk_sl_rf', { [m]: { r: 3.2e6, f: 3.1e6 } }); SLD = slBuild(); slDraw(); return { f: slFakt(m), src: slFSrc(m) }; });
  ok(r.f === 3.1e6 && r.src === 'q', 'dispetcher fakti oʻzgarmaydi: ' + JSON.stringify(r));

  // sozlama oynasi va saqlash
  r = await p.evaluate(async () => { const ty = +todayISO().slice(0, 4); kvSet('agmk_sl_rf', {}); ru61Open(); await new Promise(s => setTimeout(s, 200));
    const inp = document.getElementById('r61y' + (ty - 1)); const has = !!inp, v0 = inp && inp.value, cols = document.querySelector('#ru61M tr').innerText; inp.value = '39'; ru61Save(); await new Promise(s => setTimeout(s, 300));
    const potY = y => SLD.months.filter(m => +m.slice(0, 4) === y).reduce((a, m) => a + Object.keys(SLD.ruda[m]).reduce((q, t) => q + SLD.ruda[m][t].pot, 0), 0);
    const a = potY(ty - 1); ru61Open(); await new Promise(s => setTimeout(s, 150)); document.getElementById('r61y' + (ty - 1)).value = '0'; ru61Save(); await new Promise(s => setTimeout(s, 300));
    const z = potY(ty - 1); kvSet('agmk_sl_ruda61', null); return { has, v0, cols, a, z }; });
  ok(r.has && r.v0 === '38' && !/edi/.test(r.cols), 'sozlama oynasi: standart 38, «meʼyor boʻyicha edi» ustuni yoʻq · ' + r.cols.replace(/\s+/g, ' '));
  ok(Math.abs(r.a - 39e6) / 39e6 < 0.005, 'oʻzgartirish saqlandi: 39 mln t → ' + (r.a / 1e6).toFixed(2));
  ok(Math.abs(r.a - r.z) < 1, 'notoʻgʻri qiymat (0) saqlanmaydi');

  // 37 dan kam — ogohlantirish
  r = await p.evaluate(async () => { const ty = +todayISO().slice(0, 4); kvSet('agmk_sl_ruda61', { [ty - 1]: 35 }); SLD = slBuild(); slSet('per', 'oy'); slSet('y', String(ty - 1)); await new Promise(s => setTimeout(s, 300));
    const w = !!document.querySelector('#screen-sl-ruda .r61-w'); kvSet('agmk_sl_ruda61', null); SLD = slBuild(); slDraw(); await new Promise(s => setTimeout(s, 300)); return { w, w2: !!document.querySelector('#screen-sl-ruda .r61-w') }; });
  ok(r.w && !r.w2, '37 mln t dan kam boʻlsa — ogohlantirish, 40 da — yoʻq ' + JSON.stringify(r));

  // oddiy foydalanuvchi oʻzgartira olmaydi
  r = await p.evaluate(async () => { currentUser = { tabel: '99901', name: 'Soxta Xodim', role: 'user' }; ru61Open(); await new Promise(s => setTimeout(s, 150)); const i = document.querySelector('#ru61M input'); return { dis: !!(i && i.disabled), btn: !!document.querySelector('#ru61M .nv-btns button') }; });
  ok(r.dis && !r.btn, 'oddiy xodim faqat koʻradi: ' + JSON.stringify(r));

  ok(!errs.length, 'sahifa xatolarisiz ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(F ? `\n❌ ${F} ta xato` : '\n✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})();
