        // =====================================================================
        // 5.7 — muallif kamchiliklar roʻyxati (30.10.2026):
        //  1) ⋮ → «📱 Mobil / 🖥 Web» koʻrinish — har sahifaning ⋮ menyusida (bosh sahifada ham). Tanlov butun ilovaga
        //     qoʻllanadi va eslab qolinadi (shu qurilmada). Standart: telefon — Mobil; planshet va kompyuter — Web.
        //     Web telefonda: sahifa 1280 px kenglikda (kompyuterdagidek), barmoq bilan kattalashtirish mumkin.
        //     Mobil planshet/kompyuterda: katta ekran qoidalari oʻchadi — telefon koʻrinishi.
        //  2) Web: keng ekranda (≥ 1200 px) chapda doimiy boʻlimlar paneli; xiralashtirish (blur) yoʻq — matn va rasmlar tiniq.
        //  3) SVO kartasi: kirish 9 soniyadan keyin boʻlsa ham server ruxsati soʻraladi (karta yoʻqolib qolmaydi).
        //  4) SVO sahifasi ⋮ → «🧪 Namuna rejimi» / «⏹ Namunadan chiqish» (server ulangan boʻlsa ham taqdimot uchun).
        //  5) Elektrovozlar: ПЭ2М, ПЭ2У, МПЭ2У tugmalari va kartalarida ham elektrovoz rasmi (ЕЛ-1 dagi kabi).
        //  6) Bosh sahifa ⋮ → «Logotipni yashirish / qaytarish» (yuqori fon rasmi oʻzgarmaydi).
        //  7) Dalolatnomalar: «⚠️ Noxush hodisalar» alohida karta emas — «⚠️ Nosozlik dalolatnomasi» ichida:
        //     «Gʻildirak juftligi sinishi (noxush hodisa)» va «Boshqa nosozliklar (vagon nosozlik dalolatnomasi)».
        // =====================================================================
        const WB9: any = window as any;
        var WB: any = { view: '', key: 'agmk_view', orig: new WeakMap(), vp0: '' };
        function wbStored(): string { try { const v = localStorage.getItem(WB.key) || ''; return v === 'web' || v === 'mob' ? v : ''; } catch (e) { return ''; } }
        function wbDefault(): string { try { return Math.min(screen.width, screen.height) >= 600 ? 'web' : 'mob'; } catch (e) { return 'mob'; } }
        function wbNarrow(): boolean { try { return Math.min(screen.width, window.outerWidth || screen.width) < 720 && screen.width < 900; } catch (e) { return false; } }
        // katta ekran (min-width ≥ 600px) qoidalari: Mobil rejimda oʻchiriladi, Web da qaytariladi
        function wbMediaRules(list: any, off: boolean): void {
            if (!list) return;
            for (let i = 0; i < list.length; i++) {
                const r: any = list[i]; if (!r) continue;
                if (r.media && typeof r.media.mediaText === 'string' && r.cssRules) {
                    const cur = r.media.mediaText, o = WB.orig.get(r);
                    if (off) { const t = o || cur, m = /min-width:\s*(\d+(?:\.\d+)?)px/i.exec(t); if (m && +m[1] >= 600 && cur !== 'not all') { WB.orig.set(r, t); try { r.media.mediaText = 'not all'; } catch (e) { /* */ } } }
                    else if (o && cur === 'not all') { try { r.media.mediaText = o; } catch (e) { /* */ } }
                    wbMediaRules(r.cssRules, off);
                } else if (r.cssRules && r.cssRules.length) wbMediaRules(r.cssRules, off);
            }
        }
        function wbMedia(): void {
            const off = WB.view === 'mob' && !wbNarrow();
            Array.from(document.styleSheets).forEach((sh: any) => { try { wbMediaRules(sh.cssRules, off); } catch (e) { /* */ } });
        }
        function wbViewport(): void {
            let m: any = document.querySelector('meta[name="viewport"]');
            if (!m) { m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); }
            if (!WB.vp0) WB.vp0 = m.getAttribute('content') || 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            let c = WB.vp0;
            if (WB.view === 'web') c = wbNarrow() ? 'width=1280, minimum-scale=0.1, maximum-scale=5, user-scalable=yes' : 'width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes';
            if (m.getAttribute('content') !== c) m.setAttribute('content', c);
        }
        function wbApply(): void {
            WB.view = wbStored() || wbDefault();
            const b = document.body; if (!b) return;
            b.classList.toggle('agmk-web', WB.view === 'web'); b.classList.toggle('agmk-mob', WB.view === 'mob');
            wbViewport(); wbMedia(); setTimeout(wbSide, 60);
            try { window.dispatchEvent(new Event('resize')); } catch (e) { /* */ }
        }
        function wbSet(v: string): void {
            try { localStorage.setItem(WB.key, v); } catch (e) { /* */ }
            wbApply();
            try { WB9.showToast(v === 'web' ? '🖥 Web koʻrinish — butun ilovada' : '📱 Mobil koʻrinish — butun ilovada'); } catch (e) { /* */ }
        }
        function wbToggle(): void { wbSet(WB.view === 'web' ? 'mob' : 'web'); }
        // yangi <style> qoʻshilsa (modullar) — Mobil rejimda ularning katta ekran qoidalari ham oʻchadi
        try {
            let t = 0; new MutationObserver(() => { if (WB.view !== 'mob' || t) return; t = setTimeout(() => { t = 0; wbMedia(); }, 80); }).observe(document.head, { childList: true, subtree: true, characterData: true });
        } catch (e) { /* */ }

        // ---------- chap panel (Web, keng ekran) ----------
        function wbSide(): void {
            const on = WB.view === 'web' && window.innerWidth >= 1200 && !document.body.classList.contains('locked');
            const was = document.body.classList.contains('wb-side'); document.body.classList.toggle('wb-side', on);
            if (was && !on) { try { const d = WB9.$id('h9Drw'); if (d) d.classList.remove('on'); if (WB9.H9) WB9.H9.drw = false; } catch (e) { /* */ } }
            if (!on || typeof WB9.h9DrawerOpen !== 'function') return;
            if (WB9.H9 && WB9.H9.drw) return;
            try { WB9.h9DrawerOpen(); const off = (): void => { const d = WB9.$id('h9Drw'); if (d) d.classList.remove('on'); if (WB9.H9) WB9.H9.drw = false; }; off(); requestAnimationFrame(() => requestAnimationFrame(off)); setTimeout(off, 60); wbSideMark(); } catch (e) { /* */ }
        }
        function wbSideMark(): void {
            try {
                const s: any = document.querySelector('.screen.active'), d = WB9.$id('h9Drw'); if (!d) return;
                d.querySelectorAll('.h9-di.wb-on').forEach((x: any) => x.classList.remove('wb-on'));
                if (s && s.id === 'screen-main') { const h = d.querySelector('.h9-di[data-f="home"]'); if (h) h.classList.add('wb-on'); }
            } catch (e) { /* */ }
        }
        window.addEventListener('resize', () => { clearTimeout(WB.rt); WB.rt = setTimeout(wbSide, 150); });
        if (typeof WB9.modRefresh === 'function') WB9.modRefresh = WB9.agmkExtend('modRefresh', '5.7: chap panel yangilanadi', WB9.modRefresh, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(wbSide, 120); return r; });
        if (typeof WB9.openScreen === 'function') WB9.openScreen = WB9.agmkExtend('openScreen', '5.7: chap panelda joriy sahifa', WB9.openScreen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(() => { if (document.body.classList.contains('wb-side') && !WB9.$id('h9Drw')) wbSide(); wbSideMark(); }, 60); return r; });

        // ---------- ⋮ menyu bandlari ----------
        try { if (WB9.H9_I) { WB9.H9_I.phone = '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'; WB9.H9_I.monitor = '<rect x="2.5" y="4" width="19" height="12.5" rx="1.8"/><path d="M8.5 20.5h7M12 16.5v4"/>'; WB9.H9_I.flask = '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 15h9"/>'; WB9.H9_I.stop = '<rect x="6" y="6" width="12" height="12" rx="2"/>'; } } catch (e) { /* */ }
        function wbViewItem(): any { const web = WB.view === 'web'; return { ic: web ? 'phone' : 'monitor', t: web ? 'Mobil koʻrinishga oʻtish (hozir: Web)' : 'Web koʻrinishga oʻtish (hozir: Mobil)', fn: wbToggle, x: '' }; }
        if (typeof WB9.h9MoreItems === 'function') WB9.h9MoreItems = WB9.agmkExtend('h9MoreItems', '5.7: Mobil / Web koʻrinish, SVO namuna rejimi', WB9.h9MoreItems, (o: Function) => function (this: unknown, s: any) {
            const L = o.apply(this, arguments) || [];
            try {
                if (s && s.id === 'screen-dav' && WB9.DV) {
                    if (WB9.DV.demo) L.unshift({ ic: 'stop', t: 'Namunadan chiqish (haqiqiy maʼlumot)', fn: () => { WB9.DV.demo = false; WB9.DV.cfg = null; WB9.dvOpen(); }, x: '' });
                    else L.unshift({ ic: 'flask', t: 'Namuna rejimi (taqdimot uchun, soxta maʼlumot)', fn: () => WB9.dvDemoOn(), x: '' });
                }
            } catch (e) { /* */ }
            try { if (s && s.id === 'screen-mash') wbDemoItems().filter((x: any) => /GPS/.test(x.t)).forEach((x: any) => L.unshift(x)); } catch (e) { /* */ }
            L.push(wbViewItem());
            return L;
        });

        // ---------- taqdimot demo (server ulangan boʻlsa ham): SVO, temir yoʻl GPS (lokomotiv + vagonlar), avtotraktor GPS ----------
        function wbDemoOn(): boolean { try { return !!(WB9.LVD && WB9.LVD.on); } catch (e) { return false; } }
        function wbGps(park: string): void {
            try { if (typeof WB9.mashOpen !== 'function') { WB9.showToast('GPS boʻlimi bu hisobda yopiq'); return; } WB9.mashOpen('live', park); setTimeout(() => { try { WB9.lvDemoStart(); } catch (e) { console.error(e); } }, 450); } catch (e) { console.error(e); }
        }
        function wbDemoItems(): any[] {
            const L: any[] = [];
            if (typeof WB9.dvDemoOn === 'function') L.push({ ic: 'flask', t: 'Demo: SVO — davomat (soxta maʼlumot)', fn: async () => { try { await WB9.dvOpen(); WB9.dvDemoOn(); } catch (e) { console.error(e); } }, x: '' });
            if (typeof WB9.lvDemoStart === 'function') {
                L.push({ ic: 'flask', t: 'Demo: GPS — lokomotiv va vagonlar', fn: () => wbGps('rail'), x: '' });
                L.push({ ic: 'flask', t: 'Demo: GPS — avtotraktor', fn: () => wbGps('avto'), x: '' });
                if (wbDemoOn()) L.push({ ic: 'stop', t: 'GPS demoni toʻxtatish', fn: () => { try { WB9.lvDemoStop(); } catch (e) { /* */ } }, x: '' });
            }
            return L;
        }
        // bosh sahifa ⋮ — oldin toʻgʻridan-toʻgʻri Profil ochardi; endi qisqa menyu: Profil va parametrlar + Mobil / Web
        function wbMainMenu(btn: any): void {
            try { WB9.h9MenuClose(); } catch (e) { /* */ }
            let lgOff = false; try { lgOff = WB9.dsgCfg().logo === 'off'; } catch (e) { /* */ }
            const lg = { ic: 'pal', t: lgOff ? 'Logotipni qaytarish' : 'Logotipni yashirish (fon oʻzgarmaydi)', fn: async () => { try { WB9.dsgSet({ logo: lgOff ? 'on' : 'off' }); await WB9.dsgApply(); WB9.showToast(lgOff ? '🏷 Logotip qaytarildi' : '🚫 Logotip yashirildi — fon oʻz joyida'); } catch (e) { /* */ } }, x: '' };
            const L: any[] = [{ ic: 'user', t: 'Profil va parametrlar', fn: () => WB9.openProfile(), x: '' }, { ic: 'gear', t: 'Parametrlar', fn: () => WB9.openSettings(), x: '' }, lg, wbViewItem()].concat(wbDemoItems());
            const r = btn.getBoundingClientRect(), m = document.createElement('div'); m.id = 'h9Menu'; m.className = 'h9-pop';
            m.innerHTML = L.map((x: any, i: number) => `${i === 2 || i === 3 || i === 4 ? '<hr>' : ''}<button type="button" data-i="${i}">${WB9.h9Ic(x.ic, 20)}<span>${WB9.h9E(x.t)}</span>${x.x ? `<em>${WB9.h9E(x.x)}</em>` : ''}</button>`).join('');
            m.style.top = Math.round(r.bottom + 8) + 'px'; m.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + 'px';
            m.addEventListener('click', (e: any) => { const b = e.target.closest('button[data-i]'); if (!b) return; e.stopPropagation(); const x: any = L[+b.dataset.i]; WB9.h9MenuClose(); try { x.fn(); } catch (er) { console.error(er); } });
            document.body.appendChild(m); if (WB9.H9) WB9.H9.menu = true;
            setTimeout(() => document.addEventListener('click', WB9.h9MenuClose, { once: true }), 0);
        }
        document.addEventListener('click', (e: any) => {
            const b = e.target && e.target.closest && e.target.closest('#screen-main .main-dots'); if (!b) return;
            if (typeof WB9.h9Ic !== 'function') return;
            e.stopPropagation(); e.preventDefault(); wbMainMenu(b);
        }, true);

        // ---------- 3) SVO kartasi: kirish kech boʻlsa ham ruxsat soʻraladi ----------
        (function (): void {
            let last = '', n = 0;
            const tick = (): void => {
                n++; if (n > 240) return; // ~20 daqiqa
                try {
                    const me = typeof WB9.dvMe === 'function' ? WB9.dvMe() : '';
                    if (me && me !== last && typeof WB9.dvSrv === 'function' && WB9.dvSrv() && typeof WB9.dvCfg === 'function') {
                        last = me; WB9.dvCfg(true).catch(() => { last = ''; });
                    }
                } catch (e) { /* */ }
                setTimeout(tick, n < 30 ? 2000 : 5000);
            };
            setTimeout(tick, 2500);
        })();

        // ---------- 5) Elektrovozlar rasmi ----------
        try { if (WB9.TECH_IMG && WB9.TECH_IMG.lok) ['ПЭ2М', 'ПЭ2У', 'МПЭ2У'].forEach(t => { if (!WB9.TECH_IMG.lok[t]) WB9.TECH_IMG.lok[t] = 'lok-el'; }); } catch (e) { /* */ }

        // ---------- 7) Nosozlik dalolatnomasi — bitta karta, ichida ikki yoʻnalish ----------
        (function (): void {
            try { if (Array.isArray(WB9.HS_AKT) && !WB9.HS_AKT.some((c: any) => c.k === 'nosozg')) WB9.HS_AKT.push({ k: 'nosozg', ic: '⚠️', t: 'Nosozlik dalolatnomasi', types: [] }); } catch (e) { /* */ }
            const nNx = (): number => { try { return WB9.NXS && typeof WB9.nxReg === 'function' ? WB9.nxReg().length : (typeof WB9.nxReg === 'function' ? WB9.nxReg().length : 0); } catch (e) { return 0; } };
            const nNs = (): number => { try { return WB9.cxDB().docs.filter((x: any) => x.type === 'nosoz').length; } catch (e) { return 0; } };
            if (typeof WB9.hsRender !== 'function') return;
            WB9.hsRender = WB9.agmkExtend('hsRender', '5.7: Noxush hodisalar → Nosozlik dalolatnomasi ichida', WB9.hsRender, (o: Function) => function (this: unknown) {
                const H = WB9.HS;
                if (H && H.tab === 'akt' && H.akt === 'nosozg') {
                    const r0 = o.apply(this, arguments);
                    try {
                        const b = WB9.secBody('screen-hisob'), E = WB9.escapeHtml;
                        const card = (oc: string, ic: string, t: string, sm: string) => `<div class="hs-card" onclick="${oc}"><b>${ic}</b><span>${E(t)}</span><small>${E(sm)}</small></div>`;
                        b.innerHTML = `<div class="hs-back" onclick="HS.akt=null; hsRender()">‹ ⚠️ Nosozlik dalolatnomasi</div><div class="hs-grid wb-nsz">`
                            + card("HS.akt='noxush'; hsRender()", '⚙️', 'Gʻildirak juftligi sinishi (noxush hodisa)', nNx() + ' ta sinish · jadval, dalolatnoma, oʻzaro tekshiruv')
                            + card("cxOpen('nosoz')", '⚠️', 'Boshqa nosozliklar (vagon nosozlik dalolatnomasi)', nNs() + ' ta dalolatnoma · korxona blankasi')
                            + `</div><div class="nd-tip">Ikkalasi ham shu yerda: gʻildirak juftligi sinishi — alohida jadval va dalolatnoma bilan; boshqa nosozliklar — vagon nosozlik dalolatnomasi.</div>`;
                        try { if (typeof WB9.h9Tpl === 'function') WB9.h9Tpl(b); } catch (e) { /* */ }
                    } catch (e) { console.error(e); }
                    return r0;
                }
                const r = o.apply(this, arguments);
                try {
                    if (!H || H.tab !== 'akt') return r; const b = WB9.secBody('screen-hisob'); if (!b) return r;
                    if (!H.akt) {
                        b.querySelectorAll('.hs-card, .btn-card').forEach((c: any) => {
                            const oc = c.getAttribute('onclick') || '';
                            if (/HS\.akt='(noxush|nosozg)'/.test(oc)) c.style.display = 'none';
                            else if (/cxOpen\('nosoz'\)/.test(oc)) { c.setAttribute('onclick', "HS.akt='nosozg'; hsRender()"); const sm = c.querySelector('small'); if (sm) sm.textContent = nNs() + ' ta · ' + nNx() + ' ta gʻildirak sinishi'; }
                        });
                    } else if (H.akt === 'noxush') {
                        const bk: any = b.querySelector('.hs-back'); if (bk) { bk.setAttribute('onclick', "HS.akt='nosozg'; hsRender()"); bk.textContent = '‹ ⚠️ Nosozlik dalolatnomasi › Gʻildirak juftligi sinishi'; }
                    }
                } catch (e) { console.error(e); }
                return r;
            });
        })();

        // ---------- uslublar ----------
        (function (): void {
            const st = document.createElement('style'); st.id = 'wb57css'; st.textContent = `
body.agmk-web{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
body.agmk-web *:not(.wb-keepblur){backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
body.agmk-web #main-card-list .btn-card{background:rgba(15,23,42,.80)}
body.agmk-web #uiDialog .modal-content{background:rgba(23,37,64,.97)}
body.agmk-web .h9-pop{background:rgba(15,23,42,.985)}
body.wb-side #h9Drw{pointer-events:none;right:auto;width:272px;z-index:50}
body.wb-side #h9Drw .h9-dp{transform:none!important;pointer-events:auto;width:272px;box-shadow:none;transition:none;background:rgba(9,14,26,.97)}
body.wb-side #h9Drw .h9-dbg{display:none}
body.wb-side #h9Drw .h9-dh button{display:none}
body.wb-side #h9Drw .h9-di.wb-on{background:rgba(56,189,248,.16);border-radius:12px}
body.wb-side .screen{margin-left:272px!important;width:calc(100% - 272px)!important;max-width:none!important}
body.wb-side .h9-c.h9-menu{display:none!important}
body.wb-side .lock-screen,body.locked #h9Drw{display:none}
body.wb-side #navBackFab{left:290px}
`; document.head.appendChild(st);
        })();

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wbApply); else wbApply();
        setTimeout(wbApply, 1500); // kech qoʻshilgan modul uslublari uchun
        Object.assign(WB9, { wbDemoItems: wbDemoItems, wbGps: wbGps, wbSet: wbSet });
