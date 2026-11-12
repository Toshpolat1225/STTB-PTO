        // =====================================================================
        // v3.6.6 — 3.6.5 ustidan tuzatishlar (xavfsizlik va barqarorlik)
        //  K4: bilimlar sinovi jadvali (xodimlar ismi) APK ichida emas — serverdan, faqat MM / kadrlar / rahbariyat / adminga
        //  K5: tarif stavkalari APK ichida emas — serverdan, faqat ish haqi / buxgalteriya / rahbariyatga
        // =====================================================================
        async function narTarLoad() {
            if (NAR._tl || typeof narCan !== 'function' || !narCan() || !(typeof syncReady === 'function' && syncReady())) return false;
            NAR._tl = 1;
            try {
                const j = await sbFetch('/api/seed/v1/nartar'); if (!j || !Array.isArray(j.tariffs)) return false;
                const d = narDB(); d.tariffs = d.tariffs || []; const have = new Set(d.tariffs.map(t => t.from)); let n = 0;
                j.tariffs.forEach(t => { if (!have.has(t.from)) { d.tariffs.push({ from: t.from, r: Object.assign({}, t.r), src: 'Tasdiqlangan normalar hujjatlari (korxona serveri)' }); n++; } });
                if (n) { d.tariffs.sort((a, b) => a.from.localeCompare(b.from)); narSaveDB(d); try { if ($id('screen-bux') && $id('screen-bux').classList.contains('active') && typeof narRender === 'function') narRender(); } catch (e) {} }
                return n;
            } catch (e) { NAR._tl = 0; return false; }
        }
        async function mbSeedLoad() {
            if (MB_SEED || MB._sl || typeof canMMEdit !== 'function' || !canMMEdit() || !(typeof syncReady === 'function' && syncReady())) return false;
            MB._sl = 1;
            try { const j = await sbFetch('/api/seed/v1/mbs'); if (j && Array.isArray(j.rows)) { MB_SEED = j; return mbSeedApply(false); } }
            catch (e) { MB._sl = 0; }
            return false;
        }
        SEC_EV.fns.push(function seedTick() { narTarLoad(); mbSeedLoad(); });
        if (typeof narRender === 'function') narRender = agmkExtend('narRender', 'v3.6.6: tariflar serverdan', narRender, o => function () { narTarLoad(); return o.apply(this, arguments); });
        if (typeof openMM === 'function') openMM = agmkExtend('openMM', 'v3.6.6: bilim sinovi jadvali serverdan', openMM, o => function () { mbSeedLoad(); return o.apply(this, arguments); });
        window.addEventListener('agmk:login', () => setTimeout(() => { narTarLoad(); mbSeedLoad(); }, 2500));

        // O3: navigator — «🛰 Sputnik» / «🗺 Xarita» tanlovi (3.6.5 da faqat sputnik qolgan edi). Temir yoʻllar qatlami saqlanadi.
        var NVB = { mode: (function () { try { return localStorage.getItem('agmk_nv_base') || 'sat'; } catch (e) { return 'sat'; } })() };
        function nvBaseSet(mode) {
            const m = NV.map; if (!m) return; NVB.mode = mode; try { localStorage.setItem('agmk_nv_base', mode); } catch (e) {}
            if (!NVB.sat) { NVB.sat = []; m.eachLayer(l => { if (l instanceof L.TileLayer) NVB.sat.push(l); }); }
            if (!NVB.osm) NVB.osm = L.tileLayer('agmk-tile://osm/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
            if (mode === 'osm') { NVB.sat.forEach(l => m.hasLayer(l) && m.removeLayer(l)); if (!m.hasLayer(NVB.osm)) NVB.osm.addTo(m); NVB.osm.bringToBack(); }
            else { if (m.hasLayer(NVB.osm)) m.removeLayer(NVB.osm); NVB.sat.forEach(l => { if (!m.hasLayer(l)) l.addTo(m); }); NVB.sat[0] && NVB.sat[0].bringToBack(); }
            const b = $id('nvBaseBtn'); if (b) b.textContent = mode === 'osm' ? '🛰 Sputnik' : '🗺 Xarita';
        }
        if (typeof nvOpen === 'function') nvOpen = agmkExtend('nvOpen', 'v3.6.6: sputnik / xarita tanlovi', nvOpen, o => async function () {
            const r = await o.apply(this, arguments);
            try { if (NV.map && !NVB.ctl) { const C = L.Control.extend({ options: { position: 'topright' }, onAdd: () => { const b = L.DomUtil.create('button', 'osm-btn'); b.id = 'nvBaseBtn'; L.DomEvent.disableClickPropagation(b); b.onclick = () => nvBaseSet(NVB.mode === 'osm' ? 'sat' : 'osm'); return b; } });
                NVB.ctl = new C().addTo(NV.map); nvBaseSet(NVB.mode); } } catch (e) { console.error(e); }
            return r;
        });

        // O5: «Ekskavatorlar parki» — yoʻl-yoʻriq (4.8: avtotraktor havolasi olib tashlandi — muallif talabi)
        if (typeof menuEksk === 'function') menuEksk = function () {
            mdl('menuEksk', `<div class="px-h"><b>⛏ Ekskavatorlar parki</b><button class="mini-btn" onclick="mdlClose('menuEksk')">✕</button></div>
                <div class="xt-empty" style="padding:14px 8px;line-height:1.5">Bu boʻlimga <b>karyerning katta ekskavatorlari</b> kiritiladi — hozircha kiritilmagan.</div>`);
        };

        // =====================================================================
        // v3.6.6 — ФОТ tahlili: yaxlitlanmaydi, svod (KNSM, UPJT), notoʻgʻri schyot spravkasi, nazorat roʻyxatlari
        // =====================================================================
        var FOT_KNSM = ['41', '42', '43', '44', '46'];
        fotN = function (n) { return n === null || n === undefined ? '—' : narF(n, 2); };
        function fotMain(res) { return res.sheets.filter(s => !/задание/i.test(s.name)); } // «задание» varaqlari jamga ikki marta qoʻshilmaydi
        function fotGrp(L) { return L.reduce((a, s) => { a.p = fotR5(a.p + (s.pc || 0)); a.f = fotR5(a.f + (s.fc || 0)); a.t = fotR5(a.t + (s.fakt || 0)); a.u = fotR5(a.u + (s.total6203 || 0)); return a; }, { p: 0, f: 0, t: 0, u: 0 }); }
        function fotBadAll() { const R = FOTS.r6; if (!R) return []; const m = {}; R.recs.forEach(x => { if (!x.sch0 || x.sch0 === x.sch || !x.m) return; const k = x.ceh + '|' + x.sch0 + '|' + x.sch + '|' + x.vo; m[k] = (m[k] || 0) + x.m; }); return Object.keys(m).map(k => { const [ceh, a, b, vo] = k.split('|'); return { ceh: ceh, sch0: a, sch: b, vo: +vo, m: fotR5(m[k]) }; }); }
        fotResHtml = function (res) {
            const E = escapeHtml, M = fotMain(res), all = fotGrp(M), kn = fotGrp(M.filter(s => FOT_KNSM.indexOf(String(s.ceh)) >= 0)), bad = fotBadAll();
            const row = (nm, g, b) => `<tr${b ? ' style="font-weight:800;background:rgba(56,189,248,.08)"' : ''}><td>${nm}</td><td class="n">${fotN(g.p)}</td><td class="n">${fotN(g.f)}</td><td class="n">${fotN(fotR5(g.f - g.p))}</td><td class="n">${g.p ? narF(g.f / g.p * 100, 1) : '—'}</td><td></td></tr>`;
            const warn = s => s.diff.length + s.unal.length + s.dup.length + s.toOther.length + s.bad.length + s.keep.length + (s.refErr.length ? 1 : 0);
            return `<div class="hs-box"><div class="hs-h">✅ Natija — ${E(FOT_MUZ[res.mon] || '')} (ming soʻm, butun minglikda)</div>
                <div class="mm-sum fot-kpi"><i class="no"><b>${fotN(all.p)}</b>prognoz</i><i class="ok"><b>${fotN(all.f)}</b>fakt</i><i class="${all.f > all.p ? 'bad' : 'ok'}"><b>${fotN(fotR5(all.f - all.p))}</b>ogʻish</i></div>
                <div class="nd-tip">Prognoz va fakt — prognozi bor qatorlar boʻyicha. Faylga yozilgan jami fakt: <b>${fotN(all.t)}</b> ming soʻm. Har bir katakka butun minglik son yozildi (kasrsiz).</div>
                ${bad.length ? `<div class="nd-tip" style="border-color:#f59e0b;color:#fde68a">⚠️ 6203 da <b>${bad.length} ta notoʻgʻri schyot</b> (notoʻgʻri kod yoki shablonda yoʻq hisobvaraq, masalan ${E(bad[0].sch0)}). Bu summalar faylga QOʻSHILMADI — buxgalteriyaga tuzatish uchun spravka tayyor.</div>` : ''}
                <div class="hs-acts"><button class="action-btn" style="background:#0f766e" onclick="fotDl()">📥 Toʻldirilgan fayl (xuddi shu shaklda)</button><button class="mini-btn" onclick="fotSumXlsx()">📊 Svod (Excel)</button>${bad.length ? '<button class="mini-btn" onclick="fotSprav()">📝 Buxgalteriyaga spravka</button>' : ''}<button class="mini-btn" onclick="fotNegOpen()">↩️ Qayta hisoblar (manfiy)</button></div>
                <div class="gt-scroll" style="overflow-x:auto"><table class="nar-t fot-t"><tr><th>Sex</th><th>Prognoz</th><th>Fakt</th><th>Ogʻish</th><th>%</th><th>Nazorat</th></tr>
                ${res.sheets.map((s, i) => { const w = warn(s); return `<tr onclick="fotSheetOpen(${i})" style="cursor:pointer"><td>${E(s.name)} <small>${E(String(s.ceh))}</small></td><td class="n">${fotN(s.pc || 0)}</td><td class="n">${fotN(s.fc || 0)}</td><td class="n">${fotN(fotR5((s.fc || 0) - (s.pc || 0)))}</td><td class="n">${s.pc ? narF(s.fc / s.pc * 100, 1) : '—'}</td><td>${s.ok6203 === false ? '❌ ' : ''}${w ? '🔷 ' + w : '✅'}</td></tr>`; }).join('')}
                ${row('KNSM jami (41–46)', kn, 1)}${row('UPJT jami', all, 1)}</table></div>
                <div class="nd-tip">Sex nomini bosing — qatorlar, 6203 bilan nazorat, notoʻgʻri schyotlar, ichki schyotlar qaysi blokka qoʻshilgani, qoʻlda qoldirilgan qiymatlar, jadvalda joyi yoʻq summalar. ${res.notes.length ? '<br>' + res.notes.map(n => '⚠️ ' + E(n.sh + ': ' + n.msg)).join('<br>') : ''}</div></div>`;
        };
        if (typeof fotSheetOpen === 'function') fotSheetOpen = agmkExtend('fotSheetOpen', 'v3.6.6: nazorat roʻyxatlari', fotSheetOpen, o => function (i) {
            const r = o.apply(this, arguments);
            try { const s = FOTS.res && FOTS.res.sheets[i], box = document.querySelector('#fotSh .modal-box, #fotSh .modal-content') || $id('fotSh'); if (!s || !box) return r; const E = escapeHtml;
                const lst = (t, L, f) => L.length ? `<div class="inf-sec">${t} (${L.length})</div>` + L.map(f).join('') : '';
                const h = `<div class="nd-tip" style="margin-top:8px">${s.ok6203 === false ? '❌' : '✅'} 6203 nazorati: sex «Фонд оплаты» jami ${fotN(s.total6203)} = jadvalga tushgani ${fotN(s.fond)} + joyi yoʻq summalar.</div>
                    ${lst('⚠️ 6203 da notoʻgʻri schyot — toʻgʻrisiga qoʻshildi, spravkaga kiradi', s.bad, d => `<div class="mm-card"><small>${E(d.sch0)} → <b>${E(d.sch)}</b> · В/О ${d.vo} — ${narF(d.m, 2)} soʻm</small></div>`)}
                    ${lst('🔗 Ichki schyotlar — umumiy boshlanishi boʻyicha blokka qoʻshildi', s.pfx, d => `<div class="mm-card"><small>${E(d.sch)} → blok ${E(d.blk)} — ${narF(d.m, 2)} soʻm</small></div>`)}
                    ${lst('✋ 6203 da bu kodlar yoʻq — qoʻlda yozilgan qiymat oʻzgartirilmadi', s.keep, d => `<div class="mm-card"><small>${d.r}-qator «${E(d.lbl.slice(0, 50))}» — ${fotN(d.v)}</small></div>`)}
                    ${lst('↩️ Manfiy summalar (qayta hisob)', s.neg, d => `<div class="mm-card"><small>${E(d.sch)} · В/О ${d.vo} — ${narF(d.m, 2)} soʻm</small></div>`)}
                    ${s.refErr.length ? `<div class="inf-sec">🧩 Shablonda oldindan buzilgan formulalar (#REF!) — ${s.refErr.length} ta</div><div class="mm-card"><small>${E(s.refErr.join(', '))} — bu kataklar faylda avvaldan xato, ilova ularga tegmaydi; Excel’da tuzatish kerak.</small></div>` : ''}`;
                box.insertAdjacentHTML('beforeend', h); } catch (e) { console.error(e); }
            return r;
        });
        function fotNegOpen() {
            const R = FOTS.r6; if (!R) return; const E = escapeHtml, L = R.recs.filter(x => x.m < 0).sort((a, b) => a.ceh.localeCompare(b.ceh) || a.m - b.m);
            const by = {}; L.forEach(x => { const k = x.sch; by[k] = fotR5((by[k] || 0) + x.m); });
            mdl('fotNeg', `<div class="px-h"><b>↩️ Qayta hisoblar — manfiy summalar (${L.length})</b><button class="mini-btn" onclick="mdlClose('fotNeg')">✕</button></div>
                <div class="nd-tip">6203 dagi manfiy summalar odatda oldingi oylar uchun qayta hisob (pererasschyot). Har birini tekshiring: qaysi schyot va В/О, qaysi sex. Toʻgʻri boʻlsa — ✅, shubhali boʻlsa buxgalteriyadan izoh soʻrang.</div>
                <div class="inf-sec">Schyotlar boʻyicha jami</div>${Object.keys(by).sort().map(k => `<div class="mm-card"><small><b>${E(k)}</b> — ${narF(by[k], 2)} soʻm</small></div>`).join('')}
                <div class="inf-sec">Batafsil</div><div class="gt-scroll" style="max-height:45vh;overflow:auto"><table class="nar-t fot-t"><tr><th>Sex</th><th>Schyot</th><th>В/О</th><th>Summa</th></tr>${L.map(x => `<tr><td>${E(x.ceh)}</td><td>${E(x.sch)}${x.sch0 !== x.sch ? ' ⚠️' : ''}</td><td>${x.vo}</td><td class="n">${narF(x.m, 2)}</td></tr>`).join('')}</table></div>`, true);
        }
        function fotSprav() {
            const R = FOTS.r6, L = fotBadAll(); if (!R || !L.length) return; const E = escapeHtml, mon = FOT_MUZ[R.mon] || '';
            const tot = fotR5(L.reduce((a, x) => a + x.m, 0)), me = (typeof currentUser !== 'undefined' && currentUser && currentUser.name) || '';
            const html = `<html><head><meta charset="utf-8"><title>Spravka</title><style>body{font-family:'Times New Roman',serif;font-size:13pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4px 6px}td.n{text-align:right}</style></head><body>
                <p style="text-align:right">Bosh buxgalterga</p>
                <h3 style="text-align:center">MAʼLUMOTNOMA<br><small>6203 hisobotida (${E(mon)} ${R.year}) notoʻgʻri koʻrsatilgan balans schyotlari toʻgʻrisida</small></h3>
                <p>ФОТ tahlili davomida «ТС6203 — распределение з/пл по производственным счетам» hisobotida quyidagi summalar notoʻgʻri (qisqa) balans schyotiga yozilgani aniqlandi. Tahlilda ular toʻgʻri schyotga qoʻshildi; hisobotni tuzatishingizni soʻraymiz.</p>
                <table><tr><th>№</th><th>Sex</th><th>6203 dagi schyot</th><th>Toʻgʻri schyot</th><th>В/О</th><th>Summa, soʻm</th></tr>
                ${L.map((x, i) => `<tr><td>${i + 1}</td><td>${E(x.ceh)}</td><td>${E(x.sch0)}</td><td>${E(x.sch || '— (shablonda yoʻq)')}</td><td>${x.vo}</td><td class="n">${narF(x.m, 2)}</td></tr>`).join('')}
                <tr><td colspan="5"><b>Jami</b></td><td class="n"><b>${narF(tot, 2)}</b></td></tr></table>
                <p style="margin-top:30px">Iqtisodchi ____________ ${E(me)}</p><p>Sana: ${E(new Date().toLocaleDateString('ru-RU'))}</p></body></html>`;
            const blob = new Blob(['﻿', html], { type: 'application/msword' });
            docDownload([{ name: '6203_notogri_schyotlar_' + mon + '_' + R.year + '.doc', mime: 'application/msword', blob: blob }]);
        }
        fotSumXlsx = function () {
            const r = FOTS.res; if (!r) return; const M = fotMain(r), kn = fotGrp(M.filter(s => FOT_KNSM.indexOf(String(s.ceh)) >= 0)), all = fotGrp(M);
            const rows = [['ФОТ tahlili — ' + (FOT_MUZ[r.mon] || '') + ' ' + (r.year || '') + ' (ming soʻm, butun minglikda)'], [], ['Sex', '6203 kodi', 'Qator', 'Prognoz', 'Fakt', 'Ogʻish', '6203 sex jami']];
            r.sheets.forEach(s => { rows.push([s.name, s.ceh, 'JAMI', s.pc || 0, s.fc || 0, fotR5((s.fc || 0) - (s.pc || 0)), s.total6203]); s.rows.filter(x => x.fakt || x.prog).forEach(x => rows.push(['', '', x.lbl, x.prog, x.fakt, x.prog !== null && x.fakt !== null ? fotR5(x.fakt - x.prog) : ''])); });
            rows.push([], ['KNSM jami (41–46)', '', '', kn.p, kn.f, fotR5(kn.f - kn.p), kn.u], ['UPJT jami', '', '', all.p, all.f, fotR5(all.f - all.p), all.u]);
            const bad = fotBadAll(); if (bad.length) { rows.push([], ['6203 da notoʻgʻri schyotlar'], ['Sex', '6203 dagi', 'Toʻgʻri', 'В/О', 'Summa, soʻm']); bad.forEach(x => rows.push([x.ceh, x.sch0, x.sch, x.vo, x.m])); }
            xlsxDl(rows, 'FOT svod ' + (FOT_MUZ[r.mon] || ''));
        };

        // =====================================================================
        // v3.6.6 — Mehnat muhofazasi: 7 tur nomlari (PDK yoyilgan), xodim pasportida bilimlar sinovi, yoʻl-yoʻriq faqat ishchilarda
        // =====================================================================
        (function () {
            if (typeof MB_T === 'undefined') return;
            const N = { asosiy: ['Mehnat muhofazasi — asosiy qoidalar', 'Asosiy qoidalar'], elektr: ['Elektr xavfsizligi', 'Elektr xavfsizligi'], sttf: ['OʻzR STTF qoidalari (sanoat temir yoʻl transportini texnik foydalanish)', 'OʻzR STTF qoidalari'],
                kran: ['Yuk koʻtarish kranlari tuzilishi va ulardan xavfsiz foydalanish qoidalari', 'Yuk koʻtarish kranlari'], gaz: ['Gaz xoʻjaligi', 'Gaz xoʻjaligi'], bug: ['Bugʻ qozonlari', 'Bugʻ qozonlari'],
                dfyik: ['Doimiy faoliyat yurituvchi imtihon komissiyasida (PDK) bilimlar sinovi — yuk koʻtarish kranlari, gaz xoʻjaligi, bosim ostida ishlaydigan idishlar', 'PDK (3 yilda)'] };
            MB_T.forEach(t => { if (N[t.k]) { t.t = N[t.k][0]; t.s = N[t.k][1]; } if (t.k === 'dfyik') t.m = 36; else t.m = 12; });
        })();
        if (typeof mmpHtml === 'function') mmpHtml = agmkExtend('mmpHtml', 'v3.6.6: bilimlar sinovi 7 tur pasportda', mmpHtml, o => function (item) {
            let h = o.apply(this, arguments);
            try {
                const s = mmStat(item);
                if (s.davriy && s.davriy.na) { h = h.replace(/<div class="mmp-k [^"]*"><span>Yoʻl-yoʻriq<\/span>[\s\S]*?<\/div>/, '').replace(/<tr><td>Yoʻl-yoʻriq<\/td>[\s\S]*?<\/tr>/, '').replace('Imtihonlar va yoʻl-yoʻriqlar tarixi', 'Imtihonlar tarixi'); } // xodimda yoʻl-yoʻriq yoʻq
                if (typeof mbData !== 'function') return h;
                const d = mbData(), pid = mbPid({ tabel: item.tabel, name: item.name }), ts = mbTypesOf(pid, d), E = escapeHtml;
                const rows = ts.map(t => { const st = mbStat(pid, t, d), T = mbT(t), last = st.lastOk || st.last; const c = st.left === null ? '' : st.left <= 10 ? 'bad' : st.left <= 90 ? 'warn' : 'ok';
                    return `<div class="mmp-bs ${c}"><b title="${E(T.t)}">${E(T.s)}</b><span>oxirgi: ${last ? E(fmtD(last.date)) + (last.grade === 'n' ? ' · qoniqarsiz' : last.grade === 'q' ? ' · qoniqarli' : '') + (last.src === 'import' ? ' · jadvaldan' : last.sig && last.sig.ex && last.sig.ct ? ' · ✍️ imzolangan' : ' · ✍️ imzo kutilmoqda') : '—'}</span><span>keyingi: <b>${st.next ? E(fmtD(st.next)) : '—'}</b>${st.left !== null ? ' (' + (st.left < 0 ? Math.abs(st.left) + ' kun oʻtdi' : st.left + ' kun qoldi') + ')' : ''}${st.flag ? ' · ' + E(st.flag) : ''}</span></div>`; }).join('');
                const box = `<div class="mmp-bsb"><div class="inf-sec">🎓 Bilimlar sinovi</div>${rows || '<div class="nd-tip">Bilimlar sinovi maʼlumoti yoʻq.</div>'}<small class="mmp-org">Oʻtkazadi: Doimiy faoliyat yurituvchi imtihon komissiyasi · natijani imtihon topshiruvchi va imtihon oluvchi nazoratchi elektron imzolaydi</small></div>`;
                h = h.replace('<div class="mmp-plan">', box + '<div class="mmp-plan">');
            } catch (e) { console.error(e); }
            return h;
        });
        (function () { const st = document.createElement('style'); st.textContent = `.mmp-bsb{margin:10px 0}.mmp-bs{display:flex;flex-direction:column;gap:2px;border:1.5px solid #475569;border-radius:12px;padding:7px 9px;margin:5px 0;background:rgba(30,41,59,.8);font-size:12px}.mmp-bs b{color:#f1f5f9}.mmp-bs span{color:#cbd5e1}.mmp-bs.bad{border-color:#ef4444;background:rgba(127,29,29,.45)}.mmp-bs.warn{border-color:#eab308;background:rgba(113,63,18,.45)}.mmp-bs.ok{border-color:#3b82f6;background:rgba(30,58,138,.45)}.mmp-org{display:block;font-size:10.5px;opacity:.75;margin-top:4px}`; document.head.appendChild(st); })();

        // v3.6.6 — «ЖД кран platformasi» (2 koʻrinish): 1 — sariq ramali (zveno tashuvchi), 2 — yashil rolikli (model/nomida «rolik» yoki «2»)
        (function () {
            try { if (typeof TYPE_ORDER !== 'undefined' && TYPE_ORDER.indexOf('ЖД кран platformasi') < 0) { const i = TYPE_ORDER.indexOf('Xopper'); TYPE_ORDER.splice(i >= 0 ? i + 1 : TYPE_ORDER.length, 0, 'ЖД кран platformasi'); } } catch (e) {}
            try { if (typeof TV_LBL !== 'undefined') TV_LBL['ЖД кран platformasi'] = 'ЖД кран platf.'; } catch (e) {}
            if (typeof vgImgKey === 'function') vgImgKey = agmkExtend('vgImgKey', 'v3.6.6: ЖД кран platformasi', vgImgKey, o => function (v) {
                if (v && !v.kind && /ЖД кран|zd kran|jd kran/i.test(String(v.type || ''))) return /rolik|ролик|\b2\b|2-ko/i.test([v.model, v.naim].join(' ')) ? 'zv2' : 'zv';
                return o.apply(this, arguments);
            });
        })();

        // =====================================================================
        // v3.6.8 — Qoʻngʻiroqcha va yozishmalar ajratildi: chat xabarlari faqat 💬 da (oʻz sanogʻi bilan),
        //          🔔 da — tizim bildirishnomalari (imzo, eslatma, zamechaniya, MM, nosozlik …). Bir xabar ikki joyda chiqmaydi.
        // =====================================================================
        function ntIsChat(n) { return !!(n && n.chatTabel); }
        // v3.6.9: sanoq yagona manbadan — suhbatdagi oʻqilmagan xabarlar (koʻrilganda oʻchadi)
        function chatUnreadN() { try { if (!(currentUser && currentUser.tabel)) return 0; const open = typeof CHS === 'undefined' || (CHS.t && CHS.t === meTabel()); return open && typeof chatUnread === 'function' ? chatUnread() : chatUnreadList().length; } catch (e) { return 0; } }
        function chatUnreadList() { try { const t = cleanTabel(currentUser && currentUser.tabel); return getNotifs().filter(n => ntIsChat(n) && notifForMe(n) && !(n.read || []).includes(t)); } catch (e) { return []; } }
        if (typeof myUnreadNotifs === 'function') myUnreadNotifs = agmkExtend('myUnreadNotifs', 'v3.6.8: chat xabarlari qoʻngʻiroqchada emas', myUnreadNotifs, o => function () { return o.apply(this, arguments).filter(n => !ntIsChat(n)); });
        openNotifs = function () {
            const t = cleanTabel(currentUser.tabel);
            const l = getNotifs().filter(notifForMe).filter(n => !ntIsChat(n)).filter(n => !(n.eph && (n.read || []).includes(t))).reverse();
            $id('ntList').innerHTML = l.length ? l.map(n => `<div class="nt-item${(n.read || []).includes(t) ? '' : ' unread'}" onclick="openNotif('${n.id}')"><span>${n.icon || '🔔'}</span><div class="nt-t">${escapeHtml(n.text)}<div class="nt-d">${escapeHtml(fmtDateTime(n.at))}</div></div>${(n.read || []).includes(t) ? '' : '<span class="wl-dot"></span>'}</div>`).join('')
                : '<div class="xt-empty">Hozircha bildirishnoma yoʻq.<br><small>Xodimlardan kelgan xabarlar — 💬 Yozishmalarda.</small></div>';
            $id('notifListModal').classList.remove('hidden');
        };
        if (typeof markAllNotifsRead === 'function') markAllNotifsRead = agmkExtend('markAllNotifsRead', 'v3.6.8: chat xabarlari tegilmaydi', markAllNotifsRead, o => function () {
            const keep = chatUnreadList().map(n => n.id), r = o.apply(this, arguments);
            try { const t = cleanTabel(currentUser.tabel), l = getNotifs(); let ch = 0; l.forEach(n => { if (keep.indexOf(n.id) >= 0 && (n.read || []).includes(t)) { n.read = n.read.filter(x => x !== t); ch = 1; } }); if (ch) { saveNotifs(l); updateRnBadges(); } } catch (e) {}
            return r;
        });
        if (typeof updateRnBadges === 'function') updateRnBadges = agmkExtend('updateRnBadges', 'v3.6.8: 💬 sanogʻi', updateRnBadges, o => function () {
            const r = o.apply(this, arguments);
            try { const b = $id('chatTopBtn'); if (b) { let c = b.querySelector('.chat-cnt'); const n = chatUnreadN(); if (!c) { c = document.createElement('span'); c.className = 'chat-cnt'; b.appendChild(c); } c.textContent = n > 99 ? '99+' : n; c.classList.toggle('hidden', !n); b.classList.toggle('pulse', n > 0); } } catch (e) {}
            return r;
        });
        // v3.6.9: suhbat roʻyxatdan (CHAT.cur=..; chatRender()) ochilganda ham — chatRender ichida belgilanadi
        function chatNtRead(c) {
            try {
                if (!c || !c.p || !currentUser) return 0;
                const t = cleanTabel(currentUser.tabel), pt = cleanTabel(c.p.tabel || ''), pid = chatId(c.p), pn = String(c.p.name || '').trim().toLowerCase();
                const l = getNotifs(); let ch = 0;
                l.forEach(n => {
                    if (!ntIsChat(n) || (n.read || []).includes(t)) return;
                    const nt = cleanTabel(n.chatTabel);
                    let hit = (pt && nt === pt);
                    if (!hit) { try { hit = chatId({ name: n.chatName || '', tabel: nt }) === pid; } catch (e) {} }
                    if (!hit && pn && n.chatName) hit = String(n.chatName).trim().toLowerCase() === pn;
                    if (hit) { n.read = (n.read || []).concat(t); ch++; }
                });
                if (ch) saveNotifs(l);
                return ch;
            } catch (e) { return 0; }
        }
        if (typeof chatRender === 'function') chatRender = agmkExtend('chatRender', 'v3.6.9: suhbat koʻrilganda xabarlar oʻqildi', chatRender, o => function () {
            const r = o.apply(this, arguments);
            try { if (CHAT.cur) { const c = chatAll()[CHAT.cur]; chatNtRead(c); } updateRnBadges(); } catch (e) {}
            return r;
        });
        if (typeof chatTopBadge === 'function') chatTopBadge = agmkExtend('chatTopBadge', 'v3.6.9: yagona 💬 sanogʻi', chatTopBadge, o => function () { const r = o.apply(this, arguments); try { const b = $id('chatTopBtn'), c = b && b.querySelector('.chat-cnt'); if (c) { const n = chatUnreadN(); c.textContent = n > 99 ? '99+' : n; c.classList.toggle('hidden', !n); b.classList.toggle('pulse', n > 0); } } catch (e) {} return r; });
        // Suhbat ochiq turganda kelgan xabar darhol oʻqilgan hisoblanadi
        if (typeof notify === 'function') notify = agmkExtend('notify', 'v3.6.9: ochiq suhbat xabari oʻqildi', notify, o => function (x) {
            const r = o.apply(this, arguments);
            try { if (x && x.chatTabel && CHAT.cur && $id('screen-chat') && $id('screen-chat').classList.contains('active')) { if (chatNtRead(chatAll()[CHAT.cur])) updateRnBadges(); } } catch (e) {}
            return r;
        });
        if (typeof opsTasks === 'function') opsTasks = agmkExtend('opsTasks', 'v3.6.8: oʻqilmagan xabarlar alohida', opsTasks, o => function () {
            const L = o.apply(this, arguments);
            try { const N = chatUnreadN(); if (N) { const who = Object.values(chatAll()).filter(c => (c.msgs || []).some(m => !m.me && !m.read)).map(c => c.p && c.p.name).filter(Boolean).slice(0, 2).join(', '); L.push({ k: 'chat', ic: '💬', pr: 3, t: 'Oʻqilmagan xabarlar: ' + N + ' ta', s: who, btn: 'Ochish', js: 'openChats()' }); L.sort((a, b) => a.pr - b.pr); } } catch (e) {}
            return L;
        });
        (function () { const st = document.createElement('style'); st.textContent = `#chatTopBtn .chat-cnt{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#ef4444;color:#fff;font:800 12px/20px system-ui;text-align:center;box-shadow:0 0 0 2px #0f172a}#chatTopBtn .chat-cnt.hidden{display:none}#chatTopCount{display:none!important}`; document.head.appendChild(st); setTimeout(() => { try { updateRnBadges(); } catch (e) {} }, 1500); })();

