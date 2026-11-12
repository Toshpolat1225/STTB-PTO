        // =====================================================================
        // v3.9.0
        //  1) Bosh sahifa qidiruvi — hamma narsa: xodim (ism, tabel, lavozim), texnika, sex/uchastka, stansiya,
        //     hujjat va aktlar, zamechaniya (huquq boʻyicha). ⓘ qidiruv ochilganda yashirinadi.
        //  2) «Mening imzom» — server topilmasa ham saqlanadi (telefonda), server topilishi bilan oʻzi yuboriladi.
        //  3) Kirish: administrator bergan 6 xonali parol, bosqichli bloklash, roʻyxatdan oʻtish yopiq, huquq guruhlari.
        //  4) Imzo kodi (4 xonali) — har bir xodim oʻzi oʻrnatadi, imzolashda soʻraladi.
        //  5) Birinchi ulanishda sinxronlash: oflayn kiritilganlar ustidan server maʼlumoti yozilmaydi.
        //  6) Kunlik zaxira eslatmasi.
        //  7) Smena GPS (BFF uslubida): texnika qabul qilinganda yoqiladi, topshirilganda oʻchadi; jonli xarita.
        // =====================================================================

        // ---------------------------------------------------------------- 1) QIDIRUV
        function gsFold(s) { return (typeof normTxt === 'function' ? normTxt(s) : String(s || '').toLowerCase()).replace(/x/g, 'h').replace(/q/g, 'k').replace(/[ʻʼ'`’‘.,;:()«»"№#-]/g, ' ').replace(/\s+/g, ' ').trim(); }
        var GS = { q: '', more: {}, R: null };
        function gsScore(hay, toks, first) {
            if (!toks.every(t => hay.includes(t))) return 0;
            let s = 1; toks.forEach(t => { if ((' ' + hay).includes(' ' + t)) s += 2; if (first && first.startsWith(t)) s += 3; }); return s;
        }
        function gsRun(q) {
            const toks = gsFold(q).split(' ').filter(Boolean); const R = { x: [], t: [], u: [], p: [], d: [], z: [] };
            if (!toks.length || (toks.length === 1 && toks[0].length < 2 && !/\d/.test(toks[0]))) return R;
            const fired = typeof firedOf === 'function' ? firedOf : () => null;
            // 👤 Xodimlar
            try { allXodims().forEach(r => { const it = r.item; const hay = gsFold([it.name, cleanTabel(it.tabel), it.lavozim, r.su, it.bolim || '', it.phone || ''].join(' ')); const s = gsScore(hay, toks, gsFold(it.name));
                if (s) R.x.push({ s: s + (toks.some(t => cleanTabel(it.tabel) === t) ? 10 : 0), id: it.id, n: it.name, sub: [it.lavozim, r.su].filter(Boolean).join(' · '), tb: cleanTabel(it.tabel), off: !!fired(cleanTabel(it.tabel)) }); }); } catch (e) {}
            // 🚃 Texnika
            try { (vagonlarData || []).forEach(v => { if (v.kind === 'infra') return; const hay = gsFold([vagonNo(v), v.inv, v.zav, v.gos, v.naim, v.type, v.marka, v.model, v.seh, unitLabel(v)].filter(Boolean).join(' ')); const s = gsScore(hay, toks);
                if (s) R.t.push({ s: s + (toks.some(t => String(vagonNo(v)) === t) ? 10 : 0), id: v.id, n: unitLabel(v), sub: [v.naim && !unitLabel(v).includes(v.naim) ? v.naim : '', v.seh, v.status].filter(Boolean).join(' · '), st: v.status }); }); } catch (e) {}
            // 🏭 Sex / uchastka
            try { const seen = {}; allXodims().forEach(r => { const k = r.su; if (!k || seen[k]) return; seen[k] = 0; }); allXodims().forEach(r => { if (r.su in seen) seen[r.su]++; });
                Object.keys(seen).forEach(k => { const s = gsScore(gsFold(k), toks); if (s) R.u.push({ s: s, k: k, n: k, sub: seen[k] + ' xodim' }); }); } catch (e) {}
            // 📍 Stansiya va obyektlar
            try { if (typeof INFRA_2023 !== 'undefined') INFRA_2023.items.forEach(o => { const nm = typeof infraShort === 'function' ? infraShort(o) : o.uz; const s = gsScore(gsFold([nm, o.uz, o.ru].filter(Boolean).join(' ')), toks); if (s) R.p.push({ s: s, id: o.id, n: nm, sub: o.uz && o.uz !== nm ? o.uz : '' }); }); } catch (e) {}
            // 📚 Hujjatlar va aktlar
            try { ndDocs().forEach(d => { const s = gsScore(gsFold(d.title), toks); if (s) R.d.push({ s: s + 1, k: 'doc', id: d.id, n: d.title, sub: '📚 Normativ hujjat · ' + (d.punkts || []).length + ' punkt' }); }); } catch (e) {}
            try { ndAkts().forEach(a => { const s = gsScore(gsFold(a.title + ' ' + (a.text || '').slice(0, 600)), toks); if (s) R.d.push({ s: s, k: 'akt', id: a.id, n: a.title, sub: '📄 Akt' + (a.sana ? ' · ' + fmtISO(a.sana) : '') }); }); } catch (e) {}
            // ⚠️ Zamechaniyalar — faqat koʻrish huquqi borlariga
            try { allZams().forEach(r => { if (typeof zamCanSee === 'function' && !zamCanSee(r.v, r.z)) return; const s = gsScore(gsFold([r.z.izoh, 'zamechaniya', r.z.no, unitLabel(r.v), r.z.by && r.z.by.name].filter(Boolean).join(' ')), toks);
                if (s) R.z.push({ s: s, vid: r.v.id, no: r.z.no, n: '№' + r.z.no + ' — ' + unitLabel(r.v), sub: String(r.z.izoh || '').slice(0, 90) + (r.z.status === 'yopildi' ? ' · ✅ yopilgan' : ' · ⏳ ochiq') }); }); } catch (e) {}
            Object.keys(R).forEach(k => R[k].sort((a, b) => b.s - a.s || String(a.n).localeCompare(String(b.n))));
            return R;
        }
        var GS_GRP = [['x', '👤 Xodimlar'], ['t', '🚃 Texnika'], ['u', '🏭 Sex va uchastkalar'], ['p', '📍 Stansiya va obyektlar'], ['d', '📚 Hujjatlar va aktlar'], ['z', '⚠️ Zamechaniyalar']];
        function gsHtml(R) {
            const E = escapeHtml; let h = '', n = 0;
            GS_GRP.forEach(([k, t]) => { const L = R[k]; if (!L.length) return; n += L.length; const lim = GS.more[k] ? 60 : 5;
                h += `<div class="gs-g"><div class="gs-h">${t} <span>${L.length}</span></div>` + L.slice(0, lim).map((r, i) => `<div class="gs-r" onclick="gsGo('${k}', ${i})"><b>${E(r.n)}${r.off ? ' <i class="gs-off">ishdan boʻshagan</i>' : ''}</b>${r.tb ? `<em>${E(r.tb)}</em>` : ''}${r.sub ? `<small>${E(r.sub)}</small>` : ''}</div>`).join('')
                    + (L.length > lim ? `<button class="gs-more" onclick="GS.more['${k}']=1; gsShow()">Yana ${L.length - lim} ta ›</button>` : '') + '</div>'; });
            return n ? `<div class="gs-box">${h}</div>` : '';
        }
        function gsShow() {
            const inp = $id('globalSearchInput'); const q = ((inp && inp.value) || '').trim(); let box = $id('gsRes');
            if (!box) { box = document.createElement('div'); box.id = 'gsRes'; const ref = $id('mainAiAns') || $id('main-card-list'); if (!ref) return 0; ref.parentNode.insertBefore(box, ref); }
            if (q !== GS.q) { GS.q = q; GS.more = {}; }
            if (!q) { box.innerHTML = ''; GS.R = null; return 0; }
            GS.R = gsRun(q); const h = gsHtml(GS.R); box.innerHTML = h; return h ? 1 : 0;
        }
        function gsGo(k, i) {
            const r = GS.R && GS.R[k] && GS.R[k][i]; if (!r) return;
            try { if (typeof audLog === 'function' && k === 'x') {} } catch (e) {}
            if (k === 'x') xtOpenXodim(r.id);
            else if (k === 't') openPassport(r.id);
            else if (k === 'u') { openXodimTree(); const s = $id('xtSearch'); if (s) { s.value = r.k; xtRender(); } }
            else if (k === 'p') openInfraObj(r.id);
            else if (k === 'd') { if (r.k === 'doc') { openND('docs'); ND.doc = r.id; ND.view = 'doc'; ndRender(); } else { openND('arch'); setTimeout(() => ndOpenArch(r.id), 50); } }
            else if (k === 'z') openZam(r.vid, r.no);
        }
        if (typeof filterMainMenu === 'function') filterMainMenu = agmkExtend('filterMainMenu', 'v3.9.0: qidiruv — hamma narsa (xodim, texnika, hujjat, stansiya, zamechaniya)', filterMainMenu, o => function () {
            const r = o.apply(this, arguments);
            try {
                const found = gsShow(), q = (($id('globalSearchInput') || {}).value || '').trim();
                if (found) {
                    const em = $id('main-search-empty'); if (em) em.classList.add('hidden');
                    const ai = $id('mainAiAns'); const isQ = /\?$/.test(q) || q.split(/\s+/).length >= 3;
                    if (ai && !isQ && !/AI javobi/.test(ai.textContent || '')) ai.innerHTML = '';
                }
            } catch (e) { console.error(e); }
            return r;
        });
        // ⓘ — qidiruv ochiq paytda yashirinadi (maydonni toʻsmaydi)
        function gsSrchState() { try { const w = document.querySelector('#screen-main .search-wrap.srch'); document.body.classList.toggle('gs-open', !!(w && w.classList.contains('open'))); } catch (e) {} }
        if (typeof srchOpen === 'function') srchOpen = agmkExtend('srchOpen', 'v3.9.0: ⓘ yashirinadi', srchOpen, o => function () { const r = o.apply(this, arguments); gsSrchState(); return r; });
        if (typeof srchClose === 'function') srchClose = agmkExtend('srchClose', 'v3.9.0: ⓘ qaytadi', srchClose, o => function () { const r = o.apply(this, arguments); gsSrchState(); setTimeout(gsShow, 0); return r; });
        (function () { const st = document.createElement('style'); st.textContent = `
            body.gs-open #screen-main .ui-i-main,body.gs-open #bkRem{display:none!important}
            .gs-box{margin:4px 0 12px;display:flex;flex-direction:column;gap:10px}
            .gs-g{background:rgba(15,23,42,.82);border:1px solid #334155;border-radius:14px;padding:8px 10px}
            .gs-h{font-weight:700;font-size:13px;color:#93c5fd;margin:2px 0 6px;display:flex;justify-content:space-between}.gs-h span{background:#1e3a8a;color:#fff;border-radius:10px;padding:0 8px;font-size:12px}
            .gs-r{padding:8px 6px;border-top:1px solid rgba(51,65,85,.6);cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:2px 8px}.gs-r:first-of-type{border-top:0}
            .gs-r b{font-size:14px;color:#f1f5f9;font-weight:600}.gs-r em{font-style:normal;color:#fbbf24;font-size:12.5px;font-weight:700}.gs-r small{grid-column:1/-1;color:#94a3b8;font-size:12px}
            .gs-r:active{background:rgba(59,130,246,.18)}.gs-off{font-style:normal;color:#fca5a5;font-size:11px;font-weight:400}
            .gs-more{margin-top:4px;width:100%;padding:7px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12.5px}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 2) MENING IMZOM — oflayn ham saqlanadi
        function sigLocKey(t) { return 'agmk_sig_' + cleanTabel(t || (currentUser && currentUser.tabel)); }
        function sigPendKey(t) { return 'agmk_sig_pend_' + cleanTabel(t || (currentUser && currentUser.tabel)); }
        sigLoadMine = async function () {
            let p = null;
            if (sigSrv()) { try { const r = await sigApi('/api/sig/v1/me'); p = r && r.png || null; } catch (e) { p = null; } }
            if (!p) { try { p = localStorage.getItem(sigLocKey()) || null; } catch (e) {} }
            return p;
        };
        async function sigPushPending() {
            try { if (!currentUser || !sigSrv()) return; const k = sigPendKey(); if (localStorage.getItem(k) !== '1') return; const png = localStorage.getItem(sigLocKey()); if (!png) { localStorage.removeItem(k); return; }
                await sigApi('/api/sig/v1/me', 'PUT', { png: png }); localStorage.removeItem(k); showToast('✍️ Imzongiz serverga yuborildi'); } catch (e) {}
        }
        sigSaveMine = async function () {
            if (SGP.mode === 'draw') sigRender();
            if (!SGP.png) { alert('Avval imzo chizing yoki rasm tanlang.'); return; }
            try { localStorage.setItem(sigLocKey(), SGP.png); } catch (e) { alert('⚠️ Telefon xotirasi toʻlgan — imzo saqlanmadi.'); return; }
            let srv = false;
            if (sigSrv()) { try { await sigApi('/api/sig/v1/me', 'PUT', { png: SGP.png }); srv = true; try { localStorage.removeItem(sigPendKey()); } catch (e) {} } catch (e) { try { localStorage.setItem(sigPendKey(), '1'); } catch (x) {} } }
            const b = $id('sgCur'); if (b) b.innerHTML = `<img src="${SGP.png}">`;
            try { if (typeof audLog === 'function') audLog('imzo', 'Imzo saqlandi' + (srv ? ' (serverda)' : ' (telefonda)')); } catch (e) {}
            showToast(srv || !sigSrv() ? '✍️ Imzongiz saqlandi' : '✍️ Imzo telefonda saqlandi — server topilishi bilan oʻzi yuboriladi');
            setTimeout(async () => { mdlClose('sgMine'); try { if (SIG.after) { const id = SIG.after; SIG.after = null; await sigOpenDoc(id); setTimeout(() => sigDoSign(), 300); } } catch (e) {} }, 900); // v3.7: namuna saqlangach imzolash davom etadi
        };
        // Galereya: HEIC va katta rasmlar ham ochiladi
        if (typeof sigImgPick === 'function') sigImgPick = agmkExtend('sigImgPick', 'v3.9.0: HEIC va xatolar', sigImgPick, o => async function (inp) {
            const f = (inp.files || [])[0]; if (!f) return o.apply(this, arguments);
            try { if (typeof looksHeic === 'function' && await looksHeic(f) && typeof convertHeic === 'function') { const b = await convertHeic(f); inp.value = ''; const im = new Image(); im.onload = () => { SGP.img = im; SGP.thr = 0; const c = $id('sgImgCtl'); if (c) c.classList.remove('hidden'); sigImgProc(); }; im.src = URL.createObjectURL(b); return; } } catch (e) {}
            return o.apply(this, arguments);
        });
        window.addEventListener('agmk:login', () => setTimeout(sigPushPending, 1500));
        if (typeof syncNow === 'function') syncNow = agmkExtend('syncNow', 'v3.9.0: kutilayotgan imzo', syncNow, o => async function () { const r = await o.apply(this, arguments); try { if (!SYNC.err) sigPushPending(); } catch (e) {} return r; });

        // ---------------------------------------------------------------- 3) KIRISH: administrator bergan parol, bosqichli bloklash
        //  • Parol — 6 xonali, administrator beradi (PDF). Ilovada faqat PBKDF2 xeshi bor (kir_seed.js), asl parol yoʻq.
        //  • Roʻyxatdan oʻtish va «parolni unutdim» yopiq: parolni faqat administrator beradi / almashtiradi.
        //  • 5 marta xato → 15 s; keyin har xato: 30 s, 1, 2, 3, 4, 5 daqiqa … (5 daqiqada qoladi) — toʻgʻri kiritilguncha.
        //  • Bitta tabelda ikki xodim (3900): har biriga alohida parol — parolga qarab kim kirgani aniqlanadi.
        var KIR = { lockKey: 'agmk_kir_lock', pickKey: 'agmk_kir_pick', ovrKey: 'agmk_kir_ovr', DUR: [15, 30, 60, 120, 180, 240, 300] };
        function kirOn() { return typeof KIR_SEED !== 'undefined' && !!KIR_SEED && !!KIR_SEED.h; }
        // Avtomatik sinovlar (eski tarzda roʻyxatdan oʻtadi) — faqat file:// + webdriver; haqiqiy ilovada hech qachon
        function kirLegacy() { try { return !window.KIR_STRICT && !!navigator.webdriver && (location.protocol === 'file:' || (location.protocol === 'http:' && /^(127\.0\.0\.1|localhost)$/.test(location.hostname))); } catch (e) { return false; } }
        async function kirHash(t, pw, i, it) {
            const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(pw)), 'PBKDF2', false, ['deriveBits']);
            const b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode('agmk-kir:' + t + ':' + (i || 0)), iterations: it || KIR_SEED.it, hash: 'SHA-256' }, k, 128);
            return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join('');
        }
        function kirOvr() { const o = kvGet(KIR.ovrKey, {}); return o && typeof o === 'object' ? o : {}; }
        function kirHas(t) { t = cleanTabel(t); return !!(kirOn() && (KIR_SEED.h[t] || KIR_SEED.d[t] || kirOvr()[t])); }
        // {ok, i (takror boʻlsa — kim), src}
        async function kirVerify(t, pw) {
            t = cleanTabel(t); const o = kirOvr()[t];
            if (o && o.h) { if (await kirHash(t, pw, 0, o.it || KIR_SEED.it) === o.h) return { ok: true, i: o.i || 0, src: 'ovr' }; return { ok: false }; } // administrator almashtirgan parol — eskisi endi ishlamaydi
            if (KIR_SEED.d[t]) { const L = KIR_SEED.d[t]; for (let i = 0; i < L.length; i++) if (await kirHash(t, pw, i) === L[i].h) return { ok: true, i: i, n: L[i].n, src: 'seed' }; return { ok: false }; }
            if (KIR_SEED.h[t]) return { ok: (await kirHash(t, pw, 0)) === KIR_SEED.h[t], i: 0, src: 'seed' };
            return { ok: false, none: true };
        }
        function kirLockAll() { try { return JSON.parse(localStorage.getItem(KIR.lockKey) || '{}') || {}; } catch (e) { return {}; } }
        function kirLockPut(a) { try { localStorage.setItem(KIR.lockKey, JSON.stringify(a)); } catch (e) {} }
        function kirWait(t) { const l = kirLockAll()[cleanTabel(t)]; return l && l.until > Date.now() ? Math.ceil((l.until - Date.now()) / 1000) : 0; }
        function kirWaitTxt(s) { return s >= 60 ? (Math.floor(s / 60) + ' daqiqa' + (s % 60 ? ' ' + (s % 60) + ' soniya' : '')) : s + ' soniya'; }
        function kirFail(t) {
            t = cleanTabel(t); const a = kirLockAll(), l = a[t] || { n: 0, lvl: 0, until: 0 }; l.n++;
            let msg;
            if (!l.lvl && l.n < 5) msg = 'Yana ' + (5 - l.n) + ' ta urinish qoldi, keyin kutish boshlanadi.';
            else { l.lvl = Math.min((l.lvl || 0) + 1, 99); const s = KIR.DUR[Math.min(l.lvl - 1, KIR.DUR.length - 1)]; l.until = Date.now() + s * 1000; msg = 'Juda koʻp xato. ' + kirWaitTxt(s) + ' kuting. Keyingi xatoda kutish uzayadi (eng koʻpi 5 daqiqa).'; }
            a[t] = l; kirLockPut(a); return msg;
        }
        function kirClear(t) { const a = kirLockAll(); delete a[cleanTabel(t)]; kirLockPut(a); }
        function kirSur(n) { return gsFold(String(n || '').split(/\s+/)[0]); }
        function kirPickGet(t) { try { return (JSON.parse(localStorage.getItem(KIR.pickKey) || '{}') || {})[cleanTabel(t)] || null; } catch (e) { return null; } }
        function kirPickSet(t, n) { try { const o = JSON.parse(localStorage.getItem(KIR.pickKey) || '{}') || {}; o[cleanTabel(t)] = n; localStorage.setItem(KIR.pickKey, JSON.stringify(o)); } catch (e) {} }
        if (typeof lookupXodim === 'function') lookupXodim = agmkExtend('lookupXodim', 'v3.9.0: bitta tabelda ikki xodim', lookupXodim, o => function (t) {
            const r = o.apply(this, arguments);
            try { if (r && r.err && /takrorlangan/.test(r.err)) { const k = cleanTabel(t), pk = kirPickGet(k); if (pk) { const f = findXodimsByTabel(k).find(x => kirSur(x.item.name) === kirSur(pk)); if (f) return { rec: f }; } } } catch (e) {}
            return r;
        });
        if (typeof lockLogin === 'function') lockLogin = agmkExtend('lockLogin', 'v3.9.0: administrator bergan parol, bosqichli bloklash', lockLogin, o => async function () {
            if (!kirOn()) return o.apply(this, arguments);
            const err = $id('lkErr'), t = cleanTabel($id('lkTabel').value), pw = $id('lkPw').value;
            if (!t || !pw) { err.classList.remove('lock-ok'); err.innerText = 'Tabel raqami va parolni kiriting.'; return; }
            const w = kirWait(t); if (w) { err.classList.remove('lock-ok'); err.innerText = '⏳ Juda koʻp xato urinish. Kuting: ' + kirWaitTxt(w) + '.'; return; }
            if (kirLegacy() && (!kirHas(t) || (getAccounts()[t] && checkAccPw(t, pw)))) return o.apply(this, arguments); // avtomatik sinovlar: eski hisob
            let v; try { v = await kirVerify(t, pw); } catch (e) { v = { ok: false, err: e }; }
            if (!v.ok) {
                if (kirLegacy()) return o.apply(this, arguments); // sinov: eski hisob bilan
                if (typeof srvOn === 'function' && srvOn() && !v.none) { // telefonda hali yangi parol yoʻq (administrator yaqinda almashtirgan) — server hal qiladi
                    await o.apply(this, arguments); if (!document.body.classList.contains('locked')) { kirClear(t); return; }
                    if (/notoʻgʻri|noto'g'ri/i.test($id('lkErr').innerText || '')) { $id('lkErr').innerText = 'Parol notoʻgʻri. ' + kirFail(t); $id('lkPw').value = ''; } return;
                }
                err.classList.remove('lock-ok');
                if (v.none) { err.innerText = 'Bu tabel raqami uchun parol berilmagan. Parolni administrator beradi — unga murojaat qiling.'; return; }
                err.innerText = 'Parol notoʻgʻri. ' + kirFail(t); $id('lkPw').value = ''; try { if (typeof audLog === 'function') audLog('kirish', 'Xato parol: tabel ' + t); } catch (e) {} return;
            }
            kirClear(t);
            if (KIR_SEED.d[t]) kirPickSet(t, (KIR_SEED.d[t][v.i] || {}).n || '');
            const a = getAccounts(); if (!a[t] || !checkAccPw(t, pw)) { const pin = a[t] && a[t].pin; a[t] = makePwRec(pw); a[t].kir = 1; a[t].created = a[t].created || new Date().toISOString(); if (pin) a[t].pin = pin; saveAccounts(a); }
            return o.apply(this, arguments);
        });
        if (typeof showLockView === 'function') showLockView = agmkExtend('showLockView', 'v3.9.0: roʻyxatdan oʻtish yopiq', showLockView, o => function (v) {
            if (kirOn() && !kirLegacy() && (v === 'register' || v === 'reset')) { o.call(this, 'login'); const e = $id('lkErr'); e.classList.remove('lock-ok'); e.innerText = v === 'register' ? '🔑 Roʻyxatdan oʻtish shart emas: tabel raqamingiz va administrator bergan 6 xonali parol bilan kiring.' : '🔑 Parolni unutgan boʻlsangiz — administratorga murojaat qiling, u yangi parol beradi.'; return; }
            const r = o.apply(this, arguments);
            try { if (v === 'login' && kirOn() && !kirLegacy()) { const L = document.querySelector('#lockViewLogin .lock-links'); if (L && !L.dataset.kir) { L.dataset.kir = 1; L.innerHTML = '<div class="kir-note">🔑 Parolni administrator beradi (6 xonali). Unutgan boʻlsangiz — administratorga murojaat qiling.</div>'; } } } catch (e) {}
            return r;
        });
        // Bitta tabelda ikki xodim — kirish oynasida ogohlantirish
        function kirDupHint() {
            const t = cleanTabel(($id('lkTabel') || {}).value), L = kirOn() && KIR_SEED.d[t]; let h = $id('kirDup');
            if (!h) { const i = $id('lkTabel'); if (!i) return; h = document.createElement('div'); h.id = 'kirDup'; h.className = 'kir-note'; i.parentNode.appendChild(h); }
            h.style.display = L ? '' : 'none'; if (L) h.innerHTML = '👥 Bu tabelda ' + L.length + ' xodim: <b>' + L.map(x => escapeHtml(x.n)).join('</b>, <b>') + '</b>. Oʻz parolingizni kiriting — ilova sizni parolingizdan taniydi.';
        }
        document.addEventListener('input', e => { if (e.target && e.target.id === 'lkTabel') kirDupHint(); });
        // Parolni almashtirish — faqat administrator (xodim parolini administrator beradi)
        if (typeof openAccPw === 'function') openAccPw = agmkExtend('openAccPw', 'v3.9.0: parolni administrator beradi', openAccPw, o => function () {
            if (kirOn() && !kirLegacy() && !isAdminReal()) { alert('🔑 Kirish parolini administrator beradi va almashtiradi.\n\nParolingiz begona odamga maʼlum boʻlib qolgan boʻlsa — darhol administratorga ayting, u yangi parol beradi.'); return; }
            return o.apply(this, arguments);
        });
        // Administrator: xodimga yangi parol berish (eski parol darhol ishlamay qoladi)
        async function kirIssue(tabel) {
            if (!isAdminReal()) { alert('Faqat administrator.'); return; } const t = cleanTabel(tabel); if (!t) return;
            const L = KIR_SEED && KIR_SEED.d[t]; let i = 0;
            if (L) { const a = await uiPrompt('Bu tabelda ' + L.length + ' xodim:\n' + L.map((x, k) => (k + 1) + ') ' + x.n).join('\n') + '\nKimga parol berasiz? (raqami)', '1'); if (a === null) return; i = Math.max(0, Math.min(L.length - 1, (+a || 1) - 1)); }
            const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
            const o = kirOvr(); o[t] = { h: await kirHash(t, code, 0), it: KIR_SEED.it, i: i, at: new Date().toISOString(), by: meTabel() }; kvSet(KIR.ovrKey, o);
            try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; if (typeof storePush === 'function') storePush(); } catch (e) {}
            let srv = '';
            try { if (typeof sigSrv === 'function' && sigSrv()) { await sbFetch('/api/adm/v1/pw', { method: 'POST', body: { tabel: t, i: i, password: (await sha256hex('agmk:' + t + ':' + code)).slice(0, 40) } }); srv = '\n✅ Serverda ham almashtirildi.'; } else srv = '\n📴 Server ulanmagan — server topilganda yangilanadi (telefonlarda sinxronlashdan keyin).'; } catch (e) { srv = '\n⚠️ Serverda almashtirilmadi: ' + agmkErrUz(e); }
            try { if (typeof audLog === 'function') audLog('parol', 'Yangi kirish paroli berildi: tabel ' + t + (L ? ' (' + L[i].n + ')' : '')); } catch (e) {}
            await uiAlertCode(t, code, srv);
        }
        function uiAlertCode(t, code, srv) {
            return new Promise(res => { mdl('kirCode', `<div class="px-h"><b>🔑 Yangi parol</b><button class="mini-btn" onclick="mdlClose('kirCode')">✕</button></div>
                <div class="nd-tip">Tabel <b>${escapeHtml(t)}</b> — yangi kirish paroli. Uni xodimga shaxsan bering. Eski parol endi ishlamaydi.${escapeHtml(srv).replace(/\n/g, '<br>')}</div>
                <div style="font:700 38px/1.2 monospace;letter-spacing:8px;text-align:center;margin:14px 0;color:#fbbf24">${code}</div>
                <div class="pk-btns"><button class="pr" onclick="mdlClose('kirCode')">Tushunarli</button></div>`, true); const m = $id('kirCode'); const t0 = setInterval(() => { if (!m || m.classList.contains('hidden')) { clearInterval(t0); res(); } }, 300); });
        }
        // Administrator uchun: xodim kartochkasida «🔑 Yangi parol»
        if (typeof openItemPasport === 'function') openItemPasport = agmkExtend('openItemPasport', 'v3.9.0: yangi parol tugmasi (admin)', openItemPasport, o => function () {
            const r = o.apply(this, arguments);
            try { const it = getActiveItem(); const box = $id('item-passport-grid'); if (it && box && isAdminReal() && kirOn() && currentSectionType === 'xodim' && cleanTabel(it.tabel) && !$id('kirIssueBtn')) { const b = document.createElement('button'); b.id = 'kirIssueBtn'; b.className = 'action-btn sec'; b.style.margin = '8px 0'; b.textContent = '🔑 Yangi kirish paroli berish (admin)'; b.onclick = () => kirIssue(it.tabel); box.parentNode.insertBefore(b, box.nextSibling); } } catch (e) {}
            return r;
        });
        // Faqat administrator oʻzgartiradi (boshqa telefondan kelgani — tekshiriladi)
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(KIR.ovrKey)) KV_SYNC.keys.push(KIR.ovrKey); } catch (e) {}
        if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.9.0: parollarni faqat admin', syncApply, o => function (rec) { if (rec && rec.kind === 'kv' && rec.data && rec.data.k === KIR.ovrKey && String(rec.data.by) !== ADMIN_TABEL) return null; return o.apply(this, arguments); });
        if (typeof syncLocal === 'function') syncLocal = agmkExtend('syncLocal', 'v3.9.0: parollarni faqat admin yuboradi', syncLocal, o => function () { const L = o.apply(this, arguments); return isAdminReal() ? L : L.filter(x => x.id !== 'kv:' + KIR.ovrKey); });

        // ---------------- Huquq guruhlari (PDF 2-qism) → ilovadagi rollar ----------------
        var KIR_GR = { RAH: ['rahbar'], SEX: ['tex'], KADR: ['kadr'], BUX: ['bux'], MTIH: ['mtih'], MM: ['mm'], MTTB: ['mttb'], PTO: ['tex', 'hisob'], DISP: ['hr'], MASH: ['mash'], TEXU: ['tex'] };
        function kirGroupRoles(t) { if (!kirOn() || !KIR_SEED.g) return []; return (KIR_SEED.g[cleanTabel(t)] || []).reduce((s, g) => s.concat(KIR_GR[g] || []), []); }
        if (typeof rolesAll === 'function') {
            const _raw = rolesAll;
            const RC = { k: null, v: null }; // tez-tez chaqiriladi — natija keshlanadi (rollar oʻzgarsa — qayta hisoblanadi)
            rolesAll = function () { if (!kirOn() || !KIR_SEED.g) return _raw(); let k = null; try { k = localStorage.getItem(ROLE_KEY) || ''; } catch (e) {} if (RC.v && RC.k === k) return Object.assign({}, RC.v);
                const a = _raw(), o = Object.assign({}, a); Object.keys(KIR_SEED.g).forEach(t => { const g = kirGroupRoles(t); if (g.length) o[t] = Array.from(new Set((a[t] || []).concat(g))); }); RC.k = k; RC.v = o; return Object.assign({}, o); };
            roleSet = function (t, r, on) {
                if (!isAdminReal()) { alert('Rollarni faqat admin belgilaydi.'); return; }
                if (!on && kirGroupRoles(t).includes(r)) { alert('Bu rol xodimning huquq guruhidan keladi (lavozimi boʻyicha). Uni olib tashlash uchun guruhini serverdagi «huquq_guruhlari.json» da oʻzgartiring.'); return; }
                const a = _raw(), k = cleanTabel(t); let l = a[k] || []; l = on ? Array.from(new Set(l.concat(r))) : l.filter(x => x !== r);
                if (l.length) a[k] = l; else delete a[k]; a._by = ADMIN_TABEL; a._at = new Date().toISOString(); kvSet(ROLE_KEY, a); try { rolesRender(); } catch (e) {}
            };
            if (typeof rlSet === 'function') rlSet = function (t, lv, to) { // v3.8 bilan bir xil, lekin guruh rollari bazaga yozilmaydi
                if (!isAdmin()) { alert('Rahbar maqomini faqat administrator belgilaydi.'); return; }
                const a = _raw(), k = cleanTabel(t); let l = (a[k] || []).filter(x => !/^rl[123]/.test(x));
                if (lv === 1) l.push('rl1'); else if (lv === 2) l.push('rl2@' + to); else if (lv === 3) l.push('rl3');
                if (l.length) a[k] = l; else delete a[k]; a._by = ADMIN_TABEL; a._at = new Date().toISOString(); kvSet(ROLE_KEY, a);
                try { audLog('👑 Rahbar maqomi: ' + (xodimByTabel(k) || {}).name + ' → ' + (lv ? ['', 'mutlaq rahbar', 'vaqtincha rahbar (' + fmtD(to) + ' gacha)', 'kuzatuvchi'][lv] : 'olib tashlandi')); } catch (e) {}
                try { rolesRender(); } catch (e) {}
            };
        }
        (function () { const st = document.createElement('style'); st.textContent = `.kir-note{margin:8px 0 2px;padding:9px 11px;border-radius:10px;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.35);color:#e2e8f0;font-size:12.5px;line-height:1.45;text-align:left}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 4) IMZO KODI (4 xonali) — xodim oʻzi oʻrnatadi
        //  Hujjatni imzolashda soʻraladi. Unutilsa — kirish paroli bilan yangisi oʻrnatiladi. Server ham tekshiradi.
        var SPIN = { key: 'agmk_sigpin', lock: 'agmk_sigpin_lock' };
        function spAll() { try { return JSON.parse(localStorage.getItem(SPIN.key) || '{}') || {}; } catch (e) { return {}; } }
        function spGet(t) { return spAll()[cleanTabel(t || meTabel())] || null; }
        function spPut(t, v) { const a = spAll(); if (v) a[cleanTabel(t)] = v; else delete a[cleanTabel(t)]; try { localStorage.setItem(SPIN.key, JSON.stringify(a)); } catch (e) {} }
        async function spHash(t, pin, salt) { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveBits']); const b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode('agmk-pin:' + cleanTabel(t) + ':' + salt), iterations: 20000, hash: 'SHA-256' }, k, 128); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''); }
        async function spDerive(t, pin) { return (await sha256hex('agmk-pin:' + cleanTabel(t) + ':' + pin)).slice(0, 40); }
        function spWait() { try { const l = (JSON.parse(localStorage.getItem(SPIN.lock) || '{}') || {})[meTabel()]; return l && l.until > Date.now() ? Math.ceil((l.until - Date.now()) / 1000) : 0; } catch (e) { return 0; } }
        function spFail() { let a = {}; try { a = JSON.parse(localStorage.getItem(SPIN.lock) || '{}') || {}; } catch (e) {} const t = meTabel(), l = a[t] || { n: 0, lvl: 0 }; l.n++; let m;
            if (!l.lvl && l.n < 5) m = 'Yana ' + (5 - l.n) + ' ta urinish qoldi.'; else { l.lvl++; const s = KIR.DUR[Math.min(l.lvl - 1, KIR.DUR.length - 1)]; l.until = Date.now() + s * 1000; m = 'Juda koʻp xato. ' + kirWaitTxt(s) + ' kuting.'; }
            a[t] = l; try { localStorage.setItem(SPIN.lock, JSON.stringify(a)); } catch (e) {} return m; }
        function spClear() { try { const a = JSON.parse(localStorage.getItem(SPIN.lock) || '{}') || {}; delete a[meTabel()]; localStorage.setItem(SPIN.lock, JSON.stringify(a)); } catch (e) {} }
        // 4 raqamli klaviatura (umumiy)
        function spPad(id, title, note, onDone, extra) {
            SPIN.buf = ''; SPIN.done = onDone;
            mdl(id, `<div class="px-h"><b>${title}</b><button class="mini-btn" onclick="spCancel('${id}')">✕</button></div><div class="nd-tip">${note}</div>
                <div class="pin-dots sp-dots" id="spDots"><span></span><span></span><span></span><span></span></div><div id="spErr" class="lock-err" style="min-height:18px;text-align:center"></div>
                <div class="pin-pad sp-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button class="pin-key" onclick="spKey('${id}','${d}')">${d}</button>`).join('')}<button class="pin-key blank" tabindex="-1"></button><button class="pin-key" onclick="spKey('${id}','0')">0</button><button class="pin-key back" onclick="spKey('${id}','<')">⌫</button></div>${extra || ''}`, true);
        }
        function spDots(cls) { const d = $id('spDots'); if (!d) return; d.className = 'pin-dots sp-dots ' + (cls || ''); [...d.children].forEach((s, i) => s.classList.toggle('on', i < SPIN.buf.length)); }
        function spKey(id, k) { if (k === '<') SPIN.buf = SPIN.buf.slice(0, -1); else if (SPIN.buf.length < 4) SPIN.buf += k; spDots(); if (SPIN.buf.length === 4) { const v = SPIN.buf; setTimeout(() => { SPIN.buf = ''; spDots(); SPIN.done && SPIN.done(v); }, 120); } }
        function spCancel(id) { mdlClose(id); const f = SPIN.res; SPIN.res = null; if (f) f(false); }
        function spErr(m) { const e = $id('spErr'); if (e) e.innerText = m || ''; spDots(m ? 'err shake' : ''); }
        // Oʻrnatish / almashtirish. old: tasdiq (eski kod yoki kirish paroli) talab qilinadimi
        function sigPinSetup(forced) {
            return new Promise(res => {
                SPIN.res = res; const had = !!spGet(); let first = null, proof = null;
                const ask2 = () => spPad('spM', '🔢 Imzo kodi', first ? 'Kodni yana bir marta kiriting.' : (forced ? 'Hujjat imzolashdan oldin <b>4 xonali imzo kodi</b>ni oʻrnating. Uni faqat siz bilasiz; imzolashda har safar soʻraladi. Kirish parolidan boshqa kod tanlang.' : 'Yangi 4 xonali imzo kodini kiriting.'), async v => {
                    if (!first) { if (/^(\d)\1{3}$|^(0123|1234|2345|3456|4567|5678|6789|9876|4321)$/.test(v)) { spErr('Juda oddiy kod — boshqasini tanlang.'); return; } first = v; ask2(); return; }
                    if (v !== first) { first = null; spErr('Kodlar mos kelmadi — qaytadan.'); setTimeout(ask2, 700); return; }
                    const salt = Math.random().toString(36).slice(2, 10); const rec = { salt: salt, h: await spHash(meTabel(), v, salt), at: new Date().toISOString(), pend: 1 };
                    spPut(meTabel(), rec); let srv = false;
                    try { if (sigSrv()) { await sigApi('/api/sig/v1/pin', 'PUT', Object.assign({ pin: await spDerive(meTabel(), v) }, proof || {})); srv = true; delete rec.pend; spPut(meTabel(), rec); } } catch (e) { if (e && /403|notoʻgʻri|noto'g'ri/i.test(e.message || '')) { spPut(meTabel(), null); alert('⚠️ Server kodni qabul qilmadi: ' + e.message); mdlClose('spM'); SPIN.res = null; res(false); return; } }
                    try { if (typeof audLog === 'function') audLog('imzo', 'Imzo kodi ' + (had ? 'almashtirildi' : 'oʻrnatildi')); } catch (e) {}
                    mdlClose('spM'); SPIN.res = null; showToast('🔢 Imzo kodi saqlandi' + (srv || !sigSrv() ? '' : ' — serverga keyin yuboriladi')); res(v);
                });
                if (!had) { ask2(); return; }
                // almashtirish: eski kod yoki kirish paroli bilan tasdiqlash
                spPad('spM', '🔢 Imzo kodini almashtirish', 'Avval <b>hozirgi imzo kodi</b>ni kiriting.', async v => {
                    const r = spGet(); if (r && await spHash(meTabel(), v, r.salt) === r.h) { proof = { old: await spDerive(meTabel(), v) }; ask2(); } else spErr('Kod notoʻgʻri.');
                }, `<button class="lock-link" style="margin-top:8px" onclick="sigPinForgot()">Kodni unutdim — kirish paroli bilan</button>`);
                SPIN.forgot = async () => { const pw = await uiPrompt('🔑 Kirish parolingizni kiriting (6 xonali):', ''); if (!pw) return; if (!checkAccPw(meTabel(), pw)) { alert('Kirish paroli notoʻgʻri.'); return; } proof = { pw: (await sha256hex('agmk:' + meTabel() + ':' + pw)).slice(0, 40) }; ask2(); };
            });
        }
        function sigPinForgot() { if (SPIN.forgot) SPIN.forgot(); }
        // Imzolashdan oldin: kod soʻraladi; toʻgʻri boʻlsa — serverga ham yuboriladi
        sigPinOk = async function () {
            if (!currentUser) return false;
            if (!spGet()) { const v = await sigPinSetup(true); if (!v) return false; SIG.pinD = await spDerive(meTabel(), v); return true; }
            return new Promise(res => {
                SPIN.res = res;
                const w = spWait();
                spPad('spM', '🔢 Imzo kodi', 'Imzoni siz qoʻyayotganingizni tasdiqlash uchun <b>4 xonali imzo kodingiz</b>ni kiriting.' + (w ? '<br>⏳ ' + kirWaitTxt(w) + ' kuting.' : ''), async v => {
                    const ww = spWait(); if (ww) { spErr('⏳ ' + kirWaitTxt(ww) + ' kuting.'); return; }
                    const r = spGet(); if (r && await spHash(meTabel(), v, r.salt) === r.h) { spClear(); SIG.pinD = await spDerive(meTabel(), v); mdlClose('spM'); SPIN.res = null; res(true); return; }
                    spErr('Kod notoʻgʻri. ' + spFail()); try { if (typeof audLog === 'function') audLog('imzo', 'Imzo kodi xato kiritildi'); } catch (e) {}
                }, `<button class="lock-link" style="margin-top:8px" onclick="spCancel('spM'); sigPinSetup()">Kodni unutdim / almashtirish</button>`);
            });
        };
        // Imzolash soʻroviga kod qoʻshiladi (server tekshiradi)
        if (typeof sigApi === 'function') sigApi = agmkExtend('sigApi', 'v3.9.0: imzo kodi', sigApi, o => async function (path, method, body) {
            if (method === 'POST' && /\/api\/sign\/v1\/docs\/[^/]+\/sign$/.test(String(path))) {
                if (SIG.pinD) { body = Object.assign({}, body || {}, { pin: SIG.pinD }); SIG.pinD = null; }
                try { if (localStorage.getItem(sigPendKey()) === '1') await sigPushPending(); } catch (e) {} // telefonda saqlangan imzo — avval serverga
            }
            return o.call(this, path, method, body);
        });
        // Telefonda (serversiz) oʻrnatilgan kod serverga birinchi imzolashda yetib boradi: server kodi boʻlmasa — shu kod qabul qilinadi
        // «Mening imzom»da imzo kodi qatori
        if (typeof sigOpenMine === 'function') sigOpenMine = agmkExtend('sigOpenMine', 'v3.9.0: imzo kodi', sigOpenMine, o => function () {
            const r = o.apply(this, arguments);
            try { const cur = $id('sgCur'); if (cur && !$id('spRow')) { const d = document.createElement('div'); d.id = 'spRow'; d.className = 'sp-row'; d.innerHTML = `<span>🔢 Imzo kodi: <b>${spGet() ? 'oʻrnatilgan' : 'oʻrnatilmagan'}</b></span><button class="mini-btn" onclick="sigPinSetup()">${spGet() ? 'Almashtirish' : 'Oʻrnatish'}</button>`; cur.parentNode.insertBefore(d, cur.nextSibling); } } catch (e) {}
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = `.sp-row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:8px 0;padding:8px 10px;border-radius:10px;background:#0f172a;border:1px solid #334155;font-size:13px;color:#e2e8f0}
            .sp-dots{justify-content:center;margin:12px 0 4px}.sp-pad{max-width:300px;margin:0 auto}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 5) BIRINCHI ULANISHDA SINXRONLASH
        //  Telefon serversiz ishlatilgan boʻlsa: birinchi ulanishda serverdagi (eski) maʼlumot telefonda oʻzgartirilgan
        //  texnika yozuvlari ustidan yozilmaydi — ular serverga yuboriladi. Oʻzgarmaganlari serverdan yangilanadi.
        var SBASE = { key: 'agmk_sync_base' };
        function sbNever() { const st = syncGet(SYNC_ST, null); return !st || !st.hash || !Object.keys(st.hash).length; }
        function sbCapture() {
            try { if (!sbNever() || localStorage.getItem(SBASE.key)) return; const h = {};
                syncLocal().forEach(x => { if (x.kind === 'unit') h[x.id] = syncHash(JSON.stringify(x.data)); });
                localStorage.setItem(SBASE.key, JSON.stringify({ at: new Date().toISOString(), h: h })); } catch (e) {}
        }
        (function () { const ol = window.onload; window.onload = function () { const r = typeof ol === 'function' ? ol.apply(this, arguments) : undefined; try { sbCapture(); } catch (e) {} return r; }; })(); // baza yuklangan zahoti, foydalanuvchi biror narsa oʻzgartirishidan oldin
        if (typeof syncNow === 'function') syncNow = agmkExtend('syncNow', 'v3.9.0: birinchi ulanishda oflayn oʻzgarishlar saqlanadi', syncNow, o => async function () {
            let first = 0;
            try { if (sbNever() && typeof syncReady === 'function' && syncReady()) { const B = JSON.parse(localStorage.getItem(SBASE.key) || 'null');
                if (B && B.h) { const st = syncGet(SYNC_ST, { hash: {}, last: '1970-01-01T00:00:00Z', msg: 0 }); st.hash = st.hash || {};
                    // faqat telefonda oʻzgartirilgan yozuvlar belgilanadi: server ularni ustidan yozmaydi, ular serverga yuboriladi; qolganlari odatdagidek
                    syncLocal().forEach(x => { if (x.kind === 'unit' && B.h[x.id] && !st.hash[x.id] && syncHash(JSON.stringify(x.data)) !== B.h[x.id]) { st.hash[x.id] = B.h[x.id]; first++; } });
                    if (first) syncPut(SYNC_ST, st); } } } catch (e) {}
            const r = await o.apply(this, arguments);
            try { if (!SYNC.err && first) { showToast('🔄 Birinchi ulanish: telefonda oʻzgartirilgan ' + first + ' ta yozuv serverga yuborildi (ustidan yozilmadi)'); try { if (typeof audLog === 'function') audLog('sinxron', 'Birinchi ulanish: ' + first + ' ta oflayn oʻzgarish yuborildi'); } catch (e) {} }
                if (!SYNC.err && SYNC.lastOk && !sbNever()) localStorage.removeItem(SBASE.key); } catch (e) {}
            return r;
        });

        // ---------------------------------------------------------------- 6) KUNLIK ZAXIRA ESLATMASI
        //  Server bilan bugun sinxronlanmagan boʻlsa (maʼlumot faqat telefonda) — soat 15:00 dan keyin bosh sahifada eslatma.
        var BKR = { last: 'agmk_bk_last', snooze: 'agmk_bk_snooze' };
        if (typeof bkExport === 'function') bkExport = agmkExtend('bkExport', 'v3.9.0: oxirgi zaxira sanasi', bkExport, o => async function () { const b0 = BKP.last; const r = await o.apply(this, arguments); try { if (BKP.last && BKP.last !== b0) { localStorage.setItem(BKR.last, todayISO()); bkRemCheck(); } } catch (e) {} return r; });
        function bkRemNeed() {
            if (!currentUser || document.body.classList.contains('locked')) return false; const d = todayISO();
            try { if (localStorage.getItem(BKR.last) === d || localStorage.getItem(BKR.snooze) === d) return false; } catch (e) { return false; }
            try { if (typeof SYNC !== 'undefined' && SYNC.lastOk && new Date(SYNC.lastOk).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)) return false; } catch (e) {}
            return new Date().getHours() >= 15;
        }
        function bkRemCheck() {
            const list = $id('main-card-list'); if (!list) return; let c = $id('bkRem');
            if (!bkRemNeed()) { if (c) c.remove(); return; }
            if (!c) { c = document.createElement('div'); c.id = 'bkRem'; c.className = 'bk-rem'; list.parentNode.insertBefore(c, list); }
            const last = (() => { try { return localStorage.getItem(BKR.last); } catch (e) { return null; } })();
            c.innerHTML = `<div><b>💾 Bugungi zaxira nusxa olinmagan</b><small>Bugun server bilan sinxronlanmadi — maʼlumotlar faqat shu telefonda. ${last ? 'Oxirgi zaxira: ' + fmtISO(last) + '.' : 'Hali zaxira olinmagan.'}</small></div><span><button class="mini-btn pr" onclick="bkExport()">💾 Zaxira olish</button><button class="mini-btn" onclick="try{localStorage.setItem('${BKR.snooze}', todayISO())}catch(e){} bkRemCheck()">Ertaga</button></span>`;
        }
        window.addEventListener('agmk:login', () => setTimeout(bkRemCheck, 3000)); if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.9.0: zaxira eslatmasi', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(bkRemCheck, 2500); return r; }); document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(bkRemCheck, 800); }); setInterval(bkRemCheck, 30 * 60000); setTimeout(bkRemCheck, 5000);
        (function () { const st = document.createElement('style'); st.textContent = `.bk-rem{display:flex;gap:10px;align-items:center;justify-content:space-between;margin:0 0 10px;padding:10px 12px;border-radius:14px;background:rgba(120,53,15,.85);border:1px solid #f59e0b;color:#fef3c7}.bk-rem b{display:block;font-size:13.5px}.bk-rem small{display:block;font-size:12px;opacity:.9;margin-top:2px}.bk-rem span{display:flex;flex-direction:column;gap:6px}.bk-rem .pr{background:#f59e0b;color:#111;border-color:#f59e0b;font-weight:700}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 7) SMENA GPS (BFF uslubida) va 📡 JONLI XARITA
        //  • Texnikani qabul qilish — faqat joylashuvga ruxsat va GPS yoqilgan boʻlsa. Ruxsat bermasa — qabul ochilmaydi.
        //  • Qabul qilinganda Android xizmati (bildirishnomada «smena davom etmoqda») — ilova yopiq/ekran oʻchiq boʻlsa ham.
        //  • Topshirilganda GPS darhol oʻchadi va serverdan joylashuv oʻchiriladi: smenadan tashqarida (taksi, uy, oʻz mashinasi) kuzatilmaydi.
        //  • Rels texnikasi (lokomotiv, drezina) nuqtasi OSM temir yoʻliga yopishtiriladi; avtotraktor — yoʻl xaritasida.
        var LV = { map: null, lay: null, trl: null, sel: null, t: null, q: '', drainT: null, ptsQ: [] };
        function gpsNat() { try { return !!(window.AgmkNative && typeof AgmkNative.gpsState === 'function'); } catch (e) { return false; } }
        function gpsSt() { try { return JSON.parse(AgmkNative.gpsState() || '{}') || {}; } catch (e) { return {}; } }
        function gpsGateSkip() { try { return !window.GPS_STRICT && location.protocol === 'file:' && !!navigator.webdriver; } catch (e) { return false; } }
        function gpsWaitFor(fn, ms) { return new Promise(res => { const t0 = Date.now(); const k = setInterval(() => { let v = false; try { v = fn(); } catch (e) {} if (v || Date.now() - t0 > ms || LV.gateCancel) { clearInterval(k); res(!!v); } }, 600); }); }
        function gpsGateMdl(title, body, btn, act) {
            LV.gateCancel = false;
            mdl('gpsGate', `<div class="px-h"><b>${title}</b><button class="mini-btn" onclick="LV.gateCancel=true; mdlClose('gpsGate')">✕</button></div><div class="nd-tip">${body}</div>
                <div class="gps-why">🔒 Joylashuv <b>faqat smena davomida</b> va faqat <b>korxona serveriga</b> yuboriladi. Texnikani topshirganingizda GPS <b>oʻzi oʻchadi</b> — ishdan tashqarida (uyda, taksida, oʻz mashinangizda) kuzatilmaysiz.</div>
                <div class="pk-btns"><button onclick="LV.gateCancel=true; mdlClose('gpsGate')">Bekor</button><button class="pr" id="gpsGateBtn">${btn}</button></div>`, true);
            const b = $id('gpsGateBtn'); if (b) b.onclick = act;
        }
        // true — qabul qilish mumkin
        async function gpsGate() {
            if (gpsGateSkip()) return true;
            if (gpsNat()) {
                let s = gpsSt();
                if (!s.perm) { gpsGateMdl('📍 Joylashuvga ruxsat kerak', 'Texnikani qabul qilish uchun ilovaga <b>joylashuvdan foydalanish</b>ga ruxsat bering («Ilovadan foydalanish vaqtida» yoki «Har doim»).', '📍 Ruxsat berish', () => { try { AgmkNative.gpsPerm(); } catch (e) {} });
                    const ok = await gpsWaitFor(() => gpsSt().perm, 60000); mdlClose('gpsGate'); if (!ok) { alert('⛔ Joylashuvga ruxsat berilmadi — texnikani qabul qilib boʻlmaydi.\n\nRuxsat: Telefon sozlamalari → Ilovalar → AGMK-STTB → Ruxsatlar → Joylashuv.'); return false; } s = gpsSt(); }
                if (!s.gps) { gpsGateMdl('🛰 GPS oʻchiq', 'Telefoningizda <b>joylashuv (GPS)</b> oʻchirilgan. Yoqing va ilovaga qayting.', '⚙️ GPS ni yoqish', () => { try { AgmkNative.gpsSettings(); } catch (e) {} });
                    const ok = await gpsWaitFor(() => gpsSt().gps, 90000); mdlClose('gpsGate'); if (!ok) { alert('⛔ GPS yoqilmadi — texnikani qabul qilib boʻlmaydi.'); return false; } }
                return true;
            }
            if (!navigator.geolocation) { alert('⛔ Bu qurilmada joylashuv (GPS) yoʻq — texnikani qabul qilib boʻlmaydi.'); return false; }
            const r = await new Promise(res => { try { navigator.geolocation.getCurrentPosition(p => res({ ok: 1, p: p }), e => res({ ok: 0, c: e && e.code }), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }); } catch (e) { res({ ok: 0, c: 2 }); } });
            if (r.ok) { MS.fix = { lat: r.p.coords.latitude, lon: r.p.coords.longitude, acc: r.p.coords.accuracy, t: Date.now() }; return true; }
            if (r.c === 1) { alert('⛔ Joylashuvga ruxsat berilmadi — texnikani qabul qilib boʻlmaydi.\n\nBrauzer/telefon sozlamalarida bu ilovaga joylashuvga ruxsat bering.'); return false; }
            return await uiConfirm('🛰 GPS signali hozircha yoʻq (bino ichida boʻlishi mumkin).\nRuxsat bor — signal chiqishi bilan joylashuv yuboriladi.\n\nQabul qilinsinmi?');
        }
        function gpsTitle(sm) { const u = sm && msUnit(sm.unitId), n = sm ? sm.unitName : 'Texnika', m = u ? [u.marka, u.model].filter(x => x && !String(n).includes(x)).join(' ') : ''; return n + (m ? ' · ' + m : ''); }
        if (typeof mashTake === 'function') mashTake = agmkExtend('mashTake', 'v3.9.0: GPS ruxsatisiz qabul yoʻq', mashTake, o => async function (id) {
            const v = msUnit(id); if (!v) return o.apply(this, arguments);
            if (!(await gpsGate())) { showToast('⛔ Texnika qabul qilinmadi: joylashuv (GPS) kerak'); return; }
            return o.apply(this, arguments);
        });
        // GPS: Android xizmati (fon) yoki brauzer
        if (typeof msGpsStart === 'function') msGpsStart = agmkExtend('msGpsStart', 'v3.9.0: fon xizmati', msGpsStart, o => function (once) {
            if (!gpsNat() || once) return o.apply(this, arguments);
            const sm = mySmena(); if (!sm) return;
            try { AgmkNative.gpsStart(gpsTitle(sm)); } catch (e) { return o.apply(this, arguments); }
            MS.watch = 'native'; clearInterval(LV.drainT); LV.drainT = setInterval(gpsDrain, 15000); setTimeout(gpsDrain, 3000);
        });
        if (typeof msGpsStop === 'function') msGpsStop = agmkExtend('msGpsStop', 'v3.9.0: fon xizmati toʻxtaydi', msGpsStop, o => function () {
            clearInterval(LV.drainT); LV.drainT = null; LV.ptsQ = [];
            if (gpsNat()) { try { AgmkNative.gpsStop(); } catch (e) {} if (MS.watch === 'native') MS.watch = null; }
            return o.apply(this, arguments);
        });
        function gpsDrain() {
            if (!gpsNat()) return; const sm = mySmena(); if (!sm) { try { AgmkNative.gpsStop(); } catch (e) {} clearInterval(LV.drainT); return; }
            let P = []; try { P = JSON.parse(AgmkNative.gpsTake() || '[]') || []; } catch (e) {}
            P.sort((a, b) => a.t - b.t).forEach(p => { MS.fix = { lat: p.lat, lon: p.lon, acc: p.acc, t: p.t || Date.now(), spd: p.spd >= 0 ? p.spd * 3.6 : null, brg: p.brg >= 0 ? p.brg : null }; try { msTrack(MS.fix); } catch (e) {} LV.ptsQ.push([Math.round((p.t || Date.now()) / 1000), +p.lat.toFixed(6), +p.lon.toFixed(6), Math.round(p.acc || 0), p.spd >= 0 ? Math.round(p.spd * 36) / 10 : -1]); });
            if (LV.ptsQ.length > 600) LV.ptsQ = LV.ptsQ.slice(-600);
            if (P.length) { try { msPosSend(true); } catch (e) {} try { if (MS.tab === 'smena' && $id('screen-mash') && $id('screen-mash').classList.contains('active')) { const g = document.querySelector('#screen-mash .ms-gps'); if (g) g.textContent = '📍 Joylashuv yuborilmoqda (±' + Math.round(MS.fix.acc || 0) + ' m)' + (MS.fix.spd != null ? ' · ' + Math.round(MS.fix.spd) + ' km/soat' : ''); } } catch (e) {} }
        }
        document.addEventListener('visibilitychange', () => { if (!document.hidden && gpsNat() && mySmena && mySmena()) setTimeout(gpsDrain, 400); });
        // Ilova ochilganda: smena yoʻq — xizmat toʻxtatiladi; smena bor — xizmat davom ettiriladi (telefon qayta yoqilgan boʻlsa)
        function gpsResume() { try { if (!gpsNat() || !currentUser || !currentUser.tabel || typeof mySmena !== 'function') return; const s = gpsSt(), sm = mySmena(); if (!sm && s.on) AgmkNative.gpsStop(); else if (sm && !s.on && s.perm) msGpsStart(); else if (sm && s.on && !LV.drainT) { MS.watch = 'native'; LV.drainT = setInterval(gpsDrain, 15000); gpsDrain(); } } catch (e) {} }
        setTimeout(gpsResume, 6000); window.addEventListener('agmk:login', () => setTimeout(gpsResume, 4000));
        if (typeof logout === 'function') logout = agmkExtend('logout', 'v3.9.0: chiqishda GPS toʻxtaydi', logout, o => async function () { const r = await o.apply(this, arguments); try { if (document.body.classList.contains('locked') && gpsNat()) { AgmkNative.gpsStop(); clearInterval(LV.drainT); LV.drainT = null; } } catch (e) {} return r; });
        // Serverga: tezlik, yoʻnalish, lavozim, texnika modeli va oxirgi nuqtalar (izi)
        if (typeof sbFetch === 'function') sbFetch = agmkExtend('sbFetch', 'v3.9.0: joylashuvga qoʻshimcha', sbFetch, o => function (path, opt) {
            try { if (path === '/api/pos/v1' && opt && opt.method === 'POST' && opt.body && opt.body.lat !== undefined) { const sm = mySmena(), u = sm && msUnit(sm.unitId), f = MS.fix || {};
                opt = Object.assign({}, opt, { body: Object.assign({}, opt.body, { spd: f.spd != null ? Math.round(f.spd) : undefined, brg: f.brg != null ? Math.round(f.brg) : undefined, lav: msLav(), model: u ? [u.naim, u.marka, u.model].filter(Boolean).join(' ').slice(0, 80) : '', kind: sm ? sm.kind : '', pts: LV.ptsQ.splice(0, 300) }) }); } } catch (e) {}
            return o.call(this, path, opt);
        });

        // ---------------- 📡 Jonli xarita (rahbariyat, dispetcher, texnika masteri) ----------------
        if (typeof mashRender === 'function') mashRender = agmkExtend('mashRender', 'v3.9.0: jonli xarita yorligʻi', mashRender, o => function () {
            if (MS.tab === 'live' && nsResp()) { const tabs = [['smena', '🚂 Mening smenam'], ['nosoz', '🆘 Nosozliklar'], ['live', '📡 Jonli xarita'], ['xodim', '👥 Smenadagilar'], ['fuel', '⛽ Yoqilgʻi']]; secTabs('screen-mash', tabs, 'live', 'mashTab'); lvRender(); return; }
            lvStop(); const r = o.apply(this, arguments);
            try { if (nsResp()) { const t = document.querySelector('#screen-mash .sec-tabs'); if (t && !t.querySelector('[data-lv]')) { const i = document.createElement('i'); i.dataset.lv = 1; i.textContent = '📡 Jonli xarita'; i.onclick = () => mashTab('live'); const ref = t.children[2] || null; t.insertBefore(i, ref); } } } catch (e) {}
            return r;
        });
        function lvStop() { clearInterval(LV.t); LV.t = null; }
        function lvAgo(s) { s = Math.max(0, Math.round(s || 0)); return s < 60 ? 'hozirgina' : s < 3600 ? Math.floor(s / 60) + ' daq oldin' : Math.floor(s / 3600) + ' soat oldin'; }
        function lvIni(n) { const p = String(n || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + ((p[1] || '')[0] || '')).toUpperCase(); }
        function lvState(p) { if (p.sos) return 'sos'; if (p.ago > 300) return 'old'; return (p.spd || 0) >= 3 ? 'mov' : 'stop'; }
        function lvIc(p) { const u = msUnit(+p.uid) || msUnit(p.uid); const k = p.kind || (u && u.kind) || ''; return k === 'lok' ? '🚂' : k === 'avto' ? '🚚' : k === 'yol' ? '🛤️' : '📍'; }
        function lvRender() {
            const b = secBody('screen-mash'); if (!b) return;
            b.innerHTML = `<div class="lv-wrap"><div id="lvMap" class="lv-map"></div><div class="lv-leg"><i class="mov"></i>harakatda <i class="stop"></i>toʻxtagan <i class="old"></i>5 daq+ signal yoʻq <i class="sos"></i>🆘</div>
                <div class="lv-sheet"><input id="lvQ" class="search-box" placeholder="🔍 Ism, tabel, texnika…" oninput="LV.q=this.value; lvList()"><div id="lvCard"></div><div id="lvList"><div class="hs-ok">⏳ Yuklanmoqda…</div></div></div></div>`;
            setTimeout(() => { lvMapInit(); lvTick(true); }, 30); lvStop(); LV.t = setInterval(() => { if (MS.tab !== 'live' || !$id('lvMap')) { lvStop(); return; } lvTick(); }, 10000);
        }
        function lvMapInit() {
            const el = $id('lvMap'); if (!el || typeof L === 'undefined') return; if (LV.map) { try { LV.map.remove(); } catch (e) {} }
            const m = LV.map = L.map(el, { zoomControl: true, attributionControl: true }).setView([40.86, 69.6], 12); m.attributionControl.setPrefix(false);
            L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
            try { if (typeof osmPolys === 'function') { m.createPane('lvRail').style.zIndex = 350; osmPolys(m, { pane: 'lvRail' }).addTo(m); } } catch (e) {}
            LV.trl = L.layerGroup().addTo(m); LV.lay = L.layerGroup().addTo(m); LV.fit = true;
        }
        async function lvTick(force) {
            const P = await msPosLoad(true); LV.P = (P || []).slice();
            lvDraw(); lvList(); if (LV.sel) lvCard(LV.sel, true);
        }
        function lvSnap(p) { try { const u = msUnit(+p.uid) || msUnit(p.uid), k = p.kind || (u && u.kind); if (k !== 'avto' && typeof osmSnap === 'function') { const s = osmSnap(p.lat, p.lon, Math.max(25, (p.acc || 0) * 0.8)); if (s && !s.off) return [s.lat, s.lon]; } } catch (e) {} return [p.lat, p.lon]; }
        function lvDraw() {
            if (!LV.map || !LV.lay) return; LV.lay.clearLayers(); const E = escapeHtml, B = [];
            (LV.P || []).forEach(p => { const st = lvState(p), ll = lvSnap(p); B.push(ll);
                const arr = p.brg != null && st === 'mov' ? `<b class="lv-arr" style="transform:rotate(${+p.brg}deg)">▲</b>` : '';
                L.marker(ll, { icon: L.divIcon({ className: 'lv-ic', html: `<div class="lv-mk ${st}${LV.sel === p.tabel ? ' sel' : ''}" onclick="lvCard('${E(p.tabel)}')">${arr}<span class="lv-av">${E(lvIni(p.name))}</span><span class="lv-u">${lvIc(p)}</span><small>${E(String(p.name || '').split(' ')[0])}${st === 'mov' && p.spd != null ? ' · ' + Math.round(p.spd) + ' km/s' : ''}</small></div>`, iconSize: [0, 0] }), zIndexOffset: st === 'sos' ? 1000 : 500 }).addTo(LV.lay); });
            if (LV.fit && B.length) { LV.fit = false; try { LV.map.fitBounds(B, { padding: [40, 40], maxZoom: 15 }); } catch (e) {} }
        }
        function lvList() {
            const box = $id('lvList'); if (!box) return; const E = escapeHtml, q = gsFold(LV.q || '');
            const L0 = (LV.P || []).filter(p => !q || gsFold([p.name, p.tabel, p.unit, p.model, p.lav].join(' ')).includes(q)).sort((a, b) => (a.sos ? 0 : 1) - (b.sos ? 0 : 1) || (a.ago || 0) - (b.ago || 0));
            box.innerHTML = L0.length ? L0.map(p => { const st = lvState(p); return `<div class="lv-row ${st}" onclick="lvCard('${E(p.tabel)}', false, true)"><span class="lv-av">${E(lvIni(p.name))}</span><div><b>${E(p.name)}</b><small>${lvIc(p)} ${E(p.unit || '')}${p.model ? ' · ' + E(p.model) : ''}</small><small>${E(p.lav || '')}</small></div><em>${st === 'mov' ? Math.round(p.spd || 0) + ' km/s' : st === 'sos' ? '🆘' : st === 'old' ? '⚪' : '⏸'}<small>${lvAgo(p.ago)}</small></em></div>`; }).join('')
                : `<div class="hs-ok">Hozir smenada GPS yuborayotgan xodim yoʻq.<br><small>Mashinist texnikani qabul qilishi bilan shu yerda koʻrinadi.</small></div><div class="ms-b2" style="margin-top:6px"><button onclick="bfStart()">🧪 Temir yoʻl demo</button><button onclick="rdStart()">🧪 Avtotraktor demo</button></div>`;
        }
        async function lvCard(tabel, quiet, fly) {
            const p = (LV.P || []).find(x => x.tabel === tabel); const box = $id('lvCard'); if (!box) return; if (!p) { box.innerHTML = ''; LV.sel = null; return; }
            LV.sel = tabel; const E = escapeHtml, st = lvState(p), x = (findXodimsByTabel(tabel)[0] || {}).item || {}, sm = msActive().find(s => s.tabel === tabel);
            box.innerHTML = `<div class="lv-card ${st}"><div class="lv-ch"><span class="lv-av big">${E(lvIni(p.name))}</span><div><b>${E(p.name)}</b><small>${E(p.lav || x.lavozim || '')}</small></div><button class="mini-btn" onclick="LV.sel=null; $id('lvCard').innerHTML=''; LV.trl && LV.trl.clearLayers(); lvDraw()">✕</button></div>
                <div class="lv-kv"><span>${lvIc(p)} Texnika</span><b>${E(p.unit || '—')}${p.model ? '<small>' + E(p.model) + '</small>' : ''}</b><span>⚡ Holat</span><b>${st === 'mov' ? 'Harakatda · ' + Math.round(p.spd || 0) + ' km/soat' : st === 'stop' ? 'Toʻxtagan' : st === 'sos' ? '🆘 Nosozlik signali' : 'Signal yoʻq (' + lvAgo(p.ago) + ')'}</b>
                <span>🕒 Yangilangan</span><b>${lvAgo(p.ago)} · ±${Math.round(p.acc || 0)} m</b>${sm ? `<span>🚦 Smena</span><b>${E(msHM(sm.start))} dan${(() => { try { return ' · ' + E(msTripTxt(sm).split(' › ').slice(1).join(' · ')); } catch (e) { return ''; } })()}</b>` : ''}</div>
                <div class="ms-b2">${x.phone ? `<button onclick="location.href='${telHref(x.phone)}'">📞 Qoʻngʻiroq</button>` : ''}<button onclick="lvTrail('${E(tabel)}')">〰️ Bosib oʻtgan yoʻl</button>${p.uid ? `<button onclick="openPassport(${JSON.stringify(+p.uid || p.uid)})">📄 Pasport</button>` : ''}</div></div>`;
            if (fly && LV.map) try { LV.map.flyTo(lvSnap(p), Math.max(LV.map.getZoom(), 15), { duration: .6 }); } catch (e) {}
            if (!quiet) lvDraw();
        }
        async function lvTrail(tabel) {
            if (!LV.map || !LV.trl) return; LV.trl.clearLayers(); let T = [];
            try { T = (await sbFetch('/api/pos/v1/trail?tabel=' + encodeURIComponent(tabel))) || []; } catch (e) {}
            const p = (LV.P || []).find(x => x.tabel === tabel); const pts = T.map(x => lvSnap({ lat: x[1], lon: x[2], acc: x[3], uid: p && p.uid, kind: p && p.kind }));
            if (pts.length < 2) { showToast('〰️ Hali iz yoʻq (smena yangi boshlangan yoki faqat bitta nuqta)'); return; }
            L.polyline(pts, { color: '#38bdf8', weight: 4, opacity: .85 }).addTo(LV.trl); L.circleMarker(pts[0], { radius: 6, color: '#22c55e', fillOpacity: 1 }).bindTooltip('Smena boshi').addTo(LV.trl);
            try { LV.map.fitBounds(pts, { padding: [40, 40] }); } catch (e) {}
        }
        (function () { const st = document.createElement('style'); st.textContent = `
            .gps-why{margin:10px 0;padding:10px;border-radius:10px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.4);font-size:12.5px;color:#d1fae5;line-height:1.45}
            .lv-wrap{display:flex;flex-direction:column;gap:8px}.lv-map{height:52vh;min-height:300px;border-radius:14px;overflow:hidden;border:1px solid #334155}
            .lv-leg{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:11.5px;color:#e2e8f0;align-items:center;background:rgba(15,23,42,.88);border-radius:10px;padding:6px 10px}.lv-leg i{display:inline-block;width:10px;height:10px;border-radius:50%}
            .lv-leg i.mov,.lv-mk.mov .lv-av,.lv-row.mov .lv-av{background:#16a34a}.lv-leg i.stop,.lv-mk.stop .lv-av,.lv-row.stop .lv-av{background:#2563eb}.lv-leg i.old,.lv-mk.old .lv-av,.lv-row.old .lv-av{background:#64748b}.lv-leg i.sos,.lv-mk.sos .lv-av,.lv-row.sos .lv-av{background:#dc2626}
            .lv-ic{background:none;border:0}.lv-mk{position:relative;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
            .lv-mk .lv-av{width:38px;height:38px;border-radius:50%;border:3px solid #fff;color:#fff;font:700 14px/32px system-ui;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.45)}
            .lv-mk.sel .lv-av{outline:3px solid #fbbf24}.lv-mk.sos .lv-av{animation:lvp 1s infinite}@keyframes lvp{50%{box-shadow:0 0 0 10px rgba(220,38,38,.35)}}
            .lv-mk .lv-u{position:absolute;top:-6px;right:-10px;font-size:15px}.lv-mk small{margin-top:2px;padding:1px 6px;border-radius:8px;background:rgba(15,23,42,.88);color:#fff;font-size:11px;white-space:nowrap}
            .lv-arr{position:absolute;top:-16px;color:#16a34a;font-size:14px;text-shadow:0 0 3px #fff}
            .lv-sheet{background:rgba(15,23,42,.9);border:1px solid #334155;border-radius:14px;padding:8px}
            .lv-row{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:8px 4px;border-top:1px solid rgba(51,65,85,.6);cursor:pointer}.lv-row:first-child{border-top:0}
            .lv-row .lv-av{width:34px;height:34px;border-radius:50%;color:#fff;font:700 13px/34px system-ui;text-align:center}.lv-row b{display:block;font-size:13.5px;color:#f1f5f9}.lv-row small{display:block;font-size:11.5px;color:#94a3b8}
            .lv-row em{font-style:normal;text-align:right;font-size:12.5px;color:#e2e8f0;font-weight:700}
            .lv-card{margin:6px 0 8px;padding:10px;border-radius:12px;background:#0b1220;border:1px solid #38bdf8}.lv-ch{display:flex;gap:10px;align-items:center}.lv-ch div{flex:1}.lv-ch .mini-btn{flex:0 0 auto;width:auto;min-width:36px}.lv-ch b{display:block;color:#fff}.lv-ch small{color:#94a3b8;font-size:12px}
            .lv-av.big{width:44px;height:44px;border-radius:50%;background:#2563eb;color:#fff;font:700 16px/44px system-ui;text-align:center}.lv-card.mov .lv-av.big{background:#16a34a}.lv-card.sos .lv-av.big{background:#dc2626}.lv-card.old .lv-av.big{background:#64748b}
            .lv-kv{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:8px 0;font-size:12.5px}.lv-kv span{color:#94a3b8}.lv-kv b{color:#e2e8f0;font-weight:600}.lv-kv b small{display:block;color:#94a3b8;font-weight:400}`; document.head.appendChild(st); })();

