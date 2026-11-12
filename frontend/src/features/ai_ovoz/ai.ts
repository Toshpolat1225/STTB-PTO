
        // =====================================================================
        // v3.0 — AI: NOTO'G'RI JAVOB BERMASLIK (asosiy qoida: javob bo'lmagani noto'g'ri javobdan yaxshi)
        //  • Mahalliy yordamchi faqat savol aniq ilova mavzusida bo'lsa bazadan javob beradi
        //  • Begona savol (ob-havo, kurs, yangilik...) — bazadan hech qachon ro'yxat chiqmaydi
        //  • AI xizmati javob bermasa: halol xabar + «🔄 Qayta urinish»; avval o'zi qayta urinadi va zaxira modelga o'tadi
        //  • «🗣 Ovozli chaqiruv («Salom, Ey AI»)» tugmasi: AI tugmasi menyusida va AI sozlamalarida
        // =====================================================================
        var AIQ = { q: '', ext: false, conf: true, failed: false, err: '' };
        var AI3_DOMAIN = /vagon|вагон|lokomotiv|локомотив|teplovoz|тепловоз|elektrovoz|электровоз|texnika|техник|avtotraktor|автотрактор|avtopark|drezina|дрезин|motovoz|мотовоз|kran|кран|ekskavator|экскават|xodim|ходим|сотрудн|работник|ishchi|tabel|табел|lavozim|должност|shtat|штат|\bseh|цех|uchastka|участ|stansiya|станц|peregon|перегон|xarita|карт[аы]|ta.?mir|тамир|таъмир|ремонт|grafik|график|\bppr\b|\b[kdt]r\b|\bakt|акт\b|акта|dalolatnoma|далолатнома|forma|форм|spravka|справк|raschet|расчет|расчёт|norma|норм|меъёр|ehtiyot|эҳтиёт|запчаст|zapchast|material|материал|kolodka|колодк|g.?ildirak|ғилдирак|колес|avtoscepka|avtostsepka|автостсепка|balandlig|qalinlig|diametr|avtosцепka|автосцеп|shkvoren|шквор|talabnoma|требован|trebovan|shpz|шпз|sklad|склад|ombor|hisobot|ҳисобот|отч[её]т|polojeniya|положени|smena|смена|navbatchi|навбатчи|dispetcher|диспетчер|\busta|master|мастер|boshli|начальник|pasport|паспорт|inventar|инвентар|zavod raqam|dumpkar|думпкар|platforma|платформ|sisterna|цистерн|xopper|хоппер|gost|гост|\bpte\b|птэ|nizom|низом|buyruq|приказ|reglament|strelka|стрелк|svetofor|светофор|сцб|\bscb\b|yozishma|xabar|chat|imzo|polojen|metallolom|lom\b|лом\b|defekt|дефект|naryad|наряд|kalkulyatsiya|калькуляц|gps|treker|срок\b|zayavka|заявк|grafig|pechat|печат|printer|chop et|achot|otchot|tekshir|bildirishnoma|уведомл|muddat|instruktaj|инструктаж|tibbiy|медосмотр|mehnat muhofaza|zapchast|ehtiyot qism|qabul qil|formula|формул|dalolatnoma|likvidatsiya|razukomplekt|zamechaniya|ishlarim|vazifa|poyezd|drezina|tarkib/i;
        var AI3_SMALL = /^(salom|assalom|assalomu|rahmat|raxmat|спасибо|привет|здравств|qalay|xayr|hayr|ok|ha|yo.?q|help|yordam|nima qila olasan|kimsan|kim siz|ismingiz)(?![\wа-яёўқғҳ])|bugun (nechanchi|qaysi kun|sana)|soat nech|hozir soat|sana(ni)? ayt|kun(i)? nechanchi|дата|который час|сколько времени/i;
        var AI3_EXT = /ob.?havo|havo (qanday|harorat|issiq|sovuq|bulut)|harorat\b|погод|температур|yomg.?ir|дожд|\bqor\b|снег|shamol|ветер|\bkurs\b|курс (валют|доллар|евро|рубл)|valyuta|валют|dollar|доллар|\bevro\b|евро|rubl|рубл|yangilik|новост|futbol|футбол|\bsport|спорт|o.?yin natija|\bmatch\b|prezident|президент|saylov|выбор|\bkino\b|фильм|musiqa|музык|qo.?shiq|песн|retsept|рецепт|\btaom\b|ovqat|bitcoin|kripto|birja|бирж|goroskop|гороскоп|weather|news|football|anekdot|анекдот|she.?r ayt|стих/i;
        var AI3_FAIL = "📶 Internet sifati past yoki AI xizmatida vaqtincha nosozlik bor. Birozdan keyin qayta urinib koʻring.";
        var AI3_EXTMSG = "🌐 Bu savol ilova bazasiga tegishli emas (ob-havo, valyuta kursi, yangiliklar va h.k.). Bunday maʼlumotni faqat internetga ulangan AI bera oladi — Parametrlar → «Sunʼiy intellekt (AI) ulanishi».";
        function ai3Norm(q) { try { return (typeof normTxt === 'function' ? normTxt(q) + ' ' : '') + String(q || '').toLowerCase(); } catch (e) { return String(q || '').toLowerCase(); } }
        function ai3Classify(q) {
            const n = ai3Norm(q), dom = AI3_DOMAIN.test(n) || /\d{3,}/.test(n), small = AI3_SMALL.test(String(q || '').trim().toLowerCase()) || AI3_SMALL.test(n);
            const ext = AI3_EXT.test(n) && !dom;
            return { ext: ext, conf: !ext && (dom || small) };
        }
        // Norma savollari: tasdiqlangan norma bazasidan aniq javob (bo'lmasa — taxmin qilinmaydi)
        var AI3_NSTOP = new Set(['norma', 'normasi', 'normas', 'norm', 'meyor', 'meyori', 'qancha', 'necha', 'nechta', 'kapital', 'kapit', 'depo', 'tamir', 'tamiri', 'remont', 'uchun', 'vagon', 'vagonga', 'kerak', 'bitta', 'dona', 'birlik', 'ning', 'dagi', 'tasdiqlangan', 'rasxod', 'sarf', 'sarfi', 'dumpkar', 'platforma', 'sisterna', 'xopper', 'dozator', 'nima', 'qaysi']);
        function ai3NormAnswer(q) {
            const s = String(q || ''), L = typeof normTxt === 'function' ? normTxt(s) : s.toLowerCase();
            if (!/norm|me.?yor|меъёр|меёр|норм/i.test(s + ' ' + L)) return null;
            let db = null; try { db = nrmDB(); } catch (e) { return null; }
            if (!db || !db.sets || !db.sets.length) return { t: "📐 Tasdiqlangan norma bazasi hali yuklanmagan. Hisobotlar → Vagon → «📐 Normalarni ochish» orqali МЕЪЁРИ fayllarini yuklang — shundan keyin aniq javob beraman.", personal: false };
            const kind = (() => { try { return nrmKind(s + ' ' + L.replace(/vs/g, 'вс')); } catch (e) { return ''; } })();
            const rt = /kapital|капитал/i.test(s + L) ? 'KR' : /depo|депо|деповск/i.test(s + L) ? 'DR' : '';
            const L2 = L.replace(/\b\d\s*v?s\s*-?\s*\d+\s*t?\b|\bq\s*-?\s*115\b|\bkj\s*-?\s*20\b/g, ' ');
            const words = (L2.match(/[a-z]{3,}/g) || []).filter(w => !AI3_NSTOP.has(w) && !AI3_NSTOP.has(w.replace(/(si|ni|ga|da|ning|lar)$/, ''))).map(w => w.slice(0, 4));
            const nums = (L2.match(/\d+/g) || []);
            const sets = db.sets.filter(z => !z.off && (!kind || z.kind === kind) && (!rt || z.rt === rt));
            if (!sets.length) return { t: "📐 Bunday norma topilmadi" + (kind ? ' (' + (NRM_KIND[kind] || kind) + (rt ? ', ' + (NRM_RT[rt] || rt) : '') + ')' : '') + ". Bazada: " + db.sets.map(nrmLabel).slice(0, 8).join('; ') + '.', personal: false };
            if (!words.length && !nums.length) return { t: '📐 Tasdiqlangan normalar: ' + sets.map(z => nrmLabel(z) + ' — ' + z.items.length + ' pozitsiya').join('; ') + '. Material nomini ham yozing, masalan: «2VS-105 kapital taʼmir kislorod normasi».', personal: false };
            const hits = [];
            sets.forEach(z => z.items.forEach(it => { const nm = (typeof normTxt === 'function' ? normTxt(it.name) : String(it.name).toLowerCase()); const st = new Set((nm.match(/[a-z]{3,}/g) || []).map(w => w.slice(0, 4))); if (words.every(w => st.has(w)) && nums.every(n => nm.indexOf(n) >= 0)) hits.push({ z: z, it: it }); }));
            if (!hits.length) return { t: '📐 Tasdiqlangan normada «' + s.trim() + '» boʻyicha material topilmadi. Nomini boshqacha yozib koʻring (masalan: kislorod, kolodka, shplint 3).', personal: false };
            return { t: '📐 Tasdiqlangan norma (1 birlik uchun):\n' + hits.slice(0, 12).map(h => '• ' + nrmLabel(h.z) + ': ' + h.it.name + ' — ' + h.it.q + ' ' + (h.it.unit || '')).join('\n') + (hits.length > 12 ? '\n… yana ' + (hits.length - 12) + ' ta' : '') + '\n📚 Manba: tasdiqlangan norma rasxod (МЕЪЁРИ)', personal: false };
        }
        (function () {
            if (typeof aiLocalAnswer !== 'function') return;
            aiStage('AI ish oqimi buyruqlari va meʼyoriy javoblar', function (q, next) { try { const c = typeof aifCmd === 'function' ? aifCmd(q) : null; if (c) return c; } catch (e) { console.error(e); } try { const a = ai3NormAnswer(q); if (a) return a; } catch (e) { console.error(e); } return next(q); }); // buyruqlar (aiflow.js) → norma → qolganlari
        })();
        (function () {
            if (typeof aiLocalAnswer !== 'function') return;
            aiStage('Savol tasnifi: tashqi savol va ishonch darajasi', function (q, next) {
                const C = ai3Classify(q); AIQ = { q: String(q || ''), ext: C.ext, conf: C.conf, failed: false, err: '' };
                if (C.ext) return { t: '', help: true, personal: false, ext: true };
                const L = next(q) || { t: '', help: true };
                const R = typeof L === 'string' ? { t: L } : L;
                if (!C.conf && !R.help && !R.personal) return Object.assign({}, R, { help: true, lowConf: true }); // taxmin qilib javob bermaydi
                return R;
            });
        })();
        (function () {
            if (typeof aiClarify !== 'function') return;
            aiClarify = agmkExtend('aiClarify', 'aiClarify', aiClarify, o => function () {
                if (AIQ.failed) return AI3_FAIL;
                if (AIQ.ext) return (typeof sec3Closed === 'function' && sec3Closed()) ? "🔒 Yopiq kontur rejimi yoqilgan: AI internetga chiqmaydi. Ob-havo, kurs, yangiliklar kabi savollarga javob berilmaydi — faqat ilova bazasi boʻyicha." : AI3_EXTMSG;
                return o.apply(this, arguments);
            });
        })();
        // Bulutli AI: qayta urinish va zaxira modelga o'tish
        var AI3_ALT = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
        function ai3Retriable(e) { const m = String((e && e.message) || e || ''); return /band|vaqtincha|vaqt tugadi|ulanib bo.?lmadi|limit|5\d\d|bo.?sh javob|overload|unavailable/i.test(m) && !/kalit|ruxsat yo.?q|topilmadi|xavfsizlik/i.test(m); }
        (function () {
            if (typeof aiCloudStream !== 'function') return;
            aiCloudStream = agmkExtend('aiCloudStream', 'aiCloudStream', aiCloudStream, o => async function (sys, msgs, onDelta, opt) {
                const args = arguments;
                try { return await o.apply(this, args); } catch (e1) {
                    if (!ai3Retriable(e1)) { AIQ.failed = true; AIQ.err = e1.message || ''; throw e1; }
                    const c = aicGet(), orig = c.model;
                    if (c.prov !== 'claude') {
                        const m = AI3_ALT.find(x => x !== aiModelOf(c)); // bitta zaxira model (asosiy funksiya o'zi ham 1 marta qayta urinadi)
                        await new Promise(z => setTimeout(z, 1500));
                        try { const c2 = aicGet(); c2.model = m; aicSet(c2); const r = await o.apply(this, args); showToast('🔁 AI zaxira modelda javob berdi: ' + m); return r; }
                        catch (e2) { const c3 = aicGet(); c3.model = orig; aicSet(c3); AIQ.failed = true; AIQ.err = e2.message || ''; throw e2; }
                    }
                    AIQ.failed = true; AIQ.err = e1.message || ''; throw e1;
                }
            });
        })();
        (function () { // «Tekshirish» va boshqa qisqa so'rovlarda kutish vaqti uzaytiriladi
            if (typeof aiCloudCall !== 'function') return;
            aiCloudCall = agmkExtend('aiCloudCall', 'aiCloudCall', aiCloudCall, o => function (sys, msgs, opt) { opt = Object.assign({}, opt || {}); if (!opt.timeout || opt.timeout < 45000) opt.timeout = 45000; return o.call(this, sys, msgs, opt); });
        })();
        // Javobdan keyin: xato bo'lsa — halol belgi va «🔄 Qayta urinish»
        (function () {
            if (typeof aiSendText !== 'function') return;
            aiSendText = agmkExtend('aiSendText', 'aiSendText', aiSendText, o => function (q) {
                const p = o.apply(this, arguments);
                return Promise.resolve(p).then(t => {
                    try {
                        if (AIQ.failed && AIQ.q === String(q || '').trim()) {
                            const L = document.querySelectorAll('#aiMessages .ai-msg.bot'), el = L[L.length - 1];
                            if (el && !el.querySelector('.ai3-retry')) {
                                const sm = el.querySelector('small.ai-src'); if (sm) sm.textContent = '⚠️ AI bilan aloqa boʻlmadi' + (AIQ.err ? ' · ' + AIQ.err.slice(0, 80) : '');
                                const b = document.createElement('button'); b.className = 'mini-btn ai3-retry'; b.style.cssText = 'display:block;margin-top:6px'; b.textContent = '🔄 Qayta urinish';
                                const qq = String(q || '').trim(); b.onclick = () => { b.remove(); aiSendText(qq); };
                                el.appendChild(b);
                            }
                        }
                    } catch (e) {}
                    return t;
                });
            });
        })();
        // ---------- 🗣 Ovozli chaqiruv («Salom, Ey AI») tugmasi ----------
        function ai3WakeOn() { try { return typeof wakeGet === 'function' ? !!wakeGet() : false; } catch (e) { return false; } }
        function ai3WakeToggle() {
            try { wakeSet(!wakeGet()); } catch (e) {}
            const on = ai3WakeOn(); showToast(on ? '🗣 Ovozli chaqiruv yoqildi — «Salom, Ey AI» deng' : '🔇 Ovozli chaqiruv oʻchirildi');
            document.querySelectorAll('.ai3-wk').forEach(b => { b.classList.toggle('on', on); b.innerHTML = ai3WakeLbl(); });
        }
        function ai3WakeLbl() { const sup = typeof wakeSupported === 'function' ? wakeSupported() : true, on = ai3WakeOn(); return (on ? '🗣 Ovozli chaqiruv («Salom, Ey AI»): YOQIQ' : '🔇 Ovozli chaqiruv («Salom, Ey AI»): OʻCHIQ') + (sup ? '' : '<small>bu qurilmada ishlamaydi</small>'); }
        (function () {
            if (typeof aiQuick !== 'function') return;
            aiQuick = agmkExtend('aiQuick', 'aiQuick', aiQuick, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const p = $id('aiQuick'); if (!p) return r;
                    const first = p.querySelector('button'); // eski «Mikrofon» tugmasi — aslida shu chaqiruvni yoqadi/o'chiradi
                    if (first && /Mikrofon/.test(first.textContent)) { first.className = 'ai3-wk' + (ai3WakeOn() ? ' on' : ''); first.innerHTML = ai3WakeLbl(); first.setAttribute('onclick', ''); first.onclick = () => { ai3WakeToggle(); const q = $id('aiQuick'); if (q) q.remove(); }; }
                } catch (e) {}
                return r;
            });
        })();
        (function () {
            if (typeof openAiCfg !== 'function') return;
            openAiCfg = agmkExtend('openAiCfg', 'openAiCfg', openAiCfg, o => function () {
                const r = o.apply(this, arguments);
                setTimeout(() => {
                    try {
                        const box = $id('aiCfgBody');
                        if (!box || box.querySelector('.ai3-wk')) return;
                        const b = document.createElement('button'); b.className = 'action-btn ai3-wk' + (ai3WakeOn() ? ' on' : ''); b.style.cssText = 'margin:8px 0;background:#1e293b;border:1px solid #334155'; b.innerHTML = ai3WakeLbl(); b.onclick = ai3WakeToggle;
                        const h = box.querySelector('.aic-st') || box.querySelector('h3'); if (h) h.insertAdjacentElement('afterend', b); else box.prepend(b);
                    } catch (e) {}
                }, 60);
                return r;
            });
        })();

