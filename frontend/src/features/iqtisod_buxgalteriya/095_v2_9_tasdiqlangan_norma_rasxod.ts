        // =====================================================================
        // v2.9 — 📐 TASDIQLANGAN NORMA RASXOD (МЕЪЁРИ / НОРМЫ)
        //  • Fayllar yuklanadi (o'zbekcha «Номланиши | Бирлиги | Миқдори» va ruscha «Наименование | Ед.изм | Кол-во»)
        //  • Turi (2VS-105, 6VS-60, xopper, sisterna, platforma, g'ildirak), taʼmir turi (KR/DR) va yili sarlavhadan aniqlanadi
        //  • Ilova ichida har bir qatorni tahrirlash (tarix bilan); qayta yuklashda farqlar ko'rsatiladi va tasdiq so'raladi
        //  • Hisobot tekshiruvida: spravkadagi miqdor normadan OSHMASLIGI kerak (kam bo'lsa — hech narsa qilinmaydi)
        //  • Nomi aniq mos kelmasa — 🔷 bir marta so'raladi, tanlangan moslik eslab qolinadi
        // =====================================================================
        var NRM_KEY = 'agmk_norm_v1';
        var NRM_KIND = { '105': '2VS-105', '60': '6VS-60', hop: 'Xopper-dozator', cis: 'Sisterna', plat: 'Platforma', wheel: 'Gʻildirak juftligi', kj20: 'KJ-20 (gʻildirak)', '': 'Boshqa' };
        var NRM_RT = { KR: 'Kapital taʼmir', DR: 'Depo taʼmiri', FORM: 'Formirovka', FULL: 'Toʻliq taʼmir', SHORT: 'Qisqartirilgan taʼmir', '': '—' };
        function nrmDB() { const d = kvGet(NRM_KEY, null); return d && d.sets ? d : { sets: [], map: {}, log: [] }; }
        function nrmSaveDB(d) { return kvSet(NRM_KEY, d); }
        function nrmCanEdit() { try { return isAdmin() || hsCan(); } catch (e) { return false; } }
        function nrmKind(t) { t = hpLow(t); if (/кж-?\s*20/.test(t)) return 'kj20'; if (/ғилдирак|гилдирак|колесн/.test(t)) return 'wheel'; if (/2\s*вс\s*-?\s*105|2\s*vs\s*-?\s*105|q\s*-?\s*115/.test(t)) return '105'; if (/6\s*вс\s*-?\s*60|6\s*vs\s*-?\s*60/.test(t)) return '60'; if (/хоп|дозатор|xop/.test(t)) return 'hop'; if (/цистерн|sistern/.test(t)) return 'cis'; if (/платформ|platform/.test(t)) return 'plat'; if (/думпкар|самосвал/.test(t)) return '105'; return ''; }
        function nrmRt(t) { t = hpLow(t); if (/капитал/.test(t)) return 'KR'; if (/деповск|депо\s+таъмир|депо\s+ремонт/.test(t)) return 'DR'; if (/формировк/.test(t)) return 'FORM'; if (/тулиқ|тўлиқ|полн/.test(t)) return 'FULL'; if (/қиқартир|қисқартир|обыкновен/.test(t)) return 'SHORT'; return ''; }
        function nrmYear(t) { const m = String(t).match(/(20\d{2})\s*й(?:ил|\.)/i) || String(t).match(/на\s*(20\d{2})\s*год/i); return m ? +m[1] : null; }
        function nrmUnitK(u) { u = hpLow(u).replace(/[.\s]/g, ''); if (/^(шт|штук|дона|dona|ед)/.test(u)) return 'pc'; if (/^кг/.test(u)) return 'kg'; if (/^(т|тн|тонн)$/.test(u)) return 't'; if (/^(м3|м³|куб)/.test(u)) return 'm3'; if (/^(м2|м²|кв)/.test(u)) return 'm2'; if (/^(л|литр)/.test(u)) return 'l'; if (/^(компл|жамланма|комплект|к-т)/.test(u)) return 'set'; if (/^пар/.test(u)) return 'pair'; if (/^(м|метр|пм|пог)/.test(u)) return 'm'; return u; }
        // Norma chegarasi (spravka birligida). "5/0,6-1" (dona/kg) → kg bo'lsa 1; oraliq bo'lsa — eng katta qiymat
        function nrmLim(it, unit) {
            const us = String(it.unit || '').split('/').map(nrmUnitK), parts = String(it.q === undefined ? '' : it.q).split('/'), want = nrmUnitK(unit);
            const num = s => { const L = (String(s).replace(/,/g, '.').match(/\d+(?:\.\d+)?/g) || []).map(Number); return L.length ? Math.max(...L) : null; };
            let idx = us.indexOf(want), conv = 1;
            if (idx < 0 && want === 't' && us.indexOf('kg') >= 0) { idx = us.indexOf('kg'); conv = 0.001; }
            if (idx < 0 && want === 'kg' && us.indexOf('t') >= 0) { idx = us.indexOf('t'); conv = 1000; }
            if (idx < 0) return null;
            const p = parts.length === 1 ? parts[0] : parts[idx]; if (p === undefined) return null; const n = num(p); return n === null ? null : Math.round(n * conv * 1e6) / 1e6;
        }
        // ---------- Fayldan o'qish (bir varaqda bir nechta «МЕЪЁРИ» bo'lishi mumkin) ----------
        function nrmParseSheet(rows, file, sheet) {
            const H = [];
            for (let i = 0; i < rows.length; i++) { const r = rows[i] || []; const cN = hpFind(r, /^(номлан|наимен)/), cU = hpFind(r, /^(бирлиг|ед\.?\s*изм)/), cQ = hpFind(r, /^(ми[қк]дор|кол-?во)/); if (cN >= 0 && cU > cN && cQ > cU) H.push({ i: i, cN: cN, cU: cU, cQ: cQ }); }
            const sets = [];
            H.forEach((h, k) => {
                const start = k ? H[k - 1].i + 1 : 0, end = k + 1 < H.length ? H[k + 1].i : rows.length, tl = [];
                for (let j = h.i - 1; j >= start && tl.length < 6; j--) { const r = rows[j] || [], t = hpRowTxt(r); if (!t) continue; if (/тасдиқ|утвержд|муҳандис|инженер|_{3,}|бошлиғ|начальник/i.test(t)) break; if (hpN(r[h.cQ]) !== null && hpS(r[h.cN])) break; tl.unshift(t); }
                const title = tl.join(' ').replace(/\s+/g, ' ').trim(), items = []; let grp = '', alt = false, lastNo = '';
                for (let j = h.i + 1; j < end; j++) {
                    const r = rows[j] || [], t = hpRowTxt(r); if (/меъ[её]ри|^нормы/i.test(t)) break;
                    const no = h.cN > 0 ? hpS(r[h.cN - 1]).replace(/\.$/, '') : '', name = hpS(r[h.cN]), unit = hpS(r[h.cU]), qv = r[h.cQ], q = qv === null || qv === undefined ? '' : String(qv).trim();
                    if (!name) continue;
                    if (!/\d/.test(q)) { if (/при\s+замене|допуска/i.test(name)) alt = true; else if (!unit) { grp = name.replace(/[:.]+$/, ''); alt = false; } continue; }
                    const isNo = /^\d+$/.test(no); if (isNo) { lastNo = no; alt = false; }
                    const isAlt = !isNo && (alt || /^(при\s+замене|или\b)/i.test(name));
                    const nm = name.replace(/^при\s+замене\s+на\s*/i, '').replace(/^или\s+/i, '').replace(/[…]+|\.{3,}/g, ' ').replace(/\s+/g, ' ').trim();
                    items.push({ no: isNo ? no : '', grp: grp, name: nm, unit: unit, q: q, alt: isAlt ? lastNo : '', r: j + 1 });
                }
                if (!items.length) return;
                sets.push({ title: title, kind: nrmKind(title), rt: nrmRt(title), year: nrmYear(title), file: file, sheet: sheet, items: items });
            });
            return sets;
        }
        function nrmSetKey(s) { return s.kind + '|' + s.rt + '|' + (s.year || '') + '|' + (s.kind === 'wheel' || s.kind === 'kj20' || !s.kind ? hpLow(s.title).replace(/[^а-яa-zўқғҳ0-9]+/g, ' ').slice(0, 90) : ''); }
        function nrmLabel(s) { return (NRM_KIND[s.kind] || s.kind || 'Boshqa') + ' · ' + (NRM_RT[s.rt] || s.rt || '—') + (s.year ? ' · ' + s.year : ''); }
        function nrmItemKey(it) { return hpLow(it.name).replace(/[^а-яa-z0-9ўқғҳ]+/g, ' ').trim() + '|' + (it.alt ? 'alt' : '') + '|' + hpUnit(it.unit); }
        // ---------- Nomlarni solishtirish ----------
        var NRM_STOP = new Set(['стал', 'новы', 'нова', 'ново', 'сбор', 'марк', 'гост', 'тип', 'типа', 'для', 'или', 'при', 'заме', 'шт', 'дона', 'мм']);
        // So'zlar (to'liq), qavs ichidagisiz asosiy so'zlar, raqamlar, oraliqlar (6-8), «spetsifikatsiya» raqamlari (oraliqlarsiz)
        function nrmToks(s) {
            let t = hpLow(s).replace(/к\s*\/\s*гайк/g, 'контргайк').replace(/контр[оа]?\s*[.\-]?\s*гайк/g, 'контргайк').replace(/\((?:нов|б\/у)[^)]*\)/g, ' ').replace(/б\/у/g, ' ');
            const main = t.replace(/\([^)]*\)/g, ' ');
            const rng = [], inR = new Set(); t.replace(/(\d+(?:[.,]\d{1,3}(?!\d))?)\s*-\s*(\d+(?:[.,]\d{1,3}(?!\d))?)/g, (m, a, b) => { const A = +a.replace(',', '.'), B = +b.replace(',', '.'); rng.push([A, B]); inR.add(String(A)); inR.add(String(B)); return m; });
            const n = (t.match(/\d+(?:[.,]\d{1,3}(?!\d))?/g) || []).map(x => String(+x.replace(',', '.')));
            const W = x => (x.match(/[а-яa-zўқғҳ]{3,}/g) || []).filter(z => !NRM_STOP.has(z.slice(0, 4)));
            const spec = Array.from(new Set(n.filter(x => !inR.has(x))));
            return { w: W(t), wm: W(main), n: n, rng: rng, spec: spec, rn: rng.length };
        }
        function nrmWm(a, b) { const p = hpPre(a, b); return p >= 3 && p >= Math.min(4, a.length, b.length); }
        // null — mos emas; {s, strong, weak, exact}
        function nrmScore(A, B) {
            if (!A.w.length || !B.w.length) return null;
            const inB = a => B.w.some(b => nrmWm(a, b)), inA = b => A.w.some(a => nrmWm(a, b));
            const first = nrmWm(A.w[0], B.wm[0] || B.w[0]);
            const reord = A.w.every(inB) && B.wm.length > 0 && B.wm.every(inA);
            if (!first && !reord) return null;
            if (!A.w.every(inB) && A.w.filter(inB).length < Math.ceil(A.w.length * 0.5)) return null;
            const inNum = x => B.n.indexOf(x) >= 0 || B.rng.some(([lo, hi]) => +x >= Math.min(lo, hi) && +x <= Math.max(lo, hi));
            let weak = false;
            if (A.n.length) {
                if (!B.n.length) weak = true;
                else if (B.spec.length + B.rn <= 1) { if (!inNum(A.n[0])) return null; }
                else if (!A.n.every(inNum)) return null;
            }
            const exact = reord && A.n.length === B.n.length && A.n.every(x => B.n.indexOf(x) >= 0);
            let ws = 0; A.w.forEach(a => { let m = 0; B.w.forEach(b => { if (nrmWm(a, b)) m = Math.max(m, hpPre(a, b)); }); ws += m; });
            const nn = A.n.filter(x => B.n.indexOf(x) >= 0).length;
            return { s: (exact ? 100 : 0) + (first ? 20 : 0) + nn * 5 + ws - (B.wm.length - B.wm.filter(inA).length) * 0.5 - (weak ? 30 : 0), strong: first || reord, weak: weak, exact: exact };
        }
        function nrmMapKey(kind, rt, name, unit) { return kind + '|' + rt + '|' + hpLow(name).replace(/[^а-яa-z0-9ўқғҳ]+/g, ' ').trim() + '|' + nrmUnitK(unit); }
        // bitta spravka nomi uchun norma qatori: {it, lim, how} | {none} | {amb:[...]} | {nounit:[...]} | null
        //  Avtomatik faqat: bitta aniq mos qator bo'lsa (yoki bir nechtadan faqat bittasi to'liq bir xil). Aks holda — so'raladi.
        function nrmMatch(set, name, unit, db) {
            db = db || nrmDB(); const mk = nrmMapKey(set.kind, set.rt, name, unit), mp = db.map[mk];
            if (mp) { if (mp.none) return { none: true, how: 'map' }; const L = set.items.filter(x => x.name === mp.n && (x.alt ? 'a' : '') === (mp.alt ? 'a' : '')); if (L.length) { const lims = L.map(x => nrmLim(x, unit)).filter(x => x !== null); if (lims.length) return { it: L[0], lim: Math.round(lims.reduce((a, b) => a + b, 0) * 1e6) / 1e6, how: 'map', n: L.length }; } }
            const A = nrmToks(name); const sc = [];
            set.items.forEach(x => { const r = nrmScore(A, nrmToks(x.name)); if (!r) return; sc.push(Object.assign({ x: x, lim: nrmLim(x, unit) }, r)); });
            const ok = sc.filter(z => z.lim !== null);
            if (!ok.length) return sc.length ? { nounit: sc.sort((a, b) => b.s - a.s).slice(0, 3) } : null;
            const g = {}; ok.forEach(z => { const k = hpLow(z.x.name) + '|' + (z.x.alt ? 'a' : ''); if (!g[k]) g[k] = { x: z.x, s: z.s, lim: 0, n: 0, weak: z.weak, exact: z.exact }; g[k].lim += z.lim; g[k].n++; g[k].s = Math.max(g[k].s, z.s); });
            const G = Object.values(g).sort((a, b) => b.s - a.s), strong = G.filter(z => !z.weak), ex = G.filter(z => z.exact);
            const pick = strong.length === 1 ? strong[0] : ex.length === 1 ? ex[0] : null;
            if (pick) return { it: pick.x, lim: Math.round(pick.lim * 1e6) / 1e6, how: 'auto', n: pick.n };
            return { amb: G.slice(0, 6) };
        }
        function nrmPick(db, kind, rt, year) {
            const L = db.sets.filter(s => s.kind === kind && s.rt === rt && !s.off); if (!L.length) return null;
            const ex = L.filter(s => s.year === year); if (ex.length) return ex[ex.length - 1];
            const le = L.filter(s => s.year && year && s.year < year).sort((a, b) => b.year - a.year); return le[0] || L.slice().sort((a, b) => (b.year || 0) - (a.year || 0))[0];
        }
        // ---------- Bir spravka bloki bo'yicha tekshiruv ----------
        function nrmEval(nm, db) {
            db = db || nrmDB(); const set = db.sets.find(s => s.id === nm.setId) || nrmPick(db, nm.kind, nm.rt, nm.year); const out = [], un = [];
            if (!set) return { F: [], un: [] };
            const lab = nrmLabel(set) + (nm.year && set.year && set.year !== nm.year ? ' — ⚠️ ' + nm.year + '-yil normasi yoʻq, ' + set.year + '-yilniki olindi' : '');
            nm.items.forEach(it => {
                const r = nrmMatch(set, it.name, it.unit, db);
                if (!r || r.amb || r.nounit) { un.push(Object.assign({}, it, { why: !r ? 'yoʻq' : r.amb ? 'bir nechta' : 'birlik' })); return; }
                if (r.none) { if ((it.fakt || 0) > 0) out.push({ t: 'nrmnone', lvl: 'blue', name: it.name, msg: 'Tasdiqlangan normada (' + lab + ') bu material yoʻq (moslashtirishda «Normada yoʻq» deb belgilangan), lekin Факт ' + hpF(it.fakt) + ' ' + (it.unit || '') + ' chiqarilgan.', src: [it.src] }); return; }
                const nmName = '«' + r.it.name + '»' + (r.it.alt ? ' (almashtirish varianti)' : '') + (r.n > 1 ? ' (' + r.n + ' qator yigʻindisi)' : '') + ' — ' + hpF(r.lim, 3) + ' ' + (it.unit || '');
                if (it.n1 !== null && it.n1 !== undefined && it.n1 > r.lim + 1e-9) out.push({ t: 'nrm1', lvl: (it.fakt || 0) > 0 ? 'red' : 'blue', name: it.name, msg: 'Spravkada 1 birlik uchun ' + hpF(it.n1, 3) + ' ' + (it.unit || '') + ' yozilgan, tasdiqlangan norma (' + lab + ') ' + nmName + '. Normadan ' + hpF(it.n1 - r.lim, 3) + ' koʻp' + ((it.fakt || 0) > 0 ? '.' : ' (Факт boʻsh — pulga taʼsiri yoʻq, lekin hujjatdagi norma notoʻgʻri).'), src: [it.src] });
                const lim = r.lim * nm.N;
                if ((it.fakt || 0) > 0 && it.fakt > lim + 1e-9) out.push({ t: 'nrmf', lvl: 'red', name: it.name, msg: 'Normadan oshgan: Факт ' + hpF(it.fakt, 3) + ' ' + (it.unit || '') + ' > tasdiqlangan norma ' + hpF(r.lim, 3) + ' × ' + nm.N + ' = ' + hpF(lim, 3) + ' (' + lab + ', ' + nmName + '). Ortiqcha: ' + hpF(it.fakt - lim, 3) + ' ' + (it.unit || '') + '.', src: [it.src] });
            });
            if (un.length) out.push({ t: 'nrmmap', lvl: 'blue', name: 'Normaga moslashtirish kerak (' + un.length + ')', msg: 'Tasdiqlangan normada (' + lab + ') quyidagi nomlar aniq topilmadi yoki bir nechta mos qator bor: ' + un.slice(0, 12).map(x => '«' + x.name + '»' + (x.why === 'birlik' ? ' (birligi farq qiladi: ' + (x.unit || '—') + ')' : '')).join(', ') + (un.length > 12 ? ' va yana ' + (un.length - 12) + ' ta' : '') + '. «🔗 Moslashtirish» tugmasi bilan bir marta bogʻlang — ilova eslab qoladi va keyingi tekshiruvlarda oʻzi solishtiradi.', src: un.slice(0, 20).map(x => x.src), nmu: 1 });
            return { F: out, un: un, set: set };
        }
        // hpCheck natijasiga qo'shish
        function nrmCheckPkg(pkg, res) {
            const db = nrmDB(); if (!db.sets.length) return;
            const F = res.findings, M = pkg.month || '', seen = {};
            const blocks = []; pkg.sheets.filter(x => x.type === 'spr' && x.data).forEach(x => x.data.forEach(b => blocks.push(b)));
            blocks.filter(b => !M || !b.month || b.month === M).forEach((b, bi) => {
                const kind = nrmKind(b.title + ' ' + b.obj), rt = b.rtype, year = +((b.month || M || '').slice(0, 4)) || null;
                const sec = (b.rtype === 'KR' ? 'Kapital taʼmir' : b.rtype === 'DR' ? 'Depo taʼmiri' : 'Taʼmir') + (b.obj ? ' ' + b.obj : '') + (b.wagons.length ? ' (' + (b.wagons.length > 3 ? b.wagons.length + ' ta vagon' : '№ ' + b.wagons.join(', ')) + ')' : '') + (b.monthTxt ? ' · ' + b.monthTxt : '');
                if (!kind || !rt) return;
                const set = nrmPick(db, kind, rt, year);
                if (!set) { const k = kind + rt; if (!seen[k]) { seen[k] = 1; F.push({ id: 'nr' + F.length, st: '', t: 'nrmnoset', lvl: 'info', sec: sec, name: 'Tasdiqlangan norma yoʻq', msg: (NRM_KIND[kind] || kind) + ' · ' + (NRM_RT[rt] || rt) + ' uchun tasdiqlangan norma yuklanmagan — «📐 Tasdiqlangan normalar» boʻlimida yuklang.', src: [b.src] }); } return; }
                const N = b.C && b.C.nN >= 0 ? Math.max(b.N || 1, b.wagons.length || 0) : Math.max(1, b.wagons.length || 0);
                const nm = { k: 'b' + bi + '|' + (b.src.f || '') + '|' + (b.src.s || '') + '|' + b.src.r, kind: kind, rt: rt, year: year, setId: set.id, N: N, sec: sec, items: b.items.filter(it => (it.n1 !== null && it.n1 !== undefined) || (it.fakt || 0) > 0).map(it => ({ name: it.name, unit: it.unit, n1: it.n1, fakt: it.fakt, src: it.src })) };
                const r = nrmEval(nm, db);
                r.F.forEach(f => { f.id = 'nr' + F.length; f.st = ''; f.sec = sec; f.nmk = nm.k; if (f.nmu) f.nm = nm; F.push(f); });
            });
            const ord = { red: 0, blue: 1, info: 2 }; F.sort((a, b) => ord[a.lvl] - ord[b.lvl]);
        }
        // ---------- Moslashtirish (tekshiruv natijasidan) ----------
        async function nrmMapOpen(fid) {
            const d = HS.data, f = d && d.findings.find(z => z.id === fid); if (!f || !f.nm) return; const db = nrmDB(), set = db.sets.find(s => s.id === f.nm.setId) || nrmPick(db, f.nm.kind, f.nm.rt, f.nm.year); if (!set) { alert('Norma topilmadi'); return; }
            const E = escapeHtml, un = nrmEval(f.nm, db).un;
            const opts = (it) => { const A = nrmToks(it.name); const sc = set.items.map((x, i) => { const r = nrmScore(A, nrmToks(x.name)); return { x: x, i: i, s: r ? r.s : null }; }); const top = sc.filter(z => z.s !== null).sort((a, b) => b.s - a.s); it.sug = top.length ? top[0].i : null; const rest = sc.filter(z => z.s === null).sort((a, b) => a.x.name.localeCompare(b.x.name)); return `<option value="">— tanlang —</option><option value="none">❌ Normada yoʻq</option>` + (top.length ? '<optgroup label="Oʻxshashlari">' + top.map((z, q) => `<option value="${z.i}"${q === 0 ? ' selected' : ''}>${E(z.x.name)}${z.x.alt ? ' (almashtirish)' : ''} — ${E(z.x.q)} ${E(z.x.unit)}</option>`).join('') + '</optgroup>' : '') + '<optgroup label="Barchasi">' + rest.map(z => `<option value="${z.i}">${E(z.x.name)}${z.x.alt ? ' (almashtirish)' : ''} — ${E(z.x.q)} ${E(z.x.unit)}</option>`).join('') + '</optgroup>'; };
            NRMV.fid = fid; NRMV.un = un; NRMV.setId = set.id;
            mdl('nrmMap', `<div class="px-h"><b>🔗 Normaga moslashtirish</b><button class="mini-btn" onclick="mdlClose('nrmMap')">✕</button></div><div class="nd-tip">${E(nrmLabel(set))} · ${E(set.file || '')}<br>Har bir spravka nomi uchun tasdiqlangan normadagi qatorni tanlang. Tanlov eslab qolinadi (keyingi oylarda soʻralmaydi). Bilmasangiz — boʻsh qoldiring.</div>
                <div class="nr-map">${un.map((it, k) => `<div class="nr-mrow"><div><b>${E(it.name)}</b> <small>${E(it.unit || '')} · 1 birlik: ${it.n1 === null || it.n1 === undefined ? '—' : hpF(it.n1, 3)} · Факт: ${it.fakt === null || it.fakt === undefined ? '—' : hpF(it.fakt, 3)}</small></div><select data-k="${k}">${opts(it)}</select>${it.sug !== null && it.sug !== undefined ? '<small class="nr-sg">💡 eng oʻxshashi tanlangan — tekshirib saqlang</small>' : ''}</div>`).join('') || '<div class="xt-empty">Hammasi moslashtirilgan</div>'}</div>
                <button class="action-btn" onclick="nrmMapSave()">💾 Saqlash va qayta solishtirish</button>`, true);
        }
        var NRMV = {};
        async function nrmMapSave() {
            const db = nrmDB(), set = db.sets.find(s => s.id === NRMV.setId); if (!set) return; let n = 0;
            document.querySelectorAll('#nrmMap select[data-k]').forEach(sel => { const it = NRMV.un[+sel.dataset.k], v = sel.value; if (!it || !v) return; const mk = nrmMapKey(set.kind, set.rt, it.name, it.unit); if (v === 'none') db.map[mk] = { none: 1, by: authorStr(), at: new Date().toISOString() }; else { const x = set.items[+v]; db.map[mk] = { n: x.name, alt: x.alt ? 1 : 0, by: authorStr(), at: new Date().toISOString() }; } n++; });
            if (!n) { mdlClose('nrmMap'); return; }
            db.log = (db.log || []).concat([{ at: new Date().toISOString(), by: authorStr(), a: n + ' ta nom normaga moslashtirildi (' + nrmLabel(set) + ')' }]).slice(-300);
            nrmSaveDB(db); mdlClose('nrmMap'); await nrmRecheck(NRMV.fid); showToast('🔗 ' + n + ' ta moslik saqlandi');
        }
        async function nrmRecheck(fid) {
            const x = hsRec(HS.chk), d = HS.data; if (!x || !d) return; const f = d.findings.find(z => z.id === fid); if (!f || !f.nm) return;
            const nm = f.nm, keep = d.findings.filter(z => !(z.nmk === nm.k && /^nrm/.test(z.t))), r = nrmEval(nm, nrmDB());
            let c = 0; r.F.forEach(z => { z.id = 'nq' + Date.now().toString(36) + (c++); z.st = ''; z.sec = nm.sec; z.nmk = nm.k; if (z.nmu) z.nm = nm; keep.push(z); });
            const ord = { red: 0, blue: 1, info: 2 }; keep.sort((a, b) => ord[a.lvl] - ord[b.lvl]); d.findings = keep; await hsJsonSave(x.dref, d);
            const all = hsChecks(), rr = all.find(z => z.id === x.id); if (rr) { rr.red = keep.filter(z => z.lvl === 'red').length; rr.blue = keep.filter(z => z.lvl === 'blue').length; rr.sum = Math.round(keep.filter(z => z.lvl === 'red' && z.diff).reduce((a, z) => a + Math.abs(z.diff), 0)); hsLog(rr, 'Normaga moslashtirildi va qayta solishtirildi: ' + nm.sec); kvSet(HS_CHK_KEY, all); }
            try { hsChkLoad(); } catch (e) {}
        }
        // ---------- Normalar bo'limi (yuklash, ko'rish, tahrirlash, tarix) ----------
        var NRMU = { pend: null, q: '' };
        function nrmOpen() {
            const db = nrmDB(), E = escapeHtml, can = nrmCanEdit();
            const L = db.sets.slice().sort((a, b) => (a.kind + a.rt).localeCompare(b.kind + b.rt) || (b.year || 0) - (a.year || 0));
            mdl('nrmModal', `<div class="px-h"><b>📐 Tasdiqlangan normalar (norma rasxod)</b><button class="mini-btn" onclick="mdlClose('nrmModal')">✕</button></div>
                <div class="nd-tip">Hisobot tekshiruvida spravkadagi miqdor shu normalar bilan solishtiriladi: <b>normadan oshsa — ❌</b>, kam boʻlsa — hech narsa. Norma tur (2VS-105, 6VS-60, xopper…), taʼmir turi (KR/DR) va yil boʻyicha oʻzi tanlanadi.</div>
                ${can ? `<label class="alb-btn cam">📂 Norma fayllarini yuklash (bir nechta)<input type="file" multiple accept=".xls,.xlsx" style="display:none" onchange="nrmImport(this)"></label>` : ''}
                <div class="hs-list">${L.map(s => `<div class="hs-row nr-set${s.off ? ' off' : ''}" onclick="nrmView('${s.id}')"><b>${E(nrmLabel(s))}${s.off ? ' · oʻchirilgan' : ''}</b><small>${E(s.title.slice(0, 140))}</small><small>📄 ${E(s.file || '')} · ${s.items.length} qator · v${s.ver || 1} · ${E(new Date(s.at).toLocaleDateString())} · ${E(s.by || '')}</small></div>`).join('') || '<div class="xt-empty">Hali norma yuklanmagan.</div>'}</div>
                <div class="nv-btns"><button onclick="nrmMaps()">🔗 Moslashtirishlar (${Object.keys(db.map || {}).length})</button><button onclick="nrmLog()">📜 Jurnal</button></div>`, true);
        }
        async function nrmImport(inp) {
            const files = [...(inp.files || [])]; inp.value = ''; if (!files.length) return; showToast('⏳ Oʻqilmoqda...');
            const found = [], bad = [];
            for (const f of files) { let bk; try { bk = await hpReadBook(f); } catch (e) { bad.push(f.name + ': ' + agmkErrUz(e)); continue; } let n = 0; bk.forEach(sh => nrmParseSheet(sh.rows, f.name, sh.s).forEach(s => { found.push(s); n++; })); if (!n) bad.push(f.name + ': norma jadvali topilmadi'); }
            // har bir (tur, taʼmir, fayl) uchun eng yangi yil — tanlangan holda
            const best = {}; found.forEach((s, i) => { const k = s.file + '|' + s.kind + '|' + s.rt + '|' + (s.kind === 'wheel' || s.kind === 'kj20' ? s.title : ''); if (!best[k] || (s.year || 0) > (found[best[k]].year || 0)) best[k] = i; });
            const db = nrmDB(); found.forEach((s, i) => { s.sel = Object.values(best).indexOf(i) >= 0 && !!s.year; const old = db.sets.find(z => nrmSetKey(z) === nrmSetKey(s)); s.old = old ? old.id : ''; if (old) s.diff = nrmDiff(old.items, s.items); });
            NRMU.pend = found; const E = escapeHtml;
            mdl('nrmImp', `<div class="px-h"><b>📂 Topilgan normalar (${found.length})</b><button class="mini-btn" onclick="mdlClose('nrmImp')">✕</button></div>${bad.length ? `<div class="hp-warn">${bad.map(E).join('<br>')}</div>` : ''}
                <div class="nd-tip">Saqlanadiganlarini belgilang. Bazada bor normaga oʻxshasa — farqlari koʻrsatiladi, tasdiqlasangiz yangilanadi (eski versiya tarixda qoladi).</div>
                <div class="nr-imp">${found.map((s, i) => `<label class="nr-irow"><input type="checkbox" data-i="${i}" ${s.sel ? 'checked' : ''}><div><b>${E(nrmLabel(s))}</b><small>${E(s.title.slice(0, 160))}</small><small>📄 ${E(s.file)} › ${E(s.sheet)} · ${s.items.length} qator</small>${s.old ? `<small class="nr-d">${s.diff.same ? '✅ bazadagisi bilan bir xil' : `♻️ bazada bor: ${s.diff.ch.length} ta oʻzgargan, ${s.diff.add.length} ta yangi, ${s.diff.del.length} ta olib tashlangan`}</small>${s.diff.same ? '' : `<details><summary>Farqlar</summary>${nrmDiffHtml(s.diff)}</details>`}` : '<small class="nr-d">🆕 yangi</small>'}${!s.kind || !s.rt ? '<small class="hs-r">⚠️ turi yoki taʼmir turi aniqlanmadi — tekshiruvda avtomatik tanlanmaydi</small>' : ''}</div></label>`).join('')}</div>
                <button class="action-btn" onclick="nrmImportSave()">✅ Tasdiqlash va saqlash</button>`, true);
        }
        function nrmDiff(A, B) { const ka = {}, kb = {}; A.forEach(x => ka[nrmItemKey(x)] = x); B.forEach(x => kb[nrmItemKey(x)] = x); const ch = [], add = [], del = []; Object.keys(kb).forEach(k => { if (!ka[k]) add.push(kb[k]); else if (String(ka[k].q) !== String(kb[k].q)) ch.push([ka[k], kb[k]]); }); Object.keys(ka).forEach(k => { if (!kb[k]) del.push(ka[k]); }); return { ch: ch, add: add, del: del, same: !ch.length && !add.length && !del.length }; }
        function nrmDiffHtml(D) { const E = escapeHtml; return `<div class="nr-diff">${D.ch.slice(0, 60).map(([a, b]) => `<div>✏️ ${E(a.name)}: <s>${E(a.q)}</s> → <b>${E(b.q)}</b> ${E(b.unit)}</div>`).join('')}${D.add.slice(0, 60).map(b => `<div>➕ ${E(b.name)} — ${E(b.q)} ${E(b.unit)}</div>`).join('')}${D.del.slice(0, 60).map(a => `<div>➖ ${E(a.name)} — ${E(a.q)} ${E(a.unit)}</div>`).join('')}</div>`; }
        async function nrmImportSave() {
            if (!nrmCanEdit()) return; const P = NRMU.pend || [], sel = [...document.querySelectorAll('#nrmImp input[data-i]:checked')].map(c => P[+c.dataset.i]).filter(Boolean);
            if (!sel.length) { mdlClose('nrmImp'); return; }
            const chg = sel.filter(s => s.old && !s.diff.same);
            if (chg.length && !(await uiConfirm(chg.length + ' ta norma bazadagisidan farq qiladi (' + chg.map(s => nrmLabel(s) + ': ' + s.diff.ch.length + ' oʻzgargan, +' + s.diff.add.length + ', −' + s.diff.del.length).join('; ') + ').\n\nYangi versiya bilan almashtirilsinmi? Eski versiya tarixda saqlanadi.'))) return;
            const db = nrmDB(), now = new Date().toISOString(), by = authorStr(); let nNew = 0, nUp = 0;
            sel.forEach(s => {
                const items = s.items.map(x => ({ no: x.no, grp: x.grp, name: x.name, unit: x.unit, q: x.q, alt: x.alt, r: x.r }));
                const old = s.old && db.sets.find(z => z.id === s.old);
                if (old) { if (s.diff.same) return; old.versions = (old.versions || []).concat([{ at: old.upd || old.at, by: old.by, file: old.file, ver: old.ver || 1, items: old.items }]).slice(-2); old.items = items; old.file = s.file; old.sheet = s.sheet; old.title = s.title; old.ver = (old.ver || 1) + 1; old.upd = now; old.by = by; old.hist = (old.hist || []).concat([{ at: now, by: by, a: 'Qayta yuklandi (' + s.file + '): ' + s.diff.ch.length + ' oʻzgargan, +' + s.diff.add.length + ', −' + s.diff.del.length }]); nUp++; }
                else { db.sets.push({ id: 'nr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), title: s.title, kind: s.kind, rt: s.rt, year: s.year, file: s.file, sheet: s.sheet, items: items, at: now, by: by, ver: 1, hist: [{ at: now, by: by, a: 'Yuklandi: ' + s.file + ' › ' + s.sheet + ' (' + items.length + ' qator)' }] }); nNew++; }
            });
            db.log = (db.log || []).concat([{ at: now, by: by, a: 'Normalar: ' + nNew + ' ta yangi, ' + nUp + ' ta yangilandi' }]).slice(-300);
            if (!nrmSaveDB(db)) return; try { aiLog('Tasdiqlangan normalar yuklandi: ' + nNew + ' yangi, ' + nUp + ' yangilandi'); } catch (e) {}
            NRMU.pend = null; mdlClose('nrmImp'); showToast('📐 ' + nNew + ' ta yangi, ' + nUp + ' ta yangilandi'); nrmOpen();
        }
        function nrmView(id, q) {
            const db = nrmDB(), s = db.sets.find(z => z.id === id), E = escapeHtml, can = nrmCanEdit(); if (!s) return; NRMU.q = q !== undefined ? q : (NRMU.id === id ? NRMU.q : ''); NRMU.id = id;
            const ql = hpLow(NRMU.q); let g = '';
            const rows = s.items.map((x, i) => [x, i]).filter(([x]) => !ql || hpLow(x.name).indexOf(ql) >= 0).map(([x, i]) => { const gh = x.grp !== g ? (g = x.grp, `<div class="nr-g">${E(x.grp || '')}</div>`) : ''; return gh + `<div class="nr-it${x.alt ? ' alt' : ''}${x.ed ? ' ed' : ''}"><span>${E(x.no || (x.alt ? '↳' : ''))}</span><b>${E(x.name)}</b><i>${E(x.unit)}</i><em ${can ? `onclick="nrmEditQ('${id}',${i})"` : ''}>${E(x.q)}${can ? ' ✏️' : ''}</em></div>`; }).join('');
            mdl('nrmModal', `<div class="px-h"><b>📐 ${E(nrmLabel(s))}</b><button class="mini-btn" onclick="nrmOpen()">‹</button></div><div class="nd-tip">${E(s.title)}<br>📄 ${E(s.file)} › ${E(s.sheet || '')} · v${s.ver || 1}</div>
                <input class="nr-q" placeholder="🔎 Qidirish (nomi)" value="${E(NRMU.q)}" oninput="NRMU.q=this.value; clearTimeout(NRMU.t); NRMU.t=setTimeout(()=>{ const p=this.selectionStart; nrmView('${id}'); const i=document.querySelector('#nrmModal .nr-q'); if(i){ i.focus(); try{ i.setSelectionRange(p,p);}catch(e){} } },250)">
                <div class="nr-list">${rows || '<div class="xt-empty">Topilmadi</div>'}</div>
                <div class="nv-btns"><button onclick="nrmHist('${id}')">📜 Tarix (${(s.hist || []).length})</button>${can ? `<button onclick="nrmToggle('${id}')">${s.off ? '✅ Yoqish' : '⏸ Tekshiruvdan chiqarish'}</button>` : ''}${isAdmin() ? `<button class="danger" onclick="nrmDel('${id}')">🗑 Oʻchirish</button>` : ''}</div>`, true);
        }
        async function nrmEditQ(id, i) {
            if (!nrmCanEdit()) return; const db = nrmDB(), s = db.sets.find(z => z.id === id); if (!s || !s.items[i]) return; const x = s.items[i];
            const v = await uiPrompt('«' + x.name + '» (' + x.unit + ') — yangi miqdor.\nHozir: ' + x.q + '\n(Bir nechta birlik boʻlsa «/» bilan: masalan 8/0,39)', x.q); if (v === null || v === undefined) return; const nv = String(v).trim(); if (!nv || nv === String(x.q)) return;
            if (!/\d/.test(nv)) { alert('Miqdor raqam boʻlishi kerak'); return; }
            const why = await uiPrompt('Oʻzgartirish sababi (masalan buyruq raqami) — ixtiyoriy', ''); const now = new Date().toISOString();
            s.hist = (s.hist || []).concat([{ at: now, by: authorStr(), a: '«' + x.name + '»: ' + x.q + ' → ' + nv + ' ' + x.unit + (why ? ' (' + why + ')' : '') }]); x.q = nv; x.ed = 1; s.ver = (s.ver || 1) + 1; s.upd = now;
            if (nrmSaveDB(db)) { showToast('✅ Saqlandi'); nrmView(id); }
        }
        function nrmHist(id) { const s = nrmDB().sets.find(z => z.id === id), E = escapeHtml; if (!s) return; mdl('nrmImp', `<div class="px-h"><b>📜 ${E(nrmLabel(s))} — tarix</b><button class="mini-btn" onclick="mdlClose('nrmImp')">✕</button></div><div class="hs-list">${(s.hist || []).slice().reverse().map(h => `<div class="hs-row"><b>${E(h.a)}</b><small>🕒 ${E(new Date(h.at).toLocaleString())} · 👤 ${E(h.by || '')}</small></div>`).join('')}${(s.versions || []).slice().reverse().map(v => `<div class="hs-row"><b>Oldingi versiya v${v.ver} (${v.items.length} qator)</b><small>📄 ${E(v.file || '')} · ${E(new Date(v.at).toLocaleString())}</small></div>`).join('')}</div>`, true); }
        async function nrmToggle(id) { const db = nrmDB(), s = db.sets.find(z => z.id === id); if (!s) return; s.off = !s.off; s.hist = (s.hist || []).concat([{ at: new Date().toISOString(), by: authorStr(), a: s.off ? 'Tekshiruvdan chiqarildi' : 'Tekshiruvga qaytarildi' }]); nrmSaveDB(db); nrmView(id); }
        async function nrmDel(id) { if (!isAdmin()) return; const db = nrmDB(), s = db.sets.find(z => z.id === id); if (!s || !(await uiConfirm('«' + nrmLabel(s) + '» normasi butunlay oʻchirilsinmi?'))) return; db.sets = db.sets.filter(z => z.id !== id); db.log = (db.log || []).concat([{ at: new Date().toISOString(), by: authorStr(), a: 'Oʻchirildi: ' + nrmLabel(s) + ' (' + s.file + ')' }]); nrmSaveDB(db); nrmOpen(); }
        function nrmMaps() { const db = nrmDB(), E = escapeHtml, K = Object.keys(db.map || {}); mdl('nrmImp', `<div class="px-h"><b>🔗 Moslashtirishlar (${K.length})</b><button class="mini-btn" onclick="mdlClose('nrmImp')">✕</button></div><div class="nd-tip">Spravkadagi nom → tasdiqlangan normadagi qator. Notoʻgʻrisini oʻchirsangiz, keyingi tekshiruvda yana soʻraladi.</div><div class="hs-list">${K.map(k => { const [kind, rt, nm, u] = k.split('|'), v = db.map[k]; return `<div class="hs-row"><b>${E(nm)} <small>(${E(u)})</small> → ${v.none ? '❌ Normada yoʻq' : E(v.n)}</b><small>${E((NRM_KIND[kind] || kind) + ' · ' + (NRM_RT[rt] || rt))} · ${E(v.by || '')}</small>${nrmCanEdit() ? `<button class="mini-btn" onclick="nrmMapDel(${E(JSON.stringify(k))})">🗑</button>` : ''}</div>`; }).join('') || '<div class="xt-empty">Yoʻq</div>'}</div>`, true); }
        function nrmMapDel(k) { const db = nrmDB(); delete db.map[k]; nrmSaveDB(db); nrmMaps(); }
        function nrmLog() { const db = nrmDB(), E = escapeHtml; mdl('nrmImp', `<div class="px-h"><b>📜 Normalar jurnali</b><button class="mini-btn" onclick="mdlClose('nrmImp')">✕</button></div><div class="hs-list">${(db.log || []).slice().reverse().map(h => `<div class="hs-row"><b>${E(h.a)}</b><small>🕒 ${E(new Date(h.at).toLocaleString())} · 👤 ${E(h.by || '')}</small></div>`).join('') || '<div class="xt-empty">Yoʻq</div>'}</div>`, true); }
        try { Object.assign(HELP, {
            norma: { t: '📐 Tasdiqlangan normalar', b: `<ol><li>Hisobotlar → Vagon → <b>«📐 Normalarni ochish»</b> → «📂 Norma fayllarini yuklash» — «МЕЪЁРИ» (Номланиши / Бирлиги / Миқдори) yoki «НОРМЫ» fayllarini birga tanlang.</li><li>Ilova turini (2VS-105, 6VS-60, xopper, sisterna, platforma, gʻildirak), taʼmir turini (KR/DR) va yilini sarlavhadan oʻzi aniqlaydi. Saqlashdan oldin roʻyxatni koʻrib tasdiqlaysiz.</li><li>Qatordagi miqdorni bosib tahrirlaysiz (sababi bilan) — hammasi «📜 Tarix» ga yoziladi. Qayta yuklansa — farqlar koʻrsatiladi va tasdiq soʻraladi.</li><li>Hisobot tekshiruvida: spravkadagi miqdor (1 birlik uchun va Факт) normadan <b>oshsa — ❌</b>, kam boʻlsa — hech narsa.</li><li>Nomi aniq mos kelmasa — «🔗 Moslashtirish»: bir marta tanlaysiz, ilova eslab qoladi.</li><li>Birlik «dona/kg» boʻlsa — spravkadagi birlikka qarab mos qiymat olinadi (masalan Болт М12: 5 dona yoki 1 kg).</li></ol>` } }); } catch (e) {}

