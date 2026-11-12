        // =====================================================================
        // 5.9 — 11-band (muallif, 02.11.2026 10:08): barcha uzun roʻyxatlarda «tez surish» tugmasi
        //  Roʻyxat surilganda oʻng chetda kichik qora tugma chiqadi (Excel / Android dagi kabi) — qayerda turganingizni
        //  koʻrsatadi; uni tortsangiz roʻyxat tez suriladi, yonida yorliq: «№ 8121 · 120 / 1040» (yoki birinchi koʻringan
        //  qatorning nomi). 1,5 s tegilmasa — yashirinadi. Bitta umumiy qism — sahifa, oyna (modal) va ichki roʻyxatlarning hammasiga.
        //  Vagonlar roʻyxati qismlab chiqadi (60 tadan) — tugma toʻliq soni boʻyicha ishlaydi va kerakli joygacha oʻzi yuklaydi.
        // =====================================================================
        const FS9: any = window as any;
        var FS59: any = { el: null, sc: null, t: 0, drag: false, lbl: null, th: null };
        function fs59Long(e: any): boolean {
            if (!e || e === document.body || e === document.documentElement) return false;
            const cs = getComputedStyle(e); if (!/(auto|scroll)/.test(cs.overflowY)) return false;
            return e.scrollHeight > e.clientHeight * 2.5 && e.clientHeight > 220;
        }
        function fs59Ui(): any {
            if (FS59.el) return FS59.el;
            const d = document.createElement('div'); d.id = 'fs59'; d.innerHTML = '<div class="fs59-lbl"></div><div class="fs59-th"></div>'; document.body.appendChild(d);
            FS59.el = d; FS59.lbl = d.querySelector('.fs59-lbl'); FS59.th = d.querySelector('.fs59-th');
            FS59.th.addEventListener('pointerdown', (e: any) => { if (!FS59.sc) return; FS59.drag = true; d.classList.add('drag'); try { FS59.th.setPointerCapture(e.pointerId); } catch (x) { /* */ } e.preventDefault(); e.stopPropagation(); });
            FS59.th.addEventListener('pointermove', (e: any) => { if (!FS59.drag) return; fs59DragTo(e.clientY); e.preventDefault(); });
            const end = () => { if (!FS59.drag) return; FS59.drag = false; d.classList.remove('drag'); fs59Vg(true); fs59Hide(); };
            FS59.th.addEventListener('pointerup', end); FS59.th.addEventListener('pointercancel', end);
            return d;
        }
        // vagonlar: toʻliq soni va kartochkalar
        function fs59VgInfo(sc: any): any {
            const c = FS9.$id('vagon-list-container'); if (!c || !sc.contains(c)) return null;
            const m = /Topildi:\s*(\d+)/.exec((c.querySelector('.vg-count') || {}).textContent || ''); if (!m) return null;
            return { c: c, total: +m[1], cards: Array.from(c.querySelectorAll('.vagon-card')) };
        }
        function fs59Frac(sc: any): number {
            const vi = fs59VgInfo(sc);
            if (vi && vi.cards.length && vi.total > vi.cards.length) { const i = fs59TopIdx(sc, vi.cards); return Math.min(1, i / Math.max(1, vi.total - 1)); }
            const mx = sc.scrollHeight - sc.clientHeight; return mx > 0 ? sc.scrollTop / mx : 0;
        }
        function fs59TopIdx(sc: any, cards: any[]): number {
            const top = sc.getBoundingClientRect().top + 8;
            for (let i = 0; i < cards.length; i++) { const r = cards[i].getBoundingClientRect(); if (r.bottom > top) return i; }
            return cards.length - 1;
        }
        function fs59Label(sc: any): string {
            const vi = fs59VgInfo(sc);
            if (vi && vi.cards.length) { const i = fs59TopIdx(sc, vi.cards); const n = (vi.cards[i].querySelector('.vagon-num') || {}).textContent || ''; return (n.replace(/^Vagon\s*/, '') || '') + ' · ' + (i + 1) + ' / ' + vi.total; }
            // umumiy: birinchi koʻringan qatorning qisqa nomi
            const r = sc.getBoundingClientRect(), x = Math.min(r.right - 40, r.left + Math.min(160, r.width / 2)), y = r.top + 14;
            let e: any = document.elementFromPoint(x, y), best = '';
            for (let k = 0; e && k < 6 && e !== sc; k++, e = e.parentElement) { const b = e.querySelector && e.querySelector('b, strong, .vagon-num, .hs-row b, .dv-row b'); if (b && b.textContent.trim()) { best = b.textContent.trim(); break; } }
            const mx = sc.scrollHeight - sc.clientHeight, pct = mx > 0 ? Math.round(sc.scrollTop / mx * 100) : 0;
            return (best ? best.slice(0, 28) + ' · ' : '') + pct + '%';
        }
        function fs59Place(): void {
            const sc = FS59.sc, d = fs59Ui(); if (!sc || !document.body.contains(sc)) { d.classList.remove('on'); return; }
            const r = sc.getBoundingClientRect(); if (r.height < 200) { d.classList.remove('on'); return; }
            const h = 46, f = fs59Frac(sc), top = r.top + 6 + f * (r.height - h - 12);
            d.style.left = (r.right - 34) + 'px'; d.style.top = top + 'px';
            FS59.lbl.textContent = fs59Label(sc); d.classList.add('on');
        }
        function fs59Hide(): void { clearTimeout(FS59.t); FS59.t = setTimeout(() => { if (!FS59.drag && FS59.el) FS59.el.classList.remove('on'); }, 1500); }
        function fs59DragTo(cy: number): void {
            const sc = FS59.sc; if (!sc) return; const r = sc.getBoundingClientRect(), h = 46;
            const f = Math.max(0, Math.min(1, (cy - r.top - 6 - h / 2) / (r.height - h - 12)));
            const vi = fs59VgInfo(sc);
            if (vi && vi.total > vi.cards.length) {
                const want = Math.round(f * (vi.total - 1));
                if (want >= vi.cards.length - 2) { FS59.want = want; fs59Vg(false); return; }
                const card = vi.cards[want]; if (card) sc.scrollTop += card.getBoundingClientRect().top - r.top - 4;
            } else { sc.scrollTop = f * (sc.scrollHeight - sc.clientHeight); }
            fs59Place();
        }
        // vagonlar: kerakli joygacha qolganini yuklash (bir martada, 60 ga yaxlitlab)
        function fs59Vg(fin: boolean): void {
            if (FS59.want == null) return; const sc = FS59.sc, vi = sc && fs59VgInfo(sc); if (!vi) { FS59.want = null; return; }
            if (vi.cards.length <= FS59.want) {
                try { const need = Math.min(vi.total, Math.ceil((FS59.want + 30) / 60) * 60); if (typeof vgLimit !== 'undefined' && vgLimit < need) { vgLimit = need; FS9.filterVagonlar(true); } } catch (e) { /* */ }
            }
            const v2 = fs59VgInfo(sc); const card = v2 && v2.cards[Math.min(FS59.want, v2.cards.length - 1)];
            if (card) sc.scrollTop += card.getBoundingClientRect().top - sc.getBoundingClientRect().top - 4;
            if (fin) FS59.want = null; fs59Place();
        }
        document.addEventListener('scroll', (e: any) => {
            const t = e.target; if (FS59.drag) { fs59Place(); return; }
            if (!fs59Long(t)) return;
            FS59.sc = t; fs59Place(); fs59Hide();
        }, true);
        (function () {
            const st = document.createElement('style'); st.id = 'v59fsCss';
            st.textContent = `
            #fs59{position:fixed;z-index:29000;width:30px;height:46px;opacity:0;pointer-events:none;transition:opacity .25s}
            #fs59.on{opacity:1}
            #fs59 .fs59-th{position:absolute;right:2px;top:0;width:22px;height:46px;border-radius:11px;background:rgba(15,23,42,.92);border:1px solid rgba(255,255,255,.35);box-shadow:0 2px 8px rgba(0,0,0,.45);pointer-events:auto;touch-action:none;cursor:grab}
            #fs59 .fs59-th::before,#fs59 .fs59-th::after{content:'';position:absolute;left:6px;right:6px;height:2px;border-radius:1px;background:#cbd5e1;top:19px}
            #fs59 .fs59-th::after{top:25px}
            #fs59 .fs59-lbl{position:absolute;right:34px;top:8px;white-space:nowrap;padding:5px 10px;border-radius:10px;background:rgba(15,23,42,.94);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:13px;font-weight:700;opacity:0;transform:translateX(6px);transition:opacity .15s,transform .15s}
            #fs59.drag .fs59-lbl{opacity:1;transform:none}
            #fs59.drag .fs59-th{background:#2563eb;border-color:#93c5fd;cursor:grabbing}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(FS9, { FS59: FS59 });
