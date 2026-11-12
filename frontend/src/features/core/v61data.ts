        // =====================================================================
        // 6.1 — 14 va 16-bandlar (muallif 03.11.2026)
        //  14) Shikoyat va takliflar boshqa telefonlardan ADMINGA YETIB BORADI: «✍️ Ilova orqali yuborish» xabari korxona
        //      serveriga yoziladi (yozuv turi «fb»). Oʻqish — faqat administrator va «rahbar» roli (server tekshiradi) hamda
        //      yuboruvchining oʻzi (holatini koʻrish uchun). Boshqa xodimlar telefoniga tushmaydi. Server ulanmagan boʻlsa —
        //      telefonda turadi, ulanganda oʻzi ketadi. Rasmlar — kichraytirilgan nusxa bilan. «Koʻrib chiqildi» holati
        //      yuboruvchiga qaytadi. Admin: 🔔 va Parametrlardagi son belgisi (eski tartib).
        //  16) Hisobotlar → «OMBORLAR» — qoʻlda kod yozish oʻrniga EXCEL FILTRI kabi tanlov:
        //      • odatda «🤖 Avtomatik» (hech narsa belgilanmagan) — ilova oʻzi tahlil qiladi (Sex kodi ↔ 1C ombor, Цех/объект, ШПЗ, nom);
        //      • kerak boʻlganda «🏬 Skladlar: tanlash» — Forma-30 dagi BOR skladlar roʻyxati (qidiruv, «Hammasini belgilash»,
        //        har birida qator soni va summa, «(Boʻsh)»); belgilansa — tekshiruv faqat shu skladlar bilan, tepada sariq yozuv
        //        «Filtr: N ta sklad · ✕ Avtomatikka qaytish». Eski «vergul bilan» maydon olib tashlandi (yozilgan qiymati boʻlsa —
        //        mos skladlar avtomatik belgilanadi). «Sex kodi ↔ 1C ombor» — «⚙️ Ombor sozlamalari» ichida.
        // =====================================================================
        const F61: any = window as any;

        // ---------- 14) shikoyat va takliflar — server orqali ----------
        function f61Me(): string { try { return typeof F61.meTabel === 'function' ? String(F61.meTabel()) : String(((currentUser as any) && (currentUser as any).tabel) || ''); } catch (e) { return ''; } }
        function f61Boss(): boolean { try { return (typeof F61.isAdminReal === 'function' && F61.isAdminReal()) || (typeof F61.isAdmin === 'function' && F61.isAdmin()) || (typeof F61.hasRole === 'function' && F61.hasRole('rahbar')); } catch (e) { return false; } }
        function f61Clean(t: any): string { try { return typeof F61.cleanTabel === 'function' ? String(F61.cleanTabel(t)) : String(t || ''); } catch (e) { return String(t || ''); } }
        function f61Rec(x: any): any {
            const files = (x.files || []).map((f: any) => { let s = ''; try { s = F61.imgSrc(f); } catch (e) { /* */ } return /^data:image\//.test(s) ? { kind: 'img', src: s, name: f.name || '' } : null; }).filter(Boolean);
            const d = Object.assign({}, x, { files: files }); delete d.seen; return d;
        }
        if (typeof F61.syncLocal === 'function') F61.syncLocal = F61.agmkExtend('syncLocal', '6.1: shikoyat va takliflar serverga', F61.syncLocal, (o: Function) => function (this: unknown) {
            const out = o.apply(this, arguments);
            try { const me = f61Me(), boss = f61Boss(); (F61.getFeedback() || []).forEach((x: any) => { if (!x || !x.id) return; const own = f61Clean(x.by && x.by.tabel) === f61Clean(me); if (!own && !boss) return; out.push({ id: 'fb:' + x.id, kind: 'fb', data: f61Rec(x) }); }); } catch (e) { console.error('6.1 fb', e); }
            return out;
        });
        if (typeof F61.syncApply === 'function') F61.syncApply = F61.agmkExtend('syncApply', '6.1: shikoyat va takliflar serverdan', F61.syncApply, (o: Function) => function (this: unknown, rec: any) {
            if (rec && rec.kind === 'fb') {
                try {
                    const d = rec.data; if (!d || !d.id) return 'fb';
                    const L = F61.getFeedback() || [], i = L.findIndex((x: any) => x && x.id === d.id);
                    if (i < 0) L.push(Object.assign({}, d, { seen: false })); else { const keepFiles = (L[i].files && L[i].files.length) ? L[i].files : d.files; L[i] = Object.assign({}, L[i], d, { files: keepFiles, seen: L[i].seen }); }
                    L.sort((a: any, b: any) => String(a.at).localeCompare(String(b.at))); F61.saveFeedback(L);
                    try { F61.updateFbBadge(); } catch (e) { /* */ }
                } catch (e) { console.error('6.1 fb', e); }
                return 'fb';
            }
            return o.apply(this, arguments);
        });
        // yuborilgach — darhol serverga (ulangan boʻlsa)
        function f61Push(): void { try { if (typeof F61.syncNow === 'function') setTimeout(() => { try { F61.syncNow(true); } catch (e) { /* */ } }, 300); } catch (e) { /* */ } }
        ['sendFeedbackInApp', 'toggleFbDone', 'deleteFb'].forEach(fn => { if (typeof F61[fn] === 'function') { const _f = F61[fn]; F61[fn] = function (this: unknown) { const r = _f.apply(this, arguments); Promise.resolve(r).then(() => f61Push()); return r; }; } });
        // yuboruvchi oʻz xabarining holatini koʻradi: «Shikoyat va takliflar» oynasida «📨 Yuborganlarim»
        function f61MineHtml(): string {
            const me = f61Clean(f61Me()), L = (F61.getFeedback() || []).filter((x: any) => f61Clean(x.by && x.by.tabel) === me).slice(-5).reverse(); if (!L.length) return '';
            const E = F61.escapeHtml;
            return `<div class="f61-mine"><b>📨 Yuborganlarim</b>${L.map((x: any) => `<div>№${E(String(x.no || ''))} · ${x.type === 'Taklif' ? '💡' : '🔴'} ${E(String(x.text || '').slice(0, 60))}${String(x.text || '').length > 60 ? '…' : ''}<i class="${x.done ? 'ok' : ''}">${x.done ? '✅ Koʻrib chiqildi' : '⏳ Qabul qilindi'}</i></div>`).join('')}</div>`;
        }
        if (typeof F61.openFeedback === 'function') F61.openFeedback = F61.agmkExtend('openFeedback', '6.1: yuborganlarim holati', F61.openFeedback, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const m = F61.$id('feedbackModal'), box = m && m.querySelector('.modal-content, .pk-box, div'); const old = m && m.querySelector('.f61-mine'); if (old) old.remove(); const h = f61MineHtml(); const from = F61.$id('fbFrom'); if (h && from) from.insertAdjacentHTML('afterend', h); void box; } catch (e) { /* */ }
            return r;
        });

        // ---------- 16) skladlar — Excel filtri kabi ----------
        var F61S: any = { cat: null, list: [], sel: new Set<string>(), q: '' };
        function f61Norm(s: any): string { return String(s == null ? '' : s).replace(/\.0+$/, '').replace(/\s+/g, ' ').trim(); }
        function f61Sel(cat: string): string[] { try { const s = (F61.hsSet()[cat] || {}); return Array.isArray(s.skl61) ? s.skl61.map(f61Norm) : []; } catch (e) { return []; } }
        function f61SaveSel(cat: string, arr: string[]): void {
            const s = F61.hsSet(); s[cat] = Object.assign(s[cat] || {}, { skl61: arr, sklad: '' }); F61.kvSet(F61.HS_SET_KEY, s);
            try { if (F61.KV_SYNC) F61.KV_SYNC.dirty = true; } catch (e) { /* */ }
        }
        function f61Legacy(cat: string): string[] { try { return String((F61.hsSet()[cat] || {}).sklad || '').split(/[,;]+/).map((x: string) => x.trim()).filter(Boolean); } catch (e) { return []; } }
        if (typeof F61.hsF30Rows === 'function') {
            const _rows = F61.hsF30Rows;
            F61.hsF30Rows = async function (this: unknown, f30: any, cat: string) {
                const sel = f61Sel(cat); if (!sel.length) return _rows.apply(this, arguments);
                const d = await F61.hsJsonGet(f30.ref); if (!d) return []; const S = new Set(sel);
                return d.items.filter((x: any) => S.has(f61Norm(x.sklad)));
            };
        }
        async function f61Items(cat: string): Promise<any[]> { const cur = (F61.hsF30Of(cat) || [])[0]; if (!cur) return []; const d = await F61.hsJsonGet(cur.ref); return (d && d.items) || []; }
        function f61Fmt(n: number): string { const a = Math.abs(n); return a >= 1e9 ? (n / 1e9).toFixed(1).replace('.', ',') + ' mlrd' : a >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' mln' : a >= 1e3 ? Math.round(n / 1e3) + ' ming' : String(Math.round(n)); }
        async function f61Open(cat: string): Promise<void> {
            const items = await f61Items(cat); if (!items.length) { F61.showToast('Avval shu boʻlimga Forma-30 yuklang'); return; }
            const G: any = {}; items.forEach((x: any) => { const k = f61Norm(x.sklad); const g = G[k] = G[k] || { k: k, n: 0, s: 0 }; g.n++; g.s += +x.sum || 0; });
            F61S.cat = cat; F61S.list = Object.values(G).sort((a: any, b: any) => (a.k ? 0 : 1) - (b.k ? 0 : 1) || String(a.k).localeCompare(String(b.k), undefined, { numeric: true })); F61S.q = '';
            let sel = f61Sel(cat); const leg = f61Legacy(cat);
            if (!sel.length && leg.length) sel = F61S.list.filter((g: any) => leg.some((p: string) => g.k.startsWith(f61Norm(p)))).map((g: any) => g.k);
            const have = new Set(F61S.list.map((g: any) => g.k)), gone = sel.filter(k => !have.has(k));
            if (gone.length) F61.showToast('⚠️ Yangi Forma-30 da yoʻq sklad belgisi olib tashlandi: ' + gone.join(', '));
            F61S.sel = new Set(sel.filter(k => have.has(k)));
            let m = F61.$id('f61Modal'); if (!m) { m = document.createElement('div'); m.id = 'f61Modal'; m.className = 'modal-overlay hidden pk-ov'; m.style.zIndex = '20050'; m.onclick = (e: any) => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box f61-box" id="f61Box"></div>'; document.body.appendChild(m); }
            f61Draw(); m.classList.remove('hidden');
        }
        function f61Draw(): void {
            const b = F61.$id('f61Box'); if (!b) return; const E = F61.escapeHtml, q = F61S.q.toLowerCase();
            const L = F61S.list.filter((g: any) => !q || (g.k || '(boʻsh)').toLowerCase().includes(q));
            const all = L.length && L.every((g: any) => F61S.sel.has(g.k));
            b.innerHTML = `<div class="pk-h"><b>🏬 Skladlar (Forma-30 dagi)</b><span onclick="$id('f61Modal').classList.add('hidden')">✕</span></div>
                <div class="f61-q"><input id="f61Q" placeholder="🔍 Qidiruv: 31 18 92…" value="${E(F61S.q)}" oninput="f61Q(this.value)"></div>
                <label class="f61-r f61-all"><input type="checkbox" ${all ? 'checked' : ''} onchange="f61All(this.checked)"><span>(Hammasini belgilash)</span><small>${L.length} ta</small></label>
                <div class="f61-l">${L.map((g: any) => `<label class="f61-r"><input type="checkbox" data-k="${E(g.k)}" ${F61S.sel.has(g.k) ? 'checked' : ''} onchange="f61T(this)"><span>${g.k ? E(g.k) : '<i>(Boʻsh — sklad yozilmagan)</i>'}</span><small>${g.n} qator · ${f61Fmt(g.s)}</small></label>`).join('')}</div>
                <div class="f61-ft"><b>${F61S.sel.size ? F61S.sel.size + ' ta sklad tanlandi' : 'Hech narsa tanlanmagan — 🤖 Avtomatik'}</b>
                <div class="f61-btns"><button class="mini-btn" onclick="f61Apply(true)">🤖 Avtomatik</button><button class="action-btn" onclick="f61Apply(false)">✅ Qoʻllash</button></div></div>`;
            const i = F61.$id('f61Q') as any; if (i && F61S.q) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) { /* */ } }
        }
        function f61Q(v: string): void { F61S.q = String(v || ''); f61Draw(); }
        function f61T(el: any): void { const k = el.getAttribute('data-k'); if (el.checked) F61S.sel.add(k); else F61S.sel.delete(k); const ft = document.querySelector('#f61Box .f61-ft b'); if (ft) ft.textContent = F61S.sel.size ? F61S.sel.size + ' ta sklad tanlandi' : 'Hech narsa tanlanmagan — 🤖 Avtomatik'; }
        function f61All(on: boolean): void { const q = F61S.q.toLowerCase(); F61S.list.forEach((g: any) => { if (q && !(g.k || '(boʻsh)').toLowerCase().includes(q)) return; if (on) F61S.sel.add(g.k); else F61S.sel.delete(g.k); }); f61Draw(); }
        function f61Apply(auto: boolean): void {
            const cat = F61S.cat; if (!cat) return; if (!F61.hsCan()) { F61.showToast('🔒 Faqat «Hisobotlar» roli'); return; }
            f61SaveSel(cat, auto ? [] : Array.from(F61S.sel)); const m = F61.$id('f61Modal'); if (m) m.classList.add('hidden');
            F61.showToast(auto || !F61S.sel.size ? '🤖 Avtomatik tekshiruv' : '🏬 Filtr: ' + F61S.sel.size + ' ta sklad'); try { F61.hsRender(); } catch (e) { /* */ }
        }
        function f61Off(cat: string): void { if (!F61.hsCan()) return; f61SaveSel(cat, []); F61.showToast('🤖 Avtomatik tekshiruv'); try { F61.hsRender(); } catch (e) { /* */ } }
        function f61Box(cat: string): string {
            const sel = f61Sel(cat), leg = f61Legacy(cat), E = F61.escapeHtml, can = F61.hsCan();
            const on = sel.length ? `Filtr: ${sel.length} ta sklad (${E(sel.slice(0, 3).join(', '))}${sel.length > 3 ? '…' : ''})` : leg.length ? `Filtr (eski yozuv): ${E(leg.join(', '))}` : '';
            return `<div class="f61-st ${on ? 'on' : ''}">${on ? `🏬 ${on} ${can ? `<button class="mini-btn" onclick="f61Off('${cat}')">✕ Avtomatikka qaytish</button>` : ''}` : '🤖 Avtomatik: ilova skladlarni oʻzi tahlil qiladi (Sex kodi ↔ 1C ombor, Цех/объект, ШПЗ, nom).'}</div>
                ${can ? `<button class="mini-btn f61-btn" onclick="f61Open('${cat}')">🏬 Skladlar: tanlash${sel.length ? ' (' + sel.length + ')' : ''}</button>` : ''}`;
        }
        if (typeof F61.hsRender === 'function') F61.hsRender = F61.agmkExtend('hsRender', '6.1: skladlar — Excel filtri kabi', F61.hsRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const HS = F61.HS; if (!HS || !HS.cat || HS.chk) return r;
                const inp = document.querySelector('#screen-hisob input[onchange^="hsSetSklad"]') as any; const f = inp && inp.closest('.nd-f');
                const box = f ? f.parentElement : null; if (!f || !box) return r;
                const w = document.createElement('div'); w.className = 'f61-w'; w.innerHTML = f61Box(HS.cat); f.replaceWith(w);
                const ceh = document.querySelector('#screen-hisob #ceh59') as any;
                const det = document.createElement('details'); det.className = 'hs-hist f61-cfg'; det.innerHTML = '<summary>⚙️ Ombor sozlamalari</summary>';
                if (ceh) { ceh.parentNode.insertBefore(det, ceh); det.appendChild(ceh); ceh.open = false; }
            } catch (e) { console.error('6.1 skladlar', e); }
            return r;
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v61dataCss';
            st.textContent = `.f61-mine{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(15,23,42,.6);border:1px solid rgba(148,163,184,.3);font-size:12px;color:#cbd5e1}
            .f61-mine b{display:block;color:#e2e8f0;margin-bottom:4px}.f61-mine div{padding:3px 0;border-top:1px solid rgba(148,163,184,.15)}.f61-mine i{float:right;font-style:normal;color:#fbbf24}.f61-mine i.ok{color:#4ade80}
            .f61-w{margin-top:10px}.f61-st{font-size:12.5px;color:#94a3b8;line-height:1.4;padding:8px 10px;border-radius:10px;background:rgba(15,23,42,.45);border:1px solid rgba(148,163,184,.25)}
            .f61-st.on{color:#111827;background:#fde68a;border-color:#f59e0b;font-weight:700;display:flex;flex-wrap:wrap;align-items:center;gap:8px}.f61-st.on .mini-btn{background:#111827;color:#fde68a;border-color:#111827}
            .f61-btn{margin-top:8px;width:100%}
            .f61-box{max-width:520px}.f61-q input{width:100%;box-sizing:border-box;height:42px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#f1f5f9;padding:0 12px;font-size:15px;margin:6px 0}
            .f61-l{max-height:52vh;overflow:auto;border:1px solid #334155;border-radius:12px;padding:4px}
            .f61-r{display:flex;align-items:center;gap:10px;padding:8px 8px;border-radius:8px;color:#e2e8f0;font-size:14px;cursor:pointer}.f61-r:hover{background:rgba(51,65,85,.4)}
            .f61-r input{width:20px;height:20px;flex:0 0 20px}.f61-r span{flex:1}.f61-r small{color:#94a3b8;font-size:12px;white-space:nowrap}
            .f61-all{font-weight:700}.f61-ft{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}.f61-ft b{font-size:13px;color:#fde68a}.f61-btns{display:flex;gap:8px}
            .f61-cfg{margin-top:8px}`;
            document.head.appendChild(st);
        })();
        Object.assign(F61, { f61Open: f61Open, f61Q: f61Q, f61T: f61T, f61All: f61All, f61Apply: f61Apply, f61Off: f61Off });
