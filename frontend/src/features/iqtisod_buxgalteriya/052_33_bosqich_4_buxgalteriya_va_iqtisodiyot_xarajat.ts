        /* ===== 33-bosqich (4): 💰 Buxgalteriya va iqtisodiyot — xarajatlar, reja-fakt, MTTB kirimlari ===== */
        var BUX_CATS = [['ehtiyot', 'Ehtiyot qismlar'], ['material', 'Materiallar'], ['tamir', 'Taʼmir xizmatlari'], ['yoqilgi', 'Yoqilgʻi-moylash materiallari'], ['ishhaqi', 'Ish haqi va ijtimoiy toʻlovlar'], ['transport', 'Transport xizmatlari'], ['energiya', 'Elektr energiya va kommunal'], ['boshqa', 'Boshqa xarajatlar']];
        var BX = { tab: 'rf', y: new Date().getFullYear(), m: '', cat: '', q: '' };
        function bxData() { const d = kvGet('agmk_bux', null) || {}; d.exp = d.exp || []; d.plan = d.plan || {}; return d; }
        function bxSave(d) { return kvSet('agmk_bux', d); }
        function canBxView() { return isAdmin() || hasRole('bux') || hasRole('rahbar'); }
        function canBxEdit() { return isAdmin() || hasRole('bux'); }
        function bxCat(id) { return (BUX_CATS.find(c => c[0] === id) || [id, id])[1]; }
        function bxNum(x) { const v = parseFloat(String(x).replace(/\s/g, '').replace(',', '.')); return isNaN(v) ? 0 : v; }
        function buxAddAuto(o) { const d = bxData(); if (o.src && d.exp.some(e => e.src === o.src)) return; d.exp.push(Object.assign({ id: uid('e'), at: new Date().toISOString(), by: authorStr(), byT: meTabel(), auto: true }, o)); bxSave(d); }
        function openBux(tab) {
            if (!canBxView()) { alert("💰 Buxgalteriya va iqtisodiyot boʻlimi faqat buxgalteriya xodimlari, rahbariyat va admin uchun.\n\nRolni admin Parametrlar → 👥 Rollar va huquqlar boʻlimida beradi."); return; }
            secScreen('screen-bux', '💰 Buxgalteriya va iqtisodiyot'); if (tab) BX.tab = tab; openScreen('screen-bux'); bxRender();
        }
        function bxTab(t) { BX.tab = t; bxRender(); }
        function bxRender() {
            const iq = typeof iqtOn === 'function' && iqtOn(); if (!iq && /^(tan|idle|tah)$/.test(BX.tab)) BX.tab = 'rf';
            secTabs('screen-bux', [['rf', '📊 Reja-fakt'], ['exp', '🧾 Xarajatlar'], ['plan', '🎯 Reja'], ['mttb', '📥 MTTB kirimlari']].concat(iq ? [['tan', '🔧 Tannarx'], ['idle', '⏳ Turib qolish'], ['tah', '🧠 Tahlil']] : []), BX.tab, 'bxTab');
            const b = secBody('screen-bux');
            b.innerHTML = ({ rf: bxRfHtml, exp: bxExpHtml, plan: bxPlanHtml, mttb: bxMtHtml, tan: iq && iqtTanHtml, idle: iq && iqtIdleHtml, tah: iq && iqtTahHtml })[BX.tab]();
        }
        function bxYearSel() { const ys = new Set([new Date().getFullYear()]); bxData().exp.forEach(e => ys.add(+String(e.date).slice(0, 4))); Object.keys(bxData().plan).forEach(y => ys.add(+y)); return `<select onchange="BX.y=+this.value; bxRender()">${Array.from(ys).filter(Boolean).sort().map(y => `<option ${y === BX.y ? 'selected' : ''}>${y}</option>`).join('')}</select>`; }
        function bxFact(y, m) { const f = {}; bxData().exp.forEach(e => { const s = String(e.date); if (s.slice(0, 4) !== String(y)) return; if (m && s.slice(5, 7) !== m) return; f[e.cat] = (f[e.cat] || 0) + bxNum(e.sum); }); return f; }
        function bxRfHtml() {
            const d = bxData(), plan = d.plan[BX.y] || {}, fact = bxFact(BX.y);
            let tp = 0, tf = 0;
            const rows = BUX_CATS.map(([id, t]) => { const p = bxNum(plan[id]), f = fact[id] || 0; tp += p; tf += f; const pct = p ? Math.round(f / p * 100) : null; return `<tr><td>${escapeHtml(t)}</td><td>${fmtSum(p)}</td><td>${fmtSum(f)}</td><td class="${pct !== null && pct > 100 ? 'bad' : ''}">${pct === null ? '—' : pct + '%'}</td><td>${fmtSum(f - p)}</td></tr>`; }).join('');
            const months = Array.from({ length: 12 }, (_, i) => { const m = String(i + 1).padStart(2, '0'); const f = bxFact(BX.y, m); return Object.values(f).reduce((a, b) => a + b, 0); }), mx = Math.max(1, ...months);
            const mn = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
            return `<div class="mm-flt">${bxYearSel()}<button class="mini-btn" onclick="bxExcel()">📊 Excel</button></div>
                <div class="mm-sum"><i class="ok"><b>${fmtSum(tp)}</b>reja, soʻm</i><i class="warn"><b>${fmtSum(tf)}</b>fakt, soʻm</i><i class="${tp && tf > tp ? 'bad' : 'no'}"><b>${tp ? Math.round(tf / tp * 100) + '%' : '—'}</b>bajarilish</i></div>
                <div class="gt-scroll"><table class="mt-t"><tr><th>Modda</th><th>Reja</th><th>Fakt</th><th>%</th><th>Farq</th></tr>${rows}<tr class="tot"><td>JAMI</td><td>${fmtSum(tp)}</td><td>${fmtSum(tf)}</td><td>${tp ? Math.round(tf / tp * 100) + '%' : '—'}</td><td>${fmtSum(tf - tp)}</td></tr></table></div>
                <div class="inf-sec">📈 Oylar boʻyicha fakt xarajat</div>
                <div class="bx-bars">${months.map((v, i) => `<div class="bx-b"><i style="height:${Math.round(v / mx * 100)}%" title="${fmtSum(v)} soʻm"></i><small>${mn[i]}</small></div>`).join('')}</div>
                <div class="nd-tip">Reja summalari «🎯 Reja» yorligʻida kiritiladi. Fakt — «🧾 Xarajatlar» va narxi koʻrsatilgan MTTB kirimlaridan avtomatik yigʻiladi. Barcha summalar soʻmda.</div>`;
        }
        function bxExpHtml() {
            const q = dbN(BX.q);
            const l = bxData().exp.filter(e => String(e.date).slice(0, 4) === String(BX.y) && (!BX.m || String(e.date).slice(5, 7) === BX.m) && (!BX.cat || e.cat === BX.cat) && (!q || dbN([e.note, e.doc, e.unit, bxCat(e.cat)].join(' ')).includes(q))).sort((a, c) => String(c.date).localeCompare(String(a.date)));
            const tot = l.reduce((a, e) => a + bxNum(e.sum), 0);
            return `<div class="mm-flt">${bxYearSel()}<select onchange="BX.m=this.value; bxRender()"><option value="">Barcha oylar</option>${Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => `<option value="${m}" ${BX.m === m ? 'selected' : ''}>${m}-oy</option>`).join('')}</select><select onchange="BX.cat=this.value; bxRender()"><option value="">Barcha moddalar</option>${BUX_CATS.map(c => `<option value="${c[0]}" ${BX.cat === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('')}</select></div>
                <div class="mm-flt"><input class="search-box" placeholder="🔎 Izoh, hujjat, vagon..." value="${escapeHtml(BX.q)}" oninput="BX.q=this.value; clearTimeout(BX.tm); BX.tm=setTimeout(bxRender,250)"></div>
                <div class="mm-tools">${canBxEdit() ? '<button class="action-btn" onclick="bxForm()">➕ Xarajat qoʻshish</button>' : ''}<button class="mini-btn" onclick="bxExcel()">📊 Excel</button></div>
                <div class="mm-card"><b>Jami: ${fmtSum(tot)} soʻm</b><small>${l.length} ta yozuv</small></div>
                ${l.map(e => `<div class="mm-card"><b>${escapeHtml(fmtD(e.date))} · ${fmtSum(e.sum)} soʻm</b><small>${escapeHtml(bxCat(e.cat))}${e.unit ? ' · ' + escapeHtml(e.unit) : ''}${e.doc ? ' · 📄 ' + escapeHtml(e.doc) : ''}${e.auto ? ' · 📦 MTTB dan' : ''}</small>${e.note ? `<small>${escapeHtml(e.note)}</small>` : ''}<small>✍️ ${escapeHtml(e.by || '')}${canBxEdit() ? ` <u onclick="bxForm('${e.id}')">✏️</u> <u onclick="bxDel('${e.id}')">🗑</u>` : ''}</small></div>`).join('') || '<div class="xt-empty">Yozuv yoʻq</div>'}`;
        }
        function bxForm(id) {
            if (!canBxEdit()) return; const e = id ? bxData().exp.find(x => x.id === id) : null;
            mdl('bxModal', `<div class="px-h"><b>${e ? '✏️ Xarajatni tahrirlash' : '➕ Xarajat qoʻshish'}</b><button class="mini-btn" onclick="mdlClose('bxModal')">✕</button></div>
                <div class="mm-grid2"><div class="mm-f"><label>Sana</label><input type="date" id="bx_date" value="${escapeHtml(e ? e.date : todayISO())}"></div><div class="mm-f"><label>Summa (soʻm)</label><input id="bx_sum" inputmode="decimal" value="${escapeHtml(e ? String(e.sum) : '')}"></div></div>
                <div class="mm-f"><label>Modda</label><select id="bx_cat">${BUX_CATS.map(c => `<option value="${c[0]}" ${e && e.cat === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('')}</select></div>
                <div class="mm-f"><label>Vagon / texnika / obyekt — ixtiyoriy</label><input id="bx_unit" value="${escapeHtml(e ? e.unit || '' : '')}"></div>
                <div class="mm-f"><label>Hujjat (hisob-faktura, shartnoma №) — ixtiyoriy</label><input id="bx_doc" value="${escapeHtml(e ? e.doc || '' : '')}"></div>
                <div class="mm-f"><label>Izoh</label><input id="bx_note" value="${escapeHtml(e ? e.note || '' : '')}"></div>
                <button class="action-btn" onclick="bxSaveForm('${e ? e.id : ''}')">💾 Saqlash</button>`);
        }
        function bxSaveForm(id) {
            const sum = bxNum($id('bx_sum').value), date = $id('bx_date').value; if (!date || !(sum > 0)) { alert('Sana va summani kiriting.'); return; }
            const d = bxData(), o = { date: date, sum: sum, cat: $id('bx_cat').value, unit: $id('bx_unit').value.trim(), doc: $id('bx_doc').value.trim(), note: $id('bx_note').value.trim(), upd: new Date().toISOString() };
            if (id) { const e = d.exp.find(x => x.id === id); if (e) Object.assign(e, o); } else d.exp.push(Object.assign({ id: uid('e'), at: new Date().toISOString(), by: authorStr(), byT: meTabel() }, o));
            bxSave(d); mdlClose('bxModal'); bxRender(); showToast('✅ Saqlandi');
        }
        async function bxDel(id) { if (!await uiConfirm('Xarajat yozuvi oʻchirilsinmi?')) return; const d = bxData(); d.exp = d.exp.filter(x => x.id !== id); bxSave(d); bxRender(); }
        function bxPlanHtml() {
            const p = bxData().plan[BX.y] || {}, ed = canBxEdit();
            return `<div class="mm-flt">${bxYearSel()}</div><div class="nd-tip">${BX.y}-yil uchun moddalar boʻyicha yillik reja (soʻm). Reja-fakt shu summalar bilan solishtiriladi.</div>
                ${BUX_CATS.map(([id, t]) => `<div class="mm-f"><label>${escapeHtml(t)}</label>${ed ? `<input inputmode="decimal" id="bxp_${id}" value="${p[id] ? escapeHtml(String(p[id])) : ''}" placeholder="0">` : `<b>${fmtSum(p[id])} soʻm</b>`}</div>`).join('')}
                ${ed ? '<button class="action-btn" onclick="bxPlanSave()">💾 Rejani saqlash</button>' : ''}`;
        }
        function bxPlanSave() { const d = bxData(), p = {}; BUX_CATS.forEach(([id]) => { const v = bxNum(($id('bxp_' + id) || {}).value); if (v) p[id] = v; }); p.upd = new Date().toISOString(); d.plan[BX.y] = p; bxSave(d); BX.tab = 'rf'; bxRender(); showToast('✅ Reja saqlandi'); }
        function bxMtHtml() {
            const d = mtData(), ex = new Set(bxData().exp.map(e => e.src).filter(Boolean));
            const l = d.kir.slice().reverse();
            return `<div class="nd-tip">MTTB boʻlimida kiritilgan kelgan zapchastlar. Narxi kiritilganlari xarajatga avtomatik oʻtgan (📦 belgisi). Narxsizlarini shu yerda narx kiritib oʻtkazish mumkin.</div>` +
                (l.map(k => { const sum = k.items.reduce((a, i) => a + mtNum(i.q) * mtNum(i.p), 0), done = ex.has('mttb:' + k.id); return `<div class="mm-card ${done ? 'ok' : ''}"><b>${escapeHtml(fmtDT(k.at))}${k.zno ? ' · zayavka №' + k.zno : ''} · ${sum ? fmtSum(sum) + ' soʻm' : 'narx kiritilmagan'}</b><small>${k.items.map(i => escapeHtml(i.n) + ' ' + escapeHtml(String(i.q)) + ' ' + escapeHtml(i.u || '')).join('; ')}</small><small>${done ? '📦 Xarajatga oʻtkazilgan' : canBxEdit() ? `<u onclick="bxFromMt('${k.id}')">➕ Narx kiritib xarajatga oʻtkazish</u>` : ''}</small></div>`; }).join('') || '<div class="xt-empty">MTTB kirimlari yoʻq</div>');
        }
        async function bxFromMt(kid) {
            const k = mtData().kir.find(x => x.id === kid); if (!k) return;
            const s = await uiPrompt('Umumiy summa (soʻm): ' + k.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', '), ''); if (!s) return;
            const v = bxNum(s); if (!(v > 0)) { alert('Summa notoʻgʻri.'); return; }
            buxAddAuto({ date: String(k.at).slice(0, 10), cat: 'ehtiyot', sum: v, doc: k.doc || '', note: 'MTTB kirim' + (k.zno ? ' (zayavka №' + k.zno + ')' : '') + ': ' + k.items.map(i => i.n + ' ' + i.q + ' ' + i.u).join(', '), src: 'mttb:' + k.id });
            bxRender(); showToast('✅ Xarajatga oʻtkazildi');
        }
        function bxExcel() {
            const d = bxData(), rows = [['Sana', 'Modda', 'Summa (soʻm)', 'Vagon/obyekt', 'Hujjat', 'Izoh', 'Kiritdi']];
            d.exp.filter(e => String(e.date).slice(0, 4) === String(BX.y)).sort((a, c) => String(a.date).localeCompare(String(c.date))).forEach(e => rows.push([fmtD(e.date), bxCat(e.cat), bxNum(e.sum), e.unit || '', e.doc || '', e.note || '', e.by || '']));
            rows.push([]); rows.push(['Reja-fakt ' + BX.y, '', '', '', '', '', '']); rows.push(['Modda', 'Reja', 'Fakt', '%']);
            const p = d.plan[BX.y] || {}, f = bxFact(BX.y); BUX_CATS.forEach(([id, t]) => rows.push([t, bxNum(p[id]), f[id] || 0, bxNum(p[id]) ? Math.round((f[id] || 0) / bxNum(p[id]) * 100) + '%' : '']));
            xlsxDl(rows, 'Buxgalteriya ' + BX.y);
        }
        // AI savollari
        function bxAnswer(q) {
            const n = aiNorm(q);
            if (!/xarajat|sarflan|sarf qilin|reja.?fakt|reja bajar|buxgalter|расход|затрат/.test(n)) return null;
            if (/yoqilg|dizel|benzin|kolodka|ehtiyot qism kerak|norma|me.?yor/.test(n) && !/xarajat|so.?m|summa|pul/.test(n)) return null;
            if (!canBxView()) return "🔒 Moliyaviy maʼlumotlar faqat buxgalteriya, rahbariyat va admin uchun ochiq.";
            const y = new Date().getFullYear(), mm = String(new Date().getMonth() + 1).padStart(2, '0');
            const month = /shu oy|bu oy|oy davomida|этом месяце/.test(n), f = bxFact(y, month ? mm : ''), tot = Object.values(f).reduce((a, b) => a + b, 0);
            const cat = BUX_CATS.find(c => dbN(n).includes(dbN(c[1]).slice(0, 7)) || (c[0] === 'ehtiyot' && /ehtiyot|zapchast/.test(n)) || (c[0] === 'yoqilgi' && /yoqilg|gsm/.test(n)) || (c[0] === 'tamir' && /ta.?mir xizmat/.test(n)));
            if (/reja/.test(n)) { const p = bxData().plan[y] || {}; const tp = BUX_CATS.reduce((a, c) => a + bxNum(p[c[0]]), 0), tf = Object.values(bxFact(y)).reduce((a, b) => a + b, 0); return '💰 ' + y + '-yil reja-fakt:\n• Reja: ' + fmtSum(tp) + ' soʻm\n• Fakt: ' + fmtSum(tf) + ' soʻm\n• Bajarilish: ' + (tp ? Math.round(tf / tp * 100) + '%' : 'reja kiritilmagan') + '\n📚 Manba: Buxgalteriya boʻlimi'; }
            if (cat) return '💰 ' + cat[1] + (month ? ' (shu oy)' : ' (' + y + '-yil)') + ': ' + fmtSum(f[cat[0]] || 0) + ' soʻm\n📚 Manba: Buxgalteriya boʻlimi';
            return '💰 Xarajatlar' + (month ? ' (shu oy)' : ' (' + y + '-yil)') + ': jami ' + fmtSum(tot) + ' soʻm\n' + BUX_CATS.filter(c => f[c[0]]).map(c => '• ' + c[1] + ': ' + fmtSum(f[c[0]]) + ' soʻm').join('\n') + '\n📚 Manba: Buxgalteriya boʻlimi';
        }
        (function () { aiStage('Buxgalteriya', function (q, next) { try { const a = bxAnswer(q); if (a) return { t: a, personal: true }; } catch (e) { console.error(e); } return next(q); }); })();
        mainCard('bux', '💰', 'Buxgalteriya va iqtisodiyot', 'buxgalteriya iqtisodiyot xarajat reja fakt moliya summa', () => openBux(), '[onclick="openSettings()"]');
        // Oddiy xodimlarga karta qulf belgisi bilan ko'rinadi
        setInterval(() => { const c = document.querySelector('#main-card-list [data-sec="bux"]'); if (c) c.classList.toggle('rn-lock', !canBxView()); }, 2000);

