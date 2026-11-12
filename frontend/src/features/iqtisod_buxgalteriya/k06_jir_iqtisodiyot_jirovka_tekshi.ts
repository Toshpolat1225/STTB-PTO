        // Ikki oy jirovkasi (oʻtgan va joriy) — ishchining premiyasi qolib ketmaganmi (ФОТ tahliliga aloqasi yoʻq):
        //  • oʻtgan oyda soati bor (В/О 02, 03, 04) → joriy oyda premiya (22, 23, 24, 223) boʻlishi kerak, boʻlmasa — ❌
        //  • oʻtgan oyda otpusk (39, 164, 140, 40, 45, 139) → premiya chiqmasligi mumkin (⚠️ izoh)
        //  • oʻtgan oyda 028 (yopilgan) → premiya chiqmaydi (⚠️ izoh)
        //  • 38, 138 → soat kam, premiya kam boʻlishi mumkin; 32, 35, 36 → shu soatlarga premiya chiqmaydi (ℹ️)
        var JIR = { a: null, b: null, res: null, flt: 'err' };
        var JIR_HRS = [2, 3, 4], JIR_PREM = [22, 23, 24, 223], JIR_VAC = [39, 164, 140, 40, 45, 139], JIR_CLOSE = [28], JIR_LOW = [38, 138], JIR_NOPR = [32, 35, 36];
        function jirNum(v) { if (v === null || v === undefined || v === '') return null; if (typeof v === 'number') return v; const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? null : n; }
        function jirIsDate(v) { return (typeof v === 'number' && v > 30000 && v < 80000) || /^\d{2}[.,/]\d{2}[.,/]\d{4}$|^\d{4}-\d\d-\d\d/.test(String(v || '').trim()); }
        function jirMonTitle(book) { for (const sh of book) for (const r of sh.rows.slice(0, 4)) { const t = r.map(x => String(x || '')).join('').replace(/\s+/g, ' '); const m = t.match(/((?:ЯНВАР|ФЕВРАЛ|МАРТ|АПРЕЛ|МА[ЙЯ]|ИЮН|ИЮЛ|АВГУСТ|СЕНТЯБР|ОКТЯБР|НОЯБР|ДЕКАБР)[А-Я]*)\s*(\d{4})/i); if (m) return m[1].toLowerCase() + ' ' + m[2]; } return ''; }
        function jirParse(book) {
            const W = {}, info = { sheets: [], skip: [] };
            book.forEach(sh => {
                const rows = sh.rows; let H = null, sc = null;
                for (const r of rows) { const s = r.map(x => String(x === null || x === undefined ? '' : x));
                    if (!H && s.some(x => /ВИД/.test(x)) && s.some(x => /ТАБ/.test(x))) H = { tab: s.findIndex(x => /ТАБ/.test(x)), vid: s.findIndex(x => /ВИД/.test(x)), hrs: Math.max(0, s.findIndex(x => /КОЛ-ВО/.test(x))), kat: s.findIndex(x => /КАТ/.test(x)), ceh: 3 };
                    if (sc === null && s.some(x => /ИТОГО ПО/.test(x))) { let j = -1; r.forEach((x, k) => { if (jirNum(x) !== null) j = k; }); if (j >= 0) sc = j; }
                    if (H && sc !== null) break; }
                if (!H || sc === null) { info.skip.push(sh.s); return; } let n = 0;
                rows.forEach(r => { if (!r || !jirIsDate(r[0])) return; const t = jirNum(r[H.tab]), v = jirNum(r[H.vid]); if (t === null || v === null) return; n++;
                    const w = W[t] = W[t] || { tab: t, ceh: '', kat: new Set(), c: {} }; const c = String(r[H.ceh] || '').trim(); if (c && !w.ceh) w.ceh = c; const kt = H.kat >= 0 ? String(r[H.kat] || '').trim() : ''; if (kt) w.kat.add(kt);
                    const x = w.c[v] = w.c[v] || { h: 0, s: 0 }; x.h += jirNum(r[H.hrs]) || 0; x.s += jirNum(r[sc]) || 0; });
                info.sheets.push(sh.s + ' (' + n + ')');
            });
            return { W: W, info: info, mon: jirMonTitle(book) };
        }
        function jirRun() {
            const A = JIR.a, Bm = JIR.b; if (!A || !Bm) return null; const out = { err: [], warn: [], info: [], absent: [], ok: 0, n: 0 };
            const has = (w, L, key) => L.filter(c => w.c[c] && (key === 'h' ? w.c[c].h > 0 : Math.abs(w.c[c].s) > 0.004));
            Object.values(A.W).forEach(w => {
                const h = JIR_HRS.reduce((a, c) => a + (w.c[c] ? w.c[c].h : 0), 0); if (h <= 0) return; out.n++;
                const cur = Bm.W[w.tab], vac = has(w, JIR_VAC, 's').concat(has(w, JIR_VAC, 'h')).filter((v, i, a) => a.indexOf(v) === i), cl = Object.keys(w.c).map(Number).filter(c => JIR_CLOSE.indexOf(c) >= 0), low = Object.keys(w.c).map(Number).filter(c => JIR_LOW.indexOf(c) >= 0 || JIR_NOPR.indexOf(c) >= 0);
                const row = { tab: w.tab, ceh: w.ceh || (cur && cur.ceh) || '', kat: Array.from(w.kat).join(','), h: h, prev: w.c, cur: cur ? cur.c : null, vac: vac, cl: cl, low: low };
                if (!cur) { row.why = 'Joriy oy jirovkasida umuman yoʻq — oylik qolib ketgan boʻlishi mumkin (yoki ishdan ketgan)'; out.absent.push(row); return; }
                const pr = JIR_PREM.filter(c => cur.c[c] && cur.c[c].s > 0.004); row.prem = pr.reduce((a, c) => a + cur.c[c].s, 0);
                if (pr.length) { out.ok++; if (low.length) { row.why = 'Premiya bor. Oʻtgan oyda ' + low.join(', ') + ' — premiya kam chiqishi mumkin'; out.info.push(row); } return; }
                if (cl.length) { row.why = 'Oʻtgan oyda 028 (yopilgan) — premiya chiqmaydi'; out.warn.push(row); return; }
                if (vac.length) { row.why = 'Oʻtgan oyda otpusk (' + vac.join(', ') + ') — premiya chiqmasligi mumkin, tekshiring'; out.warn.push(row); return; }
                row.why = 'Oʻtgan oyda ' + Math.round(h * 10) / 10 + ' soat ishlagan (02–04), joriy oyda premiya (22, 23, 24, 223) yoʻq' + (low.length ? ' · oʻtgan oyda ' + low.join(', ') + ' bor' : ''); out.err.push(row);
            });
            ['err', 'warn', 'info', 'absent'].forEach(k => out[k].sort((a, b) => String(a.ceh).localeCompare(String(b.ceh), undefined, { numeric: true }) || a.tab - b.tab));
            return out;
        }
        function jirName(t) { try { const x = typeof xodimByTabel === 'function' ? xodimByTabel(String(t)) : null; return x ? (x.fio || x.name || x.ism || '') : ''; } catch (e) { return ''; } }
        function jirCodes(c) { if (!c) return '—'; return Object.keys(c).map(Number).sort((a, b) => a - b).map(k => { const x = c[k]; const hl = JIR_HRS.indexOf(k) >= 0 || JIR_PREM.indexOf(k) >= 0 || JIR_VAC.indexOf(k) >= 0 || JIR_CLOSE.indexOf(k) >= 0 || JIR_LOW.indexOf(k) >= 0 || JIR_NOPR.indexOf(k) >= 0; return (hl ? '<span style="font-weight:800;color:#f8fafc">' : '') + String(k).padStart(2, '0') + (x.h ? ' (' + Math.round(x.h * 10) / 10 + ' s)' : '') + (hl ? '</span>' : '') + ': ' + narF(x.s, 0); }).join(' · '); }
        function openJir() {
            if (typeof narCan === 'function' && !narCan()) { alert('🧾 Jirovka tekshiruvi — iqtisod (mehnat va ish haqi), buxgalteriya, rahbariyat va admin uchun.'); return; }
            secScreen('screen-jir', '🧾 Jirovka tekshiruvi', 'openIqt()'); openScreen('screen-jir'); jirRender();
        }
        function jirRender() {
            const b = secBody('screen-jir'); if (!b) return; const E = escapeHtml, r = JIR.res;
            const st = (ok, t, sub, k) => `<label class="fot-step" style="display:block;cursor:pointer"><b>${ok ? '✅' : '⬜'} ${t}</b><small>${sub}</small><input type="file" accept=".xlsx,.xls" style="display:none" onchange="jirLoad(this,'${k}')"></label>`;
            let h = `<div class="nd-tip">Ikki oy jirovkasini yuklang. Ilova oʻtgan oyda soati (02, 03, 04) boʻlgan har bir xodimga joriy oyda premiya (22, 23, 24, 223) chiqqanini tekshiradi. Otpusk (39, 164, 140, 40, 45, 139), 028, 38/138 va 32/35/36 holatlari izoh bilan koʻrsatiladi.</div>
                <div class="hs-box">${st(!!JIR.a, '1. Oʻtgan oy jirovkasi', JIR.a ? E(JIR.a.file) + ' · ' + E(JIR.a.mon) + ' · ' + Object.keys(JIR.a.W).length + ' ta tabel' : 'masalan, iyul', 'a')}${st(!!JIR.b, '2. Joriy oy jirovkasi', JIR.b ? E(JIR.b.file) + ' · ' + E(JIR.b.mon) + ' · ' + Object.keys(JIR.b.W).length + ' ta tabel' : 'masalan, avgust', 'b')}</div>`;
            if (r) {
                const tab = (k, ic, t) => `<i class="${JIR.flt === k ? 'on' : ''}" onclick="JIR.flt='${k}';jirRender()">${ic} ${t} <b>${r[k].length}</b></i>`;
                h += `<div class="hs-box"><div class="hs-h">Natija — ${r.n} ta xodimda oʻtgan oyda soat bor · ${r.ok} tasida premiya chiqqan</div>
                    <div class="nar-flt">${tab('err', '❌', 'Premiya yoʻq')}${tab('absent', '❓', 'Joriy oyda yoʻq')}${tab('warn', '⚠️', 'Sababli')}${tab('info', 'ℹ️', 'Kam chiqishi mumkin')}</div>
                    ${r[JIR.flt].length ? r[JIR.flt].map(x => `<div class="mm-card ${JIR.flt === 'err' ? 'bad' : ''}"><b>Tabel ${x.tab}${jirName(x.tab) ? ' · ' + E(jirName(x.tab)) : ''} · sex ${E(String(x.ceh))}${x.kat ? ' · kat. ' + E(x.kat) : ''}</b><small>${E(x.why)}</small><small>Oʻtgan oy: ${jirCodes(x.prev)}</small><small>Joriy oy: ${jirCodes(x.cur)}</small></div>`).join('') : '<div class="xt-empty">Yoʻq ✅</div>'}
                    <div class="hs-acts"><button class="mini-btn" onclick="jirXlsx()">📊 Excel</button></div></div>`;
            }
            b.innerHTML = h;
        }
        async function jirLoad(inp, k) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return; showToast('⏳ Oʻqilmoqda...');
            try { const P = jirParse(narReadBookBs(narBinStr(await f.arrayBuffer()))); if (!Object.keys(P.W).length) throw new Error('Jirovka qatorlari topilmadi (sarlavhada «ТАБ.», «ВИД ОПЛ» boʻlishi kerak).'); P.file = f.name; JIR[k] = P; JIR.res = jirRun(); jirRender(); showToast('✅ ' + Object.keys(P.W).length + ' ta tabel'); }
            catch (e) { console.error(e); alert('⚠️ ' + agmkErrUz(e)); }
        }
        function jirXlsx() {
            const r = JIR.res; if (!r) return; const cs = c => c ? Object.keys(c).map(Number).sort((a, b) => a - b).map(k => String(k).padStart(2, '0') + (c[k].h ? '(' + Math.round(c[k].h * 10) / 10 + 's)' : '') + '=' + Math.round(c[k].s)).join('; ') : '';
            const rows = [['Jirovka tekshiruvi: ' + (JIR.a.mon || '') + ' → ' + (JIR.b.mon || '')], [], ['Holat', 'Tabel', 'F.I.Sh.', 'Sex', 'Kat.', 'Oʻtgan oy soat (02–04)', 'Izoh', 'Oʻtgan oy В/О', 'Joriy oy В/О']];
            [['err', '❌ Premiya yoʻq'], ['absent', '❓ Joriy oyda yoʻq'], ['warn', '⚠️ Sababli'], ['info', 'ℹ️ Kam chiqishi mumkin']].forEach(([k, t]) => r[k].forEach(x => rows.push([t, x.tab, jirName(x.tab), x.ceh, x.kat, Math.round(x.h * 10) / 10, x.why, cs(x.prev), cs(x.cur)])));
            xlsxDl(rows, 'Jirovka tekshiruvi');
        }
        if (typeof openIqt === 'function') openIqt = agmkExtend('openIqt', 'v3.13: jirovka tekshiruvi', openIqt, o => function () {
            const r = o.apply(this, arguments);
            try { const b = secBody('screen-iqt'); if (b && !b.querySelector('.jir-card')) { const c = document.createElement('div'); c.innerHTML = narCard('🧾', 'Jirovka tekshiruvi — premiya qolib ketmaganmi', 'Ikki oy jirovkasi: soati bor xodimga premiya chiqqanmi (02–04 → 22, 23, 24, 223)', 'openJir()', 'jir-card'); const f = b.querySelector('.btn-card'); if (f && f.nextSibling) b.insertBefore(c.firstChild, f.nextSibling.nextSibling || null); else b.appendChild(c.firstChild); } } catch (e) {}
            return r;
        });

            // ===== [v3.14.1 modul: struct — Ishchi xodimlar → «🏛 Struktura» (tashkiliy tuzilma)] =====
        //  • Tashkiliy tuzilma sxemasi (2026-yil avgust, @@N:322@@ tasdiqlagan) — temir yoʻl sxemasi kabi barmoq bilan surish, yaqinlashtirish.
        //  • Har bir lavozim oʻrni: shtatdagi soni (shtat jadvali) va unga biriktirilgan xodim (xodim.posNo). Boʻsh oʻrinlar qizil.
        //  • Maʼlumot bitta: «Ishchi xodimlar» daraxti va «Struktura» bir xil yozuvlardan oʻqiydi — biri oʻzgarsa, ikkinchisida ham darhol oʻzgaradi
        //    (xodim kartalari serverga sinxronlanadi; shtat jadvalidagi oʻzgarish ham serverga — barcha telefonlarga).
        //  • Koʻrish: administrator, rahbariyat, kadrlar, iqtisodchi («📈»), «📂». Tahrirlash: administrator, rahbariyat, kadrlar, iqtisodchi.
        //    Oklad koʻrinadi: administrator, rahbariyat, iqtisodchi, «📂». Okladni oʻzgartiradi: faqat iqtisodchi va administrator (serverdagi roʻyxatga yoziladi).
        //  • Ishchilar: kadrlar roʻyxati (Excel) import qilinadi — shtat boʻyicha lavozimlar va boʻsh oʻrinlar bilan joylanadi.
        var ST = { x: 0, y: 0, s: 0.3, pts: new Map(), moved: 0, pinch: null, target: null, q: '', hits: [], hi: -1, fromSt: false, sig: '', rt: null, ready: false, open: new Set(), idx: null };
        // Tuzilma: kim kimga boʻysunadi (p — shtatdagi lavozim №, g — boʻlim, u — boʻlinma). Roʻyxatda yoʻq yangi boʻlim/boʻlinma oʻzi qoʻshiladi.
        // Tashkiliy tuzilma (PDF dagi kabi): boshliq tepada oʻrtada, boshqaruv apparati undan ikki tomonga, pastda sexlar va xizmatlar.
        var ST_TREE = { p: 1, k: [
            { p: 3, k: [{ g: 'u1g5' }, { u: 'u11' }, { u: 'u13' }] },
            { p: 7, k: [{ u: 'u12' }] },
            { p: 6, k: [{ g: 'u1g1' }] },
            { p: 4, k: [{ g: 'u1g7' }] },
            { p: 2, k: [{ g: 'u1g4' }, { g: 'u1g3' }, { g: 'u1g2' }, { u: 'u8' }] },
            { p: 5 }, { g: 'u1g11' }, { p: 9 }, { g: 'u1g8' }, { g: 'u1g9' }, { g: 'u1g10' },
            { p: 8, k: [{ g: 'u1g6' }] }
        ] };
        var ST_PROD = [{ u: 'u2' }, { u: 'u3' }, { u: 'u4', k: [{ u: 'u9' }] }, { u: 'u5' }, { u: 'u7' }, { u: 'u10' }, { u: 'u6' }];
        var ST_BIG = 8; // shundan koʻp xodimli kasb — yigʻilgan holda (yaqinlashtirib ochiladi)
        try { if (typeof ROLE_DEF !== 'undefined' && !ROLE_DEF.some(x => x[0] === 'iqt')) ROLE_DEF.push(['iqt', '📈', 'Iqtisodchi (struktura va oklad)', 'Strukturani koʻradi va tahrirlaydi, xodimlar okladini oʻzgartiradi']); } catch (e) {}
        function stView() { try { return isAdmin() || hasRole('rahbar') || hasRole('kadr') || hasRole('iqt') || hasRole('okl'); } catch (e) { return false; } }
        function stEdit() { try { return isAdmin() || hasRole('rahbar') || hasRole('kadr') || hasRole('iqt'); } catch (e) { return false; } }
        function stOkView() { try { return isAdmin() || hasRole('okl') || hasRole('rahbar') || hasRole('iqt'); } catch (e) { return false; } }
        function stOkEdit() { try { return isAdmin() || hasRole('iqt'); } catch (e) { return false; } }
        if (typeof okCan === 'function') okCan = agmkExtend('okCan', 'v3.14: oklad — rahbariyat va iqtisodchiga ham', okCan, o => function () { try { return o.apply(this, arguments) || hasRole('rahbar') || hasRole('iqt'); } catch (e) { return false; } });

        function stFired(it) { try { return typeof firedOf === 'function' && !!firedOf(it.tabel); } catch (e) { return false; } }
        function stIndex() { // lavozim № → xodimlar (2 500+ xodimda ham tez)
            const F = (typeof FIRED_KEY !== 'undefined' ? kvGet(FIRED_KEY, {}) : {}) || {}, M = new Map();
            allXodims().forEach(r => { const n = Number(r.item.posNo); if (!n || F[cleanTabel(r.item.tabel)]) return; let a = M.get(n); if (!a) M.set(n, a = []); a.push(r); });
            ST.idx = M; return M;
        }
        function stAt(no) { return ((ST.idx || stIndex()).get(Number(no)) || []).slice(); }
        function stShort(n) { const p = String(n || '').trim().split(/\s+/); if (p.length < 2 || /\./.test(p[1])) return p.join(' '); return p[0] + ' ' + p.slice(1, 3).filter(w => !/^(o.g.li|qizi|ugli|kizi)$/i.test(w)).map(w => w[0] + '.').join(''); }
        function stEsc(s) { return escapeHtml(String(s === undefined || s === null ? '' : s)); }
        function stOk(v) { return v ? Number(v).toLocaleString('ru-RU').replace(/ /g, ' ') : ''; }
        function stPosList(f) { return shtatTree.pos.filter(f).sort((a, b) => a.no - b.no); }
        function stStat(list) { let c = 0, b = 0, over = 0; list.forEach(p => { const n = stAt(p.no).length, k = Number(p.cnt) || 0; c += k; b += Math.min(n, k); over += Math.max(0, n - k); }); return { c: c, b: b, v: c - b, o: over }; }
        function stBadge(s) { return `<span class="st-cnt${s.v ? ' vac' : ''}">${s.b}/${s.c}${s.v ? ` · <b>${s.v} boʻsh</b>` : ''}${s.o ? ` · +${s.o}` : ''}</span>`; }

        // ---------- chizish ----------
        function stChips(p) {
            const L = stAt(p.no), k = Number(p.cnt) || 0, ok = stOkView(); let h = '';
            L.forEach((r, i) => { const it = r.item;
                h += `<div class="st-ch${i >= k ? ' over' : ''}" data-k="x:${it.id}" data-q="${stEsc(normTxt([it.name, it.tabel, p.name, it.stansiya || ''].join(' ')))}"><b>${stEsc(stShort(it.name))}</b><small>${stEsc(cleanTabel(it.tabel) || '—')}${it.razryad ? ' · ' + stEsc(it.razryad) + '-r' : ''}${ok && it.oklad ? ' · ' + stOk(it.oklad) : ''}${it.stansiya && p.cat === 'ishchi' ? ' · ' + stEsc(it.stansiya) : ''}${it.rosterIzoh && /taʼtil|ta'til|dekret/i.test(it.rosterIzoh) ? ' · 🍼' : ''}</small></div>`; });
            for (let i = L.length; i < k; i++) h += `<div class="st-ch vac" data-k="v:${p.no}" data-q="bosh vakant ${stEsc(normTxt(p.name))}"><b>Boʻsh oʻrin</b><small>vakant</small></div>`;
            return h;
        }
        function stChipBox(p, cls) {
            const n = Math.max(stAt(p.no).length, Number(p.cnt) || 0), big = n > ST_BIG, op = big && ST.open && ST.open.has(p.no);
            return (big ? `<div class="st-more" data-k="o:${p.no}">${op ? '▾ yigʻish' : '▸ ' + n + ' ta — roʻyxatni ochish'}</div>` : '') + `<div class="st-chs${cls || ''}${big ? ' cl' : ''}${op ? ' show' : ''}" data-no="${p.no}">${stChips(p)}</div>`;
        }
        function stPosRow(p) {
            const n = stAt(p.no).length, k = Number(p.cnt) || 0;
            return `<div class="st-pos"><div class="st-ph" data-k="p:${p.no}" data-q="${stEsc(normTxt(p.no + ' ' + p.name))}"><i>${p.no}</i><span>${stEsc(p.name)}</span><em class="${n < k ? 'vac' : n > k ? 'over' : ''}">${n}/${k}</em></div>${stChipBox(p)}</div>`;
        }
        function stBox(kind, id, title, sub, list, cls, extra, tot) {
            const s = stStat(list);
            const lead = kind === 'p' && list.length === 1, body = lead ? stChipBox(list[0], ' lead') : (list.length ? list.map(stPosRow).join('') : '<div class="st-empty">Lavozim yoʻq</div>');
            return `<div class="st-box ${cls || ''}" id="stb-${id}"><div class="st-bh" data-k="b:${kind}:${id}" data-q="${stEsc(normTxt(title + ' ' + (sub || '')))}"><b>${lead ? `<i class="st-no">${list[0].no}</i> ` : ''}${stEsc(title)}</b>${sub ? `<small>${stEsc(sub)}</small>` : ''}${stBadge(s)}${tot ? `<span class="st-tot${tot.v ? ' vac' : ''}" title="Shu boʻlinma va unga boʻysunuvchi barcha uchastkalar">jami ${tot.b}/${tot.c}${tot.v ? ` · ${tot.v} boʻsh` : ''}</span>` : ''}</div>${body}${extra || ''}</div>`;
        }
        const stIsW = p => p.cat === 'ishchi';
        // Har bir tutashuv (kim → qaysi guruh) roʻyxatga yoziladi va chizilgandan keyin strelkali chiziq bilan ulanadi
        function stKids(kh, lay) {
            if (!kh.length) return '';
            if (lay === 'hz') return `<div class="st-hk">${kh.map(x => `<div class="st-hi">${x.h}</div>`).join('')}</div>`;
            if (lay === 'g2') return `<div class="st-g2">${kh.map(x => `<div class="st-gi">${x.h}</div>`).join('')}</div>`;
            return `<div class="st-kids">${kh.map(x => `<div class="st-k">${x.h}</div>`).join('')}</div>`;
        }
        function stWorkBox(u, prod) { // sexning ishchilari (kadrlar roʻyxatidan) — kasblar boʻyicha
            const W = stPosList(p => p.u === u.id && !p.g && stIsW(p)); if (!W.length) return null;
            return { id: 'w' + u.id, h: `<div class="st-n">${stBox('w', 'w' + u.id, '👷 Ishchilar — ' + u.short, W.length + ' ta kasb', W, (prod ? 'prod' : 'apr') + ' wrk')}</div>` };
        }
        function stNode(n, used, prod) {
            // v4.7: kartaning oʻng tomonida — shu boʻlinma va uning barcha uchastkalari boʻyicha yigʻma «jami band/shtat»
            let box = '', id = '', kids = (n.k || []).slice(), extra = [], own = [], sub = '', title = '', kind = '', cls = '', list = [];
            if (n.p) { const p = posByNo(n.p); if (!p) return null; used.p.add(p.no); id = 'p' + p.no; kind = 'p'; title = p.name; list = [p]; own = [p]; cls = 'lead' + (n.p === 1 ? ' root' : ''); }
            else if (n.g) { const g = groupById(n.g); if (!g) return null; used.g.add(g.id); id = g.id; kind = 'g'; const u = unitById(g.u); title = g.name; sub = u && u.id !== 'u1' ? u.short : ''; list = stPosList(x => x.g === g.id); own = list; cls = prod ? 'prod' : 'apr'; }
            else if (n.u) { const u = unitById(n.u); if (!u) return null; used.u.add(u.id); id = u.id; kind = 'u';
                shtatTree.groups.filter(g => g.u === u.id && !used.g.has(g.id)).forEach(g => kids.push({ g: g.id }));
                const all = stPosList(x => x.u === u.id), s = stStat(all);
                title = u.name; sub = u.short + ' · jami ' + s.b + '/' + s.c; list = stPosList(x => x.u === u.id && !x.g && !stIsW(x)); own = all; cls = (prod ? 'prod' : 'apr') + ' unit';
                const w = stWorkBox(u, prod || n.u !== 'u1'); if (w) extra.push(w); }
            const kc = kids.map(k => stNode(k, used, prod || !!n.u)).filter(Boolean), kh = kc.concat(extra);
            const seen = new Set(), tp = []; own.concat(...kc.map(k => k.pos || [])).forEach(p => { if (p && !seen.has(p.no)) { seen.add(p.no); tp.push(p); } });
            const tot = kc.length ? stStat(tp) : null;
            if (kind === 'u' && tot) sub = sub.replace(/ · jami .*$/, ''); // yigʻma koʻrsatkich endi oʻng tomonda
            box = stBox(kind, id, title, sub, list, cls, '', tot);
            const lay = kh.length >= 3 ? (n.u && kh.length > 4 ? 'g2' : 'hz') : 'vs';
            kh.forEach(k => ST.edges.push([id, k.id, lay === 'hz' ? 'd' : lay === 'g2' ? 'r' : 's']));
            return { id: id, pos: tp, h: `<div class="st-n ${lay}">${box}${stKids(kh, lay)}</div>` };
        }
        function stBuild() {
            stIndex(); ST.edges = [];
            const used = { p: new Set(), g: new Set(), u: new Set(['u1']) };
            const root = posByNo(ST_TREE.p); if (root) used.p.add(root.no);
            const apr = ST_TREE.k.map(n => stNode(n, used, false)).filter(Boolean);
            const prod = ST_PROD.map(n => stNode(n, used, true)).filter(Boolean);
            // shtatga keyin qoʻshilgan boʻlim/lavozim/boʻlinmalar ham chiqadi
            shtatTree.groups.filter(g => g.u === 'u1' && !used.g.has(g.id)).forEach(g => apr.push(stNode({ g: g.id }, used, false)));
            const freeP = stPosList(p => p.u === 'u1' && !p.g && !used.p.has(p.no) && !stIsW(p)); if (freeP.length) apr.push({ id: 'u1', h: `<div class="st-n">${stBox('u', 'u1', 'Boshqaruv apparati — boshqa lavozimlar', '', freeP, 'apr')}</div>` });
            const wA = stWorkBox(unitById('u1'), false); if (wA) apr.push(wA);
            shtatTree.units.filter(u => !used.u.has(u.id)).forEach(u => { const x = stNode({ u: u.id }, used, true); if (x) prod.push(x); });
            const rid = root ? 'p' + root.no : ''; apr.forEach(x => ST.edges.push([rid, x.id, 'd'])); prod.forEach(x => ST.edges.push([rid, x.id, 'b']));
            const all = stStat(shtatTree.pos), aprS = stStat(stPosList(p => p.u === 'u1' && !stIsW(p))), wk = stStat(stPosList(stIsW)).b, itr = stStat(stPosList(p => !stIsW(p)));
            return `<div class="st-org"><svg class="st-svg" id="stSvg"></svg><div class="st-title">«Olmaliq KMK» AJ Sanoat temir yoʻl transporti boshqarmasi tashkiliy tuzilmasi<small>Jami: ${all.b} xodim · ITR shtati: ${itr.c}, band: ${itr.b}, <b class="r">boʻsh: ${itr.v}</b>${itr.o ? ', shtatdan ortiq: ' + itr.o : ''} · Boshqaruv apparati: ${aprS.b}/${aprS.c}${wk ? ' · Ishchilar: ' + wk : ''}</small></div>
                <div class="st-rootw">${root ? stBox('p', rid, 'Sanoat temir yoʻl transporti boshqarmasi boshligʻi', '', [root], 'lead root') : ''}</div>
                <div class="st-sec">BOSHQARUV APPARATI</div><div class="st-row apr">${apr.map(x => `<div class="st-col">${x.h}</div>`).join('')}</div>
                <div class="st-sec prod">ISHLAB CHIQARISH BOʻLINMALARI (sexlar va xizmatlar)</div><div class="st-row prod">${prod.map(x => `<div class="st-col">${x.h}</div>`).join('')}</div>
                <div class="st-leg"><span class="a"></span> boshqaruv apparati shtati <span class="p"></span> sex va xizmatlar shtati <span class="w"></span> ishchilar <span class="v"></span> boʻsh oʻrin <span class="o"></span> shtatdan ortiq</div></div>`;
        }
        // Strelkali tutashtiruvchi chiziqlar: har bir rahbar/boʻlinmadan uning har bir guruhiga (ishchilar bloki ham) — qutiga tegib turadi
        function stDrawLinks() {
            const org = document.querySelector('#stCv .st-org'), svg = $id('stSvg'); if (!org || !svg) return;
            const R = {}; // maketdagi joylashuv (transform/animatsiyadan qatʼi nazar)
            const off = el => { let x = 0, y = 0, e = el; while (e && e !== org) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x: x, y: y }; };
            const rc = id => { if (R[id]) return R[id]; const e = $id('stb-' + id); if (!e || !e.offsetParent) return null; const q = off(e); return R[id] = { l: q.x, t: q.y, w: e.offsetWidth, h: e.offsetHeight }; };
            const W = org.scrollWidth, H = org.scrollHeight; svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
            const aprRow = org.querySelector('.st-row.apr'), prodRow = org.querySelector('.st-row.prod');
            const yA = aprRow ? off(aprRow).y + 22 : 0, yP = prodRow ? off(prodRow).y + 22 : 0;
            let minX = 1e9, maxX = -1e9; org.querySelectorAll('.st-row>.st-col').forEach(c => { const q = off(c); minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x + c.offsetWidth); });
            const L = []; let miss = 0;
            ST.edges.forEach(([a, b, t]) => {
                const A = rc(a), B = rc(b); if (!A || !B) { miss++; return; }
                const ax = A.l + A.w / 2, ab = A.t + A.h, bx = B.l + B.w / 2, bt = B.t; let d = '';
                if (t === 'd') { const my = a === ST.rootId ? yA : bt - 22; d = `M${ax} ${ab}V${my}H${bx}V${bt - 1}`; }
                else if (t === 'b') { const sx = bx < ax ? minX - 30 : maxX + 30; d = `M${ax} ${ab}V${yA}H${sx}V${yP}H${bx}V${bt - 1}`; }
                else if (t === 's') { const rx = Math.min(A.l + 22, B.l - 14), cy = B.t + 26; d = `M${rx} ${ab}V${cy}H${B.l - 1}`; }
                else { const rx = B.l - 14, my = ab + 16; d = `M${ax} ${ab}V${my}H${rx}V${B.t + 26}H${B.l - 1}`; }
                L.push(`<path d="${d}" class="ln ${t}${String(b).startsWith('w') ? ' wk' : ''}" marker-end="url(#${String(b).startsWith('w') ? 'stArW' : 'stAr'})"/>`);
            });
            ST.miss = miss;
            svg.innerHTML = `<defs><marker id="stAr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1e293b"/></marker><marker id="stArW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b45309"/></marker></defs>` + L.join('');
        }
        function stSig() { try { return shtatTree.pos.length + '|' + (shtatTree.upd || '') + '|' + allXodims().map(r => r.item.id + ':' + (r.item.posNo || '') + ':' + (r.item.oklad || '') + ':' + r.item.name + ':' + r.item.tabel).join(','); } catch (e) { return ''; } }
        function stRender(keep) {
            const cv = $id('stCv'); if (!cv || !shtatTree) return;
            ST.sig = stSig(); ST.rootId = 'p' + ST_TREE.p; cv.innerHTML = stBuild(); try { stDrawLinks(); } catch (e) { console.error(e); }
            $id('stEditHint').innerHTML = (stEdit() ? '✏️ Xodim, boʻsh oʻrin yoki lavozimga bosib tahrirlang' : '👁 Faqat koʻrish') + (stOkEdit() ? ' · 💰 oklad' : '');
            if (!keep) stFit(); else stApply();
            if (ST.q) stSearch(ST.q, true);
        }
        function stLive() { // boshqa joyda (Ishchi xodimlar, sinxronlash) oʻzgarsa — sxema ham yangilanadi
            ST.idx = null;
            const s = $id('screen-st'); if (!s || !s.classList.contains('active')) return;
            clearTimeout(ST.rt); ST.rt = setTimeout(() => { if (stSig() !== ST.sig) stRender(true); }, 250);
        }

        // ---------- surish / yaqinlashtirish (temir yoʻl sxemasi kabi) ----------
        function stApply(anim) { const cv = $id('stCv'); if (!cv) return; cv.classList.toggle('anim', !!anim); cv.style.transform = `translate(${ST.x}px,${ST.y}px) scale(${ST.s})`; $id('stZl').innerText = Math.round(ST.s * 100) + '%'; }
        function stFit() { const vp = $id('stVp'), cv = $id('stCv'); if (!vp || !cv) return; const w = cv.scrollWidth || 1, vw = vp.clientWidth || 360; ST.s = Math.max(0.03, Math.min(1, (vw - 16) / w)); ST.x = (vw - w * ST.s) / 2; ST.y = 8; stApply(true); }
        function stZoom(f, cx, cy) { const vp = $id('stVp'), r = vp.getBoundingClientRect(); cx = cx === undefined ? r.width / 2 : cx - r.left; cy = cy === undefined ? r.height / 2 : cy - r.top; const ns = Math.max(0.04, Math.min(3, ST.s * f)), k = ns / ST.s; ST.x = cx - (cx - ST.x) * k; ST.y = cy - (cy - ST.y) * k; ST.s = ns; stApply(); }
        function stFocus(el, open) {
            const vp = $id('stVp'), cv = $id('stCv'); if (!el || !vp) return; { const c = el.parentElement; if (c && c.classList.contains('cl') && !c.classList.contains('show')) { c.classList.add('show'); ST.open.add(+c.dataset.no); try { stDrawLinks(); } catch (e) {} } } const er = el.getBoundingClientRect(), cr = cv.getBoundingClientRect();
            const x = (er.left - cr.left) / ST.s, y = (er.top - cr.top) / ST.s, w = er.width / ST.s, h = er.height / ST.s, vw = vp.clientWidth, vh = vp.clientHeight;
            ST.s = Math.max(0.9, Math.min(1.4, ST.s < 0.9 ? 1.1 : ST.s)); ST.x = vw / 2 - (x + w / 2) * ST.s; ST.y = vh * 0.38 - (y + h / 2) * ST.s; stApply(true);
            document.querySelectorAll('#stCv .flash').forEach(e => e.classList.remove('flash')); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2200);
            if (open) setTimeout(() => stTap(el), 350);
        }
        function stBind() {
            const vp = $id('stVp'); if (!vp || vp._b) return; vp._b = 1;
            vp.addEventListener('pointerdown', e => { if (e.target.closest('.st-tools')) return; try { vp.setPointerCapture(e.pointerId); } catch (x) {} ST.pts.set(e.pointerId, [e.clientX, e.clientY]); ST.moved = ST.pts.size > 1 ? 99 : 0; ST.target = e.target; ST.pinch = null; });
            vp.addEventListener('pointermove', e => {
                if (!ST.pts.has(e.pointerId)) return; const pr = ST.pts.get(e.pointerId); ST.pts.set(e.pointerId, [e.clientX, e.clientY]);
                if (ST.pts.size === 1) { const dx = e.clientX - pr[0], dy = e.clientY - pr[1]; ST.moved += Math.abs(dx) + Math.abs(dy); ST.x += dx; ST.y += dy; stApply(); }
                else if (ST.pts.size === 2) { const [a, b] = [...ST.pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (ST.pinch) stZoom(d / ST.pinch, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); ST.pinch = d; ST.moved = 99; }
            });
            const up = e => { const had = ST.pts.has(e.pointerId); ST.pts.delete(e.pointerId); if (ST.pts.size < 2) ST.pinch = null;
                if (had && e.type === 'pointerup' && ST.moved < 9 && !ST.pts.size) { const t = ST.target && ST.target.closest ? ST.target.closest('[data-k]') : null; if (t) stTap(t); } };
            vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
            vp.addEventListener('wheel', e => { e.preventDefault(); stZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
            vp.addEventListener('dblclick', e => { stZoom(1.6, e.clientX, e.clientY); });
        }

        // ---------- qidiruv ----------
        function stSearch(q, quiet) {
            ST.q = String(q || '').trim(); const cv = $id('stCv'); if (!cv) return; const t = normTxt(ST.q).split(' ').filter(Boolean);
            cv.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); cv.querySelectorAll('.st-chs.cl.show').forEach(c => { if (!ST.open.has(+c.dataset.no)) c.classList.remove('show'); }); cv.classList.toggle('hl-on', !!t.length); ST.hits = []; ST.hi = -1;
            const box = $id('stRes');
            if (!t.length) { box.innerHTML = ''; box.classList.add('hidden'); return; }
            cv.querySelectorAll('[data-q]').forEach(e => { const h = e.getAttribute('data-q') || ''; if (t.every(w => h.includes(w))) { e.classList.add('hl'); ST.hits.push(e); const c = e.parentElement; if (c && c.classList.contains('cl')) c.classList.add('show'); } });
            // xodim > boʻsh oʻrin > lavozim > boʻlim tartibida
            const rk = e => { const k = e.getAttribute('data-k') || ''; return k[0] === 'x' ? 0 : k[0] === 'p' ? 1 : k[0] === 'b' ? 2 : 3; }; ST.hits.sort((a, b) => rk(a) - rk(b));
            try { stDrawLinks(); } catch (e) {}
            if (quiet) return;
            box.classList.remove('hidden');
            box.innerHTML = `<div class="st-rh">Topildi: ${ST.hits.length}${ST.hits.length > 30 ? ' (birinchi 30 tasi)' : ''}<span onclick="stSearchClear()">✕</span></div>` + (ST.hits.slice(0, 30).map((e, i) => { const k = e.getAttribute('data-k'), bx = e.closest('.st-box'), ttl = bx ? (bx.querySelector('.st-bh b') || {}).innerText : '';
                let lbl = ''; if (k[0] === 'x') { const r = allXodims().find(z => String(z.item.id) === k.slice(2)); lbl = '👤 ' + (r ? r.item.name + ' · ' + (cleanTabel(r.item.tabel) || '—') : ''); } else if (k[0] === 'v') lbl = '⬜ Boʻsh oʻrin · ' + ((posByNo(k.slice(2)) || {}).name || ''); else if (k[0] === 'p') lbl = '📌 ' + ((posByNo(k.slice(2)) || {}).name || ''); else lbl = '🏢 ' + e.innerText.split('\n')[0];
                return `<div class="st-ri" onclick="stGoHit(${i})">${stEsc(lbl)}<small>${stEsc(ttl || '')}</small></div>`; }).join('') || '<div class="st-ri">Hech narsa topilmadi</div>');
        }
        function stSearchClear() { $id('stQ').value = ''; stSearch(''); }
        function stGoHit(i) { const e = ST.hits[i]; if (!e) return; ST.hi = i; $id('stRes').classList.add('hidden'); stFocus(e); }
        function stNext() { if (!ST.hits.length) { stSearch($id('stQ').value); return; } $id('stRes').classList.add('hidden'); ST.hi = (ST.hi + 1) % ST.hits.length; stFocus(ST.hits[ST.hi]); }
        function stJump(id) { const e = $id('stb-' + id); if (e) stFocus(e); }

        // ---------- ekran ----------
        function openStruct() {
            if (!stView()) { alert('🏛 Struktura — faqat rahbariyat, kadrlar boʻlimi, iqtisodchi va administrator uchun.\nRuxsat kerak boʻlsa — administratorga murojaat qiling.'); return; }
            const cur = document.querySelector('.screen.active'); if (cur && cur.id !== 'screen-st') ST.back = cur.id;
            const s = secScreen('screen-st', '🏛 Struktura', "stBack()");
            if (!ST.ready) { ST.ready = true;
                const b = secBody('screen-st'); b.style.padding = '0'; b.style.overflow = 'hidden'; b.style.position = 'relative';
                s.querySelector('.sec-tabs').outerHTML = `<div class="search-wrap" style="margin-top:8px"><span class="search-icon">🔍</span><input type="text" class="search-box" id="stQ" placeholder="Xodim, tabel, lavozim yoki boʻlim..." oninput="stSearch(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();stNext();}"><button class="mic-btn" onclick="stNext()" title="Keyingisi">▶</button></div><div class="st-jmp" id="stJmp"></div><div class="st-hint" id="stEditHint"></div>`;
                b.innerHTML = `<div id="stVp" class="st-vp"><div id="stCv" class="st-cv"></div></div><div id="stRes" class="st-res hidden"></div>
                    <div class="st-tools"><button onclick="stZoom(1.35)">＋</button><button onclick="stZoom(1/1.35)">－</button><button onclick="stFit()" title="Butun sxema">⤢</button><span id="stZl">30%</span><button onclick="stMenu()" title="Amallar">⋯</button></div>`;
                stBind();
            }
            $id('stJmp').innerHTML = [['p1', 'Rahbar']].concat(ST_PROD.map(n => { const u = unitById(n.u); return u ? [u.id, u.short] : null; }).filter(Boolean)).map(x => `<i onclick="stJump('${x[0]}')">${stEsc(x[1])}</i>`).join('');
            openScreen('screen-st'); setTimeout(() => stRender(false), 30);
            try { if (typeof okLoad === 'function' && stOkView()) okLoad(true).then(n => { if (n) stLive(); }); } catch (e) {}
        }
        function stBack() { if ($id('stQ') && $id('stQ').value) { stSearchClear(); return; } if (!ST.back || ST.back === 'screen-xt') openXodimTree(); else openScreen(ST.back); }
        function stMenu() {
            mdl('stMdl', `<div class="px-h"><b>🏛 Struktura — amallar</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <button class="action-btn sec" onclick="mdlClose('stMdl');stExport()">📤 Excel: shtat va xodimlar (boʻsh oʻrinlar bilan)</button>
                ${stEdit() ? `<button class="action-btn sec" onclick="mdlClose('stMdl');stFreeList()">👤 Lavozimga biriktirilmagan xodimlar (${allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo)) && !stFired(r.item)).length})</button>
                <button class="action-btn sec" onclick="stImpOpen()">👷 Xodimlar roʻyxatini import qilish (1C yoki kadrlardan Excel)</button>` : ''}
                <button class="action-btn sec" onclick="mdlClose('stMdl');openXodimTree()">🌳 Ishchi xodimlar (roʻyxat koʻrinishi)</button>
                <div class="nd-tip" style="margin-top:8px">Sxema va «Ishchi xodimlar» bitta maʼlumotdan: bu yerda xodimni boshqa oʻringa oʻtkazsangiz yoki yangi xodim qabul qilsangiz — u yerda ham, u yerda lavozimini oʻzgartirsangiz — bu yerda ham darhol koʻrinadi.</div>`, true);
        }

        // ---------- bosish → tahrirlash ----------
        function stTap(el) { const k = el.getAttribute('data-k') || ''; if (k[0] === 'o') { stToggle(+k.slice(2), el); return; } if (k[0] === 'x') stPerson(+k.slice(2) || k.slice(2)); else if (k[0] === 'v') stVacant(+k.slice(2)); else if (k[0] === 'p') stPosEdit(+k.slice(2)); else if (k[0] === 'b') { const a = k.split(':'); stBoxEdit(a[1], a[2]); } }
        function stToggle(no, el) { const c = el.nextElementSibling; if (!c) return; const on = !c.classList.contains('show'); c.classList.toggle('show', on); if (on) ST.open.add(no); else ST.open.delete(no); const n = c.querySelectorAll('.st-ch').length; el.innerText = on ? '▾ yigʻish' : '▸ ' + n + ' ta — roʻyxatni ochish'; try { stDrawLinks(); } catch (e) {} }
        function stFind(id) { return allXodims().find(r => String(r.item.id) === String(id)) || null; }
        function stSaved(msg) { try { saveDB(); } catch (e) {} try { if (syncReady()) { clearTimeout(SYNC.pushT); SYNC.pushT = setTimeout(() => syncNow(true), 2500); } } catch (e) {} try { if (typeof audLog === 'function' && msg) audLog('🏛 ' + msg); } catch (e) {} stRender(true); try { xtRender(); } catch (e) {} if (msg) showToast('✅ ' + msg); }
        function stPlace(r, p) { // xodimni shtatdagi oʻringa qoʻyish — «Ishchi xodimlar»da ham shu joyga oʻtadi
            const it = r.item; it.posNo = p ? p.no : null; ST.idx = null;
            if (!p) return; it.lavozim = p.name; try { it.bolim = rsBolim(p, it.stansiya || ''); } catch (e) {}
            const key = unitById(p.u).key; if (r.su !== key) { sectionItemsDB.xodim[r.su] = (sectionItemsDB.xodim[r.su] || []).filter(x => x !== it); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(it); r.su = key; } it.seh = key;
        }
        function stPerson(id) {
            const r = stFind(id); if (!r) return; const it = r.item, p = it.posNo ? posByNo(it.posNo) : null, ed = stEdit(), E = stEsc;
            mdl('stMdl', `<div class="px-h"><b>👤 ${E(it.name)}</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="st-inf"><div><small>Tabel</small><b>${E(cleanTabel(it.tabel) || '—')}</b></div><div><small>Razryad</small><b>${E(it.razryad || '—')}</b></div>${stOkView() ? `<div><small>Oklad</small><b>${it.oklad ? stOk(it.oklad) + ' soʻm' : '—'}</b></div>` : ''}</div>
                <div class="st-pth">📌 ${p ? `№${p.no}. ${E(p.name)}<br><small>${E(posPath(p, false))}</small>` : 'Lavozimga biriktirilmagan'}</div>
                ${it.rosterIzoh ? `<div class="nd-tip">ℹ️ ${E(it.rosterIzoh)}</div>` : ''}${it.phone ? `<div class="st-pth">📞 <a class="tel-link" href="${telHref(it.phone)}">${E(it.phone)}</a></div>` : ''}
                ${stOkEdit() ? `<div class="pp-lbl">💰 OKLAD (faqat iqtisodchi / administrator)</div><div class="st-ok"><input id="stOkIn" class="search-box" inputmode="numeric" value="${E(it.oklad || '')}" placeholder="soʻm"><input id="stRzIn" class="search-box" inputmode="numeric" value="${E(it.razryad || '')}" placeholder="razryad" style="max-width:90px"><button class="pr mini-btn" onclick="stOkSave(${JSON.stringify(String(it.id)).replace(/"/g, '&quot;')})">Saqlash</button></div>` : ''}
                <div class="pk-btns st-btns">
                    <button onclick="mdlClose('stMdl');ST.fromSt=true;xtOpenXodim(${JSON.stringify(it.id).replace(/"/g, '&quot;')})">📄 Pasporti</button>
                    ${ed ? `<button onclick="stMovePick('${it.id}')">🔁 Boshqa oʻringa</button><button onclick="stUnplace('${it.id}')">⬜ Oʻrnini boʻshatish</button>` : ''}
                </div>`, true);
        }
        async function stOkSave(id) {
            if (!stOkEdit()) return; const r = stFind(id); if (!r) return; const it = r.item;
            const v = Math.round(+String($id('stOkIn').value).replace(/[^\d]/g, '') || 0), rz = String($id('stRzIn').value).replace(/[^\d]/g, '');
            if (v && (v < 100000 || v > 200000000) && !(await uiConfirm('Oklad ' + stOk(v) + ' soʻm — toʻgʻrimi?'))) return;
            const t = cleanTabel(it.tabel); if (!t) { alert('Xodimning tabel raqami yoʻq — avval tabelni kiriting.'); return; }
            let srv = false;
            try { if (typeof sigSrv === 'function' && sigSrv()) { await sbFetch('/api/roster/v1/oklad', { method: 'PUT', body: { tabel: t, oklad: v, razryad: rz ? +rz : null, name: it.name, lavozim: it.lavozim } }); srv = true; } }
            catch (e) { alert('⚠️ Serverga yozilmadi: ' + (typeof agmkErrUz === 'function' ? agmkErrUz(e) : e.message) + '\n\nServer 1.7.0 versiyasiga yangilanganini tekshiring. Oklad hozircha faqat shu telefonda saqlanadi.'); }
            it.oklad = v || undefined; if (rz) it.razryad = +rz;
            mdlClose('stMdl'); stSaved((srv ? '' : '(faqat shu telefonda) ') + 'Oklad: ' + stShort(it.name) + ' — ' + (v ? stOk(v) + ' soʻm' : 'oʻchirildi'));
        }
        async function stUnplace(id) {
            if (!stEdit()) return; const r = stFind(id); if (!r) return;
            if (!(await uiConfirm(r.item.name + ' — lavozimidagi oʻrni boʻshatilsinmi?\nXodim oʻchirilmaydi, «Lavozimga biriktirilmaganlar» roʻyxatiga oʻtadi; oʻrni boʻsh (vakant) koʻrinadi.'))) return;
            const p = posByNo(r.item.posNo); r.item.posNo = null; ST.idx = null; mdlClose('stMdl'); stSaved('Oʻrin boʻshatildi: ' + (p ? p.name : '') + ' (' + stShort(r.item.name) + ')');
        }
        // oʻrin tanlash (qidiruv bilan)
        function stMovePick(id) {
            if (!stEdit()) return; const r = stFind(id); if (!r) return;
            mdl('stMdl', `<div class="px-h"><b>🔁 ${stEsc(stShort(r.item.name))} — qaysi oʻringa?</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <input id="stPq" class="search-box" placeholder="Lavozim, boʻlim yoki № ..." oninput="stPosOpts('${id}')"><label class="st-chk"><input type="checkbox" id="stPfree" checked onchange="stPosOpts('${id}')"> faqat boʻsh oʻrni borlar</label><div id="stPl" class="st-pl"></div>`, true);
            stPosOpts(id); setTimeout(() => { try { $id('stPq').focus(); } catch (e) {} }, 50);
        }
        function stPosOpts(id) {
            const q = normTxt($id('stPq').value).split(' ').filter(Boolean), fr = $id('stPfree').checked;
            const L = shtatTree.pos.filter(p => { const h = normTxt(p.no + ' ' + p.name + ' ' + posPath(p) + ' ' + unitById(p.u).short); return q.every(t => h.includes(t)) && (!fr || stAt(p.no).length < (Number(p.cnt) || 0)); }).sort((a, b) => a.no - b.no).slice(0, 60);
            $id('stPl').innerHTML = L.map(p => { const n = stAt(p.no).length; return `<div class="st-ri" onclick="stMoveDo('${id}',${p.no})">№${p.no}. ${stEsc(p.name)} <em class="${n < p.cnt ? 'vac' : ''}">${n}/${p.cnt}</em><small>${stEsc(posPath(p, true))}</small></div>`; }).join('') || '<div class="st-ri">Mos oʻrin yoʻq</div>';
        }
        async function stMoveDo(id, no) {
            const r = stFind(id), p = posByNo(no); if (!r || !p || !stEdit()) return; const n = stAt(no).length;
            if (n >= (Number(p.cnt) || 0) && !(await uiConfirm('Bu lavozimda boʻsh oʻrin yoʻq (' + n + '/' + p.cnt + '). Baribir shtatdan ortiq qilib qoʻyilsinmi?'))) return;
            stPlace(r, p); mdlClose('stMdl'); stSaved(stShort(r.item.name) + ' → №' + p.no + ' ' + p.name);
            setTimeout(() => { const e = document.querySelector(`#stCv [data-k="x:${r.item.id}"]`); if (e) stFocus(e); }, 120);
        }
        // boʻsh oʻrin: mavjud xodimni qoʻyish yoki yangi xodim qabul qilish
        function stVacant(no) {
            const p = posByNo(no); if (!p) return; const E = stEsc;
            if (!stEdit()) { mdl('stMdl', `<div class="px-h"><b>⬜ Boʻsh oʻrin</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div><div class="st-pth">№${p.no}. ${E(p.name)}<br><small>${E(posPath(p, false))}</small></div>`, true); return; }
            mdl('stMdl', `<div class="px-h"><b>⬜ Boʻsh oʻrin — №${p.no}</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="st-pth">${E(p.name)}<br><small>${E(posPath(p, false))} · shtat ${p.cnt}, band ${stAt(p.no).length}</small></div>
                <div class="pp-lbl">➕ YANGI XODIM QABUL QILISH</div>
                <div class="st-nf"><input id="stNn" class="search-box" placeholder="F.I.Sh. (toʻliq)"><input id="stNt" class="search-box" inputmode="numeric" placeholder="Tabel raqami"><input id="stNr" class="search-box" inputmode="numeric" placeholder="Razryad"><input id="stNp" class="search-box" inputmode="tel" placeholder="Telefon (ixtiyoriy)">${stOkEdit() ? '<input id="stNo" class="search-box" inputmode="numeric" placeholder="Oklad, soʻm">' : ''}<button class="action-btn" onclick="stHire(${p.no})">✅ Qabul qilish</button></div>
                <div class="pp-lbl">👤 YOKI MAVJUD XODIMNI QOʻYISH</div>
                <input id="stXq" class="search-box" placeholder="F.I.Sh. yoki tabel..." oninput="stXOpts(${p.no})"><div id="stXl" class="st-pl"></div>`, true);
            stXOpts(no);
        }
        function stXOpts(no) {
            const q = normTxt($id('stXq').value).split(' ').filter(Boolean);
            let L = allXodims().filter(r => !stFired(r.item) && Number(r.item.posNo) !== no);
            L = q.length ? L.filter(r => { const h = normTxt(r.item.name + ' ' + r.item.tabel + ' ' + (r.item.lavozim || '')); return q.every(t => h.includes(t)); }) : L.filter(r => !(r.item.posNo && posByNo(r.item.posNo)));
            $id('stXl').innerHTML = (!q.length ? `<div class="st-rh">Lavozimga biriktirilmaganlar: ${L.length}${L.length ? '' : ' — qidiruvda istalgan xodimni toping'}</div>` : '') + L.slice(0, 40).map(r => { const p = r.item.posNo ? posByNo(r.item.posNo) : null; return `<div class="st-ri" onclick="stMoveDo('${r.item.id}',${no})">👤 ${stEsc(r.item.name)} · ${stEsc(cleanTabel(r.item.tabel) || '—')}<small>${p ? 'hozir: №' + p.no + ' ' + stEsc(p.name) + ' · ' + stEsc(unitById(p.u).short) : 'biriktirilmagan'}</small></div>`; }).join('');
        }
        async function stHire(no) {
            const p = posByNo(no); if (!p || !stEdit()) return;
            const n = $id('stNn').value.trim().replace(/\s+/g, ' '), t = cleanTabel($id('stNt').value), rz = $id('stNr').value.replace(/[^\d]/g, ''), ph = $id('stNp').value.trim(), ok = $id('stNo') ? Math.round(+$id('stNo').value.replace(/[^\d]/g, '') || 0) : 0;
            if (n.split(' ').length < 2) { alert('F.I.Sh.ni toʻliq kiriting (kamida familiya va ism).'); return; }
            if (!/^\d{1,8}$/.test(t)) { alert('Tabel raqamini kiriting (faqat raqam).'); return; }
            const ex = findXodimsByTabel(t);
            if (ex.length) { if (await uiConfirm('Tabel ' + t + ' allaqachon bor: ' + ex[0].item.name + '.\nShu xodim bu oʻringa oʻtkazilsinmi?')) stMoveDo(ex[0].item.id, no); return; }
            let mx = 1000; allXodims().forEach(z => { const i = +z.item.id; if (i > mx && i < 1e12) mx = i; });
            const key = unitById(p.u).key, it = { id: mx + 1, name: n, inv: t, tabel: t, lavozim: p.name, bolim: '', birthDate: '', yil: null, seh: key, status: 'Soz', kirganSana: (typeof todayISO === 'function' ? todayISO() : ''), photo: null,
                workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [], spravka: null, oilaviy: '', izoh: '', oilaAzolari: '', history: [], gallery: [], phone: ph, phones2: [], razryad: rz ? +rz : null, posNo: p.no };
            try { it.bolim = rsBolim(p, ''); } catch (e) {}
            (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(it);
            if (ok && stOkEdit()) { it.oklad = ok; try { if (sigSrv()) await sbFetch('/api/roster/v1/oklad', { method: 'PUT', body: { tabel: t, oklad: ok, razryad: rz ? +rz : null, name: n, lavozim: p.name, bolinma: unitById(p.u).short } }); } catch (e) { showToast('⚠️ Oklad serverga yozilmadi'); } }
            mdlClose('stMdl'); stSaved('Qabul qilindi: ' + n + ' → №' + p.no + ' ' + p.name);
            setTimeout(() => { const e = document.querySelector(`#stCv [data-k="x:${it.id}"]`); if (e) stFocus(e); }, 150);
        }
        // lavozim (shtat birligi) tahriri
        function stPosEdit(no) {
            const p = posByNo(no); if (!p) return; const E = stEsc, n = stAt(no).length, ed = stEdit();
            mdl('stMdl', `<div class="px-h"><b>📌 Lavozim №${p.no}</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="st-pth">${E(p.name)}<br><small>${E(posPath(p, false))} · ${E(p.cat || '')} · shtat ${p.cnt}, band ${n}, boʻsh ${Math.max(0, p.cnt - n)}</small></div>
                ${ed ? `<div class="pp-lbl">TAHRIRLASH</div><div class="st-nf"><input id="stPn" class="search-box" value="${E(p.name)}" placeholder="Lavozim nomi"><label class="st-lb">Shtat birligi soni <input id="stPc" class="search-box" inputmode="numeric" value="${E(p.cnt)}" style="max-width:90px"></label>
                    <select id="stPk" class="search-box">${[['rah.', 'rahbar'], ['mutax.', 'mutaxassis'], ['texn.', 'texnik xodim'], ['ishchi', 'ishchi']].map(c => `<option value="${c[0]}"${c[0] === p.cat ? ' selected' : ''}>${c[1]}</option>`).join('')}</select>
                    <button class="action-btn" onclick="stPosSave(${p.no})">💾 Saqlash</button>${n ? '' : `<button class="action-btn sec" onclick="stPosDel(${p.no})">🗑 Lavozimni shtatdan olib tashlash</button>`}</div>
                    <div class="nd-tip">Nom oʻzgarsa — shu oʻrindagi xodimlarning lavozimi ham oʻzgaradi («Ishchi xodimlar»da ham).</div>` : ''}`, true);
        }
        async function stPosSave(no) {
            const p = posByNo(no); if (!p || !stEdit()) return; const nm = $id('stPn').value.trim().replace(/\s+/g, ' '), c = Math.max(0, Math.min(999, parseInt($id('stPc').value, 10) || 0)), cat = $id('stPk').value;
            if (!nm) return; const n = stAt(no).length;
            if (c < n && !(await uiConfirm('Shtat ' + c + ' ta, lekin bu oʻrinda ' + n + ' ta xodim bor — ' + (n - c) + ' tasi «shtatdan ortiq» boʻlib qoladi. Davom etilsinmi?'))) return;
            const old = p.name; p.name = nm; p.cnt = c; p.cat = cat;
            if (old !== nm) allXodims().forEach(r => { if (Number(r.item.posNo) === no) r.item.lavozim = nm; });
            stTreeSave(); mdlClose('stMdl'); stSaved('Lavozim №' + no + ': ' + nm + ' — shtat ' + c);
        }
        async function stPosDel(no) {
            const p = posByNo(no); if (!p || !stEdit() || stAt(no).length) return;
            if (!(await uiConfirm('№' + no + ' «' + p.name + '» shtatdan olib tashlansinmi?'))) return;
            shtatTree.pos = shtatTree.pos.filter(x => x !== p); stTreeSave(); mdlClose('stMdl'); stSaved('Lavozim olib tashlandi: ' + p.name);
        }
        function stBoxEdit(kind, id) {
            if (kind === 'p') { stPosEdit(+String(id).slice(1)); return; } if (kind === 'w') { kind = 'u'; id = String(id).slice(1); }
            const g = kind === 'g' ? groupById(id) : null, u = g ? unitById(g.u) : unitById(id); if (!u) return; const E = stEsc;
            const list = stPosList(p => g ? p.g === g.id : p.u === u.id), s = stStat(list);
            mdl('stMdl', `<div class="px-h"><b>🏢 ${E(g ? g.name : u.name)}</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="st-inf"><div><small>Shtat</small><b>${s.c}</b></div><div><small>Band</small><b>${s.b}</b></div><div><small>Boʻsh</small><b class="r">${s.v}</b></div></div>
                ${stEdit() ? `<div class="pp-lbl">➕ YANGI LAVOZIM (shtat birligi)</div><div class="st-nf"><input id="stAn" class="search-box" placeholder="Lavozim nomi"><label class="st-lb">Soni <input id="stAc" class="search-box" inputmode="numeric" value="1" style="max-width:90px"></label>
                    <select id="stAk" class="search-box"><option value="mutax.">mutaxassis</option><option value="rah.">rahbar</option><option value="texn.">texnik xodim</option><option value="ishchi">ishchi</option></select>
                    ${!g ? `<select id="stAg" class="search-box"><option value="">— boʻlinmaning oʻzida —</option>${shtatTree.groups.filter(x => x.u === u.id).map(x => `<option value="${x.id}">${E(x.name)}</option>`).join('')}</select>` : ''}
                    <button class="action-btn" onclick="stPosAdd('${u.id}','${g ? g.id : ''}')">➕ Qoʻshish</button></div>
                    ${!g ? `<div class="pp-lbl">➕ YANGI BOʻLIM / UCHASTKA</div><div class="st-nf"><input id="stGn" class="search-box" placeholder="Boʻlim yoki uchastka nomi"><button class="action-btn sec" onclick="stGrpAdd('${u.id}')">➕ Qoʻshish</button></div>` :
                    `<div class="st-nf"><input id="stGr" class="search-box" value="${E(g.name)}"><button class="action-btn sec" onclick="stGrpRen('${g.id}')">✏️ Nomini saqlash</button></div>`}` : ''}`, true);
        }
        function stPosAdd(uid, gid) {
            if (!stEdit()) return; const nm = $id('stAn').value.trim().replace(/\s+/g, ' '), c = Math.max(1, Math.min(999, parseInt($id('stAc').value, 10) || 1)); if (!nm) { alert('Lavozim nomini yozing.'); return; }
            const g = gid || ($id('stAg') ? $id('stAg').value : '') || null, no = shtatTree.pos.reduce((m, x) => Math.max(m, x.no), 0) + 1;
            shtatTree.pos.push({ no: no, name: nm, cnt: c, cat: $id('stAk').value, u: uid, g: g }); stTreeSave(); mdlClose('stMdl'); stSaved('Yangi lavozim №' + no + ': ' + nm + ' (' + c + ')');
            setTimeout(() => { const e = document.querySelector(`#stCv [data-k="p:${no}"]`); if (e) stFocus(e); }, 150);
        }
        function stGrpAdd(uid) { if (!stEdit()) return; const nm = $id('stGn').value.trim(); if (!nm) return; let i = 1; while (groupById(uid + 'g' + i)) i++; shtatTree.groups.push({ id: uid + 'g' + i, u: uid, name: nm }); stTreeSave(); mdlClose('stMdl'); stSaved('Yangi boʻlim: ' + nm); }
        function stGrpRen(gid) { const g = groupById(gid); if (!g || !stEdit()) return; const nm = $id('stGr').value.trim(); if (!nm) return; g.name = nm; allXodims().forEach(r => { const p = r.item.posNo ? posByNo(r.item.posNo) : null; if (p && p.g === gid) try { r.item.bolim = rsBolim(p, r.item.stansiya || ''); } catch (e) {} }); stTreeSave(); mdlClose('stMdl'); stSaved('Boʻlim nomi: ' + nm); }
        function stTreeSave() { shtatTree.upd = new Date().toISOString(); shtatTree.updBy = meTabel(); saveShtatTree(); }
        function stFreeList() {
            const L = allXodims().filter(r => !(r.item.posNo && posByNo(r.item.posNo)) && !stFired(r.item));
            mdl('stMdl', `<div class="px-h"><b>👤 Biriktirilmagan xodimlar: ${L.length}</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div><div class="st-pl">${L.map(r => `<div class="st-ri" onclick="stMovePick('${r.item.id}')">👤 ${stEsc(r.item.name)} · ${stEsc(cleanTabel(r.item.tabel) || '—')}<small>${stEsc(r.item.lavozim || '')} — oʻrin tanlash uchun bosing</small></div>`).join('') || '<div class="st-ri">Hammasi oʻz oʻrnida ✅</div>'}</div>`, true);
        }
        function stExport() {
            const ok = stOkView(), rows = [['Boʻlinma', 'Boʻlim / uchastka', '№', 'Lavozim', 'Toifa', 'Shtat', 'Oʻrin', 'F.I.Sh.', 'Tabel', 'Razryad'].concat(ok ? ['Oklad'] : []).concat(['Holat'])];
            shtatTree.units.forEach(u => stPosList(p => p.u === u.id).sort((a, b) => String(a.g || '').localeCompare(String(b.g || '')) || a.no - b.no).forEach(p => {
                const L = stAt(p.no), g = p.g ? groupById(p.g) : null, k = Number(p.cnt) || 0;
                for (let i = 0; i < Math.max(k, L.length); i++) { const it = L[i] && L[i].item; rows.push([u.short, g ? g.name : '', p.no, p.name, p.cat || '', k, i + 1, it ? it.name : '', it ? cleanTabel(it.tabel) : '', it ? (it.razryad || '') : ''].concat(ok ? [it && it.oklad ? +it.oklad : ''] : []).concat([it ? (i >= k ? 'shtatdan ortiq' : 'band') : 'BOʻSH'])); }
            }));
            xlsxDl(rows, 'Struktura ' + (typeof todayISO === 'function' ? fmtISO(todayISO()) : ''));
        }

        // ---------- ishchilar roʻyxatini import qilish (kadrlardan Excel) ----------
        //  Ustunlar (sarlavha nomi boʻyicha topiladi): Tabel · F.I.Sh. · Lavozim (kasb) · Boʻlinma (sex) · Uchastka (ixtiyoriy) · Razryad (ixtiyoriy) · Shtat soni (ixtiyoriy)
        var ST_IMP = null;
        function stImpOpen() {
            if (!stEdit()) return;
            mdl('stMdl', `<div class="px-h"><b>👷 Ishchilar roʻyxatini import qilish</b><button class="mini-btn" onclick="mdlClose('stMdl')">✕</button></div>
                <div class="nd-tip">Kadrlar boʻlimidan olingan Excel: <b>Tabel, F.I.Sh., Lavozim (kasb), Boʻlinma (sex)</b> ustunlari shart; <b>Uchastka, Razryad, Shtat soni</b> — ixtiyoriy.<br>Har bir ishchi oʻz sexi › uchastkasi › kasbiga joylanadi; shtat soni berilsa — qolgan oʻrinlar <b>boʻsh</b> koʻrinadi. Bor xodim (tabel boʻyicha) yangilanadi, yoʻgʻi qoʻshiladi. Oklad ustuni olinmaydi (u serverda, iqtisodchi kiritadi).</div>
                <button class="action-btn sec" onclick="stImpTpl()">📄 Namuna shablon (Excel)</button>
                <label class="action-btn" style="display:block;text-align:center">📥 Excel faylni tanlash<input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="stImpFile(this)"></label><div id="stImpR"></div>`, true);
        }
        function stImpTpl() { xlsxDl([['Tabel', 'F.I.Sh.', 'Lavozim (kasb)', 'Boʻlinma (sex)', 'Uchastka', 'Razryad', 'Shtat soni'], ['12345', 'Familiya Ism Otasining ismi', 'Lokomotiv mashinisti', '1-TYS', 'Harakatlanuvchi sostav ekspluatatsiyasi uchastkasi', '5', '40']], 'Ishchilar shabloni'); }
        var ST_UALIAS = { etx: 'u8', et: 'u8', es: 'u8', vx: 'u10', vh: 'u10', vs: 'u10', boshqarma: 'u1', boshqaruvapparati: 'u1', smbvaax: 'u7', stsb: 'u7', sptox: 'u9', ktux: 'u9', iqx: 'u12', mxq: 'u11', axch: 'u11', nqmk: 'u6', karyer: 'u6', tjabtx: 'u13' };
        function stImpUnit(s) {
            const t = normTxt(s).replace(/[\s.,]/g, ''); if (!t) return null; const num = (t.match(/(\d)/) || [])[1];
            if (ST_UALIAS[t] && unitById(ST_UALIAS[t])) return unitById(ST_UALIAS[t]);
            if (/tys|jdts|zhdts|sex|tseh/.test(t) && num) return shtatTree.units.find(u => u.short === num + '-TYS') || null;
            return shtatTree.units.find(u => [u.short, u.key, u.name].some(x => { const k = normTxt(x).replace(/\s/g, ''); return k && (k === t || (t.length > 3 && (k.includes(t) || t.includes(k)))); })) || shtatTree.units.find(u => String(u.key).split('/').some(x => normTxt(x).replace(/\s/g, '') === t)) || null;
        }
        function stImpName(n) { n = String(n || '').trim().replace(/\s+/g, ' '); return n.split(' ').map(w => { if (w.length < 2 || w !== w.toUpperCase() || !/[A-ZА-ЯЎҚҒҲ]/.test(w)) return w; const l = w.toLowerCase(); return /^(o.g.li|qizi|ugli|kizi|o.g.l)$/.test(l) ? l : l.charAt(0).toUpperCase() + l.slice(1); }).join(' '); }
        function stImpKasb(l) { // «Temir yoʻl montyori (… (9 okolotka)» → kasb «Temir yoʻl montyori», izoh «9 okolotka»
            l = String(l || '').trim().replace(/\s+/g, ' '); const i = l.indexOf('('); if (i < 3) return { k: l, z: '' };
            const k = l.slice(0, i).trim(), inner = l.slice(i).replace(/^\(+|\)+$/g, ''), last = inner.match(/\(([^()]*)\)?$/);
            return { k: k.charAt(0).toUpperCase() + k.slice(1), z: (last ? last[1] : inner).replace(/[()]/g, '').trim() };
        }
        function stImpGroup(u, s) { const t = normTxt(s); if (!u || !t) return null; const G = shtatTree.groups.filter(g => g.u === u.id); return G.find(g => normTxt(g.name) === t) || G.find(g => { const k = normTxt(g.name); return k.includes(t) || t.includes(k); }) || G.find(g => { const a = normTxt(g.name).split(' ').filter(w => w.length > 4).slice(0, 2); return a.length && a.every(w => t.includes(w.slice(0, 6))); }) || null; }
        async function stImpFile(inp) {
            const f = inp.files && inp.files[0]; if (!f) return; const box = $id('stImpR'); box.innerHTML = '<div class="nd-tip">⏳ Oʻqilmoqda...</div>';
            try {
                const book = narReadBookBs(narBinStr(await f.arrayBuffer())); const out = [], bad = [];
                book.forEach(sh => { let H = null;
                    sh.rows.forEach((r, ri) => { const s = r.map(x => normTxt(String(x === null || x === undefined ? '' : x)));
                        if (!H) { const f1 = re => s.findIndex(x => re.test(x)); const h = { t: f1(/tabel|^tab/), n: f1(/f\.?\s*i\.?\s*sh|f\.?\s*i\.?\s*o|familiya|^xodim|^ism/), l: f1(/lavozim|kasb|profes|doljn|dolzhn/), u: f1(/bo.?linma|^t?sex|^tseh|podrazdel/), g: f1(/uchast|^bo.?lim/), r: f1(/razryad/), c: f1(/shtat/) };
                            if (h.t >= 0 && h.n >= 0 && h.l >= 0) { if (h.g === h.u) h.g = -1; H = h; } return; }
                        const t = cleanTabel(r[H.t]), n = stImpName(r[H.n]), ks = stImpKasb(r[H.l]), l = ks.k;
                        if (!t || !n || !l || !/\d/.test(t)) return; const us = H.u >= 0 ? String(r[H.u] || '') : '', u = stImpUnit(us);
                        if (!u) { bad.push(n + ' (' + t + '): boʻlinma topilmadi «' + us + '»'); return; }
                        out.push({ t: t, n: n, l: l, z: ks.z, u: u, g: H.g >= 0 ? stImpGroup(u, r[H.g]) : null, gs: H.g >= 0 ? String(r[H.g] || '').trim() : '', r: H.r >= 0 ? (parseInt(r[H.r], 10) || null) : null, c: H.c >= 0 ? (parseInt(r[H.c], 10) || 0) : 0 }); }); });
                if (!out.length) { box.innerHTML = '<div class="nd-tip">⚠️ Ishchilar topilmadi. Sarlavhada «Tabel», «F.I.Sh.», «Lavozim» ustunlari boʻlishi kerak.</div>' + (bad.length ? '<div class="nd-tip">' + bad.slice(0, 10).map(stEsc).join('<br>') + '</div>' : ''); return; }
                out.forEach(x => { const f = findXodimsByTabel(x.t)[0]; const p = f && f.item.posNo ? posByNo(f.item.posNo) : null; x.skip = !!(f && (f.item.roster || (p && !stIsW(p)))); x.ex = !!f; });
                const sk = out.filter(x => x.skip).length, ex = out.filter(x => x.ex && !x.skip).length, posN = new Set(out.filter(x => !x.skip).map(x => x.u.id + '|' + (x.g ? x.g.id : '') + '|' + normTxt(x.l))).size;
                const gNew = out.filter(x => x.gs && !x.g).length;
                ST_IMP = out;
                box.innerHTML = `<div class="st-inf"><div><small>Ishchi</small><b>${out.length}</b></div><div><small>Yangi</small><b>${out.length - ex - sk}</b></div><div><small>Yangilanadi</small><b>${ex}</b></div><div><small>ITR — tegilmaydi</small><b>${sk}</b></div><div><small>Kasb (lavozim)</small><b>${posN}</b></div></div>
                    ${gNew ? `<div class="nd-tip">ℹ️ ${gNew} ta ishchining uchastkasi shtatda topilmadi — yangi uchastka sifatida qoʻshiladi.</div>` : ''}${bad.length ? `<div class="nd-tip">⚠️ Olinmaydi (${bad.length}):<br>${bad.slice(0, 15).map(stEsc).join('<br>')}</div>` : ''}
                    <button class="action-btn" onclick="stImpDo()">✅ Strukturaga joylash</button>`;
            } catch (e) { box.innerHTML = '<div class="nd-tip">⚠️ ' + stEsc(e.message) + '</div>'; }
        }
        function stImpDo() {
            const out = ST_IMP; if (!out || (!stEdit() && !ST.seedRun)) return; let add = 0, upd = 0, np = 0; let no = shtatTree.pos.reduce((m, x) => Math.max(m, x.no), 0), mx = 1000; allXodims().forEach(z => { const i = +z.item.id; if (i > mx && i < 1e12) mx = i; });
            const cntBy = {};
            let sk = 0;
            out.forEach(x => {
                if (x.skip) { sk++; return; } // ITR (shtat roʻyxatidagilar) — tegilmaydi
                let g = x.g; if (!g && x.gs) { const gid = (() => { let i = 1; while (groupById(x.u.id + 'g' + i)) i++; return x.u.id + 'g' + i; })(); g = { id: gid, u: x.u.id, name: x.gs }; shtatTree.groups.push(g); out.forEach(y => { if (y.u === x.u && !y.g && normTxt(y.gs) === normTxt(x.gs)) y.g = g; }); }
                let p = shtatTree.pos.find(q => stIsW(q) && q.u === x.u.id && (q.g || null) === (g ? g.id : null) && normTxt(q.name) === normTxt(x.l)); // ITR lavozimlariga tegilmaydi
                if (!p) { p = { no: ++no, name: x.l, cnt: 0, cat: 'ishchi', u: x.u.id, g: g ? g.id : null }; shtatTree.pos.push(p); np++; p._imp = 1; }
                const k = p.no; cntBy[k] = cntBy[k] || { n: 0, c: 0 }; cntBy[k].n++; if (x.c) cntBy[k].c = Math.max(cntBy[k].c, x.c);
                const f = findXodimsByTabel(x.t); let r = f[0] || null;
                if (!r) { const key = x.u.key, it = { id: ++mx, name: x.n, inv: x.t, tabel: x.t, lavozim: x.l, bolim: '', birthDate: '', yil: null, seh: key, status: 'Soz', kirganSana: '', photo: null, workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [], spravka: null, oilaviy: '', izoh: '', oilaAzolari: '', history: [], gallery: [], phone: '', phones2: [], toifa: 'ishchi' };
                    (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(it); r = { item: it, su: key }; add++; } else upd++;
                if (x.r) r.item.razryad = x.r; if (x.z) r.item.stansiya = x.z; else delete r.item.stansiya; r.item.toifa = 'ishchi'; stPlace(r, p);
            });
            ST.idx = null; Object.keys(cntBy).forEach(k => { const p = posByNo(+k), z = cntBy[k]; if (!p || !stIsW(p)) return; const band = stAt(p.no).length; if (z.c) p.cnt = Math.max(z.c, p._imp ? 0 : p.cnt); else if (p._imp || p.cnt < band) p.cnt = Math.max(p.cnt, band); delete p._imp; });
            stTreeSave(); ST_IMP = null; mdlClose('stMdl'); stSaved('Ishchilar importi: ' + add + ' ta qoʻshildi, ' + upd + ' ta yangilandi, ' + np + ' ta yangi kasb' + (sk ? ', ' + sk + ' ta ITR ga tegilmadi' : ''));
        }

        // ---------- integratsiya ----------
        (function () {
            // Bosh menyuda «Shtatlar roʻyxati» tagida
            try { const c = document.querySelector('#main-card-list [data-search^="shtatlar"]') || document.querySelector('.btn-card[data-search^="shtatlar royxati"]'); if (c && !document.querySelector('.st-mcard')) c.insertAdjacentHTML('afterend', `<div class="btn-card st-mcard" data-search="struktura tashkiliy tuzilma sxema shtat xodimlar bosh orin vakant" onclick="openStruct()"><div class="btn-card-content"><span class="btn-icon mk-ic"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZmZmIi8+PGcgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIuNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTMyIDE5djhNMTIgMjdoNDBNMTIgMjd2OE0zMiAyN3Y4TTUyIDI3djhNNTIgNDN2Nk00NCA0OWgxNiIvPjwvZz48cmVjdCB4PSIyMiIgeT0iOCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjExIiByeD0iMi41IiBmaWxsPSIjMGVhNWU5Ii8+PHJlY3QgeD0iNCIgeT0iMzUiIHdpZHRoPSIxNiIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzdkZDNmYyIvPjxyZWN0IHg9IjI0IiB5PSIzNSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjN2RkM2ZjIi8+PHJlY3QgeD0iNDQiIHk9IjM1IiB3aWR0aD0iMTYiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiM3ZGQzZmMiLz48cmVjdCB4PSIzOCIgeT0iNDkiIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiByeD0iMiIgZmlsbD0iI2ZiOTIzYyIvPjxyZWN0IHg9IjUyIiB5PSI0OSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjgiIHJ4PSIyIiBmaWxsPSIjZmI5MjNjIi8+PGcgZmlsbD0iI2ZmZiI+PGNpcmNsZSBjeD0iMzIiIGN5PSIxMiIgcj0iMiIvPjxwYXRoIGQ9Ik0yOCAxOGMwLTMgOC0zIDggMHoiLz48L2c+PC9zdmc+" alt=""></span><span class="btn-text">Struktura (tashkiliy tuzilma)</span></div><span class="btn-arrow">›</span></div>`); } catch (e) {}
            try { if (typeof MENU_DEF !== 'undefined' && !MENU_DEF.some(d => d[0] === '2.2')) { const i = MENU_DEF.findIndex(d => d[0] === '2.1'); MENU_DEF.splice(i + 1, 0, ['2.2', c => c.classList.contains('st-mcard'), 1, 'xod']); } } catch (e) {}
            // «Ishchi xodimlar» guruhi ichida tartib: 1) Shtatlar 2) Ishchi xodimlar 3) Struktura (strukturani koʻrish huquqi boʻlmasa — chiqmaydi)
            if (typeof menuGrpOpen === 'function') menuGrpOpen = agmkExtend('menuGrpOpen', 'v3.14.2: Ishchi xodimlar guruhi tartibi', menuGrpOpen, o => function (g) {
                const r = o.apply(this, arguments);
                try { if (g === 'xod') { const box = document.querySelector('#screen-grp .card-list'); if (box) { const by = k => box.querySelector('[data-mn="' + k + '"]'); ['2.1', '2', '2.2', '2.3'].forEach(k => { const c = by(k); if (c) box.appendChild(c); }); /* 2.3 — «Mening ishchilarim» (3.19.2) */ const st = by('2.2'); if (st && !stView()) st.remove(); } } } catch (e) {}
                return r;
            });
            // Pasportdan orqaga — strukturaga qaytadi
            if (typeof itemPasportBack === 'function') itemPasportBack = agmkExtend('itemPasportBack', 'v3.14: strukturaga qaytish', itemPasportBack, o => function () { if (ST.fromSt) { ST.fromSt = false; openScreen('screen-st'); stRender(true); return; } return o.apply(this, arguments); });
            // Xodim maʼlumoti qayerda oʻzgarmasin — sxema yangilanadi
            if (typeof saveDB === 'function') saveDB = agmkExtend('saveDB', 'v3.14: struktura jonli', saveDB, o => function () { const r = o.apply(this, arguments); ST.idx = null; try { stLive(); } catch (e) {} return r; });
            // Shtat jadvali: oʻzgarish vaqti; tahrirlovchi telefonidan serverga — barcha telefonlarga
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(SHTAT_TREE_KEY)) KV_SYNC.keys.push(SHTAT_TREE_KEY); } catch (e) {}
            if (typeof saveShtatTree === 'function') saveShtatTree = agmkExtend('saveShtatTree', 'v3.14: shtat jadvali sinxronlanadi', saveShtatTree, o => function (t) { if (t && t !== shtatTree && !t.upd) t.upd = new Date().toISOString(); else if (!t && shtatTree && (typeof shtatUnlocked !== 'undefined' && shtatUnlocked)) shtatTree.upd = new Date().toISOString(); const r = o.apply(this, arguments); try { if (shtatTree && shtatTree.upd) KV_SYNC.dirty = true; } catch (e) {} try { stLive(); } catch (e) {} return r; });
            if (typeof kvMerge === 'function') kvMerge = agmkExtend('kvMerge', 'v3.14: shtat jadvali — oxirgi oʻzgarish', kvMerge, o => function (k, cur, inc) { if (k === SHTAT_TREE_KEY) return (inc && Array.isArray(inc.pos) && inc.pos.length && String(inc.upd || '') >= String((cur && cur.upd) || '')) ? inc : cur; return o.apply(this, arguments); });
            if (typeof syncLocal === 'function') syncLocal = agmkExtend('syncLocal', 'v3.14: shtat jadvalini faqat tahrirlovchi yuboradi', syncLocal, o => function () { const out = o.apply(this, arguments); try { return out.filter(x => !(x.kind === 'kv' && x.data && x.data.k === SHTAT_TREE_KEY && (!stEdit() && !(typeof shtatUnlocked !== 'undefined' && shtatUnlocked) || !(x.data.v && x.data.v.upd)))); } catch (e) { return out; } });
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.14: shtat jadvali kelganda', syncApply, o => function (rec) {
                const r = o.apply(this, arguments);
                try { if (rec && rec.kind === 'kv' && rec.data && rec.data.k === SHTAT_TREE_KEY) { const t = JSON.parse(localStorage.getItem(SHTAT_TREE_KEY) || 'null'); if (t && Array.isArray(t.pos) && t.pos.length) { shtatTree = t; deriveShtatList(); } stLive(); }
                    if (rec && rec.kind === 'xodim') { const f = findXodimsByTabel(cleanTabel((rec.data || {}).tabel)); if (f.length === 1) { const z = f[0], p = z.item.posNo ? posByNo(z.item.posNo) : null; if (p && unitById(p.u).key !== z.su) { const key = unitById(p.u).key; sectionItemsDB.xodim[z.su] = (sectionItemsDB.xodim[z.su] || []).filter(x => x !== z.item); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(z.item); z.item.seh = key; } } stLive(); } } catch (e) {}
                return r;
            });
            const st = document.createElement('style');
            st.textContent = `.st-vp{position:absolute;inset:0;overflow:hidden;touch-action:none;background:#e2e8f0;background-image:radial-gradient(#cbd5e1 1px,transparent 1px);background-size:22px 22px;cursor:grab;user-select:none;-webkit-user-select:none}
            .st-cv{position:absolute;left:0;top:0;transform-origin:0 0;padding:20px;width:max-content;color:#0f172a;font-family:system-ui,'Segoe UI',Roboto,sans-serif}.st-cv.anim{transition:transform .35s ease}
            .st-title{font:800 26px/1.25 system-ui;color:#0f172a;margin:0 0 14px}.st-title small{display:block;font:600 15px system-ui;color:#334155;margin-top:4px}.st-title .r{color:#dc2626}
            .st-org{position:relative;display:flex;flex-direction:column;align-items:center;padding:0 60px}.st-title{text-align:center;position:relative;z-index:1}
            .st-svg{position:absolute;left:0;top:0;pointer-events:none;z-index:0;overflow:visible}.st-svg .ln{fill:none;stroke:#1e293b;stroke-width:2.6;stroke-linejoin:round}.st-svg .ln.b{stroke-width:3.2}.st-svg .ln.wk{stroke:#b45309;stroke-dasharray:7 4}
            .st-box{position:relative;z-index:1}
            .st-rootw{display:flex;justify-content:center;position:relative}
            .st-sec{align-self:flex-start;font:800 15px system-ui;letter-spacing:.06em;color:#0369a1;margin:30px 0 0 4px;position:relative;z-index:1}.st-sec.prod{color:#c2410c;margin-top:60px}
            .st-row{display:flex;gap:28px;align-items:flex-start;justify-content:center;position:relative;padding-top:44px}
            .st-col,.st-n{display:flex;flex-direction:column;align-items:center}.st-n.vs{align-items:flex-start}
            .st-kids{margin:0 0 0 36px;display:flex;flex-direction:column;gap:12px;padding-top:12px}
            .st-hk{display:flex;align-items:flex-start;justify-content:center;gap:18px;margin-top:44px}
            .st-g2{display:grid;grid-template-columns:repeat(2,max-content);column-gap:34px;row-gap:14px;margin-top:34px;padding-left:22px}
            .st-box.wrk{width:460px}.st-box.wrk .st-bh{background:#fde68a}.st-more{margin:3px 0 2px 28px;font-size:12px;font-weight:700;color:#1d4ed8;cursor:pointer}.st-chs.lead+.st-more,.st-box>.st-more{margin-left:8px}
            .st-chs.cl{display:none}.st-chs.cl.show{display:flex}
            .st-box{width:300px;background:#fff;border:2px solid #0f172a;border-radius:8px;box-shadow:0 2px 6px rgba(15,23,42,.18);overflow:hidden}
            .st-box.apr .st-bh,.st-box.lead .st-bh{background:#bae6fd}.st-box.prod .st-bh{background:#fdba74}.st-box.root{width:380px;border-width:3px}.st-box.root .st-bh b{font-size:20px}
            .st-bh{padding:8px 10px;border-bottom:1px solid #0f172a;cursor:pointer;position:relative}.st-tot{position:absolute;right:10px;bottom:8px;padding:3px 9px;border-radius:999px;font-size:13px;font-weight:700;background:#dcfce7;color:#166534;border:1px solid #86efac}.st-tot.vac{background:#fef3c7;color:#92400e;border-color:#fcd34d}.st-bh b{display:block;font-size:15px;line-height:1.25}.st-bh small{display:block;font-size:12px;color:#334155;margin-top:2px}
            .st-cnt{display:inline-block;margin-top:4px;font-size:12px;font-weight:700;color:#166534;background:#dcfce7;border-radius:10px;padding:1px 8px}.st-cnt.vac{color:#991b1b;background:#fee2e2}
            .st-pos{border-top:1px solid #e2e8f0;padding:5px 8px}.st-pos:first-of-type{border-top:0}.st-ph{display:flex;gap:6px;align-items:flex-start;font-size:12.5px;line-height:1.25;cursor:pointer}.st-ph i{font-style:normal;color:#64748b;min-width:22px;font-size:11px;padding-top:1px}.st-ph span{flex:1;font-weight:600}
            .st-ph em{font-style:normal;font-size:11px;font-weight:700;color:#166534}.st-ph em.vac{color:#dc2626}.st-ph em.over{color:#c2410c}
            .st-chs{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 2px 28px}.st-ch{background:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:2px 6px;font-size:12px;line-height:1.2;cursor:pointer;max-width:250px}
            .st-ch b{font-weight:600;color:#1e3a8a}.st-ch small{display:block;font-size:10.5px;color:#475569}.st-ch.vac{background:#fff1f2;border:1.5px dashed #ef4444}.st-ch.vac b{color:#dc2626}.st-ch.over{background:#ffedd5;border-color:#fb923c}
            .st-chs.lead{margin:6px 8px 8px}.st-no{font-style:normal;font-weight:600;font-size:11px;color:#475569}.st-empty{padding:6px 10px;font-size:12px;color:#94a3b8}
            .st-cv.hl-on .st-ch,.st-cv.hl-on .st-ph,.st-cv.hl-on .st-bh{opacity:.35}.st-cv.hl-on .hl{opacity:1!important;outline:3px solid #f59e0b;outline-offset:1px}.st-cv .flash{animation:stFl 1s ease 2}@keyframes stFl{50%{box-shadow:0 0 0 8px rgba(245,158,11,.75)}}
            .st-leg{margin:26px 0 0 6px;font-size:13px;color:#334155;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.st-leg span{display:inline-block;width:22px;height:13px;border:1px solid #0f172a;border-radius:3px}.st-leg .a{background:#bae6fd}.st-leg .p{background:#fdba74}.st-leg .w{background:#fde68a}.st-leg .v{background:#fff1f2;border:1.5px dashed #ef4444}.st-leg .o{background:#ffedd5;border-color:#fb923c}
            .st-tools{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:6px;align-items:center;z-index:5}.st-tools button{width:44px;height:44px;border-radius:50%;border:0;background:#0f172a;color:#fff;font-size:21px;box-shadow:0 3px 10px rgba(0,0,0,.35)}.st-tools span{font-size:11px;color:#0f172a;background:#fff;border-radius:8px;padding:1px 5px}
            .st-jmp{display:flex;gap:6px;overflow-x:auto;margin-top:7px;padding-bottom:2px}.st-jmp i{font-style:normal;white-space:nowrap;font-size:12.5px;padding:4px 10px;border-radius:14px;background:rgba(15,23,42,.75);border:1px solid #475569;color:#e2e8f0;cursor:pointer}
            .st-hint{font-size:11.5px;color:#cbd5e1;margin-top:5px}
            .st-res{position:absolute;left:8px;right:8px;top:6px;max-height:55%;overflow:auto;background:#0f172a;border:1px solid #334155;border-radius:12px;z-index:6;box-shadow:0 6px 20px rgba(0,0,0,.45)}
            .st-rh{display:flex;justify-content:space-between;padding:7px 11px;font-size:12px;color:#94a3b8;border-bottom:1px solid #1e293b}.st-rh span{cursor:pointer;color:#fff;padding:0 4px}
            .st-ri{padding:8px 11px;border-bottom:1px solid #1e293b;font-size:13.5px;color:#e2e8f0;cursor:pointer}.st-ri small{display:block;color:#94a3b8;font-size:11.5px}.st-ri em{font-style:normal;font-size:11.5px;color:#86efac}.st-ri em.vac{color:#fca5a5}
            .st-pl{max-height:46vh;overflow:auto;margin-top:6px;border-radius:10px;background:rgba(2,6,23,.5)}.st-chk{display:block;font-size:12.5px;color:#cbd5e1;margin:6px 2px}
            .st-inf{display:flex;gap:8px;margin:6px 0}.st-inf div{flex:1;background:rgba(30,41,59,.9);border-radius:10px;padding:6px 8px}.st-inf small{display:block;color:#94a3b8;font-size:11px}.st-inf b{color:#fff}.st-inf b.r{color:#fca5a5}
            .st-pth{background:rgba(30,41,59,.8);border-radius:10px;padding:8px 10px;margin:6px 0;color:#e2e8f0;font-size:13.5px}.st-pth small{color:#94a3b8}
            .st-ok,.st-nf{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.st-nf .search-box,.st-ok .search-box{flex:1 1 140px;min-width:0}.st-nf .action-btn{flex:1 1 100%}.st-lb{display:flex;gap:6px;align-items:center;color:#cbd5e1;font-size:13px;flex:1 1 100%}
            .st-btns{flex-wrap:wrap}.st-btns button{flex:1 1 30%}`;
            document.head.appendChild(st);
        })();

