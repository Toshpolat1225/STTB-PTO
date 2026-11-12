        // =====================================================================
        // YANGI (5-bosqich): pastki qism, shikoyat-takliflar, aloqa ma'lumotlari, telefonlar
        // =====================================================================
        const CONTACTS_KEY = 'agmk_contacts';
        const FEEDBACK_KEY = 'agmk_feedback';

        // ============ ALOQA MA'LUMOTLARI ============
        function getContacts() { try { return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function saveContacts(c) { try { localStorage.setItem(CONTACTS_KEY, JSON.stringify({ email: c.email || '', telegram: c.telegram || '' })); } catch (e) {} }
        function cleanTelegram(t) { return String(t || '').trim().replace(/^https?:\/\/(www\.)?t\.me\//i, '').replace(/^@/, '').replace(/\/.*$/, ''); }
        function openContacts() {
            if (!isAdmin()) return;
            const c = getContacts();
            $id('ctEmail').value = c.email || '';
            $id('ctTg').value = c.telegram ? '@' + c.telegram : '';
            $id('ctErr').innerText = '';
            $id('contactsModal').classList.remove('hidden');
        }
        function saveContactsForm() {
            const email = $id('ctEmail').value.trim();
            const tg = cleanTelegram($id('ctTg').value);
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $id('ctErr').innerText = "Elektron pochta manzili noto'g'ri."; return; }
            if (tg && !/^[A-Za-z0-9_]{5,32}$/.test(tg)) { $id('ctErr').innerText = "Telegram username noto'g'ri (5–32 ta lotin harfi, raqam yoki _)."; return; }
            saveContacts({ email: email, telegram: tg });
            $id('contactsModal').classList.add('hidden');
            showToast("✅ Aloqa ma'lumotlari saqlandi");
            renderSettings();
        }

        // ============ PASTKI QISM ============
        function updateFooter() {
            if (typeof updateRnBadges === 'function') updateRnBadges();
            const r = findXodimsByTabel(ADMIN_TABEL);
            const el = $id('afRole');
            if (el && r.length && r[0].item.lavozim) el.innerText = r[0].item.lavozim;
            updateFbBadge();
        }

        // ============ SHIKOYAT VA TAKLIF YUBORISH ============
        const FB = { type: 'Shikoyat', files: [], busy: 0 };
        function getFeedback() { try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]') || []; } catch (e) { return []; } }
        function saveFeedback(list) { try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list)); } catch (e) { alert("⚠️ Xotira to'ldi! Xabar saqlanmadi."); } }
        function setFbType(t) {
            FB.type = t;
            $id('fbTypeSh').classList.toggle('on', t === 'Shikoyat');
            $id('fbTypeTk').classList.toggle('on', t === 'Taklif');
        }
        function fbSenderLine() {
            return (currentUser.name || '—') + ", tabel " + (currentUser.tabel || '—') + ", " + (currentUser.role || '—');
        }
        function openFeedback() {
            $id('fbText').value = '';
            FB.files = []; FB.busy = 0;
            setFbType('Shikoyat');
            renderFbFiles();
            $id('fbFrom').innerText = "Yuboruvchi: " + fbSenderLine() + "\n(bu ma'lumot xabarga avtomatik qo'shiladi)";
            const c = getContacts();
            $id('fbMailBtn').classList.toggle('hidden', !c.email);
            $id('fbTgBtn').classList.toggle('hidden', !c.telegram);
            $id('feedbackModal').classList.remove('hidden');
        }
        function renderFbFiles() {
            $id('fbBusy').classList.toggle('hidden', FB.busy <= 0);
            $id('fbFiles').innerHTML = FB.files.map((f, j) => `<div class="att-thumb" onclick="openImgFiles(FB.files, ${j})"><img src="${imgSrc(f)}" alt=""><span class="att-x" onclick="event.stopPropagation(); FB.files.splice(${j},1); renderFbFiles();">✕</span></div>`).join('');
        }
        function fbFilesChosen(input) {
            const files = Array.from(input.files || []);
            input.value = '';
            files.forEach(file => {
                FB.busy++; renderFbFiles();
                processImage(file, src => { FB.busy--; if (src) FB.files.push({ kind: 'img', src: src, name: file.name }); renderFbFiles(); });
            });
        }
        function fbComposeText() {
            const d = new Date();
            return "AGMK-STTB PTO — " + FB.type + "\n\n" + $id('fbText').value.trim() +
                "\n\n— " + fbSenderLine() + "\n" + fmtDateTime(d.toISOString());
        }
        function fbCheckText() {
            if (!$id('fbText').value.trim()) { alert("Xabar matnini yozing!"); return false; }
            return true;
        }
        function sendFeedbackInApp() {
            if (!fbCheckText()) return;
            if (FB.busy > 0) { alert("Rasm hali tayyorlanmoqda, biroz kuting."); return; }
            const list = getFeedback();
            const no = list.reduce((m, x) => Math.max(m, x.no || 0), 0) + 1;
            list.push({ id: 'fb_' + Date.now().toString(36), no: no, type: FB.type, text: $id('fbText').value.trim(), files: FB.files.slice(),
                by: { name: currentUser.name, tabel: currentUser.tabel, role: currentUser.role }, at: new Date().toISOString(), seen: false, done: false });
            saveFeedback(list);
            FB.files = [];
            $id('feedbackModal').classList.add('hidden');
            updateFbBadge();
            showToast("✅ Xabaringiz yuborildi (№" + no + ")");
        }
        function sendFeedbackMail() {
            if (!fbCheckText()) return;
            const c = getContacts();
            if (!c.email) return;
            const subj = "AGMK-STTB PTO: " + FB.type;
            window.location.href = 'mailto:' + encodeURIComponent(c.email) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(fbComposeText());
        }
        function sendFeedbackTelegram() {
            if (!fbCheckText()) return;
            const c = getContacts();
            if (!c.telegram) return;
            const text = fbComposeText();
            try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) {}
            showToast("Matn nusxalandi — kerak bo'lsa chatga qo'ying");
            window.open('https://t.me/' + encodeURIComponent(c.telegram) + '?text=' + encodeURIComponent(text), '_blank');
        }

        // ============ ADMINISTRATOR: KELGAN XABARLAR ============
        let fbShownNew = new Set();
        function updateFbBadge() {
            const n = isAdminReal() ? getFeedback().filter(x => !x.seen).length : 0;
            ['fbMenuBadge', 'fbSetBadge'].forEach(id => { const el = $id(id); if (el) { el.innerText = n; el.classList.toggle('hidden', n === 0); } });
        }
        function openFbInbox() {
            if (!isAdmin()) return;
            const list = getFeedback();
            fbShownNew = new Set(list.filter(x => !x.seen).map(x => x.id));
            list.forEach(x => { x.seen = true; });
            saveFeedback(list);
            renderFbInbox();
            $id('fbInboxModal').classList.remove('hidden');
            updateFbBadge();
        }
        function closeFbInbox() { $id('fbInboxModal').classList.add('hidden'); renderSettings(); }
        function renderFbInbox() {
            const list = getFeedback().slice().reverse();
            const box = $id('fbInboxList');
            if (!list.length) { box.innerHTML = '<div style="text-align:center; color:#94a3b8; padding:24px; font-size:12px;">Hozircha xabar yo\'q</div>'; return; }
            box.innerHTML = list.map(x => {
                const imgs = (x.files || []).map((f, j) => `<div class="att-thumb" onclick="openFbImages('${x.id}', ${j})"><img src="${imgSrc(f)}" alt=""></div>`).join('');
                return `<div class="fb-item${fbShownNew.has(x.id) ? ' new' : ''}">
                    <div class="fb-head"><span>№${x.no} ${fbShownNew.has(x.id) ? '<span class="menu-badge">YANGI</span>' : ''}</span><span class="fb-tag ${x.type === 'Taklif' ? 'tk' : 'sh'}">${x.type === 'Taklif' ? '💡 Taklif' : '🔴 Shikoyat'}</span></div>
                    <div class="fb-text">${escapeHtml(x.text)}</div>
                    ${imgs ? '<div class="att-list">' + imgs + '</div>' : ''}
                    <div class="fb-meta">${escapeHtml((x.by && x.by.name) || '—')}, tabel ${escapeHtml((x.by && x.by.tabel) || '—')}, ${escapeHtml((x.by && x.by.role) || '')}<br>${escapeHtml(fmtDateTime(x.at))}</div>
                    <div class="fb-actions">
                        <button class="${x.done ? 'done' : ''}" onclick="toggleFbDone('${x.id}')">${x.done ? '✅ Ko\'rib chiqildi' : 'Ko\'rib chiqildi deb belgilash'}</button>
                        <button onclick="deleteFb('${x.id}')">🗑 O'chirish</button>
                    </div>
                </div>`;
            }).join('');
        }
        function openFbImages(id, j) { const x = getFeedback().find(y => y.id === id); if (x) openImgFiles(x.files, j); }
        function toggleFbDone(id) { const list = getFeedback(); const x = list.find(y => y.id === id); if (x) { x.done = !x.done; saveFeedback(list); renderFbInbox(); } }
        async function deleteFb(id) {
            if (!await uiConfirm("Bu xabar o'chirilsinmi?")) return;
            saveFeedback(getFeedback().filter(y => y.id !== id));
            renderFbInbox(); updateFbBadge();
        }

        // ============ TELEFON RAQAMLARI ============
        function normalizePhone(v) {
            let d = String(v || '').replace(/\D/g, '');
            if (!d) return '';
            if (d.length === 9) d = '998' + d;
            if (d.length === 12 && d.indexOf('998') === 0) return '+998 ' + d.slice(3, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8, 10) + ' ' + d.slice(10, 12);
            return null; // noto'g'ri raqam
        }
        function telHref(p) { return 'tel:+' + String(p || '').replace(/\D/g, ''); }
        function phoneMatch(item, q) {
            const d = String(q || '').replace(/\D/g, '');
            if (d.length < 3) return false;
            return [item.phone].concat((item.phones2 || []).map(p => p.num)).some(n => String(n || '').replace(/\D/g, '').includes(d));
        }
        function phoneGridHtml(item) {
            const main = item.phone ? `<a class="tel-link" href="${telHref(item.phone)}">📞 ${escapeHtml(item.phone)}</a>` : '—';
            const extra = (item.phones2 || []).filter(p => p && p.num).map(p => `<a class="tel-link" href="${telHref(p.num)}">📱 ${escapeHtml(p.num)}</a>${p.note ? ' <span class="tel-note">(' + escapeHtml(p.note) + ')</span>' : ''}`).join('<br>');
            return `<div>ASOSIY TELEFON: <span>${main}</span></div><div>ZAXIRA RAQAMLAR: <span>${extra || '—'}</span></div>`;
        }
        function ph2RowHtml(num, note) {
            return `<div class="ph2-row"><input type="tel" class="ph2-num" placeholder="+998 __ ___ __ __" value="${escapeHtml(num || '')}"><input type="text" class="ph2-note" placeholder="izoh (uy...)" value="${escapeHtml(note || '')}"><button class="ph2-del" onclick="this.parentElement.remove()">🗑</button></div>`;
        }
        function addPh2Row() { $id('xePhones2').insertAdjacentHTML('beforeend', ph2RowHtml('', '')); }


