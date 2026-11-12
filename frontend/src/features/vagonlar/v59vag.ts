        // =====================================================================
        // 5.9 — 10-band (muallif, 02.11.2026 09:52): Vagonlar parki
        //  • 0 ta vagonli turlar (ЖД кран platf., Yopiq vagon, Poluvagon, Refrijerator, Yoʻlovchi) — endi xira emas, bosiladi;
        //  • tur bosilganda: vagon boʻlmasa — «Bu turdagi vagonlar hali kiritilmagan» izohi;
        //  • roʻyxat ustida «+ Vagon qoʻshish» tugmasi (tanlangan tur oldindan belgilanadi), uning ostida roʻyxat;
        //  • roʻyxat surilib tugma ekrandan chiqsa — pastki oʻngda dumaloq «+» chiqadi, yuqoriga qaytilsa yashirinadi.
        //  Huquq: «Texnika qoʻshish» (tech_add) boʻlmasa tugmalar koʻrinmaydi. Eski funksiyalar oʻchirilmadi — oʻrab olindi.
        // =====================================================================
        const VG9: any = window as any;
        var VG59: any = { io: null };
        function vg59Can(): boolean { try { return typeof VG9.p38Can === 'function' ? !!VG9.p38Can('tech_add') : true; } catch (e) { return true; } }
        function vg59Type(): string { try { const t = typeof activeTypeFilter !== 'undefined' ? activeTypeFilter : ''; return t && t !== 'Barchasi' ? String(t) : ''; } catch (e) { return ''; } }
        function vg59Name(t: string): string { try { return (VG9.TV_LBL && VG9.TV_LBL[t]) || t; } catch (e) { return t; } }
        function vg59Add(): void {
            const t = vg59Type();
            try { VG9.openAddVagonModal(); } catch (e) { return; }
            if (!t) return;
            try {
                const sel = VG9.$id('add-model'); if (!sel) return;
                let o = Array.from(sel.options).find((x: any) => x.value === t) as any;
                if (!o) { o = document.createElement('option'); o.value = t; o.textContent = vg59Name(t); sel.insertBefore(o, sel.firstChild); }
                sel.value = t;
            } catch (e) { /* */ }
        }
        function vg59Head(n: number): string {
            const t = vg59Type(), can = vg59Can();
            const btn = can ? `<button type="button" class="vg59-add" id="vg59Add" onclick="vg59Add()">+ ${t ? vg59Name(t) + ' qoʻshish' : 'Vagon qoʻshish'}</button>` : '';
            const empty = n ? '' : `<div class="vg59-empty"><b>${t ? 'Bu turdagi vagonlar hali kiritilmagan' : 'Hech qanday vagon topilmadi'}</b>${t ? `<small>«${VG9.escapeHtml ? VG9.escapeHtml(vg59Name(t)) : vg59Name(t)}» turida bazada vagon yoʻq.${can ? ' Quyidagi tugma bilan qoʻshing.' : ''}</small>` : ''}</div>`;
            return empty + btn;
        }
        function vg59Watch(): void {
            try {
                const s = VG9.$id('screen-vagonlar'); if (!s) return; const fab = s.querySelector('.fab-btn'); const b = VG9.$id('vg59Add');
                if (VG59.io) { VG59.io.disconnect(); VG59.io = null; }
                if (!fab) return;
                if (!b || typeof IntersectionObserver === 'undefined') { fab.classList.remove('vg59-hide'); return; }
                fab.classList.add('vg59-hide');
                VG59.io = new IntersectionObserver((es) => { es.forEach((e: any) => fab.classList.toggle('vg59-hide', e.isIntersecting)); }, { threshold: 0 });
                VG59.io.observe(b);
            } catch (e) { /* */ }
        }
        // roʻyxat qayerdan chizilmasin (filtr, ochilish, «Yana koʻrsatish», boshqa modullar) — tugma/izoh bitta joyda qoʻyiladi
        function vg59Ensure(): void {
            try {
                const c = VG9.$id('vagon-list-container'); if (!c) return;
                if (c.querySelector(':scope > .vg59-add, :scope > .vg59-empty')) return;
                const n = c.querySelectorAll('.vagon-card').length;
                if (!n) { const nf = Array.from(c.children).find((x: any) => /Hech qanday vagon topilmadi/.test(x.textContent || '')) as any; if (nf) nf.remove(); }
                c.insertAdjacentHTML('afterbegin', vg59Head(n));
                vg59Watch();
            } catch (e) { /* */ }
        }
        if (typeof VG9.renderVagonlar === 'function') VG9.renderVagonlar = VG9.agmkExtend('renderVagonlar', '5.9: «+ Vagon qoʻshish» va boʻsh tur izohi', VG9.renderVagonlar, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); vg59Ensure(); return r;
        });
        (function () {
            const c = VG9.$id('vagon-list-container'); if (!c || typeof MutationObserver === 'undefined') return;
            new MutationObserver(() => vg59Ensure()).observe(c, { childList: true });
            setTimeout(vg59Ensure, 0);
        })();
        if (typeof VG9.openScreen === 'function') VG9.openScreen = VG9.agmkExtend('openScreen', '5.9: Vagonlar parki — «+ Vagon qoʻshish»', VG9.openScreen, (o: Function) => function (this: unknown, id: any) { const r = o.apply(this, arguments); if (id === 'screen-vagonlar') setTimeout(vg59Ensure, 0); return r; });
        window.addEventListener('agmk:login', () => setTimeout(vg59Ensure, 300));
        (function () {
            const st = document.createElement('style'); st.id = 'v59vagCss';
            st.textContent = `
            #vagon-tabs .tab.empty{opacity:1}
            #vagon-tabs .tab.tvt.empty .tab-cnt{background:rgba(100,116,139,.55);color:#e2e8f0}
            .vg59-empty{margin:6px 0 10px;padding:14px;border-radius:14px;background:rgba(15,23,42,.85);border:1px dashed rgba(148,163,184,.5);text-align:center;color:#e2e8f0}
            .vg59-empty b{display:block;font-size:15px;color:#fff}.vg59-empty small{display:block;margin-top:4px;color:#94a3b8;font-size:12.5px}
            .vg59-add{display:block;width:100%;margin:0 0 10px;padding:12px;border-radius:14px;border:1px solid rgba(56,189,248,.55);background:rgba(3,105,161,.45);color:#e0f2fe;font-weight:800;font-size:14px;cursor:pointer}
            .vg59-add:active{transform:scale(.99)}
            #screen-vagonlar .fab-btn{transition:opacity .2s,transform .2s}
            #screen-vagonlar .fab-btn.vg59-hide{opacity:0;transform:scale(.6);pointer-events:none}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(VG9, { vg59Add: vg59Add, VG59: VG59 });
