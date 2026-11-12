        // =====================================================================
        // 6.1 — 7, 8, 12, 15-bandlar (muallif 03.11.2026)
        //  7)  «Suv belgisi» (F.I.Sh. · tabel · vaqt — ekran boʻylab qiya yozuv) — hech qaysi oynada chiqmaydi;
        //      Xavfsizlik oynasidagi «Suv belgisi» bandi koʻrinmaydi. Android skrinshot taqiqi (FLAG_SECURE) va boshqa himoya — oʻz holicha.
        //  8)  Parametrlar → «Server (sinxronlash)» → «📷 QR kodni skanerlash»: telefonning oddiy kamerasi (surat) emas —
        //      ilovaning JONLI skaneri (orqa kamera, ramka, QR ni oʻzi taniydi → ulanadi). «🖼 Rasmdan (galereya)» — zaxira.
        //  12) «Buxgalteriya va Iqtisodiyot», «Iqtisodiyot» va boshqa oraliq (tugmali) sahifalar: anʼanaviy kartochka
        //      (oq ramkali 56 px belgi, bir xil balandlik) va Klassik/Vitrina sarlavhasi («Bosh sahifa › …»).
        //  15) Struktura: orqadagi shaffof qoramtir «oynalar» yoʻq — sabab: SVO davomat holat belgisi uchun yozilgan umumiy
        //      «.st-n» uslubi Struktura tugunlariga ham tushgan (nom toʻqnashuvi). Endi Struktura ichida — shaffof, ramkasiz.
        // =====================================================================
        const U61: any = window as any;

        // ---------- 7) suv belgisi ----------
        if (typeof U61.secShield === 'function') U61.secShield = function (): void { const el = U61.$id('secWm'); if (el) el.style.display = 'none'; };

        // ---------- 8) server QR — jonli skaner ----------
        function u61SrvScan(): void {
            try { if (typeof U61.qrScanOpen === 'function') { U61.qrScanOpen('srv'); return; } } catch (e) { console.error(e); }
            try { const i = document.querySelector('#syncBox .srv-lan input[type=file]') as any; if (i) i.click(); } catch (e) { /* */ }
        }
        function u61SrvFix(): void {
            try {
                const d = document.querySelector('#syncBox .srv-lan'); if (!d || d.querySelector('.u61-live')) return;
                const lb = d.querySelector('label.srv-qr') as any; if (!lb) return;
                const b = document.createElement('button'); b.type = 'button'; b.className = 'u61-live'; b.textContent = '📷 QR kodni skanerlash (kamera)';
                b.onclick = (e: any) => { e.preventDefault(); u61SrvScan(); };
                lb.parentNode.insertBefore(b, lb);
                const inp = lb.querySelector('input'); if (inp) inp.removeAttribute('capture');
                if (lb.firstChild && lb.firstChild.nodeType === 3) lb.firstChild.textContent = '🖼 QR rasmidan (galereya) ';
                lb.classList.add('u61-gal');
                const tip = d.querySelector('.nd-tip:last-child'); if (tip && /rasmga oling/.test(tip.textContent || '')) tip.textContent = 'Server kompyuterida «ishga_tushirish.bat» ochilgach, kamerani ekrandagi QR kodga qarating — ilova oʻzi taniydi va ulanadi. Internet kerak emas — faqat korxona Wi-Fi.';
            } catch (e) { console.error('6.1 server QR', e); }
        }
        if (typeof U61.syncRender === 'function') U61.syncRender = U61.agmkExtend('syncRender', '6.1: server QR — jonli skaner', U61.syncRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); u61SrvFix(); return r; });

        // ---------- 12) oraliq sahifalar: sarlavha va anʼanaviy kartochka ----------
        try {
            if (typeof U61.H59_SCR === 'object' && U61.H59_SCR) Object.assign(U61.H59_SCR, {
                'screen-bxi': { sec: 'Moliya' },
                'screen-iqt': { sec: 'Moliya', par: 'Buxgalteriya va Iqtisodiyot' },
                'screen-nd': { sec: 'Hujjatlar' },
                'screen-salohiyat': { sec: 'Ishlab chiqarish' }
            });
        } catch (e) { /* */ }
        ['openBxHome', 'openIqt', 'openBux', 'openNd', 'openSalohiyat'].forEach(fn => {
            if (typeof U61[fn] === 'function') U61[fn] = U61.agmkExtend(fn, '6.1: oraliq sahifa sarlavhasi', U61[fn], (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); try { if (typeof U61.h59Apply === 'function') { U61.h59Apply(); setTimeout(() => U61.h59Apply(), 60); setTimeout(() => U61.h59Apply(), 300); } } catch (e) { /* */ } return r; });
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v61uiCss';
            const S = ':is(#screen-bxi,#screen-iqt,#screen-hr,#screen-sp,#screen-map,#screen-hisob,#screen-mttb,#screen-mm,#screen-mh,#screen-my)';
            st.textContent = `
            #secModal label.dvp-row:has(#secWmOn){display:none!important}
            #secWm{display:none!important}
            #syncBox .srv-lan .u61-live{flex:1;min-height:44px;border-radius:12px;border:1px solid rgba(56,189,248,.6);background:linear-gradient(135deg,#0e7490,#0369a1);color:#fff;font-weight:700;font-size:14px;cursor:pointer;padding:8px 10px}
            #syncBox .srv-lan .pk-btns{display:flex;flex-wrap:wrap;gap:8px}
            #syncBox .srv-lan label.u61-gal{flex:1 1 100%;order:3;background:rgba(30,41,59,.7)!important;border:1px dashed rgba(148,163,184,.5)!important;font-weight:600}
            ${S} :is(.card-list,.sec-body,.h9-list,.hs-grid) > .btn-card .btn-icon:not(.mk-ic){width:56px;height:56px;min-width:56px;flex:0 0 56px;border-radius:14px;background:#fff!important;border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.45);display:inline-flex;align-items:center;justify-content:center;font-size:30px!important;line-height:1;margin-right:4px}
            ${S} :is(.card-list,.sec-body,.h9-list,.hs-grid) > .btn-card{min-height:80px;box-sizing:border-box}
            ${S} .sec-body > .btn-card.nar-card{margin-bottom:10px}
            #stCv .st-n,#stVp .st-n{background:transparent!important;border:0!important;box-shadow:none!important;color:inherit}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(U61, { u61SrvScan: u61SrvScan, u61SrvFix: u61SrvFix });
