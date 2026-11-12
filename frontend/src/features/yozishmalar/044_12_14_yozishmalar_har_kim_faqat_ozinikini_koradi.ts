        // =========================================================
        // 12, 14) YOZISHMALAR: har kim faqat o'zinikini ko'radi, shifrlangan; tepadagi tugma
        // =========================================================
        var CHS = { key: null, t: '', mem: {}, loaded: false, saving: null };
        function chsSubtle() { return window.crypto && crypto.subtle ? crypto.subtle : null; }
        const b64e = u8 => { let s = ''; u8 = new Uint8Array(u8); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); };
        const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
        async function chsKek(secret, salt) {
            const S = chsSubtle(); const base = await S.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
            return S.deriveKey({ name: 'PBKDF2', salt: b64d(salt), iterations: 120000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        }
        async function chsEnc(key, u8) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await chsSubtle().encrypt({ name: 'AES-GCM', iv: iv }, key, u8); return { iv: b64e(iv), ct: b64e(ct) }; }
        async function chsDec(key, o) { return new Uint8Array(await chsSubtle().decrypt({ name: 'AES-GCM', iv: b64d(o.iv) }, key, b64d(o.ct))); }
        function chsRecKey(t) { return 'agmk_ck_' + t; }
        function chsDataKey(t) { return 'agmk_chats_u_' + t; }
        // Kirishda: parol yoki PIN orqali shaxsiy kalit ochiladi
        async function chsUnlock(t, secret, kind) {
            t = cleanTabel(t); CHS.t = t; CHS.key = null; CHS.mem = {}; CHS.loaded = false;
            if (!chsSubtle()) { CHS.plain = true; CHS.mem = kvGet(chsDataKey(t), {}) || {}; CHS.loaded = true; chsAfterLoad(); return; }
            let rec = kvGet(chsRecKey(t), null), dk = null;
            try {
                if (rec && rec[kind]) { const kek = await chsKek(t + ':' + kind + ':' + secret, rec.salt); dk = await chsDec(kek, rec[kind]); }
                else if (!rec && kind === 'pw') {
                    dk = crypto.getRandomValues(new Uint8Array(32));
                    rec = { salt: b64e(crypto.getRandomValues(new Uint8Array(16))) };
                    const kek = await chsKek(t + ':pw:' + secret, rec.salt); rec.pw = await chsEnc(kek, dk); localStorage.setItem(chsRecKey(t), JSON.stringify(rec));
                } else if (rec && kind === 'pw' && !rec.pw) { /* kutilmagan holat */ }
            } catch (e) {
                // parol tiklangan bo'lsa eski kalit ochilmaydi — yangi kalit, eski yozishmalar o'qilmaydi
                if (kind === 'pw') { dk = crypto.getRandomValues(new Uint8Array(32)); rec = { salt: b64e(crypto.getRandomValues(new Uint8Array(16))) }; const kek = await chsKek(t + ':pw:' + secret, rec.salt); rec.pw = await chsEnc(kek, dk); localStorage.setItem(chsRecKey(t), JSON.stringify(rec)); try { localStorage.removeItem(chsDataKey(t)); } catch (x) {} }
            }
            if (!dk) { CHS.locked = true; CHS.loaded = true; chsAfterLoad(); return; }
            CHS.locked = false; CHS.dk = dk;
            CHS.key = await chsSubtle().importKey('raw', dk, 'AES-GCM', false, ['encrypt', 'decrypt']);
            // PIN bilan ham ochilishi uchun (PIN o'rnatilgan bo'lsa va hali o'ralmagan bo'lsa)
            if (kind === 'pin' && rec && !rec.pin) {}
            const raw = localStorage.getItem(chsDataKey(t));
            if (raw) { try { CHS.mem = JSON.parse(new TextDecoder().decode(await chsDec(CHS.key, JSON.parse(raw)))) || {}; } catch (e) { CHS.mem = {}; } }
            // Eski umumiy yozishmalar — faqat admin hisobiga o'tadi
            try { const old = localStorage.getItem('agmk_chats'); if (old && t === ADMIN_TABEL) { const o = JSON.parse(old) || {}; Object.keys(o).forEach(k => { if (!CHS.mem[k]) CHS.mem[k] = o[k]; }); localStorage.removeItem('agmk_chats'); await chsWrite(); } } catch (e) {}
            CHS.loaded = true; chsAfterLoad();
        }
        async function chsWrap(kind, secret) {
            // PIN o'rnatilganda/o'zgartirilganda: ochiq kalitni PIN bilan ham o'rab qo'yamiz
            if (!CHS.dk || !chsSubtle()) return; const t = CHS.t; const rec = kvGet(chsRecKey(t), null); if (!rec) return;
            const kek = await chsKek(t + ':' + kind + ':' + secret, rec.salt); rec[kind] = await chsEnc(kek, CHS.dk); localStorage.setItem(chsRecKey(t), JSON.stringify(rec));
        }
        async function chsWrite() {
            const t = CHS.t; if (!t) return;
            if (CHS.plain) { try { localStorage.setItem(chsDataKey(t), JSON.stringify(CHS.mem)); } catch (e) {} return; }
            if (!CHS.key) return;
            const enc = await chsEnc(CHS.key, new TextEncoder().encode(JSON.stringify(CHS.mem)));
            try { localStorage.setItem(chsDataKey(t), JSON.stringify(enc)); } catch (e) { alert("⚠️ Xotira to'ldi — xabar saqlanmadi."); }
        }
        function chsAfterLoad() { try { chatTopBadge(); } catch (e) {} try { if ($id('screen-chat') && $id('screen-chat').classList.contains('active')) chatRender(); } catch (e) {} }
        chatAll = function () { if (!CHS.t || CHS.t !== meTabel()) return {}; return CHS.mem; };
        chatSave = function (a) {
            if (!CHS.t || CHS.t !== meTabel()) { alert("🔒 Yozishmalar ochilmagan — ilovadan chiqib, parol bilan qayta kiring."); return false; }
            if (CHS.locked) { alert("🔒 Yozishmalaringiz shifrlangan. Ochish uchun bir marta tabel va parol bilan kiring."); return false; }
            CHS.mem = a; clearTimeout(CHS.saving); CHS.saving = setTimeout(chsWrite, 150); setTimeout(chatTopBadge, 0); return true;
        };
        // Kirish oqimlariga ulanish
        (function () {
            lockLogin = agmkExtend('lockLogin', 'Kirish oqimlariga ulanish', lockLogin, oL => function () {
                const t = cleanTabel($id('lkTabel').value), pw = $id('lkPw').value;
                const r = oL.apply(this, arguments);
                if (!document.body.classList.contains('locked') && meTabel() === t && pw) chsUnlock(t, pw, 'pw');
                return r;
            });
            checkPin = agmkExtend('checkPin', 'checkPin', checkPin, oP => function () {
                const pin = pinBuf, s = getSession();
                const r = oP.apply(this, arguments);
                if (!document.body.classList.contains('locked') && s && meTabel() === cleanTabel(s.tabel)) chsUnlock(s.tabel, pin, 'pin');
                return r;
            });
            savePinSetup = agmkExtend('savePinSetup', 'savePinSetup', savePinSetup, oS => function () { const p = $id('psPin').value; const r = oS.apply(this, arguments); if ($id('pinSetupModal').classList.contains('hidden') && /^\d{4}$/.test(p)) chsWrap('pin', p); return r; });
            // Hisobdan chiqishda kalit xotiradan o'chiriladi
            ['logoutUser', 'doLogout', 'lockApp', 'showLock'].forEach(fn => { try { const o = window[fn]; if (typeof o !== 'function') return; window[fn] = function () { CHS.key = null; CHS.dk = null; CHS.mem = {}; CHS.t = ''; CHS.loaded = false; try { chatTopBadge(); } catch (e) {} return o.apply(this, arguments); }; } catch (e) {} });
        })();
        // Kontaktlar ro'yxatida o'zingiz chiqmaysiz
        (function () {
            if (typeof pplList === 'function') { pplList = agmkExtend('pplList', 'Kontaktlar roʼyxatida oʼzingiz chiqmaysiz', pplList, o => function () { const l = o.apply(this, arguments); if (!CHS.listing) return l; try { const me = meTabel(); return (l || []).filter(p => !(p && cleanTabel(p.tabel) === me)); } catch (e) { return l; } }); }
            if (typeof chatListRender === 'function') { chatListRender = agmkExtend('chatListRender', 'chatListRender', chatListRender, o => function () { CHS.listing = true; try { return o.apply(this, arguments); } finally { CHS.listing = false; } }); }
            if (typeof openChats === 'function') { openChats = agmkExtend('openChats', 'openChats', openChats, o => function (p) { if (p && cleanTabel(p.tabel) && cleanTabel(p.tabel) === meTabel()) { showToast("Oʻzingizga xabar yozib boʻlmaydi"); return; } if (CHS.locked) { alert("🔒 Yozishmalaringiz shifrlangan. Ochish uchun ilovadan chiqib, bir marta tabel va parol bilan kiring."); } const r = o.apply(this, arguments); try { chatMarkRead(); } catch (e) {} return r; }); }
            if (typeof chatRender === 'function') { chatRender = agmkExtend('chatRender', 'chatRender', chatRender, o => function () { const r = o.apply(this, arguments); try { chatMarkRead(); } catch (e) {} return r; }); }
        })();
        function chatUnread() { let n = 0; const a = chatAll(); Object.values(a).forEach(c => (c.msgs || []).forEach(m => { if (!m.me && !m.read) n++; })); return n; }
        function chatMarkRead() { if (!CHAT.cur) { chatTopBadge(); return; } const a = chatAll(), c = a[CHAT.cur]; if (!c) return; let ch = false; (c.msgs || []).forEach(m => { if (!m.me && !m.read) { m.read = 1; ch = true; } }); if (ch) chatSave(a); chatTopBadge(); }
        function chatTopBadge() { const b = $id('chatTopCount'); if (!b) return; const n = currentUser && currentUser.tabel ? chatUnread() : 0; txtSet(b, n > 99 ? '99+' : n); b.classList.toggle('hidden', !n); const btn = $id('chatTopBtn'); if (btn) btn.classList.toggle('hidden', !(currentUser && currentUser.tabel)); }
        (function () {
            // Menyudagi "Yozishmalar" kartasi olinadi — tepada chapda tugma
            const card = document.querySelector('#main-card-list [data-chat]'); if (card) card.remove();
            const h = document.querySelector('#screen-main .header'); if (!h || $id('chatTopBtn')) return;
            const b = document.createElement('button'); b.id = 'chatTopBtn'; b.className = 'chat-top hidden'; b.title = 'Yozishmalar'; b.onclick = () => openChats();
            b.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4.6 3.6c-.5.4-1.4.1-1.4-.6V18a2 2 0 0 1-1-1.7V6a2 2 0 0 1 2-2zm3 5.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/></svg><span class="warn-count hidden" id="chatTopCount">0</span>';
            h.appendChild(b);
            setInterval(chatTopBadge, 3000);
        })();
        (function () { updateRnBadges = agmkExtend('updateRnBadges', 'updateRnBadges', updateRnBadges, o => function () { const r = o.apply(this, arguments); try { chatTopBadge(); } catch (e) {} return r; }); })();
        // Serverdan kelgan xabarlar: yangi xabar kelganda bildirishnoma
        (function () {
            chatAddMsg = agmkExtend('chatAddMsg', 'Serverdan kelgan xabarlar: yangi xabar kelganda bildirishnoma', chatAddMsg, o => async function (p, m) { const r = await o.apply(this, arguments); try { if (m && m.me === false) { chatTopBadge(); showToast('💬 ' + (p.name || '') + ': ' + String(m.t || '📎').slice(0, 60)); } } catch (e) {} return r; });
        })();

