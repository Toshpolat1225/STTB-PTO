        // =====================================================================
        // v3.10.2 — jonli xarita
        //  1) Xarita turi: Sxema / Sputnik / Gibrid (v3102.js)  2) Belgi — texnikaning oʻzi: pasportdagi asosiy rasm, «Hilux · 10-584SAA», ostida F.I.Sh.
        //  3) Yozuvlar ustma-ust tushmaydi («+N», bosilsa yoyiladi)  4) Joy nomi — korxona serveridagi manzillar bazasidan (internetsiz)
        //  5) Boʻlim almashganda xarita tozalanadi  6) Temir yoʻl demosi — jonli xaritada, OSM izlari boʻylab
        //  7) GPS kuzatuvi — faqat haqiqiy xarita (OSM): sxema bogʻlash va eski «Harakat tarkibi · GPS» ekrani kuzatuvdan olib tashlandi
        // =====================================================================
        // ---------------- 2) Texnika: qisqa nomi, raqami, rasmi ----------------
        var LVV = { th: {}, busy: {} };
        var LV_BRANDS = /^(toyota|chevrolet|daewoo|isuzu|hyundai|kia|mercedes(-benz)?|volvo|man|nissan|lada|ваз|газ|уаз|shacman|howo|sinotruk|faw|jac|foton|ford|volkswagen|mitsubishi|caterpillar|cat|komatsu|liebherr|hitachi|xcmg|sany|shantui|jcb|belaz|белаз|маз|камаз)$/i;
        function lvUnitOf(p) { try { return msUnit(+p.uid) || msUnit(p.uid) || null; } catch (e) { return null; } }
        function lvShort(u, unit) {
            if (!u) { const s = String(unit || '').replace(/\s*\(.*$/, '').trim(); return s.split(/\s+/).slice(-1)[0] || s || 'Texnika'; }
            if (u.kind === 'avto') { let w = String(u.naim || u.model || u.type || '').trim().split(/\s+/).filter(Boolean);
                if (w.length > 1 && /^[А-ЯЁA-Z][а-яёa-z]{3,}$/.test(w[0]) && !LV_BRANDS.test(w[0])) w = w.slice(1); // «Пикап», «Автомобиль», «Погрузчик»…
                if (w.length > 1 && LV_BRANDS.test(w[0]) && !/^\d/.test(w[1])) w = w.slice(1); // «Toyota Hilux» → «Hilux», «КамАЗ 55111» — oʻzgarmaydi
                return w.join(' ').slice(0, 22) || 'Avto'; }
            if (u.kind === 'yol') return String(u.naim || u.type || 'Yoʻl texnikasi').split(/\s+/).slice(0, 2).join(' ').slice(0, 22);
            return String(u.type || 'Lokomotiv').slice(0, 18);
        }
        function lvPlate(u) { if (!u) return ''; if (u.kind === 'avto') return String(u.gos || u.num || '').trim(); if (u.kind === 'yol') return u.zav ? '№' + u.zav : '№' + vagonNo(u); return '№' + vagonNo(u); }
        function lvTitle(p) { const u = lvUnitOf(p), s = lvShort(u, p.unit), n = lvPlate(u); return n ? s + ' · ' + n : s; }
        function lvWho(p) { const parts = String(p.name || '').trim().split(/\s+/); const sh = parts.length > 1 ? parts[0] + ' ' + parts[1] : parts[0] || ''; return (p.self ? 'Siz — ' : '') + sh; }
        function lvKindIc(u, p) { const k = (u && u.kind) || p.kind; if (k === 'lok') return '🚂'; if (k === 'yol') return '🛤️'; const t = String((u && (u.type + ' ' + u.naim)) || p.unit || '').toLowerCase();
            return /автобус|avtobus|вахтов/.test(t) ? '🚌' : /трактор|traktor/.test(t) ? '🚜' : /самосвал|kamaz|камаз|грузов|yuk/.test(t) ? '🚚' : /погруз|экскав|бульдоз|yuklagich|ekskav|кран/.test(t) ? '🏗️' : /пикап|легков|nexia|damas|cobalt|spark|lacetti|hilux|yengil/.test(t) ? '🚙' : '🚗'; }
        function lvMainImg(u) { try { const G = (u && u.gallery) || []; const g = G.find(x => x && x.main) || G[0]; const s = g && (g.src || g.url); return s && /^(data:image|blob:|https?:)/.test(s) ? s : null; } catch (e) { return null; } }
        function lvThumb(u) {
            if (!u) return null; const k = String(u.id); if (k in LVV.th) return LVV.th[k]; const src = lvMainImg(u); if (!src) { LVV.th[k] = null; return null; } if (LVV.busy[k]) return null; LVV.busy[k] = 1;
            const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'), S = 96; c.width = c.height = S; const g = c.getContext('2d'), m = Math.min(im.naturalWidth, im.naturalHeight); g.drawImage(im, (im.naturalWidth - m) / 2, (im.naturalHeight - m) / 2, m, m, 0, 0, S, S); LVV.th[k] = c.toDataURL('image/jpeg', 0.8); } catch (e) { LVV.th[k] = null; } delete LVV.busy[k]; try { lvDraw(); } catch (e) {} };
            im.onerror = () => { LVV.th[k] = null; delete LVV.busy[k]; }; im.src = src; return null;
        }
        function lvAvHtml(p, big) { const u = lvUnitOf(p), th = lvThumb(u); return `<span class="lv-vav${big ? ' big' : ''}">${th ? `<img src="${th}" alt="">` : `<i>${lvKindIc(u, p)}</i>`}</span>`; }
        lvIconHtml = function (p) {
            const E = escapeHtml, st = lvSt(p), arr = p.brg != null && st === 'mov' ? `<b class="lv-arr" style="transform:rotate(${+p.brg}deg)">▲</b>` : '';
            return `<div class="lv-vm ${st}${LV2.sel === p.tabel ? ' sel' : ''}${p.self ? ' self' : ''}${p.demo ? ' demo' : ''}" onclick="lvCard('${E(p.tabel)}')">${arr}${lvAvHtml(p)}<div class="lv-vl"><b>${E(lvTitle(p))}${st === 'mov' && p.spd != null ? ' · ' + Math.round(p.spd) + ' km/soat' : ''}</b><small>${E(lvWho(p))}${p.bat != null && p.bat <= 20 && !p.chg ? ' · 🔋' + p.bat + '%' : ''}</small></div></div>`;
        };
        // ---------------- 3) Ustma-ust tushmasin: yozuv oʻlchami boʻyicha guruhlash ----------------
        lvDraw = function () {
            const m = LV.map; if (!m || !LV.lay) return; const P = LV2.P || [], B = [], z = m.getZoom(), seen = {};
            const pts = P.map(p => ({ p: p, ll: lvSnapP(p) })); pts.forEach(x => { x.px = m.latLngToContainerPoint(x.ll); B.push(x.ll); });
            const groups = []; pts.forEach(x => { if (x.p.tabel === LV2.sel || x.p.self && z >= 17) { groups.push({ px: x.px, m: [x], fix: 1 }); return; }
                const g = groups.find(g => !g.fix && Math.abs(g.px.x - x.px.x) < 150 && Math.abs(g.px.y - x.px.y) < 64); if (g) g.m.push(x); else groups.push({ px: x.px, m: [x] }); });
            LV2.cl.clearLayers();
            groups.forEach(g => { if (g.m.length < 2) return; const ll = [g.m.reduce((s, x) => s + x.ll[0], 0) / g.m.length, g.m.reduce((s, x) => s + x.ll[1], 0) / g.m.length], sos = g.m.some(x => x.p.sos), mov = g.m.filter(x => lvSt(x.p) === 'mov').length;
                L.marker(ll, { icon: L.divIcon({ className: 'lv-ic', html: `<div class="lv-cl${sos ? ' sos' : ''}">+${g.m.length}${mov ? `<i>🟢${mov}</i>` : ''}</div>`, iconSize: [0, 0] }), zIndexOffset: 800 }).on('click', () => lvSpread(g.m.map(x => x.p.tabel), g.m.map(x => x.ll))).addTo(LV2.cl); g.m.forEach(x => { x.hide = 1; }); });
            pts.forEach(x => { const t = x.p.tabel; seen[t] = 1; let mk = LV2.mk[t];
                if (x.hide) { if (mk) { LV.lay.removeLayer(mk); delete LV2.mk[t]; } return; }
                const ic = L.divIcon({ className: 'lv-ic', html: lvIconHtml(x.p), iconSize: [0, 0] });
                if (!mk) { mk = LV2.mk[t] = L.marker(x.ll, { icon: ic, zIndexOffset: x.p.sos ? 1000 : x.p.self ? 900 : 500 }).addTo(LV.lay); } else { mk.setIcon(ic); lvAnim(mk, x.ll); } });
            Object.keys(LV2.mk).forEach(t => { if (!seen[t]) { LV.lay.removeLayer(LV2.mk[t]); delete LV2.mk[t]; } });
            if (LV2.fit && B.length) { LV2.fit = false; try { B.length === 1 ? m.setView(B[0], 15) : m.fitBounds(B, { padding: [60, 60], maxZoom: 16 }); } catch (e) {} }
        };
        // «+N» bosilsa: yaqinlashtiriladi; juda yaqin turgan boʻlsa — roʻyxatdan tanlanadi
        function lvSpread(T, LL) {
            const m = LV.map; let sp = 0; try { const b = L.latLngBounds(LL); sp = m.distance(b.getSouthWest(), b.getNorthEast()); } catch (e) {}
            if (sp > 40 && m.getZoom() < 18) { try { m.fitBounds(LL, { padding: [90, 90], maxZoom: 19 }); } catch (e) {} return; }
            const E = escapeHtml, P = (LV2.P || []).filter(p => T.includes(p.tabel));
            mdl('lvPick', `<div class="px-h"><b>📍 Bir joyda ${P.length} ta texnika</b><button class="mini-btn" onclick="mdlClose('lvPick')">✕</button></div>` + P.map(p => `<div class="lv-row ${lvSt(p)}" onclick="mdlClose('lvPick'); lvCard('${E(p.tabel)}', false, true)">${lvAvHtml(p)}<div><b>${E(lvTitle(p))}</b><small>${E(lvWho(p))}</small></div><em>${lvSt(p) === 'mov' ? Math.round(p.spd || 0) + ' km/soat' : '⏸'}</em></div>`).join(''), true);
        }
        // Roʻyxat va kartochka: sarlavha — texnika, ostida egasi
        if (typeof lvList === 'function') { const _l = lvList; lvList = function () { const r = _l.apply(this, arguments); try { document.querySelectorAll('#lvList .lv-row').forEach(row => { const t = (/lvCard\('([^']+)'/.exec(row.getAttribute('onclick') || '') || [])[1], p = (LV2.P || []).find(x => x.tabel === t); if (!p) return;
                const av = row.querySelector('.lv-av'); if (av) av.outerHTML = lvAvHtml(p); const b = row.querySelector('div > b'); if (b) b.textContent = lvTitle(p); const sm = row.querySelector('div > small'); if (sm) { const pl = lvPlace(p.lat, p.lon); sm.textContent = lvWho(p) + (pl ? ' · 📍 ' + pl.n : ''); } }); } catch (e) {} return r; }; }
        if (typeof lvCard === 'function') { const _c = lvCard; lvCard = async function (tabel) { const r = await _c.apply(this, arguments); try { const p = (LV2.P || []).find(x => x.tabel === tabel), c = document.querySelector('#lvCard .lv-ch'); if (p && c) {
                const av = c.querySelector('.lv-av'); if (av) av.outerHTML = lvAvHtml(p, true); const b = c.querySelector('b'); if (b) { const demo = b.querySelector('.ns-demo'); b.textContent = lvTitle(p); if (demo || p.demo) b.insertAdjacentHTML('beforeend', ' <em class="ns-demo">DEMO</em>'); }
                const sm = c.querySelector('small'); if (sm) sm.textContent = String(p.name || '') + (p.lav ? ' · ' + p.lav : ''); const tx = [...document.querySelectorAll('#lvCard .lv-kv span')].find(s => /Texnika/.test(s.textContent)); if (tx && tx.nextElementSibling) tx.nextElementSibling.innerHTML = escapeHtml(p.unit || '—') + (p.model ? '<small>' + escapeHtml(p.model) + '</small>' : ''); } } catch (e) {} return r; }; }

        // ---------------- 4) Joy nomi — korxona serveridagi manzillar bazasidan ----------------
        var LVG = { c: {}, q: new Set(), t: null, off: false };
        const lvGk = (la, lo) => (+la).toFixed(4) + ',' + (+lo).toFixed(4);
        async function lvGeoFetch(list) {
            if (LVG.off || !lvSrv()) return; const need = []; (list || []).forEach(x => { const k = lvGk(x[0], x[1]); if (!(k in LVG.c) && !need.some(n => n.k === k)) need.push({ k: k, p: [+(+x[0]).toFixed(5), +(+x[1]).toFixed(5)] }); }); if (!need.length) return;
            for (let i = 0; i < need.length; i += 250) { const part = need.slice(i, i + 250); let R = null;
                try { R = await sbFetch('/api/geo/v1/rev', { method: 'POST', body: { pts: part.map(n => n.p) } }); } catch (e) { if (/404/.test(String(e && e.message || e))) LVG.off = true; return; }
                (R || []).forEach((t, j) => { LVG.c[part[j].k] = t || ''; }); }
            const ks = Object.keys(LVG.c); if (ks.length > 3000) ks.slice(0, 1000).forEach(k => delete LVG.c[k]);
        }
        if (typeof lvPlace === 'function') { const _pl = lvPlace; lvPlace = function (lat, lon) { if (lat == null) return null;
            const own = _pl.apply(this, arguments); if (own && own.z) return own; // administrator belgilagan joy — birinchi
            const t = LVG.c[lvGk(lat, lon)]; if (t) return { n: t, z: false, a: true };
            return own; }; }
        if (typeof lvTick === 'function') { const _t = lvTick; lvTick = async function () { const r = await _t.apply(this, arguments); try { const P = LV2.P || []; const need = P.filter(p => !(lvGk(p.lat, p.lon) in LVG.c)); if (need.length) { await lvGeoFetch(need.map(p => [p.lat, p.lon])); lvList(); if (LV2.sel) lvCard(LV2.sel, true); } } catch (e) {} return r; }; }
        if (typeof lvTrailPts === 'function') { const _tp = lvTrailPts; lvTrailPts = async function () { const A = await _tp.apply(this, arguments); try { await lvGeoFetch(A.length > 600 ? A.filter((x, i) => i % Math.ceil(A.length / 600) === 0 || i === A.length - 1) : A); } catch (e) {} return A; }; }

        // ---------------- 5) Boʻlim almashganda — tozalash ----------------
        if (typeof lvRender === 'function') { const _r = lvRender; lvRender = function () {
            try { if (LVD.on && LVD.park !== lvPark()) { LVD.on = false; LVD.items = []; clearInterval(LVD.t); } LV2.P = []; LV.P = []; LV2.sel = null; } catch (e) {}
            return _r.apply(this, arguments); }; }
        if (typeof mashOpen === 'function') { const _mo = mashOpen; mashOpen = function (tab, park) { try { if (park && LVD.on && LVD.park !== park) { LVD.on = false; LVD.items = []; clearInterval(LVD.t); } } catch (e) {} return _mo.apply(this, arguments); }; }

        // ---------------- 6) Temir yoʻl demosi — jonli xaritada, OSM izlari boʻylab ----------------
        function lvRailRoutes(n) {
            const Ls = osmLines().filter(l => l.pts.length > 1), key = p => p[0].toFixed(5) + ',' + p[1].toFixed(5), adj = new Map();
            Ls.forEach((l, i) => { [0, l.pts.length - 1].forEach(e => { const k = key(l.pts[e]); if (!adj.has(k)) adj.set(k, []); adj.get(k).push({ i: i, rev: e !== 0 }); }); });
            const len = P => { let s = 0; for (let i = 1; i < P.length; i++) s += geoDist(P[i - 1], P[i]); return s; };
            const C0 = [40.85, 69.60], starts = (OSM_RAIL.s || []).map(s => [s[1], s[2]]).filter(s => geoDist(s, C0) < 16000).sort((a, b) => geoDist(a, C0) - geoDist(b, C0)), out = [], used = new Set(); // Olmaliq atrofidagi stansiyalardan
            for (let si = 0; si < starts.length && out.length < n; si++) {
                let best = null, bd = 1e9; Ls.forEach((l, i) => { if (!l.main || used.has(i)) return; l.pts.forEach(p => { const d = geoDist(p, starts[si]); if (d < bd) { bd = d; best = i; } }); }); if (best == null || bd > 1500) continue;
                let R = Ls[best].pts.slice(), seen = new Set([best]); used.add(best);
                for (let step = 0; step < 40 && len(R) < 5000; step++) { const k = key(R[R.length - 1]), nx = (adj.get(k) || []).filter(x => !seen.has(x.i)).sort((a, b) => (Ls[b.i].main ? 1 : 0) - (Ls[a.i].main ? 1 : 0))[0]; if (!nx) break; seen.add(nx.i); used.add(nx.i); const q = Ls[nx.i].pts.slice(); if (nx.rev) q.reverse(); R = R.concat(q.slice(1)); }
                if (len(R) > 1500) out.push(R.map(p => [p[0], p[1]]));
            }
            return out;
        }
        var LV_RDEF = [{ f: v => v.kind === 'lok' && /ТЭМ2/.test(v.type), nm: 'Mashinist-1', kmh: 26 }, { f: v => v.kind === 'lok' && /ТЭМ-18|ТЭМ18/.test(v.type), nm: 'Mashinist-2', kmh: 22 }, { f: v => v.kind === 'lok', nm: 'Mashinist-3', kmh: 24 }, { f: v => v.kind === 'yol' && /drezin/i.test(v.type + v.naim), nm: 'Mashinist-4', kmh: 30 }, { f: v => v.kind === 'yol', nm: 'Mashinist-5', kmh: 18 }];
        lvDemoStart = async function () {
            const park = lvPark(); LVD.park = park; if (park !== 'rail') return lvDemoStartAvto();
            showToast('🧪 Temir yoʻl demo tayyorlanmoqda…'); const routes = lvRailRoutes(LV_RDEF.length), used = new Set(), V = [];
            LV_RDEF.forEach((D, i) => { const R = routes[i]; if (!R) return; const v = vagonlarData.find(x => D.f(x) && !hrInRepair(x) && !used.has(x.id)); if (!v) return; used.add(v.id); const cum = rdCum(R);
                V.push({ i: i, D: { nm: D.nm, kmh: D.kmh }, v: v, route: R, cum: cum, len: cum[cum.length - 1] || 1, f: (i * 0.23) % 1, dir: 1, pause: 0, spd: 0, trail: [] }); });
            if (!V.length) { showToast('Temir yoʻl izlari topilmadi'); return; }
            LVD.clock = Date.now() - 3 * 3600e3; LVD.items = V; for (let s = 0; s < 3 * 3600; s += 30) lvDemoStep(30);
            LVD.on = true; clearInterval(LVD.t); LVD.t = setInterval(() => { if (!$id('lvMap') || MS.tab !== 'live') { clearInterval(LVD.t); return; } lvDemoStep(10); lvDemoPush(); lvDraw(); if (LV2.sel && /^demo/.test(LV2.sel)) lvCard(LV2.sel, true); }, 1000);
            LV2.fit = true; await lvTick(); showToast('🧪 ' + V.length + ' ta temir yoʻl texnikasi jonli xaritada (DEMO)');
        };
        // avtotraktor demosi (v3102) — oʻzgarmagan, faqat parkni eslab qoladi
        async function lvDemoStartAvto() {
            showToast('🧪 Avtotraktor demo tayyorlanmoqda…'); const used = new Set(), V = [], J = [];
            for (let i = 0; i < RD_DEF.length; i++) { const D = RD_DEF[i], v = vagonlarData.find(x => x.kind === 'avto' && D.f(x) && !hrInRepair(x) && !used.has(x.id)); if (!v) continue; used.add(v.id); const a = rdPt(D.h[0]), b = rdPt(D.h[1]); if (a && b) J.push({ i: i, D: D, v: v, a: a, b: b }); }
            const RR = await Promise.all(J.map(j => rdRoute(j.a, j.b).catch(() => null)));
            J.forEach((j, k) => { const route = RR[k] || [[j.a.lat, j.a.lon], [j.b.lat, j.b.lon]], cum = rdCum(route); V.push({ i: j.i, D: j.D, v: j.v, route: route, cum: cum, len: cum[cum.length - 1] || 1, f: (j.i * 0.21) % 1, dir: 1, pause: 0, spd: 0, trail: [] }); });
            LVD.park = 'avto'; LVD.clock = Date.now() - 3 * 3600e3; LVD.items = V; for (let s = 0; s < 3 * 3600; s += 30) lvDemoStep(30);
            LVD.on = true; clearInterval(LVD.t); LVD.t = setInterval(() => { if (!$id('lvMap') || MS.tab !== 'live') { clearInterval(LVD.t); return; } lvDemoStep(10); lvDemoPush(); lvDraw(); if (LV2.sel && /^demo/.test(LV2.sel)) lvCard(LV2.sel, true); }, 1000);
            LV2.fit = true; await lvTick(); showToast('🧪 ' + V.length + ' ta avtotraktor jonli xaritada (DEMO)');
        }
        lvDemoP = function (d) { const u = d.v, rail = u.kind !== 'avto'; return { tabel: 'demo' + d.i, name: d.D.nm, lat: d.pos.lat, lon: d.pos.lon, acc: 6, spd: d.spd, brg: d.brg, unit: hrName(u), uid: String(u.id), kind: u.kind, model: u.type || '', lav: (rail ? 'Mashinist' : 'Haydovchi') + ' · DEMO', bat: 35 + (d.i * 13) % 60, chg: d.i === 2, ago: 2, demo: 1 }; };
        lvDemoPush = function () { if (!LVD.on || LVD.park !== lvPark()) return; LV2.P = (LV2.P || []).filter(p => !p.demo).concat(LVD.items.map(lvDemoP)); LV.P = LV2.P; };
        if (typeof lvData === 'function') { const _ld = lvData; lvData = async function () { const P = (await _ld.apply(this, arguments)).filter(p => !p.demo); return LVD.on && LVD.park === lvPark() ? P.concat(LVD.items.map(lvDemoP)) : P; }; }
        bfStart = async function () { mashOpen('live', 'rail'); setTimeout(() => lvDemoStart(), 400); };
        if (typeof lvList === 'function') { const _l2 = lvList; lvList = function () { const r = _l2.apply(this, arguments); try { const box = $id('lvList'); if (!box) return r;
            box.querySelectorAll('button').forEach(b => { if (/bfStart\(\)|rdStart\(\)/.test(b.getAttribute('onclick') || '')) b.setAttribute('onclick', 'lvDemoStart()'); });
            if (lvPark() === 'rail') { const has = box.querySelector('.lv-demo'); if (LVD.on && LVD.park === 'rail' && !has) box.insertAdjacentHTML('afterbegin', `<div class="lv-demo">🧪 DEMO — taqdimot uchun, haqiqiy maʼlumot emas <button onclick="lvDemoStop()">⏹ Toʻxtatish</button></div>`);
                else if (!LVD.on && !/lvDemoStart/.test(box.innerHTML)) box.insertAdjacentHTML('beforeend', `<div class="ms-b2" style="margin-top:6px"><button onclick="lvDemoStart()">🧪 Temir yoʻl demo</button></div>`); }
            box.querySelectorAll('.lv-demo').forEach((d, i) => { if (i) d.remove(); }); } catch (e) {} return r; }; }

        // ---------------- 7) GPS kuzatuvi — faqat jonli xarita (OSM) ----------------
        function lvOpenAt(park, fn) { mashOpen('live', park); let n = 0; const k = setInterval(() => { if (LV.map && LV.lay && (LV2.P || []).length >= 0 && $id('lvMap')) { clearInterval(k); setTimeout(() => { try { fn(); } catch (e) {} }, 700); } else if (++n > 40) clearInterval(k); }, 150); }
        if (typeof msShow === 'function') msShow = async function (tabel) { const p = (MS.pos || []).find(x => x.tabel === tabel); const park = p ? parkOfKind(p.kind || (lvUnitOf(p) || {}).kind) : 'rail'; lvOpenAt(park, () => lvCard(tabel, false, true)); };
        if (typeof nsGps === 'function') nsGps = async function (id) {
            const n = nsGet(id); if (!n) return; mdlClose('nsModal'); try { await msPosLoad(true); } catch (e) {}
            const p = n.tabel ? (MS.pos || []).find(x => x.tabel === n.tabel) : null; let g = p ? [p.lat, p.lon] : n.gps ? [n.gps.lat, n.gps.lon] : null; if (!g && n.xy && typeof ygToLL === 'function') { try { const ll = ygToLL(n.xy[0], n.xy[1]); if (ll && isFinite(ll.lat)) g = [ll.lat, ll.lng]; } catch (e) {} } if (!g) { showToast('📍 Bu xodimning joylashuvi hozir yoʻq'); return; }
            const park = n.unitId ? parkOfUnit(n.unitId) : 'rail';
            lvOpenAt(park, () => { if (p) { lvCard(p.tabel, false, true); return; } LV.map.setView(g, 17); L.marker(g, { icon: L.divIcon({ className: 'lv-ic', html: '<div class="lv-cl sos">🆘</div>', iconSize: [0, 0] }) }).addTo(LV.trl); });
        };
        if (typeof trkShow === 'function') trkShow = async function (uid, day, title) {
            let Lr = []; try { Lr = await sbFetch('/api/trk/v1?uid=' + encodeURIComponent(uid) + '&day=' + day) || []; } catch (e) { showToast('⚠️ Serverdan olinmadi: ' + agmkErrUz(e)); return; }
            const pts = [].concat(...Lr.map(x => x.pts)).sort((a, b) => a[0] - b[0]); if (pts.length < 2) { showToast('🕘 Bu kunga yoʻl maʼlumoti yoʻq'); return; }
            lvOpenAt(parkOfUnit(uid), () => { LV.trl.clearLayers(); const ll = pts.map(x => [x[1], x[2]]); L.polyline(ll, { color: '#38bdf8', weight: 4, opacity: .9 }).addTo(LV.trl); L.circleMarker(ll[0], { radius: 6, color: '#22c55e', fillOpacity: 1 }).bindTooltip('Boshi').addTo(LV.trl); L.circleMarker(ll[ll.length - 1], { radius: 6, color: '#ef4444', fillOpacity: 1 }).bindTooltip(title || 'Oxiri').addTo(LV.trl); LV.map.fitBounds(ll, { padding: [40, 40] }); showToast('🕘 ' + (title || '') + ' · ' + day + ' · ' + trkKm(pts) + ' km'); });
        };
        // Mashinistlar / Haydovchilar «Smenadagilar»: sxema va eski navigator tugmalari oʻrniga — jonli xarita
        if (typeof mashXodimHtml === 'function') { const _x = mashXodimHtml; mashXodimHtml = function () { return _x.apply(this, arguments).replace(/<button onclick="gdOpen\(\)">[^<]*<\/button>/g, '').replace(/<button onclick="nvOpen\(\)">[^<]*<\/button>/g, ''); }; }
        // Dispetcherlik: «Sxemada jonli harakat» → jonli xarita (temir yoʻl). Sxemaning oʻzi — «Temir yoʻl xaritasi va Stansiyalar» boʻlimida.
        if (typeof renderHrHome === 'function') { const _h = renderHrHome; renderHrHome = function () { const r = _h.apply(this, arguments); try { const el = $id('hrHome'); if (el) el.querySelectorAll('.btn-card').forEach(c => { if (/gdOpen\(\)/.test(c.getAttribute('onclick') || '')) { c.setAttribute('onclick', "mashOpen('live','rail')"); const t = c.querySelector('.btn-text'); if (t) t.innerHTML = 'GPS — jonli xarita<small>Mashinistlar haqiqiy xaritada (OpenStreetMap izlari boʻylab)</small>'; } }); } catch (e) {} return r; }; }

        if (typeof lvMapInit === 'function') { const _mi2 = lvMapInit; lvMapInit = function () { const r = _mi2.apply(this, arguments); try { const m = LV.map; if (m) { m.getPane('tooltipPane').style.zIndex = 450; const f = () => { const el = $id('lvMap'); if (el) el.classList.toggle('lv-far', m.getZoom() < 12); }; m.on('zoomend', f); f(); } } catch (e) {} return r; }; }
        // ---------------- AI ----------------
        if (typeof AI_FAQ !== 'undefined') AI_FAQ.unshift(
            { s: 1, re: /sputnik|gibrid|xarita (turi|ko.rinishi)|sxema (va|yoki) sputnik/, a: () => '🗺 Jonli xarita chap tepasida uchta tugma: «🗺 Sxema» — koʻchalar, mahallalar, uy raqamlari va bino nomlari; «🛰 Sputnik» — haqiqiy koʻrinish, yozuvsiz; «🌍 Gibrid» — sputnik ustida koʻcha va joy nomlari. Tanlovingiz eslab qolinadi.' },
            { s: 1, re: /manzil\w* (qanday|qayerdan|aniqla)|ko.cha nomi|joy nomi/, a: () => '📍 Joy nomi (koʻcha, mahalla, yaqindagi muassasa) korxona serverining oʻzidagi manzillar bazasidan aniqlanadi — OpenStreetMap asosida, internetsiz; joylashuv tashqariga yuborilmaydi. Server boʻlmasa — stansiya, sex va administrator belgilagan joylar boʻyicha.' });

        (function () { const st = document.createElement('style'); st.textContent = `
            .lv-vm{position:relative;transform:translate(-26px,-26px);display:flex;align-items:center;gap:6px;width:max-content;cursor:pointer}
            .lv-vav{position:relative;width:52px;height:52px;border-radius:50%;overflow:hidden;background:#0f172a;border:4px solid #3b82f6;box-shadow:0 3px 10px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
            .lv-vav img{width:100%;height:100%;object-fit:cover}.lv-vav i{font-style:normal;font-size:26px}.lv-vav.big{width:58px;height:58px}
            .lv-vm.mov .lv-vav{border-color:#22c55e}.lv-vm.stop .lv-vav{border-color:#3b82f6}.lv-vm.old .lv-vav{border-color:#94a3b8;filter:grayscale(.7)}.lv-vm.sos .lv-vav{border-color:#ef4444;animation:lvSos 1s infinite}.lv-vm.self .lv-vav{box-shadow:0 0 0 4px rgba(167,139,250,.6),0 3px 10px rgba(0,0,0,.5)}
            .lv-vm.sel .lv-vav{transform:scale(1.15);box-shadow:0 0 0 5px rgba(251,191,36,.55),0 4px 14px rgba(0,0,0,.6)}@keyframes lvSos{50%{box-shadow:0 0 0 8px rgba(239,68,68,.35)}}
            .lv-vl{background:rgba(15,23,42,.93);border:1px solid #334155;border-radius:10px;padding:3px 8px;color:#f1f5f9;line-height:1.25;box-shadow:0 2px 8px rgba(0,0,0,.45);max-width:190px}
            .lv-vl b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lv-vl small{display:block;font-size:11px;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .lv-vm .lv-arr{position:absolute;left:19px;top:-12px;color:#22c55e;font-size:13px;z-index:2;transform-origin:50% 120%}
            .lv-cl i{display:block;font-style:normal;font-size:10px;line-height:10px;margin-top:-8px}
            .lv-far .osm-st{display:none}.lv-row .lv-vav{width:42px;height:42px;border-width:3px}.lv-ch .lv-vav{margin-right:4px}`; document.head.appendChild(st); })();

