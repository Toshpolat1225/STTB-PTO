        // =====================================================================
        // 4.9 b116 — 📣 BILDIRGI + DALOLATNOMA (nosozlik aniqlanganda) — muallif namunalari (18.10.2026, 30.09.2025, 15.09.2025)
        //  Tekshiruv / qabul paytida vagonda (yoki gʻildirak juftligida) kamchilik koʻrilsa — joyida hujjat:
        //   1-varaq BILDIRGI: kimga (rahbar — shtatdan), «Sizga shuni maʼlum qilamanki, … quyidagi nosozliklar aniqlandi», roʻyxat,
        //     xulosa (ichki mehnat qoidalari Q-93950-31-11-382-2024 yoki qisqa), muallif.
        //   2-varaq DALOLATNOMA: Olmaliq shahar · sana, «Biz quyidagi imzo chekuvchilar …», xuddi shu roʻyxat, komissiya imzolari.
        //  Har bir nosozlik: vagonning QAYSI JOYI (roʻyxatdan yoki qoʻlda) + matn (tez iboralar bilan); bir nechta vagon boʻlsa — qaysi vagon.
        //  Yozuv: kirill (namunadagidek) yoki lotin. Word / PDF, ✍️ imzoga, 📤 istalgan xodimga yuborish (ilova ichida yoki Telegram).
        //  Kirish: «📄 Dalolatnomalar» → «📣 Bildirgi»; vagon pasportida «📣 Bildirgi» (vagon raqami oʻzi qoʻyiladi).
        // =====================================================================
        const BG9: any = window as any;
        var BG_KEY = 'agmk_bg_v1', BG_LIST = 'agmk_bg_list';
        var BG: any = { cur: null };
        var BG_QISM: string[][] = [['Кузов', 'Kuzov'], ['Хребтовая балка (рама)', 'Rama (xrebtovaya balka)'], ['Тележка', 'Telejka (aravacha)'], ['Тележканинг боковой рамаси', 'Bokovaya rama'], ['Надрессорная балка', 'Nadressornaya balka'],
            ['Ғилдирак жуфтлиги', 'Gʻildirak juftligi'], ['Букса', 'Buksa'], ['Автосцепка', 'Avtostsepka'], ['Тяговый хомут', 'Tyagoviy xomut'], ['Поглощающий аппарат', 'Pogloshchayushchiy apparat'], ['Тормоз цилиндри', 'Tormoz tsilindri'],
            ['Триангел', 'Triangel'], ['Тормоз тортиш сими', 'Tormoz tortish simi'], ['Свалочный цилиндр', 'Svalochniy tsilindr'], ['Кузов кронштейн валиклари', 'Kronshteyn valiklari'], ['Пневматик жиҳозлар', 'Pnevmatik jihozlar']];
        var BG_IBORA: string[] = ['таъмирланмаган', 'таъмирланганлик тамғаси мавжуд эмас', 'мавжуд эмас', 'рудалардан тозаланмаган', 'дарз кетган', 'синган', 'бўшлиқ __ мм дан ошиқ', 'гребень қалинлиги __ мм дан юқори', 'наплавка ва обточка қилинмаган', 'шплинт мавжуд эмас', 'болт ва гайкаси мавжуд эмас', 'уланмаган'];
        var BG_JAR: any = { qabul: ['Taʼmirdan soʻng qabul qilish', 'таъмирдан сўнг қабул қилиш жараёнида'], korik: ['Texnik koʻrik', 'техник кўрикдан ўтказиш жараёнида'], tekshir: ['Tekshiruv', 'текширув ўтказиш жараёнида'], ekspl: ['Ekspluatatsiya', 'эксплуатация жараёнида'] };
        var BG_XUL: any = {
            a: 'Юқоридагилардан келиб чиққан ҳолда “СТТБнинг ички меҳнат қоидалари” (Q-93950-31-11-382-2024) да “иш ва махсулотини яхшилаш, ишдаги камчиликлар ва нуқсон (брак) ҳолатларга йўл қўймаслик” талабларини бажармаган {U} нинг маъсул ишчи-ходимларга тегишли чора кўришингизни сўрайман.',
            b: 'Юқоридагилардан келиб чиққан ҳолда {U} нинг маъсул ишчи-ходимларга тегишли чора кўришингизни ва бундай холатлар такрорланмаслигини назорат қилишингизни сўрайман.'
        };
        var BG_OY = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        function bgE(s: unknown): string { return BG9.escapeHtml(String(s == null ? '' : s)); }
        function bgToday(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function bgGet(k: string, d: any): any { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
        function bgSet(k: string, v: any): void { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } }

        // ---- Yozuv: lotin → kirill (oʻzbek), kirill → lotin ----
        var BG_AB: any = { ICHTB: 'ИЧТБ', VX: 'ВХ', VH: 'ВХ', STTB: 'СТТБ', TYS: 'ТЙЦ', MTTB: 'МТТБ', VTP: 'ВТП', GOST: 'ГОСТ', DR: 'ДР', KR: 'КР', PTO: 'ПТО', ET: 'ЭТ', NQMK: 'НҚМК' };
        var BG_L2C: string[][] = [["yo'", 'йў'], ["o'", 'ў'], ["g'", 'ғ'], ['sh', 'ш'], ['ch', 'ч'], ['ya', 'я'], ['yo', 'ё'], ['yu', 'ю'], ['ye', 'е'], ['ts', 'ц'], ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'ҳ'], ['i', 'и'], ['j', 'ж'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['q', 'қ'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з'], ['c', 'с'], ['w', 'в'], ["'", 'ъ']];
        function bgW2C(w: string, name: boolean): string {
            if (!/[A-Za-z]/.test(w)) return w; if (BG_AB[w]) return BG_AB[w];
            if (/^[A-Z]{2,}$/.test(w)) return w.split('').map(c => bgW2C(c.toLowerCase(), false).toUpperCase()).join('');
            if (/^[IVX]+(-|$)/.test(w) && /^[IVX]+-/.test(w)) { const m = w.match(/^([IVX]+-)(.*)$/)!; return m[1] + bgW2C(m[2], name); }
            let s = w.replace(/[ʻʼ`’‘]/g, "'"); const cap = /^[A-ZʻʼO]/.test(s.charAt(0)) && s.charAt(0) !== s.charAt(0).toLowerCase(); s = s.toLowerCase();
            if (name) s = s.replace(/ayev$/, 'аев').replace(/iyev$/, 'иев').replace(/yev$/, 'ев').replace(/ova$/, 'ова');
            let o = '', i = 0; while (i < s.length) { if (/[а-яёўқғҳ]/.test(s[i])) { o += s[i]; i++; continue; } if (i === 0 && s[i] === 'e') { o += 'э'; i++; continue; } const p = BG_L2C.find(([a]) => s.startsWith(a, i)); if (p) { o += p[1]; i += p[0].length; } else { o += s[i]; i++; } }
            return cap ? o.charAt(0).toUpperCase() + o.slice(1) : o;
        }
        function bgCyr(s: string, name?: boolean): string { return String(s || '').split(/([^A-Za-zʻʼ'`’‘\-]+)/).map(t => /[A-Za-z]/.test(t) ? t.split('-').map((x, j, a) => /^[IVX]{1,4}$/.test(x) && j < a.length - 1 ? x : bgW2C(x, !!name)).join('-') : t).join(''); }
        // Kirill → lotin (oʻzbek imlosi): ў→oʻ, ғ→gʻ, ш→sh, ч→ch, қ→q, ҳ→h, е→ye (soʻz boshida / unlidan keyin), ц→ts, ъ→ʼ
        var BG_C2L: any = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': 'ʼ', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ё': 'yo', 'ў': 'oʻ', 'қ': 'q', 'ғ': 'gʻ', 'ҳ': 'h' };
        function bgLat(s: string): string {
            return String(s || '').replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]+/g, w => {
                const up = w.length > 1 && w === w.toUpperCase(); let o = '';
                for (let i = 0; i < w.length; i++) { const ch = w[i], lo = ch.toLowerCase(); let t = lo === 'е' ? (i === 0 || /[аеёиоуэюяўАЕЁИОУЭЮЯЎ]/.test(w[i - 1]) ? 'ye' : 'e') : (BG_C2L[lo] != null ? BG_C2L[lo] : ch); if (ch !== lo && t) t = up ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1); o += t; }
                return o; });
        }
        function bgOut(s: string): string { const c = BG.cur; return c && c.yoz === 'lat' ? bgLat(s) : s; }
        // «Familiya I.O.» → «I.O. Familiya» (namunadagidek) — kirillda
        function bgIni(n: string): string { const s = bgCyr(String(n || '').trim(), true), m = s.match(/^(\S+)\s+((?:[А-ЯЁЎҚҒҲA-Z]\.\s?){1,2})$/); return m ? m[2].replace(/\s/g, '') + ' ' + m[1] : s; }
        function bgSur(n: string): string { return bgCyr(String(n || '').trim(), true); } // «Хакимов Э.Э.»
        function bgDat(n: string): string { const s = bgIni(n); return s ? s + (BG.cur && BG.cur.yoz === 'lat' ? '' : 'га') : '______'; }

        // ---- Hujjat ----
        function bgNew(pref?: any): any {
            const L = bgGet(BG_KEY, {}) || {};
            return Object.assign({ id: 'bg' + Date.now().toString(36), sana: bgToday(), yoz: L.yoz || 'cyr', kim: L.kim || null, mu: L.mu || null, azo: Array.isArray(L.azo) ? L.azo : [],
                tur: 'vagon', nos: '', vtype: '', kimdan: 'Вагон хизматидан', tamir: '', jar: 'qabul', sanaQ: false, matnAuto: true, matn: '', D: [{ no: '', joy: '', t: '' }],
                unit: L.unit || 'ВХ', xul: L.xul || 'a', xulAuto: true, xulT: '' }, pref || {});
        }
        function bgKeep(): void { const c = BG.cur; if (!c) return; bgSet(BG_KEY, { yoz: c.yoz, kim: c.kim, mu: c.mu, azo: c.azo, unit: c.unit, xul: c.xul }); }
        function bgNos(): string[] { return String((BG.cur || {}).nos || '').split(/[\s,;]+/).map(x => x.replace(/^№/, '').trim()).filter(Boolean); }
        function bgVag(no: string): any { try { const s = String(no).replace(/^0+/, ''); return (BG9.onlyVagons ? BG9.onlyVagons() : []).find((x: any) => String(BG9.vagonNo(x)) === no || String(BG9.vagonNo(x)).replace(/^0+/, '') === s); } catch (e) { return null; } }
        function bgVType(v: any): string { const t = String(v && (v.type || v.naim) || ''); return /115/.test(t) ? '2ВС-115' : /105/.test(t) ? '2ВС-105' : /60/.test(t) ? '6ВС-60' : t.replace(/Dumpkar\s*/i, '').trim(); }
        function bgJoin(a: string[]): string { return a.length < 2 ? (a[0] || '______') : a.slice(0, -1).join(', ') + ' ва ' + a[a.length - 1]; }
        function bgDmy(iso: string): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : '__.__.____'; }
        function bgSanaS(iso: string): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[1] + ' йил ' + (+m[3]) + ' ' + BG_OY[+m[2] - 1] : '____ йил __ ______'; }
        function bgRep(no: string): string { const v = bgVag(no); if (!v || typeof BG9.agmkLastRep !== 'function') return ''; const r = BG9.agmkLastRep(v); return r && r.d ? '(таъмир санаси ' + (r.t === 'KR' ? 'КР' : 'ДР') + ' ' + bgDmy(r.d) + 'й)' : ''; }
        function bgMid(): string {
            const c = BG.cur, N = bgNos(), many = N.length > 1, nos = bgJoin(N.map((x, i) => (i ? '' : '№') + x));
            const tam = c.tamir === 'DR' ? 'депо туридаги ' : c.tamir === 'KR' ? 'капитал ' : '', jar = (BG_JAR[c.jar] || BG_JAR.qabul)[1], jr = c.jar === 'qabul' ? tam + jar : jar;
            if (c.tur === 'gildirak') return nos + ' рақамли ғилдирак жуфтлиги' + (many ? 'ларини' : 'ни') + ' ' + (c.jar === 'qabul' ? 'қабул қилиш жараёнида' : jar);
            if (c.tur === 'boshqa') return (c.obj || '______') + ' ' + jr;
            const vt = c.vtype || bgVType(bgVag(N[0] || '')) || '______';
            return (c.kimdan ? c.kimdan.trim() + ' ' : '') + nos + ' рақамли ' + vt + ' типдаги вагон' + (many ? 'ларнинг' : 'нинг') + ' ' + jr;
        }
        function bgLine(d: any): string {
            const c = BG.cur, many = bgNos().length > 1; let t = String(d.t || '').trim(); if (!t && !d.joy) return '';
            const joy = String(d.joy || '').trim(); if (joy && !t.toLowerCase().startsWith(joy.toLowerCase())) t = joy + (t ? ' – ' + t : '');
            if (many && d.no) t = '№' + d.no + ' рақамли ' + (c.tur === 'gildirak' ? 'ғилдирак жуфтлигида' : 'вагонда') + ' ' + t.charAt(0).toLowerCase() + t.slice(1);
            if (c.sanaQ && c.tur === 'vagon') { const r = bgRep(d.no || bgNos()[0] || ''); if (r) t += ' ' + r; }
            return t;
        }
        function bgXul(): string { const c = BG.cur; if (c.yoz === 'ru' && c.xulAuto) return (BG_XUL_RU[c.xul] || BG_XUL_RU.a).replace('{U}', String(c.unit || 'ВХ').replace(/^ВХ$/, 'ВС')); return c.xulAuto ? (BG_XUL[c.xul] || BG_XUL.a).replace('{U}', c.unit || 'ВХ') : c.xulT; }
        // 4.9 b117: ruscha variant — doimiy matn ruscha, foydalanuvchi yozgan nosozlik matni — qanday yozilgan boʻlsa
        var BG_QISM_RU: any = { 'Кузов': 'Кузов', 'Хребтовая балка (рама)': 'Хребтовая балка (рама)', 'Тележка': 'Тележка', 'Тележканинг боковой рамаси': 'Боковая рама тележки', 'Надрессорная балка': 'Надрессорная балка', 'Ғилдирак жуфтлиги': 'Колесная пара', 'Букса': 'Букса', 'Автосцепка': 'Автосцепка', 'Тяговый хомут': 'Тяговый хомут', 'Поглощающий аппарат': 'Поглощающий аппарат', 'Тормоз цилиндри': 'Тормозной цилиндр', 'Триангел': 'Триангель', 'Тормоз тортиш сими': 'Тормозная тяга', 'Свалочный цилиндр': 'Цилиндр опрокидывания (свалочный)', 'Кузов кронштейн валиклари': 'Валики кронштейнов кузова', 'Пневматик жиҳозлар': 'Пневматическое оборудование' };
        var BG_XUL_RU: any = { a: 'Исходя из вышеизложенного, прошу принять соответствующие меры к ответственным работникам {U}, не выполнившим требования «Правил внутреннего трудового распорядка УПЖТ» (Q-93950-31-11-382-2024) по «улучшению работы и продукции, недопущению недостатков и брака в работе».',
            b: 'Исходя из вышеизложенного, прошу принять соответствующие меры к ответственным работникам {U} и проконтролировать недопущение повторения подобных случаев.' };
        function bgRuSana(iso: string): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); const O = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']; return m ? '«' + m[3] + '» ' + O[+m[2] - 1] + ' ' + m[1] + ' г.' : '«__» ______ ____ г.'; }
        function bgRuIni(n: string): string { const s = BG9.tlRuName ? BG9.tlRuName(n) : n, m = s.match(/^(\S+)\s+((?:[А-ЯЁA-Z]\.\s?){1,2})$/); return m ? m[2].replace(/\s/g, '') + ' ' + m[1] : s; }
        function bgDataRu(): any {
            const c = BG.cur, N = bgNos(), many = N.length > 1, RR = (t: string) => BG9.tlRuRole ? BG9.tlRuRole(t) : t, low = (r: string) => /^[A-ZА-ЯЁ]{2}/.test(r) ? r : r.charAt(0).toLowerCase() + r.slice(1), d: any = {};
            const unit = String(c.unit || 'ВХ').replace(/^ВХ$/, 'ВС').replace(/^VX$/, 'ВС'), nos = N.length ? N.map((x, i) => (i ? '' : '№') + x).join(many ? ', ' : '').replace(/, ([^,]*)$/, ' и $1') : '______';
            const tam = c.tamir === 'DR' ? 'деповского ' : c.tamir === 'KR' ? 'капитального ' : '', jar: any = { qabul: 'приемке после ' + tam + 'ремонта', korik: 'техническом осмотре', tekshir: 'проверке', ekspl: 'эксплуатации' };
            const vt = c.vtype || bgVType(bgVag(N[0] || '')) || '______', from = /вагон хизмат|vagon xizmat/i.test(c.kimdan || '') ? ', поступивш' + (many ? 'их' : 'его') + ' из ВС,' : '';
            const obj = c.tur === 'gildirak' ? 'колесн' + (many ? 'ых пар ' : 'ой пары ') + nos : c.tur === 'boshqa' ? (c.obj || '______') : 'вагон' + (many ? 'ов ' : 'а ') + nos + ' типа ' + vt + from;
            const mid = c.matnAuto ? 'при ' + (c.tur === 'gildirak' && c.jar === 'qabul' ? 'приемке' : (jar[c.jar] || jar.qabul)) + ' ' + obj : c.matn, s = bgRuSana(c.sana), A = c.azo || [];
            const L = c.D.map((x: any) => { let t = String(x.t || '').trim(); const j = String(x.joy || '').trim(), jr = BG_QISM_RU[j] || j; if (!t && !j) return ''; if (jr && !t.toLowerCase().startsWith(jr.toLowerCase())) t = jr + (t ? ' – ' + t : '');
                if (many && x.no) t = (c.tur === 'gildirak' ? 'Колесная пара №' : 'Вагон №') + x.no + ': ' + t; if (c.sanaQ && c.tur === 'vagon') { const v = bgVag(x.no || N[0] || ''); const r = v && BG9.agmkLastRep ? BG9.agmkLastRep(v) : null; if (r && r.d) t += ' (дата ремонта ' + (r.t === 'KR' ? 'КР' : 'ДР') + ' ' + bgDmy(r.d) + ' г.)'; } return t; }).filter(Boolean);
            d.h1 = 'Докладная записка'; d.h2 = 'АКТ';
            d.kim_l = c.kim ? (BG9.tlRuDat ? BG9.tlRuDat(RR(c.kim.l)) : RR(c.kim.l)) : '______'; d.kim_n = c.kim ? (BG9.tlRuDatName ? BG9.tlRuDatName(bgRuIni(c.kim.n)) : bgRuIni(c.kim.n)) : '______';
            d.matn1 = 'Довожу до Вашего сведения, что ' + s + ' ' + mid + ' выявлены следующие неисправности (акт прилагается):';
            d.matn2 = 'Мы, нижеподписавшиеся: ' + (A.map((a: any) => low(RR(a.l)) + ' ' + bgRuIni(a.n)).join(', ') || '______') + ', составили настоящий акт о том, что ' + s + ' ' + mid + ' выявлены следующие неисправности:';
            L.forEach((t: string, i: number) => { d['d' + (i + 1)] = t; d['e' + (i + 1)] = t; });
            d.xulosa = c.xulAuto ? (BG_XUL_RU[c.xul] || BG_XUL_RU.a).replace('{U}', unit) : c.xulT; d.mu_l = c.mu ? RR(c.mu.l) : '______'; d.mu_n = c.mu ? (BG9.tlRuName ? BG9.tlRuName(c.mu.n) : c.mu.n) : '______';
            d.shahar = 'г. Алмалык'; d.sana_d = bgDmy(c.sana) + ' г.';
            A.forEach((a: any, i: number) => { d['s' + (i + 1) + 'r'] = RR(a.l); d['s' + (i + 1) + 'n'] = bgRuIni(a.n); });
            d._bg = { nd: Math.max(1, L.length), ns: Math.max(1, A.length) }; if (c._ed) d._ed = c._ed; return d;
        }
        function bgData(): any {
            if (BG.cur && BG.cur.yoz === 'ru') return bgDataRu();
            const c = BG.cur, mid = c.matnAuto ? bgMid() : c.matn, s = bgSanaS(c.sana), L = c.D.map(bgLine).filter(Boolean), A = c.azo || [], d: any = {};
            const lat = c.yoz === 'lat', azoTxt = A.map((a: any, i: number) => bgCyr(a.l) + ' ' + bgIni(a.n) + (i === A.length - 1 ? (lat ? 'lar' : 'лар') : '')).join(', ');
            d.h1 = bgOut('Билдирги'); d.h2 = bgOut('Далолатнома');
            d.kim_l = bgOut(c.kim ? bgCyr(c.kim.l) : '______'); d.kim_n = bgOut(c.kim ? bgDat(c.kim.n) : '______');
            d.matn1 = bgOut('Сизга шуни маълум қиламанки, ' + s + ' куни ' + mid + ' қўйидаги носозликлар аниқланди (далолатнома илова этилади):');
            d.matn2 = bgOut('Биз қуйидаги имзо чекувчилар ' + (azoTxt || '______') + ' ' + s + ' куни ' + mid + ' қўйидаги носозликлар аниқланди:');
            L.forEach((t: string, i: number) => { d['d' + (i + 1)] = bgOut(t); d['e' + (i + 1)] = bgOut(t); });
            d.xulosa = bgOut(bgXul()); d.mu_l = bgOut(c.mu ? bgCyr(c.mu.l) : '______'); d.mu_n = bgOut(c.mu ? bgSur(c.mu.n) : '______');
            d.shahar = bgOut('Олмалиқ шаҳар'); d.sana_d = bgDmy(c.sana) + (lat ? 'y.' : 'й.');
            A.forEach((a: any, i: number) => { d['s' + (i + 1) + 'r'] = bgOut(bgCyr(a.l)); d['s' + (i + 1) + 'n'] = bgOut(bgIni(a.n)); });
            d._bg = { nd: Math.max(1, L.length), ns: Math.max(1, A.length) }; if (c._ed) d._ed = c._ed;
            return d;
        }
        // Shablondagi ortiqcha qatorlar (nosozlik 15 ta, imzo 10 ta oʻrin) — toʻldirishdan oldin olib tashlanadi
        function bgTrim(xml: string, g: any): string {
            return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, p => { const m = p.match(/\{\{([de])(\d+)\}\}/) || p.match(/\{\{s(\d+)r\}\}/); if (!m) return p; const k = +(m.length === 3 ? m[2] : m[1]), lim = m.length === 3 ? g.nd : g.ns; return k > lim ? '' : p; });
        }
        if (typeof BG9.dxFillXml === 'function') BG9.dxFillXml = BG9.agmkExtend('dxFillXml', '4.9 b116: bildirgi — ortiqcha qatorlar', BG9.dxFillXml, (o: Function) => function (this: unknown, xml: string, data: any) {
            try { if (data && data._bg) xml = bgTrim(xml, data._bg); } catch (e) { console.error(e); } return o.call(this, xml, data);
        });

        // ---- Oyna ----
        function bgOpen(pref?: any, old?: any): void {
            BG.cur = old ? JSON.parse(JSON.stringify(old)) : bgNew(pref);
            if (!BG.cur.mu) { try { const me = BG9.currentUser && String(BG9.currentUser.tabel || ''); const P = typeof kqPeople === 'function' ? kqPeople() : []; const x = P.find((p: any) => p.id === me); if (x) BG.cur.mu = { l: kqLav(x.lav, x.lbl), n: kqShort(x.name) }; } catch (e) { /* */ } }
            BG9.mdl('bgModal', `<div class="px-h"><b>📣 Bildirgi va dalolatnoma</b><button class="mini-btn kq-mo" type="button" onclick="bgMore(event)">⋮</button><button class="mini-btn" onclick="mdlClose('bgModal')">✕</button></div><div id="bgForm"></div>
                <div class="nv-btns"><button onclick="bgOut2('docx')">📝 Word</button><button onclick="bgOut2('pdf')">📄 PDF</button><button onclick="bgOut2('all')">📦 Word + PDF</button></div>
                <div class="nv-btns"><button class="on" onclick="bgSendPick()">📤 Yuborish</button><button onclick="bgSign()">✍️ Imzoga</button></div>
                <div id="bgPrev"></div>`, true);
            bgDraw();
        }
        function bgF(k: string, v: any, redraw?: boolean): void { const c = BG.cur; if (!c) return; c[k] = v; if (k === 'nos') { const v0 = bgVag(bgNos()[0] || ''); if (v0 && !c.vtypeManual) c.vtype = bgVType(v0); } bgKeep(); if (redraw) bgDraw(); else bgPrevSoon(); }
        var BG_T: any = 0; function bgPrevSoon(): void { clearTimeout(BG_T); BG_T = setTimeout(bgPrev, 350); }
        function bgDraw(): void {
            const c = BG.cur, b = BG9.$id('bgForm'); if (!c || !b) return; const E = bgE, N = bgNos();
            const card = (k: string, a: any, t: string) => a && (a.n || a.l) ? `<div class="kq-p"><span><b>${E(a.n)}</b><small>${E(a.l)}</small></span><button class="mini-btn" onclick="bgPick('${k}')">✎</button></div>` : `<button class="kq-add" onclick="bgPick('${k}')">👤 ${t}</button>`;
            const sel = (k: string, opts: any[], v: string, rd?: boolean) => `<select onchange="bgF('${k}', this.value, ${rd ? 'true' : 'false'})">${opts.map(([val, t]) => `<option value="${val}"${val === v ? ' selected' : ''}>${E(t)}</option>`).join('')}</select>`;
            const midAuto = bgMid();
            b.innerHTML = `<div class="kq-f">
                <label class="kq-l">Sana<input type="date" value="${E(c.sana)}" onchange="bgF('sana', this.value)"></label>
                <label class="kq-l">Yozuv<span class="bg-seg"><button type="button" class="${c.yoz !== 'lat' && c.yoz !== 'ru' ? 'on' : ''}" onclick="bgF('yoz','cyr',true)">Кирилл</button><button type="button" class="${c.yoz === 'lat' ? 'on' : ''}" onclick="bgF('yoz','lat',true)">Lotin</button><button type="button" class="${c.yoz === 'ru' ? 'on' : ''}" onclick="bgF('yoz','ru',true)">Русский</button></span></label></div>
                <div class="kq-h">KIMGA (bildirgi kimga yoziladi)</div>${card('kim', c.kim, 'Rahbarni tanlash (shtatdan)')}
                <div class="kq-h">NIMA TEKSHIRILDI</div><div class="kq-f">
                <label class="kq-l">Obyekt${sel('tur', [['vagon', 'Vagon (dumpkar)'], ['gildirak', 'Gʻildirak juftligi'], ['boshqa', 'Boshqa (qoʻlda)']], c.tur, true)}</label>
                ${c.tur === 'boshqa' ? `<label class="kq-l">Obyekt nomi (masalan: «№12 рақамли платформа»)<input value="${E(c.obj || '')}" oninput="bgF('obj', this.value)"></label>` : `<label class="kq-l">Raqam(lar)i — vergul bilan<input value="${E(c.nos)}" placeholder="2201, 00000468" oninput="bgF('nos', this.value)" onchange="bgDraw()"></label>`}
                ${c.tur === 'vagon' ? `<label class="kq-l">Vagon turi<input value="${E(c.vtype)}" placeholder="2ВС-105" oninput="BG.cur.vtypeManual=true; bgF('vtype', this.value)"></label><label class="kq-l">Kimdan (taʼmirlagan)<input value="${E(c.kimdan)}" placeholder="Вагон хизматидан" oninput="bgF('kimdan', this.value)"></label>` : ''}
                <label class="kq-l">Jarayon${sel('jar', Object.keys(BG_JAR).map(k => [k, BG_JAR[k][0]]), c.jar, true)}</label>
                ${c.jar === 'qabul' && c.tur !== 'gildirak' ? `<label class="kq-l">Taʼmir turi${sel('tamir', [['', '—'], ['DR', 'Depo taʼmiri (DR)'], ['KR', 'Kapital taʼmir (KR)']], c.tamir)}</label>` : ''}
                ${c.tur === 'vagon' ? `<label class="bg-ck"><input type="checkbox" ${c.sanaQ ? 'checked' : ''} onchange="bgF('sanaQ', this.checked, true)"> Har nosozlik oxiriga taʼmir sanasi (pasportdan: «таъмир санаси ДР 28.09.2025й»)</label>` : ''}
                <label class="kq-l">Gap (avtomatik — kerak boʻlsa tahrirlang)${c.matnAuto ? '' : ' · <a onclick="BG.cur.matnAuto=true; bgDraw(); bgPrevSoon()">↺ avtomatik</a>'}<textarea rows="3" oninput="BG.cur.matnAuto=false; BG.cur.matn=this.value; bgPrevSoon()">${E(c.matnAuto ? midAuto : c.matn)}</textarea></label></div>
                <div class="kq-h">NOSOZLIKLAR (vagonning qaysi joyida — roʻyxatdan yoki qoʻlda yozing)</div>
                <datalist id="bgQism">${BG_QISM.map(q => `<option value="${E(q[0])}">${E(q[1])}</option>`).join('')}</datalist>
                ${c.D.map((d: any, i: number) => `<div class="bg-d"><div class="bg-dh"><b>${i + 1}.</b>${N.length > 1 ? `<select onchange="BG.cur.D[${i}].no=this.value; bgPrevSoon()"><option value="">— vagon —</option>${N.map(n => `<option${n === d.no ? ' selected' : ''}>${E(n)}</option>`).join('')}</select>` : ''}<input list="bgQism" class="bg-joy" value="${E(d.joy)}" placeholder="Joyi: masalan Тормоз цилиндри" oninput="BG.cur.D[${i}].joy=this.value; bgPrevSoon()"><button class="mini-btn" title="Shu qatordan keyin yangi nosozlik (yangi xatboshi)" onclick="bgDIns(${i})">➖</button>${c.D.length > 1 ? `<button class="mini-btn" onclick="bgDDel(${i})">✕</button>` : ''}</div>
                    <textarea rows="2" id="bgDT${i}" onfocus="BG.fi=${i}" onkeydown="bgDKey(event, ${i})" onpaste="bgDPaste(event, ${i})" oninput="BG.cur.D[${i}].t=this.value; bgPrevSoon()" placeholder="Nima aniqlandi: masalan «таъмирланмаган» (Enter — keyingi nosozlik yangi xatboshidan)">${E(d.t)}</textarea></div>`).join('')}
                <div class="bg-chips">${BG_IBORA.map((t, k) => `<i onclick="bgIbora(${k})">${E(t)}</i>`).join('')}</div>
                <button class="kq-add" onclick="bgDAdd()">➖ Yangi nosozlik (yangi xatboshidan)</button>
                <div class="kq-h">XULOSA</div><div class="kq-f">
                <label class="kq-l">Javobgar boʻlinma<input value="${E(c.unit)}" oninput="bgF('unit', this.value, false); if (BG.cur.xulAuto) { const t=document.getElementById('bgXT'); if (t) t.value=bgXulT(); }"></label>
                <label class="kq-l">Shakl${sel('xul', [['a', 'Ichki mehnat qoidalari (Q-93950-31-11-382-2024)'], ['b', 'Qisqa: chora + takrorlanmasligi']], c.xul, true)}</label>
                <label class="kq-l">Matn${c.xulAuto ? '' : ' · <a onclick="BG.cur.xulAuto=true; bgDraw(); bgPrevSoon()">↺ avtomatik</a>'}<textarea id="bgXT" rows="4" oninput="BG.cur.xulAuto=false; BG.cur.xulT=this.value; bgPrevSoon()">${E(bgXul())}</textarea></label></div>
                <div class="kq-h">BILDIRGI MUALLIFI</div>${card('mu', c.mu, 'Muallifni tanlash')}
                <div class="kq-h">DALOLATNOMA — KOMISSIYA (imzo chekuvchilar)</div>
                ${(c.azo || []).map((a: any, i: number) => `<div class="kq-p"><span><b>${i + 1}. ${E(a.n)}</b><small>${E(a.l)}</small></span>${i ? `<button class="mini-btn" onclick="bgAzoUp(${i})">▲</button>` : ''}<button class="mini-btn" onclick="bgAzoDel(${i})">✕</button></div>`).join('') || '<div class="nd-tip">— hali hech kim qoʻshilmagan</div>'}
                ${(c.azo || []).length < 10 ? `<button class="kq-add" onclick="bgPick('azo')">➕ Komissiya aʼzosini qoʻshish</button>` : ''}`;
            bgPrevSoon();
        }
        function bgXulT(): string { return bgXul(); }
        function bgIbora(k: number): void { const c = BG.cur, i = BG.fi == null ? c.D.length - 1 : BG.fi, t = BG_IBORA[k], el = BG9.$id('bgDT' + i); if (!c.D[i]) return; c.D[i].t = (c.D[i].t ? c.D[i].t.replace(/\s+$/, '') + ' ' : '') + t; if (el) el.value = c.D[i].t; bgPrevSoon(); }
        function bgDAdd(): void { BG.cur.D.push({ no: '', joy: '', t: '' }); BG.fi = BG.cur.D.length - 1; bgDraw(); setTimeout(() => { const e = BG9.$id('bgDT' + BG.fi); if (e) e.focus(); }, 50); }
        // 4.9 b116: har bir nosozlik — alohida xatboshi («-» bilan). ➖ yoki Enter — yangi xatboshi; koʻp qatorli matn qoʻyilsa — har qatori alohida
        function bgDIns(i: number, rest?: string): void { BG.cur.D.splice(i + 1, 0, { no: BG.cur.D[i] ? BG.cur.D[i].no : '', joy: '', t: rest || '' }); BG.fi = i + 1; bgDraw(); setTimeout(() => { const e = BG9.$id('bgDT' + (i + 1)); if (e) { e.focus(); try { e.setSelectionRange(0, 0); } catch (x) { /* */ } } }, 50); }
        function bgDKey(ev: any, i: number): void {
            if (ev.key !== 'Enter' || ev.shiftKey) return; ev.preventDefault(); const ta = ev.target, v = String(ta.value || ''), at = ta.selectionStart == null ? v.length : ta.selectionStart;
            BG.cur.D[i].t = v.slice(0, at).replace(/\s+$/, ''); bgDIns(i, v.slice(at).replace(/^\s*[-–•]?\s*/, ''));
        }
        function bgDPaste(ev: any, i: number): void {
            const t = (ev.clipboardData || (window as any).clipboardData) ? (ev.clipboardData || (window as any).clipboardData).getData('text') : ''; const L = String(t || '').split(/\r?\n/).map(x => x.replace(/^\s*[-–•]\s*/, '').trim()).filter(Boolean);
            if (L.length < 2) return; ev.preventDefault(); const cur = BG.cur.D[i]; cur.t = (cur.t ? cur.t + ' ' : '') + L[0];
            BG.cur.D.splice(i + 1, 0, ...L.slice(1).map(x => ({ no: cur.no, joy: '', t: x }))); BG.fi = i + L.length - 1; bgDraw();
        }
        function bgDDel(i: number): void { BG.cur.D.splice(i, 1); BG.fi = null; bgDraw(); }
        function bgAzoDel(i: number): void { BG.cur.azo.splice(i, 1); bgKeep(); bgDraw(); }
        function bgAzoUp(i: number): void { const A = BG.cur.azo; if (i <= 0) return; const t = A[i]; A[i] = A[i - 1]; A[i - 1] = t; bgKeep(); bgDraw(); }
        function bgPick(k: string): void {
            const T: any = { kim: '👤 Bildirgi kimga (rahbar)', mu: '✍️ Bildirgi muallifi', azo: '➕ Komissiya aʼzosi' };
            BG9.agmkPickPerson(T[k], (p: any) => { const c = BG.cur; if (!c) return; let tab = ''; try { tab = String((BG9.$id('kqPX') || {}).value || ''); } catch (e) { /* */ }
                const x = { l: p.l, n: p.n, tab: tab }; if (k === 'azo') c.azo.push(x); else c[k] = x; bgKeep(); bgDraw(); }, 'uz');
        }
        async function bgPrev(): Promise<void> { const el = BG9.$id('bgPrev'); if (!el || !BG.cur) return; try { await BG9.dxPreview(el, 'bildirgi', bgData()); } catch (e) { console.error(e); el.textContent = '⚠️ ' + String(e); } }
        function bgCheck(): boolean {
            const c = BG.cur; if (!c) return false;
            if (!c.D.some((d: any) => String(d.t || d.joy || '').trim())) { BG9.alert('Kamida bitta nosozlikni yozing.'); return false; }
            if (!c.kim) { BG9.alert('Bildirgi kimga yozilishini tanlang (KIMGA).'); return false; }
            if (!c.mu) { BG9.alert('Bildirgi muallifini tanlang.'); return false; }
            return true;
        }
        function bgTitle(): string { const c = BG.cur, N = bgNos(); return 'Bildirgi ' + (c.tur === 'gildirak' ? 'gʻildirak ' : c.tur === 'vagon' ? 'vagon ' : '') + (N.join(', ') || c.obj || '') + ' ' + bgDmy(c.sana); }
        async function bgFiles(kind: string): Promise<any[]> {
            const R = await BG9.dxRender('bildirgi', bgData()), b = bgTitle().replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 80), files: any[] = [];
            const reg = (blob: any) => { try { if (BG9.EXS) BG9.EXS.set(blob, { lay: R.lay, title: bgTitle() }); } catch (e) { /* */ } return blob; };
            if (kind !== 'pdf') files.push({ name: b + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: reg(BG9.dxDocxBlob(R.files)) });
            if (kind !== 'docx') { BG9.PDFK.f = null; files.push({ name: b + '.pdf', mime: 'application/pdf', blob: reg(BG9.pdfBuild(R.lay)) }); }
            return files;
        }
        function bgStore(): void { const c = BG.cur; if (!c) return; const L = bgGet(BG_LIST, []).filter((x: any) => x.id !== c.id); c.at = new Date().toISOString(); L.unshift(JSON.parse(JSON.stringify(c))); bgSet(BG_LIST, L.slice(0, 100)); }
        async function bgOut2(kind: string): Promise<void> {
            if (!bgCheck()) return; bgStore();
            try { const files = await bgFiles(kind); if (typeof BG9.exOpen === 'function') BG9.exOpen(files, { title: bgTitle(), act: 'dl' }); else BG9.docDownload(files); try { BG9.aiLog('Bildirgi: ' + bgTitle()); } catch (e) { /* */ } }
            catch (e) { console.error(e); BG9.alert('⚠️ ' + (BG9.agmkErrUz ? BG9.agmkErrUz(e) : String(e))); }
        }
        async function bgSign(): Promise<void> {
            if (!bgCheck()) return; if (!(BG.cur.azo || []).length) { BG9.alert('Dalolatnoma uchun kamida bitta komissiya aʼzosini qoʻshing.'); return; }
            if (typeof BG9.sigSendOpen !== 'function' || typeof BG9.dxPlainHtml !== 'function') { BG9.alert('Imzolash moduli topilmadi.'); return; }
            bgStore(); try { const data = bgData(), R = await BG9.dxRender('bildirgi', data);
                const html = `<div class="dxt-doc" data-dxt="bildirgi" data-dxd="${bgE(btoa(unescape(encodeURIComponent(JSON.stringify(data)))))}">${BG9.dxPlainHtml(R.M)}</div>`;
                await BG9.sigSendOpen({ html: html, title: bgTitle() }); } catch (e) { console.error(e); BG9.alert('⚠️ ' + String(e)); }
        }
        // 📤 Istalgan xodimga: standart — «Kimga» dagi rahbar; boshqasini ham tanlash mumkin
        function bgSendPick(): void {
            if (!bgCheck()) return; const c = BG.cur, E = bgE;
            BG9.mdl('bgSend', `<div class="px-h"><b>📤 Bildirgini yuborish</b><button class="mini-btn" onclick="mdlClose('bgSend')">✕</button></div>
                <div class="snd-doc">📄 ${E(bgTitle())}</div>
                ${c.kim ? `<div class="ms-big" onclick="mdlClose('bgSend'); bgSendTo(BG.cur.kim)"><span>👤</span><div><b>${E(c.kim.n)}</b><small>${E(c.kim.l)} — bildirgi kimga yozilgan</small></div></div>` : ''}
                <div class="ms-big" onclick="mdlClose('bgSend'); bgSendOther()"><span>➕</span><div><b>Boshqa xodimga</b><small>shtatdan tanlang</small></div></div>
                <div class="nd-tip">Serverga ulangan boʻlsa — ilova ichida (PDF) boradi; aks holda Telegram ochiladi, «Yuborish»ni oʻzingiz bosasiz.</div>`, true);
        }
        function bgSendOther(): void { BG9.agmkPickPerson('📤 Kimga yuborilsin', (p: any) => { let tab = ''; try { tab = String((BG9.$id('kqPX') || {}).value || ''); } catch (e) { /* */ } bgSendTo({ l: p.l, n: p.n, tab: tab }); }, 'uz'); }
        async function bgSendTo(to: any): Promise<void> {
            bgStore(); const msg = '📣 ' + bgTitle();
            try {
                const files = await bgFiles('pdf'), p = { name: to.n, tabel: to.tab || '', role: to.l };
                if (typeof BG9.syncReady === 'function' && BG9.syncReady() && p.tabel && typeof BG9.syncSendMsg === 'function') {
                    await BG9.syncSendMsg(p, msg, files); try { await BG9.chatAddMsg(p, { me: true, t: msg, files: files, via: 'app' }); } catch (e) { /* */ }
                    BG9.showToast('✅ ' + to.n + 'ga yuborildi (ilova ichida, PDF)');
                } else {
                    try { await BG9.chatAddMsg(p, { me: true, t: msg, files: files, via: 'telegram' }); } catch (e) { /* */ }
                    await BG9.docShare(files, { via: 'telegram', to: p, subject: bgTitle(), text: msg });
                }
                try { BG9.aiLog('Bildirgi yuborildi: ' + bgTitle() + ' → ' + to.n); } catch (e) { /* */ }
            } catch (e) { console.error(e); BG9.alert('⚠️ Yuborilmadi: ' + (BG9.agmkErrUz ? BG9.agmkErrUz(e) : String(e))); }
        }
        function bgMore(ev: any): void {
            if (ev) ev.stopPropagation(); const ex = BG9.$id('bgPop'); if (ex) { ex.remove(); return; } const h = document.querySelector('#bgModal .px-h') as any; if (!h) return;
            const p = document.createElement('div'); p.id = 'bgPop'; p.className = 'qo-pop';
            p.innerHTML = `<button type="button" onclick="bgPopX();bgOut2('docx')">📝 <span>Word</span></button><button type="button" onclick="bgPopX();bgOut2('pdf')">📄 <span>PDF</span></button><button type="button" onclick="bgPopX();bgSendPick()">📤 <span>Yuborish</span></button><button type="button" onclick="bgPopX();bgSign()">✍️ <span>Imzoga yuborish</span></button><button type="button" onclick="bgPopX();bgOpen()">🆕 <span>Yangi bildirgi</span></button>`;
            h.style.position = 'relative'; h.appendChild(p); setTimeout(() => document.addEventListener('click', bgPopX, { once: true }), 0);
        }
        function bgPopX(): void { const p = BG9.$id('bgPop'); if (p) p.remove(); }
        function bgOpenOld(id: string): void { const x = bgGet(BG_LIST, []).find((z: any) => z.id === id); if (x) bgOpen(null, x); }
        Object.assign(BG9, { bgDIns: bgDIns, bgDKey: bgDKey, bgDPaste: bgDPaste, BG: BG, bgOpen: bgOpen, bgOpenOld: bgOpenOld, bgF: bgF, bgDraw: bgDraw, bgIbora: bgIbora, bgDAdd: bgDAdd, bgDDel: bgDDel, bgAzoDel: bgAzoDel, bgAzoUp: bgAzoUp, bgPick: bgPick, bgPrevSoon: bgPrevSoon, bgXulT: bgXulT,
            bgOut2: bgOut2, bgSign: bgSign, bgSendPick: bgSendPick, bgSendOther: bgSendOther, bgSendTo: bgSendTo, bgMore: bgMore, bgPopX: bgPopX, bgData: bgData, bgCyr: bgCyr });
        // Tahrir (✏️) va yaqinlashtirish — umumiy koʻrinish moduli bilan
        BG9.ED_CTX = BG9.ED_CTX || {};
        BG9.ED_CTX.bgPrev = { get: () => BG.cur, save: () => { /* hujjat bilan saqlanadi */ }, redraw: () => bgPrev(), data: () => bgData() };

        // ---- Kirish nuqtalari ----
        (function () {
            try { if (Array.isArray(BG9.HS_AKT) && !BG9.HS_AKT.some((c: any) => c.k === 'bildirgi')) BG9.HS_AKT.push({ k: 'bildirgi', ic: '📣', t: 'Bildirgi (nosozlik aniqlanganda)', types: [] }); } catch (e) { /* */ }
            if (typeof BG9.hsRender === 'function') BG9.hsRender = BG9.agmkExtend('hsRender', '4.9 b116: Bildirgi boʻlimi', BG9.hsRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try {
                    const HS = BG9.HS; if (!HS || HS.tab !== 'akt') return r; const b = BG9.secBody ? BG9.secBody('screen-hisob') : null; if (!b) return r; const L = bgGet(BG_LIST, []);
                    if (!HS.akt) { b.querySelectorAll('.hs-grid .hs-card').forEach((c: any) => { if (/HS\.akt='bildirgi'/.test(c.getAttribute('onclick') || '')) { const s = c.querySelector('small'); if (s) s.textContent = L.length + ' ta bildirgi'; } }); return r; }
                    if (HS.akt !== 'bildirgi') return r; const E = bgE;
                    const back = b.querySelector('.hs-back'), html = `<div class="hs-new card-list h9-list"><div id="bgCat" class="db-two" onclick="bgOpen()"><button class="action-btn" onclick="event.stopPropagation();bgOpen()">📣 Yangi bildirgi va dalolatnoma</button></div></div>
                        ${L.length ? '<div class="hs-list">' + L.map((x: any) => `<div class="hs-row" onclick="bgOpenOld('${E(x.id)}')"><b>📣 ${E((x.tur === 'gildirak' ? 'Gʻildirak ' : x.tur === 'vagon' ? 'Vagon ' : '') + (x.nos || x.obj || ''))}</b><small>📄 ${E(bgDmy(x.sana))} · ${(x.D || []).filter((d: any) => d.t || d.joy).length} ta nosozlik · 👤 ${E(x.kim ? x.kim.n : '')}</small></div>`).join('') + '</div>' : '<div class="xt-empty">Hali bildirgi yoʻq.</div>'}
                        <div class="nd-tip">Tekshiruv yoki qabul paytida kamchilik koʻrilsa — shu yerda yoki vagon pasportidagi «📣 Bildirgi» tugmasi bilan joyida tuzing.</div>`;
                    b.innerHTML = (back ? back.outerHTML : '') + html;
                    try { if (typeof BG9.h9Tpl === 'function') BG9.h9Tpl(b); } catch (e) { /* */ }
                } catch (e) { console.error(e); }
                return r;
            });
            // Vagon pasportida «📣 Bildirgi»
            if (typeof BG9.openPassport === 'function') BG9.openPassport = BG9.agmkExtend('openPassport', '4.9 b116: pasportda Bildirgi', BG9.openPassport, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                setTimeout(() => { try { const t = BG9.$id('pasportMainTitle'), host = t && t.parentElement; if (!host || BG9.$id('bgPassB')) return; const b = document.createElement('button'); b.id = 'bgPassB'; b.className = 'p8-pb'; b.innerHTML = '📣 <span>Bildirgi</span>'; b.title = 'Nosozlik boʻyicha bildirgi va dalolatnoma';
                    b.onclick = () => { try { const v = ((typeof vagonlarData !== 'undefined' ? (vagonlarData as any) : null) || []).find((x: any) => x.id === (typeof activeVagonId !== 'undefined' ? (activeVagonId as any) : null)); bgOpen(v ? { nos: String(BG9.vagonNo(v)), vtype: bgVType(v) } : null); } catch (e) { bgOpen(); } };
                    const p8 = BG9.$id('p8PassB'); if (p8) p8.after(b); else host.insertBefore(b, host.querySelector('button')); } catch (e) { console.error(e); } }, 60);
                return r;
            });
            const st = document.createElement('style');
            st.textContent = '.bg-seg{display:flex;gap:6px;margin-top:4px}.bg-seg button{flex:1;padding:9px;border-radius:10px;border:1px solid rgba(148,163,184,.35);background:rgba(2,6,23,.4);color:#e2e8f0;font:700 14px/1 inherit}.bg-seg button.on{background:#0ea5e9;border-color:#0ea5e9;color:#fff}'
                + '.bg-ck{display:flex;gap:8px;align-items:flex-start;font-size:13px;margin:6px 0}.bg-d{border:1px solid rgba(148,163,184,.25);border-radius:12px;padding:8px;margin:6px 0;background:rgba(2,6,23,.25)}.bg-dh{display:flex;gap:6px;align-items:center;margin-bottom:6px}.bg-dh .bg-joy{flex:1;min-width:0}.bg-dh select{max-width:120px}'
                + '.bg-d textarea{width:100%;box-sizing:border-box}.bg-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.bg-chips i{font-style:normal;font-size:12.5px;padding:6px 9px;border-radius:999px;border:1px solid rgba(125,211,252,.4);background:rgba(14,165,233,.12);color:#e0f2fe;cursor:pointer}';
            document.head.appendChild(st);
        })();
