        // =====================================================================
        // 4.9 b113 — Har qanday akt avval QOʻLDA kiritish oynasi bilan ochiladi (muallif, 24.10.2026)
        //  • Akt turlari kartochkasi bosilsa — «✍️ Qoʻlda» oynasi (AI emas). AI — faqat ⋮ ichidagi «🤖 AI yordamida tuzish» bilan.
        //  • Akt oynasidagi «🤖 AI yordamida / ✍️ Qoʻlda (tez)» juft tugmasi yashirildi — oʻtish ⋮ orqali (ikki tomonga).
        //  • Kolodka qabul dalolatnomasi: sarlavhada ⋮ → «🤖 AI yordamida toʻldirish»: bir gap yoziladi (yoki aytiladi),
        //    korxona, soni, marka, standart, sana va familiyalar (shtatdan) maydonlarga oʻzi qoʻyiladi — keyin qoʻlda tekshiriladi.
        //    Tahlil telefonning oʻzida bajariladi, hech narsa tashqariga yuborilmaydi.
        // =====================================================================
        const QO9: any = window as any;
        // ---- Akt oynasi: standart rejim — qoʻlda ----
        if (typeof QO9.dbMode === 'function') QO9.dbMode = function () { try { const N = typeof ND !== 'undefined' ? ND : null; if (N && N.form && N.form.mode) return N.form.mode; } catch (e) { /* */ } return 'man'; };
        if (typeof QO9.hsNewAkt === 'function') QO9.hsNewAkt = QO9.agmkExtend('hsNewAkt', '4.9 b113: yangi akt — qoʻlda', QO9.hsNewAkt, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const N = typeof ND !== 'undefined' ? ND : null; if (N && N.form && !N.form.mode) { N.form.mode = 'man'; if (typeof QO9.ndRender === 'function') QO9.ndRender(); } } catch (e) { console.error(e); }
            return r;
        });
        function qoNdAkt(): boolean { try { const N = typeof ND !== 'undefined' ? ND : null; return !!(N && N.view === 'akt' && N.form && QO9.$id('screen-nd') && QO9.$id('screen-nd').classList.contains('active')); } catch (e) { return false; } }
        if (typeof QO9.h9MoreItems === 'function') QO9.h9MoreItems = QO9.agmkExtend('h9MoreItems', '4.9 b113: ⋮ — AI / qoʻlda', QO9.h9MoreItems, (o: Function) => function (this: unknown, s: any) {
            const L = o.apply(this, arguments) || [];
            try {
                if (qoNdAkt()) {
                    const man = QO9.dbMode() === 'man';
                    L.unshift(man ? { ic: 'ai', t: '🤖 AI yordamida tuzish', fn: () => QO9.dbSetMode('ai'), x: '' } : { ic: 'info', t: '✍️ Qoʻlda kiritish', fn: () => QO9.dbSetMode('man'), x: '' });
                }
            } catch (e) { console.error(e); }
            return L;
        });
        (function () {
            const st = document.createElement('style');
            st.textContent = '#screen-nd .db-mode{display:none!important}'
                + '.kq-mo{margin-left:auto;margin-right:6px}.qo-pop{position:absolute;right:52px;top:44px;z-index:30;min-width:240px;background:#0f1b2d;border:1px solid rgba(125,211,252,.35);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.45);padding:6px}'
                + '.qo-pop button{display:flex;gap:10px;align-items:center;width:100%;background:none;border:0;color:#e2e8f0;font:600 15px/1.2 inherit;padding:12px 12px;border-radius:10px;text-align:left;cursor:pointer}.qo-pop button:active{background:rgba(125,211,252,.12)}'
                + '.qo-ai{margin:10px 0;padding:10px;border:1px solid rgba(168,85,247,.45);border-radius:14px;background:rgba(88,28,135,.18)}.qo-ai textarea{width:100%;min-height:84px;box-sizing:border-box;border-radius:10px;padding:10px;font:15px/1.35 inherit;background:rgba(2,6,23,.55);color:#f1f5f9;border:1px solid rgba(148,163,184,.35)}'
                + '.qo-ai .qo-r{display:flex;gap:8px;margin-top:8px}.qo-ai .qo-r button{flex:1}.qo-ok{margin-top:8px;font-size:13px;color:#bbf7d0}';
            document.head.appendChild(st);
        })();

        // ---- Kolodka qabul dalolatnomasi: ⋮ → AI yordamida toʻldirish ----
        function qoKqPeople(): any[] { try { return typeof kqPeople === 'function' ? kqPeople() : []; } catch (e) { return []; } }
        function qoNorm(s: string): string { return String(s || '').toLowerCase().replace(/[ʻʼ'’‘`]/g, '').replace(/[^a-zа-яёўқғҳ0-9]+/g, ' ').trim(); }
        function qoLatin(s: string): string { try { return typeof kqLat === 'function' ? kqLat(s, true) : s; } catch (e) { return s; } }
        // Matndan maydonlar (faqat aniq topilganlari): korxona, soni, marka, standart, sana, odamlar
        function qoParse(text: string): any {
            const t = String(text || '').replace(/\s+/g, ' ').trim(), o: any = {};
            const so = t.match(/(\d[\d\s]{0,8}\d|\d)\s*(?:dona|ta\b|шт|штук)/i); if (so) o.soni = so[1].replace(/\s/g, '');
            const mk = t.match(/\b[MМ]\s?-?\s?(\d{3})[.,](\d{3})\b/); if (mk) o.marka = 'M' + mk[1] + '.' + mk[2];
            const gs = t.match(/\b(?:GOST|ГОСТ)\s*R?\s*(\d{4,5}-\d{2,4})/i); if (gs) o.gost = 'GOST ' + gs[1];
            const og = t.match(/[«"“]([^»"”]{2,60})[»"”]\s*(MCHJ|МЧЖ|ООО|OOO|AJ|АЖ|XK|ХК|QK|МЧЖ)?/i);
            if (og) o.org = '«' + og[1].trim() + '»' + (og[2] ? ' ' + og[2].toUpperCase().replace('ООО', 'MCHJ').replace('OOO', 'MCHJ').replace('МЧЖ', 'MCHJ') : ' MCHJ');
            else { const m2 = t.match(/([A-ZА-ЯЁ0-9][\w\-’ʻ]*(?:\s+[A-ZА-ЯЁ0-9][\w\-’ʻ]*){0,3})\s+(MCHJ|МЧЖ|ООО|OOO)/); if (m2) o.org = '«' + m2[1].trim() + '» MCHJ'; }
            const dt = t.match(/\b(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})\b/); if (dt) o.sana = dt[3] + '-' + dt[2].padStart(2, '0') + '-' + dt[1].padStart(2, '0');
            else { const OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr|sentyabr', 'oktabr|oktyabr', 'noyabr', 'dekabr'];
                const dm = qoNorm(t).match(new RegExp('\\b(\\d{1,2})\\s*-?\\s*(' + OY.join('|') + ')')); if (dm) { const mi = OY.findIndex(x => new RegExp('^(' + x + ')$').test(dm[2])); const y = (t.match(/\b(20\d{2})\b/) || [])[1] || String(new Date().getFullYear()); if (mi >= 0) o.sana = y + '-' + String(mi + 1).padStart(2, '0') + '-' + dm[1].padStart(2, '0'); } }
            // Familiyalar — shtatdan; «tasdiqla…» soʻzidan keyingi birinchi familiya — tasdiqlovchi
            const P = qoKqPeople(), nt = ' ' + qoNorm(qoLatin(t)) + ' ', found: any[] = [];
            P.forEach((p: any) => { const sur = qoNorm(qoLatin(String(p.name).split(/\s+/)[0] || '')); if (sur.length < 4) return; const i = nt.indexOf(' ' + sur.slice(0, Math.max(4, sur.length - 2))); if (i >= 0 && !found.some(f => f.p.id === p.id)) found.push({ p: p, i: i }); });
            found.sort((a, b) => a.i - b.i);
            const ti = nt.search(/ tasdiql/); let tas: any = null; if (ti >= 0) { const f = found.find(x => x.i > ti); if (f) tas = f; }
            const mk2 = (p: any) => { try { return { l: typeof kqLav === 'function' ? kqLav(p.lav, p.lbl) : p.lav, n: typeof kqShort === 'function' ? kqShort(p.name) : p.name }; } catch (e) { return { l: p.lav, n: p.name }; } };
            if (tas) o.tas = mk2(tas.p);
            const az = found.filter(x => x !== tas).map(x => mk2(x.p)); if (az.length) o.azo = az.slice(0, 8);
            return o;
        }
        function qoKqApply(o: any): string[] {
            const K = typeof KQ !== 'undefined' ? KQ : null; if (!K) return []; const done: string[] = [];
            const set = (k: string, lab: string) => { if (o[k]) { K[k] = o[k]; done.push(lab); } };
            set('org', 'korxona'); set('soni', 'soni'); set('marka', 'marka'); set('gost', 'standart');
            if (o.tas) { K.tas = o.tas; done.push('tasdiqlovchi'); }
            if (o.azo && o.azo.length) { K.azo = o.azo; done.push(o.azo.length + ' ta komissiya aʼzosi'); }
            try { kqSave(); } catch (e) { /* */ }
            // Maydonlarni yangilash (oyna qayta chizilmaydi — kiritilgan boshqa narsalar saqlanadi)
            const box = QO9.$id('kqModal'); if (box) box.querySelectorAll('input[oninput^="kqF("]').forEach((inp: any) => { const m = (inp.getAttribute('oninput') || '').match(/kqF\('(\w+)'/); if (m && o[m[1]] && K[m[1]] !== undefined) inp.value = K[m[1]]; });
            if (o.sana) { const dn = box && box.querySelector('.kq-dn[onchange*="\'sana\'"]'); try { kqDateSet('sana', o.sana, dn); done.push('sana'); } catch (e) { /* */ } }
            try { kqDraw(); } catch (e) { /* */ }
            return done;
        }
        function qoKqAi(): void {
            qoPopClose(); const m = QO9.$id('kqModal'); if (!m) return; let b = QO9.$id('qoAi');
            if (b) { b.remove(); return; }
            const anchor = m.querySelector('.kq-f') || m.querySelector('.px-h'); if (!anchor) return;
            b = document.createElement('div'); b.id = 'qoAi'; b.className = 'qo-ai';
            b.innerHTML = `<b>🤖 AI yordamida toʻldirish</b><div class="nd-tip">Bir gap bilan yozing yoki ayting, masalan: «TOP PROJECT MCHJ dan 2035 dona M659.000 kolodka qabul qilindi, GOST 33421-2015, komissiya: 3 aʼzo, tasdiqlovchi — boshliq». Maydonlar oʻzi toʻldiriladi — keyin tekshirib, kerak boʻlsa tuzatasiz.</div>
                <textarea id="qoAiT" placeholder="Shu yerga yozing…"></textarea>
                <div class="qo-r">${QO9.SpeechRecognition || QO9.webkitSpeechRecognition ? '<button type="button" class="mini-btn" onclick="qoKqMic()">🎙 Aytish</button>' : ''}<button type="button" class="action-btn" onclick="qoKqGo()">✓ Toʻldirish</button></div><div id="qoAiOk" class="qo-ok"></div>`;
            anchor.parentNode.insertBefore(b, anchor);
            setTimeout(() => { const t = QO9.$id('qoAiT'); if (t) t.focus(); }, 50);
        }
        function qoKqGo(): void {
            const t = String((QO9.$id('qoAiT') || {}).value || '').trim(), ok = QO9.$id('qoAiOk'); if (!t) { if (ok) ok.textContent = 'Avval matnni yozing.'; return; }
            const d = qoKqApply(qoParse(t));
            if (ok) ok.textContent = d.length ? '✅ Toʻldirildi: ' + d.join(', ') + '. Pastda tekshiring.' : '⚠️ Matndan maʼlumot topilmadi — maydonlarni qoʻlda toʻldiring.';
        }
        function qoKqMic(): void {
            try { const R = QO9.SpeechRecognition || QO9.webkitSpeechRecognition; if (!R) return; const r = new R(); r.lang = 'uz-UZ'; r.interimResults = false;
                r.onresult = (e: any) => { const s = Array.from(e.results).map((x: any) => x[0].transcript).join(' '); const t = QO9.$id('qoAiT'); if (t) t.value = (t.value ? t.value + ' ' : '') + s; };
                r.start(); } catch (e) { console.error(e); }
        }
        function qoPopClose(): void { const p = QO9.$id('qoPop'); if (p) p.remove(); }
        function qoKqMore(ev: any): void {
            if (ev) ev.stopPropagation(); const ex = QO9.$id('qoPop'); if (ex) { ex.remove(); return; }
            const m = QO9.$id('kqModal'), h = m && m.querySelector('.px-h'); if (!h) return;
            const p = document.createElement('div'); p.id = 'qoPop'; p.className = 'qo-pop';
            p.innerHTML = `<button type="button" onclick="qoKqAi()">🤖 <span>AI yordamida toʻldirish</span></button><button type="button" onclick="qoPopClose();kqOut('docx')">📝 <span>Word</span></button><button type="button" onclick="qoPopClose();kqOut('pdf')">📄 <span>PDF</span></button><button type="button" onclick="qoPopClose();kqSign()">✍️ <span>Imzoga yuborish</span></button>`;
            h.style.position = 'relative'; h.appendChild(p);
            setTimeout(() => document.addEventListener('click', qoPopClose, { once: true }), 0);
        }
        Object.assign(QO9, { qoKqAi: qoKqAi, qoKqGo: qoKqGo, qoKqMic: qoKqMic, qoKqMore: qoKqMore, qoPopClose: qoPopClose, qoParse: qoParse });
        if (typeof QO9.kqOpen === 'function') QO9.kqOpen = QO9.agmkExtend('kqOpen', '4.9 b113: kolodka — ⋮ (AI yordamida toʻldirish)', QO9.kqOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const h = document.querySelector('#kqModal .px-h'); if (h && !h.querySelector('.kq-mo')) { const x = h.querySelector('.mini-btn'); const b = document.createElement('button'); b.className = 'mini-btn kq-mo'; b.type = 'button'; b.title = 'Boshqa amallar'; b.textContent = '⋮'; b.onclick = qoKqMore; if (x) h.insertBefore(b, x); else h.appendChild(b); } } catch (e) { console.error(e); }
            return r;
        });

        // ---- 4.9 b114: «Orqaga» — akt qayerdan ochilgan boʻlsa, oʻsha joyga (Dalolatnomalar → akt → ‹ → Dalolatnomalar) ----
        //  Avval: akt oynasidan ‹ bosilsa «Normativ hujjatlar» bosh sahifasiga oʻtib ketardi (ND.view → 'home').
        function qoNd(): any { try { return typeof ND !== 'undefined' ? ND : null; } catch (e) { return null; } }
        if (typeof QO9.openND === 'function') QO9.openND = QO9.agmkExtend('openND', '4.9 b114: kelgan joy — tozalash', QO9.openND, (o: Function) => function (this: unknown) { const N = qoNd(); if (N) N.from = null; return o.apply(this, arguments); });
        ['hsNewAkt', 'hsOpenAkt'].forEach(k => { if (typeof QO9[k] === 'function') QO9[k] = QO9.agmkExtend(k, '4.9 b114: kelgan joy — Dalolatnomalar', QO9[k], (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); const N = qoNd(); if (N) N.from = { s: 'hisob', akt: QO9.HS ? QO9.HS.akt : null, tab: QO9.HS ? QO9.HS.tab : 'akt' }; return r; }); });
        if (typeof QO9.ndGoBack === 'function') QO9.ndGoBack = QO9.agmkExtend('ndGoBack', '4.9 b114: orqaga — kelgan joyga', QO9.ndGoBack, (o: Function) => function (this: unknown) {
            const N = qoNd();
            if (N && N.from && N.from.s === 'hisob' && N.view !== 'home' && typeof QO9.openHisob === 'function') {
                const f = N.from; N.from = null; N.view = 'home';
                try { if (QO9.HS) { QO9.HS.akt = f.akt; QO9.HS.keep = 1; } QO9.openHisob(f.tab || 'akt'); } catch (e) { console.error(e); return o.apply(this, arguments); }
                return;
            }
            return o.apply(this, arguments);
        });
