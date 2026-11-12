        // =====================================================================
        // 5.6 — Hisobot (achot) tekshiruvi: aniqlik (muallif, 30.10.2026 — taqdimot oldidan)
        // Oktabr 2026 dagi 4 ta haqiqiy usta paketida qoʻlda tekshiruv bilan solishtirib topilgan kamchiliklar:
        //  1) Yashirin VARAQLAR (eski 2022 spravkalar, narxli nusxalar) tekshiruvga kirmaydi — faqat roʻyxatda koʻrsatiladi.
        //  2) Metallolom aktidagi yashirin QATORLAR (shablon qoldiqlari) ИТОГО ga va solishtirishga kirmaydi;
        //     ularda son yozilgan boʻlsa — alohida 🔷.
        //  3) Eskirish ustuni ulush bilan yozilgan boʻlsa (0,15 = 15%) — toʻgʻri tushuniladi (soxta «vazn notoʻgʻri» yoʻq).
        //  4) «Кол-во на 236 шт.», «на 183 ед» (keyingi qatorda), sarlavhadagi «22 ед.», «_232_ед.» — birliklar soni toʻgʻri olinadi;
        //     «31 ед.» vagon raqami deb olinmaydi; ustun sarlavhasi bilan blok sarlavhasi farq qilsa — 🔷.
        //  5) «СПРАВКА - РАСЧЕТ» (tire atrofida boʻshliq) ham spravka deb taniladi.
        //  6) Nomlar: Ø3 ≠ Ø4 (oʻlcham farq qilsa — boshqa material); «Потрубка/Патрубок», «Разетка/Розетка»,
        //     «шайбы/шайба» kabi yozuvlar bir xil; «Воздухозамедлитель» ≠ «Воздухораспределитель».
        //  7) Yangi tekshiruvlar: boʻsh lom akti (matnda kg bor, jadval boʻsh); lom xulosasidagi kg (kirill harfli matn);
        //     takroriy spravka raqami; fakt = norma (koʻchirilganga oʻxshash); talabnoma raqamlaridagi boʻshliq va takror;
        //     uchastka defektovkasi (vagon raqamisiz, «Наименование работ | Материалы») ↔ spravka; hujjat egasi (imzodan).
        // Hammasi telefon/kompyuterning oʻzida, formula bilan. AI yoʻq, tashqariga hech narsa yuborilmaydi.
        // =====================================================================
        (function (): void {
            const C: any = window as any;
            if (typeof C.hpCheck !== 'function' || typeof C.hpParseSheet !== 'function') return;
            const X56: any = C.X56 = C.X56 || { hidSheets: [] };
            const low = (s: any): string => C.hpLow(s);
            const txt = (r: any): string => C.hpRowTxt(r);
            const num = (v: any): any => C.hpN(v);

            // ---------- 6) nomlar ----------
            if (typeof C.hpLow === 'function') C.hpLow = C.agmkExtend('hpLow', '5.6: nom yozuvlari', C.hpLow, (o: Function) => function (this: unknown, s: any) {
                const r: string = o.call(this, s);
                if (!r) return r;
                return r.replace(/потруб/g, 'патруб').replace(/р[еа]зетк/g, 'розетк').replace(/пуржин/g, 'пружин').replace(/запосн/g, 'запасн')
                    .replace(/(шайб|гайк|втулк|колодк|пружин|бирк)[иы](?![а-яё])/g, '$1а').replace(/(шплинт|болт|валик)ы(?![а-яё])/g, '$1').replace(/(шплинт|болт|валик)и(?![а-яё])/g, '$1');
            });
            const stem = (w: string): string => w.length > 8 ? w.slice(0, 8) : w.slice(0, 4);
            if (typeof C.hpKey === 'function') C.hpKey = C.agmkExtend('hpKey', '5.6: uzun soʻzlar farqi (воздухозамедлитель ≠ воздухораспределитель)', C.hpKey, () => function (s: any) {
                const T = C.hpToks(s); return T.w.map(stem).sort().join(' ') + '|' + [...T.n].sort().join(' ');
            });
            const numSet = (s: any): string => [...C.hpToks(s).n].sort().join(',');
            if (typeof C.hpScore === 'function') C.hpScore = C.agmkExtend('hpScore', '5.6: «Борт» ↔ «Продольный борт»; uzun soʻzlar farqi', C.hpScore, (o: Function) => function (this: unknown, a: any, b: any, ign: any) {
                let r = o.call(this, a, b, ign);
                if (!r) { const r2 = o.call(this, b, a, ign); const na = numSet(a), nb = numSet(b); if (r2 && (na === nb || ign)) r = r2; }
                if (r) { // uzun soʻz: dastlabki 8 harf farq qilsa — boshqa material (воздухозамедлитель / воздухораспределитель)
                    const A = C.hpToks(a).w, B = C.hpToks(b).w; const la = A.find((w: string) => w.length > 9), lb = B.find((w: string) => w.length > 9);
                    if (la && lb && la.slice(0, 5) === lb.slice(0, 5) && la.slice(0, 8) !== lb.slice(0, 8)) return 0;
                }
                return r;
            });
            if (typeof C.hp3Sim === 'function') C.hp3Sim = C.agmkExtend('hp3Sim', '5.6: oʻlcham farq qilsa — boshqa qism (Ø3 ≠ Ø4)', C.hp3Sim, (o: Function) => function (this: unknown, a: any, b: any) {
                const r = o.call(this, a, b); if (!r) return r;
                if (numSet(a) !== numSet(b)) return 0;
                // «Подвеска триангеля» ≠ «Триангель»: uzun nomning birinchi soʻzi qisqasida boʻlmasa va oʻxshashlik < 75% — boshqa qism
                const st4 = (x: any) => C.hpToks(x).w.filter((w: string) => w.length >= 3).map((w: string) => w.slice(0, 4));
                const A = st4(a), B = st4(b); const Lg = A.length >= B.length ? A : B, Sh = A.length >= B.length ? B : A;
                if (Lg.length && Sh.length && Sh.indexOf(Lg[0]) < 0) { const k = Lg.filter((w: string) => Sh.indexOf(w) >= 0).length; if (k / Lg.length < 0.75) return 0; }
                return r;
            });

            // ---------- 1) yashirin varaqlar ----------
            async function hidSheets(buf: ArrayBuffer): Promise<Set<string>> {
                const out = new Set<string>(); const u8 = new Uint8Array(buf);
                try {
                    if (u8[0] === 0x50 && u8[1] === 0x4B && typeof C.hsZipFiles === 'function') {
                        const z = await C.hsZipFiles(buf); const f = z['xl/workbook.xml']; if (!f) return out;
                        const x = new TextDecoder().decode(await f());
                        const unx = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
                        x.replace(/<(?:\w+:)?sheet\b[^>]*>/g, (t: string) => { if (/\bstate="(hidden|veryHidden)"/.test(t)) { const nm = (t.match(/\bname="([^"]*)"/) || [])[1]; if (nm !== undefined) out.add(unx(nm)); } return t; });
                    } else if (u8[0] === 0xD0 && u8[1] === 0xCF && typeof C.xhidCfb === 'function') {
                        const wb = C.xhidCfb(u8); if (!wb) return out;
                        const dv = new DataView(wb.buffer, wb.byteOffset, wb.byteLength); let p = 0;
                        while (p + 4 <= wb.length) {
                            const t = dv.getUint16(p, true), l = dv.getUint16(p + 2, true), d = p + 4;
                            if (t === 0x0085 && l >= 8) { const st = wb[d + 4] & 3, cch = wb[d + 6], hi = wb[d + 7] & 1; let nm = ''; for (let i = 0; i < cch; i++) nm += String.fromCharCode(hi ? dv.getUint16(d + 8 + i * 2, true) : wb[d + 8 + i]); if (st) out.add(nm); }
                            p = d + l;
                        }
                    }
                } catch (e) { console.error('x56 hid', e); }
                return out;
            }
            if (typeof C.hpReadBook === 'function') C.hpReadBook = C.agmkExtend('hpReadBook', '5.6: yashirin varaqlar tekshiruvga kirmaydi', C.hpReadBook, (o: Function) => async function (this: unknown, file: any) {
                const res = await o.apply(this, arguments);
                try {
                    const n = String((file && file.name) || '').toLowerCase();
                    if (Array.isArray(res) && /\.(xlsx|xls|xlsm)$/.test(n)) {
                        const H = await hidSheets(await file.arrayBuffer());
                        if (H.size) { const keep = res.filter((x: any) => !H.has(x.s)); const gone = res.filter((x: any) => H.has(x.s)).map((x: any) => x.s); if (gone.length) X56.hidSheets.push({ f: file.name, s: gone }); return keep; }
                    }
                } catch (e) { console.error('x56 rb', e); }
                return res;
            });
            if (typeof C.hpStart === 'function') C.hpStart = C.agmkExtend('hpStart', '5.6: yashirin varaqlar roʻyxati', C.hpStart, (o: Function) => function (this: unknown) { X56.hidSheets = []; return o.apply(this, arguments); });

            // ---------- 5) «СПРАВКА - РАСЧЕТ» ----------
            const SPR_RE = /справка\s*[-–—]\s*расч[её]т/i;
            if (typeof C.hpClassify === 'function') C.hpClassify = C.agmkExtend('hpClassify', '5.6: «СПРАВКА - РАСЧЕТ» (boʻshliq bilan)', C.hpClassify, (o: Function) => function (this: unknown, rows: any) {
                const t = o.apply(this, arguments);
                if (t === 'spr' || t === 'f30' || !rows) return t;
                try { const all = rows.map(txt).join(' \n ').toLowerCase(); if (SPR_RE.test(all) && /№\s*№?\s*треб/.test(all)) return 'spr'; } catch (e) { /* */ }
                return t;
            });

            // ---------- 4) spravka: birliklar soni, vagonlar, raqam ----------
            const CNT = /(\d+)\s*(?:ед|шт|ваг|кп|компл|пар)(?![а-яё])/;
            const lastCnt = (t: string): number => { const re = new RegExp(CNT.source, 'gi'); let m: any, v = 0; while ((m = re.exec(t))) v = +m[1]; return v; };
            function titleOf(rows: any[], b: any): string {
                if (b.title) return b.title;
                const a = (b.src && b.src.r !== undefined ? b.src.r : 0) + 1, z = b.hdr !== null && b.hdr !== undefined ? b.hdr : a + 6; let best = '';
                for (let i = a; i < z && i < rows.length; i++) { const t = txt(rows[i]); if (!t) continue; if (/ремонт|освидетел|наплавк|обточк/i.test(t)) return t; if (!/^на\s|вид операц|склад|шифр|^_+$/i.test(t) && /[а-яё]{4}/i.test(t)) best = t; }
                return best;
            }
            if (typeof C.hpParseSpr === 'function') C.hpParseSpr = C.agmkExtend('hpParseSpr', '5.6: birliklar soni va sarlavha', C.hpParseSpr, (o: Function) => function (this: unknown, rows: any, src: any) {
                let R2 = rows;
                try {
                    if (rows && rows.some((r: any) => (r || []).some((c: any) => typeof c === 'string' && SPR_RE.test(c) && !/справка-расч/i.test(c)))) {
                        R2 = rows.map((r: any) => (r || []).map((c: any) => typeof c === 'string' ? c.replace(/(справка)\s*[-–—]\s*(расч)/i, '$1-$2') : c));
                        if (rows.__hid) Object.defineProperty(R2, '__hid', { value: rows.__hid, enumerable: false });
                    }
                } catch (e) { R2 = rows; }
                const B0 = o.call(this, R2, src); let B: any[] = B0;
                try {
                    // «Получатель» (1017) — Forma-30 dagi sklad oxirgi raqami; «Цех» ustuni boʻlmasa shu olinadi
                    (B0 || []).forEach((b: any) => {
                        if (!b || !b.src || b.elv) return;
                        // yorliqlar «СПРАВКА-РАСЧЕТ» qatorida emas, 1–3 qator pastda boʻlishi mumkin (Склад | Вид опер | Получат | Шифр затрат)
                        for (let k = 0; k <= 3; k++) {
                            const Hr = R2[b.src.r + k] || []; const L = { sklad: C.hpFind(Hr, /^склад/), vid: C.hpFind(Hr, /вид опер/), ceh: C.hpFind(Hr, /^цех|^получат/), shpz: C.hpFind(Hr, /шифр затрат/) };
                            if (L.shpz < 0 && L.ceh < 0) continue;
                            let j = b.src.r + k + 1; while (j < R2.length && !txt(R2[j])) j++; const V = R2[j] || [], g = (c: number) => c >= 0 ? C.hpS(V[c]).replace(/\.0+$/, '') : '';
                            if (!b.sklad && g(L.sklad)) b.sklad = g(L.sklad); if (!b.vid && g(L.vid)) b.vid = g(L.vid);
                            if (!b.ceh && /^\d{3,5}$/.test(g(L.ceh))) b.ceh = g(L.ceh);
                            if (!b.shpz && /^\d{5,6}$/.test(g(L.shpz))) { b.shpz = g(L.shpz); if (/^\d{5}$/.test(b.shpz)) b.shpz = '0' + b.shpz; }
                            break;
                        }
                    });
                    // tonna → kg (Forma-30 bilan bir xil birlikda solishtirish)
                    (B0 || []).forEach((b: any) => { if (!b || !b.items) return; b.items.forEach((it: any) => { if (/^(т|тн|тонна)\.?$/i.test(String(it.unit || '').trim())) { ['n1', 'nN', 'fakt'].forEach(k => { if (it[k] !== null && it[k] !== undefined) it[k] = Math.round(it[k] * 1000 * 1e6) / 1e6; }); it.unit = 'кг'; it.t2kg = 1; } }); });
                    // bitta spravkada bir nechta boʻlim («№ треб.» sarlavhasi qayta keladi) — har boʻlim alohida blok
                    const out: any[] = [];
                    (B0 || []).forEach((b: any) => {
                        if (!b || !b.C || b.hdr === null || b.hdr === undefined || !b.items.length || !b.items.every((it: any) => typeof it.i === 'number')) { out.push(b); return; }
                        const all = b.items.slice(), last = Math.max(...all.map((it: any) => it.i)); const hs: number[] = [b.hdr];
                        for (let i = b.hdr + 1; i <= last; i++) { const t = low(txt(R2[i])); if (/№\s*№?\s*треб/.test(t) && /наимен/.test(t)) hs.push(i); }
                        b.sid = (b.src.f || '') + '|' + (b.src.s || '') + '|' + b.src.r;
                        hs.forEach((h, k) => {
                            const to = k + 1 < hs.length ? hs[k + 1] : Infinity;
                            let seg: any = b;
                            if (k > 0) {
                                let tt = ''; for (let j = h - 1; j > hs[k - 1]; j--) { const t = txt(R2[j]); if (t) { tt = t; break; } }
                                const Hr = R2[h] || [], cc = (re: RegExp) => C.hpFind(Hr, re);
                                seg = Object.assign({}, b, { src: Object.assign({}, b.src, { r: h }), hdr: h, title: tt, ttl: tt, items: [], grp: '', N: 1, rtype: /капитал/i.test(tt) ? 'KR' : /деповск/i.test(tt) ? 'DR' : b.rtype,
                                    C: { treb: cc(/№\s*треб/), name: cc(/наимен/), unit: cc(/ед\.?\s*изм/), n1: -1, nN: -1, fakt: cc(/факт/) } });
                                (Hr as any[]).forEach((x: any, j: number) => { const sx = low(x); if (/кол-?во на/.test(sx)) { const m = sx.match(/на\s*(\d+)\s*ед/); if (m && +m[1] === 1) seg.C.n1 = j; else if (!m && seg.C.n1 < 0) seg.C.n1 = j; } });
                                if (seg.C.fakt < 0) seg.C.fakt = b.C.fakt;
                            }
                            seg.items = all.filter((it: any) => it.i > h && it.i < to && !/^наимен/i.test(String(it.name)));
                            if (k > 0) seg.wagons = [];
                            if (k > 0 && !seg.items.length) return;
                            if (k > 0) seg.items = seg.items.map((it: any) => { const r = R2[it.i] || [], g = (j: number) => j >= 0 ? r[j] : ''; return Object.assign({}, it, { name: C.hpS(g(seg.C.name)) || it.name, unit: C.hpS(g(seg.C.unit)), n1: num(g(seg.C.n1)), nN: null, fakt: num(g(seg.C.fakt)) }); });
                            out.push(seg);
                        });
                    });
                    B = out.filter(Boolean);
                    B.forEach((b: any) => {
                        if (!b || !b.C || b.hdr === null || b.hdr === undefined) return;
                        const H = R2[b.hdr] || [], H2 = R2[b.hdr + 1] || [];
                        // a) ustundan son: «Кол-во на 236 шт.» yoki keyingi qatorda «на 183 ед»
                        let col = -1, n = 0, sub = false;
                        H.forEach((x: any, j: number) => { const s = low(x); const m = s.match(/на\s*(\d+)\s*(?:ед|шт|ваг|кп|компл|пар)/); if (m && +m[1] > 1 && /кол-?во|норм/.test(s)) { col = j; n = +m[1]; } });
                        if (col < 0) H2.forEach((x: any, j: number) => { const s = low(x); const m = s.match(/^на\s*(\d+)\s*(?:ед|шт|ваг|кп|компл|пар)/); if (m && +m[1] > 1) { col = j; n = +m[1]; sub = true; } });
                        if (col >= 0 && (b.C.nN !== col || b.N !== n)) {
                            if (b.C.n1 === col) b.C.n1 = -1;
                            b.C.nN = col; b.N = n;
                            b.items.forEach((it: any) => { const r = R2[it.i] || []; it.nN = num(r[col]); it.n1 = b.C.n1 >= 0 ? num(r[b.C.n1]) : null; });
                            if (sub) b.items = b.items.filter((it: any) => it.i !== b.hdr + 1);
                        }
                        // b) blok sarlavhasi: son va vagonlar
                        const t = titleOf(R2, b).replace(/_+/g, ' '); b.ttl = t;
                        const tn = lastCnt(t);
                        if (tn > 1) {
                            b.tN = tn;
                            if (b.C.nN >= 0 && tn !== b.N) {
                                const fit = (k: number) => b.items.filter((it: any) => it.n1 !== null && it.nN !== null && it.n1 > 0 && Math.abs(it.n1 * k - it.nN) < 0.011).length;
                                b.cntDiff = { hdr: b.N, title: tn };
                                if (fit(tn) > fit(b.N)) b.N = tn;
                            }
                        }
                        if (b.title) {
                            const isVag = /думпкар|вагон|ваг\.|хоп|цистерн|платформ|полуваг|окатыш|\d\s*вс/i.test(b.title);
                            const rest = b.title.replace(/_+/g, ' ').replace(new RegExp(CNT.source, 'gi'), ' ').replace(/усл\.?\s*№?\s*[\d\s,\-–]+/gi, ' ').replace(/\d*\s*вс\s*-?\s*\d+\s*т?\.?/gi, ' ').replace(/q\s*-?\s*\d+/gi, ' ').replace(/жд[цч]\s*-?\s*\d+/gi, ' ').replace(/\d+\s*т\b/gi, ' ');
                            b.wagons = isVag ? (rest.match(/\d{2,}/g) || []).map(C.hpWag) : [];
                        }
                        // d) jadval tashqarisidagi yozuvlar (sarlavhadan oʻngdagi ustunlarda nom + son) — chop etilmasligi mumkin
                        try { let w = -1; H.forEach((x: any, j: number) => { if (C.hpS(x)) w = j; }); const last2 = b.items.length ? Math.max(...b.items.map((it: any) => it.i)) : b.hdr;
                            const outx: any[] = []; for (let i = b.hdr + 1; i <= last2 + 1 && i < R2.length; i++) { const r = R2[i] || []; const tail = r.slice(w + 2).map((x: any) => C.hpS(x)).filter(Boolean); if (tail.length >= 2 && tail.some((x: string) => /[а-яё]{3}/i.test(x)) && tail.some((x: string) => /^\d/.test(x))) outx.push({ i: i, t: tail.join(' ').slice(0, 80) }); }
                            if (outx.length && outx.length <= 5) b.outside = outx; } catch (e) { /* */ }
                        // c) spravka raqami: «№_А__» → «А», «№___» → ''
                        const st = txt(R2[b.src.r] || []); const mm = st.match(/расч[её]т\s*№\s*([^\s|]*)/i); b.no = mm ? mm[1].replace(/_+/g, '').trim() : '';
                    });
                    Object.defineProperty(B, '__rows', { value: R2, enumerable: false });
                } catch (e) { console.error('x56 spr', e); }
                return B;
            });

            if (typeof C.hpParseF30 === 'function') C.hpParseF30 = C.agmkExtend('hpParseF30', '5.6: tonna → kg', C.hpParseF30, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try { if (r && r.items) r.items.forEach((x: any) => { if (/^(т|тн|тонна)\.?$/i.test(String(x.unit || '').trim()) && x.qty !== null) { x.qty = Math.round(x.qty * 1000 * 1e6) / 1e6; if (x.price !== null && x.price !== undefined) x.price = x.price / 1000; x.unit = 'кг'; x.t2kg = 1; } }); } catch (e) { /* */ }
                return r;
            });

            // ---------- uchastka defektovkasi (vagon raqamisiz) ----------
            function parseSecDV(rows: any[], src: any): any[] {
                const B: any[] = []; let cur: any = null, C2: any = null, lastTitle = '', lastTitleR = -1;
                for (let i = 0; i < rows.length; i++) {
                    const r = rows[i] || [], t = txt(r); if (!t) continue;
                    if (/^(начальник|зам\.|зам\s|заместит|инженер|мастер|бригадир|гл\.|главный)/i.test(t) && C2) { cur = null; C2 = null; continue; }
                    const jm = C.hpFind(r, /материал/), jq = C.hpFind(r, /потребн|кол-?во/);
                    if (jm >= 0 && jq >= 0) { C2 = { m: jm, u: C.hpFind(r, /ед\.?\s*изм|^ед/), q: jq }; cur = { src: Object.assign({}, src, { r: lastTitleR >= 0 ? lastTitleR : i }), sec: true, wagon: '', rtype: '', title: lastTitle, items: [] }; B.push(cur); continue; }
                    if (/ремонт|освидетел|наплавк|обточк/i.test(t) && !/^замена|^смазка|^мойка|^по краск/i.test(t) && (jm < 0) && r.filter((x: any) => C.hpS(x)).length <= 2) { lastTitle = t; lastTitleR = i; if (C2) { cur = { src: Object.assign({}, src, { r: i }), sec: true, wagon: '', rtype: '', title: t, items: [] }; B.push(cur); } continue; }
                    if (!cur || !C2) continue;
                    const name = C.hpS(r[C2.m]); if (!name) continue;
                    const q = num(r[C2.q]); const u = C2.u >= 0 ? C.hpS(r[C2.u]) : '';
                    cur.items.push({ i: i, name: name, unit: u, qty: q, src: Object.assign({}, src, { r: i }) });
                }
                B.forEach(b => { b.tN = lastCnt(String(b.title || '').replace(/_+/g, ' ')); });
                return B.filter(b => b.items.length);
            }
            if (typeof C.hpParseDV === 'function') C.hpParseDV = C.agmkExtend('hpParseDV', '5.6: uchastka defektovkasi (vagon raqamisiz)', C.hpParseDV, (o: Function) => function (this: unknown, rows: any, src: any) {
                const B = o.apply(this, arguments);
                try { if (Array.isArray(B) && !B.length) { const S2 = parseSecDV(rows || [], src || {}); if (S2.length) return S2; } } catch (e) { console.error('x56 dv', e); }
                return B;
            });

            // ---------- 2) 3) metallolom akti ----------
            const LOM_KEEP = /итого|всего|наимен|кол-?во|вес|износ|оприход|составил|начальник|мастер|инженер|утверждаю|согласовано|акт|разбраковк/i;
            C.hpParseSheet = C.agmkExtend('hpParseSheet', '5.6: metallolom — yashirin qatorlar, eskirish ulushi, xulosadagi kg', C.hpParseSheet, (o: Function) => function (this: unknown, rows: any, type: any, src: any) {
                if (type !== 'lom' || !rows) return o.apply(this, arguments);
                const H = rows.__hid; let R2 = rows.slice(); const hidQ: any[] = [];
                rows.forEach((r: any, i: number) => { const t = txt(r); if (/оприход|составил/i.test(t) && !/итого/i.test(t)) R2[i] = []; });
                try {
                    let qc = -1; for (let i = 0; i < Math.min(rows.length, 40); i++) { const rr = rows[i] || []; if (C.hpFind(rr, /наимен/) >= 0 && C.hpFind(rr, /вес/) >= 0) { qc = C.hpFind(rr, /кол-?во/); break; } }
                    if (H && H.size) {
                        H.forEach((i: number) => { const r = rows[i] || [], t = txt(r); if (!t || /итого|оприход|составил/i.test(t)) return; if (LOM_KEEP.test(t) && !r.some((x: any) => typeof x === 'number')) return; R2[i] = []; const q = qc >= 0 ? num(r[qc]) : null; if (q !== null && q > 0) hidQ.push({ r: i, t: t.slice(0, 160), src: Object.assign({}, src, { r: i }) }); });
                    }
                    if (H) Object.defineProperty(R2, '__hid', { value: H, enumerable: false });
                } catch (e) { R2 = rows; }
                const res = o.call(this, R2, type, src);
                try {
                    if (res && res.items) {
                        // eskirish ulush bilan (0,15 = 15%)
                        res.items.forEach((x: any) => {
                            if (x.p === null || x.p === undefined || !(x.p > 0 && x.p < 1) || x.tot === null) return;
                            const base = x.w !== null && x.w !== undefined ? (x.qty || 0) * x.w : (/кг/i.test(x.unit) ? (x.qty || 0) : null); if (base === null) return;
                            const e1 = base * (1 - x.p / 100), e2 = base * (1 - x.p);
                            if (Math.abs(e2 - x.tot) < 0.006 && Math.abs(e1 - x.tot) > 0.006) { x.p0 = x.p; x.p = x.p * 100; }
                        });
                        // xulosadagi kg (kirill harfli matn; \w ishlamaydi)
                        if (!res.stated) {
                            for (let i = 0; i < rows.length; i++) {
                                if (H && H.has(i)) continue;
                                const r = rows[i] || [], t = txt(r); if (!/(оприход|составил)/i.test(t) || !/(металлолом|лом)/i.test(t)) continue;
                                const m = t.match(/(?:металлолом|лом)[а-яё]*[^0-9]{0,40}?(\d[\d\s]*(?:[.,]\d+)?)\s*кг/i);
                                let v = m ? num(m[1].replace(/\s/g, '')) : null;
                                if (v === null) { const ns = r.filter((x: any) => typeof x === 'number'); if (ns.length) v = ns[ns.length - 1]; }
                                if (v !== null) { res.stated = { v: v, i: i, src: Object.assign({}, src, { r: i }) }; break; }
                            }
                        }
                        const kol = (() => { for (let i = 0; i < rows.length; i++) { if (H && H.has(i)) continue; const m = txt(rows[i]).match(/колодк[а-яё]*\s+б\/у\s*(\d+)\s*шт/i); if (m) return { v: +m[1], src: Object.assign({}, src, { r: i }) }; } return null; })();
                        Object.defineProperty(res, 'x56', { value: { hidQ: hidQ, kol: kol, filled: res.items.filter((x: any) => (x.qty || 0) > 0).length }, enumerable: false });
                    }
                } catch (e) { console.error('x56 lom', e); }
                return res;
            });

            // ---------- 7) qoʻshimcha tekshiruvlar va natijani tozalash ----------
            C.hpCheck = C.agmkExtend('hpCheck', '5.6: aniqlik va yangi tekshiruvlar', C.hpCheck, (o: Function) => function (this: unknown, pkg: any) {
                const R = o.apply(this, arguments);
                try {
                    const F = R.findings, add = (x: any) => { x.id = 'p56_' + (F.length + 1); x.st = ''; x.src = (x.src || []).filter(Boolean); F.push(x); return x; };
                    const S = (t: string) => pkg.sheets.filter((x: any) => x.type === t && x.data);
                    const M = pkg.month || (pkg.f30 && pkg.f30.month) || '';
                    const blocks: any[] = []; S('spr').forEach((x: any) => x.data.forEach((b: any) => { if (!M || !b.month || b.month === M) blocks.push(b); }));
                    const bName = (b: any) => (b.rtype === 'KR' ? 'Kapital taʼmir' : b.rtype === 'DR' ? 'Depo taʼmiri' : 'Taʼmir') + (b.obj ? ' ' + b.obj : '') + (b.wagons && b.wagons.length ? ' (' + (b.wagons.length > 3 ? b.wagons.length + ' ta vagon' : '№ ' + b.wagons.join(', ')) + ')' : (b.tN ? ' (' + b.tN + ' ed.)' : '')) + (b.ttl && !(b.wagons && b.wagons.length) && !b.obj ? ' · ' + String(b.ttl).slice(0, 50) : '');
                    const F2 = C.hpF;

                    // a) ustun sarlavhasi ↔ blok sarlavhasi (birliklar soni)
                    blocks.forEach(b => { if (b.cntDiff) add({ t: 'cnthdr', lvl: 'blue', sec: bName(b), name: 'Birliklar soni', msg: 'Blok sarlavhasida ' + b.cntDiff.title + ' ta, «Кол-во на …» ustunida ' + b.cntDiff.hdr + ' ta deb yozilgan. Tekshiruvda ' + b.N + ' olindi (ustundagi raqamlarga mos kelgani). Ustun sarlavhasini toʻgʻrilang.', src: [b.src] }); });

                    // b) takroriy spravka raqami
                    const byNo: any = {}; blocks.forEach(b => { const no = String(b.no || '').replace(/_+/g, '').trim(); if (no) (byNo[no] = byNo[no] || []).push(b); });
                    Object.keys(byNo).forEach(k => { const L = byNo[k]; const pl = new Set(L.map((b: any) => (b.src.f || '') + '|' + (b.src.s || '') + '|' + b.src.r)); if (pl.size > 1) add({ t: 'sprno', lvl: 'red', sec: 'Spravka raqamlari', name: '№ ' + k, msg: '«СПРАВКА-РАСЧЕТ № ' + k + '» raqami ' + L.length + ' ta spravkada: ' + L.map((b: any) => bName(b)).join('; ') + '. Har spravkaga alohida raqam bering.', src: L.map((b: any) => b.src) }); });

                    // c) fakt = norma (koʻchirilganga oʻxshash)
                    blocks.forEach(b => {
                        if (b.rtype === 'KR') return; // kapital taʼmirda butun komplekt almashadi — fakt = norma tabiiy
                        const wf = b.items.filter((it: any) => it.fakt !== null && it.fakt > 0);
                        const eq = wf.filter((it: any) => { const lim = b.C.nN >= 0 ? it.nN : it.n1; return lim !== null && lim !== undefined && Math.abs(it.fakt - lim) < 1e-9; });
                        if (eq.length >= 2 && eq.length * 2 >= wf.length && (b.N > 1 || eq.length >= 3)) add({ t: 'factnorm', lvl: 'blue', sec: bName(b), name: 'Факт = норма', msg: wf.length + ' ta faktdan ' + eq.length + ' tasi normaga aynan teng: ' + eq.slice(0, 8).map((it: any) => it.name + ' ' + F2(it.fakt)).join(', ') + (eq.length > 8 ? ' …' : '') + '. Haqiqiy sarf koʻpincha normadan farq qiladi — norma koʻchirib yozilmaganini Forma-30 bilan tekshiring.', src: eq.slice(0, 8).map((it: any) => it.src) });
                    });

                    // d) talabnoma raqamlari: takror (boshqa spravkada shu material) va boʻshliq
                    const reqs: any = {}; blocks.forEach(b => b.items.forEach((it: any) => { if (it.fakt === null) return; (it.ids || []).forEach((id: string) => { (reqs[id] = reqs[id] || []).push({ b: b, it: it }); }); }));
                    Object.keys(reqs).forEach(id => {
                        const L = reqs[id]; const sidOf = (z: any) => z.b.sid || ((z.b.src.f || '') + '|' + (z.b.src.s || '') + '|' + z.b.src.r); if (new Set(L.map(sidOf)).size < 2) return;
                        for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (sidOf(L[i]) !== sidOf(L[j]) && C.hpScore(L[i].it.name, L[j].it.name) > 0) {
                            add({ t: 'trebdup', lvl: 'blue', sec: 'Talabnoma raqamlari', name: '№ ' + id, msg: 'Bitta talabnoma (№ ' + id + ') ikki spravkada bir xil material uchun: «' + bName(L[i].b) + '» — ' + L[i].it.name + ' ' + F2(L[i].it.fakt) + '; «' + bName(L[j].b) + '» — ' + L[j].it.name + ' ' + F2(L[j].it.fakt) + '. Forma-30 da shu talabnomadagi miqdor ikkalasining yigʻindisiga teng boʻlishi kerak.', src: [L[i].it.src, L[j].it.src] });
                            i = L.length; break;
                        }
                    });
                    if (!pkg.f30) {
                        const ids = Object.keys(reqs).map(Number).filter(n => n > 0).sort((a, b) => a - b);
                        if (ids.length >= 15 && ids[ids.length - 1] <= 600) { const set = new Set(ids), gap: number[] = []; for (let k = ids[0]; k <= ids[ids.length - 1]; k++) if (!set.has(k)) gap.push(k);
                            if (gap.length && gap.length <= 12) add({ t: 'trebgap', lvl: 'blue', sec: 'Talabnoma raqamlari', name: ids[0] + '–' + ids[ids.length - 1], msg: 'Spravkalarda talabnomalar ' + ids[0] + ' dan ' + ids[ids.length - 1] + ' gacha, lekin ' + gap.join(', ') + ' hech qaysi spravkada yoʻq. Bu talabnomalar boʻyicha nima olingan — Forma-30 bilan tekshiring (М-30 akti, boshqa uchastka va h.k. boʻlishi mumkin).', src: [] }); }
                    }

                    // e) uchastka defektovkasi ↔ spravka
                    const sdv: any[] = []; S('dv').forEach((x: any) => x.data.forEach((d: any) => { if ((d.sec || !d.wagon) && d.items && d.items.length && d.src) sdv.push(d); }));
                    sdv.forEach(d => {
                        const cand = blocks.filter(b => b.src.f === d.src.f && b.C);
                        if (!cand.length) return;
                        const sc = (b: any) => { let s = 0; if (d.tN && (b.tN === d.tN || b.N === d.tN)) s += 3; s += C.hpScore(String(b.ttl || ''), String(d.title || ''), true) ? 2 : 0; d.items.forEach((x: any) => { if (b.items.some((it: any) => C.hpScore(it.name, x.name) > 0)) s += 0.2; }); return s; };
                        const b = cand.slice().sort((p, q) => sc(q) - sc(p))[0]; if (!b || sc(b) < (cand.length === 1 ? 0.2 : 1)) return;
                        const sec = bName(b) + ' ↔ defektovka';
                        const used = new Set();
                        d.items.forEach((x: any) => {
                            if (x.qty === null || x.qty === undefined) return;
                            const L = b.items.filter((it: any) => !used.has(it) && C.hpScore(it.name, x.name) > 0);
                            if (!L.length) { add({ t: 'dvsecx', lvl: 'blue', sec: sec, name: x.name, msg: 'Defektovkada ' + F2(x.qty) + ' ' + (x.unit || '') + ', spravkada bu material yoʻq (yoki boshqacha nomlangan).', src: [x.src] }); return; }
                            const best = Math.max(...L.map((it: any) => C.hpScore(it.name, x.name))); const it = L.find((z: any) => C.hpScore(z.name, x.name) === best); used.add(it);
                            const f = it.fakt === null ? 0 : it.fakt;
                            if (Math.abs(f - x.qty) > 1e-6) add({ t: 'dvsec', lvl: 'red', sec: sec, name: it.name, msg: 'Defektovkada «' + x.name + '» ' + F2(x.qty) + ' ' + (x.unit || '') + ', spravkada Факт ' + (it.fakt === null ? 'yoʻq' : F2(it.fakt) + ' ' + (it.unit || '')) + '.', src: [it.src, x.src] });
                        });
                        b.items.forEach((it: any) => { if (it.fakt !== null && it.fakt > 0 && !used.has(it)) add({ t: 'dvsecs', lvl: 'blue', sec: sec, name: it.name, msg: 'Spravkada Факт ' + F2(it.fakt) + ' ' + (it.unit || '') + ', defektovkada bu material miqdori bilan yoʻq.', src: [it.src] }); });
                    });

                    // f0) list (kg): aktdagi kg ↔ spravkalardagi Факт — faqat kg dagi qatorlar («нижний лист для розетки», шт — list emas)
                    for (let i = F.length - 1; i >= 0; i--) if (F[i].t === 'lomlist') F.splice(i, 1);
                    S('lom').forEach((x: any) => {
                        const L = x.data; if (!L || !L.items) return; const sec = 'Metallolom akti' + (L.month ? ' · ' + L.month.split('-').reverse().join('.') : '');
                        L.items.filter((y: any) => /лист/i.test(y.name) && /кг/i.test(y.unit || '') && y.qty).forEach((y: any) => {
                            const kg = y.w !== null && y.w !== undefined && y.w > 1 && y.qty <= 1 ? y.qty * y.w : y.qty;
                            const vals: any[] = []; blocks.forEach(b => b.items.forEach((it: any) => { if (it.fakt !== null && /лист/i.test(it.name) && /кг/i.test(it.unit || '') && C.hpScore(y.name, it.name) > 0) vals.push(it); }));
                            if (!vals.length) return; const tot = vals.reduce((a: number, it: any) => a + it.fakt, 0);
                            if (Math.abs(tot - kg) > 1e-6 && !vals.some((it: any) => Math.abs(it.fakt - kg) < 1e-6)) add({ t: 'lomlist', lvl: 'blue', sec: sec, name: y.name, msg: 'Aktda ' + F2(kg) + ' kg, spravkalarda shu list boʻyicha Факт ' + vals.map((it: any) => F2(it.fakt)).join(' + ') + ' = ' + F2(tot) + ' kg.', src: [y.src].concat(vals.map((it: any) => it.src)) });
                        });
                    });
                    // f) metallolom: boʻsh jadval, yashirin qatorlardagi son, kolodka
                    S('lom').forEach((x: any) => {
                        const L = x.data, z = L.x56; if (!z) return; const sec = 'Metallolom akti' + (L.month ? ' · ' + L.month.split('-').reverse().join('.') : '');
                        if (!z.filled && L.stated && L.stated.v > 0) {
                            for (let i = F.length - 1; i >= 0; i--) if (F[i].t === 'lomstate' && F[i].sec === sec) F.splice(i, 1);
                            add({ t: 'lomempty', lvl: 'red', sec: sec, name: 'Jadval boʻsh', msg: 'Jadvalda soni yozilmagan (ИТОГО ' + F2(L.itogo ? L.itogo.v : 0) + ' kg), lekin xulosada ' + F2(L.stated.v) + ' kg metallolom yozilgan. Har bir almashtirilgan qism soni va vazni jadvalda boʻlishi kerak.', src: [L.stated.src, L.itogo && L.itogo.src] });
                        }
                        if (z.hidQ.length) add({ t: 'lomhid', lvl: 'blue', sec: sec, name: 'Yashirin qatorlarda son', msg: z.hidQ.length + ' ta yashirin qatorda son yozilgan (chop etilmaydi, ИТОГО ga kirmaydi): ' + z.hidQ.slice(0, 6).map((h: any) => (h.r + 1) + '-qator «' + h.t.slice(0, 50) + '»').join('; ') + (z.hidQ.length > 6 ? ' …' : '') + '. Ishlatilmagan boʻlsa — sonlarni oʻchiring.', src: z.hidQ.slice(0, 10).map((h: any) => h.src) });
                        if (z.kol) { let tot = 0; blocks.forEach(b => b.items.forEach((it: any) => { if (it.fakt > 0 && /колодк/i.test(low(it.name)) && !/клин|чек/i.test(low(it.name))) tot += it.fakt; }));
                            if (tot && Math.abs(tot - z.kol.v) > 1e-6) add({ t: 'lomkol', lvl: 'blue', sec: sec, name: 'Колодки б/у', msg: 'Lomga ' + F2(z.kol.v) + ' ta eski kolodka topshirilgan, spravkalarda ' + F2(tot) + ' ta kolodka almashtirilgan (farq ' + F2(tot - z.kol.v) + ').', src: [z.kol.src] }); }
                    });

                    // e2) defektovkada bir oʻlcham, spravkada boshqa (miqdor bir xil): «Болт М-20х45» 60 ↔ «Болт М-16х40» 60
                    const dx = F.filter((f: any) => f.t === 'dvsecx'), ds = F.filter((f: any) => f.t === 'dvsecs');
                    dx.forEach((a: any) => { const qa = (String(a.msg).match(/Defektovkada ([\d\s,]+)/) || [])[1]; const w0 = low(a.name).split(/[\s\-]/)[0];
                        const b2 = ds.find((z: any) => !z._u && z.sec === a.sec && low(z.name).split(/[\s\-]/)[0] === w0 && (String(z.msg).match(/Факт ([\d\s,]+)/) || [])[1] === qa);
                        if (b2) { b2._u = 1; a._x = 1; b2._x = 1; add({ t: 'dvsize', lvl: 'red', sec: a.sec, name: b2.name, msg: 'Defektovkada «' + a.name + '» ' + String(qa).trim() + ', spravkada esa «' + b2.name + '» ' + String(qa).trim() + ' — oʻlcham/nom farq qiladi. Bittasini toʻgʻrilang.', src: (b2.src || []).concat(a.src || []) }); } });
                    for (let i = F.length - 1; i >= 0; i--) if (F[i]._x) F.splice(i, 1);

                    blocks.forEach(b => { if (b.outside) add({ t: 'outside', lvl: 'blue', sec: bName(b), name: 'Jadval tashqarisida', msg: 'Jadvaldan oʻngdagi ustunlarda yozuv bor: ' + b.outside.map((o: any) => (o.i + 1) + '-qator «' + o.t + '»').join('; ') + '. Chop etish sohasiga kirmasa — qogʻozda koʻrinmaydi; hisobga kirishi kerakmi, tekshiring.', src: b.outside.map((o: any) => Object.assign({}, b.src, { r: o.i })) }); });
                    // e3) talabnoma raqamisiz fakt (blokdagi boshqa qatorlarda raqam bor) — Forma-30 yoʻq boʻlsa ham
                    if (!pkg.f30) blocks.forEach(b => { const wf = b.items.filter((it: any) => it.fakt !== null && it.fakt > 0); const nt = wf.filter((it: any) => !(it.ids || []).length); if (nt.length && nt.length <= 3 && wf.length - nt.length >= 3) nt.forEach((it: any) => add({ t: 'notreb2', lvl: 'blue', sec: bName(b), name: it.name, msg: 'Факт ' + F2(it.fakt) + ' ' + (it.unit || '') + ' yozilgan, lekin talabnoma raqami yoʻq (qolgan qatorlarda bor). Qaysi talabnoma bilan olingan?', src: [it.src] })); });

                    // e4) bir xil turdagi birliklar soni hujjatlarda har xil (elektrovoz gʻildirak juftligi: naplavka 232, remont 22)
                    const kp = blocks.filter(b => b.tN && /колесн/i.test(String(b.ttl || '')) && /электровоз/i.test(String(b.ttl || '') + ' ' + String(b.obj || '')));
                    const kv = [...new Set(kp.map(b => b.tN))]; if (kv.length > 1) add({ t: 'cntx', lvl: 'blue', sec: 'Birliklar soni', name: 'Elektrovoz gʻildirak juftliklari', msg: 'Hujjatlarda har xil: ' + kp.map(b => '«' + String(b.ttl).slice(0, 60) + '» — ' + b.tN).join('; ') + '. Kichik soni toʻgʻri boʻlsa — kattasi boʻyicha sarf normadan oshadi.', src: kp.map(b => b.src) });

                    // e5) naryad ↔ spravka: naryadda bajarilgan (годных > 0), lekin hech bir spravkada yoʻq vagon; spravkadagi KR vagon naryadda yoʻq
                    const nars = S('nar').map((x: any) => x.data); if (nars.length && blocks.length) {
                        const sw = new Set<string>(); blocks.forEach(b => (b.wagons || []).forEach((w: string) => sw.add(w)));
                        const nw = new Map<string, any>(); nars.forEach((N: any) => N.items.forEach((x: any) => { if ((x.god || 0) > 0) (x.wagons || []).forEach((w: string) => { if (!nw.has(w)) nw.set(w, x); }); }));
                        const miss = [...nw.keys()].filter(w => !sw.has(w)); if (miss.length && miss.length <= 10) add({ t: 'narw3', lvl: 'blue', sec: 'Naryad ↔ spravka', name: 'Spravkasiz vagonlar', msg: 'Naryadda bajarilgan (ish haqi toʻlangan), lekin yuklangan spravkalarda yoʻq: ' + miss.map(w => '№ ' + w + ' («' + String(nw.get(w).desc).slice(0, 50) + '»)').join('; ') + '. Material ishlatilmaganmi yoki spravka yuklanmaganmi?', src: miss.map(w => nw.get(w).src) });
                        const krW = new Set<string>(); blocks.filter(b => b.rtype === 'KR').forEach(b => (b.wagons || []).forEach((w: string) => krW.add(w)));
                        const krMiss = [...krW].filter(w => !nw.has(w)); if (krW.size && krMiss.length) add({ t: 'narkr', lvl: 'blue', sec: 'Naryad ↔ spravka', name: 'Kapital taʼmir', msg: 'Spravkada kapital taʼmir materiallari bor, lekin naryadlarda shu oy bajarilgan ish yoʻq: № ' + krMiss.join(', ') + '. Vagon qaysi oyda yopiladi?', src: [] });
                    }

                    // g) yashirin varaqlar (tekshiruvga kirmadi)
                    if (X56.hidSheets.length) add({ t: 'hidsheet', lvl: 'info', sec: 'Yashirin varaqlar', name: 'Tekshiruvga kirmadi', msg: 'Bu varaqlar Excelda yashirilgan (chop etilmaydi) — tekshirilmadi: ' + X56.hidSheets.map((h: any) => h.f + ' › ' + h.s.join(', ')).join('; ') + '.', src: [] });

                    // h) hujjat egasi (imzodan)
                    const own = new Set<string>(); S('spr').concat(S('lom')).forEach((x: any) => { const rows = (x.data && x.data.__rows) || null; if (!rows) return; rows.forEach((r: any) => { const t = txt(r); if (/^мастер/i.test(t)) { const v = (r || []).map(C.hpS).filter(Boolean); const nm = v[v.length - 1]; if (nm && !/^мастер/i.test(nm) && /[А-ЯЁ][а-яё]+/.test(nm)) own.add(nm.replace(/\s+/g, ' ')); } }); });
                    if (own.size) { R.stats.owner = [...own].slice(0, 3).join(', '); add({ t: 'owner', lvl: 'info', sec: 'Hujjat egasi', name: 'Imzodan', msg: 'Spravkalardagi «Мастер» imzosi: ' + R.stats.owner + '.', src: [] }); }

                    const ord: any = { red: 0, blue: 1, info: 2, hid: 3 }; F.sort((a: any, b: any) => (ord[a.lvl] === undefined ? 2 : ord[a.lvl]) - (ord[b.lvl] === undefined ? 2 : ord[b.lvl]));
                } catch (e) { console.error('x56 chk', e); }
                return R;
            });
        })();
