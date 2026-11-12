        // =====================================================================
        // 5.8 — muallif roʻyxati (30.10.2026), 1–4-bandlar:
        //  1) Chap panel (☰ / Web dagi doimiy panel): «UMUMIY» boʻlimi oʻrniga faqat «👤 Profil».
        //  2) Vagon pasporti: «📣 Bildirgi va dalolatnoma» — boshqa kartochkalar bilan bir xil kenglik, chegara, radius;
        //     rangi «🎨 Sahifa dizayni» / kartochka sozlamasi bilan oʻzgaradi (oldin !important bilan qotirilgan edi).
        //  3) «Vitrina» (katta kartali) dizayn: barcha sahifalarda kartalar rasmsiz (chap paneldagi ikonkalar qoladi).
        //  4) «Vitrina»: boʻlim sarlavhalari butun qator boʻylab; kartalar ixcham va bir xil balandlikda.
        // =====================================================================
        const U58: any = window as any;
        // ---------- 1) chap panel: faqat Profil ----------
        function u58Drawer(): void {
            try {
                const d = U58.$id('h9Drw'); if (!d) return; const p = d.querySelector('.h9-dp'); if (!p) return;
                p.querySelectorAll('.h9-ds').forEach((s: any) => { if (/umumiy/i.test(s.textContent || '')) s.remove(); });
                p.querySelectorAll('.h9-di[data-f]').forEach((x: any) => { if (x.dataset.f !== 'prof') x.remove(); else x.classList.add('u58-prof'); });
            } catch (e) { /* */ }
        }
        if (typeof U58.h9DrawerOpen === 'function') U58.h9DrawerOpen = U58.agmkExtend('h9DrawerOpen', '5.8: chap panel — «Umumiy» oʻrniga faqat Profil', U58.h9DrawerOpen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); u58Drawer(); return r; });
        (function (): void {
            const st = document.createElement('style'); st.id = 'u58css'; st.textContent = `
#h9Drw .h9-di.u58-prof{margin-top:12px;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
/* 2) Bildirgi va Rahbariyat nazorati — boshqa kartochkalar bilan bir xil kenglik; Bildirgi — anʼanaviy qoramtir shaffof, toʻq sariq hoshiya */
.bg52-w{box-sizing:border-box;width:100%!important;max-width:none!important;margin:15px 0!important}
.bg52-b{background:rgba(15,23,42,.92);border:2px solid #f59e0b;color:#f8fafc;border-radius:12px!important;padding:14px!important;box-sizing:border-box;font:700 15px/1.25 inherit!important;box-shadow:0 4px 15px rgba(0,0,0,.3)!important}
.bg52-b span{color:#fbbf24}.bg52-b small{color:#cbd5e1;opacity:1!important}
.screen .zam-box,.screen .rahbariyat-box{width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box}
@media (min-width:720px){.screen .zam-box,.screen .rahbariyat-box,.bg52-w{max-width:1100px!important;margin-left:auto!important;margin-right:auto!important}}
/* 3–4) Vitrina: rasmsiz, ixcham, sarlavhalar butun qator */
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-icon{display:none!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card,body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card:first-child{grid-column:auto!important;min-height:72px!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;padding:14px 40px 14px 16px!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-card-content{flex-direction:row!important;align-items:center!important;gap:0!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card .btn-arrow{top:50%!important;bottom:auto!important;transform:translateY(-50%)!important}
body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>:not(.btn-card){grid-column:1/-1!important}
@media (min-width:1100px){body[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list){grid-template-columns:repeat(3,minmax(0,1fr))!important}}
`; document.head.appendChild(st);
        })();
        Object.assign(U58, { u58Drawer: u58Drawer });
