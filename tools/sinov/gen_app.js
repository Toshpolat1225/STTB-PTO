// AGMK-STTB — TEST maʼlumot generatori (ILOVA QATLAMI). Faqat TEST serveri uchun, haqiqiy bazaga yuklanmaydi.
// Ilovaning oʻzi (HTML) brauzerda ochiladi, soat 1,5 yil orqaga qoʻyiladi va har kuni ilovaning oʻz funksiyalari chaqiriladi:
//   «🔧 Taʼmirga yuborish» (markVagonAsTamirda) → 🟠 navbat → 🔵 taʼmirda → «✅ Taʼmirdan chiqdi» (polRelease)
// Shuning uchun pasport tarixi, polojeniya, DR/KR sanalari, taʼmir grafigi ilovadagidek yoziladi.
// Har bir taʼmirdan chiqishda MTTB «ombordan berildi» (TMC: ehtiyot qismlar) yozuvi, har hafta «omborga keldi» (narx bilan),
// har oy zayavka yaratiladi. Natija — ilova serverga yuboradigan yozuvlar (syncLocal) JSONL faylga.
//   node gen_app.js <ilova.html> <chiqish.jsonl> [kunlar=540] [urugʻ=42]
// Ism-familiyalar soxta («SINOV …»). Tasodif urugʻi bilan — har safar bir xil natija.
const { chromium } = require('playwright');
const fs = require('fs');
const [HTML, OUT, DAYS_ = '540', SEED_ = '42'] = process.argv.slice(2);
const DAYS = +DAYS_, SEED = +SEED_;
let rs = (SEED * 7919) >>> 0; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
if (!HTML || !OUT) { console.error('node gen_app.js <ilova.html> <chiqish.jsonl> [kunlar] [urugʻ]'); process.exit(2); }

(async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 420, height: 900 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
    const end = new Date(); end.setHours(9, 0, 0, 0);
    const start = new Date(end.getTime() - DAYS * 86400000);
    await p.clock.install({ time: start });
    await p.goto('file://' + HTML); await p.clock.runFor(4000);
    const info = await p.evaluate((seed) => {
        try { hideLock(); } catch (e) {} document.body.classList.remove('locked');
        // UI chaqiruvlari oʻchiriladi (faqat maʼlumot yoziladi)
        const noop = () => {}; ['openPassport', 'filterVagonlar', 'showToast', 'polRender', 'notify', 'mdl', 'mdlClose', 'renderVagonlar', 'mtRender'].forEach(f => { try { if (typeof window[f] === 'function') window[f] = noop; } catch (e) {} });
        window.uiPrompt = async () => ''; window.uiConfirm = async () => true; window.alert = noop;
        window.__saveN = 0; const _save = window.saveDB; window.saveDB = () => { window.__saveN++; };
        window.__realSave = _save;
        // urugʻli tasodif (mulberry32)
        let s = seed >>> 0; window.__rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        const k = {}; vagonlarData.forEach(v => { const x = v.kind || 'vag'; k[x] = (k[x] || 0) + 1; });
        return { n: vagonlarData.length, kinds: k, seh: subUnits11 };
    }, SEED);
    console.log('Texnika:', JSON.stringify(info.kinds));

        // TMC va ombor funksiyalari (birinchi kunda oʻrnatiladi)
        await p.evaluate(() => {
            const R = window.__rnd, pick = a => a[Math.floor(R() * a.length)];
            const G = window.__G = { open: {}, sent: 0, out: 0, ber: 0, kir: 0, zay: 0, send: [], rel: [], stage: [] };
            // Ehtiyot qismlar katalogi: [nomi, oʻlchov, narx (soʻm)]
            const CAT = {
                vag: [['Тормозная колодка композиционная', 'dona', 185000], ['Подшипник буксовый 42726', 'dona', 2650000], ['Подшипник буксовый 232726', 'dona', 2480000], ['Автосцепка СА-3', 'dona', 9800000], ['Поглощающий аппарат Ш-1-ТМ', 'dona', 7200000], ['Колесная пара РУ1Ш-957', 'dona', 46000000], ['Тормозной цилиндр 188Б', 'dona', 3100000], ['Воздухораспределитель 483', 'dona', 4300000], ['Рукав соединительный Р17', 'dona', 165000], ['Кран концевой 4304', 'dona', 690000], ['Цилиндр опрокидывания 2ВС-105', 'dona', 14500000], ['Пружина рессорная', 'dona', 240000], ['Клин фрикционный', 'dona', 310000], ['Болт с гайкой М20', 'dona', 9000], ['Масло буксовое ЖРО', 'kg', 52000], ['Краска эмаль ПФ-115', 'kg', 38000], ['Электроды УОНИ 13/55', 'kg', 41000], ['Лист стальной 10 мм', 'kg', 13500]],
                lok: [['Щетка электрографитная ЭГ-61', 'dona', 145000], ['Фильтр масляный дизеля', 'dona', 320000], ['Фильтр топливный', 'dona', 210000], ['Масло дизельное М-14В2', 'l', 26000], ['Колодка тормозная чугунная', 'dona', 98000], ['Подшипник моторно-осевой', 'dona', 5200000], ['Песок сухой', 'kg', 900], ['Предохранитель ПК-45', 'dona', 85000], ['Контактор ПК-1146', 'dona', 6700000], ['Кабель ППСРВМ 50', 'm', 61000]],
                avto: [['Фильтр масляный', 'dona', 145000], ['Фильтр воздушный', 'dona', 260000], ['Масло моторное 15W-40', 'l', 48000], ['Шина 23.5R25', 'dona', 21500000], ['Аккумулятор 6СТ-190', 'dona', 3600000], ['Тормозные накладки', 'kompl', 420000], ['Ремень генератора', 'dona', 115000], ['Антифриз', 'l', 29000]],
                yol: [['Фильтр масляный', 'dona', 135000], ['Масло гидравлическое МГЕ-46', 'l', 31000], ['Подшипник 3612', 'dona', 690000], ['Рукав высокого давления', 'dona', 380000], ['Масло моторное М-10Г2к', 'l', 27000], ['Колодка тормозная', 'dona', 95000]],
            };
            const QN = { TR: [2, 5], NS: [1, 4], DR: [6, 12], KR: [12, 18] };
            const OMBOR = ['SINOV Omborchi Sobirova N.'];
            window.__tmc = (x) => { // taʼmirdan chiqishda sarflangan TMC — MTTB «ombordan berildi»
                const d = mtData(), C = CAT[x.kind] || CAT.vag, q = QN[x.rt] || QN.TR, n = q[0] + Math.floor(R() * (q[1] - q[0] + 1));
                const L = C.slice().sort(() => R() - 0.5).slice(0, Math.min(n, C.length)).map(c => ({ n: c[0], q: String(c[1] === 'dona' || c[1] === 'kompl' ? 1 + Math.floor(R() * (x.rt === 'KR' ? 8 : 4)) : Math.round((2 + R() * 30) * 10) / 10), u: c[1] }));
                const atI = new Date().toISOString(), usta = (currentUser && currentUser.name) || 'SINOV Usta';
                d.ber.push({ id: uid('b'), at: atI, to: { t: '9' + String(1000 + Math.floor(R() * 900)), n: usta }, unit: '№' + x.no + ' · ' + x.rt + ' taʼmir', items: L, by: { t: '9001', n: OMBOR[0] }, note: 'SINOV: taʼmirga sarflandi', acc: { at: atI, by: usta } });
                G.ber++; mtSave(d);
            };
            window.__weekly = () => { // har dushanba — omborga keldi (narx bilan), har oyning 1-ish kunida — zayavka
                const now = new Date(), d = mtData();
                if (now.getDay() === 1) {
                    const items = []; Object.keys(CAT).forEach(kk => CAT[kk].forEach(c => { if (R() < 0.35) items.push({ n: c[0], q: String(c[1] === 'dona' || c[1] === 'kompl' ? 5 + Math.floor(R() * 40) : 50 + Math.floor(R() * 400)), u: c[1], p: String(c[2]) }); }));
                    d.kir.push({ id: uid('k'), at: now.toISOString(), zid: null, zno: null, items: items, by: { t: '9001', n: 'SINOV Omborchi Sobirova N.' }, doc: 'SINOV-NAKL-' + (d.kir.length + 1), note: 'SINOV: haftalik kirim', files: [] });
                    G.kir++;
                    try { const sum = items.reduce((a, i) => a + (+i.q) * (+i.p), 0); if (typeof buxAddAuto === 'function') buxAddAuto({ date: todayISO(), cat: 'ehtiyot', sum: sum, doc: 'SINOV-NAKL-' + d.kir.length, note: 'SINOV MTTB kirim', src: 'mttb:sinov' + d.kir.length }); } catch (e) {}
                }
                if (now.getDate() <= 2 && now.getDay() !== 0 && !(G.zm === now.getMonth())) {
                    G.zm = now.getMonth(); d.seq = (d.seq || 0) + 1;
                    const items = CAT.vag.slice().sort(() => R() - 0.5).slice(0, 6).map(c => ({ n: c[0], q: String(10 + Math.floor(R() * 50)), u: c[1], got: 0 }));
                    d.zay.push({ id: uid('z'), no: d.seq, at: now.toISOString(), by: { t: '9002', n: 'SINOV Mexanik Ergashev K.' }, unit: 'Vagon taʼmiri (oylik ehtiyoj)', due: '', note: 'SINOV', items: items });
                    G.zay++;
                }
                mtSave(d);
            };
        });

    for (let day = 0; day <= DAYS; day++) {
        const t = new Date(start.getTime() + day * 86400000);
        await p.clock.setSystemTime(t);
        const r = await p.evaluate(() => {
            const R = window.__rnd, pick = a => a[Math.floor(R() * a.length)], poi = l => { let n = 0, L = Math.exp(-l), q = 1; do { q *= R(); n++; } while (q > L); return n - 1; };
            const G = window.__G;
            const dow = new Date().getDay(); if (dow === 0) return null; // yakshanba — dam olish
            const USTA = ['SINOV Usta Karimov A.', 'SINOV Usta Rahimov B.', 'SINOV Usta Toshev D.', 'SINOV Usta Yusupov E.', 'SINOV Usta Nazarov F.', 'SINOV Usta Qodirov G.'];
            const setUser = (nm, role) => { try { currentUser = Object.assign({}, currentUser, { tabel: ADMIN_TABEL, name: nm, role: role }); } catch (e) {} };
            const at = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d; };
            // RT: taʼmir turi → [uchastkalar, davomiyligi (kun) min..max]
            const RT = { TR: [['1-TYS VTP', '2-TYS'], 1, 2], NS: [['1-TYS VTP', '2-TYS', 'Depo uchastka'], 1, 3], DR: [['Depo uchastka'], 3, 8], KR: [['Kapital uchastka'], 12, 30] };
            const RATE = { vag: { TR: 12, DR: 1.6, KR: 0.15, NS: 3 }, lok: { TR: 1.2, KR: 0.03, NS: 0.4 }, avto: { TR: 0.9, NS: 0.3 }, yol: { TR: 0.45, NS: 0.15 } };
            const free = (kind) => vagonlarData.filter(v => (v.kind || 'vag') === kind && v.status !== 'Tamirda' && !G.open[v.id]);
            const res = { in: 0, out: 0 };
            // 1) chiqarish (muddati kelganlar) — ertalab
            Object.keys(G.open).forEach(id => {
                const o = G.open[id]; if (o.due > todayISO()) { if (o.stage === 'sent') { o.stage = 'queue'; vtSetSync('queue', id); } else if (o.stage === 'queue') { o.stage = 'work'; vtSetSync('work', id); } return; }
                const v = vagonlarData.find(x => String(x.id) === String(id)); if (!v) { delete G.open[id]; return; }
               
                const to = v.seh && subUnits11.includes(v.seh) ? v.seh : pick(subUnits11.filter(x => x !== 'Boshqarma'));
                G.rel.push({ id: id, to: to, rt: o.rt, kind: o.kind, no: vagonNo(v) }); delete G.open[id];
            });
            // 2) yuborish
            Object.keys(RATE).forEach(kind => {
                const F = free(kind); Object.keys(RATE[kind]).forEach(rt => {
                    let n = poi(RATE[kind][rt]); while (n-- > 0 && F.length) {
                        const i = Math.floor(R() * F.length), v = F.splice(i, 1)[0], c = RT[rt];
                        const dur = c[1] + Math.floor(R() * (c[2] - c[1] + 1)), due = new Date(Date.now() + dur * 86400000);
                        const why = rt === 'NS' ? pick(['tormoz kolodkasi yeyilgan', 'avtostsepka nosoz', 'gʻildirak juftligi: prokat', 'pnevmatik tizim havo oʻtkazadi', 'buksa qizigan', 'kuzov deformatsiyasi', 'ag\'darish mexanizmi nosoz']) : '';
                        G.send.push({ id: v.id, rt: rt, uch: pick(c[0]), why: why });
                        G.open[v.id] = { rt: rt, kind: kind, due: due.getFullYear() + '-' + String(due.getMonth() + 1).padStart(2, '0') + '-' + String(due.getDate()).padStart(2, '0'), stage: 'sent' };
                    }
                });
            });
            return { send: G.send.length, rel: G.rel.length };
            function vtSetSync(st, id) { G.stage.push({ st: st, id: id }); }
        }).catch(e => ({ err: e.message }));
        if (r && r.err) { console.error('kun', day, r.err); break; }
        // navbatdagi amallar — har biri oʻz vaqtida (ish kuni 08:00–17:00), ilovaning oʻz funksiyalari bilan
        const Q = await p.evaluate(() => { const G = window.__G; const q = { stage: G.stage.splice(0), rel: G.rel.splice(0), send: G.send.splice(0) }; return q; });
        const tm = (h0, h1) => { const d = new Date(t); d.setHours(h0, 0, 0, 0); return new Date(d.getTime() + Math.floor(rnd() * (h1 - h0) * 3600000)); };
        const acts = [].concat(Q.stage.map(x => ({ k: 'stage', x, at: tm(8, 10) })), Q.rel.map(x => ({ k: 'rel', x, at: tm(10, 16) })), Q.send.map(x => ({ k: 'send', x, at: tm(8, 17) }))).sort((a, b2) => a.at - b2.at);
        for (const a of acts) {
            await p.clock.setSystemTime(a.at);
            await p.evaluate(async (a) => {
                const G = window.__G, R = window.__rnd, pick = z => z[Math.floor(R() * z.length)], x = a.x;
                const USTA = ['SINOV Usta Karimov A.', 'SINOV Usta Rahimov B.', 'SINOV Usta Toshev D.', 'SINOV Usta Yusupov E.', 'SINOV Usta Nazarov F.', 'SINOV Usta Qodirov G.'];
                const setUser = (nm, role) => { try { currentUser = Object.assign({}, currentUser, { tabel: ADMIN_TABEL, name: nm, role: role }); } catch (e) {} };
                if (a.k === 'stage') { setUser(pick(USTA), 'usta'); try { await vtSet(x.st, x.id); } catch (e) {} }
                else if (a.k === 'rel') { setUser(pick(USTA), 'usta'); POL.relPreset = x.to; try { await polRelease(x.id); G.out++; } catch (e) { console.error('rel', e); } window.__tmc(x); }
                else { setUser('SINOV Dispetcher Aliyev H.', 'dispetcher'); activeVagonId = x.id; POL.preset = { rt: x.rt, uch: x.uch, why: x.why }; try { await markVagonAsTamirda(); G.sent++; } catch (e) { console.error('send', e); } }
            }, a).catch(e => console.error('amal', day, e.message));
        }
        await p.clock.setSystemTime(tm(16, 17)); await p.evaluate(() => window.__weekly());
        if (day % 30 === 0) {
            const st = await p.evaluate(() => ({ open: Object.keys(window.__G.open).length, sent: window.__G.sent, out: window.__G.out, ber: window.__G.ber }));
            console.log('kun', day, '/', DAYS, JSON.stringify(st));
        }
    }
    // natija: ilova serverga yuboradigan yozuvlar
    const out = await p.evaluate(() => {
        try { currentUser = Object.assign({}, currentUser, { tabel: ADMIN_TABEL, name: 'SINOV Generator', role: 'admin' }); } catch (e) {}
        const L = syncLocal().filter(x => /^(u:|kv:agmk_mttb$|kv:agmk_bux$|kv:agmk_ppr|kv:agmk_pol)/.test(x.id) || x.kind === 'unit');
        const H = vagonlarData.reduce((a, v) => a + (v.history || []).length, 0);
        return { recs: L, stat: Object.assign({ hist: H, saves: window.__saveN }, window.__G && { sent: window.__G.sent, out: window.__G.out, ber: window.__G.ber, kir: window.__G.kir, zay: window.__G.zay, open: Object.keys(window.__G.open).length }) };
    });
    fs.writeFileSync(OUT, out.recs.map(r => JSON.stringify(r)).join('\n') + '\n');
    console.log('Natija:', JSON.stringify(out.stat), 'yozuvlar:', out.recs.length, 'hajm:', (fs.statSync(OUT).size / 1048576).toFixed(1) + ' MB');
    if (errs.length) console.log('JS xatolari:', errs.slice(0, 5).join(' | '));
    await b.close();
})().catch(e => { console.error(e); process.exit(1); });
