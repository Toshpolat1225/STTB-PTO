        // =====================================================================
        // v2.4 — OYLIK TO'PLAMNI TEKSHIRISH (bir xodimning bir oylik hujjatlari birga)
        // Zanjir: Дефектная ведомость (ВУ-22) → Требование → Forma-30 → Справка-расчет (Лимитка)
        //         → Нормы → Акт разбраковки металла → Наряд
        // Barcha hisob — formula bilan, telefonning o'zida. AI qatnashmaydi.
        // Har bir topilma: fayl › varaq › qator manbasi bilan. Oxirgi so'z — tekshiruvchi xodimda.
        // =====================================================================
        var HP_MON = { 'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'май': 5, 'мая': 5, 'июн': 6, 'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12,
            'yanvar': 1, 'fevral': 2, 'aprel': 4, 'iyun': 6, 'iyul': 7, 'avgust': 8, 'sentabr': 9, 'oktabr': 10, 'noyabr': 11, 'dekabr': 12 };
        function hpS(v) { return v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim(); }
        function hpN(v) {
            if (v === null || v === undefined || v === '') return null; if (typeof v === 'number') return isFinite(v) ? v : null;
            let s = String(v).replace(/[\s ]/g, ''); if (!/^-?[\d.,]+$/.test(s)) return null;
            if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
            else if (s.indexOf(',') >= 0) s = (s.match(/,/g).length > 1) ? s.replace(/,/g, '') : s.replace(',', '.');
            const n = parseFloat(s); return isFinite(n) ? n : null;
        }
        function hpR(n, d) { const k = Math.pow(10, d === undefined ? 2 : d); return Math.round((n || 0) * k) / k; }
        function hpF(n, d) {
            if (n === null || n === undefined || !isFinite(n)) return '—';
            const r = hpR(n, d === undefined ? 2 : d), neg = r < 0, a = Math.abs(r), i = Math.floor(a), fr = a - i;
            let s = String(i).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); if (fr > 1e-9) s += ',' + String(Math.round(fr * Math.pow(10, d === undefined ? 2 : d))).padStart(d === undefined ? 2 : d, '0').replace(/0+$/, '');
            return (neg ? '−' : '') + s;
        }
        function hpLow(s) { return hpS(s).toLowerCase().replace(/ё/g, 'е').replace(/сц/g, 'ц'); }
        function hpMonth(s) {
            const t = hpLow(s); const y = t.match(/(20\d{2})/); if (!y) return '';
            for (const k in HP_MON) if (t.indexOf(k) >= 0) return y[1] + '-' + String(HP_MON[k]).padStart(2, '0');
            const m = t.match(/(20\d{2})[\/.\-](\d{2})[\/.\-]\d{2}/); return m ? m[1] + '-' + m[2] : '';
        }
        function hpRowTxt(r) { return (r || []).map(hpS).filter(Boolean).join(' '); }
        function hpFind(r, re) { for (let j = 0; j < (r || []).length; j++) if (re.test(hpLow(r[j]))) return j; return -1; }
        function hpWag(s) { return String(s).replace(/^0+/, '') || '0'; }

        // ---------- Nomlarni solishtirish (bir talabnoma ichida) ----------
        var HP_STOP = new Set(['гост', 'сталь', 'стал', 'тип', 'для', 'марк', 'черт', 'сб']);
        function hpToks(s) {
            const t = hpLow(s).replace(/(\d),(\d)/g, '$1.$2');
            const w = (t.match(/[а-яa-z]{3,}/g) || []).filter(x => !HP_STOP.has(x.slice(0, 4)));
            const n = new Set((t.match(/\d+(?:\.\d+)?/g) || []).map(x => x.replace(/^0+(?=\d)/, '')));
            return { w: w, n: n };
        }
        function hpKey(s) { const T = hpToks(s); return T.w.map(x => x.slice(0, 4)).sort().join(' ') + '|' + [...T.n].sort().join(' '); }
        function hpUnit(u) { return hpLow(u).replace(/[.\s]/g, '').replace('м³', 'м3').replace('м²', 'м2'); }
        function hpPre(a, b) { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; }
        // 0 — mos emas; >0 — o'xshashlik bali
        function hpScore(a, b, ignoreNum) {
            const A = hpToks(a), B = hpToks(b); if (!A.w.length || !B.w.length) return 0;
            const a0 = A.w[0], ok = (x, y) => { const p = hpPre(x, y); return p >= Math.min(5, x.length, y.length) && p >= 3; };
            const strong = ok(a0, B.w[0]); let first = strong;
            if (!first) B.w.forEach(x => { if (ok(a0, x)) first = true; });
            let sh = 0; A.w.forEach(x => { if (B.w.some(y => hpPre(x, y) >= Math.min(5, x.length, y.length) && hpPre(x, y) >= 4)) sh++; });
            if (!first && sh < 2) return 0;
            let nn = 0; A.n.forEach(x => { if (B.n.has(x)) nn++; });
            if (!ignoreNum && A.n.size && B.n.size && !nn) return 0;
            const eq = A.n.size === B.n.size && nn === A.n.size ? 1 : 0;
            return (strong ? 5 : first ? 2 : 0) + sh * 2 + nn + eq;
        }

        // ---------- Varaq turini aniqlash ----------
        function hpClassify(rows) {
            const head = rows.slice(0, 60).map(hpRowTxt).join(' \n ').toLowerCase().replace(/ё/g, 'е');
            const all = rows.length > 60 ? rows.map(hpRowTxt).join(' \n ').toLowerCase() : head;
            if (/требование/.test(head) && /номенклатура/.test(head) && /количество/.test(head)) return 'f30';
            if (/справка.?расчет/.test(all) && /№\s*треб/.test(all)) return 'spr';
            if (/дефектная\s+ведомость/.test(head)) return 'dv';
            if (/разбраковк/.test(head) && /износ/.test(head)) return 'lom';
            if (/наряд/.test(head) && /норма на штуку/.test(head)) return 'nar';
            if (/нормы/.test(head) && /расхода/.test(head)) return 'norma';
            if (/наименование/.test(head) && /(ед\.?\s*изм)/.test(head) && /кол-?во/.test(head) && !/цена|сумма/.test(head)) return 'norma';
            if (/меъ[её]ри/.test(head) && /номлан/.test(head) && /бирлиг/.test(head)) return 'norma';
            return '';
        }
        var HP_TYPES = { f30: '📋 Forma-30 (ombor)', spr: '📑 Справка-расчет (Лимитка)', dv: '🔧 Дефектная ведомость (ВУ-22)', lom: '♻️ Акт разбраковки (metallolom)', nar: '👷 Наряд (ish haqi)', norma: '📐 Нормы расхода', '': '— tekshiruvga kirmaydi —' };

        // ---------- Forma-30 ----------
        function hpParseF30(rows, src) {
            let h = -1; for (let i = 0; i < Math.min(rows.length, 40); i++) { const t = hpRowTxt(rows[i]).toLowerCase(); if (/требование/.test(t) && /номенклатура/.test(t)) { h = i; break; } }
            if (h < 0) return null;
            const H = rows[h], c = re => hpFind(H, re);
            const C = { treb: c(/^требование/), nom: c(/номен\w*\s*номер/), name: c(/^номенклатура$/), unit: c(/ед\.?\s*изм/), sklad: c(/^склад/), schet: c(/^сч[её]т/), shpz: c(/^шпз|шифр/), date: c(/дата/), qty: c(/^количеств/), price: c(/^цена/), sum: c(/^сумма/) };
            if (C.name < 0) C.name = c(/номенклатура/);
            let month = ''; for (let i = 0; i < h; i++) { const t = hpRowTxt(rows[i]); const m = t.match(/(20\d{2})\/(\d{2})\/\d{2}\s*-\s*(20\d{2})\/(\d{2})/); if (m) { month = m[1] + '-' + m[2]; break; } }
            const items = [];
            for (let i = h + 1; i < rows.length; i++) {
                const r = rows[i] || [], g = k => C[k] >= 0 ? r[C[k]] : '';
                const name = hpS(g('name')), q = hpN(g('qty')); if (!name && q === null) continue;
                const tr = hpS(g('treb')), m = tr.match(/^(\d+)\s*(.*)$/);
                items.push({ i: i, tid: m ? m[1] : '', tref: m ? hpS(m[2]) : tr, nom: hpS(g('nom')), name: name, unit: hpS(g('unit')), sklad: hpS(g('sklad')), shpz: hpS(g('shpz')).replace(/\.0+$/, ''), date: hpS(g('date')), qty: q, price: hpN(g('price')), sum: hpN(g('sum')), pogr: /погрешн/i.test(hpRowTxt(r)), src: src });
            }
            return { month: month, items: items, src: src };
        }

        // ---------- Справка-расчет (bir varaqda bir nechta blok bo'lishi mumkin) ----------
        function hpParseSpr(rows, src) {
            const B = []; let cur = null;
            const SIGN = /^(начальник|зам\.|зам\s|заместит|инженер|мастер|бригадир|экономист|гл\.|главный)/i; // 5.6: «Замок», «Замена» — imzo emas
            for (let i = 0; i < rows.length; i++) {
                const r = rows[i] || [], t = hpRowTxt(r), tl = t.toLowerCase();
                if (/справка.?расчет/i.test(t)) {
                    const lab = { vid: hpFind(r, /вид операц/), sklad: hpFind(r, /^склад/), ceh: hpFind(r, /^цех/), shpz: hpFind(r, /шифр затрат/) };
                    let j = i + 1; while (j < rows.length && !hpRowTxt(rows[j])) j++;
                    const v = rows[j] || [], gv = k => lab[k] >= 0 ? hpS(v[lab[k]]).replace(/\.0+$/, '') : '';
                    cur = { src: Object.assign({}, src, { r: i }), month: hpMonth(hpRowTxt(v)), monthTxt: hpS(v[0]), vid: gv('vid'), sklad: gv('sklad'), ceh: gv('ceh'), shpz: gv('shpz'), title: '', rtype: '', obj: '', wagons: [], hdr: null, C: null, N: 1, items: [], grp: '' };
                    if (cur.shpz && /^\d{5}$/.test(cur.shpz)) cur.shpz = '0' + cur.shpz;
                    B.push(cur); i = j; continue;
                }
                if (!cur) continue;
                if (!cur.hdr && /ремонт/i.test(t) && !cur.title) {
                    cur.title = t; cur.rtype = /капитал/i.test(t) ? 'KR' : /деповск/i.test(t) ? 'DR' : /текущ/i.test(t) ? 'TR' : '';
                    const om = t.match(/\d\s*вс\s*-?\s*\d+|хоп\w*|цистерн\w*|полувагон\w*|платформ\w*/i); cur.obj = om ? om[0].replace(/\s+/g, '').toUpperCase() : '';
                    const rest = t.replace(/\d*\s*вс\s*-?\s*\d+\s*т?\.?/gi, ' ').replace(/q\s*-?\s*\d+/gi, ' ').replace(/жд[цч]\s*-?\s*\d+/gi, ' ');
                    cur.wagons = (rest.match(/\d{2,}/g) || []).map(hpWag);
                    continue;
                }
                if (!cur.hdr && /№\s*треб/i.test(t)) {
                    const c = re => hpFind(r, re); cur.hdr = i;
                    cur.C = { treb: c(/№\s*треб/), name: c(/наимен/), unit: c(/ед\.?\s*изм/), n1: -1, nN: -1, fakt: c(/факт/) };
                    r.forEach((x, j) => { const s = hpLow(x); if (/кол-?во на/.test(s)) { const m = s.match(/на\s*(\d+)\s*ед/); if (m && +m[1] === 1) cur.C.n1 = j; else if (m) { cur.C.nN = j; cur.N = +m[1]; } else if (cur.C.n1 < 0) cur.C.n1 = j; } });
                    continue;
                }
                if (cur.hdr === null || !cur.C) continue;
                const C = cur.C, g = k => C[k] >= 0 ? r[C[k]] : '';
                const name = hpS(g('name')); if (!name || SIGN.test(name) || SIGN.test(hpS(r[0]))) continue;
                const treb = hpS(g('treb')).replace(/\.0+$/, ''), n1 = hpN(g('n1')), nN = hpN(g('nN')), fakt = hpN(g('fakt'));
                if (n1 === null && nN === null && fakt === null && !treb) { cur.grp = name.replace(/[:.]+$/, ''); continue; }
                const ids = treb ? treb.split(/[,\s.;/]+/).filter(x => /^\d+$/.test(x)) : [];
                cur.items.push({ i: i, grp: cur.grp, name: name, unit: hpS(g('unit')), treb: treb, ids: ids, n1: n1, nN: nN, fakt: fakt, src: Object.assign({}, src, { r: i }) });
            }
            return B.filter(b => b.C);
        }

        // ---------- Нормы ----------
        function hpParseNorma(rows, src) {
            let h = -1; for (let i = 0; i < Math.min(rows.length, 40); i++) { const r = rows[i] || []; if ((hpFind(r, /наимен/) >= 0 && hpFind(r, /ед\.?\s*изм/) >= 0 && hpFind(r, /кол-?во/) >= 0) || (hpFind(r, /^номлан/) >= 0 && hpFind(r, /^бирлиг/) >= 0 && hpFind(r, /^ми[қк]дор/) >= 0)) { h = i; break; } }
            if (h < 0) return null;
            const H = rows[h], uz = hpFind(H, /^номлан/) >= 0, cN = uz ? hpFind(H, /^номлан/) : hpFind(H, /наимен/), cU = uz ? hpFind(H, /^бирлиг/) : hpFind(H, /ед\.?\s*изм/), cQ = uz ? hpFind(H, /^ми[қк]дор/) : hpFind(H, /кол-?во/);
            let title = rows.slice(0, h).map(hpRowTxt).filter(Boolean).join(' '); const ti = title.search(/нормы/i); if (ti >= 0) title = title.slice(ti); else { const tu = title.search(/20\d{2}\s*йил/i); if (tu >= 0) title = title.slice(tu); }
            const items = []; let grp = '';
            for (let i = h + 1; i < rows.length; i++) {
                const r = rows[i] || [], name = hpS(r[cN]), q = hpN(r[cQ]); if (!name) continue;
                if (q === null) { if (!hpS(r[cU])) grp = name.replace(/[:.]+$/, ''); continue; }
                items.push({ i: i, grp: grp, name: name, unit: hpS(r[cU]), qty: q, src: Object.assign({}, src, { r: i }) });
            }
            const y = title.match(/на\s*(20\d{2})\s*год/i) || title.match(/(20\d{2})\s*йил/i);
            return { title: title, year: y ? +y[1] : null, rtype: /капитал/i.test(title) ? 'KR' : /деповск|депо\s+таъмир/i.test(title) ? 'DR' : '', items: items, src: src };
        }

        // ---------- Дефектная ведомость (ВУ-22) ----------
        // «Время окончания ремонта __19__час.__00__мин. 25.09.2026г.» — sana faqat aniq yozilgan bo'lsa olinadi (taxmin qilinmaydi)
        function hpDvDate(r) {
            const MO = { 'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'мая': 5, 'май': 5, 'июн': 6, 'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12 };
            const ok = (y, mo, d) => { if (y < 100) y += 2000; const dt = new Date(y, mo - 1, d); return y >= 2015 && y <= 2099 && dt.getMonth() === mo - 1 && dt.getDate() === d ? y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0') : ''; };
            for (const c of (r || [])) { if (typeof c === 'number' && c > 36000 && c < 80000 && Math.floor(c) === c) { const dt = new Date(Math.round((c - 25569) * 86400000)); const iso = ok(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()); if (iso) return { iso: iso, txt: iso.split('-').reverse().join('.') }; } }
            const full = hpRowTxt(r), k = full.search(/мин/i), t = k >= 0 ? full.slice(k + 3) : full.replace(/.*окончания\s+ремонта/i, '');
            let mm = t.match(/(20\d{2})\s*[.\-]\s*(\d{1,2})\s*[.\-]\s*(\d{1,2})(?!\d)/); if (mm) { const iso = ok(+mm[1], +mm[2], +mm[3]); return { iso: iso, txt: mm[0].replace(/\s+/g, '') }; } // 2026-10-05
            mm = t.match(/(\d{1,2})\s*[.\/\-]\s*(\d{1,2})\s*[.\/\-]\s*(\d{4}|\d{2})(?!\d)/);
            if (mm) { const iso = ok(+mm[3], +mm[2], +mm[1]); return { iso: iso, txt: mm[0].replace(/\s+/g, '') }; }
            mm = hpLow(t).match(/(\d{1,2})\s*[»"”']?\s*([а-я]{3,})[а-я]*\.?\s*(20\d{2})/);
            if (mm) { for (const k2 in MO) if (mm[2].indexOf(k2.slice(0, 4)) === 0 || k2.indexOf(mm[2].slice(0, 4)) === 0) { const iso = ok(+mm[3], MO[k2], +mm[1]); return { iso: iso, txt: mm[0] }; } }
            const rest = t.replace(/[_\s.г]+/g, ''); return { iso: '', txt: /\d/.test(rest) ? t.replace(/_+/g, ' ').trim() : '' };
        }
        function hpParseDV(rows, src) {
            const B = []; let cur = null, m = -1, ex = -1, gc = -1;
            for (let i = 0; i < rows.length; i++) {
                const r = rows[i] || [], t = hpRowTxt(r);
                const w = t.match(/завод\.?\s*№\s*-?\s*(\d*)/i);
                if (w) { cur = { src: Object.assign({}, src, { r: i }), wagon: w[1] ? hpWag(w[1]) : '', wagonRaw: w[1] || '', rtype: /капитал/i.test(t) ? 'KR' : /деповск/i.test(t) ? 'DR' : '', obj: (t.match(/хоппер|цистерн\w*|вагон/i) || [''])[0], items: [], grp: '', end: '', endTxt: '', endSrc: null }; B.push(cur); m = -1; gc = -1; continue; }
                if (!cur) continue;
                if (m < 0) {
                    if (/время\s+окончания\s+ремонта/i.test(t)) { const dd = hpDvDate(r); cur.endTxt = dd.txt; cur.end = dd.iso; cur.endSrc = Object.assign({}, src, { r: i }); continue; }
                    const j = hpFind(r, /материал/); if (j >= 0 && /наименование работ|группа работ/i.test(t)) { m = j; ex = hpFind(r, /фамилия|исполнит/); gc = hpFind(r, /группа работ/); } continue; }
                if (gc >= 0 && gc < m) { const g = hpS(r[gc]); if (g) cur.grp = /подпис/i.test(g) ? '' : g; }
                const name = hpS(r[m]); if (!name) continue;
                const q = hpN(r[m + 2]), u = hpS(r[m + 1]);
                if (q === null && !u) continue;
                cur.items.push({ i: i, name: name, unit: u, qty: q, who: ex >= 0 ? hpS(r[ex]) : '', grp: cur.grp, src: Object.assign({}, src, { r: i }) });
            }
            return B;
        }

        // ---------- Акт разбраковки металла ----------
        function hpParseLom(rows, src) {
            let h = -1; for (let i = 0; i < Math.min(rows.length, 40); i++) { const r = rows[i] || []; if (hpFind(r, /наимен/) >= 0 && hpFind(r, /вес/) >= 0 && hpFind(r, /износ/) >= 0) { h = i; break; } }
            if (h < 0) return null;
            const H = rows[h], c = re => hpFind(H, re);
            const C = { name: c(/наимен/), unit: c(/ед\.?\s*изм/), qty: c(/кол-?во/), w: c(/вес\s*1/), p: c(/износ/), tot: c(/общий\s*вес/) };
            let month = ''; for (let i = 0; i < h; i++) { const mm = hpMonth(hpRowTxt(rows[i])); if (/за\s/i.test(hpRowTxt(rows[i])) && mm) { month = mm; break; } }
            const items = []; let itogo = null, stated = null;
            for (let i = h + 1; i < rows.length; i++) {
                const r = rows[i] || [], t = hpRowTxt(r);
                if (/итого/i.test(t)) { const nums = r.map(hpN).filter(x => x !== null); if (nums.length) itogo = { v: nums[nums.length - 1], i: i, src: Object.assign({}, src, { r: i }) }; continue; }
                const st = t.match(/металлолом\w*\s+в\s+количеств\w*\s+([\d\s.,]+)\s*кг/i); if (st) { stated = { v: hpN(st[1].replace(/\s/g, '').replace(/\.$/, '')), i: i, src: Object.assign({}, src, { r: i }) }; continue; }
                const name = hpS(r[C.name]); if (!name) continue;
                const tot = hpN(r[C.tot]); if (tot === null) continue;
                items.push({ i: i, name: name, unit: hpS(r[C.unit]), qty: hpN(r[C.qty]), w: hpN(r[C.w]), p: hpN(r[C.p]), tot: tot, src: Object.assign({}, src, { r: i }) });
            }
            return { month: month, items: items, itogo: itogo, stated: stated, src: src };
        }

        // ---------- Наряд ----------
        function hpParseNar(rows, src) {
            let h = -1; for (let i = 0; i < Math.min(rows.length, 30); i++) if (hpFind(rows[i], /норма на штуку/) >= 0) { h = i; break; }
            if (h < 0) return null;
            const H = rows[h], H2 = rows[h + 1] || [], c = re => hpFind(H, re);
            const C = { no: c(/№\s*п/), punkt: c(/пункт/), desc: c(/описание/), unit: c(/ед\.?\s*изм/), zad: c(/задано/), nt: hpFind(H2, /^время/), rate: hpFind(H2, /расценка/), god: c(/годных/), ntime: c(/норм\.?\s*время/), pay: c(/начисл/) };
            if (C.nt < 0) C.nt = c(/норма на штуку/); if (C.rate < 0) C.rate = C.nt + 1;
            let who = '', month = '', shpz = '';
            for (let i = 0; i < h; i++) { const r = rows[i] || [], t = hpRowTxt(r); if (/наряд/i.test(t)) month = hpMonth(t); const jf = hpFind(r, /ф\.?и\.?о/); if (jf >= 0 && i > 0) { who = hpS((rows[i - 1] || [])[jf]); const js = hpFind(r, /шифр затрат/); if (js >= 0) shpz = hpS((rows[i - 1] || [])[js]); } }
            const items = [], sum = {}; let payTotal = null;
            for (let i = h + 2; i < rows.length; i++) {
                const r = rows[i] || [], t = hpRowTxt(r);
                if (/утверждаю к оплате/i.test(t)) { const n = r.map(hpN).filter(x => x !== null); if (n.length) payTotal = { v: n[0], i: i, src: Object.assign({}, src, { r: i }) }; break; }
                const lab = hpS(r[C.god]) || hpS(r[C.ntime - 1]);
                if (/^н\.?\s*вр/i.test(lab)) { sum.nv = { v: hpN(r[C.ntime]), i: i }; continue; }
                if (/^ф\.?\s*вр/i.test(lab)) { sum.fv = { v: hpN(r[C.ntime]), i: i }; continue; }
                if (hpS(r[C.ntime + 1]) === '%') { sum.pct = { v: hpN(r[C.ntime]), i: i }; continue; }
                if (/сум в час/i.test(hpS(r[C.ntime + 1]))) { sum.sph = { v: hpN(r[C.ntime]), i: i }; continue; }
                const desc = hpS(r[C.desc]); if (!desc) continue;
                const rate = hpN(r[C.rate]), nt = hpN(r[C.nt]); if (rate === null && nt === null) continue;
                const wm = desc.match(/(?:зав\.?\s*№?|№)\s*-?\s*([\d\s,]+)/i);
                items.push({ i: i, punkt: hpS(r[C.punkt]), desc: desc, unit: hpS(r[C.unit]), zad: hpN(r[C.zad]), nt: nt, rate: rate, god: hpN(r[C.god]), ntime: hpN(r[C.ntime]), pay: hpN(r[C.pay]), wagons: wm ? (wm[1].match(/\d{3,}/g) || []).map(hpWag) : [], pct: (desc.match(/-\s*(\d+)\s*%/) || [])[1] || null, src: Object.assign({}, src, { r: i }) });
            }
            return { who: who, month: month, shpz: shpz, items: items, sum: sum, payTotal: payTotal, src: src };
        }

        // ---------- To'plamni o'qish (varaqlar) ----------
        function hpParseSheet(rows, type, src) {
            if (type === 'f30') return hpParseF30(rows, src);
            if (type === 'spr') return hpParseSpr(rows, src);
            if (type === 'norma') return hpParseNorma(rows, src);
            if (type === 'dv') return hpParseDV(rows, src);
            if (type === 'lom') return hpParseLom(rows, src);
            if (type === 'nar') return hpParseNar(rows, src);
            return null;
        }
        function hpSrc(s) { return s ? (s.f || '') + ' › ' + (s.s || '') + (s.r !== undefined && s.r !== null ? ' › ' + (s.r + 1) + '-qator' : '') : ''; }

