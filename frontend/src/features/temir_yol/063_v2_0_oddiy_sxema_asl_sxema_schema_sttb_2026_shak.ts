        // =====================================================================
        // v2.0 — «ODDIY SXEMA» asl sxema («Schema STTB 2026») shaklida:
        // stansiyalar asl joylashuvida, peregonlar asl yo'l izlari bo'ylab (soddalashtirilgan chiziq).
        // Barcha eski funksiyalar (AI ko'rsatish, holat rejimi, zamechaniyalar, obxod) o'zgarishsiz ishlaydi.
        // =====================================================================
        var NET41S = 0.22; // asl sxema birligi (pt) -> xarita birligi
        var NET41_PL = {}; // peregon id -> [[x,y],...]
        var NET41_EST = {}; // taxminiy joylashgan obyektlar (asl sxemada yozuvi yo'q)
        (function () {
            try {
                if (typeof NET41 === 'undefined' || typeof INFRA_POS === 'undefined') return;
                const S = NET41S, old = Object.assign({}, INFRA_POS);
                Object.keys(NET41.stations).forEach(id => { const s = NET41.stations[id]; if (s.mapped && s.anchor) INFRA_POS[id] = [+(s.anchor[0] * S).toFixed(1), +(s.anchor[1] * S).toFixed(1)]; });
                const plLen = p => { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
                const cut = (p, t) => { // t (0..1) nuqtada ikkiga bo'lish
                    const L = plLen(p) * t; let acc = 0;
                    for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc + d >= L) { const k = d ? (L - acc) / d : 0, q = [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k]; return [p.slice(0, i).concat([q]), [q].concat(p.slice(i))]; } acc += d; }
                    return [p, [p[p.length - 1]]];
                };
                Object.keys(NET41.peregons).forEach(id => { NET41_PL[id] = NET41.peregons[id].pts.map(q => [q[0] * S, q[1] * S]); });
                // Nijniy post: asl sxemada yozuvi yo'q — Svinsovaya–Fabrichnaya yo'lida peregon uzunliklari nisbati bo'yicha
                const a = INFRA_BY.pr_svi_nij, b = INFRA_BY.pr_nij_fab, route = NET41_PL.pr_svi_nij;
                if (a && b && a.len && b.len && route && route.length > 2) {
                    const t = a.len / (a.len + b.len), parts = cut(route, t);
                    NET41_PL.pr_svi_nij = parts[0]; NET41_PL.pr_nij_fab = parts[1];
                    const q = parts[1][0]; INFRA_POS.nij = [+q[0].toFixed(1), +q[1].toFixed(1)]; NET41_EST.nij = 'peregon uzunliklari nisbati boʻyicha';
                }
                // Qolgan (asl sxemada yozuvi yo'q) obyektlar — ota obyektga nisbatan avvalgi yo'nalishda, qisqa masofada
                const rel = { ob_veer: 'svi', vos: 'kal', ob_yoldepo: 'kol', raz: 'kal' };
                Object.keys(rel).forEach(id => {
                    const s = NET41.stations[id]; if (s && s.mapped) return; const par = rel[id]; if (!old[id] || !old[par] || !INFRA_POS[par]) return;
                    const dx = old[id][0] - old[par][0], dy = old[id][1] - old[par][1], L = Math.hypot(dx, dy) || 1, R = 40;
                    INFRA_POS[id] = [+(INFRA_POS[par][0] + dx / L * R).toFixed(1), +(INFRA_POS[par][1] + dy / L * R).toFixed(1)]; NET41_EST[id] = 'asl sxemada yozuvi yoʻq — taxminiy';
                });
                // Yozuvlar bir-birini bosmasligi uchun (yangi joylashuvga mos)
                try { delete INFRA_LBL_R.med; INFRA_LBL_R.svi = 1; if (NET41_EST.vos && INFRA_POS.kal) { INFRA_POS.vos = [INFRA_POS.kal[0] + 18, INFRA_POS.kal[1] + 42]; } } catch (e) {}
                // Chiziq oxirlarini stansiya nuqtasiga ulash
                Object.keys(NET41_PL).forEach(id => { const o = INFRA_BY[id]; if (!o) return; const p = NET41_PL[id], A = INFRA_POS[o.a], B = INFRA_POS[o.b]; if (!A || !B || !p.length) return;
                    const d0 = Math.hypot(p[0][0] - A[0], p[0][1] - A[1]), d1 = Math.hypot(p[p.length - 1][0] - A[0], p[p.length - 1][1] - A[1]);
                    const q = d1 < d0 ? p.slice().reverse() : p.slice(); q[0] = A.slice(); q[q.length - 1] = B.slice(); NET41_PL[id] = q; });
            } catch (e) { console.error(e); }
        })();
        function net41Off(p, off) { // chiziqni yon tomonga surish (parallel peregonlar uchun)
            if (!off) return p;
            return p.map((q, i) => { const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [q[0] - dy / L * off, q[1] + dx / L * off]; });
        }
        function net41Mid(p) { let L = 0; const seg = []; for (let i = 1; i < p.length; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); seg.push(d); L += d; } let h = L / 2; for (let i = 1; i < p.length; i++) { if (h <= seg[i - 1]) { const k = seg[i - 1] ? h / seg[i - 1] : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * k, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * k]; } h -= seg[i - 1]; } return p[0]; }
        (function () {
            if (typeof drawMap !== 'function' || !Object.keys(NET41_PL).length) return;
            drawMap = agmkExtend('drawMap', 'drawMap', drawMap, oDraw => function () {
                oDraw.apply(this, arguments); // stansiyalar, obyektlar, belgilar — asl kod chizadi (yangi joylarda)
                try {
                    const root = $id('mapRoot'); if (!root) return;
                    const zc = id => { const v = infraRec(id); return v ? (v.zams || []).filter(z => z.status !== 'yopildi').length : 0; };
                    // eski to'g'ri chiziqli peregonlarni asl yo'l izi bo'yicha qayta chizish
                    const pairs = {}; Object.values(INFRA_BY).filter(o => o.kind === 'pr').forEach(o => { const k = [o.a, o.b].sort().join('|'); (pairs[k] = pairs[k] || []).push(o); });
                    let ed = '';
                    Object.values(pairs).forEach(g => g.forEach((o, i) => {
                        const base = NET41_PL[o.id]; if (!base) return;
                        const ab = [o.a, o.b].sort(); let p = base; if (o.a !== ab[0]) p = p.slice().reverse();
                        p = net41Off(p, (i - (g.length - 1) / 2) * 5);
                        const pts = p.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '), col = INFRA_COL[o.uch] || '#94a3b8', m = net41Mid(p), z = zc(o.id);
                        ed += `<g class="g-it" data-id="${o.id}" data-q="${escapeHtml(aiNorm(o.uz + ' ' + o.ru))}"><polyline class="ed ed41${NET41.peregons[o.id] && NET41.peregons[o.id].approx ? ' apx' : ''}" points="${pts}" stroke="${col}" fill="none"/><polyline class="ed-hit" data-inf="${o.id}" points="${pts}" fill="none"/>` +
                            (i === 0 && o.len ? `<text class="km" x="${(m[0] + 8).toFixed(1)}" y="${(m[1] + 4).toFixed(1)}" text-anchor="start">${infraKm(o.len)}</text>` : '') + (z ? `<circle class="zb" cx="${(m[0] + 12).toFixed(1)}" cy="${(m[1] + 6).toFixed(1)}" r="6"/>` : '') + '</g>';
                    }));
                    root.querySelectorAll('g.g-it').forEach(g => { if (g.querySelector('line.ed') && NET41_PL[g.dataset.id]) g.remove(); });
                    root.insertAdjacentHTML('afterbegin', ed);
                    // taxminiy joylashganlar — punktir chegara
                    Object.keys(NET41_EST).forEach(id => { const g = root.querySelector('g.g-it[data-id="' + id + '"]'); if (g) { g.classList.add('est41'); const t = document.createElementNS('http://www.w3.org/2000/svg', 'title'); t.textContent = NET41_EST[id]; g.appendChild(t); } });
                    // asl sxema nomi
                    if (!root.querySelector('.src41')) root.insertAdjacentHTML('beforeend', `<text class="src41" x="${(20).toFixed(0)}" y="${(NET41.H * NET41S + 30).toFixed(0)}">Asos: «Schema STTB 2026» (marksheyderlik) — soddalashtirilgan koʻrinish</text>`);
                } catch (e) { console.error(e); }
            });
        })();
        (function () {
            if (typeof mapDecorate !== 'function') return;
            mapDecorate = agmkExtend('mapDecorate', 'mapDecorate', mapDecorate, o => function () {
                const r = o.apply(this, arguments);
                try { const svg = $id('mapSvg'); if (!svg) return r; const risk = !!MAPL.risk;
                    svg.querySelectorAll('.g-it[data-id]').forEach(g => { const pl = g.querySelector('polyline.ed'); if (!pl) return; const ob = infO(g.getAttribute('data-id')); if (!ob) return; pl.setAttribute('stroke', risk ? RISK_COL[infRisk(ob).lvl] : (INFRA_COL[ob.uch] || '#94a3b8')); }); } catch (e) {}
                return r;
            });
        })();
        __lzVar('ND_OQ_ANNEX');

