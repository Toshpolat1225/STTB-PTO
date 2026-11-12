// Toʻliq sinov (3.17.0): imzolash (kirish paroli, navbatsiz, 3 bosqich, tanishuvchi, koʻruvchi, yagona qoida, guruh, nazorat, bildirishnoma), boʻlimlarni panelda tanlash, xodim ↔ struktura, vagon taʼmiri ↔ pasport ↔ grafik.
//   node tests/e2e/full_e2e.js <ilova.html> <admin_url> [tabel parol] [tabel2 parol2]
// Server HTTPS da (Python: AGMK_API_TLS=1; Node: oʻzi), AGMK_ADMIN=2582 bilan (ilovadagi administrator tabeli).
// Faqat demo (soxta) maʼlumotlar bilan ishlaydi — A (Node) va B (Python) serverda bir xil natija kutiladi.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('playwright');
const [HTML, ADMIN, T1 = '0001', P1 = '111111', T2 = '0011', P2 = '269509'] = process.argv.slice(2);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

async function session(browser, qr, t, pw) {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = m => { window.__al = m; }; });
    await p.evaluate(q => srvConnect(srvParseQr(q)), qr); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', t); await p.fill('#lkPw', pw);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(6000);
    return { p, errs, ctx };
}
const sync = async S => { await S.p.evaluate(() => syncNow(true)).catch(() => { }); await S.p.waitForTimeout(3500); };

(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const adm = async (p, b) => (await fetch(ADMIN + p, { method: b ? 'POST' : 'GET', headers: { 'X-Admin-Token': TOK, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined })).json();
    let st = await adm('/admin/state');
    await adm('/admin/user', { tabel: T1, role: 'admin', status: 'active' });
    const qr = st.ips[0].text, b = await chromium.launch();
    const A = await session(b, qr, T1, P1), B = await session(b, qr, T2, P2);
    let r = await A.p.evaluate(() => ({ u: currentUser && currentUser.tabel, adm: isAdmin() }));
    ok(r.u === T1 && r.adm, 'administrator (server roli) kirdi: ' + JSON.stringify(r));
    r = await B.p.evaluate(() => currentUser && currentUser.tabel); ok(r === T2, 'ikkinchi xodim kirdi: ' + r);

    // ---------- 1) IMZOLASH (ilovaning oʻz funksiyalari bilan) ----------
    r = await B.p.evaluate(async png => { try { await sigApi('/api/sig/v1/me', 'PUT', { png: png }); return 'ok'; } catch (e) { return 'XATO ' + e.message; } }, PNG);
    ok(r === 'ok', 'imzo namunasi saqlandi: ' + r);
    const doc = await A.p.evaluate(async t => { const h = '<h3>Sinov dalolatnomasi</h3><p>E2E imzolash sinovi</p>'; const x = await sigApi('/api/sign/v1/docs', 'POST', { title: 'E2E imzo sinovi', html: h, hash: await sigSha(h), signers: [{ tabel: t, label: 'Tekshirdi' }] }); return x; }, T2);
    ok(doc && doc.id, 'hujjat imzoga yuborildi: ' + JSON.stringify(doc).slice(0, 120));
    r = await B.p.evaluate(async id => { const L = await sigApi('/api/sign/v1/inbox'); return (L || []).some(x => x.id === id); }, doc.id);
    ok(r, 'imzo chekuvchining kiruvchi roʻyxatida bor');
    r = await B.p.evaluate(async id => { try { await sigApi('/api/sign/v1/docs/' + id + '/sign', 'POST', { hash: 'x'.repeat(64) }); return 'qabul qilindi'; } catch (e) { return 'rad: ' + e.message; } }, doc.id);
    ok(/^rad/.test(r), 'oʻzgargan hujjat (xesh mos emas) imzolanmaydi: ' + r.slice(0, 90));
    // 3.16.8: tasdiq — kirish paroli (ilovadagi oyna orqali); avval xato parol
    const pwSign = async (S, id, pw) => S.p.evaluate(async a => {
        window.__al = ''; sigConfirmDlg = async () => 'sign';
        await sigOpenDoc(a.id); const pr = sigDoSign(); await new Promise(z => setTimeout(z, 700));
        const i = document.getElementById('sgPwIn'); if (!i) return { err: 'parol oynasi chiqmadi' };
        i.value = a.pw; await v8PwGo(); await pr; await new Promise(z => setTimeout(z, 1200));
        const d = await sigApi('/api/sign/v1/docs/' + a.id); return { st: d.status, s: (d.signers || []).map(x => x.state), al: window.__al || '' };
    }, { id, pw });
    r = await pwSign(B, doc.id, 'notogri-parol');
    ok(r.st === 'open' && /parol/i.test(r.al), 'xato kirish paroli bilan imzolanmaydi: ' + JSON.stringify(r));
    r = await B.p.evaluate(() => !!document.querySelector('#spRow') && getComputedStyle(document.querySelector('#spRow')).display !== 'none');
    ok(!r, '4 xonali imzo kodi koʻrinmaydi');
    r = await pwSign(B, doc.id, P2);
    ok(r.st === 'done' && r.s.every(x => x === 'sign'), 'kirish paroli bilan ilova orqali imzolandi: ' + JSON.stringify(r));
    r = await A.p.evaluate(async id => { const d = await sigApi('/api/sign/v1/docs/' + id); return { st: d.status, png: !!(d.signers || [])[0] && !!d.signers[0].png }; }, doc.id);
    ok(r.st === 'done', 'yuboruvchi «imzolandi» holatini koʻradi: ' + JSON.stringify(r));
    const doc2 = await A.p.evaluate(async t => { const h = '<p>Rad etish sinovi</p>'; return await sigApi('/api/sign/v1/docs', 'POST', { title: 'E2E rad', html: h, hash: await sigSha(h), signers: [{ tabel: t, label: 'Tekshirdi' }] }); }, T2);
    r = await B.p.evaluate(async id => { const d = await sigApi('/api/sign/v1/docs/' + id); await sigApi('/api/sign/v1/docs/' + id + '/reject', 'POST', { hash: d.hash, reason: 'xato bor' }); const x = await sigApi('/api/sign/v1/docs/' + id); return x.status + ' / ' + (x.signers || []).map(s => s.state).join(','); }, doc2.id);
    ok(/reject/.test(r), 'rad etish ishlaydi: ' + r);

    // ---------- 1b) 3.17.0: navbatsiz, 3 bosqich, tanishuvchi, bildirishnoma, koʻruvchi, yagona qoida, guruh, nazorat ----------
    await A.p.evaluate(async png => { await sigApi('/api/sig/v1/me', 'PUT', { png: png }); }, PNG);
    await B.p.evaluate(async () => { await sigPoll(true); });
    const send = (rows, title) => A.p.evaluate(async a => {
        UP.rows = a.rows.map(x => ({ tabel: x.t, on: true, kind: x.k || '' })); V8S.ctx = 'up';
        const h = '<p>' + a.title + '</p>'; return await sigApi('/api/sign/v1/docs', 'POST', { title: a.title, html: h, hash: await sigSha(h), signers: a.rows.map(x => ({ tabel: x.t })) });
    }, { rows, title });
    const d3 = await send([{ t: T1 }, { t: T2 }], 'E2E_navbatsiz.pdf');
    r = await A.p.evaluate(async id => { const d = await sigApi('/api/sign/v1/docs/' + id); return { t: d.title, s: d.signers.map(x => x.tabel), o: d.signers.some(x => x.o) }; }, d3.id);
    ok(r.t === 'E2E navbatsiz' && JSON.stringify(r.s) === JSON.stringify([T1, T2]) && !r.o, 'tartib saqlandi, navbat majburiy emas, nom odamga oʻqiladigan: ' + JSON.stringify(r));
    r = await B.p.evaluate(async id => { await sigPoll(true); return { inT: sigWaitOf(SIG.inbox, meTabel()).some(d => d.id === id), n: getNotifs().filter(n => n.sigDoc === id && n.toTabel === meTabel()).map(n => n.text) }; }, d3.id);
    ok(r.inT && r.n.some(x => /Imzolashingiz kerak/.test(x)), '🔔 hujjat hammaga bir vaqtda: 2-imzolovchiga darhol keldi: ' + JSON.stringify(r).slice(0, 120));
    r = await A.p.evaluate(async id => (await sigApi('/api/sign/v1/docs/' + id)).signers.map(x => !!x.seen), d3.id);
    ok(JSON.stringify(r) === '[true,false]', '✓✓ «Tanishdi» faqat ochganda (yuboruvchi oʻzi ochdi, 2-si hali ochmagan): ' + JSON.stringify(r));
    r = await pwSign(B, d3.id, P2);
    ok(r.s[1] === 'sign' && r.st === 'open', 'navbatsiz: 2-imzolovchi birinchi boʻlib imzoladi: ' + JSON.stringify(r));
    r = await A.p.evaluate(async id => { await sigOpenList('in'); await sigOpenDoc(id); await new Promise(z => setTimeout(z, 900)); const m = document.getElementById('sgDoc'), r0 = m.querySelector('.modal-content').getBoundingClientRect(), hit = document.elementFromPoint(r0.left + r0.width / 2, r0.top + 30);
        return { top: !!(hit && m.contains(hit)), vis: !m.classList.contains('hidden'), st: m.querySelectorAll('.v9-s').length, seen: (await sigApi('/api/sign/v1/docs/' + id)).signers[1].seen ? 1 : 0,
            nums: [...m.querySelectorAll('.v9-no')].map(x => x.textContent), acts: [...m.querySelectorAll('.v9-acts button')].map(b => b.textContent.trim()).join('|'), jr: /Elektron tasdiq/.test(m.textContent) }; }, d3.id);
    ok(r.top && r.vis && r.st === 6 && r.seen && /Koʻzdan/.test(r.acts) && /Yuklab/.test(r.acts) && /Chop/.test(r.acts) && /Yuborish/.test(r.acts) && !/Imzoga/.test(r.acts) && r.jr,
        'hujjat roʻyxat ustida ochildi; 3 bosqich × 2; koʻrish/yuklab olish/chop etish/yuborish jarayon davomida; jurnal ilovada: ' + JSON.stringify(r));
    r = await pwSign(A, d3.id, P1);
    ok(r.st === 'done', 'birinchi imzolovchi keyinroq imzoladi — hujjat yakunlandi');
    r = await A.p.evaluate(async id => { await sigPoll(true); return getNotifs().filter(n => n.sigDoc === id).map(n => n.icon + ' ' + n.text); }, d3.id);
    ok(r.some(x => /Hamma imzoladi/.test(x)), '🔔 yuboruvchiga «Hamma imzoladi»: ' + JSON.stringify(r).slice(0, 120));
    // 7) koʻruvchi
    r = await A.p.evaluate(async id => { await sigOpenDoc(id); await new Promise(z => setTimeout(z, 600)); await v9ViewDoc(); await new Promise(z => setTimeout(z, 1500));
        const n = document.querySelectorAll('#v9View .vw-p img').length; v9Zoom(2); const z = document.getElementById('vwZ').textContent, w = document.getElementById('vwIn').style.width; v9Zoom(1); v9ViewClose(); return { n, z, w, gone: !document.getElementById('v9View') }; }, d3.id);
    ok(r.n >= 1 && r.z === '200%' && r.w === '200%' && r.gone, '👁 koʻruvchi: butun ekran, sahifalar, kattalashtirish 200%: ' + JSON.stringify(r));
    // 8, 13, 14, 17) yagona qoida: formatlar va chop etish
    r = await A.p.evaluate(async id => { await sigOpenDoc(id); await new Promise(z => setTimeout(z, 600)); const F = await v9DocFiles(), out = {};
        for (const f of ['pdf', 'docx', 'xlsx', 'jpg']) { const L = await exConvertAll(F, f); const b = new Uint8Array(await L[0].blob.slice(0, 4).arrayBuffer()); out[f] = L[0].name.split('.').pop() + ':' + L[0].blob.size + ':' + String.fromCharCode(b[0], b[1]); }
        let printed = 0; const keep = window.AgmkNative; window.AgmkNative = { print: h => { printed = h.length; } }; await exPrint(F, 't'); window.AgmkNative = keep;
        let dl = null; const odl = docDownload; exOpen(F, { act: 'dl' }); const sheet = !!document.getElementById('exSheet') && !document.getElementById('exSheet').classList.contains('hidden'); const fm = document.querySelectorAll('#exSheet .ex-fmt button').length; mdlClose('exSheet');
        const h = '<h3>Jadval</h3><table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>', fx = { name: 'jadval.pdf', mime: 'application/pdf', blob: pdfBlobFromHtml(h) };
        const xx = await exConvertAll([fx], 'xlsx'), dx = await exConvertAll([fx], 'docx');
        return { out, printed, sheet, fm, xl: xx[0].blob.size, dx: dx[0].blob.size }; }, d3.id);
    ok(/^pdf:\d+:%P/.test(r.out.pdf) && /^docx:\d+:PK/.test(r.out.docx) && /^xlsx:\d+:PK/.test(r.out.xlsx) && /^jpg:\d+:/.test(r.out.jpg) && r.printed > 1000 && r.sheet && r.fm === 4 && r.xl > 500 && r.dx > 500,
        '📤 yagona qoida: oyna (4 format), PDF/Word/Excel/JPG tayyorlanadi, chop etish: ' + JSON.stringify(r));
    // 12) imzo familiya oldiga
    r = await A.p.evaluate(async png => { const nm = currentUser.name || ''; const sur = nm.split(/\s+/)[0]; const ini = (nm.split(/\s+/)[1] || 'A')[0] + '.';
        const d = { html: '<p>Bosh muhandis ' + ini + sur + '</p>', hash: 'x', demo: false, signers: [{ tabel: '1', name: nm, label: sur + ' ' + ini, state: 'sign', png: png }] };
        const lay = await sigLayout(d), ops = lay.pages[0], im = ops.find(o => o.k === 'img'), t = ops.find(o => o.k === 't' && o.s.indexOf(sur) >= 0);
        const sx = t.x + pdfW(t.st, t.s.slice(0, t.s.indexOf(ini)), t.fs); return { ok: !!im && im.x + im.w * 0.25 <= sx, ix: Math.round(im && im.x), iw: Math.round(im && im.w), sx: Math.round(sx), jr: ops.some(o => o.k === 't' && /Elektron tasdiq/.test(o.s)) }; }, PNG);
    ok(r.ok && !r.jr, '🖋 imzo familiyaning oldiga qoʻyiladi (keyin emas), PDF da jurnal yoʻq: ' + JSON.stringify(r));
    const d4 = await send([{ t: T2, k: 'tan' }], 'E2E tanishish');
    r = await B.p.evaluate(async id => { await sigPoll(true); const n = getNotifs().filter(x => x.sigDoc === id).map(x => x.text); await sigOpenDoc(id); await new Promise(z => setTimeout(z, 400)); const bt = [...document.querySelectorAll('#sgDoc .pk-btns button')].map(b => b.textContent).join('|'); return { n, bt }; }, d4.id);
    ok(r.n.some(x => /Tanishish uchun/.test(x)) && /Tanishdim/.test(r.bt), '👁 tanishuvchiga bildirishnoma va «Tanishdim» tugmasi: ' + JSON.stringify(r).slice(0, 140));
    r = await B.p.evaluate(async a => {
        window.__al = ''; const pr = sigDoSign(); await new Promise(z => setTimeout(z, 700)); const i = document.getElementById('sgPwIn'); if (!i) return { err: 'parol oynasi chiqmadi' };
        i.value = a.pw; await v8PwGo(); await pr; await new Promise(z => setTimeout(z, 1200));
        const d = await sigApi('/api/sign/v1/docs/' + a.id); return { st: d.status, kind: d.signers[0].kind, png: !!d.signers[0].png, j: /Tanishganini tasdiqladi/.test((document.getElementById('sgDoc') || {}).textContent || '') };
    }, { id: d4.id, pw: P2 });
    ok(r.st === 'done' && r.kind === 'tan' && !r.png && r.j, '«Tanishdim» qayd etildi (imzo rasmi qoʻyilmaydi, ilovadagi jurnalda «Tanishganini tasdiqladi»): ' + JSON.stringify(r));
    // 16) tartib hujjatdagi kabi: rahbariyat tepada, raqam pastdan yuqoriga
    r = await A.p.evaluate(() => {
        UP.pdfText = ''; UP.html = '<p>TASDIQLAYMAN</p><p>Boshliq ________ Rahbarov A.A.</p><p>Matn</p><p>Kelishildi: boʻlim boshligʻi ________ Boshliqov B.B.</p><p>Tuzdi: muhandis ________ Injenerov D.D.</p>';
        upFindSigners(); const up = UP.rows.map(r => r.label.split(' ')[0]);
        SIG.pend = { html: '', title: 't', rows: [{ label: 'Rahbarov A.A.', tabel: '1', on: true, sign: true }, { label: 'Boshliqov B.B.', tabel: '2', on: true, sign: true }, { label: 'Injenerov D.D.', tabel: '3', on: true, sign: true }] };
        SIG.users = []; sigSendRender(); const pend = SIG.pend.rows.map(r => r.label.split(' ')[0]); const nums = [...document.querySelectorAll('#sgSend .v9-no')].map(x => x.textContent).join(','); mdlClose('sgSend'); SIG.pend = null;
        return { up, pend, nums, rk: [v9Rank('STTB bosh muhandisi'), v9Rank('2-TYS boshligʻi'), v9Rank('vagonlar boʻyicha muhandis'), v9Rank('uchastka ustasi'), v9Rank('chilangar')].join('') };
    });
    ok(JSON.stringify(r.up) === '["Rahbarov","Boshliqov","Injenerov"]' && JSON.stringify(r.pend) === '["Rahbarov","Boshliqov","Injenerov"]' && r.nums === '3,2,1' && r.rk === '12456',
        'roʻyxat hujjatdagi kabi (rahbariyat tepada), raqam pastdan yuqoriga, lavozim darajasi: ' + JSON.stringify(r));
    r = await A.p.evaluate(() => { const X = allXodims().filter(x => x.item.tabel && !x.item.ketgan1c); const su = X[0] && X[0].su; V8G.su = su; V8G.uch = ''; V8G.lav = ''; V8G.kind = 'tan'; const n = v8GrpSel().length;
        UP.rows = []; V8G.ctx = 'up'; try { upReviewRender = function () { }; } catch (e) { } return v8GrpAdd().then(() => ({ su, n, added: UP.rows.length, tan: UP.rows.every(x => x.kind === 'tan') })); });
    ok(r.n > 0 && r.added === r.n && r.tan, '👥 guruh (sex) bir tugmada tanishuvchi sifatida qoʻshildi: ' + JSON.stringify(r));
    r = await A.p.evaluate(async () => { let x = null; xlsxDl = (rows, t) => { x = rows.length; }; let pdf = 0; docDownload = f => { pdf = f[0].blob.size; }; await sigOpenList('naz'); const h = document.getElementById('sgList').textContent; v8NazXls(); v8NazPdf(); return { nd: document.querySelectorAll('#sgList .v8-nd').length, x, pdf, h: /Nazorat|nazorati/.test(h), sum: /tanishdi/.test(h) }; });
    ok(r.nd >= 4 && r.x > 4 && r.pdf > 1000 && r.sum, '📊 nazorat sahifasi (jamlanma), Excel va PDF: ' + JSON.stringify(r));
    r = await A.p.evaluate(() => typeof SIG.timer);
    ok(r === 'number' || r === 'object', 'tekshirish taymeri (10 s) oʻrnatilgan');

    // ---------- 2) BOʻLIMLAR: panelda tanlash → xodim telefonida ----------
    await sync(A); await A.p.evaluate(() => { try { v7HomeList(); } catch (e) { } }); await sync(A);
    st = await adm('/admin/state');
    ok(Array.isArray(st.home && st.home.list), 'panel holatida boʻlimlar roʻyxati maydoni bor (' + ((st.home && st.home.list) || []).length + ' ta; roʻyxatni administrator telefoni beradi)');
    r = await adm('/admin/home', { tabel: T2, show: { 'sec:bux': false, 'sec:mm': true } }); ok(r.ok, 'panel: xodim uchun «Buxgalteriya» yopildi');
    await sync(B);
    r = await B.p.evaluate(() => { try { homeApply(); } catch (e) { } const c = homeCards().find(x => homeId(x) === 'sec:bux'); return { hid: homeHidden('sec:bux'), mm: homeHidden('sec:mm'), card: c ? c.classList.contains('home-hid') : null }; });
    ok(r.hid && !r.mm && r.card !== false, 'xodim telefonida «Buxgalteriya» yopiq, «Mehnat muhofazasi» ochiq: ' + JSON.stringify(r));
    r = await adm('/admin/home', { tabel: T2, show: { 'sec:bux': true } }); await sync(B);
    r = await B.p.evaluate(() => homeHidden('sec:bux')); ok(r === false, 'qayta ochildi');

    // ---------- 3) XODIM ↔ STRUKTURA ----------
    r = await A.p.evaluate(async () => {
        const u = shtatTree.units[1], p = shtatTree.pos.find(x => x.u === u.id); currentSectionType = 'xodim'; currentSubUnit = u.key;
        openAddItemModal(); $id('ai-name').value = 'Sinov Xodim Testovich'; $id('ai-tabel').value = '77701'; $id('ai-lavozim').value = 'Sinov kasbi E2E'; XT.addPos = null;
        await saveNewItem(); const it = xodimByTabel('77701'); const pos = it && it.posNo ? posByNo(it.posNo) : null;
        return { add: !!it, pos: pos ? pos.name + ' @' + pos.u : null, inSt: pos ? stAt(pos.no).some(z => z.item === it) : false, u: u.id };
    });
    ok(r.add && r.pos === 'Sinov kasbi E2E @' + r.u && r.inSt, 'yangi xodim lavozimi boʻyicha strukturada paydo boʻldi: ' + JSON.stringify(r));
    r = await A.p.evaluate(async () => { const it = xodimByTabel('77701'); it.lavozim = 'Ikkinchi kasb E2E'; activeItemId = it.id; const ch = v7AutoPlace(it); const p = posByNo(it.posNo); return { ch, p: p && p.name }; });
    ok(r.ch && r.p === 'Ikkinchi kasb E2E', 'lavozim oʻzgarsa — strukturadagi oʻrni ham: ' + JSON.stringify(r));
    r = await A.p.evaluate(async () => { const it = xodimByTabel('77701'), no = it.posNo; await v7StDel(String(it.id)); return { gone: !xodimByTabel('77701'), inSt: stAt(no).length }; });
    ok(r.gone && r.inSt === 0, 'strukturadan oʻchirilgan xodim hamma joydan oʻchdi: ' + JSON.stringify(r));
    r = await A.p.evaluate(() => { const p = shtatTree.pos.find(x => stAt(x.no).length < (Number(x.cnt) || 0)); if (!p) return 'boʻsh oʻrin yoʻq'; stVacant(p.no); const btn = !!document.querySelector('#stMdl [onclick^="v7Hire"]'); v7Hire(p.no); const same = !$id('addItemModal').classList.contains('hidden') && XT.addPos === p; $id('addItemModal').classList.add('hidden'); return { btn, same }; });
    ok(r.btn && r.same, 'strukturada qabul qilish — «Ishchi xodimlar»dagi aynan oʻsha anketa: ' + JSON.stringify(r));

    // ---------- 4) VAGON TAʼMIRI ↔ PASPORT ↔ GRAFIK ----------
    r = await A.p.evaluate(async () => {
        const v = onlyVagons().find(x => x.status !== 'Tamirda' && x.tamirSanasi && x.tamirSanasi < todayISO()); if (!v) return { skip: 'vagon yoʻq' };
        activeVagonId = v.id; const before = v.tamirSanasi;
        POL.preset = { rt: 'DR', uch: polCfg().uch[0], why: '' }; await markVagonAsTamirda();
        const inR = v.status === 'Tamirda'; POL.relPreset = 'TYS-1/ЖДЦ-1'; await polRelease(v.id);
        return { no: vagonNo(v), before, after: v.tamirSanasi, inR, out: v.status !== 'Tamirda', h: (v.history || []).slice(0, 4).map(x => x.type).join(' | ') };
    });
    ok(r.skip || (r.inR && r.out && r.after === new Date().toISOString().slice(0, 10) && /Pasport avtomatik yangilandi|DR/.test(r.h)), 'rejali DR → pasportdagi taʼmir sanasi oʻzi yangilandi: ' + JSON.stringify(r));
    r = await A.p.evaluate(async () => {
        const v = onlyVagons().find(x => x.status !== 'Tamirda' && x.tamirSanasi); activeVagonId = v.id; const dr = v.tamirSanasi, k = v.keyingi;
        const pd = typeof pprDB === 'function' ? pprDB() : null, g0 = pd ? JSON.stringify(pprFind(pd, pprNo(vagonNo(v)))) : '';
        POL.preset = { rt: 'NS', uch: polCfg().uch[0], why: 'tormoz kolodkasi yeyilgan' }; await markVagonAsTamirda();
        const h = v.history[0].type, ns = (v.nosoz || [])[0] || null; POL.relPreset = 'TYS-1/ЖДЦ-1'; await polRelease(v.id);
        const pd2 = typeof pprDB === 'function' ? pprDB() : null, g1 = pd2 ? JSON.stringify(pprFind(pd2, pprNo(vagonNo(v)))) : '';
        openPassport(v.id); const box = ($id('v7-nosoz') || {}).innerText || '';
        return { h, why: ns && ns.why, out: ns && ns.out, drSame: v.tamirSanasi === dr && v.keyingi === k, grafik: g0 === g1, box: box.slice(0, 120) };
    });
    ok(/sabab: tormoz/.test(r.h) && r.why && r.out && r.drSame && r.grafik && /Nosozliklar tarixi/.test(r.box), 'nosozlik: sabab pasportda, rejali sana va grafik oʻzgarmadi: ' + JSON.stringify(r));
    r = await A.p.evaluate(() => { POL.ask = { rt: 'NS', uch: 'x', why: '', res: () => { } }; window.__al = ''; polAskDone(true); return { left: !!POL.ask, al: window.__al }; });
    ok(r.left && /sababini/.test(r.al), 'nosozlik sababisiz yuborilmaydi');

    ok(!A.errs.length && !B.errs.length, 'JS xatolari yoʻq ' + A.errs.concat(B.errs).join(' | ').slice(0, 300));
    console.log(fails ? fails + ' TA XATO' : 'ALL OK'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
