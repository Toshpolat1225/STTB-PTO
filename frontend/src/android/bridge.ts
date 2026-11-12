
/* ===== AGMK-STTB PTO — Android ilova ko'prigi (faqat APK ichida ishlaydi) ===== */
(function () {
    var N = window.AgmkNative; if (!N) return;
    window.AGMK_APK = true;
    function q(s) { return JSON.stringify(s == null ? '' : String(s)); }

    /* ---------- 1) Ovozni tanish (SpeechRecognition) — Android SpeechRecognizer orqali ---------- */
    var REC = { cur: null, seq: 0, map: {} };
    function mkEv(type, props) { var e; try { e = new Event(type); } catch (x) { e = document.createEvent('Event'); e.initEvent(type, false, false); } if (props) for (var k in props) { try { Object.defineProperty(e, k, { value: props[k], configurable: true }); } catch (x) { e[k] = props[k]; } } return e; }
    function NSR() {
        var t = document.createDocumentFragment ? document.createElement('span') : {};
        this._t = t; this.lang = 'uz-UZ'; this.interimResults = false; this.continuous = false; this.maxAlternatives = 1;
        this.onresult = this.onerror = this.onend = this.onstart = this.onaudiostart = this.onaudioend = this.onspeechstart = this.onspeechend = this.onsoundstart = this.onsoundend = this.onnomatch = null;
        this._id = 0; this._on = false;
    }
    NSR.prototype.addEventListener = function (a, b, c) { this._t.addEventListener(a, b, c); };
    NSR.prototype.removeEventListener = function (a, b, c) { this._t.removeEventListener(a, b, c); };
    NSR.prototype.dispatchEvent = function (e) { return this._t.dispatchEvent(e); };
    NSR.prototype._fire = function (type, props) {
        var e = mkEv(type, props);
        try { if (typeof this['on' + type] === 'function') this['on' + type].call(this, e); } catch (x) { console.error(x); }
        try { this._t.dispatchEvent(e); } catch (x) {}
    };
    NSR.prototype.start = function () {
        if (this._on) throw new Error('InvalidStateError: already started');
        if (REC.cur && REC.cur !== this) { try { REC.cur._finish(); } catch (x) {} }
        this._on = true; this._id = ++REC.seq; REC.map[this._id] = this; REC.cur = this;
        if (N.srStartQ) N.srStartQ(this._id, String(this.lang || 'uz-UZ'), !!this.interimResults, !!this.continuous, !!(this._wake || this._quiet));
        else N.srStart(this._id, String(this.lang || 'uz-UZ'), !!this.interimResults, !!this.continuous);
    };
    NSR.prototype.stop = function () { if (this._on) N.srStop(this._id); };
    NSR.prototype.abort = function () { if (this._on) { N.srAbort(this._id); this._finish(); } };
    NSR.prototype._finish = function () { if (!this._on) return; this._on = false; delete REC.map[this._id]; if (REC.cur === this) REC.cur = null; this._fire('end'); };
    window.__agmkSR = function (id, type, a, b) {
        var r = REC.map[id]; if (!r) return;
        if (type === 'start') { r._fire('start'); r._fire('audiostart'); }
        else if (type === 'speechstart') { r._fire('soundstart'); r._fire('speechstart'); }
        else if (type === 'speechend') { r._fire('speechend'); r._fire('soundend'); }
        else if (type === 'rms') { try { if (window.agmkMicLevel) window.agmkMicLevel(a); } catch (x) {} }
        else if (type === 'result') {
            if (!b && !r.interimResults) return;
            var alt = { transcript: String(a || ''), confidence: 0.9 }, res = [alt]; res.isFinal = !!b; res.item = function (i) { return res[i]; };
            var list = [res]; list.item = function (i) { return list[i]; };
            r._fire('result', { results: list, resultIndex: 0 });
        }
        else if (type === 'error') { r._fire('error', { error: String(a || 'aborted'), message: String(a || '') }); r._finish(); }
        else if (type === 'end') { r._fire('audioend'); r._finish(); }
    };
    window.SpeechRecognition = NSR; window.webkitSpeechRecognition = NSR;

    /* ---------- 2) Ovozli o'qish (speechSynthesis) — Android TextToSpeech orqali ---------- */
    var TTS = { voices: [], q: {}, seq: 0, speaking: false, pending: 0, listeners: {} };
    function NUtt(text) { this.text = String(text == null ? '' : text); this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; this.volume = 1; this.onstart = this.onend = this.onerror = this.onboundary = this.onpause = this.onresume = null; }
    try { NUtt.prototype = Object.create(EventTarget.prototype); NUtt.prototype.constructor = NUtt; } catch (x) {}
    var synth = {
        get speaking() { return TTS.speaking || TTS.pending > 0; }, get pending() { return TTS.pending > 1; }, get paused() { return false; },
        onvoiceschanged: null,
        getVoices: function () { return TTS.voices.slice(); },
        speak: function (u) {
            var id = 'u' + (++TTS.seq); TTS.q[id] = u; TTS.pending++;
            var vn = u.voice && u.voice.name ? u.voice.name : '';
            N.ttsSpeak(id, String(u.text || ''), String(u.lang || (u.voice && u.voice.lang) || ''), vn, +u.rate || 1, +u.pitch || 1);
        },
        cancel: function () { var q = TTS.q; TTS.q = {}; TTS.pending = 0; TTS.speaking = false; N.ttsStop(); },
        pause: function () {}, resume: function () {},
        addEventListener: function (t, f) { (TTS.listeners[t] = TTS.listeners[t] || []).push(f); },
        removeEventListener: function (t, f) { var l = TTS.listeners[t] || []; var i = l.indexOf(f); if (i >= 0) l.splice(i, 1); }
    };
    window.__agmkTTS = function (id, type) {
        if (type === 'voices') {
            try { TTS.voices = JSON.parse(id).map(function (v) { return { name: v.n, lang: v.l, voiceURI: v.n, localService: !v.net, 'default': !!v.d }; }); } catch (x) { TTS.voices = []; }
            var e = mkEv('voiceschanged'); try { synth.onvoiceschanged && synth.onvoiceschanged(e); } catch (x) {}
            (TTS.listeners.voiceschanged || []).forEach(function (f) { try { f(e); } catch (x) {} });
            return;
        }
        var u = TTS.q[id]; if (!u) return;
        if (type === 'start') { TTS.speaking = true; try { u.onstart && u.onstart(mkEv('start', { utterance: u })); } catch (x) {} }
        else {
            delete TTS.q[id]; TTS.pending = Math.max(0, TTS.pending - 1); if (!TTS.pending) TTS.speaking = false;
            try { if (type === 'done') { u.onend && u.onend(mkEv('end', { utterance: u })); } else { u.onerror && u.onerror(mkEv('error', { utterance: u, error: 'synthesis-failed' })); } } catch (x) {}
        }
    };
    try { Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true, writable: true }); } catch (x) { window.speechSynthesis = synth; }
    window.SpeechSynthesisUtterance = NUtt;

    /* ---------- 3) Fayl yuklab olish (PDF, zaxira nusxa, Excel) ---------- */
    function saveUrl(href, name, open) {
        fetch(href).then(function (r) { return r.blob(); }).then(function (b) {
            var fr = new FileReader();
            fr.onload = function () { var s = String(fr.result), i = s.indexOf(','); N.saveFile(String(name || 'fayl'), b.type || 'application/octet-stream', s.slice(i + 1), !!open); };
            fr.readAsDataURL(b);
        }).catch(function () { N.toast("Faylni saqlab bo'lmadi"); });
    }
    var _click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
        var h = this.getAttribute('href') || '';
        if (this.hasAttribute('download') && /^(blob:|data:)/.test(this.href || h)) { saveUrl(this.href || h, this.getAttribute('download') || 'fayl', /\.pdf$/i.test(this.getAttribute('download') || '')); return; }
        if (/^https?:/i.test(this.href || '') && this.href.indexOf(location.origin) !== 0) { N.openExternal(this.href); return; }
        return _click.apply(this, arguments);
    };
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a) return;
        if (a.hasAttribute('download') && /^(blob:|data:)/.test(a.href)) { e.preventDefault(); saveUrl(a.href, a.getAttribute('download') || 'fayl', /\.pdf$/i.test(a.getAttribute('download') || '')); }
    }, true);
    var _open = window.open;
    window.open = function (url) {
        url = String(url || '');
        if (/^(blob:|data:)/.test(url)) { saveUrl(url, 'hujjat.pdf', true); return { closed: false, close: function () {}, focus: function () {}, document: null }; }
        if (/^(https?:|mailto:|tel:)/i.test(url) && url.indexOf(location.origin) !== 0) { N.openExternal(url); return { closed: false, close: function () {}, focus: function () {} }; }
        return _open ? _open.apply(window, arguments) : null;
    };

    /* ---------- 4) Chop etish ---------- */
    window.print = function () {
        try {
            var html, pr = document.getElementById('ndPrint');
            if (pr && document.body.classList.contains('nd-printing')) {
                var css = [].slice.call(document.querySelectorAll('style')).map(function (x) { return x.textContent; }).join('\n');
                html = '<!DOCTYPE html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + css + '</style><style>#ndPrint{display:block !important}#ndPrint .nd-page{font-family:AGMKSerif,serif !important}</style><div style="position:absolute;left:-9999px;top:0;font-family:AGMKSerif">Aa <b>Bb</b></div></head><body class="' + document.body.className + '">' + pr.outerHTML + '</body></html>';
            } else {
                var cl = document.documentElement.cloneNode(true);
                [].slice.call(cl.querySelectorAll('script')).forEach(function (x) { x.remove(); });
                html = '<!DOCTYPE html>' + cl.outerHTML;
            }
            N.print(html, document.title || 'AGMK-STTB');
        } catch (x) { N.toast("Chop etib bo'lmadi"); }
        setTimeout(function () { try { window.dispatchEvent(mkEv('afterprint')); } catch (x) {} }, 400);
    };

    /* ---------- 5) Orqaga tugmasi ---------- */
    // Bir marta (yoki sekin qayta-qayta) bosilsa — bir qadam ortga; 0,7 soniya ichida ketma-ket 3 marta bosilsa — ilovadan chiqish.
    // (2- va 3- tez bosishda «ortga» bajarilmaydi: ilova Android'ga «chiqish» deb javob beradi — Android 2 soniya ichidagi ikkinchisida yopadi)
    var BK = { t: [] };
    window.agmkBack = function () {
        try {
            var now = Date.now(); BK.t = BK.t.filter(function (x) { return now - x < 1600; }); BK.t.push(now);
            var fast = 1; for (var i = BK.t.length - 1; i > 0 && BK.t[i] - BK.t[i - 1] < 700; i--) fast++;
            if (fast >= 2) return false;
            var $ = function (id) { return document.getElementById(id); };
            if (document.body.classList.contains('locked')) return false;
            var vis = function (el) { return el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none'; };
            if (typeof UID !== 'undefined' && UID.cur && typeof uidClose === 'function') { uidClose(false); return true; }
            if (vis($('micOv')) && typeof micOvStop === 'function') { micOvStop(); return true; }
            if (typeof W !== 'undefined' && W.rec && typeof stop40All === 'function') { stop40All(); return true; } // akt ustasining ovozli yozuvi
            if (vis($('gtZoom'))) { $('gtZoom').classList.add('hidden'); return true; } // kattalashtirilgan sxema
            var s = document.querySelector('.search-wrap.srch.open'); if (s) { var x = s.querySelector('.srch-x'); if (x) { x.click(); return true; } }
            var ovs = [].slice.call(document.querySelectorAll('.modal-overlay')).filter(vis).reverse(); // teng z-index da — oxirgi ochilgani birinchi yopiladi
            if (ovs.length) {
                ovs.sort(function (a, b) { return (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0); });
                var m = ovs[0];
                if (m.id === 'aiChatModal' && typeof aicClose === 'function') { aicClose(); return true; }
                var c = m.querySelector('.close-btn, .modal-close, .pk-h span, [onclick*="classList.add(\'hidden\')"]');
                if (c) c.click(); if (vis(m)) m.classList.add('hidden'); return true;
            }
            var act = document.querySelector('.screen.active');
            if (act && act.id !== 'screen-main') {
                var b = act.querySelector('.back-btn'); if (b) { b.click(); return true; }
                if (typeof openScreen === 'function') { openScreen('screen-main'); return true; }
            }
        } catch (x) { console.error(x); }
        return false;
    };
    window.agmkNativeReady = function () { try { N.ttsVoices(); } catch (x) {} };
})();
