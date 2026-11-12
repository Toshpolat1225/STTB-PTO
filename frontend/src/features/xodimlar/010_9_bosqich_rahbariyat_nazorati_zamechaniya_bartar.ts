        // =====================================================================
        // YANGI (9-bosqich): RAHBARIYAT NAZORATI — zamechaniya › bartaraf qilish › qabul / qaytarish
        // Hozir bitta qurilmada (oflayn) ishlaydi; server ulanganda shu ma'lumotlar almashadi.
        // =====================================================================
        const NOTIF_KEY = 'agmk_notifs';
        const ZAM_SEQ_KEY = 'agmk_zam_seq';
        const ZST = { ochiq: '🔴 Ochiq', tekshiruvda: '🟡 Tekshiruvda', qaytarildi: '🔴 Qaytarildi', yopildi: '🟢 Yopildi' };
        const ZF = { vid: null, photos: [], audio: null, busy: 0 };   // yangi zamechaniya shakli
        const FX = { vid: null, no: null, photos: [], busy: 0 };      // bartaraf qilish shakli
        let ZT = 'zf';
        let rnFilter = 'all';

        function meObj() { return { name: currentUser.name || '—', role: currentUser.role || '', tabel: cleanTabel(currentUser.tabel) }; }
        function meLabel(b) { return b ? (b.name + (b.role ? ' (' + b.role + ')' : '')) : '—'; }
        function allZams() { const out = []; (vagonlarData || []).forEach(v => (v.zams || []).forEach(z => out.push({ v: v, z: z }))); return out; }
        function findZam(vid, no) { const v = vagonlarData.find(x => x.id === vid); const z = v && (v.zams || []).find(x => x.no === no); return z ? { v: v, z: z } : null; }
        function nextZamNo() {
            let seq = parseInt(localStorage.getItem(ZAM_SEQ_KEY) || '0', 10) || 0;
            allZams().forEach(r => { if (r.z.no > seq) seq = r.z.no; });
            seq++;
            try { localStorage.setItem(ZAM_SEQ_KEY, String(seq)); } catch (e) {}
            return seq;
        }
        function isZamOwner(z) { return isRahbar() && !!z.by && !!z.by.tabel && z.by.tabel === cleanTabel(currentUser.tabel); }
        function zamCanReview(z) { return isZamOwner(z) || isAdmin(); } // asoschi — har qanday zamechaniyani qabul qiladi / qaytaradi

        // Eski "Rahbariyat Nazorati va Eslatmasi" (izoh + rasmlar) yo'qolmaydi — zamechaniyaga aylantiriladi
        function migrateOldRahbar() {
            let n = 0;
            (vagonlarData || []).forEach(v => {
                const imgs = (v.rahbarImgs || []).filter(x => x && x.src);
                const izoh = String(v.rahbarIzoh || '').trim();
                if (!imgs.length && !izoh) return;
                if (!v.zams) v.zams = [];
                const author = imgs.length ? (imgs[imgs.length - 1].author || '') : '';
                const m = String(author).match(/^(.*?)\s*\((.*)\)\s*$/);
                const who = allXodims().find(r => m && r.item.name === m[1]);
                v.zams.push({ no: nextZamNo(), at: new Date().toISOString(), by: { name: m ? m[1] : (author || 'Rahbariyat'), role: m ? m[2] : '', tabel: who ? cleanTabel(who.item.tabel) : '' },
                    izoh: izoh, photos: imgs.slice().reverse(), audio: null, status: 'ochiq', attempts: [], seenFix: true, migrated: true });
                v.rahbarImgs = []; v.rahbarIzoh = '';
                n++;
            });
            if (n) saveDB(false);
        }

        // ============ BILDIRISHNOMALAR ============
        function getNotifs() { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') || []; } catch (e) { return []; } }
        function saveNotifs(l) { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(l.slice(-500))); } catch (e) {} }
        function myUnitKey() { const r = currentUser && currentUser.tabel ? findXodimsByTabel(currentUser.tabel)[0] : null; return r ? r.su : ''; }
        function notifForMe(n) {
            const t = cleanTabel(currentUser && currentUser.tabel);
            if (!t || n.byTabel === t) return false;
            // Zamechaniya berilgani va qabul/rad natijasi — faqat bartaraf qiluvchi xodimlarga; rahbarga faqat "tekshiring" so'rovi
            if (n.vid && n.zno && (n.icon === '🚨' || n.icon === '✅' || n.icon === '❌') && (isRahbar() || n.zBy === t)) return false;
            if (n.vid && n.zno && n.icon === '🛠' && n.toTabel && n.toTabel !== t) return false;
            if (n.toAll && n.icon === '🚨') return true; // seh biriktirilmagan texnika — barcha xodimlarga
            if (isAdminReal()) return true;
            if (n.toTabel) return n.toTabel === t;
            if (n.toSeh) { const k = myUnitKey(); return k === n.toSeh || k === 'VH/ВС'; }
            return false;
        }
        function notify(o) {
            const l = getNotifs();
            l.push(Object.assign({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: new Date().toISOString(), byTabel: cleanTabel(currentUser.tabel), read: [] }, o));
            saveNotifs(l); updateRnBadges();
            try { if (typeof nsPlay === 'function' && notifForMe(l[l.length - 1])) nsPlay(); } catch (e) {} // bildirishnoma ovozi (design.js)
        }
        function myUnreadNotifs() { const t = cleanTabel(currentUser && currentUser.tabel); return getNotifs().filter(n => notifForMe(n) && !(n.read || []).includes(t)); }
        function openNotifs() {
            const t = cleanTabel(currentUser.tabel);
            const l = getNotifs().filter(notifForMe).filter(n => !(n.eph && (n.read || []).includes(t))).reverse(); // qisqa (eph) xabar — ko'rilgach yo'qoladi
            $id('ntList').innerHTML = l.length ? l.map(n => `<div class="nt-item${(n.read || []).includes(t) ? '' : ' unread'}" onclick="openNotif('${n.id}')"><span>${n.icon || '🔔'}</span><div class="nt-t">${escapeHtml(n.text)}<div class="nt-d">${escapeHtml(fmtDateTime(n.at))}</div></div>${(n.read || []).includes(t) ? '' : '<span class="wl-dot"></span>'}</div>`).join('')
                : '<div class="xt-empty">Hozircha bildirishnoma yo\'q</div>';
            $id('notifListModal').classList.remove('hidden');
        }
        function openNotif(id) {
            const l = getNotifs(), n = l.find(x => x.id === id), t = cleanTabel(currentUser.tabel);
            if (!n) return;
            if (!(n.read || []).includes(t)) { n.read = (n.read || []).concat(t); saveNotifs(l); }
            $id('notifListModal').classList.add('hidden');
            updateRnBadges();
            if (n.vid && n.zno) openZam(n.vid, n.zno);
            else if (n.chatTabel) { const p = pplList().find(x => cleanTabel(x.tabel) === n.chatTabel) || { name: n.chatName || ('Tabel ' + n.chatTabel), role: '', tabel: n.chatTabel }; openChats(p); }
        }
        function markAllNotifsRead() {
            const l = getNotifs(), t = cleanTabel(currentUser.tabel);
            l.forEach(n => { if (notifForMe(n) && !(n.read || []).includes(t)) n.read = (n.read || []).concat(t); });
            saveNotifs(l); updateRnBadges(); openNotifs();
        }
        function rnUnseenCount() { return allZams().filter(r => r.z.status === 'tekshiruvda' && !r.z.seenFix && isZamOwner(r.z)).length; }
        function updateRnBadges() {
            const nb = myUnreadNotifs().length, bc = $id('bellCount'), bb = $id('bellBtn');
            if (bc) { bc.innerText = nb; bc.classList.toggle('hidden', nb === 0); }
            if (bb) { bb.classList.toggle('pulse', nb > 0); bb.classList.toggle('hidden', !(currentUser && currentUser.tabel)); }
            const rb = $id('rnBadge'), n2 = isRahbar() ? rnUnseenCount() : 0;
            if (rb) { rb.innerText = n2; rb.classList.toggle('hidden', n2 === 0); }
            const card = $id('rnMenuCard'); if (card) card.classList.toggle('rn-lock', !(isRahbar() || isAdmin()));
        }

        // ============ RASM / OVOZ YIG'ISH ============
        function zamPick(target, kind) { ZT = target; $id(kind === 'cam' ? 'zam-cam' : 'zam-file').click(); }
        function zamState() { return ZT === 'fx' ? FX : ZF; }
        function zamRenderPending() { if (ZT === 'fx') renderFxFiles(); else renderZamForm(); }
        function zamFiles(input) {
            const files = Array.from(input.files || []); input.value = '';
            const st = zamState(), tgt = ZT;
            files.forEach(f => {
                st.busy++; zamRenderPending();
                processImage(f, src => { st.busy--; if (src) st.photos.push({ src: src, author: authorStr() }); ZT = tgt; zamRenderPending(); });
            });
        }
        // Ovozli xabar: brauzer ruxsat bersa ilova ichida yoziladi, aks holda telefonning ovoz yozish dasturi ochiladi
        let recState = null;
        async function storeAudio(blob, dur) {
            await openMediaDB();
            if (blob.size > MAX_ORIGINAL) { alert("Ovozli xabar 10 MB dan katta."); return null; }
            const id = 'aud_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
            const meta = { id: id, kind: 'audio', size: blob.size, type: blob.type || 'audio/webm', dur: dur || 0, at: new Date().toISOString(), by: authorStr() };
            await mediaSave(id, blob, meta); MEDIA_META.set(id, meta);
            return { src: 'idb:' + id, dur: dur || 0 };
        }
        async function toggleRecord() {
            if (recState) { recState.rec.stop(); return; }
            const can = window.isSecureContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder;
            if (!can) { $id('zam-audio').click(); return; }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const rec = new MediaRecorder(stream), chunks = [], t0 = Date.now();
                recState = { rec: rec, timer: setInterval(renderZamForm, 1000), t0: t0 };
                rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
                rec.onstop = async () => {
                    clearInterval(recState.timer); stream.getTracks().forEach(t => t.stop());
                    const dur = Math.round((Date.now() - t0) / 1000); recState = null;
                    const a = await storeAudio(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }), dur);
                    if (a) ZF.audio = a;
                    renderZamForm();
                };
                rec.start(); renderZamForm();
            } catch (e) { recState = null; $id('zam-audio').click(); }
        }
        function zamAudioFile(input) {
            const f = input.files && input.files[0]; input.value = '';
            if (!f) return;
            storeAudio(f, 0).then(a => { if (a) { ZF.audio = a; renderZamForm(); } }).catch(() => alert("Ovozli xabarni saqlab bo'lmadi."));
        }
        let playing = null;
        function playAudio(src, btn) {
            if (playing) { playing.a.pause(); URL.revokeObjectURL(playing.u); const same = playing.src === src; if (playing.btn) playing.btn.classList.remove('rec-on'); playing = null; if (same) return; }
            mediaGetBlob(imgRef(src)).then(b => {
                if (!b) { alert("Ovozli xabar bu telefonda topilmadi."); return; }
                const u = URL.createObjectURL(b), a = new Audio(u);
                playing = { a: a, u: u, src: src, btn: btn }; if (btn) btn.classList.add('rec-on');
                a.onended = () => { if (btn) btn.classList.remove('rec-on'); URL.revokeObjectURL(u); playing = null; };
                a.play().catch(() => alert("Ovozni ijro etib bo'lmadi."));
            });
        }
        function audioBtn(a) { return a ? `<button class="audio-btn" onclick="playAudio('${a.src}', this)">▶ Ovozli xabar${a.dur ? ' (' + Math.floor(a.dur / 60) + ':' + String(a.dur % 60).padStart(2, '0') + ')' : ''}</button>` : ''; }
        function thumbsHtml(photos, onOpen) { return (photos || []).length ? `<div class="att-list">${photos.map((f, j) => `<div class="att-thumb" onclick="${onOpen(j)}"><img src="${imgSrc(f)}" alt=""></div>`).join('')}</div>` : ''; }

        // ============ VAGON PASPORTIDA ZAMECHANIYALAR ============
        function renderZams(v) {
            if (!v || !$id('zam-box')) return;
            if (ZF.vid !== v.id) { ZF.vid = v.id; ZF.photos = []; ZF.audio = null; ZF.busy = 0; }
            const zs = (v.zams || []).slice().sort((a, b) => b.no - a.no);
            const open = zs.filter(z => z.status !== 'yopildi').length;
            $id('zamTitle').innerText = "🚨 Rahbariyat nazorati — zamechaniyalar" + (zs.length ? " (" + open + " ochiq / " + zs.length + ")" : "");
            renderZamForm();
            $id('zamList').innerHTML = zs.length ? zs.map(z => zamCardHtml(v, z)).join('') : '<div class="zam-note">Bu vagon bo\'yicha zamechaniya yo\'q.</div>';
        }
        function renderZamForm() {
            const box = $id('zamForm'); if (!box) return;
            if (!isRahbar() && !isAdmin()) { box.innerHTML = '<div class="zam-note">Zamechaniyani rahbarlar beradi. Sizga tegishli zamechaniyani "🛠 Bartaraf qilish" orqali yoping.</div>'; return; }
            const recOn = !!recState;
            const recTxt = recOn ? ('⏹ To\'xtatish (' + Math.round((Date.now() - recState.t0) / 1000) + ' s)') : '🎙 Ovoz';
            box.innerHTML = `<div class="zam-form">
                <div class="att-bar"><button class="att-btn" onclick="zamPick('zf','cam')">📷 Kamera</button><button class="att-btn" onclick="zamPick('zf','file')">📁 Fayl</button><button class="att-btn${recOn ? ' rec-on' : ''}" onclick="toggleRecord()">${recTxt}</button></div>
                ${ZF.busy > 0 ? '<div class="att-busy">⏳ Rasm tayyorlanmoqda...</div>' : ''}
                <div class="att-list">${ZF.photos.map((f, j) => `<div class="att-thumb" onclick="openImgFiles(ZF.photos, ${j})"><img src="${imgSrc(f)}" alt=""><span class="att-x" onclick="event.stopPropagation(); ZF.photos.splice(${j},1); renderZamForm();">✕</span></div>`).join('')}</div>
                ${ZF.audio ? `<div>${audioBtn(ZF.audio)} <span class="att-x" style="position:static; display:inline-block; cursor:pointer;" onclick="ZF.audio=null; renderZamForm();">✕</span></div>` : ''}
                <textarea id="zamText" class="custom-input" placeholder="Zamechaniya matni (ixtiyoriy)..." style="min-height:60px; font-size:13px; margin-top:6px;">${escapeHtml(ZF.text || '')}</textarea>
                <button class="action-btn" style="background:#dc2626; box-shadow:0 4px 12px rgba(220,38,38,0.4); margin-top:8px;" onclick="createZam()">🚨 Zamechaniya berish</button>
            </div>`;
            const ta = $id('zamText'); if (ta) ta.addEventListener('input', () => { ZF.text = ta.value; });
        }
        function zamCardHtml(v, z) {
            const atts = (z.attempts || []).map((a, i) => `<div class="zam-att">
                    <div class="zam-att-h">🛠 ${i + 1}-urinish: bartaraf qildi — ${escapeHtml(meLabel(a.by))}</div>
                    <div class="zam-meta">${escapeHtml(fmtDateTime(a.at))}${typeof gpsTag === 'function' ? gpsTag(a.gps) : ''}</div>
                    ${thumbsHtml(a.photos, j => `openZamPhotos(${v.id},${z.no},${i},${j})`)}
                    ${a.izoh ? `<div class="zam-text">${escapeHtml(a.izoh)}</div>` : ''}
                    ${a.result === 'qabul' ? `<div class="zam-res ok">✅ Qabul qilindi — ${escapeHtml(meLabel(a.reviewBy))}, ${escapeHtml(fmtDateTime(a.reviewAt))}</div>` : ''}
                    ${a.result === 'rad' ? `<div class="zam-res no">❌ Qabul qilinmadi — ${escapeHtml(meLabel(a.reviewBy))}, ${escapeHtml(fmtDateTime(a.reviewAt))}${a.reason ? '<br>Sabab: ' + escapeHtml(a.reason) : ''}</div>` : ''}
                </div>`).join('');
            const acts = [];
            if ((z.status === 'ochiq' || z.status === 'qaytarildi') && currentUser && currentUser.tabel && ((!isRahbar() && !isZamOwner(z)) || isAdmin())) acts.push(`<button class="fix" onclick="openFix(${v.id},${z.no})">🛠 Bartaraf qilish</button>`);
            if (z.status === 'tekshiruvda' && zamCanReview(z)) { acts.push(`<button class="ok" onclick="reviewZam(${v.id},${z.no},true)">✅ Qabul qilindi</button>`); acts.push(`<button class="no" onclick="reviewZam(${v.id},${z.no},false)">❌ Qabul qilinmadi</button>`); }
            if (z.status === 'ochiq' && !(z.attempts || []).length && zamCanReview(z)) acts.push(`<button class="del" onclick="deleteZam(${v.id},${z.no})" title="O'chirish">🗑</button>`);
            return `<div class="zam-card st-${z.status}" id="zam-${z.no}">
                <div class="zam-h"><b>№${z.no}</b><span class="zam-st ${z.status}">${ZST[z.status] || z.status}</span></div>
                <div class="zam-meta">Berdi: ${escapeHtml(meLabel(z.by))} — ${escapeHtml(fmtDateTime(z.at))}${typeof gpsTag === 'function' ? gpsTag(z.gps) : ''}</div>
                ${thumbsHtml(z.photos, j => `openZamPhotos(${v.id},${z.no},-1,${j})`)}
                ${audioBtn(z.audio)}
                ${z.izoh ? `<div class="zam-text">${escapeHtml(z.izoh)}</div>` : ''}
                ${z.status === 'qaytarildi' ? '<div class="zam-res no">↩️ Qayta bartaraf qilish kerak</div>' : ''}
                ${atts}
                ${acts.length ? `<div class="zam-actions">${acts.join('')}</div>` : ''}
            </div>`;
        }
        function openZamPhotos(vid, no, ai, j) {
            const r = findZam(vid, no); if (!r) return;
            const list = ai < 0 ? r.z.photos : ((r.z.attempts[ai] || {}).photos || []);
            if (ai >= 0 && r.z.status === 'tekshiruvda' && isZamOwner(r.z) && !r.z.seenFix) { r.z.seenFix = true; saveDB(false); updateRnBadges(); }
            openImageViewerModal(list.map(f => f.src), list.map(f => 'Kiritdi: ' + (f.author || '')), j);
        }
        function createZam() {
            if (!isRahbar() && !isAdmin()) return;
            const v = vagonlarData.find(x => x.id === activeVagonId); if (!v) return;
            if (ZF.busy > 0) { alert("Rasm hali tayyorlanmoqda, biroz kuting."); return; }
            if (recState) { alert("Avval ovoz yozishni to'xtating."); return; }
            const izoh = ($id('zamText') ? $id('zamText').value : '').trim();
            if (!ZF.photos.length && !izoh && !ZF.audio) { alert("Rasm, matn yoki ovozli xabardan kamida bittasini kiriting."); return; }
            if (!v.zams) v.zams = [];
            const z = { no: nextZamNo(), at: new Date().toISOString(), by: meObj(), izoh: izoh, photos: ZF.photos.slice(), audio: ZF.audio, status: 'ochiq', attempts: [], seenFix: true };
            if (typeof curGpsFix === 'function') { const gf = curGpsFix(); if (gf) z.gps = gf; }
            v.zams.push(z);
            ZF.photos = []; ZF.audio = null; ZF.text = '';
            saveDB();
            notify({ icon: '🚨', text: unitLabel(v) + " ga zamechaniya №" + z.no + " berildi (" + meLabel(z.by) + "). Bartaraf qiling.", vid: v.id, zno: z.no, toSeh: v.seh, zBy: z.by.tabel, toAll: !v.seh || v.kind === 'avto' || v.kind === 'yol' });
            renderZams(v);
            showToast("🚨 Zamechaniya №" + z.no + " berildi");
        }
        async function deleteZam(vid, no) {
            const r = findZam(vid, no); if (!r || !zamCanReview(r.z)) return;
            if (!await uiConfirm("Zamechaniya №" + no + " o'chirilsinmi?\n(Xato bo'lsa, ↩️ bilan qaytarish mumkin)")) return;
            r.v.zams = r.v.zams.filter(x => x !== r.z);
            saveDB(); renderZams(r.v); updateRnBadges();
        }

        // ============ BARTARAF QILISH ============
        function openFix(vid, no) {
            const r = findZam(vid, no); if (!r) return;
            if ((isRahbar() || isZamOwner(r.z)) && !isAdmin()) { alert("Zamechaniyani o'sha bo'lim xodimi bartaraf qiladi.\nRahbar faqat qabul qiladi yoki qaytaradi."); return; }
            FX.vid = vid; FX.no = no; FX.photos = []; FX.busy = 0;
            $id('fxTitle').innerText = "🛠 №" + no + " — kamchilikni bartaraf qilish";
            $id('fxHint').innerText = unitLabel(r.v) + ". To'g'rilangan holatni rasmga olib yuklang (kamida 1 ta rasm).";
            $id('fxText').value = '';
            $id('fxFrom').innerText = "Bartaraf qildi: " + meLabel(meObj()) + "\n(vaqt avtomatik yoziladi)";
            renderFxFiles();
            $id('fixModal').classList.remove('hidden');
        }
        function renderFxFiles() {
            $id('fxBusy').classList.toggle('hidden', FX.busy <= 0);
            $id('fxFiles').innerHTML = FX.photos.map((f, j) => `<div class="att-thumb" onclick="openImgFiles(FX.photos, ${j})"><img src="${imgSrc(f)}" alt=""><span class="att-x" onclick="event.stopPropagation(); FX.photos.splice(${j},1); renderFxFiles();">✕</span></div>`).join('');
        }
        function submitFix() {
            const r = findZam(FX.vid, FX.no); if (!r) return;
            if (FX.busy > 0) { alert("Rasm hali tayyorlanmoqda, biroz kuting."); return; }
            if (!FX.photos.length) { alert("To'g'rilangan holatning rasmini yuklang!"); return; }
            if (!r.z.attempts) r.z.attempts = [];
            r.z.attempts.push({ at: new Date().toISOString(), by: meObj(), izoh: $id('fxText').value.trim(), photos: FX.photos.slice(), result: null });
            if (typeof curGpsFix === 'function') { const gf = curGpsFix(); if (gf) r.z.attempts[r.z.attempts.length - 1].gps = gf; }
            r.z.status = 'tekshiruvda'; r.z.seenFix = false;
            FX.photos = [];
            saveDB();
            notify({ icon: '🛠', text: "Zamechaniya №" + r.z.no + " (" + unitLabel(r.v) + ") bartaraf qilindi — " + meLabel(meObj()) + ". Tekshirib, qabul qiling yoki qaytaring.", vid: r.v.id, zno: r.z.no, toTabel: r.z.by && r.z.by.tabel ? r.z.by.tabel : ADMIN_TABEL });
            $id('fixModal').classList.add('hidden');
            if (activeVagonId === r.v.id) renderZams(r.v);
            showToast("🛠 Rahbarga tekshirish uchun yuborildi");
        }

        // ============ RAHBAR TEKSHIRADI ============
        async function reviewZam(vid, no, ok) {
            const r = findZam(vid, no); if (!r || !zamCanReview(r.z) || r.z.status !== 'tekshiruvda') return;
            const a = r.z.attempts[r.z.attempts.length - 1];
            let reason = '';
            if (!ok) { const p = await uiPrompt("Nima uchun qabul qilinmadi? (sabab)", ""); if (p === null) return; reason = p.trim(); }
            else if (!await uiConfirm("Zamechaniya №" + no + " bartaraf qilingani qabul qilinsinmi?")) return;
            a.result = ok ? 'qabul' : 'rad'; a.reviewAt = new Date().toISOString(); a.reviewBy = meObj(); a.reason = reason;
            r.z.status = ok ? 'yopildi' : 'qaytarildi'; r.z.seenFix = true;
            saveDB();
            notify(ok ? { icon: '✅', text: "Zamechaniya №" + no + " (" + unitLabel(r.v) + ") qabul qilindi — " + meLabel(meObj()) + ".", vid: vid, zno: no, toSeh: r.v.seh, zBy: r.z.by && r.z.by.tabel, toTabel: a.by && a.by.tabel }
                      : { icon: '❌', text: "Zamechaniya №" + no + " (" + unitLabel(r.v) + ") qabul qilinmadi" + (reason ? ": " + reason : "") + ". Qayta bartaraf qiling!", vid: vid, zno: no, toSeh: r.v.seh, zBy: r.z.by && r.z.by.tabel, toTabel: a.by && a.by.tabel });
            if (activeVagonId === vid) renderZams(r.v);
            if ($id('screen-rn').classList.contains('active')) renderRN();
            if (typeof markZamNotifsRead === 'function') markZamNotifsRead(vid, no);
            showToast(ok ? "✅ Qabul qilindi — №" + no + " yopildi" : "❌ Qaytarildi — bo'limga eslatma yuborildi");
        }

        // Zamechaniyani ochish (bildirishnoma yoki nazorat ro'yxatidan)
        function openZam(vid, no) {
            const r = findZam(vid, no);
            if (!r) { alert("Zamechaniya topilmadi (o'chirilgan bo'lishi mumkin)."); return; }
            if (r.z.status === 'tekshiruvda' && isZamOwner(r.z) && !r.z.seenFix) { r.z.seenFix = true; saveDB(false); }
            openPassport(vid);
            updateRnBadges();
            setTimeout(() => {
                const el = $id('zam-' + no); if (!el) return;
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800);
            }, 250);
        }

        // ============ UMUMIY RAHBARIYAT NAZORATI ============
        function openRN() {
            if (!isRahbar() && !isAdmin()) { alert("🔒 Bu bo'lim faqat rahbarlar uchun.\n\nRahbar lavozimlari Shtatlar ro'yxatida 👑 bilan belgilanadi."); return; }
            openScreen('screen-rn'); renderRN();
        }
        function setRnFilter(f) { rnFilter = f; renderRN(); }
        function renderRN() {
            const mine = allZams().filter(r => isZamOwner(r.z) || (isAdmin() && !isRahbar())).sort((a, b) => b.z.no - a.z.no); // administrator — hammasini ko'rish rejimida
            const cnt = s => mine.filter(r => r.z.status === s).length;
            const tabs = [['all', 'Hammasi', mine.length], ['ochiq', 'Ochiq', cnt('ochiq')], ['tekshiruvda', 'Tekshiruvda', cnt('tekshiruvda')], ['qaytarildi', 'Qaytarilgan', cnt('qaytarildi')], ['yopildi', 'Yopilgan', cnt('yopildi')]];
            $id('rnStats').innerHTML = tabs.map(t => `<div class="rn-stat${rnFilter === t[0] ? ' on' : ''}" onclick="setRnFilter('${t[0]}')"><b>${t[2]}</b><span>${t[1]}</span></div>`).join('');
            const list = mine.filter(r => rnFilter === 'all' || r.z.status === rnFilter);
            $id('rnList').innerHTML = list.length ? list.map(r => {
                const z = r.z, last = (z.attempts || [])[z.attempts.length - 1], isNew = z.status === 'tekshiruvda' && !z.seenFix;
                const ph = (z.photos || [])[0];
                return `<div class="rn-card st-${z.status}${isNew ? ' new' : ''}" onclick="openZam(${r.v.id},${z.no})">
                    ${ph ? `<img class="rn-thumb" src="${imgSrc(ph)}" alt="">` : '<div class="rn-thumb" style="display:flex;align-items:center;justify-content:center;font-size:24px;">🚨</div>'}
                    <div class="rn-body">
                        <div class="zam-h"><b>№${z.no} · ${escapeHtml(unitLabel(r.v))}</b>${isNew ? '<span class="menu-badge">YANGI</span>' : ''}</div>
                        <span class="zam-st ${z.status}">${ZST[z.status]}</span>
                        ${z.izoh ? `<div class="zam-text">${escapeHtml(z.izoh)}</div>` : ''}
                        <div class="zam-meta">${escapeHtml(fmtDateTime(z.at))}${last ? ' · 🛠 ' + escapeHtml(last.by.name) + ', ' + escapeHtml(fmtDateTime(last.at)) : ''}</div>
                    </div></div>`;
            }).join('') : '<div class="xt-empty">Bu bo\'limda zamechaniya yo\'q.<br>Zamechaniya berish uchun: Vagonlar parki → vagonni qidiring → pasportidagi "🚨 Rahbariyat nazorati" qismi.</div>';
        }


        // ============ 38. RAZRYAD — lavozim uslubidagi ro'yxat (1–15) ============
        const RZ = { items: [], active: -1 };
        function rzShow() { const v = $id('xeRazryad').value; $id('rzInput').value = v ? v + '-razryad' : ''; }
        function rzOpen(q) {
            const d = String(q || '').replace(/\D/g, '');
            const all = [''].concat(Array.from({ length: 15 }, (_, i) => String(i + 1)));
            RZ.items = d ? all.filter(x => x && x.indexOf(d) === 0) : all;
            const cur = $id('xeRazryad').value;
            RZ.active = d && RZ.items.length ? 0 : RZ.items.indexOf(cur);
            $id('rzList').innerHTML = `<div class="combo-meta">Razryad: 1 dan 15 gacha</div>` + (RZ.items.length ? RZ.items.map((x, k) =>
                `<div class="combo-opt${x === cur ? ' selected' : ''}${k === RZ.active ? ' active' : ''}" onpointerdown="event.preventDefault()" onclick="rzChoose(${k})">${x ? x + '-razryad' : '— (belgilanmagan)'}</div>`).join('') : '<div class="combo-empty">1 dan 15 gacha raqam kiriting</div>');
            $id('rzList').classList.remove('hidden'); $id('rzCombo').classList.add('open');
            const act = $id('rzList').querySelector('.combo-opt.active'); if (act) act.scrollIntoView({ block: 'nearest' });
        }
        function rzClose() { $id('rzList').classList.add('hidden'); $id('rzCombo').classList.remove('open'); rzShow(); }
        function rzChoose(k) { const x = RZ.items[k]; if (x === undefined) return; $id('xeRazryad').value = x; rzClose(); $id('rzInput').blur(); }
        function rzToggle() { if ($id('rzList').classList.contains('hidden')) $id('rzInput').focus(); else $id('rzInput').blur(); }
        function initRzCombo() {
            const inp = $id('rzInput'); if (!inp) return;
            inp.addEventListener('focus', () => { inp.value = ''; rzOpen(''); });
            inp.addEventListener('input', () => {
                rzOpen(inp.value);
                const d = inp.value.replace(/\D/g, '');
                if (d && RZ.items.length === 1) rzChoose(0); // aniq raqam yozilsa — darhol tanlanadi
            });
            inp.addEventListener('blur', () => setTimeout(rzClose, 150));
            inp.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault(); if (!RZ.items.length) return;
                    RZ.active = e.key === 'ArrowDown' ? Math.min(RZ.items.length - 1, RZ.active + 1) : Math.max(0, RZ.active - 1);
                    $id('rzList').querySelectorAll('.combo-opt').forEach((el, k) => el.classList.toggle('active', k === RZ.active));
                } else if (e.key === 'Enter') { e.preventDefault(); if (RZ.active >= 0) rzChoose(RZ.active); }
                else if (e.key === 'Escape') inp.blur();
            });
        }


