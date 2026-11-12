        // =====================================================================
        // 4.9 b112 — AI / qoʻlda tuziladigan aktlar: yakuniy tekshiruv (muallif: «xatoga umuman yoʻl qoʻyilmasin», 24.10.2026)
        //  Kolodka qabul dalolatnomasi namunasi (TOP PROJECT, 2035 dona) — andoza. Har bir akt koʻrsatilishidan oldin:
        //   1) Ism — «Familiya I.O.» (imzo qatori, «Tasdiqlayman» va imzo chekuvchilar roʻyxati): «S.Tuldibayev» → «Tuldibayev S.»
        //   2) Standart — «GOST 33421-2015» («33421-2015-sonli» emas); bir gapda ikki marta yozilmaydi
        //   3) Foydalanuvchi yozmagan xulosa (daʼvo / reklamatsiya) qoʻshilmaydi
        //   4) Hujjatda «(yilini aniqlang)», «(уточнить …)» kabi ichki eslatmalar qolmaydi
        //   5) Ruscha roʻyxatda lavozim kichik harf bilan: «в составе: начальник УПЖТ …»
        //   6) Sarlavha bosh harf bilan; «…oʻrnatildi haqida» → «…oʻrnatilganligi haqida»; «imzo chekuvchilar:» (roʻyxat oldidan)
        //  Faqat matn shakli tuzatiladi — faktlar, raqamlar, sanalar oʻzgarmaydi. Qayta qoʻllansa natija oʻzgarmaydi.
        // =====================================================================
        const AK9: any = window as any;
        var AKF_UP = 'A-ZА-ЯЁЎҚҒҲ', AKF_LO = "a-zа-яёўқғҳʻʼ'‘’";
        function akfName(s: string): string { // «S.Tuldibayev», «A.A.Abdirashidov», «A. Boltaev» → «Familiya I.O.»
            const re = new RegExp(`(^|[\\s,:;(«“"])([${AKF_UP}]\\.)\\s?(?:([${AKF_UP}]\\.)\\s?)?([${AKF_UP}][${AKF_LO}]{2,}(?:-[${AKF_UP}][${AKF_LO}]+)?)(?=$|[\\s,.;:)»”"])`, 'g');
            return s.replace(re, (m, pre, i1, i2, sur) => pre + sur + ' ' + i1 + (i2 || ''));
        }
        function akfLowRole(s: string): string { return s.length > 1 && /[a-zа-яё.]/.test(s.charAt(1)) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
        function akfText(el: Element, fn: (t: string) => string): void {
            const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const L: Text[] = []; let n: any; while ((n = w.nextNode())) L.push(n);
            L.forEach(t => { const v = fn(t.nodeValue || ''); if (v !== t.nodeValue) t.nodeValue = v; });
        }
        function aktFix(html: string, src: string): string {
            if (!html || typeof html !== 'string') return html;
            const box = document.createElement('div'); box.innerHTML = html;
            const own = /reklamats|da.vo|претенз|рекламац/i.test(String(src || ''));
            // 3) qoʻshib yozilgan xulosa
            if (!own) box.querySelectorAll('p').forEach(p => { if (/reklamatsiya\) bildirishni lozim deb topdi|претензию \(рекламацию\)/.test(p.textContent || '')) p.remove(); });
            // 4) ichki eslatmalar
            akfText(box, t => t.replace(/\s*\((?:yilini aniqlang|hujjat nomini aniqlang|год уточнить|уточнить наименование документа|уточнить[^()]{0,40}|[^()]{0,30}aniqlang)\)/g, ''));
            // 2) standart
            akfText(box, t => t.replace(/(^|[\s(«])(\d{4,5}-\d{4})-sonli\b/g, '$1GOST $2'));
            box.querySelectorAll('p, li, td').forEach(p => {
                if (p.children.length) return; let s = p.textContent || '';
                const out = s.replace(/\s*\(([^()]*?(\d{4,5}-\d{4})[^()]*)\)/g, (m: string, _in: string, num: string, at: number) => s.slice(0, at).includes(num) ? '' : m);
                if (out !== s) p.textContent = out;
            });
            // 1) ismlar — «Tasdiqlayman», imzo qatori, imzo chekuvchilar roʻyxati
            box.querySelectorAll('.a-approve, .a-sign td.r, .a-sign td:last-child').forEach(e => akfText(e, akfName));
            box.querySelectorAll('p').forEach(p => {
                const t = p.textContent || '';
                if (/imzo chekuvchilar/i.test(t)) {
                    akfText(p, s => akfName(s).replace(/(imzo chekuvchilar),\s+(?=[^\d\s])/i, '$1: '));
                }
                if (/нижеподписавш|в составе:/i.test(t) && !p.children.length) {
                    p.textContent = t.replace(/((?:в составе|нижеподписавшиеся):\s*)([^]*?)(,?\s+составили)/i, (m, a, list, b) => a + list.split(/,\s+/).map(akfLowRole).join(', ') + b);
                }
                // 6) «…oʻrnatildi haqida ushbu dalolatnomani tuzdik»
                if (/haqida ushbu dalolatnomani tuzdik/.test(t)) akfText(p, s => s.replace(/(\S+?)(i?l|i?n)di((?: \(vagonlar: [^)]*\))?) haqida ushbu dalolatnomani tuzdik/, '$1$2ganligi$3 haqida ushbu dalolatnomani tuzdik'));
            });
            // 7) boʻsh raqam — chiziq bilan («Вагон №» → «Вагон № ______»); «осмотра вагон» → «осмотра вагона»
            box.querySelectorAll('.a-title').forEach(e => akfText(e, t => t.replace(/№\s*$/, '№ ______')));
            box.querySelectorAll('p').forEach(p => akfText(p, t => t.replace(/№\s+(?=было|инв\.|постройки|на ст\.)/g, '№ ______ ').replace(/(в результате осмотра) вагон(?= зав\.)/, '$1 вагона')));
            // 6) sarlavha bosh harf bilan
            box.querySelectorAll('.a-ctr, .a-title').forEach(e => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const n = w.nextNode() as Text; if (n && n.nodeValue) { const i = n.nodeValue.search(/\S/); if (i >= 0) n.nodeValue = n.nodeValue.slice(0, i) + n.nodeValue.charAt(i).toLocaleUpperCase() + n.nodeValue.slice(i + 1); } });
            return box.innerHTML;
        }
        AK9.aktFix = aktFix;
        if (typeof AK9.ndRender === 'function') AK9.ndRender = AK9.agmkExtend('ndRender', '4.9 b112: akt — yakuniy tekshiruv (namunaga moslik)', AK9.ndRender, (o: Function) => function (this: unknown) {
            try { const N = typeof ND !== 'undefined' ? ND : null; if (N && N.html && N.form) { const f = aktFix(N.html, N.form.text || ''); if (f !== N.html) N.html = f; } } catch (e) { console.error(e); }
            return o.apply(this, arguments);
        });
