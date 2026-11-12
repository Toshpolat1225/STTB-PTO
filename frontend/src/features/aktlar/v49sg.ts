        // =====================================================================
        // 4.9 b118 — Imzo chekuvchilarni tanlash «Kolodka qabul dalolatnomasi» uslubida — barcha hujjatlar (muallif soʻrovi, 26.10.2026)
        //  AI / qoʻlda akt (TASDIQLOVCHI, KOMISSIYA AʼZOLARI) va Xizmat xati (IMZO CHEKUVCHILAR):
        //   • kartochka: F.I.Sh. qalin, lavozim kichik; ✎ — qayta tanlash, ▲ — yuqoriga, ✕ — olib tashlash
        //   • «➕ Komissiya aʼzosini qoʻshish» / «👤 Tasdiqlovchi rahbarni tanlash» — seh → lavozim → xodim (v.b. avtomatik), agmkPickPerson
        //   • eski imkoniyatlar saqlanadi: «📋 Shablondan» (shablon lavozimlari, hozirgi shtat) va «✍️ Qoʻlda» — kichik havola sifatida
        //  Eski funksiyalar (sgTpl, sgMan, sgShtat, ndComAdd, ndApSet …) oʻzgartirilmaydi — faqat koʻrinish almashadi.
        // =====================================================================
        const SG9: any = window as any;
        function sgkE(s: any): string { return SG9.escapeHtml(String(s == null ? '' : s)); }
        function sgkTab(): string { try { return String((SG9.$id('kqPX') || {}).value || ''); } catch (e) { return ''; } }
        // ✎ / ➕: shtatdan tanlash (k < 0 — yangi qator)
        function sgkPick(ns: string, k: number): void {
            try {
                const A = SG9.sgAcc(ns); A.sync(); const len = A.get().length, at = k < 0 ? (ns === 'ap' ? 0 : len) : k;
                const T = ns === 'ap' ? '👤 Tasdiqlovchi rahbar' : ns === 'com' ? '➕ Komissiya aʼzosi' : '➕ Imzo chekuvchi';
                SG9.agmkPickPerson(T, (p: any) => {
                    const l = String(p.l || '').trim(), vb = /\sv\.?\s?b\.?\s*$|^\s*и\.?\s?о\.?\s/i.test(l);
                    SG9.sgPut(ns, at, { base: SG9.sgBase(l), r: l, n: String(p.n || '').trim(), t: SG9.cleanTabel ? SG9.cleanTabel(sgkTab()) : sgkTab(), m: vb ? 'vb' : 'pick', hint: '' });
                }, A.lang);
            } catch (e) { console.error(e); SG9.alert('⚠️ ' + String(e)); }
        }
        function sgkUp(ns: string, k: number): void { SG9.sgMove(ns, k, -1); }
        function sgkDel(ns: string, k: number): void { if (ns === 'ap') { const A = SG9.sgAcc('ap'); A.sync(); A.set([]); A.re(); return; } SG9.sgDel(ns, k); }
        // Kartochkalar (kolodka: .kq-p / .kq-add)
        function sgkCards(ns: string, rows: any[]): string {
            const card = (x: any, i: number, many: boolean) => `<div class="kq-p sgk-p"><span><b>${many ? (i + 1) + '. ' : ''}${sgkE(x.n || '— tanlang')}</b><small>${sgkE(x.r || '')}${x.m === 'shtat' && x.nf ? ' · ⚠️ shtatda topilmadi' : ''}</small></span>`
                + `<button class="mini-btn" onclick="sgkPick('${ns}',${i})">✎</button>${many && i ? `<button class="mini-btn" onclick="sgkUp('${ns}',${i})">▲</button>` : ''}<button class="mini-btn" onclick="sgkDel('${ns}',${i})">✕</button></div>`;
            if (ns === 'ap') { const a = rows[0]; return a && (a.n || a.r) ? card(a, 0, false) : `<button class="kq-add" onclick="sgkPick('ap',-1)">👤 Tasdiqlovchi rahbarni tanlash</button>`; }
            return (rows.map((x, i) => card(x, i, true)).join('') || '<div class="nd-tip">— hali hech kim qoʻshilmagan</div>')
                + `<button class="kq-add" onclick="sgkPick('${ns}',-1)">➕ ${ns === 'com' ? 'Komissiya aʼzosini' : 'Imzo chekuvchini'} qoʻshish</button>`;
        }
        function sgkLinks(ns: string): string {
            const man = ns === 'ap' ? `ndFormSync(); ND.form.apObj={base:'',r:'',n:'',m:'qolda',t:''}; sgMan('ap',0)` : ns === 'com' ? `ndComCustom()` : `narVtKeep(); NARV.f.sig.push({base:'',r:'',n:'',m:'qolda',t:''}); sgMan('vt', NARV.f.sig.length-1)`;
            return `<div class="sgk-l"><a onclick="sgkTplList('${ns}')">📋 Shablondan</a> · <a onclick="${man}">✍️ Qoʻlda</a>${ns === 'vt' ? ` · <a onclick="narVtKeep(); narVtSigInit(NARV.f, true); narRender()">↺ Shablon boʻyicha qayta</a>` : ''}</div>`;
        }
        // 📋 Shablon lavozimlari roʻyxati (avvalgi «＋ lavozim» tugmalari) — hozirgi shtat boʻyicha egasi bilan
        function sgkTplItems(ns: string): any[] {
            if (ns === 'vt') { const c = SG9.narVtCfg(); return (c.sig || []).map((s: any, i: number) => ({ i: i, t: SG9.sgBase(s[0]) })).filter((z: any) => z.t && z.t.indexOf('{') < 0); }
            const l = SG9.ndLang(), seen = new Set(); return SG9.ndSigners().map((x: any, i: number) => ({ x: x, i: i })).filter((z: any) => { if (z.x.l !== l || !!z.x.ap !== (ns === 'ap')) return false; const k = SG9.normTxt(SG9.sgBase(z.x.r)); if (seen.has(k)) return false; seen.add(k); return true; }).map((z: any) => ({ i: z.i, t: SG9.sgBase(z.x.r) }));
        }
        function sgkTplList(ns: string): void {
            const L = sgkTplItems(ns);
            SG9.mdl('sgkTplM', `<div class="px-h"><b>📋 Shablon lavozimlari</b><button class="mini-btn" onclick="mdlClose('sgkTplM')">✕</button></div>
                <div class="nd-tip">Lavozimni tanlang — egasi hujjat tuzilayotgan kundagi shtatdan qoʻyiladi.</div>
                ${L.map((z: any) => `<div class="sg-opt sm" onclick="sgkTplOk('${ns}',${z.i})">${sgkE(z.t)}</div>`).join('') || '<div class="nd-tip">Shablon lavozimlari yoʻq.</div>'}`, true);
        }
        function sgkTplOk(ns: string, i: number): void {
            SG9.mdlClose('sgkTplM');
            if (ns === 'ap') return SG9.ndApSet(i);
            if (ns === 'com') return SG9.ndComAdd(i);
            const c = SG9.narVtCfg(), s = (c.sig || [])[i]; if (!s) return; SG9.narVtKeep(); NARV_PUSH(SG9.sgFromTpl({ r: s[0], n: s[1] }, 'uz', SG9.narVtCtx()));
        }
        function NARV_PUSH(row: any): void { const f = typeof NARV !== "undefined" && NARV.f; if (!f) return; f.sig = (f.sig || []).concat([row]); SG9.narRender(); }

        // ---- AI / qoʻlda akt: TASDIQLOVCHI va KOMISSIYA bloklari
        if (typeof SG9.ndRenderAkt === 'function') SG9.ndRenderAkt = SG9.agmkExtend('ndRenderAkt', '4.9 b118: imzo chekuvchilar kolodka uslubida', SG9.ndRenderAkt, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const f = typeof ND !== "undefined" && ND.form; if (!f) return r;
                const box = Array.from(document.querySelectorAll('#ndBody .nd-f')) as HTMLElement[], lab = (b: HTMLElement) => ((b.querySelector('label') || {}) as any).textContent || '';
                const ap = box.find(b => /TASDIQLOVCHI/.test(lab(b))), cm = box.find(b => /KOMISSIYA/.test(lab(b)));
                if (ap) ap.innerHTML = `<label>TASDIQLOVCHI («Tasdiqlayman» qismi)</label><div class="sgk">${sgkCards('ap', f.apObj ? [f.apObj] : [])}${sgkLinks('ap')}</div>`;
                if (cm) cm.innerHTML = `<label>KOMISSIYA AʼZOLARI (imzo chekuvchilar)</label><div class="sgk">${sgkCards('com', f.com || [])}${sgkLinks('com')}</div>`;
            } catch (e) { console.error(e); }
            return r;
        });
        // ---- Xizmat xati: IMZO CHEKUVCHILAR
        if (typeof SG9.narVtFormHtml === 'function') SG9.narVtFormHtml = SG9.agmkExtend('narVtFormHtml', '4.9 b118: imzo chekuvchilar kolodka uslubida', SG9.narVtFormHtml, (o: Function) => function (this: unknown) {
            const h = o.apply(this, arguments); const f = typeof NARV !== "undefined" && NARV.f; if (!f || typeof h !== 'string') return h;
            try {
                const a = h.indexOf('<div class="mm-f"><label>IMZO CHEKUVCHILAR'), b = h.indexOf('<div class="hs-acts">', a); if (a < 0 || b < 0) return h;
                return h.slice(0, a) + `<div class="mm-f"><label>IMZO CHEKUVCHILAR</label><div class="sgk">${sgkCards('vt', f.sig || [])}${sgkLinks('vt')}</div></div>` + h.slice(b);
            } catch (e) { console.error(e); return h; }
        });
        Object.assign(SG9, { sgkPick: sgkPick, sgkUp: sgkUp, sgkDel: sgkDel, sgkCards: sgkCards, sgkTplList: sgkTplList, sgkTplOk: sgkTplOk });
        (function () { const st = document.createElement('style'); st.textContent = '.sgk .kq-p span{flex:1 1 auto;min-width:0}.sgk .kq-p .mini-btn{flex:0 0 auto!important;width:auto!important;min-width:36px;padding:6px 10px!important;margin:0!important}.sgk .kq-add{width:100%}.sgk .kq-p small{font-size:12px}.sgk-l{font-size:12px;opacity:.8;text-align:center;margin:2px 0 6px}.sgk-l a{cursor:pointer;text-decoration:underline;color:inherit}'; document.head.appendChild(st); })();
