        /* ===== 29-bosqich: Dizayn mavzulari + bosh sahifa paneli ===== */
        var AGMK_THEMES = [
            ['classic', 'STTB Klassik', "Asl dizayn — barcha tuzatishlar bilan", '#0b0f19', '#0ea5e9'],
            ['gold', 'Oltin Magistral', "To'q ko'k va emblema oltini, serif sarlavhalar — rahbariyat taqdimoti uchun", '#0a1228', '#d4af37'],
            ['copper', 'Mis Oqimi', "Grafit va eritilgan mis — AGMK metallurgiya ruhi, plitkali menyu", '#181412', '#e07a3a'],
            ['neon', 'Neon Rels', "Tungi kiber-temir yo'l, neon nurli plitkalar", '#0e0822', '#22d3ee'],
            ['control', 'Dispetcherlik Pulti', "Chizma to'r, raqamli bo'limlar va signal chiroqlari", '#071a30', '#facc15'],
            ['aurora', 'Tong Sahar', "Zumrad shafaq, yumshoq shisha plitkalar — ko'zni charchatmaydi", '#081e1c', '#34d399']
        ];
        var AGMK_THEME_KEY = 'agmk_theme_' + (window.AGMK_THEME_DEFAULT || 'classic');
        function themeGet() {
            let t = null; try { t = localStorage.getItem(AGMK_THEME_KEY); } catch (e) {}
            if (!t || !AGMK_THEMES.some(x => x[0] === t)) t = window.AGMK_THEME_DEFAULT || 'classic';
            return t;
        }
        function themeApply(t, save) {
            if (!AGMK_THEMES.some(x => x[0] === t)) t = 'classic';
            document.body.setAttribute('data-theme', t);
            if (save) { try { localStorage.setItem(AGMK_THEME_KEY, t); } catch (e) {} }
            const th = AGMK_THEMES.find(x => x[0] === t);
            const sub = $id('set-theme-sub'); if (sub) sub.textContent = th ? th[1] : '';
            const mc = document.querySelector('meta[name="theme-color"]'); if (mc && th) mc.setAttribute('content', th[3]);
            dashRender();
        }
        function themePick() {
            let m = $id('themeModal');
            if (!m) { m = document.createElement('div'); m.id = 'themeModal'; m.className = 'modal-overlay hidden pk-ov'; m.onclick = e => { if (e.target === m) m.classList.add('hidden'); }; m.innerHTML = '<div class="pk-box" id="themeBox"></div>'; document.body.appendChild(m); }
            const cur = themeGet();
            $id('themeBox').innerHTML = `<div class="pk-h"><b>🎨 Dizayn mavzusi</b><span onclick="$id('themeModal').classList.add('hidden')">✕</span></div><div class="th-list">` +
                AGMK_THEMES.map(([k, n, d, bg, ac]) => `<div class="th-opt${cur === k ? ' on' : ''}" onclick="themeApply('${k}', true); themePick(); showToast('🎨 ${n.replace(/'/g, "\\'")}')">
                    <div class="th-sw" data-theme="${k}" style="background-color:${bg}"><i style="background:${ac}"></i></div>
                    <div><b>${n}</b><small>${d}</small></div>${cur === k ? '<span class="th-ck">✓</span>' : ''}</div>`).join('') +
                `</div><div class="nd-tip">Mavzu faqat ko'rinishni o'zgartiradi. Ma'lumotlar, aktlar va sozlamalar o'zgarmaydi.</div>`;
            const h = document.querySelector('#screen-main > div'); const bi = h && h.style.backgroundImage;
            const cs = $id('themeBox').querySelector('.th-sw[data-theme="classic"]'); if (cs && bi) cs.style.backgroundImage = bi;
            m.classList.remove('hidden');
        }

        /* --- Bosh sahifa paneli --- */
        var DASH_T = null;
        function dashCount(list) {
            const r = { all: list.length, bad: 0, near: 0, rep: 0 };
            list.forEach(v => { if (v.status === "Ta'mir talab") r.bad++; else if (v.status === 'Yaqin') r.near++; else if (v.status === 'Tamirda') r.rep++; });
            return r;
        }
        function dashRender() {
            const t = document.body.getAttribute('data-theme');
            let p = $id('dashPanel');
            const list = $id('main-card-list'); if (!list) return;
            if (!p) { p = document.createElement('div'); p.id = 'dashPanel'; list.parentNode.insertBefore(p, list); }
            if (!t || t === 'classic') { p.innerHTML = ''; return; }
            let data = []; try { data = (typeof vagonlarData !== 'undefined' && vagonlarData) || []; } catch (e) {}
            const groups = [
                ['🚃', 'Vagonlar', data.filter(v => !v.kind), "openScreen('screen-vagonlar')"],
                ['🚂', 'Lokomotiv', data.filter(v => v.kind === 'lok'), 'openLokScreen()'],
                ['🛠️', "Yo'l texn.", data.filter(v => v.kind === 'yol'), 'openYolScreen()'],
                ['🚜', 'Avtotraktor', data.filter(v => v.kind === 'avto'), 'openAvtoScreen()']
            ];
            const d = new Date(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
            const oy = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'][d.getMonth()];
            const kun = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][d.getDay()];
            const hi = d.getHours() < 5 ? 'Xayrli tun' : d.getHours() < 12 ? 'Xayrli tong' : d.getHours() < 18 ? 'Xayrli kun' : 'Xayrli kech';
            let nm = ''; try { nm = (currentUser && currentUser.name && currentUser.name !== 'Mehmon') ? currentUser.name : ''; } catch (e) {}
            const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
            const LG = (typeof I18N !== 'undefined' && I18N.lang) || 'uz';
            const TX = ({ uz: { rep: "ta'mir", ok: 'soz', need: "Ta'mir talab", units: 'ta birlik', most: "Eng ko'p" }, en: { rep: 'repair', ok: 'ok', need: 'Needs repair', units: 'units', most: 'Most' },
                ru: { rep: 'ремонт', ok: 'исправно', need: 'Требуют ремонта', units: 'ед.', most: 'Больше всего' }, zh: { rep: '待修', ok: '正常', need: '需维修', units: '台', most: '最多' } })[LG] || {};
            let totBad = 0, worst = null;
            const kpis = groups.map(([ic, lb, arr, fn]) => {
                const c = dashCount(arr); totBad += c.bad; if (c.bad && (!worst || c.bad > worst[1])) worst = [lb, c.bad, fn];
                const okPct = c.all ? Math.round((c.all - c.bad - c.rep) / c.all * 100) : 100;
                return `<div class="dp-kpi${c.bad ? ' bad' : ''}" onclick="${fn}"><i>${ic}</i><b>${c.all}</b><span>${lb}</span>` +
                    (c.bad ? `<em>⚠ ${c.bad} ${TX.rep}</em>` : `<em class="ok">✓ ${TX.ok}</em>`) + `<div class="dp-bar"><div style="width:${okPct}%;background:${okPct >= 85 ? '#4ade80' : okPct >= 60 ? '#facc15' : '#f87171'}"></div></div></div>`;
            }).join('');
            const alert = totBad ? `<div class="dp-alert" onclick="${worst[2]}">🔧 <span>${TX.need}: <b>${totBad}</b> ${TX.units}. ${TX.most} — ${(LG !== 'uz' && typeof i18nTr === 'function' && i18nTr(worst[0], I18N.L)) || worst[0]} (${worst[1]})</span></div>`
                : `<div class="dp-alert ok">✅ <span>Barcha texnika muddati nazoratda</span></div>`;
            p.innerHTML = `<div class="dp-top"><div><div class="dp-hi">${hi}${nm ? ',' : ''}</div><div class="dp-name">${nm ? esc(nm.split(/\s+/).slice(0, 2).join(' ')) : 'AGMK-STTB PTO'}</div></div>
                <div class="dp-clock"><b>${hh}:${mm}</b><small>${kun}, ${d.getDate()}-${oy}</small></div></div>
                <div class="dp-grid">${kpis}</div>${alert}<div class="dp-sec">Bo'limlar</div>`;
        }
        (function () {
            try {
                if (typeof I18N_D !== 'undefined') Object.assign(I18N_D, {
                    'Dizayn mavzusi': ['Design theme', 'Тема оформления', '设计主题'],
                    "Bo'limlar": ['Sections', 'Разделы', '栏目'],
                    'Xayrli tong': ['Good morning', 'Доброе утро', '早上好'], 'Xayrli kun': ['Good afternoon', 'Добрый день', '下午好'],
                    'Xayrli kech': ['Good evening', 'Добрый вечер', '晚上好'], 'Xayrli tun': ['Good night', 'Доброй ночи', '晚安'],
                    'Xayrli tong,': ['Good morning,', 'Доброе утро,', '早上好，'], 'Xayrli kun,': ['Good afternoon,', 'Добрый день,', '下午好，'],
                    'Xayrli kech,': ['Good evening,', 'Добрый вечер,', '晚上好，'], 'Xayrli tun,': ['Good night,', 'Доброй ночи,', '晚安，'],
                    'Vagonlar': ['Wagons', 'Вагоны', '车厢'], 'Lokomotiv': ['Locomotive', 'Локомотив', '机车'], "Yo'l texn.": ['Track mach.', 'Путев. техн.', '线路机械'],
                    'Avtotraktor': ['Vehicles', 'Автотракторы', '汽车拖拉机'], '✓ soz': ['✓ ok', '✓ исправно', '✓正常'],
                    'Barcha texnika muddati nazoratda': ['All equipment is within schedule', 'Вся техника в пределах сроков', '所有设备均在期限内'],
                    "Mavzu faqat ko'rinishni o'zgartiradi. Ma'lumotlar, aktlar va sozlamalar o'zgarmaydi.": ['The theme changes appearance only. Data, acts and settings stay the same.', 'Тема меняет только внешний вид. Данные, акты и настройки не меняются.', '主题只改变外观，数据、文件和设置不变。']
                });
                if (typeof I18N_R !== 'undefined') {
                    I18N_R.push([/^⚠ (\d+) ta'mir$/, (m, L) => ({ en: '⚠ ' + m[1] + ' repair', ru: '⚠ ' + m[1] + ' ремонт', zh: '⚠ ' + m[1] + ' 待修' })[L]]);
                    I18N_R.push([/^Ta'mir talab: (\d+) ta birlik\. Eng ko'p — (.+) \((\d+)\)$/, (m, L) => ({ en: 'Needs repair: ' + m[1] + ' units. Most — ' + m[2] + ' (' + m[3] + ')', ru: 'Требуют ремонта: ' + m[1] + ' ед. Больше всего — ' + m[2] + ' (' + m[3] + ')', zh: '需维修：' + m[1] + ' 台。最多 — ' + m[2] + '（' + m[3] + '）' })[L]]);
                    I18N_R.push([/^(Yakshanba|Dushanba|Seshanba|Chorshanba|Payshanba|Juma|Shanba), (\d+)-(\S+)$/, (m, L) => {
                        const W = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'].indexOf(m[1]);
                        const M = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'].indexOf(m[3]);
                        const d = new Date(2026, M, +m[2]); const loc = { en: 'en-GB', ru: 'ru-RU', zh: 'zh-CN' }[L];
                        try { return d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { return null; }
                    }]);
                }
            } catch (e) {}
            try { themeApply(themeGet(), false); } catch (e) {}
            try {
                openScreen = agmkExtend('openScreen', '29-bosqich: Dizayn mavzulari + bosh sahifa paneli', openScreen, _os => function (id) { const r = _os.apply(this, arguments); if (id === 'screen-main') { try { dashRender(); } catch (e) {} } return r; });
            } catch (e) {}
            try {
                saveDB = agmkExtend('saveDB', '29-bosqich: Dizayn mavzulari + bosh sahifa paneli', saveDB, _sd => function () { const r = _sd.apply(this, arguments); clearTimeout(DASH_T); DASH_T = setTimeout(() => { try { dashRender(); } catch (e) {} }, 300); return r; });
            } catch (e) {}
            setInterval(() => { try { const m = $id('screen-main'); if (m && m.classList.contains('active') && !document.hidden) dashRender(); } catch (e) {} }, 20000);
            document.addEventListener('visibilitychange', () => { if (!document.hidden) try { dashRender(); } catch (e) {} });
            setTimeout(() => { try { dashRender(); } catch (e) {} }, 800);
            try { const un = $id('currentUserName'); if (un) new MutationObserver(() => { try { dashRender(); } catch (e) {} }).observe(un, { childList: true, characterData: true, subtree: true }); } catch (e) {}
        })();


