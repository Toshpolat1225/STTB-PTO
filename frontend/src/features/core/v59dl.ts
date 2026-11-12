        // =====================================================================
        // 5.9 — 9-band (muallif, 02.11.2026 09:39): «⬇️ Yuklab olinganlar» (brauzerdagi kabi)
        //  • yuqorida ⬇️ tugmasi (bosh sahifada 🔔 yonida, ichki sahifalarda yuqori qatorda) — ilova orqali yuklab olingan
        //    fayllar roʻyxati: nomi, vaqti, hajmi; bosilsa fayl ochiladi; 📤 yuborish, 💬 xodimga, 🗑 roʻyxatdan olish;
        //  • yuklab olingach 4 soniyalik qisqa xabar — bosilsa fayl darhol ochiladi; vaqt oʻtsa yopiladi, fayl roʻyxatda qoladi;
        //  • ikki marta chiqadigan «Saqlandi» xabari bittaga, pastda oʻzi yopilmaydigan «Saqlandi … Yuborish / 💬 / Imzoga»
        //    qatori shu qisqa xabarga almashtirildi (yuborish va xodimga — roʻyxatda har fayl yonida).
        //  Fayl nusxasi telefonning oʻzida (IndexedDB) saqlanadi, oxirgi 40 ta; internetga hech narsa ketmaydi.
        //  Ochish: APK da AgmkNative.openFile boʻlsa — tizim orqali (Excel / Word / PDF ilovasi); boʻlmasa — saqlab ochish
        //  (N.saveFile …, open=true); kompyuter/brauzerda — yangi oynada. Eski funksiyalar oʻchirilmadi — oʻrab olindi.
        // =====================================================================
        const DL9: any = window as any;
        var DL59: any = { key: 'agmk_dl59', max: 40, quiet: 0, last: null, t: 0 };
        function dl59All(): any[] { try { const L = JSON.parse(localStorage.getItem(DL59.key) || '[]'); return Array.isArray(L) ? L : []; } catch (e) { return []; } }
        function dl59Put(L: any[]): void { try { localStorage.setItem(DL59.key, JSON.stringify(L.slice(0, DL59.max))); } catch (e) { /* */ } dl59Badge(); }
        function dl59Size(n: number): string { return n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
        function dl59Ic(n: string): string { const e = String(n).toLowerCase().split('.').pop() || ''; return /^xls/.test(e) ? '📊' : /^doc/.test(e) ? '📝' : e === 'pdf' ? '📄' : /^(jpe?g|png|webp)$/.test(e) ? '🖼' : /^zip|rar$/.test(e) ? '🗜' : '📎'; }
        async function dl59Rec(files: any[]): Promise<any> {
            const L = dl59All(); let first: any = null;
            for (const f of files || []) {
                if (!f || !f.blob) continue;
                const id = 'dl59_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                const r = { id: id, name: String(f.name || 'fayl'), size: f.blob.size || 0, mime: f.blob.type || '', at: new Date().toISOString() };
                try { await DL9.mediaSave(id, f.blob, { id: id, at: r.at, name: r.name, mime: r.mime, size: r.size }); DL9.mediaKeep(id); } catch (e) { (r as any).nb = 1; }
                L.unshift(r); if (!first) first = r;
            }
            const old = L.slice(DL59.max); old.forEach((x: any) => { try { DL9.mediaDelete(x.id); } catch (e) { /* */ } });
            dl59Put(L); return first;
        }
        async function dl59Open(id: string): Promise<void> {
            const r = dl59All().find((x: any) => x.id === id); if (!r) return;
            let b: any = null; try { b = await DL9.mediaGetBlob(id); } catch (e) { b = null; }
            if (!b) { try { DL9.showToast('⚠️ Fayl topilmadi — roʻyxatdan olindi'); } catch (e) { /* */ } dl59Put(dl59All().filter((x: any) => x.id !== id)); dl59List(true); return; }
            const N = DL9.AgmkNative;
            try {
                if (N && (typeof N.openFile === 'function' || typeof N.saveFile === 'function')) {
                    const b64: string = await DL9.blobB64(b);
                    if (typeof N.openFile === 'function') N.openFile(r.name, r.mime || b.type || 'application/octet-stream', b64);
                    else N.saveFile(r.name, r.mime || b.type || 'application/octet-stream', b64, true);
                    return;
                }
            } catch (e) { /* */ }
            const u = URL.createObjectURL(b); const w = window.open(u, '_blank'); if (!w) { const a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
            setTimeout(() => URL.revokeObjectURL(u), 120000);
        }
        async function dl59Files(id: string): Promise<any[]> { const r = dl59All().find((x: any) => x.id === id); if (!r) return []; const b = await DL9.mediaGetBlob(id); return b ? [{ name: r.name, blob: b }] : []; }
        async function dl59Share(id: string): Promise<void> { const f = await dl59Files(id); if (!f.length) return dl59Open(id); DL59.quiet++; try { await DL9.docShare(f, { via: 'any' }); } finally { DL59.quiet--; } }
        async function dl59Chat(id: string): Promise<void> { const f = await dl59Files(id); if (!f.length) return dl59Open(id); try { DL9.mdlClose('dl59M'); DL9.expToChat(f); } catch (e) { /* */ } }
        function dl59Del(id: string): void { try { DL9.mediaDelete(id); } catch (e) { /* */ } dl59Put(dl59All().filter((x: any) => x.id !== id)); dl59List(true); }
        function dl59List(re?: boolean): void {
            if (re && !DL9.$id('dl59M')) return; if (re) { const m = DL9.$id('dl59M'); if (m && m.classList.contains('hidden')) return; }
            const L = dl59All(), E = DL9.escapeHtml, fd = (s: string) => { try { return DL9.fmtDT(s); } catch (e) { return s; } };
            DL9.mdl('dl59M', `<div class="px-h"><b>⬇️ Yuklab olinganlar</b><button class="mini-btn" onclick="mdlClose('dl59M')">✕</button></div>
                <div class="nd-tip">Ilova orqali yuklab olingan fayllar (oxirgi ${DL59.max} ta). Bosing — fayl ochiladi.</div>
                ${L.length ? '<div class="dl59-l">' + L.map((r: any) => `<div class="dl59-r"><div class="dl59-m" onclick="dl59Open('${r.id}')"><i>${dl59Ic(r.name)}</i><span><b>${E(r.name)}</b><small>${E(fd(r.at))} · ${dl59Size(r.size)}</small></span></div><button title="Yuborish" onclick="dl59Share('${r.id}')">📤</button><button title="Xodimga" onclick="dl59Chat('${r.id}')">💬</button><button title="Roʻyxatdan olish" onclick="dl59Del('${r.id}')">🗑</button></div>`).join('') + '</div>' : '<div class="xt-empty">Hali hech narsa yuklab olinmagan.</div>'}`, true);
            try { localStorage.setItem(DL59.key + '_seen', String(L.length ? L[0].at : '')); } catch (e) { /* */ } dl59Badge();
        }
        function dl59Badge(): void {
            let seen = ''; try { seen = localStorage.getItem(DL59.key + '_seen') || ''; } catch (e) { /* */ }
            const n = dl59All().filter((x: any) => String(x.at) > seen).length;
            document.querySelectorAll('.dl59-btn').forEach((b: any) => { b.classList.toggle('has', n > 0); const i = b.querySelector('i'); if (i) i.textContent = n > 9 ? '9+' : String(n || ''); });
        }
        // qisqa xabar (4 s): bosilsa — ochiladi
        function dl59Toast(r: any, n: number): void {
            let t = DL9.$id('dl59T'); if (!t) { t = document.createElement('div'); t.id = 'dl59T'; document.body.appendChild(t); }
            DL59.last = r; const E = DL9.escapeHtml;
            t.innerHTML = `<span class="dl59-tm" onclick="dl59TapOpen()">${dl59Ic(r.name)} <b>Saqlandi:</b> ${E(r.name)}${n > 1 ? ' (+' + (n - 1) + ')' : ''}<small>bosing — ochiladi</small></span><button onclick="dl59Hide();dl59List()">⬇️</button>`;
            t.classList.add('on'); clearTimeout(DL59.t); DL59.t = setTimeout(dl59Hide, 4000);
        }
        function dl59Hide(): void { const t = DL9.$id('dl59T'); if (t) t.classList.remove('on'); }
        function dl59TapOpen(): void { dl59Hide(); if (DL59.last) dl59Open(DL59.last.id); }
        // yuklab olishni ushlash
        if (typeof DL9.docDownload === 'function') DL9.docDownload = DL9.agmkExtend('docDownload', '5.9: ⬇️ Yuklab olinganlar va qisqa xabar', DL9.docDownload, (o: Function) => function (this: unknown, files: any[]) {
            const r = o.apply(this, arguments);
            try {
                const doc = Array.isArray(files) && files.length > 0 && files.every((f: any) => f && f.blob);
                const dialog = DL9.EX && !DL9.EX.pass && typeof DL9.exIsDoc === 'function' && DL9.exIsDoc(files); // format tanlash oynasi ochildi — hali yuklanmadi
                if (doc && !dialog) dl59Rec(files).then((x: any) => { if (x) dl59Toast(x, files.length); });
            } catch (e) { /* */ }
            return r;
        });
        // eski pastki qator va takroriy xabar
        if (typeof DL9.expSnack === 'function') DL9.expSnack = function () { /* 5.9: qisqa xabar (dl59Toast) bilan almashtirildi */ };
        if (typeof DL9.showToast === 'function') DL9.showToast = DL9.agmkExtend('showToast', '5.9: takroriy «Saqlandi» xabari', DL9.showToast, (o: Function) => function (this: unknown, msg: any) {
            if (typeof msg === 'string' && /^⬇️ Saqlandi: «Загрузки»/.test(msg)) return; return o.apply(this, arguments);
        });
        // ⬇️ tugmalari
        function dl59Btns(): void {
            try {
                const h = document.querySelector('#screen-main .header'); const bell = DL9.$id('bellBtn');
                if (h && !h.querySelector('.dl59-btn')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'dl59-btn dl59-home'; b.title = 'Yuklab olinganlar'; b.innerHTML = '⬇️<i></i>'; b.onclick = (e: any) => { e.stopPropagation(); dl59List(); }; if (bell && bell.parentElement) bell.parentElement.insertBefore(b, bell); else h.appendChild(b); }
                document.querySelectorAll('.h9-bar .h9-cap').forEach((cap: any) => { if (cap.querySelector('.dl59-btn')) return; const mo = cap.querySelector('.h9-mo'); const b = document.createElement('button'); b.type = 'button'; b.className = 'h9-b dl59-btn'; b.title = 'Yuklab olinganlar'; b.innerHTML = '<span>⬇️</span><i></i>'; b.onclick = (e: any) => { e.stopPropagation(); dl59List(); }; if (mo) cap.insertBefore(b, mo); else cap.appendChild(b); });
                dl59Badge();
            } catch (e) { /* */ }
        }
        if (typeof DL9.openScreen === 'function') DL9.openScreen = DL9.agmkExtend('openScreen', '5.9: ⬇️ Yuklab olinganlar tugmasi', DL9.openScreen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(dl59Btns, 60); return r; });
        window.addEventListener('agmk:login', () => setTimeout(dl59Btns, 400));
        setTimeout(dl59Btns, 500);
        (function () {
            const st = document.createElement('style'); st.id = 'v59dlCss';
            st.textContent = `
            .dl59-btn{position:relative}
            .dl59-btn i{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;border-radius:8px;background:#2563eb;color:#fff;font:700 10px/16px system-ui;font-style:normal;text-align:center;padding:0 3px;display:none}
            .dl59-btn.has i{display:block}
            .dl59-home{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.75);color:#fff;font-size:17px;display:inline-flex;align-items:center;justify-content:center;margin-right:6px;cursor:pointer}
            .h9-cap .dl59-btn span{font-size:17px;line-height:1}
            #dl59T{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(14px);z-index:30001;display:flex;align-items:center;gap:6px;max-width:92%;padding:7px 8px 7px 12px;border-radius:14px;background:rgba(15,23,42,.95);border:1px solid rgba(56,189,248,.55);color:#e2e8f0;font-size:12.5px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;box-shadow:0 6px 18px rgba(0,0,0,.45)}
            #dl59T.on{opacity:1;transform:translateX(-50%);pointer-events:auto}
            #dl59T .dl59-tm{cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
            #dl59T .dl59-tm small{display:block;color:#7dd3fc;font-size:11px}
            #dl59T button{flex:0 0 auto;border:0;border-radius:10px;background:rgba(30,41,59,.9);color:#fff;padding:6px 9px;font-size:14px}
            .dl59-l{display:flex;flex-direction:column;gap:6px;max-height:64vh;overflow:auto}
            .dl59-r{display:flex;align-items:center;gap:6px;padding:8px;border-radius:12px;background:rgba(30,41,59,.75);border:1px solid rgba(255,255,255,.08)}
            .dl59-m{flex:1;min-width:0;display:flex;align-items:center;gap:9px;cursor:pointer}
            .dl59-m i{font-style:normal;font-size:22px}.dl59-m span{min-width:0}
            .dl59-m b{display:block;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .dl59-m small{color:#94a3b8;font-size:11.5px}
            .dl59-r button{flex:0 0 auto;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(15,23,42,.8);color:#fff;font-size:15px}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(DL9, { DL59: DL59, dl59Open: dl59Open, dl59List: dl59List, dl59Share: dl59Share, dl59Chat: dl59Chat, dl59Del: dl59Del, dl59Hide: dl59Hide, dl59TapOpen: dl59TapOpen, dl59All: dl59All });
