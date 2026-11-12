        //  Bosh sahifadagi ayrim kartochkalarning bosish amali JS orqali berilgan (onclick xususiyati) — guruh sahifasiga nusxa olinganda u koʻchmasdi
        //  (masalan «MTTB → Kirim va berish»). Endi nusxa bosilganda asl kartochkaning amali bajariladi.
        (function () {
            if (typeof menuGrpOpen === 'function') menuGrpOpen = agmkExtend('menuGrpOpen', 'v3.15: guruh kartochkalari amali', menuGrpOpen, o => function (g) {
                const r = o.apply(this, arguments);
                try {
                    document.querySelectorAll('#screen-grp .card-list .btn-card').forEach(x => {
                        if (x.getAttribute('onclick') || x._fx) return; const mn = x.dataset.mn; if (!mn) return;
                        const orig = document.querySelector('#main-card-list > .btn-card[data-mn="' + String(mn).replace(/"/g, '') + '"]'); if (!orig || typeof orig.onclick !== 'function') return;
                        x._fx = 1; x.addEventListener('click', ev => { try { orig.onclick.call(orig, ev); } catch (e) { console.error(e); } });
                    });
                } catch (e) { console.error(e); }
                return r;
            });
        })();

            // ===== [v3.15.1 modul: fotx — ФОТ tahlili: iqtisodchi tasdiqlagan namuna qoidalari (06.10.2026)] =====
        //  1) Fakt — butun minglik son (kasr va «=a+b» formulasiz): 7 503,80881 → 7 504
        //  2) 6203 dagi notoʻgʻri kod (023100, 025200, 022100 …) — QOʻSHILMAYDI, xato roʻyxati va spravkaga
        //  3) Shablonda yoʻq hisobvaraq (271xxx, 311800, 889900, 233200 …) — QOʻSHILMAYDI, xato. Ichki schyot (221006 → 221000, 4 raqami bir xil) — qoʻshiladi
        //  4) АХЧ = 81-sex, АУП = 80-sex; Ёшлик (45) hech qayerga; «задание» varaqlariga tegilmaydi
        //  5) Bitta 6203 summasi ikki qatorga yozilmaydi (shablonda bir В/О ikki qatorda boʻlsa — birinchisiga, ogohlantirish bilan)
        //  6) «ФОТ – всего» ga kirmaydigan (sarlavhasiz) qatorlarga yozilmaydi
        //  7) KNSM prognozi prognoz faylidan (Добыча, Вскрыша, Шархия, Шлаковый отвал, Выпуск; umumiy «КНСМ» qatori → Выпуск)
        //  8) «6203 bilan tekshiruv» Excel: Svod (6203 jami = yozildi + xato), Xatolar, Qatorlar farqi
        var FOTX = { U: {} };
        function fotUsedNew(ceh) {
            const u = Object.assign(new Set(), { dup: [] });
            try { const U = (FOTX.U[ceh] = FOTX.U[ceh] || new Set()), add = u.add; u.add = function (v) { if (typeof v === 'number') U.add(v); return add.call(this, v); }; } catch (e) {}
            return u;
        }
        (function () {
            try {
                if (typeof fotRun !== 'function') return;
                // 4) sex kodlari
                FOT_CEH['ахч'] = '81'; FOT_CEH['ауп'] = '80';
                try { if (!localStorage.getItem('agmk_fot_mig3151')) { const c = fotCfg(); c.map['ахч'] = '81'; c.map['ауп'] = '80'; Object.keys(c.map).forEach(k => { if (/задание/i.test(k)) delete c.map[k]; }); kvSet(FOT_KEY, c); localStorage.setItem('agmk_fot_mig3151', '1'); } } catch (e) {}
                fotGuess = agmkExtend('fotGuess', 'v3.15.1: «задание» varaqlari tahlil qilinmaydi', fotGuess, o => function (n) { return /задание/i.test(String(n)) ? '' : o.apply(this, arguments); });
                // 1) butun minglik
                fotFk = function (parts) { const t = parts.reduce((a, b) => a + b, 0); return { v: Math.round(t), f: '', n: parts.length, parts: parts }; };
                // 5) bir summa — bir marta
                fotFakt = function (R6, ceh, row, used) {
                    const parts = [];
                    R6.recs.forEach((x, i) => {
                        if (x.ceh !== ceh || !x.m) return; const okSec = row.per ? FOT_SEC_PER.test(x.sec) : x.sec === FOT_SEC_FOND; if (!okSec) return;
                        if (!row.keys.some(([a, cs]) => (a === '*' || (row.per ? a === x.sch : fotAccOk(a, x.sch, row.allAcs))) && (cs === '*' || cs.indexOf(x.vo) >= 0))) return;
                        if (used.has(i)) { if (used.dup && !(row.per && row.keys.every(k => k[1] === '*'))) used.dup.push({ i: i, lbl: row.lbl, x: x }); return; }
                        used.add(i); const k = fotK(x.m); if (k) parts.push(k);
                    });
                    return fotFk(parts);
                };
                // 3) shablonda yoʻq schyot — blokka qoʻshilmaydi (faqat 4 raqami bir xil ichki schyot qoʻshiladi)
                fotAccOk = function (a, sch, allAcs) { if (a === sch) return true; if (allAcs.has(sch)) return false; const b = fotBlockOf(sch, allAcs); return !!b && b.L >= 4 && b.blk === (allAcs.blk ? allAcs.blk.get(a) : null); };
                // 6) «ФОТ – всего» (7-qator) formulalariga kirmaydigan qatorlar tashlab yuboriladi
                fotSheetPlan = agmkExtend('fotSheetPlan', 'v3.15.1: jamiga kirmaydigan qatorlar', fotSheetPlan, o => function (B, sh, cache) {
                    const P = o.apply(this, arguments);
                    try {
                        if (P._x151) return P; const C = P.C, G = {};
                        Object.keys(C).forEach(k => { const c = C[k]; if (!c || !c.f || /[!\[]/.test(c.f)) return; const r = +k.match(/\d+$/)[0], g = G[r] = G[r] || new Set();
                            String(c.f).replace(/\$?[A-Z]{1,3}\$?(\d+)(?::\$?[A-Z]{1,3}\$?(\d+))?/g, (m, a, b) => { a = +a; b = b ? +b : a; for (let x = a; x <= b; x++) if (x !== r) g.add(x); return m; }); });
                        const seen = new Set(), st = [7]; while (st.length) { const r = st.pop(); if (seen.has(r)) continue; seen.add(r); (G[r] || []).forEach(x => st.push(x)); }
                        if (seen.size > 20) { P.skipRows = P.rows.filter(x => !seen.has(x.r)).map(x => x.r); P.rows = P.rows.filter(x => seen.has(x.r)); }
                        P._x151 = 1;
                    } catch (e) { console.error(e); }
                    return P;
                });
                // 7) prognoz fayli: sexlarning umumiy roʻyxati («Заработная плата по расходам периода» dan keyingi qism) olinmaydi — ikki marta sanalmasin;
                //    KNSM boʻlinmasi koʻrsatilmagan blokdagi umumiy «КНСМ» qatori → Выпуск
                fotFcIndex = agmkExtend('fotFcIndex', 'v3.15.1: KNSM prognozi', fotFcIndex, o => function (FB, shName) {
                    const L = o.apply(this, arguments); if (!L) return L;
                    const k = L.findIndex(x => /^Заработная плата по расходам периода/i.test(x.lab)), R = k >= 0 ? L.slice(0, k) : L;
                    const SUB = /^(Выпуск|Добыча|Вскрыша|Шархия|Шлаков)/i;
                    R.forEach((x, i) => { if (!/^КНСМ$/i.test(x.lab.trim())) return; const ak = x.acs.join(','); let has = false; for (let j = i + 1; j < R.length && R[j].acs.join(',') === ak; j++) { if (SUB.test(R[j].lab)) { has = true; break; } } if (!has) x.lab = 'Выпуск (КНСМ — umumiy)'; });
                    return R;
                });
                FOT_NOPROG_RX = /ауп/i; // АУП prognozi — iqtisodchi qoʻlda; KNSM endi prognoz faylidan
                // 2) + xatolar roʻyxati
                fotRun = agmkExtend('fotRun', 'v3.15.1: notoʻgʻri va shablonda yoʻq schyotlar qoʻshilmaydi', fotRun, o => function (R6, B, FB, map, opt) {
                    const m2 = {}; Object.keys(map || {}).forEach(k => { if (!/задание/i.test(k)) m2[k] = map[k]; });
                    const bad = []; R6.recs.forEach((x, i) => { if (x.sch0 && x.sch0 !== x.sch && x.m) { bad.push({ i: i, x: x, m: x.m }); x.m = 0; } });
                    FOTX.U = {}; let res;
                    try { res = o.call(this, R6, B, FB, m2, opt); } finally { bad.forEach(b => { b.x.m = b.m; }); }
                    try { fotXato(R6, res, bad); } catch (e) { console.error(e); }
                    return res;
                });
                fotBadAll = function () { const r = FOTS.res; if (!r || !r.xato) return []; return r.xato.filter(x => x.t !== 'dup').map(x => ({ ceh: x.ceh, sch0: x.sch0, sch: x.sch, vo: x.vo, m: x.m, t: x.t })); };
                fotResHtml = agmkExtend('fotResHtml', 'v3.15.1: 6203 bilan tekshiruv', fotResHtml, o => function (res) {
                    let h = o.apply(this, arguments);
                    try {
                        const X = (res.xato || []).filter(x => x.t !== 'dup'), D = (res.xato || []).filter(x => x.t === 'dup'), C = res.chk || [];
                        const okAll = C.every(c => Math.abs(c.jami - c.wr - c.err) <= 3), sum = fotR5(X.reduce((a, x) => a + x.m, 0) / 1000);
                        const box = `<div class="nd-tip" style="border-left:3px solid ${okAll ? '#16a34a' : '#dc2626'}">${okAll ? '✅' : '⚠️'} <b>6203 bilan tekshiruv:</b> har bir sexda «6203 jami = faylga yozildi + xato» ${okAll ? '(farq ±3 — minglikka yaxlitlashdan)' : '— mos kelmagan sex bor, Excel’ni oching'}.<br>
                            ❌ Faylga qoʻshilmagan (xato): <b>${X.length}</b> ta, jami <b>${fotN(sum)}</b> ming — notoʻgʻri kod va shablonda yoʻq hisobvaraqlar.${D.length ? `<br>⚠️ Shablonda bir В/О ikki qatorda: ${D.length} ta (summa bir marta yozildi).` : ''}${(res.noSheet || []).length ? `<br>ℹ️ Varagʻi yoʻq sexlar (qoʻshilmadi): ${res.noSheet.map(n => n.ceh + ' — ' + fotN(n.m / 1000)).join('; ')} ming.` : ''}
                            <div style="margin-top:6px"><button class="mini-btn" onclick="fotChkXlsx()">📋 6203 bilan tekshiruv (Excel)</button></div></div>`;
                        const i = h.indexOf('<div class="hs-acts">'); h = i >= 0 ? h.slice(0, i) + box + h.slice(i) : h + box;
                    } catch (e) { console.error(e); }
                    return h;
                });
            } catch (e) { console.error('fotx', e); }
        })();
        function fotXato(R6, res, bad) {
            const SEC = s => (/^ФОНД ОПЛАТЫ/.test(s) && !/ЁШЛИК/i.test(s)) || /^ВЫПЛАТЫ, ВХОДЯЩИЕ/.test(s);
            const first = {}; res.sheets.forEach(S => { if (!first[S.ceh]) first[S.ceh] = S; });
            const badI = new Map(bad.map(b => [b.i, b])); res.xato = []; res.chk = [];
            Object.keys(first).forEach(ceh => {
                const S = first[ceh], U = FOTX.U[ceh] || new Set(), po = new Set([].concat(S.perOther || [], S.manual || []).map(x => x.sch + '|' + x.vo));
                let jami = 0, err = 0; const agg = {};
                R6.recs.forEach((x, i) => {
                    if (x.ceh !== ceh || !SEC(x.sec)) return; const b = badI.get(i), m = b ? b.m : x.m; if (!m) return; jami += m;
                    let t = null; if (b) t = 'kod'; else if (!U.has(i) && !po.has(x.sch + '|' + x.vo)) t = 'yoq'; if (!t) return;
                    err += m; const k = [t, x.sch0 || x.sch, t === 'kod' ? x.sch : '', x.vo, x.sec.replace(/\s+/g, ' ').slice(0, 40)].join('|'); agg[k] = (agg[k] || 0) + m;
                });
                Object.keys(agg).forEach(k => { const [t, s0, s, vo, sec] = k.split('|'); if (Math.abs(agg[k]) < 0.005) return; res.xato.push({ sh: S.name, ceh: ceh, t: t, sch0: s0, sch: s, vo: +vo, m: fotR5(agg[k]), sec: sec }); });
                (S.dup || []).forEach(d => res.xato.push({ sh: S.name, ceh: ceh, t: 'dup', sch0: d.sch, sch: '', vo: d.vo, m: d.m, lbl: d.lbl, sec: 'ФОНД ОПЛАТЫ' }));
                const wr = S.rows.reduce((a, r) => a + (r.fakt || 0), 0);
                res.chk.push({ sh: S.name, ceh: ceh, jami: Math.round(jami / 1000), wr: Math.round(wr), err: Math.round(err / 1000), pc: Math.round(S.pc || 0) });
            });
            const ord = res.sheets.map(s => s.name); res.xato.sort((a, b) => ord.indexOf(a.sh) - ord.indexOf(b.sh) || (a.t === 'dup') - (b.t === 'dup') || Math.abs(b.m) - Math.abs(a.m));
            const tot = {}; R6.recs.forEach(x => { if (first[x.ceh] || !x.m) return; if (!(/^ФОНД ОПЛАТЫ/.test(x.sec) || /^ВЫПЛАТЫ, ВХОДЯЩИЕ/.test(x.sec))) return; tot[x.ceh] = (tot[x.ceh] || 0) + x.m; });
            res.noSheet = Object.keys(tot).sort().filter(k => Math.abs(tot[k]) >= 1000).map(k => ({ ceh: k, m: fotR5(tot[k]) }));
        }
        // 8) Excel: bir nechta varaqli oddiy kitob (JSZip)
        function fotXlsxBook(sheets) {
            const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
            const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            try { void window.XLSX; } catch (e) {} // kutubxona (JSZip bilan) talab boʻlganda yuklanadi
            const z = new JSZip();
            const sx = sheets.map((S, si) => {
                const rows = S.rows, hr = S.head || 0, wid = [];
                rows.forEach(r => (r || []).forEach((v, i) => { wid[i] = Math.min(70, Math.max(wid[i] || 8, String(v == null ? '' : v).length + 2)); }));
                const data = rows.map((r, ri) => `<row r="${ri + 1}">` + (r || []).map((v, ci) => { const ref = col(ci) + (ri + 1), st = ri === hr ? 1 : (ri < hr ? 3 : (typeof v === 'number' ? 4 : 2)); if (v === null || v === undefined || v === '') return `<c r="${ref}" s="${st}"/>`; if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}" s="${st}"><v>${v}</v></c>`; return `<c r="${ref}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`; }).join('') + '</row>').join('');
                z.file(`xl/worksheets/sheet${si + 1}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${hr + 1}" topLeftCell="A${hr + 2}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${wid.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${(S.w && S.w[i]) || w}" customWidth="1"/>`).join('')}</cols><sheetData>${data}</sheetData></worksheet>`);
                return S.name;
            });
            z.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sx.map((n, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`);
            z.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
            z.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sx.map((n, i) => `<sheet name="${esc(n).slice(0, 31)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`);
            z.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sx.map((n, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sx.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
            z.file('xl/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0;[Red]-#,##0"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Times New Roman"/></font><font><b/><sz val="12"/><name val="Times New Roman"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom></border></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="5"><xf/><xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf><xf borderId="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf><xf fontId="2" applyFont="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf><xf numFmtId="164" borderId="1" applyNumberFormat="1" applyBorder="1"/></cellXfs></styleSheet>`);
            return z.generate({ type: 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }
        function fotChkXlsx() {
            const r = FOTS.res; if (!r || !r.chk) { showToast('Avval hisoblang'); return; }
            const mon = FOT_MUZ[r.mon] || '', T = { kod: 'Notoʻgʻri hisobvaraq kodi — qoʻshilmadi', yoq: 'Shablonda yoʻq hisobvaraq — qoʻshilmadi', dup: 'Shablonda bu В/О ikki qatorda — summa bir marta (birinchi qatorga) yozildi' };
            const C = r.chk, tot = k => C.reduce((a, c) => a + (c[k] || 0), 0);
            const svod = [['ФОТ tahlili — ' + mon + ' ' + (r.year || '') + ': Fakt 6203 bilan solishtirildi (ming soʻm)'], ['6203 jami = «ФОНД ОПЛАТЫ» + «ВЫПЛАТЫ, ВХОДЯЩИЕ В ФОТ». Tekshiruv: 6203 jami − faylga yozildi − xato ≈ 0 (±3 — har qatorni minglikka yaxlitlashdan).'],
                ['Sex varagʻi', 'Sex kodi', '6203 jami', 'Faylga yozildi (Fakt)', 'Xato (qoʻshilmadi)', 'Tekshiruv (≈0)', 'Prognoz (ishlab chiqarish)']]
                .concat(C.map(c => [c.sh, c.ceh, c.jami, c.wr, c.err, c.jami - c.wr - c.err, c.pc]))
                .concat([['JAMI', '', tot('jami'), tot('wr'), tot('err'), tot('jami') - tot('wr') - tot('err'), tot('pc')]]);
            if ((r.noSheet || []).length) { svod.push([], ['6203 da bor, lekin varagʻi yoʻq — qoʻshilmadi']); r.noSheet.forEach(n => svod.push(['Sex ' + n.ceh, n.ceh === '45' ? 'Ёшлик' : '', Math.round(n.m / 1000)])); }
            const xat = [['Xatolar roʻyxati (ming soʻm)'], ['Notoʻgʻri kod va shablonda yoʻq hisobvaraqlar faylga QOʻSHILMADI — bosh buxgalterga spravkaga kiradi.'], ['Sex varagʻi', 'Sex', '6203 dagi hisobvaraq', 'Toʻgʻrisi', 'В/О', 'Summa, ming', 'Xato turi', '6203 boʻlimi']]
                .concat((r.xato || []).map(x => [x.sh, x.ceh, x.sch0, x.sch || '', x.vo, Math.round(x.m / 100) / 10, T[x.t] + (x.lbl ? ' («' + x.lbl.trim() + '» qatoriga yozilmadi)' : ''), x.sec]));
            const fr = [['Faylda qoʻlda yozilgan summa 6203 dan farq qilgan kataklar (ming soʻm)'], ['«Faylda edi» — tozalashdan oldingi qiymat, «6203 boʻyicha» — ilova yozgan qiymat.'], ['Sex varagʻi', 'Katak', 'Qator', 'Faylda edi', '6203 boʻyicha', 'Farq']]
                .concat([].concat(...r.sheets.map(s => (s.diff || []).map(d => [s.name, d.ref || '', String(d.lbl || '').trim(), Math.round(d.old), Math.round(d.nw), Math.round(d.nw - d.old)]))));
            const blob = fotXlsxBook([{ name: 'Svod', rows: svod, head: 2, w: [26, 9, 14, 16, 16, 13, 16] }, { name: 'Xatolar', rows: xat, head: 2, w: [24, 6, 14, 11, 7, 13, 60, 32] }, { name: 'Qatorlar farqi', rows: fr, head: 2, w: [24, 9, 48, 14, 14, 12] }]);
            docDownload([{ name: 'FOT_' + mon + '_' + (r.year || '') + '_6203_tekshiruv.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: blob }]); showToast('📋 Tekshiruv fayli tayyorlandi');
        }

