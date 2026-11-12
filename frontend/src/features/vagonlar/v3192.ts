        // =====================================================================
        // v3.19.2 — QR havola, maxsus kiyim (ombor), server QR skaneri
        //  • K-28: telefon kamerasi QR dagi «agmk://q/<tur>/<raqam>» havolasini ochadi → ilova (APK intent-filter)
        //          sahifani «#agmk=<havola>» bilan ochadi yoki ochiq ilovaga agmkDeepLink(havola) yuboradi → texnika pasporti.
        //          Kirish qilinmagan boʻlsa — kirgandan keyin ochiladi.
        //  • MTTB → «🧥 Maxsus kiyim»: barcha ishchi va xodimlar lavozimi bilan; bosilganda pasport emas, maxsus kiyim
        //          sahifasi (tabel, sex/ish joyi, lavozim, ish staji, ish joyi tarixi + norma va berilganlar). Ombor nazorat qiladi.
        //  • Server va texnika QR skaneri: rasm bir necha oʻlchamda va qirqib qayta oʻqiladi (ekrandan olingan zich QR uchun);
        //          QR oʻqilsa-yu, mos kelmasa — nima oʻqilgani koʻrsatiladi.
        // =====================================================================
        const Q2: any = window as any;

        // ---------- 1) QR rasmdan: bir necha urinish ----------
        async function qrDetectAll(file: Blob): Promise<string[]> {
            if (!('BarcodeDetector' in window)) throw new Error('Bu qurilmada QR oʻquvchi yoʻq');
            const det = new Q2.BarcodeDetector({ formats: ['qr_code'] }), out: string[] = [];
            const add = (r: any[]) => (r || []).forEach((x: any) => { const v = String((x && x.rawValue) || ''); if (v && out.indexOf(v) < 0) out.push(v); });
            const bm: any = await createImageBitmap(file);
            try { add(await det.detect(bm)); } catch (e) { /* */ }
            if (out.length) return out;
            const W = bm.width, H = bm.height, cv = document.createElement('canvas'), cx = cv.getContext('2d') as CanvasRenderingContext2D;
            // [kesim (ulush), maks. oʻlcham]: butun rasm kichraytirilgan, keyin markaz qirqilgan
            const tries: [number, number][] = [[1, 1600], [1, 1100], [1, 800], [0.7, 1400], [0.5, 1200], [0.85, 1000]];
            for (const [crop, max] of tries) {
                const sw = W * crop, sh = H * crop, sx = (W - sw) / 2, sy = (H - sh) / 2, k = Math.min(1, max / Math.max(sw, sh));
                cv.width = Math.round(sw * k); cv.height = Math.round(sh * k);
                cx.imageSmoothingEnabled = true; cx.filter = 'grayscale(1) contrast(1.4)'; cx.drawImage(bm, sx, sy, sw, sh, 0, 0, cv.width, cv.height); cx.filter = 'none';
                try { add(await det.detect(cv)); } catch (e) { /* */ }
                if (out.length) break;
            }
            try { bm.close && bm.close(); } catch (e) { /* */ }
            return out;
        }
        // Server ulanish QR i (Serverga ulanish → «📷 QR kodni skanerlash»)
        if (typeof Q2.srvQrFromImage === 'function') Q2.srvQrFromImage = async function (file: Blob): Promise<string> {
            const L = await qrDetectAll(file);
            if (!L.length) throw new Error('Rasmda QR kod topilmadi. Telefonni ekranga parallel tutib, QR butun kadrga sigʻadigan qilib, yaqinroqdan qayta rasmga oling (ekrandagi yorugʻlik aksi QR ustiga tushmasin).');
            const ok = L.find(t => !!Q2.srvParseQr(t)); if (ok) return ok;
            throw new Error('QR oʻqildi, lekin bu server ulanish kodi emas yoki toʻliq oʻqilmadi:\n«' + L[0].slice(0, 80) + (L[0].length > 80 ? '…' : '') + '»\n\nQayta rasmga oling yoki «Matn bilan ulash» ni tanlang.');
        };
        // Texnika QR skaneri (ilova ichida «📷 Rasmga olish» / «🖼 Rasmdan»)
        if (typeof Q2.qrFileGo === 'function') Q2.qrFileGo = async function (inp: any): Promise<void> {
            const file = inp && inp.files && inp.files[0]; if (!file) return; const msg = Q2.$id('qrScanMsg');
            try {
                if (msg) msg.textContent = '⏳ Rasm oʻqilmoqda…';
                const L = await qrDetectAll(file);
                if (!L.length) throw new Error('Rasmda QR kod topilmadi — yaqinroqdan, tekis qilib qayta rasmga oling');
                const ok = L.find(t => !!Q2.qrParse(t)) || L[0]; Q2.qrHit(ok);
            } catch (e: any) { if (msg) msg.textContent = '⚠️ ' + (e && e.message || e); }
        };

        // ---------- 2) K-28: havola orqali ochish ----------
        var DL: any = { pend: '' };
        function agmkDeepLink(url: string): boolean {
            const u = String(url || '').trim(); if (!u) return false;
            if (document.body.classList.contains('locked') || !((currentUser as any) && (currentUser as any).tabel)) { DL.pend = u; return false; } // kirgandan keyin
            const p = typeof Q2.qrParse === 'function' ? Q2.qrParse(u) : null;
            if (!p) { Q2.showToast('⚠️ Havola tanilmadi'); return false; }
            const v = Q2.qrFind(p);
            if (!v) { alert('⚠️ № ' + p.no + (p.inv ? ' (inv. ' + p.inv + ')' : '') + ' bazada topilmadi'); return false; }
            try { document.querySelectorAll('.modal-overlay').forEach((m: any) => { if (m.id !== 'lockScreen') m.classList.add('hidden'); }); } catch (e) { /* */ }
            try { Q2.openPassport(v.id); Q2.showToast('📷 ' + (v.kind ? Q2.hrName(v) : 'Vagon № ' + Q2.vagonNo(v))); } catch (e) { console.error(e); }
            return true;
        }
        function dlFromHash(): void {
            try {
                const m = String(location.hash || '').match(/[#&]agmk=([^&]+)/); if (!m) return;
                const u = decodeURIComponent(m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* */ }
                DL.pend = u; dlTry();
            } catch (e) { /* */ }
        }
        function dlTry(): void { if (!DL.pend) return; const u = DL.pend; DL.pend = ''; if (!agmkDeepLink(u)) { /* kirish kutilmoqda — DL.pend qayta yozildi */ } }
        window.addEventListener('agmk:login', () => setTimeout(dlTry, 1200));
        if (typeof Q2.hideLock === 'function') Q2.hideLock = Q2.agmkExtend('hideLock', 'v3.19.2: QR havola kirgandan keyin', Q2.hideLock, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(dlTry, 900); return r; });
        window.addEventListener('hashchange', dlFromHash);
        setTimeout(dlFromHash, 1800);

        // ---------- 3) MTTB → 🧥 Maxsus kiyim (omborchi uchun) ----------
        var KX: any = { q: '', u: '', x: null };
        function kxPeople(): any[] {
            try { return Q2.allXodims().map((r: any) => ({ it: r.item, su: r.su })).filter((r: any) => r.it && r.it.name && r.it.tabel); } catch (e) { return []; }
        }
        function kxSeh(r: any): string { return String((r.it && (r.it.seh || r.it.bolim)) || r.su || '').trim(); }
        function kxCard(): void {
            try {
                const list = Q2.$id('main-card-list'); if (!list || Q2.$id('kiyMttbCard') || !((currentUser as any) && (currentUser as any).tabel)) return;
                const c = document.createElement('div'); c.className = 'btn-card'; c.id = 'kiyMttbCard';
                c.setAttribute('data-search', 'maxsus kiyim ombor forma odejda spets kiyim kaska jilet botinka norma');
                c.onclick = () => { kxOpen(); };
                c.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🧥</span><span class="btn-text">Maxsus kiyim<small style="display:block;font-size:11px;opacity:.75">ishchi va xodimlar · berish · muddati kelganlar</small></span></div><span class="btn-arrow">›</span>';
                list.appendChild(c);
                if (typeof Q2.menuArrange === 'function') Q2.menuArrange();
            } catch (e) { /* */ }
        }
        (function (): void {
            try { const D: any[] = Q2.MENU_DEF; if (!Array.isArray(D) || D.some(d => d[0] === '9.2')) return; const i = D.findIndex(d => d[0] === '9.1'); D.splice(i >= 0 ? i + 1 : D.length, 0, ['9.2', (c: Element) => c.id === 'kiyMttbCard', 1, 'mttb']); } catch (e) { /* */ }
        })();
        window.addEventListener('agmk:login', () => setTimeout(kxCard, 1000));
        if (typeof Q2.hideLock === 'function') Q2.hideLock = Q2.agmkExtend('hideLock', 'v3.19.2: MTTB maxsus kiyim kartasi', Q2.hideLock, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(kxCard, 800); return r; });
        setTimeout(kxCard, 2600);

        function kxOpen(): void {
            Q2.secScreen('screen-kiyx', '🧥 Maxsus kiyim', "openScreen('screen-main')"); Q2.openScreen('screen-kiyx'); kxRender();
        }
        function kxRender(): void {
            const b = Q2.secBody('screen-kiyx'); if (!b) return; const E = Q2.escapeHtml, P = kxPeople();
            const S = Array.from(new Set(P.map(kxSeh).filter(Boolean))).sort((a: any, c: any) => String(a).localeCompare(String(c)));
            b.innerHTML = `<div class="kx-top"><button class="mini-btn" onclick="kiyOmbor()">📦 Muddati kelganlar</button><button class="mini-btn" onclick="kiyNorma()">📖 Normalar</button></div>
                <div class="kx-f"><input class="search-box" id="kxQ" placeholder="🔍 Ism, tabel yoki lavozim…" value="${E(KX.q)}" oninput="KX.q=this.value;clearTimeout(KX.t);KX.t=setTimeout(kxList,200)">
                <select id="kxU" onchange="KX.u=this.value;kxList()"><option value="">Barcha sexlar</option>${S.map((s: any) => `<option${KX.u === s ? ' selected' : ''}>${E(s)}</option>`).join('')}</select></div>
                <div id="kxL"></div>`;
            kxList();
        }
        function kxList(): void {
            const box = Q2.$id('kxL'); if (!box) return; const E = Q2.escapeHtml, n = (s: string) => (Q2.normTxt ? Q2.normTxt(s) : String(s || '').toLowerCase());
            const q = n(KX.q || ''), L = kxPeople().filter((r: any) => (!KX.u || kxSeh(r) === KX.u) && (!q || n([r.it.name, r.it.tabel, r.it.lavozim, kxSeh(r)].join(' ')).indexOf(q) >= 0))
                .sort((a: any, c: any) => String(a.it.name).localeCompare(String(c.it.name)));
            box.innerHTML = `<div class="vg-count">${L.length} ta xodim</div>` + L.slice(0, 300).map((r: any) => `<div class="my-row sm" onclick="kxPerson('${E(Q2.cleanTabel(r.it.tabel))}')"><div class="my-n"><b>${E(r.it.name)}</b><small>${E(r.it.lavozim || '—')} · ${E(kxSeh(r) || '—')} · tabel ${E(Q2.cleanTabel(r.it.tabel))}</small></div><span class="btn-arrow">›</span></div>`).join('')
                + (L.length > 300 ? `<div class="nd-tip">Yana ${L.length - 300} ta — qidiruv yoki sex boʻyicha toraytiring.</div>` : '');
        }
        function kxStaj(d: string): string {
            const t = Date.parse(String(d || '')); if (!t) return ''; const m = Math.floor((Date.now() - t) / (30.4375 * 864e5)); if (m < 0) return '';
            const y = Math.floor(m / 12), r = m % 12; return (y ? y + ' yil ' : '') + (r || !y ? r + ' oy' : '');
        }
        async function kxPerson(t: string): Promise<void> {
            const r = kxPeople().find((x: any) => Q2.cleanTabel(x.it.tabel) === t); KX.x = r ? { t: t, it: r.it, seh: kxSeh(r) } : { t: t };
            try { await Q2.kiyOpen(t); } catch (e) { /* */ }
            // server javob bermasa ham (oflayn) — xodim maʼlumoti koʻrinadi
            try { const m = Q2.$id('kiyM'); if (m && KX.x && !m.querySelector('.kx-inf')) { const h = m.querySelector('.px-h'); if (h) { const ttl = h.querySelector('b'); if (ttl && KX.x.it) ttl.textContent = '🧥 ' + KX.x.it.name; h.insertAdjacentHTML('afterend', kxInfoHtml()); } } } catch (e) { /* */ }
        }
        function kxInfoHtml(): string {
            const x = KX.x; if (!x || !x.it) return ''; const E = Q2.escapeHtml, it = x.it, H = (it.workHistory || []).slice().sort((a: any, c: any) => String(c.start || '').localeCompare(String(a.start || '')));
            const st = kxStaj(it.kirganSana);
            return `<div class="kx-inf"><div><span>Tabel</span><b>${E(x.t)}</b></div><div><span>Sex / ish joyi</span><b>${E(x.seh || '—')}</b></div><div><span>Lavozim</span><b>${E(it.lavozim || '—')}</b></div>
                <div><span>Ish staji</span><b>${st ? E(st) + (it.kirganSana ? ' <small>(' + E(Q2.fmtISO ? Q2.fmtISO(it.kirganSana) || it.kirganSana : it.kirganSana) + ' dan)</small>' : '') : '<small>ishga kirgan sana kiritilmagan</small>'}</b></div></div>
                <details class="kx-h"${H.length ? '' : ' open'}><summary>📜 Ish joyi tarixi (${H.length})</summary>${H.length ? H.map((h: any) => `<div><b>${E(h.lavozim || '—')}</b> · ${E(h.seh || '')}<small>${E(h.start || '?')} — ${E(h.end || 'hozirgacha')}</small></div>`).join('') : '<div class="nd-tip">Ish joyi tarixi kiritilmagan (Ishchi xodimlar → xodim pasporti).</div>'}</details>`;
        }
        if (typeof Q2.kiyRender === 'function') Q2.kiyRender = Q2.agmkExtend('kiyRender', 'v3.19.2: ombor uchun xodim maʼlumoti', Q2.kiyRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const x = KX.x, d = Q2.KY && Q2.KY.d; if (x && d && d.person && Q2.cleanTabel(d.person.tabel) === x.t) { const m = Q2.$id('kiyM'); const h0 = m && m.querySelector('.my-kh0'); if (h0 && !m.querySelector('.kx-inf')) h0.insertAdjacentHTML('beforebegin', kxInfoHtml()); } } catch (e) { console.error(e); }
            return r;
        });
        if (typeof Q2.mdlClose === 'function') Q2.mdlClose = Q2.agmkExtend('mdlClose', 'v3.19.2: maxsus kiyim (ombor)', Q2.mdlClose, (o: Function) => function (this: unknown, id: string) { if (id === 'kiyM') KX.x = null; return o.apply(this, arguments); });

        (function (): void {
            const st = document.createElement('style');
            st.textContent = `.kx-top{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.kx-f{display:flex;gap:8px;margin-bottom:6px}.kx-f input{flex:1;margin:0}.kx-f select{max-width:42%;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:6px}
.kx-inf{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 8px}.kx-inf div{background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:8px;padding:6px 8px}.kx-inf span{display:block;font-size:11px;color:#94a3b8}.kx-inf b{font-size:13px}.kx-inf small{font-weight:400;color:#94a3b8}
.kx-h{margin:0 0 8px}.kx-h summary{cursor:pointer;font-weight:700;padding:4px 0}.kx-h>div{padding:4px 0;border-bottom:1px solid rgba(148,163,184,.2);font-size:13px}.kx-h small{display:block;color:#94a3b8}
.my-pbtn .kiy-pcard{flex-basis:100%;margin:0}`;
            document.head.appendChild(st);
        })();
