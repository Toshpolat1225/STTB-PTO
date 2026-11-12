        // =====================================================================
        // 5.9 — 2–6-bandlar (muallif, 02.11.2026): koʻrinish
        //  2) Struktura: maydon (fon) tungi rejimda — toʻq; kartochkalar avvalgi rangda (oq, havorang / toʻq sariq sarlavha),
        //     yozuv toʻq va aniq (oldin umumiy mavzu yozuvni och rangga oʻtkazib, oʻqib boʻlmas edi) — muallif 14:54;
        //  3) «📴 Server ulanmagan …» yashil yozuvi ekran oʻrtasini yopmaydi: kichik, pastki chap burchakda,
        //     server ulanguncha bir marta. Struktura maydonini surganda «pastga tortib yangilash» ishlamaydi
        //     (aynan shu yozuvni chiqarayotgan edi);
        //  4–5) SVO Davomat: «Bu kun uchun turniket maʼlumoti yuklanmagan» — sarlavha toʻq jigarrang,
        //     yuqori oʻngda ✕: shu kunga yashiriladi, boshqa kunda (maʼlumot yoʻq boʻlsa) yana chiqadi;
        //  6) SVO: «Sex / boʻlim», «Smena», «Turniket» tanlovlari va qidiruv — toʻq shaffof, oq yozuv,
        //     ochiladigan roʻyxat ham toʻq.
        //  Eski funksiyalar oʻchirilmadi — faqat ustidan uslub va oʻram.
        // =====================================================================
        const U59: any = window as any;
        var UI59: any = { offShown: false };
        (function () {
            const st = document.createElement('style'); st.id = 'v59uiCss';
            st.textContent = `
            /* muallif 15:08: maydon — kulrang (Sozlamadagi kulrang, biroz ochroq), juda toʻq emas, oq ham emas */
            .st-vp{background:#435267!important;background-image:radial-gradient(rgba(255,255,255,.13) 1px,transparent 1px)!important;background-size:22px 22px!important}
            .st-vp .st-title{color:#f8fafc!important}.st-vp .st-title small{color:#cbd5e1!important}.st-vp .st-title .r{color:#fca5a5!important}
            .st-vp .st-sec{color:#7dd3fc!important}.st-vp .st-sec.prod{color:#fdba74!important}
            .st-vp .st-svg .ln{stroke:#e2e8f0!important}.st-vp .st-svg .ln.wk{stroke:#fbbf24!important}.st-vp .st-svg marker path{fill:#e2e8f0}
            .st-vp .st-leg{color:#cbd5e1!important}
            /* 5.9 (muallif 14:54): kartochkalar — avvalgi rang (oq, havorang / toʻq sariq / sariq sarlavha), yozuv toʻq va aniq */
            .st-vp .st-box{background:#fff!important;border-color:#0f172a!important}
            .st-vp .st-box,.st-vp .st-box b,.st-vp .st-ph span,.st-vp .st-bh b{color:#0f172a!important}
            .st-vp .st-bh small{color:#334155!important}.st-vp .st-ph i,.st-vp .st-no{color:#64748b!important}.st-vp .st-empty{color:#94a3b8!important}
            .st-vp .st-ph em{color:#166534!important}.st-vp .st-ph em.vac{color:#166534!important}.st-vp .st-ph em.over{color:#c2410c!important}
            .st-vp .st-ch b{color:#1e3a8a!important}.st-vp .st-ch small{color:#475569!important}/* muallif 15:19: kartochka ichida qizil hoshiya/qizil rang yoʻq — boʻsh oʻrin ham oddiy (havorang) belgidek */
            .st-vp .st-ch.vac{background:#eff6ff!important;border:1px solid #93c5fd!important}.st-vp .st-ch.vac b{color:#1e3a8a!important}
            .st-vp .st-cnt.vac{color:#166534!important;background:#dcfce7!important}
            .st-vp .st-more{color:#1d4ed8!important}
            .st-tools button{background:rgba(15,23,42,.85)!important;border:1px solid rgba(255,255,255,.2)!important}
            .st-tools span{background:rgba(15,23,42,.85)!important;color:#e2e8f0!important;border:1px solid rgba(255,255,255,.15)}
            #n59Note{position:fixed;left:10px;bottom:calc(14px + env(safe-area-inset-bottom,0px));max-width:62%;padding:6px 10px;border-radius:10px;background:rgba(15,23,42,.88);border:1px solid rgba(255,255,255,.18);color:#e2e8f0;font-size:11px;line-height:1.3;z-index:30000;pointer-events:none;opacity:0;transition:opacity .25s}
            #n59Note.show{opacity:1}
            .dv-box.n59-nd{position:relative;padding-right:40px;background:linear-gradient(135deg,rgba(30,41,59,.82),rgba(15,23,42,.88))!important;border:1px solid rgba(148,163,184,.28)!important;color:#cbd5e1!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)} /* 6.0: boshqa kartochkalar kabi toʻq koʻkimtir shaffof */
            .dv-box.n59-nd b{color:#f8fafc!important}
            .dv-box.n59-nd .n59-x{position:absolute;top:6px;right:8px;width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(15,23,42,.6);color:#e2e8f0;font-size:14px;font-weight:700;line-height:1;cursor:pointer}
            .dv-fs{background:rgba(15,23,42,.8)!important;border:1px solid rgba(255,255,255,.15)!important;color:#fff!important}
            .dv-fs small{color:#94a3b8!important}
            .dv-fs select{color:#fff!important;background:transparent!important;color-scheme:dark}
            .dv-fs select option,.dv-in option{background:#0f172a;color:#fff}
            .dv-q,.dv-in{background:rgba(15,23,42,.8)!important;color:#fff!important;border:1px solid rgba(255,255,255,.15)!important;color-scheme:dark}
            .dv-q::placeholder{color:#94a3b8}
            .dv-dt input[type=date],.dv-dt input[type=month]{color-scheme:dark}
            `;
            document.head.appendChild(st);
        })();
        // 3) server holati yozuvi — kichik, burchakda, bir marta
        function n59Note(msg: string): void {
            let n = document.getElementById('n59Note'); if (!n) { n = document.createElement('div'); n.id = 'n59Note'; document.body.appendChild(n); }
            n.textContent = msg; n.classList.add('show'); clearTimeout((n as any)._h); (n as any)._h = setTimeout(() => n && n.classList.remove('show'), 3500);
        }
        if (typeof U59.showToast === 'function') U59.showToast = U59.agmkExtend('showToast', '5.9: «server ulanmagan» — kichik, burchakda, bir marta', U59.showToast, (o: Function) => function (this: unknown, msg: any) {
            const s = typeof msg === 'string' ? msg : '';
            if (/^📴\s*Server (ulanmagan|bilan aloqa)/.test(s)) { if (UI59.offShown) return; UI59.offShown = true; n59Note(s.replace(/\s*—.*$/, '') + ' — oxirgi saqlangan maʼlumot'); return; }
            if (/^(🟢 Server ulandi|✅ Yangilandi)/.test(s)) UI59.offShown = false;
            return o.apply(this, arguments);
        });
        // Struktura maydonini surganda «pastga tortib yangilash» ishga tushmasin
        (function () {
            const stop = (e: any) => { try { const t = e.target; if (t && t.closest && t.closest('.st-vp') && U59.PTR) { U59.PTR.y0 = null; U59.PTR.dy = 0; } } catch (x) { /* */ } };
            window.addEventListener('touchstart', (e) => { setTimeout(() => stop(e), 0); stop(e); }, { passive: true, capture: true });
            window.addEventListener('touchmove', stop, { passive: true, capture: true });
        })();
        // 4–5) SVO: maʼlumot yoʻq ogohlantirishi
        function dv59Key(d: any): string { return 'agmk_dv_nd_hide_' + String(d || ''); }
        function dv59Hide(btn: any): void {
            try { localStorage.setItem(dv59Key(U59.DV && U59.DV.d), '1'); } catch (e) { /* */ }
            try { const b = btn && btn.closest && btn.closest('.dv-box'); if (b) b.remove(); } catch (e) { /* */ }
        }
        if (typeof U59.dvBugunHtml === 'function') U59.dvBugunHtml = U59.agmkExtend('dvBugunHtml', '5.9: ogohlantirish — toʻq sarlavha va ✕', U59.dvBugunHtml, (o: Function) => async function (this: unknown) {
            let h = await o.apply(this, arguments); if (typeof h !== 'string') return h;
            const re = /<div class="dv-box" style="background:#fff7ed;border-color:#fdba74;color:#9a3412">⚫ <b>Bu kun uchun turniket maʼlumoti yuklanmagan\.<\/b>([\s\S]*?)<\/div>/;
            if (!re.test(h)) return h;
            let hid = false; try { hid = localStorage.getItem(dv59Key(U59.DV && U59.DV.d)) === '1'; } catch (e) { /* */ }
            if (hid) return h.replace(re, '');
            return h.replace(re, (m0: string, rest: string) => `<div class="dv-box n59-nd"><button class="n59-x" title="Bu kun uchun yashirish" onclick="dv59Hide(this)">✕</button>⚫ <b>Bu kun uchun turniket maʼlumoti yuklanmagan.</b>${rest}</div>`);
        });
        Object.assign(U59, { UI59: UI59, n59Note: n59Note, dv59Hide: dv59Hide });
