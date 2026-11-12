        /* ===== 30-bosqich (2): Word / Excel / JPG hujjatlar va yuborish ===== */
        // ---------- ZIP (siqilmagan, CRC32 bilan) ----------
        var ZCRC = (function () { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
        function zCrc(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = ZCRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
        function zipBlob(files, mime) {
            const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
            const d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
            files.forEach(f => {
                const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = zCrc(data);
                const h = new DataView(new ArrayBuffer(30));
                h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, dt, true); h.setUint16(12, dd, true);
                h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
                parts.push(new Uint8Array(h.buffer), name, data);
                const c = new DataView(new ArrayBuffer(46));
                c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true);
                c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
                cen.push(new Uint8Array(c.buffer), name);
                off += 30 + name.length + data.length;
            });
            const cs = cen.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
            e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
            return new Blob(parts.concat(cen, [new Uint8Array(e.buffer)]), { type: mime });
        }
        function xmlEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
        // ---------- WORD (.docx) — akt sahifasidan ----------
        function docxFromEl(root) {
            const TW = 9355, run = (t, b) => `<w:r><w:rPr>${b ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlEsc(t)}</w:t></w:r>`;
            const runsOf = (el, bold) => { let o = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' '); if (t) o += run(t, bold); } else if (n.nodeName === 'BR') o += '<w:r><w:br/></w:r>'; else if (n.nodeType === 1) o += runsOf(n, bold || /^(B|STRONG|TH)$/.test(n.nodeName)); }); return o; };
            const para = (inner, pPr) => `<w:p><w:pPr>${pPr || ''}</w:pPr>${inner}</w:p>`;
            const lines = el => { const out = [[]]; el.childNodes.forEach(n => { if (n.nodeName === 'BR') out.push([]); else out[out.length - 1].push(n); }); return out.map(ns => { const d = document.createElement('span'); ns.forEach(n => d.appendChild(n.cloneNode(true))); return d; }); };
            let body = '';
            const dxFlat = els => { const o = []; els.forEach(el => { const blk = Array.from(el.children || []).some(k => /^(P|TABLE|DIV|H[1-6])$/.test(k.tagName)), txtN = Array.from(el.childNodes || []).some(n => n.nodeType === 3 && n.textContent.trim()); if (el.tagName === 'DIV' && !/a-approve|a-head|a-title/.test(el.className) && blk && !txtN) o.push(...dxFlat(Array.from(el.children))); else o.push(el); }); return o; };
            const alOf = el => { const a = (el.style && el.style.textAlign) || el.getAttribute('align') || ''; return /center/.test(a) ? 'center' : /right/.test(a) ? 'right' : ''; };
            dxFlat([...root.children]).forEach(el => {
                const c = el.classList;
                if (c.contains('a-approve')) lines(el).forEach(l => { body += para(runsOf(l), '<w:ind w:left="4876"/><w:spacing w:after="0"/>'); });
                else if (c.contains('a-head')) { const s = el.querySelectorAll('span'); body += para(run(s[0] ? s[0].textContent : '') + '<w:r><w:tab/></w:r>' + run(s[1] ? s[1].textContent : ''), `<w:tabs><w:tab w:val="right" w:pos="${TW}"/></w:tabs><w:spacing w:before="240" w:after="240"/>`); }
                else if (c.contains('a-title')) lines(el).forEach(l => { body += para(runsOf(l, true), '<w:jc w:val="center"/><w:spacing w:after="0"/>'); });
                else if (/^H[1-6]$/.test(el.tagName)) lines(el).forEach(l => { body += para(runsOf(l, true), '<w:jc w:val="' + (alOf(el) || 'center') + '"/><w:spacing w:before="120" w:after="60"/>'); });
                else if ((el.tagName === 'P' || el.tagName === 'DIV') && alOf(el)) lines(el).forEach(l => { body += para(runsOf(l), '<w:jc w:val="' + alOf(el) + '"/><w:spacing w:after="0"/>'); });
                else if (el.tagName === 'TABLE' && !c.contains('a-sign')) {
                    const nb = c.contains('nb'), rows = [...el.rows], sp = td => Math.max(1, td.colSpan || 1), ncol = Math.max(...rows.map(r => [...r.cells].reduce((a, td) => a + sp(td), 0)));
                    const w = Array(ncol).fill(Math.floor(TW / ncol));
                    const b = nb ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' : '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders>';
                    body += `<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/>${b}<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
                        rows.map(r => `<w:tr>${[...r.cells].map(td => { const s2 = sp(td), al = alOf(td) || (td.tagName === 'TH' ? 'center' : ''); return `<w:tc><w:tcPr><w:tcW w:w="${w[0] * s2}" w:type="dxa"/>${s2 > 1 ? `<w:gridSpan w:val="${s2}"/>` : ''}</w:tcPr>${lines(td).map(l => para(runsOf(l, td.tagName === 'TH').replace(/<w:rPr>/g, '<w:rPr><w:sz w:val="22"/>'), (al ? '<w:jc w:val="' + al + '"/>' : '') + '<w:spacing w:after="0"/>')).join('')}</w:tc>`; }).join('')}</w:tr>`).join('') + '</w:tbl>' + para('', '<w:spacing w:after="0"/>');
                }
                else if (el.tagName === 'P') body += para(runsOf(el, c.contains('a-sec')), '<w:jc w:val="both"/>' + (c.contains('ni') || c.contains('a-sec') ? '' : '<w:ind w:firstLine="709"/>') + '<w:spacing w:after="60"/>');
                else if (el.tagName === 'TABLE') {
                    const sign = c.contains('a-sign'), rows = [...el.querySelectorAll('tr')];
                    const ncol = Math.max(...rows.map(r => r.children.length)), w = sign ? [4200, 2600, 2555] : Array(ncol).fill(Math.floor(TW / ncol));
                    const b = sign ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' : '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders>';
                    body += `<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/>${b}</w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
                        rows.map(r => `<w:tr>${[...r.children].map((td, i) => `<w:tc><w:tcPr><w:tcW w:w="${w[i] || w[0]}" w:type="dxa"/></w:tcPr>${para(runsOf(td, td.tagName === 'TH'), (sign && i === 2 ? '<w:jc w:val="right"/>' : '') + (sign ? '<w:spacing w:before="360" w:after="0"/>' : '<w:spacing w:after="0"/>') + (sign ? '' : '<w:rPr><w:sz w:val="22"/></w:rPr>'))}</w:tc>`).join('')}</w:tr>`).join('') + '</w:tbl>' + para('', '<w:spacing w:after="0"/>');
                } else body += para(runsOf(el), '<w:jc w:val="both"/>');
            });
            const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="851" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
            const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="28"/><w:szCs w:val="28"/><w:lang w:val="uz-Latn-UZ"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`;
            return zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
                { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'word/document.xml', data: doc }, { name: 'word/styles.xml', data: styles }
            ], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        }
        function docxFromHtml(html) { const box = document.createElement('div'); box.innerHTML = html; return docxFromEl(box); }
        // ---------- EXCEL (.xlsx) ----------
        function xlsxFromRows(rows, sheet) {
            const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
            const ncol = Math.max(1, ...rows.map(r => r.length)), wid = [];
            rows.forEach(r => r.forEach((v, i) => { wid[i] = Math.min(60, Math.max(wid[i] || 6, String(v == null ? '' : v).length + 2)); }));
            const data = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => { const ref = col(ci) + (ri + 1), st = ri === 0 ? ' s="1"' : ' s="2"'; if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${st}><v>${v}</v></c>`; return `<c r="${ref}"${st} t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`; }).join('') + '</row>').join('');
            const ws = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${Array.from({ length: ncol }, (_, i) => `<col min="${i + 1}" max="${i + 1}" width="${wid[i] || 10}" customWidth="1"/>`).join('')}</cols><sheetData>${data}</sheetData></worksheet>`;
            const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><name val="Times New Roman"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDEBF7"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
            return zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEsc(String(sheet || 'Hisobot').slice(0, 31).replace(/[\\/?*[\]:]/g, ' '))}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
                { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'xl/worksheets/sheet1.xml', data: ws }, { name: 'xl/styles.xml', data: styles }
            ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        function xlsxFromHtmlTable(html, sheet) {
            const box = document.createElement('div'); box.innerHTML = html;
            const t = [...box.querySelectorAll('table')].find(x => !x.classList.contains('a-sign'));
            const rows = t ? [...t.querySelectorAll('tr')].map(r => [...r.children].map(c => { const s = c.textContent.trim(); return /^\d+$/.test(s) && s.length < 9 ? +s : s; })) : [[box.textContent.trim()]];
            return xlsxFromRows(rows, sheet);
        }
        // ---------- JPG — PDF sahifa joylashuvidan chiziladi ----------
        async function jpgFromHtml(html) {
            try { await Promise.all([document.fonts.load('16px AGMKSerif'), document.fonts.load('bold 16px AGMKSerif')]); } catch (e) {}
            PDFK.f = null;
            const box = document.createElement('div'); box.className = 'nd-page pdf-src'; box.style.cssText = 'position:absolute; left:-99999px; top:0; width:794px; visibility:hidden;'; box.innerHTML = html;
            document.body.appendChild(box);
            try {
                const lay = pdfLayoutAkt(box), S = 2, out = [];
                for (const ops of lay.pages) {
                    const c = document.createElement('canvas'); c.width = Math.round(lay.P.W * S); c.height = Math.round(lay.P.H * S);
                    const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.strokeStyle = '#000'; g.textBaseline = 'alphabetic';
                    for (const o of ops) if (o.k === 'img' && !o.bm) { try { o.bm = await createImageBitmap(new Blob([o.data], { type: 'image/jpeg' })); } catch (e) {} }
                    ops.forEach(o => {
                        if (o.k === 'img') { if (o.bm) { if (o.mul) g.globalCompositeOperation = 'multiply'; g.drawImage(o.bm, o.x * S, o.y * S, o.w * S, o.h * S); g.globalCompositeOperation = 'source-over'; } return; }
                        if (o.k === 't') { g.font = (o.st === 'Bold' ? 'bold ' : '') + (o.fs * S) + "px AGMKSerif, 'Times New Roman', serif"; const want = pdfW(o.st, o.s, o.fs) * S, got = g.measureText(o.s).width; g.save(); g.translate(o.x * S, o.y * S); if (got > 0 && want > 0 && Math.abs(want / got - 1) > 0.01) g.scale(want / got, 1); g.fillText(o.s, 0, 0); g.restore(); }
                        else { g.lineWidth = o.w * S; g.beginPath(); g.moveTo(o.x1 * S, o.y1 * S); g.lineTo(o.x2 * S, o.y2 * S); g.stroke(); }
                    });
                    out.push(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92)));
                }
                return out;
            } finally { box.remove(); }
        }
        function pdfBlobFromHtml(html) {
            PDFK.f = null;
            const box = document.createElement('div'); box.className = 'nd-page pdf-src'; box.style.cssText = 'position:absolute; left:-99999px; top:0; width:794px; visibility:hidden;'; box.innerHTML = html;
            document.body.appendChild(box); try { return pdfBuild(pdfLayoutAkt(box)); } finally { box.remove(); }
        }
        // Hujjatni kerakli formatlarda tayyorlash: fmts = ['pdf','docx','jpg','xlsx']
        async function docMake(html, base, fmts) {
            const out = [], b = String(base || 'Hujjat').replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Hujjat';
            for (const f of fmts) {
                if (f === 'pdf') out.push({ name: b + '.pdf', mime: 'application/pdf', blob: pdfBlobFromHtml(html) });
                else if (f === 'docx') out.push({ name: b + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: docxFromHtml(html) });
                else if (f === 'xlsx') out.push({ name: b + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: xlsxFromHtmlTable(html, b) });
                else if (f === 'jpg') { const imgs = await jpgFromHtml(html); imgs.forEach((im, i) => out.push({ name: b + (imgs.length > 1 ? '_' + (i + 1) : '') + '.jpg', mime: 'image/jpeg', blob: im })); }
            }
            return out;
        }
        function docDownload(files) {
            files.forEach((f, i) => setTimeout(() => { const u = URL.createObjectURL(f.blob), a = document.createElement('a'); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 4000); }, i * 350));
        }
        function blobB64(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => { const s = String(r.result); res(s.slice(s.indexOf(',') + 1)); }; r.onerror = rej; r.readAsDataURL(b); }); }
        // ---------- Aloqa ma'lumotlari (pochta, Telegram) ----------
        var CT_KEY = 'agmk_contacts';
        function ctAll() { try { return JSON.parse(localStorage.getItem(CT_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function ctKey(p) { return (p.tabel ? 't' + cleanTabel(p.tabel) : 'n' + dbN(p.name || '')); }
        function ctGet(p) { const c = ctAll()[ctKey(p)] || {}; return { email: c.email || p.email || '', tg: c.tg || p.tg || '', phone: c.phone || p.phone || '' }; }
        function ctSet(p, v) { const a = ctAll(); a[ctKey(p)] = Object.assign({}, a[ctKey(p)] || {}, v); try { localStorage.setItem(CT_KEY, JSON.stringify(a)); } catch (e) {} }
        function pplList() {
            return dbPeople().map(r => { const it = r.item; return { name: it.name, role: it.lavozim || '', tabel: it.tabel || '', phone: it.phone || '', email: it.email || '', tg: it.telegram || it.tg || '', place: (typeof dbPlaceOf === 'function' ? dbPlaceOf(r) : ''), photo: it.photo || '' }; });
        }
        // Ismi, familiyasi, lavozimi yoki tabel bo'yicha qidirish
        function pplFind(q) {
            const n = dbN(q), toks = n.split(' ').filter(t => t.length >= 3).map(dbStem), all = pplList();
            const tab = (String(q).match(/\b\d{3,6}\b/) || [])[0];
            if (tab) { const r = all.filter(p => cleanTabel(p.tabel) === tab); if (r.length) return r; }
            const sc = all.map(p => { const w = dbN(p.name).replace(/\b[a-z]\b/g, ' ').split(/[\s.]+/).filter(x => x.length >= 3); const lv = dbN(p.role); let s = 0; toks.forEach(t => { if (w.some(x => dbLike(t, x))) s += 3; else if (t.length >= 4 && lv.split(' ').some(x => dbLike(t, x))) s += 1; }); return { p: p, s: s }; }).filter(x => x.s >= 3);
            const mx = Math.max(0, ...sc.map(x => x.s)); return sc.filter(x => x.s === mx).map(x => x.p);
        }
        // ---------- Yuborish ----------
        var SEND_LOG = 'agmk_send_log';
        function sendLog(e) { try { const l = JSON.parse(localStorage.getItem(SEND_LOG) || '[]'); l.unshift(Object.assign({ at: new Date().toISOString(), by: (currentUser && currentUser.name) || '' }, e)); localStorage.setItem(SEND_LOG, JSON.stringify(l.slice(0, 300))); } catch (e2) {} }
        async function docShare(files, o) {
            o = o || {}; const to = o.to || {}, c = to.name ? ctGet(to) : { email: to.email || '', tg: to.tg || '', phone: to.phone || '' };
            const subject = o.subject || (files[0] ? files[0].name.replace(/\.\w+$/, '').replace(/_/g, ' ') : 'Hujjat');
            const text = o.text || '';
            sendLog({ to: to.name || '', via: o.via, files: files.map(f => f.name), subject: subject });
            if (window.AgmkNative && AgmkNative.shareFiles) {
                const arr = []; for (const f of files) arr.push({ name: f.name, mime: f.mime, b64: await blobB64(f.blob) });
                AgmkNative.shareFiles(JSON.stringify({ files: arr, via: o.via || 'any', email: c.email, tg: c.tg, phone: c.phone, subject: subject, text: text, name: to.name || '' }));
                return true;
            }
            // Brauzer: tizim "Ulashish" oynasi yoki yuklab olish + havola
            try {
                const fl = files.map(f => new File([f.blob], f.name, { type: f.mime }));
                if (navigator.canShare && navigator.canShare({ files: fl })) { await navigator.share({ files: fl, title: subject, text: text }); return true; }
            } catch (e) { if (e && e.name === 'AbortError') return false; }
            if (files.length) docDownload(files);
            setTimeout(() => {
                if (o.via === 'email') location.href = 'mailto:' + encodeURIComponent(c.email || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text + (files.length ? '\n\n(Ilova: ' + files.map(f => f.name).join(', ') + ' — yuklab olingan fayllarni biriktiring)' : ''));
                else if (o.via === 'telegram') window.open(c.tg ? 'https://t.me/' + String(c.tg).replace(/^@/, '') : 'https://t.me/share/url?url=' + encodeURIComponent(' ') + '&text=' + encodeURIComponent(text), '_blank');
                else if (o.via === 'sms' && c.phone) location.href = 'sms:' + c.phone + '?body=' + encodeURIComponent(text);
            }, files.length * 350 + 300);
            showToast('📎 Fayllar yuklab olindi — ochilgan ilovada biriktiring');
            return true;
        }
        function mailText(to, docTitle, lang) {
            const nm = to && to.name ? to.name : '';
            if (lang === 'ru') return 'Уважаемый(ая) ' + nm + '!\n\nНаправляем Вам ' + docTitle + ' для ознакомления.\n\nС уважением,\n' + ((currentUser && currentUser.name) || '') + '\n' + ((currentUser && currentUser.role) || '') + '\nСТТБ АО «Алмалыкский ГМК»';
            return 'Hurmatli ' + nm + '!\n\nSizga ' + docTitle + ' tanishib chiqish uchun yuborilmoqda.\n\nHurmat bilan,\n' + ((currentUser && currentUser.name) || '') + '\n' + ((currentUser && currentUser.role) || '') + '\n"Olmaliq KMK" AJ STTB';
        }
        // ---------- Yuborish oynasi (qabul qiluvchi, format, kanal) ----------
        var SND = { html: '', title: '', lang: 'uz', to: null, fmts: ['pdf'], via: 'telegram' };
        function sendOpen(opt) {
            opt = opt || {};
            SND.html = opt.html || SND.html; SND.title = opt.title || SND.title || 'Hujjat'; SND.lang = opt.lang || 'uz'; SND.to = opt.to || null; SND.fmts = opt.fmts || ['pdf']; SND.via = opt.via || 'telegram'; SND.table = !!opt.table; SND.make = opt.make || null;
            let m = $id('sendModal');
            if (!m) { m = document.createElement('div'); m.id = 'sendModal'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="sendBox"></div>'; document.body.appendChild(m); }
            sendRender(); m.classList.remove('hidden');
        }
        function sendRender() {
            const to = SND.to, c = to ? ctGet(to) : {};
            const F = [['pdf', '📄 PDF'], ['docx', '📝 Word'], ['jpg', '🖼 Rasm (JPG)']].concat(SND.table ? [['xlsx', '📊 Excel']] : []);
            const V = [['telegram', '✈️ Telegram', c.tg ? '@' + String(c.tg).replace(/^@/, '') : ''], ['email', '📧 Pochta', c.email || ''], ['any', '📤 Boshqa ilova', ''], ['save', '💾 Faqat saqlash', '']];
            $id('sendBox').innerHTML = `<div class="pk-h"><b>📤 Hujjatni yuborish</b><span onclick="$id('sendModal').classList.add('hidden')">✕</span></div>
                <div class="snd-doc">📄 ${escapeHtml(SND.title)}</div>
                <div class="pp-lbl">KIMGA</div>
                ${to ? `<div class="snd-to"><div><b>${escapeHtml(to.name)}</b><small>${escapeHtml(to.role || '')}</small></div><button class="mini-btn" onclick="SND.to=null; sendRender()">✕</button></div>
                    <div class="snd-ct"><input id="sndEmail" placeholder="Elektron pochta" value="${escapeHtml(c.email || '')}"><input id="sndTg" placeholder="Telegram: @username yoki telefon" value="${escapeHtml(c.tg || '')}"></div>`
                    : `<input class="pk-q" id="sndQ" placeholder="Familiya, ism, lavozim yoki tabel..." oninput="sendSearch(this.value)"><div class="pk-list" id="sndList" style="max-height:180px"></div>`}
                <div class="pp-lbl">FORMAT</div><div class="snd-chips">${F.map(([k, t]) => `<i class="${SND.fmts.includes(k) ? 'on' : ''}" onclick="SND.fmts=SND.fmts.includes('${k}')?SND.fmts.filter(x=>x!=='${k}'):SND.fmts.concat('${k}'); if(!SND.fmts.length) SND.fmts=['pdf']; sendRender()">${t}</i>`).join('')}</div>
                <div class="pp-lbl">QAYERGA</div><div class="snd-chips">${V.map(([k, t, s]) => `<i class="${SND.via === k ? 'on' : ''}" onclick="SND.via='${k}'; sendRender()">${t}${s ? '<small>' + escapeHtml(s) + '</small>' : ''}</i>`).join('')}</div>
                <div class="pk-btns"><button onclick="$id('sendModal').classList.add('hidden')">Bekor</button><button class="pr" onclick="sendGo()">📤 Tayyorlash va yuborish</button></div>
                <div class="nd-tip">Fayllar tayyorlanadi va ${SND.via === 'email' ? 'pochta' : SND.via === 'telegram' ? 'Telegram' : 'tanlangan'} ilovasi hujjat biriktirilgan holda ochiladi — oxirgi «Yuborish»ni o'zingiz bosasiz. Nusxa «Yozishmalar»da saqlanadi.</div>`;
            if (!to) sendSearch('');
        }
        function sendSearch(q) {
            const l = q.trim() ? pplFind(q) : pplList().slice(0, 30);
            SND._l = l.slice(0, 40);
            const box = $id('sndList'); if (!box) return;
            box.innerHTML = SND._l.map((p, i) => `<div class="pk-o" onclick="SND.to=SND._l[${i}]; sendRender()"><span class="pk-t">${escapeHtml(p.name)}<small>${escapeHtml(p.role)}${p.tabel ? ' · tabel ' + escapeHtml(p.tabel) : ''}</small></span></div>`).join('') || '<div class="pk-o dis">Topilmadi</div>';
        }
        async function sendGo() {
            const to = SND.to;
            if (to) { const e = ($id('sndEmail') || {}).value, t = ($id('sndTg') || {}).value; if (e !== undefined) ctSet(to, { email: (e || '').trim(), tg: (t || '').trim() }); }
            if (SND.via === 'email' && to && !ctGet(to).email) { alert("Qabul qiluvchining elektron pochtasini kiriting."); return; }
            const sm = $id('sendModal'); if (sm) sm.classList.add('hidden');
            showToast('⏳ Hujjat tayyorlanmoqda...');
            const files = SND.make ? await SND.make(SND.fmts) : await docMake(SND.html, SND.title, SND.fmts);
            if (SND.via === 'save') { docDownload(files); sendLog({ to: '', via: 'save', files: files.map(f => f.name) }); return; }
            const text = mailText(to, SND.title, SND.lang);
            await docShare(files, { via: SND.via, to: to, subject: SND.title, text: text });
            if (to && typeof chatAddMsg === 'function') chatAddMsg(to, { me: true, t: (SND.lang === 'ru' ? '📎 ' : '📎 ') + SND.title, files: files, via: SND.via });
        }
        // ---------- Akt sahifasiga tugmalar ----------
        function ndCurTitle() { const p = $id('ndPage'); return p ? ((p.querySelector('.a-title') || {}).innerText || 'Akt').replace(/\s+/g, ' ').trim() + ' ' + fmtISO(todayISO()) : 'Akt'; }
        async function ndExport(fmt) { const p = $id('ndPage'); if (!p) return; const files = await docMake(p.innerHTML, ndCurTitle(), [fmt]); docDownload(files); showToast('✅ ' + files.map(f => f.name).join(', ')); }
        function ndSend(to, via, fmts) { const p = $id('ndPage'); if (!p) { alert('Avval aktni tuzing.'); return; } sendOpen({ html: p.innerHTML, title: ndCurTitle(), lang: typeof ndLang === 'function' ? ndLang() : 'uz', to: to, via: via, fmts: fmts }); }
        (function () {
            ndRenderAkt = agmkExtend('ndRenderAkt', '30-bosqich (2): Word / Excel / JPG hujjatlar va yuborish', ndRenderAkt, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const acts = document.querySelector('#ndBody .nd-acts:last-of-type');
                    if ($id('ndPage') && acts && !acts.querySelector('.nd-x')) {
                        const d = document.createElement('div'); d.className = 'nd-acts nd-x';
                        d.innerHTML = `<button class="action-btn" style="background:#1d4ed8" onclick="ndExport('docx')">📝 Word</button><button class="action-btn" style="background:#0f766e" onclick="ndExport('jpg')">🖼 Rasm (JPG)</button><button class="action-btn" style="background:linear-gradient(135deg,#0284c7,#22d3ee)" onclick="ndSend()">📤 Yuborish</button>`;
                        acts.after(d);
                    }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // Hisobot (PDF) — Excel ham
        (function () {
            pdfFromHtml = agmkExtend('pdfFromHtml', '30-bosqich (2): Word / Excel / JPG hujjatlar va yuborish · Hisobot (PDF) — Excel ham', pdfFromHtml, o => function (html, fname) { SND.lastHtml = html; SND.lastName = fname; return o.apply(this, arguments); });
        })();

