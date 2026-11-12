        // =====================================================================
        // 6.1 — 6, 9, 10, 13-bandlar (muallif tasdiqlagan namunalar «tepa_E3», «tepa_W1»; 03.11.2026): BOSH SAHIFA TEPASI «E»
        //  6.0 dagi D2 tepa qismi (v60hdr) ustiga qayta joylash — eski tugmalar va vazifalari oʻsha:
        //   • tepa qator: [☰ — Web] gerb · AGMK-STTB · salom | ↶ ↷ (bitta qobiq, oʻz tugmalari) · ⓘ · 🔔 · ⋮   (QR tugmasi yoʻq)
        //   • banner ichida, F.I.Sh. ostida — 6 ta yarim shaffof tugma: Chat · Vazifalar · Nosozlik · Yuklangan · Qidiruv · Skaner
        //   • «Qidiruv» — banner ostida qidiruv maydoni ochiladi (🎤, ✕); kompyuterda Ctrl+K ham ochadi
        //   • «Skaner» — eski QR tugmasi vazifasi (jonli skaner: texnika yorligʻi → pasport, server QR → ulanish)
        //   • Web (keng ekran): bannerda chapda maʼlumot, oʻngda tugmalar 3 × 2; bosh sahifa kartochkalari 3 ustun
        //   • Vitrina — xuddi shu tuzilish, banner — rasmsiz qoramtir kartochka
        //  «Kamchilik» nomi — «Nosozlik» (ochiladigan oyna «Nosozlik va avariyalar» bilan bir xil).
        // =====================================================================
        const E61: any = window as any;
        var E61_IC: any = {
            un: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', re: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
            srch: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>', scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
            info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
        };
        function e61Svg(k: string, s?: number): string { return `<svg viewBox="0 0 24 24" width="${s || 22}" height="${s || 22}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${E61_IC[k] || ''}</svg>`; }
        function e61Undo(d: number): void { try { if (d < 0) E61.undoAction(); else E61.redoAction(); } catch (e) { /* */ } setTimeout(e61Sync, 80); }
        function e61Sync(): void {
            const h = E61.$id('d60h'); if (!h) return; const u = E61.$id('btn-undo'), r = E61.$id('btn-redo');
            const a = h.querySelector('.e61-un'), b = h.querySelector('.e61-re'); if (a) a.classList.toggle('off', !u || !!u.disabled); if (b) b.classList.toggle('off', !r || !!r.disabled);
        }
        function e61Search(on?: boolean): void {
            const h = E61.$id('d60h'); if (!h) return; const box = h.querySelector('.e61-sr'); if (!box) return;
            const want = on === undefined ? !h.classList.contains('e61-sopen') : !!on;
            h.classList.toggle('e61-sopen', want); const q = h.querySelector('[data-k="srch"]'); if (q) q.classList.toggle('on', want);
            if (want) { const inp = box.querySelector('input'); if (inp) setTimeout(() => { try { inp.focus(); } catch (e) { /* */ } }, 30); }
            else { const inp = box.querySelector('input') as any; if (inp && inp.value) { inp.value = ''; try { inp.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) { /* */ } } }
        }
        // 6.0 dagi tugmalarni «E» tartibiga keltirish (har safar d60Build dan keyin; oʻzgarmagan boʻlsa — hech narsa qilmaydi)
        function e61Fix(): void {
            try {
                const h = E61.$id('d60h'); if (!h) return;
                const top = h.querySelector('.d60-top'), bn = h.querySelector('.d60-bn'), dock = h.querySelector('.d60-dock'), sr = h.querySelector('.d60-sr'); if (!top || !bn || !dock || !sr) return;
                if (!h._e61) {
                    h._e61 = 1; h.classList.add('e61');
                    // tepa qator: QR oʻrniga ⓘ, oldida ↶ ↷
                    const qr = top.querySelector('[data-k="qr"]'); if (qr) qr.remove();
                    const bell = top.querySelector('[data-k="bell"]');
                    const ur = document.createElement('div'); ur.className = 'e61-ur'; ur.innerHTML = `<button type="button" class="e61-un" title="Ortga qaytarish">${e61Svg('un', 20)}</button><i></i><button type="button" class="e61-re" title="Oldinga qaytarish">${e61Svg('re', 20)}</button>`;
                    ur.addEventListener('click', (e: any) => { e.stopPropagation(); const b = e.target.closest('button'); if (!b) return; e61Undo(b.classList.contains('e61-un') ? -1 : 1); });
                    const inf = document.createElement('button'); inf.type = 'button'; inf.className = 'd60-b'; inf.setAttribute('data-k', 'info'); inf.title = 'Maʼlumot'; inf.innerHTML = e61Svg('info');
                    if (bell) { top.insertBefore(ur, bell); top.insertBefore(inf, bell); } else { top.appendChild(ur); top.appendChild(inf); }
                    // dock → banner ichiga; Maʼlumot — tepaga oʻtdi; Qidiruv va Skaner qoʻshiladi
                    const di = dock.querySelector('[data-k="info"]'); if (di) di.remove();
                    const al = dock.querySelector('[data-k="alert"]'); if (al) { const t = Array.from(al.childNodes).find((n: any) => n.nodeType === 3 && /\S/.test(n.textContent)) as any; if (t) t.textContent = 'Nosozlik'; al.setAttribute('title', 'Nosozlik va avariyalar'); }
                    const mk = (k: string, t: string, ic: string) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'd60-d e61-' + k; b.setAttribute('data-k', k); b.innerHTML = `<span>${e61Svg(ic)}<i class="d60-n"></i></span>${t}`; return b; };
                    dock.appendChild(mk('srch', 'Qidiruv', 'srch')); dock.appendChild(mk('scan', 'Skaner', 'scan'));
                    // banner: 6.0 kodi .d60-bn ichini qayta yozadi → u yashirin «manba» boʻlib qoladi; koʻrinadigani — .e61-bn (maʼlumot nusxasi + tugmalar)
                    const nb = document.createElement('div'); nb.className = 'e61-bn'; nb.innerHTML = '<div class="e61-who" data-k="me" title="Profil"></div>'; nb.appendChild(dock);
                    bn.parentNode.insertBefore(nb, bn.nextSibling); bn.classList.add('e61-hide');
                    try { new MutationObserver(() => e61Who()).observe(bn, { childList: true, subtree: true, characterData: true }); } catch (e) { /* */ }
                    // qidiruv: oʻz qutisi (banner ostida); eski .d60-sr — yashirin «qabul qutisi» (6.0 kodi u yerga qaytaradi — darhol olinadi)
                    const box = document.createElement('div'); box.className = 'e61-sr'; sr.parentNode.insertBefore(box, sr.nextSibling); sr.classList.add('e61-hide');
                    const x = document.createElement('button'); x.type = 'button'; x.className = 'e61-x'; x.title = 'Yopish'; x.textContent = '✕'; x.addEventListener('click', (e: any) => { e.stopPropagation(); e61Search(false); }); box.appendChild(x);
                    try { new MutationObserver(() => e61Pull()).observe(sr, { childList: true }); } catch (e) { /* */ }
                    // klik: Qidiruv va Skaner (qolganlari — 6.0 dagi d60Go)
                    h.addEventListener('click', (e: any) => {
                        const b = e.target && e.target.closest && e.target.closest('[data-k]'); if (!b || !h.contains(b)) return; const k = b.getAttribute('data-k');
                        if (k === 'srch') { e.stopImmediatePropagation(); e61Search(); }
                        else if (k === 'scan') { e.stopImmediatePropagation(); e61Scan(); }
                        else if (k === 'me' && e.target.closest('.d60-dock')) e.stopImmediatePropagation();
                    }, true);
                }
                const nb = h.querySelector('.e61-bn'); if (nb && dock.parentElement !== nb) nb.appendChild(dock);
                e61Who();
                e61Pull(); e61Sync();
                h.classList.toggle('d60-vit', /^vitrina/.test(document.body.getAttribute('data-theme') || ''));
            } catch (e) { console.error('6.1 tepa qism', e); }
        }
        // qidiruv maydonini oʻz qutimizga, eski ↶ ↷ ni yashirin joyda qoldiramiz (asl tugmalar — holat manbai)
        function e61Pull(): void {
            const h = E61.$id('d60h'); if (!h) return; const box = h.querySelector('.e61-sr'), sw = h.querySelector('.d60-sr .search-wrap'); if (!box) return;
            if (sw) box.insertBefore(sw, box.querySelector('.e61-x'));
        }
        function e61Scan(): void {
            try { if (typeof E61.qrScanOpen === 'function') { E61.qrScanOpen(); return; } } catch (e) { /* */ }
            const b = E61.$id('qrTopBtn'); if (b) b.click();
        }
        function e61Who(): void {
            const h = E61.$id('d60h'); if (!h) return; const bn = h.querySelector('.d60-bn'), w = h.querySelector('.e61-who'); if (!bn || !w) return;
            const html = bn.innerHTML; if (w._h !== html) { w.innerHTML = html; w._h = html; }
        }
        (function () {
            let t = 0;
            try { new MutationObserver(() => { if (t) return; t = setTimeout(() => { t = 0; const s = document.querySelector('#screen-main.active'); if (s) e61Fix(); }, 0) as any; }).observe(document.body, { childList: true }); } catch (e) { /* */ }
            setInterval(() => { if (document.querySelector('#screen-main.active')) e61Fix(); }, 1500);
            window.addEventListener('agmk:login', () => setTimeout(e61Fix, 400));
            setTimeout(e61Fix, 1700);
        })();
        if (typeof E61.openScreen === 'function') E61.openScreen = E61.agmkExtend('openScreen', '6.1: bosh sahifa tepasi E', E61.openScreen, (o: Function) => function (this: unknown, id: any) { const r = o.apply(this, arguments); if (id === 'screen-main') { setTimeout(e61Fix, 10); setTimeout(e61Fix, 200); } return r; });
        if (typeof E61.themeApply === 'function') E61.themeApply = E61.agmkExtend('themeApply', '6.1: tepa qism E mavzuga moslanadi', E61.themeApply, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(e61Fix, 10); return r; });
        // Ctrl+K — qidiruv (kompyuter)
        document.addEventListener('keydown', (e: any) => { if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK') && document.querySelector('#screen-main.active')) { e.preventDefault(); e61Search(true); } });
        ['undoAction', 'redoAction', 'saveDB', 'updateUndoRedoButtons'].forEach(fn => { if (typeof E61[fn] === 'function') { const _f = E61[fn]; E61[fn] = function (this: unknown) { const r = _f.apply(this, arguments); setTimeout(e61Sync, 40); return r; }; } });
        (function () {
            const st = document.createElement('style'); st.id = 'v61hdrCss';
            st.textContent = `
            #d60h.e61 .d60-top{gap:6px}
            #d60h.e61 .d60-b{width:38px;height:38px;flex:0 0 38px;border-radius:12px}
            #d60h.e61 .d60-lg{width:42px;height:42px;flex:0 0 42px}
            #d60h.e61 .d60-tt{min-width:0}#d60h.e61 .d60-tt b{white-space:nowrap;font-size:18px}
            #d60h.e61 .e61-ur{display:flex;align-items:center;height:38px;border-radius:12px;background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);flex:0 0 auto}
            #d60h.e61 .e61-ur button{width:30px;height:38px;display:grid;place-items:center;background:none;border:0;color:#e2e8f0;padding:0;cursor:pointer}
            #d60h.e61 .e61-ur button.off{opacity:.38}#d60h.e61 .e61-ur i{width:1px;height:18px;background:rgba(255,255,255,.18)}
            #d60h.e61 .e61-hide{display:none!important}
            #d60h.e61 .e61-bn{position:relative;border-radius:22px;overflow:hidden;padding:16px 14px 12px;display:flex;flex-direction:column;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);
              background-image:linear-gradient(180deg,rgba(2,6,23,.55),rgba(2,6,23,.2) 45%,rgba(2,6,23,.65)),var(--agmk-bgH1);background-size:cover;background-position:center 45%;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 28px rgba(0,0,0,.45)}
            #d60h.e61.d60-vit .e61-bn{background:linear-gradient(160deg,#1c2537 0%,#151c2b 55%,#111827 100%);border-color:rgba(255,255,255,.09);text-shadow:none}
            #d60h.e61.d60-vit .e61-bn::after{content:"";position:absolute;right:-40px;top:-50px;width:170px;height:170px;border-radius:50%;background:radial-gradient(rgba(251,191,36,.10),transparent 70%);pointer-events:none}
            #d60h.e61.d60-vit .d60-org{color:#8b98ad}#d60h.e61.d60-vit .d60-wp{color:#f5b301}
            #d60h.e61 .e61-who{cursor:pointer;position:relative;z-index:1}
            #d60h.e61 .e61-bn .d60-dock{position:relative;z-index:1}
            #d60h.e61 .d60-dock{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:14px;padding:0;background:none;border:0;-webkit-backdrop-filter:none;backdrop-filter:none;text-shadow:none}
            #d60h.e61 .d60-d{padding:8px 0 6px;border-radius:14px;background:rgba(15,23,42,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.22);color:#f1f5f9;font-size:10px;gap:4px;white-space:nowrap}
            #d60h.e61 .d60-d > span{width:auto;height:auto;background:none}
            #d60h.e61 .d60-d.on{background:rgba(37,99,235,.42);border-color:rgba(96,165,250,.85)}
            #d60h.e61 .d60-d .d60-n{top:-9px;right:-12px}
            #d60h.e61 .e61-sr{display:none;align-items:center;gap:6px;height:52px;padding:0 6px 0 4px;border-radius:18px;background:rgba(15,23,42,.8);border:1px solid rgba(96,165,250,.55);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
            #d60h.e61.e61-sopen .e61-sr{display:flex}
            #d60h.e61 .e61-sr .search-wrap{flex:1;min-width:0;display:flex!important;align-items:center;gap:6px;height:48px;background:none!important;border:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;position:relative!important;margin:0!important;width:auto!important;padding:0!important}
            #d60h.e61 .e61-sr .search-wrap .search-box{display:block!important;flex:1;min-width:0;width:auto!important;height:40px;background:none!important;border:0!important;color:#f1f5f9;font-size:15px;padding:0 4px!important;outline:none;box-shadow:none!important;position:static!important;opacity:1!important;visibility:visible!important}
            #d60h.e61 .e61-sr .search-wrap .search-icon,#d60h.e61 .e61-sr .search-wrap .srch-x{display:none!important}
            #d60h.e61 .e61-sr .search-wrap .srch-go{order:-1;position:static!important;width:38px!important;height:38px!important;min-width:38px;margin:0!important;border:0!important;box-shadow:none!important;font-size:0!important;color:transparent!important;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%3E%3Ccircle%20cx%3D%2211%22%20cy%3D%2211%22%20r%3D%226.5%22/%3E%3Cpath%20d%3D%22M16%2016l4%204%22/%3E%3C/svg%3E") center/22px no-repeat!important}
            #d60h.e61 .e61-sr .search-wrap .mic-btn{position:static!important;width:38px!important;height:38px!important;min-width:38px;border-radius:12px!important;margin:0!important;display:grid!important;border:0!important;box-shadow:none!important;flex:0 0 38px;color:transparent!important;font-size:0!important;background:rgba(255,255,255,.08) url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%221.9%22%20stroke-linecap%3D%22round%22%3E%3Crect%20x%3D%229%22%20y%3D%223%22%20width%3D%226%22%20height%3D%2211%22%20rx%3D%223%22/%3E%3Cpath%20d%3D%22M5%2011a7%207%200%200%200%2014%200M12%2018v3%22/%3E%3C/svg%3E") center/22px no-repeat!important}
            #d60h.e61 .e61-sr .search-wrap img{display:none!important}
            #d60h.e61 .e61-sr .search-wrap :is(.srch-btn,.mic-btn,.srch-go)::before,#d60h.e61 .e61-sr .search-wrap :is(.srch-btn,.mic-btn,.srch-go)::after{content:none!important;display:none!important}
            #d60h.e61 .e61-x{width:38px;height:38px;flex:0 0 38px;border-radius:12px;border:0;background:rgba(255,255,255,.08);color:#e2e8f0;font-size:16px;cursor:pointer}
            #d60h.e61.d60-vit .d60-dock{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
            #d60h.e61.d60-vit .d60-d{height:auto;justify-content:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:none;backdrop-filter:none}
            #d60h.e61.d60-vit .e61-ur{background:#121a2a;border-color:rgba(255,255,255,.1);-webkit-backdrop-filter:none;backdrop-filter:none}
            #d60h.e61.d60-vit .e61-sr{background:#121a2a;-webkit-backdrop-filter:none;backdrop-filter:none}
            @media (max-width:380px){#d60h.e61 .d60-tt b{font-size:16px}#d60h.e61 .d60-b{width:34px;height:34px;flex-basis:34px}#d60h.e61 .e61-ur button{width:27px}#d60h.e61 .d60-d{font-size:9px}}
            @media (min-width:900px){
              #d60h.e61 .d60-b{width:40px;height:40px;flex-basis:40px}#d60h.e61 .e61-ur{height:40px}#d60h.e61 .e61-ur button{width:34px;height:40px}
              #d60h.e61 .e61-bn{flex-direction:row;align-items:flex-end;gap:24px;padding:22px 26px;min-height:170px}
              #d60h.e61 .e61-who{flex:1;min-width:0}
              #d60h.e61 .d60-wr{justify-content:flex-start;gap:14px}
              #d60h.e61 .d60-nm{font-size:26px}
              #d60h.e61 .d60-dock,#d60h.e61.d60-vit .d60-dock{grid-template-columns:repeat(3,auto);margin-top:0;gap:8px;flex:0 0 auto}
              #d60h.e61 .d60-d{flex-direction:row;gap:8px;padding:10px 16px;font-size:13.5px}
              #d60h.e61 .d60-d .d60-n{top:-12px;right:-14px}
            }
            @media (min-width:1100px){body.agmk-web #screen-main #main-card-list{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}body.agmk-web #screen-main #main-card-list > .btn-card{margin:0!important}}
            @media (min-width:720px) and (max-width:1099px){body.agmk-web #screen-main #main-card-list{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}body.agmk-web #screen-main #main-card-list > .btn-card{margin:0!important}}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(E61, { e61Fix: e61Fix, e61Search: e61Search, e61Scan: e61Scan });
