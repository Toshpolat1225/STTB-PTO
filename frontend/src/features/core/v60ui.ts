        // =====================================================================
        // 6.0 — mayda tuzatishlar (muallif, 02.11.2026; docs/REJA_6.0.md)
        //  3) «📦 Oylik toʻplamni tekshirish»: «📂 Fayllarni tanlash» va «📝 Word hujjatlar» tugmalari ustma-ust
        //     chiqar edi (telefon, 412 px) — endi har biri alohida qatorda, toʻliq kenglikda, yozuv qatorga sigʻadi.
        // 11) SVO va GPS: «🧪 Demo» tugmasi server ulangan (onlayn) paytda ham turadi — taqdimot uchun.
        //     Yoqilganda tepada «🧪 Namuna rejimi» va «⏹ Toʻxtatish»; haqiqiy maʼlumotga hech narsa yozilmaydi.
        //     TAQDIMOTDAN KEYIN olib tashlash: AGMK_DEMO_TUGMA = false (bitta qator). GPS da demo tugmasi 3.10 dan beri doim bor.
        // 10) Planshet / keng ekran: SVO dagi «Monitoring oynasi · Turniket yuklash» qatori va namuna belgisi pastdagi
        //     maʼlumot bilan bir kenglikda, oʻrtada; yorliqlar (Bugun, Smenalar …) kattaroq.
        // =====================================================================
        var AGMK_DEMO_TUGMA = true;
        const U60: any = window as any;
        (function () {
            const st = document.createElement('style'); st.id = 'v60uiCss';
            st.textContent = `
            .hs-box .alb-btn{display:flex!important;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px 6px;width:100%!important;box-sizing:border-box;margin:8px 0 0!important;float:none!important;position:relative!important;white-space:normal!important;text-align:center;line-height:1.3;min-height:44px}
            #screen-dav .sec-body > .dv-demo,#screen-dav .sec-body > .dv-acts{margin-left:auto!important;margin-right:auto!important;box-sizing:border-box}
            @media (min-width:900px){.sec-tabs i{font-size:15px!important;padding:9px 16px!important;border-radius:14px!important}}
            /* 12) Pasport (vagon, lokomotiv, texnika — hammasi): nom kartochkasi yozuvga moslashgan, oʻrtada, bosilmaydi;
                  «📍 Sxemada koʻrsatish» — pasport kartochkasi bilan bir kenglikda, oʻrtada */
            #screen-vagon-pasport .inner-header:has(#pasport-header-title){justify-content:center!important}
            #pasport-header-title{flex:0 1 auto!important;width:auto!important;max-width:min(92vw,1100px)!important;margin:0 auto!important;text-align:center!important;cursor:default!important;pointer-events:none!important;user-select:none;-webkit-user-select:none}
            #screen-vagon-pasport .gd-ppbtn{display:block;width:100%!important;max-width:1100px!important;margin-left:auto!important;margin-right:auto!important;box-sizing:border-box}
            /* 7) Boʻlim sahifalaridagi rasmsiz kartochkalar («🧰 Uskunalar va texnikalar», «🛤 Infratuzilma», Normativ hujjatlar,
                  Ishlab chiqarish koʻrsatkichlari …) — rasmli kartochkalar bilan bir xil: oq ramkali belgi 56 px, bir xil balandlik */
            :is(#screen-grp,#screen-nd,#screen-salohiyat,#screen-vagmenu,#screen-subunits) .card-list > .btn-card .btn-icon:not(.mk-ic){width:56px;height:56px;min-width:56px;flex:0 0 56px;border-radius:14px;background:#fff;border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 8px rgba(0,0,0,.45);display:inline-flex;align-items:center;justify-content:center;font-size:30px!important;line-height:1;margin-right:4px}
            :is(#screen-grp,#screen-nd,#screen-salohiyat,#screen-vagmenu,#screen-subunits) .card-list > .btn-card{min-height:80px;box-sizing:border-box}
            .dv-demo .dv60-off{flex:0 0 auto!important;width:auto!important;padding:6px 14px!important}
            .dv-demo{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
            .hs-box .alb-btn + .alb-btn{margin-top:8px!important}
            .hs-box .alb-btn input[type=file]{position:absolute!important;inset:0;opacity:0;width:100%;height:100%;cursor:pointer}
            `;
            document.head.appendChild(st);
        })();
        function dv60DemoOff(): void { try { U60.DV.demo = false; U60.DV.cfg = null; U60.DVD = null; U60.dvOpen(); } catch (e) { /* */ } }
        function dv60Btn(): void {
            try {
                const b = U60.secBody && U60.secBody('screen-dav'); if (!b || !U60.DV) return;
                const dm = b.querySelector('.dv-demo');
                if (U60.DV.demo) { if (dm && !dm.querySelector('.dv60-off')) dm.insertAdjacentHTML('beforeend', ' <button class="mini-btn dv60-off" onclick="dv60DemoOff()">⏹ Toʻxtatish</button>'); return; }
                const a = b.querySelector('.dv-acts'); if (AGMK_DEMO_TUGMA && a && !a.querySelector('.dv60-on')) a.insertAdjacentHTML('beforeend', '<button class="mini-btn dv60-on" onclick="dvDemoOn()" title="Taqdimot uchun soxta maʼlumot">🧪 Demo</button>');
            } catch (e) { /* */ }
        }
        if (typeof U60.dvRender === 'function') U60.dvRender = U60.agmkExtend('dvRender', '6.0: Demo tugmasi onlayn ham', U60.dvRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); dv60Btn(); Promise.resolve(r).then(dv60Btn, () => {}); return r;
        });
        // 9) Monitoring oynasidan qaytganda ☰ (chap yuqori) va ⋮ (oʻng yuqori) yoʻqolmasin:
        //    • telefonning «Orqaga» tugmasi monitoring ochiq paytda avval uni yopadi (oldin oyna ochiq qolib, ilova bosh
        //      sahifaga oʻtib ketar va «dv-mon-on» holati qolib ketar edi);
        //    • monitoring yopilgach / har sahifa ochilganda — yuqori panel (h9) qayta tekshiriladi va tiklanadi.
        function h60Heal(): void {
            try {
                if (!U60.$id('dvMon')) document.body.classList.remove('dv-mon-on');
                const a = document.querySelector('.screen.active'); if (!a || a.id === 'screen-main' || document.body.classList.contains('locked')) return;
                if (!a.querySelector('.h9-menu') || !a.querySelector('.h9-mo')) { if (typeof U60.h9Run === 'function') U60.h9Run(); }
            } catch (e) { /* */ }
        }
        window.addEventListener('popstate', (e: any) => {
            try { if (U60.$id('dvMon') && typeof U60.dvMonClose === 'function') { e.stopImmediatePropagation(); U60.dvMonClose(); try { U60.rearmBack(); } catch (x) { /* */ } setTimeout(h60Heal, 60); } } catch (x) { /* */ }
        }, true);
        if (typeof U60.dvMonClose === 'function') U60.dvMonClose = U60.agmkExtend('dvMonClose', '6.0: ☰ va ⋮ tiklanadi', U60.dvMonClose, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(h60Heal, 30); setTimeout(h60Heal, 300); return r; });
        if (typeof U60.openScreen === 'function') U60.openScreen = U60.agmkExtend('openScreen', '6.0: ☰ va ⋮ har sahifada', U60.openScreen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(h60Heal, 250); return r; });
        // pasportda maʼlumot boʻlmagan maydon «undefined» emas, «—» koʻrinadi
        if (typeof U60.openPassport === 'function') U60.openPassport = U60.agmkExtend('openPassport', '6.0: boʻsh maydon «—»', U60.openPassport, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            const fix = () => { try { document.querySelectorAll('#screen-vagon-pasport .passport-grid span[id^="p-"]').forEach((e: any) => { if (/^\s*(undefined|null|NaN)\s*$/.test(e.textContent || '')) e.textContent = '—'; }); } catch (e) { /* */ } };
            fix(); setTimeout(fix, 300); return r;
        });
        Object.assign(U60, { h60Heal: h60Heal, dv60DemoOff: dv60DemoOff, AGMK_DEMO_TUGMA: AGMK_DEMO_TUGMA });
