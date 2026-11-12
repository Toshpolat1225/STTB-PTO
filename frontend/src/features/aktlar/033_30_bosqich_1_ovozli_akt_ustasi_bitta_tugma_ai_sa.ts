        /* ===== 30-bosqich (1): Ovozli akt ustasi — bitta tugma, AI savol beradi ===== */
        var W = { on: false, voice: false, d: null, ask: null, amb: null, busy: false, log: [] };
        var W_SKIP = /^(yo.?q|yoq|kerak emas|shart emas|o.?tkazib yubor\w*|qoldir\w*|shunday qoldir\w*|bo.?sh qoldir\w*|нет|не нужно|пропусти\w*|skip)\.?$/i;
        var W_YES = /^(ha|xa|ha[,.]? (tuz|to.?g.?ri|mayli|bo.?ladi)\w*|to.?g.?ri|tuz|tuzaver|mayli|bo.?ladi|albatta|tasdiqlayman|да|верно|давай|конечно|ok|okey|xo.?p|hop)\b/i;
        var W_MON = [['yanvar', 'январ'], ['fevral', 'феврал'], ['mart', 'март'], ['aprel', 'апрел'], ['may', 'ма[йя]'], ['iyun', 'июн'], ['iyul', 'июл'], ['avgust', 'август'], ['sent[ay]*abr', 'сентябр'], ['okt[ay]*abr', 'октябр'], ['noyabr', 'ноябр'], ['dekabr', 'декабр']];
        function wIso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function wDate(t) {
            const n = aiNorm(t), d = new Date(); d.setHours(0, 0, 0, 0); let m;
            if (/\bbugun|сегодня|shu kuni/.test(n)) return wIso(d);
            if (/\bkecha|вчера/.test(n)) { d.setDate(d.getDate() - 1); return wIso(d); }
            if (/o.?tgan kuni|avvalgi kuni|позавчера|kechagi oldin/.test(n)) { d.setDate(d.getDate() - 2); return wIso(d); }
            if ((m = n.match(/(\d{1,2})\s*[./]\s*(\d{1,2})(?:\s*[./]\s*(\d{2,4}))?/)) && +m[2] <= 12 && +m[1] <= 31) { let y = m[3] ? +m[3] : d.getFullYear(); if (y < 100) y += 2000; return y + '-' + String(+m[2]).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0'); }
            for (let i = 0; i < 12; i++) {
                const re = new RegExp('(\\d{1,2})\\s*-?\\s*(?:chi\\s*)?(?:' + W_MON[i][0] + '|' + W_MON[i][1] + ')[a-zа-я]*(?:\\s*(20\\d\\d))?');
                if ((m = n.match(re))) { const y = m[2] ? +m[2] : (i > d.getMonth() + 1 ? d.getFullYear() - 1 : d.getFullYear()); return y + '-' + String(i + 1).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0'); }
                const re2 = new RegExp('(?:' + W_MON[i][0] + '|' + W_MON[i][1] + ')[a-zа-я]*\\s+(?:oyining\\s+)?(\\d{1,2})\\b');
                if ((m = n.match(re2)) && +m[1] <= 31) return d.getFullYear() + '-' + String(i + 1).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0');
            }
            const WD = [/yakshanba|воскрес/, /dushanba|понедельн/, /seshanba|вторник/, /chorshanba|сред[ау]/, /payshanba|четверг/, /\bjuma|пятниц/, /shanba|суббот/];
            for (let i = 0; i < 7; i++) if (WD[i].test(n) && !(i === 6 && /yakshanba/.test(n))) { const k = (d.getDay() - i + 7) % 7 || 7; d.setDate(d.getDate() - k); return wIso(d); }
            return null;
        }
        function wFindUnit(num) { const k = String(num).replace(/^0+/, ''); return vagonlarData.find(v => [vagonNo(v), v.inv, v.num, v.zav].some(x => x !== undefined && x !== null && String(x).replace(/^0+/, '') === k && k.length >= 3)); }
        function wVagons(t) {
            // raqam guruhlari: "81-23" -> 8123, "05463.0763" -> 05463 va 0763
            const out = [], bad = [], clean = String(t).replace(/\d+(?:[.,]\d+)?\s*(km|mm|sm|см|мм|км|dona|ta\b|шт|marta|-?marta|yil|-yil|kun|soat|%)/gi, ' ').replace(/\b\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{2,4}\b/g, ' ').replace(/\b\d{1,2}\s*-?\s*(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sent|okt|noyabr|dekabr|январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\w*/gi, ' ');
            const groups = clean.match(/\d[\d\s-]*\d|\d/g) || [];
            groups.forEach(g => {
                const parts = g.split(/[\s-]+/).filter(Boolean); let i = 0;
                while (i < parts.length) {
                    let best = null, bj = i;
                    for (let j = parts.length; j > i; j--) { const cand = parts.slice(i, j).join(''); if (cand.length >= 3 && cand.length <= 8 && wFindUnit(cand)) { best = cand; bj = j; break; } }
                    if (best) { out.push(best); i = bj; continue; }
                    const joined = parts.join(''); if (parts.length > 1 && parts.every(x => x.length <= 4) && joined.length >= 4 && joined.length <= 8 && i === 0) { bad.push(joined); break; }
                    const one = parts[i]; if (one.length >= 4 && one.length <= 8 && !/^(19|20)\d\d$/.test(one)) bad.push(one); i++;
                }
            });
            String(t).replace(/\b(\d{4,8})[.,](\d{3,8})\b/g, (m, a, b) => { [a, b].forEach(x => { if (wFindUnit(x)) { if (!out.includes(x)) out.push(x); const k = bad.indexOf(x); if (k >= 0) bad.splice(k, 1); } }); return m; });
            return { ok: [...new Set(out)], bad: [...new Set(bad.filter(x => !out.includes(x)))] };
        }
        function wStation(t) {
            const n = dbN(t), toks = n.split(' ');
            try { const st = dbStations().find(s => toks.some(w => w.length >= 4 && dbLike(dbStem(w), s.k))); if (st) return String(st.o.uz).replace(/\s+(stansiyasi|stansiya|razyezdi|razyezd)$/i, ''); } catch (e) {}
            const m = String(t).match(/([A-Za-zʻʼ'ЁёА-Яа-я-]{3,})\s+(stansiya\w*|станци\w*|bekat\w*)/i);
            if (m) { const w = m[1].replace(/(da|dagi)$/i, ''); return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
            return null;
        }
        function wMaker(t) {
            const m = String(t).match(/[“"«]?([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9 .&-]{1,28}?)[”"»]?\s+(mchj|ooo|oo|ооо|ao|aj|firma\w*|kompaniya\w*|zavod\w*|компани\w*|фирм\w*)\b/i);
            if (!m) return null;
            const tk = m[1].trim().replace(/\s+(mchj|ooo|oo|ооо)$/i, '').split(/\s+/), keep = [];
            for (let i = tk.length - 1; i >= 0 && keep.length < 3; i--) { const w = tk[i]; if (/^(nosoz|yaroqsiz|yangi|eski|sinov\w*|singan|yorilgan|brak)$/i.test(w) || /\d/.test(w) || /(da|ga|dan|lar\w*|ning|ni|ида|ах)$/i.test(w) || /^(bu|shu|ushbu|va|ham|kecha|bugun|stansiya\w*|vagon\w*|вагон\w*)$/i.test(w)) break; keep.unshift(w); }
            if (!keep.length) return null; let nm = keep.join(' ');
            const form = /mchj|ooo|oo\b|ооо/i.test(m[2] + ' ' + m[0]) ? ' MCHJ' : '';
            return '“' + nm.toUpperCase() + '”' + form;
        }
        function wStripMaker(s) {
            const tk = s.split(/(\s+)/), words = []; tk.forEach((x, i) => { if (!/^\s+$/.test(x) && x) words.push(i); });
            for (let k = 0; k < words.length; k++) {
                const w = tk[words[k]].replace(/[“”"«»]/g, '');
                if (/^(mchj|ooo|oo|ооо|firma\w*|kompaniya\w*)$/i.test(w)) {
                    let a = k; while (a - 1 >= 0 && k - a < 3) { const p = tk[words[a - 1]].replace(/[“”"«»]/g, ''); if (/\d/.test(p) || /(da|ga|dan|lar\w*|ning|ni)$/i.test(p) || /^(bu|shu|ushbu|va|ham|kecha|bugun)$/i.test(p) || /^(mchj|ooo|oo)$/i.test(p)) break; a--; }
                    let e = k; while (e + 1 < words.length && /^(mchj|ooo|oo|firma\w*|kompaniya\w*)$/i.test(tk[words[e + 1]])) e++;
                    for (let q = a; q <= e; q++) tk[words[q]] = '';
                    k = e;
                }
            }
            return tk.join('').replace(/\s{2,}/g, ' ');
        }
        function wSignCands(q, lang) {
            const n = dbN(q).replace(/\b(va|hamda|ham|bilan|komissiya|a.?zolari|imzo|chekuvchi\w*|boshlig\w*)\b/g, ' ').trim(); if (!n) return [];
            const S = ndSigners(), key = typeof trSurKey === 'function' ? trSurKey(q) : '';
            let r = S.filter(s => { const sk = trSurKey(s.n); return sk && key && (sk === key || (sk.length >= 5 && key.length >= 5 && sk.slice(0, 5) === key.slice(0, 5))); });
            if (!r.length) { const rn = dbN(q); r = S.filter(s => { const rr = dbN(s.r); return rr.length > 4 && (rn.includes(rr) || rr.includes(rn) && rn.length >= 6); }); }
            let out = r.map(s => ({ r: s.r, n: s.n, l: s.l }));
            if (!out.length) out = (pplFind(q) || []).slice(0, 6).map(p => ({ r: p.role, n: p.name, l: /[а-яё]/i.test(p.name) ? 'ru' : 'uz' }));
            const same = out.filter(x => x.l === lang); if (same.length) out = same;
            const uniq = []; out.forEach(x => { if (!uniq.some(u => u.n === x.n && u.r === x.r)) uniq.push(x); });
            return uniq;
        }
        function wSplitNames(seg) { return String(seg).split(/,|;|\s+va\s+|\s+hamda\s+|\s+и\s+|\s+ham\s+/i).map(x => x.trim()).filter(x => x.length >= 3); }
        function wFacts(t) {
            let s = ' ' + String(t).replace(/(\d)[.,](\d{3,})/g, '$1 $2') + ' ';
            s = s.replace(/(?:\b\d[\d-]*\b[\s,]*(?:va|hamda|uchta|ikkita|to.?rtta|beshta|ta)?\s*)+(?:raqamli\s+)?(?:vagon|вагон)\w*/gi, ' ');
            s = s.replace(/(ey|эй|hey)\s*(ai|ай|ey)\b[,!.]?/gi, ' ').replace(/\b(akt|dalolatnoma|акт)(ni)?\s+(tuz|yoz|tayyorla)\w*/gi, ' ').replace(/(rus|o.?zbek)\s+tilida\w*|на русском\w*|по-русски/gi, ' ');
            s = s.replace(/(komissiya|imzo cheku\w*|a.?zolar\w*)[\s\S]*$/i, ' ').replace(/(tasdiqlovchi|tasdiqlaydi\w*)[\s\S]*$/i, ' ');
            s = s.replace(/\b(defekt|sinovdagi holat\w*|umumiy|o.?rnatish)\s+(akt\w*|dalolatnoma\w*)\b/gi, ' ');
            s = s.replace(/\b(bugun|kecha|o.?tgan kuni|avvalgi kuni)\b(\s+kuni)?/gi, ' ').replace(/\b\d{1,2}\s*-?\s*(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sent[ay]*abr|okt[ay]*abr|noyabr|dekabr)\w*(\s+20\d\d)?(\s*-?\s*yil\w*)?(\s+kuni)?/gi, ' ');
            s = s.replace(/[A-Za-zʻʼ'-]{3,}\s+(stansiya|bekat)\w*/gi, ' '); s = wStripMaker(s);
            const parts = s.split(/[.;!?\n]+|,?\s+(?:keyin|so.?ngra|shuningdek|undan tashqari|yana|также|затем)\s+|(?<=\b(?:yorildi|sindi|aniqlandi|o.?rnatildi|kuzatildi|chiqdi|keldi|yeyildi|uzildi|egildi|paydo bo.?ldi|bo.?ldi|topildi|almashtirildi|yechildi|выявлено|обнаружено|установлен\w*))\s+(?:va\s+)?/i);
            return parts.map(x => x.replace(/^\s*(va|hamda|и)\s+/i, '').trim()).filter(x => x.length >= 6 && /[a-zа-я]{3}/i.test(x) && !/^(bugun|kecha|olmaliq|stansiya)/i.test(x) || (x && trParse(x).parts.length && trParse(x).defs.length));
        }
        function wParse(t, first) {
            const D = W.d, n = aiNorm(t);
            if (/rus tilida|ruscha|rus tilidagi|на русском|по-русски|rus tilda/.test(n)) D.lang = 'ru'; else if (/o.?zbek tilida|o.?zbekcha|o.?zbek tilda/.test(n)) D.lang = 'uz';
            if (/defekt|дефект/.test(n)) D.tur = 'defekt'; else if (/sinov/.test(n) && /o.?rnat/.test(n) && /(uchun|maqsad)/.test(n)) D.tur = 'ornatish'; else if (/sinov/.test(n)) D.tur = D.tur || 'holat';
            const dt = wDate(t); if (dt) { D.hs = dt; D.hsKnown = true; }
            const mm = n.match(/dalolatnoma sanasi\w*\s+(.+)$/); if (mm) { const d2 = wDate(mm[1]); if (d2) D.sana = d2; }
            const st = wStation(t); if (st) D.joy = st;
            const V = wVagons(t); V.ok.forEach(x => { if (!D.vag.includes(x)) D.vag.push(x); }); if (first || V.bad.length) D.vagBad = [...new Set(D.vagBad.concat(V.bad))].filter(x => !D.vag.includes(x));
            const mk = wMaker(t);
            const E = trParse(t), part = E.parts.find(p => !p.noPart);
            if (mk || (part && !D.obj && D.tur !== 'defekt')) { D.maker = mk || D.maker; D.part = part || D.part; D.obj = (D.maker ? D.maker + ' firmasining ' : '') + (D.part ? (/lar|ы|и$/.test(t) ? D.part.uzPl : D.part.uzPl) : 'mahsuloti'); }
            // komissiya
            const cm = String(t).match(/(?:komissiya(?:\s+a.?zolari)?|imzo cheku\w*|imzolaydi\w*|a.?zolar\w*)\s*(?:tarkibi(?:da)?)?\s*[:\-—]?\s*([\s\S]+?)(?:\s+(?:tasdiqlovchi|tasdiqlaydi\w*)[\s\S]*)?$/i);
            if (cm) wAddSigners(cm[1]);
            const ap = String(t).match(/(?:tasdiqlovchi(?:\s+esa)?|tasdiqlaydi(?:gan)?)\s*[:\-—]?\s*([^,.]+)/i);
            if (ap) { const c = wSignCands(ap[1], D.lang || 'uz'); if (c.length) D.ap = { r: c[0].r, n: c[0].n }; }
            if (first || W.ask === 'fact') { const f = wFacts(t); if (f.length) D.lines = D.lines.concat(f); }
            if (!D.tur) D.tur = 'umumiy';
        }
        function wAddSigners(seg) {
            const D = W.d, chunks = [];
            wSplitNames(seg).forEach(ch => { const ws = ch.split(/\s+/); if (ws.length > 1 && ws.every(x => x.length >= 4 && wSignCands(x, D.lang || 'uz').length)) ws.forEach(x => chunks.push(x)); else chunks.push(ch); });
            chunks.forEach(nm => {
                if (W_SKIP.test(nm)) return;
                const c = wSignCands(nm, D.lang || 'uz');
                if (c.length === 1) { if (!D.com.some(x => x.n === c[0].n)) D.com.push({ r: c[0].r, n: c[0].n }); }
                else if (c.length > 1) D.amb.push({ q: nm, c: c.slice(0, 4) });
                else D.comBad.push(nm);
            });
        }
        function wNext() {
            const D = W.d;
            if (!D.lines.length) return ['fact', "Nima sodir bo'ldi? Aktga yoziladigan holatni qisqacha ayting."];
            if (!D.hsKnown) return ['date', "Siz aniq sanani aytmadingiz. Ushbu holat qachon bo'ldi va aktga qaysi kun sanasini kiritay?"];
            if (D.amb.length) { const a = D.amb[0]; return ['amb', "«" + a.q + "» bir nechta xodimga to'g'ri keladi: " + a.c.map((x, i) => (i + 1) + ') ' + x.r + ' ' + x.n).join('; ') + '. Qaysi biri? Raqamini ayting.']; }
            if (D.comBad.length) return ['comfix', "«" + D.comBad[0] + "» shtatda topilmadi. Familiyasini qaytadan ayting yoki «kerak emas» deng."];
            if (!D.com.length) return ['com', "Komissiya a'zolarini ayting — familiyalari yoki lavozimlari bilan."];
            if (D.vagBad.length) return ['vag', "«" + D.vagBad[0] + "» raqamli texnika bazada topilmadi. Raqamni qaytadan ayting yoki «shunday qoldir» deng."];
            if (D.tur === 'defekt' && !D.vag.length) return ['vagreq', "Defekt akt qaysi vagon uchun? Raqamini ayting."];
            if ((D.tur === 'holat' || D.tur === 'ornatish') && !D.obj && !D.objSkip) return ['obj', "Qaysi firma mahsuloti yoki qaysi detal sinovda? Kerak bo'lmasa «yo'q» deng."];
            if (!D.joy && !D.joySkip) return ['joy', "Qaysi stansiyada (joyda) bo'ldi? Kerak bo'lmasa «yo'q» deng."];
            return ['confirm', wSummary() + ' Aktni tuzaymi?'];
        }
        function wSummary() {
            const D = W.d, T = { ornatish: "sinovga o'rnatish dalolatnomasi", holat: "sinovdagi holat dalolatnomasi", defekt: 'defekt dalolatnomasi', umumiy: 'dalolatnoma' };
            return 'Tushundim: ' + T[D.tur] + ', ' + (D.lang === 'ru' ? 'rus' : "o'zbek") + ' tilida. Sana: ' + fmtISO(D.hs) + '.' + (D.joy ? ' Joy: ' + D.joy + '.' : '') + (D.vag.length ? ' Texnika: ' + D.vag.join(', ') + '.' : '') + (D.obj ? ' Mavzu: ' + D.obj + '.' : '') + ' Holatlar: ' + D.lines.length + ' ta. Komissiya: ' + D.com.map(c => c.n).join(', ') + '.' + (D.ap ? ' Tasdiqlovchi: ' + D.ap.n + '.' : '');
        }
        function wAnswer(t) {
            const D = W.d, n = aiNorm(t).trim(), skip = W_SKIP.test(n);
            const k = W.ask;
            if (k === 'confirm') {
                if (W_YES.test(n) && !/o.?zgartir|tuzat|emas/.test(n)) return wBuild();
                if (/^(yo.?q|нет)\b/.test(n) && n.split(' ').length <= 2) { wSay("Nimani o'zgartiray? Masalan: «sanani 25-sentabr qil» yoki «komissiyaga Xakimovni qo'sh»."); W.ask = 'fix'; return; }
            }
            if (k === 'date') { const d = wDate(t); if (d) { D.hs = d; D.hsKnown = true; } else if (!skip) { wSay("Sanani tushunmadim. Masalan: «25-sentabr», «kecha» yoki «bugun» deng."); return; } else { D.hs = D.sana; D.hsKnown = true; } }
            else if (k === 'amb') {
                const a = D.amb[0]; let i = -1; const m = n.match(/\b([1-4])\b/);
                if (m) i = +m[1] - 1; else { [/birinchi|\bbir\b|перв/, /ikkinchi|\bikki\b|втор/, /uchinchi|\buch\b|трет/, /to.?rtinchi|\bto.?rt\b|четв/].forEach((re, j) => { if (i < 0 && re.test(n)) i = j; }); }
                if (i < 0) i = a.c.findIndex(c => dbN(t).split(' ').some(w => w.length >= 4 && dbN(c.r).includes(w)));
                if (i >= 0 && a.c[i]) { if (!D.com.some(x => x.n === a.c[i].n)) D.com.push({ r: a.c[i].r, n: a.c[i].n }); D.amb.shift(); } else if (skip) D.amb.shift(); else { wSay('Raqamini ayting: 1, 2 yoki 3.'); return; }
            }
            else if (k === 'comfix') { D.comBad.shift(); if (!skip) wAddSigners(t); }
            else if (k === 'com') { if (!skip) wAddSigners(t); }
            else if (k === 'vag') { const bad = D.vagBad.shift(); if (/shunday|qoldir|yozaver/.test(n) && bad) D.vag.push(bad); else if (!skip) { const V = wVagons(t); V.ok.forEach(x => { if (!D.vag.includes(x)) D.vag.push(x); }); if (!V.ok.length && V.bad.length) D.vag.push(V.bad[0]); } }
            else if (k === 'vagreq') { const V = wVagons(t); if (V.ok.length) D.vag = D.vag.concat(V.ok); else if (V.bad.length) D.vag.push(V.bad[0]); else { wSay('Raqamni tushunmadim, qaytadan ayting.'); return; } }
            else if (k === 'obj') { if (skip) D.objSkip = true; else { const mk = wMaker(t); D.obj = mk ? mk + ' ' + (D.part ? D.part.uzPl : 'mahsuloti') : String(t).trim(); } }
            else if (k === 'joy') { if (skip) D.joySkip = true; else D.joy = wStation(t) || String(t).trim().replace(/\s*(stansiya\w*)$/i, ''); }
            else if (k === 'fact') { const f = wFacts(t); D.lines = D.lines.concat(f.length ? f : [String(t).trim()]); }
            // qo'shimcha aytilgan ma'lumotlar (tuzatishlar)
            if (k === 'fix' || k === 'confirm' || k === 'joy' || k === 'date') {
                const d = wDate(t); if (d && k !== 'date') { D.hs = d; D.hsKnown = true; }
                if (k !== 'joy') { const st = wStation(t); if (st) D.joy = st; }
                if (/rus tilida|ruscha/.test(n)) D.lang = 'ru'; if (/o.?zbek/.test(n)) D.lang = 'uz';
                const add = String(t).match(/(?:komissiya\w*|a.?zolar\w*)\s*(?:ga)?\s*(.+?)\s*(?:ni|larni)?\s*qo.?sh/i) || String(t).match(/(.+?)(?:ni|larni)\s+(?:ham\s+)?(?:komissiyaga\s+)?qo.?sh/i); if (add) wAddSigners(add[1]);
                const del = String(t).match(/(.+?)(?:ni|larni)\s+(?:komissiyadan\s+)?(?:olib tashla|o.?chir|chiqar)/i); if (del) { const key = trSurKey(del[1]); D.com = D.com.filter(c => trSurKey(c.n) !== key); }
                const V = wVagons(t); V.ok.forEach(x => { if (!D.vag.includes(x)) D.vag.push(x); });
            }
            wStep();
        }
        function wSay(txt, noListen) {
            W.log.push({ ai: true, t: txt }); wRenderLog();
            if (W.voice && typeof speakAiText === 'function') { try { speakAiText(txt, () => { if (W.on && !noListen) setTimeout(wListen, 350); }); } catch (e) {} }
        }
        function wStep() { const [k, q] = wNext(); W.ask = k; wFill(); wSay(q); }
        function wFill() {
            const D = W.d; if (!ND.form) return;
            const f = ND.form;
            f.tur = D.tur; f.lang = D.lang || f.lang || (D.tur === 'defekt' ? 'ru' : 'uz'); f.langSet = true;
            f.sana = D.sana; f.hs = D.hs || D.sana; f.hsSame = !D.hs || D.hs === D.sana; f.joy = D.joy || ''; f.vag = D.vag.join(', '); f.obj = D.obj || ''; f.text = D.lines.join('\n');
            f.com = D.com.map(c => (typeof trSigner === 'function' ? trSigner(c, f.lang) : c)); f.apObj = D.ap ? trSigner(D.ap, f.lang) : ndDefApObj();
            if (f.tur === 'holat' && D.orn) f.orn = D.orn;
            const keep = W.log.slice(); ndRender(); W.log = keep; wRenderLog();
        }
        async function wBuild() {
            W.ask = null; wFill();
            wSay('Akt tuzilmoqda...', true);
            try { await ndGenerate(); } catch (e) { console.error(e); }
            if (!$id('ndPage')) { wSay("Aktni tuzib bo'lmadi — maydonlarni tekshiring.", true); return; }
            setTimeout(() => { try { aktPdf(); } catch (e) {} }, 300);
            W.ask = 'after';
            wSay("✅ Akt rasmiy shaklda tuzildi va PDF tayyorlandi. Yuborish kerakmi? Masalan: «@@N:389@@ga Telegram orqali yubor» yoki «Word qilib pochtaga yubor». Tugatish uchun «yo'q» deng.");
        }
        function wAfter(t) {
            const n = aiNorm(t);
            if (W_SKIP.test(n) || /^(yo.?q|rahmat|tamom|bo.?ldi|kerak emas)/.test(n)) { wSay('Yaxshi. Akt arxivga saqlash uchun «💾 Arxivga saqlash»ni bosing.', true); wStop(); return; }
            if (/yubor|jo.?nat|отправ/.test(n)) { agentSendAkt(t, true); return; }
            if (/saqla|arxiv/.test(n)) { try { ndSaveAkt(); } catch (e) {} wSay('💾 Arxivga saqlandi.', true); wStop(); return; }
            wSay("Tushunmadim. «…ga yubor», «arxivga saqla» yoki «yo'q» deng.");
        }
        function wUser(t) {
            t = String(t || '').trim(); if (!t) return;
            W.log.push({ ai: false, t: t }); wRenderLog();
            if (W.ask === 'after') return wAfter(t);
            if (!W.d) return;
            wAnswer(t);
        }
        function wListen() {
            if (!W.on || !W.voice) return;
            const SRc = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SRc) return;
            if (typeof micBlocked !== 'undefined' && micBlocked) return;
            const r = new SRc(); r.lang = (typeof SR_LANG !== 'undefined' && typeof I18N !== 'undefined' && SR_LANG[I18N.lang]) || 'uz-UZ'; r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
            r._wiz = true;
            let got = '';
            const inp = $id('ndwTxt');
            r.onresult = e => { let s = ''; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; got = s; if (inp) inp.value = s; };
            r.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { W.voice = false; wRenderLog(); } };
            r.onend = () => { W.rec = null; const b = $id('ndwMicB'); if (b) b.classList.remove('on'); if (inp) inp.value = ''; if (got.trim()) wUser(got.trim()); else if (W.on && W.voice) { W.miss = (W.miss || 0) + 1; if (W.miss < 2) setTimeout(wListen, 500); } };
            try { r.start(); W.rec = r; W.miss = 0; const b = $id('ndwMicB'); if (b) b.classList.add('on'); } catch (e) {}
        }
        function wStop() { W.on = false; try { W.rec && W.rec.abort(); } catch (e) {} W.rec = null; wRenderLog(); }
        function ndWizStart(text, voice) {
            if (!$id('screen-nd').classList.contains('active') || ND.view !== 'akt') { ND.form = null; ndOpenAkt(); }
            W.on = true; W.voice = voice !== false; W.log = []; W.ask = null;
            W.d = { tur: null, lang: null, sana: todayISO(), hs: null, hsKnown: false, joy: '', vag: [], vagBad: [], obj: '', lines: [], com: [], comBad: [], amb: [], ap: null };
            if (text && text.trim()) { W.log.push({ ai: false, t: text.trim() }); wParse(text, true); wStep(); }
            else { wRenderLog(); wSay("Eshitaman. Hammasini bir yo'la ayting: nima bo'ldi, qachon, qayerda, qaysi vagonlar, firma, komissiya a'zolari va akt tili."); }
        }
        function wRenderLog() {
            const box = $id('ndwLog'); if (!box) return;
            box.innerHTML = W.log.slice(-14).map(m => `<div class="ndw-m ${m.ai ? 'ai' : 'me'}">${m.ai ? (typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : '🤖') : '🗣 '}${escapeHtml(m.t)}</div>`).join('');
            box.scrollTop = box.scrollHeight;
            const st = $id('ndwState'); if (st) st.innerText = W.on ? (W.voice ? '🎙 Ovozli rejim yoqilgan' : '⌨️ Yozma rejim') : '';
            const g = $id('ndwGo'); if (g) g.classList.toggle('on', W.on);
        }
        function ndwSendTxt() { const i = $id('ndwTxt'); if (!i || !i.value.trim()) return; const v = i.value.trim(); i.value = ''; if (!W.on) { ndWizStart(v, false); return; } wUser(v); }
        function ndwGoClick() {
            if (W.on && W.rec) { try { W.rec.stop(); } catch (e) {} return; }
            if (!W.on) { ndWizStart('', true); setTimeout(() => { if (!W.voice || !(window.speechSynthesis)) wListen(); }, 400); return; }
            W.voice = true; wListen();
        }
        // Akt formasi: har bir maydondagi mikrofonlar o'rniga — bitta AI ustasi paneli
        (function () {
            ndRenderAkt = agmkExtend('ndRenderAkt', '30-bosqich (1): Ovozli akt ustasi — bitta tugma, AI savol beradi · Akt formasi: har bir maydondagi mikrofonlar oʼrniga — bitta AI ustasi paneli', ndRenderAkt, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const form = document.querySelector('#ndBody .nd-form'); if (!form || $id('ndwBox')) return r;
                    const d = document.createElement('div'); d.id = 'ndwBox'; d.className = 'ndw';
                    d.innerHTML = `<button type="button" class="ndw-go" id="ndwGo" onclick="ndwGoClick()">${typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : ''}<span>🎙 AI bilan akt tuzish — gapiring</span></button>
                        <div class="ndw-sub">Hammasini bir yo'la ayting: nima bo'ldi, qachon, qayerda, qaysi vagonlar, firma, komissiya a'zolari, akt tili. Yetishmagan ma'lumotni AI o'zi so'raydi, keyin akt va PDF tayyorlaydi.</div>
                        <div class="ndw-log" id="ndwLog"></div>
                        <div class="ndw-in"><input id="ndwTxt" placeholder="...yoki shu yerga yozing" onkeydown="if(event.key==='Enter'){event.preventDefault(); ndwSendTxt()}"><button type="button" id="ndwMicB" class="ndw-mic" onclick="W.voice=true; if(!W.on) ndWizStart('', true); else wListen()">${typeof MIC_IMG !== 'undefined' ? MIC_IMG : '🎤'}</button><button type="button" class="ndw-send" onclick="ndwSendTxt()">➤</button></div>
                        <div class="ndw-st" id="ndwState"></div>`;
                    const h4 = form.querySelector('h4'); if (h4) h4.after(d); else form.prepend(d);
                    wRenderLog();
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // AI chatdagi "akt tuz ..." buyrug'i endi ustani ishga tushiradi
        (function () {
            aixAkt = function (q) {
                const n = dbN(q); if (!/(akt|dalolatnoma|акт)/.test(n) || !/(tuz|yoz|tayyorla|sostav|oching|och\b|составь)/.test(n)) return null;
                const voice = !!(window.__lastVoiceAt && Date.now() - window.__lastVoiceAt < 60000);
                setTimeout(() => { try { aicClose(); } catch (e) {} ND.form = null; ndOpenAkt(); ndWizStart(q, voice); }, 500);
                return "📝 Akt tuzish ustasi ochilmoqda. Yetishmagan ma'lumotlarni so'rayman.";
            };
        })();
        // Oxirgi ovozli buyruq vaqti (ustaning ovozli rejimi uchun)
        (function () { const SRc = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SRc || !SRc.prototype) return; const os = SRc.prototype.start; SRc.prototype.start = function () { if (!this._wake) window.__lastVoiceAt = Date.now(); return os.apply(this, arguments); }; })();

