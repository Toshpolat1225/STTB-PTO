        /* ===== 34-bosqich (v1.8): sof o'zbekcha talaffuz, «O'qib beraymi?» (Ha / Yo'q), kalit so'zning ikki bosqichli tekshiruvi ===== */
        var V38 = { typed: false, voiceUntil: 0, lastPersonal: false, lastAnsText: '', audio: null, wakeLast: 0, ttsEnd: 0, bubble: null, bubRec: null };

        // ---------- 1) Sonlar, sanalar, vaqt — o'zbekcha so'z bilan ----------
        var UZN1 = ['nol', 'bir', 'ikki', 'uch', 'toʻrt', 'besh', 'olti', 'yetti', 'sakkiz', 'toʻqqiz'];
        var UZN10 = ['', 'oʻn', 'yigirma', 'oʻttiz', 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', 'toʻqson'];
        var UZ_MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
        function uzNum3(n) {
            const h = Math.floor(n / 100), t = Math.floor(n % 100 / 10), o = n % 10, w = [];
            if (h) w.push(h === 1 ? 'yuz' : UZN1[h] + ' yuz');
            if (t) w.push(UZN10[t]);
            if (o) w.push(UZN1[o]);
            return w.join(' ');
        }
        function uzNum(n) {
            n = Math.floor(Math.abs(+n || 0)); if (n === 0) return 'nol';
            if (n >= 1e15) return String(n).split('').map(d => UZN1[+d]).join(' ');
            const sc = [[1e12, 'trillion'], [1e9, 'milliard'], [1e6, 'million'], [1e3, 'ming']], w = [];
            for (const [v, name] of sc) { const k = Math.floor(n / v); if (k) { w.push((v === 1e3 && k === 1) ? 'ming' : uzNum3(k) + ' ' + name); n %= v; } }
            if (n) w.push(uzNum3(n));
            return w.join(' ');
        }
        function uzOrd(n) { const w = uzNum(n); return /[aeiou]$/.test(w) ? w + 'nchi' : w + 'inchi'; }
        function uzDec(intPart, frac) {
            const f = String(frac).replace(/0+$/, ''); if (!f) return uzNum(intPart);
            const den = ['', 'oʻndan', 'yuzdan', 'mingdan', 'oʻn mingdan'][f.length] || null;
            return den ? uzNum(intPart) + ' butun ' + den + ' ' + uzNum(+f) : uzNum(intPart) + ' butun ' + f.split('').map(d => UZN1[+d]).join(' ');
        }
        function uzDigits(s) {
            s = String(s).replace(/\D/g, ''); const g = [];
            let i = 0; if (s.length % 2) { g.push(s.slice(0, 3)); i = 3; }
            for (; i < s.length; i += 2) g.push(s.slice(i, i + 2));
            return g.map(x => /^0/.test(x) ? x.split('').map(d => UZN1[+d]).join(' ') : uzNum(+x)).join(', ');
        }
        function uzDate(d, m, y) {
            const mm = +m; if (!(mm >= 1 && mm <= 12) || !(+d >= 1 && +d <= 31)) return null;
            return (y ? uzOrd(+(String(y).length === 2 ? '20' + y : y)) + ' yil ' : '') + uzOrd(+d) + ' ' + UZ_MON[mm - 1];
        }
        var UZ_ABBR = { AGMK: 'a ge em ka', 'OKMK': 'o ka em ka', AJ: 'aksiyadorlik jamiyati', STTB: 'es te te be', PTO: 'pe te o', UPJT: 'u pe je te', MTTB: 'em te te be', MM: 'mehnat muhofazasi', AI: 'ey ay', GOST: 'gost', PDF: 'pe de ef', SMS: 'es em es', PIN: 'pin', KR: 'ka er', DR: 'de er', TO: 'te o', TR: 'te er', PPR: 'pe pe er', 'ПТЭ': 'pe te e', 'ТЭМ': 'te e em', 'ТГМ': 'te ge em', 'ТЭ': 'te e', 'ЧМЭ': 'che em e', 'УК': 'u ka', 'ДГКу': 'de ge ka u', 'АДМ': 'a de em', 'ЖД': 'je de', 'ОТ': 'o te', 'ТБ': 'te be', 'SI': 'es i', 'IT': 'ay ti', 'USB': 'yu es bi', 'ID': 'ay di', 'QR': 'ku ar', 'MMC': 'em em si', 'UZ': 'o\'zbekiston', 'ЕСКД': 'ye es ka de' };
        var UZ_UNIT = [[/(\d)\s*km\s*\/\s*(?:soat|ч|h)\b/gi, '$1 kilometr soatiga'], [/(\d)\s*mm\b/g, '$1 millimetr'], [/(\d)\s*sm\b/g, '$1 santimetr'], [/(\d)\s*km\b/g, '$1 kilometr'], [/(\d)\s*kg\b/g, '$1 kilogramm'], [/(\d)\s*(?:°C|°С|°)/g, '$1 daraja'], [/(\d)\s*kVt\b/g, '$1 kilovatt'], [/(\d)\s*(?:so.?m|сум)\b/gi, '$1 soʻm'], [/(\d)\s*m\b(?![a-zʻ'’])/g, '$1 metr'], [/(\d)\s*t\b(?![a-zʻ'’])/g, '$1 tonna'], [/(\d)\s*l\b(?![a-zʻ'’])/g, '$1 litr'], [/(\d)\s*(?:ta)\b/g, '$1 ta']];
        function uzSayNumbers(s) {
            s = String(s || '');
            // raqamlar orasidagi minglik bo'shliqlar: 1 250 000
            s = s.replace(/\b(\d{1,3})((?:[  ]\d{3})+)\b/g, (m, a, b) => uzNum(+(a + b.replace(/[  ]/g, ''))));
            s = s.replace(/\b(\d{6,15})(?=\s*(?:soʻm|so'm|so‘m|som|сум|ming|mln|million|ta\b|dona|kg|litr|tonna))/g, m => uzNum(+m));
            UZ_UNIT.forEach(([re, to]) => { s = s.replace(re, to); });
            // sana: 28.09.2026, 2026-09-28, 28.09
            s = s.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m, y, mo, d) => uzDate(d, mo, y) || m);
            s = s.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, (m, d, mo, y) => uzDate(d, mo, y) || m);
            // vaqt: 14:30
            s = s.replace(/(soat\s*)?\b(\d{1,2}):(\d{2})\b/gi, (m, pre, h, mi) => (+h > 23 || +mi > 59) ? m : 'soat ' + uzNum(+h) + (+mi ? ', ' + uzNum(+mi) + ' daqiqa' : ''));
            // foiz
            s = s.replace(/(\d+(?:[.,]\d+)?)\s*%/g, (m, n) => { const p = n.split(/[.,]/); return (p[1] ? uzDec(+p[0], p[1]) : uzNum(+p[0])) + ' foiz'; });
            // telefon: +998 90 123 45 67
            s = s.replace(/\+?\b998[\s-]?\(?(\d{2})\)?[\s-]?(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})\b/g, (m, a, b, c, d) => 'toʻqqiz yuz toʻqson sakkiz, ' + uzDigits(a) + ', ' + uzDigits(b) + ', ' + uzDigits(c) + ', ' + uzDigits(d));
            // raqam va seriya: ТЭМ2, УК-25
            s = s.replace(/(?<![\wА-Яа-яЁёЎўҚқҒғҲҳ])([A-ZА-ЯЁЎҚҒҲ]{1,5})-?(\d{1,4})(?!\d)/g, (m, a, n) => (UZ_ABBR[a] || a) + ' ' + uzNum(+n));
            s = s.replace(/№\s*/g, 'raqam ');
            // oraliq: 5-10
            s = s.replace(/\b(\d{1,4})\s*[-–]\s*(\d{1,4})\b(?!-)/g, (m, a, b) => +a < +b ? uzNum(+a) + 'dan ' + uzNum(+b) + 'gacha' : m);
            // tartib: 5-band, 2026-yil
            s = s.replace(/\b(\d{1,4})\s*-\s*(?=[a-zA-Zа-яА-ЯʻʼoʻO])/g, (m, n) => uzOrd(+n) + ' ');
            // o'nli kasr
            s = s.replace(/\b(\d+)[.,](\d+)\b/g, (m, a, b) => uzDec(+a, b));
            // uzun raqamlar (tabel, inventar) — bo'laklab
            s = s.replace(/\d+/g, m => m.length >= 6 ? uzDigits(m) : uzNum(+m));
            return s;
        }
        function uzSayAbbr(s) { return String(s).replace(/(^|[^\wА-Яа-яЁёЎўҚқҒғҲҳ])([A-ZА-ЯЁЎҚҒҲ][A-ZА-ЯЁЎҚҒҲу]{1,4})(?=$|[^\wА-Яа-яЁёЎўҚқҒғҲҳ])/g, (m, p, a) => p + (UZ_ABBR[a] || a)); }

        // ---------- 2) Ovozli qisqa bayon: "Manba", emoji, uzun ro'yxat o'qilmaydi ----------
        function uzSpeechSummary(t) {
            let L = String(t || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
            L = L.filter(x => !/^(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]️?\s*)?(manba|manbalar|источник|📚|🔗|⚠️\s*punkt raqamini|🔒\s*mahalliy|☁️)/iu.test(x));
            const out = []; let run = [];
            const flush = () => { if (!run.length) return; run.slice(0, 3).forEach(x => out.push(x)); if (run.length > 3) out.push('va yana ' + uzNum(run.length - 3) + ' ta. Toʻliq roʻyxat ekranda.'); run = []; };
            L.forEach(x => { if (/^(?:[•\-–·▫◦*]|\d{1,2}[.)])\s+/.test(x)) run.push(x.replace(/^(?:[•\-–·▫◦*]|\d{1,2}[.)])\s+/, '')); else { flush(); out.push(x); } });
            flush();
            let s = out.join('. ').replace(/([:;,!?])\s*\./g, '$1').replace(/\.\s*\./g, '.');
            if (s.length > 700) { const cut = s.slice(0, 700); const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? ')); s = (i > 200 ? cut.slice(0, i + 1) : cut) + ' Batafsil maʼlumot ekranda.'; }
            return s;
        }
        // ---------- 3) Telefondagi ovozga moslab yozish (o'zbek ovozi yo'q telefonlarda) ----------
        function uzToTurkish(s) {
            s = String(s).toLowerCase().replace(/[ʻʼ’‘`]/g, "'");
            s = s.replace(/o'/g, 'o').replace(/g'/g, 'g').replace(/sh/g, 'ş').replace(/ch/g, 'ç').replace(/q/g, 'k').replace(/x/g, 'h').replace(/j/g, 'c').replace(/w/g, 'v');
            s = s.replace(/([a-zçşğıöü])'([a-zçşğıöü])/g, '$1$2').replace(/'/g, '');
            return s;
        }
        var CYR_LAT = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ç', 'ш': 'ş', 'щ': 'şç', 'ъ': '', 'ы': 'ı', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'k', 'ғ': 'g', 'ҳ': 'h' };
        function cyrToTurkish(s) { return String(s).replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g, c => { const l = c.toLowerCase(); return CYR_LAT[l] !== undefined ? CYR_LAT[l] : c; }); }
        function uzToCyr(s) {
            s = String(s).toLowerCase().replace(/[ʻʼ’‘`]/g, "'");
            const P = [["o'", 'ў'], ["g'", 'ғ'], ['sh', 'ш'], ['ch', 'ч'], ['ya', 'я'], ['yo', 'ё'], ['yu', 'ю'], ['ye', 'е'], ['ts', 'ц']];
            P.forEach(([a, b]) => { s = s.split(a).join(b); });
            const M = { a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'с', w: 'в', "'": 'ъ' };
            s = s.replace(/[a-z']/g, c => M[c] || c);
            // rus ovozi uchun o'zbekcha harflar yaqin ruscha tovushga
            return s.replace(/ў/g, 'о').replace(/ғ/g, 'г').replace(/қ/g, 'к').replace(/ҳ/g, 'х');
        }
        function uzVoiceKind(v) { const l = v && v.lang ? v.lang.toLowerCase() : ''; return /^uz/.test(l) ? 'uz' : /^tr/.test(l) ? 'tr' : /^(ru|kk|ky|be|uk)/.test(l) ? 'ru' : /^az/.test(l) ? 'tr' : l ? 'other' : 'none'; }
        // Matnni ovozga tayyorlash: qisqa bayon → sonlar so'z bilan → ovoz tiliga moslash
        function uzSpeechPrep(text, forKind) {
            const isRu = (String(text).match(/[а-яё]/gi) || []).length > String(text).length * 0.3;
            let s = uzSpeechSummary(text);
            if (isRu) return { s: s, ru: true };
            s = uzSayAbbr(uzSayNumbers(s));
            if (forKind === 'tr') s = uzToTurkish(cyrToTurkish(s));
            else if (forKind === 'ru') s = uzToCyr(s);
            return { s: s, ru: false };
        }

        // ---------- 4) Onlayn tabiiy o'zbek ovozi (ixtiyoriy, Microsoft Azure: Madina / Sardor) ----------
        var TTS38_KEY = 'agmk_tts_cloud';
        function tts38Cfg() { try { return JSON.parse(localStorage.getItem(TTS38_KEY) || 'null') || { on: false, key: '', region: '', voice: 'uz-UZ-MadinaNeural' }; } catch (e) { return { on: false }; } }
        function tts38Ready() { const c = tts38Cfg(); return !!(c.on && c.key && c.region) && navigator.onLine !== false; }
        var TTS38_CACHE = new Map();
        function tts38Esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        async function tts38Fetch(s) {
            if (TTS38_CACHE.has(s)) return TTS38_CACHE.get(s);
            const c = tts38Cfg(), ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(() => { if (ctl) ctl.abort(); }, 9000);
            try {
                const r = await fetch(agmkNoNet('Tashqi ovoz xizmati'), { method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Ocp-Apim-Subscription-Key': c.key.trim(), 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3' }, body: `<speak version="1.0" xml:lang="uz-UZ"><voice name="${tts38Esc(c.voice || 'uz-UZ-MadinaNeural')}"><prosody rate="-4%">${tts38Esc(s)}</prosody></voice></speak>` });
                if (!r.ok) throw new Error('TTS ' + r.status);
                const b = await r.blob(); if (TTS38_CACHE.size > 40) TTS38_CACHE.delete(TTS38_CACHE.keys().next().value); TTS38_CACHE.set(s, b); return b;
            } finally { clearTimeout(tm); }
        }
        // Shaxsiy yoki maxfiy javob internetga chiqmaydi — faqat telefon ovozi
        function tts38Allowed(text) {
            if (V38.lastPersonal && V38.lastAnsText && String(text).trim() === V38.lastAnsText) return false;
            if (typeof GOST_LAST_CONF !== 'undefined' && GOST_LAST_CONF && String(text).trim() === V38.lastAnsText) return false;
            if (/\btabel\b|pasport|tugʻil|tug'il|tugil|telefon|\+?998|manzil|oylik|maosh|kasallik|spravka|shaxsiy/i.test(text)) return false;
            return true;
        }

        (function () {
            speakAiText = agmkExtend('speakAiText', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik', speakAiText, o => function (text, onEnd) {
                let ended = false; const done = function () { if (ended) return; ended = true; V38.ttsEnd = Date.now(); if (onEnd) onEnd.apply(this, arguments); };
                if (!aiVoiceOutputEnabled) return o.call(this, text, done);
                const raw = String(text || '');
                if (tts38Ready() && tts38Allowed(raw)) {
                    const p = uzSpeechPrep(raw, 'uz');
                    if (!p.ru && p.s) {
                        try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
                        try { if (V38.audio) { V38.audio.pause(); V38.audio = null; } } catch (e) {}
                        try { if (window.AgmkNative && AgmkNative.kwsMute) AgmkNative.kwsMute(-1); } catch (e) {}
                        tts38Fetch(p.s).then(b => {
                            if (ended) return;
                            const u = URL.createObjectURL(b), a = new Audio(u); V38.audio = a;
                            const fin = () => { try { URL.revokeObjectURL(u); } catch (e) {} if (V38.audio === a) V38.audio = null; try { if (window.AgmkNative && AgmkNative.kwsMute) AgmkNative.kwsMute(900); } catch (e) {} done(); };
                            a.onended = fin; a.onerror = fin; const pr = a.play(); if (pr && pr.catch) pr.catch(() => { fin(); });
                        }).catch(() => { try { if (window.AgmkNative && AgmkNative.kwsMute) AgmkNative.kwsMute(900); } catch (e) {} if (!ended) o.call(this, uzSpeechPrep(raw, uzVoiceKind(aiPickVoice(raw))).s, done); });
                        return;
                    }
                }
                const v = aiPickVoice(raw), k = uzVoiceKind(v);
                const p = uzSpeechPrep(raw, k === 'uz' ? 'uz' : k === 'ru' ? 'ru' : k === 'tr' ? 'tr' : 'tr');
                return o.call(this, p.s, done);
            });
            stopAiSpeaking = agmkExtend('stopAiSpeaking', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik', stopAiSpeaking, os => function () { try { if (V38.audio) { V38.audio.pause(); V38.audio = null; } } catch (e) {} return os.apply(this, arguments); });
        })();
        // Turk ovozida o'zbekcha matn biroz sekinroq o'qiladi (tushunarliroq)
        (function () {
            if (!window.SpeechSynthesisUtterance || !window.speechSynthesis) return;
            const sp = speechSynthesis.speak.bind(speechSynthesis);
            try { speechSynthesis.speak = function (u) { try { if (u && u.voice && /^tr/i.test(u.voice.lang || '') && (u.rate || 1) === 1) u.rate = 0.93; } catch (e) {} return sp(u); }; } catch (e) {}
        })();

        // ---------- 5) Ha / Yo'q: tugma va ovoz ----------
        function yn38Parse(s) {
            const n = aiNorm(s).replace(/[.,!?]/g, ' ').trim();
            if (!n) return null;
            if (/\b(yoq|yuq|yok|kerak emas|kerakmas|shart emas|shartmas|oqima|oqimang|bekor|нет|не надо|не нужно|no)\b/.test(n)) return false;
            if (/\b(ha+|xa+|haa|xop|hop|mayli|albatta|oqi|oqing|oqib ber\w*|ok|okey|okay|togri|tasdiq\w*|roziman|yubor\w*|да|давай|конечно|yes)\b/.test(n)) return true;
            return null;
        }
        function yn38Listen(ms) {
            return new Promise(res => {
                const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return res(null);
                let r; try { r = new SR(); } catch (e) { return res(null); }
                r.lang = 'uz-UZ'; r.interimResults = false; r.continuous = false; r.maxAlternatives = 3; r._quiet = true;
                let got = '', fin = false; const end = v => { if (fin) return; fin = true; clearTimeout(t); res(v); };
                r.onresult = e => { try { for (let i = 0; i < e.results.length; i++) for (let j = 0; j < (e.results[i].length || 1); j++) got += ' ' + e.results[i][j].transcript; } catch (x) {} };
                r.onerror = () => {}; r.onend = () => end(yn38Parse(got));
                const t = setTimeout(() => { try { r.stop(); } catch (e) {} setTimeout(() => end(yn38Parse(got)), 700); }, ms || 5000);
                try { r.start(); V38.ynRec = r; } catch (e) { end(null); }
            });
        }
        function yn38Html(yes, no) { return `<span class="yn38"><button class="yn38-y" onclick="${yes}">✅ Ha</button><button class="yn38-n" onclick="${no}">❌ Yoʻq</button></span>`; }

        // ---------- 6) Javobdan keyin: «🔊 O'qib beraymi?» ----------
        var READ38_KEY = 'agmk_read_mode';
        function read38Mode() { try { return localStorage.getItem(READ38_KEY) || 'ask'; } catch (e) { return 'ask'; } }
        function read38Set(m) { try { localStorage.setItem(READ38_KEY, m); } catch (e) {} read38Ui(); }
        function read38Ui() { const s = $id('set-read-sub'); if (s) s.textContent = { ask: "Har safar soʻraydi: «Oʻqib beraymi?» — Ha / Yoʻq", always: 'Har doim ovoz chiqarib oʻqiydi', never: 'Oʻqimaydi — faqat matn' }[read38Mode()]; }
        function read38Cycle() { const o = ['ask', 'always', 'never'], n = o[(o.indexOf(read38Mode()) + 1) % 3]; read38Set(n); showToast('🔊 ' + ($id('set-read-sub') ? $id('set-read-sub').textContent : n)); }
        var READ38 = { seq: 0, map: {} };
        function read38Do(id) {
            const x = READ38.map[id]; if (!x) return; delete READ38.map[id];
            const row = $id('rd38_' + id); if (row) row.remove();
            try { if (V38.ynRec) V38.ynRec.abort(); } catch (e) {}
            const was = aiVoiceOutputEnabled; aiVoiceOutputEnabled = true;
            try { aisMode('speak'); } catch (e) {}
            speakAiText(x.t, () => { aiVoiceOutputEnabled = was; try { aisMode('idle'); } catch (e) {} });
        }
        function read38No(id) { delete READ38.map[id]; const row = $id('rd38_' + id); if (row) row.remove(); try { if (V38.ynRec) V38.ynRec.abort(); } catch (e) {} try { stopAiSpeaking(); } catch (e) {} }
        function read38Offer(t) {
            t = String(t || '').trim(); if (!t) return;
            const mode = read38Mode();
            if (mode === 'never') return;
            if (mode === 'always') { speakAiText(t); return; }
            const box = $id('aiMessages'); if (!box) return;
            const bots = box.querySelectorAll('.ai-msg.bot'), el = bots[bots.length - 1]; if (!el) return;
            const id = ++READ38.seq; READ38.map[id] = { t: t };
            const row = document.createElement('div'); row.className = 'rd38'; row.id = 'rd38_' + id;
            row.innerHTML = `<span class="rd38-q">🔊 Oʻqib beraymi?</span>` + yn38Html(`read38Do(${id})`, `read38No(${id})`);
            el.appendChild(row); box.scrollTop = box.scrollHeight;
            // Qo'l band bo'lsa — ovoz bilan ham so'raydi va javobni tinglaydi
            if (!aiVoiceOutputEnabled) return;
            const m = $id('aiChatModal'); if (!m || m.classList.contains('hidden')) return;
            setTimeout(() => {
                if (!READ38.map[id]) return;
                try { kwsHoldCheck(); } catch (e) {}
                speakAiText('Oʻqib beraymi?', () => {
                    if (!READ38.map[id] || m.classList.contains('hidden') || (typeof AILIVE !== 'undefined' && AILIVE.on)) return;
                    row.classList.add('lis'); const q = row.querySelector('.rd38-q'); if (q) q.textContent = '🎙 Ha yoki yoʻq deng...';
                    yn38Listen(4500).then(v => { if (!READ38.map[id]) return; row.classList.remove('lis'); if (q) q.textContent = '🔊 Oʻqib beraymi?'; if (v === true) read38Do(id); else if (v === false) read38No(id); });
                });
            }, 250);
        }
        // Qo'lda yozilgan savol → so'raydi; ovozli savol → avtomatik o'qiydi
        (function () {
            const inp = $id('aiInput');
            if (inp) { inp.addEventListener('keydown', e => { if (e.isTrusted) V38.typed = true; }); inp.addEventListener('input', e => { if (e.isTrusted && e.inputType !== 'insertReplacementText') V38.typed = true; }); }
            sendAiMessage = function () {
                const i = $id('aiInput'), q = i.value.trim(); if (!q) return;
                const typed = V38.typed; V38.typed = false; i.value = '';
                if (!typed) V38.voiceUntil = Date.now() + 60000;
                aiSendText(q).then(t => { if (!t || (typeof AILIVE !== 'undefined' && AILIVE.on)) return; if (!typed) speakAiText(t); else read38Offer(t); });
            };
            aicChip = function (i) { const t = (AIC.chips || [])[i]; if (!t) return; $id('aiChips').classList.add('hidden'); aiSendText(t).then(a => { if (a) read38Offer(a); }); };
        })();
        // Oxirgi javob shaxsiymi (onlayn ovozga yuborilmasligi uchun)
        (function () {
            aiSendText = agmkExtend('aiSendText', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik · Oxirgi javob shaxsiymi (onlayn ovozga yuborilmasligi uchun)', aiSendText, o => function (q) {
                return o.apply(this, arguments).then(t => { V38.lastAnsText = String(t || '').trim(); return t; });
            });
        })();
        // Jonli suhbat — ovoz bilan (ovozli savol) belgisi
        (function () { aiLiveStart = agmkExtend('aiLiveStart', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik · Jonli suhbat — ovoz bilan (ovozli savol) belgisi', aiLiveStart, o => function () { V38.voiceUntil = Date.now() + 120000; return o.apply(this, arguments); }); })();

        // ---------- 7) Barcha tasdiqlash oynalarida ✅ Ha / ❌ Yo'q (ovozli rejimda — ovoz bilan ham) ----------
        (function () {
            uidShowNext = agmkExtend('uidShowNext', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik · ---------- 7) Barcha tasdiqlash oynalarida ✅ Ha / ❌ Yoʼq (ovozli rejimda — ovoz ', uidShowNext, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const d = UID.cur; if (!d || d.type !== 'confirm') return r;
                    const bs = $id('uidBtns').querySelectorAll('button'); if (bs.length === 2) { bs[0].innerHTML = '❌ Yoʻq'; bs[1].innerHTML = '✅ Ha'; bs[0].classList.add('yn38-nb'); bs[1].classList.add('yn38-yb'); }
                    const voice = (typeof AILIVE !== 'undefined' && AILIVE.on) || Date.now() < V38.voiceUntil;
                    if (voice && aiVoiceOutputEnabled && !d._yn) {
                        d._yn = 1;
                        const msg = String(d.msg || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}️]/gu, '').trim();
                        speakAiText(msg.slice(0, 220) + '. Ha yoki yoʻq?', () => { if (UID.cur !== d) return; const t = $id('uidTitle'); if (t) t.classList.add('yn38-lis'); yn38Listen(5000).then(v => { if (t) t.classList.remove('yn38-lis'); if (UID.cur !== d) return; if (v === true) uidClose(true); else if (v === false) uidClose(false); }); });
                    }
                } catch (e) {}
                return r;
            });
        })();

        // ---------- 8) "Salom, Ey AI": ikkinchi bosqich — kichik "Labbay?" oynasi ----------
        // Tinglovchi iborani tanisa, darhol butun sahifa ochilmaydi: pastda kichik oyna chiqadi va 7 soniya savol kutiladi.
        // Savol aytilsa — AI oynasi ochilib javob beradi; hech narsa aytilmasa — o'zi yopiladi. «🚫 Men chaqirmadim» — shu ovoz namunasi rad etiladi.
        function wk38Bubble(show, txt) {
            let b = $id('wk38');
            if (!b) { b = document.createElement('div'); b.id = 'wk38'; b.className = 'wk38 hidden'; b.innerHTML = `<div class="wk38-in" onclick="wk38Open()"><span class="wk38-dot"></span><div class="wk38-t"><b id="wk38T">Labbay?</b><small id="wk38S">Savolingizni ayting…</small></div></div><button class="wk38-no" onclick="wk38Not()">🚫 Men chaqirmadim</button>`; document.body.appendChild(b); }
            if (txt) { const s = $id('wk38S'); if (s) s.textContent = txt; }
            b.classList.toggle('hidden', !show); V38.bubble = show ? Date.now() : null;
        }
        function wk38Stop() { try { if (V38.bubRec) V38.bubRec.abort(); } catch (e) {} V38.bubRec = null; clearTimeout(V38.bubT); wk38Bubble(false); }
        function wk38Open() { wk38Stop(); try { aiGlobalOpen(); } catch (e) {} }
        function wk38Not() {
            wk38Stop();
            let ok = false; try { if (window.AgmkNative && AgmkNative.kwsNeg) ok = AgmkNative.kwsNeg(); else if (window.AgmkNative && AgmkNative.kwsFalse) AgmkNative.kwsFalse(); } catch (e) {}
            showToast(ok ? '🚫 Tushunarli — bunday ovozga endi javob bermayman' : '🚫 Qayd etildi');
        }
        function wk38Listen() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) { wk38Open(); return; }
            let r; try { r = new SR(); } catch (e) { wk38Open(); return; }
            r.lang = 'uz-UZ'; r.interimResults = true; r.continuous = false; r._quiet = true;
            let got = '';
            r.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; got = t; const s = $id('wk38S'); if (s && t) s.textContent = '«' + t + '»'; };
            r.onerror = () => {};
            r.onend = () => {
                V38.bubRec = null; clearTimeout(V38.bubT);
                const q = String(got || '').trim(), n = aiNorm(q);
                if (!q || q.length < 2 || /^(hech|hech narsa|yoq|kerak emas|нет|ничего)$/.test(n) || (typeof WAKE_RE !== 'undefined' && WAKE_RE.test(' ' + q + ' ') && q.split(/\s+/).length <= 3)) {
                    if (q && WAKE_RE.test(' ' + q + ' ')) { wk38Open(); return; } // yana "salom ey ai" dedi — oynani ochamiz
                    wk38Bubble(false); return;
                }
                wk38Bubble(false);
                V38.voiceUntil = Date.now() + 90000;
                try { aiGlobalOpen._silent = true; aiGlobalOpen(); } catch (e) {}
                setTimeout(() => { aiSendText(q).then(a => { if (a) { try { aisMode('speak'); } catch (e) {} speakAiText(a, () => { try { aisMode('idle'); } catch (e) {} }); } }); }, 350);
            };
            try { r.start(); V38.bubRec = r; } catch (e) { wk38Open(); return; }
            V38.bubT = setTimeout(() => { try { r.stop(); } catch (e) {} }, 7000);
        }
        (function () {
            if (typeof kwsWake !== 'function') return;
            kwsWake = agmkExtend('kwsWake', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik', kwsWake, o => function (d) {
                if (document.body.classList.contains('locked') || document.hidden) return;
                const now = Date.now();
                if (now - V38.wakeLast < 5000) return;          // qayta-qayta chaqirilmaydi
                if (now - V38.ttsEnd < 1500 || (window.speechSynthesis && speechSynthesis.speaking) || V38.audio) return; // ilovaning o'z ovozi
                if (UID.cur) return;
                V38.wakeLast = now;
                const m = $id('aiChatModal');
                if ((m && !m.classList.contains('hidden')) || (typeof W !== 'undefined' && W.on && $id('screen-nd') && $id('screen-nd').classList.contains('active'))) return o.apply(this, arguments);
                if (V38.bubble) return;
                try { wakeBeep(); } catch (e) {}
                wk38Bubble(true, 'Savolingizni ayting…'); const tt = $id('wk38T'); if (tt) tt.textContent = typeof labbayText === 'function' ? labbayText() : 'Labbay?';
                setTimeout(wk38Listen, 180);
            });
        })();
        // Kichik oyna ochiq paytda tinglovchi dam oladi
        (function () { if (typeof kwsHoldWant !== 'function') return; kwsHoldWant = agmkExtend('kwsHoldWant', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik · Kichik oyna ochiq paytda tinglovchi dam oladi', kwsHoldWant, o => function () { return !!V38.bubble || o.apply(this, arguments); }); })();
        // Chaqiruvdan keyin ochilgan AI oynasida ham «Men chaqirmadim»
        (function () {
            if (typeof aiGreetAndListen !== 'function') return;
            aiGreetAndListen = agmkExtend('aiGreetAndListen', '34-bosqich (v1.8): sof oʼzbekcha talaffuz, «Oʼqib beraymi?» (Ha / Yoʼq), kalit soʼzning ik', aiGreetAndListen, o => function () {
                const r = o.apply(this, arguments);
                try { const e = $id('aicEmpty'); if (e && window.AgmkNative && AgmkNative.kwsNeg && Date.now() - V38.wakeLast < 3000 && !e.querySelector('.wk38-no')) { const b = document.createElement('button'); b.className = 'wk38-no in'; b.innerText = '🚫 Men chaqirmadim'; b.onclick = () => { try { AgmkNative.kwsNeg(); } catch (x) {} aicClose(); showToast('🚫 Tushunarli — bunday ovozga endi javob bermayman'); }; e.appendChild(b); } } catch (e) {}
                return r;
            });
        })();

        // ---------- 9) Parametrlar: o'qib berish rejimi, onlayn ovoz ----------
        function tts38Open() {
            if (!isAdminReal()) { alert("🔒 Onlayn ovoz sozlamasini faqat administrator oʻzgartiradi."); return; }
            const c = tts38Cfg();
            mdl('tts38M', `<h3 style="margin:0 0 8px">🗣 Tabiiy oʻzbek ovozi (onlayn)</h3>
                <p class="tts38-p">Telefonlarda oʻzbek ovozi yoʻq — ilova oʻzbekcha matnni telefondagi ovozga moslab oʻqiydi. Yanada tabiiy talaffuz uchun Microsoft Azure «Madina» yoki «Sardor» ovozini ulash mumkin (Azure Speech kaliti kerak).</p>
                <p class="tts38-p">🔒 Xodimlarning shaxsiy maʼlumotlari va maxfiy hujjatlar (MM) boʻyicha javoblar internetga yuborilmaydi — ular faqat telefon ovozida oʻqiladi.</p>
                <label class="tts38-l">Hudud (region), masalan: westeurope</label><input id="tts38R" class="search-box" value="${escapeHtml(c.region || '')}" placeholder="westeurope">
                <label class="tts38-l">Kalit (Key)</label><input id="tts38K" class="search-box" type="password" value="${escapeHtml(c.key || '')}" placeholder="Azure Speech key">
                <label class="tts38-l">Ovoz</label><div class="snd-chips" id="tts38V">${[['uz-UZ-MadinaNeural', '👩 Madina'], ['uz-UZ-SardorNeural', '👨 Sardor']].map(([k, t]) => `<i class="${(c.voice || 'uz-UZ-MadinaNeural') === k ? 'on' : ''}" data-v="${k}" onclick="this.parentNode.querySelectorAll('i').forEach(x=>x.classList.remove('on')); this.classList.add('on')">${t}</i>`).join('')}</div>
                <div class="tts38-b"><button class="save-btn" style="background:#334155" onclick="tts38Save(false)">Oʻchirish</button><button class="save-btn" onclick="tts38Test()">🔊 Sinash</button><button class="save-btn" onclick="tts38Save(true)">Saqlash</button></div>`);
        }
        function tts38Save(on) {
            if (!isAdminReal()) return;
            const v = (document.querySelector('#tts38V i.on') || {}).dataset || {};
            const c = { on: !!on, region: ($id('tts38R').value || '').trim(), key: ($id('tts38K').value || '').trim(), voice: v.v || 'uz-UZ-MadinaNeural' };
            if (on && (!c.key || !c.region)) { alert('⚠️ Hudud va kalitni kiriting.'); return; }
            try { localStorage.setItem(TTS38_KEY, JSON.stringify(c)); } catch (e) {}
            TTS38_CACHE.clear(); mdlClose('tts38M'); tts38Ui(); showToast(on ? '✅ Onlayn ovoz yoqildi' : 'Onlayn ovoz oʻchirildi');
        }
        async function tts38Test() {
            const v = (document.querySelector('#tts38V i.on') || {}).dataset || {};
            const old = localStorage.getItem(TTS38_KEY);
            try { localStorage.setItem(TTS38_KEY, JSON.stringify({ on: true, region: ($id('tts38R').value || '').trim(), key: ($id('tts38K').value || '').trim(), voice: v.v || 'uz-UZ-MadinaNeural' })); TTS38_CACHE.clear(); } catch (e) {}
            try { const b = await tts38Fetch('Assalomu alaykum! Men AGMK STTB platformasining yordamchisiman.'); new Audio(URL.createObjectURL(b)).play(); showToast('✅ Ulandi'); }
            catch (e) { alert('⚠️ Ulanib boʻlmadi: ' + agmkErrUz(e) + '\nKalit va hududni tekshiring.'); }
            finally { try { if (old === null) localStorage.removeItem(TTS38_KEY); else localStorage.setItem(TTS38_KEY, old); } catch (e) {} TTS38_CACHE.clear(); }
        }
        function tts38Ui() { const s = $id('set-tts-sub'); if (!s) return; const c = tts38Cfg(); s.textContent = c.on && c.key ? '🟢 Yoqilgan · ' + (/Sardor/.test(c.voice) ? 'Sardor' : 'Madina') + ' (umumiy javoblar uchun)' : "Telefon ovozi (oʻzbekchaga moslangan). Onlayn ovoz ulanmagan"; }
        (function () {
            const anchor = ($id('set-vp-sub') && $id('set-vp-sub').closest('.btn-card')) || ($id('set-wake-sub') && $id('set-wake-sub').closest('.btn-card'));
            if (!anchor || $id('set-read-sub')) return;
            const d = document.createElement('div'); d.className = 'btn-card'; d.id = 'set-read-card'; d.onclick = read38Cycle;
            d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🔊</span><span class="btn-text">Javobni ovoz chiqarib oʻqish<span class="set-sub" id="set-read-sub"></span></span></div><span class="btn-arrow">›</span>`;
            anchor.after(d);
            const t = document.createElement('div'); t.className = 'btn-card set-admin'; t.id = 'set-tts-card'; t.onclick = tts38Open;
            t.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🗣</span><span class="btn-text">Oʻzbek ovozi (talaffuz)<span class="set-sub" id="set-tts-sub"></span></span></div><span class="btn-arrow">›</span>`;
            d.after(t);
            read38Ui(); tts38Ui();
        })();

