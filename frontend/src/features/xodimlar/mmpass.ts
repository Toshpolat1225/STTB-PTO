        // =====================================================================
        // v3.6 — 🦺 MEHNAT MUHOFAZASI → XODIM PASPORTIDA (imtihonlar tarixi va keyingi muddatlar)
        //  Ranglar (vagon taʼmir rejasi kabi): 🔴 muddati keldi, 10 kun qoldi yoki o'tib ketdi · 🟡 3 oy ichida · 🔵 3 oydan ko'p.
        //  Manba bitta — «Mehnat muhofazasi» bo'limidagi yozuvlar va jurnal: u yerda kiritilgani pasportda darhol ko'rinadi.
        // =====================================================================
        var MMP_K = [['davriy', 'Yoʻl-yoʻriq'], ['bilim', 'Bilim sinovi (imtihon)'], ['tibbiy', 'Tibbiy koʻrik']];
        function mmpSt(left) { return left === null || left === undefined ? 'no' : left <= 10 ? 'bad' : left <= 90 ? 'warn' : 'ok'; }
        function mmpLeftTxt(l) { return l === null ? 'kiritilmagan' : l < 0 ? Math.abs(l) + ' kun oʻtdi' : l === 0 ? 'bugun' : l + ' kun qoldi'; }
        function mmpHist(t) {
            const D = mmData(), r = D.recs[cleanTabel(t)] || {}, d = r.d || {}, out = [], seen = new Set();
            D.jr.filter(j => (j.tabels || []).includes(cleanTabel(t))).forEach(j => { const k = j.type + '|' + j.date; seen.add(k); out.push({ date: j.date, t: (MM_JT.find(x => x[0] === j.type) || [0, j.type])[1], note: j.note || '', by: j.by || '' }); });
            Object.keys(d).forEach(k => { if (d[k] && !seen.has(k + '|' + d[k])) out.push({ date: d[k], t: (MM_JT.find(x => x[0] === k) || [0, k])[1], note: 'xodim kartasida', by: '' }); });
            return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
        }
        function mmpHtml(item) {
            const t = cleanTabel(item.tabel), s = mmStat(item), E = escapeHtml, H = mmpHist(t), now = new Date(); now.setDate(1);
            const months = []; for (let i = 0; i < 12; i++) { const m = new Date(now.getFullYear(), now.getMonth() + i, 1); months.push([m.getFullYear() + '-' + String(m.getMonth() + 1).padStart(2, '0'), OY_QISQA ? OY_QISQA[m.getMonth()] : String(m.getMonth() + 1)]); }
            const cell = (k, ym) => { const n = s[k].next; if (!n) return ''; const st = mmpSt(s[k].left); if (n.slice(0, 7) === ym || (ym === months[0][0] && n.slice(0, 7) < ym)) return `<i class="mmp-c ${st}" title="${E(fmtD(n))}">${n.slice(0, 7) < ym ? '!' : n.slice(8, 10)}</i>`; return ''; };
            return `<div class="mmp-box" id="mmpBox"><div class="mmp-h"><b>🦺 Mehnat muhofazasi</b><small>toifa: ${E(MM_CAT[s.cat] || '')}</small></div>
                <div class="mmp-cards">${MMP_K.map(([k, lb]) => { const x = s[k], st = mmpSt(x.left); return `<div class="mmp-k ${st}"><span>${E(lb)}</span><b>${x.next ? E(fmtD(x.next)) : '—'}</b><small>${E(mmpLeftTxt(x.left))}${x.last ? ' · oxirgisi ' + E(fmtD(x.last)) : ''}</small></div>`; }).join('')}</div>
                <div class="mmp-plan"><table><tr><th></th>${months.map(m => `<th>${E(m[1])}</th>`).join('')}</tr>${MMP_K.map(([k, lb]) => `<tr><td>${E(lb.split(' ')[0])}</td>${months.map(m => `<td>${cell(k, m[0])}</td>`).join('')}</tr>`).join('')}</table></div>
                <div class="mmp-leg"><i class="bad"></i>muddati keldi / 10 kun qoldi / oʻtdi <i class="warn"></i>3 oy ichida <i class="ok"></i>3 oydan koʻp</div>
                <details class="mmp-hist"${H.length ? '' : ' open'}><summary>📜 Imtihonlar va yoʻl-yoʻriqlar tarixi (${H.length})</summary>${H.map(h => `<div><b>${E(fmtD(h.date))}</b> — ${E(h.t)}${h.note ? ' · ' + E(h.note) : ''}${h.by ? '<small> · ' + E(h.by) + '</small>' : ''}</div>`).join('') || '<div>Hali yozuv yoʻq</div>'}</details>
                ${canMMEdit() ? `<div class="mmp-acts"><button class="mini-btn" onclick="mmPerson('${E(t)}')">✏️ Sanalarni kiritish</button><button class="mini-btn" onclick="mmJrForm(); MMJ.sel=['${E(t)}']; mmJrChips()">➕ Jurnalga yozuv</button></div>` : ''}</div>`;
        }
        (function () {
            // Holat chegaralari: ≤10 kun / o'tgan — qizil, ≤3 oy — sariq, undan ko'p — ko'k
            if (typeof mmStat === 'function') mmStat = agmkExtend('mmStat', 'v3.6: ranglar 10 kun / 3 oy', mmStat, o => function () { const s = o.apply(this, arguments); ['davriy', 'bilim', 'tibbiy'].forEach(k => { if (s[k] && s[k].st !== 'no') s[k].st = mmpSt(s[k].left); }); return s; });
            if (typeof mmNazoratHtml === 'function') mmNazoratHtml = agmkExtend('mmNazoratHtml', 'v3.6: 3 oy', mmNazoratHtml, o => function () { return o.apply(this, arguments).replace('30 kun ichida', '3 oy ichida'); });
            if (typeof mmPersonSave === 'function') mmPersonSave = agmkExtend('mmPersonSave', 'v3.6: pasport yangilanadi', mmPersonSave, o => function () { if (!$id('screen-mm')) secScreen('screen-mm', '🦺 Mehnat muhofazasi'); const r = o.apply(this, arguments); mmpRefresh(); return r; });
            if (typeof mmJrSave === 'function') mmJrSave = agmkExtend('mmJrSave', 'v3.6: pasport yangilanadi', mmJrSave, o => function () { if (!$id('screen-mm')) secScreen('screen-mm', '🦺 Mehnat muhofazasi'); const r = o.apply(this, arguments); mmpRefresh(); return r; });
            if (typeof openItemPasport === 'function') openItemPasport = agmkExtend('openItemPasport', 'v3.6: mehnat muhofazasi bloki', openItemPasport, o => function () { const r = o.apply(this, arguments); mmpRefresh(); return r; });
            const st = document.createElement('style');
            st.textContent = `.mm-b.ok{background:rgba(30,58,138,.55)!important;border-color:rgba(96,165,250,.7)!important}
.mmp-box{margin:12px 0;padding:12px;border-radius:16px;border:1px solid #334155;background:rgba(15,23,42,.85)}.mmp-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}.mmp-h small{opacity:.7;font-size:11.5px}
.mmp-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.mmp-k{border-radius:12px;padding:8px;border:1.5px solid #475569;background:rgba(30,41,59,.8)}.mmp-k span{display:block;font-size:10.5px;opacity:.8}.mmp-k b{display:block;font-size:14px;margin:2px 0}.mmp-k small{display:block;font-size:10.5px;opacity:.85}
.mmp-k.bad{border-color:#ef4444;background:rgba(127,29,29,.5)}.mmp-k.warn{border-color:#eab308;background:rgba(113,63,18,.5)}.mmp-k.ok{border-color:#3b82f6;background:rgba(30,58,138,.5)}
.mmp-plan{overflow-x:auto;margin:10px 0 4px}.mmp-plan table{border-collapse:collapse;width:100%;font-size:10.5px}.mmp-plan th,.mmp-plan td{border:1px solid #334155;padding:3px 2px;text-align:center;min-width:24px}.mmp-plan td:first-child{text-align:left;padding-left:5px;white-space:nowrap}
.mmp-c{display:inline-block;min-width:18px;border-radius:6px;font-style:normal;font-weight:800;padding:1px 3px}.mmp-c.bad{background:#ef4444;color:#fff}.mmp-c.warn{background:#eab308;color:#111}.mmp-c.ok{background:#3b82f6;color:#fff}
.mmp-leg{font-size:10.5px;opacity:.85;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.mmp-leg i{display:inline-block;width:10px;height:10px;border-radius:3px}.mmp-leg i.bad{background:#ef4444}.mmp-leg i.warn{background:#eab308}.mmp-leg i.ok{background:#3b82f6}
.mmp-hist{margin-top:8px;font-size:12.5px}.mmp-hist div{padding:4px 0;border-bottom:1px dashed #334155}.mmp-acts{display:flex;gap:6px;margin-top:8px}`;
            document.head.appendChild(st);
        })();
        function mmpRefresh() {
            try { const old = $id('mmpBox'); if (old) old.remove();
                if (typeof currentSectionType === 'undefined' || currentSectionType !== 'xodim') return; const item = getActiveItem(); if (!item || !item.tabel) return;
                if (!(canMMView() || (typeof isOwnItem === 'function' && isOwnItem(item)))) return;
                const g = $id('item-passport-grid'); if (!g) return; g.insertAdjacentHTML('afterend', mmpHtml(item));
            } catch (e) { console.error(e); }
        }

