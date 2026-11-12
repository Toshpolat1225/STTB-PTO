// AI sinovi (3.16.8): ilovadagi mahalliy AI yordamchi va serverdagi OCR (rasmdagi matnni oʻqish).
//   node tests/e2e/ai_e2e.js <ilova.html> <admin_url> [tabel parol]
// Yopiq kontur: AI javob berayotganda ilova korxona serveridan boshqa hech qayerga murojaat qilmasligi ham tekshiriladi.
// Faqat demo (soxta) maʼlumotlar bilan ishlaydi — A (Node) va B (Python) serverda bir xil natija kutiladi.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { chromium } = require('playwright');
const [HTML, ADMIN, T1 = '0001', P1 = '111111'] = process.argv.slice(2);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };

// [savol, kutilgan javob belgisi]
const Q = [
    ['salom', /Assalomu alaykum|Xayrli (tong|kun|kech)|Qanday yordam/],
    ['bugun qaysi kun', /Bugun \d{4}-yil/],
    ['yordam', /qila olaman/],
    ['xodimlar soni', /Xodimlar soni: jami \d+/],
    ['ishchilar nechta', /Xodimlar soni|\d+/],
    ['taʼmirdagi vagonlar nechta', /Vagonlar.*\d+ ta/],
    ['muddati oʻtgan vagonlar', /Vagonlar.*muddati o'?t|\d+ ta/],
    ['8121 vagon', /8121/],
    ['mehnat muhofazasi muddati oʻtganlar', /Muddati|muddat|yoʻq|kiritilmagan/i],
    ['yangi xabarlar bormi', /bildirishnoma|xabar/i],
    ['imzolashim kerak boʻlgan hujjatlar bormi', /hujjat/],
    ['imzoga yuborgan hujjatlarim nazorati', /yuborgan/],
    ['тепловозлар сони', /\d|ТЭМ|teplovoz/i],
];

(async () => {
    const html = await (await fetch(ADMIN + '/', { headers: { Host: 'localhost' } })).text();
    const TOK = /const TOKEN = '([0-9a-f]+)'/.exec(html)[1];
    const adm = async (p, b) => (await fetch(ADMIN + p, { method: b ? 'POST' : 'GET', headers: { 'X-Admin-Token': TOK, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined })).json();
    const st = await adm('/admin/state'); await adm('/admin/user', { tabel: T1, role: 'admin', status: 'active' });
    const qr = st.ips[0].text, srvHost = new URL(JSON.parse(qr).u).host;
    const b = await chromium.launch(), ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 412, height: 900 } }), p = await ctx.newPage();
    const errs = [], ext = []; p.on('pageerror', e => errs.push(e.message));
    p.on('request', r => { const u = r.url(); if (/^(file|data|blob):/.test(u)) return; try { if (new URL(u).host !== srvHost) ext.push(u); } catch (e) { ext.push(u); } });
    await p.goto('file://' + HTML); await p.waitForTimeout(2500);
    await p.evaluate(() => { window.uiConfirm = async () => true; window.alert = () => { }; });
    await p.evaluate(q => srvConnect(srvParseQr(q)), qr); await p.waitForTimeout(500);
    await p.evaluate(() => showLockView('login')); await p.fill('#lkTabel', T1); await p.fill('#lkPw', P1);
    await p.evaluate(() => lockLogin()); await p.waitForTimeout(6000);
    ok(await p.evaluate(() => !!(currentUser && currentUser.tabel)), 'kirdi');
    await p.evaluate(async () => { try { await sigPoll(true); } catch (e) { } });

    // ---------- 1) mahalliy AI yordamchi ----------
    ext.length = 0;
    const t0 = Date.now();
    const R = await p.evaluate(Q => { window.speakAiText = () => { }; return Q.map(q => { const s = performance.now(); let r; try { r = aiLocalAnswer(q); } catch (e) { r = 'XATO ' + e.message; } return { t: String(r && r.t || r || ''), ms: performance.now() - s }; }); }, Q.map(x => x[0]));
    let good = 0;
    R.forEach((r, i) => { const pass = Q[i][1].test(r.t) && !/tushunmadim|^XATO/.test(r.t); if (pass) good++; ok(pass, `AI «${Q[i][0]}» → ${r.t.replace(/\n/g, ' / ').slice(0, 90)} (${Math.round(r.ms)} ms)`); });
    console.log(`     AI: ${good} / ${Q.length} savolga toʻgʻri javob, oʻrtacha ${Math.round(R.reduce((s, r) => s + r.ms, 0) / R.length)} ms, jami ${Date.now() - t0} ms`);
    await p.waitForTimeout(800);
    ok(ext.length === 0, 'yopiq kontur: AI javob berayotganda tashqi manzilga soʻrov yoʻq' + (ext.length ? ': ' + ext.slice(0, 3).join(', ') : ''));
    r = await p.evaluate(() => { try { return typeof aiCloudReady === 'function' && !!aiCloudReady(); } catch (e) { return false; } });
    ok(!r, 'bulutli AI oʻchiq');

    // ---------- 2) serverdagi OCR (rasmdagi matnni oʻqish) ----------
    var r = await p.evaluate(async () => { try { return await sbFetch('/api/ocr/v1', { method: 'GET' }); } catch (e) { return { err: e.message }; } });
    const OCR_ON = !!(r && r.ok);
    if (!r || !r.ok) console.log('SKIP OCR: serverda Tesseract yoʻq (' + JSON.stringify(r) + ')');
    else {
        r = await p.evaluate(async () => {
            const c = document.createElement('canvas'); c.width = 900; c.height = 220; const g = c.getContext('2d');
            g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.font = 'bold 64px Arial, sans-serif';
            g.fillText('AGMK STTB 2026', 40, 90); g.font = '48px Arial, sans-serif'; g.fillText('Vagon 8121 DEPO', 40, 170);
            const blob = await new Promise(z => c.toBlob(z, 'image/png')); const s = performance.now();
            const res = await window.srvRaw('/api/ocr/v1?l=eng', { method: 'POST', body: blob, headers: { 'Content-Type': 'image/png' } });
            const j = await res.json(); return { st: res.status, ms: Math.round(performance.now() - s), txt: (j.lines || []).map(l => (l.words || []).map(w => w.s).join(' ')).join(' | ') || JSON.stringify(j).slice(0, 300) };
        });
        ok(r.st === 200 && /AGMK/.test(r.txt) && /2026/.test(r.txt) && /8121/.test(r.txt), `OCR rasmdagi matnni oʻqidi (${r.ms} ms): ${r.txt.slice(0, 120)}`);
        r = await p.evaluate(async () => { try { const res = await window.srvRaw('/api/ocr/v1', { method: 'POST', body: new Blob(['salom']), headers: { 'Content-Type': 'image/png' } }); return res.status; } catch (e) { return /400/.test(e.message) ? 400 : e.message; } });
        ok(r === 400, 'OCR rasm boʻlmagan faylni qabul qilmaydi: ' + r);
    }
    // ---------- 3) 📷 Skaner (3.17.0): rasm → OCR → namunali PDF / Word / Excel / JPG ----------
    if (OCR_ON) {
        r = await p.evaluate(async () => {
            const c = document.createElement('canvas'); c.width = 1240; c.height = 1754; const g = c.getContext('2d');
            g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.font = 'bold 44px Times New Roman, serif'; g.textAlign = 'center'; g.fillText('DALOLATNOMA', 620, 200);
            g.textAlign = 'left'; g.font = '34px Times New Roman, serif'; g.fillText('Vagon 8121 tekshirildi va sinovdan o\'tkazildi.', 120, 300);
            g.fillText('Nomi', 120, 420); g.fillText('Soni', 760, 420); g.fillText('Tormoz kolodkasi', 120, 480); g.fillText('32', 760, 480); g.fillText('Shplint', 120, 540); g.fillText('200', 760, 540);
            const u = c.toDataURL('image/jpeg', 0.95);
            v9ScanOpen(); await new Promise(z => setTimeout(z, 400)); UP.lang = 'eng'; UP.scans.push(await upScanAdd(u)); UP.st = 'scan'; upRender(); upScanFull(0);
            const home = document.querySelector('#screen-hisob .hs-h') ? document.querySelector('#screen-hisob .hs-h').textContent : '';
            await upScanGo(); for (let i = 0; i < 60 && UP.st !== 'ocr'; i++) await new Promise(z => setTimeout(z, 500));
            const st = UP.st; await upOcrDone(); await new Promise(z => setTimeout(z, 800));
            const F = EX.files || [], sheet = !!document.getElementById('exSheet') && !document.getElementById('exSheet').classList.contains('hidden'), out = {};
            for (const f of ['pdf', 'docx', 'xlsx', 'jpg']) { try { const L = await exConvertAll(F, f); out[f] = L[0].blob.size; } catch (e) { out[f] = 'XATO ' + e.message; } }
            return { st, sheet, html: (UP.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160), table: /<table/.test(UP.html || ''), out };
        });
        ok(r.st === 'ocr' && r.sheet && /DALOLATNOMA/.test(r.html) && /8121/.test(r.html) && r.table && ['pdf', 'docx', 'xlsx', 'jpg'].every(k => r.out[k] > 300),
            '📷 skaner: rasm → OCR → namunali hujjat (jadval bilan) → PDF/Word/Excel/JPG: ' + JSON.stringify(r).slice(0, 300));
    }
    ok(errs.length === 0, 'JS xatolari yoʻq ' + errs.slice(0, 3).join(' | '));
    await b.close();
    console.log(fails ? fails + ' TA XATO' : 'ALL OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
