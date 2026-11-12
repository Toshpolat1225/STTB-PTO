
        // =====================================================================
        // v3.0 — Excel o'qish: yashirilgan (скрытые / filtr bilan berkitilgan) qatorlarni aniqlash
        //  • .xlsx: <row hidden="1"> belgisi;  .xls (BIFF8): ROW yozuvidagi fDyZero belgisi
        //  • Natija: har bir varaq qatorlari massiviga rows.__hid = Set(qator indekslari) biriktiriladi
        //  (1C .xlsx dagi tekislangan sharedStrings muammosi SheetJS ichida tuzatilgan — build.py)
        // =====================================================================
        var XHID = { last: null };
        async function xhidXlsx(buf) {
            const out = {};
            const z = await hsZipFiles(buf);
            const rd = async n => z[n] ? new TextDecoder().decode(await z[n]()) : '';
            const wbx = await rd('xl/workbook.xml'), rel = await rd('xl/_rels/workbook.xml.rels');
            const R = {}; rel.replace(/<Relationship\b[^>]*>/g, t => { const id = (t.match(/\bId="([^"]+)"/) || [])[1], tg = (t.match(/\bTarget="([^"]+)"/) || [])[1]; if (id && tg) R[id] = tg; return t; });
            const sheets = []; wbx.replace(/<(?:\w+:)?sheet\b[^>]*>/g, t => { const nm = (t.match(/\bname="([^"]*)"/) || [])[1], id = (t.match(/\br:id="([^"]+)"/) || t.match(/\bid="([^"]+)"/) || [])[1]; if (nm !== undefined && id) sheets.push({ n: nm, id: id }); return t; });
            const unx = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
            for (const s of sheets) {
                let tg = R[s.id] || ''; if (!tg) continue; tg = tg.replace(/^\/?(xl\/)?/, ''); const x = await rd('xl/' + tg); if (!x) continue;
                const H = new Set(); x.replace(/<(?:\w+:)?row\b[^>]*>/g, t => { const r = +(t.match(/\br="(\d+)"/) || [])[1]; if (r && /\bhidden="(1|true)"/.test(t)) H.add(r - 1); return t; });
                out[unx(s.n)] = H;
            }
            return out;
        }
        function xhidCfb(u8) {
            const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
            if (dv.getUint32(0, true) !== 0xE011CFD0) return null;
            const ss = 1 << dv.getUint16(30, true), mss = 1 << dv.getUint16(32, true);
            const nFat = dv.getUint32(44, true), dirStart = dv.getUint32(48, true), miniCut = dv.getUint32(56, true), miniFatStart = dv.getUint32(60, true), difStart = dv.getUint32(68, true), nDif = dv.getUint32(72, true);
            const sec = n => 512 + n * ss;
            const fatSecs = []; for (let i = 0; i < 109 && fatSecs.length < nFat; i++) fatSecs.push(dv.getUint32(76 + i * 4, true));
            let d = difStart; for (let k = 0; k < nDif && d < 0xFFFFFFFA; k++) { const o = sec(d), per = ss / 4 - 1; for (let i = 0; i < per && fatSecs.length < nFat; i++) fatSecs.push(dv.getUint32(o + i * 4, true)); d = dv.getUint32(o + per * 4, true); }
            const FAT = []; fatSecs.forEach(s => { const o = sec(s); for (let i = 0; i < ss / 4; i++) FAT.push(o + i * 4 + 4 <= u8.length ? dv.getUint32(o + i * 4, true) : 0xFFFFFFFE); });
            const chain = (st, T) => { const L = []; let c = st, g = 0; while (c < 0xFFFFFFFA && g++ < 1e6) { L.push(c); c = T[c]; } return L; };
            const readBig = st => { const L = chain(st, FAT), o = new Uint8Array(L.length * ss); L.forEach((s, i) => o.set(u8.subarray(sec(s), sec(s) + ss), i * ss)); return o; };
            const dir = readBig(dirStart), dd = new DataView(dir.buffer), ents = [];
            for (let p = 0; p + 128 <= dir.length; p += 128) { const nl = dd.getUint16(p + 64, true); let nm = ''; for (let i = 0; i + 1 < nl - 1; i += 2) nm += String.fromCharCode(dd.getUint16(p + i, true)); ents.push({ n: nm, t: dir[p + 66], st: dd.getUint32(p + 116, true), sz: dd.getUint32(p + 120, true) }); }
            const e = ents.find(x => x.t === 2 && /^(Workbook|Book)$/i.test(x.n)); if (!e) return null;
            if (e.sz >= miniCut) return readBig(e.st).subarray(0, e.sz);
            const root = ents.find(x => x.t === 5); if (!root) return null;
            const ms = readBig(root.st), mf = readBig(miniFatStart), mdv = new DataView(mf.buffer), MF = []; for (let i = 0; i + 4 <= mf.length; i += 4) MF.push(mdv.getUint32(i, true));
            const L = chain(e.st, MF), o = new Uint8Array(L.length * mss); L.forEach((s, i) => o.set(ms.subarray(s * mss, s * mss + mss), i * mss)); return o.subarray(0, e.sz);
        }
        function xhidXls(buf) {
            const wb = xhidCfb(new Uint8Array(buf)); if (!wb) return {};
            const dv = new DataView(wb.buffer, wb.byteOffset, wb.byteLength), pos = {}, out = {}; let p = 0, cur = null;
            // 1) BOUNDSHEET: varaq nomlari va ularning BOF joyi
            while (p + 4 <= wb.length) { const t = dv.getUint16(p, true), l = dv.getUint16(p + 2, true), d = p + 4;
                if (t === 0x0085 && l >= 8) { const at = dv.getUint32(d, true), cch = wb[d + 6], hi = wb[d + 7] & 1; let nm = ''; for (let i = 0; i < cch; i++) nm += String.fromCharCode(hi ? dv.getUint16(d + 8 + i * 2, true) : wb[d + 8 + i]); pos[at] = nm; }
                p = d + l; }
            // 2) ROW yozuvlari: fDyZero (0x20) — qator yashirilgan
            p = 0; while (p + 4 <= wb.length) { const t = dv.getUint16(p, true), l = dv.getUint16(p + 2, true), d = p + 4;
                if (t === 0x0809) cur = pos[p] !== undefined ? pos[p] : null;
                else if (t === 0x0208 && cur !== null && l >= 16) { const rw = dv.getUint16(d, true), gr = dv.getUint16(d + 12, true); if (gr & 0x20) (out[cur] = out[cur] || new Set()).add(rw); }
                p = d + l; }
            return out;
        }
        async function xhidRead(buf, name) {
            try {
                const u8 = new Uint8Array(buf);
                if (u8[0] === 0x50 && u8[1] === 0x4B) return await xhidXlsx(buf);
                if (u8[0] === 0xD0 && u8[1] === 0xCF) return xhidXls(buf);
            } catch (e) { console.error('xhid', e); }
            return {};
        }
        // hpReadBook: qatorlar bilan birga yashirin qatorlar ham qaytariladi (rows.__hid — qatorlar massivi indekslari)
        (function () {
            if (typeof hpReadBook !== 'function') return;
            hpReadBook = async function (file) {
                const n = String(file.name || '').toLowerCase();
                if (/\.(xlsx|xls|xlsm|ods|csv)$/.test(n) || /sheet|excel/.test(file.type || '')) {
                    if (typeof XLSX === 'undefined') throw new Error('Excel moduli yuklanmagan');
                    const buf = await file.arrayBuffer(), u8 = new Uint8Array(buf); let bs = ''; for (let i = 0; i < u8.length; i += 32768) bs += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
                    const wb = XLSX.read(bs, { type: 'binary', cellDates: false });
                    const hid = await xhidRead(buf, n);
                    const ent = t => t.indexOf('&') < 0 ? t : t.replace(/&#(\d+);/g, (m, k) => String.fromCodePoint(+k)).replace(/&#x([0-9a-f]+);/gi, (m, k) => String.fromCodePoint(parseInt(k, 16))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                    return wb.SheetNames.map(sn => {
                        const ws = wb.Sheets[sn], rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }).map(r => r.map(c => typeof c === 'string' ? ent(c) : c));
                        const H = hid[sn]; let s0 = 0; try { s0 = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).s.r : 0; } catch (e) {}
                        const set = new Set(); if (H) H.forEach(r => { const i = r - s0; if (i >= 0 && i < rows.length) set.add(i); });
                        Object.defineProperty(rows, '__hid', { value: set, enumerable: false });
                        return { s: sn, rows: rows };
                    });
                }
                const r = await hsReadAny(file); if (!r.rows) return [];
                return [{ s: r.kind.toUpperCase(), rows: r.rows }];
            };
        })();

