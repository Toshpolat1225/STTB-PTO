        // =====================================================================
        // v3.10.1
        //  1) Bosh sahifada BITTA boʻlim: «🚂🚜 Mashinistlar va haydovchilar» → ichida 🚂 Mashinistlar va 🚜 Haydovchilar.
        //  2) GPS ishonchli: fon xizmati ishga tushmasa — ilova ochiq paytda telefon GPS i bilan davom etadi (ikki manba),
        //     telefon biladigan oxirgi joylashuv darhol koʻrsatiladi, «🔧 GPS tekshiruvi» — nima ishlamayotganini aytadi.
        //  3) Avtotraktor demosi — eski navigatorda emas, yangi jonli xaritada.
        // =====================================================================
        // ---------------- 1) Bitta boʻlim ----------------
        try { const i = AGMK_MODS.findIndex(x => x.id === 'hayd'); if (i >= 0) AGMK_MODS.splice(i, 1);
            const m = AGMK_MODS.find(x => x.id === 'mash'); if (m) { m.icon = '🚂'; m.title = 'Mashinistlar va haydovchilar'; m.desc = 'Temir yoʻl va avtotraktor: smena, 🆘 nosozlik, jonli xarita';
                m.search = 'mashinistlar haydovchilar mashinist haydovchi shofyor traktorchi lokomotiv teplovoz drezina motovoz avtotraktor smena nosozlik sos jonli xarita gps'; m.open = () => mhOpen(); }
            if (typeof modRefresh === 'function') modRefresh(); } catch (e) {}
        if (typeof modAllowed === 'function') { const _ma = modAllowed; modAllowed = function (m) { if (m && m.id === 'hayd') return false; if (m && m.id === 'mash') { const s = parkOfMe; parkOfMe = () => 'both'; try { return _ma.apply(this, arguments); } finally { parkOfMe = s; } } return _ma.apply(this, arguments); }; try { modRefresh(); } catch (e) {} }
        function mhCnt(p) { let s = 0, n = 0; try { s = smS().all().filter(x => !x.end && parkOfKind(x.kind || 'lok') === p).length; } catch (e) {} try { n = nsS().all().filter(x => x.st !== 'hal' && (!x.unitId || parkOfUnit(x.unitId) === p)).length; } catch (e) {} return { s: s, n: n }; }
        function mhOpen() {
            if (typeof msOn === 'function' && !msOn()) { showToast('Bu boʻlim hozircha sinov guruhida'); return; }
            secScreen('screen-mh', '🚂🚜 Mashinistlar va haydovchilar', "openScreen('screen-main')"); openScreen('screen-mh'); mhRender();
        }
        function mhRender() {
            const b = secBody('screen-mh'); if (!b) return; const E = escapeHtml, sm = mySmena && mySmena(), me = parkOfMe();
            const card = (p, ic, t, sub) => { const c = mhCnt(p); return `<div class="mh-card ${p}" onclick="mhGo('${p}')"><span class="mh-ic">${ic}</span><div><b>${t}</b><small>${sub}</small><div class="mh-st"><i>🟢 Smenada: ${c.s}</i>${c.n ? `<i class="sos">🆘 Nosozlik: ${c.n}</i>` : ''}</div></div><span class="btn-arrow">›</span></div>`; };
            b.innerHTML = (sm ? `<div class="mh-my" onclick="mashOpen('smena','${parkOfKind(sm.kind)}')">${parkOfKind(sm.kind) === 'avto' ? '🚜' : '🚂'} <b>Mening smenam:</b> ${E(sm.unitName || '')}<span>›</span></div>` : '') +
                card('rail', '🚂', 'Mashinistlar', 'Temir yoʻl texnikasi: lokomotiv, drezina, motovoz, rels ustidagi kran') +
                card('avto', '🚜', 'Haydovchilar', 'Avtotraktor: avtomobil, traktor, yuklagich, ekskavator, avtobus') +
                (me !== 'both' ? `<div class="nd-tip">Sizning yoʻnalishingiz: ${me === 'avto' ? '🚜 Haydovchilar' : '🚂 Mashinistlar'}. Ikkinchi boʻlimni ham koʻrishingiz mumkin.</div>` : '');
            secTabs('screen-mh', [], '', '');
        }
        function mhGo(p) { mashOpen(null, p); }
        if (typeof mashOpen === 'function') { const _mo = mashOpen; mashOpen = function () { const r = _mo.apply(this, arguments); try { const bb = document.querySelector('#screen-mash .back-btn'); if (bb) bb.setAttribute('onclick', 'mhOpen()'); } catch (e) {} return r; }; }

        // ---------------- 2) GPS: ikki manba va tekshiruv ----------------
        var LVW = { id: null, n: 0, err: null, last: 0, timer: null };
        function gpsWebActive() { return LVW.id !== null || (typeof MS.watch === 'number'); }
        function lvwStart() {
            if (!navigator.geolocation || LVW.id !== null || typeof MS.watch === 'number' || !(mySmena && mySmena())) return;
            try { LVW.id = navigator.geolocation.watchPosition(p => {
                LVW.n++; LVW.last = Date.now(); LVW.err = null; if (!(mySmena && mySmena())) { lvwStop(); return; }
                let nat = null; try { if (gpsNat()) { const s = gpsSt(); nat = s.last; } } catch (e) {}
                if (nat && Date.now() - nat.t < 20000) return; // fon xizmati yangi nuqta beryapti
                const c = p.coords; MS.fix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, t: Date.now(), spd: c.speed != null && c.speed >= 0 ? c.speed * 3.6 : null, brg: c.heading != null && c.heading >= 0 ? c.heading : null, src: 'web' };
                try { msTrack(MS.fix); } catch (e) {} try { msPosSend(); } catch (e) {} gpsCardUpd();
            }, e => { LVW.err = e ? e.code : 2; gpsCardUpd(); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 60000 }); } catch (e) { LVW.id = null; LVW.err = 2; }
        }
        // Bino ichida: sputnik yoʻq boʻlsa — Wi-Fi va mobil tarmoq boʻyicha joylashuv (aniqligi 20–200 m) har 30 soniyada
        setInterval(() => { try {
            if (document.hidden || !navigator.geolocation || !(mySmena && mySmena())) return; const f = MS.fix; if (f && Date.now() - f.t < 45000) return;
            navigator.geolocation.getCurrentPosition(p => { const g = MS.fix; if (g && Date.now() - g.t < 30000) return; const c = p.coords; MS.fix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, t: Date.now(), spd: null, brg: null, src: 'net' }; LVW.indoor = Date.now();
                try { msTrack(MS.fix); } catch (e) {} try { msPosSend(); } catch (e) {} gpsCardUpd(); }, () => {}, { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 });
        } catch (e) {} }, 30000);
        function lvwStop() { try { if (LVW.id !== null) navigator.geolocation.clearWatch(LVW.id); } catch (e) {} LVW.id = null; }
        if (typeof msGpsStart === 'function') { const _gs = msGpsStart; msGpsStart = function (once) {
            const r = _gs.apply(this, arguments); if (once) return r;
            try { if (mySmena && mySmena()) { lvwStart(); setTimeout(() => { try { if (gpsNat() && mySmena() && !gpsSt().on) { const s = gpsSt(); showToast('⚠️ GPS fon xizmati ishga tushmadi' + (s.err ? ' (' + String(s.err).slice(0, 80) + ')' : '') + ' — ilova ochiq paytda joylashuv yuboriladi'); } gpsCardUpd(); } catch (e) {} }, 5000); } } catch (e) {}
            return r; }; }
        if (typeof msGpsStop === 'function') { const _gx = msGpsStop; msGpsStop = function () { lvwStop(); return _gx.apply(this, arguments); }; }
        window.addEventListener('agmk:login', () => setTimeout(() => { try { if (mySmena && mySmena()) lvwStart(); } catch (e) {} }, 6000));
        setTimeout(() => { try { if (currentUser && mySmena && mySmena()) lvwStart(); } catch (e) {} }, 7000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) try { if (mySmena && mySmena()) { lvwStart(); gpsCardUpd(); } } catch (e) {} });
        function gpsAgoT(t) { if (!t) return '—'; const s = Math.round((Date.now() - t) / 1000); return s < 60 ? s + ' soniya oldin' : s < 3600 ? Math.floor(s / 60) + ' daqiqa oldin' : Math.floor(s / 3600) + ' soat oldin'; }
        function gpsInfo() {
            const nat = typeof gpsNat === 'function' && gpsNat() ? gpsSt() : null, web = gpsWebActive();
            const on = !!(nat && nat.on) || web, f = MS.fix;
            return { nat: nat, web: web, on: on, fix: f, src: f ? (f.src === 'web' ? 'telefon GPS (ilova ochiq)' : f.src === 'net' ? 'Wi-Fi / mobil tarmoq (bino ichida)' : (nat && nat.last && nat.last.p === 'net') ? 'mobil tarmoq / Wi-Fi' : (nat && nat.last && nat.last.p === 'last') ? 'oxirgi maʼlum joy' : 'GPS sputnik') : '' };
        }
        // Smena kartochkasi: holat — aniq va tushunarli
        mashSmenaExtra = function () {
            if (MS.tab !== 'smena') return; const sm = mySmena(), g = document.querySelector('#screen-mash .ms-gps'); if (!sm || !g) return;
            let d = $id('msGpsX'); if (!d) { d = document.createElement('div'); d.id = 'msGpsX'; d.className = 'ms-gpsx'; g.parentNode.insertBefore(d, g.nextSibling); }
            gpsCardUpd();
        };
        function gpsCardUpd() {
            const d = $id('msGpsX'), g = document.querySelector('#screen-mash .ms-gps'); if (!d || !(mySmena && mySmena())) return;
            const I = gpsInfo(), srv = typeof syncReady === 'function' && syncReady() && !(typeof OFF !== 'undefined' && OFF.on), q = (MS.tq || []).length, f = I.fix, n = (LVT.pts || []).length;
            const bad = !I.on || (I.nat && (!I.nat.perm || I.nat.gps === false));
            const st = !I.on ? '⚠️ GPS ishlamayapti' : I.nat && I.nat.gps === false ? '⚠️ Telefonda joylashuv oʻchirilgan' : I.nat && I.nat.on ? '🛰 GPS yoqilgan — fon xizmati (ekran oʻchsa ham)' : '🛰 GPS yoqilgan — ilova ochiq paytda';
            const fx = f ? `📍 Oxirgi joylashuv: ${gpsAgoT(f.t)} · ±${Math.round(f.acc || 0)} m · ${I.src}` : '⏳ Signal kutilmoqda — bino ichida GPS sputnikni tutmasligi mumkin, deraza yoniga yoki ochiq joyga chiqing';
            if (g) g.textContent = f ? '📍 Joylashuv aniqlandi (±' + Math.round(f.acc || 0) + ' m)' + (f.spd != null ? ' · ' + Math.round(f.spd) + ' km/soat' : '') : '📍 GPS kutilmoqda…';
            d.innerHTML = `<div class="${bad ? 'bad' : f ? 'ok' : 'warn'}">${st} · ${n} nuqta yozildi</div><div class="${f ? 'ok' : 'warn'}">${fx}</div>
                <div class="${srv ? 'ok' : 'warn'}">${srv ? '📡 Server bilan — rahbariyat jonli koʻradi' : '📴 Server yoʻq — ' + q + ' nuqta telefonda navbatda, server topilganda yuboriladi. Oʻzingizni xaritada koʻraverasiz.'}</div>
                <div class="ms-b2"><button onclick="mashTab('live')">🗺 Xaritada koʻrish</button><button onclick="gpsDiag()">🔧 GPS tekshiruvi</button></div>
                <small>👁 Sizni rahbariyat va dispetcher koʻradi — faqat smena davomida. Smenani topshirganingizda GPS oʻzi oʻchadi.</small>`;
        }
        setInterval(() => { try { if ($id('msGpsX') && !document.hidden) gpsCardUpd(); } catch (e) {} }, 5000);
        function gpsDiag() {
            const I = gpsInfo(), N = I.nat, E = escapeHtml, row = (ok, t, s, btn) => `<div class="gd-row ${ok === null ? 'na' : ok ? 'ok' : 'bad'}"><i>${ok === null ? '➖' : ok ? '✅' : '❌'}</i><div><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div>${btn || ''}</div>`;
            const webErr = LVW.err === 1 ? 'ruxsat berilmagan' : LVW.err === 2 ? 'joylashuv aniqlanmadi' : LVW.err === 3 ? 'vaqt tugadi — signal yoʻq' : '';
            const h = `<div class="px-h"><b>🔧 GPS tekshiruvi</b><button class="mini-btn" onclick="mdlClose('gpsDiag')">✕</button></div>
                ${N ? row(!!N.perm, 'Joylashuvga ruxsat', N.perm ? 'berilgan' : 'berilmagan', N.perm ? '' : `<button onclick="AgmkNative.gpsPerm()">Berish</button>`) : ''}
                ${N ? row(!!N.gps, 'Telefonda joylashuv (GPS) yoqilgan', N.gps ? '' : 'yuqoridan pastga suring → «Joylashuv»', N.gps ? '' : `<button onclick="AgmkNative.gpsSettings()">Yoqish</button>`) : ''}
                ${N ? row(!!N.on, 'Fon xizmati (ekran oʻchsa ham ishlaydi)', N.on ? (N.svc ? 'ishlayapti' : 'ishga tushirilmoqda…') : 'ishlamayapti' + (N.err ? ' — ' + E(N.err) : '')) : row(null, 'Fon xizmati', 'bu qurilmada yoʻq (brauzer)')}
                ${N ? row(N.notif !== false, 'Bildirishnoma ruxsati', N.notif === false ? 'berilmagan — xizmat ishlaydi, lekin yuqorida belgisi koʻrinmaydi' : '') : ''}
                ${row(gpsWebActive() && !LVW.err, 'Telefon GPS (ilova ochiq paytda)', gpsWebActive() ? (LVW.n + ' ta signal' + (webErr ? ' · ' + webErr : '')) : 'oʻchiq')}
                ${row(!!I.fix, 'Oxirgi joylashuv', I.fix ? gpsAgoT(I.fix.t) + ' · ±' + Math.round(I.fix.acc || 0) + ' m · ' + I.src : 'hali yoʻq')}
                ${N ? row(null, 'Fon xizmati olgan nuqtalar', (N.cnt || 0) + ' ta' + (N.last ? ' · oxirgisi ' + gpsAgoT(N.last.t) + ' (' + (N.last.p === 'gps' ? 'sputnik' : N.last.p === 'net' ? 'tarmoq' : 'oxirgi maʼlum') + ')' : '')) : ''}
                <div class="nd-tip">💡 <b>Bino ichida</b> sputnik signali kelmaydi — ilova joyni <b>Wi-Fi va mobil tarmoq</b> orqali aniqlaydi (±20–200 m). Buning uchun telefonda: Sozlamalar → Joylashuv → <b>Joylashuv xizmatlari</b> → «Wi-Fi qidirish» va «Bluetooth qidirish» — <b>yoqilgan</b>, «Google joylashuv aniqligi» — <b>yoqilgan</b> boʻlsin; Wi-Fi ni oʻchirmang (ulanmasa ham yoqiq tursin). Samsung: Sozlamalar → Ilovalar → AGMK-STTB → Batareya → <b>«Cheklovsiz»</b> — shunda ekran oʻchganda ham GPS uzilmaydi.</div>
                <div class="pk-btns"><button onclick="gpsNow()">📍 Hozir aniqlash</button><button class="pr" onclick="gpsRestart()">🔄 GPS ni qayta yoqish</button></div>`;
            if ($id('gpsDiag') && !$id('gpsDiag').classList.contains('hidden')) $id('gpsDiag').querySelector('.modal-content').innerHTML = h; else mdl('gpsDiag', h);
        }
        function gpsRestart() {
            const sm = mySmena(); if (!sm) return; lvwStop();
            try { if (gpsNat()) { AgmkNative.gpsStop(); MS.watch = null; } } catch (e) {}
            setTimeout(() => { try { msGpsStart(); } catch (e) {} lvwStart(); showToast('🔄 GPS qayta yoqildi'); setTimeout(() => { if ($id('gpsDiag')) gpsDiag(); gpsCardUpd(); }, 2500); }, 700);
        }
        function gpsNow() {
            if (!navigator.geolocation) return; showToast('📍 Aniqlanmoqda… (30 soniyagacha)');
            navigator.geolocation.getCurrentPosition(p => { const c = p.coords; MS.fix = { lat: c.latitude, lon: c.longitude, acc: c.accuracy, t: Date.now(), spd: null, brg: null, src: 'web' }; try { msTrack(MS.fix); msPosSend(true); } catch (e) {} showToast('✅ Joylashuv aniqlandi (±' + Math.round(c.accuracy) + ' m)'); gpsCardUpd(); if ($id('gpsDiag')) gpsDiag(); },
                e => { LVW.err = e ? e.code : 2; showToast(e && e.code === 1 ? '⛔ Joylashuvga ruxsat yoʻq' : '⚠️ Signal yoʻq — ochiq joyga chiqing'); if ($id('gpsDiag')) gpsDiag(); }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
        }
        // fon xizmati nuqtasining manbasi (sputnik / tarmoq / oxirgi maʼlum) — MS.fix ga
        if (typeof gpsDrain === 'function') { const _gd = gpsDrain; gpsDrain = function () { const r = _gd.apply(this, arguments); try { if (MS.fix && MS.fix.src !== 'web') MS.fix.src = 'nat'; gpsCardUpd(); } catch (e) {} return r; }; }
        // Jonli xaritada oʻzim: smena boʻlsa — MS.fix; boʻlmasa ham telefon joylashuvi
        if (typeof lvSelf === 'function') { const _ls = lvSelf; lvSelf = function () { const r = _ls.apply(this, arguments); if (r) { r.self = true; r.ago = MS.fix && MS.fix.t ? Math.round((Date.now() - MS.fix.t) / 1000) : 0; } return r; }; }

        // ---------------- 3) Avtotraktor demosi — jonli xaritada ----------------
        var LVD = { on: false, items: [], t: null, clock: 0 };
        async function lvDemoStart() {
            if (lvPark() !== 'avto') { if (typeof bfStart === 'function') bfStart(); return; }
            showToast('🧪 Avtotraktor demo tayyorlanmoqda…'); const used = new Set(), V = [];
            const J = []; for (let i = 0; i < RD_DEF.length; i++) { const D = RD_DEF[i], v = vagonlarData.find(x => x.kind === 'avto' && D.f(x) && !hrInRepair(x) && !used.has(x.id)); if (!v) continue; used.add(v.id);
                const a = rdPt(D.h[0]), b = rdPt(D.h[1]); if (!a || !b) continue; J.push({ i: i, D: D, v: v, a: a, b: b }); }
            const RR = await Promise.all(J.map(j => rdRoute(j.a, j.b).catch(() => null))); // koʻcha yoʻllari — parallel (internet boʻlmasa — toʻgʻri chiziq)
            J.forEach((j, k) => { const route = RR[k] || [[j.a.lat, j.a.lon], [j.b.lat, j.b.lon]], cum = rdCum(route);
                V.push({ i: j.i, D: j.D, v: j.v, route: route, cum: cum, len: cum[cum.length - 1] || 1, f: (j.i * 0.21) % 1, dir: 1, pause: 0, spd: 0, trail: [] }); });
            const t0 = Date.now() - 3 * 3600e3; LVD.clock = t0; LVD.items = V;
            for (let s = 0; s < 3 * 3600; s += 30) lvDemoStep(30); // bugungi yoʻl — 3 soat oldindan
            LVD.on = true; clearInterval(LVD.t); LVD.t = setInterval(() => { if (!$id('lvMap') || MS.tab !== 'live') { clearInterval(LVD.t); return; } lvDemoStep(10); lvDemoPush(); lvDraw(); if (LV2.sel && /^demo/.test(LV2.sel)) lvCard(LV2.sel, true); }, 1000);
            LV2.fit = true; await lvTick(); showToast('🧪 ' + V.length + ' ta avtotraktor jonli xaritada (DEMO)');
        }
        function lvDemoStop() { LVD.on = false; LVD.items = []; clearInterval(LVD.t); LV2.fit = true; lvTick(); }
        function lvDemoStep(dt) {
            LVD.clock += dt * 1000;
            LVD.items.forEach(d => { const i = d.i;
                if (d.pause > 0) { d.pause -= dt; d.spd = 0; }
                else { const sp = d.D.kmh * (0.75 + 0.35 * Math.abs(Math.sin(LVD.clock / 9e5 + i))); d.spd = sp; d.f += d.dir * (sp / 3.6) * dt / d.len;
                    if (d.f >= 1) { d.f = 1; d.dir = -1; d.pause = (4 + (i * 7) % 18) * 60; } if (d.f <= 0) { d.f = 0; d.dir = 1; d.pause = (5 + (i * 5) % 15) * 60; } }
                const p = rdAlong(d), L0 = d.trail[d.trail.length - 1]; d.pos = p;
                if (L0) { const dy = p.lat - L0[1], dx = (p.lon - L0[2]) * Math.cos(p.lat * Math.PI / 180); if (Math.abs(dx) + Math.abs(dy) > 1e-6) d.brg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360; }
                if (!L0 || geoDist([L0[1], L0[2]], [p.lat, p.lon]) > 20 || LVD.clock - L0[0] > 120000) d.trail.push([LVD.clock, p.lat, p.lon, 6]); });
        }
        function lvDemoP(d) { return { tabel: 'demo' + d.i, name: d.D.nm, lat: d.pos.lat, lon: d.pos.lon, acc: 6, spd: d.spd, brg: d.brg, unit: hrName(d.v), uid: String(d.v.id), kind: 'avto', model: d.v.type || '', lav: 'Haydovchi · DEMO', bat: 35 + (d.i * 13) % 60, chg: d.i === 2, ago: 2, demo: 1 }; }
        function lvDemoPush() { if (!LVD.on) return; const D = LVD.items.map(lvDemoP); LV2.P = (LV2.P || []).filter(p => !p.demo).concat(D); LV.P = LV2.P; }
        if (typeof lvData === 'function') { const _ld = lvData; lvData = async function () { const P = await _ld.apply(this, arguments); return LVD.on && lvPark() === 'avto' ? P.filter(p => !p.demo).concat(LVD.items.map(lvDemoP)) : P; }; }
        if (typeof lvTrailPts === 'function') { const _lt = lvTrailPts; lvTrailPts = async function (p) { if (p && p.demo) { const d = LVD.items.find(x => 'demo' + x.i === p.tabel); return d ? d.trail.slice() : []; } return _lt.apply(this, arguments); }; }
        if (typeof lvCard === 'function') { const _lc = lvCard; lvCard = async function (tabel) { const r = await _lc.apply(this, arguments); try { if (/^demo/.test(tabel)) { const c = document.querySelector('#lvCard .lv-card'); if (c) { c.querySelectorAll('.lv-btns button').forEach(b => { if (/Yozish|Qoʻngʻiroq/.test(b.textContent)) b.remove(); }); const h = c.querySelector('.lv-ch b'); if (h && !/DEMO/.test(h.innerHTML)) h.insertAdjacentHTML('beforeend', ' <em class="ns-demo">DEMO</em>'); } } } catch (e) {} return r; }; }
        if (typeof lvList === 'function') { const _ll = lvList; lvList = function () { const r = _ll.apply(this, arguments); try { const box = $id('lvList'); if (!box) return r;
            box.innerHTML = box.innerHTML.replace(/<button onclick="rdStart\(\)">🧪 Avtotraktor demo<\/button>/, '<button onclick="lvDemoStart()">🧪 Avtotraktor demo</button>');
            if (lvPark() === 'avto') { if (LVD.on) box.insertAdjacentHTML('afterbegin', `<div class="lv-demo">🧪 DEMO — taqdimot uchun, haqiqiy maʼlumot emas <button onclick="lvDemoStop()">⏹ Toʻxtatish</button></div>`); else if (!/lvDemoStart/.test(box.innerHTML)) box.insertAdjacentHTML('beforeend', `<div class="ms-b2" style="margin-top:6px"><button onclick="lvDemoStart()">🧪 Avtotraktor demo</button></div>`); } } catch (e) {} return r; }; }
        // eski «Avtotraktor GPS-navigator» ekrani endi ochilmaydi — demo jonli xaritada
        if (typeof rdStart === 'function') rdStart = async function () { MS.park = 'avto'; mashOpen('live', 'avto'); setTimeout(lvDemoStart, 400); };

        // ---------------- AI ----------------
        if (typeof AI_FAQ !== 'undefined') AI_FAQ.unshift(
            { s: 1, re: /o.zimni (xarita|ko.r)|xaritada (o.zim|ko.rinmay)|gps (ishlamay|ishlamas|yo.q|kutilmoqda|ulanmay)|joylashuv\w* (aniqlanmay|chiqmay)/, a: () => '📍 Oʻzingizni koʻrish: texnikani qabul qiling → smena kartochkasida «🗺 Xaritada koʻrish». Server boʻlmasa ham oʻzingiz koʻrinasiz. «GPS kutilmoqda» boʻlsa — bino ichida sputnik signali kelmaydi: 1–2 daqiqa ochiq joyda turing. Muammo boʻlsa smena kartochkasida «🔧 GPS tekshiruvi»: ruxsat, telefondagi joylashuv, fon xizmati va oxirgi signal koʻrinadi, «🔄 GPS ni qayta yoqish» tugmasi bor. Samsungda: Sozlamalar → Ilovalar → AGMK-STTB → Batareya → «Cheklovsiz».' },
            { s: 1, re: /mashinistlar va haydovchilar|haydovchilar bo.limi qayerda|mashinistlar bo.limi qayerda/, a: () => '🚂🚜 Bosh sahifada bitta boʻlim — «Mashinistlar va haydovchilar». Ichida ikkita: 🚂 Mashinistlar (temir yoʻl texnikasi) va 🚜 Haydovchilar (avtotraktor). Har birida — smena, 🆘 nosozliklar va 📡 jonli xarita.' });

        (function () { const st = document.createElement('style'); st.textContent = `
            .mh-card{display:flex;align-items:center;gap:14px;padding:18px 16px;margin:12px 0;border-radius:18px;background:rgba(15,23,42,.88);border:1px solid #334155;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}.mh-card.rail{border-left:5px solid #f97316}.mh-card.avto{border-left:5px solid #22c55e}
            .mh-card:active{transform:scale(.99)}.mh-ic{font-size:40px}.mh-card>div{flex:1;min-width:0}.mh-card b{display:block;font-size:19px;color:#f8fafc}.mh-card small{display:block;color:#94a3b8;font-size:12.5px;margin-top:2px}
            .mh-st{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.mh-st i{font-style:normal;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(34,197,94,.15);color:#86efac}.mh-st i.sos{background:rgba(239,68,68,.18);color:#fca5a5}
            .mh-my{display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;cursor:pointer;margin-bottom:4px}.mh-my span{margin-left:auto;font-size:20px}
            .gd-row{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid rgba(148,163,184,.15)}.gd-row>i{font-style:normal;font-size:18px}.gd-row>div{flex:1}.gd-row b{display:block;font-size:14px}.gd-row small{display:block;color:#94a3b8;font-size:12px;word-break:break-word}.gd-row.bad b{color:#fca5a5}
            .gd-row button{padding:7px 12px;border-radius:9px;border:0;background:#2563eb;color:#fff;font-weight:700}
            .ms-gpsx .warn{color:#fde68a}.lv-demo{display:flex;align-items:center;gap:8px;justify-content:space-between;padding:8px 10px;margin-bottom:6px;border-radius:10px;background:rgba(234,88,12,.18);border:1px solid #ea580c;color:#fed7aa;font-size:12.5px;font-weight:700}.lv-demo button{padding:5px 10px;border-radius:8px;border:0;background:#ea580c;color:#fff}`; document.head.appendChild(st); })();

        // ---------------- 4) Jonli xarita turlari: 🗺 Sxema · 🛰 Sputnik · 🌍 Gibrid ----------------
        //  Sxema — koʻchalar, mahallalar, uy raqamlari, bino nomlari (OpenStreetMap; uy raqamlari 18-yaqinlashtirishdan)
        //  Sputnik — haqiqiy koʻrinish, yozuvsiz (Esri World Imagery) · Gibrid — sputnik + koʻcha va joy nomlari
        var LVM = { key: 'agmk_lv_maptype', base: [] };
        function lvMapType() { try { return localStorage.getItem(LVM.key) || 'sxema'; } catch (e) { return 'sxema'; } }
        function lvMapSet(t) {
            try { localStorage.setItem(LVM.key, t); } catch (e) {} const m = LV.map; if (!m) return;
            LVM.base.forEach(l => { try { m.removeLayer(l); } catch (e) {} }); LVM.base = [];
            const ES = 'agmk-tile://esri/', add = (u, o) => { const l = L.tileLayer(u, Object.assign({ maxZoom: 20, maxNativeZoom: 19 }, o)); l.addTo(m); try { l.bringToBack(); } catch (e) {} LVM.base.push(l); return l; };
            if (t === 'sxema') add('agmk-tile://osm/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
            else {
                if (!m.getPane('lvLbl')) { m.createPane('lvLbl'); m.getPane('lvLbl').style.zIndex = 340; m.getPane('lvLbl').style.pointerEvents = 'none'; }
                if (t === 'gibrid') { add(ES + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { pane: 'lvLbl' }); add(ES + 'Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', { pane: 'lvLbl', opacity: 0.9 }); }
                add(ES + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri, Maxar, Earthstar' });
            }
            document.querySelectorAll('.lv-mt button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
        }
        if (typeof lvMapInit === 'function') { const _mi = lvMapInit; lvMapInit = function () {
            const r = _mi.apply(this, arguments); const m = LV.map; if (!m) return r;
            try { m.eachLayer(l => { if (l instanceof L.TileLayer && /openstreetmap/.test(l._url || '')) m.removeLayer(l); }); } catch (e) {}
            LVM.base = []; if (m.options) m.options.maxZoom = 20; lvMapSet(lvMapType());
            const w = $id('lvMap') && $id('lvMap').parentNode; if (w && !w.querySelector('.lv-mt')) w.insertAdjacentHTML('beforeend', `<div class="lv-mt">${[['sxema', '🗺 Sxema'], ['sputnik', '🛰 Sputnik'], ['gibrid', '🌍 Gibrid']].map(x => `<button data-t="${x[0]}" class="${lvMapType() === x[0] ? 'on' : ''}" onclick="lvMapSet('${x[0]}')">${x[1]}</button>`).join('')}</div>`);
            return r; }; }
        (function () { const st = document.createElement('style'); st.textContent = `.lv-mt{position:absolute;left:10px;top:10px;z-index:500;display:flex;background:rgba(15,23,42,.88);border:1px solid #334155;border-radius:12px;padding:3px;gap:2px;box-shadow:0 2px 10px rgba(0,0,0,.4)}.lv-mt button{border:0;background:transparent;color:#cbd5e1;font-weight:700;font-size:12.5px;padding:7px 9px;border-radius:9px}.lv-mt button.on{background:#2563eb;color:#fff}`; document.head.appendChild(st); })();

