        //  • Pasportda rangli tugmalar; «🗑 Oʻchirish» — ✏️ Tahrirlash oynasining pastida
        //  • Kunlik polojeniyada 4 rangli holat; «taʼmirda» soni — faqat 🔵 (sex ichida taʼmir boshlangan) vagonlar
        //  • Pasport taʼmir tarixida faqat taʼmirdan chiqqan sana (kim, qachon); oraliq bosqichlar polojeniyada
        //  • Taʼmirdan chiqarilganda DR/KR sanasi (vaqtincha) shu kun; defekt vedomost (hisobot) tekshirilganda — hujjatdagi sana asosiy
        //  • Taʼmirga yuborilgan vagon grafikda keyingi oylardan joriy oyga izoh bilan koʻchadi
        var VT_ST = {
            sent: { c: '#b45309', bg: 'rgba(180,83,9,.22)', i: '🟤', t: 'Taʼmirga yuborilgan', b: 'Taʼmirga yuborish' },
            queue: { c: '#ef4444', bg: 'rgba(239,68,68,.16)', i: '🔴', t: 'Taʼmirga navbatda', b: 'Navbatga qoʻyish' },
            work: { c: '#3b82f6', bg: 'rgba(59,130,246,.16)', i: '🔵', t: 'Taʼmirda', b: 'Taʼmir boshlandi' },
            done: { c: '#22c55e', bg: 'rgba(34,197,94,.16)', i: '🟢', t: 'Taʼmirdan chiqdi', b: 'Taʼmir tugadi' }
        };
        var VT_MON = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        function vtStage(v) { if (!v || v.status !== 'Tamirda') return null; return (v.pol && v.pol.stage) || 'work'; } // eski yozuvlar (bosqichsiz) — taʼmirda
        function vtBadge(st) { const S = VT_ST[st]; return S ? `<span class="vt-badge" style="color:${S.c};border-color:${S.c};background:${S.bg}">${S.i} ${S.t}</span>` : ''; }
        function vtStageAt(v, D) {
            if (D === polToday()) return vtStage(v) || 'work';
            const H = (v.history || []).slice().reverse(); let st = null;
            H.forEach(h => { const d = polD(h.date); if (!d || d > D) return; if (h.ev === 'in') st = h.stg ? 'sent' : 'work'; else if (h.ev === 'q') st = 'queue'; else if (h.ev === 'w') st = 'work'; });
            return st || 'work';
        }
        function vtMonName(m) { if (!m) return ''; const k = +String(m).split('-')[1] - 1, y = String(m).slice(0, 4); return VT_MON[k] ? VT_MON[k].charAt(0).toUpperCase() + VT_MON[k].slice(1) + (y !== String(new Date().getFullYear()) ? ' ' + y : '') : m; }
        function vtWho() { try { return authorStr(); } catch (e) { return ''; } }
        // ---------- 🔴 Yuborish: sabab ham soʻraladi; grafikdan koʻchirish ----------
        if (typeof polAskRepair === 'function') polAskRepair = agmkExtend('polAskRepair', 'v3.16: sabab', polAskRepair, o => function (v) { const p = o.apply(this, arguments); return Promise.resolve(p).then(a => { POL.lastAsk = a || null; return a; }); });
        if (typeof markVagonAsTamirda === 'function') markVagonAsTamirda = agmkExtend('markVagonAsTamirda', 'v3.16: 🔴 bosqich, sabab, grafik', markVagonAsTamirda, o => async function () {
            const v0 = vagonlarData.find(item => item.id === activeVagonId), was = v0 ? v0.status : null; POL.lastAsk = null;
            const r = await o.apply(this, arguments);
            try {
                const v = vagonlarData.find(item => item.id === activeVagonId); const a = POL.lastAsk;
                if (v && v.status === 'Tamirda' && was !== 'Tamirda') {
                    const cur = pprCurM(), plan = String(v.keyingi || '').slice(0, 7);
                    v.pol = v.pol || {}; v.pol.stage = 'sent'; v.pol.why = (a && a.why) || ''; v.pol.sent = { at: new Date().toISOString(), by: vtWho() };
                    if (plan && plan > cur) v.pol.from = plan;
                    const h0 = (v.history || [])[0]; if (h0 && h0.ev === 'in') { h0.stg = 1; if (v.pol.why) h0.why = v.pol.why; }
                    // Excel grafigi boʻlsa — keyingi istalgan oydan joriy oyga (izoh bilan)
                    try { const d = typeof pprDB === 'function' ? pprDB() : null; if (d) { const no = pprNo(vagonNo(v)), f = pprFind(d, no, pprAddM(cur, 1))[0]; if (f && !pprFind(d, no).some(z => z.m === cur)) { pprMove(d, no, cur, vtMonName(f.m) + 'dan koʻchirildi: nosozlik' + (v.pol.why ? ' (' + v.pol.why + ')' : '') + ', ' + fmtISO(todayISO())); pprSave(d); } } } catch (e) {}
                    saveDB(); try { openPassport(v.id); } catch (e) {} try { polRender(); } catch (e) {}
                }
            } catch (e) { console.error(e); }
            return r;
        });
        // ---------- 🟠 Navbatda / 🔵 Taʼmirda ----------
        async function vtSet(st, vid) {
            const v = vagonlarData.find(x => String(x.id) === String(vid != null ? vid : activeVagonId)); if (!v || v.status !== 'Tamirda') return;
            const S = VT_ST[st]; const iz = await uiPrompt(S.i + ' № ' + vagonNo(v) + ' — «' + S.t + '»\nIzoh (ixtiyoriy):', ''); if (iz === null || iz === undefined || iz === false) return;
            const hm = nowHM(), by = vtWho(), at = new Date().toISOString(), txt = String(iz || '').trim();
            v.pol = v.pol || {}; v.pol.stage = st; v.pol[st === 'queue' ? 'q' : 'w'] = { at: at, by: by, izoh: txt };
            v.history = v.history || []; v.history.unshift({ date: todayISO(), type: S.i + ' ' + S.t + (txt ? ' — ' + txt : '') + ' (' + hm + ')', author: by, ev: st === 'queue' ? 'q' : 'w', hm: hm, hide: 1 });
            saveDB(); try { filterVagonlar(); } catch (e) {} try { if (String(activeVagonId) === String(v.id)) openPassport(v.id); } catch (e) {} try { polRender(); } catch (e) {}
            showToast(S.i + ' № ' + vagonNo(v) + ' — ' + S.t);
        }
        function vtDone(vid) { if (vid != null && typeof polRelease === 'function') return polRelease(vid); return restoreVagonFromTamirda(); }
        // 🟢 chiqarildi: DR/KR sanasi vaqtincha shu kun (hisobot kelganda hujjatdagi sana bilan almashadi)
        if (typeof polRelease === 'function') polRelease = agmkExtend('polRelease', 'v3.16: chiqqan sana — DR/KR', polRelease, o => async function (vid) {
            const ok = await o.apply(this, arguments);
            try { if (ok) { const v = vagonlarData.find(x => String(x.id) === String(vid)), L = v && v.pol && v.pol.last; if (v && L && L.out) {
                if (L.rt === 'DR') { v.tamirSanasi = L.out; v.tamirTuri = "Depo ta'miri (DR)"; v.drAuto = true; v.tsProv = L.out; }
                else if (L.rt === 'KR') { v.kr = L.out; v.krTxt = ''; v.tsProv = L.out; }
                try { recalcVagonStatus(v); } catch (e) {} saveDB(); try { filterVagonlar(); } catch (e) {} } } } catch (e) { console.error(e); }
            return ok;
        });
        // «taʼmirda» soni — faqat 🔵
        if (typeof polInRepair === 'function') polInRepair = function () { return onlyVagons().filter(v => v.status === 'Tamirda' && vtStage(v) === 'work'); };
        // ---------- Polojeniya ----------
        if (typeof polItems === 'function') polItems = agmkExtend('polItems', 'v3.16: bosqich', polItems, o => function (D) { const G = o.apply(this, arguments); try { G.forEach(g => g.list.forEach(x => { x.stage = x.out ? 'done' : vtStageAt(x.v, D); })); } catch (e) {} return G; });
        function vtPolSum(all, today) { const n = k => all.filter(x => (x.out ? 'done' : (x.stage || 'work')) === k).length; return ['sent', 'queue', 'work'].map(k => `<span class="vt-sum" style="color:${VT_ST[k].c}">${VT_ST[k].i} ${VT_ST[k].t}: <b>${n(k)}</b></span>`).join(' · '); }
        function vtPolBtns(x) { const E = escapeHtml, id = E(String(x.v.id)), st = x.stage || 'work', b = (k, f) => `<button class="mini-btn vt-b" style="color:${VT_ST[k].c};border-color:${VT_ST[k].c};background:${VT_ST[k].bg}" onclick="${f}">${VT_ST[k].i} ${VT_ST[k].b}</button>`;
            return (st === 'sent' ? b('queue', `vtSet('queue','${id}')`) : '') + (st !== 'work' ? b('work', `vtSet('work','${id}')`) : '') + b('done', `vtDone('${id}')`); }
        function vtPolInfo(x) {
            const P = (x.v && x.v.pol) || {}, E = escapeHtml, L = [];
            if (!x.out && P.why) L.push('⚠️ Sabab: ' + E(P.why));
            if (!x.out && P.from) L.push('🗓 ' + E(vtMonName(P.from)) + ' oyi rejasidan joriy oyga koʻchirildi');
            if (!x.out && P.q) L.push('🟠 Navbatga: ' + E(polWhen(P.q.at)) + ' · ' + E(polPerson(P.q.by)) + (P.q.izoh ? ' — ' + E(P.q.izoh) : ''));
            if (!x.out && P.w) L.push('🔵 Taʼmir boshlandi: ' + E(polWhen(P.w.at)) + ' · ' + E(polPerson(P.w.by)) + (P.w.izoh ? ' — ' + E(P.w.izoh) : ''));
            return L.length ? `<div class="pol-i vt-info">${L.join('<br>')}</div>` : '';
        }
        // ---------- Pasport: rangli tugmalar ----------
        function vtPassBar(v) {
            const btn = $id('btn-mark-tamirda'); if (!btn || !v) return; const bar = btn.parentElement; if (!bar) return;
            const st = vtStage(v), P = v.pol || {}, E = escapeHtml, b = (k, f, id) => `<button ${id ? 'id="' + id + '"' : ''} class="mini-btn vt-b" style="color:${VT_ST[k].c};border-color:${VT_ST[k].c};background:${VT_ST[k].bg}" onclick="${f}">${VT_ST[k].i} ${VT_ST[k].b}</button>`;
            let h = '';
            if (!st) h = b('sent', 'markVagonAsTamirda()', 'btn-mark-tamirda') + '<button id="btn-restore-auto" class="hidden"></button>';
            else {
                h = `<div class="vt-now">${vtBadge(st)}${P.uch ? ' <small>' + E(P.uch) + (P.rt ? ', ' + E(POL_RT[P.rt] || P.rt) : '') + '</small>' : ''}${P.why ? '<div class="vt-why">Sabab: ' + E(P.why) + '</div>' : ''}${P.from ? '<div class="vt-why">🗓 ' + E(vtMonName(P.from)) + ' oyi rejasidan joriy oyga koʻchirildi</div>' : ''}</div>`
                    + '<button id="btn-mark-tamirda" class="hidden"></button>'
                    + (st === 'sent' ? b('queue', "vtSet('queue')") : '') + (st !== 'work' ? b('work', "vtSet('work')") : '') + b('done', 'vtDone()', 'btn-restore-auto');
            }
            bar.innerHTML = h; bar.classList.add('vt-bar');
            try { const ps = $id('p-holat'); if (ps && st) { ps.innerHTML = `<span style="color:${VT_ST[st].c};font-weight:700">${VT_ST[st].i} ${VT_ST[st].t}</span>`; } } catch (e) {}
        }
        if (typeof openPassport === 'function') openPassport = agmkExtend('openPassport', 'v3.16: taʼmir tugmalari', openPassport, o => function (id) { const r = o.apply(this, arguments); try { vtPassBar(vagonlarData.find(x => x.id === (id != null ? id : activeVagonId)) || vagonlarData.find(x => x.id === activeVagonId)); } catch (e) { console.error(e); } return r; });
        // 🗑 Oʻchirish — Tahrirlash oynasining pastida
        function vtDelete() { try { closeEditModal(); } catch (e) {} return deleteVagon(); }
        if (typeof openEditModal === 'function') openEditModal = agmkExtend('openEditModal', 'v3.16: oʻchirish shu yerda', openEditModal, o => function () {
            const r = o.apply(this, arguments);
            try { const m = $id('editPassportModal'), c = m && (m.querySelector('.modal-content') || m.firstElementChild); if (c && !c.querySelector('.vt-del')) c.insertAdjacentHTML('beforeend', '<div class="vt-del"><button class="mini-btn" onclick="vtDelete()">🗑 Vagonni roʻyxatdan oʻchirish</button><small>Tasdiq soʻraladi. Xato boʻlsa ↩️ Undo bilan qaytariladi.</small></div>'); } catch (e) {}
            return r;
        });
        // Pasport taʼmir tarixi: faqat taʼmirdan chiqqan (va qoʻlda kiritilgan) yozuvlar — yuborish/navbat/boshlanish polojeniyada
        if (typeof renderTamirHistory === 'function') renderTamirHistory = agmkExtend('renderTamirHistory', 'v3.16: faqat chiqqan sana', renderTamirHistory, o => function (v) {
            const r = o.apply(this, arguments);
            try { const c = $id('tamir-history-list'), H = (v && v.history) || [], items = c ? c.querySelectorAll(':scope > .history-item') : []; if (items.length === H.length) { let shown = 0; H.forEach((h, i) => { const hide = h.ev === 'in' || h.ev === 'q' || h.ev === 'w' || h.hide || (!h.ev && /Ta['ʼ’`]?mirga yuborildi/i.test(String(h.type || ''))); if (hide) items[i].style.display = 'none'; else shown++; }); if (!shown && H.length) c.insertAdjacentHTML('afterbegin', '<div class="vt-nohist" style="font-size:12px;color:#94a3b8">Taʼmirdan chiqqan yozuv hali yoʻq (joriy taʼmir bosqichlari — kunlik polojeniyada)</div>'); } } catch (e) {}
            return r;
        });
        (function () { const st = document.createElement('style'); st.textContent = `.vt-badge{display:inline-block;border:1px solid;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700;margin-left:6px}
            .vt-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start}.vt-bar .vt-now{flex-basis:100%;font-size:13px}.vt-why{font-size:12px;color:#cbd5e1;margin-top:3px}
            .vt-b{font-weight:700}.pol-v.vt-sent{border-left:4px solid #ef4444}.pol-v.vt-queue{border-left:4px solid #f97316}.pol-v.vt-work{border-left:4px solid #3b82f6}.pol-v.vt-done{border-left:4px solid #22c55e}
            .pol-v .vt-badge{font-size:11px;padding:1px 8px}.vt-sum{white-space:nowrap}.vt-info{color:#cbd5e1}
            .vt-del{margin-top:16px;padding-top:10px;border-top:1px solid rgba(239,68,68,.35);display:flex;flex-direction:column;gap:4px}.vt-del button{color:#f87171;border-color:#ef4444;background:rgba(239,68,68,.12)}.vt-del small{color:#94a3b8;font-size:11px}`; document.head.appendChild(st); })();

