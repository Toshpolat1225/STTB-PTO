        // =====================================================================
        // v2.4 — Oylik to'plam: ekran qismi (bir necha fayl, turini aniqlash, natija)
        // =====================================================================
        var HPK = { pend: null };
        async function hpReadBook(file) {
            const n = String(file.name || '').toLowerCase();
            if (/\.(xlsx|xls|xlsm|ods|csv)$/.test(n) || /sheet|excel/.test(file.type || '')) {
                if (typeof XLSX === 'undefined') throw new Error('Excel moduli yuklanmagan');
                const u8 = new Uint8Array(await file.arrayBuffer()); let bs = ''; for (let i = 0; i < u8.length; i += 32768) bs += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
                const wb = XLSX.read(bs, { type: 'binary', cellDates: false });
                const ent = t => t.indexOf('&') < 0 ? t : t.replace(/&#(\d+);/g, (m, k) => String.fromCodePoint(+k)).replace(/&#x([0-9a-f]+);/gi, (m, k) => String.fromCodePoint(parseInt(k, 16))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                return wb.SheetNames.map(sn => ({ s: sn, rows: XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: '' }).map(r => r.map(c => typeof c === 'string' ? ent(c) : c)) }));
            }
            const r = await hsReadAny(file); if (!r.rows) return [];
            return [{ s: r.kind.toUpperCase(), rows: r.rows }];
        }
        function hpIsPkgType(t) { return ['spr', 'dv', 'lom', 'nar'].indexOf(t) >= 0; }
        async function hpStart(cat, files) {
            files = Array.from(files || []).filter(Boolean); if (!files.length) return;
            showToast('⏳ ' + files.length + ' ta fayl oʻqilmoqda...');
            const L = [];
            for (const f of files) {
                try { const bk = await hpReadBook(f); bk.forEach(x => L.push({ file: f, f: f.name, s: x.s, rows: x.rows, type: hpClassify(x.rows) })); }
                catch (e) { L.push({ file: f, f: f.name, s: '', rows: [], type: '', err: agmkErrUz(e) }); }
            }
            HPK.pend = { cat: cat, files: files, sheets: L };
            hpDlg();
        }
        function hpGuessMonth(P) {
            const cnt = {}; P.sheets.forEach(x => { if (x.type === 'spr') { try { hpParseSpr(x.rows, {}).forEach(b => { if (b.month) cnt[b.month] = (cnt[b.month] || 0) + b.items.filter(i => i.fakt !== null).length; }); } catch (e) {} } if (x.type === 'f30') { const d = hpParseF30(x.rows, {}); if (d && d.month) cnt[d.month] = (cnt[d.month] || 0) + 1e6; } });
            const k = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0]; return k || '';
        }
        function hpDlg() {
            const P = HPK.pend, E = escapeHtml, M = hpGuessMonth(P); P.month = P.month || M;
            const st = hsF30Of(P.cat), inPkg = P.sheets.filter(x => x.type === 'f30');
            const def = inPkg.length ? 'pkg:' + P.sheets.indexOf(inPkg[0]) : ((st.find(x => x.month === P.month) || {}).id ? 'st:' + st.find(x => x.month === P.month).id : '');
            P.f30sel = P.f30sel !== undefined ? P.f30sel : def;
            const opts = Object.keys(HP_TYPES).map(k => [k, HP_TYPES[k]]);
            const rows = P.sheets.map((x, i) => `<div class="hp-sh${x.type ? '' : ' off'}"><div><b>${E(x.f)}</b>${x.s ? ' › ' + E(x.s) : ''}${x.err ? `<br><small class="hs-r">⚠️ ${E(x.err)}</small>` : ''}</div><select onchange="HPK.pend.sheets[${i}].type=this.value; HPK.pend.f30sel=undefined; hpDlg()">${opts.map(o => `<option value="${o[0]}"${o[0] === x.type ? ' selected' : ''}>${E(o[1])}</option>`).join('')}</select></div>`).join('');
            const f30opt = [['', '— Forma-30 siz (faqat ichki hisob va oʻzaro moslik) —']].concat(P.sheets.map((x, i) => x.type === 'f30' ? ['pkg:' + i, 'Toʻplamdagi: ' + x.f + ' › ' + x.s] : null).filter(Boolean)).concat(st.map(x => ['st:' + x.id, 'Boʻlimda saqlangan: ' + hsMon(x.month) + ' · ' + x.rows + ' qator · ' + x.file]));
            const known = P.sheets.filter(x => x.type).length;
            mdl('hpModal', `<div class="px-h"><b>📦 Oylik toʻplamni tekshirish</b><button class="mini-btn" onclick="mdlClose('hpModal')">✕</button></div>
                <div class="nd-tip">Ilova har bir varaqni oʻzi aniqladi (${known} / ${P.sheets.length}). Notoʻgʻri boʻlsa — turini oʻzgartiring. Tekshiruv zanjiri: <b>defekt vedomost → talabnoma → Forma-30 → spravka-raschet → norma → metallolom akti → naryad</b>. Hisob formula bilan, telefonning oʻzida; fayllar internetga yuborilmaydi.</div>
                <div class="hp-list">${rows}</div>
                <div class="nd-2"><div class="nd-f"><label>OY (YYYY-MM)</label><input id="hp_month" value="${E(P.month || '')}" placeholder="2026-08"></div><div class="nd-f"><label>XODIM (ixtiyoriy)</label><input id="hp_who" value="${E(P.who || '')}" placeholder="F.I.Sh."></div></div>
                <div class="nd-f"><label>SOLISHTIRISH UCHUN FORMA-30</label><select id="hp_f30">${f30opt.map(o => `<option value="${E(o[0])}"${o[0] === P.f30sel ? ' selected' : ''}>${E(o[1])}</option>`).join('')}</select></div>
                <button class="action-btn" onclick="hpRun()">✅ Tekshirishni boshlash</button>`, true);
        }
        async function hpF30FromStored(rec) {
            const b = rec && rec.fref ? await mediaGetBlob(rec.fref) : null;
            if (!b) return null;
            const f = new File([b], rec.file || 'forma30.xlsx', { type: b.type || '' });
            const bk = await hpReadBook(f); for (const x of bk) { if (hpClassify(x.rows) === 'f30') { const d = hpParseF30(x.rows, { f: rec.file, s: x.s }); if (d) { if (!d.month) d.month = rec.month; return d; } } }
            return null;
        }
        async function hpRun() {
            const P = HPK.pend; if (!P) return;
            P.month = (($id('hp_month') || {}).value || '').trim(); P.who = (($id('hp_who') || {}).value || '').trim(); P.f30sel = ($id('hp_f30') || {}).value || '';
            if (P.month && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(P.month)) { alert('Oy notoʻgʻri: masalan 2026-08'); return; }
            if (!P.sheets.some(x => hpIsPkgType(x.type))) { alert('Toʻplamda spravka, defekt vedomost, metallolom akti yoki naryad topilmadi. Varaq turlarini tanlang.'); return; }
            mdlClose('hpModal'); showToast('⏳ Tekshirilmoqda...');
            let f30 = null;
            try {
                if (/^pkg:/.test(P.f30sel)) { const x = P.sheets[+P.f30sel.slice(4)]; f30 = hpParseF30(x.rows, { f: x.f, s: x.s }); }
                else if (/^st:/.test(P.f30sel)) { const rec = hsF30Of(P.cat).find(x => x.id === P.f30sel.slice(3)); f30 = await hpF30FromStored(rec); if (!f30) { alert('⚠️ Saqlangan Forma-30 faylini oʻqib boʻlmadi. Uni toʻplamga qoʻshib yuklang.'); return; } }
            } catch (e) { alert('⚠️ Forma-30: ' + agmkErrUz(e)); return; }
            if (f30 && P.month && f30.month && f30.month !== P.month && !(await uiConfirm('Forma-30 davri (' + hsMon(f30.month) + ') tanlangan oydan (' + hsMon(P.month) + ') farq qiladi. Baribir davom etilsinmi?'))) return;
            const sheets = P.sheets.filter(x => hpIsPkgType(x.type) || x.type === 'norma').map(x => { let data = null; try { data = hpParseSheet(x.rows, x.type, { f: x.f, s: x.s }); } catch (e) { console.error(e); } return { f: x.f, s: x.s, type: x.type, data: data }; });
            let R; try { R = hpCheck({ sheets: sheets, f30: f30, month: P.month || (f30 && f30.month) || '' }); } catch (e) { console.error(e); alert('⚠️ Tekshiruvda xato: ' + agmkErrUz(e)); return; }
            const F = R.findings;
            const frefs = [];
            for (const f of P.files) { const ref = uid('pkgf_'); try { await mediaSave(ref, f, { id: ref, at: new Date().toISOString(), name: f.name, mime: f.type, size: f.size }); mediaKeep(ref); frefs.push({ ref: ref, name: f.name }); } catch (e) {} }
            const id = uid('chk_'), dref = uid('chkd_');
            const norms = sheets.filter(x => x.type === 'norma' && x.data && x.data.items.length).map(x => ({ f: x.f, s: x.s, title: x.data.title, year: x.data.year, items: x.data.items.map(i => ({ grp: i.grp, name: i.name, unit: i.unit, qty: i.qty })) }));
            await hsJsonSave(dref, { kind: 'pkg', findings: F, stats: R.stats, files: frefs, norms: norms, who: P.who, month: P.month, f30: f30 ? { month: f30.month, n: f30.items.length, src: f30.src } : null, ann: [] });
            const red = F.filter(x => x.lvl === 'red').length, blue = F.filter(x => x.lvl === 'blue').length, money = F.filter(x => x.lvl === 'red' && x.diff).reduce((a, x) => a + Math.abs(x.diff), 0);
            const f30r = /^st:/.test(P.f30sel) ? hsF30Of(P.cat).find(x => x.id === P.f30sel.slice(3)) : null;
            const rec = { id: id, cat: P.cat, at: new Date().toISOString(), by: authorStr(), byT: meTabel(), file: 'Toʻplam: ' + P.files.length + ' ta fayl' + (P.who ? ' · ' + P.who : ''), files: P.files.map(f => f.name), who: P.who, kind: 'pkg', f30: f30 ? { id: f30r ? f30r.id : 'pkg', month: f30.month || P.month } : null, n: R.stats.items, sum: Math.round(money), red: red, blue: blue, status: 'draft', fref: frefs[0] ? frefs[0].ref : '', dref: dref, log: [] };
            hsLog(rec, 'Toʻplam tekshirildi (' + P.files.length + ' fayl, ' + R.stats.blocks + ' spravka bloki): ' + red + ' ta xato, ' + blue + ' ta tekshirish kerak');
            const all = hsChecks(); all.unshift(rec); kvSet(HS_CHK_KEY, all.slice(0, 300));
            try { if (typeof aiLog === 'function') aiLog('Oylik toʻplam tekshirildi: ' + rec.file, id); } catch (e) {}
            try { if (R.dvp && R.dvp.length && hsCan()) dvpApplyRows(rec, dvpRows(R.dvp).filter(r => r.ok && r.v), true); } catch (e) { console.error(e); } // defekt vedomost → pasport DR/KR (avtomatik)
            HPK.pend = null; HS.chk = id; HS.cat = P.cat; HS.tab = 'hisob'; hsRender();
            showToast(red ? '❌ ' + red + ' ta xato topildi' : '✅ Jiddiy xato topilmadi' + (blue ? ' · ' + blue + ' ta tekshirish kerak' : ''));
        }
        // Natija ekrani (to'plam uchun)
        async function hpChkLoad(x, d, box) {
            HS.data = d; const E = escapeHtml, can = hsCan() && x.status !== 'done';
            const st = d.stats || {};
            let h = `<div class="nd-tip">Tekshirildi: ${st.blocks || 0} ta spravka bloki (${st.fakt || 0} ta «Факт» qatori)${st.other ? ', boshqa oy bloklari: ' + st.other : ''} · defekt vedomost: ${st.dv || 0} vagon · metallolom akti: ${st.lom || 0} · naryad: ${st.nar || 0}${d.f30 ? ' · Forma-30: ' + (d.f30.n || 0) + ' qator (' + E(hsMon(d.f30.month)) + ')' : ' · Forma-30 siz'}.</div>`;
            if (!d.findings.filter(f => f.lvl !== 'info').length) h += '<div class="hs-ok">✅ Xato topilmadi. Hujjatlar oʻzaro va Forma-30 bilan mos.</div>';
            const secs = []; d.findings.forEach(f => { let s = secs.find(z => z.k === f.sec); if (!s) { s = { k: f.sec, L: [] }; secs.push(s); } s.L.push(f); });
            h += secs.map(s => `<div class="hp-sec"><div class="hp-sech">${E(s.k || '')} <small>${s.L.filter(f => f.lvl === 'red').length ? '❌ ' + s.L.filter(f => f.lvl === 'red').length : ''} ${s.L.filter(f => f.lvl === 'blue').length ? '🔷 ' + s.L.filter(f => f.lvl === 'blue').length : ''}</small></div>` + s.L.map(f => `<div class="hs-f ${f.lvl === 'info' ? 'blue hp-info' : f.lvl}${f.st ? ' st-' + f.st : ''}"><div class="hs-fh"><b>${f.lvl === 'red' ? '❌' : f.lvl === 'blue' ? '🔷' : 'ℹ️'} ${E(f.name || '')}</b>${f.nom ? `<small>№ ${E(f.nom)}</small>` : ''}</div><div>${E(f.msg)}</div>${(f.src || []).length ? `<details class="hp-src"><summary>📍 Manba (${f.src.length})</summary>${f.src.slice(0, 20).map(z => `<div>${E(hpSrc(z))}</div>`).join('')}</details>` : ''}
                ${f.lvl !== 'info' ? (can ? `<div class="hs-fb"><button class="${f.st === 'ok' ? 'on' : ''}" onclick="hsMark('${f.id}','ok')">✅ Tasdiqlayman (xato)</button><button class="${f.st === 'no' ? 'on' : ''}" onclick="hsMark('${f.id}','no')">✖ Xato emas</button></div>` : (f.st ? `<small>${f.st === 'ok' ? '✅ Tasdiqlangan' : '✖ Xato emas deb belgilangan'}${f.by ? ' — ' + E(f.by) : ''}</small>` : '')) : ''}</div>`).join('') + '</div>').join('');
            if (d.norms && d.norms.length && hsCan()) h += `<div class="hs-box"><div class="hs-h">📐 Toʻplamdagi normalar (${d.norms.length} varaq)</div><div class="nd-tip">Normalarni «Normativ hujjatlar» bazasiga saqlasangiz, AI va keyingi tekshiruvlar ulardan foydalanadi.</div><button class="action-btn" onclick="hpSaveNorms('${x.id}')">📚 Normativ bazaga saqlash</button></div>`;
            box.innerHTML = h;
        }
        async function hpSaveNorms(id) {
            if (!hsCan()) return; const r = hsRec(id), d = r ? await hsJsonGet(r.dref) : null; if (!d || !d.norms) return;
            const docs = ndDocs(); let n = 0;
            d.norms.forEach(N => {
                const title = (N.title ? N.title.replace(/[“”"«»]?\s*утверждаю\s*[“”"«»]?/i, '').replace(/\s+/g, ' ').trim().slice(0, 160) : 'Нормы расхода') + ' [' + N.f + ' › ' + N.s + ']';
                if (docs.some(x => x.title === title)) return;
                let g = ''; const punkts = [];
                N.items.forEach((it, i) => { if (it.grp && it.grp !== g) { g = it.grp; } punkts.push({ n: String(i + 1), t: (it.grp ? it.grp + ': ' : '') + it.name + ' — ' + hpF(it.qty, 3) + ' ' + (it.unit || '') + ' (1 birlik uchun norma)' }); });
                docs.push({ id: 'd' + Date.now().toString(36) + n, title: title, code: 'Norma' + (N.year ? ' ' + N.year : ''), cat: 'vagon', at: new Date().toISOString(), by: authorStr(), src: 'Oylik toʻplam: ' + N.f, punkts: punkts }); n++;
            });
            if (!n) { showToast('ℹ️ Bu normalar bazada allaqachon bor'); return; }
            if (ndSet(ND_DOCS_KEY, docs)) { const all = hsChecks(), rr = all.find(z => z.id === id); if (rr) { hsLog(rr, n + ' ta norma varagʻi normativ bazaga saqlandi'); kvSet(HS_CHK_KEY, all); } showToast('📚 ' + n + ' ta norma varagʻi bazaga qoʻshildi'); }
        }
        async function hpXlsx(r, d) {
            const rows = [['№', 'Daraja', 'Boʻlim', 'Nomi', 'Nomenklatura №', 'Izoh', 'Summa taʼsiri (soʻm)', 'Manba', 'Holat']].concat(d.findings.map((f, i) => [i + 1, f.lvl === 'red' ? 'Xato' : f.lvl === 'blue' ? 'Tekshirish kerak' : 'Maʼlumot', f.sec || '', f.name || '', f.nom || '', f.msg, f.diff ? Math.round(f.diff) : '', (f.src || []).map(hpSrc).join('; '), f.st === 'ok' ? 'Tasdiqlangan' : f.st === 'no' ? 'Xato emas' : '']));
            rows.push([]); rows.push(['Fayllar:', (r.files || []).join('; ')]); rows.push(['Tekshirdi:', r.by + ' · ' + fmtDT(r.at)]);
            xlsxDl(rows, 'Toplam tekshiruvi ' + (r.who || '') + ' ' + (d.month || ''));
        }
        (function () {
            if (typeof hsChkLoad === 'function') { hsChkLoad = agmkExtend('hsChkLoad', 'hsChkLoad', hsChkLoad, o => async function () { const x = hsRec(HS.chk), box = $id('hsFind'); if (x && box && x.kind === 'pkg') { const d = await hsJsonGet(x.dref); if (!d) { box.innerHTML = '⚠️ Maʼlumot topilmadi'; return; } return hpChkLoad(x, d, box); } return o.apply(this, arguments); }); }
            if (typeof hsXlsx === 'function') { hsXlsx = agmkExtend('hsXlsx', 'hsXlsx', hsXlsx, o => async function (id) { const r = hsRec(id); if (r && r.kind === 'pkg') { const d = await hsJsonGet(r.dref); if (d) return hpXlsx(r, d); return; } return o.apply(this, arguments); }); }
            if (typeof hsChkHtml === 'function') { hsChkHtml = agmkExtend('hsChkHtml', 'hsChkHtml', hsChkHtml, o => function () { let h = o.apply(this, arguments); const x = hsRec(HS.chk); if (x && x.kind === 'pkg') { h = h.replace(/<button class="action-btn" onclick="hsPdfOpen\([^)]*\)">[^<]*<\/button>/, '').replace('<small>Qatorlar</small>', '<small>Spravka qatorlari</small>').replace('<small>Summa</small>', '<small>Xato summasi (soʻm)</small>'); } return h; }); }
            // Bitta fayl yoki bir nechta: to'plam turidagi hujjat bo'lsa — yangi tekshiruv
            if (typeof hsCheckStart === 'function') { hsCheckStart = agmkExtend('hsCheckStart', 'Bitta fayl yoki bir nechta: toʼplam turidagi hujjat boʼlsa — yangi tekshiruv', hsCheckStart, o => async function (cat, input) {
                const files = Array.from((input && input.files) || []); if (!files.length) return;
                if (files.length > 1) { input.value = ''; return hpStart(cat, files); }
                const f = files[0];
                if (/\.(xlsx|xls|xlsm|ods)$/i.test(f.name)) { try { const bk = await hpReadBook(f); if (bk.some(x => hpIsPkgType(hpClassify(x.rows)))) { input.value = ''; return hpStart(cat, files); } } catch (e) {} }
                return o.call(this, cat, { files: files, set value(v) { try { input.value = v; } catch (e) {} } });
            }); }
            if (typeof hsRender === 'function') { hsRender = agmkExtend('hsRender', 'hsRender', hsRender, o => function () { const r = o.apply(this, arguments); try {
                if (HS.tab === 'hisob' && HS.cat && !HS.chk) { const box = [...document.querySelectorAll('#screen-hisob .hs-box')].find(b => /Hisobotni tekshirish/.test(b.textContent));
                    if (box && !$id('hpBox')) { box.insertAdjacentHTML('beforebegin', `<div class="hs-box hp-box" id="hpBox"><div class="hs-h">📦 Oylik toʻplamni tekshirish (bir nechta fayl birga)</div><div class="nd-tip">Bir xodimning bir oylik barcha fayllarini <b>birga belgilab</b> tanlang: spravka-raschet (Лимитка), defekt vedomostlar, metallolom akti, naryadlar, Forma-30 (boʻlimda yuklanmagan boʻlsa). Ilova har birini oʻzi taniydi va zanjir boʻyicha tekshiradi.</div><label class="alb-btn cam">📂 Fayllarni tanlash (bir nechta)<input type="file" multiple accept=".xls,.xlsx,.xlsm,.ods,.pdf,.docx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onchange="const f=[...this.files]; this.value=''; hpStart('${HS.cat}', f)"></label></div>`);
                        const inp = box.querySelector('input[type=file]'); if (inp) inp.setAttribute('multiple', ''); }
                } } catch (e) { console.error(e); } return r; }); }
        })();

        // ---------- Umumiy (bitta jadval) tekshiruvi: sarlavhani aniqroq topish, shablonni eslab qolish ----------
        function hpHdrSig(r) { return (r || []).map(c => hsNorm(c)).filter(Boolean).join('|').slice(0, 300); }
        (function () {
            if (typeof hsDetect === 'function') { hsDetect = agmkExtend('hsDetect', 'hsDetect', hsDetect, o => function (rows) {
                // «УТВЕРЖДАЮ», «СПРАВКА» kabi bloklar ostidagi haqiqiy sarlavhani qidirish: eng koʻp ustun nomi mos kelgan qator
                const b = o.apply(this, arguments);
                if (b.row < 0 || b.score < 3) { let best = b; for (let i = 0; i < Math.min(rows.length, 80); i++) { const r = rows[i] || [], map = {}; let sc = 0; r.forEach((c, j) => { const t = hsNorm(c); if (!t || t.length > 60) return; Object.keys(HS_COLS).forEach(k => { if (map[k] === undefined && HS_COLS[k].some(re => re.test(t))) { map[k] = j; sc++; } }); }); if ((map.name !== undefined || map.nom !== undefined) && (map.qty !== undefined || map.sum !== undefined) && sc > best.score) best = { row: i, score: sc, map: map }; } return best; }
                return b; }); }
            if (typeof hsMapDlg === 'function') { hsMapDlg = agmkExtend('hsMapDlg', 'hsMapDlg', hsMapDlg, o => function () {
                const P = HS.pend; if (!P) return;
                const det = P.det, sig = det.row >= 0 ? hpHdrSig(P.r.rows[det.row]) : '', tpl = sig ? ((hsSet().tpl || {})[sig]) : null;
                if (tpl && !P.noAuto) { P.det = { row: det.row, score: 99, map: Object.assign({}, tpl.map) }; o.apply(this, arguments); setTimeout(() => { showToast('📐 Saqlangan shablon qoʻllandi (oldin tasdiqlangan ustunlar)'); hsRun(); }, 60); return; }
                o.apply(this, arguments);
                try { const m = $id('hsMapModal'); const tip = m && m.querySelector('.nd-tip');
                    if (tip) tip.insertAdjacentHTML('beforebegin', `<div class="hp-help">ℹ️ <b>Bu oyna nima uchun?</b> Ilova qaysi ustunda nomi, miqdori, narxi va summasi turganini bilishi kerak — shunda <i>miqdor × narx = summa</i> ni hisoblaydi va Forma-30 bilan nomenklatura boʻyicha solishtiradi. Sarlavha qatori — ustun nomlari (Наименование, Кол-во, Сумма…) yozilgan qator. Pastdagi jadvalda <b>sarlavha qatorini bosing</b> — ustunlar qayta aniqlanadi. Bir marta tasdiqlangan shakl eslab qolinadi.</div>`);
                    const pv = m && m.querySelector('.hs-prev'); if (pv) { const rows = P.r.rows, E = escapeHtml; pv.innerHTML = '<table>' + rows.slice(0, 40).map((r, i) => `<tr class="${i === P.det.row ? 'hp-hdr' : ''}" onclick="hpSetHdr(${i})"><td class="hp-rn">${i + 1}</td>${(r || []).slice(0, 12).map(c => `<td>${E(String(c).slice(0, 24))}</td>`).join('')}</tr>`).join('') + '</table>'; }
                } catch (e) {}
            }); }
            if (typeof hsRun === 'function') { hsRun = agmkExtend('hsRun', 'hsRun', hsRun, o => async function () {
                try { const P = HS.pend; if (P) { const map = {}; Object.keys(HS_COLS).forEach(k => { const e = $id('hsm_' + k); if (e && e.value !== '') map[k] = +e.value; }); const hdr = Math.max(0, (+($id('hsm_hdr') || {}).value || 1) - 1); const sig = hpHdrSig(P.r.rows[hdr]); if (sig && (map.qty !== undefined || map.sum !== undefined)) { const s = hsSet(); s.tpl = s.tpl || {}; s.tpl[sig] = { map: map, at: new Date().toISOString(), by: authorStr() }; const k = Object.keys(s.tpl); if (k.length > 60) delete s.tpl[k[0]]; kvSet(HS_SET_KEY, s); } } } catch (e) {}
                return o.apply(this, arguments);
            }); }
        })();
        function hpSetHdr(i) {
            const P = HS.pend; if (!P) return; const r = P.r.rows[i] || [], map = {};
            r.forEach((c, j) => { const t = hsNorm(c); if (!t) return; Object.keys(HS_COLS).forEach(k => { if (map[k] === undefined && HS_COLS[k].some(re => re.test(t))) map[k] = j; }); });
            P.det = { row: i, score: Object.keys(map).length, map: map }; P.noAuto = true; hsMapDlg();
        }

