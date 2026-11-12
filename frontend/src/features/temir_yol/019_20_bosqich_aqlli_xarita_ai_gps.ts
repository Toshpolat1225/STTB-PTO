        // =====================================================================
        // YANGI (20-bosqich): AQLLI XARITA — AI + GPS.
        // A) AI javobi xaritada ajratiladi  B) yo'nalish (eng qisqa yo'l)  C) "... ko'rsat"
        // D) holat (xavf) rejimi  E) eng yaqin stansiya + kompas  F) aylanib chiqish (obxod)
        // G) zamechaniyalar xaritada (GPS bilan)  H) kunlik hisobot. OpenRailwayMap qatlami.
        // =====================================================================
        // Ochiq manbalardan tekshirilgan koordinatalar (26.09.2026)
        var INF_GEO_SRC = {
            ohan: { ll: [40.9069, 69.6524], ok: true, src: 'railwayz.info (40.90678, 69.65245) + Yandex Xaritalar (40.906985, 69.652402)' }
        };
        var INF_LANDMARKS = [
            { name: 'Qalmoqqir karyeri', ll: [40.8315, 69.6674], ok: false, src: 'USGS (thediggings.com) — karyer markazi, stansiya emas' },
            { name: 'Olmaliq shahri', ll: [40.85, 69.60], ok: true, src: 'Wikipedia' }
        ];
        function infGeoLabel(id) {
            let u = {}; try { u = JSON.parse(localStorage.getItem(INF_GEO_KEY) || '{}') || {}; } catch (e) {}
            if (u[id]) return "📍 qo'lda kiritilgan";
            const s = INF_GEO_SRC[id]; return s ? (s.ok ? '✅ tasdiqlangan: ' : '⚠️ taxminiy: ') + s.src : '';
        }
        const RISK_COL = ['#22c55e', '#facc15', '#ef4444'];
        const MAPHL = { ids: new Set(), label: '' };
        let GPSFIX = null;
        function curGpsFix() { return GPSFIX && (Date.now() - GPSFIX.t < 180000) ? { lat: +GPSFIX.lat.toFixed(6), lon: +GPSFIX.lon.toFixed(6), acc: Math.round(GPSFIX.acc || 0), at: new Date(GPSFIX.t).toISOString() } : null; }
        function geoDist(a, b) { const R = 6371000, r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
        function geoBearing(a, b) { const r = x => x * Math.PI / 180, y = Math.sin(r(b[1] - a[1])) * Math.cos(r(b[0])), x = Math.cos(r(a[0])) * Math.sin(r(b[0])) - Math.sin(r(a[0])) * Math.cos(r(b[0])) * Math.cos(r(b[1] - a[1])); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }
        function bearingName(d) { return ['shimol', 'shimoli-sharq', 'sharq', 'janubi-sharq', 'janub', 'janubi-g\'arb', 'g\'arb', 'shimoli-g\'arb'][Math.round(d / 45) % 8]; }
        function fmtDist(m) { return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' km'; }

        // ---- D) Holat (xavf) bahosi ----
        function infRisk(o) {
            const d = infD(o) || {}, why = []; let s = 0;
            const z = infZ(o.id); if (z) { s += z >= 3 ? 5 : 3; why.push('🚨 ochiq zamechaniya: ' + z + ' ta'); }
            let wear = 0, def = 0;
            ((d.topics || {}).rels ? d.topics.rels.t : []).forEach(i => (d.tables[i] || []).slice(1).forEach(r => {
                if (!/^Р/.test(r[0])) return;
                [r[2], r[3]].forEach(c => { const m = String(c || '').match(/\d+/g); if (m) wear = Math.max(wear, ...m.map(Number)); });
                const df = parseInt(String(r[5] || '').replace(/\D/g, ''), 10); if (df > 0) def += df;
            }));
            if (wear >= 6) { s += 2; why.push('🛤️ rels yeyilishi ' + wear + ' mm gacha'); } else if (wear >= 4) { s += 1; why.push('🛤️ rels yeyilishi ' + wear + ' mm gacha'); }
            if (def) { s += 2; why.push('⚠️ nosoz relslar: ' + def); }
            if (d.egri && d.egri[1]) { if (d.egri[1] <= 120) { s += 2; why.push('↪️ juda kichik radius R ' + d.egri[1] + ' m'); } else if (d.egri[1] <= 200) { s += 1; why.push('↪️ kichik radius R ' + d.egri[1] + ' m'); } }
            if (d.uklon >= 30) { s += 2; why.push('⛰️ katta qiyalik ' + d.uklon + ' ‰'); } else if (d.uklon >= 20) { s += 1; why.push('⛰️ qiyalik ' + d.uklon + ' ‰'); }
            const un = ((d.topics || {}).pere ? d.topics.pere.p : []).filter(x => /неохраняем/.test(x)).length;
            if (un) { s += 1; why.push("🚧 qo'riqlanmaydigan pereyezd: " + un); }
            return { lvl: s >= 5 ? 2 : s >= 2 ? 1 : 0, score: s, why: why };
        }
        function infRiskHtml(o) {
            const r = infRisk(o), t = ['🟢 Yaxshi', "🟡 E'tibor kerak", '🔴 Xavfli'][r.lvl];
            return `<div class="passport-container"><div class="passport-title"><span>🚦 Holat bahosi: ${t}</span><span style="font-size:11px; color:#94a3b8;">ball: ${r.score}</span></div>
                ${r.why.length ? `<ul class="inf-sum">${r.why.map(w => '<li>' + escapeHtml(w) + '</li>').join('')}</ul>` : '<div style="font-size:12px; color:#cbd5e1;">Xavf omillari topilmadi.</div>'}
                <div style="font-size:10px; color:#94a3b8; margin-top:6px;">Baho texnik pasport (2023) va ochiq zamechaniyalar asosida avtomatik hisoblanadi.</div></div>`;
        }

        // ---- Xaritani bezash: AI ajratishi, holat ranglari ----
        function mapDecorate() {
            const svg = $id('mapSvg'); if (!svg) return;
            const risk = !!MAPL.risk;
            svg.querySelectorAll('.g-it[data-id]').forEach(g => {
                const id = g.getAttribute('data-id'), o = infO(id); if (!o) return;
                g.classList.toggle('ai-hl', MAPHL.ids.has(id));
                const col = risk ? RISK_COL[infRisk(o).lvl] : (INFRA_COL[o.uch] || '#94a3b8');
                g.querySelectorAll('line.ed').forEach(l => l.setAttribute('stroke', col));
                g.querySelectorAll('circle.nd').forEach(c => c.setAttribute('fill', col));
            });
            svg.classList.toggle('hl-ai', MAPHL.ids.size > 0);
            const bar = $id('mapAiBar');
            if (bar) { bar.classList.toggle('hidden', !MAPHL.label); bar.innerHTML = MAPHL.label ? `${AI_ICO_S}${escapeHtml(MAPHL.label)} <b onclick="mapClearHl()">✕</b>` : ''; }
            const lg = $id('mapLegend');
            if (lg) lg.innerHTML = risk ? `<span><i style="background:${RISK_COL[0]}"></i>Yaxshi</span><span><i style="background:${RISK_COL[1]}"></i>E'tibor kerak</span><span><i style="background:${RISK_COL[2]}"></i>Xavfli</span><span><i class="dash"></i>Ulanishi aniqlanmagan</span>`
                : `<span><i style="background:#38bdf8"></i>Markaziy uchastka</span><span><i style="background:#f59e0b"></i>Qalmoqqir uchastkasi</span><span><i class="sq"></i>Kirish yo'li / depo</span><span><i class="dash"></i>Ulanishi aniqlanmagan</span>`;
        }
        function mapSetHl(ids, label, focus) {
            MAPHL.ids = new Set(ids); MAPHL.label = label || '';
            if (focus !== false && ids.length) mapFit(ids);
            mapDecorate();
        }
        function mapClearHl() { MAPHL.ids = new Set(); MAPHL.label = ''; mapDecorate(); }
        function mapFit(ids) {
            const pts = []; ids.forEach(id => { const o = infO(id); if (!o) return; if (INFRA_POS[id]) pts.push(INFRA_POS[id]); if (o.kind === 'pr') { if (INFRA_POS[o.a]) pts.push(INFRA_POS[o.a]); if (INFRA_POS[o.b]) pts.push(INFRA_POS[o.b]); } });
            if (!pts.length) return;
            const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
            const w = Math.max(320, Math.max(...xs) - Math.min(...xs) + 260), h = Math.max(420, Math.max(...ys) - Math.min(...ys) + 200);
            MAP.vb = { x: (Math.max(...xs) + Math.min(...xs)) / 2 - w / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2 - h / 2, w: w, h: h }; mapApply();
        }
        function mapFocus(id) {
            if (!$id('screen-map').classList.contains('active')) openMapScreen();
            mapSetHl([id], infraShort(infO(id)) + ' ko\'rsatildi'); mapCard(id);
        }
        function mapCard(id, extra) {
            const el = $id('mapCard'), o = infO(id); if (!el || !o) return;
            const d = infD(o), r = infRisk(o), z = infZ(id);
            el.innerHTML = `<div class="mc-h"><b>${o.kind === 'pr' ? '🛤️' : '🚉'} ${escapeHtml(o.id === 'ohan' ? 'Ohangaron stansiyasi' : o.uz)}</b><span onclick="document.getElementById('mapCard').classList.add('hidden')">✕</span></div>
                ${extra || ''}<div class="mc-m">${[d.len ? infraKm(d.len) : '', d.cat ? d.cat + ' toifa' : '', ['🟢 yaxshi', "🟡 e'tibor", '🔴 xavfli'][r.lvl], z ? '🚨 ' + z : ''].filter(Boolean).join(' · ')}</div>
                <div class="mc-b"><button onclick="openInfraObj('${id}','map')">📂 Bo'limlar</button><button onclick="openInfra('${id}')">📄 Pasport</button></div>`;
            el.classList.remove('hidden');
        }

        // ---- B) Yo'nalish: eng qisqa yo'l (Deykstra) ----
        const INF_ALIAS = { ohan: ['ohangaron', 'axangaron', 'ахангаран'], izv: ['izvestkov', 'известков'], olm: ['olmaliq', 'almalik', 'алмалык'], svi: ['svinsov', 'svinцов', 'свинцов'],
            med: ['mednay', 'медн'], nij: ['nijniy', 'нижни'], fab: ['fabrichn', 'фабричн'], bun: ['bunkern', 'бункерн'], pre: ['predgorn', 'предгорн'], sau: ['sauk', 'саук'], vm: ['vm zavod', 'вм'],
            kol: ['kolsevay', 'kolцев', 'кольцев'], kal: ['qalmoqqir', 'kalmakir', 'kalmakyr', 'кальмакыр', 'qalmoqir'], r668: ['668'], otv: ['otvaln', 'отвальн'], por: ['porodn', 'породн'],
            raz: ['razvyazk', 'развязк'], vos: ['vostochn', 'восточн'], yos: ['yoshlik', 'ёшлик', 'ешлик'] };
        function aiFindStations(q) {
            const hits = [];
            Object.keys(INF_ALIAS).forEach(id => INF_ALIAS[id].forEach(a => { const i = q.indexOf(a); if (i >= 0 && !hits.some(h => h.id === id)) hits.push({ id: id, i: i }); }));
            return hits.sort((a, b) => a.i - b.i).map(h => h.id);
        }
        function infRoute(from, to) {
            const E = Object.values(INFRA_BY).filter(o => o.kind === 'pr'), dist = {}, prev = {}, Q = new Set();
            const nodes = new Set(); E.forEach(e => { nodes.add(e.a); nodes.add(e.b); });
            if (!nodes.has(from) || !nodes.has(to)) return null;
            nodes.forEach(n => { dist[n] = Infinity; Q.add(n); }); dist[from] = 0;
            while (Q.size) {
                let u = null; Q.forEach(n => { if (u === null || dist[n] < dist[u]) u = n; });
                if (dist[u] === Infinity || u === to) break; Q.delete(u);
                E.filter(e => e.a === u || e.b === u).forEach(e => { const v = e.a === u ? e.b : e.a, w = infD(e).len && !e.doc ? infD(e).len : 1500;
                    if (Q.has(v) && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = { n: u, e: e }; } });
            }
            if (dist[to] === Infinity) return null;
            const path = [to], edges = []; let c = to; while (prev[c]) { edges.unshift(prev[c].e); c = prev[c].n; path.unshift(c); }
            return { nodes: path, edges: edges, m: edges.reduce((s, e) => s + (!e.doc && e.len ? e.len : 0), 0), unk: edges.filter(e => e.doc || !e.len).length };
        }

        // ---- AI: aqlli javoblar ----
        function aiSmartReply(q, sid) {
            if (typeof ndAiReply === 'function') { const nd = ndAiReply(q, typeof AI_LAST_RAW !== 'undefined' ? AI_LAST_RAW : q); if (nd) return nd; }
            if (typeof hrAiReply === 'function') { const hr = hrAiReply(q); if (hr) return hr; }
            if (typeof spAiReply === 'function') { const sp = spAiReply(q); if (sp) return sp; }
            // H) Kunlik hisobot
            if (/bugun|hisobot|kunlik|umumiy holat/.test(q) && !/stansiya/.test(q)) return aiDailyReport();
            const st = aiFindStations(q);
            // B) Yo'nalish
            if (st.length >= 2 && /dan|gacha|yo.?nalish|marshrut|yol|masofa|qancha|->|–|-/.test(q)) {
                const r = infRoute(st[0], st[1]);
                if (!r) return "Kechirasiz, " + infraShort(infO(st[0]) || { uz: st[0] }) + " va " + (infO(st[1]) ? infraShort(infO(st[1])) : st[1]) + " orasida hujjatdagi peregonlar orqali yo'l topilmadi (ulanishi hali aniqlanmagan bo'lishi mumkin).";
                const strel = r.nodes.reduce((s, n) => s + ((infO(n) || {}).strel || 0), 0);
                mapSetHl(r.nodes.concat(r.edges.map(e => e.id)), "Yo'nalish: " + r.nodes.map(n => infO(n) ? infraShort(infO(n)) : 'VM zavodi').join(' → '));
                return "🧭 Eng qisqa yo'l: " + r.nodes.map(n => infO(n) ? infraShort(infO(n)) : 'VM zavodi').join(' → ') +
                    "\n• Masofa: " + fmtDist(r.m) + (r.unk ? " (+" + r.unk + " ta peregon uzunligi hujjatda alohida berilmagan)" : '') +
                    "\n• Peregonlar: " + r.edges.length + " ta, stansiyalar: " + r.nodes.length + " ta, ulardagi strelkalar: " + strel +
                    "\n🗺️ Yo'l xaritada yonib turibdi.";
            }
            // C) "... ko'rsat"
            if (st.length === 1 && /korsat|och|qayerda|topib ber|xaritada/.test(q)) {
                const id = st[0] === 'vm' ? 'pr_pre_vm' : st[0];
                setTimeout(() => { $id('aiChatModal').classList.add('hidden'); mapFocus(id); }, 900);
                return "🗺️ " + infraShort(infO(id)) + " xaritada ko'rsatilmoqda...";
            }
            // D) Xavfli joylar
            if (/xavf|xatar|holat rejim|qizil joy|e.?tibor/.test(q)) {
                const all = Object.values(INFRA_BY).map(o => ({ o: o, r: infRisk(o) })).filter(x => x.r.lvl > 0).sort((a, b) => b.r.score - a.r.score);
                const red = all.filter(x => x.r.lvl === 2), yel = all.filter(x => x.r.lvl === 1);
                MAPL.risk = true; saveMapL(); mapSetHl(all.slice(0, 12).map(x => x.o.id), 'Xavf darajasi yuqori joylar', false);
                return "🚦 Holat bahosi (texnik pasport + zamechaniyalar):\n🔴 Xavfli: " + (red.length ? red.map(x => infraShort(x.o) + ' (' + x.r.why[0] + ')').join('; ') : "yo'q") +
                    "\n🟡 E'tibor kerak: " + yel.length + " ta" + (yel.length ? ' — ' + yel.slice(0, 8).map(x => infraShort(x.o)).join(', ') + (yel.length > 8 ? '...' : '') : '') + "\n🗺️ Xaritada «Holat» rejimi yoqildi.";
            }
            // A) Filtrlar xaritada
            let f = null, lbl = '';
            if (/zamechan/.test(q)) { f = o => infZ(o.id) > 0; lbl = 'Zamechaniyasi bor obyektlar'; }
            else if (/radius|egri/.test(q)) { f = o => { const d = infD(o); return d.egri && d.egri[1] <= 150; }; lbl = 'Kichik radiusli (R ≤ 150 m) egri chiziqlar'; }
            else if (/qiyalik|uklon|nishab/.test(q)) { f = o => (infD(o).uklon || 0) >= 20; lbl = 'Qiyaligi 20 ‰ dan katta'; }
            else if (/pereyezd|pereezd/.test(q)) { f = o => (infD(o).topics || {}).pere; lbl = 'Pereyezdi bor obyektlar'; }
            else if (/strelka/.test(q) && /kop|eng|top/.test(q)) { const top = Object.values(INFRA_BY).filter(o => o.strel).sort((a, b) => b.strel - a.strel).slice(0, 5).map(o => o.id); f = o => top.includes(o.id); lbl = "Strelkasi eng ko'p 5 ta obyekt"; }
            else if (/kontakt/.test(q)) { f = o => infD(o).kontakt; lbl = "Kontakt tarmog'i bor"; }
            else if (/elektrojezl|jezl/.test(q)) { f = o => /jezl/i.test(infD(o).blok || ''); lbl = 'Elektrojezl tizimidagi obyektlar'; }
            if (f && (sid === 'screen-map' || /xarita|korsat|qaysi|qayer/.test(q))) {
                const l = Object.values(INFRA_BY).filter(o => { try { return f(o); } catch (e) { return false; } });
                if (!l.length) { mapClearHl(); return "✅ " + lbl + ": hozircha yo'q."; }
                mapSetHl(l.map(o => o.id), lbl + ' (' + l.length + ')');
                return "🗺️ " + lbl + ": " + l.length + " ta\n" + l.slice(0, 15).map(o => '• ' + o.uz).join('\n') + (l.length > 15 ? '\n...' : '') + "\nXaritada yonib turibdi.";
            }
            // E) Eng yaqin stansiya
            if (/eng yaqin|yaqin stansiya|qayerdaman|men qayer/.test(q)) { setTimeout(() => { $id('aiChatModal').classList.add('hidden'); if (!$id('screen-map').classList.contains('active')) openMapScreen(); mapLocate(); }, 700); return "📍 Joylashuvingiz aniqlanmoqda — eng yaqin stansiya xaritada ko'rsatiladi."; }
            return null;
        }
        function aiDailyReport() {
            const t = todayISO(), zs = allZams();
            const made = zs.filter(r => String(r.z.at).slice(0, 10) === t), closed = zs.filter(r => (r.z.attempts || []).some(a => a.result === 'qabul' && String(a.reviewAt || '').slice(0, 10) === t));
            const open = zs.filter(r => r.z.status !== 'yopildi'), wait = zs.filter(r => r.z.status === 'tekshiruvda');
            const red = Object.values(INFRA_BY).filter(o => infRisk(o).lvl === 2);
            vagonlarData.forEach(recalcVagonStatus);
            const vT = onlyVagons().filter(v => v.status === "Ta'mir talab").length, lT = onlyLoks().filter(v => v.status === "Ta'mir talab").length;
            const yNow = onlyYol().filter(v => (pprNext(v) || {}).ongoing), y3 = onlyYol().filter(v => v.kun !== null && v.kun > 0 && v.kun <= 3);
            let ob = ''; try { const L2 = JSON.parse(localStorage.getItem(OBX_LOG_KEY) || '[]').filter(x => String(x.start).slice(0, 10) === t); if (L2.length) ob = "\n🚶 Bugungi aylanib chiqishlar: " + L2.length + " ta, " + fmtDist(L2.reduce((s, x) => s + (x.m || 0), 0)); } catch (e) {}
            return "📋 Kunlik hisobot — " + fmtISO(t) +
                "\n🚨 Zamechaniyalar: bugun berildi " + made.length + ", bugun yopildi " + closed.length + ", ochiq jami " + open.length + " (tekshiruvda " + wait.length + ")" +
                "\n🔴 Temir yo'lda xavfli obyektlar: " + (red.length ? red.map(o => infraShort(o)).join(', ') : "yo'q") +
                "\n🚃 Vagonlar: ta'mir talab " + vT + " ta" + "\n🚂 Lokomotivlar: ta'mir talab " + lT + " ta" +
                "\n🛤️ Yo'l texnikalari: hozir rejali ta'mirda " + yNow.length + " ta" + (yNow.length ? ' (' + yNow.map(v => v.marka + ' №' + v.zav).join(', ') + ')' : '') + ", 3 kun ichida " + y3.length + " ta" + ob;
        }

        // ---- GPS: OpenRailwayMap, belgilar, zamechaniyalar, iz ----
        function addRailOverlay(k, m) {
            MAPG.orm = MAPG.orm || {};
            MAPG.orm[k] = L.tileLayer('agmk-tile://orm/standard/{z}/{x}/{y}.png', { maxZoom: 19, opacity: 0.9, attribution: '© OpenRailwayMap' });
            if (MAPL.orm !== false) MAPG.orm[k].addTo(m);
        }
        function drawGeoExtra(k, g) {
            const G = getInfGeo();
            INF_LANDMARKS.forEach(p => L.circleMarker(p.ll, { radius: 6, color: '#fff', weight: 2, fillColor: '#a855f7', fillOpacity: 0.9 }).bindTooltip(p.name + (p.ok ? '' : ' (taxminiy)'), { direction: 'top' }).addTo(g));
            allZams().forEach(r => { const z = r.z; if (!z.gps || z.status === 'yopildi') return;
                L.marker([z.gps.lat, z.gps.lon], { icon: L.divIcon({ className: 'zam-pin', html: '🚨', iconSize: [26, 26], iconAnchor: [13, 13] }) })
                    .bindTooltip('№' + z.no + ' · ' + unitLabel(r.v), { direction: 'top' }).on('click', () => openZam(r.v.id, z.no)).addTo(g); });
            if (OBX.pts.length > 1) L.polyline(OBX.pts.map(p => [p[0], p[1]]), { color: '#a855f7', weight: 4, dashArray: '6 6' }).addTo(g);
            if (MAPHL.ids.size) Object.values(INFRA_BY).forEach(o => { if (o.kind === 'pr' && MAPHL.ids.has(o.id) && G[o.a] && G[o.b]) L.polyline([G[o.a], G[o.b]], { color: '#fde047', weight: 9, opacity: 0.6 }).addTo(g); });
        }
        function lyrExtraHtml() {
            return `<div class="lyr-mode" style="margin-top:10px;"><div class="${MAPL.orm !== false ? 'on' : ''}" onclick="toggleOrm()">🚆 Temir yo'llar (OSM)</div><div class="${MAPL.risk ? 'on' : ''}" onclick="toggleRisk()">🚦 Holat rejimi</div></div>`;
        }
        function toggleOrm() {
            MAPL.orm = MAPL.orm === false; saveMapL(); renderLayerPanel();
            Object.keys(MAPG.lf).forEach(k => { const t = (MAPG.orm || {})[k]; if (!t) return; if (MAPL.orm !== false) t.addTo(MAPG.lf[k]); else MAPG.lf[k].removeLayer(t); });
        }
        function toggleRisk() { MAPL.risk = !MAPL.risk; saveMapL(); renderLayerPanel(); mapDecorate(); }
        function toggleLegend() { $id('mapWrap').classList.toggle('lg-on'); }

        // ---- E) Eng yaqin stansiya + kompas ----
        let HEADING = null, NEAR = null;
        function onHeading(e) { const h = e.webkitCompassHeading !== undefined ? e.webkitCompassHeading : (e.absolute && e.alpha !== null ? 360 - e.alpha : null); if (h !== null && !isNaN(h)) { HEADING = h; updCompass(); } }
        function startCompass() {
            if (startCompass.on) return; startCompass.on = true;
            try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().catch(() => {}); } catch (e) {}
            window.addEventListener('deviceorientationabsolute', onHeading, true); window.addEventListener('deviceorientation', onHeading, true);
        }
        function updCompass() { const a = $id('mcArrow'); if (a && NEAR) a.style.transform = 'rotate(' + (NEAR.brg - (HEADING || 0)) + 'deg)'; }
        function gpsNearestCard(ll) {
            GPSFIX = GPSFIX || { lat: ll[0], lon: ll[1], acc: 0, t: Date.now() };
            const G = getInfGeo(), ids = Object.keys(G);
            if (!ids.length) { showToast("📍 Joylashuv aniqlandi, lekin hali koordinatali stansiya yo'q"); return; }
            const best = ids.map(id => ({ id: id, d: geoDist(ll, G[id]) })).sort((a, b) => a.d - b.d)[0];
            NEAR = { id: best.id, brg: geoBearing(ll, G[best.id]) };
            startCompass();
            mapCard(best.id, `<div class="mc-near"><span id="mcArrow" class="mc-arrow">⬆</span><div>Eng yaqin stansiya: <b>${fmtDist(best.d)}</b>, ${bearingName(NEAR.brg)} tomonda${HEADING === null ? ' <small>(strelka shimolga nisbatan)</small>' : ''}</div></div>`);
            updCompass();
        }

        // ---- F) Aylanib chiqish (obxod) rejimi ----
        const OBX_LOG_KEY = 'agmk_obxod_log';
        const OBX = { on: false, watch: null, pts: [], start: null, m: 0, seen: {}, visited: [] };
        function toggleObxod() {
            if (OBX.on) { stopObxod(); return; }
            if (!navigator.geolocation) { showToast('📍 Bu qurilmada GPS mavjud emas'); return; }
            OBX.on = true; OBX.pts = []; OBX.start = new Date().toISOString(); OBX.m = 0; OBX.seen = {}; OBX.visited = [];
            if (!MAPL.gps && !MAPL.hyb) { MAPL.gps = true; saveMapL(); applyMapLayers(); }
            OBX.watch = navigator.geolocation.watchPosition(obxPos, e => { showToast(e && e.code === 1 ? "📍 GPS'ga ruxsat berilmadi (https orqali ochilganda ishlaydi)" : "📍 GPS signali yo'q"); if (e && e.code === 1) stopObxod(true); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
            renderObx(); showToast('🚶 Aylanib chiqish boshlandi');
        }
        function obxPos(p) {
            const ll = [p.coords.latitude, p.coords.longitude];
            GPSFIX = { lat: ll[0], lon: ll[1], acc: p.coords.accuracy, t: Date.now() };
            const last = OBX.pts[OBX.pts.length - 1];
            if (!last || geoDist(last, ll) > 8) { if (last) OBX.m += geoDist(last, ll); OBX.pts.push([ll[0], ll[1], Date.now()]); }
            const G = getInfGeo();
            Object.keys(G).forEach(id => { const d = geoDist(ll, G[id]);
                if (d <= 300 && (!OBX.seen[id] || Date.now() - OBX.seen[id] > 600000)) {
                    OBX.seen[id] = Date.now(); if (!OBX.visited.includes(id)) OBX.visited.push(id);
                    try { navigator.vibrate && navigator.vibrate([120, 60, 120]); } catch (e) {}
                    mapCard(id, `<div class="mc-near">📍 <div>Siz <b>${escapeHtml(infraShort(infO(id)))}</b> yaqinidasiz — ${fmtDist(d)}</div></div><div class="mc-b"><button onclick="infGoGallery('${id}')">📸 Rasm</button><button onclick="infGoZam('${id}')">🚨 Zamechaniya</button></div>`);
                } });
            ['gps', 'hyb'].forEach(k => { if (MAPG.lf[k]) { MAPG.me[k] = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }); drawGeo(k); } });
            renderObx();
        }
        function stopObxod(silent) {
            if (OBX.watch !== null) { try { navigator.geolocation.clearWatch(OBX.watch); } catch (e) {} }
            OBX.watch = null; OBX.on = false;
            if (OBX.pts.length > 1) {
                let L2 = []; try { L2 = JSON.parse(localStorage.getItem(OBX_LOG_KEY) || '[]'); } catch (e) {}
                const step = Math.ceil(OBX.pts.length / 400);
                L2.push({ by: meObj(), start: OBX.start, end: new Date().toISOString(), m: Math.round(OBX.m), visited: OBX.visited, pts: OBX.pts.filter((x, i) => i % step === 0) });
                try { localStorage.setItem(OBX_LOG_KEY, JSON.stringify(L2.slice(-50))); } catch (e) {}
                if (!silent) showToast('🚶 Saqlandi: ' + fmtDist(OBX.m) + ', ' + OBX.visited.length + ' ta stansiya');
            } else if (!silent) showToast('🚶 Aylanib chiqish to\'xtatildi');
            renderObx();
        }
        function renderObx() {
            const b = $id('obxBtn'), c = $id('obxChip'); if (b) b.classList.toggle('on', OBX.on);
            if (!c) return;
            if (!OBX.on) { c.classList.add('hidden'); return; }
            const min = Math.round((Date.now() - new Date(OBX.start).getTime()) / 60000);
            c.classList.remove('hidden');
            c.innerHTML = `🚶 Aylanib chiqish: ${fmtDist(OBX.m)} · ${min} daq · ${OBX.visited.length} stansiya <b onclick="toggleObxod()">■ To'xtatish</b>`;
        }
        function infGoGallery(id) { openInfra(id); setTimeout(() => { const el = $id('vagon-gallery-preview'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); }
        function infGoZam(id) { openInfra(id); setTimeout(() => { const el = $id('zam-box'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300); }
        function gpsTag(g) { return g ? `<span class="gps-tag">📍 ${g.lat.toFixed(5)}, ${g.lon.toFixed(5)}${g.acc ? ' (±' + g.acc + ' m)' : ''}</span>` : ''; }

        // ---- 1) "Bo'limlar" ishorasi: sahifa surilganda yashiriladi ----
        (function () {
            const b = document.querySelector('#screen-map .set-body'); if (!b) return;
            b.addEventListener('scroll', () => { const h = $id('upHint'), l = $id('mapList'); if (!h || !l) return; h.classList.toggle('gone', l.getBoundingClientRect().top < window.innerHeight * 0.55); }, { passive: true });
        })();


