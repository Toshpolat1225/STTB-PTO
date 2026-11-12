
        // =====================================================================
        // v3.2 — 👷 SHTAT ROʻYXATI (20.05.2026): barcha xodimlar tabel raqami bilan
        //  • Manba: «Sanoat temir yoʻl transporti boshqarmasi rahbarlari, mutaxassislari va texnik xodimlarining
        //    tasdiqlangan shtat jadvaliga muvofiq roʻyxati (2026-yil 20-may holatiga)».
        //  • F.I.Sh., tabel, lavozim (shtatdagi joyi), razryad, xodim toifasi va izoh. Oklad ilova fayliga YOZILMAYDI — faqat korxona
        //    serveridan (xodimlar.json) administrator, buxgalteriya, kadrlar va rahbariyat hisobiga beriladi (mod/oklad).
        //  • Har bir xodim «Ishchi xodimlar» daraxtida oʻz boʻlinmasi › boʻlimi › lavozimiga joylanadi.
        //  • Hisob: xodim tabel raqamini kiritadi — ismi va lavozimi chiqadi, faqat OʻZ parolini qoʻyadi (parol oldindan berilmaydi).
        //  • Telefondagi mavjud yozuvlar oʻchirilmaydi: tabel mos kelsa — yangilanadi; tabelsiz/eski tabelli yozuv familiya
        //    bo'yicha topilsa — tabeli roʻyxatdagiga tuzatiladi (shu telefondagi hisob va sessiya ham ko'chadi).
        // =====================================================================
        var ROSTER_V = '2026-10-13', ROSTER_REV = 2, ROSTER_KEY = 'agmk_roster_v', ROSTER_REP = 'agmk_roster_rep'; // REV 2: razryad qo'shildi
        // [tabel, F.I.Sh., shtatdagi lavozim №, toifa (V · I/Ch · T), izoh, stansiya/obyekt, tabel takrori, razryad]
        var ROSTER = __PRIVATE__("ROSTER");
        function rsSur(n) { return normTxt(String(n || '').trim().split(/\s+/)[0] || '').replace(/[^a-z]/g, '').replace(/q/g, 'k').replace(/x/g, 'h').replace(/yev(a?)$/, 'ev$1').replace(/iyev/g, 'iev'); }
        function rsIni(n) { const p = String(n || '').trim().split(/\s+/); const s = normTxt(p[1] || '').replace(/[^a-z]/g, ''); return s ? s[0] : ''; }
        function rsMoveAcc(from, to) { // shu telefondagi hisob, sessiya va joriy foydalanuvchi — yangi tabelga
            if (!from || !to || from === to) return;
            try { const a = getAccounts(); if (a[from] && !a[to]) { a[to] = a[from]; delete a[from]; saveAccounts(a); } } catch (e) {}
            try { const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); if (s && cleanTabel(s.tabel) === from) { s.tabel = to; localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } } catch (e) {}
            try { if (currentUser && cleanTabel(currentUser.tabel) === from) { currentUser.tabel = to; localStorage.setItem('agmk_current_user', JSON.stringify(currentUser)); } } catch (e) {}
        }
        function rsBolim(pos, st) { const g = pos.g ? groupById(pos.g) : null; return [g ? g.name : '', st || ''].filter(Boolean).join(' · '); }
        function rosterApply(force) {
            if (typeof shtatTree === 'undefined' || !shtatTree || !sectionItemsDB) return null;
            let done = ''; try { done = localStorage.getItem(ROSTER_KEY) || ''; } catch (e) {}
            if (!force && done === ROSTER_V + '#' + ROSTER_REV) return null;
            sectionItemsDB.xodim = sectionItemsDB.xodim || {};
            const rep = { v: ROSTER_V, at: new Date().toISOString(), add: 0, upd: 0, retab: [], freed: [], dup: [], nopos: [] };
            const all = () => allXodims();
            let maxId = 0; all().forEach(r => { const i = +r.item.id; if (i > maxId && i < 1e12) maxId = i; }); if (!maxId) maxId = 1000;
            const rTabs = new Set(ROSTER.map(x => x[0]).filter(Boolean)), used = new Set();
            const place = (r, pos) => { const key = unitById(pos.u).key; if (r.su !== key) { sectionItemsDB.xodim[r.su] = (sectionItemsDB.xodim[r.su] || []).filter(x => x !== r.item); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(r.item); r.su = key; } r.item.seh = key; };
            const fill = (it, x, pos) => { it.lavozim = pos.name; it.posNo = pos.no; it.bolim = rsBolim(pos, x[5]); it.toifa = x[3] || ''; it.rosterIzoh = x[4] || ''; it.roster = ROSTER_V; if (x[7]) it.razryad = x[7]; if (x[5]) it.stansiya = x[5]; };
            const find = (x, mode) => {
                const [t, n] = x;
                if (mode === 1) { if (!t) return null; const L = all().filter(r => cleanTabel(r.item.tabel) === t && !used.has(r.item)); return L.find(r => rsSur(r.item.name) === rsSur(n)) || null; }
                const L = all().filter(r => !used.has(r.item) && rsSur(r.item.name) === rsSur(n) && (!rsIni(n) || !rsIni(r.item.name) || rsIni(r.item.name) === rsIni(n)) && (!cleanTabel(r.item.tabel) || !rTabs.has(cleanTabel(r.item.tabel))));
                return L.length === 1 ? L[0] : null;
            };
            const todo = [];
            ROSTER.forEach(x => { const pos = posByNo(x[2]); if (!pos) { rep.nopos.push(x[1]); return; } const r = find(x, 1); if (r) { used.add(r.item); todo.push([x, pos, r]); } else todo.push([x, pos, null]); });
            todo.forEach(z => { if (z[2]) return; const r = find(z[0], 2); if (r) { used.add(r.item); const old = cleanTabel(r.item.tabel), t = z[0][0]; if (t && old !== t) { rep.retab.push({ n: z[0][1], from: old, to: t }); rsMoveAcc(old, t); r.item.tabel = t; r.item.inv = t; } z[2] = r; } });
            todo.forEach(([x, pos, r]) => {
                const [t, n] = x;
                if (!r && t) { // shu tabel roʻyxatda boshqa odamniki — telefondagi eski yozuvdan tabel olinadi (maʼlumotlari saqlanadi)
                    all().filter(q => cleanTabel(q.item.tabel) === t && !used.has(q.item)).forEach(q => { rep.freed.push({ n: q.item.name, t: t }); q.item.tabel = ''; q.item.izoh = ((q.item.izoh || '') + ' [Tabel ' + t + ' shtat roʻyxatida ' + n + 'ga tegishli — tekshiring]').trim(); });
                }
                if (r) {
                    const it = r.item; if (!it.name || rsSur(it.name) !== rsSur(n) || n.replace(/\./g, '').length > String(it.name).replace(/\./g, '').length) it.name = n;
                    if (t) it.tabel = t; fill(it, x, pos); place(r, pos); rep.upd++;
                } else {
                    const key = unitById(pos.u).key, it = { id: ++maxId, name: n, inv: t, tabel: t, lavozim: pos.name, bolim: '', birthDate: '', yil: null, seh: key, status: 'Soz', kirganSana: '', photo: null,
                        workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [], spravka: null, oilaviy: '', izoh: '', oilaAzolari: '', history: [], gallery: [], phone: '', phones2: [] };
                    fill(it, x, pos); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(it); used.add(it); rep.add++;
                }
                if (x[6]) rep.dup.push({ n: n, t: t });
            });
            // 2.x namunaviy xodimlar (Alisher Karimov 3547, Sardor Rahimov 4120) — haqiqiy roʻyxat kelgach olib tashlanadi (hisobi boʻlmasa)
            try { const acc = getAccounts(); Object.keys(sectionItemsDB.xodim).forEach(k => { sectionItemsDB.xodim[k] = (sectionItemsDB.xodim[k] || []).filter(it => { const demo = ['Alisher Karimov', 'Sardor Rahimov'].includes(it.name) && ['3547', '4120'].includes(cleanTabel(it.tabel)) && !rTabs.has(cleanTabel(it.tabel)) && !acc[cleanTabel(it.tabel)]; if (demo) rep.demo = (rep.demo || 0) + 1; return !demo; }); }); } catch (e) {}
            saveDB(false);
            try { localStorage.setItem(ROSTER_KEY, ROSTER_V + '#' + ROSTER_REV); localStorage.setItem(ROSTER_REP, JSON.stringify(rep)); } catch (e) {}
            try { aiLog('Shtat roʻyxati (' + ROSTER_V + ') qoʻllandi: ' + rep.add + ' ta qoʻshildi, ' + rep.upd + ' ta yangilandi' + (rep.retab.length ? ', ' + rep.retab.length + ' ta tabel tuzatildi' : '')); } catch (e) {}
            return rep;
        }
        // Xodim tabelini kiritganda — kimligi (roʻyxatdan) darhol koʻrinadi
        function rosterWho(t) { const k = cleanTabel(t); if (!k) return null; const r = findXodimsByTabel(k); return r.length === 1 ? r[0] : null; }
        // ---------- Administrator: roʻyxat holati ----------
        function rosterOpen() {
            let rep = null; try { rep = JSON.parse(localStorage.getItem(ROSTER_REP) || 'null'); } catch (e) {}
            const E = escapeHtml, accs = getAccounts(), L = allXodims().filter(r => r.item.roster === ROSTER_V);
            const reg = L.filter(r => accs[cleanTabel(r.item.tabel)]).length, noT = L.filter(r => !cleanTabel(r.item.tabel));
            mdl('rsModal', `<div class="px-h"><b>📋 Shtat roʻyxati · ${E(fmtISO(ROSTER_V))}</b><button class="mini-btn" onclick="mdlClose('rsModal')">✕</button></div>
                <div class="wk-big"><div><small>Roʻyxatda</small><b>${L.length}</b></div><div><small>Shu telefonda hisob ochgan</small><b>${reg}</b></div><div><small>Tabelsiz</small><b>${noT.length}</b></div></div>
                <div class="nd-tip">Har bir xodim oʻz telefonida: <b>Roʻyxatdan oʻtish → tabel raqami</b> (ismi va lavozimi oʻzi chiqadi) → <b>oʻz parolini</b> qoʻyadi. Serverga ulanganlar hisobini boshqaruv panelida bir tugma bilan tasdiqlaysiz.</div>
                ${rep && rep.retab.length ? '<div class="pp-lbl">TABELI TUZATILGANLAR</div>' + rep.retab.map(x => `<div class="sg-row">🔁 ${E(x.n)}: ${E(x.from || '—')} → <b>${E(x.to)}</b></div>`).join('') : ''}
                ${rep && rep.freed.length ? '<div class="pp-lbl">TEKSHIRING: TABELI BOSHQA ODAMGA TEGISHLI</div>' + rep.freed.map(x => `<div class="sg-row">⚠️ ${E(x.n)} — tabel ${E(x.t)} olib qoʻyildi</div>`).join('') : ''}
                <div class="pp-lbl">HUJJATDAGI NOANIQLIKLAR (roʻyxatning oʻzida)</div>
                ${ROSTER.filter(x => x[6] || !x[0] || x[4]).map(x => `<div class="sg-row">${x[6] ? '⚠️' : !x[0] ? '❔' : 'ℹ️'} <span><b>${E(x[1])}</b>${x[0] ? ' · ' + E(x[0]) : ''}<br><small style="color:#94a3b8">${E(x[4] || (x[6] ? 'tabel takrorlangan' : 'tabel yoʻq'))}</small></span></div>`).join('')}
                <div class="pk-btns">${isAdmin() ? '<button onclick="rosterReapply()">🔄 Qayta qoʻllash</button>' : ''}<button class="pr" onclick="mdlClose(\'rsModal\')">Yopish</button></div>`, true);
        }
        async function rosterReapply() { if (!isAdmin()) return; if (!(await uiConfirm('Shtat roʻyxati qayta qoʻllansinmi? Mavjud yozuvlar oʻchirilmaydi — faqat lavozim, joy va tabel roʻyxat boʻyicha yangilanadi.'))) return; const r = rosterApply(true); mdlClose('rsModal'); showToast('✅ ' + (r ? r.add + ' ta qoʻshildi, ' + r.upd + ' ta yangilandi' : 'Bajarildi')); try { xtRender(); } catch (e) {} }
        (function () {
            // Ishchi xodimlar bosh sahifasida — roʻyxat kartasi
            if (typeof xtRender === 'function') xtRender = agmkExtend('xtRender', 'Shtat roʻyxati kartasi', xtRender, o => function () {
                const r = o.apply(this, arguments);
                try { if (!XT.u && !XT.pos && !XT.none && !$id('xtSearch').value.trim()) { const box = $id('xtList'); if (box && !box.querySelector('.rs-card')) box.insertAdjacentHTML('afterbegin', `<div class="btn-card xt-unit rs-card" onclick="rosterOpen()"><div class="btn-card-content"><span class="btn-text">📋 Shtat roʻyxati · ${fmtISO(ROSTER_V)}<span class="xt-sub">${ROSTER.length} xodim tabel raqami bilan · kim roʻyxatdan oʻtgan, noaniqliklar</span></span></div><span class="btn-arrow">›</span></div>`); } } catch (e) {}
                return r;
            });
            // Roʻyxatdan oʻtish oynasi: yoʻl-yoʻriq
            if (typeof previewRegister === 'function') previewRegister = agmkExtend('previewRegister', 'Roʻyxatdan oʻtishda: shtat roʻyxatidagi joyi', previewRegister, o => function () {
                const r = o.apply(this, arguments);
                try { const x = rosterWho($id('rgTabel').value), box = $id('rgPreview'); if (x && box && !box.classList.contains('bad') && x.item.bolim && box.innerHTML.indexOf('rs-p') < 0) box.insertAdjacentHTML('beforeend', '<br><small class="rs-p">📍 ' + escapeHtml(x.item.bolim) + '</small><br><small class="rs-p">Endi faqat oʻzingiz biladigan parol qoʻying.</small>'); } catch (e) {}
                return r;
            });
        })();

        // ---------- 💰 Oklad: faqat serverdan, faqat vakolatli hisobga ----------
        //  Ilova fayliga (APK) maosh yozilmaydi — APK hamma xodimda bor va undan maʼlumotni ajratib olish mumkin.
        //  Administrator, buxgalteriya, kadrlar yoki rahbariyat roli bor xodim serverga kirganda oklad shu telefonga yuklanadi va
        //  faqat shu rollarga koʻrinadi. Tarqatish fayliga kirmaydi.
        function okCan() { try { return isAdmin() || hasRole('bux') || hasRole('kadr') || hasRole('rahbar'); } catch (e) { return false; } }
        function okFmt(v) { return v ? Number(v).toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' soʻm' : '—'; }
        async function okLoad(silent) {
            if (!okCan() || typeof sbFetch !== 'function' || !(typeof sigSrv === 'function' && sigSrv())) return 0;
            try {
                const r = await sbFetch('/api/roster/v1/oklad'); if (!r || !r.list) return 0; const M = new Map(r.list.map(x => [x.tabel, x])); let n = 0;
                allXodims().forEach(z => { const x = M.get(cleanTabel(z.item.tabel)); if (!x) return; if (x.oklad && z.item.oklad !== x.oklad) { z.item.oklad = x.oklad; n++; } if (x.razryad && !z.item.razryad) z.item.razryad = x.razryad; });
                if (n) saveDB(false); if (!silent) showToast('💰 Oklad yangilandi: ' + n + ' ta'); return n;
            } catch (e) { if (!silent) alert('⚠️ ' + agmkErrUz(e)); return 0; }
        }
        (function () {
            window.addEventListener('agmk:login', () => setTimeout(() => okLoad(true), 2500));
            if (typeof xtXodimCard === 'function') xtXodimCard = agmkExtend('xtXodimCard', 'v3.2: oklad (vakolatli rollar)', xtXodimCard, o => function (r) {
                let h = o.apply(this, arguments);
                try { if (okCan() && r.item.oklad) h = h.replace('<button class="details-btn"', `<div class="card-row"><span>💰 Oklad: <span>${escapeHtml(okFmt(r.item.oklad))}</span></span></div><button class="details-btn"`); } catch (e) {}
                return h;
            });
        })();

