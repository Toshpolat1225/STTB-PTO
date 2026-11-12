        // =====================================================================
        // v2.5 — 📡 HARAKAT TARKIBI · GPS (DEMO) — alohida ekran
        //  • Tarkiblar faqat sxemadagi HAQIQIY yo'l chiziqlari bo'ylab yuradi (TRK45 — master.svg vektoridan)
        //  • Blok tizimi: bir yo'lga qarama-qarshi yo'nalishda kirilmaydi — biri stansiyada kutadi, ikkinchisi o'tadi;
        //    bir yo'nalishda — oraliq masofa saqlanadi; kesishmada — kim birinchi kirgan bo'lsa o'tadi
        //  • Svinsovaya: teplovozga ulangan sisterna tarkiblari (4 yo'lda), 4-TYS: xopper-dozator va platforma tarkiblari — turadi
        //  • Temir yo'l qatlami (LOD): uzoqda chiziq → shag'al → yaqinda ikki rels + shpallar
        //  • 📐 Sxema / 🛰 Real ko'rinish. Stansiya varag'i bu yerda ochilmaydi (u — Temir yo'l xaritasi bo'limida)
        //  • BAZAGA HECH NARSA YOZMAYDI. Haqiqiy GPS ulanganda shu ko'rinish ishlatiladi.
        // =====================================================================
        var GD = { on: false, run: false, spd: 10, t: 0, last: 0, trains: [], statics: [], built: false, units: {}, sel: null, map: null, lay: null, timer: null, legs: {}, cyc: {} };
        var GD_ST = { yuklash: ['🟠', 'Yuklanmoqda', '#f97316'], yukli: ['🟢', 'Yuk bilan harakatda', '#22c55e'], navbat: ['🟡', 'Bunker navbatida', '#eab308'], tokish: ['🟣', 'Toʻkmoqda', '#a855f7'], yuksiz: ['🔵', 'Boʻsh qaytmoqda', '#38bdf8'], kutish: ['⚪', 'Kutish yoʻlida', '#cbd5e1'] };
        var GD_M_PER_PT = 4.3, GD_ACTIVE = 18, GD_DEPO = [632.9, 205.3];
        var GD_LEN_M = { el: 21, tep: 17, lok: 18, dump: 15, hop: 11, cis: 12, yarim: 14, plat: 14.6, box: 14 };
        var GD_OPT_KEY = 'agmk_gd_view';
        function gdOpt() { const d = { view: 'sx', sxOp: 1 }; try { return Object.assign(d, JSON.parse(localStorage.getItem(GD_OPT_KEY) || '{}') || {}); } catch (e) { return d; } }
        function gdOptSet(p) { const o = Object.assign(gdOpt(), p); try { localStorage.setItem(GD_OPT_KEY, JSON.stringify(o)); } catch (e) {} return o; }
        function gdStatusTxt() { if (!GD.built) return 'Namunaviy harakat (demo) · ПЭ2 tarkiblari × 14 dumpkar'; const c = gdCounts(); return Object.keys(GD_ST).map(k => GD_ST[k][0] + ' ' + (c[k] || 0)).join(' · '); }
        function gdCounts() { const c = {}; GD.trains.forEach(t => { if (t.route === 'zax') return; const s = gdState(t); c[s] = (c[s] || 0) + 1; }); return c; }
        function gdUnitLen(u) { const k = hdKind(u); let m = GD_LEN_M[k] || 14; if (k === 'dump' && /60/.test(String(u.type))) m = 12.5; return m / GD_M_PER_PT; }
        // ---------- Geometriya ----------
        function gdMk(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts: pts, cum: cum, len: cum[cum.length - 1] }; }
        function gdAt(P, d) { d = Math.max(0, Math.min(P.len, d)); let lo = 0, hi = P.cum.length - 1; while (lo < hi - 1) { const m = (lo + hi) >> 1; if (P.cum[m] <= d) lo = m; else hi = m; } const a = P.pts[lo], b = P.pts[hi] || a, s = (P.cum[hi] - P.cum[lo]) || 1, f = (d - P.cum[lo]) / s; return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
        var GD_CELL = 4, GD_DS = 2;
        function gdCells(P) { const s = []; for (let d = 0; d <= P.len; d += GD_DS) { const a = gdAt(P, d); s.push({ d: d, k: Math.floor(a.x / GD_CELL) + ',' + Math.floor(a.y / GD_CELL), dx: Math.cos(a.ang), dy: Math.sin(a.ang) }); } return s; }
        // Yo'nalishli peregon ("leg"): TRK45 marshrutidan
        function gdLeg(pid, rev) {
            const key = pid + (rev ? '<' : '>'); if (GD.legs[key]) return GD.legs[key];
            const R = (typeof TRK45 !== 'undefined' && TRK45.routes[pid]) || null; if (!R) return null;
            const pts = R.map(q => [q[0], q[1]]); if (rev) pts.reverse();
            const P = gdMk(pts); P.key = key; P.pid = pid; P.cells = gdCells(P); P.map = new Map(); P.cells.forEach(c => { if (!P.map.has(c.k)) P.map.set(c.k, c); });
            GD.legs[key] = P; return P;
        }
        function gdOpp(A, B) { // qarama-qarshi yo'nalishda umumiy yo'l bormi
            if (A === B) return false; const ck = A.key + '|' + B.key; GD.opp = GD.opp || {}; if (ck in GD.opp) return GD.opp[ck];
            let r = false; const Z = 30; for (const c of A.cells) { if (c.d < Z || c.d > A.len - Z) continue; const o = B.map.get(c.k); if (o && o.d >= Z && o.d <= B.len - Z && c.dx * o.dx + c.dy * o.dy < -0.3) { r = true; break; } } // stansiya zonasi (±30 pt) hisobga olinmaydi
            GD.opp[ck] = GD.opp[B.key + '|' + A.key] = r; return r;
        }
        // Sikllar: leg — [pid, rev, yukli?, stansiya-nomi]; term — terminal holati
        function gdCycles() {
            const Lg = (pid, rev, y, to) => ({ leg: gdLeg(pid, rev), y: y, to: to });
            // Olmaliq: strelka (S) orqali stansiyaga kirib, yo'nalish almashtiriladi
            const fwd = [Lg('pr_kal_kol', 0, 1, 'kol'), Lg('S_kol', 1, 1, 'S'), Lg('olm_S', 1, 1, 'olm'), Lg('olm_S', 0, 1, 'S'), Lg('S_svi', 0, 1, 'svi')],
                back = [Lg('S_svi', 1, 0, 'S'), Lg('olm_S', 1, 0, 'olm'), Lg('olm_S', 0, 0, 'S'), Lg('S_kol', 0, 0, 'kol'), Lg('pr_kol_kal3', 0, 0, 'kal')];
            GD.cyc = {
                ruda: [{ term: 'yuklash', at: 'kal' }].concat(fwd, [Lg('svi_bun', 0, 1, 'bun'), { term: 'tokish', at: 'bun', bunker: true }, Lg('svi_bun', 1, 0, 'svi')], back, [{ term: 'kutish', at: 'kal' }]),
                med: [{ term: 'yuklash', at: 'kal' }].concat(fwd, [Lg('pr_svi_med', 0, 1, 'med'), { term: 'tokish', at: 'med' }, Lg('pr_svi_med', 1, 0, 'svi')], back, [{ term: 'kutish', at: 'kal' }])
            };
            return Object.values(GD.cyc).every(c => c.every(s => s.term || s.leg));
        }
        var GD_STN = { S: 'Olmaliq (strelka)', kal: 'Qalmoqqir', kol: 'Kolsevaya', olm: 'Olmaliq', svi: 'Svinsovaya', bun: 'Bunkernaya (MOF-2)', med: 'Mednaya' };
        function gdBuild() {
            if (typeof NET41 === 'undefined' || typeof TRK45 === 'undefined') return false;
            GD.legs = {}; GD.opp = {}; if (!gdCycles()) return false;
            const free = v => !hrInRepair(v) && v.status !== 'Tamirda';
            const byNo = (a, b) => String(vagonNo(a)).localeCompare(String(vagonNo(b)), undefined, { numeric: true });
            const loks = onlyLoks().filter(v => /^ПЭ2[МУ]$/i.test(String(v.type).trim()) && free(v)).sort((a, b) => String(a.type).localeCompare(String(b.type)) || byNo(a, b));
            const pri = v => (/105|115/.test(v.type) ? 0 : 2) + (v.status === "Ta'mir talab" ? 1 : 0);
            const vags = onlyVagons().filter(v => hdKind(v) === 'dump' && free(v)).sort((a, b) => pri(a) - pri(b) || byNo(a, b));
            GD.trains = []; let k = 0;
            loks.forEach((l, i) => {
                const ws = vags.slice(k, k + 14); k += ws.length;
                const r = i >= GD_ACTIVE ? 'zax' : i % 3 === 2 ? 'med' : 'ruda';
                const t = { no: i + 1, lok: l, vags: ws, route: r, ci: 0, leg: null, d: 0, wait: 0, spd: 0, ready: false, stn: 'kal', atLeg: null };
                t.len = [l].concat(ws).reduce((s, u) => s + gdUnitLen(u), 0) + ws.length * 0.15;
                GD.trains.push(t);
            });
            // Boshlang'ich: hammasi Qalmoqqirda turli vaqtda — keyin 3 soat oldindan "aylantirib" tarqatiladi
            const back = GD.cyc;
            GD.trains.forEach((t, i) => { if (t.route === 'zax') return; const c = back[t.route]; t.ci = c.length - 1; t.atLeg = c[c.length - 2].leg; t.wait = (i * 137) % 5400; });
            GD.statics = gdStatics();
            GD.units = {}; GD.trains.forEach(t => { GD.units[t.lok.id] = t; t.vags.forEach(v => { GD.units[v.id] = t; }); });
            GD.statics.forEach(s => s.units.forEach(u => { GD.units[u.id] = s; }));
            GD.reserve = onlyLoks().filter(v => hdKind(v) === 'el' && GD.trains.every(t => t.lok !== v));
            GD.t = 3 * 3600; for (let i = 0; i < 3 * 3600 / 5; i++) { GD.t += 5; gdStep(5); }
            GD.built = true; return true;
        }
        // Turgan tarkiblar (haqiqiy vagonlar bazadan; yo'q turdagi vagon to'qib chiqarilmaydi)
        function gdStatics() {
            const out = [], used = new Set(), free = v => !hrInRepair(v) && v.status !== 'Tamirda';
            const byNo = (a, b) => String(vagonNo(a)).localeCompare(String(vagonNo(b)), undefined, { numeric: true });
            const take = (f, n) => { const a = vagonlarData.filter(v => !used.has(v.id) && free(v) && f(v)).sort(byNo).slice(0, n); a.forEach(v => used.add(v.id)); return a; };
            const tep = () => take(v => hdKind(v) === 'tep', 1);
            (TRK45.svi || []).forEach((line, i) => {
                const P = gdMk(line), c = take(v => hdKind(v) === 'cis', 10), l = tep(); if (!c.length) return;
                out.push({ id: 'svi' + i, kind: 'svi', title: 'Svinsovaya · sisterna tarkibi №' + (i + 1), P: P, d: Math.min(P.len - 6, P.len * 0.62), units: l.concat(c) });
            });
            const tys = TRK45.tys || [], no = TRK45.tysNo || [];
            const plan = [[2, 'hop', 'xopper-dozator'], [4, 'hop', 'xopper-dozator'], [6, 'plat', 'platforma'], [7, 'plat', 'platforma'], [3, 'yarim', 'yarim vagon']];
            GD.missing = [];
            plan.forEach(p => { const line = tys[p[0]]; if (!line) return; const P = gdMk(line), c = take(v => hdKind(v) === p[1] && v.kind !== 'yol', 15); if (!c.length) { GD.missing.push(p[2]); return; }
                out.push({ id: 'tys' + p[0], kind: 'tys', title: '4-TYS · ' + (no[p[0]] || '') + '-yoʻl · ' + p[2] + ' tarkibi', P: P, d: Math.min(P.len - 4, 8 + c.reduce((s, u) => s + gdUnitLen(u), 0)), units: c }); });
            GD.missing = Array.from(new Set(GD.missing));
            out.forEach(s => { s.static = true; s.len = s.units.reduce((a, u) => a + gdUnitLen(u), 0); });
            return out;
        }
        function gdStep1(t) { return t.route === 'zax' ? { term: 'kutish', at: 'depo' } : GD.cyc[t.route][t.ci]; }
        function gdState(t) {
            const s = gdStep1(t);
            if (s.term) { if (s.term === 'tokish' && t.queue) return 'navbat'; return s.term; }
            return s.y ? 'yukli' : 'yuksiz';
        }
        function gdSpeedKmh(t) { const s = gdStep1(t); return s.term ? 0 : s.y ? 22 + (t.no % 5) : 30 + (t.no % 6); }
        // Tanadagi hujayralar (tail..head) va old zona
        function gdBody(t, fn, ahead) {
            const P = t.leg; if (!P) return; const c = P.cells, a = t.d - t.len, b = t.d + (ahead || 0);
            for (let i = Math.max(0, Math.floor(a / GD_DS)); i < c.length && c[i].d <= b; i++) fn(c[i], c[i].d > t.d);
            if (a < 0 && t.prevLeg && !t.rev) { const Q = t.prevLeg, cc = Q.cells, from = Q.len + a; for (let i = Math.max(0, Math.floor(from / GD_DS)); i < cc.length; i++) fn(cc[i], false); }
        }
        function gdStep(dt) {
            const ptPerS = kmh => kmh / 3.6 / GD_M_PER_PT;
            // 1) Bandlik xaritasi
            const occ = new Map(), front = new Map();
            GD.trains.forEach(t => { if (!t.leg) return; gdBody(t, (c, f) => { (f ? front : occ).set(c.k, t); }, 24); });
            // 2) Bunker: 2 ta to'kish joyi
            const tokN = GD.trains.filter(t => { const s = gdStep1(t); return s.term === 'tokish' && s.bunker && !t.queue; }).length; let bfree = Math.max(0, 2 - tokN);
            GD.trains.filter(t => t.queue).sort((a, b) => a.qAt - b.qAt).forEach(t => { if (bfree > 0) { bfree--; t.queue = false; t.wait = (8 + t.no % 7) * 60; } });
            // 3) Harakat
            GD.trains.slice().sort((a, b) => a.no - b.no).forEach(t => {
                if (t.route === 'zax') return;
                if (t.leg) {
                    const v = ptPerS(gdSpeedKmh(t)); let nd = Math.min(t.leg.len, t.d + v * dt); const gap = 14;
                    const c = t.leg.cells;
                    for (let i = Math.max(0, Math.floor(t.d / GD_DS)); i < c.length && c[i].d <= nd + gap; i++) {
                        if (c[i].d <= t.d) continue; const o = occ.get(c[i].k), f = front.get(c[i].k);
                        if ((o && o !== t) || (f && f !== t && f.no < t.no)) { nd = Math.min(nd, Math.max(t.d, c[i].d - gap)); break; }
                    }
                    t.spd = nd > t.d + 1e-6 ? gdSpeedKmh(t) : 0; t.d = nd;
                    gdBody(t, (cc, fr) => { (fr ? front : occ).set(cc.k, t); }, 24);
                    if (t.d >= t.leg.len - 0.01) { const s = gdStep1(t); t.atLeg = t.leg; t.prevLeg = t.leg; t.leg = null; t.stn = s.to; t.spd = 0; gdNext(t); }
                    return;
                }
                t.spd = 0; if (t.queue) return;
                if (t.wait > 0) { t.wait -= dt; if (t.wait > 0) return; }
                // stansiyada: keyingi qadamga o'tish
                const s = gdStep1(t);
                if (s.term) { gdNext(t); return; }
                if (!t.readyAt) t.readyAt = GD.t + (t.no % 7) * 0.001;
                if (gdCanGo(t, s.leg)) {
                    const rev = t.atLeg ? gdIsRev(t.atLeg, s.leg) : true;
                    if (rev && !t.revDone) { t.revDone = true; t.wait = 4 * 60; return; } // lokomotiv almashinuvi / aylanib o'tish
                    t.revDone = false; t.rev = rev; t.prevLeg = t.atLeg; t.leg = s.leg; t.d = rev ? Math.min(t.len, s.leg.len) : 0; t.readyAt = 0;
                    gdBody(t, (cc, fr) => { (fr ? front : occ).set(cc.k, t); }, 24);
                }
            });
        }
        function gdIsRev(A, B) { const a = gdAt(A, A.len), b = gdAt(B, 0); return Math.cos(a.ang - b.ang) < -0.3; }
        function gdCanGo(t, L) {
            for (const o of GD.trains) {
                if (o === t) continue;
                if (o.leg && gdOpp(L, o.leg)) return false; // qarama-qarshi yo'nalishda band
                if (!o.leg && o.readyAt && o.readyAt < t.readyAt && GD.t - o.readyAt > 1200) { const s = gdStep1(o); if (s.leg && s.leg !== L && gdOpp(L, s.leg)) return false; } // navbat adolati
            }
            // bir yo'nalishda: boshlanish qismi bo'shmi (oldingi tarkib dumi ketguncha kutadi)
            const rev = t.atLeg ? gdIsRev(t.atLeg, L) : true, need = (rev ? t.len : 0) + 30, busy = new Set();
            GD.trains.forEach(o => { if (o !== t && o.leg) gdBody(o, c => busy.add(c.k), 0); });
            for (const c of L.cells) { if (c.d > need) break; if (busy.has(c.k)) return false; }
            if (!rev && t.atLeg) { const A = t.atLeg; for (const c of A.cells) { if (c.d >= A.len - t.len && busy.has(c.k)) return false; } }
            return true;
        }
        function gdNext(t) {
            const c = GD.cyc[t.route]; t.ci = (t.ci + 1) % c.length; const s = c[t.ci];
            if (s.term) {
                const r = (a, b) => a + ((t.no * 9301 + t.ci * 49297 + Math.floor(GD.t)) % 233280) / 233280 * (b - a);
                t.stn = s.at;
                if (s.term === 'yuklash') t.wait = r(15, 30) * 60;
                else if (s.term === 'kutish') t.wait = r(5, 25) * 60;
                else if (s.term === 'tokish') { if (s.bunker) { t.queue = true; t.qAt = GD.t + t.no * 1e-4; t.wait = 0; } else t.wait = r(6, 12) * 60; }
            }
        }
        // ---------- Pozitsiya ----------
        function gdPos(t) {
            if (t.route === 'zax') return { x: GD_DEPO[0], y: GD_DEPO[1], ang: 0, zax: true };
            if (t.static) return gdAt(t.P, t.d - t.len / 2);
            if (t.leg) return gdAt(t.leg, t.d);
            const P = t.atLeg; if (!P) return { x: 0, y: 0, ang: 0 };
            const S = gdSide(P)[gdStnIdx(t)]; if (!S) { const q = gdAt(P, P.len); return { x: q.x, y: q.y, ang: q.ang, stnd: true, hide: true }; }
            const q = gdAt(S.Q, S.d); return { x: q.x, y: q.y, ang: S.s > 0 ? q.ang : q.ang + Math.PI, stnd: true, S: S };
        }
        // Stansiyada kutish uchun yon (parallel) yo'llar — sxemadagi haqiqiy chiziqlar; statik tarkiblar turgan yo'llar band
        function gdSide(P) {
            GD.side = GD.side || {}; if (GD.side[P.key]) return GD.side[P.key];
            if (!GD.netP) GD.netP = (TRK45.net || []).filter(l => l.length > 1).map(l => gdMk(l.map(q => [q[0], q[1]])));
            const e = gdAt(P, P.len), ex = Math.cos(e.ang), ey = Math.sin(e.ang), out = [];
            const busy = (GD.statics || []).map(s => gdAt(s.P, s.P.len / 2));
            GD.netP.forEach(Q => {
                let best = null;
                for (let i = 0; i + 1 < Q.pts.length; i++) { const a = Q.pts[i], b = Q.pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1; let u = ((e.x - a[0]) * dx + (e.y - a[1]) * dy) / L2; u = Math.max(0, Math.min(1, u)); const px = a[0] + dx * u, py = a[1] + dy * u, dd = Math.hypot(e.x - px, e.y - py); if (!best || dd < best.dist) best = { dist: dd, d: Q.cum[i] + Math.sqrt(L2) * u, c: (dx * ex + dy * ey) / Math.sqrt(L2) }; }
                if (!best || best.dist < 2.5 || best.dist > 40 || Math.abs(best.c) < 0.93 || Q.len < 25) return;
                if (busy.some(p => { for (let i = 0; i < Q.pts.length; i += 1) if (Math.hypot(Q.pts[i][0] - p.x, Q.pts[i][1] - p.y) < 30) return true; return false; })) return;
                out.push({ Q: Q, d: best.d, s: best.c > 0 ? 1 : -1, dist: best.dist });
            });
            out.sort((a, b) => a.dist - b.dist);
            const uniq = []; out.forEach(c => { const p = gdAt(c.Q, c.d); if (!uniq.some(u => { const q = gdAt(u.Q, u.d); return Math.hypot(p.x - q.x, p.y - q.y) < 4; })) uniq.push(c); });
            return (GD.side[P.key] = uniq.slice(0, 6));
        }
        function gdStnIdx(t) { if (t._si !== undefined && t._siT === GD._frame) return t._si; let i = 0; GD.trains.forEach(o => { if (o.leg || o.atLeg !== t.atLeg) return; if (o === t) t._si = i; i++; }); t._siT = GD._frame; return t._si || 0; }
        // Tarkib birliklari joylashuvi (bosh → dum)
        function gdUnitsPos(t) {
            const units = t.static ? t.units : [t.lok].concat(t.vags), out = [];
            let off = 0;
            units.forEach(u => {
                const l = gdUnitLen(u), mid = off + l / 2; off += l + 0.15; let q;
                if (t.static) q = gdAt(t.P, t.d - mid);
                else if (t.leg) { const dd = t.d - mid; q = dd >= 0 || t.rev || !t.prevLeg ? gdAt(t.leg, dd) : gdAt(t.prevLeg, t.prevLeg.len + dd); }
                else { const p0 = gdPos(t), S = p0.S; if (S) { const b = gdAt(S.Q, Math.max(0, Math.min(S.Q.len, S.d - S.s * mid))); q = { x: b.x, y: b.y, ang: S.s > 0 ? b.ang : b.ang + Math.PI }; } else q = gdAt(t.atLeg, t.atLeg.len - mid); }
                out.push({ u: u, q: q, l: l });
            });
            return out;
        }
        function gdBodyLine(t) { const a = gdUnitsPos(t); return a.map(o => ygToLL(o.q.x, o.q.y)); }
        // ---------- Temir yo'l qatlami (LOD) ----------
        function gdOffsetLine(P, off) {
            const out = []; for (let i = 0; i < P.length; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n; out.push(ygToLL(P[i][0] - dy * off, P[i][1] + dx * off)); } return out;
        }
        function gdRail(map, pane) {
            const R = L.canvas({ pane: pane, padding: 0.3 }), g = { R: R, groups: {} };
            const net = (TRK45.net || []).filter(l => l.length > 1), ll = net.map(l => l.map(p => ygToLL(p[0], p[1])));
            const mk = (lines, st) => L.layerGroup(lines.map(x => L.polyline(x, Object.assign({ renderer: R, interactive: false, lineCap: 'butt', lineJoin: 'round' }, st))));
            g.groups.line = mk(ll, { color: '#9aa4b5', weight: 1.4, opacity: 0.9 });
            g.groups.ballast = mk(ll, { color: '#5d554b', weight: 6, opacity: 0.95, lineCap: 'round' });
            g.groups.sleep = mk(ll, { color: '#6b4a2b', weight: 5, opacity: 1, dashArray: '2 5' });
            g.groups.railL = mk(net.map(l => gdOffsetLine(l, 0.36)), { color: '#cbd5e1', weight: 1.3, opacity: 1 });
            g.groups.railR = mk(net.map(l => gdOffsetLine(l, -0.36)), { color: '#cbd5e1', weight: 1.3, opacity: 1 });
            g.lod = -1;
            g.update = function () {
                const k = gdPxPerPt(map), lod = k < 1.2 ? 0 : k < 6 ? 1 : 2;
                const want = lod === 0 ? ['line'] : lod === 1 ? ['ballast', 'line'] : ['ballast', 'sleep', 'railL', 'railR'];
                Object.keys(g.groups).forEach(n => { const on = want.includes(n), l = g.groups[n]; if (on && !map.hasLayer(l)) l.addTo(map); if (!on && map.hasLayer(l)) map.removeLayer(l); });
                if (lod >= 1) { const w = Math.max(5, Math.min(60, 1.25 * k)); g.groups.ballast.eachLayer(p => p.setStyle({ weight: w })); }
                if (lod === 2) { const sw = Math.max(5, 1.05 * k), dl = Math.max(1.5, 0.16 * k), gp = Math.max(3, 0.42 * k); g.groups.sleep.eachLayer(p => p.setStyle({ weight: sw, dashArray: dl.toFixed(1) + ' ' + gp.toFixed(1) })); const rw = Math.max(1.1, Math.min(4, 0.09 * k)); ['railL', 'railR'].forEach(n => g.groups[n].eachLayer(p => p.setStyle({ weight: rw }))); }
                if (lod === 1) g.groups.line.eachLayer(p => p.setStyle({ weight: Math.max(1.4, Math.min(3, 0.3 * k)), color: '#c7ced9' })); else if (lod === 0) g.groups.line.eachLayer(p => p.setStyle({ weight: 1.4, color: '#9aa4b5' }));
                g.lod = lod;
            };
            g.remove = function () { Object.values(g.groups).forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); }); };
            return g;
        }
        // ---------- Chizish ----------
        function gdPxPerPt(m) { m = m || GD.map; const a = m.latLngToContainerPoint(ygToLL(0, 0)), b = m.latLngToContainerPoint(ygToLL(1000, 0)); return Math.hypot(b.x - a.x, b.y - a.y) / 1000; }
        function gdScrAng(p) { const m = GD.map, a = m.latLngToContainerPoint(ygToLL(p.x, p.y)), b = m.latLngToContainerPoint(ygToLL(p.x + Math.cos(p.ang) * 10, p.y + Math.sin(p.ang) * 10)); return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; }
        function gdMode() { const k = gdPxPerPt(); return k < 0.6 ? 0 : k < 7 ? 1 : 2; }
        function gdColor(t) { return t.static ? (t.kind === 'svi' ? TYPE_C.cis : '#94a3b8') : GD_ST[gdState(t)][2]; }
        function gdHideQ(t) { if (t.route === 'zax') return true; if (t.static || t.leg || !t.atLeg) return false; const p = gdPos(t); return !!p.hide; }
        function gdDrawOne(t, mode, bnd, k) {
            if (gdHideQ(t)) { if (t.mk) { GD.lay.removeLayer(t.mk); t.mk = null; t.key = ''; } if (t.body) { GD.lay.removeLayer(t.body); t.body = null; } if (t.parts) { t.parts.forEach(mk => GD.lay.removeLayer(mk)); t.parts = null; } return; }
            const p = gdPos(t), ll = ygToLL(p.x, p.y), col = gdColor(t), sel = GD.sel === (t.static ? t.id : t.no), E = escapeHtml;
            if (!t.mk) { t.mk = L.marker(ll, { icon: L.divIcon({ className: 'gd-ic', html: '', iconSize: [0, 0] }), keyboard: false, zIndexOffset: 200 }).addTo(GD.lay); t.mk.on('click', () => t.static ? gdStaticInfo(t.id) : gdInfo(t.no)); }
            t.mk.setLatLng(ll);
            const stop = !t.static && t.leg && !t.spd;
            const lbl = t.static ? E(t.title.split(' · ').slice(0, 2).join(' · ')) : '№' + t.no + ' · ' + E(t.lok.type) + '-' + E(vagonNo(t.lok)) + (stop ? ' ⛔' : '');
            const key = mode + '|' + gdState0(t) + '|' + (sel ? 1 : 0) + '|' + (stop ? 1 : 0);
            if (t.key !== key) {
                t.key = key; let h;
                if (mode === 0) h = `<div class="gd-dot${sel ? ' sel' : ''}${t.static ? ' st' : ''}" style="background:${col}"></div>`;
                else if (mode === 1) h = `<div class="gd-lbl${t.static ? ' st' : ''}" style="border-color:${col}">${lbl}</div>`;
                else h = `<div class="gd-lbl gd-lbl2" style="border-color:${col}">${t.static ? lbl : '№' + t.no + ' · ' + E(GD_ST[gdState(t)][1]) + (stop ? ' · ⛔ yoʻl band' : '')}</div>`;
                t.mk.setIcon(L.divIcon({ className: 'gd-ic', html: h, iconSize: [0, 0] }));
            }
            // tana chizig'i (1-rejim)
            if (mode === 1 && bnd.contains(ll)) { const pl = gdBodyLine(t); if (!t.body) { t.body = L.polyline(pl, { color: col, weight: 6, opacity: 0.95, lineCap: 'round', interactive: false }).addTo(GD.lay); } else { t.body.setLatLngs(pl); t.body.setStyle({ color: col, weight: sel ? 8 : 6 }); } }
            else if (t.body) { GD.lay.removeLayer(t.body); t.body = null; }
            // birliklar (2-rejim)
            const show = mode === 2 && bnd.contains(ll);
            if (show) {
                t.parts = t.parts || [];
                gdUnitsPos(t).forEach((o, i) => {
                    const u = o.u, q = o.q, a2 = gdScrAng(q), w = Math.max(14, o.l * k - 2);
                    let mk = t.parts[i]; const pk = Math.round(a2 / 3) + '|' + Math.round(w);
                    if (!mk) { mk = t.parts[i] = L.marker(ygToLL(q.x, q.y), { icon: L.divIcon({ className: 'gd-ic', html: '', iconSize: [0, 0] }), keyboard: false, zIndexOffset: -100 }).addTo(GD.lay); mk.on('click', () => { try { gdClose(true); openPassport(u.id); } catch (e) {} }); }
                    mk.setLatLng(ygToLL(q.x, q.y));
                    if (mk._k !== pk) { mk._k = pk; const flip = Math.abs(a2) > 90; const lk = hdKind(u); mk.setIcon(L.divIcon({ className: 'gd-ic', iconSize: [0, 0], html: `<div class="gd-u"><div class="gd-rot" style="width:${w}px; transform: translate(-50%,-65%) rotate(${flip ? a2 + 180 : a2}deg)"><div style="${flip ? 'transform:scaleX(-1)' : ''}">${hdSvg(lk, hdStat(u), w, u, true)}</div></div><span class="${lk === 'el' || lk === 'tep' || lk === 'lok' ? 'lk' : ''}">${E(lk === 'el' || lk === 'tep' || lk === 'lok' ? u.type + '-' + vagonNo(u) : vagonNo(u))}</span></div>` })); }
                });
            } else if (t.parts) { t.parts.forEach(mk => GD.lay.removeLayer(mk)); t.parts = null; }
        }
        function gdState0(t) { return t.static ? 'st' : gdState(t); }
        function gdDraw() {
            const m = GD.map; if (!m || !GD.lay) return; GD._frame = (GD._frame || 0) + 1;
            const mode = gdMode(), bnd = m.getBounds().pad(0.2), k = gdPxPerPt();
            GD.trains.forEach(t => gdDrawOne(t, mode, bnd, k)); GD.statics.forEach(t => gdDrawOne(t, mode, bnd, k));
            // Stansiya navbati belgisi (2 tadan ortiq kutayotgan tarkiblar)
            const grp = {}; GD.trains.forEach(t => { if (t.route !== 'zax' && !t.leg && t.atLeg) { const s = t.atLeg.key; (grp[s] = grp[s] || { leg: t.atLeg, n: 0, stn: t.stn, ts: [] }).n++; grp[s].ts.push(t); } });
            GD.qmk = GD.qmk || {}; Object.keys(GD.qmk).forEach(s => { if (!grp[s] || grp[s].n <= Math.min(grp[s].n, gdSide(grp[s].leg).length)) { GD.lay.removeLayer(GD.qmk[s]); delete GD.qmk[s]; } });
            const nz = GD.trains.filter(t => t.route === 'zax').length;
            if (nz && !GD.zmk) { GD.zmk = L.marker(ygToLL(GD_DEPO[0], GD_DEPO[1]), { icon: L.divIcon({ className: 'gd-ic', html: `<div class="gd-q">🔧 ${nz} tarkib zaxirada · Lokomotiv deposi</div>`, iconSize: [0, 0] }), zIndexOffset: 300 }).addTo(GD.lay); GD.zmk.on('click', () => gdQList('zax')); }
            Object.keys(grp).forEach(s => { const G = grp[s]; G.shown = Math.min(G.n, gdSide(G.leg).length); if (G.n <= G.shown) return; const q = gdAt(G.leg, G.leg.len), off = 16, ll = ygToLL(q.x - Math.sin(q.ang) * off, q.y + Math.cos(q.ang) * off);
                const h = `<div class="gd-q">+${G.n - G.shown} tarkib · ${escapeHtml(GD_STN[G.stn] || '')}</div>`;
                if (!GD.qmk[s]) { GD.qmk[s] = L.marker(ll, { icon: L.divIcon({ className: 'gd-ic', html: h, iconSize: [0, 0] }), zIndexOffset: 300 }).addTo(GD.lay); GD.qmk[s].on('click', () => gdQList(s)); GD.qmk[s]._h = h; }
                else { GD.qmk[s].setLatLng(ll); if (GD.qmk[s]._h !== h) { GD.qmk[s]._h = h; GD.qmk[s].setIcon(L.divIcon({ className: 'gd-ic', html: h, iconSize: [0, 0] })); } } });
            const c = gdCounts(), pn = $id('gdCnt'); if (pn) pn.innerHTML = Object.keys(GD_ST).map(s => `<span style="color:${GD_ST[s][2]}">${GD_ST[s][0]} ${escapeHtml(GD_ST[s][1])}: <b>${c[s] || 0}</b></span>`).join('') + `<span>⛔ Yoʻl band, kutmoqda: <b>${GD.trains.filter(t => t.route !== 'zax' && ((t.leg && !t.spd) || (!t.leg && t.readyAt))).length}</b></span><span>🔧 Depoda/zaxirada: <b>${GD.trains.filter(t => t.route === 'zax').length + (GD.reserve || []).length + onlyLoks().filter(v => hdKind(v) === 'el' && hrInRepair(v)).length}</b></span>`;
            const tt = $id('gdTime'); if (tt) { const s = Math.floor(GD.t), h = Math.floor(s / 3600) % 24, mi = Math.floor(s / 60) % 60; tt.innerText = String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); }
        }
        function gdTick() {
            const now = Date.now(), dt = Math.min(2, (now - (GD.last || now)) / 1000); GD.last = now;
            if (GD.run) { const sim = dt * GD.spd; const n = Math.max(1, Math.ceil(sim / 5)); for (let i = 0; i < n; i++) { GD.t += sim / n; gdStep(sim / n); } }
            try { gdDraw(); } catch (e) { console.error(e); }
        }
        // ---------- Ekran ----------
        function gdView() {
            let v = $id('gdView'); if (v) return v;
            v = document.createElement('div'); v.id = 'gdView'; v.className = 'nv-view gd-view hidden';
            v.innerHTML = `<div class="nv-top"><button onclick="gdClose()">‹</button><b>📡 Harakat tarkibi · GPS</b><button class="hs-help" onclick="helpOpen('gps')">ℹ️</button></div>
                <div class="gd-vbar" id="gdVbar"></div><div class="nv-map" id="gdMap"></div><div class="gd-warn hidden" id="gdWarn"></div><div class="gd-panel" id="gdPanel"></div>`;
            document.body.appendChild(v); return v;
        }
        function gdVbar() {
            const b = $id('gdVbar'); if (!b) return; const o = gdOpt(), cal = ygIsCal();
            b.innerHTML = `<div class="gd-seg"><button class="${o.view === 'sx' ? 'on' : ''}" onclick="gdSetView('sx')">📐 Sxema</button><button class="${o.view === 'real' ? 'on' : ''}" onclick="gdSetView('real')">🛰 Real koʻrinish</button></div>
                <div class="gd-seg gd-op">${o.view === 'sx' ? 'Sxema:' : 'Sxema ustida:'} ${[[1, 'toʻliq'], [0.4, 'xira'], [0, 'yashirin']].map(x => `<button class="${o.sxOp === x[0] ? 'on' : ''}" onclick="gdOptSet({sxOp:${x[0]}}); gdApplyView()">${x[1]}</button>`).join('')}</div>`;
            const w = $id('gdWarn'); if (w) { const need = o.view === 'real' && !cal; w.classList.toggle('hidden', !need); w.innerHTML = need ? `🛰 Real koʻrinish uchun sxema joyga bogʻlanishi kerak (2–3 nuqta).${isAdmin() ? ' <button onclick="calOpen()">📍 Oson bogʻlash</button>' : ' Admin bogʻlaydi.'}` : ''; }
        }
        function gdSetView(v) { gdOptSet({ view: v, sxOp: v === 'real' ? 0.25 : 1 }); gdApplyView(); }
        function gdApplyView() {
            const m = GD.map; if (!m) return; const o = gdOpt(), real = o.view === 'real' && ygIsCal();
            if (real && !GD.sat) GD.sat = L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 21, maxNativeZoom: 19, attribution: '© Esri' });
            if (GD.sat) { if (real && !m.hasLayer(GD.sat)) GD.sat.addTo(m); if (!real && m.hasLayer(GD.sat)) m.removeLayer(GD.sat); }
            if (GD.base && GD.base._c) { GD.base._c.style.opacity = o.sxOp; GD.base._c.style.mixBlendMode = real ? 'screen' : ''; GD.base._c.style.display = o.sxOp ? '' : 'none'; }
            $id('gdMap').classList.toggle('gd-real', real);
            gdVbar();
        }
        async function gdOpen(focusId) {
            if (!GD.built && !gdBuild()) { alert('Sxema maʼlumotlari topilmadi.'); return; }
            const v = gdView(); v.classList.remove('hidden');
            try { await loadLeaflet(); } catch (e) { showToast('⚠️ Xarita moduli yuklanmadi'); return; }
            if (!GD.map) {
                const m = L.map('gdMap', { zoomControl: true, attributionControl: true, zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 90, maxZoom: 22, minZoom: 9 });
                m.attributionControl.setPrefix(false); GD.map = m;
                m.createPane('gdBase').style.zIndex = 250; m.createPane('gdRail').style.zIndex = 380;
                GD.base = new YgLayer([{ w: YIG.W, h: YIG.H, A: [1, 0, 0, 1, 0, 0], cap: 16000, cls: 'yg-base', fixedOp: true }], (x, y) => ygToLL(x, y), 'gdBase');
                m.fitBounds(L.latLngBounds([ygToLL(0, 0), ygToLL(YIG.W, YIG.H)]), { animate: false });
                GD.base.addTo(m);
                ygSvgUrl('master', 'dark', false).then(u => { GD.base.items[0].el.src = u; }).catch(() => {});
                GD.rail = gdRail(m, 'gdRail'); GD.rail.update();
                GD.lay = L.layerGroup().addTo(m);
                m.on('zoomend', () => { GD.trains.concat(GD.statics).forEach(t => { t.key = ''; if (t.parts) t.parts.forEach(mk => mk._k = ''); }); GD.rail.update(); if (GD.on) gdDraw(); });
                m.on('moveend', () => { if (GD.on) gdDraw(); });
            } else { GD.base._up && GD.base._map && GD.base._up(); }
            GD.T0 = JSON.stringify(ygCurT());
            gdApplyView();
            GD.on = true; GD.run = true; GD.last = Date.now(); gdPanel();
            if (!GD.timer) GD.timer = setInterval(gdTick, 250);
            setTimeout(() => { GD.map.invalidateSize(); if (focusId !== undefined && focusId !== null) gdFocus(focusId); else if (!GD.fitted) { GD.fitted = true; const P = gdLeg('pr_kal_kol', 0); GD.map.fitBounds(L.latLngBounds(P.pts.map(q => ygToLL(q[0], q[1]))).extend(ygToLL(1102, 2062)), { animate: false, padding: [20, 20] }); } gdTick(); }, 120);
        }
        function gdPanel() {
            const p = $id('gdPanel'); if (!p) return;
            p.innerHTML = `<div class="gd-demo">🧪 DEMO — sunʼiy harakat, haqiqiy maʼlumot emas · ⏱ <b id="gdTime">06:00</b></div>
                <div class="gd-ctl"><button onclick="GD.run=!GD.run; gdPanel()">${GD.run ? '⏸ Pauza' : '▶️ Davom'}</button>${[1, 10, 60].map(s => `<button class="${GD.spd === s ? 'on' : ''}" onclick="GD.spd=${s}; gdPanel()">×${s}</button>`).join('')}<button onclick="gdList()">📋 Roʻyxat</button><button onclick="gdPanelMin()">${GD.min ? '▲' : '▼'}</button></div>
                <div class="gd-cnt${GD.min ? ' hidden' : ''}" id="gdCnt"></div>`;
        }
        function gdPanelMin() { GD.min = !GD.min; gdPanel(); gdDraw(); }
        function gdClose(keep) {
            GD.on = false; GD.run = false; if (GD.timer) { clearInterval(GD.timer); GD.timer = null; }
            const v = $id('gdView'); if (v) v.classList.add('hidden'); try { mdlClose('gdModal'); } catch (e) {}
        }
        function gdFocus(id) {
            const t = GD.units[id]; if (!t) { showToast('ℹ️ Bu texnika demo tarkiblarga kirmagan'); return; }
            GD.sel = t.static ? t.id : t.no; const p = gdPos(t), m = GD.map;
            let z = m.getZoom(); m.setView(ygToLL(p.x, p.y), z, { animate: false });
            for (let i = 0; i < 10 && gdPxPerPt() < 8; i++) { z += 1; m.setView(ygToLL(p.x, p.y), z, { animate: false }); }
            gdDraw(); if (t.static) gdStaticInfo(t.id); else gdInfo(t.no);
        }
        function gdWhereTrain(t) {
            if (t.route === 'zax') return 'Kolsevaya lokomotiv deposida — zaxirada (smena kutmoqda)';
            const s = gdStep1(t);
            if (t.leg) return (s.y ? 'Yuk bilan' : 'Boʻsh') + ': ' + (GD_STN[gdLegFrom(t)] || '') + ' → ' + (GD_STN[s.to] || s.to) + (t.spd ? ' · ' + t.spd + ' km/soat · ' + (Math.round((t.leg.len - t.d) * GD_M_PER_PT / 100) / 10) + ' km qoldi' : ' · ⛔ oldinda yoʻl band — kutmoqda');
            if (s.term) return (GD_STN[s.at] || s.at) + ' stansiyasida · ' + GD_ST[gdState(t)][1] + (t.wait > 0 ? ' · ~' + Math.ceil(t.wait / 60) + ' daq.' : '');
            return (GD_STN[t.stn] || t.stn) + ' stansiyasida · ' + (t.readyAt ? '⛔ qarshi yoʻnalishdagi tarkib oʻtishini kutmoqda' : t.wait > 0 ? 'lokomotiv yoʻnalishini almashtirmoqda' : 'joʻnashga tayyor');
        }
        function gdLegFrom(t) { const c = GD.cyc[t.route]; for (let i = 1; i <= c.length; i++) { const s = c[(t.ci - i + c.length) % c.length]; if (s.to) return s.to; if (s.at) return s.at; } return ''; }
        function gdInfo(no) {
            const t = GD.trains.find(x => x.no === no); if (!t) return; GD.sel = no; const E = escapeHtml, st = GD_ST[gdState(t)];
            const rt = t.route === 'zax' ? 'Harakatda emas (zaxira)' : 'Qalmoqqir → Kolsevaya → Olmaliq → Svinsovaya → ' + (t.route === 'med' ? 'Mednaya' : 'Bunkernaya (MOF-2)');
            mdl('gdModal', `<div class="px-h"><b>🚆 Tarkib №${t.no} <small>(demo)</small></b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                <div class="nd-tip">${st[0]} ${E(st[1])} · ${E(gdWhereTrain(t))}</div><div class="nd-tip">🛤 Yoʻnalish: ${E(rt)}</div>
                ${hdTrain(t.lok, t.vags)}
                <div class="nd-tip">Lokomotiv yoki vagonni bossangiz — pasporti ochiladi. 🧪 Bu namunaviy (sunʼiy) harakat: bazaga yozilmaydi.</div>`);
        }
        function gdStaticInfo(id) {
            const s = GD.statics.find(x => x.id === id); if (!s) return; GD.sel = id; const E = escapeHtml, loks = s.units.filter(u => ['el', 'tep', 'lok'].includes(hdKind(u)));
            mdl('gdModal', `<div class="px-h"><b>🅿️ ${E(s.title)} <small>(demo)</small></b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                <div class="nd-tip">⚪ Turibdi (harakatlanmaydi) · ${s.units.length - loks.length} vagon${loks.length ? ' · ' + E(loks.map(l => l.type + '-' + vagonNo(l)).join(', ')) : ''}</div>
                ${hdTrain(loks[0] || null, s.units.filter(u => !loks.includes(u)))}
                ${s.kind === 'tys' && GD.missing && GD.missing.length ? `<div class="nd-tip">ℹ️ Bazada ${E(GD.missing.join(', '))} yoʻq — shuning uchun ular koʻrsatilmadi (toʻqib chiqarilmaydi).</div>` : ''}`);
        }
        function gdQList(key) {
            const E = escapeHtml, ts = key === 'zax' ? GD.trains.filter(t => t.route === 'zax') : GD.trains.filter(t => t.route !== 'zax' && !t.leg && t.atLeg && t.atLeg.key === key);
            mdl('gdModal', `<div class="px-h"><b>🅿️ Stansiyada navbatda (${ts.length})</b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                <div class="hs-list">${ts.map(t => `<div class="hs-row" onclick="mdlClose('gdModal'); gdInfo(${t.no})"><b>${GD_ST[gdState(t)][0]} Tarkib №${t.no} · ${E(t.lok.type)}-${E(vagonNo(t.lok))}</b><small>${E(gdWhereTrain(t))}</small></div>`).join('')}</div>`, true);
        }
        function gdList() {
            const E = escapeHtml, c = gdCounts();
            mdl('gdModal', `<div class="px-h"><b>📋 Demo tarkiblar (${GD.trains.length} + ${GD.statics.length} turgan)</b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                <div class="gd-cnt">${Object.keys(GD_ST).map(s => `<span>${GD_ST[s][0]} ${E(GD_ST[s][1])}: <b>${c[s] || 0}</b></span>`).join('')}</div>
                <div class="hs-list">${GD.trains.map(t => `<div class="hs-row" onclick="mdlClose('gdModal'); gdFocus(${JSON.stringify(t.lok.id)})"><b>${GD_ST[gdState(t)][0]} Tarkib №${t.no} · ${E(t.lok.type)}-${E(vagonNo(t.lok))}</b><small>${E(gdWhereTrain(t))}</small></div>`).join('')}
                ${GD.statics.map(s => `<div class="hs-row" onclick="mdlClose('gdModal'); gdFocus(${JSON.stringify(s.units[0].id)})"><b>🅿️ ${E(s.title)}</b><small>${s.units.length} birlik · turibdi</small></div>`).join('')}</div>`, true);
        }
        // ---------- Pasport va ro'yxatlar bilan bog'lanish ----------
        function gdWhereTxt(v) { if (!GD.built) return ''; const t = GD.units[v.id]; if (!t) return ''; if (t.static) return '🅿️ Demo: ' + t.title; if (t.route === 'zax') return '🔧 Demo: tarkib №' + t.no + ' · depoda zaxirada'; const st = GD_ST[gdState(t)]; return st[0] + ' Demo: tarkib №' + t.no + ' · ' + st[1]; }
        (function () {
            if (typeof openPassport === 'function') { openPassport = agmkExtend('openPassport', 'openPassport', openPassport, o => function (id) { const r = o.apply(this, arguments); try {
                const v = vagonlarData.find(x => x.id === id), scr = $id('screen-vagon-pasport'); if (!v || !scr || v.kind === 'infra') return r;
                let b = $id('gdPpBtn'); const hdr = scr.querySelector('.inner-header');
                if (!b) { b = document.createElement('button'); b.id = 'gdPpBtn'; b.className = 'action-btn gd-ppbtn'; }
                if (hdr && b.previousElementSibling !== hdr) hdr.parentNode.insertBefore(b, hdr.nextSibling);
                const railish = !v.kind || v.kind === 'lok';
                b.style.display = railish ? '' : 'none'; b.innerHTML = '📍 Sxemada koʻrsatish' + (gdWhereTxt(v) ? ' <small>(' + escapeHtml(gdWhereTxt(v)) + ')</small>' : ''); b.onclick = () => gdOpen(id);
            } catch (e) { console.error(e); } return r; }); }
            if (typeof vagonCardHtml === 'function') { vagonCardHtml = agmkExtend('vagonCardHtml', 'vagonCardHtml', vagonCardHtml, o => function (v) { let h = o.apply(this, arguments); try { const w = GD.on ? gdWhereTxt(v) : ''; if (w) h = h.replace('<button class="details-btn"', `<div class="gd-where" onclick="gdOpen(${JSON.stringify(v.id)})">${escapeHtml(w)} · 📍</div><button class="details-btn"`); } catch (e) {} return h; }); }
            if (typeof openScreen === 'function') { openScreen = agmkExtend('openScreen', 'openScreen', openScreen, o => function (sid) { try { if (GD.on) gdClose(); } catch (e) {} return o.apply(this, arguments); }); }
            // AI: "tarkiblar qayerda", "sxemada harakat"
            if (typeof aiLocalAnswer === 'function') { aiStage('GPS demo — harakat tarkibi', function (q, next) { try { const s = String(q || '').toLowerCase(); if (/(gps demo|sxemada harakat|harakatni ko.?rsat|tarkiblar qayerda|poyezdlar qayerda|jonli harakat)/.test(s)) { setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} gdOpen(); }, 800); return { t: '📡 Harakat tarkibi (GPS demo) ochilmoqda. ' + gdStatusTxt(), personal: true }; } } catch (e) {} return next(q); }); }
        })();

