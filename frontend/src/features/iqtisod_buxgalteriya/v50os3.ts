        // =====================================================================
        // 5.0 — 📊 ОС-3 (думпкар kapital taʼmiri xarajatlari) — bitta tugma bilan (muallif soʻrovi, 28.10.2026)
        //  Kirish (har oy, 3 xil fayl — ilovaga yuklanadi, hech qayerga yuborilmaydi):
        //   1) M-30 (1С «Требование» hisoboti) — materiallar roʻyxati: ШПЗ (J), soni (M), narx (N), summa (O)
        //   2) Brigada naryadlari — «Кап.рем … зав.№ X» qatorlari: J («Задано» — bajarilgan ulush, to'ldirilgan bo'lsa) × L (расценка)
        //   3) «Затраты за MM.YYYY» — ichidagi xom jadval (pivot kesh, «свод»): ш\з Б=2220, цех=92:
        //        ish haqi = 03 + 07 спецпитание БП; soc.strax = 04 + 07 спецпитание БП с/налог; materiallar ТЗР bilan = Σ «сумма с 16» (ШПЗ boʻyicha)
        //  Qoidalar (muallif tasdiqlagan, 2025 yanv–may etalon bilan tiyinigacha tekshirilgan — scratchpad os3gen.py bilan 1:1):
        //   • ШПЗ = «222» + vagon pasportidagi inventar raqamining oxirgi 3 raqami
        //   • ulush = vagon naryad summasi / oy KR naryadlari jami (ANIQ); pul 0,01 gacha, qoldiq tiyin eng katta ulushga — jami oylik summaga teng
        //   • ro'yxatda yo'q 222xxx ШПЗ (qolib ketgan materiallar) — faqat materiallar qatori; «Shifr zatrat tuzatishi» — qo'lda, izoh bilan
        //  Chiqish: ОС-3 yigʻma jadvali + har vagonga kalkulyatsiya (muallif shabloni, «4372» varagʻi) — Excel (chop etishga tayyor) va PDF.
        // =====================================================================
        const O3: any = window as any;
        var OS3: any = { m: '', f: { m30: null, nar: [], zat: null }, d: null, inv: {}, tuz: [], tur: '2ВС-105т' };
        const OS3_LIST = 'agmk_os3_list';
        function o3E(s: any): string { return O3.escapeHtml(String(s == null ? '' : s)); }
        function o3r2(x: number): number { const v = Number((x + 0.0).toFixed(2)); return Object.is(v, -0) ? 0 : v; }
        function o3n(x: number, d?: number): string { return Number(x || 0).toLocaleString('ru-RU', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }).replace(/ /g, ' '); }
        function o3s(v: any): string { return v == null ? '' : String(v).trim(); }
        function o3k(v: any): string { if (v == null) return ''; if (typeof v === 'number') return String(Math.trunc(v)); return String(v).trim().split('.')[0]; }
        function o3Bin(buf: ArrayBuffer): string { const u8 = new Uint8Array(buf); let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + 32768))); return s; }
        function o3Book(buf: ArrayBuffer): any { return O3.XLSX.read(o3Bin(buf), { type: 'binary', cellDates: false }); } // .xls (BIFF) va .xlsx — ikkalasi
        function o3V(ws: any, ref: string): any { const c = ws[ref]; return c ? c.v : null; }

        // ---------------- 1) M-30 ----------------
        function os3M30(buf: ArrayBuffer): any {
            const wb = o3Book(buf), ws = wb.Sheets[wb.SheetNames[0]], R = O3.XLSX.utils.decode_range(ws['!ref'] || 'A1'), rows: any = {}, X = (c: number, r: number) => o3V(ws, O3.XLSX.utils.encode_cell({ c: c, r: r }));
            let per = '';
            for (let r = 0; r <= Math.min(R.e.r, 6); r++) for (let c = 0; c <= Math.min(R.e.c, 6); c++) { const v = o3s(X(c, r)); const m = v.match(/период:\s*(.+)$/i); if (m) per = m[1].trim(); }
            for (let r = 5; r <= R.e.r; r++) {
                const sh = X(9, r), sum = X(14, r); if (!sh || typeof sum !== 'number') continue;
                const k = o3s(sh); (rows[k] = rows[k] || []).push({ treb: X(0, r), nom: X(3, r), name: o3s(X(4, r)), ed: X(5, r) || '', qty: X(12, r) || 0, price: X(13, r) || 0, sum: sum });
            }
            return { rows: rows, per: per };
        }
        // ---------------- 2) Naryadlar ----------------
        var O3_KR = /кап\.?\s*рем/i;
        function os3Naryad(bufs: { name: string, buf: ArrayBuffer }[]): any {
            const H = new Map<string, number>(), src: any = {}, warn: string[] = []; let mon = '';
            bufs.forEach(F => {
                const wb = o3Book(F.buf);
                wb.SheetNames.forEach((sn: string) => {
                    const ws = wb.Sheets[sn]; if (!ws['!ref']) return; const R = O3.XLSX.utils.decode_range(ws['!ref']);
                    for (let r = R.s.r; r <= R.e.r; r++) {
                        const cv = o3V(ws, 'C' + (r + 1));
                        if (!mon) for (let c = R.s.c; c <= Math.min(R.e.c, 10); c++) { const v = o3V(ws, O3.XLSX.utils.encode_cell({ c: c, r: r })); if (typeof v === 'string' && /Наряд\s*№/.test(v)) { mon = v; break; } }
                        if (!(typeof cv === 'string' && O3_KR.test(cv))) continue;
                        const rn = r + 1, J = o3V(ws, 'J' + rn), L = o3V(ws, 'L' + rn);
                        if (typeof J !== 'number' || typeof L !== 'number' || J <= 0) continue;
                        const m = cv.match(/№\s*0*([0-9]+)/) || cv.match(/дозатор\s*№?\s*0*([0-9]+)/i); let k = m ? m[1] : cv; if (/дозатор/i.test(cv)) k = 'ХД-' + k;
                        H.set(k, (H.get(k) || 0) + J * L); (src[k] = src[k] || []).push(sn.trim() + ': ' + J + ' × ' + o3n(L));
                    }
                });
            });
            return { H: H, src: src, warn: warn, mon: mon };
        }
        // ---------------- 3) «Затраты» — pivot kesh ----------------
        function o3Val(e: Element): any { const t = e.localName, v = e.getAttribute('v'); if (t === 'm') return null; if (t === 'n') return Number(v); if (t === 'b') return v === '1'; return v; }
        function os3Caches(buf: ArrayBuffer): any[] {
            const z = new O3.JSZip(o3Bin(buf)), P = new DOMParser(), out: any[] = [];
            Object.keys(z.files).filter(n => /pivotCacheDefinition\d+\.xml$/.test(n)).sort().forEach(n => {
                const d = P.parseFromString(z.file(n).asText(), 'application/xml'), ws = d.getElementsByTagName('worksheetSource')[0];
                const fields = Array.from(d.getElementsByTagName('cacheField')).map(cf => { const si = cf.getElementsByTagName('sharedItems')[0]; return { name: cf.getAttribute('name') || '', items: si ? Array.from(si.children).map(o3Val) : [] }; });
                const rf = z.file(n.replace('Definition', 'Records')); if (!rf) return;
                const rd = P.parseFromString(rf.asText(), 'application/xml'), recs: any[] = [];
                Array.from(rd.getElementsByTagName('r')).forEach(r => { const o: any = {}; Array.from(r.children).forEach((c, i) => { const f = fields[i]; if (!f) return; o[f.name] = c.localName === 'x' ? f.items[+(c.getAttribute('v') || 0)] : o3Val(c); }); recs.push(o); });
                out.push({ sheet: ws ? ws.getAttribute('sheet') : null, ref: ws ? ws.getAttribute('ref') : null, recs: recs });
            });
            return out;
        }
        function os3Zatrat(buf: ArrayBuffer): any {
            const cs = os3Caches(buf); if (!cs.length) throw new Error('«Затраты» faylida xom jadval (svodnaya keshi) topilmadi');
            const src = cs.find(c => c.sheet === 'свод') || cs.reduce((a, b) => b.recs.length > a.recs.length ? b : a);
            const s16 = new Map<string, number>(); let zp = 0, sc = 0, n = 0;
            const nk = (v: any) => typeof v === 'number' ? String(v) : o3s(v);
            src.recs.forEach((r: any) => {
                if (nk(r['ш\\з Б']) !== '2220' || nk(r['цех']) !== '92') return; n++;
                const cat = o3s(r['что']), v = r['сумма с 16'] || 0;
                if (cat.startsWith('03')) zp += v; else if (cat.startsWith('04')) sc += v;
                else if (cat.startsWith('07 спецпитание БП с/налог')) sc += v; else if (cat.startsWith('07 спецпитание БП')) zp += v;
                else { const k = o3k(r['ш\\з']); s16.set(k, (s16.get(k) || 0) + v); }
            });
            if (!n) throw new Error('«Затраты» faylida 2220 / 92-sex qatorlari topilmadi');
            return { s16: s16, zp: zp, sc: sc, src: src.sheet };
        }
        // ---------------- Inventar raqami — vagon pasportidan ----------------
        function os3InvOf(k: string): string {
            if (OS3.inv[k]) return OS3.inv[k];
            try {
                const hd = k.startsWith('ХД-'), no = k.replace('ХД-', '').replace(/^0+/, ''), L = typeof O3.onlyVagons === 'function' ? O3.onlyVagons() : [];
                const c = L.filter((v: any) => String(O3.vagonNo(v)).replace(/^0+/, '') === no && (!hd || /xopper|hopper|хоппер|дозатор/i.test(String(v.type || ''))));
                const v = c.length === 1 ? c[0] : c.find((x: any) => !hd || x); return v && v.inv ? String(v.inv).trim() : '';
            } catch (e) { return ''; }
        }
        // ---------------- Hisob (os3gen.py bilan 1:1) ----------------
        function os3Split(total: number, W: Map<string, number>): Map<string, number> {
            let S = 0; W.forEach(w => { S += w; }); const out = new Map<string, number>(); W.forEach((w, k) => out.set(k, o3r2(total * w / S)));
            let t = 0; out.forEach(v => { t += v; }); const d = o3r2(total - t);
            if (d) { let big = '', bw = -Infinity; W.forEach((w, k) => { if (w > bw) { bw = w; big = k; } }); out.set(big, o3r2((out.get(big) || 0) + d)); }
            return out;
        }
        function os3Calc(M: any, N: any, Z: any): any {
            const warn: string[] = N.warn.slice(), V: any[] = [];
            N.H.forEach((h: number, v: string) => {
                const inv = os3InvOf(v); if (!inv) { warn.push('⚠️ ' + v + ' — inventar raqami pasportda yoʻq (pastda qoʻlda kiriting)'); V.push({ v: v, inv: '', sh: '', H: h, noinv: 1 }); return; }
                const sh = '222' + String(inv).replace(/\D/g, '').slice(-3);
                if (!Z.s16.has(sh) && !M.rows[sh]) warn.push('⚠️ ' + v + ' (inv ' + inv + ') — ШПЗ ' + sh + ' boʻyicha material topilmadi');
                V.push({ v: v, inv: inv, sh: sh, H: h });
            });
            const ok = V.filter(x => !x.noinv), used = new Set(ok.map(x => x.sh));
            const left: any[] = []; Array.from(Z.s16.keys()).sort().forEach((k: any) => { const s = Z.s16.get(k); if (/^222\d{3}$/.test(k) && !used.has(k) && k !== '222000' && Math.abs(s) > 0.004) left.push({ sh: k, D: o3r2(s) }); });
            const I = new Map<string, number>(); ok.forEach(x => I.set(x.v, x.H)); let HT = 0; I.forEach(w => { HT += w; });
            const zp = HT ? os3Split(Z.zp, I) : new Map(), sc = HT ? os3Split(Z.sc, I) : new Map();
            ok.forEach(x => {
                const it = M.rows[x.sh] || []; let f = 0; it.forEach((r: any) => { f += r.sum; }); x.F = o3r2(f); x.items = it;
                x.D0 = o3r2(Z.s16.get(x.sh) || 0); x.I = HT ? x.H / HT : 0; x.tuz = OS3.tuz.filter((t: any) => t.v === x.v && +t.s);
                let td = 0; x.tuz.forEach((t: any) => { td += +t.s; }); x.D = o3r2(x.D0 + td);
                x.ZP = zp.get(x.v) || 0; x.SC = sc.get(x.v) || 0; x.T = o3r2(x.D + x.ZP + x.SC);
            });
            let tF = 0, tD = 0; ok.forEach(x => { tF += x.F; tD += x.D; }); left.forEach(l => { tD += l.D; });
            const tot = { F: tF, D: tD, H: HT, ZP: Z.zp, SC: Z.sc, T: o3r2(tD + Z.zp + Z.sc) };
            if (!N.H.size) warn.push('⚠️ Naryadlarda toʻlovga kiritilgan «Кап.рем … зав.№» qatori topilmadi');
            return { V: V, ok: ok, left: left, tot: tot, warn: warn };
        }

        // ---------------- Excel (muallif shabloni) ----------------
        function o3Col(i: number): string { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
        // uslublar: 0 oddiy · 1 sarlavha (ramka, qalin, markaz, oʻrash) · 2 ramka markaz · 3 ramka markaz #,##0.00 · 4 ramka oʻrash · 5 ramka qalin · 6 ramka qalin markaz #,##0.00
        // 7 ramka · 8 qalin 12 markaz · 9 oʻngga · 10 markaz · 11 ramka #,##0.00 · 12 ramka 0.0000 · 13 ramka qalin #,##0.00 · 14 qalin 12
        function o3Styles(): string {
            const b = '<border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>';
            const xf = (f: number, n: number, br: number, al: string) => `<xf numFmtId="${n}" fontId="${f}" fillId="0" borderId="${br}" xfId="0"${n ? ' applyNumberFormat="1"' : ''}${f ? ' applyFont="1"' : ''}${br ? ' applyBorder="1"' : ''}${al ? ' applyAlignment="1">' + al + '</xf>' : '/>'}`;
            const C = '<alignment horizontal="center" vertical="center"/>', CW = '<alignment horizontal="center" vertical="center" wrapText="1"/>', W = '<alignment vertical="center" wrapText="1"/>';
            const xs = [xf(0, 0, 0, ''), xf(1, 0, 1, CW), xf(0, 0, 1, C), xf(0, 4, 1, C), xf(0, 0, 1, W), xf(1, 0, 1, ''), xf(1, 4, 1, C), xf(0, 0, 1, ''), xf(2, 0, 0, '<alignment horizontal="center"/>'), xf(0, 0, 0, '<alignment horizontal="right"/>'), xf(0, 0, 0, '<alignment horizontal="center"/>'), xf(0, 4, 1, ''), xf(0, 164, 1, ''), xf(1, 4, 1, ''), xf(2, 0, 0, '')];
            return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0000"/></numFmts><fonts count="3"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="12"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${b}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xs.length}">${xs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
        }
        function o3Sheet(rows: any[], o: any): string {
            const X = (s: any) => O3.xmlEsc(s);
            const cell = (v: any, ref: string, st: number) => v == null || v === '' ? `<c r="${ref}" s="${st}"/>` : (typeof v === 'number' && isFinite(v)) ? `<c r="${ref}" s="${st}"><v>${v}</v></c>` : `<c r="${ref}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${X(v)}</t></is></c>`;
            const data = rows.map(r => `<row r="${r.r}"${r.h ? ` ht="${r.h}" customHeight="1"` : ''}>` + r.c.map((c: any) => cell(c[1], o3Col(c[0]) + r.r, c[2])).join('') + '</row>').join('');
            const cols = '<cols>' + o.w.map((w: number, i: number) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols>';
            const mg = o.merge && o.merge.length ? `<mergeCells count="${o.merge.length}">${o.merge.map((m: string) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
            const pm = o.port ? '<printOptions horizontalCentered="1"/><pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>' : '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>';
            return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${data}</sheetData>${mg}${pm}<pageSetup paperSize="9" orientation="${o.port ? 'portrait' : 'landscape'}" fitToWidth="1" fitToHeight="${o.port ? 1 : 0}"/></worksheet>`;
        }
        function os3SvodRows(d: any, oy: string): any[] {
            const R: any[] = []; R.push({ r: 1, c: [[0, 'ОС - 3 за ' + oy + ' г.', 14]] });
            R.push({ r: 3, c: ['№', '№ вагона', 'Инв №', 'ШПЗ', 'Материалы (М-30)', 'Материалы с ТЗР', 'сумма наряде', 'Доля', 'Зар. Плата', 'Соц. Страх', 'Общий'].map((t, i) => [i, t, 1]) });
            const t = d.tot; R.push({ r: 4, c: [[0, '', 7], [1, '', 7], [2, '', 7], [3, 'ИТОГО', 5], [4, t.F, 13], [5, t.D, 13], [6, t.H, 13], [7, 1, 5], [8, t.ZP, 13], [9, t.SC, 13], [10, t.T, 13]] });
            let r = 5; d.ok.forEach((x: any, n: number) => { R.push({ r: r++, c: [[0, n + 1, 7], [1, x.v, 7], [2, isFinite(+x.inv) ? +x.inv : x.inv, 7], [3, x.sh, 7], [4, x.F, 11], [5, x.D, 11], [6, o3r2(x.H), 11], [7, x.I, 12], [8, x.ZP, 11], [9, x.SC, 11], [10, x.T, 11]] }); });
            d.left.forEach((l: any, n: number) => { R.push({ r: r++, c: [[0, d.ok.length + n + 1, 7], [1, 'qoldiq', 7], [2, '', 7], [3, l.sh, 7], [4, '', 7], [5, l.D, 11], [6, '', 7], [7, '', 7], [8, '', 7], [9, '', 7], [10, l.D, 11]] }); });
            r++; R.push({ r: r, c: [[0, 'Инженер по вагонам ПТО', 0], [5, '____________', 0]] });
            const notes = d.ok.flatMap((x: any) => x.tuz.map((t2: any) => '✏️ ' + x.v + ': shifr zatrat tuzatishi ' + o3n(+t2.s) + ' soʻm — ' + t2.iz)).concat(d.warn, d.left.map((l: any) => 'ℹ️ Qolib ketgan materiallar (roʻyxatda yoʻq ШПЗ): ' + l.sh + ' — ' + o3n(l.D) + ' soʻm'));
            if (notes.length) { r += 2; R.push({ r: r, c: [[0, 'Tekshiruv:', 14]] }); notes.forEach((s: string) => { r++; R.push({ r: r, c: [[0, s, 0]] }); }); }
            return R;
        }
        var OS3_SIGN = ['Начальник ПТО', 'Инженер по вагонам ПТО', 'Бухгалтер', 'Экономист '];
        function os3VagRows(x: any, oy: string): any { // muallif shabloni («4372», 28.10.2026)
            const hd = x.v.startsWith('ХД'), no = x.v.replace('ХД-', ''), R: any[] = [];
            R.push({ r: 2, h: 15.75, c: [[0, 'Капитальный ремонт ' + (hd ? 'Хоппер-дозатор' : 'Думпкар типа ' + OS3.tur + '.') + ' № ' + no, 8]] });
            R.push({ r: 4, c: [[0, 'Зав.№ ' + no, 0], [4, 'Инв № ' + x.inv, 9]] }); R.push({ r: 5, c: [[0, oy + ' год.', 10]] });
            R.push({ r: 6, h: 30, c: ['№  п/п', 'Материалы, зап. Части', 'Ед. изм.', ' Кол-во', 'Цена, сум', 'Сумма, сум'].map((t, i) => [i, t, 1]) });
            let r = 7; x.items.forEach((it: any, n: number) => { R.push({ r: r, h: it.name.length > 38 ? 30 : 0, c: [[0, n + 1, 2], [1, it.name, 4], [2, it.ed, 2], [3, it.qty, 2], [4, it.price, typeof it.price === 'number' ? 3 : 2], [5, it.sum, 3]] }); r++; });
            const line = (a: any, b: any, f: any, bs: number, fs: number) => { R.push({ r: r, c: [[0, a, 2], [1, b, bs], [2, '', 2], [3, '', 2], [4, '', 2], [5, f, fs]] }); r++; };
            line('', 'ИТОГО:', x.F, 5, 6); x.tuz.forEach((t: any) => line('', 'Корректировка шифра затрат: ' + t.iz, +t.s, 4, 3));
            line(1, 'материалы в т.ч. и ТЗР', x.D, 7, 3); line(2, 'Заработная плата ', x.ZP, 7, 3); line(3, 'Отчисления соц.страх', x.SC, 7, 3); line('', 'Итого затрат:', x.T, 5, 6);
            r += 2; OS3_SIGN.forEach(s => { R.push({ r: r, c: [[1, s, 0], [5, '____________', 0]] }); r += 2; });
            return R;
        }
        function os3Xlsx(d: any, oy: string): Blob {
            const sh: any[] = [{ name: 'ОС-3', xml: o3Sheet(os3SvodRows(d, oy), { w: [5, 11, 9, 9, 18, 18, 15, 8, 15, 14, 18] }) }];
            d.ok.forEach((x: any) => sh.push({ name: String(x.v).slice(0, 28), xml: o3Sheet(os3VagRows(x, oy), { w: [6.0, 44.86, 8.0, 10.0, 16.29, 18.0], merge: ['A2:F2', 'E4:F4', 'A5:F5'], port: 1 }) }));
            const X = (s: any) => O3.xmlEsc(s), ct = sh.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
            return O3.zipBlob([
                { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${ct}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>` },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sh.map((s, i) => `<sheet name="${X(s.name.replace(/[\\/?*[\]:]/g, ' '))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
                { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sh.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sh.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
                { name: 'xl/styles.xml', data: o3Styles() }
            ].concat(sh.map((s, i) => ({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: s.xml }))), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        // ---------------- PDF (chop etish uchun) ----------------
        function os3Html(d: any, oy: string): string {
            const td = 'border:1px solid #000;padding:2px 4px', c = td + ';text-align:center', rr = td + ';text-align:right';
            let h = `<div style="page-break-after:always;font-family:Calibri,Arial,sans-serif;font-size:10pt"><p><b>ОС - 3 за ${o3E(oy)} г.</b></p><table style="width:100%;border-collapse:collapse"><tr>${['№', '№ вагона', 'Инв №', 'ШПЗ', 'Материалы (М-30)', 'Материалы с ТЗР', 'сумма наряде', 'Доля', 'Зар. Плата', 'Соц. Страх', 'Общий'].map(t => `<th style="${c}">${t}</th>`).join('')}</tr>`;
            const t = d.tot; h += `<tr style="font-weight:bold"><td style="${td}"></td><td style="${td}"></td><td style="${td}"></td><td style="${td}">ИТОГО</td><td style="${rr}">${o3n(t.F)}</td><td style="${rr}">${o3n(t.D)}</td><td style="${rr}">${o3n(t.H)}</td><td style="${c}">1</td><td style="${rr}">${o3n(t.ZP)}</td><td style="${rr}">${o3n(t.SC)}</td><td style="${rr}">${o3n(t.T)}</td></tr>`;
            d.ok.forEach((x: any, n: number) => { h += `<tr><td style="${c}">${n + 1}</td><td style="${td}">${o3E(x.v)}</td><td style="${td}">${o3E(x.inv)}</td><td style="${td}">${x.sh}</td><td style="${rr}">${o3n(x.F)}</td><td style="${rr}">${o3n(x.D)}</td><td style="${rr}">${o3n(x.H)}</td><td style="${c}">${o3n(x.I, 4)}</td><td style="${rr}">${o3n(x.ZP)}</td><td style="${rr}">${o3n(x.SC)}</td><td style="${rr}">${o3n(x.T)}</td></tr>`; });
            d.left.forEach((l: any, n: number) => { h += `<tr><td style="${c}">${d.ok.length + n + 1}</td><td style="${td}">qoldiq</td><td style="${td}"></td><td style="${td}">${l.sh}</td><td style="${td}"></td><td style="${rr}">${o3n(l.D)}</td><td style="${td}" colspan="4"></td><td style="${rr}">${o3n(l.D)}</td></tr>`; });
            h += `</table><p style="margin-top:14px">Инженер по вагонам ПТО &nbsp; ____________</p></div>`;
            d.ok.forEach((x: any, i: number) => {
                const hd = x.v.startsWith('ХД'), no = x.v.replace('ХД-', '');
                h += `<div style="${i < d.ok.length - 1 ? 'page-break-after:always;' : ''}font-family:Calibri,Arial,sans-serif;font-size:10.5pt"><p style="text-align:center;font-size:12pt"><b>Капитальный ремонт ${hd ? 'Хоппер-дозатор' : 'Думпкар типа ' + o3E(OS3.tur) + '.'} № ${o3E(no)}</b></p><table style="width:100%"><tr><td>Зав.№ ${o3E(no)}</td><td style="text-align:right">Инв № ${o3E(x.inv)}</td></tr></table><p style="text-align:center;margin:2px">${o3E(oy)} год.</p>
                    <table style="width:100%;border-collapse:collapse"><tr>${['№  п/п', 'Материалы, зап. Части', 'Ед. изм.', ' Кол-во', 'Цена, сум', 'Сумма, сум'].map(t2 => `<th style="${c}">${t2}</th>`).join('')}</tr>`
                    + x.items.map((it: any, n: number) => `<tr><td style="${c}">${n + 1}</td><td style="${td}">${o3E(it.name)}</td><td style="${c}">${o3E(it.ed)}</td><td style="${c}">${o3E(it.qty)}</td><td style="${c}">${o3n(it.price)}</td><td style="${c}">${o3n(it.sum)}</td></tr>`).join('')
                    + `<tr><td style="${td}"></td><td style="${td}"><b>ИТОГО:</b></td><td style="${td}" colspan="3"></td><td style="${c}"><b>${o3n(x.F)}</b></td></tr>`
                    + x.tuz.map((t2: any) => `<tr><td style="${td}"></td><td style="${td}">Корректировка шифра затрат: ${o3E(t2.iz)}</td><td style="${td}" colspan="3"></td><td style="${c}">${o3n(+t2.s)}</td></tr>`).join('')
                    + [['1', 'материалы в т.ч. и ТЗР', x.D], ['2', 'Заработная плата', x.ZP], ['3', 'Отчисления соц.страх', x.SC]].map(z => `<tr><td style="${c}">${z[0]}</td><td style="${td}">${z[1]}</td><td style="${td}" colspan="3"></td><td style="${c}">${o3n(+z[2])}</td></tr>`).join('')
                    + `<tr><td style="${td}"></td><td style="${td}"><b>Итого затрат:</b></td><td style="${td}" colspan="3"></td><td style="${c}"><b>${o3n(x.T)}</b></td></tr></table>`
                    + `<table style="width:100%;margin-top:22px">${OS3_SIGN.map(s => `<tr><td style="padding:8px 0">${o3E(s)}</td><td style="text-align:right">____________</td></tr>`).join('')}</table></div>`;
            });
            return h;
        }

        // ---------------- Oyna ----------------
        function os3OyName(m: string): string { const R = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'], a = String(m || '').split('-'); return a.length === 2 ? R[+a[1] - 1] + ' ' + a[0] : m; }
        // 5.2: oyni fayllarning oʻzidan aniqlash (M-30 davri — eng ishonchli; keyin «Затраты за MM.YYYY»; keyin naryad sarlavhasi/nomi)
        const OS3_OY: any[] = [[/январ|yanvar/i, 1], [/феврал|fevral/i, 2], [/март|mart/i, 3], [/апрел|aprel/i, 4], [/(?:^|[^а-яёa-z])(?:ма[йя]|may)(?![а-яёa-z])/i, 5], [/июн|iyun/i, 6], [/июл|iyul/i, 7], [/август|avgust/i, 8], [/сентябр|sentyabr/i, 9], [/октябр|oktyabr/i, 10], [/ноябр|noyabr/i, 11], [/декабр|dekabr/i, 12]];
        function os3Ym(y: any, m: any): string { const Y = +y, M = +m; return Y >= 2000 && Y < 2100 && M >= 1 && M <= 12 ? Y + '-' + String(M).padStart(2, '0') : ''; }
        function os3MonOf(t: any): string {
            const s = String(t || ''); let m: any;
            if ((m = s.match(/(\d{1,2})\.(\d{1,2})\.(20\d{2})/))) return os3Ym(m[3], m[2]);
            if ((m = s.match(/(20\d{2})[\/.\-](\d{1,2})[\/.\-]\d{1,2}/))) return os3Ym(m[1], m[2]);
            if ((m = s.match(/(?:^|\D)(\d{1,2})[.\-_](20\d{2})(?!\d)/))) return os3Ym(m[2], m[1]);
            const y = s.match(/20\d{2}/); if (y) { const w = OS3_OY.find((x: any) => x[0].test(s)); if (w) return os3Ym(y[0], w[1]); }
            return '';
        }
        // fayllardan oy: { m, src, all: [[manba, oy]…] }
        function os3FileMon(): any {
            const f = OS3.f, all: any[] = [];
            try { if (f.m30) { const M = OS3.M && OS3.M._b === f.m30.buf ? OS3.M : os3M30(f.m30.buf); M._b = f.m30.buf; OS3.M = M; const m = os3MonOf(M.per); if (m) all.push(['M-30', m]); } } catch (e) { /* */ }
            try { if (f.zat) { const m = os3MonOf(f.zat.name); if (m) all.push(['«Затраты»', m]); } } catch (e) { /* */ }
            try { (f.nar || []).forEach((x: any) => { const m = os3MonOf(x.name); if (m) all.push(['naryad', m]); }); } catch (e) { /* */ }
            try { if (f.nar && f.nar.length && OS3.N && OS3.N.mon) { const m = os3MonOf(OS3.N.mon); if (m) all.push(['naryad', m]); } } catch (e) { /* */ }
            return { m: all.length ? all[0][1] : '', src: all.length ? all[0][0] : '', all: all };
        }
        function os3PrevMonth(): string { const t = new Date(); t.setDate(1); t.setMonth(t.getMonth() - 1); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); }
        function os3Open(): void {
            if (!OS3.m) OS3.m = os3PrevMonth();
            const f = OS3.f, nm = (x: any) => x ? '✅ ' + o3E(x.name) : '<i>tanlanmagan</i>';
            O3.mdl('os3M', `<div class="px-h"><b>📊 ОС-3 tayyorlash</b><button class="mini-btn" onclick="mdlClose('os3M')">✕</button></div>
                <div class="nd-tip">Har oy uchta faylni yuklang — ilova ОС-3 yigʻma jadvali va har vagonga kalkulyatsiyani tayyorlaydi. Fayllar telefonda qayta ishlanadi, hech qayerga yuborilmaydi.</div>
                <label class="kq-l">Oy<input type="month" id="os3Mon" value="${o3E(OS3.m)}" onchange="OS3.m=this.value;OS3.mHand=1"></label>${OS3.fm && OS3.fm.m ? `<small class="os3-mm">${OS3.fm.m === OS3.m ? '📅 Oy fayldan aniqlandi (' + o3E(OS3.fm.src) + ')' : '⚠️ Fayllar — ' + o3E(os3OyName(OS3.fm.m)) + ' (' + o3E(OS3.fm.src) + '), tanlangan oy boshqa'}</small>` : ''}
                <div class="os3-f"><b>1. M-30</b> (1С «Требование»)<small>${nm(f.m30)}</small><label class="alb-btn">📂 Tanlash<input type="file" accept=".xls,.xlsx" style="display:none" onchange="os3Pick('m30',this)"></label></div>
                <div class="os3-f"><b>2. Brigada naryadlari</b> (bir nechta fayl)<small>${f.nar.length ? f.nar.map((x: any) => '✅ ' + o3E(x.name)).join('<br>') : '<i>tanlanmagan</i>'}</small><label class="alb-btn">📂 Tanlash<input type="file" multiple accept=".xls,.xlsx" style="display:none" onchange="os3Pick('nar',this)"></label></div>
                <div class="os3-f"><b>3. «Затраты»</b> (smeta, 2220 jadval)<small>${nm(f.zat)}</small><label class="alb-btn">📂 Tanlash<input type="file" accept=".xlsx" style="display:none" onchange="os3Pick('zat',this)"></label></div>
                <label class="kq-l">Vagon turi (sarlavha uchun)<input id="os3Tur" value="${o3E(OS3.tur)}" onchange="OS3.tur=this.value.trim()||'2ВС-105т'"></label>
                <button class="action-btn" onclick="os3Run()">🧮 Hisoblash</button><div id="os3Res"></div>`, true);
            if (OS3.d) os3Show();
        }
        async function os3Pick(k: string, el: any): Promise<void> {
            const L = Array.from(el.files || []) as any[]; if (!L.length) return;
            const rd = async (x: any) => ({ name: x.name, buf: await x.arrayBuffer() });
            if (k === 'nar') OS3.f.nar = await Promise.all(L.map(rd)); else OS3.f[k] = await rd(L[0]);
            OS3.d = null; OS3.fm = os3FileMon();
            if (OS3.fm.m && !OS3.mHand && OS3.fm.m !== OS3.m) { OS3.m = OS3.fm.m; try { O3.showToast('📅 Oy fayldan aniqlandi: ' + os3OyName(OS3.m)); } catch (e) { /* */ } }
            os3Open();
        }
        function os3Run(): void {
            const f = OS3.f; if (!f.m30 || !f.nar.length || !f.zat) { O3.alert('Uchala fayl kerak: M-30, naryadlar va «Затраты».'); return; }
            try {
                OS3.M = os3M30(f.m30.buf); OS3.M._b = f.m30.buf; OS3.N = os3Naryad(f.nar); OS3.Z = os3Zatrat(f.zat.buf);
                OS3.fm = os3FileMon();
                if (OS3.fm.m && OS3.fm.m !== OS3.m && confirm('Fayllar — ' + os3OyName(OS3.fm.m) + ' (' + OS3.fm.src + '), tanlangan oy — ' + os3OyName(OS3.m) + '.\n\nOy «' + os3OyName(OS3.fm.m) + '» ga oʻzgartirilsinmi?')) { OS3.m = OS3.fm.m; OS3.mHand = 0; const i = O3.$id('os3Mon'); if (i) i.value = OS3.m; }
                OS3.d = os3Calc(OS3.M, OS3.N, OS3.Z); os3Show();
            } catch (e) { console.error(e); O3.alert('⚠️ ' + (e && (e as any).message ? (e as any).message : String(e))); }
        }
        function os3Re(): void { if (OS3.M) { OS3.d = os3Calc(OS3.M, OS3.N, OS3.Z); os3Show(); } }
        function os3SetInv(v: string, val: string): void { OS3.inv[v] = String(val || '').trim(); os3Re(); }
        function os3TuzAdd(): void {
            const vs = OS3.d ? OS3.d.ok.map((x: any) => x.v) : []; if (!vs.length) return;
            O3.mdl('os3T', `<div class="px-h"><b>✏️ Shifr zatrat tuzatishi</b><button class="mini-btn" onclick="mdlClose('os3T')">✕</button></div>
                <div class="nd-tip">Buxgalteriya materialni boshqa shifrga oʻtkazgan boʻlsa (masalan, kislorod 222000 → 222111) — summa shu vagonning «ТЗР bilan materiallar»iga qoʻshiladi va hujjatda alohida qator boʻlib chiqadi.</div>
                <label class="kq-l">Vagon<select id="os3Tv">${vs.map((v: string) => `<option>${o3E(v)}</option>`).join('')}</select></label>
                <label class="kq-l">Summa (soʻm; ayirish uchun minus bilan)<input id="os3Ts" type="number" step="0.01"></label>
                <label class="kq-l">Izoh<input id="os3Ti" placeholder="Кислород 36 м3 (222000 → 222111)"></label>
                <div class="nv-btns"><button onclick="os3TuzOk()">✓ Qoʻshish</button></div>`, true);
        }
        function os3TuzOk(): void {
            const v = String((O3.$id('os3Tv') || {}).value || ''), s = Number((O3.$id('os3Ts') || {}).value), iz = String((O3.$id('os3Ti') || {}).value || '').trim();
            if (!v || !isFinite(s) || !s) { O3.alert('Vagon va summani kiriting.'); return; } OS3.tuz.push({ v: v, s: o3r2(s), iz: iz || 'tuzatish' }); O3.mdlClose('os3T'); os3Re();
        }
        function os3TuzDel(i: number): void { OS3.tuz.splice(i, 1); os3Re(); }
        function os3MonWarn(): string {
            const fm = OS3.fm; if (!fm || !fm.all || !fm.all.length) return ''; const w: string[] = [];
            if (fm.m && fm.m !== OS3.m) w.push('⚠️ Tanlangan oy — ' + os3OyName(OS3.m) + ', ' + fm.src + ' esa ' + os3OyName(fm.m) + ' niki.');
            const seen: any = {}; fm.all.forEach((x: any) => { if (x[1] !== fm.m && !seen[x[0] + x[1]]) { seen[x[0] + x[1]] = 1; w.push('⚠️ ' + x[0] + ' — ' + os3OyName(x[1]) + ' (' + fm.src + ' — ' + os3OyName(fm.m) + '): fayl toʻgʻriligini tekshiring.'); } });
            return w.length ? `<div class="os3-w">${w.map(x => '<div>' + o3E(x) + '</div>').join('')}</div>` : '';
        }
        function os3Show(): void {
            const box = O3.$id('os3Res'), d = OS3.d; if (!box || !d) return; const t = d.tot;
            box.innerHTML = `<div class="kq-h">${o3E(os3OyName(OS3.m))} · ${d.ok.length} ta vagon${d.left.length ? ' · ' + d.left.length + ' ta qoldiq' : ''}</div>
                ${OS3.M && OS3.M.per ? `<div class="nd-tip">M-30 davri: ${o3E(OS3.M.per)} · naryad: ${o3E(String(OS3.N.mon || '').slice(0, 70))}</div>` : ''}
                ${os3MonWarn()}
                ${d.warn.length ? `<div class="os3-w">${d.warn.map((w: string) => '<div>' + o3E(w) + '</div>').join('')}</div>` : '<div class="nd-tip">✅ Tekshiruv: hamma vagonning materiallari va inventar raqami topildi.</div>'}
                <div class="os3-t"><table><tr><th>Vagon</th><th>Inv № / ШПЗ</th><th>ТЗР bilan materiallar</th><th>Naryad · ulush</th><th>Ish haqi</th><th>Soc.strax</th><th>Jami</th></tr>
                ${d.V.map((x: any) => x.noinv ? `<tr class="bad"><td>${o3E(x.v)}</td><td colspan="6"><input placeholder="inventar raqami" onchange="os3SetInv('${o3E(x.v)}',this.value)"></td></tr>`
                : `<tr><td><b>${o3E(x.v)}</b></td><td><input class="os3-inv" value="${o3E(x.inv)}" onchange="os3SetInv('${o3E(x.v)}',this.value)"><small>${x.sh}</small></td><td>${o3n(x.D)}${x.tuz.length ? '<small>✏️ tuzatish bilan</small>' : ''}<small>M-30: ${o3n(x.F)} (${x.items.length} qator)</small></td><td>${o3n(x.H)}<small>${o3n(x.I * 100, 2)}%</small></td><td>${o3n(x.ZP)}</td><td>${o3n(x.SC)}</td><td><b>${o3n(x.T)}</b></td></tr>`).join('')}
                ${d.left.map((l: any) => `<tr class="left"><td>qoldiq</td><td>${l.sh}</td><td>${o3n(l.D)}</td><td colspan="3"><small>oʻtgan oydan qolgan materiallar — faqat materiallar</small></td><td>${o3n(l.D)}</td></tr>`).join('')}
                <tr class="tot"><td>ИТОГО</td><td></td><td>${o3n(t.D)}</td><td>${o3n(t.H)}</td><td>${o3n(t.ZP)}</td><td>${o3n(t.SC)}</td><td>${o3n(t.T)}</td></tr></table></div>
                ${OS3.tuz.length ? `<div class="kq-h">✏️ Shifr zatrat tuzatishlari</div>` + OS3.tuz.map((x: any, i: number) => `<div class="kq-p"><span><b>${o3E(x.v)}: ${o3n(x.s)}</b><small>${o3E(x.iz)}</small></span><button class="mini-btn" onclick="os3TuzDel(${i})">✕</button></div>`).join('') : ''}
                <button class="kq-add" onclick="os3TuzAdd()">✏️ Shifr zatrat tuzatishi qoʻshish</button>
                <div class="cx-bar"><button onclick="os3Out('xlsx')">📊 Excel (chop etishga tayyor)</button><button onclick="os3Out('pdf')">📄 PDF</button></div>`;
        }
        function os3Out(kind: string): void {
            const d = OS3.d; if (!d || !d.ok.length) { O3.alert('Avval hisoblang.'); return; }
            if (d.V.some((x: any) => x.noinv) && !confirm('Inventar raqami kiritilmagan vagon bor — u hujjatga kirmaydi. Davom etilsinmi?')) return;
            const oy = os3OyName(OS3.m), base = 'OS-3_' + OS3.m;
            try {
                const f = kind === 'xlsx' ? { name: base + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: os3Xlsx(d, oy) } : { name: base + '.pdf', mime: 'application/pdf', blob: O3.pdfBlobFromHtml(os3Html(d, oy)) };
                os3Save(); if (typeof O3.exOpen === 'function') O3.exOpen([f], { title: 'ОС-3 — ' + oy, act: 'dl' }); else O3.docDownload([f]);
            } catch (e) { console.error(e); O3.alert('⚠️ ' + String(e)); }
        }
        // Tarix — faqat shu qurilmada (fayllar emas, natija)
        // 5.2: tarixdagi yozuv — ✏️ Tahrirlash: oyni oʻzgartirish yoki oʻchirish
        function os3Hist(): any[] { try { return JSON.parse(localStorage.getItem(OS3_LIST) || '[]') || []; } catch (e) { return []; } }
        function os3Edit(m: string): void {
            const x = os3Hist().find((z: any) => z.m === m); if (!x) return;
            O3.mdl('os3E', `<div class="px-h"><b>✏️ ОС-3 · ${o3E(os3OyName(m))}</b><button class="mini-btn" onclick="mdlClose('os3E')">✕</button></div>
                <div class="nd-tip">${x.n} ta vagon · jami ${o3n(x.T)} · tayyorlangan: ${o3E(String(x.at).slice(0, 10))}</div>
                <label class="kq-l">Oy (toʻgʻrisi)<input type="month" id="os3Em" value="${o3E(m)}"></label>
                <div class="nv-btns"><button onclick="os3EditOk('${o3E(m)}')">💾 Oyni saqlash</button><button onclick="mdlClose('os3E');OS3.m='${o3E(m)}';os3Open()">📂 Ochish</button></div>
                <div class="nv-btns" style="margin-top:10px"><button style="background:#b91c1c" onclick="os3Del('${o3E(m)}')">🗑 Oʻchirish</button></div>`, true);
        }
        function os3EditOk(m: string): void {
            const i = O3.$id('os3Em'), to = i ? String(i.value || '') : ''; if (!/^\d{4}-\d{2}$/.test(to)) { O3.alert('Oyni tanlang.'); return; }
            if (to === m) { O3.mdlClose('os3E'); return; }
            const L = os3Hist(), x = L.find((z: any) => z.m === m); if (!x) return;
            if (L.some((z: any) => z.m === to) && !confirm(os3OyName(to) + ' uchun ОС-3 tarixda bor. Uning oʻrniga shu yozuv qoʻyilsinmi?')) return;
            x.m = to; const N = [x].concat(L.filter((z: any) => z !== x && z.m !== to));
            try { localStorage.setItem(OS3_LIST, JSON.stringify(N.slice(0, 36))); } catch (e) { /* */ }
            if (OS3.m === m) OS3.m = to;
            O3.mdlClose('os3E'); try { O3.showToast('💾 Oy oʻzgartirildi: ' + os3OyName(to)); } catch (e) { /* */ } try { O3.hsRender(); } catch (e) { /* */ }
        }
        function os3Del(m: string): void {
            if (!confirm('ОС-3 · ' + os3OyName(m) + ' tarixdan oʻchirilsinmi? (faqat shu roʻyxatdan; yuklab olingan fayllar oʻz joyida qoladi)')) return;
            try { const L = JSON.parse(localStorage.getItem(OS3_LIST) || '[]') || []; localStorage.setItem(OS3_LIST, JSON.stringify(L.filter((x: any) => x.m !== m))); } catch (e) { /* */ }
            try { O3.mdlClose('os3E'); } catch (e) { /* */ } try { O3.hsRender(); } catch (e) { /* */ }
        }
        function os3Save(): void {
            try { const d = OS3.d, L = JSON.parse(localStorage.getItem(OS3_LIST) || '[]') || []; const o = { m: OS3.m, at: new Date().toISOString(), n: d.ok.length, T: d.tot.T, v: d.ok.map((x: any) => [x.v, x.inv, x.T]), tuz: OS3.tuz };
                localStorage.setItem(OS3_LIST, JSON.stringify([o].concat(L.filter((x: any) => x.m !== OS3.m)).slice(0, 36))); } catch (e) { /* */ }
        }
        Object.assign(O3, { OS3: OS3, os3Del: os3Del, os3Edit: os3Edit, os3EditOk: os3EditOk, os3MonOf: os3MonOf, os3FileMon: os3FileMon, os3Open: os3Open, os3Pick: os3Pick, os3Run: os3Run, os3SetInv: os3SetInv, os3TuzAdd: os3TuzAdd, os3TuzOk: os3TuzOk, os3TuzDel: os3TuzDel, os3Out: os3Out,
            os3M30: os3M30, os3Naryad: os3Naryad, os3Zatrat: os3Zatrat, os3Calc: os3Calc, os3Xlsx: os3Xlsx, os3Html: os3Html });

        // ---------------- Kirish: «📄 Dalolatnomalar» → «📊 ОС-3» ----------------
        (function () {
            try { if (Array.isArray(O3.HS_AKT) && !O3.HS_AKT.some((c: any) => c.k === 'os3')) O3.HS_AKT.push({ k: 'os3', ic: '📊', t: 'ОС-3 (kapital taʼmir xarajatlari)', types: [] }); } catch (e) { /* */ }
            if (typeof O3.hsRender === 'function') O3.hsRender = O3.agmkExtend('hsRender', '5.0: ОС-3 boʻlimi', O3.hsRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try {
                    const HS = O3.HS; if (!HS || HS.tab !== 'akt') return r; const b = O3.secBody ? O3.secBody('screen-hisob') : null; if (!b) return r;
                    let L: any[] = []; try { L = JSON.parse(localStorage.getItem(OS3_LIST) || '[]') || []; } catch (e) { L = []; }
                    if (!HS.akt) { b.querySelectorAll('.hs-grid .hs-card').forEach((c: any) => { if (/HS\.akt='os3'/.test(c.getAttribute('onclick') || '')) { const s = c.querySelector('small'); if (s) s.textContent = L.length ? 'oxirgisi: ' + os3OyName(L[0].m) : 'M-30 + naryad + Затраты'; } }); return r; }
                    if (HS.akt !== 'os3') return r;
                    const back = b.querySelector('.hs-back');
                    b.innerHTML = (back ? back.outerHTML : '') + `<div class="hs-new card-list h9-list"><div class="db-two" onclick="os3Open()"><button class="action-btn" onclick="event.stopPropagation();os3Open()">📊 ОС-3 tayyorlash</button></div></div>
                        ${L.length ? '<div class="hs-list">' + L.map((x: any) => `<div class="hs-row" onclick="OS3.m='${o3E(x.m)}';os3Open()"><b>📊 ОС-3 · ${o3E(os3OyName(x.m))}</b><small>${x.n} ta vagon · jami ${o3n(x.T)} · ${o3E(String(x.at).slice(0, 10))}</small><button class="mini-btn os3-ed" title="Tahrirlash" onclick="event.stopPropagation();os3Edit('${o3E(x.m)}')">✏️ Tahrirlash</button></div>`).join('') + '</div>' : ''}
                        <div class="nd-tip">Har oy: 1С dan M-30, brigada naryadlari va «Затраты за MM.YYYY» faylini yuklang — ilova ОС-3 va vagonlar kalkulyatsiyasini muallif shablonida tayyorlaydi.</div>`;
                    try { if (typeof O3.h9Tpl === 'function') O3.h9Tpl(b); } catch (e) { /* */ }
                } catch (e) { console.error(e); }
                return r;
            });
            const st = document.createElement('style');
            st.textContent = '.os3-mm{display:block;margin:-4px 0 8px;opacity:.9}.hs-row .os3-ed{display:block;margin-top:6px;width:auto}.os3-f{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:8px 0;padding:10px;border-radius:12px;background:rgba(128,128,128,.12)}.os3-f b{flex:1 1 60%}.os3-f small{flex:1 1 100%;opacity:.85}.os3-w{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.5);font-size:13px}.os3-t{overflow-x:auto;margin:8px 0}.os3-t table{border-collapse:collapse;font-size:12px;min-width:640px;width:100%}.os3-t th,.os3-t td{border:1px solid rgba(128,128,128,.4);padding:4px 6px;text-align:right;vertical-align:top}.os3-t th{text-align:center}.os3-t td:first-child{text-align:left}.os3-t small{display:block;opacity:.7}.os3-t tr.tot td{font-weight:700}.os3-t tr.left td{opacity:.8}.os3-t tr.bad td{background:rgba(239,68,68,.15)}.os3-t input{width:80px;font:inherit;padding:2px 4px;border-radius:6px;border:1px solid rgba(128,128,128,.5);background:transparent;color:inherit}';
            document.head.appendChild(st);
        })();
