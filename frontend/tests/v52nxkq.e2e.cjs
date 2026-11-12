// 5.2: «⚠️ Noxush hodisalar» va «📦 Kirish nazorati» (dalolatnomalar boʻlimi). Faqat SOXTA maʼlumot.
//   node frontend/tests/v52nxkq.e2e.cjs <ilova.html>
const { chromium } = require('playwright');
let F = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) F++; };
(async () => {
  const b = await chromium.launch();
  for (const theme of ['classic', 'glass']) {
    const p = await (await b.newContext({ viewport: { width: 412, height: 880 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto('file://' + process.argv[2]); await p.waitForTimeout(4500);
    await p.evaluate(t => { currentUser = { tabel: ADMIN_TABEL, name: 'Test', role: 'admin' }; document.body.classList.remove('locked'); window.uiConfirm = async () => true; window.__OUT = []; window.exOpen = (f) => { window.__OUT.push(...f); }; try { if (t === 'glass') document.body.classList.add('glass'); } catch (e) {} }, theme);
    await p.evaluate(() => { void window.XLSX; }); await p.waitForFunction(() => typeof JSZip !== 'undefined' && typeof XLSX !== 'undefined', null, { timeout: 15000 });
    // ---------- Dalolatnomalar → boʻlimlar koʻrinadi ----------
    await p.evaluate(() => { openHisob(); HS.tab = 'akt'; HS.akt = null; hsRender(); }); await p.waitForTimeout(300);
    const cards = await p.evaluate(() => document.body.innerText);
    ok(/Nosozlik dalolatnomasi/.test(cards) && /Kirish nazorati/.test(cards), theme + ': «⚠️ Nosozlik dalolatnomasi» (5.7: Noxush hodisalar shu ichida) va «📦 Kirish nazorati» kartochkalari');
    // ---------- Noxush: hodisa kiritish (haqiqiy bosish) ----------
    await p.evaluate(() => { HS.akt = 'noxush'; hsRender(); }); await p.waitForTimeout(300);
    const vno = await p.evaluate(() => { const v = onlyVagons()[0]; return v ? String(vagonNo(v)) : '99999901'; });
    await p.click('text=Gʻildirak juftligi sinishi — yangi hodisa'); await p.waitForTimeout(200);
    await p.fill('#nx_sana', '2099-03-14'); await p.fill('#nx_vagon', vno); await p.fill('#nx_gildirak', '12345'); await p.fill('#nx_agregat', 'T-1'); await p.fill('#nx_vagon_joyi', '3-чи вагон'); await p.fill('#nx_gl_tamir', '2098-01-10'); await p.fill('#nx_defekt', '2098-02-10'); await p.fill('#nx_kim', 'Sinov S.');
    await p.click('#nxM >> text=💾 Saqlash'); await p.waitForTimeout(400);
    const nx = await p.evaluate(() => { const r = GJ26.find(x => x.sana === '14.03.2099'); return r ? { n: GJ26.length, r: r, row: !!document.getElementById('nxR') } : null; });
    ok(nx && nx.r.gildirak === '12345' && nx.row, theme + ': hodisa jadvalga yozildi va hodisa oynasi ochildi');
    await p.evaluate(() => { __OUT = []; const i = GJ26.findIndex(x => x.sana === '14.03.2099'); nxVtm(i, 'xlsx'); NXS.y = '2099'; nxRegOut('xlsx'); nxRegOut('pdf'); });
    const nxo = await p.evaluate(async () => Promise.all(__OUT.map(async f => ({ n: f.name, s: f.blob ? f.blob.size : 0 }))));
    ok(nxo.length === 3 && nxo.every(f => f.s > 500) && /Gildirak_sinishlari_2099\.pdf/.test(nxo.map(f => f.n).join()), theme + ': Маълумот Excel/PDF va «Вагон таъмири»: ' + nxo.map(f => f.n + ' ' + f.s).join(', '));
    await p.evaluate(() => mdlClose('nxR'));
    const noAgd = await p.evaluate(() => !/Agʻdarilgan/.test(document.body.innerText) && typeof window.nxAgd === 'undefined');
    ok(noAgd, theme + ': «Agʻdarilgan vagonlar» olib tashlandi');
    // Oʻzaro tekshiruv: soxta arxiv akti — gʻildirak raqami farqli
    const fn = await p.evaluate(v => { const a = ndAkts(); a.unshift({ id: 'tst', at: new Date().toISOString(), by: 'Test', tur: 'oq_sinish', sana: '2099-03-15', hs: '2099-03-14', title: 'Soxta', html: '', text: `Olmaliq sh. 15.03.2099 shu haqidaki, 14.03.2099 zavod raqami ${v} bo'lgan vagon 99999-raqamli g'ildirak juftligi` }); localStorage.setItem(ND_AKT_KEY, JSON.stringify(a));
      NXS.y = '2099'; return nxCheck([]).map(f => f.lvl + ' ' + f.t); }, vno);
    ok(fn.some(t => /^red .*gʻildirak raqami.*99999.*12345/.test(t)), theme + ': tekshiruv — akt ↔ jadval gʻildirak raqami farqi topildi');
    // ---------- Kirish nazorati ----------
    await p.evaluate(() => {
      const rows = [['2099 йилда вагонлар учун УМТСда қабул килинган эхтиёт қисмлар рўйхати (soxta)'], ['№', 'Эҳтиёт қисм номи', 'Миқдори', 'Бирлиги', 'январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр', 'Умумий келгани', 'Қайси йилнинг буюртмаси билан'],
        ['000001 буюртма бўйича эхтиёт қисмлар'], [1, 'Соxта деталь А-100', 50, 'шт', 10, '', '', '', '', '', '', '', '', '', '', '', 10, 2099], [2, 'Пружина соxта Б-200', 30, 'шт', '', 5, '', '', '', '', '', '', '', '', '', '', 5, 2099], [3, 'Соxта деталь А-100', 50, 'шт', '', '', '', '', '', '', '', '', '', '', '', '', 0, 2099], ['Жами']];
      window.__XLB = fotXlsxBook([{ name: '2099', rows: rows, head: 1 }]);
      ['nxR','nxC','nxM'].forEach(id => { try { mdlClose(id); } catch (e) {} }); HS.akt = 'kirish'; KNS.y = '2099'; hsRender(); });
    await p.waitForTimeout(300);
    const xl = await p.evaluate(async () => Array.from(new Uint8Array(await __XLB.arrayBuffer())));
    await p.setInputFiles('input[onchange="knImport(this)"]', { name: 'royxat_soxta.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(xl) }); await p.waitForTimeout(800);
    const rg = await p.evaluate(() => { const R = (kvGet('agmk_kn_reg', null) || {}).years || {}; return R['2099'] ? R['2099'].groups[0].rows.map(r => r.name + ':' + r.m[0] + '/' + r.m[1]) : null; });
    ok(rg && rg.length === 3 && rg[0] === 'Соxта деталь А-100:10/0', theme + ': roʻyxat Excel dan yuklandi: ' + JSON.stringify(rg));
    // yangi dalolatnoma (haqiqiy bosish)
    await p.click('text=Yangi dalolatnoma — qabul qilingan qismlar'); await p.waitForTimeout(200);
    await p.evaluate(() => { KNS.f.sana = '2099-02-11'; KNS.f.sup = 'SOXTA SAVDO'; KNS.f.items = [{ name: 'Пружина соxта Б-200', q: '5', unit: 'дона' }, { name: 'Соxта деталь А-100', q: '7', unit: 'дона' }]; KNS.f.rej = [{ name: 'Соxта деталь А-100', q: '2', unit: 'дона', why: '2 дона деталда ёриқ мавжуд эканлиги' }]; KNS.f.ap = { l: 'Бош муҳандис', n: 'Тестов Т.' }; KNS.f.km = [{ l: 'Бошлиқ', n: 'Синов С.' }, { l: 'Муҳандис', n: 'Намуна Н.' }]; knForm(); });
    await p.click('#knF >> text=💾 Saqlash va koʻrish'); await p.waitForTimeout(400);
    const kv = await p.evaluate(() => { const pg = document.getElementById('knPage'); const R = kvGet('agmk_kn_reg', null).years['2099'].groups[0].rows; return { t: pg ? pg.innerText : '', m: R.map(r => r.m[1]), n: kvGet('agmk_kn_akt', []).length }; });
    ok(/ТАСДИҚЛАЙМАН/.test(kv.t) && /«SOXTA SAVDO» МЧЖ дан қабул қилиб олинган/.test(kv.t) && /5 дона Пружина соxта Б-200 ва 7 дона/.test(kv.t) && /яроқсиз деб топилди/.test(kv.t) && /эксплуатация/.test(kv.t), theme + ': dalolatnoma namunadagi shaklda (soz + yaroqsiz)');
    ok(kv.m[0] === 7 && kv.m[1] === 10, theme + ': roʻyxatning fevral ustuniga qoʻshildi: ' + JSON.stringify(kv.m));
    await p.evaluate(() => { __OUT = []; knOut('pdf'); knOut('docx'); });
    const ko = await p.evaluate(() => __OUT.map(f => ({ n: f.name, s: f.blob.size, b: f.blob })));
    ok(ko.length === 2 && ko.every(f => f.s > 800), theme + ': PDF va Word: ' + ko.map(f => f.n + ' ' + f.s).join(', '));
    // Word faylni qayta oʻqish → tekshiruv
    const chk = await p.evaluate(async () => { const f = __OUT.find(x => /\.docx$/.test(x.name)); const file = new File([f.blob], '5. SOXTA 11.02.2099.docx'); const inp = { files: [file], value: '' }; KNS.chk = null; KNS.y = '2099'; await knChkFiles(inp); return { p: KNS.chk.map(a => a.sana + ' ' + a.sup + ' ' + a.items.map(x => x.q).join('+') + ' rej ' + a.rej.map(x => x.q).join('+')), f: knCheck('2099', KNS.chk).map(x => x.lvl + ' ' + x.t) }; });
    ok(chk.p.length === 2 && /^2099-02-11 SOXTA SAVDO 5\+7 rej $/.test(chk.p[0]) && / rej 2$/.test(chk.p[1]), theme + ': Word dalolatnoma qayta oʻqildi: ' + JSON.stringify(chk.p));
    ok(chk.f.some(t => /ikki marta/.test(t)) && chk.f.some(t => /yanvar — 10 шт keldi, dalolatnomasi topilmadi/.test(t)) && chk.f.some(t => /^red .*Пружина.*fevral — roʻyxatda 10, dalolatnomalarda 5/.test(t)) && chk.f.filter(t => /yaroqsiz deb topilgan/.test(t)).length === 1, theme + ': tekshiruv: takror nom, akti yoʻq oy, roʻyxat ↔ akt farqi; Word nusxasi takrorlanmadi');
    // oʻchirish → roʻyxatdan ayriladi
    await p.evaluate(async () => { const id = kvGet('agmk_kn_akt', [])[0].id; await knDel(id); });
    const back = await p.evaluate(() => kvGet('agmk_kn_reg', null).years['2099'].groups[0].rows.map(r => r.m[1]));
    ok(back[0] === 0 && back[1] === 5, theme + ': dalolatnoma oʻchirildi — roʻyxat qaytdi: ' + JSON.stringify(back));
    // koʻrinish: 412 px da gorizontal siljish yoʻq
    await p.evaluate(() => { document.querySelectorAll('.modal,.mdl,[id$="M"]').forEach(() => {}); HS.akt = 'kirish'; hsRender(); });
    const ow = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    ok(ow, theme + ': 412 px — gorizontal siljish yoʻq');
    ok(errs.length === 0, theme + ': sahifa xatolari: ' + errs.length + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close(); console.log(F ? '❌ ' + F + ' ta xato' : '✅ hammasi oʻtdi'); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
