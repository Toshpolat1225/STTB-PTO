
        // =====================================================================
        // v3.0 — ↔️ BOSH SAHIFA YUQORI TUGMALARINI SURISH
        //  Tugmani 3 soniya bosib turing → telefon titraydi, tugma yorishadi → barmoqni surib xohlagan joyga qo'ying.
        //  Joy shu qurilmada eslab qolinadi. «Parametrlar → Fon, logotip va ovoz → ↩ Tugmalar joyini tiklash».
        //  3 soniyadan oldin barmoq siljisa yoki qo'yib yuborilsa — oddiy bosish (tasodifan surilmaydi).
        // =====================================================================
        var DRG_KEY = 'agmk_hdr_pos', DRG_SEL = ['#chatTopBtn', '#opsBtn', '#bellBtn', '#screen-main .main-dots', '#screen-main .srch-go', '#mic-globalSearchInput', '#btn-undo', '#btn-redo'];
        var DRG = { t: 0, el: null, on: false, sx: 0, sy: 0, ox: 0, oy: 0, eat: false };
        function drgPos() { try { return JSON.parse(localStorage.getItem(DRG_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function drgHost() { return document.querySelector('#screen-main > div'); }
        function drgKey(el) { return DRG_SEL.find(s => document.querySelector(s) === el) || ''; }
        function drgApply() {
            const P = drgPos(), H = drgHost(); if (!H) return; if (Object.keys(P).length) H.style.position = 'relative';
            DRG_SEL.forEach(s => { const el = document.querySelector(s); if (!el) return; const p = P[s];
                if (p) { el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.zIndex = 30; el.dataset.drg = '1'; drgPlace(el, H, p.x * H.clientWidth, p.y); }
                else if (el.dataset.drg) { ['position', 'left', 'top', 'right', 'bottom', 'zIndex'].forEach(k => el.style[k] = ''); delete el.dataset.drg; } });
        }
        // hx, hy — H (sarlavha bloki) ichidagi koordinata; element o'z offsetParent'iga nisbatan joylanadi
        function drgPlace(el, H, hx, hy) {
            const hr = H.getBoundingClientRect(); hx = Math.max(0, Math.min(hx, H.clientWidth - el.offsetWidth)); hy = Math.max(0, Math.min(hy, H.clientHeight - el.offsetHeight));
            const op = el.offsetParent || H, or = op.getBoundingClientRect(); el.style.left = (hr.left + hx - or.left) + 'px'; el.style.top = (hr.top + hy - or.top) + 'px'; return { x: hx, y: hy };
        }
        function drgBuzz() { try { if (window.AgmkNative && typeof AgmkNative.vibrate === 'function') { AgmkNative.vibrate(60); return; } } catch (e) {} try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} }
        function drgDown(e) {
            const el = e.target.closest && DRG_SEL.map(s => document.querySelector(s)).find(x => x && x.contains(e.target)); if (!el) return;
            DRG.el = el; DRG.sx = e.clientX; DRG.sy = e.clientY; DRG.on = false; clearTimeout(DRG.t);
            DRG.t = setTimeout(() => { if (DRG.el !== el) return; DRG.on = true; DRG.eat = true; drgBuzz(); el.classList.add('drg-on'); const H = drgHost(), hr = H.getBoundingClientRect(), r = el.getBoundingClientRect(); H.style.position = 'relative'; el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.zIndex = 40; DRG.hp = drgPlace(el, H, r.left - hr.left, r.top - hr.top); DRG.ox = DRG.sx - r.left; DRG.oy = DRG.sy - r.top; }, 3000);
        }
        function drgMove(e) {
            if (!DRG.el) return;
            if (!DRG.on) { if (Math.abs(e.clientX - DRG.sx) > 10 || Math.abs(e.clientY - DRG.sy) > 10) { clearTimeout(DRG.t); DRG.el = null; } return; }
            e.preventDefault(); const H = drgHost(), hr = H.getBoundingClientRect(), el = DRG.el;
            DRG.hp = drgPlace(el, H, e.clientX - DRG.ox - hr.left, e.clientY - DRG.oy - hr.top);
        }
        function drgUp() {
            clearTimeout(DRG.t); const el = DRG.el; DRG.el = null; if (!el || !DRG.on) return; DRG.on = false; el.classList.remove('drg-on');
            const H = drgHost(), P = drgPos(), k = drgKey(el); if (k) { P[k] = { x: (DRG.hp || { x: 0 }).x / Math.max(1, H.clientWidth), y: (DRG.hp || { y: 0 }).y }; try { localStorage.setItem(DRG_KEY, JSON.stringify(P)); } catch (e) {} el.dataset.drg = '1'; }
            showToast('📌 Tugma joyi saqlandi'); setTimeout(() => { DRG.eat = false; }, 400);
        }
        function drgReset() { try { localStorage.removeItem(DRG_KEY); } catch (e) {} drgApply(); const H = drgHost(); if (H) H.style.position = ''; showToast('↩ Tugmalar asl joyiga qaytdi'); }
        (function () {
            document.addEventListener('pointerdown', drgDown, true); document.addEventListener('pointermove', drgMove, { capture: true, passive: false }); document.addEventListener('pointerup', drgUp, true); document.addEventListener('pointercancel', drgUp, true);
            document.addEventListener('click', e => { if (DRG.eat) { e.stopPropagation(); e.preventDefault(); } }, true); // surishdan keyingi «bosish» bajarilmaydi
            document.addEventListener('contextmenu', e => { if (DRG.el) e.preventDefault(); }, true);
            const c = document.createElement('style'); c.textContent = '.drg-on{outline:2px dashed #38bdf8!important;box-shadow:0 0 18px rgba(56,189,248,.8)!important;transform:scale(1.12);touch-action:none}' + DRG_SEL.join(',') + '{touch-action:manipulation;-webkit-touch-callout:none;user-select:none}';
            document.head.appendChild(c);
            setTimeout(drgApply, 600); window.addEventListener('resize', () => setTimeout(drgApply, 100));
            try { if (typeof SEC_EV !== 'undefined') SEC_EV.fns.push(() => { if (!DRG.el) drgApply(); }); } catch (e) {} // kirishdan keyin (sahifa ko'ringach) qayta joylash
        })();

