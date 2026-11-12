/* ===== v3.11.1 — kartochka/ikonkani 3 soniya bosib turish haqiqiy telefonda ham ishlashi uchun =====
   Sabab: Android WebView da ikonka (rasm) uzoq bosilganda telefon uni «sudrab olib ketish» (drag) yoki
   matn belgilashni boshlaydi va bosishni bekor qiladi (pointercancel) — 3 soniya hech qachon tugamasdi.
   1) Kartochka ichidagi rasm va matn sudralmaydi / belgilanmaydi, rasm bosishni oʻziga olmaydi
   2) Kartochkani 3 soniya bosganda ochiladigan sozlamada ham «🖼 Ikonka rasmini almashtirish» tugmasi */
(function () {
    try {
        const st = document.createElement('style');
        st.textContent = '.btn-card,.btn-card *{-webkit-touch-callout:none!important;-webkit-user-select:none!important;user-select:none!important;-webkit-user-drag:none!important}.btn-card img{pointer-events:none!important;-webkit-user-drag:none!important}';
        document.head.appendChild(st);
        const inCard = e => e.target && e.target.closest && e.target.closest('.btn-card');
        ['dragstart', 'selectstart'].forEach(n => document.addEventListener(n, e => { if (inCard(e)) e.preventDefault(); }, true));
        const nod = r => { try { (r || document).querySelectorAll('.btn-card img').forEach(i => { if (i.draggable !== false) i.draggable = false; }); } catch (e) {} };
        nod(); try { new MutationObserver(() => nod()).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
        // oxirgi bosilgan kartochka — sozlama oynasiga ikonka tugmasini qoʻshish uchun
        let lastCard = null;
        document.addEventListener('pointerdown', e => { const c = inCard(e); if (c) lastCard = c; }, true);
        if (typeof uiSetOpen === 'function') uiSetOpen = agmkExtend('uiSetOpen', 'v3.11.1: kartochka sozlamasida ikonka rasmi', uiSetOpen, o => function (t) {
            const r = o.apply(this, arguments);
            try {
                const c = lastCard; if (t !== 'c' || !c || !c.querySelector('.btn-icon') || typeof icSheet !== 'function') return r;
                const m = document.getElementById('uiSet'); if (!m || m.querySelector('.ic111')) return r;
                const h = m.querySelector('.px-h'); if (!h) return r;
                const b = document.createElement('button'); b.className = 'action-btn ic111'; b.style.margin = '8px 0'; b.textContent = '🖼 Ikonka rasmini almashtirish';
                b.onclick = () => { try { uiSetOk(); } catch (e) {} icSheet(c); };
                h.insertAdjacentElement('afterend', b);
            } catch (e) {}
            return r;
        });
    } catch (e) { console.error(e); }
})();

    

