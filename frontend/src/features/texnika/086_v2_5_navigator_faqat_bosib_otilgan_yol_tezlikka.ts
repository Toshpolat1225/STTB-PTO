        // =====================================================================
        // v2.5 — 🧭 NAVIGATOR: faqat bosib o'tilgan yo'l (tezlikka qarab rangli), to'xtashlar (3 daqiqadan ortiq),
        //  kunlik vaqt chizig'i (joy nomi — eng yaqin ma'lum obyekt, bo'lmasa koordinata), sana tanlash, PDF/Excel hisobot.
        //  Koordinatalar hech qanday tashqi marshrut xizmatiga yuborilmaydi.
        // =====================================================================
        var NV_STOP_MIN = 3;
        function nvDayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function nvDayRange(ds) { const [y, m, d] = String(ds || nvDayStr()).split('-').map(Number); const a = new Date(y, m - 1, d).getTime(); return [a, a + 86400e3]; }
        function nvHM(t) { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
        function nvSpdCol(v) { return v < 5 ? '#94a3b8' : v < 20 ? '#22c55e' : v < 35 ? '#eab308' : v <= NV.limit ? '#f97316' : '#ef4444'; }
        function nvDayPts(it) { const [a, b] = nvDayRange(NV.day); return (it.pts || []).filter(p => p.t >= a && p.t < b).sort((x, y) => x.t - y.t); }
        // Harakat / to'xtash bo'laklari
        function nvSegments(pts) {
            const out = []; if (pts.length < 2) return out;
            const spd = i => { const p = pts[i], q = pts[i - 1]; if (p.v !== null && p.v !== undefined) return p.v; const dt = (p.t - q.t) / 1000; return dt > 0 ? nvHav(q, p) / dt * 3.6 : 0; };
            let i = 1;
            while (i < pts.length) {
                // to'xtash: tezlik ≤ 3 km/soat va 60 m radiusdan chiqmaydi
                let j = i; const c = pts[i - 1];
                while (j < pts.length && spd(j) <= 3 && nvHav(c, pts[j]) < 60) j++;
                const dur = (pts[Math.min(j, pts.length - 1)].t - c.t) / 60000;
                if (j > i && dur >= NV_STOP_MIN) { out.push({ k: 'stop', t0: c.t, t1: pts[j - 1].t, lat: c.lat, lon: c.lon }); i = j; continue; }
                // harakat
                let k = i, dist = 0, vmax = 0; const s0 = pts[i - 1];
                while (k < pts.length) {
                    let j2 = k; const c2 = pts[k - 1];
                    while (j2 < pts.length && spd(j2) <= 3 && nvHav(c2, pts[j2]) < 60) j2++;
                    if (j2 > k && (pts[Math.min(j2, pts.length - 1)].t - c2.t) / 60000 >= NV_STOP_MIN) break;
                    dist += nvHav(pts[k - 1], pts[k]); vmax = Math.max(vmax, spd(k)); k++;
                }
                if (k > i) out.push({ k: 'move', t0: s0.t, t1: pts[k - 1].t, dist: dist, vmax: vmax, a: s0, b: pts[k - 1] });
                i = Math.max(k, i + 1);
            }
            return out;
        }
        // Joy nomi — eng yaqin ma'lum obyekt (sxema bog'langan bo'lsa stansiyalar), bo'lmasa koordinata
        function nvPlace(lat, lon) {
            let best = null, bd = 1e9;
            try { if (typeof ygIsCal === 'function' && ygIsCal()) { const S = NET41.stations; Object.keys(S).forEach(k => { if (!S[k].anchor) return; const ll = ygToLL(S[k].anchor[0], S[k].anchor[1]), d = nvHav({ lat: lat, lon: lon }, { lat: ll.lat, lon: ll.lng }); if (d < bd) { bd = d; best = (typeof calStLabel === 'function' ? calStLabel(k) : k); } }); } } catch (e) {}
            try { (typeof nvKnown === 'function' ? nvKnown() : []).forEach(o => { const d = nvHav({ lat: lat, lon: lon }, o); if (d < bd) { bd = d; best = o.name; } }); } catch (e) {}
            if (best && bd < 1500) return best + (bd > 150 ? ' yaqinida (' + (bd / 1000).toFixed(1).replace('.', ',') + ' km)' : '');
            return lat.toFixed(5) + ', ' + lon.toFixed(5);
        }
        function nvKnown() { const out = []; try { (typeof gpsPlaces === 'function' ? gpsPlaces() : []).forEach(p => { if (p && isFinite(p.lat) && isFinite(p.lon)) out.push({ lat: +p.lat, lon: +p.lon, name: p.name }); }); } catch (e) {} return out; }
        (function () {
            nvRender = agmkExtend('nvRender', 'nvRender', nvRender, oR => function (fit) {
                if (!NV.day) NV.day = nvDayStr();
                oR.apply(this, arguments);
                try {
                    const m = NV.map; if (!m) return; const items = nvItems(), cur = items.find(x => x.id === NV.sel), E = escapeHtml;
                    NV.trail.clearLayers(); if (!NV.stopLay) NV.stopLay = L.layerGroup().addTo(m); NV.stopLay.clearLayers();
                    if (!cur) return;
                    const pts = nvDayPts(cur);
                    // faqat bosib o'tilgan yo'l, tezlikka qarab rangli
                    let run = null; const flush = () => { if (run && run.ll.length > 1) L.polyline(run.ll, { color: run.c, weight: 5, opacity: 0.9 }).addTo(NV.trail); };
                    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], dt = (b.t - a.t) / 1000; if (dt <= 0 || dt > 900) { flush(); run = null; continue; } const v = b.v !== null && b.v !== undefined ? b.v : nvHav(a, b) / dt * 3.6, c = nvSpdCol(v);
                        if (!run || run.c !== c) { flush(); run = { c: c, ll: [[a.lat, a.lon]] }; } run.ll.push([b.lat, b.lon]); }
                    flush();
                    const seg = nvSegments(pts); NV.seg = seg;
                    seg.filter(s => s.k === 'stop').forEach((s, i) => { const d = Math.round((s.t1 - s.t0) / 60000);
                        L.marker([s.lat, s.lon], { icon: L.divIcon({ className: 'gd-ic', html: `<div class="nv-stop"><b>⏸</b><span>${nvHM(s.t0)}–${nvHM(s.t1)} · ${d} daqiqa</span></div>`, iconSize: [0, 0] }) }).addTo(NV.stopLay); });
                    const card = $id('nvCard'); if (!card) return;
                    const mv = seg.filter(s => s.k === 'move'), st = seg.filter(s => s.k === 'stop'), km = mv.reduce((a, s) => a + s.dist, 0) / 1000, stMin = st.reduce((a, s) => a + (s.t1 - s.t0), 0) / 60000;
                    const extra = document.createElement('div'); extra.className = 'nv-day';
                    extra.innerHTML = `<div class="nv-dayh">📅 <input type="date" value="${E(NV.day)}" max="${nvDayStr()}" onchange="NV.day=this.value||nvDayStr(); nvRender()"> <span>${pts.length ? `🛣 ${km.toFixed(1).replace('.', ',')} km · ⏸ ${st.length} ta toʻxtash (${Math.round(stMin)} daq)` : 'Bu kunda maʼlumot yoʻq'}</span></div>
                        <div class="nv-leg"><i style="background:#22c55e"></i>&lt;20 <i style="background:#eab308"></i>20–35 <i style="background:#f97316"></i>35–${NV.limit} <i style="background:#ef4444"></i>&gt;${NV.limit} km/soat</div>
                        ${seg.length ? `<div class="nv-tl">${seg.map((s, i) => s.k === 'stop' ? `<div class="st" onclick="nvGoSeg(${i})"><b>${nvHM(s.t0)}–${nvHM(s.t1)}</b> ⏸ ${Math.round((s.t1 - s.t0) / 60000)} daqiqa · ${E(nvPlace(s.lat, s.lon))}</div>` : `<div onclick="nvGoSeg(${i})"><b>${nvHM(s.t0)}–${nvHM(s.t1)}</b> 🚜 ${(s.dist / 1000).toFixed(1).replace('.', ',')} km · maks. ${Math.round(s.vmax)} km/soat</div>`).join('')}</div>` : ''}
                        <div class="nv-btns"><button onclick="nvReport('pdf')">📄 PDF</button><button onclick="nvReport('xlsx')">📊 Excel</button><button onclick="helpOpen('navi')">ℹ️</button></div>`;
                    card.appendChild(extra);
                } catch (e) { console.error(e); }
            });
        })();
        function nvGoSeg(i) { const s = (NV.seg || [])[i]; if (!s || !NV.map) return; NV.follow = false; if (s.k === 'stop') NV.map.setView([s.lat, s.lon], Math.max(NV.map.getZoom(), 16)); else NV.map.fitBounds(L.latLngBounds([[s.a.lat, s.a.lon], [s.b.lat, s.b.lon]]).pad(0.3)); }
        function nvReport(fmt) {
            const cur = nvItems().find(x => x.id === NV.sel); if (!cur) return; const seg = NV.seg || [], E = escapeHtml, title = 'Harakat hisoboti ' + cur.name + ' ' + NV.day;
            const rows = [['Vaqt', 'Holat', 'Davomiylik (daq)', 'Masofa (km)', 'Maks. tezlik (km/soat)', 'Joy']];
            seg.forEach(s => rows.push([nvHM(s.t0) + '–' + nvHM(s.t1), s.k === 'stop' ? 'Toʻxtash' : 'Harakat', Math.round((s.t1 - s.t0) / 60000), s.k === 'move' ? +(s.dist / 1000).toFixed(2) : '', s.k === 'move' ? Math.round(s.vmax) : '', s.k === 'stop' ? nvPlace(s.lat, s.lon) : nvPlace(s.a.lat, s.a.lon) + ' → ' + nvPlace(s.b.lat, s.b.lon)]));
            const km = seg.filter(s => s.k === 'move').reduce((a, s) => a + s.dist, 0) / 1000;
            if (fmt === 'xlsx') { rows.push([]); rows.push(['Jami masofa, km', +km.toFixed(2)]); rows.push(['Manba', cur.demo ? 'DEMO (sunʼiy)' : 'GPS treker']); xlsxDl(rows, title); return; }
            const html = `<h2 style="text-align:center">${E(title)}</h2><p>Texnika: <b>${E(cur.name)}</b> · Sana: <b>${E(NV.day)}</b> · Jami: <b>${km.toFixed(1).replace('.', ',')} km</b>${cur.demo ? ' · <b>DEMO (sunʼiy maʼlumot)</b>' : ''}</p>
                <table border="1" style="border-collapse:collapse;width:100%;font-size:11px">${rows.map((r, i) => '<tr>' + r.map(c => (i ? '<td>' : '<th>') + E(String(c)) + (i ? '</td>' : '</th>')).join('') + '</tr>').join('')}</table>
                <p style="font-size:10px">Tuzildi: ${E(new Date().toLocaleString())} · ${E(typeof authorStr === 'function' ? authorStr() : '')}</p>`;
            docMake(html, title, ['pdf']).then(docDownload).catch(e => showToast('⚠️ ' + agmkErrUz(e)));
        }
        // Demo: vaqt bilan (×10), yo'lda to'xtashlar bilan, kun boshidan tarix
        (function () {
            nvDemoStep = function (dt) {
                NV.demoClock = NV.demoClock || Date.now(); NV.demoClock += dt * 10 * 1000; const now = NV.demoClock;
                NV.demoV.forEach((d, i) => {
                    if (d.pause > 0) { d.pause -= dt * 10; d.pts.push({ lat: d.pts.length ? d.pts[d.pts.length - 1].lat : d.a.lat, lon: d.pts.length ? d.pts[d.pts.length - 1].lon : d.a.lon, t: now, v: 0 }); }
                    else { const L0 = nvHav(d.a, d.b) || 1; d.f += d.dir * (d.spd / 3.6) * dt * 10 / L0;
                        if (d.f >= 1) { d.f = 1; d.dir = -1; d.pause = (4 + (i * 7) % 18) * 60; } if (d.f <= 0) { d.f = 0; d.dir = 1; d.pause = (3 + (i * 11) % 15) * 60; }
                        d.pts.push({ lat: d.a.lat + (d.b.lat - d.a.lat) * d.f, lon: d.a.lon + (d.b.lon - d.a.lon) * d.f, t: now, v: d.spd }); }
                    if (d.pts.length > 4000) d.pts.shift();
                });
            };
            nvDemo = agmkExtend('nvDemo', 'nvDemo', nvDemo, oD => function () {
                const was = NV.demo; oD.apply(this, arguments);
                if (!was && NV.demo) { NV.demoClock = Date.now() - 3 * 3600e3; NV.demoV.forEach(d => { d.pts = []; d.pause = 0; }); for (let k = 0; k < 3 * 3600 / 10 / 5; k++) nvDemoStep(5); NV.day = nvDayStr(new Date(NV.demoClock)); nvRender(true); }
            });
        })();

