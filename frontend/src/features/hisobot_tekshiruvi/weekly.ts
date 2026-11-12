
        // =====================================================================
        // v3.1 — 📅 HAFTALIK ACHOT (Forma-30 dan) — «Dalolatnoma va hisobotlar» bo'limida
        //  • Har juma Forma-30 (Excel) yuklanadi. Tanlangan skladlar (9201, 9202, 9203, 9205, 9208) bo'yicha summa
        //    «Дата партии» (prixod sanasi) ga qarab 3 guruhga ajratiladi: 1 yilgacha · 1–3 yil · 3–5 yil
        //    (5 yildan eskisi bo'lsa — alohida ko'rsatiladi, yo'qolmaydi). Hisob sanasi — fayldagi davr oxiri.
        //  • Har bir sklad va jami; oldingi yuklash bilan farq (bir oy ichidagi haftalik o'sish); Excel, Telegram matni.
        // =====================================================================
        var WK_KEY = 'agmk_weekly_v1', WK = { sel: null, f: null, q: '', open: false };
        var WK_B = [['b1', '1 yilgacha'], ['b13', '1 yildan 3 yilgacha'], ['b35', '3 yildan 5 yilgacha'], ['b5', '5 yildan ortiq']];
        function wkDB() { const d = kvGet(WK_KEY, null) || {}; d.skl = d.skl && d.skl.length ? d.skl : ['9201', '9202', '9203', '9205', '9208']; d.list = d.list || []; return d; }
        function wkSave(d) { kvSet(WK_KEY, d); try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; } catch (e) {} }
        function wkMoney(v) { return (Math.round((+v || 0) * 100) / 100).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' ').replace(',', ','); }
        function wkDate(v) { // «2025/10/06 23:54:41», «06.10.2025», Excel seriya raqami → 'YYYY-MM-DD'
            if (v === null || v === undefined || v === '') return '';
            if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5); return d.toISOString().slice(0, 10); }
            const s = String(v).trim(); let m = s.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/); if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
            m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
            return '';
        }
        function wkMinusY(iso, y) { const p = iso.split('-').map(Number); const d = new Date(Date.UTC(p[0] - y, p[1] - 1, p[2])); if (d.getUTCMonth() !== p[1] - 1) d.setUTCDate(0); return d.toISOString().slice(0, 10); }
        function wkBucket(d, ref) { if (!d) return 'nd'; if (d > wkMinusY(ref, 1)) return 'b1'; if (d > wkMinusY(ref, 3)) return 'b13'; if (d > wkMinusY(ref, 5)) return 'b35'; return 'b5'; }
        function wkParse(rows, skl) {
            let hi = -1, H = null; for (let i = 0; i < Math.min(rows.length, 40); i++) { const r = rows[i].map(c => String(c || '').trim().toLowerCase()); if (r.some(c => /^склад/.test(c)) && r.some(c => /дата партии|партия/.test(c)) && r.some(c => /^сумма/.test(c))) { hi = i; H = r; break; } }
            if (hi < 0) throw new Error('Forma-30 sarlavhasi topilmadi («Склад», «Дата партии», «Сумма» ustunlari kerak).');
            const iS = H.findIndex(c => /^склад/.test(c)), iD = H.findIndex(c => /дата партии|партия/.test(c)), iSum = H.findIndex(c => /^сумма/.test(c)), iN = H.findIndex(c => /номенклатура/.test(c)), iQ = H.findIndex(c => /количество/.test(c));
            let per = null; for (let i = 0; i < hi; i++) { const t = rows[i].join(' '); const m = t.match(/(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})\s*-\s*(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/); if (m) { per = { a: wkDate(m[1]), b: wkDate(m[2]) }; break; } }
            const num = v => typeof v === 'number' ? v : parseFloat(String(v || '').replace(/\s/g, '').replace(',', '.')) || 0;
            const recs = []; let fileTotal = 0, n = 0;
            for (let i = hi + 1; i < rows.length; i++) {
                const r = rows[i], sk = String(r[iS] || '').trim(); if (!sk) continue; const code = sk.split(/\s+/).pop(); n++; fileTotal += num(r[iSum]);
                recs.push({ k: code, d: wkDate(r[iD]), s: num(r[iSum]), n: iN >= 0 ? String(r[iN] || '') : '', q: iQ >= 0 ? num(r[iQ]) : 0 });
            }
            return { per: per, recs: recs, rowsAll: n, fileTotal: fileTotal };
        }
        function wkCompute(recs, ref, skl) {
            const Z = () => ({ b1: 0, b13: 0, b35: 0, b5: 0, nd: 0, all: 0, n: 0 }), res = {}, tot = Z(); skl.forEach(k => res[k] = Z());
            recs.forEach(x => { const b = wkBucket(x.d, ref), R = res[x.k] || (res[x.k] = Z()); R[b] += x.s; R.all += x.s; R.n++; tot[b] += x.s; tot.all += x.s; tot.n++; });
            return { res: res, tot: tot };
        }
        async function wkUpload(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            try {
                showToast('⏳ Forma-30 oʻqilmoqda…'); const rows = await hsReadExcel(await f.arrayBuffer(), f.name), d = wkDB();
                const P = wkParse(rows, d.skl), ref = (P.per && P.per.b) || todayISO(), all = Array.from(new Set(P.recs.map(x => x.k))).sort(), C = wkCompute(P.recs, ref, all); // barcha skladlar hisoblanadi — keyin filtr bilan tanlanadi
                const top = {}; P.recs.forEach(x => { const b = wkBucket(x.d, ref); if (b === 'b1') return; const T = top[x.k] = top[x.k] || {}; (T[b] = T[b] || []).push({ d: x.d, s: x.s, n: x.n.slice(0, 80) }); }); Object.values(top).forEach(T => Object.keys(T).forEach(b => { T[b] = T[b].sort((a, c) => c.s - a.s).slice(0, 8); }));
                const rec = { id: uid('w'), at: new Date().toISOString(), by: authorStr(), file: f.name, per: P.per, ref: ref, skl: d.skl.slice(), all: all, res: C.res, rowsAll: P.rowsAll, fileTotal: P.fileTotal, top: top, v: 2 };
                d.list.unshift(rec); d.list = d.list.slice(0, 120); wkSave(d); WK.sel = rec.id; hsRender();
                showToast('✅ Haftalik achot tayyor: ' + wkMoney(wkTot(rec, wkSel(d, rec)).all) + ' soʻm');
                try { aiLog('Haftalik achot (Forma-30): ' + f.name + ' — jami ' + wkMoney(C.tot.all)); } catch (e) {}
            } catch (e) { console.error(e); alert('⚠️ ' + agmkErrUz(e)); }
        }
        function wkPrev(d, rec) { // shu davr boshidan (bir oy) oldingi yuklash — haftalik farq uchun
            return d.list.find(x => x.id !== rec.id && x.at < rec.at && x.per && rec.per && x.per.a === rec.per.a && x.ref < rec.ref) || null;
        }
        function wkHtml() {
            const d = wkDB(), E = escapeHtml, rec = d.list.find(x => x.id === WK.sel) || d.list[0];
            let h = `<div class="hs-box"><div class="hs-h">📅 Haftalik achot — Forma-30 boʻyicha</div>
                <div class="nd-tip">Har juma Forma-30 (Excel) ni yuklang. Skladlar: <b>${d.skl.map(E).join(', ')}</b>. Summa prixod sanasiga («Дата партии») qarab 3 guruhga ajratiladi: <b>1 yilgacha</b>, <b>1–3 yil</b>, <b>3–5 yil</b>. Hisob sanasi — fayldagi davr oxiri.</div>
                <label class="action-btn" style="display:block;text-align:center;cursor:pointer">📥 Forma-30 ni yuklash<input type="file" accept=".xlsx,.xls,.xlsm" style="display:none" onchange="wkUpload(this)"></label>
                ${isAdmin() || hsCan() ? `<details><summary style="cursor:pointer;color:#94a3b8;font-size:13px">✏️ Asosiy skladlar roʻyxatini qoʻlda yozish</summary><div class="sg-tools"><input id="wkSkl" value="${E(d.skl.join(', '))}" style="flex:1"><button class="mini-btn" onclick="wkSetSkl()">💾</button></div></details>` : ''}</div>`;
            if (!rec) return h + '<div class="xt-empty">Hali Forma-30 yuklanmagan.</div>';
            const sel = wkSel(d, rec); rec.tot = wkTot(rec, sel); const cols = WK_B.filter(([k]) => k !== 'b5' || rec.tot.b5), nd = rec.tot.nd, prev0 = wkPrev(d, rec), prev = prev0 ? Object.assign({}, prev0, { tot: wkTot(prev0, sel) }) : null;
            const codes = rec.all || Object.keys(rec.res);
            const ordered = sel.concat(codes.filter(k => !sel.includes(k)));
            const filt = `<details class="hs-box wk-f"${WK.open ? ' open' : ''} ontoggle="WK.open=this.open"><summary class="hs-h">🏬 Skladlarni tanlash va tahrirlash <small>(${sel.length} tanlangan · faylda ${codes.length} ta)</small></summary>
                <input class="search-box" placeholder="🔎 Sklad kodi…" value="${E(WK.q || '')}" oninput="WK.q=this.value; document.querySelectorAll('.wk-f .snd-chips i').forEach(i => i.style.display = !WK.q || i.dataset.k.indexOf(WK.q) >= 0 ? '' : 'none')">
                <div class="snd-chips">${ordered.map(k => `<i data-k="${E(k)}" class="${sel.includes(k) ? 'on' : ''}" style="${WK.q && k.indexOf(WK.q) < 0 ? 'display:none' : ''}" onclick="wkToggle('${E(k)}')">${E(k)} <small>${wkMoney((rec.res[k] || {}).all).replace(/,\d\d$/, '')}</small></i>`).join('')}</div>
                <div class="pk-btns"><button onclick="WK.f=null; hsRender()">↩ Asosiy (${E(d.skl.join(', '))})</button><button onclick="WK.f=${E(JSON.stringify(codes))}; hsRender()">Hammasi</button><button onclick="WK.f=[]; hsRender()">Tozalash</button>${isAdmin() || hsCan() ? '<button class="pr" onclick="wkSaveSel()">💾 Asosiy qilish</button>' : ''}</div></details>`;
            h += `<div class="hs-box"><div class="hs-h">📊 ${E(rec.per ? fmtISO(rec.per.a) + ' – ' + fmtISO(rec.per.b) : fmtISO(rec.ref))} <small>· hisob sanasi ${E(fmtISO(rec.ref))}</small></div>
                <div class="wk-big">${cols.map(([k, t]) => `<div><small>${E(t)}</small><b>${wkMoney(rec.tot[k])}</b></div>`).join('')}<div class="wk-all"><small>Jami (${sel.length} sklad)</small><b>${wkMoney(rec.tot.all)}</b></div></div>
                <div class="gt-scroll"><table class="mt-t wk-t"><tr><th>Sklad</th>${cols.map(([k, t]) => `<th>${E(t)}</th>`).join('')}<th>Jami</th></tr>
                ${sel.map(k => { const R = rec.res[k] || {}; return `<tr><td><b>${E(k)}</b></td>${cols.map(([b]) => `<td>${wkMoney(R[b])}</td>`).join('')}<td><b>${wkMoney(R.all)}</b></td></tr>`; }).join('')}
                <tr class="wk-tot"><td>Jami</td>${cols.map(([b]) => `<td>${wkMoney(rec.tot[b])}</td>`).join('')}<td>${wkMoney(rec.tot.all)}</td></tr></table></div>
                ${nd ? `<div class="hp-warn">⚠️ Prixod sanasi yozilmagan qatorlar: ${wkMoney(nd)} soʻm — guruhlarga kiritilmadi (jamiga kiritilgan).</div>` : ''}
                ${prev ? `<div class="nd-tip">📈 Oldingi yuklash (${E(fmtISO(prev.ref))}) bilan farq — <b>shu hafta</b>: ${cols.map(([k, t]) => E(t) + ': ' + wkMoney(rec.tot[k] - prev.tot[k])).join(' · ')} · jami: <b>${wkMoney(rec.tot.all - prev.tot.all)}</b></div>` : ''}
                <div class="nd-tip">📄 ${E(rec.file)} · ${rec.tot.n} ta qator (fayldagi jami ${rec.rowsAll} qator, ${wkMoney(rec.fileTotal)} soʻm) · 👤 ${E(polPerson ? polPerson(rec.by) : rec.by)} · 🕒 ${E(fmtDT(rec.at))}</div>
                <div class="cx-bar"><button class="on" onclick="wkPdf('${rec.id}')">📥 PDF — telefonga</button><button onclick="wkPdf('${rec.id}', true)">✈️ Telegram (PDF)</button><button onclick="wkExcel('${rec.id}')">📊 Excel</button><button onclick="wkShare('${rec.id}')">📤 Telegram matni</button>${isAdmin() ? `<button onclick="wkDel('${rec.id}')">🗑</button>` : ''}</div></div>`;
            h += filt;
            const TP = {}; sel.forEach(k => { const T = (rec.top || {})[k] || {}; Object.keys(T).forEach(b => (TP[b] = TP[b] || []).push(...T[b].map(x => Object.assign({ k: k }, x)))); }); Object.keys(TP).forEach(b => TP[b] = TP[b].sort((a, c) => c.s - a.s).slice(0, 12));
            const old = ['b13', 'b35', 'b5'].filter(b => TP[b] && TP[b].length);
            if (old.length) h += `<div class="hs-box"><div class="hs-h">🔎 Eski prixodlar — eng katta summalar</div>${old.map(b => `<div class="pp-lbl">${E(WK_B.find(x => x[0] === b)[1]).toUpperCase()}</div>` + TP[b].map(x => `<div class="pol-v"><small style="flex:1">${E(x.k)} · ${E(String(x.n || '').slice(0, 60))}${x.d ? ' · ' + E(fmtISO(x.d)) : ''}</small><b style="min-width:auto">${wkMoney(x.s)}</b></div>`).join('')).join('')}</div>`;
            if (d.list.length > 1) h += `<div class="hs-box"><div class="hs-h">🗂 Oldingi haftalar</div>${d.list.slice(0, 30).map(x => `<div class="hs-row" onclick="WK.sel='${x.id}'; hsRender()"><b>${x.id === rec.id ? '▶ ' : ''}${E(fmtISO(x.ref))}</b><small>${E(x.file)} · jami ${wkMoney(wkTot(x, wkSel(d, x)).all)}</small></div>`).join('')}</div>`;
            return h;
        }
        function wkSel(d, rec) { return (WK.f || d.skl).slice(); } // tanlangan skladlar (faylda bo'lmasa — 0)
        function wkTot(rec, sel) { if (!rec.v && rec.tot) return rec.tot; const t = { b1: 0, b13: 0, b35: 0, b5: 0, nd: 0, all: 0, n: 0 }; sel.forEach(k => { const R = rec.res[k]; if (R) Object.keys(t).forEach(x => t[x] += R[x] || 0); }); return t; }
        function wkToggle(k) { const d = wkDB(), rec = d.list.find(x => x.id === WK.sel) || d.list[0]; const cur = wkSel(d, rec).slice(); const i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); WK.f = cur.sort(); hsRender(); }
        function wkSaveSel() { if (!WK.f || !WK.f.length) { showToast('Tanlov asosiy roʻyxat bilan bir xil'); return; } const d = wkDB(); d.skl = WK.f.slice(); wkSave(d); WK.f = null; showToast('💾 Asosiy skladlar: ' + d.skl.join(', ')); hsRender(); }
        function wkSetSkl() { const v = ($id('wkSkl').value || '').split(/[\s,;]+/).map(s => s.trim()).filter(s => /^\d{3,6}$/.test(s)); if (!v.length) { alert('Sklad kodlarini vergul bilan yozing, masalan: 9201, 9202'); return; } const d = wkDB(); d.skl = v; wkSave(d); WK.f = null; showToast('💾 Skladlar saqlandi'); hsRender(); }
        async function wkDel(id) { if (!isAdmin() || !(await uiConfirm('Bu hafta natijasi oʻchirilsinmi?'))) return; const d = wkDB(); d.list = d.list.filter(x => x.id !== id); wkSave(d); WK.sel = null; hsRender(); }
        function wkText(rec) {
            const sel = wkSel(wkDB(), rec); rec = Object.assign({}, rec, { skl: sel, tot: wkTot(rec, sel) }); const cols = WK_B.filter(([k]) => k !== 'b5' || rec.tot.b5);
            return '📅 Haftalik achot (Forma-30) — ' + fmtISO(rec.ref) + '\nSkladlar: ' + rec.skl.join(', ') + '\n\n' + cols.map(([k, t]) => t + ': ' + wkMoney(rec.tot[k])).join('\n') + '\nJami: ' + wkMoney(rec.tot.all)
                + '\n\n' + rec.skl.map(k => { const R = rec.res[k] || {}; return k + ': ' + cols.map(([b]) => wkMoney(R[b])).join(' / ') + ' = ' + wkMoney(R.all); }).join('\n');
        }
        async function wkShare(id) { const rec = wkDB().list.find(x => x.id === id); if (!rec) return; const t = wkText(rec); try { await navigator.clipboard.writeText(t); showToast('📋 Nusxa olindi'); } catch (e) {} try { if (typeof chatOpenLink === 'function') chatOpenLink('https://t.me/share/url?url=' + encodeURIComponent(' ') + '&text=' + encodeURIComponent(t)); } catch (e) {} }
        function wkExcel(id) {
            let rec = wkDB().list.find(x => x.id === id); if (!rec) return; const sel = wkSel(wkDB(), rec); rec = Object.assign({}, rec, { skl: sel, tot: wkTot(rec, sel) }); const cols = WK_B.filter(([k]) => k !== 'b5' || rec.tot.b5);
            const rows = [['Haftalik achot (Forma-30) — hisob sanasi ' + fmtISO(rec.ref)], [], ['Sklad'].concat(cols.map(c => c[1]), ['Jami'])];
            rec.skl.forEach(k => { const R = rec.res[k] || {}; rows.push([k].concat(cols.map(([b]) => Math.round((R[b] || 0) * 100) / 100), [Math.round((R.all || 0) * 100) / 100])); });
            rows.push(['Jami'].concat(cols.map(([b]) => Math.round(rec.tot[b] * 100) / 100), [Math.round(rec.tot.all * 100) / 100]));
            xlsxDl(rows, 'Haftalik achot ' + fmtISO(rec.ref));
        }
        function wkAnswer(n) {
            if (!/(haftalik|xaftalik|недел)\s*(achot|hisobot|otchot|summa|отч)|forma.?30.*(sklad|guruh|yil)|sklad\w*\s*(summa|bo.?yicha)/.test(n)) return null;
            const d = wkDB(); let rec = d.list[0]; if (rec) { const sel = wkSel(d, rec); rec = Object.assign({}, rec, { skl: sel, tot: wkTot(rec, sel) }); } setTimeout(() => { try { aicClose(); } catch (e) {} openHisob('haft'); }, 600);
            if (!rec) return { t: '📅 Haftalik achot: hali Forma-30 yuklanmagan. «Dalolatnoma va hisobotlar» → «📅 Haftalik achot» → «📥 Forma-30 ni yuklash».', personal: true };
            return { t: '📅 Haftalik achot (' + fmtISO(rec.ref) + ', skladlar ' + rec.skl.join(', ') + '):\n' + WK_B.filter(([k]) => k !== 'b5' || rec.tot.b5).map(([k, t]) => '• ' + t + ': ' + wkMoney(rec.tot[k])).join('\n') + '\n• Jami: ' + wkMoney(rec.tot.all) + '\n📚 Manba: Forma-30 (' + rec.file + ')', personal: true };
        }
        (function () {
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(WK_KEY)) KV_SYNC.keys.push(WK_KEY); } catch (e) {}
            const c = document.createElement('style'); c.textContent = '.wk-big{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:8px 0}.wk-big>div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px}.wk-big small{display:block;color:#94a3b8;font-size:12px}.wk-big b{font-size:17px;color:#f8fafc}.wk-big .wk-all{background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.4)}.wk-t td,.wk-t th{text-align:right;white-space:nowrap}.wk-t td:first-child,.wk-t th:first-child{text-align:left}.wk-tot td{font-weight:700;border-top:2px solid rgba(255,255,255,.2)}';
            document.head.appendChild(c);
            if (typeof aiStage === 'function') aiStage('Haftalik achot (Forma-30)', function (q, next) { try { const r = wkAnswer(String(q || '').toLowerCase()); if (r) return r; } catch (e) { console.error(e); } return next(q); });
        })();

