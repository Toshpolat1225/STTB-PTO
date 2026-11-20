        // =====================================================================
        // v4.9 — muallif «oltin qoidasi» (24.10.2026)
        //  1) Har sahifa tepasida: chapda ☰ bosh menyu + ‹ orqaga; oʻngda bitta shisha kapsula 🔍 · ↶ · ↷ · ⋮
        //     ⋮ → Yuklash, Yuborish, Ovoz bilan qidirish, Qoʻllanma, 🎨 Sahifa dizayni va sahifaning boshqa tugmalari.
        //  2) ☰ → chapdan ochiladigan bosh menyu (bosh sahifa boʻlimlari va ichki boʻlimlari), har sahifadan tez oʻtish.
        //  3) Andozadan chiqib ketgan kartochkalar anʼanaviy kartochkaga (ikonka · nom · son · ›) qaytariladi:
        //     Ishlab chiqarish koʻrsatkichlari, Dalolatnomalar / Hisobotlar plitkalari, Kolodka va akt turlari («🤖 / ✍️ Qoʻlda»).
        //     Ikonkani 3 soniya bosib almashtirish va kartochka sozlamasi — boshqa kartochkalardagidek ishlaydi.
        //  4) Dizayn mavzulari: STTB Klassik (asosiy) + Shisha premium, Vitrina, Minimal. Eski mavzular olib tashlandi.
        //  Muallif dizayni (rang, shaffoflik, fon, ikonkalar) — !important bilan oʻz qatlamida qoladi, bu yerda unga tegilmaydi.
        // =====================================================================
        const Q9: any = window as any;
        var H9: any = { drw: false, menu: false, mo: null };
        function h9E(s: unknown): string { return Q9.escapeHtml(String(s == null ? '' : s)); }
        var H9_I: any = {
            menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', back: '<path d="M15 18l-6-6 6-6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
            undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
            more: '<circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
            dl: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', ul: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
            info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', pal: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-.9-.7-1.2-.7-2.1 0-.8.7-1.4 1.5-1.4H17a4 4 0 0 0 4-4c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
            home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21h4"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
            user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', warn: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>', ai: '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>', chev: '<path d="M9 6l6 6-6 6"/>'
        };
        function h9Ic(n: string, s?: number): string { return `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${H9_I[n] || ''}</svg>`; }
        function h9Act(): any { return document.querySelector('.screen.active'); }
        function h9Head(s: any): any { if (!s) return null; return s.querySelector(':scope > .ui-head') || s.querySelector(':scope > div'); }
        function h9Vis(e: any): boolean { return !!e && !e.classList.contains('hidden') && getComputedStyle(e).display !== 'none'; }

        // ---------- 1) Yuqori qator ----------
        // sarlavhadagi eski kichik tugmalar → ⋮ menyuga (oʻzi va hodisalari saqlanadi, faqat koʻrinmaydi)
        var H9_HIDE = '#undoRedoBar, .ui-i, .ui-x, .yk-btn, .warn-btn, :scope .ai-row > .ai-fab-btn, :scope .ai-row > .mic-btn';
        function h9Bar(s: any): void {
            if (!s || s.id === 'screen-main' || document.body.classList.contains('locked')) return;
            const head = h9Head(s); if (!head) return;
            const back = head.querySelector('.back-btn'); if (!back) return;
            let bar = head.querySelector(':scope > .h9-bar');
            if (!bar) {
                bar = document.createElement('div'); bar.className = 'h9-bar';
                bar.innerHTML = `<div class="h9-l"><button type="button" class="h9-c h9-menu" title="Bosh menyu" onclick="h9DrawerOpen()">${h9Ic('menu')}</button></div><div class="h9-cap">
                    <button type="button" class="h9-b h9-sr" title="Qidiruv" onclick="h9Search()">${h9Ic('search', 21)}</button><span class="h9-sep"></span>
                    <button type="button" class="h9-b h9-un" title="Ortga qaytarish" onclick="h9Undo(-1)">${h9Ic('undo', 21)}</button><button type="button" class="h9-b h9-re" title="Oldinga qaytarish" onclick="h9Undo(1)">${h9Ic('redo', 21)}</button><span class="h9-sep"></span>
                    <button type="button" class="h9-b h9-mo" title="Boshqa amallar" onclick="h9More(event)">${h9Ic('more', 21)}<i class="h9-dot"></i></button></div>`;
                head.insertBefore(bar, head.firstChild);
            }
            const L = bar.querySelector('.h9-l'); if (back.parentElement !== L) { back.classList.add('h9-back'); back.dataset.h9t = back.textContent || ''; back.innerHTML = h9Ic('back'); back.title = 'Orqaga'; L.appendChild(back); }
            head.classList.add('h9-head'); s.classList.add('h9-on');
            head.querySelectorAll(H9_HIDE).forEach((e: any) => { if (!e.closest('.h9-bar')) e.classList.add('h9-hid'); });
            const row = head.querySelector('.inner-header'); if (row) row.classList.add('h9-row');
            const ai = head.querySelector('.ai-row'), sw = head.querySelector('.search-wrap');
            const box = ai || sw; if (box && !box.classList.contains('h9-sopen')) { const inp = box.querySelector('input'); if (!(inp && inp.value)) box.classList.add('h9-shut'); }
            h9Sync(s);
        }
        function h9Sync(s?: any): void {
            s = s || h9Act(); if (!s) return; const bar = s.querySelector('.h9-bar'); if (!bar) return;
            const u = Q9.$id('btn-undo'), r = Q9.$id('btn-redo');
            bar.querySelector('.h9-un').classList.toggle('off', !!(u && u.disabled)); bar.querySelector('.h9-re').classList.toggle('off', !r || !!r.disabled);
            const w = s.querySelector('.warn-btn'); bar.querySelector('.h9-dot').classList.toggle('on', !!(w && /\d/.test(w.textContent || '') && !/^\D*0\D*$/.test(w.textContent || '')));
        }
        function h9Undo(d: number): void { try { if (d < 0) Q9.undoAction(); else Q9.redoAction(); } catch (e) { /* */ } setTimeout(() => h9Sync(), 120); }
        function h9Search(): void {
            const s = h9Act(); if (!s) return; const head = h9Head(s), box = head && (head.querySelector('.ai-row') || head.querySelector('.search-wrap'));
            const inp = (box && box.querySelector('input')) || (s.querySelector('.ui-body input.search-box, .sec-body input.search-box, input[type="search"]'));
            if (box) {
                const open = box.classList.contains('h9-shut'), sw = box.classList.contains('search-wrap') ? box : box.querySelector('.search-wrap');
                box.classList.toggle('h9-shut', !open); box.classList.toggle('h9-sopen', open);
                if (open) { if (sw && sw.classList.contains('srch') && !sw.classList.contains('open')) { const g = sw.querySelector('.srch-go'); if (g) g.click(); } if (inp) setTimeout(() => { try { inp.focus(); } catch (e) { /* */ } }, 80); }
                else if (sw && sw.classList.contains('open')) { const x = sw.querySelector('.srch-x'); if (x) x.click(); }
                if (!box.dataset.h9x) { box.dataset.h9x = '1'; box.addEventListener('click', (e: any) => { if (e.target.closest && e.target.closest('.srch-x')) setTimeout(() => { box.classList.add('h9-shut'); box.classList.remove('h9-sopen'); }, 60); }); }
                return;
            }
            if (inp) { try { inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); inp.focus(); } catch (e) { /* */ } return; }
            h9GlobalSearch();
        }
        function h9GlobalSearch(): void { try { Q9.openScreen('screen-main'); setTimeout(() => { const g = Q9.$id('globalSearchInput'); if (g) { g.scrollIntoView({ block: 'center' }); g.focus(); } }, 120); } catch (e) { /* */ } }
        // ⋮ menyu
        function h9MoreItems(s: any): any[] {
            const head = h9Head(s), q = (sel: string) => head && head.querySelector(sel), L: any[] = [], add = (ic: string, t: string, fn: () => void, extra?: string) => L.push({ ic: ic, t: t, fn: fn, x: extra || '' });
            const yk = q('.yk-btn'); if (yk) add('dl', 'Yuklash (Excel / PDF / Word)', () => yk.click());
            const ux = q('.ui-x'); if (ux) add('ul', 'Yuborish / ulashish', () => ux.click());
            const mic = q('.mic-btn'); add('mic', 'Ovoz bilan qidirish', () => { if (mic) { const b = mic.closest('.ai-row, .search-wrap'); if (b) { b.classList.remove('h9-shut'); b.classList.add('h9-sopen'); } mic.click(); } else h9GlobalSearch(); });
            const w = q('.warn-btn'); if (w && h9Vis(w) && /\d/.test(w.textContent || '')) add('warn', 'Ogohlantirishlar', () => w.click(), String(w.textContent || '').replace(/\D/g, ''));
            const af = q('.ai-row > .ai-fab-btn, .ai-fab-btn:not(.ai-float)'); if (af) add('ai', 'AI yordamchi', () => af.click());
            const ui = q('.ui-i') || s.querySelector('.ui-i'); if (ui) add('info', 'Qoʻllanma (shu sahifa)', () => ui.click());
            add('pal', 'Sahifa dizayni (rang, shaffoflik, fon)', () => { try { Q9.uiSetOpen('p', Q9.uiPageKey(s)); } catch (e) { if (ui) ui.click(); } });
            return L;
        }
        function h9More(ev: any): void {
            if (ev) ev.stopPropagation(); const s = h9Act(); if (!s) return; h9MenuClose();
            const L = h9MoreItems(s), btn = s.querySelector('.h9-mo'); if (!btn) return; const r = btn.getBoundingClientRect();
            const m = document.createElement('div'); m.id = 'h9Menu'; m.className = 'h9-pop';
            m.innerHTML = L.map((x, i) => `${i && (x.ic === 'mic' || x.ic === 'pal') ? '<hr>' : ''}<button type="button" data-i="${i}">${h9Ic(x.ic, 20)}<span>${h9E(x.t)}</span>${x.x ? `<em>${h9E(x.x)}</em>` : ''}</button>`).join('');
            m.style.top = Math.round(r.bottom + 8) + 'px'; m.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
            m.addEventListener('click', (e: any) => { const b = e.target.closest('button[data-i]'); if (!b) return; e.stopPropagation(); const x = L[+b.dataset.i]; h9MenuClose(); try { x.fn(); } catch (er) { console.error(er); } });
            document.body.appendChild(m); H9.menu = true;
            setTimeout(() => document.addEventListener('click', h9MenuClose, { once: true }), 0);
        }
        function h9MenuClose(): void { const m = Q9.$id('h9Menu'); if (m) m.remove(); H9.menu = false; }

        // ---------- 2) ☰ Bosh menyu (chapdan) ----------
        function h9MenuData(): any[] {
            const list = Q9.$id('main-card-list'); if (!list) return []; const out: any[] = []; let grp: any = null;
            Array.from(list.children).forEach((c: any) => {
                if (!c.classList || !c.classList.contains('btn-card')) return;
                const tx = c.querySelector('.btn-text'), name = tx ? Array.from(tx.childNodes).filter((n: any) => n.nodeType === 3).map((n: any) => n.textContent).join(' ').replace(/\s+/g, ' ').trim() : '';
                const cnt = c.querySelector('.mn-cnt'), ic = c.querySelector('.btn-icon'), it = { el: c, n: name || (tx ? tx.textContent.trim() : ''), c: cnt ? cnt.textContent.trim() : '', ic: ic ? ic.innerHTML : '', kids: [] as any[] };
                if (c.classList.contains('mn-sub')) { if (grp) grp.kids.push(it); else out.push(it); return; }
                if (getComputedStyle(c).display === 'none') { grp = null; return; } // huquq yoʻq / yashirilgan
                out.push(it); grp = c.classList.contains('mn-grp') ? it : null;
            });
            return out;
        }
        function h9DrawerOpen(): void {
            h9MenuClose(); let d = Q9.$id('h9Drw');
            if (!d) { d = document.createElement('div'); d.id = 'h9Drw'; d.innerHTML = '<div class="h9-dbg" onclick="h9DrawerClose()"></div><aside class="h9-dp"></aside>'; document.body.appendChild(d); }
            const D = h9MenuData(); H9.D = D; const me = (Q9.currentUser && Q9.currentUser.name) || '';
            const row = (x: any, i: string, sub?: boolean) => `<div class="h9-di${sub ? ' sub' : ''}" data-k="${i}"><span class="h9-dic">${x.ic}</span><span class="h9-dn">${h9E(x.n)}${x.c && !sub ? `<small>${h9E(x.c)}</small>` : ''}</span>${x.kids && x.kids.length ? `<span class="h9-dx" data-g="${i}">${h9Ic('chev', 18)}</span>` : `<span class="h9-dx">${h9Ic('chev', 18)}</span>`}</div>` +
                (x.kids && x.kids.length ? `<div class="h9-dk" data-gk="${i}">${x.kids.map((k: any, j: number) => row(k, i + '.' + j, true)).join('')}</div>` : '');
            d.querySelector('.h9-dp').innerHTML = `<div class="h9-dh"><b>AGMK STTB-AIT</b><button type="button" onclick="h9DrawerClose()">${h9Ic('x', 22)}</button></div>
                <div class="h9-ds">Boʻlimlar</div>${D.map((x, i) => row(x, String(i))).join('')}
                <div class="h9-ds">Umumiy</div>
                <div class="h9-di" data-f="home"><span class="h9-dic h9-ico">${h9Ic('home', 20)}</span><span class="h9-dn">Bosh sahifa</span></div>
                <div class="h9-di" data-f="srch"><span class="h9-dic h9-ico">${h9Ic('search', 20)}</span><span class="h9-dn">Qidiruv</span></div>
                <div class="h9-di" data-f="ntf"><span class="h9-dic h9-ico">${h9Ic('bell', 20)}</span><span class="h9-dn">Bildirishnomalar</span></div>
                <div class="h9-di" data-f="prof"><span class="h9-dic h9-ico">${h9Ic('user', 20)}</span><span class="h9-dn">Profil${me ? `<small>${h9E(me)}</small>` : ''}</span></div>
                <div class="h9-di" data-f="set"><span class="h9-dic h9-ico">${h9Ic('gear', 20)}</span><span class="h9-dn">Parametrlar</span></div>`;
            const p = d.querySelector('.h9-dp');
            p.onclick = (e: any) => {
                const g = e.target.closest('.h9-dx[data-g]'); if (g) { e.stopPropagation(); const k = p.querySelector(`[data-gk="${g.dataset.g}"]`); if (k) { k.classList.toggle('on'); g.classList.toggle('on'); } return; }
                const it = e.target.closest('.h9-di'); if (!it) return;
                const f = it.dataset.f; if (f) { h9DrawerClose(); setTimeout(() => { try { if (f === 'home') Q9.openScreen('screen-main'); else if (f === 'srch') h9GlobalSearch(); else if (f === 'ntf') Q9.openNotifs(); else if (f === 'prof') Q9.openProfile(); else if (f === 'set') Q9.openSettings(); } catch (er) { console.error(er); } }, 160); return; }
                const ks = String(it.dataset.k || '').split('.'), top = H9.D[+ks[0]], x = ks.length > 1 ? top.kids[+ks[1]] : top; if (!x) return;
                if (ks.length === 1 && top.kids.length && !top.el.getAttribute('onclick')) { const k = p.querySelector(`[data-gk="${ks[0]}"]`), gx = p.querySelector(`.h9-dx[data-g="${ks[0]}"]`); if (k) k.classList.toggle('on'); if (gx) gx.classList.toggle('on'); return; }
                h9DrawerClose(); setTimeout(() => { try { if (h9Act() && h9Act().id !== 'screen-main') Q9.openScreen('screen-main'); x.el.click(); } catch (er) { console.error(er); } }, 160);
            };
            requestAnimationFrame(() => d.classList.add('on')); H9.drw = true; if (h9Prem()) h9Icons(d).catch(() => { /* */ });
        }
        function h9DrawerClose(): void { const d = Q9.$id('h9Drw'); if (d) d.classList.remove('on'); H9.drw = false; }
        // telefon «Orqaga»: avval menyular yopiladi
        if (typeof Q9.agmkBack === 'function') { const _b = Q9.agmkBack; Q9.agmkBack = function () { if (H9.drw) { h9DrawerClose(); return true; } if (H9.menu) { h9MenuClose(); return true; } return _b.apply(this, arguments); }; }

        // ---------- 3) Andoza kartochka ----------
        /** element → anʼanaviy .btn-card (onclick, id, data saqlanadi; eski klass ham qoladi — boshqa modullar topishi uchun) */
        function h9Card(el: any, ic: string, title: string, sub: string, extra?: string): void {
            el.classList.add('btn-card', 'h9c');
            el.innerHTML = `<div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${title}${sub ? ` <small class="mn-cnt">${sub}</small>` : ''}${extra || ''}</span></div><span class="btn-arrow">›</span>`;
        }
        function h9Tpl(root: any): void {
            if (!root) return;
            // Dalolatnomalar / Hisobotlar plitkalari
            root.querySelectorAll('.hs-grid').forEach((g: any) => { g.classList.add('card-list', 'h9-list'); g.querySelectorAll(':scope > .hs-card:not(.h9c)').forEach((c: any) => {
                const b = c.querySelector(':scope > b'), sp = c.querySelector(':scope > span'), sm = c.querySelector(':scope > small');
                h9Card(c, b ? b.innerHTML : '📄', sp ? sp.innerHTML : '', sm ? sm.innerHTML.replace(/<br\s*\/?>/g, ' · ') : '');
            }); });
            // Ishlab chiqarish koʻrsatkichlari
            root.querySelectorAll('.vgm').forEach((g: any) => { g.classList.add('card-list', 'h9-list'); g.querySelectorAll(':scope > .vgm-c:not(.h9c)').forEach((c: any) => {
                const i = c.querySelector('.vgm-i'), b = c.querySelector('.vgm-t b'), sm = c.querySelector('.vgm-t small'), sp = c.querySelector('.vgm-t span');
                h9Card(c, i ? i.innerHTML : '', b ? b.innerHTML : '', sm ? sm.innerHTML : (sp ? sp.innerHTML : ''));
                if (i && /<img/.test(i.innerHTML)) { const ic = c.querySelector('.btn-icon'); ic.classList.add('mk-ic'); }
            }); });
            // Kolodka qabul dalolatnomasi (katta toʻq sariq karta)
            root.querySelectorAll('#kqCat:not(.h9c)').forEach((c: any) => { const b = c.querySelector('b'); h9Card(c, '🛞', b ? b.textContent.replace(/^\s*🛞\s*/, '') : 'Qabul qilish toʻgʻrisida dalolatnoma', 'Word / PDF'); c.classList.remove('kq-cat'); if (!c.parentElement.classList.contains('card-list')) { const w = document.createElement('div'); w.className = 'card-list h9-list'; c.parentNode.insertBefore(w, c); w.appendChild(c); } });
            // Akt turlari: «🤖 AI» + «✍️ Qoʻlda» juft tugmalari → bitta kartochka, ichida ikki kichik tugma
            root.querySelectorAll('.hs-new').forEach((w: any) => { w.classList.add('card-list', 'h9-list'); w.querySelectorAll(':scope > .db-two:not(.h9c)').forEach((c: any) => {
                const bs = Array.from(c.querySelectorAll('button')) as any[]; if (!bs.length) return; const ai = bs[0], man = bs[1];
                const t = String(ai.textContent || '').replace(/^\s*🤖\s*/, '').trim(), oa = ai.getAttribute('onclick') || '', om = man ? man.getAttribute('onclick') || '' : '';
                // 4.9 b113: kartochka — avval QOʻLDA kiritish oynasi; AI — oyna ichida ⋮ → «🤖 AI yordamida tuzish»
                c.setAttribute('onclick', om || oa || c.getAttribute('onclick') || ''); // 5.1: tugmada onclick boʻlmasa — kartaning oʻzinikini saqla (ОС-3, Bildirgi)
                h9Card(c, '📝', h9E(t), om ? '✍️ Qoʻlda kiritish · 🤖 AI — ⋮ ichida' : '');
            }); });
            try { if (typeof Q9.mkDecorate === 'function') Q9.mkDecorate(root); } catch (e) { /* */ }
        }

        // ---------- 5) Premium mavzular: oq fonli ikonkalar shaffof qilinadi (faqat koʻrinish; asl rasm saqlanadi) ----------
        var H9_PREM = ['glass', 'vitrina', 'minimal'], H9_CL: any = new Map();
        function h9Prem(): boolean { return H9_PREM.indexOf(document.body.getAttribute('data-theme') || '') >= 0; }
        function h9Unwhite(src: string): Promise<string> {
            if (H9_CL.has(src)) return H9_CL.get(src);
            const pr = new Promise<string>(res => {
                const im = new Image(); im.onload = () => {
                    try {
                        const k = Math.min(1, 256 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
                        const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d') as any; g.drawImage(im, 0, 0, w, h);
                        const D = g.getImageData(0, 0, w, h), d = D.data, seen = new Uint8Array(w * h), st: number[] = [];
                        const wh = (i: number) => { const o = i * 4; return d[o + 3] > 0 && d[o] > 228 && d[o + 1] > 228 && d[o + 2] > 228; };
                        for (let x = 0; x < w; x++) { st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++) { st.push(y * w, y * w + w - 1); }
                        let n = 0; while (st.length) { const i = st.pop() as number; if (seen[i] || !wh(i)) continue; seen[i] = 1; n++; d[i * 4 + 3] = 0; const x = i % w, y = (i / w) | 0; if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (y > 0) st.push(i - w); if (y < h - 1) st.push(i + w); }
                        if (n < w * h * 0.04) { res(src); return; } // oq fon yoʻq — oʻzgartirilmaydi
                        for (let i = 0; i < w * h; i++) { if (seen[i]) continue; const x = i % w, y = (i / w) | 0; const nb = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (y > 0 && seen[i - w]) || (y < h - 1 && seen[i + w]); if (!nb) continue; const o = i * 4, m = Math.min(d[o], d[o + 1], d[o + 2]); if (m > 190) d[o + 3] = Math.round(d[o + 3] * (255 - m) / 65); }
                        g.putImageData(D, 0, 0); res(c.toDataURL('image/png'));
                    } catch (e) { res(src); }
                }; im.onerror = () => res(src); im.src = src;
            });
            H9_CL.set(src, pr); return pr;
        }
        async function h9Icons(root?: any): Promise<void> {
            const R = root || document, on = h9Prem();
            const L = Array.from(R.querySelectorAll('.btn-icon img, .h9-dic img')) as any[];
            for (const img of L) {
                if (on) { if (img.dataset.h9o) continue; const o = img.getAttribute('src') || ''; if (!/^(data:image|blob:)/.test(o)) continue; img.dataset.h9o = o; const u = await h9Unwhite(o); if (img.dataset.h9o === o && u !== o) { img.src = u; img.classList.add('h9-t'); } }
                else if (img.dataset.h9o) { img.src = img.dataset.h9o; delete img.dataset.h9o; img.classList.remove('h9-t'); }
            }
        }
        if (typeof Q9.themeApply === 'function') Q9.themeApply = Q9.agmkExtend('themeApply', 'v4.9: premium ikonkalar', Q9.themeApply, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(() => { h9Icons(document).catch(() => { /* */ }); }, 50); return r; });
        setTimeout(() => { h9Icons(document).catch(() => { /* */ }); }, 2500);
        function h9Run(): void { const s = h9Act(); if (!s) return; try { h9Bar(s); } catch (e) { console.error('4.9 bar', e); } try { h9Tpl(s); } catch (e) { console.error('4.9 kartochka', e); } if (h9Prem()) h9Icons(s).catch(() => { /* */ }); }
        if (typeof Q9.openScreen === 'function') Q9.openScreen = Q9.agmkExtend('openScreen', 'v4.9: yuqori qator va andoza kartochka', Q9.openScreen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); h9DrawerClose(); h9MenuClose(); setTimeout(h9Run, 30); setTimeout(h9Run, 400); return r; });
        ['hsRender', 'slOpen', 'vgmOpen'].forEach(fn => { if (typeof Q9[fn] === 'function') Q9[fn] = Q9.agmkExtend(fn, 'v4.9: andoza kartochka', Q9[fn], (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); try { h9Tpl(h9Act()); } catch (e) { /* */ } return r; }); });
        ['undoAction', 'redoAction', 'saveDB'].forEach(fn => { if (typeof Q9[fn] === 'function') { const _f = Q9[fn]; Q9[fn] = function (this: unknown) { const r = _f.apply(this, arguments); setTimeout(() => h9Sync(), 60); return r; }; } });
        (function () { // keyin qoʻshilgan sarlavha tugmalari ham ⋮ ga, qayta chizilgan kartochkalar ham andozaga
            let t = 0; try { new MutationObserver(ms => { if (t) return; if (ms.every((m: any) => m.target && m.target.closest && (m.target.closest('.leaflet-container') || m.target.closest('#h9Drw') || m.target.closest('#h9Menu')))) return; t = setTimeout(() => { t = 0; h9Run(); }, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* */ }
        })();

        // ---------- 4) Dizayn mavzulari: Klassik + 3 yangi ----------
        try {
            if (Array.isArray(Q9.AGMK_THEMES)) {
                Q9.AGMK_THEMES.splice(0, Q9.AGMK_THEMES.length,
                    ['classic', 'STTB Klassik', 'Sizning asl uslubingiz — barcha tuzatishlar bilan', '#0b0f19', '#0ea5e9'],
                    ['glass', 'Shisha premium', 'Shaffof shisha kartochkalar, oltin son kapsulasi, texnika rasmi oltin nurda', '#0c1424', '#e9c97a'],
                    ['vitrina', 'Vitrina', 'Katta-kichik plitkalar, toʻq matt fon, texnika «sahnada» — TECH sayti uslubi', '#0a0e15', '#e9c97a'],
                    ['minimal', 'Minimal', 'Bitta toʻq panel, ingichka chiziqli roʻyxat — Apple / Tesla uslubi', '#0a0c10', '#f5f5f7']);
                if (typeof Q9.themeApply === 'function' && typeof Q9.themeGet === 'function') Q9.themeApply(Q9.themeGet(), false); // eski mavzu tanlangan boʻlsa — Klassik
            }
            if (typeof Q9.dashRender === 'function') { const _d = Q9.dashRender; Q9.dashRender = function (this: unknown) { const t = document.body.getAttribute('data-theme'); if (t === 'glass' || t === 'vitrina' || t === 'minimal') { const p = Q9.$id('dashPanel'); if (p) p.innerHTML = ''; return; } return _d.apply(this, arguments); }; }
        } catch (e) { console.error('4.9 mavzular', e); }
        // Shisha premium: texnika kartochkalarida shaffof texnika rasmi (oʻz ikonkasi qoʻyilgan boʻlsa — oʻshasi)
        function h9VgiCss(): string {
            const M: any = { tep: 'vgi-lok-tem', el: 'vgi-lok-el', vag: 'vgi-105', yol: 'vgi-yol-mot', avto: 'vgi-av-yuk', eks: 'vgi-av-ex', kran: 'vgi-av-kran' }; let css = '';
            const t = document.createElement('div'); t.style.cssText = 'position:absolute;left:-9999px;width:10px;height:10px'; document.body.appendChild(t);
            Object.keys(M).forEach(k => { t.className = 'vgi ' + M[k]; const u = getComputedStyle(t).backgroundImage; if (u && u !== 'none') css += `body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .btn-icon.mk-ic[data-mk="${k}"]:not(.ic-own){background:${u} center/contain no-repeat,radial-gradient(circle at 50% 62%,rgba(233,201,122,.24),rgba(255,255,255,.02) 70%)!important}body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .btn-icon.mk-ic[data-mk="${k}"]:not(.ic-own) img{opacity:0}`; });
            t.remove(); return css;
        }

        (function () {
            const st = document.createElement('style');
            st.textContent = `
/* --- 1) yuqori qator (hamma mavzuda) --- */
.h9-bar{display:flex;align-items:center;gap:8px;padding:2px 0 8px;position:relative;z-index:6}
.h9-l{display:flex;align-items:center;gap:8px;flex:0 0 auto}
.h9-c,.h9-head .back-btn.h9-back{width:42px;height:42px;min-width:42px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;padding:0!important;margin:0!important;background:rgba(15,23,42,.55)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);cursor:pointer;font-size:0!important;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.h9-cap{margin-left:auto;height:44px;border-radius:22px;display:flex;align-items:center;padding:0 4px;background:rgba(15,23,42,.55);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,.25)}
.h9-b{width:40px;height:40px;border:0;background:none;color:#fff;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;position:relative;padding:0}
.h9-b:active,.h9-c:active{background:rgba(255,255,255,.14)!important}.h9-b.off{opacity:.32;pointer-events:none}
.h9-sep{width:1px;height:22px;background:rgba(255,255,255,.22);margin:0 2px}
.h9-dot{position:absolute;top:7px;right:8px;width:9px;height:9px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 2px rgba(15,23,42,.9);display:none}.h9-dot.on{display:block}
.h9-hid{display:none!important}
.h9-row{justify-content:flex-start!important;gap:0!important}.h9-row>h2,.h9-row>.sec-title{text-align:left!important;margin:0!important;flex:1 1 auto;font-size:26px!important;line-height:1.15}
.h9-row>.undo-slot,.h9-row>div[style*="width: 60px"],.h9-row>div[style*="width:60px"]{display:none!important}
.h9-shut{display:none!important}.h9-sopen{animation:h9in .18s ease}@keyframes h9in{from{opacity:0;transform:translateY(-4px)}}
.h9-pop{position:fixed;z-index:9000;min-width:236px;max-width:300px;border-radius:16px;padding:6px;background:rgba(15,23,42,.96);border:1px solid rgba(255,255,255,.14);box-shadow:0 14px 34px rgba(0,0,0,.6);animation:h9in .15s ease}
.h9-pop button{display:flex;align-items:center;gap:12px;width:100%;border:0;background:none;color:#e5e7eb;font:500 15px/1.25 inherit;padding:11px 12px;border-radius:10px;text-align:left;cursor:pointer}
.h9-pop button:active{background:rgba(255,255,255,.08)}.h9-pop button span{flex:1}.h9-pop em{font-style:normal;background:#ef4444;color:#fff;border-radius:999px;font-size:11.5px;font-weight:800;padding:1px 7px}
.h9-pop hr{border:0;border-top:1px solid rgba(255,255,255,.1);margin:4px 6px}
/* --- 2) ☰ bosh menyu --- */
#h9Drw{position:fixed;inset:0;z-index:8900;pointer-events:none}#h9Drw.on{pointer-events:auto}
.h9-dbg{position:absolute;inset:0;background:rgba(0,0,0,.5);opacity:0;transition:opacity .22s}#h9Drw.on .h9-dbg{opacity:1}
.h9-dp{position:absolute;left:0;top:0;bottom:0;width:min(86vw,360px);background:#0d1424;border-right:1px solid rgba(255,255,255,.1);box-shadow:8px 0 30px rgba(0,0,0,.5);transform:translateX(-102%);transition:transform .24s ease;overflow-y:auto;padding:14px 12px 30px}
#h9Drw.on .h9-dp{transform:none}
.h9-dh{display:flex;align-items:center;justify-content:space-between;padding:6px 6px 12px}.h9-dh b{font-size:20px;color:#fff;letter-spacing:.5px}.h9-dh button{border:0;background:none;color:#cbd5e1;padding:6px;cursor:pointer}
.h9-ds{color:#7dd3fc;font-size:12.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin:12px 8px 6px}
.h9-di{display:flex;align-items:center;gap:12px;padding:8px;border-radius:12px;color:#e5e7eb;cursor:pointer}.h9-di:active{background:rgba(255,255,255,.07)}
.h9-di.sub{padding:6px 8px 6px 22px}
.h9-dic{width:38px;height:38px;flex:0 0 38px;border-radius:10px;overflow:hidden;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:20px}.h9-di.sub .h9-dic{width:30px;height:30px;flex-basis:30px;border-radius:8px}
.h9-dic img{width:100%;height:100%;object-fit:cover}.h9-dic.h9-ico{background:rgba(255,255,255,.07);color:#cbd5e1}
.h9-dn{flex:1;font-size:15px;font-weight:600;line-height:1.25}.h9-dn small{display:block;color:#94a3b8;font-weight:500;font-size:12px}
.h9-dx{color:#64748b;display:inline-flex;padding:6px;border-radius:8px;transition:transform .2s}.h9-dx[data-g]{color:#cbd5e1}.h9-dx.on{transform:rotate(90deg)}
.h9-dk{display:none}.h9-dk.on{display:block}
/* --- 3) andoza kartochka (klassik .btn-card koʻrinishi) --- */
.vgm-c.h9c,.hs-card.h9c,.db-two.h9c,.kq-cat.h9c,#kqCat.h9c{background:rgba(20,30,45,.75);border:1px solid rgba(255,255,255,.15);border-radius:12px;box-shadow:none;color:#fff;width:auto;margin:0}
.h9-list{display:flex!important;flex-direction:column!important;gap:12px!important;grid-template-columns:none!important}
.btn-card.h9c{flex-direction:row!important;align-items:center!important;justify-content:space-between!important;min-height:0;height:auto;padding:16px!important;gap:0!important;text-align:left}
.btn-card.h9c .btn-icon:not(.mk-ic){width:56px;height:56px;min-width:56px;flex:0 0 56px;border-radius:14px;background:#fff;border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.45);display:inline-flex;align-items:center;justify-content:center;font-size:30px!important;margin-right:4px}
.btn-card.h9c .btn-icon img{width:100%;height:100%;object-fit:cover}
.btn-card.h9c .btn-text{display:block;font-weight:700;color:#fff}.btn-card.h9c .mn-cnt{display:block;margin:3px 0 0;font-size:12px;font-weight:600;color:#94a3b8}
.btn-card.h9c b,.btn-card.h9c span,.btn-card.h9c small{font-size:inherit}
.h9-two{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.h9-tb{border:1px solid rgba(125,211,252,.45);background:rgba(14,165,233,.14);color:#e0f2fe;border-radius:999px;font:700 12.5px/1 inherit;padding:7px 11px;cursor:pointer}.h9-tb.m{border-color:rgba(74,222,128,.45);background:rgba(34,197,94,.14);color:#dcfce7}
/* --- 4) mavzu oʻzgaruvchilari (umumiy mavzu qoidalari !important bilan shularni ishlatadi) --- */
[data-theme="glass"]{--t-bg:#0b0f19;--t-bbg:var(--agmk-bgB);--t-hbg:var(--agmk-bgH2);--t-card:linear-gradient(135deg,rgba(30,41,59,.62),rgba(15,23,42,.74));--t-card2:rgba(15,23,42,.92);--t-border:rgba(255,255,255,.10);--t-accent:#e9c97a;--t-accent2:#f5dfa3;--t-on:#1a1405;--t-title:#fff;--t-text:#f8fafc;--t-muted:#94a3b8;--t-r:20px;--t-glow:inset 0 1px 0 rgba(255,255,255,.08);--t-hfont:inherit}
[data-theme="vitrina"]{--t-bg:#0a0e15;--t-bbg:none;--t-hbg:none;--t-card:radial-gradient(120% 90% at 70% 80%,#2a3446 0,#141b28 55%,#0b1018 100%);--t-card2:#141b28;--t-border:rgba(255,255,255,.07);--t-accent:#e9c97a;--t-accent2:#f5dfa3;--t-on:#1a1405;--t-title:#fff;--t-text:#fff;--t-muted:#9aa4b2;--t-r:18px;--t-glow:0 0 0 0 transparent;--t-hfont:inherit}
[data-theme="minimal"]{--t-bg:#07090d;--t-bbg:var(--agmk-bgB);--t-hbg:var(--agmk-bgH2);--t-card:rgba(10,12,16,.82);--t-card2:rgba(10,12,16,.94);--t-border:rgba(255,255,255,.08);--t-accent:#f5f5f7;--t-accent2:#d4d4d8;--t-on:#0a0a0a;--t-title:#f5f5f7;--t-text:#f5f5f7;--t-muted:#86868b;--t-r:24px;--t-glow:0 0 0 0 transparent;--t-hfont:inherit}
body:is([data-theme="glass"],[data-theme="minimal"]) #screen-main > div:first-child{background-image:var(--agmk-bgH1)!important;background-position:center!important}
/* --- 4a) Shisha premium --- */
body[data-theme="glass"] .btn-card{background:linear-gradient(135deg,rgba(30,41,59,.62),rgba(15,23,42,.74));border:1px solid rgba(255,255,255,.10);border-radius:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 8px 22px rgba(0,0,0,.25);position:relative}
body[data-theme="glass"] .btn-card .btn-icon.mk-ic,body[data-theme="glass"] .btn-card.h9c .btn-icon:not(.mk-ic){width:70px!important;height:52px!important;min-width:70px;flex:0 0 70px;border-radius:14px;border:1px solid rgba(233,201,122,.18);background:radial-gradient(circle at 50% 62%,rgba(233,201,122,.20),rgba(255,255,255,.03) 70%)!important;box-shadow:none}
body[data-theme="glass"] .btn-card .btn-icon.mk-ic img{border-radius:10px}
body[data-theme="glass"] .btn-card .btn-text{font-weight:650;letter-spacing:.1px}
body[data-theme="glass"] .btn-card .mn-cnt{display:inline-block;color:#e9c97a!important;font-weight:700;border:1px solid rgba(233,201,122,.35);background:rgba(233,201,122,.08);border-radius:999px;padding:2px 9px;margin-left:6px;font-size:12px}
body[data-theme="glass"] .btn-card.h9c .mn-cnt{margin:4px 0 0}
body[data-theme="glass"] .btn-arrow{color:#64748b}
/* --- 4b) Vitrina --- */
body[data-theme="vitrina"] .screen:not(#screen-main) .ui-body{background:#0a0e15!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list){display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card{flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;min-height:172px!important;border-radius:18px!important;padding:14px!important;background:radial-gradient(120% 90% at 70% 80%,#2a3446 0,#141b28 55%,#0b1018 100%)!important;border:1px solid rgba(255,255,255,.07)!important;position:relative!important;overflow:hidden!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card:first-child{grid-column:1/-1!important;min-height:196px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-card-content{flex-direction:column-reverse!important;align-items:flex-start!important;width:100%!important;gap:10px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-icon{align-self:flex-end!important;width:62%!important;height:84px!important;min-width:0!important;flex:0 0 auto!important;border:0!important;background-color:transparent!important;box-shadow:none!important;border-radius:12px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-text{font-size:17px!important;font-weight:700!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .mn-cnt{display:block!important;color:#e9c97a!important;margin:6px 0 0!important;font-size:13px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-arrow{position:absolute!important;right:12px!important;bottom:10px!important;color:#e9c97a!important}
/* --- 4c) Minimal --- */
body[data-theme="minimal"] :is(.card-list,.mn-inner,.h9-list){gap:0!important;border-radius:24px!important;padding:4px 14px!important;background:rgba(10,12,16,.82)!important;border:1px solid rgba(255,255,255,.08)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important}
body[data-theme="minimal"] :is(.card-list,.mn-inner,.h9-list)>.btn-card{background:transparent!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.07)!important;border-radius:0!important;box-shadow:none!important;padding:14px 2px!important;backdrop-filter:none!important}
body[data-theme="minimal"] :is(.card-list,.mn-inner,.h9-list)>.btn-card:last-child{border-bottom:0!important}
body[data-theme="minimal"] .btn-card .btn-icon.mk-ic,body[data-theme="minimal"] .btn-card.h9c .btn-icon:not(.mk-ic){width:64px!important;height:42px!important;min-width:64px!important;flex:0 0 64px!important;border:0!important;box-shadow:none!important;background-color:transparent!important;border-radius:8px!important}
body[data-theme="minimal"] .btn-card .btn-text{color:#f5f5f7!important;font-weight:600!important}body[data-theme="minimal"] .btn-card .mn-cnt{color:#86868b!important}

/* --- 5) premium mavzular: bosh sahifa tugmalari, ichki sahifa rangi --- */
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main > div:first-child :is(#chatTopBtn,#opsBtn,#bellBtn,.main-dots,.srch-go,#mic-globalSearchInput,#qrTopBtn,.ui-i-main,.warn-btn,.bell-btn,.ops-btn,.qr-top,.chat-top){width:44px!important;height:44px!important;min-width:44px;border-radius:50%!important;background-color:rgba(15,23,42,.5)!important;border:1px solid rgba(255,255,255,.16)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,.3)!important;color:#fff!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .srch-go img,body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #mic-globalSearchInput img{opacity:0!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .srch-go{background:rgba(15,23,42,.5) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-4.3-4.3'/%3E%3C/svg%3E") center/22px no-repeat!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #mic-globalSearchInput{background:rgba(15,23,42,.5) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round'%3E%3Crect x='9' y='3' width='6' height='11' rx='3'/%3E%3Cpath d='M5 11a7 7 0 0 0 14 0M12 18v3'/%3E%3C/svg%3E") center/22px no-repeat!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .btn-icon img.h9-t{object-fit:contain!important;filter:drop-shadow(0 8px 10px rgba(0,0,0,.45))}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .btn-icon.mk-ic,body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .h9-dic{background-color:transparent!important;border-color:transparent!important;box-shadow:none!important}
body[data-theme="glass"] .btn-icon.mk-ic{background:radial-gradient(circle at 50% 62%,rgba(233,201,122,.22),rgba(255,255,255,.03) 70%)!important;border:1px solid rgba(233,201,122,.18)!important}
/* ichki sahifalar: koʻk bloklar mavzu rangiga */
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) :is(.pg-hd,.pg-ov,.pgr,.pg-more,.pg-c,.pg-nm,.pg-ppr,.vg-more,.sl-seg,.sl-card,.yk-c,.yk-r,.yk-o,.mm-b,.file-upload-box,.alb-btn,.help-i,.xk-pc,.vg-hero-wrap,.hs-box,.nd-form,.hs-row,.ms-big){background:var(--t-card2)!important;background-image:none!important;border-color:var(--t-border)!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) :is(.pg-t,.yk-chip.a,.vs-btn,.sec-tabs i.on,.sl-seg .on,.stats-grid .stat-box.vc-on,.tab.active){background:var(--t-accent)!important;background-image:none!important;color:var(--t-on)!important;border-color:var(--t-accent)!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) :is(.yk-chip,.sec-tabs i,.qr-pb){background:var(--t-card2)!important;border-color:var(--t-border)!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .screen :is(input,select,textarea):not([type="checkbox"]):not([type="radio"]):not([type="range"]){background-color:rgba(255,255,255,.05)!important;border-color:var(--t-border)!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) .stat-box{background:var(--t-card)!important}

/* --- 6) premium: bosh sahifa yuqorisi — markaziy logo oʻrniga ixcham brend, tugmalar ikki qatorda tartibli --- */
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main > .ui-head{position:relative!important;padding-bottom:10px!important;min-height:0!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .header{position:relative!important;height:118px!important;margin:0!important;padding:0!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .app-logo{display:none!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .main-brand{position:static!important;width:auto!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .main-brand h1{position:absolute!important;left:2px!important;top:14px!important;right:auto!important;margin:0!important;font-size:22px!important;letter-spacing:.6px;display:flex;align-items:center;gap:8px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .mb-row{position:absolute!important;right:0!important;top:4px!important;height:46px;border-radius:23px;display:flex!important;align-items:center;gap:2px;padding:0 4px;background:rgba(15,23,42,.5);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,.3)}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .mb-row :is(#bellBtn,.main-dots){position:relative!important;left:auto!important;top:auto!important;right:auto!important;width:40px!important;height:40px!important;min-width:40px;border:0!important;background:none!important;box-shadow:none!important;border-radius:50%!important;margin:0!important;color:#fff!important;font-size:19px!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main #qrTopBtn{top:19px!important;right:120px!important;left:auto!important;bottom:auto!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .header :is(#chatTopBtn,#opsBtn,#nsBtn){position:absolute!important;top:70px!important;bottom:auto!important;right:auto!important;margin:0!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main #chatTopBtn{left:0!important}body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main #opsBtn{left:54px!important}body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main #nsBtn{left:108px!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .ui-i-main{position:absolute!important;top:85px!important;left:177px!important;bottom:auto!important;right:auto!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main > .ui-head > div[style*="display: flex"]{position:absolute!important;top:85px!important;right:15px!important;left:auto!important;width:auto!important;margin:0!important;z-index:5}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main > .ui-head > div[style*="display: flex"]:has(.srch.open){left:15px!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main :is(#chatTopBtn,#opsBtn,#nsBtn,.ui-i-main,#qrTopBtn,.srch-go,#mic-globalSearchInput){width:44px!important;height:44px!important;min-width:44px;border-radius:50%!important;background-color:rgba(15,23,42,.5)!important;border:1px solid rgba(255,255,255,.16)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 12px rgba(0,0,0,.3)!important;color:#fff!important;display:inline-flex!important;align-items:center;justify-content:center;padding:0!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .ui-i-main{font-size:19px!important;line-height:1!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main #undoRedoBar{display:none!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main > .ui-head:has(.srch.open) :is(#chatTopBtn,#opsBtn,#nsBtn,.ui-i-main){visibility:hidden!important}
body:is([data-theme="glass"],[data-theme="vitrina"],[data-theme="minimal"]) #screen-main .search-wrap.srch.open .search-box{background:rgba(15,23,42,.6)!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:22px!important;color:#fff}
/* mavzu tanlash namunalari */
.th-sw[data-theme="glass"]{background:radial-gradient(circle at 50% 40%,#1e3a5f,#0c1424)!important}.th-sw[data-theme="vitrina"]{background:linear-gradient(135deg,#2a3446,#0a0e15)!important}.th-sw[data-theme="minimal"]{background:#0a0c10!important;border:1px solid #333}
`;
            document.head.appendChild(st);
            setTimeout(() => { try { const s2 = document.createElement('style'); s2.textContent = h9VgiCss(); document.head.appendChild(s2); } catch (e) { /* */ } }, 1200);
        })();
