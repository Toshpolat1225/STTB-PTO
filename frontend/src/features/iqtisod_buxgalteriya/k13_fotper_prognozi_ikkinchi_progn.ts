        //  Har oy 2 ta prognoz fayli: 1) ishlab chiqarish qismi (avvalgidek); 2) «… РАСХОДУ ПЕРИОД» — «Расходы периода» qatorlari shu fayldan.
        //  Iqtisodchi ЖДЦ-1 da qoʻygan havolalar boʻyicha (oy varagʻi, sexning umumiy qatori):
        //    Выслуга лет → CB · Материальная помощь к отпуску → BY · Единовременное премирование → CD · Пособие по выходу на пенсию → CF · Подготовка кадров → CG · Учебный отпуск → CH
        //  «Заработная плата по расходам периода» boʻlimidagi sex qatoridan (ЖДЦ-4, АХЧ, АУП havolalari):
        //    Расходы на оплату труда рабочих → BN − BL − BJ · Дополнительный отпуск → BL · Налогооблагаемые талоны → BJ
        //    АУП: «Аппарат управления» (АУП) + «Рабочие:» qatorlari; АХЧ «в т.ч. рыбоводы» → НПП boʻlimidagi АХЧ qatori, BN
        //  Sex varagʻida oʻsha oy katagiga alohida havola qoʻyilgan boʻlsa — oʻsha sex uchun havoladagi katak olinadi (ikkinchi fayldan).
        var FOT_PER_COLS = [[/^Выслуга/i, 'CB'], [/^Материальная помощь к отпуску/i, 'BY'], [/^Единовременное премирование(?!.*(8\s*Марта|оклад))/i, 'CD'], [/^Пособие по выходу/i, 'CF'], [/^Подготовка кадров/i, 'CG'], [/^Учебный отпуск/i, 'CH']];
        var FOT_PER_SUM = [[/^ЖДЦ-?\s*(\d)/i, m => new RegExp('^Железнодорожный цех\\s*№\\s*' + m[1] + '$', 'i')], [/^сцб$/i, () => /СЦБ/i], [/^сэ$/i, () => /энергоснабж/i], [/^спто$/i, () => /^СПТО$|подъ?е?мно/i], [/^ахч$/i, () => /^АХЧ$|хозяйствен/i], [/^вс$/i, () => /^Вагонн/i], [/^ауп$/i, () => /^Исполнит/i], [/^сво$/i, () => /внутренней охран/i], [/^асутп$/i, () => /АСУТП/i]];
        var FOT_PER_KN = [[/выпуск/i, /^Выпуск/i], [/добыча/i, /^Добыча/i], [/вскрыша/i, /^Вскрыша/i], [/шархия/i, /^Шархия/i], [/шлак/i, /^Шлаков/i]];
        function fotPerIndex(FB, shName) {
            const sh = FB.sheets.find(s => s.name.trim() === shName); if (!sh) return null;
            const C = fotCells(FB, FB.rd(sh.path)), L = [];
            Object.keys(C).forEach(k => { const m = k.match(/^([BC])(\d+)$/); if (!m) return; const r = +m[2]; let o = L[r]; if (!o) o = L[r] = { r: r, lab: '', c: '' }; if (m[1] === 'B') o.lab = typeof C[k].v === 'string' ? C[k].v.replace(/\s+/g, ' ').trim() : String(C[k].v == null ? '' : C[k].v).trim(); else o.c = C[k].v == null ? '' : String(C[k].v).trim(); });
            const R = L.filter(x => x && x.lab), heads = [];
            R.forEach((x, i) => { if (x.c) return; const nx = R[i + 1]; if (nx && /^1\.\s*ОСНОВНОЕ/i.test(nx.lab)) heads.push(x); });
            const z = R.findIndex(x => /^Заработная плата по расходам периода/i.test(x.lab)), h0 = heads.length ? heads[0].r : Infinity;
            const per = z >= 0 ? R.slice(z + 1).filter(x => !x.c && x.r < h0) : [];
            return { heads: heads, per: per, R: R };
        }
        function fotPerFill(R6, B, res, FB2) {
            const out = { n: 0, miss: [], src: [] }; if (!FB2) return out;
            const shName = FOT_FSH[res.mon], I = fotPerIndex(FB2, shName), FC = fotForecast(FB2), M = FC.get(shName); if (!I || !M) { out.miss.push('Ikkinchi faylda «' + shName + '» varagʻi topilmadi'); return out; }
            const val = (c, r) => { const v = M[c + r]; return typeof v === 'number' ? v : (v != null && !isNaN(parseFloat(v)) ? parseFloat(v) : 0); };
            const cache = {}, paths = Object.keys(res.upd), clrOld = (FOTS._clr && FOTS._clr.old) || {};
            res.sheets.forEach((S, si) => {
                const sh = B.sheets.find(x => x.path === S.path); if (!sh) return; const P = fotSheetPlan(B, sh, cache), col = P.mons[res.mon]; if (!col) return;
                const up = res.upd[S.path] = res.upd[S.path] || {}, old = clrOld[S.path] || P.C, nm = String(S.name).trim();
                // sexning umumiy qatori (yoki KNSM boʻlinmasi qatorlari)
                let sumRows = null; const kn = FOT_PER_KN.find(k => k[0].test(nm));
                if (kn) { const hk = I.heads.find(h => /^КНСМ$/i.test(h.lab)); if (hk) { const nh = I.heads.find(h => h.r > hk.r), end = nh ? nh.r : Infinity, SUB = /^(Выпуск|Добыча|Вскрыша|Шархия|Шлаков)/i;
                    sumRows = I.R.filter(x => x.r > hk.r && x.r < end && !x.c && (kn[1].test(x.lab) || (/выпуск/i.test(nm) && /\(КНСМ\)\s*$/i.test(x.lab) && !SUB.test(x.lab)))).map(x => x.r); } }
                else { const f = FOT_PER_SUM.find(s => s[0].test(nm)); if (f) { const rx = f[1](nm.match(f[0])); const h = I.heads.find(x => rx.test(x.lab)); if (h) sumRows = [h.r]; } }
                // «Заработная плата по расходам периода» boʻlimidagi qatorlar
                const perOf = rx => I.per.filter(x => rx.test(x.lab)).map(x => x.r);
                let wrk = [], aup = [], npp = [];
                if (/^ЖДЦ-?\s*\d/i.test(nm)) wrk = perOf(new RegExp('^Железнодорожный цех\\s*№\\s*' + nm.match(/\d/)[0] + '$', 'i'));
                else if (/^ахч$/i.test(nm)) { const a = perOf(/^АХЧ$/i), np = I.per.findIndex(x => /^НПП$/i.test(x.lab)); wrk = a.filter(r => np < 0 || r < I.per[np].r).slice(0, 1); npp = np >= 0 ? a.filter(r => r > I.per[np].r).slice(0, 1) : []; }
                else if (/^ауп$/i.test(nm)) { aup = perOf(/Аппарат управления/i); wrk = perOf(/^Рабочие:?$/i).slice(0, 1); }
                const sumC = (rows, c) => rows.reduce((a, r) => a + val(c, r), 0), net = rows => sumC(rows, 'BN') - sumC(rows, 'BL') - sumC(rows, 'BJ');
                P.rows.filter(r => r.per).forEach(row => {
                    const lbl = row.lbl, ref = col + row.r; let v = null, how = '';
                    // sexning oʻz havolasi (shu oy katagida) — ustun
                    const oc = old[ref], lf = oc && (oc.f || (typeof oc.v === 'string' && oc.v.indexOf(']') >= 0 ? oc.v : '')) || '';
                    const refs = lf && lf.indexOf(']') >= 0 ? fotRefs(lf) : [];
                    if (refs.length) { const MM = FC.get(refs[0].sh); if (MM && refs.every(x => MM[x.ref] !== undefined)) { v = refs.reduce((a, x) => a + x.op * (Number(MM[x.ref]) || 0), 0); how = 'havola'; } }
                    if (v === null) {
                        const c = FOT_PER_COLS.find(p => p[0].test(lbl));
                        if (c && sumRows && sumRows.length) { v = sumC(sumRows, c[1]); how = c[1]; }
                        else if (/^Расходы на оплату труда рабочих/i.test(lbl) && wrk.length) { v = net(wrk); how = 'BN−BL−BJ'; }
                        else if (/^Расходы на оплату труда АУП/i.test(lbl) && aup.length) { v = net(aup); how = 'BN−BL−BJ'; }
                        else if (/^Дополнительный отпуск/i.test(lbl) && (wrk.length || aup.length)) { v = sumC(wrk.concat(aup), 'BL'); how = 'BL'; }
                        else if (/^Налогооблагаемые талоны/i.test(lbl) && (wrk.length || aup.length)) { v = sumC(wrk.concat(aup), 'BJ'); how = 'BJ'; }
                        else if (/рыбовод/i.test(lbl) && npp.length) { v = sumC(npp, 'BN'); how = 'BN (НПП)'; }
                    }
                    if (v === null) return; v = Math.round(v); if (!v) { delete up[ref]; return; }
                    up[ref] = { f: '', v: v }; out.n++; out.src.push({ sh: nm, r: row.r, lbl: lbl, v: v, how: how });
                    const rr = S.rows.find(x => x.r === row.r); if (rr) rr.prog = v;
                });
                (P.skipRows || []).forEach(r => { const a = P.C['A' + r], lbl = a && typeof a.v === 'string' ? a.v.replace(/\s+/g, ' ').trim() : ''; if (!/рыбовод/i.test(lbl) || !npp.length) return; const v = Math.round(sumC(npp, 'BN')); if (!v) return; up[col + r] = { f: '', v: v }; out.n++; out.src.push({ sh: nm, r: r, lbl: lbl, v: v, how: 'BN (НПП)' }); });
                if (!sumRows || !sumRows.length) out.miss.push(nm + ': ikkinchi faylda sex qatori topilmadi');
            });
            return out;
        }
        // ---- «Расходы периода» FAKT: qatorga qaysi hisobvaraq / В/О tushishi — qator nomidagi qavsdan (iqtisodchi ЖДЦ-1 da yozib bergan, hamma sexga namuna) ----
        //  6 xonali — hisobvaraq (shu hisobvaraqning qolgan hamma В/О), qisqa — В/О kodi (istalgan hisobvaraqdan). Avval В/О koʻrsatilgan qatorlar, keyin hisobvaraq qatorlari.
        var FOT_ACC_FIX = { '942901': '942101' }; // АУП: 6203 va prognoz faylida 942101
        function fotPerBase(l) { return String(l || '').replace(/\([^()]*\)\s*$/, '').replace(/[\d,\s]+$/, '').replace(/[^а-яёa-z0-9]+$/i, '').replace(/\s+/g, ' ').trim().toLowerCase(); }
        function fotPerCodes(l) { const m = String(l || '').match(/\(([^()]*)\)\s*$/) || String(l || '').match(/\s((?:\d+\s*,\s*)+\d+)\s*$/); if (!m) return null; if (/[а-яёa-z]/i.test(m[1])) return null; /* «(1оклад)» — toʻlov kodi emas */ const n = (m[1].match(/\d+/g) || []); if (!n.length) return null; const acc = n.filter(x => x.length === 6), vo = n.filter(x => x.length < 6).map(Number); return { acc: acc, vo: vo }; }
        function fotPerTpl(B) {
            const cache = {}; let best = {}, bn = 0;
            B.sheets.forEach(sh => { try { if (!fotIsShop(B, sh)) return; const C = cache[sh.name] || (cache[sh.name] = fotCells(B, B.rd(sh.path))), T = {}; let n = 0;
                const rs = Object.keys(C).filter(k => /^A\d+$/.test(k)).map(k => +k.slice(1)).sort((a, b) => a - b), lab = r => { const v = C['A' + r].v; return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''; };
                const r0 = rs.find(r => /^расходы периода/i.test(lab(r))); if (!r0) return; const f = (Object.keys(C).filter(k => new RegExp('^[A-Z]+' + r0 + '$').test(k) && C[k].f).map(k => C[k].f)[0]) || ''; const inc = new Set(); f.replace(/[A-Z]{1,3}\$?(\d+)/g, (m, x) => { inc.add(+x); return m; });
                rs.filter(r => inc.has(r) || (r > r0 && /^в\s*т\.?\s*ч/i.test(lab(r)))).forEach(r => { const l = lab(r), cd = fotPerCodes(l); if (cd && (cd.acc.length || cd.vo.length)) { const b = fotPerBase(l); if (!T[b]) { T[b] = cd; n++; } } });
                if (n > bn) { bn = n; best = T; } } catch (e) {} });
            return best;
        }
        function fotPerKeys(lbl, mon) {
            const cd = fotPerCodes(lbl) || (FOTX.perTpl || {})[fotPerBase(lbl)] || null;
            if (/8\s*марта/i.test(lbl)) return mon === 2 ? [['943908', [60]]] : null;
            if (cd && (cd.acc.length || cd.vo.length)) { const acc = [].concat(...cd.acc.map(a => FOT_ACC_FIX[a] ? [a, FOT_ACC_FIX[a]] : [a])); if (acc.length) return acc.map(a => [a, cd.vo.length ? cd.vo : '*']); return [['*', cd.vo]]; }
            const pm = FOT_PER_MAP.find(p => p[0].test(lbl)); return pm ? pm[1].map(([a, c]) => [a, c === '*' ? '*' : [c]]) : null;
        }
        function fotPerRows(P) {
            const C = P.C, rs = Object.keys(C).filter(k => /^A\d+$/.test(k)).map(k => +k.slice(1)).sort((a, b) => a - b);
            const lab = r => { const v = C['A' + r] && C['A' + r].v; return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''; };
            const r0 = rs.find(r => /^расходы периода/i.test(lab(r))); if (!r0) return P;
            const G = {}; Object.keys(C).forEach(k => { const c = C[k]; if (!c || !c.f || /[!\[]/.test(c.f)) return; const r = +k.match(/\d+$/)[0], g = G[r] = G[r] || new Set(); String(c.f).replace(/\$?[A-Z]{1,3}\$?(\d+)(?::\$?[A-Z]{1,3}\$?(\d+))?/g, (m, a, b) => { a = +a; b = b ? +b : a; for (let x = a; x <= b; x++) if (x !== r) g.add(x); return m; }); });
            const seen = new Set(), st = [7]; while (st.length) { const r = st.pop(); if (seen.has(r)) continue; seen.add(r); (G[r] || []).forEach(x => st.push(x)); }
            const mon = FOTX.mon, per = [];
            rs.filter(r => r > r0).forEach(r => { const l = lab(r); if (!l || /^социальный налог/i.test(l)) return; const sub = /^в\s*т\.?\s*ч/i.test(l); if (seen.size > 20 && !seen.has(r) && !sub) return;
                let keys = fotPerKeys(l, mon);
                if (/^единовременное премирование/i.test(l) && !/оклад|8\s*марта/i.test(l)) keys = mon === 2 ? [['*', [60]]] : (keys || [['943908', [60, 61]]]);
                if (/8\s*марта/i.test(l)) keys = mon === 2 ? [['*', [61]]] : null;
                per.push({ r: r, lbl: l, per: true, sub: sub, keys: keys }); });
            const rank = x => !x.keys ? 3 : x.keys.every(k => k[0] === '*') ? 0 : x.keys.every(k => Array.isArray(k[1])) ? 1 : 2;
            per.sort((a, b) => rank(a) - rank(b) || a.r - b.r);
            P.rows = P.rows.filter(x => x.r < r0).concat(per); P.perR0 = r0; return P;
        }
        if (typeof fotSheetPlan === 'function') fotSheetPlan = agmkExtend('fotSheetPlan', 'v3.15.1: «Расходы периода» qatorlari nomidagi kodlar', fotSheetPlan, o => function () { const P = o.apply(this, arguments); try { if (!P._x152) { fotPerRows(P); P._x152 = 1; } } catch (e) { console.error(e); } return P; });
        if (typeof fotRun === 'function') fotRun = agmkExtend('fotRun', 'v3.15.1: «Расходы периода» prognozi (2-fayl)', fotRun, o => function (R6, B, FB, map, opt) {
            FOTX.mon = opt && opt.mon !== undefined ? opt.mon : R6.mon; try { FOTX.perTpl = fotPerTpl(B); } catch (e) { FOTX.perTpl = {}; }
            const res = o.apply(this, arguments);
            try { res.per = FOTS.fc2 ? fotPerFill(R6, B, res, FOTS.fc2) : { n: 0, miss: ['«Расходы периода» prognoz fayli (2-fayl) yuklanmagan'], src: [] }; } catch (e) { console.error(e); res.per = { n: 0, miss: [String(e)], src: [] }; }
            try { fotRybFix(B, res); } catch (e) { console.error(e); }
            return res;
        });
        // АХЧ (va boshqa sex): «в т.ч. рыбоводы» summasi «Расходы на оплату труда рабочих» qatoriga FORMULA bilan qoʻshiladi (iqtisodchi, 06.10.2026): =<oʻzi>+AD213
        function fotRybFix(B, res) {
            const cache = {}, L = [];
            res.sheets.forEach(S => {
                const sh = B.sheets.find(x => x.path === S.path); if (!sh) return; const P = fotSheetPlan(B, sh, cache), col = P.mons[res.mon]; if (!col) return;
                const ry = P.rows.find(r => r.per && /рыбовод/i.test(r.lbl)); if (!ry) return;
                const wk = P.rows.filter(r => r.per && r.r < ry.r && /оплату труда рабочих/i.test(r.lbl)).sort((a, b) => b.r - a.r)[0]; if (!wk) return;
                const up = res.upd[S.path] = res.upd[S.path] || {};
                [col, fotCol(fotColN(col) + 1)].forEach(c => { const y = up[c + ry.r]; if (!y || !y.v) return; const w = up[c + wk.r], own = w ? Number(w.v) || 0 : 0;
                    up[c + wk.r] = { f: (own ? own + '+' : '') + c + ry.r, v: own + Number(y.v) }; L.push({ sh: S.name, ref: c + wk.r, own: own, ry: Number(y.v) }); });
            });
            res.ryb = L; return L;
        }
        function fotLoadFc2(inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return; showToast('⏳ «Расходы периода» prognoz fayli oʻqilmoqda...');
            f.arrayBuffer().then(buf => { FOTS.fc2 = fotBook(new JSZip(narBinStr(buf))); FOTS.fc2Name = f.name; FOTS.res = null; fotRender(); showToast('✅ 2-prognoz fayli: ' + FOTS.fc2.sheets.length + ' varaq'); }).catch(e => alert('⚠️ ' + agmkErrUz(e)));
        }
        if (typeof fotRender === 'function') fotRender = agmkExtend('fotRender', 'v3.15.1: 2-prognoz fayli (Расходы периода)', fotRender, o => function () {
            const r = o.apply(this, arguments);
            try { const b = secBody('screen-fot'); const s3 = b && [].slice.call(b.querySelectorAll('.fot-step')).find(x => /3\) Prognoz fayli/.test(x.textContent)); if (s3 && !b.querySelector('.fot-step2')) { const E = escapeHtml;
                s3.querySelector('b').textContent = '3) Prognoz fayli — ishlab chiqarish qismi';
                s3.insertAdjacentHTML('afterend', `<div class="fot-step fot-step2"><b>4) Prognoz fayli — «Расходы периода»</b> («… под цыфру 18.11.25 … РАСХОДУ ПЕРИОД»)<label class="alb-btn" style="display:block;margin-top:6px">📈 ${FOTS.fc2Name ? E(FOTS.fc2Name) : 'Tanlash'}<input type="file" accept=".xlsx,.xlsm" style="display:none" onchange="fotLoadFc2(this)"></label><small>Har oy ikkala prognoz fayli yuklanadi. Выслуга, Мат. помощь, Единовременное, Пособие, Подготовка кадров, «рабочих», «Доп. отпуск», «Талоны» — shu fayldan.</small></div>`); } } catch (e) { console.error(e); }
            return r;
        });
        if (typeof fotResHtml === 'function') fotResHtml = agmkExtend('fotResHtml', 'v3.15.1: Расходы периода prognozi', fotResHtml, o => function (res) {
            let h = o.apply(this, arguments);
            try { const p = res.per || { n: 0, miss: [] }; const box = `<div class="nd-tip" style="border-left:3px solid ${p.miss.length ? '#f59e0b' : '#16a34a'}">${p.miss.length ? '⚠️' : '✅'} <b>«Расходы периода» prognozi:</b> ${p.n} ta katak 2-fayldan toʻldirildi.${p.miss.length ? '<br>' + p.miss.map(m => '⚠️ ' + escapeHtml(m)).join('<br>') : ''}${(res.ryb || []).length ? '<br>🐟 «в т.ч. рыбоводы» «рабочих» qatoriga formula bilan qoʻshildi: ' + res.ryb.map(x => escapeHtml(x.sh) + ' ' + x.ref).join(', ') : ''}</div>`;
                const i = h.indexOf('<div class="hs-acts">'); h = i >= 0 ? h.slice(0, i) + box + h.slice(i) : h + box; } catch (e) {}
            return h;
        });

