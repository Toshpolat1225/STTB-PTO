        // =========================================================
        // Standart sahifasi: faqat o'zbekcha hujjatlar (MM) uchun moslash
        // =========================================================
        (function () {
            ND_CATS.splice(ND_CATS.length - 1, 0, { id: 'mm', ic: '🦺', t: 'Mehnat muhofazasi', re: /mehnat(ni)? muhofaza|охран[аы] труда|instruktaj|инструктаж|xavfsizlik texnika/ }, { id: 'mttb', ic: '📦', t: 'MTTB', re: /moddiy.texnik|mttb|ombor|склад|снабжен/ });
            gostRender = agmkExtend('gostRender', 'gostRender', gostRender, o => function () {
                const d = gostDoc(ND.gid); const only = d && d.langs && d.langs.length === 1;
                if (only) GOST.langSaved = GOST.langSaved || GOST.lang, GOST.lang = d.langs[0];
                const r = o.apply(this, arguments);
                try {
                    if (!d) return r;
                    const b = $id('ndBody');
                    if (only) { const lg = b.querySelector('.gt-lang'); if (lg) lg.style.display = 'none'; const sm = b.querySelector('.gt-head small'); if (sm) sm.textContent = d.conf ? "🔒 Korxona ichki hujjati (konfidensial). Matn skanerdan aynan koʻchirilgan. Bulutli AI'ga yuborilmaydi." : "Asl matn."; }
                    if (GOST.tab === 'text' && !ndQ()) {
                        const toc = b.querySelector('.gt-toc');
                        if (toc) { const hs = d.items.map((it, i) => [it, i]).filter(([it]) => it.t === 'h'); toc.innerHTML = '<summary>📑 Mundarija</summary>' + hs.map(([it, i]) => `<a onclick="gostJump(${i})">${escapeHtml(((it.n ? it.n + ' ' : '') + gostTxt(it)).slice(0, 140))}</a>`).join(''); }
                    }
                    b.querySelectorAll('.gt-tbl').forEach(el => { const n = el.getAttribute('data-tn'); if (!n) { const bb = el.querySelector('.gt-cap b'); if (bb) bb.textContent = GOST.lang === 'ru' ? 'Таблица' : 'Jadval'; } });
                    if (d.id === 'mm_yoriqnomalar') { const hd = b.querySelector('.gt-head'); if (hd && !hd.querySelector('.mm-go')) { const bt = document.createElement('button'); bt.className = 'mini-btn mm-go'; bt.style.marginTop = '8px'; bt.innerText = "🦺 Muddatlarni kuzatish (Mehnat muhofazasi boʻlimi)"; bt.onclick = () => { try { openMM('instr'); } catch (e) {} }; hd.appendChild(bt); } }
                } catch (e) { console.error(e); }
                if (only && GOST.langSaved) { GOST.lang = GOST.langSaved; GOST.langSaved = null; }
                return r;
            });
        })();

