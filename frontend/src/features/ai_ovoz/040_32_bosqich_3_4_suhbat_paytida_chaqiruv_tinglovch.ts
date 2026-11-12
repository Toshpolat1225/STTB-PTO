        /* ===== 32-bosqich (3, 4): Suhbat paytida chaqiruv tinglovchisi dam oladi; gap tugagach 3 soniya kutish ===== */
        // ---------- 4) Sabrli tinglash: pauzadan keyin gap davom etsa — bitta so'rovga qo'shiladi ----------
        var VPAUSE = { ms: 4000, act: null }; // v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darhol)
        try { const v = parseInt(localStorage.getItem('agmk_voice_pause') || '', 10); if (v >= 1000 && v <= 6000) VPAUSE.ms = v; } catch (e) {}
        var VP_JUNK = /^(e|ey|eй|эй|ей|a|а|ai|ay|ай|аи|ha|xa|ha ha|hm|hmm|mm|ым|э|m|ah|oh|o|u|i|и|y)$/i;
        var VP_END_ALL = /[\s,.;!]*(tamom|tamam|тамом|тамам)[.!]*$/i;
        var VP_END_SOLO = /^(bo.?ldi|boldi|бўлди|болди|вс[её]|хватит|конец|tamom|tamam)[.!]*$/i;
        (function () {
            const Base = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!Base || Base.__patient) return;
            function PSR() {
                this._t = document.createElement('span');
                this.lang = 'uz-UZ'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1;
                this.onresult = this.onerror = this.onend = this.onstart = this.onaudiostart = this.onaudioend = this.onspeechstart = this.onspeechend = this.onsoundstart = this.onsoundend = this.onnomatch = null;
                this._on = false;
            }
            PSR.__patient = true; Base.__patient = true;
            PSR.prototype.addEventListener = function (a, b, c) { this._t.addEventListener(a, b, c); };
            PSR.prototype.removeEventListener = function (a, b, c) { this._t.removeEventListener(a, b, c); };
            PSR.prototype.dispatchEvent = function (e) { return this._t.dispatchEvent(e); };
            PSR.prototype._fire = function (type, props) {
                let e; try { e = new Event(type); } catch (x) { e = document.createEvent('Event'); e.initEvent(type, false, false); }
                if (props) for (const k in props) { try { Object.defineProperty(e, k, { value: props[k], configurable: true }); } catch (x) {} }
                try { if (typeof this['on' + type] === 'function') this['on' + type].call(this, e); } catch (x) { console.error(x); }
                try { this._t.dispatchEvent(e); } catch (x) {}
            };
            PSR.prototype._res = function (text, fin) {
                const alt = { transcript: text, confidence: 0.9 }, r = [alt]; r.isFinal = !!fin; r.item = i => r[i]; r.length = 1;
                const l = [r]; l.item = i => l[i];
                this._fire('result', { results: l, resultIndex: 0 });
            };
            PSR.prototype._mk = function (quiet) {
                const r = new Base(), me = this;
                r.lang = this.lang; r.interimResults = true; r.continuous = false; r.maxAlternatives = this.maxAlternatives || 1;
                ['_ndLang', '_wiz'].forEach(k => { if (this[k] !== undefined) r[k] = this[k]; });
                r._inner = true; if (quiet) r._quiet = true;
                let cur = '', fin = '';
                r._st0 = Date.now();
                r.onstart = () => { if (!me._started) { me._started = true; me._fire('start'); me._fire('audiostart'); try { if (!me._wake && typeof micOvShow === 'function') micOvShow(me); } catch (x) {} } };
                r.onspeechstart = () => { if (me._timer && !r._ext) { r._ext = true; const left = Math.max(me._deadline - Date.now(), 1800); clearTimeout(me._timer); me._deadline = Date.now() + left; me._timer = setTimeout(() => { me._timer = null; me._final(); }, left); } me._fire('speechstart'); try { MOV.speak = true; MOV.last = Date.now(); MOV.tgt = 0.6; } catch (x) {} };
                r.onspeechend = () => { me._se = Date.now(); try { MOV.speak = false; MOV.tgt = 0.04; } catch (x) {} };
                r.onresult = e => {
                    let t = '', f = true; for (let i = 0; i < e.results.length; i++) { t += e.results[i][0].transcript; if (!e.results[i].isFinal) f = false; }
                    cur = t; if (f) fin = t; me._lr = Date.now(); if (t.trim() && !VP_JUNK.test(dbN(t))) me._heard();
                    const all = me._join(cur);
                    if (me.interimResults) me._res(all, false);
                    try { if (MOV.rec === me && all) $id('micOvTxt').innerText = all; MOV.speak = true; MOV.last = Date.now(); } catch (x) {}
                };
                r.onerror = e => { me._err = e.error; };
                r.onend = () => { if (me._r !== r) return; me._r = null; me._chunk((fin || cur).trim()); };
                return r;
            };
            PSR.prototype._join = function (extra) { const p = this._acc.slice(); if (extra && extra.trim()) p.push(extra.trim()); return p.join(' ').replace(/\s+/g, ' ').trim(); };
            PSR.prototype._heard = function () { if (this._timer) { clearTimeout(this._timer); this._timer = null; this._fresh = true; } vpPill(null); };
            PSR.prototype._chunk = function (t) {
                if (!this._on) return;
                const err = this._err; this._err = null;
                const junk = !!(t && VP_JUNK.test(dbN(t))); if (junk) t = '';
                if (t) {
                    if (VP_END_SOLO.test(t.trim()) && this._acc.length) return this._final();
                    const e = t.match(VP_END_ALL); if (e) { const s = t.slice(0, e.index).trim(); if (s) this._acc.push(s); return this._final(); }
                    this._acc.push(t); this._fresh = true;
                }
                if (this._stopReq) return this._final();
                if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'language-not-supported') { if (this._acc.length) return this._final(); this._fire('error', { error: err, message: err }); return this._end(); }
                if (!this._acc.length) {
                    // hali hech narsa aytilmadi: "ey" kabi qoldiq yoki mikrofon bir lahza band bo'lsa — bir marta jim qayta tinglaydi
                    if ((junk || (err && err !== 'no-speech')) && this._empty++ < 1 && Date.now() - this._t0 < 9000) return this._again(true);
                    if (err && err !== 'no-speech' && err !== 'aborted') this._fire('error', { error: err, message: err });
                    return this._end();
                }
                if (++this._n > 30 || Date.now() - this._t0 > 90000) return this._final();
                // gap to'xtadi — VPAUSE.ms kutamiz; shu orada yana gapirsa, gap davom etadi
                if (this._fresh || !this._timer) {
                    this._fresh = false;
                    if (this._timer) clearTimeout(this._timer);
                    const ref = Math.max(this._se || 0, this._lr || 0), st = this._lastInnerStart || 0;
                    const left = ref >= st ? Math.max(400, Math.min(VPAUSE.ms, VPAUSE.ms - (Date.now() - ref))) : VPAUSE.ms; this._deadline = Date.now() + left;
                    vpPill(this, left);
                    this._timer = setTimeout(() => { this._timer = null; this._final(); }, left);
                }
                if (this._deadline - Date.now() > 500) this._again(true);
            };
            PSR.prototype._again = function (quiet) {
                if (!this._on || this._stopReq) return;
                const r = this._mk(quiet); this._r = r; this._lastInnerStart = Date.now();
                setTimeout(() => { if (this._r !== r || !this._on) return; try { r.start(); } catch (x) { this._r = null; if (this._acc.length) this._final(); else this._end(); } }, 120);
            };
            PSR.prototype._final = function () {
                if (!this._on) return;
                if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                const r = this._r; this._r = null; if (r) { try { r.abort(); } catch (x) {} }
                const text = this._join('');
                vpPill(null);
                if (text) this._res(text, true);
                this._end();
            };
            PSR.prototype._end = function () {
                if (!this._on) return; this._on = false; vpPill(null);
                if (this._timer) { clearTimeout(this._timer); this._timer = null; }
                const r = this._r; this._r = null; if (r) { try { r.abort(); } catch (x) {} }
                if (VPAUSE.act === this) VPAUSE.act = null;
                this._fire('speechend'); this._fire('audioend'); this._fire('end');
                try { if (MOV.rec === this) setTimeout(micOvHide, 300); } catch (x) {}
                kwsHoldCheck();
            };
            PSR.prototype.start = function () {
                if (this._on) throw new Error('InvalidStateError: already started');
                if (this.continuous || this._wake) {               // doimiy tinglash / chaqiruv — o'zgarishsiz
                    const r = new Base(), me = this; ['_ndLang', '_wiz', '_wake'].forEach(k => { if (this[k] !== undefined) r[k] = this[k]; });
                    ['result', 'error', 'end', 'start', 'audiostart', 'audioend', 'speechstart', 'speechend', 'soundstart', 'soundend', 'nomatch'].forEach(ev => { r['on' + ev] = e => { if (ev === 'end') { me._on = false; me._p = null; } me._fire(ev, { results: e.results, resultIndex: e.resultIndex, error: e.error, message: e.message }); }; });
                    this._p = r; this._on = true; r.lang = this.lang; r.interimResults = this.interimResults; r.continuous = this.continuous; return r.start();
                }
                if (VPAUSE.act && VPAUSE.act !== this) { try { VPAUSE.act.abort(); } catch (x) {} }
                VPAUSE.act = this; this._on = true; this._acc = []; this._stopReq = false; this._started = false; this._empty = 0; this._n = 0; this._fresh = false; this._t0 = Date.now(); this._err = null;
                window.__lastVoiceAt = Date.now();
                kwsHoldCheck();
                const r = this._mk(false); this._r = r; this._lastInnerStart = Date.now(); this._se = this._lr = 0;
                try { r.start(); } catch (x) { this._r = null; this._on = false; VPAUSE.act = null; throw x; }
            };
            PSR.prototype.stop = function () {
                if (this._p) { try { this._p.stop(); } catch (x) {} return; }
                if (!this._on) return; this._stopReq = true;
                if (this._r) { try { this._r.stop(); } catch (x) { this._final(); } } else this._final();
            };
            PSR.prototype.abort = function () {
                if (this._p) { try { this._p.abort(); } catch (x) {} return; }
                if (!this._on) return; this._acc = []; this._end();
            };
            window.SpeechRecognition = PSR; window.webkitSpeechRecognition = PSR;
        })();
        (function () { if (typeof wakeKick !== 'function') return; wakeKick = agmkExtend('wakeKick', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho', wakeKick, o => function () { if (VPAUSE.act) return; return o.apply(this, arguments); }); })();
        // Ichki (qayta ochilgan) tinglashlar: ekranda alohida oyna ochilmaydi, signal chalinmaydi
        (function () { micOvShow = agmkExtend('micOvShow', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho · Ichki (qayta ochilgan) tinglashlar: ekranda alohida oyna ochilmaydi, signal chal', micOvShow, o => function (rec) { if (rec && rec._inner) return; return o.apply(this, arguments); }); })();
        // Kutish ko'rsatkichi: "Davom eting…" va qisqaruvchi chiziq
        function vpPill(rec, ms) {
            let p = $id('vpPill');
            if (!rec) { if (p) p.classList.add('hidden'); return; }
            if (!p) { p = document.createElement('div'); p.id = 'vpPill'; p.className = 'vp-pill hidden'; p.innerHTML = '<b>⏳ Tinglayapman… davom eting</b><small>yoki «tamom» deng</small><i><u></u></i>'; p.onclick = () => { try { VPAUSE.act && VPAUSE.act._final(); } catch (e) {} }; document.body.appendChild(p); }
            const u = p.querySelector('u'); u.style.transition = 'none'; u.style.width = '100%';
            p.classList.remove('hidden');
            requestAnimationFrame(() => requestAnimationFrame(() => { u.style.transition = 'width ' + ms + 'ms linear'; u.style.width = '0%'; }));
            try { if (MOV.rec === rec) $id('micOvTxt').innerText = rec._join('') + ' …'; } catch (e) {}
        }
        // Sozlamalar: kutish vaqti 1–5 soniya
        function vpSet(ms) { VPAUSE.ms = ms; try { localStorage.setItem('agmk_voice_pause', String(ms)); } catch (e) {} vpNative(); vpUi(); }
        function vpNative() { try { if (window.AgmkNative && AgmkNative.srSilence) AgmkNative.srSilence(VPAUSE.ms); } catch (e) {} }
        vpNative();
        function vpUi() { const s = $id('set-vp-sub'); if (s) s.textContent = (VPAUSE.ms / 1000) + " soniya — gapdan keyin shuncha jim tursangiz, so'rov bajariladi"; }
        (function () {
            const wk = $id('set-wake-sub') && $id('set-wake-sub').closest('.btn-card');
            if (!wk || $id('set-vp-sub')) return;
            const d = document.createElement('div'); d.className = 'btn-card';
            d.onclick = () => { const n = VPAUSE.ms >= 6000 ? 1000 : VPAUSE.ms + 1000; vpSet(n); showToast('⏳ Kutish: ' + (n / 1000) + ' soniya'); };
            d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">⏳</span><span class="btn-text">Ovozli so'rovdan keyin kutish<span class="set-sub" id="set-vp-sub"></span></span></div><span class="btn-arrow">›</span>`;
            wk.after(d); vpUi();
        })();

        // ---------- 3) AI bilan suhbat paytida "Salom, Ey AI" tinglovchisi to'liq dam oladi ----------
        var KWSH = { held: false };
        function kwsHoldWant() {
            try {
                const m = $id('aiChatModal'); if (m && !m.classList.contains('hidden')) return true;
                if (typeof W !== 'undefined' && W.on && $id('screen-nd') && $id('screen-nd').classList.contains('active')) return true;
                if (VPAUSE.act) return true;
                if (window.speechSynthesis && speechSynthesis.speaking) return true;
                const o = $id('micOv'); if (o && !o.classList.contains('hidden')) return true;
                if (typeof AILIVE !== 'undefined' && AILIVE.on) return true;
            } catch (e) {}
            return false;
        }
        function kwsHoldCheck() {
            if (!(window.AgmkNative && AgmkNative.kwsPause)) return;
            const w = kwsHoldWant();
            if (w === KWSH.held) return;
            KWSH.held = w; try { AgmkNative.kwsPause(w); } catch (e) {}
            document.body.classList.toggle('wake-rest', w);
        }
        if (window.AgmkNative && AgmkNative.kwsPause) {
            setInterval(kwsHoldCheck, 400);
            try { const m = $id('aiChatModal'); if (m) new MutationObserver(kwsHoldCheck).observe(m, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
            // Chaqiruv so'zi suhbat oynasi ochiq paytda kelib qolsa — e'tiborsiz
            kwsWake = agmkExtend('kwsWake', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho · Chaqiruv soʼzi suhbat oynasi ochiq paytda kelib qolsa — eʼtiborsiz', kwsWake, ow => function () { const m = $id('aiChatModal'); if ((m && !m.classList.contains('hidden')) || VPAUSE.act) return; return ow.apply(this, arguments); });
        }
        // "Labbay"dan keyin mikrofon ovoz tugagach biroz kutib ochiladi (ovoz aks-sadosi yozilib qolmasin)
        (function () {
            aiGreetAndListen = agmkExtend('aiGreetAndListen', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho · "Labbay"dan keyin mikrofon ovoz tugagach biroz kutib ochiladi (ovoz aks-sadosi y', aiGreetAndListen, o => function () { kwsHoldCheck(); return o.apply(this, arguments); });
            startAiVoiceInput = agmkExtend('startAiVoiceInput', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho', startAiVoiceInput, s => function () { const a = arguments, me = this; kwsHoldCheck(); setTimeout(() => s.apply(me, a), (window.AgmkNative && KWSH.held) ? 350 : 0); });
        })();
        // Ilovada (APK) bir martalik mikrofon xatosi mikrofonni butunlay o'chirib qo'ymaydi
        if (window.AGMK_APK || window.AgmkNative) {
            try { sessionStorage.removeItem('agmk_mic_blocked'); } catch (e) {}
            try { micBlocked = false; } catch (e) {}
            voiceErrorHelp = agmkExtend('voiceErrorHelp', 'v3.0: uzun buyruqlar uchun standart 4 soniya (1–6 soniya sozlanadi; «tamom» desangiz darho', voiceErrorHelp, ov => function (err, inputId) {
                if (err === 'not-allowed' || err === 'service-not-allowed') return ov.apply(this, arguments);
                if (err === 'network') { showToast("🎤 Ovozni tanish uchun internet kerak — ulanishni tekshiring"); return; }
                if (err === 'language-not-supported') { showToast("🎤 Telefonda o'zbek tilida ovozni tanish yo'q — Google ilovasini yangilang"); return; }
                showToast("🎤 Mikrofon band edi — yana bir bor bosing"); return;
            });
        }
