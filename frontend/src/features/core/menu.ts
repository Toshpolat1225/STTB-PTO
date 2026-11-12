        // =====================================================================
        // v3.6.1 — 🧭 BOSH MENYU: yangi tartib va guruhlar
        //  1 Rahbariyat nazorati · 2 Ishchi xodimlar (2.1 Shtatlar) · 3 Dispetcherlik · 4 Sex va uchastkalar (4.1 Uskunalar)
        //  5 Mashinistlar · 6 STTB texnikalari (lokomotiv, vagon, yo'l qurilishi, avtotraktor, ekskavator, kran) · 7 Dalolatnoma
        //  8 Buxgalteriya · 9 MTTB (9.1 Ehtiyot qismlar) · 10 Temir yo'l xaritasi (10.1 Infratuzilma) · 11 Normativ · 12 MM · 13 Parametrlar
        //  Kartalar o'zgarmaydi (bir xil tugma, bir xil huquq) — faqat joyi va guruhi. Foydalanuvchi o'z tartibini o'rnatgan bo'lsa — u saqlanadi.
        // =====================================================================
        var MENU_KEY = 'agmk_menu_grp';
        var MENU_DEF = [
            ['top', c => c.id === 'sgCard'],
            ['1', c => c.id === 'rnMenuCard'],
            ['g-xod', c => c.getAttribute('data-sec') === 'grp-xod'],
            ['2', c => /^openXodimTree\(\)/.test(c.getAttribute('onclick') || ''), 1, 'xod'], ['2.1', c => /^openShtat\(\)/.test(c.getAttribute('onclick') || ''), 1, 'xod'],
            ['3', c => /^openHR\(\)/.test(c.getAttribute('onclick') || '')],
            ['g-seh', c => c.getAttribute('data-sec') === 'grp-seh'],
            ['4', c => /^openSubUnits\('seh'/.test(c.getAttribute('onclick') || ''), 1, 'seh'], ['4.1', c => /^openSubUnits\('uskuna'/.test(c.getAttribute('onclick') || ''), 1, 'seh'],
            ['5', c => c.getAttribute('data-sec') === 'mod-mash'],
            ['6', c => c.getAttribute('data-sec') === 'grp-sttb'],
            ['6.1', c => /^openLokScreen\(\)/.test(c.getAttribute('onclick') || ''), 1, 'sttb'], ['6.2', c => /^openScreen\('screen-vagonlar'\)/.test(c.getAttribute('onclick') || ''), 1, 'sttb'],
            ['6.3', c => /^openYolScreen\(\)/.test(c.getAttribute('onclick') || ''), 1, 'sttb'], ['6.4', c => /^openAvtoScreen\(\)/.test(c.getAttribute('onclick') || ''), 1, 'sttb'],
            ['6.5', c => /^ekskavatorlar parki/.test(c.getAttribute('data-search') || ''), 1, 'sttb'], ['6.6', c => /^kranlar va maxsus/.test(c.getAttribute('data-search') || ''), 1, 'sttb'],
            ['7', c => c.getAttribute('data-sec') === 'hisob'], ['8', c => c.getAttribute('data-sec') === 'bux'],
            ['g-mttb', c => c.getAttribute('data-sec') === 'grp-mttb'],
            ['9', c => c.getAttribute('data-sec') === 'mttb', 1, 'mttb'], ['9.1', c => /^openSP\(\)/.test(c.getAttribute('onclick') || ''), 1, 'mttb'],
            ['g-map', c => c.getAttribute('data-sec') === 'grp-map'],
            ['10', c => /^openMapScreen\(\)/.test(c.getAttribute('onclick') || ''), 1, 'map'], ['10.1', c => /^infratuzilma/.test(c.getAttribute('data-search') || ''), 1, 'map'],
            ['11', c => /^openND\(\)/.test(c.getAttribute('onclick') || '')], ['12', c => c.getAttribute('data-sec') === 'mm'],
            ['rest', null], ['13', c => /^openSettings\(\)/.test(c.getAttribute('onclick') || '')]
        ];
        // v3.6.2: barcha ichki bo'limli guruhlar yig'iladi; bir vaqtda bitta guruh ochiq
        var MENU_GRP = {
            xod: { ic: '👥', t: 'Ishchi xodimlar', par: '2', sub: 'Xodimlar roʻyxati' },
            seh: { ic: '🏭', t: 'Sex va uchastkalar', par: '4', sub: 'Sexlar va uchastkalar' },
            sttb: { ic: '🚂', t: 'STTB texnikalari' },
            mttb: { ic: '📦', t: 'MTTB — Moddiy-texnik taʼminot', par: '9', sub: 'Kirim va berish' },
            map: { ic: '🗺', t: 'Temir yoʻl xaritasi va stansiyalar', par: '10', sub: 'Xarita va stansiyalar' }
        };
        var MENU = { busy: false, t: null };
        function menuOpenGroup() { try { const v = localStorage.getItem(MENU_KEY); return v === null || v === '1' ? 'sttb' : v === '0' ? '' : v; } catch (e) { return 'sttb'; } }
        function menuToggle(g) { menuGrpOpen(g || 'sttb'); }
        // v3.6.6 (H1): guruh bosilganda — alohida ichki sahifa (asosiy roʻyxat uzayib ketmaydi). Ichidagi boʻlimdan «Orqaga» — shu sahifaga qaytadi
        var MENU_CNT = {
            '6.1': () => typeof isLok === 'function' && typeof vagonlarData !== 'undefined' ? vagonlarData.filter(v => isLok(v)).length : null,
            '6.2': () => typeof onlyVagons === 'function' ? onlyVagons().length : null,
            '6.3': () => typeof onlyYol === 'function' ? onlyYol().length : null,
            '6.4': () => typeof onlyAvto === 'function' ? onlyAvto().length : null,
            '6.6': () => typeof onlyYol === 'function' ? onlyYol().filter(v => v.type === 'Yotqizuvchi kranlar').length : null
        };
        function menuGrpOpen(g) {
            const l = $id('main-card-list'), G = MENU_GRP[g]; if (!l || !G) return; const head = l.querySelector('[data-sec="grp-' + g + '"]'), t = (head && head._t) || G.t;
            const s = secScreen('screen-grp', t); const h = s.querySelector('.sec-title'); if (h) h.textContent = t; s.dataset.g = g;
            const b = secBody('screen-grp'); b.innerHTML = '<div class="card-list mn-inner"></div>'; const box = b.firstChild;
            const ix = c => MENU_DEF.findIndex(d => d[0] === c.dataset.mn); // 3.19.2: guruh ichida MENU_DEF tartibi (DOM tartibiga bogʻliq emas)
            Array.from(l.querySelectorAll(':scope > .btn-card')).filter(c => c.classList.contains('mn-in') && MENU_DEF.some(d => d[0] === c.dataset.mn && d[3] === g)).sort((a, c) => ix(a) - ix(c)).forEach(c => {
                const x = c.cloneNode(true); x.classList.remove('mn-sub', 'mn-in', 'mn-col', 'hidden'); x.style.display = ''; x.removeAttribute('id');
                const f = MENU_CNT[c.dataset.mn]; let n = null; try { n = f ? f() : null; } catch (e) {} if (n !== null) { const tx = x.querySelector('.btn-text'); if (tx) tx.insertAdjacentHTML('beforeend', ' <small class="mn-cnt">' + n + ' ta</small>'); }
                box.appendChild(x); });
            openScreen('screen-grp');
        }
        function menuEksk() { openAvtoScreen(); setAvtoCat('Buldozer va ekskavator'); }
        function menuKran() {
            const yk = onlyYol().filter(v => v.type === 'Yotqizuvchi kranlar').length, mx = onlyAvto().filter(v => v.type === 'Maxsus texnika').length;
            mdl('menuKran', `<div class="px-h"><b>🏗 Kranlar va maxsus texnikalar</b><button class="mini-btn" onclick="mdlClose('menuKran')">✕</button></div>
                <div class="ms-big" onclick="mdlClose('menuKran'); openYolScreen(); setYolCat('Yotqizuvchi kranlar')"><span>🏗</span><div><b>Yoʻl yotqizuvchi kranlar</b><small>temir yoʻl texnikasi</small></div><em>${yk}</em></div>
                <div class="ms-big" onclick="mdlClose('menuKran'); openAvtoScreen(); setAvtoCat('Maxsus texnika')"><span>🔧</span><div><b>Maxsus texnika</b><small>avtotraktor parki</small></div><em>${mx}</em></div>`);
        }
        function menuGroupCard(g, cards) {
            const l = $id('main-card-list'); if (!l) return null; const G = MENU_GRP[g]; let el = l.querySelector('[data-sec="grp-' + g + '"]');
            if (!el) {
                let ic = G.ic, t = G.t, ds = '';
                if (G.par) { const pd = MENU_DEF.find(x => x[0] === G.par), pc = pd && cards.find(pd[1]); if (!pc) return null;
                    const pi = pc.querySelector('.btn-icon'), pt = pc.querySelector('.btn-text'); if (pi) ic = pi.textContent; if (pt && !pc._mnT) { t = pt.textContent.trim() || t; pc._mnT = t; }
                    ds = pc.getAttribute('data-search') || ''; }
                el = document.createElement('div'); el.className = 'btn-card mn-grp'; el.setAttribute('data-sec', 'grp-' + g);
                el.setAttribute('data-search', (g === 'sttb' ? 'sttb texnikalari lokomotiv vagon yol qurilishi avtotraktor ekskavator kran texnika' : ds + ' ' + G.t.toLowerCase()));
                el.onclick = () => menuToggle(g); el.innerHTML = '<div class="btn-card-content"><span class="btn-icon">' + ic + '</span><span class="btn-text"></span></div><span class="btn-arrow mn-ar">›</span>'; el._t = t; l.appendChild(el);
            }
            return el;
        }
        function menuArrange() {
            const l = $id('main-card-list'); if (!l || MENU.busy) return; MENU.busy = true;
            try {
                let cards0 = Array.from(l.querySelectorAll(':scope > .btn-card'));
                Object.keys(MENU_GRP).forEach(g => menuGroupCard(g, cards0));
                const cards = Array.from(l.querySelectorAll(':scope > .btn-card')), used = new Set(), seq = [];
                cards.forEach(c => { const ds = c.getAttribute('data-search') || '';
                    if (/^ekskavatorlar parki/.test(ds) && !c._mn) { if (typeof homeId === 'function') homeId(c); c.setAttribute('onclick', 'menuEksk()'); c._mn = 1; }
                    if (/^kranlar va maxsus/.test(ds) && !c._mn) { if (typeof homeId === 'function') homeId(c); c.setAttribute('onclick', 'menuKran()'); c._mn = 1; } });
                MENU_DEF.forEach(([k, f, lvl, grp]) => {
                    if (!f) { seq.push(['rest']); return; }
                    const c = cards.find(x => !used.has(x) && f(x)); if (!c) return; used.add(c); seq.push([k, c, lvl, grp]);
                });
                const rest = cards.filter(c => !used.has(c));
                const my = typeof homeMy === 'function' ? homeMy() : {}, custom = my._order && my._order.length;
                const open = menuOpenGroup();
                seq.forEach(([k, c, lvl, grp]) => { if (k === 'rest') return; c.classList.toggle('mn-sub', !!lvl); c.classList.toggle('mn-in', !!grp); c.classList.toggle('mn-col', !!grp); c.dataset.mn = k;
                    const G = grp && MENU_GRP[grp]; if (G && G.par === k && G.sub) { const t = c.querySelector('.btn-text'); if (t && t.textContent !== G.sub) t.textContent = G.sub; } });
                Object.keys(MENU_GRP).forEach(g => { const el = l.querySelector('[data-sec="grp-' + g + '"]'); if (!el) return; const n = seq.filter(x => x[3] === g).length;
                    el.classList.remove('open'); el.classList.toggle('hidden', !n); const t = el.querySelector('.btn-text'); const h = (el._t || MENU_GRP[g].t) + ' <small class="mn-cnt">' + n + ' boʻlim</small>'; if (t && t.innerHTML !== h) t.innerHTML = h; });
                if (!custom) {
                    const want = []; seq.forEach(x => { if (x[0] === 'rest') want.push(...rest); else want.push(x[1]); });
                    const now = Array.from(l.querySelectorAll(':scope > .btn-card'));
                    if (want.some((c, i) => now[i] !== c)) { const tail = l.querySelector('#main-search-empty'); want.forEach(c => l.insertBefore(c, tail && tail.parentNode === l ? tail : null)); }
                }
            } catch (e) { console.error(e); } finally { MENU.busy = false; }
        }
        (function () {
            const l = $id('main-card-list'); if (!l) return;
            const ob = new MutationObserver(() => { if (MENU.busy) return; clearTimeout(MENU.t); MENU.t = setTimeout(menuArrange, 60); });
            ob.observe(l, { childList: true });
            if (typeof homeApply === 'function') homeApply = agmkExtend('homeApply', 'v3.6.1: menyu guruhlari', homeApply, o => function () { const r = o.apply(this, arguments); menuArrange(); return r; });
            if (typeof filterMainMenu === 'function') filterMainMenu = agmkExtend('filterMainMenu', 'v3.6.1: qidiruvda guruh ochiladi', filterMainMenu, o => function () { const q = (($id('globalSearchInput') || {}).value || '').trim(); l.classList.toggle('mn-q', !!q); return o.apply(this, arguments); });
            window.addEventListener('agmk:login', () => setTimeout(menuArrange, 300));
            setTimeout(menuArrange, 0);
            const st = document.createElement('style');
            st.textContent = `#main-card-list .btn-card.mn-sub{margin-left:26px;min-height:0;padding-top:10px;padding-bottom:10px;position:relative}
#main-card-list .btn-card.mn-sub::before{content:'';position:absolute;left:-15px;top:-8px;bottom:50%;width:11px;border-left:2px solid rgba(125,211,252,.45);border-bottom:2px solid rgba(125,211,252,.45);border-bottom-left-radius:8px}
#main-card-list .btn-card.mn-sub .btn-text{font-size:.93em}#main-card-list .btn-card.mn-sub .btn-icon{font-size:1.05em}
#main-card-list:not(.mn-q) .btn-card.mn-col{display:none!important}
#main-card-list .mn-grp .mn-ar{transition:transform .2s}.mn-inner .mn-cnt{font-size:11px;font-weight:700;opacity:.75;margin-left:6px}#main-card-list .mn-cnt{font-size:11px;font-weight:600;opacity:.7;margin-left:6px}`;
            document.head.appendChild(st);
        })();

