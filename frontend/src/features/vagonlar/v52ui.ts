        // =====================================================================
        // 5.2 — Vagon pasporti: sarlavha tugmalari kartochkaga sigʻadi; «📣 Bildirgi» zamechaniyalardan oldinga (muallif, 29.10.2026)
        //  4) «✏️ Tahrirlash» Bildirgi qoʻshilgach kartochkadan chiqib ketardi → sarlavha qatori oʻraladi
        //     (nom — alohida qator, tugmalar — keyingi qatorda), tugmalar qisqarmaydi.
        //  5) «📣 Bildirgi» sarlavhadan olinadi va «🚨 Rahbariyat nazorati — zamechaniyalar» blokidan oldin
        //     alohida katta tugma boʻlib turadi (taʼmirlar tarixi va zamechaniyalar oraligʻida).
        // =====================================================================
        const UI52: any = window as any;
        function ui52Fix(): void {
            try {
                document.querySelectorAll('.passport-title').forEach((t: any) => { if (t.querySelector('button')) t.classList.add('pt52'); });
                const b = UI52.$id('bgPassB'), zam = UI52.$id('zam-box');
                if (!b || !zam || !zam.parentElement) return;
                let w = UI52.$id('bgPassWrap');
                if (!w) { w = document.createElement('div'); w.id = 'bgPassWrap'; w.className = 'bg52-w ppi-hide'; zam.parentElement.insertBefore(w, zam); }
                else if (w.nextElementSibling !== zam) zam.parentElement.insertBefore(w, zam);
                if (b.parentElement !== w) {
                    b.className = 'bg52-b'; b.innerHTML = '📣 <span>Bildirgi va dalolatnoma</span><small>nosozlik aniqlanganda — shu vagon raqami bilan</small>';
                    w.appendChild(b);
                }
            } catch (e) { console.error(e); }
        }
        function ui52Run(): void { [0, 90, 200, 450, 900].forEach(ms => setTimeout(ui52Fix, ms)); }
        if (typeof UI52.openPassport === 'function') UI52.openPassport = UI52.agmkExtend('openPassport', '5.2: pasport tugmalari, Bildirgi joyi', UI52.openPassport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); ui52Run(); return r; });
        if (typeof UI52.openItemPasport === 'function') UI52.openItemPasport = UI52.agmkExtend('openItemPasport', '5.2: pasport sarlavhasi oʻraladi', UI52.openItemPasport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); ui52Run(); return r; });
        (function () {
            const st = document.createElement('style');
            st.textContent = '.passport-title.pt52{flex-wrap:wrap;row-gap:8px;column-gap:8px;justify-content:flex-start}'
                + '.passport-title.pt52>span:first-child{flex:1 1 100%;min-width:0}'
                + '.passport-title.pt52>button{flex:0 0 auto;margin-left:0!important;margin-right:0!important;white-space:nowrap}'
                + '.passport-title.pt52>button:last-child{margin-left:auto!important}'
                + '.bg52-w{margin:12px 0}'
                + '.bg52-b{width:100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 8px;padding:12px 14px;border-radius:14px;border:1px solid #f59e0b;background:linear-gradient(135deg,#f59e0b,#d97706);color:#1c1917;opacity:1;font:700 16px/1.2 inherit;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
                + '.bg52-b small{flex:1 1 100%;text-align:center;font-weight:400;font-size:12px;opacity:.85;color:inherit}';
            document.head.appendChild(st);
        })();
        // ⚙️ kartochka sozlamasi (bosib turish → rang, shaffoflik, shrift) — yangi «📣 Bildirgi» tugmasi uchun ham (muallif, 29.10.2026)
        try { if (typeof UI52.UI_CARDS === 'string' && UI52.UI_CARDS.indexOf('.bg52-b') < 0) { UI52.UI_CARDS += ',.bg52-b'; setTimeout(() => { try { UI52.uiApply(); } catch (e) { /* */ } }, 1500); } } catch (e) { /* */ }
        // 5.2 (muallif videosi, 29.10.2026): «Dalolatnomalar» ichki boʻlimida (⚠️ Noxush hodisalar, 📦 Kirish nazorati, 🧪 sinov …)
        //  «Orqaga» bosilganda bir qadam emas, ikki qadam ketardi — boʻlimlar roʻyxati oʻtkazib yuborilib, bosh menyuga chiqardi.
        //  Endi: ekranda ichki boʻlim sarlavhasi («‹ …», .hs-back) koʻrinib tursa — avval boʻlimlar roʻyxatiga qaytiladi.
        //  Telefon «Orqaga» tugmasi, yuqoridagi ‹ va suzuvchi ‹ — hammasi .back-btn orqali keladi.
        function ui52HsBack(): any { const scr = document.querySelector('.screen.active'); if (!scr) return null; const h = scr.querySelector('.hs-back') as any; if (!h) return null; const r = h.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? h : null; }
        window.addEventListener('click', (e: any) => {
            try {
                const bb = e.target && e.target.closest && e.target.closest('.back-btn'); if (!bb) return;
                const h = ui52HsBack(); if (!h || !bb.closest('.screen.active')) return;
                e.preventDefault(); e.stopImmediatePropagation(); h.click(); try { window.scrollTo(0, 0); } catch (x) { /* */ }
            } catch (x) { /* */ }
        }, true);
        Object.assign(UI52, { ui52Fix: ui52Fix, ui52HsBack: ui52HsBack });
