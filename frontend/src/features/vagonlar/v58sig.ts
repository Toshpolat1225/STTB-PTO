        // =====================================================================
        // 5.8 — Taʼmir grafigi: imzo chekuvchilar grafik oynasining oʻzida tanlanadi (Kolodka dalolatnomasidagi usul)
        //  «KELISHILDI» (2 tagacha), «TASDIQLAYMAN» (1), pastdagi tuzuvchi(lar) (3 tagacha) — kartochkalar ✎ ▲ ✕,
        //  xodim agmkPickPerson oynasi bilan: seh → lavozim → xodim / qidiruv → lavozim va F.I.Sh. tahriri → «✓ Tanlash».
        //  Har joy (VX / 2-TYS) uchun alohida, barcha qurilmalarda bir xil (sinxron kalit). PDF / Word / Excel / JPG / chop — shu roʻyxat.
        // =====================================================================
        const S58: any = window as any;
        var PS58_KEY = 'agmk_ppr_sig', PS58: any = { def: {} };
        try { if (S58.KV_SYNC && Array.isArray(S58.KV_SYNC.keys) && !S58.KV_SYNC.keys.includes(PS58_KEY)) S58.KV_SYNC.keys.push(PS58_KEY); } catch (e) { /* */ }
        function ps58All(): any { try { return S58.kvGet(PS58_KEY, null) || {}; } catch (e) { return {}; } }
        function ps58Clean(n: any): string { return String(n == null ? '' : n).replace(/^_+\s*/, '').trim(); }
        function ps58FromDef(H0: any[], F0: any[]): any {
            const ag = H0.filter((h: any) => /KELISHILDI/i.test(h[0])).map((h: any) => ({ l: h[1], n: ps58Clean(h[2]) }));
            const a = H0.find((h: any) => /TASDIQLAYMAN/i.test(h[0])); return { ag: ag, ap: a ? { l: a[1], n: ps58Clean(a[2]) } : { l: '', n: '' }, bt: (F0 || []).map((f: any) => ({ l: f[0], n: ps58Clean(f[1]) })) };
        }
        function ps58Get(place: string): any { const A = ps58All(); return A[place] || null; }
        /** pprGrid uchun: yuqoridagi uch ustun */
        function pprSigHeads(place: string, H0: any[]): any[] {
            PS58.def[place] = Object.assign({}, PS58.def[place] || {}, { H0: H0 });
            const c = ps58Get(place); if (!c) return H0;
            const ag = (c.ag || []).slice(0, 2), heads: any[] = ag.map((x: any) => ['«KELISHILDI»', x.l || '', '_______ ' + (x.n || '')]);
            while (heads.length < 2) heads.push(['', '', '']);
            heads.push(['«TASDIQLAYMAN»', (c.ap && c.ap.l) || '', '_______ ' + ((c.ap && c.ap.n) || '')]);
            return heads;
        }
        /** pprGrid uchun: pastdagi tuzuvchilar */
        function pprSigFoot(place: string, F0: any[]): any[] {
            PS58.def[place] = Object.assign({}, PS58.def[place] || {}, { F0: F0 });
            const c = ps58Get(place); if (!c || !Array.isArray(c.bt) || !c.bt.length) return F0;
            return c.bt.slice(0, 3).map((x: any) => [x.l || '', x.n || '']);
        }
        function ps58Place(): string { try { return S58.PPRV.place || 'VX'; } catch (e) { return 'VX'; } }
        function ps58Cur(): any {
            const p = ps58Place(); let c = ps58Get(p);
            if (!c) { try { S58.pprGrid(S58.PPRV.m || S58.pprCurM(), p); } catch (e) { /* */ } const D = PS58.def[p] || {}; c = ps58FromDef(D.H0 || [], D.F0 || []); }
            return JSON.parse(JSON.stringify(c));
        }
        function ps58Save(c: any): void { const A = ps58All(); A[ps58Place()] = c; S58.kvSet(PS58_KEY, A); ps58Draw(); }
        function ps58Pick(g: string, i: number): void {
            const T: any = { ag: '«KELISHILDI» — kelishuvchi', ap: '«TASDIQLAYMAN» — tasdiqlovchi rahbar', bt: 'Tuzuvchi (jadval tagida)' };
            S58.agmkPickPerson((i < 0 ? '➕ ' : '👤 ') + T[g], (p: any) => {
                const c = ps58Cur(), x = { l: p.l || '', n: p.n || '' };
                if (g === 'ap') c.ap = x; else { c[g] = (c[g] || []).slice(); if (i < 0) c[g].push(x); else c[g][i] = x; }
                ps58Save(c);
            }, 'uz');
        }
        function ps58Up(g: string, i: number): void { const c = ps58Cur(), L = c[g] || []; if (i <= 0) return; const t = L[i]; L[i] = L[i - 1]; L[i - 1] = t; ps58Save(c); }
        function ps58Del(g: string, i: number): void { const c = ps58Cur(); (c[g] || []).splice(i, 1); ps58Save(c); }
        async function ps58Reset(): Promise<void> { let ok = true; try { ok = await S58.uiConfirm('Imzo chekuvchilar asl (namunadagi) roʻyxatga qaytarilsinmi?'); } catch (e) { ok = confirm('Asl roʻyxatga qaytarilsinmi?'); } if (!ok) return; const A = ps58All(); delete A[ps58Place()]; S58.kvSet(PS58_KEY, A); ps58Draw(); }
        function ps58Draw(): void {
            const box = S58.$id('ps58Box'); if (!box) return; const c = ps58Cur(), E = S58.escapeHtml;
            const card = (g: string, a: any, i: number, n: number) => `<div class="kq-p"><span><b>${n > 1 ? (i + 1) + '. ' : ''}${E(a.n || '—')}</b><small>${E(a.l || '')}</small></span><button class="mini-btn" onclick="ps58Pick('${g}',${i})">✎</button>${i ? `<button class="mini-btn" onclick="ps58Up('${g}',${i})">▲</button>` : ''}${g !== 'ap' ? `<button class="mini-btn" onclick="ps58Del('${g}',${i})">✕</button>` : ''}</div>`;
            const ag = c.ag || [], bt = c.bt || [];
            box.innerHTML = `<div class="pp-lbl">🖋 IMZO CHEKUVCHILAR (${E(ps58Place())})</div>`
                + `<div class="kq-h">«KELISHILDI» — kelishuvchilar</div>` + ag.map((a: any, i: number) => card('ag', a, i, ag.length)).join('') + (ag.length < 2 ? `<button class="kq-add" onclick="ps58Pick('ag',-1)">➕ Kelishuvchi qoʻshish</button>` : '')
                + `<div class="kq-h">«TASDIQLAYMAN» — tasdiqlovchi rahbar</div>` + (c.ap && (c.ap.n || c.ap.l) ? card('ap', c.ap, 0, 1) : `<button class="kq-add" onclick="ps58Pick('ap',0)">👤 Tasdiqlovchi rahbarni tanlash</button>`)
                + `<div class="kq-h">Tuzuvchi (jadval tagida)</div>` + bt.map((a: any, i: number) => card('bt', a, i, bt.length)).join('') + (bt.length < 3 ? `<button class="kq-add" onclick="ps58Pick('bt',-1)">➕ Tuzuvchi qoʻshish</button>` : '')
                + (ps58Get(ps58Place()) ? `<div class="nv-btns"><button onclick="ps58Reset()">↺ Namunadagi asl roʻyxat</button></div>` : '');
        }
        if (typeof S58.pprOpen === 'function') S58.pprOpen = S58.agmkExtend('pprOpen', '5.8: imzo chekuvchilar grafik oynasida', S58.pprOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const c = document.querySelector('#pprModal .modal-content'); if (!c) return r;
                let box = S58.$id('ps58Box');
                if (!box) {
                    const pdf = Array.from(c.querySelectorAll('button')).find((b: any) => /PDF/.test(b.textContent || '') && /ppr/i.test(b.getAttribute('onclick') || ''));
                    const anchor: any = pdf ? (pdf as any).closest('.nv-btns, .pp-out, div') : null;
                    box = document.createElement('div'); box.id = 'ps58Box'; box.className = 'ps58';
                    if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(box, anchor); else c.appendChild(box);
                }
                ps58Draw();
            } catch (e) { console.error(e); }
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = '.ps58{margin:12px 0;padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(2,6,23,.25)}'; document.head.appendChild(st); })();
        Object.assign(S58, { pprSigHeads: pprSigHeads, pprSigFoot: pprSigFoot, ps58Pick: ps58Pick, ps58Up: ps58Up, ps58Del: ps58Del, ps58Reset: ps58Reset, ps58Draw: ps58Draw });
