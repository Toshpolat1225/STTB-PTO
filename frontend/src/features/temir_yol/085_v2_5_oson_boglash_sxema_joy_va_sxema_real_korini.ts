        // =====================================================================
        // v2.5 — 📍 OSON BOG'LASH (sxema ↔ joy) va 📐 Sxema / 🛰 Real ko'rinish
        //  • Ekran ikkiga bo'linadi: tepada sxema, pastda sputnik. Tepada nuqtani, pastda o'sha joyni bosasiz → juftlik.
        //  • 2–3 juftlik yetadi; har biri uchun farq (±m) ko'rsatiladi, keraksizini o'chirish mumkin.
        //  • Ixtiyoriy: OSM'dagi temir yo'l stansiyalari belgilari (faqat hudud chegarasi so'raladi, sxema yuborilmaydi).
        //  • Sxema hech qayerga yuklanmaydi; GPS koordinatalari tashqi xizmatga yuborilmaydi.
        // =====================================================================
        var CAL = { top: null, bot: null, pS: null, pG: null, mS: null, mG: null, osm: null };
        function calStLabel(id) { const n = { kal: 'Qalmoqqir', kol: 'Kolsevaya', olm: 'Olmaliq', svi: 'Svinsovaya', bun: 'Bunkernaya', fab: 'Fabrichnaya', med: 'Mednaya', izv: 'Izvestkovaya', pre: 'Predgornaya', sau: 'Sovuq-buloq', por: 'Porodnaya', r668: '668-razyezd', raz: 'Razvyazka', otv: 'Otvalnaya', yos: 'Yoshlik', ohan: 'Ohangaron yo‘li', vm: 'VM' }; return n[id] || id; }
        async function calOpen() {
            if (!isAdmin()) { showToast('🔒 Sxemani joyga bogʻlash — faqat admin'); return; }
            try { await loadLeaflet(); } catch (e) { showToast('⚠️ Xarita moduli yuklanmadi'); return; }
            let v = $id('calView');
            if (!v) {
                v = document.createElement('div'); v.id = 'calView'; v.className = 'nv-view cal-view';
                v.innerHTML = `<div class="nv-top"><button onclick="calClose()">‹</button><b>📍 Sxemani joyga bogʻlash</b><button class="hs-help" onclick="helpOpen('cal')">ℹ️</button></div>
                    <div class="cal-step" id="calStep"></div>
                    <div class="cal-half"><div class="cal-tag">📐 Sxema — nuqtani bosing</div><div id="calTop" class="cal-map"></div></div>
                    <div class="cal-half"><div class="cal-tag">🛰 Joy (sputnik) — oʻsha joyni bosing <button onclick="calOsm()">🚉 OSM stansiyalari</button><button onclick="calBase()" id="calBaseBtn">🗺 Xarita</button></div><div id="calBot" class="cal-map"></div></div>
                    <div class="cal-foot" id="calFoot"></div>`;
                document.body.appendChild(v);
            }
            v.classList.remove('hidden');
            if (!CAL.top) {
                const H = YIG.H, W = YIG.W, b = [[-H, 0], [0, W]];
                const t = L.map('calTop', { crs: L.CRS.Simple, zoomControl: true, attributionControl: false, minZoom: -3, maxZoom: 4, zoomSnap: 0.25 });
                CAL.top = t; t.fitBounds(b);
                CAL.img = L.imageOverlay('', b).addTo(t);
                ygSvgUrl('master', 'dark', false).then(u => CAL.img.setUrl(u)).catch(() => {});
                t.on('click', e => { CAL.pS = { x: e.latlng.lng, y: -e.latlng.lat }; if (CAL.mS) t.removeLayer(CAL.mS); CAL.mS = L.circleMarker(e.latlng, { radius: 8, color: '#fff', weight: 3, fillColor: '#f97316', fillOpacity: 1 }).addTo(t); calFoot(); });
                CAL.pairsTop = L.layerGroup().addTo(t);
                const g = L.map('calBot', { zoomControl: true, attributionControl: true, maxZoom: 21 }); CAL.bot = g; g.attributionControl.setPrefix(false);
                CAL.sat = L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 21, maxNativeZoom: 19, attribution: '© Esri' }).addTo(g);
                CAL.osmT = L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 21, maxNativeZoom: 19, attribution: '© OpenStreetMap' });
                g.setView([40.8447, 69.5983], 13);
                if (ygIsCal()) { const T = ygCurT(); g.fitBounds(L.latLngBounds([calLL(T, 0, 0), calLL(T, YIG.W, YIG.H)]), { animate: false }); }
                g.on('click', e => calSetG(e.latlng.lat, e.latlng.lng));
                CAL.pairsBot = L.layerGroup().addTo(g);
            }
            setTimeout(() => { CAL.top.invalidateSize(); CAL.bot.invalidateSize(); }, 80);
            calDrawPairs(); calFoot();
        }
        function calLL(T, x, y) { return L.CRS.EPSG3857.unproject(L.point(T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f)); }
        function calSetG(lat, lon) { CAL.pG = { lat: lat, lon: lon }; if (CAL.mG) CAL.bot.removeLayer(CAL.mG); CAL.mG = L.circleMarker([lat, lon], { radius: 8, color: '#fff', weight: 3, fillColor: '#38bdf8', fillOpacity: 1 }).addTo(CAL.bot); calFoot(); }
        function calBase() { const g = CAL.bot; if (g.hasLayer(CAL.sat)) { g.removeLayer(CAL.sat); CAL.osmT.addTo(g); $id('calBaseBtn').innerText = '🛰 Sputnik'; } else { g.removeLayer(CAL.osmT); CAL.sat.addTo(g); $id('calBaseBtn').innerText = '🗺 Xarita'; } }
        function calStations() { return Object.keys(NET41.stations).filter(k => NET41.stations[k].anchor).map(k => ({ id: k, a: NET41.stations[k].anchor })); }
        function calGo(id) { const s = NET41.stations[id]; if (!s || !s.anchor) return; CAL.top.setView([-s.anchor[1], s.anchor[0]], 1.5); }
        function calFoot() {
            const f = $id('calFoot'), st = $id('calStep'); if (!f) return; const g = ygGeo(), n = g.pairs.length, E = escapeHtml;
            const T = n >= 2 ? ygFit(g.pairs) : null, er = T ? ygErr(T, g.pairs) : [];
            const need = !CAL.pS ? '1) Tepada — sxemada aniq nuqtani bosing (stansiya binosi, strelka, koʻprik).' : !CAL.pG ? '2) Pastda — shu nuqtaning sputnikdagi joyini bosing.' : '3) «✅ Juftlikni saqlash» ni bosing.';
            st.innerHTML = `<b>${n >= 3 ? '✅ Bogʻlangan' : n === 2 ? '🟡 Ishlaydi, yana 1 ta juftlik aniqlikni oshiradi' : '⚪ Kamida 2 ta juftlik kerak'}</b> · ${E(need)}
                <div class="cal-chips">${calStations().map(s => `<button onclick="calGo('${s.id}')">${E(calStLabel(s.id))}</button>`).join('')}</div>`;
            const rms = er.length >= 3 ? Math.sqrt(er.reduce((a, b) => a + b * b, 0) / er.length) : null;
            f.innerHTML = `<div class="cal-act"><button class="on" ${CAL.pS && CAL.pG ? '' : 'disabled'} onclick="calSave()">✅ Juftlikni saqlash</button><button onclick="calReset()">↺ Tanlovni tozalash</button></div>
                <div class="cal-acc">${n >= 3 ? `Aniqlik: oʻrtacha ±${Math.round(rms)} m, eng katta farq ${Math.round(Math.max.apply(null, er))} m` : n === 2 ? 'Aniqlik: 2 juftlikda farqni oʻlchab boʻlmaydi — 3-juftlik qoʻshing' : ''}</div>
                <div class="cal-pairs">${g.pairs.map((p, i) => `<div><b>${i + 1})</b> sxema (${Math.round(p.x)}, ${Math.round(p.y)}) ↔ ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}${er[i] !== undefined && n >= 3 ? ` · <span class="${er[i] > 60 ? 'bad' : ''}">±${Math.round(er[i])} m</span>` : ''} <a onclick="calDel(${i})">✖ oʻchirish</a></div>`).join('') || '<div>Hali juftlik yoʻq.</div>'}</div>`;
        }
        function calReset() { CAL.pS = CAL.pG = null; if (CAL.mS) CAL.top.removeLayer(CAL.mS); if (CAL.mG) CAL.bot.removeLayer(CAL.mG); CAL.mS = CAL.mG = null; calFoot(); }
        function calSave() {
            if (!CAL.pS || !CAL.pG) return; const g = ygGeo();
            g.pairs.push({ x: +CAL.pS.x.toFixed(1), y: +CAL.pS.y.toFixed(1), lat: +CAL.pG.lat.toFixed(7), lon: +CAL.pG.lon.toFixed(7), acc: null, at: new Date().toISOString(), by: authorStr() });
            g.cs = 'm2'; g.at = new Date().toISOString(); g.by = String(currentUser && currentUser.tabel || ''); kvSet(YG_GEO_KEY, g);
            calReset(); calApply(); calDrawPairs();
            const n = g.pairs.length; showToast(n >= 2 ? '✅ ' + n + ' ta juftlik saqlandi' : '✅ 1-juftlik saqlandi. Yana kamida 1 ta kerak.');
        }
        async function calDel(i) { const g = ygGeo(); if (!g.pairs[i]) return; if (!(await uiConfirm((i + 1) + '-juftlik oʻchirilsinmi?'))) return; g.pairs.splice(i, 1); g.at = new Date().toISOString(); kvSet(YG_GEO_KEY, g); calApply(); calDrawPairs(); calFoot(); }
        function calDrawPairs() {
            if (!CAL.top) return; CAL.pairsTop.clearLayers(); CAL.pairsBot.clearLayers();
            ygGeo().pairs.forEach((p, i) => {
                L.marker([-p.y, p.x], { icon: L.divIcon({ className: 'cal-pin', html: '<span>' + (i + 1) + '</span>', iconSize: [22, 22] }) }).addTo(CAL.pairsTop);
                L.marker([p.lat, p.lon], { icon: L.divIcon({ className: 'cal-pin', html: '<span>' + (i + 1) + '</span>', iconSize: [22, 22] }) }).addTo(CAL.pairsBot);
            });
            calFoot();
        }
        function calApply() {
            try { YG.T = ygCurT(); if (YG.map) ygReplace(); } catch (e) {}
            try { if (typeof renderLayerPanel === 'function' && $id('lyrPanel') && !$id('lyrPanel').classList.contains('hidden')) renderLayerPanel(); } catch (e) {}
            try { if (typeof gdRecal === 'function') gdRecal(); } catch (e) {}
        }
        function calClose() { const v = $id('calView'); if (v) v.classList.add('hidden'); calApply(); }
        // OSM temir yo'l stansiyalari — faqat ko'rinib turgan hudud chegarasi so'raladi
        async function calOsm() {
            const g = CAL.bot, b = g.getBounds(); if (g.getZoom() < 11) { showToast('🔍 Avval hududni yaqinlashtiring'); return; }
            if (!(await uiConfirm('OpenStreetMap’dan shu hududdagi temir yoʻl stansiyalari belgilari soʻralsinmi?\n(Internetga faqat xarita chegarasi yuboriladi; sxema va GPS maʼlumotlari yuborilmaydi.)'))) return;
            const q = `[out:json][timeout:20];(node["railway"~"station|halt|junction|yard"](${b.getSouth().toFixed(4)},${b.getWest().toFixed(4)},${b.getNorth().toFixed(4)},${b.getEast().toFixed(4)}););out body 80;`;
            showToast('⏳ OSM soʻralmoqda...');
            try {
                const r = await fetch(agmkNoNet('OpenStreetMap'), { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
                const j = await r.json(); if (CAL.osm) g.removeLayer(CAL.osm); CAL.osm = L.layerGroup().addTo(g);
                (j.elements || []).forEach(el => { const nm = (el.tags && (el.tags['name:uz'] || el.tags.name || el.tags['name:ru'])) || 'stansiya';
                    L.marker([el.lat, el.lon], { icon: L.divIcon({ className: 'cal-osm', html: '<span>🚉 ' + escapeHtml(nm) + '</span>', iconSize: null }) }).on('click', ev => { L.DomEvent.stop(ev); calSetG(el.lat, el.lon); showToast('📍 «' + nm + '» tanlandi — tepada sxemadagi oʻsha stansiyani bosing (tasdiqlash sizda)'); }).addTo(CAL.osm); });
                showToast((j.elements || []).length ? '🚉 ' + j.elements.length + ' ta belgi topildi — keraklisini bosing' : 'ℹ️ Bu hududda OSM belgisi topilmadi');
            } catch (e) { showToast('⚠️ OSM’ga ulanib boʻlmadi (internet?)'); }
        }
        // ---------- Temir yo'l xaritasi: 📐 Sxema / 🛰 Real ko'rinish ----------
        function ygView() { return ygOpt().view === 'real' ? 'real' : 'sx'; }
        function ygSetView(v) {
            if (v === 'real' && !ygIsCal()) { ygOptSet({ view: 'real' }); renderLayerPanel(); showToast('🛰 Real koʻrinish uchun avval sxemani joyga bogʻlang'); return; }
            ygOptSet(v === 'real' ? { view: 'real', sat: true, op: 0.3 } : { view: 'sx', sat: false }); ygRefresh(); renderLayerPanel();
        }
        (function () {
            if (typeof ygPanelHtml === 'function') { ygPanelHtml = agmkExtend('ygPanelHtml', 'ygPanelHtml', ygPanelHtml, o => function () {
                const v = ygView(), cal = ygIsCal();
                return `<div class="yg-view"><button class="${v === 'sx' ? 'on' : ''}" onclick="ygSetView('sx')">📐 Sxema</button><button class="${v === 'real' ? 'on' : ''}" onclick="ygSetView('real')">🛰 Real koʻrinish</button></div>
                    ${v === 'real' && !cal ? `<div class="lyr-note">⚠️ Real koʻrinish sxema joyga bogʻlangandan keyin ishlaydi.${isAdmin() ? ' <button class="mini-btn" onclick="calOpen()">📍 Oson bogʻlash</button>' : ' Bogʻlashni admin bajaradi.'}</div>` : ''}
                    ${v === 'real' && cal ? '<div class="lyr-note">🛰 Sputnik surat ustida — sxemadagi temir yoʻllar (yaqinlashtirsangiz relslar koʻrinadi). Harakatdagi tarkiblar — «Harakat tarkibi · GPS» boʻlimida.</div>' : ''}
                    ${isAdmin() ? '<div class="yg-adm"><button onclick="calOpen()">📍 Oson bogʻlash (2–3 juftlik)</button></div>' : ''}` + o.apply(this, arguments);
            }); }
            if (typeof ygRefresh === 'function') { ygRefresh = agmkExtend('ygRefresh', 'ygRefresh', ygRefresh, o => function () {
                const r = o.apply(this, arguments);
                try { const m = YG.map; if (!m) return r; const real = ygView() === 'real' && ygIsCal();
                    if (real) { if (!YG.rail || YG.railT !== JSON.stringify(ygCurT())) { if (YG.rail) YG.rail.remove(); if (!m.getPane('ygRail')) m.createPane('ygRail').style.zIndex = 360; YG.rail = gdRail(m, 'ygRail'); YG.railT = JSON.stringify(ygCurT()); if (!YG.railHook) { YG.railHook = true; m.on('zoomend', () => { if (YG.rail && YG.rail.on) YG.rail.update(); }); } } YG.rail.on = true; YG.rail.update(); }
                    else if (YG.rail && YG.rail.on) { YG.rail.remove(); YG.rail.on = false; }
                } catch (e) { console.error(e); }
                return r; }); }
        })();
        // GPS ekrani bog'lash o'zgarganda
        function gdRecal() {
            if (!GD.map) return; const m = GD.map;
            try { if (GD.base && GD.base._map) GD.base._up(); } catch (e) {}
            try { if (GD.rail) { GD.rail.remove(); } GD.rail = gdRail(m, 'gdRail'); GD.rail.update(); } catch (e) {}
            GD.trains.concat(GD.statics).forEach(t => { if (t.body) { GD.lay.removeLayer(t.body); t.body = null; } t.key = ''; if (t.parts) t.parts.forEach(mk => mk._k = ''); });
            if (GD.qmk) { Object.values(GD.qmk).forEach(mk => GD.lay.removeLayer(mk)); GD.qmk = {}; } if (GD.zmk) { GD.lay.removeLayer(GD.zmk); GD.zmk = null; }
            try { gdApplyView(); gdDraw(); } catch (e) {}
        }

