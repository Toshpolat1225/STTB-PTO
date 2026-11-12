        // =====================================================================
        // YANGI (25-bosqich): Haqiqiy AI ulanishi (Gemini / Claude) + 3D sharcha
        //  • Kalit faylga yozilmaydi — Parametrlarda kiritiladi (localStorage)
        //  • Xodimlarning shaxsiy ma'lumotlari (F.I.Sh., tabel, telefon) AI'ga
        //    yuborilishdan oldin [P1], [T1] kabi belgilarga almashtiriladi va
        //    javob kelgach telefonning o'zida qayta tiklanadi.
        //  • Internet yoki kalit bo'lmasa — mahalliy yordamchi ishlayveradi.
        // =====================================================================
        var AI_DEF_MODEL = { gemini: 'gemini-2.5-flash', claude: 'claude-haiku-4-5-20251001' };
        var AI_PROV_NAME = { gemini: 'Google Gemini', claude: 'Claude (Anthropic)' };
        function aicGet() {
            const d = { on: false, prov: 'gemini', key: '', model: '', share: false };
            try { return Object.assign(d, JSON.parse(localStorage.getItem('agmk_ai_cfg') || '{}') || {}); } catch (e) { return d; }
        }
        function aicSet(c) { try { localStorage.setItem('agmk_ai_cfg', JSON.stringify(c)); return true; } catch (e) { alert("⚠️ Saqlab bo'lmadi."); return false; } }
        function aiCloudReady() { const c = aicGet(); return !!(c.on && c.key && navigator.onLine !== false) && !(typeof sec3Closed === 'function' && sec3Closed()); } // yopiq konturda bulut AI yo'q
        function aiModelOf(c) { return (c.model || '').trim() || AI_DEF_MODEL[c.prov] || AI_DEF_MODEL.gemini; }

        // ---------- Shaxsiy ma'lumotlarni himoyalash (psevdonimlash) ----------
        var AIP = { sig: '', re: null, words: [], tabs: new Set(), tokOf: {}, valOf: {}, n: 0 };
        function aipBuild() {
            const names = [];
            try { (typeof allXodims === 'function' ? allXodims() : []).forEach(r => { if (r.item) { names.push(r.item.name || ''); if (r.item.tabel) AIP.tabs.add(cleanTabel(r.item.tabel)); } }); } catch (e) {}
            try { (typeof ndSigners === 'function' ? ndSigners() : []).forEach(s => names.push(s.n || '')); } catch (e) {}
            try { if (currentUser && currentUser.name) names.push(currentUser.name); if (currentUser && currentUser.tabel) AIP.tabs.add(cleanTabel(currentUser.tabel)); } catch (e) {}
            try { (hrDB().tarkiblar || []).forEach(t => names.push(t.mashinist || '')); } catch (e) {}
            try { (ND.form && ND.form.com || []).forEach(c => names.push(c.n || '')); if (ND.form && ND.form.apObj) names.push(ND.form.apObj.n || ''); } catch (e) {}
            const sig = names.length + ':' + AIP.tabs.size;
            if (sig === AIP.sig && AIP.re) return;
            AIP.sig = sig;
            const stop = /^(o.?g.?li|qizi|ugli|kizi|угли|кизи|оглы|кызы)$/i;
            const set = new Set(), skip = new Set(['mashinist', 'muhandis', 'boshliq', 'boshlig', 'usta', 'test', 'vagon', 'dispetcher', 'navbatchi', 'инженер', 'начальник', 'мастер']);
            try { (typeof ppRoles === 'function' ? ppRoles() : []).forEach(r => String(r).split(/[\s.,()«»"-]+/).forEach(w => { if (w.length >= 4) skip.add(w.toLowerCase()); })); } catch (e) {}
            names.forEach(n => String(n).split(/[\s.,]+/).forEach(w => { w = w.replace(/[^\p{L}'ʻʼ’`-]/gu, ''); if (w.length >= 4 && !stop.test(w) && !skip.has(w.toLowerCase())) set.add(w); }));
            AIP.words = Array.from(set).sort((a, b) => b.length - a.length);
            const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            AIP.re = AIP.words.length ? new RegExp('(?<![\\p{L}])(' + AIP.words.map(esc).join('|') + ')(?![\\p{L}])', 'giu') : null;
        }
        function aipTok(kind, val) {
            const k = kind + ':' + val.toLowerCase();
            if (!AIP.tokOf[k]) { AIP.n++; const t = '[' + kind + AIP.n + ']'; AIP.tokOf[k] = t; AIP.valOf[t] = val; }
            return AIP.tokOf[k];
        }
        function aiMask(s) {
            s = String(s || ''); aipBuild();
            // telefon raqamlari — umuman yuborilmaydi
            s = s.replace(/\+?998[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '[TEL]').replace(/(?<!\d)\(?\d{2}\)?[\s-]\d{3}[\s-]\d{2}[\s-]\d{2}(?!\d)/g, '[TEL]');
            if (AIP.re) s = s.replace(AIP.re, w => aipTok('P', w));
            // tabel raqamlari (texnika raqamlari bilan to'qnashmasa)
            if (AIP.tabs.size) {
                const tech = new Set(); try { vagonlarData.forEach(v => { tech.add(String(vagonNo(v))); if (v.inv) tech.add(String(v.inv)); if (v.num) tech.add(String(v.num)); }); } catch (e) {}
                s = s.replace(/(?<!\d)\d{3,6}(?!\d)/g, d => AIP.tabs.has(d) && !tech.has(d) ? aipTok('T', d) : d);
            }
            return s;
        }
        function aiUnmask(s) { return String(s || '').replace(/\[(?:P|T)\d+\]/g, t => AIP.valOf[t] || t); }
        var AI_LAST_PAYLOAD = '';

        // ---------- Bazadan qisqa kontekst ----------
        function aiCtx(q, local, sec) {
            const L = [];
            L.push('Bugun: ' + fmtISO(todayISO()) + '. Bo\'lim: ' + (sec || '—') + '. Foydalanuvchi lavozimi: ' + ((currentUser && currentUser.role) || '—') + '.');
            try {
                const st = l => { const g = {}; l.forEach(v => { g[v.status] = (g[v.status] || 0) + 1; }); return Object.keys(g).map(k => k + ' ' + g[k]).join(', '); };
                const vg = onlyVagons(); L.push('Vagonlar: jami ' + vg.length + ' (' + st(vg) + ').');
                const lk = vagonlarData.filter(v => isLok(v)); if (lk.length) L.push('Lokomotivlar: ' + lk.length + ' (' + st(lk) + ').');
                const av = vagonlarData.filter(v => v.kind === 'avto'); if (av.length) L.push('Avtotraktor: ' + av.length + ' (' + st(av) + ').');
                const yl = vagonlarData.filter(v => v.kind === 'yol'); if (yl.length) L.push("Yo'l texnikasi: " + yl.length + ' (' + st(yl) + ').');
            } catch (e) {}
            try { const d = hrDB(); if (d.tarkiblar.length) L.push('Harakatdagi tarkiblar: ' + d.tarkiblar.length + ' ta.'); } catch (e) {}
            try { const rs = ndRefFor(q); if (rs.length) L.push('Mos normativ havolalar: ' + rs.map(r => r.title + (r.check ? ' (aniqlash kerak)' : '')).join('; ') + '.'); } catch (e) {}
            try { const pm = ndPunktMatches(q, 3); if (pm.length) L.push('Kiritilgan hujjatlardan punktlar: ' + pm.map(x => x.d.title + ', ' + x.p.n + ': ' + x.p.t.slice(0, 260)).join(' | ')); } catch (e) {}
            if (local) L.push('Dastur bazasining javobi: ' + local);
            return L.join('\n');
        }
        var AI_SYS = "Sen «AGMK-STTB PTO» mobil dasturining AI yordamchisisan: Olmaliq KMK AJ Sanoat temir yo'l transporti boshqarmasi (STTB/UPJT), texnik bo'lim (PTO) xodimlariga yordam berasan. " +
            "Mavzular: temir yo'l harakat tarkibi (vagonlar, 2ВС-105/2ВС-115 dumpkarlari, lokomotivlar), avtotraktor va yo'l texnikasi, ta'mir turlari (TO, TR, DR, KR), normativ hujjatlar (GOST, ПТЭ, buyruqlar), akt-dalolatnomalar, ehtiyot qismlar, stansiyalar va harakat. " +
            "Qoidalar: 1) Foydalanuvchi qaysi tilda yozsa (o'zbek yoki rus), o'sha tilda qisqa, aniq va amaliy javob ber. 2) DASTUR ICHIDAGI ma'lumotlar (bizning vagonlar, lokomotivlar, texnika soni va holati, ta'mir sanalari, xodimlar, aktlar) uchun FAQAT «BAZA» bo'limiga tayan, o'ylab topma; bunday ma'lumot bazada bo'lmasa, shuni ayt. Boshqa BARCHA savollarda (umumiy bilim, texnika va texnologiya, GOST/ПТЭ, qonunlar, narxlar, kurslar, yangiliklar, ob-havo, hisob-kitob, tarjima, maslahat va h.k.) «bazada yo'q» DEMA — o'z bilimingdan va (mavjud bo'lsa) Google qidiruvidan foydalanib to'liq, aniq va dolzarb javob ber. Google qidiruviga ichki ma'lumotlarni ([P1]/[T1] belgilar, vagon/inventar raqamlari, bazadagi sonlar) qo'yma — faqat umumiy mavzuni qidir. " +
            "3) Normativ punkt raqamlarini o'ylab topma — aniq bilmasang «tekshirish kerak» deb yoz. 4) [P1], [T2] kabi belgilar — himoyalangan shaxsiy ma'lumot; ularni aynan shunday qoldir, ochishga urinma. " +
            "5) Markdown jadval, # sarlavha ishlatma; oddiy matn, kerak bo'lsa • bilan ro'yxat. 6) Xavfsizlik (harakat xavfsizligi, mehnat muhofazasi) masalalarida ehtiyotkor bo'l va mas'ul shaxsga murojaat qilishni eslat.";

        // ---------- AI xizmatiga so'rov ----------
        async function aiCloudCall(sys, msgs, opt) {
            const c = aicGet(); opt = opt || {};
            if (!c.key) throw new Error("API kalit kiritilmagan");
            const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const tm = setTimeout(() => { if (ctl) ctl.abort(); }, opt.timeout || 30000);
            AI_LAST_PAYLOAD = 'SYSTEM:\n' + sys + '\n\n' + msgs.map(m => (m.role === 'user' ? 'USER' : 'AI') + ':\n' + m.text).join('\n\n');
            try {
                let r, j;
                if (c.prov === 'claude') {
                    r = await fetch(agmkNoNet('Tashqi AI'), {
                        method: 'POST', signal: ctl ? ctl.signal : undefined,
                        headers: { 'content-type': 'application/json', 'x-api-key': c.key.trim(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
                        body: JSON.stringify({ model: aiModelOf(c), max_tokens: opt.max || 1200, temperature: opt.temp === undefined ? 0.3 : opt.temp, system: sys, messages: msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })) })
                    });
                    j = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
                    return (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n').trim();
                }
                const call = async model => fetch(agmkNoNet('Tashqi AI') + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(c.key.trim()), {
                    method: 'POST', signal: ctl ? ctl.signal : undefined, headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ system_instruction: { parts: [{ text: sys }] }, contents: msgs.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })), generationConfig: { temperature: opt.temp === undefined ? 0.3 : opt.temp, maxOutputTokens: opt.max || 1200 } })
                });
                r = await call(aiModelOf(c));
                if (r.status === 404) { const alt = await aiGeminiPickModel(c.key.trim()); if (alt && alt !== aiModelOf(c)) { const c2 = aicGet(); c2.model = alt; aicSet(c2); r = await call(alt); } }
                if (r.status >= 500) { await new Promise(z => setTimeout(z, 1500)); r = await call(aiModelOf(aicGet())); }
                if (r.status >= 500 || r.status === 429) { const cur = aiModelOf(aicGet()), alt = await aiGeminiPickModel(c.key.trim(), [cur]); if (alt) { const r2 = await call(alt); if (r2.ok) { const c2 = aicGet(); c2.model = alt; aicSet(c2); } r = r2; } }
                j = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
                const cand = (j.candidates || [])[0]; if (cand && cand.groundingMetadata) AIWEB.meta = cand.groundingMetadata;
                const t = cand && cand.content && (cand.content.parts || []).filter(p => !p.thought).map(p => p.text || '').join('').trim();
                if (!t) throw new Error(cand && cand.finishReason === 'SAFETY' ? "AI bu savolga javob bermadi (xavfsizlik filtri)" : "AI bo'sh javob qaytardi");
                return t;
            } catch (e) {
                if (e && e.name === 'AbortError') throw new Error("AI javob bermadi (vaqt tugadi)");
                if (e instanceof TypeError) throw new Error("Internetga ulanib bo'lmadi");
                throw e;
            } finally { clearTimeout(tm); }
        }
        async function aiGeminiPickModel(key, except) {
            try {
                const r = await fetch(agmkNoNet('Tashqi AI') + encodeURIComponent(key)); const j = await r.json();
                const l = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, '')).filter(n => !except || !except.includes(n));
                const ver = n => { const m = n.match(/(\d+(?:\.\d+)?)/); return m ? +m[1] : 0; }, bad = /lite|image|tts|audio|live|exp|thinking|embed|native/, by = a => a.sort((x, y) => ver(y) - ver(x) || x.length - y.length);
                return (l.includes('gemini-flash-latest') ? 'gemini-flash-latest' : '') || by(l.filter(n => /flash/.test(n) && !bad.test(n) && !/preview/.test(n)))[0] || by(l.filter(n => /flash/.test(n) && !bad.test(n)))[0] || by(l.filter(n => /flash/.test(n)))[0] || l[0] || '';
            } catch (e) { return ''; }
        }
        function aiErrText(st, msg) {
            if (st === 400 && /key/i.test(msg)) return "API kalit noto'g'ri";
            if (st === 401 || st === 403) return "API kalit noto'g'ri yoki ruxsat yo'q";
            if (st === 404) return "Model topilmadi — Parametrlarda model nomini tekshiring";
            if (st === 429) return "So'rovlar limiti tugadi — birozdan so'ng qayta urinib ko'ring";
            if (st >= 500) return "AI xizmati hozir band yoki vaqtincha ishlamayapti (Google: " + st + (msg ? ' — ' + msg.slice(0, 90) : '') + "). 1–2 daqiqadan keyin qayta urinib koʻring";
            return 'Xato ' + st + (msg ? ': ' + msg.slice(0, 120) : '');
        }

        // ---------- Suhbat ----------
        var AIH = [];
        const AI_PERSONAL_RE = /tug.?ilgan|telefon|pasport ma|manzil|yashash|oylik|maosh|ish haqi|parol/i;
        function aiCloudAnswer(q, local, box) {
            const el = document.createElement('div'); el.className = 'ai-msg bot ai-think'; el.innerHTML = '<span class="ai-dots"><i></i><i></i><i></i></span> AI o\'ylayapti...';
            box.appendChild(el); box.scrollTop = box.scrollHeight;
            aisMode('think');
            const isHelp = /^Quyidagilarni so'rashingiz mumkin/.test(local || '');
            const personal = AI_PERSONAL_RE.test(q) || AI_PERSONAL_RE.test(local || '');
            const base = personal ? '(shaxsiy ma\'lumot bilan bog\'liq — yuborilmadi)' : (isHelp ? '' : local);
            const sec = (typeof aiContext !== 'undefined' && aiContext) || '';
            const sys = AI_SYS + '\n\nBAZA:\n' + aiMask(aiCtx(q, base, sec));
            const msgs = AIH.slice(-8).concat([{ role: 'user', text: aiMask(q) }]);
            aiCloudCall(sys, msgs).then(ans => {
                AIH.push({ role: 'user', text: aiMask(q) }, { role: 'assistant', text: ans }); if (AIH.length > 16) AIH = AIH.slice(-16);
                const out = aiUnmask(ans).replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/gm, '');
                el.classList.remove('ai-think'); el.innerHTML = escapeHtml(out) + '<small class="ai-src">☁️ ' + escapeHtml(AI_PROV_NAME[aicGet().prov] || 'AI') + '</small>';
                box.scrollTop = box.scrollHeight; aisMode('idle'); speakAiText(out);
            }).catch(err => {
                el.classList.remove('ai-think'); el.innerHTML = escapeHtml(local) + '<small class="ai-src warn">📴 Mahalliy javob · ' + escapeHtml(err.message || 'AI bilan bog\'lanib bo\'lmadi') + '</small>';
                box.scrollTop = box.scrollHeight; aisMode('idle'); speakAiText(local);
            });
        }
        // Aktni AI bilan rasmiy uslubda mukammallashtirish (faktlar o'zgarmaydi)
        function aiPolishBtn() {
            return `<div class="nd-acts" style="margin-bottom:8px"><button class="action-btn ai-pol" onclick="aiPolishAkt()">${typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : ''}AI bilan matnni mukammallashtirish</button>${ND.prevHtml && ND.prevFor === ND.html ? `<button class="action-btn" style="background:#475569" onclick="aiPolishUndo()">↩️ Avvalgi holat</button>` : ''}</div>`;
        }
        async function aiPolishAkt() {
            const p = $id('ndPage'); if (!p) return;
            if (!aiCloudReady()) { alert("AI ulanmagan.\n\nParametrlar → «Sun'iy intellekt (AI) ulanishi» bo'limida API kalitni kiriting va yoqing (internet ham kerak)."); return; }
            const ps = Array.from(p.querySelectorAll('p')); if (!ps.length) return;
            const src = ps.map(x => aiMask(x.innerText.trim()));
            const lang = ND_TYPES[ND.form.tur].l === 'ru' ? 'rus' : "o'zbek";
            const btn = document.querySelector('.ai-pol'); if (btn) { btn.disabled = true; btn.innerHTML = '⏳ AI tahrirlayapti...'; }
            try {
                const sys = "Sen rasmiy hujjatlar muharririsan. Senga " + lang + " tilidagi akt-dalolatnoma xatboshilari JSON massiv ko'rinishida beriladi. Har bir xatboshini rasmiy-idoraviy uslubda grammatik va uslubiy jihatdan mukammallashtir. " +
                    "QAT'IY: faktlar, raqamlar, sanalar, o'lchamlar, vagon raqamlari, lavozimlar, qavs ichidagi normativ havolalar va [P1] kabi belgilarni o'zgartirma, yangi fakt qo'shma, xatboshilar sonini va tartibini saqla. Faqat JSON massiv qaytar, boshqa hech narsa yozma.";
                const ans = await aiCloudCall(sys, [{ role: 'user', text: JSON.stringify(src) }], { temp: 0.2, max: 3000, timeout: 45000 });
                const m = ans.match(/\[[\s\S]*\]/); let arr = null; try { arr = JSON.parse(m ? m[0] : ans); } catch (e) {}
                if (!Array.isArray(arr) || arr.length !== ps.length || arr.some(x => typeof x !== 'string' || !x.trim())) throw new Error("AI javobi mos kelmadi — matn o'zgartirilmadi");
                ND.prevHtml = p.innerHTML;
                ps.forEach((x, i) => { x.textContent = aiUnmask(arr[i].trim()); });
                ND.html = p.innerHTML; ND.prevFor = ND.html; ndRender(); showToast('✨ Matn AI bilan mukammallashtirildi');
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); if (btn) { btn.disabled = false; btn.innerHTML = (typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : '') + 'AI bilan matnni mukammallashtirish'; } }
        }
        function aiPolishUndo() { if (!ND.prevHtml) return; ND.html = ND.prevHtml; ND.prevHtml = null; ndRender(); }

        // ---------- Parametrlar: AI ulanishi ----------
        function aiCfgSub() {
            const e = $id('set-ai-sub'); if (!e) return; const c = aicGet();
            e.innerText = c.on && c.key ? '✅ Ulangan: ' + (AI_PROV_NAME[c.prov] || c.prov) + (navigator.onLine === false ? ' (hozir internet yo\'q)' : '') : "Ulanmagan — mahalliy yordamchi ishlaydi";
        }
        function openAiCfg() {
            const c = aicGet(), adm = isAdminReal();
            $id('aiCfgBody').innerHTML = `<h3 class="aic-h">${typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : ''}Sun'iy intellekt (AI) ulanishi</h3>
                <div class="aic-st ${c.on && c.key ? 'ok' : ''}">${c.on && c.key ? '✅ AI ulangan: ' + escapeHtml(AI_PROV_NAME[c.prov]) + ' · model: ' + escapeHtml(aiModelOf(c)) : '⚪ AI ulanmagan — internetsiz mahalliy yordamchi ishlaydi'}</div>
                ${adm ? `<label class="aic-chk"><input type="checkbox" id="aicOn" ${c.on ? 'checked' : ''}> AI'ni yoqish</label>
                <div class="nd-f"><label>AI XIZMATI</label><select id="aicProv" onchange="$id('aicModel').placeholder=AI_DEF_MODEL[this.value]; $id('aicHelp').innerHTML=aiKeyHelp(this.value)"><option value="gemini"${c.prov === 'gemini' ? ' selected' : ''}>Google Gemini — bepul tarif</option><option value="claude"${c.prov === 'claude' ? ' selected' : ''}>Claude (Anthropic) — pullik, arzon</option></select></div>
                <div class="nd-f"><label>API KALIT</label><div class="aic-key"><input type="password" id="aicKey" value="${escapeHtml(c.key)}" placeholder="kalitni shu yerga qo'ying" autocomplete="off" spellcheck="false"><button onclick="const i=$id('aicKey'); i.type=i.type==='password'?'text':'password'">👁</button></div><div class="nd-tip" id="aicHelp">${aiKeyHelp(c.prov)}</div></div>
                <div class="nd-f"><label>MODEL (bo'sh qoldirsangiz — avtomatik)</label><input id="aicModel" value="${escapeHtml(c.model)}" placeholder="${escapeHtml(AI_DEF_MODEL[c.prov])}" autocomplete="off"></div>
                <label class="aic-chk"><input type="checkbox" id="aicWeb" ${c.web !== false ? 'checked' : ''}> 🌐 Google qidiruvi (ob-havo, yangilik, narx, qonunlar — internetdan dolzarb maʼlumot; faqat Gemini)</label>
                <div class="nd-f"><label>JAVOB TEZLIGI</label><select id="aicMode"><option value="auto"${(c.mode || 'auto') === 'auto' ? ' selected' : ''}>⚖️ Avtomatik — oddiy savol tez, murakkabi chuqur</option><option value="fast"${c.mode === 'fast' ? ' selected' : ''}>⚡ Tez — har doim darhol javob</option><option value="deep"${c.mode === 'deep' ? ' selected' : ''}>🧠 Chuqur — har doim oʻylab javob (sekinroq)</option></select></div>
                <!-- v3.0: AI kalitini tarqatish fayliga qo'shish imkoniyati olib tashlandi -->
                <div class="nd-tip" style="margin:-4px 0 10px">⚠️ Kalit faylga shifrlangan holda yoziladi, lekin to'liq himoya emas — faylni faqat o'z xodimlaringizga bering.</div>
                <div class="hr-btns"><button class="action-btn" style="background:#475569" onclick="aiCfgTest()">🔌 Tekshirish</button><button class="action-btn" onclick="aiCfgSave()">💾 Saqlash</button></div>
                <div id="aicRes" class="nd-tip" style="margin-top:8px"></div>` : `<div class="nd-tip">Sozlash faqat administrator uchun.</div>`}
                <div class="aic-priv"><b>🔒 Xodimlar ma'lumotlari himoyasi</b><br>• F.I.Sh., tabel raqami va telefonlar AI'ga yuborilishdan oldin [P1], [T1] kabi belgilarga almashtiriladi, javobda esa telefonning o'zida qayta tiklanadi.<br>• Xodimlar bazasi, parollar, tug'ilgan sana va shaxsiy savollar umuman yuborilmaydi.<br>• Yuboriladi: savol, texnika statistikasi va dastur bazasining shu savolga javobi.</div>
                ${adm ? `<button class="mini-btn" style="margin-top:8px" onclick="aiShowPayload()">👁 AI'ga oxirgi yuborilgan ma'lumotni ko'rish</button><pre id="aicPay" class="aic-pay hidden"></pre>` : ''}
                <button class="action-btn" style="background:#334155; margin-top:10px" onclick="$id('aiCfgModal').classList.add('hidden')">Yopish</button>`;
            $id('aiCfgModal').classList.remove('hidden');
        }
        function aiKeyHelp(p) {
            return p === 'claude' ? "Kalit olish: console.anthropic.com → API Keys → Create Key (hisobni to'ldirish kerak)." : "Kalit olish (bepul): aistudio.google.com → «Get API key» → «Create API key». Google hisobi yetarli, bank kartasi shart emas.";
        }
        function aiCfgRead() { const c = aicGet(); c.on = $id('aicOn').checked; c.prov = $id('aicProv').value; c.key = $id('aicKey').value.trim(); c.model = $id('aicModel').value.trim(); c.share = $id('aicShare').checked; if ($id('aicWeb')) c.web = $id('aicWeb').checked; if ($id('aicMode')) c.mode = $id('aicMode').value; return c; }
        function aiCfgSave() { if (!isAdminReal()) return; const c = aiCfgRead(); if (c.on && !c.key) { alert('API kalitni kiriting.'); return; } if (aicSet(c)) { AIH = []; showToast('💾 AI sozlamasi saqlandi'); openAiCfg(); aiCfgSub(); aisStatus(); } }
        async function aiCfgTest() {
            if (!isAdminReal()) return; const prev = aicGet(), c = aiCfgRead(); if (!c.key) { alert('API kalitni kiriting.'); return; }
            const r = $id('aicRes'); r.innerText = '⏳ Tekshirilmoqda...';
            aicSet(Object.assign({}, c, { on: true }));
            try { const t = await aiCloudCall("Qisqa javob ber.", [{ role: 'user', text: "Salom! Faqat «AI ulandi» deb javob ber." }], { max: 50, timeout: 20000 }); r.innerHTML = '✅ Ulanish ishlayapti. AI javobi: «' + escapeHtml(t.slice(0, 80)) + '»<br>Endi «💾 Saqlash»ni bosing.'; }
            catch (e) { r.innerText = '❌ ' + agmkErrUz(e); }
            const now = aicGet(); prev.model = now.model || prev.model; aicSet(prev);
            if (!$id('aicModel').value && now.model) $id('aicModel').value = now.model;
        }
        function aiShowPayload() { const e = $id('aicPay'); e.classList.toggle('hidden'); e.textContent = AI_LAST_PAYLOAD || "Hali hech narsa yuborilmagan."; }
        // Tarqatish fayli orqali sozlamani ulashish (ixtiyoriy)
        function aiObf(s, dec) { const k = 'AGMK-STTB'; if (dec) { try { s = atob(s); } catch (e) { return ''; } } let o = ''; for (let i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return dec ? o : btoa(o); }
         // v3.0: AI kaliti tarqatish fayliga hech qachon qo'shilmaydi (kalit sizib chiqmasin)
        function aiApplyBundle(b) {
            if (!b || !b.k) return; const c = aicGet(); if (c.key) return; // telefonda o'z kaliti bo'lsa — tegilmaydi
            const key = aiObf(b.k, true); if (!key) return;
            aicSet({ on: !!b.on, prov: b.prov || 'gemini', key: key, model: b.model || '', share: false });
        }

        // ---------- 3D sharcha (AI holati) ----------
        var AIS = { pts: null, edges: null, mode: 'idle', rot: 0.7, speed: 0.5, raf: 0, last: 0, parts: [] };
        function aisGeo() {
            if (AIS.pts) return; const N = 46, P = [], ga = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i; P.push([Math.cos(t) * r, y, Math.sin(t) * r, i % 5 === 2]); }
            const E = new Set(); P.forEach((a, i) => { P.map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2]).filter(x => x[0] !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j]) => E.add(i < j ? i + '-' + j : j + '-' + i)); });
            AIS.pts = P; AIS.edges = Array.from(E).map(s => s.split('-').map(Number));
        }
        function aisDraw(cv, rot, o) {
            if (!cv) return; aisGeo(); o = o || {};
            const dpr = Math.min(window.devicePixelRatio || 1, 3), w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height; if (!w || !h) return;
            if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
            const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
            const big = !!o.big, pulse = o.pulse || 0, cx = w / 2, cy = big ? h * 0.42 : h / 2, R = (big ? h * 0.3 : w * 0.36) * (1 + pulse * 0.05), tilt = 0.38;
            if (big) {
                // taglik halqalari
                const by = cy + R * 1.32;
                if (!o.nobase) for (let k = 3; k >= 1; k--) { x.beginPath(); x.ellipse(cx, by, R * (0.55 + k * 0.28), R * (0.12 + k * 0.06), 0, 0, Math.PI * 2); x.strokeStyle = `rgba(${k === 1 ? '217,70,239' : '56,189,248'},${0.25 + 0.12 * (3 - k) + pulse * 0.2})`; x.lineWidth = 1.2; x.stroke(); }
                if (!o.nobase) { const gb = x.createRadialGradient(cx, by, 1, cx, by, R * 0.9); gb.addColorStop(0, 'rgba(192,132,252,0.55)'); gb.addColorStop(1, 'rgba(192,132,252,0)'); x.fillStyle = gb; x.beginPath(); x.ellipse(cx, by, R * 0.9, R * 0.22, 0, 0, Math.PI * 2); x.fill(); }
                // tepadan ma'lumot oqimi
                (AIS.parts || []).forEach(p => { x.fillStyle = p.c; x.globalAlpha = p.a; x.fillRect(cx + p.x * R * 0.7, p.y * h, 1.4, p.l); }); x.globalAlpha = 1;
            }
            const g = x.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R * 1.25); g.addColorStop(0, 'rgba(56,189,248,0.30)'); g.addColorStop(0.7, 'rgba(79,70,229,0.16)'); g.addColorStop(1, 'rgba(79,70,229,0)');
            x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R * 1.25, 0, Math.PI * 2); x.fill();
            const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
            const S = AIS.pts.map(p => { const X = p[0] * cr + p[2] * sr, Z = -p[0] * sr + p[2] * cr, Y = p[1] * ct - Z * st, Z2 = p[1] * st + Z * ct; return [cx + X * R, cy + Y * R, Z2, p[3]]; });
            x.lineWidth = big ? 1 : 0.8;
            AIS.edges.forEach(([a, b]) => { const d = (S[a][2] + S[b][2]) / 2; x.strokeStyle = `rgba(125,211,252,${0.12 + 0.5 * (d + 1) / 2})`; x.beginPath(); x.moveTo(S[a][0], S[a][1]); x.lineTo(S[b][0], S[b][1]); x.stroke(); });
            S.slice().sort((a, b) => a[2] - b[2]).forEach(p => {
                const f = (p[2] + 1) / 2, r = (big ? 1.2 : 0.7) + f * (big ? 2.2 : 1.3);
                x.shadowBlur = big ? 8 * f : 4 * f; x.shadowColor = p[3] ? '#f0abfc' : '#7dd3fc';
                x.fillStyle = p[3] ? `rgba(240,171,252,${0.35 + 0.65 * f})` : `rgba(186,230,253,${0.3 + 0.7 * f})`;
                x.beginPath(); x.arc(p[0], p[1], r, 0, Math.PI * 2); x.fill();
            });
            x.shadowBlur = 0;
            x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.strokeStyle = `rgba(56,189,248,${0.55 + pulse * 0.3})`; x.lineWidth = big ? 1.6 : 1.2; x.stroke();
        }
        function aisStatus() {
            const e = $id('aiSphSt'); if (!e) return; const c = aicGet();
            if (AIS.mode === 'think') e.innerHTML = '<b>AI o\'ylayapti...</b>';
            else if (c.on && c.key && navigator.onLine !== false) e.innerHTML = '☁️ AI ulangan · ' + escapeHtml(AI_PROV_NAME[c.prov]);
            else e.innerHTML = c.on && c.key ? '📴 Internet yo\'q — mahalliy yordamchi' : '📴 Mahalliy yordamchi (AI ulanmagan)';
        }
        function aisMode(m) { AIS.mode = m; aisStatus(); aisKick(); }
        function aisKick() { if (!AIS.raf && document.body.classList.contains('ai-chat')) { AIS.last = 0; AIS.raf = requestAnimationFrame(aisLoop); } }
        function aisLoop(ts) {
            AIS.raf = 0;
            if (!document.body.classList.contains('ai-chat')) return;
            const dt = AIS.last ? Math.min(0.05, (ts - AIS.last) / 1000) : 0.016; AIS.last = ts;
            const spk = typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking;
            const red = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
            const target = red ? 0.15 : AIS.mode === 'think' ? 3.0 : spk ? 1.3 : 0.55;
            AIS.speed += (target - AIS.speed) * Math.min(1, dt * 3); AIS.rot += AIS.speed * dt;
            const pulse = AIS.mode === 'think' ? (Math.sin(ts / 160) + 1) / 2 : spk ? (Math.sin(ts / 110) + 1) / 2 * 0.8 : (Math.sin(ts / 900) + 1) / 2 * 0.3;
            // zarrachalar
            const want = AIS.mode === 'think' ? 26 : spk ? 14 : 7;
            while (AIS.parts.length < want) AIS.parts.push({ x: (Math.random() * 2 - 1) * 0.9, y: -Math.random() * 0.3, v: 0.25 + Math.random() * 0.45, l: 3 + Math.random() * 7, a: 0.4 + Math.random() * 0.6, c: Math.random() < 0.25 ? '#f0abfc' : '#7dd3fc' });
            AIS.parts.forEach(p => { p.y += p.v * dt * (AIS.mode === 'think' ? 1.8 : 1); }); AIS.parts = AIS.parts.filter(p => p.y < 0.2).slice(0, want);
            aisDraw($id('aiSphBig'), AIS.rot, { big: true, pulse: pulse });
            AIS.raf = requestAnimationFrame(aisLoop);
        }
        function aisInit() {
            const b = $id('aiGlobal');
            if (b && !$id('aiSphSmall')) { b.innerHTML = '<canvas id="aiSphSmall" class="ai-sph-c"></canvas><span class="ai-sph-lbl">AI</span>'; }
            const mc = document.querySelector('#aiChatModal .modal-content');
            if (mc && !$id('aiSphBig')) { const w = document.createElement('div'); w.className = 'ai-sph-wrap'; w.innerHTML = '<canvas id="aiSphBig"></canvas><div class="ai-sph-st" id="aiSphSt"></div>'; mc.insertBefore(w, mc.firstElementChild); }
            const drawSmall = () => aisDraw($id('aiSphSmall'), 0.7, {});
            requestAnimationFrame(drawSmall); setTimeout(drawSmall, 400);
            window.addEventListener('resize', drawSmall);
            try { new MutationObserver(() => { drawSmall(); if (document.body.classList.contains('ai-chat')) { aisStatus(); aisKick(); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
            window.addEventListener('online', aisStatus); window.addEventListener('offline', aisStatus);
            aisStatus();
        }
        aisInit();

