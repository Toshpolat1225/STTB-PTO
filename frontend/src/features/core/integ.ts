        // =====================================================================
        // v3.6 — 🔗 BO'LIMLAR INTEGRATSIYASI (real vaqtda, bitta manba)
        //  Pasport ↔ taʼmir tarixi ↔ taʼmir rejasi (PPR / grafik) ↔ «Taʼmirda» holati ↔ Harakat tarkibi
        //  (dispetcher) ↔ Mashinistlar / GPS ↔ hisobot (achot) tekshiruvi.
        //  Qoida: avtomatik yozuv hech qachon yangiroq (jumladan qo'lda kiritilgan) sanani bosib ketmaydi;
        //  qo'lda tahrirlash har doim mumkin va «✋ qoʻlda» deb belgilanadi; har avtomatik yozuv tarixda ko'rinadi.
        // =====================================================================
        var INTEG = { busy: false, t: null };
        function integToday() { try { return polToday(); } catch (e) { return todayISO(); } }
        function integHist(v, type, src, date) { v.history = v.history || []; v.history.unshift({ date: date || integToday(), type: type, author: authorStr(), src: src || 'auto' }); }
        function integEmit(v, what) { try { window.dispatchEvent(new CustomEvent('agmk:unit', { detail: { id: v && v.id, what: what } })); } catch (e) {} }

        // ---------- 1) Harakat tarkibi va dispetcher jurnali taʼmir holatiga moslanadi ----------
        // Taʼmirga ketgan birlik tarkibdan chiqariladi va jurnalga «taʼmirda» yoziladi (turib qolish hisobiga kirmaydi);
        // taʼmirdan chiqqani «Boʻsh / rezervda» bo'lib qaytadi (vaqti bilan).
        function integHr() {
            if (INTEG.busy || typeof hrDB !== 'function') return; INTEG.busy = true;
            try {
                if (typeof hrSanitize === 'function') hrSanitize();
                const d = hrDB(), now = new Date().toISOString(); let ch = false; const inT = new Set(); (d.trem || []).forEach(id => inT.add(id));
                const lastEv = {}; (d.ev || []).forEach(e => { lastEv[e.vid] = e; });
                vagonlarData.forEach(v => {
                    if (v.kind === 'infra') return; const rep = hrInRepair(v), le = lastEv[v.id];
                    if (rep && (!le || le.h !== 'tamirda')) { if (le || inT.has(v.id)) { dispEv(d, v.id, 'tamirda', '', 'Taʼmirda'); ch = true; } }
                    else if (!rep && le && le.h === 'tamirda') {
                        dispEv(d, v.id, 'bosh', (v.pol && v.pol.last && v.pol.last.to) || '', 'Taʼmirdan chiqdi');
                        if (!d.units[v.id] && !d.tarkiblar.some(t => t.lokId === v.id || (t.vagonIds || []).includes(v.id))) d.units[v.id] = { holat: 'bosh', joy: '', izoh: 'Taʼmirdan chiqdi', sabab: '', updAt: now, since: now, by: authorStr() };
                        ch = true;
                    }
                });
                if (d.trem) { delete d.trem; ch = true; }
                if (ch) hrSave(d);
            } catch (e) { console.error(e); } finally { INTEG.busy = false; }
        }
        function integSoon() { clearTimeout(INTEG.t); INTEG.t = setTimeout(integHr, 400); }

        // ---------- 2) Taʼmirdan chiqarilganda — pasport sanalari va reja avtomatik ----------
        function integRelease(v, was) {
            if (!v || !was) return; const rt = was.rt || '', d = integToday(), kind = v.kind || 'vag', notes = [];
            const snap = { tamirSanasi: v.tamirSanasi, tamirTuri: v.tamirTuri, keyingi: v.keyingi, drAuto: v.drAuto, kr: v.kr };
            if (kind === 'vag') {
                if (rt === 'DR' && !(v.tamirSanasi && v.tamirSanasi >= d)) { v.tamirSanasi = d; v.tamirTuri = "Depo ta'miri (DR)"; if (!(v.man && v.man.keyingi && v.drAuto === false)) v.drAuto = true; notes.push('oxirgi DR → ' + fmtISO(d)); }
                if (rt === 'KR' && !(v.kr && v.kr >= d)) { v.kr = d; v.krTxt = ''; notes.push('oxirgi KR → ' + fmtISO(d)); }
                // vagonlar taʼmir grafigi: shu oy (yoki o'tgan oy) rejasidagi qator «bajarildi»
                try { const pd = typeof pprDB === 'function' ? pprDB() : null; if (pd && (rt === 'DR' || rt === 'KR')) { const no = pprNo(vagonNo(v)), cur = pprCurM(), f = pprFind(pd, no).find(z => z.m === cur || z.m === pprAddM(cur, -1));
                    if (f) { const L = pprMon(pd, f.m); L[f.si] = L[f.si] || pprList(pd, f.m, f.si).slice(); const it = L[f.si].find(z => pprNo(z.v) === no && !z.ghost); if (it && !it.done) { it.done = { d: d, by: 'pol' }; pprLog(pd, '№' + no + ' taʼmirdan chiqdi — grafikda «bajarildi»'); pprSave(pd); notes.push('grafikda ' + pprMName(f.m) + ' — bajarildi'); } } } } catch (e) {}
            } else if (rt !== 'NS') {
                // lokomotiv / avtotraktor / yo'l texnikasi: oxirgi taʼmir + yillik PPR rejasidagi joriy oy
                if (!(v.tamirSanasi && v.tamirSanasi >= d)) { v.tamirSanasi = d; v.tamirTuri = (v.ppr && v.ppr.plan && v.ppr.plan[new Date().getMonth()]) || POL_RT[rt] || v.tamirTuri || "Ta'mir"; notes.push('oxirgi taʼmir → ' + fmtISO(d)); }
                if (v.ppr && v.ppr.events) { const e = v.ppr.events.filter(e => !e.done && e.s <= d).sort((a, b) => b.s.localeCompare(a.s))[0]; if (e) { e.done = d; notes.push('PPR «' + e.c + '» bajarildi'); } }
                else if (v.ppr && v.ppr.plan) { const m = new Date().getMonth(); v.ppr.done = v.ppr.done || {}; if (v.ppr.plan[m] && !v.ppr.done[m]) { v.ppr.done[m] = d; notes.push('PPR ' + v.ppr.plan[m] + ' (' + OY_NOMI[m] + ') bajarildi'); } }
            }
            if (notes.length) { v.relAuto = { date: d, rt: rt, snap: snap }; integHist(v, '🔗 Pasport avtomatik yangilandi (taʼmirdan chiqarildi): ' + notes.join(', '), 'auto', d); try { recalcVagonStatus(v); } catch (e) {} }
            return notes;
        }

        // ---------- 3) Qo'lda tahrir belgisi ----------
        function integManMark(v, prev) {
            const at = new Date().toISOString(); v.man = v.man || {};
            ['tamirSanasi', 'tamirTuri', 'keyingi', 'status'].forEach(k => { if (String(prev[k] || '') !== String(v[k] || '')) v.man[k] = at; });
        }

        (function () {
            if (typeof hrSanitize === 'function') hrSanitize = agmkExtend('hrSanitize', 'v3.6 integratsiya: tarkib vaqti va chiqarilganlar', hrSanitize, o => function () {
                let pre = null; try { pre = JSON.parse(localStorage.getItem(HR_KEY) || 'null'); } catch (e) {}
                const d = o.apply(this, arguments); if (!pre || !pre.tarkiblar) return d;
                const now = new Date().toISOString(); let ch = false, rem = [];
                (d.tarkiblar || []).forEach(t => { const p = pre.tarkiblar.find(x => x.id === t.id); if (!p) return; const cur = new Set((t.vagonIds || []).concat(t.lokId ? [t.lokId] : [])), gone = (p.vagonIds || []).concat(p.lokId ? [p.lokId] : []).filter(id => !cur.has(id));
                    if (gone.length || p.holat !== t.holat) { t.updAt = now; ch = true; rem = rem.concat(gone); } });
                if (ch) { d.trem = rem.slice(0, 200); hrSave(d); } return d;
            });
            const X = (n, l, f) => { if (typeof window[n] === 'function') window[n] = agmkExtend(n, 'v3.6 integratsiya: ' + l, window[n], f); };
            // Taʼmirga yuborish: lokomotiv/texnika raqami vagonlar grafigidagi vagon raqamiga adashib tushmasin
            X('markVagonAsTamirda', 'faqat vagon grafigi, tarkib va dispetcher jurnali', o => async function () {
                const v = vagonlarData.find(x => x.id === activeVagonId), keep = typeof pprDB === 'function' ? pprDB : null;
                if (v && v.kind && keep) pprDB = () => null;
                try { return await o.apply(this, arguments); } finally { if (keep) pprDB = keep; if (v) { integHr(); integEmit(v, 'tamirda'); } }
            });
            // Taʼmirdan chiqarish: vagon bo'lmasa — seh so'ralmaydi (o'z sexida qoladi); sanalar, reja, tarkib
            X('polRelease', 'pasport sanalari, PPR, tarkib', o => async function (vid) {
                const v = vagonlarData.find(x => String(x.id) === String(vid)); if (!v) return o.apply(this, arguments);
                const was = Object.assign({}, v.pol || {}); if (v.kind && typeof POL !== 'undefined' && !POL.relPreset) POL.relPreset = v.seh || '—';
                const r = await o.apply(this, arguments);
                if (r) { const n = integRelease(v, was); saveDB(); integHr(); integEmit(v, 'chiqdi'); if (n && n.length) showToast('🔗 Pasport: ' + n.join(', ')); try { if (activeVagonId === v.id && $id('screen-vagon-pasport').classList.contains('active')) openPassport(v.id); } catch (e) {} }
                return r;
            });
            X('polStatusEv', 'tarkib va jurnal', o => function (v, wasT) { const r = o.apply(this, arguments); try { if (wasT && v.status !== 'Tamirda') integRelease(v, (v.pol && v.pol.last) || {}); } catch (e) {} integSoon(); return r; });
            X('polPasteApply', 'tarkib va jurnal', o => function () { const r = o.apply(this, arguments); integSoon(); return r; });
            X('dvpApplyRows', 'tarkib, jurnal, lokomotivlar PPR', o => function (x, sel) {
                const r = o.apply(this, arguments);
                try { (sel || []).forEach(z => { const v = z.v, p = z.p; if (!v) return; delete v.relAuto;
                    if (v.kind) { v.drAuto = false; if (v.ppr && v.ppr.plan && !v.ppr.events) { const m = +p.end.slice(5, 7) - 1; v.ppr.done = v.ppr.done || {}; if (v.ppr.plan[m] && !v.ppr.done[m]) v.ppr.done[m] = p.end; } v.tamirTuri = p.rtype === 'KR' ? 'Kapital taʼmir (KR)' : v.tamirTuri; if (p.rtype === 'KR' && !(v.tamirSanasi && v.tamirSanasi >= p.end)) v.tamirSanasi = p.end; recalcVagonStatus(v); }
                    if (v.man) { delete v.man.tamirSanasi; delete v.man.keyingi; } }); saveDB(); } catch (e) { console.error(e); }
                integSoon(); return r;
            });
            // Achot (defekt vedomost): vagon topilmasa — lokomotiv/texnika ham qidiriladi; taʼmirdan chiqqan kuni avtomatik yozilgan
            // sana hujjatdagi aniq sana bilan almashtiriladi; qo'lda kiritilgan sana bo'lsa — ogohlantiriladi
            X('dvpVagons', 'lokomotivlar ham', o => function (w) { const L = o.apply(this, arguments); if (L.length) return L; const n = String(w).replace(/^0+/, ''); return vagonlarData.filter(v => (v.kind === 'lok' || v.kind === 'avto' || v.kind === 'yol') && String(vagonNo(v)).replace(/\D/g, '').replace(/^0+/, '') === n); });
            X('dvpRows', 'avtomatik sana va qoʻlda tahrir', o => function () {
                const R = o.apply(this, arguments);
                R.forEach(r => { const v = r.v, p = r.p; if (!v || !p || !p.end) return;
                    const field = p.rtype === 'KR' ? 'kr' : 'tamirSanasi';
                    if (!r.ok && /^ℹ️/.test(r.why) && v.relAuto && v.relAuto.date === r.old && p.end <= r.old) { r.ok = true; r.why = ''; r.note = 'taʼmirdan chiqqan kun (' + fmtISO(r.old) + ') oʻrniga hujjatdagi aniq sana'; }
                    if (v.man && v.man[field === 'kr' ? 'tamirSanasi' : field]) r.note = (r.note ? r.note + '; ' : '') + '✋ pasportdagi sana qoʻlda kiritilgan (' + fmtISO(v[field] || '') + ')' + (r.ok ? ' — hujjatdagi yangiroq sana yoziladi' : ' — oʻzgartirilmaydi');
                    if (r.why && r.note) r.why += ' · ' + r.note; });
                return R;
            });
            // Pasportni qo'lda tahrirlash — belgilanadi (avtomatik yozuv yangiroq qo'lda sanani bosib ketmaydi)
            X('savePassportChanges', 'qoʻlda tahrir belgisi, tarkib', o => async function () {
                const v = vagonlarData.find(x => x.id === activeVagonId), prev = v ? { tamirSanasi: v.tamirSanasi, tamirTuri: v.tamirTuri, keyingi: v.keyingi, status: v.status } : null;
                const inp = { tamirSanasi: ($id('edit-tamir-sanasi') || {}).value, tamirTuri: ($id('edit-tamir-turi') || {}).value, keyingi: ($id('edit-keyingi') || {}).value, status: ($id('edit-status') || {}).value };
                const typed = prev ? Object.keys(inp).filter(k => inp[k] !== undefined && !(k === 'status' && inp[k] === 'Auto') && String(inp[k] || '') !== String(prev[k] || '')) : [];
                const r = await o.apply(this, arguments);
                if (v && prev && typed.length && typed.some(k => String(prev[k] || '') !== String(v[k] || ''))) { const at = new Date().toISOString(); v.man = v.man || {}; typed.forEach(k => { v.man[k] = at; }); const LB = { tamirSanasi: 'oxirgi taʼmir sanasi', tamirTuri: 'taʼmir turi', keyingi: 'keyingi taʼmir sanasi', status: 'holat' }, val = k => /Sana|keyingi/.test(k) ? fmtISO(v[k] || '') : (v[k] || '—');
                    integHist(v, '✋ Pasport qoʻlda tahrirlandi: ' + typed.filter(k => String(prev[k] || '') !== String(v[k] || '')).map(k => LB[k] + ' ' + (/Sana|keyingi/.test(k) ? fmtISO(prev[k] || '') || '—' : prev[k] || '—') + ' → ' + val(k)).join(', '), 'man'); delete v.relAuto; saveDB(false); integHr(); integEmit(v, 'tahrir'); try { openPassport(v.id); } catch (e) {} }
                return r;
            });
            // Taʼmir tarixiga qo'lda yozuv: yangiroq bo'lsa — pasportdagi oxirgi taʼmir ham yangilansinmi?
            X('addNewTamir', 'pasport sanasi', o => async function () {
                const v = vagonlarData.find(x => x.id === activeVagonId), t = ($id('new-tamir-turi') || {}).value || '', d = ($id('new-tamir-date') || {}).value || '';
                const r = o.apply(this, arguments); if (!v || !d) return r;
                const isKR = /KR|Kapital/i.test(t), cur = isKR ? v.kr : v.tamirSanasi;
                if (/DR|KR|Depo|Kapital/i.test(t) && d <= integToday() && !(cur && cur >= d) && await uiConfirm('Pasportdagi oxirgi ' + (isKR ? 'KR' : 'taʼmir') + ' sanasi ham ' + fmtISO(d) + ' ga yangilansinmi?\n(keyingi taʼmir muddati qayta hisoblanadi)')) {
                    const prev = { tamirSanasi: v.tamirSanasi, tamirTuri: v.tamirTuri, keyingi: v.keyingi, status: v.status };
                    if (isKR) { v.kr = d; v.krTxt = ''; } else { v.tamirSanasi = d; v.tamirTuri = t; if (v.drAuto !== false || !v.kind) v.drAuto = !v.kind ? true : v.drAuto; }
                    try { recalcVagonStatus(v); } catch (e) {} integManMark(v, prev); saveDB(); try { openPassport(v.id); } catch (e) {} showToast('🔗 Pasport yangilandi');
                }
                return r;
            });
            // Taʼmir rejasi (PPR): «bajarildi» belgilansa — pasport tarixiga va oxirgi taʼmir sanasiga
            X('pprEdSave', 'tarix va oxirgi taʼmir', o => function () {
                const v = PPRE.v, old = v && v.ppr ? JSON.parse(JSON.stringify(v.ppr)) : {}; const r = o.apply(this, arguments); if (!v || !v.ppr) return r;
                const done = []; const p = v.ppr;
                if (p.events) p.events.forEach(e => { if (e.done && !(old.events || []).some(x => x.s === e.s && x.c === e.c && x.done === e.done)) done.push([e.done, e.c]); });
                else Object.keys(p.done || {}).forEach(m => { if (p.done[m] && (!old.done || old.done[m] !== p.done[m])) done.push([p.done[m], (p.plan || [])[m] || 'PPR']); });
                if (done.length) { done.sort((a, b) => a[0].localeCompare(b[0])).forEach(x => { integHist(v, '📅 Rejali taʼmir bajarildi: ' + x[1] + ' — ' + fmtISO(x[0]), 'ppr', x[0]); if (!(v.tamirSanasi && v.tamirSanasi >= x[0]) && x[0] <= integToday()) { v.tamirSanasi = x[0]; v.tamirTuri = x[1]; } });
                    try { recalcVagonStatus(v); } catch (e) {} saveDB(false); try { if (activeVagonId === v.id) openPassport(v.id); } catch (e) {} }
                integSoon(); return r;
            });
            // Boshqa telefondan kelgan o'zgarishlar (sinxron) — tarkib/jurnal moslashtiriladi
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.6 integratsiya: tarkib moslashtirish', syncApply, o => function (rec) { const r = o.apply(this, arguments); if (rec && rec.kind === 'unit') integSoon(); return r; });
            // Taʼmir tarixi — bitta joyda, aralash: har yozuv manbasi belgisi bilan (qo'lda, avtomatik, achot, reja, nosozlik, polojeniya)
            X('renderTamirHistory', 'manba belgilari', o => function (v) {
                const r = o.apply(this, arguments);
                try { const c = $id('tamir-history-list'); if (!c || !v || !v.history) return r; const items = c.querySelectorAll('.history-item');
                    const TAG = { man: ['✋', 'Qoʻlda'], auto: ['🔗', 'Avtomatik'], dv: ['📄', 'Achotdan'], ppr: ['📅', 'Reja'], ns: ['🆘', 'Nosozlik'], pol: ['🔧', 'Polojeniya'] };
                    v.history.forEach((h, i) => { const el = items[i]; if (!el) return; const t = TAG[h.src] || (h.src ? null : ['✍️', 'Qoʻlda yozuv']); if (!t) return; el.classList.add('hs-src-' + (h.src || 'user')); el.insertAdjacentHTML('afterbegin', `<span class="hs-tag">${t[0]} ${t[1]}</span>`); });
                } catch (e) { console.error(e); }
                return r;
            });
            const st = document.createElement('style'); st.textContent = '.hs-tag{display:inline-block;font-size:10.5px;font-weight:800;border-radius:8px;padding:1px 7px;margin-right:6px;background:#334155;color:#e2e8f0;vertical-align:middle}.hs-src-man .hs-tag{background:#7c2d12}.hs-src-auto .hs-tag{background:#0e7490}.hs-src-dv .hs-tag{background:#1d4ed8}.hs-src-ppr .hs-tag{background:#4d7c0f}.hs-src-ns .hs-tag{background:#b91c1c}.hs-src-pol .hs-tag{background:#6d28d9}'; document.head.appendChild(st);
            window.addEventListener('agmk:login', () => setTimeout(integHr, 2500));
        })();

