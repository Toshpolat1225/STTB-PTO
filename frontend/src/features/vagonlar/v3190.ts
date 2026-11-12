        // =====================================================================
        // v3.19.0 — Vagonga QR yorliq (docs/REJA.md, gʻoyalar zaxirasi 1-navbat)
        //  • Pasportda «🏷 QR yorliq»: yorliqni koʻrish va PDF/JPG qilib olish, chop etish, yuborish (yagona oyna)
        //  • Vagonlar roʻyxatida «🏷 QR yorliqlar»: roʻyxatdagi (filtrlangan) yoki tanlangan vagonlar — A4 varaqda 8 tadan, qirqish chiziqlari bilan
        //  • «📷 QR skaner»: kamera (jonli) yoki rasm → vagon pasporti (taʼmir tarixi, keyingi taʼmir sanasi bilan) ochiladi
        //  • QR ichida faqat vagon raqami va inventar raqami (ASCII): «AGMK-STTB VAGON <№> INV <inv>».
        //    Shaxsiy maʼlumot, server manzili yoki kalit yoʻq — yorliqni begona odam skanerlasa ham hech narsa ochilmaydi.
        //  • QR kod generatori: vendor/qrcode.js (Kazuhiko Arase, MIT), ilova ichida — internet kerak emas.
        // =====================================================================
        const QV: any = window as any;
        var QRV: any = { last: [], stream: null, timer: 0, busy: false, sel: 'list', kind: 'v' };

        function qrE(s: unknown): string { return QV.escapeHtml(String(s == null ? '' : s)); }
        function qrLib(): any {
            if (typeof QV.qrcode === 'function') return QV.qrcode;
            const src = document.getElementById('qrLibSrc'); if (!src) throw new Error('QR kutubxonasi topilmadi');
            const n = document.createElement('script'); n.text = src.textContent || ''; document.head.appendChild(n);
            if (typeof QV.qrcode !== 'function') throw new Error('QR kutubxonasi yuklanmadi');
            return QV.qrcode;
        }
        var QR_CYR: any = { 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'У': 'Y', 'а': 'a', 'в': 'b', 'е': 'e', 'к': 'k', 'м': 'm', 'н': 'h', 'о': 'o', 'р': 'p', 'с': 'c', 'т': 't', 'х': 'x', 'у': 'y' };
        // v4.6: avto raqamidagi kirill harflari (10-935ЕА) lotinga — QR da yoʻqolib ketmasin
        function qrAscii(s: unknown): string { return String(s == null ? '' : s).trim().replace(/[АВЕКМНОРСТХУавекмнорстху]/g, (c: string) => QR_CYR[c] || c).replace(/\s+/g, '').replace(/[^0-9A-Za-z\-\/.]/g, ''); }
        // v3.19.2 (K-28, K-32): QR barcha texnikaga va ilova havolasi bilan — agmk://q/<tur>/<raqam>?inv=<inv>
        //   tur: v vagon, l elektrovoz (lokomotiv), t teplovoz, a avtotraktor/ekskavator/maxsus, y yoʻl texnikasi, k yoʻl yotqizuvchi kran
        //   Telefon kamerasi havolani taniydi → «AGMK-STTB» ilovasi ochiladi → oʻsha texnika pasporti (Android: agmk://q intent-filter).
        //   Eski yorliqlar («AGMK-STTB VAGON <№> INV <inv>») ham oʻqilaveradi.
        // v4.7: QR tugmasi belgisi — toʻq fonda oq QR kod (muallif namunasi)
        var QR_ICO = '<svg class="qr-ico" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#1e293b"/><g fill="#fff"><path d="M4 4h6v6H4zM5.5 5.5v3h3v-3zM14 4h6v6h-6zM15.5 5.5v3h3v-3zM4 14h6v6H4zM5.5 15.5v3h3v-3z" fill-rule="evenodd"/><rect x="6.5" y="6.5" width="1" height="1"/><rect x="16.5" y="6.5" width="1" height="1"/><rect x="6.5" y="16.5" width="1" height="1"/><rect x="12" y="4" width="1.6" height="1.6"/><rect x="12" y="7.5" width="1.6" height="1.6"/><rect x="12" y="12" width="2" height="2"/><rect x="15" y="12" width="2" height="2"/><rect x="18" y="12" width="2" height="2"/><rect x="12" y="15" width="2" height="2"/><rect x="16" y="15.5" width="1.6" height="1.6"/><rect x="18.5" y="17" width="1.5" height="1.5"/><rect x="13" y="18" width="2" height="2"/><rect x="16" y="18.5" width="2" height="1.5"/></g></svg>';
        var QR_KIND: any = { v: ['VAGON', 'Vagon xizmati'], l: ['ELEKTROVOZ', 'Lokomotivlar'], t: ['TEPLOVOZ', 'Lokomotivlar'], a: ['AVTOTEXNIKA', 'Avtotraktor parki'], y: ['YOʻL TEXNIKASI', 'Yoʻl texnikasi'], k: ['KRAN', 'Yoʻl texnikasi'] };
        function qrIsLok(v: any): boolean { return !!v && (v.kind === 'lok' || (typeof QV.isLok === 'function' && QV.isLok(v))); }
        function qrKind(v: any): string {
            if (!v) return 'v'; if (qrIsLok(v)) { try { return typeof QV.hdKind === 'function' && QV.hdKind(v) === 'el' ? 'l' : 't'; } catch (e) { return 'l'; } }
            if (v.kind === 'avto') return 'a'; if (v.kind === 'yol') return /kran/i.test(String(v.type || '')) ? 'k' : 'y'; return 'v';
        }
        function qrText(v: any): string { const no = qrAscii(QV.vagonNo(v)), inv = qrAscii(v && v.inv); return 'agmk://q/' + qrKind(v) + '/' + encodeURIComponent(no) + (inv ? '?inv=' + encodeURIComponent(inv) : ''); }
        // QR matritsasi: true = qora katak
        function qrMatrix(text: string): boolean[][] {
            const Q = qrLib(), q = Q(0, 'M'); q.addData(text, 'Byte'); q.make();
            const n = q.getModuleCount(), M: boolean[][] = [];
            for (let r = 0; r < n; r++) { const row: boolean[] = []; for (let c = 0; c < n; c++) row.push(!!q.isDark(r, c)); M.push(row); }
            return M;
        }
        function qrSvg(text: string, px: number): string {
            const M = qrMatrix(text), n = M.length, z = 4, N = n + 2 * z; let d = '';
            M.forEach((row, r) => { let c = 0; while (c < n) { if (!row[c]) { c++; continue; } const s = c; while (c < n && row[c]) c++; d += 'M' + (s + z) + ' ' + (r + z) + 'h' + (c - s) + 'v1h-' + (c - s) + 'z'; } });
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${px}" height="${px}" shape-rendering="crispEdges"><rect width="${N}" height="${N}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
        }
        // skanerlangan matn → vagon
        function qrParse(s: string): any {
            const t = String(s || '').trim(), m = t.match(/AGMK-STTB\s+VAGON\s+([0-9A-Za-z\-\/.]+)(?:\s+INV\s+([0-9A-Za-z\-\/.]+))?/i);
            if (m) return { k: 'v', no: m[1], inv: m[2] || '' };
            const h = t.match(/^(?:agmk:\/\/q|https?:\/\/[^\/\s]+(?::\d+)?\/(?:agmk-)?q)\/([vltayk])\/([^?#\s\/]+)(?:\?([^#\s]*))?/i);
            if (h) { let inv = ''; try { inv = decodeURIComponent((String(h[3] || '').match(/(?:^|&)inv=([^&]*)/) || [])[1] || ''); } catch (e) { inv = ''; }
                let no = h[2]; try { no = decodeURIComponent(no); } catch (e) { /* */ } return { k: h[1].toLowerCase(), no: no, inv: inv }; }
            if (/^\d{3,10}$/.test(t)) return { no: t, inv: '' }; // qoʻlda kiritilgan raqam
            return null;
        }
        function qrVagons(): any[] { try { return QV.onlyVagons().filter((v: any) => !qrIsLok(v)); } catch (e) { return []; } }
        // barcha texnika (infratuzilma obyektlaridan tashqari); k — tur (yoʻq boʻlsa: hammasi, vagonlar oldinda)
        function qrUnits(k?: string): any[] {
            let A: any[] = []; try { A = ((vagonlarData as any) || []).filter((v: any) => v && v.kind !== 'infra'); } catch (e) { A = []; }
            if (!k) return qrVagons().concat(A.filter(v => v.kind || qrIsLok(v)));
            const grp = (x: string) => x === 'l' || x === 't' ? 'lok' : x === 'y' || x === 'k' ? 'yol' : x;
            return A.filter(v => grp(qrKind(v)) === grp(k));
        }
        function qrFind(p: any): any {
            const z = (x: unknown) => qrAscii(x).replace(/^0+/, '').toLowerCase(), no = z(p.no), inv = z(p.inv), U = qrUnits(p.k);
            const L = U.filter(v => z(QV.vagonNo(v)) === no);
            if (L.length > 1 && inv) { const x = L.find(v => z(v.inv) === inv); if (x) return x; }
            if (L.length) return L[0];
            if (inv) return U.find(v => z(v.inv) === inv) || null; // raqami oʻzgargan boʻlsa — inventar boʻyicha
            return null;
        }
        function qrKindOf(v: any): string[] { return QR_KIND[qrKind(v)] || QR_KIND.v; }

        // ---------- Yorliq (PDF sahifa joylashuvi) ----------
        const QR_MM = 72 / 25.4;
        function qrFit(s: string, st: string, fs: number, maxW: number, min: number): number { let f = fs; while (f > min && QV.pdfW(st, s, f) > maxW) f -= 0.5; return f; }
        function qrCut(s: string, st: string, fs: number, maxW: number): string { if (QV.pdfW(st, s, fs) <= maxW) return s; let t = s; while (t.length > 1 && QV.pdfW(st, t + '…', fs) > maxW) t = t.slice(0, -1); return t + '…'; }
        function qrLabel(ops: any[], v: any, x: number, y: number, w: number, h: number): void {
            const k = w / 265, txt = (xx: number, yy: number, s: string, st: string, fs: number) => { if (s) ops.push({ k: 't', x: xx, y: yy, s: s, st: st, fs: fs }); };
            const ln = (x1: number, y1: number, x2: number, y2: number, lw: number) => ops.push({ k: 'l', x1: x1, y1: y1, x2: x2, y2: y2, w: lw });
            // ramka (qirqish chizigʻi)
            ln(x, y, x + w, y, 0.6); ln(x + w, y, x + w, y + h, 0.6); ln(x + w, y + h, x, y + h, 0.6); ln(x, y + h, x, y, 0.6);
            const pad = 9 * k, KN = qrKindOf(v), head = '«Olmaliq KMK» AJ · STTB · ' + KN[1];
            txt(x + pad, y + pad + 9 * k, qrCut(head, 'Bold', 9 * k, w - 2 * pad), 'Bold', 9 * k);
            ln(x + pad, y + pad + 14 * k, x + w - pad, y + pad + 14 * k, 1.2 * k);
            // QR (chetidagi oq hoshiya bilan)
            const M = qrMatrix(qrText(v)), n = M.length, qs = Math.min(150 * k, h - pad * 2 - 34 * k), m = qs / n, qx = x + pad + 2 * m, qy = y + pad + 22 * k; // chap tomonda ≥ 2 katak oq hoshiya (ramka chizigʻi QR ga yopishmasin)
            M.forEach((row, r) => { let c = 0; while (c < n) { if (!row[c]) { c++; continue; } const s = c; while (c < n && row[c]) c++; ln(qx + s * m, qy + (r + 0.5) * m, qx + c * m, qy + (r + 0.5) * m, m + 0.06); } });
            // oʻng ustun
            const cx = qx + qs + 12 * k, cw = x + w - pad - cx, no = String(QV.vagonNo(v));
            let yy = qy + 12 * k; txt(cx, yy, KN[0] + ' №', 'Regular', 10 * k);
            const fno = qrFit(no, 'Bold', 30 * k, cw, 12 * k); yy += fno + 4 * k; txt(cx, yy, no, 'Bold', fno);
            yy += 20 * k; const ty = String((!v.kind && typeof QV.vTypeFull === 'function' ? QV.vTypeFull(v) : '') || v.naim || v.type || '').trim();
            if (ty) { txt(cx, yy, qrCut(ty, 'Regular', 9.5 * k, cw), 'Regular', 9.5 * k); yy += 14 * k; }
            if (v.model && v.model !== v.type) { txt(cx, yy, qrCut('Model: ' + v.model, 'Regular', 9 * k, cw), 'Regular', 9 * k); yy += 13 * k; }
            if (v.inv) { txt(cx, yy, qrCut('Inv. № ' + v.inv, 'Regular', 9.5 * k, cw), 'Regular', 9.5 * k); yy += 14 * k; }
            if (v.seh) { txt(cx, yy, qrCut('Seh: ' + v.seh, 'Regular', 9 * k, cw), 'Regular', 9 * k); }
            const foot = 'Telefon kamerasi bilan skanerlang — AGMK-STTB ilovasida pasport ochiladi';
            txt(x + pad, y + h - pad, qrCut(foot, 'Regular', 7.5 * k, w - 2 * pad), 'Regular', 7.5 * k);
        }
        function qrLayout(list: any[], big: boolean): any {
            const P = { W: 595.28, H: 841.89 }, mg = 10 * QR_MM, gap = 3 * QR_MM, pages: any[][] = [];
            if (big) { const w = 150 * QR_MM, h = w * 190 / 265; list.forEach(v => { const ops: any[] = []; qrLabel(ops, v, (P.W - w) / 2, 20 * QR_MM, w, h); pages.push(ops); }); return { P: P, pages: pages }; }
            const cols = 2, rows = 4, w = (P.W - 2 * mg - (cols - 1) * gap) / cols, h = (P.H - 2 * mg - (rows - 1) * gap) / rows;
            list.forEach((v, i) => { const j = i % (cols * rows); if (!j) pages.push([]); const ops = pages[pages.length - 1]; qrLabel(ops, v, mg + (j % cols) * (w + gap), mg + Math.floor(j / cols) * (h + gap), w, h); });
            return { P: P, pages: pages };
        }
        function qrPdf(list: any[], big: boolean, name: string): any {
            const lay = qrLayout(list, big);
            QV.PDFK.f = null; const blob = QV.pdfBuild(lay);
            try { if (QV.EXS) QV.EXS.set(blob, { lay: lay }); } catch (e) { /* */ }
            return { name: String(name).replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '') + '.pdf', mime: 'application/pdf', blob: blob };
        }
        function qrOut(list: any[], big: boolean, title: string): void {
            if (!list.length) { alert('Yorliq uchun texnika tanlanmadi'); return; }
            try {
                const f = qrPdf(list, big, title);
                if (typeof QV.exOpen === 'function') QV.exOpen([f], { title: title, act: 'dl' }); else QV.docDownload([f]);
            } catch (e) { console.error(e); alert('⚠️ ' + (QV.agmkErrUz ? QV.agmkErrUz(e) : String(e))); }
        }

        // ---------- Pasport: bitta vagon ----------
        function qrCurV(): any { return ((vagonlarData as any) || []).find((x: any) => x.id === activeVagonId); }
        function qrPassOpen(): void {
            const v = qrCurV(); if (!v) return; const t = qrText(v), KN = qrKindOf(v);
            QV.mdl('qrOne', `<div class="px-h"><b>🏷 QR yorliq — ${qrE(KN[0].toLowerCase())} № ${qrE(QV.vagonNo(v))}</b><button class="mini-btn" onclick="mdlClose('qrOne')">✕</button></div>
                <div class="qr-one"><div class="qr-box">${qrSvg(t, 220)}</div>
                <div class="qr-inf"><b>№ ${qrE(QV.vagonNo(v))}</b><span>${qrE((!v.kind && typeof QV.vTypeFull === 'function' ? QV.vTypeFull(v) : '') || v.naim || v.type || '')}</span>${v.inv ? `<span>Inv. № ${qrE(v.inv)}</span>` : ''}<small>QR ichida: <code>${qrE(t)}</code></small></div></div>
                <div class="qr-act"><button class="mini-btn" onclick="qrPassPdf(false)">📄 Yorliq (A4, katta)</button><button class="mini-btn" onclick="qrPassPdf(true)">🗂 8 nusxa (A4 varaq)</button></div>
                <div class="nd-tip">Yorliqni laminatlab yoki oʻz-oʻzidan yopishadigan plyonkaga chop etib, texnikaning koʻrinadigan joyiga (vagonda — ikki yon tomoniga) yopishtiring. Telefonning oddiy kamerasi bilan skanerlansa — AGMK-STTB ilovasi ochilib, shu pasport chiqadi. QR ichida faqat tur, raqam va inventar raqami bor — shaxsiy yoki server maʼlumoti yoʻq.</div>`, false);
        }
        function qrPassPdf(eight: boolean): void {
            const v = qrCurV(); if (!v) return; QV.mdlClose('qrOne');
            qrOut(eight ? Array.from({ length: 8 }, () => v) : [v], !eight, 'QR yorliq ' + qrKindOf(v)[0].toLowerCase() + ' ' + QV.vagonNo(v));
        }
        function qrPassBtn(): void {
            try {
                const v = qrCurV(), host = QV.$id('pasportMainTitle'); if (!host) return; const row = host.parentElement; if (!row) return;
                let b = QV.$id('qrPassB'); const ok = v && v.kind !== 'infra';
                if (!ok) { if (b) b.remove(); return; }
                if (!b) { b = document.createElement('button'); b.id = 'qrPassB'; b.className = 'qr-pb ppi-hide'; b.innerHTML = QR_ICO + '<span>QR</span>'; b.title = 'QR yorliq'; b.onclick = qrPassOpen; const ed = row.querySelector('button'); row.insertBefore(b, ed); }
            } catch (e) { console.error(e); }
        }
        if (typeof QV.openPassport === 'function') QV.openPassport = QV.agmkExtend('openPassport', 'v3.19.0: QR yorliq tugmasi', QV.openPassport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); qrPassBtn(); return r; });

        // ---------- Roʻyxat: koʻp vagon ----------
        if (typeof QV.renderVagonlar === 'function') QV.renderVagonlar = QV.agmkExtend('renderVagonlar', 'v3.19.0: QR yorliqlar uchun roʻyxat', QV.renderVagonlar, (o: Function) => function (this: unknown, data: any[]) { try { QRV.last = (data || []).slice(); } catch (e) { /* */ } return o.apply(this, arguments); });
        // k: 'v' vagonlar (standart), 'lok', 'avto', 'yol' — oʻsha ekrandagi texnika
        var QR_LIST_T: any = { v: 'vagon', lok: 'lokomotiv', avto: 'avtotexnika', yol: 'yoʻl texnikasi' };
        function qrPool(k: string): any[] { return k === 'lok' ? qrUnits('l') : k === 'avto' ? qrUnits('a') : k === 'yol' ? qrUnits('y') : qrVagons(); }
        function qrShown(k: string): any[] {
            if (k === 'v') return QRV.last.filter((v: any) => !v.kind && !qrIsLok(v));
            const box = QV.$id(k + 'List'), ids: number[] = []; if (!box) return [];
            box.querySelectorAll('[onclick*="openPassport("]').forEach((e: any) => { const m = String(e.getAttribute('onclick') || '').match(/openPassport\((\d+)\)/); if (m && ids.indexOf(+m[1]) < 0) ids.push(+m[1]); });
            const A = (vagonlarData as any) || []; return ids.map(id => A.find((x: any) => x.id === id)).filter(Boolean);
        }
        function qrListOpen(k?: string): void {
            QRV.kind = k || 'v'; const kt = QR_LIST_T[QRV.kind] || 'texnika';
            const n = qrShown(QRV.kind).length, all = qrPool(QRV.kind).length, o = (k: string, t: string) => `<label class="qr-opt"><input type="radio" name="qrSel" value="${k}" ${QRV.sel === k ? 'checked' : ''} onchange="QRV.sel=this.value;qrSelUi()"> ${t}</label>`;
            QV.mdl('qrList', `<div class="px-h"><b>🏷 QR yorliqlar</b><button class="mini-btn" onclick="mdlClose('qrList')">✕</button></div>
                ${o('list', 'Hozirgi roʻyxat (qidiruv va filtr boʻyicha) — <b>' + n + '</b> ta')}${o('all', 'Barcha ' + kt + 'lar — <b>' + all + '</b> ta')}${o('nums', 'Raqamlar boʻyicha')}
                <textarea id="qrNums" class="search-box qr-nums" placeholder="Raqamlar: vergul, boʻsh joy yoki yangi qator bilan (masalan: 1012, 1015, 1020-1025)"></textarea>
                <div class="nd-tip">A4 varaqda 8 ta yorliq (90×70 mm atrofida), qirqish chiziqlari bilan. Laminatlang yoki yopishqoq plyonkaga chop eting.</div>
                <div class="qr-act"><button class="mini-btn hi" onclick="qrListGo()">📄 Yorliqlarni tayyorlash</button></div>`, false);
            qrSelUi();
        }
        function qrSelUi(): void { const t = QV.$id('qrNums'); if (t) t.style.display = QRV.sel === 'nums' ? '' : 'none'; }
        function qrNums(s: string): string[] {
            const out: string[] = [];
            String(s || '').split(/[\s,;]+/).filter(Boolean).forEach(p => { const m = p.match(/^(\d+)-(\d+)$/); if (m && +m[2] >= +m[1] && +m[2] - +m[1] <= 500) { for (let i = +m[1]; i <= +m[2]; i++) out.push(String(i)); } else out.push(p); });
            return out;
        }
        function qrListGo(): void {
            let L: any[] = [], miss: string[] = [];
            const K = QRV.kind || 'v', kk = K === 'lok' ? 'l' : K === 'avto' ? 'a' : K === 'yol' ? 'y' : 'v';
            if (QRV.sel === 'all') L = qrPool(K);
            else if (QRV.sel === 'nums') { qrNums((QV.$id('qrNums') || {}).value).forEach(no => { const v = qrFind({ k: kk, no: no, inv: '' }); if (v) { if (L.indexOf(v) < 0) L.push(v); } else miss.push(no); }); }
            else L = qrShown(K);
            if (!L.length) { alert(miss.length ? 'Bazada topilmadi: ' + miss.join(', ') : 'Yorliq uchun texnika yoʻq'); return; }
            if (L.length > 400 && !confirm(L.length + ' ta yorliq (' + Math.ceil(L.length / 8) + ' varaq) tayyorlansinmi?')) return;
            QV.mdlClose('qrList');
            if (miss.length) QV.showToast('⚠️ Bazada topilmadi: ' + miss.slice(0, 10).join(', ') + (miss.length > 10 ? ' …' : ''));
            qrOut(L, false, 'QR yorliqlar ' + L.length + ' ta ' + (QR_LIST_T[K] || 'texnika'));
        }

        // ---------- 📷 QR skaner ----------
        function qrDetector(): any { try { return 'BarcodeDetector' in window ? new QV.BarcodeDetector({ formats: ['qr_code'] }) : null; } catch (e) { return null; } }
        function qrScanOpen(): void {
            const det = qrDetector();
            QV.mdl('qrScan', `<div class="px-h"><b>📷 QR skaner</b><button class="mini-btn" onclick="qrScanClose()">✕</button></div>
                <div class="qr-cam${det ? '' : ' hidden'}" id="qrCamBox"><video id="qrVid" playsinline muted></video><i></i></div>
                <div class="nd-tip" id="qrScanMsg">${det ? 'Kamerani texnikadagi QR yorliqqa qarating…' : 'Bu qurilmada QR oʻquvchi yoʻq — texnika raqamini qoʻlda kiriting.'}</div>
                <div class="qr-act">${det ? '<button class="mini-btn" onclick="qrPhoto()">🖼 Rasmdan</button>' : ''}<input type="file" id="qrFile" accept="image/*" capture="environment" style="display:none" onchange="qrFileGo(this)"></div>
                <div class="qr-man"><input class="search-box" id="qrManNo" inputmode="numeric" placeholder="yoki texnika raqami" onkeydown="if(event.key==='Enter')qrManGo()"><button class="mini-btn" onclick="qrManGo()">Ochish</button></div>`, false);
            if (!det) return;
            // ilova (APK) ichida WebView jonli kameraga ruxsat bermaydi — darhol telefon kamerasi bilan suratga olish
            if (QV.AgmkNative) { qrNoCam(true); return; }
            qrLive(det);
        }
        function qrStop(): void { try { if (QRV.timer) clearTimeout(QRV.timer); QRV.timer = 0; if (QRV.stream) QRV.stream.getTracks().forEach((t: any) => t.stop()); QRV.stream = null; } catch (e) { /* */ } }
        function qrScanClose(): void { qrStop(); QV.mdlClose('qrScan'); }
        async function qrLive(det: any): Promise<void> {
            const vid: any = QV.$id('qrVid'), msg = QV.$id('qrScanMsg'), md: any = navigator.mediaDevices;
            if (!vid || !md || !md.getUserMedia) { qrNoCam(); return; }
            try {
                qrStop(); QRV.stream = await md.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
                vid.srcObject = QRV.stream; await vid.play();
            } catch (e) { console.warn(e); qrNoCam(); return; }
            const tick = async () => {
                if (!QRV.stream) return;
                try { if (vid.readyState >= 2 && !QRV.busy) { const r = await det.detect(vid); if (r && r.length && qrHit(r[0].rawValue)) return; } } catch (e) { /* */ }
                QRV.timer = setTimeout(tick, 250);
            };
            if (msg) msg.textContent = 'Kamerani texnikadagi QR yorliqqa qarating…'; tick();
        }
        function qrNoCam(plain?: boolean): void {
            const b = QV.$id('qrCamBox'), msg = QV.$id('qrScanMsg'); if (b) b.classList.add('hidden');
            if (msg) msg.textContent = plain ? '«📷 Rasmga olish» → kamerani tanlang va QR yorliqni yaqindan, tekis suratga oling.' : 'Jonli kamera ochilmadi — «📷 Rasmga olish» bilan QR yorliqni suratga oling yoki raqamni kiriting.';
            const a = document.querySelector('#qrScan .qr-act'); if (a && !a.querySelector('.qr-shot')) a.insertAdjacentHTML('afterbegin', '<button class="mini-btn qr-shot" onclick="qrPhoto(true)">📷 Rasmga olish</button>');
        }
        function qrPhoto(cam?: boolean): void { const f: any = QV.$id('qrFile'); if (!f) return; if (cam) f.setAttribute('capture', 'environment'); else f.removeAttribute('capture'); f.value = ''; f.click(); }
        async function qrFileGo(inp: any): Promise<void> {
            const file = inp && inp.files && inp.files[0]; if (!file) return; const det = qrDetector(), msg = QV.$id('qrScanMsg');
            if (!det) { alert('Bu qurilmada QR oʻquvchi yoʻq — texnika raqamini qoʻlda kiriting'); return; }
            try { const bm = await createImageBitmap(file), r = await det.detect(bm); if (!r.length) throw new Error('Rasmda QR kod topilmadi — yaqinroqdan, tekis qilib qayta rasmga oling'); qrHit(r[0].rawValue); }
            catch (e: any) { if (msg) msg.textContent = '⚠️ ' + (e && e.message || e); }
        }
        function qrManGo(): void { const t = String((QV.$id('qrManNo') || {}).value || '').trim(); if (!t) return; if (!qrHit(t)) { /* xabar qrHit ichida */ } }
        // true — vagon topildi va pasport ochildi
        function qrHit(raw: string): boolean {
            const msg = QV.$id('qrScanMsg'), p = qrParse(raw);
            if (!p) { if (msg) msg.textContent = '⚠️ Bu AGMK-STTB yorligʻi emas: «' + String(raw || '').slice(0, 60) + '»'; return false; }
            const v = qrFind(p);
            if (!v) { if (msg) msg.textContent = '⚠️ ' + (p.k && QR_KIND[p.k] ? QR_KIND[p.k][0].charAt(0) + QR_KIND[p.k][0].slice(1).toLowerCase() : 'Texnika') + ' № ' + p.no + (p.inv ? ' (inv. ' + p.inv + ')' : '') + ' bazada topilmadi'; return false; }
            QRV.busy = true; qrScanClose();
            try { if (typeof QV.vibrate === 'function') QV.vibrate(60); else if (navigator.vibrate) navigator.vibrate(60); } catch (e) { /* */ }
            try { QV.openPassport(v.id); QV.showToast('📷 ' + (v.kind ? QV.hrName ? QV.hrName(v) : '№ ' + QV.vagonNo(v) : 'Vagon № ' + QV.vagonNo(v)) + (v.keyingi ? ' · keyingi taʼmir: ' + (QV.fmtISO(v.keyingi) || v.keyingi) : '')); } catch (e) { console.error(e); }
            setTimeout(() => { QRV.busy = false; }, 500);
            return true;
        }
        // modal yopilganda kamera ham oʻchsin (✕ dan boshqa yoʻl bilan yopilsa ham)
        if (typeof QV.mdlClose === 'function') QV.mdlClose = QV.agmkExtend('mdlClose', 'v3.19.0: QR kamera', QV.mdlClose, (o: Function) => function (this: unknown, id: string) { if (id === 'qrScan') qrStop(); return o.apply(this, arguments); });

        // ---------- Tugmalar (Vagonlar ekrani) ----------
        (function () {
            try {
                // har bir texnika ekranida (vagon, lokomotiv, avto, yoʻl): «📷 QR skaner» va «🏷 QR yorliqlar»
                document.querySelectorAll('.sp-link-row').forEach((row: any) => {
                    if (row.querySelector('.qr-lb')) return; const m = String((row.querySelector('[onclick^="openSP("]') || { getAttribute: () => '' }).getAttribute('onclick') || '').match(/openSP\('(\w+)'/), k = m ? (m[1] === 'vag' ? 'v' : m[1]) : '';
                    if (!k || !QR_LIST_T[k]) return;
                    row.insertAdjacentHTML('beforeend', `<button class="mini-btn qr-lb" onclick="qrScanOpen()">📷 QR skaner</button><button class="mini-btn qr-lb" onclick="qrListOpen('${k}')">🏷 QR yorliqlar</button>`);
                });
            } catch (e) { console.error(e); }
            const st = document.createElement('style'); st.textContent = `.sp-link-row{display:flex;gap:8px;flex-wrap:wrap}
                .qr-pb{display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,.12);border:1px solid #38bdf8;color:#38bdf8;border-radius:999px;font-size:14px;font-weight:700;padding:3px 12px 3px 4px;margin-left:auto;margin-right:8px;cursor:pointer}.qr-pb .qr-ico{width:22px;height:22px;flex:none}
                .qr-one{display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center;margin:8px 0}.qr-box{background:#fff;padding:6px;border-radius:8px;line-height:0}
                .qr-inf{display:flex;flex-direction:column;gap:4px;min-width:150px}.qr-inf b{font-size:22px}.qr-inf small{color:#94a3b8;font-size:11px;word-break:break-all}.qr-inf code{font-size:11px}
                .qr-act{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.qr-act .hi{font-weight:700}
                .qr-opt{display:block;margin:6px 0;font-size:14px}.qr-nums{width:100%;min-height:70px;box-sizing:border-box;margin-top:6px}
                .qr-cam{position:relative;width:100%;max-width:420px;margin:6px auto;aspect-ratio:1/1;overflow:hidden;border-radius:12px;background:#000}.qr-cam video{width:100%;height:100%;object-fit:cover}
                .qr-cam i{position:absolute;left:18%;top:18%;right:18%;bottom:18%;border:3px solid rgba(74,222,128,.9);border-radius:10px;box-shadow:0 0 0 999px rgba(0,0,0,.35)}
                .qr-man{display:flex;gap:8px;align-items:center}.qr-man input{flex:1;margin:0}`;
            document.head.appendChild(st);
        })();
