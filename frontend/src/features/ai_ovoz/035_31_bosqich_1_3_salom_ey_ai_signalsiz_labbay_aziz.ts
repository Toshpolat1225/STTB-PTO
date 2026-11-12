        /* ===== 31-bosqich (1-3): "Salom, Ey AI" (signalsiz), "Labbay, Azizbek", qisqa javob ===== */
        // ---------- 2) Tushunilmagan savol ----------
        var AI_NOT_UNDERSTOOD = "Savolingizni tushunmadim, savolni aniqroq bering.";
        aiClarify = function () { return AI_NOT_UNDERSTOOD; };
        aiHint = function () {};
        // ---------- 3) Ism bilan murojaat ----------
        // Ism + otasining ismi (hurmat shakli): "Abdurauf o'g'li" -> "Abduraufovich", "Karim qizi" -> "Karimovna"
        function uzCap(w) { return w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''; }
        function patronym(father, fem) {
            let f = uzCap(String(father).replace(/[ʻʼ`’‘]/g, "'"));
            if (/(ovich|evich|yevich|ovna|evna|yevna|ич|вна)$/i.test(f)) return f;
            const vowel = /[aeiouаеёиоуыэюя]$/i.test(f);
            return f + (fem ? (vowel ? 'yevna' : 'ovna') : (vowel ? 'yevich' : 'ovich'));
        }
        function userAddress() {
            try { const t = currentUser && currentUser.tabel; const c = t && localStorage.getItem('agmk_addr_' + cleanTabel(t)); if (c) return c; } catch (e) {}
            let n = ''; try { n = (currentUser && currentUser.name && currentUser.name !== 'Mehmon') ? String(currentUser.name).trim() : ''; } catch (e) {}
            if (!n || /^[A-ZА-Я][a-zа-я]?\.\s*/.test(n)) return '';
            const w = n.replace(/[ʻʼ`’‘]/g, "'").split(/\s+/);
            if (w.length < 2) return '';
            const first = uzCap(w[1]); let pat = '';
            if (w.length >= 4 && /^(o'g'li|o'gli|og'li|ogli|угли|ўғли)$/i.test(w[3])) pat = patronym(w[2], false);
            else if (w.length >= 4 && /^(qizi|кизи|қизи)$/i.test(w[3])) pat = patronym(w[2], true);
            else if (w.length >= 3 && /(ovich|evich|ovna|evna|ич|вна)$/i.test(w[2])) pat = uzCap(w[2]);
            return first + (pat ? ' ' + pat : '');
        }
        function labbayText() { const f = userAddress(); return f ? 'Labbay, ' + f + '!' : 'Labbay!'; }
        async function addrEdit() {
            const t = currentUser && currentUser.tabel; if (!t) return;
            const v = await uiPrompt("🗣 AI sizga qanday murojaat qilsin? (masalan: Azizbek Abduraufovich)", userAddress()); if (v === null) return;
            try { if (v.trim()) localStorage.setItem('agmk_addr_' + cleanTabel(t), v.trim()); else localStorage.removeItem('agmk_addr_' + cleanTabel(t)); } catch (e) {}
            showToast('✅ Saqlandi: ' + labbayText()); try { renderProfile(); } catch (e) {}
        }
        (function () { renderProfile = agmkExtend('renderProfile', '31-bosqich (1-3): "Salom, Ey AI" (signalsiz), "Labbay, Azizbek", qisqa javob', renderProfile, o => function () { const r = o.apply(this, arguments); try { const cards = document.querySelectorAll('#profBody .pf-card'); const c = cards[cards.length - 1]; if (c && !$id('pfAddr')) { const d = document.createElement('div'); d.className = 'pf-link'; d.id = 'pfAddr'; d.innerHTML = '🗣 AI murojaati: <b style="margin-left:4px">' + escapeHtml(labbayText()) + '</b><i>✏️</i>'; d.onclick = addrEdit; c.appendChild(d); } } catch (e) {} return r; }); })();
        function aicLabbay() { const e = $id('aicEmpty'); if (e) e.innerHTML = `<b>${escapeHtml(labbayText())}</b><span>Gapiring yoki yozing.</span>`; }
        var AI_GREET_BUSY = false;
        function aiGreetAndListen() {
            aicLabbay();
            if (AI_GREET_BUSY) return; AI_GREET_BUSY = true;
            const t = labbayText();
            const go = () => { AI_GREET_BUSY = false; const m = $id('aiChatModal'); if (!m || m.classList.contains('hidden')) return; try { if (!(typeof AILIVE !== 'undefined' && AILIVE.on)) startAiVoiceInput(); } catch (e) {} };
            try { if (!aiVoiceOutputEnabled) { go(); return; } aisMode && aisMode('speak'); speakAiText(t, () => { try { aisMode('idle'); } catch (e) {} setTimeout(go, 150); }); } catch (e) { go(); }
        }
        (function () {
            aiGlobalOpen = agmkExtend('aiGlobalOpen', '31-bosqich (1-3): "Salom, Ey AI" (signalsiz), "Labbay, Azizbek", qisqa javob', aiGlobalOpen, o => function () {
                const wasOpen = $id('aiChatModal') && !$id('aiChatModal').classList.contains('hidden');
                const r = o.apply(this, arguments);
                if (!wasOpen && !aiGlobalOpen._silent) setTimeout(aiGreetAndListen, 250);
                aiGlobalOpen._silent = false;
                return r;
            });
        })();
        (function () { aicState = agmkExtend('aicState', '31-bosqich (1-3): "Salom, Ey AI" (signalsiz), "Labbay, Azizbek", qisqa javob', aicState, o => function () { const r = o.apply(this, arguments); aicLabbay(); return r; }); })();

        // ---------- 1) Kalit so'z: "Salom, Ey AI" ----------
        // Brauzer (APK'siz) varianti uchun ibora
        WAKE_RE = /(?:^|[\s,.!?])(?:salom|салом|assalom\w*|ассалом\w*)[\s,.!-]*(?:ey|эй|ей|hey|хей|hay|xey|e)[\s,-]*(?:ai|ay|ай|аи|a\.?i\.?)(?=$|[\s,.!?])/i;
        var KWS = { native: !!(window.AgmkNative && AgmkNative.kwsSet), has: false, en: false, testing: false, enroll: null, lastLvl: -60, noise: -60 };
        function kwsHasModel() { try { return KWS.native && AgmkNative.kwsHas(); } catch (e) { return false; } }
        if (KWS.native) {
            // eski SpeechRecognizer asosidagi tsikl o'chiriladi — endi jim tinglovchi ishlaydi
            wakeLoop = function () { document.body.classList.toggle('wake-on', KWS.en && KWS.has); };
            wakeKick = function () {}; wakeHalt = function () {};
            wakeSupported = function () { return true; };
            wakeSet = function (on) { try { localStorage.setItem('agmk_wake', on ? '1' : '0'); } catch (e) {} KWS.en = on; WAKE.en = false; KWS.has = kwsHasModel(); try { AgmkNative.kwsSet(on && KWS.has); } catch (e) {} wakeUi(); };
            wakeUi = function () {
                KWS.has = kwsHasModel();
                const sub = $id('set-wake-sub'); if (sub) sub.textContent = !KWS.has ? "O'rgatilmagan — ovozingizni o'rgating" : KWS.en ? "Yoqilgan — «Salom, Ey AI» deng" : "O'chirilgan";
                const b = $id('set-wake-tg'); if (b) b.classList.toggle('on', KWS.en && KWS.has);
            };
            WAKE.en = false;
        }
        window.__agmkKws = function (type, d) {
            d = d || {};
            if (type === 'wake') return kwsWake(d);
            if (type === 'state') { document.body.classList.toggle('wake-on', d.v === 'on' && KWS.en && !KWS.testing); return; }
            if (type === 'level') { KWS.lastLvl = d.db; KWS.noise = d.noise; kwsMeter(); return; }
            if (type === 'score') return kwsTestScore(d);
            if (type === 'enroll') return kwsEnrollEv(d);
            if (type === 'check') return kwsCheckEv(d);
            if (type === 'error') { showToast("🎙 Mikrofonni ochib bo'lmadi — ruxsatni tekshiring"); return; }
        };
        function kwsWake() {
            if (document.body.classList.contains('locked') || document.hidden) return;
            try { wakeBeep(); } catch (e) {}
            if (typeof W !== 'undefined' && W.on && $id('screen-nd') && $id('screen-nd').classList.contains('active')) { W.voice = true; wSay(labbayText()); return; }
            const m = $id('aiChatModal');
            if (m && !m.classList.contains('hidden')) { aiGreetAndListen(); return; }
            try { aiGlobalOpen(); } catch (e) {}
        }
        // getUserMedia (masalan, zamechaniya ovozi) ishlaganda tinglovchi to'xtab turadi
        (function () {
            if (!KWS.native || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
            const og = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
            navigator.mediaDevices.getUserMedia = function (c) {
                const audio = c && c.audio; if (audio) try { AgmkNative.kwsPause(true); } catch (e) {}
                return og(c).then(s => { if (audio) { let left = s.getAudioTracks().length; s.getAudioTracks().forEach(t => { const st = t.stop.bind(t); t.stop = function () { st(); if (--left === 0) try { AgmkNative.kwsPause(false); } catch (e) {} }; }); } return s; }, err => { if (audio) try { AgmkNative.kwsPause(false); } catch (e) {} throw err; });
            };
        })();
        // ---------- Sozlamalar oynasi ----------
        function kwsOpen() {
            if (!KWS.native) { alert("🎙 «Salom, Ey AI» signalsiz tinglovchisi APK ilovada ishlaydi.\n\nBrauzerda fayl ko'rinishida ochilganda telefon mikrofonni doimiy bermaydi."); return; }
            let m = $id('kwsModal');
            if (!m) { m = document.createElement('div'); m.id = 'kwsModal'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) kwsClose(); }; m.innerHTML = '<div class="pk-box" id="kwsBox"></div>'; document.body.appendChild(m); }
            KWS.has = kwsHasModel(); kwsRender(); m.classList.remove('hidden');
        }
        function kwsClose() { const m = $id('kwsModal'); if (m) m.classList.add('hidden'); if (KWS.testing) kwsTestSet(false); if (KWS.enroll) { try { AgmkNative.kwsEnroll('cancel'); } catch (e) {} KWS.enroll = null; } wakeUi(); }
        function kwsRender() {
            const sens = (() => { try { return AgmkNative.kwsGetSens(); } catch (e) { return 3; } })();
            let st = {}; try { st = JSON.parse(AgmkNative.kwsStats()); } catch (e) {}
            const E = KWS.enroll;
            let h = `<div class="pk-h"><b>🎙 Ovoz bilan chaqirish</b><span onclick="kwsClose()">✕</span></div>`;
            if (E) {
                h += `<div class="kws-en"><div class="kws-step">${E.n < E.need ? (E.n + 1) + '-yozuv / ' + E.need : 'Tekshirilmoqda...'}</div>
                    <div class="kws-say">«Salom, Ey AI»</div><div class="kws-hint">${escapeHtml(E.msg || "Odatdagidek, bir xil ohangda ayting.")}</div>
                    <div class="kws-meter"><i id="kwsLvl"></i></div>
                    <div class="kws-dots">${Array.from({ length: E.need }, (_, i) => `<b class="${i < E.n ? 'ok' : ''}"></b>`).join('')}</div>
                    <div class="pk-btns"><button onclick="kwsEnrollStop()">Bekor qilish</button>${E.n ? '<button onclick="kwsEnrollUndo()">↩️ Oxirgisini qayta</button>' : ''}</div></div>`;
            } else {
                h += `<div class="kws-row"><div><b>«Salom, Ey AI»</b><small>${KWS.has ? (KWS.en ? '🟢 Tinglamoqda (ilova ochiq paytda)' : "⚪ O'chirilgan") : "Hali o'rgatilmagan"}</small></div><span class="wk-tg ${KWS.en && KWS.has ? 'on' : ''}" onclick="${KWS.has ? "wakeSet(!KWS.en); kwsRender()" : 'kwsEnrollStart()'}"><i></i></span></div>
                    <button class="action-btn kws-train" onclick="kwsEnrollStart()">🎓 ${KWS.has ? "Ovozimni qayta o'rgatish" : "Ovozimni o'rgatish (≈20 soniya)"}</button>
                    <div class="pp-lbl">SEZGIRLIK</div>
                    <div class="kws-sens">${[1, 2, 3, 4, 5].map(i => `<i class="${sens === i ? 'on' : ''}" onclick="try{AgmkNative.kwsSens(${i})}catch(e){} kwsRender()">${i}</i>`).join('')}</div>
                    <div class="kws-sl"><span>1 — faqat aniq talaffuz</span><span>5 — eng sezgir</span></div>
                    ${KWS.has ? `<div class="pp-lbl">SINOV</div><button class="mini-btn kws-tbtn ${KWS.testing ? 'on' : ''}" onclick="kwsTestSet(!KWS.testing)">${KWS.testing ? '⏹ Sinovni to\'xtatish' : "▶️ Sinov rejimi — «Salom, Ey AI» deng"}</button>
                    <div class="kws-test ${KWS.testing ? '' : 'hidden'}"><div class="kws-meter"><i id="kwsLvl"></i></div><div class="kws-bar"><i id="kwsScore"></i><u></u></div><div class="kws-res" id="kwsRes">Gapiring...</div><small>Chiziq — tanish chegarasi. Ustun chiziqdan o'tsa, AI ishga tushadi.</small></div>` : ''}
                    <div class="kws-note">🔇 Tinglash signalsiz: mikrofon telefon ichida jimgina tinglanadi, ovoz hech qayerga yuborilmaydi. Faqat ibora eshitilganda qisqa ovoz chalinadi. Shovqinli joyda sezgirlik avtomatik biroz oshadi.</div>
                    ${KWS.has ? `<div class="kws-st">Oxirgi 7 kun: tanidi <b>${st.hit || 0}</b> · deyarli tanidi <b>${st.near || 0}</b> · noto'g'ri ishga tushdi <b>${st.false || 0}</b></div>
                    <div class="pk-btns"><button onclick="try{AgmkNative.kwsFalse()}catch(e){} showToast('Qayd etildi — sezgirlikni pasaytirishni tavsiya qilamiz'); kwsRender()">⚠️ Noto'g'ri ishga tushdi</button><button onclick="kwsForget()">🗑 Namunani o'chirish</button></div>` : ''}`;
            }
            $id('kwsBox').innerHTML = h;
        }
        async function kwsForget() { if (!await uiConfirm("Ovoz namunasi o'chirilsinmi? «Salom, Ey AI» qayta o'rgatilmaguncha ishlamaydi.")) return; try { AgmkNative.kwsClear(); AgmkNative.kwsSet(false); } catch (e) {} kwsRender(); wakeUi(); }
        function kwsMeter() { const el = $id('kwsLvl'); if (!el) return; const p = Math.max(0, Math.min(100, (KWS.lastLvl - KWS.noise) * 3.5)); el.style.width = p + '%'; el.style.background = KWS.lastLvl > KWS.noise + 7 ? '#22c55e' : '#475569'; }
        function kwsTestSet(on) { KWS.testing = on; try { AgmkNative.kwsTest(on); } catch (e) {} kwsRender(); }
        function kwsTestScore(d) {
            const b = $id('kwsScore'), r = $id('kwsRes'); if (!b || !r) return;
            b.style.width = d.score + '%'; b.style.background = d.match ? '#22c55e' : d.near ? '#f59e0b' : '#ef4444';
            r.innerHTML = d.match ? `✅ Tanidi — moslik ${d.score}%` : d.near ? `🟡 Deyarli — ${d.score}% (keyingi aytishda sezgirroq tinglanadi)` : `❌ Tanimadi — ${d.score}%`;
        }
        // ---------- O'rgatish ----------
        function kwsEnrollStart() {
            if (!KWS.native) return kwsOpen();
            if (KWS.testing) kwsTestSet(false);
            KWS.enroll = { n: 0, need: 3, msg: '' };
            try { AgmkNative.kwsEnroll('begin'); } catch (e) {}
            if (!$id('kwsModal') || $id('kwsModal').classList.contains('hidden')) kwsOpen(); else kwsRender();
        }
        function kwsEnrollStop() { try { AgmkNative.kwsEnroll('cancel'); } catch (e) {} KWS.enroll = null; kwsRender(); }
        function kwsEnrollUndo() { try { AgmkNative.kwsEnroll('undo'); } catch (e) {} if (KWS.enroll) { KWS.enroll.n = Math.max(0, KWS.enroll.n - 1); KWS.enroll.msg = 'Oxirgisini qaytadan ayting.'; } kwsRender(); }
        function kwsEnrollEv(d) {
            const E = KWS.enroll; if (!E) return;
            if (!d.ok) { E.msg = d.why === 'quiet' ? "Ovoz fon shovqinidan past eshitildi — telefonni og'zingizga yaqinroq tuting va aniqroq ayting." : d.why === 'short' ? "Juda qisqa eshitildi — «Salom, Ey AI»ni to'liq, bir nafasda ayting." : 'Qaytadan ayting.'; kwsRender(); return; }
            E.n = d.n; E.msg = E.n < E.need ? 'Yaxshi! Yana bir marta ayting.' : '';
            try { navigator.vibrate && navigator.vibrate(30); } catch (e) {}
            kwsRender();
            if (E.n >= E.need) try { AgmkNative.kwsEnroll('check'); } catch (e) {}
        }
        function kwsCheckEv(r) {
            const E = KWS.enroll; if (!E) return;
            if (r.saved) { KWS.enroll = null; KWS.has = true; wakeSet(true); showToast("✅ Ovozingiz o'rgatildi — «Salom, Ey AI» deng"); kwsRender(); setTimeout(() => kwsTestSet(true), 400); return; }
            if (r.ok && r.firstTry) { try { AgmkNative.kwsEnroll('save'); } catch (e) {} return; }
            if (E.need < 5) { E.need++; E.msg = r.ok ? "Aniqlikni oshirish uchun yana bir marta ayting." : "Yozuvlar bir-biridan farq qildi — yana bir marta xuddi shunday ayting."; kwsRender(); return; }
            try { AgmkNative.kwsEnroll('save'); } catch (e) {}
            setTimeout(() => { if (KWS.enroll) { KWS.enroll = { n: 0, need: 3, msg: "Yozuvlar juda farq qildi. Tinchroq joyda qaytadan boshlaylik." }; try { AgmkNative.kwsEnroll('begin'); } catch (e) {} kwsRender(); } }, 600);
        }
        // Parametrlardagi kartani yangi oynaga ulash
        (function () {
            const card = $id('set-wake-sub') && $id('set-wake-sub').closest('.btn-card');
            if (card) { card.onclick = e => { if (e.target.closest('.wk-tg') && KWS.native && KWS.has) { wakeSet(!KWS.en); showToast(KWS.en ? "🎙 «Salom, Ey AI» yoqildi" : "🎙 O'chirildi"); return; } kwsOpen(); }; const t = card.querySelector('.btn-text'); if (t && t.firstChild) t.firstChild.textContent = 'Ovoz bilan chaqirish («Salom, Ey AI»)'; }
            if (KWS.native) { KWS.en = (() => { try { const v = localStorage.getItem('agmk_wake'); return v === null ? true : v === '1'; } catch (e) { return true; } })(); KWS.has = kwsHasModel(); try { AgmkNative.kwsSet(KWS.en && KWS.has); } catch (e) {} wakeUi(); }
        })();
        // Brauzer varianti: ibora bilan birga buyruq aytilsa — salomlashmasdan darhol bajariladi
        wakeFire = function (text) {
            const m = (' ' + text + ' ').split(WAKE_RE), cmd = (m.length > 1 ? m.slice(1).join(' ') : '').replace(/^[\s,.!?-]+/, '').trim();
            document.body.classList.remove('wake-on'); try { wakeBeep(); } catch (e) {}
            if (typeof W !== 'undefined' && W.on && $id('screen-nd').classList.contains('active')) { W.voice = true; if (cmd) wUser(cmd); else wSay(labbayText()); return; }
            if (!cmd || cmd.length < 3) { const mm = $id('aiChatModal'); if (mm && !mm.classList.contains('hidden')) aiGreetAndListen(); else aiGlobalOpen(); return; }
            aiGlobalOpen._silent = true; try { if ($id('aiChatModal').classList.contains('hidden')) aiGlobalOpen(); } catch (e) {}
            setTimeout(() => { aiSendText(cmd).then(ans => { try { aisMode('speak'); speakAiText(ans, () => aisMode('idle')); } catch (e) {} }); }, 450);
        };

