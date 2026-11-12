        // =====================================================================
        // v3.6.2 — yakunlash paketi:
        //  • vagon rasmlari (roʻyxat va pasport) · • Buxgalteriya: yil tanlash (oxirgi 3 yil + keyingi yil, ✅/○)
        //  • sxema yuklash oynasi: aniq sabab, «📡 Ulanish» / «📂 Fayldan», foiz
        //  • OSM haqiqiy temir yoʻllar (sxema ustida qatlam, navigatorda) va GPS nuqtasini eng yaqin yoʻlga «yopishtirish»
        //  • nosozlik: «🛰 Sputnikda» va «🧭 Navigatorda ochish»
        // =====================================================================
        (function () { const st = document.createElement('style'); st.textContent = VIMG_CSS + `
.vgi{background-repeat:no-repeat;background-position:center bottom;background-size:contain}
.vg-thumb{height:46px;margin:8px 0 2px;opacity:.95}
.vg-hero{height:120px;margin:4px 0 12px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))}
.vg-hero-wrap{position:relative;background:linear-gradient(180deg,rgba(56,189,248,.06),rgba(15,23,42,0));border:1px solid rgba(125,211,252,.15);border-radius:14px;padding:10px 10px 4px;margin-bottom:12px}
.vg-hero-no{position:absolute;left:14px;top:8px;font:800 15px/1 system-ui;color:#e2e8f0;background:rgba(15,23,42,.7);padding:4px 8px;border-radius:8px}
.vg-hero-t{position:absolute;right:14px;top:8px;font-size:11px;color:#94a3b8;background:rgba(15,23,42,.7);padding:4px 8px;border-radius:8px}
.bx-yl{font-size:12px;color:#94a3b8;margin-right:4px;align-self:center}
.sx-prog{height:8px;border-radius:6px;background:#1e293b;overflow:hidden;margin:10px 0 4px}.sx-prog i{display:block;height:100%;background:linear-gradient(90deg,#0ea5e9,#22c55e);width:0;transition:width .2s}
.osm-btn{background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:10px;padding:7px 10px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer}.osm-btn.on{background:#0369a1;border-color:#38bdf8}`; document.head.appendChild(st); })();

        // ---------- 1. Vagon rasmlari ----------
        function vgImgKey(v) {
            if (!v || v.kind) return null; const t = typeof vTypeFull === 'function' && v.naim !== undefined ? vTypeFull(v) : String(v.type || ''), all = [t, v.naim, v.model, v.primen].join(' ');
            if (/звен|zveno|упк/i.test(all)) return 'zv';
            if (/115/.test(t)) return '115'; if (/\b60\b/.test(t)) return '60'; if (/105/.test(t)) return '105';
            if (/cistern|sistern|цистерн/i.test(t)) return 'cis'; if (/platform/i.test(t)) return 'pla'; if (/xopper|хоппер|hopper/i.test(t)) return 'xop'; if (/poluvagon|полувагон/i.test(t)) return 'pol';
            return null;
        }
        if (typeof vagonCardHtml === 'function') vagonCardHtml = agmkExtend('vagonCardHtml', 'v3.6.2: vagon rasmi', vagonCardHtml, o => function (v) {
            let h = o.apply(this, arguments); const k = vgImgKey(v); if (k) h = h.replace(/<div class="hd-vic">[\s\S]*?<\/svg><\/div>/, ''); return k ? h.replace('<div class="vagon-info"', `<div class="vgi vg-thumb vgi-${k}" role="img" aria-label="${escapeHtml(v.type || '')}"></div><div class="vagon-info"`) : h;
        });
        if (typeof renderPassportExtra === 'function') renderPassportExtra = agmkExtend('renderPassportExtra', 'v3.6.2: pasportda vagon rasmi', renderPassportExtra, o => function (v) {
            const r = o.apply(this, arguments);
            try { const box = $id('p-extra-box'); if (box && box.parentNode) { let w = $id('vgHero'); const k = vgImgKey(v);
                if (!k) { if (w) w.remove(); } else { if (!w) { w = document.createElement('div'); w.id = 'vgHero'; box.parentNode.insertBefore(w, box); }
                    w.className = 'vg-hero-wrap'; w.innerHTML = `<span class="vg-hero-no">№ ${escapeHtml(typeof vagonNo === 'function' ? vagonNo(v) : v.num || '')}</span><span class="vg-hero-t">${escapeHtml(k === 'zv' ? 'Zveno tashuvchi platforma' : (typeof vTypeFull === 'function' ? vTypeFull(v) : v.type) || '')}</span><div class="vgi vg-hero vgi-${k}"></div>`; } } } catch (e) { console.error(e); }
            return r;
        });

        // ---------- 2. Buxgalteriya: hisobot yili ----------
        function bxYears() { const y = new Date().getFullYear(); return [y - 2, y - 1, y, y + 1]; }
        function bxHasData(y) { const d = bxData(); return d.exp.some(e => String(e.date).slice(0, 4) === String(y)) || !!(d.plan[y] && Object.keys(d.plan[y]).length); }
        if (typeof bxYearSel === 'function') bxYearSel = agmkExtend('bxYearSel', 'v3.6.2: yil tanlash', bxYearSel, o => function () {
            const ys = new Set(bxYears()); try { const d = bxData(); d.exp.forEach(e => { const y = +String(e.date).slice(0, 4); if (y) ys.add(y); }); Object.keys(d.plan).forEach(y => +y && ys.add(+y)); } catch (e) {}
            if (!ys.has(BX.y)) ys.add(BX.y);
            return `<span class="bx-yl">📅 Hisobot yili:</span><select onchange="BX.y=+this.value; bxRender()">${Array.from(ys).sort().map(y => `<option value="${y}" ${y === BX.y ? 'selected' : ''}>${bxHasData(y) ? '✅' : '○'} ${y}</option>`).join('')}</select>`;
        });
        if (typeof bxRender === 'function') bxRender = agmkExtend('bxRender', 'v3.6.2: boʻsh yil boʻyicha koʻrsatma', bxRender, o => function () {
            const r = o.apply(this, arguments);
            try { if (/^(rf|exp|plan)$/.test(BX.tab) && !bxHasData(BX.y)) { const b = secBody('screen-bux'), f = b && b.querySelector('.mm-flt');
                if (f && !b.querySelector('.bx-empty')) { const d = document.createElement('div'); d.className = 'nd-tip bx-empty';
                    d.innerHTML = `ℹ️ <b>${BX.y}-yil</b> uchun hali maʼlumot kiritilmagan. ${BX.tab === 'plan' ? 'Quyida moddalar boʻyicha yillik rejani kiriting.' : '«🧾 Xarajatlar» boʻlimida xarajat qoʻshing yoki «🎯 Reja»da yillik rejani kiriting — jadval avtomatik toʻladi.'} Maʼlumoti bor yillar roʻyxatda ✅ bilan belgilangan.`;
                    f.insertAdjacentElement('afterend', d); } } } catch (e) {}
            return r;
        });

        // ---------- 3. Sxema yuklash oynasi ----------
        function sxWhy(code, extra) {
            const M = { off: ['📡 Server bilan aloqa yoʻq', 'Ilova korxona serveriga ulanmagan. «📡 Ulanish» tugmasini bosing, server manzilini tanlab tizimga kiring, soʻng qayta yuklang.'],
                ses: ['🔑 Sessiya muddati tugagan', 'Xavfsizlik uchun kirish muddati tugadi. «📡 Ulanish» orqali qayta kiring (parol soʻraladi).'],
                net: ['⏳ Server javob bermayapti', 'Telefon korxona tarmogʻida (Wi-Fi) ekanini va server kompyuteri yoqilganini tekshiring. Soʻng «🔄 Qayta urinish».'],
                old: ['🧩 Server eski versiya', 'Server kompyuterida agmk-server yangi versiyasini oching — eski «data» papkasi saqlanib qoladi.'],
                err: ['⚠️ Yuklab boʻlmadi', ''] }, m = M[code] || M.err;
            mdl('sxWhy', `<div class="px-h"><b>${m[0]}</b><button class="mini-btn" onclick="mdlClose('sxWhy')">✕</button></div>
                <div class="nd-tip">${escapeHtml(m[1] + (extra ? (m[1] ? '\n\n' : '') + extra : '')).replace(/\n/g, '<br>')}</div>
                <button class="action-btn" onclick="mdlClose('sxWhy'); ${code === 'net' || code === 'err' ? 'sxPackDownload()' : "typeof syncOpen === 'function' && syncOpen()"}">${code === 'net' || code === 'err' ? '🔄 Qayta urinish' : '📡 Ulanish'}</button>
                ${code !== 'off' && code !== 'ses' ? `<button class="action-btn sec" onclick="mdlClose('sxWhy'); typeof syncOpen === 'function' && syncOpen()">📡 Ulanish sozlamalari</button>` : ''}
                <label class="action-btn sec" style="display:block;text-align:center;cursor:pointer">📂 Fayldan yuklash (.agmkpack)<input type="file" accept=".agmkpack" style="display:none" onchange="mdlClose('sxWhy'); sxPackFile(this)"></label>
                <div class="nd-tip" style="font-size:11px">Sxema maxfiy hujjat — faqat korxona serveridan yoki administrator bergan fayldan yuklanadi.</div>`, true);
        }
        sxPackDownload = agmkExtend('sxPackDownload', 'v3.6.2: aniq sabab va foiz', sxPackDownload, o => async function () {
            if (!(typeof srvOn === 'function' && srvOn())) { sxWhy('off'); return; }
            const c = syncCfg(), url = c.url.replace(/\/+$/, '') + '/api/pack/v1/sxema', hdr = () => { const s = syncGet(SYNC_SES, null); return { apikey: c.key, Authorization: 'Bearer ' + (s && s.access) }; };
            mdl('sxProg', `<div class="px-h"><b>⬇️ Temir yoʻl sxemasi yuklanmoqda</b></div><div class="sx-prog"><i id="sxBar"></i></div><div id="sxPct" class="nd-tip" style="text-align:center">Server bilan bogʻlanmoqda...</div>`, true);
            const done = () => mdlClose('sxProg');
            let r;
            try { const ac = new AbortController(), to = setTimeout(() => ac.abort(), 20000); r = await fetch(url, { headers: hdr(), signal: ac.signal }); clearTimeout(to);
                if (r.status === 401 && await sbRefresh()) r = await fetch(url, { headers: hdr() });
            } catch (e) { done(); sxWhy('net'); return; }
            if (r.status === 401) { done(); sxWhy('ses'); return; }
            if (!r.ok) { let t = ''; try { t = (await r.json()).message || ''; } catch (e) {} done(); sxWhy(r.status === 404 && (!t || t === 'Topilmadi') ? 'old' : 'err', t || ('Server javobi: ' + r.status)); return; }
            try {
                const tot = +r.headers.get('content-length') || 12.5e6, rd = r.body && r.body.getReader ? r.body.getReader() : null; let blob;
                if (rd) { const parts = []; let got = 0; for (;;) { const x = await rd.read(); if (x.done) break; parts.push(x.value); got += x.value.length; const p = Math.min(99, Math.round(got / tot * 100));
                    const b = $id('sxBar'), t = $id('sxPct'); if (b) b.style.width = p + '%'; if (t) t.textContent = p + '% · ' + (got / 1048576).toFixed(1) + ' / ' + (tot / 1048576).toFixed(1) + ' MB'; }
                    blob = new Blob(parts); } else blob = await r.blob();
                const t = $id('sxPct'); if (t) t.textContent = '✅ Yuklandi — sxema tayyorlanmoqda...';
                await sxPackStore(blob, 'server'); done(); showToast('✅ Temir yoʻl sxemasi yuklandi'); sxPackUi();
            } catch (e) { done(); sxWhy('err', agmkErrUz(e)); }
        });

        // ---------- 4. OSM temir yoʻllari ----------
        var OSM = { lines: null, on: false };
        function osmLines() {
            if (OSM.lines) return OSM.lines;
            OSM.lines = OSM_RAIL.l.map(a => { const main = a[0], pts = []; let la = a[1], lo = a[2]; pts.push([la / 1e5, lo / 1e5]); for (let i = 3; i < a.length; i += 2) { la += a[i]; lo += a[i + 1]; pts.push([la / 1e5, lo / 1e5]); } return { main: main, pts: pts }; });
            return OSM.lines;
        }
        function osmSnap(lat, lon, maxM) {
            maxM = maxM || 25; const kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110574; let best = null;
            osmLines().forEach(L0 => { const p = L0.pts; for (let i = 1; i < p.length; i++) {
                const ax = (p[i - 1][1] - lon) * kx, ay = (p[i - 1][0] - lat) * ky, bx = (p[i][1] - lon) * kx, by = (p[i][0] - lat) * ky, dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
                const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0, x = ax + t * dx, y = ay + t * dy, d = Math.hypot(x, y);
                if (!best || d < best.d) best = { d: d, lat: lat + y / ky, lon: lon + x / kx }; } });
            return best && best.d <= maxM ? best : (best ? { d: best.d, off: true } : null);
        }
        function osmPolys(m, opt) { const g = L.layerGroup(); osmLines().forEach(l => L.polyline(l.pts, Object.assign({ interactive: false, color: l.main ? '#f59e0b' : '#38bdf8', weight: l.main ? 3.5 : 2.2, opacity: .9 }, opt || {})).addTo(g));
            OSM_RAIL.s.forEach(s => L.circleMarker([s[1], s[2]], { radius: 5, color: '#fbbf24', weight: 2, fillColor: '#0f172a', fillOpacity: 1, interactive: false }).bindTooltip(s[0], { permanent: true, direction: 'top', className: 'osm-st' }).addTo(g)); return g; }
        function osmToggle(force) {
            const m = GD.map; if (!m) return; OSM.on = force !== undefined ? !!force : !OSM.on;
            if (OSM.on) { if (!OSM.tile) OSM.tile = L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 19, maxNativeZoom: 19, attribution: '© OpenStreetMap hissadorlari' });
                if (!OSM.gd) OSM.gd = osmPolys(m); OSM.tile.addTo(m); OSM.tile.bringToBack(); OSM.gd.addTo(m); try { m.getPane('gdBase').style.opacity = .35; } catch (e) {} }
            else { if (OSM.tile) m.removeLayer(OSM.tile); if (OSM.gd) m.removeLayer(OSM.gd); try { m.getPane('gdBase').style.opacity = ''; } catch (e) {} }
            const b = $id('osmBtn'); if (b) { b.classList.toggle('on', OSM.on); b.textContent = OSM.on ? '🛤 Haqiqiy yoʻllar ✓' : '🛤 Haqiqiy yoʻllar (OSM)'; }
        }
        if (typeof gdOpen === 'function') gdOpen = agmkExtend('gdOpen', 'v3.6.2: OSM qatlami tugmasi', gdOpen, o => async function () {
            const r = await o.apply(this, arguments);
            try { if (GD.map && !GD.osmCtl) { const C = L.Control.extend({ options: { position: 'topright' }, onAdd: () => { const b = L.DomUtil.create('button', 'osm-btn'); b.id = 'osmBtn'; b.textContent = '🛤 Haqiqiy yoʻllar (OSM)'; b.title = 'OpenStreetMap: haqiqiy temir yoʻllar (GPS bilan aniq mos)'; L.DomEvent.disableClickPropagation(b); b.onclick = () => osmToggle(); return b; } });
                GD.osmCtl = new C().addTo(GD.map); } } catch (e) { console.error(e); }
            return r;
        });
        if (typeof nvOpen === 'function') nvOpen = agmkExtend('nvOpen', 'v3.6.2: navigatorda temir yoʻllar', nvOpen, o => async function () {
            const r = await o.apply(this, arguments);
            try { if (NV.map && !NV.osm) { NV.map.createPane('nvRail').style.zIndex = 350; NV.osm = osmPolys(NV.map, { pane: 'nvRail', color: '#64748b', weight: 2, opacity: .7, dashArray: '6 4' }); NV.osm.eachLayer(x => { if (x instanceof L.CircleMarker) NV.osm.removeLayer(x); }); NV.osm.addTo(NV.map); } } catch (e) { console.error(e); }
            return r;
        });
        // GPS nuqtasi — rels transporti uchun eng yaqin haqiqiy yoʻlga (≤25 m) yopishtiriladi
        if (typeof msPosSend === 'function') msPosSend = agmkExtend('msPosSend', 'v3.6.2: GPS → eng yaqin yoʻl', msPosSend, o => function () {
            const sm = typeof mySmena === 'function' && mySmena(), u = sm && msUnit(sm.unitId), f = MS.fix;
            if (!f || !u || u.kind === 'avto') return o.apply(this, arguments);
            const s = osmSnap(f.lat, f.lon, Math.max(25, (f.acc || 0) * 0.8)); if (!s || s.off) { MS.offRail = s ? Math.round(s.d) : null; return o.apply(this, arguments); }
            MS.offRail = null; MS.fix = Object.assign({}, f, { lat: s.lat, lon: s.lon, raw: [f.lat, f.lon] });
            try { return o.apply(this, arguments); } finally { MS.fix = f; }
        });

        // ---------- 5. Nosozlik: sputnik va navigator ----------
        function nsLL(n) {
            const p = n.tabel && MS.pos ? MS.pos.find(x => x.tabel === n.tabel) : null; if (p) return [p.lat, p.lon]; if (n.gps) return [n.gps.lat, n.gps.lon];
            if (n.xy && typeof ygToLL === 'function' && typeof L !== 'undefined') { const ll = ygToLL(n.xy[0], n.xy[1]); return [ll.lat, ll.lng]; } return null;
        }
        async function nsSat(id) { const n = nsGet(id), g = n && nsLL(n); if (!g) { showToast('📍 Joylashuv maʼlumoti yoʻq'); return; }
            mdl('nsSatM', `<div class="px-h"><b>🛰 Sputnik surati — ${escapeHtml(n.unitName || '')}</b><button class="mini-btn" onclick="mdlClose('nsSatM')">✕</button></div><div id="nsSatMap" style="height:60vh;border-radius:12px;overflow:hidden"></div><div class="nd-tip" style="font-size:11px">${g[0].toFixed(5)}, ${g[1].toFixed(5)} · Koordinata tashqariga yuborilmaydi — faqat xarita plitkalari yuklanadi.</div>`, true);
            try { await loadLeaflet(); } catch (e) { return; }
            setTimeout(() => { const el = $id('nsSatMap'); if (!el) return; if (el._m) el._m.remove(); const m = el._m = L.map(el, { attributionControl: true }).setView(g, 18); m.attributionControl.setPrefix(false);
                L.tileLayer('agmk-tile://esri/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri, Maxar' }).addTo(m);
                osmPolys(m, { color: '#38bdf8', weight: 2, opacity: .8 }).addTo(m);
                L.circleMarker(g, { radius: 11, color: n.lvl === 'j' ? '#ef4444' : n.lvl === 'o' ? '#f59e0b' : '#22c55e', weight: 4, fillOpacity: .25 }).addTo(m); }, 80);
        }
        function nsNav(id) { const n = nsGet(id), g = n && nsLL(n); if (!g) { showToast('📍 Joylashuv maʼlumoti yoʻq'); return; }
            const q = g[0].toFixed(6) + ',' + g[1].toFixed(6); location.href = 'geo:' + q + '?q=' + q + '(' + encodeURIComponent((n.unitName || 'Nosozlik') + ' — ' + (n.name || '')) + ')'; }
        if (typeof nsDetail === 'function') nsDetail = agmkExtend('nsDetail', 'v3.6.2: sputnik va navigator', nsDetail, o => function (id) {
            const r = o.apply(this, arguments);
            try { const n = nsGet(id), a = document.querySelector('#nsModal .ns-acts'); if (n && a && !a.querySelector('.ns-sat')) { const ok = !!nsLL(n);
                a.insertAdjacentHTML('beforeend', `<button class="ns-sat" onclick="nsSat('${id}')"${ok ? '' : ' disabled'}>🛰 Sputnikda koʻrish</button><button class="ns-nav" onclick="nsNav('${id}')"${ok ? '' : ' disabled'}>🧭 Navigatorda ochish</button>`); } } catch (e) { console.error(e); }
            return r;
        });

        // ---------- 6. Vagon turlari tugmalari — haqiqiy rasm bilan ----------
        function vgImgUrl(k) { const m = VIMG_CSS.match(new RegExp('\\.vgi-' + k + '\\{background-image:url\\(([^)]+)\\)')); return m ? m[1] : ''; }
        if (typeof tvSvg === 'function') tvSvg = agmkExtend('tvSvg', 'v3.6.2: tur tugmasida haqiqiy rasm', tvSvg, o => function (t) {
            const k = vgImgKey({ type: t }), u = k && vgImgUrl(k); if (!u) return o.apply(this, arguments);
            const name = (typeof TV_LBL !== 'undefined' && TV_LBL[t]) || t, fs = name.length > 12 ? 8.2 : 9.2, pw = Math.min(112, name.length * fs * 0.58 + 12);
            return `<svg viewBox="0 0 120 57" aria-hidden="true"><image href="${u}" x="1" y="4" width="118" height="52" preserveAspectRatio="xMidYMax meet"/>`
                + `<rect x="${(60 - pw / 2).toFixed(1)}" y="${(16 - fs + 0.5).toFixed(1)}" width="${pw.toFixed(1)}" height="${fs + 4}" rx="${(fs + 4) / 2}" fill="rgba(0,0,0,.55)"/>`
                + `<text x="60" y="17.5" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#fff" font-family="Roboto,Segoe UI,Arial,sans-serif">${escapeHtml(name)}</text></svg>`;
        });
        // ---------- 6b. Boshqa texnikalar ham haqiqiy rasm bilan (v3.6.3, 32) ----------
        // Faqat belgi (ikonka): tur tugmasi, roʻyxat kartasi va pasport boshi. Pasport fotogalereyasiga qoʻshilmaydi.
        var TECH_IMG = {
            lok: { 'ЕЛ-1': 'lok-el', '2ТЭ116': 'lok-2te', 'ТЭМ2': 'lok-tem', 'ТЭМ2У': 'lok-tem', 'ТЭМ2УМ': 'lok-tem', 'ТЭМ-18': 'lok-tem', 'ТЭМ-18ДМ': 'lok-tem' },
            avto: { 'Frontal yuklagichlar': 'av-fr', 'Vilkali yuklagichlar': 'av-vil', 'Buldozer va ekskavator': 'av-ex', 'Traktorlar': 'av-tr', 'Tirkamalar': 'av-tirk', 'Yuk avtomobillari': 'av-yuk', 'Avtobus va vaxtovkalar': 'av-bus', 'Yengil avtomobillar': 'av-car', 'Maxsus texnika': 'av-vysh' },
            yol: { 'Motovozlar': 'yol-mot', 'Yotqizuvchi kranlar': 'yol-uk' }
        };
        var TECH_LBL = { 'Frontal yuklagichlar': 'Frontal yuklagich', 'Vilkali yuklagichlar': 'Vilkali yuklagich', 'Buldozer va ekskavator': 'Buldozer/ekskavator', 'Traktorlar': 'Traktor', 'Tirkamalar': 'Tirkama', 'Yuk avtomobillari': 'Yuk avtomobili', 'Avtobus va vaxtovkalar': 'Avtobus/vaxtovka', 'Yengil avtomobillar': 'Yengil avtomobil', 'Motovozlar': 'Motovoz', 'Yotqizuvchi kranlar': 'Yotqizuvchi kran' };
        function techKind(v) { if (!v) return ''; if (v.kind === 'avto' || v.kind === 'yol') return v.kind; return (typeof isLok === 'function' && isLok(v)) ? 'lok' : (v.kind || ''); }
        function techImgKey(kind, v) {
            const map = TECH_IMG[kind]; if (!map) return null; const t = String(v.type || '');
            if (kind === 'avto') { const all = [v.model, v.naim].join(' ');
                if (/автокран/i.test(all)) return 'av-kran'; if (/автовышк|вышка/i.test(all)) return 'av-vysh'; if (/экскаватор/i.test(all)) return 'av-ex'; if (/сварочн/i.test(all)) return null; }
            if (kind === 'lok' && !map[t] && /^ТЭМ/.test(t)) return 'lok-tem';
            return map[t] || null;
        }
        if (typeof vgImgKey === 'function') vgImgKey = agmkExtend('vgImgKey', 'v3.6.3: yopiq vagon va boshqa texnikalar rasmi', vgImgKey, o => function (v) {
            if (!v) return null; const k = techKind(v);
            if (k === 'lok' || k === 'avto' || k === 'yol') return techImgKey(k, v);
            if (v.kind) return null;
            if (/yopiq|крыт/i.test(String(v.type || ''))) return 'box';
            return o.apply(this, arguments);
        });
        function techTabSvg(name, k) {
            const u = vgImgUrl(k); if (!u) return '';
            const fs = name.length > 12 ? 8.2 : 9.2, pw = Math.min(114, name.length * fs * 0.58 + 12);
            return `<svg viewBox="0 0 120 57" aria-hidden="true"><image href="${u}" x="1" y="4" width="118" height="52" preserveAspectRatio="xMidYMax meet"/>`
                + `<rect x="${(60 - pw / 2).toFixed(1)}" y="${(16 - fs + 0.5).toFixed(1)}" width="${pw.toFixed(1)}" height="${fs + 4}" rx="${(fs + 4) / 2}" fill="rgba(0,0,0,.55)"/>`
                + `<text x="60" y="17.5" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#fff" font-family="Roboto,Segoe UI,Arial,sans-serif">${escapeHtml(name)}</text></svg>`;
        }
        (function () { const st = document.createElement('style'); st.textContent = `
#lokTabs,#avtoTabs,#yolTabs{align-items:stretch}
#lokTabs .tab,#avtoTabs .tab,#yolTabs .tab{display:flex;align-items:center}
#lokTabs .tab.tvt,#avtoTabs .tab.tvt,#yolTabs .tab.tvt{position:relative;flex:0 0 auto;justify-content:center;padding:3px 8px 2px;border-radius:14px}
#lokTabs .tab.tvt svg,#avtoTabs .tab.tvt svg,#yolTabs .tab.tvt svg{width:118px;height:56px;display:block}
#lokTabs .tab.tvt .tab-cnt,#avtoTabs .tab.tvt .tab-cnt,#yolTabs .tab.tvt .tab-cnt{position:absolute;top:3px;right:5px;margin:0;opacity:1;font-size:10.5px;font-weight:700;line-height:15px;padding:0 6px;border-radius:8px;background:rgba(15,23,42,.8);color:#e2e8f0}
#lokTabs .tab.tvt.active,#avtoTabs .tab.tvt.active,#yolTabs .tab.tvt.active{box-shadow:0 0 0 2px #38bdf8 inset}
@media (min-width:720px){#lokTabs .tab.tvt svg,#avtoTabs .tab.tvt svg,#yolTabs .tab.tvt svg{width:168px;height:80px}}
@media (min-width:1100px){#lokTabs .tab.tvt svg,#avtoTabs .tab.tvt svg,#yolTabs .tab.tvt svg{width:196px;height:93px}}`; document.head.appendChild(st); })();
        function techDecorate(kind, tabsId, listId, fnName) {
            try {
                const tabs = $id(tabsId);
                if (tabs) tabs.querySelectorAll('.tab').forEach(el => {
                    const m = /\('((?:[^'\\]|\\.)*)'\)/.exec(el.getAttribute('onclick') || ''); if (!m) return;
                    const t = m[1].replace(/\\'/g, "'"); if (t === 'Barchasi') return;
                    const k = techImgKey(kind, { type: t }); const svg = k && techTabSvg(TECH_LBL[t] || t, k); if (!svg) return;
                    const c = el.querySelector('.tab-cnt'); el.classList.add('tvt'); el.title = t;
                    el.innerHTML = svg + (c ? c.outerHTML : '');
                });
                const list = $id(listId);
                if (list) list.querySelectorAll('.vagon-card').forEach(card => {
                    if (card.querySelector('.vg-thumb')) return;
                    const b = card.querySelector('[onclick^="openPassport("]'); const id = b && +((/openPassport\((\d+)\)/.exec(b.getAttribute('onclick')) || [])[1]);
                    const v = id && vagonlarData.find(x => x.id === id); const k = v && vgImgKey(v); const info = card.querySelector('.vagon-info');
                    if (!k || !info) return;
                    const d = document.createElement('div'); d.className = 'vgi vg-thumb vgi-' + k; d.setAttribute('role', 'img'); d.setAttribute('aria-label', v.type || '');
                    info.parentNode.insertBefore(d, info);
                });
            } catch (e) { console.error(fnName, e); }
        }
        if (typeof renderLok === 'function') renderLok = agmkExtend('renderLok', 'v3.6.3: lokomotiv rasmlari', renderLok, o => function () { const r = o.apply(this, arguments); techDecorate('lok', 'lokTabs', 'lokList', 'renderLok'); return r; });
        if (typeof renderAvto === 'function') renderAvto = agmkExtend('renderAvto', 'v3.6.3: avtotraktor rasmlari', renderAvto, o => function () { const r = o.apply(this, arguments); techDecorate('avto', 'avtoTabs', 'avtoList', 'renderAvto'); return r; });
        if (typeof renderYol === 'function') renderYol = agmkExtend('renderYol', 'v3.6.3: yoʻl texnikasi rasmlari', renderYol, o => function () { const r = o.apply(this, arguments); techDecorate('yol', 'yolTabs', 'yolList', 'renderYol'); return r; });


