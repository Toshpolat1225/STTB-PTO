        // =====================================================================
        // 6.2 — 📅 HAFTALIK RASXOD — har bir yoʻnalish uchun alohida (muallif, 16.11.2026)
        //  • Har yoʻnalishning oʻz skladlari, oʻz haftalari tarixi (kv:agmk_yon_wk_<yoʻnalish>; serverda faqat ICHTB va rahbariyat).
        //    «Temir yoʻl harakat tarkibi» — avvalgi maʼlumot (agmk_weekly_v1) oʻz joyida qoladi.
        //  • ШПЗ qoidasi: hammada 221, 222, 08100 (bizniki); Avtomatlashtirish — faqat 221000.
        //    Qoʻlqop, perchatka, sovun, vetosh — hech bir yoʻnalishda qoʻshilmaydi (ШПЗ 221 bilan urilgan boʻlsa ham, nomi boʻyicha).
        //  • Umumiy skladlar (boshqa yoʻnalishlar ham oladi) — alohida satrda: muhandis koʻzdan kechiradi.
        // =====================================================================
        const YW: any = window as any;
        const YW_EXNAME = /(qo.lqop|рукавиц|перчат|perchat|мыло|sovun|ветош|vetosh)/i;
        var YON_WK: any = {
            vag: { skl: ['9201', '9202', '9203', '9205', '9208'] },
            tor: { skl: ['3002', '3003', '3009', '3010', '1013', '1003'] },
            qur: { skl: ['3110', '3118', '3113', '3117', '4002'] },
            smb: { skl: ['3140'], exact: ['221000'], exName: YW_EXNAME, label: '221000 (joriy taʼmir)' },
            tep: { skl: ['3001', '3330', '3130', '3380'], shared: ['3330', '3130', '3380'] },
        };
        function yonWkDir(): string { try { return (YW.HS && YW.HS.yon) || 'vag'; } catch (e) { return 'vag'; } }
        // qoʻlqop, perchatka, sovun, vetosh — hamma yoʻnalishda joriy taʼmirga qoʻshilmaydi (ШПЗ 221 bilan urilgan boʻlsa ham)
        function yonWkRule(): any { const c = YON_WK[yonWkDir()] || {}; return { exact: c.exact, exName: c.exName || YW_EXNAME, label: c.label }; }
        YW.yonWkRule = yonWkRule;
        function yonWkKey(): string { const k = yonWkDir(); return k === 'vag' ? 'agmk_weekly_v1' : 'agmk_yon_wk_' + k; }
        // kalit yoʻnalishga qarab — har bir wkDB/wkSave chaqiruvidan oldin
        function yonWkSync() { try { YW.WK_KEY = yonWkKey(); } catch (e) { /* */ } }
        if (typeof YW.wkDB === 'function') YW.wkDB = YW.agmkExtend('wkDB', '6.2: haftalik rasxod — yoʻnalish skladlari', YW.wkDB, (o: Function) => function (this: unknown) {
            yonWkSync();
            const raw = typeof YW.kvGet === 'function' ? YW.kvGet(YW.WK_KEY, null) : null, d = o.apply(this, arguments), c = YON_WK[yonWkDir()];
            if (!(raw && raw.skl && raw.skl.length)) d.skl = c ? c.skl.slice() : [];
            return d;
        });
        if (typeof YW.wkSave === 'function') YW.wkSave = YW.agmkExtend('wkSave', '6.2: haftalik rasxod — yoʻnalish kaliti', YW.wkSave, (o: Function) => function (this: unknown) { yonWkSync(); return o.apply(this, arguments); });
        function yonWkShared(): string {
            const c = YON_WK[yonWkDir()]; if (!c || !c.shared) return '';
            try {
                const d = YW.wkDB(), rec = d.list.find((x: any) => x.id === YW.WK.sel) || d.list[0]; if (!rec || !rec.res) return '';
                const L = c.shared.filter((k: string) => rec.res[k] && rec.res[k].all);
                if (!L.length) return `<div class="nd-tip" data-yw="shared">ℹ️ Umumiy skladlar (${c.shared.join(', ')}) — bu haftada qator yoʻq.</div>`;
                return `<div class="hp-warn" data-yw="shared">👀 Umumiy skladlardan (boshqa yoʻnalishlar ham oladi) — tekshirib qoʻying: ${L.map((k: string) => '<b>' + k + '</b>: ' + rec.res[k].n + ' qator, ' + YW.wkMoney(rec.res[k].all) + ' soʻm').join(' · ')}</div>`;
            } catch (e) { return ''; }
        }
        if (typeof YW.wkHtml === 'function') YW.wkHtml = YW.agmkExtend('wkHtml', '6.2: haftalik rasxod — yoʻnalish', YW.wkHtml, (o: Function) => function (this: unknown) {
            yonWkSync();
            let h = o.apply(this, arguments);
            try {
                if (YW.HS && YW.HS.yon) h = h.replace(/Haftalik achot/g, 'Haftalik rasxod');
                const s = yonWkShared(); if (s) { const i = h.indexOf('<div class="cx-bar">'); h = i >= 0 ? h.slice(0, i) + s + h.slice(i) : h + s; }
                const c = YON_WK[yonWkDir()];
                if (!c && YW.HS && YW.HS.yon) h = `<div class="nd-tip" data-yw="nocfg">Bu yoʻnalish uchun haftalik rasxod skladlari hali belgilanmagan — Forma-30 yuklab, kerakli skladlarni tanlang (tanlov saqlanadi).</div>` + h;
            } catch (e) { /* */ }
            return h;
        });
        YW.YON_WK = YON_WK;
