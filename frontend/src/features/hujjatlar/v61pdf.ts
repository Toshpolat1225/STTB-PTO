        // =====================================================================
        // 6.1 — 18 va 19-bandlar (muallif 08:59, 09:04, 09:09)
        //  18) Pasport PDF: a) sarlavhaning oʻng tomonida (avval «Soz» turgan joy) texnika QR kodi — yorliqdagi bilan bir xil
        //      (agmk://q/…), ostida «VAGON № 8121 · inv 37557»; holati (Soz …) sarlavha ostiga oʻtadi.
        //      b) qaysi maʼlumot chiqishini TANLASH — vagonlar roʻyxatini yuklashdagi «Ustunlar» kabi: rasm, QR, har bir maydon,
        //      boʻlimlar (Kartoteka, Taʼmir holati, Probeg, Taʼmir tarixi), imzo qatorlari. Tayyor toʻplamlar: «Toʻliq»,
        //      «Komissiya uchun qisqa» (QR, inventar, ishlab chiqarilgan yili, model), «Faqat QR». Belgilanmagan qism PDF ga
        //      umuman chiqmaydi; oxirgi tanlov eslab qolinadi.
        //  19) Roʻyxatni yuklash → «Ustunlar» da «🏷 QR kod»: faqat u tanlansa — QR YORLIQLAR varagʻi: A4 da 35 ta (5 × 7),
        //      har biri 40 × 40 mm (QR ≈ 23 mm), chetlar 5 / 8,5 mm, bitta ingichka qirqish chizigʻi, pastki izohsiz;
        //      uslub — muallif tanlagan «QR_yorliq_vagon_8121» (QR chapda, VAGON № oʻngda). Vektor PDF (sifatli, kichik hajm).
        //      QR boshqa ustunlar bilan birga tanlansa — jadvalda QR havolasi matni.
        // =====================================================================
        const R61: any = window as any;

        // ---------- umumiy: QR rasmi (SVG, vektor) ----------
        function r61QrSvg(text: string): string {
            const M = R61.qrMatrix(text), n = M.length, q = 2; let d = '';
            M.forEach((row: boolean[], r: number) => { let c = 0; while (c < n) { if (!row[c]) { c++; continue; } const s = c; while (c < n && row[c]) c++; d += `M${s + q} ${r + q}h${c - s}v1h-${c - s}z`; } });
            const N = n + 2 * q; return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges"><rect width="${N}" height="${N}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`);
        }
        function r61No(v: any): string { try { return String(R61.vagonNo(v)); } catch (e) { return String((v && (v.num || v.id)) || ''); } }

        // ---------- 18) pasport PDF ----------
        var R61P: any = { key: 'agmk_p8_cfg61', D: null, off: new Set<string>(), mode: 'c' };
        function r61Load(): void { try { const a = JSON.parse(localStorage.getItem(R61P.key) || 'null'); if (a && Array.isArray(a.off)) { R61P.off = new Set(a.off); R61P.mode = a.mode === 'bw' ? 'bw' : 'c'; } } catch (e) { /* */ } }
        function r61Save(): void { try { localStorage.setItem(R61P.key, JSON.stringify({ off: Array.from(R61P.off), mode: R61P.mode })); } catch (e) { /* */ } }
        r61Load();
        // maydonlar roʻyxati (ochiq pasportdan): {id, t, g}
        function r61Fields(D: any): any[] {
            const F: any[] = [{ id: 'x:qr', t: '🏷 QR kod', g: 'Asosiy' }, { id: 'x:img', t: '🖼 Rasm', g: 'Asosiy' }, { id: 'x:st', t: 'Holati (Soz / Taʼmirda …)', g: 'Asosiy' }];
            (D.main || []).forEach((p: any) => F.push({ id: 'm:' + p[0], t: p[0], g: 'Asosiy' }));
            (D.S || []).forEach((s: any) => {
                if (s.f) s.f.forEach((p: any) => F.push({ id: 's:' + s.t + ':' + p[0], t: p[0], g: s.t }));
                else F.push({ id: 'b:' + s.t, t: s.t + (s.tb ? ' (jadval)' : ''), g: s.t });
            });
            F.push({ id: 'x:sg', t: 'Imzo qatorlari (Tuzdi / Tekshirdi)', g: 'Oxiri' });
            return F;
        }
        function r61On(id: string): boolean { return !R61P.off.has(id); }
        if (typeof R61.p8Collect === 'function') {
            const _c = R61.p8Collect;
            R61.p8Collect = function (this: unknown) {
                const D = _c.apply(this, arguments); if (!D || R61P.raw) return D;
                try {
                    const v = (document.querySelector('.screen.active') || {} as any).id === 'screen-vagon-pasport' && typeof R61.h8V === 'function' ? R61.h8V() : null;
                    if (v && r61On('x:qr') && typeof R61.qrText === 'function') { const KN = typeof R61.qrKindOf === 'function' ? R61.qrKindOf(v) : ['VAGON']; D.qr = r61QrSvg(R61.qrText(v)); D.qrT = KN[0] + ' № ' + r61No(v) + (v.inv ? ' · inv ' + v.inv : ''); }
                    if (!r61On('x:img')) D.img = '';
                    if (!r61On('x:st')) D.st = '';
                    D.main = (D.main || []).filter((p: any) => r61On('m:' + p[0]));
                    D.S = (D.S || []).map((s: any) => { if (s.f) { const f = s.f.filter((p: any) => r61On('s:' + s.t + ':' + p[0])); return f.length ? Object.assign({}, s, { f: f }) : null; } return r61On('b:' + s.t) ? s : null; }).filter(Boolean);
                    D.noSg = !r61On('x:sg');
                } catch (e) { console.error('6.1 pasport PDF', e); }
                return D;
            };
        }
        if (typeof R61.p8Blocks === 'function') {
            const _b = R61.p8Blocks;
            R61.p8Blocks = function (this: unknown, D: any) {
                const B = _b.apply(this, arguments);
                try {
                    if (D && D.qr && B[0] && B[0].h) {
                        const E = R61.escapeHtml, st = D.st ? `<div class="st61${D.ok ? '' : ' bad'}">${E(D.st)}</div>` : '';
                        let h = B[0].h; h = h.replace(/<div class="st( bad)?">[\s\S]*?<\/div>(?=<\/div><\/div>$)/, '');
                        h = h.replace(/(<div class="sb">[\s\S]*?<\/div>)/, '$1' + st);
                        h = h.replace(/<\/div><\/div>$/, `<div class="qr61"><img src="${D.qr}"/><small>${E(D.qrT || '')}</small></div></div></div>`);
                        B[0].h = h;
                    }
                    if (D && !D.img && !(D.main || []).length && B[1] && /class="hero"/.test(B[1].h || '')) B.splice(1, 1);
                    if (D && D.noSg && B.length && /class="sg"/.test(B[B.length - 1].h || '')) B.pop();
                } catch (e) { console.error('6.1 pasport PDF', e); }
                return B;
            };
        }
        try { if (typeof R61.P8_CSS === 'string') R61.P8_CSS += `.p8 .qr61{display:flex;flex-direction:column;align-items:center;gap:3px;flex:none}.p8 .qr61 img{width:104px;height:104px;display:block;background:#fff;padding:3px;border-radius:4px}.p8 .qr61 small{font-size:9.5px;font-weight:700;white-space:nowrap}
.p8 .st61{font-size:12px;font-weight:700;margin-top:3px}.p8.c .st61{color:#4ade80}.p8.c .st61.bad{color:#fb923c}.p8.b .st61{color:#000}.p8.b .qr61 img{border:0}`; } catch (e) { /* */ }
        function r61Draw(): void {
            const b = R61.$id('r61B'); if (!b) return; const D = R61P.D, E = R61.escapeHtml; if (!D) return;
            const F = r61Fields(D), G: string[] = []; F.forEach(f => { if (G.indexOf(f.g) < 0) G.push(f.g); });
            const onN = F.filter(f => r61On(f.id)).length;
            b.innerHTML = `<div class="r61-m"><span class="${R61P.mode === 'c' ? 'on' : ''}" onclick="r61Mode('c')">🎨 Rangli</span><span class="${R61P.mode === 'bw' ? 'on' : ''}" onclick="r61Mode('bw')">⬜ Rangsiz (pechat)</span></div>
                <div class="r61-pre"><span onclick="r61Pre('all')">Toʻliq</span><span onclick="r61Pre('kom')">Komissiya uchun qisqa</span><span onclick="r61Pre('qr')">Faqat QR</span></div>
                <div class="r61-l">${G.map(g => `<div class="r61-g">${E(g)}</div>` + F.filter(f => f.g === g).map(f => `<div class="r61-r" data-id="${E(f.id)}" onclick="r61T(this)"><span class="yk-cb${r61On(f.id) ? ' on' : ''}">${r61On(f.id) ? '✓' : ''}</span>${E(f.t)}</div>`).join('')).join('')}</div>
                <button class="action-btn r61-go" onclick="r61Go()">📄 PDF yuklash · ${onN} / ${F.length} belgilangan</button>
                <div class="nd-tip">Belgilanmagan maʼlumot PDF ga chiqmaydi. Tanlov eslab qolinadi.</div>`;
        }
        function r61Mode(m: string): void { R61P.mode = m === 'bw' ? 'bw' : 'c'; r61Save(); r61Draw(); }
        function r61T(el: any): void { const id = el.getAttribute('data-id'); if (R61P.off.has(id)) R61P.off.delete(id); else R61P.off.add(id); r61Save(); r61Draw(); }
        function r61Pre(p: string): void {
            if (!R61P.D) { R61P.raw = true; try { R61P.D = R61.p8Collect(); } catch (e) { /* */ } R61P.raw = false; } if (!R61P.D) return;
            const F = r61Fields(R61P.D); R61P.off = new Set();
            if (p === 'kom') F.forEach(f => { const keep = f.id === 'x:qr' || (f.g === 'Asosiy' && /inventar|ishlab chiqarilgan|chiqarilgan yil|model/i.test(f.t)); if (!keep) R61P.off.add(f.id); });
            if (p === 'qr') F.forEach(f => { if (f.id !== 'x:qr') R61P.off.add(f.id); });
            r61Save(); r61Draw();
        }
        function r61Go(): void { R61.mdlClose('p8M'); R61.p8Make(R61P.mode === 'bw' ? 'bw' : 'c'); }
        if (typeof R61.p8Open === 'function') {
            const _o = R61.p8Open;
            R61.p8Open = function (this: unknown) {
                R61P.raw = true; let D: any = null; try { D = R61.p8Collect(); } catch (e) { /* */ } R61P.raw = false;
                if (!D || (document.querySelector('.screen.active') || {} as any).id !== 'screen-vagon-pasport') return _o.apply(this, arguments);
                R61P.D = D;
                R61.mdl('p8M', `<div class="px-h"><b>📄 Pasportni PDF qilib yuklash</b><button class="mini-btn" onclick="mdlClose('p8M')">✕</button></div><div id="r61B"></div>`);
                r61Draw();
            };
        }

        // ---------- 19) QR yorliqlar — A4 da 35 ta (5 × 7, 40 × 40 mm) ----------
        var R61_MM = 72 / 25.4;
        function r61Label(ops: any[], v: any, x: number, y: number, w: number, h: number): void {
            const txt = (xx: number, yy: number, s: string, st: string, fs: number) => { if (s) ops.push({ k: 't', x: xx, y: yy, s: s, st: st, fs: fs }); };
            const ln = (x1: number, y1: number, x2: number, y2: number, lw: number) => ops.push({ k: 'l', x1: x1, y1: y1, x2: x2, y2: y2, w: lw });
            const mm = R61_MM, pad = 2 * mm, KN = R61.qrKindOf(v), cut = R61.qrCut, fit = R61.qrFit;
            ln(x, y, x + w, y, 0.4); ln(x + w, y, x + w, y + h, 0.4); ln(x + w, y + h, x, y + h, 0.4); ln(x, y + h, x, y, 0.4);
            const head = '«Olmaliq KMK» AJ · STTB · ' + KN[1];
            const hf = fit(head, 'Bold', 5.6, w - 2 * pad, 4.2); txt(x + pad, y + pad + 4.2, cut(head, 'Bold', hf, w - 2 * pad), 'Bold', hf);
            ln(x + pad, y + pad + 6.2, x + w - pad, y + pad + 6.2, 0.9);
            const M = R61.qrMatrix(R61.qrText(v)), n = M.length, qs = 23 * mm, m = qs / (n + 2), qx = x + pad + m * 0.5, qy = y + pad + 8;
            M.forEach((row: boolean[], r: number) => { let c = 0; while (c < n) { if (!row[c]) { c++; continue; } const s = c; while (c < n && row[c]) c++; ln(qx + (s + 1) * m, qy + (r + 1.5) * m, qx + (c + 1) * m, qy + (r + 1.5) * m, m + 0.05); } });
            const cx = qx + qs + 1.2 * mm, cw = x + w - pad - cx, no = r61No(v);
            let yy = qy + 6 * mm; txt(cx, yy, cut(KN[0] + ' №', 'Regular', 5.2, cw), 'Regular', 5.2);
            const fno = fit(no, 'Bold', 13, cw, 6); yy += fno + 1.2; txt(cx, yy, no, 'Bold', fno);
            if (v.inv) { yy += 7.5; txt(cx, yy, 'Inv. №', 'Regular', 5.4); yy += 6.8; txt(cx, yy, cut(String(v.inv), 'Regular', 6.4, cw), 'Regular', 6.4); }
            const ty = String((!v.kind && typeof R61.vTypeFull === 'function' ? R61.vTypeFull(v) : '') || v.naim || v.type || '').trim();
            const l1 = [ty, v.model && v.model !== v.type ? 'Model: ' + v.model : ''].filter(Boolean).join(' · ');
            let by = qy + qs + 6.2; if (l1) { txt(x + pad, by, cut(l1, 'Regular', 5.6, w - 2 * pad), 'Regular', 5.6); by += 7; }
            if (v.seh) txt(x + pad, by, cut('Seh: ' + v.seh, 'Regular', 5.6, w - 2 * pad), 'Regular', 5.6);
        }
        function r61Layout35(list: any[]): any {
            const P = { W: 595.28, H: 841.89 }, mm = R61_MM, cw = 40 * mm, chh = 40 * mm, cols = 5, rows = 7, mx = (P.W - cols * cw) / 2, my = (P.H - rows * chh) / 2, pages: any[][] = [];
            list.forEach((v, i) => { const j = i % (cols * rows); if (!j) pages.push([]); r61Label(pages[pages.length - 1], v, mx + (j % cols) * cw, my + Math.floor(j / cols) * chh, cw, chh); });
            return { P: P, pages: pages };
        }
        function r61Qr35(list: any[], title: string): void {
            if (!list.length) { R61.alert('Yorliq uchun texnika tanlanmadi'); return; }
            R61.showToast('🏷 ' + list.length + ' ta QR yorliq tayyorlanmoqda…');
            setTimeout(() => {
                try {
                    const lay = r61Layout35(list); R61.PDFK.f = null; const blob = R61.pdfBuild(lay);
                    const f = { name: String(title).replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '') + '_QR_' + list.length + '.pdf', mime: 'application/pdf', blob: blob };
                    if (typeof R61.exOpen === 'function') R61.exOpen([f], { title: title + ' — QR yorliqlar (' + list.length + ' ta, ' + lay.pages.length + ' varaq)', act: 'dl' }); else R61.docDownload([f]);
                } catch (e) { console.error(e); R61.alert('⚠️ QR yorliqlar PDF: ' + ((e as any) && (e as any).message || e)); }
            }, 60);
        }
        // «Ustunlar» ga «🏷 QR kod» va «🏷 Faqat QR» toʻplami
        if (typeof R61.ykTechCols === 'function') {
            const _tc = R61.ykTechCols;
            R61.ykTechCols = function (this: unknown) { const L = _tc.apply(this, arguments); try { if (!L.some((c: any) => c.k === 'qr')) L.unshift({ k: 'qr', t: '🏷 QR kod (yorliq)', g: (v: any) => { try { return R61.qrText(v); } catch (e) { return ''; } } }); } catch (e) { /* */ } return L; };
        }
        try { if (R61.YK_PRE_T && !R61.YK_PRE_T['🏷 Faqat QR']) R61.YK_PRE_T['🏷 Faqat QR'] = ['qr']; } catch (e) { /* */ }
        function r61OnlyQr(): boolean { try { const Y = R61.YKS; return !!(Y && Y.cfg && Y.cols && Y.cols.length === 1 && Y.cols[0] === 'qr'); } catch (e) { return false; } }
        if (typeof R61.ykDraw === 'function') {
            const _d = R61.ykDraw;
            R61.ykDraw = function (this: unknown) {
                const r = _d.apply(this, arguments);
                try {
                    if (!r61OnlyQr()) return r; const b = R61.$id('ykB'); if (!b) return r; const O = R61.ykOut(), N = O.length, pg = Math.ceil(N / 35);
                    const cards = b.querySelectorAll('.yk-c'), last = cards[cards.length - 1]; if (!last) return r;
                    last.innerHTML = `<div class="yk-sum r61-qs">🏷 <b>${N} ta QR yorliq</b><small>A4 · 35 tadan (5 × 7, har biri 4 × 4 sm) · ${pg} varaq · qirqish chiziqlari bilan</small></div>
                        <div class="yk-fmt"><button class="x" disabled>📗 Excel</button><button class="p r61-qp" onclick="r61YkQr()">📕 PDF — ${pg} varaq</button><button class="w" disabled>📘 Word</button></div>
                        <div class="yk-tip">Yorliqda: tashkilot · QR · ${'VAGON'} № · inventar · turi, modeli · seh. QR ichida ilova havolasi (agmk://q/…).</div>`;
                } catch (e) { console.error('6.1 QR yorliqlar', e); }
                return r;
            };
        }
        function r61YkQr(): void { try { const Y = R61.YKS; r61Qr35(R61.ykOut(), (Y.cfg && Y.cfg.title) || 'Texnika'); } catch (e) { console.error(e); } }
        (function () {
            const st = document.createElement('style'); st.id = 'v61pdfCss';
            st.textContent = `#r61B .r61-m,#r61B .r61-pre{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
            #r61B .r61-m span,#r61B .r61-pre span{padding:8px 12px;border-radius:12px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;font-size:13px;font-weight:600;cursor:pointer}
            #r61B .r61-m span.on{background:#2563eb;border-color:#60a5fa;color:#fff}#r61B .r61-pre span{background:rgba(124,58,237,.18);border-color:#7c3aed}
            #r61B .r61-l{max-height:48vh;overflow:auto;border:1px solid #334155;border-radius:12px;padding:4px 6px;margin-top:4px}
            #r61B .r61-g{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7dd3fc;font-weight:800;margin:8px 4px 2px}
            #r61B .r61-r{display:flex;align-items:center;gap:10px;padding:7px 6px;border-radius:8px;color:#e2e8f0;font-size:13.5px;cursor:pointer}#r61B .r61-r:hover{background:rgba(51,65,85,.45)}
            #r61B .r61-go{width:100%;margin-top:10px}
            .r61-qs small{display:block;color:#cbd5e1;font-size:12px;margin-top:3px;font-weight:400}
            .yk-fmt button:disabled{opacity:.35;cursor:not-allowed}`;
            document.head.appendChild(st);
        })();
        Object.assign(R61, { r61Mode: r61Mode, r61T: r61T, r61Pre: r61Pre, r61Go: r61Go, r61YkQr: r61YkQr, r61Qr35: r61Qr35, r61Layout35: r61Layout35, r61QrSvg: r61QrSvg });
