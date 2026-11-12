        // =====================================================================
        // 6.1 (138) — 1C (Forma-30) ga urilgan, lekin spravka-raschetda yoʻq talabnomalar (buxgalter savoli, 04.11.2026)
        //  «Bir master hisobotida 174, 227 talabnomalarini topolmadim — 1C da rasxod urilgan, spravka-raschetda yoʻq».
        //  Qoida (muallif): Forma-30 da master skladiga urilgan HAR BIR material spravka-raschetga sochilishi shart.
        //  Avval: faqat spravkadagi sex VA ШПЗ bilan bir xil qatorlar, koʻk izoh sifatida («extra») tekshirilardi —
        //   boshqa ШПЗ bilan urilgan talabnoma umuman chiqmasdi.
        //  Endi: masterning skladi (spravkadagi «Цех/объект» → 1C ombor bogʻlanishi + «Sklad ↔ master» jadvali) boʻyicha
        //   Forma-30 dagi har talabnoma raqami biror spravkada bormi — yoʻq boʻlsa ❌ QIZIL xato, talabnoma boʻyicha guruhlab:
        //   «1C ga urilgan, lekin spravka-raschetda yoʻq». Shu qatorlar uchun eski koʻk «extra» izohi takrorlanmaydi.
        //  Talabnoma raqami spravkada bor, lekin material boshqacha — buni eski tekshiruvlar (nom / oʻlcham / miqdor) chiqaradi.
        // =====================================================================
        const FN61: any = window as any;
        function fn61Id(x: any): string { const s = String(x == null ? '' : x).trim(); return /^\d+$/.test(s) ? String(+s) : s; }
        function fn61F(v: number, d?: number): string { try { return FN61.hpF(v, d); } catch (e) { return String(v); } }
        /** masterning 1C ombor kodlari (Forma-30 dagi «Склад» ichida qidiriladi) */
        function fn61Codes(pkg: any, blocks: any[]): string[] {
            const S = new Set<string>();
            blocks.forEach((b: any) => { [b.ceh, b.cehSrc].forEach((c: any) => { const s = String(c || '').trim(); if (s) S.add(s); }); try { const m = FN61.ceh59Code(b.cehSrc || b.ceh); if (m) S.add(m); } catch (e) { /* */ } });
            // «Sklad ↔ master» jadvali (umumiy yuklash): shu masterga belgilangan sklad kodlari
            try {
                const who = String(pkg.who || (FN61.HPK && FN61.HPK.pend && FN61.HPK.pend.who) || '').trim();
                if (who && typeof FN61.bk60Skl === 'function') { const T = FN61.bk60Skl() || {}; Object.keys(T).forEach(c => { if (String(T[c] || '').trim() === who) { S.add(String(c).trim()); try { const m = FN61.ceh59Code(c); if (m) S.add(m); } catch (e) { /* */ } } }); }
            } catch (e) { /* */ }
            return Array.from(S).filter(c => /\d{3,}/.test(c));
        }
        function fn61InSklad(x: any, codes: string[]): boolean {
            const s = String(x.sklad || '').replace(/\s+/g, ' '), last = s.split(' ').pop() || '';
            return codes.some(c => { const k = String(c).trim(), kl = k.split(' ').pop() || k; return s.indexOf(k) >= 0 || last === kl; });
        }
        function fn61Check(pkg: any, R: any): void {
            const f30 = pkg && pkg.f30; if (!f30 || !Array.isArray(f30.items) || !R || !Array.isArray(R.findings)) return;
            const M = pkg.month || f30.month || '';
            const all: any[] = []; (pkg.sheets || []).forEach((x: any) => { if (x.type === 'spr' && Array.isArray(x.data)) x.data.forEach((b: any) => { if (b) all.push(b); }); });
            const cur = all.filter((b: any) => !M || !b.month || b.month === M); if (!cur.length) return;
            const codes = fn61Codes(pkg, cur); if (!codes.length) return;
            // spravkalardagi barcha talabnoma raqamlari (boshqa oy bloklari ham — ikki marta xato chiqmasin)
            const ids = new Set<string>(); all.forEach((b: any) => (b.items || []).forEach((it: any) => (it.ids || []).forEach((id: any) => ids.add(fn61Id(id)))));
            const rest = f30.items.filter((x: any) => x && !x.pogr && x.tid && fn61InSklad(x, codes) && !ids.has(fn61Id(x.tid)));
            if (!rest.length) return;
            const g: any = {}; rest.forEach((x: any) => { const k = fn61Id(x.tid); (g[k] = g[k] || []).push(x); });
            const done = new Set<string>(Object.keys(g));
            // eski koʻk «extra» — shu talabnomalar uchun takrorlanmasin
            for (let i = R.findings.length - 1; i >= 0; i--) {
                const f = R.findings[i]; if (!f || f.t !== 'extra') continue;
                const n = (String(f.msg || '').match(/№(\d+)/g) || []).map((s: string) => fn61Id(s.slice(1)));
                if (n.length && n.every((k: string) => done.has(k))) R.findings.splice(i, 1);
            }
            const ord = Object.keys(g).sort((a, b) => (+a || 0) - (+b || 0));
            let tot = 0;
            ord.forEach(k => {
                const L = g[k], s = L.reduce((a: number, x: any) => a + (x.sum || 0), 0); tot += s;
                const rows = L.map((x: any) => '«' + x.name + '» ' + fn61F(x.qty || 0) + ' ' + (x.unit || '') + (x.sum ? ', ' + fn61F(x.sum, 0) + ' soʻm' : '') + (x.shpz ? ', ШПЗ ' + x.shpz : '')).join('; ');
                const f: any = { t: 'f30nospr', lvl: 'red', sec: 'Forma-30 ↔ spravka-raschet', name: 'Talabnoma № ' + k + (L[0].tref ? ' (' + L[0].tref + ')' : ''),
                    msg: '1C ga urilgan (rasxod qilingan), lekin spravka-raschetga kiritilmagan: ' + rows + '. Sklad: ' + String(L[0].sklad || '—') + '. Shu talabnomani spravka-raschetga sochish kerak (agar boshqa masterniki boʻlsa — 1C da sklad toʻgʻrilansin).',
                    src: L.map((x: any) => Object.assign({}, x.src || {}, { r: x.i })).filter((z: any) => z.f), diff: s };
                f.id = 'p61f' + (R.findings.length + 1); f.st = ''; R.findings.push(f);
            });
            if (ord.length > 1) R.findings.push({ id: 'p61fs', st: '', t: 'f30nosprS', lvl: 'red', sec: 'Forma-30 ↔ spravka-raschet', name: ord.length + ' ta talabnoma', msg: 'Jami ' + ord.length + ' ta talabnoma (№ ' + ord.join(', ') + ') 1C ga urilgan, lekin spravka-raschetlarda yoʻq — ' + fn61F(tot, 0) + ' soʻm.', src: [], diff: tot });
        }
        if (typeof FN61.hpCheck === 'function') FN61.hpCheck = FN61.agmkExtend('hpCheck', '6.1: 1C ga urilgan, spravkada yoʻq talabnomalar', FN61.hpCheck, (o: Function) => function (this: unknown, pkg: any) {
            const R = o.apply(this, arguments);
            try { fn61Check(pkg, R); } catch (e) { console.error('6.1 f30↔spravka', e); }
            return R;
        });
