        // =====================================================================
        // v3.16.5 — vagon guruhlari va 2ВС-105 (Q-115) muddati
        //  • «Dumpkar 105» va «Dumpkar 115» → bitta «Dumpkar 2VS-105» guruhi; 115 lar pasportda «Dumpkar 2VS-105 (Q-115)»
        //  • «Dumpkar 60» → «Dumpkar 6VS-60», «Cisterna» → «Sisterna»
        //  • Q-115 depo taʼmiri 2 yilda bir marta (24 oy) — «muddati oʻtgan / yaqin» shunga koʻra hisoblanadi
        //  • Taʼmir grafigida «📋 Yillik rejani taqsimlash»: reja soni (masalan 60) boʻyicha vagonlar oylarga joylanadi
        //    (avval muddati shu yil tugaydiganlar, keyin zaxira oʻrinlarga — zamechaniyasi borlar va muddati yaqinlar)
        // =====================================================================

        /** Vagon (pasport) — eski kodda turlanmagan obyekt; bu modulda ishlatiladigan maydonlar */
        interface VrVagon { id: number | string; type?: string; naim?: string; inv?: string | number; tamirSanasi?: string; keyingi?: string; drAuto?: boolean; zams?: Array<{ done?: boolean; closed?: boolean; status?: string }>; vrPlan?: VrPlanMark; q115?: boolean; kind?: string }
        interface VrPlanMark { year: number; m: string; from: string; why: string; at: string; by: string }
        interface VrRow { v: VrVagon; no: string; due: string; dr: string; z: number; must: boolean; m?: string; why?: string; late?: boolean }
        interface VrResult { grp: string; year: number; N: number; total: number; must: number; take: VrRow[]; left: number; byM: Record<string, number>; months: string[] }
        interface VrGroup { t: string; f: (v: VrVagon) => boolean }
        const vrWin = window as any; // eski global funksiyalarni kengaytirish (agmkExtend) uchun
        /** Eski koddagi vagonlar roʻyxati turlanmagan — shu chegarada aniq turga keltiriladi */
        function vrVagons(): VrVagon[] { return onlyVagons() as unknown as VrVagon[]; }

        // ---------- 1. Saqlangan maʼlumotni bir marta yangilash (bazadagi va sinxrondan kelgan vagonlar) ----------
        function v3165Migrate(): number {
            let n = 0;
            try {
                (vagonlarData || []).forEach(v => { if (vTypeNorm(v)) { n++; try { recalcVagonStatus(v); } catch (e) { } } });
                const M = getDrMonths(); let ch = false; // DR davriyligi sozlamasi — eski nomlar boʻyicha kiritilgan boʻlsa
                Object.keys(VTYPE_REN).forEach(k => { if (M[k] !== undefined) { if (k !== 'Dumpkar 115' && M[VTYPE_REN[k]] === undefined) M[VTYPE_REN[k]] = M[k]; delete M[k]; ch = true; } });
                if (ch) localStorage.setItem(DR_MONTHS_KEY, JSON.stringify(M));
                if (typeof activeTypeFilter !== 'undefined' && VTYPE_REN[activeTypeFilter]) activeTypeFilter = VTYPE_REN[activeTypeFilter];
                if (n) { saveDB(false); console.log('v3.16.5: ' + n + ' ta vagon guruhi yangilandi'); }
            } catch (e) { console.error('v3.16.5 migratsiya', e); }
            return n;
        }
        if (typeof loadDB === 'function') vrWin.loadDB = agmkExtend('loadDB', 'v3.16.5: vagon guruhlari', loadDB, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); v3165Migrate(); return r; });

        // ---------- 2. Yillik rejani taqsimlash ----------
        var VR: { grp: string; year: number; n: number; plan: VrResult | null } = { grp: 'q115', year: 0, n: 0, plan: null };
        var VR_GRP: Record<string, VrGroup> = {
            q115: { t: 'Dumpkar 2VS-105 (Q-115)', f: v => /2VS-105/.test(v.type) && isQ115(v) },
            d105: { t: 'Dumpkar 2VS-105 (Q-115 siz)', f: v => /2VS-105/.test(v.type) && !isQ115(v) },
            d105all: { t: 'Dumpkar 2VS-105 (hammasi)', f: v => /2VS-105/.test(v.type) },
            d60: { t: 'Dumpkar 6VS-60', f: v => /6VS-60/.test(v.type) },
            cis: { t: 'Sisterna', f: v => v.type === 'Sisterna' },
            plat: { t: 'Platforma', f: v => v.type === 'Platforma' },
            hop: { t: 'Xopper', f: v => v.type === 'Xopper' }
        };
        function vrDue(v: VrVagon): string { // tabiiy muddat (oxirgi DR + davriylik); v4.3: probeg (km) boʻyicha oldinroq tugasa — oʻsha sana
            const lr = typeof vrWin.agmkLastRep === 'function' ? vrWin.agmkLastRep(v) : { d: v.tamirSanasi || '' }; // 4.8: DR/KR kechrogʻi
            const t = lr.d ? addMonthsISO(lr.d, vDrMonths(v)) : (v.keyingi || '');
            const p: string = typeof vrWin.pgDueISO === 'function' ? vrWin.pgDueISO(v) : '';
            return p && (!t || p < t) ? p : t;
        }
        function vrOpenZams(v: VrVagon): number { return (v.zams || []).filter(z => z && !z.done && !z.closed && z.status !== 'done').length; }
        function vrDefaultYear(): number { const t = new Date(); return t.getMonth() >= 9 ? t.getFullYear() + 1 : t.getFullYear(); }
        function vrBuild(grp: string, year: number, N: number): VrResult {
            const G = VR_GRP[grp], ys = String(year), yEnd = ys + '-12-31', cur = pprCurM();
            const all: VrVagon[] = vrVagons().filter(v => G.f(v) && !(typeof vtStage === 'function' && vtStage(v)));
            const rows: VrRow[] = all.map(v => { const due = vrDue(v); return { v: v, no: vagonNo(v), due: due, dr: v.tamirSanasi || '', z: vrOpenZams(v), must: !due || due <= yEnd }; });
            const must = rows.filter(r => r.must).sort((a, b) => String(a.due || '0').localeCompare(String(b.due || '0')));
            const opt = rows.filter(r => !r.must).sort((a, b) => b.z - a.z || a.due.localeCompare(b.due));
            const take = must.concat(opt).slice(0, Math.max(0, N));
            // oylar: joriy yil boʻlsa — joriy oydan. Har oyga teng ulush, lekin muddati shu oyda tugaydigan vagon
            // kechiktirilmaydi: kerak boʻlsa oʻsha oyga qoʻshimcha qoʻyiladi (muddat boʻyicha navbat — EDF).
            const months = Array.from({ length: 12 }, (_, k) => ys + '-' + String(k + 1).padStart(2, '0')).filter(m => m >= (ys === cur.slice(0, 4) ? cur : ys + '-01'));
            const q = Math.floor(take.length / months.length), rem = take.length % months.length;
            const queue = take.slice().sort((a, b) => (a.must === b.must ? 0 : a.must ? -1 : 1) || String(a.due || '0').localeCompare(String(b.due || '0')));
            let left = take.length;
            months.forEach((m, k) => {
                if (!left) return;
                const cap = q + (k < rem ? 1 : 0), firstM = months[0];
                const pick: VrRow[] = queue.filter(r => !r.m).slice(0, cap);
                // muddati shu oyda (yoki oldinroq, lekin yil ichida) tugaydigan, hali joylanmaganlar — majburan shu oyga
                queue.forEach(r => { if (!r.m && r.due && r.due.slice(0, 7) >= firstM && r.due.slice(0, 7) <= m && !pick.includes(r)) pick.push(r); });
                pick.slice(0, left).forEach(r => { r.m = m; });
                left -= Math.min(pick.length, left);
            });
            take.forEach(r => { r.why = !r.due ? 'DR sanasi yoʻq' : r.due < ys + '-01-01' ? 'muddati oʻtgan' : r.must ? 'muddati shu yil' : r.z ? 'zaxira: zamechaniya bor (' + r.z + ')' : 'zaxira: muddati keyingi yil'; r.late = !!(r.due && r.m && r.m > r.due.slice(0, 7)); });
            take.sort((a, b) => String(a.m || '9').localeCompare(String(b.m || '9')) || String(a.due || '0').localeCompare(String(b.due || '0')));
            const byM: Record<string, number> = {}; take.forEach(r => { byM[r.m] = (byM[r.m] || 0) + 1; });
            return { grp: grp, year: year, N: N, total: all.length, must: must.length, take: take, left: rows.length - take.length, byM: byM, months: months };
        }
        function vrOpen(): void {
            if (!VR.year) VR.year = vrDefaultYear();
            const cnt = (k: string): number => vrVagons().filter(VR_GRP[k].f).length;
            if (!VR.n) VR.n = VR.grp === 'q115' ? 60 : cnt(VR.grp);
            const E = escapeHtml, P = vrBuild(VR.grp, VR.year, VR.n); VR.plan = P;
            const interval = VR.grp === 'q115' ? 24 : VR.grp === 'd105all' ? null : 12;
            const need = interval ? Math.ceil(P.total * 12 / interval) : null;
            const warn = P.must > VR.n ? `<div class="vr-warn">⚠️ Muddati ${VR.year}-yilda tugaydigan vagonlar — <b>${P.must}</b> ta, rejada esa <b>${VR.n}</b> ta. ${P.must - VR.n} ta vagon muddatidan kechikadi.</div>`
                : `<div class="vr-ok">✅ Majburiy (muddati ${VR.year}-yilda tugaydigan) — <b>${P.must}</b> ta. Zaxira oʻrinlar — <b>${VR.n - P.must}</b> ta (muddatidan oldin taʼmirlanadi).</div>`;
            const mon = P.months.map(m => `<div class="vr-m"><b>${E(VT_MON[+m.slice(5, 7) - 1].slice(0, 3))}</b><span>${P.byM[m] || 0}</span></div>`).join('');
            const tr = P.take.map((r, i) => `<tr class="${r.late ? 'vr-late' : ''}"><td>${i + 1}</td><td><b>${E(r.no)}</b></td><td>${E(fmtISO(r.dr) || '—')}</td><td>${E(fmtISO(r.due) || '—')}</td><td>${E(pprMName(r.m || ''))}</td><td>${E(r.why)}${r.late ? ' ⚠️' : ''}</td></tr>`).join('');
            mdl('vrPlan', `<div class="px-h"><b>📋 Yillik rejani taqsimlash</b><button class="mini-btn" onclick="mdlClose('vrPlan')">✕</button></div>
                <div class="vr-f"><label>Guruh<select onchange="VR.grp=this.value; VR.n=0; vrOpen()">${Object.keys(VR_GRP).map(k => `<option value="${k}" ${k === VR.grp ? 'selected' : ''}>${E(VR_GRP[k].t)} — ${cnt(k)} ta</option>`).join('')}</select></label>
                <label>Yil<select onchange="VR.year=+this.value; vrOpen()">${[0, 1, 2].map(k => new Date().getFullYear() + k).map(y => `<option ${y === VR.year ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
                <label>Rejadagi soni<input type="number" min="0" max="2000" value="${VR.n}" onchange="VR.n=Math.max(0, +this.value || 0); vrOpen()"></label></div>
                <div class="nd-tip">Jami vagon: <b>${P.total}</b>${need !== null ? ` · DR davriyligi ${interval} oy — yiliga kamida <b>${need}</b> ta taʼmir kerak` : ''}. Tartib: 1) muddati oʻtgan va shu yil tugaydiganlar (muddat tartibida); 2) zaxira oʻrinlarga — zamechaniyasi borlar, keyin muddati eng yaqinlar. Har oyga teng ulush.</div>
                ${warn}<div class="vr-ms">${mon}</div>
                <div class="gt-scroll" style="overflow-x:auto;max-height:46vh"><table class="nar-t vr-t"><tr><th>#</th><th>Vagon</th><th>Oxirgi DR</th><th>Muddat</th><th>Rejada</th><th>Sabab</th></tr>${tr || '<tr><td colspan="6">Vagon yoʻq</td></tr>'}</table></div>
                ${P.left ? `<div class="nd-tip">Rejaga kirmagan: ${P.left} ta (muddati keyingi yillarda).</div>` : ''}
                <div class="nv-btns"><button onclick="vrXlsx()">📊 Excel</button><button class="pr" onclick="vrApply()">✅ Tasdiqlash — pasportlarga yozish</button></div>`, true);
        }
        async function vrApply(): Promise<void> {
            const P = VR.plan; if (!P || !P.take.length) return;
            if (!(await uiConfirm(`${P.take.length} ta vagonning «Keyingi taʼmir sanasi» ${P.year}-yil rejasi boʻyicha oʻzgartirilsinmi?\n\nGrafik shu oylar boʻyicha tuziladi. Vagon taʼmirdan chiqqach, keyingi sana yana avtomatik hisoblanadi.`))) return;
            const at = new Date().toISOString(), by = vtWho(), L = kvGet(VG_LOG, []) || [];
            P.take.forEach(r => {
                const v = r.v, m = r.m || '', day = r.due && r.due.slice(0, 7) === m ? r.due.slice(8, 10) : '15';
                v.vrPlan = { year: P.year, m: m, from: String(v.keyingi || '').slice(0, 10), why: r.why || '', at: at, by: by };
                v.keyingi = m + '-' + day; v.drAuto = false;
                try { recalcVagonStatus(v); } catch (e) { }
            });
            L.push({ at: at, by: by, a: `📋 ${VR_GRP[P.grp].t}: ${P.year}-yil rejasi — ${P.take.length} ta vagon oylarga taqsimlandi` }); kvSet(VG_LOG, L.slice(-300));
            saveDB(undefined); try { filterVagonlar(undefined); } catch (e) { } try { (VG as any).stale = true; } catch (e) { }
            mdlClose('vrPlan'); showToast('📋 ' + P.take.length + ' ta vagon rejaga joylandi'); try { const pm = $id('pprModal'); if (pm && !pm.classList.contains('hidden')) vrWin.pprOpen(); } catch (e) { }
        }
        function vrXlsx(): void {
            const P = VR.plan; if (!P) return;
            const rows: Array<Array<string | number>> = [[VR_GRP[P.grp].t + ' — ' + P.year + '-yil taʼmir rejasi (' + P.take.length + ' ta)'], ['Jami ' + P.total + ' ta, majburiy ' + P.must + ' ta'], ['#', 'Vagon', 'Inventar', 'Oxirgi DR', 'Muddat', 'Rejadagi oy', 'Sabab']];
            P.take.forEach((r, i) => rows.push([i + 1, r.no, String(r.v.inv || ''), fmtISO(r.dr), fmtISO(r.due), pprMName(r.m || ''), r.why || '']));
            docDownload([{ name: 'Reja_' + P.grp + '_' + P.year + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: fotXlsxBook([{ name: String(P.year), rows: rows, head: 2, w: [5, 12, 10, 12, 12, 16, 34] }]) }]);
        }
        // Grafik oynasida tugma
        if (typeof pprOpen === 'function') vrWin.pprOpen = agmkExtend('pprOpen', 'v3.16.5: rejani taqsimlash', pprOpen, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const r = o.apply(this, a);
            try { const b = document.querySelector('#pprModal .vg-mode'); if (b && VG.on && !b.querySelector('.vr-btn')) b.insertAdjacentHTML('beforeend', '<button class="vr-btn" onclick="VR.n=0; vrOpen()">📋 Rejani taqsimlash</button>'); } catch (e) { console.error(e); }
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = `.vr-f{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0}.vr-f label{flex:1;min-width:120px;font-size:12px;color:#94a3b8;display:flex;flex-direction:column;gap:3px}
            .vr-f select,.vr-f input{padding:8px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e2e8f0}
            .vr-warn{background:rgba(249,115,22,.14);border:1px solid #f97316;color:#fdba74;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}
            .vr-ok{background:rgba(34,197,94,.12);border:1px solid #22c55e;color:#86efac;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}
            .vr-ms{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:6px 0}.vr-m{background:rgba(15,23,42,.7);border:1px solid #334155;border-radius:8px;text-align:center;padding:4px;font-size:11px;color:#94a3b8}.vr-m span{display:block;font-size:15px;color:#e2e8f0;font-weight:700}
            .vr-t td,.vr-t th{font-size:12px;padding:4px 6px;white-space:nowrap}.vr-late td{color:#fdba74}`; document.head.appendChild(st); })();
