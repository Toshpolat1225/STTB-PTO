        // =====================================================================
        // YANGI QO'SHIMCHALAR: ortga/oldinga joyi, Parametrlar, Shtatlar ro'yxati,
        // parol himoyasi va lavozim tanlash ro'yxati. Eski funksiyalar o'zgarmagan.
        // =====================================================================

        // ============ ORTGA/OLDINGA TUGMALARI JOYI (o'ngda, mikrofon ustida) ============
        function afterScreenOpen(el) {
            if (!el) return;
            if (el.id !== 'screen-shtat') shtatUnlocked = false; // Shtatlardan chiqilganda qayta qulflanadi
            placeUndoBar(el);
            if (typeof ensureAiBtn === 'function') ensureAiBtn(el);
            // Eslatmalar faqat o'z bo'limi ochilganda chiqadi (pasportdan qaytganda takrorlanmaydi)
            const prev = lastScreenId;
            lastScreenId = el.id;
            if (el.id === 'screen-main' && typeof updateFooter === 'function') updateFooter();
            if (el.id === 'screen-vagonlar') { document.querySelectorAll('.set-admin-vg').forEach(b => b.classList.toggle('hidden', !isAdmin())); if (typeof renderTypeTabs === 'function') renderTypeTabs(); }
            if (el.id === 'screen-vagonlar' && prev !== 'screen-vagon-pasport' && prev !== 'screen-vagonlar' && !document.body.classList.contains('locked')) {
                setTimeout(updateWarnBadge, 50); // eslatma endi o'zi ochilmaydi — ⚠️ tugmasida yig'iladi
            }
        }

        function placeUndoBar(el) {
            const bar = document.getElementById('undoRedoBar');
            if (!bar) return;
            const slot = el ? el.querySelector('.undo-slot') : null;
            if (slot) {
                slot.appendChild(bar);
                bar.classList.remove('hidden');
                alignUndoBar();
            } else {
                bar.classList.add('hidden');
            }
        }

        // Tugmalarning o'ng cheti mikrofon tugmasining o'ng cheti bilan bir chiziqda turadi
        function alignUndoBar() {
            const bar = document.getElementById('undoRedoBar');
            if (!bar || !bar.parentElement) return;
            const slot = bar.parentElement;
            bar.style.marginRight = '0px';
            if (!slot.classList.contains('row')) return;
            const scr = slot.closest('.screen');
            const mic = scr ? scr.querySelector('.mic-btn') : null;
            if (!mic) return;
            const sr = slot.getBoundingClientRect(), mr = mic.getBoundingClientRect();
            if (!sr.width || !mr.width) return;
            bar.style.marginRight = Math.max(0, Math.round(sr.right - mr.right)) + 'px';
        }

        // ============ SHTATLAR RO'YXATI: MA'LUMOTLAR ============
        const SHTAT_KEY = 'agmk_shtat_list';
        const SHTAT_PW_KEY = 'agmk_shtat_pw';
        const SHTAT_LOCK_KEY = 'agmk_shtat_lock';
        // Boshlang'ich ro'yxat — eski tanlash ro'yxatidagi 4 ta lavozim (hech biri yo'qolmasligi uchun)
        const DEFAULT_SHTAT = ["PTO muhandisi", "Stansiya Masteri", "Dispetcher", "Rahbariyat"];
        let shtatList = DEFAULT_SHTAT.slice();
        let shtatUnlocked = false;
        let shtatReturnScreen = 'screen-main';

        function initShtat() {
            try {
                const d = JSON.parse(localStorage.getItem(SHTAT_KEY) || 'null');
                if (Array.isArray(d)) {
                    const clean = d.filter(x => typeof x === 'string' && x.trim());
                    if (clean.length) shtatList = clean;
                }
            } catch (e) {}
            copyScreenBackgrounds();
        }

        function saveShtat() {
            try {
                localStorage.setItem(SHTAT_KEY, JSON.stringify(shtatList));
            } catch (e) {
                alert("⚠️ Xotira to'ldi! Shtatlar ro'yxati saqlanmadi.");
            }
            const list = document.getElementById('loginRoleList');
            if (list && !list.classList.contains('hidden')) renderRoleList(document.getElementById('loginRoleSearch').value);
        }

        // Yangi ekranlarga mavjud ichki ekranlarning fon rasmlarini beradi (faylni og'irlashtirmaslik uchun)
        function copyScreenBackgrounds() {
            const src = document.getElementById('screen-subunits');
            if (!src || src.children.length < 2) return;
            const headBg = src.children[0].style.backgroundImage;
            const bodyBg = src.children[1].style.backgroundImage;
            document.querySelectorAll('.set-head').forEach(d => { if (headBg) d.style.backgroundImage = headBg; });
            document.querySelectorAll('.set-body').forEach(d => { if (bodyBg) d.style.backgroundImage = bodyBg; });
        }

        // Qidiruv uchun matnni moslashtirish: kichik harf, apostroflar olib tashlanadi, kirill -> lotin
        const CYR_TO_LAT = {
            'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l',
            'м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'x','ц':'ts','ч':'ch','ш':'sh',
            'щ':'sh','ъ':'','ы':'i','ь':'','э':'e','ю':'yu','я':'ya','ў':'o','қ':'q','ғ':'g','ҳ':'h'
        };
        function normTxt(s) {
            s = String(s || '').toLowerCase();
            let o = '';
            for (const ch of s) o += (CYR_TO_LAT[ch] !== undefined ? CYR_TO_LAT[ch] : ch);
            return o.replace(/['‘’ʻʼ`´]/g, '').replace(/\s+/g, ' ').trim();
        }

        function shtatMatches(q) {
            const nq = normTxt(q);
            const toks = nq.split(' ').filter(Boolean);
            const res = [];
            shtatList.forEach((name, i) => {
                const n = normTxt(name);
                if (toks.length && !toks.every(t => n.includes(t))) return;
                let score = 2;
                if (!toks.length || n.startsWith(nq)) score = 0;
                else if (n.split(' ').some(w => w.startsWith(toks[0]))) score = 1;
                res.push({ name: name, i: i, score: score });
            });
            res.sort((a, b) => a.score - b.score || a.i - b.i);
            return res;
        }

        function highlightMatch(name, q) {
            q = String(q || '').trim();
            if (!q) return escapeHtml(name);
            const pos = name.toLowerCase().indexOf(q.toLowerCase());
            if (pos < 0) return escapeHtml(name);
            return escapeHtml(name.slice(0, pos)) + '<mark>' + escapeHtml(name.slice(pos, pos + q.length)) + '</mark>' + escapeHtml(name.slice(pos + q.length));
        }

        // Matndan lavozimlarni ajratib olish (har qatorda bittadan; Excel'dan nusxalanganda ham ishlaydi)
        function parseShtatText(text) {
            const out = [];
            String(text || '').split(/\r?\n/).forEach(line => {
                const cells = line.split('\t').map(c => c.trim().replace(/^"+|"+$/g, '').trim());
                let cell = cells.find(c => /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/.test(c));
                if (!cell) return;
                cell = cell.replace(/^\d+\s*[\.\)]\s*/, '').replace(/\s+/g, ' ').trim();
                if (cell.length < 2) return;
                out.push(cell);
            });
            return out;
        }

        // ============ PAROL (SHA-256, tuz bilan) ============
        function sha256(str) {
            const msg = unescape(encodeURIComponent(str));
            const K = [], H = [];
            const isPrime = n => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
            const frac = x => ((x - Math.floor(x)) * 4294967296) | 0;
            for (let c = 2, p = 0; p < 64; c++) {
                if (isPrime(c)) { if (p < 8) H[p] = frac(Math.pow(c, 1 / 2)); K[p] = frac(Math.pow(c, 1 / 3)); p++; }
            }
            const bytes = [];
            for (let i = 0; i < msg.length; i++) bytes.push(msg.charCodeAt(i));
            const bitLen = bytes.length * 8;
            bytes.push(0x80);
            while (bytes.length % 64 !== 56) bytes.push(0);
            const hi = Math.floor(bitLen / 4294967296);
            for (let s = 24; s >= 0; s -= 8) bytes.push((hi >>> s) & 255);
            for (let s = 24; s >= 0; s -= 8) bytes.push((bitLen >>> s) & 255);
            const rotr = (x, n) => (x >>> n) | (x << (32 - n));
            const W = new Array(64);
            for (let o = 0; o < bytes.length; o += 64) {
                for (let t = 0; t < 16; t++) W[t] = (bytes[o + 4 * t] << 24) | (bytes[o + 4 * t + 1] << 16) | (bytes[o + 4 * t + 2] << 8) | bytes[o + 4 * t + 3];
                for (let t = 16; t < 64; t++) {
                    const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
                    const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
                    W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
                }
                let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
                for (let t = 0; t < 64; t++) {
                    const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) | 0;
                    const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
                    h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
                }
                H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
                H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
            }
            return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
        }

        function hashPw(pw, salt) {
            let h = salt + ':' + pw;
            for (let i = 0; i < 300; i++) h = sha256(salt + h);
            return h;
        }
        function getPwRec() {
            try { return JSON.parse(localStorage.getItem(SHTAT_PW_KEY) || 'null'); } catch (e) { return null; }
        }
        function setPw(pw) {
            const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem(SHTAT_PW_KEY, JSON.stringify({ salt: salt, hash: hashPw(pw, salt) }));
        }
        function checkPw(pw) {
            const rec = getPwRec();
            return !!rec && hashPw(pw, rec.salt) === rec.hash;
        }
        function getLockState() {
            try { return JSON.parse(localStorage.getItem(SHTAT_LOCK_KEY) || 'null') || { fails: 0, until: 0 }; } catch (e) { return { fails: 0, until: 0 }; }
        }
        function setLockState(s) { try { localStorage.setItem(SHTAT_LOCK_KEY, JSON.stringify(s)); } catch (e) {} }

        // ============ PAROL MODALI ============
        let pwMode = null, pwOnSuccess = null;

        function openPwModal(mode, onSuccess) {
            pwMode = mode; pwOnSuccess = onSuccess;
            const cfg = {
                unlock: { title: "🔒 Shtatlar ro'yxati", hint: "Bu bo'limga kirish uchun parolni kiriting.", l: ["Parol:"], btn: "Kirish" },
                set: { title: "🔑 Parol o'rnatish", hint: "Shtatlar ro'yxatini himoyalash uchun parol o'rnating (kamida 4 belgi). Parolni esda saqlang.", l: ["Yangi parol:", "Parolni takrorlang:"], btn: "Saqlash" },
                change: { title: "🔑 Parolni o'zgartirish", hint: "Joriy parolni va yangi parolni kiriting.", l: ["Joriy parol:", "Yangi parol:", "Yangi parolni takrorlang:"], btn: "Saqlash" }
            }[mode];
            document.getElementById('pwTitle').innerText = cfg.title;
            document.getElementById('pwHint').innerText = cfg.hint;
            document.getElementById('pwSubmitBtn').innerText = cfg.btn;
            for (let i = 1; i <= 3; i++) {
                const g = document.getElementById('pwGroup' + i);
                g.classList.toggle('hidden', i > cfg.l.length);
                if (i <= cfg.l.length) document.getElementById('pwLabel' + i).innerText = cfg.l[i - 1];
                document.getElementById('pwInput' + i).value = '';
            }
            document.getElementById('pwError').innerText = '';
            document.getElementById('pwModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('pwInput1').focus(), 50);
        }

        function closePwModal() {
            document.getElementById('pwModal').classList.add('hidden');
            pwMode = null; pwOnSuccess = null;
        }

        function submitPw() {
            const err = document.getElementById('pwError');
            const v1 = document.getElementById('pwInput1').value;
            const v2 = document.getElementById('pwInput2').value;
            const v3 = document.getElementById('pwInput3').value;
            const needsCheck = (pwMode === 'unlock' || pwMode === 'change');

            if (needsCheck) {
                const ls = getLockState();
                if (ls.until && Date.now() < ls.until) {
                    err.innerText = "Juda ko'p xato urinish. " + Math.ceil((ls.until - Date.now()) / 1000) + " soniyadan keyin qayta urinib ko'ring.";
                    return;
                }
                if (!checkPw(v1)) {
                    ls.fails = (ls.fails || 0) + 1;
                    if (ls.fails >= 5) { ls.until = Date.now() + 30000; ls.fails = 0; err.innerText = "Parol 5 marta noto'g'ri kiritildi. 30 soniya kuting."; }
                    else err.innerText = "Parol noto'g'ri. Yana " + (5 - ls.fails) + " ta urinish qoldi.";
                    setLockState(ls);
                    document.getElementById('pwInput1').value = '';
                    return;
                }
                setLockState({ fails: 0, until: 0 });
            }

            if (pwMode === 'set' || pwMode === 'change') {
                const np = pwMode === 'set' ? v1 : v2;
                const rp = pwMode === 'set' ? v2 : v3;
                if (np.length < 4) { err.innerText = "Parol kamida 4 belgidan iborat bo'lishi kerak."; return; }
                if (np !== rp) { err.innerText = "Parollar bir xil emas."; return; }
                setPw(np);
            }

            const cb = pwOnSuccess;
            closePwModal();
            if (cb) cb();
        }

        // ============ SHTATLAR RO'YXATI EKRANI ============
        function openShtat() {
            const active = document.querySelector('.screen.active');
            if (active && active.id !== 'screen-shtat') shtatReturnScreen = active.id;
            const go = () => {
                shtatUnlocked = true;
                document.getElementById('shtatSearchInput').value = '';
                openScreen('screen-shtat');
                renderShtatList();
            };
            if (shtatUnlocked || isAdmin()) { go(); return; } // asoschi (administrator) — parolsiz
            openPwModal(getPwRec() ? 'unlock' : 'set', go);
        }



        function saveShtatAdd() {
            if (!shtatUnlocked) return;
            const items = parseShtatText(document.getElementById('shtatAddText').value);
            if (!items.length) { alert("Lavozim nomini kiriting!"); return; }
            const existing = new Set(shtatList.map(normTxt));
            let added = 0, dup = 0;
            items.forEach(it => {
                const k = normTxt(it);
                if (existing.has(k)) { dup++; return; }
                existing.add(k); shtatList.push(it); added++;
            });
            saveShtat();
            document.getElementById('shtatAddModal').classList.add('hidden');
            renderShtatList();
            if (items.length > 1 || dup) alert(added + " ta lavozim qo'shildi." + (dup ? " " + dup + " tasi ro'yxatda bor edi, qayta qo'shilmadi." : ""));
        }

        async function editShtat(i) {
            if (!shtatUnlocked || shtatList[i] === undefined) return;
            const v = await uiPrompt("Lavozim nomi:", shtatList[i]);
            if (v === null) return;
            const nv = v.replace(/\s+/g, ' ').trim();
            if (!nv) { alert("Lavozim nomi bo'sh bo'lishi mumkin emas!"); return; }
            if (shtatList.some((x, j) => j !== i && normTxt(x) === normTxt(nv))) { alert("Bu lavozim ro'yxatda allaqachon bor."); return; }
            const oldNm = shtatList[i];
            shtatList[i] = nv;
            { const ra = getRahbarList(); const k = ra.findIndex(x => normTxt(x) === normTxt(oldNm)); if (k >= 0) { ra[k] = nv; saveRahbarList(ra); } }
            saveShtat();
            renderShtatList();
        }

        async function deleteShtat(i) {
            if (!shtatUnlocked || shtatList[i] === undefined) return;
            if (shtatList.length <= 1) { alert("Ro'yxatda kamida bitta lavozim qolishi kerak."); return; }
            if (!await uiConfirm('"' + shtatList[i] + '" lavozimini o\'chirasizmi?')) return;
            { const nm = shtatList[i]; saveRahbarList(getRahbarList().filter(x => normTxt(x) !== normTxt(nm))); }
            shtatList.splice(i, 1);
            saveShtat();
            renderShtatList();
        }

        // ============ PARAMETRLAR EKRANI ============
        function openSettings() {
            openScreen('screen-settings');
            renderSettings();
        }

        function renderSettings() {
            document.getElementById('set-shtat-sub').innerText = shtatList.length + " ta lavozim · parol bilan";
            const hasPw = !!getPwRec();
            document.getElementById('set-pw-title').innerText = hasPw ? "Shtatlar parolini o'zgartirish" : "Shtatlar uchun parol o'rnatish";
            document.getElementById('set-pw-sub').innerText = hasPw ? "Parol o'rnatilgan" : "Parol hali o'rnatilmagan";
            document.getElementById('set-user-sub').innerText = (currentUser.name || '—') + (currentUser.tabel ? " (tabel " + currentUser.tabel + ")" : "");
            document.querySelectorAll('#screen-settings .set-admin').forEach(c => c.classList.toggle('hidden', !isAdmin()));
            document.querySelectorAll('#screen-settings .set-nonadmin').forEach(c => c.classList.toggle('hidden', isAdmin()));
            if (typeof aiCfgSub === 'function') aiCfgSub();
            if (typeof secBadge === 'function') secBadge();
            { const fl = getFeedback(); const un = fl.filter(x => !x.seen).length; const el = document.getElementById('set-fb-sub'); if (el) el.innerText = fl.length ? ("Jami: " + fl.length + " ta" + (un ? ", yangi: " + un : "")) : "Hozircha xabar yo'q"; }
            { const ct = getContacts(); const el = document.getElementById('set-ct-sub'); if (el) el.innerText = (ct.email || ct.telegram) ? [ct.email, ct.telegram ? '@' + ct.telegram : ''].filter(Boolean).join(' · ') : "Kiritilmagan — bosib kiriting"; }
            updateFbBadge();
            { const pa = currentUser && currentUser.tabel ? getAccounts()[currentUser.tabel] : null; const el = document.getElementById('set-pin-sub'); if (el) el.innerText = pa && pa.pin ? "Yoqilgan — dastur ochilganda 4 xonali kod so'raladi" : "O'chirilgan — bosib yoqing"; }
        }

        function changeShtatPw() {
            if (getPwRec()) openPwModal('change', () => { alert("Parol o'zgartirildi."); renderSettings(); });
            else openPwModal('set', () => { alert("Parol o'rnatildi."); renderSettings(); });
        }

        // ============ LAVOZIM TANLASH (ro'yxatdan tanlash + avtomatik qidiruv) ============
        let roleActiveIdx = -1, roleItems = [];

        function initRoleCombo() {
            const inp = document.getElementById('loginRoleSearch');
            if (!inp) return;
            inp.addEventListener('focus', () => { inp.select(); openRoleList(''); });
            inp.addEventListener('input', () => { document.getElementById('loginRoleInput').value = ''; openRoleList(inp.value); });
            inp.addEventListener('keydown', roleKeyDown);
            inp.addEventListener('blur', () => setTimeout(closeRoleList, 150));
            ['pwInput1', 'pwInput2', 'pwInput3'].forEach(id => {
                document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') submitPw(); });
            });
            try {
                const saved = JSON.parse(localStorage.getItem('agmk_current_user') || 'null');
                if (saved && saved.role) setRoleValue(saved.role);
            } catch (e) {}
        }

        function setRoleValue(name) {
            document.getElementById('loginRoleInput').value = name || '';
            document.getElementById('loginRoleSearch').value = name || '';
        }

        function openRoleList(q) {
            renderRoleList(q);
            document.getElementById('loginRoleList').classList.remove('hidden');
            document.getElementById('roleCombo').classList.add('open');
        }

        function closeRoleList() {
            const list = document.getElementById('loginRoleList');
            if (list.classList.contains('hidden')) return;
            list.classList.add('hidden');
            document.getElementById('roleCombo').classList.remove('open');
            const hidden = document.getElementById('loginRoleInput');
            const inp = document.getElementById('loginRoleSearch');
            if (!hidden.value) {
                // Yozilgan matn ro'yxatdagi lavozimga aynan mos kelsa — tanlanadi, aks holda qabul qilinmaydi
                const exact = shtatList.find(x => normTxt(x) === normTxt(inp.value));
                if (exact) setRoleValue(exact); else inp.value = '';
            } else {
                inp.value = hidden.value;
            }
        }

        function toggleRoleList() {
            const list = document.getElementById('loginRoleList');
            const inp = document.getElementById('loginRoleSearch');
            if (list.classList.contains('hidden')) inp.focus();
            else inp.blur();
        }

        function renderRoleList(q) {
            const list = document.getElementById('loginRoleList');
            const selected = document.getElementById('loginRoleInput').value;
            roleItems = shtatMatches(q);
            roleActiveIdx = roleItems.length && String(q || '').trim() ? 0 : -1;
            const meta = String(q || '').trim() ? (roleItems.length + " / " + shtatList.length + " ta lavozim") : (shtatList.length + " ta lavozim");
            let html = '<div class="combo-meta">' + meta + '</div>';
            if (!roleItems.length) html += '<div class="combo-empty">Mos lavozim topilmadi</div>';
            html += roleItems.map((r, k) =>
                '<div class="combo-opt' + (r.name === selected ? ' selected' : '') + (k === roleActiveIdx ? ' active' : '') + '" role="option" data-k="' + k + '" ' +
                'onpointerdown="event.preventDefault()" onclick="chooseRole(' + k + ')">' + highlightMatch(r.name, q) + '</div>'
            ).join('');
            list.innerHTML = html;
        }

        function chooseRole(k) {
            const r = roleItems[k];
            if (!r) return;
            setRoleValue(r.name);
            const inp = document.getElementById('loginRoleSearch');
            closeRoleList();
            inp.blur();
        }

        function roleKeyDown(e) {
            const list = document.getElementById('loginRoleList');
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (list.classList.contains('hidden')) { openRoleList(e.target.value); return; }
                if (!roleItems.length) return;
                roleActiveIdx = e.key === 'ArrowDown' ? Math.min(roleItems.length - 1, roleActiveIdx + 1) : Math.max(0, roleActiveIdx - 1);
                list.querySelectorAll('.combo-opt').forEach((el, k) => el.classList.toggle('active', k === roleActiveIdx));
                const act = list.querySelector('.combo-opt.active');
                if (act) act.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (roleActiveIdx >= 0) chooseRole(roleActiveIdx);
                else if (roleItems.length === 1) chooseRole(0);
            } else if (e.key === 'Escape') {
                closeRoleList();
            }
        }


