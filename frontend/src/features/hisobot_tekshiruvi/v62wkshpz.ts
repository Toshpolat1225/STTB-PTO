        // =====================================================================
        // 6.2 (144) — 📅 HAFTALIK ACHOT: FAQAT ШПЗ 221, 222, 08100 (muallif, 13.11.2026)
        //  Avval: Forma-30 dagi tanlangan skladlarning BARCHA qatorlari summaga qoʻshilardi
        //   (masalan, qoʻlqop, kir sovun kabi boshqa ШПЗ dagi materiallar ham).
        //  Endi: haftalik achotga faqat ШПЗ kodi 221…, 222… yoki 08100… bilan boshlanadigan qatorlar kiradi,
        //   qolganlari hisobga olinmaydi va alohida koʻrsatiladi (nechta qator, qancha soʻm, qaysi kodlar).
        //   5 xonali kod (Excel boshidagi 0 ni tashlab yuborgan: 81000) — 081000 deb oʻqiladi.
        //   Faylda ШПЗ ustuni boʻlmasa — ogohlantirish chiqadi (hammasi hisobga olinadi, avvalgidek).
        //   Bu qoidadan oldin yuklangan haftalar — «qayta yuklang» ogohlantirishi bilan.
        // =====================================================================
        const WS: any = window as any;
        const WS_PFX = ['221', '222', '08100'];
        var WS_LAST: any = null;
        function wsNorm(v: any): string {
            let s = String(v === null || v === undefined ? '' : v).trim().replace(/\s/g, '').replace(/\.0+$/, '');
            if (/^\d{5}$/.test(s)) s = '0' + s;
            return s;
        }
        // 6.2: yoʻnalish qoidasi (v62yonwk.ts): { pfx?: [...], exact?: [...], exName?: RegExp, label?: '...' }
        function wsRule(): any { try { return (typeof WS.yonWkRule === 'function' && WS.yonWkRule()) || null; } catch (e) { return null; } }
        function wsOk(code: string): boolean { const R = wsRule(); if (R && R.exact) return R.exact.indexOf(code) >= 0; return ((R && R.pfx) || WS_PFX).some((p: string) => code.indexOf(p) === 0); }
        function wsExName(n: string): boolean { const R = wsRule(); return !!(R && R.exName && R.exName.test(String(n || ''))); }
        function wsLabel(def?: string): string { const R = wsRule(); return (R && R.label) || (def !== undefined ? def : WS_PFX.map(p => p + '…').join(', ')); }
        function wsNum(v: any): number { return typeof v === 'number' ? v : parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.')) || 0; }
        if (typeof WS.wkParse === 'function') WS.wkParse = WS.agmkExtend('wkParse', '6.2: haftalik achot — faqat ШПЗ 221, 222, 08100', WS.wkParse, (o: Function) => function (this: unknown, rows: any[], skl: any) {
            WS_LAST = null;
            let hi = -1, H: string[] = [];
            for (let i = 0; i < Math.min(rows.length, 40); i++) {
                const r = (rows[i] || []).map((c: any) => String(c || '').trim().toLowerCase());
                if (r.some((c: string) => /^склад/.test(c)) && r.some((c: string) => /дата партии|партия/.test(c)) && r.some((c: string) => /^сумма/.test(c))) { hi = i; H = r; break; }
            }
            if (hi < 0) return o.apply(this, arguments); // sarlavha yoʻq — asl xato xabari
            const iP = H.findIndex(c => /^шпз/.test(c)), iS = H.findIndex(c => /^склад/.test(c)), iSum = H.findIndex(c => /^сумма/.test(c)), iN = H.findIndex(c => /номенклатура/.test(c));
            if (iP < 0) {
                if (wsRule() && wsRule().exName && iN >= 0) { // ШПЗ ustuni yoʻq: hech boʻlmasa nomi boʻyicha (qoʻlqop, sovun, vetosh) chiqariladi
                    const keep0 = rows.slice(0, hi + 1), ex0: any = { n: 0, s: 0, codes: {}, top: [] };
                    for (let i = hi + 1; i < rows.length; i++) { const r = rows[i] || [], nm = String(r[iN] || ''); if (String(r[iS] || '').trim() && wsExName(nm)) { const s0 = wsNum(r[iSum]); ex0.n++; ex0.s += s0; ex0.codes['nomi'] = (ex0.codes['nomi'] || 0) + s0; ex0.top.push({ c: 'nomi', s: s0, n: nm.slice(0, 80) }); } else keep0.push(r); }
                    ex0.top = ex0.top.sort((a: any, b: any) => b.s - a.s).slice(0, 10);
                    const P0 = o.call(this, keep0, skl); P0.rowsAll += ex0.n; P0.fileTotal += ex0.s; WS_LAST = P0.shpz = { none: true, ex: ex0 }; return P0;
                }
                const P = o.call(this, rows, skl); WS_LAST = P.shpz = { none: true }; return P;
            }
            const keep = rows.slice(0, hi + 1), ex: any = { n: 0, s: 0, codes: {}, top: [] };
            for (let i = hi + 1; i < rows.length; i++) {
                const r = rows[i] || [];
                if (!String(r[iS] || '').trim()) { keep.push(r); continue; }
                const c = wsNorm(r[iP]);
                if (wsOk(c) && !(iN >= 0 && wsExName(String(r[iN] || '')))) { keep.push(r); continue; }
                const s = wsNum(r[iSum]), k = c || '—';
                ex.n++; ex.s += s; ex.codes[k] = (ex.codes[k] || 0) + s;
                ex.top.push({ c: k, s: s, n: iN >= 0 ? String(r[iN] || '').slice(0, 80) : '' });
            }
            ex.top = ex.top.sort((a: any, b: any) => b.s - a.s).slice(0, 10);
            const P = o.call(this, keep, skl);
            P.rowsAll += ex.n; P.fileTotal += ex.s; // fayl boʻyicha umumiy maʼlumot — toʻliq
            WS_LAST = P.shpz = { pfx: WS_PFX.slice(), ex: ex, label: wsLabel() };
            return P;
        });
        // yangi yuklash saqlanayotganda — ШПЗ maʼlumoti shu hafta yozuviga
        if (typeof WS.wkSave === 'function') WS.wkSave = WS.agmkExtend('wkSave', '6.2: haftalik achot ШПЗ maʼlumoti', WS.wkSave, (o: Function) => function (this: unknown, d: any) {
            try { if (WS_LAST && d && d.list && d.list[0] && !d.list[0].shpz) d.list[0].shpz = WS_LAST; } catch (e) { /* */ }
            WS_LAST = null;
            return o.apply(this, arguments);
        });
        function wsNote(rec: any): string {
            const E = WS.escapeHtml, M = WS.wkMoney, pf = (rec && rec.shpz && rec.shpz.label) || wsLabel();
            if (!rec) return '';
            if (!rec.shpz) return `<div class="hp-warn" data-ws="old">⚠️ Bu hafta ШПЗ filtrisiz hisoblangan (eski qoida — barcha ШПЗ qoʻshilgan). Toʻgʻri summa uchun shu Forma-30 ni qayta yuklang: endi faqat ${pf} hisobga olinadi.</div>`;
            if (rec.shpz.none) return `<div class="hp-warn" data-ws="none">⚠️ Faylda «ШПЗ» ustuni topilmadi — barcha qatorlar hisobga olindi. Haftalik achot uchun ШПЗ ustuni bor Forma-30 ni yuklang (faqat ${pf}).</div>`;
            const x = rec.shpz.ex || { n: 0, s: 0, codes: {}, top: [] };
            if (!x.n) return `<div class="nd-tip" data-ws="ok">🧾 ШПЗ: faqat ${pf} hisobga olindi. Boshqa ШПЗ dagi qatorlar faylda yoʻq.</div>`;
            const codes = Object.keys(x.codes).sort((a, b) => x.codes[b] - x.codes[a]);
            return `<details class="hs-box" data-ws="ex"><summary class="hs-h" style="cursor:pointer">🧾 ШПЗ: faqat ${pf} hisobga olindi · chiqarib tashlandi ${x.n} ta qator, ${M(x.s)} soʻm</summary>
                <div class="nd-tip">Hisobga olinmagan ШПЗ kodlari: ${codes.slice(0, 20).map(c => '<b>' + E(c) + '</b> — ' + M(x.codes[c])).join(' · ')}${codes.length > 20 ? ' …' : ''}</div>
                ${x.top.map((t: any) => `<div class="pol-v"><small style="flex:1">ШПЗ ${E(t.c)} · ${E(t.n)}</small><b style="min-width:auto">${M(t.s)}</b></div>`).join('')}</details>`;
        }
        if (typeof WS.wkHtml === 'function') WS.wkHtml = WS.agmkExtend('wkHtml', '6.2: haftalik achot ШПЗ izohi', WS.wkHtml, (o: Function) => function (this: unknown) {
            let h = o.apply(this, arguments);
            try {
                const d = WS.wkDB(), rec = d.list.find((x: any) => x.id === WS.WK.sel) || d.list[0], n = wsNote(rec);
                if (n) { const i = h.indexOf('<div class="cx-bar">'); h = i >= 0 ? h.slice(0, i) + n + h.slice(i) : h + n; }
                h = h.replace('Hisob sanasi — fayldagi davr oxiri.</div>', 'Hisob sanasi — fayldagi davr oxiri. ШПЗ: faqat ' + (wsRule() && wsRule().label ? '<b>' + WS.escapeHtml(wsLabel()) + '</b>' : '<b>221</b>, <b>222</b>, <b>08100</b>') + ' — qolganlari (qoʻlqop, kir sovun va h.k.) hisobga olinmaydi.</div>');
            } catch (e) { console.warn('6.2 wk shpz', e); }
            return h;
        });
        if (typeof WS.wkText === 'function') WS.wkText = WS.agmkExtend('wkText', '6.2: haftalik achot ШПЗ', WS.wkText, (o: Function) => function (this: unknown) {
            return o.apply(this, arguments) + '\n\nШПЗ: faqat ' + wsLabel('221, 222, 08100');
        });
