        /* ===== 33-bosqich: bo'lim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albomi ===== */
        // ---------- Bo'lim sahifasi (sarlavha, yorliqlar, tana) ----------
        function secScreen(id, title, back) {
            let s = $id(id); if (s) return s;
            s = document.createElement('div'); s.id = id; s.className = 'screen sec-screen';
            s.innerHTML = `<div class="set-head sec-head"><div class="inner-header"><div class="back-btn" onclick="${back || "openScreen('screen-main')"}">‹ Orqaga</div><h2 class="sec-title">${escapeHtml(title)}</h2><div style="width: 60px;"></div></div><div class="sec-tabs"></div></div><div class="set-body sec-body"></div>`;
            const prof = $id('screen-profile'); prof.parentNode.insertBefore(s, prof);
            try { const h = document.querySelector('#screen-settings .set-head'); const b = document.querySelector('#screen-settings .set-body'); if (h) { const cs = getComputedStyle(h); if (cs.backgroundImage && cs.backgroundImage !== 'none') s.querySelector('.set-head').style.backgroundImage = cs.backgroundImage; } if (b) { const cs = getComputedStyle(b); if (cs.backgroundImage && cs.backgroundImage !== 'none') s.querySelector('.set-body').style.backgroundImage = cs.backgroundImage; } } catch (e) {}
            return s;
        }
        function secTabs(id, tabs, cur, fn) { const t = $id(id).querySelector('.sec-tabs'); t.innerHTML = tabs.map(x => `<i class="${x[0] === cur ? 'on' : ''}" onclick="${fn}('${x[0]}')">${x[1]}</i>`).join(''); }
        function secBody(id) { return $id(id).querySelector('.sec-body'); }
        function mainCard(key, icon, text, search, fn, beforeSel) {
            const list = $id('main-card-list'); if (!list || list.querySelector('[data-sec="' + key + '"]')) return;
            const d = document.createElement('div'); d.className = 'btn-card'; d.setAttribute('data-sec', key); d.setAttribute('data-search', search); d.onclick = fn;
            d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">${icon}</span><span class="btn-text">${escapeHtml(text)}</span></div><span class="btn-arrow">›</span>`;
            const ref = beforeSel ? list.querySelector(beforeSel) : null; if (ref) list.insertBefore(d, ref); else list.appendChild(d);
        }
        function fmtSum(n) { n = Math.round(+n || 0); return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
        function xlsxDl(rows, title) { docDownload([{ name: String(title).replace(/[^\p{L}\d]+/gu, '_') + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: xlsxFromRows(rows, String(title).slice(0, 30)) }]); showToast('📊 Excel fayl tayyorlandi'); }
        function mdl(id, html, wide) {
            let m = $id(id);
            if (!m) { m = document.createElement('div'); m.id = id; m.className = 'modal-overlay hidden'; m.innerHTML = `<div class="modal-content sec-mdl${wide ? ' wide' : ''}"></div>`; document.body.appendChild(m); m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }); }
            m.querySelector('.modal-content').innerHTML = html; m.classList.remove('hidden'); return m;
        }
        function mdlClose(id) { const m = $id(id); if (m) m.classList.add('hidden'); }

        // ---------- Serverga sinxronlash: yangi bo'limlar ma'lumotlari ----------
        var KV_SYNC = { keys: ['agmk_roles', 'agmk_mm', 'agmk_mttb', 'agmk_bux', 'agmk_harakat'], dirty: false }; // v3.5: harakat tarkibi (dispetcherlik) ham barcha telefonlarda bir xil
        (function () {
            if (typeof syncLocal !== 'function') return;
            syncLocal = agmkExtend('syncLocal', '33-bosqich: boʼlim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albom', syncLocal, oL => function () {
                const out = oL.apply(this, arguments);
                KV_SYNC.keys.forEach(k => { const v = kvGet(k, null); if (v === null) return; if ((k === 'agmk_roles' || k === 'agmk_sec_cfg') && !isAdminReal()) return; if (k === 'agmk_bux' && !(isAdminReal() || hasRole('bux') || hasRole('rahbar'))) return; out.push({ id: 'kv:' + k, kind: 'kv', data: { k: k, v: v, by: meTabel() } }); });
                return out;
            });
            syncApply = agmkExtend('syncApply', '33-bosqich: boʼlim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albom', syncApply, oA => function (rec) {
                if (rec && rec.kind === 'kv' && rec.data && KV_SYNC.keys.includes(rec.data.k)) {
                    const d = rec.data;
                    if ((d.k === 'agmk_roles' || d.k === 'agmk_sec_cfg') && String(d.by) !== ADMIN_TABEL) return null; // rollar va xavfsizlikni faqat admin o'zgartiradi // rollarni faqat admin o'zgartiradi
                    let v = d.v; const cur = kvGet(d.k, null);
                    if (cur && typeof kvMerge === 'function') v = kvMerge(d.k, cur, v);
                    try { localStorage.setItem(d.k, JSON.stringify(v)); } catch (e) {}
                    try { secEventsCheck(); } catch (e) {}
                    return 'kv';
                }
                return oA.apply(this, arguments);
            });
            // Server sozlamasiga qo'shimcha xavfsizlik qoidalari
            try {
                SYNC_SQL += `

-- 33-bosqich: rollar va bo'limlar (qo'shimcha xavfsizlik qoidalari)
create or replace function public.agmk_me() returns text language sql stable as $$ select substring(auth.jwt()->>'email' from '^t([0-9]+)@') $$;
drop policy if exists agmk_i on public.agmk_records; drop policy if exists agmk_u on public.agmk_records;
create policy agmk_i on public.agmk_records for insert to authenticated with check (id <> 'kv:agmk_roles' or public.agmk_me() = '${ADMIN_TABEL}');
create policy agmk_u on public.agmk_records for update to authenticated using (id <> 'kv:agmk_roles' or public.agmk_me() = '${ADMIN_TABEL}');`;
            } catch (e) {}
        })();
        // Ro'yxatlarni birlashtirish (ikki telefon bir vaqtda yozganda yo'qolmasin)
        function kvMergeList(a, b) {
            // v3.6.6: id siz elementlar (matn, sana, jurnal yozuvlari) ham saqlanadi — avval tashlab yuborilardi va ikki telefon orasida cheksiz qayta yuborish boshlanardi
            const m = new Map(), plain = [], seen = new Set(), key = x => typeof x === 'object' ? JSON.stringify(x) : typeof x + ':' + String(x);
            const add = x => { if (x === null || x === undefined) return; if (typeof x === 'object' && x.id) { const o = m.get(x.id); if (!o || String(x.upd || x.at || '') >= String(o.upd || o.at || '')) m.set(x.id, x); if (!seen.has('#' + x.id)) { seen.add('#' + x.id); plain.push({ __id: x.id }); } return; } const k = key(x); if (!seen.has(k)) { seen.add(k); plain.push(x); } };
            (a || []).forEach(add); (b || []).forEach(add);
            return plain.map(x => x && x.__id !== undefined && Object.keys(x).length === 1 ? m.get(x.__id) : x);
        }
        function kvMerge(k, cur, inc) {
            if (k === 'agmk_roles') return inc;
            if (k === 'agmk_harakat' && typeof dispMerge === 'function') return dispMerge(cur, inc);
            if (Array.isArray(cur) || Array.isArray(inc)) return Array.isArray(cur) && Array.isArray(inc) ? kvMergeList(cur, inc) : inc; // v3.6.6: roʻyxat koʻrinishidagi kalitlar (ФОТ tarixi, naryad tekshiruvlari) obyektga aylanib qolmasin
            const out = Object.assign({}, cur, inc);
            Object.keys(Object.assign({}, cur, inc)).forEach(f => { if (Array.isArray(cur[f]) || Array.isArray(inc[f])) out[f] = kvMergeList(cur[f], inc[f]); else if (cur[f] && inc[f] && typeof cur[f] === 'object' && typeof inc[f] === 'object') { out[f] = Object.assign({}, cur[f]); Object.keys(inc[f]).forEach(x => { const a = cur[f][x], b = inc[f][x]; out[f][x] = (a && b && typeof a === 'object' && String(b.upd || '') < String(a.upd || '')) ? a : b; }); } });
            return out;
        }
        var SEC_EV = { fns: [] };
        function secEventsCheck() { SEC_EV.fns.forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
        setInterval(() => { if (currentUser && currentUser.tabel) secEventsCheck(); }, 60000);
        (function () { hideLock = agmkExtend('hideLock', '33-bosqich: boʼlim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albom', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(secEventsCheck, 1500); return r; }); })();

        // Yozishma va albom fayllari tozalanib ketmasligi (boshqa hisoblar fayllari ham)
        var MEDIA_KEEP_KEY = 'agmk_media_keep';
        function mediaKeep(ref) { if (!ref) return; const l = kvGet(MEDIA_KEEP_KEY, []); if (!l.includes(ref)) { l.push(ref); try { localStorage.setItem(MEDIA_KEEP_KEY, JSON.stringify(l.slice(-20000))); } catch (e) {} } }
        (function () { allImageObjects = agmkExtend('allImageObjects', '33-bosqich: boʼlim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albom', allImageObjects, o => function () { const r = o.apply(this, arguments); try { kvGet(MEDIA_KEEP_KEY, []).forEach(x => r.push({ src: 'idb:' + x })); } catch (e) {} return r; }); })();
        (function () { chatAddMsg = agmkExtend('chatAddMsg', '33-bosqich: boʼlim sahifalari uchun umumiy qism, serverga sinxronlash, vagon eslatma albom', chatAddMsg, o => async function () { const r = await o.apply(this, arguments); try { Object.values(chatAll()).forEach(c => (c.msgs || []).forEach(m => (m.files || []).forEach(f => mediaKeep(f.ref)))); } catch (e) {} return r; }); })();

