        // «Сведение по фактическим затратам» (masalan ВС УПЖТ, 92-sex) → «Общий производственные расходы %» (kalkulyatsiyadagi «Прочие затраты %»).
        //  Рем.фонд (зар.платы) = Затраты → «Лист1»: 2210 va 2220 bloklarida sex ustunidan «03 зар.плата» + «07 спецпитание БП»
        //  РСЭО                 = Затраты → «РСЭО,ЦЕХОВЫЕ»: РСЭО «Общий итог» (sex) − прямые затраты с калькуляции − Рем.фонд
        //  прямые               = kalkulyatsiyalar: materiallar + soc.nalog + tabiiy gaz
        //  Цеховые              = «РСЭО,ЦЕХОВЫЕ»: ЦЕХОВЫЕ «Общий итог» (sex) − elektr (kalk.) − ТЭЦ − ЦСП el.en. − МПЗ par
        //  ЦСП el.en.           = «Непроизводственные расходы» → 2-varaq, eng oxirgi oy bloki, «АБК» yonidagi summa (tayyor holda)
        //  %                    = (РСЭО + Цеховые) / Рем.фонд × 100
        var PRZ_KEY = 'agmk_prz_v1', PRZ = { zat: null, nep: null, sm: null, kal: [], ceh: '92', tec: 0, mpz: 0, res: null };
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(PRZ_KEY)) KV_SYNC.keys.push(PRZ_KEY); } catch (e) {}
        var PRZ_MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        var PRZ_MON_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        function przS(v) { return v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim(); }
        function przN(v) { if (typeof v === 'number') return v; const n = parseFloat(String(v === null || v === undefined ? '' : v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? null : n; }
        function przCfg() { return Object.assign({ ceh: '92', acc: ['2210', '2220'], name: 'ВС УПЖТ', tec: 0, mpz: 0 }, kvGet(PRZ_KEY + '_cfg', {}) || {}); }
        // ---------- 1) Затраты ----------
        function przPivots(rows) { // «Сумма по полю …» bloklari: { lab, hdr (ustun → nomi), rows }
            const out = []; for (let i = 0; i < rows.length; i++) { if (!/^Сумма по полю/i.test(przS(rows[i][0]))) continue;
                let lab = ''; for (let k = i - 1; k >= Math.max(0, i - 2) && !lab; k--) lab = przS((rows[k] || []).find(c => przS(c)) || '');
                const h = rows[i + 1] || []; if (!/Названия строк/i.test(przS(h[0]))) continue; const hdr = {}; h.forEach((c, j) => { if (j) hdr[przS(c).replace(/\.0+$/, '')] = j; });
                const body = []; for (let k = i + 2; k < rows.length; k++) { const a = przS(rows[k][0]); if (/^Сумма по полю/i.test(a)) break; body.push(rows[k]); if (/^Общий итог/i.test(a)) break; }
                out.push({ lab: lab, hdr: hdr, rows: body }); }
            return out;
        }
        function przZat(book) {
            const cfg = przCfg(), ceh = String(PRZ.ceh || cfg.ceh), R = { rsTot: null, chTot: null, zp: 0, zpParts: [], cehs: [] };
            const rc = book.find(s => /РСЭО\s*,\s*ЦЕХОВЫЕ\s*$/i.test(s.s)) || book.find(s => /РСЭО/i.test(s.s) && !/КНСМ/i.test(s.s)); if (!rc) throw new Error('«РСЭО,ЦЕХОВЫЕ» varagʻi topilmadi.');
            const pv = przPivots(rc.rows), tot = p => { const j = p.hdr[ceh]; const r = p.rows.find(x => /^Общий итог/i.test(przS(x[0]))); return j !== undefined && r ? przN(r[j]) : null; };
            const pr = pv.find(p => /РСЭО/i.test(p.lab)) || pv[0], pc = pv.find(p => /ЦЕХОВ/i.test(p.lab)) || pv[1];
            if (pr) { R.rsTot = tot(pr); R.cehs = Object.keys(pr.hdr).filter(k => /^\d+$/.test(k)); } if (pc) R.chTot = tot(pc);
            const l1 = book.find(s => /^Лист1$/i.test(s.s.trim())) || book.find(s => /^Лист1/i.test(s.s)); if (!l1) throw new Error('«Лист1» (schyotlar boʻyicha) varagʻi topilmadi.');
            przPivots(l1.rows).forEach(p => { const acc = (p.lab.match(/\d{4}/) || [])[0]; if (!acc || cfg.acc.indexOf(acc) < 0) return; const j = p.hdr[ceh]; if (j === undefined) return;
                p.rows.forEach(r => { const a = przS(r[0]).toLowerCase(); if (/^03\s*зар\.?\s*плата/.test(a) || /^07\s*спецпитание бп\s*$/.test(a)) { const v = przN(r[j]) || 0; R.zp += v; R.zpParts.push({ acc: acc, lbl: przS(r[0]), v: v }); } }); });
            if (R.rsTot === null) throw new Error('РСЭО boʻlimida ' + ceh + '-sex ustuni yoki «Общий итог» topilmadi.');
            return R;
        }
        // ---------- 2) Непроизводственные расходы: 2-varaq, eng oxirgi oy, «АБК» yonidagi summa ----------
        function przNep(book) {
            const sh = book.length > 1 ? book[1] : book[0], rows = sh.rows, blocks = [];
            rows.forEach((r, i) => { if (/^электроэнерги/i.test(przS(r[0]))) blocks.push({ i: i }); });
            if (!blocks.length) throw new Error('«' + sh.s + '» varagʻida «электроэнергия» bloklari topilmadi.');
            blocks.forEach((b, k) => { const end = k + 1 < blocks.length ? blocks[k + 1].i : rows.length, kr = rows[b.i + 1] || [];
                b.mon = (kr.slice(1).map(przN).find(v => v !== null && v >= 1 && v <= 12)) || null; b.kor = kr.some(c => /кор/i.test(przS(c)));
                b.abk = null; for (let i = b.i; i < end && b.abk === null; i++) { const r = rows[i] || []; for (let j = 1; j < r.length; j++) if (przS(r[j]) === 'АБК' && przN(r[j - 1]) !== null) { b.abk = przN(r[j - 1]); b.row = i; break; } } });
            let t = -1; blocks.forEach((b, k) => { if (!b.kor && b.abk !== null) t = k; }); if (t < 0) throw new Error('«АБК» yonidagi summa topilmadi.');
            const main = blocks[t], kor = blocks.slice(t + 1).filter(b => b.kor && b.abk !== null);
            return { sheet: sh.s, mon: main.mon, v: main.abk + kor.reduce((a, b) => a + b.abk, 0), base: main.abk, kor: kor.map(b => ({ mon: b.mon, v: b.abk })) };
        }
        // ---------- 3) Смета по цехам (tekshiruv uchun): ЦСП qatori, «списано на расходы периода» qismidagi sex ustuni ----------
        function przSmeta(book, mon) {
            const sh = book.find(s => +s.s.trim() === mon) || book[0]; const rows = sh.rows; let hr = -1; rows.forEach((r, i) => { if (hr < 0 && r.some(c => /^ВС$/i.test(przS(c))) && r.some(c => /ЖДЦ-1/i.test(przS(c)))) hr = i; });
            if (hr < 0) return null; let col = -1; rows[hr].forEach((c, j) => { if (/^ВС$/i.test(przS(c))) col = j; });
            const r = rows.find(x => /^ЦСП$/i.test(przS(x[1]))); if (!r || col < 0) return null; const v = przN(r[col]); return v === null ? null : { sheet: sh.s, v: v * 1000 };
        }
        // ---------- 4) Kalkulyatsiyalar ----------
        function przKal(book, fname) {
            const out = [];
            book.forEach(sh => {
                const rows = sh.rows; if (!rows.slice(0, 15).some(r => r.slice(0, 8).some(c => /КАЛЬКУЛЯЦИЯ/i.test(przS(c))))) return;
                let hr = -1, cn = -1, cs = -1; for (let i = 0; i < Math.min(rows.length, 40) && hr < 0; i++) { const r = rows[i].slice(0, 9); const a = r.findIndex(c => /Наименование/i.test(przS(c))), b = r.findIndex(c => /^Сумма/i.test(przS(c))); if (a >= 0 && b > a) { hr = i; cn = a; cs = b; } }
                if (hr < 0) { out.push({ file: fname, sheet: sh.s, err: 'Materiallar jadvali sarlavhasi («Наименование … Сумма») topilmadi' }); return; }
                const K = { file: fname, sheet: sh.s, title: '', mon: null, mat: 0, gas: 0, el: 0, soc: 0, items: [], itogo: null, warn: [] };
                K.title = rows.slice(0, hr).map(r => przS(r[0])).filter(x => x && !/СОГЛАСОВАНО|УТВЕРЖДАЮ|КАЛЬКУЛЯЦИЯ|^"|_{3,}/i.test(x)).join(' ').slice(0, 120);
                const mt = rows.slice(0, hr).map(r => przS(r[0])).join(' ').toLowerCase(); PRZ_MON_RU.forEach((m, i) => { if (mt.indexOf(m.slice(0, 5)) >= 0) K.mon = i + 1; });
                let i = hr + 1; for (; i < rows.length; i++) { const r = rows[i], nm = przS(r[cn]); if (/^итого/i.test(nm) || /^итого/i.test(przS(r[cn - 1]))) { K.itogo = przN(r[cs]); break; } const v = przN(r[cs]); if (v === null || !nm) continue;
                    const it = { n: nm, v: v, k: /газ/i.test(nm) ? 'gas' : /электроэнерг/i.test(nm) ? 'el' : 'mat' }; K.items.push(it); K[it.k] += v; }
                for (let k = i + 1; k < rows.length; k++) { const r = rows[k]; const nm = przS(r[cn]) || przS(r[1]); if (/соц/i.test(nm)) { const v = r.slice(cn + 1, cs + 1).map(przN).find(x => x !== null); if (v !== null && v !== undefined) { K.soc += v; break; } } }
                const sum = K.items.reduce((a, x) => a + x.v, 0); if (K.itogo !== null && Math.abs(K.itogo - sum) > 0.5) K.warn.push('«ИТОГО» (' + narF(K.itogo, 2) + ') materiallar yigʻindisiga (' + narF(sum, 2) + ') teng emas — yigʻindi olindi');
                out.push(K);
            });
            return out;
        }
        // ---------- hisob ----------
        function przCalc() {
            const Z = PRZ.zat, N = PRZ.nep; if (!Z) return null; const ks = PRZ.kal.filter(k => !k.err);
            const mat = ks.reduce((a, k) => a + k.mat, 0), soc = ks.reduce((a, k) => a + k.soc, 0), gas = ks.reduce((a, k) => a + k.gas, 0), el = ks.reduce((a, k) => a + k.el, 0);
            const pr = mat + soc + gas, zp = Z.zp, csp = N ? N.v : 0, tec = +PRZ.tec || 0, mpz = +PRZ.mpz || 0;
            const rs = Z.rsTot - pr - zp, ch = (Z.chTot || 0) - el - tec - csp - mpz, it = rs + ch;
            return { zp: zp, mat: mat, soc: soc, gas: gas, pr: pr, el: el, tec: tec, csp: csp, mpz: mpz, rsTot: Z.rsTot, chTot: Z.chTot || 0, rs: rs, ch: ch, it: it, pct: zp ? it / zp * 100 : null };
        }
        function przMonth() { const N = PRZ.nep; if (N && N.mon) return N.mon; const k = PRZ.kal.find(x => x.mon); return k ? k.mon : new Date().getMonth() || 12; }
        // ---------- UI ----------
        function przHtml() {
            const E = escapeHtml, c = przCfg(), r = przCalc(), mon = przMonth(), f = n => n === null || n === undefined ? '—' : narF(n, 2);
            const st = (ok, t, sub, inp) => `<label class="fot-step" style="display:block;cursor:pointer"><b>${ok ? '✅' : '⬜'} ${t}</b><small>${sub}</small>${inp}</label>`;
            const ks = PRZ.kal, kerr = ks.filter(k => k.err).length, kw = ks.reduce((a, k) => a + (k.warn || []).length, 0);
            let h = `<div class="nd-tip">«Сведение по фактическим затратам» — <b>Общий производственные расходы %</b> (kalkulyatsiyalardagi «Прочие затраты %»). Fayllarni yuklang — ilova oʻzi hisoblaydi.</div>
                <div class="hs-box"><div class="form-group" style="display:flex;gap:8px;align-items:center"><label style="min-width:60px">Sex:</label><input id="przCeh" value="${E(PRZ.ceh || c.ceh)}" style="max-width:80px" onchange="przSetCeh(this.value)"><input id="przNm" value="${E(c.name)}" placeholder="ВС УПЖТ" onchange="przSetName(this.value)"></div>
                ${st(!!PRZ.zat, '1. Затраты (pivot)', PRZ.zat ? `РСЭО ${f(PRZ.zat.rsTot)} · Цеховые ${f(PRZ.zat.chTot)} · Рем.фонд ${f(PRZ.zat.zp)}` : '«РСЭО,ЦЕХОВЫЕ» va «Лист1» (2210, 2220) varaqlari boʻlgan fayl', '<input type="file" accept=".xlsx,.xls,.xlsm" style="display:none" onchange="przLoad(this,\'zat\')">')}
                ${st(!!PRZ.nep, '2. Непроизводственные расходы', PRZ.nep ? `«${E(PRZ.nep.sheet)}» · ${PRZ.nep.mon ? PRZ.nep.mon + '-oy' : ''} · АБК yonida: ${f(PRZ.nep.v)}${PRZ.nep.kor.length ? ' (tuzatish bilan)' : ''}` : '2-varaq, eng oxirgi oy — «АБК» yonidagi summa', '<input type="file" accept=".xls,.xlsx" style="display:none" onchange="przLoad(this,\'nep\')">')}
                ${st(!!PRZ.sm, '3. Смета по цехам (tekshiruv)', PRZ.sm ? `ЦСП (ВС, davr xarajati): ${f(PRZ.sm.v)} ${PRZ.nep ? (Math.abs(PRZ.sm.v - PRZ.nep.v) < 1000 ? '✅ mos' : '⚠️ farq ' + f(PRZ.nep.v - PRZ.sm.v)) : ''}` : 'Ixtiyoriy: ЦСП summasini solishtirish uchun', '<input type="file" accept=".xls,.xlsx" style="display:none" onchange="przLoad(this,\'sm\')">')}
                ${st(ks.length > 0, '4. Kalkulyatsiyalar (bir oylik, bir nechta fayl)', ks.length ? `${ks.length - kerr} ta kalkulyatsiya${kerr ? ' · ⚠️ ' + kerr + ' ta oʻqilmadi' : ''}${kw ? ' · ⚠️ ' + kw + ' ta ogohlantirish' : ''} <u onclick="event.preventDefault();przKalOpen()">roʻyxat</u> · <u onclick="event.preventDefault();przKalClear()">tozalash</u>` : 'Muhandislar yuborgan kalkulyatsiya fayllari (bir nechtasini birga tanlash mumkin)', '<input type="file" multiple accept=".xls,.xlsx" style="display:none" onchange="przLoad(this,\'kal\')">')}
                <div class="form-group" style="display:flex;gap:8px"><div style="flex:1"><label>Услуги ТЭЦ (davr xarajati):</label><input id="przTec" inputmode="decimal" value="${PRZ.tec || ''}" placeholder="0" onchange="PRZ.tec=bxNum(this.value);przRender()"></div><div style="flex:1"><label>Услуги МПЗ пар:</label><input id="przMpz" inputmode="decimal" value="${PRZ.mpz || ''}" placeholder="0" onchange="PRZ.mpz=bxNum(this.value);przRender()"></div></div></div>`;
            if (r) {
                const row = (t, v, b, sub) => `<tr${b ? ' style="font-weight:800;background:rgba(56,189,248,.08)"' : ''}><td>${sub ? '&nbsp;&nbsp;' : ''}${t}</td><td class="n">${f(v)}</td></tr>`;
                h += `<div class="hs-box"><div class="hs-h">✅ Сведение — ${E(c.name)} (${E(PRZ.ceh)}-sex) · ${E(PRZ_MON[mon - 1] || '')}</div>
                    <div class="mm-sum fot-kpi"><i class="ok"><b>${r.pct === null ? '—' : narF(r.pct, 2) + ' %'}</b>Общий производственные расходы</i></div>
                    <div class="gt-scroll"><table class="nar-t fot-t"><tr><th>Наименование</th><th>Сумма, soʻm</th></tr>
                    ${row('Рем.фонд (зар.платы)', r.zp, 1)}${row('Итого', r.it, 1)}${row('РСЭО', r.rs, 1)}${row('из них: Прямые затраты с калькуляции', r.pr)}${row('Материалы с калькуляции', r.mat, 0, 1)}${row('Соц.налог с калькуляции', r.soc, 0, 1)}${row('Природный газ', r.gas, 0, 1)}
                    ${row('Цеховые расходы', r.ch, 1)}${row('из них: Прямые затраты с калькуляции', r.el)}${row('Электроэнергия с калькуляции', r.el, 0, 1)}${row('Услуги ТЭЦ в расход.период.', r.tec, 0, 1)}${row('Услуги ЦСП ЭЛ.ЭН в расход.период.', r.csp, 0, 1)}${row('Услуги МПЗ пар в расход.период.', r.mpz, 0, 1)}
                    </table></div>
                    <div class="nd-tip">РСЭО = ${f(r.rsTot)} − ${f(r.pr)} − ${f(r.zp)} · Цеховые = ${f(r.chTot)} − ${f(r.el)} − ${f(r.tec)} − ${f(r.csp)} − ${f(r.mpz)} · % = (РСЭО + Цеховые) / Рем.фонд × 100${!PRZ.nep ? '<br>⚠️ Непроизводственные расходы yuklanmagan — ЦСП = 0' : ''}${!ks.length ? '<br>⚠️ Kalkulyatsiyalar yuklanmagan — materiallar, soc.nalog, gaz va elektr = 0' : ''}</div>
                    <div class="hs-acts"><button class="action-btn" style="background:#0f766e" onclick="przDl()">📥 Сведение (Excel)</button><button class="mini-btn" onclick="przSave()">💾 Tarixga saqlash</button></div></div>`;
            }
            const H = kvGet(PRZ_KEY, []) || [];
            if (H.length) h += `<div class="inf-sec">📜 Saqlanganlar</div>` + H.slice(0, 12).map((x, i) => `<div class="mm-card"><b>${E(PRZ_MON[(x.mon || 1) - 1] || '')} ${x.year || ''} · ${E(x.name || '')} (${E(x.ceh)}) — ${x.r.pct === null ? '—' : narF(x.r.pct, 2) + ' %'}</b><small>👤 ${E(x.by || '')} · 🕒 ${E(fmtDT(x.at))} · ${x.nk || 0} ta kalkulyatsiya</small></div>`).join('');
            return h;
        }
        function przRender() { try { if (typeof BX !== 'undefined' && BX.tab === 'prz' && $id('screen-bux')) { const b = secBody('screen-bux'); if (b) b.innerHTML = przHtml(); } } catch (e) { console.error(e); } }
        function przSetCeh(v) { PRZ.ceh = String(v || '').trim() || '92'; const c = przCfg(); c.ceh = PRZ.ceh; kvSet(PRZ_KEY + '_cfg', c); if (PRZ.zatBook) { try { PRZ.zat = przZat(PRZ.zatBook); } catch (e) { PRZ.zat = null; alert('⚠️ ' + agmkErrUz(e)); } } przRender(); }
        function przSetName(v) { const c = przCfg(); c.name = String(v || '').trim() || 'ВС УПЖТ'; kvSet(PRZ_KEY + '_cfg', c); przRender(); }
        async function przLoad(inp, kind) {
            const fs = Array.from(inp.files || []); inp.value = ''; if (!fs.length) return; showToast('⏳ Oʻqilmoqda...');
            try {
                for (const f of fs) {
                    const book = narReadBookBs(narBinStr(await f.arrayBuffer()));
                    if (kind === 'zat') { PRZ.zatBook = book; PRZ.zat = przZat(book); PRZ.zat.file = f.name; }
                    else if (kind === 'nep') { PRZ.nep = przNep(book); PRZ.nep.file = f.name; }
                    else if (kind === 'sm') { PRZ.smBook = book; PRZ.sm = przSmeta(book, przMonth()); if (!PRZ.sm) throw new Error('Smetada «ЦСП» qatori yoki «ВС» ustuni topilmadi.'); }
                    else { const L = przKal(book, f.name); if (!L.length) throw new Error('«' + f.name + '»: kalkulyatsiya varaqlari topilmadi («КАЛЬКУЛЯЦИЯ» sarlavhasi).'); PRZ.kal = PRZ.kal.filter(k => k.file !== f.name).concat(L); }
                }
                if (kind === 'nep' && PRZ.smBook) PRZ.sm = przSmeta(PRZ.smBook, przMonth());
                showToast('✅ Yuklandi'); przRender();
            } catch (e) { console.error(e); alert('⚠️ ' + agmkErrUz(e)); }
        }
        function przKalClear() { PRZ.kal = []; przRender(); }
        function przKalOpen() {
            const E = escapeHtml, f = n => narF(n, 2);
            mdl('przK', `<div class="px-h"><b>🧾 Kalkulyatsiyalar — ${PRZ.kal.length}</b><button class="mini-btn" onclick="mdlClose('przK')">✕</button></div>
                <div class="gt-scroll" style="max-height:60vh;overflow:auto"><table class="nar-t fot-t"><tr><th>Fayl / varaq</th><th>Materiallar</th><th>Soc.nalog</th><th>Gaz</th><th>Elektr</th></tr>
                ${PRZ.kal.map(k => k.err ? `<tr><td colspan="5">⚠️ ${E(k.file)} · ${E(k.sheet)} — ${E(k.err)}</td></tr>` : `<tr><td>${E(k.file)} · <b>${E(k.sheet)}</b>${k.warn.length ? '<br><small style="color:#fde68a">⚠️ ' + k.warn.map(E).join('; ') + '</small>' : ''}</td><td class="n">${f(k.mat)}</td><td class="n">${f(k.soc)}</td><td class="n">${f(k.gas)}</td><td class="n">${f(k.el)}</td></tr>`).join('')}</table></div>`, true);
        }
        function przSave() { const r = przCalc(); if (!r) return; const c = przCfg(), H = kvGet(PRZ_KEY, []) || []; H.unshift({ at: new Date().toISOString(), by: authorStr(), mon: przMonth(), year: new Date().getFullYear(), ceh: PRZ.ceh, name: c.name, nk: PRZ.kal.filter(k => !k.err).length, r: r }); kvSet(PRZ_KEY, H.slice(0, 36)); showToast('💾 Saqlandi'); przRender(); }
        function przDl() {
            const r = przCalc(); if (!r) return; const c = przCfg(), mon = przMonth(), yr = new Date().getFullYear();
            const cell = (ref, v, s) => { if (v === null || v === undefined || v === '') return ''; if (typeof v === 'object') return `<c r="${ref}"${s ? ' s="' + s + '"' : ''}><f>${xmlEsc(v.f)}</f><v>${v.v}</v></c>`; if (typeof v === 'number') return `<c r="${ref}"${s ? ' s="' + s + '"' : ''}><v>${Math.round(v * 100) / 100}</v></c>`; return `<c r="${ref}"${s ? ' s="' + s + '"' : ''} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`; };
            const R2 = v => Math.round(v * 100) / 100;
            const L = [[1, 'Сведение', '', '', 1], [2, 'по фактическим затратам  ' + c.name + ' за ' + PRZ_MON_RU[mon - 1] + ' ' + yr + ' года', '', '', 1], [4, 'Наименование', 'Ед.изм', 'Сумма', 2],
                [6, 'Рем.фонд (зар.платы)', 'сум', R2(r.zp), 3], [7, 'Итого', 'сум', { f: 'C8+C14', v: R2(r.it) }, 3], [8, 'РСЭО ', 'сум', { f: R2(r.rsTot) + '-C9-C6', v: R2(r.rs) }, 3], [9, 'из них : Прямые затраты c калькуляции', 'сум', { f: 'C10+C11+C12', v: R2(r.pr) }, 4],
                [10, 'Материалы с калькуляция ', 'сум', R2(r.mat), 4], [11, 'Соц.налог с калькуляции', 'сум', R2(r.soc), 4], [12, 'Природный газ', 'сум', R2(r.gas), 4],
                [14, 'Цеховые расходы', 'сум', { f: R2(r.chTot) + '-C16-C17-C18-C19', v: R2(r.ch) }, 3], [15, 'из них : Прямые затраты c калькуляции', 'сум', { f: 'C16', v: R2(r.el) }, 4], [16, 'Электроэнергия с калькуляции', 'сум', R2(r.el), 4],
                [17, 'Услуги ТЭЦ в расход.период.', 'сум', R2(r.tec), 4], [18, 'Услуги ЦСП ЭЛ.ЭН в расход.период.', 'сум', R2(r.csp), 4], [19, 'Услуги МПЗ  пар в расход.период.', 'сум', R2(r.mpz), 4],
                [21, 'Общий производственные расходы%', '%', { f: '(C14+C8)/C6*100', v: r.pct === null ? 0 : r.pct }, 3]];
            let rn = 24; const src = [[rn++, 'Manbalar:', '', '', 1], [rn++, 'РСЭО «Общий итог» (' + PRZ.ceh + '-sex)', '', R2(r.rsTot), 4], [rn++, 'ЦЕХОВЫЕ «Общий итог» (' + PRZ.ceh + '-sex)', '', R2(r.chTot), 4]];
            (PRZ.zat.zpParts || []).forEach(p => src.push([rn++, 'Рем.фонд: ' + p.acc + ' · ' + p.lbl, '', R2(p.v), 4]));
            if (PRZ.nep) src.push([rn++, 'ЦСП: «' + PRZ.nep.file + '» → ' + PRZ.nep.sheet + ', ' + (PRZ.nep.mon || '') + '-oy, АБК', '', R2(PRZ.nep.v), 4]);
            rn++; src.push([rn++, 'Kalkulyatsiyalar (' + PRZ.kal.filter(k => !k.err).length + ' ta): fayl · varaq', 'materiallar / soc / gaz / elektr', '', 1]);
            PRZ.kal.filter(k => !k.err).forEach(k => src.push([rn++, k.file + ' · ' + k.sheet, R2(k.mat) + ' / ' + R2(k.soc) + ' / ' + R2(k.gas) + ' / ' + R2(k.el), R2(k.mat + k.soc + k.gas + k.el), 4]));
            rn++; src.push([rn++, 'Гл.бухгалтер', '', '', 0], [rn + 1, 'Вед.бухгалтер', '', '', 0]);
            const data = L.concat(src).map(([n, a, b, cc, s]) => `<row r="${n}">${cell('A' + n, a, s === 2 ? 2 : s === 1 ? 1 : s ? 3 : 0)}${cell('B' + n, b, s === 2 ? 2 : s ? 5 : 0)}${cell('C' + n, cc, s === 2 ? 2 : s === 3 ? 6 : s === 4 ? 7 : 0)}</row>`).join('');
            const ws = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="48" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/><col min="3" max="3" width="22" customWidth="1"/></cols><sheetData>${data}</sheetData></worksheet>`;
            const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><name val="Times New Roman"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDEBF7"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="164" fontId="1" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
            const blob = zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Сведение" sheetId="1" r:id="rId1"/></sheets><calcPr fullCalcOnLoad="1"/></workbook>' },
                { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'xl/worksheets/sheet1.xml', data: ws }, { name: 'xl/styles.xml', data: styles }
            ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            docDownload([{ name: 'Svedenie_' + String(c.name).replace(/[^\p{L}\d]+/gu, '_') + '_' + (PRZ_MON[mon - 1] || '') + '_' + yr + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: blob }]);
        }
        // Buxgalteriya tablariga «🧮 Прочие затраты»
        // 3.16.2: oldingi kengaytmalar (formulalar kartasi, boʻsh yil koʻrsatmasi) saqlanadi — toʻliq almashtirilmaydi, kengaytiriladi
        function przTabs() { const iq = typeof iqtOn === 'function' && iqtOn(); return [['rf', '📊 Reja-fakt'], ['exp', '🧾 Xarajatlar'], ['prz', '🧮 Прочие затраты'], ['plan', '🎯 Reja'], ['mttb', '📥 MTTB kirimlari']].concat(iq ? [['tan', '🔧 Tannarx'], ['idle', '⏳ Turib qolish'], ['tah', '🧠 Tahlil']] : []); }
        if (typeof bxRender === 'function') bxRender = agmkExtend('bxRender', 'v3.12: «Прочие затраты» tabi', bxRender, o => function () {
            if (BX.tab === 'prz') { secTabs('screen-bux', przTabs(), BX.tab, 'bxTab'); const b = secBody('screen-bux'); if (!PRZ.ceh) PRZ.ceh = przCfg().ceh; b.innerHTML = przHtml(); return; }
            const r = o.apply(this, arguments);
            try { secTabs('screen-bux', przTabs(), BX.tab, 'bxTab'); } catch (e) {}
            return r;
        });
        if (typeof openBxHome === 'function') openBxHome = agmkExtend('openBxHome', 'v3.12: «Прочие затраты» kartochkasi', openBxHome, o => function () {
            const r = o.apply(this, arguments);
            try { const b = secBody('screen-bxi'); if (b && canBxView() && !b.querySelector('.prz-card')) b.insertAdjacentHTML('beforeend', narCard('🧮', 'Прочие затраты (Buxgalteriya)', 'Сведение по фактическим затратам → Общий производственные расходы %', "narOpenBuxPart('prz')", 'prz-card')); } catch (e) {}
            return r;
        });

