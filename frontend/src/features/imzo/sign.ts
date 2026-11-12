
        // =====================================================================
        // v3.0 — ✍️ ICHKI ELEKTRON IMZO (korxona ichidagi tasdiqlash; E-IMZO emas)
        //  • Profil → «✍️ Mening imzom»: chizish (qalam, qalinlik, rang, tekislash, S Pen bosimi, o'chirg'ich, ortga/oldinga),
        //    📷 kamera, 🖼 rasm joylash — ilova imzoni o'zi qirqadi, fonni olib tashlaydi, shaffof PNG (faqat telefonda ishlov)
        //  • Har bir hujjatda «📤 Yuborish» yonida «✍️ Imzoga yuborish»: imzo chekuvchilar hujjatdan o'qiladi va hisoblarga moslanadi
        //  • Imzoni FAQAT egasi o'z hisobidan qo'yadi — server tekshiradi (kim, qachon, qaysi qurilma, hujjat izi SHA-256)
        //  • Hamma imzolagach — imzolar o'z joyida turgan PDF; DEMO hisob ishtirok etsa — «DEMO — haqiqiy hujjat emas»
        // =====================================================================
        var SIG = { capture: false, users: null, usersAt: 0, inbox: [], seen: {}, timer: 0, cur: null, pend: null };
        function sigSrv() { return typeof srvOn === 'function' && srvOn() && syncGet(SYNC_SES, null) && syncGet(SYNC_SES, null).access; }
        function sigMe() { const s = syncGet(SYNC_SES, null); return s ? s.tabel : ''; }
        async function sigSha(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(t))); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''); }
        async function sigApi(path, method, body) { return sbFetch(path, { method: method || 'GET', body: body }); }
        function sigKey(n) { // familiya kaliti (kirill/lotin farqisiz) — serverdagi surnameKey bilan bir xil
            const M = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
            let w = String(n || '').trim().split(/\s+/)[0] || ''; w = w.toLowerCase().replace(/[ʻʼ'`‘’]/g, ''); let o = ''; for (const ch of w) o += M[ch] !== undefined ? M[ch] : ch;
            return o.replace(/q/g, 'k').replace(/x/g, 'h').replace(/yev$/, 'ev').replace(/yeva$/, 'eva').replace(/[aou]/g, 'a').replace(/[^a-z]/g, '');
        }
        function sigInitial(n) { const p = String(n || '').trim().split(/\s+/); const s = (p[1] || '').replace(/[^A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/g, ''); return s ? s[0].toLowerCase() : ''; }
        // ---------- CSS ----------
        (function () {
            const c = document.createElement('style');
            c.textContent = `.sg-pad{position:relative;background:#fff;border-radius:12px;touch-action:none;overflow:hidden;border:2px dashed #94a3b8}
                .sg-pad canvas{display:block;width:100%;height:220px}
                .sg-tools{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;align-items:center}.sg-tools button{padding:7px 10px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-size:12.5px}
                .sg-tools button.on{border-color:#38bdf8;background:rgba(56,189,248,.18)}.sg-col{width:26px;height:26px;border-radius:50%;border:2px solid #334155;display:inline-block;cursor:pointer}.sg-col.on{border-color:#fff;box-shadow:0 0 0 2px #38bdf8}
                .sg-tabs{display:flex;gap:6px;margin-bottom:8px}.sg-tabs button{flex:1;padding:9px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:13px}.sg-tabs button.on{border-color:#38bdf8;background:rgba(56,189,248,.15)}
                .sg-prev{background:#fff;border-radius:10px;padding:8px;text-align:center;min-height:60px}.sg-prev img{max-width:100%;max-height:140px}
                .sg-row{display:flex;gap:8px;align-items:center;padding:7px;border:1px solid #1e293b;border-radius:10px;margin:5px 0;background:#0f172a;font-size:12.5px;color:#e2e8f0}.sg-row select{flex:1;min-width:0}
                .sg-doc{border:1px solid #334155;border-radius:12px;padding:10px;margin:6px 0;background:#0f172a;color:#e2e8f0;font-size:13px;cursor:pointer}.sg-doc small{color:#94a3b8;display:block}
                .sg-st{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.sg-st span{font-size:12px;padding:4px 9px;border-radius:12px;background:#1e293b}.sg-st .ok{color:#86efac}.sg-st .no{color:#fca5a5}.sg-st .w{color:#fde68a}
                .sg-view{background:#334155;border-radius:10px;padding:8px;max-height:55vh;overflow:auto;display:flex;flex-direction:column;gap:8px}.sg-view canvas{width:100%;height:auto;background:#fff}
                .sg-badge{background:#ef4444;color:#fff;border-radius:10px;padding:0 7px;font-size:11px;margin-left:6px}
                .sg-send{background:linear-gradient(135deg,#7c3aed,#a855f7)!important;color:#fff!important}`;
            document.head.appendChild(c);
        })();
        // =====================================================================
        // 1) ✍️ MENING IMZOM
        // =====================================================================
        var SGP = { mode: 'draw', pen: 'pero', w: 3, col: '#1e3a8a', smooth: true, strokes: [], redo: [], cur: null, img: null, thr: 0, png: null };
        function sigOpenMine() {
            if (!currentUser || !currentUser.tabel) { alert('Avval tizimga kiring.'); return; }
            SGP.strokes = []; SGP.redo = []; SGP.png = null; SGP.img = null; SGP.mode = 'draw';
            mdl('sgMine', `<div class="px-h"><b>✍️ Mening imzom</b><button class="mini-btn" onclick="mdlClose('sgMine')">✕</button></div>
                <div class="nd-tip">Imzo bir marta kiritiladi va hujjatlarda sizning familiyangiz turgan joyga qoʻyiladi. Uni faqat siz, oʻz hisobingizdan qoʻya olasiz.${sigSrv() ? ' Imzo korxona serverida shifrlangan holda saqlanadi.' : ' ⚠️ Server ulanmagan: imzo faqat shu telefonda saqlanadi, imzolash tizimi server bilan ishlaydi.'}</div>
                <div class="pp-lbl">HOZIRGI IMZO</div><div class="sg-prev" id="sgCur">⏳</div>
                <div class="sg-tabs"><button id="sgT_draw" onclick="sigMode('draw')">✏️ Chizish</button><button id="sgT_cam" onclick="sigMode('cam')">📷 Kamera</button><button id="sgT_img" onclick="sigMode('img')">🖼 Rasm joylash</button></div>
                <div id="sgBody"></div>
                <div class="pp-lbl">NATIJA (shaffof PNG)</div><div class="sg-prev" id="sgOut"><small style="color:#64748b">Imzo chizing yoki rasm tanlang</small></div>
                <div class="pk-btns"><button onclick="mdlClose('sgMine')">Bekor</button><button class="pr" onclick="sigSaveMine()">💾 Saqlash</button></div>`, true);
            sigMode('draw'); sigLoadMine().then(p => { const b = $id('sgCur'); if (b) b.innerHTML = p ? `<img src="${p}">` : '<small style="color:#64748b">Hali imzo kiritilmagan</small>'; });
        }
        async function sigLoadMine() {
            if (sigSrv()) { try { const r = await sigApi('/api/sig/v1/me'); return r && r.png || null; } catch (e) { return null; } }
            try { return localStorage.getItem('agmk_sig_' + (currentUser && currentUser.tabel)) || null; } catch (e) { return null; }
        }
        function sigMode(m) {
            SGP.mode = m; ['draw', 'cam', 'img'].forEach(k => { const b = $id('sgT_' + k); if (b) b.classList.toggle('on', k === m); });
            const B = $id('sgBody'); if (!B) return;
            const cols = ['#1e3a8a', '#1d4ed8', '#0f172a', '#312e81'];
            const colH = cols.map(c => `<span class="sg-col${SGP.col === c ? ' on' : ''}" style="background:${c}" onclick="SGP.col='${c}'; sigMode(SGP.mode)"></span>`).join('');
            if (m === 'draw') {
                B.innerHTML = `<div class="sg-tools">${[['pero', '🖋 Pero'], ['ruchka', '🖊 Sharikli'], ['marker', '🖍 Marker']].map(([k, t]) => `<button class="${SGP.pen === k ? 'on' : ''}" onclick="SGP.pen='${k}'; sigMode('draw')">${t}</button>`).join('')}</div>
                    <div class="sg-tools"><small>Qalinlik</small><input type="range" min="1" max="10" value="${SGP.w}" oninput="SGP.w=+this.value; sigRedraw()" style="flex:1">${colH}</div>
                    <div class="sg-tools"><label style="font-size:12.5px;color:#e2e8f0"><input type="checkbox" ${SGP.smooth ? 'checked' : ''} onchange="SGP.smooth=this.checked; sigRedraw()"> Chiziqlarni tekislash</label>
                    <button onclick="sigUndo()">↩ Ortga</button><button onclick="sigRedo()">↪ Oldinga</button><button onclick="SGP.strokes=[];SGP.redo=[];sigRedraw()">🧽 Tozalash</button></div>
                    <div class="sg-pad"><canvas id="sgCv"></canvas></div><small style="color:#94a3b8">Barmoq yoki S Pen bilan imzo qoʻying. S Pen bosimi (pero rejimida) chiziq qalinligiga taʼsir qiladi.</small>`;
                sigPadInit();
            } else {
                B.innerHTML = `<label class="action-btn" style="display:block;text-align:center;cursor:pointer">${m === 'cam' ? '📷 Qogʻozdagi imzoni rasmga olish' : '🖼 Galereyadan yoki fayldan tanlash'}<input type="file" accept="image/*" ${m === 'cam' ? 'capture="environment"' : ''} style="display:none" onchange="sigImgPick(this)"></label>
                    <div id="sgImgCtl" class="${SGP.img ? '' : 'hidden'}"><div class="sg-tools"><small>Sezgirlik</small><input type="range" min="-60" max="60" value="${SGP.thr}" oninput="SGP.thr=+this.value; sigImgProc()" style="flex:1"></div><div class="sg-tools"><small>Rang</small>${colH}</div>
                    <small style="color:#94a3b8">Ilova imzoni oʻzi topib qirqadi va fonni (qogʻoz, soya, chiziqlar) olib tashlaydi. Natija yoqmasa — sezgirlikni suring. Rasm hech qayerga yuborilmaydi, ishlov faqat telefonda.</small></div>`;
                if (SGP.img) sigImgProc();
            }
        }
        function sigPadInit() {
            const cv = $id('sgCv'); if (!cv) return; const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
            cv.width = Math.max(300, Math.round(r.width * dpr)); cv.height = Math.round(220 * dpr); cv._dpr = dpr;
            const pt = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * dpr, y: (e.clientY - b.top) * dpr, p: e.pressure && e.pointerType === 'pen' ? e.pressure : 0.5 }; };
            cv.onpointerdown = e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); SGP.cur = { pen: SGP.pen, w: SGP.w, col: SGP.col, pts: [pt(e)] }; SGP.strokes.push(SGP.cur); SGP.redo = []; sigRedraw(); };
            cv.onpointermove = e => { if (!SGP.cur) return; e.preventDefault(); (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(ev => SGP.cur.pts.push(pt(ev))); sigRedraw(); };
            cv.onpointerup = cv.onpointercancel = () => { if (SGP.cur) { SGP.cur = null; sigRender(); } };
            sigRedraw();
        }
        function sigDrawStrokes(g, S, k) {
            S.forEach(s => {
                let P = s.pts; if (SGP.smooth && P.length > 3) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 2)], b = P[Math.max(0, i - 1)], c = P[i], d = P[Math.min(P.length - 1, i + 1)], e = P[Math.min(P.length - 1, i + 2)]; Q.push({ x: (a.x + b.x + c.x + d.x + e.x) / 5, y: (a.y + b.y + c.y + d.y + e.y) / 5, p: c.p }); } P = Q; }
                g.strokeStyle = s.col; g.fillStyle = s.col; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = s.pen === 'marker' ? 0.85 : 1;
                const base = s.w * (k || 1) * (s.pen === 'marker' ? 2.2 : s.pen === 'ruchka' ? 0.8 : 1.2);
                if (P.length === 1) { g.beginPath(); g.arc(P[0].x, P[0].y, base / 2, 0, 7); g.fill(); return; }
                for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i]; g.lineWidth = s.pen === 'pero' ? Math.max(0.6, base * (0.45 + b.p * 1.1)) : base; g.beginPath(); g.moveTo(a.x, a.y); if (SGP.smooth && i + 1 < P.length) { const c = P[i + 1]; g.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2); } else g.lineTo(b.x, b.y); g.stroke(); }
                g.globalAlpha = 1;
            });
        }
        function sigRedraw() { const cv = $id('sgCv'); if (!cv) return; const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.strokeStyle = '#cbd5e1'; g.lineWidth = 1; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(20, cv.height * 0.72); g.lineTo(cv.width - 20, cv.height * 0.72); g.stroke(); g.setLineDash([]); sigDrawStrokes(g, SGP.strokes, cv._dpr || 1); }
        function sigUndo() { if (SGP.strokes.length) { SGP.redo.push(SGP.strokes.pop()); sigRedraw(); sigRender(); } }
        function sigRedo() { if (SGP.redo.length) { SGP.strokes.push(SGP.redo.pop()); sigRedraw(); sigRender(); } }
        function sigTrim(cv, pad) { // bo'sh joylarni qirqish (alfa bo'yicha)
            const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
            for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
            if (x1 < 0) return null; pad = pad || 8; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(cv.width - 1, x1 + pad); y1 = Math.min(cv.height - 1, y1 + pad);
            const w = x1 - x0 + 1, h = y1 - y0 + 1, sc = Math.min(1, 640 / w, 260 / h), o = document.createElement('canvas'); o.width = Math.round(w * sc); o.height = Math.round(h * sc);
            o.getContext('2d').drawImage(cv, x0, y0, w, h, 0, 0, o.width, o.height); return o;
        }
        function sigRender() {
            const cv = $id('sgCv'); if (!cv || !SGP.strokes.length) { SGP.png = null; const o = $id('sgOut'); if (o) o.innerHTML = '<small style="color:#64748b">Imzo chizing</small>'; return; }
            const t = document.createElement('canvas'); t.width = cv.width; t.height = cv.height; sigDrawStrokes(t.getContext('2d'), SGP.strokes, cv._dpr || 1);
            const o = sigTrim(t, 10); SGP.png = o ? o.toDataURL('image/png') : null; const b = $id('sgOut'); if (b) b.innerHTML = SGP.png ? `<img src="${SGP.png}">` : '';
        }
        function sigImgPick(inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return;
            const im = new Image(); im.onload = () => { SGP.img = im; SGP.thr = 0; const c = $id('sgImgCtl'); if (c) c.classList.remove('hidden'); sigImgProc(); URL.revokeObjectURL(im.src); };
            im.onerror = () => alert('Rasmni ochib boʻlmadi'); im.src = URL.createObjectURL(f);
        }
        function sigImgProc() { // fon olib tashlash: kulrang → Otsu chegarasi → siyoh piksellari → tanlangan rangda, alfa = qoralik
            const im = SGP.img; if (!im) return; const sc = Math.min(1, 1600 / Math.max(im.width, im.height)), W = Math.round(im.width * sc), H = Math.round(im.height * sc);
            const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, W, H);
            const id = g.getImageData(0, 0, W, H), d = id.data, L = new Uint8Array(W * H), hist = new Array(256).fill(0);
            // yoritilishni tekislash: katta bloklar bo'yicha fon darajasi (soya va qog'oz rangi olib tashlanadi)
            const B = 32, bw = Math.ceil(W / B), bh = Math.ceil(H / B), bg = new Float32Array(bw * bh);
            for (let i = 0; i < W * H; i++) { const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2]; L[i] = (r * 0.3 + gg * 0.59 + b * 0.11) | 0; }
            for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { let mx = 0; const V = []; for (let y = by * B; y < Math.min(H, by * B + B); y += 2) for (let x = bx * B; x < Math.min(W, bx * B + B); x += 2) V.push(L[y * W + x]); V.sort((a, b) => a - b); mx = V[Math.floor(V.length * 0.9)] || 255; bg[by * bw + bx] = Math.max(60, mx); }
            const N = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = Math.min(255, L[y * W + x] / bg[Math.min(bh - 1, (y / B) | 0) * bw + Math.min(bw - 1, (x / B) | 0)] * 255) | 0; N[y * W + x] = v; hist[v]++; }
            let sum = 0, sumB = 0, wB = 0, best = 0, thr = 128; const tot = W * H; for (let i = 0; i < 256; i++) sum += i * hist[i];
            for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = tot - wB; if (!wF) break; sumB += i * hist[i]; const mB = sumB / wB, mF = (sum - sumB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; thr = i; } }
            thr = Math.max(20, Math.min(235, thr + SGP.thr));
            const col = SGP.col, cr = parseInt(col.slice(1, 3), 16), cg = parseInt(col.slice(3, 5), 16), cb = parseInt(col.slice(5, 7), 16);
            for (let i = 0; i < W * H; i++) { const v = N[i]; const a = v >= thr ? 0 : Math.min(255, Math.round((thr - v) / Math.max(1, thr) * 255 * 1.6)); d[i * 4] = cr; d[i * 4 + 1] = cg; d[i * 4 + 2] = cb; d[i * 4 + 3] = a; }
            // mayda dog'larni tozalash (yakka piksellar)
            for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!d[i * 4 + 3]) continue; let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && d[((y + dy) * W + x + dx) * 4 + 3] > 40) n++; if (n < 2) d[i * 4 + 3] = 0; }
            g.putImageData(id, 0, 0);
            const o = sigTrim(cv, 12); SGP.png = o ? o.toDataURL('image/png') : null; const b = $id('sgOut'); if (b) b.innerHTML = SGP.png ? `<img src="${SGP.png}">` : '<small style="color:#fca5a5">Imzo topilmadi — sezgirlikni oʻzgartiring yoki aniqroq rasmga oling</small>';
        }
        async function sigSaveMine() {
            if (SGP.mode === 'draw') sigRender();
            if (!SGP.png) { alert('Avval imzo chizing yoki rasm tanlang.'); return; }
            try {
                if (sigSrv()) await sigApi('/api/sig/v1/me', 'PUT', { png: SGP.png });
                else localStorage.setItem('agmk_sig_' + currentUser.tabel, SGP.png);
                mdlClose('sgMine'); showToast('✍️ Imzongiz saqlandi');
            } catch (e) { alert('⚠️ Saqlanmadi: ' + agmkErrUz(e)); }
        }
        // DEMO hisob: haqiqiy imzoga o'xshamaydigan shartli belgi (ramka, familiya, «DEMO»)
        function sigDemoPng(name) {
            const c = document.createElement('canvas'); c.width = 360; c.height = 120; const g = c.getContext('2d');
            g.strokeStyle = '#7c3aed'; g.lineWidth = 4; g.setLineDash([10, 6]); g.strokeRect(6, 6, 348, 108); g.setLineDash([]);
            g.fillStyle = '#7c3aed'; g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillText('DEMO', 180, 52);
            g.font = '20px Arial'; g.fillText(String(name || '').slice(0, 26), 180, 90); return c.toDataURL('image/png');
        }
        async function sigDemoEnsure() {
            try { const s = syncGet(SYNC_SES, null); if (!s || !s.demo || !sigSrv()) return; const r = await sigApi('/api/sig/v1/me'); if (r && r.png) return; await sigApi('/api/sig/v1/me', 'PUT', { png: sigDemoPng(s.name || (currentUser && currentUser.name)) }); } catch (e) {}
        }
        // =====================================================================
        // 2) ✍️ IMZOGA YUBORISH
        // =====================================================================
        function sigNamesFromHtml(html) { // hujjatdagi F.I.O. lar (Фамилия И.О. / И.О. Фамилия), imzo qatorlaridagilari belgilangan holda
            const box = document.createElement('div'); box.innerHTML = html; const out = [], seen = new Set();
            const CY = 'А-ЯЁЎҚҒҲ', cy = 'а-яёўқғҳ', LA = 'A-Z', la = "a-zʻʼ'";
            const R1 = new RegExp(`([${CY}${LA}][${cy}${la}]{2,}(?:-[${CY}${LA}][${cy}${la}]+)?)\\s+([${CY}${LA}])\\.\\s?([${CY}${LA}])\\.?`, 'g');
            const R2 = new RegExp(`([${CY}${LA}])\\.\\s?([${CY}${LA}])\\.\\s?([${CY}${LA}][${cy}${la}]{2,})`, 'g');
            const R3 = new RegExp(`(?:^|[^${CY}${LA}${cy}${la}.])([${CY}${LA}])\\.\\s?([${CY}${LA}][${cy}${la}]{3,}(?:-[${CY}${LA}][${cy}${la}]+)?)`, 'g');
            const zones = []; box.querySelectorAll('tr, p, div, td, li').forEach(el => { if (!el.children.length || el.tagName === 'TR' || el.tagName === 'P') zones.push(el); });
            const signy = el => /_{3,}/.test(el.textContent) || !!el.closest('table.nb, table.a-sign, .a-approve, .a-sign') || /утвержда|tasdiqlayman|согласовано|kelishildi|подпис|imzo/i.test((el.closest('table, div, p') || el).textContent);
            zones.forEach(el => {
                const t = el.textContent.replace(/\s+/g, ' ');
                const add = (sur, i1, i2) => { if (/^(Акт|Утверждаю|Начальник|Инженер|Главный|Мастер|Согласовано)$/i.test(sur)) return; const label = sur + ' ' + i1 + '.' + (i2 ? i2 + '.' : ''), k = sigKey(sur) + '|' + i1.toLowerCase(); if (seen.has(k)) { const o = out.find(z => z.k === k); if (o && signy(el)) o.sign = true; return; } seen.add(k); out.push({ k: k, label: label, sur: sur, i1: i1.toLowerCase(), i2: String(i2 || '').toLowerCase(), sign: signy(el) }); };
                let m; R1.lastIndex = 0; while ((m = R1.exec(t))) add(m[1], m[2], m[3]); R2.lastIndex = 0; while ((m = R2.exec(t))) add(m[3], m[1], m[2]);
                R3.lastIndex = 0; while ((m = R3.exec(t))) { const ks = sigKey(m[2]); if (!out.some(z => sigKey(z.sur) === ks)) add(m[2], m[1], ''); } // «@@N:359@@», «@@N:371@@» (bitta bosh harf)
            });
            return out;
        }
        async function sigUsers(force) {
            if (!force && SIG.users && Date.now() - SIG.usersAt < 60000) return SIG.users;
            SIG.users = await sigApi('/rest/v1/agmk_users') || []; SIG.usersAt = Date.now(); return SIG.users;
        }
        function sigMatch(n, users) { const k = sigKey(n.sur); const L = users.filter(u => sigKey(u.name) === k); if (L.length <= 1) return L[0] || null; return L.find(u => sigInitial(u.name) && sigInitial(u.name) === (typeof normTxt === 'function' ? normTxt(n.i1)[0] : n.i1)) || L.find(u => !u.demo) || L[0]; }
        async function sigSendOpen(opt) {
            if (!sigSrv()) { alert('✍️ Imzolash korxona serveri orqali ishlaydi.\n\nKirish oynasida «📡 Serverga ulanish» orqali ulaning va tabel/parol bilan kiring.'); return; }
            if (!opt || !opt.html) { alert('Hujjat topilmadi'); return; }
            let users; try { users = await sigUsers(true); } catch (e) { alert('⚠️ Serverdan xodimlar roʻyxatini olib boʻlmadi: ' + agmkErrUz(e)); return; }
            const names = sigNamesFromHtml(opt.html);
            SIG.pend = { html: opt.html, title: opt.title || 'Hujjat', rows: names.map(n => { const u = sigMatch(n, users); return { label: n.label, tabel: u ? u.tabel : '', on: n.sign && !!u, sign: n.sign }; }) };
            sigSendRender();
        }
        function sigSendRender() {
            const P = SIG.pend, U = SIG.users || [], E = escapeHtml;
            const opts = sel => '<option value="">— hisob tanlanmagan —</option>' + U.map(u => `<option value="${E(u.tabel)}"${u.tabel === sel ? ' selected' : ''}>${E(u.name)} · ${E(u.tabel)}${u.demo ? ' · DEMO' : ''}${u.has_sig ? '' : ' · (imzosi yoʻq)'}</option>`).join('');
            const miss = P.rows.filter(r => r.on && !r.tabel).length;
            mdl('sgSend', `<div class="px-h"><b>✍️ Imzoga yuborish</b><button class="mini-btn" onclick="mdlClose('sgSend')">✕</button></div>
                <div class="snd-doc">📄 ${E(P.title)}</div>
                <div class="nd-tip">Ilova hujjatdagi imzo chekuvchilarni oʻqidi va ularning hisoblariga moslashtirdi. Tekshiring: har bir qatorda toʻgʻri odam tanlangan boʻlsin. Hujjat hammaga <b>bir vaqtda</b> boradi; har kim faqat oʻz familiyasi qatoriga imzo qoʻyadi.</div>
                ${P.rows.map((r, i) => `<div class="sg-row"><input type="checkbox" ${r.on ? 'checked' : ''} onchange="SIG.pend.rows[${i}].on=this.checked"><span style="min-width:110px">${E(r.label)}${r.sign ? '' : '<br><small style="color:#94a3b8">imzo qatorida emas</small>'}</span><select onchange="SIG.pend.rows[${i}].tabel=this.value; SIG.pend.rows[${i}].on=!!this.value">${opts(r.tabel)}</select></div>`).join('') || '<div class="xt-empty">Hujjatda F.I.O. topilmadi — quyida qoʻshing.</div>'}
                <button class="mini-btn" onclick="SIG.pend.rows.push({label:'',tabel:'',on:true,sign:true}); sigSendRender()">➕ Imzo chekuvchi qoʻshish</button>
                ${miss ? `<div class="hp-warn">⚠️ ${miss} ta belgilangan qatorda hisob tanlanmagan. Bu xodim ilovada roʻyxatdan oʻtmagan boʻlsa — unga imzo bora olmaydi.</div>` : ''}
                <div class="pk-btns"><button onclick="mdlClose('sgSend')">Bekor</button><button class="pr" onclick="sigSendGo()">✍️ Hammaga yuborish</button></div>`, true);
        }
        async function sigSendGo() {
            const P = SIG.pend; if (!P) return;
            const S = []; P.rows.forEach(r => { if (r.on && r.tabel && !S.some(z => z.tabel === r.tabel)) { const u = (SIG.users || []).find(x => x.tabel === r.tabel); S.push({ tabel: r.tabel, label: r.label || (u ? u.name : '') }); } });
            if (!S.length) { alert('Kamida bitta imzo chekuvchini tanlang.'); return; }
            try {
                const r = await sigApi('/api/sign/v1/docs', 'POST', { title: P.title, html: P.html, hash: await sigSha(P.html), signers: S, meta: P.meta || undefined });
                mdlClose('sgSend'); showToast('✍️ Imzoga yuborildi: ' + S.length + ' kishi'); SIG.pend = null; sigPoll(true); sigOpenDoc(r.id);
            } catch (e) { alert('⚠️ Yuborilmadi: ' + agmkErrUz(e)); }
        }
        // «📤 Yuborish» oynasidagi va hujjat panelidagi «✍️ Imzoga yuborish» tugmalari
        (function () {
            if (typeof sendOpen !== 'function') return;
            sendOpen = agmkExtend('sendOpen', 'sendOpen', sendOpen, o => function (opt) {
                if (SIG.capture) { SIG.capture = false; return sigSendOpen(Object.assign({}, opt || {})); }
                return o.apply(this, arguments);
            });
            const oR = typeof sendRender === 'function' ? sendRender : null;
            if (oR) sendRender = function () { const r = oR.apply(this, arguments); try { const b = $id('sendBox'); if (b && !b.querySelector('.sg-send')) { const bt = document.createElement('button'); bt.className = 'action-btn sg-send'; bt.style.marginTop = '8px'; bt.textContent = '✍️ Imzoga yuborish'; bt.onclick = () => { $id('sendModal').classList.add('hidden'); sigSendOpen({ html: SND.html, title: SND.title }); }; const bb = b.querySelector('.pk-btns'); if (bb) bb.insertAdjacentElement('afterend', bt); else b.appendChild(bt); } } catch (e) {} return r; };
            const one = b => {
                if (b._sg || !/📤\s*Yuborish/.test(b.textContent) || b.closest('#sendModal, .cx-bar, .dbar, .dbar-more, .v9-acts, .ex-act, #v9View, #expSnack')) return; b._sg = true;
                const s = document.createElement('button'); s.className = b.className + ' sg-send'; s.textContent = '✍️ Imzoga yuborish'; s._sg = true;
                s.onclick = e => { e.preventDefault(); SIG.capture = true; try { b.click(); } finally { setTimeout(() => { SIG.capture = false; }, 400); } };
                b.insertAdjacentElement('afterend', s);
            };
            // Faqat yangi qoʻshilgan qismlar tekshiriladi (ilgari har oʻzgarishda sahifadagi barcha tugmalar qayta koʻrilardi)
            const Q = new Set(); let all = true;
            const inject = () => { const R = all ? [document.body] : [...Q]; Q.clear(); all = false; R.forEach(r => { if (!r.isConnected) return; if (r.tagName === 'BUTTON') one(r); else r.querySelectorAll('button').forEach(one); }); };
            new MutationObserver(ms => {
                for (const m of ms) for (const n of m.addedNodes) { const e = n.nodeType === 1 ? n : n.parentElement; if (e) Q.add(e.closest('button') || e); }
                if (Q.size > 300) { all = true; Q.clear(); }
                if (Q.size || all) { clearTimeout(SIG._inj); SIG._inj = setTimeout(inject, 120); }
            }).observe(document.body, { childList: true, subtree: true });
            setTimeout(inject, 0);
        })();
        // =====================================================================
        // 3) IMZOLASH SAHIFASI (kiruvchi / yuborilgan / yakunlangan)
        // =====================================================================
        async function sigPoll(force) {
            if (!sigSrv() || document.body.classList.contains('locked')) return;
            try {
                const L = await sigApi('/api/sign/v1/inbox'); SIG.inbox = L || [];
                const me = sigMe(), wait = SIG.inbox.filter(d => d.status === 'open' && d.signers.some(x => x.tabel === me && x.state === 'wait'));
                wait.forEach(d => { if (!SIG.seen[d.id]) { SIG.seen[d.id] = 1; if (!force) showToast('✍️ Imzolashingiz kutilmoqda: «' + d.title + '»'); } });
                sigBadge(wait.length);
            } catch (e) {}
        }
        function sigBadge(n) {
            let c = $id('sgCard');
            const list = $id('main-card-list');
            if (!c && list && sigSrv()) { c = document.createElement('div'); c.className = 'btn-card'; c.id = 'sgCard'; c.setAttribute('data-search', 'imzo imzolash elektron imzo tasdiqlash'); c.onclick = sigOpenList; c.innerHTML = '<div class="btn-card-content"><span class="btn-icon">✍️</span><span class="btn-text">Imzolash<span class="sg-badge hidden" id="sgBadge">0</span></span></div><span class="btn-arrow">›</span>'; list.insertBefore(c, list.firstChild); }
            const b = $id('sgBadge'); if (b) { b.textContent = n; b.classList.toggle('hidden', !n); }
        }
        function sigStateTxt(x) { return x.state === 'sign' ? '<span class="ok">✅ ' + escapeHtml(x.name || x.label) + ' · ' + escapeHtml(fmtDT(x.at)) + '</span>' : x.state === 'reject' ? '<span class="no">❌ ' + escapeHtml(x.name || x.label) + ' — rad: ' + escapeHtml(x.reason || '') + '</span>' : '<span class="w">⏳ ' + escapeHtml(x.name || x.label) + '</span>'; }
        async function sigOpenList(tab) {
            if (!sigSrv()) { alert('Imzolash korxona serveri orqali ishlaydi — avval serverga ulaning va kiring.'); return; }
            await sigPoll(true); const me = sigMe(), E = escapeHtml; tab = typeof tab === 'string' ? tab : 'in';
            const L = SIG.inbox, F = { in: L.filter(d => d.status === 'open' && d.signers.some(x => x.tabel === me && x.state === 'wait')), out: L.filter(d => d.created_by === me && d.status === 'open'), done: L.filter(d => d.status !== 'open' || (d.signers.some(x => x.tabel === me) && !d.signers.some(x => x.tabel === me && x.state === 'wait') && d.created_by !== me)) };
            const T = [['in', '⏳ Imzolashim kerak'], ['out', '📤 Men yuborganlar'], ['done', '📁 Yakunlangan / boshqalar']];
            mdl('sgList', `<div class="px-h"><b>✍️ Imzolash</b><button class="mini-btn" onclick="mdlClose('sgList')">✕</button></div>
                <div class="sg-tabs">${T.map(([k, t]) => `<button class="${tab === k ? 'on' : ''}" onclick="sigOpenList('${k}')">${t} (${F[k].length})</button>`).join('')}</div>
                ${F[tab].map(d => `<div class="sg-doc" onclick="sigOpenDoc('${d.id}')"><b>${E(d.title)}</b>${d.demo ? ' <span class="sg-badge" style="background:#7c3aed">DEMO</span>' : ''}<small>${d.status === 'done' ? '✅ Toʻliq imzolangan' : d.status === 'cancelled' ? '✖ Bekor qilingan' : '⏳ ' + d.signers.filter(x => x.state === 'sign').length + ' / ' + d.signers.length + ' imzolandi'} · ${E(fmtDT(d.created_at))}</small></div>`).join('') || '<div class="xt-empty">Hozircha yoʻq.</div>'}
                <button class="action-btn sec" onclick="mdlClose('sgList'); sigOpenMine()">✍️ Mening imzom</button>`, true);
        }
        async function sigOpenDoc(id) {
            let d; try { d = await sigApi('/api/sign/v1/docs/' + id); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            SIG.cur = d; const me = sigMe(), E = escapeHtml, mine = d.signers.find(x => x.tabel === me);
            const hOk = (await sigSha(d.html)) === d.hash, actsOk = d.signers.every(x => x.state !== 'sign' || x.hash === d.hash);
            mdl('sgDoc', `<div class="px-h"><b>✍️ ${E(d.title)}</b><button class="mini-btn" onclick="mdlClose('sgDoc')">✕</button></div>
                ${d.demo ? '<div class="hp-warn">🎭 DEMO: hujjatda demo hisob ishtirok etmoqda — bu haqiqiy hujjat emas.</div>' : ''}
                <div class="sg-st">${d.signers.map(sigStateTxt).join('')}</div>
                <div class="nd-tip">${hOk && actsOk ? '🔒 Hujjat butun: yuborilganidan beri oʻzgarmagan (SHA-256 ' + E(d.hash.slice(0, 12)) + '…). Har bir imzo shu versiyaga bogʻlangan.' : '⚠️ Hujjat izi mos kelmaydi — imzolar bekor (hujjat oʻzgartirilgan).'} Yubordi: tabel ${E(d.created_by)} · ${E(fmtDT(d.created_at))}</div>
                <div class="sg-view" id="sgView"><small style="color:#64748b">⏳ Hujjat chizilmoqda…</small></div>
                <div class="pk-btns">${mine && mine.state === 'wait' && d.status === 'open' ? `<button class="pr" onclick="sigDoSign()">✍️ Imzolash</button><button onclick="sigDoReject()">❌ Rad etish</button>` : ''}
                ${d.status === 'done' ? `<button class="pr" onclick="sigPdf()">📄 PDF (imzolar bilan)</button>` : ''}
                ${d.created_by === me && d.status === 'open' ? `<button onclick="sigCancel()">✖ Bekor qilish</button>` : ''}</div>`, true);
            try { // ko'rinish = PDF (imzolar o'z joyida)
                const lay = await sigLayout(d), v = $id('sgView'); if (!v || SIG.cur !== d) return;
                try { await Promise.all([document.fonts.load('16px AGMKSerif'), document.fonts.load('bold 16px AGMKSerif')]); } catch (e) {}
                v.innerHTML = ''; lay.pages.forEach(ops => { const c = dxCanvas(lay, ops, 1.6); c.className = 'dx-pg'; v.appendChild(c); }); SIG.lay = lay;
            } catch (e) { console.error(e); const v = $id('sgView'); if (v) v.innerHTML = '<div class="hp-warn">⚠️ Hujjatni chizib boʻlmadi: ' + E(agmkErrUz(e)) + '</div>'; }
        }
        async function sigDoSign() {
            const d = SIG.cur; if (!d) return; const p = await sigLoadMine();
            if (!p) { if (await uiConfirm('Sizda hali imzo yoʻq. Hozir kiritasizmi?')) sigOpenMine(); return; }
            if (!(await uiConfirm('«' + d.title + '» hujjatini imzolaysizmi?\n\nImzo sizning familiyangiz turgan joyga qoʻyiladi. Server vaqt, qurilma va hujjat izini yozib qoʻyadi.'))) return;
            try { const r = await sigApi('/api/sign/v1/docs/' + d.id + '/sign', 'POST', { hash: d.hash }); showToast(r && r.done ? '✅ Imzolandi — hamma imzoladi, PDF tayyor' : '✅ Imzolandi'); sigPoll(true); sigOpenDoc(d.id); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        }
        async function sigDoReject() {
            const d = SIG.cur; if (!d) return; const r = await uiPrompt('Rad etish sababini yozing:', ''); if (r === null) return; if (!String(r).trim()) { alert('Sabab yozilishi shart.'); return; }
            try { await sigApi('/api/sign/v1/docs/' + d.id + '/reject', 'POST', { hash: d.hash, reason: String(r).trim() }); showToast('❌ Rad etildi'); sigPoll(true); sigOpenDoc(d.id); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        }
        async function sigCancel() { const d = SIG.cur; if (!d || !(await uiConfirm('Imzolash bekor qilinsinmi?'))) return; try { await sigApi('/api/sign/v1/docs/' + d.id + '/cancel', 'POST', {}); mdlClose('sgDoc'); sigPoll(true); showToast('✖ Bekor qilindi'); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } }
        function sigJpeg(png, cb) { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0); const u = c.toDataURL('image/jpeg', 0.97), b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); cb({ data: a, w: c.width, h: c.height, el: c }); }; im.onerror = () => cb(null); im.src = png; }
        // 5.8: imzo — faqat siyoh qismi (shaffof yoki oq/kulrang fon kesiladi — rasmga olingan imzolar ham), 2 px chegara bilan; bir xil koʻrinadigan kattalik
        function sigInk(png: string): Promise<string> {
            return new Promise(res => { const im = new Image(); im.onload = () => { try {
                const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
                const D = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
                for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const q = (y * c.width + x) * 4, a = D[q + 3]; if (a > 8 && (a < 250 || Math.min(D[q], D[q + 1], D[q + 2]) < 200)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
                if (x1 < 0) { res(png); return; } const P = 2; x0 = Math.max(0, x0 - P); y0 = Math.max(0, y0 - P); x1 = Math.min(c.width - 1, x1 + P); y1 = Math.min(c.height - 1, y1 + P);
                for (let q = 0; q < D.length; q += 4) if (D[q + 3] > 250 && Math.min(D[q], D[q + 1], D[q + 2]) >= 200) D[q + 3] = 0; g.putImageData(new ImageData(D, c.width, c.height), 0, 0); // oq / kulrang fon — shaffof (hujjatda toʻrtburchak koʻrinmasin)
                const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height); res(o.toDataURL('image/png'));
            } catch (e) { res(png); } }; im.onerror = () => res(png); im.src = png; });
        }
        function sigSize(ratio: number, fs: number): any {
            // namuna — muallif imzosi (eni ≈ 2,5 × balandligi) ≈ 2,4 qator balandlikda; ensiz/uzun imzolar ham koʻzga bir xil kattalikda
            const H0 = fs * 2.4, r = Math.max(0.3, ratio); let h = H0 * Math.max(0.75, Math.min(1.4, Math.pow(2.5 / r, 0.45))), w = h * r;
            if (w > fs * 12) { w = fs * 12; h = w / r; }
            return { w: w, h: h };
        }
        // Imzolangan hujjat sahifalari: hujjat odatdagidek joylanadi (korxona blankasi bo'lsa — DXT), keyin imzo rasmi
        // familiya yoniga (yoki «____» ustiga) qo'yiladi. Natija PDF uchun ham, ilova ichida ko'rish uchun ham bir xil.
        async function sigLayout(d) {
            const S = d.signers.filter(x => x.state === 'sign' && x.png);
            const imgs = await Promise.all(S.map(x => sigInk(x.png).then(p => new Promise(r => sigJpeg(p, r))))); // 5.8: faqat siyoh qismi (atrofidagi boʻsh joy kesiladi)
            let lay = null; const dx = typeof dxFromSigHtml === 'function' ? await dxFromSigHtml(d.html).catch(() => null) : null;
            if (dx) lay = dx.lay;
            else { PDFK.f = null; const box = document.createElement('div'); box.className = 'nd-page pdf-src'; box.style.cssText = 'position:absolute; left:-99999px; top:0; width:794px; visibility:hidden;'; box.innerHTML = d.html; document.body.appendChild(box); try { lay = pdfLayoutAkt(box); } finally { box.remove(); } }
            {
                const L = lay.P.L, R = lay.P.W - (lay.P.R || lay.P.L), cw = R - L;
                S.forEach((x, si) => {
                    const im = imgs[si], k = sigKey(x.label || x.name); if (!im || !k) return;
                    let pg = -1, oi = -1, oc = 0; // familiya yozilgan oxirgi matn bo'lagi (oc — bo'lak ichida familiya boshlanadigan belgi)
                    const myI = typeof rsIni === 'function' ? rsIni(x.name || '') : ''; let best = 0; // v3.6.4: familiya + bosh harf (bir xil familiyalilar adashmasin)
                    lay.pages.forEach((ops, p) => ops.forEach((o, i) => { if (o.k !== 't') return; const ws = o.s.split(/[\s.,]+/).filter(Boolean), j = ws.findIndex(w => w.length > 2 && sigKey(w) === k); if (j < 0) return;
                        const iw = j > 0 && ws[j - 1].length <= 2 ? ws[j - 1] : (ws[j + 1] && ws[j + 1].length <= 2 ? ws[j + 1] : ''), ii = iw && typeof normTxt === 'function' ? normTxt(iw).replace(/[^a-z]/g, '').charAt(0) : '';
                        const sc = !ii || !myI ? 1 : ii === myI ? 2 : 0; if (sc && sc >= best) { best = sc; pg = p; oi = i; let ci = o.s.indexOf(ws[j]); if (ci > 0 && j > 0 && ws[j - 1].length <= 2) { const c2 = o.s.lastIndexOf(ws[j - 1], ci); if (c2 >= 0) ci = c2; } oc = Math.max(0, ci); } }));
                    if (pg < 0) return;
                    const ops = lay.pages[pg], o = ops[oi], same = ops.filter(z => z.k === 't' && Math.abs(z.y - o.y) < 1).sort((a, b) => a.x - b.x);
                    // familiya + ismning bosh harflari — bitta guruh (oraliq 12pt dan kichik)
                    let gi = same.indexOf(o), g0 = gi, g1 = gi; const end = z => z.x + pdfW(z.st, z.s, z.fs);
                    const isIni = (t: string) => /^[A-ZА-ЯЁЎҚҒҲ][a-zа-яёʻʼ'’]?\.?(\s?[A-ZА-ЯЁЎҚҒҲ][a-zа-яёʻʼ'’]?\.?)?$/.test(String(t).trim()); // 3.17.0: guruhga faqat bosh harflar (lavozim soʻzlari emas)
                    while (g0 > 0 && same[g0].x - end(same[g0 - 1]) < 12 && !/_{3,}/.test(same[g0 - 1].s) && isIni(same[g0 - 1].s)) g0--;
                    while (g1 < same.length - 1 && same[g1 + 1].x - end(same[g1]) < 12 && !/_{3,}/.test(same[g1 + 1].s) && isIni(same[g1 + 1].s)) g1++;
                    let gx0 = same[g0].x, preEnd = 0; const gx1 = end(same[g1]);
                    if (oc > 0) { const pre = o.s.slice(0, oc); gx0 = o.x + pdfW(o.st, pre, o.fs); preEnd = o.x + pdfW(o.st, pre.replace(/[\s.]+$/, ''), o.fs); } // lavozim va familiya bitta bo'lakda
                    // 5.8: barcha imzolar bir xil koʻrinadigan kattalikda (siyoh yuzasi teng), pastki qismi chiziqqa tegadi
                    const sz = sigSize(im.w / im.h, o.fs); let h = sz.h, w = sz.w;
                    const base = o.y + o.fs * 0.18, dn = 0.3; // imzo pastki cheti — matn qatori / «____» chizigʻi; 5.8: qoʻl imzosidek ~30% chiziqdan pastga tushadi
                    let px, py = base - h * (1 - dn);
                    // 3.17.0 korxona tartibi: imzo HECH QACHON familiyadan keyin emas — chiziq ustiga yoki familiyaning oldiga (chap tomoniga)
                    const us = same.find(z => /_{3,}/.test(z.s) && (z === o ? /_{3,}/.exec(z.s).index < oc : z.x < gx0));
                    if (us) { const m = /_{3,}/.exec(us.s), ux0 = us.x + pdfW(us.st, us.s.slice(0, m.index), us.fs), ux1 = ux0 + pdfW(us.st, m[0], us.fs); if (im.w / im.h < 1.3) { h = o.fs * 5.3; w = h * im.w / im.h; py = base - h * 0.44; px = Math.max(L, ux0 + (ux1 - ux0) * 0.55 - w / 2); } // 5.8: baland-ensiz (qiya) imzo — qogʻozdagidek katta (≈4–5 qator), chiziq imzoning oʻrtasidan oʻtadi, dumi pastga tushadi
                        else { if (w > ux1 - ux0 + 120) { w = ux1 - ux0 + 120; h = w * im.h / im.w; py = base - h * (1 - dn); } px = Math.max(L, (ux0 + ux1) / 2 - w / 2); } }
                    else {
                        const lo = Math.max(preEnd ? preEnd + 6 : L, same.filter(z => z !== o && end(z) < gx0 - 2).reduce((m, z) => Math.max(m, end(z) + 6), L)); // familiyadan oldingi matn (lavozim) oxiri
                        if (gx0 - 8 - lo >= 40) { if (w > gx0 - 8 - lo + 30) { w = gx0 - 8 - lo + 30; h = w * im.h / im.w; py = base - h * (1 - dn); } px = Math.max(lo - 30, gx0 - 8 - w); } // orada boʻsh joy bor
                        else { px = Math.max(L, gx0 - w * 0.8); py = base - h * (1 - dn); } // boʻsh joy yoʻq — familiya oldiga, qoʻl imzosidek biroz ustiga chiqib
                    }
                    ops.unshift({ k: 'img', x: px, y: py, w: w, h: h, data: im.data, pw: im.w, ph: im.h, cv: im.el }); // birinchi chiziladi: matn imzo ustida ko'rinadi (JPEG oq foni matnni yopmaydi)
                });
                // 3.17.0: elektron tasdiq jurnali (kim, qachon, hujjat izi) PDF ga yozilmaydi — faqat ilovada koʻrsatiladi va serverda saqlanadi
                if (d.demo) lay.pages.forEach(ops => { const t = g47Safe('DEMO — HAQIQIY HUJJAT EMAS'), fs = 13, tw = pdfW('Bold', t, fs); ops.push({ k: 't', x: (lay.P.W - tw) / 2, y: 22, s: t, st: 'Bold', fs: fs }, { k: 't', x: (lay.P.W - tw) / 2, y: lay.P.H - 14, s: t, st: 'Bold', fs: fs }); });
                return lay;
            }
        }
        async function sigPdfBlob(d) { const lay = await sigLayout(d); PDFK.f = null; return pdfBuild(lay); }
        async function sigPdf() {
            const d = SIG.cur; if (!d) return; showToast('⏳ PDF tayyorlanmoqda...');
            try { const blob = await sigPdfBlob(d); const name = String(d.title).replace(/[^\p{L}\d]+/gu, '_').slice(0, 60) + '_imzolangan.pdf'; docDownload([{ name: name, mime: 'application/pdf', blob: blob }]); if (await uiConfirm('PDF yuklab olindi. Telegram yoki pochta orqali ham yuborasizmi?')) docShare([{ name: name, mime: 'application/pdf', blob: blob }], { via: 'any', subject: d.title }); }
            catch (e) { console.error(e); alert('⚠️ PDF yaratilmadi: ' + agmkErrUz(e)); }
        }
        // ---------- ulanishlar: hisob menyusi, davriy tekshiruv ----------
        (function () {
            const a = $id('accountModal'); const mc = a && a.querySelector('.modal-content');
            if (mc && !$id('sgAccBtn')) { const b = document.createElement('button'); b.id = 'sgAccBtn'; b.className = 'save-btn'; b.style.cssText = 'margin-top:10px;background:linear-gradient(135deg,#7c3aed,#a855f7)'; b.textContent = '✍️ Mening imzom'; b.onclick = () => { a.classList.add('hidden'); sigOpenMine(); }; const b2 = document.createElement('button'); b2.className = 'save-btn'; b2.style.cssText = 'margin-top:10px;background:#1e293b;border:1px solid #7c3aed'; b2.textContent = '📥 Imzolash (hujjatlar)'; b2.onclick = () => { a.classList.add('hidden'); sigOpenList(); }; const ref = mc.querySelector('button'); mc.insertBefore(b2, ref); mc.insertBefore(b, b2); }
            SIG.timer = setInterval(() => { if (!document.hidden) sigPoll(); }, 30000);
            document.addEventListener('visibilitychange', () => { if (!document.hidden) sigPoll(); });
            window.addEventListener('agmk:login', () => setTimeout(() => { sigDemoEnsure(); sigPoll(true); }, 800));
            setTimeout(() => { sigPoll(true); sigDemoEnsure(); }, 5000); // ilova ochiq sessiya bilan ishga tushsa
        })();

