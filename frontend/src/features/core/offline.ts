
        // =====================================================================
        // v3.2.1 — 📴 SERVER BILAN HAM, SERVERSIZ HAM
        //  • Server topilmasa (7 soniya) — shu telefondagi hisob bilan oflayn kirish; hamma ishlar telefonda saqlanadi.
        //  • Oflayn paytda roʻyxatdan oʻtish (shtat roʻyxatidagi xodim) — soʻrov server topilganda oʻzi yuboriladi.
        //  • Har 15 soniyada server qidiriladi; topilishi bilan sessiya tiklanadi (yoki shu kirishdagi parol bilan qayta kiriladi —
        //    parol faqat xotirada, telefonga yozilmaydi) va oflayn kiritilgan barcha maʼlumotlar sinxronlanadi.
        //  • Sinxronlashga qoʻshildi: xodimlar kartalari (telefon, tugʻilgan sana va h.k.; oklad — yoʻq), blanka hujjatlari
        //    (nosozlik, priyom, razukomplektovka, kalkulyatsiya) va ularning oʻchirilishi.
        // =====================================================================
        var OFF = { on: false, t: 0, cred: null, busy: false, srvLogin: false };
        var OFF_REG_KEY = 'agmk_off_signup', CX_DEL_KEY = 'agmk_calc_del';
        (function () {
            const c = document.createElement('style');
            c.textContent = `#offPill{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom));z-index:9000;background:#7c2d12;color:#fff;border:1px solid #fb923c;border-radius:20px;padding:7px 14px;font-size:12.5px;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,.45);cursor:pointer;white-space:nowrap}
                #offPill.ok{background:#14532d;border-color:#22c55e}`;
            document.head.appendChild(c);
        })();
        function offPill(txt, ok) {
            let p = $id('offPill');
            if (!txt) { if (p) p.remove(); return; }
            if (!p) { p = document.createElement('div'); p.id = 'offPill'; p.onclick = () => { showToast('🔎 Server qidirilmoqda…'); offTick(true); }; document.body.appendChild(p); }
            p.textContent = txt; p.classList.toggle('ok', !!ok);
        }
        function offStart(tabel, pw) {
            OFF.cred = pw ? { tabel: cleanTabel(tabel), pw: pw } : OFF.cred; OFF.on = true;
            clearInterval(OFF.t); OFF.t = setInterval(() => offTick(false), 15000);
            offPill('📴 Oflayn — server topilganda oʻzi sinxronlanadi');
            setTimeout(() => offTick(false), 1500);
        }
        async function offDerive(t, pw) { return (await sha256hex('agmk:' + cleanTabel(t) + ':' + pw)).slice(0, 40); }
        async function offTick(manual) {
            if (!OFF.on || OFF.busy || document.body.classList.contains('locked')) return;
            if (!(typeof srvOn === 'function' && srvOn())) { offStop(); return; }
            OFF.busy = true;
            try {
                const me = meTabel(); let ok = false, why = '';
                // 1) oflayn roʻyxatdan oʻtish soʻrovi
                const q = kvGet(OFF_REG_KEY, null);
                if (q && q.t === me && !q.sent) {
                    try { await sbFetch('/auth/v1/signup', { method: 'POST', anon: true, timeout: 8000, body: { email: 't' + q.t + '@agmk-sttb.app', password: q.d, data: { name: q.name, lavozim: q.lav } } }); q.sent = new Date().toISOString(); delete q.d; kvSet(OFF_REG_KEY, q); showToast('📨 Roʻyxatdan oʻtish soʻrovi serverga yuborildi — administrator tasdiqlagach sinxronlanadi'); }
                    catch (e) { if (/422|allaqachon/.test(e.message)) { q.sent = 'exists'; delete q.d; kvSet(OFF_REG_KEY, q); } else throw e; }
                }
                // 2) sessiya: avval saqlangan (shu xodimniki boʻlsa), boʻlmasa — shu kirishdagi parol bilan
                const s = syncGet(SYNC_SES, null);
                if (s && s.tabel === me && s.refresh) { try { ok = await sbRefresh(); } catch (e) {} }
                if (!ok && OFF.cred && OFF.cred.tabel === me) {
                    try { await sbLogin(OFF.cred.tabel, OFF.cred.pw); ok = true; }
                    catch (e) { if (!e.net) { why = e.message; if (!/kutmoqda|pending/i.test(e.message)) OFF.cred = null; } }
                }
                if (ok) {
                    OFF.on = false; OFF.srvLogin = true; clearInterval(OFF.t);
                    try { const a = getAccounts(); if (a[me] && OFF.cred) { a[me].server = true; saveAccounts(a); } } catch (e) {}
                    OFF.cred = null; offPill('🔄 Server topildi — sinxronlanmoqda…', true);
                    try { syncLoop(); await syncNow(true); } catch (e) {}
                    window.dispatchEvent(new CustomEvent('agmk:login', { detail: { server: true, reconnect: true } }));
                    const st = SYNC.lastStat || {}; offPill(''); showToast('✅ Server bilan sinxronlandi' + (st.pushed || st.pulled ? ': yuborildi ' + (st.pushed || 0) + ', olindi ' + (st.pulled || 0) : ''));
                    try { aiLog('Oflayndan keyin server bilan sinxronlandi'); } catch (e) {}
                } else if (why) offPill('📴 Oflayn — ' + why.slice(0, 60));
                else if (manual) showToast('📴 Server hali topilmadi');
            } catch (e) { if (manual) showToast('📴 Server hali topilmadi'); }
            finally { OFF.busy = false; }
        }
        function offStop() { OFF.on = false; clearInterval(OFF.t); offPill(''); }
        // Oflayn roʻyxatdan oʻtish (server rejimida, server topilmaganda)
        async function offRegister(t, pw, name, lav, item) {
            const a = getAccounts(), rec = makePwRec(pw); rec.created = new Date().toISOString(); rec.offline = true; a[t] = rec; saveAccounts(a);
            kvSet(OFF_REG_KEY, { t: t, d: await offDerive(t, pw), name: name || item.name, lav: lav || item.lavozim || '', at: new Date().toISOString() });
            try { logPw("Roʻyxatdan oʻtdi (oflayn)", t, item.name); } catch (e) {}
            setSessionUser(item); hideLock(); offStart(t, pw);
            alert("📴 Server topilmadi — siz shu telefonda roʻyxatdan oʻtdingiz va ishlayverasiz.\n\nServer topilganda roʻyxatdan oʻtish soʻrovi oʻzi yuboriladi; administrator tasdiqlagach, kiritgan hamma narsangiz serverga oʻtadi.");
        }
        // ---------- Qoʻshimcha sinxronlash: xodim kartalari, blanka hujjatlari ----------
        var OFF_KV_BY = /^(agmk_roles|agmk_sec_cfg|agmk_home|agmk_map|agmk_yg|agmk_georef)/; // «by» faqat administrator yozadigan kalitlarda tekshiriladi
        var OFF_XLOCAL = ['id', 'photo', 'gallery', 'oklad', 'seh', 'roster'];
        // Shaxsiy maʼlumotlar (tugʻilgan sana, oila, pasport, manzil …) — faqat egasi, administrator, kadrlar va rahbariyat telefonida; server ham boshqalarga yubormaydi
        var OFF_PD = ['birthDate', 'yil', 'oilaviy', 'oilaAzolari', 'spravka', 'workHistory', 'yutuqlar', 'hafsanalar', 'tatillar', 'izoh', 'passport', 'address', 'manzil', 'email'];
        function offPdCan(t) { try { return isAdmin() || hasRole('kadr') || hasRole('rahbar') || (t && cleanTabel(t) === cleanTabel(meTabel())); } catch (e) { return false; } }
        function offXData(it) { const pd = offPdCan(it.tabel), d = {}; Object.keys(it).filter(k => !OFF_XLOCAL.includes(k) && it[k] !== undefined && (pd || !OFF_PD.includes(k))).sort().forEach(k => { d[k] = it[k]; }); return d; } // kalitlar tartiblangan — telefonlar oʻrtasida bir xil iz (qayta-qayta yuborilmaydi)
        function cxDels() { const v = kvGet(CX_DEL_KEY, null); return v && Array.isArray(v.ids) ? v : { ids: [] }; }
        (function () {
            if (typeof syncLocal === 'function') syncLocal = agmkExtend('syncLocal', 'v3.2.1: xodim kartalari va blanka hujjatlari ham sinxronlanadi', syncLocal, o => function () {
                const out = o.apply(this, arguments);
                // kv yozuvlaridagi «by» (kim yubordi) har telefonda boshqacha — iz bir xil boʻlishi uchun faqat rollar/xavfsizlikda qoladi (aks holda telefonlar bir-biriga qayta-qayta yuboradi)
                try { out.forEach(x => { if (x.kind === 'kv' && x.data && !OFF_KV_BY.test(x.data.k)) x.data = { k: x.data.k, v: x.data.v }; }); } catch (e) {}
                try { const L = allXodims(), C = {}; L.forEach(r => { const t = cleanTabel(r.item.tabel); if (t) C[t] = (C[t] || 0) + 1; }); L.forEach(r => { const t = cleanTabel(r.item.tabel); if (t && r.item.name && C[t] === 1) out.push({ id: 'x:' + t, kind: 'xodim', data: offXData(r.item) }); }); } catch (e) {} // takror tabel (masalan 3900) — tuzatilguncha sinxronlanmaydi
                try { if (typeof cxDB === 'function') { const D = new Set(cxDels().ids.map(x => x.id)); (cxDB().docs || []).forEach(d => { if (d && d.id && !D.has(d.id)) out.push({ id: 'c:' + d.id, kind: 'cxdoc', data: d }); }); cxDels().ids.forEach(x => out.push({ id: 'c:' + x.id, kind: 'cxdoc', data: { id: x.id, del: true, at: x.at } })); } } catch (e) {}
                return out;
            });
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.2.1: xodim kartalari va blanka hujjatlari', syncApply, o => function (rec) {
                if (rec && rec.kind === 'xodim' && rec.data) {
                    const d = rec.data, t = cleanTabel(d.tabel || String(rec.id).slice(2)); if (!t) return null;
                    const f = findXodimsByTabel(t);
                    if (f.length === 1) { const it = f[0].item; Object.keys(d).forEach(k => { if (!OFF_XLOCAL.includes(k)) it[k] = d[k]; }); if (rec.pd === 0 && !offPdCan(t)) OFF_PD.forEach(k => { delete it[k]; }); rec.data = offXData(it); } // iz mahalliy nusxa bilan bir xil — qayta yuborilmaydi
                    else if (!f.length) { const key = (d.posNo && typeof posByNo === 'function' && posByNo(d.posNo) ? unitById(posByNo(d.posNo).u).key : 'Boshqarma'); let mx = 0; allXodims().forEach(z => { if (+z.item.id > mx && +z.item.id < 1e12) mx = +z.item.id; }); (sectionItemsDB.xodim[key] = sectionItemsDB.xodim[key] || []).push(Object.assign({ photo: null, gallery: [] }, d, { id: mx + 1, seh: key })); }
                    clearTimeout(OFF.xSave); OFF.xSave = setTimeout(() => { try { saveDB(false); } catch (e) {} }, 400);
                    return 'x';
                }
                if (rec && rec.kind === 'cxdoc' && rec.data && typeof cxDB === 'function') {
                    const d = rec.data, all = cxDB(); all.docs = (all.docs || []).filter(x => x.id !== d.id);
                    if (d.del) { const T = cxDels(); if (!T.ids.some(x => x.id === d.id)) { T.ids.push({ id: d.id, at: d.at || new Date().toISOString() }); kvSet(CX_DEL_KEY, T); } }
                    else if (!cxDels().ids.some(x => x.id === d.id)) all.docs.push(d);
                    cxSave(all); return 'c';
                }
                return o.apply(this, arguments);
            });
            // Blanka hujjati oʻchirilganda — boshqa telefonlarda ham oʻchadi
            if (typeof cxDel === 'function') cxDel = agmkExtend('cxDel', 'v3.2.1: oʻchirish sinxronlanadi', cxDel, o => async function () {
                const id = CXV.cur && CXV.cur.id, had = id && (cxDB().docs || []).some(x => x.id === id);
                const r = await o.apply(this, arguments);
                try { if (had && !(cxDB().docs || []).some(x => x.id === id)) { const T = cxDels(); T.ids.push({ id: id, at: new Date().toISOString() }); kvSet(CX_DEL_KEY, T); if (syncReady()) { clearTimeout(SYNC.pushT); SYNC.pushT = setTimeout(() => syncNow(true), 2000); } } } catch (e) {}
                return r;
            });
            // Blanka saqlanganda — tezda serverga
            if (typeof cxStore === 'function') cxStore = agmkExtend('cxStore', 'v3.2.1: saqlangach sinxronlash', cxStore, o => function () { const r = o.apply(this, arguments); try { if (syncReady()) { clearTimeout(SYNC.pushT); SYNC.pushT = setTimeout(() => syncNow(true), 2500); } } catch (e) {} return r; });
            // Kirish turlari: server orqali kirganda — belgi; PIN yoki saqlangan sessiya bilan ochilganda ham server qidiriladi
            window.addEventListener('agmk:login', e => { if (e.detail && e.detail.server) { OFF.srvLogin = true; if (!e.detail.reconnect) offStop(); } });
            if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.2.1: oflayn kirishdan keyin server qidirish', hideLock, o => function () {
                const r = o.apply(this, arguments);
                OFF.srvLogin = false;
                setTimeout(() => { try { if (!OFF.srvLogin && !OFF.on && typeof srvOn === 'function' && srvOn() && meTabel()) offStart(meTabel(), null); } catch (e) {} }, 4000);
                return r;
            });
            if (typeof logout === 'function') logout = agmkExtend('logout', 'v3.2.1: chiqishda oflayn rejim toʻxtaydi', logout, o => async function () { const r = await o.apply(this, arguments); try { if (document.body.classList.contains('locked')) { offStop(); OFF.cred = null; const ss = syncGet(SYNC_SES, null); if (ss) { ss.at = 0; syncPut(SYNC_SES, ss); } } } catch (e) {} return r; }); // chiqqach qayta kirishda parol albatta server/telefon tomonidan tekshiriladi
        })();

