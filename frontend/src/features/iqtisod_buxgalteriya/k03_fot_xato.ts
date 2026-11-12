        // ФОТ tahlili — iqtisodchi javoblari (05.10.2026):
        //  1) «Единовременное премирование» = 6203 ikkinchi boʻlim, 943908 schyot, В/О 60 + 61 (avgust: 1 905 + 961 449).
        //     «к 8 Марта» qatori faqat mart oyida (В/О 60) — boshqa oylarda unga hech narsa yozilmaydi.
        //  2) «Талоны (978)» — buxgalteriyadan olinib qoʻlda kiritiladi: ilova tegmaydi, boʻsh boʻlsa eslatadi.
        //  3) Faylda qoʻlda yozilgan summa 6203 dan farq qilsa (masalan =82963+209) — bu XATO: roʻyxatda koʻrsatiladi,
        //     katak 6203 boʻyicha toʻgʻrilanadi va faylda qizil rang bilan belgilanadi.
        //  4) Bosh buxgalterga spravka — kimga / kimdan / imzolovchi sozlanadi va eslab qolinadi.
        // ---------- v3.13.1: faylni tozalash ----------
        //  ФОТ formatidagi har bir varaqda (A1 «Расшифровка затрат по ФОТ»), hamma oylarning «Прогноз» va «Факт» ustunlarida, 7-qatordan pastda:
        //  qoʻlda yozilgan raqam, matn yoki faqat raqamlardan iborat formula (=900959+22314) — oʻchiriladi;
        //  havolali formulalar (=SUM(C14:C33), =ROUND(C12*0.12,), =C14-B14) — qoladi. Prognoz havolasi matnlari («…]Авг'!$AB$21») ilova oʻqib olgach oʻchadi.
        function fotClearAll(B) {
            const out = { old: {}, n: 0, links: {} }, cache = {};
            B.sheets.forEach(sh => {
                if (!fotIsShop(B, sh)) return; const P = fotSheetPlan(B, sh, cache); const cols = new Set(); Object.keys(P.mons).filter(k => FOTS._mon === undefined || FOTS._mon < 0 || +k === +FOTS._mon).forEach(k => { /* v3.15.2: faqat hisoblanayotgan oy tozalanadi, boshqa oylar saqlanadi */ const c = fotColN(P.mons[k]); cols.add(fotCol(c)); cols.add(fotCol(c + 1)); }); if (!cols.size) return;
                out.old[sh.path] = P.C; const links = out.links[sh.path] = [];
                const xml = B.rd(sh.path).replace(/<c\b([^>]*?)\br="([A-Z]+)(\d+)"([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g, (m, a1, col, row, a2, end, inner) => {
                    if (+row < 7 || !cols.has(col) || !inner) return m; const C = P.C[col + row]; if (!C) return m;
                    if (C.f && /[A-Z]{1,3}\$?\d|#REF!/.test(C.f.replace(/"[^"]*"/g, ''))) return m; // havolali formula — qoladi
                    if (!C.f && typeof C.v === 'string' && C.v.indexOf(']') >= 0) { links.push(col + row); return m; } // prognoz havolasi — keyin
                    if (C.v === null && !C.f) return m; out.n++;
                    const st = ((a1 + a2).match(/\bs="(\d+)"/) || [])[1]; return '<c r="' + col + row + '"' + (st ? ' s="' + st + '"' : '') + '/>';
                });
                B.zip.file(sh.path, xml);
            });
            return out;
        }
        function fotRediff(B, res, clr) { // tozalashdan oldingi (qoʻlda yozilgan) qiymat 6203 dan farq qilsa — xato sifatida koʻrsatiladi
            const paths = Object.keys(res.upd);
            res.sheets.forEach((S, i) => { const p = paths[i], old = clr.old[p], up = res.upd[p]; S.diff = []; if (!old || !up) return;
                Object.keys(up).forEach(ref => { const u = up[ref], o = old[ref]; if (!o || o.v === null || o.v === '') return; const ov = parseFloat(o.v); if (isNaN(ov)) return; const r = +ref.match(/\d+$/)[0], row = S.rows.find(x => x.r === r); if (!row || row.fakt === null || Math.abs(row.fakt - u.v) > 1e-6) return;
                    if (Math.abs(ov - u.v) >= 1) S.diff.push({ r: r, lbl: row.lbl, old: ov, nw: u.v, ref: ref, of: o.f || '' }); }); });
        }
        // «Расходы периода»: oyga qarab mukofot qatorlari; qavsdagi kodlar — oʻz qatoriga; «оплату труда рабочих/АУП» — qolgan В/О
        function fotExcl(set) { return { ex: set, indexOf: vo => set.has(vo) ? -1 : 0, toJSON: () => '*-' + Array.from(set).join(',') }; }
        function fotMonKeys(P, mon) {
            P.rows.forEach(row => { if (!row.per) return; const m = String(row.lbl || '').match(/(\d+(?:\s*,\s*\d+)+)\s*$/); if (m && !/\(/.test(row.lbl)) row.keys = [['*', m[1].match(/\d+/g).map(Number)]]; }); // «Подготовка кадров 50,150,36,336» — qavssiz kodlar
            const coded = new Set(); P.rows.forEach(row => { if (row.per && row.keys) row.keys.forEach(k => { if (Array.isArray(k[1])) k[1].forEach(v => coded.add(v)); }); });
            P.rows.forEach(row => {
                if (!row.per) return; const l = String(row.lbl || '').toLowerCase().replace(/\s+/g, ' ').trim();
                if (/8\s*марта/.test(l)) row.keys = mon === 2 ? [['*', [61]]] : [];                                   // iqtisodchi: 8-mart — 61-tur
                else if (/^единовременное премирование(\s*\(60\))?$/.test(l)) row.keys = mon === 2 ? [['*', [60]]] : [['943908', [60, 61]]];
            });
            // qavsda kodi koʻrsatilgan В/О (masalan 168, 180) — faqat oʻz qatoriga; «оплату труда рабочих» (943907) ularni olmaydi
            const ex = new Set(); P.rows.forEach(row => { if (row.per && row.keys) row.keys.forEach(k => { if (k[0] === '*' && Array.isArray(k[1])) k[1].forEach(v => ex.add(v)); }); });
            P.rows.forEach(row => { if (row.per && /оплату труда рабочих/i.test(String(row.lbl || ''))) row.keys = [['943907', fotExcl(ex)]]; });
        }
        function fotIsTalon(row) { return !!(row.keys && row.keys.some(k => Array.isArray(k[1]) && k[1].indexOf(978) >= 0)); }
        function fotErrAll(res) { const L = []; (res && res.sheets || []).forEach((s, i) => (s.diff || []).forEach(d => L.push(Object.assign({ sh: s.name, ceh: s.ceh, si: i }, d)))); return L; }
        function fotAccAll(res) { const L = []; (res && res.sheets || []).forEach((s, i) => (s.acc || []).forEach(d => L.push(Object.assign({ sh: s.name, ceh: s.ceh, si: i }, d)))); return L; }
        function fotRedCells(S) { return (S.diff || []).map(d => d.ref).concat((S.acc || []).map(d => d.ref)).filter((v, i, a) => v && a.indexOf(v) === i); }
        function fotErrOpen() {
            const r = FOTS.res; if (!r) return; const E = escapeHtml, L = fotErrAll(r).sort((a, b) => Math.abs(b.old - b.nw) - Math.abs(a.old - a.nw)), A = fotAccAll(r), C = [].concat(...r.sheets.filter(s => !/задание/i.test(s.name)).map(s => (s.cap || []).map(c => Object.assign({ sh: s.name }, c)))), O = [].concat(...r.sheets.map(s => (s.perOther || []).map(o => Object.assign({ sh: s.name }, o)))), V = [].concat(...r.sheets.map(s => (s.ver || []).map(d => Object.assign({ sh: s.name }, d)))), T = [].concat(...r.sheets.map(s => (s.talon || []).map(t => Object.assign({ sh: s.name }, t))));
            mdl('fotErr', `<div class="px-h"><b>❌ Xatolar — ${L.length + A.length} ta</b><button class="mini-btn" onclick="mdlClose('fotErr')">✕</button></div>
                <div class="nd-tip">Xato kataklar yuklab olinadigan faylda <b style="color:#fca5a5">qizil</b> rang bilan belgilangan.</div>
                <div class="inf-sec">1) Faylda qoʻlda yozilgan summa 6203 ga mos emas — 6203 boʻyicha toʻgʻrilandi (${L.length})</div>
                ${L.length ? `<div class="gt-scroll" style="max-height:40vh;overflow:auto"><table class="nar-t fot-t"><tr><th>Sex / qator</th><th>Katak</th><th>Faylda edi</th><th>6203 boʻyicha</th><th>Farq</th></tr>${L.map(d => `<tr><td>${E(d.sh)} · ${E(String(d.lbl).slice(0, 40))}</td><td>${E(d.ref)}</td><td class="n">${fotN(d.old)}${d.of ? '<br><small>=' + E(d.of) + '</small>' : ''}${d.likeN ? '<br><small style="color:#fde68a">⚠️ ' + E(d.likeN) + ' summasiga toʻgʻri keladi</small>' : ''}</td><td class="n">${fotN(d.nw)}</td><td class="n" style="color:#fca5a5"><b>${fotN(fotR5(d.old - d.nw))}</b></td></tr>`).join('')}</table></div>` : '<div class="xt-empty">Yoʻq ✅</div>'}
                <div class="inf-sec">2) 6203 da notoʻgʻri schyot — summa blokka qoʻshildi, buxgalteriyaga spravkaga kiradi (${A.length})</div>
                ${A.length ? `<div class="gt-scroll" style="max-height:30vh;overflow:auto"><table class="nar-t fot-t"><tr><th>Sex / qator</th><th>Katak</th><th>6203 dagi schyot</th><th>Blok</th><th>В/О</th><th>Summa, ming</th></tr>${A.map(d => `<tr><td>${E(d.sh)} · ${E(String(d.lbl).slice(0, 35))}</td><td>${E(d.ref)}</td><td style="color:#fca5a5"><b>${E(d.sch)}</b></td><td>${E(d.blk)}</td><td>${d.vo}</td><td class="n">${fotN(fotK(d.m))}</td></tr>`).join('')}</table></div>` : '<div class="xt-empty">Yoʻq ✅</div>'}
                ${V.length ? `<div class="inf-sec">3) Tekshiring — «Расходы периода» dagi umumiy qatorlar: ilova 6203 boʻyicha yozdi, faylda boshqacha edi (${V.length})</div>` + V.map(d => `<div class="mm-card"><small>${E(d.sh)} · ${E(d.ref)} «${E(String(d.lbl).slice(0, 40))}» — faylda ${fotN(d.old)}${d.of ? ' (=' + E(d.of) + ')' : ''}, 6203 boʻyicha ${fotN(d.nw)}</small></div>`).join('') : ''}
                ${(r.zero || []).length ? `<div class="inf-sec">0️⃣ «00» sex summalari — hech qaysi sexga qoʻshilmadi, avval koʻrib chiqing (${r.zero.length})</div>` + r.zero.map(z => `<div class="mm-card"><small>${E(z.sec)} · ${E(z.sch)} · В/О ${z.vo} — <b>${narF(z.m, 2)}</b> soʻm</small></div>`).join('') : ''}
                ${C.length ? `<div class="inf-sec">❌ Kiritilmadi: 311800, 889900 (${C.length})</div>` + C.map(c => `<div class="mm-card"><small>${E(c.sh)} · ${E(c.sch)} · В/О ${c.vo} — <b>${narF(c.m, 2)}</b> soʻm</small></div>`).join('') : ''}
                ${O.length ? `<div class="inf-sec">➕ «Расходы периода»: shablonda yoʻq В/О → «прочие выплаты» (${O.length})</div>` + O.map(o => `<div class="mm-card"><small>${E(o.sh)} · ${E(o.sch)} · В/О ${o.vo} — ${fotN(o.v)} ming → ${o.r}-qator</small></div>`).join('') : ''}
                ${T.length ? `<div class="inf-sec">🎫 Talonlar (978) — oʻtgan oyda bor edi, bu oy boʻsh: buxgalteriyadan olib qoʻlda kiriting (${T.length})</div>` + T.map(t => `<div class="mm-card"><small>${E(t.sh)} · ${E(t.ref)} — oʻtgan oy: ${fotN(t.prev)}</small></div>`).join('') : ''}`, true);
        }
        if (typeof fotSheetPlan === 'function') fotSheetPlan = agmkExtend('fotSheetPlan', 'v3.11.2: oyga qarab bir martalik mukofot qatorlari', fotSheetPlan, o => function () { const P = o.apply(this, arguments); try { fotMonKeys(P, FOTS._mon); } catch (e) {} return P; });
        if (typeof fotRun === 'function') fotRun = agmkExtend('fotRun', 'v3.11.2: xatolar va talonlar', fotRun, o => function (R6, B, FB, map, opt) {
            FOTS._mon = opt && opt.mon !== undefined ? opt.mon : R6.mon;
            // v3.13.1: fayl qayta tuzilmaydi (iqtisodchi: «shu holda qaytsin»); avval hamma oylarning Прогноз va Факт kataklari tozalanadi, keyin ilova oʻzi toʻldiradi
            let clr = { old: {}, n: 0, links: {} }; try { clr = fotClearAll(B); } catch (e) { console.error(e); }
            const res = o.apply(this, arguments); res.lay = []; res.cleared = clr.n; FOTS._clr = clr;
            try { fotRediff(B, res, clr); } catch (e) { console.error(e); }
            try {
                const paths = Object.keys(res.upd), cache = {};
                res.sheets.forEach((S, i) => {
                    S.path = paths[i]; const sh = B.sheets.find(x => x.path === S.path); if (!sh) return; const P = fotSheetPlan(B, sh, cache), col = P.mons[res.mon]; if (!col) return; const cF = fotCol(fotColN(col) + 1), up = res.upd[S.path] || {};
                    // a) talon (978): oʻtgan oyda toʻldirilgan, bu oy boʻsh — eslatma
                    S.talon = []; // fayl tozalangan: prognozi bor, fakti boʻsh talon qatorlari — buxgalteriyadan qoʻlda kiritiladi
                    P.rows.forEach(row => { if (!fotIsTalon(row)) return; const pu = up[col + row.r], fu = up[cF + row.r]; if (pu && pu.v && !(fu && fu.v)) S.talon.push({ r: row.r, lbl: row.lbl, ref: cF + row.r, prev: pu.v }); });
                    // b) qoʻlda yozilgan summa ≠ 6203 — yaxlitlash farqi (har qism ±0,5) xato hisoblanmaydi
                    S.diff = S.diff.filter(d => { if (!d.ref) d.ref = cF + d.r; const u = up[d.ref], n = u && u.f ? (u.f.match(/-?\d+(\.\d+)?/g) || []).length : 1; return Math.abs(d.old - d.nw) >= Math.max(2, 0.5 * n + 0.01); });
                    // «Расходы периода» dagi umumiy qatorlar (943907 «оплату труда рабочих», «прочие выплаты (…)») — taqsimot qoidasi hali tasdiqlanmagan: xato emas, «tekshiring»
                    S.ver = S.diff.filter(d => { const row = P.rows.find(r => r.r === d.r); return row && row.per && /оплату труда рабочих|^прочие выплаты/i.test(row.lbl); });
                    S.diff = S.diff.filter(d => S.ver.indexOf(d) < 0); S.diff.forEach(d => d.t = 'man');
                    // c) 6203 da shablonda yoʻq schyot (233200, 237300 …) — blokka qoʻshildi, lekin bu XATO (spravkaga kiradi). 221006 kabi ichki schyotlar (4 raqami bir xil) — xato emas
                    S.acc = []; const seen = {};
                    P.rows.forEach(row => { if (row.per || !row.keys || !row.allAcs) return; R6.recs.forEach(x => {
                        if (x.ceh !== S.ceh || !x.m || x.sec !== FOT_SEC_FOND || row.allAcs.has(x.sch)) return;
                        if (!row.keys.some(([a, cs]) => fotAccOk(a, x.sch, row.allAcs) && (cs === '*' || cs.indexOf(x.vo) >= 0))) return;
                        const b = fotBlockOf(x.sch, row.allAcs); if (!b || b.L >= 4) return; const k = row.r + '|' + x.sch + '|' + x.vo; if (seen[k]) return; seen[k] = 1;
                        S.acc.push({ r: row.r, lbl: row.lbl, ref: cF + row.r, sch: x.sch, blk: b.via, vo: x.vo, m: x.m, t: 'acc' }); }); });
                    (S.toOther || []).forEach(o => { const row = P.rows.find(r => r.r === o.r); const b = row && row.allAcs ? fotBlockOf(o.sch, row.allAcs) : null; if (b && b.L < 4 && !row.allAcs.has(o.sch)) S.acc.push({ r: o.r, lbl: row.lbl, ref: cF + o.r, sch: o.sch, blk: b.via, vo: o.vo, m: o.v * 1000, t: 'acc' }); });
                });
            } catch (e) { console.error(e); }
            try { fotPost(R6, B, res, map); } catch (e) { console.error(e); }
            return res;
        });
        var FOT_CAP_RX = /^(311800|889900)/, FOT_NOPROG_RX = /ауп|кнсм|выпуск|вскрыша|добыча|шархия|шлак/i;
        function fotPost(R6, B, res, map) {
            const cache = {}, cehs = Array.from(new Set(Object.keys(map).map(k => map[k])));
            res.zero = R6.recs.filter(x => x.ceh === '00' && x.m).map(x => ({ sec: x.sec.slice(0, 12), sch: x.sch, vo: x.vo, m: x.m }));
            res.sheets.forEach(S => {
                const sh = B.sheets.find(x => x.path === S.path); if (!sh) return; const P = fotSheetPlan(B, sh, cache), col = P.mons[res.mon]; if (!col) return;
                const cF = fotCol(fotColN(col) + 1), up = res.upd[S.path] = res.upd[S.path] || {};
                // 1) kapital qurilish (311800, 889900) — shablonda qatori yoʻq: alohida roʻyxat
                S.cap = (S.unal || []).filter(u => FOT_CAP_RX.test(u.sch)); S.unal = (S.unal || []).filter(u => !FOT_CAP_RX.test(u.sch));
                // 2) «Расходы периода»da shablonda koʻrsatilmagan В/О → «прочие выплаты»
                const oth = P.rows.find(r => r.per && /^прочие выплаты\s*$/i.test(r.lbl)) || P.rows.find(r => r.per && /^прочие выплаты/i.test(r.lbl));
                S.perOther = [];
                // kodsiz qatorga iqtisodchi qoʻlda yozgan summa 6203 dagi shu summaga teng boʻlsa (masalan «Учебный отпуск» = 943901/45+46) — oʻsha joyda qoladi, «прочие»ga qoʻshilmaydi
                S.manual = []; const perU = (S.unal || []).filter(u => /^ВЫПЛАТЫ/.test(u.sec)), taken = new Set();
                P.rows.filter(r => r.per && !r.keys).forEach(r => { const c = P.C[cF + r.r]; const v = c && c.v !== null && c.v !== '' ? parseFloat(c.v) : NaN; if (isNaN(v) || !v) return;
                    let hit = perU.filter(u => !taken.has(u) && Math.abs(fotK(u.m) - v) < 1).slice(0, 1);
                    if (!hit.length) { const by = {}; perU.forEach(u => { if (!taken.has(u)) (by[u.sch] = by[u.sch] || []).push(u); }); for (const k in by) { if (Math.abs(by[k].reduce((a, u) => a + fotK(u.m), 0) - v) < 1) { hit = by[k]; break; } } }
                    hit.forEach(u => { taken.add(u); S.manual.push({ r: r.r, lbl: r.lbl, sch: u.sch, vo: u.vo, v: fotK(u.m) }); }); });
                S.unal = (S.unal || []).filter(u => !taken.has(u));
                if (oth) { const add = (S.unal || []).filter(u => /^ВЫПЛАТЫ/.test(u.sec)); if (add.length) {
                    const cur = up[cF + oth.r], parts = cur && cur.f ? (cur.f.match(/[+-]?\d+(\.\d+)?/g) || []).map(Number) : (cur ? [cur.v] : []);
                    add.forEach(u => { const k = fotK(u.m); parts.push(k); S.perOther.push({ r: oth.r, sch: u.sch, vo: u.vo, v: k }); });
                    const fk = fotFk(parts); const prev = cur ? cur.v : 0; up[cF + oth.r] = { f: fk.f, v: fk.v }; S.fakt = fotR5(S.fakt + fk.v - prev);
                    const rr = S.rows.find(x => x.r === oth.r); if (rr) { if (rr.prog !== null) S.fc = fotR5((S.fc || 0) + fk.v - (rr.fakt || 0)); rr.fakt = fk.v; }
                    S.unal = S.unal.filter(u => add.indexOf(u) < 0); } }
                // 3) xato: boshqa sexning summasiga oʻxshasa — izoh
                (S.diff || []).forEach(d => { const row = P.rows.find(r => r.r === d.r); if (!row || !row.keys) return; for (const c of cehs) { if (c === S.ceh) continue; const v = fotFakt(R6, c, row, new Set()); if (v.n && Math.abs(v.v - d.old) < 1) { d.like = c; d.likeN = (res.sheets.find(x => x.ceh === c && !/задание/i.test(x.name)) || {}).name || c + '-sex'; break; } } });
                // 4) АУП va КНСМ prognozi — qoʻlda kiritiladi: ilova yozmaydi
                if (FOT_NOPROG_RX.test(S.name)) { S.noProg = true; Object.keys(up).forEach(k => { if (k.replace(/\d+$/, '') === col) delete up[k]; });
                    let pc = 0, fc = 0; S.rows.forEach(x => { const c = P.C[col + x.r]; const n = c && c.v !== null && c.v !== '' && typeof c.v !== 'object' && !(typeof c.v === 'string' && /[\[!']/.test(c.v)) ? Number(c.v) : NaN; x.prog = isNaN(n) ? null : n; if (x.prog !== null) { pc += x.prog; fc += x.fakt || 0; } }); S.pc = pc; S.fc = fotR5(fc); }
            });
        }
        // faylda xato kataklarni qizil rang bilan belgilash (asl uslubi saqlanadi, faqat fon qizil)
        if (typeof fotWrite === 'function') fotWrite = agmkExtend('fotWrite', 'v3.11.2: xato kataklar qizil', fotWrite, o => function (B, res) {
            const miss = o.apply(this, arguments);
            try {
                const errs = res.sheets.filter(s => s.path && fotRedCells(s).length); if (!errs.length) return miss;
                let st = B.rd('xl/styles.xml'); const fills = st.match(/<fills\b[^>]*>([\s\S]*?)<\/fills>/); const xfs = st.match(/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/); if (!fills || !xfs) return miss;
                const nFill = (fills[1].match(/<fill\b/g) || []).length; const xfL = xfs[1].match(/<xf\b[^>]*?(?:\/>|>[\s\S]*?<\/xf>)/g) || []; const add = [], map = {};
                const red = s => { s = +s || 0; if (map[s] !== undefined) return map[s]; let x = xfL[s] || xfL[0] || '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'; x = x.replace(/\sfillId="\d+"/, '').replace(/\sapplyFill="\d"/, '').replace(/^<xf\b/, '<xf fillId="' + nFill + '" applyFill="1"'); map[s] = xfL.length + add.length; add.push(x); return map[s]; };
                errs.forEach(S => { let x = B.rd(S.path); fotRedCells(S).forEach(ref => { x = x.replace(new RegExp('<c r="' + ref + '"([^>]*?)(/?)>'), (m, at, sl) => { const s = (at.match(/\ss="(\d+)"/) || [])[1]; return '<c r="' + ref + '"' + at.replace(/\ss="\d+"/, '') + ' s="' + red(s) + '"' + sl + '>'; }); }); B.zip.file(S.path, x); });
                st = st.replace(/<fills\b([^>]*)>([\s\S]*?)<\/fills>/, (m, a, b) => '<fills' + a.replace(/count="\d+"/, 'count="' + (nFill + 1) + '"') + '>' + b + '<fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill></fills>');
                st = st.replace(/<cellXfs\b([^>]*)>([\s\S]*?)<\/cellXfs>/, (m, a, b) => '<cellXfs' + a.replace(/count="\d+"/, 'count="' + (xfL.length + add.length) + '"') + '>' + b + add.join('') + '</cellXfs>');
                B.zip.file('xl/styles.xml', st);
            } catch (e) { console.error(e); }
            return miss;
        });
        if (typeof fotResHtml === 'function') fotResHtml = agmkExtend('fotResHtml', 'v3.11.2: xatolar soni', fotResHtml, o => function (res) {
            let h = o.apply(this, arguments);
            try {
                const n = fotErrAll(res).length + fotAccAll(res).length, t = res.sheets.reduce((a, s) => a + (s.talon || []).length, 0);
                const box = `<div class="nd-tip" style="border-color:${n ? '#ef4444' : '#22c55e'};color:${n ? '#fecaca' : '#bbf7d0'}">${n ? `❌ <b>${n} ta xato</b>: qoʻlda yozilgan summa 6203 ga mos emas yoki 6203 da notoʻgʻri schyot — faylda qizil belgilandi.` : '✅ Xato topilmadi.'}${t ? `<br>🎫 ${t} ta talon (978) katagi boʻsh — buxgalteriyadan olib qoʻlda kiriting.` : ''}${(res.zero || []).length ? `<br>0️⃣ «00» sex: ${res.zero.length} ta summa — hech qaysi sexga qoʻshilmadi, avval koʻrib chiqing.` : ''}${res.sheets.some(s => (s.cap || []).length) ? '<br>❌ Kiritilmadi: 311800 / 889900 summalari jadvalga yozilmadi — roʻyxatda.' : ''}${res.sheets.some(s => s.noProg) ? '<br>✍️ АУП ishlab chiqarish prognozi qoʻlda kiritiladi — ilova tegmadi.' : ''}${(res.lay || []).length ? '<br>🔁 ' + res.lay.length + ' ta varaq ЖДЦ-1 namunasidagidek «Август»dan boshlanadigan koʻrinishga oʻtkazildi (Январь–Июль ustunlari olib tashlandi): ' + res.lay.map(escapeHtml).join(', ') : ''} <button class="mini-btn" onclick="fotErrOpen()">Roʻyxat</button></div>`;
                h = h.replace('<div class="hs-acts">', box + '<div class="hs-acts">'); h = h.replace('📊 Svod (Excel)', '📊 Qisqa svod (qoʻshimcha)').replace('📥 Toʻldirilgan fayl (xuddi shu shaklda)', '📥 NATIJA — toʻldirilgan fayl (sizning shabloningiz)'); if (res.cleared) h = h.replace('<div class="hs-acts">', `<div class="nd-tip">🧹 Hisoblanayotgan oyning ${res.cleared} ta katagi (Прогноз va Факт) tozalanib, ilova qayta toʻldirdi. Boshqa oylarga tegilmadi.</div><div class="hs-acts">`);
                res.sheets.forEach((s, i) => { const k = fotRedCells(s).length; if (k) h = h.replace(`onclick="fotSheetOpen(${i})" style="cursor:pointer"><td>`, `onclick="fotSheetOpen(${i})" style="cursor:pointer"><td><b style="color:#f87171">❌${k}</b> `); });
            } catch (e) { console.error(e); }
            return h;
        });
        if (typeof fotSheetOpen === 'function') fotSheetOpen = agmkExtend('fotSheetOpen', 'v3.11.2: xato sarlavhasi', fotSheetOpen, o => function (i) {
            const r = o.apply(this, arguments);
            try { const m = $id('fotSh'); if (m) m.querySelectorAll('.inf-sec').forEach(x => { if (/Oldin qoʻlda yozilgandan farq/.test(x.textContent)) x.innerHTML = x.innerHTML.replace(/✏️ Oldin qoʻlda yozilgandan farq qiladi/, '❌ XATO — faylda yozilgan summa 6203 ga mos emas (toʻgʻrilandi, faylda qizil)'); }); } catch (e) {}
            return r;
        });
        if (typeof fotSumXlsx === 'function') fotSumXlsx = agmkExtend('fotSumXlsx', 'v3.11.2: xatolar roʻyxati svodda', fotSumXlsx, o => function () {
            const r = FOTS.res; if (!r) return o.apply(this, arguments); const L = fotErrAll(r);
            const keep = xlsxDl; xlsxDl = function (rows, name) { xlsxDl = keep; try { if (L.length) { rows.push([], ['XATOLAR — faylda qoʻlda yozilgan summa 6203 ga mos emas'], ['Sex', 'Katak', 'Qator', 'Faylda edi', 'Formula', '6203 boʻyicha', 'Farq']); L.forEach(d => rows.push([d.sh, d.ref, d.lbl, d.old, d.of ? '=' + d.of : '', d.nw, fotR5(d.old - d.nw)])); } const T = [].concat(...r.sheets.map(s => (s.talon || []).map(t => [s.name, t.ref, t.lbl, t.prev]))); if (T.length) { rows.push([], ['Talonlar (978) — bu oy boʻsh, buxgalteriyadan kiritilsin'], ['Sex', 'Katak', 'Qator', 'Oʻtgan oy']); T.forEach(t => rows.push(t)); } const Z = r.zero || []; if (Z.length) { rows.push([], ['«00» sex summalari — hech qaysi sexga qoʻshilmadi'], ['Boʻlim', 'Schyot', 'В/О', 'Summa, soʻm']); Z.forEach(z => rows.push([z.sec, z.sch, z.vo, z.m])); } const CP = [].concat(...r.sheets.filter(s => !/задание/i.test(s.name)).map(s => (s.cap || []).map(c => [s.name, s.ceh, c.sch, c.vo, c.m]))); if (CP.length) { rows.push([], ['❌ Kiritilmadi: 311800, 889900'], ['Sex', 'Kod', 'Schyot', 'В/О', 'Summa, soʻm']); CP.forEach(x => rows.push(x)); } const A = fotAccAll(r); if (A.length) { rows.push([], ['XATOLAR — 6203 da notoʻgʻri schyot'], ['Sex', 'Katak', 'Qator', '6203 dagi schyot', 'Blok', 'В/О', 'Summa, soʻm']); A.forEach(d => rows.push([d.sh, d.ref, d.lbl, d.sch, d.blk, d.vo, d.m])); } } catch (e) {} return keep.apply(this, arguments); };
            try { return o.apply(this, arguments); } finally { xlsxDl = keep; }
        });
        if (typeof fotBadAll === 'function') fotBadAll = agmkExtend('fotBadAll', 'v3.11.2: shablonda yoʻq schyotlar ham spravkaga', fotBadAll, o => function () {
            const L = o.apply(this, arguments); try { const m = {}; fotAccAll(FOTS.res).forEach(d => { const k = d.ceh + '|' + d.sch + '|' + d.blk + '|' + d.vo; m[k] = d.m; }); Object.keys(m).forEach(k => { const [ceh, a, b, vo] = k.split('|'); if (!L.some(x => x.ceh === ceh && x.sch0 === a && x.vo === +vo)) L.push({ ceh: ceh, sch0: a, sch: b, vo: +vo, m: fotR5(m[k]) }); }); } catch (e) {} return L; });
        // 4) Spravka: har bir sex boʻyicha alohida — oʻsha sexning iqtisodchisi imzolaydi (iqtisodchi javobi, 05.10.2026)
        var FOT_SPR_KEY = 'agmk_fot_sprav_cfg';
        function fotSprCfg() { const c = Object.assign({ to: 'Bosh buxgalter', toName: '', pos: 'Iqtisodchi', ec: {} }, kvGet(FOT_SPR_KEY, {}) || {}); c.ec = c.ec || {}; return c; }
        function fotCehName(ceh) { const r = FOTS.res; const s = r && r.sheets.find(x => String(x.ceh) === String(ceh) && !/задание/i.test(x.name)); return s ? s.name : ceh + '-sex'; }
        fotSprav = function () {
            const L = fotBadAll(); if (!L.length) { showToast('Spravka uchun notoʻgʻri schyot topilmadi'); return; }
            const c = fotSprCfg(), E = escapeHtml, cehs = Array.from(new Set(L.map(x => String(x.ceh)))).sort();
            mdl('fotSpr', `<div class="px-h"><b>📝 Spravka — har sex boʻyicha alohida</b><button class="mini-btn" onclick="mdlClose('fotSpr')">✕</button></div>
                <div class="form-group"><label>Kimga (lavozimi):</label><input id="fsTo" value="${E(c.to)}"></div>
                <div class="form-group"><label>Kimga (F.I.Sh.):</label><input id="fsToN" value="${E(c.toName)}" placeholder="masalan: @@N:340@@"></div>
                <div class="form-group"><label>Imzolovchi lavozimi:</label><input id="fsPos" value="${E(c.pos)}"></div>
                <div class="inf-sec">Har sexning iqtisodchisi (imzolaydi)</div>
                ${cehs.map(k => `<div class="form-group"><label>${E(fotCehName(k))} (${E(k)}) — ${L.filter(x => String(x.ceh) === k).length} ta qator:</label><input class="fsEc" data-ceh="${E(k)}" value="${E(c.ec[k] || '')}" placeholder="iqtisodchi F.I.Sh."></div>`).join('')}
                <div class="nd-tip">Bir marta kiritiladi va eslab qolinadi. Har sex alohida sahifada, oʻz iqtisodchisi imzosi bilan chiqadi.</div><button class="action-btn" onclick="fotSprGo()">📥 Spravkani yuklab olish</button>`, true);
        };
        function fotSprGo() {
            const c = fotSprCfg(); c.to = $id('fsTo').value.trim() || 'Bosh buxgalter'; c.toName = $id('fsToN').value.trim(); c.pos = $id('fsPos').value.trim() || 'Iqtisodchi';
            document.querySelectorAll('#fotSpr .fsEc').forEach(i => { const v = i.value.trim(); if (v) c.ec[i.dataset.ceh] = v; else delete c.ec[i.dataset.ceh]; }); kvSet(FOT_SPR_KEY, c); mdlClose('fotSpr');
            const R = FOTS.r6, L = fotBadAll(), E = escapeHtml, mon = FOT_MUZ[R.mon] || '', cehs = Array.from(new Set(L.map(x => String(x.ceh)))).sort(), dt = new Date().toLocaleDateString('ru-RU');
            const page = (k, last) => { const P = L.filter(x => String(x.ceh) === k), tot = fotR5(P.reduce((a, x) => a + x.m, 0));
                return `<div style="${last ? '' : 'page-break-after:always;'}"><p style="text-align:right">${E(c.to)}${c.toName ? '<br>' + E(c.toName) + 'ga' : 'ga'}</p>
                <h3 style="text-align:center">MAʼLUMOTNOMA<br><small>${E(fotCehName(k))} (${E(k)}-sex) — 6203 hisobotida (${E(mon)} ${R.year}) notoʻgʻri koʻrsatilgan balans schyotlari toʻgʻrisida</small></h3>
                <p>ФОТ tahlili davomida «ТС6203 — распределение з/пл по производственным счетам» hisobotida ${E(fotCehName(k))} boʻyicha quyidagi summalar notoʻgʻri balans schyotiga yozilgani aniqlandi. Bu summalar ФОТ tahliliga qoʻshilmadi; hisobotni tuzatishingizni soʻraymiz.</p>
                <table><tr><th>№</th><th>6203 dagi schyot</th><th>Toʻgʻri schyot</th><th>В/О</th><th>Summa, soʻm</th></tr>
                ${P.map((x, i) => `<tr><td>${i + 1}</td><td>${E(x.sch0)}</td><td>${E(x.sch || '— (shablonda yoʻq)')}</td><td>${x.vo}</td><td class="n">${narF(x.m, 2)}</td></tr>`).join('')}
                <tr><td colspan="4"><b>Jami</b></td><td class="n"><b>${narF(tot, 2)}</b></td></tr></table>
                <p style="margin-top:30px">${E(fotCehName(k))} — ${E(c.pos)} ____________ ${E(c.ec[k] || '')}</p><p>Sana: ${E(dt)}</p></div>`; };
            const html = `<html><head><meta charset="utf-8"><title>Spravka</title><style>body{font-family:'Times New Roman',serif;font-size:13pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4px 6px}td.n{text-align:right}</style></head><body>${cehs.map((k, i) => page(k, i === cehs.length - 1)).join('')}</body></html>`;
            docDownload([{ name: '6203_notogri_schyotlar_' + mon + '_' + R.year + '.doc', mime: 'application/msword', blob: new Blob(['﻿', html], { type: 'application/msword' }) }]);
        }

        // ilova namunasidan oʻrganilgan «qator → prognoz ustuni» (iqtisodchining ЖДЦ-1 havolalaridan) — faylda havola boʻlmasa ham ishlaydi
        var FOT_LC_DEF = { 'тариф': 'AB', 'разница между штатным и гарант.окладом': 'AE', 'премия': 'AF,BE', 'приработок': 'AI', 'совмещение профессий': 'AL', 'ночные часы': 'AQ', 'бригадирские': 'AZ', 'районный коэффициент': 'BG', 'талоны': 'BJ', 'отпуск': 'BK', 'прочие неявки': 'BM', 'выслуга лет': 'CB', 'материальная помощь к отпуску': 'CB', 'единовременное премирование': 'CD', 'пособие по выходу на пенсию': 'CD', 'подготовка кадров': 'CG', 'учебный отпуск': 'CG' };
        if (typeof fotLearnCols === 'function') fotLearnCols = agmkExtend('fotLearnCols', 'v3.13.1: namunadagi ustunlar', fotLearnCols, o => function () { const r = o.apply(this, arguments) || {}; Object.keys(FOT_LC_DEF).forEach(k => { if (!r[k]) r[k] = FOT_LC_DEF[k]; }); return r; });
        if (typeof fotWrite === 'function') fotWrite = agmkExtend('fotWrite', 'v3.13.1: havola matnlarini tozalash', fotWrite, o => function (B, res) {
            try { const L = (FOTS._clr || {}).links || {}; Object.keys(L).forEach(p => { const up = res.upd[p] || {}, rm = L[p].filter(ref => !up[ref]); if (!rm.length) return; let x = B.rd(p); rm.forEach(ref => { x = x.replace(new RegExp('<c r="' + ref + '"([^>]*?)(?:/>|>[\\s\\S]*?</c>)'), (m, at) => { const st = (at.match(/\bs="(\d+)"/) || [])[1]; return '<c r="' + ref + '"' + (st ? ' s="' + st + '"' : '') + '/>'; }); }); B.zip.file(p, x); }); } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });
        // v3.13.1: saqlanadigan faylning turi — kengaytmasiga qarab (aks holda telefon Excel faylni «ZIP arxiv» deb ochadi)
        var FILE_MIME = { xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12', xls: 'application/vnd.ms-excel', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword', pdf: 'application/pdf', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', csv: 'text/csv', txt: 'text/plain', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', zip: 'application/zip' };
        if (typeof docDownload === 'function') docDownload = agmkExtend('docDownload', 'v3.13.1: fayl turi kengaytmaga mos', docDownload, o => function (files) {
            try { (files || []).forEach(f => { const ext = String(f.name || '').toLowerCase().split('.').pop(), mt = FILE_MIME[ext]; if (mt && f.blob && f.blob.type !== mt) { f.blob = new Blob([f.blob], { type: mt }); f.mime = mt; } }); } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });
        if (typeof docShare === 'function') docShare = agmkExtend('docShare', 'v3.13.1: fayl turi kengaytmaga mos', docShare, o => function (files) {
            try { (files || []).forEach(f => { const ext = String(f.name || '').toLowerCase().split('.').pop(), mt = FILE_MIME[ext]; if (mt && f.blob && f.blob.type !== mt) { f.blob = new Blob([f.blob], { type: mt }); f.mime = mt; } }); } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });

