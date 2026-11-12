        // =====================================================================
        // v3.19.3 — jonli QR skaner, server QR havolasi, maxsus kiyim shtat boʻyicha, pasport sarlavhasi (docs/KAMCHILIKLAR.md K-41–K-47)
        //  • K-41: QR skaner ilova ichida jonli kamera bilan ishlaydi (APK endi kameraga ruxsat beradi). QR kadrga tushishi bilan
        //          oʻzi taniydi: texnika yorligʻi → pasport, server QR → ulanish. BarcodeDetector boʻlmasa — jsQR (ichki, oflayn).
        //  • K-42: server paneli QR i — «agmk://ulan?h=IP:port&k=…&f=…» havolasi: telefon kamerasi ilovani ochadi va ulanadi.
        //          Eski JSON QR/matn ham qabul qilinadi.
        //  • K-43: «Matn bilan ulash» — eslatmaga koʻchirilganda manzil («u») yoʻqolsa ham kalit va sertifikat olinadi,
        //          manzil alohida soʻraladi (oxirgi maʼlum manzil taklif qilinadi).
        //  • K-44: MTTB → «🧥 Maxsus kiyim» — shtat tuzilmasi boʻyicha (boʻlinma → boʻlim/uchastka → lavozim → xodim), qidiruv bilan.
        //  • K-45: pasport sarlavhasi (Vagon № …) yarim shaffof karta ustida; «‹ … roʻyxatiga» — kichik dumaloq «‹».
        //  • K-46: ikonkalar (v3193img.ts) — kartalar qayta bezatiladi.
        // =====================================================================
        const Q3: any = window as any;
        var Q3S: any = { mode: '', cv: null, part: null };

        // ---------- jsQR (vendor/jsQR.js, Apache-2.0) — kerak boʻlganda yuklanadi ----------
        function q3Jsqr(): any {
            if (typeof Q3.jsQR === 'function') return Q3.jsQR;
            try { const s = document.getElementById('jsqrLibSrc'); if (!s) return null; const n = document.createElement('script'); n.text = s.textContent || ''; document.head.appendChild(n); } catch (e) { /* */ }
            return typeof Q3.jsQR === 'function' ? Q3.jsQR : null;
        }
        function q3Det(): any { try { return 'BarcodeDetector' in window ? new Q3.BarcodeDetector({ formats: ['qr_code'] }) : null; } catch (e) { return null; } }
        // bitta kadr/rasm: BarcodeDetector, boʻlmasa yoki topmasa — jsQR
        async function q3Decode(src: any, w: number, h: number, max?: number, crop?: number): Promise<string> {
            const det = q3Det();
            if (det && !crop) { try { const r = await det.detect(src); if (r && r.length && r[0].rawValue) return String(r[0].rawValue); } catch (e) { /* */ } }
            const J = q3Jsqr(); if (!J || !w || !h) return '';
            const c = crop || 1, sw = w * c, sh = h * c, sx = (w - sw) / 2, sy = (h - sh) / 2, k = Math.min(1, (max || 800) / Math.max(sw, sh));
            const cv: HTMLCanvasElement = Q3S.cv || (Q3S.cv = document.createElement('canvas')), cx = cv.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D;
            cv.width = Math.max(1, Math.round(sw * k)); cv.height = Math.max(1, Math.round(sh * k));
            cx.drawImage(src, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
            if (det && crop) { try { const r = await det.detect(cv); if (r && r.length && r[0].rawValue) return String(r[0].rawValue); } catch (e) { /* */ } }
            try { const d = cx.getImageData(0, 0, cv.width, cv.height), r = J(d.data, cv.width, cv.height, { inversionAttempts: 'attemptBoth' }); return r && r.data ? String(r.data) : ''; } catch (e) { return ''; }
        }
        // Rasm fayli: bir necha oʻlcham va qirqim (ekrandan olingan zich QR ham)
        Q3.qrDetectAll = async function (file: Blob): Promise<string[]> {
            const bm: any = await createImageBitmap(file), out: string[] = [];
            const tries: [number, number][] = [[1, 1600], [1, 1100], [1, 800], [0.7, 1400], [0.5, 1200], [0.85, 1000]];
            try {
                const a = await q3Decode(bm, bm.width, bm.height, 1600); if (a) out.push(a);
                for (const [c, m] of tries) { if (out.length) break; const r = await q3Decode(bm, bm.width, bm.height, m, c === 1 ? 0.999 : c); if (r) out.push(r); }
            } finally { try { bm.close && bm.close(); } catch (e) { /* */ } }
            return out;
        };
        if (typeof Q3.srvQrFromImage === 'function') Q3.srvQrFromImage = async function (file: Blob): Promise<string> {
            const L: string[] = await Q3.qrDetectAll(file);
            if (!L.length) throw new Error('Rasmda QR kod topilmadi. Telefonni ekranga parallel tutib, QR butun kadrga sigʻadigan qilib, yaqinroqdan qayta rasmga oling.');
            const ok = L.find(t => !!Q3.srvParseQr(t)); if (ok) return ok;
            throw new Error('QR oʻqildi, lekin bu server ulanish kodi emas:\n«' + L[0].slice(0, 80) + (L[0].length > 80 ? '…' : '') + '»');
        };

        // ---------- K-42/K-43: server QR — havola, JSON va buzilgan matn ----------
        function q3SrvNorm(txt: string): string {
            const s = String(txt || '');
            const m = s.match(/agmk:\/\/ulan\/?\?([^\s#"']+)/i);
            if (m) {
                const P = new URLSearchParams(m[1]), o: any = {}; let h = String(P.get('h') || P.get('u') || '').trim();
                if (h && !/^https:\/\//i.test(h)) h = 'https://' + h.replace(/^\w+:\/\//, '');
                o.u = h; o.k = P.get('k') || ''; o.f = P.get('f') || ''; o.n = P.get('n') || 'AGMK-STTB'; const e = P.get('e'); if (e) o.e = e;
                return JSON.stringify(o);
            }
            const flat = s.replace(/[\r\n\t\u00a0\u200b]+/g, '').trim();
            let j: any = null; try { j = JSON.parse(flat); } catch (e) { j = null; }
            if (j && /^https:\/\/[^\s"]+$/.test(String(j.u || ''))) return flat;
            const g = (re: RegExp) => { const x = flat.match(re); return x ? x[1] : ''; };
            const k = (j && j.k) || g(/"k"\s*:\s*"([^"]{20,})"/), f = (j && j.f) || g(/"f"\s*:\s*"([0-9a-fA-F:]{64,95})"/), e = (j && j.e) || g(/"e"\s*:\s*"(https:\/\/[^"]+)"/);
            const u = g(/"u"\s*:\s*"(https:\/\/[^"]+)"/) || g(/(https:\/\/(?:10|172|192|127)\.[\d.]+(?::\d+)?)/);
            Q3S.part = null;
            if (k && f && u) { const o: any = { u: u, k: k, f: f, n: 'AGMK-STTB' }; if (e) o.e = e; return JSON.stringify(o); }
            if (k && f) Q3S.part = { k: k, f: f, e: e };
            return s;
        }
        if (typeof Q3.srvParseQr === 'function') Q3.srvParseQr = Q3.agmkExtend('srvParseQr', 'v3.19.3: agmk://ulan havola va buzilgan matn', Q3.srvParseQr, (o: Function) => function (this: unknown, txt: string) {
            return o.call(this, q3SrvNorm(txt));
        });
        function q3LastUrl(): string { try { const c = Q3.syncGet(Q3.SYNC_CFG, null); return String((c && (c.lanUrl || c.url)) || '').replace(/^https:\/\//, ''); } catch (e) { return ''; } }
        Q3.srvText = async function (): Promise<void> {
            const t = await Q3.uiPrompt('Server panelidagi «Ulanish matni»ni (yoki QR havolasini) shu yerga qoʻying:', ''); if (!t) return;
            let q = Q3.srvParseQr(t);
            if (!q && Q3S.part) {
                const a = await Q3.uiPrompt('Matnda kalit bor, lekin server manzili yoʻqolgan (eslatma ilovasi manzilni alohida havolaga aylantirgan boʻlishi mumkin).\n\nServer manzilini kiriting, masalan: 10.0.0.5:8443', q3LastUrl());
                if (!a) return;
                let u = String(a).trim().replace(/^http:\/\//i, 'https://').replace(/\/+$/, ''); if (!/^https:\/\//i.test(u)) u = 'https://' + u; if (!/:\d+$/.test(u)) u += ':8443';
                const o: any = { u: u, k: Q3S.part.k, f: Q3S.part.f, n: 'AGMK-STTB' }; if (Q3S.part.e) o.e = Q3S.part.e;
                q = Q3.srvParseQr(JSON.stringify(o));
            }
            Q3.srvConnect(q);
        };
        // Havola (telefon kamerasi → ilova): ulanish kirishdan oldin ham ishlaydi
        if (typeof Q3.agmkDeepLink === 'function') Q3.agmkDeepLink = Q3.agmkExtend('agmkDeepLink', 'v3.19.3: agmk://ulan — serverga ulanish', Q3.agmkDeepLink, (o: Function) => function (this: unknown, url: string) {
            const u = String(url || '').trim();
            if (/^agmk:\/\/ulan/i.test(u)) { const q = Q3.srvParseQr(u); setTimeout(() => { try { Q3.srvConnect(q); } catch (e) { console.error(e); } }, 300); return true; }
            return o.apply(this, arguments);
        });

        // ---------- K-41: jonli QR skaner ----------
        function q3Locked(): boolean { return document.body.classList.contains('locked'); }
        // QR natijasi: server QR → ulanish; texnika → pasport (kirilmagan boʻlsa — kirgandan keyin)
        if (typeof Q3.qrHit === 'function') Q3.qrHit = Q3.agmkExtend('qrHit', 'v3.19.3: server QR va kirishdan oldin', Q3.qrHit, (o: Function) => function (this: unknown, raw: string) {
            const s = String(raw || '').trim(), msg = Q3.$id('qrScanMsg');
            const sq = Q3.srvParseQr(s);
            if (sq) { Q3.qrScanClose(); try { if (navigator.vibrate) navigator.vibrate(60); } catch (e) { /* */ } setTimeout(() => Q3.srvConnect(sq), 80); return true; }
            if (Q3S.mode === 'srv') { if (msg) msg.textContent = '⚠️ Bu server ulanish QR kodi emas: «' + s.slice(0, 50) + '» — server panelidagi QR ni koʻrsating.'; return false; }
            if (q3Locked()) {
                if (Q3.qrParse && Q3.qrParse(s)) { Q3.qrScanClose(); Q3.agmkDeepLink(s); Q3.showToast('🔐 Kirgandan keyin pasport ochiladi'); return true; }
                if (msg) msg.textContent = '⚠️ Tanilmadi: «' + s.slice(0, 50) + '»'; return false;
            }
            return o.apply(this, arguments);
        });
        Q3.qrScanOpen = function (mode?: string): void {
            Q3S.mode = mode === 'srv' ? 'srv' : '';
            const srv = Q3S.mode === 'srv';
            const m = Q3.mdl('qrScan', `<div class="px-h"><b>📷 ${srv ? 'Server QR kodi' : 'QR skaner'}</b><button class="mini-btn" onclick="qrScanClose()">✕</button></div>
                <div class="qr-cam" id="qrCamBox"><video id="qrVid" playsinline muted autoplay></video><i></i></div>
                <div class="nd-tip" id="qrScanMsg">⏳ Kamera ochilmoqda…</div>
                <div class="qr-act"><button class="mini-btn" onclick="qrPhoto(true)">📷 Rasmga olish</button><button class="mini-btn" onclick="qrPhoto()">🖼 Galereyadan</button><input type="file" id="qrFile" accept="image/*" capture="environment" style="display:none" onchange="qrFileGo(this)"></div>
                ${srv ? '' : `<div class="qr-man"><input class="search-box" id="qrManNo" inputmode="numeric" placeholder="yoki texnika raqami" onkeydown="if(event.key==='Enter')qrManGo()"><button class="mini-btn" onclick="qrManGo()">Ochish</button></div>`}`, false);
            try { if (m) m.style.zIndex = '30000'; } catch (e) { /* */ }
            Q3.qrLive();
        };
        Q3.qrLive = async function (): Promise<void> {
            const vid: any = Q3.$id('qrVid'), msg = Q3.$id('qrScanMsg'), md: any = navigator.mediaDevices, R = Q3.QRV;
            if (!vid || !md || !md.getUserMedia) { Q3.qrNoCam(); return; }
            try {
                Q3.qrStop(); R.stream = await md.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
                vid.srcObject = R.stream; await vid.play();
            } catch (e) { console.warn(e); Q3.qrNoCam(); return; }
            if (!q3Det() && !q3Jsqr()) { if (msg) msg.textContent = '⚠️ QR oʻquvchi topilmadi — «📷 Rasmga olish» ni bosing.'; return; }
            const tick = async (): Promise<void> => {
                if (!R.stream || !Q3.$id('qrVid')) return;
                try { if (vid.readyState >= 2 && !R.busy) { const t = await q3Decode(vid, vid.videoWidth, vid.videoHeight, 720); if (t && Q3.qrHit(t)) return; } } catch (e) { /* */ }
                R.timer = setTimeout(tick, 180);
            };
            if (msg) msg.textContent = Q3S.mode === 'srv' ? 'Kamerani kompyuter ekranidagi QR kodga qarating — oʻzi taniydi.' : 'Kamerani texnikadagi QR yorliqqa qarating — oʻzi taniydi.';
            tick();
        };
        // Kirish oynasidagi «📡 Serverga ulanish»: jonli skaner birinchi, rasm — zaxira
        if (typeof Q3.srvLockOpen === 'function') { const o0 = Q3.srvLockOpen; Q3.srvLockOpen = function (this: unknown) {
            const r = o0.apply(this, arguments);
            try {
                const box = Q3.$id('srvBox'), lb = box && box.querySelector('label.srv-opt') as HTMLElement;
                if (lb && !box.querySelector('.q3-live')) {
                    const b = document.createElement('button'); b.className = 'srv-opt q3-live'; b.setAttribute('type', 'button'); b.textContent = '📷 QR kodni skanerlash (kamera)';
                    b.onclick = () => { Q3.$id('srvModal').classList.add('hidden'); Q3.qrScanOpen('srv'); };
                    lb.parentNode && lb.parentNode.insertBefore(b, lb);
                    const inp = lb.querySelector('input'); if (inp) inp.removeAttribute('capture');
                    if (lb.firstChild && lb.firstChild.nodeType === 3) lb.firstChild.textContent = '🖼 QR rasmidan (galereya) ';
                }
            } catch (e) { /* */ }
            return r;
        }; }

        // ---------- K-44: MTTB → Maxsus kiyim — shtat tuzilmasi boʻyicha ----------
        function q3Kiy(id: any): void {
            try { const r = Q3.allXodims().find((x: any) => String(x.item.id) === String(id)); if (r && r.item.tabel) Q3.kxPerson(Q3.cleanTabel(r.item.tabel)); } catch (e) { console.error(e); }
        }
        Q3.q3Kiy = q3Kiy;
        Q3.kxOpen = function (): void {
            try { Q3.openXodimTree(); (XT as any).kiy = true; Q3.xtRender(); } catch (e) { console.error(e); }
        };
        if (typeof Q3.openXodimTree === 'function') Q3.openXodimTree = Q3.agmkExtend('openXodimTree', 'v3.19.3: maxsus kiyim rejimi oʻchadi', Q3.openXodimTree, (o: Function) => function (this: unknown) { try { (XT as any).kiy = false; } catch (e) { /* */ } return o.apply(this, arguments); });
        if (typeof Q3.xtRender === 'function') Q3.xtRender = Q3.agmkExtend('xtRender', 'v3.19.3: maxsus kiyim — shtat boʻyicha', Q3.xtRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const X: any = XT; if (!X || !X.kiy) return r;
                const box = Q3.$id('xtList'), tt = Q3.$id('xtTitle'), q = String((Q3.$id('xtSearch') || {}).value || '').trim(); if (!box) return r;
                box.querySelectorAll('.rs-card,.xt-tool').forEach((n: Element) => n.remove());
                box.querySelectorAll('.xt-vacant').forEach((n: any) => { n.removeAttribute('onclick'); n.classList.remove('can'); n.textContent = 'Boʻsh oʻrin'; });
                box.querySelectorAll('button.details-btn[onclick^="xtOpenXodim("]').forEach((b: any) => { b.setAttribute('onclick', b.getAttribute('onclick').replace('xtOpenXodim(', 'q3Kiy(')); b.textContent = '🧥 Maxsus kiyim'; });
                const fab = Q3.$id('xtFab'); if (fab) fab.classList.add('hidden');
                if (tt && tt.innerText.indexOf('🧥') !== 0) tt.innerText = '🧥 ' + (X.u || X.g || X.pos || X.none || X.w || q ? tt.innerText : 'Maxsus kiyim');
                if (!X.u && !X.g && !X.pos && !X.none && !X.w && !q) box.insertAdjacentHTML('afterbegin', `<div class="kx-top"><button class="mini-btn" onclick="kiyOmbor()">📦 Muddati kelganlar</button><button class="mini-btn" onclick="kiyNorma()">📖 Normalar</button></div><div class="nd-tip" style="margin-bottom:8px">Boʻlinma → boʻlim → lavozim → xodim. Xodimni bossangiz — uning maxsus kiyim kartasi.</div>`);
                const c = Q3.$id('xtCrumbs'), f = c && c.querySelector('span'); if (f) f.textContent = '🧥 Maxsus kiyim';
            } catch (e) { console.error(e); }
            return r;
        });
        if (typeof Q3.xtBack === 'function') Q3.xtBack = Q3.agmkExtend('xtBack', 'v3.19.3: maxsus kiyimdan MTTB ga', Q3.xtBack, (o: Function) => function (this: unknown) {
            try {
                const X: any = XT, q = String((Q3.$id('xtSearch') || {}).value || '').trim();
                if (X && X.kiy && !q && !X.u && !X.g && !X.pos && !X.none && !X.w) { X.kiy = false; if (typeof Q3.menuGrpOpen === 'function') Q3.menuGrpOpen('mttb'); else Q3.openScreen('screen-main'); return; }
            } catch (e) { /* */ }
            return o.apply(this, arguments);
        });
        if (typeof Q3.openScreen === 'function') Q3.openScreen = Q3.agmkExtend('openScreen', 'v3.19.3: maxsus kiyim rejimi', Q3.openScreen, (o: Function) => function (this: unknown, id: string) {
            try { if (id !== 'screen-xt' && (XT as any)) (XT as any).kiy = false; } catch (e) { /* */ }
            return o.apply(this, arguments);
        });

        // ---------- K-46: ikonkalar — kartalar qayta bezatiladi (pasportdagi kiyim kartasi ham) ----------
        if (typeof Q3.mkKey === 'function') Q3.mkKey = Q3.agmkExtend('mkKey', 'v3.19.3: maxsus kiyim kartalari', Q3.mkKey, (o: Function) => function (this: unknown, c: any) {
            if (c && c.classList && (c.classList.contains('kiy-pcard') || c.id === 'kiyMttbCard')) return 'kiy';
            if (c && c.id === 'myCard') return 'myw';
            return o.apply(this, arguments);
        });
        function q3Deco(): void {
            try {
                // rasmi yangilangan kalitlar (mm) — eski rasm qolmasin
                document.querySelectorAll('.btn-icon.mk-ic').forEach((i: any) => { const k = i.dataset.mk, im = i.querySelector('img'); if (k && im && Q3.MK_IMG[k] && im.getAttribute('src') !== Q3.MK_IMG[k]) delete i.dataset.mk; });
                if (typeof Q3.mkDecorate === 'function') Q3.mkDecorate(document);
            } catch (e) { /* */ }
        }
        var Q3T: any = 0;
        new MutationObserver(() => { if (!Q3T) Q3T = setTimeout(() => { Q3T = 0; if (document.querySelector('.kiy-pcard .btn-icon:not(.mk-ic),#kiyMttbCard .btn-icon:not(.mk-ic),#myCard .btn-icon:not(.mk-ic)')) q3Deco(); }, 250); }).observe(document.body, { childList: true, subtree: true });
        setTimeout(q3Deco, 1200); window.addEventListener('agmk:login', () => setTimeout(q3Deco, 1500));

        (function (): void {
            const st = document.createElement('style');
            st.textContent = `#screen-vagon-pasport .inner-header{align-items:center;gap:8px}
#pasportBackBtn{width:44px;height:44px;min-width:44px;flex:0 0 44px;border-radius:50%;padding:0!important;font-size:0!important;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.25);box-shadow:0 2px 8px rgba(0,0,0,.45);backdrop-filter:blur(4px);cursor:pointer}
#pasportBackBtn::before{content:'‹';font-size:30px;line-height:1;color:#fff;margin-top:-3px}
#pasport-header-title{background:rgba(15,23,42,.62);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:6px 14px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 2px 10px rgba(0,0,0,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62vw;margin:0 auto}
#qrScan .qr-cam video{width:100%;max-height:52vh;object-fit:cover;background:#000;border-radius:10px}`;
            document.head.appendChild(st);
        })();
