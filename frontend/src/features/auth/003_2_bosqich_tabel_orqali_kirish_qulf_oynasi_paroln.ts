        // =====================================================================
        // YANGI (2-bosqich): tabel orqali kirish, qulf oynasi, parolni tiklash,
        // hisob menyusi, xodim tahriri, telefon "ortga" tugmasi, mikrofon yordami,
        // tarqatish uchun fayl. Eski funksiyalar o'chirilmagan.
        // =====================================================================
        const ADMIN_TABEL = '@@ADMIN_TABEL@@'; // yigʻishda .env dagi AGMK_ADMIN qoʻyiladi (build.mjs). Haqiqiy huquq serverda tekshiriladi.
        const ADMIN_LAVOZIM = "Temir yo'l harakat tarkibi I-toifali muhandisi";
        const ACC_KEY = 'agmk_accounts';
        const PWLOG_KEY = 'agmk_pw_log';
        const LOGIN_LOCK_KEY = 'agmk_login_lock';
        const BUNDLE_APPLIED_KEY = 'agmk_bundle_applied';
        let currentLockView = 'login';
        let lastScreenId = 'screen-main';
        let resetVerifiedTabel = null;

        function $id(id) { return document.getElementById(id); }
        function txtSet(el, v) { v = String(v); if (el && el.textContent !== v) el.textContent = v; } // faqat oʻzgarganda yoziladi (keraksiz qayta chizishsiz)
        function isAdmin() { return !!(currentUser && String(currentUser.tabel || '') === ADMIN_TABEL); }
        function isAdminReal() { return !!(currentUser && String(currentUser.tabel || '') === ADMIN_TABEL); } // v3.16: haqiqiy administrator (rol/parol/kalit/oklad uchun)
        function shortName(n) { const p = String(n || '').trim().split(/\s+/); return p.slice(0, 2).join(' ') || '—'; }

        // ============ XODIMLAR BAZASI BO'YICHA QIDIRUV (tabel = shaxsiy raqam) ============
        function allXodims() {
            const out = [];
            const db = (sectionItemsDB && sectionItemsDB.xodim) || {};
            Object.keys(db).forEach(su => (db[su] || []).forEach(it => out.push({ item: it, su: su })));
            return out;
        }
        function cleanTabel(t) { return String(t === undefined || t === null ? '' : t).replace(/\s+/g, '').trim(); }
        function findXodimsByTabel(t) {
            const k = cleanTabel(t);
            if (!k) return [];
            return allXodims().filter(r => cleanTabel(r.item.tabel) === k);
        }
        // Bitta aniq xodimni qaytaradi; topilmasa yoki takrorlansa — xato matni
        function lookupXodim(t) {
            const k = cleanTabel(t);
            if (!k) return { err: "Tabel raqamini kiriting." };
            let found = findXodimsByTabel(k);
            if (!found.length && k === ADMIN_TABEL) { seedAdmin(); found = findXodimsByTabel(k); } // administrator hech qachon tashqarida qolmaydi
            if (!found.length) return { err: "Bu tabel raqami xodimlar ro'yxatida yo'q. Mas'ul xodimga murojaat qiling." };
            if (found.length > 1) return { err: "Bu tabel raqami bir nechta xodimda takrorlangan. Administratorga murojaat qiling." };
            return { rec: found[0] };
        }

        // ============ HISOBLAR ============
        function getAccounts() { try { return JSON.parse(localStorage.getItem(ACC_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function saveAccounts(a) { try { localStorage.setItem(ACC_KEY, JSON.stringify(a)); } catch (e) { alert("⚠️ Xotira to'ldi! Hisob saqlanmadi."); } }
        function makePwRec(pw) {
            const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
            return { salt: salt, hash: hashPw(pw, salt) };
        }
        function checkAccPw(tabel, pw) {
            const a = getAccounts()[cleanTabel(tabel)];
            return !!a && hashPw(pw, a.salt) === a.hash;
        }
        function logPw(type, tabel, name) {
            let log = [];
            try { log = JSON.parse(localStorage.getItem(PWLOG_KEY) || '[]') || []; } catch (e) {}
            log.push({ at: new Date().toISOString(), type: type, tabel: tabel, name: name });
            if (log.length > 300) log = log.slice(-300);
            try { localStorage.setItem(PWLOG_KEY, JSON.stringify(log)); } catch (e) {}
        }

        function getLoginLock() { try { return JSON.parse(localStorage.getItem(LOGIN_LOCK_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function setLoginLock(o) { try { localStorage.setItem(LOGIN_LOCK_KEY, JSON.stringify(o)); } catch (e) {} }
        // 5 marta xato — 30 soniya kutish (har bir tabel uchun alohida)
        function lockedMsg(tabel) {
            if (typeof secBlockMsg === 'function') { const bm = secBlockMsg(tabel); if (bm) return bm; }
            const l = getLoginLock()[tabel];
            if (l && l.until && Date.now() < l.until) return "Juda ko'p xato urinish. " + Math.ceil((l.until - Date.now()) / 1000) + " soniyadan keyin qayta urinib ko'ring.";
            return null;
        }
        function registerFail(tabel) {
            const all = getLoginLock();
            const l = all[tabel] || { fails: 0, until: 0 };
            l.fails = (l.fails || 0) + 1;
            let msg;
            if (l.fails >= 5) { l.until = Date.now() + 30000; l.fails = 0; msg = "5 marta xato kiritildi. 30 soniya kuting."; }
            else msg = "Yana " + (5 - l.fails) + " ta urinish qoldi.";
            all[tabel] = l; setLoginLock(all);
            return msg;
        }
        function clearFails(tabel) { const all = getLoginLock(); delete all[tabel]; setLoginLock(all); }

        // ============ SESSIYA ============
        function setSessionUser(item) {
            currentUser = { name: item.name || '—', role: item.lavozim || '—', tabel: cleanTabel(item.tabel) };
            try { localStorage.setItem('agmk_current_user', JSON.stringify(currentUser)); } catch (e) {}
            try { localStorage.setItem(SESSION_KEY, JSON.stringify({ tabel: currentUser.tabel })); } catch (e) {}
            $id('currentUserName').innerText = shortName(currentUser.name);
            $id('currentUserRole').innerText = currentUser.role;
        }

        function showLock() {
            document.querySelectorAll('.modal-overlay').forEach(m => { if (m.id !== 'uiDialog') m.classList.add('hidden'); });
            document.body.classList.add('locked');
            showLockView('login');
        }
        function hideLock() {
            document.body.classList.remove('locked');
            ['lkPw', 'rgPw', 'rgPw2', 'rsPw', 'rsPw2'].forEach(id => { $id(id).value = ''; });
            placeUndoBar(document.querySelector('.screen.active'));
            updateFooter();
        }

        function showLockView(v) {
            currentLockView = v;
            $id('lockViewLogin').classList.toggle('hidden', v !== 'login');
            $id('lockViewRegister').classList.toggle('hidden', v !== 'register');
            $id('lockViewReset').classList.toggle('hidden', v !== 'reset');
            $id('lockViewPin').classList.toggle('hidden', v !== 'pin');
            $id('lockSubtitle').innerText = v === 'register' ? "Ro'yxatdan o'tish" : (v === 'reset' ? "Parolni tiklash" : "Tizimga kirish");
            ['lkErr', 'rgErr', 'rsErr'].forEach(id => { $id(id).innerText = ''; $id(id).classList.remove('lock-ok'); });
            if (v === 'pin') {
                $id('lockSubtitle').innerText = "PIN-kod bilan kirish";
                const ss = getSession(); const lkp = ss ? lookupXodim(ss.tabel) : {};
                $id('pinName').innerText = lkp.rec ? lkp.rec.item.name : '';
                pinBuf = ''; renderPinDots(); $id('pinErr').innerText = '';
            }
            if (v === 'register') { $id('rgTabel').value = $id('lkTabel').value; previewRegister(); }
            if (v === 'reset') {
                $id('rsTabel').value = $id('lkTabel').value; $id('rsBirth').value = '';
                $id('rsNewBox').classList.add('hidden'); $id('rsBtn').innerText = 'Tekshirish';
                $id('rsTabel').disabled = false; $id('rsBirth').disabled = false; resetVerifiedTabel = null;
            }
        }

        function lockLogin() {
            const err = $id('lkErr');
            const tabel = cleanTabel($id('lkTabel').value);
            const pw = $id('lkPw').value;
            if (!tabel || !pw) { err.innerText = "Tabel raqami va parolni kiriting."; return; }
            const lm = lockedMsg(tabel);
            if (lm) { err.innerText = lm; return; }
            const acc = getAccounts()[tabel];
            if (!acc) {
                const lk = lookupXodim(tabel);
                err.innerText = lk.err ? lk.err : "Siz hali ro'yxatdan o'tmagansiz. Pastdagi \"Ro'yxatdan o'tish\" tugmasini bosing.";
                return;
            }
            if (!checkAccPw(tabel, pw)) {
                err.innerText = "Parol noto'g'ri. " + registerFail(tabel);
                $id('lkPw').value = '';
                return;
            }
            const lk = lookupXodim(tabel);
            if (lk.err) { err.innerText = lk.err; return; } // xodim ro'yxatdan chiqarilgan bo'lsa kira olmaydi
            clearFails(tabel);
            { const ac = getAccounts(); if (ac[tabel] && ac[tabel].pinFails) { ac[tabel].pinFails = 0; saveAccounts(ac); } }
            setSessionUser(lk.rec.item);
            hideLock();
        }

        function previewRegister() {
            const box = $id('rgPreview');
            const t = cleanTabel($id('rgTabel').value);
            if (!t) { box.classList.add('hidden'); return; }
            const lk = lookupXodim(t);
            box.classList.remove('hidden');
            if (lk.err) { box.classList.add('bad'); box.innerText = lk.err; return; }
            const it = lk.rec.item;
            if (getAccounts()[t]) {
                box.classList.add('bad');
                box.innerText = "Bu tabel raqami bilan hisob allaqachon ochilgan. Kirish oynasidan kiring yoki parolni tiklang.";
                return;
            }
            box.classList.remove('bad');
            box.innerHTML = "✅ <b>" + escapeHtml(it.name) + "</b><br>Lavozim: " + escapeHtml(it.lavozim || '—') +
                "<br>Ish joyi: " + escapeHtml(lk.rec.su) + (it.bolim ? " — " + escapeHtml(it.bolim) : "");
        }

        function registerAccount() {
            const err = $id('rgErr');
            const t = cleanTabel($id('rgTabel').value);
            const lk = lookupXodim(t);
            if (lk.err) { err.innerText = lk.err; return; }
            const accs = getAccounts();
            if (accs[t]) { err.innerText = "Bu tabel raqami bilan hisob allaqachon ochilgan."; return; }
            const p1 = $id('rgPw').value, p2 = $id('rgPw2').value;
            if (p1.length < 4) { err.innerText = "Parol kamida 4 belgidan iborat bo'lishi kerak."; return; }
            if (p1 !== p2) { err.innerText = "Parollar bir xil emas."; return; }
            const rec = makePwRec(p1); rec.created = new Date().toISOString();
            accs[t] = rec; saveAccounts(accs);
            logPw("Ro'yxatdan o'tdi", t, lk.rec.item.name);
            setSessionUser(lk.rec.item);
            hideLock();
            alert("Ro'yxatdan o'tdingiz! Keyingi safar tabel raqamingiz (" + t + ") va parolingiz bilan kirasiz.");
        }

        // 1-qadam: tabel + tug'ilgan sana tekshiriladi; 2-qadam: yangi parol
        function resetStep() {
            const err = $id('rsErr');
            err.classList.remove('lock-ok');
            if (!resetVerifiedTabel) {
                const t = cleanTabel($id('rsTabel').value);
                const b = $id('rsBirth').value;
                if (!t || !b) { err.innerText = "Tabel raqami va tug'ilgan sanani kiriting."; return; }
                const lm = lockedMsg('reset:' + t);
                if (lm) { err.innerText = lm; return; }
                const lk = lookupXodim(t);
                if (lk.err) { err.innerText = lk.err; return; }
                if (!getAccounts()[t]) { err.innerText = "Bu tabel raqami bilan hali hisob ochilmagan. Avval ro'yxatdan o'ting."; return; }
                if (String(lk.rec.item.birthDate || '') !== b) { err.innerText = "Ma'lumotlar mos kelmadi. " + registerFail('reset:' + t); return; }
                clearFails('reset:' + t);
                resetVerifiedTabel = t;
                $id('rsTabel').disabled = true; $id('rsBirth').disabled = true;
                $id('rsNewBox').classList.remove('hidden');
                $id('rsBtn').innerText = "Yangi parolni saqlash";
                err.classList.add('lock-ok'); err.innerText = "Tasdiqlandi. Yangi parol o'rnating.";
                setTimeout(() => $id('rsPw').focus(), 50);
                return;
            }
            const p1 = $id('rsPw').value, p2 = $id('rsPw2').value;
            if (p1.length < 4) { err.innerText = "Parol kamida 4 belgidan iborat bo'lishi kerak."; return; }
            if (p1 !== p2) { err.innerText = "Parollar bir xil emas."; return; }
            const accs = getAccounts();
            const created = accs[resetVerifiedTabel] && accs[resetVerifiedTabel].created;
            accs[resetVerifiedTabel] = makePwRec(p1); if (created) accs[resetVerifiedTabel].created = created;
            saveAccounts(accs);
            const lk = lookupXodim(resetVerifiedTabel);
            logPw("Parol tiklandi (tug'ilgan sana orqali)", resetVerifiedTabel, lk.rec ? lk.rec.item.name : '');
            clearFails(resetVerifiedTabel);
            $id('lkTabel').value = resetVerifiedTabel; $id('lkPw').value = '';
            showLockView('login');
            $id('lkErr').classList.add('lock-ok');
            $id('lkErr').innerText = "Parol yangilandi. Endi yangi parol bilan kiring.";
        }

        // ============ HISOB MENYUSI ============
        function openAccountMenu() {
            $id('accName').innerText = currentUser.name || '—';
            $id('accMeta').innerText = "Tabel №: " + (currentUser.tabel || '—') + "\n" + (currentUser.role || '');
            $id('accAdmin').classList.toggle('hidden', !isAdmin());
            $id('accountModal').classList.remove('hidden');
        }

        async function logout() {
            if (!await uiConfirm("Hisobdan chiqasizmi? Qayta kirish uchun tabel raqami va parol so'raladi.")) return;
            const t = currentUser.tabel || '';
            currentUser = { name: "Mehmon", role: "Tizimga kiring" };
            try { localStorage.removeItem('agmk_current_user'); } catch (e) {}
            try { localStorage.removeItem(SESSION_KEY); } catch (e) {} // "Chiqish" — keyingi kirish faqat tabel va parol bilan
            $id('currentUserName').innerText = currentUser.name;
            $id('currentUserRole').innerText = currentUser.role;
            openScreen('screen-main');
            $id('lkTabel').value = t; $id('lkPw').value = '';
            showLock();
        }

        function openAccPw() {
            ['apTabel', 'apBirth', 'apOld', 'apNew', 'apNew2'].forEach(id => { $id(id).value = ''; });
            $id('apErr').innerText = '';
            $id('accPwModal').classList.remove('hidden');
        }

        function saveAccPw() {
            const err = $id('apErr');
            const t = cleanTabel($id('apTabel').value);
            const b = $id('apBirth').value;
            const oldp = $id('apOld').value, p1 = $id('apNew').value, p2 = $id('apNew2').value;
            if (!t || !b || !oldp || !p1) { err.innerText = "Barcha maydonlarni to'ldiring."; return; }
            if (t !== cleanTabel(currentUser.tabel)) { err.innerText = "Tabel raqami sizning hisobingizga mos kelmadi."; return; }
            const lm = lockedMsg('change:' + t);
            if (lm) { err.innerText = lm; return; }
            const lk = lookupXodim(t);
            if (lk.err) { err.innerText = lk.err; return; }
            if (String(lk.rec.item.birthDate || '') !== b || !checkAccPw(t, oldp)) {
                err.innerText = "Tug'ilgan sana yoki eski parol noto'g'ri. " + registerFail('change:' + t);
                return;
            }
            if (p1.length < 4) { err.innerText = "Yangi parol kamida 4 belgidan iborat bo'lishi kerak."; return; }
            if (p1 !== p2) { err.innerText = "Yangi parollar bir xil emas."; return; }
            clearFails('change:' + t);
            const accs = getAccounts();
            const created = accs[t] && accs[t].created;
            accs[t] = makePwRec(p1); if (created) accs[t].created = created;
            saveAccounts(accs);
            logPw("Parol o'zgartirildi", t, lk.rec.item.name);
            $id('accPwModal').classList.add('hidden');
            alert("Parol muvaffaqiyatli o'zgartirildi.");
        }

        function openPwLog() {
            if (!isAdminReal()) return;
            let log = [];
            try { log = JSON.parse(localStorage.getItem(PWLOG_KEY) || '[]') || []; } catch (e) {}
            const box = $id('pwLogList');
            box.innerHTML = log.length ? log.slice().reverse().map(r => {
                const d = new Date(r.at);
                const ds = isNaN(d) ? r.at : (d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
                return '<div class="log-row"><b>' + escapeHtml(r.name || '—') + '</b> (tabel ' + escapeHtml(r.tabel) + ')<br>' + escapeHtml(r.type) + ' — ' + escapeHtml(ds) + '</div>';
            }).join('') : '<div style="text-align:center; color:#94a3b8; padding:20px; font-size:12px;">Hozircha yozuv yo\'q</div>';
            $id('pwLogModal').classList.remove('hidden');
        }

        // ============ ADMINISTRATOR YOZUVI (birinchi ishga tushirishda) ============
        function seedAdmin() {
            if (!findXodimsByTabel(ADMIN_TABEL).length) {
                if (!sectionItemsDB.xodim) sectionItemsDB.xodim = {};
                if (!sectionItemsDB.xodim['Boshqarma']) sectionItemsDB.xodim['Boshqarma'] = [];
                const ids = [];
                Object.values(sectionItemsDB.xodim).forEach(a => (a || []).forEach(x => ids.push(x.id)));
                const id = ids.length ? Math.max(...ids) + 1 : Date.now();
                sectionItemsDB.xodim['Boshqarma'].unshift({
                    id: id, name: "@@ADMIN_NAME@@", inv: ADMIN_TABEL, tabel: ADMIN_TABEL,
                    lavozim: ADMIN_LAVOZIM, bolim: "ICHTB", birthDate: "", yil: null, seh: "Boshqarma", // v3.0: shaxsiy sana kodga yozilmaydi
                    status: "Soz", kirganSana: "", photo: null, workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [],
                    spravka: null, oilaviy: "Yaxshi", izoh: "", oilaAzolari: "", history: [], gallery: []
                });
                saveDB(false);
            }
            if (!localStorage.getItem('agmk_admin_seeded') && !shtatList.some(x => normTxt(x) === normTxt(ADMIN_LAVOZIM))) { shtatList.push(ADMIN_LAVOZIM); saveShtat(); }
            try { localStorage.setItem('agmk_admin_seeded', '1'); } catch (e) {}
        }

        // ============ TARQATISH UCHUN FAYL ============
        // Fayl ichiga joylangan ma'lumotlarni (xodimlar, shtat va h.k.) birinchi ochilishda qabul qiladi
        function applyBundle() {
            let b = null;
            try { b = JSON.parse(($id('agmk-bundle') || {}).textContent || 'null'); } catch (e) {}
            if (!b || !b.stamp) return;
            const applied = parseInt(localStorage.getItem(BUNDLE_APPLIED_KEY) || '0', 10);
            if (b.stamp <= applied) return;
            const hasLocal = localStorage.getItem(DB_KEY) !== null;
            if (b.db) {
                if (!hasLocal) {
                    if (Array.isArray(b.db.vagonlar)) vagonlarData = b.db.vagonlar;
                    if (b.db.sections) sectionItemsDB = b.db.sections;
                } else if (b.db.sections && b.db.sections.xodim) {
                    // Telefonda eski ma'lumot bo'lsa ham xodimlar ro'yxati markaziy fayldan yangilanadi
                    sectionItemsDB.xodim = b.db.sections.xodim;
                }
            }
            if (Array.isArray(b.shtat) && b.shtat.length) { shtatList = b.shtat; saveShtat(); }
            if (b.shtatPw && b.shtatPw.hash) { try { localStorage.setItem(SHTAT_PW_KEY, JSON.stringify(b.shtatPw)); } catch (e) {} }
            if (b.contacts && (b.contacts.email || b.contacts.telegram)) saveContacts(b.contacts);
            if (Array.isArray(b.rahbar)) saveRahbarList(b.rahbar);
            if (b.ai && typeof aiApplyBundle === 'function') aiApplyBundle(b.ai);
            if (b.shtatTree && Array.isArray(b.shtatTree.pos) && b.shtatTree.pos.length) saveShtatTree(b.shtatTree);
            migrateData();
            vagonlarData.forEach(recalcVagonStatus);
            saveDB(false);
            try { localStorage.setItem(BUNDLE_APPLIED_KEY, String(b.stamp)); } catch (e) {}
            filterVagonlar();
        }

        // Toza nusxa (ilova fayli) faqat kerak boʻlganda oʻqiladi — ilgari har ochilishda butun sahifa (≈15 mln belgi) xotirada saqlanardi
        async function agmkPristine() {
            try { const r = await fetch(location.href.split('#')[0], { cache: 'no-store' }); if (r.ok) { const t = await r.text(); if (/text\/x-agmk-main/.test(t)) return t; } } catch (e) {}
            return null;
        }
        async function exportBundleFile() {
            if (!isAdminReal()) return;
            const base = await agmkPristine();
            if (!base) { alert("Faylni tayyorlab bo'lmadi. Dasturni qayta ochib, yana urinib ko'ring."); return; }
            const stamp = Date.now();
            const PD = ['birthDate', 'yil', 'phone', 'phones2', 'oilaviy', 'oilaAzolari', 'spravka', 'photo', 'workHistory', 'yutuqlar', 'hafsanalar', 'tatillar', 'izoh', 'email', 'telegram', 'tg', 'passport', 'address', 'manzil', 'oklad']; // shaxsiy maʼlumotlar tarqatish fayliga kirmaydi
            const secs = JSON.parse(JSON.stringify(sectionItemsDB)); Object.values(secs.xodim || {}).forEach(L => (L || []).forEach(it => PD.forEach(k => { if (k in it) it[k] = Array.isArray(it[k]) ? [] : (k === 'yil' ? null : ''); })));
            const data = { stamp: stamp, ai: null, db: stripImagesForBundle({ vagonlar: JSON.parse(JSON.stringify(vagonlarData)), sections: secs }), shtat: shtatList, shtatTree: getShtatTree(), shtatPw: getPwRec(), contacts: getContacts(), rahbar: getRahbarList() };
            const json = JSON.stringify(data).replace(/</g, '\\u003c');
            const re = /<script id="agmk-bundle" type="application\/json">[\s\S]*?<\/script>/;
            if (!re.test(base)) { alert("Faylni tayyorlab bo'lmadi."); return; }
            const html = base.replace(re, () => '<script id="agmk-bundle" type="application/json">' + json + '<\/script>');
            try { localStorage.setItem(BUNDLE_APPLIED_KEY, String(stamp)); } catch (e) {}
            downloadFile(html, 'agmk-sttb-pto-tarqatish-' + new Date().toISOString().slice(0, 10) + '.html', 'text/html');
            alert("Tarqatish uchun fayl yuklab olindi (" + allXodims().length + " ta xodim yozuvi bilan).\n\nShu faylni xodimlarga yuboring. Ular tabel raqami orqali ro'yxatdan o'tadi.\n\nEslatma: hisoblar, parollar va rasmlar faylga kirmaydi — har kim o'z telefonida ro'yxatdan o'tadi.");
        }

        // ============ XODIM MA'LUMOTLARINI TAHRIRLASH ============
        const COMBOS = {};
        function setupShtatCombo(key, ids) {
            const cfg = { ids: ids, items: [], active: -1 };
            COMBOS[key] = cfg;
            const inp = $id(ids.input);
            inp.addEventListener('focus', () => { inp.select(); comboOpen(key, ''); });
            inp.addEventListener('input', () => comboOpen(key, inp.value));
            inp.addEventListener('blur', () => setTimeout(() => comboClose(key), 150));
            inp.addEventListener('keydown', e => {
                const list = $id(ids.list);
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (list.classList.contains('hidden')) { comboOpen(key, inp.value); return; }
                    if (!cfg.items.length) return;
                    cfg.active = e.key === 'ArrowDown' ? Math.min(cfg.items.length - 1, cfg.active + 1) : Math.max(0, cfg.active - 1);
                    list.querySelectorAll('.combo-opt').forEach((el, k) => el.classList.toggle('active', k === cfg.active));
                    const act = list.querySelector('.combo-opt.active'); if (act) act.scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (cfg.active >= 0) comboChoose(key, cfg.active); else if (cfg.items.length === 1) comboChoose(key, 0);
                } else if (e.key === 'Escape') { comboClose(key); }
            });
        }
        function comboOpen(key, q) {
            const cfg = COMBOS[key], ids = cfg.ids;
            const selected = $id(ids.hidden).value;
            cfg.items = shtatMatches(q);
            cfg.active = cfg.items.length && String(q || '').trim() ? 0 : -1;
            const meta = String(q || '').trim() ? (cfg.items.length + " / " + shtatList.length + " ta lavozim") : (shtatList.length + " ta lavozim");
            let html = '<div class="combo-meta">' + meta + '</div>';
            if (!cfg.items.length) html += '<div class="combo-empty">Mos lavozim topilmadi</div>';
            html += cfg.items.map((r, k) => '<div class="combo-opt' + (r.name === selected ? ' selected' : '') + (k === cfg.active ? ' active' : '') +
                '" role="option" onpointerdown="event.preventDefault()" onclick="comboChoose(\'' + key + '\',' + k + ')">' + highlightMatch(r.name, q) + '</div>').join('');
            const list = $id(ids.list);
            list.innerHTML = html;
            list.classList.remove('hidden');
            $id(ids.wrap).classList.add('open');
        }
        function comboClose(key) {
            const ids = COMBOS[key].ids;
            const list = $id(ids.list);
            if (list.classList.contains('hidden')) return;
            list.classList.add('hidden');
            $id(ids.wrap).classList.remove('open');
            const inp = $id(ids.input);
            const exact = shtatList.find(x => normTxt(x) === normTxt(inp.value));
            if (exact) $id(ids.hidden).value = exact;
            inp.value = $id(ids.hidden).value; // ro'yxatda yo'q matn qabul qilinmaydi
        }
        function comboChoose(key, k) {
            const cfg = COMBOS[key], r = cfg.items[k];
            if (!r) return;
            $id(cfg.ids.hidden).value = r.name;
            $id(cfg.ids.input).value = r.name;
            comboClose(key);
            $id(cfg.ids.input).blur();
        }
        function comboToggle(key) {
            const ids = COMBOS[key].ids;
            if ($id(ids.list).classList.contains('hidden')) $id(ids.input).focus(); else $id(ids.input).blur();
        }

        function openXodimEdit() {
            const item = getActiveItem();
            if (!item || currentSectionType !== 'xodim') return;
            $id('xeName').value = item.name || '';
            $id('xeTabel').value = item.tabel || '';
            $id('xeRazryad').value = (item.razryad >= 1 && item.razryad <= 15) ? String(item.razryad) : '';
            rzShow();
            $id('xeLavozim').value = item.lavozim && item.lavozim !== '—' ? item.lavozim : '';
            $id('xeLavozimSearch').value = $id('xeLavozim').value;
            const sel = $id('xeSeh');
            sel.innerHTML = subUnits11.map(su => '<option value="' + escapeHtml(su) + '">' + escapeHtml(su) + '</option>').join('');
            if (!subUnits11.includes(currentSubUnit)) sel.innerHTML += '<option value="' + escapeHtml(currentSubUnit) + '">' + escapeHtml(currentSubUnit) + '</option>';
            sel.value = currentSubUnit;
            $id('xeBolim').value = item.bolim || '';
            $id('xeBirth').value = item.birthDate || '';
            $id('xeKirgan').value = item.kirganSana || '';
            $id('xePhone').value = item.phone || '';
            $id('xePhones2').innerHTML = (item.phones2 || []).map(p => ph2RowHtml(p.num, p.note)).join('');
            $id('xePosNo').value = item.posNo && posByNo(item.posNo) ? item.posNo : '';
            if (!$id('xePosNo').value) $id('xeLavozim').value = '';
            xpShowSelected();
            $id('xodimEditModal').classList.remove('hidden');
        }

        async function saveXodimEdit() {
            const item = getActiveItem();
            if (!item) return;
            const name = $id('xeName').value.replace(/\s+/g, ' ').trim();
            const tabel = cleanTabel($id('xeTabel').value);
            const lavozim = $id('xeLavozim').value.trim();
            const xpPos = posByNo($id('xePosNo').value);
            const seh = xpPos ? unitById(xpPos.u).key : $id('xeSeh').value;
            if (!name) { alert("F.I.O. kiriting!"); return; }
            if (!tabel) { alert("Tabel raqami majburiy!"); return; }
            const dup = findXodimsByTabel(tabel).filter(r => r.item !== item);
            if (dup.length) { alert("Bu tabel raqami boshqa xodimda bor: " + dup[0].item.name + " (" + dup[0].su + "). Tabel raqami takrorlanmasligi kerak."); return; }
            if (!lavozim || !xpPos) { alert("Lavozimni shtatdan tanlang!"); return; }
            const phone = normalizePhone($id('xePhone').value);
            if (phone === null) { alert("Asosiy telefon raqami noto'g'ri. +998 XX XXX XX XX ko'rinishida kiriting."); return; }
            const phones2 = [];
            for (const row of document.querySelectorAll('#xePhones2 .ph2-row')) {
                const raw = row.querySelector('.ph2-num').value, note = row.querySelector('.ph2-note').value.trim();
                if (!raw.trim()) continue;
                const n = normalizePhone(raw);
                if (n === null) { alert("Zaxira raqam noto'g'ri: " + raw + "\n+998 XX XXX XX XX ko'rinishida kiriting."); return; }
                phones2.push({ num: n, note: note });
            }
            if (cleanTabel(item.tabel) === ADMIN_TABEL && tabel !== ADMIN_TABEL) { alert("Administrator tabel raqami (" + ADMIN_TABEL + ") o'zgartirilmaydi."); return; }
            if (!await uiConfirm("O'zgarishlar saqlansinmi?")) return;

            const oldTabel = cleanTabel(item.tabel);
            item.name = name;
            item.tabel = tabel; item.inv = tabel;
            item.razryad = $id('xeRazryad').value ? parseInt($id('xeRazryad').value, 10) : null;
            item.lavozim = lavozim;
            item.bolim = $id('xeBolim').value.trim();
            item.birthDate = $id('xeBirth').value || '';
            if (item.birthDate) item.yil = parseInt(item.birthDate.slice(0, 4), 10);
            item.kirganSana = $id('xeKirgan').value || '';
            item.phone = phone;
            item.phones2 = phones2;
            if (xpPos) { item.posNo = xpPos.no; item.lavozim = xpPos.name; }

            if (seh && seh !== currentSubUnit) {
                // Seh o'zgarsa, xodim yangi seh ro'yxatiga ko'chiriladi
                sectionItemsDB.xodim[currentSubUnit] = (sectionItemsDB.xodim[currentSubUnit] || []).filter(x => x !== item);
                if (!sectionItemsDB.xodim[seh]) sectionItemsDB.xodim[seh] = [];
                sectionItemsDB.xodim[seh].push(item);
                item.seh = seh;
                currentSubUnit = seh;
                $id('items-header-title').innerText = seh;
            }
            if (oldTabel && oldTabel !== tabel) {
                const accs = getAccounts();
                if (accs[oldTabel] && !accs[tabel]) { accs[tabel] = accs[oldTabel]; delete accs[oldTabel]; saveAccounts(accs); }
            }
            if (currentUser && cleanTabel(currentUser.tabel) === oldTabel) setSessionUser(item);

            saveDB();
            $id('xodimEditModal').classList.add('hidden');
            openItemPasport(item.id);
        }

        // ============ MIKROFON: TUSHUNARLI XABAR VA ZAXIRA YO'L ============
        function voiceErrorHelp(err, inputId) {
            if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'unsupported' || err === 'audio-capture' || err === 'network') {
                micBlocked = true; try { sessionStorage.setItem('agmk_mic_blocked', '1'); } catch (e) {}
                micFallback(inputId); return; // katta oyna o'rniga: klaviatura ochiladi + qisqa eslatma
            }
            let msg;
            if (err === 'not-allowed' || err === 'service-not-allowed') {
                msg = "🎤 Bu dastur mikrofonga ruxsat bermayapti.\n\nYechim: faylni Chrome brauzerida oching va \"Mikrofonga ruxsat berilsinmi?\" savoliga \"Ruxsat berish\"ni bosing.\n\nHozircha klaviaturadagi 🎤 tugmasi orqali ovoz bilan yozishingiz mumkin.";
            } else if (err === 'unsupported') {
                msg = "🎤 Bu dastur ovozni aniqlashni qo'llab-quvvatlamaydi.\n\nKlaviaturadagi 🎤 tugmasi orqali ovoz bilan yozishingiz mumkin.";
            } else if (err === 'audio-capture') {
                msg = "🎤 Mikrofon topilmadi yoki uni boshqa dastur band qilgan.\n\nKlaviaturadagi 🎤 tugmasidan foydalaning.";
            } else if (err === 'network') {
                msg = "🎤 Ovozni aniqlash uchun internet kerak. Internetni tekshiring yoki klaviaturadagi 🎤 tugmasidan foydalaning.";
            } else {
                msg = "Ovozni aniqlashda xatolik: " + err + "\n\nKlaviaturadagi 🎤 tugmasidan foydalanishingiz mumkin.";
            }
            alert(msg);
            const inp = $id(inputId);
            if (inp) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 80);
        }

        // ============ TELEFONNING "ORTGA" TUGMASI ============
        function rearmBack() { try { history.pushState({ agmk: 1 }, ''); } catch (e) {} }
        function initBackGuard() {
            try { history.pushState({ agmk: 1 }, ''); } catch (e) { return; }
            window.addEventListener('popstate', onBackPressed);
        }
        function closeOverlay(m) {
            if (m.id === 'uiDialog') { uidClose(false); return; }
            if (m.id === 'warnModal' && warnView === 'letter') { warnView = 'list'; renderWarnings(); return; }
            if (m.id === 'imageViewerModal' && typeof closeImageViewer === 'function') { closeImageViewer(); return; }
            if (m.id === 'aiChatModal') { m.classList.add('hidden'); if (typeof stopAiSpeaking === 'function') stopAiSpeaking(); return; }
            if (m.id === 'pwModal') { closePwModal(); return; }
            if (m.id === 'pkPerson' && typeof ppCancel === 'function') { ppCancel(); return; }
            if ((m.id === 'pkSel' || m.id === 'pkDate') && typeof pkClose === 'function') { pkClose(); return; }
            m.classList.add('hidden');
        }
        function onBackPressed() {
            if (document.body.classList.contains('locked')) {
                if (currentLockView !== 'login' && currentLockView !== 'pin') { showLockView('login'); rearmBack(); return; }
                history.back(); // kirish oynasida — dasturdan chiqish
                return;
            }
            const open = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => !m.classList.contains('hidden'));
            if (open.length) {
                open.sort((a, b) => (parseInt(getComputedStyle(a).zIndex, 10) || 0) - (parseInt(getComputedStyle(b).zIndex, 10) || 0));
                closeOverlay(open[open.length - 1]);
                rearmBack();
                return;
            }
            const scr = document.querySelector('.screen.active');
            if (scr && scr.id !== 'screen-main') {
                const bb = scr.querySelector('.back-btn');
                if (bb) bb.click(); else openScreen('screen-main');
                rearmBack();
                return;
            }
            history.back(); // bosh menyuda — dasturdan chiqish
        }

        // ============ ISHGA TUSHIRISH ============
        function initAuth() {
            applyBundle();
            seedAdmin();
            seedDemoRahbar();
            try { if (typeof rosterApply === 'function') rosterApply(); } catch (e) { console.error('roster', e); } // v3.2: shtat roʻyxati (20.05.2026)
            const logo = document.querySelector('.app-logo img');
            if (logo) $id('lockLogo').src = logo.src;
            ['lkTabel', 'lkPw'].forEach(id => $id(id).addEventListener('keydown', e => { if (e.key === 'Enter') lockLogin(); }));
            ['rgPw', 'rgPw2'].forEach(id => $id(id).addEventListener('keydown', e => { if (e.key === 'Enter') registerAccount(); }));
            ['rsPw', 'rsPw2', 'rsBirth'].forEach(id => $id(id).addEventListener('keydown', e => { if (e.key === 'Enter') resetStep(); }));
            setupShtatCombo('xe', { wrap: 'xeCombo', input: 'xeLavozimSearch', hidden: 'xeLavozim', list: 'xeLavozimList' });
            setupShtatCombo('ai', { wrap: 'aiCombo', input: 'aiLavozimSearch', hidden: 'ai-lavozim', list: 'aiLavozimList' });
            showLock();
            const ses = getSession();
            if (ses && ses.tabel) $id('lkTabel').value = ses.tabel;
            if (canPinUnlock()) showLockView('pin'); // "Chiqish" bosilmagan va PIN yoqilgan bo'lsa
            initBackGuard();
        }


