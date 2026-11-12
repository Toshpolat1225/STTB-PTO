        // =====================================================================
        // 5.9 — 12-band (muallif, 02.11.2026 10:29–11:19): hisobot tekshiruvidagi notoʻgʻri zamechaniyalar
        //  a) «Sklad (sex) mos emas»: spravkadagi «Цех/объект» kodi 1C (Forma-30) dagi ombor kodi bilan bir xil emas edi.
        //     Endi sex kodi ↔ 1C ombor bogʻlanishi bor (muallif tasdiqlagan): 9232→31 18 9205, 9202→31 18 9202,
        //     9204→31 18 9203, 9201→31 18 9201, 9208→31 18 9208. Tekshiruv bogʻlangan omborni oladi —
        //     talabnoma №, son va ШПЗ mos kelsa xato chiqmaydi. Bogʻlanish «Hisobotlar» → boʻlim → Forma-30 oynasida
        //     koʻrinadi va oʻzgartiriladi (administrator / «Hisobotlar» roli); server orqali hammaga boradi.
        //  b) «Birliklar soni hujjatlarda har xil»: taʼmir (masalan 22 ед.) va naplavka/obtochka (232 ед.) — ikki xil ish,
        //     endi solishtirilmaydi (faqat bir xil ish turidagi bloklar solishtiriladi).
        //  c) Zamechaniyadagi raqamlar yaxlitlanadi: «786.4560000000001» → «786,456».
        //  d) Zamechaniya PDF tepasidagi fayllar roʻyxati uzilmaydi — hammasi raqamlab yoziladi.
        //  e) Bir talabnoma bir necha spravka blokida boʻlsa (Смазка ЖРО 170 + 100 = 270) — yigʻindisi Forma-30 bilan solishtiriladi,
        //     har blok alohida «farq» deb chiqmaydi (bogʻlanishdan keyin shu xatolar koʻrinib qolgan edi).
        //  f) Spravkada тн, 1C da кг (1,25 тн = 1 250 кг) — «boshqa oʻlcham» xatosi emas, faqat «birlik farqi» izohi.
        //  Eski funksiyalar oʻchirilmadi — oʻrab olindi.
        // =====================================================================
        const CK9: any = window as any;
        var CEH59_KEY = 'agmk_ceh_map', CEH59_DEF: any = { '9232': '31 18 9205', '9202': '31 18 9202', '9204': '31 18 9203', '9201': '31 18 9201', '9208': '31 18 9208' };
        function ceh59Raw(): any { try { const m = CK9.kvGet(CEH59_KEY, null); return (m && typeof m === 'object' && !Array.isArray(m)) ? Object.assign({}, m) : {}; } catch (e) { return {}; } }
        function ceh59Map(): any { const m = Object.assign({}, CEH59_DEF, ceh59Raw()); Object.keys(m).forEach(k => { if (!String(m[k] || '').trim()) delete m[k]; }); return m; }
        function ceh59Code(c: any): string { const v = ceh59Map()[String(c || '').trim()]; return v ? String(v).trim().split(/\s+/).pop() || '' : ''; }
        try { if (CK9.KV_SYNC && Array.isArray(CK9.KV_SYNC.keys) && CK9.KV_SYNC.keys.indexOf(CEH59_KEY) < 0) CK9.KV_SYNC.keys.push(CEH59_KEY); } catch (e) { /* */ }
        function ck59Kind(t: any): string { const s = String(t || '').toLowerCase(); return /наплавк|обточк|наплав/.test(s) ? 'nap' : /ремонт|освид/.test(s) ? 'rem' : 'x'; }
        function ck59Num(s: any): string {
            return String(s == null ? '' : s).replace(/(\d+)\.(\d{6,})/g, (m: string, a: string, b: string) => {
                const v = Math.round(parseFloat(a + '.' + b) * 1000) / 1000; return String(v).replace('.', ',');
            });
        }
        function ck59P(s: any): number { return parseFloat(String(s || '').replace(/[\s\u00a0]/g, '').replace(',', '.')); }
        function ck59Sum(pkg: any, F: any[]): void {
            const M = pkg.month || (pkg.f30 && pkg.f30.month) || '', items: any[] = [];
            (pkg.sheets || []).forEach((x: any) => { if (x.type === 'spr' && Array.isArray(x.data)) x.data.forEach((b: any) => { if (M && b.month && b.month !== M) return; (b.items || []).forEach((it: any) => { if (it && it.fakt != null && (it.ids || []).length) items.push(it); }); }); });
            const sc = (a: string, b: string) => { try { return typeof CK9.hpScore === 'function' ? CK9.hpScore(a, b) : (a === b ? 1 : 0); } catch (e) { return 0; } };
            for (let i = F.length - 1; i >= 0; i--) {
                const f = F[i]; if (!f || f.t !== 'fakt') continue;
                const m = /Факт\s+([\d\s\u00a0.,]+).*?shu talabnomalarda\s+([\d\s\u00a0.,]+)/.exec(String(f.msg || '')); if (!m) continue;
                const q = ck59P(m[2]); if (!isFinite(q)) continue;
                const ids = ((/Forma-30:\s*(.*)$/.exec(f.msg) || [])[1] || '').match(/№(\d+)/g) || []; const idn = ids.map((x: string) => x.slice(1)); if (!idn.length) continue;
                const same = items.filter(it => it.ids.some((id: any) => idn.indexOf(String(id)) >= 0) && (it.name === f.name || sc(it.name, f.name) > 0 || sc(f.name, it.name) > 0));
                const sum = same.reduce((a, it) => a + (+it.fakt || 0), 0);
                if (same.length > 1 && Math.abs(sum - q) < 1e-6) F.splice(i, 1);
            }
        }
        if (typeof CK9.hpCheck === 'function') CK9.hpCheck = CK9.agmkExtend('hpCheck', '5.9: sex↔ombor bogʻlanishi, taʼmir/obtochka, yaxlitlash', CK9.hpCheck, (o: Function) => function (this: unknown, pkg: any) {
            // a) bogʻlangan 1C ombori
            try { (pkg.sheets || []).forEach((x: any) => { if (x.type === 'spr' && Array.isArray(x.data)) x.data.forEach((b: any) => { if (!b || b.cehSrc) return; const c = ceh59Code(b.ceh); if (c && c !== String(b.ceh)) { b.cehSrc = b.ceh; b.ceh = c; } }); }); } catch (e) { /* */ }
            const R = o.apply(this, arguments);
            try {
                if (R && Array.isArray(R.findings)) {
                    // b) taʼmir va naplavka/obtochka soni solishtirilmaydi
                    for (let i = R.findings.length - 1; i >= 0; i--) {
                        const f = R.findings[i];
                        if (f && f.t === 'cntx') { const parts = String(f.msg || '').split(';'); const kinds = new Set(parts.map(ck59Kind).filter(k => k !== 'x')); if (kinds.size > 1) R.findings.splice(i, 1); }
                    }
                    // e) bir talabnoma bir necha blokda (masalan Смазка ЖРО 170 + 100 = Forma-30 da 270) — yigʻindisi solishtiriladi
                    try { ck59Sum(pkg, R.findings); } catch (e) { /* */ }
                    // f) birlik farqi: spravkada тн, 1C da кг (1,25 тн = 1 250 кг) — oʻlcham xatosi emas
                    R.findings.forEach((f: any) => {
                        if (!f || f.t !== 'size') return; const msg = String(f.msg || '');
                        const a = /:\s*([\d\s\u00a0.,]+)\s*кг[^«]*Spravkada «[^»]*»\s*([\d\s\u00a0.,]+)\s*тн/.exec(msg); if (!a) return;
                        if (Math.abs(ck59P(a[2]) * 1000 - ck59P(a[1])) < 1e-6) { f.t = 'unit'; f.lvl = 'blue'; f.msg = 'Birlik farqi: spravkada ' + a[2].trim() + ' тн, 1C (Forma-30) da ' + a[1].trim() + ' кг — miqdor teng. Nomi: ' + msg.replace(/^Talabnomada boshqa oʻlcham\/nom chiqarilgan:\s*/, ''); }
                    });
                    // c) raqamlarni yaxlitlash
                    R.findings.forEach((f: any) => { if (f && f.msg) f.msg = ck59Num(f.msg); });
                }
            } catch (e) { /* */ }
            return R;
        });
        // d) zamechaniya — fayllar roʻyxati toʻliq
        if (typeof CK9.hp3ZamHtml === 'function') CK9.hp3ZamHtml = CK9.agmkExtend('hp3ZamHtml', '5.9: fayllar roʻyxati uzilmaydi', CK9.hp3ZamHtml, (o: Function) => function (this: unknown, x: any) {
            let h = o.apply(this, arguments);
            try {
                const L = (x && x.files) || [];
                if (L.length) {
                    const E = CK9.escapeHtml; const full = L.map((n: string, i: number) => (L.length > 1 ? (i + 1) + ') ' : '') + E(n)).join('; ');
                    const fix = (t: string) => t.replace(/<b>Fayllar:<\/b>[^<]*<\/p>/, '<b>Fayllar (' + L.length + ' ta):</b> ' + full + '</p>');
                    if (typeof h === 'string') h = fix(h); else if (h && typeof h.html === 'string') h.html = fix(h.html);
                }
            } catch (e) { /* */ }
            return h;
        });
        // Bogʻlanishlar oynasi (Hisobotlar → boʻlim → Forma-30 qutisi)
        function ceh59Can(): boolean { try { return CK9.isAdmin() || CK9.hasRole('hisob'); } catch (e) { return false; } }
        function ceh59Html(): string {
            const m = ceh59Map(), E = CK9.escapeHtml, can = ceh59Can();
            const rows = Object.keys(m).sort().map(k => `<div class="ceh59-r"><b>${E(k)}</b><span>→</span>${can ? `<input value="${E(m[k])}" onchange="ceh59Set('${E(k)}', this.value)">` : `<i>${E(m[k])}</i>`}${can ? `<button class="mini-btn" onclick="ceh59Del('${E(k)}')">✕</button>` : ''}</div>`).join('');
            return `<details class="hs-hist ceh59" id="ceh59"><summary>🔗 Sex kodi ↔ 1C ombor (${Object.keys(m).length})</summary><div class="nd-tip">Spravkadagi «Цех/объект» kodi 1C dagi qaysi omborga toʻgʻri keladi. Tekshiruv shu omborni oladi.</div>${rows}${can ? `<div class="ceh59-r"><input id="ceh59K" placeholder="sex kodi, masalan 9210" inputmode="numeric"><span>→</span><input id="ceh59V" placeholder="31 18 92__"><button class="mini-btn" onclick="ceh59Add()">＋</button></div>` : ''}</details>`;
        }
        function ceh59Save(m: any): void { try { CK9.kvSet(CEH59_KEY, m); if (CK9.KV_SYNC) CK9.KV_SYNC.dirty = true; if (typeof CK9.storePush === 'function') CK9.storePush(); } catch (e) { /* */ } }
        function ceh59Set(k: string, v: string): void { if (!ceh59Can()) return; const m = ceh59Raw(); m[k] = String(v || '').trim(); ceh59Save(m); try { CK9.showToast('✅ Saqlandi: ' + k + ' → ' + (m[k] || '—')); } catch (e) { /* */ } }
        function ceh59Del(k: string): void { if (!ceh59Can()) return; const m = ceh59Raw(); m[k] = ''; ceh59Save(m); ceh59Redraw(); }
        function ceh59Add(): void {
            if (!ceh59Can()) return; const k = String((CK9.$id('ceh59K') || {}).value || '').trim(), v = String((CK9.$id('ceh59V') || {}).value || '').trim();
            if (!/^\d{3,5}$/.test(k) || !v) { try { CK9.showToast('Sex kodi (raqam) va 1C omborini yozing'); } catch (e) { /* */ } return; }
            const m = ceh59Raw(); m[k] = v; ceh59Save(m); ceh59Redraw();
        }
        function ceh59Redraw(): void { const d = CK9.$id('ceh59'); if (!d) return; const op = d.open; d.outerHTML = ceh59Html(); const n = CK9.$id('ceh59'); if (n) n.open = op; }
        if (typeof CK9.hsRender === 'function') CK9.hsRender = CK9.agmkExtend('hsRender', '5.9: sex ↔ 1C ombor bogʻlanishlari', CK9.hsRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                if (CK9.HS && CK9.HS.cat && !CK9.HS.chk && !CK9.$id('ceh59')) {
                    const box = Array.from(document.querySelectorAll('.hs-box')).find((b: any) => /Forma-30 \(norma shabloni\)/.test((b.querySelector('.hs-h') || {}).textContent || '')) as any;
                    if (box) box.insertAdjacentHTML('beforeend', ceh59Html());
                }
            } catch (e) { /* */ }
            return r;
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v59chkCss';
            st.textContent = `
            .ceh59-r{display:flex;align-items:center;gap:6px;margin:5px 0}
            .ceh59-r b{min-width:52px;color:#fff}.ceh59-r span{color:#94a3b8}.ceh59-r i{font-style:normal;color:#e2e8f0}
            .ceh59-r input{flex:1;min-width:0;padding:7px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(15,23,42,.8);color:#fff}
            .ceh59-r .mini-btn{flex:0 0 auto}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(CK9, { ceh59Map: ceh59Map, ceh59Set: ceh59Set, ceh59Del: ceh59Del, ceh59Add: ceh59Add, ck59Num: ck59Num });
