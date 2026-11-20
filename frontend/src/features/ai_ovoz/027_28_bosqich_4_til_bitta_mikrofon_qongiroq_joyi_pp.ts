        // =====================================================================
        // YANGI (28-bosqich): 4 til, bitta mikrofon, qo'ng'iroq joyi, PPR tahrirlash,
        // yagona forma uslubi, aktlar A4 + haqiqiy PDF, AI kuchaytirildi
        // =====================================================================
        // ---------- 1) Interfeys tili ----------
        var I18N = { lang: 'uz', L: -1, orig: new WeakMap(), obs: null, busy: false, queued: new Set(), raf: 0 };
        var I18N_LANGS = [['uz', "🇺🇿 O'zbekcha"], ['en', '🇬🇧 English'], ['ru', '🇷🇺 Русский'], ['zh', '🇨🇳 中文']];
        var I18N_SKIP = '.nd-page, #ndPrint, .ai-msg, script, style, textarea, [contenteditable="true"], .i18n-no, .pp-sel, .sug-box';
        function i18nWord(s, L) { const a = I18N_D[s]; return a ? a[L] : null; }
        function i18nTr(raw, L) {
            if (L < 0 || raw == null) return null;
            const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0], s = raw.trim().replace(/\s+/g, ' ');
            if (!s || s.length > 200) return null;
            let t = i18nWord(s, L); if (t) return lead + t + trail;
            for (const [re, fn] of I18N_R) { const m = s.match(re); if (m) { const r = fn(m, L); if (r) return lead + r + trail; } }
            const m = s.match(/^([^\p{L}\d]*)(.*?)([\s:—›▾….]*)$/u);
            if (m && m[2] && (m[1] || m[3])) {
                let c = i18nWord(m[2], L) || (m[3].includes(':') ? (i18nWord(m[2] + ':', L) || '').replace(/[:：]$/, '') || null : null);
                if (!c) for (const [re, fn] of I18N_R) { const mm = m[2].match(re); if (mm) { c = fn(mm, L); if (c) break; } }
                if (c) return lead + m[1] + c + m[3] + trail;
            }
            return null;
        }
        function i18nText(n, L) {
            const p = n.parentElement; if (!p || p.closest(I18N_SKIP)) return;
            const cur = n.nodeValue; let o = I18N.orig.get(n);
            if (!o || (cur !== o.t && cur !== o.o)) o = { o: cur, t: null };
            if (L < 0) { if (o.t !== null && cur === o.t) n.nodeValue = o.o; I18N.orig.delete(n); return; }
            const tr = i18nTr(o.o, L);
            o.t = tr; I18N.orig.set(n, o);
            if (tr !== null && tr !== cur) n.nodeValue = tr; else if (tr === null && cur !== o.o) n.nodeValue = o.o;
        }
        function i18nAttrs(el, L) {
            ['placeholder', 'title'].forEach(a => {
                if (!el.hasAttribute(a)) return;
                const k = 'data-i18n-' + a, cur = el.getAttribute(a); let o = el.getAttribute(k);
                if (o === null || (cur !== o && cur !== (el.__i18n || {})[a])) { o = cur; el.setAttribute(k, o); }
                const tr = L < 0 ? null : i18nTr(o, L);
                const v = tr || o; if (v !== cur) el.setAttribute(a, v); (el.__i18n = el.__i18n || {})[a] = v;
            });
        }
        function i18nWalk(n, L) {
            if (n.nodeType === 3) { i18nText(n, L); return; }
            if (n.nodeType !== 1 || (n.matches && n.matches(I18N_SKIP))) return;
            i18nAttrs(n, L);
            for (let c = n.firstChild; c; c = c.nextSibling) i18nWalk(c, L);
        }
        function i18nFlush() {
            I18N.raf = 0; if (I18N.L < 0) { I18N.queued.clear(); return; }
            I18N.busy = true;
            I18N.queued.forEach(n => { if (n.isConnected) i18nWalk(n, I18N.L); });
            I18N.queued.clear();
            if (I18N.obs) I18N.obs.takeRecords();
            I18N.busy = false;
        }
        function i18nObserve() {
            if (I18N.obs) return;
            I18N.obs = new MutationObserver(ms => {
                if (I18N.busy || I18N.L < 0) return;
                ms.forEach(m => { if (m.type === 'characterData') I18N.queued.add(m.target); else if (m.type === 'attributes') I18N.queued.add(m.target); else m.addedNodes.forEach(a => I18N.queued.add(a)); });
                if (!I18N.raf) I18N.raf = requestAnimationFrame(i18nFlush);
            });
            I18N.obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title'] });
        }
        function i18nSet(lang, silent) {
            if (!I18N_LANGS.some(x => x[0] === lang)) lang = 'uz';
            I18N.lang = lang; I18N.L = { en: 0, ru: 1, zh: 2 }[lang]; if (I18N.L === undefined) I18N.L = -1;
            try { localStorage.setItem('agmk_lang', lang); localStorage.setItem('agmk_ai_voice', lang); } catch (e) {}
            document.documentElement.lang = lang;
            I18N.busy = true; i18nWalk(document.body, I18N.L); if (I18N.obs) I18N.obs.takeRecords(); I18N.busy = false;
            if (I18N.L >= 0) i18nObserve();
            // AI javob tili
            if (typeof AI_SYS !== 'undefined') { if (!I18N.sysBase) I18N.sysBase = AI_SYS; AI_SYS = I18N.sysBase + (lang === 'uz' ? '' : ' 10) Foydalanuvchi interfeys tili: ' + { en: 'English — answer in English', ru: 'Русский — отвечай на русском', zh: '中文 — 请用中文回答' }[lang] + '.'); }
            i18nLangLbl();
            if (!silent) showToast({ uz: "🌐 Til: O'zbekcha", en: '🌐 Language: English', ru: '🌐 Язык: Русский', zh: '🌐 语言：中文' }[lang]);
        }
        function i18nLangLbl() {
            const b = $id('aicVoiceBtn'); if (b) b.innerText = { uz: "🌐 O'zbek", en: '🌐 English', ru: '🌐 Русский', zh: '🌐 中文' }[I18N.lang];
            const s = $id('set-lang-sub'); if (s) s.innerText = (I18N_LANGS.find(x => x[0] === I18N.lang) || [])[1] || '';
        }
        function i18nPick() {
            let m = $id('langModal');
            if (!m) { m = document.createElement('div'); m.id = 'langModal'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="langBox"></div>'; document.body.appendChild(m); }
            $id('langBox').innerHTML = `<div class="pk-h"><b>🌐 Til · Language · Язык · 语言</b><span onclick="$id('langModal').classList.add('hidden')">✕</span></div><div class="pk-list">` +
                I18N_LANGS.map(([k, t]) => `<div class="pk-o${I18N.lang === k ? ' on' : ''}" onclick="$id('langModal').classList.add('hidden'); i18nSet('${k}')"><span class="pk-t">${t}</span></div>`).join('') + `</div>
                <div class="nd-tip" style="margin-top:8px">Interfeys tarjima qilinadi. Bazadagi ma'lumotlar va aktlar asl tilida qoladi.</div>`;
            m.classList.remove('hidden');
        }
        // Ovoz: tanlangan tilga mos
        aiVoicePref = function () { return I18N.lang; };
        function aiVoiceCycle() { i18nPick(); };
        aicVoiceLbl = function () { i18nLangLbl(); };
        aiPickVoice = function (text) {
            const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [], s = String(text);
            const zh = /[一-鿿]/.test(s), ru = (s.match(/[а-яё]/gi) || []).length > s.length * 0.3;
            const want = zh ? ['zh'] : ru ? ['ru'] : I18N.lang === 'en' ? ['en'] : ['uz', 'tr', 'ru'];
            for (const w of want) { const v = vs.find(x => x.lang && x.lang.toLowerCase().startsWith(w)); if (v) return v; }
            return null;
        };
        var SR_LANG = { uz: 'uz-UZ', en: 'en-US', ru: 'ru-RU', zh: 'zh-CN' };

        // ---------- 2) Bitta mikrofon: bosish — savol, ushlab turish — jonli suhbat ----------
        (function () {
            const mic = $id('ai-mic-btn'), live = $id('aicLiveBtn'); if (!mic) return;
            if (live) live.style.display = 'none';
            mic.title = "Bosing — savol · Ushlab turing — jonli suhbat";
            let tm = 0, lp = false;
            mic.addEventListener('contextmenu', e => e.preventDefault());
            mic.addEventListener('pointerdown', () => { lp = false; clearTimeout(tm); tm = setTimeout(() => { lp = true; try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} aiLiveToggle(); }, 550); });
            ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => mic.addEventListener(ev, () => clearTimeout(tm)));
            mic.addEventListener('click', e => {
                if (lp) { lp = false; e.stopImmediatePropagation(); e.preventDefault(); return; }
                if (typeof AILIVE !== 'undefined' && AILIVE.on) { e.stopImmediatePropagation(); e.preventDefault(); aiLiveStop(); }
            }, true);
            aicLiveBtn = agmkExtend('aicLiveBtn', 'aicLiveBtn', aicLiveBtn, o => function () { o.apply(this, arguments); mic.classList.toggle('live', !!(AILIVE && AILIVE.on)); });
        })();
        function aicMicTip() {
            try { if (localStorage.getItem('agmk_mic_tip')) return; localStorage.setItem('agmk_mic_tip', '1'); } catch (e) { return; }
            const mic = $id('ai-mic-btn'); if (!mic) return;
            const t = document.createElement('div'); t.className = 'aic-tip'; t.innerText = "Bosing — savol · Ushlab turing — jonli suhbat";
            mic.parentElement.parentElement.appendChild(t); setTimeout(() => t.remove(), 5500);
        }
        (function () { aiGlobalOpen = agmkExtend('aiGlobalOpen', 'aiGlobalOpen', aiGlobalOpen, o => function () { const r = o.apply(this, arguments); setTimeout(aicMicTip, 400); return r; }); })();

        // ---------- 3) Qo'ng'iroq ⋮ yonida ----------
        (function () {
            const brand = document.querySelector('.header .main-brand'), bell = $id('bellBtn'); if (!brand || !bell) return;
            const dots = brand.querySelector('.main-dots'); const row = document.createElement('div'); row.className = 'mb-row';
            brand.insertBefore(row, brand.firstChild); row.appendChild(bell); if (dots) row.appendChild(dots);
            bell.addEventListener('click', e => e.stopPropagation());
        })();

        // ---------- 4) PPR (ta'mir rejasi) tahrirlash ----------
        var PPRE = { v: null, d: null };
        var PPR_CODES = { yol: ['TXK-1', 'TXK-2', 'TP', 'ЖТ', "O'T", 'KP'], lok: ['ТО-2', 'ТО-3', 'ТР-1', 'ТР-2', 'ТР-3', 'КР-1', 'КР-2', 'СО'], avto: ['ТО-1', 'ТО-2', 'СО', 'ТР', 'КР'] };
        function pprCanEdit() { return !!currentUser && !!currentUser.tabel; }
        function pprEdBtn(v) { return v && v.ppr && pprCanEdit() ? `<button class="mini-btn ppr-ed" onclick="pprEdit(${v.id})">✏️ Rejani tahrirlash</button>` : ''; }
        (function () { pprTableHtml = agmkExtend('pprTableHtml', 'pprTableHtml', pprTableHtml, o => function (v) { let h = o.apply(this, arguments); const d = (v.ppr && v.ppr.done) || {}; Object.keys(d).forEach(m => { h = h.replace(new RegExp('(<b>' + OY_QISQA[+m] + '</b>)'), '$1<i class="ppr-ok">✅</i>'); }); return h + pprEdBtn(v); }); })();
        // bajarilgan ishlar keyingi rejadan chiqariladi
        (function () {
            yolNext = agmkExtend('yolNext', 'bajarilgan ishlar keyingi rejadan chiqariladi', yolNext, oy => function (v) { if (!v.ppr || !v.ppr.events || !v.ppr.events.some(e => e.done)) return oy(v); return oy(Object.assign({}, v, { ppr: Object.assign({}, v.ppr, { events: v.ppr.events.filter(e => !e.done) }) })); });
            pprNext = agmkExtend('pprNext', 'pprNext', pprNext, on => function (v) {
                const r = on(v); if (!r || !v.ppr || v.ppr.events || !v.ppr.done || !v.ppr.done[r.month]) return r;
                const y = v.ppr.year || PPR_YEAR; for (let m = r.month + 1; m < 12; m++) if (v.ppr.plan[m] && !v.ppr.done[m]) return { type: v.ppr.plan[m], month: m, date: lastDayISO(y, m), label: v.ppr.plan[m] + ' — ' + OY_NOMI[m] + ' ' + y };
                return null;
            });
        })();
        function pprKind(v) { return v.ppr && v.ppr.events ? 'yol' : v.kind === 'avto' ? 'avto' : 'lok'; }
        function pprEdit(id) {
            const v = vagonlarData.find(x => x.id === id); if (!v || !v.ppr) return;
            PPRE.v = v; PPRE.d = JSON.parse(JSON.stringify(v.ppr)); if (!PPRE.d.plan) PPRE.d.plan = Array(12).fill('');
            let m = $id('pprEdModal');
            if (!m) { m = document.createElement('div'); m.id = 'pprEdModal'; m.className = 'modal-overlay hidden'; m.innerHTML = '<div class="modal-content" id="pprEdBody" style="max-width:440px; max-height:90vh; overflow-y:auto;"></div>'; document.body.appendChild(m); }
            pprEdRender(); m.classList.remove('hidden');
        }
        function pprEdRender() {
            const v = PPRE.v, d = PPRE.d, k = pprKind(v), y = d.year || PPR_YEAR, t = todayISO();
            let h = `<h3 class="aic-h">✏️ Ta'mir rejasi — ${escapeHtml(unitLabel(v))}</h3>`;
            if (k === 'yol') {
                h += `<div class="nd-tip">Oylik jadval kunlik rejadan avtomatik tuziladi. Qatorni bosib o'zgartiring, «✅» — bajarilganini belgilash.</div><div class="ppre-ev">` +
                    (d.events || []).map((e, i) => `<div class="ppre-row${e.done ? ' done' : ''}"><b onclick="pprEvEdit(${i})">${escapeHtml(e.c)}</b><span onclick="pprEvEdit(${i})">${escapeHtml(yolRange(e))}${e.n > 1 ? ' · ' + e.n + ' kun' : ''}</span>
                        <button onclick="pprEvDone(${i})" title="Bajarildi">${e.done ? '✅ ' + escapeHtml(fmtISO(e.done)) : '☐'}</button><button onclick="pprEvDel(${i})" title="O'chirish">🗑</button></div>`).join('') + `</div>
                    <button class="mini-btn" style="margin-top:8px" onclick="pprEvEdit(-1)">➕ Qator qo'shish</button>`;
            } else {
                h += `<div class="nd-tip">${y}-yil. Oyni bosing — ta'mir turini tanlang. «✅» — o'sha oy ishi bajarilgan.</div><div class="ppr-grid ppre-grid">` +
                    d.plan.map((p, i) => `<div class="ppr-cell${p ? ' has to' : ''}" onclick="pprCell(${i})"><b>${OY_QISQA[i]}</b><span>${escapeHtml(p || '—')}</span>${(d.done || {})[i] ? '<i class="ppr-ok">✅</i>' : ''}</div>`).join('') + `</div>`;
            }
            h += `<div class="hr-btns" style="margin-top:12px"><button class="action-btn" style="background:#475569" onclick="$id('pprEdModal').classList.add('hidden')">Bekor qilish</button><button class="action-btn" onclick="pprEdSave()">💾 Saqlash</button></div>`;
            $id('pprEdBody').innerHTML = h;
        }
        function pprChoose(title, cur, codes) {
            return new Promise(res => {
                let m = $id('pprPick');
                if (!m) { m = document.createElement('div'); m.id = 'pprPick'; m.className = 'modal-overlay hidden pk-ov'; m.innerHTML = '<div class="pk-box" id="pprPickBox"></div>'; document.body.appendChild(m); }
                PPRE.res = v => { m.classList.add('hidden'); const r = PPRE.res; PPRE.res = null; res(v); };
                m.onclick = e => { if (e.target === m && PPRE.res) PPRE.res(null); };
                const opts = [''].concat(codes).concat(cur && !codes.includes(cur) ? [cur] : []);
                $id('pprPickBox').innerHTML = `<div class="pk-h"><b>${escapeHtml(title)}</b><span onclick="PPRE.res && PPRE.res(null)">✕</span></div><div class="pk-list">` +
                    opts.map(c => `<div class="pk-o${c === (cur || '') ? ' on' : ''}" data-c="${escapeHtml(c)}"><span class="pk-t">${c ? escapeHtml(c) : '— reja yo\'q'}</span></div>`).join('') +
                    `<div class="pk-o" data-c="__custom"><span class="pk-t">✍️ Boshqa (qo'lda yozish)...</span></div></div>`;
                $id('pprPickBox').querySelectorAll('.pk-o').forEach(o => o.onclick = async () => {
                    let c = o.getAttribute('data-c');
                    if (c === '__custom') { m.classList.add('hidden'); c = await uiPrompt("Ta'mir turi:", cur || ''); if (c === null) { const r = PPRE.res; PPRE.res = null; res(null); return; } c = c.trim(); }
                    PPRE.res(c);
                });
                m.classList.remove('hidden');
            });
        }
        async function pprCell(i) {
            const d = PPRE.d, cur = d.plan[i] || '';
            const c = await pprChoose(OY_NOMI[i] + ' ' + (d.year || PPR_YEAR), cur, PPR_CODES[pprKind(PPRE.v)]);
            if (c === null) return;
            d.plan[i] = c;
            const y0 = d.year || PPR_YEAR, now = new Date(), past = y0 < now.getFullYear() || (y0 === now.getFullYear() && i <= now.getMonth());
            if (c && past && await uiConfirm(OY_NOMI[i] + ": «" + c + "» bajarilganmi?")) { d.done = d.done || {}; d.done[i] = todayISO(); } else if (d.done) delete d.done[i];
            pprEdRender();
        }
        async function pprEvEdit(i) {
            const d = PPRE.d, e = i >= 0 ? d.events[i] : { c: '', s: todayISO(), e: todayISO(), n: 1 };
            const c = await pprChoose("Ta'mir turi", e.c, PPR_CODES.yol); if (c === null || !c) return;
            const s = await uiPrompt("Boshlanish sanasi (KK.OO.YYYY):", fmtISO(e.s)); if (s === null) return;
            const en = await uiPrompt("Tugash sanasi (KK.OO.YYYY) — bir kunlik bo'lsa o'zgartirmang:", fmtISO(e.e || e.s)); if (en === null) return;
            const toISO = x => { const m = String(x).trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/); return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : (/^\d{4}-\d{2}-\d{2}$/.test(String(x).trim()) ? String(x).trim() : null); };
            const S = toISO(s), E = toISO(en) || S;
            if (!S || E < S) { alert("Sana noto'g'ri. Masalan: 05.10.2026"); return; }
            let n = 0; for (let t = new Date(S + 'T00:00:00'); t <= new Date(E + 'T00:00:00'); t.setDate(t.getDate() + 1)) { const w = t.getDay(); if (w !== 0 && w !== 6) n++; }
            const ne = Object.assign({}, e, { c: c, s: S, e: E, n: Math.max(1, n) });
            if (i >= 0) d.events[i] = ne; else (d.events = d.events || []).push(ne);
            d.events.sort((a, b) => a.s < b.s ? -1 : a.s > b.s ? 1 : 0);
            pprEdRender();
        }
        async function pprEvDone(i) {
            const e = PPRE.d.events[i]; if (!e) return;
            if (e.done) { if (await uiConfirm("«Bajarildi» belgisi olib tashlansinmi?")) delete e.done; pprEdRender(); return; }
            const s = await uiPrompt("Amalda bajarilgan sana (KK.OO.YYYY):", fmtISO(e.e < todayISO() ? e.e : todayISO())); if (s === null) return;
            const m = String(s).trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/); if (!m) { alert("Sana noto'g'ri. Masalan: 04.09.2026"); return; }
            e.done = m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); pprEdRender();
        }
        async function pprEvDel(i) { if (!await uiConfirm("Bu qator o'chirilsinmi?")) return; PPRE.d.events.splice(i, 1); pprEdRender(); }
        function pprEdSave() {
            const v = PPRE.v, d = PPRE.d; if (!v) return;
            if (d.events) {
                const y = d.year || 2026, rank = c => /KP|КР/.test(c) ? 3 : /O'T|ЖТ|TP|ТР/.test(c) ? 2 : 1;
                d.plan = Array(12).fill('');
                d.events.forEach(e => { for (let m = 0; m < 12; m++) { const a = y + '-' + String(m + 1).padStart(2, '0') + '-01', b = lastDayISO(y, m); if (e.s <= b && e.e >= a && (!d.plan[m] || rank(e.c) > rank(d.plan[m]))) d.plan[m] = e.c; } });
                d.cnt = {}; d.events.forEach(e => { d.cnt[e.c] = (d.cnt[e.c] || 0) + 1; });
            } else { d.cnt = {}; d.plan.forEach(p => { if (p) d.cnt[p] = (d.cnt[p] || 0) + 1; }); }
            v.ppr = d; v.pprLog = (v.pprLog || []).concat([{ at: new Date().toISOString(), by: authorStr() }]).slice(-50);
            recalcVagonStatus(v); saveDB();
            $id('pprEdModal').classList.add('hidden');
            if (typeof openPassport === 'function' && activeVagonId === v.id) openPassport(v.id);
            showToast("✅ Reja saqlandi — holat qayta hisoblandi");
        }

        // ---------- 6) Aktlar: haqiqiy PDF (vektor matn, ichki Times-mos shrift) ----------
        var PDFK = { f: null };
        function pdfFonts() {
            if (PDFK.f) return PDFK.f;
            PDFK.f = {}; ['Regular', 'Bold'].forEach(s => { const d = AGMK_PDF_FONT[s]; PDFK.f[s] = { d: d, used: new Map() }; });
            return PDFK.f;
        }
        function pdfNorm(s) { return String(s || '').replace(/[\u00a0\t]/g, ' ').replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\u221f/g, 'L'); }
        function pdfGid(F, ch) { const cp = ch.codePointAt(0); let g = F.d.cmap[cp]; if (g === undefined) { const alt = { 0x2BB: 0x2018, 0x2BC: 0x2019 }[cp]; g = alt ? F.d.cmap[alt] : undefined; } if (g === undefined) g = F.d.cmap[63] || 0; F.used.set(g, F.used.get(g) || cp); return g; }
        function pdfW(st, s, fs) { const F = pdfFonts()[st]; let w = 0; for (const ch of s) { const cp = ch.codePointAt(0); let g = F.d.cmap[cp]; if (g === undefined) g = F.d.cmap[63] || 0; w += F.d.w[g] || 0; } return w / F.d.upm * fs; }
        function pdfRuns(el) {
            const out = [];
            const walk = n => {
                if (n.nodeType === 3) { const p = n.parentElement, b = p && parseInt(getComputedStyle(p).fontWeight, 10) >= 600; out.push({ t: pdfNorm(n.nodeValue), b: !!b }); return; }
                if (n.nodeType !== 1) return; if (n.tagName === 'BR') { out.push({ br: true }); return; }
                n.childNodes.forEach(walk); if (/^(DIV|P)$/.test(n.tagName) && n !== el) out.push({ br: true });
            };
            el.childNodes.forEach(walk); return out;
        }
        function pdfLayoutAkt(root) {
            const mm = 72 / 25.4, AKT41 = !!(root.querySelector && root.querySelector('.a-approve, .a-title, .a-head')), P = { W: 595.28, H: 841.89, L: 30 * mm, R: 15 * mm, T: AKT41 ? 10 * mm : 20 * mm, B: AKT41 ? 15 * mm : 20 * mm, fs: AKT41 ? 12 : 14, lh: AKT41 ? 1.15 : 1.18 };
            const cw = P.W - P.L - P.R, pages = [[]]; let y = P.T;
            const cur = () => pages[pages.length - 1];
            const need = h => { if (y + h > P.H - P.B && cur().length) { pages.push([]); y = P.T; } };
            const txt = (x, yy, s, st, fs) => { if (s) cur().push({ k: 't', x: x, y: yy, s: s, st: st, fs: fs }); };
            const ln = (x1, y1, x2, y2, w) => cur().push({ k: 'l', x1: x1, y1: y1, x2: x2, y2: y2, w: w || 0.6 });
            // matn qatorlarga bo'linadi va joylashtiriladi
            const flow = (runs, x0, width, o) => {
                o = o || {}; const fs = o.fs || P.fs, lh = fs * (o.lh || P.lh), ind = o.indent || 0, al = o.align || 'justify';
                const toks = []; let sp = false;
                runs.forEach(r => { if (r.br) { toks.push({ br: true }); sp = false; return; } const st = (r.b || o.bold) ? 'Bold' : 'Regular'; r.t.split(/( +)/).forEach(part => { if (!part) return; if (/^ +$/.test(part)) { sp = true; return; } toks.push({ s: part, st: st, w: pdfW(st, part, fs), sp: sp }); sp = false; }); });
                const lines = []; let line = [], lw = 0, first = true;
                const maxW = () => width - (first ? ind : 0);
                const push = (forced) => { lines.push({ ws: line, first: first, forced: forced }); line = []; lw = 0; first = false; };
                toks.forEach(t => {
                    if (t.br) { push(true); return; }
                    const spW = line.length && t.sp ? pdfW('Regular', ' ', fs) : 0;
                    if (line.length && lw + spW + t.w > maxW()) push(false);
                    if (!line.length && t.w > maxW()) { // juda uzun so'z — harflab bo'linadi
                        let part = ''; for (const ch of t.s) { if (pdfW(t.st, part + ch, fs) > maxW() && part) { line.push({ s: part, st: t.st, w: pdfW(t.st, part, fs), sp: false }); push(false); part = ''; } part += ch; }
                        t = { s: part, st: t.st, w: pdfW(t.st, part, fs), sp: false };
                    }
                    lw += (line.length && t.sp ? pdfW('Regular', ' ', fs) : 0) + t.w; line.push(t);
                });
                if (line.length || !lines.length) push(true);
                lines.forEach((L, i) => {
                    if (!L.ws.length) { y += lh; return; }
                    need(lh);
                    const xs = x0 + (L.first ? ind : 0), avail = width - (L.first ? ind : 0);
                    const spw = pdfW('Regular', ' ', fs), nat = L.ws.reduce((a, w, j) => a + w.w + (j && w.sp ? spw : 0), 0);
                    const gaps = L.ws.filter((w, j) => j && w.sp).length, last = L.forced || i === lines.length - 1;
                    let x = al === 'center' ? x0 + (width - nat) / 2 : al === 'right' ? x0 + width - nat : xs;
                    const extra = al === 'justify' && !last && gaps ? (avail - nat) / gaps : 0;
                    const base = y + fs * 0.89;
                    L.ws.forEach((w, j) => { if (j && w.sp) x += spw + extra; txt(x, base, w.s, w.st, fs); x += w.w; });
                    y += lh;
                });
                return lines.length;
            };
            // o'rab turuvchi oddiy DIV lar ochiladi (jadval va sarlavhalar tekis matnga aylanib qolmasin)
            const pdfFlat = els => { const o = []; els.forEach(el => { const blk = Array.from(el.children || []).some(k => /^(P|TABLE|DIV|H[1-6])$/.test(k.tagName)), txtN = Array.from(el.childNodes || []).some(n => n.nodeType === 3 && n.textContent.trim()); if (el.tagName === 'DIV' && !/a-approve|a-head|a-title/.test(el.className) && blk && !txtN) o.push(...pdfFlat(Array.from(el.children))); else o.push(el); }); return o; };
            const kids = pdfFlat(Array.from(root.children));
            const alignOf = el => { const a = (el.style && el.style.textAlign) || el.getAttribute('align') || ''; return /center/.test(a) ? 'center' : /right/.test(a) ? 'right' : ''; };
            kids.forEach(el => {
                const cl = el.classList, tag = el.tagName;
                if (cl.contains('alb-annex')) {
                    if (cur().length) { pages.push([]); y = P.T; }
                    let fig41 = 0;
                    Array.from(el.children).forEach(ch => {
                        if (ch.classList.contains('a-title')) { y += 4; flow(pdfRuns(ch), P.L, cw, { align: 'center', bold: true }); y += 8; return; }
                        if (ch.tagName === 'P') { flow(pdfRuns(ch), P.L, cw, { align: 'center' }); y += 6; return; }
                        const im = ch.querySelector('img'); if (!im) return;
                        const iw = +im.dataset.w || 1200, ih = +im.dataset.h || 900; let w = cw, h = w * ih / iw; const maxH = (P.H - P.T - P.B) * 0.86 - 30; if (h > maxH) { h = maxH; w = h * iw / ih; }
                        if (fig41++ > 0 && cur().length) { pages.push([]); y = P.T; } else need(h + 40);
                        const b64 = (im.getAttribute('src') || '').split(',')[1] || ''; const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
                        cur().push({ k: 'img', x: P.L + (cw - w) / 2, y: y, w: w, h: h, data: u8, pw: iw, ph: ih }); y += h + 4;
                        const cp = ch.querySelector('p'); if (cp) flow(pdfRuns(cp), P.L, cw, { align: 'center', fs: 11 });
                        y += 10;
                    });
                    return;
                }
                if (cl.contains('a-approve')) { y += 2; flow(pdfRuns(el), P.L, cw, { align: 'right' }); y += 10; }
                else if (tag === 'P' && cl.contains('a-ctr')) { flow(pdfRuns(el), P.L, cw, { align: 'center' }); y += 1; }
                else if (tag === 'P' && cl.contains('a-li')) { need(P.fs * P.lh); txt(P.L + 12.5 * mm, y + P.fs * 0.89, '-', 'Regular', P.fs); flow(pdfRuns(el), P.L + 19 * mm, cw - 19 * mm, { align: 'justify' }); y += 1; }
                else if (cl.contains('a-head')) { const sp = el.querySelectorAll('span'); need(P.fs * P.lh); const base = y + P.fs * 0.89; if (sp[0]) txt(P.L, base, pdfNorm(sp[0].textContent), 'Regular', P.fs); if (sp[1]) { const s = pdfNorm(sp[1].textContent); txt(P.L + cw - pdfW('Regular', s, P.fs), base, s, 'Regular', P.fs); } y += P.fs * P.lh + 8; }
                else if (cl.contains('a-title')) { y += 4; flow(pdfRuns(el), P.L, cw, { align: 'center', bold: true }); y += 8; }
                else if (/^H[1-6]$/.test(tag)) { y += 4; flow(pdfRuns(el), P.L, cw, { align: alignOf(el) || 'center', bold: true }); y += 6; }
                else if (tag === 'P' && alignOf(el)) { flow(pdfRuns(el), P.L, cw, { align: alignOf(el) }); y += 2; }
                else if (tag === 'P') { const sec = cl.contains('a-sec'); if (sec) y += 3; flow(pdfRuns(el), P.L, cw, { align: sec ? 'left' : 'justify', indent: (cl.contains('ni') || sec) ? 0 : 1.25 * 10 * mm }); y += 2; }
                else if (tag === 'TABLE' && cl.contains('a-sign')) {
                    y += 16;
                    Array.from(el.rows).forEach(tr => {
                        const c = tr.cells, h0 = y;
                        const n1 = flow(pdfRuns(c[0] || tr), P.L, cw * 0.52, { align: 'left' }); const yEnd = y;
                        const lineY = h0 + (n1 - 1) * P.fs * P.lh + P.fs * 0.95; 
                        y = h0 + (n1 - 1) * P.fs * P.lh; flow(pdfRuns(c[2] || tr), P.L + cw * 0.70, cw * 0.30, { align: 'left' }); y = Math.max(y, yEnd) + 12;
                    });
                }
                else if (tag === 'TABLE') {
                    // birlashtirilgan kataklar (colspan), qalin matn va qator ko'chishi saqlanadi; class="nb" — chegarasiz jadval (imzolar)
                    const nb = cl.contains('nb'), rows = Array.from(el.rows), fs = 11, pad = nb ? 1 : 3, span = c => Math.max(1, c.colSpan || 1);
                    const nc = Math.max(...rows.map(r => Array.from(r.cells).reduce((a, c) => a + span(c), 0)));
                    let ws;
                    if (nb) ws = Array(nc).fill(cw / nc);
                    else { const nat = Array(nc).fill(20); rows.forEach(r => { let ci = 0; Array.from(r.cells).forEach(c => { if (span(c) === 1) nat[ci] = Math.max(nat[ci], Math.min(pdfW('Regular', pdfNorm(c.textContent), fs) + pad * 2, cw * 0.6)); ci += span(c); }); }); const sum = nat.reduce((a, b) => a + b, 0); ws = nat.map(w => w / sum * cw); }
                    const meas = (runs, w, bold) => { let n = 1, cur = 0; const sp = pdfW('Regular', ' ', fs); runs.forEach(r => { if (r.br) { n++; cur = 0; return; } String(r.t || '').split(/\s+/).filter(Boolean).forEach(t => { const tw = pdfW((r.b || bold) ? 'Bold' : 'Regular', t, fs); if (cur && cur + sp + tw > w) { n++; cur = tw; } else cur += (cur ? sp : 0) + tw; }); }); return n; };
                    y += 4;
                    rows.forEach(r => {
                        const cells = Array.from(r.cells); let ci = 0;
                        const L = cells.map(c => { const s = span(c), x0 = P.L + ws.slice(0, ci).reduce((a, b) => a + b, 0), w = ws.slice(ci, ci + s).reduce((a, b) => a + b, 0); ci += s; const th = c.tagName === 'TH', runs = pdfRuns(c); return { c: c, x: x0, w: w, th: th, runs: runs, n: meas(runs, w - pad * 2, th), al: alignOf(c) || (th ? 'center' : 'left') }; });
                        const rh = Math.max(1, ...L.map(z => z.n)) * fs * 1.2 + pad * 2 + (nb ? 2 : 0); need(rh);
                        const y0 = y;
                        L.forEach(z => { y = y0 + pad; flow(z.runs, z.x + pad, z.w - pad * 2, { fs: fs, lh: 1.2, align: z.al, bold: z.th }); });
                        if (!nb) { ln(P.L, y0, P.L + cw, y0, 0.5); ln(P.L, y0 + rh, P.L + cw, y0 + rh, 0.5); L.forEach(z => ln(z.x, y0, z.x, y0 + rh, 0.5)); ln(P.L + cw, y0, P.L + cw, y0 + rh, 0.5); }
                        y = y0 + rh;
                    });
                    y += 6;
                }
                else { flow(pdfRuns(el), P.L, cw, { align: alignOf(el) || 'left' }); y += 2; }
            });
            return { P: P, pages: pages };
        }
        function pdfBuild(lay) {
            const F = pdfFonts(), enc = new TextEncoder(), parts = [], offs = []; let len = 0;
            const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
            const H = lay.P.H; const hex4 = n => n.toString(16).padStart(4, '0');
            // sahifa oqimlari
            const IMGS = []; lay.pages.forEach(ops => ops.forEach(o => { if (o.k === 'img') { o.n = IMGS.length; IMGS.push(o); } }));
            const streams = lay.pages.map(ops => {
                let s = '';
                ops.forEach(o => {
                    if (o.k === 'img') { s += 'q ' + (o.mul ? '/GSm gs ' : '') + o.w.toFixed(2) + ' 0 0 ' + o.h.toFixed(2) + ' ' + o.x.toFixed(2) + ' ' + (H - o.y - o.h).toFixed(2) + ' cm /Im' + o.n + ' Do Q\n'; return; }
                    if (o.k === 't') { const f = F[o.st]; let hx = ''; for (const ch of o.s) hx += hex4(pdfGid(f, ch)); s += 'BT /' + (o.st === 'Bold' ? 'F2' : 'F1') + ' ' + o.fs.toFixed(2) + ' Tf 1 0 ' + (o.it ? '0.21' : '0') + ' 1 ' + o.x.toFixed(2) + ' ' + (H - o.y).toFixed(2) + ' Tm <' + hx + '> Tj ET\n'; }
                    else s += o.w.toFixed(2) + ' w ' + o.x1.toFixed(2) + ' ' + (H - o.y1).toFixed(2) + ' m ' + o.x2.toFixed(2) + ' ' + (H - o.y2).toFixed(2) + ' l S\n';
                });
                return s;
            });
            const np = streams.length, fontObjs = 5, first = 3; // 1 katalog, 2 sahifalar
            const fBase = { Regular: first, Bold: first + fontObjs }, pBase = first + fontObjs * 2;
            put('%PDF-1.4\n%AGMK\n');
            const obj = (n, body) => { offs[n] = len; put(n + ' 0 obj\n'); if (Array.isArray(body)) body.forEach(put); else put(body); put('\nendobj\n'); };
            obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
            obj(2, '<< /Type /Pages /Count ' + np + ' /Kids [' + streams.map((_, i) => (pBase + i * 2) + ' 0 R').join(' ') + '] >>');
            ['Regular', 'Bold'].forEach((st, fi) => {
                const f = F[st], d = f.d, b = fBase[st], sc = 1000 / d.upm, name = (st === 'Bold' ? 'AGMKAB+LiberationSerif-Bold' : 'AGMKAA+LiberationSerif');
                const used = Array.from(f.used.keys()).sort((a, c) => a - c);
                const W = used.map(g => g + ' [' + Math.round((d.w[g] || 0) * sc) + ']').join(' ');
                const bin = atob(d.ttf), bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                let cm = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n';
                for (let i = 0; i < used.length; i += 100) { const ch = used.slice(i, i + 100); cm += ch.length + ' beginbfchar\n' + ch.map(g => '<' + hex4(g) + '> <' + hex4(f.used.get(g) & 0xffff) + '>').join('\n') + '\nendbfchar\n'; }
                cm += 'endcmap CMapName currentdict /CMap defineresource pop end end';
                obj(b, '<< /Type /Font /Subtype /Type0 /BaseFont /' + name + ' /Encoding /Identity-H /DescendantFonts [' + (b + 1) + ' 0 R] /ToUnicode ' + (b + 4) + ' 0 R >>');
                obj(b + 1, '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /' + name + ' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ' + (b + 2) + ' 0 R /CIDToGIDMap /Identity /DW 500 /W [' + W + '] >>');
                obj(b + 2, '<< /Type /FontDescriptor /FontName /' + name + ' /Flags 34 /FontBBox [' + d.bbox.map(x => Math.round(x * sc)).join(' ') + '] /ItalicAngle 0 /Ascent ' + Math.round(d.asc * sc) + ' /Descent ' + Math.round(d.desc * sc) + ' /CapHeight ' + Math.round(d.cap * sc) + ' /StemV ' + (st === 'Bold' ? 140 : 80) + ' /FontFile2 ' + (b + 3) + ' 0 R >>');
                obj(b + 3, ['<< /Length ' + bytes.length + ' /Length1 ' + bytes.length + ' >>\nstream\n', bytes, '\nendstream']);
                obj(b + 4, '<< /Length ' + enc.encode(cm).length + ' >>\nstream\n' + cm + '\nendstream');
            });
            streams.forEach((s, i) => {
                const pn = pBase + i * 2;
                obj(pn, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + lay.P.W + ' ' + lay.P.H + '] /Resources << /Font << /F1 ' + fBase.Regular + ' 0 R /F2 ' + fBase.Bold + ' 0 R >>' + (IMGS.length ? ' /XObject << ' + IMGS.map((im, k) => '/Im' + k + ' ' + (pBase + np * 2 + k) + ' 0 R').join(' ') + ' >>' : '') + (IMGS.some(im => im.mul) ? ' /ExtGState << /GSm << /Type /ExtGState /BM /Multiply >> >>' : '') + ' >> /Contents ' + (pn + 1) + ' 0 R >>');
                obj(pn + 1, '<< /Length ' + enc.encode(s).length + ' >>\nstream\n' + s + 'endstream');
            });
            IMGS.forEach((im, k) => obj(pBase + np * 2 + k, ['<< /Type /XObject /Subtype /Image /Width ' + im.pw + ' /Height ' + im.ph + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.data.length + ' >>\nstream\n', im.data, '\nendstream']));
            const nObj = pBase + np * 2 + IMGS.length, xref = len;
            let x = 'xref\n0 ' + nObj + '\n0000000000 65535 f \n'; for (let i = 1; i < nObj; i++) x += String(offs[i] || 0).padStart(10, '0') + ' 00000 n \n';
            put(x + 'trailer\n<< /Size ' + nObj + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
            return new Blob(parts, { type: 'application/pdf' });
        }
        function pdfFromHtml(html, fname) {
            PDFK.f = null; // har bir faylda shrift ishlatilishi qayta hisoblanadi
            const box = document.createElement('div'); box.className = 'nd-page pdf-src'; box.style.cssText = 'position:absolute; left:-99999px; top:0; width:794px; visibility:hidden;'; box.innerHTML = html;
            document.body.appendChild(box);
            try {
                const lay = pdfLayoutAkt(box), blob = pdfBuild(lay);
                const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
                showToast('📄 PDF tayyor: ' + fname + ' (' + lay.pages.length + ' bet)');
                return blob;
            } catch (e) { alert("PDF yaratishda xato: " + agmkErrUz(e)); } finally { box.remove(); }
        }
        function aktPdf() {
            const p = $id('ndPage'); if (!p) return;
            const t = ((p.querySelector('.a-title') || {}).innerText || 'Akt').replace(/\s+/g, ' ').trim().slice(0, 50).replace(/[^\p{L}\d]+/gu, '_');
            pdfFromHtml(p.innerHTML, t + '_' + todayISO() + '.pdf');
        }
        function spPdf() {
            const set = SP_SETS.find(s => s.id === SP.set), all = spItems(SP.set), n = SP.n;
            const rows = all.map((x, k) => `<tr><td>${k + 1}</td><td>${escapeHtml(x.n)}</td><td>${escapeHtml(x.u || '')}</td><td>${escapeHtml(String(x.q))}</td><td>${escapeHtml(spMul(x.q, n))}</td></tr>`).join('');
            const html = `<div class="a-approve">“TASDIQLAYMAN”<br>______________________<br>______________ ____________<br>«____» ______________ ${new Date().getFullYear()}-y.</div>
                <div class="a-head"><span>Olmaliq sh.</span><span>${fmtISO(todayISO())}-y.</span></div>
                <div class="a-title">${n} ta 2ВС-105 dumpkarning kapital ta'miri uchun materiallar va ehtiyot qismlarga<br>ZAYAVKA</div>
                <p class="ni">Asos: ${escapeHtml(set ? set.title : '')} (1 ta vagon uchun sarf me'yori).</p>
                <table><tr><th>№</th><th>Nomi</th><th>Birligi</th><th>1 ta uchun</th><th>${n} ta uchun</th></tr>${rows}</table>
                <table class="a-sign"><tr><td class="l">Tuzuvchi</td><td class="m"></td><td class="r">${escapeHtml(currentUser && currentUser.name ? ppShort(currentUser.name, 'uz') : '')}</td></tr></table>`;
            pdfFromHtml(html, 'Zayavka_2VS105_' + n + 'ta_' + todayISO() + '.pdf');
        }
        // Akt ekranda A4 varaq nisbatida
        function aktSheetFit() {
            document.querySelectorAll('#ndBody .nd-page').forEach(p => {
                if (!p.parentElement.classList.contains('nd-sheet')) { const w = document.createElement('div'); w.className = 'nd-sheet'; p.parentElement.insertBefore(w, p); w.appendChild(p); }
                const w = p.parentElement, sc = Math.min(1, w.clientWidth / 794);
                p.style.transform = 'scale(' + sc + ')'; w.style.height = Math.ceil(p.offsetHeight * sc) + 'px';
            });
        }
        (function () { ndRender = agmkExtend('ndRender', 'ndRender', ndRender, o => function () { const r = o.apply(this, arguments); setTimeout(aktSheetFit, 0); return r; }); ndOpenArch = agmkExtend('ndOpenArch', 'ndOpenArch', ndOpenArch, oa => function () { const r = oa.apply(this, arguments); setTimeout(aktSheetFit, 0); return r; }); })();
        window.addEventListener('resize', () => setTimeout(aktSheetFit, 50));
        document.addEventListener('input', e => { if (e.target && e.target.id === 'ndPage') aktSheetFit(); });

        // ---------- 7) AI kuchaytirildi ----------
        var AIX = { lastUnit: null, lastPerson: null };
        function aixUnitFrom(q) { const m = String(q).match(/(?<![\d.])(\d{3,8})(?![\d.])/); if (!m) return null; const v = vagonlarData.find(x => vagonNo(x) === m[1] || String(x.inv) === m[1] || String(x.num) === m[1] || String(x.zav) === m[1]); return v ? m[1] : null; }
        function aixAkt(q) {
            const n = dbN(q); if (!/(akt|dalolatnoma|акт)/.test(n) || !/(tuz|yoz|tayyorla|sostav|oching|och\b)/.test(n)) return null;
            const tur = /defekt|дефект|nosoz/.test(n) ? 'defekt' : /o.?rnat/.test(n) && /sinov/.test(n) ? 'ornatish' : /sinov/.test(n) ? 'holat' : /[а-я]{4}/.test(q) ? 'umumiy_ru' : 'umumiy';
            const vag = (String(q).match(/(?<![\d.])(\d{4,8})(?![\d.])/) || [])[1] || '';
            const S = ndSigners(), com = [];
            dbN(q).split(' ').filter(t => t.length >= 4).forEach(t => { const s = S.find(x => x.l === ND_TYPES[tur].l && !x.ap && dbN(x.n).split(' ').some(w => w.length >= 4 && dbLike(dbStem(t), w.replace(/^[a-z]\s*/, '')))); if (s && !com.some(c => c.n === s.n)) com.push({ r: s.r, n: s.n }); });
            const body = String(q).replace(/^.*?(akt|dalolatnoma|акт)[^:]*:\s*/i, '').replace(/komissiya.*$/i, '').trim();
            setTimeout(() => {
                aicClose(); ND.form = null; ndOpenAkt(body && body !== q ? body.replace(/\.\s+/g, '.\n') : '');
                ND.form.tur = tur; if (vag) ND.form.vag = vag; if (com.length) ND.form.com = com; ND.form.apObj = ndDefApObj(); ndRender();
            }, 600);
            return "📝 Akt oynasi ochilmoqda: " + ND_TYPES[tur].t + (vag ? ", vagon №" + vag : '') + (com.length ? ", komissiya: " + com.map(c => c.n).join(', ') : '') + ".\nQisqa mazmunni tekshirib «AI bilan akt tuzish»ni bosing.";
        }
        function aixReport(q) {
            const n = dbN(q); if (!/(hisobot|royxat|spisok|отчет|список)/.test(n) || !/(pdf|chop|print|печат|tayyorla|tuz|qil)/.test(n)) return null;
            let kind = /lokomotiv|teplovoz|локомотив/.test(n) ? 'lok' : /drezina|yol texnika|yo.?l texnika|путев/.test(n) ? 'yol' : /traktor|avto|yuklagich/.test(n) ? 'avto' : 'vag';
            const list0 = kind === 'lok' ? onlyLoks() : kind === 'yol' ? vagonlarData.filter(v => v.kind === 'yol') : kind === 'avto' ? vagonlarData.filter(v => v.kind === 'avto') : onlyVagons();
            let flt = v => v.status === "Ta'mir talab", tl = "ta'mir talab";
            if (/yaqin|скоро/.test(n)) { flt = v => v.status === 'Yaqin'; tl = 'muddati yaqin'; }
            else if (/shu oy|bu oy|oyda|этом месяце/.test(n)) { const mo = todayISO().slice(0, 7); flt = v => String(v.keyingi || '').slice(0, 7) === mo; tl = 'shu oy ta\'mirga tushadigan'; }
            else if (/tamirda|ремонте/.test(n)) { flt = v => v.status === 'Tamirda'; tl = "hozir ta'mirdagi"; }
            const list = list0.filter(flt).sort((a, b) => (a.kun === null ? 1e9 : a.kun) - (b.kun === null ? 1e9 : b.kun));
            const name = { vag: 'vagonlar', lok: 'lokomotivlar', yol: "yo'l texnikalari", avto: 'avtotraktor texnikasi' }[kind];
            const rows = list.map((v, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(unitLabel(v))}</td><td>${escapeHtml(v.type || '')}</td><td>${escapeHtml(v.status)}${v.kun !== null ? ' (' + (v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + ' kun') + ')' : ''}</td><td>${escapeHtml(v.nextLabel || fmtISO(v.keyingi) || '—')}</td></tr>`).join('');
            const html = `<div class="a-head"><span>Olmaliq sh.</span><span>${fmtISO(todayISO())}-y.</span></div><div class="a-title">${escapeHtml(tl.charAt(0).toUpperCase() + tl.slice(1))} ${escapeHtml(name)} ro'yxati<br>HISOBOT</div>
                <p class="ni">Jami: ${list.length} ta. Manba: «AGMK STTB-AIT» tizimi bazasi, ${fmtDateTime(new Date().toISOString())} holatiga.</p>
                <table><tr><th>№</th><th>Texnika</th><th>Turi</th><th>Holati</th><th>Keyingi ta'mir</th></tr>${rows || '<tr><td>—</td><td>Mos texnika yo\'q</td><td></td><td></td><td></td></tr>'}</table>
                <table class="a-sign"><tr><td class="l">Tuzuvchi: ${escapeHtml(currentUser.role || '')}</td><td class="m"></td><td class="r">${escapeHtml(ppShort(currentUser.name || '', 'uz'))}</td></tr></table>`;
            setTimeout(() => pdfFromHtml(html, 'Hisobot_' + kind + '_' + todayISO() + '.pdf'), 400);
            return "📄 Hisobot tayyorlanmoqda: " + tl + " " + name + " — " + list.length + " ta. PDF fayl yuklab olinadi.\n" + list.slice(0, 10).map(v => '• ' + unitLabel(v) + ' — ' + v.status).join('\n') + (list.length > 10 ? '\n... va yana ' + (list.length - 10) + ' ta (to\'liq ro\'yxat PDF\'da)' : '');
        }
        function aixSrc(t, personal) {
            if (!t || /^🤔|^⛔|^⚠️/.test(t)) return t;
            const src = personal ? 'xodimlar bazasi' : /2ВС-105 KR|🔩/.test(t) ? "2ВС-105 KR me'yori" : /📌|normativ|GOST|ГОСТ/.test(t) ? 'normativ hujjatlar' : /📝|📄/.test(t) ? 'akt / hisobot' : /stansiya|peregon|🛤️|🗺️/.test(t) ? "temir yo'l pasporti (2023)" : /tarkib|🚂/.test(t) ? 'harakat jurnali' : 'texnika bazasi';
            return t + '\n📚 Manba: ' + src;
        }
        (function () {
            aiStage('Akt va hisobot soʻrovlari; «uning» — oldingi texnika; manba belgisi', function (q, next) {
                const a = aixAkt(q); if (a) return { t: a, personal: false };
                const r = aixReport(q); if (r) return { t: r, personal: false };
                // "uning / shu vagonning ..." — oldingi savoldagi texnika
                let qq = q; const u = aixUnitFrom(q);
                if (u) AIX.lastUnit = u; else if (AIX.lastUnit && /\b(uning|unga|u |shu |bu |ushbu|его|этот|this|its|it )/i.test(' ' + q + ' ')) qq = q + ' ' + AIX.lastUnit;
                const res = next(qq);
                res.t = aixSrc(res.t, res.personal);
                return res;
            });
        })();

        // Ovozli tanish tanlangan tilda
        (function () {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR || !SR.prototype) return;
            const os = SR.prototype.start;
            SR.prototype.start = function () { if (I18N.lang !== 'uz' && SR_LANG[I18N.lang]) this.lang = SR_LANG[I18N.lang]; return os.apply(this, arguments); };
        })();
        // Ovozli javobda manba satri o'qilmaydi
        (function () { aiSpeechClean = agmkExtend('aiSpeechClean', 'Ovozli javobda manba satri oʼqilmaydi', aiSpeechClean, o => function (t) { return o(String(t || '').replace(/\n?📚 Manba:[^\n]*/g, '')); }); })();
        // Akt shriftini oldindan yuklash
        try { Promise.all([document.fonts.load("16px AGMKSerif"), document.fonts.load("bold 16px AGMKSerif")]).then(() => setTimeout(aktSheetFit, 50)); } catch (e) {}
        // ---------- ishga tushirish ----------
        (function () { let l = 'uz'; try { l = localStorage.getItem('agmk_lang') || 'uz'; } catch (e) {} if (l !== 'uz') i18nSet(l, true); else i18nLangLbl(); })();

        var AGMK_THEME_DEFAULT = 'classic';

