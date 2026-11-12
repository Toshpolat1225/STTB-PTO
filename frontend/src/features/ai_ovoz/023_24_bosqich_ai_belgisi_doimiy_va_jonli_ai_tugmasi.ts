        // =====================================================================
        // YANGI (24-bosqich): AI belgisi, doimiy va jonli AI tugmasi
        // =====================================================================
        var AI_ICO = '<svg class="ai-ico"><use href="#aiIcoSym"/></svg>';
        var AI_ICO_S = '<svg class="ai-ico ai-ico-s"><use href="#aiIcoSym"/></svg>';
        function aiGlobalOpen() {
            const el = document.querySelector('.screen.active');
            let sec = 'Ilova';
            if (el) sec = el.id === 'screen-main' ? 'Bosh sahifa' : el.id === 'screen-vagonlar' ? 'Vagonlar parki' : (typeof aiSecFor === 'function' ? aiSecFor(el) : 'Ilova');
            openAiChat(sec); if (typeof aiHint === 'function') aiHint();
        }
        // Qaysi oyna ochiqligini kuzatib, tugma holatini moslash (sahifa, oyna, AI suhbati)
        function aiGlobSync() {
            const ov = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => !m.classList.contains('hidden'));
            const sp = $id('splash-screen'); document.body.classList.toggle('ai-splash', !!(sp && !sp.classList.contains('hidden') && getComputedStyle(sp).display !== 'none'));
            document.body.classList.toggle('ai-chat', ov.some(m => m.id === 'aiChatModal'));
            document.body.classList.toggle('ai-modal', ov.some(m => m.id !== 'aiChatModal' && !m.classList.contains('pk-ov')));
        }
        (function () {
            let t = null; const run = () => { t = null; aiGlobSync(); };
            try { new MutationObserver(() => { if (!t) t = setTimeout(run, 30); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }); } catch (e) {}
            aiGlobSync();
        })();

