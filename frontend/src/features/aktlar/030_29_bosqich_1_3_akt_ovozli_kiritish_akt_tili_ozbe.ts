        /* ===== 29-bosqich (1,3): Akt — ovozli kiritish, akt tili (o'zbek / rus), manbalar ===== */
        // ---------- Lug'at: detallar ----------
        var TR_PARTS = [
            { id: 'kolod', re: /tormoz kolodka\w*|kolodka\w*|тормозн\w* колод\w*|колод\w*/i, uz: 'tormoz kolodkasi', uzPl: 'tormoz kolodkalari', ru: 'тормозная колодка', ruG: 'тормозной колодки', ruPl: 'тормозные колодки', ruGPl: 'тормозных колодок', sp: /тормозная колодка/i },
            { id: 'klin', re: /kolodka klini|klin\w*|клин\w*|чек[аи]/i, uz: 'kolodka klini (cheka)', uzPl: 'kolodka klinlari', ru: 'клин (чека) тормозной колодки', ruG: 'клина тормозной колодки', ruPl: 'клинья тормозных колодок', ruGPl: 'клиньев тормозных колодок', sp: /клин \(чека\)/i },
            { id: 'bashm', re: /bashmak\w*|башмак\w*/i, uz: 'tormoz bashmagi', uzPl: 'tormoz bashmaklari', ru: 'башмак тормозной колодки', ruG: 'башмака тормозной колодки', ruPl: 'башмаки', ruGPl: 'башмаков', sp: /башмак тормозной/i },
            { id: 'nadr', re: /nadressor\w*( balka\w*)?|надрессорн\w*( балк\w*)?/i, uz: 'nadressor balka', uzPl: 'nadressor balkalar', ru: 'надрессорная балка', ruG: 'надрессорной балки', ruPl: 'надрессорные балки', ruGPl: 'надрессорных балок', sp: /надрессорная балка/i },
            { id: 'bokov', re: /bokovina\w*|боковин\w*/i, uz: 'bokovina (yon rama)', uzPl: 'bokovinalar', ru: 'боковина', ruG: 'боковины', ruPl: 'боковины', ruGPl: 'боковин', sp: null },
            { id: 'buks', re: /buksa korpus\w*|korpus\w* buks\w*|buksa\w*|корпус\w* букс\w*|букс\w*/i, uz: 'buksa korpusi', uzPl: 'buksa korpuslari', ru: 'корпус буксы', ruG: 'корпуса буксы', ruPl: 'корпуса букс', ruGPl: 'корпусов букс', sp: null },
            { id: 'gjuft', re: /g.?ildirak juftlig\w*|g.?ildirak\w*|колесн\w* пар\w*|колес\w*/i, uz: "g'ildirak juftligi", uzPl: "g'ildirak juftliklari", ru: 'колесная пара', ruG: 'колесной пары', ruPl: 'колесные пары', ruGPl: 'колесных пар', sp: /колесная пара/i },
            { id: 'obod', re: /obod\w*|обод\w*/i, uz: "g'ildirak obodi", uzPl: "g'ildirak obodlari", ru: 'обод колеса', ruG: 'обода колеса', ruPl: 'ободья колес', ruGPl: 'ободьев колес', sp: null },
            { id: 'gard', re: /gardish\w*|гребн\w*|гребен\w*/i, uz: "g'ildirak gardishi", uzPl: "g'ildirak gardishlari", ru: 'гребень колеса', ruG: 'гребня колеса', ruPl: 'гребни колес', ruGPl: 'гребней колес', sp: null },
            { id: 'oq', re: /\bo.?qi?\b|\bo.?qlar\w*|\bос[ьи]\b|\bосей\b/i, uz: "o'q", uzPl: "o'qlar", ru: 'ось', ruG: 'оси', ruPl: 'оси', ruGPl: 'осей', sp: null },
            { id: 'xreb', re: /xrebtov\w*( balka\w*)?|asosiy balka\w*|хребтов\w*( балк\w*)?/i, uz: 'xrebtov (asosiy) balka', uzPl: 'xrebtov balkalar', ru: 'хребтовая балка', ruG: 'хребтовой балки', ruPl: 'хребтовые балки', ruGPl: 'хребтовых балок', sp: /балка хребтовая/i },
            { id: 'shkv', re: /shkvorn\w* balka\w*|шкворнев\w* балк\w*/i, uz: 'shkvorn balka', uzPl: 'shkvorn balkalar', ru: 'шкворневая балка', ruG: 'шкворневой балки', ruPl: 'шкворневые балки', ruGPl: 'шкворневых балок', sp: /балка шкворневая/i },
            { id: 'shkvn', re: /shkvorn\w*|шкворн\w*/i, uz: 'shkvorn', uzPl: 'shkvornlar', ru: 'шкворень', ruG: 'шкворня', ruPl: 'шкворни', ruGPl: 'шкворней', sp: /шкворень/i },
            { id: 'pyat', re: /pyatnik\w*|пятник\w*/i, uz: 'pyatnik', uzPl: 'pyatniklar', ru: 'пятник', ruG: 'пятника', ruPl: 'пятники', ruGPl: 'пятников', sp: /^пятник/i },
            { id: 'upor', re: /upor\w*|упор\w*/i, uz: 'upor', uzPl: 'uporlar', ru: 'упор', ruG: 'упора', ruPl: 'упоры', ruGPl: 'упоров', sp: /упор (передний|задний)/i },
            { id: 'avts', re: /avto ?s[ts]?[cт]epka\w*|avtostsepka\w*|avtoscepka\w*|автосцепк\w*/i, uz: 'avtostsepka', uzPl: 'avtostsepkalar', ru: 'автосцепка', ruG: 'автосцепки', ruPl: 'автосцепки', ruGPl: 'автосцепок', sp: /автосцепка \(в сборе\)/i },
            { id: 'pogl', re: /yutuvchi apparat\w*|pogloshay\w*|поглощающ\w* аппарат\w*/i, uz: 'yutuvchi apparat', uzPl: 'yutuvchi apparatlar', ru: 'поглощающий аппарат', ruG: 'поглощающего аппарата', ruPl: 'поглощающие аппараты', ruGPl: 'поглощающих аппаратов', sp: /поглощающий аппарат/i },
            { id: 'tsil', re: /tormoz silindr\w*|тормозн\w* цилиндр\w*/i, uz: 'tormoz silindri', uzPl: 'tormoz silindrlari', ru: 'тормозной цилиндр', ruG: 'тормозного цилиндра', ruPl: 'тормозные цилиндры', ruGPl: 'тормозных цилиндров', sp: /тормозной цилиндр/i },
            { id: 'ssil', re: /ag.?darish silindr\w*|svaloch\w*|свалочн\w* цилиндр\w*/i, uz: "ag'darish silindri", uzPl: "ag'darish silindrlari", ru: 'свалочный цилиндр', ruG: 'свалочного цилиндра', ruPl: 'свалочные цилиндры', ruGPl: 'свалочных цилиндров', sp: /свалочный цилиндр/i },
            { id: 'vozd', re: /havo taqsimlagich\w*|vozduxoraspred\w*|воздухораспредел\w*/i, uz: 'havo taqsimlagich', uzPl: 'havo taqsimlagichlar', ru: 'воздухораспределитель', ruG: 'воздухораспределителя', ruPl: 'воздухораспределители', ruGPl: 'воздухораспределителей', sp: /воздухораспределител/i },
            { id: 'pruj', re: /prujina\w*|пружин\w*/i, uz: 'prujina', uzPl: 'prujinalar', ru: 'пружина', ruG: 'пружины', ruPl: 'пружины', ruGPl: 'пружин', sp: /пружина (внутренняя|наружная)/i },
            { id: 'tyag', re: /tormoz tyaga\w*|tyaga\w*|тормозн\w* тяг\w*|тяг[аиу]\w*/i, uz: 'tormoz tyagasi', uzPl: 'tormoz tyagalari', ru: 'тормозная тяга', ruG: 'тормозной тяги', ruPl: 'тормозные тяги', ruGPl: 'тормозных тяг', sp: /тормозная тяга/i },
            { id: 'trian', re: /triangel\w*|триангел\w*/i, uz: 'triangel', uzPl: 'triangellar', ru: 'триангель', ruG: 'триангеля', ruPl: 'триангели', ruGPl: 'триангелей', sp: /триангель/i },
            { id: 'rukav', re: /rukav\w*|рукав\w*/i, uz: 'ulash rukavi', uzPl: 'ulash rukavlari', ru: 'соединительный рукав', ruG: 'соединительного рукава', ruPl: 'соединительные рукава', ruGPl: 'соединительных рукавов', sp: /рукав р-17/i },
            { id: 'kran', re: /oxirgi kran\w*|kon[ts]evoy kran\w*|концев\w* кран\w*/i, uz: 'oxirgi (konsevoy) kran', uzPl: 'oxirgi kranlar', ru: 'концевой кран', ruG: 'концевого крана', ruPl: 'концевые краны', ruGPl: 'концевых кранов', sp: /кран концевой/i },
            { id: 'telej', re: /aravacha\w*|telejka\w*|тележк\w*/i, uz: 'aravacha (telejka)', uzPl: 'aravachalar', ru: 'тележка', ruG: 'тележки', ruPl: 'тележки', ruGPl: 'тележек', sp: /тележка в сборе/i },
            { id: 'rama', re: /pastki rama\w*|\brama\w*|нижн\w* рам\w*|\bрам[аыу]\b/i, uz: 'rama', uzPl: 'ramalar', ru: 'рама', ruG: 'рамы', ruPl: 'рамы', ruGPl: 'рам', sp: null },
            { id: 'kuzov', re: /kuzov\w*|кузов\w*/i, uz: 'kuzov', uzPl: 'kuzovlar', ru: 'кузов', ruG: 'кузова', ruPl: 'кузова', ruGPl: 'кузовов', sp: null },
            { id: 'bort', re: /\bbort\w*|\bборт\w*/i, uz: 'bort', uzPl: 'bortlar', ru: 'борт', ruG: 'борта', ruPl: 'борта', ruGPl: 'бортов', sp: /борт продольный/i },
            { id: 'lobov', re: /lobov\w* devor\w*|old devor\w*|лобов\w* стенк\w*/i, uz: 'old (lobovoy) devor', uzPl: 'old devorlar', ru: 'лобовая стенка', ruG: 'лобовой стенки', ruPl: 'лобовые стенки', ruGPl: 'лобовых стенок', sp: /стенка лобовая/i },
            { id: 'zaklep', re: /parchin\w*|zaklepka\w*|заклепк\w*/i, uz: 'parchin mix (zaklepka)', uzPl: 'parchin mixlar', ru: 'заклепка', ruG: 'заклепки', ruPl: 'заклепки', ruGPl: 'заклепок', sp: /заклепки/i },
            { id: 'bolt', re: /\bbolt\w*|\bболт\w*/i, uz: 'bolt', uzPl: 'boltlar', ru: 'болт', ruG: 'болта', ruPl: 'болты', ruGPl: 'болтов', sp: /^болт м/i },
            { id: 'vagon', re: /vagon\w*|вагон\w*/i, uz: 'vagon', uzPl: 'vagonlar', ru: 'вагон', ruG: 'вагона', ruPl: 'вагоны', ruGPl: 'вагонов', sp: null, noPart: true }
        ];
        // ---------- Lug'at: nuqsonlar ----------
        var TR_DEF = [
            { re: /суммарн\w*|umumiy(?= yoriq)|jami(?= yoriq)/i, uz: 'umumiy', ru: 'суммарная', sum: true },
            { re: /yorilib ketgan|yorildi|yorilgan|yoriq\w*|трещин\w*/i, uz: 'yoriq', ru: 'трещина', g: 'f' },
            { re: /sindi|singan|siniq\w*|sinish\w*|излом\w*|слом\w*/i, uz: 'sinish', ru: 'излом', g: 'm' },
            { re: /otkol\w*|ko.?chish\w*|ko.?chgan|скол\w*|откол\w*/i, uz: "ko'chish (otkol)", ru: 'откол', g: 'm' },
            { re: /yeyilmasdan|без износа/i, uz: 'yeyilmasdan', ru: 'без износа', mod: true },
            { re: /yeyil\w*|yedirilgan|износ\w*|изношен\w*/i, uz: 'yeyilish', ru: 'износ', g: 'm' },
            { re: /egil\w*|bukil\w*|изгиб\w*|погнут\w*/i, uz: 'egilish', ru: 'изгиб', g: 'm' },
            { re: /uzil\w*|обрыв\w*|оборван\w*/i, uz: 'uzilish', ru: 'обрыв', g: 'm' },
            { re: /zangla\w*|korroziya\w*|коррози\w*/i, uz: 'korroziya (zanglash)', ru: 'коррозия', g: 'f' },
            { re: /bo.?shash\w*|ослаблен\w*/i, uz: "mahkamlanishning bo'shashishi", ru: 'ослабление крепления', g: 'n' },
            { re: /deformatsiya\w*|deformats\w*|деформац\w*/i, uz: 'deformatsiya', ru: 'деформация', g: 'f' },
            { re: /protertl\w*|protert\w*|ishqalan\w*|протерт\w*/i, uz: 'ishqalanib yeyilish (protertost)', ru: 'протертость', g: 'f' },
            { re: /qatlam\w* ajral\w*|расслоен\w*/i, uz: 'qatlamlarga ajralish', ru: 'расслоение', g: 'n' },
            { re: /yetishmaydi|yo.?q\b|mavjud emas|отсутств\w*/i, uz: "yo'qligi", ru: 'отсутствие', g: 'n' },
            { re: /nosoz\w*|yaroqsiz\w*|неисправн\w*|негодн\w*/i, uz: 'yaroqsiz holat', ru: 'неисправность', g: 'f' },
            { re: /muddati o.?tgan|xizmat muddati o.?t\w*|срок служб\w* (истек|просроч)\w*|просроч\w* срок\w* служб\w*/i, uz: "xizmat muddati o'tganligi", ru: 'истечение срока службы', g: 'n' }
        ];
        var TR_LOC = [
            { re: /yon (qism|tomon)\w*|боков\w* част\w*|боков\w* сторон\w*/i, uz: 'yon qismi', uzLoc: 'yon qismida', ru: 'на боковой части' },
            { re: /ishchi (qism|yuza)\w*|рабоч\w* (част|поверхност)\w*/i, uz: 'ishchi qismi', uzLoc: 'ishchi qismida', ru: 'на рабочей поверхности' },
            { re: /ichki (qism|tomon)\w*|внутрен\w* (част|сторон)\w*/i, uz: 'ichki qismi', uzLoc: 'ichki qismida', ru: 'с внутренней стороны' },
            { re: /tashqi (qism|tomon)\w*|наружн\w* (част|сторон)\w*/i, uz: 'tashqi qismi', uzLoc: 'tashqi qismida', ru: 'с наружной стороны' },
            { re: /payvand chok\w*|сварн\w* шв\w*/i, uz: 'payvand choki', uzLoc: 'payvand chokida', ru: 'по сварному шву' }
        ];
        var TR_ACT = [
            { re: /o.?rnatil\w*|установлен\w*|установили/i, uz: "o'rnatildi", ru: 'установлены', ruS: 'установлена' },
            { re: /almashtiril\w*|заменен\w*|заменили/i, uz: 'almashtirildi', ru: 'заменены', ruS: 'заменена' },
            { re: /yechil\w*|yechib olin\w*|снят\w*|сняли/i, uz: 'yechib olindi', ru: 'сняты', ruS: 'снята' },
            { re: /tekshiril\w*|ko.?rikdan o.?tkazil\w*|проверен\w*|осмотрен\w*/i, uz: "ko'rikdan o'tkazildi", ru: 'осмотрены', ruS: 'осмотрена' },
            { re: /ta.?mirlan\w*|отремонтир\w*/i, uz: "ta'mirlandi", ru: 'отремонтированы', ruS: 'отремонтирована' },
            { re: /bo.?yal\w*|окрашен\w*/i, uz: "bo'yaldi", ru: 'окрашены', ruS: 'окрашена' }
        ];
        // Butun satr uchun tayyor iboralar
        var TR_FIX = [
            { re: /^(kolodkalar\w* )?texnik ko.?rikdan o.?tkazildi,? geometrik o.?lcham\w* (gost|гост) ?([\d-]+) ?(ga|талаб\w*)? ?mos\w*$/i, uz: m => "Kolodkalar texnik ko'rikdan o'tkazildi, geometrik o'lchamlari GOST " + m[3] + " talablariga mos keladi", ru: m => 'Колодки прошли технический осмотр, геометрические размеры соответствуют требованиям ГОСТ ' + m[3] },
            { re: /^(kolodkalar\w* )?yon tomon\w* oq rangga bo.?yal\w*$/i, uz: () => "Kolodkalarning yon tomoni oq rangga bo'yaldi", ru: () => 'Боковые поверхности колодок окрашены в белый цвет' },
            { re: /^o.?rnatishda qiyinchilik\w* (bo.?lmadi|yuzaga kelmadi|kuzatilmadi)$/i, uz: () => "O'rnatishda qiyinchiliklar yuzaga kelmadi", ru: () => 'Затруднений при установке не возникло' },
            { re: /^при установке затруднени\w* не (возникло|было)$/i, uz: () => "O'rnatishda qiyinchiliklar yuzaga kelmadi", ru: () => 'Затруднений при установке не возникло' },
            { re: /^просрочен срок службы (\S+) более (\d+) лет$/i, uz: m => { const p = TR_PARTS.find(x => x.re.test(m[1])); const pu = p ? p.uz.replace(/ \(.*\)$/, '') : ''; return (p ? pu.charAt(0).toUpperCase() + pu.slice(1) + 'ning' : m[1]) + ' xizmat muddati o\'tgan — ' + m[2] + ' yildan ortiq'; }, ru: m => 'Просрочен срок службы ' + m[1] + ' — более ' + m[2] + ' лет' },
            { re: /^(\S+?)(ning)? xizmat muddati (\d+) yildan (ortiq|ko.?p) o.?tgan$/i, uz: m => m[0], ru: m => { const p = TR_PARTS.find(x => x.re.test(m[1])); return 'Просрочен срок службы ' + (p ? p.ruG : m[1]) + ' — более ' + m[3] + ' лет'; } }
        ];
        var TR_MON_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        var TR_MON_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        var TR_MON_RE_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sent[ay]*abr', 'okt[ay]*abr', 'noyabr', 'dekabr'];
        var TR_MON_RE_RU = ['январ', 'феврал', 'март', 'апрел', 'ма[йя]', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
        var TR_STOP = new Set(['va', 'ham', 'bilan', 'kuni', 'da', 'dan', 'ga', 'ning', 'bu', 'shu', 'u', 'esa', 'holda', 'holatda', 'holatga', 'keldi', 'bo.ldi', 'boldi', 'aniqlandi', 'aniqlangan', 'kuzatildi', 'qayd', 'etildi', 'dona', 'ta', 'marta', 'yuk', 'tashishda', 'tashish', 'jami', 'hozirgi', 'kungacha', 'soni', 'mm', 'sm', 'km', 'm', 'oshiq', 'ortiq', 'ko.p', 'kop', 'gacha', 'dan', 'yurgandan', 'song', 'so.ng', 'keyin', 'firmasi', 'mchj', 'tipidagi', 'tipli', 'turdagi', 'markali', 'kompozit', 'kompozitli', 'kompozitsion', 'yangi', 'qismida', 'qismi', 'tomonida', 'tomoni', 'vagonga', 'vagonlarga', 'vagonda', 'vagonlarda', 'vagon', 'vagonlar', 'hamda', 'shuningdek', 'yana', 'bir', 'ikki', 'uch', 'и', 'в', 'на', 'с', 'со', 'по', 'при', 'после', 'до', 'более', 'менее', 'шт', 'мм', 'см', 'км', 'м', 'года', 'г', 'вагоне', 'вагонах', 'вагона', 'вагоны', 'вагон', 'выявлено', 'выявлена', 'выявлены', 'обнаружено', 'наличие', 'составляет', 'длиной', 'глубиной', 'шириной', 'рейсе', 'грузом', 'пробега', 'от', 'из', 'за', 'к', 'о', 'об', 'не', 'был', 'была', 'были', 'имеет', 'имеется', 'также', 'этом', 'том', 'что', 'uzunligi', 'chuqurligi', 'kengligi', 'bo.yicha', 'boyicha', 'nuqson', 'nuqsonlar', 'mahsulot', 'detal', 'detallar']);
        // JS'da \w kirill harflarini qamramaydi — barcha lug'at ifodalarini kirillga moslash
        (function () { const fx = re => new RegExp(re.source.replace(/\\w/g, "[\\wа-яёўқғҳ]"), re.flags); [TR_PARTS, TR_DEF, TR_LOC, TR_ACT, TR_FIX].forEach(L => L.forEach(x => { x.re = fx(x.re); })); })();
        function trLangOf(s) { const t = String(s).replace(/[^A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/g, ''); if (!t) return 'x'; const c = (t.match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length; return c / t.length > 0.5 ? 'ru' : 'uz'; }
        function trParse(line) {
            const src = String(line).trim().replace(/\s+/g, ' ').replace(/[.;]+$/, ''), n = src.toLowerCase().replace(/[ʻʼ`’‘]/g, "'");
            const E = { src: src, lang: trLangOf(src), date: null, vags: [], qty: null, parts: [], defs: [], locs: [], acts: [], meas: null, run: null, km: null, maker: null, mod: [], used: [] };
            let m;
            if ((m = n.match(/(\d{1,2})\s*-?\s*(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sent[ay]*abr|okt[ay]*abr|noyabr|dekabr)\w*/))) { E.date = [+m[1], TR_MON_RE_UZ.findIndex(r => new RegExp('^' + r).test(m[2]))]; E.used.push(m[0]); }
            else if ((m = n.match(/«?(\d{1,2})»?\s+(январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)\w*/))) { E.date = [+m[1], TR_MON_RE_RU.findIndex(r => new RegExp('^' + r).test(m[2]))]; E.used.push(m[0]); }
            (src.match(/\b\d{5,8}\b/g) || []).forEach(x => E.vags.push(x));
            if ((m = n.match(/(\d+)\s*(dona|ta\b|шт)/))) { E.qty = +m[1]; E.used.push(m[0]); }
            if ((m = n.match(/(\d+)\s*-?\s*(marta|chi marta)\s*yuk tashish\w*|при\s*(\d+)\s*-?\s*[мо]м?\s*рейс\w*( с грузом)?/))) { E.run = +(m[1] || m[3]); E.used.push(m[0]); }
            if ((m = n.match(/(\d[\d\s]*)\s*km\s*(yurgan\w*|yo.?l bosgan\w*)?\s*(dan )?(so.?ng|keyin)?|пробег\w*\s*(\d[\d\s]*)\s*км/))) { E.km = String(m[1] || m[5]).replace(/\s/g, ''); E.used.push(m[0]); }
            E.measK = /длин|uzunlig/.test(n) ? 'len' : /глубин|chuqurlig/.test(n) ? 'dep' : /ширин|kenglig/.test(n) ? 'wid' : '';
            if ((m = n.match(/(\d+(?:[.,]\d+)?)\s*(mm|мм|sm|см)\s*(dan|дан)?\s*(oshiq|ortiq|ko.?p|katta|yuqori)|(?:более|свыше)\s*(\d+(?:[.,]\d+)?)\s*(мм|см)/))) { E.meas = ['>', m[1] || m[5], /s|с/.test(m[2] || m[6]) ? 'sm' : 'mm']; E.used.push(m[0]); }
            else if ((m = n.match(/(\d+(?:[.,]\d+)?)\s*(mm|мм|sm|см)\s*(gacha|до)?/))) { E.meas = ['=', m[1], /s|с/.test(m[2]) ? 'sm' : 'mm']; E.used.push(m[0]); }
            if ((m = src.match(/[“"«]([^”"»]+)[”"»]\s*(MCHJ|МЧЖ|ООО|OOO|AJ|АО|QK)?/i))) { E.maker = [m[1].trim(), m[2] ? m[2].toUpperCase().replace('МЧЖ', 'MCHJ').replace('OOO', 'ООО') : '']; E.used.push(m[0].toLowerCase()); }
            if ((m = n.match(/\b(m-?\d{3}[.,]\d{3}|м-?\d{3}[.,]\d{3})\b/i))) { E.mod.push(m[1].toUpperCase().replace(/^М/, 'M')); E.used.push(m[0]); }
            let rest = n;
            TR_PARTS.forEach(p => { const mm = rest.match(p.re); if (mm) { E.parts.push(p); E.used.push(mm[0]); rest = rest.replace(mm[0], ' '); } });
            TR_DEF.forEach(d => { const mm = rest.match(d.re); if (mm) { if (!E.defs.includes(d)) E.defs.push(d); E.used.push(mm[0]); rest = rest.replace(mm[0], ' '); } });
            TR_LOC.forEach(d => { const mm = rest.match(d.re); if (mm) { E.locs.push(d); E.used.push(mm[0]); rest = rest.replace(mm[0], ' '); } });
            TR_ACT.forEach(d => { const mm = rest.match(d.re); if (mm) { E.acts.push(d); E.used.push(mm[0]); rest = rest.replace(mm[0], ' '); } });
            // qamrov: tanilmagan so'zlar
            let left = n; E.used.forEach(u => { left = left.replace(u, ' '); });
            const words = left.replace(/[^a-zа-яё'ўқғҳ0-9-]+/gi, ' ').split(/\s+/).filter(w => w && !/^\d/.test(w) && w.length > 1 && !TR_STOP.has(w.replace(/'/g, '.')) && !TR_STOP.has(w.replace(/'/g, '')));
            E.unknown = words;
            return E;
        }
        function trDate(E, l) { if (!E.date || E.date[1] < 0) return ''; return l === 'ru' ? String(E.date[0]).padStart(2, '0') + ' ' + TR_MON_RU[E.date[1]] : String(E.date[0]).padStart(2, '0') + '-' + TR_MON_UZ[E.date[1]]; }
        function trMeas(E, l) { if (!E.meas) return ''; const u = l === 'ru' ? (E.meas[2] === 'sm' ? 'см' : 'мм') : E.meas[2]; const K = { len: ['длиной', 'uzunligi'], dep: ['глубиной', 'chuqurligi'], wid: ['шириной', 'kengligi'] }[E.measK]; return l === 'ru' ? (K ? ' ' + K[0] : '') + (E.meas[0] === '>' ? ' более ' : ' ') + E.meas[1] + ' ' + u : (K ? ' ' + K[1] : '') + ' ' + E.meas[1] + ' ' + u + (E.meas[0] === '>' ? ' dan ortiq' : '') + (K ? " bo'lgan" : ''); }
        function trCompose(E, l) {
            for (const f of TR_FIX) { const m = E.src.toLowerCase().replace(/[ʻʼ`’‘]/g, "'").match(f.re); if (m) return f[l](m); }
            if (E.unknown.length > 2 || (!E.parts.length && !E.defs.length && !E.acts.length)) return null;
            const part = E.parts.find(p => !p.noPart), pl = E.qty && E.qty > 1, vs = E.vags;
            const mod = E.mod.length ? ' ' + E.mod.join(', ') : '';
            if (l === 'ru') {
                const bits = [];
                const d = trDate(E, 'ru'); if (d) bits.push(d);
                if (vs.length) bits.push((E.acts.length && !E.defs.length ? 'на вагон' + (vs.length > 1 ? 'ы' : '') : 'на вагон' + (vs.length > 1 ? 'ах' : 'е')) + ' № ' + vs.join(', '));
                if (E.run) bits.push('при ' + E.run + '-м рейсе с грузом');
                if (E.km) bits.push('после пробега ' + E.km + ' км');
                let s = bits.join(' ');
                const maker = E.maker ? ' производства ' + (E.maker[1] === 'MCHJ' || E.maker[1] === 'ООО' ? 'ООО ' : E.maker[1] ? E.maker[1] + ' ' : '') + '«' + E.maker[0] + '»' : '';
                if (E.defs.length) {
                    const dd = E.defs.filter(x => !x.mod && !x.sum), md = E.defs.filter(x => x.mod), sum = E.defs.some(x => x.sum);
                    const dt = (sum && dd.length ? 'суммарная ' : '') + dd.map(x => x.ru).join(' и ');
                    const own = E.parts.filter(p => !p.noPart)[1];
                    const ptxt = part ? (pl ? part.ruGPl : part.ruG) + (own ? ' ' + own.ruG : '') + mod : '';
                    const vb = dd.length > 1 ? 'выявлены' : dd.length && dd[0].g === 'f' ? 'выявлена' : dd.length && dd[0].g === 'n' ? 'выявлено' : 'выявлен';
                    s += (s ? ' ' : '') + (dd.length ? vb + ' ' + dt + (ptxt ? ' ' + ptxt : '') : (ptxt ? ptxt.charAt(0).toUpperCase() + ptxt.slice(1) : '')) + (md.length ? ' (' + md.map(x => x.ru).join(', ') + ')' : '') + (E.qty ? ' (' + E.qty + ' шт.)' : '') + (E.locs.length ? ' ' + E.locs.map(x => x.ru).join(', ') : '') + trMeas(E, 'ru');
                } else if (E.acts.length) {
                    const a = E.acts[0];
                    s += (s ? ' ' : '') + (E.qty ? a.ru.replace(/ы$/, 'о') : a.ru) + (E.qty ? ' ' + E.qty + ' шт.' : '') + (part ? ' ' + (E.qty && E.qty > 1 ? part.ruGPl : pl ? part.ruPl : part.ru) + mod : '') + maker + (E.locs.length ? ' ' + E.locs.map(x => x.ru).join(', ') : '') + trMeas(E, 'ru');
                } else s += (s ? ' ' : '') + (part ? part.ru + mod : '') + maker + trMeas(E, 'ru');
                s = s.replace(/\s+/g, ' ').trim();
                return s.charAt(0).toUpperCase() + s.slice(1);
            } else {
                const bits = [];
                const d = trDate(E, 'uz'); if (d) bits.push(d + ' kuni');
                if (vs.length) bits.push(vs.join(' va ') + (E.acts.length && !E.defs.length ? ' raqamli vagon' + (vs.length > 1 ? 'larga' : 'ga') : ' raqamli vagon' + (vs.length > 1 ? 'larda' : 'da')));
                if (E.run) bits.push(E.run + '-marta yuk tashishda');
                if (E.km) bits.push(E.km + ' km yurgandan so\'ng');
                const maker = E.maker ? '“' + E.maker[0] + '”' + (E.maker[1] === 'ООО' || E.maker[1] === 'MCHJ' ? ' MCHJ' : E.maker[1] ? ' ' + E.maker[1] : '') + ' ishlab chiqargan ' : '';
                let s = bits.join(' ');
                const own = E.parts.filter(p => !p.noPart)[1];
                const ptxt = part ? (E.qty ? E.qty + ' dona ' : '') + maker + (own ? own.uz.replace(/ \(.*\)$/, '') + ' ' : '') + (own && !/i$/.test(part.uz.replace(/ \(.*\)$/, '')) ? part.uz.replace(/ \(.*\)$/, '') + (/[aeiou]$/.test(part.uz.replace(/ \(.*\)$/, '')) ? 'si' : 'i') : part.uz.replace(/ \(.*\)$/, '')) + mod : '';
                if (E.defs.length) {
                    const dd = E.defs.filter(x => !x.mod && !x.sum), md = E.defs.filter(x => x.mod), sum = E.defs.some(x => x.sum);
                    const loc = E.locs.length ? (ptxt ? (/i$/.test(ptxt) ? ptxt.replace(/i$/, 'ining') : ptxt + 'ning') + ' ' + E.locs.map(x => x.uzLoc).join(', ') : E.locs.map(x => x.uzLoc).join(', ')) : (ptxt ? ptxt + 'da' : '');
                    s += (s ? ' ' : '') + (md.length ? md.map(x => x.uz).join(' ') + ' ' : '') + loc + trMeas(E, 'uz') + ' ' + (sum ? 'umumiy ' : '') + dd.map(x => x.uz).join(' va ') + ' aniqlandi';
                } else if (E.acts.length) {
                    s += (s ? ' ' : '') + ptxt + ' ' + E.acts[0].uz + (E.locs.length ? ' (' + E.locs.map(x => x.uz).join(', ') + ')' : '');
                } else s += (s ? ' ' : '') + ptxt + trMeas(E, 'uz');
                s = s.replace(/\s+/g, ' ').trim();
                return s.charAt(0).toUpperCase() + s.slice(1);
            }
        }
        function trObjLocal(obj, l) {
            const E = trParse(obj); const part = E.parts.find(p => !p.noPart);
            if (!part || E.unknown.filter(w => !/firma|kompozit|композиц|tipidagi|markali/.test(w)).length > 1) return null;
            const comp = /kompozit|композиц/i.test(obj), mod = E.mod.length ? ' ' + E.mod.join(', ') : '', pl = /lar\w*\b|ы\b|и\b/i.test(obj);
            if (l === 'ru') return (comp ? (pl ? 'композиционные ' : 'композиционная ') : '') + (pl ? part.ruPl : part.ru) + mod + (E.maker ? ' производства ' + ((E.maker[1] === 'MCHJ' || E.maker[1] === 'ООО') ? 'ООО ' : E.maker[1] ? E.maker[1] + ' ' : '') + '«' + E.maker[0] + '»' : '');
            return (E.maker ? '“' + E.maker[0] + '”' + ((E.maker[1] === 'ООО' || E.maker[1] === 'MCHJ') ? ' MCHJ' : E.maker[1] ? ' ' + E.maker[1] : '') + ' firmasining ' : '') + (comp ? 'kompozitsion ' : '') + (pl ? part.uzPl : part.uz) + mod;
        }
        // Bulut AI (ulangan bo'lsa) — to'liq tarjima; aks holda mahalliy lug'at
        async function trLines(lines, obj, l) {
            const res = { lines: lines.slice(), obj: obj, warn: [], via: '' };
            const need = lines.map(x => { const g = trLangOf(x); return g !== 'x' && g !== l; }), objNeed = obj && trLangOf(obj) !== 'x' && trLangOf(obj) !== l;
            if (!need.some(Boolean) && !objNeed) return res;
            if (typeof aiCloudReady === 'function' && aiCloudReady()) {
                try {
                    const src = lines.map(x => aiMask(x)).concat([aiMask(obj || '')]);
                    const sys = "Sen temir yo'l harakat tarkibi bo'yicha rasmiy hujjatlar tarjimonisan. Senga JSON massivdagi qatorlar beriladi. Har bir qatorni " + (l === 'ru' ? "rus tiliga (rasmiy-idoraviy uslub, texnik atamalar GOST bo'yicha)" : "o'zbek tiliga (lotin yozuvi, rasmiy-idoraviy uslub)") + " tarjima qil. Qator allaqachon shu tilda bo'lsa — faqat uslubini tuzat. QAT'IY: raqamlar, sanalar, o'lchamlar, vagon raqamlari, tamg'a/model (M659.000), firma nomlari (qo'shtirnoq ichida) va [P1] kabi belgilarni o'zgartirma, yangi fakt qo'shma, qatorlar soni va tartibini saqla. Faqat JSON massiv qaytar.";
                    const ans = await aiCloudCall(sys, [{ role: 'user', text: JSON.stringify(src) }], { temp: 0.1, max: 3000, timeout: 45000 });
                    const mm = ans.match(/\[[\s\S]*\]/); const arr = JSON.parse(mm ? mm[0] : ans);
                    if (Array.isArray(arr) && arr.length === src.length && arr.every(x => typeof x === 'string')) {
                        res.lines = arr.slice(0, lines.length).map((x, i) => x.trim() ? aiUnmask(x.trim()) : lines[i]); if (obj) res.obj = aiUnmask(arr[lines.length].trim()) || obj; res.via = 'cloud'; return res;
                    }
                } catch (e) { res.warn.push("AI tarjima qilmadi (" + agmkErrUz(e) + ") — mahalliy lug'at ishlatildi"); }
            }
            res.via = 'local';
            res.lines = lines.map((x, i) => { if (!need[i]) return x; const t = trCompose(trParse(x), l); if (t) return t; res.warn.push('«' + x + '»'); return x; });
            if (objNeed) { const t = trObjLocal(obj, l); if (t) res.obj = t; else res.warn.push('«' + obj + '» (mavzu)'); }
            return res;
        }
        // ---------- Imzo chekuvchilar: tilga moslash ----------
        var TR_ROLE = [[/^ICHTB boshlig.?i$/i, 'Начальник ПТО'], [/^ICHTB vagonlar bo.?yicha muhandisi$/i, 'Инженер по вагонам ПТО'], [/^STTB bosh muhandisi v\.?b\.?$/i, 'И.о. главного инженера СТТБ'], [/^STTB bosh muhandisi$/i, 'Главный инженер СТТБ'], [/^STTB boshlig.?i$/i, 'Начальник СТТБ']];
        var TR_ROLE_R = [[/^Начальник ПТО$/i, "ICHTB boshlig'i"], [/^Инженер по вагонам ПТО$/i, "ICHTB vagonlar bo'yicha muhandisi"], [/^Начальник УПЖТ$/i, "UPJT boshlig'i"], [/^Главный инженер УПЖТ$/i, 'UPJT bosh muhandisi'], [/^И\.о\. главного механика УПЖТ$/i, 'UPJT bosh mexanigi v.b.'], [/^Главный энергетик УПЖТ$/i, 'UPJT bosh energetigi']];
        function trRole(r, l) {
            const T = l === 'ru' ? TR_ROLE : TR_ROLE_R; for (const [re, t] of T) if (re.test(String(r).trim())) return t;
            let s = String(r);
            if (l === 'ru') {
                let m;
                if ((m = s.match(/^(.+?) boshlig.?i( v\.?b\.?)?$/i))) return (m[2] ? 'И.о. начальника ' : 'Начальник ') + m[1];
                if ((m = s.match(/^(.+?) bosh muhandisi( v\.?b\.?)?$/i))) return (m[2] ? 'И.о. главного инженера ' : 'Главный инженер ') + m[1];
                if ((m = s.match(/^(.+?) uchastka ustasi( v\.?b\.?)?$/i))) return (m[2] ? 'И.о. мастера участка ' : 'Мастер участка ') + m[1];
                if ((m = s.match(/^(.+?) vagonlarni ko.?rikdan o.?tkazuvchi chilangar$/i))) return 'Слесарь-осмотрщик вагонов ' + m[1];
                if ((m = s.match(/^(.+?) muhandisi$/i))) return 'Инженер ' + m[1];
                return s;
            }
            let m;
            if ((m = s.match(/^И\.о\. начальника (.+)$/i))) return m[1] + " boshlig'i v.b.";
            if ((m = s.match(/^Начальник (.+)$/i))) return m[1].replace(/отдела железнодорожного транспорта и логистики/i, "temir yo'l transporti va logistika bo'limi").replace(/АО "?Алмалыкский ГМК"?/i, '"Olmaliq KMK" AJ') + " boshlig'i";
            if ((m = s.match(/^Главный инженер (.+)$/i))) return m[1] + ' bosh muhandisi';
            if ((m = s.match(/^Мастер( участка)? (.+)$/i))) return m[2] + ' uchastka ustasi';
            return s;
        }
        var TR_L2C = [['shch', 'щ'], ['yo', 'ё'], ['yu', 'ю'], ['ya', 'я'], ['ye', 'е'], ['sh', 'ш'], ['ch', 'ч'], ["o'", 'ў'], ["g'", 'ғ'], ['ts', 'ц'], ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'х'], ['i', 'и'], ['j', 'ж'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['q', 'к'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з']];
        function trL2C(w) { let s = String(w).toLowerCase().replace(/[ʻʼ`’‘]/g, "'"), o = ''; s = s.replace(/ayev$/, 'аев').replace(/iyev$/, 'иев').replace(/yev$/, 'ев'); for (let i = 0; i < s.length;) { if (/[а-яё]/.test(s[i])) { o += s[i]; i++; continue; } const p = TR_L2C.find(([a]) => s.startsWith(a, i)); if (p) { o += p[1]; i += p[0].length; } else { o += s[i]; i++; } } o = o.replace(/ў/g, 'у').replace(/ғ/g, 'г'); return o.charAt(0).toUpperCase() + o.slice(1); }
        function trC2L(w) { return dbN(w).replace(/ev$/, 'yev').replace(/^./, c => c.toUpperCase()); }
        function trName(nm, l) {
            const s = String(nm).trim();
            if (l === 'ru') { if (/[а-яё]/i.test(s)) return s; const m = s.match(/^([A-Z][a-z]?)\.\s*(?:([A-Z][a-z]?)\.)?\s*([A-Za-z'ʻ’-]{2,})$/); if (m) return trL2C(m[3]) + ' ' + trL2C(m[1]) + '.' + (m[2] ? trL2C(m[2]) + '.' : ''); const p = s.split(/\s+/); return trL2C(p[0]) + (p[1] ? ' ' + trL2C(p[1]).charAt(0) + '.' : '') + (p[2] ? trL2C(p[2]).charAt(0) + '.' : ''); }
            if (!/[а-яё]/i.test(s)) return s; const m = s.match(/^([А-ЯЁа-яё-]+)\s+([А-ЯЁ])\.\s*([А-ЯЁ])?\.?$/); if (m) return trC2L(m[2]).charAt(0) + '.' + trC2L(m[1]); return trC2L(s);
        }
        function trSurKey(nm) { const s = String(nm).replace(/^[A-ZА-ЯЁ][a-zа-яё]?\.\s*([A-ZА-ЯЁ][a-zа-яё]?\.)?\s*/, '').split(/\s+/)[0]; return dbN(s).replace(/yev$/, 'ev').replace(/y/g, 'i').replace(/[^a-z]/g, '').slice(0, 6); }
        function trSigner(c, l) {
            if (!c) return c;
            const same = ndSigners().filter(x => x.l === l && trSurKey(x.n) === trSurKey(c.n));
            if (same.length) return { r: same[0].r, n: same[0].n };
            const r = trRole(c.r, l); return { r: r.charAt(0).toUpperCase() + r.slice(1), n: trName(c.n, l) };
        }
        // ---------- Ehtiyot qismlar va normativ manbalar ----------
        function ndSpSources(text) {
            const out = [], seen = new Set();
            TR_PARTS.forEach(p => {
                if (!p.sp || !p.re.test(text) || seen.has(p.id)) return; seen.add(p.id);
                const it = (SP_DATA.y2027 || []).find(x => p.sp.test(x.n)); if (!it) return;
                const set = SP_SETS.find(s => s.id === 'y2027');
                out.push({ title: '«' + it.n + '» — ' + it.q + ' ' + (it.u || '') + " (1 ta vagon KR uchun me'yor)", src: "Ehtiyot qismlar bo'limi · 2ВС-105 KR, " + (set ? set.title : '2027') });
            });
            return out;
        }
        // ---------- Tilga qarab akt quruvchi (rus: o'rnatish/holat; o'zbek: defekt) ----------
        function ndBuildExtra(f, l, lines) {
            const E = escapeHtml, used = [], useRef = r => { if (!used.includes(r)) used.push(r); return r; };
            const refTxt = (line, st) => { const rs = ndRefFor(line).filter(r => { const k = (r.ru.match(/\d{4,}-\d{4}/) || [])[0]; return !(k && line.includes(k) && !/табл|jadval/i.test(r.ru + r.uz) ); }); if (!rs.length) return ''; rs.forEach(useRef); return st === 'ru' ? ' [' + rs.map(r => r.ru).join('; ') + ']' : ' (' + rs.map(r => r.uz).join('; ') + ')'; };
            const ap = f.apObj && f.apObj.n ? f.apObj : null;
            const d = new Date((f.sana || todayISO()) + 'T00:00:00'), dnum = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
            const joy = f.joy.trim(), hs = (f.hsSame !== false || !f.hs) ? f.sana : f.hs, hsDiff = hs !== f.sana, com = f.com, comTxt = com.map(c => c.r + ' ' + c.n).join(', '), tail = f.vag.trim();
            const trJoy = j => l === 'ru' ? (j && !/[а-яё]/i.test(j) ? trL2C(j) : j) : (j && /[а-яё]/i.test(j) ? trC2L(j) : j);
            let h = '';
            if (ap) h += l === 'ru' ? `<div class="a-approve">«Утверждаю»<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()} г.</div>` : `<div class="a-approve">“TASDIQLAYMAN”<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()}-y.</div>`;
            h += l === 'ru' ? `<div class="a-head"><span>г. Алмалык</span><span>от ${ndDateWords(f.sana, 'ru')}</span></div>` : `<div class="a-head"><span>Olmaliq sh.</span><span>${dnum}-y.</span></div>`;
            const obj = f.obj.trim(), J = trJoy(joy);
            if (l === 'ru' && (f.tur === 'ornatish' || f.tur === 'holat')) {
                if (f.tur === 'ornatish') {
                    h += `<div class="a-title">АКТ<br>об установке изделий для проведения испытаний${obj ? '<br>(' + E(obj) + ')' : ''}</div>`;
                    h += `<p>Мы, нижеподписавшиеся: ${E(comTxt)}, составили настоящий акт о том, что ${ndDateWords(hs, 'ru')}${J ? ' на ст. ' + E(J) : ''} ${E(ndFmtLine(lines[0], 'ru').charAt(0).toLowerCase() + ndFmtLine(lines[0], 'ru').slice(1))}${tail && !lines[0].includes(tail.split(/[, ]+/)[0]) ? ' (вагоны № ' + E(tail) + ')' : ''}.</p>`;
                    if (lines.length > 1) { h += `<p>При установке обращено внимание на следующее:</p>`; lines.slice(1).forEach((x, i) => { h += `<p>${i + 1}. ${E(ndFmtLine(x, 'ru'))}${E(refTxt(x, 'ru'))}.</p>`; }); }
                } else {
                    h += `<div class="a-title">АКТ<br>о техническом состоянии изделий в ходе испытаний${obj ? '<br>(' + E(obj) + ')' : ''}</div>`;
                    h += `<p>Мы, нижеподписавшиеся: ${E(comTxt)}, составили настоящий акт о том, что ${E(ndFmtLine(lines[0], 'ru').charAt(0).toLowerCase() + ndFmtLine(lines[0], 'ru').slice(1))}${tail && !lines[0].includes(tail.split(/[, ]+/)[0]) ? ' (вагоны № ' + E(tail) + ')' : ''}.</p>`;
                    if (f.orn) h += `<p>Изделия${obj ? ' (' + E(obj) + ')' : ''} установлены для проведения испытаний ${ndDateWords(f.orn, 'ru')}.</p>`;
                    h += `<p>${ndDateWords(hs, 'ru')} при проверке технического состояния${obj ? ' изделий' : ''} выявлено следующее:</p>`;
                    let tot = 0;
                    lines.slice(1).forEach(x => { const m = x.match(/(\d+)\s*(шт|dona)/); if (m) tot += +m[1]; h += `<p>- ${E(ndFmtLine(x, 'ru'))}${E(refTxt(x, 'ru'))}.</p>`; });
                    if (tot) h += `<p>На сегодняшний день всего <b>${tot} шт.</b> ${/колод|kolod/i.test(f.text + obj) ? 'колодок' : 'изделий'} пришли в негодность и сняты с вагонов.</p>`;
                }
            } else if (l === 'uz' && f.tur === 'defekt') {
                const v = onlyVagons().find(x => vagonNo(x) === tail || String(x.inv) === tail);
                let name = obj || (v ? (v.naim || 'Vagon') : 'Vagon');
                if (/[а-яё]/i.test(name)) name = name.replace(/Вагон-самосвал\s*/i, "Dumpkar (o'zi ag'daradigan vagon) ").replace(/Вагон/i, 'Vagon').replace(/Цистерна/i, 'Sisterna').replace(/Платформа/i, 'Platforma').trim();
                const age = v ? unitAge(v) : null, no = v ? vagonNo(v) : tail;
                h += `<div class="a-title">${E(name)} №${E(no)}<br>DEFEKT DALOLATNOMASI</div>`;
                h += `<p>Biz quyida imzo chekuvchilar: ${E(comTxt)} tarkibidagi komissiya ${E(name)} (zavod № ${E(no)}${v && v.inv ? ', inventar № ' + E(v.inv) : ''}${v && v.yil ? ', ' + E(v.yil) + '-yilda ishlab chiqarilgan' : ''})${J ? ' “' + E(J) + '” stansiyasida' : ''}${hsDiff ? ' ' + ndDateWords(hs, 'uz') + ' kuni' : ''} ko'rikdan o'tkazilganda quyidagilar aniqlanganligi to'g'risida ushbu dalolatnomani tuzdik:</p>`;
                if (age !== null && age >= 30 && !lines.some(x => /xizmat muddati|срок служб/i.test(x) && !/aravach|telejk|тележ/i.test(x))) { const r = ND_REFS.find(x => x.id === 'r310'); useRef(r); h += `<p class="ni"><b>${E(name)}ning xizmat muddati o'tgan</b> — <b>${age} yildan ortiq</b> (${E(r.uz)});</p>`; }
                const G = [["Yurish qismi:", /aravach|telejk|buks|o.?q\b|g.?ildirak|obod|gardish|nadressor|bokovin|prujin|рессор|тележ|букс|колес|обод|надрессор|боковин|пружин/i], ["Pastki rama va kuzov:", /rama|kuzov|xrebtov|asosiy balka|shkvorn|pyatnik|parchin|zaklep|balka|devor|bort|рам|кузов|хребтов|шкворн|пятник|заклеп|балк|стенк/i], ["Tormoz, pnevmatik jihozlar va zarb-tortish qurilmalari:", /tormoz|avtos|upor|yutuvchi|pnevm|kolod|havo|silindr|rukav|kran|тормоз|автосцеп|упор|поглощ|пневм|колод|сцеп/i]];
                const done = new Set();
                G.forEach(([t, re]) => { const ls = lines.filter(x => !done.has(x) && re.test(x)); if (!ls.length) return; h += `<p class="a-sec">${t}</p>`; ls.forEach(x => { done.add(x); h += `<p class="ni">- ${E(ndFmtLine(x, 'uz'))}${E(refTxt(x, 'uz'))};</p>`; }); });
                const rest = lines.filter(x => !done.has(x)); if (rest.length) { h += `<p class="a-sec">Boshqalar:</p>`; rest.forEach(x => { h += `<p class="ni">- ${E(ndFmtLine(x, 'uz'))}${E(refTxt(x, 'uz'))};</p>`; }); }
            } else return null;
            h += `<table class="a-sign">${com.map(c => `<tr><td class="l">${E(c.r)}</td><td class="m"></td><td class="r">${E(c.n)}</td></tr>`).join('')}</table>`;
            return { html: h, used: used };
        }
        // ---------- Formaga ulash ----------
        ndLang = function () { const f = ND.form; if (!f) return 'uz'; if (f.tur === 'umumiy_ru') { f.tur = 'umumiy'; f.lang = 'ru'; f.langSet = true; } return f.lang || ND_TYPES[f.tur].l; };
        ndDefAp = function () { const l = ndLang(); return ndSigners().findIndex(x => x.l === l && x.ap); };
        var ND_MIC_LANG = (function () { try { return localStorage.getItem('agmk_nd_mic') || 'uz'; } catch (e) { return 'uz'; } })();
        function ndSetLang(l) {
            ndFormSync(); const f = ND.form; if (ndLang() === l) return;
            f.lang = l; f.langSet = true;
            f.com = f.com.map(c => trSigner(c, l));
            const oldDef = ndSigners().find(x => x.l !== l && x.ap);
            if (!f.apObj || (oldDef && f.apObj.n === oldDef.n)) f.apObj = ndDefApObj(); else f.apObj = trSigner(f.apObj, l);
            if (ND.html) { ND.html = ''; }
            ndRender(); showToast(l === 'ru' ? '🇷🇺 Akt tili: rus' : "🇺🇿 Akt tili: o'zbek");
        }
        function ndMic(id, btn) {
            const inp = $id(id); if (!inp) return;
            if (typeof micBlocked !== 'undefined' && micBlocked && typeof micFallback === 'function') { micFallback(id); return; }
            if (typeof micPrime === 'function' && typeof micPrimed !== 'undefined' && !micPrimed) { micPrime().then(() => ndMic(id, btn)); return; }
            const SRc = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SRc) { if (typeof voiceErrorHelp === 'function') voiceErrorHelp('unsupported', id); return; }
            const r = new SRc(); r.lang = ND_MIC_LANG === 'ru' ? 'ru-RU' : 'uz-UZ'; r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
            r._ndLang = r.lang;
            const multi = inp.tagName === 'TEXTAREA', base = inp.value;
            let got = '';
            btn && btn.classList.add('listening');
            r.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; got = t.trim(); if (multi) inp.value = (base.trim() ? base.replace(/\s+$/, '') + '\n' : '') + got; else inp.value = id === 'ndVag' ? got.replace(/(\d)\s+(?=\d)/g, '$1') : got; };
            r.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted' && typeof voiceErrorHelp === 'function') voiceErrorHelp(e.error, id); };
            r.onend = () => { btn && btn.classList.remove('listening'); if (got) { ndFormSync(); showToast('🎤 Yozildi'); } };
            try { r.start(); } catch (e) { btn && btn.classList.remove('listening'); }
        }
        // Ovozli kiritishda tanlangan til interfeys tilidan ustun (faqat akt maydonlari uchun)
        (function () {
            const SRc = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SRc || !SRc.prototype) return;
            const os = SRc.prototype.start;
            SRc.prototype.start = function () { if (this._ndLang) this.lang = this._ndLang; return os.apply(this, arguments); };
        })();
        (function () {
            ndRenderAkt = agmkExtend('ndRenderAkt', '29-bosqich (1,3): Akt — ovozli kiritish, akt tili (oʼzbek / rus), manbalar', ndRenderAkt, o => function () {
                ndLang();
                const r = o.apply(this, arguments);
                try {
                    const f = ND.form, l = ndLang(), tur = $id('ndTur');
                    if (tur) {
                        [...tur.options].forEach(op => { if (op.value === 'umumiy_ru') op.remove(); else op.textContent = op.textContent.replace(/^\S+\s/, ''); });
                        const T = { ornatish: ["Sinovdan o'tkazish uchun o'rnatilganligi to'g'risida", 'Об установке для проведения испытаний'], holat: ["Sinovdagi holati to'g'risida", 'О состоянии в ходе испытаний'], defekt: ['Defekt dalolatnomasi', 'Дефектный акт'], umumiy: ['Dalolatnoma (umumiy)', 'Акт (общий)'] };
                        [...tur.options].forEach(op => { if (T[op.value]) op.textContent = T[op.value][l === 'ru' ? 1 : 0]; });
                        const wrap = document.createElement('div'); wrap.className = 'nd-f';
                        wrap.innerHTML = `<label>🌐 AKT TILI</label><div class="nd-seg"><button type="button" class="${l === 'uz' ? 'on' : ''}" onclick="ndSetLang('uz')">🇺🇿 O'zbekcha</button><button type="button" class="${l === 'ru' ? 'on' : ''}" onclick="ndSetLang('ru')">🇷🇺 Русский</button></div><div class="nd-tip">Hujjat to'liq shu tilda rasmiy shaklda tuziladi. Boshqa tilda yozilgan (aytilgan) mazmun avtomatik tarjima qilinadi, lavozim va ismlar ham shu tilga moslanadi.</div>`;
                        tur.closest('.nd-f').after(wrap);
                    }
                    if (ND.html && ND.trInfo) {
                        const refs = document.querySelector('#ndBody .nd-refs');
                        if (refs) { const d = document.createElement('div'); d.className = 'nd-trinfo' + (ND.trInfo.warn.length ? ' warn' : ''); d.innerHTML = ND.trInfo.html; refs.parentElement.appendChild(d); }
                    }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        (function () {
            ndGenerate = agmkExtend('ndGenerate', '29-bosqich (1,3): Akt — ovozli kiritish, akt tili (oʼzbek / rus), manbalar', ndGenerate, o => async function (keepSugg) {
                ndFormSync(); const f = ND.form, l = ndLang();
                const lines = f.text.split('\n').map(x => x.trim()).filter(Boolean);
                if (!lines.length || !f.com.length) return o.apply(this, arguments);
                const srcText = f.text, srcObj = f.obj;
                const wrong = c => c && (l === 'ru' ? !/[а-яё]/i.test(c.n) : /[а-яё]/i.test(c.n));
                if (f.com.some(wrong) || wrong(f.apObj)) { f.com = f.com.map(c => wrong(c) ? trSigner(c, l) : c); if (wrong(f.apObj)) { const od = ndSigners().find(x => x.l !== l && x.ap); f.apObj = od && f.apObj.n === od.n ? ndDefApObj() : trSigner(f.apObj, l); } }
                let tr = { lines: lines, obj: f.obj, warn: [], via: '' };
                const needTr = lines.some(x => { const g = trLangOf(x); return g !== 'x' && g !== l; }) || (f.obj && trLangOf(f.obj) !== 'x' && trLangOf(f.obj) !== l);
                if (needTr) { showToast(l === 'ru' ? '🌐 Rus tiliga o\'girilmoqda...' : "🌐 O'zbek tiliga o'girilmoqda..."); tr = await trLines(lines, f.obj, l); }
                const tLines = tr.lines;
                const special = (l === 'ru' && (f.tur === 'ornatish' || f.tur === 'holat')) || (l === 'uz' && f.tur === 'defekt');
                if (special) {
                    if (!keepSugg) ND.sugg = ndPunktMatches(tLines.join('\n') + '\n' + srcText, 4).map(x => Object.assign(x, { on: false }));
                    const extra = (ND.sugg || []).filter(s => s.on);
                    const tmp = Object.assign({}, f, { text: tLines.join('\n'), obj: tr.obj || '' });
                    const b = ndBuildExtra(tmp, l, tLines);
                    let h = b.html;
                    if (extra.length) h = h.replace('<table class="a-sign">', `<p class="a-sec">${l === 'ru' ? 'Нормативное основание:' : 'Normativ asos:'}</p>` + extra.map(s => `<p class="ni">- ${escapeHtml(s.d.title)}, ${escapeHtml(s.p.n)}: ${escapeHtml(s.p.t.slice(0, 300))}</p>`).join('') + '<table class="a-sign">');
                    ND.html = h; ND.used = b.used.concat(extra.map(s => ({ title: s.d.title + ', ' + s.p.n, src: 'Kiritilgan hujjat' })));
                } else {
                    // asl quruvchi — tarjima qilingan matn bilan
                    const ta = $id('ndText'), ob = $id('ndObj');
                    if (ta) ta.value = tLines.join('\n'); if (ob && tr.obj !== undefined) ob.value = tr.obj || '';
                    o.call(this, keepSugg);
                }
                // manbalar: ehtiyot qismlar
                const sp = ndSpSources(srcText + '\n' + tLines.join('\n') + '\n' + srcObj);
                ND.used = (ND.used || []).concat(sp);
                f.text = srcText; f.obj = srcObj;
                const n = lines.length, bad = tr.warn;
                ND.trInfo = needTr ? { warn: bad, html: (tr.via === 'cloud' ? "🌐 Mazmun AI yordamida " + (l === 'ru' ? 'rus' : "o'zbek") + " tiliga tarjima qilindi — tekshirib chiqing." : "🌐 Mazmun ichki lug'at asosida " + (l === 'ru' ? 'rus' : "o'zbek") + " tiliga o'girildi (" + (n - bad.filter(x => !/mavzu/.test(x)).length) + '/' + n + ' qator).') + (bad.length ? "<br>⚠️ Lug'atda yo'q so'zlar sababli asl holida qoldi: " + escapeHtml(bad.join(', ')) + ". Hujjat ustiga bosib o'zingiz tahrirlang yoki AI ulansa «AI bilan matnni mukammallashtirish» tugmasini bosing." : '') } : null;
                ndRender();
                setTimeout(() => { const p = $id('ndPage'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
            });
        })();
        // AI mukammallashtirish — tanlangan akt tilida
        (function () {
            aiPolishAkt = agmkExtend('aiPolishAkt', '29-bosqich (1,3): Akt — ovozli kiritish, akt tili (oʼzbek / rus), manbalar · AI mukammallashtirish — tanlangan akt tilida', aiPolishAkt, o => async function () { const t = ND.form && ND.form.tur, keep = ND_TYPES[t] && ND_TYPES[t].l; if (ND_TYPES[t]) ND_TYPES[t].l = ndLang(); try { return await o.apply(this, arguments); } finally { if (ND_TYPES[t]) ND_TYPES[t].l = keep; } });
        })();

