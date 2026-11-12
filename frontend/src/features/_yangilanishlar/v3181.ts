        // =====================================================================
        // v3.18.1 — sinovdagi kamchiliklar (docs/KAMCHILIKLAR.md, 3.18 boʻlimi)
        //  • K-19: Skaner / Imzoga yuborish jarayonida «‹» (pastdagi tugma, sarlavhadagi «Orqaga», telefonning ortga tugmasi)
        //    jarayon ichida bir qadam orqaga qaytaradi: tekshirish → sahifalar → boshlangʻich; saqlanmagan sahifalar boʻlsa — soʻraydi.
        //    Avval toʻgʻridan-toʻgʻri boshqa (oldin ochilgan) boʻlimga — masalan, «Dispetcherlik»ka — chiqib ketardi va ish yoʻqolardi.
        // =====================================================================
        const VB: any = window as any;
        var UPB: any = { asking: false };
        function upbOverlay(): boolean {
            try { if (VB.$id('v9View')) return true; return Array.from(document.querySelectorAll('.modal-overlay')).some((m: any) => !m.classList.contains('hidden') && getComputedStyle(m).display !== 'none'); } catch (e) { return false; }
        }
        // true — jarayon ichida bir qadam orqaga qaytildi (yoki soʻraldi)
        function upBackStep(): boolean {
            try {
                const act = document.querySelector('.screen.active'), U = VB.UP;
                if (!act || act.id !== 'screen-hisob' || !U || typeof VB.upRender !== 'function') return false;
                const n = (U.scans || []).length;
                if (U.st === 'ocr' || U.st === 'review') { U.st = n ? 'scan' : 'home'; VB.upRender(); return true; }
                if (U.st === 'scan') {
                    if (!n) { U.st = 'home'; VB.upRender(); return true; }
                    if (UPB.asking) return true; UPB.asking = true;
                    Promise.resolve(VB.uiConfirm('Skanerlangan ' + n + ' ta sahifa hali hujjatga aylantirilmagan. Chiqsangiz, ular oʻchadi. Chiqasizmi?')).then((ok: boolean) => {
                        UPB.asking = false; if (!ok) return; U.scans = []; U.st = 'home'; VB.upRender();
                    }).catch(() => { UPB.asking = false; });
                    return true;
                }
                if (U.st === 'home' && U.mode === 'scan') { U.mode = ''; VB.openScreen('screen-main'); return true; } // skaner bosh menyudan ochiladi — oʻsha yerga qaytadi
            } catch (e) { console.error(e); }
            return false;
        }
        if (typeof VB.navStep === 'function') VB.navStep = VB.agmkExtend('navStep', 'v3.18.1: skaner jarayonida bir qadam orqaga', VB.navStep, (o: Function) => function (this: unknown) {
            if (VB.$id('v9View')) { VB.v9ViewClose(); return true; }
            if (!upbOverlay() && upBackStep()) return true;
            return o.apply(this, arguments);
        });
        // sarlavhadagi «‹ Orqaga» va telefonning ortga tugmasi ham (ular .back-btn ni bosadi)
        document.addEventListener('click', (e: any) => {
            try { const b = e.target && e.target.closest && e.target.closest('#screen-hisob .back-btn'); if (!b || upbOverlay()) return;
                if (upBackStep()) { e.preventDefault(); e.stopPropagation(); if (typeof VB.NAV !== 'undefined' && VB.NAV) VB.NAV.back = 0; } } catch (x) { /* */ }
        }, true);

        // =====================================================================
        //  • K-20: tayyor hujjatni (skaner natijasi va boshqa fayllar) imzoga yuborib boʻlmasdi — «✍️ Imzoga yuborish» tugmasi
        //    aslida «Yuborish»ni bosib, format oynasini qayta ochardi. Endi: format oynasida ham, «Saqlandi» panelida ham
        //    «✍️ Imzoga» — hujjat manbasidan (matn yoki skaner rasmlari) imzo hujjati tuziladi va imzo chekuvchilar oynasi ochiladi.
        // =====================================================================
        function exSignSrc(files: any[]): any {
            try {
                const f = files && files[0]; if (!f || !f.blob) return null;
                const s = (VB.EXS && VB.EXS.get(f.blob)) || {}, title = VB.v9Pretty ? VB.v9Pretty(s.title || f.name) : String(f.name || 'Hujjat');
                if (s.html) return { html: String(s.html), title: title };
                if (s.imgs && s.imgs.length) return { html: s.imgs.map((u: string) => `<p style="margin:0 0 6px"><img src="${u}" style="width:100%;display:block"></p>`).join(''), title: title };
                if (s.rows && s.rows.length) return { html: '<table border="1" style="border-collapse:collapse;width:100%">' + s.rows.map((r: any[]) => '<tr>' + r.map(c => '<td>' + VB.escapeHtml(String(c == null ? '' : c)) + '</td>').join('') + '</tr>').join('') + '</table>', title: title };
            } catch (e) { console.error(e); }
            return null;
        }
        function exSign(files: any[]): void {
            const s = exSignSrc(files);
            if (!s) { VB.alert('Bu fayldan imzo hujjatini tayyorlab boʻlmaydi (imzolangan hujjat nusxasi yoki boshqa ilovadan kelgan fayl).'); return; }
            try { VB.mdlClose('exSheet'); } catch (e) { /* */ } try { const sn = VB.$id('expSnack'); if (sn) sn.classList.remove('on'); } catch (e) { /* */ }
            VB.sigSendOpen(s);
        }
        if (typeof VB.exRender === 'function') VB.exRender = VB.agmkExtend('exRender', 'v3.18.1: «✍️ Imzoga» tugmasi', VB.exRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { if (VB.EX && exSignSrc(VB.EX.files) && typeof VB.sigSendOpen === 'function') { const a = document.querySelector('#exSheet .ex-act'); if (a && !a.querySelector('.ex-sign')) { const btn = document.createElement('button'); btn.className = 'ex-sign'; btn.innerHTML = '<i>✍️</i>Imzoga'; btn.onclick = () => exSign(VB.EX.files); a.appendChild(btn); } } } catch (e) { /* */ }
            return r;
        });
        if (typeof VB.expSnack === 'function') VB.expSnack = VB.agmkExtend('expSnack', 'v3.18.1: «✍️ Imzoga» — haqiqiy imzoga yuborish', VB.expSnack, (o: Function) => function (this: unknown, files: any[]) {
            const r = o.apply(this, arguments);
            try { const s = VB.$id('expSnack'); if (s && exSignSrc(files) && typeof VB.sigSendOpen === 'function') { const b = document.createElement('button'); b.className = 'sn-sign'; b.textContent = '✍️ Imzoga'; b.onclick = () => exSign(files); const x = s.querySelector('button:last-child'); s.insertBefore(b, x); } } catch (e) { /* */ }
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = '.ex-act:has(.ex-sign){grid-template-columns:repeat(4,1fr)}.ex-act:has(.ex-sign):has(.ex-chat){grid-template-columns:repeat(5,1fr)}.ex-act .ex-sign{border-color:#7c3aed!important;background:linear-gradient(135deg,rgba(124,58,237,.55),rgba(168,85,247,.45))!important}#expSnack .sn-sign{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff}'; document.head.appendChild(st); })();

        // =====================================================================
        //  • K-23: imzolangan hujjat «Word» qilib yuklanganda sahifa rasmi boʻlib tushardi (matnni tahrirlab boʻlmasdi).
        //    Endi Word — haqiqiy matn: har bir qator alohida xatboshi (joyi, shrifti, qalinligi saqlanadi), ustunlar — tabulyatsiya,
        //    imzo rasmlari — oʻz joyida (matn ustida emas, yonida). Sahifalar va hoshiyalar asl hujjatdagidek.
        // =====================================================================
        function exDocxEsc(s: unknown): string { return String(s == null ? '' : s).replace(/[&<>"]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]); }
        function exImgJpegU8(o: any): Uint8Array | null {
            try { if (o.data && o.data.length) return o.data instanceof Uint8Array ? o.data : new Uint8Array(o.data);
                if (o.cv) { const c = document.createElement('canvas'); c.width = o.cv.width; c.height = o.cv.height; const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(o.cv, 0, 0); const b = atob(c.toDataURL('image/jpeg', 0.95).split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; } } catch (e) { /* */ }
            return null;
        }
        function exDocxLay(lay: any): Blob {
            const P = lay.P || {}, W = P.W || 595.28, H = P.H || 841.89, L = P.L != null ? P.L : 56, R = P.R != null ? P.R : 42, T = P.T != null ? P.T : 42, B = P.B != null ? P.B : 42;
            const tw = (pt: number) => Math.max(0, Math.round(pt * 20)), emu = (pt: number) => Math.max(1, Math.round(pt * 12700));
            const media: any[] = []; let body = '', did = 0;
            lay.pages.forEach((ops: any[], pi: number) => {
                const txt = ops.filter(o => o.k === 't' && String(o.s || '').trim()), imgs = ops.filter(o => o.k === 'img');
                const lines: any[] = []; txt.slice().sort((a, b) => a.y - b.y || a.x - b.x).forEach(o => { const l = lines.find(z => Math.abs(z.y - o.y) < 2.2); if (l) l.a.push(o); else lines.push({ y: o.y, a: [o] }); });
                lines.sort((a, b) => a.y - b.y);
                // imzo rasmi — markazi eng yaqin qatorga biriktiriladi (qator boshidan nisbiy joy bilan)
                const att = new Map<any, any[]>(); imgs.forEach(im => { const cy = im.y + im.h / 2; let best: any = null, bd = 1e9; lines.forEach(l => { const d = Math.abs(l.y - cy); if (d < bd) { bd = d; best = l; } }); if (best) { if (!att.has(best)) att.set(best, []); (att.get(best) as any[]).push(im); } });
                let prevY = T; const paras: any[] = [];
                lines.forEach((l, li) => {
                    const a = l.a.sort((p: any, q: any) => p.x - q.x), fs = Math.max(...a.map((o: any) => o.fs || 12)), x0 = a[0].x;
                    const before = Math.max(0, l.y - prevY - fs * (li ? 1.15 : 0.85)); prevY = l.y + fs * 0.25;
                    const tabs: number[] = []; let runs = '', endX = -1e9;
                    a.forEach((o: any, i: number) => {
                        const ww = (() => { try { return V9W(o); } catch (e) { return String(o.s).length * (o.fs || 12) * 0.5; } })();
                        if (i > 0) { const gap = o.x - endX; if (gap > (o.fs || 12) * 1.2) { tabs.push(o.x - L); runs += '<w:r><w:tab/></w:r>'; } else if (gap > (o.fs || 12) * 0.12) runs += '<w:r><w:t xml:space="preserve"> </w:t></w:r>'; }
                        const rp = `<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${o.st === 'Bold' ? '<w:b/>' : ''}${o.it ? '<w:i/>' : ''}<w:sz w:val="${Math.round((o.fs || 12) * 2)}"/></w:rPr>`;
                        runs += `<w:r>${rp}<w:t xml:space="preserve">${exDocxEsc(o.s)}</w:t></w:r>`; endX = o.x + ww;
                    });
                    (att.get(l) || []).forEach((im: any) => { const u8 = exImgJpegU8(im); if (!u8) return; did++; const id = 'rIm' + did; media.push({ name: 'word/media/imzo' + did + '.jpeg', data: u8, id: id });
                        runs = `<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${did}" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>${emu(im.x)}</wp:posOffset></wp:positionH><wp:positionV relativeFrom="line"><wp:posOffset>${Math.round((im.y - (l.y - fs * 0.8)) * 12700)}</wp:posOffset></wp:positionV><wp:extent cx="${emu(im.w)}" cy="${emu(im.h)}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="${1000 + did}" name="Imzo ${did}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${1000 + did}" name="imzo${did}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${emu(im.w)}" cy="${emu(im.h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>` + runs; });
                    // eni toʻla (ikki tomonga tekislangan) matn qatori va undan keyingi qator — bitta xatboshi (Word oʻzi qayta joylaydi)
                    const last = paras[paras.length - 1], full = endX >= W - R - fs * 0.9;
                    if (last && last.open && !tabs.length && !last.tabs.length && Math.abs(x0 - L) < 3 && Math.abs(last.fs - fs) < 0.6 && before < fs * 0.6) { last.runs += '<w:r><w:t xml:space="preserve"> </w:t></w:r>' + runs; last.open = full; last.jc = true; return; }
                    paras.push({ runs: runs, tabs: tabs, before: before, ind: Math.max(0, x0 - L), fs: fs, open: full && !tabs.length, jc: false, pb: pi > 0 && li === 0 });
                });
                paras.forEach(q => { body += `<w:p><w:pPr>${q.pb ? '<w:pageBreakBefore/>' : ''}${q.tabs.length ? '<w:tabs>' + q.tabs.map((t: number) => `<w:tab w:val="left" w:pos="${tw(t)}"/>`).join('') + '</w:tabs>' : ''}<w:spacing w:before="${tw(q.before)}" w:after="0" w:line="${tw(q.fs * 1.15)}" w:lineRule="atLeast"/>${q.ind ? `<w:ind w:firstLine="${tw(q.ind)}"/>` : ''}${q.jc ? '<w:jc w:val="both"/>' : ''}</w:pPr>${q.runs}</w:p>`; });
                if (!lines.length && pi > 0) body += '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
            });
            const ns = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
            const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${ns}><w:body>${body}<w:sectPr><w:pgSz w:w="${tw(W)}" w:h="${tw(H)}"/><w:pgMar w:top="${tw(T)}" w:right="${tw(R)}" w:bottom="${tw(B)}" w:left="${tw(L)}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;
            const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
            const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
            const drels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + media.map(m => `<Relationship Id="${m.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.name.split('/').pop()}"/>`).join('') + '</Relationships>';
            return VB.zipBlob([{ name: '[Content_Types].xml', data: ct }, { name: '_rels/.rels', data: rels }, { name: 'word/_rels/document.xml.rels', data: drels }, { name: 'word/document.xml', data: doc }].concat(media.map(m => ({ name: m.name, data: m.data }))), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        }
        function V9W(o: any): number { return VB.pdfW(o.st, o.s, o.fs); }
        if (typeof VB.exConvert === 'function') VB.exConvert = VB.agmkExtend('exConvert', 'v3.18.1: imzolangan hujjat — Word matn koʻrinishida', VB.exConvert, (o: Function) => async function (this: unknown, f: any, fmt: string) {
            try { const src = VB.EXS.get(f.blob) || {}; if (fmt === 'docx' && src.lay && VB.exKind(f) !== 'docx') { const base = String(f.name || 'Hujjat').replace(/\.\w+$/, ''); return [{ name: base + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: exDocxLay(src.lay) }]; } } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });

        // =====================================================================
        //  • K-26 (muallif): «🧾 Faqat skanerlash» tugmasi olib tashlandi — uning barcha imkoniyatlari «🖼 Rasmlardan (galereya)» da:
        //    rasm → toʻgʻrilash, tozalash → matnni oʻqish → tekshirish → PDF · Word · Excel · JPG (⬇️ 🖨 📤) yoki ✍️ Imzoga.
        // =====================================================================
        if (typeof VB.upRender === 'function') VB.upRender = VB.agmkExtend('upRender', 'v3.18.1: «Rasmlardan» = toʻliq skaner', VB.upRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const U = VB.UP, b = VB.secBody('screen-hisob'); if (!b || U.st !== 'home' || U.mode === 'scan') return r;
                b.querySelectorAll('.v9-scan').forEach((e: any) => e.remove());
                const g = Array.from(b.querySelectorAll('label.up-big')).find((l: any) => /Rasmlardan/.test(l.textContent || '')) as any;
                if (g && !g._v181) { g._v181 = 1; const sm = g.querySelector('small'); if (sm) sm.textContent = 'rasm → PDF / Word / Excel / JPG yoki ✍️ imzoga';
                    g.addEventListener('click', () => { U.mode = 'scan'; }, true); }
            } catch (e) { /* */ }
            return r;
        });

        // =====================================================================
        //  • Bilimlar sinovi 2026 — qogʻozdagi jadvaldan (imzo bilan) «Haqiqatdan» sanalari va izohlar (muallif yuborgan 9 sahifa, 14.10.2026).
        //    Jadval satr raqami = «Bilimlar sinovi jadvali 2026 (STTB MTX).xls» (Лист1) dagi tartib. Har biri bir marta yoziladi (takrorlanmaydi).
        //    [№, sana (KK.OO.YY) yoki '', baho ('n' — qoniqarsiz), izoh]
        // =====================================================================
        var MB_FACT_2026: any[] = [
            [1, '09.01.26'], [2, '', '', 'Уволен'], [3, '09.01.26'], [4, '20.01.26'], [5, '20.01.26'], [6, '23.01.26'], [7, '27.01.26'], [8, '', '', 'И.о.'], [9, '03.02.26'], [10, '29.01.26'],
            [11, '30.01.26'], [12, '03.02.26'], [13, '09.07.26'], [14, '13.02.26'], [15, '03.02.26'], [16, '06.02.26'], [17, '11.02.26'], [18, '03.02.26'], [19, '10.02.26'], [20, '10.02.26'],
            [21, '17.02.26'], [22, '13.02.26'], [23, '30.01.26'], [24, '13.02.26'], [25, '03.02.26'], [26, '17.02.26'], [27, '17.02.26'], [28, '26.03.26'], [29, '27.02.26'], [30, '26.02.26'],
            [31, '27.02.26'], [32, '07.05.26', '', 'И.о.'], [33, '', '', 'И.о.'], [34, '27.02.26'], [35, '26.03.26'], [36, '03.03.26'], [37, '13.03.26'], [38, '06.03.26'], [39, '10.03.26'], [40, '', '', 'Уволен'],
            [42, '13.03.26'], [43, '13.03.26'], [44, '26.03.26'], [45, '11.04.26'], [46, '26.03.26'], [47, '26.03.26'], [48, '26.03.26'], [49, '26.03.26'], [50, '26.03.26'],
            [51, '16.04.26', 'n'], [52, '01.04.26'], [53, '01.04.26'], [54, '', '', 'И.о.'], [55, '08.04.26'], [56, '03.04.26'], [57, '07.04.26'], [58, '', '', 'перевод'], [59, '14.07.26'], [60, '28.04.26'],
            [61, '16.06.26'], [62, '11.04.26'], [63, '14.05.26', 'n'], [65, '', '', 'перевод'], [66, '01.05.26'], [67, '21.04.26'], [68, '19.05.26'], [69, '19.05.26'], [70, '21.04.26'],
            [71, '24.03.26'], [72, '28.04.26', 'n'], [73, '26.03.26', 'n'], [74, '01.05.26'], [75, '01.05.26'], [76, '15.05.26'], [77, '14.05.26'], [78, '13.05.26'], [79, '14.05.26'], [80, '11.06.26'],
            [81, '15.05.26', 'n'], [82, '16.05.26', 'n'], [83, '21.05.26'], [84, '19.05.26'], [85, '16.06.26'], [86, '02.06.26'], [87, '04.06.26'], [88, '26.05.26'], [89, '26.05.26'], [90, '', '', 'перевод'],
            [91, '', '', 'декрет'], [92, '05.06.26'], [93, '02.06.26'], [94, '08.07.26'], [95, '16.06.26'], [96, '11.06.26'], [97, '19.05.26'], [98, '13.02.26'], [99, '', '', 'перевод'], [100, '23.06.26'],
            [101, '23.06.26'], [102, '25.06.26'], [103, '25.06.26'], [104, '25.06.26'], [105, '25.06.26'], [106, '03.07.26', 'n'], [107, '14.07.26'], [108, '26.06.26'], [109, '26.06.26'], [110, '', '', 'И.о.'],
            [111, '30.01.26'], [112, '08.07.26'], [113, '08.07.26'], [114, '06.07.26'], [115, '08.07.26'], [116, '08.07.26'], [117, '', '', 'Уволен'], [118, '10.07.26'], [119, '10.07.26'], [120, '21.07.26'],
            [121, '07.08.26'], [122, '21.07.26'], [123, '28.07.26'], [124, '30.07.26'], [125, '07.08.26'], [126, '28.07.26'], [127, '06.01.26'], [128, '07.08.26'], [129, '06.08.26'], [130, '', '', 'И.о., отказ'],
            [131, '', '', 'И.о., отказ'], [132, '30.07.26'], [133, '', '', 'Уволен'], [134, '14.08.26'], [135, '14.08.26'], [136, '14.08.26'], [137, '19.08.26'], [138, '', '', 'И.о.'], [139, '', '', 'Неуд (sana yozilmagan)'], [140, '', '', 'И.о.'],
            [141, '18.08.26'], [142, '', '', 'Неуд (sana yozilmagan)'], [143, '25.08.26', 'n'], [144, '02.09.26'], [145, '02.09.26'], [146, '', '', 'перевод'], [147, '', '', 'ОБ'], [148, '26.08.26'], [149, '', '', 'Неуд (sana yozilmagan)'], [150, '', '', 'перевод'],
            [151, '02.09.26'], [152, '26.08.26'], [153, '', '', 'И.о.'], [154, '26.08.26'], [155, '02.09.26'], [156, '', '', 'перевод'], [157, '02.09.26'], [158, '02.09.26'], [159, '04.09.26', 'n'], [161, '', '', 'И.о.'],
            [162, '04.09.26'], [163, '', '', 'И.о.'], [165, '', '', 'И.о.'], [182, '', '', 'Ошибочно (xato qator)']
        ];
        // qogʻozda qoʻlda tuzatilgan reja sanalari
        var MB_PLAN_FIX_2026: any = { 41: ['2025-10-10', '2026-10-09'], 98: ['2025-06-17', '2025-12-17'], 110: ['2025-07-02', '2026-01-02'], 111: ['2025-07-02', '2026-01-01'] };
        var MB_FACT_FILE = 'Bilimlar sinovi 2026 — qogʻozdagi haqiqiy sanalar (14.10.2026)';
        var MB_FLAG_UZ: any = { 'Уволен': 'ishdan boʻshagan', 'перевод': 'boshqa ishga oʻtgan', 'декрет': 'dekret taʼtilida', 'И.о.': 'vaqtincha bajaruvchi (i.o.) — topshirmagan', 'И.о., отказ': 'i.o. — rad etgan', 'ОБ': 'ОБ (qogʻozda)', 'Ошибочно (xato qator)': 'xato qator', 'Неуд (sana yozilmagan)': 'qoniqarsiz (sana yozilmagan)' };
        function mbFactApply(): boolean {
            try {
                const S = VB.MB_SEED_LOCAL || VB.MB_SEED; if (!S || !Array.isArray(S.rows) || typeof VB.mbData !== 'function' || typeof VB.allXodims !== 'function' || VB.allXodims().length < 10) return false;
                const d = VB.mbData(); if ((d.seeded || []).indexOf(MB_FACT_FILE) >= 0 || (typeof VB.canMMEdit === 'function' && !VB.canMMEdit())) return false;
                const L = S.rows.filter((r: any) => r.s === 'Лист1'), type = S.type || 'asosiy', now = new Date().toISOString(); let nR = 0, nF = 0;
                const pidOf = (n: string) => { const it = VB.mbMatch(n), pN = VB.mbPid({ name: n }); return it && VB.cleanTabel(it.tabel) ? 't:' + VB.cleanTabel(it.tabel) : pN; };
                MB_FACT_2026.forEach((x: any[]) => {
                    const row = L[x[0] - 1]; if (!row) return; const pid = pidOf(row.n), pk = pid + '|' + type;
                    if (pid.startsWith('n:')) d.ppl[pid] = Object.assign(d.ppl[pid] || {}, { name: VB.mbName(row.n), lav: VB.mbName(row.l), src: MB_FACT_FILE });
                    if (x[1]) { const m = String(x[1]).match(/^(\d\d)\.(\d\d)\.(\d\d)$/); if (!m) return; const dt = '20' + m[3] + '-' + m[2] + '-' + m[1], g = x[2] === 'n' ? 'n' : 'q';
                        if (!d.recs.some((r: any) => r.pid === pid && r.type === type && r.date === dt && !r.del)) { d.recs.push({ id: 'bs_f_' + String(pid + '_' + type + '_' + dt).replace(/[^a-z0-9_:-]/gi, '_'), pid: pid, type: type, date: dt, grade: g, src: 'import', file: MB_FACT_FILE, by: 'Qogʻozdagi jadval (imzo bilan)', at: now, sig: {}, corr: [], izoh: x[3] || '' }); nR++; } }
                    if (x[3]) { const pl = d.plan[pk] || {}; d.plan[pk] = Object.assign({}, typeof pl === 'string' ? { date: pl } : pl, { flag: MB_FLAG_UZ[x[3]] || x[3], file: MB_FACT_FILE }); nF++; }
                    if (!(d.asg[pid] || []).includes(type)) d.asg[pid] = (d.asg[pid] || []).concat([type]);
                });
                Object.keys(MB_PLAN_FIX_2026).forEach(k => { const row = L[+k - 1]; if (!row) return; const pid = pidOf(row.n), pk = pid + '|' + type, fx = MB_PLAN_FIX_2026[k]; const pl = d.plan[pk] || {}; d.plan[pk] = Object.assign({}, typeof pl === 'string' ? {} : pl, { date: fx[1], file: MB_FACT_FILE }); });
                d.seeded = Array.from(new Set((d.seeded || []).concat([MB_FACT_FILE])));
                d.log.push({ at: now, by: 'ilova', a: MB_FACT_FILE + ': ' + nR + ' ta haqiqiy sana, ' + nF + ' ta izoh' });
                VB.mbSave(d); return true;
            } catch (e) { console.error(e); return false; }
        }
        (function () { setTimeout(() => { mbFactApply(); }, 6000); window.addEventListener('agmk:login', () => setTimeout(() => { mbFactApply(); }, 5000)); try { VB.SEC_EV.fns.push(() => mbFactApply()); } catch (e) { /* */ } })();

        // =====================================================================
        //  • K-24 (muallif): rasmli hujjatni skanerlash — rasm, chizma, muhr oʻz joyida (rasm boʻlib) qoladi, matn esa
        //    tahrirlanadigan (Word) boʻladi. Server matnni oʻqigach, sahifadagi matn boʻlmagan «siyoh» joylari (rasm, chizma,
        //    muhr) topiladi va asl rangli rasmdan qirqib, matn oqimining aynan oʻsha joyiga qoʻyiladi. Jadval chiziqlari,
        //    qogʻoz cheti va mayda dogʻlar rasm hisoblanmaydi. PDF, Word, JPG va imzolash — hammasida rasm joyida.
        //  • K-25 (muallif): qisman qoʻlda imzolangan hujjat suratga olinsa — familiyadan oldingi qoʻl imzosi topiladi.
        //    Qoʻlda imzolaganlar imzoga YUBORILMAYDI (faqat qolganlarga). Soʻrov: imzolar saqlansinmi yoki tozalanib qayta
        //    imzoga tayyorlansinmi — «Hammasini saqlash / Hammasini tozalash» va har biri alohida. Tozalangan imzo hujjatdan
        //    oʻchadi, egasi esa imzolovchilar roʻyxatiga qaytadi; saqlangani hujjatda rasm boʻlib qoladi.
        //    Barcha kirish yoʻllarida: «📷 Rasmga olish», «🖼 Rasmlardan», bosh menyudagi «📷 Skaner».
        // =====================================================================
        var SC_INI = /^[A-ZА-ЯЁЎҚҒҲ][a-zа-яёʻʼ'’]?\.(?:\s?[A-ZА-ЯЁЎҚҒҲ][a-zа-яёʻʼ'’]?\.?)?,?$/;
        function scClean(s: unknown): string { return String(s || '').replace(/[^\p{L}-]/gu, ''); }
        function scEsc(s: unknown): string { return String(s == null ? '' : s).replace(/[&<>"]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]); }
        async function scPage(src: string): Promise<any> {
            const im: any = await VB.upLoadImg(src), c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
            const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0);
            const W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
            for (let i = 0, n = W * H; i < n; i++) { const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2], l = r * 0.299 + gg * 0.587 + b * 0.114, sat = Math.max(r, gg, b) - Math.min(r, gg, b); ink[i] = l < 150 || (sat > 70 && l < 225) ? 1 : 0; }
            return { cv: c, W: W, H: H, ink: ink };
        }
        // uzun ingichka chiziqlar (jadval, «______») — siyoh hisoblanmaydi
        function scLines(ink: Uint8Array, W: number, H: number, minRun: number): void {
            const t = 5;
            for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (!ink[y * W + x]) { x++; continue; } let x2 = x; while (x2 < W && ink[y * W + x2]) x2++;
                if (x2 - x >= minRun) { let bg = 0, n = 0; for (let k = x; k < x2; k += 3) { n++; const a = y - t >= 0 ? ink[(y - t) * W + k] : 0, b = y + t < H ? ink[(y + t) * W + k] : 0; if (!a && !b) bg++; } if (bg >= n * 0.6) for (let k = x; k < x2; k++) ink[y * W + k] = 0; }
                x = x2; } }
            for (let x = 0; x < W; x++) { let y = 0; while (y < H) { if (!ink[y * W + x]) { y++; continue; } let y2 = y; while (y2 < H && ink[y2 * W + x]) y2++;
                if (y2 - y >= minRun) { let bg = 0, n = 0; for (let k = y; k < y2; k += 3) { n++; const a = x - t >= 0 ? ink[k * W + x - t] : 0, b = x + t < W ? ink[k * W + x + t] : 0; if (!a && !b) bg++; } if (bg >= n * 0.6) for (let k = y; k < y2; k++) ink[k * W + x] = 0; }
                y = y2; } }
        }
        function scZero(ink: Uint8Array, W: number, H: number, r: any): void { const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y)), x1 = Math.min(W, Math.ceil(r.x + r.w)), y1 = Math.min(H, Math.ceil(r.y + r.h)); for (let y = y0; y < y1; y++) ink.fill(0, y * W + x0, y * W + x1); }
        function scCount(ink: Uint8Array, W: number, H: number, r: any): any {
            const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y)), x1 = Math.min(W, Math.ceil(r.x + r.w)), y1 = Math.min(H, Math.ceil(r.y + r.h));
            let n = 0; const rows = new Uint32Array(Math.max(1, y1 - y0)), cols = new Uint32Array(Math.max(1, x1 - x0));
            for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (ink[y * W + x]) { n++; rows[y - y0]++; cols[x - x0]++; }
            const lim = (a: Uint32Array) => { let s = -1, e = -1; for (let i = 0; i < a.length; i++) if (a[i] >= 2) { if (s < 0) s = i; e = i; } return [s, e]; };
            const [ry0, ry1] = lim(rows), [cx0, cx1] = lim(cols);
            return { n: n, box: ry0 < 0 || cx0 < 0 ? null : { x: x0 + cx0, y: y0 + ry0, w: cx1 - cx0 + 1, h: ry1 - ry0 + 1 } };
        }
        function scCrop(cv: any, r: any, q: number): string {
            const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(r.w)); c.height = Math.max(1, Math.round(r.h));
            const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(cv, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', q);
        }
        function scPad(r: any, p: number, W: number, H: number): any { const x = Math.max(0, r.x - p), y = Math.max(0, r.y - p); return { x: x, y: y, w: Math.min(W, r.x + r.w + p) - x, h: Math.min(H, r.y + r.h + p) - y }; }
        // rasm / chizma / muhr: matn va chiziqlardan tozalangan siyoh → katakchalar → bogʻlangan boʻlaklar
        function scFigs(P: any, ink: Uint8Array, lh: number, txt: any[]): any[] {
            const W = P.W, H = P.H, g = Math.max(4, Math.round(lh / 3)), gw = Math.ceil(W / g), gh = Math.ceil(H / g), cnt = new Uint16Array(gw * gh);
            for (let y = 0; y < H; y++) { const row = y * W, cy = ((y / g) | 0) * gw; for (let x = 0; x < W; x++) if (ink[row + x]) cnt[cy + ((x / g) | 0)]++; }
            const on = new Uint8Array(gw * gh), thr = Math.max(2, g * g * 0.03); for (let i = 0; i < on.length; i++) on[i] = cnt[i] >= thr ? 1 : 0;
            const dl = new Uint8Array(gw * gh); for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { if (!on[y * gw + x]) continue; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) dl[yy * gw + xx] = 1; } }
            const lab = new Int32Array(gw * gh).fill(-1), st = new Int32Array(gw * gh), out: any[] = [];
            for (let i = 0; i < dl.length; i++) { if (!dl[i] || lab[i] >= 0) continue; let sp = 0, n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; st[sp++] = i; lab[i] = i;
                while (sp) { const p = st[--sp], x = p % gw, y = (p / gw) | 0; if (on[p]) { n++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
                    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue; const q = yy * gw + xx; if (dl[q] && lab[q] < 0) { lab[q] = i; st[sp++] = q; } } }
                if (n < 10 || x1 < 0) continue;
                const r = { x: x0 * g, y: y0 * g, w: (x1 - x0 + 1) * g, h: (y1 - y0 + 1) * g, n: n };
                if (r.w < lh * 1.1 || r.h < lh * 0.5 || r.w * r.h > W * H * 0.7) continue;
                const fill = n / ((x1 - x0 + 1) * (y1 - y0 + 1)), edges = (r.x <= g ? 1 : 0) + (r.y <= g ? 1 : 0) + (r.x + r.w >= W - g ? 1 : 0) + (r.y + r.h >= H - g ? 1 : 0);
                if (edges >= 2 || (edges === 1 && fill < 0.2)) continue; // qogʻoz cheti, soya
                let tA = 0; txt.forEach(t => { const ix = Math.min(r.x + r.w, t.x + t.w) - Math.max(r.x, t.x), iy = Math.min(r.y + r.h, t.y + t.h) - Math.max(r.y, t.y); if (ix > 0 && iy > 0) tA += ix * iy; });
                if (tA > r.w * r.h * 0.35) continue; // matnli joy (jadval)
                out.push(r);
            }
            // yaqin boʻlaklar — bitta rasm
            let ch = true; while (ch) { ch = false; for (let a = 0; a < out.length && !ch; a++) for (let b = a + 1; b < out.length && !ch; b++) { const A = out[a], B = out[b], gx = Math.max(A.x, B.x) - Math.min(A.x + A.w, B.x + B.w), gy = Math.max(A.y, B.y) - Math.min(A.y + A.h, B.y + B.h);
                if (gx < lh * 0.8 && gy < lh * 0.8) { const x = Math.min(A.x, B.x), y = Math.min(A.y, B.y); out[a] = { x: x, y: y, w: Math.max(A.x + A.w, B.x + B.w) - x, h: Math.max(A.y + A.h, B.y + B.h) - y, n: A.n + B.n }; out.splice(b, 1); ch = true; } } }
            return out.map(r => scPad(r, lh * 0.25, W, H));
        }
        // qoʻl imzosi: familiyadan (va bosh harflardan) oldin, shu qator balandligida joylashgan siyoh boʻlagi.
        // Muhr (katta, deyarli dumaloq/kvadrat) imzo hisoblanmaydi — u rasm sifatida joyida qoladi.
        function scStampLike(r: any, lh: number): boolean { const a = r.w / Math.max(1, r.h); return r.w >= lh * 3 && r.h >= lh * 3 && a > 0.6 && a < 1.7; }
        function scSigFind(pages: any[], names: any[]): any[] {
            const out: any[] = [];
            names.forEach((nm: any) => {
                const k = VB.sigKey(nm.sur); if (!k || out.some(z => z.k === k)) return; let best: any = null;
                pages.forEach((P: any, pi: number) => P.lines.forEach((l: any) => { const ws = l.words.slice().sort((a: any, b: any) => a.x - b.x); ws.forEach((w: any, wi: number) => { const c = scClean(w.s); if (c.length > 2 && VB.sigKey(c) === k && (!best || pi > best.pi || (pi === best.pi && l.y >= best.l.y))) best = { pi: pi, l: l, ws: ws, wi: wi }; }); }));
                if (!best) return;
                const P = pages[best.pi], lh = P.lh; let j = best.wi; while (j > 0 && SC_INI.test(String(best.ws[j - 1].s)) && best.ws[j].x - (best.ws[j - 1].x + best.ws[j - 1].w) < lh * 1.5) j--;
                const gx = best.ws[j].x, ly = best.l.y + best.l.h / 2, x0 = Math.max(0, gx - P.W * 0.42);
                const C = P.comps.filter((c: any) => { if (c.used || scStampLike(c, lh) || c.h > lh * 4) return false; const cx = c.x + c.w / 2, cy = c.y + c.h / 2; return cx > x0 && cx < gx + lh * 0.3 && c.x < gx + lh * 0.3 && Math.abs(cy - ly) < lh * 1.3; });
                if (!C.length) return;
                const x = Math.min(...C.map((c: any) => c.x)), y = Math.min(...C.map((c: any) => c.y)), box = { x: x, y: y, w: Math.max(...C.map((c: any) => c.x + c.w)) - x, h: Math.max(...C.map((c: any) => c.y + c.h)) - y };
                const n = scCount(P.ink, P.W, P.H, box).n; if (n < lh * lh * 0.3 || box.h < lh * 0.5 || box.w < lh * 1.2) return;
                C.forEach((c: any) => { c.used = 1; });
                out.push({ k: k, lab: nm.label, pi: best.pi, box: box, lh: lh });
            });
            return out;
        }
        function scInsSig(root: any, k: string, html: string): boolean {
            const toks: any[] = [], tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n: any;
            while ((n = tw.nextNode())) { const re = /\S+/g; let m; while ((m = re.exec(n.nodeValue))) toks.push({ n: n, i: m.index, s: m[0] }); }
            let j = -1; toks.forEach((t, x) => { const c = scClean(t.s); if (c.length > 2 && VB.sigKey(c) === k) j = x; });
            if (j < 0) return false;
            while (j > 0 && SC_INI.test(toks[j - 1].s)) j--;
            const t = toks[j], tmp = document.createElement('span'); tmp.innerHTML = html; const im = tmp.firstChild as any, par = t.n.parentNode;
            if (par && par.nodeName === 'MARK' && t.i === 0) par.parentNode.insertBefore(im, par);
            else { const rest = t.n.splitText(t.i); rest.parentNode.insertBefore(im, rest); }
            return true;
        }
        // OCR natijasi + sahifa rasmlari → rasmlar va qoʻl imzolari joyida boʻlgan tahrirlanadigan matn
        async function scEnrich(): Promise<any> {
            const U = VB.UP, R = U.ocr || [], S = U.scans || [], st = { figs: 0, sigs: 0 }; if (!R.length || R.length !== S.length) return st;
            const pages: any[] = [];
            for (let i = 0; i < R.length; i++) {
                const p = R[i], P = await scPage(S[i].out), sx = p.w ? P.W / p.w : 1, sy = p.h ? P.H / p.h : 1;
                const lines = (p.lines || []).filter((l: any) => l.words && l.words.length).map((l: any) => Object.assign({}, l, { x: l.x * sx, y: l.y * sy, w: l.w * sx, h: l.h * sy, words: l.words.map((w: any) => Object.assign({}, w, { x: w.x * sx, y: w.y * sy, w: w.w * sx, h: w.h * sy })) }));
                const hs = lines.map((l: any) => l.h).sort((a: number, b: number) => a - b), lh = hs[hs.length >> 1] || 24;
                const xs = lines.map((l: any) => l.x).sort((a: number, b: number) => a - b), xe = lines.map((l: any) => l.x + l.w).sort((a: number, b: number) => a - b);
                Object.assign(P, { lines: lines, lh: lh, left: lines.length ? xs[Math.floor(xs.length * 0.1)] : P.W * 0.08, right: lines.length ? xe[Math.floor(xe.length * 0.9)] : P.W * 0.92, src: S[i] });
                // ishonchli soʻzlar — matn (siyoh hisoblanmaydi); imzo «soʻz» boʻlib oʻqilsa — baland, ishonchsiz: matn emas
                P.txt = []; lines.forEach((l: any) => l.words.forEach((w: any) => { if (w.c >= 60 && w.h <= lh * 1.6 && scClean(w.s).length + String(w.s).replace(/\D/g, '').length >= 1) P.txt.push({ x: w.x - 2, y: w.y - 2, w: w.w + 4, h: w.h + 4 }); }));
                P.txt.forEach((r: any) => scZero(P.ink, P.W, P.H, r)); scLines(P.ink, P.W, P.H, Math.round(lh * 3));
                pages.push(P);
            }
            let names: any[] = []; try { names = VB.sigNamesFromHtml(R.map((p: any) => VB.upOcrHtml(p, false)).join('')); } catch (e) { /* */ }
            pages.forEach(P => { P.comps = scFigs(P, P.ink, P.lh, P.txt); });
            const sigs = scSigFind(pages, names);
            const htmls: string[] = [];
            for (let i = 0; i < pages.length; i++) {
                const P = pages[i], figs = P.comps.filter((c: any) => !c.used && c.w >= P.lh * 2.5 && c.h >= P.lh * 1.5).sort((a: any, b: any) => a.y - b.y), mySigs = sigs.filter(s => s.pi === i);
                const inside = (w: any, r: any) => { const cx = w.x + w.w / 2, cy = w.y + w.h / 2; return cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h; };
                // rasm/imzo ichidagi ishonchsiz «soʻzlar» (muhr, imzo chiziqlari) — matnga kirmaydi
                const lines = P.lines.map((l: any) => Object.assign({}, l, { words: l.words.filter((w: any) => !(w.c < 70 && (figs.some(f => inside(w, f)) || mySigs.some(s => inside(w, s.box))))) })).filter((l: any) => l.words.length);
                let colorCv: any = null; if (figs.length) { try { colorCv = P.src.mode === 'color' ? P.cv : VB.upWarp(Object.assign({}, P.src, { mode: 'color' })); } catch (e) { colorCv = P.cv; } }
                const Sx = { h: P.lh, left: P.left, right: P.right }, tw = Math.max(1, P.right - P.left);
                // matn qatorlari yonidan oʻtgan rasm (masalan, imzolar ustidagi muhr) — matn ustida, oʻz joyida (qatorga bogʻlanadi)
                const ovs: any[] = []; for (let fi = figs.length - 1; fi >= 0; fi--) { const f = figs[fi], hit = lines.filter((l: any) => { const cy = l.y + l.h / 2; return cy > f.y && cy < f.y + f.h; });
                    if (!hit.length) continue; figs.splice(fi, 1); const an = hit[0], oi = ovs.length;
                    an.words = [{ s: '\u2042' + oi + '\u2042', x: an.x - 1, y: an.y, w: 0, h: an.h, c: 99 }].concat(an.words);
                    ovs.push({ f: f, an: an }); }
                let h = ''; const segs: any[][] = figs.map(() => []).concat([[]]);
                lines.forEach((l: any) => { const cy = l.y + l.h / 2; segs[figs.filter(f => f.y + f.h / 2 < cy).length].push(l); });
                segs.forEach((L, si) => {
                    if (L.length) h += VB.upOcrHtml({ lines: L }, true, Sx);
                    const f = figs[si]; if (!f) return;
                    const fw = Math.min(1, f.w / tw), fx = Math.max(0, (f.x - P.left) / tw), cx = f.x + f.w / 2, mid = (P.left + P.right) / 2;
                    const al = Math.abs(cx - mid) < tw * 0.1 ? 'center' : fx + fw > 0.97 && fx > 0.3 ? 'right' : 'left';
                    const u = scCrop(colorCv || P.cv, f, 0.9);
                    h += `<p class="ni up-fig" style="text-align:${al}"><img class="up-fig" src="${u}" data-w="${Math.round(f.w)}" data-h="${Math.round(f.h)}" data-fw="${fw.toFixed(3)}" data-fx="${al === 'left' ? fx.toFixed(3) : '0'}" style="width:${(fw * 100).toFixed(1)}%;${al === 'left' && fx > 0.02 ? 'margin-left:' + (Math.min(fx, 1 - fw) * 100).toFixed(1) + '%;' : ''}"></p>`; st.figs++;
                });
                ovs.forEach((o, oi) => { const f = o.f, k = tw > 0 ? 1 / tw : 0, u = scCrop(colorCv || P.cv, f, 0.9);
                    h = h.replace('\u2042' + oi + '\u2042', `<img class="up-fig up-ov" src="${u}" data-w="${Math.round(f.w)}" data-h="${Math.round(f.h)}" data-fw="${(f.w * k).toFixed(3)}" data-ox="${((f.x - P.left) * k).toFixed(3)}" data-oy="${((f.y - o.an.y) * k).toFixed(3)}">`); st.figs++; });
                const box = document.createElement('div'); box.innerHTML = h;
                mySigs.forEach(s => { const u = scCrop(P.cv, s.box, 0.92); if (scInsSig(box, s.k, `<img class="up-hsig" data-k="${scEsc(s.k)}" data-lab="${scEsc(s.lab)}" data-w="${Math.round(s.box.w)}" data-h="${Math.round(s.box.h)}" data-rh="${(s.box.h / s.lh).toFixed(2)}" src="${u}">`)) st.sigs++; });
                htmls.push(box.innerHTML);
            }
            U.ocrHtml = htmls.join('<p class="ni up-pb">&nbsp;</p>');
            return st;
        }
        if (typeof VB.upScanGo === 'function') VB.upScanGo = VB.agmkExtend('upScanGo', 'v3.18.1: rasm, muhr, qoʻl imzosi joyida (K-24, K-25)', VB.upScanGo, (o: Function) => async function (this: unknown) {
            const r = await o.apply(this, arguments);
            try { const U = VB.UP; if (U.st === 'ocr' && U.ocr && U.ocr.length) { VB.upBusy('🖼 Rasm, chizma, muhr va qoʻl imzolari aniqlanmoqda…'); await new Promise(z => setTimeout(z, 30)); const s = await scEnrich(); U.scInfo = s; VB.upRender(); if (s.figs || s.sigs) VB.showToast('🖼 ' + (s.figs ? s.figs + ' ta rasm/chizma/muhr joyida' : '') + (s.figs && s.sigs ? ', ' : '') + (s.sigs ? s.sigs + ' ta qoʻl imzosi topildi' : '')); } }
            catch (e) { console.error(e); try { VB.upRender(); } catch (x) { /* */ } }
            return r;
        });
        // tahrirdan keyingi tozalashda rasmlar (src va oʻlchamlari bilan) saqlanadi
        if (typeof VB.upClean === 'function') VB.upClean = VB.agmkExtend('upClean', 'v3.18.1: rasmlar saqlanadi', VB.upClean, (o: Function) => function (this: unknown, html: string) {
            const keep: string[] = [], h2 = String(html || '').replace(/<img\b[^>]*>/gi, (m: string) => { if (!/class="up-(hsig|fig)[" ]/.test(m)) return m; keep.push(m); return 'zzUPIMG' + (keep.length - 1) + 'zz'; });
            let r = o.call(this, h2); if (!keep.length) return r;
            r = String(r).replace(/zzUPIMG(\d+)zz/g, (m: string, i: string) => keep[+i] || '');
            const box = document.createElement('div'); box.innerHTML = r;
            box.querySelectorAll('img.up-fig').forEach((im: any) => { const p = im.closest('p'); if (p && !p.textContent.trim()) p.classList.add('ni', 'up-fig'); });
            return box.innerHTML;
        });
        if (typeof VB.upOcrRender === 'function') VB.upOcrRender = VB.agmkExtend('upOcrRender', 'v3.18.1: rasm va imzolar haqida', VB.upOcrRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const s = VB.UP.scInfo, t = document.querySelector('#screen-hisob .nd-tip'); if (s && t && (s.figs || s.sigs)) t.insertAdjacentHTML('beforeend', ` <br>🖼 ${s.figs ? `<b>${s.figs}</b> ta rasm / chizma / muhr asl joyida rasm boʻlib qoldi` : ''}${s.figs && s.sigs ? '; ' : ''}${s.sigs ? `<b>${s.sigs}</b> ta qoʻl imzosi topildi (keyingi qadamda: saqlash yoki tozalash)` : ''}. Matnni bemalol tuzating — rasmlarga tegmang.`); } catch (e) { /* */ }
            return r;
        });

        // ---------- PDF / JPG / imzo varagʻi: rasm joyida, saqlangan qoʻl imzosi familiya oldida ----------
        var SC_IMG = new Map<string, any>();
        function scImgEl(u: string): any { let im = SC_IMG.get(u); if (!im) { im = new Image(); im.src = u; SC_IMG.set(u, im); if (SC_IMG.size > 60) SC_IMG.delete(SC_IMG.keys().next().value as string); } return im; }
        async function scImgsReady(lay: any): Promise<void> { const L: any[] = []; (lay && lay.pages || []).forEach((ops: any[]) => ops.forEach((o: any) => { if (o.k === 'img' && o.cv instanceof HTMLImageElement && !o.cv.complete) L.push(o.cv.decode().catch(() => null)); })); if (L.length) await Promise.all(L); }
        function scU8(u: string): Uint8Array { const b = atob(String(u).split(',')[1] || ''), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
        if (typeof VB.pdfLayoutAkt === 'function') VB.pdfLayoutAkt = VB.agmkExtend('pdfLayoutAkt', 'v3.18.1: rasm va qoʻl imzolari', VB.pdfLayoutAkt, (o: Function) => function (this: unknown, root: any) {
            if (!root || !root.querySelector || !root.querySelector('img.up-hsig, img.up-fig')) return o.apply(this, arguments);
            const cl = root.cloneNode(true); document.body.appendChild(cl);
            const AKT = !!cl.querySelector('.a-approve, .a-title, .a-head'), mm = 72 / 25.4, fs = AKT ? 12 : 14, step = fs * (AKT ? 1.15 : 1.18) + 2, L = 30 * mm, cw = 595.28 - L - 15 * mm, avH = 841.89 - (AKT ? 25 : 40) * mm;
            const sigs: any[] = [], figs: any[] = [], ovs: any[] = [];
            cl.querySelectorAll('img.up-ov').forEach((im: any) => { ovs.push({ u: im.getAttribute('src'), pw: +im.dataset.w || 300, ph: +im.dataset.h || 300, fw: +im.dataset.fw || 0.2, ox: +im.dataset.ox || 0, oy: +im.dataset.oy || 0 }); im.replaceWith(document.createTextNode(' zzOV' + (ovs.length - 1) + 'zz ')); });
            cl.querySelectorAll('img.up-hsig').forEach((im: any) => { if (!im.hasAttribute('data-off')) sigs.push({ k: im.dataset.k, u: im.getAttribute('src'), pw: +im.dataset.w || 200, ph: +im.dataset.h || 80 }); im.remove(); });
            cl.querySelectorAll('img.up-fig').forEach((im: any) => {
                const p = im.closest('p') || im, pw = +im.dataset.w || 400, ph = +im.dataset.h || 300, al = (p.style && p.style.textAlign) || 'left';
                let w = Math.min(1, +im.dataset.fw || 1) * cw, h = w * ph / pw; if (h > avH * 0.9) { h = avH * 0.9; w = h * pw / ph; }
                const x = al === 'center' ? L + (cw - w) / 2 : al === 'right' ? L + cw - w : L + Math.min(cw - w, Math.max(0, +im.dataset.fx || 0) * cw);
                const i = figs.length, N = Math.max(1, Math.ceil(h / step)); figs.push({ u: im.getAttribute('src'), pw: pw, ph: ph, w: w, h: h, x: x, N: N });
                const frag = document.createDocumentFragment(); for (let j = 0; j < N; j++) { const q = document.createElement('p'); q.className = 'ni'; q.textContent = 'zzFIG' + i + 'zz'; frag.appendChild(q); }
                if (p !== im && !p.textContent.trim()) p.replaceWith(frag); else { (p.parentNode || cl).insertBefore(frag, p); im.remove(); }
            });
            let lay: any; try { lay = o.call(this, cl); } finally { cl.remove(); }
            try {
                figs.forEach((f, i) => {
                    const tok = 'zzFIG' + i + 'zz', hits: any[] = [];
                    lay.pages.forEach((ops: any[], pi: number) => ops.forEach((op: any) => { if (op.k === 't' && op.s === tok) hits.push({ pi: pi, y: op.y - op.fs * 0.89 }); }));
                    lay.pages = lay.pages.map((ops: any[]) => ops.filter((op: any) => !(op.k === 't' && op.s === tok)));
                    if (!hits.length) return; const per: any = {}; hits.forEach(hh => { (per[hh.pi] = per[hh.pi] || []).push(hh.y); });
                    const pg = +Object.keys(per).sort((a, b) => per[b].length - per[a].length || +a - +b)[0], ys = per[pg], top = Math.min(...ys), room = ys.length * step;
                    let w = f.w, h = f.h; if (h > room + step) { h = room; w = h * f.pw / f.ph; }
                    lay.pages[pg].push({ k: 'img', x: f.x + (f.w - w) / 2 * (f.x > L + 1 ? 1 : 0), y: top, w: w, h: h, data: scU8(f.u), pw: f.pw, ph: f.ph, mul: 1, cv: scImgEl(f.u) });
                });
                const ovImg: any[] = []; // muhr: avval shu qatordagi belgi olib tashlanadi, rasm esa oxirida eng tagiga qoʻyiladi
                ovs.forEach((f, i) => {
                    const tok = 'zzOV' + i + 'zz'; let pg = -1, op: any = null; lay.pages.forEach((ops: any[], pi: number) => ops.forEach((z: any) => { if (z.k === 't' && z.s === tok) { pg = pi; op = z; } }));
                    if (!op) return; const ops = lay.pages[pg], ed = (z: any) => z.x + VB.pdfW(z.st, z.s, z.fs), all = ops.filter((z: any) => z.k === 't' && z !== op && Math.abs(z.y - op.y) < 1 && z.x > op.x).sort((a: any, b: any) => a.x - b.x), nx: any[] = [];
                    for (const z of all) { if (nx.length ? z.x - ed(nx[nx.length - 1]) > 15 : z.x - ed(op) > 15) break; nx.push(z); } // faqat shu katak/qatordagi soʻzlar
                    if (nx.length) { const dlt = Math.min(...nx.map((z: any) => z.x)) - op.x; nx.forEach((z: any) => { z.x -= dlt; }); }
                    ops.splice(ops.indexOf(op), 1);
                    const w = f.fw * cw, h = w * f.ph / f.pw; ovImg.push({ ops: ops, op: { k: 'img', x: L + f.ox * cw, y: op.y - op.fs * 0.89 + f.oy * cw, w: w, h: h, data: scU8(f.u), pw: f.pw, ph: f.ph, mul: 1, cv: scImgEl(f.u) } });
                });
                const end = (z: any) => z.x + VB.pdfW(z.st, z.s, z.fs);
                sigs.forEach(s => {
                    let pg = -1, oi = -1; lay.pages.forEach((ops: any[], p: number) => ops.forEach((op: any, i: number) => { if (op.k !== 't') return; const c = scClean(op.s); if (c.length > 2 && VB.sigKey(c) === s.k) { pg = p; oi = i; } }));
                    if (pg < 0) return;
                    const ops = lay.pages[pg], o2 = ops[oi], same = ops.filter((z: any) => z.k === 't' && Math.abs(z.y - o2.y) < 1).sort((a: any, b: any) => a.x - b.x);
                    let gi = same.indexOf(o2); while (gi > 0 && SC_INI.test(same[gi - 1].s) && o2.x - end(same[gi - 1]) < 40) gi--;
                    const gx0 = same[gi].x; let h = Math.min(34, o2.fs * 2.6), w = h * s.pw / s.ph; if (w > 120) { w = 120; h = w * s.ph / s.pw; }
                    let px: number; const us = same.find((z: any) => /_{3,}/.test(z.s) && z.x < gx0);
                    if (us) { px = (us.x + end(us)) / 2 - w / 2; } else { const lo = same.filter((z: any) => end(z) < gx0 - 2).reduce((m: number, z: any) => Math.max(m, end(z) + 6), L); px = gx0 - 8 - w >= lo ? gx0 - 8 - w : Math.max(L, gx0 - w * 0.8); }
                    ops.unshift({ k: 'img', x: px, y: o2.y - h * 0.78, w: w, h: h, data: scU8(s.u), pw: s.pw, ph: s.ph, mul: 1, cv: scImgEl(s.u) });
                });
                ovImg.forEach(z => z.ops.unshift(z.op)); // muhr — eng tagida (imzolar va matn uning ustida)
            } catch (e) { console.error(e); }
            return lay;
        });
        // imzolash varagʻi va koʻruvchi: rasmlar chizilishidan oldin yuklangan boʻlsin
        if (typeof VB.sigLayout === 'function') VB.sigLayout = VB.agmkExtend('sigLayout', 'v3.18.1: rasmlar tayyor', VB.sigLayout, (o: Function) => async function (this: unknown) { const lay = await o.apply(this, arguments); try { await scImgsReady(lay); } catch (e) { /* */ } return lay; });
        // ---------- Word: rasm — oʻz xatboshisida, qoʻl imzosi — familiya oldida (matn tahrirlanadi) ----------
        function scDrawing(i: number, cx: number, cy: number): string {
            return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${500 + i}" name="Rasm ${i + 1}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${500 + i}" name="rasm${i + 1}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rScIm${i + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
        }
        function scAnchor(i: number, cx: number, cy: number, ox: number, oy: number): string {
            return `<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="${10 + i}" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="margin"><wp:posOffset>${ox}</wp:posOffset></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>${oy}</wp:posOffset></wp:positionV><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="${500 + i}" name="Muhr ${i + 1}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${500 + i}" name="rasm${i + 1}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rScIm${i + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>`;
        }
        if (typeof VB.docxFromEl === 'function') VB.docxFromEl = VB.agmkExtend('docxFromEl', 'v3.18.1: rasm va qoʻl imzolari', VB.docxFromEl, (o: Function) => function (this: unknown, root: any) {
            if (!root || !root.querySelector || !root.querySelector('img.up-hsig, img.up-fig')) return o.apply(this, arguments);
            const cl = root.cloneNode(true), M: any[] = [], TWE = 9355 * 635;
            cl.querySelectorAll('img.up-hsig[data-off]').forEach((im: any) => im.remove());
            cl.querySelectorAll('img.up-hsig, img.up-fig').forEach((im: any) => {
                const pw = +im.dataset.w || 400, ph = +im.dataset.h || 300; let cx: number, cy: number;
                if (im.classList.contains('up-ov')) { cx = Math.round((+im.dataset.fw || 0.2) * TWE); cy = Math.round(cx * ph / pw); M.push({ u: im.getAttribute('src'), cx: cx, cy: cy, ov: [Math.round((+im.dataset.ox || 0) * TWE), Math.round((+im.dataset.oy || 0) * TWE)] }); im.replaceWith(document.createTextNode(' zzDXIMG' + (M.length - 1) + 'zz ')); return; }
                if (im.classList.contains('up-hsig')) { cy = 360000; cx = Math.round(cy * pw / ph); if (cx > 1150000) { cx = 1150000; cy = Math.round(cx * ph / pw); } }
                else { cx = Math.round(Math.min(1, +im.dataset.fw || 1) * TWE); cy = Math.round(cx * ph / pw); if (cy > 8500000) { cy = 8500000; cx = Math.round(cy * pw / ph); } const p = im.closest('p'); if (p && !p.style.textAlign && +im.dataset.fx > 0.3) p.style.textAlign = 'center'; }
                M.push({ u: im.getAttribute('src'), cx: cx, cy: cy }); im.replaceWith(document.createTextNode(' zzDXIMG' + (M.length - 1) + 'zz '));
            });
            const oz = VB.zipBlob;
            VB.zipBlob = function (files: any[], mime: string) {
                try { files = files.map((f: any) => {
                    if (f.name === 'word/document.xml') { let d = String(f.data); const root = (/<w:document\b[^>]*>/.exec(d) || [''])[0], add = (/xmlns:r=/.test(root) ? '' : ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"') + (/xmlns:wp=/.test(root) ? '' : ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"');
                        if (add) d = d.replace('<w:document ', '<w:document' + add + ' ');
                        const re = /<w:r><w:rPr>((?:(?!<\/w:rPr>).)*)<\/w:rPr><w:t xml:space="preserve">([^<]*?)zzDXIMG(\d+)zz([^<]*)<\/w:t><\/w:r>/;
                        for (let g = 0; g < 500 && re.test(d); g++) d = d.replace(re, (m: string, rp: string, a: string, i: string, b: string) => (a.trim() ? `<w:r><w:rPr>${rp}</w:rPr><w:t xml:space="preserve">${a}</w:t></w:r>` : '') + (M[+i].ov ? scAnchor(+i, M[+i].cx, M[+i].cy, M[+i].ov[0], M[+i].ov[1]) : scDrawing(+i, M[+i].cx, M[+i].cy)) + (b.trim() ? `<w:r><w:rPr>${rp}</w:rPr><w:t xml:space="preserve">${b}</w:t></w:r>` : ''));
                        d = d.replace(/zzDXIMG\d+zz/g, ''); return { name: f.name, data: d }; }
                    if (f.name === 'word/_rels/document.xml.rels') return { name: f.name, data: String(f.data).replace('</Relationships>', M.map((m, i) => `<Relationship Id="rScIm${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/rasm${i + 1}.jpeg"/>`).join('') + '</Relationships>') };
                    if (f.name === '[Content_Types].xml') return { name: f.name, data: /Extension="jpeg"/.test(f.data) ? f.data : String(f.data).replace('<Default Extension="xml"', '<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="xml"') };
                    return f; }).concat(M.map((m, i) => ({ name: 'word/media/rasm' + (i + 1) + '.jpeg', data: scU8(m.u) }))); } catch (e) { console.error(e); }
                return oz.call(this, files, mime);
            };
            try { return o.call(this, cl); } finally { VB.zipBlob = oz; }
        });

        // ---------- K-25: qoʻlda imzolanganlar — soʻrov (saqlash / tozalash) va faqat qolganlarga yuborish ----------
        function hhCtx(ctx: string): any { return ctx === 'pend' ? VB.SIG.pend : VB.UP; }
        function hhList(html: string): any[] { if (!/class="up-hsig"/.test(String(html || ''))) return []; const b = document.createElement('div'); b.innerHTML = html; return Array.from(b.querySelectorAll('img.up-hsig')).map((im: any) => ({ k: im.dataset.k, lab: im.dataset.lab || '', u: im.getAttribute('src'), off: im.hasAttribute('data-off') })); }
        function hhRowKey(r: any): string { const s = VB.upSur(r.label || r.name || ''); return s ? VB.sigKey(s) : ''; }
        function hhRows(ctx: string, k: string): any[] { const C = hhCtx(ctx); return ((C && C.rows) || []).filter((r: any) => hhRowKey(r) === k); }
        function hhInit(ctx: string): void {
            const C = hhCtx(ctx); if (!C || !C.rows || C.rows._hs) return; const L = hhList(C.html); C.rows._hs = 1; if (!L.length) return;
            L.forEach(s => hhRows(ctx, s.k).forEach((r: any) => { r.hand = !s.off; if (!s.off) r.on = false; }));
        }
        function hhSet(ctx: string, k: string | null, keep: boolean): void {
            const C = hhCtx(ctx); if (!C) return; const b = document.createElement('div'); b.innerHTML = C.html;
            b.querySelectorAll('img.up-hsig').forEach((im: any) => { if (k && im.dataset.k !== k) return; if (keep) im.removeAttribute('data-off'); else im.setAttribute('data-off', '1');
                hhRows(ctx, im.dataset.k).forEach((r: any) => { r.hand = keep; r.on = keep ? false : !!r.tabel; }); });
            C.html = b.innerHTML; if (ctx === 'pend') VB.sigSendRender(); else VB.upReviewRender();
        }
        function hhFinal(html: string): string { if (!/data-off/.test(String(html || ''))) return html; const b = document.createElement('div'); b.innerHTML = html; b.querySelectorAll('img.up-hsig[data-off]').forEach((im: any) => im.remove()); return b.innerHTML; }
        function hhPanel(ctx: string): string {
            const C = hhCtx(ctx), L = hhList(C && C.html); if (!L.length) return '';
            const kept = L.filter(s => !s.off).length;
            return `<div class="hs-box hs-hand"><div class="hs-h">✍️ Qoʻlda imzolangan: ${L.length} kishi</div>
                <div class="nd-tip">Rasmda bu xodimlar <b>qoʻlda imzo qoʻygan</b>. Imzo saqlansa — hujjatda rasm boʻlib qoladi va xodim imzoga <b>yuborilmaydi</b>. Tozalansa — imzo oʻchiriladi va xodim qayta imzoga yuboriladi. Imzolar saqlansinmi?</div>
                <div class="hs-hand-all"><button type="button" class="${kept === L.length ? 'on' : ''}" onclick="hhSet('${ctx}',null,true)">💾 Hammasini saqlash</button><button type="button" class="${kept === 0 ? 'on' : ''}" onclick="hhSet('${ctx}',null,false)">🧹 Hammasini tozalash</button></div>
                ${L.map(s => { const r = hhRows(ctx, s.k)[0], nm = r ? (r.name || r.label || s.lab) : s.lab; return `<div class="hs-hand-r${s.off ? ' off' : ''}"><img src="${s.u}" alt=""><div class="hs-hand-n"><b>${scEsc(nm)}</b><small>${s.off ? '🧹 tozalanadi → qayta imzoga yuboriladi' : '💾 saqlanadi → yuborilmaydi'}</small></div>
                    <span class="hs-hand-b"><button type="button" class="${s.off ? '' : 'on'}" onclick="hhSet('${ctx}','${scEsc(s.k)}',true)">💾</button><button type="button" class="${s.off ? 'on' : ''}" onclick="hhSet('${ctx}','${scEsc(s.k)}',false)">🧹</button></span></div>`; }).join('')}</div>`;
        }
        function hhMark(ctx: string, tl: any): void { const C = hhCtx(ctx); if (!tl || !C) return; (C.rows || []).forEach((r: any, i: number) => { const c = tl.children[i]; if (c && r.hand && !c.querySelector('.v9-tag.h')) c.insertAdjacentHTML('afterbegin', '<div class="v9-tag h">✍️ Qoʻlda imzolagan — yuborilmaydi</div>'); }); }
        if (typeof VB.upReviewRender === 'function') VB.upReviewRender = VB.agmkExtend('upReviewRender', 'v3.18.1: qoʻlda imzolanganlar (K-25)', VB.upReviewRender, (o: Function) => function (this: unknown) {
            try { hhInit('up'); } catch (e) { /* */ }
            const r = o.apply(this, arguments);
            try { const p = hhPanel('up'), b = VB.secBody('screen-hisob'); if (p && b) { b.querySelectorAll('.hs-hand').forEach((e: any) => e.remove()); const tl = b.querySelector('.v9-tl'), box = (tl && tl.closest('.hs-box')) || b.querySelectorAll('.hs-box')[1]; if (box) box.insertAdjacentHTML('beforebegin', p); hhMark('up', tl); } } catch (e) { console.warn(e); }
            return r;
        });
        if (typeof VB.sigSendRender === 'function') VB.sigSendRender = VB.agmkExtend('sigSendRender', 'v3.18.1: qoʻlda imzolanganlar (K-25)', VB.sigSendRender, (o: Function) => function (this: unknown) {
            try { hhInit('pend'); } catch (e) { /* */ }
            const r = o.apply(this, arguments);
            try { const p = hhPanel('pend'), box = VB.$id('sgSend'); if (p && box) { box.querySelectorAll('.hs-hand').forEach((e: any) => e.remove()); const a = box.querySelector('.snd-doc'); if (a) a.insertAdjacentHTML('afterend', p); hhMark('pend', box.querySelector('.v9-tl')); } } catch (e) { console.warn(e); }
            return r;
        });
        // yuborishda: tozalangan imzolar hujjatdan butunlay olib tashlanadi
        if (typeof VB.upSend === 'function') VB.upSend = VB.agmkExtend('upSend', 'v3.18.1: tozalangan qoʻl imzolari', VB.upSend, (o: Function) => async function (this: unknown) {
            const U = VB.UP, keep = U.html; U.html = hhFinal(U.html);
            try { return await o.apply(this, arguments); } finally { if (U.html && U.st === 'review') U.html = keep; }
        });
        if (typeof VB.sigSendGo === 'function') VB.sigSendGo = VB.agmkExtend('sigSendGo', 'v3.18.1: tozalangan qoʻl imzolari', VB.sigSendGo, (o: Function) => async function (this: unknown) {
            const P = VB.SIG.pend; if (!P) return o.apply(this, arguments); const keep = P.html; P.html = hhFinal(P.html);
            try { return await o.apply(this, arguments); } finally { if (VB.SIG.pend === P) P.html = keep; }
        });
        (function () { const st = document.createElement('style'); st.textContent = `
            .up-ocr-txt img.up-hsig,.up-doc img.up-hsig{height:2.4em;max-width:7em;vertical-align:middle;margin-right:4px;border-radius:4px;outline:1px dashed #a855f7}
            .up-doc img.up-hsig[data-off]{opacity:.18;outline-color:#ef4444}
            .up-ocr-txt p.up-fig,.up-doc p.up-fig{margin:6px 0}.up-ocr-txt img.up-fig,.up-doc img.up-fig{max-width:100%;height:auto;border-radius:4px;outline:1px dashed #60a5fa}.up-ocr-txt img.up-ov,.up-doc img.up-ov{width:auto!important;height:3em;vertical-align:middle;margin-right:4px}
            .hs-hand{border-color:#a855f7!important}.hs-hand-all{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}
            .hs-hand button{border:1px solid #475569;background:#1e293b;color:#e2e8f0;border-radius:10px;padding:8px 6px;font-size:13px}.hs-hand button.on{border-color:#a855f7;background:linear-gradient(135deg,rgba(124,58,237,.55),rgba(168,85,247,.4));color:#fff}
            .hs-hand-r{display:flex;align-items:center;gap:8px;padding:7px;margin:5px 0;border-radius:12px;background:#0f172a;border:1px solid #334155}.hs-hand-r.off{opacity:.75}
            .hs-hand-r img{width:84px;height:40px;object-fit:contain;background:#fff;border-radius:6px;flex:none}.hs-hand-r.off img{opacity:.3}
            .hs-hand-n{flex:1;min-width:0}.hs-hand-n b{display:block;color:#f1f5f9;font-size:14px}.hs-hand-n small{color:#94a3b8;font-size:11px}
            .hs-hand-b{display:flex;gap:4px}.hs-hand-b button{width:40px;padding:6px 0}
            .v9-tag.h{background:rgba(168,85,247,.18);color:#d8b4fe}`; document.head.appendChild(st); })();
