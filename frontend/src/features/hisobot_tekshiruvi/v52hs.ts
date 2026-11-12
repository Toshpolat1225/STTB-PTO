        // =====================================================================
        // 5.2 — Hisobot tekshiruvi: ochiq savollar yopildi (muallif, 28.10.2026; docs/HISOBOT_TEKSHIRUV.md, 6-boʻlim)
        //  1) Forma-30 oyi 1C ning ikkala shaklida ham oʻqiladi: «2025/05/01 - 2025/05/31» va «01.05.2025 - 31.05.2025»
        //     (oddiy tekshiruvda yuklash oynasidagi taklif va oylik toʻplamdagi Forma-30 oyi).
        //  9) Rasm (foto) hisobot internetli AI ga YUBORILMAYDI — yopiq kontur. Excel yoki PDF soʻraladi
        //     (qogʻoz boʻlsa — avval «📷 Skaner» bilan PDF/Excel qilinadi).
        //  Qolgan savollar boʻyicha amaldagi qoida oʻzgarmadi (hujjatda «Qaror» ustuni).
        // =====================================================================
        const HS52: any = window as any;
        // «01.05.2025 - 31.05.2025» / «2025/05/01 - 2025/05/31» / «01.05.25» → YYYY-MM (davr boshi)
        function hs52Per(t: any): string {
            const s = String(t || ''); let m: any;
            if ((m = s.match(/(20\d{2})[\/.\-](\d{1,2})[\/.\-]\d{1,2}/))) return +m[2] >= 1 && +m[2] <= 12 ? m[1] + '-' + String(+m[2]).padStart(2, '0') : '';
            if ((m = s.match(/(\d{1,2})\.(\d{1,2})\.(20\d{2})/))) return +m[2] >= 1 && +m[2] <= 12 ? m[3] + '-' + String(+m[2]).padStart(2, '0') : '';
            return '';
        }
        function hs52RowTxt(r: any): string { return (r || []).map((c: any) => c === null || c === undefined ? '' : String(c)).join(' '); }
        // Sarlavhagacha boʻlgan qatorlarda «период / period / davr» yozuvi
        function hs52F30Month(rows: any[], upto?: number): string {
            const n = Math.min(upto === undefined ? 8 : upto, (rows || []).length);
            for (let i = 0; i < n; i++) { const s = hs52RowTxt(rows[i]); if (/период|period|davr/i.test(s)) { const m = hs52Per(s.replace(/.*(?:период|period|davr)\s*:?/i, '')); if (m) return m; } }
            return '';
        }
        if (typeof HS52.hsF30Period === 'function') HS52.hsF30Period = HS52.agmkExtend('hsF30Period', '5.2: Forma-30 oyi — dd.mm.yyyy shakli ham', HS52.hsF30Period, (o: Function) => function (this: unknown, rows: any) {
            const r = o.apply(this, arguments); return r || hs52F30Month(rows, 8);
        });
        if (typeof HS52.hpParseF30 === 'function') HS52.hpParseF30 = HS52.agmkExtend('hpParseF30', '5.2: Forma-30 oyi — dd.mm.yyyy shakli ham', HS52.hpParseF30, (o: Function) => function (this: unknown, rows: any) {
            const r = o.apply(this, arguments);
            try { if (r && !r.month) { let h = 40; for (let i = 0; i < Math.min((rows || []).length, 40); i++) { const t = hs52RowTxt(rows[i]).toLowerCase(); if (/требование/.test(t) && /номенклатура/.test(t)) { h = i; break; } } r.month = hs52F30Month(rows, h); } } catch (e) { /* */ }
            return r;
        });
        // 9) Rasm hisobot — bulutga yuborilmaydi
        HS52.hsReadImageAI = async function (): Promise<any> {
            throw new Error('🔒 Rasm (foto) koʻrinishidagi hisobot qabul qilinmaydi — korxona maʼlumoti tashqi (internetli) AI ga yuborilmaydi (yopiq kontur). Hisobotni Excel yoki PDF koʻrinishida yuklang. Qogʻoz boʻlsa — avval «📷 Skaner» bilan PDF yoki Excel qiling.');
        };
        Object.assign(HS52, { hs52Per: hs52Per, hs52F30Month: hs52F30Month });
