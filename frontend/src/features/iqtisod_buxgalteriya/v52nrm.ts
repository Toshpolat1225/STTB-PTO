        // =====================================================================
        // 5.2 — Tasdiqlangan normalar 2026 va 2027 ilova ichida (muallif, 29.10.2026; docs/REJA_5.2.md 7–8-band)
        //  • Normalar korxona hujjati: GitHub ga tushmaydi — frontend/private/NORMS.json (gitignored), yigʻishda qoʻshiladi.
        //  • «📐 Tasdiqlangan normalar» bazasiga oʻzi qoʻshiladi (bazada shu tur·taʼmir·yil boʻlsa — bazadagisi ustun, ustiga yozilmaydi).
        //    Saqlanmaydi (sinxronga yozuv yoʻq) — har qurilmada bir xil; tahrirlansa — bazaga oʻz nusxasi bilan yoziladi.
        //  • «📚 Normativ hujjatlar» → Vagon: har norma — hujjat (jadvali bilan), 2026 va 2027.
        //  • Achot (hisobot) tekshiruvi: spravka yiliga qarab shu yil normasi (nrmPick) — 2026 → 2026, 2027 → 2027.
        //  • Profilaktik taʼmir va «текущий отцепочный ремонт» = VRP (korxonada TR oʻrnida; docs/REJA_PROBEG_4.4.md) —
        //    norma ham, spravka bloki ham «TR» deb olinadi va tekshiruvga ulanadi.
        // =====================================================================
        const N52: any = window as any;
        var NRM52_SEED: any = __PRIVATE__("NORMS");
        var NRM52_RE = /профилакт|profilakt|текущ\S*\s+отцеп/i;
        try { if (N52.NRM_RT && !N52.NRM_RT.TR) N52.NRM_RT.TR = 'VRP (profilaktik / TR)'; } catch (e) { /* */ }
        if (typeof N52.nrmRt === 'function') N52.nrmRt = N52.agmkExtend('nrmRt', '5.2: profilaktik / TR → VRP', N52.nrmRt, (o: Function) => function (this: unknown, t: any) { const r = o.apply(this, arguments); return r || (NRM52_RE.test(String(t || '')) ? 'TR' : ''); });
        if (typeof N52.hpParseSpr === 'function') N52.hpParseSpr = N52.agmkExtend('hpParseSpr', '5.2: profilaktik spravka → TR', N52.hpParseSpr, (o: Function) => function (this: unknown) {
            const B = o.apply(this, arguments); try { (B || []).forEach((b: any) => { if (b && !b.rtype && NRM52_RE.test(String(b.title || ''))) b.rtype = 'TR'; }); } catch (e) { /* */ } return B;
        });
        var NRM52_SETS: any[] = [];
        (function () {
            try {
                const S = (NRM52_SEED && Array.isArray(NRM52_SEED.sets)) ? NRM52_SEED.sets : [];
                NRM52_SETS = S.map((s: any, i: number) => ({ id: 'nb52_' + i, title: s.title, kind: s.kind, rt: s.rt, year: s.year, file: 'Ilova ichida — tasdiqlangan normalar ' + (s.year || ''), sheet: s.sheet || '', items: s.items || [], at: '2026-10-29T00:00:00.000Z', by: 'Ilova 5.2', ver: 1, builtin: true, hist: [{ at: '2026-10-29T00:00:00.000Z', by: 'Ilova 5.2', a: 'Ilova bilan keldi (' + (s.items || []).length + ' qator)' }] }));
            } catch (e) { NRM52_SETS = []; }
        })();
        /** bazaga ilova normalari qoʻshilgan holda (bazada shu kalitli norma boʻlsa — bazadagisi) */
        if (typeof N52.nrmDB === 'function' && NRM52_SETS.length) N52.nrmDB = N52.agmkExtend('nrmDB', '5.2: ilova ichidagi normalar 2026–2027', N52.nrmDB, (o: Function) => function (this: unknown) {
            const d = o.apply(this, arguments);
            try { const have = new Set((d.sets || []).map((s: any) => N52.nrmSetKey(s))); const ids = new Set((d.sets || []).map((s: any) => s.id));
                NRM52_SETS.forEach((s: any) => { if (!have.has(N52.nrmSetKey(s)) && !ids.has(s.id)) d.sets.push(s); }); } catch (e) { /* */ }
            return d;
        });
        // ---------- «📚 Normativ hujjatlar» — har norma hujjat sifatida ----------
        (function () {
            try {
                if (!Array.isArray(N52.ND_BUILTIN) || !NRM52_SETS.length) return; const E = (s: any) => N52.escapeHtml(String(s == null ? '' : s));
                NRM52_SETS.forEach((s: any, i: number) => {
                    if (N52.ND_BUILTIN.some((d: any) => d.id === 'nrm52_' + i)) return;
                    let lab = ''; try { lab = N52.nrmLabel(s); } catch (e) { lab = String(s.year || ''); }
                    let grp = '';
                    const rows = s.items.map((x: any, k: number) => { const g = x.grp && x.grp !== grp ? (grp = x.grp, `<tr><td colspan="4"><b>${E(x.grp)}</b></td></tr>`) : ''; return g + `<tr><td>${E(x.no || k + 1)}</td><td>${x.alt ? '↳ ' : ''}${E(x.name)}</td><td>${E(x.unit)}</td><td>${E(x.q)}</td></tr>`; }).join('');
                    const tbl = `<table><thead><tr><th>№</th><th>Номланиши / Наименование</th><th>Бирлиги</th><th>Миқдори</th></tr></thead><tbody>${rows}</tbody></table>`;
                    N52.ND_BUILTIN.push({ id: 'nrm52_' + i, code: 'Meʼyor ' + (s.year || '') + (s.kind ? ' · ' + (N52.NRM_KIND && N52.NRM_KIND[s.kind] || s.kind) : ''), cat: 'vagon', year: s.year || 2026, conf: 1, langs: ['uz', 'ru'], short: lab,
                        title: { uz: s.title, ru: s.title },
                        items: [{ t: 'p', n: '', uz: 'Tasdiqlangan sarf meʼyori — ' + lab + '. Hisobot (achot) tekshiruvida spravkadagi «Факт» shu meʼyordan oshmasligi tekshiriladi (spravka yili ' + (s.year || '') + ' boʻlsa).', ru: 'Утверждённая норма расхода — ' + lab + '.' },
                            { t: 'table', n: '1', cap_uz: s.title, cap_ru: s.title, unit_uz: '', unit_ru: '', uz: tbl, ru: tbl }] });
                });
            } catch (e) { console.error(e); }
        })();
        Object.assign(N52, { NRM52_SETS: NRM52_SETS });
