        // =====================================================================
        // 5.8 — Hisobot (achot) tekshiruvi: Word hujjatlar (muallif, 30.10.2026, 8-band)
        //  • .docx — matn ham, jadvallar ham, hujjatdagi tartibda (avval faqat jadval qatorlari olinardi → sarlavha
        //    «Дефектная ведомость …», «Акт приёмки …» yoʻqolib, hujjat turi tanilmasdi); birlashtirilgan katakchalar (gridSpan) hisobga olinadi.
        //  • .doc (Word 97–2003) — CFB ichidagi WordDocument oqimi, «piece table» orqali matn; jadval katakchalari (0x07) qatorlarga ajratiladi.
        //  • .rtf — matn va jadvallar (\cell, \row).
        //  • Yuklash: «📂 Fayllarni tanlash» Word ni ham qabul qiladi + alohida «📝 Word hujjatlar» tugmasi — natija bitta tekshiruvda.
        //  • Har bir Word fayl «Word» varagʻi sifatida Excel varaqlari bilan bir xil tekshiriladi (spravka, defektovka, lom, naryad …).
        // =====================================================================
        const W58: any = window as any;
        function w58Cells(tr: any, W: string): string[] {
            const out: string[] = [];
            Array.from(tr.childNodes).forEach((tc: any) => {
                if (tc.localName !== 'tc') return;
                const t = Array.from(tc.getElementsByTagNameNS(W, 'p')).map((p: any) => Array.from(p.getElementsByTagNameNS(W, 't')).map((x: any) => x.textContent).join('')).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
                const gs = tc.getElementsByTagNameNS(W, 'gridSpan')[0], n = gs ? Math.max(1, +gs.getAttributeNS(W, 'val') || +gs.getAttribute('w:val') || 1) : 1;
                out.push(t); for (let i = 1; i < n; i++) out.push('');
            });
            return out;
        }
        async function w58Docx(buf: ArrayBuffer): Promise<any[][]> {
            const z = await W58.hsZipFiles(buf); if (!z['word/document.xml']) throw new Error('Word fayl emas');
            const xml = new TextDecoder().decode(await z['word/document.xml']()), d = new DOMParser().parseFromString(xml, 'application/xml');
            const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', body = d.getElementsByTagNameNS(W, 'body')[0], rows: any[][] = [];
            const walk = (el: any) => Array.from(el.childNodes).forEach((n: any) => {
                if (n.localName === 'p') { const t = Array.from(n.getElementsByTagNameNS(W, 't')).map((x: any) => x.textContent).join('').replace(/\s+/g, ' ').trim(); if (t) rows.push([t]); }
                else if (n.localName === 'tbl') Array.from(n.childNodes).forEach((tr: any) => { if (tr.localName === 'tr') { const c = w58Cells(tr, W); if (c.some(Boolean)) rows.push(c); } });
                else if (n.localName === 'sdt' || n.localName === 'sdtContent' || n.localName === 'customXml') walk(n);
            });
            if (body) walk(body);
            return rows.map(r => r.map(w58Num));
        }
        // raqamga oʻxshagan katakni songa aylantirish (Excel dagidek tekshirilsin): «12,5» → 12.5
        function w58Num(c: any): any { const s = String(c == null ? '' : c).trim(); return /^-?\d{1,9}([.,]\d+)?$/.test(s) ? +s.replace(',', '.') : c; }
        // ---------- .doc (Word 97–2003) ----------
        function w58Doc(buf: ArrayBuffer): any[][] {
            const X = W58.XLSX; if (!X || !X.CFB) throw new Error('Word (.doc) oʻquvchi yuklanmagan');
            // ilovadagi eski CFB: oddiy massiv kutadi, find() yoʻq, nomlar oxirida \0 boʻladi
            let cfb: any; try { cfb = X.CFB.read(Array.from(new Uint8Array(buf)), { type: 'array' }); } catch (e) { throw new Error('Word (.doc) fayl ochilmadi: ' + String((e && (e as any).message) || e)); }
            const get = (n: string) => { const L: any[] = cfb.FileIndex || []; const e = L.find((x: any) => x && String(x.name || '').replace(/\0/g, '') === n); return e && e.content ? new Uint8Array(e.content) : null; };
            const wd = get('WordDocument'); if (!wd) throw new Error('Word (.doc) fayl emas');
            const dv = new DataView(wd.buffer, wd.byteOffset, wd.byteLength), flags = dv.getUint16(0x0A, true), tbl = get((flags & 0x0200) ? '1Table' : '0Table');
            if (!tbl) throw new Error('Word (.doc): jadval oqimi topilmadi');
            const fcClx = dv.getUint32(0x01A2, true), lcbClx = dv.getUint32(0x01A6, true);
            const tv = new DataView(tbl.buffer, tbl.byteOffset, tbl.byteLength); let p = fcClx, text = '';
            const cp1251 = new TextDecoder('windows-1251'), u16 = new TextDecoder('utf-16le');
            while (p < fcClx + lcbClx) {
                const t = tbl[p];
                if (t === 1) { const cb = tv.getUint16(p + 1, true); p += 3 + cb; continue; }
                if (t !== 2) break;
                const lcb = tv.getUint32(p + 1, true), n = (lcb - 4) / 12, a = p + 5;
                for (let i = 0; i < n; i++) {
                    const cp0 = tv.getUint32(a + i * 4, true), cp1 = tv.getUint32(a + (i + 1) * 4, true), pcd = a + (n + 1) * 4 + i * 8, fc = tv.getUint32(pcd + 2, true), cmp = (fc & 0x40000000) !== 0, len = cp1 - cp0;
                    if (cmp) { const o = (fc & 0x3FFFFFFF) / 2; text += cp1251.decode(wd.subarray(o, o + len)); } else text += u16.decode(wd.subarray(fc, fc + len * 2));
                }
                break;
            }
            if (!text) throw new Error('Word (.doc) matni oʻqilmadi — faylni .docx qilib saqlab qayta yuklang');
            // \r — paragraf, \x07 — katakcha oxiri; qator oxirida qoʻshimcha boʻsh «\x07» (qator belgisi). Jadval bloki — \x07 li paragraflar ketma-ketligi.
            const rows: any[][] = [], pars = text.replace(/[\x01\x08\x13\x14\x15]/g, '').replace(/[\x0b\t]/g, ' ').split('\r');
            let blk: string[] = [];
            const flushBlk = () => {
                if (!blk.length) return; const T = blk.join(' ').split('\x07').map(x => x.replace(/\s+/g, ' ').trim()); if (T.length && T[T.length - 1] === '') T.pop(); blk = [];
                // ustunlar soni k: har (k+1)-chi token boʻsh (qator belgisi) boʻladigan eng kichik k
                let k = 0; for (let c = 1; c <= 40 && !k; c++) { if (T.length % (c + 1) !== 0) continue; let ok = true; for (let i = c; i < T.length; i += c + 1) if (T[i] !== '') { ok = false; break; } if (ok) k = c; }
                if (!k) { rows.push(T.filter(Boolean).map(w58Num)); return; }
                for (let i = 0; i < T.length; i += k + 1) { const r = T.slice(i, i + k); if (r.some(Boolean)) rows.push(r.map(w58Num)); }
            };
            pars.forEach(par => { if (par.indexOf('\x07') >= 0 || (blk.length && !/\x07\s*$/.test(blk[blk.length - 1]))) blk.push(par); else { flushBlk(); const t = par.replace(/\s+/g, ' ').trim(); if (t) rows.push([t]); } });
            flushBlk();
            return rows.filter(r => r.some((c: any) => String(c).trim()));
        }
        // ---------- .rtf ----------
        function w58Rtf(buf: ArrayBuffer): any[][] {
            let s = new TextDecoder('latin1').decode(new Uint8Array(buf)); const cp = /\\ansicpg(\d+)/.exec(s), enc = cp ? 'windows-' + cp[1] : 'windows-1251';
            let dec: TextDecoder; try { dec = new TextDecoder(enc); } catch (e) { dec = new TextDecoder('windows-1251'); }
            s = s.replace(/\{\\\*[^{}]*(\{[^{}]*\}[^{}]*)*\}/g, '').replace(/\{\\(fonttbl|colortbl|stylesheet|info)[\s\S]*?\}\}/g, '');
            let out = '', bytes: number[] = [];
            const flush = () => { if (bytes.length) { out += dec.decode(new Uint8Array(bytes)); bytes = []; } };
            for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                if (ch === '\\') {
                    const m = /^\\('([0-9a-f]{2})|u(-?\d+)\??|([a-z]+)(-?\d+)? ?|([\\{}]))/i.exec(s.slice(i, i + 40)); if (!m) continue;
                    i += m[0].length - 1;
                    if (m[2]) { bytes.push(parseInt(m[2], 16)); continue; }
                    flush();
                    if (m[3]) { out += String.fromCharCode((+m[3] + 65536) % 65536); if (s[i + 1] === '\\' && s[i + 2] === "'") i += 4; else if (s[i + 1] && s[i + 1] !== '\\' && s[i + 1] !== '{' && s[i + 1] !== '}') i++; continue; }
                    if (m[6]) { out += m[6]; continue; }
                    const w = m[4]; if (w === 'par' || w === 'line') out += '\r'; else if (w === 'cell') out += '\x07'; else if (w === 'row') out += '\x1e'; else if (w === 'tab') out += ' ';
                    continue;
                }
                flush(); if (ch === '{' || ch === '}' || ch === '\n' || ch === '\r') continue; out += ch;
            }
            flush();
            const rows: any[][] = []; out.split('\r').forEach(par => { if (par.indexOf('\x07') >= 0) par.split('\x1e').forEach(r => { const c = r.replace(/\x07\s*$/, '').split('\x07').map(x => x.replace(/\s+/g, ' ').trim()); if (c.some(Boolean)) rows.push(c.map(w58Num)); }); else { const t = par.replace(/\s+/g, ' ').trim(); if (t) rows.push([t]); } });
            return rows;
        }
        if (typeof W58.hsReadDocx === 'function') W58.hsReadDocx = W58.agmkExtend('hsReadDocx', '5.8: Word — matn va jadvallar tartibda', W58.hsReadDocx, (o: Function) => async function (this: unknown, buf: ArrayBuffer) { try { const r = await w58Docx(buf); if (r.length) return r; } catch (e) { /* */ } return o.apply(this, arguments); });
        if (typeof W58.hsReadAny === 'function') W58.hsReadAny = W58.agmkExtend('hsReadAny', '5.8: .doc va .rtf', W58.hsReadAny, (o: Function) => async function (this: unknown, file: any) {
            const n = String((file && file.name) || '').toLowerCase(), t = (file && file.type) || '';
            if (/\.doc$/.test(n) || t === 'application/msword') return { kind: 'word', rows: w58Doc(await file.arrayBuffer()) };
            if (/\.rtf$/.test(n) || /rtf/.test(t)) return { kind: 'word', rows: w58Rtf(await file.arrayBuffer()) };
            return o.apply(this, arguments);
        });
        // yuklash tugmalari: Word ham qabul qilinadi + alohida «📝 Word hujjatlar»
        const W58_ACC = '.doc,.docx,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,text/rtf';
        function w58Box(): void {
            try {
                const box = W58.$id('hpBox'); if (!box) return;
                const inp: any = box.querySelector('input[type=file]'); if (inp && inp.accept.indexOf('.doc,') < 0) inp.accept = inp.accept + ',' + W58_ACC;
                if (inp && !box.querySelector('.w58-word')) {
                    const oc = inp.getAttribute('onchange') || '';
                    inp.insertAdjacentHTML && inp.parentElement.insertAdjacentHTML('afterend', `<label class="alb-btn w58-word">📝 Word hujjatlar (defekt vedomost, akt priyomki …)<input type="file" multiple accept="${W58_ACC}" onchange="${oc.replace(/"/g, '&quot;')}"></label><div class="nd-tip w58-tip">Excel va Word fayllarni birga yoki alohida yuklash mumkin — ilova har birini mazmunidan taniydi. Eski .doc fayl toʻliq oʻqilmasa, uni .docx qilib saqlab yuklang.</div>`);
                }
            } catch (e) { /* */ }
        }
        if (typeof W58.hsRender === 'function') W58.hsRender = W58.agmkExtend('hsRender', '5.8: Word yuklash tugmasi', W58.hsRender, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(w58Box, 0); return r; });
        Object.assign(W58, { w58Docx: w58Docx, w58Doc: w58Doc, w58Rtf: w58Rtf });
