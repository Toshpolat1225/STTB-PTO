        // =====================================================================
        // v2.0 — «📊 DALOLATNOMA VA HISOBOTLAR» bo'limi
        //  A) Dalolatnomalar: kolodka / g'ildirak juftligi / boshqa ehtiyot qismlar
        //  B) Hisobotlar: vagonlar / avtopark / teplovozlar — har birining oylik Forma-30 (norma shabloni),
        //     tarixi (kim, qachon), hisobotni Forma-30 bilan solishtirish, PDF'da belgilash, tahrirlash, jurnal.
        // HISOB-KITOB FORMULA BILAN (aniq); AI faqat o'qish/tushuntirishda yordamchi. Oxirgi so'z — xodimda.
        // Fayllar va summalar qurilmadan tashqariga chiqmaydi.
        // =====================================================================
        try { if (typeof ROLE_DEF !== 'undefined' && !ROLE_DEF.some(x => x[0] === 'hisob')) ROLE_DEF.push(['hisob', '📊', 'Hisobotlar va dalolatnomalar (tekshiruvchi)', "Forma-30 ni yangilaydi, hisobotlarni tekshiradi, tekshiruv PDF'ini tahrirlaydi va tasdiqlaydi"]); } catch (e) {}
        try { if (typeof PERM38 !== 'undefined' && !PERM38.some(x => x.id === 'hisob')) PERM38.splice(PERM38.length - 1, 0, { id: 'hisob', t: "Hisobotlar: Forma-30 yangilash, tekshiruvni tahrirlash va tasdiqlash", who: ['admin', 'hisob'], fns: [] }); } catch (e) {}
        function hsCan() { try { return typeof p38Can === 'function' ? p38Can('hisob') : isAdmin(); } catch (e) { return isAdmin(); } }
        var HS_CATS = [{ k: 'vagon', ic: '🚃', t: 'Vagonlar' }, { k: 'avto', ic: '🚗', t: 'Avtopark' }, { k: 'tep', ic: '🚂', t: 'Teplovozlar' }];
        var HS_AKT = [
            { k: 'kolodka', ic: '🟫', t: 'Tormoz kolodkalari', types: ['ornatish', 'holat', 'sinov'] },
            { k: 'gildirak', ic: '⚙️', t: "Gʻildirak juftligi (kolyosniy para)", types: ['oq_sinish'] },
            { k: 'boshqa', ic: '🔩', t: 'Boshqa ehtiyot qismlar', types: ['defekt', 'umumiy'] }
        ];
        var HS_F30_KEY = 'agmk_f30', HS_CHK_KEY = 'agmk_hisob', HS_SET_KEY = 'agmk_hisob_set';
        var HS = { tab: 'akt', cat: null, akt: null, chk: null, pend: null };
        function hsF30() { return kvGet(HS_F30_KEY, {}); }
        function hsF30Of(cat) { return (hsF30()[cat] || []).slice().sort((a, b) => String(b.month).localeCompare(String(a.month)) || String(b.at).localeCompare(String(a.at))); }
        function hsChecks() { return kvGet(HS_CHK_KEY, []); }
        function hsSet() { return kvGet(HS_SET_KEY, {}); }
        function hsMon(m) { const a = String(m || '').split('-'); return a.length === 2 ? (OY_UZ[+a[1] - 1] || a[1]) + ' ' + a[0] : m || '—'; }
        function hsN(v) { if (v === null || v === undefined || v === '') return null; if (typeof v === 'number') return isFinite(v) ? v : null; const s = String(v).replace(/\s| /g, '').replace(',', '.'); if (!/^-?\d+(\.\d+)?$/.test(s)) return null; return +s; }
        function hsFmt(n, d) { if (n === null || n === undefined || !isFinite(n)) return '—'; const r = Math.round(n * 100) / 100; const p = String(Math.abs(r).toFixed(d === undefined ? (Number.isInteger(r) ? 0 : 2) : d)).split('.'); return (r < 0 ? '−' : '') + p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (p[1] ? ',' + p[1] : ''); }
        function hsNorm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"'`ʻʼ‘’]/g, '').replace(/[^a-zа-я0-9]+/g, ' ').trim(); }
        function hsLog(rec, action) { rec.log = rec.log || []; rec.log.push({ at: new Date().toISOString(), by: authorStr(), byT: meTabel(), a: action }); }
        async function hsJsonSave(ref, obj) { await mediaSave(ref, new Blob([JSON.stringify(obj)], { type: 'application/json' }), { id: ref, at: new Date().toISOString(), mime: 'application/json', hisob: true }); mediaKeep(ref); }
        async function hsJsonGet(ref) { const b = await mediaGetBlob(ref); if (!b) return null; try { return JSON.parse(await b.text()); } catch (e) { return null; } }

        // ---------- Fayl o'qish: Excel (xls/xlsx/csv), Word (docx), PDF (matnli), rasm (AI) ----------
        async function hsZipFiles(buf) {
            const u8 = new Uint8Array(buf), dv = new DataView(buf); let eocd = -1;
            for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
            if (eocd < 0) throw new Error('ZIP emas');
            const n = dv.getUint16(eocd + 10, true); let p = dv.getUint32(eocd + 16, true); const out = {};
            for (let k = 0; k < n; k++) {
                const meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
                const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
                out[name] = async () => { const ln = dv.getUint16(lo + 26, true), le = dv.getUint16(lo + 28, true), st = lo + 30 + ln + le, raw = u8.subarray(st, st + csz); if (meth === 0) return raw; const ds = new DecompressionStream('deflate-raw'); return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(ds)).arrayBuffer()); };
                p += 46 + nl + el + cl;
            }
            return out;
        }
        async function hsReadDocx(buf) {
            const z = await hsZipFiles(buf); if (!z['word/document.xml']) throw new Error('Word fayl emas');
            const xml = new TextDecoder().decode(await z['word/document.xml']()), d = new DOMParser().parseFromString(xml, 'application/xml');
            const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', rows = [];
            d.getElementsByTagNameNS(W, 'tr') && Array.from(d.getElementsByTagNameNS(W, 'tr')).forEach(tr => { rows.push(Array.from(tr.getElementsByTagNameNS(W, 'tc')).map(tc => Array.from(tc.getElementsByTagNameNS(W, 't')).map(t => t.textContent).join('').trim())); });
            return rows;
        }
        function hsPdfLib() {
            if (!window.pdfjsLib) { const L = $id('pdfjsLibSrc'); if (L) { const n = document.createElement('script'); n.text = L.textContent; document.head.appendChild(n); } } // kutubxona faqat birinchi kerak boʻlganda ishga tushadi
            if (!window.pdfjsLib) throw new Error('PDF moduli yuklanmagan');
            if (!hsPdfLib._w) { const src = ($id('pdfjsWorkerSrc') || {}).textContent || ''; hsPdfLib._w = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); window.pdfjsLib.GlobalWorkerOptions.workerSrc = hsPdfLib._w; }
            return window.pdfjsLib;
        }
        async function hsReadPdf(buf) {
            const lib = hsPdfLib(), doc = await lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise, rows = [], pos = [], cx = [];
            for (let pn = 1; pn <= doc.numPages; pn++) {
                const pg = await doc.getPage(pn), vp = pg.getViewport({ scale: 1 }), tc = await pg.getTextContent();
                const items = tc.items.filter(it => String(it.str).trim()).map(it => { const x = it.transform[4], y = it.transform[5], h = Math.hypot(it.transform[2], it.transform[3]) || 8; return { s: it.str.trim(), x: x, y: y, w: it.width || it.str.length * h * 0.5, h: h }; });
                // bitta matn bo'lagida bir nechta raqam bo'lsa ("2 20900000") — alohida kataklarga ajratiladi
                for (let k = items.length - 1; k >= 0; k--) { const it = items[k], parts = it.s.split(/\s+/); if (parts.length > 1 && parts.every(t => /^-?[\d.,]+$/.test(t))) { const tot = it.s.length, rep = []; let off = 0; parts.forEach(t => { const st = it.s.indexOf(t, off); rep.push({ s: t, x: it.x + it.w * st / tot, y: it.y, w: it.w * t.length / tot, h: it.h }); off = st + t.length; }); items.splice(k, 1, ...rep); } }
                items.sort((a, b) => b.y - a.y || a.x - b.x);
                const lines = []; items.forEach(it => { const L = lines.find(l => Math.abs(l.y - it.y) < Math.max(2.5, it.h * 0.45)); if (L) L.items.push(it); else lines.push({ y: it.y, items: [it] }); });
                lines.forEach(L => {
                    L.items.sort((a, b) => a.x - b.x); const cells = []; let cur = null;
                    L.items.forEach(it => { if (cur && it.x - (cur.x1) < Math.max(0.8, it.h * 0.12)) { cur.s += (it.x - cur.x1 > 0.3 ? ' ' : '') + it.s; cur.x1 = it.x + it.w; } else { cur = { s: it.s, x0: it.x, x1: it.x + it.w }; cells.push(cur); } });
                    const x0 = Math.min(...L.items.map(i => i.x)), x1 = Math.max(...L.items.map(i => i.x + i.w)), h = Math.max(...L.items.map(i => i.h));
                    const r1 = vp.convertToViewportRectangle([x0 - 2, L.y - h * 0.3, x1 + 2, L.y + h * 1.0]);
                    rows.push(cells.map(c => c.s)); cx.push(cells.map(c => [c.x0, c.x1])); pos.push({ page: pn, x: Math.min(r1[0], r1[2]) / vp.width, y: Math.min(r1[1], r1[3]) / vp.height, w: Math.abs(r1[2] - r1[0]) / vp.width, h: Math.abs(r1[3] - r1[1]) / vp.height, cellsX: cells.map(c => c.x0) });
                });
            }
            // Ustunlarni sarlavha bo'yicha tekislash (bo'sh katakli qatorlarda siljish bo'lmasligi uchun)
            const det = hsDetect(rows);
            if (det.row >= 0) { const H = cx[det.row].map(c => c[0]);
                // raqamlar odatda o'ngga, matn chapga tekislanadi: raqam — oxiri bo'yicha, matn — boshi bo'yicha ustunga joylanadi
                for (let i = det.row + 1; i < rows.length; i++) { const out = Array(H.length).fill(''); (cx[i] || []).forEach((c, k) => { const v = String(rows[i][k]), num = /^-?[\d\s.,]+$/.test(v), ref = num ? c[1] - 1 : c[0] + 1; let j = 0; while (j + 1 < H.length && H[j + 1] <= ref) j++; out[j] = out[j] ? out[j] + ' ' + v : v; }); rows[i] = out; } }
            return { rows: rows, pos: pos, pages: doc.numPages };
        }
        async function hsReadExcel(buf, name) {
            if (typeof XLSX === 'undefined') throw new Error('Excel moduli yuklanmagan');
            const u8 = new Uint8Array(buf); let bs = ''; for (let i = 0; i < u8.length; i += 32768) bs += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
            const wb = XLSX.read(bs, { type: 'binary', cellDates: false });
            let best = null;
            wb.SheetNames.forEach(sn => { const a = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: '' }); if (!best || a.length > best.rows.length) best = { rows: a, sheet: sn }; });
            const ent = t => t.indexOf('&') < 0 ? t : t.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            return best ? best.rows.map(r => r.map(c => typeof c === 'string' ? ent(c).trim() : c)) : [];
        }
        // Ustunlarni avtomatik aniqlash (rus / o'zbek sarlavhalar)
        var HS_COLS = {
            nom: [/номен\w*\s*номер|номенклатурн\w* номер|^код$|^kod$|nomenklatura raqami|^номер$|шифр/],
            name: [/^номенклатура$|наименован|^nomi$|^nomenklatura$|материал|mahsulot|tovar|наим/],
            unit: [/ед\.?\s*изм|единиц|o.lchov|^ед\.?$|birlik/],
            qty: [/количеств|кол-?во|^кол\.?$|miqdor|soni|^кол$/],
            price: [/^цена|narx/],
            sum: [/сумма|summa|стоимост|qiymat/],
            req: [/требован|talabnoma|документ|hujjat|наряд/],
            sklad: [/склад|ombor/],
            date: [/дата|sana/]
        };
        function hsDetect(rows) {
            let best = { row: -1, score: 0, map: {} };
            for (let i = 0; i < Math.min(rows.length, 40); i++) {
                const r = rows[i] || [], map = {}; let sc = 0;
                r.forEach((c, j) => { const t = hsNorm(c); if (!t) return; Object.keys(HS_COLS).forEach(k => { if (map[k] === undefined && HS_COLS[k].some(re => re.test(t))) { map[k] = j; sc++; } }); });
                if ((map.qty !== undefined || map.sum !== undefined) && (map.name !== undefined || map.nom !== undefined) && sc > best.score) best = { row: i, score: sc, map: map };
            }
            return best;
        }
        function hsRowsToItems(rows, hdr, map, pos) {
            const out = []; let total = null;
            for (let i = hdr + 1; i < rows.length; i++) {
                const r = rows[i] || [], g = k => map[k] === undefined || map[k] === '' ? '' : r[map[k]];
                const first = hsNorm(r[0]) + ' ' + hsNorm(g('name'));
                if (/^(итого|всего|jami|жами)/.test(hsNorm(r[0])) || /^(итого|всего|jami)\b/.test(hsNorm(g('name')))) { const s = hsN(g('sum')) !== null ? hsN(g('sum')) : hsN(r.filter(x => hsN(x) !== null).slice(-1)[0]); if (s !== null) total = { v: s, i: i }; continue; }
                const name = String(g('name') || '').trim(), nom = String(g('nom') || '').trim(), q = hsN(g('qty')), p = hsN(g('price')), s = hsN(g('sum'));
                if (!name && !nom) continue; if (q === null && s === null) continue;
                out.push({ i: i, nom: nom, name: name, unit: String(g('unit') || '').trim(), qty: q, price: p, sum: s, req: String(g('req') || '').trim(), sklad: String(g('sklad') || '').trim(), date: String(g('date') || '').trim(), pogr: /погрешн/i.test(String(g('nom') + ' ' + r.join(' '))), pos: pos ? pos[i] : null });
            }
            return { items: out, total: total };
        }
        async function hsReadAny(file) {
            const buf = await file.arrayBuffer(), n = String(file.name || '').toLowerCase(), t = file.type || '';
            if (/\.(xlsx|xls|xlsm|csv|ods)$/.test(n) || /sheet|excel|csv/.test(t)) return { kind: 'excel', rows: await hsReadExcel(buf, n) };
            if (/\.docx$/.test(n) || /wordprocessingml/.test(t)) return { kind: 'word', rows: await hsReadDocx(buf) };
            if (/\.pdf$/.test(n) || /pdf/.test(t)) { const r = await hsReadPdf(buf); return { kind: 'pdf', rows: r.rows, pos: r.pos, pages: r.pages }; }
            if (/^image\//.test(t) || /\.(jpe?g|png|webp|heic)$/.test(n)) return { kind: 'image', rows: null };
            throw new Error("Bu fayl turi qoʻllab-quvvatlanmaydi (Excel, Word, PDF yoki rasm yuklang)");
        }
        // Rasm (foto hisobot) — faqat internetli AI orqali, rozilik bilan; ikki marta o'qib solishtiriladi
        async function hsReadImageAI(file) {
            if (!(typeof aiCloudReady === 'function' && aiCloudReady())) throw new Error("Rasmdagi jadvalni oʻqish uchun internetli AI kerak (Parametrlar → AI ulanishi). Iloji boʻlsa hisobotni Excel yoki PDF koʻrinishida yuklang — u eng ishonchli.");
            if (!(await uiConfirm("📸 Rasmdagi jadvalni oʻqish uchun rasm internetli AI ga (" + (aicGet().prov === 'claude' ? 'Claude' : 'Google Gemini') + ") yuboriladi. Rasmda narx va summalar boʻlishi mumkin.\n\nRozimisiz?"))) throw new Error('Bekor qilindi');
            const prompt = 'Rasmdagi jadvalni aynan oʻqib, FAQAT JSON ber: {"rows":[{"nom":"nomenklatura raqami yoki boʻsh","name":"nomi","unit":"oʻlchov","qty":son,"price":son yoki null,"sum":son yoki null}]}. Raqamlarni aynan koʻchir, taxmin qilma. Oʻqib boʻlmagan qiymat — null.';
            const a = await aiaktCloud([file], prompt), b = await aiaktCloud([file], prompt);
            const ra = (a && a.rows) || [], rb = (b && b.rows) || [];
            const rows = [['Номен номер', 'Номенклатура', 'Ед изм', 'Количество', 'Цена', 'Сумма']], unsure = [];
            ra.forEach((x, i) => { const y = rb[i] || {}; ['qty', 'price', 'sum'].forEach(k => { if (hsN(x[k]) !== hsN(y[k])) unsure.push({ row: i + 1, k: k }); }); rows.push([x.nom || '', x.name || '', x.unit || '', x.qty, x.price, x.sum]); });
            if (ra.length !== rb.length) unsure.push({ row: 0, k: 'rows' });
            return { kind: 'image', rows: rows, unsure: unsure };
        }

        // ---------- Forma-30 ----------
        function hsF30Period(rows) { for (let i = 0; i < Math.min(8, rows.length); i++) { const s = (rows[i] || []).join(' '); const m = s.match(/(20\d{2})[\/.\-](\d{2})[\/.\-]\d{2}/); if (/период|period|davr/i.test(s) && m) return m[1] + '-' + m[2]; } return ''; }
        async function hsF30Upload(cat, input) {
            if (!hsCan()) { alert("🔒 Forma-30 ni faqat administrator yoki «Hisobotlar» roli yangilaydi."); return; }
            const f = (input.files || [])[0]; input.value = ''; if (!f) return;
            showToast('⏳ Forma-30 oʻqilmoqda...');
            let r; try { r = await hsReadAny(f); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            if (!r.rows) { alert('⚠️ Forma-30 ni Excel koʻrinishida yuklang (1C dan olingan fayl).'); return; }
            const det = hsDetect(r.rows); if (det.row < 0) { alert("⚠️ Jadval sarlavhasi topilmadi (Номенклатура, Количество, Сумма). Fayl Forma-30 ekaniga ishonch hosil qiling."); return; }
            const it = hsRowsToItems(r.rows, det.row, det.map);
            const sum = it.items.reduce((a, x) => a + (x.sum || 0), 0);
            let month = hsF30Period(r.rows) || new Date().toISOString().slice(0, 7);
            const m2 = await uiPrompt('📅 Forma-30 qaysi oy uchun? (YYYY-MM)', month); if (m2 === null) return; if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(m2.trim())) { alert('Oy notoʻgʻri: masalan 2026-08'); return; }
            month = m2.trim();
            const warn = it.total && Math.abs(it.total.v - sum) > 1 ? ' ⚠️ Fayldagi «Итого» (' + hsFmt(it.total.v) + ') qatorlar yigʻindisidan (' + hsFmt(sum) + ') farq qiladi!' : '';
            if (!(await uiConfirm('Forma-30 (' + HS_CATS.find(c => c.k === cat).t + ', ' + hsMon(month) + '):\n• ' + it.items.length + ' ta qator\n• jami ' + hsFmt(sum) + " so'm" + warn + '\n\nSaqlansinmi? Oldingilari tarixda qoladi.'))) return;
            const id = uid('f30_'), ref = uid('f30d_'), fref = uid('f30f_');
            await hsJsonSave(ref, { items: it.items, total: it.total, map: det.map, hdr: det.row });
            try { await mediaSave(fref, f, { id: fref, at: new Date().toISOString(), name: f.name, mime: f.type, size: f.size }); mediaKeep(fref); } catch (e) {}
            const all = hsF30(); (all[cat] = all[cat] || []).push({ id: id, month: month, at: new Date().toISOString(), by: authorStr(), byT: meTabel(), file: f.name, rows: it.items.length, sum: Math.round(sum * 100) / 100, total: it.total ? it.total.v : null, ref: ref, fref: fref });
            kvSet(HS_F30_KEY, all); showToast('✅ Forma-30 saqlandi: ' + hsMon(month)); hsRender();
        }
        async function hsF30Rows(f30, cat) {
            const d = await hsJsonGet(f30.ref); if (!d) return [];
            const pre = String((hsSet()[cat] || {}).sklad || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean);
            return pre.length ? d.items.filter(x => pre.some(p => String(x.sklad).replace(/\s+/g, ' ').startsWith(p))) : d.items;
        }

        // ---------- Tekshiruv (formula bilan) ----------
        function hsKey(x) { return x.nom ? 'n:' + hsNorm(x.nom) : 'm:' + hsNorm(x.name); }
        function hsCheck(rep, f30items) {
            const F = [], add = (o) => { o.id = 'f' + (F.length + 1); o.st = o.st || ''; F.push(o); };
            const tol = v => Math.max(1, Math.abs(v || 0) * 0.0005);
            // 1) Arifmetika: miqdor × narx = summa
            rep.items.forEach(x => { if (x.qty !== null && x.price !== null && x.sum !== null) { const c = Math.round(x.qty * x.price * 100) / 100; if (Math.abs(c - x.sum) > tol(x.sum)) add({ t: 'arith', lvl: 'red', rows: [x.i], name: x.name, nom: x.nom, msg: 'Miqdor × narx ≠ summa: ' + hsFmt(x.qty) + ' × ' + hsFmt(x.price) + ' = ' + hsFmt(c) + ", hisobotda " + hsFmt(x.sum) + ' (farq ' + hsFmt(x.sum - c) + ')', diff: x.sum - c }); } });
            // 2) Takrorlangan qatorlar
            const seen = {}; rep.items.forEach(x => { const k = [x.req, hsKey(x), x.qty, x.price, x.sum, x.sklad].join('|'); (seen[k] = seen[k] || []).push(x); });
            Object.values(seen).forEach(g => { if (g.length > 1) add({ t: 'dup', lvl: 'blue', rows: g.map(x => x.i), name: g[0].name, nom: g[0].nom, msg: 'Bir xil qator ' + g.length + ' marta takrorlangan' + (g[0].req ? ' (hujjat ' + g[0].req + ')' : '') + " — ikki marta hisoblanmaganini tekshiring" }); });
            // 3) Jami summa
            const rs = rep.items.reduce((a, x) => a + (x.sum || 0), 0);
            if (rep.total && Math.abs(rep.total.v - rs) > tol(rs)) add({ t: 'total', lvl: 'red', rows: [rep.total.i], name: 'Jami', msg: 'Hisobotdagi «Jami» ' + hsFmt(rep.total.v) + ", qatorlar yigʻindisi " + hsFmt(rs) + ' (farq ' + hsFmt(rep.total.v - rs) + ')', diff: rep.total.v - rs });
            // 4) Forma-30 bilan solishtirish (nomenklatura bo'yicha)
            if (f30items) {
                const agg = (L) => { const m = {}; L.forEach(x => { if (x.pogr) return; const k = hsKey(x); const a = m[k] = m[k] || { k: k, name: x.name, nom: x.nom, unit: x.unit, qty: 0, sum: 0, prices: new Set(), rows: [] }; a.qty += x.qty || 0; a.sum += x.sum || 0; if (x.price !== null) a.prices.add(Math.round(x.price * 100) / 100); a.rows.push(x.i); }); return m; };
                const A = agg(rep.items), B = agg(f30items);
                // nomenklatura raqami bo'lmasa — nomi bo'yicha qidirish
                const findB = a => { if (B[a.k]) return B[a.k]; const nm = 'm:' + hsNorm(a.name); if (B[nm]) return B[nm]; return Object.values(B).find(b => hsNorm(b.name) === hsNorm(a.name)) || null; };
                const used = new Set();
                Object.values(A).forEach(a => {
                    const b = findB(a);
                    if (!b) { add({ t: 'notin', lvl: 'red', rows: a.rows, name: a.name, nom: a.nom, msg: "Forma-30 da yoʻq material (" + hsFmt(a.qty) + ' ' + (a.unit || '') + ', ' + hsFmt(a.sum) + " soʻm)", diff: a.sum }); return; }
                    used.add(b.k);
                    const dq = a.qty - b.qty;
                    if (dq > 1e-6 * Math.max(1, b.qty)) add({ t: 'over', lvl: 'red', rows: a.rows, name: a.name, nom: a.nom, msg: 'Forma-30 boʻyicha ' + hsFmt(b.qty) + ' ' + (b.unit || '') + ', hisobotda ' + hsFmt(a.qty) + ' — ortiqcha ' + hsFmt(dq) + (a.sum && b.sum ? ' (summa farqi ' + hsFmt(a.sum - b.sum) + ' soʻm)' : ''), diff: a.sum - b.sum });
                    else if (dq < -1e-6 * Math.max(1, b.qty)) add({ t: 'under', lvl: 'blue', rows: a.rows, name: a.name, nom: a.nom, msg: 'Forma-30 da ' + hsFmt(b.qty) + ' ' + (b.unit || '') + ', hisobotda ' + hsFmt(a.qty) + ' — ' + hsFmt(-dq) + ' kam koʻrsatilgan', diff: a.sum - b.sum });
                    else if (Math.abs(a.sum - b.sum) > tol(b.sum)) add({ t: 'sumdiff', lvl: 'red', rows: a.rows, name: a.name, nom: a.nom, msg: 'Miqdor mos, lekin summa farq qiladi: Forma-30 ' + hsFmt(b.sum) + ', hisobotda ' + hsFmt(a.sum), diff: a.sum - b.sum });
                    const bp = [...b.prices]; [...a.prices].forEach(p => { if (bp.length && !bp.some(q => Math.abs(q - p) <= Math.max(0.01, q * 0.005))) add({ t: 'price', lvl: 'blue', rows: a.rows, name: a.name, nom: a.nom, msg: 'Narx Forma-30 dagidan farq qiladi: ' + hsFmt(p) + ' (Forma-30: ' + bp.map(q => hsFmt(q)).join(', ') + ')' }); });
                    if (a.unit && b.unit && hsNorm(a.unit) !== hsNorm(b.unit)) add({ t: 'unit', lvl: 'blue', rows: a.rows, name: a.name, nom: a.nom, msg: 'Oʻlchov birligi farq qiladi: «' + a.unit + '» (Forma-30: «' + b.unit + '»)' });
                });
                const miss = Object.values(B).filter(b => !used.has(b.k));
                if (miss.length > 25) { const ms = miss.reduce((t, b) => t + b.sum, 0); add({ t: 'missing', lvl: 'blue', rows: [], name: 'Forma-30', msg: 'Forma-30 dagi ' + miss.length + ' ta material hisobotda yoʻq (jami ' + hsFmt(ms) + " soʻm). Agar Forma-30 butun boshqarma boʻyicha boʻlsa — boʻlimda «Omborlar» filtrini kiriting. Toʻliq roʻyxat — Excel natijada.", list: miss.slice(0, 3000).map(b => [b.nom, b.name, b.qty, b.unit, b.sum]) }); }
                else miss.forEach(b => add({ t: 'missing', lvl: 'blue', rows: [], name: b.name, nom: b.nom, msg: 'Forma-30 da bor (' + hsFmt(b.qty) + ' ' + (b.unit || '') + ', ' + hsFmt(b.sum) + " soʻm), hisobotda yoʻq" }));
                const f30err = f30items.filter(x => x.pogr); if (f30err.length) add({ t: 'info', lvl: 'blue', rows: [], name: 'Forma-30', msg: 'Forma-30 da «Погрешность» (yaxlitlash) qatorlari: ' + f30err.length + ' ta — hisobga olinmadi' });
            }
            return F;
        }
        async function hsCheckStart(cat, input) {
            const f = (input.files || [])[0]; input.value = ''; if (!f) return;
            const list = hsF30Of(cat);
            showToast('⏳ Hisobot oʻqilmoqda...');
            let r; try { r = await hsReadAny(f); if (r.kind === 'image') r = await hsReadImageAI(f); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            if (!r.rows || !r.rows.length) { alert('⚠️ Faylda jadval topilmadi.'); return; }
            const det = hsDetect(r.rows);
            HS.pend = { cat: cat, file: f, r: r, det: det, f30id: list[0] ? list[0].id : '' };
            hsMapDlg();
        }
        // Ustunlarni tasdiqlash oynasi (xato bo'lmasligi uchun xodim o'zi ko'radi)
        function hsMapDlg() {
            const P = HS.pend, rows = P.r.rows, det = P.det, E = escapeHtml;
            const hdr = det.row >= 0 ? det.row : 0, head = rows[hdr] || [], nc = Math.max(...rows.slice(0, 60).map(r => (r || []).length));
            const opt = (k, lab) => `<div class="nd-f"><label>${lab}</label><select id="hsm_${k}"><option value="">— yoʻq —</option>${Array.from({ length: nc }, (_, j) => `<option value="${j}"${det.map[k] === j ? ' selected' : ''}>${j + 1}: ${E(String(head[j] === undefined ? '' : head[j]).slice(0, 40))}</option>`).join('')}</select></div>`;
            const L = hsF30Of(P.cat);
            const prev = rows.slice(hdr, hdr + 6).map(r => '<tr>' + (r || []).slice(0, 12).map(c => `<td>${E(String(c).slice(0, 24))}</td>`).join('') + '</tr>').join('');
            mdl('hsMapModal', `<div class="px-h"><b>🔍 Hisobot ustunlarini tasdiqlang</b><button class="mini-btn" onclick="mdlClose('hsMapModal')">✕</button></div>
                <div class="nd-tip">Fayl: <b>${E(P.file.name)}</b> · ${P.r.kind.toUpperCase()} · ${rows.length} qator. Ustunlar avtomatik aniqlandi — tekshirib chiqing.${P.r.unsure && P.r.unsure.length ? `<br>⚠️ AI rasmni ikki marta oʻqidi: ${P.r.unsure.length} ta qiymat mos kelmadi — ular «❓» bilan belgilanadi.` : ''}</div>
                <div class="nd-f"><label>SARLAVHA QATORI</label><input id="hsm_hdr" type="number" value="${hdr + 1}" min="1"></div>
                <div class="nd-2">${opt('nom', 'Nomenklatura raqami')}${opt('name', 'Nomi')}</div><div class="nd-2">${opt('unit', 'Oʻlchov')}${opt('qty', 'Miqdor')}</div><div class="nd-2">${opt('price', 'Narx')}${opt('sum', 'Summa')}</div><div class="nd-2">${opt('req', 'Hujjat / talabnoma')}${opt('sklad', 'Ombor')}</div>
                <div class="nd-f"><label>SOLISHTIRISH UCHUN FORMA-30</label><select id="hsm_f30"><option value="">— Forma-30 siz (faqat arifmetika va takrorlar) —</option>${L.map(x => `<option value="${x.id}"${x.id === P.f30id ? ' selected' : ''}>${E(hsMon(x.month))} · ${x.rows} qator · ${E(x.file)}</option>`).join('')}</select></div>
                <div class="hs-prev"><table>${prev}</table></div>
                <button class="action-btn" onclick="hsRun()">✅ Tekshirishni boshlash</button>`, true);
        }
        async function hsRun() {
            const P = HS.pend; if (!P) return;
            const map = {}; Object.keys(HS_COLS).forEach(k => { const e = $id('hsm_' + k); if (e && e.value !== '') map[k] = +e.value; });
            const hdr = Math.max(0, (+($id('hsm_hdr') || {}).value || 1) - 1), f30id = ($id('hsm_f30') || {}).value || '';
            if (map.qty === undefined && map.sum === undefined) { alert('Miqdor yoki summa ustunini tanlang.'); return; }
            if (map.name === undefined && map.nom === undefined) { alert('Nomi yoki nomenklatura raqami ustunini tanlang.'); return; }
            mdlClose('hsMapModal'); showToast('⏳ Tekshirilmoqda...');
            const rep = hsRowsToItems(P.r.rows, hdr, map, P.r.pos);
            const f30 = f30id ? hsF30Of(P.cat).find(x => x.id === f30id) : null;
            const fitems = f30 ? await hsF30Rows(f30, P.cat) : null;
            const F = hsCheck(rep, fitems);
            F.sort((a, b) => (a.lvl === 'red' ? 0 : 1) - (b.lvl === 'red' ? 0 : 1));
            if (P.r.unsure) P.r.unsure.forEach(u => { if (u.row > 0) { const it = rep.items[u.row - 1]; if (it) F.push({ id: 'u' + u.row + u.k, t: 'ocr', lvl: 'blue', rows: [it.i], name: it.name, msg: '❓ Rasmdan aniq oʻqilmadi (' + ({ qty: 'miqdor', price: 'narx', sum: 'summa' }[u.k] || u.k) + ') — asl hujjatdan tekshiring', st: '' }); } });
            const id = uid('chk_'), fref = uid('chkf_'), dref = uid('chkd_');
            try { await mediaSave(fref, P.file, { id: fref, at: new Date().toISOString(), name: P.file.name, mime: P.file.type, size: P.file.size }); mediaKeep(fref); } catch (e) {}
            await hsJsonSave(dref, { items: rep.items, total: rep.total, rows: P.r.rows, pos: P.r.pos || null, kind: P.r.kind, findings: F, ann: [], map: map, hdr: hdr });
            const red = F.filter(x => x.lvl === 'red').length, blue = F.filter(x => x.lvl === 'blue').length;
            const rec = { id: id, cat: P.cat, at: new Date().toISOString(), by: authorStr(), byT: meTabel(), file: P.file.name, kind: P.r.kind, f30: f30 ? { id: f30.id, month: f30.month } : null, n: rep.items.length, sum: Math.round(rep.items.reduce((a, x) => a + (x.sum || 0), 0) * 100) / 100, red: red, blue: blue, status: 'draft', fref: fref, dref: dref, log: [] };
            hsLog(rec, 'Tekshiruv bajarildi: ' + red + ' ta xato, ' + blue + ' ta tekshirish kerak');
            const all = hsChecks(); all.unshift(rec); kvSet(HS_CHK_KEY, all.slice(0, 300));
            HS.pend = null; HS.chk = id; HS.cat = P.cat; HS.tab = 'hisob'; hsRender();
            showToast(red ? '❌ ' + red + ' ta xato topildi' : '✅ Jiddiy xato topilmadi' + (blue ? ' · ' + blue + ' ta tekshirish kerak' : ''));
        }

        // ---------- Ekran ----------
        function openHisob(tab) { secScreen('screen-hisob', '📊 Dalolatnoma va hisobotlar'); if (tab) HS.tab = tab; openScreen('screen-hisob'); hsRender(); }
        function hsTab(t) { HS.tab = t; HS.cat = null; HS.akt = null; HS.chk = null; hsRender(); }
        function hsRender() {
            const scr = $id('screen-hisob'); if (!scr) return;
            secTabs('screen-hisob', [['akt', '📄 Dalolatnomalar'], ['hisob', '📊 Hisobotlar'], ['haft', '📅 Haftalik achot']], HS.tab, 'hsTab');
            const b = secBody('screen-hisob'), E = escapeHtml; let h = '';
            if (HS.tab === 'haft') { b.innerHTML = typeof wkHtml === 'function' ? wkHtml() : ''; return; } // v3.1: Forma-30 bo'yicha haftalik achot (mod/weekly.js)
            if (HS.tab === 'akt') {
                if (!HS.akt) {
                    h += '<div class="hs-grid">' + HS_AKT.map(c => { const n = ndAkts().filter(a => c.types.includes(a.tur)).length; return `<div class="hs-card" onclick="HS.akt='${c.k}'; hsRender()"><b>${c.ic}</b><span>${E(c.t)}</span><small>${n} ta akt</small></div>`; }).join('') + '</div>';
                    h += `<div class="nd-tip">Har bir turning oʻz shabloni bor. Yangi namuna berilsa — yangi tur qoʻshiladi. 📸 Rasmdan akt: texnika pasporti → «Eslatma albomi» → «🤖 AI: rasmdan akt».</div>`;
                } else {
                    const c = HS_AKT.find(x => x.k === HS.akt), L = ndAkts().filter(a => c.types.includes(a.tur));
                    h += `<div class="hs-back" onclick="HS.akt=null; hsRender()">‹ ${E(c.ic + ' ' + c.t)}</div><div class="hs-new">${c.types.filter(t => ND_TYPES[t]).map(t => `<div class="db-two"><button class="action-btn" onclick="if (typeof dbSetMode === 'function') dbSetMode('ai'); hsNewAkt('${t}')">🤖 ${E(ND_TYPES[t].t)}</button><button class="action-btn db-m" onclick="if (typeof dbSetMode === 'function') dbSetMode('man'); hsNewAkt('${t}')">✍️ Qoʻlda</button></div>`).join('')}</div>`;
                    h += L.length ? '<div class="hs-list">' + L.map(a => `<div class="hs-row" onclick="hsOpenAkt('${a.id}')"><b>${E(a.title || '')}</b><small>📄 ${E(fmtISO(a.sana) || '')} · ✍️ ${E(a.by || '')}</small></div>`).join('') + '</div>' : '<div class="xt-empty">Bu turdagi akt hali yoʻq.</div>';
                }
            } else if (!HS.cat) {
                h += '<div class="hs-grid">' + HS_CATS.map(c => { const f = hsF30Of(c.k)[0], n = hsChecks().filter(x => x.cat === c.k).length; return `<div class="hs-card" onclick="HS.cat='${c.k}'; HS.chk=null; hsRender()"><b>${c.ic}</b><span>${E(c.t)}</span><small>Forma-30: ${f ? E(hsMon(f.month)) : '— yuklanmagan'}<br>${n} ta tekshiruv</small></div>`; }).join('') + '</div>';
                h += `<div class="nd-tip">🔒 Hisob-kitob telefonning oʻzida formula bilan bajariladi; fayllar, narx va summalar internetga yuborilmaydi. Har bir topilgan xato — fayldagi qator raqami bilan. Oxirgi soʻz — tekshiruvchi xodimda.</div>`;
            } else if (HS.chk) { h += hsChkHtml(); }
            else {
                const c = HS_CATS.find(x => x.k === HS.cat), L = hsF30Of(c.k), cur = L[0], can = hsCan(), chk = hsChecks().filter(x => x.cat === c.k), st = hsSet()[c.k] || {};
                h += `<div class="hs-back" onclick="HS.cat=null; hsRender()">‹ ${E(c.ic + ' ' + c.t)}</div>`;
                h += `<div class="hs-box"><div class="hs-h">📋 Forma-30 (norma shabloni)</div>${cur ? `<div class="hs-cur"><b>${E(hsMon(cur.month))}</b> · ${cur.rows} qator · ${hsFmt(cur.sum)} soʻm<br><small>📎 ${E(cur.file)} · 👤 ${E(cur.by)} · 🕒 ${E(fmtDT(cur.at))}</small></div>` : '<div class="xt-empty">Hali yuklanmagan.</div>'}
                    ${can ? `<label class="alb-btn">📥 Yangi oy Forma-30 ni yuklash (Excel)<input type="file" accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onchange="hsF30Upload('${c.k}', this)"></label>` : '<div class="nd-tip">🔒 Yangilash — administrator yoki «Hisobotlar» roli.</div>'}
                    ${L.length > 1 ? `<details class="hs-hist"><summary>🗂 Tarix (${L.length})</summary>${L.map(x => `<div>${E(hsMon(x.month))} · ${x.rows} qator · ${hsFmt(x.sum)} soʻm<br><small>📎 ${E(x.file)} · 👤 ${E(x.by)} · 🕒 ${E(fmtDT(x.at))}</small></div>`).join('')}</details>` : ''}
                    ${can ? `<div class="nd-f" style="margin-top:8px"><label>OMBORLAR (ixtiyoriy filtr: Forma-30 dan faqat shu omborlar olinadi, vergul bilan)</label><input value="${E(st.sklad || '')}" placeholder="masalan: 31 18 92" onchange="hsSetSklad('${c.k}', this.value)"></div>` : ''}</div>`;
                h += `<div class="hs-box"><div class="hs-h">🔍 Hisobotni tekshirish</div><label class="alb-btn cam">📤 Hisobot faylini yuklash (Excel, Word, PDF, rasm)<input type="file" accept=".xls,.xlsx,.csv,.docx,.pdf,image/*" onchange="hsCheckStart('${c.k}', this)"></label>
                    ${chk.length ? '<div class="hs-list">' + chk.map(x => `<div class="hs-row" onclick="HS.chk='${x.id}'; hsRender()"><b>${x.status === 'done' ? '✅' : '📝'} ${E(x.file)}</b><small>${x.f30 ? 'Forma-30: ' + E(hsMon(x.f30.month)) + ' · ' : ''}${x.n} qator · <span class="hs-r">❌ ${x.red}</span> · <span class="hs-b">🔷 ${x.blue}</span><br>👤 ${E(x.by)} · 🕒 ${E(fmtDT(x.at))}</small></div>`).join('') + '</div>' : '<div class="xt-empty">Hali tekshiruv yoʻq.</div>'}</div>`;
            }
            b.innerHTML = h;
            if (HS.chk) hsChkLoad();
        }
        function hsSetSklad(cat, v) { if (!hsCan()) return; const s = hsSet(); s[cat] = Object.assign(s[cat] || {}, { sklad: String(v || '').trim() }); kvSet(HS_SET_KEY, s); showToast('💾 Saqlandi'); }
        function hsNewAkt(t) { ND.form = null; ND.html = ''; ND.albumHtml = null; ND.albumPhotos = null; ndOpenAkt(); ND.form.tur = t; ND.form.com = []; ND.form.apObj = ndDefApObj(); if (ND_TYPES[t] && ND_TYPES[t].l) { ND.form.lang = ND_TYPES[t].l; } ndRender(); }
        function hsOpenAkt(id) { openND('arch'); setTimeout(() => ndOpenArch(id), 60); }
        function hsRec(id) { return hsChecks().find(x => x.id === id) || null; }
        function hsChkHtml() {
            const x = hsRec(HS.chk); if (!x) return '<div class="xt-empty">Topilmadi</div>'; const E = escapeHtml, c = HS_CATS.find(k => k.k === x.cat) || HS_CATS[0];
            return `<div class="hs-back" onclick="HS.chk=null; hsRender()">‹ ${E(c.ic + ' ' + c.t)} · tekshiruv</div>
                <div class="hs-box"><div class="hs-h">${x.status === 'done' ? '✅ Yakunlangan' : '📝 Qoralama'} — ${E(x.file)}</div>
                <div class="hs-kpi"><div><small>Qatorlar</small><b>${x.n}</b></div><div><small>Summa</small><b>${hsFmt(x.sum)}</b></div><div class="r"><small>❌ Xato</small><b>${x.red}</b></div><div class="b"><small>🔷 Tekshirish</small><b>${x.blue}</b></div></div>
                <div class="nd-tip">${x.f30 ? 'Solishtirildi: Forma-30 ' + E(hsMon(x.f30.month)) : 'Forma-30 siz: faqat arifmetika, jami va takrorlar tekshirildi'} · 👤 ${E(x.by)} · 🕒 ${E(fmtDT(x.at))}</div>
                <div class="hs-acts"><button class="action-btn" style="background:#1d4ed8" onclick="hsPdfQuick('${x.id}')">📥 PDF — telefonga (bir bosishda)</button><button class="action-btn" onclick="hsPdfOpen('${x.id}')">🖍 Belgilangan PDF (koʻrish / tahrirlash)</button><button class="action-btn" style="background:#0f766e" onclick="hsXlsx('${x.id}')">📊 Natija — Excel</button><button class="action-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="hsAkt('${x.id}')">📄 Dalolatnoma tuzish</button>${hsCan() && x.status !== 'done' ? `<button class="action-btn" style="background:#15803d" onclick="hsDone('${x.id}')">✅ Tekshiruvni yakunlash</button>` : ''}${isAdmin() && x.status === 'done' ? `<button class="action-btn" style="background:#b45309" onclick="hsReopen('${x.id}')">🔓 Qayta ochish (tahrirlash)</button>` : ''}</div></div>
                <div class="hs-box"><div class="hs-h">Topilganlar</div><div id="hsFind" class="hs-find">⏳</div></div>
                <details class="hs-box hs-hist"><summary>🧾 Oʻzgarishlar jurnali (${(x.log || []).length})</summary>${(x.log || []).slice().reverse().map(l => `<div><small>🕒 ${E(fmtDT(l.at))} · 👤 ${E(l.by || '')}</small><br>${E(l.a)}</div>`).join('')}</details>`;
        }
        async function hsChkLoad() {
            const x = hsRec(HS.chk), box = $id('hsFind'); if (!x || !box) return; const d = await hsJsonGet(x.dref); if (!d) { box.innerHTML = '⚠️ Maʼlumot topilmadi'; return; }
            HS.data = d; const E = escapeHtml, can = hsCan() && x.status !== 'done', rowNo = i => (d.kind === 'pdf' && d.pos && d.pos[i] ? d.pos[i].page + '-bet, ' : '') + (i + 1) + '-qator';
            if (!d.findings.length) { box.innerHTML = '<div class="hs-ok">✅ Xato topilmadi. Barcha qatorlar arifmetik toʻgʻri' + (x.f30 ? ' va Forma-30 ga mos' : '') + '.</div>'; return; }
            box.innerHTML = d.findings.map(f => `<div class="hs-f ${f.lvl}${f.st ? ' st-' + f.st : ''}"><div class="hs-fh"><b>${f.lvl === 'red' ? '❌' : '🔷'} ${E(f.name || '')}</b>${f.nom ? `<small>№ ${E(f.nom)}</small>` : ''}</div><div>${E(f.msg)}</div><small>${f.rows.length ? '📍 ' + f.rows.slice(0, 6).map(rowNo).join('; ') + (f.rows.length > 6 ? ' …' : '') : '📍 hisobotda yoʻq'}</small>
                ${can ? `<div class="hs-fb"><button class="${f.st === 'ok' ? 'on' : ''}" onclick="hsMark('${f.id}','ok')">✅ Tasdiqlayman (xato)</button><button class="${f.st === 'no' ? 'on' : ''}" onclick="hsMark('${f.id}','no')">✖ Xato emas</button></div>` : (f.st ? `<small>${f.st === 'ok' ? '✅ Tasdiqlangan' : '✖ Xato emas deb belgilangan'}${f.by ? ' — ' + E(f.by) : ''}</small>` : '')}</div>`).join('');
        }
        async function hsMark(fid, st) {
            if (!hsCan()) return; const x = hsRec(HS.chk), d = HS.data; if (!x || !d || x.status === 'done') return; const f = d.findings.find(z => z.id === fid); if (!f) return;
            f.st = f.st === st ? '' : st; f.by = authorStr(); f.at = new Date().toISOString(); await hsJsonSave(x.dref, d);
            const all = hsChecks(), r = all.find(z => z.id === x.id); hsLog(r, (f.st === 'ok' ? 'Tasdiqlandi' : f.st === 'no' ? '«Xato emas» deb belgilandi' : 'Belgi olib tashlandi') + ': ' + (f.name || '') + ' — ' + f.msg.slice(0, 80)); kvSet(HS_CHK_KEY, all);
            hsChkLoad();
        }
        async function hsReopen(id) { // faqat asoschi (administrator): yakunlangan tekshiruvni tahrirlash uchun ochadi — tarixga yoziladi
            if (!isAdmin()) return; const all = hsChecks(), r = all.find(z => z.id === id); if (!r || r.status !== 'done') return;
            if (!(await uiConfirm('Yakunlangan tekshiruv tahrirlash uchun qayta ochilsinmi? (tarixga yoziladi)'))) return;
            r.status = 'draft'; hsLog(r, 'Qayta ochildi (administrator)'); kvSet(HS_CHK_KEY, all); hsRender(); showToast('🔓 Qayta ochildi');
        }
        async function hsDone(id) {
            if (!hsCan()) return; const all = hsChecks(), r = all.find(z => z.id === id); if (!r) return; const d = await hsJsonGet(r.dref);
            const open = d ? d.findings.filter(f => !f.st && f.lvl === 'red').length : 0;
            if (open && !(await uiConfirm(open + ' ta xato hali koʻrib chiqilmagan (✅ yoki ✖ belgilanmagan). Baribir yakunlansinmi?'))) return;
            r.status = 'done'; hsLog(r, 'Tekshiruv yakunlandi'); kvSet(HS_CHK_KEY, all); hsRender(); showToast('✅ Yakunlandi');
        }
        async function hsXlsx(id) {
            const r = hsRec(id), d = await hsJsonGet(r.dref); if (!d) return;
            const rows = [['№', 'Daraja', 'Nomenklatura №', 'Nomi', 'Izoh', 'Fayldagi qator(lar)', 'Holat']].concat(d.findings.map((f, i) => [i + 1, f.lvl === 'red' ? 'Xato' : 'Tekshirish kerak', f.nom || '', f.name || '', f.msg, f.rows.map(x => x + 1).join(', '), f.st === 'ok' ? 'Tasdiqlangan' : f.st === 'no' ? 'Xato emas' : '']));
            d.findings.filter(f => f.list).forEach(f => { rows.push([]); rows.push(['Forma-30 da bor, hisobotda yoʻq:']); f.list.forEach(x => rows.push(['', '', x[0], x[1], hsFmt(x[2]) + ' ' + (x[3] || '') + ' · ' + hsFmt(x[4]) + " soʻm", '', ''])); });
            xlsxDl(rows, 'Tekshiruv ' + r.file);
        }
        async function hsAkt(id) {
            const r = hsRec(id), d = await hsJsonGet(r.dref); if (!d) return; const c = HS_CATS.find(k => k.k === r.cat) || HS_CATS[0];
            const F = d.findings.filter(f => f.st !== 'no' && (f.lvl === 'red' || f.st === 'ok'));
            ND.form = null; ND.html = ''; ND.albumHtml = null; ND.albumPhotos = null; ndOpenAkt();
            const f = ND.form; f.tur = 'umumiy'; f.lang = 'uz'; f.langSet = true;
            f.obj = c.t + ' boʻyicha ' + (r.f30 ? hsMon(r.f30.month) + ' oyi ' : '') + 'hisoboti («' + r.file + '») tekshiruvi';
            f.text = F.length ? F.map(x => (x.name ? x.name + (x.nom ? ' (№ ' + x.nom + ')' : '') + ': ' : '') + x.msg).join('\n') : 'hisobot Forma-30 ga toʻliq mos, arifmetik xatolar aniqlanmadi';
            f.com = []; f.apObj = ndDefApObj(); ndRender(); showToast('📄 Komissiya aʼzolarini tanlab «AI bilan akt tuzish» ni bosing');
        }

        // ---------- PDF: belgilash, tahrirlash, chop etishga tayyorlash ----------
        var HSP = { rec: null, d: null, pages: [], tool: 'red', scale: 2 };
        async function hsPdfOpen(id) {
            const r = hsRec(id); if (!r) return; const d = await hsJsonGet(r.dref); if (!d) return;
            HSP.rec = r; HSP.d = d; HSP.tool = 'view';
            let m = $id('hsPdf'); if (!m) { m = document.createElement('div'); m.id = 'hsPdf'; m.className = 'yg-viewer'; document.body.appendChild(m); }
            const can = hsCan() && r.status !== 'done';
            m.classList.remove('hidden');
            m.innerHTML = `<div class="yg-vh"><div class="yg-vt"><b>🖍 ${escapeHtml(r.file)}</b><small>🟥 xato · 🟦 tekshirish kerak${can ? ' · tahrirlash yoqilgan' : ' · faqat koʻrish'}</small></div><div class="yg-vb">
                ${can ? `<button data-t="red" onclick="hsTool('red')">🟥 Xato</button><button data-t="blue" onclick="hsTool('blue')">🟦 Tekshirish</button><button data-t="note" onclick="hsTool('note')">📝 Izoh</button><button data-t="del" onclick="hsTool('del')">🧽 Oʻchirish</button>` : ''}
                <button onclick="hsPdfExport()">🖨 PDF</button><button onclick="$id('hsPdf').classList.add('hidden')">✖</button></div></div><div class="hs-pages" id="hsPages">⏳ Tayyorlanmoqda...</div>`;
            try { await hsPdfRenderPages(); } catch (e) { $id('hsPages').innerHTML = '⚠️ ' + escapeHtml(agmkErrUz(e)); }
        }
        function hsTool(t) { HSP.tool = HSP.tool === t ? 'view' : t; document.querySelectorAll('#hsPdf .yg-vb button[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === HSP.tool)); }
        // Sahifalar: PDF bo'lsa — asl sahifa rasmi; Excel/Word bo'lsa — jadval sahifalari
        async function hsPdfRenderPages() {
            const d = HSP.d, r = HSP.rec, box = $id('hsPages'); HSP.pages = [];
            if (d.kind === 'pdf') {
                const b = await mediaGetBlob(r.fref); if (!b) throw new Error('Asl fayl topilmadi');
                const doc = await hsPdfLib().getDocument({ data: new Uint8Array(await b.arrayBuffer()) }).promise;
                for (let pn = 1; pn <= doc.numPages; pn++) { const pg = await doc.getPage(pn), vp = pg.getViewport({ scale: HSP.scale }), c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: g, viewport: vp }).promise; HSP.pages.push({ bg: c, boxes: [] }); }
                const byRow = {}; d.findings.forEach(f => f.rows.forEach(i => { (byRow[i] = byRow[i] || []).push(f); }));
                Object.keys(byRow).forEach(i => { const p = d.pos && d.pos[i]; if (!p || !HSP.pages[p.page - 1]) return; const red = byRow[i].some(f => f.lvl === 'red' && f.st !== 'no'); if (byRow[i].every(f => f.st === 'no')) return; HSP.pages[p.page - 1].boxes.push({ x: p.x, y: p.y, w: p.w, h: p.h, c: red ? 'red' : 'blue' }); });
            } else {
                // jadval sahifalari (A4 albom), xato qatorlar rangli
                const rows = d.rows, hdr = d.hdr || 0, cols = Math.min(12, Math.max(...rows.slice(hdr, hdr + 50).map(x => (x || []).length))), W = 1754, H = 1240, rh = 34, per = Math.floor((H - 140) / rh);
                const lv = {}; d.findings.forEach(f => f.rows.forEach(i => { if (f.st === 'no') return; lv[i] = lv[i] === 'red' || f.lvl === 'red' ? 'red' : 'blue'; }));
                const body = []; for (let i = hdr + 1; i < rows.length; i++) body.push(i);
                const wid = Array.from({ length: cols }, (_, j) => Math.max(4, Math.min(40, Math.max(...[hdr].concat(body.slice(0, 400)).map(i => String((rows[i] || [])[j] === undefined ? '' : rows[i][j]).length))))), sw = wid.reduce((a, b) => a + b, 0), cw = wid.map(w => w / sw * (W - 80));
                for (let s = 0; s < Math.max(1, body.length); s += per) {
                    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#000'; g.font = 'bold 22px Arial'; g.fillText(r.file + ' — ' + (Math.floor(s / per) + 1) + '-bet', 40, 50);
                    const draw = (i, y, bold) => { let x = 40; const row = rows[i] || []; g.font = (bold ? 'bold ' : '') + '17px Arial'; for (let j = 0; j < cols; j++) { g.strokeStyle = '#999'; g.strokeRect(x, y, cw[j], rh); g.save(); g.beginPath(); g.rect(x, y, cw[j], rh); g.clip(); g.fillStyle = '#000'; const v = row[j]; g.fillText(typeof v === 'number' ? hsFmt(v) : String(v === undefined ? '' : v), x + 4, y + 23); g.restore(); x += cw[j]; } };
                    draw(hdr, 70, true); const boxes = [];
                    body.slice(s, s + per).forEach((i, k) => { const y = 70 + rh * (k + 1); draw(i, y); g.font = '13px Arial'; g.fillStyle = '#555'; g.fillText(String(i + 1), 8, y + 22); if (lv[i]) boxes.push({ x: 40 / W, y: y / H, w: (W - 80) / W, h: rh / H, c: lv[i] }); });
                    HSP.pages.push({ bg: c, boxes: boxes });
                }
            }
            (d.ann || []).forEach(a => { if (HSP.pages[a.p]) HSP.pages[a.p].ann = (HSP.pages[a.p].ann || []).concat([a]); });
            box.innerHTML = ''; HSP.pages.forEach((pg, i) => { const c = document.createElement('canvas'); c.width = pg.bg.width; c.height = pg.bg.height; c.className = 'hs-page'; c.dataset.p = i; c.onclick = e => hsPageClick(e, i); box.appendChild(c); pg.el = c; hsPaint(i); });
        }
        const HS_COL = { red: 'rgba(239,68,68,0.28)', blue: 'rgba(56,189,248,0.28)' };
        function hsPaint(i) {
            const pg = HSP.pages[i], c = pg.el, g = c.getContext('2d'); g.drawImage(pg.bg, 0, 0);
            pg.boxes.forEach(b => { g.fillStyle = HS_COL[b.c]; g.fillRect(b.x * c.width, b.y * c.height, b.w * c.width, b.h * c.height); g.strokeStyle = b.c === 'red' ? 'rgba(220,38,38,0.9)' : 'rgba(14,165,233,0.9)'; g.lineWidth = 2; g.strokeRect(b.x * c.width, b.y * c.height, b.w * c.width, b.h * c.height); });
            (pg.ann || []).forEach(a => {
                if (a.k === 'note') { const fs = Math.round(c.width / 60); g.font = 'bold ' + fs + 'px Arial'; const lines = String(a.t).match(/.{1,42}(\s|$)/g) || [a.t]; const w = Math.max(...lines.map(l => g.measureText(l).width)) + 16, h = lines.length * fs * 1.25 + 12, x = a.x * c.width, y = a.y * c.height; g.fillStyle = 'rgba(254,240,138,0.92)'; g.fillRect(x, y, w, h); g.strokeStyle = '#a16207'; g.strokeRect(x, y, w, h); g.fillStyle = '#111'; lines.forEach((l, k) => g.fillText(l.trim(), x + 8, y + fs * (k + 1) * 1.2 + 2)); }
                else { g.fillStyle = HS_COL[a.k]; g.fillRect(a.x * c.width, a.y * c.height, a.w * c.width, a.h * c.height); g.strokeStyle = a.k === 'red' ? 'rgba(220,38,38,0.9)' : 'rgba(14,165,233,0.9)'; g.lineWidth = 3; g.strokeRect(a.x * c.width, a.y * c.height, a.w * c.width, a.h * c.height); }
            });
        }
        async function hsPageClick(e, i) {
            const t = HSP.tool; if (t === 'view' || !hsCan() || HSP.rec.status === 'done') return;
            const c = HSP.pages[i].el, R = c.getBoundingClientRect(), x = (e.clientX - R.left) / R.width, y = (e.clientY - R.top) / R.height, pg = HSP.pages[i]; pg.ann = pg.ann || [];
            if (t === 'del') { const k = pg.ann.findIndex(a => a.k === 'note' ? (x >= a.x && y >= a.y && x <= a.x + 0.3 && y <= a.y + 0.06) : (x >= a.x && y >= a.y && x <= a.x + a.w && y <= a.y + a.h)); if (k < 0) { showToast("Oʻchirish uchun oʻzingiz qoʻygan belgi yoki izohni bosing"); return; } const a = pg.ann.splice(k, 1)[0]; await hsAnnSave('Belgi oʻchirildi (' + (i + 1) + '-bet)' + (a.t ? ': ' + a.t : '')); hsPaint(i); return; }
            if (t === 'note') { const s = await uiPrompt('📝 Izoh matni:', ''); if (!s) return; pg.ann.push({ p: i, k: 'note', x: x, y: y, t: s.trim(), by: authorStr(), at: new Date().toISOString() }); await hsAnnSave('Izoh qoʻshildi (' + (i + 1) + '-bet): ' + s.trim()); hsPaint(i); return; }
            // belgi: bosilgan qator kengligida (jadval qatori balandligi ~2.8%)
            const h = 0.028, w = 0.9; pg.ann.push({ p: i, k: t, x: Math.max(0, Math.min(1 - w, x - w / 2)), y: Math.max(0, y - h / 2), w: w, h: h, by: authorStr(), at: new Date().toISOString() }); await hsAnnSave((t === 'red' ? 'Xato belgisi' : 'Tekshirish belgisi') + ' qoʻyildi (' + (i + 1) + '-bet)'); hsPaint(i);
        }
        async function hsAnnSave(what) { const d = HSP.d; d.ann = []; HSP.pages.forEach(pg => (pg.ann || []).forEach(a => d.ann.push(a))); await hsJsonSave(HSP.rec.dref, d); const all = hsChecks(), r = all.find(z => z.id === HSP.rec.id); if (r) { hsLog(r, what); kvSet(HS_CHK_KEY, all); HSP.rec = r; } }
        // Rasmli PDF (sahifa + belgilar + izohlar + oxirida xulosa sahifasi) — chop etish uchun
        async function hsPdfExport() {
            showToast('⏳ PDF tayyorlanmoqda...'); const imgs = [];
            for (const pg of HSP.pages) { const b = await new Promise(r => pg.el.toBlob(r, 'image/jpeg', 0.9)); imgs.push({ w: pg.el.width, h: pg.el.height, data: new Uint8Array(await b.arrayBuffer()) }); }
            // xulosa sahifasi
            const d = HSP.d, r = HSP.rec, W = 1240, H = 1754, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#000';
            g.font = 'bold 30px Times New Roman'; g.fillText('Hisobotni tekshirish natijasi', 80, 100); g.font = '20px Times New Roman';
            const hd = [r.file, (r.f30 ? 'Forma-30: ' + hsMon(r.f30.month) : 'Forma-30 siz'), 'Qatorlar: ' + r.n + ' · Summa: ' + hsFmt(r.sum) + " soʻm", 'Xato: ' + r.red + ' · Tekshirish kerak: ' + r.blue, 'Tekshirdi: ' + r.by + ' · ' + fmtDT(r.at)];
            hd.forEach((t, k) => g.fillText(t, 80, 150 + k * 30)); let y = 330;
            d.findings.filter(f => f.st !== 'no').slice(0, 40).forEach((f, k) => { g.fillStyle = f.lvl === 'red' ? 'rgba(239,68,68,0.25)' : 'rgba(56,189,248,0.25)'; g.fillRect(70, y - 22, W - 140, 30); g.fillStyle = '#000'; g.font = '17px Times New Roman'; const t = (k + 1) + '. ' + (f.name ? f.name + ': ' : '') + f.msg; g.fillText(t.length > 120 ? t.slice(0, 118) + '…' : t, 80, y); y += 34; });
            if (d.findings.length > 40) { g.fillText('… jami ' + d.findings.length + ' ta — toʻliq roʻyxat Excel faylda', 80, y); }
            const b = await new Promise(rs => c.toBlob(rs, 'image/jpeg', 0.9)); imgs.push({ w: W, h: H, data: new Uint8Array(await b.arrayBuffer()) });
            const pdf = hsImgPdf(imgs), u = URL.createObjectURL(pdf), a = document.createElement('a'); a.href = u; a.download = 'Tekshiruv_' + String(r.file).replace(/\.[^.]+$/, '').replace(/[^\p{L}\d]+/gu, '_') + '.pdf'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
            const all = hsChecks(), rr = all.find(z => z.id === r.id); if (rr) { hsLog(rr, 'Belgilangan PDF chiqarildi'); kvSet(HS_CHK_KEY, all); }
        }
        function hsImgPdf(imgs) {
            const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
            const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
            const obj = (n, body) => { offs[n] = len; push(n + ' 0 obj\n'); body.forEach(push); push('\nendobj\n'); };
            push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); const np = imgs.length, kids = [];
            imgs.forEach((im, i) => {
                const land = im.w > im.h, PW = land ? 841.89 : 595.28, PH = land ? 595.28 : 841.89, k = Math.min(PW / im.w, PH / im.h), w = im.w * k, h = im.h * k, x = (PW - w) / 2, y = (PH - h) / 2;
                const pn = 3 + i * 3, cn = pn + 1, in_ = pn + 2; kids.push(pn + ' 0 R');
                obj(pn, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW.toFixed(2) + ' ' + PH.toFixed(2) + '] /Resources << /XObject << /Im0 ' + in_ + ' 0 R >> >> /Contents ' + cn + ' 0 R >>']);
                const s = 'q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /Im0 Do Q';
                obj(cn, ['<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream']);
                obj(in_, ['<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.data.length + ' >>\nstream\n', im.data, '\nendstream']);
            });
            obj(1, ['<< /Type /Catalog /Pages 2 0 R >>']); obj(2, ['<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + np + ' >>']);
            const n = 3 + np * 3, xref = len; let x = 'xref\n0 ' + n + '\n0000000000 65535 f \n'; for (let i = 1; i < n; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
            push(x + 'trailer\n<< /Size ' + n + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
            return new Blob(parts, { type: 'application/pdf' });
        }
        // Asosiy sahifa kartasi va AI buyruqlari
        mainCard('hisob', '📊', 'Dalolatnoma va hisobotlar', 'dalolatnoma akt hisobot achot otchot forma 30 tekshirish norma kolodka gildirak vagon avtopark teplovoz', () => openHisob(), '[onclick="openSettings()"]');
        (function () {
            aiStage('Hisobotni tekshirish', function (q, next) {
                try { const s = String(q || '').toLowerCase();
                    if (/(hisobot|achot|otchot|отч[её]т|forma.?30|форма.?30)/.test(s) && /(tekshir|och|yukla|ko.rsat|провер)/.test(s)) { setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} const c = /avto|avtopark|mashina/.test(s) ? 'avto' : /teplov|lokom/.test(s) ? 'tep' : /vagon/.test(s) ? 'vagon' : null; HS.tab = 'hisob'; HS.cat = c; HS.chk = null; openHisob('hisob'); }, 500); return { t: '📊 «Dalolatnoma va hisobotlar» → Hisobotlar ochilmoqda. Hisobot faylini yuklang — Forma-30 bilan formula boʻyicha solishtiraman.', personal: true }; }
                } catch (e) {}
                return next(q);
            });
        })();

