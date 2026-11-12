        // =====================================================================
        // YANGI (4-bosqich): HEIC, PIN-kod bilan kirish, yutuq/hayfsan fayllari
        // =====================================================================

        // ============ HEIC -> JPG ============
        // Xavfsizlik: HEIC oʻgiruvchi kutubxona internetdan (tekshirilmagan begona kod) yuklanmaydi — telefon oʻzi ocha olmasa, JPG soʻraladi
        function loadHeicLib() { if (window.heic2any) return Promise.resolve(); const e = new Error('heic-offline'); e.code = 'heic-offline'; return Promise.reject(e); }
        async function looksHeic(blob) {
            const n = (blob.name || '').toLowerCase();
            if (/image\/hei[cf]/.test(blob.type || '') || /\.(heic|heif)$/.test(n)) return true;
            try {
                const b = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
                const s = String.fromCharCode.apply(null, Array.from(b.slice(4, 12)));
                return s.indexOf('ftyp') === 0 && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(s.slice(4));
            } catch (e) { return false; }
        }
        async function convertHeic(blob) {
            showToast("⏳ HEIC rasm JPG ga o'girilmoqda...");
            await loadHeicLib();
            const out = await window.heic2any({ blob: blob, toType: 'image/jpeg', quality: 0.92 });
            return Array.isArray(out) ? out[0] : out;
        }

        // ============ PDF va boshqa hujjatlar ============
        async function storeDocBlob(file) {
            await openMediaDB();
            if (file.size > MAX_ORIGINAL) { const e = new Error('toolarge'); e.code = 'toolarge'; throw e; }
            const id = 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
            const meta = { id: id, kind: 'pdf', name: file.name || 'hujjat.pdf', size: file.size, type: file.type || 'application/pdf', at: new Date().toISOString(), by: authorStr() };
            await mediaSave(id, file, meta);
            MEDIA_META.set(id, meta);
            return id;
        }
        function openDoc(src, name) {
            const ref = imgRef(src);
            if (!ref) return;
            mediaGetBlob(ref).then(b => {
                if (!b) { alert("Hujjat bu telefonda topilmadi."); return; }
                const url = URL.createObjectURL(b);
                const w = window.open(url, '_blank');
                if (!w) {
                    const a = document.createElement('a');
                    a.href = url; a.download = name || 'hujjat.pdf';
                    document.body.appendChild(a); a.click(); a.remove();
                }
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            }).catch(() => alert("Hujjatni ochib bo'lmadi."));
        }

        // ============ YUTUQ / HAYFSAN FAYLLARI ============
        const ATT = { itemId: null, pending: { yutuq: [], hafsana: [] }, target: null, busy: 0 };
        function attListKey(kind) { return kind === 'yutuq' ? 'yutuqlar' : 'hafsanalar'; }
        function attResetIfNewItem(item) {
            if (!item || ATT.itemId !== item.id) { ATT.itemId = item ? item.id : null; ATT.pending = { yutuq: [], hafsana: [] }; }
        }
        function pickAtt(kind, type, entryIndex) {
            ATT.target = { kind: kind, entry: (entryIndex === undefined ? null : entryIndex) };
            document.getElementById(type === 'pdf' ? 'att-input-pdf' : 'att-input-img').click();
        }
        function attFilesChosen(input, type) {
            const files = Array.from(input.files || []);
            input.value = '';
            const tgt = ATT.target;
            if (!files.length || !tgt) return;
            const item = getActiveItem();
            if (!item) return;
            ATT.busy += files.length; renderAttBusy();
            const done = f => {
                ATT.busy--; renderAttBusy();
                if (!f) return;
                if (tgt.entry === null) ATT.pending[tgt.kind].push(f);
                else {
                    const e = (item[attListKey(tgt.kind)] || [])[tgt.entry];
                    if (e) { if (!e.files) e.files = []; e.files.push(f); saveDB(); }
                }
                renderXodimExtra(item);
            };
            files.forEach(file => {
                if (type === 'pdf') {
                    if (!/pdf$/i.test(file.type || '') && !/\.pdf$/i.test(file.name || '')) { alert("\"" + file.name + "\" PDF fayl emas."); done(null); return; }
                    storeDocBlob(file).then(id => done({ kind: 'pdf', src: 'idb:' + id, name: file.name, size: file.size }))
                        .catch(err => {
                            alert(err && err.code === 'toolarge' ? ("\"" + file.name + "\" hajmi 10 MB dan katta. Kichikroq PDF tanlang.") : "PDF ni saqlab bo'lmadi. Faylni Chrome'da ochib qayta urinib ko'ring.");
                            done(null);
                        });
                } else {
                    processImage(file, src => done(src ? { kind: 'img', src: src, name: file.name } : null));
                }
            });
        }
        function renderAttBusy() {
            ['yutuq', 'hafsana'].forEach(k => { const el = document.getElementById('att-busy-' + k); if (el) el.classList.toggle('hidden', ATT.busy <= 0); });
        }
        function attChipsHtml(files, onRemove, onOpenImg) {
            return (files || []).map((f, j) => {
                const rm = onRemove ? `<span class="att-x" onclick="event.stopPropagation(); ${onRemove(j)}">✕</span>` : '';
                if (f.kind === 'pdf') return `<div class="att-pdf" onclick="openDoc('${f.src}', '${escapeHtml(String(f.name || '').replace(/'/g, ''))}')">📄 <span>${escapeHtml(f.name || 'hujjat.pdf')}</span>${f.size ? ' (' + fmtSize(f.size) + ')' : ''}${rm}</div>`;
                const imgIdx = (files || []).filter(x => x.kind !== 'pdf').indexOf(f);
                return `<div class="att-thumb" onclick="${onOpenImg(imgIdx)}"><img src="${imgSrc(f)}" alt="">${rm}</div>`;
            }).join('');
        }
        // Qo'shish shaklidagi (hali saqlanmagan) fayllar
        function attPendingHtml(kind) {
            return `<div class="att-bar"><button class="att-btn" onclick="pickAtt('${kind}','img')">📷 Rasm</button><button class="att-btn" onclick="pickAtt('${kind}','pdf')">📄 PDF</button></div>
                <div id="att-busy-${kind}" class="att-busy${ATT.busy > 0 ? '' : ' hidden'}">⏳ Fayl tayyorlanmoqda...</div>
                <div class="att-list">${attChipsHtml(ATT.pending[kind], j => `removePendingAtt('${kind}',${j})`, k => `openPendingImages('${kind}',${k})`)}</div>`;
        }
        // Saqlangan yozuv ostidagi fayllar
        function attEntryHtml(kind, q, i) {
            const files = q.files || [];
            const list = files.length ? `<div class="att-list">${attChipsHtml(files, j => `removeEntryAtt('${kind}',${i},${j})`, k => `openEntryImages('${kind}',${i},${k})`)}</div>` : '';
            const meta = q.author ? `<div class="att-meta">Kiritdi: ${escapeHtml(q.author)}${q.at ? ' — ' + escapeHtml(fmtDateTime(q.at)) : ''}</div>` : '';
            return list + meta;
        }
        function attEntryActions(kind, i) {
            return `<span onclick="pickAtt('${kind}','img',${i})" title="Rasm qo'shish">📷</span><span onclick="pickAtt('${kind}','pdf',${i})" title="PDF qo'shish">📄</span>`;
        }
        function removePendingAtt(kind, j) { ATT.pending[kind].splice(j, 1); const it = getActiveItem(); if (it) renderXodimExtra(it); }
        async function removeEntryAtt(kind, i, j) {
            const item = getActiveItem(); if (!item) return;
            const e = (item[attListKey(kind)] || [])[i]; if (!e || !e.files) return;
            if (!await uiConfirm("Bu fayl olib tashlansinmi?")) return;
            e.files.splice(j, 1); saveDB(); renderXodimExtra(item);
        }
        function openImgFiles(files, idx) {
            const imgs = (files || []).filter(f => f.kind !== 'pdf');
            if (!imgs.length) return;
            openImageViewerModal(imgs.map(f => f.src), imgs.map(f => { const m = MEDIA_META.get(imgRef(f.src)); return m && m.by ? 'Kiritdi: ' + m.by : ''; }), idx);
        }
        function openPendingImages(kind, idx) { openImgFiles(ATT.pending[kind], idx); }
        function openEntryImages(kind, i, idx) { const item = getActiveItem(); if (item) openImgFiles(((item[attListKey(kind)] || [])[i] || {}).files, idx); }
        function takePendingAtt(kind) { const f = ATT.pending[kind]; ATT.pending[kind] = []; return f; }

        // ============ PIN-KOD BILAN KIRISH ============
        const SESSION_KEY = 'agmk_session';
        let pinBuf = '';
        function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } }
        function canPinUnlock() {
            const s = getSession();
            if (!s || !s.tabel) return false;
            const a = getAccounts()[s.tabel];
            if (!a || !a.pin) return false;
            return !lookupXodim(s.tabel).err;
        }
        function renderPinDots(cls) {
            const box = $id('pinDots');
            box.querySelectorAll('span').forEach((d, i) => d.classList.toggle('on', i < pinBuf.length));
            box.classList.remove('err', 'shake');
            if (cls) { void box.offsetWidth; cls.split(' ').forEach(c => box.classList.add(c)); }
        }
        function pinPress(d) {
            if (pinBuf.length >= 4) return;
            pinBuf += d;
            $id('pinErr').innerText = '';
            renderPinDots();
            if (pinBuf.length === 4) setTimeout(checkPin, 120);
        }
        function pinBack() { pinBuf = pinBuf.slice(0, -1); renderPinDots(); }
        function checkPin() {
            const s = getSession();
            const accs = getAccounts();
            const a = s && accs[s.tabel];
            if (!a || !a.pin) { pinBuf = ''; showLockView('login'); return; }
            if (hashPw(pinBuf, a.pin.salt) === a.pin.hash) {
                a.pinFails = 0; saveAccounts(accs);
                pinBuf = ''; renderPinDots();
                const lk = lookupXodim(s.tabel);
                if (lk.err) { showLockView('login'); $id('lkErr').innerText = lk.err; return; }
                if (typeof secBlockMsg === 'function' && secBlockMsg(s.tabel)) { showLockView('login'); $id('lkErr').innerText = secBlockMsg(s.tabel); return; }
                setSessionUser(lk.rec.item);
                hideLock();
                return;
            }
            a.pinFails = (a.pinFails || 0) + 1;
            pinBuf = '';
            if (a.pinFails >= 5) {
                a.pinFails = 0; saveAccounts(accs);
                try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
                $id('lkTabel').value = s.tabel; $id('lkPw').value = '';
                showLockView('login');
                $id('lkErr').innerText = "PIN-kod 5 marta noto'g'ri kiritildi. Tabel raqami va parol bilan kiring.";
                return;
            }
            saveAccounts(accs);
            renderPinDots('err shake');
            $id('pinErr').innerText = "PIN-kod noto'g'ri. Yana " + (5 - a.pinFails) + " ta urinish qoldi.";
        }
        function pinOtherAccount() {
            try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
            $id('lkTabel').value = ''; $id('lkPw').value = '';
            showLockView('login');
        }
        function pinForgot() {
            const s = getSession();
            $id('lkTabel').value = s && s.tabel ? s.tabel : ''; $id('lkPw').value = '';
            showLockView('login');
            $id('lkErr').classList.add('lock-ok');
            $id('lkErr').innerText = "Tabel raqami va parol bilan kiring.";
        }
        document.addEventListener('keydown', e => {
            if (!document.body.classList.contains('locked') || currentLockView !== 'pin') return;
            if (/^[0-9]$/.test(e.key)) { e.preventDefault(); pinPress(e.key); }
            else if (e.key === 'Backspace') { e.preventDefault(); pinBack(); }
        });

        // PIN sozlamasi (Parametrlar)
        function openPinSetup() {
            if (!currentUser || !currentUser.tabel) return;
            const a = getAccounts()[currentUser.tabel] || {};
            const has = !!a.pin;
            $id('psTitle').innerText = has ? "🔢 PIN-kodni o'zgartirish" : "🔢 PIN-kod bilan kirishni yoqish";
            $id('psHint').innerText = has
                ? "Yangi PIN kiriting yoki PIN-kodni butunlay o'chiring. Xavfsizlik uchun hisob paroli so'raladi."
                : "Dastur ochilganda tabel va parol o'rniga 4 xonali PIN so'raladi. \"Chiqish\" bosilgandan keyin esa tabel va parol majburiy bo'ladi.";
            ['psPw', 'psPin', 'psPin2'].forEach(id => { $id(id).value = ''; });
            $id('psErr').innerText = '';
            $id('psOffBtn').classList.toggle('hidden', !has);
            $id('pinSetupModal').classList.remove('hidden');
        }
        function pinSetupCheckPw() {
            const t = cleanTabel(currentUser.tabel);
            const lm = lockedMsg('pinset:' + t);
            if (lm) { $id('psErr').innerText = lm; return false; }
            if (!checkAccPw(t, $id('psPw').value)) { $id('psErr').innerText = "Hisob paroli noto'g'ri. " + registerFail('pinset:' + t); return false; }
            clearFails('pinset:' + t);
            return true;
        }
        function savePinSetup() {
            const p1 = $id('psPin').value, p2 = $id('psPin2').value;
            if (!$id('psPw').value) { $id('psErr').innerText = "Hisob parolini kiriting."; return; }
            if (!/^\d{4}$/.test(p1)) { $id('psErr').innerText = "PIN aynan 4 ta raqamdan iborat bo'lishi kerak."; return; }
            if (p1 !== p2) { $id('psErr').innerText = "PIN-kodlar bir xil emas."; return; }
            if (!pinSetupCheckPw()) return;
            const t = cleanTabel(currentUser.tabel);
            const accs = getAccounts();
            if (!accs[t]) { $id('psErr').innerText = "Hisob topilmadi."; return; }
            const had = !!accs[t].pin;
            accs[t].pin = makePwRec(p1); accs[t].pinFails = 0;
            saveAccounts(accs);
            logPw(had ? "PIN-kod o'zgartirildi" : "PIN-kod yoqildi", t, currentUser.name);
            $id('pinSetupModal').classList.add('hidden');
            showToast(had ? "✅ PIN-kod o'zgartirildi" : "✅ PIN-kod yoqildi");
            renderSettings();
        }
        async function removePin() {
            if (!$id('psPw').value) { $id('psErr').innerText = "PIN-kodni o'chirish uchun hisob parolini kiriting."; return; }
            if (!pinSetupCheckPw()) return;
            if (!await uiConfirm("PIN-kod o'chirilsinmi? Keyin har safar tabel va parol bilan kirasiz.")) return;
            const t = cleanTabel(currentUser.tabel);
            const accs = getAccounts();
            if (accs[t]) { delete accs[t].pin; delete accs[t].pinFails; saveAccounts(accs); }
            logPw("PIN-kod o'chirildi", t, currentUser.name);
            $id('pinSetupModal').classList.add('hidden');
            showToast("PIN-kod o'chirildi");
            renderSettings();
        }


