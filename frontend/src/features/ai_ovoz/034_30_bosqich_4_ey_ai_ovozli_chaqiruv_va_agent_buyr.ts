        /* ===== 30-bosqich (4): "Ey AI" ovozli chaqiruv va agent buyruqlari ===== */
        // ---------- Agent: bo'limlarni ochish ----------
        var AG_OPEN = [
            [/lokomotiv|teplovoz|локомотив/, () => openLokScreen(), 'Lokomotivlar'], [/vagon|вагон/, () => openScreen('screen-vagonlar'), 'Vagonlar parki'],
            [/avtotraktor|traktor|avto ?texnika/, () => openAvtoScreen(), 'Avtotraktor parki'], [/yo.?l texnika|yo.?l qurilish|drezina/, () => openYolScreen(), "Yo'l qurilishi va ta'mirlash"],
            [/xarita|stansiya\w*\b.*ro.?yxat|карт/, () => openMapScreen(), "Temir yo'l xaritasi"], [/xodim|ishchi|shtat|сотрудник/, () => openXodimTree(), 'Ishchi xodimlar'],
            [/parametr|sozlama|настройк/, () => openSettings(), 'Parametrlar'], [/yozishma|chat|xabar\w*\b|сообщен/, () => openChats(), 'Yozishmalar'],
            [/profil/, () => openProfile(), 'Profil'], [/ehtiyot|zapchast|запчаст/, () => openSP(), 'Ehtiyot qismlar'], [/akt\w*\s+arxiv|arxiv/, () => openND('arch'), 'Aktlar arxivi'],
            [/normativ|hujjatlar/, () => openND('docs'), 'Normativ hujjatlar'], [/bosh sahifa|asosiy sahifa|главн/, () => openScreen('screen-main'), 'Bosh sahifa'], [/bildirishnoma|xabarnoma|уведомл/, () => openNotifs(), 'Bildirishnomalar']
        ];
        function aiAgent(q) {
            const n = aiNorm(q).replace(/\s+/g, ' ').trim();
            // Hujjat yuborish
            if (/(yubor|jo.?nat|отправ)/.test(n) && /(akt|dalolatnoma|hujjat|hisobot|pdf|word|excel|rasm|fayl|акт)/.test(n)) return agentSendAkt(q, false);
            // Yozishma ochish: "@@N:394@@ bilan yozishma" / "@@N:394@@ga xabar yoz"
            if (/(bilan (yozishma|chat|suhbat)|ga xabar yoz|ga yoz\b)/.test(n)) { const p = pplFind(n.replace(/(bilan|yozishma|chat|suhbat|xabar|yoz)\w*/g, ' ')); if (p.length === 1) { setTimeout(() => { try { aicClose(); } catch (e) {} openChats(p[0]); }, 400); return '💬 ' + p[0].name + ' bilan yozishma ochilmoqda.'; } if (p.length > 1) return "🔎 Bir nechta xodim topildi: " + p.slice(0, 5).map(x => x.name + ' (' + x.role + ')').join('; ') + '. Aniqroq ayting.'; }
            // Sahifani ochish
            if (/\b(och|ochib ber|ko.?rsat|kir|o.?t|открой|покажи)\w*\b/.test(n) && n.split(' ').length <= 7 && !/qachon|nechta|qaysi|o.?tgan|o.?tib|muddat|ro.?yxat|kimlar|qancha|\d{3,}/.test(n)) { // «muddati o'tgan», «8121 ni ko'rsat» — maʼlumot soʻrovi
                for (const [re, fn, nm] of AG_OPEN) if (re.test(n)) { setTimeout(() => { try { aicClose(); } catch (e) {} try { fn(); } catch (e) { console.error(e); } }, 450); return '📂 «' + nm + '» sahifasi ochilmoqda.'; }
            }
            return null;
        }
        function agentFmts(n) { const f = []; if (/word|docx|ворд/.test(n)) f.push('docx'); if (/pdf|пдф/.test(n)) f.push('pdf'); if (/excel|exel|xlsx|эксел/.test(n)) f.push('xlsx'); if (/rasm|jpg|surat|фото|картин/.test(n)) f.push('jpg'); return f.length ? f : ['pdf']; }
        function agentVia(n) { return /telegram|telegramm|телеграм|tg\b/.test(n) ? 'telegram' : /pochta|email|e-mail|mail|почт/.test(n) ? 'email' : /sms|смс/.test(n) ? 'sms' : 'telegram'; }
        function agentSendAkt(q, inWiz) {
            const n = aiNorm(q), say = t => { if (inWiz) wSay(t, true); return t; };
            let html = null, title = null, lang = 'uz';
            const pg = $id('ndPage');
            if (pg && $id('screen-nd').classList.contains('active')) { html = pg.innerHTML; title = ndCurTitle(); lang = ndLang(); }
            else if (ND.html) { html = ND.html; title = (ND.html.match(/<div class="a-title">([\s\S]*?)<\/div>/) || [, 'Akt'])[1].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim() + ' ' + fmtISO(todayISO()); lang = /Утверждаю|АКТ/.test(ND.html) ? 'ru' : 'uz'; }
            else if (/hisobot|ro.?yxat/.test(n) && SND.lastHtml) { html = SND.lastHtml; title = (SND.lastName || 'Hisobot').replace(/\.pdf$/, '').replace(/_/g, ' '); }
            else { const a = (typeof ndAkts === 'function' ? ndAkts() : [])[0]; if (a) { html = a.html; title = a.title + ' ' + fmtISO((a.at || '').slice(0, 10)); lang = /Утверждаю|АКТ/.test(a.html) ? 'ru' : 'uz'; } }
            if (!html) return say("Yuboriladigan akt topilmadi. Avval akt tuzing: «Ey AI, akt tuz …».");
            const who = n.replace(/\b(akt|aktni|dalolatnoma\w*|hujjat\w*|hisobot\w*|pdf|word|excel|rasm|jpg|qilib|shaklida|formatda|orqali|telegram\w*|pochta\w*|email|sms|yubor\w*|jo.?nat\w*|va|ham|shu|ushbu|bu|menga|iltimos|ey|ai)\b/g, ' ');
            const P = pplFind(who), fm = agentFmts(n), via = agentVia(n);
            const table = /<table>(?!.*a-sign)/.test(html) || /<th>/.test(html);
            if (P.length !== 1) {
                setTimeout(() => { try { if (!inWiz) aicClose(); } catch (e) {} sendOpen({ html: html, title: title, lang: lang, fmts: fm, via: via, table: table }); if (P.length > 1) { const i = $id('sndQ'); if (i) { i.value = who.trim(); sendSearch(who.trim()); } } }, 400);
                return say(P.length ? "Bir nechta xodim topildi — ro'yxatdan tanlang." : "Qabul qiluvchini topa olmadim — ro'yxatdan tanlang yoki ismini yozing.");
            }
            const to = P[0], c = ctGet(to);
            SND.html = html; SND.title = title; SND.lang = lang; SND.to = to; SND.fmts = fm; SND.via = via; SND.table = table;
            if ((via === 'email' && !c.email) || (via === 'telegram' && !c.tg)) {
                setTimeout(() => { try { if (!inWiz) aicClose(); } catch (e) {} sendOpen({ html: html, title: title, lang: lang, to: to, fmts: fm, via: via, table: table }); }, 400);
                return say(to.name + ' uchun ' + (via === 'email' ? 'elektron pochta' : 'Telegram') + " kiritilmagan. Ochilgan oynada kiriting va «Tayyorlash va yuborish»ni bosing.");
            }
            setTimeout(() => { sendGo(); }, 300);
            return say('📤 ' + title + ' — ' + fm.map(x => ({ pdf: 'PDF', docx: 'Word', xlsx: 'Excel', jpg: 'JPG' })[x]).join(', ') + ' formatda ' + to.name + 'ga ' + (via === 'email' ? 'pochta' : via === 'telegram' ? 'Telegram' : 'SMS') + " orqali tayyorlanmoqda. Ochilgan ilovada «Yuborish»ni bosing.");
        }
        (function () {
            aiStage('AI agent buyruqlari', function (q, next) {
                try { const a = aiAgent(q); if (a) return { t: a, personal: false }; } catch (e) { console.error(e); }
                return next(q);
            });
        })();

        // ---------- "Ey AI" — kalit so'z bilan chaqirish ----------
        var WAKE_RE = /(?:^|[\s,.!?])(?:ey|эй|ей|hey|хей|hay|xey|e)[\s,-]*(?:ai|ay|ай|аи|эй ай|a\.?i\.?|ey ai|эйай)(?=$|[\s,.!?])|(?:^|\s)(?:eyai|эйай|heyai|хейай)(?=$|\s)/i;
        var WAKE = { en: false, rec: null, other: 0, t: 0, fails: 0 };
        function wakeSupported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !(typeof micBlocked !== 'undefined' && micBlocked) && !!window.isSecureContext; }
        function wakeGet() { try { const v = localStorage.getItem('agmk_wake'); return v === null ? !!window.AGMK_APK : v === '1'; } catch (e) { return false; } }
        function wakeSet(on) { try { localStorage.setItem('agmk_wake', on ? '1' : '0'); } catch (e) {} WAKE.en = on; wakeUi(); if (on) wakeKick(); else wakeHalt(); }
        function wakeBusy() {
            if (document.hidden || document.body.classList.contains('locked')) return true;
            if (typeof AILIVE !== 'undefined' && AILIVE.on) return true;
            if (typeof W !== 'undefined' && W.rec) return true;
            if (typeof MOV !== 'undefined' && MOV.on) return true;
            if (WAKE.other && Date.now() - WAKE.other < 1500) return true;
            try { if (window.speechSynthesis && speechSynthesis.speaking) return true; } catch (e) {}
            const ai = $id('aiChatModal'); if (ai && !ai.classList.contains('hidden') && document.querySelector('#ai-mic-btn.listening')) return true;
            return false;
        }
        function wakeHalt() { clearTimeout(WAKE.t); try { WAKE.rec && WAKE.rec.abort(); } catch (e) {} WAKE.rec = null; document.body.classList.remove('wake-on'); }
        function wakeKick(ms) { clearTimeout(WAKE.t); WAKE.t = setTimeout(wakeLoop, ms || 400); }
        function wakeLoop() {
            if (!WAKE.en || !wakeSupported()) { document.body.classList.remove('wake-on'); return; }
            if (WAKE.rec) return;
            if (wakeBusy()) { document.body.classList.remove('wake-on'); return wakeKick(1500); }
            const SRc = window.SpeechRecognition || window.webkitSpeechRecognition, r = new SRc();
            r._wake = true; r.lang = 'uz-UZ'; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;
            let heard = '', fired = false;
            r.onresult = e => {
                let s = ''; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript + ' ';
                heard = s.trim();
                const fin = e.results[e.results.length - 1].isFinal;
                if (!fired && WAKE_RE.test(' ' + heard + ' ') && fin) { fired = true; try { r.abort(); } catch (x) {} wakeFire(heard); }
            };
            r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'language-not-supported') { WAKE.fails++; if (WAKE.fails >= 2) { WAKE.en = false; wakeUi(); showToast("🎙 «Ey AI» o'chirildi: mikrofon yoki ovozni tanish xizmati ruxsat bermadi"); } } };
            r.onend = () => { WAKE.rec = null; if (!fired && heard && WAKE_RE.test(' ' + heard + ' ')) { fired = true; wakeFire(heard); } if (WAKE.en) wakeKick(fired ? 2500 : 350); };
            try { r.start(); WAKE.rec = r; document.body.classList.add('wake-on'); } catch (e) { WAKE.rec = null; wakeKick(1500); }
        }
        function wakeBeep() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const c = WAKE.ac || (WAKE.ac = new C()); const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.2); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} } catch (e) {} }
        function wakeFire(text) {
            const m = (' ' + text + ' ').split(WAKE_RE), cmd = (m.length > 1 ? m.slice(1).join(' ') : '').replace(/^[\s,.!?-]+/, '').trim();
            document.body.classList.remove('wake-on'); wakeBeep();
            // Akt ustasi ochiq bo'lsa — javob ustaga boradi
            if (typeof W !== 'undefined' && W.on && $id('screen-nd').classList.contains('active')) { W.voice = true; if (cmd) wUser(cmd); else wListen(); return; }
            try { if ($id('aiChatModal').classList.contains('hidden')) aiGlobalOpen(); } catch (e) {}
            setTimeout(() => { if (cmd && cmd.split(' ').length >= 1 && cmd.length > 2) { try { if (!aiVoiceOutputEnabled) toggleAiVoiceOutput(); } catch (e) {} aiSendText(cmd).then(ans => { try { aisMode('speak'); speakAiText(ans, () => aisMode('idle')); } catch (e) {} }); } else { try { startAiVoiceInput(); } catch (e) {} } }, 450);
        }
        // Boshqa mikrofon ishlaganda "Ey AI" to'xtab turadi
        (function () {
            const SRc = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SRc || !SRc.prototype) return;
            const os = SRc.prototype.start;
            SRc.prototype.start = function () {
                if (!this._wake) { WAKE.other = Date.now(); if (WAKE.rec && WAKE.rec !== this) { try { WAKE.rec.abort(); } catch (e) {} WAKE.rec = null; } const me = this; try { this.addEventListener('end', () => { WAKE.other = Date.now(); wakeKick(1600); }); } catch (e) {} }
                return os.apply(this, arguments);
            };
        })();
        (function () { micOvShow = agmkExtend('micOvShow', '30-bosqich (4): "Ey AI" ovozli chaqiruv va agent buyruqlari', micOvShow, o => function (rec) { if (rec && rec._wake) return; return o.apply(this, arguments); }); })();
        document.addEventListener('visibilitychange', () => { if (document.hidden) wakeHalt(); else if (WAKE.en) wakeKick(800); });
        try { const ot = aiSendText; } catch (e) {}
        // Ovozli javob tugagach qayta tinglash
        (function () { speakAiText = agmkExtend('speakAiText', '30-bosqich (4): "Ey AI" ovozli chaqiruv va agent buyruqlari · Ovozli javob tugagach qayta tinglash', speakAiText, o => function (t, cb) { return o.call(this, t, function () { if (cb) cb.apply(this, arguments); if (WAKE.en) wakeKick(1200); }); }); })();
        (function () { aicClose = agmkExtend('aicClose', '30-bosqich (4): "Ey AI" ovozli chaqiruv va agent buyruqlari · Ovozli javob tugagach qayta tinglash', aicClose, o => function () { const r = o.apply(this, arguments); if (WAKE.en) wakeKick(900); return r; }); })();
        function wakeUi() {
            const sub = $id('set-wake-sub'); if (sub) sub.textContent = !wakeSupported() ? "Bu brauzerda ishlamaydi — APK ilovada ishlaydi" : WAKE.en ? "Yoqilgan — «Ey AI» deng" : "O'chirilgan";
            const b = $id('set-wake-tg'); if (b) b.classList.toggle('on', WAKE.en);
        }
        (function () {
            // Parametrlar: kartacha
            const lang = document.querySelector('#screen-settings .btn-card[onclick="i18nPick()"]');
            if (lang && !$id('set-wake-sub')) {
                const d = document.createElement('div'); d.className = 'btn-card'; d.onclick = () => { if (!wakeSupported()) { alert("🎙 «Ey AI» ovozli chaqiruvi mikrofon doimiy ishlashini talab qiladi.\n\nBu imkoniyat APK ilovada ishlaydi. Brauzerda faylni to'g'ridan-to'g'ri ochganda telefon mikrofonni bermaydi."); return; } wakeSet(!WAKE.en); showToast(WAKE.en ? "🎙 «Ey AI» yoqildi" : "🎙 «Ey AI» o'chirildi"); };
                d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🎙</span><span class="btn-text">Ovoz bilan chaqirish («Ey AI»)<span class="set-sub" id="set-wake-sub"></span></span></div><span class="wk-tg" id="set-wake-tg"><i></i></span>`;
                lang.parentNode.insertBefore(d, lang);
            }
            WAKE.en = wakeGet(); wakeUi();
            setTimeout(() => { if (WAKE.en) wakeKick(2500); }, 1500);
            try { if (typeof I18N_D !== 'undefined') Object.assign(I18N_D, { "Ovoz bilan chaqirish («Ey AI»)": ['Voice wake-up («Hey AI»)', 'Голосовой вызов («Эй AI»)', '语音唤醒（«嘿 AI»）'] }); } catch (e) {}
        })();

