        // ===== 5.9 (muallif 14:54): Struktura PDF — tiniq, chizma (vektor) =====
        // Oldin PDF chop etish oynasi orqali rasm kabi chiqar edi: Android’da kichik yozuvlar bir-biriga minar,
        // A4/A3 farqi tufayli 2 betga boʻlinar, yaqinlashtirganda xiralashar edi.
        // Endi PDF ilovaning oʻzida, sxemaning HAQIQIY oʻlchamida (1 px = 0,75 pt) bitta betga chiziladi:
        // kartochkalar — rangli toʻrtburchak, yozuvlar — ichki shrift (matn), chiziqlar — vektor.
        // Shuning uchun qancha yaqinlashtirilsa ham ilovadagidek tiniq turadi, matnni qidirish/nusxalash mumkin.
        // Oklad chiqmaydi (stNoOk). «roʻyxatni ochish» yozuvi qogʻozda «yana N ta» boʻladi. Internetga hech narsa yuborilmaydi.
        __lzVar('AGMK_PDF_SANS'); // Liberation Sans (SIL OFL) — ilovadagi yozuvga yaqin, Arial oʻlchamida (tools/pdf_sans.py)
        const SP9 = window as any;
        var ST59F = null;
        function st59Fonts() { if (!ST59F) { ST59F = {}; ['Regular', 'Bold'].forEach(s => { ST59F[s] = { d: SP9.AGMK_PDF_SANS[s], used: new Map() }; }); } return ST59F; }
        function st59W(st, s, fs) { const F = st59Fonts()[st]; let w = 0; for (const ch of s) { const g = F.d.cmap[ch.codePointAt(0)]; w += g === undefined ? 0 : (F.d.w[g] || 0); } return w / F.d.upm * fs; }
        function st59Rgb(c) { const m = String(c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); if (v.length > 3 && v[3] < 0.05) return null; return [v[0] / 255, v[1] / 255, v[2] / 255]; }
        function st59Lum(r) { return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2]; }
        function st59F(n) { return (Math.round(n * 100) / 100).toString(); }
        function st59Collect(full) {
            const cv = $id('stCv'), org = (cv && cv.querySelector('.st-org')) as HTMLElement; if (!org) return null;
            const cl = [].slice.call(cv.querySelectorAll('.st-chs.cl')), prev = cl.map(c => c.classList.contains('show'));
            const mores = [].slice.call(org.querySelectorAll('.st-more'));
            if (full) cl.forEach(c => c.classList.add('show')); try { stDrawLinks(); } catch (e) {}
            // oʻlchash aniq boʻlishi uchun vaqtincha 100% masshtab (kichik masshtabda pikselning ulushlari yoʻqoladi)
            const s0 = ST.s; try { ST.s = 1; stApply(false); } catch (e) {}
            try {
                const OR = org.getBoundingClientRect(), k = org.offsetWidth / (OR.width || 1);
                const P = (x, y) => ({ x: (x - OR.left) * k, y: (y - OR.top) * k });
                const W = org.scrollWidth, H = org.scrollHeight, ops = [];
                const vis = el => { for (let e = el; e && e !== org; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; } return true; };
                // 1) toʻrtburchaklar (fon va hoshiya) — DOM tartibida, ichkisi ustida
                org.querySelectorAll('*').forEach(el => {
                    if (el.closest('svg') || !vis(el)) return; const s = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
                    if (full && el.classList.contains('st-more')) return;
                    const bg = st59Rgb(s.backgroundColor), bw = parseFloat(s.borderTopWidth) || 0, bc = bw > 0 && s.borderTopStyle !== 'none' ? st59Rgb(s.borderTopColor) : null;
                    if (!bg && !bc) return;
                    // maydon (fon) qismlari qogʻozga chiqmaydi — faqat kartochkalar
                    const inB = !!el.closest('.st-box'); if (!inB) { const am = String(s.borderTopColor).match(/rgba\([^)]*,\s*([\d.]+)\)/); if (!bc || (am && +am[1] < 0.5)) return; ops.push({ k: 'r', x: P(r.left, r.top).x, y: P(r.left, r.top).y, w: r.width * k, h: r.height * k, rad: Math.min(parseFloat(s.borderTopLeftRadius) || 0, r.height * k / 2, r.width * k / 2), bg: null, bc: st59Lum(bc) > 0.55 ? [0.118, 0.161, 0.231] : bc, bw: bw, dash: s.borderTopStyle === 'dashed' }); return; }
                    const a = P(r.left, r.top); ops.push({ k: 'r', x: a.x, y: a.y, w: r.width * k, h: r.height * k, rad: Math.min(parseFloat(s.borderTopLeftRadius) || 0, r.height * k / 2, r.width * k / 2), bg: bg, bc: bc, bw: bw, dash: s.borderTopStyle === 'dashed' });
                });
                // 2) chiziqlar (SVG yoʻllar)
                const svg = org.querySelector('.st-svg');
                if (svg) {
                    const SR = svg.getBoundingClientRect(), o = P(SR.left, SR.top);
                    svg.querySelectorAll('path.ln').forEach(pth => {
                        const t = (pth.getAttribute('d') || '').match(/[MVHL][^MVHL]*/g) || []; let x = 0, y = 0; const pts = [];
                        t.forEach(c => { const n = c.slice(1).trim().split(/[\s,]+/).map(Number); if (c[0] === 'M' || c[0] === 'L') { x = n[0]; y = n[1]; } else if (c[0] === 'V') y = n[0]; else if (c[0] === 'H') x = n[0]; pts.push([o.x + x, o.y + y]); });
                        const wk = pth.classList.contains('wk'); if (pts.length > 1) ops.push({ k: 'p', pts: pts, w: pth.classList.contains('b') ? 3.2 : 2.6, col: wk ? [0.706, 0.325, 0.035] : [0.118, 0.161, 0.231], dash: wk });
                    });
                }
                // 3) yozuvlar
                const tw = document.createTreeWalker(org, NodeFilter.SHOW_TEXT); let n;
                while ((n = tw.nextNode())) {
                    const pe = n.parentElement; if (!pe || pe.closest('svg') || !n.nodeValue.trim() || !vis(pe)) continue;
                    const more = pe.closest('.st-more'); if (more && full) continue;
                    const s = getComputedStyle(pe); let col = st59Rgb(s.color) || [0, 0, 0];
                    const inBox = !!pe.closest('.st-box');
                    if (!inBox && st59Lum(col) > 0.55) col = pe.closest('.st-sec') ? (pe.closest('.st-sec.prod') ? [0.761, 0.255, 0.047] : [0.012, 0.412, 0.631]) : (pe.closest('.r') ? [0.863, 0.149, 0.149] : [0.059, 0.09, 0.165]);
                    const st = parseInt(s.fontWeight, 10) >= 600 ? 'Bold' : 'Regular', up = s.textTransform === 'uppercase';
                    const fpx = parseFloat(s.fontSize) || 12;
                    const fix = str => { str = str.replace(/\s+/g, ' '); if (up) str = str.toUpperCase(); if (more) { const m = str.match(/(\d+)\s*ta/); str = m ? '… yana ' + m[1] + ' ta' : (/yigʻish/.test(str) ? '' : str); } return str; };
                    const push = (rng, str) => { const rs = rng.getClientRects(); if (!rs.length) return; const r = rs[0]; if (r.width * k < 0.5) return; const a = P(r.left, r.top); ops.push({ k: 't', x: a.x, y: a.y, w: r.width * k, h: r.height * k, s: str, st: st, fs: fpx, col: col }); };
                    const rng = document.createRange(); rng.selectNodeContents(n);
                    const all = rng.getClientRects();
                    if (all.length <= 1 || more) { const str = fix(n.nodeValue).trim(); if (str) push(rng, str); continue; }
                    // bir necha qatorga boʻlingan — har soʻz alohida
                    const v = n.nodeValue, re = /\S+/g; let m;
                    while ((m = re.exec(v))) { const r2 = document.createRange(); r2.setStart(n, m.index); r2.setEnd(n, m.index + m[0].length); push(r2, fix(m[0])); }
                }
                return { W: W, H: H, ops: ops };
            } finally { try { ST.s = s0; stApply(false); } catch (e) {} if (full) { cl.forEach((c, i) => c.classList.toggle('show', prev[i])); try { stDrawLinks(); } catch (e) {} } }
        }
        function st59Pdf(D) {
            ST59F = null; const F = st59Fonts(), enc = new TextEncoder(), hex4 = x => x.toString(16).padStart(4, '0');
            const M = 24, MAXP = 14000; let sc = 0.75; const big = Math.max(D.W, D.H) * sc + M * 2; if (big > MAXP) sc *= (MAXP - M * 2) / (Math.max(D.W, D.H) * sc);
            const PW = D.W * sc + M * 2, PH = D.H * sc + M * 2, X = x => M + x * sc, Y = y => PH - M - y * sc;
            const rgb = (c, op) => c.map(st59F).join(' ') + ' ' + op + ' ';
            const has = (f, ch) => f.d.cmap[ch.codePointAt(0)] !== undefined || ch.codePointAt(0) === 0x2BB || ch.codePointAt(0) === 0x2BC;
            let s = '1 0 0 1 0 0 cm 1 1 1 rg 0 0 ' + st59F(PW) + ' ' + st59F(PH) + ' re f\n';
            const rr = (x, y, w, h, r) => { // yumaloq burchakli toʻrtburchak (PDF koordinatida, y — pastki chap)
                if (r < 0.5) return st59F(x) + ' ' + st59F(y) + ' ' + st59F(w) + ' ' + st59F(h) + ' re\n';
                const c = r * 0.4477, x2 = x + w, y2 = y + h, f = st59F;
                return f(x + r) + ' ' + f(y) + ' m ' + f(x2 - r) + ' ' + f(y) + ' l ' + f(x2 - c) + ' ' + f(y) + ' ' + f(x2) + ' ' + f(y + c) + ' ' + f(x2) + ' ' + f(y + r) + ' c ' + f(x2) + ' ' + f(y2 - r) + ' l ' + f(x2) + ' ' + f(y2 - c) + ' ' + f(x2 - c) + ' ' + f(y2) + ' ' + f(x2 - r) + ' ' + f(y2) + ' c ' + f(x + r) + ' ' + f(y2) + ' l ' + f(x + c) + ' ' + f(y2) + ' ' + f(x) + ' ' + f(y2 - c) + ' ' + f(x) + ' ' + f(y2 - r) + ' c ' + f(x) + ' ' + f(y + r) + ' l ' + f(x) + ' ' + f(y + c) + ' ' + f(x + c) + ' ' + f(y) + ' ' + f(x + r) + ' ' + f(y) + ' c h\n';
            };
            const lines = D.ops.filter(o => o.k === 'p'), rects = D.ops.filter(o => o.k === 'r'), texts = D.ops.filter(o => o.k === 't');
            // chiziqlar kartochkalar ostida (ilovadagidek)
            lines.forEach(o => {
                s += 'q ' + rgb(o.col, 'RG') + rgb(o.col, 'rg') + st59F(o.w * sc) + ' w 1 J 1 j ' + (o.dash ? '[' + st59F(7 * sc) + ' ' + st59F(4 * sc) + '] 0 d ' : '');
                o.pts.forEach((p, i) => { s += st59F(X(p[0])) + ' ' + st59F(Y(p[1])) + (i ? ' l ' : ' m '); }); s += 'S\n';
                const a = o.pts[o.pts.length - 2], b = o.pts[o.pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, al = o.w * 5 * sc / 2, aw = o.w * 2.5 * sc / 2;
                const bx = X(b[0]), by = Y(b[1]), vx = ux, vy = -uy; // PDF’da y teskari
                s += '[] 0 d ' + st59F(bx) + ' ' + st59F(by) + ' m ' + st59F(bx - vx * al - vy * aw) + ' ' + st59F(by - vy * al + vx * aw) + ' l ' + st59F(bx - vx * al + vy * aw) + ' ' + st59F(by - vy * al - vx * aw) + ' l h f Q\n';
            });
            rects.forEach(o => {
                const x = X(o.x), y = Y(o.y + o.h), w = o.w * sc, h = o.h * sc, r = o.rad * sc;
                if (o.bg) s += rgb(o.bg, 'rg') + rr(x, y, w, h, r) + 'f\n';
                if (o.bc) { const bw = o.bw * sc; s += 'q ' + rgb(o.bc, 'RG') + st59F(bw) + ' w ' + (o.dash ? '[' + st59F(4 * sc) + ' ' + st59F(3 * sc) + '] 0 d ' : '') + rr(x + bw / 2, y + bw / 2, w - bw, h - bw, Math.max(0, r - bw / 2)) + 'S Q\n'; }
            });
            texts.forEach(o => {
                const f = F[o.st], str = Array.from(o.s).filter(ch => ch === ' ' || has(f, ch)).join('').replace(/^\s+|\s+$/g, ''); if (!str) return;
                const fs = o.fs * sc, d = f.d, asc = d.asc / d.upm, dsc = -Math.abs(d.desc) / d.upm, em = asc - dsc;
                const base = Y(o.y) - ((o.h * sc - fs * em) / 2 + fs * asc);
                const nat = st59W(o.st, str, fs), want = o.w * sc, tz = nat > 0 ? Math.max(55, Math.min(140, want / nat * 100)) : 100;
                // boshida olib tashlangan belgi (masalan 👤) boʻlsa — matn oʻng tomonga suriladi
                const lead = Array.from(o.s).length !== Array.from(str).length && !has(f, Array.from(o.s.trim())[0] || 'a');
                const x = X(o.x) + (lead ? Math.max(0, want - nat) : 0), tzz = lead ? 100 : tz;
                let hx = ''; for (const ch of str) hx += hex4(pdfGid(f, ch));
                s += 'BT ' + rgb(o.col, 'rg') + '/' + (o.st === 'Bold' ? 'F2' : 'F1') + ' ' + st59F(fs) + ' Tf ' + st59F(tzz) + ' Tz 1 0 0 1 ' + st59F(x) + ' ' + st59F(base) + ' Tm <' + hx + '> Tj ET\n';
            });
            // PDF fayli (shrift qismi main/027 pdfBuild bilan bir xil)
            const parts = [], offs = []; let len = 0; const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
            const obj = (nn, body) => { offs[nn] = len; put(nn + ' 0 obj\n'); if (Array.isArray(body)) body.forEach(put); else put(body); put('\nendobj\n'); };
            const fB = { Regular: 3, Bold: 8 }, pN = 13;
            put('%PDF-1.4\n%AGMK\n');
            obj(1, '<< /Type /Catalog /Pages 2 0 R /ViewerPreferences << /FitWindow true >> >>');
            obj(2, '<< /Type /Pages /Count 1 /Kids [' + pN + ' 0 R] >>');
            ['Regular', 'Bold'].forEach(st => {
                const f = F[st], d = f.d, b = fB[st], k = 1000 / d.upm, name = st === 'Bold' ? 'AGMKSB+LiberationSans-Bold' : 'AGMKSA+LiberationSans';
                if (!f.used.size) pdfGid(f, ' ');
                const used: number[] = Array.from(f.used.keys() as Iterable<number>).sort((a, c) => a - c), Wd = used.map(g => g + ' [' + Math.round((d.w[g] || 0) * k) + ']').join(' ');
                const bin = atob(d.ttf), bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                let cm = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n';
                for (let i = 0; i < used.length; i += 100) { const ch = used.slice(i, i + 100); cm += ch.length + ' beginbfchar\n' + ch.map(g => '<' + hex4(g) + '> <' + hex4(f.used.get(g) & 0xffff) + '>').join('\n') + '\nendbfchar\n'; }
                cm += 'endcmap CMapName currentdict /CMap defineresource pop end end';
                obj(b, '<< /Type /Font /Subtype /Type0 /BaseFont /' + name + ' /Encoding /Identity-H /DescendantFonts [' + (b + 1) + ' 0 R] /ToUnicode ' + (b + 4) + ' 0 R >>');
                obj(b + 1, '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /' + name + ' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ' + (b + 2) + ' 0 R /CIDToGIDMap /Identity /DW 500 /W [' + Wd + '] >>');
                obj(b + 2, '<< /Type /FontDescriptor /FontName /' + name + ' /Flags 34 /FontBBox [' + d.bbox.map(x => Math.round(x * k)).join(' ') + '] /ItalicAngle 0 /Ascent ' + Math.round(d.asc * k) + ' /Descent ' + Math.round(d.desc * k) + ' /CapHeight ' + Math.round(d.cap * k) + ' /StemV ' + (st === 'Bold' ? 140 : 80) + ' /FontFile2 ' + (b + 3) + ' 0 R >>');
                obj(b + 3, ['<< /Length ' + bytes.length + ' /Length1 ' + bytes.length + ' >>\nstream\n', bytes, '\nendstream']);
                obj(b + 4, '<< /Length ' + enc.encode(cm).length + ' >>\nstream\n' + cm + '\nendstream');
            });
            obj(pN, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + st59F(PW) + ' ' + st59F(PH) + '] /Resources << /Font << /F1 3 0 R /F2 8 0 R >> >> /Contents ' + (pN + 1) + ' 0 R >>');
            obj(pN + 1, '<< /Length ' + enc.encode(s).length + ' >>\nstream\n' + s + 'endstream');
            obj(pN + 2, '<< /Title <FEFF' + Array.from('AGMK STTB — tashkiliy tuzilma').map(c => hex4(c.charCodeAt(0))).join('') + '> /Producer (AGMK STTB-AIT) >>');
            const nObj = pN + 3, xr = len; let x = 'xref\n0 ' + nObj + '\n0000000000 65535 f \n'; for (let i = 1; i < nObj; i++) x += String(offs[i] || 0).padStart(10, '0') + ' 00000 n \n';
            put(x + 'trailer\n<< /Size ' + nObj + ' /Root 1 0 R /Info ' + (pN + 2) + ' 0 R >>\nstartxref\n' + xr + '\n%%EOF');
            return { blob: new Blob(parts, { type: 'application/pdf' }), w: PW, h: PH, n: texts.length };
        }
        function st59MakePdf(full) {
            const D = stNoOk(() => st59Collect(full)); if (!D) return null; return st59Pdf(D);
        }
        if (typeof SP9.stPdf === 'function') SP9.stPdf = SP9.agmkExtend('stPdf', 'v5.9: Struktura — tiniq vektor PDF (bitta bet, haqiqiy oʻlcham)', SP9.stPdf, (o: Function) => function (full) {
            try {
                mdlClose('stMdl'); const R = st59MakePdf(!!full); if (!R) { showToast('Sxema topilmadi'); return; }
                const name = 'AGMK_STTB_tuzilma' + (full ? '_toliq' : '') + '.pdf';
                docDownload([{ name: name, mime: 'application/pdf', blob: R.blob }]); showToast('📄 Tiniq PDF tayyor: ' + name);
            } catch (e) { console.error(e); return o.apply(this, arguments); }
        });
        if (typeof SP9.stPdfMenu === 'function') SP9.stPdfMenu = SP9.agmkExtend('stPdfMenu', 'v5.9: PDF izohi', SP9.stPdfMenu, (o: Function) => function () {
            o.apply(this, arguments);
            try { const m = $id('stMdl'); if (m) m.querySelectorAll('.nd-tip').forEach(t => { if (/chop etish oynasida/.test(t.textContent)) t.textContent = 'PDF darhol yuklab olinadi: sxema haqiqiy oʻlchamida, bitta betda, chizma sifatida — qancha yaqinlashtirsangiz ham yozuvlar tiniq turadi. Oklad chiqmaydi.'; }); } catch (e) {}
        });
