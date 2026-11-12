        // =====================================================================
        // v2.9 — Hisobot tekshiruviga qo'shimchalar
        //  • Tasdiqlangan norma: spravka miqdori normadan oshmasin (add47_norm.js)
        //  • Defekt vedomost «Группа работ»: ehtiyot qism o'z guruhida bo'lishi kerak (🔷 — tekshirish uchun)
        //  • Defekt vedomostdagi «Время окончания ремонта» → vagon pasportidagi DR / KR sanasi (tasdiq bilan, bekor qilish mumkin)
        // =====================================================================
        var HP47 = { last: null }, DVG47_KEY = 'agmk_dvgrp_v1', DVP47_KEY = 'agmk_dvpass_v1';
        function dvgKey(name) { const t = nrmToks(name); return t.w.slice(0, 2).map(x => x.slice(0, 4)).join(' ') + '|' + t.n.join(','); }
        function dvgNorm(g) { return hpLow(g).replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim(); }
        var DVG47 = null;
        function dvgModel() {
            if (DVG47) return DVG47; const M = {};
            (typeof DVG47_BASE !== 'undefined' ? DVG47_BASE : []).forEach(([n, g, c]) => { const k = dvgKey(n), G = dvgNorm(g); if (!k || k === '|') return; const m = M[k] = M[k] || { tot: 0, g: {}, lab: {} }; m.tot += c; m.g[G] = (m.g[G] || 0) + c; m.lab[G] = g; });
            DVG47 = M; return M;
        }
        function dvgAllowed(k, G) {
            const m = dvgModel()[k]; if (!m || m.tot < 3) return true;
            if ((m.g[G] || 0) / m.tot >= 0.2) return true;
            const u = kvGet(DVG47_KEY, {}); return !!(u[k] && u[k].indexOf(G) >= 0);
        }
        function dvgCheck(pkg, F) {
            const dvs = []; pkg.sheets.filter(x => x.type === 'dv' && x.data).forEach(x => x.data.forEach(b => dvs.push(b)));
            const agg = {};
            dvs.forEach(d => d.items.forEach(it => {
                if (!it.grp || !(it.qty > 0)) return; const k = dvgKey(it.name), G = dvgNorm(it.grp); if (!k || k === '|' || dvgAllowed(k, G)) return;
                const a = agg[k + '#' + G] = agg[k + '#' + G] || { k: k, G: G, grp: it.grp, name: it.name, w: [], src: [] }; if (d.wagon && a.w.indexOf(d.wagon) < 0) a.w.push(d.wagon); a.src.push(it.src);
            }));
            Object.values(agg).forEach(a => { const m = dvgModel()[a.k], exp = Object.keys(m.g).filter(g => m.g[g] / m.tot >= 0.2).map(g => m.lab[g]);
                F.push({ id: 'dg' + F.length, st: '', t: 'dvgrp', lvl: 'blue', sec: 'Defekt vedomost — ish guruhlari', name: a.name, dvg: { k: a.k, G: a.G }, msg: '«' + a.name + '» «' + a.grp + '» guruhida (Группа работ) koʻrsatilgan, lekin bu qism odatda «' + exp.join('», «') + '» guruhiga tegishli. Vagon(lar): № ' + (a.w.join(', ') || '—') + '. Ehtiyot qism oʻz guruhidagi pozitsiyaga yozilishi kerak — tekshiring. («✖ Xato emas» desangiz, bu guruh ham toʻgʻri deb eslab qolinadi.)', src: a.src.slice(0, 12) }); });
        }
        (function () {
            if (typeof hpCheck !== 'function') return; hpCheck = agmkExtend('hpCheck', 'hpCheck', hpCheck, o => function (pkg) {
                const res = o.apply(this, arguments);
                try { if (res && res.findings) {
                    try { nrmCheckPkg(pkg, res); } catch (e) { console.error(e); }
                    try { dvgCheck(pkg, res.findings); } catch (e) { console.error(e); }
                    const dvp = []; pkg.sheets.filter(x => x.type === 'dv' && x.data).forEach(x => x.data.forEach(d => { if (d.wagon) dvp.push({ wagon: d.wagon, raw: d.wagonRaw || d.wagon, rtype: d.rtype, end: d.end || '', endTxt: d.endTxt || '', obj: d.obj || '', src: d.endSrc || d.src }); }));
                    res.dvp = dvp; HP47.last = dvp;
                    const ord = { red: 0, blue: 1, info: 2 }; res.findings.sort((a, b) => ord[a.lvl] - ord[b.lvl]);
                } } catch (e) { console.error(e); }
                return res;
            });
            if (typeof hsJsonSave === 'function') { hsJsonSave = agmkExtend('hsJsonSave', 'hsJsonSave', hsJsonSave, s => function (ref, obj) { try { if (obj && obj.kind === 'pkg' && !obj.dvp && HP47.last) { obj.dvp = HP47.last; HP47.last = null; } } catch (e) {} return s.apply(this, arguments); }); }
            // «Xato emas» — guruh ruxsati eslab qolinadi
            if (typeof hsMark === 'function') { hsMark = agmkExtend('hsMark', '«Xato emas» — guruh ruxsati eslab qolinadi', hsMark, m => async function (fid, st) { const r = await m.apply(this, arguments); try { const f = HS.data && HS.data.findings.find(z => z.id === fid); if (f && f.t === 'dvgrp' && f.dvg) { const u = kvGet(DVG47_KEY, {}); const L = u[f.dvg.k] = u[f.dvg.k] || []; const i = L.indexOf(f.dvg.G); if (f.st === 'no' && i < 0) L.push(f.dvg.G); if (f.st !== 'no' && i >= 0) L.splice(i, 1); kvSet(DVG47_KEY, u); } } catch (e) {} return r; }); }
            // Natija ekraniga: normaga moslashtirish va DV → pasport bloklari
            if (typeof hpChkLoad === 'function') { hpChkLoad = agmkExtend('hpChkLoad', 'Natija ekraniga: normaga moslashtirish va DV → pasport bloklari', hpChkLoad, c => async function (x, d, box) { const r = await c.apply(this, arguments); try { hp47Extra(x, d, box); } catch (e) { console.error(e); } return r; }); }
            // Hisobot bo'limiga «Tasdiqlangan normalar» kartasi
            if (typeof hsRender === 'function') { hsRender = agmkExtend('hsRender', 'Hisobot boʼlimiga «Tasdiqlangan normalar» kartasi', hsRender, h => function () { const r = h.apply(this, arguments); try { if (HS.tab === 'hisob' && HS.cat && !HS.chk && !$id('nrmBox')) { const hb = $id('hpBox'); const n = nrmDB().sets.filter(s => !s.off).length; const html = `<div class="hs-box" id="nrmBox"><div class="hs-h">📐 Tasdiqlangan normalar (norma rasxod)</div><div class="nd-tip">${n ? n + ' ta norma bazada. ' : 'Hali yuklanmagan. '}Tekshiruvda spravkadagi miqdor shu normadan oshmasligi tekshiriladi.</div><button class="action-btn" onclick="nrmOpen()">📐 Normalarni ochish</button></div>`; if (hb) hb.insertAdjacentHTML('afterend', html); } } catch (e) { console.error(e); } return r; }); }
        })();
        function hp47Extra(x, d, box) {
            const E = escapeHtml, can = hsCan() && x.status !== 'done'; let h = '';
            const mp = (d.findings || []).filter(f => f.nmu && f.nm);
            if (mp.length && nrmCanEdit()) h += `<div class="hs-box nr-box"><div class="hs-h">🔗 Normaga moslashtirish</div><div class="nd-tip">Spravkadagi ayrim nomlar tasdiqlangan normada aniq topilmadi. Bir marta bogʻlang — keyingi tekshiruvlarda oʻzi solishtiradi.</div>${mp.map(f => `<div class="nr-mb"><span>${E(f.sec)} — <b>${f.nm.items ? nrmEval(f.nm).un.length : ''}</b> ta nom</span><button class="mini-btn" onclick="nrmMapOpen('${f.id}')">🔗 Moslashtirish</button></div>`).join('')}</div>`;
            const P = d.dvp || [];
            if (P.length) {
                // Avtomatik: tekshiruv natijasi birinchi ochilganda aniq yozilgan sanalar pasportga kiritiladi (bir marta; ↩ bilan qaytariladi)
                let auto = kvGet(DVP47_KEY, []).filter(z => z.chk === x.id).slice(-1)[0] || null;
                if (!auto && hsCan()) { const ok = dvpRows(P).filter(r => r.ok && r.v); auto = dvpApplyRows(x, ok, true); }
                const R = dvpRows(P), bad = R.filter(r => !r.ok && !/^ℹ️/.test(r.why)), withD = P.filter(p => p.end).length;
                h += `<div class="hs-box dvp-box"><div class="hs-h">📄 Defekt vedomostdan pasportga (DR / KR sanasi)</div><div class="nd-tip">${P.length} ta defekt vedomost · ${withD} tasida «Время окончания ремонта» sanasi yozilgan.</div>`
                    + (auto && auto.items.length ? `<div class="nd-tip">✅ <b>${auto.undone ? 'Bekor qilingan' : 'Avtomatik kiritildi'}</b> (${escapeHtml(fmtDT(auto.at))}): ${auto.items.map(z => '№' + escapeHtml(z.no) + ' ' + z.rt + ' ' + fmtISO(z.end)).join(', ')}</div>${!auto.undone && hsCan() ? `<button class="action-btn sec" onclick="dvpUndo('${auto.id}')">↩ Bekor qilish</button>` : ''}` : '<div class="nd-tip">Pasportga yangi sana kiritilmadi (hammasida yangiroq yoki shu sana bor).</div>')
                    + (bad.length ? `<div class="hp-warn">⚠️ Kiritilmadi — tekshiring:<br>${bad.map(r => '№ ' + escapeHtml(r.p.raw) + ': ' + escapeHtml(r.why.replace(/^⚠️\s*/, ''))).join('<br>')}</div>` : '')
                    + (hsCan() ? `<button class="action-btn sec" onclick="dvpOpen()">📄 Batafsil</button>` : '') + '</div>';
            }
            if (h) box.insertAdjacentHTML('afterbegin', h);
        }
        // ---------- DV → pasport ----------
        function dvpVagons(w) { return (vagonlarData || []).filter(v => !v.kind && String(vagonNo(v)).replace(/\D/g, '').replace(/^0+/, '') === String(w).replace(/^0+/, '')); }
        function dvpRows(P) {
            const today = new Date().toISOString().slice(0, 10);
            return P.map(p => {
                const L = dvpVagons(p.wagon), v = L.length === 1 ? L[0] : null, r = { p: p, v: v, ok: false, why: '', old: '' };
                if (!p.end) r.why = p.endTxt ? '⚠️ sana oʻqilmadi: «' + p.endTxt + '»' : '⚠️ sana kiritilmagan';
                else if (!p.rtype) r.why = '⚠️ taʼmir turi (DR/KR) aniqlanmadi';
                else if (!L.length) r.why = '⚠️ pasportda bu raqamli vagon topilmadi';
                else if (L.length > 1) r.why = '⚠️ bu raqamda ' + L.length + ' ta vagon — noaniq';
                else if (p.end > today) r.why = '⚠️ sana kelajakda';
                else { r.old = p.rtype === 'KR' ? (v.kr || '') : (v.tamirSanasi || ''); if (r.old && r.old >= p.end) r.why = 'ℹ️ pasportda ' + (r.old === p.end ? 'shu sana' : 'yangiroq sana') + ' bor (' + fmtISO(r.old) + ')'; else r.ok = true; }
                return r;
            });
        }
        async function dvpOpen() {
            const x = hsRec(HS.chk), d = HS.data; if (!x || !d || !d.dvp) return; const E = escapeHtml, R = dvpRows(d.dvp); HS47DV = R;
            const last = kvGet(DVP47_KEY, []).filter(z => z.chk === x.id && !z.undone).slice(-1)[0];
            mdl('dvpModal', `<div class="px-h"><b>📄 Defekt vedomost → pasport</b><button class="mini-btn" onclick="mdlClose('dvpModal')">✕</button></div>
                <div class="nd-tip">«Время окончания ремонта» sanasi vagon pasportiga yoziladi: <b>«На деповской ремонт» → oxirgi DR</b>, <b>«капитальный» → oxirgi KR</b>. Eski sana yangisi bilan almashtirilmaydi, sana yoʻq boʻlsa — taxmin qilinmaydi. Tarixga «📄 defekt vedomostdan» belgisi bilan yoziladi.</div>
                <div class="dvp-list">${R.map((r, i) => `<label class="dvp-row${r.ok ? '' : ' off'}"><input type="checkbox" data-i="${i}" ${r.ok ? 'checked' : 'disabled'}><div><b>№ ${E(r.p.raw)}</b> <small>${r.p.rtype === 'KR' ? 'KR (kapital)' : r.p.rtype === 'DR' ? 'DR (depo)' : '—'}${r.v ? ' · ' + E(r.v.type || '') : ''}</small><br>${r.ok ? `${r.old ? E(fmtISO(r.old)) : '—'} → <b>${E(fmtISO(r.p.end))}</b>` : E(r.why)}<br><small>📍 ${E(hpSrc(r.p.src))}</small></div></label>`).join('')}</div>
                <button class="action-btn" onclick="dvpApply()">✅ Belgilanganlarni pasportga kiritish</button>${last ? `<button class="action-btn sec" onclick="dvpUndo('${last.id}')">↩ Oxirgi kiritishni bekor qilish (${last.items.length} ta vagon)</button>` : ''}`, true);
        }
        var HS47DV = [];
        async function dvpApply() {
            if (!hsCan()) return; const x = hsRec(HS.chk); if (!x) return;
            const sel = [...document.querySelectorAll('#dvpModal input[data-i]:checked')].map(c => HS47DV[+c.dataset.i]).filter(r => r && r.ok && r.v); if (!sel.length) { mdlClose('dvpModal'); return; }
            if (!(await uiConfirm(sel.length + ' ta vagon pasportida taʼmir sanasi yangilanadi. Davom etilsinmi?'))) return;
            dvpApplyRows(x, sel, false); mdlClose('dvpModal');
        }
        function dvpApplyRows(x, sel, auto) {
            const now = new Date().toISOString(), by = authorStr(), items = []; let pd = null; try { pd = typeof pprDB === 'function' ? pprDB() : null; } catch (e) {}
            sel.forEach(r => {
                const v = r.v, p = r.p, old = { tamirSanasi: v.tamirSanasi, tamirTuri: v.tamirTuri, keyingi: v.keyingi, drAuto: v.drAuto, kr: v.kr, krTxt: v.krTxt, status: v.status, kun: v.kun, pol: v.pol ? JSON.parse(JSON.stringify(v.pol)) : v.pol };
                if (p.rtype === 'KR') { v.kr = p.end; v.krTxt = ''; } else { v.tamirSanasi = p.end; v.tamirTuri = "Depo ta'miri (DR)"; v.drAuto = true; }
                if (v.status === 'Tamirda') { v.status = 'Auto'; try { if (typeof polOutRec === 'function') { polOutRec(v, p.end, v.seh || '', 'Defekt vedomost («Время окончания ремонта»), tekshirdi ' + polPerson(by), 'defekt vedomostdan'); const h0 = v.history[0]; h0.src = 'dv'; h0.hm = ''; h0.type = h0.type.replace(/ \(\d{1,2}:\d{2}\)$/, ''); } } catch (e) {} }
                v.history = v.history || []; v.history.unshift({ date: p.end, type: '📄 Defekt vedomostdan: ' + (p.rtype === 'KR' ? 'Kapital taʼmir (KR)' : 'Depo taʼmiri (DR)') + ' yakunlandi — ' + fmtISO(p.end), author: by, src: 'dv' });
                v.dvSrc = { at: now, chk: x.id, src: hpSrc(p.src) };
                try { recalcVagonStatus(v); } catch (e) {}
                let pp = null; try { if (pd) { const m = p.end.slice(0, 7), f = pprFind(pd, p.wagon).find(z => z.m === m); if (f) { const L = pprMon(pd, f.m); L[f.si] = L[f.si] || pprList(pd, f.m, f.si).slice(); const it = L[f.si].find(z => pprNo(z.v) === String(p.wagon).replace(/^0+/, '') && !z.ghost); if (it && !it.done) { it.done = { d: p.end, by: 'DV' }; pp = { m: f.m, si: f.si, v: it.v }; } } } } catch (e) {}
                items.push({ vid: v.id, no: p.raw, rt: p.rtype, end: p.end, old: old, ppr: pp });
            });
            try { if (pd && items.some(z => z.ppr)) { pprLog(pd, items.filter(z => z.ppr).length + ' ta vagon defekt vedomost boʻyicha «bajarildi» deb belgilandi'); pprSave(pd); } } catch (e) {}
            if (items.length) saveDB();
            const ent = { id: 'dp' + Date.now().toString(36), chk: x.id, at: now, by: by, items: items, auto: !!auto }; const log = kvGet(DVP47_KEY, []); log.push(ent); kvSet(DVP47_KEY, log.slice(-50));
            if (items.length) { const all = hsChecks(), rr = all.find(z => z.id === x.id); if (rr) { hsLog(rr, (auto ? 'Avtomatik: d' : 'D') + 'efekt vedomostdan ' + items.length + ' ta vagon pasportiga taʼmir sanasi kiritildi: ' + items.map(z => '№' + z.no + ' ' + z.rt + ' ' + fmtISO(z.end)).join(', ')); kvSet(HS_CHK_KEY, all); }
                try { aiLog('Defekt vedomostdan pasportga: ' + items.length + ' ta vagon'); } catch (e) {}
                try { filterVagonlar(); } catch (e) {}
                showToast('✅ ' + items.length + ' ta vagon pasportida DR/KR sanasi yangilandi (defekt vedomostdan)'); }
            return ent;
        }
        async function dvpUndo(id) {
            const log = kvGet(DVP47_KEY, []), L = log.find(z => z.id === id); if (!L || L.undone) return;
            if (!(await uiConfirm(L.items.length + ' ta vagon pasportidagi oʻzgarish bekor qilinsinmi?'))) return;
            let pd = null; try { pd = pprDB(); } catch (e) {}
            L.items.forEach(z => { const v = vagonlarData.find(q => q.id === z.vid); if (!v) return; Object.assign(v, z.old); v.history = (v.history || []).filter(h => !(h.src === 'dv' && h.date === z.end)); v.history.unshift({ date: new Date().toISOString().slice(0, 10), type: '↩ Defekt vedomostdan kiritilgan sana bekor qilindi (' + fmtISO(z.end) + ')', author: authorStr() }); delete v.dvSrc; try { recalcVagonStatus(v); } catch (e) {}
                try { if (pd && z.ppr) { const LL = pprMon(pd, z.ppr.m)[z.ppr.si] || []; const it = LL.find(q => q.v === z.ppr.v); if (it) delete it.done; } } catch (e) {} });
            try { if (pd) pprSave(pd); } catch (e) {}
            L.undone = new Date().toISOString(); kvSet(DVP47_KEY, log); saveDB(); try { filterVagonlar(); } catch (e) {}
            mdlClose('dvpModal'); showToast('↩ Bekor qilindi');
        }

