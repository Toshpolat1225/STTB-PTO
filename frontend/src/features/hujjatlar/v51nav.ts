        // =====================================================================
        // 5.1 — «📊 Dalolatnoma va hisobotlar» ga har yangidan kirganda umumiy sahifa (muallif, 28.10.2026)
        //  Avval: HS.akt / HS.cat / HS.chk xotirada qolib, «Dalolatnomalar» oxirgi ochilgan ichki boʻlimda
        //  (masalan, «ОС-3») ochilardi. Endi openHisob() eskirgan ichki holatni tozalaydi.
        //  Istisno — chaqiruvchi holatni ataylab qoʻygan boʻlsa (Mening ishlarim, AI, bildirishnoma):
        //  holat oxirgi chizilgandan farq qilsa — saqlanadi. Akt oynasidan «‹ Orqaga» (4.9 b114) — HS.keep = 1.
        //  Ichki oʻtishlar (hsRender ni toʻgʻridan-toʻgʻri chaqiradiganlar) va HS.pend oʻzgarmaydi.
        // =====================================================================
        const NV1: any = window as any;
        var NV1_LAST: any = { akt: null, cat: null, chk: null };
        if (typeof NV1.hsRender === 'function') NV1.hsRender = NV1.agmkExtend('hsRender', '5.1: oxirgi koʻrsatilgan holat', NV1.hsRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const H = NV1.HS; if (H) NV1_LAST = { akt: H.akt, cat: H.cat, chk: H.chk }; } catch (e) { /* */ }
            return r;
        });
        if (typeof NV1.openHisob === 'function') NV1.openHisob = NV1.agmkExtend('openHisob', '5.1: har kirishda umumiy sahifa', NV1.openHisob, (o: Function) => function (this: unknown) {
            try {
                const H = NV1.HS;
                if (H) {
                    if (H.keep) H.keep = 0;
                    else if (H.akt === NV1_LAST.akt && H.cat === NV1_LAST.cat && H.chk === NV1_LAST.chk) { H.akt = null; H.cat = null; H.chk = null; }
                }
            } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });
