// 5.5: 🛡 SVO — davomat (turniket). Faqat SOXTA maʼlumot (namuna rejimi):
//   node frontend/tests/v55dav.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
  // oddiy xodim (rolsiz, boʻysunuvchisiz) — karta yoʻq
  const hidden = await p.evaluate(() => { currentUser = { tabel: '999001', name: 'Soxta', role: 'editor' }; document.body.classList.remove('locked'); modRefresh(); return !document.querySelector('[data-sec="mod-dav"]'); });
  ok(hidden, 'rolsiz xodimga «SVO — Davomat» kartasi koʻrinmaydi');
  const r = await p.evaluate(async () => {
    currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; modRefresh(); const o = {};
    o.card = !!document.querySelector('[data-sec="mod-dav"]');
    o.role = ROLE_DEF.some(x => x[0] === 'svo');
    await dvOpen(); o.noSrv = /serveriga ulanganda/.test(secBody('screen-dav').textContent);
    dvDemoOn(); await new Promise(r => setTimeout(r, 800));
    o.kpi = !!document.querySelector('#dvBody .dv-kpi'); o.rows = document.querySelectorAll('#dvList .dv-row').length;
    dvF('sababsiz'); o.red = Array.from(document.querySelectorAll('#dvList .dv-row')).every(e => /sababsiz/.test(e.textContent));
    dvF('all'); dvSet('unit', 'ЖДЦ-1'); o.unit = Array.from(document.querySelectorAll('#dvList .dv-row')).every(e => /ЖДЦ-1/.test(e.textContent)); dvSet('unit', '');
    const D = dvDemoDay('2026-10-28'); o.damNotRed = D.list.filter(x => x.code === 'V').every(x => x.st === 'dam');
    // PERCo eksportini oʻqish (soxta)
    const P = dvParseRows([['Журнал событий'], ['Таб. №', 'ФИО', 'Дата и время', 'Событие', 'Точка доступа'], ['990101', 'Soxta A', '29.10.2026 06:52:10', 'Вход', 'Турникет ВРП ЖДЦ-2'], ['990101', 'Soxta A', '29.10.2026 16:01', 'Выход', 'Турникет ВРП ЖДЦ-2'], ['', '', '', '', '']]);
    o.parse = JSON.stringify(P.rows);
    const P2 = dvParseRows([['Табельный номер', 'Дата', 'Время', 'Направление'], ['990102', '2026-10-29', '19:01', 'выход']]); o.parse2 = JSON.stringify(P2.rows);
    for (const t of ['smena', 'sabab', 'tabel', 'obyekt']) { dvTab(t); await new Promise(r => setTimeout(r, t === 'tabel' ? 1500 : 300)); const bx = document.querySelector('#dvBody'); o['t_' + t] = !/^\s*⚠️/.test((bx.firstElementChild || {}).textContent || '') && bx.textContent.length > 50; if (!o['t_' + t]) o['e_' + t] = bx.textContent.slice(0, 80); }
    dvTab('bugun'); await new Promise(r => setTimeout(r, 300)); const t0 = DV.day.list.find(x => x.in) || DV.day.list[0]; await dvPerson(t0.tabel); o.person = !!document.querySelector('#dvP .dv-kpi'); mdlClose('dvP');
    await dvMonOpen(); await new Promise(r => setTimeout(r, 800)); o.mon = !!document.querySelector('#dvMon .dm-side') && document.querySelectorAll('#dvMon .dm-mi[data-k]').length === 8 && !!document.querySelector('#dvMon .dm-t, #dvMon .dm60-c'); // 6.0: telefonda jadval oʻrniga kartochkalar
    dvMonGo('sababsiz'); o.monRed = (document.querySelector('#dvMon .dm-t') ? Array.from(document.querySelectorAll('#dvMon .dm-t tr')).slice(1) : Array.from(document.querySelectorAll('#dvMon .dm60-c'))).every(e => /sababsiz/.test(e.textContent)); dvMonClose(); o.monClosed = !document.getElementById('dvMon');
    await dvMonOpen(); await new Promise(r => setTimeout(r, 300)); const scr0 = (document.querySelector('.screen.active') || {}).id; const bk = window.agmkBack(); o.backMon = bk === true && !document.getElementById('dvMon') && (document.querySelector('.screen.active') || {}).id === scr0;
    await dvMonOpen(); await new Promise(r => setTimeout(r, 300)); navStep(); o.fabMon = !document.getElementById('dvMon') && (document.querySelector('.screen.active') || {}).id === scr0;
    o.ls = Object.keys(localStorage).filter(k => /dav/.test(k) && k !== 'agmk_dav_can');
    return o;
  });
  ok(r.card && r.role, 'administratorda karta bor; «svo» roli roʻyxatda');
  ok(r.noSrv, 'server ulanmagan — tushuntirish va namuna tugmasi');
  ok(r.kpi && r.rows > 10, 'Bugun: raqamlar va roʻyxat (' + r.rows + ')');
  ok(r.red && r.unit, 'filtrlar: sababsiz, sex boʻyicha');
  ok(r.damNotRed, 'grafik boʻyicha dam kuni — «sababsiz» emas');
  ok(r.parse === JSON.stringify([{ t: '990101', at: '2026-10-29T06:52', dir: 1, obj: 'Турникет ВРП ЖДЦ-2' }, { t: '990101', at: '2026-10-29T16:01', dir: -1, obj: 'Турникет ВРП ЖДЦ-2' }]), 'PERCo eksporti: tabel, vaqt, kirdi/chiqdi, turniket ' + r.parse);
  ok(r.parse2 === JSON.stringify([{ t: '990102', at: '2026-10-29T19:01', dir: -1, obj: '' }]), 'alohida «Дата» va «Время» ustunlari ' + r.parse2);
  ok(r.t_smena && r.t_sabab && r.t_tabel && r.t_obyekt, 'Smenalar, Sabablar, Tabel, Turniketlar ochiladi ' + [r.e_smena, r.e_sabab, r.e_tabel, r.e_obyekt].filter(Boolean).join(' | '));
  ok(r.person, 'ishchi kuni oynasi');
  ok(r.mon && r.monRed && r.monClosed, '🖥 monitoring oynasi: chap menyu (8), jadval, sababsiz filtri, yopish');
  ok(r.ls.length === 0, 'kirish-chiqish maʼlumoti telefon xotirasiga yozilmaydi ' + JSON.stringify(r.ls));
  ok(r.backMon, '5.7: telefon «Orqaga» — avval monitoring oynasi yopiladi, ekran oʻzgarmaydi');
  ok(r.fabMon, '5.7: suzuvchi ‹ — avval monitoring oynasi yopiladi');
  ok(!errs.length, 'sahifa xatolari yoʻq ' + errs.slice(0, 2).join(' | '));
  await b.close(); console.log(F ? `❌ ${F} ta xato` : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
