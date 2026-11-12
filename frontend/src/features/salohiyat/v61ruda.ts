        // =====================================================================
        // 6.1 (138) — ⛰️ RUDA TASHISH: YILLIK MEʼYOR 38 mln t (muallif, 04.11.2026)
        //  Avval salohiyat «vagonlar × 3 xodka × 105 t × ish sutkalari» deb hisoblanardi va yiliga ~58 mln t chiqardi.
        //  Muallif: korxona salohiyati yiliga 38–40 mln t (eng koʻpi 40), taʼmir hisobiga haqiqiy 37–40 atrofida.
        //  Bir tarkib (105 t li dumpkarlar) smenada 1,5–2, sutkada 3–4 xodka qiladi. Endi hisob salohiyatdan boshlanadi:
        //   • 38 mln t yilning kunlariga teng taqsimlanadi (1 kun = 38 mln / 365), oy — kunlari yigʻindisi;
        //     har kuni ishda boʻlgan vagonlar ulushi bilan (taʼmirdagi vagonlar ayiriladi) — shuning uchun
        //     har yil 40 dan biroz kam va bir xil emas (taʼmir koʻp yil — kamroq). 37 dan kam boʻlsa — ogohlantirish.
        //   • 1 xodka yuki va kunlik xodka soni ham shu meʼyordan kelib chiqadi (sahifada koʻrsatiladi).
        //   • Dispetcher kiritgan fakt va mashinist xodkasi — haqiqiy maʼlumot, oʻzgartirilmaydi.
        //   • Yillik meʼyor har yil uchun alohida oʻzgartiriladi (admin / rahbar / dispetcher).
        // =====================================================================
        const RU61: any = window as any;
        var RU61_KEY = 'agmk_sl_ruda61';
        try { if (typeof RU61.KV_SYNC !== 'undefined' && !RU61.KV_SYNC.keys.includes(RU61_KEY)) RU61.KV_SYNC.keys.push(RU61_KEY); } catch (e) { /* */ }
        var RU61_NORM = 38, RU61_MIN = 36, RU61_VSK = 13; // mln t / yil (muallif, 04.11 16:20): sof ruda salohiyati 38; pastki chegara 36 (taʼmir hisobiga); vskrysha (ustki boʻsh qatlam) → Nakpaysay 13
        function ru61Vsk(y: number): number { const v = +(ru61Yil()['v' + y]); return (v > 0 ? v : RU61_VSK) * 1e6; }
        function ru61Yil(): any { let d: any = null; try { d = RU61.kvGet(RU61_KEY, null); } catch (e) { /* */ } return d && typeof d === 'object' ? d : {}; }
        /** yil meʼyori (tonna) */
        function ru61Goal(y: number): number { const v = +ru61Yil()[y]; return (v > 0 ? v : RU61_NORM) * 1e6; }
        function ru61DaysIn(y: number): number { return (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 864e5; }
        function ru61K(y: number): number { const S = RU61.SLD; return S && S.k61 && S.k61[y] ? S.k61[y] : 1; }
        function ru61Fmt(t: number): string { return t >= 1e6 ? (t / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' mln t' : Math.round(t).toLocaleString('ru-RU') + ' t'; }
        function ru61Can(): boolean { try { return RU61.slCanEdit(); } catch (e) { return false; } }

        // salohiyat (barcha vagon ishlasa) = yillik meʼyor; tashilgan = meʼyor × ishda boʻlgan vagonlar ulushi
        if (typeof RU61.slBuild === 'function') RU61.slBuild = RU61.agmkExtend('slBuild', '6.1: ruda — yillik meʼyor 38 mln t', RU61.slBuild, (o: Function) => function (this: unknown) {
            const D = o.apply(this, arguments);
            try {
                D.k61 = {};
                const today = RU61.todayISO(), ty = +today.slice(0, 4);
                const ys = Array.from(new Set(D.months.map((m: string) => +m.slice(0, 4)))) as number[];
                ys.forEach(y => {
                    const ms = D.months.filter((m: string) => +m.slice(0, 4) === y);
                    let pot = 0; ms.forEach((m: string) => { Object.keys(D.ruda[m] || {}).forEach(t => { pot += D.ruda[m][t].pot || 0; }); });
                    const days = y < ty ? ru61DaysIn(y) : Math.round((Date.UTC(ty, +today.slice(5, 7) - 1, +today.slice(8, 10)) - Date.UTC(ty, 0, 1)) / 864e5) + 1;
                    const potFull = pot * ru61DaysIn(y) / Math.max(1, days);
                    D.k61[y] = potFull > 0 ? ru61Goal(y) / potFull : 1;
                    ms.forEach((m: string) => { Object.keys(D.ruda[m] || {}).forEach(t => { const R = D.ruda[m][t], k = D.k61[y]; R.tn *= k; R.x *= k; R.pot *= k; }); });
                });
            } catch (e) { console.error('6.1 ruda', e); }
            return D;
        });
        if (typeof RU61.slEstDay === 'function') RU61.slEstDay = RU61.agmkExtend('slEstDay', '6.1: ruda — yillik meʼyor 38 mln t', RU61.slEstDay, (o: Function) => function (this: unknown, i: number) {
            const v = o.apply(this, arguments); try { return v * ru61K(new Date(RU61.SLD.d0 + i * 864e5).getUTCFullYear()); } catch (e) { return v; }
        });
        if (typeof RU61.slDailyRuda === 'function') RU61.slDailyRuda = RU61.agmkExtend('slDailyRuda', '6.1: ruda — yillik meʼyor 38 mln t', RU61.slDailyRuda, (o: Function) => function (this: unknown) {
            const out = o.apply(this, arguments);
            try {
                const S = RU61.SLD, cur = RU61.todayISO().slice(0, 7), XD = (typeof RU61.xkAgg === 'function' ? RU61.xkAgg().d : {}) || {};
                for (let i = 0; i < out.length; i++) {
                    const iso = RU61.slDayISO(i), m = iso.slice(0, 7), src = RU61.slFSrc(m);
                    if (src === '' || (src === 'x' && !XD[iso]) || (src === 'q' && m >= cur)) out[i] *= ru61K(new Date(S.d0 + i * 864e5).getUTCFullYear());
                }
            } catch (e) { console.error('6.1 ruda kunlik', e); }
            return out;
        });

        /** meʼyorning kun / oy / xodka / vagon ulushi */
        function ru61Parts(y: number): any {
            const g = ru61Goal(y), din = ru61DaysIn(y), C = (() => { try { return RU61.pgCfg(); } catch (e) { return { ishYil: 315, t: {} }; } })();
            let nV = 0; try { nV = RU61.onlyVagons().filter((v: any) => (+RU61.pgTy(v).tn || 0) > 0).length; } catch (e) { /* */ }
            const T = (C.t || {})['Dumpkar 2VS-105'] || { x: 3, tn: 105 }, xd = nV * (+T.x || 0) * C.ishYil / 365; // kunlik xodkalar (meʼyor)
            return { g: g, day: g / din, mon: g / 12, nV: nV, vDay: nV ? g / din / nV : 0, tn: +T.tn || 105, xDay: g / din / (+T.tn || 105), xd: xd };
        }

        // ---------- sozlama ----------
        function ru61Open(): void {
            const ed = ru61Can(), Y = ru61Yil(), ty = +RU61.todayISO().slice(0, 4), E = RU61.escapeHtml;
            const ys: number[] = []; for (let y = ty - 2; y <= ty + 1; y++) ys.push(y);
            RU61.mdl('ru61M', `<div class="px-h"><b>⛰️ Korxona salohiyati (yillik, eng koʻpi)</b><button class="mini-btn" onclick="mdlClose('ru61M')">✕</button></div>
                <div class="nd-tip">Million tonnada — barcha dumpkarlar toʻliq ishlaganda bir yilda tashiladigan eng koʻp ruda. Shu raqam yilning kunlari va oylariga taqsimlanadi, taʼmirda turgan vagonlar ayiriladi — shuning uchun haqiqiy hajm odatda ${RU61_MIN}–${RU61_NORM} mln t chiqadi. Dispetcher fakti va mashinist xodkasi oʻzgarmaydi.${ed ? '' : '<br>Faqat administrator, rahbar yoki dispetcher oʻzgartiradi.'}</div>
                <table class="nar-t pg-ct"><tr><th>Yil</th><th>Sof ruda, mln t</th><th>1 kunga</th><th>1 oyga (oʻrtacha)</th><th>Vskrysha → Nakpaysay, mln t</th></tr>${ys.map(y => { const P = ru61Parts(y); return `<tr><td>${y}</td><td><input id="r61y${y}" type="number" inputmode="decimal" step="0.1" min="1" value="${E(String(+Y[y] > 0 ? +Y[y] : RU61_NORM))}"${ed ? '' : ' disabled'} style="width:90px;padding:6px;border-radius:8px"></td><td>${ru61Fmt(P.day)}</td><td>${ru61Fmt(P.mon)}</td><td><input id="r61v${y}" type="number" inputmode="decimal" step="0.1" min="0" value="${E(String(+Y['v' + y] > 0 ? +Y['v' + y] : RU61_VSK))}"${ed ? '' : ' disabled'} style="width:90px;padding:6px;border-radius:8px"></td></tr>`; }).join('')}</table>
                ${ed ? `<div class="nv-btns"><button onclick="ru61Save()">💾 Saqlash</button></div>` : ''}`, true);
        }
        function ru61Save(): void {
            if (!ru61Can()) return;
            const ty = +RU61.todayISO().slice(0, 4), cur: any = ru61Yil();
            for (let y = ty - 2; y <= ty + 1; y++) {
                const el = RU61.$id('r61y' + y); if (!el) continue; const v = parseFloat(String(el.value).replace(',', '.'));
                if (!isFinite(v) || v < 1 || v > 200) { RU61.alert(y + ': qiymat notoʻgʻri (1 … 200 mln t)'); return; }
                cur[y] = Math.round(v * 10) / 10;
                const ve = RU61.$id('r61v' + y); if (ve) { const vv = parseFloat(String(ve.value).replace(',', '.')); if (isFinite(vv) && vv >= 0 && vv <= 200) cur['v' + y] = Math.round(vv * 10) / 10; }
            }
            RU61.kvSet(RU61_KEY, cur); try { RU61.KV_SYNC.dirty = true; } catch (e) { /* */ }
            RU61.mdlClose('ru61M'); RU61.showToast('✅ Salohiyat saqlandi');
            try { RU61.SLD = RU61.slBuild(); RU61.slDraw(); } catch (e) { /* */ }
        }

        // ---------- «Ruda tashish» sahifasi: meʼyor kartochkasi va yangi izohlar ----------
        if (typeof RU61.slRuda === 'function') RU61.slRuda = RU61.agmkExtend('slRuda', '6.1: ruda — salohiyat kartochkasi', RU61.slRuda, (o: Function) => function (this: unknown) {
            let h = o.apply(this, arguments);
            try {
                const ty = +RU61.todayISO().slice(0, 4), y = RU61.SLF && RU61.SLF.per === 'oy' ? RU61.SLF.y : ty, P = ru61Parts(y);
                const S = RU61.SLD, ms = S.months.filter((m: string) => +m.slice(0, 4) === y);
                let tn = 0; ms.forEach((m: string) => { Object.keys(S.ruda[m] || {}).forEach(t => { tn += S.ruda[m][t].tn || 0; }); });
                const today = RU61.todayISO(), el = y < ty ? ru61DaysIn(y) : Math.round((Date.UTC(ty, +today.slice(5, 7) - 1, +today.slice(8, 10)) - Date.UTC(ty, 0, 1)) / 864e5) + 1;
                const full = tn * ru61DaysIn(y) / Math.max(1, el), low = full < RU61_MIN * 1e6;
                const info = `<div class="r61-b"><div><b>⛰️ Sof ruda salohiyati ${y}: ${ru61Fmt(P.g)} <i>(→ KKD, eng koʻpi)</i></b>
                    <div class="r61-g"><span><small>1 oyga</small>${ru61Fmt(P.mon)}</span><span><small>1 kunga</small>${ru61Fmt(P.day)}</span><span><small>kuniga dumpkar reysi (${P.tn} t)</small>≈ ${Math.round(P.xDay).toLocaleString('ru-RU')} ta</span>
                    <span class="${low ? 'lo' : 'okk'}"><small>${y === ty ? 'yil oxiriga (taʼmir ayirilgan)' : 'tashilgan (taʼmir ayirilgan)'}</small>${ru61Fmt(full)}</span></div>
                    <small>Fakt kiritilmagan kunlar: kunlik salohiyat × ishda boʻlgan vagonlar ulushi (taʼmirdagilar ayiriladi). Odatdagi oraliq — ${RU61_MIN}–${RU61_NORM} mln t. Bir tarkib sutkada 3–4 xodka qiladi.${y === ty ? ' Joriy yil — bugungacha boʻlgan qismi.' : ''}</small>
                    <div class="r61-v">⛰ <b>Vskrysha (ustki boʻsh qatlam) → Nakpaysay: ${ru61Fmt(ru61Vsk(y))}</b> / yil · oyiga ${ru61Fmt(ru61Vsk(y) / 12)} · kuniga ${ru61Fmt(ru61Vsk(y) / ru61DaysIn(y))} · <b>jami tashish: ${ru61Fmt(P.g + ru61Vsk(y))}</b></div>
                    ${low ? `<div class="r61-w">⚠️ ${ru61Fmt(full)} — ${RU61_MIN} mln t dan kam: taʼmirda turgan vagonlar koʻp. «Vagon taʼmiri» boʻlimida sababini koʻring.</div>` : ''}</div><button onclick="ru61Open()">${ru61Can() ? '✏️ Oʻzgartirish' : 'ⓘ Koʻrish'}</button></div>`;
                h = h.replace('<div class="sl-kpi">', info + '<div class="sl-kpi">');
                // eski «meʼyor = vagon × 3 xodka × 105 t» izohlari — yangi hisobga
                h = h.replace(/Hozircha raqamlar meʼyor boʻyicha hisob:[^.]*\. *([^.]*shuning uchun oylar deyarli bir xil chiqadi[^.]*\.)?/, 'Hozircha raqamlar korxona salohiyati (' + ru61Fmt(P.g) + ') boʻyicha: kunlarga taqsimlangan, taʼmirdagi vagonlar ayirilgan — shuning uchun oylar deyarli bir xil. ');
                h = h.replace(/<div class="sl-f">Hisob \(fakt boʻlmagan oy\):[\s\S]*?Mashinistlar xodka kiritgan oy/, `<div class="sl-f">Hisob (fakt boʻlmagan oy): <b>yillik salohiyat</b> ${ru61Fmt(P.g)} ÷ ${ru61DaysIn(y)} kun = <b>${ru61Fmt(P.day)}</b> kuniga, ishda boʻlgan vagonlar ulushiga koʻpaytiriladi. Mashinistlar xodka kiritgan oy`);
                h = h.replace('Xodka va yuk — meʼyor boʻyicha (sozlamada).', 'Ruda hajmi — korxona salohiyati boʻyicha, taʼmir ayirilgan (⛰️ kartochkada oʻzgartiriladi).');
                h = h.replace(/\((\d+) t\)<\/span>/g, '</span>'); // legend: «(105 t)» — endi kerak emas
            } catch (e) { console.error('6.1 ruda html', e); }
            return h;
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v61rudaCss';
            st.textContent = `.r61-b{display:flex;align-items:center;gap:12px;padding:12px 14px;margin:10px 0;border-radius:14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.35)}
            .r61-b>div{flex:1}.r61-b b{display:block;color:#e2e8f0;font-size:15px}.r61-b>div>small{color:#94a3b8;font-size:12.5px;line-height:1.45}
            .r61-g{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.r61-g span{padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-weight:700;color:#f1f5f9;font-size:14px}
            .r61-g span.okk{border-color:rgba(34,197,94,.45);color:#86efac}.r61-g span.lo{border-color:rgba(239,68,68,.5);color:#fca5a5}.r61-b b i{font-style:normal;font-weight:400;color:#94a3b8;font-size:13px}
            .r61-v{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(234,179,8,.1);border:1px solid rgba(234,179,8,.4);color:#fde68a;font-size:13px}.r61-w{margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);color:#fecaca;font-size:13px}
            .r61-g small{display:block;font-weight:400;color:#94a3b8;font-size:11px}
            .r61-b button{flex:0 0 auto;padding:8px 12px;border-radius:10px;border:1px solid rgba(96,165,250,.5);background:rgba(37,99,235,.35);color:#fff;font-weight:600;cursor:pointer}`;
            document.head.appendChild(st);
        })();
        Object.assign(RU61, { ru61Open: ru61Open, ru61Save: ru61Save, ru61Yil: ru61Yil, ru61Parts: ru61Parts });
