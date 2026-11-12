
        // =====================================================================
        // v3.6 — 🤖 KARYER → BUNKER: TARKIBLAR HARAKATINI AVTOMATIK REJALASH (DEMO)
        //  Eski GPS demo o'rniga: tarkiblar haqiqiy sxema yo'llari bo'ylab (TRK45 tarmog'idan yo'l topiladi)
        //  ekskavator → ko'rik (Qolmaqir / Porodnaya) → KKD yoki ODI bunkeri → ekskavator; tosh — otvalga.
        //  Ekskavatorga bittadan kiriladi, qolganlar navbatda. Ikki usul solishtiriladi:
        //   «Hozirgi usul» — tarkiblar ko'pchilik borgan ekskavatorga yuboriladi (navbat, boshqalari bo'sh)
        //   «Avtomatik»    — har tarkib eng tez bo'shaydigan ekskavatorga / bunkerga yuboriladi
        //  Raqamlar: foydalanuvchi aytgan vaqtlar (KR_CFG, «siz») + taxminlar («taxmin»). BAZAGA HECH NARSA YOZMAYDI.
        // =====================================================================
        var KR_CFG = {
            loadMin: [70, 70], loadLong: [90, 120], loadLongP: 0.4,           // siz: 1 soat 10 daq, cho'zilsa 2 soatgacha
            toInsp: [28, 40], insp: [45, 55], inspDefectP: 0.1, inspDefect: [15, 30], // siz: karyer→bunker 45–60 daq, Qolmaqir→bunker 17–20; ko'rik 45–55
            toBunker: [17, 20], kkd: [25, 45], kkdCap: 2, kkdTracks: 4,         // siz: KKD to'kish (me'yor 15) hozir 25–45, 4 yo'ldan 2 tasi bir vaqtda
            odi: [60, 120], odiCap: 2,                                          // siz: ODI 2 joy, 1–2 soat
            back: [45, 60],                                                     // taxmin: bo'sh qaytish (ko'riksiz)
            toOtv: [45, 55], otv: [20, 30], otvCap: 3,                          // taxmin: otval
            shift: [8, 20], shiftMin: 40, herdMax: 10, herdP: 0.8,                                       // taxmin: smena almashinuvi 08:00 va 20:00
            share: 0.7, vagons: 13                                              // siz: elektrovozlarning 70% i, har biriga 13 dumpkar (105/115 t)
        };
        // Ekskavatorlar (sxemadagi raqamlar, joyi — karyerdagi berk yo'llar; taxminiy)
        var KR_EX = [
            { nm: 'ЭКГ №6', k: 'ruda', p: [3347, 1799] }, { nm: 'ЭКГ №1', k: 'ruda', p: [3206, 1880] }, { nm: 'ЭКГ №16-13', k: 'ruda', p: [3881, 1704], d: 'l' },
            { nm: 'ЭКГ №14', k: 'ruda', p: [3859, 2162] }, { nm: 'ЭКГ №55', k: 'ruda', p: [3852, 1973] }, { nm: 'ЭКГ №17', k: 'ruda', p: [3812, 1781], d: 'l' },
            { nm: 'ЭКГ №11', k: 'porod', p: [3897, 1693], d: 'r' }, { nm: 'ЭКГ №32', k: 'porod', p: [3837, 1449], d: 'l' }, { nm: 'ЭКГ №2', k: 'porod', p: [3884, 1493], d: 'r' }
        ];
        var KR_PT = { kal: [2698, 1583], por: [2505, 1791], kkd: [800, 560], odi: [800, 650], otv: [3710, 1190] };
        var KR_NM = { kal: 'Qolmaqir (koʻrik)', por: 'Porodnaya (koʻrik)', kkd: 'KKD bunkeri', odi: 'ODI bunkeri', otv: 'Otval' };
        var KR_ST = {
            yuksiz: ['🔵', 'Boʻsh — ekskavatorga', '#38bdf8'], navbat_e: ['🟤', 'Ekskavator navbatida', '#b45309'], yuklash: ['🟠', 'Yuklanmoqda', '#f97316'],
            yukli: ['🟢', 'Yuk bilan harakatda', '#22c55e'], navbat_k: ['⚪', 'Koʻrik navbatida', '#cbd5e1'], korik: ['🔍', 'Koʻrikda', '#e2e8f0'],
            navbat_b: ['🟡', 'Bunker / otval navbatida', '#eab308'], tokish: ['🟣', 'Toʻkmoqda', '#a855f7']
        };
        var KR = { G: null, paths: {}, strat: 'avto', cmp: null, zBig: 99 };
        var KR_SH = { kal: 'Qolmaqir', por: 'Porodnaya', kkd: 'KKD', odi: 'ODI', otv: 'Otval' };
        // ---------- Tarmoq grafi (strelkalar — chiziq uchlari boshqa chiziqqa tutashgan joy) ----------
        function krGraph() {
            if (KR.G) return KR.G; if (typeof TRK45 === 'undefined') return null;
            const L = TRK45.net.filter(l => l.length > 1), nodes = [], par = [], key = (x, y) => nodes.push([x, y]) - 1;
            const find = a => { while (par[a] !== undefined && par[a] !== a) a = par[a]; return a; }, union = (a, b) => { a = find(a); b = find(b); if (a !== b) par[a] = b; };
            const ln = L.map(l => l.map(() => -1)), ins = L.map(() => []);
            L.forEach((l, i) => [0, l.length - 1].forEach(j => { if (ln[i][j] < 0) ln[i][j] = key(l[j][0], l[j][1]); }));
            L.forEach((l, i) => [0, l.length - 1].forEach(j => {
                const p = l[j], n = ln[i][j];
                L.forEach((m, k) => { if (k === i) return; let best = null;
                    for (let s = 0; s + 1 < m.length; s++) { const a = m[s], b = m[s + 1], dx = b[0] - a[0], dy = b[1] - a[1], LL = dx * dx + dy * dy || 1; let u = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / LL; u = Math.max(0, Math.min(1, u)); const d = Math.hypot(p[0] - a[0] - dx * u, p[1] - a[1] - dy * u); if (d < 3 && (!best || d < best.d)) best = { s: s, u: u, d: d }; }
                    if (!best) return;
                    if (best.u < 1e-6 && best.s === 0) { union(n, ln[k][0]); return; }
                    if (best.u > 1 - 1e-6 && best.s + 1 === m.length - 1) { union(n, ln[k][m.length - 1]); return; }
                    const a = m[best.s], b = m[best.s + 1], pn = key(a[0] + (b[0] - a[0]) * best.u, a[1] + (b[1] - a[1]) * best.u); union(n, pn); ins[k].push({ s: best.s, u: best.u, n: pn });
                });
            }));
            let adj = new Map(); const add = (a, b) => { a = find(a); b = find(b); if (a === b) return; if (!adj.has(a)) adj.set(a, new Set()); adj.get(a).add(b); };
            L.forEach((l, i) => { const seq = []; l.forEach((p, j) => { seq.push(ln[i][j] >= 0 ? ln[i][j] : key(p[0], p[1])); ins[i].filter(x => x.s === j && x.u > 1e-6 && x.u < 1 - 1e-6).sort((a, b) => a.u - b.u).forEach(x => seq.push(x.n)); }); for (let q = 0; q + 1 < seq.length; q++) { add(seq[q], seq[q + 1]); add(seq[q + 1], seq[q]); } });
            let ch = true; while (ch) { ch = false; for (const [a, set] of adj) { for (const b of set) { if (find(a) !== a || find(b) !== b || a === b) continue; const pa = nodes[a], pb = nodes[b]; if (Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) < 1.5) { union(b, a); ch = true; } } } if (ch) { const old = Array.from(adj); adj = new Map(); old.forEach(([a, set]) => set.forEach(b => add(a, b))); } }
            const comp = new Map(); let c = 0, best = 0, bestC = 0; adj.forEach((_, n) => { if (comp.has(n)) return; c++; let sz = 0; const st = [n]; comp.set(n, c); while (st.length) { const x = st.pop(); sz++; (adj.get(x) || []).forEach(y => { if (!comp.has(y)) { comp.set(y, c); st.push(y); } }); } if (sz > best) { best = sz; bestC = c; } });
            KR.G = { nodes: nodes, adj: adj, find: find, comp: comp, main: bestC };
            return KR.G;
        }
        function krNear(p, dead) { const G = krGraph(); let b = -1, bd = 1e9; G.adj.forEach((s, n) => { if (G.comp.get(n) !== G.main || (dead ? s.size !== 1 : s.size < 2)) return; const q = G.nodes[n], d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; b = n; } }); return b; }
        // Yo'l: keskin burilishsiz (≤60°), orqaga yurish — jarima bilan; «avoid» — shu qirralardan qochish (qarama-qarshi yo'nalish parallel yo'ldan)
        function krRoute(from, to, avoid) {
            const G = krGraph(), P = n => G.nodes[n], cosMax = 0.5, dist = new Map(), prev = new Map(), heap = [];
            const push = (k, d) => { heap.push([d, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
            const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
            const w = (a, b) => { const l = Math.hypot(P(a)[0] - P(b)[0], P(a)[1] - P(b)[1]); return avoid && avoid.has(a + '>' + b) ? l * 2.5 : l; };
            (G.adj.get(from) || []).forEach(b => { const k = from + '>' + b, d = w(from, b); dist.set(k, d); push(k, d); });
            let end = null;
            while (heap.length) {
                const [d, k] = pop(); if (d > dist.get(k)) continue; const ab = k.split('>'), a = +ab[0], b = +ab[1];
                if (b === to) { end = k; break; }
                const ax = P(b)[0] - P(a)[0], ay = P(b)[1] - P(a)[1], al = Math.hypot(ax, ay) || 1;
                (G.adj.get(b) || []).forEach(c => { const bx = P(c)[0] - P(b)[0], by = P(c)[1] - P(b)[1], bl = Math.hypot(bx, by) || 1; const pen = (c === a || (ax * bx + ay * by) / al / bl < cosMax) ? 500 : 0;
                    const k2 = b + '>' + c, nd = d + w(b, c) + pen; if (nd < (dist.has(k2) ? dist.get(k2) : 1e18)) { dist.set(k2, nd); prev.set(k2, k); push(k2, nd); } });
            }
            if (!end) return null;
            const ks = []; let k = end; while (k) { ks.push(k); k = prev.get(k); } ks.reverse();
            const pts = [P(+ks[0].split('>')[0])]; ks.forEach(x => pts.push(P(+x.split('>')[1])));
            const P2 = gdMk(pts.map(q => [q[0], q[1]])); P2.edges = new Set(ks); P2.sk = ks; return P2;
        }
        function krPath(a, b) { // a, b — joy kalitlari ('ex3', 'kal', 'kkd' ...)
            const k = a + '>' + b; if (KR.paths[k]) return KR.paths[k];
            const back = KR.paths[b + '>' + a], av = back ? new Set([...back.edges].map(e => e.split('>').reverse().join('>'))) : null; // qarshi yo'nalish — iloji bo'lsa boshqa (parallel) yo'ldan
            const P = krRoute(KR.node[a], KR.node[b], av); if (P) P.key = 'kr:' + k; return (KR.paths[k] = P);
        }
        function krPrep() {
            if (KR.node) return true; const G = krGraph(); if (!G) return false;
            KR.node = {}; KR_EX.forEach((e, i) => { KR.node['ex' + i] = krNear(e.p, true); });
            Object.keys(KR_PT).forEach(k => { KR.node[k] = krNear(KR_PT[k], false); });
            return Object.values(KR.node).every(n => n >= 0);
        }
        // ---------- Simulyatsiya ----------
        function krRng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
        function krUnits() {
            const free = v => !hrInRepair(v) && v.status !== 'Tamirda', byNo = (a, b) => String(vagonNo(a)).localeCompare(String(vagonNo(b)), undefined, { numeric: true });
            const el = onlyLoks().filter(v => hdKind(v) === 'el'), n = Math.round(el.length * KR_CFG.share);
            const loks = el.filter(free).sort((a, b) => String(a.type).localeCompare(String(b.type)) || byNo(a, b)).slice(0, n);
            const pri = v => (v.status === "Ta'mir talab" ? 1 : 0);
            const vags = onlyVagons().filter(v => /Dumpkar 1(05|15)/.test(v.type) && free(v)).sort((a, b) => pri(a) - pri(b) || byNo(a, b));
            return { elN: el.length, n: n, loks: loks, vags: vags, reserve: el.filter(v => !loks.includes(v)) };
        }
        function krNew(strat, seed) {
            if (!krPrep()) return null;
            const U = krUnits(), C = KR_CFG, S = { strat: strat, t: 0, rnd: krRng(seed || 7), trains: [], ex: KR_EX.map((e, i) => ({ i: i, nm: e.nm, k: e.k, key: 'ex' + i, q: [], cur: null, busy: 0, idle: 0, loads: 0 })),
                res: { kal: { cap: 2, cur: [], q: [] }, por: { cap: 2, cur: [], q: [] }, kkd: { cap: C.kkdCap, cur: [], q: [] }, odi: { cap: C.odiCap, cur: [], q: [] }, otv: { cap: C.otvCap, cur: [], q: [] } },
                st: { bunker: 0, kkd: 0, odi: 0, otv: 0, waitE: 0, waitB: 0, waitK: 0, trips: 0 }, log: [], U: U };
            const nR = Math.round(U.loks.length * 0.7); let k = 0;
            U.loks.forEach((l, i) => {
                const vs = U.vags.slice(k, k + C.vagons); k += vs.length;
                const t = { no: i + 1, lok: l, vags: vs, route: 'kar', role: i < nR ? 'ruda' : 'porod', kst: 'yuksiz', ph: 'go', leg: null, d: 0, spd: 1, v: 0, until: 0, tgt: null, lastEx: null, qAt: 0 };
                t.len = [l].concat(vs).reduce((s, u) => s + gdUnitLen(u), 0) + vs.length * 0.15;
                S.trains.push(t);
            });
            S.trains.forEach((t, i) => { const pool = S.ex.filter(e => e.k === t.role); const e = pool[i % pool.length]; krGoEx(S, t, e, i % 2 ? 'kkd' : 'kal', (i * 7) % 50); });
            // boshlang'ich joylar: bir yo'lda ketma-ket, oralig'ida xavfsiz masofa (ustma-ust emas)
            const off = {}; S.trains.slice().reverse().forEach(t => { const k = t.from; const o = off[k] || 0; if (t.leg) t.d = Math.min(t.leg.len * 0.8, o); off[k] = o + t.len + KR_GAP + 2; });
            return S;
        }
        function krR(S, r) { return r[0] + S.rnd() * (r[1] - r[0]); }
        function krLeg(S, t, from, to, minR, kst) {
            const P = krPath(from, to); t.prevLeg = t.leg; t.leg = P; t.d = 0; t.from = from; t.to = to; t.kst = kst; t.ph = 'go';
            const dur = krR(S, minR) * 60; t.v = P ? P.len / dur : 0; t.arr = S.t + dur;
            if (t.prevLeg && P) { const a = gdAt(t.prevLeg, t.prevLeg.len), b = gdAt(P, 0); t.rev = Math.cos(a.ang - b.ang) < 0; } else t.rev = true;
        }
        function krExFree(S, e) { // ekskavator qachon bo'shaydi (hozirgi yuklash + navbat + yo'ldagi tarkiblar)
            const L = KR_CFG.loadMin[0] * 60; let f = Math.max(S.t, e.cur ? e.cur.until : S.t);
            f += e.q.length * L; S.trains.forEach(o => { if (o.tgt === e && o.ph === 'go') f += L; }); return f;
        }
        function krPickEx(S, t, from) {
            const pool = S.ex.filter(e => e.k === t.role), C = KR_CFG, tr = (t.role === 'ruda' ? C.back : C.toOtv)[0] * 60;
            if (S.strat === 'hozir') { // hozirgi amaliyot: ko'pchilik borgan (eng «mashhur») ekskavatorga
                if (S.rnd() < C.herdP) { let best = null, bn = -1; pool.forEach(e => { const n = e.q.length + (e.cur ? 1 : 0) + S.trains.filter(o => o.tgt === e && o.ph === 'go').length; if (n > bn && n < C.herdMax) { bn = n; best = e; } }); if (best) return best; }
                return pool[Math.floor(S.rnd() * pool.length)];
            }
            let best = null, bt = 1e18; pool.forEach(e => { const f = Math.max(S.t + tr, krExFree(S, e)); if (f < bt - 1) { bt = f; best = e; } }); return best;
        }
        function krResFree(S, k) { const R = S.res[k], C = KR_CFG, u = (k === 'kkd' ? C.kkd : k === 'odi' ? C.odi : k === 'otv' ? C.otv : C.insp); const mean = (u[0] + u[1]) / 2 * 60; const busy = R.cur.map(o => o.until).sort((a, b) => a - b); const enr = S.trains.filter(o => o.tgt === k && o.ph === 'go').length; return S.t + Math.max(0, (R.q.length + enr + R.cur.length - R.cap + 1)) * mean / R.cap; }
        function krGoEx(S, t, e, from, extraMin) {
            t.tgt = e; S.log.push({ t: S.t, no: t.no, x: '→ ' + e.nm });
            const C = KR_CFG, r = from === 'otv' ? C.toOtv : C.back; krLeg(S, t, from, e.key, [r[0] + (extraMin || 0), r[1] + (extraMin || 0)], 'yuksiz');
        }
        function krArrive(S, t) {
            t.ph = 'q'; t.qAt = S.t; const k = t.to;
            if (/^ex/.test(k)) { const e = t.tgt; e.q.push(t); t.kst = 'navbat_e'; return; }
            const R = S.res[k]; R.q.push(t); t.kst = (k === 'kal' || k === 'por') ? 'navbat_k' : 'navbat_b';
        }
        function krShift(S) { const h = (S.t / 3600) % 24; return KR_CFG.shift.some(s => h >= s && h < s + KR_CFG.shiftMin / 60); }
        function krStep(S, dt) {
            S.t += dt; const C = KR_CFG;
            // harakat
            krMove(S, dt);
            // ekskavatorlar
            S.ex.forEach(e => {
                if (e.cur && S.t >= e.cur.until) { const t = e.cur; e.cur = null; e.loads++; t.lastEx = e; krAfterLoad(S, t); }
                if (!e.cur && e.q.length && !krShift(S)) { const t = e.q.shift(); S.st.waitE += S.t - t.qAt; e.cur = t; t.ph = 'svc'; t.kst = 'yuklash'; t.until = S.t + (S.rnd() < C.loadLongP ? krR(S, C.loadLong) : krR(S, C.loadMin)) * 60; }
                if (e.cur) e.busy += dt; else e.idle += dt;
                if (e.cur && e.cur.leg) { e.cur.d = e.cur.leg.len; e.cur.slot = 0; } krFill(e.q, e.cur ? e.cur.len + KR_GAP : 0);
            });
            // ko'rik, bunker, otval
            Object.keys(S.res).forEach(k => {
                const R = S.res[k];
                R.cur = R.cur.filter(t => { if (S.t < t.until) return true; krAfterRes(S, t, k); return false; });
                while (R.cur.length < R.cap && R.q.length) {
                    const t = R.q.shift(); const ins = k === 'kal' || k === 'por'; S.st[ins ? 'waitK' : 'waitB'] += S.t - t.qAt; t.ph = 'svc'; t.kst = ins ? 'korik' : 'tokish';
                    const u = ins ? krR(S, C.insp) + (S.rnd() < C.inspDefectP ? krR(S, C.inspDefect) : 0) : krR(S, k === 'kkd' ? C.kkd : k === 'odi' ? C.odi : C.otv);
                    t.until = S.t + u * 60; R.cur.push(t);
                }
                R.cur.forEach((t, i) => { if (t.leg) t.d = t.leg.len; t.slot = i; }); // stansiyada parallel yo'llarda (har biri o'z yo'lida)
                krFill(R.q, R.cur.length ? Math.max(...R.cur.map(o => o.len)) + KR_GAP : 0);
            });
        }
        // ---------- Yo'l bo'laklari (blok-uchastka): bir bo'lakda bir yo'nalishda bitta tarkib; ustma-ust chiqish yo'q ----------
        var KR_GAP = 4;
        function krSeg(P, d) { const c = P.cum; let lo = 0, hi = c.length - 1; if (d <= 0) return 0; if (d >= P.len) return c.length - 2; while (lo < hi - 1) { const m = (lo + hi) >> 1; if (c[m] <= d) lo = m; else hi = m; } return lo; }
        function krOcc(S) { // har yo'naltirilgan bo'lak → undagi tarkiblar (bo'lak ichidagi [orqa, old] oralig'i bilan)
            const O = new Map();
            S.trains.forEach(t => { const P = t.leg; if (!P || !P.sk) return; const a = Math.max(0, t.d - t.len), b = Math.max(0, t.d), i0 = krSeg(P, a), i1 = krSeg(P, b);
                for (let i = i0; i <= i1; i++) { const k = P.sk[i]; if (!k) continue; const s0 = P.cum[i]; (O.get(k) || O.set(k, []).get(k)).push({ t: t, r: Math.max(0, a - s0), f: Math.min(P.cum[i + 1] - s0, b - s0) }); } });
            return O;
        }
        function krFill(Q, gap0) { // navbat: faqat oldinga siljiydi (orqaga sakramaydi), oralig'ida xavfsiz masofa
            let g = gap0; Q.forEach(t => { if (!t.leg) return; t.slot = 0; const want = t.leg.len - g; t.d = Math.max(t.d, Math.min(want, t.leg.len)); g = (t.leg.len - t.d) + t.len + KR_GAP; });
        }
        function krMove(S, dt) {
            const O = krOcc(S), opp = k => { const ab = k.split('>'); return ab[1] + '>' + ab[0]; };
            S.trains.forEach(t => { t.lane = t.ph === 'svc' ? (t.slot || 0) : 0; t.pass = 0; });
            // qarama-qarshi yo'nalishdagilar — har biri o'z yo'nalishining o'ng tomonidan (parallel yo'ldek), ustma-ust tushmaydi
            O.forEach((L, k) => { const R = O.get(opp(k)); if (R && R.length) { L.forEach(o => { o.t.lane = 1; }); R.forEach(o => { o.t.lane = 1; }); } });
            S.trains.forEach(t => {
                if (t.ph !== 'go' || !t.leg) return; const P = t.leg; let nd = Math.min(P.len, t.d + t.v * dt), lim = nd;
                if (P.sk) { const i0 = krSeg(P, t.d), i1 = krSeg(P, Math.min(P.len, nd + KR_GAP));
                    for (let i = i0; i <= i1; i++) { const L = O.get(P.sk[i]); if (!L) continue; const s0 = P.cum[i];
                        L.forEach(o => { if (o.t === t) return; const head = s0 + o.f, ahead = head > t.d + 1e-6 || (Math.abs(head - t.d) <= 1e-6 && o.t.no < t.no); if (!ahead) return;
                            // stansiyada turgan (navbat / xizmat) boshqa manzilli tarkib yonidagi yo'ldan o'tib ketiladi
                            if (o.t.ph !== 'go' && o.t.to !== t.to) return; // stansiyada turgan boshqa manzilli tarkib yonidan o'tiladi (pastda — yon yo'l)
                            lim = Math.min(lim, s0 + o.r - KR_GAP); if (o.t.ph !== 'go' && o.t.to === t.to) t.joinQ = 1; }); } }
                lim = Math.max(t.d, lim); t.blk = lim < nd - 1e-6; t.spd = t.blk && lim <= t.d + 1e-6 ? 0 : 1;
                if (t.blk) t.arr += dt * (1 - (lim - t.d) / Math.max(1e-6, nd - t.d)); // kutilgan vaqt kechikadi
                const d0 = t.d; t.d = lim;
                // band qilingan bo'laklar darhol yangilanadi (keyingi tarkib shu qadamda ham ko'radi)
                if (P.sk && t.d > d0) { const a = Math.max(0, t.d - t.len), i0 = krSeg(P, a), i1 = krSeg(P, t.d); for (let i = i0; i <= i1; i++) { const k = P.sk[i]; if (!k) continue; const s0 = P.cum[i]; (O.get(k) || O.set(k, []).get(k)).push({ t: t, r: Math.max(0, a - s0), f: Math.min(P.cum[i + 1] - s0, t.d - s0) }); } }
                if (t.d >= P.len - 1e-6 || (t.joinQ && t.blk && t.d >= P.len * 0.3)) { t.joinQ = 0; krArrive(S, t); } else t.joinQ = 0;
            });
            // turgan (navbat / xizmat) tarkib yonidan o'tayotgani — yon yo'lda chiziladi
            const O2 = krOcc(S);
            O2.forEach(Lx => { Lx.forEach(A => { if (A.t.ph !== 'go') return; Lx.forEach(B => { if (B.t === A.t || B.t.ph === 'go' || B.t.to === A.t.to) return; if (Math.min(A.f, B.f) - Math.max(A.r, B.r) > 0) A.t.lane = Math.max(A.t.lane, (B.t.lane || 0) + 1); }); }); });
        }
        function krAfterLoad(S, t) {
            const e = t.lastEx, C = KR_CFG;
            if (t.role === 'porod') { t.tgt = 'otv'; krLeg(S, t, e.key, 'otv', C.toOtv, 'yukli'); return; }
            let ins = 'kal'; // ko'rik: avtomatik — bo'shrog'i; hozirgi — asosan Qolmaqir
            if (S.strat === 'avto') { const a = krResFree(S, 'kal') + krPath(e.key, 'kal').len / 3, b = krResFree(S, 'por') + krPath(e.key, 'por').len / 3; ins = a <= b ? 'kal' : 'por'; } else if (S.rnd() < 0.15) ins = 'por';
            t.tgt = ins; const P = krPath(e.key, ins), Pk = krPath(e.key, 'kal'), sc = P.len / Pk.len; krLeg(S, t, e.key, ins, [C.toInsp[0] * sc, C.toInsp[1] * sc], 'yukli');
        }
        function krAfterRes(S, t, k) {
            const C = KR_CFG;
            if (k === 'kal' || k === 'por') { // ko'rikdan keyin — bunker tanlash
                let b = 'kkd'; if (S.strat === 'avto') b = krResFree(S, 'kkd') + (C.kkd[0] + C.kkd[1]) * 30 <= krResFree(S, 'odi') + (C.odi[0] + C.odi[1]) * 30 ? 'kkd' : 'odi'; else if (S.rnd() < 0.3) b = 'odi';
                t.tgt = b; S.log.push({ t: S.t, no: t.no, x: '→ ' + KR_NM[b] });
                const P = krPath(k, b), P0 = krPath('kal', 'kkd'), sc = P.len / P0.len; krLeg(S, t, k, b, [C.toBunker[0] * sc, C.toBunker[1] * sc], 'yukli'); return;
            }
            S.st.trips++; if (k === 'otv') S.st.otv++; else { S.st.bunker++; S.st[k]++; }
            const e = krPickEx(S, t, k); krGoEx(S, t, e, k, k === 'odi' ? 5 : 0);
        }
        // 24 soat — ikki usulni solishtirish (ko'rinmas, tez)
        function krCompare() {
            if (KR.cmp) return KR.cmp; const out = {};
            ['hozir', 'avto'].forEach(s => { const S = krNew(s, 11); if (!S) return; for (let i = 0; i < 2 * 24 * 120; i++) krStep(S, 30); // 2 kun: 1-kun — tarqalish, 2-kun — o'lchov
                const S2 = S; const b0 = Object.assign({}, S2.st), e0 = S2.ex.map(e => [e.busy, e.idle, e.loads]);
                for (let i = 0; i < 24 * 120; i++) krStep(S2, 30);
                const nR = S2.trains.filter(t => t.role === 'ruda').length, nP = S2.trains.length - nR, d = k => S2.st[k] - b0[k];
                out[s] = { trains: S2.trains.length, nR: nR, nP: nP, bunker: d('bunker'), kkd: d('kkd'), odi: d('odi'), otv: d('otv'), perR: d('bunker') / nR, perP: d('otv') / nP,
                    waitE: d('waitE') / Math.max(1, S2.ex.reduce((a, e, i) => a + e.loads - e0[i][2], 0)) / 60, waitB: d('waitB') / Math.max(1, d('trips')) / 60, waitK: d('waitK') / Math.max(1, d('bunker')) / 60,
                    ex: S2.ex.map((e, i) => ({ nm: e.nm, k: e.k, loads: e.loads - e0[i][2], busy: (e.busy - e0[i][0]) / 864 })), U: S2.U };
            });
            return (KR.cmp = out);
        }
        // ---------- GPS ekraniga ulash: eski demo o'rniga ----------
        (function () {
            if (typeof gdBuild !== 'function') return;
            gdBuild = function () {
                if (typeof TRK45 === 'undefined' || !krPrep()) return false;
                const S = krNew(KR.strat, 3); if (!S) return false;
                for (let i = 0; i < 6 * 120; i++) krStep(S, 30); // 00:00 dan 06:00 gacha — tarkiblar tarqaladi
                GD.kr = S; GD.t = S.t; GD.trains = S.trains.slice();
                S.U.reserve.forEach((l, i) => GD.trains.push({ no: S.trains.length + i + 1, lok: l, vags: [], route: 'zax', len: gdUnitLen(l) }));
                GD.statics = gdStatics(); GD.units = {}; GD.trains.forEach(t => { GD.units[t.lok.id] = t; (t.vags || []).forEach(v => { GD.units[v.id] = t; }); }); GD.statics.forEach(s => s.units.forEach(u => { GD.units[u.id] = s; }));
                GD.reserve = S.U.reserve; GD.built = true; return true;
            };
            gdStep = function (dt) { if (GD.kr) { krStep(GD.kr, dt); GD.t = GD.kr.t; } };
            GD_ST = KR_ST;
            gdState = function (t) { return t.route === 'zax' ? 'yuksiz' : t.kst || 'yuksiz'; };
            gdCounts = function () { const c = {}; GD.trains.forEach(t => { if (t.route === 'zax') return; const s = gdState(t); c[s] = (c[s] || 0) + 1; }); return c; };
            gdStatusTxt = function () { if (!GD.built) { const U = krUnits(); return 'Karyer → KKD / ODI · ' + U.n + ' tarkib × 13 dumpkar (demo)'; } const c = gdCounts(); return Object.keys(KR_ST).filter(k => c[k]).map(k => KR_ST[k][0] + ' ' + c[k]).join(' · '); };
            gdWhereTrain = function (t) {
                if (t.route === 'zax') return 'Lokomotiv deposida — zaxirada (30%)';
                const S = GD.kr, nm = k => /^ex/.test(k) ? S.ex[+k.slice(2)].nm : KR_NM[k] || k, min = s => Math.max(0, Math.ceil(s / 60));
                if (t.ph === 'go') return (t.kst === 'yukli' ? 'Yuk bilan' : 'Boʻsh') + ': ' + nm(t.from) + ' → ' + nm(t.to) + ' · ~' + min(t.arr - S.t) + ' daq qoldi';
                if (t.ph === 'svc') return nm(t.to) + ' · ' + KR_ST[t.kst][1] + ' · yana ~' + min(t.until - S.t) + ' daq';
                const q = /^ex/.test(t.to) ? t.tgt.q : S.res[t.to].q; return nm(t.to) + ' · navbatda ' + (q.indexOf(t) + 1) + '-oʻrinda · ' + min(S.t - t.qAt) + ' daq kutmoqda';
            };
            gdInfo = function (no) {
                const t = GD.trains.find(x => x.no === no); if (!t) return; GD.sel = no; const E = escapeHtml, st = KR_ST[gdState(t)];
                mdl('gdModal', `<div class="px-h"><b>🚆 Tarkib №${t.no} <small>(demo)</small></b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                    <div class="nd-tip">${st[0]} ${E(st[1])} · ${E(gdWhereTrain(t))}</div>
                    <div class="nd-tip">🛤 ${t.route === 'zax' ? 'Zaxirada' : t.role === 'ruda' ? 'Ruda: ekskavator → koʻrik (Qolmaqir / Porodnaya) → KKD yoki ODI → ekskavator' : 'Tosh: ekskavator → otval → ekskavator'}</div>
                    ${hdTrain(t.lok, t.vags)}
                    <div class="nd-tip">Lokomotiv yoki vagonni bossangiz — pasporti ochiladi. 🧪 Namunaviy (sunʼiy) harakat: bazaga yozilmaydi.</div>`);
            };
            // qarama-qarshi yo'nalishdagi tarkiblar yonma-yon (parallel yo'ldek) chiziladi
            const KR_LANE = 3.2, sh = (q, n) => ({ x: q.x - Math.sin(q.ang) * KR_LANE * n, y: q.y + Math.cos(q.ang) * KR_LANE * n, ang: q.ang });
            const oUP = gdUnitsPos; gdUnitsPos = function (t) { const a = oUP.apply(this, arguments); if (t && t.lane && !t.static) a.forEach(o => { o.q = sh(o.q, t.lane); }); return a; };
            const oPos = gdPos; gdPos = function (t) { const p = oPos.apply(this, arguments); return t && t.lane && !t.static && p && !p.hide ? Object.assign({}, p, sh(p, t.lane)) : p; };
            const oDraw = gdDraw; gdDraw = function () { oDraw.apply(this, arguments); try { krMarkers(); } catch (e) { console.error(e); } };
            const oOpen = gdOpen; gdOpen = async function (f) { const first = !GD.fitted && (f === undefined || f === null); if (first) GD.fitted = true; await oOpen.apply(this, arguments); if (first) setTimeout(krFit, 200); };
            const oPanel = gdPanel; gdPanel = function () { oPanel.apply(this, arguments); try { krPanelExtra(); } catch (e) { console.error(e); } };
        })();
        function krMarkers() {
            const S = GD.kr, m = GD.map; if (!S || !m || !GD.lay) return; GD.krmk = GD.krmk || {};
            const put = (id, p, h) => { const ll = ygToLL(p[0], p[1]); let mk = GD.krmk[id]; if (!mk) { mk = GD.krmk[id] = L.marker(ll, { icon: L.divIcon({ className: 'gd-ic', html: h, iconSize: [0, 0] }), zIndexOffset: 400 }).addTo(GD.lay); mk._h = h; } else if (mk._h !== h) { mk._h = h; mk.setIcon(L.divIcon({ className: 'gd-ic', html: h, iconSize: [0, 0] })); } };
            const G = krGraph(), E = escapeHtml;
            S.ex.forEach(e => { const p = G.nodes[KR.node[e.key]], st = e.cur ? '⛏ yuklamoqda' : krShift(S) ? '⏸ smena' : '💤 boʻsh';
                const big = m.getZoom() >= KR.zBig, tiny = !big && m.getSize().x < 600 && m.getZoom() < KR.zBig - 1;
                put(e.key, p, `<div class="kr-mk ${e.cur ? 'on' : 'off'} ${e.k} d${KR_EX[e.i].d || 'u'}" title="${E(e.nm)} · ${st}">${big ? E(e.nm) + ' · ' + st : tiny ? '⛏' : '⛏' + E(e.nm.replace('ЭКГ ', ''))}${e.q.length ? (big ? ' · navbat ' : ' +') + e.q.length : ''}</div>`); });
            Object.keys(S.res).forEach(k => { const R = S.res[k], p = G.nodes[KR.node[k]], cap = k === 'kkd' ? ` (${KR_CFG.kkdTracks} yoʻl, ${R.cap} tasi ishlaydi)` : '';
                const big = m.getZoom() >= KR.zBig;
                put('r' + k, p, `<div class="kr-mk res ${k}">${big ? E(KR_NM[k]) + cap + ': ' + R.cur.length + '/' + R.cap + ' band' : E(KR_SH[k]) + ' ' + R.cur.length + '/' + R.cap}${R.q.length ? (big ? ' · navbat ' : ' +') + R.q.length : ''}</div>`); });
        }
        function krFit() { // karyer, ko'rik stansiyalari va bunkerlar bitta ekranda; pastki panel ostida qolmasin
            const m = GD.map; if (!m) return; const pts = KR_EX.map(e => e.p).concat(Object.values(KR_PT)), pn = $id('gdPanel'), ph = pn ? pn.offsetHeight : 0;
            m.invalidateSize(); const nar = m.getSize().x < 600; m.fitBounds(L.latLngBounds(pts.map(q => ygToLL(q[0], q[1]))), { animate: false, paddingTopLeft: nar ? [28, 40] : [70, 40], paddingBottomRight: [nar ? 16 : 50, Math.min(ph + 20, m.getSize().y * 0.6)] });
            KR.zBig = m.getZoom() + 1.75; gdDraw();
        }
        function krTodayStats(S) { const day = Math.floor(S.t / 86400) * 86400, h = (S.t - day) / 3600; return { h: h }; }
        function krPanelExtra() {
            const p = $id('gdPanel'), S = GD.kr; if (!p || !S) return; let x = $id('krCtl');
            if (!x) { x = document.createElement('div'); x.id = 'krCtl'; p.insertBefore(x, p.children[1] || null); }
            const idle = S.ex.filter(e => !e.cur).length;
            x.innerHTML = `<div class="kr-seg"><span>Taqsimlash:</span><button class="${KR.strat === 'hozir' ? 'on' : ''}" onclick="krSetStrat('hozir')">👷 Hozirgi usul</button><button class="${KR.strat === 'avto' ? 'on' : ''}" onclick="krSetStrat('avto')">🤖 Avtomatik</button><button onclick="krCmpOpen()">📊 24 soat</button></div>
                <div class="kr-kpi">⛏ Ekskavator: <b>${S.ex.length - idle}</b> ishlayapti · <b>${idle}</b> boʻsh · 🏭 Bunkerga toʻkildi: <b>${S.st.bunker}</b> · 🪨 Otvalga: <b>${S.st.otv}</b> <small>(06:00 dan beri hisob)</small></div>`;
        }
        function krSetStrat(s) { KR.strat = s; GD.built = false; if (GD.lay) { GD.lay.clearLayers(); GD.krmk = {}; } GD.trains.forEach(t => { t.mk = null; t.body = null; t.parts = null; }); (GD.statics || []).forEach(t => { t.mk = null; t.body = null; t.parts = null; }); gdBuild(); GD.kr.st = { bunker: 0, kkd: 0, odi: 0, otv: 0, waitE: 0, waitB: 0, waitK: 0, trips: 0 }; gdPanel(); gdDraw(); showToast(s === 'avto' ? '🤖 Avtomatik taqsimlash' : '👷 Hozirgi usul: koʻpchilik bitta ekskavatorga'); }
        // ---------- Natija oynasi: 24 soat ----------
        function krCmpHtml() {
            const R = krCompare(), a = R.avto, h = R.hozir, C = KR_CFG, r = x => x[0] === x[1] ? x[0] : x[0] + '–' + x[1]; if (!a || !h) return '<div class="nd-tip">Sxema maʼlumotlari topilmadi.</div>';
            const f = (n, d) => (Math.round(n * (d || 10)) / (d || 10)).toLocaleString('ru-RU'), row = (l, x, y, good) => `<tr><td>${l}</td><td>${x}</td><td class="${good ? 'ok' : ''}">${y}</td></tr>`;
            return `<div class="nd-tip">🧪 Demo hisob: ${a.trains} tarkib (elektrovozlarning ${Math.round(KR_CFG.share * 100)}% i: ${a.U.elN} tadan ${a.U.n} ta) × ${KR_CFG.vagons} dumpkar (105/115 t), ${KR_EX.filter(e => e.k === 'ruda').length} ta ruda va ${KR_EX.filter(e => e.k === 'porod').length} ta tosh ekskavatori. Ruda tarkiblari ${a.nR}, tosh — ${a.nP}.</div>
                <div class="gt-scroll"><table class="mt-t"><tr><th>Koʻrsatkich (1 kunda)</th><th>👷 Hozirgi usul</th><th>🤖 Avtomatik</th></tr>
                ${row('Bunkerga toʻkildi (tarkib)', h.bunker, a.bunker, a.bunker > h.bunker)}${row('… shundan KKD / ODI', h.kkd + ' / ' + h.odi, a.kkd + ' / ' + a.odi)}
                ${row('Bir ruda tarkibi kuniga, qatnov', f(h.perR), f(a.perR), a.perR > h.perR)}${row('Otvalga (tarkib)', h.otv, a.otv, a.otv > h.otv)}${row('Bir tosh tarkibi kuniga, qatnov', f(h.perP), f(a.perP), a.perP > h.perP)}
                ${row('Ekskavator navbatida kutish, oʻrtacha', f(h.waitE, 1) + ' daq', f(a.waitE, 1) + ' daq', a.waitE < h.waitE)}${row('Koʻrik navbati, oʻrtacha', f(h.waitK, 1) + ' daq', f(a.waitK, 1) + ' daq', a.waitK < h.waitK)}${row('Bunker / otval navbati, oʻrtacha', f(h.waitB, 1) + ' daq', f(a.waitB, 1) + ' daq', a.waitB < h.waitB)}</table></div>
                <div class="inf-sec">⛏ Ekskavatorlar bandligi (1 kunda)</div><div class="gt-scroll"><table class="mt-t"><tr><th>Ekskavator</th><th>👷 Hozirgi</th><th>🤖 Avtomatik</th></tr>${a.ex.map((e, i) => `<tr><td>${escapeHtml(e.nm)} <small>${e.k === 'ruda' ? 'ruda' : 'tosh'}</small></td><td>${h.ex[i].loads} tarkib · ${Math.round(h.ex[i].busy)}%</td><td>${e.loads} tarkib · ${Math.round(e.busy)}%</td></tr>`).join('')}</table></div>
                <div class="nd-tip">Hisob siz bergan vaqtlar boʻyicha: yuklash ${C.loadMin[0]} daq (${Math.round(C.loadLongP * 100)}% hollarda ${r(C.loadLong)}), karyer → koʻrik ${r(C.toInsp)}, koʻrik ${r(C.insp)} (${Math.round(C.inspDefectP * 100)}% hollarda +${r(C.inspDefect)}), Qolmaqir → bunker ${r(C.toBunker)}, KKD ${r(C.kkd)} (${C.kkdTracks} yoʻldan ${C.kkdCap} tasi), ODI ${r(C.odi)} (${C.odiCap} joy). Taxmin: boʻsh qaytish ${r(C.back)}, otval yoʻli ${r(C.toOtv)}, otvalda toʻkish ${r(C.otv)}, smena almashinuvi ${C.shift.map(h => String(h).padStart(2, '0') + ':00').join(' va ')} da ${C.shiftMin} daq. «Hozirgi usul»da dispetcher tarkiblarning ${Math.round(C.herdP * 100)}% ini koʻpchilik turgan ekskavatorga yuboradi (navbat ${C.herdMax} tagacha). Haqiqiy raqamlar kelgach aniqlashtiriladi.</div>`;
        }
        function krCmpOpen() { mdl('gdModal', `<div class="px-h"><b>📊 24 soat: hozirgi usul va avtomatik taqsimlash</b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>${krCmpHtml()}`, true); }
        // ---------- Dispetcherlik: «Avtomatik rejalash» sahifasi ----------
        function krOpen() {
            secScreen('screen-kr', '🤖 Avtomatik rejalash (demo)', 'openHR()'); openScreen('screen-kr');
            const b = secBody('screen-kr'); b.innerHTML = '<div class="nd-tip">⏳ Hisoblanmoqda…</div>';
            setTimeout(() => { try { b.innerHTML = `<div class="mm-tools"><button class="action-btn" onclick="gdOpen()">📡 GPS sxemada koʻrish</button></div>` + krCmpHtml() + krNextHtml(); } catch (e) { b.innerHTML = '<div class="nd-tip">⚠️ ' + escapeHtml(e.message) + '</div>'; } }, 30);
        }
        function krNextHtml() { // hozirgi demo holatidan oxirgi qarorlar
            const S = GD.kr; if (!S) return '<div class="nd-tip">GPS sxemani ochsangiz — dispetcher qarorlari (qaysi tarkib qaysi ekskavatorga / bunkerga) shu yerda koʻrinadi.</div>';
            const hm = s => { const x = Math.floor(s) % 86400; return String(Math.floor(x / 3600)).padStart(2, '0') + ':' + String(Math.floor(x / 60) % 60).padStart(2, '0'); };
            return '<div class="inf-sec">🧭 Dispetcher qarorlari (demo, oxirgi 15 ta)</div>' + S.log.slice(-15).reverse().map(l => `<div class="mm-card"><b>${hm(l.t)} · Tarkib №${l.no} ${escapeHtml(l.x)}</b></div>`).join('');
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = '.kr-mk{transform:translate(-50%,-140%);white-space:nowrap;width:max-content;font-size:11px;font-weight:700;padding:3px 7px;border-radius:9px;background:rgba(15,23,42,.88);border:1.5px solid #64748b;color:#e2e8f0}.kr-mk.on{border-color:#f97316}.kr-mk.off.ruda,.kr-mk.off.porod{border-color:#ef4444;color:#fecaca}.kr-mk.res{border-color:#a855f7}.kr-mk.res.odi,.kr-mk.res.por{transform:translate(-50%,40%)}.kr-mk.dl{transform:translate(calc(-100% - 8px),-50%)}.kr-mk.dr{transform:translate(8px,-50%)}.kr-seg{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0}.kr-seg span{font-size:12px;opacity:.8}.kr-seg button{padding:6px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(30,41,59,.9);color:#e2e8f0;font-size:12.5px}.kr-seg button.on{background:#0ea5e9;border-color:#38bdf8;font-weight:700}.kr-kpi{font-size:12px;opacity:.95;margin:4px 0}@media (min-width:720px){.kr-mk{font-size:13px}.kr-kpi{font-size:14px}}';
            document.head.appendChild(st);
        })();

