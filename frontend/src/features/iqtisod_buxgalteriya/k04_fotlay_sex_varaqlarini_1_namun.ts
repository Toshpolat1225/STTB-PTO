        // Iqtisodchi ЖДЦ-1 varag'ida Excel'da «Январь…Июль» ustunlarini (B:AB) o'chirib, «Август»dan boshlanadigan ko'rinish qilgan.
        // Ilova qolgan sex varaqlarida ham aynan shuni qiladi (Excel'dagi «ustunlarni o'chirish» kabi): kataklar chapga suriladi,
        // formulalardagi havolalar (shu varaq ichida ham, boshqa varaqlardan — masalan «упжт» — shu varaqqa ham) yangilanadi,
        // o'chirilgan ustunga havola #REF! bo'ladi (ЖДЦ-1 dagidek). Kengliklar, birlashtirilgan kataklar, uslublar saqlanadi.
        var FOT_REF_RX = /(?<![\w.$'!\]Ѐ-ӿ])((?:'(?:[^']|'')+'|[A-Za-z0-9_.Ѐ-ӿ]+)!)?(\$?)([A-Z]{1,3})(\$?)(\d+)(?::(\$?)([A-Z]{1,3})(\$?)(\d+))?(?![\w(Ѐ-ӿ!])/g;
        function fotSheetNm(pfx) { if (!pfx) return null; let s = pfx.slice(0, -1); if (s[0] === "'") s = s.slice(1, -1).replace(/''/g, "'"); return s; }
        function fotFmap(f, fn) { // satr ichidagi matnlarga ("...") tegmasdan havolalarni almashtirish
            let out = '', i = 0; const parts = String(f).split('"');
            return parts.map((p, k) => k % 2 ? p : p.replace(FOT_REF_RX, (m, pfx, d1, c1, d2, r1, d3, c2, d4, r2) => { const nm = fotSheetNm(pfx); if (nm && /[\[\]]/.test(nm)) return m; return fn({ m: m, pfx: pfx || '', nm: nm, d1: d1, c1: c1, d2: d2, r1: +r1, d3: d3, c2: c2, d4: d4, r2: r2 ? +r2 : null }); })).join('"');
        }
        function fotShiftCol(c, a, b) { const n = b - a + 1; return c < a ? c : c > b ? c - n : null; } // a..b — o'chiriladigan ustunlar (0 dan)
        function fotDelRef(x, a, b) {
            const c1 = fotColN(x.c1); if (x.c2 === undefined || x.c2 === null || x.r2 === null) { const n = fotShiftCol(c1, a, b); return n === null ? x.pfx + '#REF!' : x.pfx + x.d1 + fotCol(n) + x.d2 + x.r1; }
            const c2 = fotColN(x.c2); let n1 = c1 < a ? c1 : c1 > b ? c1 - (b - a + 1) : a, n2 = c2 > b ? c2 - (b - a + 1) : c2 < a ? c2 : a - 1;
            if (n1 > n2) return x.pfx + '#REF!'; return x.pfx + x.d1 + fotCol(n1) + x.d2 + x.r1 + ':' + x.d3 + fotCol(n2) + x.d4 + x.r2;
        }
        function fotSqShift(sq, a, b) { return String(sq || '').split(/\s+/).filter(Boolean).map(r => { const m = r.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/); if (!m) return r; const x = { pfx: '', d1: '', c1: m[1], d2: '', r1: +m[2], d3: '', c2: m[3] || null, d4: '', r2: m[4] ? +m[4] : null }; const o = fotDelRef(x, a, b); return /#REF!/.test(o) ? '' : o; }).filter(Boolean).join(' '); }
        function fotOffRef(f, dr, dc) { return fotFmap(f, x => { const mv = (d, c) => d ? c : fotCol(fotColN(c) + dc), rv = (d, r) => d ? r : r + dr; let s = x.pfx + x.d1 + mv(x.d1, x.c1) + x.d2 + rv(x.d2, x.r1); if (x.c2) s += ':' + x.d3 + mv(x.d3, x.c2) + x.d4 + rv(x.d4, x.r2); return s; }); }
        function fotUnshare(xml) { // umumiy (shared) formulalarni har katakka alohida yozish
            if (xml.indexOf('t="shared"') < 0) return xml; const M = {}, cellRx = /<c\b([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g;
            xml.replace(cellRx, (m, at, end, inner) => { if (!inner) return m; const f = inner.match(/<f\b([^>]*)>([\s\S]*?)<\/f>/); if (!f || !/t="shared"/.test(f[1])) return m; const si = (f[1].match(/\bsi="(\d+)"/) || [])[1], r = (at.match(/\br="([A-Z]+)(\d+)"/) || []); if (si !== undefined && f[2]) M[si] = { c: fotColN(r[1]), r: +r[2], f: fotXmlUn(f[2]) }; return m; });
            return xml.replace(cellRx, (m, at, end, inner) => { if (!inner || inner.indexOf('t="shared"') < 0) return m; const r = (at.match(/\br="([A-Z]+)(\d+)"/) || []);
                const ni = inner.replace(/<f\b([^>]*?)(?:\/>|>([\s\S]*?)<\/f>)/, (q, fa, txt) => { if (!/t="shared"/.test(fa)) return q; const si = (fa.match(/\bsi="(\d+)"/) || [])[1], ms = M[si]; if (!ms) return q; const f = txt ? fotXmlUn(txt) : fotOffRef(ms.f, +r[2] - ms.r, fotColN(r[1]) - ms.c); return '<f>' + fotXmlEsc(f) + '</f>'; });
                return '<c' + at + '>' + ni + '</c>'; });
        }
        function fotFixFormulas(xml, fn) { return xml.replace(/<f\b([^>]*)>([\s\S]*?)<\/f>/g, (m, at, t) => '<f' + at + '>' + fotXmlEsc(fn(fotXmlUn(t))) + '</f>'); }
        function fotDelColsOwn(xml, a, b) {
            xml = fotUnshare(xml); const n = b - a + 1;
            xml = xml.replace(/<dimension\b[^>]*\/>/, '').replace(/(<row\b[^>]*?)\sspans="[^"]*"/g, '$1');
            // kataklar
            xml = xml.replace(/<c\b([^>]*?)\br="([A-Z]+)(\d+)"([^>]*?)(\/>|>[\s\S]*?<\/c>)/g, (m, p1, col, row, p2, rest) => { const k = fotShiftCol(fotColN(col), a, b); if (k === null) return ''; return '<c' + p1 + 'r="' + fotCol(k) + row + '"' + p2 + rest; });
            xml = fotFixFormulas(xml, f => fotFmap(f, x => x.nm === null ? fotDelRef(x, a, b) : x.m));
            // ustun kengliklari (1 dan sanaladi)
            xml = xml.replace(/<cols>([\s\S]*?)<\/cols>/, (m, body) => { const out = []; body.replace(/<col\b([^>]*?)\/>/g, (q, at) => { const mn = +(at.match(/\bmin="(\d+)"/) || [])[1], mx = +(at.match(/\bmax="(\d+)"/) || [])[1]; const seg = []; for (let c = mn; c <= mx; c++) { const k = fotShiftCol(c - 1, a, b); if (k !== null) seg.push(k + 1); } if (!seg.length) return q; let s0 = seg[0], pv = seg[0]; const push = (x, y) => out.push('<col' + at.replace(/\bmin="\d+"/, 'min="' + x + '"').replace(/\bmax="\d+"/, 'max="' + y + '"') + '/>'); for (let i = 1; i < seg.length; i++) { if (seg[i] !== pv + 1) { push(s0, pv); s0 = seg[i]; } pv = seg[i]; } push(s0, pv); return q; }); out.sort((x, y) => +x.match(/min="(\d+)"/)[1] - +y.match(/min="(\d+)"/)[1]); return out.length ? '<cols>' + out.join('') + '</cols>' : ''; });
            // birlashtirilgan kataklar, tanlov, shartli formatlar, tekshiruvlar, havolalar
            xml = xml.replace(/<mergeCell\b[^>]*\bref="([^"]+)"[^>]*\/>/g, (m, r) => { const s = fotSqShift(r, a, b); if (!s || !/:/.test(s)) return ''; const [p, q] = s.split(':'); return p === q ? '' : m.replace(r, s); });
            xml = xml.replace(/<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/, (m, body) => { const k = (body.match(/<mergeCell\b/g) || []).length; return k ? '<mergeCells count="' + k + '">' + body + '</mergeCells>' : ''; });
            const fx = f => fotFmap(f, x => x.nm === null ? fotDelRef(x, a, b) : x.m);
            xml = xml.replace(/<conditionalFormatting\b([^>]*)>([\s\S]*?)<\/conditionalFormatting>/g, (m, at, body) => { const sq = (at.match(/\bsqref="([^"]+)"/) || [])[1], s2 = fotSqShift(sq, a, b); if (!s2) return ''; return '<conditionalFormatting' + at.replace(/\bsqref="[^"]+"/, 'sqref="' + s2 + '"') + '>' + body.replace(/<formula>([\s\S]*?)<\/formula>/g, (q, t) => '<formula>' + fotXmlEsc(fx(fotXmlUn(t))) + '</formula>') + '</conditionalFormatting>'; });
            xml = xml.replace(/<dataValidation\b([^>]*)>([\s\S]*?)<\/dataValidation>/g, (m, at, body) => { const sq = (at.match(/\bsqref="([^"]+)"/) || [])[1], s2 = fotSqShift(sq, a, b); return s2 ? '<dataValidation' + at.replace(/\bsqref="[^"]+"/, 'sqref="' + s2 + '"') + '>' + body + '</dataValidation>' : ''; });
            xml = xml.replace(/<dataValidations\b[^>]*>([\s\S]*?)<\/dataValidations>/, (m, body) => { const k = (body.match(/<dataValidation\b/g) || []).length; return k ? '<dataValidations count="' + k + '">' + body + '</dataValidations>' : ''; });
            xml = xml.replace(/<sheetView\b[\s\S]*?<\/sheetView>/g, m => m.replace(/\b(sqref|activeCell|topLeftCell)="([^"]+)"/g, (q, k, v) => { const s = fotSqShift(v, a, b); return k + '="' + (s || 'A1') + '"'; }));
            xml = xml.replace(/<hyperlink\b[^>]*\bref="([^"]+)"[^>]*\/>/g, (m, r) => { const s = fotSqShift(r, a, b); return s ? m.replace(r, s) : ''; });
            xml = xml.replace(/<colBreaks\b[\s\S]*?<\/colBreaks>/, '');
            return xml;
        }
        function fotLayoutFix(B) {
            const info = []; const hdr = sh => { const C = fotCells(B, B.rd(sh.path)); const a7 = C.A7 && typeof C.A7.v === 'string' ? C.A7.v : ''; if (!/^ФОТ\s*-\s*всего/i.test(a7)) return null; const row4 = Object.keys(C).filter(k => /^[A-Z]+4$/.test(k) && typeof C[k].v === 'string'); const mons = {}; row4.forEach(k => { const i = fotMonIdx(C[k].v); if (i >= 0 && !/квартал|год/i.test(C[k].v)) mons[i] = fotColN(k.replace(/\d+$/, '')); }); return mons; };
            const H = B.sheets.map(sh => ({ sh: sh, m: hdr(sh) })).filter(x => x.m && Object.keys(x.m).length);
            const ref = H.find(x => x.m[0] === undefined && x.m[7] === 1); if (!ref) return info; // namuna: «Август» B ustunida (ЖДЦ-1)
            const todo = H.filter(x => x.m[0] === 1 && x.m[7] > 1); if (!todo.length) return info;
            const all = B.sheets.map(s => s.path);
            todo.forEach(x => {
                const a = 1, b = x.m[7] - 1, nm = x.sh.name; // B .. «Август»dan oldingi ustun
                B.zip.file(x.sh.path, fotDelColsOwn(B.rd(x.sh.path), a, b));
                all.forEach(p => { if (p === x.sh.path) return; let xml = B.rd(p); if (xml.indexOf(nm) < 0 && xml.indexOf(fotXmlEsc(nm)) < 0) return; xml = fotUnshare(xml); xml = fotFixFormulas(xml, f => f.indexOf(nm) < 0 ? f : fotFmap(f, r => r.nm === nm ? fotDelRef(r, a, b) : r.m)); B.zip.file(p, xml); });
                let wbx = B.rd('xl/workbook.xml'); wbx = wbx.replace(/(<definedName\b[^>]*>)([\s\S]*?)(<\/definedName>)/g, (m, o, t, c) => o + fotXmlEsc(fotFmap(fotXmlUn(t), r => r.nm === nm ? fotDelRef(r, a, b) : r.m)) + c); B.zip.file('xl/workbook.xml', wbx);
                info.push(nm);
            });
            return info;
        }

