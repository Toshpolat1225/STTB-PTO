        // =====================================================================
        // 6.2 (144) — 🧾 MASTER HISOBOTI: ШПЗ 221, 222, 08100 DAN TASHQARI MATERIALLAR — KOʻK (muallif, 13.11.2026)
        //  Avval (6.1): masterning skladiga 1C da urilgan, lekin spravka-raschetda yoʻq HAR BIR talabnoma ❌ QIZIL xato edi —
        //   kir sovun, qoʻlqop, respirator kabi materiallar ham («nimaga spravkaga kiritilmagan» deb).
        //  Qoida (muallif): spravka-raschetga faqat ШПЗ 221…, 222…, 08100… dagi materiallar sochiladi.
        //   Boshqa ШПЗ dagi material 1C ga urilgan boʻlsa — bu XATO EMAS, lekin koʻrib qoʻyish kerak → 🔷 KOʻK izoh.
        //  Talabnomada ikkala turdagi material boʻlsa — 221/222/08100 qismi qizil qoladi, qolgani koʻk izohga ajratiladi.
        //  Jami qizil xulosa («N ta talabnoma … soʻm») faqat qizil qolganlar boʻyicha qayta hisoblanadi.
        // =====================================================================
        const HZ: any = window as any;
        const HZ_PFX = ['221', '222', '08100'];
        function hzNorm(v: any): string { let s = String(v == null ? '' : v).trim().replace(/\s/g, '').replace(/\.0+$/, ''); if (/^\d{5}$/.test(s)) s = '0' + s; return s; }
        function hzOk(v: any): boolean { const c = hzNorm(v); return !c || HZ_PFX.some(p => c.indexOf(p) === 0); } // ШПЗ yozilmagan — avvalgidek tekshiriladi
        function hzId(x: any): string { const s = String(x == null ? '' : x).trim(); return /^\d+$/.test(s) ? String(+s) : s; }
        function hzF(v: number, d?: number): string { try { return HZ.hpF(v, d); } catch (e) { return String(v); } }
        function hzRow(x: any): string { return '«' + x.name + '» ' + hzF(x.qty || 0) + ' ' + (x.unit || '') + (x.sum ? ', ' + hzF(x.sum, 0) + ' soʻm' : '') + (x.shpz ? ', ШПЗ ' + x.shpz : ''); }
        function hzFix(pkg: any, R: any): void {
            const f30 = pkg && pkg.f30; if (!f30 || !Array.isArray(f30.items) || !R || !Array.isArray(R.findings)) return;
            const out: any[] = [];
            R.findings.forEach((f: any) => {
                if (!f || f.t !== 'f30nospr') { out.push(f); return; }
                const m = String(f.name || '').match(/№\s*(\S+)/), k = m ? hzId(m[1]) : '';
                const sk = (String(f.msg || '').match(/Sklad: ([^.]+)\./) || [])[1] || '';
                const L = f30.items.filter((x: any) => x && !x.pogr && x.tid && hzId(x.tid) === k && (!sk || sk === '—' || String(x.sklad || '').trim() === sk.trim()));
                if (!L.length) { out.push(f); return; }
                const red = L.filter((x: any) => hzOk(x.shpz)), blue = L.filter((x: any) => !hzOk(x.shpz));
                if (!blue.length) { out.push(f); return; }
                const sum = (A: any[]) => A.reduce((a: number, x: any) => a + (x.sum || 0), 0);
                if (red.length) {
                    out.push(Object.assign({}, f, { msg: '1C ga urilgan (rasxod qilingan), lekin spravka-raschetga kiritilmagan: ' + red.map(hzRow).join('; ') + '. Sklad: ' + String(red[0].sklad || '—') + '. Shu talabnomani spravka-raschetga sochish kerak (agar boshqa masterniki boʻlsa — 1C da sklad toʻgʻrilansin).', diff: sum(red) }));
                }
                out.push({ id: (f.id || 'p62z') + 'b', st: '', t: 'f30shpz', lvl: 'blue', sec: f.sec, name: f.name,
                    msg: '1C ga urilgan, spravka-raschetda yoʻq — ШПЗ 221/222/08100 emas, shuning uchun xato hisoblanmaydi (tekshirib qoʻying): ' + blue.map(hzRow).join('; ') + '. Sklad: ' + String(blue[0].sklad || '—') + '.',
                    src: blue.map((x: any) => Object.assign({}, x.src || {}, { r: x.i })).filter((z: any) => z.f), diff: sum(blue) });
            });
            // jami qizil xulosa — qayta
            const reds = out.filter((f: any) => f && f.t === 'f30nospr');
            const res = out.filter((f: any) => !(f && f.t === 'f30nosprS'));
            if (reds.length > 1) {
                const ids = reds.map((f: any) => (String(f.name || '').match(/№\s*(\S+)/) || [])[1] || '?'), tot = reds.reduce((a: number, f: any) => a + (f.diff || 0), 0);
                res.push({ id: 'p61fs', st: '', t: 'f30nosprS', lvl: 'red', sec: 'Forma-30 ↔ spravka-raschet', name: reds.length + ' ta talabnoma', msg: 'Jami ' + reds.length + ' ta talabnoma (№ ' + ids.join(', ') + ') 1C ga urilgan, lekin spravka-raschetlarda yoʻq — ' + hzF(tot, 0) + ' soʻm.', src: [], diff: tot });
            }
            R.findings.length = 0; res.forEach((f: any) => R.findings.push(f));
        }
        if (typeof HZ.hpCheck === 'function') HZ.hpCheck = HZ.agmkExtend('hpCheck', '6.2: ШПЗ 221/222/08100 dan tashqari — koʻk', HZ.hpCheck, (o: Function) => function (this: unknown, pkg: any) {
            const R = o.apply(this, arguments);
            try { if (R && typeof R.then === 'function') return R.then((x: any) => { try { hzFix(pkg, x); } catch (e) { console.error('6.2 shpz', e); } return x; }); hzFix(pkg, R); } catch (e) { console.error('6.2 shpz', e); }
            return R;
        });
        // izoh matni (finding turi boʻyicha tushuntirish)
        if (typeof HZ.hp3Fix === 'function') HZ.hp3Fix = HZ.agmkExtend('hp3Fix', '6.2: f30shpz izohi', HZ.hp3Fix, (o: Function) => function (this: unknown, f: any) {
            if (f && f.t === 'f30shpz') return 'Spravka-raschetga faqat ШПЗ 221, 222, 08100 dagi materiallar sochiladi. Boshqa ШПЗ (kir sovun, qoʻlqop, respirator va h.k.) — xato emas, faqat tekshirib qoʻyish uchun.';
            return o.apply(this, arguments);
        });
