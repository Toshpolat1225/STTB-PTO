        /* ===== 33-bosqich (6): 📦 MTTB — zayavkalar, kelgan zapchastlar, ombor, berish va qabul qilish ===== */
        var MT = { tab: 'bosh', q: '', rep: 'kun' };
        function mtData() { const d = kvGet('agmk_mttb', null) || {}; d.zay = d.zay || []; d.kir = d.kir || []; d.ber = d.ber || []; d.seq = d.seq || 0; return d; }
        function mtSave(d) { return kvSet('agmk_mttb', d); }
        function canMT() { return isAdmin() || hasRole('mttb'); }
        function mtKey(n) { return dbN(n).replace(/\s+/g, ' ').trim(); }
        function mtNum(x) { const v = parseFloat(String(x).replace(',', '.')); return isNaN(v) ? 0 : v; }
        function mtFmtQ(v) { return String(Math.round(v * 1000) / 1000).replace('.', ','); }
        var MT_ST = { yangi: ['🆕', 'Yangi'], qisman: ['🟡', 'Qisman keldi'], keldi: ['✅', 'Toʻliq keldi'], yopildi: ['⚪', 'Yopildi'] };
        function mtZStatus(z) { if (z.closed) return 'yopildi'; const all = z.items.every(i => mtNum(i.got) >= mtNum(i.q)), any = z.items.some(i => mtNum(i.got) > 0); return all ? 'keldi' : any ? 'qisman' : 'yangi'; }
        function mtStock() {
            const d = mtData(), m = {};
            const add = (n, u, q) => { const k = mtKey(n); if (!k) return; m[k] = m[k] || { n: n, u: u || '', in: 0, out: 0 }; m[k].in += q > 0 ? q : 0; m[k].out += q < 0 ? -q : 0; if (!m[k].u && u) m[k].u = u; };
            d.kir.forEach(k => k.items.forEach((i, n) => add(i.n, i.u, mtNum(k.acc && k.acc.items && k.acc.items[n] ? k.acc.items[n].got : i.q)))); // qabul qilingan bo'lsa — qabul qilingan soni
            d.ber.forEach(b => b.items.forEach(i => add(i.n, i.u, -mtNum(i.q))));
            return Object.values(m).map(x => Object.assign(x, { left: x.in - x.out })).sort((a, b) => a.n.localeCompare(b.n));
        }
        function mtNames() { const s = new Set(); try { SP_SETS.forEach(st => (SP_DATA[st.id] || []).forEach(x => s.add(x.n))); } catch (e) {} mtStock().forEach(x => s.add(x.n)); mtData().zay.forEach(z => z.items.forEach(i => s.add(i.n))); return Array.from(s).sort(); }
        function openMTTB(tab) { secScreen('screen-mttb', '📦 MTTB — Moddiy-texnik taʼminot'); if (tab) MT.tab = tab; openScreen('screen-mttb'); mtRender(); }
        function mtTab(t) { MT.tab = t; mtRender(); }
        function mtRender() {
            secTabs('screen-mttb', [['bosh', '🏠 Umumiy'], ['zay', '📝 Zayavkalar'], ['kir', '📥 Kelganlar'], ['qab', '✅ Qabul qilinganlar'], ['ber', '📤 Berilganlar'], ['ombor', '🏬 Ombor'], ['hisobot', '📊 Hisobot']], MT.tab, 'mtTab');
            const b = secBody('screen-mttb');
            b.innerHTML = ({ bosh: mtBoshHtml, zay: mtZayHtml, kir: mtKirHtml, qab: mtQabHtml, ber: mtBerHtml, ombor: mtOmborHtml, hisobot: mtRepHtml })[MT.tab]();
            let dl = $id('mtNamesDL'); if (!dl) { dl = document.createElement('datalist'); dl.id = 'mtNamesDL'; document.body.appendChild(dl); } dl.innerHTML = mtNames().slice(0, 600).map(n => `<option value="${escapeHtml(n)}">`).join('');
        }
        function mtBoshHtml() {
            const d = mtData(), me = meTabel();
            const open = d.zay.filter(z => ['yangi', 'qisman'].includes(mtZStatus(z)));
            const mine = d.zay.filter(z => z.by && z.by.t === me && mtZStatus(z) !== 'yopildi');
            const toMe = d.ber.filter(b => b.to && b.to.t === me && !b.acc);
            const today = todayISO(), kToday = d.kir.filter(k => locISO(k.at) === today), kWait = d.kir.filter(k => !k.acc);
            return `<div class="mm-sum"><i class="warn" onclick="mtTab('zay')"><b>${open.length}</b>kutilayotgan zayavka</i><i class="ok" onclick="mtTab('kir')"><b>${kToday.length}</b>bugun keldi</i><i class="bad" onclick="mtTab('kir')"><b>${kWait.length}</b>qabul qilinmagan</i><i class="bad" onclick="mtTab('ber')"><b>${toMe.length}</b>qabul qilishim kerak</i></div>
                <div class="mm-tools"><button class="action-btn" onclick="mtZForm()">📝 Yangi zayavka</button>${mtCanSend() && !canMT() ? '<button class="action-btn alt" onclick="mtKForm()">📥 Kelganini qayd qilish</button>' : ''}${canMT() ? '<button class="action-btn alt" onclick="mtKForm()">📥 Kelganini qayd qilish</button><button class="action-btn alt" onclick="mtBForm()">📤 Ombordan berish</button>' : ''}</div>
                ${toMe.length ? `<div class="inf-sec">📤 Sizga berilgan — qabul qiling</div>` + toMe.map(mtBerCard).join('') : ''}
                <div class="inf-sec">📝 Mening zayavkalarim</div>${mine.map(mtZCard).join('') || '<div class="xt-empty">Faol zayavka yoʻq</div>'}
                <div class="nd-tip">Ishlash tartibi: 1) Xodim zayavka beradi. 2) Zapchast kelganda MTTB xodimi yoki omborchi «📥 Kelganini qayd qilish» orqali kiritadi — zayavka egasiga va rahbarga darhol xabar boradi. 3) Ombordan berilganda «📤 Berish» qayd qilinadi, oluvchi «✅ Qabul qildim» deb tasdiqlaydi. Rollarni admin Parametrlar → 👥 Rollar boʻlimida beradi.</div>`;
        }
        function mtZCard(z) {
            const st = mtZStatus(z), s = MT_ST[st], late = z.due && st !== 'keldi' && st !== 'yopildi' && daysTo(z.due) < 0;
            return `<div class="mm-card ${late ? 'bad' : st === 'keldi' ? 'ok' : ''}" onclick="mtZView('${z.id}')"><b>№${z.no} · ${s[0]} ${s[1]}${late ? ' · ⛔ kechikmoqda' : ''}</b><small>${escapeHtml(fmtD(z.at))} · ${escapeHtml(z.by ? z.by.n : '')}${z.unit ? ' · ' + escapeHtml(z.unit) : ''}${z.due ? ' · kerak: ' + escapeHtml(fmtD(z.due)) : ''}</small><small>${z.items.map(i => escapeHtml(i.n) + ' — ' + mtFmtQ(mtNum(i.got)) + '/' + escapeHtml(String(i.q)) + ' ' + escapeHtml(i.u || '')).join('; ')}</small></div>`;
        }
        function mtZayHtml() {
            const d = mtData(), q = dbN(MT.q);
            const l = d.zay.slice().reverse().filter(z => !q || dbN(['№' + z.no, z.unit, z.note, z.by && z.by.n].concat(z.items.map(i => i.n)).join(' ')).includes(q));
            return `<div class="mm-flt"><input class="search-box" placeholder="🔎 № , zapchast, vagon, xodim..." value="${escapeHtml(MT.q)}" oninput="MT.q=this.value; clearTimeout(MT.tm); MT.tm=setTimeout(mtRender,250)"></div><div class="mm-tools"><button class="action-btn" onclick="mtZForm()">📝 Yangi zayavka</button><button class="mini-btn" onclick="mtExcel('zay')">📊 Excel</button></div>` + (l.map(mtZCard).join('') || '<div class="xt-empty">Zayavka yoʻq</div>');
        }
        // Qatorli forma (nomi, miqdori, birligi[, narxi])
        function mtRowsHtml(rows, price) { return rows.map((r, i) => `<div class="mt-r"><input list="mtNamesDL" placeholder="Nomi" value="${escapeHtml(r.n || '')}" data-f="n" data-i="${i}"><input placeholder="Soni" inputmode="decimal" value="${escapeHtml(String(r.q || ''))}" data-f="q" data-i="${i}"><input placeholder="Birlik" value="${escapeHtml(r.u || 'dona')}" data-f="u" data-i="${i}">${price ? `<input placeholder="Narxi (soʻm, 1 birlik)" inputmode="decimal" value="${escapeHtml(String(r.p || ''))}" data-f="p" data-i="${i}">` : ''}<b onclick="MTF.rows.splice(${i},1); mtRowsDraw()">✕</b></div>`).join(''); }
        var MTF = { rows: [], price: false };
        function mtRowsRead() { document.querySelectorAll('#mtRows [data-f]').forEach(el => { const i = +el.dataset.i; if (MTF.rows[i]) MTF.rows[i][el.dataset.f] = el.value; }); }
        function mtRowsDraw() { const b = $id('mtRows'); if (b) b.innerHTML = mtRowsHtml(MTF.rows, MTF.price); }
        function mtRowAdd() { mtRowsRead(); MTF.rows.push({ n: '', q: '', u: 'dona' }); mtRowsDraw(); }
        function mtZForm(pre) {
            pre = pre || {}; MTF.rows = (pre.items || [{ n: '', q: '', u: 'dona' }]).map(x => Object.assign({}, x)); MTF.price = false;
            mdl('mtModal', `<div class="px-h"><b>📝 Yangi zayavka</b><button class="mini-btn" onclick="mdlClose('mtModal')">✕</button></div>
                <div class="mm-f"><label>Nima uchun (vagon / texnika / ish) — ixtiyoriy</label><input id="mtz_unit" value="${escapeHtml(pre.unit || '')}" placeholder="masalan: 8121 vagon KR"></div>
                <div class="mm-f"><label>Qachongacha kerak — ixtiyoriy</label><input type="date" id="mtz_due" value="${escapeHtml(pre.due || '')}"></div>
                <div class="mm-f"><label>Zapchast va materiallar</label><div id="mtRows"></div><button class="mini-btn" onclick="mtRowAdd()">➕ Qator</button></div>
                <div class="mm-f"><label>Izoh</label><input id="mtz_note" value="${escapeHtml(pre.note || '')}"></div>
                <button class="action-btn" onclick="mtZSave()">💾 Zayavkani saqlash</button>`, true);
            mtRowsDraw();
        }
        function mtCleanRows() { mtRowsRead(); return MTF.rows.map(r => ({ n: String(r.n || '').trim(), q: String(r.q || '').trim(), u: String(r.u || '').trim(), p: r.p !== undefined ? String(r.p).trim() : undefined })).filter(r => r.n && mtNum(r.q) > 0); }
        function mtZSave() {
            const items = mtCleanRows(); if (!items.length) { alert('Kamida bitta zapchast va uning sonini kiriting.'); return; }
            const d = mtData(); d.seq = Math.max(d.seq || 0, ...d.zay.map(z => z.no || 0)) + 1;
            const z = { id: uid('z'), no: d.seq, at: new Date().toISOString(), by: { t: meTabel(), n: (currentUser && currentUser.name) || '' }, unit: $id('mtz_unit').value.trim(), due: $id('mtz_due').value, note: $id('mtz_note').value.trim(), items: items.map(i => ({ n: i.n, q: i.q, u: i.u, got: 0 })) };
            d.zay.push(z); mtSave(d); mdlClose('mtModal'); MT.tab = 'zay'; mtRender(); showToast('✅ Zayavka №' + z.no + ' saqlandi');
            try { notify({ icon: '📝', text: 'Yangi zayavka №' + z.no + ' (' + z.by.n + '): ' + z.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', '), toAll: false }); } catch (e) {}
        }
        function mtZView(id) {
            const d = mtData(), z = d.zay.find(x => x.id === id); if (!z) return; const st = MT_ST[mtZStatus(z)];
            const ks = d.kir.filter(k => k.zid === id);
            mdl('mtModal', `<div class="px-h"><b>📝 Zayavka №${z.no}</b><button class="mini-btn" onclick="mdlClose('mtModal')">✕</button></div>
                <small class="mm-sub">${st[0]} ${st[1]} · ${escapeHtml(fmtDT(z.at))} · ${escapeHtml(z.by ? z.by.n : '')}${z.unit ? ' · ' + escapeHtml(z.unit) : ''}${z.due ? ' · kerak: ' + escapeHtml(fmtD(z.due)) : ''}</small>
                <div class="gt-scroll"><table class="mt-t"><tr><th>Nomi</th><th>Soʻralgan</th><th>Keldi</th><th>Qoldi</th></tr>${z.items.map(i => `<tr><td>${escapeHtml(i.n)}</td><td>${escapeHtml(String(i.q))} ${escapeHtml(i.u || '')}</td><td>${mtFmtQ(mtNum(i.got))}</td><td>${mtFmtQ(Math.max(0, mtNum(i.q) - mtNum(i.got)))}</td></tr>`).join('')}</table></div>
                ${z.note ? `<div class="nd-tip">📝 ${escapeHtml(z.note)}</div>` : ''}
                ${ks.length ? `<div class="mm-jl"><b>📥 Kelishlar</b>${ks.map(k => `<div>${escapeHtml(fmtDT(k.at))} — ${k.items.map(i => escapeHtml(i.n) + ' ' + escapeHtml(String(i.q))).join(', ')}${k.doc ? ' · ' + escapeHtml(k.doc) : ''}</div>`).join('')}</div>` : ''}
                <div class="alb-btns">${canMT() && mtZStatus(z) !== 'yopildi' ? `<button class="mini-btn" onclick="mtKForm('${z.id}')">📥 Kelganini qayd qilish</button>` : ''}<button class="mini-btn" onclick="mtZPdf('${z.id}')">📄 PDF</button>${(canMT() || (z.by && z.by.t === meTabel())) && mtZStatus(z) !== 'yopildi' ? `<button class="mini-btn" onclick="mtZClose('${z.id}')">⚪ Yopish</button>` : ''}</div>`, true);
        }
        async function mtZClose(id) { if (!await uiConfirm('Zayavka yopilsinmi (boshqa kutilmaydi)?')) return; const d = mtData(), z = d.zay.find(x => x.id === id); if (!z) return; z.closed = new Date().toISOString(); z.upd = z.closed; mtSave(d); mdlClose('mtModal'); mtRender(); }
        function mtZPdf(id) {
            const z = mtData().zay.find(x => x.id === id); if (!z) return;
            const html = `<div class="a-approve">“TASDIQLAYMAN”<br>______________________<br>______________ ____________<br>«____» ______________ ${new Date().getFullYear()}-y.</div><div class="a-head"><span>Olmaliq sh.</span><span>${fmtD(z.at)}-y.</span></div><div class="a-title">ZAYAVKA №${z.no}</div>${z.unit ? `<p class="ni">Maqsad: ${escapeHtml(z.unit)}.</p>` : ''}${z.due ? `<p class="ni">Kerakli muddat: ${escapeHtml(fmtD(z.due))}.</p>` : ''}<table><tr><th>№</th><th>Nomi</th><th>Birligi</th><th>Soni</th></tr>${z.items.map((i, k) => `<tr><td>${k + 1}</td><td>${escapeHtml(i.n)}</td><td>${escapeHtml(i.u || '')}</td><td>${escapeHtml(String(i.q))}</td></tr>`).join('')}</table>${z.note ? `<p class="ni">Izoh: ${escapeHtml(z.note)}</p>` : ''}<table class="a-sign"><tr><td class="l">Tuzuvchi</td><td class="m"></td><td class="r">${escapeHtml(z.by ? ppShort(z.by.n, 'uz') : '')}</td></tr></table>`;
            pdfFromHtml(html, 'Zayavka_' + z.no + '_' + todayISO() + '.pdf');
        }
        // Kelgan zapchast (kirim)
        function mtKForm(zid) {
            if (!mtCanSend()) { alert('Kelgan zapchastni rahbariyat, MTTB xodimi yoki omborchi kiritadi (rolni admin beradi).'); return; }
            const d = mtData(), z = zid ? d.zay.find(x => x.id === zid) : null; if (!$id('mtFiles')) MT3.files = []; else mtFilesRead();
            MTF.price = true; MTF.rows = z ? z.items.filter(i => mtNum(i.q) - mtNum(i.got) > 0).map(i => ({ n: i.n, q: mtFmtQ(mtNum(i.q) - mtNum(i.got)), u: i.u })) : [{ n: '', q: '', u: 'dona' }];
            const open = d.zay.filter(x => ['yangi', 'qisman'].includes(mtZStatus(x)));
            mdl('mtModal', `<div class="px-h"><b>📥 Kelgan zapchastni qayd qilish</b><button class="mini-btn" onclick="mdlClose('mtModal')">✕</button></div>
                <div class="mm-f"><label>Qaysi zayavka boʻyicha</label><select id="mtk_z" onchange="mtKForm(this.value || '')"><option value="">— zayavkasiz —</option>${open.map(x => `<option value="${x.id}" ${z && z.id === x.id ? 'selected' : ''}>№${x.no} · ${escapeHtml(x.by ? shortName(x.by.n) : '')} · ${escapeHtml(x.items.map(i => i.n).join(', ').slice(0, 50))}</option>`).join('')}</select></div>
                <div class="mm-f"><label>Kelgan zapchastlar (soni — shu safar kelgani)</label><div id="mtRows"></div><button class="mini-btn" onclick="mtRowAdd()">➕ Qator</button></div>
                <details class="mm-f"><summary>📋 Telegram yozuvidan qatorlar (ixtiyoriy)</summary><textarea id="mtk_txt" rows="3" placeholder="Плунжерная пара д50.27 - 23 шт&#10;Кольцо водоперепускное - 1-ПДГ - 44 шт"></textarea><button class="mini-btn" onclick="mtKPaste()">➕ Qatorlarga ajratish</button></details>
                <div class="mm-f"><label>Suratlar, PDF va boshqa fayllar (har biriga izoh)</label>${mtFilesPicker('mtFiles')}</div>
                <div class="mm-f"><label>Yuk xati / hisob-faktura № — ixtiyoriy</label><input id="mtk_doc"></div>
                <div class="mm-f"><label>Izoh</label><input id="mtk_note"></div>
                <div class="nd-tip">Narx kiritilsa, xarajat avtomatik Buxgalteriya boʻlimiga oʻtadi. Kiritgan (lavozimi, familiyasi) va vaqt avtomatik yoziladi; bizdagi xodimlar «✅ Qabul qilish» bilan tasdiqlaydi.</div>
                <button class="action-btn" onclick="mtKSave()">💾 Saqlash va xabar berish</button>`, true);
            mtRowsDraw(); mtFilesDraw('mtFiles');
        }
        async function mtKSave() {
            if (MT3.busy) { alert('Fayllar hali tayyorlanmoqda — biroz kuting.'); return; }
            const items = mtCleanRows(); if (!items.length) { alert('Kamida bitta zapchast va sonini kiriting.'); return; }
            mtFilesRead(); const d = mtData(), zid = $id('mtk_z').value || null, z = zid ? d.zay.find(x => x.id === zid) : null, me = mtMe();
            const k = { id: uid('k'), at: new Date().toISOString(), zid: zid, zno: z ? z.no : null, items: items.map(i => ({ n: i.n, q: i.q, u: i.u, p: i.p || '' })), by: me, doc: $id('mtk_doc').value.trim(), note: $id('mtk_note').value.trim(), files: MT3.files.map(f => Object.assign({}, f, { up: me.t })) }; MT3.files = [];
            k.upd = k.at; try { KV_SYNC.dirty = true; } catch (e) {}
            d.kir.push(k);
            if (z) { k.items.forEach(i => { const zi = z.items.find(x => mtKey(x.n) === mtKey(i.n)); if (zi) zi.got = mtNum(zi.got) + mtNum(i.q); }); z.upd = k.at; }
            mtSave(d);
            // Buxgalteriyaga xarajat
            try { const sum = k.items.reduce((a, i) => a + mtNum(i.q) * mtNum(i.p), 0); if (sum > 0 && typeof buxAddAuto === 'function') buxAddAuto({ date: todayISO(), cat: 'ehtiyot', sum: sum, doc: k.doc, note: 'MTTB kirim' + (z ? ' (zayavka №' + z.no + ')' : '') + ': ' + k.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', '), src: 'mttb:' + k.id }); } catch (e) {}
            // Xabar: zayavka egasi va rahbarlarga
            const txt = '📦 Omborga keldi' + (z ? ' (zayavka №' + z.no + ')' : '') + ': ' + k.items.map(i => i.n + ' — ' + i.q + ' ' + i.u).join(', ');
            try { if (z && z.by && z.by.t) notify({ icon: '📦', text: txt, toTabel: z.by.t }); } catch (e) {}
            try { if (z && z.by && z.by.t && z.by.t !== meTabel() && typeof syncReady === 'function' && syncReady()) await syncSendMsg({ tabel: z.by.t, name: z.by.n }, txt); } catch (e) {}
            try { notify({ icon: '📦', text: 'Ehtiyot qismlar keldi — qabul qiling: ' + k.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', ') + ((k.files || []).length ? ' (📷 ' + k.files.length + ' ta fayl)' : '') + ' · ' + mtPerson(me), toAll: true }); } catch (e) {}
            mtFilesSync().catch(() => {});
            mdlClose('mtModal'); MT.tab = 'kir'; mtRender(); showToast('✅ Qayd qilindi' + (z ? ' — zayavka egasiga xabar yuborildi' : ''));
        }
        function mtKirHtml() {
            const d = mtData();
            return `<div class="mm-tools">${mtCanSend() ? '<button class="action-btn" onclick="mtKForm()">📥 Kelganini qayd qilish</button>' : ''}<button class="mini-btn" onclick="mtExcel('kir')">📊 Excel</button></div>` +
                (d.kir.slice().reverse().map(mtKCard).join('') || '<div class="xt-empty">Hali kirim yoʻq</div>');
        }
        // Ombordan berish
        function mtBForm() {
            if (!canMT()) { alert('Ombordan berishni MTTB xodimi yoki omborchi qayd qiladi.'); return; }
            MTF.price = false; MTF.rows = [{ n: '', q: '', u: 'dona' }]; MTF.to = null;
            mdl('mtModal', `<div class="px-h"><b>📤 Ombordan berish</b><button class="mini-btn" onclick="mdlClose('mtModal')">✕</button></div>
                <div class="mm-f"><label>Kimga</label><div id="mtb_to" class="mm-chips"><small>tanlanmagan</small></div><button class="mini-btn" onclick="pickXodim('Kimga beriladi', it => { MTF.to = { t: cleanTabel(it.tabel), n: it.name }; $id('mtb_to').innerHTML = '<span>' + escapeHtml(it.name) + '</span>'; })">👤 Xodimni tanlash</button></div>
                <div class="mm-f"><label>Qaysi vagon / texnika uchun</label><input id="mtb_unit" placeholder="masalan: 8121"></div>
                <div class="mm-f"><label>Zapchastlar</label><div id="mtRows"></div><button class="mini-btn" onclick="mtRowAdd()">➕ Qator</button></div>
                <div class="mm-f"><label>Izoh</label><input id="mtb_note"></div>
                <button class="action-btn" onclick="mtBSave()">💾 Saqlash</button>`, true);
            mtRowsDraw();
        }
        async function mtBSave() {
            const items = mtCleanRows(); if (!items.length) { alert('Zapchast va sonini kiriting.'); return; } if (!MTF.to) { alert('Kimga berilayotganini tanlang.'); return; }
            const st = mtStock(), short = items.filter(i => { const s = st.find(x => mtKey(x.n) === mtKey(i.n)); return !s || s.left < mtNum(i.q); });
            if (short.length && !await uiConfirm('⚠️ Omborda yetarli emas (hisob boʻyicha): ' + short.map(i => i.n).join(', ') + '. Baribir qayd qilinsinmi?')) return;
            const d = mtData(), b = { id: uid('b'), at: new Date().toISOString(), to: MTF.to, unit: $id('mtb_unit').value.trim(), items: items.map(i => ({ n: i.n, q: i.q, u: i.u })), by: { t: meTabel(), n: (currentUser && currentUser.name) || '' }, note: $id('mtb_note').value.trim(), acc: null };
            d.ber.push(b); mtSave(d);
            const txt = '📤 Sizga ombordan berildi' + (b.unit ? ' (' + b.unit + ')' : '') + ': ' + b.items.map(i => i.n + ' — ' + i.q + ' ' + i.u).join(', ') + '. Ilovada «✅ Qabul qildim» tugmasini bosing.';
            try { notify({ icon: '📤', text: txt, toTabel: b.to.t }); } catch (e) {}
            try { if (b.to.t !== meTabel() && typeof syncReady === 'function' && syncReady()) await syncSendMsg({ tabel: b.to.t, name: b.to.n }, txt); } catch (e) {}
            mdlClose('mtModal'); MT.tab = 'ber'; mtRender(); showToast('✅ Berish qayd qilindi — oluvchiga xabar yuborildi');
        }
        function mtBerCard(b) { const mine = b.to && b.to.t === meTabel(); return `<div class="mm-card ${b.acc ? 'ok' : 'warn'}"><b>📤 ${escapeHtml(fmtDT(b.at))} → ${escapeHtml(b.to ? b.to.n : '')}</b><small>${b.items.map(i => escapeHtml(i.n) + ' — ' + escapeHtml(String(i.q)) + ' ' + escapeHtml(i.u || '')).join('; ')}${b.unit ? ' · 🚃 ' + escapeHtml(b.unit) : ''}</small><small>✍️ berdi: ${escapeHtml(b.by ? b.by.n : '')} · ${b.acc ? '✅ qabul qilindi ' + escapeHtml(fmtDT(b.acc.at)) : '⏳ qabul qilinmagan'}</small>${!b.acc && mine ? `<button class="mini-btn" onclick="mtAccept('${b.id}')">✅ Qabul qildim</button>` : ''}</div>`; }
        function mtAccept(id) { const d = mtData(), b = d.ber.find(x => x.id === id); if (!b || b.to.t !== meTabel()) return; b.acc = { at: new Date().toISOString() }; b.upd = b.acc.at; mtSave(d); mtRender(); showToast('✅ Qabul qilindi'); try { notify({ icon: '✅', text: b.to.n + ' qabul qildi: ' + b.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', '), toTabel: b.by.t }); } catch (e) {} }
        function mtBerHtml() {
            const d = mtData(), q = dbN(MT.q);
            const l = d.ber.slice().reverse().filter(b => !q || dbN([b.to && b.to.n, b.unit, b.note].concat(b.items.map(i => i.n)).join(' ')).includes(q));
            return `<div class="mm-flt"><input class="search-box" placeholder="🔎 Xodim, vagon, zapchast..." value="${escapeHtml(MT.q)}" oninput="MT.q=this.value; clearTimeout(MT.tm); MT.tm=setTimeout(mtRender,250)"></div><div class="mm-tools">${canMT() ? '<button class="action-btn" onclick="mtBForm()">📤 Ombordan berish</button>' : ''}<button class="mini-btn" onclick="mtExcel('ber')">📊 Excel</button></div>` + (l.map(mtBerCard).join('') || '<div class="xt-empty">Hali berilmagan</div>');
        }
        function mtOmborHtml() {
            const st = mtStock(), q = dbN(MT.q), l = st.filter(x => !q || dbN(x.n).includes(q));
            return `<div class="mm-flt"><input class="search-box" placeholder="🔎 Zapchast nomi..." value="${escapeHtml(MT.q)}" oninput="MT.q=this.value; clearTimeout(MT.tm); MT.tm=setTimeout(mtRender,250)"></div><div class="mm-tools"><button class="mini-btn" onclick="mtExcel('ombor')">📊 Excel</button></div>
                <div class="nd-tip">Qoldiq = ilovada qayd qilingan kirim − berilgan. Ombordagi haqiqiy hisob bilan davriy solishtirib turing.</div>
                <div class="gt-scroll"><table class="mt-t"><tr><th>Nomi</th><th>Keldi</th><th>Berildi</th><th>Qoldiq</th></tr>${l.map(x => `<tr class="${x.left <= 0 ? 'bad' : ''}"><td>${escapeHtml(x.n)}</td><td>${mtFmtQ(x.in)}</td><td>${mtFmtQ(x.out)}</td><td><b>${mtFmtQ(x.left)}</b> ${escapeHtml(x.u)}</td></tr>`).join('')}</table></div>${l.length ? '' : '<div class="xt-empty">Hali maʼlumot yoʻq</div>'}`;
        }
        function mtRange(p) { const t = new Date(todayISO() + 'T00:00:00'); let a = new Date(t); if (p === 'hafta') a.setDate(t.getDate() - ((t.getDay() + 6) % 7)); else if (p === 'oy') a.setDate(1); const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); return [iso(a), todayISO()]; }
        function mtRepData(p) { const [a, b] = mtRange(p), d = mtData(), inR = x => { const s = locISO(x); return s >= a && s <= b; }; return { a: a, b: b, kir: d.kir.filter(k => inR(k.at)), ber: d.ber.filter(x => inR(x.at)), open: d.zay.filter(z => ['yangi', 'qisman'].includes(mtZStatus(z))) }; }
        function mtRepHtml() {
            const r = mtRepData(MT.rep);
            return `<div class="gt-lang">${[['kun', 'Bugun'], ['hafta', 'Shu hafta'], ['oy', 'Shu oy']].map(x => `<i class="${MT.rep === x[0] ? 'on' : ''}" onclick="MT.rep='${x[0]}'; mtRender()">${x[1]}</i>`).join('')}</div>
                <div class="mm-card"><b>📊 ${escapeHtml(fmtD(r.a))} — ${escapeHtml(fmtD(r.b))}</b><small>📥 Keldi: ${r.kir.length} ta kirim · 📤 Berildi: ${r.ber.length} ta · 📝 Kutilayotgan zayavkalar: ${r.open.length}</small></div>
                <div class="inf-sec">📥 Kelganlar</div>${r.kir.map(k => `<div class="mm-card"><small>${escapeHtml(fmtDT(k.at))}${k.zno ? ' · №' + k.zno : ''}: ${k.items.map(i => escapeHtml(i.n) + ' ' + escapeHtml(String(i.q)) + ' ' + escapeHtml(i.u || '')).join(', ')}</small></div>`).join('') || '<div class="xt-empty">—</div>'}
                <div class="inf-sec">📤 Berilganlar</div>${r.ber.map(b => `<div class="mm-card"><small>${escapeHtml(fmtDT(b.at))} → ${escapeHtml(b.to ? b.to.n : '')}: ${b.items.map(i => escapeHtml(i.n) + ' ' + escapeHtml(String(i.q))).join(', ')} ${b.acc ? '✅' : '⏳'}</small></div>`).join('') || '<div class="xt-empty">—</div>'}
                <div class="inf-sec">📝 Hali kelmagan zayavkalar</div>${r.open.map(mtZCard).join('') || '<div class="xt-empty">—</div>'}
                <div class="mm-tools"><button class="mini-btn" onclick="mtExcel('rep')">📊 Hisobotni Excelga</button></div>`;
        }
        function mtExcel(w) {
            const d = mtData(); let rows, t;
            if (w === 'zay') { rows = [['№', 'Sana', 'Kim', 'Maqsad', 'Nomi', 'Soʻralgan', 'Birlik', 'Keldi', 'Holati']]; d.zay.forEach(z => z.items.forEach(i => rows.push([z.no, fmtD(z.at), z.by ? z.by.n : '', z.unit || '', i.n, i.q, i.u, mtNum(i.got), MT_ST[mtZStatus(z)][1]]))); t = 'Zayavkalar'; }
            else if (w === 'kir') { rows = [['Sana', 'Zayavka', 'Nomi', 'Soni', 'Birlik', 'Narxi', 'Summa', 'Hujjat', 'Kiritdi', 'Qabul qildi', 'Lavozimi', 'Qabul sanasi', 'Qabul soni', 'Holati', 'Izoh', 'Fayllar']]; d.kir.forEach(k => k.items.forEach((i, n) => { const a = k.acc, ai = a && a.items ? a.items[n] : null; rows.push([fmtDT(k.at), k.zno || '', i.n, i.q, i.u, i.p || '', mtNum(i.q) * mtNum(i.p) || '', k.doc || '', k.by ? k.by.n : '', a ? a.by.n : '', a ? a.by.r || '' : '', a ? fmtDT(a.at) : 'qabul qilinmagan', ai ? ai.got : '', a ? (MT_HOLAT[a.holat] || MT_HOLAT.soz)[1] : '', a ? [a.note].concat((a.files || []).map(f => f.note).filter(Boolean)).filter(Boolean).join('; ') : '', (k.files || []).length + (a ? (a.files || []).length : 0)]); })); t = 'Kelgan va qabul qilingan zapchastlar'; }
            else if (w === 'ber') { rows = [['Sana', 'Kimga', 'Vagon/texnika', 'Nomi', 'Soni', 'Birlik', 'Berdi', 'Qabul']]; d.ber.forEach(b => b.items.forEach(i => rows.push([fmtDT(b.at), b.to ? b.to.n : '', b.unit || '', i.n, i.q, i.u, b.by ? b.by.n : '', b.acc ? fmtDT(b.acc.at) : 'yoʻq']))); t = 'Berilgan zapchastlar'; }
            else if (w === 'ombor') { rows = [['Nomi', 'Birlik', 'Keldi', 'Berildi', 'Qoldiq']]; mtStock().forEach(x => rows.push([x.n, x.u, x.in, x.out, x.left])); t = 'Ombor qoldigi'; }
            else { const r = mtRepData(MT.rep); rows = [['Turi', 'Sana', 'Nomi', 'Soni', 'Birlik', 'Kim']]; r.kir.forEach(k => k.items.forEach(i => rows.push(['Keldi', fmtDT(k.at), i.n, i.q, i.u, k.by ? k.by.n : '']))); r.ber.forEach(b => b.items.forEach(i => rows.push(['Berildi', fmtDT(b.at), i.n, i.q, i.u, b.to ? b.to.n : '']))); t = 'MTTB hisobot ' + fmtD(r.a) + '-' + fmtD(r.b); }
            xlsxDl(rows, t + ' ' + fmtD(todayISO()));
        }
        // Boshqa telefonlardan kelgan yangiliklar: menga tegishli kirim va berishlar
        SEC_EV.fns.push(function mtEvents() {
            const t = meTabel(); if (!t) return; const key = 'agmk_mttb_seen_' + t, seen = new Set(kvGet(key, [])), d = mtData(); let ch = false;
            if (!seen.size && !localStorage.getItem(key)) { d.kir.forEach(k => seen.add(k.id)); d.ber.forEach(b => seen.add(b.id)); try { localStorage.setItem(key, JSON.stringify(Array.from(seen))); } catch (e) {} return; }
            d.kir.forEach(k => { if (seen.has(k.id)) return; seen.add(k.id); ch = true; const z = d.zay.find(x => x.id === k.zid); if (k.by && k.by.t === t) return; if ((z && z.by && z.by.t === t) || hasRole('rahbar')) notify({ icon: '📦', text: 'Omborga keldi' + (z ? ' (zayavka №' + z.no + ')' : '') + ': ' + k.items.map(i => i.n + ' — ' + i.q + ' ' + i.u).join(', '), toTabel: t }); });
            d.ber.forEach(b => { if (seen.has(b.id)) return; seen.add(b.id); ch = true; if (b.to && b.to.t === t && !(b.by && b.by.t === t)) notify({ icon: '📤', text: 'Sizga ombordan berildi: ' + b.items.map(i => i.n + ' — ' + i.q + ' ' + i.u).join(', ') + '. MTTB boʻlimida «✅ Qabul qildim»ni bosing.', toTabel: t }); });
            if (ch) try { localStorage.setItem(key, JSON.stringify(Array.from(seen).slice(-5000))); } catch (e) {}
        });
        // AI savollari
        function mtAnswer(q) {
            const n = aiNorm(vFix(q));
            // Zayavka tuzish buyrug'i
            if (/(zayavka|заявк)/.test(n) && /(tuz|yoz|ber|qil|och|yarat|составь|оформи)/.test(n) && !/pdf|пдф/.test(n)) {
                const items = []; const m = n.match(/(\d{1,2})\s*(ta|dona)\s*(vagon|dumpkar)/); const nv = m ? +m[1] : 1;
                try { (SP_DATA.y2027 || []).forEach(x => { const k = dbN(x.n).split(' ').filter(w => w.length >= 5); if (k.some(w => dbN(n).includes(w.slice(0, 5)))) items.push({ n: x.n, q: String(mtNum(x.q) * nv || x.q), u: x.u }); }); } catch (e) {}
                const un = (n.match(/(\d{3,8})\s*(-?\s*vagon|raqamli)/) || [])[1];
                setTimeout(() => { try { $id('aiChatModal').classList.add('hidden'); } catch (e) {} openMTTB('zay'); mtZForm({ items: items.length ? items.slice(0, 12) : undefined, unit: un ? un + ' vagon' : '' }); }, 600);
                return "📝 Zayavka formasi ochilmoqda" + (items.length ? " — " + items.length + " pozitsiya 2ВС-105 KR meʼyoridan toʻldirildi (" + nv + " ta vagon uchun). Soni va nomlarini tekshirib saqlang." : ". Zapchastlarni kiriting va saqlang.");
            }
            if (!/omborga|omborda|ombor|zayavka|zapchast|ehtiyot qism|material|склад|заявк|запчаст/.test(n)) return null;
            const d = mtData();
            if (/omborda|qoldi|qoldiq|nechta bor|qancha bor|остат/.test(n)) {
                const st = mtStock(); const hit = st.filter(x => dbN(n).split(' ').some(w => w.length >= 4 && dbN(x.n).includes(w.slice(0, 5))));
                if (!st.length) return "🏬 Omborda hali qayd qilingan zapchast yoʻq (MTTB boʻlimida kirim kiritilmagan).\n📚 Manba: MTTB boʻlimi";
                const l = hit.length ? hit : st.slice(0, 12);
                return '🏬 Ombor qoldigʻi (ilovadagi hisob boʻyicha):\n' + l.slice(0, 15).map(x => '• ' + x.n + ' — ' + mtFmtQ(x.left) + ' ' + x.u).join('\n') + '\n📚 Manba: MTTB boʻlimi';
            }
            if (/kelmadi|kutil|hali kel|qachon kel/.test(n)) {
                const open = d.zay.filter(z => ['yangi', 'qisman'].includes(mtZStatus(z)));
                if (!open.length) return "✅ Kutilayotgan zayavka yoʻq.\n📚 Manba: MTTB boʻlimi";
                return '⏳ Hali toʻliq kelmagan zayavkalar (' + open.length + '):\n' + open.slice(0, 10).map(z => '• №' + z.no + ' (' + (z.by ? shortName(z.by.n) : '') + ', ' + fmtD(z.at) + '): ' + z.items.filter(i => mtNum(i.got) < mtNum(i.q)).map(i => i.n + ' ' + mtFmtQ(mtNum(i.q) - mtNum(i.got)) + ' ' + i.u).join(', ')).join('\n') + '\n📚 Manba: MTTB boʻlimi';
            }
            if (/berildi|berilgan|oldi/.test(n)) {
                const pp = allXodims().filter(r => { const w = dbN(r.item.name).split(' ')[0]; return w && w.length >= 4 && dbN(n).includes(w.slice(0, Math.max(4, w.length - 2))); });
                const l = pp.length === 1 ? d.ber.filter(b => b.to && b.to.t === cleanTabel(pp[0].item.tabel)) : d.ber.slice(-10);
                if (!l.length) return "📤 Berilgan zapchast topilmadi.\n📚 Manba: MTTB boʻlimi";
                return '📤 Berilganlar' + (pp.length === 1 ? ' — ' + pp[0].item.name : '') + ':\n' + l.slice(-12).reverse().map(b => '• ' + fmtD(b.at) + ' → ' + (b.to ? shortName(b.to.n) : '') + ': ' + b.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', ') + (b.acc ? ' ✅' : ' ⏳')).join('\n') + '\n📚 Manba: MTTB boʻlimi';
            }
            if (/keldi|kelgan|пришл/.test(n)) {
                const p = /hafta|неделю/.test(n) ? 'hafta' : /oy\b|месяц/.test(n) ? 'oy' : 'kun', r = mtRepData(p);
                if (!r.kir.length) return '📥 ' + ({ kun: 'Bugun', hafta: 'Shu hafta', oy: 'Shu oy' }[p]) + " omborga zapchast kelgani qayd qilinmagan.\n📚 Manba: MTTB boʻlimi";
                return '📥 ' + ({ kun: 'Bugun', hafta: 'Shu hafta', oy: 'Shu oy' }[p]) + ' keldi (' + r.kir.length + ' ta kirim):\n' + r.kir.map(k => '• ' + fmtDT(k.at) + (k.zno ? ' (№' + k.zno + ')' : '') + ': ' + k.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', ')).join('\n') + '\n📚 Manba: MTTB boʻlimi';
            }
            return null;
        }
        (function () { aiStage('MTTB', function (q, next) { try { const a = mtAnswer(q); if (a) return { t: a, personal: false }; } catch (e) { console.error(e); } return next(q); }); })();
        mainCard('mttb', '📦', 'MTTB — Moddiy-texnik taʼminot', 'mttb moddiy texnik taminot ombor zayavka zapchast kirim chiqim berish qabul', () => openMTTB(), '[onclick="openSettings()"]');

