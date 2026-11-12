        /* ===== 31-bosqich (5): Server bilan sinxronlash (Supabase) ===== */
        var SYNC_CFG = 'agmk_sync_cfg', SYNC_ST = 'agmk_sync_state', SYNC_SES = 'agmk_sync_ses';
        var SYNC = { busy: false, timer: 0, err: '', lastOk: 0, pushT: 0 };
        function syncGet(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
        function syncPut(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
        function syncCfg() { return syncGet(SYNC_CFG, { url: '', key: '', on: false }); }
        function syncReady() { const c = syncCfg(); return !!(c.on && c.url && c.key); }
        var SYNC_SQL = `-- AGMK-STTB PTO: Supabase sozlamasi (SQL Editor'da bir marta ishga tushiring)
create table if not exists public.agmk_records (
  id text primary key,
  kind text not null,
  data jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text
);
create index if not exists agmk_records_upd on public.agmk_records (updated_at);
create or replace function public.agmk_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists agmk_touch on public.agmk_records;
create trigger agmk_touch before insert or update on public.agmk_records for each row execute function public.agmk_touch();
alter table public.agmk_records enable row level security;
drop policy if exists agmk_r on public.agmk_records; drop policy if exists agmk_i on public.agmk_records; drop policy if exists agmk_u on public.agmk_records;
create policy agmk_r on public.agmk_records for select to authenticated using (true);
create policy agmk_i on public.agmk_records for insert to authenticated with check (true);
create policy agmk_u on public.agmk_records for update to authenticated using (true);

create table if not exists public.agmk_messages (
  id bigserial primary key,
  from_tabel text not null, from_name text, to_tabel text not null,
  text text not null, created_at timestamptz not null default now()
);
alter table public.agmk_messages enable row level security;
drop policy if exists agmk_mr on public.agmk_messages; drop policy if exists agmk_mi on public.agmk_messages;
create policy agmk_mr on public.agmk_messages for select to authenticated
  using (to_tabel = substring(auth.jwt()->>'email' from '^t([0-9]+)@') or from_tabel = substring(auth.jwt()->>'email' from '^t([0-9]+)@'));
create policy agmk_mi on public.agmk_messages for insert to authenticated
  with check (from_tabel = substring(auth.jwt()->>'email' from '^t([0-9]+)@'));
-- Authentication → Providers → Email: "Confirm email" ni o'chiring (xodimlar tabel raqami bilan kiradi).`;
        // ---------- HTTP ----------
        async function sbFetch(path, opt) {
            const c = syncCfg(), s = syncGet(SYNC_SES, null); opt = opt || {};
            const h = Object.assign({ apikey: c.key, 'Content-Type': 'application/json' }, opt.headers || {});
            if (s && s.access && !opt.anon) h.Authorization = 'Bearer ' + s.access;
            const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) {} }, opt.timeout || 20000); // v3.2.1: server topilmasa sinxronlash osilib qolmaydi
            let r; try { r = await fetch(c.url.replace(/\/+$/, '') + path, { method: opt.method || 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined, signal: ctl ? ctl.signal : undefined }); } finally { clearTimeout(tm); }
            if (r.status === 401 && !opt.retry && s && s.refresh) { if (await sbRefresh()) return sbFetch(path, Object.assign({}, opt, { retry: true })); }
            if (!r.ok) { let t = ''; try { t = (await r.json()).message || ''; } catch (e) {} throw new Error('Server ' + r.status + (t ? ': ' + t : '')); }
            return r.status === 204 ? null : r.json().catch(() => null);
        }
        async function sbRefresh() {
            const s = syncGet(SYNC_SES, null); if (!s || !s.refresh) return false;
            try { const c = syncCfg(); const r = await fetch(c.url.replace(/\/+$/, '') + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: s.refresh }) }); if (!r.ok) return false; const j = await r.json(); syncPut(SYNC_SES, { access: j.access_token, refresh: j.refresh_token, tabel: s.tabel }); return true; } catch (e) { return false; }
        }
        async function sha256hex(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return Array.from(new Uint8Array(b), x => x.toString(16).padStart(2, '0')).join(''); }
        // Kirish: tabel@... va paroldan hosil qilingan kalit (asl parol serverga yuborilmaydi)
        async function sbLogin(tabel, pw) {
            const c = syncCfg(); if (!c.url || !c.key) throw new Error('Server sozlanmagan');
            const email = 't' + cleanTabel(tabel) + '@agmk-sttb.app', pass = (await sha256hex('agmk:' + cleanTabel(tabel) + ':' + pw)).slice(0, 40);
            const base = c.url.replace(/\/+$/, '');
            let r = await fetch(base + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: pass }) });
            if (!r.ok) {
                const s = await fetch(base + '/auth/v1/signup', { method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: pass }) });
                if (!s.ok) { let t = ''; try { t = (await s.json()).msg || ''; } catch (e) {} throw new Error('Serverga kirib bo\'lmadi' + (t ? ': ' + t : '')); }
                r = await fetch(base + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, password: pass }) });
                if (!r.ok) throw new Error("Serverda email tasdiqlash yoqilgan — Supabase'da «Confirm email»ni o'chiring");
            }
            const j = await r.json(); syncPut(SYNC_SES, { access: j.access_token, refresh: j.refresh_token, tabel: cleanTabel(tabel) }); return true;
        }
        (function () {
            lockLogin = agmkExtend('lockLogin', '31-bosqich (5): Server bilan sinxronlash (Supabase)', lockLogin, o => function () {
                const t = ($id('lkTabel') || {}).value, p = ($id('lkPw') || {}).value;
                const r = o.apply(this, arguments);
                setTimeout(() => { if (syncReady() && t && p && !document.body.classList.contains('locked')) sbLogin(t, p).then(() => syncNow()).catch(e => { SYNC.err = agmkErrUz(e); syncUi(); }); }, 700);
                return r;
            });
        })();
        // ---------- Yozuvlar ----------
        function syncHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); }
        function syncStripUnit(v) {
            const o = JSON.parse(JSON.stringify(v)); delete o.gallery; delete o.rahbarImgs; delete o.kun; delete o.nextLabel;
            // v3.4: galereya va rahbariyat rasmlari — serverga yuklanganlari boshqa telefonlarga boradi (yuklanmaganlari keyingi safar)
            ['gallery', 'rahbarImgs'].forEach(k => { const L = (v[k] || []).filter(x => x && typeof x === 'object' && x.srv); if (L.length) o[k] = JSON.parse(JSON.stringify(L)); });
            if (!(o.galDel && o.galDel.length)) delete o.galDel;
            o._tamirda = v.status === 'Tamirda'; delete o.status;
            // v3.2.2: serverga yuklangan (srv) rasm va ovozlar qoladi — boshqa telefon serverdan oladi; hali yuklanmaganlari keyingi safar
            const strip = z => { ['imgs', 'files', 'audio', 'photos'].forEach(k => { if (Array.isArray(z[k])) z[k] = z[k].filter(x => !(x && typeof x === 'object' && /^idb:/.test(x.src || '') && !x.srv)); else if (z[k] && /^idb:/.test(String(z[k].src || z[k])) && !z[k].srv) delete z[k]; }); };
            (o.zams || []).forEach(z => { strip(z); (z.attempts || []).forEach(strip); });
            return o;
        }
        function syncLocal() {
            const out = [];
            vagonlarData.forEach(v => out.push({ id: 'u:' + v.id, kind: 'unit', data: syncStripUnit(v) }));
            try { ndAkts().forEach(a => out.push({ id: 'a:' + a.id, kind: 'akt', data: a })); } catch (e) {}
            try { ndDocs().forEach(d => out.push({ id: 'd:' + d.id, kind: 'nddoc', data: d })); } catch (e) {}
            try { kbTeachAll().forEach(t => out.push({ id: 't:' + t.id, kind: 'teach', data: t })); } catch (e) {}
            return out;
        }
        function syncApply(rec) {
            const d = rec.data;
            if (rec.kind === 'unit') {
                const id = +rec.id.slice(2) || rec.id.slice(2); let v = vagonlarData.find(x => String(x.id) === String(id));
                // v3.4: rasmlar birlashtiriladi — telefondagisi qoladi, boshqa telefondan kelgani qo'shiladi, o'chirilgani (galDel) hammada o'chadi
                const del = new Set([].concat((v && v.galDel) || [], d.galDel || [])), mg = (a, b) => { const L = (a || []).filter(x => x && !del.has(x.src)); (b || []).forEach(x => { if (!x || del.has(x.src)) return; const y = L.find(z => z && z.src === x.src); if (!y) L.push(x); else if (x.srv && !y.srv) y.srv = x.srv; }); return L; };
                const keep = { gallery: mg(v && v.gallery, d.gallery), rahbarImgs: mg(v && v.rahbarImgs, d.rahbarImgs) }; if (del.size) keep.galDel = [...del].slice(-500);
                const nv = Object.assign({}, d, keep); nv.status = d._tamirda ? 'Tamirda' : 'Soz'; delete nv._tamirda;
                if (v) { Object.keys(v).forEach(k => { if (!(k in nv)) delete v[k]; }); Object.assign(v, nv); } else { vagonlarData.push(nv); v = nv; }
                try { if (v.status !== 'Tamirda') recalcVagonStatus(v); } catch (e) {}
                return 'u';
            }
            if (rec.kind === 'akt') { const l = ndAkts().filter(a => a.id !== d.id); l.unshift(d); l.sort((a, b) => String(b.at).localeCompare(String(a.at))); ndSet(ND_AKT_KEY, l.slice(0, 500)); return 'a'; }
            if (rec.kind === 'nddoc') { const l = ndDocs().filter(a => a.id !== d.id); l.push(d); ndSet(ND_DOCS_KEY, l); return 'd'; }
            if (rec.kind === 'teach') { const l = kbTeachAll().filter(a => a.id !== d.id); l.unshift(d); kbTeachSave(l); return 't'; }
            return null;
        }
        async function syncNow(silent) {
            if (!syncReady() || SYNC.busy) return; const ses = syncGet(SYNC_SES, null); if (!ses || !ses.access) { SYNC.err = "Serverga kirish kerak — ilovadan chiqib, tabel va parol bilan qayta kiring"; syncUi(); return; }
            if (navigator.onLine === false && !syncCfg().lan) { SYNC.err = 'Internet yo\'q'; syncUi(); return; }
            SYNC.busy = true; syncUi();
            const st = syncGet(SYNC_ST, { hash: {}, last: '1970-01-01T00:00:00Z', msg: 0 });
            let pulled = 0, pushed = 0;
            try {
                // 1) Serverdan yangilar
                let more = true, changedUnits = false;
                while (more) {
                    const rows = await sbFetch('/rest/v1/agmk_records?select=id,kind,data,deleted,updated_at,updated_by&updated_at=gt.' + encodeURIComponent(st.last) + '&order=updated_at.asc&limit=500');
                    const LM = new Map(); if (rows && rows.length) syncLocal().forEach(x => LM.set(x.id, x));
                    (rows || []).forEach(r => {
                        const loc = LM.get(r.id), lh = loc ? syncHash(JSON.stringify(loc.data)) : null;
                        const localDirty = loc && st.hash[r.id] && lh !== st.hash[r.id];
                        if (!localDirty && !r.deleted) {
                            const k = syncApply(r); if (k === 'u') changedUnits = true; pulled++;
                            if (k === 'u') { const v = vagonlarData.find(x => 'u:' + x.id === r.id); if (v) st.hash[r.id] = syncHash(JSON.stringify(syncStripUnit(v))); } else st.hash[r.id] = syncHash(JSON.stringify(r.data));
                        }
                        st.last = r.updated_at;
                    });
                    more = rows && rows.length === 500;
                }
                if (changedUnits) { try { saveDB(false); } catch (e) { try { saveDB(); } catch (x) {} } try { refreshCurrentScreen(); } catch (e) {} }
                // 2) Mahalliy o'zgarishlarni yuborish
                const loc = syncLocal(), up = [];
                loc.forEach(x => { const h = syncHash(JSON.stringify(x.data)); if (st.hash[x.id] !== h) up.push(Object.assign({}, x, { _h: h })); });
                for (let i = 0; i < up.length; i += 200) {
                    const part = up.slice(i, i + 200);
                    await sbFetch('/rest/v1/agmk_records', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: part.map(x => ({ id: x.id, kind: x.kind, data: x.data, deleted: false, updated_by: ses.tabel })) });
                    part.forEach(x => { st.hash[x.id] = x._h; }); pushed += part.length;
                }
                loc.forEach(x => { if (!st.hash[x.id]) st.hash[x.id] = syncHash(JSON.stringify(x.data)); });
                // 3) Xabarlar
                try {
                    const ms = await sbFetch('/rest/v1/agmk_messages?select=*&to_tabel=eq.' + encodeURIComponent(ses.tabel) + '&id=gt.' + (st.msg || 0) + '&order=id.asc&limit=200');
                    for (const m of (ms || [])) {
                        st.msg = Math.max(st.msg || 0, m.id);
                        const p = (pplList().find(x => cleanTabel(x.tabel) === cleanTabel(m.from_tabel))) || { name: m.from_name || ('Tabel ' + m.from_tabel), role: '', tabel: m.from_tabel };
                        await chatAddMsg(p, { me: false, t: m.text, via: 'app' });
                        try { showToast('💬 ' + p.name + ': ' + String(m.text).slice(0, 60)); } catch (e) {}
                    }
                } catch (e) {}
                syncPut(SYNC_ST, st); SYNC.err = ''; SYNC.lastOk = Date.now(); SYNC.lastStat = { pulled: pulled, pushed: pushed };
                if (!silent && (pulled || pushed)) showToast('🔄 Sinxronlandi: ↓' + pulled + ' ↑' + pushed);
            } catch (e) { SYNC.err = agmkErrUz(e); }
            SYNC.busy = false; syncUi();
        }
        function syncLoop() { clearInterval(SYNC.timer); if (!syncReady()) return; SYNC.timer = setInterval(() => { if (!document.hidden && !document.body.classList.contains('locked')) syncNow(true); }, 20000); }
        (function () { saveDB = agmkExtend('saveDB', '31-bosqich (5): Server bilan sinxronlash (Supabase)', saveDB, o => function () { const r = o.apply(this, arguments); if (syncReady()) { clearTimeout(SYNC.pushT); SYNC.pushT = setTimeout(() => syncNow(true), 3000); } return r; }); })();
        document.addEventListener('visibilitychange', () => { if (!document.hidden && syncReady()) syncNow(true); });
        window.addEventListener('online', () => { if (syncReady()) syncNow(true); });
        // Ilova ichidan xabar yuborish (server orqali)
        async function syncSendMsg(p, text, files) { // files: [{name, mime, blob}] — server rejimida ilova ichida fayl ham boradi
            const ses = syncGet(SYNC_SES, null); if (!ses) throw new Error('Serverga kirilmagan');
            const ids = []; for (const f of (files || [])) { if (typeof srvFileUp !== 'function') throw new Error('Fayl yuborish faqat korxona serverida'); ids.push((await srvFileUp(p.tabel, f)).id); }
            await sbFetch('/rest/v1/agmk_messages', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: { from_tabel: ses.tabel, from_name: (currentUser && currentUser.name) || '', to_tabel: cleanTabel(p.tabel), text: text || '', files: ids } });
        }
        (function () {
            chatSend = agmkExtend('chatSend', '31-bosqich (5): Server bilan sinxronlash (Supabase)', chatSend, o => async function (via) {
                const p = chatP();
                if (via === 'app') {
                    const t = ($id('chatIn').value || '').trim(), files = CHAT.att.slice(); if (!t && !files.length) return;
                    try { if (files.length) showToast('⏳ Fayllar yuborilmoqda...'); await syncSendMsg(p, t, files); $id('chatIn').value = ''; CHAT.att = []; await chatAddMsg(p, { me: true, t: t, via: 'app', files: files }); } catch (e) { alert('⚠️ ' + e.message); }
                    return;
                }
                const r = await o.apply(this, arguments);
                try { if (!via && syncReady() && p && p.tabel) { const b = $id('chatViaB'); if (b && !b.querySelector('[data-app]')) { const d = document.createElement('div'); d.className = 'pk-o'; d.setAttribute('data-app', '1'); d.innerHTML = '<span class="pk-t">📲 Ilova ichida (server orqali)</span>'; d.onclick = () => { $id('chatViaM').classList.add('hidden'); chatSend('app'); }; b.querySelector('.pk-list').prepend(d); } } } catch (e) {}
                return r;
            });
        })();
        // ---------- Parametrlar: Server ----------
        function syncUi() {
            const sub = $id('set-sync-sub'); if (!sub) return;
            const c = syncCfg();
            sub.textContent = !c.url ? 'Ulanmagan' : !c.on ? "O'chirilgan" : SYNC.busy ? '🔄 Sinxronlanmoqda...' : SYNC.err ? '⚠️ ' + SYNC.err : SYNC.lastOk ? '🟢 Ulangan · ' + new Date(SYNC.lastOk).toTimeString().slice(0, 5) : '🟡 Ulanmoqda...';
            const m = $id('syncBox'); if (m && !$id('syncModal').classList.contains('hidden')) syncRender();
        }
        function syncOpen() {
            let m = $id('syncModal');
            if (!m) { m = document.createElement('div'); m.id = 'syncModal'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="syncBox"></div>'; document.body.appendChild(m); }
            syncRender(); m.classList.remove('hidden');
        }
        function syncRender() {
            const c = syncCfg(), ses = syncGet(SYNC_SES, null), st = syncGet(SYNC_ST, { hash: {} }), adm = isAdminReal();
            $id('syncBox').innerHTML = `<div class="pk-h"><b>🌐 Server (sinxronlash)</b><span onclick="$id('syncModal').classList.add('hidden')">✕</span></div>
                <div class="kws-row"><div><b>${c.on && c.url ? (SYNC.err ? '⚠️ Xato' : SYNC.lastOk ? '🟢 Ulangan' : '🟡 Ulanmoqda') : '⚪ Ulanmagan'}</b><small>${SYNC.err ? escapeHtml(SYNC.err) : SYNC.lastOk ? 'Oxirgi sinxronlash: ' + new Date(SYNC.lastOk).toLocaleTimeString() + (SYNC.lastStat ? ' · ↓' + SYNC.lastStat.pulled + ' ↑' + SYNC.lastStat.pushed : '') : (ses ? 'Hisob: tabel ' + escapeHtml(ses.tabel) : 'Kirish kerak')}</small></div></div>
                ${adm ? `<div class="pp-lbl">PROJECT URL</div><input class="pk-q" id="syncUrl" placeholder="https://xxxx.supabase.co" value="${escapeHtml(c.url)}">
                <div class="pp-lbl">ANON (PUBLIC) KEY</div><input class="pk-q" id="syncKey" placeholder="eyJhbGciOi..." value="${escapeHtml(c.key)}">
                <div class="nd-tip" style="margin:-2px 0 8px">⚠️ Faqat <b>anon</b> kalit. <b>service_role</b> kalitni hech qachon kiritmang.</div>` : `<div class="nd-tip">Server sozlamasini admin kiritadi.</div>`}
                <div class="pk-btns">${adm ? `<button class="pr" onclick="syncSave()">💾 Saqlash va ulash</button>` : ''}<button onclick="syncNow()">🔄 Hozir sinxronlash</button></div>
                ${adm && c.url ? `<div class="pk-btns"><button onclick="syncOff()">⏸ O'chirish</button><button onclick="syncCopySql()">📋 SQL skriptni nusxalash</button></div>` : adm ? `<div class="pk-btns"><button onclick="syncCopySql()">📋 SQL skriptni nusxalash</button></div>` : ''}
                <div class="kws-note">Nima sinxronlanadi: texnika pasportlari va ta'mir tarixi, aktlar arxivi, normativ hujjatlar, AI'ga o'rgatilgan javoblar, ilova ichidagi xabarlar. <b>Xodimlarning shaxsiy ma'lumotlari va rasmlar serverga chiqmaydi</b> (korxona serveriga o'tilgach ulanadi). Har 20 soniyada va har o'zgarishdan keyin yangilanadi; internet bo'lmasa ilova oddiy ishlayveradi.</div>
                <div class="kws-st">Mahalliy yozuvlar: ${Object.keys(st.hash || {}).length}</div>`;
        }
        async function syncSave() {
            const url = ($id('syncUrl').value || '').trim(), key = ($id('syncKey').value || '').trim();
            if (!/^https:\/\/[\w.-]+/.test(url)) { alert("Project URL noto'g'ri (https://... bilan boshlanadi)."); return; }
            if (!key || key.length < 30) { alert('Anon key kiriting.'); return; }
            try { const pl = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); if (pl.role === 'service_role') { alert("⛔ Bu service_role kalit! Uni ilovaga kiritish xavfli. Supabase → Settings → API bo'limidan «anon public» kalitni oling."); return; } } catch (e) {}
            syncPut(SYNC_CFG, { url: url, key: key, on: true }); SYNC.err = '';
            const pw = await uiPrompt("🔐 Serverga ulanish uchun o'z parolingizni kiriting (tabel " + ((currentUser && currentUser.tabel) || '') + "):", '');
            if (pw === null) { syncRender(); return; }
            try { await sbLogin(currentUser.tabel, pw); showToast('🟢 Serverga ulandi'); syncLoop(); syncNow(); } catch (e) { SYNC.err = agmkErrUz(e); }
            syncRender(); syncUi();
        }
        function syncOff() { const c = syncCfg(); c.on = false; syncPut(SYNC_CFG, c); clearInterval(SYNC.timer); syncRender(); syncUi(); }
        function syncCopySql() { try { navigator.clipboard.writeText(SYNC_SQL).then(() => showToast('📋 SQL nusxalandi — Supabase → SQL Editor ga qo\'ying')); } catch (e) { alert(SYNC_SQL); } }
        (function () {
            const lang = document.querySelector('#screen-settings .btn-card[onclick="i18nPick()"]');
            if (lang && !$id('set-sync-sub')) {
                const d = document.createElement('div'); d.className = 'btn-card'; d.onclick = syncOpen;
                d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🌐</span><span class="btn-text">Server (sinxronlash)<span class="set-sub" id="set-sync-sub"></span></span></div><span class="btn-arrow">›</span>`;
                lang.parentNode.insertBefore(d, lang);
            }
            syncUi(); if (syncReady()) { syncLoop(); setTimeout(() => syncNow(true), 4000); }
        })();
