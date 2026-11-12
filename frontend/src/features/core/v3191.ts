        // =====================================================================
        // v3.19.1–3.19.2 — bosh sahifa tartibi va bildirishnomalar (docs/KAMCHILIKLAR.md)
        //  • K-27: «📷 QR skaner» — bosh sahifaning yuqori qismida, sarlavha tagida faqat QR belgisi (dumaloq tugma)
        //  • K-33: «👷 Mening ishchilarim» — «Ishchi xodimlar» guruhida, «Struktura» tagida (faqat qoʻl ostida odami bor rahbarda).
        //          Asosiy sabab: myCards() `window.currentUser` ni tekshirardi, lekin currentUser — `let` (window da yoʻq),
        //          shuning uchun karta baʼzan umuman chiqmasdi; endi toʻgʻridan-toʻgʻri tekshiriladi, rollar kechroq kelsa ham qayta.
        //  • Hujjat «📷 Skaner» — «📊 Dalolatnoma va hisobotlar» ichida (bosh sahifada emas)
        //  • K-34: bildirishnoma bosilganda oʻz sahifasi ochiladi (MM muddatlari → MM Nazorat «muddati oʻtgan»,
        //          oʻz muddatlari, hujjatlar, bilim sinovi, polojeniya, maxsus kiyim). Nomaʼlum tur — avvalgidek.
        // =====================================================================
        const Q1: any = window as any;

        // ---------- K-27: yuqori qismda QR belgisi ----------
        var QR_MAIN_ICO = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#fff"/>'
            + '<g fill="#0f3d73"><rect x="4" y="4" width="9" height="9" rx="1.5"/><rect x="19" y="4" width="9" height="9" rx="1.5"/><rect x="4" y="19" width="9" height="9" rx="1.5"/></g>'
            + '<g fill="#fff"><rect x="6" y="6" width="5" height="5"/><rect x="21" y="6" width="5" height="5"/><rect x="6" y="21" width="5" height="5"/></g>'
            + '<g fill="#0f3d73"><rect x="7.5" y="7.5" width="2" height="2"/><rect x="22.5" y="7.5" width="2" height="2"/><rect x="7.5" y="22.5" width="2" height="2"/>'
            + '<rect x="16" y="16" width="3" height="3"/><rect x="21" y="16" width="3" height="3"/><rect x="25" y="20" width="3" height="3"/><rect x="16" y="21" width="3" height="3"/><rect x="20" y="25" width="3" height="3"/><rect x="25" y="25" width="3" height="3"/><rect x="16" y="26" width="2" height="2"/></g></svg>';
        function qrTopBtn(): void {
            try {
                const scr = Q1.$id('screen-main'), hdr = scr && scr.firstElementChild as HTMLElement; if (!hdr || typeof Q1.qrScanOpen !== 'function') return;
                let b = Q1.$id('qrTopBtn') as HTMLElement;
                if (!b) {
                    b = document.createElement('button'); b.id = 'qrTopBtn'; b.setAttribute('type', 'button'); b.className = 'qr-top'; b.title = 'QR skaner — texnika yorligʻini skanerlash';
                    b.setAttribute('aria-label', 'QR skaner'); b.innerHTML = QR_MAIN_ICO; b.onclick = (e: Event) => { e.stopPropagation(); Q1.qrScanOpen(); };
                    if (getComputedStyle(hdr).position === 'static') hdr.style.position = 'relative'; hdr.appendChild(b);
                }
                // joyi: «AGMK-STTB» sarlavhasi tagida, oʻng tomonda (mikrofon tugmasi ustunida)
                const hb = hdr.getBoundingClientRect(), t = scr.querySelector('.main-brand h1') as HTMLElement, mic = Q1.$id('mic-globalSearchInput') as HTMLElement;
                const tb = t ? t.getBoundingClientRect() : null, mb = mic ? mic.getBoundingClientRect() : null;
                const top = tb && tb.height ? tb.bottom - hb.top + 8 : 64, right = mb && mb.width ? Math.max(8, hb.right - mb.right) : 15;
                b.style.top = Math.round(top) + 'px'; b.style.right = Math.round(right) + 'px';
            } catch (e) { /* bosh sahifa hali chizilmagan — keyingi urinishda */ }
        }

        // ---------- K-33: menyu — «Mening ishchilarim» Ishchi xodimlar → Struktura tagida ----------
        (function (): void {
            try {
                const D: any[] = Q1.MENU_DEF; if (!Array.isArray(D) || D.some(d => d[0] === '2.3')) return;
                let i = D.findIndex(d => d[0] === '2.2'); if (i < 0) i = D.findIndex(d => d[0] === '2.1');
                D.splice(i >= 0 ? i + 1 : D.length, 0, ['2.3', (c: Element) => c.id === 'myCard', 1, 'xod']);
            } catch (e) { /* menyu moduli yoʻq */ }
        })();
        // Rollar va xodimlar roʻyxati serverdan kechroq kelishi mumkin (birinchi kirish) — qayta tekshiriladi
        var Q1T: any = 0;
        function q1Cards(): void {
            qrTopBtn();
            try { if (typeof Q1.myCards === 'function') Q1.myCards(); } catch (e) { /* */ }
        }
        window.addEventListener('agmk:login', () => { [900, 4000, 12000, 30000].forEach(t => setTimeout(q1Cards, t)); });
        window.addEventListener('resize', () => { clearTimeout(Q1T); Q1T = setTimeout(qrTopBtn, 200); });
        if (typeof Q1.hideLock === 'function') Q1.hideLock = Q1.agmkExtend('hideLock', 'v3.19.1: QR belgisi, kartalarni qayta tekshirish', Q1.hideLock, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); [300, 1000, 5000, 15000].forEach(t => setTimeout(q1Cards, t)); return r;
        });
        if (typeof Q1.syncApply === 'function') Q1.syncApply = Q1.agmkExtend('syncApply', 'v3.19.1: sinxrondan keyin kartalar', Q1.syncApply, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); clearTimeout(Q1T); Q1T = setTimeout(q1Cards, 600); return r;
        });
        if (typeof Q1.openScreen === 'function') Q1.openScreen = Q1.agmkExtend('openScreen', 'v3.19.2: QR belgisi joyi', Q1.openScreen, (o: Function) => function (this: unknown, id: string) {
            const r = o.apply(this, arguments); if (id === 'screen-main') setTimeout(qrTopBtn, 60); return r;
        });
        setTimeout(q1Cards, 1500); setTimeout(q1Cards, 3200);

        // ---------- Hujjat skaneri — «Dalolatnoma va hisobotlar» ichida ----------
        function q1ScanCard(): void {
            try {
                const H = Q1.HS, b = Q1.secBody && Q1.secBody('screen-hisob'); if (!b || typeof Q1.v9ScanOpen !== 'function') return;
                if (!H || H.akt || H.cat || H.chk || (Q1.UP && Q1.UP.mode === 'scan') || H.tab === 'haft') return;
                if (b.querySelector('.q1-scan')) return;
                const c = document.createElement('div'); c.className = 'btn-card q1-scan'; c.setAttribute('data-search', 'skaner scan rasm pdf word excel jpg hujjat oʻgirish');
                c.onclick = () => { Q1.v9ScanOpen(); };
                c.innerHTML = '<div class="btn-card-content"><span class="btn-icon">📷</span><span class="btn-text">Skaner<small style="display:block;font-size:11px;opacity:.75">qogʻozdagi hujjat → PDF · Word · Excel · JPG</small></span></div><span class="btn-arrow">›</span>';
                b.insertBefore(c, b.firstChild);
            } catch (e) { /* */ }
        }
        if (typeof Q1.hsRender === 'function') Q1.hsRender = Q1.agmkExtend('hsRender', 'v3.19.2: hujjat skaneri shu boʻlimda', Q1.hsRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); q1ScanCard(); return r; });
        if (typeof Q1.upRender === 'function') Q1.upRender = Q1.agmkExtend('upRender', 'v3.19.2: hujjat skaneri shu boʻlimda', Q1.upRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); q1ScanCard(); return r; });

        // ---------- K-34: bildirishnoma → oʻz sahifasi ----------
        function q1NotifGo(n: any): boolean {
            const t = String((n && n.text) || ''), ic = String((n && n.icon) || '');
            const mm = (tab: string, st?: string): void => { try { if (Q1.MM) { Q1.MM.st = st || ''; Q1.MM.q = ''; } Q1.openMM(tab); } catch (e) { /* */ } };
            const view = (): boolean => { try { return typeof Q1.canMMView === 'function' && Q1.canMMView(); } catch (e) { return false; } };
            if (/Xodimlaringizning MM muddatlari|TB nazorati/.test(t)) { mm(view() ? 'nazorat' : 'meniki', view() ? 'bad' : ''); return true; }
            if (/Mehnat muhofazasi — sizning muddatlaringiz/.test(t)) { mm('meniki'); return true; }
            if (/Hujjat amal qilish muddati/.test(t)) { mm('docs'); return true; }
            if (/^Bilim sinovi/.test(t) || ic === '🎓') { mm(view() ? 'bs' : 'mybs'); return true; }
            if (/polojeniya/i.test(t) && typeof Q1.polOpen === 'function') { Q1.polOpen(); return true; }
            if (/maxsus kiyim|kiyim/i.test(t) && typeof Q1.kiyOmbor === 'function') { Q1.kiyOmbor(); return true; }
            return false; // nomaʼlum tur — avvalgidek (roʻyxat yopiladi)
        }
        if (typeof Q1.openNotif === 'function') Q1.openNotif = Q1.agmkExtend('openNotif', 'v3.19.1: bildirishnoma oʻz sahifasini ochadi', Q1.openNotif, (o: Function) => function (this: unknown, id: string) {
            let n: any = null; try { n = Q1.getNotifs().find((x: any) => x.id === id); } catch (e) { n = null; }
            const r = o.apply(this, arguments);
            try { if (n && !(n.vid && n.zno) && !n.chatTabel && !n.sigDoc) setTimeout(() => { q1NotifGo(n); }, 80); } catch (e) { /* */ }
            return r;
        });

        (function (): void {
            const st = document.createElement('style');
            st.textContent = `.qr-top{position:absolute;z-index:12;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.45);backdrop-filter:blur(4px)}
.qr-top svg{display:block;border-radius:5px}.qr-top:active{transform:scale(.94)}
body.locked .qr-top{display:none}`;
            document.head.appendChild(st);
        })();
