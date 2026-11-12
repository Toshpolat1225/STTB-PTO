
        // =====================================================================
        // v3.0 — SERVER REJIMI (noutbuk / korxona serveri, agmk-server)
        // Server ulangan bo'lsa: kirish, ro'yxatdan o'tish va admin huquqi SERVERDA tekshiriladi.
        // Server ulanmagan bo'lsa ilova avvalgidek (oflayn) ishlayveradi.
        // =====================================================================
        (function () {
            const SRV_MIN_PW = 8; // server (routes_auth.py) bilan bir xil
            function srvOn() { const c = syncCfg(); return !!(c && c.url && c.key && c.on); }
            window.srvOn = srvOn;
            function srvSes() { return syncGet(SYNC_SES, null); }
            function srvHost() { try { return new URL(syncCfg().url).host; } catch (e) { return ''; } }
            async function srvDerive(tabel, pw) { return (await sha256hex('agmk:' + cleanTabel(tabel) + ':' + pw)).slice(0, 40); }
            async function srvReq(path, body) {
                const c = syncCfg(); let r;
                // v3.2.1: server topilmasa uzoq kutilmaydi (7 soniya) — oflayn kirishga o'tiladi
                const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) {} }, 7000);
                try { r = await fetch(c.url.replace(/\/+$/, '') + path, { method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined }); }
                catch (e) { const x = new Error("Serverga ulanib bo'lmadi. Telefon noutbuk bilan bir Wi-Fi tarmog'idami va server yoqilganmi?"); x.net = true; throw x; }
                finally { clearTimeout(tm); }
                let j = {}; try { j = await r.json(); } catch (e) {}
                if (!r.ok) { const x = new Error(j.message || j.msg || ('Server xatosi ' + r.status)); x.code = j.code || j.error; x.status = r.status; throw x; }
                return j;
            }
            function srvSaveSes(j, tabel) {
                const um = (j.user && j.user.user_metadata) || {}, am = (j.user && j.user.app_metadata) || {};
                const old = srvSes() || {};
                syncPut(SYNC_SES, { access: j.access_token, refresh: j.refresh_token, tabel: cleanTabel(tabel || old.tabel), role: am.role || old.role || 'editor', name: um.name || old.name || '', lavozim: um.lavozim || old.lavozim || '', demo: !!am.demo, must_change: !!am.must_change, sroles: Array.isArray(am.roles) ? am.roles.map(String) : (old.sroles || []), at: Date.now() });
            }

            // Kirish: endi avtomatik ro'yxatdan o'tkazmaydi — hisobni administrator tasdiqlaydi
            sbLogin = async function (tabel, pw) {
                const s = srvSes(); if (s && s.access && s.tabel === cleanTabel(tabel) && s.at && Date.now() - s.at < 15000) return true;
                const j = await srvReq('/auth/v1/token?grant_type=password', { email: 't' + cleanTabel(tabel) + '@agmk-sttb.app', password: await srvDerive(tabel, pw) });
                srvSaveSes(j, tabel); return true;
            };
            sbRefresh = async function () {
                const s = srvSes(); if (!s || !s.refresh) return false;
                try { const j = await srvReq('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh }); srvSaveSes(j, s.tabel); return true; } catch (e) { return false; }
            };

            // Administrator — faqat server bergan rol bo'yicha (koddagi tabel raqamiga bog'liq emas)
            isAdmin = agmkExtend('isAdmin', 'Administrator — faqat server bergan rol boʼyicha (koddagi tabel raqamiga bogʼliq', isAdmin, oIsAdmin => function () {
                if (srvOn()) { const s = srvSes(); return !!(s && s.access && currentUser && s.tabel === cleanTabel(currentUser.tabel) && s.role === 'admin'); }
                return oIsAdmin.apply(this, arguments);
            });
            window.srvRole = function () { const s = srvSes(); return srvOn() && s ? s.role : null; };

            // Server tasdiqlagan xodim telefonda ham bo'lishi kerak (ro'yxatda bo'lmasa qo'shiladi)
            function srvEnsureLocal(tabel, pw, info) {
                if (!findXodimsByTabel(tabel).length) {
                    sectionItemsDB.xodim = sectionItemsDB.xodim || {};
                    const su = 'Boshqarma';
                    const newId = Date.now();
                    (sectionItemsDB.xodim[su] = sectionItemsDB.xodim[su] || []).push({
                        id: newId, name: info.name || ('Tabel ' + tabel), inv: tabel, tabel: tabel, lavozim: info.lavozim || '—',
                        birthDate: '', seh: su, kirganSana: '', photo: null, status: 'Soz', workHistory: [], yutuqlar: [], hafsanalar: [], tatillar: [],
                        spravka: null, oilaviy: '', izoh: 'Serverdan qo\'shilgan', oilaAzolari: '', history: [], gallery: [], phone: '', phones2: []
                    });
                    saveDB(false);
                }
                // Oflayn kirish uchun parolning mahalliy nusxasi (xeshlangan)
                const accs = getAccounts(), rec = makePwRec(pw);
                accs[tabel] = Object.assign({}, accs[tabel] || {}, rec, { created: (accs[tabel] && accs[tabel].created) || new Date().toISOString(), server: true });
                saveAccounts(accs);
            }

            // ---------- Xabar fayllari (server orqali, faqat yuboruvchi va qabul qiluvchi) ----------
            async function srvRaw(path, opt, retry) {
                const c = syncCfg(), s = srvSes(); const h = Object.assign({ apikey: c.key }, s && s.access ? { Authorization: 'Bearer ' + s.access } : {}, opt.headers || {});
                const r = await fetch(c.url.replace(/\/+$/, '') + path, { method: opt.method || 'GET', headers: h, body: opt.body });
                if (r.status === 401 && !retry && await sbRefresh()) return srvRaw(path, opt, true);
                if (!r.ok) { let t = ''; try { t = (await r.json()).message || ''; } catch (e) {} throw new Error('Server ' + r.status + (t ? ': ' + t : '')); }
                return r;
            }
            window.srvRaw = srvRaw; // boshqa modullar (MTTB, zamechaniya rasmlari) uchun
            window.srvFileUp = async function (toTabel, f) { const r = await srvRaw('/api/files/v1?to=' + encodeURIComponent(cleanTabel(toTabel)) + '&name=' + encodeURIComponent(f.name || 'fayl') + '&mime=' + encodeURIComponent(f.mime || (f.blob && f.blob.type) || 'application/octet-stream'), { method: 'POST', body: f.blob }); return r.json(); };
            window.srvFileGet = async function (id, mime) { const r = await srvRaw('/api/files/v1/' + encodeURIComponent(id), {}); const b = await r.blob(); return mime && b.type !== mime ? new Blob([b], { type: mime }) : b; };

            // ---------- Kompyuter (brauzer) versiyasi: ilova korxona serveridan ochilgan bo'lsa — QR siz o'zi ulanadi ----------
            (async function () {
                try {
                    if (window.AgmkNative || location.protocol !== 'https:') return;
                    const c = syncCfg(); if (c && c.url === location.origin && c.on) return;
                    const r = await fetch('/app/config', { cache: 'no-store' }); if (!r.ok) return; const j = await r.json(); if (!j || !j.k) return;
                    syncPut(SYNC_CFG, { url: location.origin, key: j.k, on: true, lan: true, fp: j.f, name: j.n || 'AGMK-STTB', web: true });
                    try { localStorage.removeItem(SYNC_SES); } catch (e) {}
                    srvLockUi();
                } catch (e) {}
            })();

            // ---------- Kirish ----------
            const oLogin = lockLogin; let busy = false;
            lockLogin = async function () {
                if (!srvOn()) return oLogin.apply(this, arguments);
                if (busy) return;
                const err = $id('lkErr'), tabel = cleanTabel($id('lkTabel').value), pw = $id('lkPw').value;
                if (!tabel || !pw) { err.innerText = "Tabel raqami va parolni kiriting."; return; }
                busy = true; err.classList.remove('lock-ok'); err.innerText = '⏳ Server tekshirmoqda...';
                try {
                    await sbLogin(tabel, pw);
                    srvEnsureLocal(tabel, pw, srvSes() || {});
                    err.innerText = '';
                    clearFails(tabel);
                    oLogin.apply(this, arguments); // mahalliy sessiya, shifrlangan yozishmalar va h.k.
                    if (!document.body.classList.contains('locked')) {
                        syncLoop(); setTimeout(() => syncNow(), 300);
                        window.dispatchEvent(new CustomEvent('agmk:login', { detail: { server: true } })); // imzo, polojeniya va b. modullar shu hodisani tinglaydi
                        const ss = srvSes(); if (ss && ss.must_change) setTimeout(() => openAccPw(true), 600);
                    }
                } catch (e) {
                    const a = getAccounts()[tabel];
                    // v3.2.1: server topilmasa — shu telefondagi hisob bilan oflayn kirish (server orqali ochilgan yoki mahalliy hisob)
                    if (e.net && a && checkAccPw(tabel, pw)) {
                        err.innerText = ''; oLogin.apply(this, arguments);
                        if (!document.body.classList.contains('locked')) { showToast("📴 Server topilmadi — oflayn kirdingiz. Kiritgan hamma narsangiz saqlanadi va server topilishi bilan o'zi yuboriladi."); try { if (typeof offStart === 'function') offStart(tabel, pw); } catch (x) {} }
                    } else if (e.net && !a) err.innerText = e.message + "\n\nBu telefonda hali hisobingiz yoʻq — birinchi marta server orqali kiring (keyin serversiz ham kira olasiz).";
                    else err.innerText = agmkErrUz(e);
                } finally { busy = false; }
            };

            // ---------- Ro'yxatdan o'tish (so'rov administratorga boradi) ----------
            registerAccount = agmkExtend('registerAccount', '---------- Roʼyxatdan oʼtish (soʼrov administratorga boradi) ----------', registerAccount, oReg => async function () {
                if (!srvOn()) return oReg.apply(this, arguments);
                const err = $id('rgErr'); err.classList.remove('lock-ok');
                const t = cleanTabel($id('rgTabel').value), name = ($id('rgName').value || '').trim(), lav = ($id('rgLav').value || '').trim();
                const p1 = $id('rgPw').value, p2 = $id('rgPw2').value;
                if (!/^\d{1,12}$/.test(t)) { err.innerText = "Tabel raqamini to'g'ri kiriting (faqat raqamlar)."; return; }
                if (name.length < 3) { err.innerText = "Familiya va ismingizni kiriting."; return; }
                if (p1.length < SRV_MIN_PW) { err.innerText = 'Parol kamida ' + SRV_MIN_PW + ' belgidan iborat bo\'lsin.'; return; }
                if (p1 !== p2) { err.innerText = "Parollar bir xil emas."; return; }
                err.innerText = '⏳ Yuborilmoqda...';
                try {
                    await srvReq('/auth/v1/signup', { email: 't' + t + '@agmk-sttb.app', password: await srvDerive(t, p1), data: { name: name, lavozim: lav } });
                    err.classList.add('lock-ok');
                    err.innerText = "✅ So'rov yuborildi! Administrator tasdiqlagach, shu tabel raqami va parol bilan kirasiz.";
                    $id('rgPw').value = ''; $id('rgPw2').value = ''; $id('lkTabel').value = t;
                } catch (e) {
                    // v3.2.1: server topilmasa — shtat roʻyxatidagi xodim oflayn roʻyxatdan oʻtadi; soʻrov server topilganda oʻzi yuboriladi
                    if (e.net && typeof offRegister === 'function') { const lk = lookupXodim(t); if (!lk.err && !getAccounts()[t]) { await offRegister(t, p1, name, lav, lk.rec.item); return; } }
                    err.innerText = e.code === 'user_exists' ? "Bu tabel raqami bilan hisob allaqachon bor. Parolni unutgan bo'lsangiz — administratorga murojaat qiling." : e.message;
                }
            });
            previewRegister = agmkExtend('previewRegister', 'previewRegister', previewRegister, oPrev => function () {
                if (!srvOn()) return oPrev.apply(this, arguments);
                const box = $id('rgPreview'), t = cleanTabel($id('rgTabel').value);
                const f = t ? findXodimsByTabel(t) : [];
                const nm = $id('rgName'), lv = $id('rgLav');
                if (f.length === 1) {
                    const it = f[0].item;
                    if (!nm.value || nm.dataset.auto === '1') { nm.value = it.name || ''; nm.dataset.auto = '1'; }
                    if (!lv.value || lv.dataset.auto === '1') { lv.value = it.lavozim && it.lavozim !== '—' ? it.lavozim : ''; lv.dataset.auto = '1'; }
                    // v3.2: shtat roʻyxatidan — kimligi darhol koʻrinadi, faqat parol qoʻyiladi
                    box.classList.remove('hidden', 'bad'); box.innerHTML = '✅ <b>' + escapeHtml(it.name || '') + '</b><br>' + escapeHtml(it.lavozim || '') + (it.bolim ? '<br><small>📍 ' + escapeHtml(it.bolim) + '</small>' : '') + '<br><small>Endi faqat oʻzingiz biladigan parol qoʻying.</small>';
                    return;
                }
                if (nm.dataset.auto === '1') { nm.value = ''; nm.dataset.auto = ''; } if (lv.dataset.auto === '1') { lv.value = ''; lv.dataset.auto = ''; }
                box.classList.add('hidden');
            });

            // ---------- Parolni almashtirish (server rejimida — serverda; tug'ilgan sana so'ralmaydi) ----------
            openAccPw = agmkExtend('openAccPw', '---------- Parolni almashtirish (server rejimida — serverda; tugʼilgan sana soʼr', openAccPw, oAccPw => function (force) {
                if (!srvOn() || !srvSes() || !srvSes().access) return oAccPw.apply(this, arguments);
                const f = force === true;
                if (!$id('srvPw')) { const d = document.createElement('div'); d.id = 'srvPw'; d.className = 'modal-overlay hidden'; d.style.zIndex = 20001; d.innerHTML = '<div class="modal-content sec-mdl"></div>'; document.body.appendChild(d); }
                mdl('srvPw', `<div class="px-h"><b>🔐 ${f ? 'Parolingizni almashtiring' : 'Parolni almashtirish'}</b>${f ? '' : `<button class="mini-btn" onclick="mdlClose('srvPw')">✕</button>`}</div>
                    ${f ? `<div class="srv-note">Administrator bergan <b>vaqtinchalik</b> parol bilan kirdingiz. Xavfsizlik uchun uni hozir oʻzingiz biladigan parolga almashtiring.</div>` : ''}
                    <div class="form-group"><label>${f ? 'Vaqtinchalik (hozirgi) parol:' : 'Hozirgi parol:'}</label><input type="password" id="spOld" autocomplete="current-password"></div>
                    <div class="form-group"><label>Yangi parol (kamida ${SRV_MIN_PW} belgi):</label><input type="password" id="spNew" autocomplete="new-password"></div>
                    <div class="form-group"><label>Yangi parolni takrorlang:</label><input type="password" id="spNew2" autocomplete="new-password"></div>
                    <div id="spErr" class="pw-error"></div>
                    <div class="pk-btns">${f ? `<button onclick="logout()">🚪 Chiqish</button>` : `<button onclick="mdlClose('srvPw')">Bekor</button>`}<button class="pr" onclick="srvPwSave()">💾 Saqlash</button></div>`);
                const m = $id('srvPw'); if (f) m.onclick = null; else m.onclick = e => { if (e.target === m) m.classList.add('hidden'); };
                setTimeout(() => { const i = $id('spOld'); if (i) i.focus(); }, 100);
            });
            window.srvPwSave = async function () {
                const err = $id('spErr'), s = srvSes(), o = $id('spOld').value, p1 = $id('spNew').value, p2 = $id('spNew2').value;
                if (!o || !p1) { err.innerText = "Barcha maydonlarni to'ldiring."; return; }
                if (p1.length < SRV_MIN_PW) { err.innerText = 'Yangi parol kamida ' + SRV_MIN_PW + ' belgidan iborat boʻlsin.'; return; }
                if (p1 !== p2) { err.innerText = 'Yangi parollar bir xil emas.'; return; }
                if (p1 === o) { err.innerText = 'Yangi parol eskisidan farq qilsin.'; return; }
                err.innerText = '⏳ Serverga yuborilmoqda...';
                try {
                    await sbFetch('/auth/v1/user', { method: 'PUT', body: { old: await srvDerive(s.tabel, o), password: await srvDerive(s.tabel, p1) } });
                    const accs = getAccounts(); accs[s.tabel] = Object.assign({}, accs[s.tabel] || {}, makePwRec(p1), { server: true }); saveAccounts(accs); // oflayn kirish nusxasi
                    syncPut(SYNC_SES, Object.assign({}, s, { must_change: false }));
                    mdlClose('srvPw'); alert('✅ Parol almashtirildi. Keyingi safar yangi parol bilan kirasiz.');
                } catch (e) { err.innerText = /Eski parol/.test(e.message) ? "Hozirgi parol notoʻgʻri." : e.message.replace(/^Server \d+: /, ''); }
            };

            // ---------- Kirish oynasidagi server qatori va qo'shimcha maydonlar ----------
            function srvLockUi() {
                const on = srvOn();
                const st = $id('srvLockSt'); if (st) st.innerHTML = on ? '🟢 Server: <b>' + escapeHtml(srvHost()) + '</b>' : '⚪ Server ulanmagan (oflayn rejim)';
                const b = $id('srvLockBtn'); if (b) b.innerText = on ? '⚙️ Server' : '📡 Serverga ulanish';
                const ex = $id('rgSrvBox'); if (ex) ex.classList.toggle('hidden', !on);
                const pl = $id('rgPwLbl'); if (pl) pl.innerText = on ? 'Yangi parol (kamida ' + SRV_MIN_PW + ' belgi):' : 'Yangi parol (kamida 4 belgi):';
                const rsF = $id('lockViewReset');
                if (rsF) {
                    rsF.querySelectorAll('.form-group, #rsNewBox, #rsBtn, #rsErr').forEach(el => el.classList.toggle('srv-hide', on));
                    let m = $id('rsSrvMsg');
                    if (!m) { m = document.createElement('div'); m.id = 'rsSrvMsg'; m.className = 'srv-note'; m.innerHTML = "🔐 Server rejimida parol <b>administrator</b> orqali tiklanadi.<br>Administratorga tabel raqamingizni ayting — u hisobingizni tiklaydi, so'ng qaytadan ro'yxatdan o'tasiz."; rsF.prepend(m); }
                    m.classList.toggle('hidden', !on);
                }
            }
            window.srvLockUi = srvLockUi;
            (function injectLockUi() {
                const css = document.createElement('style');
                css.textContent = `.srv-lockbar{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:#cbd5e1}
                    .srv-lockbar button{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.45);color:#7dd3fc;border-radius:8px;padding:7px 10px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
                    .srv-note{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.35);border-radius:10px;padding:12px;font-size:13px;line-height:1.55;color:#e2e8f0;margin-bottom:10px}
                    .srv-hide{display:none!important}
                    #srvModal .pk-box{max-width:380px}
                    #srvModal .srv-opt{display:block;width:100%;text-align:left;margin:8px 0;padding:12px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#f8fafc;font-size:14px;cursor:pointer}
                    #srvModal .srv-opt input{display:none}`;
                document.head.appendChild(css);
                const lv = $id('lockViewLogin');
                if (lv && !$id('srvLockBar')) lv.insertAdjacentHTML('beforeend', `<div id="srvLockBar" class="srv-lockbar"><span id="srvLockSt"></span><button id="srvLockBtn" type="button" onclick="srvLockOpen()">📡 Serverga ulanish</button></div>`);
                const pv = $id('rgPreview');
                if (pv && !$id('rgSrvBox')) pv.insertAdjacentHTML('afterend', `<div id="rgSrvBox" class="hidden">
                    <div class="form-group"><label>Familiya, ism, otasining ismi:</label><input type="text" id="rgName" autocomplete="off" placeholder="Masalan: @@N:255@@"></div>
                    <div class="form-group"><label>Lavozimingiz:</label><input type="text" id="rgLav" autocomplete="off" placeholder="Masalan: Stansiya navbatchisi"></div></div>`);
                const pwIn = $id('rgPw'); const lbl = pwIn && pwIn.parentElement.querySelector('label'); if (lbl) lbl.id = 'rgPwLbl';
                srvLockUi();
            })();
            showLockView = agmkExtend('showLockView', 'showLockView', showLockView, oView => function () { const r = oView.apply(this, arguments); try { srvLockUi(); } catch (e) {} return r; });

            // Server oynasi (kirish oynasidan ochiladi)
            window.srvLockOpen = function () {
                let m = $id('srvModal');
                if (!m) { m = document.createElement('div'); m.id = 'srvModal'; m.className = 'modal-overlay hidden pk-ov'; m.style.zIndex = 20000; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="srvBox"></div>'; document.body.appendChild(m); }
                const on = srvOn();
                $id('srvBox').innerHTML = `<div class="pk-h"><b>📡 Korxona serveri</b><span onclick="$id('srvModal').classList.add('hidden')">✕</span></div>
                    ${on ? `<div class="srv-note">🟢 Ulangan: <b>${escapeHtml(srvHost())}</b></div>` : `<div class="srv-note">Server kompyuterida <b>boshqaruv paneli</b>ni oching va undagi QR kodni rasmga oling. Telefon server bilan <b>bir Wi-Fi</b> tarmog'ida bo'lishi kerak.</div>`}
                    <label class="srv-opt">📷 ${on ? 'Boshqa serverga ulash (QR)' : 'QR kodni skanerlash'}<input type="file" accept="image/*" capture="environment" onchange="$id('srvModal').classList.add('hidden'); srvScan(this)"></label>
                    <button class="srv-opt" onclick="$id('srvModal').classList.add('hidden'); srvText()">⌨️ Matn bilan ulash</button>
                    ${on ? `<button class="srv-opt" onclick="srvCheck()">🔎 Aloqani tekshirish</button><button class="srv-opt" style="color:#fca5a5" onclick="srvForget()">⏏ Serverdan uzish (oflayn rejim)</button>` : ''}`;
                m.classList.remove('hidden');
            };
            window.srvCheck = async function () {
                try { const r = await fetch(syncCfg().url + '/health', { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); alert('🟢 Server javob berdi — aloqa bor.'); }
                catch (e) { alert("🔴 Serverga yetib bo'lmadi.\n\nTekshiring:\n• telefon va noutbuk bir Wi-Fi tarmog'idami\n• noutbukdagi qora oyna (server) ochiqmi\n• noutbuk uyqu rejimiga o'tmaganmi"); }
            };
            window.srvForget = async function () {
                if (!await uiConfirm("Serverdan uzilsinmi? Ilova oflayn rejimga o'tadi. Telefondagi ma'lumotlar o'chmaydi.")) return;
                syncOff(); try { localStorage.removeItem(SYNC_SES); } catch (e) {}
                $id('srvModal').classList.add('hidden'); srvLockUi(); showToast('⏏ Serverdan uzildi');
            };

            // QR orqali ulanish: kirish oynasida parol so'ramaydi — keyin oddiy kirish/ro'yxatdan o'tish ishlatiladi
            srvConnect = agmkExtend('srvConnect', 'QR orqali ulanish: kirish oynasida parol soʼramaydi — keyin oddiy kirish/roʼyxat', srvConnect, oConn => async function (q) {
                if (!document.body.classList.contains('locked') && currentUser && currentUser.tabel) {
                    const r = await oConn.apply(this, arguments);
                    srvLockUi(); return r;
                }
                if (!q) { alert("⚠️ QR ma'lumoti noto'g'ri yoki bu korxona serverining QR kodi emas."); return; }
                if (!(await uiConfirm('📡 Serverga ulanish:\n' + q.u + '\nSertifikat: ' + q.f.slice(0, 16) + '…\n\nDavom etilsinmi?'))) return;
                try { if (window.AgmkNative && AgmkNative.setPin) AgmkNative.setPin(q.f); } catch (e) {}
                syncPut(SYNC_CFG, { url: q.u, key: q.k, on: true, lan: true, fp: q.f, name: q.n }); SYNC.err = '';
                try { localStorage.removeItem(SYNC_SES); localStorage.removeItem(SYNC_ST); } catch (e) {}
                srvLockUi();
                try { const r = await fetch(q.u + '/health', { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); }
                catch (e) { alert("⚠️ Sozlama saqlandi, lekin serverga hozir yetib bo'lmadi.\n\nTekshiring: telefon noutbuk bilan bir Wi-Fi tarmog'idami va server oynasi ochiqmi." + (window.AgmkNative ? '' : "\n(Brauzerda: avval " + q.u + "/health manzilini ochib, xavfsizlik ogohlantirishini qabul qiling)")); return; }
                showToast('🟢 Serverga ulandi');
                alert("🟢 Serverga ulandi!\n\nBirinchi marta bo'lsa — «Ro'yxatdan o'tish»ni bosing, administrator tasdiqlagach kiring.\nHisobingiz bo'lsa — tabel va parol bilan kiring.");
            });

            // ---------- Sinxronlash: o'chirishlar ham yuboriladi, "faqat ko'rish" roli yozmaydi ----------
            syncNow = async function (silent) {
                if (!syncReady()) return; if (SYNC.busy) { const t0 = Date.now(); while (SYNC.busy && Date.now() - t0 < 90000) await new Promise(r => setTimeout(r, 200)); if (SYNC.busy) return; } // 3.16.2: band boʻlsa — tugashini kutadi (bosilgan «Sinxronlash» yoʻqolmasin)
                const ses = srvSes(); if (!ses || !ses.access) { SYNC.err = "Serverga kirish kerak — ilovadan chiqib, tabel va parol bilan qayta kiring"; syncUi(); return; }
                if (navigator.onLine === false && !syncCfg().lan) { SYNC.err = 'Internet yo\'q'; syncUi(); return; }
                SYNC.busy = true; syncUi();
                const st = syncGet(SYNC_ST, { hash: {}, last: '1970-01-01T00:00:00Z', msg: 0 });
                let pulled = 0, pushed = 0;
                try {
                    let more = true, changedUnits = false;
                    while (more) {
                        const rows = await sbFetch('/rest/v1/agmk_records?select=id,kind,data,deleted,updated_at,updated_by&updated_at=gt.' + encodeURIComponent(st.last) + '&order=updated_at.asc&limit=500');
                        const LM = new Map(); if (rows && rows.length) syncLocal().forEach(x => LM.set(x.id, x));
                        (rows || []).forEach(r => {
                            const loc = LM.get(r.id), lh = loc ? syncHash(JSON.stringify(loc.data)) : null;
                            const localDirty = loc && st.hash[r.id] && st.hash[r.id] !== 'del' && lh !== st.hash[r.id];
                            if (r.deleted) {
                                if (r.kind === 'unit' && !localDirty) {
                                    const n = vagonlarData.length; vagonlarData = vagonlarData.filter(v => 'u:' + v.id !== r.id);
                                    if (vagonlarData.length !== n) { changedUnits = true; pulled++; }
                                    st.hash[r.id] = 'del';
                                }
                            } else if (!localDirty) {
                                const k = syncApply(r); if (k === 'u') changedUnits = true; pulled++;
                                if (k === 'u') { const v = vagonlarData.find(x => 'u:' + x.id === r.id); if (v) st.hash[r.id] = syncHash(JSON.stringify(syncStripUnit(v))); } else st.hash[r.id] = syncHash(JSON.stringify(r.data));
                            }
                            st.last = r.updated_at;
                        });
                        more = rows && rows.length === 500;
                    }
                    if (changedUnits) { try { saveDB(false); } catch (e) {} try { refreshCurrentScreen(); } catch (e) {} }
                    if (ses.role !== 'viewer') {
                        const loc = syncLocal(), up = [], have = new Set(loc.map(x => x.id));
                        loc.forEach(x => { const h = syncHash(JSON.stringify(x.data)); if (st.hash[x.id] !== h) up.push(Object.assign({}, x, { _h: h, _del: false })); });
                        // Telefonda o'chirilgan texnikalar serverda ham o'chiriladi
                        Object.keys(st.hash).forEach(id => { if (/^u:/.test(id) && st.hash[id] !== 'del' && !have.has(id)) up.push({ id: id, kind: 'unit', data: {}, _h: 'del', _del: true }); });
                        for (let i = 0; i < up.length; i += 200) {
                            const part = up.slice(i, i + 200);
                            await sbFetch('/rest/v1/agmk_records', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: part.map(x => ({ id: x.id, kind: x.kind, data: x.data, deleted: x._del, updated_by: ses.tabel })) });
                            part.forEach(x => { st.hash[x.id] = x._h; }); pushed += part.length;
                        }
                    }
                    syncLocal().forEach(x => { if (!st.hash[x.id]) st.hash[x.id] = syncHash(JSON.stringify(x.data)); });
                    try {
                        const ms = await sbFetch('/rest/v1/agmk_messages?select=*&to_tabel=eq.' + encodeURIComponent(ses.tabel) + '&id=gt.' + (st.msg || 0) + '&order=id.asc&limit=200');
                        for (const m of (ms || [])) {
                            const p = (pplList().find(x => cleanTabel(x.tabel) === cleanTabel(m.from_tabel))) || { name: m.from_name || ('Tabel ' + m.from_tabel), role: '', tabel: m.from_tabel };
                            const files = []; let okF = true;
                            for (const f of (m.files || [])) { try { files.push({ name: f.name, mime: f.mime, blob: await srvFileGet(f.id, f.mime) }); } catch (e) { okF = false; break; } }
                            if (!okF) break; // fayl yuklanmadi — xabar keyingi sinxronda qayta olinadi (yo'qolmaydi)
                            st.msg = Math.max(st.msg || 0, m.id);
                            await chatAddMsg(p, { me: false, t: m.text, via: 'app', files: files });
                            const rep = files.filter(f => /\.(xlsx?|xlsm|ods|pdf|docx?)$/i.test(f.name)).length;
                            try { notify({ icon: files.length ? (rep ? '📊' : '📎') : '💬', text: (p.role ? p.role + ' ' : '') + p.name + (files.length ? (rep ? 'dan hisobot (achot) keldi: ' : 'dan fayl keldi: ') + files.map(f => f.name).join(', ') : ': ' + String(m.text).slice(0, 120)) + (files.length && m.text ? ' — «' + String(m.text).slice(0, 80) + '»' : ''), toTabel: cleanTabel(ses.tabel), byTabel: cleanTabel(m.from_tabel), chatTabel: cleanTabel(m.from_tabel), chatName: p.name, files: files.map(f => f.name) }); } catch (e) {}
                            try { showToast((files.length ? '📎 ' : '💬 ') + p.name + ': ' + (files.length ? files.length + ' ta fayl' : String(m.text).slice(0, 60))); } catch (e) {}
                        }
                    } catch (e) {}
                    syncPut(SYNC_ST, st); SYNC.err = ''; SYNC.lastOk = Date.now(); SYNC.lastStat = { pulled: pulled, pushed: pushed };
                    if (!silent && (pulled || pushed)) showToast('🔄 Sinxronlandi: ↓' + pulled + ' ↑' + pushed);
                } catch (e) {
                    SYNC.err = agmkErrUz(e);
                    if (/Avtorizatsiya|401/.test(SYNC.err)) SYNC.err = "Server sessiyasi tugadi — chiqib, qayta kiring";
                }
                SYNC.busy = false; syncUi();
            };
        })();

