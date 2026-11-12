        // =====================================================================
        // 6.0 (muallif tasdiqlagan namuna, 02.11.2026 — docs: HASAN_SARLAVHA_DIZAYN): ichki oraliq sahifalarning
        //  YUQORI SARLAVHASI — faqat Klassik va Vitrina mavzularida. Pastdagi kartalar, ish oynalari va boshqa
        //  mavzular (glass, minimal …) oʻzgarmaydi. Tugmalar (☰ ‹ qidiruv ↶ ↷ ⬇ ⋮) joyida va vazifasida qoladi.
        //   Klassik: temir yoʻl rasmi kengroq sarlavha, pastga qarab sahifaga silliq oʻtadi; oltin yoʻl yozuvi,
        //            katta sarlavha, shishasimon raqam chiplari.
        //   Vitrina: bosh sahifadagi profil kartasining oʻzi — tashkilot yozuvi, sariq boʻlim nomi, oʻngda son,
        //            katta sarlavha, izoh; Web da oʻngda raqam qutilari. Tugmalar kvadrat-yumaloq.
        //  Son izohlari (park, boʻlim, birlik) sarlavhaga chiqmaydi — muallif 19:32; sonlar faqat kartalarning oʻzida.
        // =====================================================================
        const H59: any = window as any;
        // qaysi sahifa, qaysi boʻlim, qanday birlik
        var H59_GRP: any = {
            sttb: { sec: 'Texnika' },
            xod: { sec: 'Xodimlar' }, seh: { sec: 'Ishlab chiqarish' },
            mttb: { sec: 'Taʼminot' }, map: { sec: 'Infratuzilma' }
        };
        var H59_SCR: any = {
            'screen-hr': { sec: 'Harakat' },
            'screen-hisob': { sec: 'Hujjatlar' },   // yorliqli sahifa — son yorliqqa bogʻliq, chip chiqmaydi
            'screen-vagmenu': { sec: 'Texnika', par: 'STTB texnikalari' }
        };
        function h59Theme(): string { const t = document.body.getAttribute('data-theme') || 'classic'; return t === 'classic' || t === 'vitrina' ? t : ''; }
        function h59Fmt(n: number): string { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
        function h59E(s: any): string { return String(s == null ? '' : s).replace(/[&<>"]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]); }
        function h59Clean(t: string): string { return String(t || '').replace(/^[^\p{L}\p{N}]+/u, '').replace(/\s+/g, ' ').trim(); }
        function h59Info(s: any): any {
            if (!s || !s.id) return null;
            let C: any = null;
            if (s.id === 'screen-grp') C = H59_GRP[s.dataset.g || ''];
            else C = H59_SCR[s.id];
            if (!C) return null;
            const head = s.querySelector('.h9-head'); if (!head) return null;
            const tEl = head.querySelector('.sec-title') || head.querySelector('.h9-row h2, .h9-row h1, h2');
            const title = h59Clean(tEl ? (tEl.firstChild && tEl.firstChild.nodeType === 3 && tEl.children.length ? tEl.firstChild.textContent : tEl.textContent) : '');
            if (!title) return null;
                        // muallif (19:32): «7 park», «3 boʻlim», «1 216 birlik» kabi son izohlari sarlavhada kerak emas
            const r: any = { C: C, title: title };
            return r;
        }
        function h59Html(t: string, I: any): string {
            const C = I.C, crumb = ['Bosh sahifa', C.sec].concat(C.par ? [C.par] : []).join(' › ');
            if (t === 'classic') return `<div class="h59-crumb">${h59E(crumb)}</div><h1${I.title.length > 18 ? ' class="lg"' : ''}>${h59E(I.title)}</h1>`; // uzun nom — kichikroq shrift (telefonda 2 qatorga sigʻadi)
            return `<div class="h59v-txt"><div class="h59v-org">SANOAT TEMIR YOʻL TRANSPORTI BOSHQARMASI</div><div class="h59v-sec"><b>${h59E(C.sec)}</b></div><h1>${h59E(I.title)}</h1>${C.sub ? `<small>${h59E(C.sub)}</small>` : ''}</div>`;
        }
        function h59Apply(s?: any): void {
            try {
                s = s || document.querySelector('.screen.active'); if (!s) return;
                const head = s.querySelector('.h9-head'); if (!head) return;
                const t = h59Theme(), I = t ? h59Info(s) : null;
                let box = head.querySelector(':scope > .h59x');
                if (!I) { head.classList.remove('h59-k', 'h59-v'); if (box) box.remove(); return; }
                if (!box) { box = document.createElement('div'); const bar = head.querySelector(':scope > .h9-bar'); if (bar && bar.nextSibling) head.insertBefore(box, bar.nextSibling); else head.appendChild(box); }
                box.className = 'h59x ' + (t === 'classic' ? 'h59k-tt' : 'h59v');
                const html = h59Html(t, I); if (box._h !== html) { box.innerHTML = html; box._h = html; }
                head.classList.toggle('h59-k', t === 'classic'); head.classList.toggle('h59-v', t === 'vitrina');
            } catch (e) { /* sarlavha — bezak; xato boʻlsa eski holat qoladi */ }
        }
        function h59Soon(): void { h59Apply(); setTimeout(() => h59Apply(), 0); setTimeout(() => h59Apply(), 160); }
        if (typeof H59.openScreen === 'function') H59.openScreen = H59.agmkExtend('openScreen', '6.0: ichki sahifa sarlavhasi (Klassik / Vitrina)', H59.openScreen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); h59Soon(); return r; });
        if (typeof H59.themeApply === 'function') H59.themeApply = H59.agmkExtend('themeApply', '6.0: sarlavha mavzuga moslanadi', H59.themeApply, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); h59Soon(); return r; });
        if (typeof H59.menuGrpOpen === 'function') H59.menuGrpOpen = H59.agmkExtend('menuGrpOpen', '6.0: guruh sahifasi sarlavhasi', H59.menuGrpOpen, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); h59Soon(); return r; });
        (function () {
            const st = document.createElement('style'); st.id = 'v59hdrCss';
            const K = 'body:is([data-theme="classic"],:not([data-theme])) .h9-head.h59-k', V = 'body[data-theme="vitrina"] .h9-head.h59-v';
            st.textContent = `
            ${K}{position:relative;min-height:250px;display:flex;flex-direction:column;padding-bottom:16px!important;background-size:cover!important;background-position:center 55%!important;border-bottom:0!important;box-shadow:none!important}
            ${K}::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:linear-gradient(180deg,rgba(5,10,20,.15) 0%,rgba(5,10,20,.05) 35%,rgba(8,14,26,.85) 82%,#0b1322 100%)}
            ${K} > *{position:relative;z-index:2}
            ${K} > .h9-row{display:none!important}
            ${K} > .h59k-tt{margin-top:auto;padding:0 3px}
            ${K} .h59-crumb{font-size:11px;letter-spacing:.16em;font-weight:800;text-transform:uppercase;color:#fcd34d;text-shadow:0 1px 6px rgba(0,0,0,.8)}
            ${K} h1{font-size:30px;font-weight:800;letter-spacing:-.3px;margin:4px 0 0;color:#fff;line-height:1.15;text-shadow:0 2px 12px rgba(0,0,0,.85)}${K} h1.lg{font-size:25px}
            ${K} > .sec-tabs:not(:empty),${K} > .hr-sum{margin-top:12px}
            ${V} > .h9-row{display:none!important}
            ${V} .h59v{margin-top:6px;border-radius:22px;padding:16px 18px;position:relative;overflow:hidden;background:linear-gradient(135deg,#182136 0%,#121a2b 70%);border:1px solid rgba(255,255,255,.09)}
            ${V} .h59v::before{content:"";position:absolute;right:-50px;top:-60px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(245,179,1,.10),transparent 70%);pointer-events:none}
            ${V} .h59v-txt{position:relative;flex:1;min-width:0}
            ${V} .h59v-org{font-size:11px;letter-spacing:.14em;color:#8b98ad;font-weight:700}
            ${V} .h59v-sec{display:flex;justify-content:space-between;gap:10px;margin-top:9px;font-size:14px}
            ${V} .h59v-sec b{color:#f5b301}${V} .h59v-sec span{color:#cbd5e1;font-weight:700;white-space:nowrap}
            ${V} .h59v h1{font-size:24px;font-weight:800;margin:6px 0 0;color:#fff;line-height:1.2}
            ${V} .h59v small{display:block;color:#94a3b8;font-size:13px;margin-top:3px}
            ${V} .h9-c,${V} .back-btn.h9-back,${V} .h9-cap{border-radius:14px!important;background:#121a2a!important;border:1px solid rgba(255,255,255,.1)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
            ${V} > .sec-tabs:not(:empty){margin-top:12px}
            @media (min-width:720px){
              ${K}{min-height:290px}${K} > .h59k-tt{padding:0 13px 6px}${K} h1,${K} h1.lg{font-size:40px}
              ${V} .h59v{display:flex;align-items:flex-end;gap:24px;padding:22px 26px}${V} .h59v h1{font-size:32px}
            }`;
            document.head.appendChild(st);
        })();
        Object.assign(H59, { h59Apply: h59Apply });
