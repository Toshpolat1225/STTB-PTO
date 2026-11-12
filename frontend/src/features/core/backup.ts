
        // =====================================================================
        // v3.0 — 💾 TO'LIQ ZAXIRA NUSXA (hamma narsa: baza, aktlar, hisobotlar, MTTB, polojeniya, sozlamalar, rasmlar va fayllar)
        //  • Fayl: .agmkzaxira — ichida ZIP (data.json + media/*). Parol berilsa AES-256-GCM bilan shifrlanadi
        //    (PBKDF2-SHA256, 200 000 takror) — fayl begona qo'lga tushsa ham o'qib bo'lmaydi.
        //  • Faylga KIRMAYDI: server sessiyasi/tokenlari, bulut AI kaliti (xavfsizlik).
        //  • Tiklash: eski (2.x) «Zaxira nusxa» JSON fayli ham qabul qilinadi.
        // =====================================================================
        var BK_MAGIC = 'AGMKBK1', BK_SKIP = /(^|_)(session|token|refresh|jwt)(_|$)|^agmk_big_keys$|^agmk_ai_cfg|^agmk_aic/i;
        var BKP = {};
        function bkCrcTable() { if (BKP.crc) return BKP.crc; const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return (BKP.crc = t); }
        function bkCrc(u8) { const t = bkCrcTable(); let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = t[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
        // ZIP (siqmasdan, «stored») — katta fayllar ham xotirada bitta satrga aylanmaydi
        function bkZip(files) {
            const parts = [], cen = []; let off = 0; const enc = new TextEncoder();
            const u16 = v => new Uint8Array([v & 255, (v >>> 8) & 255]), u32 = v => new Uint8Array([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]);
            for (const f of files) {
                const nm = enc.encode(f.name), crc = bkCrc(f.data), sz = f.data.length;
                const lh = [u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0), nm];
                const lhLen = lh.reduce((a, x) => a + x.length, 0); parts.push(...lh, f.data);
                cen.push([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off), nm]);
                off += lhLen + sz;
            }
            const cd = [].concat(...cen), cdLen = cd.reduce((a, x) => a + x.length, 0);
            parts.push(...cd, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdLen), u32(off), u16(0));
            return new Blob(parts, { type: 'application/zip' });
        }
        async function bkKey(pw, salt) {
            const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
            return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        }
        function bkAsk(title, note, confirm2) {
            return new Promise(res => {
                BKP.res = res;
                mdl('bkPw', `<div class="px-h"><b>${escapeHtml(title)}</b><button class="mini-btn" onclick="mdlClose('bkPw'); BKP.res(null)">✕</button></div>
                    <div class="nd-tip">${note}</div>
                    <input type="password" id="bkPw1" placeholder="Parol" autocomplete="new-password" style="width:100%;margin:6px 0">
                    ${confirm2 ? '<input type="password" id="bkPw2" placeholder="Parolni takrorlang" autocomplete="new-password" style="width:100%;margin:6px 0">' : ''}
                    <div class="pk-btns">${confirm2 ? '<button onclick="mdlClose(\'bkPw\'); BKP.res(\'\')">Parolsiz</button>' : ''}<button class="pr" onclick="bkAskOk(${confirm2 ? 1 : 0})">Davom etish</button></div>`, true);
                setTimeout(() => { try { $id('bkPw1').focus(); } catch (e) {} }, 100);
            });
        }
        function bkAskOk(two) { const a = $id('bkPw1').value, b = two ? $id('bkPw2').value : a; if (two && a.length < 6) { alert('Parol kamida 6 belgi boʻlsin (yoki «Parolsiz»).'); return; } if (a !== b) { alert('Parollar mos emas.'); return; } mdlClose('bkPw'); BKP.res(a); }
        async function bkMediaAll() {
            let metas = [], blobs = [];
            try { metas = await mediaTx(['meta'], 'readonly', tx => tx.objectStore('meta').getAll()) || []; blobs = await mediaTx(['blobs'], 'readonly', tx => tx.objectStore('blobs').getAll()) || []; } catch (e) { console.error('zaxira media', e); }
            const M = new Map(metas.map(m => [m.id, m])); return blobs.filter(b => b && b.id && b.blob).map(b => ({ id: b.id, blob: b.blob, meta: M.get(b.id) || { id: b.id } }));
        }
        async function bkExport() {
            if (!(currentUser && currentUser.tabel)) { alert('Avval tizimga kiring.'); return; }
            const pw = await bkAsk('💾 Toʻliq zaxira nusxa', 'Faylga ilovadagi <b>hamma maʼlumot</b> yoziladi: vagonlar, xodimlar, aktlar, hisobotlar, MTTB, polojeniya, sozlamalar, rasmlar va fayllar. <b>Parol qoʻying</b> — fayl shifrlanadi va parolsiz ochilmaydi. Parolni unutmang: uni tiklab boʻlmaydi.', true);
            if (pw === null) return;
            showToast('⏳ Zaxira tayyorlanmoqda…');
            const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || BK_SKIP.test(k)) continue; const v = localStorage.getItem(k); if (v !== null) ls[k] = v; }
            try { if (typeof agmkStoreInfo === 'function') agmkStoreInfo().keys.forEach(k => { if (!BK_SKIP.test(k) && !(k in ls)) { const v = localStorage.getItem(k); if (v !== null) ls[k] = v; } }); } catch (e) {}
            const media = await bkMediaAll(), enc = new TextEncoder(), files = [];
            const info = { v: 1, kind: 'agmk-full-backup', app: typeof AGMK_VERSION !== 'undefined' ? AGMK_VERSION : '', at: new Date().toISOString(), by: { tabel: meTabel(), name: currentUser.name || '' }, keys: Object.keys(ls).length, media: media.length };
            files.push({ name: 'data.json', data: enc.encode(JSON.stringify({ info: info, ls: ls })) });
            files.push({ name: 'media.json', data: enc.encode(JSON.stringify(media.map(m => m.meta))) });
            for (let i = 0; i < media.length; i++) files.push({ name: 'media/' + i, data: new Uint8Array(await media[i].blob.arrayBuffer()), id: media[i].id });
            const idx = media.map((m, i) => ({ i: i, id: m.id, type: m.blob.type || '' })); files.push({ name: 'media_idx.json', data: enc.encode(JSON.stringify(idx)) });
            let blob = bkZip(files);
            if (pw) { const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await bkKey(pw, salt); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, await blob.arrayBuffer()); blob = new Blob([enc.encode(BK_MAGIC), salt, iv, new Uint8Array(ct)], { type: 'application/octet-stream' }); }
            const name = 'agmk_toliq_zaxira_' + todayISO() + (pw ? '_shifrlangan' : '') + '.agmkzaxira';
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 60000);
            try { aiLog('Toʻliq zaxira nusxa olindi: ' + info.keys + ' ta yozuv, ' + info.media + ' ta rasm/fayl' + (pw ? ' (shifrlangan)' : '')); } catch (e) {}
            BKP.last = { size: blob.size, info: info };
            alert('✅ Toʻliq zaxira nusxa saqlandi: ' + name + '\n' + info.keys + ' ta maʼlumot boʻlimi, ' + info.media + ' ta rasm/fayl, ' + (blob.size / 1048576).toFixed(1) + ' MB.' + (pw ? '\n🔒 Shifrlangan — parolsiz ochilmaydi.' : '\n⚠️ Parolsiz — faylni ishonchli joyda saqlang.'));
        }
        async function bkImportFile(file) {
            let u8 = new Uint8Array(await file.arrayBuffer());
            const head = new TextDecoder().decode(u8.slice(0, 7));
            if (head === BK_MAGIC) {
                const pw = await bkAsk('🔒 Shifrlangan zaxira', 'Zaxira nusxa olinganda qoʻyilgan parolni kiriting.', false); if (pw === null) return;
                try { const key = await bkKey(pw, u8.slice(7, 23)); u8 = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.slice(23, 35) }, key, u8.slice(35))); }
                catch (e) { alert('❌ Parol notoʻgʻri (yoki fayl buzilgan).'); return; }
            }
            if (!(u8[0] === 0x50 && u8[1] === 0x4B)) { alert('Bu toʻliq zaxira fayli emas.'); return; }
            const z = await hsZipFiles(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)); if (!z['data.json']) { alert('Zaxira faylida maʼlumot topilmadi.'); return; }
            const D = JSON.parse(new TextDecoder().decode(await z['data.json']())), I = D.info || {};
            const metas = z['media.json'] ? JSON.parse(new TextDecoder().decode(await z['media.json']())) : [], idx = z['media_idx.json'] ? JSON.parse(new TextDecoder().decode(await z['media_idx.json']())) : [];
            if (!(await uiConfirm('Zaxira: ' + fmtDT(I.at) + ', ' + (I.by ? I.by.name + ' (' + I.by.tabel + ')' : '') + ', versiya ' + (I.app || '?') + '\n' + Object.keys(D.ls || {}).length + ' ta maʼlumot boʻlimi, ' + idx.length + ' ta rasm/fayl.\n\nDiqqat: shu qurilmadagi maʼlumotlar zaxiradagisi bilan ALMASHTIRILADI. Davom etasizmi?'))) return;
            let nm = 0; const MM = new Map(metas.map(m => [m && m.id, m]));
            for (const x of idx) { try { const d = await z['media/' + x.i](); const b = new Blob([d], { type: x.type || (MM.get(x.id) || {}).mime || '' }); await mediaSave(x.id, b, MM.get(x.id) || { id: x.id, at: new Date().toISOString(), size: b.size }); nm++; } catch (e) { console.error('media', x.id, e); } }
            let nk = 0; for (const [k, v] of Object.entries(D.ls || {})) { if (BK_SKIP.test(k)) continue; try { localStorage.setItem(k, v); nk++; } catch (e) { console.error('ls', k, e); } }
            try { aiLog('Toʻliq zaxiradan tiklandi: ' + nk + ' ta yozuv, ' + nm + ' ta rasm/fayl'); } catch (e) {}
            await new Promise(r => setTimeout(r, 900)); // omborga yozilishi uchun
            alert('✅ Tiklandi: ' + nk + ' ta maʼlumot boʻlimi, ' + nm + ' ta rasm/fayl. Ilova qayta ochiladi — oʻz tabel raqamingiz va parolingiz bilan kiring.');
            location.reload();
        }

