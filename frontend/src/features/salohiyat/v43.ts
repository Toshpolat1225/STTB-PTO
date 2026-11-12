        // =====================================================================
        // v4.3 / v4.4 — 🛤 VAGON TAʼMIR GRAFIGI (probeg) va 🏭 ISHLAB CHIQARISH KOʻRSATKICHLARI
        //  VAGONLAR PARKI (MTTB kabi): 1) Vagon taʼmir grafigi  2) Vagonlar parki — bosh sahifadan ham, «STTB texnikalari» dan ham.
        //  TAʼMIR GRAFIGI: «DR boʻyicha» — faqat DR dan keyingi km chizigʻi va tartibi; «KR boʻyicha» — faqat KR.
        //    Ikkinchisi — chiziq emas, kichik yozuv. Eng koʻp yurgan — toʻliq uzunlik, qolganlari unga nisbatan qisqaradi.
        //    DR — muddat (pasportdagi «keyingi» sana, 1 yil) boʻyicha; RD VNIIZhT 27.05.01-2017: «110 ming km yoki 1 yil».
        //    KR — muddat boʻyicha EMAS, NAVBAT boʻyicha (oʻrtacha 12–14 yil, yiliga ~36 ta) — «oʻtgan / 7 yil / 120 ming» belgilari yoʻq.
        //  KM QAYERDAN (v4.4, integratsiya): mashinist kiritgan xodkalar (GPS boʻlsa — GPS) → tarkibdagi har vagonga (v44.ts).
        //    Integratsiyagacha boʻlgan davr — meʼyoriy hisob: 3 xodka × 30,27 km × 315 ish sutka / 365.
        //    Karyer (ЭКГ) → KKD ≈ 15 134 m (sxema piketlari, PK 0 «Qolmaqir»), Nakpaysay ≈ 13 290 m.
        // =====================================================================
        const PG: any = window as any;
        var PG_CFG_KEY = 'agmk_pg_cfg';
        try { if (typeof PG.KV_SYNC !== 'undefined' && !PG.KV_SYNC.keys.includes(PG_CFG_KEY)) PG.KV_SYNC.keys.push(PG_CFG_KEY); } catch (e) { /* */ }
        var PG_TYPES: string[] = ['Dumpkar 2VS-105', 'Dumpkar 6VS-60', 'Sisterna', 'Platforma', 'Xopper'];
        var PG_DEF: any = {
            drKm: 110000, ishYil: 315, kkdKm: 15.134, nakKm: 13.29, motorN: 2, motorT: 50,
            t: { 'Dumpkar 2VS-105': { x: 3, km: 30.27, tn: 105 }, 'Dumpkar 6VS-60': { x: 1, km: 20, tn: 0 }, Sisterna: { x: 1, km: 20, tn: 0 }, Platforma: { x: 1, km: 20, tn: 0 }, Xopper: { x: 1, km: 20, tn: 0 } }
        };
        function pgCfg(): any {
            let c: any = null; try { c = PG.kvGet(PG_CFG_KEY, null); } catch (e) { /* */ }
            const o: any = JSON.parse(JSON.stringify(PG_DEF)); if (!c || typeof c !== 'object' || (+c.v !== 44 && +c.v !== 45)) return o; // 4.3 dagi eski meʼyorlar (18 000 km, 20 km) qoʻllanmaydi
            ['drKm', 'ishYil', 'kkdKm', 'nakKm', 'motorN', 'motorT'].forEach(k => { if (+c[k] >= 0 && c[k] !== '' && c[k] != null) o[k] = +c[k]; });
            if (c.t) Object.keys(c.t).forEach(k => { if (+c.v === 44 && k === 'Dumpkar 6VS-60') return; o.t[k] = Object.assign({}, o.t[k] || { x: 1, km: 20, tn: 0 }, c.t[k]); }); // 4.4 da 6VS-60 xodka bilan edi — endi naryad
            Object.keys(o.t).forEach(k => { if (!/2VS-105/.test(k)) o.t[k].tn = 0; }); // ruda va xodka — faqat 2VS-105
            return o;
        }
        function pgTy(v: any): any { const C = pgCfg(), t = String(v.type || ''); return C.t[t] || (/2VS-105/.test(t) ? C.t['Dumpkar 2VS-105'] : /6VS-60/.test(t) ? C.t['Dumpkar 6VS-60'] : { x: 1, km: 20, tn: 0 }); }
        function pgGrp(t: string): string { t = String(t || ''); return PG_TYPES.includes(t) ? t : /2VS-105/.test(t) ? 'Dumpkar 2VS-105' : /6VS-60/.test(t) ? 'Dumpkar 6VS-60' : 'Boshqa'; } // 2VS-105 va 6VS-60 — doim alohida

        // ---------- sana yordamchilari ----------
        var PG_DAY = 864e5, PG_MD = 30.437;
        function pgT(s: string): number { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; }
        function pgISO(t: number): string { return new Date(t).toISOString().slice(0, 10); }
        function pgToday(): string { return PG.todayISO(); }
        function pgFd(s: string): string { return s ? PG.fmtISO(String(s).slice(0, 10)) : '—'; }
        function pgMing(x: number): string { return (x / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 }); }
        function pgN(x: number): string { return Math.round(x).toLocaleString('ru-RU'); }
        var PG_MON = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

        // ---------- taʼmirda turgan davrlar (polojeniya / pasport tarixi) ----------
        var PG_IV: Map<any, [number, number][]> = new Map();
        function pgIv(v: any): [number, number][] {
            if (PG_IV.has(v.id)) return PG_IV.get(v.id);
            const R: [number, number][] = [], now = pgT(pgToday()); let s: number = NaN;
            try {
                (typeof PG.polEv === 'function' ? PG.polEv(v) : []).forEach((e: any) => {
                    const t = pgT(e.d); if (isNaN(t)) return;
                    if (e.k === 'in') { if (isNaN(s)) s = t; } else if (e.k === 'out' && !isNaN(s)) { if (t > s) R.push([s, t]); s = NaN; }
                });
            } catch (e) { /* */ }
            if (v.status === 'Tamirda') { if (!isNaN(s)) R.push([s, now]); else { const p = pgT(PG.polD ? PG.polD((v.pol || {}).since || '') : ''); if (!isNaN(p) && p < now) R.push([p, now]); } }
            PG_IV.set(v.id, R); return R;
        }
        /** [a, b) oraligʻida taʼmirda boʻlgan kunlar */
        function pgRep(v: any, a: number, b: number): number { let n = 0; pgIv(v).forEach(([s, e]) => { const x = Math.max(a, s), y = Math.min(b, e); if (y > x) n += (y - x) / PG_DAY; }); return n; }
        /** meʼyoriy: kalendar kuniga oʻrtacha km = xodka/sutka × xodka km × ish sutkasi (yiliga 315) / 365 */
        function pgRate(v: any): number { const T = pgTy(v), C = pgCfg(); return (+T.x || 0) * (+T.km || 0) * C.ishYil / 365; }
        /** iso dan bugungacha: integratsiyadan oldin — meʼyoriy, keyin — haqiqiy (v44: mashinist xodkalari) */
        function pgKmSince(v: any, iso: string): number | null {
            if (typeof PG.vgKmSince === 'function') { const r = PG.vgKmSince(v, iso); return r ? r.jami : null; }
            const a = pgT(iso), b = pgT(pgToday()); if (isNaN(a)) return null; if (a >= b) return 0; return Math.max(0, (b - a) / PG_DAY - pgRep(v, a, b)) * pgRate(v);
        }

        // ---------- har vagon hisobi ----------
        function pgCalc(v: any): any {
            const C = pgCfg(), now = pgT(pgToday()), r = pgRate(v), x: any = { v: v, no: PG.vagonNo(v), rate: r };
            const lrD = typeof PG.agmkLastRep === 'function' ? PG.agmkLastRep(v).d : (v.tamirSanasi || ''); // 4.8: DR yoki KR (kechrogʻi) dan beri km
            x.kD = lrD ? pgKmSince(v, lrD) : null;
            x.kK = v.kr ? pgKmSince(v, v.kr) : null;
            x.yK = v.kr ? (now - pgT(v.kr)) / PG_DAY / 365.25 : null;               // KR dan beri yil
            const kj = pgT(String(v.keyingi || '')); x.dD = isNaN(kj) ? null : Math.round((kj - now) / PG_DAY); // DR muddatigacha kun
            if (r > 0 && x.kD != null) x.dueD = pgISO(now + (C.drKm - x.kD) / r * PG_DAY); // DR km meʼyori (110 ming) — odatda muddatdan keyin
            return x;
        }
        /** Oylik reja uchun: probeg (km meʼyori) pasportdagi muddatdan OLDIN tugasa — {m, rt, note, km}; aks holda null. KR — navbat boʻyicha (bu yerda emas) */
        function pgDue(v: any): any {
            try {
                const x = pgCalc(v), C = pgCfg(), plan = String(v.keyingi || '').slice(0, 7);
                if (x.dueD && (!plan || x.dueD.slice(0, 7) < plan)) return { m: x.dueD.slice(0, 7), rt: 'DR', km: x.kD, note: '🛤 probeg (' + pgMing(C.drKm) + 'k)' };
            } catch (e) { /* */ }
            return null;
        }
        /** Yillik rejani taqsimlash uchun: DR muddati probeg boʻyicha (ISO) */
        function pgDueISO(v: any): string { try { const x = pgCalc(v); return x.dueD || ''; } catch (e) { return ''; } }
        function pgKmOf(v: any): number { try { const x = pgCalc(v); return Math.max(x.kD || 0, 0); } catch (e) { return 0; } }
        function pgReset(): void { PG_IV = new Map(); try { if (typeof PG.xkReset === 'function') PG.xkReset(); } catch (e) { /* */ } }
        if (typeof PG.saveDB === 'function') PG.saveDB = PG.agmkExtend('saveDB', 'v4.3: probeg keshi', PG.saveDB, (o: Function) => function (this: unknown, ...a: unknown[]) { pgReset(); return o.apply(this, a); });

        // =====================================================================
        // 1) VAGONLAR PARKI: 2 ta boʻlim (MTTB kabi)
        // =====================================================================
        var VGM: any = { from: 'screen-main' };
        function vgmOpen(from?: string): void {
            if (from) VGM.from = from;
            PG.secScreen('screen-vagmenu', 'Vagonlar parki', 'vgmBack()'); const b = PG.secBody('screen-vagmenu');
            const V = PG.onlyVagons(), today = pgToday(), late = V.filter((v: any) => v.status !== 'Tamirda' && v.keyingi && String(v.keyingi) < today).length;
            const I = PG.MK_IMG || {}, ic = (k: string, e: string) => I[k] ? `<span class="btn-icon mk-ic"><img src="${I[k]}" alt=""></span>` : `<span class="btn-icon">${e}</span>`;
            b.innerHTML = `<div class="card-list mn-inner">
                <div class="btn-card" onclick="pgOpen()"><div class="btn-card-content">${ic('vgraf', '🛤')}<span class="btn-text">Vagon taʼmir grafigi <small class="mn-cnt">${late} ta DR muddati oʻtgan</small></span></div><span class="btn-arrow">›</span></div>
                <div class="btn-card" onclick="vgmPark()"><div class="btn-card-content">${ic('vag', '🚃')}<span class="btn-text">Vagonlar parki <small class="mn-cnt">${V.length} ta</small></span></div><span class="btn-arrow">›</span></div>
                <div class="btn-card" onclick="slVIch()"><div class="btn-card-content">${ic('vich', '🚃')}<span class="btn-text">Vagon ishlab chiqarish <small class="mn-cnt">2027 yildan</small></span></div><span class="btn-arrow">›</span></div>
            </div>`;
            PG.openScreen('screen-vagmenu');
        }
        function vgmBack(): void { const f = VGM.from && PG.$id(VGM.from) ? VGM.from : 'screen-main'; PG.openScreen(f); }
        function vgmPark(): void { VGM.park = true; PG.openScreen('screen-vagonlar'); VGM.park = false; }
        // «Vagonlar parki» kartasi (bosh sahifa yoki «STTB texnikalari» ichida) — avval shu menyu. Karta, qidiruv va menyu tartibi oʻzgarmaydi
        document.addEventListener('click', (e: any) => {
            try {
                const c = e.target && e.target.closest && e.target.closest('.btn-card'); if (!c || c.closest('#screen-vagmenu')) return;
                if (!/^openScreen\('screen-vagonlar'\)/.test(c.getAttribute('onclick') || '')) return;
                const sc = c.closest('.screen'); e.stopPropagation(); e.preventDefault(); vgmOpen(sc && sc.id ? sc.id : 'screen-main');
            } catch (er) { /* */ }
        }, true);
        // Vagonlar roʻyxatidan «Orqaga» — tanlov oynasiga
        (function () { try { const bb: any = document.querySelector('#screen-vagonlar .inner-header .back-btn'); if (bb) bb.setAttribute('onclick', "vgmOpen()"); } catch (e) { /* */ } })();

        // Dalolatnoma boʻlimidagi «Taʼmir grafigi (PPR)» kartasi — Vagonlar → Taʼmir grafigiga koʻchdi
        if (typeof PG.hsRender === 'function') PG.hsRender = PG.agmkExtend('hsRender', 'v4.3: grafik vagonlar boʻlimida', PG.hsRender, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const r = o.apply(this, a);
            try { document.querySelectorAll('#screen-hisob .hs-card').forEach((c: any) => { if (/^pprOpen\(\)/.test(c.getAttribute('onclick') || '')) c.remove(); }); } catch (e) { /* */ }
            return r;
        });

        // =====================================================================
        // 2) 🛤 VAGON TAʼMIR GRAFIGI
        // =====================================================================
        var PGF: any = { m: 'dr', t: 'all', st: 'all', seh: 'all', h: 'all', q: '', lim: 60 };
        var PGR: any[] = [];
        function pgOpen(): void {
            PG.secScreen('screen-probeg', 'Vagon taʼmir grafigi', 'vgmOpen()');
            pgReset(); PGR = PG.onlyVagons().map(pgCalc); PGF.lim = 60;
            PG.openScreen('screen-probeg'); pgDraw();
        }
        /** grafikdagi tur tugmasi: dumpkarlar — alohida (2VS-105 va 6VS-60 aralashmaydi), qolganlari — guruh */
        function pgTk(t: string): string { t = String(t || ''); return /^Dumpkar/.test(t) ? t : pgGrp(t); }
        function pgBase(): any[] { return PGR.filter(x => (PGF.t === 'all' || pgTk(x.v.type) === PGF.t) && (PGF.seh === 'all' || pgSeh(x.v) === PGF.seh) && (!PGF.q || String(x.no).includes(PGF.q))); }
        function pgSeh(v: any): string { return String(v.seh || '').split('/')[0] || '—'; }
        function pgKey(): string { return PGF.m === 'dr' ? 'kD' : 'kK'; }
        /** DR holati — muddat boʻyicha (pasportdagi «keyingi»): x — oʻtgan, w — 30 kun ichida, o — normada */
        function pgDS(x: any): string { if (x.v.status === 'Tamirda') return 'rep'; if (x.dD == null) return 'n'; return x.dD < 0 ? 'x' : x.dD <= 30 ? 'w' : 'o'; }
        function pgHol(x: any, h: string): boolean {
            if (h === 'all') return true; if (h === 'rep') return x.v.status === 'Tamirda';
            if (PGF.m === 'kr') return h === 'n' ? x.kK == null : true;
            if (h === 'n') return x.kD == null; return pgDS(x) === h;
        }
        function pgSel(): any[] { const k = pgKey(); return pgBase().filter(x => pgHol(x, PGF.h)).sort((a, b) => (b[k] == null ? -1 : b[k]) - (a[k] == null ? -1 : a[k]) || String(a.no).localeCompare(String(b.no), undefined, { numeric: true })); }
        function pgBar(cls: string, lab: string, km: number | null, mx: number, sub: string): string {
            if (km == null) return `<div class="pgb ${cls}"><span class="l">${lab}</span><div class="trk"><div class="bg"></div></div><span class="v"><em>sana yoʻq</em></span></div>`;
            const w = mx ? km / mx * 100 : 0;
            return `<div class="pgb ${cls}"><span class="l">${lab}</span><div class="trk"><div class="bg"></div><div class="fl" style="width:${Math.max(w, 0.8)}%"></div></div><span class="v"><b>${pgMing(km)}</b> ming km<em>${sub}</em></span></div>`;
        }
        function pgYil(y: number | null): string { return y == null ? '—' : (y < 1 ? Math.round(y * 12) + ' oy' : (Math.round(y * 10) / 10).toLocaleString('ru-RU') + ' yil'); }
        function pgRow(x: any, i: number, mx: number): string {
            const E = PG.escapeHtml, v = x.v, dr = PGF.m === 'dr', ds = pgDS(x);
            const tag = v.status === 'Tamirda' ? '<span class="tag bl">🔧 taʼmirda</span>'
                : dr ? (x.kD == null ? '<span class="tag bl">DR sanasi yoʻq</span>' : ds === 'x' ? `<span class="tag x">🔴 DR muddati oʻtgan</span>` : ds === 'w' ? `<span class="tag w">⚠️ DR ${x.dD} kunda</span>` : '<span class="tag o">🟢 normada</span>')
                : (x.kK == null ? '<span class="tag bl">KR sanasi yoʻq</span>' : '');
            const src = typeof PG.vgKmSince === 'function' ? PG.vgKmSince(v, dr ? v.tamirSanasi : v.kr) : null;
            const subTxt = src && src.fakt > 0 ? `haqiqiy ${pgMing(src.fakt)} + hisob ${pgMing(src.hisob)}` : 'meʼyoriy hisob';
            const bar = dr ? pgBar('d', 'DR', x.kD, mx, subTxt) : pgBar('k', 'KR', x.kK, mx, subTxt);
            const sec = dr
                ? `<div class="ft sec2"><span>KR: <b>${pgFd(v.kr)}</b> · ${pgYil(x.yK)}${x.kK != null ? ' · ≈ ' + pgMing(x.kK) + ' ming km' : ''}</span></div>`
                : `<div class="ft sec2"><span>DR: <b>${pgFd(v.tamirSanasi)}</b>${x.kD != null ? ' · ≈ ' + pgMing(x.kD) + ' ming km' : ''} · keyingi <b>${pgFd(v.keyingi)}</b></span></div>`;
            return `<div class="pgr" onclick="pgPass('${E(String(v.id))}')"><div class="n">${i + 1}</div><div class="rh"><b>№ ${E(x.no)}</b><small>${E(String(v.type || '').replace('Dumpkar ', ''))} · ${E(pgSeh(v))}</small>${tag}</div>
                <div class="bars">${bar}</div>
                <div class="ft"><span>${dr ? `Oxirgi DR <b>${pgFd(v.tamirSanasi)}</b> · keyingi <b>${pgFd(v.keyingi)}</b>` : `Oxirgi KR <b>${pgFd(v.kr)}</b> · ${pgYil(x.yK)} oldin`}</span><span><b>${Math.round(x.rate)}</b> km/kun</span></div>${sec}</div>`;
        }
        function pgCurve(L: any[]): string {
            const k = pgKey(), dr = PGF.m === 'dr', P = L.filter(x => x[k] != null).sort((a, b) => b[k] - a[k]), n = P.length || 1, H = 120;
            const pm = Math.max(1e-9, ...P.map(x => x[k])), y = (p: number) => H - p / pm * (H - 6), bw = 400 / n;
            let s = '';
            P.forEach((x, i) => { const d = pgDS(x); s += `<rect x="${(i * bw).toFixed(2)}" y="${y(x[k]).toFixed(1)}" width="${Math.max(bw - 0.2, 0.3).toFixed(2)}" height="${(H - y(x[k])).toFixed(1)}" fill="${!dr ? '#3b82f6' : d === 'x' ? '#ef4444' : d === 'w' ? '#facc15' : '#22c55e'}"/>`; });
            const o = dr ? P.filter(x => pgDS(x) === 'x').length : 0;
            return `<svg viewBox="0 0 400 120" preserveAspectRatio="none">${s}</svg><p>Chapda — eng koʻp yurganlar (eng uzun = ${P.length ? pgMing(pm) + ' ming km' : '—'}).${dr ? ` Qizil — DR muddati oʻtgan (<b style="color:#f87171">${o}</b>), sariq — 30 kun ichida.` : ' KR — navbat boʻyicha (oʻrtacha 12–14 yil).'}</p>`;
        }
        function pgChips(arr: [string, string, number?][], key: string, cls: string): string { return arr.map(([k, l, n]) => `<button class="${cls}${String(PGF[key]) === k ? ' on' : ''}" onclick="pgSet('${key}','${k}')">${l}${n != null ? ` <i>${n}</i>` : ''}</button>`).join(''); }
        function pgSet(k: string, v: string): void { PGF[k] = v; if (k === 't') PGF.st = 'all'; if (k === 'm') PGF.h = 'all'; PGF.lim = 60; pgDraw(); }
        function pgMore(): void { PGF.lim += 100; pgDraw(true); }
        function pgDraw(keepScroll?: boolean): void {
            const b = PG.secBody('screen-probeg'); if (!b) return; const E = PG.escapeHtml, C = pgCfg(), dr = PGF.m === 'dr';
            const B = pgBase(), k = pgKey(), L = pgSel();
            const cT = (t: string) => PGR.filter(x => t === 'all' || pgTk(x.v.type) === t).length;
            const dT = Array.from(new Set(PGR.map(x => pgTk(x.v.type)).filter(t => /^Dumpkar/.test(t)))).sort((a, b) => cT(b) - cT(a));
            const types: [string, string, number?][] = [['all', 'Barchasi', cT('all')]].concat(dT.map(t => [t, t, cT(t)] as [string, string, number])) as any;
            ['Sisterna', 'Platforma', 'Xopper', 'Boshqa'].forEach(t => { if (cT(t) || t !== 'Boshqa') types.push([t, t, cT(t)]); });
            if (PGF.t === 'Dumpkar') PGF.t = 'all'; const sub: [string, string, number?][] = [];
            const hc = (h: string) => B.filter(x => pgHol(x, h)).length;
            const hol: [string, string, number?][] = dr
                ? [['all', 'Hammasi', B.length], ['x', '🔴 DR muddati oʻtgan', hc('x')], ['w', '⚠️ 30 kun ichida', hc('w')], ['o', '🟢 normada', hc('o')], ['n', 'DR sanasi yoʻq', hc('n')], ['rep', '🔧 taʼmirda', hc('rep')]]
                : [['all', 'Hammasi', B.length], ['n', 'KR sanasi yoʻq', hc('n')], ['rep', '🔧 taʼmirda', hc('rep')]];
            const sehs = Array.from(new Set(PGR.map(x => pgSeh(x.v)))).sort();
            const avg = B.length ? Math.round(B.reduce((a, x) => a + x.rate, 0) / B.length) : 0;
            const kY = B.filter(x => x.yK != null), avgY = kY.length ? kY.reduce((a, x) => a + x.yK, 0) / kY.length : null;
            const kpi = dr ? `<div><small>Jami</small><b>${B.length}</b></div><div><small>DR oʻtgan</small><b style="color:#f87171">${hc('x')}</b></div><div><small>30 kunda</small><b style="color:#facc15">${hc('w')}</b></div><div><small>km/kun</small><b style="color:#7dd3fc">${avg}</b></div>`
                : `<div><small>Jami</small><b>${B.length}</b></div><div><small>KR sanasi yoʻq</small><b style="color:#93c5fd">${hc('n')}</b></div><div><small>Oʻrt. KR yoshi</small><b style="color:#93c5fd">${pgYil(avgY)}</b></div><div><small>km/kun</small><b style="color:#7dd3fc">${avg}</b></div>`;
            const sc = keepScroll ? b.scrollTop : 0;
            b.innerHTML = `<div class="pg">
              <div class="pg-hd"><div class="pg-kpi">${kpi}</div>
                <div class="pg-sw"><button class="d${dr ? ' on' : ''}" onclick="pgSet('m','dr')">🟢 DR boʻyicha</button><button class="k${!dr ? ' on' : ''}" onclick="pgSet('m','kr')">🔵 KR boʻyicha</button></div>
                <button class="pg-ppr" onclick="pgPpr()">📄 Oylik reja va PDF <small>(taʼmir grafigi oynasi)</small></button>${typeof PG.xkCheckOpen === 'function' ? '<button class="pg-ppr" style="margin-top:6px" onclick="xkCheckOpen()">🔎 Probeg aniqligi nazorati</button>' : ''}</div>
              <div class="pg-sec"><div class="pg-types">${pgChips(types, 't', 'pg-t')}</div>${sub.length ? `<div class="pg-sub">${pgChips(sub, 'st', 'pg-c')}</div>` : ''}
                <div class="pg-srch"><input id="pgQ" placeholder="🔍 Vagon raqami…" inputmode="numeric" value="${E(PGF.q)}" oninput="PGF.q=this.value.trim(); PGF.lim=60; pgDrawList()"><select onchange="pgSet('seh',this.value)"><option value="all">Barcha sex</option>${sehs.map(s => `<option${PGF.seh === s ? ' selected' : ''}>${E(s)}</option>`).join('')}</select><button class="pg-cfg" onclick="pgCfgOpen()">${PG.isAdmin() ? '⚙️' : 'ⓘ'}</button></div>
                <div class="pg-sub">${pgChips(hol, 'h', 'pg-c')}</div></div>
              <div class="pg-ov"><h3>${dr ? '🟢 DR dan keyingi km' : '🔵 KR dan keyingi km'} — koʻpdan → kamga</h3>${pgCurve(B)}</div>
              <div class="pg-lg"><span><u style="background:${dr ? '#22c55e' : '#3b82f6'}"></u>${dr ? 'DR' : 'KR'} dan keyin km</span><span>eng uzun = roʻyxatdagi eng koʻp yurgan</span><span>${dr ? 'KR' : 'DR'} — pastda kichik yozuv</span></div>
              <div id="pgList"></div>
              <div class="pg-nm">ℹ️ Km: 2VS-105 — mashinistlar kiritgan xodkalar (GPS boʻlsa — GPS); 6VS-60, sisterna, platforma, xopper — tortuvchi texnika (elektrovoz, teplovoz, motovoz, drezina) naryadidan koʻchirma (smena GPS, tarkibda turgan boʻlagi). Undan oldingi davr — meʼyoriy hisob: ${pgTy({ type: 'Dumpkar 2VS-105' }).x} xodka × ${pgTy({ type: 'Dumpkar 2VS-105' }).km} km × ${C.ishYil} ish sutka / 365 (karyer → KKD ≈ ${C.kkdKm} km). DR — muddat boʻyicha (RD VNIIZhT 27.05.01-2017: ${pgMing(C.drKm)} ming km yoki 1 yil); KR — navbat boʻyicha. Vagonni bosing — pasporti ochiladi.</div></div>`;
            pgDrawList(); if (keepScroll) b.scrollTop = sc;
        }
        function pgDrawList(): void {
            const box = PG.$id('pgList'); if (!box) return; const L = pgSel(), k = pgKey(), mx = Math.max(1, ...L.map(x => x[k] || 0));
            box.innerHTML = `<div class="pg-cnt">${L.length} ta vagon · saralash: ${PGF.m === 'dr' ? 'DR' : 'KR'} dan keyingi km (koʻpdan → kamga)</div>` + L.slice(0, PGF.lim).map((x, i) => pgRow(x, i, mx)).join('') + (L.length > PGF.lim ? `<button class="pg-more" onclick="pgMore()">Yana koʻrsatish (${L.length - PGF.lim} ta qoldi)</button>` : (PGF.h !== 'all' || PGF.t !== 'all' || PGF.seh !== 'all' || PGF.q) ? `<div class="pg-end">Roʻyxat tugadi — ${L.length} ta. Filtr yoqilgan: <b>${[PGF.t !== 'all' ? PGF.t : '', PGF.h !== 'all' ? ({ x: 'DR muddati oʻtgan', w: '30 kun ichida', o: 'normada', n: 'sanasi yoʻq', rep: 'taʼmirda' } as any)[PGF.h] : '', PGF.seh !== 'all' ? PGF.seh : '', PGF.q ? '«' + PGF.q + '»' : ''].filter(Boolean).join(' · ')}</b><button class="pg-more" onclick="PGF.q=''; PGF.seh='all'; PGF.t='all'; pgSet('h','all')">Barcha vagonlarni koʻrsatish (${PGR.length})</button></div>` : `<div class="pg-end">Roʻyxat tugadi — ${L.length} ta.</div>`);
        }
        function pgPass(id: string): void { const v = (vagonlarData as any[]).find((x: any) => String(x.id) === String(id)); if (v) PG.openPassport(v.id); }
        function pgPpr(): void { try { if (PG.VG) PG.VG.mode = 'auto'; } catch (e) { /* */ } PG.pprOpen(); }
        // ---------- sozlama ----------
        function pgCfgOpen(): void {
            const C = pgCfg(), ed = PG.isAdmin(), dis = ed ? '' : ' disabled', E = PG.escapeHtml;
            const inp = (id: string, v: number) => `<input id="${id}" type="number" step="any" value="${v}"${dis} style="width:86px;padding:6px;border-radius:8px">`;
            PG.mdl('pgCfg', `<div class="px-h"><b>⚙️ Probeg va ishlab chiqarish meʼyorlari</b><button class="mini-btn" onclick="mdlClose('pgCfg')">✕</button></div>
                <div class="nd-tip">${ed ? 'Oʻzgartirsangiz — barcha telefonlarda bir xil boʻladi.' : 'Faqat administrator oʻzgartiradi.'} Haqiqiy km — mashinistlar kiritgan xodkalardan (GPS boʻlsa — GPS); bu meʼyorlar faqat kiritilmagan davr uchun.</div>
                <table class="nar-t pg-ct">
                  <tr><td>Karyer → KKD (fabrika), bir tomon, km</td><td>${inp('pgKkd', C.kkdKm)}</td></tr>
                  <tr><td>Karyer → Nakpaysay (zaxira), bir tomon, km</td><td>${inp('pgNak', C.nakKm)}</td></tr>
                  <tr><td>Yiliga ish sutkasi (365 − taʼmir, VRP)</td><td>${inp('pgIy', C.ishYil)}</td></tr>
                  <tr><td>DR km meʼyori (RD VNIIZhT: 110 ming)</td><td>${inp('pgDr', C.drKm)}</td></tr>
                  <tr><td>Motor-dumpkar soni (tarkibda)</td><td>${inp('pgMn', C.motorN)}</td></tr>
                  <tr><td>Motor-dumpkar yuki, t</td><td>${inp('pgMt', C.motorT)}</td></tr></table>
                <table class="nar-t pg-ct"><tr><th>Vagon turi</th><th>Xodka / sutka</th><th>1 xodka, km</th><th>Yuk, t</th></tr>${PG_TYPES.map((t, i) => /2VS-105/.test(t) ? `<tr><td>${E(t)}</td><td>${inp('pgX' + i, C.t[t].x)}</td><td>${inp('pgK' + i, C.t[t].km)}</td><td>${inp('pgT' + i, C.t[t].tn)}</td></tr>` : `<tr><td>${E(t)}<br><small>naryad boʻyicha</small></td><td>${inp('pgX' + i, C.t[t].x)}</td><td>${inp('pgK' + i, C.t[t].km)}</td><td>—<input id="pgT${i}" type="hidden" value="0"></td></tr>`).join('')}</table>
                <div class="nd-tip"><b>Xodka va ruda — faqat 2VS-105.</b> 6VS-60, sisterna, platforma, xopper xodka qilmaydi, ruda tashimaydi: haqiqiy km — tortuvchi texnikaga (elektrovoz, teplovoz, motovoz, drezina …) biriktirilgan vaqtdagi naryaddan (smena GPS masofasi). Ularning qatoridagi son — faqat naryad boʻlmagan davr uchun meʼyor (km/sutka = birinchi × ikkinchi).</div>
                <div class="nd-tip">Manba: «Olmaliq KMK» AJ STTB temir yoʻllari sxemasi (2026) piketlari — PK 0 «Qolmaqir»; zaboy (ЭКГ) → KKD ≈ 15 134 m. Nakpaysay — sxemadagi «umumiy temir yoʻl 13 290 m». DR: RD VNIIZhT 27.05.01-2017.</div>
                ${ed ? '<div class="nv-btns"><button onclick="pgCfgSave()">💾 Saqlash</button></div>' : ''}`, true);
        }
        function pgCfgSave(): void {
            if (!PG.isAdmin()) return; const g = (id: string) => +((PG.$id(id) || {}).value || 0);
            const c: any = { v: 45, kkdKm: g('pgKkd'), nakKm: g('pgNak'), ishYil: g('pgIy'), drKm: g('pgDr'), motorN: g('pgMn'), motorT: g('pgMt'), t: {} };
            if (!(c.kkdKm > 0 && c.nakKm > 0 && c.ishYil > 0 && c.ishYil <= 366 && c.drKm > 0 && c.motorN >= 0 && c.motorT >= 0)) { PG.alert('Qiymatlar notoʻgʻri'); return; }
            PG_TYPES.forEach((t, i) => { c.t[t] = { x: Math.max(0, g('pgX' + i)), km: Math.max(0, g('pgK' + i)), tn: Math.max(0, g('pgT' + i)) }; });
            PG.kvSet(PG_CFG_KEY, c); try { PG.KV_SYNC.dirty = true; } catch (e) { /* */ }
            PG.mdlClose('pgCfg'); PG.showToast('✅ Meʼyorlar saqlandi');
            try { if (PG.$id('screen-probeg') && PG.$id('screen-probeg').classList.contains('active')) pgOpen(); if (PG.$id('screen-salohiyat') && PG.$id('screen-salohiyat').classList.contains('active')) slOpen(); ['screen-sl-ruda', 'screen-sl-tamir'].forEach(id => { if (PG.$id(id) && PG.$id(id).classList.contains('active')) { SLD = slBuild(); slDraw(); } }); } catch (e) { /* */ }
        }

        // =====================================================================
        // 3) 🏭 KORXONA SALOHIYATI (bosh sahifa)
        // =====================================================================
        var SLF: any = { tab: 'ruda', per: 'oy', y: 0, ty: 'all', ch: 'bar', rt: 'all' };
        var SLD: any = null;
        var SL_COL: any = { 'Dumpkar 2VS-105': '#3b82f6', 'Dumpkar 6VS-60': '#ef4444' };
        var SL_RT: any = { TR: '#22c55e', DR: '#3b82f6', KR: '#ef4444', NS: '#f97316', VRP: '#a855f7', PTOV: '#06b6d4' };
        var SL_RTS = ['KR', 'DR', 'VRP', 'PTOV', 'TR', 'NS'], SL_RN: any = { KR: 'KR', DR: 'DR', VRP: 'VRP', PTOV: 'PTOV', TR: 'TR', NS: 'Nosozlik' };
        var SL_RT_T: any = { KR: 'Kapital taʼmir', DR: 'Depo taʼmiri', VRP: 'Vagon remont punkti', PTOV: 'Punkt texnicheskogo osmotra vagonov — vagonga texnik xizmat koʻrsatish' };
        /** taʼmir yozuvlari (sinxron): pasportda DR/KR sanasi oʻzgarsa — oʻzi; VRP va PTOV — qoʻlda. { vid, rt, d, by, src } */
        function slTS(): any { return PG.agmkStore('tamir'); }
        /** bitta vagonning barcha taʼmirlari: pasport tarixi (chiqdi) + pasportdagi oxirgi DR / KR sanasi + taʼmir yozuvlari. Takrorlar — bitta */
        function slRepEv(v: any, TS?: any): any[] {
            const out: any[] = [], seen: any = {}, add = (d: string, rt: string, src: string) => { d = String(d || '').slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return; rt = String(rt || '').toUpperCase(); if (!SL_RT[rt]) rt = 'TR'; const k = rt + d; if (seen[k]) return; seen[k] = 1; out.push({ d: d, rt: rt, src: src }); };
            try { let lastIn: any = null; (typeof PG.polEv === 'function' ? PG.polEv(v) : []).forEach((e: any) => { if (e.k === 'in') { lastIn = e; return; } if (e.k !== 'out') return; add(e.d, e.rt || (lastIn && lastIn.rt) || '', 'tarix'); lastIn = null; }); } catch (e) { /* */ }
            const dr = String(v.tamirSanasi || '').slice(0, 10); if (dr && dr > '1990') add(dr, /KR|Kapital/i.test(String(v.tamirTuri || '')) ? 'KR' : 'DR', 'pasport');
            const kr = String(v.kr || '').slice(0, 10); if (kr && kr > '1990') add(kr, 'KR', 'pasport');
            (TS ? TS[v.id] || [] : slTS().all().filter((r: any) => r.vid === v.id)).forEach((r: any) => add(r.d, r.rt, r.src || 'yozuv'));
            return out.sort((a, b) => a.d < b.d ? -1 : 1);
        }
        // pasportda DR / KR sanasi oʻzgarsa — eski sana ham, yangisi ham taʼmir tarixida qoladi (saqlanganda)
        var SL_SNAP: any = null;
        function slSnap(): void { SL_SNAP = {}; try { PG.onlyVagons().forEach((v: any) => { SL_SNAP[v.id] = [String(v.tamirSanasi || '').slice(0, 10), String(v.kr || '').slice(0, 10), String(v.tamirTuri || '')]; }); } catch (e) { /* */ } }
        function slSnapCheck(): void {
            if (!SL_SNAP) { slSnap(); return; } const S = slTS(); let by = ''; try { by = PG.authorStr(); } catch (e) { /* */ } const have: any = {}; S.all().forEach((r: any) => { have[r.vid + r.rt + r.d] = 1; });
            const put = (vid: any, rt: string, d: string, src: string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d < '1990' || have[vid + rt + d]) return; have[vid + rt + d] = 1; try { S.put({ vid: vid, rt: rt, d: d, by: by, src: src }); } catch (e) { /* */ } };
            PG.onlyVagons().forEach((v: any) => { const o = SL_SNAP[v.id], dr = String(v.tamirSanasi || '').slice(0, 10), kr = String(v.kr || '').slice(0, 10); if (!o) return;
                if (dr && dr !== o[0]) { const rt = /KR|Kapital/i.test(String(v.tamirTuri || '')) ? 'KR' : 'DR'; put(v.id, /KR|Kapital/i.test(o[2]) ? 'KR' : 'DR', o[0], 'pasport (oldingi)'); put(v.id, rt, dr, 'pasport'); }
                if (kr && kr !== o[1]) { put(v.id, 'KR', o[1], 'pasport (oldingi)'); put(v.id, 'KR', kr, 'pasport'); } });
            slSnap();
        }
        setTimeout(slSnap, 3000);
        if (typeof PG.saveDB === 'function') PG.saveDB = PG.agmkExtend('saveDB', 'v4.4: taʼmir tarixi (pasport sanasi)', PG.saveDB, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); try { slSnapCheck(); } catch (e) { console.error(e); } return r; });
        var SL_RF_KEY = 'agmk_sl_rf';
        try { if (typeof PG.KV_SYNC !== 'undefined' && !PG.KV_SYNC.keys.includes(SL_RF_KEY)) PG.KV_SYNC.keys.push(SL_RF_KEY); } catch (e) { /* */ }
        /** oylik reja va fakt (tonna): { 'YYYY-MM': { r, f, by, at } } — dispetcher hisobotidan qoʻlda kiritiladi */
        function slRF(): any { let d: any = null; try { d = PG.kvGet(SL_RF_KEY, null); } catch (e) { /* */ } return d && typeof d === 'object' ? d : {}; }
        /** oy fakti (t): 1) dispetcher hisobotidan qoʻlda; 2) mashinistlar xodkasi (KKD + Nakpaysay, nakladnoy yoki hisob); 0 — yoʻq */
        function slXk(m: string): any { try { return typeof PG.xkAgg === 'function' ? PG.xkAgg().m[m] || null : null; } catch (e) { return null; } }
        /** kunlik meʼyoriy hisob (t, barcha dumpkar): ishda turgan vagonlar × xodka × yuk × ish sutkasi ulushi */
        function slEstDay(i: number): number { const C = pgCfg(); let w = 0; Object.keys(SLD.nT).forEach(t => { const T = C.t[t] || pgTy({ type: t }); w += Math.max(0, SLD.nT[t] - SLD.dRep[t][i]) * (+T.x || 0) * (+T.tn || 0); }); return w * C.ishYil / 365; }
        /** oy fakti: qoʻlda kiritilgan boʻlsa — u; aks holda xodka kiritilgan kunlar — haqiqiy, kiritilmagan kunlar — meʼyoriy hisob */
        function slFakt(m: string): number {
            const f = +(slRF()[m] || {}).f || 0; if (f > 0) return f; const x = slXk(m); if (!x || !(x.kkd.x + x.nak.x)) return 0;
            let s2 = 0; const XD = PG.xkAgg().d || {}; if (!SLD) return x.kkd.tn + x.nak.tn;
            for (let i = 0; i < SLD.nD; i++) { const iso = slDayISO(i); if (iso.slice(0, 7) !== m) continue; const d = XD[iso]; s2 += d ? d.kkd + d.nak : slEstDay(i); }
            return s2;
        }
        function slFSrc(m: string): string { return +(slRF()[m] || {}).f > 0 ? 'q' : slFakt(m) > 0 ? 'x' : ''; }
        function slCanEdit(): boolean { try { return PG.isAdmin() || PG.hasRole('rahbar') || PG.hasRole('dispetcher'); } catch (e) { return false; } }
        function slMonths(): string[] { const t = pgToday(), y = +t.slice(0, 4), out: string[] = []; for (let yy = y - 1; yy <= y; yy++) for (let m = 1; m <= 12; m++) { const k = yy + '-' + String(m).padStart(2, '0'); if (k <= t.slice(0, 7)) out.push(k); } return out; }
        function slBuild(): any {
            pgReset(); const C = pgCfg(), V = PG.onlyVagons(), today = pgT(pgToday()), MS = slMonths(), D: any = { months: MS, ruda: {}, rep: {} };
            MS.forEach(m => { D.ruda[m] = {}; D.rep[m] = {}; });
            // kunlik qatorlar (chiziqli sxema uchun): har tur — taʼmirda turgan vagonlar soni; taʼmirdan chiqqanlar — kun boʻyicha
            const d0 = Date.UTC(+MS[0].slice(0, 4), +MS[0].slice(5, 7) - 1, 1), nD = Math.round((today - d0) / PG_DAY) + 1;
            D.d0 = d0; D.nD = nD; D.nT = {}; D.dRep = {}; D.dOut = {}; D.all = [];
            const TSV: any = {}; try { slTS().all().forEach((r: any) => { (TSV[r.vid] = TSV[r.vid] || []).push(r); }); } catch (e) { /* */ }
            V.forEach((v: any) => {
                const T = pgTy(v), dump = (+T.tn || 0) > 0;
                if (dump) {
                    D.nT[v.type] = (D.nT[v.type] || 0) + 1; const df = D.dRep[v.type] = D.dRep[v.type] || new Float64Array(nD + 1);
                    pgIv(v).forEach(([a, b]) => { const i0 = Math.max(0, Math.round((a - d0) / PG_DAY)), i1 = Math.min(nD, Math.round((b - d0) / PG_DAY)); if (i1 > i0) { df[i0] += 1; df[i1] -= 1; } });
                    MS.forEach(m => {
                        const a = Date.UTC(+m.slice(0, 4), +m.slice(5, 7) - 1, 1), e = Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 1), dim = (e - a) / PG_DAY, b = Math.min(e, today + PG_DAY);
                        if (b <= a) return; const el = (b - a) / PG_DAY, rp = pgRep(v, a, b), ik = C.ishYil / 365 * Math.max(0, el - rp), pk = C.ishYil / 365 * el;
                        const x = ik * (+T.x || 0), tn = x * T.tn, R = D.ruda[m][v.type] = D.ruda[m][v.type] || { n: 0, ish: 0, x: 0, tn: 0, pot: 0 };
                        R.n++; R.ish += Math.max(0, el - rp) / el; R.x += x; R.tn += tn; R.pot += pk * (+T.x || 0) * T.tn;
                    });
                }
                // taʼmirlar — chiqqan (bajarilgan) kuni / oyi boʻyicha: pasport tarixi + pasportdagi DR/KR sanasi + taʼmir yozuvlari (VRP, PTOV)
                try {
                    slRepEv(v, TSV).forEach((e: any) => {
                        const m = e.d.slice(0, 7), g = pgGrp(v.type); D.all.push({ v: v, d: e.d, rt: e.rt, src: e.src });
                        if (!D.rep[m]) return; const R = D.rep[m][g] = D.rep[m][g] || {}; R[e.rt] = (R[e.rt] || 0) + 1;
                        const di = Math.round((pgT(e.d) - d0) / PG_DAY); if (di >= 0 && di < nD) { const O = D.dOut[g] = D.dOut[g] || {}; SL_RTS.forEach(k => { if (!O[k]) O[k] = new Float64Array(nD); }); O[e.rt][di]++; }
                    });
                } catch (e) { /* */ }
            });
            Object.keys(D.dRep).forEach(t => { const a = D.dRep[t]; for (let i = 1; i <= nD; i++) a[i] += a[i - 1]; });
            return D;
        }
        // ---------- 📈 chiziqli sxema: yaqinlashtirsa — kunlik, uzoqlashtirsa — haftalik / oylik ----------
        var SLZ: any = { pxd: 0, key: '', drag: null };
        /** ikki boʻlim (ruda / taʼmir) bir xil idlarga ega — faqat ochiq boʻlim ichidan qidiriladi */
        function slQ(id: string): any { const sc = PG.$id(slSid()); return sc ? sc.querySelector('#' + id) : null; }
        function slDayISO(i: number): string { return pgISO(SLD.d0 + i * PG_DAY); }
        /** kunlik ruda (t): tanlangan turlar; fakt kiritilgan oyda — fakt boʻyicha masshtablanadi */
        function slDailyRuda(K: string[]): Float64Array {
            const C = pgCfg(), RF = slRF(), nD = SLD.nD, out = new Float64Array(nD), all = Object.keys(SLD.nT);
            const est: any = {}; // oy → jami hisob (barcha turlar)
            for (let i = 0; i < nD; i++) {
                const iso = slDayISO(i), m = iso.slice(0, 7), dim = new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 0)).getUTCDate(), f = C.ishYil / 365 + 0 * dim;
                let sel = 0, tot = 0; all.forEach(t => { const T = C.t[t] || pgTy({ type: t }), w = Math.max(0, SLD.nT[t] - SLD.dRep[t][i]) * (+T.x || 0) * (+T.tn || 0) * f; tot += w; if (K.includes(t)) sel += w; });
                out[i] = sel; est[m] = (est[m] || 0) + tot;
            }
            const XD = (typeof PG.xkAgg === 'function' ? PG.xkAgg().d : {}) || {}, shr = (i: number) => { let s2 = 0, t2 = 0; all.forEach(t => { const T = C.t[t] || pgTy({ type: t }), w = Math.max(0, SLD.nT[t] - SLD.dRep[t][i]) * (+T.x || 0) * (+T.tn || 0); t2 += w; if (K.includes(t)) s2 += w; }); return t2 ? s2 / t2 : 0; };
            for (let i = 0; i < nD; i++) {
                const iso = slDayISO(i), m = iso.slice(0, 7), src = slFSrc(m);
                if (src === 'x') { const d = XD[iso]; if (d) out[i] = (d.kkd + d.nak) * shr(i); }     // xodka kiritilgan kun — haqiqiy, qolgani — hisob
                else if (src === 'q' && est[m] > 0 && m < pgToday().slice(0, 7)) out[i] *= slFakt(m) / est[m];
            }
            void RF;
            return out;
        }
        function slBuckets(lv: string): any[] {
            const nD = SLD.nD, B: any[] = []; let cur: any = null;
            for (let i = 0; i < nD; i++) {
                const iso = slDayISO(i), d = new Date(SLD.d0 + i * PG_DAY), k = lv === 'kun' ? iso : lv === 'oy' ? iso.slice(0, 7) : lv === 'yil' ? iso.slice(0, 4) : pgISO(SLD.d0 + (i - ((d.getUTCDay() + 6) % 7)) * PG_DAY);
                if (!cur || cur.k !== k) { cur = { k: k, i0: i, n: 0 }; B.push(cur); } cur.n++;
            }
            return B;
        }
        function slLineHtml(): string {
            return `<div class="sl-lz"><span id="slLvl"></span><span><button onclick="slZoom(0.5)">−</button><button onclick="slZoom(2)">+</button></span></div>
                <div class="sl-lbox"><svg id="slLAx" class="sl-lax"></svg><div class="sl-lw" id="slLW"><svg id="slLS"></svg></div></div>
                <p class="sl-lh">👆 Ikki barmoq bilan yaqinlashtiring — <b>haftalik</b>, <b>kunlik</b>; uzoqlashtiring — <b>oylik</b>, <b>yillik</b>. Chapga-oʻngga suring. ★ eng yuqori, ▼ eng past (tugamagan oxirgi davr hisobga olinmaydi).</p>`;
        }
        /** S: [{ v: Float64Array (kunlik), col, w, lab }] — birinchisi asosiy (qiymatlari yoziladi) */
        function slLineDraw(S: any[], unit: string, plan?: any, opts?: any): void {
            const box = slQ('slLW'), sv = slQ('slLS'), ax = slQ('slLAx'); if (!box || !sv || !ax) return;
            const nD = SLD.nD, cw = Math.max(240, box.clientWidth || 340), fit = (cw - 24) / nD;
            const key = SLF.tab + '|' + nD; if (SLZ.key !== key || !SLZ.pxd) { SLZ.key = key; SLZ.pxd = fit; SLZ.end = true; }
            SLZ.pxd = Math.min(28, Math.max(fit * 0.3, SLZ.pxd)); const lv = SLZ.pxd >= 6 ? 'kun' : SLZ.pxd >= 1.5 ? 'hafta' : SLZ.pxd >= fit * 0.75 ? 'oy' : 'yil', pxd = Math.max(fit, SLZ.pxd), bar = SLF.ch === 'bar';
            const B = slBuckets(lv), W = Math.max(cw, nD * pxd + 24), H = 250, top = 26, bot = 46, X = (b: any) => 12 + (b.i0 + b.n / 2) * pxd;
            const vals = S.map(s => B.map(b => { let a = 0; for (let i = b.i0; i < b.i0 + b.n; i++) a += s.v[i]; return a; }));
            const pv = plan && (lv === 'oy' || lv === 'yil') ? B.map(b => Object.keys(plan).filter(m => m.slice(0, b.k.length) === b.k).reduce((q, m) => q + (+plan[m] || 0), 0)) : null;
            const tot = bar ? B.map((b, k) => S.reduce((q, s, j) => q + (j || S.length === 1 ? vals[j][k] : 0), 0)) : null; // ustunli: 1 qator — oʻzi, koʻp qator — 1-dan keyingilari (birinchisi jami)
            const mx0 = Math.max(1e-9, ...(bar ? tot : vals.flat()), ...(pv || [0])) * 1.3, st = [1, 2, 2.5, 5, 10].map(x => x * Math.pow(10, Math.floor(Math.log10(mx0 / 5)))).find(x => mx0 / x <= 6) || mx0 / 5, mx = Math.ceil(mx0 / st) * st;
            const y = (v: number) => top + (H - top - bot) * (1 - v / mx), fmt = (v: number) => unit === 't' ? (v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'm' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(Math.round(v))) : String(+v.toFixed(1));
            let a = ''; for (let v = 0; v <= mx + 1e-9; v += st) a += `<text x="34" y="${y(v) + 3}" fill="#93a3c4" font-size="9.5" text-anchor="end">${fmt(v)}</text>`;
            ax.setAttribute('viewBox', `0 0 38 ${H}`); ax.setAttribute('height', String(H)); ax.innerHTML = a;
            let g = ''; for (let v = 0; v <= mx + 1e-9; v += st) g += `<line x1="0" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#2a3a5c"/>`;
            // x oʻqi: oy chegaralari va yillar
            const bw = B.length ? (W - 24) / B.length : W, labs: number[] = [], free = (x: number, d: number) => labs.every(q => Math.abs(q - x) >= d);
            const info = B.map(b => { const iso = b.k.length === 4 ? b.k + '-01-01' : b.k.length === 7 ? b.k + '-01' : b.k, mm = +iso.slice(5, 7), dd = +iso.slice(8, 10); return { iso: iso, mm: mm, dd: dd, ms: lv === 'oy' || dd === 1 || (lv === 'hafta' && dd <= 7) }; });
            if (lv !== 'yil') B.forEach((b, j) => { const f = info[j], x0 = 12 + b.i0 * pxd; if (j && f.mm === 1 && f.ms) g += `<line x1="${x0}" x2="${x0}" y1="${top - 10}" y2="${H}" stroke="#475569" stroke-dasharray="3 3"/><text x="${x0 + 4}" y="${H - 4}" fill="#cbd5e1" font-size="11" font-weight="800">${f.iso.slice(0, 4)}</text>`; });
            // avval oy boshlari (qalin), keyin boʻsh joyga kun / hafta sanalari
            if (lv === 'yil') B.forEach(b => { g += `<text x="${X(b)}" y="${H - bot + 18}" fill="#e2e8f0" font-size="12" font-weight="800" text-anchor="middle">${b.k}${b.n < 360 ? ' (' + Math.round(b.n / 30.4) + ' oy)' : ''}</text>`; });
            else B.forEach((b, j) => { const f = info[j]; if (f.ms && free(X(b), lv === 'oy' ? 27 : 30)) { labs.push(X(b)); g += `<text x="${X(b)}" y="${H - bot + 16}" fill="${lv === 'oy' ? '#cbd5e1' : '#e2e8f0'}" font-size="10" ${lv === 'oy' ? '' : 'font-weight="700"'} text-anchor="middle">${PG_MON[f.mm - 1]}</text>`; } });
            if (lv !== 'oy') B.forEach((b, j) => { const f = info[j]; if (!f.ms && free(X(b), 34)) { labs.push(X(b)); g += `<text x="${X(b)}" y="${H - bot + 16}" fill="#93a3c4" font-size="10" text-anchor="middle">${lv === 'kun' ? f.dd : f.dd + '.' + String(f.mm).padStart(2, '0')}</text>`; } });
            if (lv !== 'yil') g += `<text x="14" y="${H - 4}" fill="#cbd5e1" font-size="11" font-weight="800">${slDayISO(0).slice(0, 4)}</text>`;
            if (!SLD.nD) { sv.innerHTML = ''; return; }
            if (bar) {
                const SB = S.length === 1 ? S : S.slice(1), done = B.map((b, k) => k).slice(0, -1), I = done.length ? done : B.map((b, k) => k);
                let bi = I[0], wi = I[0]; I.forEach(k => { if (tot[k] > tot[bi]) bi = k; if (tot[k] < tot[wi]) wi = k; }); const same = tot[bi] - tot[wi] < Math.max(1e-9, tot[bi] * 0.0005);
                B.forEach((b, k) => {
                    const w = Math.max(0.6, b.n * pxd * (lv === 'kun' ? 0.78 : 0.7)), x = 12 + b.i0 * pxd + (b.n * pxd - w) / 2, dim = opts && opts.dim ? opts.dim(b.k) : false; let acc = 0;
                    SB.forEach((sr, j) => { const v = vals[S.length === 1 ? 0 : j + 1][k]; if (!(v > 0)) return; const y0 = y(acc), y1 = y(acc + v); g += `<rect x="${x.toFixed(2)}" y="${y1.toFixed(1)}" width="${w.toFixed(2)}" height="${Math.max(0.5, y0 - y1).toFixed(1)}" fill="${sr.col}"${dim ? ' opacity=".55"' : ''}/>`; acc += v; });
                    if (pv && pv[k] > 0) { const yp = y(pv[k]); g += `<line x1="${x - 2}" x2="${x + w + 2}" y1="${yp}" y2="${yp}" stroke="${tot[k] >= pv[k] ? '#4ade80' : '#fb923c'}" stroke-width="2.4"/>`; }
                    const mark = !same && (k === bi || k === wi);
                    if ((w >= 26 || mark) && tot[k] > 0) { const yt = Math.min(y(tot[k]), pv && pv[k] > 0 ? y(pv[k]) : 1e9) - 5; g += `<text x="${x + w / 2}" y="${yt}" fill="${mark ? (k === bi ? '#4ade80' : '#f87171') : '#e8eefc'}" font-size="9.5" font-weight="800" text-anchor="middle">${mark ? (k === bi ? '★' : '▼') : ''}${fmt(tot[k])}${pv && pv[k] > 0 ? ' · ' + Math.round(tot[k] / pv[k] * 100) + '%' : ''}</text>`; }
                });
            }
            if (!bar && pv && pv.some(v => v > 0)) g += `<polyline fill="none" stroke="#4ade80" stroke-width="1.6" stroke-dasharray="6 4" points="${B.map((b, j) => pv[j] > 0 ? `${X(b)},${y(pv[j])}` : '').filter(Boolean).join(' ')}"/>`;
            if (!bar) S.slice().reverse().forEach((s, rj) => { const j = S.length - 1 - rj, V = vals[j]; g += `<polyline fill="none" stroke="${s.col}" stroke-width="${s.w || 2.4}" stroke-linejoin="round" points="${B.map((b, k) => `${X(b)},${y(V[k])}`).join(' ')}"/>`; });
            const V0 = vals[0], done = B.map((b, k) => k).slice(0, -1), I = bar ? [] : done.length ? done : B.map((b, k) => k);
            let bi = I[0], wi = I[0]; I.forEach(k => { if (V0[k] > V0[bi]) bi = k; if (V0[k] < V0[wi]) wi = k; }); const same = V0[bi] - V0[wi] < Math.max(1e-9, V0[bi] * 0.0005);
            if (!bar) B.forEach((b, k) => {
                const cx = X(b), cy = y(V0[k]), col = !same && k === bi ? '#4ade80' : !same && k === wi ? '#f87171' : S[0].col;
                if (bw >= 7 || (!same && (k === bi || k === wi))) g += `<circle cx="${cx}" cy="${cy}" r="${!same && (k === bi || k === wi) ? 4.5 : 3}" fill="${col}" stroke="#0b1324" stroke-width="1"/>`;
                if (bw >= 34 || (!same && (k === bi || k === wi))) g += `<text x="${cx}" y="${cy - 8}" fill="${col}" font-size="9.5" font-weight="800" text-anchor="middle">${!same && k === bi ? '★' : !same && k === wi ? '▼' : ''}${fmt(V0[k])}${pv && pv[k] > 0 ? ' · ' + Math.round(V0[k] / pv[k] * 100) + '%' : ''}</text>`;
            });
            sv.style.width = W + 'px'; sv.setAttribute('width', String(W)); sv.setAttribute('height', String(H)); sv.setAttribute('viewBox', `0 0 ${W} ${H}`); sv.innerHTML = g;
            const L = slQ('slLvl'); if (L) L.innerHTML = `Koʻrinish: <b>${lv === 'kun' ? 'kunlik' : lv === 'hafta' ? 'haftalik' : lv === 'oy' ? 'oylik' : 'yillik'}</b> · ${unit === 't' ? 'tonna' : 'ta'} / ${lv === 'kun' ? 'kun' : lv === 'hafta' ? 'hafta' : lv === 'oy' ? 'oy' : 'yil'}`;
            if (SLZ.end) { box.scrollLeft = W; SLZ.end = false; }
            if (SLZ.sl != null) { box.scrollLeft = SLZ.sl; SLZ.sl = null; }
            if (!box.dataset.z) { box.dataset.z = '1'; slPinch(box); }
        }
        function slLineRuda(): void {
            const dT = PG_TYPES.filter(t => (+pgCfg().t[t].tn || 0) > 0), K = SLF.ty === 'all' ? dT : [SLF.ty], RF = slRF(), plan: any = {};
            if (SLF.ty === 'all') Object.keys(RF).forEach(m => { if (+RF[m].r > 0) plan[m] = +RF[m].r; });
            slLineDraw([{ v: slDailyRuda(K), col: K.length === 1 ? (SL_COL[K[0]] || '#60a5fa') : '#60a5fa', w: 2.6 }], 't', plan, { dim: (k: string) => k.length >= 7 && !(slFakt(k.slice(0, 7)) > 0) });
        }
        function slLineTamir(): void {
            const nD = SLD.nD, G = Object.keys(SLD.dOut).filter(g => SLF.ty === 'all' || g === SLF.ty), tot = new Float64Array(nD), S: any[] = [];
            (SLF.rt && SLF.rt !== 'all' ? [SLF.rt] : SL_RTS).forEach(rt => { const a = new Float64Array(nD); G.forEach(g => { const x = SLD.dOut[g][rt]; if (!x) return; for (let i = 0; i < nD; i++) a[i] += x[i]; }); for (let i = 0; i < nD; i++) tot[i] += a[i]; S.push({ v: a, col: SL_RT[rt], w: 1.4 }); });
            slLineDraw(SLF.rt && SLF.rt !== 'all' ? [{ v: tot, col: SL_RT[SLF.rt], w: 2.6 }] : [{ v: tot, col: '#e2e8f0', w: 2.6 }].concat(S), 'ta');
        }
        function slLineRedraw(): void { if (typeof SLZ.redraw === 'function') SLZ.redraw(); }
        /** markaz (cx, ekrandagi px) atrofida masshtab */
        function slZoomAt(k: number, cx: number): void {
            const box = slQ('slLW'); if (!box) return; const p0 = SLZ.pxd, day = (box.scrollLeft + cx - 12) / p0;
            const fit = (Math.max(240, box.clientWidth) - 24) / SLD.nD; SLZ.pxd = Math.min(28, Math.max(fit * 0.3, Math.max(fit, p0) * k)); if (SLZ.pxd < fit * 0.75) SLZ.pxd = fit * 0.3;
            SLZ.sl = Math.max(0, day * Math.max(fit, SLZ.pxd) + 12 - cx); slLineRedraw();
        }
        function slZoom(k: number): void { const box = slQ('slLW'); slZoomAt(k, box ? box.clientWidth / 2 : 160); }
        function slPinch(box: any): void {
            let d0 = 0, raf = 0, kq = 1, cx = 0;
            const dist = (t: any) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
            box.addEventListener('touchstart', (e: any) => { if (e.touches.length === 2) { d0 = dist(e.touches); const r = box.getBoundingClientRect(); cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left; } }, { passive: true });
            box.addEventListener('touchmove', (e: any) => {
                if (e.touches.length !== 2 || !d0) return; e.preventDefault(); const d = dist(e.touches); kq = d / d0;
                if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (Math.abs(kq - 1) > 0.04) { slZoomAt(kq, cx); d0 = d0 * kq; kq = 1; } });
            }, { passive: false });
            box.addEventListener('touchend', () => { d0 = 0; }, { passive: true });
            box.addEventListener('wheel', (e: any) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); const r = box.getBoundingClientRect(); slZoomAt(e.deltaY < 0 ? 1.25 : 0.8, e.clientX - r.left); }, { passive: false });
        }
        // Ishlab chiqarish koʻrsatkichlari (4.3 da «Korxona salohiyati»): ⛰️ Ruda tashish · 🔧 Vagon taʼmiri · 🚃 Vagon ishlab chiqarish
        function slOpen(): void {
            PG.secScreen('screen-salohiyat', 'Ishlab chiqarish koʻrsatkichlari', "openScreen('screen-main')"); try { const h2 = PG.$id('screen-salohiyat').querySelector('.sec-title'); if (h2) h2.textContent = 'Ishlab chiqarish koʻrsatkichlari'; } catch (e) { /* */ }
            SLD = slBuild(); if (!SLF.y) SLF.y = +pgToday().slice(0, 4);
            const y = pgToday().slice(0, 4), MS = SLD.months.filter((m: string) => m.startsWith(y)), RF = slRF();
            let tn = 0, rp = 0; MS.forEach((m: string) => { const f = slFakt(m); void RF; tn += f > 0 ? f : Object.keys(SLD.ruda[m]).reduce((a, t) => a + SLD.ruda[m][t].tn, 0); Object.keys(SLD.rep[m] || {}).forEach(g => { const R = SLD.rep[m][g]; rp += Object.keys(R).reduce((q: number, k: string) => q + (+R[k] || 0), 0); }); });
            PG.secBody('screen-salohiyat').innerHTML = `<div class="vgm">
                <div class="vgm-c c" onclick="slGo('ruda')"><div class="vgm-i">⛰️</div><div class="vgm-t"><b>Ruda tashish</b><span>Oylik / yillik tonna, reja va fakt, sxemalar</span><small>${y}: <i>${slFmtT(tn)}</i> t</small></div><span class="vgm-a">›</span></div>
                <div class="vgm-c d" onclick="slGo('tamir')"><div class="vgm-i">🔧</div><div class="vgm-t"><b>Vagon taʼmiri</b><span>Oylik / yillik TR, DR, KR va nosozliklar</span><small>${y}: <i>${rp}</i> ta taʼmir</small></div><span class="vgm-a">›</span></div>
                <div class="vgm-c e" onclick="slVIch()"><div class="vgm-i">${(PG.MK_IMG || {}).vich ? `<img class="vgm-img" src="${PG.MK_IMG.vich}" alt="">` : '🚃'}</div><div class="vgm-t"><b>Vagon ishlab chiqarish</b><span>Yangi vagon yasash — reja / fakt, bosqichlar</span><small>2027 yildan</small></div><span class="vgm-a">›</span></div>
            </div>`;
            PG.openScreen('screen-salohiyat');
        }
        function slVIch(): void {
            PG.mdl('slVI', `<div class="px-h"><b>🚃 Vagon ishlab chiqarish</b><button class="mini-btn" onclick="mdlClose('slVI')">✕</button></div>
                <div class="nd-tip">Korxonada <b>yangi vagon yasash 2027 yildan</b> boshlanadi. Bu boʻlimda boʻladi: yillik / oylik <b>reja va fakt</b>; har yangi vagon kartochkasi — <b>bosqichlar</b> (rama, aravacha, kuzov, boʻyash, sinov), <b>materiallar</b>, <b>xodimlar</b>; tayyor boʻlganda vagon <b>Vagonlar parkiga oʻzi qoʻshiladi</b> (pasport bilan).</div>
                <div class="nd-tip">Tafsilotlar (reja, bosqichlar roʻyxati, kim kiritadi) muallif bilan kelishilgach ishga tushiriladi.</div>`);
        }
        function slSid(): string { return SLF.tab === 'ruda' ? 'screen-sl-ruda' : 'screen-sl-tamir'; }
        function slGo(tab: string): void {
            SLF.tab = tab; SLF.ty = 'all'; if (!SLD) SLD = slBuild(); if (!SLF.y) SLF.y = +pgToday().slice(0, 4);
            PG.secScreen(slSid(), tab === 'ruda' ? 'Ruda tashish' : 'Vagon taʼmiri', 'slOpen()'); PG.openScreen(slSid()); slDraw();
        }
        function slSet(k: string, v: string): void { SLF[k] = (k === 'y') ? +v : v; slDraw(); }
        function slRows(): any[] { const D = SLD; if (SLF.per === 'oy') return D.months.filter((m: string) => +m.slice(0, 4) === SLF.y).map((m: string) => ({ c: PG_MON[+m.slice(5, 7) - 1] + (m.slice(5, 7) === '01' ? ' ' + m.slice(2, 4) : ''), ms: [m] })).map((r: any) => (r.ms[0] === pgToday().slice(0, 7) ? Object.assign(r, { c: r.c + '*' }) : r)); const ys = Array.from(new Set(D.months.map((m: string) => +m.slice(0, 4)))) as number[]; return ys.map(y => { const ms = D.months.filter((m: string) => +m.slice(0, 4) === y); return { c: String(y) + (ms.length < 12 ? ' (' + ms.length + ' oy)' : ''), ms: ms }; }); }
        function slFmtT(x: number): string { return x >= 1e6 ? (x / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' mln' : x >= 1e3 ? Math.round(x / 1e3).toLocaleString('ru-RU') + ' ming' : Math.round(x).toLocaleString('ru-RU'); }
        // ustunli (yigʻma) diagramma
        function slBars(cats: string[], series: any[], opt: any): string {
            const W = 390, H = 320, L = 36, Bm = 42, top = 14, n = Math.max(cats.length, 1), cw = (W - L - 4) / n, bw = cw * 0.68;
            const tot = cats.map((_, i) => series.reduce((a: number, s: any) => a + s.v[i], 0)), pl: number[] = (opt.plan || []).map((x: any) => +x || 0);
            // tepada oʻsish uchun joy: eng balandidan ~30 % yuqori
            const mx0 = Math.max(1, ...tot, ...pl, ...(opt.line || [0])) * 1.35;
            const st = [1, 2, 2.5, 5, 10].map(x => x * Math.pow(10, Math.floor(Math.log10(mx0 / 5)))).find(x => mx0 / x <= 6) || mx0 / 5, mx = Math.ceil(mx0 / st) * st, y = (v: number) => top + (H - top - Bm) * (1 - v / mx);
            let g = ''; for (let v = 0; v <= mx; v += st) g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#2a3a5c"/><text x="${L - 4}" y="${y(v) + 3}" fill="#93a3c4" font-size="9" text-anchor="end">${opt.ax ? opt.ax(v) : +v.toFixed(2)}</text>`;
            const bi = opt.bi != null ? opt.bi : -1, wi = opt.wi != null ? opt.wi : -1;
            cats.forEach((c, i) => {
                const x = L + i * cw + (cw - bw) / 2; let acc = 0;
                series.forEach((s: any, j: number) => { const v = s.v[i]; if (!v) return; const y0 = y(acc), y1 = y(acc + v), hh = y0 - y1; g += `<rect x="${x}" y="${y1}" width="${bw}" height="${hh}" fill="${s.col}" stroke="#0b1324" stroke-width=".6"${opt.dim && opt.dim[i] ? ' opacity=".55"' : ''}/>`;
                    if (j === 0 && hh > 34) g += `<text transform="translate(${x + bw / 2 + 3.5},${(y0 + y1) / 2}) rotate(-90)" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">${opt.lab(v)}</text>`;
                    else if (j > 0 && hh > 11) g += `<text x="${x + bw / 2}" y="${(y0 + y1) / 2 + 3.5}" fill="#fff" font-size="8.5" font-weight="700" text-anchor="middle">${opt.lab(v)}</text>`; acc += v; });
                if (pl[i] > 0) { const yp = y(pl[i]), pc = tot[i] / pl[i]; g += `<line x1="${x - 3}" x2="${x + bw + 3}" y1="${yp}" y2="${yp}" stroke="${pc >= 1 ? '#4ade80' : '#fb923c'}" stroke-width="2.4"/>`; }
                if (tot[i] > 0) g += `<text x="${x + bw / 2}" y="${(pl[i] > 0 && y(pl[i]) < y(tot[i]) ? y(pl[i]) : y(tot[i])) - 5}" fill="${i === bi ? '#4ade80' : i === wi ? '#f87171' : '#e8eefc'}" font-size="9.5" font-weight="800" text-anchor="middle">${i === bi ? '★' : i === wi ? '▼' : ''}${opt.top(tot[i])}</text>${pl[i] > 0 ? `<text x="${x + bw / 2}" y="${(y(pl[i]) < y(tot[i]) ? y(pl[i]) : y(tot[i])) - 16}" fill="${tot[i] >= pl[i] ? '#4ade80' : '#fb923c'}" font-size="8.5" font-weight="700" text-anchor="middle">${Math.round(tot[i] / pl[i] * 100)}%</text>` : ''}`;
                g += `<text transform="translate(${x + bw / 2 + 3},${H - Bm + 6}) rotate(-90)" fill="#cbd5e1" font-size="10" text-anchor="end">${PG.escapeHtml(c)}</text>`;
            });
            if (opt.line) g += `<polyline fill="none" stroke="#facc15" stroke-width="1.6" stroke-dasharray="5 3" points="${opt.line.map((v: number, i: number) => `${L + i * cw + cw / 2},${y(v)}`).join(' ')}"/>`;
            return `<svg viewBox="0 0 ${W} ${H}">${g}</svg>`;
        }
        var SL_PAL = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#a855f7', '#06b6d4', '#eab308', '#ec4899', '#84cc16', '#14b8a6', '#f43f5e', '#8b5cf6'];
        // ---------- 🥧 hajmli (3D), ajratilgan boʻlakli doiraviy sxema ----------
        var SL_PAL3 = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#06b6d4', '#eab308', '#ec4899', '#84cc16', '#ef4444', '#14b8a6', '#8b5cf6', '#f59e0b'];
        function slShade(hex: string, k: number): string { const n = parseInt(hex.slice(1), 16), f = (x: number) => Math.max(0, Math.min(255, Math.round(x * k))); return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')'; }
        function slPie3D(items: any[], bi: number, wi: number): string {
            const tot = items.reduce((a, x) => a + (x.v > 0 ? x.v : 0), 0); if (!tot) return '<p class="sl-e">Maʼlumot yoʻq</p>';
            const W = 390, H = 290, cx = 195, cy = 128, rx = 118, ry = 66, dep = 22, ex = 9, E = PG.escapeHtml; let a0 = -Math.PI / 2;
            const S = items.map((x, i) => { const a = (x.v > 0 ? x.v : 0) / tot * 2 * Math.PI, o = { i: i, x: x, a0: a0, a1: a0 + a, m: a0 + a / 2, col: SL_PAL3[i % SL_PAL3.length] }; a0 += a; return o; }).filter(o => o.a1 - o.a0 > 1e-6);
            const P = (o: any, t: number, dy?: number) => { const ox = ex * Math.cos(o.m) * (o.i === bi ? 1.8 : 1), oy = ex * 0.56 * Math.sin(o.m) * (o.i === bi ? 1.8 : 1); return [cx + ox + rx * Math.cos(t), cy + oy + ry * Math.sin(t) + (dy || 0)]; };
            const C = (o: any, dy?: number) => { const ox = ex * Math.cos(o.m) * (o.i === bi ? 1.8 : 1), oy = ex * 0.56 * Math.sin(o.m) * (o.i === bi ? 1.8 : 1); return [cx + ox, cy + oy + (dy || 0)]; };
            let g = `<ellipse cx="${cx}" cy="${cy + dep + 14}" rx="${rx + 16}" ry="${ry * 0.55}" fill="#0007"/>`;
            // orqadagilar avval, oldingilar keyin
            S.slice().sort((p, q) => Math.sin(p.m) - Math.sin(q.m)).forEach(o => {
                const dk = slShade(o.col, 0.62), one = S.length === 1;
                // yon devor (faqat old yarmi koʻrinadi: 0…π)
                const lo = Math.max(o.a0, 0), hi = Math.min(o.a1, Math.PI), lo2 = Math.max(o.a0, 2 * Math.PI), hi2 = Math.min(o.a1, 3 * Math.PI);
                [[lo, hi], [lo2, hi2]].forEach(([u, w]) => { if (w <= u) return; const [x1, y1] = P(o, u), [x2, y2] = P(o, w); g += `<path d="M${x1},${y1} A${rx},${ry} 0 0 1 ${x2},${y2} L${x2},${y2 + dep} A${rx},${ry} 0 0 0 ${x1},${y1 + dep} Z" fill="${dk}"/>`; });
                if (!one) [o.a0, o.a1].forEach(t => { if (Math.sin(t) > -0.98) { const [x1, y1] = P(o, t), [c1, c2] = C(o); g += `<path d="M${c1},${c2} L${x1},${y1} L${x1},${y1 + dep} L${c1},${c2 + dep} Z" fill="${slShade(o.col, 0.5)}"/>`; } });
                const [x0, y0] = P(o, o.a0), [x1, y1] = P(o, o.a1), [c1, c2] = C(o);
                g += one ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${o.col}"/>` : `<path d="M${c1},${c2} L${x0},${y0} A${rx},${ry} 0 ${o.a1 - o.a0 > Math.PI ? 1 : 0} 1 ${x1},${y1} Z" fill="${o.col}" stroke="${o.i === bi ? '#4ade80' : o.i === wi ? '#f87171' : 'none'}" stroke-width="2"/>`;
            });
            // yozuvlar — tashqarida, chiziq bilan
            S.forEach(o => {
                const pc = o.x.v / tot * 100, [ex1, ey1] = P(o, o.m, Math.sin(o.m) > 0 ? dep * 0.6 : 0), lx = cx + (rx + 30) * Math.cos(o.m), ly = cy + (ry + 30) * Math.sin(o.m) + (Math.sin(o.m) > 0 ? dep : 0), an = Math.cos(o.m) >= 0 ? 'start' : 'end', tx = lx + (Math.cos(o.m) >= 0 ? 4 : -4);
                const col = o.i === bi ? '#4ade80' : o.i === wi ? '#f87171' : '#e8eefc';
                g += `<polyline points="${ex1},${ey1} ${lx},${ly}" fill="none" stroke="#93a3c4" stroke-width="1"/><text x="${tx}" y="${ly - 1}" fill="${col}" font-size="11" font-weight="800" text-anchor="${an}">${o.i === bi ? '★' : o.i === wi ? '▼' : ''}${E(o.x.c)}</text><text x="${tx}" y="${ly + 11}" fill="${o.col}" font-size="10.5" font-weight="700" text-anchor="${an}">${pc.toFixed(1)}%</text>`;
            });
            return `<svg viewBox="0 0 ${W} ${H}" class="sl-pie">${g}</svg>`;
        }
        /** eng yaxshi / eng kam — joriy (tugamagan) oy yoki yil hisobga olinmaydi */
        function slBW(rows: any[], tot: number[]): [number, number] {
            const cur = pgToday().slice(0, 7), done = rows.map((r, i) => i).filter(i => tot[i] > 0 && !(rows[i].ms || []).includes(cur));
            const I = done.length ? done : rows.map((r, i) => i).filter(i => tot[i] > 0); if (!I.length) return [-1, -1];
            let b = I[0], w = I[0]; I.forEach(i => { if (tot[i] > tot[b]) b = i; if (tot[i] < tot[w]) w = i; });
            if (tot[b] - tot[w] < Math.max(1e-9, tot[b] * 0.0005)) return [-1, -1]; // hammasi bir xil — eng yaxshi / eng kam yoʻq
            return [b, w];
        }
        function slPct(d: number | null): string { return d == null || !isFinite(d) ? '<td>—</td>' : `<td class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲ ' : '▼ '}${Math.abs(Math.round(d * 100))}%</td>`; }
        function slDraw(): void {
            const b = PG.$id(slSid()) && PG.secBody(slSid()); if (!b || !SLD) return;
            const ys = Array.from(new Set(SLD.months.map((m: string) => +m.slice(0, 4)))) as number[];
            const head = `<div class="pg-sec"><div class="pg-sub"><span class="sl-seg"><button class="${SLF.per === 'oy' ? 'on' : ''}" onclick="slSet('per','oy')">📅 Oylik</button><button class="${SLF.per === 'yil' ? 'on' : ''}" onclick="slSet('per','yil')">📆 Yillik</button></span>${SLF.per === 'oy' ? ys.map(y => `<button class="pg-c${SLF.y === y ? ' on' : ''}" onclick="slSet('y','${y}')">${y}</button>`).join('') : ''}<button class="pg-c" onclick="pgCfgOpen()">${PG.isAdmin() ? '⚙️ Meʼyorlar' : 'ⓘ Meʼyorlar'}</button></div>`;
            b.innerHTML = `<div class="pg">${head}${SLF.tab === 'ruda' ? slRuda() : slTamir()}</div>`;
            SLZ.redraw = SLF.tab === 'ruda' ? slLineRuda : slLineTamir; slLineRedraw();
        }
        function slRuda(): string {
            const C = pgCfg(), rows = slRows(), dT = PG_TYPES.filter(t => (+pgCfg().t[t].tn || 0) > 0), K = SLF.ty === 'all' ? dT : [SLF.ty];
            const cnt = (t: string) => PG.onlyVagons().filter((v: any) => v.type === t).length;
            const sum = (r: any, t: string, f: string) => r.ms.reduce((a: number, m: string) => a + ((SLD.ruda[m][t] || {})[f] || 0), 0);
            // fakt (kiritilgan boʻlsa) — hisobni almashtiradi; turlar ulushi hisob boʻyicha taqsimlanadi
            const RF = slRF(), allE = (r: any) => dT.reduce((a, t) => a + sum(r, t, 'tn'), 0);
            const hasF = rows.map(r => r.ms.every((m: string) => slFakt(m) > 0)), kF = rows.map((r, i) => { const e = allE(r); return hasF[i] && e ? r.ms.reduce((a: number, m: string) => a + slFakt(m), 0) / e : 1; }), srcX = rows.map(r => r.ms.some((m: string) => slFSrc(m) === 'x'));
            const plan = rows.map(r => { const p = r.ms.reduce((a: number, m: string) => a + (+(RF[m] || {}).r || 0), 0); return p > 0 ? p * (SLF.ty === 'all' ? 1 : (allE(r) ? K.reduce((a, t) => a + sum(r, t, 'tn'), 0) / allE(r) : 0)) / 1e3 : 0; });
            const ser = K.map(t => ({ col: SL_COL[t] || '#a855f7', t: t, v: rows.map((r, i) => sum(r, t, 'tn') * kF[i] / 1e3) }));
            const tot = rows.map((_, i) => ser.reduce((a, s) => a + s.v[i], 0)), pot = rows.map(r => K.reduce((a, t) => a + sum(r, t, 'pot'), 0) / 1e3);
            const S = tot.reduce((a, b) => a + b, 0), [bi, wi] = slBW(rows, tot), P = pot.reduce((a, b) => a + b, 0);
            const per = SLF.per, lbl = per === 'oy' ? 'oy' : 'yil', E = PG.escapeHtml;
            let chart = '', lg = '';
            if (SLF.ch === 'bar') { chart = slLineHtml(); lg = ser.map(s => `<span><u style="background:${s.col}"></u>${E(s.t)} (${pgCfg().t[s.t].tn} t)</span>`).join('') + '<span><u style="background:#4ade80;height:3px"></u>reja: yashil — bajarildi, toʻq sariq — bajarilmadi (% — bajarilishi)</span><span><u style="background:#3b82f6;opacity:.55"></u>xira — hisob (fakt kiritilmagan)</span>'; void pot; }
            else { chart = slLineHtml(); lg = ser.length > 1 ? '<span>Chiziq — tanlangan dumpkarlar jami (' + ser.map(x => E(x.t.replace('Dumpkar ', ''))).join(' + ') + ')</span>' : '<span>Chiziq — ' + E(ser[0].t) + '</span>'; lg += '<span><u style="background:none;border-top:2px dashed #4ade80;height:0"></u>reja (oylik koʻrinishda, % — bajarilishi)</span>'; }
            const t0 = pgCfg().t['Dumpkar 2VS-105'] || { x: 3, tn: 105 };
            return `<div class="pg-sec"><div class="pg-sub">${(dT.length > 1 ? [['all', 'Barcha dumpkar', dT.reduce((a, t) => a + cnt(t), 0)]].concat(dT.map(t => [t, t.replace('Dumpkar ', ''), cnt(t)])) : [['all', (dT[0] || '').replace('Dumpkar ', 'Dumpkar ') + ' — ruda faqat shu turda', dT.reduce((a, t) => a + cnt(t), 0)]]).map(([k, l, n]: any) => `<button class="pg-c${SLF.ty === k ? ' on' : ''}" onclick="slSet('ty','${k}')">${PG.escapeHtml(l)} <i>${n}</i></button>`).join('')}</div></div>
              ${hasF.some(x => x) ? '' : `<div class="sl-warn">ℹ️ <b>Fakt hali yoʻq.</b> Mashinistlar smenada xodka va nakladnoyni kirita boshlasa — fakt oʻzi toʻladi. Hozircha raqamlar meʼyor boʻyicha hisob: ishlagan kun × ${pgCfg().t['Dumpkar 2VS-105'] ? pgCfg().t['Dumpkar 2VS-105'].x : 3} xodka × meʼyoriy yuk — shuning uchun oylar deyarli bir xil chiqadi (farq faqat taʼmirda turgan kunlardan). Haqiqiy natijani — qaysi oy yaxshi, qaysi oy kam — koʻrish uchun dispetcher hisobotidagi oylik faktni va rejani kiriting.<button onclick="slRFOpen()">📝 Reja va fakt kiritish</button></div>`}
              <div class="sl-kpi"><div><small>Jami tashilgan (${per === 'oy' ? SLF.y + ' y.' : 'barcha yillar'})</small><b>${slFmtT(S * 1e3)}</b> <em>t</em></div><div><small>Salohiyatdan foydalanish</small><b>${P ? Math.round(S / P * 100) : 0} %</b></div>${(() => { const I = rows.map((r, i) => i).filter(i => plan[i] > 0), pS = I.reduce((a, i) => a + plan[i], 0), fS = I.reduce((a, i) => a + tot[i], 0); return pS ? `<div><small>Reja (${I.length} ${lbl})</small><b>${slFmtT(pS * 1e3)}</b> <em>t</em></div><div><small>Reja bajarilishi</small><b style="color:${fS >= pS ? '#4ade80' : '#fb923c'}">${Math.round(fS / pS * 100)} %</b> <em>${fS >= pS ? '+' : '−'}${slFmtT(Math.abs(fS - pS) * 1e3)} t</em></div>` : ''; })()}
                <div><small>★ Eng yaxshi ${lbl}</small><b style="color:#4ade80">${bi >= 0 ? PG.escapeHtml(rows[bi].c) : '—'}</b>${bi < 0 ? ' <em>oylar bir xil</em>' : ''} <em>${bi >= 0 ? slFmtT(tot[bi] * 1e3) + ' t' : ''}</em></div><div><small>▼ Eng kam ${lbl}</small><b style="color:#f87171">${wi >= 0 ? PG.escapeHtml(rows[wi].c) : '—'}</b> <em>${wi >= 0 ? slFmtT(tot[wi] * 1e3) + ' t · ' + Math.round((tot[wi] / tot[bi] - 1) * 100) + ' %' : ''}</em></div></div>
              <div class="sl-card"><div class="sl-ch"><h3>${SLF.ch === 'line' ? 'Ruda tashish dinamikasi' : 'Tashilgan ruda, t'}</h3><span class="sl-seg"><button class="${SLF.ch === 'bar' ? 'on' : ''}" onclick="slSet('ch','bar')">📊 Ustunli</button><button class="${SLF.ch === 'line' ? 'on' : ''}" onclick="slSet('ch','line')">📈 Chiziqli</button></span></div>
                ${chart}<div class="pg-lg in">${lg}</div>
                <div class="sl-f">Hisob (fakt boʻlmagan oy): <b>ishlagan kun</b> (yiliga ${C.ishYil} ish sutka, taʼmirdagi kunlar ayirilgan) × <b>kuniga xodka</b> × <b>meʼyoriy yuk</b>. Masalan, 1 ta 2VS-105 bir oyda: ${t0.tn} × ${t0.x} × ${(C.ishYil / 12).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} = <b>${pgN(t0.tn * t0.x * C.ishYil / 12)} t</b>. Mashinistlar xodka kiritgan oy — haqiqiy (🛤). <b>*</b> — joriy oy (hali tugamagan), eng yaxshi / eng kam hisobiga kirmaydi.</div></div>
              ${slMzCard(rows)}
              <div class="sl-card"><h3>🥧 ${per === 'oy' ? 'Oylar ulushi — ' + SLF.y : 'Yillar ulushi'}</h3><p>Har boʻlak — ${per === 'oy' ? 'oyning yillik' : 'yilning umumiy'} jamidagi ulushi (tonna). ★ eng koʻp, ▼ eng kam.</p>${slPie3D(rows.map((r, i) => ({ c: r.c.replace(/ \d+$/, ''), v: tot[i] })), bi, wi)}</div>
              <div class="sl-card"><h3>${per === 'oy' ? 'Oylar' : 'Yillar'} solishtirmasi</h3><p>Oʻtgan ${lbl}ga nisbatan oʻzgarish. «1 vagon» — bir vagon oʻrtacha tashigani.</p>
                <table class="sl-t"><tr><th>${per === 'oy' ? 'Oy' : 'Yil'}</th><th>Ishda</th><th>Reja</th><th>Tonna</th><th title="Rejaga nisbatan bajarilish">Reja %</th><th title="Bitta vagon bir oyda/yilda tashigan oʻrtacha tonna">1 vagon oʻrtacha, t</th><th>±</th></tr>${rows.map((r, i) => {
                    const ish = K.reduce((a, t) => a + sum(r, t, 'ish'), 0) / Math.max(1, r.ms.length), x = K.reduce((a, t) => a + sum(r, t, 'x'), 0), nv = K.reduce((a, t) => a + sum(r, t, 'n'), 0) / Math.max(1, r.ms.length);
                    void x; const pc = plan[i] ? tot[i] / plan[i] : 0;
                    return `<tr><td>${i === bi ? '★ ' : i === wi ? '▼ ' : ''}${PG.escapeHtml(r.c)}${hasF[i] ? (srcX[i] ? ' <small title="mashinist xodkalari">🛤</small>' : ' <small title="fakt">✓</small>') : ''}</td><td>${Math.round(ish)}<small>/${Math.round(nv)}</small></td><td>${plan[i] ? slFmtT(plan[i] * 1e3) : '—'}</td><td><b>${slFmtT(tot[i] * 1e3)}</b></td><td class="${pc ? (pc >= 1 ? 'up' : 'dn') : ''}">${pc ? Math.round(pc * 100) + '%' : '—'}</td><td>${ish ? pgN(tot[i] * 1e3 / ish) : '—'}</td>${slPct(i ? tot[i] / tot[i - 1] - 1 : null)}</tr>`; }).join('')}
                <tr class="sm"><td>Jami</td><td></td><td>${plan.some(x => x) ? slFmtT(plan.reduce((a, b) => a + b, 0) * 1e3) : ''}</td><td><b>${slFmtT(S * 1e3)}</b></td><td></td><td></td><td></td></tr></table>
                <p>✓ — fakt kiritilgan (dispetcher hisoboti); 🛤 — mashinistlar xodkasidan (nakladnoy, yoʻq boʻlsa — tarkib yuki); belgisiz — meʼyor boʻyicha hisob. «Ishda» — oʻrtacha ishda boʻlgan / jami vagon.</p><div class="nv-btns"><button onclick="slRFOpen()">📝 Reja va fakt kiritish (${SLF.y})</button></div></div>
              <div class="pg-nm">ℹ️ Vagonlar soni va turi, taʼmirda turgan kunlar — ilovadagi maʼlumot (pasport tarixi, polojeniya). Xodka va yuk — meʼyor boʻyicha (sozlamada).</div>`;
        }
        /** manzillar boʻyicha (mashinist xodkalari): ⛏ KKD · 🟡 Nakpaysay · ⛰ boʻsh jins */
        function slMzCard(rows: any[]): string {
            const A = rows.map(r => { const o: any = { kx: 0, kt: 0, kn: 0, nx: 0, nt: 0, nn: 0, bx: 0, bk: 0 }; r.ms.forEach((m: string) => { const x = slXk(m); if (!x) return; o.kx += x.kkd.x; o.kt += x.kkd.tn; o.kn += x.kkd.tnN; o.nx += x.nak.x; o.nt += x.nak.tn; o.nn += x.nak.tnN; o.bx += x.bosh.x; o.bk += x.bosh.km; }); return o; });
            const any = A.some(o => o.kx + o.nx + o.bx > 0), E = PG.escapeHtml, C = pgCfg();
            if (!any) return `<div class="sl-card"><h3>🛤 Manzillar boʻyicha</h3><p>Mashinistlar smenada xodka kiritishni boshlaganda shu yerda chiqadi: <b>⛏ KKD (fabrika)</b> — ≈ ${C.kkdKm} km, <b>🟡 Nakpaysay</b> (balansdan tashqari ruda, zaxira) — ≈ ${C.nakKm} km, <b>⛰ Boʻsh jins</b> — xodka va GPS km (tonna yoʻq).</p></div>`;
            const T = (t: number, n: number) => t ? `<b>${slFmtT(t)}</b>${n < t - 1 ? `<small title="nakladnoy / hisob"> ⚖️${Math.round(n / t * 100)}%</small>` : ''}` : '—';
            const S = A.reduce((a: any, o: any) => { Object.keys(o).forEach(k => { a[k] = (a[k] || 0) + o[k]; }); return a; }, {});
            return `<div class="sl-card"><h3>🛤 Manzillar boʻyicha (mashinist xodkalari)</h3><p>Xodka soni va tonna. ⚖️% — nakladnoy bilan tasdiqlangan ulush (qolgani — tarkib yuki boʻyicha hisob). Boʻsh jins — tonnasiz, faqat xodka va GPS km.</p>
                <table class="sl-t sl-mz"><tr><th>${SLF.per === 'oy' ? 'Oy' : 'Yil'}</th><th>⛏ KKD<br><small>xodka · t</small></th><th>🟡 Nakpaysay<br><small>xodka · t</small></th><th>⛰ Boʻsh jins<br><small>xodka · km</small></th></tr>${rows.map((r, i) => { const o = A[i]; return o.kx + o.nx + o.bx ? `<tr><td>${E(r.c)}</td><td>${o.kx ? (Math.round(o.kx * 10) / 10).toLocaleString('ru-RU') + ' · ' : ''}${T(o.kt, o.kn)}</td><td>${o.nx ? (Math.round(o.nx * 10) / 10).toLocaleString('ru-RU') + ' · ' : ''}${T(o.nt, o.nn)}</td><td>${o.bx ? (Math.round(o.bx * 10) / 10).toLocaleString('ru-RU') + ' · ' + pgN(o.bk) : '—'}</td></tr>` : ''; }).join('')}
                <tr class="sm"><td>Jami</td><td>${(Math.round(S.kx * 10) / 10).toLocaleString('ru-RU')} · ${T(S.kt, S.kn)}</td><td>${(Math.round(S.nx * 10) / 10).toLocaleString('ru-RU')} · ${T(S.nt, S.nn)}</td><td>${(Math.round(S.bx * 10) / 10).toLocaleString('ru-RU')} · ${pgN(S.bk)}</td></tr></table></div>`;
        }
        function slRFOpen(): void {
            const y = SLF.y || +pgToday().slice(0, 4), RF = slRF(), ed = slCanEdit(), dis = ed ? '' : ' disabled', E = PG.escapeHtml;
            const est = (m: string) => SLD && SLD.ruda[m] ? Object.keys(SLD.ruda[m]).reduce((a, t) => a + SLD.ruda[m][t].tn, 0) : 0;
            const inp = (id: string, v: number) => `<input id="${id}" type="number" inputmode="decimal" step="0.1" value="${v ? +(v / 1000).toFixed(1) : ''}"${dis} style="width:86px;padding:6px;border-radius:8px">`;
            PG.mdl('slRF', `<div class="px-h"><b>📝 Reja va fakt · ${y}</b><button class="mini-btn" onclick="mdlClose('slRF')">✕</button></div>
                <div class="nd-tip">Ming tonnada. <b>Reja</b> — oylik topshiriq; <b>fakt</b> — dispetcher hisobotidagi haqiqiy tashilgan ruda. Fakt boʻsh boʻlsa — meʼyor boʻyicha hisob koʻrsatiladi. ${ed ? '' : '<br>Faqat administrator, rahbar yoki dispetcher kiritadi.'}</div>
                <table class="nar-t pg-ct"><tr><th>Oy</th><th>Reja</th><th>Fakt</th><th>Hisob</th></tr>${PG_MON.map((mn, k) => { const m = y + '-' + String(k + 1).padStart(2, '0'), o = RF[m] || {}; return `<tr><td>${E(mn)}</td><td>${inp('slR' + k, o.r)}</td><td>${inp('slF' + k, o.f)}</td><td style="color:#93a3c4">${est(m) ? pgN(est(m) / 1000) : '—'}</td></tr>`; }).join('')}</table>
                ${ed ? '<div class="nv-btns"><button onclick="slRFSave(' + y + ')">💾 Saqlash</button></div>' : ''}`, true);
        }
        function slRFSave(y: number): void {
            if (!slCanEdit()) return; const RF = slRF(), at = new Date().toISOString(); let by = ''; try { by = PG.authorStr(); } catch (e) { /* */ }
            for (let k = 0; k < 12; k++) {
                const m = y + '-' + String(k + 1).padStart(2, '0'), r = +((PG.$id('slR' + k) || {}).value || 0) * 1000, f = +((PG.$id('slF' + k) || {}).value || 0) * 1000;
                if (r < 0 || f < 0 || !isFinite(r) || !isFinite(f)) { PG.alert(PG_MON[k] + ': qiymat notoʻgʻri'); return; }
                const o = RF[m] || {}; if ((+o.r || 0) === r && (+o.f || 0) === f) continue;
                if (!r && !f) delete RF[m]; else RF[m] = { r: r, f: f, by: by, at: at };
            }
            PG.kvSet(SL_RF_KEY, RF); try { PG.KV_SYNC.dirty = true; } catch (e) { /* */ }
            PG.mdlClose('slRF'); PG.showToast('✅ Reja va fakt saqlandi'); slDraw();
        }
        function slTamir(): string {
            const E = PG.escapeHtml, rows = slRows(), all = !SLF.rt || SLF.rt === 'all', RT = all ? SL_RTS : [SLF.rt];
            const G = ['all', 'Dumpkar 2VS-105', 'Dumpkar 6VS-60', 'Sisterna', 'Platforma', 'Xopper'], cnt = (g: string) => PG.onlyVagons().filter((v: any) => g === 'all' || pgGrp(v.type) === g).length;
            const ty = G.includes(SLF.ty) ? SLF.ty : 'all';
            const v = (r: any, t: string) => r.ms.reduce((a: number, m: string) => a + Object.keys(SLD.rep[m] || {}).filter(g => ty === 'all' || g === ty).reduce((b: number, g: string) => b + (+SLD.rep[m][g][t] || 0), 0), 0);
            const ser = RT.map(t => ({ t: t, col: SL_RT[t], v: rows.map(r => v(r, t)) })), tot = rows.map((_, i) => ser.reduce((a, s) => a + s.v[i], 0));
            const S = tot.reduce((a, b) => a + b, 0), [bi, wi] = slBW(rows, tot), per = SLF.per;
            const yc = (rt: string) => rows.reduce((a: number, r: any) => a + v(r, rt), 0);
            const btn = (rt: string) => `<button class="sl-rtb${SLF.rt === rt ? ' on' : ''}" style="--c:${SL_RT[rt]}" onclick="slSet('rt','${rt}')"><b>${rt}</b><small>${E(SL_RT_T[rt].split(' — ')[0])}</small><i>${yc(rt)}</i></button>`;
            const ed = slCanEdit() || PG.hasRole('tex') || PG.hasRole('usta');
            // tanlangan tur: oylar boʻyicha vagon raqamlari
            let det = '';
            if (!all) {
                const L = SLD.all.filter((e: any) => e.rt === SLF.rt && (ty === 'all' || pgGrp(e.v.type) === ty) && (per === 'yil' || +e.d.slice(0, 4) === SLF.y)).sort((a: any, b: any) => a.d < b.d ? 1 : -1);
                const byM: any = {}; L.forEach((e: any) => { const k = per === 'yil' ? e.d.slice(0, 4) : e.d.slice(0, 7); (byM[k] = byM[k] || []).push(e); });
                det = `<div class="sl-card"><div class="sl-ch"><h3>${E(SLF.rt)} — ${per === 'yil' ? 'yillar' : 'oylar'} boʻyicha vagonlar (${L.length})</h3><span>${ed ? `<button class="pg-c" onclick="slRepAdd('${SLF.rt}')">➕ Kiritish</button>` : ''}<button class="pg-c" onclick="slRepXls()">📊 Excel</button></span></div>
                  ${SLF.rt === 'PTOV' ? '<p>PTOV — <i>punkt texnicheskogo osmotra vagonov</i>: vagonga texnik xizmat koʻrsatish. Tafsilotlari (davriyligi, kim kiritadi) muallifdan keyin qoʻshiladi.</p>' : SLF.rt === 'VRP' ? '<p>VRP — vagon remont punkti (oyiga 1 marta, 1 sutka). Kiritilgan VRP lar shu yerda koʻrinadi.</p>' : '<p>Pasportdagi oxirgi ' + E(SLF.rt) + ' sanasi, pasport tarixidagi «taʼmirdan chiqdi» yozuvlari va keyingi oʻzgarishlar. Pasportda sana oʻzgarsa — eski sana ham shu yerda qoladi.</p>'}
                  ${Object.keys(byM).map(k => `<details class="sl-md"><summary><b>${per === 'yil' ? k : PG_MON[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4)}</b><i>${byM[k].length} ta</i></summary><div class="sl-vn">${byM[k].map((e: any) => `<span onclick="openPassport(${JSON.stringify(e.v.id)})" title="${E(e.src)}">№${E(PG.vagonNo(e.v))}<small>${E(PG.fmtISO(e.d).slice(0, 5))}</small></span>`).join('')}</div></details>`).join('') || '<p>Bu davrda yozuv yoʻq.</p>'}</div>`;
            }
            const chart = slLineHtml();
            return `<div class="sl-rts">${['KR', 'DR', 'VRP', 'PTOV'].map(btn).join('')}</div>
              <div class="pg-sec"><div class="pg-sub"><button class="pg-c${all ? ' on' : ''}" onclick="slSet('rt','all')">Barcha taʼmirlar</button>${G.map(g => `<button class="pg-c${ty === g ? ' on' : ''}" onclick="slSet('ty','${g}')">${g === 'all' ? 'Barchasi' : g} <i>${cnt(g)}</i></button>`).join('')}</div></div>
              <div class="sl-kpi"><div><small>${all ? 'Jami taʼmir' : E(SLF.rt)} (${per === 'oy' ? SLF.y + ' y.' : 'barcha yillar'})</small><b>${S}</b> <em>ta</em></div><div><small>${RT.map(t => E(SL_RN[t])).join(' · ')}</small><b style="font-size:15px">${RT.map(t => `<span style="color:${SL_RT[t]}">${ser[RT.indexOf(t)].v.reduce((a, b) => a + b, 0)}</span>`).join(' · ')}</b></div>
                <div><small>★ Eng koʻp</small><b style="color:#4ade80">${bi >= 0 ? E(rows[bi].c) : '—'}</b> <em>${bi >= 0 ? tot[bi] + ' ta' : ''}</em></div><div><small>▼ Eng kam</small><b style="color:#f87171">${wi >= 0 ? E(rows[wi].c) : '—'}</b> <em>${wi >= 0 ? tot[wi] + ' ta' : ''}</em></div></div>
              ${det}
              <div class="sl-card"><div class="sl-ch"><h3>${all ? 'Taʼmirdan chiqqan vagonlar' : E(SLF.rt) + ' — dinamika'}</h3><span class="sl-seg"><button class="${SLF.ch === 'bar' ? 'on' : ''}" onclick="slSet('ch','bar')">📊 Ustunli</button><button class="${SLF.ch === 'line' ? 'on' : ''}" onclick="slSet('ch','line')">📈 Chiziqli</button></span></div>
                ${chart}<div class="pg-lg in">${RT.map(t => `<span><u style="background:${SL_RT[t]}"></u>${E(SL_RN[t])}</span>`).join('')}</div></div>
              <div class="sl-card"><h3>🥧 ${per === 'oy' ? 'Oylar ulushi — ' + SLF.y : 'Yillar ulushi'}</h3>${slPie3D(rows.map((r, i) => ({ c: r.c.replace(/ \d+$/, ''), v: tot[i] })), bi, wi)}</div>
              <div class="sl-card"><h3>Solishtirma</h3><p>Bajarilgan (taʼmirdan chiqqan) sanasi boʻyicha: pasportdagi DR/KR sanalari, pasport tarixi va kiritilgan VRP / PTOV.</p><table class="sl-t"><tr><th>${per === 'oy' ? 'Oy' : 'Yil'}</th>${RT.map(t => `<th>${E(SL_RN[t])}</th>`).join('')}<th>Jami</th><th>±</th></tr>${rows.map((r, i) => `<tr><td>${i === bi ? '★ ' : i === wi ? '▼ ' : ''}${E(r.c)}</td>${RT.map(t => `<td>${v(r, t)}</td>`).join('')}<td><b>${tot[i]}</b></td>${slPct(i && tot[i - 1] ? tot[i] / tot[i - 1] - 1 : null)}</tr>`).join('')}</table></div>`;
        }
        /** VRP / PTOV (va qoʻlda DR, KR) kiritish: sana + vagon raqamlari (oraliq bilan) */
        function slRepAdd(rt: string): void {
            const E = PG.escapeHtml;
            PG.mdl('slRA', `<div class="px-h"><b>➕ ${E(rt)} — ${E(SL_RT_T[rt] || '')}</b><button class="mini-btn" onclick="mdlClose('slRA')">✕</button></div>
                <div class="xk-f"><label>SANA (bajarilgan kun)</label><input id="slRAd" type="date" value="${pgToday()}"></div>
                <div class="xk-f"><label>VAGON RAQAMLARI</label><input id="slRAv" placeholder="masalan: 8121, 8130-8135" inputmode="numeric"><small>Vergul bilan yoki oraliq (8130-8135).</small></div>
                <div class="nv-btns"><button onclick="slRepSave('${E(rt)}')">💾 Saqlash</button></div>`);
        }
        function slRepSave(rt: string): void {
            const d = String((PG.$id('slRAd') || {}).value || ''), q = String((PG.$id('slRAv') || {}).value || '').trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d > pgToday()) { PG.alert('Sanani toʻgʻri kiriting (kelajak sana boʻlmaydi).'); return; }
            const want: string[] = []; q.split(/[,;\s]+/).filter(Boolean).forEach(p => { const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m) { const a = +m[1], b = +m[2]; if (b >= a && b - a <= 300) for (let x = a; x <= b; x++) want.push(String(x)); } else if (/^\d+$/.test(p) || /^\d+[\/#]\w+$/.test(p)) want.push(p); });
            const S = slTS(), V = PG.onlyVagons(); let by = ''; try { by = PG.authorStr(); } catch (e) { /* */ } let n = 0; const miss: string[] = [];
            want.forEach(w => { const f = typeof PG.agmkFindNo === 'function' ? PG.agmkFindNo(V, w) : { v: V.find((x: any) => String(PG.vagonNo(x)).replace(/^0+/, '') === w.replace(/^0+/, '')) }; const v = f.v; if (!v) { miss.push(f.dup ? w + ' (takroriy raqam — ' + f.dup.length + ' ta vagon, inventar bilan yozing: ' + f.dup.slice(0, 3).map((x: any) => w + '/' + (x.inv || '?')).join(', ') + ')' : w); return; } try { S.put({ vid: v.id, rt: rt, d: d, by: by, src: 'qoʻlda' }); n++; } catch (e: any) { PG.alert(e.message); } });
            if (!n) { PG.alert('Vagon yozilmadi: ' + (miss.join('; ') || q)); return; }
            PG.mdlClose('slRA'); PG.showToast('✅ ' + rt + ': ' + n + ' ta vagon yozildi' + (miss.length ? ' · yozilmadi: ' + miss.slice(0, 5).join('; ') : '')); SLD = slBuild(); slDraw();
        }
        function slRepXls(): void {
            const rows: any[] = [['Sana', 'Taʼmir turi', 'Vagon raqami', 'Vagon turi', 'Manba']];
            SLD.all.filter((e: any) => !SLF.rt || SLF.rt === 'all' || e.rt === SLF.rt).sort((a: any, b: any) => a.d < b.d ? 1 : -1).forEach((e: any) => rows.push([e.d, e.rt, PG.vagonNo(e.v), e.v.type || '', e.src]));
            PG.xlsxDl(rows, 'Vagon tamiri ' + (SLF.rt && SLF.rt !== 'all' ? SLF.rt : 'barchasi'));
        }
        try { PG.agmkModule({ id: 'salohiyat', icon: '🏭', title: 'Ishlab chiqarish koʻrsatkichlari', search: 'ishlab chiqarish korsatkichlari korxona salohiyati ruda tashish kkd nakpaysay xodka nakladnoy vagon ishlab chiqarish tonna xodka oylik yillik hisobot vagon tamiri sxema grafik', desc: 'Ruda tashish va vagon taʼmiri — oylik/yillik', open: () => slOpen() }); } catch (e) { console.error('v4.3 salohiyat', e); }

        // ---------- uslub ----------
        (function () {
            const st = document.createElement('style'); st.textContent = `
            #screen-probeg .sec-body,#screen-sl-ruda .sec-body,#screen-sl-tamir .sec-body{padding:0 0 90px;background:#0b1324!important;background-image:none!important}
            .vgm{display:grid;gap:14px;padding:6px 2px}.vgm-c{display:flex;align-items:center;gap:14px;padding:22px 16px;border-radius:20px;cursor:pointer;border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 24px rgba(0,0,0,.35)}
            .vgm-c.c{background:linear-gradient(135deg,#c2410c,#7c2d12 60%,#0b1324)}.vgm-c.d{background:linear-gradient(135deg,#0369a1,#1e3a8a 60%,#0b1324)}.sl-rts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:4px 0 10px}.sl-rtb{display:flex;flex-direction:column;align-items:center;padding:10px 4px;border-radius:14px;border:1px solid rgba(255,255,255,.15);border-top:4px solid var(--c);background:rgba(15,23,42,.75);color:#e8eefc}.sl-rtb b{font-size:18px}.sl-rtb small{font-size:10px;color:#93a3c4;text-align:center;line-height:1.2;min-height:24px}.sl-rtb i{font-style:normal;font-weight:800;color:var(--c)}.sl-rtb.on{background:rgba(37,99,235,.25);box-shadow:0 0 0 2px var(--c) inset}.sl-md{border-top:1px solid #2a3a5c;padding:6px 0}.sl-md summary{display:flex;justify-content:space-between;cursor:pointer}.sl-md summary i{font-style:normal;color:#93c5fd}.sl-vn{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.sl-vn span{padding:4px 7px;border-radius:8px;background:#1e293b;font-size:12px;cursor:pointer}.sl-vn small{margin-left:4px;color:#93a3c4}.pg-end{text-align:center;color:#93a3c4;font-size:13px;margin:10px 0}.pg-end .pg-more{margin-top:8px}.vgm-c.e{background:linear-gradient(135deg,#6d28d9,#3b0764 60%,#0b1324);opacity:.92}.vgm-c.a{background:linear-gradient(135deg,#0f766e,#134e4a 60%,#0b1324)}.vgm-c.b{background:linear-gradient(135deg,#1d4ed8,#1e3a8a 60%,#0b1324)}
            .vgm-i{font-size:42px}.vgm-img{width:84px;height:auto;border-radius:10px;display:block}.vgm-t{flex:1;display:flex;flex-direction:column;gap:3px;color:#fff!important}.vgm-t b{font-size:21px;color:#fff!important}.vgm-t span{font-size:13px;color:#dbeafe!important}.vgm-t small{font-size:12px;color:#e2e8f0!important}.vgm-t i{font-style:normal;font-weight:800}.vgm-a{font-size:30px;color:#fff;opacity:.7}
            .pg{color:#e8eefc;font:14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}.pg button{font:inherit;color:inherit;cursor:pointer}
            .pg-hd{background:linear-gradient(160deg,#1e3a8a 0%,#0f2350 55%,#0b1324 100%);padding:12px 12px 12px;border-radius:0 0 22px 22px}.pg-hd.sl{background:linear-gradient(160deg,#7c2d12 0%,#3b1d4a 50%,#0b1324 100%)}
            .pg-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.pg-kpi div{background:#0b1324b0;border:1px solid #ffffff22;border-radius:13px;padding:7px 4px;text-align:center}
            .pg-kpi small{display:block;font-size:10px;color:#93a3c4;text-transform:uppercase}.pg-kpi b{font-size:20px}
            .pg-sw{display:grid;grid-template-columns:1fr 1fr;background:#0b1324;border:1px solid #2a3a5c;border-radius:14px;padding:4px;margin-top:10px}.pg-sw.sl{margin-top:0}
            .pg-sw button{border:0;border-radius:11px;padding:10px 4px;font-weight:700!important;font-size:15px!important;color:#93a3c4!important;background:none}
            .pg-sw .on.d{background:#22c55e;color:#05230f!important}.pg-sw .on.k{background:#3b82f6;color:#fff!important}.pg-sw.sl .on{background:#f97316;color:#fff!important}
            .pg-ppr{display:block;width:100%;margin-top:8px;padding:10px;border-radius:13px;border:1px solid #38bdf8;background:rgba(56,189,248,.14);color:#e0f2fe!important;font-weight:700!important}.pg-ppr small{font-weight:400;opacity:.75}
            .pg-sec{padding:10px 12px 0}.pg-types{display:flex;flex-wrap:wrap;gap:7px}
            .pg-t{background:#141f36;border:1px solid #2a3a5c;border-radius:14px;padding:7px 11px;font-weight:600;font-size:13px}.pg-t i,.pg-c i{font-style:normal;font-size:11px;background:#ffffff14;border-radius:8px;padding:1px 6px;color:#93a3c4}
            .pg-t.on{background:#0ea5e9;border-color:#0ea5e9;color:#fff!important}.pg-t.on i,.pg-c.on i{background:#ffffff33;color:#fff}
            .pg-sub{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center}.pg-c{background:#141f36;border:1px solid #2a3a5c;border-radius:20px;padding:5px 10px;font-size:12.5px;color:#cbd5e1!important}.pg-c.on{border-color:#7dd3fc;color:#e0f2fe!important;background:#0ea5e933}
            .pg-srch{display:flex;gap:7px;margin-top:9px}.pg-srch input{flex:1;min-width:0;background:#141f36;border:1px solid #2a3a5c;border-radius:12px;padding:9px 11px;color:#e8eefc;font-size:14px}
            .pg-srch select{background:#141f36;border:1px solid #2a3a5c;border-radius:12px;color:#e8eefc;padding:0 8px;font-size:13px;max-width:45%}.pg-cfg{background:#141f36;border:1px solid #2a3a5c;border-radius:12px;padding:0 11px}
            .pg-ov,.sl-card{margin:12px 12px 0;background:#141f36;border:1px solid #2a3a5c;border-radius:16px;padding:10px 10px 8px}.pg-ov h3,.sl-card h3{margin:0 0 4px;font-size:13.5px;color:#e8eefc}.pg-ov p,.sl-card p{margin:4px 0 0;font-size:11.5px;color:#93a3c4}
            .pg-ov svg{width:100%;height:120px;display:block}.sl-card svg{width:100%;display:block}
            .pg-lg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;color:#93a3c4;padding:8px 14px 0}.pg-lg.in{padding:6px 0 0}.pg-lg span{display:flex;align-items:center;gap:5px}.pg-lg u{display:inline-block;width:16px;height:9px;border-radius:3px}
            .pg-cnt{padding:8px 14px 4px;font-size:12px;color:#93a3c4}.sl-card .pg-cnt{padding:6px 0}
            .pgr{margin:7px 10px;background:#141f36;border:1px solid #2a3a5c;border-radius:15px;padding:9px 10px 8px;display:grid;grid-template-columns:30px 1fr;gap:0 8px;cursor:pointer}
            .pgr .n{grid-row:span 4;display:grid;place-items:center;font-weight:800;font-size:15px;color:#93a3c4;border-right:1px solid #2a3a5c}
            .pgr .rh{display:flex;align-items:baseline;gap:6px}.pgr .rh b{font-size:16px}.pgr .rh small{color:#93a3c4;font-size:11px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .pgr .tag{font-size:10.5px;font-weight:700;border-radius:9px;padding:2px 7px;white-space:nowrap}.pgr .tag.x{background:#7f1d1d;color:#fecaca}.pgr .tag.w{background:#713f12;color:#fde68a}.pgr .tag.o{background:#14532d;color:#bbf7d0}.pgr .tag.bl{background:#1e3a8a;color:#bfdbfe}
            .pgr .bars{margin-top:6px}.pgb{display:grid;grid-template-columns:22px 1fr 92px;align-items:center;gap:6px;height:32px}
            .pgb .l{font-size:11px;font-weight:800}.pgb.d .l{color:#22c55e}.pgb.k .l{color:#60a5fa}.pgb .trk{position:relative;height:15px}
            .pgb .bg{position:absolute;inset:2.5px 0;background:#0b1324;border-radius:3px}.pgb .fl{position:absolute;left:0;top:2.5px;bottom:2.5px;border-radius:3px}.pgb.d .fl{background:#22c55e}.pgb.k .fl{background:#3b82f6}
            .pgb .nl{position:absolute;top:-1px;bottom:-1px;width:2px;margin-left:-1px;background:#fff;border-radius:1px}
            .pgb .v{text-align:right;font-size:12px;white-space:nowrap}.pgb .v b{font-size:13px}.pgb .v em{font-style:normal;color:#93a3c4;font-size:10.5px;display:block;margin-top:1px}.pgb .v.x b{color:#f87171}.pgb .v.w b{color:#facc15}.pgb.dim{opacity:.55}
            .pgr .ft{grid-column:2;display:flex;justify-content:space-between;font-size:11px;color:#93a3c4;margin-top:3px;gap:6px}.pgr .ft b{color:#e8eefc}
            .pg-more{display:block;margin:10px auto;padding:10px 18px;border-radius:12px;border:1px solid #2a3a5c;background:#141f36}
            .pg-nm{margin:12px;background:rgba(14,165,233,.1);border:1px solid #0369a1;color:#bae6fd;border-radius:12px;padding:8px 10px;font-size:11.5px}
            .sl-seg{display:inline-flex;background:#141f36;border:1px solid #2a3a5c;border-radius:12px;padding:3px}.sl-seg button{border:0;background:none;border-radius:9px;padding:6px 10px;font-size:12.5px;font-weight:700;color:#93a3c4!important}.sl-seg .on{background:#334155;color:#fff!important}
            .sl-ch{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
            .sl-kpi{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px 0}.sl-kpi div{background:#141f36;border:1px solid #2a3a5c;border-radius:14px;padding:9px 11px}
            .sl-kpi small{display:block;font-size:11px;color:#93a3c4}.sl-kpi b{font-size:19px}.sl-kpi em{font-style:normal;font-size:11px;color:#93a3c4}
            .sl-f{font-size:11.5px;color:#93a3c4;background:#0b1324;border:1px dashed #2a3a5c;border-radius:10px;padding:7px 9px;margin-top:8px}.sl-f b{color:#e8eefc}
            .sl-t{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:6px}.sl-t th,.sl-t td{padding:5px 3px;white-space:nowrap;border-bottom:1px solid #2a3a5c;text-align:right;color:#e8eefc}.sl-t th{color:#93a3c4;font-weight:600;font-size:11px}
            .sl-t td:first-child,.sl-t th:first-child{text-align:left}.sl-t .up{color:#4ade80}.sl-t .dn{color:#f87171}.sl-t small{color:#93a3c4}.sl-t tr.sm td{border-top:2px solid #475569}
            .sl-w tr{cursor:pointer}.sl-bar{height:4px;background:#0b1324;border-radius:2px;margin-top:3px}.sl-bar i{display:block;height:100%;border-radius:2px}.sl-e{color:#93a3c4;text-align:center;padding:30px 0}
            .sl-lz{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#93a3c4;margin:2px 0 6px}.sl-lz b{color:#e8eefc}.sl-lz button{width:38px;height:32px;margin-left:6px;border-radius:10px;border:1px solid #2a3a5c;background:#0b1324;font-size:18px!important;font-weight:800!important}
            .sl-lbox{display:flex;background:#0b1324;border-radius:12px;border:1px solid #2a3a5c}.sl-card svg.sl-lax{flex:0 0 38px;width:38px!important}.sl-lw{flex:1;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;-webkit-overflow-scrolling:touch}.sl-card .sl-lw svg{display:block;width:auto;max-width:none}
            .sl-lh{font-size:11px!important}
            .sl-warn{margin:10px 12px 0;background:rgba(250,204,21,.1);border:1px solid #a16207;color:#fde68a;border-radius:14px;padding:10px 12px;font-size:12.5px;line-height:1.4}.sl-warn b{color:#fef08a}.sl-warn button{display:block;width:100%;margin-top:8px;padding:9px;border-radius:11px;border:1px solid #facc15;background:rgba(250,204,21,.18);color:#fef9c3!important;font-weight:700!important}
            .pg-ct td{padding:5px 6px}.pg-ct{margin:6px 0}`;
            document.head.appendChild(st);
        })();
