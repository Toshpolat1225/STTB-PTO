        // =====================================================================
        // v3.6 — 🚂 MASHINISTLAR VA ❗ UNDOV (nosozlik / avariya signali)
        //  • Mashinist, haydovchi, ekskavator va kran boshqaruvchisi smenada texnikani qabul qiladi,
        //    lokomotivga ulangan vagonlarni o'zi tarkibga qo'shadi (Harakat tarkibi bazasiga yoziladi).
        //  • 🆘 Nosozlik tugmasi: 🟢 yengil · 🟡 o'rta · 🔴 jiddiy. Masʼullarga ❗ Undov tugmasida chiqadi.
        //  • ❗ Undov — FAQAT nosozlik/avariya: koʻrilmagan signal boʻlsa eng jiddiy daraja rangida miltillaydi,
        //    har kim «Koʻrdim» bosmaguncha oʻchmaydi. Boshqa eslatmalar — 🔔 tugmasida.
        //  • Joylashuv: faqat smena davomida, faqat korxona serveriga (xotirada, tarix saqlanmaydi).
        // =====================================================================
        var NS_LVL = {
            y: { ic: '🟢', t: 'Yengil', c: '#22c55e', d: 'Oʻzim hal qilaman — 5–10 daqiqalik toʻxtash', ex: 'Motor qizib ketdi, suv qaynadi, tormoz krani yopilmay qoldi, mahkamlash esdan chiqdi' },
            o: { ic: '🟡', t: 'Oʻrta', c: '#eab308', d: 'Mutaxassis kerak — 45–70 daqiqada hal boʻladi', ex: 'Akt yoki dalolatnoma shart boʻlmagan nosozlik' },
            j: { ic: '🔴', t: 'Jiddiy', c: '#ef4444', d: 'Avariya — akt / dalolatnoma tuziladi', ex: 'Oʻq sinishi, izdan chiqish, toʻqnashuv, odam jarohati' }
        };
        var NS_RANK = { y: 1, o: 2, j: 3 }, NS_RESP = ['rahbar', 'hr', 'tex'];
        var MS = { tab: 'smena', kind: 'lok', q: '', vq: '', watch: null, fix: null, posT: null, sent: 0, demo: [], pos: [], posAt: 0, alerted: {}, mapT: null };
        function smS() { return agmkStore('smena'); }
        function nsS() { return agmkStore('nosoz'); }
        function nsSeenS() { return agmkStore('nsseen'); }
        function msOn() { try { return !!currentUser && !!currentUser.tabel && flagOn('mash'); } catch (e) { return false; } }
        function msLav() { return String((currentUser && (currentUser.lavozim || currentUser.role)) || ''); }
        function mashIs() { return !!currentUser && (hasRole('mash') || /mashinist|машинист|haydovchi|водител|shofyor|шофер|traktorist|тракторист|kranchi|крановщик|ekskavatorchi/i.test(msLav())); }
        function nsResp() { try { return isAdmin() || NS_RESP.some(r => hasRole(r)) || (typeof canHR === 'function' && canHR()); } catch (e) { return false; } }
        function msNow() { return new Date().toISOString(); }
        function msAgo(at) { const m = Math.max(0, Math.round((Date.now() - new Date(at).getTime()) / 60000)); return m < 1 ? 'hozirgina' : m < 60 ? m + ' daq oldin' : m < 1440 ? Math.floor(m / 60) + ' soat ' + (m % 60) + ' daq oldin' : Math.floor(m / 1440) + ' kun oldin'; }
        function msHM(at) { const d = new Date(at); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
        function msUnit(id) { return vagonlarData.find(x => x.id === id) || null; }
        function msUnits(kind) { return kind === 'lok' ? onlyLoks() : kind === 'avto' ? onlyAvto() : onlyYol(); }
        function msKindOf(v) { return v && v.kind === 'lok' ? 'lok' : v && v.kind === 'avto' ? 'avto' : 'yol'; }
        function mySmena() { const t = meTabel(); return smS().all().find(x => x.tabel === t && !x.end) || null; }
        function msActive() { return smS().all().filter(x => !x.end); }
        function msTarkib(d, sm) { if (!sm) return null; return d.tarkiblar.find(t => t.id === sm.tarkibId) || (sm.kind === 'lok' ? d.tarkiblar.find(t => t.lokId === sm.unitId) : null) || null; }

        // ---------------------------------------------------------------- Nosozliklar ro'yxati (server + demo)
        function nsAll() { return nsS().all().concat(MS.demo); }
        function nsGet(id) { return nsAll().find(x => x.id === id) || null; }
        function nsVisible(n) { return nsResp() || mashIs() || n.tabel === meTabel(); } // kerakli bo'limlar: rahbariyat, dispetcher, texnika masteri, mashinistlar; o'zi yuborgani
        function nsMySeen() { const r = nsSeenS().get(meTabel()); return (r && r.ids) || {}; }
        function nsIsSeen(n) { return !!nsMySeen()[n.id] || n.tabel === meTabel() && !n.demo; }
        function nsOpenList() { return nsAll().filter(n => n.st !== 'hal' && nsVisible(n)); }
        function nsUnseen() { return nsAll().filter(n => nsVisible(n) && !nsIsSeen(n) && (n.st !== 'hal' || Date.now() - new Date(n.at).getTime() < 12 * 36e5)); }
        function nsTop(l) { let b = null; l.forEach(n => { if (!b || NS_RANK[n.lvl] > NS_RANK[b.lvl]) b = n; }); return b ? b.lvl : null; }
        function nsSort(a, b) { return (a.st === 'hal') - (b.st === 'hal') || NS_RANK[b.lvl] - NS_RANK[a.lvl] || String(b.at).localeCompare(String(a.at)); }
        function nsSeenMark(ids) {
            const cur = nsMySeen(), add = {}; ids.forEach(id => { if (!cur[id]) add[id] = msNow(); }); if (!Object.keys(add).length) return;
            const keep = {}, live = new Set(nsAll().map(n => n.id)); Object.keys(cur).forEach(k => { if (live.has(k)) keep[k] = cur[k]; });
            try { nsSeenS().put({ id: meTabel(), name: currentUser.name, ids: Object.assign(keep, add) }); } catch (e) { console.error(e); }
            nsBadge();
        }
        function nsSeenWho(n) { return nsSeenS().all().filter(r => r.ids && r.ids[n.id]).map(r => ({ tabel: r.id, name: r.name, at: r.ids[n.id] })); }

        // ---------------------------------------------------------------- ❗ Undov tugmasi (asosiy sahifa)
        function nsBtn() {
            let b = $id('nsBtn'); const ops = $id('opsBtn'), h = document.querySelector('#screen-main .header'); if (!h) return null;
            if (!b) { b = document.createElement('button'); b.id = 'nsBtn'; b.type = 'button'; b.className = 'ns-btn'; b.title = 'Nosozlik va avariya signallari'; b.onclick = e => { e.stopPropagation(); nsOpen(); }; b.innerHTML = '<span class="ns-ic">!</span><i></i>'; (ops && ops.parentNode === h ? h : h).appendChild(b); }
            return b;
        }
        function nsBadge() {
            try {
                const b = nsBtn(); if (!b) return; const on = msOn(); b.classList.toggle('hidden', !on); if (!on) return;
                const un = nsUnseen(), op = nsOpenList(), top = nsTop(un), steady = nsTop(op);
                b.classList.remove('l-y', 'l-o', 'l-j', 'blink', 'st-y', 'st-o', 'st-j');
                if (top) b.classList.add('blink', 'l-' + top); else if (steady) b.classList.add('st-' + steady);
                const n = un.length; const i = b.querySelector('i'); i.textContent = n || ''; i.style.display = n ? '' : 'none';
                const fab = $id('msSos'); if (fab) fab.classList.toggle('hidden', !(on && mashIs() && mySmena()));
            } catch (e) { console.error(e); }
        }
        function nsCard(n) {
            const L = NS_LVL[n.lvl], E = escapeHtml, seen = nsIsSeen(n);
            return `<div class="ns-it l-${n.lvl}${n.st === 'hal' ? ' done' : ''}${seen ? '' : ' new'}" onclick="nsDetail('${n.id}')">
                <div class="ns-bar"></div><div class="ns-b"><div class="ns-t"><b>${L.ic} ${E(L.t)}</b>${n.demo ? '<em class="ns-demo">DEMO</em>' : ''}<span>${E(msHM(n.at))} · ${E(msAgo(n.at))}</span></div>
                <div class="ns-s">${E(n.unitName || 'Texnika koʻrsatilmagan')}${n.tarkibNo ? ' · tarkib №' + E(n.tarkibNo) : ''}</div>
                <div class="ns-m">${E(n.izoh || L.d)}</div>
                <div class="ns-f">👤 ${E(n.name || '—')}${n.lav ? ' · ' + E(n.lav) : ''} · 📍 ${E(n.joyName || (n.gps ? 'GPS bor' : 'joyi nomaʼlum'))}</div>
                <div class="ns-st">${n.st === 'hal' ? '✅ Hal qilindi' + (n.fixBy ? ' — ' + E(n.fixBy) : '') : n.st === 'yolda' ? '🚗 Masʼul yoʻlda' + (n.ack && n.ack[0] ? ' — ' + E(n.ack[n.ack.length - 1].name) : '') : '⏳ Javob kutilmoqda'}${seen ? '' : ' · <b class="ns-nw">yangi</b>'}</div></div><span class="ns-ar">›</span></div>`;
        }
        function nsOpen() {
            const L = nsAll().filter(nsVisible).sort(nsSort), op = L.filter(n => n.st !== 'hal'), done = L.filter(n => n.st === 'hal').slice(0, 30), un = nsUnseen();
            const cnt = k => op.filter(n => n.lvl === k).length;
            mdl('nsModal', `<div class="px-h"><b>❗ Nosozlik va avariyalar</b><button class="mini-btn" onclick="mdlClose('nsModal')">✕</button></div>
                ${mashIs() ? `<button class="ms-sos small" onclick="mdlClose('nsModal'); nsAsk()"><b>🆘</b><span>NOSOZLIK YUBORISH</span></button>` : ''}
                <div class="ns-sum">${['j', 'o', 'y'].map(k => `<div class="l-${k}"><b>${cnt(k)}</b><span>${NS_LVL[k].ic} ${NS_LVL[k].t}</span></div>`).join('')}</div>
                ${un.length ? `<button class="action-btn ns-ok" onclick="nsSeenAll()">👁 Koʻrdim — barchasini tasdiqlash (${un.length})</button>` : ''}
                ${op.length ? op.map(nsCard).join('') : '<div class="hs-ok">✅ Hozir ochiq nosozlik yoʻq.</div>'}
                ${done.length ? `<details class="hs-hist"><summary>✅ Hal qilinganlar (${done.length})</summary>${done.map(nsCard).join('')}</details>` : ''}
                ${isAdmin() || hasRole('rahbar') ? `<div class="ns-demo-bar"><span>🧪 Rahbariyatga koʻrsatish uchun demo:</span><button onclick="nsDemo('y')">🟢 Yengil</button><button onclick="nsDemo('o')">🟡 +Oʻrta</button><button onclick="nsDemo('j')">🔴 +Jiddiy</button>${MS.demo.length ? '<button onclick="nsDemo(null)">🧹 Tozalash</button>' : ''}</div>` : ''}`, true);
        }
        function nsSeenAll() { nsSeenMark(nsUnseen().map(n => n.id)); nsOpen(); }
        function nsDetail(id) {
            const n = nsGet(id); if (!n) return; const L = NS_LVL[n.lvl], E = escapeHtml, u = msUnit(n.unitId), who = nsSeenWho(n);
            const seenMe = nsIsSeen(n), resp = nsResp(), own = n.tabel === meTabel(), can = !n.demo && (resp || own);
            const x = n.tabel && typeof findXodimsByTabel === 'function' ? findXodimsByTabel(n.tabel)[0] : null;
            mdl('nsModal', `<div class="px-h"><b>${L.ic} ${E(L.t)} nosozlik${n.demo ? ' <em class="ns-demo">DEMO</em>' : ''}</b><button class="mini-btn" onclick="nsOpen()">‹ Roʻyxat</button></div>
                <div class="ns-hero l-${n.lvl}"><div class="ns-hl">${L.ic}</div><div><b>${E(n.izoh || L.d)}</b><small>${E(msHM(n.at))} · ${E(msAgo(n.at))} · ${E(L.d)}</small></div></div>
                <div class="ns-grid">
                    <div><span>👤 Xodim</span><b>${E(n.name || '—')}</b><small>${E(n.lav || '')}${n.tabel ? ' · tabel ' + E(n.tabel) : ''}</small></div>
                    <div><span>🚂 Texnika</span><b>${E(n.unitName || '—')}</b><small>${n.tarkibNo ? 'Tarkib №' + E(n.tarkibNo) + ' · ' + (n.vagN || 0) + ' vagon' : ''}</small></div>
                    <div><span>📍 Joyi</span><b>${E(n.joyName || '—')}</b><small>${n.gps ? E(n.gps.lat.toFixed(5) + ', ' + n.gps.lon.toFixed(5)) + ' · ±' + (n.gps.acc || '?') + ' m' : n.xy ? 'Sxemada belgilangan (demo)' : 'GPS maʼlumoti yoʻq'}</small></div>
                    <div><span>📋 Holati</span><b>${n.st === 'hal' ? '✅ Hal qilindi' : n.st === 'yolda' ? '🚗 Masʼul yoʻlda' : '⏳ Javob kutilmoqda'}</b><small>${n.st === 'hal' ? E((n.fixBy || '') + ' · ' + msHM(n.fixAt) + (n.akt ? ' · akt №' + n.akt : '')) : ''}</small></div>
                </div>
                ${seenMe ? '' : `<button class="action-btn ns-seen" onclick="nsSeenMark(['${id}']); nsDetail('${id}')">👁 Koʻrdim — tasdiqlayman</button>`}
                <div class="ns-acts">
                    <button onclick="nsPerson('${id}')"${n.tabel || n.demo ? '' : ' disabled'}>👤 Xodim maʼlumotlari</button>
                    <button onclick="mdlClose('nsModal'); openPassport(${JSON.stringify(n.unitId)})"${u ? '' : ' disabled'}>📄 Texnika pasporti</button>
                    <button onclick="nsGps('${id}')"${n.gps || n.tabel || n.xy ? '' : ' disabled'}>🛰 GPS — xaritada</button>
                </div>
                ${n.fixIzoh ? `<div class="nd-tip">✅ ${E(n.fixIzoh)}</div>` : ''}${u && u.status === 'Tamirda' ? `<div class="nd-tip">🔧 Texnika hozir taʼmirda${n.rep ? ' — ' + E(n.rep.by) + ' yubordi, ' + E(msHM(n.rep.at)) : ''}</div>` : ''}
                ${(n.ack || []).length ? `<div class="ns-log">${n.ack.map(a => `<div>🚗 ${E(a.name)} — yoʻlga chiqdi, ${E(msHM(a.at))}</div>`).join('')}</div>` : ''}
                ${can && n.st !== 'hal' ? `<div class="ns-acts2">${resp && n.st === 'ochiq' ? `<button class="go" onclick="nsAck('${id}')">🚗 Yoʻlga chiqdim</button>` : ''}${resp || (own && n.lvl === 'y') ? `<button class="ok" onclick="nsFix('${id}')">✅ Hal qilindi</button>` : ''}${resp && u && u.status !== 'Tamirda' && n.lvl !== 'y' ? `<button class="rep" onclick="nsRepair('${id}')">🔧 Taʼmirga yuborish</button>` : ''}</div>` : ''}
                <details class="hs-hist"><summary>👁 Koʻrganlar (${who.length})</summary>${who.map(w => `<div>${E(w.name || w.tabel)} — ${E(msHM(w.at))}</div>`).join('') || '<div>—</div>'}</details>`, true);
        }
        function nsPerson(id) {
            const n = nsGet(id); if (!n) return;
            if (n.demo) { showToast('🧪 Demo holat — haqiqiy xodim kartasi yoʻq'); return; }
            const r = findXodimsByTabel(n.tabel)[0]; if (!r) { showToast('Xodim roʻyxatda topilmadi (tabel ' + n.tabel + ')'); return; }
            mdlClose('nsModal'); xtOpenXodim(r.item.id);
        }
        async function nsGps(id) {
            const n = nsGet(id); if (!n) return; mdlClose('nsModal');
            await msPosLoad(true); const p = n.tabel ? MS.pos.find(x => x.tabel === n.tabel) : null; let g = p ? [p.lat, p.lon] : n.gps ? [n.gps.lat, n.gps.lon] : null;
            await gdOpen(); if (!g && n.xy) { const ll = ygToLL(n.xy[0], n.xy[1]); g = [ll.lat, ll.lng]; }
            if (!g) { showToast('📍 Bu xodimning joylashuvi hozir yoʻq'); return; }
            setTimeout(() => { try { GD.map.setView(g, 16, { animate: false }); msMapDraw(); } catch (e) {} }, 400);
        }
        function nsAck(id) {
            const n = nsGet(id); if (!n || n.demo) return; const a = (n.ack || []).concat({ tabel: meTabel(), name: currentUser.name, at: msNow() });
            nsS().put(Object.assign({}, n, { st: n.st === 'ochiq' ? 'yolda' : n.st, ack: a })); nsSeenMark([id]); msSyncNow(); nsDetail(id); showToast('🚗 Belgilandi — xodim koʻradi');
        }
        async function nsRepair(id) { // nosozlikdan to'g'ridan-to'g'ri taʼmirga: pasportdagi oddiy tugma (taʼmir turi va uchastka so'raladi)
            const n = nsGet(id); if (!n || !n.unitId) return; mdlClose('nsModal'); openPassport(n.unitId); await markVagonAsTamirda();
            const u = msUnit(n.unitId); if (u && u.status === 'Tamirda') { nsS().put(Object.assign({}, nsGet(id), { rep: { at: msNow(), by: currentUser.name } })); nsSeenMark([id]); msSyncNow(); }
        }
        async function nsFix(id) {
            const n = nsGet(id); if (!n || n.demo) return; let akt = '';
            if (n.lvl === 'j') { akt = (await uiPrompt('🔴 Jiddiy holat — akt / dalolatnoma raqami:', '') || '').trim(); if (!akt) { alert('Jiddiy holatni yopish uchun akt yoki dalolatnoma raqamini kiriting.'); return; } }
            const iz = (await uiPrompt('Nima qilindi? (qisqacha)', n.lvl === 'y' ? 'Bartaraf qilindi, harakat davom etmoqda' : '') || '').trim();
            nsSeenMark([id]); nsS().put(Object.assign({}, n, { st: 'hal', fixAt: msNow(), fixBy: currentUser.name, fixTabel: meTabel(), fixIzoh: iz, akt: akt }));
            const d = hrDB(); hrLog(d, `✅ Nosozlik hal qilindi: ${n.unitName || ''}${akt ? ' (akt №' + akt + ')' : ''}`, '✅'); hrSave(d);
            const u = msUnit(n.unitId); if (u) { u.history = u.history || []; u.history.unshift({ date: todayISO(), type: `✅ Nosozlik bartaraf qilindi (${NS_LVL[n.lvl].t.toLowerCase()}): ${iz || ''}${akt ? ' · akt №' + akt : ''} — ${currentUser.name}`, author: authorStr(), src: 'ns', ns: n.id }); saveDB(false); }
            msSyncNow(); nsDetail(id); nsBadge();
        }
        // Rahbariyatga ko'rsatish: har bir rang uchun bir nechta demo holat (faqat shu telefonda, serverga yuborilmaydi)
        function nsDemo(k) {
            if (k === null) { MS.demo = []; nsBadge(); nsOpen(); return; }
            const L = onlyLoks().filter(v => !hrInRepair(v)), A = onlyAvto().concat(onlyYol()), P = typeof INFRA_BY !== 'undefined' ? Object.keys(INFRA_BY) : [];
            const pick = (arr, i) => arr.length ? arr[(i * 7 + MS.demo.length * 3) % arr.length] : null, pl = i => { const id = pick(P, i); return id ? hrPlace(id) : 'Qolmaqir'; };
            const S = {
                y: [['Motor qizib ketdi — 10 daqiqa sovutaman', 'lok'], ['Radiatorda suv qaynadi, toʻldiryapman', 'avto'], ['Tormoz krani yopilmay qolgan ekan, yopdim', 'lok'], ['Tirkama mahkamlagichi boʻshab qoldi', 'avto'], ['Qum berish tizimi tiqildi', 'lok']],
                o: [['Kompressor bosim bermayapti — elektrik kerak', 'lok'], ['Gidravlika shlangi teshildi', 'avto'], ['Pantograf koʻtarilmayapti', 'lok']],
                j: [['🔴 Dumpkar oʻqi sindi, vagon izdan chiqdi', 'lok']]
            }[k];
            const now = Date.now();
            S.forEach((s, i) => {
                const u = s[1] === 'lok' ? pick(L, i) : pick(A, i), lv = s[1] === 'lok' ? 'Elektrovoz mashinisti' : 'Haydovchi';
                MS.demo.push({ id: 'demo' + now.toString(36) + k + i, demo: true, lvl: k, st: k === 'y' && i > 2 ? 'hal' : i === 1 && k !== 'j' ? 'yolda' : 'ochiq', at: new Date(now - (i * 11 + 3) * 60000).toISOString(),
                    tabel: '', name: 'Demo xodim ' + (MS.demo.length + 1), lav: lv, unitId: u ? u.id : null, unitName: u ? hrName(u) : 'Texnika', tarkibNo: s[1] === 'lok' ? String(10 + i) : '', vagN: s[1] === 'lok' ? 13 : 0,
                    joyName: (msDemoPt(i + MS.demo.length) || [pl(i)])[0], xy: (msDemoPt(i + MS.demo.length) || [])[1] || null, izoh: s[0], ack: i === 1 && k !== 'j' ? [{ name: 'Demo usta', at: new Date(now - 4 * 60000).toISOString() }] : [], fixBy: k === 'y' && i > 2 ? 'Demo xodim' : '', fixAt: new Date(now - 60000).toISOString() });
            });
            nsBadge(); nsOpen(); showToast('🧪 Demo: ' + NS_LVL[k].ic + ' ' + S.length + ' ta holat qoʻshildi — ❗ tugmasi eng jiddiy rangda miltillaydi');
        }
        function msDemoPt(i) { // demo joylari: karyer, ko'rik stansiyalari, bunkerlar (sxema koordinatasi)
            try { const P = [['Qolmaqir stansiyasi', KR_PT.kal], ['Porodnaya stansiyasi', KR_PT.por], ['KKD bunkeri', KR_PT.kkd], ['ODI bunkeri', KR_PT.odi], ['Otval', KR_PT.otv]].concat(KR_EX.map(e => ['Karyer, ' + e.nm, e.p])); return P[i % P.length]; } catch (e) { return null; }
        }
        // Yangi signal kelganda: ovoz, tebranish, jiddiy bo'lsa — ekranga chiqadi
        function nsCheckNew() {
            if (!msOn()) return; const un = nsUnseen().filter(n => !n.demo && n.st !== 'hal' && !MS.alerted[n.id] && n.tabel !== meTabel()); if (!un.length) return nsBadge();
            un.forEach(n => { MS.alerted[n.id] = 1; }); nsBadge();
            try { if (typeof nsPlay === 'function') nsPlay(); } catch (e) {} try { navigator.vibrate && navigator.vibrate(nsTop(un) === 'j' ? [600, 200, 600, 200, 600] : [300]); } catch (e) {}
            const t = un.sort(nsSort)[0];
            if (t.lvl === 'j') nsDetail(t.id); else showToast(NS_LVL[t.lvl].ic + ' Nosozlik: ' + (t.unitName || '') + ' — ' + (t.name || ''));
        }

        // ---------------------------------------------------------------- 🆘 Nosozlik yuborish
        function nsAsk() {
            const sm = mySmena();
            mdl('nsAsk', `<div class="px-h"><b>🆘 Nosozlik signali</b><button class="mini-btn" onclick="mdlClose('nsAsk')">✕</button></div>
                <div class="nd-tip">${sm ? '🚂 ' + escapeHtml(sm.unitName) : '⚠️ Smena ochilmagan — texnika koʻrsatilmaydi'}. Joylashuv va tarkib avtomatik qoʻshiladi.</div>
                <textarea id="nsIz" rows="2" placeholder="Qisqacha: nima boʻldi? (ixtiyoriy)" class="ns-ta"></textarea>
                ${['y', 'o', 'j'].map(k => `<button class="ns-lv l-${k}" onclick="nsSend('${k}')"><b>${NS_LVL[k].ic} ${NS_LVL[k].t}</b><span>${NS_LVL[k].d}</span><small>${NS_LVL[k].ex}</small></button>`).join('')}`);
            msGpsStart(true);
        }
        async function nsSend(lvl) {
            const sm = mySmena(), d = hrDB(), t = msTarkib(d, sm), u = sm ? msUnit(sm.unitId) : null, iz = (($id('nsIz') || {}).value || '').trim();
            if (lvl === 'j' && !await uiConfirm('🔴 JIDDIY — avariya holati.\nBarcha masʼullarga darhol signal ketadi. Yuborilsinmi?')) return;
            const joy = t ? t.joy : u && d.units[u.id] ? d.units[u.id].joy : '', g = MS.fix || (typeof curGpsFix === 'function' ? curGpsFix() : null);
            const n = nsS().put({ lvl: lvl, st: 'ochiq', at: msNow(), tabel: meTabel(), name: currentUser.name, lav: msLav(), unitId: u ? u.id : null, unitName: u ? hrName(u) : '', tarkibNo: t ? t.no : '', vagN: t ? t.vagonIds.length : 0,
                joy: joy || '', joyName: joy ? hrPlace(joy) : '', gps: g ? { lat: +(+g.lat).toFixed(6), lon: +(+g.lon).toFixed(6), acc: Math.round(g.acc || 0) } : null, izoh: iz, ack: [] });
            if (t && lvl !== 'y') { t.holat = 'kutish'; t.updAt = msNow(); t.updBy = authorStr(); t.vagonIds.forEach(id => dispEv(d, id, 'kutish', t.joy, 'Taʼmir kutmoqda')); }
            hrLog(d, `🆘 ${NS_LVL[lvl].t} nosozlik: ${n.unitName || '—'} — ${currentUser.name}${iz ? ': ' + iz : ''}`, NS_LVL[lvl].ic); hrSave(d);
            if (u) { u.history = u.history || []; u.history.unshift({ date: todayISO(), type: `🆘 Nosozlik (${NS_LVL[lvl].t.toLowerCase()}): ${iz || NS_LVL[lvl].d} — ${currentUser.name} (${nowHM()})`, author: authorStr(), src: 'ns', ns: n.id }); saveDB(false); }
            msSyncNow(); msPosSend(true); mdlClose('nsAsk'); nsBadge(); if ($id('screen-mash') && $id('screen-mash').classList.contains('active')) mashRender();
            showToast(NS_LVL[lvl].ic + ' Signal yuborildi — masʼullar xabardor qilinmoqda');
        }
        function msSyncNow() { try { if (typeof syncReady === 'function' && syncReady()) { clearTimeout(SYNC.pushT); syncNow(true); } } catch (e) {} }

        // ---------------------------------------------------------------- 📍 Joylashuv (faqat smena davomida)
        function msGpsStart(once) {
            if (!navigator.geolocation) return; if (MS.watch !== null && MS.watch !== undefined) return;
            const ok = p => { MS.fix = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() }; msTrack(MS.fix); msPosSend(); };
            const er = e => { if (!MS.gpsWarn) { MS.gpsWarn = 1; showToast(e && e.code === 1 ? '📍 Joylashuvga ruxsat berilmadi — sozlamalardan ruxsat bering' : '📍 GPS signali yoʻq'); } };
            if (once && !mySmena()) { try { navigator.geolocation.getCurrentPosition(ok, er, { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }); } catch (e) {} return; }
            try { MS.watch = navigator.geolocation.watchPosition(ok, er, { enableHighAccuracy: true, timeout: 30000, maximumAge: 15000 }); } catch (e) { MS.watch = null; }
            clearInterval(MS.posT); MS.posT = setInterval(() => msPosSend(), 60000);
        }
        function msGpsStop() {
            try { if (MS.watch !== null && MS.watch !== undefined) navigator.geolocation.clearWatch(MS.watch); } catch (e) {} MS.watch = null; clearInterval(MS.posT); MS.fix = null;
            try { if (syncReady()) sbFetch('/api/pos/v1', { method: 'POST', body: { off: 1 } }).catch(() => {}); } catch (e) {}
        }
        function msPosSend(force) {
            const sm = mySmena(); if (!MS.fix || !sm) return; if (!force && Date.now() - MS.sent < 25000) return; MS.sent = Date.now();
            const sos = nsAll().filter(n => n.tabel === meTabel() && n.st !== 'hal' && !n.demo);
            try { if (syncReady()) sbFetch('/api/pos/v1', { method: 'POST', body: { lat: MS.fix.lat, lon: MS.fix.lon, acc: MS.fix.acc, unit: sm.unitName, uid: String(sm.unitId), sos: nsTop(sos) || '' } }).catch(() => {}); } catch (e) {}
        }
        async function msPosLoad(force) {
            if (!force && Date.now() - MS.posAt < 12000) return MS.pos; MS.posAt = Date.now();
            try { if (syncReady()) MS.pos = (await sbFetch('/api/pos/v1')) || []; } catch (e) {} return MS.pos;
        }
        // ---------------------------------------------------------------- ⛽ Masofa (GPS) va yoqilg'i sarfi
        //  Elektrovozdan boshqa barcha yoqilg'i bilan yuradigan texnika. Norma (texnika bo'yicha) mashinist o'zi kiritadi:
        //  «L/100 km» (avtomobil, traktor) yoki «L/soat» (teplovoz, ekskavator, kran — motosoat). Masofa — GPS nuqtalari orasidan.
        function fnS() { return agmkStore('fnorm'); }
        function msElec(v) { try { return !!v && v.kind === 'lok' && typeof hdKind === 'function' && hdKind(v) === 'el'; } catch (e) { return false; } }
        function msNorm(uid) { return fnS().get(String(uid)) || null; }
        function msFuel(sm, upTo) {
            const u = msUnit(sm.unitId); if (!u || msElec(u)) return null; const N = msNorm(sm.unitId); if (!N || !(+N.v > 0)) return { need: 1 };
            const km = (sm.m || 0) / 1000, hMov = (sm.mov || 0) / 3600, hAll = ((upTo ? new Date(upTo).getTime() : sm.end ? new Date(sm.end).getTime() : Date.now()) - new Date(sm.start).getTime()) / 36e5;
            const l = N.t === 'h' ? (N.w === 'all' ? hAll : hMov) * +N.v : km * +N.v / 100; return { l: Math.round(l * 10) / 10, N: N };
        }
        function msDur(sec) { sec = Math.max(0, Math.round(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60; return (h ? h + ' soat ' : '') + m + ' daq'; }
        function msTrip(sm) { const all = ((sm.end ? new Date(sm.end).getTime() : Date.now()) - new Date(sm.start).getTime()) / 1000, f = msFuel(sm); return { all: all, mov: sm.mov || 0, km: Math.round((sm.m || 0) / 100) / 10, f: f }; }
        function msTripTxt(sm) { const T = msTrip(sm); return msDur(T.all) + ' › ' + T.km.toLocaleString('ru') + ' km' + (T.f ? T.f.need ? ' › ⛽ norma kiritilmagan' : ' › ⛽ ' + T.f.l.toLocaleString('ru') + ' L' : ''); }
        function msTrack(f) { // GPS nuqtalaridan masofa: aniqligi past nuqta va «sakrash»lar hisobga olinmaydi
            const sm = mySmena(); if (!sm || !f || (f.acc || 99) > 60) return; const P = MS.tp;
            if (!P || P.sid !== sm.id) { MS.tp = { sid: sm.id, lat: f.lat, lon: f.lon, t: f.t, dm: 0, dmov: 0, saved: Date.now() }; return; }
            const d = geoDist([P.lat, P.lon], [f.lat, f.lon]), dt = Math.max(1, (f.t - P.t) / 1000), v = d / dt * 3.6;
            if (d < Math.max(12, (f.acc || 10) * 0.8)) { if (dt > 600) P.t = f.t; return; } // joyida turibdi (GPS tebranishi)
            if (v > 120) { Object.assign(P, { lat: f.lat, lon: f.lon, t: f.t }); return; } // signal sakrashi
            P.dm += d; if (v > 2) P.dmov += dt; Object.assign(P, { lat: f.lat, lon: f.lon, t: f.t });
            if (P.dm > 300 || Date.now() - P.saved > 120000) msTrackSave();
        }
        function msTrackSave() {
            const P = MS.tp, sm = mySmena(); if (!P || !sm || P.sid !== sm.id || (!P.dm && !P.dmov)) return;
            smS().put(Object.assign({}, sm, { m: Math.round((sm.m || 0) + P.dm), mov: Math.round((sm.mov || 0) + P.dmov) })); P.dm = 0; P.dmov = 0; P.saved = Date.now();
            const el = $id('msTrip'); if (el) el.innerHTML = msTripHtml(mySmena());
        }
        function msTripHtml(sm) {
            const T = msTrip(sm), u = msUnit(sm.unitId), el = msElec(u), N = msNorm(sm.unitId);
            return `<div class="ms-trip"><div><span>⏱ Smena</span><b>${msDur(T.all)}</b><small>harakatda ${msDur(T.mov)}</small></div><div><span>🛣 Masofa (GPS)</span><b>${T.km.toLocaleString('ru')} km</b><small>${MS.fix ? 'yozilmoqda' : 'GPS kutilmoqda'}</small></div>
                <div><span>⛽ Yoqilgʻi</span><b>${el ? '— (elektrovoz)' : T.f && !T.f.need ? T.f.l.toLocaleString('ru') + ' L' : '—'}</b><small>${el ? '' : N ? 'norma ' + N.v + (N.t === 'h' ? ' L/soat' : ' L/100 km') : '<u>norma kiritilmagan</u>'}</small></div></div>
                ${el ? '' : `<button class="mini-btn" onclick="msNormEdit(${JSON.stringify(sm.unitId)})">⛽ Yoqilgʻi normasi${N ? ': ' + N.v + (N.t === 'h' ? ' L/soat' : ' L/100 km') : ' — kiritish'}</button>`}`;
        }
        function msNormEdit(uid) {
            const v = msUnit(uid), N = msNorm(uid) || { t: v && (v.kind === 'lok' || /ekskavator|kran|buldozer|yuklagich/i.test(v.type || '')) ? 'h' : 'km', v: '' };
            mdl('msNorm', `<div class="px-h"><b>⛽ Yoqilgʻi normasi — ${escapeHtml(v ? hrName(v) : '')}</b><button class="mini-btn" onclick="mdlClose('msNorm')">✕</button></div>
                <div class="nd-tip">Texnikangiz sarfini oʻzingiz bilasiz — bir marta kiritasiz, keyin har smenada masofa / vaqtga qarab avtomatik hisoblanadi. Bu texnikada ishlaydigan boshqa mashinistlarda ham shu norma turadi.</div>
                <div class="kr-seg"><button id="msNt-km" class="${N.t !== 'h' ? 'on' : ''}" onclick="MS.nt='km'; $id('msNt-km').classList.add('on'); $id('msNt-h').classList.remove('on')">🛣 L / 100 km</button><button id="msNt-h" class="${N.t === 'h' ? 'on' : ''}" onclick="MS.nt='h'; $id('msNt-h').classList.add('on'); $id('msNt-km').classList.remove('on')">⏱ L / soat (motosoat)</button></div>
                <input id="msNv" class="ns-ta" type="number" inputmode="decimal" step="0.1" min="0" placeholder="masalan 13.5" value="${escapeHtml(String(N.v || ''))}">
                <label class="ms-chk"><input type="checkbox" id="msNw" ${N.w === 'all' ? 'checked' : ''}> L/soat boʻlsa — butun smena vaqti boʻyicha (belgilanmasa — faqat harakatdagi vaqt)</label>
                <button class="action-btn" onclick="msNormSave(${JSON.stringify(uid)})">💾 Saqlash</button>`);
            MS.nt = N.t === 'h' ? 'h' : 'km';
        }
        function msNormSave(uid) {
            const v = +String(($id('msNv') || {}).value || '').replace(',', '.'); if (!(v > 0 && v < 1000)) { alert('Normani toʻgʻri kiriting (masalan 13.5).'); return; }
            fnS().put({ id: String(uid), t: MS.nt === 'h' ? 'h' : 'km', v: Math.round(v * 100) / 100, w: $id('msNw') && $id('msNw').checked ? 'all' : 'mov', who: currentUser.name });
            mdlClose('msNorm'); msSyncNow(); if ($id('screen-mash') && $id('screen-mash').classList.contains('active')) mashRender(); showToast('⛽ Norma saqlandi');
        }
        function msFuelRep(days) {
            const from = Date.now() - (days || 1) * 864e5, L = smS().all().filter(s => new Date(s.end || Date.now()).getTime() >= from).sort((a, b) => String(b.start).localeCompare(String(a.start)));
            return L.map(s => { const T = msTrip(s); return { s: s, T: T }; });
        }
        function msFuelHtml() {
            const days = MS.rd || 1, R = msFuelRep(days), E = escapeHtml; let km = 0, l = 0; R.forEach(x => { km += x.T.km; if (x.T.f && !x.T.f.need) l += x.T.f.l; });
            return `<div class="kr-seg">${[[1, 'Bugun'], [7, '7 kun'], [30, '30 kun']].map(d => `<button class="${days === d[0] ? 'on' : ''}" onclick="MS.rd=${d[0]}; mashRender()">${d[1]}</button>`).join('')}<button onclick="msFuelXlsx()">📊 Excel</button></div>
                <div class="ns-sum"><div><b>${R.length}</b><span>smena</span></div><div><b>${(Math.round(km * 10) / 10).toLocaleString('ru')}</b><span>km (GPS)</span></div><div><b>${(Math.round(l * 10) / 10).toLocaleString('ru')}</b><span>litr yoqilgʻi</span></div></div>
                ${R.map(x => `<div class="ms-row"><span>${x.s.kind === 'lok' ? '🚂' : x.s.kind === 'avto' ? '🚜' : '🛤️'}</span><div><b>${E(x.s.unitName)}</b><small>👤 ${E(x.s.name)} · ${E(msHM(x.s.start))}${x.s.end ? '–' + E(msHM(x.s.end)) : ' (smenada)'}<br>${E(msTripTxt(x.s))}</small></div><button onclick="trkShow('${E(String(x.s.unitId))}', '${msDay(x.s.start)}', ${E(JSON.stringify(x.s.unitName + ' — ' + x.s.name))})">🗺</button></div>`).join('') || '<div class="hs-ok">Bu davrda smena yoʻq.</div>'}`;
        }
        function msFuelXlsx() {
            const R = msFuelRep(MS.rd || 1), rows = [['Texnika', 'Xodim', 'Tabel', 'Boshlandi', 'Tugadi', 'Smena, soat', 'Harakatda, soat', 'Masofa (GPS), km', 'Norma', 'Yoqilgʻi, L']];
            R.forEach(x => { const N = msNorm(x.s.unitId); rows.push([x.s.unitName, x.s.name, x.s.tabel, fmtDT(x.s.start), x.s.end ? fmtDT(x.s.end) : 'smenada', Math.round(x.T.all / 36) / 100, Math.round(x.T.mov / 36) / 100, x.T.km, N ? N.v + (N.t === 'h' ? ' L/soat' : ' L/100 km') : '', x.T.f && !x.T.f.need ? x.T.f.l : '']); });
            xlsxDl(rows, 'Yoqilgi sarfi ' + todayISO());
        }
        // GPS xaritasida: smenadagi xodimlar (ism + texnika) va GPS'li nosozliklar
        function msMapDraw() {
            if (!GD.map || !GD.on || typeof L === 'undefined') return;
            if (!GD.msLay) GD.msLay = L.layerGroup().addTo(GD.map); GD.msLay.clearLayers(); if (!msOn()) return;
            const E = escapeHtml, open = nsOpenList(), lv = t => nsTop(open.filter(n => n.tabel === t && !n.demo));
            MS.pos.filter(p => !msIsRoad(p)).forEach(p => { const k = p.sos || lv(p.tabel);
                L.marker([p.lat, p.lon], { icon: L.divIcon({ className: 'gd-ic', html: `<div class="ms-mk${k ? ' l-' + k : ''}" onclick="msPosFocus('${E(p.tabel)}')"><b>${k ? NS_LVL[k].ic : '👤'}</b> ${E(p.name)}<small>${E(p.unit || '')}${(() => { const sm = msActive().find(x => x.tabel === p.tabel); return sm ? ' · ' + E(msTripTxt(sm).split(' › ').slice(1).join(' · ')) : ''; })()}${p.ago > 120 ? ' · ' + Math.round(p.ago / 60) + ' daq oldin' : ''}</small></div>`, iconSize: [0, 0] }), zIndexOffset: 900 }).addTo(GD.msLay); });
            open.filter(n => n.demo && n.xy).forEach(n => { const ll = ygToLL(n.xy[0], n.xy[1]); L.marker(ll, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="ms-mk l-${n.lvl}" onclick="nsDetail('${n.id}')"><b>${NS_LVL[n.lvl].ic}</b> ${E(n.unitName || '')}<small>${E(n.name || '')} · DEMO</small></div>`, iconSize: [0, 0] }), zIndexOffset: 950 }).addTo(GD.msLay); });
            open.filter(n => n.gps && !MS.pos.some(p => p.tabel === n.tabel)).forEach(n => L.marker([n.gps.lat, n.gps.lon], { icon: L.divIcon({ className: 'gd-ic', html: `<div class="ms-mk l-${n.lvl}" onclick="nsDetail('${n.id}')"><b>${NS_LVL[n.lvl].ic}</b> ${E(n.unitName || '')}<small>${E(n.name || '')}</small></div>`, iconSize: [0, 0] }), zIndexOffset: 950 }).addTo(GD.msLay));
        }
        function msIsRoad(p) { const u = msUnit(+p.uid) || msUnit(p.uid); return !!u && u.kind === 'avto'; }
        function msPosFocus(tabel) { const sm = msActive().find(s => s.tabel === tabel); if (!sm) return; if (sm.tarkibId && typeof gxFocus === 'function') gxFocus({ kind: 'real', tid: sm.tarkibId }); else openPassport(sm.unitId); }
        function msMapTick() { if (!GD.on) { clearInterval(MS.mapT); MS.mapT = null; return; } if (!(msOn() && nsResp())) return; msPosLoad().then(msMapDraw); }

        // ---------------------------------------------------------------- 🚂 Mashinistlar bo'limi
        function mashOpen(tab) {
            if (!msOn()) { showToast('Bu boʻlim hozircha sinov guruhida'); return; }
            if (tab) MS.tab = tab; else MS.tab = mashIs() && !isAdmin() ? 'smena' : MS.tab || 'smena';
            secScreen('screen-mash', '🚂 Mashinistlar', "openScreen('screen-main')"); openScreen('screen-mash'); mashRender();
        }
        function mashTab(t) { MS.tab = t; mashRender(); }
        function mashRender() {
            const tabs = [['smena', '🚂 Mening smenam'], ['nosoz', '🆘 Nosozliklar']]; if (nsResp()) tabs.push(['xodim', '👥 Smenadagilar'], ['fuel', '⛽ Yoqilgʻi']);
            if (!tabs.some(x => x[0] === MS.tab)) MS.tab = 'smena';
            secTabs('screen-mash', tabs, MS.tab, 'mashTab'); const b = secBody('screen-mash');
            b.innerHTML = MS.tab === 'smena' ? mashSmenaHtml() : MS.tab === 'nosoz' ? mashNosozHtml() : MS.tab === 'fuel' ? msFuelHtml() : mashXodimHtml();
            if (MS.tab === 'smena' && $id('msVQ')) { $id('msVQ').value = MS.vq; mashVagFind(); }
            if (MS.tab === 'xodim') msPosLoad(true).then(() => { if (MS.tab === 'xodim' && $id('msXL')) $id('msXL').innerHTML = mashXodimList(); });
        }
        function mashSmenaHtml() {
            const sm = mySmena(), E = escapeHtml, sos = `<button class="ms-sos" onclick="nsAsk()"><b>🆘</b><span>NOSOZLIK</span><small>ish toʻxtasa — albatta bosing</small></button>`;
            if (!sm) return `<div class="ms-hello">👋 ${E(currentUser.name)}<small>${E(msLav())}</small></div>
                <div class="ms-pick-box"><div class="ms-ph">✅ Smenani qabul qilish — qabul qilgan texnikangizni tanlang</div>${msPickHtml()}</div>
                <div class="nd-tip">Lokomotiv boʻlsa — ulangan vagonlarni oʻzingiz tarkibga qoʻshasiz; dispetcherning Harakat tarkibida va GPS xaritada darhol koʻrinadi.<br>📍 Joylashuvingiz faqat smena davomida va faqat korxona serveriga yuboriladi; smenani topshirganda oʻchadi.</div>${sos}`;
            const d = hrDB(), t = msTarkib(d, sm), u = msUnit(sm.unitId), mine = nsAll().filter(n => n.tabel === meTabel() && n.st !== 'hal' && !n.demo);
            let h = `<div class="ms-card"><div class="ms-ch"><span>${sm.kind === 'lok' ? '🚂' : sm.kind === 'avto' ? '🚜' : '🛤️'}</span><div><b>${E(sm.unitName)}</b><small>Smena ${E(msHM(sm.start))} dan · ${E(msAgo(sm.start))}</small></div></div>
                <div class="ms-gps">${MS.fix ? '📍 Joylashuv yuborilmoqda (±' + Math.round(MS.fix.acc || 0) + ' m)' : '📍 GPS kutilmoqda…'}</div><div id="msTrip">${msTripHtml(sm)}</div>
                <div class="ms-b2"><button onclick="openPassport(${JSON.stringify(sm.unitId)})"${u ? '' : ' disabled'}>📄 Pasport</button><button class="end" onclick="mashEnd()">🔴 Smenani topshirish</button></div></div>`;
            h += sos + (mine.length ? mine.map(nsCard).join('') : '');
            if (t) {
                const vs = t.vagonIds.map(msUnit).filter(Boolean);
                h += `<div class="inf-sec">🚃 Tarkib №${E(t.no)} — ${vs.length} ta vagon</div>
                    <div class="ms-hol">${Object.keys(HR_T).map(k => `<button class="${t.holat === k ? 'on' : ''}" onclick="mashHol('${k}')">${HR_T[k][0]} ${HR_T[k][1]}</button>`).join('')}</div>
                    <div class="hr-f"><label>HOZIRGI JOYI</label><select onchange="mashJoy(this.value)">${hrPlaceOpts(t.joy)}</select></div>
                    <div class="ms-vags">${vs.map(v => `<i class="${v.status === "Ta'mir talab" ? 'w' : ''}" style="--vc:${msVC(v)}">№${E(vagonNo(v))}<small>${E(v.type || '')}</small><b onclick="mashVagDel(${v.id})">✕</b></i>`).join('') || '<div class="nd-tip">Hali vagon qoʻshilmagan.</div>'}</div>
                    ${(t.tow || []).map(id => msUnit(id)).filter(Boolean).map(v => `<div class="trk-tow"><div>🔧 <b>${E(hrName(v))}</b> — taʼmirga tortib ketilmoqda${t.towTo ? ' → ' + E(hrPlace(t.towTo)) : ''}</div><button onclick="trkTowArrive('${E(t.id)}', ${v.id})">✅ Yetib keldi — taʼmirga topshirish</button></div>`).join('')}
                    <div class="ms-b2"><button onclick="trkTowAsk('${E(t.id)}')">🔧 Buzilgan lokomotivni ulash</button><button onclick="trkPage('${E(t.id)}')">📄 Tarkib sahifasi</button></div>
                    <div class="hr-f"><label>➕ VAGON QOʻSHISH (raqami yoki inventar)</label><input id="msVQ" inputmode="numeric" placeholder="🔍 masalan 8121" oninput="MS.vq=this.value; mashVagFind()"></div><div class="hr-pick" id="msVL"></div>`;
            }
            return h;
        }
        function msVC(v) { // pasportdagi yagona rang palitrasi (TYPE_C)
            try { const t = (typeof vTypeFull === 'function' ? vTypeFull(v) : String(v.type || '')).toLowerCase(), k = /dumpkar/.test(t) ? (/115/.test(t) ? 'd115' : /60/.test(t) ? 'd60' : 'd105') : /cistern|sistern/.test(t) ? 'cis' : /platform/.test(t) ? 'plat' : /xopper|hopper/.test(t) ? 'hop' : /poluvagon/.test(t) ? 'gon' : /yopiq/.test(t) ? 'box' : '';
                return (typeof TYPE_C !== 'undefined' && TYPE_C[k]) || '#64748b'; } catch (e) { return '#64748b'; }
        }
        function mashVagFind() {
            const el = $id('msVL'); if (!el) return; const q = aiNorm(MS.vq || '').trim(); if (!q) { el.innerHTML = ''; return; }
            const d = hrDB(), t = msTarkib(d, mySmena()), where = {}; d.tarkiblar.forEach(x => x.vagonIds.forEach(id => { where[id] = x; }));
            const l = onlyVagons().filter(v => aiNorm(vagonNo(v) + ' ' + (v.inv || '')).includes(q)).slice(0, 25);
            el.innerHTML = l.map(v => { const w = where[v.id], rep = hrInRepair(v), mineV = t && w === t;
                return `<div class="${rep || mineV ? 'dis' : ''}" onclick="${rep || mineV ? '' : 'mashVagAdd(' + v.id + ')'}">№${escapeHtml(vagonNo(v))} <small>${escapeHtml(v.type || '')}${rep ? "<br>🔧 ta'mirda" : mineV ? '<br>✅ tarkibingizda' : w ? '<br>tarkib №' + escapeHtml(w.no) + ' — qabul qilish' : v.status === "Ta'mir talab" ? "<br>⚠️ ta'mir talab" : ''}</small></div>`; }).join('') || '<div>Topilmadi</div>';
        }
        // Texnikani tanlash: park → guruh → texnika (bo'limga kirganda smena yo'q bo'lsa — darhol shu oyna)
        var MS_PARK = [['lok', '🚂', 'Lokomotiv parki', 'Elektrovoz va teplovozlar'], ['avto', '🚜', 'Avtotraktor parki', 'Yuk avtomobili, traktor, ekskavator, yuklagich, avtobus…'], ['yol', '🛤️', 'Temir yoʻl texnikasi', 'Drezina, motovoz, kran, yoʻl mashinalari (rels ustida)']];
        function msGroup(v) { if (v.kind === 'lok') return typeof hdKind === 'function' && hdKind(v) === 'el' ? 'Elektrovozlar' : 'Teplovozlar'; return v.type || 'Boshqa'; }
        function msGroupIc(g) { return /Elektrovoz/.test(g) ? '⚡' : /Teplovoz/.test(g) ? '🛢' : /Yuk avtomob/.test(g) ? '🚚' : /Traktor/.test(g) ? '🚜' : /Buldozer|ekskavator/i.test(g) ? '🏗' : /yuklagich/i.test(g) ? '🦺' : /Avtobus/.test(g) ? '🚌' : /Yengil/.test(g) ? '🚗' : /Tirkama/.test(g) ? '🛻' : /Moto/.test(g) ? '🏍' : /kran/i.test(g) ? '🏗' : /drezin|motris/i.test(g) ? '🚃' : '🔧'; }
        function msPickHtml() {
            const E = escapeHtml, P = MS.pk || {}, busy = {}; msActive().forEach(s => { if (s.tabel !== meTabel()) busy[s.unitId] = s.name; });
            const crumb = `<div class="ms-crumb"><b onclick="MS.pk={}; mashRender()">🏁 Park</b>${P.park ? ` › <b onclick="MS.pk={park:'${P.park}'}; mashRender()">${E(MS_PARK.find(x => x[0] === P.park)[2])}</b>` : ''}${P.g ? ' › <b>' + E(P.g) + '</b>' : ''}</div>`;
            if (!P.park) return crumb + `<div class="ms-step">1️⃣ Qaysi parkdan texnika qabul qildingiz?</div>` + MS_PARK.map(k => { const n = msUnits(k[0]).filter(v => !hrInRepair(v)).length; return `<div class="ms-big" onclick="MS.pk={park:'${k[0]}'}; mashRender()"><span>${k[1]}</span><div><b>${k[2]}</b><small>${k[3]}</small></div><em>${n}</em></div>`; }).join('');
            const all = msUnits(P.park);
            if (!P.g) { const G = {}; all.forEach(v => { const g = msGroup(v); G[g] = (G[g] || 0) + (hrInRepair(v) ? 0 : 1); });
                return crumb + `<div class="ms-step">2️⃣ Texnika turi</div>` + Object.keys(G).sort().map(g => `<div class="ms-big sm" onclick="MS.pk.g=${E(JSON.stringify(g))}; MS.q=''; mashRender()"><span>${msGroupIc(g)}</span><div><b>${E(g)}</b></div><em>${G[g]}</em></div>`).join(''); }
            const q = aiNorm(MS.q || '').trim(), l = all.filter(v => msGroup(v) === P.g && (!q || aiNorm(hrName(v) + ' ' + (v.inv || '') + ' ' + (v.num || '')).includes(q)));
            return crumb + `<div class="ms-step">3️⃣ Qaysi biri? — tanlang, smena sizning akkauntingizga biriktiriladi</div>
                <input id="msPQ" placeholder="🔍 Raqami yoki inventar…" value="${E(MS.q || '')}" oninput="MS.q=this.value; clearTimeout(MS.qt); MS.qt=setTimeout(()=>{ $id('msPL').innerHTML = msPickList(); },200)" class="ns-ta">
                <div class="ms-pl" id="msPL">${msPickList(l, busy)}</div>`;
        }
        function msPickList(l, busy) {
            const E = escapeHtml, P = MS.pk || {}; if (!busy) { busy = {}; msActive().forEach(s => { if (s.tabel !== meTabel()) busy[s.unitId] = s.name; }); }
            if (!l) { const q = aiNorm(MS.q || '').trim(); l = msUnits(P.park).filter(v => msGroup(v) === P.g && (!q || aiNorm(hrName(v) + ' ' + (v.inv || '') + ' ' + (v.num || '')).includes(q))); }
            return l.slice(0, 120).map(v => { const rep = hrInRepair(v); return `<div class="${rep ? 'dis' : ''}" onclick="${rep ? '' : 'mashTake(' + v.id + ')'}"><b>${E(hrName(v))}</b><small>${E(v.type || '')}${v.inv ? ' · inv. ' + E(v.inv) : ''}${rep ? " · 🔧 ta'mirda" : busy[v.id] ? ' · 👤 ' + E(busy[v.id]) + ' smenada' : ''}</small></div>`; }).join('') || '<div class="nd-tip">Topilmadi</div>';
        }
        function mashPick() { MS.pk = {}; MS.tab = 'smena'; mashOpen('smena'); }
        async function mashTake(id) {
            const v = msUnit(id); if (!v || hrInRepair(v)) return; const other = msActive().find(s => s.unitId === id && s.tabel !== meTabel());
            if (other && !await uiConfirm(hrName(v) + ' — ' + other.name + ' smenasida.\nSmenani undan qabul qilasizmi? (uning smenasi yopiladi)')) return;
            const old = mySmena(); if (old) smS().put(Object.assign({}, old, { end: msNow() }));
            if (other) smS().put(Object.assign({}, other, { end: msNow(), endBy: currentUser.name }));
            const d = hrDB(), kind = msKindOf(v), now = msNow(); let t = null;
            if (kind === 'lok') {
                t = d.tarkiblar.find(x => x.lokId === v.id);
                if (!t) { d.seq = (d.seq || 0) + 1; t = { id: 't' + Date.now().toString(36), no: String(d.seq), holat: 'kutish', lokId: v.id, joy: (d.units[v.id] || {}).joy || '', from: '', to: '', yuk: '', vagonIds: [] }; d.tarkiblar.push(t); delete d.units[v.id]; }
                Object.assign(t, { mashinist: currentUser.name, updAt: now, updBy: authorStr() });
            } else d.units[v.id] = Object.assign({}, d.units[v.id] || {}, { holat: 'ishda', updAt: now, since: now, by: authorStr() });
            hrLog(d, `👤 ${currentUser.name} smenani qabul qildi: ${hrName(v)}${t ? ' (tarkib №' + t.no + ')' : ''}`, '✅'); hrSave(d);
            smS().put({ tabel: meTabel(), name: currentUser.name, lav: msLav(), unitId: v.id, kind: kind, unitName: hrName(v), tarkibId: t ? t.id : '', start: now });
            MS.pk = {}; MS.q = ''; MS.tab = 'smena'; msGpsStart(); msSyncNow(); nsBadge(); mashOpen('smena'); showToast('✅ Smena qabul qilindi: ' + hrName(v));
        }
        async function mashEnd() {
            msTrackSave(); const sm = mySmena(); if (!sm) return; if (!await uiConfirm('Smenani topshirasizmi?\n' + msTripTxt(sm) + '\nVagonlar tarkibda qoladi, joylashuv yuborish toʻxtaydi.')) return;
            const d = hrDB(), t = msTarkib(d, sm);
            if (t && t.mashinist === currentUser.name) { t.mashinist = ''; t.updAt = msNow(); t.updBy = authorStr(); }
            if (!t && d.units[sm.unitId]) d.units[sm.unitId] = Object.assign({}, d.units[sm.unitId], { holat: 'bosh', updAt: msNow(), since: msNow() });
            hrLog(d, `👤 ${currentUser.name} smenani topshirdi: ${sm.unitName}`, '🔚'); hrSave(d);
            const end = msNow(), f = msFuel(sm, end); smS().put(Object.assign({}, sm, { end: end, fuel: f && !f.need ? f.l : null })); MS.tp = null; msGpsStop(); msSyncNow(); nsBadge(); mashRender();
            showToast('🔚 Smena topshirildi: ' + msTripTxt(Object.assign({}, sm, { end: end })));
        }
        function mashMut(fn) { const sm = mySmena(); if (!sm) return; const d = hrDB(), t = msTarkib(d, sm); if (!t) return; if (fn(d, t) === false) return; t.updAt = msNow(); t.updBy = authorStr(); hrSave(d); msSyncNow(); mashRender(); }
        async function mashVagAdd(vid) {
            const v = msUnit(vid); if (!v || hrInRepair(v)) return; const d0 = hrDB(), t0 = msTarkib(d0, mySmena()), w = d0.tarkiblar.find(x => x !== t0 && x.vagonIds.includes(vid));
            if (w && !await uiConfirm('Vagon №' + vagonNo(v) + ' tarkib №' + w.no + ' da.\nUni oʻz tarkibingizga qabul qilasizmi?')) return;
            mashMut((d, t) => {
                const o = d.tarkiblar.find(x => x !== t && x.vagonIds.includes(vid)); if (o) { o.vagonIds = o.vagonIds.filter(i => i !== vid); o.updAt = msNow(); o.updBy = authorStr(); }
                if (!t.vagonIds.includes(vid)) t.vagonIds.push(vid); delete d.units[vid]; dispEv(d, vid, dispTH(t.holat), t.joy, '');
                hrLog(d, `🚃 Vagon №${vagonNo(v)} tarkib №${t.no} ga ulandi${o ? ' (tarkib №' + o.no + ' dan)' : ''} — ${currentUser.name}`, '🔗');
            });
            MS.vq = ''; showToast('🔗 №' + vagonNo(v) + ' tarkibga qoʻshildi');
        }
        async function mashVagDel(vid) {
            const v = msUnit(vid); if (!v || !await uiConfirm('Vagon №' + vagonNo(v) + ' tarkibdan uzilsinmi?\nU hozirgi joyda «Kutishda» holatida qoladi.')) return;
            mashMut((d, t) => { t.vagonIds = t.vagonIds.filter(i => i !== vid); d.units[vid] = { holat: 'kutish', joy: t.joy || '', izoh: '', sabab: '', updAt: msNow(), since: msNow(), by: authorStr() }; dispEv(d, vid, 'kutish', t.joy, ''); hrLog(d, `✂️ Vagon №${vagonNo(v)} tarkib №${t.no} dan uzildi — ${currentUser.name}`, '✂️'); });
        }
        function mashHol(h) {
            mashMut((d, t) => {
                if (h === 'yukli' && !t.vagonIds.length) { alert('Yuk bilan harakatlanish uchun avval vagonlarni qoʻshing.'); return false; }
                if (!t.joy && h !== 'kutish') { alert('Avval hozirgi joyni tanlang.'); return false; }
                if (t.holat !== h) t.vagonIds.forEach(id => dispEv(d, id, dispTH(h), t.joy, '')); t.holat = h; hrLog(d, `Tarkib №${t.no}: ${HR_T[h][1]} — ${hrPlace(t.joy)} (${currentUser.name})`, HR_T[h][0]);
            });
        }
        function mashJoy(j) { mashMut((d, t) => { t.joy = j; t.vagonIds.forEach(id => dispEv(d, id, dispTH(t.holat), j, '')); hrLog(d, `Tarkib №${t.no}: ${hrPlace(j)} (${currentUser.name})`, '📍'); }); }
        function mashNosozHtml() {
            const L = nsAll().filter(nsVisible).sort(nsSort).slice(0, 60);
            return `<button class="ms-sos small" onclick="nsAsk()"><b>🆘</b><span>NOSOZLIK</span></button><div class="ns-key">${['y', 'o', 'j'].map(k => `<div class="l-${k}"><b>${NS_LVL[k].ic} ${NS_LVL[k].t}</b><span>${NS_LVL[k].d}</span><small>${NS_LVL[k].ex}</small></div>`).join('')}</div>` + (L.length ? L.map(nsCard).join('') : '<div class="hs-ok">✅ Nosozlik yoʻq.</div>');
        }
        function mashXodimHtml() { return `<div class="ms-b2"><button onclick="gdOpen()">🚂 Temir yoʻl (sxema)</button><button onclick="nvOpen()">🚜 Avtotraktor (shahar xaritasi)</button></div><div class="ms-b2" style="margin-top:6px"><button onclick="bfStart()">🧪 Temir yoʻl demo</button><button onclick="rdStart()">🧪 Avtotraktor demo</button></div><div id="msXL">${mashXodimList()}</div>`; }
        function mashXodimList() {
            const E = escapeHtml, A = msActive().sort((a, b) => String(b.start).localeCompare(String(a.start)));
            if (!A.length) return '<div class="hs-ok">Hozir smenada hech kim yoʻq.</div>';
            return MS_PARK.map(k => { const g = A.filter(s => s.kind === k[0]); return g.length ? `<div class="inf-sec">${k[1]} ${escapeHtml(k[2])} — ${g.length}</div>` + msRows(g) : ''; }).join('');
        }
        function msRows(A) {
            const E = escapeHtml;
            return A.map(s => { const p = MS.pos.find(x => x.tabel === s.tabel), k = nsTop(nsOpenList().filter(n => n.tabel === s.tabel && !n.demo));
                return `<div class="ms-row${k ? ' l-' + k : ''}"><span>${s.kind === 'lok' ? '🚂' : s.kind === 'avto' ? '🚜' : '🛤️'}</span><div><b>${E(s.name)}</b><small>${E(s.unitName)} · ${E(msHM(s.start))} dan<br>${E(msTripTxt(s))}${p ? ' · 📍 ' + (p.ago < 90 ? 'hozir' : Math.round(p.ago / 60) + ' daq oldin') : ' · 📍 yoʻq'}</small></div>${p ? `<button onclick="msShow('${s.tabel}')">🛰</button>` : ''}</div>`; }).join('');
        }
        async function msShow(tabel) { const p = MS.pos.find(x => x.tabel === tabel); if (!p) return; await gdOpen(); setTimeout(() => { try { GD.map.setView([p.lat, p.lon], 16, { animate: false }); msMapDraw(); } catch (e) {} }, 400); }

        // ---------------------------------------------------------------- Ulash
        (function () {
            try {
                if (typeof ROLE_DEF !== 'undefined') {
                    if (!ROLE_DEF.some(x => x[0] === 'mash')) ROLE_DEF.push(['mash', '🚂', 'Mashinist / haydovchi / kranchi', 'Smenada texnikani qabul qiladi, tarkibga vagon qoʻshadi, 🆘 nosozlik signalini yuboradi']);
                    if (!ROLE_DEF.some(x => x[0] === 'hr')) ROLE_DEF.push(['hr', '🚦', 'Dispetcher', 'Harakat tarkibini yuritadi, ❗ nosozlik signallarini oladi, smenadagilarni xaritada koʻradi']);
                }
            } catch (e) {}
            agmkModule({ id: 'mash', icon: '🚂', title: 'Mashinistlar', search: 'mashinistlar mashinist haydovchi shofyor ekskavator kran smena nosozlik sos avariya undov', flag: 'mash', def: 'pilot', roles: ['mash', 'hr', 'tex', 'rahbar'], desc: 'Smenada texnikani qabul qilish, tarkibga vagon qoʻshish, 🆘 nosozlik signali, GPS', open: () => mashOpen() });
            ['smena', 'nosoz', 'nsseen', 'fnorm'].forEach(n => agmkStore(n));
            nsS().on(() => setTimeout(nsCheckNew, 0)); nsSeenS().on(() => setTimeout(nsBadge, 0)); smS().on(() => setTimeout(nsBadge, 0));
            // 🆘 tugma asosiy sahifada (smenadagi mashinist uchun)
            // 🆘 alohida tugma asosiy sahifada yo'q — ❗ Undov ichida (mashinist uchun) «Nosozlik yuborish»
            window.addEventListener('agmk:login', () => setTimeout(() => { nsBadge(); if (msOn() && mySmena()) msGpsStart(); nsCheckNew(); }, 1500));
            if (typeof updateRnBadges === 'function') updateRnBadges = agmkExtend('updateRnBadges', 'v3.6: undov', updateRnBadges, o => function () { const r = o.apply(this, arguments); nsBadge(); return r; });
            if (typeof gdOpen === 'function') { const oo = gdOpen; gdOpen = async function () { const r = await oo.apply(this, arguments); if (msOn() && nsResp()) { if (!MS.mapT) MS.mapT = setInterval(msMapTick, 15000); msPosLoad(true).then(msMapDraw); } return r; }; }
            if (typeof gdPanel === 'function') { const op = gdPanel; gdPanel = function () { op.apply(this, arguments); try { const p = $id('gdPanel'); if (!p || !msOn() || !nsResp()) return; let x = $id('msPan'); if (!x) { x = document.createElement('div'); x.id = 'msPan'; x.className = 'kr-kpi'; p.appendChild(x); } const o = nsOpenList(); x.innerHTML = `${MS.bf ? `🧪 Demo: <b>${MS.bf.list.length}</b> texnika <button class="mini-btn" onclick="bfStop()">⏹ Toʻxtatish</button> · ` : `<button class="mini-btn" onclick="bfStart()">🧪 Temir yoʻl demo</button> <button class="mini-btn" onclick="gdClose(); nvOpen()">🚜 Avtotraktor xaritasi</button> `}${GD.trkLay && GD.trkLay.getLayers().length ? '<button class="mini-btn" onclick="trkHide()">🕘 Yoʻlni yashirish</button> ' : ''}👥 Smenada: <b>${msActive().length}</b> xodim · 📍 xaritada: <b>${MS.pos.length}</b>${o.length ? ` · ❗ ochiq nosozlik: <b style="color:${NS_LVL[nsTop(o)].c}">${o.length}</b> <button class="mini-btn" onclick="nsOpen()">Koʻrish</button>` : ''}`; } catch (e) {} }; }
            setInterval(() => { if (!msOn()) return; nsBadge(); msTrackSave(); const el = $id('msTrip'), sm = mySmena(); if (el && sm) el.innerHTML = msTripHtml(sm); }, 60000);
            // Vagonlar bo'limida eslatma (⚠️) tugmasi kerak emas
            const st = document.createElement('style');
            st.textContent = `#warnBtn{display:none!important}
.ns-btn{position:absolute;top:92px;left:0;width:44px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.22);background:rgba(15,23,42,.85);color:#94a3b8;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;padding:0;--nc:#64748b}
.ns-btn.hidden{display:none}.ns-btn .ns-ic{width:24px;height:24px;border-radius:50%;border:2.5px solid currentColor;font:900 15px/19px system-ui;display:block;text-align:center}
.ns-btn i{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;line-height:18px;padding:0 5px;border-radius:9px;background:var(--nc);color:#0f172a;font:800 11px/18px system-ui;font-style:normal;box-shadow:0 0 0 2px #0f172a}
.ns-btn.l-y,.ns-btn.st-y{--nc:#22c55e}.ns-btn.l-o,.ns-btn.st-o{--nc:#eab308}.ns-btn.l-j,.ns-btn.st-j{--nc:#ef4444}
.ns-btn.st-y,.ns-btn.st-o,.ns-btn.st-j{color:var(--nc);border-color:var(--nc)}
.ns-btn.blink{color:#fff;border-color:var(--nc);animation:nsBlink 1s ease-in-out infinite}
@keyframes nsBlink{0%,100%{background:var(--nc);box-shadow:0 0 18px 4px var(--nc)}50%{background:rgba(15,23,42,.85);box-shadow:0 0 0 0 transparent;color:var(--nc)}}
.ms-fab{position:absolute;left:14px;bottom:18px;width:62px;height:62px;border-radius:50%;border:3px solid #fecaca;background:radial-gradient(circle at 35% 30%,#f87171,#b91c1c);color:#fff;font-size:24px;font-weight:900;z-index:40;box-shadow:0 6px 22px rgba(220,38,38,.6)}.ms-fab.hidden{display:none}
.ns-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.ns-sum div{border-radius:12px;padding:8px;text-align:center;background:rgba(15,23,42,.7);border:1.5px solid var(--nc)}.ns-sum b{display:block;font-size:22px;color:var(--nc)}.ns-sum span{font-size:12px}
.l-y{--nc:#22c55e}.l-o{--nc:#eab308}.l-j{--nc:#ef4444}
.ns-it{display:flex;gap:10px;align-items:stretch;border:1px solid #334155;border-radius:14px;margin:8px 0;background:rgba(15,23,42,.78);cursor:pointer;overflow:hidden}
.ns-it .ns-bar{width:6px;background:var(--nc);flex-shrink:0}.ns-it.new{border-color:var(--nc);box-shadow:0 0 0 1px var(--nc)}.ns-it.done{opacity:.6}.ns-it .ns-b{flex:1;padding:9px 0;min-width:0}
.ns-t{display:flex;justify-content:space-between;gap:6px;align-items:center}.ns-t b{color:var(--nc)}.ns-t span{font-size:11.5px;opacity:.7;white-space:nowrap}
.ns-s{font-weight:700;margin-top:3px}.ns-m{font-size:13px;margin-top:2px}.ns-f,.ns-st{font-size:12px;opacity:.8;margin-top:3px}.ns-nw{color:var(--nc)}.ns-ar{align-self:center;padding-right:10px;font-size:22px;opacity:.5}
.ns-demo{font-style:normal;font-size:10px;font-weight:800;background:#7c3aed;color:#fff;border-radius:6px;padding:1px 6px;margin-left:6px}
.ns-hero{display:flex;gap:12px;align-items:center;border-radius:16px;padding:12px;margin:8px 0;background:linear-gradient(135deg,var(--nc),rgba(15,23,42,.9) 70%);border:1.5px solid var(--nc)}.ns-hl{font-size:34px}.ns-hero b{display:block;font-size:15px}.ns-hero small{opacity:.85}
.ns-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ns-grid div{background:rgba(15,23,42,.7);border:1px solid #334155;border-radius:12px;padding:8px}.ns-grid span{display:block;font-size:11px;opacity:.7}.ns-grid b{display:block;font-size:13.5px;margin:2px 0}.ns-grid small{font-size:11.5px;opacity:.8}
.ns-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.ns-acts button,.ns-acts2 button{border-radius:12px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:10px 4px;font-size:12.5px;font-weight:700}.ns-acts button:disabled{opacity:.4}
.ns-acts2{display:flex;gap:8px;margin:8px 0}.ns-acts2 button{flex:1;padding:12px}.ns-acts2 .go{background:#0369a1}.ns-acts2 .ok{background:#15803d}.ns-acts2 .rep{background:#9a3412}
.ns-seen{background:linear-gradient(135deg,#0ea5e9,#2563eb)!important;margin:4px 0 8px;font-weight:800}.ns-log{font-size:12.5px;opacity:.85;margin:6px 0}.ns-ok{background:#334155!important;margin:6px 0}
.ns-demo-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:12px;padding-top:10px;border-top:1px dashed #475569;font-size:12px}.ns-demo-bar button{border-radius:10px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:6px 9px;font-size:12px}
.ns-ta{width:100%;box-sizing:border-box;margin:6px 0;border-radius:10px;padding:9px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;font:inherit}
.ns-lv{display:block;width:100%;text-align:left;margin:8px 0;padding:12px 14px;border-radius:14px;border:2px solid var(--nc);background:linear-gradient(90deg,color-mix(in srgb,var(--nc) 28%,#0f172a),#0f172a);color:#f8fafc}.ns-lv b{display:block;font-size:17px}.ns-lv span{display:block;font-size:13px;margin-top:2px}.ns-lv small{display:block;font-size:11.5px;opacity:.75;margin-top:2px}
.ms-sos{display:flex;flex-direction:column;align-items:center;width:100%;margin:12px 0;padding:16px;border-radius:20px;border:3px solid #fecaca;background:radial-gradient(circle at 30% 20%,#f87171,#b91c1c);color:#fff;box-shadow:0 8px 26px rgba(220,38,38,.45)}.ms-sos b{font-size:34px}.ms-sos span{font-size:20px;font-weight:900;letter-spacing:2px}.ms-sos small{opacity:.9}.ms-sos.small{flex-direction:row;justify-content:center;gap:10px;padding:10px}.ms-sos.small b{font-size:22px}
.ms-hello{font-size:18px;font-weight:800;margin:6px 0}.ms-hello small{display:block;font-size:12.5px;font-weight:400;opacity:.75}.ms-take{margin:8px 0}
.ms-card{border:1px solid #334155;border-radius:16px;padding:12px;background:rgba(15,23,42,.8)}.ms-ch{display:flex;gap:10px;align-items:center}.ms-ch span{font-size:30px}.ms-ch b{display:block;font-size:16px}.ms-ch small{opacity:.75}
.ms-gps{font-size:12.5px;opacity:.85;margin:8px 0}.ms-b2{display:flex;gap:8px}.ms-b2 button{flex:1;border-radius:12px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:10px;font-weight:700}.ms-b2 .end{background:#7f1d1d;border-color:#b91c1c}
.ms-trip{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.ms-trip div{background:rgba(2,6,23,.55);border:1px solid #334155;border-radius:12px;padding:7px}.ms-trip span{display:block;font-size:11px;opacity:.7}.ms-trip b{display:block;font-size:15px;margin:2px 0}.ms-trip small{font-size:10.5px;opacity:.75}.ms-chk{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;margin:6px 0 10px}.ms-chk input{width:auto}.ms-hol{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.ms-hol button{border-radius:10px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:9px 4px;font-size:12.5px}.ms-hol button.on{background:#0ea5e9;border-color:#38bdf8;font-weight:800}
.ms-vags{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.ms-vags i{font-style:normal;position:relative;padding:6px 26px 6px 9px;border-radius:10px;background:rgba(30,41,59,.95);border:1.5px solid var(--vc);font-weight:700;font-size:13px}.ms-vags i.w{box-shadow:0 0 0 1.5px #ef4444}.ms-vags i small{display:block;font-weight:400;font-size:10.5px;opacity:.7}.ms-vags i b{position:absolute;right:6px;top:50%;transform:translateY(-50%);cursor:pointer;opacity:.7}
.ms-pick-box{border:1px solid #334155;border-radius:16px;padding:10px;background:rgba(15,23,42,.8);margin:8px 0}.ms-ph{font-weight:800;margin-bottom:6px}.ms-crumb{font-size:12.5px;opacity:.9;margin:4px 0 8px}.ms-crumb b{color:#7dd3fc;cursor:pointer}.ms-step{font-size:13px;font-weight:700;margin:6px 0}.ms-big{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid #334155;border-radius:14px;margin:6px 0;background:rgba(30,41,59,.85);cursor:pointer}.ms-big:active{transform:scale(.98)}.ms-big span{font-size:28px}.ms-big.sm span{font-size:22px}.ms-big div{flex:1}.ms-big b{display:block}.ms-big small{opacity:.75;font-size:12px}.ms-big em{font-style:normal;font-weight:800;background:#0ea5e9;border-radius:10px;padding:2px 9px;font-size:12.5px}.ms-pl div{padding:10px;border-bottom:1px solid #334155;cursor:pointer}.ms-pl div.dis{opacity:.45;cursor:default}.ms-pl b{display:block}.ms-pl small{opacity:.75}
.ns-key{display:grid;gap:6px;margin:8px 0}.ns-key div{border-left:5px solid var(--nc);background:rgba(15,23,42,.7);border-radius:10px;padding:7px 10px}.ns-key b{color:var(--nc)}.ns-key span{display:block;font-size:12.5px}.ns-key small{display:block;font-size:11.5px;opacity:.7}
.ms-row{display:flex;gap:10px;align-items:center;padding:10px;border:1px solid #334155;border-left:5px solid var(--nc,#334155);border-radius:12px;margin:6px 0;background:rgba(15,23,42,.75)}.ms-row span{font-size:24px}.ms-row div{flex:1}.ms-row b{display:block}.ms-row small{opacity:.75}.ms-row button{border-radius:10px;border:1px solid #475569;background:#1e293b;color:#fff;padding:8px 10px}
.ms-mk{transform:translate(-50%,-120%);width:max-content;max-width:220px;background:rgba(15,23,42,.92);border:2px solid #38bdf8;border-radius:10px;padding:3px 8px;color:#f1f5f9;font-size:11.5px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.5)}.ms-mk small{display:block;font-weight:400;font-size:10.5px;opacity:.8}.ms-mk.l-y,.ms-mk.l-o,.ms-mk.l-j{border-color:var(--nc);animation:nsBlink 1s infinite}
@media (min-width:720px){.ns-btn{width:52px;height:46px}.ms-sos b{font-size:40px}.ns-grid{grid-template-columns:repeat(4,1fr)}}`;
            document.head.appendChild(st);
        })();

        // =====================================================================
        // 🕘 BOSIB O'TILGAN YO'L (trayektoriya) — smena davomidagi GPS nuqtalari serverga, kun bo'yicha (90 kun saqlanadi)
        // =====================================================================
        MS.tq = []; MS.bf = null;
        function msDay(t) { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        // ---------- Avtotraktor holati GPS bo'yicha avtomatik: yuryapti — «Ishda», 10 daqiqadan ko'p joyida — «Kutishda» (sababi so'raladi) ----------
        var MS_WHY = ['Yuklash / tushirish', 'Topshiriq kutilmoqda', 'Tushlik / tanaffus', 'Yoqilgʻi quyish', 'Nosozlik', 'Hujjat rasmiylashtirilmoqda', 'Boshqa'], MS_STOP_MIN = 10;
        function msAutoState(f) {
            const sm = mySmena(); if (!sm || sm.kind !== 'avto' || !f || (f.acc || 99) > 60) return; const A = MS.as && MS.as.sid === sm.id ? MS.as : (MS.as = { sid: sm.id, mode: 'ishda', lat: f.lat, lon: f.lon, moveT: f.t });
            const far = geoDist([A.lat, A.lon], [f.lat, f.lon]) > Math.max(30, (f.acc || 10) * 1.5);
            if (far) { A.lat = f.lat; A.lon = f.lon; A.moveT = f.t; if (A.mode !== 'ishda') { A.mode = 'ishda'; msSetHol(sm, 'ishda', ''); mdlClose('msWhy'); } return; }
            if (A.mode !== 'kutish' && f.t - A.moveT > MS_STOP_MIN * 60e3) { A.mode = 'kutish'; msSetHol(sm, 'kutish', '', new Date(A.moveT).toISOString()); msWhyAsk(); }
        }
        function msSetHol(sm, h, why, since) {
            const d = hrDB(), now = new Date().toISOString(), u = d.units[sm.unitId] || {};
            d.units[sm.unitId] = Object.assign({}, u, { holat: h, sabab: why || '', updAt: now, since: since || now, by: authorStr(), auto: 1 });
            dispEv(d, sm.unitId, h, u.joy || '', why || ''); hrLog(d, `${h === 'ishda' ? '🟢' : '🟡'} ${sm.unitName}: ${h === 'ishda' ? 'harakatda — ishda' : 'toʻxtab turibdi' + (why ? ' (' + why + ')' : '')} — GPS boʻyicha (${currentUser.name})`, h === 'ishda' ? '🟢' : '🟡'); hrSave(d); msSyncNow();
        }
        function msWhyAsk() {
            mdl('msWhy', `<div class="px-h"><b>🟡 Texnika ${MS_STOP_MIN} daqiqadan beri turibdi</b><button class="mini-btn" onclick="mdlClose('msWhy')">✕</button></div>
                <div class="nd-tip">Nega turibsiz? Dispetcher koʻradi — turib qolish sababi bilan hisoblanadi. Yura boshlasangiz «Ishda» oʻzi qaytadi.</div>
                <div class="kr-seg" style="flex-wrap:wrap">${MS_WHY.map(w => `<button onclick="msWhySet(${escapeHtml(JSON.stringify(w))})">${escapeHtml(w)}</button>`).join('')}</div>`);
            try { navigator.vibrate && navigator.vibrate(200); } catch (e) {}
        }
        function msWhySet(w) { const sm = mySmena(); mdlClose('msWhy'); if (!sm) return; const d = hrDB(), u = d.units[sm.unitId] || {}; msSetHol(sm, 'kutish', w, u.since); if (w === 'Nosozlik') nsAsk(); else showToast('✅ Sabab: ' + w); }
        async function trkFlush() {
            const sm = mySmena(); if (!MS.tq.length || !sm) return; const pts = MS.tq.splice(0, 1500);
            try { if (!syncReady()) throw 0; await sbFetch('/api/trk/v1', { method: 'POST', body: { uid: String(sm.unitId), unit: sm.unitName, day: msDay(pts[0][0]), pts: pts } }); }
            catch (e) { MS.tq = pts.concat(MS.tq).slice(-5000); }
        }
        function trkKm(pts) { let m = 0; for (let i = 1; i < pts.length; i++) m += geoDist([pts[i - 1][1], pts[i - 1][2]], [pts[i][1], pts[i][2]]); return Math.round(m / 100) / 10; }
        async function trkShow(uid, day, title) {
            let L = []; try { L = await sbFetch('/api/trk/v1?uid=' + encodeURIComponent(uid) + '&day=' + day) || []; } catch (e) { showToast('⚠️ Serverdan olinmadi: ' + agmkErrUz(e)); return; }
            const pts = [].concat(...L.map(x => x.pts)).sort((a, b) => a[0] - b[0]); if (pts.length < 2) { showToast('🕘 Bu kunga yoʻl maʼlumoti yoʻq'); return; }
            await gdOpen(); trkDraw(pts, title || (L[0] && L[0].unit) || '', '#38bdf8', true);
        }
        function trkDraw(pts, title, color, fit) {
            if (!GD.map) return; if (!GD.trkLay) GD.trkLay = L.layerGroup().addTo(GD.map); GD.trkLay.clearLayers();
            const ll = pts.map(p => [p[1], p[2]]), km = trkKm(pts), dur = (pts[pts.length - 1][0] - pts[0][0]) / 1000;
            L.polyline(ll, { color: '#0f172a', weight: 8, opacity: .7 }).addTo(GD.trkLay); L.polyline(ll, { color: color, weight: 4.5, opacity: .95 }).addTo(GD.trkLay);
            const pin = (q, t) => L.marker(q, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="trk-pin">${t}</div>`, iconSize: [0, 0] }), zIndexOffset: 980 }).addTo(GD.trkLay);
            pin(ll[0], '🟢 ' + msHM(pts[0][0])); pin(ll[ll.length - 1], '🏁 ' + msHM(pts[pts.length - 1][0]));
            if (fit) GD.map.fitBounds(L.latLngBounds(ll), { padding: [40, 40], paddingBottomRight: [40, Math.min(($id('gdPanel') || {}).offsetHeight || 0, GD.map.getSize().y * .55)], animate: false });
            showToast(`🕘 ${title}: ${msDur(dur)} › ${km.toLocaleString('ru')} km`);
            return km;
        }
        function trkHide() { if (GD.trkLay) GD.trkLay.clearLayers(); }

        // =====================================================================
        // 🧪 GPS DEMO «BFF kabi»: 6 ta texnika xaritada — haydovchi, tezlik, bugungi yo'l, km va yoqilg'i
        //  Sxemadagi haqiqiy yo'llar bo'ylab harakat (karyer, ko'rik stansiyalari, bunkerlar). Faqat shu telefonda, serverga yozilmaydi.
        // =====================================================================
        var BF_DEF = [ // temir yo'l sxemasida — faqat temir yo'l texnikasi (avtotraktor — shahar xaritasida, alohida)
            { f: v => v.kind === 'lok' && /ТЭМ2/.test(v.type), nm: 'Mashinist-1', a: 'kal', b: 'kkd', kmh: 24, n: { t: 'h', v: 20 }, c: '#f97316', ic: '🚂' },
            { f: v => v.kind === 'lok' && /ТЭМ-18/.test(v.type), nm: 'Mashinist-2', a: 'por', b: 'odi', kmh: 20, n: { t: 'h', v: 18 }, c: '#eab308', ic: '🚂' },
            { f: v => v.kind === 'yol' && /drezin/i.test(v.type), nm: 'Mashinist-3', a: 'otv', b: 'kal', kmh: 30, n: { t: 'h', v: 9 }, c: '#22c55e', ic: '🚃' },
            { f: v => v.kind === 'yol' && /Motovoz/i.test(v.type), nm: 'Mashinist-4', a: 'ex0', b: 'por', kmh: 18, n: { t: 'h', v: 11 }, c: '#a855f7', ic: '🚃' }
        ];
        function bfMpu(P) { if (P.mpu) return P.mpu; let m = 0; for (let i = 1; i < P.pts.length; i++) { const a = ygToLL(P.pts[i - 1][0], P.pts[i - 1][1]), b = ygToLL(P.pts[i][0], P.pts[i][1]); m += geoDist([a.lat, a.lng], [b.lat, b.lng]); } return (P.mpu = m / Math.max(1, P.len)); }
        function bfStep(u, dt) { // dt — simulyatsiya soniyasi
            if (u.wait > 0) { u.wait -= dt; u.mov = false; return; }
            const P = u.P, sp = u.kmh / 3.6 * (0.8 + 0.4 * Math.sin(u.t / 300 + u.i)); u.spd = sp * 3.6; u.mov = true;
            const dd = sp * dt / bfMpu(P); u.d += dd * u.dir; u.m += sp * dt; u.movS += dt;
            if (u.d >= P.len || u.d <= 0) { u.d = Math.max(0, Math.min(P.len, u.d)); u.dir *= -1; u.wait = 120 + (u.i * 37 % 180); u.trips++; }
        }
        function bfPos(u) { const q = gdAt(u.P, u.d), ll = ygToLL(q.x, q.y); return [ll.lat, ll.lng]; }
        async function bfStart() {
            await gdOpen(); if (!krPrep()) { showToast('Sxema maʼlumoti yoʻq'); return; }
            const used = new Set(), t0 = Date.now() - 3 * 36e5 - 12 * 6e4;
            const list = BF_DEF.map((D, i) => { const v = vagonlarData.find(x => D.f(x) && !hrInRepair(x) && !used.has(x.id)); if (!v) return null; used.add(v.id); const P = krPath(D.a, D.b); if (!P) return null;
                return { i: i, D: D, v: v, P: P, d: (i * 0.17 % 1) * P.len, dir: 1, kmh: D.kmh, wait: 0, m: 0, movS: 0, t: 0, trips: 0, trail: [], start: t0 }; }).filter(Boolean);
            // 3 soatlik «bugungi yo'l» oldindan (07:xx dan beri)
            list.forEach(u => { for (let s = 0; s < 3 * 3600 + 720; s += 20) { u.t = s; bfStep(u, 20); if (s % 60 === 0) { const p = bfPos(u); u.trail.push([t0 + s * 1000, p[0], p[1], 5]); } } });
            MS.bf = { list: list, sel: null, t: Date.now() }; clearInterval(MS.bfT); MS.bfT = setInterval(bfTick, 500); bfDraw(true); gdPanel();
            showToast('🧪 Temir yoʻl demo: ' + list.length + ' ta texnika sxemada');
        }
        function bfStop() { clearInterval(MS.bfT); MS.bf = null; if (GD.bfLay) GD.bfLay.clearLayers(); mdlClose('bfCard'); try { gdPanel(); } catch (e) {} }
        function bfTick() {
            const B = MS.bf; if (!B || !GD.on) { if (B && !GD.on) clearInterval(MS.bfT); return; }
            const now = Date.now(), dt = (now - B.t) / 1000 * 10; B.t = now; // 10× tezlashtirilgan
            B.list.forEach(u => { u.t += dt; bfStep(u, dt); const p = bfPos(u), L0 = u.trail[u.trail.length - 1]; if (!L0 || geoDist([L0[1], L0[2]], p) > 15) u.trail.push([u.start + (3 * 3600 + 720 + (u.t - (3 * 3600 + 720))) * 1000, p[0], p[1], 5]); });
            bfDraw(false); if ($id('bfCard') && !$id('bfCard').classList.contains('hidden') && B.sel !== null) bfCard(B.sel, true);
        }
        function bfFuel(u) { const h = (u.trail.length ? (u.trail[u.trail.length - 1][0] - u.start) / 36e5 : 0), km = u.m / 1000; return u.D.n.t === 'h' ? Math.round(h * u.D.n.v * 10) / 10 : Math.round(km * u.D.n.v / 10) / 10; }
        function bfDraw(fit) {
            const B = MS.bf; if (!B || !GD.map) return; if (!GD.bfLay) GD.bfLay = L.layerGroup().addTo(GD.map); GD.bfLay.clearLayers(); const E = escapeHtml, all = [];
            B.list.forEach(u => { const ll = u.trail.map(p => [p[1], p[2]]); all.push(...ll); const sel = B.sel === u.i;
                if (sel) { L.polyline(ll, { color: '#0f172a', weight: 8, opacity: .6, interactive: false }).addTo(GD.bfLay); L.polyline(ll, { color: u.D.c, weight: 5, opacity: .95, interactive: false }).addTo(GD.bfLay); } // yo'l tarixi — faqat tanlangan texnikada
                const p = bfPos(u), ini = u.D.nm.charAt(0).toUpperCase() + (u.D.nm.match(/\d+/) || [''])[0];
                L.marker(p, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="bf-mk${sel ? ' sel' : ''}${u.mov ? '' : ' st'}" style="--bc:${u.D.c}" onclick="bfCard(${u.i})"><div class="bf-av">${ini}<i>${u.D.ic}</i></div><div class="bf-lb"><b>${E(u.D.nm)}</b><small>${u.mov ? Math.round(u.spd) + ' km/soat' : 'toʻxtab turibdi'}</small></div></div>`, iconSize: [0, 0] }), zIndexOffset: sel ? 1200 : 1000 }).addTo(GD.bfLay); });
            if (fit && all.length) GD.map.fitBounds(L.latLngBounds(all), { padding: [50, 50], paddingBottomRight: [50, Math.min(($id('gdPanel') || {}).offsetHeight || 0, GD.map.getSize().y * .55)], animate: false });
        }
        function bfCard(i, quiet) {
            const B = MS.bf; if (!B) return; const u = B.list.find(x => x.i === i); if (!u) return; B.sel = i; if (!quiet) bfDraw(false); const E = escapeHtml;
            const dur = u.trail.length ? (u.trail[u.trail.length - 1][0] - u.start) / 1000 : 0, km = Math.round(u.m / 100) / 10, f = bfFuel(u);
            const html = `<div class="px-h"><b>${u.D.ic} ${E(u.D.nm)} <em class="ns-demo">DEMO</em></b><button class="mini-btn" onclick="MS.bf && (MS.bf.sel=null); mdlClose('bfCard'); bfDraw(false)">✕</button></div>
                <div class="bf-top" style="--bc:${u.D.c}"><div class="bf-av big">${u.D.ic}</div><div><b>${E(hrName(u.v))}</b><small>${E(u.v.type || '')}</small><small>${u.mov ? '🟢 Harakatda · ' + Math.round(u.spd) + ' km/soat' : '⏸ Toʻxtab turibdi'}</small></div></div>
                <div class="ms-trip"><div><span>⏱ Bugun</span><b>${msDur(dur)}</b><small>harakatda ${msDur(u.movS)}</small></div><div><span>🛣 Masofa</span><b>${km.toLocaleString('ru')} km</b><small>${u.trips} reys</small></div><div><span>⛽ Yoqilgʻi</span><b>${f.toLocaleString('ru')} L</b><small>norma ${u.D.n.v} ${u.D.n.t === 'h' ? 'L/soat' : 'L/100 km'}</small></div></div>
                <div class="nd-tip">${E(msDur(dur))} › ${km.toLocaleString('ru')} km › ⛽ ${f.toLocaleString('ru')} L</div>
                <div class="ns-acts"><button onclick="mdlClose('bfCard'); openPassport(${JSON.stringify(u.v.id)})">📄 Pasport</button><button onclick="bfFit(${u.i})">🕘 Bugungi yoʻl</button><button onclick="bfFollow(${u.i})">🎯 Kuzatish</button></div>`;
            const m = $id('bfCard'); if (quiet && m && !m.classList.contains('hidden')) { m.querySelector('.modal-content').innerHTML = html; return; } mdl('bfCard', html);
        }
        function bfFit(i) { const u = MS.bf && MS.bf.list.find(x => x.i === i); if (!u) return; mdlClose('bfCard'); MS.bf.sel = i; bfDraw(false); GD.map.fitBounds(L.latLngBounds(u.trail.map(p => [p[1], p[2]])), { padding: [50, 50], paddingBottomRight: [50, Math.min(($id('gdPanel') || {}).offsetHeight || 0, GD.map.getSize().y * .55)], animate: false }); }
        function bfFollow(i) { const u = MS.bf && MS.bf.list.find(x => x.i === i); if (!u) return; mdlClose('bfCard'); MS.bf.sel = i; GD.map.setView(bfPos(u), 16, { animate: false }); bfDraw(false); }
        (function () {
            // trayektoriya: har qabul qilingan GPS nuqtasi navbatga, har daqiqada serverga
            if (typeof msTrack === 'function') { const o = msTrack; msTrack = function (f) { o.apply(this, arguments); try { msAutoState(f); } catch (e) {} try { if (mySmena() && f && (f.acc || 99) <= 60) { MS.tq.push([f.t, +(+f.lat).toFixed(6), +(+f.lon).toFixed(6), Math.round(f.acc || 0)]); if (MS.tq.length >= 60) trkFlush(); } } catch (e) {} }; }
            if (typeof mashEnd === 'function') { const o = mashEnd; mashEnd = async function () { await trkFlush(); return o.apply(this, arguments); }; }
            setInterval(() => { if (MS.tq.length) trkFlush(); }, 60000);
            const st = document.createElement('style');
            st.textContent = `.trk-pin{transform:translate(-50%,-130%);width:max-content;background:#0f172a;border:2px solid #38bdf8;border-radius:9px;padding:2px 7px;font-size:11.5px;font-weight:800;color:#e2e8f0}
.bf-mk{transform:translate(-22px,-22px);display:flex;align-items:center;gap:5px;width:max-content;cursor:pointer}.bf-av{position:relative;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#e2e8f0);color:#0f172a;border:3.5px solid var(--bc);display:flex;align-items:center;justify-content:center;font:900 14px system-ui;box-shadow:0 4px 12px rgba(0,0,0,.55)}
.bf-av i{position:absolute;right:-7px;bottom:-5px;font-style:normal;font-size:15px;background:#0f172a;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:2px solid var(--bc)}
.bf-mk.st .bf-av{filter:grayscale(.5);opacity:.9}.bf-mk.sel .bf-av{transform:scale(1.18);box-shadow:0 0 0 5px color-mix(in srgb,var(--bc) 40%,transparent),0 4px 14px rgba(0,0,0,.6)}
.bf-lb{background:rgba(15,23,42,.92);border:1.5px solid var(--bc);border-radius:10px;padding:2px 8px;color:#f1f5f9;font-size:11.5px;line-height:1.25;box-shadow:0 2px 8px rgba(0,0,0,.5)}.bf-lb b{display:block}.bf-lb small{font-size:10.5px;opacity:.85}
.bf-top{display:flex;gap:12px;align-items:center;margin:8px 0}.bf-top b{display:block;font-size:15px}.bf-top small{display:block;opacity:.8;font-size:12px}.bf-av.big{width:54px;height:54px;font-size:26px;background:#0f172a}`;
            document.head.appendChild(st);
        })();

        // =====================================================================
        // 🚜 AVTOTRAKTOR — haqiqiy shahar xaritasida (navigator): smenadagi haydovchilar + taqdimot demosi
        //  Temir yo'l sxemasi bilan aralashtirilmaydi (alohida xarita — telefon yengil ishlaydi).
        // =====================================================================
        // Olmaliq shahri ichidagi nuqtalar (demo): yo'nalishlar shahar ko'chalari bo'ylab (marshrut xizmati ko'chaga moslaydi)
        var RD_PT = { a: { lat: 40.8447, lon: 69.5983 }, b: { lat: 40.8528, lon: 69.5862 }, c: { lat: 40.8381, lon: 69.6118 }, d: { lat: 40.8556, lon: 69.6142 }, e: { lat: 40.8352, lon: 69.5871 }, f: { lat: 40.8492, lon: 69.6046 } };
        var RD_DEF = [
            { f: v => /Yuk avtomob/.test(v.type), nm: 'Haydovchi-1', h: ['a', 'd'], kmh: 38, n: { t: 'km', v: 38 } },
            { f: v => /Traktor/.test(v.type), nm: 'Traktorist-2', h: ['e', 'c'], kmh: 18, n: { t: 'h', v: 12 } },
            { f: v => /Frontal|Buldozer/.test(v.type), nm: 'Operator-3', h: ['f', 'b'], kmh: 15, n: { t: 'h', v: 14 } },
            { f: v => /Avtobus|vaxtovka/i.test(v.type), nm: 'Haydovchi-4', h: ['b', 'c'], kmh: 42, n: { t: 'km', v: 28 } },
            { f: v => /Yengil/.test(v.type), nm: 'Haydovchi-5', h: ['d', 'e'], kmh: 45, n: { t: 'km', v: 11 } },
            { f: v => /Vilkali/.test(v.type), nm: 'Operator-6', h: ['a', 'f'], kmh: 12, n: { t: 'h', v: 6 } }
        ];
        var RD_KEY = 'agmk_nv_routes';
        function rdPt(k) { return RD_PT[k] || null; }
        function rdCum(r) { const c = [0]; for (let i = 1; i < r.length; i++) c.push(c[i - 1] + nvHav({ lat: r[i - 1][0], lon: r[i - 1][1] }, { lat: r[i][0], lon: r[i][1] })); return c; }
        async function rdRoute(a, b) { // ko'cha bo'ylab yo'l: avval telefondagi saqlangan, bo'lmasa (faqat demo) ochiq marshrut xizmatidan; ulanmasa — to'g'ri chiziq
            const key = [a.lat, a.lon, b.lat, b.lon].map(x => x.toFixed(4)).join(','); let C = {}; try { C = JSON.parse(localStorage.getItem(RD_KEY) || '{}') || {}; } catch (e) {}
            if (C[key]) return C[key];
            try { const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 7000);
                const r = await fetch(agmkNoNet('Marshrut xizmati'), { signal: ctl.signal }); clearTimeout(tm);
                const j = await r.json(), g = j && j.routes && j.routes[0] && j.routes[0].geometry.coordinates; if (g && g.length > 1) { const R = g.map(q => [+q[1].toFixed(6), +q[0].toFixed(6)]); C[key] = R; try { localStorage.setItem(RD_KEY, JSON.stringify(C)); } catch (e) {} return R; } } catch (e) {}
            return null;
        }
        async function rdStart() {
            await nvOpen(); if (NV.demo) { NV.demo = false; NV.demoV = []; }
            showToast('🧪 Avtotraktor demo tayyorlanmoqda…'); const used = new Set(); let street = 0;
            const V = [];
            for (let i = 0; i < RD_DEF.length; i++) { const D = RD_DEF[i], v = vagonlarData.find(x => x.kind === 'avto' && D.f(x) && !hrInRepair(x) && !used.has(x.id)); if (!v) continue; used.add(v.id);
                const a = rdPt(D.h[0]), b = rdPt(D.h[1]); if (!a || !b) continue; const R = await rdRoute(a, b); if (R) street++;
                const route = R || [[a.lat, a.lon], [b.lat, b.lon]], cum = rdCum(route);
                V.push({ id: 'd:' + v.id, name: D.nm + ' · ' + (v.naim || v.type || '') + ' ' + vagonNo(v), drv: D.nm, D: D, v: v, demo: true, a: a, b: b, route: route, cum: cum, len: cum[cum.length - 1], f: (i * 0.21) % 1, dir: 1, spd: D.kmh, pts: [], pause: 0 }); }
            NV.demoV = V; NV.demo = true; NV.demoClock = Date.now() - 3 * 3600e3 - 12 * 6e4; for (let k = 0; k < (3 * 3600 + 720) / 50; k++) nvDemoStep(5); NV.day = typeof nvDayStr === 'function' ? nvDayStr(new Date()) : NV.day; NV.sel = null; nvRender(true);
            showToast('🧪 ' + V.length + ' ta avtotraktor shahar xaritasida' + (street ? '' : ' (koʻcha yoʻllari olinmadi — toʻgʻri chiziq)'));
        }
        function rdAlong(d) { const s = Math.max(0, Math.min(d.len, d.f * d.len)); let i = 1; while (i < d.cum.length - 1 && d.cum[i] < s) i++; const t = (s - d.cum[i - 1]) / Math.max(1e-6, d.cum[i] - d.cum[i - 1]), A = d.route[i - 1], B = d.route[i]; return { lat: A[0] + (B[0] - A[0]) * t, lon: A[1] + (B[1] - A[1]) * t }; }
        function rdFuel(it, s) { const n = it.D ? it.D.n : (it.v && msNorm(it.v.id)); if (!n || !(+n.v > 0)) return null; return n.t === 'h' ? s.move / 3600 * n.v : s.dist / 1000 * n.v / 100; }
        (function () {
            // demo yurishi ko'cha chizig'i bo'ylab (route bo'lsa)
            if (typeof nvDemoStep === 'function') { const o = nvDemoStep; nvDemoStep = function (dt) {
                if (!NV.demoV.some(d => d.route)) return o.apply(this, arguments);
                NV.demoClock = NV.demoClock || Date.now(); NV.demoClock += dt * 10 * 1000; const now = NV.demoClock;
                NV.demoV.forEach((d, i) => { const L0 = d.len || nvHav(d.a, d.b) || 1;
                    if (d.pause > 0) { d.pause -= dt * 10; const l = d.pts[d.pts.length - 1] || rdAlong(d); d.pts.push({ lat: l.lat, lon: l.lon, t: now, v: 0 }); }
                    else { const sp = d.spd * (0.75 + 0.35 * Math.abs(Math.sin(now / 9e5 + i))); d.f += d.dir * (sp / 3.6) * dt * 10 / L0; if (d.f >= 1) { d.f = 1; d.dir = -1; d.pause = (4 + (i * 7) % 18) * 60; } if (d.f <= 0) { d.f = 0; d.dir = 1; d.pause = (3 + (i * 11) % 15) * 60; }
                        const p = rdAlong(d); d.pts.push({ lat: p.lat, lon: p.lon, t: now, v: Math.round(sp) }); }
                    if (d.pts.length > 4000) d.pts.shift(); });
            }; }
            // smenadagi haydovchilar (avtotraktor) — navigatorda, haqiqiy joylashuvi bilan
            if (typeof nvItems === 'function') { const o = nvItems; nvItems = function () { const out = o.apply(this, arguments); try { if (msOn() && nsResp()) { MS.ph = MS.ph || {};
                MS.pos.filter(msIsRoad).forEach(p => { const h = MS.ph[p.tabel] = MS.ph[p.tabel] || []; const t = Date.now() - p.ago * 1000, l = h[h.length - 1]; if (!l || l.lat !== p.lat || l.lon !== p.lon) h.push({ lat: p.lat, lon: p.lon, t: t }); if (h.length > 3000) h.shift();
                    out.push({ id: 'p:' + p.tabel, name: p.name + ' · ' + (p.unit || ''), v: msUnit(+p.uid) || null, pts: h.length > 1 ? h : [h[0], h[0]], demo: false }); }); } } catch (e) {} return out; }; }
            if (typeof nvTick === 'function') { const o = nvTick; nvTick = function () { if (msOn() && nsResp() && Date.now() - MS.posAt > 15000) msPosLoad(); return o.apply(this, arguments); }; }
            // kartochkada: haydovchi va yoqilg'i (3 soat 12 daq › 96 km › 13 L)
            if (typeof nvRender === 'function') { const o = nvRender; nvRender = function () { const r = o.apply(this, arguments); try { const it = nvItems().find(x => x.id === NV.sel), c = $id('nvCard'); if (!it || !c) return r;
                const s = nvStats(it), f = rdFuel(it, s), t0 = it.pts[0] ? it.pts[0].t : Date.now(), dur = (s.last.t - Math.max(t0, new Date().setHours(0, 0, 0, 0))) / 1000;
                c.insertAdjacentHTML('beforeend', `<div class="nv-fuel">⏱ ${msDur(dur)} › 🛣 ${(s.dist / 1000).toFixed(1).replace('.', ',')} km › ⛽ ${f === null ? 'norma kiritilmagan' : (Math.round(f * 10) / 10).toLocaleString('ru') + ' L'}</div>`); } catch (e) {} return r; }; }
            const st = document.createElement('style'); st.textContent = '.nv-fuel{margin-top:6px;padding:7px 10px;border-radius:10px;background:rgba(14,165,233,.15);border:1px solid rgba(56,189,248,.45);font-weight:800;font-size:13px}'; document.head.appendChild(st);
        })();

