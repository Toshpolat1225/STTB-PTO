        /* ===== 33-bosqich (5): 🦺 Mehnat muhofazasi — instruktaj, bilim sinovi, tibbiy ko'rik muddatlari ===== */
        // Davriylik FAQAT korxona hujjatlaridan olingan (o'ylab topilmagan):
        var MM_RULES = {
            davriy: { t: "Davriy (takroriy) yoʻl-yoʻriq", m: () => 6, src: () => "Oʻqitish Nizomi (N 00193950–61-16-006:2024), 10 b)-band: kamida 6 oyda bir marta" },
            bilim: { t: "Bilimlar sinovi", m: c => c === 'rahbar' ? 36 : 12, src: c => c === 'rahbar' ? "Oʻqitish Nizomi, 37-band: rahbar va mutaxassislar — uch yilda kamida bir marta" : c === 'topshiriq' ? "Oʻqitish Nizomi, 37-band: topshiriq beruvchi va yoʻl-yoʻriq oʻtkazuvchi xodimlar — yilda bir marta" : "Oʻqitish Nizomi, 20-band: ishchilar — kamida 12 oyda bir marta" },
            tibbiy: { t: "Tibbiy koʻrik", m: () => null, src: () => "Tashkil qilish Nizomi, 246-band: dastlabki va davriy tibbiy koʻrik. Davriyligi hujjatda koʻrsatilmagan — keyingi koʻrik sanasi qoʻlda kiritiladi." }
        };
        var MM_CAT = { ishchi: 'Ishchi', topshiriq: 'Usta / topshiriq beruvchi (ITX)', rahbar: 'Rahbar yoki mutaxassis' };
        var MM_JT = [['kirish', 'Kirish yoʻl-yoʻrigʻi'], ['birlamchi', 'Birlamchi yoʻl-yoʻriq (ish joyida)'], ['davriy', 'Davriy (takroriy) yoʻl-yoʻriq'], ['navbatdan', 'Navbatdan tashqari yoʻl-yoʻriq'], ['maqsadli', 'Maqsadli yoʻl-yoʻriq'], ['bilim', 'Bilimlar sinovi'], ['tibbiy', 'Tibbiy koʻrik']];
        var MM = { tab: 'nazorat', q: '', st: '', ty: '' };
        function mmData() { const d = kvGet('agmk_mm', null) || {}; d.recs = d.recs || {}; d.jr = d.jr || []; d.instr = d.instr || []; return d; }
        function mmSave(d) { return kvSet('agmk_mm', d); }
        function canMMEdit() { return isAdmin() || hasRole('mm'); }
        function canMMView() { return isPriv() || hasRole('mm'); }
        function mmAutoCat(item) { const l = aiNorm((item && item.lavozim) || ''); if (/usta|brigadir|master|мастер|бригадир|masterlar/.test(l)) return 'topshiriq'; if (/boshli|boshqaruvchi|direktor|muhandis|mutaxassis|ekonomist|iqtisodchi|buxgalter|inspektor|texnolog|o.?rinbosar|rahbar|nachalnik|инженер|начальник|специалист|mexanik|energetik|dispetcher|kadr|yurist/.test(l)) return 'rahbar'; return 'ishchi'; }
        function mmRec(t) { const d = mmData(); return d.recs[cleanTabel(t)] || {}; }
        function mmStat(item) {
            const t = cleanTabel(item.tabel), r = mmData().recs[t] || {}, cat = r.cat || mmAutoCat(item), d = r.d || {}, out = {};
            ['davriy', 'bilim', 'tibbiy'].forEach(k => {
                const R = MM_RULES[k], m = R.m(cat); let last = d[k] || '', next = null;
                if (k === 'davriy') last = [d.davriy, d.birlamchi].filter(Boolean).sort().pop() || '';
                if (k === 'tibbiy') next = r.tibbiyNext || null; else if (last && m) next = mmAddMonths(last, m);
                const left = next ? daysTo(next) : null;
                out[k] = { last: last, next: next, left: left, st: !last && !next ? 'no' : left === null ? 'no' : left < 0 ? 'bad' : left <= 30 ? 'warn' : 'ok' };
            });
            out.cat = cat; return out;
        }
        function mmBadge(k, s) { const lb = { davriy: 'Yoʻl-yoʻriq', bilim: 'Bilim sinovi', tibbiy: 'Tibbiy koʻrik' }[k]; const txt = s.st === 'no' ? 'kiritilmagan' : s.left < 0 ? Math.abs(s.left) + ' kun oʻtdi' : s.left === 0 ? 'bugun' : s.left + ' kun qoldi'; return `<span class="mm-b ${s.st}" title="${escapeHtml(MM_RULES[k].t)}"><b>${lb}</b>${s.next ? fmtD(s.next) : '—'}<small>${txt}</small></span>`; }
        function mmPeople() { return allXodims(); }
        function openMM(tab) { secScreen('screen-mm', '🦺 Mehnat muhofazasi'); if (tab) MM.tab = tab; openScreen('screen-mm'); mmRender(); }
        function mmTab(t) { MM.tab = t; mmRender(); }
        function mmRender() {
            const tabs = canMMView() ? [['nazorat', '📊 Nazorat'], ['jurnal', '📓 Jurnal'], ['instr', '📑 Yoʻriqnomalar'], ['docs', '📚 Hujjatlar']] : [['meniki', '👤 Mening muddatlarim'], ['instr', '📑 Yoʻriqnomalar'], ['docs', '📚 Hujjatlar']];
            if (!tabs.some(t => t[0] === MM.tab)) MM.tab = tabs[0][0];
            secTabs('screen-mm', tabs, MM.tab, 'mmTab');
            const b = secBody('screen-mm');
            if (MM.tab === 'nazorat') b.innerHTML = mmNazoratHtml();
            else if (MM.tab === 'meniki') b.innerHTML = mmMyHtml();
            else if (MM.tab === 'jurnal') b.innerHTML = mmJurnalHtml();
            else if (MM.tab === 'instr') b.innerHTML = mmInstrHtml();
            else b.innerHTML = mmDocsHtml();
        }
        function mmMyHtml() {
            const it = xodimByTabel(meTabel()); if (!it) return '<div class="xt-empty">Siz xodimlar roʻyxatida topilmadingiz.</div>';
            const s = mmStat(it);
            return `<div class="mm-card"><b>${escapeHtml(it.name)}</b><small>${escapeHtml(it.lavozim || '')} · toifa: ${escapeHtml(MM_CAT[s.cat])}</small><div class="mm-bs">${['davriy', 'bilim', 'tibbiy'].map(k => mmBadge(k, s[k])).join('')}</div></div>
                <div class="nd-tip">Muddatlar mehnat muhofazasi masʼuli kiritgan yozuvlar asosida hisoblanadi. Xato boʻlsa, masʼulga murojaat qiling.<br>${['davriy', 'bilim', 'tibbiy'].map(k => '• ' + escapeHtml(MM_RULES[k].src(s.cat))).join('<br>')}</div>`;
        }
        function mmNazoratHtml() {
            const all = mmPeople().map(r => ({ r: r, s: mmStat(r.item) }));
            const cnt = { bad: 0, warn: 0, no: 0 };
            all.forEach(x => ['davriy', 'bilim', 'tibbiy'].forEach(k => { if (MM.ty && MM.ty !== k) return; const st = x.s[k].st; if (cnt[st] !== undefined) cnt[st]++; }));
            const q = dbN(MM.q);
            let l = all.filter(x => !q || dbN([x.r.item.name, x.r.item.tabel, x.r.item.lavozim, x.r.su].join(' ')).includes(q));
            if (MM.st) l = l.filter(x => ['davriy', 'bilim', 'tibbiy'].some(k => (!MM.ty || MM.ty === k) && x.s[k].st === MM.st));
            const pr = x => Math.min(...['davriy', 'bilim', 'tibbiy'].filter(k => !MM.ty || MM.ty === k).map(k => ({ bad: 0, warn: 1, no: 2, ok: 3 })[x.s[k].st]));
            l.sort((a, c) => pr(a) - pr(c) || String(a.r.item.name).localeCompare(String(c.r.item.name)));
            return `<div class="mm-sum"><i class="bad ${MM.st === 'bad' ? 'on' : ''}" onclick="MM.st=MM.st==='bad'?'':'bad'; mmRender()"><b>${cnt.bad}</b>muddati oʻtgan</i><i class="warn ${MM.st === 'warn' ? 'on' : ''}" onclick="MM.st=MM.st==='warn'?'':'warn'; mmRender()"><b>${cnt.warn}</b>30 kun ichida</i><i class="no ${MM.st === 'no' ? 'on' : ''}" onclick="MM.st=MM.st==='no'?'':'no'; mmRender()"><b>${cnt.no}</b>kiritilmagan</i></div>
                <div class="mm-flt"><input class="search-box" placeholder="🔎 Xodim, tabel, lavozim, seh..." value="${escapeHtml(MM.q)}" oninput="MM.q=this.value; clearTimeout(MM.tm); MM.tm=setTimeout(mmRender,250)"><select onchange="MM.ty=this.value; mmRender()"><option value="">Barcha turlar</option>${['davriy', 'bilim', 'tibbiy'].map(k => `<option value="${k}" ${MM.ty === k ? 'selected' : ''}>${MM_RULES[k].t}</option>`).join('')}</select></div>
                <div class="mm-tools">${canMMEdit() ? '<button class="mini-btn" onclick="mmJrForm()">➕ Jurnalga yozuv</button>' : ''}<button class="mini-btn" onclick="mmExcel()">📊 Excel</button></div>
                <div class="mm-list">${l.slice(0, 250).map(x => `<div class="mm-row" onclick="mmPerson('${escapeHtml(cleanTabel(x.r.item.tabel))}')"><div class="mm-n"><b>${escapeHtml(x.r.item.name)}</b><small>${escapeHtml(x.r.item.lavozim || '')} · ${escapeHtml(x.r.su)}</small></div><div class="mm-bs">${['davriy', 'bilim', 'tibbiy'].filter(k => !MM.ty || MM.ty === k).map(k => mmBadge(k, x.s[k])).join('')}</div></div>`).join('')}${l.length > 250 ? `<div class="nd-tip">… yana ${l.length - 250} ta. Qidiruvdan foydalaning.</div>` : ''}${l.length ? '' : '<div class="xt-empty">Topilmadi</div>'}</div>`;
        }
        function mmPerson(t) {
            const it = xodimByTabel(t); if (!it) return; const s = mmStat(it), r = mmRec(t), d = r.d || {}, ed = canMMEdit();
            const inp = (k, v) => ed ? `<input type="date" id="mmd_${k}" value="${escapeHtml(v || '')}">` : `<b>${escapeHtml(fmtD(v))}</b>`;
            const jr = mmData().jr.filter(j => (j.tabels || []).includes(cleanTabel(t))).sort((a, c) => String(c.date).localeCompare(String(a.date))).slice(0, 20);
            mdl('mmModal', `<div class="px-h"><b>🦺 ${escapeHtml(it.name)}</b><button class="mini-btn" onclick="mdlClose('mmModal')">✕</button></div>
                <small class="mm-sub">${escapeHtml(it.lavozim || '')} · tabel ${escapeHtml(t)}</small>
                <div class="mm-f"><label>Toifa (bilim sinovi davriyligi shunga bogʻliq)</label>${ed ? `<select id="mmd_cat">${Object.keys(MM_CAT).map(k => `<option value="${k}" ${s.cat === k ? 'selected' : ''}>${MM_CAT[k]}</option>`).join('')}</select>` : `<b>${escapeHtml(MM_CAT[s.cat])}</b>`}</div>
                <div class="mm-grid2"><div class="mm-f"><label>Kirish yoʻl-yoʻrigʻi</label>${inp('kirish', d.kirish)}</div><div class="mm-f"><label>Birlamchi yoʻl-yoʻriq</label>${inp('birlamchi', d.birlamchi)}</div>
                <div class="mm-f"><label>Oxirgi davriy yoʻl-yoʻriq</label>${inp('davriy', d.davriy)}</div><div class="mm-f"><label>Oxirgi bilim sinovi</label>${inp('bilim', d.bilim)}</div>
                <div class="mm-f"><label>Oxirgi tibbiy koʻrik</label>${inp('tibbiy', d.tibbiy)}</div><div class="mm-f"><label>Keyingi tibbiy koʻrik</label>${inp('tibbiyNext', r.tibbiyNext)}</div></div>
                <div class="mm-bs">${['davriy', 'bilim', 'tibbiy'].map(k => mmBadge(k, s[k])).join('')}</div>
                <div class="nd-tip">${['davriy', 'bilim', 'tibbiy'].map(k => '• ' + escapeHtml(MM_RULES[k].src(s.cat))).join('<br>')}</div>
                ${jr.length ? `<div class="mm-jl"><b>📓 Jurnal yozuvlari</b>${jr.map(j => `<div>${escapeHtml(fmtD(j.date))} — ${escapeHtml((MM_JT.find(x => x[0] === j.type) || [0, j.type])[1])}${j.note ? ' · ' + escapeHtml(j.note) : ''}</div>`).join('')}</div>` : ''}
                ${ed ? `<button class="action-btn" style="margin-top:10px" onclick="mmPersonSave('${escapeHtml(t)}')">💾 Saqlash</button>` : ''}`);
        }
        function mmPersonSave(t) {
            if (!canMMEdit()) return; const D = mmData(), k = cleanTabel(t), r = D.recs[k] || {}; r.d = r.d || {};
            ['kirish', 'birlamchi', 'davriy', 'bilim', 'tibbiy'].forEach(f => { const v = ($id('mmd_' + f) || {}).value; if (v !== undefined) r.d[f] = v || ''; });
            r.tibbiyNext = ($id('mmd_tibbiyNext') || {}).value || ''; r.cat = ($id('mmd_cat') || {}).value || r.cat; r.upd = new Date().toISOString(); r.by = meTabel();
            D.recs[k] = r; mmSave(D); mdlClose('mmModal'); mmRender(); showToast('✅ Saqlandi');
        }
        // Jurnal
        var MMJ = { sel: [] };
        function mmJrForm() {
            if (!canMMEdit()) { alert("Jurnalga yozuvni mehnat muhofazasi masʼuli yoki admin kiritadi."); return; }
            MMJ.sel = [];
            mdl('mmJrModal', `<div class="px-h"><b>📓 Jurnalga yozuv</b><button class="mini-btn" onclick="mdlClose('mmJrModal')">✕</button></div>
                <div class="mm-f"><label>Turi</label><select id="mmj_type">${MM_JT.map(x => `<option value="${x[0]}" ${x[0] === 'davriy' ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>
                <div class="mm-f"><label>Sana</label><input type="date" id="mmj_date" value="${todayISO()}"></div>
                <div class="mm-f"><label>Xodimlar</label><div id="mmj_list" class="mm-chips"></div><div class="mm-row2"><button class="mini-btn" onclick="pickXodim('Xodim qoʻshish', it => { const t = cleanTabel(it.tabel); if (!MMJ.sel.includes(t)) MMJ.sel.push(t); mmJrChips(); })">➕ Xodim</button><button class="mini-btn" onclick="mmJrSeh()">🏭 Seh / boʻlim boʻyicha hammasi</button></div></div>
                <div class="mm-f"><label>Keyingi tibbiy koʻrik sanasi (faqat tibbiy koʻrik uchun, ixtiyoriy)</label><input type="date" id="mmj_next"></div>
                <div class="mm-f"><label>Izoh (dastur, bilet, bayonnoma №, buyruq...)</label><input id="mmj_note" placeholder="masalan: 12-son bayonnoma"></div>
                <button class="action-btn" onclick="mmJrSave()">💾 Saqlash</button>`);
            mmJrChips();
        }
        function mmJrChips() { const b = $id('mmj_list'); if (!b) return; b.innerHTML = MMJ.sel.map((t, i) => { const it = xodimByTabel(t); return `<span>${escapeHtml(it ? shortName(it.name) : t)} <b onclick="MMJ.sel.splice(${i},1); mmJrChips()">✕</b></span>`; }).join('') || '<small>Hali tanlanmagan</small>'; }
        async function mmJrSeh() {
            const sehs = Array.from(new Set(allXodims().map(r => r.su))).sort();
            const s = await uiPrompt("Seh yoki boʻlim nomini yozing (masalan: " + sehs.slice(0, 3).join(', ') + "):", ''); if (!s) return;
            const q = dbN(s); allXodims().filter(r => dbN(r.su + ' ' + (r.item.bolim || '')).includes(q)).forEach(r => { const t = cleanTabel(r.item.tabel); if (t && !MMJ.sel.includes(t)) MMJ.sel.push(t); });
            mmJrChips();
        }
        function mmJrSave() {
            const type = $id('mmj_type').value, date = $id('mmj_date').value, note = $id('mmj_note').value.trim(), next = $id('mmj_next').value;
            if (!date) { alert('Sanani kiriting.'); return; } if (!MMJ.sel.length) { alert('Kamida bitta xodim tanlang.'); return; }
            const D = mmData();
            D.jr.push({ id: uid('j'), type: type, date: date, tabels: MMJ.sel.slice(), note: note, by: authorStr(), byT: meTabel(), at: new Date().toISOString() });
            MMJ.sel.forEach(t => { const r = D.recs[t] || {}; r.d = r.d || {}; const f = { kirish: 'kirish', birlamchi: 'birlamchi', davriy: 'davriy', bilim: 'bilim', tibbiy: 'tibbiy' }[type]; if (f && (!r.d[f] || r.d[f] < date)) r.d[f] = date; if (type === 'tibbiy' && next) r.tibbiyNext = next; r.upd = new Date().toISOString(); D.recs[t] = r; });
            mmSave(D); mdlClose('mmJrModal'); MM.tab = 'jurnal'; mmRender(); showToast('✅ Jurnalga yozildi: ' + MMJ.sel.length + ' xodim');
        }
        function mmJurnalHtml() {
            const l = mmData().jr.slice().sort((a, c) => String(c.date).localeCompare(String(a.date)) || String(c.at).localeCompare(String(a.at)));
            return `<div class="mm-tools">${canMMEdit() ? '<button class="action-btn" onclick="mmJrForm()">➕ Jurnalga yozuv qoʻshish</button>' : ''}<button class="mini-btn" onclick="mmJrExcel()">📊 Excel</button></div>
                <div class="nd-tip">Yoʻl-yoʻriq turlari va jurnallar: Oʻqitish Nizomining 1-ilova (kirish yoʻl-yoʻrigʻi, 1-jurnal) va 2-ilova (ish joyidagi yoʻl-yoʻriq, 2-jurnal) shakllariga mos. Qogʻoz jurnal oʻrnini bosmaydi — kuzatish va eslatish uchun.</div>
                ${l.map(j => `<div class="mm-card"><b>${escapeHtml(fmtD(j.date))} — ${escapeHtml((MM_JT.find(x => x[0] === j.type) || [0, j.type])[1])}</b><small>${(j.tabels || []).map(t => { const it = xodimByTabel(t); return escapeHtml(it ? shortName(it.name) : t); }).join(', ')}</small>${j.note ? `<small>📝 ${escapeHtml(j.note)}</small>` : ''}<small>✍️ ${escapeHtml(j.by || '')}${canMMEdit() ? ` <u onclick="mmJrDel('${j.id}')">🗑</u>` : ''}</small></div>`).join('') || '<div class="xt-empty">Hali yozuv yoʻq</div>'}`;
        }
        async function mmJrDel(id) { if (!await uiConfirm('Yozuv oʻchirilsinmi? (xodimlar sanalari oʻzgarmaydi)')) return; const D = mmData(); D.jr = D.jr.filter(j => j.id !== id); mmSave(D); mmRender(); }
        function mmExcel() {
            const rows = [['№', 'F.I.Sh.', 'Tabel', 'Lavozim', 'Seh', 'Toifa', 'Oxirgi yoʻl-yoʻriq', 'Keyingi yoʻl-yoʻriq', 'Oxirgi bilim sinovi', 'Keyingi bilim sinovi', 'Oxirgi tibbiy koʻrik', 'Keyingi tibbiy koʻrik']];
            mmPeople().forEach((r, i) => { const s = mmStat(r.item); rows.push([i + 1, r.item.name, r.item.tabel || '', r.item.lavozim || '', r.su, MM_CAT[s.cat], fmtD(s.davriy.last), fmtD(s.davriy.next), fmtD(s.bilim.last), fmtD(s.bilim.next), fmtD(s.tibbiy.last), fmtD(s.tibbiy.next)]); });
            xlsxDl(rows, 'Mehnat muhofazasi muddatlari ' + fmtD(todayISO()));
        }
        function mmJrExcel() { const rows = [['№', 'Sana', 'Turi', 'Xodimlar', 'Izoh', 'Kiritdi']]; mmData().jr.forEach((j, i) => rows.push([i + 1, fmtD(j.date), (MM_JT.find(x => x[0] === j.type) || [0, j.type])[1], (j.tabels || []).map(t => { const it = xodimByTabel(t); return it ? it.name : t; }).join('; '), j.note || '', j.by || ''])); xlsxDl(rows, 'MM jurnali ' + fmtD(todayISO())); }
        // Yo'riqnomalar amal qilish muddati
        function mmInstrAll() { return MM_INSTR.map(x => Object.assign({ src: 'doc' }, x)).concat(mmData().instr || []); }
        function mmInstrHtml() {
            const l = mmInstrAll().map(x => Object.assign({ left: daysTo(x.to) }, x)).sort((a, c) => (a.left === null ? 9e9 : a.left) - (c.left === null ? 9e9 : c.left));
            return `<div class="nd-tip">Yoʻriqnomalar kamida 3 yilda bir marta qayta koʻrib chiqiladi (Tashkil qilish Nizomi, 6-ilova). Muddat tugashiga 90 kun qolganda ogohlantiriladi.</div>
                ${canMMEdit() ? '<div class="mm-tools"><button class="mini-btn" onclick="mmInstrAdd()">➕ Yoʻriqnoma qoʻshish</button></div>' : ''}
                ${l.map(x => `<div class="mm-card ${x.left !== null && x.left < 0 ? 'bad' : x.left !== null && x.left <= 90 ? 'warn' : ''}"><b>${escapeHtml(x.code)}</b><small>${escapeHtml(x.t)}</small><small>📅 ${escapeHtml(fmtD(x.from))} — ${escapeHtml(fmtD(x.to))} · ${x.left === null ? '' : x.left < 0 ? '⛔ muddati ' + Math.abs(x.left) + ' kun oldin tugagan' : '⏳ ' + x.left + ' kun qoldi'}</small>${x.sheets ? `<small>📄 ${x.sheets} varaq · nazorat nusxa ${escapeHtml(x.naz || '')} · ishchi nusxa ${escapeHtml(x.ish || '')}</small>` : ''}${x.src !== 'doc' && canMMEdit() ? `<small><u onclick="mmInstrDel('${x.id}')">🗑 Oʻchirish</u></small>` : ''}</div>`).join('')}`;
        }
        async function mmInstrAdd() {
            const code = await uiPrompt('Yoʻriqnoma kodi (masalan: MM 31-20-xxx-2026):', 'MM 31-20-'); if (!code) return;
            const t = await uiPrompt('Kim uchun (kasb):', ''); if (t === null) return;
            const f = await uiPrompt('Amal qilish boshlanishi (YYYY-MM-DD):', todayISO()); if (!f) return;
            const to = await uiPrompt('Amal qilish tugashi (YYYY-MM-DD):', mmAddMonths(f, 36)); if (!to) return;
            const D = mmData(); D.instr.push({ id: uid('i'), code: code.trim(), t: t.trim(), from: f.trim(), to: to.trim(), by: meTabel(), at: new Date().toISOString() }); mmSave(D); mmRender();
        }
        async function mmInstrDel(id) { if (!await uiConfirm('Oʻchirilsinmi?')) return; const D = mmData(); D.instr = D.instr.filter(x => x.id !== id); mmSave(D); mmRender(); }
        function mmDocsHtml() {
            const docs = ND_BUILTIN.filter(d => d.cat === 'mm');
            return docs.map(d => `<div class="nd-doc nd-std" onclick="gostOpen('${d.id}')"><b>${escapeHtml(d.short || d.code)}</b><span class="nd-badge cat">🔒 ichki hujjat</span><div class="p">${escapeHtml(d.title.uz)}</div><small>${escapeHtml(d.code)} · ${d.items.length} band · ${gostP(d).length} meʼyor — AI savollarga shu hujjatdan javob beradi</small></div>`).join('') +
                `<div class="inf-sec">📌 Asosiy muddatlar (hujjatlardan)</div><div class="nd-doc">• ${escapeHtml(MM_RULES.davriy.src())}<br>• ${escapeHtml(MM_RULES.bilim.src('ishchi'))}<br>• ${escapeHtml(MM_RULES.bilim.src('topshiriq'))}<br>• ${escapeHtml(MM_RULES.bilim.src('rahbar'))}<br>• Rahbar va mutaxassislarning birlamchi bilim sinovi — lavozimda ish boshlagandan bir oy ichida (36-band)<br>• Stajirovka — dastlabki 2–14 smena (11-band)<br>• Bilimlar sinovi bayonnomasi kamida 5 yil saqlanadi (39-band)<br>• ${escapeHtml(MM_RULES.tibbiy.src())}</div>`;
        }
        // Eslatmalar (kuniga bir marta)
        SEC_EV.fns.push(function mmNotify() {
            const t = meTabel(); if (!t) return; const key = 'agmk_mm_ntf_' + t, day = todayISO(); if (localStorage.getItem(key) === day) return;
            const it = xodimByTabel(t); const msgs = [];
            if (it) { const s = mmStat(it); ['davriy', 'bilim', 'tibbiy'].forEach(k => { const x = s[k]; if (x.st === 'bad') msgs.push(MM_RULES[k].t + ' muddati ' + Math.abs(x.left) + ' kun oldin oʻtgan'); else if (x.st === 'warn') msgs.push(MM_RULES[k].t + ' — ' + x.left + ' kun qoldi (' + fmtD(x.next) + ')'); }); }
            if (msgs.length) notify({ icon: '🦺', text: 'Mehnat muhofazasi: ' + msgs.join('; '), toTabel: t });
            if (canMMEdit()) { let bad = 0, warn = 0; mmPeople().forEach(r => { const s = mmStat(r.item); ['davriy', 'bilim', 'tibbiy'].forEach(k => { if (s[k].st === 'bad') bad++; else if (s[k].st === 'warn') warn++; }); }); const ins = mmInstrAll().filter(x => { const l = daysTo(x.to); return l !== null && l <= 90; }).length; if (bad || warn || ins) notify({ icon: '🦺', text: 'MM nazorati: ' + bad + ' ta muddati oʻtgan, ' + warn + ' ta 30 kun ichida' + (ins ? ', ' + ins + ' ta yoʻriqnoma muddati tugayapti' : ''), toTabel: t }); }
            try { localStorage.setItem(key, day); } catch (e) {}
        });
        // AI savollari
        function mmAnswer(q) {
            const n = aiNorm(vFix(q));
            if (!/instruktaj|инструктаж|yo.?l-?yo.?riq|bilim(lar)? sinov|imtihon|tibbiy|медосмотр|mehnat muhofaz/.test(n)) return null;
            if (!/kim|kimlar|kimning|ro.?yxat|muddati o.?t|kechik|o.?tmagan|shu oy|bu oy|keyingi oy|oy ichida|hafta|mening|менing|meni\b|qachon|holati|кто|список|просроч/.test(n)) return null;
            const type = /tibbiy|медосмотр/.test(n) ? 'tibbiy' : /bilim|imtihon/.test(n) ? 'bilim' : /instruktaj|инструктаж|yo.?l-?yo.?riq/.test(n) ? 'davriy' : null;
            const types = type ? [type] : ['davriy', 'bilim', 'tibbiy'];
            // Mening muddatlarim
            if (/mening|meni\b|o.?zimning/.test(n) || !canMMView()) {
                const it = xodimByTabel(meTabel()); if (!it) return null; const s = mmStat(it);
                return '🦺 ' + shortName(it.name) + ':\n' + types.map(k => '• ' + MM_RULES[k].t + ': ' + (s[k].next ? fmtD(s[k].next) + (s[k].left < 0 ? ' (' + Math.abs(s[k].left) + ' kun oʻtdi)' : ' (' + s[k].left + ' kun qoldi)') : 'maʼlumot kiritilmagan')).join('\n') + '\n📚 Manba: Mehnat muhofazasi boʻlimi';
            }
            // Aniq xodim
            const pp = allXodims().filter(r => { const w = dbN(r.item.name).split(' ')[0]; return w && w.length >= 4 && dbN(n).includes(w.slice(0, Math.max(4, w.length - 2))); });
            if (pp.length === 1) { const s = mmStat(pp[0].item); return '🦺 ' + pp[0].item.name + ':\n' + types.map(k => '• ' + MM_RULES[k].t + ': oxirgi ' + fmtD(s[k].last) + ', keyingi ' + fmtD(s[k].next) + (s[k].left === null ? '' : s[k].left < 0 ? ' — ' + Math.abs(s[k].left) + ' kun oʻtdi' : ' — ' + s[k].left + ' kun qoldi')).join('\n') + '\n📚 Manba: Mehnat muhofazasi boʻlimi'; }
            let win = null; if (/shu oy|bu oy|oy ichida/.test(n)) win = 31 - new Date().getDate(); if (/keyingi oy/.test(n)) win = 62 - new Date().getDate(); if (/hafta/.test(n)) win = 7;
            const bad = /muddati o.?t|kechik|o.?tmagan|просроч/.test(n);
            const res = [];
            mmPeople().forEach(r => { const s = mmStat(r.item); types.forEach(k => { const x = s[k]; if (x.left === null) return; if ((bad && x.left < 0) || (win !== null && x.left <= win) || (!bad && win === null && x.left < 0)) res.push([r.item.name, k, x]); }); });
            res.sort((a, c) => a[2].left - c[2].left);
            const title = bad || win === null ? 'Muddati oʻtganlar' : win === 7 ? 'Shu hafta muddati keladiganlar' : 'Shu oy muddati keladiganlar';
            if (!res.length) return '🦺 ' + title + ': hech kim yoʻq (kiritilgan maʼlumotlar boʻyicha).\n📚 Manba: Mehnat muhofazasi boʻlimi';
            return '🦺 ' + title + ' (' + res.length + '):\n' + res.slice(0, 15).map(x => '• ' + shortName(x[0]) + ' — ' + MM_RULES[x[1]].t.toLowerCase() + ': ' + fmtD(x[2].next) + (x[2].left < 0 ? ' (' + Math.abs(x[2].left) + ' kun oʻtdi)' : ' (' + x[2].left + ' kun)')).join('\n') + (res.length > 15 ? '\n… yana ' + (res.length - 15) + ' ta — Mehnat muhofazasi boʻlimida toʻliq' : '') + '\n📚 Manba: Mehnat muhofazasi boʻlimi';
        }
        (function () { aiStage('Mehnat muhofazasi', function (q, next) { try { const a = mmAnswer(q); if (a) return { t: a, personal: true }; } catch (e) { console.error(e); } return next(q); }); })();
        mainCard('mm', '🦺', 'Mehnat muhofazasi', 'mehnat muhofazasi instruktaj yo\'l-yo\'riq bilim sinovi tibbiy ko\'rik xavfsizlik texnikasi mm', () => openMM(), '[onclick="openSettings()"]');

