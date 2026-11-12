        // =====================================================================
        // v2.0 — YIG'MA SXEMA: marksheyderlik bo'limining asl vektorli varaqlari (16 ta)
        // devordagi umumiy sxema (shablon) bo'yicha joylashtirilgan. Stansiya bosilsa — vektorli varaq.
        // GPS bilan bog'lash (admin, nuqtalar juftligi) + sputnik qatlami (yoqish/o'chirish, shaffoflik).
        // =====================================================================
        var YG = { map: null, lay: null, sat: null, hot: null, lbl: null, me: null, calib: null, urls: {}, txt: {}, vw: null, vwLay: null, vwMode: 'dark', vwId: null, T: null };
        var YG_GEO_KEY = 'agmk_map_georef';
        var YG_OPT_KEY = 'agmk_map_yig';
        var YG_INFRA = (function () { const r = {}; try { Object.keys(ST40_MAP).forEach(k => { if (!r[ST40_MAP[k]]) r[ST40_MAP[k]] = k; }); } catch (e) {} return r; })();
        function ygOpt() { const d = { sat: false, op: 1, sheets: false }; try { return Object.assign(d, JSON.parse(localStorage.getItem(YG_OPT_KEY) || '{}') || {}); } catch (e) { return d; } }
        function ygOptSet(p) { const o = Object.assign(ygOpt(), p); try { localStorage.setItem(YG_OPT_KEY, JSON.stringify(o)); } catch (e) {} return o; }
        function ygGeo() { const g = kvGet(YG_GEO_KEY, null); return g && Array.isArray(g.pairs) && g.cs === 'm2' ? g : { pairs: [], cs: 'm2' }; }
        function ygSheet(id) { return YIG.sheets.find(s => s.id === id) || null; }

        // ---------- SVG: siqilgan (gzip) matndan tiklash, tungi rang, kesish ----------
        async function ygGunzip(b64) {
            const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            if (typeof DecompressionStream === 'undefined') throw new Error('nods');
            return await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        }
        function ygInvHex(h) {
            let r = parseInt(h.substr(1, 2), 16) / 255, g = parseInt(h.substr(3, 2), 16) / 255, b = parseInt(h.substr(5, 2), 16) / 255;
            const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0, l = (mx + mn) / 2;
            if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh /= 6; }
            l = 1 - l; if (l < 0.5) l = Math.min(0.5, l * 0.9 + 0.06);
            const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
            if (s === 0) r = g = b = l; else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, hh + 1 / 3); g = f(p, q, hh); b = f(p, q, hh - 1 / 3); }
            return '#' + [r, g, b].map(x => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('');
        }
        async function ygSvgText(id) {
            if (YG.txt[id]) return YG.txt[id];
            if (!YIG_SVG[id] && typeof sxPackEnsure === 'function') await sxPackEnsure(); // ixtiyoriy paket (pack.js)
            if (!YIG_SVG[id]) throw new Error(typeof SXEMA_MSG !== 'undefined' ? SXEMA_MSG : 'Sxema yuklanmagan');
            const t = await ygGunzip(YIG_SVG[id]); YG.txt[id] = t; return t;
        }
        // mode: 'dark' | 'orig' ; clip: true — faqat yo'l chizmasi (shtamp, tasdiq bloklari, shartli belgilar kesilgan)
        async function ygSvgUrl(id, mode, clip) {
            const k = id + '|' + mode + '|' + (clip ? 1 : 0); if (YG.urls[k]) return YG.urls[k];
            let t = await ygSvgText(id); const s = ygSheet(id);
            if (mode === 'dark') t = t.replace(/#[0-9a-fA-F]{6}\b/g, ygInvHex).replace(/<svg /, '<svg fill="#e5e5e5" ');
            if (clip && s) {
                const vb = s.viewBox;
                t = t.replace(/<svg ([^>]*?)width="[^"]*" height="[^"]*" viewBox="[^"]*"/, '<svg $1width="' + vb[2] + '" height="' + vb[3] + '" viewBox="' + vb.join(' ') + '"');
                const di = t.indexOf('<defs>'); const de = t.indexOf('</defs>');
                if (di >= 0 && de > di) {
                    const cp = '<clipPath id="' + id + '-yc"><path clip-rule="' + (s.rule || 'evenodd') + '" d="' + s.clip + '"/></clipPath>';
                    t = t.slice(0, di + 6) + cp + t.slice(di + 6, de + 7) + '<g clip-path="url(#' + id + '-yc)">' + t.slice(de + 7).replace(/<\/svg>\s*$/, '</g></svg>');
                }
            }
            const u = URL.createObjectURL(new Blob([t], { type: 'image/svg+xml' })); YG.urls[k] = u; return u;
        }

        // ---------- Affin almashtirishlar ----------
        // Sxema (mozaika px, y pastga) -> EPSG:3857 metr. Bog'lanmagan bo'lsa — shartli (taxminiy emas!) joylash.
        const YG_R = 6378137;
        function ygMerc(lat, lon) { const p = L.CRS.EPSG3857.project(L.latLng(lat, lon)); return [p.x, p.y]; }
        function ygNominal() { const c = ygMerc(40.8447, 69.5983), k = 4.3; return { a: k, b: 0, c: 0, d: -k, e: c[0] - k * YIG.W / 2, f: c[1] + k * YIG.H / 2, nominal: true }; }
        function ygFit(pairs) {
            // qaytaradi: {a,b,c,d,e,f} — X = a*x + c*y + e, Y = b*x + d*y + f (x,y — mozaika px; X,Y — metr)
            const P = pairs.map(p => { const m = ygMerc(p.lat, p.lon); return { x: p.x, y: p.y, X: m[0], Y: m[1] }; });
            if (P.length < 2) return null;
            if (P.length === 2) {
                // o'xshashlik (burish + bir xil masshtab + siljish); y o'qi teskari
                const z1 = [P[0].x, -P[0].y], z2 = [P[1].x, -P[1].y], w1 = [P[0].X, P[0].Y], w2 = [P[1].X, P[1].Y];
                const dz = [z2[0] - z1[0], z2[1] - z1[1]], dw = [w2[0] - w1[0], w2[1] - w1[1]], n = dz[0] * dz[0] + dz[1] * dz[1]; if (!n) return null;
                const al = [(dw[0] * dz[0] + dw[1] * dz[1]) / n, (dw[1] * dz[0] - dw[0] * dz[1]) / n];
                const be = [w1[0] - (al[0] * z1[0] - al[1] * z1[1]), w1[1] - (al[0] * z1[1] + al[1] * z1[0])];
                // X = al0*x - al1*(-y) + be0 = al0*x + al1*y + be0 ; Y = al1*x + al0*(-y) + be1
                return { a: al[0], c: al[1], e: be[0], b: al[1], d: -al[0], f: be[1] };
            }
            // 3+ nuqta: eng kichik kvadratlar (to'liq affin)
            const solve = key => {
                let S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], r = [0, 0, 0];
                P.forEach(p => { const v = [p.x, p.y, 1]; for (let i = 0; i < 3; i++) { r[i] += v[i] * p[key]; for (let j = 0; j < 3; j++) S[i][j] += v[i] * v[j]; } });
                const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
                const D = det(S); if (Math.abs(D) < 1e-9) return null;
                return [0, 1, 2].map(c => det(S.map((row, i) => row.map((x, j) => j === c ? r[i] : x))) / D);
            };
            const u = solve('X'), v = solve('Y'); if (!u || !v) return null;
            return { a: u[0], c: u[1], e: u[2], b: v[0], d: v[1], f: v[2] };
        }
        function ygErr(T, pairs) {
            return pairs.map(p => { const m = ygMerc(p.lat, p.lon), X = T.a * p.x + T.c * p.y + T.e, Y = T.b * p.x + T.d * p.y + T.f; return Math.hypot(X - m[0], Y - m[1]) * Math.cos(p.lat * Math.PI / 180); });
        }
        function ygCurT() { const g = ygGeo(); const T = g.pairs.length >= 2 ? ygFit(g.pairs) : null; return T || ygNominal(); }
        function ygIsCal() { return !ygCurT().nominal; }
        function ygToLL(x, y) { const T = YG.T || ygCurT(); return L.CRS.EPSG3857.unproject(L.point(T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f)); }
        function ygFromLL(ll) {
            const T = YG.T || ygCurT(), p = L.CRS.EPSG3857.project(ll), D = T.a * T.d - T.b * T.c; if (!D) return null;
            const X = p.x - T.e, Y = p.y - T.f; return { x: (T.d * X - T.c * Y) / D, y: (-T.b * X + T.a * Y) / D };
        }
        function ygMul(A, B) { // A∘B (avval B, keyin A); [a,b,c,d,e,f]
            return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
        }
        // model koordinatasi -> xarita qatlam nuqtasi (map zoom z, markaz c) — 3 nuqta bo'yicha aniq affin
        function ygLayerAff(map, toLL, zoom, center) {
            const f = (x, y) => zoom === undefined ? map.latLngToLayerPoint(toLL(x, y)) : map._latLngToNewLayerPoint(toLL(x, y), zoom, center);
            const p0 = f(0, 0), p1 = f(1000, 0), p2 = f(0, 1000);
            return [(p1.x - p0.x) / 1000, (p1.y - p0.y) / 1000, (p2.x - p0.x) / 1000, (p2.y - p0.y) / 1000, p0.x, p0.y];
        }

        // ---------- Aniq (tiniq) vektorli tasvir qatlami ----------
        var YgLayer = window.L ? L.Layer.extend({
            initialize: function (items, toLL, pane) { this.items = items; this.toLL = toLL; this.paneName = pane || 'overlayPane'; },
            onAdd: function (map) {
                this._c = L.DomUtil.create('div', 'yg-layer leaflet-zoom-animated');
                (map.getPane(this.paneName) || map.getPanes().overlayPane).appendChild(this._c);
                this.items.forEach(it => { if (!it.el) { it.el = document.createElement('img'); it.el.className = 'yg-img' + (it.cls ? ' ' + it.cls : ''); it.el.draggable = false; it.el.alt = ''; if (it.src) it.el.src = it.src; } this._c.appendChild(it.el); });
                map.on('zoomanim', this._anim, this); map.on('zoomend viewreset resize', this._up, this); this._up();
            },
            onRemove: function (map) { map.off('zoomanim', this._anim, this); map.off('zoomend viewreset resize', this._up, this); L.DomUtil.remove(this._c); },
            _anim: function (e) { const m = this._map, A = ygLayerAff(m, this.toLL, e.zoom, e.center), B = this._A; if (!B) return;
                // yangi = A ∘ B^-1 — konteyner uchun
                const D = B[0] * B[3] - B[1] * B[2]; if (!D) return; const Bi = [B[3] / D, -B[1] / D, -B[2] / D, B[0] / D, (B[2] * B[5] - B[3] * B[4]) / D, (B[1] * B[4] - B[0] * B[5]) / D];
                const K = ygMul(A, Bi); this._c.style.transform = 'matrix(' + K.map(v => +v.toFixed(6)).join(',') + ')'; },
            _up: function () {
                const m = this._map; if (!m) return; const A = ygLayerAff(m, this.toLL); this._A = A; this._c.style.transform = '';
                this.items.forEach(it => {
                    if (!it.el) return; const K = ygMul(A, it.A); // mahalliy birlik -> qatlam px
                    const su = Math.hypot(K[0], K[1]), sv = Math.hypot(K[2], K[3]); let W = it.w * su, H = it.h * sv; const cap = it.cap || 12000, k = Math.min(1, cap / Math.max(W, H, 1)); W *= k; H *= k;
                    it.el.style.width = W.toFixed(1) + 'px'; it.el.style.height = H.toFixed(1) + 'px';
                    const mm = [K[0] / su / k, K[1] / su / k, K[2] / sv / k, K[3] / sv / k, K[4], K[5]];
                    it.el.style.transform = 'matrix(' + mm.map(v => +v.toFixed(6)).join(',') + ')';
                });
            },
            setOpacity: function (o) { this.items.forEach(it => { if (it.el && !it.fixedOp) it.el.style.opacity = o; }); }
        }) : null;

        // ---------- Yig'ma xarita ----------
        function ygEnsurePane() {
            if ($id('paneYig')) return;
            const panes = $id('mapPanes'); if (!panes) return;
            const d = document.createElement('div'); d.className = 'map-pane'; d.id = 'paneYig';
            d.innerHTML = '<div class="lf yg-lf" id="lfYig"></div><div class="lf-msg" id="lfYigMsg"></div><div class="pane-tag">📐 Yig\'ma sxema</div><div class="yg-bar hidden" id="ygBar"></div><div class="yg-warn hidden" id="ygWarn"></div>';
            panes.insertBefore(d, panes.firstChild);
        }
        async function ygInit() {
            ygEnsurePane(); if (YG.map) { ygRefresh(); return; }
            const msg = $id('lfYigMsg'); msg.innerText = "⏳ Yig'ma sxema tayyorlanmoqda...";
            try { await loadLeaflet(); } catch (e) { msg.innerText = "⚠️ Xarita moduli yuklanmadi"; return; }
            const m = L.map('lfYig', { zoomControl: false, attributionControl: true, zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 90, maxZoom: 21, minZoom: 9 });
            m.attributionControl.setPrefix(false);
            YG.map = m; YG.T = ygCurT();
            m.createPane('ygBase').style.zIndex = 250; m.createPane('ygSheets').style.zIndex = 350;
            const toLL = (x, y) => ygToLL(x, y);
            const o = ygOpt();
            // Fon: devordagi sxema (tungi rangda)
            YG.base = new YgLayer([{ w: YIG.W, h: YIG.H, A: [1, 0, 0, 1, 0, 0], cap: 16000, cls: 'yg-base', fixedOp: true }], toLL, 'ygBase');
            // Varaqlar (vektor)
            const items = [];
            for (const s of YIG.sheets) { if (s.placed === false) continue; const vb = s.viewBox, M = s.M; items.push({ id: s.id, w: vb[2], h: vb[3], A: ygMul(M, [1, 0, 0, 1, vb[0], vb[1]]), cap: 14000 }); }
            YG.lay = new YgLayer(items, toLL, 'ygSheets');
            m.fitBounds(L.latLngBounds([ygToLL(0, 0), ygToLL(YIG.W, YIG.H)]), { animate: false });
            YG.base.addTo(m); if (o.sheets) YG.lay.addTo(m);
            msg.innerText = "⏳ Asl sxema chizilmoqda...";
            ygSvgUrl('master', 'dark', false).then(u => { YG.base.items[0].el.src = u; msg.innerText = ''; }).catch(e => { msg.innerHTML = /^🗺/.test(e && e.message) ? escapeHtml(e.message) + ' <button class="mini-btn" onclick="sxPackOpen()">⬇️ Yuklab olish</button>' : "⚠️ Bu qurilmada vektorli sxemani ochib boʻlmadi (brauzer eski)."; });
            YG.sheetsLoaded = false;
            ygDrawHot(); ygRefresh();
            m.on('click', ygClick);
            const zc = () => { const z = m.getZoom(); YG.z0 = YG.z0 === undefined ? z : YG.z0; const c = m.getContainer(); c.classList.toggle('yg-z0', z < YG.z0 + 1); c.classList.toggle('yg-z1', z >= YG.z0 + 1 && z < YG.z0 + 2); };
            m.on('zoomend', zc); zc();
            setTimeout(() => m.invalidateSize(), 80);
        }
        function ygDrawHot() {
            const m = YG.map; if (!m) return; if (YG.hot) m.removeLayer(YG.hot); if (YG.lbl) m.removeLayer(YG.lbl);
            YG.hot = L.layerGroup(); YG.lbl = L.layerGroup();
            const area = p => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(a / 2); };
            YIG.sheets.filter(s => s.placed !== false && s.hot).sort((a, b) => area(b.hot) - area(a.hot)).forEach(s => {
                L.polygon(s.hot.map(p => ygToLL(p[0], p[1])), { stroke: false, fillColor: '#38bdf8', fillOpacity: 0.0, className: 'yg-hot' })
                    .on('click', e => { if (YG.calib) return; L.DomEvent.stop(e); ygOpenSheet(s.id); }).addTo(YG.hot);
                const st = typeof st40 === 'function' ? st40(s.id) : null;
                L.marker(ygToLL(s.label[0], s.label[1]), { interactive: true, icon: L.divIcon({ className: 'yg-lbl', html: '<span>' + escapeHtml((st ? st.ok + '-ok. ' : '') + s.name) + '</span>', iconSize: null }) })
                    .on('click', e => { if (YG.calib) return; L.DomEvent.stop(e); ygOpenSheet(s.id); }).addTo(YG.lbl);
            });
            YG.hot.addTo(m); if (!YG.calib) YG.lbl.addTo(m);
        }
        function ygRefresh() {
            const m = YG.map; if (!m) return; const o = ygOpt(), cal = ygIsCal();
            YG.T = ygCurT();
            const satOn = o.sat && (cal || YG.calib);
            if (satOn && !YG.sat) YG.sat = L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 21, maxNativeZoom: 19, attribution: '© Esri' });
            if (YG.sat) { if (satOn && !m.hasLayer(YG.sat)) YG.sat.addTo(m); if (!satOn && m.hasLayer(YG.sat)) m.removeLayer(YG.sat); }
            if (o.sheets && !m.hasLayer(YG.lay)) { YG.lay.addTo(m); if (!YG.sheetsLoaded) { YG.sheetsLoaded = true; YG.lay.items.forEach(async it => { try { it.el.src = await ygSvgUrl(it.id, 'dark', true); } catch (e) {} }); } }
            if (!o.sheets && m.hasLayer(YG.lay)) m.removeLayer(YG.lay);
            const opv = YG.calib && YG.calib.step === 'geo' ? 0.35 : (satOn ? o.op : 1);
            if (YG.base && YG.base._c) { YG.base._c.style.mixBlendMode = satOn ? 'screen' : ''; YG.base._c.style.opacity = opv; }
            if (YG.lay && YG.lay._c) YG.lay._c.style.mixBlendMode = satOn ? 'screen' : '';
            YG.lay.setOpacity(opv);
            $id('paneYig').classList.toggle('yg-satmode', !!satOn);
            const w = $id('ygWarn'); if (w) { w.classList.toggle('hidden', cal || !!YG.calib); w.innerHTML = cal ? '' : "ℹ️ Sxema hali GPS bilan bogʻlanmagan — sputnik va «📍 Men qayerdaman» bogʻlangandan keyin ishlaydi."; }
            [YG.base, YG.lay].forEach(l => { if (l && l._map) l._up(); });
        }
        function ygReplace() { // bog'lash o'zgarganda — barcha qatlamlarni yangi joyga
            if (!YG.map) return; YG.T = ygCurT(); ygDrawHot(); ygRefresh();
            if (YG.me) { YG.map.removeLayer(YG.me); YG.me = null; }
        }
        function ygClick(e) {
            const c = YG.calib; if (!c) return;
            if (c.step === 'scheme') { const p = ygFromLL(e.latlng); if (!p) return; c.x = p.x; c.y = p.y; c.step = 'geo';
                c.mk = L.circleMarker(e.latlng, { radius: 8, color: '#fff', weight: 3, fillColor: '#f97316', fillOpacity: 1 }).addTo(YG.map);
                ygOptSet({ sat: true }); ygRefresh(); ygCalBar(); return; }
            if (c.step === 'geo') ygCalAdd(e.latlng.lat, e.latlng.lng);
        }
        function ygCalStart() {
            if (!isAdmin()) { showToast('🔒 GPS bilan bogʻlash — faqat admin'); return; }
            if (!YG.map) { ygInit().then(() => ygCalStart()); return; }
            YG.calib = { step: 'scheme' }; if (YG.lbl && YG.map.hasLayer(YG.lbl)) YG.map.removeLayer(YG.lbl);
            ygRefresh(); ygCalBar(); $id('lyrPanel').classList.add('hidden'); $id('lyrBtn').classList.remove('on');
        }
        function ygCalBar() {
            const b = $id('ygBar'), c = YG.calib; if (!b) return; if (!c) { b.classList.add('hidden'); b.innerHTML = ''; return; }
            const n = ygGeo().pairs.length;
            b.classList.remove('hidden');
            b.innerHTML = c.step === 'scheme'
                ? `<b>📍 Bogʻlash — ${n + 1}-nuqta, 1/2</b><div>Sxemada aniq, joyda ham topiladigan nuqtani bosing: stansiya binosi, strelka, koʻprik, kesishma.</div><div class="yg-bar-b"><button onclick="ygCalEnd()">✖ Tugatish</button></div>`
                : `<b>📍 Bogʻlash — ${n + 1}-nuqta, 2/2</b><div>Endi shu nuqtaning <u>haqiqiy joyini</u> sputnik suratida bosing yoki shu joyda turgan boʻlsangiz — «Hozir shu yerdaman».</div><div class="yg-bar-b"><button onclick="ygCalHere()">📍 Hozir shu yerdaman</button><button onclick="ygCalEnd()">✖ Bekor</button></div>`;
        }
        function ygCalHere() {
            if (!navigator.geolocation) { showToast('📍 GPS mavjud emas'); return; }
            showToast('📍 Joylashuv aniqlanmoqda...');
            navigator.geolocation.getCurrentPosition(p => { if ((p.coords.accuracy || 99) > 25) showToast('⚠️ GPS aniqligi ±' + Math.round(p.coords.accuracy) + ' m — ochiq joyda qayta urinib koʻring'); ygCalAdd(p.coords.latitude, p.coords.longitude, Math.round(p.coords.accuracy || 0)); },
                () => showToast("📍 Joylashuvni aniqlab boʻlmadi"), { enableHighAccuracy: true, timeout: 20000 });
        }
        function ygCalAdd(lat, lon, acc) {
            const c = YG.calib; if (!c || c.x === undefined) return;
            const g = ygGeo(); g.pairs.push({ x: +c.x.toFixed(1), y: +c.y.toFixed(1), lat: +lat.toFixed(7), lon: +lon.toFixed(7), acc: acc || null, at: new Date().toISOString(), by: authorStr() });
            g.cs = 'm2'; g.at = new Date().toISOString(); g.by = String(currentUser && currentUser.tabel || ''); kvSet(YG_GEO_KEY, g);
            if (c.mk) YG.map.removeLayer(c.mk);
            YG.calib = { step: 'scheme' };
            const was = YG.T && YG.T.nominal; ygReplace(); ygCalBar();
            const n = g.pairs.length;
            if (n >= 2) { const T = ygCurT(), er = ygErr(T, g.pairs), mx = Math.max.apply(null, er);
                showToast('✅ ' + n + ' ta nuqta · eng katta farq ≈ ' + Math.round(mx) + ' m' + (n === 2 ? ' · aniqlik uchun 3–4 nuqta tavsiya etiladi' : ''));
                if (was) YG.map.fitBounds(L.latLngBounds([ygToLL(0, 0), ygToLL(YIG.W, YIG.H)]), { animate: false });
            } else showToast('✅ 1-nuqta saqlandi. Kamida yana 1 ta nuqta kerak.');
        }
        function ygCalEnd() { const c = YG.calib; if (c && c.mk) YG.map.removeLayer(c.mk); YG.calib = null; if (YG.lbl && !YG.map.hasLayer(YG.lbl)) YG.lbl.addTo(YG.map); ygCalBar(); ygRefresh(); }
        async function ygCalClear() {
            if (!isAdmin()) return; if (!(await uiConfirm("GPS bogʻlash nuqtalarining hammasi oʻchirilsinmi?"))) return;
            kvSet(YG_GEO_KEY, { pairs: [], cs: 'm2', at: new Date().toISOString(), by: String(currentUser && currentUser.tabel || '') }); ygReplace(); renderLayerPanel();
        }
        async function ygCalDel(i) {
            if (!isAdmin()) return; const g = ygGeo(); if (!g.pairs[i]) return; if (!(await uiConfirm((i + 1) + '-nuqta oʻchirilsinmi?'))) return;
            g.pairs.splice(i, 1); g.at = new Date().toISOString(); kvSet(YG_GEO_KEY, g); ygReplace(); renderLayerPanel();
        }
        function ygPanelHtml() {
            const o = ygOpt(), g = ygGeo(), cal = ygIsCal(), T = ygCurT(), er = cal ? ygErr(T, g.pairs) : [];
            let h = `<h4 style="margin-top:12px;">📐 Yigʻma sxema</h4>
                <div class="yg-row"><label><input type="checkbox" ${o.sat ? 'checked' : ''} ${cal ? '' : 'disabled'} onchange="ygOptSet({sat:this.checked}); ygRefresh(); renderLayerPanel();"> 🛰️ Sputnik qatlami</label></div>
                ${o.sat && cal ? `<div class="lyr-row">Sxema koʻrinishi<input type="range" min="0.2" max="1" step="0.05" value="${o.op}" oninput="ygOptSet({op:+this.value}); ygRefresh();"></div>
` : ''}
                <div class="yg-row"><label><input type="checkbox" ${o.sheets ? 'checked' : ''} onchange="ygOptSet({sheets:this.checked}); ygRefresh();"> Stansiya varaqlarini ustiga qoʻyish (batafsil, 2024)</label></div>
                <div class="lyr-note">${cal ? `✅ GPS bilan bogʻlangan: ${g.pairs.length} ta nuqta, eng katta farq ≈ ${Math.round(Math.max.apply(null, er))} m.` : `⚠️ GPS bilan bogʻlanmagan${g.pairs.length ? ' (' + g.pairs.length + ' ta nuqta, kamida 2 ta kerak)' : ''}. Sputnik qatlami bogʻlangandan keyin yoqiladi.`} Asos — «Schema STTB 2026» (marksheyderlik boʻlimi, vektorli). Stansiyani bossangiz — oʻsha stansiyaning alohida asl varagʻi ochiladi. Internetsiz ham ishlaydi (sputnikdan tashqari).</div>`;
            if (isAdmin()) {
                h += `<div class="yg-adm"><button onclick="ygCalStart()">📍 GPS bilan bogʻlash (${g.pairs.length ? '+ nuqta' : 'boshlash'})</button>${g.pairs.length ? `<button class="danger" onclick="ygCalClear()">🗑 Tozalash</button>` : ''}</div>`;
                if (g.pairs.length) h += '<div class="yg-pairs">' + g.pairs.map((p, i) => `<div>${i + 1}) ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}${er[i] !== undefined ? ' · farq ' + Math.round(er[i]) + ' m' : ''} <a onclick="ygCalDel(${i})">✖</a></div>`).join('') + '</div>';
            }
            return h;
        }

        // ---------- Stansiya varag'i (asl, to'liq vektorli sxema) ----------
        function ygViewerEl() {
            let d = $id('ygViewer'); if (d) return d;
            d = document.createElement('div'); d.id = 'ygViewer'; d.className = 'yg-viewer hidden';
            d.innerHTML = `<div class="yg-vh"><div class="yg-vt" id="ygVt"></div><div class="yg-vb">
                <button onclick="ygVwMode()" id="ygVmBtn">📄 Asl rang</button><button onclick="ygVwPrint()">🖨 PDF / chop</button><button onclick="ygVwInfo()">🗂 Pasport</button><button onclick="ygCloseSheet()">✖</button></div></div>
                <div class="yg-vmap" id="ygVmap"></div><div class="yg-vnote" id="ygVnote"></div>`;
            document.body.appendChild(d); return d;
        }
        async function ygOpenSheet(id) {
            const s = ygSheet(id); if (!s) return;
            try { await loadLeaflet(); } catch (e) { return; }
            const d = ygViewerEl(); d.classList.remove('hidden'); YG.vwId = id;
            const st = typeof st40 === 'function' ? st40(id) : null;
            $id('ygVt').innerHTML = `<b>📐 ${escapeHtml((st ? st.ok + '-okolotka — ' : '') + s.name)}</b><small>Marksheyderlik boʻlimi · asl vektorli sxema (PDF) · 🔒 maxfiy</small>`;
            $id('ygVnote').innerText = /manual|partial/.test((s.method || '') + (s.note || '')) && s.rms_px > 20 ? "ℹ️ Yigʻma sxemadagi joylashuvi taxminiy (varaq shartli chizilgan)." : '';
            if (!YG.vw) {
                YG.vw = L.map('ygVmap', { crs: L.CRS.Simple, zoomControl: true, attributionControl: false, zoomSnap: 0.25, zoomDelta: 0.5, minZoom: -4, maxZoom: 6 });
            }
            ygVwLoad();
        }
        async function ygVwLoad() {
            const id = YG.vwId, s = ygSheet(id), m = YG.vw; if (!s || !m) return;
            if (YG.vwLay) m.removeLayer(YG.vwLay);
            const vb = s.fullVB || [0, 0, 1190.55, 841.89];
            const it = { w: vb[2], h: vb[3], A: [1, 0, 0, 1, vb[0], vb[1]], cap: 14000, fixedOp: true };
            YG.vwLay = new YgLayer([it], (x, y) => L.latLng(-y, x)); YG.vwLay.addTo(m);
            $id('ygVmap').classList.toggle('orig', YG.vwMode === 'orig');
            $id('ygVmBtn').innerText = YG.vwMode === 'orig' ? '🌙 Tungi' : '📄 Asl rang';
            m.invalidateSize(); m.fitBounds(L.latLngBounds([L.latLng(-vb[1], vb[0]), L.latLng(-(vb[1] + vb[3]), vb[0] + vb[2])]), { animate: false });
            try { it.el.src = await ygSvgUrl(id, YG.vwMode, false); } catch (e) { $id('ygVnote').innerText = /^🗺/.test(e && e.message) ? e.message : "⚠️ Bu qurilmada vektorli sxemani ochib boʻlmadi."; }
        }
        function ygVwMode() { YG.vwMode = YG.vwMode === 'orig' ? 'dark' : 'orig'; ygVwLoad(); }
        function ygCloseSheet() { const d = $id('ygViewer'); if (d) d.classList.add('hidden'); YG.vwId = null; }
        function ygVwInfo() { const inf = YG_INFRA[YG.vwId]; if (inf && typeof openInfra === 'function') { ygCloseSheet(); openInfra(inf); } else if (typeof st40Open === 'function') { const id = YG.vwId; ygCloseSheet(); st40Open(id); } }
        async function ygVwPrint() {
            const id = YG.vwId, s = ygSheet(id); if (!s) return;
            const u = await ygSvgUrl(id, 'orig', false);
            const t = await (await fetch(u)).text(); const du = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(t)));
            const pr = $id('ndPrint'); if (!pr) { showToast('⚠️ Chop etish moduli topilmadi'); return; }
            const old = pr.innerHTML;
            pr.innerHTML = `<style>@page { size: A3 landscape; margin: 6mm; } .yg-print { width: 100%; } .yg-print img { width: 100%; height: auto; display: block; }</style><div class="yg-print"><img src="${du}"></div>`;
            document.body.classList.add('nd-printing');
            const done = () => { document.body.classList.remove('nd-printing'); pr.innerHTML = old; window.removeEventListener('afterprint', done); };
            window.addEventListener('afterprint', done);
            setTimeout(() => { try { window.print(); } catch (e) { done(); } }, 250);
        }

        // ---------- Mavjud xarita ekraniga ulash (qatlamlar paneli, tugmalar) ----------
        (function () {
            try {
                if (localStorage.getItem('agmk_map_v2') !== '1') { MAPL.yig = true; MAPL.sx = false; MAPL.gps = false; MAPL.hyb = false; saveMapL(); localStorage.setItem('agmk_map_v2', '1'); }
            } catch (e) {}
            if (MAPL.yig === undefined) MAPL.yig = true;
            // Ustma-ust rejimida yig'ma sxema boshqa qatlamlarni yopib qo'ymasligi uchun: yig'ma <-> boshqalar navbatma-navbat
            setMapLayer = function (k) {
                MAPL[k] = !MAPL[k];
                if (MAPL[k] && MAPL.mode === 'stack') { if (k === 'yig') { MAPL.sx = MAPL.gps = MAPL.hyb = false; } else MAPL.yig = false; }
                if (!MAPL.sx && !MAPL.gps && !MAPL.hyb && !MAPL.yig) MAPL[k] = true; // kamida bitta qatlam
                saveMapL(); renderLayerPanel(); applyMapLayers();
            };
            renderLayerPanel = agmkExtend('renderLayerPanel', 'renderLayerPanel', renderLayerPanel, oRen => function () {
                oRen.apply(this, arguments);
                const p = $id('lyrPanel'); if (!p || p.classList.contains('hidden')) return;
                const g = p.querySelector('.lyr-opts'); if (g) {
                    g.classList.add('yg4');
                    const y = document.createElement('div'); y.className = 'lyr-opt' + (MAPL.yig ? ' on' : ''); y.setAttribute('onclick', "setMapLayer('yig')"); y.innerHTML = '<b>📐</b>Yigʻma sxema';
                    g.insertBefore(y, g.firstChild);
                    const sx = g.querySelector('[onclick="setMapLayer(\'sx\')"]'); if (sx) sx.lastChild.textContent = 'Oddiy sxema';
                }
                if (MAPL.yig) { const w = document.createElement('div'); w.innerHTML = ygPanelHtml(); p.appendChild(w); }
            });
            applyMapLayers = agmkExtend('applyMapLayers', 'applyMapLayers', applyMapLayers, oApply => function () {
                ygEnsurePane();
                oApply.apply(this, arguments);
                const y = $id('paneYig'); if (!y) return;
                y.classList.toggle('off', !MAPL.yig);
                if (MAPL.mode === 'stack') {
                    y.style.zIndex = 4;
                    if (MAPL.yig) ['paneSx', 'paneGps', 'paneHyb'].forEach(k => { const e = $id(k); if (e) e.classList.add('off'); });
                } else y.style.zIndex = '';
                if (MAPL.yig) { const lg = $id('mapLegend'); if (lg) lg.style.display = 'none'; ygInit(); }
                setTimeout(() => { if (YG.map) try { YG.map.invalidateSize(); } catch (e) {} }, 70);
            });
            mapZoomAll = agmkExtend('mapZoomAll', 'mapZoomAll', mapZoomAll, oZ => function (f) { if (MAPL.yig && YG.map) { f > 1 ? YG.map.zoomIn() : YG.map.zoomOut(); } return oZ.apply(this, arguments); });
            mapResetAll = agmkExtend('mapResetAll', 'mapResetAll', mapResetAll, oR => function () { if (MAPL.yig && YG.map) YG.map.fitBounds(L.latLngBounds([ygToLL(0, 0), ygToLL(YIG.W, YIG.H)]), { animate: false }); return oR.apply(this, arguments); });
            mapLocate = agmkExtend('mapLocate', 'mapLocate', mapLocate, oL => function (cb) {
                if (cb || !MAPL.yig || !YG.map) return oL.apply(this, arguments);
                if (!ygIsCal()) { showToast("📍 Yigʻma sxema hali GPS bilan bogʻlanmagan (admin: Qatlamlar → «GPS bilan bogʻlash»)"); return; }
                if (!navigator.geolocation) { showToast("📍 Bu qurilmada GPS mavjud emas"); return; }
                showToast('📍 Joylashuv aniqlanmoqda...');
                navigator.geolocation.getCurrentPosition(p => {
                    const ll = L.latLng(p.coords.latitude, p.coords.longitude);
                    if (YG.me) YG.map.removeLayer(YG.me);
                    YG.me = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindTooltip('Siz shu yerdasiz' + (p.coords.accuracy ? ' (±' + Math.round(p.coords.accuracy) + ' m)' : ''), { direction: 'top' }).addTo(YG.map);
                    YG.map.setView(ll, Math.max(YG.map.getZoom(), 16));
                }, e => showToast(e && e.code === 1 ? "📍 Joylashuvga ruxsat berilmadi" : "📍 Joylashuvni aniqlab boʻlmadi"), { enableHighAccuracy: true, timeout: 15000 });
            });
            // Stansiya pasportida — vektorli sxema va yig'ma xarita tugmalari
            if (typeof openInfra === 'function') {
                openInfra = agmkExtend('openInfra', 'Stansiya pasportida — vektorli sxema va yigʼma xarita tugmalari', openInfra, oI => function (id) {
                    const r = oI.apply(this, arguments);
                    try { const sid = ST40_MAP[id], b = $id('st40-box');
                        if (sid && b && ygSheet(sid) && !b.querySelector('.yg-pbtn')) {
                            const w = document.createElement('div'); w.className = 'yg-pbtn';
                            w.innerHTML = `<button class="vs-btn" onclick="ygOpenSheet('${sid}')">🧭 Asl vektorli sxema (PDF)</button><button class="vs-btn" onclick="ygShowOnMap('${sid}')">🗺 Yigʻma xaritada koʻrsatish</button>`;
                            const btn = b.querySelector('.vs-btn'); if (btn) btn.parentNode.insertBefore(w, btn.nextSibling); else b.appendChild(w);
                        } } catch (e) {}
                    return r;
                });
            }
            // Sinxronlash: bog'lash nuqtalari faqat admin tomonidan
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(YG_GEO_KEY)) KV_SYNC.keys.push(YG_GEO_KEY); } catch (e) {}
            if (typeof syncApply === 'function') {
                syncApply = agmkExtend('syncApply', 'syncApply', syncApply, oA => function (rec) {
                    if (rec && rec.kind === 'kv' && rec.data && rec.data.k === YG_GEO_KEY) {
                        const d = rec.data, v = d.v || {}; if (String(d.by) !== ADMIN_TABEL || !Array.isArray(v.pairs)) return null;
                        const cur = ygGeo(); if (cur.at && v.at && cur.at >= v.at) return null;
                        try { localStorage.setItem(YG_GEO_KEY, JSON.stringify(v)); } catch (e) {} setTimeout(ygReplace, 50); return 'kv';
                    }
                    return oA.apply(this, arguments);
                });
            }
        })();
        function ygShowOnMap(sid) {
            const s = ygSheet(sid); if (!s) return;
            MAPL.yig = true; saveMapL(); openMapScreen();
            setTimeout(async () => { await ygInit(); const m = YG.map; if (!m) return;
                m.fitBounds(L.latLngBounds(s.hot.map(p => ygToLL(p[0], p[1]))), { animate: false, padding: [20, 20] });
                const pg = L.polygon(s.hot.map(p => ygToLL(p[0], p[1])), { color: '#facc15', weight: 3, fill: false, dashArray: '6 6', interactive: false }).addTo(m);
                setTimeout(() => m.removeLayer(pg), 6000); }, 350);
        }
        // AI "... xaritada ko'rsat" — yig'ma sxemada ham ko'rsatish
        (function () {
            if (typeof mapFocus !== 'function') return;
            mapFocus = agmkExtend('mapFocus', 'mapFocus', mapFocus, oF => function (id) { const r = oF.apply(this, arguments); try { const sid = ST40_MAP[id]; if (sid && MAPL.yig && ygSheet(sid)) setTimeout(() => ygShowOnMap(sid), 200); } catch (e) {} return r; });
        })();
        var NET41 = {"W":4478.74,"H":2383.94,"stations":{"ohan":{"anchor":[3424.5,394.3],"mapped":true},"izv":{"anchor":[2862.5,647.3],"mapped":true},"olm":{"anchor":[2150.2,634.7],"mapped":true},"svi":{"anchor":[1551.8,929.7],"mapped":true},"ob_veer":{"anchor":null,"mapped":false},"nij":{"anchor":null,"mapped":false},"fab":{"anchor":[1284.1,2286.5],"mapped":true},"bun":{"anchor":[1102.4,2062.1],"mapped":true},"med":{"anchor":[759.8,935.3],"mapped":true},"ob_mof":{"anchor":[634.0,780.1],"mapped":true},"ob_mpz":{"anchor":[349.5,659.2],"mapped":true},"pre":{"anchor":[3938.3,747.3],"mapped":true},"sau":{"anchor":[4354.3,1577.7],"mapped":true},"ob_oxx":{"anchor":[95.8,2054.4],"mapped":true},"ob_mof3":{"anchor":[728.4,1983.8],"mapped":true},"kol":{"anchor":[803.2,601.9],"mapped":true},"ob_lokdepo":{"anchor":[632.9,205.3],"mapped":true},"ob_yoldepo":{"anchor":null,"mapped":false},"kal":{"anchor":[2697.6,1582.6],"mapped":true},"por":{"anchor":[2504.6,1790.9],"mapped":true},"r668":{"anchor":[2967.4,1409.9],"mapped":true},"raz":{"anchor":[3115.6,1537.2],"mapped":true},"otv":{"anchor":[3710.4,1189.7],"mapped":true},"vos":{"anchor":null,"mapped":false},"yos":{"anchor":[2046.1,2078.2],"mapped":true},"vm":{"anchor":[4409.5,662.7],"mapped":true}},"peregons":{"pr_ohan_izv":{"a":"ohan","b":"izv","pts":[[3424.0,394.0],[3429.0,401.0],[3427.0,408.0],[3449.0,445.0],[3474.0,520.0],[3483.0,568.0],[3485.0,616.0],[3479.0,650.0],[3461.0,687.0],[3445.0,710.0],[3406.0,745.0],[3375.0,752.0],[3041.0,752.0],[3026.0,746.0],[2845.0,623.0],[2822.0,620.0],[2862.0,647.0]],"approx":false},"pr_izv_olm":{"a":"izv","b":"olm","pts":[[2862.0,647.0],[2755.0,577.0],[2733.0,572.0],[2667.0,572.0],[2652.0,568.0],[2629.0,549.0],[2619.0,532.0],[2597.0,514.0],[2578.0,509.0],[2559.0,509.0],[2542.0,516.0],[2493.0,557.0],[2463.0,578.0],[2393.0,618.0],[2362.0,632.0],[2150.0,635.0]],"approx":false},"pr_olm_kol":{"a":"olm","b":"kol","pts":[[2150.0,635.0],[2006.0,635.0],[2003.0,638.0],[1972.0,640.0],[1970.0,623.0],[1951.0,623.0],[1928.0,627.0],[1765.0,684.0],[1734.0,684.0],[1682.0,675.0],[1647.0,658.0],[1622.0,631.0],[1606.0,591.0],[1602.0,587.0],[1593.0,587.0],[1587.0,579.0],[1577.0,578.0],[1546.0,490.0],[1531.0,464.0],[1509.0,442.0],[1490.0,428.0],[1467.0,417.0],[1435.0,410.0],[1375.0,409.0],[1351.0,420.0],[1096.0,420.0],[983.0,435.0],[978.0,426.0],[965.0,426.0],[876.0,439.0],[847.0,455.0],[830.0,476.0],[824.0,500.0],[823.0,546.0],[827.0,548.0],[827.0,561.0],[803.0,564.0],[803.0,602.0]],"approx":false},"pr_olm_med":{"a":"olm","b":"med","pts":[[2150.0,635.0],[2006.0,635.0],[2003.0,638.0],[1972.0,640.0],[1970.0,635.0],[1952.0,634.0],[1921.0,641.0],[1858.0,664.0],[1851.0,669.0],[1766.0,694.0],[1728.0,695.0],[1660.0,686.0],[1633.0,686.0],[1630.0,692.0],[1610.0,694.0],[1610.0,689.0],[1532.0,699.0],[1497.0,710.0],[1472.0,723.0],[1372.0,798.0],[1297.0,838.0],[1293.0,842.0],[1296.0,847.0],[1232.0,878.0],[1186.0,896.0],[1149.0,907.0],[1100.0,914.0],[991.0,914.0],[989.0,917.0],[986.0,914.0],[875.0,914.0],[850.0,909.0],[828.0,932.0],[806.0,924.0],[799.0,931.0],[747.0,929.0],[760.0,935.0]],"approx":false},"pr_olm_svi":{"a":"olm","b":"svi","pts":[[2150.0,635.0],[2006.0,635.0],[2003.0,638.0],[1972.0,640.0],[1970.0,635.0],[1952.0,634.0],[1921.0,641.0],[1858.0,664.0],[1851.0,669.0],[1818.0,678.0],[1782.0,710.0],[1693.0,810.0],[1686.0,806.0],[1606.0,896.0],[1560.0,921.0],[1552.0,930.0]],"approx":false},"pr_svi_nij":{"a":"svi","b":"nij","pts":[[1552.0,930.0],[1522.0,961.0],[1512.0,976.0],[1456.0,1039.0],[1446.0,1060.0],[1446.0,1067.0],[1422.0,1094.0],[1416.0,1116.0],[1354.0,1187.0],[1343.0,1209.0],[1339.0,1232.0],[1339.0,1434.0],[1347.0,1437.0],[1347.0,1491.0],[1343.0,1502.0],[1329.0,1514.0],[1306.0,1523.0],[1235.0,1541.0],[1225.0,1546.0],[1210.0,1561.0],[1067.0,1759.0],[1053.0,1793.0],[1039.0,1852.0],[1023.0,1957.0],[1024.0,1997.0],[1034.0,2022.0],[1059.0,2057.0],[1085.0,2084.0],[1144.0,2119.0],[1161.0,2136.0],[1250.0,2248.0],[1284.0,2286.0]],"approx":true},"pr_nij_fab":{"a":"nij","b":"fab","pts":[[1552.0,930.0],[1522.0,961.0],[1512.0,976.0],[1456.0,1039.0],[1446.0,1060.0],[1446.0,1067.0],[1422.0,1094.0],[1416.0,1116.0],[1354.0,1187.0],[1343.0,1209.0],[1339.0,1232.0],[1339.0,1434.0],[1347.0,1437.0],[1347.0,1491.0],[1343.0,1502.0],[1329.0,1514.0],[1306.0,1523.0],[1235.0,1541.0],[1225.0,1546.0],[1210.0,1561.0],[1067.0,1759.0],[1053.0,1793.0],[1039.0,1852.0],[1023.0,1957.0],[1024.0,1997.0],[1034.0,2022.0],[1059.0,2057.0],[1085.0,2084.0],[1144.0,2119.0],[1161.0,2136.0],[1250.0,2248.0],[1284.0,2286.0]],"approx":true},"pr_fab_bun":{"a":"fab","b":"bun","pts":[[1284.0,2286.0],[1171.0,2146.0],[1150.0,2125.0],[1118.0,2104.0],[1102.0,2062.0]],"approx":false},"pr_svi_med":{"a":"svi","b":"med","pts":[[1552.0,930.0],[1522.0,961.0],[1512.0,976.0],[1456.0,1039.0],[1446.0,1060.0],[1446.0,1067.0],[1422.0,1094.0],[1416.0,1116.0],[1381.0,1154.0],[1341.0,1175.0],[1315.0,1182.0],[1287.0,1185.0],[1253.0,1183.0],[1227.0,1174.0],[1055.0,1065.0],[990.0,1034.0],[908.0,1002.0],[892.0,986.0],[760.0,935.0]],"approx":false},"pr_izv_pre":{"a":"izv","b":"pre","pts":[[2862.0,647.0],[3023.0,756.0],[3046.0,764.0],[3499.0,764.0],[3543.0,746.0],[3575.0,742.0],[3639.0,743.0],[3681.0,757.0],[3852.0,758.0],[3855.0,755.0],[3889.0,747.0],[3938.0,747.0]],"approx":false},"pr_pre_vm":{"a":"pre","b":"vm","pts":[[3938.0,747.0],[4180.0,746.0],[4193.0,741.0],[4214.0,719.0],[4228.0,697.0],[4238.0,670.0],[4251.0,618.0],[4266.0,588.0],[4289.0,565.0],[4303.0,556.0],[4343.0,543.0],[4371.0,542.0],[4402.0,550.0],[4420.0,559.0],[4436.0,577.0],[4436.0,609.0],[4410.0,663.0]],"approx":false},"pr_pre_sau":{"a":"pre","b":"sau","pts":[[3938.0,747.0],[4070.0,747.0],[4071.0,757.0],[4141.0,759.0],[4155.0,774.0],[4159.0,799.0],[4150.0,808.0],[4073.0,812.0],[4058.0,831.0],[4056.0,865.0],[4061.0,876.0],[4084.0,894.0],[4112.0,899.0],[4166.0,899.0],[4190.0,904.0],[4203.0,922.0],[4202.0,956.0],[4223.0,970.0],[4239.0,988.0],[4241.0,1017.0],[4237.0,1030.0],[4211.0,1068.0],[4204.0,1085.0],[4205.0,1111.0],[4216.0,1163.0],[4216.0,1187.0],[4188.0,1257.0],[4185.0,1285.0],[4207.0,1325.0],[4221.0,1369.0],[4315.0,1503.0],[4320.0,1531.0],[4354.0,1578.0]],"approx":false},"pr_kal_kol":{"a":"kal","b":"kol","pts":[[2698.0,1583.0],[2666.0,1554.0],[2520.0,1486.0],[2435.0,1481.0],[2354.0,1443.0],[2339.0,1424.0],[2285.0,1400.0],[2259.0,1376.0],[2130.0,1322.0],[2112.0,1296.0],[2014.0,1080.0],[1988.0,1048.0],[1965.0,1029.0],[1967.0,1026.0],[1920.0,984.0],[1927.0,969.0],[1918.0,960.0],[1900.0,966.0],[1873.0,941.0],[1705.0,824.0],[1668.0,793.0],[1592.0,584.0],[1576.0,576.0],[1541.0,480.0],[1509.0,442.0],[1483.0,424.0],[1435.0,410.0],[1375.0,409.0],[1351.0,420.0],[1096.0,420.0],[987.0,435.0],[978.0,426.0],[876.0,439.0],[847.0,455.0],[830.0,476.0],[824.0,500.0],[827.0,561.0],[803.0,564.0],[803.0,602.0]],"approx":false},"pr_kol_kal3":{"a":"kol","b":"kal","pts":[[803.0,602.0],[803.0,564.0],[827.0,561.0],[823.0,505.0],[829.0,473.0],[853.0,451.0],[877.0,440.0],[969.0,426.0],[996.0,435.0],[1090.0,421.0],[1353.0,420.0],[1395.0,409.0],[1448.0,411.0],[1491.0,427.0],[1535.0,472.0],[1574.0,574.0],[1591.0,585.0],[1665.0,791.0],[1874.0,940.0],[1903.0,967.0],[1918.0,960.0],[1927.0,969.0],[1920.0,984.0],[1988.0,1048.0],[2015.0,1084.0],[2115.0,1305.0],[2127.0,1319.0],[2256.0,1372.0],[2288.0,1400.0],[2341.0,1424.0],[2352.0,1441.0],[2445.0,1481.0],[2520.0,1485.0],[2670.0,1555.0],[2698.0,1583.0]],"approx":false},"pr_kal_668":{"a":"kal","b":"r668","pts":[[2698.0,1583.0],[2713.0,1598.0],[2909.0,1690.0],[2940.0,1695.0],[2965.0,1689.0],[2982.0,1680.0],[3007.0,1653.0],[3019.0,1624.0],[3028.0,1577.0],[3037.0,1483.0],[3024.0,1458.0],[3003.0,1438.0],[2981.0,1425.0],[2967.0,1410.0]],"approx":false},"pr_668_kal":{"a":"r668","b":"kal","pts":[[2967.0,1410.0],[2980.0,1423.0],[3001.0,1435.0],[3021.0,1455.0],[3037.0,1489.0],[3029.0,1576.0],[3020.0,1624.0],[3006.0,1656.0],[2979.0,1680.0],[2941.0,1694.0],[2924.0,1695.0],[2909.0,1691.0],[2716.0,1601.0],[2698.0,1583.0]],"approx":false},"pr_kal_por":{"a":"kal","b":"por","pts":[[2698.0,1583.0],[2666.0,1554.0],[2520.0,1486.0],[2487.0,1482.0],[2435.0,1481.0],[2351.0,1441.0],[2344.0,1445.0],[2302.0,1535.0],[2291.0,1569.0],[2292.0,1598.0],[2313.0,1648.0],[2334.0,1685.0],[2360.0,1711.0],[2384.0,1727.0],[2505.0,1791.0]],"approx":false},"pr_kal_por_b":{"a":"kal","b":"por","pts":[[2698.0,1583.0],[2666.0,1554.0],[2520.0,1486.0],[2487.0,1482.0],[2435.0,1481.0],[2351.0,1441.0],[2344.0,1445.0],[2302.0,1535.0],[2291.0,1569.0],[2292.0,1598.0],[2313.0,1648.0],[2334.0,1685.0],[2360.0,1711.0],[2384.0,1727.0],[2505.0,1791.0]],"approx":false}}};

