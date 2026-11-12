        // =========================================================
        // 13) ROLLAR VA HUQUQLAR
        // =========================================================
        var ROLE_KEY = 'agmk_roles';
        var ROLE_DEF = [
            ['rahbar', '👑', 'Rahbariyat', "Xodimlarning yopiq maʼlumotlarini koʻradi, MM va MTTB hisobotlarini koʻradi"],
            ['kadr', '🗂', 'Kadrlar boʻlimi', "Xodimlarning yopiq maʼlumotlarini koʻradi (tahrirlash — faqat admin)"],
            ['mm', '🦺', 'Mehnat muhofazasi masʼuli', "Instruktaj, bilim sinovi, tibbiy koʻrik yozuvlarini kiritadi"],
            ['mttb', '📦', 'MTTB / omborchi', "Kelgan zapchastni qayd qiladi, omborda beradi"],
            ['bux', '💰', 'Buxgalteriya va iqtisod', "Xarajatlar va reja-fakt maʼlumotlarini kiritadi va koʻradi"]
        ];
        function rolesAll() { const r = kvGet(ROLE_KEY, {}); return r && typeof r === 'object' ? r : {}; }
        function rolesOf(t) { return rolesAll()[cleanTabel(t)] || []; }
        function hasRole(r) { if (isAdmin()) return true; if (r === 'rahbar' && typeof isRahbar === 'function' && isRahbar()) return true; return rolesOf(meTabel()).includes(r); }
        function isPriv() { return isAdmin() || hasRole('rahbar') || hasRole('kadr'); }
        function isOwnItem(item) { return !!(item && meTabel() && cleanTabel(item.tabel) === meTabel()); }
        function canEditXodim(item) { return isAdmin() || isOwnItem(item); }
        function canSeePrivate(item) { return isPriv() || isOwnItem(item); }
        function roleSet(t, r, on) {
            if (!isAdminReal()) { alert('Rollarni faqat admin belgilaydi.'); return; }
            const a = rolesAll(), k = cleanTabel(t); let l = a[k] || [];
            l = on ? Array.from(new Set(l.concat(r))) : l.filter(x => x !== r);
            if (l.length) a[k] = l; else delete a[k];
            a._by = ADMIN_TABEL; a._at = new Date().toISOString();
            kvSet(ROLE_KEY, a); rolesRender();
        }
        function rolesOpen() {
            if (!isAdminReal()) { alert('👥 Rollar boʻlimi faqat admin uchun.'); return; }
            let m = $id('rolesModal');
            if (!m) { m = document.createElement('div'); m.id = 'rolesModal'; m.className = 'modal-overlay hidden'; m.innerHTML = '<div class="modal-content rl-box"><div class="px-h"><b>👥 Rollar va huquqlar</b><button class="mini-btn" onclick="$id(\'rolesModal\').classList.add(\'hidden\')">✕</button></div><div id="rolesBody"></div></div>'; document.body.appendChild(m); }
            m.classList.remove('hidden'); rolesRender();
        }
        function rolesRender() {
            const b = $id('rolesBody'); if (!b) return;
            const a = rolesAll();
            b.innerHTML = `<div class="nd-tip">👑 Admin (tabel ${ADMIN_TABEL}) — barcha huquqlar, istalgan xodim maʼlumotini tahrirlaydi. Bu huquq boshqa hech kimga berilmaydi.<br>👤 Har bir xodim faqat oʻz maʼlumotini tahrirlaydi. Pasport qismi (surat, F.I.Sh., lavozim, tabel, razryad, seh, yosh, telefon) hammaga ochiq, qolgani — faqat quyidagi rollarga.</div>` +
                ROLE_DEF.map(([id, ic, t, d]) => {
                    const list = Object.keys(a).filter(k => k[0] !== '_' && (a[k] || []).includes(id));
                    return `<div class="rl-sec"><div class="rl-t">${ic} ${escapeHtml(t)} <button class="mini-btn" onclick="pickXodim('${ic} ${escapeHtml(t)} — xodim qoʻshish', it => roleSet(it.tabel, '${id}', true))">➕ Qoʻshish</button></div><small>${escapeHtml(d)}${id === 'rahbar' ? '. Shtatlar roʻyxatida 👑 belgilangan lavozimlar ham avtomatik rahbariyat hisoblanadi.' : ''}</small>` +
                        (list.map(k => { const it = xodimByTabel(k); return `<div class="rl-row"><span>${escapeHtml(it ? it.name : 'tabel ' + k)}<small>${escapeHtml(it ? (it.lavozim || '') : '')} · ${escapeHtml(k)}</small></span><button class="mini-btn" onclick="roleSet('${k}','${id}',false)">✕</button></div>`; }).join('') || '<div class="rl-empty">Hali hech kim yoʻq</div>') + `</div>`;
                }).join('');
        }
        // Parametrlarga "Rollar" kartasi (faqat admin)
        (function () {
            const o = typeof renderSettings === 'function' ? renderSettings : null;
            function addCard() {
                const wk = $id('set-wake-sub') && $id('set-wake-sub').closest('.btn-card'); if (!wk) return;
                let c = $id('set-roles-card');
                if (!c) { c = document.createElement('div'); c.className = 'btn-card'; c.id = 'set-roles-card'; c.onclick = rolesOpen; c.innerHTML = '<div class="btn-card-content"><span class="btn-icon">👥</span><span class="btn-text">Rollar va huquqlar<span class="set-sub">Rahbariyat, kadrlar, MM, MTTB, buxgalteriya</span></span></div><span class="btn-arrow">›</span>'; wk.parentNode.insertBefore(c, wk); }
                c.style.display = isAdmin() ? '' : 'none';
            }
            if (o) renderSettings = function () { const r = o.apply(this, arguments); try { addCard(); } catch (e) {} return r; };
            try { addCard(); } catch (e) {}
        })();

        // ---------- Xodim sahifasi: pasport hammaga, qolgani — huquqi borlarga ----------
        (function () {
            openItemPasport = agmkExtend('openItemPasport', '---------- Xodim sahifasi: pasport hammaga, qolgani — huquqi borlarga ----------', openItemPasport, o => function (itemId) {
                const r = o.apply(this, arguments);
                try { xodimAccessApply(); } catch (e) { console.error(e); }
                return r;
            });
        })();
        function xodimAccessApply() {
            const item = getActiveItem(); if (!item) return;
            const isX = currentSectionType === 'xodim';
            const eb = $id('xodim-edit-btn'); if (eb) eb.classList.toggle('hidden', !(isX && canEditXodim(item)));
            const up = document.querySelector('#xodim-photo-box .file-upload-box'); if (up) up.style.display = isX && !canEditXodim(item) ? 'none' : '';
            const ex = $id('xodim-extra-container');
            let lock = $id('xodim-lock-note');
            if (isX && !canSeePrivate(item)) {
                if (ex) ex.style.display = 'none';
                if (!lock) { lock = document.createElement('div'); lock.id = 'xodim-lock-note'; lock.className = 'passport-container xl-lock'; if (ex) ex.parentNode.insertBefore(lock, ex); }
                lock.style.display = ''; lock.innerHTML = '🔒 <b>Maʼlumot yopiq</b><br><small>Ish faoliyati tarixi va boshqa shaxsiy maʼlumotlarni faqat rahbariyat, kadrlar boʻlimi va admin koʻradi.</small>';
            } else { if (lock) lock.style.display = 'none'; if (ex && isX) ex.style.display = 'block'; }
            // Tugʻilgan sana: toʻliq sana — huquqi borlarga, qolganlarga faqat yosh
            if (isX && !canSeePrivate(item)) {
                document.querySelectorAll('#item-passport-grid > div').forEach(d => { if (/TUG.?ILGAN/i.test(d.textContent)) { const age = computeAgeFromDate(item.birthDate); d.innerHTML = 'YOSHI: <span>' + (age === null ? '—' : age + ' yosh') + '</span>'; } if (/ISHGA KIRGAN/i.test(d.textContent)) d.style.display = 'none'; });
            }
            // Aloqa tugmalari (xabar yozish, qo'ng'iroq, Telegram)
            let bar = $id('xodim-contact-bar');
            if (isX && !isOwnItem(item)) {
                const grid = $id('item-passport-grid');
                if (!bar) { bar = document.createElement('div'); bar.id = 'xodim-contact-bar'; bar.className = 'xc-bar'; grid.after(bar); }
                const ph = xodimPhone(item);
                bar.style.display = '';
                bar.innerHTML = `<button onclick="xodimMsg()">✉️ Xabar yozish</button>${ph ? `<button onclick="chatOpenLink('tel:${escapeHtml(ph)}')">📞 Qoʻngʻiroq</button>` : ''}<button onclick="xodimTg()">✈️ Telegram</button>`;
            } else if (bar) bar.style.display = 'none';
        }
        function xodimPhone(item) { const s = [item.phone, item.tel, item.telefon].concat(item.phones || []).map(x => typeof x === 'object' && x ? (x.num || x.n || x.phone || '') : x).find(x => x && /\d{5,}/.test(String(x))); return s ? String(s).replace(/[^\d+]/g, '') : ''; }
        function xodimPerson(item) { return { name: item.name, role: item.lavozim || '', tabel: cleanTabel(item.tabel), phone: xodimPhone(item) }; }
        function xodimMsg() { const it = getActiveItem(); if (!it) return; openChats(xodimPerson(it)); }
        function xodimTg() { const it = getActiveItem(); if (!it) return; const ct = ctGet(xodimPerson(it)); if (ct.tg) chatOpenLink(tgLink(ct.tg, '')); else { openChats(xodimPerson(it)); setTimeout(() => { try { chatContact(); } catch (e) {} }, 300); showToast("✈️ Telegram username kiritilmagan — ✏️ orqali qoʻshing"); } }
        // Tahrirlash funksiyalarini himoyalash
        ['openXodimEdit', 'saveXodimEdit', 'xodimPhotoSelected', 'addWorkHistory', 'editWorkHistory', 'deleteWorkHistory', 'addYutuq', 'deleteYutuq', 'addHafsana', 'deleteHafsana'].forEach(fn => {
            try {
                const o = window[fn]; if (typeof o !== 'function') return;
                window[fn] = function () { const it = getActiveItem(); if (currentSectionType === 'xodim' && it && !canEditXodim(it)) { alert("🔒 Bu xodimning maʼlumotini faqat admin yoki xodimning oʻzi oʻzgartira oladi."); const inp = arguments[0]; if (inp && inp.value !== undefined && inp.type === 'file') inp.value = ''; return; } return o.apply(this, arguments); };
            } catch (e) {}
        });
        // AI xodimlar haqidagi javobi: yopiq maʼlumotlar faqat huquqi borlarga
        (function () {
            if (typeof dbPeopleReply !== 'function') return;
            dbPeopleReply = agmkExtend('dbPeopleReply', 'dbPeopleReply', dbPeopleReply, o => function () {
                const r = o.apply(this, arguments);
                try {
                    if (r && !isPriv()) {
                        const fix = s => String(s).replace(/(tug.?ilgan[^:\n]*:\s*)(\d{4})-(\d{2})-(\d{2})/gi, '$1(yopiq)').replace(/\b(\d{2})\.(\d{2})\.(19|20)\d{2}\s*\(tug/gi, '(yopiq) (tug').replace(/ish faoliyati[^\n]*\n?/gi, '').replace(/(ishga kirgan[^:\n]*:\s*)[^\n·|]+/gi, '$1(yopiq)');
                        if (typeof r === 'string') return fix(r); if (r.t) r.t = fix(r.t);
                    }
                } catch (e) {}
                return r;
            });
        })();

