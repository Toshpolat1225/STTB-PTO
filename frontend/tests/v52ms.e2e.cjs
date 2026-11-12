// 5.2 (10-band): nosozlik dalolatnomasi namunaga tekislandi; «🧪 Mahalliylashtirilgan mahsulot sinovi» jurnali. Faqat SOXTA maʼlumot.
//   node frontend/tests/v52ms.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); window.uiConfirm = async () => true; window.__OUT = []; window.exOpen = f => { __OUT.push(...f); }; if (t === 'glass') document.body.classList.add('glass'); void window.XLSX; }, theme);
    await p.waitForFunction(() => typeof JSZip !== 'undefined', null, { timeout: 15000 });
    // ---------- (A) nosozlik ----------
    const ns = await p.evaluate(async () => {
      cxOpen('nosoz'); cxNew('nosoz'); Object.assign(CXV.cur, { zav: '99001', date: '2099-01-11', dr: '2098-06-26', kr: '2090-08-31', yil: '1989', defects: 'kuzov pol qismi payvand chokidan ajralgan\n1 dona old devor listi egilgan', cause: 'kuzov pol qismining ezilishi doimiy yuk va metall charchashi sabab boʻlgan.' }); cxForm();
      const sel = document.querySelector('#cxXulVar select'); const o = { sel: !!sel };
      sel.value = 'otstoy'; sel.dispatchEvent(new Event('change')); await new Promise(r => setTimeout(r, 200));
      o.xul = cxNosozXul(CXV.cur);
      const R = await dxRender(cxDxId(CXV.cur), cxDxData(CXV.cur)); const xml = new TextDecoder().decode(R.files['word/document.xml']);
      o.txt = xml.replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, ''); mdlClose('cxModal'); return o;
    });
    ok(ns.sel && /\(otstoy\) turadi\. Vagonning kuzov pol/.test(ns.xul), theme + ': nosozlik — xulosa turi «otstoy» tanlanadi');
    ok(/-Vagonning oxirgi ta’mir vaqtlari: depo ta’mir 26\.06\.2098-y\., kapital ta’mir 31\.08\.2090-y\., foydalanishga topshirilgan yil 1989-y\./.test(ns.txt), theme + ': Word — taʼmir vaqtlari bitta qatorda (namunadagidek)');
    ok(/- kuzov pol qismi payvand chokidan ajralgan/.test(ns.txt) && /raqami 99001 bo’lgan/.test(ns.txt), theme + ': Word — nosozliklar «-» bilan, vagon raqami');
    const oq = await p.evaluate(() => [msOqJoy('Razvyazka'), msOqJoy('Qolmaqir stansiyasi 1-yo’li'), msOqJoy('1-TYS'), msOqJoy('1-Yoshlik (37-ekskavator yoni)'), msOqJoy('Kalmakir bekatida')]);
    ok(oq[0] === '' && oq[1] === 'Qolmaqir stansiyasi 1-yo’lida' && oq[2] === '1-TYSda' && oq[3] === '1-Yoshlik (37-ekskavator yoni)da' && oq[4] === 'Kalmakir bekatida', theme + ': oʻq sinishi — hodisa joyi: ' + JSON.stringify(oq));
    // ---------- (B) mahsulot sinovi ----------
    await p.evaluate(() => { openHisob(); HS.tab = 'akt'; HS.akt = null; hsRender(); }); await p.waitForTimeout(300);
    ok(/Mahalliylashtirilgan mahsulot sinovi/.test(await p.evaluate(() => document.body.innerText)), theme + ': «🧪 Mahalliylashtirilgan mahsulot sinovi» kartochkasi');
    await p.evaluate(() => { HS.akt = 'mahsinov'; hsRender(); }); await p.waitForTimeout(300);
    await p.click('text=Sinovga qoʻyish — yangi mahsulot'); await p.waitForTimeout(200);
    await p.evaluate(() => { MSS.t.zav = '99002'; MSS.t.start = '2099-09-30'; MSS.t.prodRu = 'кузов думпкара 2ВС-105'; msForm(); });
    await p.click('#msF >> text=Saqlash va boshlanish dalolatnomasi'); await p.waitForTimeout(200);
    await p.evaluate(() => { MSS.st.ap = { l: 'СТТБ бош муҳандиси', n: 'Тестов Т.' }; MSS.st.km = [{ l: 'Вагон хизмати бошлиғи', n: 'Синов С.' }, { l: 'Вагон хизмати устаси', n: '' }]; msStForm(); });
    await p.click('#msS >> text=💾 Saqlash va koʻrish'); await p.waitForTimeout(300);
    const st = await p.evaluate(() => document.getElementById('msPage').innerText);
    ok(/ТАСДИҚЛАЙМАН/.test(st) && /маҳаллийлаштирилган 2ВС-105 типдаги думпкар кузовини синов жараёнларини амалга ошириш тўғрисида/.test(st) && /завод рақами 99002 бўлган 2ВС-105 типдаги думпкарга капитал таъмирда ўрнатилди/.test(st), theme + ': boshlanish dalolatnomasi — namunadagi shaklda');
    // oraliq va yakuniy
    const id = await p.evaluate(() => MSS.vid);
    await p.evaluate(id => { mdlClose('msV'); msStage(id, 'final'); MSS.st.sana = '2100-06-24'; MSS.st.joy = 'Кальмакир'; msStForm(); }, id);
    await p.click('#msS >> text=💾 Saqlash va koʻrish'); await p.waitForTimeout(300);
    const fn = await p.evaluate(() => document.getElementById('msPage').innerText);
    ok(/синов жараёнлари босқичида техник ҳолатини текширувдан ўтказиш тўғрисида/.test(fn) && /24\.06\.2100-й\. Кальмакир станциясида/.test(fn) && /30\.09\.2099 й\.дан 24\.06\.2100 й\.гача/.test(fn) && /90 т\.дан 140 т\.гача/.test(fn) && /эксплуатация учун яроқли деб топилди/.test(fn), theme + ': yakuniy dalolatnoma — davr, yuk, xulosa');
    await p.click('#msV >> text=Lotin'); await p.waitForTimeout(150);
    const la = await p.evaluate(() => document.getElementById('msPage').innerText);
    await p.click('#msV >> text=Русский'); await p.waitForTimeout(150);
    const ru = await p.evaluate(() => document.getElementById('msPage').innerText);
    ok(/TASDIQLAYMAN/i.test(la) && /Olmaliq/.test(la) && /УТВЕРЖДАЮ/.test(ru) && /АКТ/.test(ru) && /признано пригодным/.test(ru), theme + ': til — lotin va rus');
    await p.evaluate(() => { __OUT = []; msOut('pdf'); msOut('docx'); });
    const o = await p.evaluate(() => __OUT.map(f => f.name + ' ' + f.blob.size));
    ok(o.length === 2 && o.every(x => +x.split(' ')[1] > 800), theme + ': PDF va Word: ' + o.join(', '));
    await p.evaluate(() => { mdlClose('msV'); hsRender(); }); await p.waitForTimeout(200);
    const ls = await p.evaluate(() => document.body.innerText);
    ok(/Yakunlangan \(1\)/.test(ls) && /yaroqli — sinov yakunlandi/.test(ls), theme + ': jurnal — yakunlangan roʻyxatda');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), theme + ': 412 px — gorizontal siljish yoʻq');
    ok(errs.length === 0, theme + ': sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
