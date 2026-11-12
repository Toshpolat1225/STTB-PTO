        // =====================================================================
        // v2.5 — mayda tuzatishlar
        //  • Oylik to'plam tekshiruvi: spravka-raschet yo'q / oy bo'sh — ogohlantirish (dialogda ham, natijada ham)
        // =====================================================================
        function hpPkgWarn(sheets, month) {
            const W = [], spr = (sheets || []).filter(x => x.type === 'spr');
            if (!spr.length) W.push({ k: 'nospr', msg: 'Spravka-raschet yuklanmagan — solishtirish uchun asos yoʻq. Faqat qolgan hujjatlar oʻzaro solishtiriladi; toʻliq tekshiruv uchun spravkani qoʻshing.' });
            if (!month) W.push({ k: 'nomonth', msg: 'Oy koʻrsatilmagan — Forma-30 va hujjatlar qaysi oy boʻyicha solishtirilishi aniq emas. «OY» maydoniga YYYY-MM yozing (masalan 2026-08).' });
            else if (spr.length) { const blocks = []; spr.forEach(x => (x.data || []).forEach(b => blocks.push(b))); if (blocks.length) { const cur = blocks.filter(b => !b.month || b.month === month), n = cur.reduce((a, b) => a + ((b.items || []).length), 0); if (!n) W.push({ k: 'empty', msg: 'Tanlangan oy (' + month.split('-').reverse().join('.') + ') boʻyicha spravkada birorta qator yoʻq — oy boʻsh. Oyni yoki faylni tekshiring.' }); } }
            return W;
        }
        (function () {
            if (typeof hpCheck === 'function') { hpCheck = agmkExtend('hpCheck', 'hpCheck', hpCheck, o => function (pkg) {
                const res = o.apply(this, arguments), F = res && Array.isArray(res.findings) ? res.findings : null; if (!F) return res;
                try { const M = pkg.month || (pkg.f30 && pkg.f30.month) || ''; hpPkgWarn(pkg.sheets, M).reverse().forEach((w, i) => { F.unshift({ id: 'pw' + (i + 1), st: '', t: w.k, lvl: 'blue', sec: '⚠️ Ogohlantirish', name: w.k === 'nospr' ? 'Spravka-raschet yoʻq' : w.k === 'nomonth' ? 'Oy koʻrsatilmagan' : 'Oy boʻsh', msg: w.msg, src: [] }); }); } catch (e) {}
                return res; }); }
            if (typeof hpDlg === 'function') { hpDlg = agmkExtend('hpDlg', 'hpDlg', hpDlg, o => function () {
                const r = o.apply(this, arguments);
                try { const P = HPK.pend, m = $id('hpModal'); if (P && m) { const W = hpPkgWarn(P.sheets, P.month); const box = m.querySelector('.modal-content'), h = box && box.querySelector('.px-h'); let w = $id('hpWarn'); if (w) w.remove(); if (W.length && h) h.insertAdjacentHTML('afterend', `<div id="hpWarn" class="hp-warn">${W.map(x => '⚠️ ' + escapeHtml(x.msg)).join('<br>')}</div>`); } } catch (e) {}
                return r; }); }
        })();

