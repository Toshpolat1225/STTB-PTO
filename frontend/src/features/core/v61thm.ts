        // =====================================================================
        // 6.1 — 20-band (muallif 10:00 / 10:06, namuna «fon_poly.png»): ikkita qoʻshimcha mavzu
        //   «STTB Klassik 2» (classic2) va «Vitrina 2» (vitrina2) — Klassik / Vitrina ning oʻzi (tuzilishi, sarlavhalari, kartochka
        //   joylashuvi oʻsha), faqat:
        //   • orqada butun ekranda BITTA yaxlit rasm — toʻq koʻk «poligon» (assets/bg61_poly.jpg); sahifa surilganda joyida turadi;
        //     barcha sahifa va oynalar uchun yagona — temir yoʻl rasmi, sarlavha rasmi, foydalanuvchi tanlagan fon ishlatilmaydi;
        //   • ustidagi sarlavha banneri, tugmalar va kartochkalar — shaffof shisha (blur, ingichka koʻkish ramka), rasm orqadan bilinadi.
        //   Texnik: body[data-theme] — asosiy mavzu (classic / vitrina) qoladi, shuning uchun eski uslublar ishlayveradi;
        //   qoʻshimcha belgi — body.th-poly va body[data-theme2]. Tanlov shu qurilmada eslab qolinadi (AGMK_THEME_KEY).
        // =====================================================================
        const T61: any = window as any;
        var T61_MAP: any = { classic2: 'classic', vitrina2: 'vitrina' };
        try {
            if (Array.isArray(T61.AGMK_THEMES)) {
                const L = T61.AGMK_THEMES; const add = (row: any[], after: string) => { if (L.some((x: any) => x[0] === row[0])) return; const i = L.findIndex((x: any) => x[0] === after); L.splice(i < 0 ? L.length : i + 1, 0, row); };
                add(['classic2', 'STTB Klassik 2', 'Klassik — orqada yagona toʻq koʻk poligon rasm, shaffof shisha kartochkalar', '#070b14', '#60a5fa'], 'classic');
                add(['vitrina2', 'Vitrina 2', 'Vitrina plitkalari — orqada yagona toʻq koʻk poligon rasm, shaffof shisha', '#070b14', '#e9c97a'], 'vitrina');
            }
        } catch (e) { console.error('6.1 mavzular', e); }
        function t61Mark(t: string): void {
            const on = !!T61_MAP[t]; document.body.classList.toggle('th-poly', on);
            if (on) document.body.setAttribute('data-theme2', t); else document.body.removeAttribute('data-theme2');
            try { document.documentElement.classList.toggle('th-poly-root', on); } catch (e) { /* */ }
        }
        if (typeof T61.themeApply === 'function') {
            const _ta = T61.themeApply;
            T61.themeApply = function (this: unknown, t: string, save?: boolean) {
                const base = T61_MAP[t];
                if (!base) { t61Mark(''); return _ta.apply(this, arguments); }
                const r = _ta.call(this, base, false); t61Mark(t);
                if (save) { try { localStorage.setItem(T61.AGMK_THEME_KEY, t); } catch (e) { /* */ } }
                try { const th = T61.AGMK_THEMES.find((x: any) => x[0] === t); const sub = T61.$id('set-theme-sub'); if (sub && th) sub.textContent = th[1]; const mc = document.querySelector('meta[name="theme-color"]'); if (mc) mc.setAttribute('content', '#070b14'); } catch (e) { /* */ }
                return r;
            };
            try { T61.themeApply(T61.themeGet(), false); } catch (e) { /* */ }
        }
        (function () {
            const st = document.createElement('style'); st.id = 'v61thmCss';
            const P = 'body.th-poly';
            st.textContent = `
            html.th-poly-root{background:#070b14!important}
            ${P}{--agmk-bgB:none;--agmk-bgH1:none;--agmk-bgH2:none;--agmk-bgM:none;--t-bg:transparent;--t-bbg:var(--agmk-poly);--t-hbg:none;
              --t-card:rgba(10,16,32,.40);--t-card2:rgba(10,16,32,.62);--t-border:rgba(147,197,253,.22);background:transparent!important;background-image:none!important}
            html body.th-poly::before{content:""!important;position:fixed!important;left:0;top:0;inset:auto;width:100vw;height:100vh;height:100lvh;z-index:-2!important;opacity:1!important;pointer-events:none;background:#070b14 var(--agmk-poly) center/cover no-repeat!important;transform:translateZ(0)}
            html body.th-poly::after{background:linear-gradient(180deg,rgba(2,6,23,.05),rgba(2,6,23,.25))!important;z-index:-1!important}
            /* sahifalar, tanalar, sarlavhalar — shaffof (rasm orqadan) */
            ${P} :is(.screen,.ui-body,.sec-body,.set-body,.ui-head,.h9-head,.inner-header,.set-head,.screen-header,#dashPanel){background-color:transparent!important;background-image:none!important}
            ${P} .screen:not(#screen-main) .ui-body{background:transparent!important}
            ${P} :is(.ui-head,.h9-head,.inner-header,.set-head){box-shadow:none!important;border-bottom-color:rgba(147,197,253,.12)!important}
            ${P} .h9-head.h59-k{min-height:170px!important}
            ${P} .h9-head.h59-k::after{display:none!important}
            ${P} .h9-head.h59-k .h59-crumb{color:#fcd34d}
            @media (min-width:720px){${P} .h9-head.h59-k{min-height:190px!important}}
            /* shisha */
            ${P} :is(.btn-card,.hs-box,.hs-card,.nd-tip,.xt-card,.rs-card,.mn-card,.card-sec,.st-res,.vg-card,.v-card,.list-item){background:rgba(10,16,32,.40)!important;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2);border:1px solid rgba(147,197,253,.22)!important;box-shadow:0 10px 30px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.07)!important}
            ${P} :is(.btn-card,.hs-card)::before{display:none!important}
            ${P} :is(.h9-c,.back-btn.h9-back,.h9-cap){background:rgba(10,16,32,.42)!important;border:1px solid rgba(147,197,253,.24)!important}
            ${P} .search-box{background:rgba(10,16,32,.45)!important;border-color:rgba(147,197,253,.25)!important}
            ${P} .sec-tabs button,${P} .sec-tabs .tab{background:rgba(10,16,32,.45)!important;border-color:rgba(147,197,253,.25)!important}
            /* bosh sahifa tepasi (E) */
            ${P} #d60h .e61-bn,${P} #d60h.d60-vit .e61-bn{background:rgba(10,16,32,.38)!important;background-image:none!important;-webkit-backdrop-filter:blur(14px) saturate(1.2);backdrop-filter:blur(14px) saturate(1.2);border:1px solid rgba(147,197,253,.22);text-shadow:none;box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.08)}
            ${P} #d60h .e61-bn::after{display:none}
            ${P} #d60h .d60-org{color:#bcd0ee}${P} #d60h .d60-wp{color:#fbbf24}
            ${P} #d60h .d60-d,${P} #d60h.d60-vit .d60-d{background:rgba(255,255,255,.06)!important;border:1px solid rgba(147,197,253,.25)!important;-webkit-backdrop-filter:none;backdrop-filter:none}
            ${P} #d60h .d60-d.on{background:rgba(37,99,235,.42)!important;border-color:rgba(96,165,250,.85)!important}
            ${P} #d60h :is(.d60-b,.e61-ur),${P} #d60h.d60-vit :is(.d60-b,.e61-ur){background:rgba(10,16,32,.38)!important;border:1px solid rgba(147,197,253,.22)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
            ${P} #d60h .e61-sr{background:rgba(10,16,32,.6)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
            /* Vitrina 2 — plitkalar shishada, oltin urgʻu qoladi */
            body.th-poly[data-theme="vitrina"] :is(.card-list,.mn-inner,.h9-list)>.btn-card{background:rgba(10,16,32,.40)!important}
            body.th-poly[data-theme="vitrina"] .h9-head.h59-v .h59v{background:rgba(10,16,32,.40)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(147,197,253,.22)!important}
            body.th-poly[data-theme="vitrina"] .h9-head.h59-v .h59v::before{display:none}
            /* Struktura chizma maydoni — oʻz kulrang varagʻi qoladi (oʻqish uchun) */
            `;
            document.head.appendChild(st);
        })();
        Object.assign(T61, { t61Mark: t61Mark });
