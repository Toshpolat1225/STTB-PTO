        // =====================================================================
        // v3.10.0
        //  1) «Oflayn» yozuvi bir marta chiqadi; keyin kichik 📴 belgi — bosilsa maʼlumot, ✕ — bugun boshqa chiqmaydi.
        //  2) Oflayn GPS: oʻzini xaritada koʻrish, «🗺 Xaritada koʻrish», navbat telefon xotirasida, iz smena oxirigacha, GPS holati.
        //  5) Temir yoʻl va avtotraktor ajratildi: 🚂 Mashinistlar / 🚜 Haydovchilar, dispetcherlik va harakat jurnali ikkiga.
        // 12) 📡 Jonli xarita (BFF uslubida, oʻz dizaynimiz): avatarlar, ravon harakat, guruhlash, joy nomi, batareya,
        //     masofa, bugungi yoʻl (vaqt chizigʻi), joylar (geozona) va «yetib keldi / chiqdi» xabarlari, Yandex Navigator.
        // =====================================================================

        // ---------------------------------------------------------------- 1) 📴 OFLAYN YOZUVI
        var OFP = { dayKey: 'agmk_offpill_day', shown: false, t: null };
        function offChip(on) {
            let c = $id('offChip');
            if (!on) { if (c) c.remove(); return; }
            if (!c) { c = document.createElement('button'); c.id = 'offChip'; c.type = 'button'; c.title = 'Oflayn — maʼlumot'; c.textContent = '📴'; c.onclick = offInfo; document.body.appendChild(c); }
        }
        offPill = function (txt, ok) {
            let p = $id('offPill'); clearTimeout(OFP.t);
            if (!txt) { if (p) p.remove(); offChip(false); return; }
            const isOff = !ok && /^📴/.test(txt);
            if (isOff) offChip(true);
            let today = ''; try { today = localStorage.getItem(OFP.dayKey) || ''; } catch (e) {}
            if (isOff && (OFP.shown || today === todayISO())) { if (p) p.remove(); return; } // bir marta; ✕ bosilgan kuni — umuman chiqmaydi
            if (!p) { p = document.createElement('div'); p.id = 'offPill'; document.body.appendChild(p); }
            p.onclick = () => { p.remove(); if (isOff) offInfo(); };
            p.textContent = txt; p.classList.toggle('ok', !!ok);
            if (isOff) { OFP.shown = true; OFP.t = setTimeout(() => { const q = $id('offPill'); if (q) q.remove(); }, 5000); }
            else if (ok) OFP.t = setTimeout(() => { const q = $id('offPill'); if (q && q.classList.contains('ok')) q.remove(); }, 6000);
        };
        function offPending() {
            let n = 0; try { const st = syncGet(SYNC_ST, { hash: {} }); syncLocal().forEach(x => { if (st.hash[x.id] !== syncHash(JSON.stringify(x.data))) n++; }); } catch (e) {}
            return n;
        }
        function offInfo() {
            const last = (typeof SYNC !== 'undefined' && SYNC.lastOk) ? fmtDateTime(new Date(SYNC.lastOk).toISOString()) : null, q = offPending(), g = (MS && MS.tq ? MS.tq.length : 0);
            mdl('offInfo', `<div class="px-h"><b>📴 Oflayn rejim</b><button class="mini-btn" onclick="offInfoClose()">✕</button></div>
                <div class="nd-tip">Korxona serveriga hozir ulanib boʻlmadi. Ishlashda davom etavering: kiritgan hamma narsangiz <b>shu telefonda saqlanadi</b> va server topilishi bilan <b>oʻzi yuboriladi</b>.</div>
                <div class="lv-kv"><span>🕒 Oxirgi sinxron</span><b>${last ? escapeHtml(last) : 'hali boʻlmagan'}</b><span>📤 Yuborilishi kutilmoqda</span><b>${q} ta yozuv${g ? ' · ' + g + ' ta GPS nuqta' : ''}</b>${(() => { try { return localStorage.getItem(sigPendKey()) === '1' ? '<span>✍️ Imzo</span><b>telefonda, yuboriladi</b>' : ''; } catch (e) { return ''; } })()}</div>
                <div class="ms-b2"><button onclick="mdlClose('offInfo'); showToast('🔎 Server qidirilmoqda…'); offTick(true)">🔎 Serverni hozir qidirish</button><button onclick="mdlClose('offInfo'); bkExport()">💾 Zaxira olish</button></div>
                <small style="color:#94a3b8;display:block;margin-top:8px">✕ bossangiz, bu yozuv bugun boshqa chiqmaydi — pastda chapdagi kichik 📴 belgi qoladi.</small>`, true);
        }
        function offInfoClose() { mdlClose('offInfo'); try { localStorage.setItem(OFP.dayKey, todayISO()); } catch (e) {} const p = $id('offPill'); if (p) p.remove(); }
        (function () { const st = document.createElement('style'); st.textContent = `#offChip{position:fixed;left:10px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9000;width:38px;height:38px;border-radius:50%;border:1px solid #fb923c;background:rgba(124,45,18,.9);color:#fff;font-size:17px;padding:0;box-shadow:0 4px 12px rgba(0,0,0,.45)}body.locked #offChip{display:none}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 5) TEMIR YOʻL / AVTOTRAKTOR
        var PARK = { rail: { kinds: ['lok', 'yol'], ic: '🚂', t: 'Mashinistlar', dt: 'Temir yoʻl' }, avto: { kinds: ['avto'], ic: '🚜', t: 'Haydovchilar', dt: 'Avtotraktor' } };
        function parkOfKind(k) { return k === 'avto' ? 'avto' : 'rail'; }
        function parkOfUnit(id) { const v = msUnit(id) || msUnit(+id); return v ? parkOfKind(v.kind) : 'rail'; }
        // Xodimning yoʻnalishi lavozimidan: avtotraktor / temir yoʻl / ikkalasi (rahbar, dispetcher, admin)
        function parkOfMe() {
            try { if (isAdmin() || (typeof nsResp === 'function' && nsResp())) return 'both'; } catch (e) {}
            const l = String((currentUser && (currentUser.lavozim || currentUser.role)) || '').toLowerCase();
            if (/haydovchi|водител|shofyor|шофер|traktor|трактор|ekskavator|экскават|yuklagich|погрузч|avtobus|автобус|avtokran|автокран|buldozer|бульдозер|greyder|грейдер/.test(l)) return 'avto';
            if (/mashinist|машинист|motorist|моторист|teplovoz|тепловоз|lokomotiv|локомотив|drezina|дрезин|elektrovoz|электровоз/.test(l)) return 'rail';
            return 'both';
        }
        if (typeof modAllowed === 'function') modAllowed = agmkExtend('modAllowed', 'v3.10: mashinist / haydovchi kartochkasi', modAllowed, o => function (m) {
            const r = o.apply(this, arguments); if (!r || !m) return r;
            const p = parkOfMe(); if (m.id === 'mash' && p === 'avto') return false; if (m.id === 'hayd' && p === 'rail') return false; return r;
        });
        try { const m = AGMK_MODS.find(x => x.id === 'mash'); if (m) { m.title = 'Mashinistlar'; m.search = 'mashinistlar mashinist lokomotiv teplovoz elektrovoz drezina motovoz smena nosozlik sos temir yol jonli xarita'; m.open = () => mashOpen(null, 'rail'); }
            if (typeof agmkModule === 'function') agmkModule({ id: 'hayd', icon: '🚜', title: 'Haydovchilar', search: 'haydovchilar haydovchi shofyor traktorchi ekskavatorchi yuklagich avtobus avtotraktor smena nosozlik sos jonli xarita', flag: 'mash', def: 'pilot', roles: ['mash', 'hr', 'tex', 'rahbar'], desc: 'Avtotraktor: smena, 🆘 nosozlik, GPS', open: () => mashOpen(null, 'avto') });
            if (typeof modRefresh === 'function') modRefresh(); } catch (e) {}
        if (typeof mashOpen === 'function') mashOpen = agmkExtend('mashOpen', 'v3.10: temir yoʻl / avtotraktor', mashOpen, o => function (tab, park) {
            if (park) MS.park = park; else if (!MS.park) { const p = parkOfMe(); MS.park = p === 'both' ? 'rail' : p; }
            const sm = mySmena && mySmena(); if (sm && !park) MS.park = parkOfKind(sm.kind);
            if (MS.park === 'avto' && (!MS.pk || !MS.pk.park)) MS.pk = { park: 'avto' };
            const r = o.call(this, tab);
            try { const h = document.querySelector('#screen-mash .sec-title'); if (h) h.textContent = PARK[MS.park].ic + ' ' + PARK[MS.park].t; } catch (e) {}
            return r;
        });
        // Render paytida faqat oʻz yoʻnalishi: park roʻyxati, smenadagilar, nosozliklar
        var PKF = { on: null };
        if (typeof msActive === 'function') msActive = agmkExtend('msActive', 'v3.10: yoʻnalish boʻyicha', msActive, o => function () { const L = o.apply(this, arguments); return PKF.on ? L.filter(s => PARK[PKF.on].kinds.includes(s.kind || 'lok')) : L; });
        if (typeof nsAll === 'function') nsAll = agmkExtend('nsAll', 'v3.10: yoʻnalish boʻyicha', nsAll, o => function () { const L = o.apply(this, arguments); return PKF.on ? L.filter(n => !n.unitId || parkOfUnit(n.unitId) === PKF.on || (n.demo && PKF.on === 'rail')) : L; });
        if (typeof mashRender === 'function') mashRender = agmkExtend('mashRender', 'v3.10: yoʻnalish boʻyicha', mashRender, o => function () {
            const park = MS.park || 'rail', keep = MS_PARK; PKF.on = park; MS_PARK = keep.filter(k => PARK[park].kinds.includes(k[0]));
            if (park === 'avto' && (!MS.pk || !MS.pk.park)) MS.pk = { park: 'avto' };
            try { return o.apply(this, arguments); } finally { MS_PARK = keep; PKF.on = null; try { const h = document.querySelector('#screen-mash .sec-title'); if (h) h.textContent = PARK[park].ic + ' ' + PARK[park].t; mashSmenaExtra(); } catch (e) {} }
        });
        if (typeof mashXodimHtml === 'function') mashXodimHtml = function () {
            const p = MS.park || 'rail';
            return `<div class="ms-b2"><button onclick="mashTab('live')">📡 Jonli xarita</button>${p === 'rail' ? `<button onclick="gdOpen()">🚂 Temir yoʻl sxemasi</button>` : ''}</div><div class="ms-b2" style="margin-top:6px">${p === 'rail' ? `<button onclick="bfStart()">🧪 Temir yoʻl demo</button>` : `<button onclick="rdStart()">🧪 Avtotraktor demo</button>`}</div><div id="msXL">${mashXodimList()}</div>`;
        };

        // ---------------- Dispetcherlik: ikki yoʻnalish, har birining jurnali ----------------
        var HRP = { key: 'agmk_hr_park', f: null };
        function hrPark() { if (!HR.park) { try { HR.park = localStorage.getItem(HRP.key) || 'rail'; } catch (e) { HR.park = 'rail'; } } return HR.park; }
        function hrParkSet(p) { HR.park = p; try { localStorage.setItem(HRP.key, p); } catch (e) {} renderHrHome(); }
        function hrLogPark(x, d) {
            if (x.park) return x.park;
            try { const g = hrLogTarget(x, d); if (g && g.k === 'unit') return parkOfUnit(g.id); if (g && g.k === 'ns') { const n = nsGet(g.id); if (n && n.unitId) return parkOfUnit(n.unitId); } } catch (e) {}
            return /🚜|avtotraktor|avtomobil|traktor|ekskavator|yuklagich|avtobus/i.test(x.text || '') ? 'avto' : 'rail';
        }
        if (typeof hrDB === 'function') hrDB = agmkExtend('hrDB', 'v3.10: jurnal yoʻnalish boʻyicha', hrDB, o => function () {
            const d = o.apply(this, arguments); if (!HRP.f) return d;
            const c = Object.assign({}, d); c.log = d.log.filter(x => hrLogPark(x, d) === HRP.f); Object.defineProperty(c, '_flt', { value: true }); return c;
        });
        if (typeof hrSave === 'function') hrSave = agmkExtend('hrSave', 'v3.10: filtrlangan jurnal saqlanmaydi', hrSave, o => function (d) { if (d && d._flt) return; return o.apply(this, arguments); });
        if (typeof hrLog === 'function') hrLog = agmkExtend('hrLog', 'v3.10: yozuvga yoʻnalish', hrLog, o => function (d, text) {
            const r = o.apply(this, arguments);
            try { const x = d.log[0]; if (x && !x.park) { const u = vagonlarData.filter(v => v.kind && v.kind !== 'infra' && String(text || '').includes(hrName(v))).sort((a, b) => hrName(b).length - hrName(a).length)[0]; x.park = u ? parkOfKind(u.kind) : (typeof MS !== 'undefined' && $id('screen-mash') && $id('screen-mash').classList.contains('active') ? (MS.park || 'rail') : hrPark()); } } catch (e) {}
            return r;
        });
        if (typeof renderHrList === 'function') renderHrList = agmkExtend('renderHrList', 'v3.10: jurnal yoʻnalish boʻyicha', renderHrList, o => function () {
            if (HR.kind === 'log' && HR.view !== 'place') { HRP.f = hrPark(); try { const r = o.apply(this, arguments); try { const t = document.querySelector('#screen-hr-list h2'); if (t) t.textContent = '📜 Harakat jurnali — ' + PARK[HRP.f].dt; } catch (e) {} return r; } finally { HRP.f = null; } }
            return o.apply(this, arguments);
        });
        renderHrHome = function () {
            const d = hrSanitize(), T = d.tarkiblar, park = hrPark(), E = escapeHtml;
            const card = (ic, t, sub, on) => `<div class="btn-card inf-card" onclick="${on}"><div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${E(t)}<small>${E(sub)}</small></span></div><span class="btn-arrow">›</span></div>`;
            const cnt = kind => { const l = hrList(kind), g = {}; l.forEach(v => { const k = hrState(v, d).k; g[k] = (g[k] || 0) + 1; }); return g; };
            const sub = kind => { const g = cnt(kind); return HR_GROUPS[kind].filter(k => g[k]).map(k => HR_U[k][0] + ' ' + (HR_SHORT[k] || '') + ' ' + g[k]).join(' · ') || '—'; };
            HRP.f = park; const logN = hrDB().log; HRP.f = null;
            const seg = `<div class="hr-park"><button class="${park === 'rail' ? 'on' : ''}" onclick="hrParkSet('rail')">🚂 Temir yoʻl</button><button class="${park === 'avto' ? 'on' : ''}" onclick="hrParkSet('avto')">🚜 Avtotraktor</button></div>`;
            const live = (p) => { let n = 0; try { n = (MS.pos || []).filter(x => parkOfKind(x.kind || ((msUnit(+x.uid) || {}).kind)) === p).length; } catch (e) {} return card('📡', 'Jonli xarita', 'Smenadagi ' + (p === 'rail' ? 'mashinistlar' : 'haydovchilar') + ' qayerda — BFF uslubida' + (n ? ' · hozir ' + n : ''), `mashOpen('live','${p}')`); };
            if (park === 'rail') {
                const mov = T.filter(t => t.holat === 'yukli' || t.holat === 'yuksiz').length, vagIn = T.reduce((s, t) => s + t.vagonIds.length, 0);
                $id('hrSum').innerHTML = `<span>🚂 Tarkiblar: ${T.length}</span><span>🟢 Harakatda: ${mov}</span><span>🟡 Kutishda: ${T.filter(t => t.holat === 'kutish').length}</span><span>🚃 Tarkibdagi vagonlar: ${vagIn}</span>` + (canHR() ? '' : '<span>👁 Faqat koʻrish</span>');
                const stale = T.filter(t => hrStale(t.updAt)).length;
                $id('hrHome').innerHTML = seg + (typeof flagOn === 'function' && flagOn('disp') ? dispHomeBlock(d) : '') + hrLegendHtml() +
                    `<div class="inf-sec">🚆 Harakat tarkibi — temir yoʻl</div>` +
                    card('🚂', 'Tarkiblar (poyezdlar)', T.length + ' ta · ' + Object.keys(HR_T).map(k => HR_T[k][0] + ' ' + (HR_TSHORT[k] || '') + ' ' + T.filter(t => t.holat === k).length).join(' · ') + (stale ? ' · ⏱ eskirgan ' + stale : ''), "openHrList('tarkib')") +
                    card('🚉', 'Stansiyalar kesimida', 'Qaysi stansiya va peregonda nima turibdi', "openHrList('st')") +
                    card('🗺', 'Sxemada jonli harakat', (typeof gdStatusTxt === 'function' ? gdStatusTxt() : 'Tarkiblar sxemada'), 'gdOpen()') + live('rail') +
                    ['vag', 'lok', 'yol'].map(k => card(HR_KIND[k][0], HR_KIND[k][1], (k === 'yol' ? 'drezina, motovoz, kran, yoʻl mashinalari · ' : '') + hrList(k).length + ' ta · ' + sub(k), `openHrList('${k}')`)).join('') +
                    `<div class="inf-sec">📜 Nazorat</div>` + card('📜', 'Harakat jurnali — temir yoʻl', logN.length + ' ta yozuv · oxirgisi: ' + (logN[0] ? hrAgo(logN[0].at) : '—'), "openHrList('log')") +
                    `<div class="inf-sec">🔩 Taʼminot</div>` + card('🔩', 'Ehtiyot qismlar', "Materiallar va ehtiyot qismlar sarfi me'yori", "openSP(null,'hr')");
            } else {
                const g = cnt('avto'), all = hrList('avto').length;
                $id('hrSum').innerHTML = `<span>🚜 Avtotraktor: ${all}</span>` + HR_GROUPS.avto.filter(k => g[k]).map(k => `<span>${HR_U[k][0]} ${E(HR_SHORT[k] || HR_U[k][1] || k)}: ${g[k]}</span>`).join('') + (canHR() ? '' : '<span>👁 Faqat koʻrish</span>');
                $id('hrHome').innerHTML = seg + hrLegendHtml() + `<div class="inf-sec">🚜 Avtotraktor texnikasi</div>` +
                    card(HR_KIND.avto[0], HR_KIND.avto[1], 'avtomobil, traktor, yuklagich, ekskavator, avtobus · ' + all + ' ta · ' + sub('avto'), "openHrList('avto')") + live('avto') +
                    `<div class="inf-sec">📜 Nazorat</div>` + card('📜', 'Harakat jurnali — avtotraktor', logN.length + ' ta yozuv · oxirgisi: ' + (logN[0] ? hrAgo(logN[0].at) : '—'), "openHrList('log')") +
                    `<div class="inf-sec">🔩 Taʼminot</div>` + card('🔩', 'Ehtiyot qismlar', "Materiallar va ehtiyot qismlar sarfi me'yori", "openSP(null,'hr')");
            }
        };
        (function () { const st = document.createElement('style'); st.textContent = `.hr-park{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:0 0 10px;padding:4px;border-radius:14px;background:rgba(15,23,42,.85);border:1px solid #334155}.hr-park button{padding:10px;border-radius:10px;border:0;background:transparent;color:#cbd5e1;font-weight:700;font-size:14px}.hr-park button.on{background:#1d4ed8;color:#fff}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 2) OFLAYN GPS: navbat va oʻz izim telefon xotirasida
        var LVT = { key: 'agmk_my_trail', qkey: 'agmk_trk_q', sid: null, pts: [], dirty: false, q: null };
        function lvtLoad() {
            try { const o = JSON.parse(localStorage.getItem(LVT.key) || 'null'); if (o && o.tabel === meTabel()) { LVT.sid = o.sid; LVT.pts = o.pts || []; } } catch (e) {}
            try { const q = JSON.parse(localStorage.getItem(LVT.qkey) || 'null'); if (q && q.tabel === meTabel() && Array.isArray(q.pts) && q.pts.length) { LVT.q = q; if (typeof MS !== 'undefined' && MS.tq && !MS.tq.length) MS.tq = q.pts.slice(); } } catch (e) {}
        }
        function lvtSave() {
            if (!LVT.dirty || !currentUser) return; LVT.dirty = false;
            try { localStorage.setItem(LVT.key, JSON.stringify({ tabel: meTabel(), sid: LVT.sid, pts: LVT.pts.slice(-20000) })); } catch (e) {}
            try { const sm = mySmena(); const q = { tabel: meTabel(), uid: sm ? String(sm.unitId) : (LVT.q && LVT.q.uid), unit: sm ? sm.unitName : (LVT.q && LVT.q.unit), pts: (MS.tq || []).slice(-20000) }; LVT.q = q; localStorage.setItem(LVT.qkey, JSON.stringify(q)); } catch (e) {}
        }
        setInterval(lvtSave, 15000); document.addEventListener('visibilitychange', () => { if (document.hidden) lvtSave(); });
        window.addEventListener('agmk:login', () => setTimeout(lvtLoad, 500)); setTimeout(() => { if (currentUser && currentUser.tabel) lvtLoad(); }, 3000);
        if (typeof msTrack === 'function') msTrack = agmkExtend('msTrack', 'v3.10: oʻz izim telefon xotirasida', msTrack, o => function (f) {
            const r = o.apply(this, arguments);
            try { const sm = mySmena(); if (sm && f && (f.acc || 99) <= 80) { const sid = sm.start; if (LVT.sid !== sid) { LVT.sid = sid; LVT.pts = []; }
                const l = LVT.pts[LVT.pts.length - 1], t = f.t || Date.now();
                if (!l || t - l[0] > 60000 || geoDist([l[1], l[2]], [f.lat, f.lon]) > 8) { LVT.pts.push([t, +(+f.lat).toFixed(6), +(+f.lon).toFixed(6), Math.round(f.acc || 0), f.spd != null ? Math.round(f.spd) : -1]); LVT.dirty = true; } } } catch (e) {}
            return r;
        });
        // Smena topshirilgandan keyin ham yuborilmagan yoʻl saqlanadi va server topilganda yuboriladi
        if (typeof trkFlush === 'function') trkFlush = agmkExtend('trkFlush', 'v3.10: navbat telefon xotirasida', trkFlush, o => async function () {
            const sm = mySmena(); LVT.dirty = true;
            if (sm || !MS.tq.length) { const r = await o.apply(this, arguments); lvtSave(); return r; }
            const q = LVT.q; if (!q || !q.uid) return; const pts = MS.tq.splice(0, 1500);
            try { if (!syncReady()) throw 0; await sbFetch('/api/trk/v1', { method: 'POST', body: { uid: String(q.uid), unit: q.unit, day: msDay(pts[0][0]), pts: pts } }); } catch (e) { MS.tq = pts.concat(MS.tq).slice(-20000); }
            lvtSave();
        });
        window.addEventListener('agmk:login', () => setTimeout(() => { try { if (MS.tq && MS.tq.length) trkFlush(); } catch (e) {} }, 5000));
        // Batareya (BFF kabi) — joylashuv bilan birga
        var LVB = { bat: null, chg: false };
        try { if (navigator.getBattery) navigator.getBattery().then(b => { const u = () => { LVB.bat = Math.round(b.level * 100); LVB.chg = !!b.charging; }; u(); b.addEventListener('levelchange', u); b.addEventListener('chargingchange', u); }).catch(() => {}); } catch (e) {}
        if (typeof sbFetch === 'function') sbFetch = agmkExtend('sbFetch', 'v3.10: batareya va GPS holati', sbFetch, o => function (path, opt) {
            try { if (path === '/api/pos/v1' && opt && opt.method === 'POST' && opt.body && opt.body.lat !== undefined) { const b = Object.assign({}, opt.body); if (LVB.bat != null) { b.bat = LVB.bat; b.chg = LVB.chg ? 1 : 0; } if (typeof gpsNat === 'function' && gpsNat()) { const s = gpsSt(); b.gps = s.gps === false ? 0 : 1; } if (MS.fix && MS.fix.t) b.ft = MS.fix.t; opt = Object.assign({}, opt, { body: b }); } } catch (e) {}
            return o.call(this, path, opt);
        });
        // Smena kartochkasi: GPS holati, «🗺 Xaritada koʻrish», kim koʻradi
        function mashSmenaExtra() {
            if (MS.tab !== 'smena') return; const sm = mySmena(), g = document.querySelector('#screen-mash .ms-gps'); if (!sm || !g || $id('msGpsX')) return;
            let on = MS.watch !== null && MS.watch !== undefined, st = null; if (typeof gpsNat === 'function' && gpsNat()) { st = gpsSt(); on = !!st.on; }
            const srv = typeof syncReady === 'function' && syncReady() && !(typeof OFF !== 'undefined' && OFF.on), q = (MS.tq || []).length;
            const d = document.createElement('div'); d.id = 'msGpsX'; d.className = 'ms-gpsx';
            d.innerHTML = `<div class="${on ? 'ok' : 'bad'}">${on ? '🛰 GPS yoqilgan' : '⚠️ GPS ishlamayapti'}${st && st.gps === false ? ' — telefonda joylashuv oʻchirilgan' : ''} · ${LVT.pts.length} nuqta yozildi</div>
                <div class="${srv ? 'ok' : 'warn'}">${srv ? '📡 Server bilan — rahbariyat jonli koʻradi' : '📴 Server yoʻq — ' + q + ' nuqta telefonda navbatda, server topilganda yuboriladi'}</div>
                <button class="action-btn sec" onclick="mashTab('live')">🗺 Xaritada koʻrish</button>
                <small>👁 Sizni rahbariyat va dispetcher koʻradi — faqat smena davomida. Smenani topshirganingizda GPS oʻzi oʻchadi.</small>`;
            g.parentNode.insertBefore(d, g.nextSibling);
        }

        // ---------------------------------------------------------------- 12) 📡 JONLI XARITA (BFF uslubida)
        var LV2 = { mk: {}, cl: null, P: [], me: null, prevZ: {}, ev: [], alerted: {}, sel: null, fit: true, zKey: 'agmk_geozones' };
        function lvZones() { const z = kvGet(LV2.zKey, []); return Array.isArray(z) ? z : []; }
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(LV2.zKey)) KV_SYNC.keys.push(LV2.zKey); } catch (e) {}
        function lvPlaces() {
            if (LV2.pl) return LV2.pl; const L = [];
            try { const G = getInfGeo(); Object.keys(G).forEach(id => { const o = INFRA_BY[id], ll = G[id]; if (o && ll) L.push({ n: infraShort(o), lat: +ll[0], lon: +ll[1] }); }); } catch (e) {}
            try { (OSM_RAIL.s || []).forEach(s => { if (!L.some(x => x.n === s[0])) L.push({ n: s[0], lat: s[1], lon: s[2] }); }); } catch (e) {}
            return (LV2.pl = L);
        }
        // {n, z: true — belgilangan joy ichida}
        function lvPlace(lat, lon) {
            if (lat == null) return null;
            for (const z of lvZones()) if (geoDist([lat, lon], [z.lat, z.lon]) <= (z.r || 300)) return { n: z.n, z: true, id: z.id };
            let b = null, bd = 1e9; lvPlaces().forEach(p => { const d = geoDist([lat, lon], [p.lat, p.lon]); if (d < bd) { bd = d; b = p; } });
            return b && bd < 2500 ? { n: b.n + (bd < 400 ? '' : ' yonida'), z: false } : null;
        }
        function lvPark() { return (typeof MS !== 'undefined' && MS.park) || 'rail'; }
        function lvSrv() { return typeof syncReady === 'function' && syncReady() && !!((syncGet(SYNC_SES, null) || {}).access) && !(typeof OFF !== 'undefined' && OFF.on); }
        function lvSelf() {
            const sm = mySmena(), f = MS.fix; if (!sm || !f) return null; const u = msUnit(sm.unitId);
            return { tabel: meTabel(), name: currentUser.name, lat: f.lat, lon: f.lon, acc: f.acc, spd: f.spd != null ? f.spd : null, brg: f.brg, unit: sm.unitName, uid: String(sm.unitId), kind: sm.kind, model: u ? [u.marka, u.model].filter(Boolean).join(' ') : '', lav: msLav(), bat: LVB.bat, chg: LVB.chg ? 1 : 0, ago: Math.round((Date.now() - (f.t || Date.now())) / 1000), self: 1 };
        }
        async function lvData() {
            let P = [];
            if (lvSrv()) { try { P = (await msPosLoad(true)) || []; } catch (e) { P = []; } }
            const all = typeof nsResp === 'function' && nsResp(); if (!all) P = P.filter(p => p.tabel === meTabel());
            const me = lvSelf(); if (me) { P = P.filter(p => p.tabel !== me.tabel); P.push(me); }
            const park = lvPark(); return P.filter(p => parkOfKind(p.kind || ((msUnit(+p.uid) || msUnit(p.uid) || {}).kind)) === park);
        }
        function lvSt(p) { if (p.sos) return 'sos'; if (p.ago > 300) return 'old'; return (p.spd || 0) >= 3 ? 'mov' : 'stop'; }
        function lvAgoT(s) { s = Math.max(0, Math.round(s || 0)); return s < 60 ? 'hozirgina' : s < 3600 ? Math.floor(s / 60) + ' daq oldin' : Math.floor(s / 3600) + ' soat ' + (Math.floor(s / 60) % 60) + ' daq oldin'; }
        function lvDist(p) { if (!LV2.me || p.self) return ''; const d = geoDist([LV2.me.lat, LV2.me.lon], [p.lat, p.lon]); return d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'; }
        function lvBat(p) { if (p.bat == null) return ''; return `<i class="lv-bat${p.bat <= 20 && !p.chg ? ' low' : ''}">${p.chg ? '⚡' : '🔋'}${p.bat}%</i>`; }
        function lvIcK(p) { const k = p.kind || ((msUnit(+p.uid) || msUnit(p.uid) || {}).kind); return k === 'lok' ? '🚂' : k === 'avto' ? '🚜' : k === 'yol' ? '🛤️' : '📍'; }
        function lvFlag(p) { if (p.sos) return '🆘 Nosozlik signali'; if (p.gps === 0) return '📵 Telefonda GPS oʻchirilgan'; if (p.ago > 600) return '🔌 Signal yoʻq ' + lvAgoT(p.ago) + ' (telefon oʻchgan yoki internet yoʻq)'; if (p.bat != null && p.bat <= 15 && !p.chg) return '🔋 Batareya kam: ' + p.bat + '%'; return ''; }
        lvRender = function () {
            const b = secBody('screen-mash'); if (!b) return; const srv = lvSrv(), all = typeof nsResp === 'function' && nsResp(), park = lvPark();
            b.innerHTML = `<div class="lv-wrap">${!srv ? `<div class="lv-off">📴 Server ulanmagan — faqat oʻzingiz koʻrinasiz. Boshqalar server orqali koʻrinadi.</div>` : !all ? `<div class="lv-off ok">👤 Siz faqat oʻzingizni koʻrasiz. Hammani rahbariyat va dispetcher koʻradi.</div>` : ''}
                <div id="lvEv" class="lv-ev"></div>
                <div class="lv-mapw"><div id="lvMap" class="lv-map"></div><button class="lv-fab me" onclick="lvMe()" title="Oʻzimga">◎</button><button class="lv-fab all" onclick="LV2.fit=true; lvDraw()" title="Hammasi">⤢</button>${isAdmin() ? `<button class="lv-fab zn" onclick="lvZonesOpen()" title="Joylar">📍</button>` : ''}</div>
                <div class="lv-leg"><i class="mov"></i>harakatda <i class="stop"></i>toʻxtagan <i class="old"></i>signal yoʻq <i class="sos"></i>🆘</div>
                <div class="lv-sheet"><input id="lvQ" class="search-box" placeholder="🔍 Ism, tabel, texnika…" oninput="LV.q=this.value; lvList()"><div id="lvCard"></div><div id="lvList"><div class="hs-ok">⏳ Yuklanmoqda…</div></div></div></div>`;
            LV2.mk = {}; LV2.fit = true; LV2.sel = null;
            setTimeout(() => { lvMapInit(); lvTick(); }, 30); lvStop(); LV.t = setInterval(() => { if (MS.tab !== 'live' || !$id('lvMap')) { lvStop(); return; } lvTick(); }, 10000);
            try { if (navigator.geolocation && !mySmena()) navigator.geolocation.getCurrentPosition(p => { LV2.me = { lat: p.coords.latitude, lon: p.coords.longitude }; lvList(); }, () => {}, { timeout: 8000, maximumAge: 120000 }); } catch (e) {}
        };
        lvMapInit = function () {
            const el = $id('lvMap'); if (!el || typeof L === 'undefined') return; if (LV.map) { try { LV.map.remove(); } catch (e) {} }
            const m = LV.map = L.map(el, { zoomControl: false, attributionControl: true }).setView([40.86, 69.6], 12); m.attributionControl.setPrefix(false);
            L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
            try { if (lvPark() === 'rail' && typeof osmPolys === 'function') { m.createPane('lvRail').style.zIndex = 350; osmPolys(m, { pane: 'lvRail' }).addTo(m); } } catch (e) {}
            try { m.createPane('lvZn').style.zIndex = 360; lvZones().forEach(z => L.circle([z.lat, z.lon], { radius: z.r || 300, pane: 'lvZn', color: '#a78bfa', weight: 1.5, fillOpacity: .08, interactive: false }).bindTooltip(z.n, { permanent: false }).addTo(m)); } catch (e) {}
            LV.trl = L.layerGroup().addTo(m); LV.lay = L.layerGroup().addTo(m); LV2.cl = L.layerGroup().addTo(m); LV2.mk = {};
            m.on('zoomend', () => lvDraw());
        };
        lvTick = async function () {
            const P = await lvData(); LV.P = P; LV2.P = P; const me = P.find(p => p.self); if (me) LV2.me = { lat: me.lat, lon: me.lon };
            lvEvents(P); lvDraw(); lvList(); if (LV2.sel) lvCard(LV2.sel, true);
        };
        function lvSnapP(p) { try { if ((p.kind || '') !== 'avto' && typeof osmSnap === 'function') { const s = osmSnap(p.lat, p.lon, Math.max(25, (p.acc || 0) * 0.8)); if (s && !s.off) return [s.lat, s.lon]; } } catch (e) {} return [p.lat, p.lon]; }
        function lvAnim(mk, to) {
            const fr = mk.getLatLng(); if (!fr || (Math.abs(fr.lat - to[0]) < 1e-7 && Math.abs(fr.lng - to[1]) < 1e-7)) return; const t0 = performance.now(), D = 900;
            const step = t => { const k = Math.min(1, (t - t0) / D), e = k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k; mk.setLatLng([fr.lat + (to[0] - fr.lat) * e, fr.lng + (to[1] - fr.lng) * e]); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
        }
        function lvIconHtml(p) {
            const E = escapeHtml, st = lvSt(p), arr = p.brg != null && st === 'mov' ? `<b class="lv-arr" style="transform:rotate(${+p.brg}deg)">▲</b>` : '';
            return `<div class="lv-mk ${st}${LV2.sel === p.tabel ? ' sel' : ''}${p.self ? ' self' : ''}" onclick="lvCard('${E(p.tabel)}')">${arr}<span class="lv-av">${E(lvIni(p.name))}</span><span class="lv-u">${lvIcK(p)}</span><small>${p.self ? 'Siz' : E(String(p.name || '').split(' ')[0])}${st === 'mov' && p.spd != null ? ' · ' + Math.round(p.spd) + ' km/soat' : ''}${p.bat != null && p.bat <= 20 && !p.chg ? ' · 🔋' + p.bat + '%' : ''}</small></div>`;
        }
        lvDraw = function () {
            const m = LV.map; if (!m || !LV.lay) return; const P = LV2.P || [], B = [], z = m.getZoom(), seen = {};
            // Guruhlash: yaqin turganlar (ekranda 46 px) — «+N»
            const pts = P.map(p => ({ p: p, ll: lvSnapP(p) })); pts.forEach(x => { x.px = m.latLngToContainerPoint(x.ll); B.push(x.ll); });
            const groups = []; if (z < 16) pts.forEach(x => { const g = groups.find(g => g.px.distanceTo(x.px) < 46); if (g) g.m.push(x); else groups.push({ px: x.px, m: [x] }); }); else pts.forEach(x => groups.push({ px: x.px, m: [x] }));
            LV2.cl.clearLayers();
            groups.forEach(g => {
                if (g.m.length > 1 && !g.m.some(x => x.p.tabel === LV2.sel)) { const ll = g.m[0].ll, sos = g.m.some(x => x.p.sos); L.marker(ll, { icon: L.divIcon({ className: 'lv-ic', html: `<div class="lv-cl${sos ? ' sos' : ''}">+${g.m.length}</div>`, iconSize: [0, 0] }), zIndexOffset: 800 }).on('click', () => { try { m.fitBounds(g.m.map(x => x.ll), { padding: [60, 60], maxZoom: 17 }); } catch (e) {} }).addTo(LV2.cl); g.m.forEach(x => { x.hide = 1; }); }
            });
            pts.forEach(x => { const t = x.p.tabel; seen[t] = 1; let mk = LV2.mk[t];
                if (x.hide) { if (mk) { LV.lay.removeLayer(mk); delete LV2.mk[t]; } return; }
                const ic = L.divIcon({ className: 'lv-ic', html: lvIconHtml(x.p), iconSize: [0, 0] });
                if (!mk) { mk = LV2.mk[t] = L.marker(x.ll, { icon: ic, zIndexOffset: x.p.sos ? 1000 : x.p.self ? 900 : 500 }).addTo(LV.lay); } else { mk.setIcon(ic); lvAnim(mk, x.ll); } });
            Object.keys(LV2.mk).forEach(t => { if (!seen[t]) { LV.lay.removeLayer(LV2.mk[t]); delete LV2.mk[t]; } });
            if (LV2.fit && B.length) { LV2.fit = false; try { B.length === 1 ? m.setView(B[0], 15) : m.fitBounds(B, { padding: [50, 50], maxZoom: 16 }); } catch (e) {} }
        };
        function lvMe() { const me = (LV2.P || []).find(p => p.self); const t = me ? lvSnapP(me) : LV2.me ? [LV2.me.lat, LV2.me.lon] : null; if (!t || !LV.map) { showToast('📍 Joylashuvingiz hali aniqlanmadi'); return; } LV.map.flyTo(t, 16, { duration: .6 }); }
        lvList = function () {
            const box = $id('lvList'); if (!box) return; const E = escapeHtml, q = gsFold(LV.q || '');
            const L0 = (LV2.P || []).filter(p => !q || gsFold([p.name, p.tabel, p.unit, p.model, p.lav].join(' ')).includes(q)).sort((a, b) => (b.self ? 1 : 0) - (a.self ? 1 : 0) || (a.sos ? 0 : 1) - (b.sos ? 0 : 1) || (a.ago || 0) - (b.ago || 0));
            box.innerHTML = L0.length ? L0.map(p => { const st = lvSt(p), pl = lvPlace(p.lat, p.lon), fl = lvFlag(p), ds = lvDist(p);
                return `<div class="lv-row ${st}" onclick="lvCard('${E(p.tabel)}', false, true)"><span class="lv-av">${E(lvIni(p.name))}</span><div><b>${p.self ? 'Siz — ' : ''}${E(p.name)}</b><small>${lvIcK(p)} ${E(p.unit || '')}${pl ? ' · 📍 ' + E(pl.n) : ''}</small>${fl ? `<small class="lv-fl">${E(fl)}</small>` : `<small>${E(p.lav || '')}</small>`}</div><em>${st === 'mov' ? Math.round(p.spd || 0) + ' km/soat' : st === 'sos' ? '🆘' : st === 'old' ? '⚪' : '⏸'}<small>${lvAgoT(p.ago)}</small>${ds ? `<small>📏 ${ds}</small>` : ''}${lvBat(p)}</em></div>`; }).join('')
                : `<div class="hs-ok">${lvSrv() ? 'Hozir smenada GPS yuborayotgan ' + (lvPark() === 'rail' ? 'mashinist' : 'haydovchi') + ' yoʻq.' : 'Server ulanmagan.'}<br><small>${mySmena() ? 'Sizning joylashuvingiz GPS signali kelishi bilan chiqadi.' : 'Texnika qabul qilinishi bilan shu yerda koʻrinadi.'}</small></div>${lvPark() === 'rail' ? `<div class="ms-b2" style="margin-top:6px"><button onclick="bfStart()">🧪 Temir yoʻl demo</button></div>` : `<div class="ms-b2" style="margin-top:6px"><button onclick="rdStart()">🧪 Avtotraktor demo</button></div>`}`;
        };
        // Bugungi yoʻl: nuqtalar (server: jonli iz + trayektoriya; telefon: oʻz izim)
        async function lvTrailPts(p) {
            let A = [];
            if (p.self) A = LVT.pts.map(x => [x[0], x[1], x[2], x[3]]);
            if (lvSrv()) {
                try { (await sbFetch('/api/pos/v1/trail?tabel=' + encodeURIComponent(p.tabel)) || []).forEach(x => A.push([x[0] < 1e11 ? x[0] * 1000 : x[0], x[1], x[2], x[3]])); } catch (e) {}
                try { if (p.uid) (await sbFetch('/api/trk/v1?uid=' + encodeURIComponent(p.uid) + '&day=' + msDay()) || []).forEach(r => (r.pts || r.p || []).forEach(x => A.push([x[0] < 1e11 ? x[0] * 1000 : x[0], x[1], x[2], x[3]]))); } catch (e) {}
            }
            const s = new Set(); A = A.filter(x => x && isFinite(x[1]) && !s.has(x[0]) && s.add(x[0])); A.sort((a, b) => a[0] - b[0]);
            const t0 = new Date(); t0.setHours(0, 0, 0, 0); return A.filter(x => x[0] >= t0.getTime() - 6 * 3600e3);
        }
        function lvTimeline(A) {
            const out = []; if (!A.length) return out; const hm = t => msHM(new Date(t).toISOString());
            const pl0 = lvPlace(A[0][1], A[0][2]); out.push({ t: hm(A[0][0]), s: 'Smena boshlandi' + (pl0 ? ' — ' + pl0.n : '') , ic: '🟢' });
            let i = 0;
            while (i < A.length) {
                let j = i; while (j + 1 < A.length && geoDist([A[i][1], A[i][2]], [A[j + 1][1], A[j + 1][2]]) < 90) j++;
                const dur = (A[j][0] - A[i][0]) / 60000;
                if (dur >= 3) { const pl = lvPlace(A[i][1], A[i][2]); out.push({ t: hm(A[i][0]) + '–' + hm(A[j][0]), s: (pl ? pl.n : 'Toʻxtash') + ' · ' + Math.round(dur) + ' daq', ic: '⏸' }); i = j + 1; }
                else i++;
            }
            const L0 = A[A.length - 1], pl = lvPlace(L0[1], L0[2]); out.push({ t: hm(L0[0]), s: 'Oxirgi joyi' + (pl ? ' — ' + pl.n : ''), ic: '📍' });
            let km = 0; for (let k = 1; k < A.length; k++) { const d = geoDist([A[k - 1][1], A[k - 1][2]], [A[k][1], A[k][2]]); if (d < 3000) km += d; } out.km = Math.round(km / 100) / 10;
            return out;
        }
        lvCard = async function (tabel, quiet, fly) {
            const p = (LV2.P || []).find(x => x.tabel === tabel), box = $id('lvCard'); if (!box) return; if (!p) { box.innerHTML = ''; LV2.sel = null; return; }
            LV2.sel = tabel; const E = escapeHtml, st = lvSt(p), x = (findXodimsByTabel(tabel)[0] || {}).item || {}, pl = lvPlace(p.lat, p.lon), fl = lvFlag(p), ds = lvDist(p);
            box.innerHTML = `<div class="lv-card ${st}"><div class="lv-ch"><span class="lv-av big">${E(lvIni(p.name))}</span><div><b>${p.self ? 'Siz — ' : ''}${E(p.name)}</b><small>${E(p.lav || x.lavozim || '')}</small></div><button class="mini-btn" onclick="LV2.sel=null; $id('lvCard').innerHTML=''; LV.trl && LV.trl.clearLayers(); lvDraw()">✕</button></div>
                ${fl ? `<div class="lv-flag">${E(fl)}</div>` : ''}
                <div class="lv-kv"><span>${lvIcK(p)} Texnika</span><b>${E(p.unit || '—')}${p.model ? '<small>' + E(p.model) + '</small>' : ''}</b>
                <span>📍 Joyi</span><b id="lvPl">${pl ? E(pl.n) : (+p.lat).toFixed(5) + ', ' + (+p.lon).toFixed(5)}</b>
                <span>⚡ Holat</span><b>${st === 'mov' ? 'Harakatda · ' + Math.round(p.spd || 0) + ' km/soat' : st === 'stop' ? 'Toʻxtagan' : st === 'sos' ? '🆘 Nosozlik signali' : 'Signal yoʻq'}</b>
                <span>🕒 Yangilangan</span><b>${lvAgoT(p.ago)} · ±${Math.round(p.acc || 0)} m</b>${p.bat != null ? `<span>🔋 Batareya</span><b>${p.bat}%${p.chg ? ' · quvvatlanmoqda' : ''}</b>` : ''}${ds ? `<span>📏 Sizdan</span><b>${ds}</b>` : ''}</div>
                <div class="lv-btns">${x.phone && !p.self ? `<button onclick="location.href='${telHref(x.phone)}'">📞<small>Qoʻngʻiroq</small></button>` : ''}${!p.self ? `<button onclick='openChats(${JSON.stringify({ name: p.name, role: p.lav || x.lavozim || "", tabel: p.tabel, phone: x.phone || "" }).replace(/'/g, "&#39;")})'>💬<small>Yozish</small></button>` : ''}<button onclick="lvTrail('${E(tabel)}')">〰️<small>Bugungi yoʻl</small></button><button onclick="lvNav(${+p.lat},${+p.lon})">🧭<small>Yandex</small></button>${p.uid ? `<button onclick="openPassport(${JSON.stringify(+p.uid || p.uid)})">📄<small>Pasport</small></button>` : ''}</div>
                <div id="lvTl"></div></div>`;
            if (fly && LV.map) try { LV.map.flyTo(lvSnapP(p), Math.max(LV.map.getZoom(), 16), { duration: .6 }); } catch (e) {}
            if (!quiet) lvDraw();
        };
        lvTrail = async function (tabel) {
            const p = (LV2.P || []).find(x => x.tabel === tabel); if (!p || !LV.map || !LV.trl) return; LV.trl.clearLayers();
            const A = await lvTrailPts(p), tl = $id('lvTl');
            if (A.length < 2) { if (tl) tl.innerHTML = '<div class="hs-ok">〰️ Bugun hali yoʻl yozilmagan.</div>'; return; }
            const pts = A.map(x => lvSnapP({ lat: x[1], lon: x[2], acc: x[3], kind: p.kind })); L.polyline(pts, { color: '#38bdf8', weight: 4, opacity: .85 }).addTo(LV.trl);
            L.circleMarker(pts[0], { radius: 6, color: '#22c55e', fillOpacity: 1 }).bindTooltip('Smena boshi').addTo(LV.trl);
            const T = lvTimeline(A); T.filter(x => x.ic === '⏸').forEach((x, i) => { const k = A.findIndex(a => msHM(new Date(a[0]).toISOString()) === x.t.split('–')[0]); if (k >= 0) L.circleMarker(pts[k], { radius: 5, color: '#eab308', fillOpacity: .9 }).bindTooltip(x.s).addTo(LV.trl); });
            if (tl) tl.innerHTML = `<div class="lv-tl"><div class="lv-tlh">〰️ Bugungi yoʻl · ${T.km} km</div>${T.map(x => `<div><i>${x.ic}</i><b>${escapeHtml(x.t)}</b><span>${escapeHtml(x.s)}</span></div>`).join('')}</div>`;
            try { LV.map.fitBounds(pts, { padding: [40, 40] }); } catch (e) {}
        };
        function lvNav(lat, lon) { const u = 'yandexnavi://build_route_on_map?lat_to=' + lat + '&lon_to=' + lon, w = 'https://yandex.uz/maps/?rtext=~' + lat + ',' + lon + '&rtt=auto';
            try { if (window.AgmkNative && AgmkNative.openExternal) { AgmkNative.openExternal(u); setTimeout(() => { if (!document.hidden) AgmkNative.openExternal(w); }, 1500); return; } } catch (e) {} window.open(w, '_blank'); }
        // Joylar (geozona) — administrator belgilaydi; kirish/chiqish xabarlari
        function lvZonesOpen() {
            if (!isAdmin()) return; const Z = lvZones(), E = escapeHtml;
            mdl('lvZn', `<div class="px-h"><b>📍 Joylar (depo, karyer, stansiya…)</b><button class="mini-btn" onclick="mdlClose('lvZn')">✕</button></div>
                <div class="nd-tip">Xodim shu joyga kirsa yoki chiqsa — dispetcherga xabar boradi. Yangi joy: xaritani joyga olib boring (markazda) va «➕» bosing.</div>
                ${Z.map((z, i) => `<div class="lv-zr"><b>${E(z.n)}</b><small>${z.r || 300} m</small><button class="mini-btn" onclick="lvZoneDel(${i})">🗑</button></div>`).join('') || '<div class="hs-ok">Hali joy belgilanmagan.</div>'}
                <button class="action-btn" onclick="lvZoneAdd()">➕ Xarita markazini joy qilish</button>`, true);
        }
        async function lvZoneAdd() { if (!LV.map) return; const c = LV.map.getCenter(), n = await uiPrompt('Joy nomi (masalan «Karyer», «Lokomotiv deposi»):', ''); if (!n) return; const r = +(await uiPrompt('Radiusi, metr:', '300')) || 300;
            const Z = lvZones(); Z.push({ id: 'z' + Date.now().toString(36), n: String(n).slice(0, 60), lat: +c.lat.toFixed(6), lon: +c.lng.toFixed(6), r: Math.max(50, Math.min(5000, r)) }); kvSet(LV2.zKey, Z); try { KV_SYNC.dirty = true; storePush(); } catch (e) {} lvMapInit(); lvTick(); lvZonesOpen(); }
        function lvZoneDel(i) { const Z = lvZones(); Z.splice(i, 1); kvSet(LV2.zKey, Z); try { KV_SYNC.dirty = true; storePush(); } catch (e) {} lvMapInit(); lvTick(); lvZonesOpen(); }
        function lvEvents(P) {
            if (!(typeof nsResp === 'function' && nsResp())) return; const now = Date.now();
            P.forEach(p => { if (p.self) return; const z = lvPlace(p.lat, p.lon), zid = z && z.z ? z.n : '', prev = LV2.prevZ[p.tabel];
                if (prev !== undefined && prev !== zid) { const nm = String(p.name || '').split(' ')[0]; lvEv(zid ? `${lvIcK(p)} ${nm} — «${zid}»ga yetib keldi` : `${lvIcK(p)} ${nm} — «${prev}»dan chiqdi`, p.tabel); }
                LV2.prevZ[p.tabel] = zid;
                if (p.bat != null && p.bat <= 15 && !p.chg && !LV2.alerted['b' + p.tabel]) { LV2.alerted['b' + p.tabel] = now; lvEv(`🔋 ${p.name}: batareya ${p.bat}%`, p.tabel); }
                if (p.ago > 900 && !LV2.alerted['s' + p.tabel]) { LV2.alerted['s' + p.tabel] = now; lvEv(`🔌 ${p.name}: ${Math.round(p.ago / 60)} daqiqadan beri signal yoʻq`, p.tabel); }
                if (p.ago < 300) delete LV2.alerted['s' + p.tabel]; });
        }
        function lvEv(t, tabel) {
            LV2.ev.unshift({ t: t, at: Date.now(), tabel: tabel }); LV2.ev = LV2.ev.slice(0, 20); try { navigator.vibrate && navigator.vibrate(120); } catch (e) {} showToast(t);
            const b = $id('lvEv'); if (b) b.innerHTML = LV2.ev.slice(0, 3).map(e => `<div onclick="lvCard('${escapeHtml(e.tabel)}', false, true)">${escapeHtml(e.t)} <small>${msHM(new Date(e.at).toISOString())}</small></div>`).join('');
        }
        // «Jonli xarita» yorligʻi hamma uchun (oʻzini koʻrish), roʻyxat — masʼullarga
        if (typeof mashRender === 'function') mashRender = agmkExtend('mashRender', 'v3.10: jonli xarita yorligʻi hammaga', mashRender, o => function () {
            if (MS.tab === 'live') { const pk = MS.park || 'rail', tabs = [['smena', (pk === 'avto' ? '🚜' : '🚂') + ' Mening smenam'], ['nosoz', '🆘 Nosozliklar'], ['live', '📡 Jonli xarita']].concat(nsResp() ? [['xodim', '👥 Smenadagilar'], ['fuel', '⛽ Yoqilgʻi']] : []);
                secTabs('screen-mash', tabs, 'live', 'mashTab'); try { const h = document.querySelector('#screen-mash .sec-title'); if (h) h.textContent = PARK[pk].ic + ' ' + PARK[pk].t; } catch (e) {} lvRender(); return; }
            const r = o.apply(this, arguments);
            try { if ((MS.park || 'rail') === 'avto') document.querySelectorAll('#screen-mash .sec-tabs i').forEach(i => { if (/Mening smenam/.test(i.textContent)) i.textContent = '🚜 Mening smenam'; }); } catch (e) {}
            try { const t = document.querySelector('#screen-mash .sec-tabs'); if (t && !t.querySelector('[data-lv]') && MS.tab !== 'live') { const i = document.createElement('i'); i.dataset.lv = 1; i.textContent = '📡 Jonli xarita'; i.onclick = () => mashTab('live'); t.insertBefore(i, t.children[2] || null); } } catch (e) {}
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = `
            .ms-gpsx{margin:6px 0 2px;display:flex;flex-direction:column;gap:5px;font-size:12.5px}.ms-gpsx div{padding:6px 9px;border-radius:9px;background:rgba(15,23,42,.8);border:1px solid #334155}.ms-gpsx .ok{border-color:#16a34a;color:#bbf7d0}.ms-gpsx .bad{border-color:#dc2626;color:#fecaca}.ms-gpsx .warn{border-color:#f59e0b;color:#fde68a}.ms-gpsx small{color:#94a3b8}
            .lv-off{padding:8px 11px;border-radius:10px;background:rgba(124,45,18,.85);border:1px solid #fb923c;color:#fff;font-size:12.5px}.lv-off.ok{background:rgba(30,58,138,.85);border-color:#60a5fa}
            .lv-ev{display:flex;flex-direction:column;gap:4px}.lv-ev div{padding:6px 10px;border-radius:9px;background:rgba(88,28,135,.85);border:1px solid #a78bfa;color:#fff;font-size:12.5px;cursor:pointer}.lv-ev small{opacity:.7}
            .lv-mapw{position:relative}.lv-fab{position:absolute;right:10px;z-index:500;width:40px;height:40px;border-radius:50%;border:0;background:#fff;color:#0f172a;font-size:19px;box-shadow:0 3px 10px rgba(0,0,0,.4)}.lv-fab.me{bottom:12px}.lv-fab.all{bottom:58px;font-size:17px}.lv-fab.zn{bottom:104px;font-size:16px}
            .lv-mk.self .lv-av{background:#7c3aed!important}.lv-cl{transform:translate(-50%,-50%);min-width:44px;height:44px;border-radius:50%;background:#1e40af;border:3px solid #fff;color:#fff;font:800 15px/38px system-ui;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.45);cursor:pointer}.lv-cl.sos{background:#dc2626}
            .lv-bat{display:block;font-style:normal;font-size:11px;color:#86efac}.lv-bat.low{color:#fca5a5}.lv-fl{color:#fca5a5!important}.lv-flag{margin:8px 0 0;padding:6px 9px;border-radius:9px;background:rgba(127,29,29,.7);border:1px solid #ef4444;color:#fee2e2;font-size:12.5px}
            .lv-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.lv-btns button{flex:1;min-width:58px;padding:8px 4px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:18px;display:flex;flex-direction:column;align-items:center;gap:2px}.lv-btns small{font-size:10.5px;color:#cbd5e1}
            .lv-tl{margin-top:8px;padding:8px;border-radius:10px;background:#0f172a;border:1px solid #334155}.lv-tlh{font-weight:700;color:#93c5fd;margin-bottom:4px}.lv-tl div{display:grid;grid-template-columns:22px auto 1fr;gap:6px;font-size:12.5px;padding:3px 0;color:#e2e8f0}.lv-tl b{color:#fbbf24;font-weight:700;white-space:nowrap}.lv-tl i{font-style:normal}
            .lv-zr{display:flex;gap:8px;align-items:center;padding:7px 4px;border-bottom:1px solid #334155}.lv-zr b{flex:1}.lv-zr small{color:#94a3b8}`; document.head.appendChild(st); })();

        // ---------------------------------------------------------------- 6–9) TAHRIRLASH HUQUQLARI
        //  Koʻrish — hamma; tahrirlash — faqat biriktirilganlar. Rollarni administrator «👥 Rollar va huquqlar»da oʻzgartiradi.
        try { if (typeof ROLE_DEF !== 'undefined') [['tx_vag', '🚃', 'Vagon pasportlari', 'Vagonlar pasportini tahrirlaydi'], ['tx_avto', '🚜', 'Avtotraktor pasportlari', 'Avtotraktor texnikasi pasportini tahrirlaydi'], ['tx_teplo', '🛢', 'Teplovoz pasportlari', 'Teplovozlar pasportini tahrirlaydi'], ['tx_moto', '🚃', 'Motovoz pasportlari', 'Motovozlar pasportini tahrirlaydi'], ['tx_el', '⚡', 'Elektrovoz pasportlari', 'Elektrovoz va tortuv agregatlari pasportini tahrirlaydi'], ['tx_yol', '🛤', 'Yoʻl texnikasi pasportlari', 'Drezina, rels ustidagi kran, yoʻl mashinalari va infratuzilma pasportini tahrirlaydi'], ['xarita', '🗺', 'Temir yoʻl xaritasi', 'Xarita va sxema bogʻlanishini oʻzgartiradi']].forEach(r => { if (!ROLE_DEF.some(x => x[0] === r[0])) ROLE_DEF.push(r); }); } catch (e) {}
        try { if (typeof KIR_GR !== 'undefined') Object.assign(KIR_GR, { TX_VAG: ['tx_vag'], TX_AVTO: ['tx_avto'], TX_TEPLO: ['tx_teplo'], TX_MOTO: ['tx_moto'], TX_EL: ['tx_el'], TX_YOL: ['tx_yol'], XARITA: ['xarita'] }); } catch (e) {}
        function techSub(v) { if (!v) return null; if (!v.kind) return 'vag'; if (v.kind === 'avto') return 'avto'; if (v.kind === 'lok') return typeof hdKind === 'function' && hdKind(v) === 'el' ? 'el' : 'teplo'; if (v.kind === 'yol') return /motovoz|мотовоз/i.test([v.type, v.naim, v.marka].join(' ')) ? 'moto' : 'yol'; return 'yol'; }
        function techCanEdit(v) { if (isAdmin()) return true; const s = techSub(v); return !!s && hasRole('tx_' + s); }
        function techActive() { try { return vagonlarData.find(x => x.id === activeVagonId) || null; } catch (e) { return null; } }
        function techDeny(v) { const s = techSub(v), who = { vag: 'vagon', avto: 'avtotraktor', teplo: 'teplovoz', moto: 'motovoz', el: 'elektrovoz', yol: 'yoʻl texnikasi' }[s] || 'texnika'; alert('🔒 ' + who.charAt(0).toUpperCase() + who.slice(1) + ' pasportini faqat unga biriktirilgan muhandis tahrirlaydi. Siz koʻra olasiz.\n\nHuquqni administrator «👥 Rollar va huquqlar»da beradi.'); }
        ['openEditModal', 'savePassportChanges'].forEach(fn => { try { const o = window[fn]; if (typeof o !== 'function') return; window[fn] = function () { const v = techActive(); if (v && !techCanEdit(v)) { techDeny(v); return; } return o.apply(this, arguments); }; } catch (e) {} });
        if (typeof openPassport === 'function') openPassport = agmkExtend('openPassport', 'v3.10: pasport tahrirlash huquqi', openPassport, o => function () {
            const r = o.apply(this, arguments);
            try { const v = techActive(), can = v && techCanEdit(v); document.querySelectorAll('#screen-vagon-pasport [onclick^="openEditModal"]').forEach(b => { b.style.display = can ? '' : 'none'; }); } catch (e) {}
            return r;
        });
        // Temir yoʻl xaritasi — «xarita» roli (sxemani GPS ga bogʻlash, stansiya joyi)
        var ADM_AS = { n: 0 };
        (function () { const o = isAdmin; isAdmin = function () { return o.apply(this, arguments) || (ADM_AS.n > 0 && typeof hasRole === 'function' && rolesOf(meTabel()).includes('xarita')); }; })();
        ['ygCalStart', 'ygCalBar', 'ygCalHere', 'ygCalAdd', 'ygCalEnd', 'ygCalClear', 'ygCalDel', 'ygPanelHtml', 'renderInfraObj', 'infSetGeo'].forEach(fn => { try { const o = window[fn]; if (typeof o !== 'function') return;
            window[fn] = function () { ADM_AS.n++; let r; try { r = o.apply(this, arguments); } catch (e) { ADM_AS.n--; throw e; } if (r && typeof r.then === 'function') return r.finally(() => { ADM_AS.n--; }); ADM_AS.n--; return r; }; } catch (e) {} });
        // 7) Kadrlar: hamma kartochkani kadrlar; har kim oʻzinikini — lavozim, tabel, boʻlim, razryad va sanalardan tashqari
        function kadrCan() { return isAdmin() || hasRole('kadr'); }
        canEditXodim = function (item) { return kadrCan() || isOwnItem(item); };
        var XE_LOCK = ['xeName', 'xeTabel', 'xeRazryad', 'xePosNo', 'xeLavozimSearch', 'xeLavozim', 'xeSeh', 'xeBolim', 'xeKirgan'];
        if (typeof openXodimEdit === 'function') openXodimEdit = agmkExtend('openXodimEdit', 'v3.10: oʻz kartochkasi — himoyalangan maydonlar', openXodimEdit, o => function () {
            const r = o.apply(this, arguments);
            try { const lock = !kadrCan(); XE_LOCK.forEach(id => { const e = $id(id); if (e) { e.disabled = lock; e.style.opacity = lock ? .6 : ''; } }); const cmb = $id('xeCombo'); if (cmb) cmb.style.pointerEvents = lock ? 'none' : '';
                let n = $id('xeLockNote'); if (lock && !n) { n = document.createElement('div'); n.id = 'xeLockNote'; n.className = 'kir-note'; n.textContent = '🔒 F.I.Sh., tabel, lavozim, boʻlim, razryad va ishga kirgan sanani faqat kadrlar boʻlimi oʻzgartiradi. Siz telefon, rasm, oila va boshqa maʼlumotlaringizni tahrirlaysiz.'; const f = $id('xeName'); if (f && f.closest('.modal-content')) f.closest('.modal-content').insertBefore(n, f.closest('.modal-content').children[1] || null); } if (n) n.style.display = lock ? '' : 'none'; } catch (e) {}
            return r;
        });
        if (typeof saveXodimEdit === 'function') saveXodimEdit = agmkExtend('saveXodimEdit', 'v3.10: himoyalangan maydonlar oʻzgarmaydi', saveXodimEdit, o => function () {
            try { if (!kadrCan()) { const it = getActiveItem(); if (it) { const set = (id, v) => { const e = $id(id); if (e) e.value = v == null ? '' : v; }; set('xeName', it.name); set('xeTabel', it.tabel); set('xeRazryad', it.razryad >= 1 && it.razryad <= 15 ? String(it.razryad) : ''); set('xePosNo', it.posNo || ''); set('xeLavozim', it.lavozim && it.lavozim !== '—' ? it.lavozim : ''); set('xeLavozimSearch', it.lavozim && it.lavozim !== '—' ? it.lavozim : ''); set('xeSeh', it.seh || ''); set('xeBolim', it.bolim || ''); set('xeKirgan', it.kirganSana || ''); } } } catch (e) {}
            return o.apply(this, arguments);
        });
        // 8) Mehnat muhofazasi: xodim oʻz hujjatini yuklaydi → MM masʼuli tasdiqlaydi
        var MMQ = { key: 'agmk_mm_req' };
        function mmReqs() { const l = kvGet(MMQ.key, []); return Array.isArray(l) ? l : []; }
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(MMQ.key)) KV_SYNC.keys.push(MMQ.key); } catch (e) {}
        function mmReqOpen() {
            const it = getActiveItem(); if (!it || !isOwnItem(it)) return;
            mdl('mmReq', `<div class="px-h"><b>📎 MM hujjatini yuklash</b><button class="mini-btn" onclick="mdlClose('mmReq')">✕</button></div>
                <div class="nd-tip">Tibbiy koʻrik xulosasi, bilim sinovi bayonnomasi yoki yoʻl-yoʻriq varagʻining rasmini yuklang. <b>MM masʼuli tekshirib tasdiqlagach</b> muddat yangilanadi.</div>
                <div class="form-group"><label>Turi</label><select id="mqT"><option value="tibbiy">🩺 Tibbiy koʻrik</option><option value="bilim">📝 Bilim sinovi</option><option value="davriy">📋 Yoʻl-yoʻriq (davriy)</option></select></div>
                <div class="form-group"><label>Sanasi</label><input type="date" id="mqD" value="${todayISO()}"></div>
                <label class="action-btn sec" style="display:block;text-align:center">📷 Hujjat rasmi<input type="file" id="mqF" accept="image/*,application/pdf" style="display:none" onchange="$id('mqFn').textContent=this.files[0]?this.files[0].name:''"></label><small id="mqFn" style="color:#94a3b8"></small>
                <div class="pk-btns"><button onclick="mdlClose('mmReq')">Bekor</button><button class="pr" onclick="mmReqSend()">📤 Tasdiqlashga yuborish</button></div>`, true);
        }
        async function mmReqSend() {
            const it = getActiveItem(), f = ($id('mqF').files || [])[0], ty = $id('mqT').value, d = $id('mqD').value; if (!it || !d) { alert('Sanani kiriting.'); return; } if (!f) { alert('Hujjat rasmini tanlang.'); return; }
            let ref = null; try { ref = await storeImageBlob(f, null, authorStr()); } catch (e) { alert('⚠️ Rasm saqlanmadi: ' + agmkErrUz(e)); return; }
            const L = mmReqs(); L.push({ id: 'mq' + Date.now().toString(36), tabel: cleanTabel(it.tabel), name: it.name, ty: ty, d: d, img: ref, at: new Date().toISOString(), st: 'kutish' }); kvSet(MMQ.key, L); try { KV_SYNC.dirty = true; storePush(); } catch (e) {}
            mdlClose('mmReq'); showToast('📤 MM masʼuliga tasdiqlash uchun yuborildi');
        }
        function mmReqList() {
            if (!canMMEdit()) return; const E = escapeHtml, L = mmReqs().filter(x => x.st === 'kutish'), T = { tibbiy: '🩺 Tibbiy koʻrik', bilim: '📝 Bilim sinovi', davriy: '📋 Yoʻl-yoʻriq' };
            mdl('mmReqL', `<div class="px-h"><b>📥 Tasdiqlash kutilmoqda (${L.length})</b><button class="mini-btn" onclick="mdlClose('mmReqL')">✕</button></div>${L.map(x => `<div class="hs-row"><b>${E(x.name)} (${E(x.tabel)})</b><small>${T[x.ty] || x.ty} · ${E(fmtISO(x.d))} · yuborildi ${E(fmtDateTime(x.at))}</small>
                <div class="ms-b2"><button onclick="openImgFiles([{src:'${E(x.img)}'}],0)">👁 Hujjat</button><button onclick="mmReqOk('${x.id}',1)">✅ Tasdiqlash</button><button onclick="mmReqOk('${x.id}',0)">❌ Rad</button></div></div>`).join('') || '<div class="hs-ok">Kutilayotgan hujjat yoʻq.</div>'}`, true);
        }
        async function mmReqOk(id, yes) {
            if (!canMMEdit()) return; const L = mmReqs(), x = L.find(z => z.id === id); if (!x) return;
            if (yes) { const D = mmData(), r = D.recs[x.tabel] || {}; r.d = r.d || {}; r.d[x.ty] = x.d; r.upd = new Date().toISOString(); r.by = meTabel(); D.recs[x.tabel] = r; mmSave(D); x.st = 'ok'; }
            else { const why = await uiPrompt('Rad etish sababi:', ''); if (why === null) return; x.st = 'rad'; x.why = why; }
            x.ok = { by: meTabel(), at: new Date().toISOString() }; kvSet(MMQ.key, L); try { KV_SYNC.dirty = true; storePush(); } catch (e) {} mmReqList(); try { mmRender(); } catch (e) {} showToast(yes ? '✅ Tasdiqlandi' : '❌ Rad etildi');
        }
        if (typeof mmpOpen === 'function') mmpOpen = agmkExtend('mmpOpen', 'v3.10: oʻz hujjatini yuklash', mmpOpen, o => function () {
            const r = o.apply(this, arguments);
            try { const it = getActiveItem(), box = $id('mmpBoxM'); if (it && box && isOwnItem(it) && !canMMEdit()) { const mine = mmReqs().filter(x => x.tabel === cleanTabel(it.tabel)).slice(-3).reverse(); const d = document.createElement('div'); d.innerHTML = `<button class="action-btn sec" style="margin-top:8px" onclick="mmReqOpen()">📎 Hujjat yuklash (tasdiqlash uchun)</button>` + mine.map(x => `<small style="display:block;color:#94a3b8">${x.st === 'kutish' ? '⏳ kutilmoqda' : x.st === 'ok' ? '✅ tasdiqlandi' : '❌ rad: ' + escapeHtml(x.why || '')} — ${escapeHtml(fmtISO(x.d))}</small>`).join(''); box.appendChild(d); } } catch (e) {}
            return r;
        });
        if (typeof mmRender === 'function') mmRender = agmkExtend('mmRender', 'v3.10: tasdiqlash kutilayotganlar', mmRender, o => function () {
            const r = o.apply(this, arguments);
            try { const n = mmReqs().filter(x => x.st === 'kutish').length; if (canMMEdit() && n) { const b = secBody('screen-mm'); if (b && !$id('mmReqBtn')) { const d = document.createElement('button'); d.id = 'mmReqBtn'; d.className = 'action-btn'; d.style.margin = '0 0 10px'; d.textContent = '📥 Tasdiqlash kutilmoqda: ' + n; d.onclick = mmReqList; b.insertBefore(d, b.firstChild); } } } catch (e) {}
            return r;
        });
        // 9) Kalkulyatorlar hammaga: naryad tekshiruvi (natija; normalar, tarif va boshqa yorliqlar — boʻlim xodimlariga)
        if (typeof openMtih === 'function') openMtih = agmkExtend('openMtih', 'v3.10: naryad tekshiruvi — kalkulyator hammaga', openMtih, o => function (tab) {
            if (narCan()) { NAR.calc = false; return o.apply(this, arguments); }
            NAR.calc = true; NAR.tab = 'chk'; secScreen('screen-mtih', '🧮 Naryad tekshiruvi'); openScreen('screen-mtih'); narRender();
        });
        if (typeof narRender === 'function') narRender = agmkExtend('narRender', 'v3.10: kalkulyator rejimi', narRender, o => function () {
            if (NAR.calc && !narCan()) NAR.tab = 'chk';
            const r = o.apply(this, arguments);
            try { if (NAR.calc && !narCan()) { secTabs('screen-mtih', [['chk', '🔍 Naryad tekshiruvi']], 'chk', 'narTab'); const b = secBody('screen-mtih'); if (b && !$id('narCalcNote')) { const n = document.createElement('div'); n.id = 'narCalcNote'; n.className = 'kir-note'; n.textContent = '🧮 Kalkulyator: naryadingizni yuklab, xatolarini oldindan tekshiring. Tekshiruvlaringiz faqat shu telefonda. Normalar va tariflarni mehnat va ish haqi boʻlimi yuritadi.'; b.insertBefore(n, b.firstChild); } } } catch (e) {}
            return r;
        });
        if (typeof hsRender === 'function') hsRender = agmkExtend('hsRender', 'v3.10: naryad kalkulyatoriga yoʻl', hsRender, o => function () {
            const r = o.apply(this, arguments);
            try { if (HS.tab === 'hisob' && !$id('hsNarCard')) { const b = secBody('screen-hisob'); if (b) { const d = document.createElement('div'); d.id = 'hsNarCard'; d.className = 'btn-card inf-card'; d.onclick = () => openMtih('chk'); d.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🧮</span><span class="btn-text">Naryad tekshiruvi (kalkulyator)<small>Naryadni yuklab, xatolarini oldindan tekshiring</small></span></div><span class="btn-arrow">›</span>'; b.insertBefore(d, b.firstChild); } } } catch (e) {}
            return r;
        });
        try { const a = PERM38.find(x => x.id === 'xodim_edit'); if (a && !a.who.includes('kadr')) a.who.push('kadr'); } catch (e) {}

        // ---------------------------------------------------------------- 3) IKKI MANZIL: ishxonada Wi-Fi, tashqarida statik IP
        //  QR kodda «e» — tashqi manzil. Ilova avval ichki manzilni (Wi-Fi) sinaydi, topmasa — tashqisiga oʻtadi. Foydalanuvchi hech narsa tanlamaydi.
        var SRV2 = { busy: false, at: 0 };
        if (typeof srvParseQr === 'function') srvParseQr = agmkExtend('srvParseQr', 'v3.10: tashqi manzil', srvParseQr, o => function (txt) {
            const q = o.apply(this, arguments); if (!q) return q;
            try { const j = JSON.parse(String(txt || '').trim()); if (j && /^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(j.e || '')) q.e = j.e.replace(/\/+$/, ''); } catch (e) {}
            return q;
        });
        if (typeof srvConnect === 'function') srvConnect = agmkExtend('srvConnect', 'v3.10: tashqi manzil', srvConnect, o => async function (q) {
            const r = await o.apply(this, arguments);
            try { if (q && q.u) { const c = syncGet(SYNC_CFG, null); if (c && c.key === q.k) { c.lanUrl = q.u; c.url = q.u; c.act = 'lan'; if (q.e) c.ext = q.e; else delete c.ext; syncPut(SYNC_CFG, c); if (q.e) setTimeout(srvPick, 500); } } } catch (e) {}
            return r;
        });
        if (typeof syncCfg === 'function') syncCfg = agmkExtend('syncCfg', 'v3.10: faol manzil', syncCfg, o => function () {
            const c = o.apply(this, arguments); if (c && c.ext && c.act === 'ext') return Object.assign({}, c, { url: c.ext }); if (c && c.lanUrl) return Object.assign({}, c, { url: c.lanUrl }); return c;
        });
        async function srvProbe(u) {
            const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) {} }, 2500);
            try { const r = await fetch(u.replace(/\/+$/, '') + '/health', { cache: 'no-store', signal: ctl ? ctl.signal : undefined }); return r.ok; } catch (e) { return false; } finally { clearTimeout(tm); }
        }
        async function srvPick(force) {
            const c = syncGet(SYNC_CFG, null); if (!c || !c.on || !c.ext || SRV2.busy) return; if (!force && Date.now() - SRV2.at < 8000) return; SRV2.busy = true; SRV2.at = Date.now();
            try { const lan = c.lanUrl || c.url; let act = null; if (await srvProbe(lan)) act = 'lan'; else if (await srvProbe(c.ext)) act = 'ext';
                if (act && act !== c.act) { c.act = act; syncPut(SYNC_CFG, c); showToast(act === 'lan' ? '📶 Ishxona Wi-Fi orqali ulanildi' : '🌐 Tashqi manzil orqali ulanildi'); try { if (typeof OFF !== 'undefined' && OFF.on) offTick(true); else if (syncReady()) syncNow(true); } catch (e) {} } }
            finally { SRV2.busy = false; }
        }
        setInterval(() => { try { const c = syncGet(SYNC_CFG, null); if (c && c.ext && ((typeof SYNC !== 'undefined' && SYNC.err) || (typeof OFF !== 'undefined' && OFF.on) || c.act === 'ext')) srvPick(); } catch (e) {} }, 30000);
        window.addEventListener('online', () => setTimeout(() => srvPick(true), 1500)); document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(srvPick, 800); });
        if (typeof lockLogin === 'function') lockLogin = agmkExtend('lockLogin', 'v3.10: kirishdan oldin manzil tanlanadi', lockLogin, o => async function () { try { const c = syncGet(SYNC_CFG, null); if (c && c.on && c.ext) await srvPick(true); } catch (e) {} return o.apply(this, arguments); });

        // ---------------------------------------------------------------- 14) RASM SIFATI: serverga «ish sifati» (2560 px), xohlasa — asl
        //  Telefonda asl rasm qoladi; serverga yuborishda siqiladi (≈0,5–0,8 MB). 1 TB — bir necha oʻn yilga yetadi.
        var IMGQ = { key: 'agmk_img_orig' };
        function imgOrig() { try { return localStorage.getItem(IMGQ.key) === '1'; } catch (e) { return false; } }
        async function imgWork(b) {
            try { if (!b || !/^image\/(jpeg|png|webp)$/i.test(b.type || '') || b.size < 900 * 1024 || imgOrig()) return b;
                const bm = await createImageBitmap(b), M = 2560, s = Math.min(1, M / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * s); c.height = Math.round(bm.height * s);
                c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); try { bm.close && bm.close(); } catch (e) {}
                const o = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82)); return o && o.size < b.size ? o : b; } catch (e) { return b; }
        }
        if (typeof window.srvRaw === 'function') { const o = window.srvRaw; window.srvRaw = async function (path, opt) {
            try { if (/^\/api\/files\/v1\?/.test(String(path)) && opt && opt.method === 'POST' && opt.body instanceof Blob) { const nb = await imgWork(opt.body); if (nb !== opt.body) { opt = Object.assign({}, opt, { body: nb }); path = String(path).replace(/([?&]mime=)[^&]*/, '$1' + encodeURIComponent('image/jpeg')); } } } catch (e) {}
            return o.apply(this, [path, opt].concat([].slice.call(arguments, 2)));
        }; }
        function imgQualToggle() { const v = !imgOrig(); try { localStorage.setItem(IMGQ.key, v ? '1' : '0'); } catch (e) {} showToast(v ? '🖼 Rasmlar serverga asl sifatda yuboriladi (koʻp joy egallaydi)' : '🖼 Rasmlar serverga ish sifatida (2560 px) yuboriladi'); imgQualCard(); }
        function imgQualCard() {
            const s = document.querySelector('#screen-settings .set-body'); if (!s) return; let c = $id('imgQCard');
            if (!c) { c = document.createElement('div'); c.id = 'imgQCard'; c.className = 'btn-card'; c.onclick = imgQualToggle; s.appendChild(c); }
            c.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🖼</span><span class="btn-text">Rasm sifati (serverga)<span class="set-sub">${imgOrig() ? 'Asl sifat — koʻp joy egallaydi' : 'Ish sifati 2560 px — tavsiya etiladi'}</span></span></div><span class="btn-arrow">›</span>`;
        }
        if (typeof openSettings === 'function') openSettings = agmkExtend('openSettings', 'v3.10: rasm sifati', openSettings, o => function () { const r = o.apply(this, arguments); try { imgQualCard(); } catch (e) {} return r; });

        // ---------------------------------------------------------------- 13) MAHALLIY AI — yangi imkoniyatlar boʻyicha bilim
        //  Kuchli (aniq) savollar — darhol; umumiy savollar — boshqa bosqichlar javob bermasa.
        function aiRoleHolders(r) { try { const A = rolesAll(); return Object.keys(A).filter(t => /^\d+$/.test(t) && (A[t] || []).includes(r)).map(t => { const x = xodimByTabel(t); return x ? sgShort(x.name) + ' (' + t + ')' : t; }); } catch (e) { return []; } }
        var AI_FAQ = [
            { s: 1, re: /imzo ?kod|imzolash kod|4 xonali kod|imzo parol/, a: () => '🔢 Imzo kodi — 4 xonali, uni oʻzingiz oʻrnatasiz: Profil → «✍️ Mening imzom» → «🔢 Imzo kodi: Oʻrnatish». Har bir hujjatni imzolashda soʻraladi. Unutsangiz — oʻsha joyda «Kodni unutdim» → kirish parolingizni (6 xonali) kiritib, yangisini qoʻyasiz. Kodni hech kimga aytmang.' },
            { s: 1, re: /(kirish )?parol\w* (unut|esim|yoʻq|yo.q|almashtir|o.zgartir)|parolni (qanday|qayer)|6 xonali parol/, a: () => '🔑 Kirish paroli 6 xonali, uni administrator beradi. Unutsangiz yoki begona bilib qolsa — administratorga ayting, u yangisini beradi (eskisi darhol ishlamay qoladi). 5 marta xato kiritilsa 15 soniya kutiladi, keyingi har xatoda kutish uzayadi (5 daqiqagacha).' },
            { s: 1, re: /jonli xarita|bff|kim qayerda|xodimlar qayerda|mashinist\w* qayerda|haydovchi\w* qayerda/, a: () => '📡 Jonli xarita: «🚂 Mashinistlar» yoki «🚜 Haydovchilar» → «📡 Jonli xarita» (yoki Dispetcherlik → «Jonli xarita»). Smenadagi har bir xodim avatar boʻlib turadi: rang — holati (yashil harakatda, koʻk turibdi, kulrang signal yoʻq, qizil 🆘), joy nomi, tezlik, batareya. Xodimni bossangiz — qoʻngʻiroq, yozish, bugungi yoʻl va Yandex Navigator. Faqat smena davomida koʻrinadi.' },
            { s: 1, re: /gps|joylashuv|lokatsiya|smena\w* (qabul|olish)|texnika\w* (qabul|olish)/, a: () => '🛰 Texnikani qabul qilish uchun joylashuvga ruxsat va GPS yoqilgan boʻlishi shart. Qabul qilingach GPS ilova yopiq yoki ekran oʻchiq boʻlsa ham ishlaydi (bildirishnomada «smena davom etmoqda»). Smenani topshirganingizda GPS oʻzi oʻchadi — ishdan tashqarida kuzatilmaysiz. Server boʻlmasa nuqtalar telefonda saqlanadi va keyin yuboriladi.' },
            { s: 1, re: /oflayn|server (yo.q|topilmadi|ulanmagan)|internet (yo.q|siz)/, a: () => '📴 Server topilmasa ham ishlayverasiz: hammasi telefonda saqlanadi va server topilishi bilan oʻzi yuboriladi. Pastda chapdagi 📴 belgini bossangiz — oxirgi sinxron vaqti va navbatdagi yozuvlar soni koʻrinadi.' },
            { s: 1, re: /statik ip|tashqi manzil|ikki manzil|tashqaridan ulan|uydan ulan/, a: () => '🌐 Ishxonada telefon Wi-Fi orqali, tashqarida esa statik IP (tashqi manzil) orqali ulanadi — ilova oʻzi tanlaydi. Tashqi manzilni administrator server panelida yozadi, keyin QR kod qayta skanerlanadi.' },
            { s: 1, re: /hujjat\w* (yukla|imzoga)|pdf\w* (yukla|imzoga)|(qanday|qayerda|qayerdan|qanaqa|qilib) \w* ?imzoga (yubor|jo.nat)/, a: () => '📤 Hujjatni imzoga yuborish: «📊 Dalolatnoma va hisobotlar» → «📤 Hujjat yuklash va imzoga yuborish». Ilova familiyalarni oʻzi topadi, siz tekshirib, kerak boʻlsa xodim qoʻshib, «✅ Tasdiqlayman» bosasiz. Imzolovchilar «✍️ Imzolash»da 4 xonali kodi bilan imzolaydi.' },
            { s: 1, re: /zaxira|backup|rezerv nusxa/, a: () => '💾 Zaxira — hamma maʼlumotning bitta fayldagi nusxasi: Parametrlar → «💾 Toʻliq zaxira nusxa». Parol qoʻysangiz fayl shifrlanadi. Faylni kompyuter yoki fleshkaga koʻchirib qoʻying. Bugun server bilan sinxronlanmagan boʻlsa, soat 15:00 dan keyin eslatma chiqadi.' },
            { s: 0, re: /teplovoz\w* pasport|elektrovoz\w* pasport|vagon\w* pasport|motovoz\w* pasport|avtotraktor\w* pasport/, a: q => { const k = /teplovoz/.test(q) ? 'tx_teplo' : /elektrovoz/.test(q) ? 'tx_el' : /motovoz/.test(q) ? 'tx_moto' : /avtotraktor/.test(q) ? 'tx_avto' : 'tx_vag'; const h = aiRoleHolders(k); return /kim|tahrir|o.zgartir/.test(q) ? '✏️ ' + (h.join(', ') || 'administrator') + ' tahrirlaydi; qolganlar faqat koʻradi.' : null; } },
            { s: 1, re: /(pasport\w*|ma.lumot\w*)ni kim (tahrir|o.zgartir)|kim tahrirla|tahrirlash huquq/, a: () => { const L = [['🚃 Vagon', 'tx_vag'], ['🚜 Avtotraktor', 'tx_avto'], ['🛢 Teplovoz', 'tx_teplo'], ['🚃 Motovoz', 'tx_moto'], ['⚡ Elektrovoz', 'tx_el'], ['🛤 Yoʻl texnikasi', 'tx_yol'], ['🗺 Temir yoʻl xaritasi', 'xarita'], ['🗂 Xodimlar kartochkasi (kadrlar)', 'kadr'], ['🦺 Mehnat muhofazasi', 'mm']]; return '✏️ Tahrirlash huquqi (koʻrish — hammaga):\n' + L.map(([t, r]) => t + ': ' + (aiRoleHolders(r).join(', ') || '—')).join('\n') + '\nHar kim oʻz kartochkasini oʻzi tahrirlaydi (lavozim, tabel va okladdan tashqari). Huquqni administrator «👥 Rollar va huquqlar»da beradi.'; } },
            { s: 1, re: /naryad\w* (tekshir|kalkulyator)|kalkulyator/, a: () => '🧮 Naryad tekshiruvi — hammaga kalkulyator: «📊 Dalolatnoma va hisobotlar» → «🧮 Naryad tekshiruvi». Naryadni yuklang — ilova normaga solishtirib, xatolarini koʻrsatadi. Tekshiruvlar faqat oʻzingizda. Normalar va tariflarni mehnat va ish haqi boʻlimi yuritadi.' },
            { s: 1, re: /mm hujjat|tibbiy (ko.rik|xulosa)\w* (yukla|kirit)|bilim sinovi\w* (yukla|kirit)/, a: () => '🦺 Oʻz kartochkangiz → «🦺 Mehnat muhofazasi» → «📎 Hujjat yuklash». Tibbiy koʻrik yoki bilim sinovi hujjatining rasmini yuklaysiz; MM masʼuli tasdiqlagach muddat yangilanadi.' },
            { s: 1, re: /haydovchilar bo.lim|mashinistlar bo.lim|temir yo.l (va|bilan) avto/, a: () => '🚂 Mashinistlar — temir yoʻl texnikasi (lokomotiv, drezina, motovoz, rels ustidagi kran); 🚜 Haydovchilar — avtotraktor (avtomobil, traktor, yuklagich, ekskavator, avtobus). Dispetcherlik va harakat jurnali ham ikkiga ajratilgan: tepada «🚂 Temir yoʻl / 🚜 Avtotraktor».' }
        ];
        function aiFaq(q, strongOnly) { const n = aiNorm(q); for (const f of AI_FAQ) { if (strongOnly && !f.s) continue; if (f.re.test(n)) { const t = f.a(n); if (t) return { t: t + '\n📚 Manba: ilova qoʻllanmasi (v' + AGMK_VERSION + ')', personal: false }; } } return null; }
        if (typeof aiStage === 'function') aiStage('Ilova qoʻllanmasi (3.9–3.10 yangiliklari)', function (q, next) {
            const n = aiNorm(q), strong = /imzo ?kod|jonli xarita|\bbff\b|statik ip|tashqi manzil|kim tahrirla|tahrirlash huquq|pasport\w* ?ni kim|naryad\w* kalkulyator|haydovchilar bo.lim|hujjat\w* yukla\w* va imzo|skaner/.test(n);
            if (strong) { const f = aiFaq(q, false); if (f) return f; }
            const r = next(q);
            if (r && r.t && /^🚚 GPS kuzatuvi/.test(r.t)) { let n = 0; try { n = (MS.pos || []).length || msActive().length; } catch (e) {} return { t: '📡 GPS: ' + (n ? 'hozir smenada ' + n + ' kishi joylashuv yubormoqda.' : 'hozir smenada GPS yuborayotgan xodim yoʻq.') + ' Koʻrish: «🚂 Mashinistlar» yoki «🚜 Haydovchilar» → «📡 Jonli xarita». Joylashuv faqat smena davomida yuboriladi.', personal: false }; }
            if (r && r.t && !r.help) return r; return aiFaq(q, false) || r;
        });

