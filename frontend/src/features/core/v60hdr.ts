        // =====================================================================
        // 6.0 — 1, 14, 15, 16-bandlar (muallif tanlovi: D2, 02.11.2026): BOSH SAHIFA TEPASI — yangi dizayn
        //  Eski dumaloq tugmalar (QR·🔔·⋮ guruhi, alohida 🔍 🎤, chap ustundagi doiralar) endi koʻrinmaydi —
        //  ularning OʻZI joyida qoladi (yashirin), yangi tugmalar ularni bosadi: vazifalar, sonlar (🔔 1, vazifa 1 …),
        //  eski funksiyalar oʻzgarishsiz ishlaydi. Shu bilan ⬇️ tugmasining gerb ustiga chiqishi va QR orqasidagi
        //  «yarim oy» ham yoʻqoladi.
        //   1-qator: gerb · AGMK-STTB · salomlashish (vaqtga qarab)          [☰ — faqat Web]  QR  🔔  ⋮
        //   Banner : SANOAT TEMIR YOʻL TRANSPORTI BOSHQARMASI / ish joyi (oltin) — Tab № / lavozim / F.I.Sh. (toʻliq)
        //            Klassik (va boshqa rasmli mavzular) — temir yoʻl rasmi ustida; Vitrina — rasmsiz kartochka.
        //   Panel  : Chat · Vazifalar · Kamchilik · Yuklangan · Maʼlumot (nomi bilan)
        //   Qidiruv: 🔍 maydon 🎤 · ↶ ↷
        //  Maʼlumot — kirgan xodimning roʻyxatdagi yozuvidan (lavozim — shtat jadvalidan). Oklad, manzil, telefon chiqmaydi.
        // =====================================================================
        const D60: any = window as any;
        var D60_SHORT: any = { 'Moddiy-texnik taʼminoti boʻlimi': 'MTTB', 'Kadrlar boʻlimi': 'Kadrlar boʻlimi', 'Buxgalteriya': 'Buxgalteriya' };
        function d60N(s: string): string { return String(s || '').replace(/[ʻʼ'`‘’]/g, 'ʼ').replace(/oʼ/g, 'oʻ').replace(/gʼ/g, 'gʻ').replace(/Oʼ/g, 'Oʻ').replace(/Gʼ/g, 'Gʻ'); }
        function d60Abbr(name: string): string {
            const n = d60N(name); if (D60_SHORT[n]) return D60_SHORT[n]; if (n.length <= 20) return n;
            return n.split(/[\s-]+/).filter(w => w && !/^(va|bilan|uchun|boʻyicha)$/i.test(w)).map(w => { const l = w.toLowerCase(); return /^(ch|sh)/.test(l) ? l.slice(0, 2).toUpperCase() : l[0].toUpperCase(); }).join('');
        }
        function d60Me(): any {
            const u: any = (typeof currentUser !== 'undefined' && currentUser) || {}, tb = typeof D60.cleanTabel === 'function' ? D60.cleanTabel(u.tabel) : String(u.tabel || '');
            const r: any = { tabel: tb, name: u.name || '', lav: '', wp: '' };
            try {
                const x = (D60.allXodims() || []).find((z: any) => z && z.item && (typeof D60.cleanTabel === 'function' ? D60.cleanTabel(z.item.tabel) : String(z.item.tabel)) === tb);
                if (x) { r.name = d60N(x.item.name) || r.name; const T: any = typeof shtatTree !== 'undefined' ? shtatTree : null, p = T && T.pos && x.item.posNo ? T.pos.find((q: any) => String(q.no) === String(x.item.posNo)) : null;
                    if (p) { r.lav = d60N(p.name); const un = (T.units || []).find((q: any) => q.id === p.u), g = p.g ? (T.groups || []).find((q: any) => q.id === p.g) : null;
                        r.wp = un && un.id === 'u1' && g ? d60Abbr(g.name) : un ? d60N(un.short || un.name) : ''; }
                    else if (x.item.lav) r.lav = x.item.lav;
                    if (!r.wp && x.su) r.wp = String(x.su); }
            } catch (e) { /* */ }
            if (!r.lav && u.role) r.lav = ({ admin: 'Administrator', editor: 'Muharrir', viewer: 'Kuzatuvchi' } as any)[u.role] || '';
            return r;
        }
        function d60Hi(): string { const h = new Date().getHours(); return h < 11 ? 'Xayrli tong!' : h < 17 ? 'Xayrli kun!' : 'Xayrli kech!'; }
        function d60E(s: any): string { return String(s == null ? '' : s).replace(/[&<>"]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]); }
        var D60_IC: any = {
            qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2M20 14v6h-6M17 17v3"/>',
            bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>', more: '<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',
            menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
            task: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 14l2 2 4-4"/>', alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
            dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
        };
        function d60Svg(k: string): string { return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${D60_IC[k]}</svg>`; }
        // eski tugmani bosish (vazifasi oʻsha)
        function d60Go(k: string, el?: any): void {
            try {
                const $ = D60.$id;
                if (k === 'qr') { const b = $('qrTopBtn'); if (b) b.click(); }
                else if (k === 'bell') { if (typeof D60.openNotifs === 'function') D60.openNotifs(); else { const b = $('bellBtn'); if (b) b.click(); } }
                else if (k === 'more') { if (typeof D60.wbMainMenu === 'function' && typeof D60.h9Ic === 'function') D60.wbMainMenu(el); else if (typeof D60.openProfile === 'function') D60.openProfile(); }
                else if (k === 'menu') { const b = $('mn59Menu'); if (b) b.click(); }
                else if (k === 'chat') { const b = $('chatTopBtn'); if (b) b.click(); }
                else if (k === 'task') { const b = $('opsBtn'); if (b) b.click(); }
                else if (k === 'alert') { const b = $('nsBtn'); if (b) b.click(); }
                else if (k === 'dl') { if (typeof D60.dl59List === 'function') D60.dl59List(); }
                else if (k === 'info') { const b = document.querySelector('#screen-main .ui-i-main') as any; if (b) b.click(); }
                else if (k === 'me') { if (typeof D60.openProfile === 'function') D60.openProfile(); }
            } catch (e) { /* */ }
        }
        function d60Logo(): string {
            try { const im = document.querySelector('#screen-main .app-logo img') as any; if (im && im.src) return `<img src="${im.src}" alt="">`; } catch (e) { /* */ }
            return '<i class="agmk-emb hdr-agmk"></i>';
        }
        function d60Banner(): string {
            const m = d60Me();
            return `<div class="d60-org">SANOAT TEMIR YOʻL TRANSPORTI BOSHQARMASI</div>
                <div class="d60-wr">${m.wp ? `<span class="d60-wp">${d60E(m.wp)}</span>` : '<span></span>'}${m.tabel ? `<span class="d60-tb">Tab № ${d60E(m.tabel)}</span>` : ''}</div>
                ${m.lav ? `<div class="d60-lv">${d60E(m.lav)}</div>` : ''}<div class="d60-nm">${d60E(m.name || 'AGMK STTB-AIT')}</div>`;
        }
        function d60Build(): void {
            try {
                const head = document.querySelector('#screen-main > .ui-head') as any; if (!head) return;
                let h = D60.$id('d60h');
                if (!h) {
                    h = document.createElement('div'); h.id = 'd60h';
                    const btn = (k: string, t: string, cls?: string) => `<button type="button" class="d60-b ${cls || ''}" data-k="${k}" title="${t}">${d60Svg(k)}<i class="d60-n"></i></button>`;
                    const dk = (k: string, t: string, cls?: string) => `<button type="button" class="d60-d ${cls || ''}" data-k="${k}"><span>${d60Svg(k)}<i class="d60-n"></i></span>${t}</button>`;
                    h.innerHTML = `<div class="d60-top"><button type="button" class="d60-b d60-menu" data-k="menu" title="Bosh menyu">${d60Svg('menu')}</button><div class="d60-lg">${d60Logo()}</div><div class="d60-tt"><b>AGMK <span style="white-space:nowrap">STTB-AIT</span></b><small class="d60-hi">${d60Hi()}</small></div>
                        ${btn('qr', 'QR-kod')}${btn('bell', 'Bildirishnomalar')}${btn('more', 'Boshqa amallar')}</div>
                        <div class="d60-bn" data-k="me" title="Profil">${d60Banner()}</div>
                        <div class="d60-dock">${dk('chat', 'Chat')}${dk('task', 'Vazifalar')}${dk('alert', 'Kamchilik', 'd60-ns')}${dk('dl', 'Yuklangan', 'dl59-btn')}${dk('info', 'Maʼlumot')}</div>
                        <div class="d60-sr"></div>`;
                    h.addEventListener('click', (e: any) => { const b = e.target && e.target.closest && e.target.closest('[data-k]'); if (!b || !h.contains(b)) return; e.stopPropagation(); d60Go(b.getAttribute('data-k'), b); });
                    head.insertBefore(h, head.firstChild);
                }
                // qidiruv va ↶ ↷ — asl elementlar koʻchiriladi (tinglovchilari bilan)
                const sr = h.querySelector('.d60-sr'), sw = head.querySelector('.search-wrap'), ur = D60.$id('undoRedoBar');
                if (sw && sw.parentElement !== sr) sr.appendChild(sw);
                if (ur && ur.parentElement !== sr) sr.appendChild(ur);
                head.classList.add('d60-on');
                h.classList.toggle('d60-vit', document.body.getAttribute('data-theme') === 'vitrina');
                const bn = h.querySelector('.d60-bn'), html = d60Banner(); if (bn && bn._h !== html) { bn.innerHTML = html; bn._h = html; }
                const hi = h.querySelector('.d60-hi'); if (hi) hi.textContent = d60Hi();
                d60Counts();
            } catch (e) { console.error('6.0 tepa qism', e); }
        }
        // sonlar (eski tugmalardan)
        function d60Counts(): void {
            const h = D60.$id('d60h'); if (!h) return;
            const num = (sel: string): string => { const e = document.querySelector(sel) as any; if (!e) return ''; if (e.classList.contains('hidden') || getComputedStyle(e).display === 'none' && !e.textContent) return ''; const t = String(e.textContent || '').trim(); return /^\d+\+?$/.test(t) && t !== '0' ? t : ''; };
            const set = (k: string, v: string) => { const i = h.querySelector(`[data-k="${k}"] .d60-n`); if (i) { i.textContent = v; i.classList.toggle('on', !!v); } };
            set('bell', num('#bellCount')); set('chat', num('#chatTopCount') || num('#chatTopBtn .chat-cnt')); set('task', num('#opsBtn i')); set('alert', num('#nsBtn i'));
            const ns = D60.$id('nsBtn'), nd = h.querySelector('.d60-ns'); if (nd) nd.classList.toggle('off', !ns || ns.classList.contains('hidden'));
        }
        setInterval(() => { if (document.querySelector('#screen-main.active')) d60Counts(); }, 1500);
        if (typeof D60.openScreen === 'function') D60.openScreen = D60.agmkExtend('openScreen', '6.0: bosh sahifa tepasi (D2)', D60.openScreen, (o: Function) => function (this: unknown, id: any) { const r = o.apply(this, arguments); if (id === 'screen-main') setTimeout(d60Build, 0); return r; });
        if (typeof D60.themeApply === 'function') D60.themeApply = D60.agmkExtend('themeApply', '6.0: tepa qism mavzuga moslanadi', D60.themeApply, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(d60Build, 0); return r; });
        window.addEventListener('agmk:login', () => setTimeout(d60Build, 300));
        setTimeout(d60Build, 1500);
        (function () {
            const st = document.createElement('style'); st.id = 'v60hdrCss';
            const H = '#screen-main > .ui-head.d60-on';
            st.textContent = `
            ${H}{background:none!important;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 6px!important;height:auto!important;min-height:0!important;box-shadow:none!important;border:0!important}
            ${H} > :not(#d60h){display:none!important}
            #d60h{display:flex;flex-direction:column;gap:12px;max-width:none;margin:0 auto;width:100%}
            #d60h .d60-top{display:flex;align-items:center;gap:8px}
            #d60h .d60-lg{width:46px;height:46px;flex:0 0 46px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #fbbf24,0 4px 14px rgba(251,191,36,.3);background:#1e293b;display:grid;place-items:center}
            #d60h .d60-lg img{width:100%;height:100%;object-fit:cover}#d60h .d60-lg i{width:30px;height:30px;display:block;background-size:contain}
            #d60h .d60-tt{flex:1;min-width:0;color:#fff;line-height:1.2}#d60h .d60-tt b{display:block;font-size:18px;font-weight:800;letter-spacing:.2px}#d60h .d60-tt small{color:#94a3b8;font-size:12px}
            #d60h .d60-b{position:relative;width:44px;height:44px;flex:0 0 44px;border-radius:14px;display:grid;place-items:center;color:#e2e8f0;background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);cursor:pointer;padding:0}
            #d60h .d60-menu{display:none}body.agmk-web #d60h .d60-menu{display:grid}
            #d60h .d60-n{position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font:700 11px/18px system-ui,sans-serif;font-style:normal;text-align:center;padding:0 4px;box-shadow:0 0 0 2px #0b1220;display:none}
            #d60h .d60-n.on,#d60h .dl59-btn.has .d60-n{display:block}
            #d60h .dl59-btn > i{display:none!important}
            #d60h .d60-bn{position:relative;border-radius:22px;overflow:hidden;padding:16px 18px;min-height:132px;display:flex;flex-direction:column;justify-content:center;cursor:pointer;
              background-image:linear-gradient(90deg,rgba(2,6,23,.86),rgba(2,6,23,.42)),var(--agmk-bgH1);background-size:cover;background-position:center 55%;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 28px rgba(0,0,0,.45);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9)}
            #d60h .d60-org{font-size:10.5px;letter-spacing:.8px;text-transform:uppercase;color:#cbd5e1;font-weight:600}
            #d60h .d60-wr{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-top:10px}
            #d60h .d60-wp{font-size:13px;font-weight:800;color:#fbbf24;letter-spacing:.3px}#d60h .d60-tb{font-size:11.5px;font-weight:700;color:#cbd5e1;white-space:nowrap}
            #d60h .d60-lv{margin-top:4px;font-size:13px;color:#e2e8f0;line-height:1.3}
            #d60h .d60-nm{margin-top:8px;font-size:17px;font-weight:800;line-height:1.25}
            #d60h.d60-vit .d60-bn{background:linear-gradient(160deg,#1c2537 0%,#151c2b 55%,#111827 100%);border-color:rgba(255,255,255,.09);text-shadow:none}
            #d60h.d60-vit .d60-bn::after{content:"";position:absolute;right:-40px;top:-50px;width:170px;height:170px;border-radius:50%;background:radial-gradient(rgba(251,191,36,.10),transparent 70%);pointer-events:none}
            #d60h.d60-vit .d60-org{color:#8b98ad}#d60h.d60-vit .d60-wp{color:#f5b301}#d60h.d60-vit .d60-lv{color:#e2e8f0}
            #d60h .d60-dock{display:flex;justify-content:space-around;gap:4px;padding:8px 4px;border-radius:22px;background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
            #d60h .d60-d{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:0;color:#cbd5e1;font-size:11px;font-weight:600;cursor:pointer;padding:0}
            #d60h .d60-d > span{position:relative;width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.07);color:#e2e8f0}
            #d60h .d60-d.off{display:none}
            #d60h.d60-vit .d60-dock{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px;padding:0;background:none;border:0;-webkit-backdrop-filter:none;backdrop-filter:none}
            #d60h.d60-vit .d60-d{height:66px;border-radius:16px;justify-content:center;background:linear-gradient(160deg,#1c2537,#121827);border:1px solid rgba(255,255,255,.09)}
            #d60h.d60-vit .d60-d > span{width:auto;height:auto;background:none}
            #d60h.d60-vit .d60-b{background:#121a2a;border-color:rgba(255,255,255,.1);-webkit-backdrop-filter:none;backdrop-filter:none}
            #d60h .d60-sr{display:flex;align-items:center;gap:6px}
            #d60h .d60-sr .search-wrap{flex:1;min-width:0;display:flex!important;align-items:center;gap:6px;height:50px;padding:0 6px 0 4px;border-radius:18px;background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);position:relative!important;margin:0!important;width:auto!important}
            #d60h.d60-vit .d60-sr .search-wrap{background:#121a2a;-webkit-backdrop-filter:none;backdrop-filter:none}
            #d60h .d60-sr .search-wrap .search-box{display:block!important;flex:1;min-width:0;width:auto!important;height:40px;background:none!important;border:0!important;color:#f1f5f9;font-size:15px;padding:0 4px!important;outline:none;box-shadow:none!important;position:static!important;opacity:1!important;visibility:visible!important}
            #d60h .d60-sr .search-wrap .search-icon{display:none!important}
            #d60h .d60-sr .search-wrap .srch-go{order:-1}
            #d60h .d60-sr .search-wrap .srch-btn,#d60h .d60-sr .search-wrap .mic-btn{position:static!important;width:38px!important;height:38px!important;min-width:38px;border-radius:12px!important;margin:0!important;display:grid!important;place-items:center;background:rgba(255,255,255,.06)!important;border:0!important;box-shadow:none!important;flex:0 0 38px}
            #d60h .d60-sr .search-wrap .srch-go{background:none!important}
            #d60h .d60-sr .search-wrap:not(.open) .srch-x{display:none!important}
            #d60h .d60-sr .search-wrap img{width:22px;height:22px}
            #d60h .d60-sr #undoRedoBar{display:flex!important;gap:4px;position:static!important}
            #d60h .d60-sr #undoRedoBar button{width:38px!important;height:50px!important;border-radius:14px!important;background:rgba(15,23,42,.62)!important;border:1px solid rgba(255,255,255,.12)!important;position:static!important}
            #d60h .d60-sr .search-wrap .srch-btn img,#d60h .d60-sr .search-wrap .mic-btn img{display:none!important}
            #d60h .d60-sr .search-wrap :is(.srch-btn,.mic-btn)::before,#d60h .d60-sr .search-wrap :is(.srch-btn,.mic-btn)::after,#d60h .d60-sr #undoRedoBar button::before,#d60h .d60-sr #undoRedoBar button::after{content:none!important;display:none!important}
            #d60h .d60-sr .search-wrap .srch-go{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%226.5%22/%3E%3Cpath%20d%3D%22M16%2016l4%204%22/%3E%3C/svg%3E") center/22px no-repeat!important}
            #d60h .d60-sr .search-wrap .mic-btn{background:rgba(255,255,255,.06) url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%229%22%20y%3D%223%22%20width%3D%226%22%20height%3D%2211%22%20rx%3D%223%22/%3E%3Cpath%20d%3D%22M5%2011a7%207%200%200%200%2014%200M12%2018v3%22/%3E%3C/svg%3E") center/22px no-repeat!important;color:transparent!important;font-size:0!important}
            #d60h .d60-sr .search-wrap .srch-x{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%206l12%2012M18%206L6%2018%22/%3E%3C/svg%3E") center/18px no-repeat!important;color:transparent!important;font-size:0!important}
            #d60h .d60-sr #btn-undo{background:rgba(15,23,42,.62) url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M9%2014L4%209l5-5%22/%3E%3Cpath%20d%3D%22M4%209h10.5a5.5%205.5%200%200%201%200%2011H11%22/%3E%3C/svg%3E") center/20px no-repeat!important}#d60h .d60-sr #btn-redo{background:rgba(15,23,42,.62) url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M15%2014l5-5-5-5%22/%3E%3Cpath%20d%3D%22M20%209H9.5a5.5%205.5%200%200%200%200%2011H13%22/%3E%3C/svg%3E") center/20px no-repeat!important}
            #d60h .d60-sr #undoRedoBar button{font-size:0!important;color:transparent!important}#d60h .d60-sr #undoRedoBar button img,#d60h .d60-sr #undoRedoBar button svg{display:none!important}
            #d60h .d60-sr #undoRedoBar button:disabled,#d60h .d60-sr #undoRedoBar button.off{opacity:.4}
            @media (min-width:720px){#d60h .d60-bn{min-height:150px;padding:20px 24px}#d60h .d60-nm{font-size:22px}#d60h .d60-lv{font-size:14.5px}#d60h .d60-d{font-size:12px}}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(D60, { d60Build: d60Build, d60Me: d60Me, d60Abbr: d60Abbr });
