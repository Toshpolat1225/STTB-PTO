        // =====================================================================
        // v2.4 — 📦 HOLATNI KO'CHIRISH PAKETI (.agmk)
        //  Admin tanlagan ma'lumotlar bitta faylga, parol bilan shifrlangan holda (AES-GCM, PBKDF2 200 000).
        //  Hech qachon kirmaydi: parollar va hisoblar, AI kaliti, server sozlamasi, yozishmalar, MM hujjatlari, rollar.
        //  Import: oldin nima qo'shilishi / almashtirilishi ko'rsatiladi; qabul qiluvchining o'z ma'lumotlari o'chmaydi.
        // =====================================================================
        var BN_GROUPS = [
            { k: 'tex', ic: '🚃', t: 'Texnika bazasi (vagon, lokomotiv, avto, yoʻl, infratuzilma) va harakat tarkibi', keys: ['agmk_harakat', 'agmk_dr_months', 'agmk_infra_geo'], db: 'tex', def: true },
            { k: 'xod', ic: '👷', t: 'Xodimlar roʻyxati va shtat (tabel, lavozim — parollarsiz)', keys: ['agmk_shtat_list', 'agmk_shtat_tree', 'agmk_shtat_rahbar'], db: 'xod', def: false, warn: true },
            { k: 'nd', ic: '📚', t: 'Normativ hujjatlar va imzo chekuvchilar', keys: ['agmk_nd_docs', 'agmk_nd_signers', 'agmk_nd_sign41'], def: true },
            { k: 'akt', ic: '🗂', t: 'Aktlar arxivi', keys: ['agmk_nd_akts'], def: false },
            { k: 'hs', ic: '📊', t: 'Forma-30 lar va hisobot sozlamalari (shablonlar)', keys: ['agmk_f30', 'agmk_hisob_set'], media: 'f30', def: true },
            { k: 'map', ic: '🗺', t: 'Xarita: sxema bogʻlanishi, GPS qurilmalari', keys: ['agmk_map_georef', 'agmk_map_yig', 'agmk_gps_dev'], def: true },
            { k: 'home', ic: '🧩', t: 'Bosh sahifa boʻlimlari sozlamasi', keys: ['agmk_home_vis'], def: true },
            { k: 'fx', ic: '🧮', t: 'Hisob-kitob formulalari', keys: ['agmk_formulas'], def: true },
            { k: 'img', ic: '🖼', t: 'Texnika rasmlari (fayl katta boʻladi)', media: 'img', def: false }
        ];
        var BN_NEVER = /accounts|pw|session|current_user|ai_cfg|sync_|chats|sec_|login_lock|roles|mm\b|agmk_mm|outbox|send_log/;
        function bnB64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); }
        function bnU8(b64) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
        async function bnKey(pw, salt) { const S = window.crypto && crypto.subtle; if (!S) throw new Error('Bu qurilmada shifrlash moduli yoʻq'); const base = await S.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']); return S.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
        async function bnGzip(u8, un) { if (typeof CompressionStream === 'undefined') return { u8: u8, z: false }; const st = new Blob([u8]).stream().pipeThrough(un ? new DecompressionStream('gzip') : new CompressionStream('gzip')); return { u8: new Uint8Array(await new Response(st).arrayBuffer()), z: true }; }
        function bnOpen() {
            if (!isAdminReal()) { alert('Paketni faqat administrator tayyorlaydi.'); return; }
            const E = escapeHtml;
            mdl('bnModal', `<div class="px-h"><b>📦 Holatni koʻchirish paketi</b><button class="mini-btn" onclick="mdlClose('bnModal')">✕</button></div>
                <div class="nd-tip">Ilovani qanday holatga keltirgan boʻlsangiz — shu holatni boshqa telefonga oʻtkazish uchun. Paketni APK bilan birga yuboring; qabul qiluvchi «📦 Paketni ochish» orqali parol bilan ochadi.<br>🔒 Hech qachon kirmaydi: parollar va hisoblar, AI kaliti, server sozlamasi, yozishmalar, MM hujjatlari, rollar.</div>
                <div class="bn-list">${BN_GROUPS.map(g => `<label class="aic-chk"><input type="checkbox" data-bn="${g.k}" ${g.def ? 'checked' : ''}> ${g.ic} ${E(g.t)}${g.warn ? ' <small class="hs-r">⚠️ shaxsiy maʼlumot</small>' : ''}</label>`).join('')}</div>
                <div class="nd-2"><div class="nd-f"><label>PAROL (kamida 6 belgi)</label><input id="bnPw" type="password" autocomplete="new-password"></div><div class="nd-f"><label>PAROLNI TAKRORLANG</label><input id="bnPw2" type="password" autocomplete="new-password"></div></div>
                <div class="nd-tip">Parolni fayl bilan bitta xabarda yubormang — ogʻzaki yoki boshqa yoʻl bilan ayting.</div>
                <button class="action-btn" onclick="bnExport()">📦 Paketni tayyorlash</button>`);
        }
        async function bnCollect(sel) {
            const data = { keys: {}, db: null, media: {} };
            sel.forEach(k => { const g = BN_GROUPS.find(x => x.k === k); (g.keys || []).forEach(key => { if (BN_NEVER.test(key)) return; const v = localStorage.getItem(key); if (v !== null) data.keys[key] = v; }); });
            if (sel.includes('tex') || sel.includes('xod')) {
                const db = JSON.parse(localStorage.getItem(DB_KEY) || 'null') || { vagonlar: vagonlarData, sections: sectionItemsDB };
                const out = {};
                if (sel.includes('tex')) { out.vagonlar = sel.includes('img') ? db.vagonlar : (typeof stripImagesForBundle === 'function' ? stripImagesForBundle({ vagonlar: db.vagonlar, sections: {} }).vagonlar : db.vagonlar); out.sections = Object.assign({}, db.sections || {}); delete out.sections.xodim; }
                if (sel.includes('xod')) { out.sections = out.sections || {}; out.sections.xodim = (db.sections || {}).xodim || []; }
                data.db = out;
            }
            // Forma-30 fayllari (IndexedDB)
            if (sel.includes('hs')) { const f = kvGet(HS_F30_KEY, {}); for (const c of Object.keys(f)) for (const r of f[c]) for (const ref of [r.ref, r.fref]) { if (!ref || data.media[ref]) continue; try { const b = await mediaGetBlob(ref); if (b) data.media[ref] = { t: b.type || '', d: bnB64(new Uint8Array(await b.arrayBuffer())) }; } catch (e) {} } }
            return data;
        }
        async function bnExport() {
            const sel = [...document.querySelectorAll('#bnModal [data-bn]')].filter(x => x.checked).map(x => x.dataset.bn);
            const pw = $id('bnPw').value, pw2 = $id('bnPw2').value;
            if (!sel.length) { alert('Kamida bitta boʻlimni tanlang.'); return; }
            if (pw.length < 6) { alert('Parol kamida 6 belgi boʻlsin.'); return; } if (pw !== pw2) { alert('Parollar mos emas.'); return; }
            if (sel.includes('xod') && !(await uiConfirm('⚠️ Paketga xodimlarning roʻyxati (F.I.Sh., tabel, lavozim) kiradi. Faylni faqat ishonchli yoʻl bilan (ShareIt, ofis tarmogʻi) yuboring. Davom etilsinmi?'))) return;
            mdlClose('bnModal'); showToast('⏳ Paket tayyorlanmoqda...');
            try {
                const data = await bnCollect(sel);
                const raw = new TextEncoder().encode(JSON.stringify(data)); const z = await bnGzip(raw);
                const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await bnKey(pw, salt);
                const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, z.u8));
                const pkg = { app: 'AGMK-STTB PTO', v: 1, at: new Date().toISOString(), by: authorStr(), byT: meTabel(), ver: (window.AgmkNative && AgmkNative.version ? AgmkNative.version() : ''), parts: sel, z: z.z, salt: bnB64(salt), iv: bnB64(iv), data: bnB64(ct) };
                const name = 'agmk-holat-' + new Date().toISOString().slice(0, 10) + '.agmk';
                docDownload([{ name: name, mime: 'application/octet-stream', blob: new Blob([JSON.stringify(pkg)], { type: 'application/octet-stream' }) }]);
                try { if (typeof aiLog === 'function') aiLog('Holat paketi tayyorlandi: ' + sel.join(', ')); } catch (e) {}
                showToast('📦 Paket tayyor: ' + name);
            } catch (e) { console.error(e); alert('⚠️ Paket tayyorlanmadi: ' + agmkErrUz(e)); }
        }
        // ---------- Ochish (import) ----------
        function bnMerge(a, b) {
            if (Array.isArray(a) && Array.isArray(b) && b.every(x => x && typeof x === 'object' && 'id' in x)) { const m = new Map(a.filter(x => x && typeof x === 'object' && 'id' in x).map(x => [String(x.id), x])); const extra = a.filter(x => !(x && typeof x === 'object' && 'id' in x)); b.forEach(x => m.set(String(x.id), x)); return extra.concat([...m.values()]); }
            if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) { const o = Object.assign({}, a); Object.keys(b).forEach(k => { o[k] = (k in a) ? bnMerge(a[k], b[k]) : b[k]; }); return o; }
            return b;
        }
        function bnPick(inp) { const f = inp.files && inp.files[0]; inp.value = ''; if (f) bnImport(f); }
        async function bnImport(file) {
            let pkg; try { pkg = JSON.parse(await file.text()); } catch (e) { alert('⚠️ Bu AGMK paketi emas.'); return; }
            if (!pkg || pkg.app !== 'AGMK-STTB PTO' || !pkg.data) { alert('⚠️ Bu AGMK paketi emas.'); return; }
            const pw = await uiPrompt('🔑 Paket paroli:', ''); if (!pw) return;
            let data; try { const key = await bnKey(pw, bnU8(pkg.salt)); const pt = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bnU8(pkg.iv) }, key, bnU8(pkg.data))); const u = pkg.z ? (await bnGzip(pt, true)).u8 : pt; data = JSON.parse(new TextDecoder().decode(u)); }
            catch (e) { alert('❌ Parol notoʻgʻri yoki paket shikastlangan (oʻzgartirilgan). Ochilmadi.'); return; }
            const L = [];
            if (data.db && data.db.vagonlar) { const cur = new Set(vagonlarData.map(v => String(v.id))); const n = data.db.vagonlar.filter(v => !cur.has(String(v.id))).length; L.push('🚃 Texnika: ' + data.db.vagonlar.length + ' ta (' + n + ' ta yangi, qolgani yangilanadi)'); }
            if (data.db && data.db.sections && data.db.sections.xodim) L.push('👷 Xodimlar roʻyxati: ' + data.db.sections.xodim.length + ' ta yozuv');
            Object.keys(data.keys || {}).forEach(k => { if (BN_NEVER.test(k)) return; const g = BN_GROUPS.find(x => (x.keys || []).includes(k)); L.push((g ? g.ic : '•') + ' ' + k.replace('agmk_', '') + (localStorage.getItem(k) !== null ? ' — birlashtiriladi' : ' — qoʻshiladi')); });
            const nm = Object.keys(data.media || {}).length; if (nm) L.push('📎 Fayllar: ' + nm + ' ta');
            if (!(await uiConfirm('📦 Paket: ' + (pkg.by || '') + ' · ' + fmtDT(pkg.at) + '\n\n' + L.join('\n') + '\n\nSizning oʻz maʼlumotlaringiz oʻchmaydi. Qoʻllansinmi?'))) return;
            try {
                Object.keys(data.keys || {}).forEach(k => { if (BN_NEVER.test(k)) return; let nv = data.keys[k]; const ov = localStorage.getItem(k); if (ov !== null) { try { nv = JSON.stringify(bnMerge(JSON.parse(ov), JSON.parse(nv))); } catch (e) {} } localStorage.setItem(k, nv); try { if (typeof KV_SYNC !== 'undefined' && KV_SYNC.keys.includes(k)) KV_SYNC.dirty = true; } catch (e) {} });
                if (data.db) { const db = JSON.parse(localStorage.getItem(DB_KEY) || 'null') || { vagonlar: vagonlarData, sections: sectionItemsDB }; if (data.db.vagonlar) db.vagonlar = bnMerge(db.vagonlar || [], data.db.vagonlar); if (data.db.sections) db.sections = bnMerge(db.sections || {}, data.db.sections); localStorage.setItem(DB_KEY, JSON.stringify(db)); }
                for (const ref of Object.keys(data.media || {})) { try { const m = data.media[ref]; await mediaSave(ref, new Blob([bnU8(m.d)], { type: m.t }), { id: ref, at: new Date().toISOString() }); mediaKeep(ref); } catch (e) {} }
                try { if (typeof aiLog === 'function') aiLog('Holat paketi ochildi: ' + (pkg.parts || []).join(', ')); } catch (e) {}
                alert('✅ Paket qoʻllandi. Ilova qayta yuklanadi.'); bnReload();
            } catch (e) { console.error(e); alert('⚠️ Qoʻllashda xato: ' + agmkErrUz(e)); }
        }
        (function () {
            const add = () => {
                try {
                    const card = [...document.querySelectorAll('.btn-card[onclick="exportBundleFile()"]')][0];
                    if (card && !$id('bnCardE')) card.insertAdjacentHTML('afterend', `<div class="btn-card set-admin" id="bnCardE" onclick="bnOpen()"><div class="btn-card-content"><span class="btn-icon">📦</span><span class="btn-text">Holatni koʻchirish paketi (.agmk)<span class="set-sub">Barcha sozlama va maʼlumotlarni parolli faylga — boshqa telefonga oʻtkazish</span></span></div><span class="btn-arrow">›</span></div>
                        <label class="btn-card" id="bnCardI"><div class="btn-card-content"><span class="btn-icon">📥</span><span class="btn-text">Paketni ochish (.agmk)<span class="set-sub">Administrator yuborgan paketni parol bilan qoʻllash</span></span></div><span class="btn-arrow">›</span><input type="file" style="display:none" onchange="bnPick(this)"></label>`);
                    const lk = $id('lockViewLogin'); if (lk && !$id('bnLock')) lk.insertAdjacentHTML('beforeend', `<label id="bnLock" class="bn-lock">📥 Paketdan tiklash (.agmk)<input type="file" style="display:none" onchange="bnPick(this)"></label>`);
                } catch (e) {}
            };
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add(); setTimeout(add, 1500);
        })();
        function bnReload() { location.reload(); }

