        // =====================================================================
        // v3.7.0
        //  0) Qora ekran: Android ilovani orqada yopsa — qaytganda oxirgi boʻlim qayta ochiladi (sahifa boshidan yuklanadi — APK)
        //  1) Hisobotlar: barcha STTB texnikalari uchun Forma-30 / tekshiruv
        //  2) Har sahifa: ⓘ qoʻllanma → ⚙️ sozlama (rang, shaffoflik, shrift, yuqori va pastki fon rasmi);
        //     kartochkani 3 soniya bosib turish → shu kartochkaning sozlamasi. Faqat shu xodim, shu telefon
        //  3) ✍️ Imzolash bosh sahifada doim: «🆕 Yangi (+N)» va «📜 Tarix»; imzo: namuna / 📷 kamera / ✍️ chizish; PIN bilan tasdiq
        //  4–6) MM: kiritilmaganlar turi boʻyicha, tibbiy koʻrik Exceldan, tuzatish — bitta forma, «xodim» bosiladi, moslash takliflari
        // =====================================================================

        // ---------------- 0) Oxirgi boʻlimni tiklash ----------------
        var RSM = { key: 'agmk_resume', done: false };
        function rsmSave(mn) { try { if (mn) localStorage.setItem(RSM.key, JSON.stringify({ mn: mn, at: Date.now(), t: meTabel() })); else localStorage.removeItem(RSM.key); } catch (e) {} }
        document.addEventListener('click', e => {
            try { const c = e.target.closest && e.target.closest('.btn-card[data-mn]'); if (c && c.closest('#main-card-list, #screen-grp')) rsmSave(c.dataset.mn); } catch (x) {}
        }, true);
        if (typeof openScreen === 'function') openScreen = agmkExtend('openScreen', 'v3.7: oxirgi boʻlim eslab qolinadi', openScreen, o => function (id) { const r = o.apply(this, arguments); if (id === 'screen-main' && RSM.done) rsmSave(''); return r; });
        function rsmRestore() {
            if (RSM.done) return; RSM.done = true;
            let s = null; try { s = JSON.parse(localStorage.getItem(RSM.key) || 'null'); } catch (e) {}
            if (!s || !s.mn || Date.now() - s.at > 30 * 60000 || s.t !== meTabel()) return;
            const c = document.querySelector('#main-card-list .btn-card[data-mn="' + String(s.mn).replace(/"/g, '') + '"]');
            if (c && typeof c.onclick === 'function') { try { c.onclick(); } catch (e) {} }
            else if (c) { try { c.click(); } catch (e) {} }
        }
        if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.7: oxirgi boʻlim tiklanadi', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(() => { try { rsmRestore(); } catch (e) {} }, 900); return r; });

        // ---------------- 1) Hisobotlar — barcha STTB texnikalari ----------------
        (function () {
            if (typeof HS_CATS === 'undefined') return;
            const L = [{ k: 'tep', ic: '🚂', t: 'Teplovozlar' }, { k: 'elv', ic: '⚡', t: 'Elektrovozlar' }, { k: 'vagon', ic: '🚃', t: 'Vagonlar va dumpkarlar' },
                { k: 'yol', ic: '🛤', t: 'Yoʻl qurilish texnikasi' }, { k: 'avto', ic: '🚗', t: 'Avtotraktor (avtopark)' }, { k: 'eks', ic: '🚜', t: 'Ekskavator va buldozerlar' },
                { k: 'kran', ic: '🏗', t: 'Kranlar va maxsus texnika' }];
            HS_CATS.splice(0, HS_CATS.length, ...L);
        })();

        // ---------------- 2) Sahifa va kartochka sozlamalari ----------------
        var UI_CARDS = '.btn-card,.hs-card,.vagon-card,.stat-box,.mm-card,.mm-row,.hr-card,.nd-doc,.sg-doc,.ops-it,.hs-box,.hs-row,.mm-sum>i';
        var UI = { url: {}, st: null, lp: 0, eat: 0, edit: null, bak: null };
        function uiKey() { return 'agmk_ui1_' + (meTabel() || '0'); }
        function uiData() { try { const d = JSON.parse(localStorage.getItem(uiKey()) || 'null') || {}; d.p = d.p || {}; d.c = d.c || {}; return d; } catch (e) { return { p: {}, c: {} }; } }
        function uiSave(d) { try { localStorage.setItem(uiKey(), JSON.stringify(d)); } catch (e) { alert('⚠️ Xotira toʻldi — sozlama saqlanmadi.'); } }
        function uiHash(s) { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'c' + (h >>> 0).toString(36); }
        function uiScr() { return document.querySelector('.screen.active'); }
        function uiPageKey(s) { s = s || uiScr(); if (!s) return ''; return s.id === 'screen-grp' && s.dataset.g ? 'screen-grp:' + s.dataset.g : s.id; }
        function uiPageSel(k) { const m = /^screen-grp:(.+)$/.exec(k); return m ? '#screen-grp[data-g="' + m[1] + '"]' : '#' + k; }
        function uiParts(s) { const k = Array.from(s.children).filter(c => c.tagName === 'DIV' && !c.classList.contains('fab-btn')); return k.length >= 2 ? { head: k[0], body: k[1] } : { head: null, body: k[0] || null }; }
        function uiMark(s) { const p = uiParts(s); if (p.head) p.head.classList.add('ui-head'); if (p.body) p.body.classList.add('ui-body'); return p; }
        function uiCardKey(el) { const s = el.closest('.screen'); return uiPageKey(s) + '|' + (el.id || el.dataset.mn || el.dataset.sec || (el.getAttribute('onclick') || '').slice(0, 90) || (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)); }
        function uiRgb(h) { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return [15, 23, 42]; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
        function uiBox(P) { // kartochka uslubi (sahifa yoki bitta kartochka uchun)
            let c = '';
            if (P.bg || P.a != null) { const [r, g, b] = uiRgb(P.bg || '#0f172a'), a = P.a == null ? 0.78 : Math.max(0.03, 1 - P.a / 100); c += `background-color:rgba(${r},${g},${b},${a.toFixed(2)}) !important;background-image:none !important;`; }
            if (P.fw) c += `font-weight:${P.fw} !important;`;
            if (P.fc) c += `color:${P.fc} !important;`;
            if (P.sh) c += 'text-shadow:0 1px 3px rgba(0,0,0,.95),0 0 2px rgba(0,0,0,.8) !important;';
            return c;
        }
        function uiTxt(sel, P) { // shrift rangi ichki matnlarga (holat ranglari — qizil/sariq/yashil — saqlanadi)
            if (!P.fc) return '';
            return `${sel} :is(b,span,small,td,th,p,label,h3,h4,div):not(.bad,.bad *,.warn,.warn *,.ok,.ok *,.red,.red *,.hs-r,.hs-b,.sg-badge,.mn-cnt,.chat-cnt,.warn-count){color:${P.fc} !important}`;
        }
        async function uiImgUrl(ref) { if (!ref) return ''; if (UI.url[ref]) return UI.url[ref]; try { const b = await mediaGetBlob(ref); if (b) { UI.url[ref] = URL.createObjectURL(b); return UI.url[ref]; } } catch (e) {} return ''; }
        async function uiApply() {
            const d = uiData(); let css = '';
            for (const k of Object.keys(d.p)) {
                const P = d.p[k] || {}, S = uiPageSel(k), box = uiBox(P);
                if (box) css += `${S} .ui-body :is(${UI_CARDS}),${S} .ui-body table{${box}}`;
                css += uiTxt(`${S} .ui-body :is(${UI_CARDS})`, P) + uiTxt(`${S} .ui-body table`, P);
                if (P.fs && P.fs !== 100) css += `${S} .ui-body{zoom:${(P.fs / 100).toFixed(2)}}`;
                if (P.sh) css += `${S} .ui-body{text-shadow:0 1px 3px rgba(0,0,0,.95)}`;
                if (P.hi) { const u = await uiImgUrl(P.hi); if (u) css += `${S} > .ui-head{background-image:url("${u}") !important;background-size:cover !important;background-position:center !important}`; }
                if (P.bi) { const u = await uiImgUrl(P.bi); if (u) css += `${S} > .ui-body{background-image:url("${u}") !important;background-size:cover !important;background-position:center !important;background-attachment:local}`; }
            }
            Object.keys(d.c).forEach(k => { const P = d.c[k] || {}, h = uiHash(k), S = uiPageSel(k.split('|')[0]) + ' .ui-body [data-uic="' + h + '"][data-uic]', box = uiBox(P); if (box) css += `${S}{${box}}`; css += uiTxt(S, P); if (P.fs && P.fs !== 100) css += `${S}{zoom:${(P.fs / 100).toFixed(2)}}`; });
            let st = $id('uiStyle'); if (!st) { st = document.createElement('style'); st.id = 'uiStyle'; document.head.appendChild(st); } st.textContent = css;
            uiMarkCards();
        }
        function uiMarkCards() {
            const s = uiScr(); if (!s) return; uiMark(s); uiHelpEnsure(s); if (s.id === 'screen-main') uiMainPos();
            const d = uiData(), pk = uiPageKey(s), has = Object.keys(d.c).some(k => k.startsWith(pk + '|'));
            s.querySelectorAll('[data-uic]').forEach(el => { if (!has || !d.c[uiCardKey(el)]) el.removeAttribute('data-uic'); });
            if (!has) return;
            s.querySelectorAll(UI_CARDS).forEach(el => { const k = uiCardKey(el); if (d.c[k]) el.dataset.uic = uiHash(k); });
        }
        (function () {
            let t = 0; const run = () => { t = 0; try { uiMarkCards(); } catch (e) {} };
            try { new MutationObserver(ms => { if (t) return; if (ms.every(m => m.target && m.target.closest && (m.target.closest('.leaflet-container') || m.target.closest('.modal-overlay')))) return; t = setTimeout(run, 250); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
            if (typeof openScreen === 'function') openScreen = agmkExtend('openScreen', 'v3.7: sahifa sozlamalari', openScreen, o => function () { const r = o.apply(this, arguments); setTimeout(run, 30); return r; });
            if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.7: sahifa sozlamalari (hisob)', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(() => { uiApply(); }, 300); return r; });
            setTimeout(() => { try { uiApply(); } catch (e) {} }, 1200);
        })();
        // ⓘ — har sahifa tepasida
        function uiHelpEnsure(s) {
            if (!s || s.querySelector('.ui-i')) return;
            const b = document.createElement('button'); b.type = 'button'; b.className = 'ui-i'; b.title = 'Qoʻllanma va sozlama'; b.textContent = 'ⓘ';
            b.onclick = e => { e.stopPropagation(); uiHelpOpen(); };
            if (s.id === 'screen-main') { const h = s.querySelector(':scope > div'); if (h) { b.classList.add('ui-i-main'); h.appendChild(b); setTimeout(uiMainPos, 50); } return; }
            const ih = s.querySelector('.inner-header');
            if (ih) { const sp = ih.lastElementChild; if (sp && !sp.children.length && !sp.textContent.trim() && sp.tagName === 'DIV') { sp.style.display = 'flex'; sp.style.justifyContent = 'flex-end'; sp.appendChild(b); } else ih.appendChild(b); return; }
            const p = uiParts(s); if (p.body) { b.classList.add('ui-i-fl'); p.body.style.position = p.body.style.position || 'relative'; p.body.insertBefore(b, p.body.firstChild); }
        }
        // bosh sahifada ⓘ — chap ustundagi tugmalar ostida
        function uiMainPos() {
            const b = document.querySelector('#screen-main .ui-i-main'); if (!b) return; const h = b.parentNode, hr = h.getBoundingClientRect(); if (!hr.height) return;
            const L = Array.from(h.querySelectorAll('button, .chat-top, [id$="Btn"], div[onclick]')).filter(e => e !== b && !e.contains(b)).map(e => ({ e: e, r: e.getBoundingClientRect() })).filter(x => x.r.width > 20 && x.r.width < 90 && x.r.height < 90 && x.r.left - hr.left < 90 && x.r.bottom <= hr.bottom);
            const bot = L.reduce((m, x) => Math.max(m, x.r.bottom), 0), lf = L.length ? Math.min(...L.map(x => x.r.left)) : hr.left + 14, w = L.length ? Math.max(...L.map(x => x.r.width)) : 34;
            const op = (b.offsetParent || document.body).getBoundingClientRect(), top = (bot || hr.top + 150) + 10;
            if (top + 34 > hr.bottom) { b.style.top = ''; b.style.left = ''; return; }
            b.style.top = (top - op.top) + 'px'; b.style.left = (lf + (w - 34) / 2 - op.left) + 'px'; b.style.bottom = 'auto';
        }
        window.addEventListener('resize', () => setTimeout(uiMainPos, 150));
        var UI_HELP = {
            'screen-main': ['🏠 Bosh sahifa', `<ul><li><b>Boʻlimlar</b> — kartochkani bosing. «N boʻlim» yozilgan kartochka ichida alohida sahifa ochiladi.</li><li><b>Chap tepada</b>: 💬 yozishmalar (oʻqilmagan xabarlar soni), 📋 «Mening ishlarim» (bajarilishi kerak boʻlgan ishlar), ❗ nosozlik xabari.</li><li><b>Oʻng tepada</b>: 🔔 tizim bildirishnomalari (imzo, eslatma, zamechaniya), ⋮ menyu. 🔍 qidiruv va 🎤 ovozli buyruq.</li><li><b>✍️ Imzolash</b> doim eng tepada: yangi hujjat kelsa «+N» chiqadi.</li></ul>`],
            'screen-grp': ['📂 Guruh sahifasi', '<p>Guruhga kiradigan boʻlimlar va har birida nechta yozuv borligi. Kartochkani bosing — boʻlim ochiladi; u yerdan «Orqaga» — shu sahifaga qaytadi.</p>'],
            'screen-hisob': ['📊 Dalolatnoma va hisobotlar', '<ul><li><b>Dalolatnomalar</b> — akt turlari, yangi akt (AI yoki qoʻlda), arxiv.</li><li><b>Hisobotlar</b> — har bir texnika guruhi uchun Forma-30 yuklanadi va oylik hisobot (achot) tekshiriladi: xato — fayldagi qator raqami bilan.</li><li><b>Haftalik achot</b> — haftalik hisobotlar.</li></ul><p>Batafsil: boʻlim ichidagi kichik ℹ️ tugmalar.</p>'],
            'screen-mm': ['🦺 Mehnat muhofazasi', '<ul><li><b>Nazorat</b> — har xodimda yoʻl-yoʻriq (faqat ishchilar), bilim sinovi va tibbiy koʻrik muddatlari. Yuqoridagi raqamlarni bosing — roʻyxat filtrlanadi; «kiritilmagan» turi boʻyicha ajratib koʻrsatiladi.</li><li><b>Bilim sinovi</b> — 7 tur, natija va imzolar, Excel import, «🔗 Roʻyxatda yoʻq» — moslash.</li><li><b>Jurnal</b>, <b>Yoʻriqnomalar</b>, <b>Hujjatlar</b>.</li></ul>'],
            'screen-chat': ['💬 Yozishmalar', '<ul><li>Xodimni qidiring yoki suhbatni bosing. Suhbat ochilganda xabarlar oʻqilgan hisoblanadi.</li><li>📎 fayl, 🎤 ovoz, hujjat yuborish mumkin. Server ulanganda xabar ilova ichida yetib boradi; boʻlmasa — Telegram/pochta.</li></ul>'],
            'screen-vagonlar': ['🚃 Vagonlar', '<ul><li>Yuqorida — tur boʻyicha yorliqlar, holat filtri va qidiruv (raqamni boʻlaklab yozish mumkin).</li><li>Kartochkani bosing — pasport: taʼmir, rasm/albom, eslatmalar, akt.</li><li>➕ — yangi vagon (huquq boʻlsa).</li></ul>'],
            'screen-lok': ['🚂 Lokomotivlar', '<p>Teplovoz va elektrovozlar: holat, taʼmir rejasi, pasport. Kartochkani bosing — pasport ochiladi.</p>'],
            'screen-avto': ['🚗 Avtotraktor texnikasi', '<p>Turkum boʻyicha roʻyxat, navigator (GPS), pasport va taʼmir.</p>'],
            'screen-yol': ['🛤 Yoʻl qurilish texnikasi', '<p>Yoʻl texnikasi va kranlar roʻyxati, pasport va taʼmir.</p>'],
            'screen-map': ['🗺 Temir yoʻl xaritasi', '<p>Sxema va sputnik/OSM xarita, stansiyalar, tarkiblar harakati (GPS).</p>'],
            'screen-fot': ['📊 ФОТ tahlili', '<p>Shablon va 6203 fayllarini yuklang — ilova toʻlov turlarini kerakli kataklarga yozadi, 6203 bilan nazorat qiladi va notoʻgʻri schyotlar boʻyicha spravka chiqaradi.</p>'],
            'screen-mtih': ['👷 Mehnat va ish haqi', '<p>Naryadlar, normalar, tarif va shablonlar. Naryad faylini yuklang — ilova norma va tarif boʻyicha tekshiradi.</p>'],
            'screen-bux': ['💰 Buxgalteriya va iqtisodiyot', '<p>Buxgalteriya hujjatlari, ФОТ tahlili va iqtisodiy hisob-kitoblar (faqat vakolatli xodimlar).</p>'],
            'screen-mttb': ['📦 MTTB', '<p>Moddiy-texnik taʼminot: kirim, berish, qoldiq va ehtiyot qismlar.</p>'],
            'screen-mash': ['🚂 Mashinistlar', '<p>Smena, yoqilgʻi, nosozlik va harakat maʼlumotlari.</p>'],
            'screen-settings': ['⚙️ Parametrlar', '<p>Dizayn mavzusi, umumiy shaffoflik, xavfsizlik, server va zaxira. Bitta sahifani alohida sozlash uchun — oʻsha sahifadagi ⓘ → ⚙️.</p>']
        };
        function uiHelpOpen() {
            const s = uiScr(); if (!s) return; const k = uiPageKey(s), base = k.split(':')[0], H = UI_HELP[base], E = escapeHtml;
            const title = H ? H[0] : (((s.querySelector('.inner-header h2') || {}).textContent || 'Sahifa').trim());
            let body = H ? H[1] : '';
            if (!body) {
                const tabs = Array.from(s.querySelectorAll('.sec-tabs i, .tabs .tab')).map(x => x.textContent.trim()).filter(Boolean).slice(0, 10);
                const cards = Array.from(s.querySelectorAll('.ui-body :is(.btn-card,.hs-card) :is(.btn-text,span,b)')).map(x => x.textContent.trim()).filter(Boolean).slice(0, 10);
                body = (tabs.length ? '<p><b>Yorliqlar:</b> ' + tabs.map(E).join(' · ') + '</p>' : '') + (cards.length ? '<p><b>Boʻlimlar:</b> ' + Array.from(new Set(cards)).map(E).join(' · ') + '</p>' : '') + '<p>Kerakli joyni bosing. «‹ Orqaga» — oldingi sahifaga.</p>';
            }
            body += `<div class="ui-tip">⚙️ <b>Shu sahifani oʻzingizga moslang</b> — tepadagi ⚙️ tugmasi: kartochka rangi, shaffoflik, shrift, yuqori va pastki fon rasmi. <br>🖐 Bitta kartochkani alohida sozlash — uni <b>3 soniya bosib turing</b>.<br>Sozlama faqat shu sahifaga va faqat sizga taʼsir qiladi.</div>`;
            mdl('uiHelp', `<div class="px-h"><b>ⓘ ${E(title)}</b><span><button class="mini-btn" title="Sahifa sozlamasi" onclick="mdlClose('uiHelp'); uiSetOpen('p')">⚙️</button> <button class="mini-btn" onclick="mdlClose('uiHelp')">✕</button></span></div><div class="help-body">${body}</div>`, true);
        }
        var UI_BG = ['#0f172a', '#1e293b', '#000000', '#1e3a8a', '#0e7490', '#14532d', '#7f1d1d', '#78350f', '#4c1d95', '#334155', '#ffffff', '#f1f5f9'];
        var UI_FC = ['#ffffff', '#f8fafc', '#fde047', '#22d3ee', '#86efac', '#fca5a5', '#000000', '#1e293b'];
        // t: 'p' — sahifa, 'c' — kartochka (UI.cardKey)
        function uiSetOpen(t, cardKey) {
            const d = uiData(), s = uiScr(), pk = uiPageKey(s); if (!pk) return;
            const key = t === 'c' ? cardKey : pk, src = t === 'c' ? d.c : d.p;
            UI.edit = { t: t, key: key }; UI.bak = JSON.parse(JSON.stringify(src[key] || {}));
            const P = src[key] || {}, E = escapeHtml, a = P.a == null ? 22 : P.a, fs = P.fs || 100;
            const sw = (L, cur, fn) => L.map(c => `<i class="ui-sw${cur === c ? ' on' : ''}" style="background:${c}" onclick="${fn}('${c}')"></i>`).join('');
            const nm = t === 'c' ? ('«' + E((cardKey.split('|')[1] || '').replace(/^.*?\(|\).*$/g, '').slice(0, 30)) + '» kartochkasi') : 'shu sahifa';
            mdl('uiSet', `<div class="px-h"><b>⚙️ Sozlama — ${t === 'c' ? 'kartochka' : 'sahifa'}</b><button class="mini-btn" onclick="uiSetCancel()">✕</button></div>
                <div class="nd-tip">Oʻzgarish darhol koʻrinadi. Faqat ${nm} uchun, faqat sizda.</div>
                <div class="ui-lbl">🎨 Kartochka rangi</div><div class="ui-sws">${sw(UI_BG, P.bg, 'uiSetBg')}<label class="ui-sw ui-pick" title="Boshqa rang">＋<input type="color" value="${E(P.bg || '#0f172a')}" oninput="uiSetBg(this.value)"></label></div>
                <div class="ui-lbl">🪟 Shaffoflik: <b id="uiAv">${a}%</b></div><div class="ca-row"><span>Toʻq</span><input type="range" min="0" max="95" step="5" value="${a}" oninput="$id('uiAv').textContent=this.value+'%'; uiSetV('a', +this.value)"><span>Shaffof</span></div>
                <div class="ui-lbl">🔠 Shrift oʻlchami: <b id="uiFv">${fs}%</b></div><div class="ca-row"><span>A</span><input type="range" min="80" max="150" step="5" value="${fs}" oninput="$id('uiFv').textContent=this.value+'%'; uiSetV('fs', +this.value)"><span style="font-size:18px">A</span></div>
                <div class="ui-lbl">✒️ Shrift</div><div class="ui-row"><button class="${!P.fw ? 'on' : ''}" onclick="uiSetV('fw', 0, this)">Oddiy</button><button class="${P.fw === 600 ? 'on' : ''}" onclick="uiSetV('fw', 600, this)">Qalin</button><button class="${P.fw === 800 ? 'on' : ''}" onclick="uiSetV('fw', 800, this)">Juda qalin</button><button class="${P.sh ? 'on' : ''}" onclick="uiSetV('sh', !(uiCur().sh), this, 1)">🌑 Soya</button></div>
                <div class="ui-lbl">🖋 Shrift rangi</div><div class="ui-sws"><i class="ui-sw ui-def${!P.fc ? ' on' : ''}" onclick="uiSetV('fc', '')">↺</i>${sw(UI_FC, P.fc, 'uiSetFc')}<label class="ui-sw ui-pick" title="Boshqa rang">＋<input type="color" value="${E(P.fc || '#ffffff')}" oninput="uiSetFc(this.value)"></label></div>
                ${t === 'p' ? `<div class="ui-lbl">🖼 Fon rasmlari (shu sahifa)</div>
                <div class="ui-img"><label class="mini-btn">⬆️ Yuqori fon (sarlavha)<input type="file" accept="image/*" style="display:none" onchange="uiSetImg('hi', this)"></label>${P.hi ? '<button class="mini-btn" onclick="uiSetV(\'hi\', \'\')">✖ olib tashlash</button>' : ''}</div>
                <div class="ui-img"><label class="mini-btn">⬇️ Pastki fon (sahifa orqasi)<input type="file" accept="image/*" style="display:none" onchange="uiSetImg('bi', this)"></label>${P.bi ? '<button class="mini-btn" onclick="uiSetV(\'bi\', \'\')">✖ olib tashlash</button>' : ''}</div>` : ''}
                <div class="pk-btns"><button onclick="uiSetReset()">↺ Standart</button><button onclick="uiSetCancel()">Bekor</button><button class="pr" onclick="uiSetOk()">💾 Saqlash</button></div>`, true);
        }
        function uiCur() { const d = uiData(), e = UI.edit; return e ? ((e.t === 'c' ? d.c : d.p)[e.key] || {}) : {}; }
        function uiPut(fn) { const d = uiData(), e = UI.edit; if (!e) return; const src = e.t === 'c' ? d.c : d.p; const P = src[e.key] = src[e.key] || {}; fn(P); Object.keys(P).forEach(k => { if (P[k] === '' || P[k] === null || P[k] === undefined || P[k] === false || (P[k] === 0 && k !== 'a')) delete P[k]; }); if (!Object.keys(P).length) delete src[e.key]; uiSave(d); uiApply(); }
        function uiSetV(k, v, btn, tog) { uiPut(P => { P[k] = v; }); if (btn) { const r = btn.parentNode; if (!tog) r.querySelectorAll('button').forEach(b => { if (!/Soya/.test(b.textContent)) b.classList.remove('on'); }); btn.classList.toggle('on', tog ? !!v : true); } if (k === 'hi' || k === 'bi') uiSetOpen(UI.edit.t, UI.edit.key); }
        function uiSetBg(c) { uiPut(P => { P.bg = c; if (P.a == null) P.a = 22; }); document.querySelectorAll('#uiSet .ui-sws')[0].querySelectorAll('.ui-sw').forEach(x => x.classList.toggle('on', x.style.background && x.getAttribute('onclick') === `uiSetBg('${c}')`)); }
        function uiSetFc(c) { uiPut(P => { P.fc = c; }); }
        async function uiSetImg(k, inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return;
            try {
                const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Rasm ochilmadi')); i.src = URL.createObjectURL(f); });
                const mx = 1600, sc = Math.min(1, mx / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
                const ref = 'uibg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
                await mediaSave(ref, blob, { id: ref, at: new Date().toISOString(), size: blob.size, name: f.name, mime: 'image/jpeg', ui: true }); try { mediaKeep(ref); } catch (e) {}
                uiPut(P => { P[k] = ref; }); uiSetOpen(UI.edit.t, UI.edit.key); showToast('🖼 Fon rasmi qoʻyildi');
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        }
        function uiSetReset() { uiPut(P => { Object.keys(P).forEach(k => delete P[k]); }); uiSetOpen(UI.edit.t, UI.edit.key); showToast('↺ Standart holat'); }
        function uiSetCancel() { const e = UI.edit; if (e) { const d = uiData(), src = e.t === 'c' ? d.c : d.p; if (UI.bak && Object.keys(UI.bak).length) src[e.key] = UI.bak; else delete src[e.key]; uiSave(d); uiApply(); } UI.edit = null; mdlClose('uiSet'); }
        function uiSetOk() { UI.edit = null; mdlClose('uiSet'); showToast('✅ Saqlandi — faqat shu ' + 'sahifa/kartochka uchun'); }
        // 🖐 kartochkani 3 soniya bosib turish
        (function () {
            let st = null;
            const cancel = () => { if (st) { clearTimeout(st.t); if (st.el) st.el.classList.remove('ui-lp-wait'); } st = null; };
            document.addEventListener('pointerdown', e => {
                cancel(); const el = e.target.closest && e.target.closest(UI_CARDS); if (!el || !el.closest('.screen.active') || el.closest('.modal-overlay')) return;
                st = { el: el, x: e.clientX, y: e.clientY, t: setTimeout(() => { const x = st && st.el; st = null; if (!x) return; x.classList.remove('ui-lp-wait'); UI.eat = Date.now(); try { if (window.AgmkNative && AgmkNative.vibrate) AgmkNative.vibrate(60); else if (navigator.vibrate) navigator.vibrate(60); } catch (e) {} x.classList.add('ui-lp'); setTimeout(() => x.classList.remove('ui-lp'), 600); uiSetOpen('c', uiCardKey(x)); }, 3000) };
                setTimeout(() => { if (st && st.el === el) el.classList.add('ui-lp-wait'); }, 900);
            }, true);
            document.addEventListener('pointermove', e => { if (st && (Math.abs(e.clientX - st.x) > 12 || Math.abs(e.clientY - st.y) > 12)) cancel(); }, true);
            ['pointerup', 'pointercancel', 'scroll'].forEach(n => document.addEventListener(n, cancel, true));
            document.addEventListener('click', e => { if (UI.eat && Date.now() - UI.eat < 1500) { UI.eat = 0; e.stopPropagation(); e.preventDefault(); } }, true);
            document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest(UI_CARDS)) e.preventDefault(); }, true);
        })();
        (function () {
            const st = document.createElement('style');
            st.textContent = `.ui-i{width:34px;height:34px;border-radius:50%;border:1.5px solid rgba(148,163,184,.6);background:rgba(15,23,42,.7);color:#e2e8f0;font:700 18px/30px system-ui;padding:0;cursor:pointer;flex:0 0 auto}
                .ui-i-main{position:absolute;left:14px;top:150px;z-index:5}.ui-i-fl{position:absolute;right:8px;top:6px;z-index:5}
                .ui-lbl{margin:12px 0 6px;font-size:13px;color:#cbd5e1}.ui-sws{display:flex;flex-wrap:wrap;gap:8px}.ui-sw{width:32px;height:32px;border-radius:50%;border:2px solid #475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#e2e8f0;font-style:normal;position:relative}
                .ui-sw.on{box-shadow:0 0 0 3px #38bdf8;border-color:#fff}.ui-pick{background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)}.ui-pick input{position:absolute;inset:0;opacity:0;width:100%;height:100%}.ui-def{background:#1e293b}
                .ui-row{display:flex;flex-wrap:wrap;gap:6px}.ui-row button{padding:8px 11px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-size:13px}.ui-row button.on{border-color:#38bdf8;background:rgba(56,189,248,.2)}
                .ui-img{display:flex;gap:8px;margin:6px 0;flex-wrap:wrap}.ui-tip{margin-top:12px;padding:10px;border-radius:10px;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.4);font-size:13px}
                .ui-lp-wait{transition:transform 2s ease;transform:scale(.97)}.ui-lp{animation:uiShake .5s}@keyframes uiShake{0%,100%{transform:none}25%{transform:rotate(-1.5deg)}75%{transform:rotate(1.5deg)}}
                .sg-tabs button b{color:#fca5a5}`;
            document.head.appendChild(st);
        })();

        // ---------------- 3) ✍️ Imzolash — doim, «+N», yangi / tarix ----------------
        function sigCacheKey() { return 'agmk_sig_cache_' + (meTabel() || '0'); }
        function sigCacheGet() { try { return JSON.parse(localStorage.getItem(sigCacheKey()) || '[]') || []; } catch (e) { return []; } }
        function sigWaitOf(L, me) { return (L || []).filter(d => d.status === 'open' && (d.signers || []).some(x => cleanTabel(x.tabel) === me && x.state === 'wait')); }
        if (typeof sigPoll === 'function') sigPoll = agmkExtend('sigPoll', 'v3.7: kesh (oflaynda ham +N)', sigPoll, o => async function () {
            const r = await o.apply(this, arguments);
            try { if (sigSrv() && Array.isArray(SIG.inbox)) localStorage.setItem(sigCacheKey(), JSON.stringify(SIG.inbox.map(d => ({ id: d.id, title: d.title, status: d.status, demo: d.demo, created_by: d.created_by, created_at: d.created_at, signers: (d.signers || []).map(x => ({ tabel: x.tabel, state: x.state, name: x.name, label: x.label, at: x.at, reason: x.reason })) }))).slice(0, 400000)); } catch (e) {}
            return r;
        });
        sigBadge = function (n) {
            const list = $id('main-card-list'); let c = $id('sgCard');
            if (!c && list && currentUser && currentUser.tabel) {
                c = document.createElement('div'); c.className = 'btn-card'; c.id = 'sgCard'; c.setAttribute('data-search', 'imzo imzolash elektron imzo tasdiqlash'); c.onclick = () => sigOpenList();
                c.innerHTML = '<div class="btn-card-content"><span class="btn-icon">✍️</span><span class="btn-text">Imzolash<span class="sg-badge hidden" id="sgBadge">0</span></span></div><span class="btn-arrow">›</span>';
                list.insertBefore(c, list.firstChild); try { if (typeof menuArrange === 'function') menuArrange(); } catch (e) {}
            }
            if (n === undefined) n = sigWaitOf(sigSrv() ? SIG.inbox : sigCacheGet(), cleanTabel(meTabel())).length;
            const b = $id('sgBadge'); if (b) { b.textContent = '+' + n; b.classList.toggle('hidden', !n); }
        };
        function sigCardEnsure() { try { if (currentUser && currentUser.tabel) sigBadge(); } catch (e) {} }
        window.addEventListener('agmk:login', () => setTimeout(sigCardEnsure, 400));
        if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.7: ✍️ Imzolash doim', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(sigCardEnsure, 500); return r; });
        setTimeout(sigCardEnsure, 2000);
        sigOpenList = async function (tab) {
            const on = sigSrv(); if (on) await sigPoll(true);
            const me = cleanTabel(sigMe() || meTabel()), E = escapeHtml, L = on ? SIG.inbox : sigCacheGet(); tab = typeof tab === 'string' ? tab : 'in';
            const mine = d => (d.signers || []).find(x => cleanTabel(x.tabel) === me);
            const F = { in: sigWaitOf(L, me), done: L.filter(d => { const m = mine(d); return (m && (m.state === 'sign' || m.state === 'reject')) || (d.status !== 'open' && (m || d.created_by === me)); }).sort((a, b) => String((mine(b) || {}).at || b.created_at).localeCompare(String((mine(a) || {}).at || a.created_at))), out: L.filter(d => d.created_by === me && d.status === 'open') };
            if (tab === 'out' && !F.out.length) tab = 'in';
            const T = [['in', '🆕 Imzolash uchun yangi', F.in.length ? ' <b>+' + F.in.length + '</b>' : ''], ['done', '📜 Imzolanganlar tarixi', ' (' + F.done.length + ')']].concat(F.out.length ? [['out', '📤 Men yuborganlar', ' (' + F.out.length + ')']] : []);
            const row = d => { const m = mine(d); return `<div class="sg-doc" onclick="${on ? `sigOpenDoc('${d.id}')` : `alert('Hujjatni ochish va imzolash uchun korxona serveriga ulaning.')`}"><b>${E(d.title)}</b>${d.demo ? ' <span class="sg-badge" style="background:#7c3aed">DEMO</span>' : ''}<small>${tab === 'done' && m && m.state === 'sign' ? '✅ Siz imzoladingiz · ' + E(fmtDT(m.at)) : tab === 'done' && m && m.state === 'reject' ? '❌ Rad etdingiz · ' + E(m.reason || '') : d.status === 'done' ? '✅ Toʻliq imzolangan' : d.status === 'cancelled' ? '✖ Bekor qilingan' : '⏳ ' + (d.signers || []).filter(x => x.state === 'sign').length + ' / ' + (d.signers || []).length + ' imzolandi'} · yubordi: ${E(d.created_by || '')} · ${E(fmtDT(d.created_at))}</small></div>`; };
            mdl('sgList', `<div class="px-h"><b>✍️ Imzolash</b><button class="mini-btn" onclick="mdlClose('sgList')">✕</button></div>
                ${on ? '' : '<div class="hp-warn">📴 Server ulanmagan — oxirgi maʼlumot koʻrsatilmoqda. Imzolash server ulanganda ishlaydi.</div>'}
                <div class="sg-tabs">${T.map(([k, t, n]) => `<button class="${tab === k ? 'on' : ''}" onclick="sigOpenList('${k}')">${t}${n}</button>`).join('')}</div>
                ${F[tab].map(row).join('') || `<div class="xt-empty">${tab === 'in' ? 'Imzolash uchun yangi hujjat yoʻq.' : 'Hozircha yoʻq.'}</div>`}
                <button class="action-btn sec" onclick="mdlClose('sgList'); sigOpenMine()">✍️ Mening imzom (namuna)</button>`, true);
            sigBadge(F.in.length);
        };
        // Imzo qo'yish: namuna bo'lsa — bitta tugma; bo'lmasa — 📷 kamera yoki ✍️ chizish; har safar PIN/parol
        function sigConfirmDlg(d, png) {
            return new Promise(res => {
                SIG._cf = v => { SIG._cf = null; mdlClose('sgCf'); res(v); };
                const m = mdl('sgCf', `<div class="px-h"><b>✍️ Imzolash</b><button class="mini-btn" onclick="SIG._cf && SIG._cf('')">✕</button></div>
                    <div class="nd-tip">«${escapeHtml(d.title)}» — imzo familiyangiz turgan joyga qoʻyiladi. Server vaqt, qurilma va hujjat izini yozib qoʻyadi.</div>
                    <div class="pp-lbl">SIZNING IMZO NAMUNANGIZ</div><div class="sg-prev"><img src="${png}"></div>
                    <div class="pk-btns"><button onclick="SIG._cf && SIG._cf('new')">🔄 Boshqa imzo (📷 / ✍️)</button><button class="pr" onclick="SIG._cf && SIG._cf('sign')">✍️ Imzolash</button></div>`, true);
                m.addEventListener('click', function f(e) { if (e.target === m) { m.removeEventListener('click', f); if (SIG._cf) SIG._cf(''); } });
            });
        }
        function sigPinOk() {
            const me = cleanTabel(meTabel()), a = (typeof getAccounts === 'function' ? getAccounts() : {})[me];
            if (!a || (!a.pin && !a.hash)) return Promise.resolve(true); // hisob faqat serverda — server sessiyasi tasdiqlaydi
            return new Promise(res => {
                SIG._pin = v => { SIG._pin = null; mdlClose('sgPin'); res(v); };
                mdl('sgPin', `<div class="px-h"><b>🔐 Tasdiqlash</b><button class="mini-btn" onclick="SIG._pin && SIG._pin(false)">✕</button></div>
                    <div class="nd-tip">Imzoni faqat siz qoʻyayotganingizni tasdiqlash uchun ${a.pin ? 'PIN-kod yoki ' : ''}parolingizni kiriting.</div>
                    <input id="sgPinIn" type="password" inputmode="${a.pin ? 'numeric' : 'text'}" class="search-box" autocomplete="off" placeholder="${a.pin ? 'PIN-kod yoki parol' : 'Parol'}" onkeydown="if(event.key==='Enter') sigPinCheck()">
                    <div id="sgPinErr" style="color:#fca5a5;font-size:13px;min-height:18px"></div>
                    <div class="pk-btns"><button onclick="SIG._pin && SIG._pin(false)">Bekor</button><button class="pr" onclick="sigPinCheck()">✅ Tasdiqlash</button></div>`, true);
                setTimeout(() => { const i = $id('sgPinIn'); if (i) i.focus(); }, 100);
            });
        }
        function sigPinCheck() {
            const me = cleanTabel(meTabel()), a = getAccounts()[me], v = ($id('sgPinIn') || {}).value || '';
            const ok = !!a && ((a.pin && hashPw(v, a.pin.salt) === a.pin.hash) || (a.hash && checkAccPw(me, v)));
            if (ok) { if (SIG._pin) SIG._pin(true); return; }
            SIG.pinBad = (SIG.pinBad || 0) + 1; const e = $id('sgPinErr'); if (e) e.textContent = 'Notoʻgʻri. ' + (5 - SIG.pinBad) + ' ta urinish qoldi.';
            if (SIG.pinBad >= 5) { SIG.pinBad = 0; if (SIG._pin) SIG._pin(false); alert('5 marta notoʻgʻri — imzolash bekor qilindi.'); }
        }
        function sigPickMethod(after) {
            SIG.after = after || null;
            mdl('sgPick', `<div class="px-h"><b>✍️ Imzo namunangiz hali yoʻq</b><button class="mini-btn" onclick="mdlClose('sgPick')">✕</button></div>
                <div class="nd-tip">Bir marta kiriting — keyingi hujjatlar bitta tugma bilan imzolanadi. Faqat <b>oʻz imzongizni</b> kiriting.</div>
                <button class="action-btn" onclick="mdlClose('sgPick'); sigOpenMine(); sigMode('cam')">📷 Qogʻozdagi imzoni rasmga olish (skaner)</button>
                <button class="action-btn sec" onclick="mdlClose('sgPick'); sigOpenMine(); sigMode('draw')">✍️ Ekranga barmoq bilan chizish (shoshilinch)</button>
                <button class="action-btn sec" onclick="mdlClose('sgPick'); sigOpenMine(); sigMode('img')">🖼 Tayyor rasmdan</button>`, true);
        }
        sigDoSign = async function () {
            const d = SIG.cur; if (!d) return; const p = await sigLoadMine();
            if (!p) { sigPickMethod(d.id); return; }
            const a = await sigConfirmDlg(d, p);
            if (a === 'new') { SIG.after = d.id; sigOpenMine(); return; }
            if (a !== 'sign') return;
            if (!(await sigPinOk())) return;
            try { const r = await sigApi('/api/sign/v1/docs/' + d.id + '/sign', 'POST', { hash: d.hash }); showToast(r && r.done ? '✅ Imzolandi — hamma imzoladi, PDF tayyor' : '✅ Imzolandi — «📜 Imzolanganlar tarixi»ga oʻtdi'); await sigPoll(true); sigOpenDoc(d.id); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        };
        if (typeof sigSaveMine === 'function') sigSaveMine = agmkExtend('sigSaveMine', 'v3.7: namuna saqlangach imzolash davom etadi', sigSaveMine, o => async function () {
            const r = await o.apply(this, arguments);
            try { const m = $id('sgMine'); if (SIG.after && m && m.classList.contains('hidden')) { const id = SIG.after; SIG.after = null; await sigOpenDoc(id); setTimeout(() => sigDoSign(), 300); } } catch (e) {}
            return r;
        });

        // ---------------- 4–6) Mehnat muhofazasi ----------------
        // 4: «kiritilmagan» — turi boʻyicha; tibbiy koʻrik Exceldan
        if (typeof mmNazoratHtml === 'function') mmNazoratHtml = agmkExtend('mmNazoratHtml', 'v3.7: kiritilmaganlar turi boʻyicha', mmNazoratHtml, o => function () {
            let h = o.apply(this, arguments);
            try {
                const all = mmPeople().map(r => mmStat(r.item)), c = { davriy: 0, bilim: 0, tibbiy: 0 };
                all.forEach(s => Object.keys(c).forEach(k => { if (s[k] && s[k].st === 'no' && !s[k].na) c[k]++; }));
                const lb = { tibbiy: '🩺 Tibbiy koʻrik', bilim: '🎓 Bilim sinovi', davriy: '📋 Yoʻl-yoʻriq (ishchilar)' };
                const row = `<div class="ui-mmno"><span>Kiritilmagan:</span>${['tibbiy', 'bilim', 'davriy'].map(k => `<i class="${MM.st === 'no' && MM.ty === k ? 'on' : ''}" onclick="MM.st='no'; MM.ty=MM.ty==='${k}'&&MM.st==='no'?'':'${k}'; mmRender()">${lb[k]} — <b>${c[k]}</b></i>`).join('')}</div>`;
                const i = h.indexOf('</div>', h.indexOf('class="mm-sum"')); if (i > 0) h = h.slice(0, i + 6) + row + h.slice(i + 6);
                if (canMMEdit()) h = h.replace('<button class="mini-btn" onclick="mmExcel()">', '<label class="mini-btn">🩺 Tibbiy koʻrik (Excel)<input type="file" accept=".xls,.xlsx" style="display:none" onchange="mmTibImport(this)"></label><button class="mini-btn" onclick="mmExcel()">');
                const un = typeof mbData === 'function' ? Object.keys(mbData().ppl).filter(k => k.startsWith('n:')).length : 0;
                if (un) h = h.replace('<div class="mm-flt">', `<div class="nd-tip">ℹ️ Bu sahifada faqat ilova roʻyxatidagi xodimlar. Bilim sinovi jadvalidagi yana <b>${un}</b> kishi roʻyxatga bogʻlanmagan — «🎓 Bilim sinovi → 🔗 Roʻyxatda yoʻq» orqali bogʻlang.</div><div class="mm-flt">`);
            } catch (e) { console.error(e); }
            return h;
        });
        var MMT = { rows: null, file: '' };
        async function mmTibImport(inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f || !canMMEdit()) return; showToast('⏳ Oʻqilmoqda...');
            let book; try { book = narReadBookBs(narBinStr(await f.arrayBuffer())); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            const dt = v => { if (typeof v === 'number' && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10); const s = narS(v); const m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return m[0]; return narDate(s) || ''; };
            const rows = [];
            book.forEach(sh => {
                const R = sh.rows; let h = -1, C = null;
                for (let i = 0; i < Math.min(R.length, 30); i++) { const r = (R[i] || []).map(narS); const n = r.findIndex(c => /фамил|ф\.?\s?и\.?\s?о|f\.?\s?i\.?\s?sh|familiya|ism/i.test(c)); if (n >= 0) { h = i; C = { n: n, t: r.findIndex(c => /табел|tabel/i.test(c)), l: -1, x: -1 }; break; } }
                if (h < 0) return;
                const hd = [(R[h] || []).map(narS), (R[h + 1] || []).map(narS)], fi = re => { for (const r of hd) { const j = r.findIndex(c => re.test(c)); if (j >= 0) return j; } return -1; };
                C.x = fi(/кейинги|следующ|keyingi|навбатдаги|очередн/i); C.l = fi(/охирги|последн|oxirgi|ўтказилган|прошел|пройд|o.?tgan|sana|дата/i); if (C.l === C.x) C.l = -1;
                for (let i = h + 1; i < R.length; i++) {
                    const r = R[i] || [], name = narS(r[C.n]); if (!name || !/[А-Яа-яA-Za-zʻ']{3,}/.test(name) || /фамил|familiya/i.test(name)) continue;
                    const last = C.l >= 0 ? dt(r[C.l]) : '', next = C.x >= 0 ? dt(r[C.x]) : ''; if (!last && !next) continue;
                    const tb = C.t >= 0 ? cleanTabel(narS(r[C.t])) : '', it = (tb && xodimByTabel(tb)) || mbMatch(name);
                    rows.push({ name: name, tabel: it ? cleanTabel(it.tabel) : '', xn: it ? it.name : '', last: last, next: next || (last ? mmAddMonths(last, 12) : ''), auto: !next && !!last });
                }
            });
            if (!rows.length) { alert('⚠️ Jadval topilmadi: sarlavhada «Фамилия / F.I.Sh.» va sana ustuni (oxirgi yoki keyingi koʻrik) boʻlishi kerak.'); return; }
            MMT.rows = rows; MMT.file = f.name; const E = escapeHtml, ok = rows.filter(r => r.tabel).length;
            mdl('mmTib', `<div class="px-h"><b>🩺 Tibbiy koʻrik — import</b><button class="mini-btn" onclick="mdlClose('mmTib')">✕</button></div>
                <div class="nd-tip">${E(f.name)} · ${rows.length} qator. Ilova roʻyxatiga moslashtirildi: <b>${ok}</b>, topilmadi: <b>${rows.length - ok}</b> (ular yozilmaydi — roʻyxatda koʻrinadi).${rows.some(r => r.auto) ? ' «Keyingi koʻrik» ustuni yoʻq qatorlarda keyingi sana = oxirgi + 12 oy.' : ''}</div>
                <div class="gt-scroll" style="max-height:45vh"><table class="nar-t"><tr><th>F.I.Sh. (fayl)</th><th>Ilovada</th><th>Oxirgi</th><th>Keyingi</th></tr>${rows.slice(0, 500).map(r => `<tr><td>${E(r.name)}</td><td>${r.tabel ? '✅ ' + E(r.xn) : '❌ topilmadi'}</td><td>${E(fmtD(r.last))}</td><td>${E(fmtD(r.next))}${r.auto ? ' *' : ''}</td></tr>`).join('')}</table></div>
                <button class="action-btn" onclick="mmTibSave()">💾 ${ok} ta xodimga yozish</button>`, true);
        }
        function mmTibSave() {
            if (!MMT.rows || !canMMEdit()) return; const D = mmData(); let n = 0;
            const T = [];
            MMT.rows.filter(r => r.tabel).forEach(r => { const k = r.tabel, x = D.recs[k] || {}; x.d = x.d || {}; if (r.last && (!x.d.tibbiy || x.d.tibbiy < r.last)) x.d.tibbiy = r.last; if (r.next && (!x.tibbiyNext || x.tibbiyNext < r.next)) x.tibbiyNext = r.next; x.upd = new Date().toISOString(); x.by = meTabel(); D.recs[k] = x; T.push(k); n++; });
            D.jr.push({ id: uid('j'), type: 'tibbiy', date: todayISO(), tabels: T, note: 'Exceldan import: ' + MMT.file + ' — ' + n + ' xodim', by: authorStr(), byT: meTabel(), at: new Date().toISOString() });
            mmSave(D); MMT.rows = null; mdlClose('mmTib'); mmRender(); showToast('🩺 Tibbiy koʻrik sanalari yozildi: ' + n + ' xodim');
        }
        // 5: tuzatish — bitta forma
        mbCorr = function (id) {
            if (!canMMEdit()) return; const d = mbData(), r = d.recs.find(x => x.id === id); if (!r) return; const E = escapeHtml;
            mdl('mbCorrM', `<div class="px-h"><b>✏️ Natijani tuzatish</b><button class="mini-btn" onclick="mdlClose('mbCorrM')">✕</button></div>
                <div class="nd-tip">${E(mbPerson(r.pid, d).name)} · ${E(mbT(r.type).s)}. Eski qiymat, kim va qachon tuzatgani tarixda saqlanadi.</div>
                <div class="ui-row" style="margin:8px 0"><button id="mbc_a1" class="on" onclick="mbCorrAct(1)">✏️ Tuzatish</button><button id="mbc_a2" onclick="mbCorrAct(2)">🗑 Yozuvni bekor qilish</button></div>
                <div id="mbc_f"><div class="mm-f"><label>Sana</label><input type="date" id="mbc_d" value="${E(r.date || '')}"></div>
                <div class="mm-f"><label>Baho</label><div class="ui-row"><button id="mbc_q" class="${r.grade !== 'n' ? 'on' : ''}" onclick="mbCorrG('q')">✅ Qoniqarli</button><button id="mbc_n" class="${r.grade === 'n' ? 'on' : ''}" onclick="mbCorrG('n')">❌ Qoniqarsiz</button></div></div>
                <div class="mm-f"><label>Bayonnoma №</label><input id="mbc_no" value="${E(r.no || '')}"></div></div>
                <div class="mm-f"><label>Sabab (majburiy)</label><textarea id="mbc_w" rows="2" placeholder="masalan: sana jurnaldan notoʻgʻri koʻchirilgan"></textarea></div>
                <div class="pk-btns"><button onclick="mdlClose('mbCorrM')">Bekor</button><button class="pr" onclick="mbCorrSave('${E(id)}')">💾 Saqlash</button></div>`, true);
            MB.cA = 1; MB.cG = r.grade === 'n' ? 'n' : 'q';
        };
        function mbCorrAct(a) { MB.cA = a; $id('mbc_a1').classList.toggle('on', a === 1); $id('mbc_a2').classList.toggle('on', a === 2); $id('mbc_f').style.display = a === 1 ? '' : 'none'; }
        function mbCorrG(g) { MB.cG = g; $id('mbc_q').classList.toggle('on', g === 'q'); $id('mbc_n').classList.toggle('on', g === 'n'); }
        function mbCorrSave(id) {
            const d = mbData(), r = d.recs.find(x => x.id === id); if (!r) return; const why = ($id('mbc_w').value || '').trim();
            if (!why) { alert('Tuzatish sababini yozing.'); return; }
            const old = fmtD(r.date) + ', ' + (r.grade === 'q' ? 'qoniqarli' : 'qoniqarsiz') + (r.no ? ', № ' + r.no : '');
            if (MB.cA === 2) r.del = { at: new Date().toISOString(), by: authorStr(), why: why };
            else {
                const nd = $id('mbc_d').value; if (!/^\d{4}-\d{2}-\d{2}$/.test(nd)) { alert('Sanani tanlang.'); return; } if (nd > todayISO()) { alert('Sana kelajakda boʻlishi mumkin emas.'); return; }
                r.date = nd; r.grade = MB.cG; r.no = ($id('mbc_no').value || '').trim(); r.retake = r.grade === 'n' ? mmAddMonths(r.date, 1) : '';
                if (r.src !== 'import') r.sig = {};
            }
            r.corr = (r.corr || []).concat([{ at: new Date().toISOString(), by: authorStr(), why: why, old: old }]);
            d.log.push({ at: new Date().toISOString(), by: authorStr(), a: (MB.cA === 2 ? 'Bekor qilindi: ' : 'Tuzatish: ') + mbPerson(r.pid, d).name + ' — ' + why }); mbSave(d);
            mdlClose('mbCorrM'); mbOpen(r.pid); mmRender(); showToast(MB.cA === 2 ? '🗑 Bekor qilindi (tarixda saqlandi)' : '✏️ Tuzatildi (tarixda saqlandi)');
        }
        // 6: «xodim» bosiladi; moslash takliflari
        if (typeof mbHtml === 'function') mbHtml = agmkExtend('mbHtml', 'v3.7: «xodim» bosiladi', mbHtml, o => function () {
            return o.apply(this, arguments).replace(/<i class="ok"><b>(\d+)<\/b>xodim<\/i>/, (m, n) => `<i class="ok ${!MB.st && !MB.ty && !MB.q ? 'on' : ''}" onclick="MB.st=''; MB.ty=''; MB.q=''; mmRender(); setTimeout(() => { const l = document.querySelector('#screen-mm .mm-list'); if (l) l.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80)"><b>${n}</b>xodim</i>`);
        });
        function mbLev(a, b) { const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9; let p = Array.from({ length: n + 1 }, (x, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
        function mbCands(name) {
            const k = mbKey(name).split(' '); if (!k[0]) return [];
            return allXodims().map(r => { const z = mbKey(r.item.name).split(' '), ds = mbLev(k[0], z[0] || ''), f1 = (k[1] || '').slice(0, 3), f2 = (z[1] || '').slice(0, 3); const sc = ds + (f1 && f2 ? (f1 === f2 ? 0 : f1[0] === f2[0] ? 1 : 3) : 1); return { it: r.item, sc: sc, ds: ds }; })
                .filter(x => x.ds <= 2 && x.sc <= 3).sort((a, b) => a.sc - b.sc).slice(0, 3);
        }
        mbUnmatched = function () {
            const d = mbData(), E = escapeHtml, L = Object.entries(d.ppl).filter(([k]) => k.startsWith('n:'));
            const C = L.map(([k, p]) => ({ k: k, p: p, c: mbCands(p.name) })), strong = C.filter(x => x.c.length && x.c[0].sc <= 1 && (x.c.length === 1 || x.c[1].sc > x.c[0].sc));
            MB.strong = strong.map(x => [x.k, cleanTabel(x.c[0].it.tabel)]);
            mdl('mbUn', `<div class="px-h"><b>🔗 Ilova roʻyxatida yoʻq xodimlar (${L.length})</b><button class="mini-btn" onclick="mdlClose('mbUn')">✕</button></div>
                <div class="nd-tip">Jadvaldagi ism ilovadagi xodimga aniq mos kelmadi. Ilova oʻxshash ismlarni taklif qiladi — toʻgʻrisini bosing («✅»). Mos kelmasa — «🔎 Boshqasi».</div>
                ${strong.length ? `<button class="action-btn" onclick="mbLinkStrong()">✅ Ishonchli ${strong.length} ta taklifni bir yoʻla bogʻlash</button>` : ''}
                ${C.map(x => `<div class="mm-card"><b>${E(x.p.name)}</b><small>${E(x.p.lav || '')}</small><div class="hs-fb">${x.c.map(c => `<button onclick="mbLinkTo('${E(x.k)}','${E(cleanTabel(c.it.tabel))}')">✅ ${E(c.it.name)} <small>(${E(cleanTabel(c.it.tabel))}${c.it.lavozim ? ', ' + E(String(c.it.lavozim).slice(0, 24)) : ''})</small></button>`).join('')}<button onclick="mbLink('${E(x.k)}')">🔎 Boshqasi</button></div></div>`).join('')}`, true);
        };
        function mbLinkTo(pid, tabel, quiet) {
            const it = xodimByTabel(tabel); if (!it) return; const d = mbData(), np = 't:' + cleanTabel(it.tabel);
            d.recs.forEach(r => { if (r.pid === pid) r.pid = np; });
            Object.keys(d.plan).forEach(k => { if (k.startsWith(pid + '|')) { d.plan[np + '|' + k.split('|')[1]] = d.plan[k]; delete d.plan[k]; } });
            if (d.asg[pid]) { d.asg[np] = Array.from(new Set((d.asg[np] || []).concat(d.asg[pid]))); delete d.asg[pid]; }
            delete d.ppl[pid]; d.ppl[np] = { tabel: cleanTabel(it.tabel), name: it.name }; d.log.push({ at: new Date().toISOString(), by: authorStr(), a: 'Moslash: ' + pid.slice(2) + ' → ' + it.name }); mbSave(d);
            if (!quiet) { mbUnmatched(); mmRender(); showToast('🔗 Bogʻlandi: ' + it.name); }
        }
        async function mbLinkStrong() {
            const L = MB.strong || []; if (!L.length || !(await uiConfirm(L.length + ' ta xodim taklif boʻyicha bogʻlansinmi?'))) return;
            L.forEach(([k, t]) => mbLinkTo(k, t, true)); mbUnmatched(); mmRender(); showToast('🔗 Bogʻlandi: ' + L.length + ' ta');
        }
        (function () { const st = document.createElement('style'); st.textContent = `.ui-mmno span{width:100%}.ui-mmno{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0 2px;font-size:12.5px;color:#cbd5e1}.ui-mmno i{font-style:normal;padding:5px 9px;border-radius:12px;border:1px solid #475569;background:rgba(30,41,59,.85);cursor:pointer}.ui-mmno i.on{border-color:#38bdf8;background:rgba(56,189,248,.2)}.mm-sum i.ok{cursor:pointer}`; document.head.appendChild(st); })();

        // ---------------- 7) 📤 Har qanday roʻyxat va hujjat: Excel · Word · PDF → telefonga yoki yuborish ----------------
        var EXP = { rows: null, title: '', fm: { xlsx: true, docx: false, pdf: false }, quiet: false };
        function expHtml(rows, title) {
            const E = escapeHtml, h = rows[0] || [], b = rows.slice(1);
            return `<h3 style="text-align:center">${E(title)}</h3><p style="text-align:right;font-size:10pt">${E(fmtD(todayISO()))} · ${E((currentUser && currentUser.name) || '')}</p>
                <table border="1" style="border-collapse:collapse;width:100%;font-size:9pt"><tr>${h.map(c => `<th style="background:#e2e8f0;padding:3px">${E(c)}</th>`).join('')}</tr>${b.map(r => `<tr>${r.map(c => `<td style="padding:3px">${E(c === null || c === undefined ? '' : c)}</td>`).join('')}</tr>`).join('')}</table>`;
        }
        async function expFiles() {
            const t = EXP.title, out = [], base = String(t || 'Hujjat').replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Hujjat';
            if (EXP.fm.xlsx) out.push({ name: base + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: xlsxFromRows(EXP.rows, String(t).slice(0, 30)) });
            const f2 = ['docx', 'pdf'].filter(k => EXP.fm[k]); if (f2.length) (await docMake(expHtml(EXP.rows, t), t, f2)).forEach(f => out.push(f));
            if (!out.length) throw new Error('Kamida bitta formatni tanlang.');
            return out;
        }
        function expOpen(rows, title) {
            EXP.rows = rows; EXP.title = String(title || 'Roʻyxat'); const E = escapeHtml, n = Math.max(0, rows.length - 1);
            const fb = (k, ic, t) => `<button id="expF_${k}" class="${EXP.fm[k] ? 'on' : ''}" onclick="EXP.fm.${k}=!EXP.fm.${k}; this.classList.toggle('on', EXP.fm.${k})">${ic} ${t}</button>`;
            mdl('expM', `<div class="px-h"><b>📤 ${E(EXP.title)}</b><button class="mini-btn" onclick="mdlClose('expM')">✕</button></div>
                <div class="nd-tip">${n} qator. Formatni tanlang (bir nechtasini ham) va qayerga ketishini bosing.</div>
                <div class="ui-lbl">Format</div><div class="ui-row">${fb('xlsx', '📊', 'Excel')}${fb('docx', '📝', 'Word')}${fb('pdf', '📄', 'PDF')}</div>
                <div class="exp-go"><button onclick="expGo('save')"><i>📥</i>Telefon xotirasiga</button><button onclick="expGo('share')"><i>📤</i>Yuborish<small>Telegram, pochta, boshqa</small></button><button onclick="expGo('chat')"><i>💬</i>Xodimga<small>ilova ichida</small></button></div>`, true);
        }
        async function expGo(how) {
            let files; try { showToast('⏳ Tayyorlanmoqda…'); files = await expFiles(); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            try { aiLog('📤 Eksport (' + how + '): ' + EXP.title + ' — ' + files.map(f => f.name).join(', ')); } catch (e) {}
            if (how === 'save') { EXP.quiet = true; docDownload(files); EXP.quiet = false; mdlClose('expM'); showToast(window.AgmkNative ? '📥 Saqlandi: Yuklanmalar › AGMK-STTB' : '📥 Yuklab olindi'); }
            else if (how === 'share') { mdlClose('expM'); await docShare(files, { via: 'any', subject: EXP.title, text: '📄 ' + EXP.title }); }
            else expToChat(files);
        }
        function expToChat(files) {
            pickXodim('Kimga yuborilsin?', it => { mdlClose('expM'); const p = { name: it.name, role: it.lavozim || '', tabel: it.tabel || '' }; openChats(p); setTimeout(() => { try { files.forEach(f => CHAT.att.push(f)); chatRender(); showToast('📎 Fayl biriktirildi — «Yuborish»ni bosing'); } catch (e) {} }, 150); });
        }
        // ilovadagi barcha «📊 Excel» tugmalari endi format va yoʻnalish tanlaydi
        if (typeof xlsxDl === 'function') xlsxDl = function (rows, title) { expOpen(rows, title); };
        // har qanday hujjat yuklanganda — pastda «📤 Yuborish» taklifi
        if (typeof docDownload === 'function') docDownload = agmkExtend('docDownload', 'v3.7: saqlangan faylni yuborish taklifi', docDownload, o => function (files) {
            const r = o.apply(this, arguments); if (!EXP.quiet && files && files.length) expSnack(files); return r;
        });
        function expSnack(files) {
            let s = $id('expSnack'); if (!s) { s = document.createElement('div'); s.id = 'expSnack'; document.body.appendChild(s); }
            EXP.last = files; s.innerHTML = `<span>📥 Saqlandi: ${escapeHtml(files.map(f => f.name).join(', ').slice(0, 60))}</span><button onclick="expSnackGo('share')">📤 Yuborish</button><button onclick="expSnackGo('chat')">💬</button><button onclick="$id('expSnack').classList.remove('on')">✕</button>`;
            s.classList.add('on'); clearTimeout(EXP.st); EXP.st = setTimeout(() => s.classList.remove('on'), 8000);
        }
        async function expSnackGo(how) { const f = EXP.last; $id('expSnack').classList.remove('on'); if (!f) return; if (how === 'share') await docShare(f, { via: 'any' }); else expToChat(f); }
        // sahifa eksportchilari (tepadagi 📤)
        var EXP_PAGE = {
            'screen-xt': () => { if (!(isPriv() || hasRole('mm'))) { alert('🔒 Xodimlar roʻyxatini yuklab olish — rahbariyat, kadrlar va MM uchun.'); return; }
                const L = allXodims().slice().sort((a, b) => String(a.su).localeCompare(String(b.su)) || String(a.item.name).localeCompare(String(b.item.name)));
                xlsxDl([['№', 'F.I.Sh.', 'Tabel', 'Lavozim', 'Boʻlim (sex / uchastka)']].concat(L.map((r, i) => [i + 1, r.item.name, cleanTabel(r.item.tabel), r.item.lavozim || '', r.su || ''])), 'Xodimlar roʻyxati ' + fmtD(todayISO())); },
            'screen-mm': () => { if (MM.tab === 'bs' && typeof mbExcel === 'function') mbExcel(); else if (MM.tab === 'jurnal' && typeof mmJrExcel === 'function') mmJrExcel(); else if (typeof mmExcel === 'function') mmExcel(); else alert('Bu yorliqda roʻyxat yoʻq.'); }
        };
        (function () {
            const o = uiHelpEnsure;
            uiHelpEnsure = function (s) {
                o(s); try { const k = uiPageKey(s).split(':')[0]; if (!EXP_PAGE[k] || s.querySelector('.ui-x')) return; const i = s.querySelector('.ui-i'); if (!i) return;
                    const b = document.createElement('button'); b.type = 'button'; b.className = 'ui-i ui-x'; b.title = 'Yuklab olish / yuborish (Excel, Word, PDF)'; b.textContent = '📤'; b.onclick = e => { e.stopPropagation(); EXP_PAGE[k](); };
                    if (i.classList.contains('ui-i-main') || i.classList.contains('ui-i-fl')) return; i.parentNode.insertBefore(b, i); } catch (e) {}
            };
        })();
        (function () { const st = document.createElement('style'); st.textContent = `.exp-go{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.exp-go button{min-height:74px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#fff;font-weight:600;font-size:13px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.exp-go button i{font-style:normal;font-size:22px}.exp-go button small{font-weight:400;color:#94a3b8;font-size:10.5px}.exp-go button:first-child{background:#1d4ed8;border-color:#3b82f6}.exp-go button:nth-child(2){background:#0284c7;border-color:#38bdf8}
            .ui-x{margin-right:6px;font-size:15px}#expSnack{position:fixed;left:10px;right:10px;bottom:-120px;z-index:10060;display:flex;gap:6px;align-items:center;padding:10px;border-radius:14px;background:#0f172a;border:1px solid #38bdf8;color:#e2e8f0;font-size:12.5px;transition:bottom .3s;box-shadow:0 6px 20px rgba(0,0,0,.6)}#expSnack.on{bottom:84px}#expSnack span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#expSnack button{padding:8px 10px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:12.5px}`; document.head.appendChild(st); })();

