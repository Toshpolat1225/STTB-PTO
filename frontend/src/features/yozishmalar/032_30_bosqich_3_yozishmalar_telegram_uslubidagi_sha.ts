        /* ===== 30-bosqich (3): Yozishmalar — Telegram uslubidagi shaxsiy chatlar ===== */
        var CHAT_KEY = 'agmk_chats', CHAT = { cur: null, q: '', att: [] };
        function chatAll() { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function chatSave(a) { try { localStorage.setItem(CHAT_KEY, JSON.stringify(a)); return true; } catch (e) { alert("⚠️ Xotira to'ldi — xabar saqlanmadi."); return false; } }
        function chatId(p) { return typeof ctKey === 'function' ? ctKey(p) : 'n' + dbN(p.name); }
        // Chatdagi fayllar tozalanib ketmasligi uchun
        (function () { allImageObjects = agmkExtend('allImageObjects', '30-bosqich (3): Yozishmalar — Telegram uslubidagi shaxsiy chatlar · Chatdagi fayllar tozalanib ketmasligi uchun', allImageObjects, o => function () { const r = o.apply(this, arguments); try { Object.values(chatAll()).forEach(c => (c.msgs || []).forEach(m => (m.files || []).forEach(f => { if (f.ref) r.push({ src: 'idb:' + f.ref }); }))); } catch (e) {} return r; }); })();
        async function chatAddMsg(p, m) {
            const a = chatAll(), id = chatId(p);
            a[id] = a[id] || { p: { name: p.name, role: p.role || '', tabel: p.tabel || '', phone: p.phone || '' }, msgs: [] };
            const files = [];
            for (const f of (m.files || [])) {
                const ref = 'chat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
                try { await mediaSave(ref, f.blob, { id: ref, at: new Date().toISOString(), size: f.blob.size, name: f.name, mime: f.mime, chat: true }); files.push({ name: f.name, mime: f.mime, ref: ref, size: f.blob.size }); } catch (e) { files.push({ name: f.name, mime: f.mime }); }
            }
            a[id].msgs.push({ id: 'm' + Date.now().toString(36), me: m.me !== false, t: m.t || '', at: new Date().toISOString(), files: files, via: m.via || '' });
            a[id].last = Date.now();
            chatSave(a);
            if ($id('screen-chat') && $id('screen-chat').classList.contains('active')) chatRender();
        }
        function chatEnsureScreen() {
            if ($id('screen-chat')) return;
            const s = document.createElement('div'); s.id = 'screen-chat'; s.className = 'screen';
            s.innerHTML = `<div class="set-head" style="padding: 15px 15px 10px 15px; flex-shrink: 0; background-size: cover; background-position: center; border-bottom: 1px solid rgba(255,255,255,0.15);">
                    <div class="inner-header"><div class="back-btn" onclick="chatBack()">‹ Orqaga</div><h2 id="chatTitle">Yozishmalar</h2><div style="width: 60px;"></div></div>
                    <div id="chatHeadX"></div></div>
                <div class="set-body chat-body" id="chatBody" style="flex: 1; overflow-y: auto; padding: 12px 12px 12px; background-size: cover; background-position: center;"></div>
                <div id="chatComposer"></div>`;
            const prof = $id('screen-profile'); prof.parentNode.insertBefore(s, prof);
            // fonni boshqa sahifalardan olish
            try { const h = document.querySelector('.set-head[style*="background-image"]') || document.querySelector('#screen-settings .set-head'); const b = document.querySelector('#screen-settings .set-body'); if (h && h.style.backgroundImage) s.querySelector('.set-head').style.backgroundImage = h.style.backgroundImage; if (b && b.style.backgroundImage) s.querySelector('.set-body').style.backgroundImage = b.style.backgroundImage; } catch (e) {}
        }
        function openChats(p) { chatEnsureScreen(); CHAT.cur = p ? chatId(p) : null; if (p) { const a = chatAll(), id = chatId(p); if (!a[id]) { a[id] = { p: { name: p.name, role: p.role || '', tabel: p.tabel || '', phone: p.phone || '' }, msgs: [], last: Date.now() }; chatSave(a); } } openScreen('screen-chat'); chatRender(); }
        function chatBack() { if (CHAT.cur) { CHAT.cur = null; chatRender(); } else openScreen('screen-main'); }
        function chatIni(n) { const w = String(n || '?').replace(/^[A-ZА-Я][a-zа-я]?\.\s*/, '').split(/\s+/); return ((w[0] || '?')[0] + ((w[1] || '')[0] || '')).toUpperCase(); }
        function chatTime(iso) { const d = new Date(iso), t = new Date(); return d.toDateString() === t.toDateString() ? String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : fmtISO(iso.slice(0, 10)).slice(0, 5); }
        function chatRender() {
            const a = chatAll(), body = $id('chatBody'), hx = $id('chatHeadX'), cmp = $id('chatComposer');
            if (!CHAT.cur) {
                $id('chatTitle').innerText = 'Yozishmalar';
                hx.innerHTML = `<div class="chat-srch"><input class="search-box" id="chatQ" placeholder="🔎 Xodimni qidirish (ism, lavozim, tabel)..." value="${escapeHtml(CHAT.q)}" oninput="CHAT.q=this.value; chatListRender()"></div>`;
                cmp.innerHTML = ''; chatListRender(); return;
            }
            const c = a[CHAT.cur]; if (!c) { CHAT.cur = null; return chatRender(); }
            const p = c.p, ct = ctGet(p);
            $id('chatTitle').innerText = 'Suhbat';
            hx.innerHTML = `<div class="chat-hd"><div class="chat-av">${escapeHtml(chatIni(p.name))}</div><div class="chat-hn"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.role || '')}</small></div>
                <button class="chat-ib" title="Telegram" onclick="chatTg()">✈️</button><button class="chat-ib" title="Pochta" onclick="chatMail()">📧</button><button class="chat-ib" title="Qo'ng'iroq" onclick="chatCall()">📞</button><button class="chat-ib" title="Aloqa ma'lumotlari" onclick="chatContact()">✏️</button></div>`;
            let h = `<div class="chat-note">ℹ️ Xabarlar Telegram, pochta yoki SMS orqali yetkaziladi va shu yerda saqlanadi. Server ulanganda ilova ichida to'g'ridan-to'g'ri yetib boradi.${ct.tg || ct.email ? '<br>' + (ct.tg ? '✈️ ' + escapeHtml(ct.tg) + ' ' : '') + (ct.email ? '📧 ' + escapeHtml(ct.email) : '') : "<br>⚠️ Telegram / pochta kiritilmagan — ✏️ tugmasi orqali qo'shing."}</div>`;
            let lastD = '';
            (c.msgs || []).forEach(m => {
                const d = m.at.slice(0, 10); if (d !== lastD) { h += `<div class="chat-day">${escapeHtml(fmtISO(d))}</div>`; lastD = d; }
                h += `<div class="chat-m ${m.me ? 'me' : 'in'}">${m.t ? `<div class="chat-t">${escapeHtml(m.t)}</div>` : ''}${(m.files || []).map(f => `<div class="chat-f" onclick="chatOpenFile('${f.ref || ''}','${escapeHtml(f.name).replace(/'/g, '')}','${f.mime}')">${/pdf/.test(f.mime) ? '📄' : /word/.test(f.mime) ? '📝' : /sheet/.test(f.mime) ? '📊' : /image/.test(f.mime) ? '🖼' : '📎'} ${escapeHtml(f.name)}</div>`).join('')}<div class="chat-s">${m.via ? { telegram: '✈️ Telegram', email: '📧 Pochta', sms: '💬 SMS', any: '📤', save: '💾' }[m.via] || '' : ''} ${chatTime(m.at)} ✓</div></div>`;
            });
            if (!(c.msgs || []).length) h += `<div class="chat-empty">Hali yozishma yo'q. Xabar yozing yoki 📎 orqali akt / hujjat biriktiring.</div>`;
            body.innerHTML = h; setTimeout(() => { body.scrollTop = body.scrollHeight; }, 30);
            cmp.innerHTML = `${CHAT.att.length ? `<div class="chat-att">${CHAT.att.map((f, i) => `<span>📎 ${escapeHtml(f.name)} <b onclick="CHAT.att.splice(${i},1); chatRender()">✕</b></span>`).join('')}</div>` : ''}
                <div class="chat-cmp"><button class="chat-ib" onclick="chatAttach()">📎</button><textarea id="chatIn" rows="1" placeholder="Xabar yozing..." oninput="this.style.height='auto'; this.style.height=Math.min(120,this.scrollHeight)+'px'"></textarea><button class="chat-ib" onclick="startVoiceSearch('chatIn')" id="mic-chatIn">${typeof MIC_IMG !== 'undefined' ? MIC_IMG : '🎤'}</button><button class="chat-send" onclick="chatSend()">➤</button></div>`;
        }
        function chatListRender() {
            const a = chatAll(), body = $id('chatBody'), q = CHAT.q.trim();
            let h = '';
            const list = Object.entries(a).sort((x, y) => (y[1].last || 0) - (x[1].last || 0)).filter(([k, c]) => !q || dbN(c.p.name + ' ' + c.p.role).includes(dbN(q)));
            if (list.length) h += `<div class="inf-sec">💬 Suhbatlar</div>` + list.map(([k, c]) => { const m = (c.msgs || [])[c.msgs.length - 1]; return `<div class="chat-row" onclick="CHAT.cur='${k}'; chatRender()"><div class="chat-av">${escapeHtml(chatIni(c.p.name))}</div><div class="chat-rt"><b>${escapeHtml(c.p.name)}</b><small>${m ? escapeHtml((m.me ? 'Siz: ' : '') + (m.t || (m.files && m.files[0] ? '📎 ' + m.files[0].name : ''))) : escapeHtml(c.p.role || '')}</small></div><i>${m ? chatTime(m.at) : ''}</i></div>`; }).join('');
            const ppl = q ? pplFind(q).slice(0, 30) : [];
            if (q) h += `<div class="inf-sec">👥 Xodimlar</div>` + (ppl.map((p, i) => `<div class="chat-row" onclick="openChats(CHAT._p[${i}])"><div class="chat-av o">${escapeHtml(chatIni(p.name))}</div><div class="chat-rt"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.role)}${p.tabel ? ' · tabel ' + escapeHtml(p.tabel) : ''}</small></div><i>＋</i></div>`).join('') || '<div class="chat-empty">Topilmadi</div>');
            CHAT._p = ppl;
            if (!list.length && !q) h += `<div class="chat-empty">Yozishmalar hali yo'q.<br>Tepadagi qidiruvga xodim ismini yozing yoki AI'ga ayting: «Ey AI, @@N:394@@ga aktni Telegram orqali yubor».</div>`;
            body.innerHTML = h;
        }
        function chatP() { const c = chatAll()[CHAT.cur]; return c ? c.p : null; }
        async function chatContact() {
            const p = chatP(); if (!p) return; const c = ctGet(p);
            const e = await uiPrompt("📧 " + p.name + " — elektron pochta:", c.email || ''); if (e === null) return;
            const t = await uiPrompt("✈️ Telegram (@username yoki +998 telefon):", c.tg || ''); if (t === null) return;
            const ph = await uiPrompt("📞 Telefon raqami:", c.phone || ''); if (ph === null) return;
            ctSet(p, { email: e.trim(), tg: t.trim(), phone: ph.trim() }); chatRender(); showToast("✅ Aloqa ma'lumotlari saqlandi");
        }
        function tgLink(tg, text) { const s = String(tg || '').trim(); if (!s) return null; if (/^\+?\d[\d\s-]{7,}$/.test(s)) return 'https://t.me/+' + s.replace(/\D/g, ''); const u = s.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); return 'tg://resolve?domain=' + encodeURIComponent(u) + (text ? '&text=' + encodeURIComponent(text) : ''); }
        function chatOpenLink(u) { if (window.AgmkNative) AgmkNative.openExternal(u); else window.open(u.replace(/^tg:\/\/resolve\?domain=([^&]+)(&text=)?/, 'https://t.me/$1?text='), '_blank'); }
        async function chatTg() { const p = chatP(), c = ctGet(p); if (!c.tg) { await chatContact(); if (!ctGet(p).tg) return; } chatOpenLink(tgLink(ctGet(p).tg)); }
        async function chatMail() { const p = chatP(), c = ctGet(p); if (!c.email) { await chatContact(); if (!ctGet(p).email) return; } chatOpenLink('mailto:' + ctGet(p).email); }
        async function chatCall() { const p = chatP(), c = ctGet(p); if (!c.phone) { await chatContact(); if (!ctGet(p).phone) return; } chatOpenLink('tel:' + ctGet(p).phone.replace(/[^\d+]/g, '')); }
        async function chatAttach() {
            const opts = [];
            if ($id('ndPage') || ND.html) opts.push(['cur', '📄 Joriy akt (ekrandagi)']);
            const arch = (typeof ndAkts === 'function' ? ndAkts() : []).slice(0, 12); arch.forEach((x, i) => opts.push(['a' + i, '🗂 ' + x.title.slice(0, 60) + ' · ' + fmtISO((x.at || '').slice(0, 10))]));
            opts.push(['file', '📁 Telefondagi fayl']);
            let m = $id('chatAttM');
            if (!m) { m = document.createElement('div'); m.id = 'chatAttM'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="chatAttB"></div>'; document.body.appendChild(m); }
            $id('chatAttB').innerHTML = `<div class="pk-h"><b>📎 Biriktirish</b><span onclick="$id('chatAttM').classList.add('hidden')">✕</span></div><div class="pk-list">${opts.map(o => `<div class="pk-o" onclick="chatAttPick('${o[0]}')"><span class="pk-t">${escapeHtml(o[1])}</span></div>`).join('')}</div>
                <div class="pp-lbl" style="margin-top:8px">AKT FORMATI</div><div class="snd-chips" id="chatFm">${[['pdf', '📄 PDF'], ['docx', '📝 Word'], ['jpg', '🖼 JPG']].map(([k, t]) => `<i class="${(CHAT.fm || ['pdf']).includes(k) ? 'on' : ''}" onclick="CHAT.fm=(CHAT.fm||['pdf']).includes('${k}')?(CHAT.fm||['pdf']).filter(x=>x!=='${k}'):(CHAT.fm||['pdf']).concat('${k}'); if(!CHAT.fm.length) CHAT.fm=['pdf']; chatAttach()">${t}</i>`).join('')}</div>`;
            m.classList.remove('hidden');
        }
        async function chatAttPick(k) {
            $id('chatAttM').classList.add('hidden');
            if (k === 'file') { let i = $id('chatFileIn'); if (!i) { i = document.createElement('input'); i.type = 'file'; i.id = 'chatFileIn'; i.multiple = true; i.style.display = 'none'; i.onchange = () => { [...i.files].forEach(f => CHAT.att.push({ name: f.name, mime: f.type || 'application/octet-stream', blob: f })); i.value = ''; chatRender(); }; document.body.appendChild(i); } i.click(); return; }
            let html, title;
            if (k === 'cur') { const p = $id('ndPage'); html = p ? p.innerHTML : ND.html; title = typeof ndCurTitle === 'function' ? ndCurTitle() : 'Akt'; }
            else { const x = ndAkts()[+k.slice(1)]; if (!x) return; html = x.html; title = x.title + ' ' + fmtISO((x.at || '').slice(0, 10)); }
            showToast('⏳ Tayyorlanmoqda...');
            const files = await docMake(html, title, CHAT.fm || ['pdf']); files.forEach(f => CHAT.att.push(f)); chatRender();
        }
        function chatOpenFile(ref, name, mime) { if (!ref) return; mediaGetBlob(ref).then(b => { if (!b) { alert('Fayl topilmadi.'); return; } const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 4000); }); }
        async function chatSend(via) {
            const p = chatP(); if (!p) return;
            const t = ($id('chatIn').value || '').trim(), files = CHAT.att.slice();
            if (!t && !files.length) return;
            if (!via) {
                const c = ctGet(p);
                const opts = [['telegram', '✈️ Telegram orqali' + (c.tg ? ' (' + c.tg + ')' : '')], ['email', '📧 Pochta orqali' + (c.email ? ' (' + c.email + ')' : '')]].concat(files.length ? [] : [['sms', '💬 SMS' + (c.phone ? ' (' + c.phone + ')' : '')]]).concat([['save', '💾 Faqat shu yerda saqlash']]);
                let m = $id('chatViaM');
                if (!m) { m = document.createElement('div'); m.id = 'chatViaM'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="chatViaB"></div>'; document.body.appendChild(m); }
                $id('chatViaB').innerHTML = `<div class="pk-h"><b>➤ Qanday yetkazilsin?</b><span onclick="$id('chatViaM').classList.add('hidden')">✕</span></div><div class="pk-list">${opts.map(o => `<div class="pk-o" onclick="$id('chatViaM').classList.add('hidden'); chatSend('${o[0]}')"><span class="pk-t">${escapeHtml(o[1])}</span></div>`).join('')}</div>`;
                m.classList.remove('hidden'); return;
            }
            const c = ctGet(p);
            if (via === 'telegram' && !c.tg && !files.length) { await chatContact(); if (!ctGet(p).tg) return; }
            if (via === 'email' && !c.email) { await chatContact(); if (!ctGet(p).email) return; }
            if (via === 'sms' && !c.phone) { await chatContact(); if (!ctGet(p).phone) return; }
            $id('chatIn').value = ''; CHAT.att = [];
            await chatAddMsg(p, { me: true, t: t, files: files, via: via });
            if (via === 'save') return;
            const cc = ctGet(p);
            if (files.length) await docShare(files, { via: via, to: p, subject: files[0].name.replace(/\.\w+$/, '').replace(/_/g, ' '), text: t || mailText(p, files.map(f => f.name).join(', '), 'uz') });
            else if (via === 'telegram') chatOpenLink(tgLink(cc.tg, t));
            else if (via === 'email') chatOpenLink('mailto:' + cc.email + '?subject=' + encodeURIComponent('AGMK-STTB') + '&body=' + encodeURIComponent(t));
            else if (via === 'sms') chatOpenLink('sms:' + cc.phone.replace(/[^\d+]/g, '') + '?body=' + encodeURIComponent(t));
        }
        // Bosh sahifaga "Yozishmalar" kartasi
        (function () {
            const list = $id('main-card-list'); if (!list || list.querySelector('[data-chat]')) return;
            const d = document.createElement('div'); d.className = 'btn-card'; d.setAttribute('data-chat', '1'); d.setAttribute('data-search', 'yozishmalar chat xabar suhbat telegram pochta yuborish');
            d.onclick = () => openChats(); d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">💬</span><span class="btn-text">Yozishmalar</span></div><span class="btn-arrow">›</span>`;
            const first = list.querySelector('.btn-card'); if (first && first.nextSibling) list.insertBefore(d, first.nextSibling); else list.appendChild(d);
        })();
        try { if (typeof I18N_D !== 'undefined') Object.assign(I18N_D, { 'Yozishmalar': ['Messages', 'Сообщения', '消息'], 'Suhbat': ['Chat', 'Чат', '聊天'], '💬 Suhbatlar': ['💬 Chats', '💬 Чаты', '💬 聊天'], '👥 Xodimlar': ['👥 Staff', '👥 Сотрудники', '👥 员工'] }); } catch (e) {}

