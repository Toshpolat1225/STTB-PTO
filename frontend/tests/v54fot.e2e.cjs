// 5.4: ФОТ tahlili — iqtisodchi namunasi (06.10.2026) qoidalari. Faqat SOXTA maʼlumot.
//   node frontend/tests/v54fot.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const o = {};
    o.c1 = fotPerCodes('Единовременное премирование (1оклад)'); o.c2 = JSON.stringify(fotPerCodes('Дополнительный отпуск (64,164)'));
    FOTX.mon = 7; const P = { C: {}, rows: [] }; const L = { 210: 'Расходы периода', 212: 'Расходы на оплату труда рабочих', 223: 'Единовременное премирование', 225: 'Единовременное премирование к 8 Марта', 227: 'Единовременное премирование (1оклад)' };
    Object.keys(L).forEach(r => { P.C['A' + r] = { v: L[r] }; }); fotPerRows(P); fotMonKeys(P, 7);
    const k = r => JSON.stringify((P.rows.find(x => x.r === r) || {}).keys);
    o.ed = k(223); o.k8 = k(225);
    FOTX.mon = 2; const P2 = { C: JSON.parse(JSON.stringify(P.C)), rows: [] }; fotPerRows(P2); fotMonKeys(P2, 2); o.k8m = JSON.stringify((P2.rows.find(x => x.r === 225) || {}).keys);
    o.fk = fotFk([231115.4, 49767.4, 11668.4]).v; // jami 292551.2 → 292551 (har biri alohida yaxlitlansa 292550 boʻlardi)
    o.zd = fotGuess('КНСМ добыча 46 (96) задание'); o.main = fotMain({ sheets: [{ name: 'КНСМ добыча 46 (96)' }, { name: 'КНСМ добыча 46 (96) задание' }] }).length;
    o.ceh = [FOT_CEH['ауп'], FOT_CEH['ахч']].join(',');
    return o;
  });
  ok(r.c1 === null && r.c2 === '{"acc":[],"vo":[64,164]}', '«(1оклад)» — toʻlov kodi emas; «(64,164)» — kod: ' + r.c2);
  ok(r.ed === '[["943908",[60,61]]]', '«Единовременное премирование» (avgust) = 943908, 60 + 61-tur: ' + r.ed);
  ok(r.k8 === undefined || r.k8 === 'null' || r.k8 === '[]', '«к 8 Марта» avgustda boʻsh: ' + r.k8);
  ok(r.k8m === '[["*",[61]]]', '«к 8 Марта» martda — 61-tur: ' + r.k8m);
  ok(r.fk === 292551, 'Fakt: qator jami minggacha yaxlitlanadi: ' + r.fk);
  ok(r.zd === '' && r.main === 1, '«задание» varaqlari tahlil qilinmaydi va jamga qoʻshilmaydi');
  ok(r.ceh === '80,81', 'АУП = 80-sex, АХЧ = 81-sex: ' + r.ceh);
  ok(errs.length === 0, 'sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
