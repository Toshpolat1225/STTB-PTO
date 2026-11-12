        // =====================================================================
        // v2.4 — AI: Google qidiruvi (Gemini grounding) va tezlik
        //  • Ichki ma'lumot (texnika, xodimlar) — faqat bazadan; umumiy savollar — bilim + Google
        //  • Oddiy savolda model «o'ylamaydi» (tez), murakkabida chuqur o'ylaydi
        //  • Umumiy savolga texnika statistikasi yuborilmaydi (kontekst kichik — javob tez)
        //  • Javob ostida manbalar va sarflangan vaqt
        // =====================================================================
        var AIWEB = { meta: null, used: false, lite: false, t0: 0, fail: '' };
        var AI_INTERNAL_RE = /vagon|вагон|dumpkar|думпкар|lokomotiv|локомотив|teplovoz|тепловоз|elektrovoz|электровоз|пэ2|pe2|texnika|техник|avtotraktor|ekskavator|kran|bizda|bizning|bazada|ilovada|dasturda|ta.?mir talab|ta.?mirda|ta.?mir |tarkib|xodim|ishchi|smena|akt\b|dalolatnoma|hisobot|forma.?30|zamechan|nosozlik|pasport|stansiya|станц|депо|depo|№\s*\d|\b\d{4,8}\b/i;
        var AI_DEEP_RE = /hisobla|hisob-kitob|tahlil|solishtir|tushuntir|nega|nima uchun|qanday qilib|reja|yozib ber|xat yoz|ariza|akt yoz|jadval|formula|рассчит|посчит|анализ|сравни|объясни|почему|составь|напиши/i;
        function aiOptsFor(q, L) {
            const c = aicGet(), s = String(q || '');
            const internal = AI_INTERNAL_RE.test(s) || !!(L && L.t && !L.help && /^(🚃|🚂|🚜|📊|🛠|🔧|✅|⚠️|❌|📋)/.test(L.t));
            const web = c.prov === 'gemini' && c.web !== false;
            const mode = c.mode || 'auto';
            const fast = mode === 'fast' ? true : mode === 'deep' ? false : (s.length < 140 && !AI_DEEP_RE.test(s));
            return { internal: internal, web: web, fast: fast };
        }
        function aiWebOpen(u) { u = String(u || ''); if (!/^https:\/\//.test(u)) return; try { if (window.AgmkNative && AgmkNative.openExternal) AgmkNative.openExternal(u); else window.open(u, '_blank', 'noopener'); } catch (e) {} }
        function aiWebSrcHtml() {
            const m = AIWEB.meta; if (!m) return '';
            const ch = (m.groundingChunks || []).map(x => x && x.web).filter(x => x && x.uri).slice(0, 5);
            if (!ch.length) return '';
            return '<div class="ai-web">🌐 Manbalar: ' + ch.map((w, i) => `<a href="javascript:void(0)" data-u="${escapeHtml(w.uri)}" onclick="aiWebOpen(this.dataset.u)">${i + 1}. ${escapeHtml(String(w.title || w.uri).slice(0, 40))}</a>`).join(' ') + '</div>';
        }
        function aiWebTag() {
            const m = AIWEB.meta, q = m && (m.webSearchQueries || []).length;
            const t = AIWEB.t0 ? ((Date.now() - AIWEB.t0) / 1000).toFixed(1).replace('.', ',') + ' s' : '';
            return (q ? ' + 🌐 Google' : '') + (t ? ' · ' + t : '');
        }
        (function () {
            // Umumiy savolga texnika statistikasi va punktlar yuborilmaydi — faqat sana (tezroq va maxfiyroq)
            if (typeof aiCtx === 'function') { aiCtx = agmkExtend('aiCtx', 'Umumiy savolga texnika statistikasi va punktlar yuborilmaydi — faqat sana (tezro', aiCtx, o => function (q, local, sec) { if (AIWEB.lite) return 'Bugun: ' + fmtISO(todayISO()) + '.' + (local && !/^Quyidagilarni/.test(local) ? '\nDastur bazasining javobi: ' + local : ''); return o.apply(this, arguments); }); }
            // Bosh sahifa qidiruvi: AI ulangan bo'lsa — «Gemini + Google bilan to'liq javob» tugmasi
            if (typeof filterMainMenu === 'function') { filterMainMenu = agmkExtend('filterMainMenu', 'Bosh sahifa qidiruvi: AI ulangan boʼlsa — «Gemini + Google bilan toʼliq javob» t', filterMainMenu, o => function () { const r = o.apply(this, arguments); try { if (typeof aiCloudReady === 'function' && aiCloudReady()) { const box = $id('mainAiAns'); const b = box && box.querySelector('.mai-card .mini-btn'); if (b && /suhbat/i.test(b.textContent)) b.innerText = aicGet().prov === 'gemini' && aicGet().web !== false ? '🌐 Gemini + Google bilan toʻliq javob' : '☁️ AI bilan toʻliq javob'; } } catch (e) {} return r; }); }
        })();

