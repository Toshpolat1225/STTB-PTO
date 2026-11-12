        // v3.16.4 — 🦺 Mehnat muhofazasi: xodimning ALOHIDA kartochkasi (toʻliq ekran), hamma maʼlumot ochiq, sanalar shu yerning oʻzida kiritiladi
        //  • Pasportdagi «🦺 Mehnat muhofazasi ›», MM «Nazorat» roʻyxati va «Bilim sinovi» roʻyxatidan — shu kartochka ochiladi
        //  • Yoʻl-yoʻriqlar, tibbiy koʻrik, 7 turdagi bilim sinovi (natija qoʻshish, tarix, imzolar), 12 oylik reja, jurnal — bitta sahifada, yopiq boʻlim yoʻq
        //  • Parol tugmasi (admin): parol aynan ochiq turgan pasportdagi xodimga beriladi, oldin ismi bilan soʻraladi; xato berilgan parolni bekor qilish
        var MMK = { t: '', back: 'screen-main' };
        function mmkOpen(t) {
            const it = xodimByTabel(t); if (!it) { showToast('Xodim topilmadi'); return; }
            if (!(canMMView() || (typeof isOwnItem === 'function' && isOwnItem(it)) || canMMEdit())) { alert('Bu kartochkani mehnat muhofazasi, rahbariyat va xodimning oʻzi koʻradi.'); return; }
            MMK.t = cleanTabel(it.tabel);
            const cur = document.querySelector('.screen.active'); if (cur && cur.id !== 'screen-mmk') MMK.back = cur.id;
            try { mdlClose('mmModal'); mdlClose('mmpM'); mdlClose('mbModal'); } catch (e) {}
            secScreen('screen-mmk', '🦺 Mehnat muhofazasi kartochkasi', 'mmkBack()'); openScreen('screen-mmk'); mmkRender();
            try { const s = $id('screen-mmk'); if (s) s.scrollTop = 0; window.scrollTo(0, 0); } catch (e) {}
        }
        function mmkBack() {
            const b = MMK.back || 'screen-main'; openScreen(b);
            try { if (b === 'screen-mm') mmRender(); if (typeof mmpRefresh === 'function') mmpRefresh(); } catch (e) {}
        }
        function mmkLeftTxt(l) { return l === null || l === undefined ? 'kiritilmagan' : l < 0 ? Math.abs(l) + ' kun oʻtdi' : l === 0 ? 'bugun' : l + ' kun qoldi'; }
        function mmkSt(l, warn) { return l === null || l === undefined ? 'no' : l < 0 ? 'bad' : l <= (warn || 30) ? 'warn' : 'ok'; }
        function mmkRender() {
            const t = MMK.t, it = xodimByTabel(t), b = secBody('screen-mmk'); if (!it || !b) return;
            const E = escapeHtml, ed = canMMEdit(), s = mmStat(it), r = mmRec(t), d = r.d || {}, cat = s.cat, z = (findXodimsByTabel(t)[0] || {}).su || '';
            const dv = (k, v) => ed ? `<input type="date" class="mmk-in" id="mmk_${k}" value="${E(v || '')}">` : `<b>${v ? E(fmtD(v)) : '—'}</b>`;
            const nx = (v, l) => v ? `<b>${E(fmtD(v))}</b><small class="mmk-st ${mmkSt(l)}">${E(mmkLeftTxt(l))}</small>` : '<small class="mmk-st no">—</small>';
            const dm = MM_RULES.davriy.m(cat), dLast = [d.davriy, d.birlamchi].filter(Boolean).sort().pop() || '', dNext = dLast && dm ? mmAddMonths(dLast, dm) : null;
            const tbNext = r.tibbiyNext || '';
            // ---- bilim sinovlari (7 tur)
            const md = mbData(), pid = mbPid({ tabel: t, name: it.name }), asg = new Set(mbTypesOf(pid, md));
            const bsRows = MB_T.map(T => {
                const S = mbStat(pid, T.k, md) || {}, L = md.recs.filter(x => x.pid === pid && x.type === T.k && !x.del).sort((a, c) => String(c.date).localeCompare(String(a.date)));
                const on = asg.has(T.k), st = S.next ? (S.left < 0 ? 'bad' : S.left <= 15 ? 'warn' : 'ok') : 'no';
                const hist = L.length ? L.map(x => { const sg = x.sig || {}; return `<div class="mmk-h"><b>${E(fmtD(x.date))}</b> ${x.grade === 'q' ? '✅ qoniqarli' : '❌ qoniqarsiz' + (x.retake ? ' · qayta: ' + E(fmtD(x.retake)) : '')}${x.no ? ' · bayonnoma №' + E(x.no) : ''}${x.ct ? ' · oluvchi: ' + E(x.ct) : ''} <small>${sg.ex ? '✍️ topshiruvchi' : '⏳ topshiruvchi imzosi'} · ${sg.ct ? '✍️ oluvchi' : '⏳ oluvchi imzosi'}</small></div>`; }).join('') : '<div class="mmk-h"><small>Natija kiritilmagan</small></div>';
                const add = ed ? `<div class="mmk-add"><input type="date" id="mmkb_d_${T.k}" value="${todayISO()}"><select id="mmkb_g_${T.k}"><option value="q">✅ Qoniqarli</option><option value="n">❌ Qoniqarsiz</option></select><input id="mmkb_n_${T.k}" placeholder="Bayonnoma №"><button class="mini-btn" onclick="mmkAddBs('${T.k}')">➕ Natija</button></div>` : '';
                return `<div class="mmk-bs ${on ? '' : 'off'}"><div class="mmk-bh">${ed ? `<label class="mmk-chk"><input type="checkbox" ${on ? 'checked' : ''} onchange="mmkAsg('${T.k}', this.checked)"> </label>` : ''}<div class="mmk-bt"><b>${E(T.t)}</b><small>${T.m === 36 ? 'har 3 yilda' : 'har yili'}${on ? '' : ' · biriktirilmagan'}</small></div><div class="mmk-bn">${S.next ? `<b>${E(fmtD(S.next))}</b><small class="mmk-st ${st}">${E(mmkLeftTxt(S.left))}${S.why === 'retake' ? ' · qayta topshirish' : S.why === 'plan' ? ' · reja' : ''}</small>` : '<small class="mmk-st no">muddat yoʻq</small>'}</div></div>${hist}${add}</div>`;
            }).join('');
            // ---- jurnal
            const jr = mmData().jr.filter(j => (j.tabels || []).includes(t)).sort((a, c) => String(c.date).localeCompare(String(a.date)));
            b.innerHTML = `<div class="mmk-card mmk-top"><div class="mmk-ic">🦺</div><div><b>${E(it.name)}</b><small>${E(it.lavozim || '')}</small><small>Tabel ${E(t)}${z ? ' · ' + E(z) : ''}</small></div></div>
                <div class="mmk-card"><div class="mmk-f"><label>Toifa (bilim sinovi va yoʻl-yoʻriq davriyligi shunga bogʻliq)</label>${ed ? `<select id="mmk_cat" onchange="mmkSaveA(true)">${Object.keys(MM_CAT).map(k => `<option value="${k}" ${cat === k ? 'selected' : ''}>${E(MM_CAT[k])}</option>`).join('')}</select>` : `<b>${E(MM_CAT[cat] || '')}</b>`}</div>
                <div class="mm-bs">${['davriy', 'bilim', 'tibbiy'].map(k => mmBadge(k, s[k])).join('')}</div></div>
                <div class="mmk-sec">📋 Yoʻl-yoʻriqlar va tibbiy koʻrik</div>
                <div class="mmk-card"><table class="mmk-t"><tr><th>Turi</th><th>Oʻtkazilgan sana</th><th>Keyingi muddat</th></tr>
                    <tr><td>Kirish yoʻl-yoʻrigʻi</td><td>${dv('kirish', d.kirish)}</td><td><small>bir marta</small></td></tr>
                    <tr><td>Birlamchi yoʻl-yoʻriq</td><td>${dv('birlamchi', d.birlamchi)}</td><td><small>bir marta</small></td></tr>
                    <tr><td>Davriy (takroriy) yoʻl-yoʻriq</td><td>${dv('davriy', d.davriy)}</td><td>${nx(dNext, dNext ? daysTo(dNext) : null)}</td></tr>
                    <tr><td>Bilim sinovi (umumiy)</td><td>${dv('bilim', d.bilim)}</td><td>${nx(s.bilim.next, s.bilim.left)}</td></tr>
                    <tr><td>Tibbiy koʻrik</td><td>${dv('tibbiy', d.tibbiy)}</td><td>${ed ? `<input type="date" class="mmk-in" id="mmk_tibbiyNext" value="${E(tbNext)}">` : nx(tbNext, tbNext ? daysTo(tbNext) : null)}</td></tr></table>
                    ${ed ? '<button class="action-btn" onclick="mmkSaveA()">💾 Sanalarni saqlash</button>' : ''}
                    <div class="nd-tip">${['davriy', 'bilim', 'tibbiy'].map(k => '• ' + E(MM_RULES[k].src(cat))).join('<br>')}</div></div>
                <div class="mmk-sec">🎓 Bilim sinovlari (${MB_T.length} tur)</div>
                <div class="mmk-card">${bsRows}${ed ? '<div class="nd-tip">Natija saqlangach topshiruvchi va imtihon oluvchiga imzoga boradi. ☑ — shu xodimga biriktirilgan sinov turlari.</div>' : ''}</div>
                <div class="mmk-sec">📅 12 oylik reja va tarix</div>
                <div class="mmk-card" id="mmkPlan"></div>
                <div class="mmk-sec">📓 Jurnal yozuvlari (${jr.length})</div>
                <div class="mmk-card">${jr.length ? jr.map(j => `<div class="mmk-h"><b>${E(fmtD(j.date))}</b> — ${E((MM_JT.find(x => x[0] === j.type) || [0, j.type])[1])}${j.note ? ' · ' + E(j.note) : ''}${j.by ? ' <small>· ' + E(j.by) + '</small>' : ''}</div>`).join('') : '<div class="mmk-h"><small>Yozuv yoʻq</small></div>'}
                    ${ed ? `<button class="mini-btn" onclick="mmJrForm(); MMJ.sel=['${E(t)}']; mmJrChips()">➕ Jurnalga yozuv</button>` : ''}</div>`;
            try { const P = $id('mmkPlan'), w = document.createElement('div'); w.innerHTML = mmpHtml(it); w.querySelectorAll('.mmp-cards, .mmp-acts, .mmp-h').forEach(x => x.remove()); w.querySelectorAll('details').forEach(x => x.open = true); w.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); P.appendChild(w); } catch (e) { console.error(e); }
        }
        function mmkSaveA(quiet) {
            if (!canMMEdit()) return; const t = MMK.t, D = mmData(), r = D.recs[t] || {}; r.d = r.d || {};
            ['kirish', 'birlamchi', 'davriy', 'bilim', 'tibbiy'].forEach(f => { const el = $id('mmk_' + f); if (el) r.d[f] = el.value || ''; });
            const tn = $id('mmk_tibbiyNext'); if (tn) r.tibbiyNext = tn.value || '';
            const c = $id('mmk_cat'); if (c) r.cat = c.value || r.cat;
            r.upd = new Date().toISOString(); r.by = meTabel(); D.recs[t] = r; mmSave(D);
            mmkRender(); if (!quiet) showToast('✅ Sanalar saqlandi');
        }
        function mmkAsg(k, on) {
            if (!canMMEdit()) return; const t = MMK.t, it = xodimByTabel(t), d = mbData(), pid = mbPid({ tabel: t, name: it.name });
            const cur = new Set(d.asg[pid] || mbTypesOf(pid, d)); if (on) cur.add(k); else cur.delete(k);
            d.asg[pid] = MB_T.map(x => x.k).filter(x => cur.has(x)); mbSave(d); mmkRender();
        }
        function mmkAddBs(k) {
            if (!canMMEdit()) return; const t = MMK.t, it = xodimByTabel(t); if (!it) return;
            const date = ($id('mmkb_d_' + k) || {}).value, g = ($id('mmkb_g_' + k) || {}).value || 'q', no = (($id('mmkb_n_' + k) || {}).value || '').trim();
            if (!date) { alert('Sanani kiriting.'); return; }
            const d = mbData(), pid = mbPid({ tabel: t, name: it.name }), now = new Date().toISOString();
            const rec = { id: uid('bs_'), pid: pid, type: k, date: date, grade: g, retake: g === 'n' ? mmAddMonths(date, 1) : '', no: no, note: '', ct: (currentUser && currentUser.name) || '', ctT: meTabel(), by: authorStr(), byT: meTabel(), at: now, sig: {}, corr: [], src: 'app' };
            d.recs.push(rec); const a = new Set(d.asg[pid] || mbTypesOf(pid, d)); a.add(k); d.asg[pid] = MB_T.map(x => x.k).filter(x => a.has(x));
            d.log.push({ at: now, by: rec.by, a: 'Natija: ' + it.name + ' — ' + mbT(k).s + ' ' + (g === 'q' ? 'qoniqarli' : 'qoniqarsiz') }); mbSave(d);
            try { notify({ icon: '🎓', text: 'Bilim sinovi natijasi (' + mbT(k).s + ', ' + fmtD(date) + '): ' + (g === 'q' ? 'QONIQARLI' : 'QONIQARSIZ — qayta topshirish ' + fmtD(rec.retake) + ' gacha') + '. Iltimos, imzolang: Mehnat muhofazasi → 🎓 Mening sinovlarim.', toTabel: t }); } catch (e) {}
            mmkRender(); showToast('✅ Natija saqlandi — imzoga yuborildi');
        }
        // Kirish nuqtalari: pasport kartasi, MM roʻyxati, bilim sinovi roʻyxati — hammasi alohida kartochkaga
        if (typeof mmpOpen === 'function') mmpOpen = function () { const it = getActiveItem(); if (it) mmkOpen(it.tabel); };
        if (typeof mmPerson === 'function') mmPerson = agmkExtend('mmPerson', 'v3.16.4: alohida MM kartochkasi', mmPerson, o => function (t) { if (xodimByTabel(t)) return mmkOpen(t); return o.apply(this, arguments); });
        if (typeof mbOpen === 'function') mbOpen = agmkExtend('mbOpen', 'v3.16.4: alohida MM kartochkasi', mbOpen, o => function (pid) { if (/^t:/.test(String(pid || '')) && xodimByTabel(String(pid).slice(2))) return mmkOpen(String(pid).slice(2)); return o.apply(this, arguments); });
        if (typeof mmJrSave === 'function') mmJrSave = agmkExtend('mmJrSave', 'v3.16.4: kartochka yangilanadi', mmJrSave, o => function () { const r = o.apply(this, arguments); try { const s = $id('screen-mmk'); if (s && s.classList.contains('active')) mmkRender(); } catch (e) {} return r; });
        if (typeof mbSign === 'function') mbSign = agmkExtend('mbSign', 'v3.16.4: kartochka yangilanadi', mbSign, o => async function () { const r = await o.apply(this, arguments); try { const s = $id('screen-mmk'); if (s && s.classList.contains('active')) mmkRender(); } catch (e) {} return r; });
        // Pasportdagi karta matni: «bosing — alohida kartochka»
        if (typeof mmpRefresh === 'function') mmpRefresh = agmkExtend('mmpRefresh', 'v3.16.4: MM kartochka belgisi', mmpRefresh, o => function () { const r = o.apply(this, arguments); try { const c = $id('mmpCardBtn'); if (c && !c.querySelector('.mmk-go')) { const s = c.querySelector('small'); if (s) s.insertAdjacentHTML('afterend', '<small class="mmk-go">Alohida kartochka · sanalarni kiritish</small>'); } } catch (e) {} return r; });
        // ---- 🔑 Parol tugmasi: faqat ochiq pasportdagi xodimga, ismi bilan tasdiqlab
        function kirIssueSafe() {
            const it = getActiveItem(); if (!it || !cleanTabel(it.tabel)) { alert('Xodim aniqlanmadi.'); return; }
            uiConfirm('🔑 Yangi kirish paroli berilsinmi?\n\nTabel ' + cleanTabel(it.tabel) + ' — ' + it.name + '\n\nEski paroli ishlamay qoladi.').then(ok => { if (ok) kirIssue(it.tabel); });
        }
        if (typeof openItemPasport === 'function') openItemPasport = agmkExtend('openItemPasport', 'v3.16.4: parol tugmasi — ochiq pasportdagi xodim', openItemPasport, o => function () {
            const r = o.apply(this, arguments);
            try { const b = $id('kirIssueBtn'), it = getActiveItem(); if (b) { b.onclick = kirIssueSafe; b.textContent = '🔑 Yangi kirish paroli berish (admin)' + (it ? ' — ' + shortName(it.name) : ''); } } catch (e) {}
            return r;
        });
        function kirUndo(t) {
            if (!isAdminReal()) return; t = cleanTabel(t); const o = kirOvr(); if (!o[t]) { showToast('Bu tabelda berilgan yangi parol yoʻq'); return; }
            uiConfirm('↩️ Tabel ' + t + ' uchun berilgan yangi parol bekor qilinsinmi?\nXodimning avvalgi (boshlangʻich) paroli qaytadi.').then(ok => { if (!ok) return; delete o[t]; kvSet(KIR.ovrKey, o); try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; } catch (e) {} try { audLog && audLog('parol', 'Yangi parol bekor qilindi: tabel ' + t); } catch (e) {} mdlClose('kirCode'); showToast('↩️ Bekor qilindi'); });
        }
        if (typeof uiAlertCode === 'function') uiAlertCode = agmkExtend('uiAlertCode', 'v3.16.4: bekor qilish tugmasi', uiAlertCode, o => function (t) {
            const p = o.apply(this, arguments);
            try { const m = $id('kirCode'), bt = m && m.querySelector('.pk-btns'); if (bt && !bt.querySelector('.kir-undo')) bt.insertAdjacentHTML('afterbegin', `<button class="kir-undo" onclick="kirUndo('${escapeHtml(cleanTabel(t))}')">↩️ Xato — bekor qilish</button>`); } catch (e) {}
            return p;
        });
        // 07.10.2026: tugma xatosi tufayli tabel 1994 ga berib yuborilgan parol — bir marta bekor qilinadi
        (function () { try { if (localStorage.getItem('agmk_kirfix_1994')) return; const o = kirOvr(), x = o['1994']; if (x && String(x.at || '').slice(0, 10) === '2026-10-07') { delete o['1994']; kvSet(KIR.ovrKey, o); } localStorage.setItem('agmk_kirfix_1994', '1'); } catch (e) {} })();
        (function () { const st = document.createElement('style'); st.textContent = `.mmk-card{background:rgba(15,23,42,.82);border:1px solid #334155;border-radius:14px;padding:12px;margin:8px 0;color:#e2e8f0}
            .mmk-top{display:flex;gap:12px;align-items:center}.mmk-top b{display:block;font-size:17px}.mmk-top small{display:block;color:#94a3b8}.mmk-ic{font-size:34px}
            .mmk-sec{margin:16px 2px 4px;font-weight:700;color:#7dd3fc;font-size:15px}.mmk-f label{display:block;font-size:12px;color:#94a3b8;margin-bottom:4px}.mmk-f select{width:100%;padding:8px;border-radius:8px;background:#0f172a;color:#e2e8f0;border:1px solid #475569}
            .mmk-t{width:100%;border-collapse:collapse;font-size:13px}.mmk-t th{text-align:left;color:#94a3b8;font-weight:600;padding:4px}.mmk-t td{padding:6px 4px;border-top:1px solid #1e293b;vertical-align:middle}.mmk-t td small{display:block}
            .mmk-in,.mmk-add input,.mmk-add select{background:#0f172a;color:#e2e8f0;border:1px solid #475569;border-radius:8px;padding:6px;max-width:150px}
            .mmk-st{font-size:11.5px}.mmk-st.bad{color:#f87171}.mmk-st.warn{color:#fbbf24}.mmk-st.ok{color:#4ade80}.mmk-st.no{color:#94a3b8}
            .mmk-bs{border-top:1px solid #1e293b;padding:10px 0}.mmk-bs:first-child{border-top:none}.mmk-bs.off{opacity:.62}.mmk-bh{display:flex;gap:8px;align-items:flex-start}.mmk-bt{flex:1}.mmk-bt b{display:block;font-size:13.5px}.mmk-bt small{color:#94a3b8}.mmk-bn{text-align:right}.mmk-bn b{display:block}
            .mmk-chk input{width:20px;height:20px;margin-top:2px}.mmk-h{font-size:12.5px;padding:3px 0 3px 28px;color:#cbd5e1}.mmk-h small{color:#94a3b8}.mmk-add{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0 28px}.mmk-go{display:block;color:#7dd3fc!important;font-size:11.5px}
            .kir-undo{background:#334155;color:#fde68a;border:none;border-radius:10px;padding:10px 12px;margin-right:8px}`; document.head.appendChild(st); })();
