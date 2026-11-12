        // =====================================================================
        // v2.9 — Hujjat eksporti: «katakcha to'ri» (grid) → Excel (birlashtirilgan, chegarali kataklar), PDF, JPG
        //  • Excel endi faqat birinchi jadvalni emas, butun hujjatni (sarlavha, jadvallar, imzolar) chiqaradi
        //  • Ta'mir grafigi (namunadagi «31-17-18» shakli) shu grid orqali aniq chiziladi
        // =====================================================================
        function g47Safe(s) {
            s = String(s === null || s === undefined ? '' : s).replace(/[ʼʻ‘’`´]/g, "'").replace(/[“”„]/g, '"').replace(/[–—]/g, '-').replace(/[   ]/g, ' ');
            let F = null; try { F = pdfFonts().Regular.d.cmap; } catch (e) {}
            if (!F) return s; let o = ''; for (const ch of s) { const cp = ch.codePointAt(0); o += (cp < 32 || F[cp] !== undefined) ? ch : (ch === '«' || ch === '»' ? '"' : ch === '№' ? 'N' : '?'); } return o;
        }
        // ---------- Grid → XLSX (uslublar, birlashtirish, chegaralar, sahifa sozlamasi) ----------
        function xlsxFromGrid(G) {
            const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
            const fonts = [], fk = {}, xfs = [], xk = {};
            const font = (b, fs, it) => { const k = (b ? 1 : 0) + '|' + fs + '|' + (it ? 1 : 0); if (fk[k] === undefined) { fk[k] = fonts.length; fonts.push(`<font>${b ? '<b/>' : ''}${it ? '<i/>' : ''}<sz val="${fs}"/><name val="Times New Roman"/></font>`); } return fk[k]; };
            font(false, 11);
            const xf = c => { const f = font(!!c.b, c.fs || 11, !!c.i), bd = c.bd ? 1 : 0, al = c.al || '', va = c.va || 'center', wr = c.wrap ? 1 : 0, nf = c.nf || 0; const k = f + '|' + bd + '|' + al + '|' + va + '|' + wr + '|' + nf; if (xk[k] === undefined) { xk[k] = xfs.length; xfs.push(`<xf numFmtId="${nf}" fontId="${f}" fillId="0" borderId="${bd}" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"${nf ? ' applyNumberFormat="1"' : ''}><alignment${al ? ` horizontal="${al}"` : ''} vertical="${va}"${wr ? ' wrapText="1"' : ''}/></xf>`); } return xk[k]; };
            xf({});
            // birlashtirilgan hudud ichidagi kataklar ham chegaraga ega bo'lsin
            const R = G.rows.map(r => (r.cells || []).slice());
            (G.merges || []).forEach(m => { const top = (R[m.r] || [])[m.c]; if (!top || !top.bd) return; for (let i = m.r; i < m.r + (m.rs || 1); i++) for (let j = m.c; j < m.c + (m.cs || 1); j++) { R[i] = R[i] || []; if (!R[i][j]) R[i][j] = { v: '', bd: 1, fs: top.fs, b: top.b }; } });
            const data = R.map((cells, ri) => { const ht = G.rows[ri] && G.rows[ri].ht; let o = `<row r="${ri + 1}"${ht ? ` ht="${ht}" customHeight="1"` : ''}>`; cells.forEach((c, ci) => { if (!c) return; const ref = col(ci) + (ri + 1), s = xf(c); const v = c.v; if (v === '' || v === null || v === undefined) o += `<c r="${ref}" s="${s}"/>`; else if (typeof v === 'number' && isFinite(v)) o += `<c r="${ref}" s="${s}"><v>${v}</v></c>`; else o += `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(String(v))}</t></is></c>`; }); return o + '</row>'; }).join('');
            const merges = (G.merges || []).filter(m => (m.cs || 1) > 1 || (m.rs || 1) > 1);
            const ws = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="${G.grid === false ? 0 : 1}"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${G.cols.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${data}</sheetData>${merges.length ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${col(m.c)}${m.r + 1}:${col(m.c + (m.cs || 1) - 1)}${m.r + (m.rs || 1)}"/>`).join('')}</mergeCells>` : ''}<pageMargins left="0.6" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${G.land ? 'landscape' : 'portrait'}" fitToWidth="1" fitToHeight="0"/></worksheet>`;
            const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
            const sn = xmlEsc(String(G.sheet || 'Varaq').slice(0, 31).replace(/[\\/?*[\]:]/g, ' '));
            return zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sn}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
                { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'xl/worksheets/sheet1.xml', data: ws }, { name: 'xl/styles.xml', data: styles }
            ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        // ---------- HTML hujjat → grid (butun hujjat: sarlavhalar, matn, jadvallar, imzolar) ----------
        function gridFromHtml(html, sheet) {
            const box = document.createElement('div'); box.innerHTML = html;
            const flat = els => { const o = []; els.forEach(el => { const blk = Array.from(el.children || []).some(k => /^(P|TABLE|DIV|H[1-6])$/.test(k.tagName)), txtN = Array.from(el.childNodes || []).some(n => n.nodeType === 3 && n.textContent.trim()); if (el.tagName === 'DIV' && blk && !txtN) o.push(...flat(Array.from(el.children))); else o.push(el); }); return o; };
            const txt = el => { const c = el.cloneNode(true); c.querySelectorAll('br').forEach(b => b.replaceWith('\n')); return c.textContent.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim(); };
            const num = s => { const t = String(s).replace(/[\s  ]/g, ''); if (/^-?\d{1,15}$/.test(t) && !/^0\d/.test(t)) return +t; if (/^-?\d+,\d{1,4}$/.test(t)) return +t.replace(',', '.'); return s; };
            const els = flat(Array.from(box.children)), tabs = els.filter(e => e.tagName === 'TABLE');
            const span = c => Math.max(1, c.colSpan || 1), NC = Math.max(1, ...tabs.map(t => Math.max(0, ...Array.from(t.rows).map(r => Array.from(r.cells).reduce((a, c) => a + span(c), 0)))));
            const rows = [], merges = [], wid = Array(NC).fill(8), al = el => { const a = (el.style && el.style.textAlign) || el.getAttribute('align') || ''; return /center/.test(a) ? 'center' : /right/.test(a) ? 'right' : ''; };
            const lines = (s, w) => Math.max(1, String(s).split('\n').reduce((a, l) => a + Math.max(1, Math.ceil(l.length / Math.max(8, w))), 0));
            els.forEach(el => {
                const tag = el.tagName;
                if (tag === 'TABLE') {
                    const nb = el.classList.contains('nb') || el.classList.contains('a-sign'), tn = Math.max(...Array.from(el.rows).map(r => Array.from(r.cells).reduce((a, c) => a + span(c), 0)));
                    Array.from(el.rows).forEach(tr => {
                        const cells = [], ri = rows.length; let ci = 0, maxL = 1; const cs = Array.from(tr.cells);
                        cs.forEach((c, k) => { let s = span(c); if (k === cs.length - 1 && ci + s < NC && tn < NC) s = NC - ci; const t = txt(c), th = c.tagName === 'TH' || !!c.querySelector('b,strong'); const nv = num(t); cells[ci] = { v: nv, bd: nb ? 0 : 1, b: th, al: al(c) || (th ? 'center' : ''), wrap: 1, va: 'top', nf: typeof nv === 'number' && /,\d{2}$/.test(String(t).replace(/[\s\u00a0\u202f]/g, '')) ? 4 : 0 }; /* «41 800 000,00» → son + «# ##0,00» formati */ if (s > 1) merges.push({ r: ri, c: ci, cs: s }); if (s === 1) wid[ci] = Math.min(48, Math.max(wid[ci], ...String(t).split('\n').map(l => l.length + 2))); const cw = wid.slice(ci, ci + s).reduce((a, b) => a + b, 0); maxL = Math.max(maxL, lines(t, s === 1 ? 48 : cw)); ci += s; });
                        rows.push({ cells: cells, ht: Math.min(400, maxL * 15) });
                    });
                    rows.push({ cells: [] });
                } else {
                    const t = txt(el); if (!t) return; const h = /^H[1-6]$/.test(tag), b = h || el.classList.contains('a-title') || (el.children.length === 1 && /^(B|STRONG)$/.test(el.children[0].tagName) && el.textContent.trim() === el.children[0].textContent.trim());
                    rows.push({ cells: [{ v: t, b: b, al: al(el) || (h || el.classList.contains('a-title') ? 'center' : el.classList.contains('a-approve') ? 'right' : ''), wrap: 1, va: 'top', fs: h ? 12 : 11 }], ht: 0, par: 1 });
                    if (NC > 1) merges.push({ r: rows.length - 1, c: 0, cs: NC });
                }
            });
            const tot = wid.reduce((a, b) => a + b, 0); rows.forEach(r => { if (r.par) r.ht = Math.min(400, lines(r.cells[0].v, tot) * 15); });
            return { cols: wid, rows: rows, merges: merges, sheet: sheet || 'Hujjat' };
        }
        xlsxFromHtmlTable = function (html, sheet) { return xlsxFromGrid(gridFromHtml(html, sheet)); };
        // ---------- Grid → PDF/JPG sahifa joylashuvi ----------
        function gridLayout(G, o) {
            o = o || {}; const mm = 72 / 25.4, P = { W: 595.28, H: 841.89, L: (o.L || 18) * mm, R: (o.R || 10) * mm, T: (o.T || 12) * mm, B: (o.B || 12) * mm }, cw = P.W - P.L - P.R;
            const tot = G.cols.reduce((a, b) => a + b, 0), X = [P.L]; G.cols.forEach((w, i) => X.push(X[i] + w / tot * cw));
            const M = {}; (G.merges || []).forEach(m => { M[m.r + ':' + m.c] = m; for (let i = m.r; i < m.r + (m.rs || 1); i++) for (let j = m.c; j < m.c + (m.cs || 1); j++) if (i !== m.r || j !== m.c) M[i + ':' + j] = 'x'; });
            const pages = [[]]; let y = P.T; const cur = () => pages[pages.length - 1];
            const rh = r => (r.ht || 15) * (o.k || 1.12);
            G.rows.forEach((r, ri) => {
                const h = rh(r); if (y + h > P.H - P.B && cur().length) { pages.push([]); y = P.T; }
                (r.cells || []).forEach((c, ci) => {
                    if (!c || M[ri + ':' + ci] === 'x') return; const m = M[ri + ':' + ci], cs = m ? (m.cs || 1) : (c.cs || 1), rs = m ? (m.rs || 1) : 1;
                    let x0 = X[ci], x1 = X[Math.min(G.cols.length, ci + cs)];
                    if (r.sig) { const k = (r.cells || []).slice(0, ci).filter(Boolean).length, n = (r.cells || []).filter(Boolean).length || 1; x0 = P.L + k * cw / n; x1 = x0 + cw / n; }
                    const hh = rs > 1 ? G.rows.slice(ri, ri + rs).reduce((a, q) => a + rh(q), 0) : h;
                    if (c.bd) { const w = 0.6; cur().push({ k: 'l', x1: x0, y1: y, x2: x1, y2: y, w: w }, { k: 'l', x1: x0, y1: y + hh, x2: x1, y2: y + hh, w: w }, { k: 'l', x1: x0, y1: y, x2: x0, y2: y + hh, w: w }, { k: 'l', x1: x1, y1: y, x2: x1, y2: y + hh, w: w }); }
                    const s0 = g47Safe(c.v === null || c.v === undefined ? '' : c.v); if (!s0) return;
                    const st = c.b ? 'Bold' : 'Regular', pad = 3, avail = (c.ov ? (P.L + cw - x0) : (x1 - x0)) - pad * 2;
                    const L = s0.split('\n'); let fs = (c.fs || 11) * (o.fk || 1); const widest = () => Math.max(...L.map(l => pdfW(st, l, fs)));
                    while (widest() > avail && fs > 6.5) fs -= 0.25;
                    const lh = fs * 1.18, top = y + (hh - lh * L.length) / 2;
                    L.forEach((l, k) => { const tw = pdfW(st, l, fs), x = c.al === 'center' ? x0 + ((x1 - x0) - tw) / 2 : c.al === 'right' ? x1 - pad - tw : x0 + pad; cur().push({ k: 't', x: x, y: top + lh * k + fs * 0.9, s: l, st: st, fs: fs }); });
                });
                y += h;
            });
            return { P: P, pages: pages };
        }
        function gridPdf(G, o) { PDFK.f = null; return pdfBuild(gridLayout(G, o)); }
        async function gridJpg(G, o) {
            try { await Promise.all([document.fonts.load('16px AGMKSerif'), document.fonts.load('bold 16px AGMKSerif')]); } catch (e) {}
            const lay = gridLayout(G, o), S = 2.2, out = [];
            for (const ops of lay.pages) {
                const c = document.createElement('canvas'); c.width = Math.round(lay.P.W * S); c.height = Math.round(lay.P.H * S);
                const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.strokeStyle = '#000'; g.textBaseline = 'alphabetic';
                ops.forEach(p => { if (p.k === 'l') { g.lineWidth = Math.max(1, p.w * S); g.beginPath(); g.moveTo(p.x1 * S, p.y1 * S); g.lineTo(p.x2 * S, p.y2 * S); g.stroke(); } else if (p.k === 't') { g.font = (p.st === 'Bold' ? 'bold ' : '') + (p.fs * S) + "px AGMKSerif, 'Times New Roman', serif"; g.fillText(p.s, p.x * S, p.y * S); } });
                out.push(await new Promise(res => c.toBlob(b => res(b), 'image/jpeg', 0.93)));
            }
            return out;
        }

