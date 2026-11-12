
        // =====================================================================
        // v3.0 — 📄 WORD SHABLON MEXANIZMI (DXT)
        //  Korxonaning o'z Word (.docx) blankasi shablon bo'ladi: maydonlar {{kalit}} bilan belgilanadi.
        //  • Word natija — asl blanka (shakl, jadval, chiziqlar, shriftlar) aynan saqlanadi, faqat maydonlar to'ldiriladi
        //  • PDF / JPG / ko'rinish — shu .docx ning o'zidan chiziladi (jadval kengliklari, birlashgan kataklar,
        //    tabulyatsiya to'xtashlari, tagiga chizish, chegara chiziqlari, sahifa hoshiyalari)
        //  • Hech narsa o'ylab topilmaydi: bo'sh maydon bo'sh (chiziq) bo'lib qoladi
        // =====================================================================
        var DXT = { tpl: {}, cache: {} };
        var DXW = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
        function dxB64u8(b) { const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
        async function dxUnzip(u8) {
            const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength), z = await hsZipFiles(buf), out = {};
            for (const k of Object.keys(z)) out[k] = await z[k]();
            return out;
        }
        function dxTxt(u8) { return u8 ? new TextDecoder().decode(u8) : ''; }
        // ---------- Maydonlarni to'ldirish (XML ichida) ----------
        function dxFillXml(xml, data) {
            const val = k => { let v = data[k]; if (v === undefined || v === null) v = ''; return String(v); };
            const blank = k => ' '.repeat(Math.max(4, +(data['_w_' + k] || 12)));
            const bold = rpr => { if (/<w:b\/>|<w:b w:val="(1|true)"\/>/.test(rpr)) return rpr; if (!rpr) return '<w:rPr><w:b/><w:bCs/></w:rPr>'; const m = rpr.match(/^<w:rPr>(<w:rStyle[^>]*\/>)?(<w:rFonts[^>]*\/>)?/); return m[0] + '<w:b/><w:bCs/>' + rpr.slice(m[0].length).replace(/<w:b w:val="(0|false)"\/>/, ''); };
            // {{kalit}} turgan run: qiymat bir necha run'ga bo'linadi (**qalin**, yangi qator)
            return xml.replace(/<w:r\b[^>]*>(?:(?!<\/w:r>)[\s\S])*?\{\{[\w.]+\}\}(?:(?!<\/w:r>)[\s\S])*?<\/w:r>/g, run => {
                const open = run.match(/^<w:r\b[^>]*>/)[0], rpr = (run.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [''])[0];
                const T = [...run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]; if (T.length !== 1 || run.slice(open.length).replace(rpr, '').replace(T[0][0], '') !== '</w:r>') return run.replace(/\{\{([\w.]+)\}\}/g, (m, k) => xmlEsc(val(k).replace(/\*\*/g, '').replace(/\n/g, ' ')) || blank(k));
                const txt = T[0][1], out = []; const R = (t, b) => { if (t) out.push(open + (b ? bold(rpr) : rpr) + '<w:t xml:space="preserve">' + t + '</w:t></w:r>'); };
                let last = 0; txt.replace(/\{\{([\w.]+)\}\}/g, (m, k, at) => {
                    R(txt.slice(last, at), false); last = at + m.length;
                    const v = val(k); if (!v.trim()) { R(blank(k), false); return m; }
                    v.split('\n').forEach((line, li) => { if (li) out.push(open + rpr + '<w:br/></w:r>'); line.split(/\*\*(.+?)\*\*/).forEach((part, pi) => R(xmlEsc(part), pi % 2 === 1)); });
                    return m;
                });
                R(txt.slice(last), false);
                return out.join('');
            });
        }
        // ---------- XML o'qish yordamchilari ----------
        function dxKids(el, name) { const o = []; if (!el) return o; for (let c = el.firstElementChild; c; c = c.nextElementSibling) if (!name || c.localName === name) o.push(c); return o; }
        function dxKid(el, name) { if (!el) return null; for (let c = el.firstElementChild; c; c = c.nextElementSibling) if (c.localName === name) return c; return null; }
        function dxA(el, a) { return el ? (el.getAttributeNS(DXW, a) || el.getAttribute('w:' + a)) : null; }
        function dxOn(el) { if (!el) return undefined; const v = dxA(el, 'val'); return !(v === '0' || v === 'false' || v === 'off' || v === 'none'); }
        function dxNum(v, d) { const n = parseFloat(v); return isFinite(n) ? n : d; }
        // ---------- Uslublar ----------
        function dxRPr(el, base) {
            const r = Object.assign({}, base || {}); if (!el) return r;
            for (let c = el.firstElementChild; c; c = c.nextElementSibling) {
                const n = c.localName;
                if (n === 'b') r.b = dxOn(c); else if (n === 'i') r.i = dxOn(c); else if (n === 'caps') r.caps = dxOn(c);
                else if (n === 'u') { const v = dxA(c, 'val'); r.u = !!v && v !== 'none'; }
                else if (n === 'strike') r.strike = dxOn(c);
                else if (n === 'sz') r.sz = dxNum(dxA(c, 'val'), 22) / 2;
                else if (n === 'vertAlign') r.va = dxA(c, 'val');
                else if (n === 'vanish') r.hide = dxOn(c);
                else if (n === 'color') r.color = dxA(c, 'val');
            }
            return r;
        }
        function dxPPr(el, base) {
            const p = Object.assign({}, base || {}); if (!el) return p;
            for (let c = el.firstElementChild; c; c = c.nextElementSibling) {
                const n = c.localName;
                if (n === 'jc') p.jc = dxA(c, 'val');
                else if (n === 'ind') { const L = dxA(c, 'left') || dxA(c, 'start'), R = dxA(c, 'right') || dxA(c, 'end'), F = dxA(c, 'firstLine'), H = dxA(c, 'hanging'); if (L !== null) p.indL = +L / 20; if (R !== null) p.indR = +R / 20; if (F !== null) p.indF = +F / 20; if (H !== null) p.indF = -(+H) / 20; }
                else if (n === 'spacing') { const b = dxA(c, 'before'), a = dxA(c, 'after'), l = dxA(c, 'line'), lr = dxA(c, 'lineRule'); if (b !== null) p.spB = +b / 20; if (a !== null) p.spA = +a / 20; if (l !== null) { p.line = +l; p.lineRule = lr || 'auto'; } if (dxA(c, 'beforeAutospacing') === '1') p.spB = 14; if (dxA(c, 'afterAutospacing') === '1') p.spA = 14; }
                else if (n === 'tabs') { const T = (p.tabs || []).slice(); dxKids(c, 'tab').forEach(t => { const pos = +dxA(t, 'pos') / 20, v = dxA(t, 'val'); const i = T.findIndex(x => Math.abs(x.pos - pos) < 0.5); if (v === 'clear') { if (i >= 0) T.splice(i, 1); return; } const o = { pos: pos, val: v, leader: dxA(t, 'leader') }; if (i >= 0) T[i] = o; else T.push(o); }); p.tabs = T.sort((a, b) => a.pos - b.pos); }
                else if (n === 'pageBreakBefore') p.pbb = dxOn(c);
                else if (n === 'numPr') { p.num = { id: dxA(dxKid(c, 'numId'), 'val'), lvl: +(dxA(dxKid(c, 'ilvl'), 'val') || 0) }; }
                else if (n === 'keepNext') p.keepNext = dxOn(c);
                else if (n === 'pBdr') { const b = dxKid(c, 'bottom'); if (b && dxA(b, 'val') !== 'none' && dxA(b, 'val') !== 'nil') p.bdrB = dxNum(dxA(b, 'sz'), 4) / 8; }
            }
            return p;
        }
        function dxBorders(el) { const o = {}; if (!el) return o; ['top', 'left', 'bottom', 'right', 'insideH', 'insideV', 'start', 'end'].forEach(k => { const b = dxKid(el, k); if (!b) return; const v = dxA(b, 'val'); o[k === 'start' ? 'left' : k === 'end' ? 'right' : k] = (v === 'nil' || v === 'none') ? 0 : Math.max(0.25, dxNum(dxA(b, 'sz'), 4) / 8); }); return o; }
        function dxStyles(xml) {
            const S = { st: {}, defP: {}, defR: { sz: 11 }, defPara: null, defTbl: null };
            if (!xml) return S;
            const doc = new DOMParser().parseFromString(xml, 'application/xml');
            const dd = doc.getElementsByTagNameNS(DXW, 'docDefaults')[0];
            if (dd) { const rp = dd.getElementsByTagNameNS(DXW, 'rPr')[0], pp = dd.getElementsByTagNameNS(DXW, 'pPr')[0]; S.defR = dxRPr(rp, { sz: 10 }); S.defP = dxPPr(pp, {}); }
            dxKids(doc.documentElement, 'style').forEach(s => {
                const id = dxA(s, 'styleId'), t = dxA(s, 'type');
                const o = { t: t, base: dxA(dxKid(s, 'basedOn'), 'val'), pPr: dxKid(s, 'pPr'), rPr: dxKid(s, 'rPr'), tblPr: dxKid(s, 'tblPr'), tcPr: dxKid(s, 'tcPr') };
                S.st[id] = o; if (dxA(s, 'default') === '1') { if (t === 'paragraph') S.defPara = id; if (t === 'table') S.defTbl = id; }
            });
            return S;
        }
        function dxStyleChain(S, id) { const L = []; let g = 0; while (id && S.st[id] && g++ < 20) { L.unshift(S.st[id]); id = S.st[id].base; } return L; }
        function dxParaStyle(S, id) {
            const k = 'P:' + id; if (S[k]) return S[k];
            let p = Object.assign({}, S.defP), r = Object.assign({}, S.defR);
            dxStyleChain(S, id || S.defPara).forEach(s => { p = dxPPr(s.pPr, p); r = dxRPr(s.rPr, r); });
            return (S[k] = { p: p, r: r });
        }
        function dxRunStyle(S, id, base) { let r = base; dxStyleChain(S, id).forEach(s => { r = dxRPr(s.rPr, r); }); return r; }
        function dxTblStyle(S, id) {
            const k = 'T:' + id; if (S[k]) return S[k];
            let bd = {}, mar = null, p = null, r = null;
            dxStyleChain(S, id || S.defTbl).forEach(s => { if (s.tblPr) { Object.assign(bd, dxBorders(dxKid(s.tblPr, 'tblBorders'))); const m = dxKid(s.tblPr, 'tblCellMar'); if (m) mar = dxCellMar(m, mar); } if (s.pPr) p = dxPPr(s.pPr, p || {}); if (s.rPr) r = dxRPr(s.rPr, r || {}); });
            return (S[k] = { bd: bd, mar: mar, p: p, r: r });
        }
        function dxCellMar(el, base) { const o = Object.assign({ l: 5.4, r: 5.4, t: 0, b: 0 }, base || {}); if (!el) return o; [['left', 'l'], ['start', 'l'], ['right', 'r'], ['end', 'r'], ['top', 't'], ['bottom', 'b']].forEach(([a, k]) => { const e = dxKid(el, a); if (e) o[k] = dxNum(dxA(e, 'w'), 0) / 20; }); return o; }
        // ---------- Raqamlash (ro'yxat belgilari) ----------
        function dxNumbering(xml) {
            const N = { abs: {}, num: {}, cnt: {} }; if (!xml) return N;
            const doc = new DOMParser().parseFromString(xml, 'application/xml');
            dxKids(doc.documentElement, 'abstractNum').forEach(a => { const L = {}; dxKids(a, 'lvl').forEach(l => { L[+dxA(l, 'ilvl')] = { fmt: dxA(dxKid(l, 'numFmt'), 'val'), txt: dxA(dxKid(l, 'lvlText'), 'val') || '', start: +(dxA(dxKid(l, 'start'), 'val') || 1), pPr: dxPPr(dxKid(l, 'pPr'), {}), sfx: dxA(dxKid(l, 'suff'), 'val') || 'tab' }; }); N.abs[dxA(a, 'abstractNumId')] = L; });
            dxKids(doc.documentElement, 'num').forEach(n => { N.num[dxA(n, 'numId')] = dxA(dxKid(n, 'abstractNumId'), 'val'); });
            return N;
        }
        function dxNumLabel(N, num) {
            const a = N.abs[N.num[num.id]]; if (!a) return null; const L = a[num.lvl]; if (!L) return null;
            const key = num.id; const c = N.cnt[key] = N.cnt[key] || []; c[num.lvl] = (c[num.lvl] === undefined ? L.start - 1 : c[num.lvl]) + 1; c.length = num.lvl + 1;
            if (L.fmt === 'bullet') { const ch = L.txt || '•'; const cp = ch.codePointAt(0); return { t: cp >= 0xF000 || cp === 0xB7 ? (cp === 0xF02D || ch === '-' ? '-' : '•') : ch, p: L.pPr, sfx: L.sfx }; }
            let t = L.txt; for (let i = 0; i <= num.lvl; i++) { const v = c[i] === undefined ? (a[i] ? a[i].start : 1) : c[i]; const f = a[i] ? a[i].fmt : 'decimal'; const s = f === 'lowerLetter' ? String.fromCharCode(96 + v) : f === 'upperLetter' ? String.fromCharCode(64 + v) : f === 'lowerRoman' ? dxRoman(v).toLowerCase() : f === 'upperRoman' ? dxRoman(v) : String(v); t = t.replace('%' + (i + 1), s); }
            return { t: t, p: L.pPr, sfx: L.sfx };
        }
        function dxRoman(n) { const R = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let o = ''; R.forEach(([v, s]) => { while (n >= v) { o += s; n -= v; } }); return o; }
        // ---------- Hujjat modeli ----------
        function dxModel(files) {
            const S = dxStyles(dxTxt(files['word/styles.xml'])), N = dxNumbering(dxTxt(files['word/numbering.xml']));
            const set = dxTxt(files['word/settings.xml']); const dts = +((set.match(/defaultTabStop w:val="(\d+)"/) || [])[1] || 708) / 20;
            const doc = new DOMParser().parseFromString(dxTxt(files['word/document.xml']), 'application/xml');
            if (doc.getElementsByTagName('parsererror').length) throw new Error('Shablon XML buzilgan');
            const body = doc.getElementsByTagNameNS(DXW, 'body')[0];
            const sp = body.getElementsByTagNameNS(DXW, 'sectPr'), sect = sp[sp.length - 1];
            const pg = { W: 595.28, H: 841.89, T: 56.7, B: 56.7, L: 85, R: 42.5 };
            if (sect) { const z = dxKid(sect, 'pgSz'), m = dxKid(sect, 'pgMar'); if (z) { pg.W = +dxA(z, 'w') / 20 || pg.W; pg.H = +dxA(z, 'h') / 20 || pg.H; if (dxA(z, 'orient') === 'landscape' && pg.W < pg.H) { const t = pg.W; pg.W = pg.H; pg.H = t; } } if (m) { pg.T = Math.abs(+dxA(m, 'top')) / 20; pg.B = Math.abs(+dxA(m, 'bottom')) / 20; pg.L = +dxA(m, 'left') / 20; pg.R = +dxA(m, 'right') / 20; } }
            const M = { S: S, N: N, dts: dts, pg: pg, blocks: dxBlocks(body, S, N, null) };
            return M;
        }
        function dxBlocks(parent, S, N, tctx) {
            const out = [];
            dxKids(parent).forEach(el => {
                const n = el.localName;
                if (n === 'p') out.push(dxPara(el, S, N, tctx));
                else if (n === 'tbl') out.push(dxTable(el, S, N));
                else if (n === 'sdt') { const c = dxKid(el, 'sdtContent'); if (c) dxBlocks(c, S, N, tctx).forEach(b => out.push(b)); }
            });
            return out;
        }
        function dxPara(el, S, N, tctx) {
            const pPrEl = dxKid(el, 'pPr'), sid = dxA(dxKid(pPrEl, 'pStyle'), 'val'), st = dxParaStyle(S, sid);
            let p = Object.assign({}, st.p); if (tctx && tctx.p) p = Object.assign(p, tctx.p); p = dxPPr(pPrEl, p);
            let rb = Object.assign({}, st.r); if (tctx && tctx.r) rb = Object.assign(rb, tctx.r);
            const markR = dxRPr(dxKid(pPrEl, 'rPr'), rb);
            const runs = [];
            let pageBreak = false, sectBreak = !!(pPrEl && dxKid(pPrEl, 'sectPr'));
            const addRun = (r, rp) => {
                for (let c = r.firstElementChild; c; c = c.nextElementSibling) {
                    const n = c.localName;
                    if (n === 't') runs.push({ t: c.textContent, r: rp });
                    else if (n === 'tab') runs.push({ tab: true, r: rp });
                    else if (n === 'br') { if (dxA(c, 'type') === 'page') runs.push({ pb: true }); else runs.push({ br: true, r: rp }); }
                    else if (n === 'cr') runs.push({ br: true, r: rp });
                    else if (n === 'noBreakHyphen') runs.push({ t: '-', r: rp });
                    else if (n === 'softHyphen') { }
                    else if (n === 'sym') { const ch = dxA(c, 'char'); runs.push({ t: ch && /^F0/i.test(ch) ? '•' : '', r: rp }); }
                    else if (n === 'drawing' || n === 'pict') runs.push({ obj: true, r: rp });
                    else if (n === 'AlternateContent') { }
                }
            };
            const walk = node => {
                for (let c = node.firstElementChild; c; c = c.nextElementSibling) {
                    const n = c.localName;
                    if (n === 'r') { const rPrEl = dxKid(c, 'rPr'), rs = dxA(dxKid(rPrEl, 'rStyle'), 'val'); let rp = rs ? dxRunStyle(S, rs, rb) : rb; rp = dxRPr(rPrEl, rp); if (!rp.hide) addRun(c, rp); }
                    else if (n === 'hyperlink' || n === 'smartTag' || n === 'ins' || n === 'fldSimple' || n === 'customXml') walk(c);
                    else if (n === 'sdt') { const x = dxKid(c, 'sdtContent'); if (x) walk(x); }
                }
            };
            walk(el);
            let label = null; if (p.num && p.num.id && p.num.id !== '0') { const L = dxNumLabel(N, p.num); if (L) { label = L; p = dxPPr(pPrEl, Object.assign({}, p, L.p)); } }
            return { k: 'p', p: p, runs: runs, mark: markR, label: label, sect: sectBreak };
        }
        function dxTable(el, S, N) {
            const pr = dxKid(el, 'tblPr'), ts = dxTblStyle(S, dxA(dxKid(pr, 'tblStyle'), 'val'));
            const bd = Object.assign({}, ts.bd, dxBorders(dxKid(pr, 'tblBorders')));
            const mar = dxCellMar(dxKid(pr, 'tblCellMar'), ts.mar);
            const ind = dxNum(dxA(dxKid(pr, 'tblInd'), 'w'), 0) / 20, jc = dxA(dxKid(pr, 'jc'), 'val');
            const grid = dxKids(dxKid(el, 'tblGrid'), 'gridCol').map(g => dxNum(dxA(g, 'w'), 0) / 20);
            const rows = [];
            dxKids(el, 'tr').forEach(tr => {
                const trPr = dxKid(tr, 'trPr'), hEl = dxKid(trPr, 'trHeight'), before = dxNum(dxA(dxKid(trPr, 'gridBefore'), 'val'), 0);
                const row = { h: hEl ? dxNum(dxA(hEl, 'val'), 0) / 20 : 0, hr: hEl ? (dxA(hEl, 'hRule') || 'atLeast') : 'auto', cells: [], before: before, hdr: !!dxKid(trPr, 'tblHeader') };
                let col = before;
                dxKids(tr, 'tc').forEach(tc => {
                    const tp = dxKid(tc, 'tcPr'), span = dxNum(dxA(dxKid(tp, 'gridSpan'), 'val'), 1), vm = dxKid(tp, 'vMerge');
                    const cell = { col: col, span: span, vm: vm ? (dxA(vm, 'val') === 'restart' ? 'r' : 'c') : null, bd: dxBorders(dxKid(tp, 'tcBorders')), va: dxA(dxKid(tp, 'vAlign'), 'val') || 'top', mar: dxKid(tp, 'tcMar') ? dxCellMar(dxKid(tp, 'tcMar'), mar) : mar, w: dxNum(dxA(dxKid(tp, 'tcW'), 'w'), 0) / 20, wt: dxA(dxKid(tp, 'tcW'), 'type'),
                        blocks: dxBlocks(tc, S, N, { p: ts.p, r: ts.r }) };
                    row.cells.push(cell); col += span;
                });
                rows.push(row);
            });
            // grid yo'q bo'lsa — kataklar kengligidan
            if (!grid.length || grid.every(x => !x)) { const r0 = rows[0]; if (r0) r0.cells.forEach(c => { for (let i = 0; i < c.span; i++) grid[c.col + i] = (c.w || 60) / c.span; }); }
            return { k: 't', grid: grid, rows: rows, bd: bd, mar: mar, ind: ind, jc: jc };
        }
        // ---------- Joylashtirish (sahifa operatsiyalari: matn, chiziq) ----------
        function dxFontSt(r) { return r && r.b ? 'Bold' : 'Regular'; }
        function dxCh(s, r) { s = String(s).replace(/[\u00ad\u200b-\u200d\ufeff]/g, '').replace(/\u2011/g, '-').replace(/\t/g, ' '); if (r && r.caps) s = s.toUpperCase(); return s; }
        function dxLh(p, fs) { const base = fs * 1.15; if (!p.line) return base; if (p.lineRule === 'exact') return p.line / 20; if (p.lineRule === 'atLeast') return Math.max(base, p.line / 20); return base * p.line / 240; }
        // Paragrafni qatorlarga bo'lish. Qaytaradi: {lines:[{items, h, base}], h}
        function dxLayPara(b, width, dts) {
            const p = b.p, indL = p.indL || 0, indR = p.indR || 0, indF = p.indF || 0;
            const toks = [];
            if (b.label) { toks.push({ s: b.label.t, r: b.runs.find(x => x.r) ? b.runs.find(x => x.r).r : b.mark }); if (b.label.sfx === 'tab') toks.push({ tab: true, r: b.mark, lbl: true }); else if (b.label.sfx === 'space') toks.push({ sp: true, r: b.mark }); }
            b.runs.forEach(x => {
                if (x.tab) toks.push({ tab: true, r: x.r }); else if (x.br) toks.push({ br: true, r: x.r }); else if (x.pb) toks.push({ pb: true }); else if (x.obj) { }
                else if (x.t !== undefined) { const t = dxCh(x.t, x.r); t.split(/( +|\u00a0+)/).forEach(part => { if (!part) return; if (/^ +$/.test(part)) toks.push({ sp: true, n: part.length, r: x.r }); else if (/^\u00a0+$/.test(part)) toks.push({ s: part, r: x.r, nb: true }); else toks.push({ s: part, r: x.r }); }); }
            });
            const fsOf = r => ((r && r.sz) || 11) * (r && r.va && r.va !== 'baseline' ? 0.66 : 1);
            const wOf = (s, r) => { const fs = fsOf(r); if (/^\u00a0+$/.test(s)) return pdfW('Regular', ' ', fs) * s.length; return pdfW(dxFontSt(r), s.replace(/\u00a0/g, ' '), fs); };
            const lines = []; let L = null, first = true;
            const left = () => indL + (first ? indF : 0), right = () => width - indR;
            const newLine = () => { L = { items: [], x: left(), maxFs: 0, forced: false, tabbed: false, first: first }; lines.push(L); first = false; };
            newLine();
            const stops = (p.tabs || []).filter(t => t.val !== 'clear' && t.val !== 'bar');
            let pendSp = 0, pendSpR = null;
            const put = (s, r, w) => { if (pendSp) { const sw = pdfW('Regular', ' ', fsOf(pendSpR || r)) * pendSp; L.items.push({ sp: true, w: sw, r: pendSpR || r }); L.x += sw; pendSp = 0; } L.items.push({ s: s, r: r, w: w, x: L.x }); L.x += w; L.maxFs = Math.max(L.maxFs, fsOf(r)); };
            toks.forEach(t => {
                if (t.pb) { L.pb = true; return; }
                if (t.br) { L.forced = true; L.maxFs = Math.max(L.maxFs, fsOf(t.r)); pendSp = 0; newLine(); return; }
                if (t.sp) { pendSp += t.n || 1; pendSpR = t.r; return; }
                if (t.tab) {
                    if (pendSp) { const sw = pdfW('Regular', ' ', fsOf(pendSpR)) * pendSp; L.items.push({ sp: true, w: sw, r: pendSpR }); L.x += sw; pendSp = 0; }
                    const cur = L.x; let st = stops.find(z => z.pos > cur + 0.5 && z.pos <= right() + 0.5);
                    if (!st && t.lbl && indF < 0 && cur < indL - 0.5) st = { pos: indL, val: 'left' }; // ro'yxat belgisi: osma chekinish
                    if (!st && cur < indL - 0.5 && indF < 0) st = { pos: indL, val: 'left' };
                    if (!st) { const pos = (Math.floor(cur / dts + 1e-6) + 1) * dts; st = pos <= right() ? { pos: pos, val: 'left' } : null; }
                    if (!st) { newLine(); return; }
                    L.items.push({ tab: true, st: st, x: cur, r: t.r }); L.tabbed = true;
                    L.x = st.val === 'left' || st.val === 'start' || st.val === 'num' ? st.pos : cur; L.seg = { st: st, from: L.items.length }; if (st.val !== 'left' && st.val !== 'start') L.x = cur; L.maxFs = Math.max(L.maxFs, fsOf(t.r));
                    return;
                }
                const w = wOf(t.s, t.r);
                const spw = pendSp ? pdfW('Regular', ' ', fsOf(pendSpR || t.r)) * pendSp : 0;
                if (L.items.length && L.x + spw + w > right() + 0.01 && !(L.seg && L.seg.st.val === 'right')) { pendSp = 0; newLine(); }
                if (!L.items.length && w > right() - L.x) { // juda uzun so'z — harflab bo'linadi
                    let part = ''; for (const ch of t.s) { if (part && wOf(part + ch, t.r) > right() - L.x) { put(part, t.r, wOf(part, t.r)); newLine(); part = ''; } part += ch; } if (part) put(part, t.r, wOf(part, t.r)); return;
                }
                put(t.s, t.r, w);
            });
            // o'ng / markaz tab to'xtashlari: segmentni siljitish
            lines.forEach(Ln => {
                let segStart = -1, st = null;
                const flush = endIdx => { if (!st || st.val === 'left' || st.val === 'start' || segStart < 0) return; const seg = Ln.items.slice(segStart, endIdx); if (!seg.length) return; const x0 = seg[0].x !== undefined ? seg[0].x : 0, w = seg.reduce((a, z) => a + (z.w || 0), 0); const tabItem = Ln.items[segStart - 1]; const target = st.val === 'right' || st.val === 'end' || st.val === 'decimal' ? st.pos - w : st.pos - w / 2; const from = tabItem ? tabItem.x : x0; const nx = Math.max(from, target); let x = nx; seg.forEach(z => { if (z.x !== undefined || z.sp) { z.x = x; x += z.w || 0; } }); };
                Ln.items.forEach((z, i) => { if (z.tab) { flush(i); segStart = i + 1; st = z.st; } });
                flush(Ln.items.length);
                // bo'sh joylar uchun x
                let x = null; Ln.items.forEach(z => { if (z.tab) { x = null; return; } if (z.sp) { if (x !== null) { z.x = x; x += z.w; } } else if (z.x !== undefined) x = z.x + z.w; });
                // tab chiziqchasi (leader) — oldingi elementdan keyingi segment boshigacha
                Ln.items.forEach((z, i) => { if (!z.tab || !z.st.leader || z.st.leader === 'none') return; const nxt = Ln.items.slice(i + 1).find(q => q.x !== undefined && !q.tab); z.lx1 = nxt ? nxt.x : z.st.pos; });
            });
            // qator balandligi, tekislash
            let h = 0;
            lines.forEach((Ln, i) => {
                const fs = Ln.maxFs || fsOf(b.mark); Ln.fs = fs; Ln.h = dxLh(p, fs); Ln.base = Ln.h - fs * 0.25 - Math.max(0, Ln.h - fs * 1.15) * 0; h += Ln.h;
                const last = i === lines.length - 1 || Ln.forced;
                const words = Ln.items.filter(z => !z.tab);
                // oxirgi bo'shliqlarni olib tashlash
                while (Ln.items.length && Ln.items[Ln.items.length - 1].sp) Ln.items.pop();
                if (Ln.tabbed) { if (p.jc === 'right' || p.jc === 'end' || p.jc === 'center') { const xs = Ln.items.filter(z => z.x !== undefined && !z.tab); if (xs.length) { const e = Math.max(...xs.map(z => z.x + (z.w || 0))), dx = (width - indR - e) / (p.jc === 'center' ? 2 : 1); if (dx > 0) Ln.items.forEach(z => { if (z.x !== undefined) z.x += dx; if (z.lx1 !== undefined) z.lx1 += dx; }); } } return; }
                const end = Ln.items.length ? Math.max(...Ln.items.filter(z => z.x !== undefined).map(z => z.x + (z.w || 0))) : 0, start = Ln.first ? indL + indF : indL, avail = width - indR - start, nat = end - start;
                if (p.jc === 'center') { const dx = (avail - nat) / 2; Ln.items.forEach(z => { if (z.x !== undefined) z.x += dx; if (z.lx1 !== undefined) z.lx1 += dx; }); }
                else if (p.jc === 'right' || p.jc === 'end') { const dx = avail - nat; Ln.items.forEach(z => { if (z.x !== undefined) z.x += dx; }); }
                else if ((p.jc === 'both' || p.jc === 'distribute') && !last) { const gaps = Ln.items.filter(z => z.sp).length; if (gaps && avail > nat) { const ex = (avail - nat) / gaps; let add = 0; Ln.items.forEach(z => { if (z.sp) { z.w += ex; add += ex; } else if (z.x !== undefined) z.x += add; }); let add2 = 0; Ln.items.forEach(z => { if (z.sp) { z.x = z.x + add2; add2 += ex; } }); } }
                void words;
            });
            return { lines: lines, h: h };
        }
        function dxDrawLines(ops, lay, x0, y0) {
            let y = y0;
            lay.lines.forEach(Ln => {
                const base = y + Ln.h - (Ln.h - Ln.fs * 1.15) - Ln.fs * 0.26 + (Ln.h - Ln.fs * 1.15);
                Ln.items.forEach(z => {
                    if (z.tab) { if (z.lx1 !== undefined && z.lx1 - z.x > 2) { const L = z.st.leader; if (L === 'underscore' || L === 'heavy') ops.push({ k: 'l', x1: x0 + z.x + 1, y1: base + 1.5, x2: x0 + z.lx1 - 1, y2: base + 1.5, w: 0.5 }); else if (L === 'dot' || L === 'middleDot') { let s = ''; const dw = pdfW('Regular', '.', Ln.fs); for (let k = 0; k < (z.lx1 - z.x - 2) / dw - 1; k++) s += '.'; ops.push({ k: 't', x: x0 + z.x + 1, y: base, s: s, st: 'Regular', fs: Ln.fs }); } else if (L === 'hyphen') { ops.push({ k: 'l', x1: x0 + z.x + 1, y1: base - Ln.fs * 0.3, x2: x0 + z.lx1 - 1, y2: base - Ln.fs * 0.3, w: 0.5 }); } }
                        if (z.r && z.r.u && z.lx1 === undefined) { const nxt = z.st ? z.st.pos : z.x; if (nxt - z.x > 1) ops.push({ k: 'l', x1: x0 + z.x, y1: base + 1.5, x2: x0 + nxt, y2: base + 1.5, w: 0.5 }); }
                        return; }
                    if (z.x === undefined) return;
                    const fs = ((z.r && z.r.sz) || 11) * (z.r && z.r.va && z.r.va !== 'baseline' ? 0.66 : 1), dy = z.r && z.r.va === 'superscript' ? -fs * 0.5 : z.r && z.r.va === 'subscript' ? fs * 0.2 : 0;
                    if (!z.sp && z.s && !/^\u00a0+$/.test(z.s)) ops.push({ k: 't', x: x0 + z.x, y: base + dy, s: z.s.replace(/\u00a0/g, ' '), st: dxFontSt(z.r), fs: fs, it: !!(z.r && z.r.i) });
                    if (z.r && z.r.u && z.w > 0) ops.push({ k: 'l', x1: x0 + z.x, y1: base + 1.5, x2: x0 + z.x + z.w, y2: base + 1.5, w: 0.5 });
                    if (z.r && z.r.strike && z.w > 0) ops.push({ k: 'l', x1: x0 + z.x, y1: base - fs * 0.3, x2: x0 + z.x + z.w, y2: base - fs * 0.3, w: 0.5 });
                });
                y += Ln.h;
            });
        }
        // Butun hujjat → sahifalar (pdfBuild bilan bir xil format)
        function dxLayout(M) {
            const P = { W: M.pg.W, H: M.pg.H, L: M.pg.L, R: M.pg.R, T: M.pg.T, B: M.pg.B }, cw = P.W - P.L - P.R, pages = [[]];
            let y = P.T, prevA = 0;
            const cur = () => pages[pages.length - 1], newPage = () => { pages.push([]); y = P.T; prevA = 0; };
            const bottom = () => P.H - P.B;
            const para = (b, x0, width, ops, dry) => { // qaytaradi: balandlik
                const L = dxLayPara(b, width, M.dts), spB = b.p.spB || 0, spA = b.p.spA || 0;
                return { L: L, spB: spB, spA: spA, h: spB + L.h + spA };
            };
            const blockPara = b => {
                if (b.p.pbb && cur().length) newPage();
                const r = para(b, 0, cw);
                let yy = y + Math.max(0, r.spB - 0);
                // qatorlar sahifaga sig'maganda — qatorma-qator bo'lish
                let chunk = { lines: [], h: 0 };
                const flushChunk = () => { if (chunk.lines.length) { dxDrawLines(cur(), chunk, P.L, yy); yy += chunk.h; chunk = { lines: [], h: 0 }; } };
                r.L.lines.forEach(Ln => {
                    if (yy + chunk.h + Ln.h > bottom() + 0.5 && (cur().length || chunk.lines.length)) { flushChunk(); newPage(); yy = y; }
                    chunk.lines.push(Ln); chunk.h += Ln.h;
                    if (Ln.pb) { flushChunk(); newPage(); yy = y; }
                });
                flushChunk();
                if (b.p.bdrB) cur().push({ k: 'l', x1: P.L + (b.p.indL || 0), y1: yy + 1, x2: P.L + cw - (b.p.indR || 0), y2: yy + 1, w: b.p.bdrB });
                y = yy + r.spA;
                if (b.sect) newPage();
            };
            const table = (t) => {
                const gw = t.grid, tot = gw.reduce((a, c) => a + c, 0);
                let tx = P.L + t.ind; if (t.jc === 'center') tx = P.L + (cw - tot) / 2; else if (t.jc === 'right' || t.jc === 'end') tx = P.L + cw - tot;
                const X = [tx]; gw.forEach((w, i) => X.push(X[i] + w));
                const nR = t.rows.length;
                // katak mazmunini o'lchash
                const cellLay = (c) => { const x0 = X[c.col], x1 = X[Math.min(gw.length, c.col + c.span)], m = c.mar || t.mar, w = Math.max(4, x1 - x0 - m.l - m.r); let h = 0; const items = c.blocks.map(b => { if (b.k === 'p') { const r = para(b, 0, w); h += r.h; return { k: 'p', r: r }; } return { k: 't', t: b }; }); return { x0: x0, x1: x1, w: w, m: m, items: items, h: h + m.t + m.b }; };
                const RH = t.rows.map(r => { let mx = 0; r.cells.forEach(c => { c._lay = cellLay(c); if (c.vm !== 'c' && c.vm !== 'r') mx = Math.max(mx, c._lay.h); }); let h = mx; if (r.hr === 'exact') h = r.h; else if (r.h) h = Math.max(h, r.h); return Math.max(h, 2); });
                // vertikal birlashtirish: boshlovchi katak balandligi
                t.rows.forEach((r, ri) => r.cells.forEach(c => { if (c.vm !== 'r') return; let n = 1; for (let k = ri + 1; k < nR; k++) { const cc = t.rows[k].cells.find(z => z.col === c.col); if (cc && cc.vm === 'c') n++; else break; } c._n = n; const have = RH.slice(ri, ri + n).reduce((a, b) => a + b, 0); if (c._lay.h > have) RH[ri + n - 1] += c._lay.h - have; }));
                const bdr = (c, side, ri, isFirstCol, isLastCol, isFirstRow, isLastRow) => { if (c.bd[side] !== undefined) return c.bd[side]; if (side === 'top') return isFirstRow ? t.bd.top : t.bd.insideH; if (side === 'bottom') return isLastRow ? t.bd.bottom : t.bd.insideH; if (side === 'left') return isFirstCol ? t.bd.left : t.bd.insideV; return isLastCol ? t.bd.right : t.bd.insideV; };
                const Ys = []; // har qator uchun (sahifa, y)
                t.rows.forEach((r, ri) => {
                    let h = RH[ri];
                    // birlashgan katak bir sahifada qolsin
                    if (y + h > bottom() + 0.5 && cur().length) newPage();
                    Ys[ri] = { pg: pages.length - 1, y: y };
                    y += h;
                });
                t.rows.forEach((r, ri) => {
                    const pos = Ys[ri], ops = pages[pos.pg];
                    r.cells.forEach((c, ci) => {
                        if (c.vm === 'c') return;
                        const n = c._n || 1; let h = 0; for (let k = 0; k < n; k++) { const q = Ys[ri + k]; if (!q || q.pg !== pos.pg) break; h += RH[ri + k]; }
                        const L = c._lay, isFC = c.col === 0 || c.col <= (r.before || 0), isLC = c.col + c.span >= gw.length, isFR = ri === 0, isLR = ri + n >= nR;
                        const b = { t: bdr(c, 'top', ri, isFC, isLC, isFR, isLR), btm: (() => { const last = ri + n - 1, lr = t.rows[last]; const lc = lr ? (lr.cells.find(z => z.col === c.col) || c) : c; return bdr(lc.vm === 'c' ? Object.assign({}, lc, { bd: Object.assign({}, c.bd, lc.bd) }) : c, 'bottom', last, isFC, isLC, isFR, isLR); })(), l: bdr(c, 'left', ri, isFC, isLC, isFR, isLR), r: bdr(c, 'right', ri, isFC, isLC, isFR, isLR) };
                        const x0 = L.x0, x1 = L.x1, y0 = pos.y, y1 = pos.y + h;
                        if (b.t) ops.push({ k: 'l', x1: x0, y1: y0, x2: x1, y2: y0, w: b.t }); if (b.btm) ops.push({ k: 'l', x1: x0, y1: y1, x2: x1, y2: y1, w: b.btm });
                        if (b.l) ops.push({ k: 'l', x1: x0, y1: y0, x2: x0, y2: y1, w: b.l }); if (b.r) ops.push({ k: 'l', x1: x1, y1: y0, x2: x1, y2: y1, w: b.r });
                        let cy = y0 + L.m.t; const inner = L.h - L.m.t - L.m.b; if (c.va === 'center') cy += Math.max(0, (h - L.h) / 2); else if (c.va === 'bottom') cy += Math.max(0, h - L.h);
                        L.items.forEach(it => { if (it.k !== 'p') return; cy += it.r.spB; dxDrawLines(ops, it.r.L, x0 + L.m.l, cy); cy += it.r.L.h + it.r.spA; });
                        void inner;
                    });
                });
            };
            M.blocks.forEach(b => { if (b.k === 'p') blockPara(b); else table(b); });
            while (pages.length > 1 && !pages[pages.length - 1].length) pages.pop();
            return { P: P, pages: pages };
        }
        // ---------- Natijalar ----------
        async function dxOpenTpl(id) {
            const t = DXT.tpl[id]; if (!t) throw new Error('Shablon topilmadi: ' + id);
            if (!DXT.cache[id]) DXT.cache[id] = await dxUnzip(dxB64u8(t.b64));
            return DXT.cache[id];
        }
        async function dxRender(id, data) { // → {files (to'ldirilgan docx ichi), M (model), lay}
            const src = await dxOpenTpl(id), files = Object.assign({}, src);
            const xml = dxFillXml(dxTxt(src['word/document.xml']), data || {});
            files['word/document.xml'] = new TextEncoder().encode(xml);
            PDFK.f = null; const M = dxModel(files), lay = dxLayout(M);
            return { files: files, M: M, lay: lay };
        }
        function dxDocxBlob(files) { return zipBlob(Object.keys(files).map(k => ({ name: k, data: files[k] })), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); }
        async function dxJpgs(lay, S) {
            try { await Promise.all([document.fonts.load('16px AGMKSerif'), document.fonts.load('bold 16px AGMKSerif')]); } catch (e) {}
            S = S || 3; const out = [];
            for (const ops of lay.pages) out.push(await new Promise(res => dxCanvas(lay, ops, S).toBlob(b => res(b), 'image/jpeg', 0.93)));
            return out;
        }
        function dxCanvas(lay, ops, S) {
            const c = document.createElement('canvas'); c.width = Math.round(lay.P.W * S); c.height = Math.round(lay.P.H * S);
            const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000'; g.strokeStyle = '#000'; g.textBaseline = 'alphabetic';
            ops.forEach(p => {
                if (p.k === 'l') { g.lineWidth = Math.max(0.8, p.w * S); g.beginPath(); g.moveTo(p.x1 * S, p.y1 * S); g.lineTo(p.x2 * S, p.y2 * S); g.stroke(); }
                else if (p.k === 't') { g.font = (p.it ? 'italic ' : '') + (p.st === 'Bold' ? 'bold ' : '') + (p.fs * S) + "px AGMKSerif, 'Times New Roman', serif"; g.fillText(p.s, p.x * S, p.y * S); }
                else if (p.k === 'img' && p.cv) { const tw = Math.max(1, Math.round(p.w * S)), th = Math.max(1, Math.round(p.h * S)); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; if (p.mul) g.globalCompositeOperation = 'multiply'; g.drawImage(dxFit(p.cv, tw, th), p.x * S, p.y * S, tw, th); g.globalCompositeOperation = 'source-over'; }
            });
            return c;
        }
        // 3.18.1 (K-22): imzo rasmi (≈640 px) sahifaga bir martada kichraytirilsa, ingichka chiziqlar uzilib, «xira-dogʻ» boʻlib qolardi.
        // Endi bosqichma-bosqich (har safar 2 marta) yuqori sifatda kichraytiriladi.
        function dxFit(src, tw, th) {
            let c = src, w = src.width, h = src.height;
            while (w / 2 >= tw && h / 2 >= th) { const n = document.createElement('canvas'); n.width = Math.max(tw, Math.round(w / 2)); n.height = Math.max(th, Math.round(h / 2)); const ng = n.getContext('2d'); ng.imageSmoothingEnabled = true; ng.imageSmoothingQuality = 'high'; ng.drawImage(c, 0, 0, n.width, n.height); c = n; w = n.width; h = n.height; }
            return c;
        }
        // fmts: ['pdf','docx','jpg'] → [{name, mime, blob}]
        async function dxFiles(id, data, base, fmts) {
            const R = await dxRender(id, data), b = String(base || DXT.tpl[id].name || 'Hujjat').replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Hujjat', out = [];
            for (const f of fmts) {
                if (f === 'docx') out.push({ name: b + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: dxDocxBlob(R.files) });
                else if (f === 'pdf') { PDFK.f = null; out.push({ name: b + '.pdf', mime: 'application/pdf', blob: pdfBuild(R.lay) }); }
                else if (f === 'jpg') { const L = await dxJpgs(R.lay); L.forEach((x, i) => out.push({ name: b + (L.length > 1 ? '_' + (i + 1) : '') + '.jpg', mime: 'image/jpeg', blob: x })); }
            }
            return out;
        }
        // Ilova ichida ko'rish: sahifalar rasm sifatida (PDF bilan aynan bir xil)
        async function dxPreview(el, id, data) {
            if (!el) return; const R = await dxRender(id, data);
            try { await Promise.all([document.fonts.load('16px AGMKSerif'), document.fonts.load('bold 16px AGMKSerif')]); } catch (e) {}
            el.innerHTML = ''; el.classList.add('dx-prev');
            R.lay.pages.forEach(ops => { const c = dxCanvas(R.lay, ops, 1.6); c.className = 'dx-pg'; el.appendChild(c); });
            return R;
        }
        (function () { const c = document.createElement('style'); c.textContent = '.dx-prev{display:flex;flex-direction:column;gap:10px;align-items:center;background:#334155;padding:10px;border-radius:10px}.dx-pg{width:100%;max-width:820px;height:auto;box-shadow:0 2px 10px rgba(0,0,0,.4);background:#fff}'; document.head.appendChild(c); })();

