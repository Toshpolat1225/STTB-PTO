        // =====================================================================
        // v2.5 — Vagon raqamini bo'laklab aytilgan/yozilgan holda yig'ish
        //  "5 ta nol 546" → 00000546 · "3 ta nol 24 85" → 0002485 · "363 46 756" → 36346756
        //  Aniq mos kelgani birinchi; topilmasa — alohida bo'laklar; hech biri bo'lmasa — "Topilmadi"
        //  "2 ta vagon", yillar (2024-yil) birlashtirilmaydi. Chat, ovoz, bosh sahifa qidiruvi, ro'yxat va tarkib qo'shishda ishlaydi.
        // =====================================================================
        var NUM_W = { bir: 1, ikki: 2, uch: 3, 'tort': 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, 'toqqiz': 9, один: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9 };
        function numNorm(s) { return String(s || '').toLowerCase().replace(/[ʻʼ’‘`´']/g, "'").replace(/ё/g, 'е'); }
        // v3.1: so'z bilan aytilgan sonlar → raqam guruhlari: «sakson bir yigirma to'qqiz» → «81 29», «uch yuz o'n besh» → «315»
        var NUM_U = { bir: 1, ikki: 2, uch: 3, tort: 4, besh: 5, olti: 6, yetti: 7, sakkiz: 8, toqqiz: 9, один: 1, одна: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9 };
        var NUM_T = { on: 10, yigirma: 20, ottiz: 30, qirq: 40, ellik: 50, oltmish: 60, yetmish: 70, sakson: 80, toqson: 90, десять: 10, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50, шестьдесят: 60, семьдесят: 70, восемьдесят: 80, девяносто: 90 };
        var NUM_TEEN = { одиннадцать: 11, двенадцать: 12, тринадцать: 13, четырнадцать: 14, пятнадцать: 15, шестнадцать: 16, семнадцать: 17, восемнадцать: 18, девятнадцать: 19 };
        function numWords(s) {
            const toks = s.split(/(\s+)/), out = []; let g = null;
            const key = w => w.replace(/'/g, '').replace(/(ta|та)$/, ''), flush = () => { if (g) { out.push(String(g.h + g.t + g.u)); g = null; } };
            for (const w0 of toks) {
                if (/^\s+$/.test(w0)) { if (!g) out.push(w0); continue; }
                const w = key(w0.replace(/[,.;:!?]+$/, ''));
                // «to'rtta nol» — nollar sonini numAsm o'zi hisoblaydi
                if (NUM_T[w] !== undefined) { if (g && (g.t || g.u)) flush(); g = g || { h: 0, t: 0, u: 0 }; g.t = NUM_T[w]; continue; }
                if (NUM_TEEN[w] !== undefined) { flush(); out.push(String(NUM_TEEN[w])); continue; }
                if ((w === 'yuz' || w === 'сто') && g && !g.t) { g.h = (g.u || 1) * 100; g.u = 0; continue; }
                if (NUM_U[w] !== undefined && !/(ta|та)$/.test(w0.replace(/'/g, ''))) { if (g && g.u) flush(); g = g || { h: 0, t: 0, u: 0 }; g.u = NUM_U[w]; continue; }
                flush(); out.push(' ' + w0 + ' ');
            }
            flush(); return out.join(' ').replace(/\s+/g, ' ');
        }
        function numAsm(text, digits) { // digits=true: «uch nol» = 3, 0 (raqamlab aytilgan); aks holda «uch nol» = 000
            const raw = String(text || ''); let s = numNorm(raw);
            // «4 ta 0», «4ta 0» (nol raqam bilan yozilgan) → «4 ta nol»
            s = s.replace(/(\d{1,2}|bir|ikki|uch|to'?rt|besh|olti|yetti|sakkiz|to'?qqiz)\s*(ta|та)\s+0(?!\d)/g, '$1 ta nol');
            if (/(yigirma|o'?ttiz|qirq|ellik|oltmish|yetmish|sakson|to'?qson|\bo'?n\b|yuz|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|надцать)/.test(s) || /^(\s*(bir|ikki|uch|to'?rt|besh|olti|yetti|sakkiz|to'?qqiz|nol|no'l)\s*){3,}$/.test(s)) s = numWords(s.replace(/o'n\b/g, 'on').replace(/o'ttiz/g, 'ottiz').replace(/to'qson/g, 'toqson'));
            const ZERO = "(?:no'?l|nul|nol|ноль|ноля|нуля|нулей|нул)";
            let zeroUsed = false;
            // "5 ta nol", "besh ta no'l", "три нуля"
            s = s.replace(new RegExp("(\\d{1,2}|bir|ikki|uch|to'?rt|besh|olti|yetti|sakkiz|to'?qqiz|один|одна|два|две|три|четыре|пять|шесть|семь|восемь|девять)\\s*(?:ta|та)?\\s*" + ZERO + "(?![a-zа-я])", 'g'), (m, n) => {
                if (digits && !/^\S+\s*(ta|та)/.test(m.trim())) return m;
                const k = /^\d+$/.test(n) ? +n : NUM_W[n.replace(/'/g, '')]; if (!k || k > 12) return m; zeroUsed = true; return ' ' + '0'.repeat(k) + ' '; });
            s = s.replace(new RegExp("(^|[^a-zа-я'])" + ZERO + "(?![a-zа-я])", 'g'), (m, p) => { zeroUsed = true; return p + ' 0 '; });
            const toks = s.split(/[\s,;:]+|(?<=\d)-(?=\d)/).filter(Boolean);
            const runs = []; let cur = [];
            const flush = () => { if (cur.length) runs.push(cur); cur = []; };
            for (let i = 0; i < toks.length; i++) {
                const t = toks[i].replace(/[.!?№#]+$/g, '').replace(/^[№#]+/, ''), nx = (toks[i + 1] || '');
                if (/^\d+$/.test(t)) {
                    if (/^(ta|та|dona|шт|штук|kun|дн|yil|йил|год|km|км|soat|daqiqa|%|tonna|тонн|кг|kg|m|м|so'?m|som|сум|ming|минг|mln|million|млн|mlrd|litr|л|oy|месяц)(?![a-zа-я0-9])/.test(nx) || /^-?(yil|chi|инчи)/.test(nx)) { if (cur.length) cur.pop(); flush(); continue; } // miqdor/yil — raqam emas
                    if (/^(19|20)\d\d$/.test(t) && /^(yil|год|y)(?![a-zа-я])/.test(nx)) { flush(); continue; }
                    cur.push(t);
                } else flush();
            }
            flush();
            const out = [];
            runs.forEach(r => {
                const joined = r.join(''), multi = r.length > 1 || (zeroUsed && /^0/.test(joined));
                if (joined.length < 3) return;
                out.push({ parts: r, joined: joined, multi: multi });
            });
            return out;
        }
        function numKeys(v) { return [vagonNo(v), v.num, v.inv, v.zav, v.gos].filter(x => x !== undefined && x !== null && x !== '').map(x => String(x).replace(/\s/g, '')); }
        function numFindExact(n, pool) { pool = pool || vagonlarData; return pool.filter(v => numKeys(v).some(k => k === n)); }
        function numFindLoose(n, pool) { pool = pool || vagonlarData; const z = n.replace(/^0+/, ''); if (!z) return []; return pool.filter(v => numKeys(v).some(k => /^\d+$/.test(k) && k.replace(/^0+/, '') === z)); }
        // Eng yaxshi talqin: {src, num, hits, how}
        function numResolve(text, pool) {
            const R = numAsm(text).filter(r => r.multi); if (!R.length) return null;
            // raqamlab aytilgan bo'lishi mumkin: «bir nol to'qqiz uch bir» → 10931, «ikki nol besh yetti yetti» → 20577
            const R2 = numAsm(text, true).filter(r => r.multi && !R.some(z => z.joined === r.joined));
            // v3.2: avval ikkala talqinda ANIQ moslik, keyin «oldidagi nollar farqi bilan»
            for (const r of R.concat(R2)) { const h = numFindExact(r.joined, pool); if (h.length) return { src: r, num: r.joined, hits: h, how: 'exact' }; }
            for (const r of R.concat(R2)) { const h = numFindLoose(r.joined, pool); if (h.length) return { src: r, num: vagonNo(h[0]) || r.joined, hits: h, how: 'loose' }; }
            const r = R[0];
            for (const p of r.parts) { if (p.length < 3) continue; const h = numFindExact(p, pool); if (h.length) return { src: r, num: p, hits: h, how: 'part' }; }
            return { src: r, num: r.joined, hits: [], how: 'none' };
        }
        function numInterpLine(res, text) {
            if (!res) return ''; const src = String(text || '').trim();
            return '🔎 «' + src + '» → ' + res.num + (res.how === 'part' ? ' (toʻliq raqam topilmadi — bir boʻlagi boʻyicha)' : res.how === 'loose' ? ' (oldidagi nollar farqi bilan)' : '');
        }
        function numLooksLikeQuery(text) {
            const s = numNorm(text); if (/vagon|вагон|raqam|nomer|номер|№|topib|top\b|qidir|найд|dumpkar|думпкар|xopper|хоппер|sistern|цистерн|platform|lokomotiv|teplovoz|elektrovoz|pasport/.test(s)) return true;
            const rest = s.replace(/\d+/g, ' ').replace(/(восемьдесят|семьдесят|шестьдесят|пятьдесят|девяносто|двадцать|тридцать|сорок|[а-я]+надцать|десять|yigirma|o'?ttiz|qirq|ellik|oltmish|yetmish|sakson|to'?qson|yuz|no'?l|nul|nol|ноль|ноля|нуля|нулей|нул|ta|та|bir|ikki|uch|to'?rt|besh|olti|yetti|sakkiz|to'?qqiz|один|два|две|три|четыре|пять|шесть|семь|восемь|девять|o'?n(?![a-z])|сто(?![а-я]))/g, ' ').replace(/[^a-zа-я]/g, '');
            return rest.length <= 3;
        }
        function numIsPure(text) { const s = numNorm(text).replace(/\d+/g, ' ').replace(/(восемьдесят|семьдесят|шестьдесят|пятьдесят|девяносто|двадцать|тридцать|сорок|[а-я]+надцать|десять|yigirma|o'?ttiz|qirq|ellik|oltmish|yetmish|sakson|to'?qson|yuz|no'?l|nul|nol|ноль|ноля|нуля|нулей|нул|\bta\b|\bта\b|bir|ikki|uch|to'?rt|besh|olti|yetti|sakkiz|to'?qqiz|один|два|две|три|четыре|пять|шесть|семь|восемь|девять|o'?n(?![a-z])|сто(?![а-я])|vagon\w*|вагон\w*|raqam\w*|nomer\w*|номер\w*|topib|ber|top|qidir\w*|найди|haqida|ma'lumot|№)/g, ' ').replace(/[^a-zа-я]/g, ''); return s.length <= 3; }
        // --- AI (chat, ovoz, bosh sahifa) ---
        (function () {
            if (typeof aiqParse === 'function') { aiqParse = agmkExtend('aiqParse', '--- AI (chat, ovoz, bosh sahifa) ---', aiqParse, o => function (q) { const P = o.apply(this, arguments); try { const r = numResolve(q); if (r && r.hits.length) { P.num = r.num; P.numInterp = numInterpLine(r, q); } } catch (e) {} return P; }); }
            if (typeof aiLocalAnswer === 'function') { aiStage('Raqam boʻyicha texnika qidirish', function (q, next) {
                let r = null; try { r = numResolve(q); } catch (e) {}
                if (r && r.how === 'none' && numLooksLikeQuery(q)) { const t = numInterpLine(r, q) + '\nTopilmadi: bazada bunday raqamli vagon/texnika yoʻq. Raqamni tekshirib, qayta ayting (masalan: «3 ta nol 24 85» yoki «363 46 756»).'; return { t: t, personal: true }; }
                if (r && r.hits.length && numIsPure(q)) { const L = r.hits.slice(0, 8).map(v => typeof aiqLine === 'function' ? aiqLine(v) : '• ' + unitLabel(v) + ' — ' + v.status); return { t: numInterpLine(r, q) + '\n' + (r.hits.length > 1 ? 'Topildi ' + r.hits.length + ' ta:\n' : 'Topildi:\n') + L.join('\n'), personal: true }; }
                let a = next(q);
                try { if (r && r.hits.length) { const line = numInterpLine(r, q); if (a && typeof a === 'object' && a.t && a.t.indexOf('🔎') !== 0) a.t = line + '\n' + a.t; else if (typeof a === 'string' && a.indexOf('🔎') !== 0) a = line + '\n' + a; else if (!a) { const v = r.hits[0]; a = { t: line + '\n' + (typeof aiqLine === 'function' ? aiqLine(v) : unitLabel(v) + ' — ' + v.status), personal: true }; } } } catch (e) {}
                return a; }); }
            // Vagonlar ro'yxati qidiruvi
            if (typeof vagonMatches === 'function') { const o = vagonMatches; let cq = null, cr = null; vagonMatches = function (v, q) {
                if (q !== cq) { cq = q; try { cr = numResolve(q); } catch (e) { cr = null; } numHint('mainSearchInput', cr, q); }
                if (cr && cr.hits.length) return cr.hits.includes(v);
                return o.apply(this, arguments); }; }
            // Tarkib tuzishda vagon qo'shish
            if (typeof hrRenderPick === 'function') { hrRenderPick = agmkExtend('hrRenderPick', 'Tarkib tuzishda vagon qoʼshish', hrRenderPick, o => function () {
                const inp = $id('hrVQ'), q = inp ? inp.value : ''; let r = null; try { r = numResolve(q, onlyVagons()); } catch (e) {}
                if (inp && r && r.hits.length) { inp.value = r.num; try { o.apply(this, arguments); } finally { inp.value = q; } }
                else o.apply(this, arguments);
                numHint('hrVQ', r, q); }); }
        })();
        function numHint(inputId, r, q) {
            const inp = $id(inputId); if (!inp) return; const host = inp.closest('.search-wrap') || inp; let h = document.querySelector('[data-numhint="' + inputId + '"]');
            if (!r) { if (h) h.remove(); return; }
            if (!h) { h = document.createElement('div'); h.className = 'num-hint'; h.setAttribute('data-numhint', inputId); host.parentNode.insertBefore(h, host.nextSibling); }
            h.textContent = numInterpLine(r, q) + (r.hits.length ? ' · ' + r.hits.length + ' ta topildi' : ' · Topilmadi');
        }

