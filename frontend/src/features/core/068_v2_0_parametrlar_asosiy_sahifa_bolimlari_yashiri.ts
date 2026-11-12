        // =====================================================================
        // v2.0 — Parametrlar → «🧩 Asosiy sahifa boʻlimlari»: yashirish / koʻrsatish / tartib
        //  • Admin: hamma, rol yoki aniq xodim (tabel) uchun boʻlimni yopadi — yopilgan boʻlimga ovoz, AI yoki qidiruv orqali ham kirilmaydi
        //  • Har kim: oʻziga keraksiz boʻlimni yashiradi va tartibini oʻzgartiradi (admin yopganini ocholmaydi)
        //  • Admin oʻzini hech qachon qulflab qoʻymaydi; «Parametrlar» hech kimda yashirilmaydi
        // =====================================================================
        var HOME_RULE_KEY = 'agmk_home_vis', HOME_MY_KEY = 'agmk_home_my';
        function homeRules() { const r = kvGet(HOME_RULE_KEY, null); return r && typeof r === 'object' ? Object.assign({ all: {}, role: {}, user: {} }, r) : { all: {}, role: {}, user: {} }; }
        function homeMy() { try { return JSON.parse(localStorage.getItem(HOME_MY_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function homeMySet(o) { try { localStorage.setItem(HOME_MY_KEY, JSON.stringify(o)); } catch (e) {} }
        function homeCards() { const l = $id('main-card-list'); return l ? Array.from(l.querySelectorAll(':scope > .btn-card')) : []; }
        function homeId(c) {
            if (c.dataset.hid) return c.dataset.hid;
            const ds = c.getAttribute('data-sec'), oc = c.getAttribute('onclick') || '';
            const id = ds ? 'sec:' + ds : /alert\(/.test(oc) ? 'al:' + (c.getAttribute('data-search') || '').split(' ').slice(0, 3).join('_') : 'fn:' + oc.replace(/[^\w]+/g, '_').slice(0, 48);
            c.dataset.hid = id; return id;
        }
        function homeLocked(id) { return /openSettings/.test(id); }
        function homeLabel(c) { const t = c.querySelector('.btn-text'); const i = c.querySelector('.btn-icon'); return { t: t ? (t.childNodes[0] ? t.childNodes[0].textContent : t.textContent).trim() : '', ic: i ? i.textContent : '•' }; }
        // Admin qoidasi bo'yicha yopilganmi?
        function homeRuleHidden(id, tabel) {
            if (homeLocked(id)) return false;
            tabel = cleanTabel(tabel || (currentUser && currentUser.tabel) || '');
            if (tabel === ADMIN_TABEL) return false;
            const R = homeRules(), u = (R.user[tabel] || {})[id];
            if (u === true) return false; if (u === false) return true;
            const roles = (typeof rolesOf === 'function' ? rolesOf(tabel) : []).concat(typeof isRahbar === 'function' && tabel === cleanTabel(currentUser && currentUser.tabel) && isRahbar() ? ['rahbar'] : []);
            const rv = roles.map(r => (R.role[r] || {})[id]).filter(v => v !== undefined);
            if (rv.length) return !rv.some(v => v === true);
            if (roles.length === 0 && (R.role.xodim || {})[id] !== undefined) return (R.role.xodim || {})[id] === false;
            return (R.all || {})[id] === false;
        }
        function homeHidden(id) { return homeRuleHidden(id) || (!homeLocked(id) && homeMy()[id] === false); }
        function homeApply() {
            const l = $id('main-card-list'); if (!l || !currentUser) return;
            const my = homeMy(), order = my._order || [];
            homeCards().forEach(c => { const id = homeId(c); const h = homeHidden(id); c.classList.toggle('home-hid', h); });
            if (order.length) { const cs = homeCards(); cs.sort((a, b) => { const ia = order.indexOf(homeId(a)), ib = order.indexOf(homeId(b)); return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib); }).forEach(c => l.appendChild(c)); }
        }
        // Yopilgan bo'limga boshqa yo'l bilan kirishni ham to'sish
        var HOME_FN = { 'sec:bux': 'openBux', 'sec:mm': 'openMM', 'sec:mttb': 'openMTTB', 'sec:hisob': 'openHisob' };
        function homeBlockMsg() { showToast('🔒 Bu boʻlim siz uchun yopilgan (Parametrlar → Asosiy sahifa boʻlimlari)'); }
        function homeGuardInstall() {
            if (homeGuardInstall.done) return; homeGuardInstall.done = true;
            const scrMap = {}, subMap = {};
            homeCards().forEach(c => {
                const id = homeId(c), oc = c.getAttribute('onclick') || ''; let m;
                if ((m = oc.match(/^openScreen\('([^']+)'\)/))) scrMap[m[1]] = id;
                else if ((m = oc.match(/^openSubUnits\('([^']+)'/))) subMap[m[1]] = id;
                else if ((m = oc.match(/^(\w+)\(\)$/)) && m[1] !== 'openSettings') HOME_FN[id] = m[1];
            });
            Object.keys(HOME_FN).forEach(id => { const fn = HOME_FN[id], o = window[fn]; if (typeof o !== 'function' || o._home) return; const w = function () { if (homeHidden(id)) { homeBlockMsg(); return; } return o.apply(this, arguments); }; w._home = true; window[fn] = w; });
            if (typeof openScreen === 'function') { openScreen = agmkExtend('openScreen', 'openScreen', openScreen, o => function (sid) { const id = scrMap[sid]; if (id && homeHidden(id)) { homeBlockMsg(); return; } return o.apply(this, arguments); }); }
            if (typeof openSubUnits === 'function') { openSubUnits = agmkExtend('openSubUnits', 'openSubUnits', openSubUnits, o => function (t) { const id = subMap[t]; if (id && homeHidden(id)) { homeBlockMsg(); return; } return o.apply(this, arguments); }); }
        }
        // ---------- Sozlash oynasi ----------
        var HOMEUI = { target: 'me' };
        function homeOpen() {
            const adm = isAdminReal(), E = escapeHtml, cards = homeCards(), my = homeMy(), R = homeRules(), t = HOMEUI.target;
            const tgts = [['me', '👤 Faqat men uchun (shaxsiy)']].concat(adm ? [['all', '👥 Barcha xodimlar'], ['role:xodim', '🙂 Roli yoʻq oddiy xodimlar']].concat((typeof ROLE_DEF !== 'undefined' ? ROLE_DEF : []).map(r => ['role:' + r[0], r[1] + ' ' + r[2]])).concat([['user', '🔢 Aniq xodim (tabel raqami)…']]).concat(Object.keys(R.user).map(tb => ['user:' + tb, '🔢 Tabel ' + tb])) : []);
            const val = id => { if (t === 'me') return my[id] !== false; if (t === 'all') return R.all[id] !== false; if (t.startsWith('role:')) return (R.role[t.slice(5)] || {})[id] !== false; if (t.startsWith('user:')) { const v = (R.user[t.slice(5)] || {})[id]; return v !== false; } return true; };
            const rows = cards.map((c, i) => { const id = homeId(c), L = homeLabel(c), lock = homeLocked(id), ruleH = t === 'me' && homeRuleHidden(id);
                return `<div class="home-row${ruleH ? ' dis' : ''}"><span class="home-ic">${E(L.ic)}</span><span class="home-t">${E(L.t)}${ruleH ? '<small>🔒 administrator yopgan</small>' : ''}${lock ? '<small>har doim koʻrinadi</small>' : ''}</span>
                ${t === 'me' ? `<button onclick="homeMove(${i},-1)">▲</button><button onclick="homeMove(${i},1)">▼</button>` : ''}
                <label class="home-sw"><input type="checkbox" ${val(id) ? 'checked' : ''} ${lock || ruleH ? 'disabled' : ''} onchange="homeToggle('${id}', this.checked)"><i></i></label></div>`; }).join('');
            mdl('homeModal', `<div class="px-h"><b>🧩 Asosiy sahifa boʻlimlari</b><button class="mini-btn" onclick="mdlClose('homeModal'); homeApply()">✕</button></div>
                <div class="nd-f"><label>KIM UCHUN</label><select onchange="homeTarget(this.value)">${tgts.map(x => `<option value="${x[0]}"${x[0] === t ? ' selected' : ''}>${E(x[1])}</option>`).join('')}</select></div>
                <div class="nd-tip">${t === 'me' ? 'Oʻzingizga keraksiz boʻlimlarni oʻchiring, ▲▼ bilan tartibni oʻzgartiring. Bu faqat shu telefonda.' : "Oʻchirilgan boʻlim tanlangan xodimlarga koʻrinmaydi va unga ovoz, AI yoki qidiruv orqali ham kirib boʻlmaydi. Server ulangan boʻlsa — barcha telefonlarga tarqaladi. Administratorga taʼsir qilmaydi."}</div>
                <div class="home-list">${rows}</div>${t !== 'me' && adm ? `<button class="mini-btn" style="margin-top:8px" onclick="homeReset()">↺ Shu guruh uchun hammasini ochish</button>` : ''}${t === 'me' ? `<button class="mini-btn" style="margin-top:8px" onclick="homeMySet({}); homeApply(); homeOpen()">↺ Asl holatga qaytarish</button>` : ''}`, true);
        }
        async function homeTarget(v) {
            if (v === 'user') { const tb = await uiPrompt('Xodimning tabel raqami:', ''); if (!tb) { homeOpen(); return; } const k = cleanTabel(tb); if (!k || k === ADMIN_TABEL) { alert('Notoʻgʻri tabel.'); homeOpen(); return; } const R = homeRules(); R.user[k] = R.user[k] || {}; kvSet(HOME_RULE_KEY, R); v = 'user:' + k; }
            HOMEUI.target = v; homeOpen();
        }
        function homeToggle(id, on) {
            const t = HOMEUI.target; if (homeLocked(id)) return;
            if (t === 'me') { const m = homeMy(); if (on) delete m[id]; else m[id] = false; homeMySet(m); homeApply(); return; }
            if (!isAdminReal()) { alert('🔒 Faqat administrator.'); return; }
            const R = homeRules(); const set = (o) => { if (on) o[id] = true; else o[id] = false; };
            if (t === 'all') { if (on) delete R.all[id]; else R.all[id] = false; }
            else if (t.startsWith('role:')) { const r = t.slice(5); R.role[r] = R.role[r] || {}; set(R.role[r]); }
            else if (t.startsWith('user:')) { const u = t.slice(5); R.user[u] = R.user[u] || {}; set(R.user[u]); }
            R.at = new Date().toISOString(); R.by = ADMIN_TABEL; kvSet(HOME_RULE_KEY, R); homeApply();
            try { if (typeof logPw === 'function') logPw('Asosiy sahifa boʻlimi ' + (on ? 'ochildi' : 'yopildi') + ': ' + id + ' (' + t + ')', meTabel(), ''); } catch (e) {}
        }
        function homeReset() { if (!isAdminReal()) return; const t = HOMEUI.target, R = homeRules(); if (t === 'all') R.all = {}; else if (t.startsWith('role:')) delete R.role[t.slice(5)]; else if (t.startsWith('user:')) delete R.user[t.slice(5)]; kvSet(HOME_RULE_KEY, R); homeApply(); homeOpen(); }
        function homeMove(i, d) { const cs = homeCards().map(homeId), j = i + d; if (j < 0 || j >= cs.length) return; [cs[i], cs[j]] = [cs[j], cs[i]]; const m = homeMy(); m._order = cs; homeMySet(m); homeApply(); homeOpen(); }
        // Parametrlarga karta, sinxronlash, ishga tushirish
        (function () {
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(HOME_RULE_KEY)) KV_SYNC.keys.push(HOME_RULE_KEY); } catch (e) {}
            if (typeof syncApply === 'function') { syncApply = agmkExtend('syncApply', 'syncApply', syncApply, oA => function (rec) { if (rec && rec.kind === 'kv' && rec.data && rec.data.k === HOME_RULE_KEY && String(rec.data.by) !== ADMIN_TABEL) return null; const r = oA.apply(this, arguments); if (rec && rec.kind === 'kv' && rec.data && rec.data.k === HOME_RULE_KEY) setTimeout(homeApply, 50); return r; }); }
            const th = document.querySelector('#screen-settings .btn-card[onclick="themePick()"]');
            if (th && !$id('set-home-card')) { const d = document.createElement('div'); d.className = 'btn-card'; d.id = 'set-home-card'; d.setAttribute('onclick', 'homeOpen()'); d.innerHTML = `<div class="btn-card-content"><span class="btn-icon">🧩</span><span class="btn-text">Asosiy sahifa boʻlimlari<span class="set-sub">Yashirish, koʻrsatish va tartib${''}</span></span></div><span class="btn-arrow">›</span>`; th.parentNode.insertBefore(d, th.nextSibling); }
            setTimeout(() => { homeGuardInstall(); homeApply(); }, 300);
            if (typeof setSessionUser === 'function') { setSessionUser = agmkExtend('setSessionUser', 'setSessionUser', setSessionUser, o => function () { const r = o.apply(this, arguments); setTimeout(homeApply, 50); return r; }); }
            if (typeof openScreen === 'function') { openScreen = agmkExtend('openScreen', 'openScreen', openScreen, o2 => function (sid) { const r = o2.apply(this, arguments); if (sid === 'screen-main') setTimeout(homeApply, 30); return r; }); }
            // AI chat va qidiruv: yopilgan bo'limni ochmasin
            if (typeof filterMainMenu === 'function') { filterMainMenu = agmkExtend('filterMainMenu', 'AI chat va qidiruv: yopilgan boʼlimni ochmasin', filterMainMenu, o3 => function () { const r = o3.apply(this, arguments); homeCards().forEach(c => { if (homeHidden(homeId(c))) c.style.display = 'none'; }); return r; }); }
        })();

