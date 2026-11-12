        // =====================================================================
        // 4.9 b117 — Hujjat tili: O'zbek (lotin) · Ўзбек (кирилл) · Русский (muallif, 26.10.2026)
        //  Doimiy matn (sarlavha, «Biz quyidagi imzo chekuvchilar…», lavozimlar, sana, shahar) — tanlangan tilda;
        //  foydalanuvchi oʻzi yozgan joylar — u yozgan tilda qoladi (kirillda — lotindan avtomatik oʻgiriladi).
        //  Qamrov: Kolodka qabul dalolatnomasi, Nosozlik dalolatnomasi, Bildirgi, AI / qoʻlda aktlar (kirill qoʻshildi),
        //  📥 Yuklash (Excel / PDF / Word jadvallar). Ruscha rasmiy blankalar (Pril. 4, Pril. 5, kalkulyatsiya) — rasmiy
        //  oʻzbekcha namunasi berilguncha ruscha qoladi.
        // =====================================================================
        const TL9: any = window as any;
        // ---------- Lotin → Kirill (oʻzbek imlosi) ----------
        var TL_AB: any = { ICHTB: 'ИЧТБ', VX: 'ВХ', VH: 'ВХ', STTB: 'СТТБ', TYS: 'ТЙЦ', MTTB: 'МТТБ', VTP: 'ВТП', GOST: 'ГОСТ', DR: 'ДР', KR: 'КР', PTO: 'ПТО', ET: 'ЭТ', NQMK: 'НҚМК', MCHJ: 'МЧЖ', AJ: 'АЖ', KMK: 'КМК', PDF: 'PDF', GPS: 'GPS' };
        var TL_L2C: string[][] = [["yo'", 'йў'], ["o'", 'ў'], ["g'", 'ғ'], ['sh', 'ш'], ['ch', 'ч'], ['ya', 'я'], ['yo', 'ё'], ['yu', 'ю'], ['ye', 'е'], ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'ҳ'], ['i', 'и'], ['j', 'ж'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['q', 'қ'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з'], ['c', 'с'], ['w', 'в'], ["'", 'ъ']];
        var TL_UNIT: any = { mm: 'мм', km: 'км', kg: 'кг', sm: 'см' };
        var TL_WORD: any = { yanvar: 'январь', fevral: 'февраль', mart: 'март', aprel: 'апрель', may: 'май', iyun: 'июнь', iyul: 'июль', avgust: 'август', sentyabr: 'сентябрь', sentabr: 'сентябрь', oktyabr: 'октябрь', oktabr: 'октябрь', noyabr: 'ноябрь', dekabr: 'декабрь', tasdiqlayman: 'тасдиқлайман' };
        function tlW(w: string, name?: boolean): string {
            if (!/[A-Za-z]/.test(w)) return w; if (TL_AB[w]) return TL_AB[w]; if (TL_UNIT[w]) return TL_UNIT[w];
            const lw = w.toLowerCase().replace(/[ʻʼ`’‘]/g, "'"); if (TL_WORD[lw]) { const v = TL_WORD[lw]; return w === w.toUpperCase() && w.length > 1 ? v.toUpperCase() : w[0] !== w[0].toLowerCase() ? v[0].toUpperCase() + v.slice(1) : v; }
            const ab = w.match(/^(TYS|ICHTB|VX|STTB|VTP|PTO|MTTB|MCHJ)([a-z'ʻʼ’‘]+)$/); if (ab) return TL_AB[ab[1]] + tlW(ab[2]); // «1-TYSda» → «1-ТЙЦда»
            if (/\d/.test(w)) return w.replace(/[A-Za-z]/g, c => (tlW(c.toLowerCase()) as string)[c === c.toUpperCase() ? 'toUpperCase' : 'toLowerCase']()); // 2VS-105, M659.000
            if (/^[A-Z]{2,}$/.test(w)) return w.split('').map(c => tlW(c.toLowerCase()).toUpperCase()).join('');
            let s = w.replace(/[ʻʼ`’‘]/g, "'"); const cap = s.charAt(0) !== s.charAt(0).toLowerCase(), all = s.length > 1 && s === s.toUpperCase(); s = s.toLowerCase();
            if (name) s = s.replace(/ayev$/, 'аев').replace(/iyev$/, 'иев').replace(/yev$/, 'ев');
            s = s.replace(/([aiou])ev$/, '$1ев'); // familiya: Tuldibaev → Тулдибаев
            s = s.replace(/^ts/, 'ц').replace(/stse/g, 'сце').replace(/ts(?=i[yaeolo]|ion)/g, 'ц'); // eksplutatsiya, tsilindr, avtostsepka
            let o = '', i = 0; while (i < s.length) { if (/[а-яёўқғҳ]/.test(s[i])) { o += s[i]; i++; continue; } if ((i === 0 || /[aeiouаеиоуў']/.test(s[i - 1])) && s[i] === 'e' && s[i + 1] !== "'") { o += 'э'; i++; continue; } const p = TL_L2C.find(([a]) => s.startsWith(a, i)); if (p) { o += p[1]; i += p[0].length; } else { o += s[i]; i++; } }
            return all ? o.toUpperCase() : cap ? o.charAt(0).toUpperCase() + o.slice(1) : o;
        }
        function tlL2C(text: string, name?: boolean): string {
            // «…» va "…" ichi (korxona nomi) — oʻzgarmaydi; tokenlar: harf+raqam+apostrof+tire
            return String(text == null ? '' : text).split(/(«[^»]*»|"[^"]*"|“[^”]*”)/).map((seg, k) => k % 2 ? (/TASDIQLAYMAN/i.test(seg) ? seg.replace(/TASDIQLAYMAN/i, m => m === m.toUpperCase() ? 'ТАСДИҚЛАЙМАН' : 'Тасдиқлайман') : seg) : seg.replace(/[A-Za-z0-9ʻʼ'`’‘]+(?:[-.][A-Za-z0-9ʻʼ'`’‘]+)*/g, tok => {
                if (!/[A-Za-z]/.test(tok)) return tok; if (/^Q-\d/.test(tok)) return tok;
                if (/\d/.test(tok) && !/^\d+-[A-Za-z]/.test(tok)) return tlW(tok, name); // 2VS-105, M659.000
                return tok.split(/([-.])/).map((x, j, a) => x === '-' || x === '.' ? x : (/^[IVX]{1,4}$/.test(x) && a[j + 1] === '-') ? x : tlW(x, name)).join('');
            })).join('');
        }
        var TL_C2L: any = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': 'ʼ', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ё': 'yo', 'ў': 'oʻ', 'қ': 'q', 'ғ': 'gʻ', 'ҳ': 'h' };
        function tlC2L(s: string): string {
            return String(s || '').replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]+/g, w => { const up = w.length > 1 && w === w.toUpperCase(); let o = '';
                for (let i = 0; i < w.length; i++) { const ch = w[i], lo = ch.toLowerCase(); let t = lo === 'е' ? (i === 0 || /[аеёиоуэюяўАЕЁИОУЭЮЯЎ]/.test(w[i - 1]) ? 'ye' : 'e') : (TL_C2L[lo] != null ? TL_C2L[lo] : ch); if (ch !== lo && t) t = up ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1); o += t; }
                return o; });
        }
        // ---------- Ruscha: ism, lavozim, kelishiklar ----------
        function tlRuName(n: string): string { return tlL2C(String(n || '').trim(), true).replace(/ў/g, 'у').replace(/Ў/g, 'У').replace(/ғ/g, 'г').replace(/Ғ/g, 'Г').replace(/қ/g, 'к').replace(/Қ/g, 'К').replace(/ҳ/g, 'х').replace(/Ҳ/g, 'Х').replace(/ъ/g, ''); }
        var TL_RU_U: any[] = [[/^STTB$/, 'УПЖТ'], [/^ICHTB$/, 'ПТО'], [/^(VX|VH)$/, 'ВС'], [/^MTTB$/, 'ОМТС'], [/^(\d)-TYS$/, 'ЖДЦ-$1'], [/^TYS$/, 'ЖДЦ'], [/^VTP$/, 'ВТП'], [/^ET$/, 'ЭС'], [/^NQMK$/, 'КНСМ'], [/^BMB$/, 'ОГМ'], [/^KB$/, 'ОК'], [/^IRB$/, 'ПЭО'], [/^SMBvaAX$/, 'СЦБ']];
        function tlRuAbbr(w: string): string | null { const m = TL_RU_U.find(r => r[0].test(w)); return m ? w.replace(m[0], m[1]) : null; }
        function tlRuRole(t: string): string {
            let s = String(t || '').trim(); if (!s) return ''; if (/[А-Яа-яЁё]/.test(s) && !/[A-Za-z]/.test(s)) return s; // allaqachon ruscha
            const vb = /\s*v\.?\s?b\.?\s*$/i.test(s); s = s.replace(/\s*v\.?\s?b\.?\s*$/i, '').replace(/[ʻʼ`’‘]/g, "'");
            const W = s.split(/\s+/), U: string[] = []; while (W.length && tlRuAbbr(W[0])) U.push(tlRuAbbr(W.shift() as string) as string);
            if (U.length > 1 && U.includes('ВТП')) { U.splice(U.indexOf('ВТП'), 1); U.unshift('ВТП'); }
            const r = W.join(' ').toLowerCase(), u = U.join(' ') || 'УПЖТ'; let nom = '';
            const R: any[] = [[/harakatlanuvchi sostav(larni|ni)? ta'mirlash (bo'yicha |boshlig'i )?o'rinbosari/, 'Заместитель начальника ' + u + ' по ремонту подвижного состава'], [/^boshlig'i o'rinbosari$|^boshlig'ining o'rinbosari$/, 'Заместитель начальника ' + u], [/^boshlig'i$/, 'Начальник ' + u], [/^bosh muhandisi$/, 'Главный инженер ' + u], [/^bosh muhandis o'rinbosari$/, 'Заместитель главного инженера ' + u],
                [/^bosh mexanigi$|^bosh mexanik$/, 'Главный механик ' + u], [/^bosh energetigi$|^bosh energetik$/, 'Главный энергетик ' + u], [/^bosh buxgalteri$|^bosh buxgalter$/, 'Главный бухгалтер ' + u],
                [/temir yo'l harakat tarkibi i-toifali muhandisi/, 'Инженер I категории по подвижному составу ' + u], [/vagon(lar)? bo'yicha muhandisi?/, 'Инженер по вагонам ' + u], [/yetakchi muhandisi?/, 'Ведущий инженер ' + u],
                [/i-toifali muhandis-mexanik/, 'Инженер-механик I категории ' + u], [/i-toifali muhandisi?/, 'Инженер I категории ' + u], [/muhandisi?$/, 'Инженер ' + u], [/^ustasi$/, 'Мастер ' + u], [/uchastka ustasi/, 'Мастер участка ' + u], [/katta ustasi?/, 'Старший мастер ' + u],
                [/chilangar/, 'Слесарь ' + u], [/iqtisodchi/, 'Экономист ' + u], [/buxgalter/, 'Бухгалтер ' + u]];
            const m = R.find(x => x[0].test(r)); nom = m ? m[1] : (U.join(' ') + ' ' + tlRuName(W.join(' '))).trim();
            if (vb) { const g = TL9.kqRuGen ? TL9.kqRuGen(nom) : nom; return 'И.о. ' + g; }
            return nom;
        }
        function tlRuDat(role: string): string { // «Начальник ВС» → «Начальнику ВС»
            const A: any = { 'главный': 'главному', 'старший': 'старшему', 'ведущий': 'ведущему' }, N: any = { 'начальник': 'начальнику', 'заместитель': 'заместителю', 'инженер': 'инженеру', 'мастер': 'мастеру', 'механик': 'механику', 'энергетик': 'энергетику', 'бухгалтер': 'бухгалтеру' };
            const w = String(role || '').split(/\s+/); if (/^И\.о\.$/i.test(w[0])) return role; let i = 0; while (i < w.length && A[w[i].toLowerCase()]) { const c = w[i]; w[i] = A[c.toLowerCase()]; if (c[0] !== c[0].toLowerCase()) w[i] = w[i][0].toUpperCase() + w[i].slice(1); i++; }
            if (i < w.length && N[w[i].toLowerCase()]) { const c = w[i]; w[i] = N[c.toLowerCase()]; if (c[0] !== c[0].toLowerCase()) w[i] = w[i][0].toUpperCase() + w[i].slice(1); } return w.join(' ');
        }
        function tlRuDatName(n: string): string { return String(n || '').replace(/(\S+?)(ов|ев|ин|ын)$/u, '$1$2у').replace(/(\S+?)(ова|ева|ина)$/u, (m, a, b) => a + b.slice(0, -1) + 'ой'); }
        var TL_OY_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'], TL_OY_UZC = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        function tlSana(iso: string, til: string, fmt: string): string { // fmt: q — «20» oktabr 2026-yil.; d — 20.10.2026
            const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); const y = m ? m[1] : String(new Date().getFullYear());
            if (fmt === 'd') return m ? m[3] + '.' + m[2] + '.' + m[1] : '__.__.____';
            if (!m) return til === 'ru' ? '«____» __________ ' + y + ' г.' : til === 'uzc' ? '«____» __________ ' + y + '-йил.' : '«____» __________ ' + y + '-yil.';
            return til === 'ru' ? '«' + m[3] + '» ' + TL_OY_RU[+m[2] - 1] + ' ' + m[1] + ' г.' : til === 'uzc' ? '«' + m[3] + '» ' + TL_OY_UZC[+m[2] - 1] + ' ' + m[1] + '-йил.' : null as any;
        }
        // ---------- Word: matn qatlami ----------
        function tlDocxText(xml: string, fn: (s: string) => string): string {
            return xml.replace(/(<w:t(?:\s[^>]*)?>)([\s\S]*?)(<\/w:t>)/g, (m, a, t, b) => a + fn(t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + b);
        }
        // Paragraf matnidagi doimiy iboralar → boshqa til (placeholderlar saqlanadi)
        function tlPhrases(xml: string, pairs: any[]): string {
            if (typeof TL9.ksSub !== 'function') return xml;
            return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, p => { const t = p.replace(/<w:tab\/>/g, '\t').replace(/<[^>]+>/g, ''); const P = pairs.filter(x => t.includes(x[0].replace(/&amp;/g, '&'))); return P.length ? TL9.ksSub(p, P).x : p; });
        }
        var TL_KQ_RU: any[] = [['«TASDIQLAYMAN»', '«УТВЕРЖДАЮ»'], ['Olmaliq sh.', 'г. Алмалык'], ['{{org}} dan qabul qilib olingan {{tur}}ning texnik holati to‘g‘risida', 'О техническом состоянии {{tur_g}}, принятых от {{org}}'], ['Dalolatnoma', 'АКТ'],
            ['Biz quyida imzo chekuvchilar: ', 'Мы, нижеподписавшиеся: '], [', tuzilayotgan dalolatnoma shu haqdaki, {{org}} dan qabul qilib olingan {{soni}} dona {{marka}} markali {{tur}} texnik ko‘rikdan o‘tkazildi va {{gost}} ga geometrik o‘lchamlari mos kelishi aniqlandi.', ', составили настоящий акт о том, что принятые от {{org}} {{soni}} шт. {{tur_g}} марки {{marka}} прошли технический осмотр и установлено соответствие их геометрических размеров требованиям {{gost}}.'],
            ['Xulosa:', 'Заключение:'], [' {{org}} dan qabul qilib olingan {{marka}} markali {{soni}} dona {{tur}} soz holatda va ishlash sifati ekspluatatsiya davrida aniqlanadi.', ' {{tur}} марки {{marka}} в количестве {{soni}} шт., принятые от {{org}}, находятся в исправном состоянии; качество работы определяется в период эксплуатации.']];
        var TL_NS_RU: any[] = [['«TASDIQLAYMAN»', '«УТВЕРЖДАЮ»'], ['STTB bosh muhandisi', 'Главный инженер УПЖТ'], ['A.A. Abdirashidov', 'А.А. Абдирашидов'], ['Olmaliq sh.', 'г. Алмалык'], ['{{date}}-y.', '{{date}} г.'],
            ['{{model}} tipli vagon-samosvallarning mavjud nosozliklari to’g’risida', 'О имеющихся неисправностях вагона-самосвала типа {{model}}'], ['DALOLATNOMA', 'АКТ'],
            ['Biz quyidagi imzo chekuvchilar: {{members}} tuzilayotgan dalolatnoma shu haqidaki, raqami {{zav}} bo’lgan {{model}} tipidagi vagon-samosvalning texnik ko’rikdan o’tkazish jarayonida quyidagilar aniqlandi:', 'Мы, нижеподписавшиеся: {{members}}, составили настоящий акт о том, что при техническом осмотре вагона-самосвала типа {{model}} заводской № {{zav}} выявлено следующее:'],
            ['- Vagonning oxirgi rejali ta’mir vaqtlari:', '- Последние плановые ремонты вагона:'], ['depo ta’miri {{dr}}-y.,', 'деповской ремонт — {{dr}} г.,'], ['kapital ta’miri {{kr}}-y.,', 'капитальный ремонт — {{kr}} г.,'], ['foydalanishga topshirilgan yili {{yil}}-y.', 'год ввода в эксплуатацию — {{yil}} г.'], ['-Vagonning oxirgi ta’mir vaqtlari: depo ta’mir {{dr}}-y., kapital ta’mir {{kr}}-y., foydalanishga topshirilgan yil {{yil}}-y.', '- Последние ремонты вагона: деповской — {{dr}} г., капитальный — {{kr}} г., год ввода в эксплуатацию — {{yil}} г.'], ['Xulosa:', 'Заключение:']];
        // Tahrirlar (✏️) — tarjimadan keyin, tayyor matnga
        if (typeof TL9.dxFillXml === 'function') TL9.dxFillXml = TL9.agmkExtend('dxFillXml', '4.9 b117: hujjat tili', TL9.dxFillXml, (o: Function) => function (this: unknown, xml: string, data: any) {
            const til = data && data._til; if (!til || til === 'uz') return o.apply(this, arguments);
            const ed = data._ed, d2 = Object.assign({}, data); delete d2._ed;
            try { if (til === 'ru' && data._ks && typeof TL9.ksApply === 'function') { xml = TL9.ksApply(xml, data); delete d2._ks; } } catch (e) { console.error(e); } // imzo chekuvchilar — tarjimadan oldin oʻz oʻrniga
            try { if (til === 'ru' && data._tlp) xml = tlPhrases(xml, data._tlp === 'kq' ? TL_KQ_RU : data._tlp === 'ns' ? TL_NS_RU : []); } catch (e) { console.error(e); }
            let r = o.call(this, xml, d2);
            try { if (til === 'uzc') r = tlDocxText(r, s => tlL2C(s)); } catch (e) { console.error(e); }
            try { if (ed && typeof TL9.edApply === 'function') r = TL9.edApply(r, ed); } catch (e) { console.error(e); }
            return r;
        });
        // ---------- Tanlash tugmalari ----------
        function tlBar(cur: string, fn: string): string { const B = [['uz', "O'zbek (lotin)"], ['uzc', 'Ўзбек (кирилл)'], ['ru', 'Русский']]; return `<div class="tl-bar"><span>🌐 Til:</span>${B.map(([k, t]) => `<button type="button" class="${(cur || 'uz') === k ? 'on' : ''}" onclick="${fn}('${k}')">${t}</button>`).join('')}</div>`; }

        // ---------- 1) Kolodka qabul dalolatnomasi ----------
        var TL_TUR_RU: any = { 'kompozit tormoz kolodkalari': ['композиционные тормозные колодки', 'композиционных тормозных колодок'], 'kompozitli tormoz kolodkalari': ['композиционные тормозные колодки', 'композиционных тормозных колодок'] };
        function tlOrgRu(o: string): string { const s = String(o || '').trim(); const m = s.match(/^(«[^»]+»|"[^"]+")\s*(MCHJ|МЧЖ|OOO|ООО|AJ|АЖ)?$/i); if (!m) return s; const f: any = { MCHJ: 'ООО', 'МЧЖ': 'ООО', OOO: 'ООО', 'ООО': 'ООО', AJ: 'АО', 'АЖ': 'АО' }; return (m[2] ? f[m[2].toUpperCase()] + ' ' : 'ООО ') + m[1]; }
        if (typeof TL9.kqData === 'function') TL9.kqData = TL9.agmkExtend('kqData', '4.9 b117: til', TL9.kqData, (o: Function) => function (this: unknown) {
            const d = o.apply(this, arguments); try {
                const K = typeof KQ !== 'undefined' ? KQ : null, til = K && K.til; if (!d || !til || til === 'uz') return d; d._til = til;
                if (til === 'uzc') { d.t_sana = tlSana(K.tsana, 'uzc', 'q'); d.sana = tlSana(K.sana, 'uzc', 'q'); return d; }
                d._tlp = 'kq'; const tu = TL_TUR_RU[String(K.tur || '').trim().toLowerCase()];
                d.tur = tu ? tu[0] : K.tur; d.tur_g = tu ? tu[1] : K.tur; d.org = tlOrgRu(K.org); d.gost = String(K.gost || '').replace(/^GOST/i, 'ГОСТ'); d.marka = String(K.marka || '').replace(/^M/, 'М'); d.t_sana = tlSana(K.tsana, 'ru', 'q'); d.sana = tlSana(K.sana, 'ru', 'q');
                d.holat = /^kolodkalar holati yangi/i.test(String(K.holat || '')) ? 'Колодки новые, неисправностей не выявлено.' : K.holat;
                d.t_lav = K.tas ? tlRuRole(K.tas.l) : ''; d.t_ism = K.tas ? tlRuName(K.tas.n) : '';
                d.azolar = (K.azo || []).map((a: any) => { const r = tlRuRole(a.l); return (/^[A-ZА-ЯЁ]{2}/.test(r) ? r : r.charAt(0).toLowerCase() + r.slice(1)) + ' ' + tlRuName(a.n); }).join(', ');
                (K.azo || []).forEach((a: any, i: number) => { d['a' + (i + 1) + '_l'] = tlRuRole(a.l); d['a' + (i + 1) + '_n'] = tlRuName(a.n); });
            } catch (e) { console.error(e); } return d;
        });
        function tlKq(k: string): void { const K = typeof KQ !== 'undefined' ? KQ : null; if (!K) return; K.til = k; try { kqSave(); } catch (e) { /* */ } const b = TL9.$id('tlKq'); if (b) b.outerHTML = `<div id="tlKq">${tlBar(k, 'tlKq')}</div>`; try { TL9.kqPrev(); } catch (e) { /* */ } }
        if (typeof TL9.kqOpen === 'function') TL9.kqOpen = TL9.agmkExtend('kqOpen', '4.9 b117: til tanlash', TL9.kqOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); try { const f = document.querySelector('#kqModal .kq-f'); const K = typeof KQ !== 'undefined' ? KQ : null; if (f && !TL9.$id('tlKq')) f.insertAdjacentHTML('beforebegin', `<div id="tlKq">${tlBar(K && K.til, 'tlKq')}</div>`); } catch (e) { console.error(e); } return r;
        });

        // ---------- 2) Nosozlik dalolatnomasi (korxona blankasi) ----------
        function tlNosXulRu(doc: any): string {
            const z = doc.zav || '______', old = String(doc.oldVag || '').trim(), pm = String(doc.planMonth || '').trim(), c = String(doc.cause || '').trim();
            let t = 'В связи с невозможностью выполнения ремонта неисправностей данного вагона в ВТП ЖДЦ-1, а также в целях своевременного обеспечения плановых перевозок ЖДЦ-1 вагонами и предотвращения нехватки вагонов, необходимо направить вагон № **' + z + '** в Вагонную службу для проведения деповского ремонта';
            t += old && pm ? ' вместо вагона № ' + old + ', запланированного по графику деповского ремонта на **' + pm + '**.' : '.'; if (c) t += ' ' + c; return t;
        }
        if (typeof TL9.cxDxData === 'function') TL9.cxDxData = TL9.agmkExtend('cxDxData', '4.9 b117: til', TL9.cxDxData, (o: Function) => function (this: unknown, doc: any) {
            const d = o.apply(this, arguments); try {
                const til = doc && doc.type === 'nosoz' ? doc.til : ''; if (!d || !til || til === 'uz') return d; d._til = til; if (til === 'uzc') { d.ap_date = d.ap_date ? tlL2C(d.ap_date) : d.ap_date; return d; }
                d._tlp = 'ns'; if (d.model) d.model = tlL2C(d.model); d.ap_date = TL9.nd41ApDate ? TL9.nd41ApDate(doc.date, 'ru') : d.ap_date; d.xulosa = doc.xulosaManual ? doc.xulosa : tlNosXulRu(doc);
                const sgList = (doc.ks && doc.ks.sg) || ((doc.sg && doc.sg.length ? doc.sg : TL9.CX_NOSOZ_SG) || []).map((x: any) => ({ l: String(x[0] || '').replace(/\s*\|\s*/g, ' '), n: String(x[1] || '') }));
                d.members = sgList.filter((x: any) => x.l || x.n).map((x: any) => { const r = tlRuRole(x.l); return (/^[A-ZА-ЯЁ]{2}/.test(r) ? r : r.charAt(0).toLowerCase() + r.slice(1)) + ' ' + tlRuName(x.n); }).join(', ');
                for (let i = 1; i <= 4; i++) { if (d['s' + i + 'r']) d['s' + i + 'r'] = tlRuRole(d['s' + i + 'r'] + (i === 2 && d.s2r2 ? ' ' + d.s2r2 : '')); if (d['s' + i + 'n']) d['s' + i + 'n'] = tlRuName(d['s' + i + 'n']); } if (d.s2r2) d.s2r2 = '';
                if (d._ks) { const K: any = {}; Object.keys(d._ks).forEach(g => { K[g] = (d._ks[g] || []).map((x: any) => ({ l: tlRuRole(x.l), n: tlRuName(x.n) })); }); d._ks = K; }
            } catch (e) { console.error(e); } return d;
        });
        function tlCx(k: string): void { const c = TL9.CXV && TL9.CXV.cur; if (!c) return; c.til = k; try { localStorage.setItem('agmk_til_nosoz', k); } catch (e) { /* */ } const b = TL9.$id('tlCx'); if (b) b.outerHTML = `<div id="tlCx">${tlBar(k, 'tlCx')}</div>`; try { TL9.cxPrev(); } catch (e) { /* */ } }
        if (typeof TL9.cxForm === 'function') TL9.cxForm = TL9.agmkExtend('cxForm', '4.9 b117: til tanlash', TL9.cxForm, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); try { const c = TL9.CXV && TL9.CXV.cur, h = document.querySelector('#cxModal .px-h'); if (!c || !h || TL9.$id('tlCx') || TL9.$id('tlCxN')) return r;
                if (c.type === 'nosoz') { if (!c.til) { try { c.til = localStorage.getItem('agmk_til_nosoz') || 'uz'; } catch (e) { c.til = 'uz'; } } h.insertAdjacentHTML('afterend', `<div id="tlCx">${tlBar(c.til, 'tlCx')}</div>`); }
                else h.insertAdjacentHTML('afterend', `<div id="tlCxN" class="nd-tip">🌐 Bu korxonaning rasmiy ruscha blankasi — oʻzbekcha (lotin / kirill) varianti rasmiy namunasi berilganda qoʻshiladi.</div>`);
            } catch (e) { console.error(e); } return r;
        });

        // ---------- 3) AI / qoʻlda aktlar — oʻzbek kirill ----------
        function tlNdCyr(on: boolean): void { const N: any = typeof ND !== 'undefined' ? ND : null; if (!N || !N.form) return; N.form.cyr = on; if (on && (N.form.lang || 'uz') === 'ru' && typeof TL9.ndSetLang === 'function') TL9.ndSetLang('uz'); if (typeof TL9.ndRender === 'function') TL9.ndRender(); }
        if (typeof TL9.ndRender === 'function') TL9.ndRender = TL9.agmkExtend('ndRender', '4.9 b117: akt — kirill', TL9.ndRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const N: any = typeof ND !== 'undefined' ? ND : null, pg = TL9.$id('ndPage'); if (N && N.form && N.form.cyr && pg && (N.form.lang || 'uz') !== 'ru' && /[A-Za-z]{3}/.test(pg.textContent || '')) { const w = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT); let n: any; while ((n = w.nextNode())) n.nodeValue = tlL2C(n.nodeValue); N.html = pg.innerHTML; } } catch (e) { console.error(e); }
            try { const N: any = typeof ND !== 'undefined' ? ND : null; const seg = [...document.querySelectorAll('#screen-nd .nd-seg')].find((s: any) => /O'zbekcha|Русский/.test(s.textContent || '')) as any;
                if (seg && N && N.form) { let b = seg.querySelector('.tl-cyr'); if (!b) { b = document.createElement('button'); b.type = 'button'; b.className = 'tl-cyr'; b.textContent = '🇺🇿 Ўзбекча (кирилл)'; seg.appendChild(b); }
                    const cyr = !!N.form.cyr && (N.form.lang || 'uz') !== 'ru'; b.classList.toggle('on', cyr); seg.querySelectorAll('button:not(.tl-cyr)').forEach((x: any) => { if (/O'zbekcha/.test(x.textContent)) { x.classList.toggle('on', !cyr && (N.form.lang || 'uz') !== 'ru'); x.onclick = () => tlNdCyr(false); } else if (/Русский/.test(x.textContent)) { const f = x.onclick; x.onclick = (e: any) => { N.form.cyr = false; if (f) f.call(x, e); else TL9.ndSetLang('ru'); }; } });
                    b.onclick = () => tlNdCyr(true); } } catch (e) { console.error(e); }
            return r;
        });

        // ---------- 4) 📥 Yuklash (jadval) ----------
        var TL_YK_RU: any = { 'Tartib №': '№ п/п', 'Raqami': 'Номер', 'Inventar №': 'Инв. №', 'Turi': 'Тип', 'Modeli': 'Модель', 'Model': 'Модель', 'Sex': 'Цех', 'Holati': 'Состояние', 'Oxirgi DR': 'Последний ДР', 'Oxirgi KR': 'Последний КР', 'Keyingi DR': 'Следующий ДР', 'Keyingi KR': 'Следующий КР',
            'Keyingi DR (grafik PPR)': 'Следующий ДР (по графику ППР)', 'Keyingi DR (probeg)': 'Следующий ДР (по пробегу)', 'Oxirgi taʼmir turi': 'Вид последнего ремонта', 'Xizmat muddati': 'Срок службы', 'Ishlab chiqarilgan yil': 'Год выпуска', 'Izoh': 'Примечание',
            'F.I.Sh.': 'Ф.И.О.', 'Tabel №': 'Таб. №', 'Lavozimi': 'Должность', 'Nomi': 'Наименование', 'Oʻlchov birligi': 'Ед. изм.', 'Soni': 'Кол-во', 'Sana': 'Дата', 'Kun': 'Дней' };
        var TL_YK_V: any = { 'Ha': 'Да', 'Yoʻq': 'Нет', "Yo'q": 'Нет', 'Soz': 'Исправен', 'Yaqin': 'Близок срок', 'Taʼmir talab': 'Требует ремонта', "Ta'mir talab": 'Требует ремонта', 'Taʼmirda': 'В ремонте', 'Muddati oʻtgan': 'Просрочен' };
        function tlYkRows(rows: any[][], til: string): any[][] {
            if (!til || til === 'uz') return rows;
            return rows.map((r, ri) => r.map((v: any) => { if (typeof v !== 'string') return v; if (til === 'uzc') return tlL2C(v); return ri === 0 ? (TL_YK_RU[v] || TL_YK_RU[v.replace(/\s*\(.*\)$/, '')] || v) : (TL_YK_V[v] || v); }));
        }
        if (typeof TL9.ykRows === 'function') TL9.ykRows = TL9.agmkExtend('ykRows', '4.9 b117: jadval tili', TL9.ykRows, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); try { return tlYkRows(r, TL9.YKS && TL9.YKS.til); } catch (e) { return r; } });
        function tlYk(k: string): void { if (!TL9.YKS) return; TL9.YKS.til = k; try { localStorage.setItem('agmk_til_yk', k); } catch (e) { /* */ } const b = TL9.$id('tlYk'); if (b) b.outerHTML = `<div id="tlYk">${tlBar(k, 'tlYk')}</div>`; }
        if (typeof TL9.ykDraw === 'function') TL9.ykDraw = TL9.agmkExtend('ykDraw', '4.9 b117: jadval tili', TL9.ykDraw, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); try { const b = TL9.$id('ykB'); if (b && TL9.YKS && !TL9.$id('tlYk')) { if (!TL9.YKS.til) { try { TL9.YKS.til = localStorage.getItem('agmk_til_yk') || 'uz'; } catch (e) { TL9.YKS.til = 'uz'; } } b.insertAdjacentHTML('afterbegin', `<div id="tlYk">${tlBar(TL9.YKS.til, 'tlYk')}</div>`); } } catch (e) { console.error(e); } return r;
        });

        Object.assign(TL9, { tlL2C: tlL2C, tlC2L: tlC2L, tlRuRole: tlRuRole, tlRuName: tlRuName, tlRuDat: tlRuDat, tlRuDatName: tlRuDatName, tlSana: tlSana, tlBar: tlBar, tlKq: tlKq, tlCx: tlCx, tlYk: tlYk, tlNdCyr: tlNdCyr, tlOrgRu: tlOrgRu });
        (function () { const st = document.createElement('style'); st.textContent = '.tl-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0}.tl-bar span{font:700 12px/1 inherit;opacity:.8;margin-right:2px}.tl-bar button{flex:1;min-width:92px;padding:9px 8px;border-radius:10px;border:1px solid rgba(148,163,184,.35);background:rgba(2,6,23,.4);color:#e2e8f0;font:700 13px/1.1 inherit;cursor:pointer}.tl-bar button.on{background:#0ea5e9;border-color:#0ea5e9;color:#fff}'; document.head.appendChild(st); })();
