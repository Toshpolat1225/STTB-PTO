
        // =====================================================================
        // v3.0 — 🧠 SAVOLNI TUSHUNISH: bir savol turli xil so'ralsa ham bir xil tushuniladi
        //  • Kirill yozuvidagi o'zbekcha → lotin; ruscha asosiy iboralar → o'zbekcha ma'no
        //  • Xato yozilgan so'zlar (bir-ikki harf tushgan/almashgan) → to'g'ri so'z (faqat soha lug'atidagilar)
        //  • «iltimos», «ayt-chi», «bilasanmi» kabi qo'shimchalar olib tashlanadi; sklad→ombor, remont→ta'mir …
        //  • Yangi javoblar: kunlik polojeniya, MTTB kelgan/qabul qilingan, xodimlar soni
        //  Sinov: test/ai500 — 500+ savol (lotin/kirill, ruscha, xato yozuv, qisqa/uzun).
        // =====================================================================
        var AIN_CYR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': "'", 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h' };
        // O'zbekcha kirill matnini tanish: maxsus harflar yoki tipik o'zbekcha so'zlar
        var AIN_UZCYR = /[ўқғҳ]|(^|\s)(нима|нечта|неча|қанча|борми|бор|менинг|менга|бугун|бугунги|кимлар|ким|қайси|кўрсат|ёз|туз|қил|ишлар|вагонлар|таъмир|таъмирда|омбор|келди|кел|қабул|полож|ой|графиги|ҳақида|учун|керак|ҳисобот|ачот|текшир|далолатнома|актини|ишларим|муддат|тиббий|кўрик|ходимлар|сони|эслат|эртага|индинга|шрифт|шрифтни|фонни|положения|кечаги)(\s|$|[а-яё])/i, AIN_UZSUF = /[а-яё](ни|ларни|нинг|даги|дан|ларда|лар|ми|чи|иб|ган|ди|им|рим|ларим|ингиз)(\s|$)|(^|\s)(билан|учун|эмас|керак|бўлган|нима|ҳам|мен|сен|бизда|қилинг|беринг)(\s|$)/i, AIN_RUW = /(^|\s)(мои|моё|мой|что|как|где|сколько|какие|какой|есть|пришло|задачи|дела|покажи|открой|для|это|все|всё|нужно|надо)(\s|$)/i;
        var AIN_RU = [
            [/что\s+(есть|осталось)\s+на\s+склад[а-яё]*|остат[а-яё]*\s+(на\s+)?склад[а-яё]*/g, "omborda nima qoldi"],
            [/(поступлени[а-яё]*\s+запчаст[а-яё]*|что\s+пришло\s+на\s+склад[а-яё]*)/g, 'ehtiyot qismlar keldimi'],
            [/(что|кто)\s+(мне\s+)?(пришло|пришли|пришел)|уведомлени[а-яё]*|новые\s+сообщени[а-яё]*/g, 'bildirishnomalarimga nima keldi'],
            [/мои\s+задачи|что\s+мне\s+(сегодня\s+)?делать|мои\s+дела/g, 'mening ishlarim'],
            [/медосмотр[а-яё]*/g, "tibbiy ko'rik"], [/инструктаж[а-яё]*/g, 'instruktaj'], [/просроч[а-яё]*/g, "muddati o'tgan"], [/в\s+этом\s+месяце/g, 'shu oy'],
            [/(распечата[а-яё]*|печат[а-яё]*|напечата[а-яё]*)/g, 'pechat qil'], [/состав[а-яё]*\s+акт[а-яё]*|оформи[а-яё]*\s+акт[а-яё]*/g, 'akt tuz'],
            [/провер[а-яё]*\s+отч[её]т[а-яё]*|отч[её]т[а-яё]*\s+провер[а-яё]*/g, 'hisobotni tekshir'],
            [/суточн[а-яё]*\s+положени[а-яё]*|положени[а-яё]*(\s+на\s+сегодня)?/g, 'bugungi polojeniya'],
            [/(сколько|количество)\s+(сотрудник|работник|рабочих|людей)[а-яё]*/g, 'xodimlar soni'],
            [/что\s+(есть|осталось)\s+на\s+склад[а-яё]*|остат[а-яё]*\s+(на\s+)?склад[а-яё]*/g, "omborda nima qoldi"],
            [/(поступлени[а-яё]*\s+запчаст[а-яё]*|что\s+пришло\s+на\s+склад[а-яё]*)/g, 'ehtiyot qismlar keldimi'],
            [/оформи[а-яё]*\s+заявк[а-яё]*\s+на\s+/g, 'zayavka tuz: '],
            [/график[а-яё]*\s+ремонт[а-яё]*\s+на\s+(\S+)/g, "$1 ta'mir grafigi"],
            [/кто\s+такой\s+(\S+)/g, '$1 kim'], [/телефон\s+(\S+?)(а|ы|я)?(\s|$)/g, '$1 telefoni '],
            [/сколько\s+тепловоз[а-яё]*/g, 'nechta teplovoz bor'], [/сколько\s+вагон[а-яё]*\s+в\s+ремонте|какие\s+вагоны\s+в\s+ремонте/g, "qaysi vagonlar ta'mirda"],
            [/вагон[а-яё]*\s+требующ[а-яё]*\s+ремонт[а-яё]*|сколько\s+вагонов\s+требуют\s+ремонт[а-яё]*/g, "ta'mir talab vagonlar"], [/сколько\s+вагонов|количество\s+вагонов/g, 'nechta vagon bor'],
            [/толщин[а-яё]*\s+колодк[а-яё]*/g, 'kolodka qalinligi necha mm'], [/высот[а-яё]*\s+автосцепк[а-яё]*/g, 'avtostsepka balandligi necha mm']
        ];
        var AIN_SYN = [
            [/\bsklad(da|dagi|ga|dan)?\b/g, (m, s) => 'ombor' + (s || '')], [/\bremont(da|dagi|ga|dan|i)?\b/g, (m, s) => "ta'mir" + (s || '')],
            [/\b(otchot|achot|atchot|otchet|ochot)(ni|lar|larni|i|ini|im)?\b/g, (m, a, s) => 'hisobot' + (s || '')],
            [/\b(printer|pinter|printr)(ga|da)?\s*(yubor|chiqar|ber)\w*/g, 'pechat qil'], [/\b(chop\s*et|chiqarib\s*ber|pechatla|raspechat\w*)\b/g, 'pechat qil'],
            [/\bzapchast(lar|ni|lari)?\b/g, (m, s) => 'zapchast' + (s || '')], [/\b(poloj\w*|polozh\w*|polojeniy\w*|polajeniya)\b/g, 'polojeniya'],
            [/\b(ishchilar|odamlar)\s+(soni|qancha)|\b(qancha|nechta)\s+(odam|kishi|ishchi)\b/g, 'xodimlar soni'],
            [/\bne\b(?=\s+(keldi|yangilik|bor|qil|gap|qilay|qilishim))/g, 'nima'], [/\bnimalar\b/g, 'nima'], [/\b(uvedomleniya|uvedomleniy|uvedomlen)\w*/g, 'bildirishnomalar'], [/\bbarmi\b/g, 'bormi'], [/\bbormikan\b/g, 'bormi'],
            [/\b(ko.?rsat)(vor|ib yubor|ib qo.?yin|iŋ)\b/g, "ko'rsat"], [/\b(qivor|qilvor|qilib ber)\b/g, 'qil'],
            [/\bforma\s*-?\s*30\s+(bilan\s+)?solishtir\w*/g, 'hisobotni tekshir forma 30'], [/\b(nima\s+yangilik\s+bor(\s+menga)?|menga\s+nima\s+yangilik)\b/g, 'bildirishnomalarimga nima keldi'],
            [/\bnima\s+keldi\s+ombor\w*/g, 'omborga nima keldi'], [/\bmehnat\s+muhofazasi\s+muddatlari\b/g, "mehnat muhofazasi muddati o'tganlar va shu oy"]
        ];
        var AIN_FILL = /^\s*(iltimos|menga|mana|qani|xo.?sh|ayt-?chi|aytchi|ayting|bilasanmi|bilasizmi|sen|siz|hey|ey ai|ai)[\s,:!-]+/i;
        // Soha lug'ati — xato yozuvni tuzatish shu so'zlarga qarab (boshqa so'zlarga tegmaydi)
        var AIN_VOC = ("vagon vagonlar vagonni vagonning vagonlari lokomotiv lokomotivlar teplovoz teplovozlar texnika texnikalar xodim xodimlar xodimlarni ishchilar lavozim shtat uchastka uchastkada uchastkalardagi " +
            "ta'mir ta'mirda ta'mirga ta'mirdan ta'miri ta'mirlanishi talab muddati muddatlari muddatlarim o'tgan o'tganlar o'tganlar ro'yxati ro'yxatini qaysilar kerak bo'lgan " +
            "grafik grafigi grafigini grafiklar jadvali jadvalini oktyabr sentyabr noyabr dekabr avgust yanvar fevral mart aprel iyun iyul kelgusi keyingi ko'rsat ko'rsatib " +
            "pechat printer dalolatnoma dalolatnomasini dalolatnomani akt aktini aktni likvidatsiya razukomplektovka hujjat hujjatni " +
            "hisobot hisobotni hisobotlar tekshir tekshiruv tekshirib solishtir zamechaniya bildirishnoma bildirishnomalar bildirishnomalarimga bildirishnomalarni xabarlar xabarlarimni " +
            "ishlarim vazifalarim vazifalar bugungi instruktaj tibbiy ko'rik mehnat muhofazasi bilim sinovi yo'l-yo'riq " +
            "ombor omborda omborga qoldig'i qoldi zapchast zapchastlar zapchastlar ehtiyot qismlar keldimi kelgan qabul qilinganlar qilinmagan qilishim zayavka zayavkaga kolodka kolodkaga kolodkasi " +
            "temir temiryo'l yo'l yo'li sxema sxemasi sxemani xarita xaritasi stansiya stansiyasi peregon okolotka strelka svetofor depo kapital joriy tayyor chiqar chiqarildi yubor yuboring jo'nat tashla imzo imzoga imzola komissiya rahbar rahbarga boshliq boshlig'i usta master muhandis almashtir o'zgartir kattalashtir kichraytir shrift shriftni fonni fon logotip eslat eslatma ertaga indinga soat daqiqa daqiqadan keyin kechagi kecha bugungi telegram telegramga pochta xabar yozishma akti akt aktni dalolatnomasi necha nechi nechanchi qaysi qachon qayerda qayerga qanday qanaqa bormi yoqmi kimlar kimning haqida uchun bilan kerak emas bugun ertaga kecha hozir shu oy yil kun hafta oyda oyga bo'ladi bo'lsa qiling qilib berish bering ayting yozing yozib tuzib tuzing chiqar chiqqan kelgan ketgan qoldi qolgan hammasi barcha jami umumiy eski yangi katta kichik soz nosoz holati holat haqida sabab kerakmi mumkin mumkinmi nechta qancha raqami raqamini telefoni yangilik yangiliklar almashtir o'tkaz ko'chir skladda sklad ombordagi mening menga bizda polojeniya kunlik poyezdlar poyezd qayerda qilishim qilinishi kerak g'ildirak g'ildirak prokati prokat avtostsepka balandligi qalinligi diametri normasi norma formula formulalar").split(/\s+/).filter(Boolean);
        var AIN_VSET = null;
        function ainKey(w) { return String(w).toLowerCase().replace(/[ʻʼ‘’`']/g, ''); }
        function ainLev(a, b, max) {
            if (Math.abs(a.length - b.length) > max) return max + 1; const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, j) => j);
            for (let i = 1; i <= m; i++) { const cur = [i]; let best = i; for (let j = 1; j <= n; j++) { const c = a[i - 1] === b[j - 1] ? 0 : 1; cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c); if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev[j - 2] !== undefined ? prev[j - 2] + 1 : cur[j]); best = Math.min(best, cur[j]); } if (best > max) return max + 1; prev = cur; }
            return prev[n];
        }
        function ainFix(word) {
            const k = ainKey(word); if (k.length < 4 || /\d/.test(k)) return word;
            if (!AIN_VSET) { AIN_VSET = new Map(); AIN_VOC.forEach(w => AIN_VSET.set(ainKey(w), w)); }
            if (AIN_VSET.has(k)) return AIN_VSET.get(k);
            for (const vk of AIN_VSET.keys()) if (vk.length >= 5 && k.length > vk.length && k.startsWith(vk) && /^(i|si|ni|ning|ga|da|dan|lar|lari|larni|larga|larda|ning|im|imni|ingiz|miz|mi|chi|dagi|gacha|sini|siga|sida|ni|u|ki|ku|ham)+$/.test(k.slice(vk.length))) return word; // lug'at so'zi + qo'shimcha (zayavkasi, polojeniyani …) — to'g'ri so'z
            const max = k.length >= 9 ? 2 : 1; let best = null, bd = max + 1;
            for (const [vk, vw] of AIN_VSET) { if (vk[0] !== k[0] || (k.length < 5 && (vk.length < 5 || vk[1] !== k[1]))) continue; const d = ainLev(k, vk, max); if (d < bd) { bd = d; best = vw; } }
            return bd <= max ? best : word;
        }
        function ainCyrToLat(s) { return String(s).replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g, ch => { const lo = ch.toLowerCase(), r = AIN_CYR[lo]; return r === undefined ? ch : r; }).replace(/(^|\s)e/g, '$1e'); }
        function ainNormalize(q) {
            let s = String(q || '').trim(); const orig = s; if (!s) return s;
            s = s.replace(/[?!.]+\s*$/, '').trim(); let prev; do { prev = s; s = s.replace(AIN_FILL, ''); } while (s !== prev);
            let low = s.toLowerCase();
            if (/[а-яё]/i.test(low)) {
                if (!AIN_RUW.test(low) && (AIN_UZCYR.test(low) || (AIN_UZSUF.test(low) && !/(ть|ся|ый|ий|ая|ое|ые|ого|ему|ных)(\s|$)/.test(low)))) low = ainCyrToLat(low);                 // o'zbekcha kirill → lotin
                else { AIN_RU.forEach(([re, to]) => { low = low.replace(re, to); }); } // ruscha iboralar
            }
            AIN_SYN.forEach(([re, to]) => { low = low.replace(re, to); });
            low = low.split(/(\s+)/).map(w => /\s/.test(w) ? w : w.replace(/^([^\wʻʼ'`’а-яё]*)(.*?)([^\wʻʼ'`’а-яё]*)$/i, (m, a, b, c) => a + ainFix(b) + c)).join('');
            AIN_SYN.forEach(([re, to]) => { low = low.replace(re, to); });
            low = low.replace(/\s+/g, ' ').trim();
            try { low = ainPersonRewrite(low); } catch (e) {}
            return low === orig.toLowerCase() ? orig : low;
        }
        // Odam ismi xato yozilsa ham: «@@N:398@@ni top», «@@N:389@@ haqda», «@@N:389@@ning raqami» → «@@N:389@@ kim / telefoni»
        var AIN_PPL = null;
        function ainPersonRewrite(low) {
            if (!/(kim|top|haqida|haqda|telefon|telfon|raqam|nomer|lavozim|qayerda ishlaydi)/.test(low) || typeof pplList !== 'function') return low;
            if (!AIN_PPL || AIN_PPL.t < Date.now() - 60000) { const m = new Map(); try { pplList().forEach(p => { const w = String(p.name || '').split(/[\s.]+/).filter(x => x.length >= 5)[0]; if (w) m.set(ainKey(w), w); }); } catch (e) {} AIN_PPL = { t: Date.now(), m: m }; }
            const toks = low.split(/\s+/); let who = null;
            for (const t of toks) { const k = ainKey(t).replace(/(larning|ning|niki|ni|ga|dan|da)$/, ''); if (k.length < 5 || AIN_VOC.some(v => ainKey(v) === k)) continue; const mx = k.length >= 8 ? 2 : 1; for (const [pk, pw] of AIN_PPL.m) { if (pk[0] !== k[0]) continue; if (pk === k || ainLev(k, pk, mx) <= mx) { who = pw; break; } } if (who) break; }
            if (!who) return low;
            return who + (/(telefon|telfon|raqam|nomer)/.test(low) ? ' telefoni' : ' kim');
        }
        // ---------- Yangi javoblar ----------
        function ainPolAnswer(n) {
            if (!/polojeniya|uchastka\w*\s*(dagi)?\s*vagon|qaysi uchastkada|ta.?mirdan chiq\w* vagon|ta.?mirga yuborilgan vagon/.test(n) || typeof polItems !== 'function') return null;
            const D = todayISO(), G = polItems(D), all = [].concat(...G.map(g => g.list)), inR = all.filter(x => !x.out), out = all.filter(x => x.out), nw = all.filter(x => x.newToday);
            setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} polOpen(D); }, 700);
            if (!all.length) return { t: '📋 Kunlik polojeniya (' + fmtISO(D) + '): hozir taʼmirda vagon yoʻq.\n📚 Manba: vagon pasportlari (taʼmirga yuborish / tayyor)', personal: false };
            return { t: '📋 Kunlik polojeniya (' + fmtISO(D) + '): taʼmirda ' + inR.length + ' ta' + (out.length ? ', bugun chiqarildi ' + out.length + ' ta' : '') + (nw.length ? ', bugun yuborildi ' + nw.length + ' ta' : '') + '.\n'
                + G.map(g => '• ' + g.uch + ': ' + g.list.map(x => (POL_RT_TG[x.rt] ? POL_RT_TG[x.rt] + '-' : '') + x.no + (x.out ? ' ✅' : '')).join(', ')).join('\n') + '\n📚 Manba: vagon pasportlari (taʼmirga yuborish / tayyor)', personal: false };
        }
        function ainMtAnswer(n) {
            if (typeof mtData !== 'function') return null;
            if (!/qabul qilin|qabul qilishim|kelgan zapchast|ehtiyot qism\w* kel|zapchast\w* kel|omborga (nima )?kel|nima keldi omborga|zapchast keldimi/.test(n)) return null;
            const d = mtData(), wait = d.kir.filter(k => !k.acc), acc = d.kir.filter(k => k.acc).sort((a, b) => String(b.acc.at).localeCompare(String(a.acc.at))), today = todayISO(), kt = d.kir.filter(k => locISO(k.at) === today);
            setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} openMTTB(/qabul qilingan/.test(n) ? 'qab' : 'kir'); }, 700);
            const L = [];
            L.push('📥 Bugun kelgan: ' + (kt.length ? kt.length + ' ta kirim — ' + kt.map(k => k.items.map(i => i.n + ' ' + i.q + ' ' + (i.u || '')).join(', ')).join('; ') : 'qayd qilinmagan'));
            L.push('⏳ Qabul qilinmagan: ' + (wait.length ? wait.length + ' ta' : 'yoʻq'));
            if (acc.length) L.push('✅ Oxirgi qabul: ' + fmtDT(acc[0].acc.at) + ' — ' + mtPerson(acc[0].acc.by) + ' (' + (MT_HOLAT[acc[0].acc.holat] || MT_HOLAT.soz)[1].toLowerCase() + ')');
            return { t: L.join('\n') + '\n📚 Manba: MTTB boʻlimi', personal: false };
        }
        function ainGrafik(n) {
            if (!/(ta.?mir\s+)?(grafig\w*|jadval\w*)\s*(ni|ini)?\s*(ko.?rsat|och)|^(ta.?mir\s+)?grafik$/.test(n) || /\d{3,}|pechat/.test(n) || typeof pprOpen !== 'function') return null;
            const d = pprDB(); setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} pprOpen(); }, 700);
            return { t: d ? '🗓 Taʼmir grafigi ochilmoqda (' + pprMName(pprCurM()) + ').' : '🗓 Taʼmir grafigi hali yuklanmagan — ochilgan oynada oylik jadval (Excel) ni yuklang.', personal: true };
        }
        function ainXodimCount(n) {
            if (!/(xodim|ishchi)\w*\s+(soni|qancha|nechta|jami)|(nechta|qancha|jami)\s+(xodim|ishchi)|xodimlar ro.?yxati/.test(n) || typeof allXodims !== 'function') return null;
            const L = allXodims(), by = {}; L.forEach(r => { const k = r.su || r.sub || r.unit || r.seh || '—'; by[k] = (by[k] || 0) + 1; });
            const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8);
            return { t: '👷 Xodimlar soni: jami ' + L.length + ' kishi.' + (top.length > 1 ? '\n' + top.map(([k, v]) => '• ' + k + ': ' + v).join('\n') : '') + '\n📚 Manba: xodimlar bazasi', personal: true };
        }
        // ---------- v3.1: yangi buyruqlar ----------
        var AIN_UCH = [[/kapital/, 'kapital'], [/depo/, 'depo'], [/1.?tys|1.?тйс|birinchi tys|vtp/, '1-tys'], [/2.?tys|2.?тйс|ikkinchi tys/, '2-tys']];
        function ainVagonOf(n) { try { const R = numResolve(n); if (R && R.hits && R.hits.length === 1) return R.hits[0]; } catch (e) {} const m = n.match(/\b(\d{3,8})\b/); if (!m) return null; const L = onlyVagons().filter(v => String(vagonNo(v)).replace(/^0+/, '') === m[1].replace(/^0+/, '')); return L.length === 1 ? L[0] : null; }
        function ainCmd(n) {
            // Shrift
            if (/(shrift|harf|matn|yozuv)\w*/.test(n) && /(katta|kichik|kichray|oddiy|asl|normal)/.test(n) && typeof dsgFont === 'function') {
                const c = (dsgCfg().fs || 100), v = /(oddiy|asl|normal)/.test(n) ? 100 : /(kichik|kichray)/.test(n) ? c - 15 : c + 15;
                setTimeout(() => dsgFont(v), 300); return { t: '🔠 Shrift oʻlchami: ' + Math.max(80, Math.min(170, v)) + '%.', personal: true };
            }
            if (/\bfon\w*/.test(n) && /(almashtir|o.?zgartir|qo.?y|tanla|yukla)/.test(n) && typeof dsgOpen === 'function') { setTimeout(() => { try { aicClose(); } catch (e) {} dsgOpen(); }, 400); return { t: '🖼 Fon sozlamalari ochilmoqda — rasmni tanlang.', personal: true }; }
            // Blanka hujjatlari
            if (typeof cxOpen === 'function' && !/(pechat|chop|yubor|jo.?nat|tashla)/.test(n)) {
                const t = /(pri(e|yo|o|jo)m|приём|прием|qabul qilish (ishchi )?komissiya)/.test(n) && /(akt|dalolatnoma|och|tuz|yoz)/.test(n) ? 'priem' : /(razukomplekt|razuk|likvidats|разукомп)/.test(n) ? 'razuk' : /kalkulyats/.test(n) ? 'calc' : null;
                if (t) { setTimeout(() => { try { aicClose(); } catch (e) {} cxOpen(t); }, 400); return { t: '📄 «' + CX_T[t][1] + '» oynasi ochilmoqda.', personal: true }; }
            }
            // Polojeniya: kechagi / Telegramga
            if (/polojeniya/.test(n) && typeof polOpen === 'function') {
                if (/(telegram|tashla|yubor|jo.?nat|ulash)/.test(n)) { setTimeout(() => { try { aicClose(); } catch (e) {} POL.date = todayISO(); polShare(); }, 400); return { t: '📤 Bugungi polojeniya Telegram formatida tayyorlandi — guruhni tanlang.', personal: true }; }
                if (/(kecha|kechagi|вчера)/.test(n)) { const d = polShift(todayISO(), -1), G = polItems(d), all = [].concat(...G.map(g => g.list)); setTimeout(() => { try { aicClose(); } catch (e) {} polOpen(d); }, 600); return { t: '📋 ' + fmtISO(d) + ' polojeniyasi: taʼmirda ' + all.filter(x => !x.out).length + ' ta' + (all.some(x => x.out) ? ', chiqarildi ' + all.filter(x => x.out).length + ' ta' : '') + '.', personal: false }; }
            }
            // «8121 ni taʼmirga yubor, depo, DR» / «8121 tayyor, JDTs-1 ga»
            if (/(ta.?mirga|remontga) (yubor|jo.?nat|ber|qo.?y)(ing|gin|ib qo.?y)?\b/.test(n) && typeof markVagonAsTamirda === 'function') {
                const v = ainVagonOf(n); if (!v) return { t: '❓ Qaysi vagon? Raqamini ayting: «8121 ni taʼmirga yubor, depo, DR».', personal: true };
                const rt = /\bkr\b|kapital/.test(n) ? 'KR' : /\bdr\b|depo ta/.test(n) ? 'DR' : /\btr\b|joriy/.test(n) ? 'TR' : /nosoz|to.?satdan/.test(n) ? 'NS' : '';
                const C = polCfg(), ux = AIN_UCH.find(([re]) => re.test(n)), uch = ux ? (C.uch.find(u => u.toLowerCase().indexOf(ux[1]) >= 0) || '') : '';
                if (!rt || !uch) { setTimeout(() => { try { aicClose(); } catch (e) {} activeVagonId = v.id; openPassport(v.id); POL.preset = null; markVagonAsTamirda(); }, 400); return { t: '🔧 № ' + vagonNo(v) + ' — taʼmir turi va uchastkani tanlang (oyna ochildi).', personal: true }; }
                setTimeout(() => aisCountdown('🔧 Taʼmirga yuborish', '<div class="nd-tip">№ <b>' + escapeHtml(vagonNo(v)) + '</b> → ' + escapeHtml(uch) + ' (' + escapeHtml(POL_RT[rt]) + ')</div>', 5, () => { activeVagonId = v.id; POL.preset = { rt: rt, uch: uch }; markVagonAsTamirda(); }), 300);
                return { t: '🔧 № ' + vagonNo(v) + ' → ' + uch + ', ' + POL_RT[rt] + '. 5 soniyada yuboriladi («Bekor» bilan toʻxtatish mumkin).', personal: true };
            }
            if (/(tayyor|ta.?mirdan chiq)/.test(n) && typeof polRelease === 'function' && /\d{3,}/.test(n)) {
                const v = ainVagonOf(n); if (!v) return null; if (v.status !== 'Tamirda') return { t: 'ℹ️ № ' + vagonNo(v) + ' hozir taʼmirda emas (holati: ' + v.status + ').', personal: true };
                const SU = typeof subUnits11 !== 'undefined' ? subUnits11 : [], jm = n.match(/(jd?ts|ждц|zhdts)\s*-?\s*(\d)/), tm = n.match(/tys\s*-?\s*(\d)/);
                const sx = jm ? SU.find(s0 => new RegExp('ЖДЦ-' + jm[2]).test(s0)) : tm ? SU.find(s0 => new RegExp('^TYS-' + tm[1]).test(s0)) : null;
                if (!sx) { setTimeout(() => { try { aicClose(); } catch (e) {} polRelease(v.id); }, 400); return { t: '✅ № ' + vagonNo(v) + ' — qaysi sehga berilganini tanlang (oyna ochildi).', personal: true }; }
                setTimeout(() => aisCountdown('✅ Taʼmirdan chiqarish', '<div class="nd-tip">№ <b>' + escapeHtml(vagonNo(v)) + '</b> → ' + escapeHtml(sx) + '</div>', 5, () => { POL.relPreset = sx; polRelease(v.id); }), 300);
                return { t: '✅ № ' + vagonNo(v) + ' taʼmirdan chiqariladi → ' + sx + ' (5 soniyada).', personal: true };
            }
            // Eslatma
            if (/eslat|напомн/.test(n)) return ainRemindAdd(n);
            return null;
        }
        // ---------- ⏰ Eslatmalar (shu qurilmada) ----------
        var AIN_REM_KEY = 'agmk_reminders';
        function ainRemindAdd(n) {
            const now = new Date(), d = new Date(now); let day = 0;
            if (/indinga|послезавтра/.test(n)) day = 2; else if (/ertaga|завтра/.test(n)) day = 1;
            const m = n.match(/(?:soat\s*)?\b(\d{1,2})(?:[:.](\d{2}))?\s*(da|ga|в|часов)\b/), mm = n.match(/(\d{1,3})\s*(daqiqa|minut|мин)/), hh = n.match(/(\d{1,2})\s*(soat)(dan)?\s*(keyin|so.?ng)/);
            if (mm && /(keyin|so.?ng|через)/.test(n)) d.setMinutes(d.getMinutes() + +mm[1]);
            else if (hh) d.setHours(d.getHours() + +hh[1]);
            else if (m && +m[1] <= 23) { d.setDate(d.getDate() + day); d.setHours(+m[1], m[2] ? +m[2] : 0, 0, 0); if (!day && d <= now) d.setDate(d.getDate() + 1); }
            else return { t: '⏰ Qachon eslatay? Masalan: «ertaga 9 da eslat: kolodka zayavkasi» yoki «30 daqiqadan keyin eslat …».', personal: true };
            const txt = n.replace(/^.*?eslat(ib qo.?y|gin|ing|ib)?\s*[:,-]?\s*/, '').trim() || 'eslatma';
            const L = kvGet(AIN_REM_KEY, []); L.push({ id: uid('r'), at: d.toISOString(), t: txt, by: (currentUser && currentUser.tabel) || '' }); kvSet(AIN_REM_KEY, L);
            return { t: '⏰ Eslataman: ' + fmtDT(d.toISOString()) + ' — «' + txt + '».', personal: true };
        }
        function ainRemindTick() {
            const L = kvGet(AIN_REM_KEY, []), now = Date.now(), due = L.filter(r => Date.parse(r.at) <= now); if (!due.length) return;
            kvSet(AIN_REM_KEY, L.filter(r => Date.parse(r.at) > now));
            due.forEach(r => { try { notify({ icon: '⏰', text: 'Eslatma: ' + r.t, toTabel: r.by || undefined }); } catch (e) {} try { if (typeof speakAiText === 'function') speakAiText('Eslatma: ' + r.t); } catch (e) {} try { showToast('⏰ ' + r.t); } catch (e) {} });
        }
        try { if (typeof SEC_EV !== 'undefined') SEC_EV.fns.push(ainRemindTick); } catch (e) {}
        setInterval(() => { try { if (currentUser && currentUser.tabel) ainRemindTick(); } catch (e) {} }, 30000);
        // ---------- Quvurga ulash: eng tashqi bosqich (boshqa hamma bosqichdan oldin) ----------
        (function () {
            if (typeof aiStage !== 'function') return;
            aiStage('Aniq soʻrovlar: polojeniya, MTTB kelgan/qabul, xodimlar soni, MM muddatlari', function (q, next) {
                const n = String(q || '').toLowerCase();
                for (const f of [ainCmd, ainPolAnswer, ainMtAnswer, ainXodimCount, ainGrafik]) { try { const r = f(n); if (r) return r; } catch (e) { console.error(e); } }
                try { if (/(instruktaj|tibbiy ko.?rik|bilim sinovi|yo.?l-?yo.?riq|mehnat muhofazasi)/.test(n) && /(muddat|o.?tgan|kim|qachon|shu oy|keyingi oy|hafta|mening)/.test(n) && typeof mmAnswer === 'function') { const a = mmAnswer(q) || mmAnswer(q + " muddati o'tganlar shu oy"); if (a) return { t: a, personal: true }; } } catch (e) { console.error(e); }
                return next(q);
            });
            aiStage('Savolni tushunish: kirill/rus → oʻzbekcha, xato yozuv, sinonimlar', function (q, next) {
                let q2 = q; try { q2 = ainNormalize(q); } catch (e) { console.error(e); }
                const r = next(q2);
                if (r && q2 !== q) { try { r.norm = q2; } catch (e) {} }
                return r;
            });
        })();

