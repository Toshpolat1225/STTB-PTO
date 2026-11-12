        // =====================================================================
        // YANGI (6-bosqich): rahbar lavozimlari, sinov rahbari, tabelni o'zgartirish, eslatmalar
        // =====================================================================
        const RAHBAR_KEY = 'agmk_shtat_rahbar';
        const WARN_SEEN_KEY = 'agmk_warn_seen';

        // ============ RAHBAR LAVOZIMLARI (shtatda 👑) ============
        function getRahbarList() { try { const a = JSON.parse(localStorage.getItem(RAHBAR_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
        function saveRahbarList(a) { try { localStorage.setItem(RAHBAR_KEY, JSON.stringify(a)); } catch (e) {} }
        function isRahbarLavozim(name) { const k = normTxt(name); return !!k && getRahbarList().some(x => normTxt(x) === k); }
        function isRahbar() { return !!(currentUser && isRahbarLavozim(currentUser.role)); } // faqat 👑 lavozim (administrator ham bundan mustasno emas)
        function toggleRahbar(i) {
            if (!shtatUnlocked || shtatList[i] === undefined) return;
            const name = shtatList[i];
            let a = getRahbarList();
            if (isRahbarLavozim(name)) a = a.filter(x => normTxt(x) !== normTxt(name)); else a.push(name);
            saveRahbarList(a);
            renderShtatList();
            showToast(isRahbarLavozim(name) ? ("👑 \"" + name + "\" rahbar lavozimi deb belgilandi") : ("\"" + name + "\" rahbar lavozimlaridan olindi"));
        }

        // ============ v3.1: 2.x dagi «sinov rahbari» (tabel 1111, o'ylab topilgan tug'ilgan sana) endi yaratilmaydi ============
        // Avval yozilgan bo'lsa — haqiqiy tabelga (1001) tuzatiladi va o'ylab topilgan tug'ilgan sana olib tashlanadi.
        function seedDemoRahbar() {
            try { const lv = "Boshqarma boshlig'i"; if (!shtatList.some(x => normTxt(x) === normTxt(lv))) { shtatList.push(lv); saveShtat(); } if (!isRahbarLavozim(lv)) { const a = getRahbarList(); a.push(lv); saveRahbarList(a); } } catch (e) {}
            try {
                const L = []; Object.values(sectionItemsDB.xodim || {}).forEach(a => (a || []).forEach(x => L.push(x)));
                const d = L.find(x => String(x.tabel) === '1111' && x.name === "@@N:17@@");
                if (!d) return; let ch = false;
                if (!L.some(x => String(x.tabel) === '1001')) { d.tabel = '1001'; if (String(d.inv) === '1111') d.inv = '1001'; ch = true; try { const a = getAccounts(); if (a['1111'] && !a['1001']) { a['1001'] = a['1111']; delete a['1111']; saveAccounts(a); } } catch (e) {} }
                if (d.birthDate === '1980-05-01') { d.birthDate = ''; d.yil = null; ch = true; }
                if (ch) saveDB(false);
            } catch (e) { console.error(e); }
        }

        // ============ TABEL RAQAMINI O'ZGARTIRISH ============
        function openTabelChange() {
            if (!currentUser || !currentUser.tabel) return;
            $id('tcOld').value = currentUser.tabel;
            ['tcNew', 'tcBirth', 'tcPw'].forEach(id => { $id(id).value = ''; });
            $id('tcErr').innerText = '';
            $id('tabelChangeModal').classList.remove('hidden');
        }
        async function saveTabelChange() {
            const err = $id('tcErr');
            const oldT = cleanTabel(currentUser.tabel), newT = cleanTabel($id('tcNew').value);
            const b = $id('tcBirth').value, pw = $id('tcPw').value;
            if (!newT || !b || !pw) { err.innerText = "Barcha maydonlarni to'ldiring."; return; }
            if (oldT === ADMIN_TABEL) { err.innerText = "Administrator tabel raqami o'zgartirilmaydi."; return; }
            if (newT === oldT) { err.innerText = "Yangi tabel raqami joriysi bilan bir xil."; return; }
            const lm = lockedMsg('tabel:' + oldT);
            if (lm) { err.innerText = lm; return; }
            const lk = lookupXodim(oldT);
            if (lk.err) { err.innerText = lk.err; return; }
            if (String(lk.rec.item.birthDate || '') !== b || !checkAccPw(oldT, pw)) { err.innerText = "Tug'ilgan sana yoki parol noto'g'ri. " + registerFail('tabel:' + oldT); return; }
            clearFails('tabel:' + oldT);
            const busy = findXodimsByTabel(newT);
            const accs = getAccounts();
            if (busy.length || accs[newT] || newT === ADMIN_TABEL) { err.innerText = "Bu tabel raqami band. Boshqa raqam tanlang."; return; }
            if (!await uiConfirm("Tabel raqami " + oldT + " → " + newT + " ga o'zgartirilsinmi? Keyingi kirish yangi raqam bilan bo'ladi.")) return;
            lk.rec.item.tabel = newT; lk.rec.item.inv = newT;
            if (accs[oldT]) { accs[newT] = accs[oldT]; delete accs[oldT]; saveAccounts(accs); }
            saveDB();
            setSessionUser(lk.rec.item);
            logPw("Tabel raqami o'zgartirildi (" + oldT + " → " + newT + ")", newT, lk.rec.item.name);
            $id('tabelChangeModal').classList.add('hidden');
            showToast("✅ Yangi tabel raqamingiz: " + newT);
            renderSettings();
        }

        // ============ ⚠️ ESLATMALAR (xatlar) ============
        let warnView = 'list';
        function kunText(v) { return (v.kun === null || v.kun === undefined) ? '' : (v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + " kun qoldi"); }
        function computeWarnings() {
            const tamir = onlyVagons().filter(v => v.status === "Ta'mir talab").sort((a, b) => (a.kun || 0) - (b.kun || 0));
            const yaqin = onlyVagons().filter(v => v.status === "Yaqin").sort((a, b) => (a.kun || 0) - (b.kun || 0));
            return [
                { id: 'tamir', icon: '🟠', title: "Muddati kelgan", cls: 'red', items: tamir },
                { id: 'yaqin', icon: '🟡', title: "Muddati yaqin", cls: 'yel', items: yaqin }
            ];
        }
        function warnSig(w) { return w.items.map(v => v.id).sort().join(','); }
        function getWarnSeen() { try { return JSON.parse(localStorage.getItem(WARN_SEEN_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function isWarnUnread(w, seen) { return w.items.length > 0 && (seen || getWarnSeen())[w.id] !== warnSig(w); }
        function updateWarnBadge() {
            const btn = $id('warnBtn'), cnt = $id('warnCount');
            if (!btn) return;
            const seen = getWarnSeen();
            const n = computeWarnings().filter(w => isWarnUnread(w, seen)).length;
            cnt.innerText = n; cnt.classList.toggle('hidden', n === 0);
            btn.classList.toggle('pulse', n > 0);
        }
        function openWarnings() {
            warnView = 'list';
            renderWarnings();
            $id('warnModal').classList.remove('hidden');
        }
        function renderWarnings() {
            const body = $id('warnBody');
            const seen = getWarnSeen();
            body.innerHTML = computeWarnings().map(w => {
                const un = isWarnUnread(w, seen);
                return `<div class="wl-letter${un ? ' unread' : ''}" onclick="openWarnLetter('${w.id}')">
                    <span class="wl-ic">✉️</span>
                    <div class="wl-t">${w.icon} ${escapeHtml(w.title)}: ${w.items.length} ta vagon<div class="wl-sub">${w.items.length ? 'Ro\'yxatni ko\'rish uchun bosing' : 'Hozircha yo\'q'}</div></div>
                    ${un ? '<span class="wl-dot"></span>' : ''}
                </div>`;
            }).join('');
            body.scrollTop = 0;
        }
        function openWarnLetter(id) {
            const w = computeWarnings().find(x => x.id === id);
            if (!w) return;
            const seen = getWarnSeen(); seen[w.id] = warnSig(w);
            try { localStorage.setItem(WARN_SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
            warnView = 'letter';
            const rows = w.items.map(v => `<div class="wl-row" onclick="openVagonFromWarn(${v.id})">
                    <div><b>Vagon №${escapeHtml(vagonNo(v))}</b><div class="wl-info">Inv ${escapeHtml(v.inv)} · ${escapeHtml(v.type)} · ${escapeHtml(v.seh)}</div></div>
                    <span class="wl-kun ${w.cls}">${escapeHtml(kunText(v))}</span>
                </div>`).join('');
            $id('warnBody').innerHTML = `<div class="wl-head"><button class="wl-back" onclick="warnView='list'; renderWarnings()">‹ Xatlar</button><b style="color:#fff; font-size:13px;">${w.icon} ${escapeHtml(w.title)} (${w.items.length} ta)</b></div>` +
                (rows || '<div style="text-align:center; color:#94a3b8; padding:20px; font-size:12px;">Ro\'yxat bo\'sh</div>');
            $id('warnBody').scrollTop = 0;
            updateWarnBadge();
        }
        function openVagonFromWarn(id) {
            $id('warnModal').classList.add('hidden');
            openPassport(id);
        }


