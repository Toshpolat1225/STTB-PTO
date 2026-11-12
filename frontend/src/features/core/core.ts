
        // =====================================================================
        // v3.4 — ILOVA YADROSI («suyak»): modullar, sinov guruhi, sinxron to'plamlar, xatolar jurnali
        //  Yangi bo'limlar (dispetcherlik, iqtisodiyot …) shu yadro ustiga quriladi:
        //   agmkModule({...}) — bosh menyuga karta (eski kartalar joyidan siljimaydi), rol va sinov guruhi bo'yicha
        //   agmkStore('nom')  — yozuvlar to'plami: telefonda saqlanadi, server orqali boshqa telefonlarga boradi
        //   flagOn('nom')     — funksiya o'chiq / sinov guruhida / hammaga (administrator boshqaradi)
        //   xatolar jurnali   — ilovadagi har bir kutilmagan xato yoziladi va serverga (boshqaruv paneliga) boradi
        // =====================================================================
        var AGMK_MODS = [], AGMK_STORES = {}, FLAG_KEY = 'agmk_flags', ERR_KEY = 'agmk_errlog';

        // ---------- Sinov guruhi (funksiya bayroqlari) ----------
        function flagCfg() { const c = kvGet(FLAG_KEY, null); return c && typeof c === 'object' ? c : {}; }
        function flagMode(name) { const c = flagCfg()[name], m = AGMK_MODS.find(x => x.flag === name); return (c && c.mode) || (m && m.def) || 'off'; }
        function flagOn(name) {
            if (!name) return true;
            const mode = flagMode(name);
            if (mode === 'all') return true;
            if (mode !== 'pilot') return false;
            try { if (isAdmin()) return true; const t = cleanTabel(meTabel()); return !!t && ((flagCfg()[name] || {}).users || []).map(cleanTabel).includes(t); } catch (e) { return false; }
        }
        function flagSet(name, mode, users) {
            if (!isAdminReal()) return false;
            const c = flagCfg(); c[name] = { mode: mode, users: (users || []).map(cleanTabel).filter(Boolean), at: new Date().toISOString(), by: meTabel() };
            kvSet(FLAG_KEY, c); modRefresh(); return true;
        }

        // ---------- Modullar: bosh menyuga karta ----------
        function agmkModule(m) {
            if (!m || !m.id || AGMK_MODS.some(x => x.id === m.id)) return;
            AGMK_MODS.push(Object.assign({ icon: '🧩', search: '', roles: null, flag: null, def: 'off' }, m));
            modRefresh();
        }
        function modAllowed(m) {
            if (m.flag && !flagOn(m.flag)) return false;
            if (m.roles && m.roles.length) { try { if (!(isAdmin() || m.roles.some(r => hasRole(r)))) return false; } catch (e) { return false; } }
            return true;
        }
        function modRefresh() {
            const list = $id('main-card-list'); if (!list) return;
            AGMK_MODS.forEach(m => {
                if (m.card === false) return; // funksiya mavjud ekrandagi yorliq sifatida (alohida karta yo'q)
                const key = 'mod-' + m.id, card = list.querySelector('[data-sec="' + key + '"]'), ok = (typeof currentUser !== 'undefined' && currentUser) ? modAllowed(m) : false;
                if (ok && !card) mainCard(key, m.icon, m.title, (m.search || m.title).toLowerCase(), () => { try { m.open(); } catch (e) { errLog('modul', e && e.message, e && e.stack); } });
                else if (!ok && card) card.remove();
            });
        }

        // ---------- Sinxron to'plamlar ----------
        // Har yozuv: { id, upd (oxirgi o'zgarish vaqti), by (kim), ... }; o'chirilgani — { id, del: true, upd } (boshqa telefonlarda ham o'chishi uchun)
        // opt.roles — yozish va yuborish huquqi (server ham shunday tekshiradi); bo'sh — hamma
        function agmkStore(name, opt) {
            if (!/^[a-z]{2,12}$/.test(name)) throw new Error('to\'plam nomi noto\'g\'ri: ' + name);
            if (AGMK_STORES[name]) return AGMK_STORES[name];
            const key = 'agmk_m_' + name, subs = [];
            const load = () => { const d = kvGet(key, null); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; };
            const save = d => { kvSet(key, d); subs.forEach(f => { try { f(); } catch (e) { console.error(e); } }); };
            const S = {
                name: name, roles: (opt && opt.roles) || null,
                canWrite() { if (!this.roles) return true; try { return isAdmin() || this.roles.some(r => hasRole(r)); } catch (e) { return false; } },
                all() { return Object.values(load()).filter(x => x && !x.del); },
                get(id) { const x = load()[id]; return x && !x.del ? x : null; },
                put(o) {
                    if (!this.canWrite()) throw new Error('Bu maʼlumotni oʻzgartirishga huquqingiz yoʻq');
                    const d = load(), x = Object.assign({}, o); if (!x.id) x.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
                    x.upd = new Date().toISOString(); x.by = meTabel(); d[x.id] = x; save(d); storePush(); return x;
                },
                del(id) { if (!this.canWrite()) throw new Error('Bu maʼlumotni oʻchirishga huquqingiz yoʻq'); const d = load(); if (!d[id]) return; d[id] = { id: id, del: true, upd: new Date().toISOString(), by: meTabel() }; save(d); storePush(); },
                on(f) { subs.push(f); },
                _raw: load, _apply(x) { const d = load(), cur = d[x.id]; if (cur && String(cur.upd || '') > String(x.upd || '')) return false; d[x.id] = x; save(d); return true; }
            };
            return (AGMK_STORES[name] = S);
        }
        function storePush() { try { if (typeof syncReady === 'function' && syncReady()) { clearTimeout(SYNC.pushT); SYNC.pushT = setTimeout(() => syncNow(true), 2000); } } catch (e) {} }
        (function () {
            if (typeof syncLocal === 'function') syncLocal = agmkExtend('syncLocal', 'v3.4: modul to\'plamlari', syncLocal, o => function () {
                const out = o.apply(this, arguments);
                // administrator sozlamasi (sinov guruhi) — faqat administrator yuboradi
                try { if (!isAdminReal()) { const i = out.findIndex(x => x.id === 'kv:' + FLAG_KEY); if (i >= 0) out.splice(i, 1); } } catch (e) {}
                Object.values(AGMK_STORES).forEach(S => { if (!S.canWrite()) return; Object.values(S._raw()).forEach(x => { if (x && x.id) out.push({ id: 'm:' + S.name + ':' + x.id, kind: 'mod', data: x }); }); });
                return out;
            });
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.4: modul to\'plamlari', syncApply, o => function (rec) {
                if (rec && rec.kind === 'mod' && rec.data) {
                    const m = /^m:([a-z]{2,12}):(.+)$/.exec(String(rec.id)); if (!m) return null;
                    agmkStore(m[1])._apply(rec.data); // telefondagisi yangiroq bo'lsa — u qoladi va keyingi yuborishda serverga qaytadi
                    return 'm';
                }
                const r = o.apply(this, arguments);
                if (rec && rec.kind === 'kv' && rec.data && rec.data.k === FLAG_KEY) setTimeout(modRefresh, 0);
                return r;
            });
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(FLAG_KEY)) KV_SYNC.keys.push(FLAG_KEY); } catch (e) {}
            if (typeof openScreen === 'function') openScreen = agmkExtend('openScreen', 'v3.4: modul kartalari', openScreen, o => function (id) { const r = o.apply(this, arguments); if (id === 'screen-main') modRefresh(); return r; });
            window.addEventListener('agmk:login', () => setTimeout(modRefresh, 500));
            // Server lavozimdan aniqlagan rollar (bosh buxgalter — «bux», boshqarma boshlig'i — «rahbar» …) ilovada ham hisobga olinadi
            if (typeof hasRole === 'function') hasRole = agmkExtend('hasRole', 'v3.4: server bergan rollar', hasRole, o => function (r) {
                if (o.apply(this, arguments)) return true;
                try { const s = syncGet(SYNC_SES, null); return !!(s && s.tabel && cleanTabel(s.tabel) === cleanTabel(meTabel()) && (s.sroles || []).includes(r)); } catch (e) { return false; }
            });
        })();

        // ---------- Xatolar jurnali ----------
        var ERRS = { t: 0, busy: false };
        function errLog(kind, msg, stack) {
            try {
                const m = String(msg || '').slice(0, 300); if (!m || /^Script error\.?$|ResizeObserver loop/.test(m)) return;
                let L; try { L = JSON.parse(localStorage.getItem(ERR_KEY) || '[]'); } catch (e) { L = []; } if (!Array.isArray(L)) L = [];
                const scr = (document.querySelector('.screen.active') || {}).id || '', last = L[L.length - 1], at = new Date().toISOString();
                if (last && last.m === m && last.scr === scr) { last.n = (last.n || 1) + 1; last.at = at; last.sent = 0; }
                else L.push({ at: at, v: typeof AGMK_VERSION !== 'undefined' ? AGMK_VERSION : '', k: kind, m: m, s: String(stack || '').split('\n').slice(0, 4).join('\n').slice(0, 600), scr: scr, n: 1, sent: 0 });
                localStorage.setItem(ERR_KEY, JSON.stringify(L.slice(-100)));
                clearTimeout(ERRS.t); ERRS.t = setTimeout(errSend, 5000);
            } catch (e) {}
        }
        async function errSend() {
            if (ERRS.busy) return; let L; try { L = JSON.parse(localStorage.getItem(ERR_KEY) || '[]'); } catch (e) { return; }
            const U = L.filter(x => !x.sent); if (!U.length) return;
            try { if (!(typeof syncReady === 'function' && syncReady() && syncGet(SYNC_SES, null))) return; } catch (e) { return; }
            ERRS.busy = true;
            try { await sbFetch('/api/log/v1', { method: 'POST', body: { list: U.slice(-20).map(x => ({ at: x.at, v: x.v, k: x.k, m: x.m, s: x.s, scr: x.scr, n: x.n })) } }); U.forEach(x => { x.sent = 1; }); localStorage.setItem(ERR_KEY, JSON.stringify(L)); } catch (e) {} finally { ERRS.busy = false; }
        }
        window.addEventListener('error', e => errLog('xato', e && e.message, e && e.error && e.error.stack));
        window.addEventListener('unhandledrejection', e => { const r = e && e.reason; errLog('vaʼda', r && r.message ? r.message : String(r), r && r.stack); });
        window.addEventListener('agmk:login', () => setTimeout(errSend, 4000));

        // ---------- Administrator: modullar va xatolar ----------
        function coreFlagsOpen() {
            if (!isAdmin()) return;
            const E = escapeHtml, M = AGMK_MODS.filter(m => m.flag), c = flagCfg();
            const rows = M.length ? M.map(m => { const f = c[m.flag] || { mode: m.def || 'off', users: [] }; return `<div class="cf-row"><b>${m.icon} ${E(m.title)}</b><small>${E(m.desc || '')}</small>
                <select id="cf_m_${m.flag}"><option value="off"${flagMode(m.flag) === 'off' ? ' selected' : ''}>⛔ Oʻchiq</option><option value="pilot"${flagMode(m.flag) === 'pilot' ? ' selected' : ''}>🧪 Sinov guruhi</option><option value="all"${flagMode(m.flag) === 'all' ? ' selected' : ''}>✅ Hammaga</option></select>
                <input id="cf_u_${m.flag}" placeholder="Sinov guruhi: tabel raqamlari, vergul bilan" value="${E((f.users || []).join(', '))}"></div>`; }).join('') : '<p class="cf-empty">Hozircha sinovdagi funksiya yoʻq.</p>';
            mdl('cfMdl', `<h3>🧩 Yangi funksiyalar — sinov guruhi</h3><p class="cf-hint">Yangi boʻlim avval sinov guruhida ishlaydi (administrator doim koʻradi). Kamchilik chiqsa — «Oʻchiq», tayyor boʻlsa — «Hammaga».</p>${rows}
                <div class="pk-btns"><button onclick="mdlClose('cfMdl')">Yopish</button>${M.length ? '<button class="pr" onclick="coreFlagsSave()">Saqlash</button>' : ''}</div>`);
        }
        function coreFlagsSave() {
            AGMK_MODS.filter(m => m.flag).forEach(m => { const s = $id('cf_m_' + m.flag), u = $id('cf_u_' + m.flag); if (s) flagSet(m.flag, s.value, String((u || {}).value || '').split(/[\s,;]+/)); });
            mdlClose('cfMdl'); showToast('🧩 Saqlandi'); storePush();
        }
        function coreErrOpen() {
            if (!isAdmin()) return;
            let L; try { L = JSON.parse(localStorage.getItem(ERR_KEY) || '[]'); } catch (e) { L = []; }
            const E = escapeHtml;
            mdl('ceMdl', `<h3>🐞 Xatolar jurnali (shu telefon)</h3><p class="cf-hint">Ilovadagi kutilmagan xatolar oʻzi yoziladi va serverga (boshqaruv paneli → jurnal) yuboriladi. Shaxsiy maʼlumot yozilmaydi.</p>
                ${L.length ? '<div class="ce-list">' + L.slice().reverse().map(x => `<div class="ce-row"><small>${E(typeof fmtDT === 'function' ? fmtDT(x.at) : x.at)} · v${E(x.v)} · ${E(x.scr || '')}${x.n > 1 ? ' · ×' + x.n : ''}${x.sent ? ' · ✓ serverda' : ''}</small><div>${E(x.m)}</div></div>`).join('') + '</div>' : '<p class="cf-empty">✅ Xato qayd etilmagan.</p>'}
                <div class="pk-btns"><button onclick="mdlClose('ceMdl')">Yopish</button>${L.length ? '<button onclick="localStorage.removeItem(ERR_KEY);mdlClose(\'ceMdl\');showToast(\'Tozalandi\')">Tozalash</button>' : ''}</div>`);
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = '.cf-row{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08)}.cf-row small,.cf-hint{opacity:.75;font-size:12.5px;line-height:1.4}.cf-row select,.cf-row input{padding:8px;border-radius:8px}.cf-empty{opacity:.7;padding:12px 0}.ce-list{max-height:55vh;overflow:auto}.ce-row{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px;word-break:break-word}.ce-row small{opacity:.7}';
            document.head.appendChild(st);
            const card = document.querySelector('#screen-settings .btn-card[onclick="exportBundleFile()"]'); if (!card) return;
            card.insertAdjacentHTML('beforebegin', '<div class="btn-card set-admin hidden" id="cfCard" onclick="coreFlagsOpen()"><div class="btn-card-content"><span class="btn-icon">🧩</span><span class="btn-text">Yangi funksiyalar (sinov guruhi)</span></div><span class="btn-arrow">›</span></div>'
                + '<div class="btn-card set-admin hidden" id="ceCard" onclick="coreErrOpen()"><div class="btn-card-content"><span class="btn-icon">🐞</span><span class="btn-text">Xatolar jurnali</span></div><span class="btn-arrow">›</span></div>');
        })();

