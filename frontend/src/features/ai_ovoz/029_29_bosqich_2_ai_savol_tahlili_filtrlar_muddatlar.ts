        /* ===== 29-bosqich (2): AI savol tahlili — filtrlar, muddatlar, yosh, seriya, aniq birlik ===== */
        var AIQ_KIND = [
            ['vag', /\b(vagon\w*|вагон\w*|dumpkar\w*|думпкар\w*|sisterna\w*|cisterna\w*|цистерн\w*|platforma\w*|платформ\w*|xopper\w*|хоппер\w*)/, 'vagon'],
            ['lok', /\b(lokomotiv\w*|локомотив\w*|teplovoz\w*|тепловоз\w*|elektrovoz\w*|электровоз\w*|tortuvchi\w*|тягов\w*)/, 'lokomotiv'],
            ['yol', /\b(yo.?l texnika\w*|yol texnika\w*|drezina\w*|дрезин\w*|avtodrezina\w*|motovoz\w*|мотовоз\w*|avtomotrisa\w*|автомотрис\w*|yotqizuvchi\w*|путев\w*|yo.?l mashina\w*)/, "yo'l texnikasi"],
            ['avto', /\b(avtotraktor\w*|avto ?texnika\w*|traktor\w*|трактор\w*|avtomobil\w*|автомоб\w*|avtobus\w*|автобус\w*|yuklagich\w*|погрузчик\w*|buldozer\w*|бульдозер\w*|ekskavator\w*|экскаватор\w*|tirkama\w*|mototsikl\w*|vaxtovka\w*|mashina(lar)?\b)/, 'avtotexnika']
        ];
        // vagon turlari (bazadagi type bilan)
        var AIQ_VTYPE = [[/dumpkar\w*\s*105|2vs-?105|2вс-?105|dumpkar\w*\s*115|q-?115/, 'Dumpkar 2VS-105'], [/dumpkar\w*\s*60\b|6vs-?60|6вс-?60/, 'Dumpkar 6VS-60'], [/sisterna|cisterna|цистерн/, 'Sisterna'], [/platforma|платформ/, 'Platforma'], [/xopper|хоппер/, 'Xopper'], [/dumpkar|думпкар/, 'Dumpkar*']];
        var AIQ_OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr|sentyabr', 'oktabr|oktyabr', 'noyabr', 'dekabr'];
        var AIQ_OY_RU = ['январ', 'феврал', 'март', 'апрел', 'ма[йя]', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
        function aiqSer(t) { return dbN(t).replace(/[\s-]+/g, ''); }
        function aiqIso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function aiqParse(qRaw) {
            const raw = String(qRaw || ''), n = aiNorm(raw).replace(/\s+/g, ' ').trim(), L = dbN(raw);
            const P = { raw: raw, n: n, kinds: [], vtype: null, series: [], sub: [], st: null, overdue: false, win: null, past: false, age: null, yil: null, sup: null, intent: 'list', num: null, seh: null, desc: [] };
            AIQ_KIND.forEach(k => { if (k[1].test(n)) P.kinds.push(k[0]); });
            for (const [re, t] of AIQ_VTYPE) if (re.test(n)) { P.vtype = t; break; }
            // lokomotiv seriyasi (ПЭ2М, pe2u, тэм18дм ...)
            const toks = L.split(/\s+/).filter(Boolean), joined = [];
            for (let i = 0; i < toks.length; i++) { joined.push(toks[i].replace(/-/g, '')); if (i + 1 < toks.length && /^\d/.test(toks[i + 1]) && /[a-z]$/.test(toks[i])) joined.push((toks[i] + toks[i + 1]).replace(/-/g, '')); }
            const serAll = [...new Set(vagonlarData.filter(v => v.kind === 'lok').map(v => v.type))];
            serAll.forEach(s => { const k = aiqSer(s); if (joined.includes(k)) P.series.push(s); });
            if (P.series.length > 1) { const lon = Math.max(...P.series.map(s => aiqSer(s).length)); P.series = P.series.filter(s => aiqSer(s).length === lon); }
            if (P.series.length && !P.kinds.includes('lok')) P.kinds.push('lok');
            // avto / yo'l kichik turlari
            const subAll = [...new Set(vagonlarData.filter(v => v.kind === 'avto' || v.kind === 'yol').map(v => v.kind + '|' + v.type))];
            subAll.forEach(s => { const [k, t] = s.split('|'); const tt = dbN(t).replace(/[\s']+/g, ''); if (toks.some(w => w.length >= 5 && !/^(texnik|mashin|avtot)/.test(w) && tt.includes(w.slice(0, 5)))) { P.sub.push(t); if (!P.kinds.includes(k)) P.kinds.push(k); } });
            if (P.vtype && !P.kinds.includes('vag')) P.kinds.push('vag');
            // holat
            if (/muddati? ?(o.?t|utib|o.?tib|o.?tgan|kechik)|o.?tib ket|kechikkan|kechiktir|просроч|overdue/.test(n)) { P.overdue = true; P.desc.push("muddati o'tgan"); }
            else if (/ta.?mir ?talab|tamir ?talab|qizil|требу/.test(n)) { P.st = "Ta'mir talab"; P.desc.push("ta'mir talab"); }
            else if (/yaqinlash|muddati yaqin|\byaqin\b|sariq/.test(n)) { P.st = 'Yaqin'; P.desc.push('muddati yaqin'); }
            else if (/ta.?mirda|tamirda|ремонте/.test(n) && !/ta.?mirga/.test(n)) { P.st = 'Tamirda'; P.desc.push("hozir ta'mirda"); }
            else if (/\bsoz\b|исправн|yaxshi holat/.test(n)) { P.st = 'Soz'; P.desc.push('soz'); }
            // o'tgan zamon: ta'mirlangan / ta'mirdan chiqqan
            P.past = /ta.?mirlan|ta.?mirdan (chiq|o.?t)|oxirgi ta.?mir|so.?nggi ta.?mir|ta.?mir qilingan|отремонт|последн\w* ремонт/.test(n);
            // vaqt oralig'i
            const t = new Date(); t.setHours(0, 0, 0, 0);
            const mon = (y, m) => [aiqIso(new Date(y, m, 1)), aiqIso(new Date(y, m + 1, 0))];
            let m;
            if (/(shu|bu|joriy) oy|этом месяце|this month/.test(n)) { P.win = mon(t.getFullYear(), t.getMonth()); P.desc.push('shu oyda'); }
            else if (/(keyingi|kelasi|kelgusi) oy|следующ\w* месяц/.test(n)) { P.win = mon(t.getFullYear(), t.getMonth() + 1); P.desc.push('keyingi oyda'); }
            else if (/o.?tgan oy|прошл\w* месяц/.test(n)) { P.win = mon(t.getFullYear(), t.getMonth() - 1); P.desc.push("o'tgan oyda"); }
            else if (/(shu|bu|joriy) hafta|этой неделе/.test(n)) { const d = (t.getDay() + 6) % 7, a = new Date(t); a.setDate(t.getDate() - d); const b = new Date(a); b.setDate(a.getDate() + 6); P.win = [aiqIso(a), aiqIso(b)]; P.desc.push('shu haftada'); }
            else if (/(keyingi|kelasi) hafta/.test(n)) { const d = (t.getDay() + 6) % 7, a = new Date(t); a.setDate(t.getDate() - d + 7); const b = new Date(a); b.setDate(a.getDate() + 6); P.win = [aiqIso(a), aiqIso(b)]; P.desc.push('keyingi haftada'); }
            else if ((m = n.match(/(\d{1,3}) ?kun (ichida|davomida|mobaynida|ichi)|ближайшие (\d{1,3}) дн/))) { const k = +(m[1] || m[3]), b = new Date(t); b.setDate(t.getDate() + k); P.win = [aiqIso(t), aiqIso(b)]; P.desc.push(k + ' kun ichida'); }
            else if (/\bbugun|сегодня/.test(n) && !/hisobot/.test(n)) { P.win = [aiqIso(t), aiqIso(t)]; P.desc.push('bugun'); }
            else if (/\bertaga|завтра/.test(n)) { const b = new Date(t); b.setDate(t.getDate() + 1); P.win = [aiqIso(b), aiqIso(b)]; P.desc.push('ertaga'); }
            else if (/(shu|bu|joriy) yil|этом году/.test(n)) { P.win = [t.getFullYear() + '-01-01', t.getFullYear() + '-12-31']; P.desc.push('shu yilda'); }
            else if (/(keyingi|kelasi) yil|следующ\w* год/.test(n)) { P.win = [(t.getFullYear() + 1) + '-01-01', (t.getFullYear() + 1) + '-12-31']; P.desc.push('keyingi yilda'); }
            else {
                for (let i = 0; i < 12; i++) {
                    if (new RegExp('\\b(' + AIQ_OY[i] + ')\\w*').test(n) || new RegExp(AIQ_OY_RU[i]).test(n)) {
                        const ym = n.match(/\b(20\d\d)\b/); let y = ym ? +ym[1] : t.getFullYear();
                        if (!ym && !P.past && i < t.getMonth()) y++;
                        P.win = mon(y, i); P.desc.push(AIQ_OY[i].split('|')[0] + (ym ? ' ' + y : '') + ' oyida'); break;
                    }
                }
            }
            // yosh
            if ((m = n.match(/(\d{1,3}) ?(yosh|yil)\w* ?(dan|дан)? ?(oshgan|katta|ortiq|ko.?p|yuqori|ziyod|старше|более)/)) || (m = n.match(/(?:старше|более) (\d{1,3}) (?:лет|год)/))) { P.age = ['>', +m[1]]; P.desc.push(m[1] + ' yoshdan katta'); }
            else if ((m = n.match(/(\d{1,3}) ?(yosh|yil)\w* ?(dan)? ?(kichik|kam|past|yosh|младше|менее)/))) { P.age = ['<', +m[1]]; P.desc.push(m[1] + ' yoshdan kichik'); }
            if ((m = n.match(/\b(19\d\d|20\d\d)[- ]?(yil)?\w* ?(ishlab chiqarilgan|qurilgan|chiqarilgan|yasalgan|выпуск|постройк)/))) { P.yil = +m[1]; P.desc.push(m[1] + '-yil ishlab chiqarilgan'); }
            if (/eng (eski|qari|keksa)|самы\w* стар/.test(n)) P.sup = 'old'; else if (/eng (yangi|yosh)|самы\w* нов/.test(n)) P.sup = 'new';
            else if (/eng (yaqin|birinchi) (ta.?mir|muddat)|birinchi (bo.?lib )?ta.?mirga/.test(n)) P.sup = 'soon';
            // savol turi
            if (/nechta|necha(ta)?\b|soni\b|sonini|qancha|miqdor|сколько|количеств/.test(n) && !/qaysi|ro.?yxat|список|ko.?rsat/.test(n)) P.intent = 'count';
            if (/qachon|когда|sanasi|muddati qachon/.test(n)) P.intent = P.past ? 'last' : 'next';
            if (P.past && !/qachon|когда/.test(n) && P.win) P.intent = 'list';
            // seh
            if ((m = n.match(/\b([1-9]) ?-? ?(tys|ждц|sex|seh)\b/))) { P.seh = m[1]; P.desc.push(m[1] + '-TYS'); }
            // aniq raqam
            const nums = (raw.match(/\d{3,}/g) || []).filter(x => !(P.yil && +x === P.yil) && !(P.age && +x === P.age[1]) && !/^20\d\d$/.test(x) || /^\d{5,}$/.test(x));
            if (P.vtype && /^(105|115|60)$/.test(nums[0] || '')) nums.shift();
            P.num = nums[0] || null;
            return P;
        }
        function aiqPool(P) {
            let kinds = P.kinds.slice(); if (!kinds.length) kinds = ['vag', 'lok', 'yol', 'avto'];
            let l = vagonlarData.filter(v => kinds.includes(v.kind || 'vag'));
            if (P.vtype) l = l.filter(v => v.kind || (P.vtype === 'Dumpkar*' ? /^Dumpkar/.test(v.type) : v.type === P.vtype));
            if (P.series.length) l = l.filter(v => v.kind !== 'lok' || P.series.includes(v.type));
            if (P.sub.length) l = l.filter(v => !(v.kind === 'avto' || v.kind === 'yol') || P.sub.includes(v.type));
            return l;
        }
        function aiqFind(P) {
            if (!P.num) return null;
            const pool = aiqPool(P), k = P.num;
            const eq = v => [vagonNo(v), v.inv, v.zav, v.gos, v.num].some(x => x !== undefined && x !== null && String(x).replace(/\s/g, '') === k);
            let r = pool.filter(eq); if (!r.length && P.kinds.length) r = vagonlarData.filter(eq);
            return r.length === 1 ? r[0] : (r.length ? r.find(v => vagonNo(v) === k) || r[0] : null);
        }
        function aiqDays(v) { if (v.nextLabel && /davom etmoqda/.test(v.nextLabel)) return ''; return v.kun === null || v.kun === undefined ? '' : v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + ' kun qoldi'; }
        function aiqLine(v, mode) {
            const nx = v.nextLabel ? v.nextLabel : (v.keyingi ? fmtISO(v.keyingi) : '—');
            if (mode === 'last') return '• ' + unitLabel(v) + " — oxirgi ta'mir: " + (v.tamirSanasi ? fmtISO(v.tamirSanasi) : 'kiritilmagan') + (v.tamirTuri ? ' (' + v.tamirTuri + ')' : '');
            if (mode === 'age') return '• ' + unitLabel(v) + ' — ' + (unitAge(v) ?? '?') + ' yosh (' + (v.yil || '—') + '), ' + v.status;
            return '• ' + unitLabel(v) + ' — ' + v.status + ', keyingi: ' + nx + (aiqDays(v) ? ' (' + aiqDays(v) + ')' : '');
        }
        function aiqKindName(P) {
            if (P.series.length) return P.series.join(', ') + ' lokomotivlar';
            if (P.sub.length) return P.sub.join(', ');
            if (P.vtype) return (P.vtype === 'Dumpkar*' ? 'dumpkar' : P.vtype) + ' vagonlar';
            if (P.kinds.length === 1) return { vag: 'vagonlar', lok: 'lokomotivlar', yol: "yo'l texnikalari", avto: 'avtotexnikalar' }[P.kinds[0]];
            return 'texnikalar (vagon, lokomotiv, yo\'l, avto)';
        }
        function raw_(P) { return P.raw; }
        function aiQ(qRaw) {
            const P = aiqParse(qRaw), n = P.n;
            if (/\bpdf\b|пдф|hisobot\w* (tuz|qil|chiqar|tayyorla)|\bakt\b|\bакт|dalolatnoma|zayavka|заявк/.test(n)) return null;
            if (/ishga kel|davomat|kelmadi|kelmagan|kasal|ta.?til\w* (da|ol)|отпуск|табел\w* учет/.test(n) && !/vagon|lokomotiv/.test(n)) return "ℹ️ Ilovada davomat (ishga kelish, ta'til, kasallik) ma'lumotlari yuritilmaydi, shuning uchun bu savolga bazadan javob bera olmayman. Xodim haqida so'rashingiz mumkin: «@@N:389@@ telefoni», «2-TYS ustasi kim».";
            const filt = !!(P.st || P.overdue || P.win || P.age || P.yil || P.sup || P.seh);
            const typed = !!(P.kinds.length || P.series.length || P.sub.length || P.vtype);
            // xodim yoki ehtiyot qism savollari — boshqa bo'limlarga
            if (!typed && (DB_ROLES.some(r => dbN(raw_(P)).split(' ').some(t => r[0].test(t))) || /telefon|tel\b|nomer|kim\b|lavozim/.test(n))) return null;
            if (/kerak\b|me.?yor|sarf|ehtiyot|zapchast|запчаст|kolodk|колодк|material/.test(n) && !P.st && !P.overdue && !P.win && !P.age) return null;
            if (typed && !filt && !P.num && P.intent === 'next') P.desc.push("keyingi ta'mir muddati bo'yicha");
            // 1) Aniq birlik (seriya + raqam yoki "qachon ta'mirlangan")
            const u = aiqFind(P);
            if (u && (P.series.length || P.vtype || P.intent === 'last' || P.intent === 'next' && P.kinds.length)) {
                try { AIX.lastUnit = vagonNo(u); } catch (e) {}
                const age = unitAge(u);
                const head = unitLabel(u) + ' — ' + (u.naim || u.type || '') + (age !== null ? ', ' + age + ' yosh' : '') + '.';
                const last = "Oxirgi ta'mir: " + (u.tamirSanasi ? fmtISO(u.tamirSanasi) : 'kiritilmagan') + (u.tamirTuri ? ' (' + u.tamirTuri + ')' : '') + '.';
                const next = 'Keyingi: ' + (u.nextLabel || (u.keyingi ? fmtISO(u.keyingi) : '—')) + (aiqDays(u) ? ' (' + aiqDays(u) + ')' : '') + '. Holat: ' + u.status + '.';
                return head + '\n' + (P.intent === 'last' ? last + '\n' + next : next + '\n' + last);
            }
            if (P.num && !u && (P.series.length || P.vtype)) return "Kechirasiz, " + aiqKindName(P) + " orasida №" + P.num + " topilmadi. Raqamni tekshiring (zavod, inventar yoki davlat raqami).";
            if (!filt && !(typed && (P.series.length || P.sub.length || P.vtype || P.intent === 'next') && !P.num)) return null;
            if (!filt && !typed) return null;
            if (P.num && !filt) return null;
            // 2) Filtrli ro'yxat / son
            let l = aiqPool(P), mode = 'next';
            if (P.st) l = l.filter(v => v.status === P.st);
            if (P.overdue) l = l.filter(v => v.status !== 'Tamirda' && typeof v.kun === 'number' && v.kun < 0);
            if (P.seh) l = l.filter(v => new RegExp('\\b' + P.seh + '\\s*-?\\s*(тыс|tys|ждц|жд|seh|sex)|(тыс|tys|жд?ц)\\s*-?\\s*' + P.seh + '\\b', 'i').test(String(v.seh || '')));
            if (P.win) {
                const [a, b] = P.win;
                if (P.past) { l = l.filter(v => v.tamirSanasi && v.tamirSanasi >= a && v.tamirSanasi <= b); mode = 'last'; }
                else l = l.filter(v => v.keyingi && v.keyingi >= a && v.keyingi <= b);
            } else if (P.past || P.intent === 'last') mode = 'last';
            if (P.age) l = l.filter(v => { const g = unitAge(v); return g !== null && (P.age[0] === '>' ? g > P.age[1] : g < P.age[1]); });
            if (P.yil) l = l.filter(v => String(v.yil || '').includes(String(P.yil)));
            if (P.age || P.yil || P.sup === 'old' || P.sup === 'new') mode = mode === 'last' ? 'last' : 'age';
            if (P.sup === 'old') l = l.filter(v => unitAge(v) !== null).sort((x, y) => unitAge(y) - unitAge(x));
            else if (P.sup === 'new') l = l.filter(v => unitAge(v) !== null).sort((x, y) => unitAge(x) - unitAge(y));
            else if (mode === 'last') l.sort((x, y) => String(y.tamirSanasi || '').localeCompare(String(x.tamirSanasi || '')));
            else l.sort((x, y) => String(x.keyingi || '9999').localeCompare(String(y.keyingi || '9999')));
            const name = aiqKindName(P), desc = P.desc.length ? ' (' + P.desc.join(', ') + ')' : '';
            if (P.sup === 'old' || P.sup === 'new') {
                if (!l.length) return 'Bazada ' + name + " bo'yicha yoshini aniqlash uchun ishlab chiqarilgan yili kiritilmagan.";
                const top = l.slice(0, 5);
                return (P.sup === 'old' ? '🕰 Eng eski ' : '✨ Eng yangi ') + name + ':\n' + top.map(v => aiqLine(v, 'age')).join('\n');
            }
            if (!l.length) {
                let hint = '';
                if (P.overdue) { const tt = aiqPool(P).filter(v => v.status === "Ta'mir talab"); if (tt.length) hint = "\nℹ️ Muddati o'tganlari yo'q, lekin ta'mir talab (muddati juda yaqin): " + tt.length + ' ta. «' + aiqKindName(P) + " ta'mir talab» deb so'rang."; }
                return '✅ ' + name.charAt(0).toUpperCase() + name.slice(1) + desc + ' — topilmadi (0 ta).' + hint;
            }
            const max = P.intent === 'count' ? 5 : 12;
            const head = (P.intent === 'count' ? '📊 ' : '🔎 ') + name.charAt(0).toUpperCase() + name.slice(1) + desc + ': ' + l.length + ' ta.';
            let byK = '';
            if (!P.kinds.length || P.kinds.length > 1) { const c = {}; l.forEach(v => { const k = { vag: 'vagon', lok: 'lokomotiv', yol: "yo'l texnikasi", avto: 'avto' }[v.kind || 'vag']; c[k] = (c[k] || 0) + 1; }); byK = '\n' + Object.entries(c).map(([k, x]) => k + ': ' + x).join(' · '); }
            return head + byK + '\n' + l.slice(0, max).map(v => aiqLine(v, mode)).join('\n') + (l.length > max ? '\n... va yana ' + (l.length - max) + ' ta. To\'liq ro\'yxat uchun: «' + name + ' ro\'yxatini pdf qil».' : '');
        }
        // Xodim: "ICHTB boshlig'i", "2-TYS ustasi" — bo'lim nomi bo'yicha aniqlash
        (function () {
            dbPeopleReply = agmkExtend('dbPeopleReply', '29-bosqich (2): AI savol tahlili — filtrlar, muddatlar, yosh, seriya, aniq birlik · Xodim: "ICHTB boshligʼi", "2-TYS ustasi" — boʼlim nomi boʼyicha aniqlash', dbPeopleReply, o => function (q) {
                try {
                    const n = dbN(q), roles = DB_ROLES.filter(r => n.split(' ').some(t => r[0].test(t)));
                    const U = []; let m;
                    const re = /\b([1-9]\s*-?\s*(?:tys|sex|seh))\b|\b(ichtb|ichb|pto|upjt|upzht|sttb|otk|ptb|ttb|jdts|tch|pch|shch)\b/g;
                    while ((m = re.exec(n))) U.push((m[1] || m[2]).replace(/\s+/g, ''));
                    if (roles.length && U.length) {
                        // v3.2: shtat roʻyxatidagi xodim — boʻlinmasi boʻyicha («2-TYS» = TYS-2 sexi); lavozim matnidagi eslatma (masalan «… (2-TYS tashqi transporti uchastkasi)» 4-TYS da) — ikkinchi darajali
                        const unitOf = r => { const k = dbN(r.su || ''); const mm = k.match(/tys-(\d)/); return mm ? mm[1] + '-tys' : ''; };
                        const sc = r => { const lv = dbN(r.item.lavozim || '').replace(/(\d)\s*-?\s*(tys|sex|seh)/g, '$1-$2'); if (!roles.some(ro => ro[1].test(lv))) return 0; const bu = unitOf(r), num = U.filter(u => /^\d/.test(u)).map(u => u.replace(/(\d)-?(sex|seh)/, '$1-tys').replace(/(\d)-?/, '$1-'));
                            if (num.length && num.every(u => bu === u) && U.every(u => /^\d/.test(u) || lv.split(' ').includes(u))) return 2;
                            return U.every(u => lv.replace(/\s+/g, '').includes(u.replace(/(\d)-?/, '$1-')) || lv.split(' ').includes(u)) ? 1 : 0; };
                        const S0 = dbPeople().map(r => ({ r: r, s: sc(r) })).filter(x => x.s > 0), top = Math.max(0, ...S0.map(x => x.s));
                        const ppl = S0.filter(x => x.s === top).map(x => x.r);
                        const exact = ppl.filter(r => !/o.?rinbosar|zamestit|\bv\.? ?b\b|\bi\.? ?o\b/.test(dbN(r.item.lavozim || '')) || /o.?rinbosar|\bv\.? ?b\b/.test(n));
                        let base = exact.length ? exact : ppl; const xw = ['stansiya', 'depo', 'uchastka', 'smena', 'xizmat', 'navbatchi', 'punkt'].filter(w => n.includes(w)); if (xw.length) { const f = base.filter(r => xw.every(w => dbN(r.item.lavozim + ' ' + (r.item.bolim || '')).includes(w))); if (f.length) base = f; }
                        let pick = base.slice(0, 8);
                        if (roles.some(ro => ro[2] === 'boshliq') && !/stansiya|depo|uchastka|smena|xizmat/.test(n)) { const sb = pick.filter(r => /^(sex|bo.?lim|xizmat|karyer) boshli/.test(dbN(r.item.lavozim || ''))); if (sb.length) pick = sb; }
                        if (pick.length === 1 && cleanTabel(pick[0].item.tabel)) { const r1 = o.call(this, 'tabel ' + cleanTabel(pick[0].item.tabel) + ' ' + q); if (r1) return r1; }
                        if (pick.length) {
                            const sur = pick.map(r => { const w = dbN(r.item.name).replace(/^[a-z]\s+/, '').split(/[\s.]+/).filter(x => x.length >= 3); return w.sort((a, b) => b.length - a.length)[0]; }).filter(Boolean);
                            const r2 = o.call(this, q + ' ' + sur.join(' '));
                            if (r2) return r2;
                        }
                    }
                } catch (e) {}
                return o.apply(this, arguments);
            });
        })();
        (function () {
            aiStage('Texnika bazasi', function (q, next) {
                try { const r = aiQ(q); if (r) return { t: /^ℹ️/.test(r) ? r : r + '\n📚 Manba: texnika bazasi', personal: false }; } catch (e) { console.error(e); }
                return next(q);
            });
        })();

        /* ---- Bosh sahifa qidiruvi: savol yozilsa — AI javobi ham chiqadi ---- */
        (function () {
            filterMainMenu = agmkExtend('filterMainMenu', '29-bosqich (2): AI savol tahlili — filtrlar, muddatlar, yosh, seriya, aniq birlik', filterMainMenu, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const inp = $id('globalSearchInput'), q = (inp.value || '').trim();
                    let box = $id('mainAiAns');
                    if (!box) { box = document.createElement('div'); box.id = 'mainAiAns'; const list = $id('main-card-list'); list.parentNode.insertBefore(box, list); }
                    if (!q) { box.innerHTML = ''; return r; }
                    const cards = [...document.querySelectorAll('#main-card-list .btn-card')].filter(c => c.style.display !== 'none').length;
                    const qWords = q.split(/\s+/).length;
                    if (cards && qWords < 2 && !/\d{3,}/.test(q)) { box.innerHTML = ''; return r; }
                    if (typeof secCheck === 'function' && secCheck(q)) { box.innerHTML = ''; openAiChat('Bosh sahifa'); setTimeout(() => { try { aiSendText(q); } catch (e) {} }, 300); return r; }
                    const L = aiLocalAnswer(q);
                    if (!L || L.help) { box.innerHTML = cards ? '' : `<div class="mai-card"><div class="mai-h">${typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : '🤖'}AI</div><div class="mai-t">${escapeHtml(aiClarify())}</div><button class="mini-btn" onclick="openAiChat('Bosh sahifa'); setTimeout(()=>aiSendText($id('globalSearchInput').value),300)">💬 AI bilan suhbatda so'rash</button></div>`; if (!cards) $id('main-search-empty').classList.add('hidden'); return r; }
                    box.innerHTML = `<div class="mai-card"><div class="mai-h">${typeof AI_ICO_S !== 'undefined' ? AI_ICO_S : '🤖'}AI javobi</div><div class="mai-t">${escapeHtml(L.t)}</div><div class="mai-b"><button class="mini-btn" onclick="openAiChat('Bosh sahifa'); setTimeout(()=>aiSendText($id('globalSearchInput').value),300)">💬 Suhbatda davom etish</button><button class="mini-btn" onclick="try{speakAiText($id('mainAiAns').querySelector('.mai-t').innerText)}catch(e){}">🔊 O'qib berish</button></div></div>`;
                    $id('main-search-empty').classList.add('hidden');
                } catch (e) { console.error(e); }
                return r;
            });
        })();

