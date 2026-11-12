        // =====================================================================
        // v2.4 — 🧭 AVTOTRAKTOR GPS-NAVIGATOR (poydevor)
        //  • Ko'cha xaritasi (OpenStreetMap), texnikalar o'z chizmasi bilan, harakat yo'nalishiga burilgan
        //  • Kuzatish rejimi (xarita texnikaga ergashadi), tezlik, kunlik masofa, harakat vaqti, to'xtashlar
        //  • 3 soatlik iz; «Qayerga?» — manzil, masofa va taxminiy vaqt (to'g'ri chiziq bo'yicha)
        //  • Tezlik chegarasi oshsa — ogohlantirish
        //  • Texnika koordinatalari hech qanday tashqi marshrut xizmatiga yuborilmaydi (faqat xarita rasmlari so'raladi)
        //  • Demo: faqat sxema GPS bilan bog'langan bo'lsa — sxemadagi obyektlar orasida (koordinatalar o'ylab topilmaydi)
        // =====================================================================
        var NV = { map: null, lay: null, trail: null, sel: null, follow: false, dest: null, destLay: null, me: null, timer: null, demo: false, demoT: 0, demoV: [], limit: 40, warned: {} };
        function nvHav(a, b) { const R = 6371000, r = x => x * Math.PI / 180, dLa = r(b.lat - a.lat), dLo = r(b.lon - a.lon); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
        function nvBear(a, b) { const r = x => x * Math.PI / 180, y = Math.sin(r(b.lon - a.lon)) * Math.cos(r(b.lat)), x = Math.cos(r(a.lat)) * Math.sin(r(b.lat)) - Math.sin(r(a.lat)) * Math.cos(r(b.lat)) * Math.cos(r(b.lon - a.lon)); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }
        function nvVeh(dev) { const d = (typeof gpsDevs === 'function' ? gpsDevs() : []).find(x => x.id === dev); const v = d && d.veh ? vagonlarData.find(x => String(x.id) === String(d.veh) || String(vagonNo(x)) === String(d.veh)) : null; return { name: d ? d.name : dev, v: v }; }
        function nvItems() {
            const out = [];
            Object.keys((typeof GPS !== 'undefined' && GPS.pts) || {}).forEach(dev => { const a = GPS.pts[dev]; if (!a || !a.length) return; const i = nvVeh(dev); out.push({ id: 'g:' + dev, name: i.name, v: i.v, pts: a, demo: false }); });
            if (NV.demo) NV.demoV.forEach(d => out.push(d));
            return out;
        }
        function nvStats(it) {
            const a = it.pts, last = a[a.length - 1], prev = a[a.length - 2]; const t0 = new Date(); t0.setHours(0, 0, 0, 0);
            let dist = 0, move = 0, stops = 0, st = null;
            for (let i = 1; i < a.length; i++) { if (a[i].t < t0.getTime()) continue; const d = nvHav(a[i - 1], a[i]), dt = (a[i].t - a[i - 1].t) / 1000; if (dt <= 0 || dt > 3600) continue; dist += d; const v = d / dt * 3.6; if (v > 3) { move += dt; if (st && a[i].t - st > 5 * 60e3) stops++; st = null; } else if (!st) st = a[i - 1].t; }
            const v = last.v !== null && last.v !== undefined ? last.v : (prev ? nvHav(prev, last) / Math.max(1, (last.t - prev.t) / 1000) * 3.6 : 0);
            return { last: last, v: Math.round(v || 0), hd: prev ? nvBear(prev, last) : 0, dist: dist, move: move, stops: stops, age: Date.now() - last.t };
        }
        async function nvOpen() {
            let el = $id('nvView');
            if (!el) { el = document.createElement('div'); el.id = 'nvView'; el.className = 'nv-view'; el.innerHTML = `<div class="nv-top"><button onclick="nvClose()">‹ Orqaga</button><b>🧭 Avtotraktor GPS-navigator</b><button onclick="nvDemo()" id="nvDemoBtn">🧪 Demo</button></div><div id="nvMap" class="nv-map"></div><div id="nvCard" class="nv-card"></div><div id="nvList" class="nv-list"></div>`; document.body.appendChild(el); }
            el.classList.remove('hidden');
            try { await loadLeaflet(); } catch (e) { $id('nvCard').innerHTML = '⚠️ Xarita moduli yuklanmadi'; return; }
            if (!NV.map) {
                const m = NV.map = L.map('nvMap', { zoomControl: false, attributionControl: true }); m.attributionControl.setPrefix(false);
                // v3.6.4 (35): gibrid — sputnik + yoʻllar + nomlar
                L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 18, attribution: '© Esri' }).addTo(m);
                L.tileLayer('agmk-tile://esri/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 18, opacity: 0.9 }).addTo(m);
                L.tileLayer('agmk-tile://esri/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 18 }).addTo(m);
                m.setView([40.8447, 69.5983], 14);
                NV.lay = L.layerGroup().addTo(m); NV.trail = L.layerGroup().addTo(m); NV.destLay = L.layerGroup().addTo(m);
                m.on('dragstart', () => { if (NV.follow) { NV.follow = false; nvRender(); } });
                m.on('click', e => { if (NV.pickDest) { NV.pickDest = false; NV.dest = { lat: e.latlng.lat, lon: e.latlng.lng }; nvRender(); } });
            }
            setTimeout(() => NV.map.invalidateSize(), 60);
            if (typeof GPS !== 'undefined' && !GPS.on) { try { gpsToggle(true); } catch (e) {} }
            if (!NV.timer) NV.timer = setInterval(nvTick, 1000);
            nvRender(true);
        }
        function nvClose() { const el = $id('nvView'); if (el) el.classList.add('hidden'); if (NV.timer) { clearInterval(NV.timer); NV.timer = null; } }
        function nvTick() { if (NV.demo) nvDemoStep(1); nvRender(); }
        function nvSel(id) { NV.sel = id; NV.follow = true; nvRender(true); }
        function nvRender(fit) {
            const m = NV.map; if (!m) return; const E = escapeHtml, items = nvItems(), now = Date.now();
            NV.lay.clearLayers(); NV.trail.clearLayers(); NV.destLay.clearLayers();
            items.forEach(it => {
                const s = nvStats(it), ll = [s.last.lat, s.last.lon], kind = it.v ? hdAvtoKind(it.v) : (it.kind || 'car'), old = s.age > 15 * 60e3;
                const html = `<div class="nv-mk${NV.sel === it.id ? ' sel' : ''}${old ? ' old' : ''}"><div class="nv-rot" style="transform:${s.hd < 180 ? 'rotate(' + (s.hd - 90) + 'deg)' : 'rotate(' + (s.hd - 270) + 'deg) scaleX(-1)'}">${hdAvtoSvg(kind, 38)}</div><span>${E(String(it.name).slice(0, 22))}${s.v ? ' · ' + s.v + ' km/soat' : ''}${old ? ' · ⏱' + Math.round(s.age / 60e3) + ' daq' : ''}</span></div>`;
                const mk = L.marker(ll, { icon: L.divIcon({ className: 'gd-ic', html: html, iconSize: [0, 0] }) }).addTo(NV.lay); mk.on('click', () => nvSel(it.id));
                if (NV.sel === it.id) { const tr = it.pts.filter(p => now - p.t < 3 * 3600e3 || it.demo).map(p => [p.lat, p.lon]); if (tr.length > 1) L.polyline(tr, { color: '#38bdf8', weight: 4, opacity: 0.8 }).addTo(NV.trail); }
                if (s.v > NV.limit && !it.demo && (!NV.warned[it.id] || now - NV.warned[it.id] > 10 * 60e3)) { NV.warned[it.id] = now; showToast('⚠️ ' + it.name + ': tezlik ' + s.v + ' km/soat (chegara ' + NV.limit + ')'); }
            });
            const cur = items.find(x => x.id === NV.sel);
            if (cur && NV.follow) { const s = nvStats(cur); m.setView([s.last.lat, s.last.lon], Math.max(m.getZoom(), 15), { animate: false }); }
            else if (fit && items.length && !cur) { const b = L.latLngBounds(items.map(it => { const l = it.pts[it.pts.length - 1]; return [l.lat, l.lon]; })); m.fitBounds(b.pad(0.3), { animate: false, maxZoom: 15 }); }
            if (NV.dest) { L.circleMarker([NV.dest.lat, NV.dest.lon], { radius: 9, color: '#fff', weight: 2, fillColor: '#ef4444', fillOpacity: 1 }).addTo(NV.destLay); if (cur) { const s = nvStats(cur); L.polyline([[s.last.lat, s.last.lon], [NV.dest.lat, NV.dest.lon]], { color: '#f87171', weight: 3, dashArray: '8 8' }).addTo(NV.destLay); } }
            // Karta
            let c = '';
            if (cur) {
                const s = nvStats(cur), dd = NV.dest ? nvHav(s.last, NV.dest) : null, eta = dd !== null ? dd / 1000 / Math.max(10, s.v || 30) * 60 : null;
                c = `<div class="nv-h"><b>${E(cur.name)}</b>${cur.demo ? ' <small>🧪 demo</small>' : ''}<button onclick="NV.sel=null; NV.follow=false; nvRender(true)">✕</button></div>
                    <div class="nv-kpi"><div><small>Tezlik</small><b>${s.v}</b><small>km/soat</small></div><div><small>Bugun</small><b>${(s.dist / 1000).toFixed(1).replace('.', ',')}</b><small>km</small></div><div><small>Harakatda</small><b>${Math.floor(s.move / 3600)}:${String(Math.floor(s.move / 60) % 60).padStart(2, '0')}</b><small>soat</small></div><div><small>Toʻxtash</small><b>${s.stops}</b><small>marta</small></div></div>
                    <small>📍 ${s.last.lat.toFixed(5)}, ${s.last.lon.toFixed(5)} · 🕒 ${String(new Date(s.last.t).getHours()).padStart(2, '0')}:${String(new Date(s.last.t).getMinutes()).padStart(2, '0')}${s.age > 15 * 60e3 ? ' · ⚠️ signal ' + Math.round(s.age / 60e3) + ' daqiqa oldin' : ''}</small>
                    ${dd !== null ? `<div class="nv-dest">🎯 Manzilgacha <b>${(dd / 1000).toFixed(1).replace('.', ',')} km</b> (toʻgʻri chiziq) · ≈ <b>${Math.round(eta)} daq</b> <button onclick="NV.dest=null; nvRender()">✕</button></div>` : ''}
                    <div class="nv-btns"><button class="${NV.follow ? 'on' : ''}" onclick="NV.follow=!NV.follow; nvRender()">🧭 Kuzatish</button><button onclick="NV.pickDest=true; showToast('🎯 Xaritada manzilni bosing')">🎯 Qayerga?</button>${cur.v ? `<button onclick="openPassport(${JSON.stringify(cur.v.id)})">📄 Pasport</button>` : ''}</div>`;
            } else c = items.length ? `<div class="nv-tip">Texnikani tanlang — xarita unga ergashadi. ⚠️ Tezlik chegarasi: <b>${NV.limit}</b> km/soat <button onclick="nvLimit()">oʻzgartirish</button></div>` : `<div class="nv-tip">📡 Hozircha GPS maʼlumoti yoʻq. Trekerlar korxona serveriga ulangach texnikalar shu yerda harakatda koʻrinadi. Hozir: <button onclick="gpsOpen()">📂 GPS fayl yuklash / qurilmalar</button> yoki <button onclick="nvDemo()">🧪 Demo</button>.</div>`;
            $id('nvCard').innerHTML = c;
            $id('nvList').innerHTML = items.map(it => { const s = nvStats(it); return `<div class="nv-it${NV.sel === it.id ? ' on' : ''}" onclick="nvSel('${it.id}')">${hdAvtoSvg(it.v ? hdAvtoKind(it.v) : (it.kind || 'car'), 34)}<span>${E(String(it.name).slice(0, 18))}<small>${s.v} km/soat${it.demo ? ' · demo' : ''}</small></span></div>`; }).join('');
            const db = $id('nvDemoBtn'); if (db) db.classList.toggle('on', NV.demo);
        }
        async function nvLimit() { const v = await uiPrompt('Tezlik chegarasi (km/soat):', String(NV.limit)); if (v && +v > 0) { NV.limit = +v; nvRender(); } }
        // ---------- Demo (faqat bog'langan sxema asosida) ----------
        function nvDemo() {
            if (NV.demo) { NV.demo = false; NV.demoV = []; NV.sel = null; nvRender(true); return; }
            NV.demoNom = !(typeof ygIsCal === 'function' && ygIsCal()); if (NV.demoNom) showToast('🧪 DEMO — sxema hali GPS bilan bogʻlanmagan: joylashuv shartli, haqiqiy koordinata emas'); // v3.6.4 (34): taqdimot uchun bogʻlashsiz ham
            const S = NET41.stations, ids = Object.keys(S).filter(k => S[k].anchor), P = k => { const ll = ygToLL(S[k].anchor[0], S[k].anchor[1]); return { lat: ll.lat, lon: ll.lng }; };
            const av = vagonlarData.filter(v => v.kind === 'avto').slice(0, 56);
            const hubs = ['kal', 'kol', 'olm', 'bun', 'fab', 'med', 'por', 'r668', 'svi'].filter(k => ids.includes(k));
            NV.demoV = av.map((v, i) => { const a = hubs[i % hubs.length], b = hubs[(i * 5 + 3) % hubs.length] === a ? hubs[(i + 1) % hubs.length] : hubs[(i * 5 + 3) % hubs.length]; return { id: 'd:' + v.id, name: (v.naim || v.type || 'Texnika') + ' ' + vagonNo(v), v: v, demo: true, a: P(a), b: P(b), f: (i * 0.137) % 1, dir: 1, spd: 18 + (i % 7) * 3, pts: [] }; });
            NV.demo = true; NV.demoT = Date.now(); nvDemoStep(0); nvRender(true);
        }
        function nvDemoStep(dt) {
            const now = Date.now();
            NV.demoV.forEach(d => { const L0 = nvHav(d.a, d.b) || 1; d.f += d.dir * (d.spd / 3.6) * dt * 10 / L0; if (d.f >= 1) { d.f = 1; d.dir = -1; } if (d.f <= 0) { d.f = 0; d.dir = 1; } const p = { lat: d.a.lat + (d.b.lat - d.a.lat) * d.f, lon: d.a.lon + (d.b.lon - d.a.lon) * d.f, t: now, v: d.spd }; d.pts.push(p); if (d.pts.length > 400) d.pts.shift(); });
        }

