        // =====================================================================
        // TEKSHIRUV
        // pkg: { sheets:[{f, s, type, data}], f30: parsed F30 (from package or stored), month? }
        // =====================================================================
        function hpCheck(pkg) {
            const F = [], add = o => { o.id = 'p' + (F.length + 1); o.st = ''; o.src = (o.src || []).filter(Boolean); F.push(o); return o; };
            const S = t => pkg.sheets.filter(x => x.type === t && x.data);
            const f30 = pkg.f30 || null;
            const blocks = []; S('spr').forEach(x => x.data.forEach(b => blocks.push(b)));
            const norms = S('norma').map(x => x.data).filter(Boolean);
            const dvs = []; S('dv').forEach(x => x.data.forEach(b => dvs.push(b)));
            const loms = S('lom').map(x => x.data).filter(Boolean);
            const nars = S('nar').map(x => x.data).filter(Boolean);
            const M = pkg.month || (f30 && f30.month) || '';
            const bName = b => (b.rtype === 'KR' ? 'Kapital taʼmir' : b.rtype === 'DR' ? 'Depo taʼmiri' : 'Taʼmir') + (b.obj ? ' ' + b.obj : '') + (b.wagons.length ? ' (' + (b.wagons.length > 3 ? b.wagons.length + ' ta vagon' : '№ ' + b.wagons.join(', ')) + ')' : '') + (b.monthTxt ? ' · ' + b.monthTxt : '');
            const cur = blocks.filter(b => !M || !b.month || b.month === M), other = blocks.filter(b => M && b.month && b.month !== M);
            other.forEach(b => add({ t: 'month', lvl: 'info', sec: bName(b), name: 'Boshqa oy', msg: 'Bu spravka bloki ' + (b.monthTxt || b.month) + ' uchun — ' + (M ? M.split('-').reverse().join('.') : '') + ' Forma-30 bilan solishtirilmadi (' + b.items.length + ' qator).', src: [b.src] }));

            // F30 indeksi
            const byId = {}; if (f30) f30.items.forEach((x, k) => { x.k = k; if (x.tid) (byId[x.tid] = byId[x.tid] || []).push(x); });
            const used = new Set();
            const pickRows = (name, cand, ignoreNum) => {
                const sc = cand.map(x => ({ x: x, s: hpScore(name, x.name, ignoreNum) })).filter(z => z.s > 0);
                if (!sc.length) return [];
                const grp = {}; sc.forEach(z => { const k = z.x.nom || hpLow(z.x.name); (grp[k] = grp[k] || { s: 0, L: [] }).L.push(z.x); grp[k].s = Math.max(grp[k].s, z.s); });
                const best = Math.max(...Object.values(grp).map(g => g.s));
                return [].concat(...Object.values(grp).filter(g => g.s === best).map(g => g.L));
            };
            const qs = L => L.reduce((a, x) => a + (x.qty || 0), 0), ss = L => L.reduce((a, x) => a + (x.sum || 0), 0);
            const avgP = L => { const q = qs(L); return q ? ss(L) / q : null; };
            const fRow = x => '№' + (x.tid || '?') + (x.tref ? ' (' + x.tref + ')' : '') + ': ' + hpF(x.qty) + ' ' + (x.unit || '') + ', ШПЗ ' + (x.shpz || '—');

            // ---- 1) Spravka ichki hisobi + Forma-30 bilan ----
            cur.forEach(b => {
                const sec = bName(b);
                if (b.C.nN >= 0 && b.wagons.length && b.N !== b.wagons.length && b.rtype !== 'KR')
                    add({ t: 'count', lvl: 'blue', sec: sec, name: 'Vagonlar soni', msg: 'Sarlavhada ' + b.wagons.length + ' ta vagon raqami, ustunda esa «' + b.N + ' ед.» uchun norma hisoblangan.', src: [b.src] });
                // tegishli norma varag'i (shu fayldagi)
                const nr = norms.filter(n => n.src.f === b.src.f && (!n.rtype || !b.rtype || n.rtype === b.rtype));
                b.items.forEach(it => {
                    // A) norma ustuni arifmetikasi
                    if (it.n1 !== null && it.nN !== null && b.C.nN >= 0 && Math.abs(it.n1 * b.N - it.nN) > 0.0051)
                        add({ t: 'normcol', lvl: it.fakt ? 'red' : 'blue', sec: sec, name: it.name, msg: 'Norma ustuni notoʻgʻri: ' + hpF(it.n1) + ' × ' + b.N + ' = ' + hpF(it.n1 * b.N) + ', yozilgan ' + hpF(it.nN) + (it.fakt ? '' : ' (Факт boʻsh — pulga taʼsiri yoʻq, lekin hujjat xato)') + '.', src: [it.src] });
                    // H) tasdiqlangan norma bilan
                    if (it.n1 !== null && nr.length) {
                        const A = hpToks(it.name), cands = [];
                        nr.forEach(n => n.items.forEach(x => { const B = hpToks(x.name); if (!A.w.length || !B.w.length) return; const p = hpPre(A.w[0], B.w[0]); if (p < Math.min(4, A.w[0].length, B.w[0].length)) return; if (!A.w.every(a => B.w.some(b => hpPre(a, b) >= Math.min(4, a.length, b.length)))) return; if (x.qty >= 10000) return; if ([...A.n].sort().join() !== [...B.n].sort().join()) return; if (hpUnit(it.unit) !== hpUnit(x.unit)) return; cands.push({ x: x, n: n }); }));
                        if (cands.length === 1 && Math.abs(cands[0].x.qty - it.n1) > 1e-6) add({ t: 'normval', lvl: 'blue', sec: sec, name: it.name, msg: 'Spravkadagi 1 birlik normasi ' + hpF(it.n1) + ' ' + (it.unit || '') + ', shu fayldagi normalar varagʻida' + (cands[0].n.year ? ' (' + cands[0].n.year + '-yil uchun)' : '') + ' «' + cands[0].x.name + '» — ' + hpF(cands[0].x.qty) + ' ' + (cands[0].x.unit || '') + '. Qaysi norma amalda ekanini tekshiring.', src: [it.src, cands[0].x.src] });
                    }
                    const lim = b.C.nN >= 0 ? it.nN : it.n1;
                    if (it.fakt !== null && lim !== null && it.fakt > lim + 1e-9)
                        add({ t: 'over', lvl: 'red', sec: sec, name: it.name, msg: 'Normadan oshgan: Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ' > norma ' + hpF(lim) + ' (' + (b.C.nN >= 0 ? hpF(it.n1) + ' × ' + b.N : '1 birlik uchun') + ').', src: [it.src] });
                    if (!f30 || it.fakt === null) return;
                    if (!it.ids.length) { if (it.fakt > 0) add({ t: 'notreb', lvl: 'blue', sec: sec, name: it.name, msg: 'Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ' yozilgan, lekin talabnoma raqami koʻrsatilmagan — Forma-30 bilan solishtirib boʻlmadi.', src: [it.src] }); return; }
                    const cand = [].concat(...it.ids.map(id => byId[id] || [])).filter(x => !b.ceh || String(x.sklad).split(/\s+/).indexOf(b.ceh) >= 0 || String(x.sklad).indexOf(b.ceh) >= 0).filter(x => !x.pogr);
                    const same = b.shpz ? cand.filter(x => x.shpz === b.shpz) : cand;
                    let L = pickRows(it.name, same, false);
                    if (!(L.length && Math.abs(qs(L) - it.fakt) < 1e-6)) { const La = pickRows(it.name, cand, false); if (La.length && (!L.length || Math.abs(qs(La) - it.fakt) < 1e-6)) L = La; }
                    if (!L.length) {
                        const g0 = {}; cand.filter(x => !used.has(x.k)).forEach(x => { const k = x.nom || hpLow(x.name); (g0[k] = g0[k] || []).push(x); });
                        const fit = Object.values(g0).filter(L0 => Math.abs(qs(L0) - it.fakt) < 1e-6);
                        const rest0 = fit.length === 1 ? fit[0] : [];
                        if (rest0.length) {
                            rest0.forEach(x => used.add(x.k));
                            const bad0 = b.shpz ? rest0.filter(x => x.shpz && x.shpz !== b.shpz) : [];
                            add({ t: 'namediff', lvl: 'blue', sec: sec, name: it.name, nom: rest0[0].nom, msg: 'Miqdor Forma-30 ga mos (' + hpF(it.fakt) + ' ' + (it.unit || '') + '), lekin nomi farq qiladi: talabnoma ' + it.ids.join(', ') + ' da «' + rest0[0].name + '». Bir xil material ekanini tasdiqlang.' + (bad0.length ? ' ⚠️ ШПЗ ham farq qiladi: ' + [...new Set(bad0.map(x => x.shpz))].join(', ') + '.' : ''), src: [it.src].concat(rest0.map(x => Object.assign({}, x.src, { r: x.i }))) });
                            return;
                        }
                        const L2 = pickRows(it.name, cand, true);
                        if (L2.length) { L2.forEach(x => used.add(x.k)); add({ t: 'size', lvl: 'red', sec: sec, name: it.name, msg: 'Talabnomada boshqa oʻlcham/nom chiqarilgan: ' + L2.map(x => '«' + x.name + '» ' + fRow(x)).join('; ') + '. Spravkada «' + it.name + '» ' + hpF(it.fakt) + ' ' + (it.unit || '') + '.', src: [it.src].concat(L2.map(x => x.src && Object.assign({}, x.src, { r: x.i }))) }); return; }
                        if (b.ceh) { const oth = [].concat(...it.ids.map(id => byId[id] || [])).filter(x => !x.pogr && !used.has(x.k) && String(x.sklad).split(/\s+/).pop() !== b.ceh && String(x.sklad).indexOf(b.ceh) < 0 && hpScore(it.name, x.name) > 0);
                            if (oth.length) { oth.forEach(x => used.add(x.k)); add({ t: 'sklad', lvl: 'red', sec: sec, name: it.name, nom: oth[0].nom, msg: 'Sklad (sex) mos emas: spravkada Цех/объект ' + b.ceh + (b.sklad ? ', Склад ' + b.sklad : '') + '. Forma-30 da talabnoma ' + it.ids.join(', ') + ' boʻyicha bu material ' + b.ceh + ' skladida yoʻq (Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + '), shu raqamli talabnoma boshqa skladda bor: ' + oth.map(x => 'sklad ' + x.sklad + ' — ' + fRow(x)).join('; ') + '. Talabnoma raqami yoki sklad notoʻgʻri — tekshiring (talabnoma ' + b.ceh + ' skladiga tegishli boʻlishi kerak).', src: [it.src].concat(oth.map(x => Object.assign({}, x.src, { r: x.i }))), diff: ss(oth) }); return; } }
                        const other = f30.items.filter(x => !used.has(x.k) && !x.pogr && (!b.ceh || String(x.sklad).indexOf(b.ceh) >= 0) && (!b.shpz || x.shpz === b.shpz) && hpScore(it.name, x.name) > 0);
                        add({ t: 'notin', lvl: 'red', sec: sec, name: it.name, msg: 'Talabnoma(lar) ' + it.ids.join(', ') + ' boʻyicha Forma-30 da bu material topilmadi (Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ').' + (other.length ? ' Forma-30 da shu sex va ШПЗ da boshqa talabnomalar bilan bor: ' + other.slice(0, 6).map(fRow).join('; ') + '.' : ''), src: [it.src].concat(other.slice(0, 6).map(x => Object.assign({}, x.src, { r: x.i }))) });
                        return;
                    }
                    L.forEach(x => used.add(x.k));
                    const q = qs(L), pr = avgP(L);
                    if (Math.abs(q - it.fakt) > 1e-6) {
                        let hint = '';
                        if (q < it.fakt) {
                            const ext = f30.items.filter(x => !used.has(x.k) && !x.pogr && x.tid && it.ids.indexOf(x.tid) < 0 && (!b.ceh || String(x.sklad).indexOf(b.ceh) >= 0) && (!b.shpz || x.shpz === b.shpz) && hpScore(it.name, x.name) > 0);
                            const exact = ext.filter(x => Math.abs((x.qty || 0) - (it.fakt - q)) < 1e-6);
                            if (exact.length) { hint = ' Farqqa teng qator Forma-30 da bor: ' + exact.map(fRow).join('; ') + ' — bu talabnoma raqami spravkaga yozilmagan (yoki boshqa raqam yozilgan) boʻlishi mumkin.'; exact.forEach(x => used.add(x.k)); }
                            else if (ext.length) hint = ' Forma-30 da shu sex va ШПЗ da boshqa talabnomalar bilan ham bor: ' + ext.slice(0, 5).map(fRow).join('; ') + '.';
                        }
                        add({ t: 'fakt', lvl: 'red', sec: sec, name: it.name, nom: L[0].nom, msg: 'Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ', Forma-30 boʻyicha shu talabnomalarda ' + hpF(q) + ' ' + (L[0].unit || '') + ' (farq ' + hpF(it.fakt - q) + (pr ? ' ≈ ' + hpF((it.fakt - q) * pr, 0) + ' soʻm' : '') + '). Forma-30: ' + L.map(fRow).join('; ') + '.' + hint, src: [it.src].concat(L.map(x => Object.assign({}, x.src, { r: x.i }))), diff: pr ? (it.fakt - q) * pr : null });
                    }
                    const bad = b.shpz ? L.filter(x => x.shpz && x.shpz !== b.shpz) : [];
                    if (bad.length) add({ t: 'shpz', lvl: 'red', sec: sec, name: it.name, nom: bad[0].nom, msg: 'Xarajat kodi (ШПЗ) mos emas: spravka ' + b.shpz + ', Forma-30 da ' + [...new Set(bad.map(x => x.shpz))].join(', ') + ' — ' + hpF(qs(bad)) + ' ' + (bad[0].unit || '') + ', ' + hpF(ss(bad), 0) + ' soʻm. Material boshqa buyurtma (masalan kapital taʼmir) hisobiga chiqarilgan, lekin shu spravkada koʻrsatilgan.', src: [it.src].concat(bad.map(x => Object.assign({}, x.src, { r: x.i }))), diff: ss(bad) });
                });
            });
            // F) Forma-30 da bor, hech bir spravkaga kirmagan
            if (f30 && cur.length) {
                const keys = new Set(cur.filter(b => b.ceh && b.shpz).map(b => b.ceh + '|' + b.shpz));
                const rest = f30.items.filter(x => !used.has(x.k) && !x.pogr && [...keys].some(k => { const [c, p] = k.split('|'); return String(x.sklad).indexOf(c) >= 0 && x.shpz === p; }));
                if (rest.length) {
                    const g = {}; rest.forEach(x => { const k = (x.nom || hpLow(x.name)) + '|' + x.shpz; (g[k] = g[k] || []).push(x); });
                    Object.values(g).forEach(L => add({ t: 'extra', lvl: 'blue', sec: 'Forma-30', name: L[0].name, nom: L[0].nom, msg: 'Forma-30 da sex ' + (String(L[0].sklad).split(' ').pop()) + ', ШПЗ ' + L[0].shpz + ' boʻyicha chiqarilgan, lekin yuklangan spravkalarning hech biriga kirmagan: ' + L.map(fRow).join('; ') + ' (jami ' + hpF(qs(L)) + ' ' + (L[0].unit || '') + ', ' + hpF(ss(L), 0) + ' soʻm). Boshqa spravkaga tegishli boʻlsa — oʻsha faylni ham yuklang.', src: L.map(x => Object.assign({}, x.src, { r: x.i })), diff: ss(L) }));
                }
            }

            // ---- 2) Defekt vedomostlar ↔ spravka ----
            const DVX = []; // v3.2: spravkalararo farqlar (bir spravkada ortiqcha = boshqasida kam → ehtimol boshqa spravkaga yozilgan)
            if (dvs.length) {
                const dvW = {}, sprW = new Set(); dvs.forEach(d => { if (d.wagon) (dvW[d.rtype + '|' + d.wagon] = dvW[d.rtype + '|' + d.wagon] || []).push(d); });
                const grpB = {}; cur.forEach(b => { if (!b.wagons.length) return; const k = b.rtype + '|' + b.wagons.slice().sort().join(','); if (!grpB[k]) grpB[k] = Object.assign({}, b, { items: [] }); grpB[k].items = grpB[k].items.concat(b.items); });
                blocks.forEach(b => b.wagons.forEach(w => sprW.add(b.rtype + '|' + w)));
                Object.values(grpB).forEach(b => {
                    const sec = bName(b), W = b.wagons, mine = [], miss = [];
                    W.forEach(w => { const L = dvW[b.rtype + '|' + w] || dvW['|' + w]; if (L) mine.push(...L); else miss.push(w); });
                    if (!mine.length) return;
                    if (miss.length) add({ t: 'dvmiss', lvl: 'blue', sec: sec, name: 'Defekt vedomost', msg: 'Quyidagi vagon(lar) uchun defekt vedomost yuklanmagan: № ' + miss.join(', ') + ' — solishtirish faqat mavjudlari boʻyicha.', src: [b.src] });
                    const agg = []; mine.forEach(d => d.items.forEach(x => { if (x.qty === null) return; const k = hpKey(x.name); let a = agg.find(z => z.k === k); if (!a) { a = { k: k, name: x.name, unit: x.unit, qty: 0, src: [], hit: false }; agg.push(a); } a.qty += x.qty; a.src.push(x.src); }));
                    b.items.forEach(it => {
                        if (it.fakt === null) return;
                        const L = agg.filter(a => hpScore(it.name, a.name) > 0);
                        if (!L.length) return;
                        const best = Math.max(...L.map(a => hpScore(it.name, a.name))), LL = L.filter(a => hpScore(it.name, a.name) === best);
                        LL.forEach(a => a.hit = true);
                        const q = LL.reduce((s, a) => s + a.qty, 0);
                        if (Math.abs(q - it.fakt) > 1e-6 && !miss.length) DVX.push({ k: hpKey(it.name), d: it.fakt - q, sec: sec, W: W, unit: it.unit || LL[0].unit || '', f: add({ t: 'dv', lvl: it.fakt > q ? 'red' : 'blue', sec: sec, name: it.name, msg: 'Defekt vedomostlarda (' + mine.length + ' ta vagon) jami ' + hpF(q) + ' ' + (LL[0].unit || '') + ', spravkada Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ' (farq ' + hpF(it.fakt - q) + '). ' + (it.fakt > q ? 'Spravkada defekt vedomostlarda asoslanganidan KOʻP chiqarilgan.' : 'Defekt vedomostda koʻrsatilgandan kam chiqarilgan — qolgani eski (b/u) qism bilan almashtirilganmi, tekshiring.'), src: [it.src].concat(...LL.map(a => a.src.slice(0, 8))) }) });
                    });
                    if (!miss.length) agg.filter(a => !a.hit && a.qty > 0).forEach(a => DVX.push({ k: a.k, d: -a.qty, sec: sec, W: W, unit: a.unit || '', f: add({ t: 'dvonly', lvl: 'blue', sec: sec, name: a.name, msg: 'Defekt vedomostlarda ' + hpF(a.qty) + ' ' + (a.unit || '') + ' koʻrsatilgan, spravkada bu material yoʻq (yoki boshqacha nomlangan).', src: a.src.slice(0, 8) }) }));
                });
                // Bir material: A spravkada DV dan ortiq (+d), B spravkada kam yoki umuman yoʻq (−d) → jami boʻyicha farq 0: xato emas, boshqa spravkaga yozilgan
                const grpK = {}; DVX.forEach(x => (grpK[x.k] = grpK[x.k] || []).push(x));
                Object.values(grpK).forEach(L => {
                    const plus = L.filter(x => x.d > 0), minus = L.filter(x => x.d < 0); if (!plus.length || !minus.length) return;
                    plus.forEach(p => { const m = minus.find(z => Math.abs(z.d + p.d) < 1e-6 && !z.used) || null; const tot = L.reduce((a, x) => a + x.d, 0);
                        const pair = m ? [m] : (Math.abs(tot) < 1e-6 ? minus : []); if (!pair.length) return; pair.forEach(z => z.used = true);
                        const wl = z => z.W.length ? ' (vagon' + (z.W.length > 1 ? 'lar' : '') + ' № ' + z.W.join(', ') + ')' : '';
                        p.f.lvl = 'blue'; p.f.t = 'dvcross'; p.f.msg += ' ↔ Ehtimol, ' + hpF(p.d) + ' ' + p.unit + ' boshqa spravkaga yozilgan: «' + pair.map(z => z.sec + wl(z)).join('», «') + '» da shu material ' + hpF(-pair.reduce((a, z) => a + z.d, 0)) + ' ' + p.unit + ' kam. Jami boʻyicha farq 0 — tekshirib, toʻgʻri spravkaga oʻtkazing.';
                        pair.forEach(z => { z.f.t = 'dvcross'; z.f.msg += ' ↔ Bu miqdor «' + p.sec + wl(p) + '» spravkasiga yozilganga oʻxshaydi (u yerda ' + hpF(p.d) + ' ' + p.unit + ' ortiqcha).'; });
                    });
                });
                const extraDV = Object.keys(dvW).filter(k => ![...sprW].some(s => s.split('|')[1] === k.split('|')[1]));
                if (extraDV.length && cur.length) add({ t: 'dvextra', lvl: 'blue', sec: 'Defekt vedomostlar', name: 'Spravkasiz vagonlar', msg: 'Defekt vedomosti bor, lekin yuklangan spravkalarda yoʻq vagonlar: ' + extraDV.map(k => '№ ' + k.split('|')[1] + (k.split('|')[0] ? ' (' + k.split('|')[0] + ')' : '')).join(', ') + '.', src: extraDV.map(k => dvW[k][0].src) });
            }

            // ---- 3) Metallolom akti ----
            loms.forEach(L => {
                const sec = 'Metallolom akti' + (L.month ? ' · ' + L.month.split('-').reverse().join('.') : '');
                let s = 0;
                L.items.forEach(x => {
                    s += x.tot;
                    const base = x.w !== null ? (x.qty || 0) * x.w : (/кг/i.test(x.unit) ? (x.qty || 0) : null);
                    if (base === null) return;
                    const e = base * (1 - (x.p || 0) / 100);
                    if (Math.abs(e - x.tot) > 0.006) {
                        const impl = base ? hpR((1 - x.tot / base) * 100, 2) : null;
                        add({ t: 'lomrow', lvl: 'red', sec: sec, name: x.name, msg: 'Umumiy vazn notoʻgʻri: ' + hpF(x.qty, 3) + (x.w !== null ? ' × ' + hpF(x.w, 3) + ' kg' : ' kg') + ' × (1 − ' + hpF(x.p || 0) + '%) = ' + hpF(e, 3) + ' kg, yozilgan ' + hpF(x.tot, 4) + ' kg (farq ' + hpF(x.tot - e, 3) + ' kg).' + (impl !== null && Math.abs(impl - (x.p || 0)) > 0.01 ? ' Yozilgan vazn ' + hpF(impl) + '% eskirishga toʻgʻri keladi — ustundagi foiz bilan formuladagi foiz farq qiladi.' : ''), src: [x.src] });
                    }
                });
                if (L.itogo && Math.abs(L.itogo.v - s) > 0.01) add({ t: 'lomtot', lvl: 'red', sec: sec, name: 'ИТОГО', msg: 'ИТОГО ' + hpF(L.itogo.v, 4) + ' kg, qatorlar yigʻindisi ' + hpF(s, 4) + ' kg (farq ' + hpF(L.itogo.v - s, 4) + ').', src: [L.itogo.src] });
                if (L.stated && L.itogo && Math.abs(L.stated.v - L.itogo.v) > 0.01) add({ t: 'lomstate', lvl: 'red', sec: sec, name: 'Xulosa', msg: 'Xulosada ' + hpF(L.stated.v) + ' kg deb yozilgan, ИТОГО ' + hpF(L.itogo.v, 4) + ' kg.', src: [L.stated.src, L.itogo.src] });
                // po'lat list: aktdagi kg ↔ spravkalardagi Факт
                L.items.filter(x => /лист/i.test(x.name) && /кг/i.test(x.unit) && x.qty).forEach(x => {
                    const vals = []; cur.forEach(b => b.items.forEach(it => { if (it.fakt !== null && /лист/i.test(it.name) && hpScore(x.name, it.name) > 0) vals.push(it); }));
                    if (!vals.length) return; const tot = vals.reduce((a, it) => a + it.fakt, 0);
                    if (Math.abs(tot - x.qty) > 1e-6 && !vals.some(it => Math.abs(it.fakt - x.qty) < 1e-6)) add({ t: 'lomlist', lvl: 'blue', sec: sec, name: x.name, msg: 'Aktda ' + hpF(x.qty) + ' kg, spravkalarda shu list boʻyicha Факт ' + vals.map(it => hpF(it.fakt)).join(' + ') + ' = ' + hpF(tot) + ' kg.', src: [x.src].concat(vals.map(it => it.src)) });
                });
            });

            // ---- 4) Naryadlar ----
            const narW = new Set();
            nars.forEach(N => {
                const sec = 'Naryad' + (N.who ? ' · ' + N.who.replace(/^бр\.?\s*/i, '') : '') + (N.src.s ? ' (' + N.src.s + ')' : '');
                let snt = 0, spay = 0, hrs = 0;
                N.items.forEach(x => {
                    const g = x.god || 0;
                    if (g > 0) x.wagons.forEach(w => narW.add(w));
                    if (x.zad !== null && x.god !== null && x.god > x.zad + 1e-9) add({ t: 'nargod', lvl: 'red', sec: sec, name: x.desc.slice(0, 60), msg: 'Bajarilgan (годных) ' + hpF(x.god) + ' > topshirilgan (задано) ' + hpF(x.zad) + '.', src: [x.src] });
                    if (x.nt !== null && x.ntime !== null && Math.abs(hpR(g * x.nt, 2) - x.ntime) > 0.011) add({ t: 'narnt', lvl: 'red', sec: sec, name: x.desc.slice(0, 60), msg: 'Norma vaqti: ' + hpF(g) + ' × ' + hpF(x.nt) + ' = ' + hpF(g * x.nt) + ' ch.soat, yozilgan ' + hpF(x.ntime) + '.', src: [x.src] });
                    if (x.rate !== null && x.pay !== null && Math.abs(hpR(g * x.rate, 2) - x.pay) > 0.021) add({ t: 'narpay', lvl: 'red', sec: sec, name: x.desc.slice(0, 60), msg: 'Ish haqi: ' + hpF(g) + ' × ' + hpF(x.rate) + ' = ' + hpF(g * x.rate) + ' soʻm, yozilgan ' + hpF(x.pay) + ' (farq ' + hpF(x.pay - g * x.rate) + ').', src: [x.src], diff: x.pay - g * x.rate });
                    snt += x.ntime || 0; spay += x.pay || 0; if (/ч/i.test(x.unit) && (x.ntime || 0) > 0) hrs += x.ntime;
                });
                const nv = N.sum.nv && N.sum.nv.v, fv = N.sum.fv && N.sum.fv.v;
                if (nv !== null && nv !== undefined && Math.abs(nv - snt) > 0.05) add({ t: 'narnv', lvl: 'red', sec: sec, name: 'Н вр.', msg: 'Jami norma vaqti ' + hpF(nv) + ', qatorlar yigʻindisi ' + hpF(snt) + ' (farq ' + hpF(nv - snt) + ').', src: [Object.assign({}, N.src, { r: N.sum.nv.i })] });
                if (hrs > 0 && nv && Math.abs(nv - snt) <= 0.05) add({ t: 'narhrs', lvl: 'blue', sec: sec, name: 'Н вр. tarkibi', msg: 'Norma vaqtiga soatbay qatorlar (haydovchi, usta va h.k.) ham qoʻshilgan: ' + hpF(hrs) + ' ch.soat. Ularsiz bajarilish ' + (fv ? hpF((nv - hrs) / fv * 100) + '%' : '—') + ', ular bilan ' + (fv ? hpF(nv / fv * 100) + '%' : '—') + '. Bu tartib sizdagi qoidaga mosligini iqtisodchi bilan aniqlang.', src: [Object.assign({}, N.src, { r: N.sum.nv.i })] });
                if (N.sum.pct && nv && fv && Math.abs(N.sum.pct.v - nv / fv * 100) > 0.011) add({ t: 'narpct', lvl: 'red', sec: sec, name: '%', msg: 'Bajarilish foizi ' + hpF(N.sum.pct.v) + '%, hisob: ' + hpF(nv) + ' ÷ ' + hpF(fv) + ' × 100 = ' + hpF(nv / fv * 100) + '%.', src: [Object.assign({}, N.src, { r: N.sum.pct.i })] });
                if (N.payTotal && Math.abs(N.payTotal.v - spay) > 0.5) add({ t: 'narsum', lvl: 'red', sec: sec, name: 'Toʻlovga jami', msg: '«Утверждаю к оплате» ' + hpF(N.payTotal.v) + ' soʻm, qatorlar yigʻindisi ' + hpF(spay) + ' soʻm (farq ' + hpF(N.payTotal.v - spay) + ').', src: [N.payTotal.src], diff: N.payTotal.v - spay });
                if (N.sum.sph && N.payTotal && fv && Math.abs(N.sum.sph.v - N.payTotal.v / fv) > 0.02) add({ t: 'narsph', lvl: 'blue', sec: sec, name: 'Soatiga', msg: 'Soatiga ish haqi ' + hpF(N.sum.sph.v) + ', hisob: ' + hpF(N.payTotal.v) + ' ÷ ' + hpF(fv) + ' = ' + hpF(N.payTotal.v / fv) + '.', src: [Object.assign({}, N.src, { r: N.sum.sph.i })] });
            });
            if (nars.length && cur.length) {
                const sw = new Set(); cur.filter(b => b.rtype === 'DR').forEach(b => b.wagons.forEach(w => sw.add(w)));
                const drNar = new Set(); nars.forEach(N => N.items.forEach(x => { if ((x.god || 0) > 0 && /депов/i.test(x.desc)) x.wagons.forEach(w => drNar.add(w)); }));
                const a = [...sw].filter(w => !drNar.has(w)), b2 = [...drNar].filter(w => !sw.has(w));
                if (sw.size && drNar.size && a.length) add({ t: 'narw', lvl: 'blue', sec: 'Naryad ↔ spravka', name: 'Depo taʼmiri vagonlari', msg: 'Spravkada bor, naryadlarda (bajarilgan) yoʻq: № ' + a.join(', ') + '.', src: [] });
                if (sw.size && drNar.size && b2.length) add({ t: 'narw2', lvl: 'blue', sec: 'Naryad ↔ spravka', name: 'Depo taʼmiri vagonlari', msg: 'Naryadlarda bajarilgan, lekin yuklangan spravkalarda yoʻq: № ' + b2.join(', ') + '.', src: [] });
            }
            if (!f30 && cur.length) add({ t: 'nof30', lvl: 'info', sec: 'Forma-30', name: 'Forma-30 yoʻq', msg: 'Bu oy uchun Forma-30 topilmadi — faqat hujjatlarning ichki hisobi va oʻzaro mosligi tekshirildi. Forma-30 ni toʻplamga qoʻshing yoki boʻlimda yuklang.', src: [] });
            const ord = { red: 0, blue: 1, info: 2 };
            F.sort((a, b) => ord[a.lvl] - ord[b.lvl]);
            return { findings: F, stats: { blocks: cur.length, other: other.length, items: cur.reduce((a, b) => a + b.items.length, 0), fakt: cur.reduce((a, b) => a + b.items.filter(x => x.fakt !== null).length, 0), dv: dvs.length, lom: loms.length, nar: nars.length, f30: f30 ? f30.items.length : 0, month: M } };
        }
        if (typeof module !== 'undefined' && module.exports) module.exports = { hpClassify, hpParseSheet, hpCheck, hpParseF30, hpScore, hpSrc, HP_TYPES };

