// 3.18 sinovi: «Mening hodimlarim» (tuzilma boʻyicha koʻrinish, qoʻlda biriktirish, qisqa pasport), kadrlar Excel importi, maxsus kiyim.
//   node tests/e2e/my_e2e.js <ilova.html> <admin_url> <company_dir>
// Faqat B (Python) server uchun. Demo (soxta) maʼlumotlar: company_dir/xodimlar.json + kirish kodlari; ishchilar.json ni sinov oʻzi yozadi.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const [HTML, ADMIN, CO] = process.argv.slice(2);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const KOD = JSON.parse(fs.readFileSync(path.join(CO, 'paketlar', 'kirish_kodlari.json'), 'utf8')).kodlar;
// soxta ishchilar (1C roʻyxati koʻrinishida)
fs.writeFileSync(path.join(CO, 'ishchilar.json'), JSON.stringify({ v: 'demo 3.18', rows: [
    ['9001', 'Demoyev Birinchi Ishchi', '1-TYS', 'Elektrovoz mashinisti', 'Участок эксплуатации подвижного состава'],
    ['9002', 'Demoyev Ikkinchi Ishchi', '1-TYS', "Vagonlarni ko'zdan kechirish bo'yicha chilangar", 'Пункт технического обслуживания вагонов'],
    ['9003', 'Demoyev Uchinchi Ishchi', '2-TYS', 'Elektr-gaz payvandchi', 'Вагоно-ремонтный парк'],
    ['9004', 'Demoyev Tortinchi Ishchi', '4-TYS', 'Temir yoʻl ishchisi (Razrezlarda, karyerlarda va uyumlarda band boʻlganda (9 okolotka)', 'Кальмакырский участок'],
] }));

async function session(browser, qr, t, pw) {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.uiPrompt = async () => 'sinov sababi'; window.alert = m => { window.__al = m; }; });
    await p.evaluate(q => srvConnect(srvParseQr(q)), qr); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', t); await p.fill('#lkPw', pw);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(5000);
    return { p, errs, ctx, t };
}
const api = (S, path, method, body) => S.p.evaluate(async a => { try { return await myApi(a.path, a.method, a.body); } catch (e) { return { ERR: e.message }; } }, { path, method, body });

(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const adm = async (p, b) => (await fetch(ADMIN + p, { method: b ? 'POST' : 'GET', headers: { 'X-Admin-Token': TOK, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined })).json();
    const st = await adm('/admin/state');
    await adm('/admin/user', { tabel: '0001', role: 'admin', status: 'active' });
    await adm('/admin/create', { tabel: '9001', name: 'Demoyev Birinchi Ishchi', password: '900100', role: 'editor', demo: true });
    const qr = st.ips[0].text, b = await chromium.launch();
    const A = await session(b, qr, '0001', KOD['0001']);          // administrator (ombor va kadrlar huquqi bilan)
    const S65 = await session(b, qr, '0065', KOD['0065']);        // 1-TYS sex boshligʻi
    const S71 = await session(b, qr, '0071', KOD['0071']);        // HS ekspluatatsiyasi boʻyicha sex boshligʻi oʻrinbosari (uchastka)
    const S72 = await session(b, qr, '0072', KOD['0072']);        // yoʻriqchi mashinist (mutaxassis)
    const W = await session(b, qr, '9001', '900100');             // ishchi
    for (const S of [A, S65, S71, S72, W]) ok(await S.p.evaluate(() => !!(currentUser && currentUser.tabel)), 'kirdi: ' + S.t);

    // ---------- 1) kim kimni koʻradi ----------
    let r = await api(S65, '/api/my/v1');
    const T65 = (r.list || []).map(x => x.tabel);
    ok(T65.includes('9001') && T65.includes('9002') && T65.includes('0071') && !T65.includes('9003') && !T65.includes('0065'),
        'sex boshligʻi — butun sex (oʻzidan tashqari), boshqa sex yoʻq: ' + r.n + ' ta');
    r = await api(S71, '/api/my/v1'); const T71 = (r.list || []).map(x => x.tabel);
    ok(T71.includes('9001') && !T71.includes('9002') && !T71.includes('0065'), 'oʻrinbosar — faqat oʻz uchastkasi, boshligʻi koʻrinmaydi: ' + JSON.stringify(T71.slice(0, 8)));
    r = await api(S72, '/api/my/v1'); ok(r.n === 0, 'mutaxassisga avtomatik hech kim boʻysunmaydi: ' + r.n);
    r = await api(A, '/api/my/v1'); ok(r.all && r.n >= 300, 'administrator — butun korxona: ' + r.n);
    r = await api(W, '/api/my/v1'); ok(r.n === 0, 'ishchiga hech kim boʻysunmaydi');

    // ---------- 2) ilova: roʻyxat va struktura ----------
    r = await S65.p.evaluate(async () => { await myOpen(); await new Promise(z => setTimeout(z, 800)); const n = document.querySelectorAll('#screen-my .my-row').length;
        MY.view = 'st'; myRender(); const tr = document.querySelectorAll('#screen-my .my-tree details').length, root = (document.querySelector('#screen-my .my-root') || {}).textContent || '';
        MY.view = 'list'; MY.q = 'Ikkinchi'; myRender(); const q = document.querySelectorAll('#screen-my .my-row').length; MY.q = ''; return { n, tr, root: root.slice(0, 80), q }; });
    ok(r.n > 5 && r.tr > 3 && /xodim/.test(r.root) && r.q === 1, '📋 roʻyxat va 🏛 struktura chiqdi, qidiruv ishlaydi: ' + JSON.stringify(r));

    // ---------- 3) kadrlar Excel importi (ilova orqali — Excel fayl yasab) ----------
    r = await A.p.evaluate(async () => {
        const blob = await xlsxFromRows([['Список сотрудников'], ['Табельный №', 'ФИО', 'Дата рождения', 'Адрес', 'Телефон', 'Отпуск', 'Разряд'],
            ['9001', 'Demoyev', '12.03.1990', 'Olmaliq sh., Demo koʻchasi 1', '+998 90 000 00 01', 'июль', 5], ['9002', 'Demoyev', 33000, 'Olmaliq sh., Demo 2', '+998 90 000 00 02', 3, 4], ['abc', 'xato qator', '', '', '', '', '']], 'Лист1');
        const f = new File([blob], 'kadrlar_demo.xlsx'); hrImport(); await hrRead({ files: [f], value: '' }); const prev = document.getElementById('hrPrev').textContent;
        await hrSend(); await new Promise(z => setTimeout(z, 600)); return { prev: prev.slice(0, 160), res: document.getElementById('hrPrev').textContent.slice(0, 160) };
    });
    ok(/2 ta xodim/.test(r.prev) && /✅ 2 ta/.test(r.res), 'kadrlar Excel (ruscha sarlavha, sana/oy turli koʻrinishda) yuklandi: ' + JSON.stringify(r));
    r = await api(S65, '/api/my/v1/p?t=9001');
    ok(r.phone === '+998 90 000 00 01' && r.birth === '1990-03-12' && r.tatil === 7 && /Demo/.test(r.address || '') && r.razryad === 5, 'rahbar qisqa pasportda manzil, telefon, tugʻilgan sana, taʼtil oyi koʻradi: ' + JSON.stringify(r).slice(0, 200));
    r = await api(S65, '/api/my/v1/p?t=9002'); ok(r.birth === '1990-05-07' && r.tatil === 3, 'Excel sana raqami va oy raqami toʻgʻri oʻqildi: ' + r.birth + ' / ' + r.tatil);
    r = await api(S71, '/api/my/v1/p?t=9002'); ok(r.ERR && /403/.test(r.ERR), 'boʻysunmaydigan xodim pasporti berilmaydi: ' + (r.ERR || '').slice(0, 80));
    r = await api(W, '/api/my/v1/p?t=9002'); ok(r.ERR && /403/.test(r.ERR), 'ishchi boshqaning shaxsiy maʼlumotini ololmaydi');
    r = await api(W, '/api/my/v1/p?t=9001'); ok(r.phone === '+998 90 000 00 01', 'oʻzining pasporti ochiladi');
    r = await api(S72, '/api/hr/v1/import', 'POST', { rows: [{ tabel: '9001', phone: '1' }] }); ok(r.ERR && /403/.test(r.ERR), 'importni faqat kadrlar/administrator qiladi');
    r = await S65.p.evaluate(async () => { await myPass('9001'); await new Promise(z => setTimeout(z, 600)); const m = document.getElementById('myPass'); return m ? m.textContent : ''; });
    ok(/iyul oyida/.test(r) && /Demo koʻchasi/.test(r) && /Mehnat muhofazasi/.test(r) && /Maxsus kiyim/.test(r), 'qisqa pasport oynasi: taʼtil, manzil, TB, maxsus kiyim boʻlimlari');
    r = await S65.p.evaluate(() => { const s = JSON.stringify(localStorage); return /Demo koʻchasi|000 00 01/.test(s); });
    ok(!r, 'shaxsiy maʼlumot telefonda (localStorage) saqlanmadi');

    // ---------- 4) qoʻlda biriktirish (komandirovka) ----------
    const to = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    r = await api(S65, '/api/my/v1/rel', 'POST', { boss: '0072', tabel: '9002', op: 'add', why: 'Komandirovka, prikaz №12', to });
    ok(r.ok, 'sex boshligʻi xodimni boʻysunuvchi mutaxassisga biriktirdi');
    r = await api(S72, '/api/my/v1'); const rel = (r.list || []).find(x => x.tabel === '9002');
    ok(r.n === 1 && rel && rel.via === 'add' && rel.rel.to === to, 'biriktirilgan xodim roʻyxatda (muddat bilan): ' + JSON.stringify(rel && rel.rel));
    r = await api(S72, '/api/my/v1/rel', 'POST', { boss: '0065', tabel: '9003', op: 'add', why: 'x' }); ok(r.ERR && /403/.test(r.ERR), 'boʻysunmaydigan rahbarga biriktirib boʻlmaydi');
    r = await api(S65, '/api/my/v1/rel', 'POST', { tabel: '9001', op: 'del', why: 'Boshqa uchastkaga oʻtkazilgan' });
    r = await api(S65, '/api/my/v1'); ok(!(r.list || []).some(x => x.tabel === '9001'), '«roʻyxatdan olib tashlash» ishladi');
    const relId = (r.rels || []).find(x => x.op === 'del' && x.tabel === '9001').id;
    await api(S65, '/api/my/v1/rel/cancel', 'POST', { id: relId });
    r = await api(S65, '/api/my/v1'); ok((r.list || []).some(x => x.tabel === '9001'), 'bekor qilingach yana roʻyxatda');
    r = await api(S65, '/api/my/v1/rel', 'POST', { tabel: '9003', op: 'add', why: 'eski', from: '2026-01-01', to: '2026-02-01' });
    r = await api(S65, '/api/my/v1'); ok(!(r.list || []).some(x => x.tabel === '9003'), 'muddati tugagan biriktirish kuchini yoʻqotadi');

    // ---------- 5) maxsus kiyim ----------
    r = await api(W, '/api/kiy/v1/p');
    const R = Object.fromEntries((r.plan.rows || []).map(x => [x.b, x]));
    ok(r.plan.grp === 'lok' && R.kostum && R.kostum.st === 'kerak' && R.dielqolqop && R.dielqolqop.navb && R.kurtka_q && R.kurtka_q.oy === 36, 'norma lavozimdan: lokomotiv brigadasi, elektrovoz qoʻshimchalari, qishki kurtka 3 yilda 1');
    r = await api(S65, '/api/kiy/v1/issue', 'POST', { tabel: '9001', items: [{ b: 'kostum' }] }); ok(r.ERR && /403/.test(r.ERR), 'kiyimni faqat ombor kiritadi');
    r = await A.p.evaluate(async () => { await kiyOpen('9001'); await new Promise(z => setTimeout(z, 500)); kiyIssueForm(); await new Promise(z => setTimeout(z, 200));
        document.querySelectorAll('#kiyIss input[data-b]').forEach(i => { i.checked = ['kostum', 'botinka', 'jilet'].includes(i.getAttribute('data-b')); });
        document.querySelector('#kiyIss input[data-s="botinka"]').value = '43'; await kiyIssueSave(); await new Promise(z => setTimeout(z, 800));
        const rows = KY.d.plan.rows.filter(x => ['kostum', 'botinka', 'jilet'].includes(x.b)).map(x => x.st + ':' + x.next); return { rows, hist: KY.d.hist.length, txt: (document.getElementById('kiyM') || {}).textContent.slice(0, 50) };
    });
    ok(r.hist === 3 && r.rows.every(x => /^ok:20/.test(x)), 'ombor ilova orqali 3 ta buyum berdi, keyingi sanalar hisoblandi: ' + JSON.stringify(r.rows));
    r = await W.p.evaluate(async () => { await kiyOpen(''); await new Promise(z => setTimeout(z, 500)); const has = !!document.querySelector('#kiyM .my-ack'); await kiyAck(); await new Promise(z => setTimeout(z, 600));
        return { has, ack: KY.d.hist.every(h => h.ack), size: KY.d.hist.find(h => h.b === 'botinka').size }; });
    ok(r.has && r.ack && r.size === '43', 'ishchi «Oldim» deb tasdiqladi: ' + JSON.stringify(r));
    r = await api(W, '/api/kiy/v1/p?t=9002'); ok(r.ERR && /403/.test(r.ERR), 'ishchi boshqaning kiyimini koʻrmaydi');
    r = await api(S65, '/api/kiy/v1/p?t=9001'); ok(r.hist && r.hist.length === 3 && !r.can.issue, 'rahbar oʻz ishchisining kiyim tarixini koʻradi (kiritolmaydi)');
    r = await api(A, '/api/kiy/v1/p?t=9004'); ok(r.plan.grp === 'yol' && r.plan.shart.includes('karyer') && r.plan.rows.some(x => x.b === 'kaska'), 'karyerdagi yoʻl ishchisiga kaska va respirator qoʻshiladi');
    const hid = (await api(A, '/api/kiy/v1/p?t=9001')).hist.find(h => h.b === 'jilet').id;
    r = await api(A, '/api/kiy/v1/cancel', 'POST', { id: hid, why: 'xato kiritilgan' }); r = await api(A, '/api/kiy/v1/p?t=9001');
    ok(r.plan.rows.find(x => x.b === 'jilet').st === 'kerak', 'bekor qilingan yozuv hisobga olinmaydi');
    r = await api(A, '/api/kiy/v1/person', 'POST', { tabel: '9003', grp: 'qoriq', boy: '180' }); r = await api(A, '/api/kiy/v1/p?t=9003');
    ok(r.plan.grp === 'qoriq' && !r.plan.auto && r.size.boy === '180', 'norma va oʻlcham qoʻlda belgilanadi');
    r = await A.p.evaluate(async () => { await kiyOmbor(); await new Promise(z => setTimeout(z, 1200)); const n = document.querySelectorAll('#screen-kiy .my-row').length; kiyDueXlsx(); await new Promise(z => setTimeout(z, 1500));
        const sh = document.getElementById('exSheet'); return { n, total: KY.due.n, sheet: !!sh && !sh.classList.contains('hidden') }; });
    ok(r.n > 10 && r.sheet, 'muddati kelganlar roʻyxati va yuklab olish oynasi (PDF/Word/Excel/JPG): ' + JSON.stringify(r));
    r = await api(S65, '/api/kiy/v1/due'); ok(!r.all && r.list.every(x => ['1-TYS'].includes(x.unitN)), 'rahbarga — faqat oʻz hodimlari boʻyicha');
    r = await api(A, '/api/kiy/v1/norma'); ok(r.katalog.length >= 25 && r.guruhlar.length >= 20, 'normalar katalogi: ' + r.katalog.length + ' buyum, ' + r.guruhlar.length + ' guruh');

    for (const S of [A, S65, S71, S72, W]) ok(S.errs.length === 0, 'JS xatolari yoʻq (' + S.t + ') ' + S.errs.slice(0, 2).join(' | '));
    await b.close();
    console.log(fails ? fails + ' TA XATO' : 'ALL OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
