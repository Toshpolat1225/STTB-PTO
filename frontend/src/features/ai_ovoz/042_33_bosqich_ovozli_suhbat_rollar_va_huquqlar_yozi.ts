        /* ===== 33-bosqich: ovozli suhbat, rollar va huquqlar, yozishmalar maxfiyligi, standart sharhi, planshet ===== */
        // ---------- Umumiy yordamchilar ----------
        function meTabel() { return cleanTabel(currentUser && currentUser.tabel); }
        function kvGet(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v === null ? d : v; } catch (e) { return d; } }
        function kvSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); if (typeof KV_SYNC !== 'undefined' && KV_SYNC.keys.includes(k)) KV_SYNC.dirty = true; return true; } catch (e) { alert("⚠️ Xotira to'ldi — saqlanmadi."); return false; } }
        function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
        function fmtDT(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d)) return String(iso); const p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
        function locISO(iso) { const s = String(iso || ''); if (!/T\d/.test(s)) return s.slice(0, 10); const d = new Date(s); if (isNaN(d)) return s.slice(0, 10); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
        function fmtD(iso) { if (!iso) return '—'; const m = locISO(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso); }
        function daysTo(iso) { if (!iso) return null; const t = new Date(String(iso).slice(0, 10) + 'T00:00:00'), n = new Date(todayISO() + 'T00:00:00'); return Math.round((t - n) / 86400000); }
        function mmAddMonths(iso, m) { const d = new Date(String(iso).slice(0, 10) + 'T00:00:00'); if (isNaN(d)) return null; const day = d.getDate(); d.setMonth(d.getMonth() + m); if (d.getDate() < day) d.setDate(0); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
        function xodimByTabel(t) { const r = findXodimsByTabel(t)[0]; return r ? r.item : null; }
        function pickXodim(title, cb, filter) {
            let m = $id('pxModal');
            if (!m) { m = document.createElement('div'); m.id = 'pxModal'; m.className = 'modal-overlay hidden'; m.innerHTML = '<div class="modal-content px-box"><div class="px-h"><b id="pxTitle"></b><button class="mini-btn" onclick="$id(\'pxModal\').classList.add(\'hidden\')">✕</button></div><input class="search-box" id="pxQ" placeholder="🔎 Ism, familiya, tabel yoki lavozim..." oninput="pxRender()"><div id="pxList" class="px-list"></div></div>'; document.body.appendChild(m); }
            PX.cb = cb; PX.filter = filter || null; $id('pxTitle').innerText = title; $id('pxQ').value = ''; m.classList.remove('hidden'); pxRender(); setTimeout(() => { try { $id('pxQ').focus(); } catch (e) {} }, 60);
        }
        var PX = { cb: null, filter: null };
        function pxRender() {
            const q = dbN($id('pxQ').value || ''); let l = allXodims();
            if (PX.filter) l = l.filter(PX.filter);
            if (q) l = l.filter(r => dbN([r.item.name, r.item.tabel, r.item.lavozim, r.su].join(' ')).includes(q));
            $id('pxList').innerHTML = l.slice(0, 60).map(r => `<div class="px-row" onclick="pxPick('${escapeHtml(cleanTabel(r.item.tabel))}')"><b>${escapeHtml(r.item.name)}</b><small>${escapeHtml(r.item.lavozim || '')} · ${escapeHtml(r.su)} · tabel ${escapeHtml(r.item.tabel || '—')}</small></div>`).join('') || '<div class="xt-empty">Topilmadi</div>';
        }
        function pxPick(t) { $id('pxModal').classList.add('hidden'); const it = xodimByTabel(t); if (it && PX.cb) PX.cb(it); }

