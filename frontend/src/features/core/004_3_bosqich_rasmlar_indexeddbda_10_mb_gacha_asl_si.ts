        // =====================================================================
        // YANGI (3-bosqich): rasmlar IndexedDB'da (10 MB gacha asl sifat),
        // albom, rasm ko'rish oynasi (kattalashtirish, varaqlash), xabarcha.
        // =====================================================================
        const MEDIA_DB = 'agmk_media';
        const MAX_ORIGINAL = 10 * 1024 * 1024;   // 10 MB gacha — o'zgarishsiz saqlanadi
        const MAX_CANVAS_PX = 16000000;          // telefon canvas chegarasi (~16 Mpx)
        const THUMBS = new Map();
        const MEDIA_META = new Map();
        const IMG_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0f172a"/><text x="50" y="47" font-size="30" text-anchor="middle">🖼</text><text x="50" y="72" font-size="10" fill="#94a3b8" text-anchor="middle">rasm yo\'q</text></svg>');
        let mediaDbPromise = null;

        function openMediaDB() {
            if (mediaDbPromise) return mediaDbPromise;
            mediaDbPromise = new Promise((res, rej) => {
                try {
                    if (!window.indexedDB) { rej(new Error('no-idb')); return; }
                    const r = indexedDB.open(MEDIA_DB, 1);
                    r.onupgradeneeded = () => {
                        const db = r.result;
                        if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs', { keyPath: 'id' });
                        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'id' });
                    };
                    r.onsuccess = () => res(r.result);
                    r.onerror = () => rej(r.error || new Error('idb-error'));
                    r.onblocked = () => rej(new Error('idb-blocked'));
                } catch (e) { rej(e); }
            });
            mediaDbPromise.catch(() => {});
            return mediaDbPromise;
        }
        function mediaTx(stores, mode, fn) {
            return openMediaDB().then(db => new Promise((res, rej) => {
                const tx = db.transaction(stores, mode);
                let out;
                const r = fn(tx);
                if (r) r.onsuccess = () => { out = r.result; };
                tx.oncomplete = () => res(out);
                tx.onerror = () => rej(tx.error);
                tx.onabort = () => rej(tx.error || new Error('abort'));
            }));
        }
        function mediaSave(id, blob, meta) {
            return mediaTx(['blobs', 'meta'], 'readwrite', tx => {
                tx.objectStore('blobs').put({ id: id, blob: blob });
                tx.objectStore('meta').put(meta);
            });
        }
        function mediaGetBlob(id) { return mediaTx(['blobs'], 'readonly', tx => tx.objectStore('blobs').get(id)).then(r => r ? r.blob : null); }
        function mediaDelete(id) { return mediaTx(['blobs', 'meta'], 'readwrite', tx => { tx.objectStore('blobs').delete(id); tx.objectStore('meta').delete(id); }); }

        function imgRef(src) { return (typeof src === 'string' && src.indexOf('idb:') === 0) ? src.slice(4) : null; }
        // Albom va kichik ko'rinishlar uchun rasm manzili (asl rasm emas, kichraytirilgan nusxa)
        function imgSrc(x) {
            const s = typeof x === 'string' ? x : (x && x.src);
            if (!s) return IMG_PLACEHOLDER;
            const ref = imgRef(s);
            if (ref) return THUMBS.get(ref) || IMG_PLACEHOLDER;
            return s;
        }

        function decodeViaImg(blob) {
            return new Promise((res, rej) => {
                const u = URL.createObjectURL(blob);
                const im = new Image();
                im.onload = () => res({ src: im, w: im.naturalWidth, h: im.naturalHeight, close: () => URL.revokeObjectURL(u) });
                im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('decode')); };
                im.src = u;
            });
        }
        function decodeImage(blob) {
            if (window.createImageBitmap) {
                return createImageBitmap(blob, { imageOrientation: 'from-image' })
                    .then(bm => ({ src: bm, w: bm.width, h: bm.height, close: () => { try { bm.close(); } catch (e) {} } }))
                    .catch(() => decodeViaImg(blob));
            }
            return decodeViaImg(blob);
        }
        function drawToCanvas(src, w, h) {
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
            ctx.drawImage(src, 0, 0, w, h);
            return c;
        }
        function canvasToBlob(c, q) { return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', q)); }
        function makeThumb(src, w, h) {
            const M = 360, s = Math.min(1, M / Math.max(w, h));
            return drawToCanvas(src, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))).toDataURL('image/jpeg', 0.78);
        }
        // 10 MB dan katta rasm: yuqori sifatda (JPEG 0.92) kichraytiriladi, 10 MB ichiga sig'guncha
        async function shrinkToLimit(src, w, h) {
            let scale = Math.min(1, Math.sqrt(MAX_CANVAS_PX / (w * h)));
            let q = 0.92;
            for (let i = 0; i < 8; i++) {
                const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
                const b = await canvasToBlob(drawToCanvas(src, cw, ch), q);
                if (b && b.size <= MAX_ORIGINAL) return { blob: b, w: cw, h: ch };
                if (!b) { scale *= 0.8; continue; }
                scale *= Math.min(0.95, Math.sqrt((MAX_ORIGINAL * 0.85) / b.size));
            }
            throw new Error('shrink');
        }

        async function storeImageBlob(blob, when, by) {
            await openMediaDB();
            let d;
            try { d = await decodeImage(blob); }
            catch (e) {
                // HEIC (iPhone / Samsung "yuqori samarali" rasm) — JPG ga o'giriladi
                if (!(await looksHeic(blob))) { const er = new Error('decode'); er.code = 'decode'; throw er; }
                blob = await convertHeic(blob);
                try { d = await decodeImage(blob); } catch (e2) { const er = new Error('decode'); er.code = 'decode'; throw er; }
            }
            try {
                let out = blob, w = d.w, h = d.h;
                let type = blob.type || 'image/jpeg';
                if (blob.size > MAX_ORIGINAL) { const r = await shrinkToLimit(d.src, d.w, d.h); out = r.blob; w = r.w; h = r.h; type = 'image/jpeg'; }
                const thumb = makeThumb(d.src, d.w, d.h);
                const id = 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                const meta = { id: id, thumb: thumb, w: w, h: h, size: out.size, origSize: blob.size, type: type, at: when || new Date().toISOString(), by: by || authorStr() };
                await mediaSave(id, out, meta);
                THUMBS.set(id, thumb); MEDIA_META.set(id, meta);
                return id;
            } finally { if (d.close) d.close(); }
        }

        // Barcha rasm yuklash tugmalari shu funksiyani chaqiradi. Natija: "idb:<id>" (rasm IndexedDB'da).
        // IndexedDB ishlamaydigan dasturda — eski usulda (siqilgan holda) saqlanadi.
        function processImage(file, cb) {
            storeImageBlob(file).then(id => cb('idb:' + id)).catch(err => {
                if (err && err.code === 'heic-offline') {
                    alert("🖼 Bu rasm HEIC formatida — telefon uni ocha olmadi. Kamera sozlamasida rasm formatini JPG («Eng mos» / «Most compatible») qilib qayta oling yoki rasmni JPG qilib saqlab yuboring.");
                    cb(null);
                    return;
                }
                if (err && err.code === 'decode') {
                    alert("⚠️ \"" + (file.name || 'rasm') + "\" faylini ochib bo'lmadi. Fayl buzilgan yoki bu format qo'llab-quvvatlanmaydi. JPG, PNG yoki HEIC rasm tanlang.");
                    cb(null);
                    return;
                }
                legacyProcessImage(file, src => cb(src));
            });
        }

        function dataURLtoBlob(u) {
            const parts = u.split(',');
            const mime = (parts[0].match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
            const bin = atob(parts[1] || '');
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            return new Blob([arr], { type: mime });
        }

        // Ma'lumotlar ichidagi barcha rasm yozuvlari (vagon, seh, uskuna, xodim surati, spravka)
        function allImageObjects() {
            const out = [];
            const addArr = a => (a || []).forEach(x => { if (x && typeof x === 'object') out.push(x); });
            (vagonlarData || []).forEach(v => { addArr(v.gallery); addArr(v.rahbarImgs); });
            Object.keys(sectionItemsDB || {}).forEach(t => Object.keys(sectionItemsDB[t] || {}).forEach(su => (sectionItemsDB[t][su] || []).forEach(it => {
                addArr(it.gallery); addArr(it.rahbarImgs);
                (it.yutuqlar || []).concat(it.hafsanalar || []).forEach(e => addArr(e && e.files));
                if (it.photo && typeof it.photo === 'object') out.push(it.photo);
                if (it.spravka && typeof it.spravka === 'object') out.push(it.spravka);
            })));
            getFeedback().forEach(x => addArr(x.files)); // shikoyat-taklif rasmlari ham saqlanib qoladi
            (vagonlarData || []).forEach(v => (v.zams || []).forEach(z => { addArr(z.photos); if (z.audio) out.push(z.audio); (z.attempts || []).forEach(a => addArr(a.photos)); }));
            if (typeof ZF !== 'undefined') { addArr(ZF.photos); if (ZF.audio) out.push(ZF.audio); addArr(FX.photos); }
            return out;
        }

        // Eski rasmlar (ma'lumotlar ichidagi base64) yangi xotiraga ko'chiriladi — hech biri yo'qolmaydi
        async function migrateLegacyImages() {
            let changed = 0;
            for (const x of allImageObjects()) {
                if (typeof x.src === 'string' && x.src.indexOf('data:') === 0) {
                    try {
                        const id = await storeImageBlob(dataURLtoBlob(x.src), null, x.author || '');
                        x.src = 'idb:' + id;
                        changed++;
                    } catch (e) {}
                }
            }
            if (changed) saveDB(false);
            return changed;
        }

        async function initMedia() {
            try {
                await openMediaDB();
                const metas = await mediaTx(['meta'], 'readonly', tx => tx.objectStore('meta').getAll());
                (metas || []).forEach(m => { THUMBS.set(m.id, m.thumb); MEDIA_META.set(m.id, m); });
                await migrateLegacyImages();
                // Hech qayerda ishlatilmayotgan rasmlarni tozalash (joy tejash)
                const used = new Set(allImageObjects().map(x => imgRef(x.src)).filter(Boolean));
                for (const id of Array.from(MEDIA_META.keys())) {
                    if (!used.has(id) && !/^(pack|design|mt):/.test(id)) { try { await mediaDelete(id); } catch (e) {} THUMBS.delete(id); MEDIA_META.delete(id); } // paketlar va dizayn fayllari rasm emas — tozalanmaydi
                }
                if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
                refreshCurrentScreen();
            } catch (e) {
                console.warn('Rasm xotirasi (IndexedDB) ishlamayapti, eski usul ishlatiladi.', e);
            }
        }

        // Tarqatish faylida rasmlar bo'lmaydi (fayl og'irlashmasligi uchun)
        function stripImagesForBundle(db) {
            (db.vagonlar || []).forEach(v => { v.gallery = []; v.rahbarImgs = []; (v.zams || []).forEach(z => { z.photos = []; z.audio = null; (z.attempts || []).forEach(a => { a.photos = []; }); }); });
            Object.keys(db.sections || {}).forEach(t => Object.keys(db.sections[t] || {}).forEach(su => (db.sections[t][su] || []).forEach(it => {
                if (it.gallery) it.gallery = []; if (it.rahbarImgs) it.rahbarImgs = [];
                (it.yutuqlar || []).concat(it.hafsanalar || []).forEach(e => { if (e && e.files) e.files = []; });
                if (it.photo) it.photo = null; if (it.spravka) it.spravka = null;
            })));
            return db;
        }

        // ============ QISQA XABARCHA ============
        function showToast(msg) {
            let t = document.getElementById('toastMsg');
            if (!t) { t = document.createElement('div'); t.id = 'toastMsg'; t.className = 'toast-msg'; document.body.appendChild(t); }
            t.innerText = msg;
            t.classList.add('show');
            clearTimeout(t._h);
            t._h = setTimeout(() => t.classList.remove('show'), 2600);
        }
        function nowHM() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

        // ============ RASM KO'RISH OYNASI: kattalashtirish, surish, varaqlash ============
        const PV = { s: 1, x: 0, y: 0, pts: new Map(), start: null, lastTap: 0, url: null, loadToken: 0, swipeDx: 0 };
        function pvApply(anim) {
            const img = document.getElementById('viewerImage');
            img.style.transition = anim ? 'transform 0.2s ease' : 'none';
            img.style.transform = 'translate(' + (PV.x + PV.swipeDx) + 'px,' + PV.y + 'px) scale(' + PV.s + ')';
        }
        function pvReset() { PV.s = 1; PV.x = 0; PV.y = 0; PV.swipeDx = 0; pvApply(false); }
        function pvClamp() {
            const img = document.getElementById('viewerImage'), st = document.getElementById('pvStage');
            const bw = img.offsetWidth, bh = img.offsetHeight, sw = st.clientWidth, sh = st.clientHeight;
            const mx = Math.max(0, (bw * PV.s - sw) / 2), my = Math.max(0, (bh * PV.s - sh) / 2);
            PV.x = Math.max(-mx, Math.min(mx, PV.x));
            PV.y = Math.max(-my, Math.min(my, PV.y));
        }
        function pvZoomAt(newS, cx, cy) {
            const st = document.getElementById('pvStage').getBoundingClientRect();
            const ox = cx - (st.left + st.width / 2), oy = cy - (st.top + st.height / 2);
            newS = Math.max(1, Math.min(5, newS));
            PV.x = ox - (ox - PV.x) * (newS / PV.s);
            PV.y = oy - (oy - PV.y) * (newS / PV.s);
            PV.s = newS;
            if (PV.s === 1) { PV.x = 0; PV.y = 0; }
            pvClamp();
        }
        function pvDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
        function initPhotoViewer() {
            const st = document.getElementById('pvStage');
            st.addEventListener('pointerdown', e => {
                st.setPointerCapture(e.pointerId);
                PV.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                const p = Array.from(PV.pts.values());
                if (p.length === 1) PV.start = { mode: 'one', x0: e.clientX, y0: e.clientY, px: PV.x, py: PV.y, t: Date.now(), moved: false };
                else if (p.length === 2) PV.start = { mode: 'pinch', d0: pvDist(p[0], p[1]), s0: PV.s, x0: PV.x, y0: PV.y, cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2 };
            });
            st.addEventListener('pointermove', e => {
                if (!PV.pts.has(e.pointerId) || !PV.start) return;
                PV.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                const p = Array.from(PV.pts.values());
                if (PV.start.mode === 'pinch' && p.length >= 2) {
                    const d = pvDist(p[0], p[1]);
                    PV.s = PV.start.s0; PV.x = PV.start.x0; PV.y = PV.start.y0;
                    pvZoomAt(PV.start.s0 * d / PV.start.d0, PV.start.cx, PV.start.cy);
                    pvApply(false);
                } else if (PV.start.mode === 'one') {
                    const dx = e.clientX - PV.start.x0, dy = e.clientY - PV.start.y0;
                    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) PV.start.moved = true;
                    if (PV.s > 1) { PV.x = PV.start.px + dx; PV.y = PV.start.py + dy; pvClamp(); }
                    else PV.swipeDx = dx;
                    pvApply(false);
                }
            });
            const end = e => {
                if (!PV.pts.has(e.pointerId)) return;
                PV.pts.delete(e.pointerId);
                const s = PV.start;
                if (!s) return;
                if (s.mode === 'pinch') {
                    if (PV.pts.size === 1) { const q = Array.from(PV.pts.values())[0]; PV.start = { mode: 'one', x0: q.x, y0: q.y, px: PV.x, py: PV.y, t: Date.now(), moved: true }; }
                    else PV.start = null;
                    if (PV.s < 1.05) { PV.s = 1; PV.x = 0; PV.y = 0; }
                    pvApply(true);
                    return;
                }
                PV.start = null;
                const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
                if (PV.s === 1 && s.moved && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                    PV.swipeDx = 0;
                    if (dx < 0) nextImage(); else prevImage();
                    return;
                }
                PV.swipeDx = 0; pvApply(true);
                if (!s.moved) {
                    const now = Date.now();
                    if (now - PV.lastTap < 300) { // ikki marta bosish — kattalashtirish / asl holat
                        if (PV.s > 1) { PV.s = 1; PV.x = 0; PV.y = 0; } else pvZoomAt(2.5, e.clientX, e.clientY);
                        pvApply(true); PV.lastTap = 0;
                    } else PV.lastTap = now;
                }
            };
            st.addEventListener('pointerup', end);
            st.addEventListener('pointercancel', end);
            st.addEventListener('wheel', e => { e.preventDefault(); pvZoomAt(PV.s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); pvApply(false); }, { passive: false });
            document.addEventListener('keydown', e => {
                if (document.getElementById('imageViewerModal').classList.contains('hidden')) return;
                if (e.key === 'ArrowRight') nextImage(); else if (e.key === 'ArrowLeft') prevImage(); else if (e.key === 'Escape') closeImageViewer();
            });
        }
        function fmtDateTime(iso) {
            const d = new Date(iso);
            if (isNaN(d)) return '';
            const p = n => String(n).padStart(2, '0');
            return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
        }
        function fmtSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

        function todayISO() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

