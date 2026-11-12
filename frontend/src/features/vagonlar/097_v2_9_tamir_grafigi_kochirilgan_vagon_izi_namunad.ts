        // =====================================================================
        // v2.9 — 🗓 TA'MIR GRAFIGI: ko'chirilgan vagon izi + namunadagi («31-17-18») aniq eksport
        //  • Boshqa oyga ko'chirilsa (qo'lda, ＋ qo'shish, AI buyrug'i, nosozlik) — eski oyda o'chmaydi:
        //    alohida ramkada, boshqa rangda «→ oktyabrga ko'chirildi (sana, kim)»; yangi oyda «↩ noyabrdan ko'chirildi»
        //  • Izni bosib — ko'chirishni bekor qilish mumkin
        //  • PDF / Word / Excel / JPG / chop etish — faqat yakuniy holat (izlarsiz), namunadagi jadval shaklida
        // =====================================================================
        var PPR47_T = {
            'VX|105|KR': "Vagon Xizmatida 2VS-105 tipidagi vagonlarning kapital ta'miri", 'VX|60|KR': "Vagon Xizmatida 6VS-60 tipidagi vagonlarning kapital ta'miri",
            'VX|cis|KR': "Vagon Xizmatida sisterna vagonlarning kapital ta'miri", 'VX|hop|KR': "Vagon Xizmatida xopper-dozatorlarning Kapital ta'miri", 'VX|plat|KR': "Vagon Xizmatida platformalarning kapital ta'miri",
            'VX|cis|DR': "Vagon Xizmatida sisternalarning depo ta'miri", 'VX|hop|DR': "Vagon Xizmatida xopper-dozatorlarning depo ta'miri", 'VX|105|DR': "Vagon Xizmatida 2VS-105 tipidagi vagonlarning depo ta'miri",
            'VX|60|DR': "Vagon Xizmatida 6VS-60 tipidagi vagonlarning depo ta'miri", 'VX|plat|DR': "Vagon Xizmatida platformalarning depo ta'miri",
            '2-TYS|plat|DR': "2-TYS da platformalarning depo ta'miri", '2-TYS|cis|DR': "2-TYS da sisternalarning depo ta'miri"
        };
        function pprLive(L) { return (L || []).filter(x => !x.ghost); }
        function pprWhoWhen(o) { return (o && o.at ? new Date(o.at).toLocaleDateString('ru-RU') : '') + (o && o.by ? ', ' + String(o.by).split(/[·(]/)[0].trim() : ''); }
        // ---------- Asosiy amallar (izli) ----------
        pprFind = function (d, no, from) { no = String(no).replace(/^0+/, ''); const res = []; const y = d.year; for (let k = 0; k < 12; k++) { const m = y + '-' + String(k + 1).padStart(2, '0'); if (from && m < from) continue; d.secs.forEach((s, si) => { if (s.kind !== 'list') return; pprList(d, m, si).forEach((x, j) => { if (!x.ghost && pprNo(x.v) === no) res.push({ m: m, si: si, j: j, x: x }); }); }); } return res; };
        pprMove = function (d, no, toM, why) {
            const f = pprFind(d, no)[0]; if (!f) return 'Grafikda №' + no + ' topilmadi'; if (f.m === toM) return '№' + no + ' allaqachon ' + pprMName(toM) + ' oyida';
            const src = pprMon(d, f.m)[f.si] || (pprMon(d, f.m)[f.si] = pprList(d, f.m, f.si).slice()); const it = src[f.j];
            const dst = pprMon(d, toM); dst[f.si] = dst[f.si] || pprList(d, toM, f.si).slice();
            const now = new Date().toISOString(), by = authorStr();
            // Ortga qaytarish: maqsad oyda shu vagonning izi bor bo'lsa — iz tiklanadi, ko'chirilgan nusxa olib tashlanadi
            const gi = dst[f.si].findIndex(z => z.ghost && pprNo(z.v) === pprNo(it.v));
            if (gi >= 0) { const g = dst[f.si][gi]; delete g.ghost; if (it.from === toM) src.splice(f.j, 1); else src[f.j] = Object.assign({}, it, { ghost: { to: toM, at: now, by: by, why: why || '' } }); }
            else {
                if (it.from && it.from !== toM) { src.splice(f.j, 1); try { const OL = (pprMon(d, it.from)[f.si] || []), og = OL.find(z => z.ghost && pprNo(z.v) === pprNo(it.v)); if (og) Object.assign(og.ghost, { to: toM, at: now, by: by }); } catch (e) {} } else src[f.j] = Object.assign({}, it, { ghost: { to: toM, at: now, by: by, why: why || '' } });
                const nn = Object.assign({}, it); delete nn.ghost; delete nn.done; nn.from = it.from && it.from !== toM ? it.from : f.m; nn.mv = { at: now, by: by, why: why || '' }; if (nn.note === 'qoʻshimcha') nn.note = ''; if (why) nn.why = why;
                dst[f.si].push(nn);
            }
            pprLog(d, '№' + it.v + ': ' + pprMName(f.m) + ' → ' + pprMName(toM) + (why ? ' (' + why + ')' : '') + ' · ' + d.secs[f.si].title); return '';
        };
        (function () {
            pprDo = agmkExtend('pprDo', 'pprDo', pprDo, o => async function (op, noAsk) {
                // ＋ bilan qo'shilgan vagon grafikning boshqa (joriy yoki kelgusi) oyida bo'lsa — bu ko'chirish hisoblanadi
                if (op && op.op === 'add') { const d = pprDB(); const lim = [op.m, pprCurM()].sort()[0]; const f = pprFind(d, op.a).find(z => z.m !== op.m && z.m >= lim); if (f) return o.call(this, { op: 'move', a: op.a, to: op.m, why: op.why }, noAsk); }
                if (op && op.op === 'undo') { const d = pprDB(); const L = pprMon(d, op.m)[op.si] || []; const g = L[op.j]; if (!g || !g.ghost) return; if (!noAsk && !(await uiConfirm('№' + g.v + ' — ' + pprMName(g.ghost.to) + ' oyiga koʻchirish bekor qilinsinmi?\nVagon yana ' + pprMName(op.m) + ' oyiga qaytadi.'))) return; const e = pprMove(d, g.v, op.m, 'bekor qilindi'); if (e) { alert(e); return; } pprSave(d); mdlClose('pprAct'); showToast('↩ №' + g.v + ' ' + pprMName(op.m) + ' oyiga qaytarildi'); pprOpen(); return; }
                return o.apply(this, arguments);
            });
        })();
        // Eski ma'lumot: «qoʻshimcha» deb qo'shilgan, lekin boshqa oyda ham turgan vagonlar → ko'chirish (iz bilan)
        function pprMigrate47(d) {
            if (!d || !d.mon) return false; let ch = false; const cur = pprCurM();
            Object.keys(d.mon).sort().forEach(m => { const S = d.mon[m]; Object.keys(S).forEach(si => { (S[si] || []).forEach(x => {
                if (x.ghost || x.from || x.note !== 'qoʻshimcha') return;
                const lim = [m, cur].sort()[0], other = pprFind(d, x.v).filter(z => z.m !== m && z.m >= lim && z.x !== x);
                if (other.length !== 1) return; const z = other[0], L = pprMon(d, z.m)[z.si] || (pprMon(d, z.m)[z.si] = pprList(d, z.m, z.si).slice());
                L[z.j] = Object.assign({}, L[z.j], { ghost: { to: m, at: new Date().toISOString(), by: 'avtomatik (oldin qoʻshilgan)', why: '' } }); x.from = z.m; x.note = ''; ch = true;
            }); }); });
            if (ch) pprLog(d, 'Oldin «qoʻshimcha» deb qoʻshilgan vagonlar koʻchirish sifatida belgilandi (eski oyda iz qoldi)');
            return ch;
        }
        // ---------- Ko'rinish ----------
        pprOpen = function (m) {
            const d0 = pprDB(), E = escapeHtml; if (d0 && pprMigrate47(d0)) pprSave(d0);
            PPRV.m = m || PPRV.m || pprCurM(); const d = pprDB();
            if (!d) { mdl('pprModal', `<div class="px-h"><b>🗓 Taʼmir grafigi</b><button class="mini-btn" onclick="mdlClose('pprModal')">✕</button></div><div class="nd-tip">Avval yillik grafikni (PPR) Excel faylini yuklang. Oldingi oylarning jadvallarini ham birga tanlashingiz mumkin — ular tarix sifatida kiritiladi.</div><label class="alb-btn cam">📂 Grafik fayllarini tanlash<input type="file" multiple accept=".xls,.xlsx" style="display:none" onchange="pprImport(this)"></label>`, true); return; }
            const places = Array.from(new Set(d.secs.map(s => s.place))); if (!places.includes(PPRV.place)) PPRV.place = places[0];
            const k = +PPRV.m.split('-')[1] - 1, inYear = +PPRV.m.split('-')[0] === d.year;
            const body = pprOrder(d, PPRV.place, PPRV.m).map(si => {
                const s = d.secs[si];
                if (s.kind === 'count') return `<div class="pp-sec"><div class="pp-h">${E(s.title)}</div><div class="pp-cnt">${inYear && s.counts ? (s.counts[k] ?? '—') + ' dona' : '—'}</div></div>`;
                const A = pprList(d, PPRV.m, si), L = A.map((x, j) => [x, j]).filter(([x]) => !x.ghost), G = A.map((x, j) => [x, j]).filter(([x]) => x.ghost);
                return `<div class="pp-sec"><div class="pp-h">${E(s.title)} <small>${L.length} ta${s.plan && inYear && s.plan[k] ? ' / reja ' + s.plan[k] : ''}</small></div><div class="pp-chips">${L.map(([x, j]) => `<span class="pp-c${x.note ? ' n' : ''}${x.from ? ' mv' : ''}${x.done ? ' ok' : ''}" onclick="pprItem(${si}, ${j})">${x.done ? '✓ ' : ''}${E(x.v)}${x.note ? ' <i>' + E(x.note) + '</i>' : ''}${x.from ? ` <i class="pp-from">↩ ${E(PPR_OY[+x.from.split('-')[1] - 1] || '')}dan koʻchirildi</i>` : ''}</span>`).join('')}<span class="pp-c add" onclick="pprAdd(${si})">＋</span></div>${G.length ? `<div class="pp-ghosts"><div class="pp-gh">Koʻchirilganlar (hujjatga chiqmaydi)</div>${G.map(([x, j]) => `<span class="pp-c ghost" onclick="pprGhost(${si}, ${j})">${E(x.v)} <i>→ ${E(PPR_OY[+x.ghost.to.split('-')[1] - 1] || x.ghost.to)}ga koʻchirildi (${E(pprWhoWhen(x.ghost))})</i></span>`).join('')}</div>` : ''}</div>`;
            }).join('');
            mdl('pprModal', `<div class="px-h"><b>🗓 Taʼmir grafigi · ${E(pprMName(PPRV.m))}</b><button class="mini-btn" onclick="mdlClose('pprModal')">✕</button></div>
                <div class="pp-nav"><button onclick="pprOpen(pprAddM(PPRV.m,-1))">◀</button><b>${E(pprMName(PPRV.m))}</b><button onclick="pprOpen(pprAddM(PPRV.m,1))">▶</button></div>
                <div class="cx-tabs">${places.map(p => `<button class="${p === PPRV.place ? 'on' : ''}" onclick="PPRV.place='${p}'; pprOpen()">${E(p)}</button>`).join('')}</div>
                <div class="nd-tip">Vagonni bosing — surish, almashtirish yoki olib tashlash. AI ga ham aytishingiz mumkin: «16148 ni kelgusi oyga sur», «4364 va 9171 ni almashtir». Koʻchirilgan vagon eski oyda xira ramkada qoladi (bosib — bekor qilish).</div>${body}
                <div class="cx-bar"><button onclick="pprExport('pdf')">📄 PDF</button><button onclick="pprExport('docx')">📝 Word</button><button onclick="pprExport('xlsx')">📊 Excel</button><button onclick="pprExport('jpg')">🖼 JPG</button><button onclick="pprPrint()">🖨 Chop etish</button><button onclick="pprSend()">📤 Yuborish</button><button onclick="pprHist()">📜 Tarix</button><label class="cx-lbl">📂 Yuklash<input type="file" multiple accept=".xls,.xlsx" style="display:none" onchange="pprImport(this)"></label></div>`, true);
        };
        function pprGhost(si, j) {
            const d = pprDB(), x = pprList(d, PPRV.m, si)[j], E = escapeHtml; if (!x || !x.ghost) return;
            mdl('pprAct', `<div class="px-h"><b>№ ${E(x.v)}</b><button class="mini-btn" onclick="mdlClose('pprAct')">✕</button></div><div class="nd-tip">${E(d.secs[si].title)}<br>${E(pprMName(PPRV.m))} → <b>${E(pprMName(x.ghost.to))}</b> oyiga koʻchirilgan (${E(pprWhoWhen(x.ghost))})${x.ghost.why ? ' · ' + E(x.ghost.why) : ''}.<br>Bu iz hujjatga (PDF, Word, Excel) chiqmaydi.</div>
                <div class="nv-btns"><button onclick="pprDo({op:'undo', m:'${PPRV.m}', si:${si}, j:${j}})">↩ Koʻchirishni bekor qilish</button><button onclick="mdlClose('pprAct'); pprOpen('${x.ghost.to}')">➡️ ${E(pprMName(x.ghost.to))} ni ochish</button></div>`, true);
        }
        // Oylik jadvaldagi bo'limlar tartibi (oylik namunadan olingan bo'lsa — o'sha tartib)
        function pprOrder(d, place, m) {
            const idx = d.secs.map((s, i) => i).filter(i => d.secs[i].place === place), F = (d.mfmt || {})[place]; let base = null;
            if (F && F.orders) { const ks = Object.keys(F.orders).sort(); if (m && F.orders[m]) base = F.orders[m]; else if (ks.length) { const le = ks.filter(k => !m || k <= m); base = F.orders[le.length ? le[le.length - 1] : ks[ks.length - 1]]; } }
            if (!base && F && F.order) base = F.order; if (!base) return idx;
            const o = []; base.forEach(k => { const i = idx.find(q => d.secs[q].key === k); if (i !== undefined && o.indexOf(i) < 0) o.push(i); });
            idx.forEach((i, pos) => { if (o.indexOf(i) >= 0) return; let ins = 0; for (let q = pos - 1; q >= 0; q--) { const at = o.indexOf(idx[q]); if (at >= 0) { ins = at + 1; break; } } o.splice(ins, 0, i); });
            return o;
        }
        function pprMTitle(d, s) { const F = (d.mfmt || {})[s.place]; return (F && F.titles && F.titles[s.key]) || PPR47_T[s.key] || s.title; }
        // ---------- Namunadagi oylik jadval: grid ----------
        function pprGrid(m, place) {
            const d = pprDB(), k = +m.split('-')[1] - 1, y = m.slice(0, 4), inYear = +y === d.year, two = place === '2-TYS', P = two ? 2 : 3;
            const cols = two ? [6, 30, 4, 10, 30] : [6, 21, 6, 21, 6, 21], NC = cols.length, rows = [], merges = [];
            const add = (cells, ht, mg) => { rows.push({ cells: cells, ht: ht || 15 }); (mg || []).forEach(z => merges.push(Object.assign({ r: rows.length - 1 }, z))); };
            const H0 = two ? [["«KELISHILDI»", "ICHTB boshlig'i", '_______@@N:298@@'], ["«KELISHILDI»", "2-TYS boshlig'i", '@@N:343@@'], ['«TASDIQLAYMAN»', 'STTB bosh muhandisi', '@@N:286@@']] : [["«KELISHILDI»", "ICHTB boshlig'i", '_______@@N:304@@'], ["«KELISHILDI»", "VX boshlig'i", '@@N:356@@'], ['«TASDIQLAYMAN»', 'STTB bosh muhandisi', '@@N:286@@']];
            const heads: any[] = typeof (window as any).pprSigHeads === 'function' ? (window as any).pprSigHeads(place, H0) : H0; // 5.8: imzo chekuvchilar grafik oynasida tanlanadi;
            const SC = two ? [0, 2, 4] : [0, 2, 4], SS = two ? [2, 2, 1] : [2, 2, 2];
            add([{ v: '31-17-18', fs: 10 }], 15);
            for (let l = 0; l < 4; l++) { const cells = []; heads.forEach((h, i) => { cells[SC[i]] = { v: l < 3 ? h[l] : (h[0] ? '"___" _________' + y + '-y.' : ''), b: l === 0, fs: 11 }; }); add(cells, 15, heads.map((h, i) => ({ c: SC[i], cs: SS[i] }))); rows[rows.length - 1].sig = 1; }
            add([], 10);
            const mon = (PPR_OY[k] || ''), title = place === 'VX' ? "Vagon Xizmatida amalga oshiriladigan vagonlarning rejali ta'mirlash jadvali" : two ? "2-TYSda amalga oshiriladigan vagonlarning depo turidagi rejali ta'mir jadvali " + mon + ' ' + y + '-yil' : place + "da amalga oshiriladigan vagonlarning rejali ta'mir jadvali";
            add([{ v: title, b: 1, fs: 12, al: 'center', wrap: two ? 1 : 0 }], two ? 32 : 18, [{ c: 0, cs: NC }]);
            if (!two) add([{ v: mon.toUpperCase() + '  ' + y + '-yil', b: 1, fs: 12, al: 'center' }], 18, [{ c: 0, cs: NC }]);
            pprOrder(d, place, m).forEach(si => {
                const s = d.secs[si]; if (s.kind !== 'list') return;
                const L = pprLive(pprList(d, m, si)), plan = inYear && s.plan && s.plan[k] ? Math.round(s.plan[k]) : 0, n = Math.max(L.length, plan); if (!n) return;
                add([{ v: pprMTitle(d, s), b: 1, fs: 11, al: 'center', bd: 1 }], 17, [{ c: 0, cs: NC }]);
                const hc = []; for (let p = 0; p < P; p++) { const c0 = two ? p * 3 : p * 2; hc[c0] = { v: '№', b: 1, al: 'center', bd: 1 }; hc[c0 + 1] = { v: 'Vagon raqami', b: 1, al: 'center', bd: 1 }; } add(hc, 16);
                const colMaj = n > P * 2, R = Math.ceil(n / P), dot = colMaj;
                for (let r = 0; r < R; r++) { const cells = []; for (let p = 0; p < P; p++) { const i = colMaj ? p * R + r : r * P + p, c0 = two ? p * 3 : p * 2; if (i < n) { const x = L[i]; cells[c0] = { v: dot ? (i + 1) + '.' : i + 1, al: 'center', bd: 1 }; cells[c0 + 1] = { v: x ? String(x.v) + (x.note && /%/.test(x.note) ? '-' + x.note : '') : '', al: 'center', bd: 1 }; } else if (colMaj || r === R - 1) { cells[c0] = { v: '', bd: 1 }; cells[c0 + 1] = { v: '', bd: 1 }; } } add(cells, 16); }
            });
            add([], 12);
            const F0 = [["ICHTB vagonlar bo'yicha muhandisi", '@@N:380@@']], FT: any[] = typeof (window as any).pprSigFoot === 'function' ? (window as any).pprSigFoot(place, F0) : F0;
            FT.forEach((f, fi) => { if (fi) add([], 8, []); const fc = []; fc[two ? 1 : 0] = { v: f[0], ov: 1 }; fc[two ? 4 : 4] = { v: f[1], al: two ? 'center' : '' }; add(fc, 16, two ? [] : [{ c: 0, cs: 4 }, { c: 4, cs: 2 }]); });
            return { cols: cols, rows: rows, merges: merges, sheet: m.slice(5, 7) + '.' + m.slice(2, 4) + '.', grid: false };
        }
        // Chop etish / Word / yuborish uchun HTML (xuddi shu tuzilma)
        pprHtml = function () {
            const G = pprGrid(PPRV.m, PPRV.place), E = escapeHtml, NC = G.cols.length, tot = G.cols.reduce((a, b) => a + b, 0);
            const M = {}; G.merges.forEach(z => { M[z.r + ':' + z.c] = z.cs; for (let j = 1; j < z.cs; j++) M[z.r + ':' + (z.c + j)] = 0; });
            let h = '', tab = null;
            const flush = () => { if (tab) { h += `<table style="border-collapse:collapse;width:100%;font-size:10.5pt"><colgroup>${G.cols.map(w => `<col style="width:${(w / tot * 100).toFixed(1)}%">`).join('')}</colgroup>${tab}</table>`; tab = null; } };
            const sig = G.rows.slice(1, 5);
            h += `<div style="font-size:10pt">31-17-18</div><table class="nb" style="width:100%;font-size:10.5pt"><tr>${[0, 2, 4].map(c => `<td style="vertical-align:top">${sig.map((r, l) => r.cells[c] ? (l === 0 ? '<b>' + E(r.cells[c].v) + '</b>' : E(r.cells[c].v)) : '').join('<br>')}</td>`).join('')}</tr></table>`;
            G.rows.slice(5).forEach((r, q) => {
                const ri = q + 5, cells = r.cells || [];
                if (!cells.some(Boolean)) { flush(); return; }
                const isTbl = cells.some(c => c && c.bd);
                if (!isTbl) { flush(); const c = cells.find(Boolean); if (c.al === 'center') h += `<p style="text-align:center;margin:4px 0"><b>${E(c.v)}</b></p>`; else { const b = cells.filter(Boolean).map(z => E(z.v)); h += `<table class="nb" style="width:100%;margin-top:14px"><tr><td>${b[0]}</td><td style="text-align:right">${b[1] || ''}</td></tr></table>`; } return; }
                tab = tab || ''; let tr = '<tr>';
                for (let c = 0; c < NC; c++) { if (M[ri + ':' + c] === 0) continue; const x = cells[c], cs = M[ri + ':' + c] || 1; const st = x && x.bd ? 'border:1px solid #000;padding:2px 4px;' : 'padding:2px 4px;'; tr += `<td${cs > 1 ? ` colspan="${cs}"` : ''} style="${st}${x && x.al ? 'text-align:' + x.al + ';' : ''}">${x ? (x.b ? '<b>' + E(x.v) + '</b>' : E(x.v)) : ''}</td>`; }
                tab += tr + '</tr>';
            });
            flush();
            return `<div style="font-family:'Times New Roman',serif;font-size:11pt;color:#000">${h}</div>`;
        };
        async function pprExport(f) {
            try {
                const G = pprGrid(PPRV.m, PPRV.place), b = String(pprName()).replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Grafik'; let files;
                if (f === 'xlsx') files = [{ name: b + '.xlsx', blob: xlsxFromGrid(G) }];
                else if (f === 'pdf') files = [{ name: b + '.pdf', blob: gridPdf(G) }];
                else if (f === 'jpg') { const L = await gridJpg(G); files = L.map((x, i) => ({ name: b + (L.length > 1 ? '_' + (i + 1) : '') + '.jpg', blob: x })); }
                else files = await docMake(pprHtml(), pprName(), [f]);
                docDownload(files);
            } catch (e) { console.error(e); alert('⚠️ ' + agmkErrUz(e)); }
        };
        function pprSend() { try { sendOpen({ html: pprHtml(), title: pprName(), lang: 'uz', fmts: ['pdf'] }); } catch (e) {} };
        // ---------- Import: oylik namunadagi sarlavhalar/tartib eslab qolinadi; sarlavhasiz jadval — foydalanuvchi tanlaydi ----------
        async function pprImport(inp) {
            const files = [...(inp.files || [])]; inp.value = ''; if (!files.length) return; let d = pprDB(); const msg = [], orphan = [];
            for (const f of files) {
                let bk; try { bk = await hpReadBook(f); } catch (e) { msg.push('⚠️ ' + f.name + ': ' + agmkErrUz(e)); continue; }
                let done = false;
                for (const sh of bk) { const y = pprParseYear(sh.rows, f.name); if (y && y.secs.length >= 3) { const old = d; d = Object.assign({ mon: {}, log: [] }, y, { at: new Date().toISOString(), by: authorStr() }); if (old) { d.mon = old.mon || {}; d.log = old.log || []; d.mfmt = old.mfmt; } d.log.push({ at: d.at, by: d.by, a: 'Yillik grafik yuklandi: ' + f.name + ' (' + y.secs.length + ' boʻlim)' }); msg.push('✅ Yillik grafik: ' + f.name + ' — ' + y.secs.length + ' boʻlim, ' + y.year + '-yil'); done = true; break; } }
                if (done) continue;
                if (!d) { msg.push('⚠️ ' + f.name + ': avval yillik grafikni yuklang'); continue; }
                for (const sh of bk) {
                    const m = pprParseMonth(sh.rows); if (!m || !m.secs.some(s => s.items.length)) continue; let n = 0, prev = null; const order = [];
                    m.secs.forEach(s => {
                        if (!s.key) { if (s.items.length) orphan.push({ m: m.month, items: s.items, after: prev, file: f.name, place: prev ? d.secs.find(z => z.key === prev) && d.secs.find(z => z.key === prev).place : 'VX' }); if (prev) order.push('?'); return; }
                        prev = s.key; const si = d.secs.findIndex(z => z.key === s.key); if (si < 0) return;
                        const pl = d.secs[si].place; d.mfmt = d.mfmt || {}; const F = d.mfmt[pl] = d.mfmt[pl] || { order: [], titles: {} }; F.titles[s.key] = s.title; order.push(s.key);
                        if (!s.items.length) return; pprMon(d, m.month)[si] = s.items.map(x => Object.assign({ v: x.v }, x.note ? { note: x.note } : {})); n += s.items.length;
                    });
                    const pl = (d.secs.find(z => z.key === order.find(k => k !== '?')) || {}).place; if (pl && order.filter(k => k !== '?').length >= 2) { d.mfmt[pl].orders = d.mfmt[pl].orders || {}; d.mfmt[pl].orders[m.month] = order; }
                    d.log.push({ at: new Date().toISOString(), by: authorStr(), a: 'Oylik jadval yuklandi (' + pprMName(m.month) + '): ' + f.name + ', ' + n + ' ta vagon' }); msg.push('✅ ' + pprMName(m.month) + ' jadvali: ' + f.name + ' — ' + n + ' ta vagon'); done = true;
                }
                if (!done) msg.push('⚠️ ' + f.name + ': grafik shakli tanilmadi');
            }
            if (d) pprSave(d); alert(msg.join('\n'));
            if (orphan.length && d) { PPR47O.list = orphan; pprOrphan(); } else pprOpen();
        };
        var PPR47O = { list: [] };
        function pprOrphan() {
            const d = pprDB(), E = escapeHtml, O = PPR47O.list;
            mdl('pprAct', `<div class="px-h"><b>❓ Sarlavhasiz jadval</b><button class="mini-btn" onclick="mdlClose('pprAct'); pprOpen()">✕</button></div><div class="nd-tip">Faylda sarlavhasi yozilmagan jadval bor. Ilova uni oʻzicha biror boʻlimga qoʻymaydi — qaysi boʻlimga tegishli ekanini tanlang (yoki oʻtkazib yuboring).</div>
                ${O.map((o, i) => { const opts = d.secs.map((s, si) => [s, si]).filter(([s]) => s.kind === 'list' && s.place === (o.place || 'VX')); return `<div class="hs-box"><b>${E(pprMName(o.m))}</b> · ${E(o.file)}<br><small>Vagonlar: ${E(o.items.map(x => x.v).join(', '))}</small>${(o.place || 'VX') === 'VX' && d.secs.some(s => s.key === 'VX|60|DR') ? '<br><small class="pp-sug">💡 Taklif: «6VS-60 depo taʼmiri» (namunada shu joyda turadi, sentyabr spravkasida 6536, 824 — 6VS-60 depo taʼmiri). Tekshirib saqlang.</small>' : ''}${o.after ? `<br><small>«${E(PPR47_T[o.after] || o.after)}» jadvalidan keyin turgan</small>` : ''}<select data-i="${i}"><option value="">— oʻtkazib yuborish —</option>${opts.map(([s, si]) => `<option value="${si}"${s.key === 'VX|60|DR' && (o.place || 'VX') === 'VX' ? ' selected' : ''}>${E(PPR47_T[s.key] || s.title)}${pprList(d, o.m, si).length ? ' (hozir ' + pprList(d, o.m, si).length + ' ta)' : ''}</option>`).join('')}</select></div>`; }).join('')}
                <button class="action-btn" onclick="pprOrphanSave()">💾 Saqlash</button>`, true);
        }
        function pprOrphanSave() {
            const d = pprDB(); let n = 0;
            document.querySelectorAll('#pprAct select[data-i]').forEach(sel => { const o = PPR47O.list[+sel.dataset.i]; if (!o || sel.value === '') return; const si = +sel.value; pprMon(d, o.m)[si] = o.items.map(x => Object.assign({ v: x.v }, x.note ? { note: x.note } : {})); n += o.items.length;
                const pl = d.secs[si].place, F = d.mfmt && d.mfmt[pl], OO = F && F.orders && F.orders[o.m]; if (OO) { const q = OO.indexOf('?'); if (q >= 0 && OO.indexOf(d.secs[si].key) < 0) OO[q] = d.secs[si].key; }
                pprLog(d, 'Sarlavhasiz jadval (' + pprMName(o.m) + ', ' + o.items.length + ' ta vagon) «' + d.secs[si].title + '» boʻlimiga biriktirildi'); });
            if (d.mfmt) Object.values(d.mfmt).forEach(F => { Object.keys(F.orders || {}).forEach(k => { F.orders[k] = F.orders[k].filter(z => z !== '?'); }); });
            pprSave(d); PPR47O.list = []; mdlClose('pprAct'); if (n) showToast('✅ ' + n + ' ta vagon biriktirildi'); pprOpen();
        }

        (function () {
            pprKey = agmkExtend('pprKey', 'pprKey', pprKey, ok => function (t) { const k = ok.apply(this, arguments); return /\|x\|/.test(k) && /da[zs]ator|dozator|дозатор/i.test(String(t)) ? k.replace('|x|', '|hop|') : k; });
        })();
        // Oylik jadvalni o'qish: 3 xonali vagon raqamlari (862, 858, 029) ham olinadi; bo'sh katak (keyingi № raqami) tashlab ketiladi
        pprParseMonth = function (rows) {
            let month = null; const out = []; let cur = null; const hid = rows.__hid || null;
            for (let i = 0; i < rows.length; i++) {
                if (hid && hid.has(i)) continue; // Excel'da yashirilgan qator (masalan, bu oy uchun berkitilgan bo'lim)
                const r = (rows[i] || []).map(c => c === null || c === undefined ? '' : String(c).replace(/\s+/g, ' ').trim()), txt = r.join(' ');
                const mm = txt.toLowerCase().match(/(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentyabr|oktyabr|noyabr|dekabr)\s*(20\d{2})/); if (mm && !month) month = mm[2] + '-' + String(PPR_OY.indexOf(mm[1]) + 1).padStart(2, '0');
                const first = r.find(c => c) || '';
                if (/ta.?mir/i.test(first) && first.length > 20 && !/jadval/i.test(first)) { cur = { title: first, key: pprKey(first), items: [] }; out.push(cur); continue; }
                if (cur && /vagon raqami/i.test(txt)) { if (cur.items.length) { cur = { title: '', key: null, items: [] }; out.push(cur); } continue; }
                if (!cur) continue;
                for (let j = 0; j + 1 < r.length && j < 8; j++) {
                    if (!/^\d{1,3}\.?$/.test(r[j])) continue; const v = r[j + 1]; if (!v || v === '-') continue;
                    if (/^\d{1,3}\.?$/.test(v) && parseInt(v, 10) === parseInt(r[j], 10) + 1 && !/^0/.test(v)) continue;
                    const m2 = v.match(/^(.*?)(?:\s*-\s*(\d{1,3})%)?$/); out[out.length - 1].items.push({ v: m2[1].trim(), note: m2[2] ? m2[2] + '%' : '', n: parseInt(r[j], 10) }); j++;
                }
            }
            // Jadvalda raqamlar ustun bo'yicha (1..12 birinchi ustunda, 13..24 ikkinchisida) — tartib № bo'yicha tiklanadi
            out.forEach(s => { s.items = s.items.map((x, i) => [x, i]).sort((a, b) => (a[0].n - b[0].n) || (a[1] - b[1])).map(([x]) => { delete x.n; return x; }); });
            return month ? { month: month, secs: out } : null;
        };

