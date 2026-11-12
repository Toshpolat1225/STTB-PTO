        // =====================================================================
        // v2.0 — TEXNIKALAR GPS KUZATUVI: poydevor (keyinchalik rivojlantirish uchun)
        //  • qurilmalar ro'yxati (GPS-treker ↔ texnika), serverdan so'nggi joylashuv / trek
        //  • fayldan import: GPX, CSV (qurilma, kenglik, uzunlik, vaqt, tezlik), JSON (server formati)
        //  • yig'ma sxemada (GPS bilan bog'langan bo'lsa) marker va iz; bog'lanmagan bo'lsa — ro'yxat
        // =====================================================================
        var GPS_DEV_KEY = 'agmk_gps_dev';
        var GPS = { pts: {}, last: {}, lay: null, on: false, timer: 0 };
        function gpsDevs() { return kvGet(GPS_DEV_KEY, []); }
        function gpsDevName(id) { const d = gpsDevs().find(x => x.id === id); return d ? d.name : id; }
        function gpsAddPts(list, src) {
            let n = 0; (list || []).forEach(p => { const dev = String(p.device || p.dev || p.id || 'nomaʼlum'), lat = +p.lat, lon = +(p.lon !== undefined ? p.lon : p.lng), t = typeof p.t === 'number' ? p.t : Date.parse(p.t || p.time || ''); if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
                const a = GPS.pts[dev] = GPS.pts[dev] || []; a.push({ lat: lat, lon: lon, t: isFinite(t) ? t : Date.now(), v: p.speed !== undefined ? +p.speed : null, src: src }); n++; });
            Object.keys(GPS.pts).forEach(k => { GPS.pts[k].sort((a, b) => a.t - b.t); if (GPS.pts[k].length > 20000) GPS.pts[k] = GPS.pts[k].slice(-20000); GPS.last[k] = GPS.pts[k][GPS.pts[k].length - 1]; });
            return n;
        }
        function gpsParseFile(name, text) {
            const n = String(name).toLowerCase();
            if (/\.gpx$/.test(n) || /<gpx/i.test(text)) { const d = new DOMParser().parseFromString(text, 'application/xml'), dev = (d.querySelector('trk > name, metadata > name') || {}).textContent || name.replace(/\.[^.]+$/, ''); return Array.from(d.getElementsByTagName('trkpt')).concat(Array.from(d.getElementsByTagName('wpt'))).map(p => ({ device: dev, lat: p.getAttribute('lat'), lon: p.getAttribute('lon'), t: (p.getElementsByTagName('time')[0] || {}).textContent })); }
            if (/\.json$/.test(n) || /^\s*[\[{]/.test(text)) { const j = JSON.parse(text); return Array.isArray(j) ? j : (j.points || j.data || []); }
            const lines = text.split(/\r?\n/).filter(Boolean), sep = lines[0].includes(';') ? ';' : ',', h = lines[0].toLowerCase().split(sep).map(s => s.trim());
            const ix = k => h.findIndex(x => k.test(x)), iD = ix(/dev|qurilma|device|imei|id/), iLa = ix(/^lat|kenglik|широт/), iLo = ix(/^lon|lng|uzunlik|долгот/), iT = ix(/time|vaqt|sana|дата|время/), iV = ix(/speed|tezlik|скорост/);
            if (iLa < 0 || iLo < 0) throw new Error("CSV sarlavhasida lat va lon ustunlari topilmadi");
            return lines.slice(1).map(l => { const c = l.split(sep); return { device: iD >= 0 ? c[iD] : name, lat: c[iLa], lon: c[iLo], t: iT >= 0 ? c[iT] : '', speed: iV >= 0 ? c[iV] : undefined }; });
        }
        async function gpsImport(input) {
            const fs = Array.from(input.files || []); input.value = ''; let n = 0;
            for (const f of fs) { try { n += gpsAddPts(gpsParseFile(f.name, await f.text()), 'fayl'); } catch (e) { alert('⚠️ ' + f.name + ': ' + agmkErrUz(e)); } }
            showToast('📍 ' + n + ' ta nuqta yuklandi'); gpsDraw(); gpsOpen();
        }
        async function gpsFetch() {
            const c = syncCfg(); if (!c.on || !c.lan) return false;
            try { const r = await sbFetch('/api/gps/v1/last'); const l = Array.isArray(r) ? r : (r && (r.points || r.data)) || []; gpsAddPts(l, 'server'); gpsDraw(); return true; } catch (e) { return false; }
        }
        function gpsToggle(on) { GPS.on = on === undefined ? !GPS.on : on; clearInterval(GPS.timer); if (GPS.on) { gpsFetch(); GPS.timer = setInterval(gpsFetch, 30000); } gpsDraw(); try { renderLayerPanel(); } catch (e) {} }
        function gpsDraw() {
            try { if (!YG.map || !window.L) return; if (GPS.lay) { YG.map.removeLayer(GPS.lay); GPS.lay = null; } if (!GPS.on || !ygIsCal()) return;
                GPS.lay = L.layerGroup(); const now = Date.now();
                Object.keys(GPS.pts).forEach((dev, k) => { const a = GPS.pts[dev].filter(p => now - p.t < 3 * 3600e3), last = GPS.last[dev]; const col = ['#22d3ee', '#f472b6', '#a3e635', '#fb923c', '#c084fc', '#facc15'][k % 6];
                    if (a.length > 1) L.polyline(a.map(p => [p.lat, p.lon]), { color: col, weight: 3, opacity: 0.8 }).addTo(GPS.lay);
                    if (last) L.circleMarker([last.lat, last.lon], { radius: 8, color: '#fff', weight: 2, fillColor: col, fillOpacity: 1 }).bindTooltip('🚚 ' + gpsDevName(dev) + ' · ' + new Date(last.t).toLocaleTimeString().slice(0, 5) + (last.v !== null && isFinite(last.v) ? ' · ' + Math.round(last.v) + ' km/s' : ''), { permanent: true, direction: 'right', className: 'gps-lbl' }).addTo(GPS.lay); });
                GPS.lay.addTo(YG.map); } catch (e) { console.error(e); }
        }
        function gpsOpen() {
            const E = escapeHtml, devs = gpsDevs(), ids = Array.from(new Set(Object.keys(GPS.pts).concat(devs.map(d => d.id)))), c = syncCfg();
            mdl('gpsModal', `<div class="px-h"><b>🚚 Texnikalar GPS kuzatuvi</b><button class="mini-btn" onclick="mdlClose('gpsModal')">✕</button></div>
                <div class="nd-tip">Poydevor: GPS-trekerlar korxona serveriga maʼlumot yuboradi (server hujjatida format bor) — ilova soʻnggi joylashuv va 3 soatlik izni yigʻma sxemada koʻrsatadi. ${ygIsCal() ? '' : '⚠️ Xaritada koʻrsatish uchun avval sxemani GPS bilan bogʻlang (admin).'}</div>
                <div class="pk-btns"><button onclick="gpsToggle(); gpsOpen()">${GPS.on ? '⏸ Kuzatuvni toʻxtatish' : '▶️ Xaritada koʻrsatish'}</button><label class="srv-qr">📂 Fayldan (GPX/CSV/JSON)<input type="file" multiple accept=".gpx,.csv,.json,.txt" onchange="gpsImport(this)"></label>${c.lan ? `<button onclick="gpsFetch().then(ok=>{showToast(ok?'✅ Serverdan olindi':'⚠️ Serverdan olinmadi'); gpsOpen();})">🔄 Serverdan</button>` : ''}</div>
                <div class="ops-list">${ids.length ? ids.map(id => { const l = GPS.last[id], d = devs.find(x => x.id === id); return `<div class="ops-it"><span class="ops-ic">🚚</span><div class="ops-t"><b>${E(d ? d.name : id)}</b><small>${l ? '📍 ' + l.lat.toFixed(5) + ', ' + l.lon.toFixed(5) + ' · 🕒 ' + E(new Date(l.t).toLocaleString()) : 'Maʼlumot yoʻq'}${d && d.veh ? ' · ' + E(d.veh) : ''}</small></div>${isAdmin() ? `<button onclick="gpsDevEdit('${E(id)}')">✏️</button>` : ''}</div>`; }).join('') : '<div class="xt-empty">Hali qurilma yoʻq.</div>'}</div>
                ${isAdmin() ? `<button class="mini-btn" style="margin-top:8px" onclick="gpsDevEdit('')">＋ Qurilma qoʻshish (treker ID → texnika)</button>` : ''}`);
        }
        async function gpsDevEdit(id) {
            if (!isAdmin()) return; const L = gpsDevs(), d = L.find(x => x.id === id) || { id: '', name: '', veh: '' };
            const nid = id || await uiPrompt('Treker (qurilma) ID si:', ''); if (!nid) return;
            const name = await uiPrompt('Texnika nomi (masalan: «Avtodrezina ADM-1 №12»):', d.name || ''); if (name === null) return;
            const i = L.findIndex(x => x.id === nid); const rec = { id: String(nid).trim(), name: name.trim() || nid, veh: d.veh || '', at: new Date().toISOString() }; if (i >= 0) L[i] = rec; else L.push(rec);
            kvSet(GPS_DEV_KEY, L); gpsOpen(); gpsDraw();
        }
        (function () {
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(GPS_DEV_KEY)) KV_SYNC.keys.push(GPS_DEV_KEY); } catch (e) {}
            // Yig'ma sxema qatlamlar panelida
            if (typeof ygPanelHtml === 'function') { ygPanelHtml = agmkExtend('ygPanelHtml', 'Yigʼma sxema qatlamlar panelida', ygPanelHtml, o => function () { return o.apply(this, arguments) + `<div class="yg-adm"><button onclick="gpsOpen()">🚚 Texnikalar GPS ${GPS.on ? '(yoniq)' : ''}</button></div>`; }); }
            if (typeof ygReplace === 'function') { ygReplace = agmkExtend('ygReplace', 'Yigʼma sxema qatlamlar panelida', ygReplace, o2 => function () { const r = o2.apply(this, arguments); gpsDraw(); return r; }); }
            aiStage('GPS kuzatuvi', function (q, next) { try { const s = String(q || '').toLowerCase(); if (/(gps|treker|texnika\w* qayerda|mashina\w* qayerda|drezina\w* qayerda)/.test(s)) { setTimeout(() => { try { if (typeof aicClose === 'function') aicClose(); } catch (e) {} gpsOpen(); }, 500); const n = Object.keys(GPS.last).length; return { t: '🚚 GPS kuzatuvi: ' + (n ? n + ' ta qurilmaning soʻnggi joylashuvi bor.' : 'hali maʼlumot yoʻq — trekerlar korxona serveriga ulangach koʻrinadi.'), personal: true }; } } catch (e) {} return next(q); });
        })();

