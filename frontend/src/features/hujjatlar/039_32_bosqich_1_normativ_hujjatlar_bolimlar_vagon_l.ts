        /* ===== 32-bosqich (1): Normativ hujjatlar — bo'limlar (Vagon, Lokomotiv...), ichki standartlar (RU + UZ), me'yorlar jadvali, AI tezkor javob ===== */
        var ND_CATS = [
            { id: 'vagon', ic: '🚃', t: 'Vagon', re: /vagon|вагон|kolodk|колодк|avtos|автосцеп|telej|тележ|aravach|buks|букс|gildirak|колес|dumpkar|думпкар/ },
            { id: 'lok', ic: '🚂', t: 'Lokomotiv', re: /lokomotiv|локомотив|teplovoz|тепловоз|тэм|tem2|dizel|дизел/ },
            { id: 'yol', ic: '🛤️', t: "Yo'l", re: /yo.?l\b|пут[ьи]|rels|рельс|strelk|стрелоч|shpal|шпал|drezin|дрезин/ },
            { id: 'avto', ic: '🚜', t: 'Avtotraktor', re: /avto(?!s)|авто(?!сц)|traktor|трактор|ekskavator|экскават/ },
            { id: 'umumiy', ic: '📋', t: 'Umumiy', re: null }
        ];
        function ndCatOf(d) { if (d && d.cat && ND_CATS.some(c => c.id === d.cat)) return d.cat; const s = aiNorm((d && (d.title || '')) + ' ' + ((d && d.punkts || []).slice(0, 5).map(p => p.t).join(' '))); const c = ND_CATS.find(c => c.re && c.re.test(s)); return c ? c.id : 'umumiy'; }
        function ndCatName(id) { const c = ND_CATS.find(x => x.id === id); return c ? c.ic + ' ' + c.t : id; }
        var GOST = { lang: 'uz', tab: 'text' };
        try { GOST.lang = localStorage.getItem('agmk_gost_lang') || 'uz'; } catch (e) {}
        function gostDoc(id) { return ND_BUILTIN.find(d => d.id === id) || null; }
        function gostP(d) { if (!d._p) d._p = (d.params || []).map(a => ({ ru: a[0], uz: a[1], v: a[2], v_uz: a[3], unit: a[4], ctx_ru: a[5], ctx_uz: a[6], src: a[7], src_uz: a[8], kw: a[9] })); return d._p; }
        function gostTables(d) { return d.items.filter(i => i.t === 'table'); }
        function gostFigs(d) { return d.items.filter(i => i.t === 'fig'); }
        function gostTxt(o) { return GOST.lang === 'ru' ? o.ru : o.uz; }

        // ---------- Hujjatlar bazasi: bo'limlar va ichki standartlar ----------
        (function () {
            ndRenderDocs = agmkExtend('ndRenderDocs', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R · ---------- Hujjatlar bazasi: boʼlimlar va ichki standartlar ----------', ndRenderDocs, o => function () {
                const cat = ND.cat || '';
                const od = ndDocs;
                if (cat) ndDocs = function () { return od().filter(d => ndCatOf(d) === cat); };
                let r;
                try { r = o.apply(this, arguments); } finally { ndDocs = od; }
                try {
                    const b = $id('ndBody'), q = ndQ();
                    const cnt = id => ND_BUILTIN.filter(d => d.cat === id).length + od().filter(d => ndCatOf(d) === id).length;
                    const chips = document.createElement('div'); chips.className = 'nd-cats';
                    chips.innerHTML = `<i class="${!cat ? 'on' : ''}" onclick="ndCatSet('')">Barchasi</i>` + ND_CATS.map(c => `<i class="${cat === c.id ? 'on' : ''}" onclick="ndCatSet('${c.id}')">${c.ic} ${escapeHtml(c.t)} <u>${cnt(c.id)}</u></i>`).join('');
                    const list = ND_BUILTIN.filter(d => (!cat || d.cat === cat) && (!q || aiNorm(d.code + ' ' + d.title.ru + ' ' + d.title.uz).includes(q)));
                    const box = document.createElement('div');
                    box.innerHTML = `<div class="inf-sec">🏛 Standartlar (to'liq matn) — ${list.length}</div>` + (list.map(d => `<div class="nd-doc nd-std" onclick="gostOpen('${d.id}')"><b>${escapeHtml(d.code)}</b><span class="nd-badge ok">RU asl</span><span class="nd-badge uzt">UZ tarjima</span><span class="nd-badge cat">${ndCatName(d.cat)}</span><div class="p">${escapeHtml(d.title.uz)}</div><small>${gostTables(d).length} jadval · ${gostP(d).length} me'yor · ${gostFigs(d).length} chizma — AI savollarga shu hujjatdan javob beradi</small></div>`).join('') || '<div class="xt-empty">Bu bo\'limda hali standart yo\'q</div>');
                    const form = b.querySelector('.nd-form');
                    if (form) { form.after(chips); chips.after(box); } else { b.prepend(box); b.prepend(chips); }
                    // Akt havolalaridagi GOST 33421 — endi to'liq matn bor
                    b.querySelectorAll('.nd-doc').forEach(el => {
                        const t = (el.querySelector('b') || {}).textContent || '';
                        if (/^GOST 33421/.test(t) && !el.classList.contains('nd-std')) {
                            const bd = el.querySelector('.nd-badge.ref'); if (bd) { bd.className = 'nd-badge ok'; bd.textContent = "to'liq matn bor"; }
                            const sm = el.querySelector('small'); if (sm) sm.innerHTML = sm.innerHTML.replace(/ · to'liq matni hali kiritilmagan/, '');
                            const a = document.createElement('button'); a.className = 'mini-btn'; a.style.marginTop = '6px'; a.innerText = /geometr/.test(t) ? '📖 1-jadvalni ochish' : '📖 8-jadvalni ochish';
                            a.onclick = ev => { ev.stopPropagation(); gostOpen('gost33421', /geometr/.test(t) ? 'tables' : 'tables', /geometr/.test(t) ? '1' : '8'); };
                            el.appendChild(a);
                        }
                    });
                    // Bo'lim tanlash — hujjat qo'shish formasida
                    const tf = $id('ndDTitle');
                    if (tf && !$id('ndDCat')) {
                        const f = document.createElement('div'); f.className = 'nd-f';
                        f.innerHTML = `<label>BO'LIM</label><select id="ndDCat"><option value="">Avtomatik aniqlash</option>${ND_CATS.map(c => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${c.ic} ${escapeHtml(c.t)}</option>`).join('')}</select>`;
                        tf.closest('.nd-f').after(f);
                    }
                    // Kiritilgan hujjatlar kartasiga bo'lim belgisi
                    b.querySelectorAll('.nd-doc[onclick^="ND.doc="]').forEach(el => { const m = (el.getAttribute('onclick') || '').match(/ND\.doc='([^']+)'/); const d = m && od().find(x => x.id === m[1]); if (d) { const s = document.createElement('span'); s.className = 'nd-badge cat'; s.textContent = ndCatName(ndCatOf(d)); const bb = el.querySelector('.nd-badge'); (bb || el.querySelector('b')).after(s); } });
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        function ndCatSet(c) { ND.cat = c; ndRender(); }
        (function () {
            ndAddDoc = agmkExtend('ndAddDoc', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R', ndAddDoc, o => function () {
                const sel = $id('ndDCat'), c = sel ? sel.value : '', before = ndDocs().length;
                const r = o.apply(this, arguments);
                try { const l = ndDocs(); if (l.length > before) { const d = l[l.length - 1]; d.cat = c || ndCatOf(d); ndSet(ND_DOCS_KEY, l); ndParamsCache = {}; } } catch (e) {}
                return r;
            });
        })();
        (function () {
            ndRenderDoc = agmkExtend('ndRenderDoc', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R', ndRenderDoc, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const d = ndDocs().find(x => x.id === ND.doc); if (!d) return r;
                    const ps = ndAutoParams(d), b = $id('ndBody'), head = b.firstElementChild;
                    const bar = document.createElement('div'); bar.className = 'nd-doc';
                    bar.innerHTML = `<span class="nd-badge cat">${ndCatName(ndCatOf(d))}</span> ${isAdmin() ? `<select class="nd-catsel" onchange="ndDocCat('${d.id}', this.value)">${ND_CATS.map(c => `<option value="${c.id}" ${ndCatOf(d) === c.id ? 'selected' : ''}>${c.ic} ${escapeHtml(c.t)}</option>`).join('')}</select>` : ''}` +
                        (ps.length ? `<div class="p">📏 Matndan avtomatik ajratilgan me'yorlar (${ps.length}):<br>${ps.slice(0, 40).map(p => '• ' + escapeHtml(p.uz) + ' — <b>' + escapeHtml(p.v) + ' ' + escapeHtml(p.unit) + '</b> <small>(' + escapeHtml(p.src_uz) + ')</small>').join('<br>')}</div>` : '');
                    if (head) head.after(bar); else b.prepend(bar);
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        function ndDocCat(id, c) { const l = ndDocs(), d = l.find(x => x.id === id); if (!d) return; d.cat = c; ndSet(ND_DOCS_KEY, l); showToast("✅ Bo'lim: " + ndCatName(c)); }

        // ---------- Standart sahifasi ----------
        function gostOpen(id, tab, focus) {
            if (!$id('screen-nd').classList.contains('active')) openND('docs');
            ND.view = 'gost'; ND.gid = id; GOST.tab = tab || 'text'; GOST.focus = focus || null;
            const s = $id('ndSearch'); if (s) s.value = '';
            ndRender();
        }
        (function () {
            ndRender = agmkExtend('ndRender', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R', ndRender, o => function () {
                if (ND.view === 'gost') { $id('ndSearchWrap').style.display = ''; if (typeof ndAiPos === 'function') ndAiPos(false); $id('ndTitle').innerText = 'Standart'; gostRender(); return; }
                return o.apply(this, arguments);
            });
            ndGoBack = agmkExtend('ndGoBack', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R', ndGoBack, g => function () { if (ND.view === 'gost') { ND.view = 'docs'; ndRender(); return; } return g.apply(this, arguments); });
        })();
        function gostLang(l) { GOST.lang = l; try { localStorage.setItem('agmk_gost_lang', l); } catch (e) {} gostRender(); }
        function gostTab(t) { GOST.tab = t; GOST.focus = null; gostRender(); const b = $id('ndBody'); if (b) b.scrollTop = 0; }
        function gostItemHtml(d, it, i) {
            const L = GOST.lang;
            if (it.t === 'h') return `<h3 class="gt-h" id="gt-${i}">${escapeHtml(gostTxt(it))}</h3>`;
            if (it.t === 'p') { const tx = gostTxt(it); const num = it.n && tx.indexOf(it.n) !== 0 ? `<b>${escapeHtml(it.n)}</b> ` : ''; return `<p class="gt-p${/^[-–•]/.test(tx.trim()) ? ' li' : ''}" id="gt-${i}">${num}${escapeHtml(tx).replace(/\n/g, '<br>')}</p>`; }
            if (it.t === 'table') return gostTableHtml(it, i);
            if (it.t === 'fig') { const src = (ND_FIGS[d.id] || {})[it.page]; return `<div class="gt-fig" id="gt-${i}">${src ? `<img loading="lazy" src="${src}" onclick="gostZoom(this.src)" alt="">` : ''}<div>${escapeHtml(gostTxt(it))}</div></div>`; }
            return '';
        }
        function gostTableHtml(it, i) {
            const L = GOST.lang, cap = L === 'ru' ? it.cap_ru : it.cap_uz, unit = L === 'ru' ? it.unit_ru : it.unit_uz, notes = (L === 'ru' ? it.notes_ru : it.notes_uz) || [];
            const lbl = L === 'ru' ? 'Таблица ' + it.n : it.n + '-jadval';
            return `<div class="gt-tbl" id="gt-${i}" data-tn="${escapeHtml(it.n)}"><div class="gt-cap"><b>${escapeHtml(lbl)}</b> — ${escapeHtml(cap || '')}${unit ? `<span>${escapeHtml(unit)}</span>` : ''}</div><div class="gt-scroll">${L === 'ru' ? it.ru : it.uz}</div>${notes.map(n => `<div class="gt-note">${escapeHtml(n)}</div>`).join('')}</div>`;
        }
        function gostRender() {
            const d = gostDoc(ND.gid), b = $id('ndBody'); if (!d) { ND.view = 'docs'; ndRender(); return; }
            const L = GOST.lang, q = ndQ(), T = GOST.tab;
            const tabs = [['text', '📄 Matn'], ['tables', '📊 Jadvallar ' + gostTables(d).length], ['params', "📏 Me'yorlar " + gostP(d).length], ['figs', '🖼 Chizmalar ' + gostFigs(d).length]];
            let h = `<div class="nd-doc gt-head"><b>${escapeHtml(d.code)}</b><span class="nd-badge cat">${ndCatName(d.cat)}</span><div class="p">${escapeHtml(L === 'ru' ? d.title.ru : d.title.uz)}</div>
                <div class="gt-lang"><i class="${L === 'uz' ? 'on' : ''}" onclick="gostLang('uz')">🇺🇿 O'zbekcha</i><i class="${L === 'ru' ? 'on' : ''}" onclick="gostLang('ru')">🇷🇺 Русский</i></div>
                <small>${L === 'uz' ? "O'zbekcha matn — norasmiy tarjima. Rasmiy hujjatlarda ruscha asl nusxaga tayaning." : 'Официальный текст стандарта (издание 2019 г.).'}</small></div>
                <div class="gt-tabs">${tabs.map(t => `<i class="${T === t[0] ? 'on' : ''}" onclick="gostTab('${t[0]}')">${t[1]}</i>`).join('')}</div>`;
            if (T === 'params') h += gostParamsHtml(d, q);
            else if (T === 'figs') h += gostFigs(d).map(f => gostItemHtml(d, f, d.items.indexOf(f))).join('');
            else if (T === 'tables') h += gostTables(d).filter(t => !q || aiNorm(t.cap_ru + ' ' + t.cap_uz + ' ' + kbStrip(t.ru) + ' ' + kbStrip(t.uz)).includes(q)).map(t => gostTableHtml(t, d.items.indexOf(t))).join('') || '<div class="xt-empty">Topilmadi</div>';
            else {
                const its = d.items.map((it, i) => [it, i]).filter(([it]) => it.t !== 'fig' || true);
                if (q) {
                    const hit = its.filter(([it]) => aiNorm((it.n || '') + ' ' + it.ru + ' ' + it.uz + ' ' + (it.cap_ru || '') + ' ' + (it.cap_uz || '')).includes(q));
                    h += `<div class="nd-tip">🔎 «${escapeHtml(q)}» — ${hit.length} ta joy</div>` + (hit.map(([it, i]) => gostItemHtml(d, it, i)).join('') || '<div class="xt-empty">Topilmadi</div>');
                } else {
                    const toc = d.items.map((it, i) => [it, i]).filter(([it]) => it.t === 'h' && it.n);
                    h += `<details class="gt-toc"><summary>📑 Mundarija</summary>${toc.map(([it, i]) => `<a onclick="gostJump(${i})">${escapeHtml(gostTxt(it))}</a>`).join('')}</details>`;
                    h += `<div class="gt-body">` + its.map(([it, i]) => gostItemHtml(d, it, i)).join('') + `</div>`;
                }
            }
            b.innerHTML = h;
            if (GOST.focus) { const f = GOST.focus; GOST.focus = null; setTimeout(() => { const el = b.querySelector(`.gt-tbl[data-tn="${f}"]`) || $id('gt-' + f); if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('gt-flash'); } }, 60); }
        }
        function gostJump(i) { const el = $id('gt-' + i); if (el) { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); el.classList.add('gt-flash'); setTimeout(() => el.classList.remove('gt-flash'), 1600); } }
        function gostParamsHtml(d, q) {
            const L = GOST.lang, P = gostP(d);
            const list = q ? P.filter(p => aiNorm([p.ru, p.uz, p.ctx_ru, p.ctx_uz, p.src, p.src_uz, p.kw, p.v].join(' ')).includes(q) || dbN([p.ru, p.uz, p.ctx_ru, p.ctx_uz, p.kw].join(' ')).includes(dbN(q))) : P;
            return `<div class="nd-tip">${L === 'ru' ? 'Нормативные значения, извлечённые из таблиц и текста стандарта. Поиск — строкой вверху.' : "Standart jadvallari va matnidagi raqamli me'yorlar. Yuqoridagi qidiruv orqali saralang yoki AI'dan so'rang: «yuk vagoni kolodkasining Brinell qattiqligi qancha»."}</div>` +
                `<div class="gt-params">` + list.slice(0, 400).map(p => `<div class="gp"><div class="gp-l">${escapeHtml(L === 'ru' ? p.ru : p.uz)}<small>${escapeHtml(L === 'ru' ? p.ctx_ru : p.ctx_uz)}</small></div><div class="gp-v">${escapeHtml(L === 'ru' ? p.v : p.v_uz)} <u>${escapeHtml(p.unit)}</u></div><div class="gp-s">${escapeHtml(L === 'ru' ? p.src : p.src_uz)}</div></div>`).join('') + `</div>` + (list.length ? '' : '<div class="xt-empty">Topilmadi</div>');
        }
        function gostZoom(src) {
            let o = $id('gtZoom');
            if (!o) { o = document.createElement('div'); o.id = 'gtZoom'; o.className = 'gt-zoom hidden'; o.innerHTML = '<button onclick="this.parentNode.classList.add(\'hidden\')">✕</button><div class="gz-in"><img alt=""></div>'; document.body.appendChild(o); o.querySelector('img').onclick = e => e.target.classList.toggle('big'); }
            o.querySelector('img').src = src; o.querySelector('img').classList.remove('big'); o.classList.remove('hidden');
        }

        // Bosh qidiruv (Normativ hujjatlar) — standart punktlari ham
        (function () {
            ndSearchHtml = agmkExtend('ndSearchHtml', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R · Bosh qidiruv (Normativ hujjatlar) — standart punktlari ham', ndSearchHtml, o => function (q) {
                let h = o.apply(this, arguments);
                try {
                    const hits = [];
                    ND_BUILTIN.forEach(d => { let sec = ''; d.items.forEach((it, i) => { if (it.t === 'h') { sec = it.uz; return; } if (it.t === 'fig') return; const s = aiNorm((it.n || '') + ' ' + it.uz + ' ' + it.ru + ' ' + (it.cap_uz || '') + ' ' + (it.cap_ru || '')); if (s.includes(q)) hits.push([d, it, i, sec]); }); });
                    const ps = gostParamSearch(q, 6);
                    let add = '';
                    if (ps.length) add += `<div class="inf-sec">📏 Standart me'yorlari</div>` + ps.map(p => `<div class="nd-doc" onclick="gostOpen('${p.d.id}','params')" style="cursor:pointer"><b>${escapeHtml(p.uz)}</b> — <b style="color:#fde68a">${escapeHtml(p.v_uz)} ${escapeHtml(p.unit)}</b><div class="p">${escapeHtml(p.ctx_uz)}</div><small style="color:#94a3b8">${escapeHtml(p.d.code)}, ${escapeHtml(p.src_uz)}</small></div>`).join('');
                    if (hits.length) add += `<div class="inf-sec">🏛 Standartlar matni</div>` + hits.slice(0, 20).map(([d, it, i, sec]) => `<div class="nd-doc" onclick="gostOpen('${d.id}','text'); setTimeout(()=>gostJump(${i}),80)" style="cursor:pointer"><b>${escapeHtml(d.code)}</b> — ${escapeHtml(it.t === 'table' ? it.n + '-jadval' : (it.n ? it.n + '-band' : sec.slice(0, 60)))}<div class="p">${escapeHtml((it.t === 'table' ? it.cap_uz : it.uz).slice(0, 300))}</div></div>`).join('');
                    if (add) h = (/Hech narsa topilmadi/.test(h) ? '' : h) + add;
                } catch (e) { console.error(e); }
                return h;
            });
        })();

        // ---------- Yuklangan hujjatlardan me'yorlarni avtomatik ajratish ----------
        var ndParamsCache = {};
        var ND_UNIT_RE = '(мм²|мм2|mm²|mm2|мм|mm|см|sm|м\\/с|м|m|кН|kN|Н\\b|МПа|MPa|кПа|kPa|км\\/ч|km\\/soat|т\\b|t\\b|кг|kg|г\\b|g\\b|°С|°C|%|л\\b|мин|min|с\\b|s\\b)';
        function ndAutoParams(d) {
            const key = d.id + ':' + (d.punkts || []).length; if (ndParamsCache[key]) return ndParamsCache[key];
            const out = [], re = new RegExp('([^.;:\\n]{4,90}?)[,\\s—–-]*(не более|не менее|не выше|не ниже|до|от|ko.?pi bilan|kamida|kam emas|ortiq emas)?\\s*((?:\\d+(?:[.,]\\d+)?\\s*(?:[±…—–-]|\\.\\.|до)\\s*)?\\d+(?:[.,]\\d+)?(?:\\s*[±]\\s*\\d+(?:[.,]\\d+)?)?)\\s*' + ND_UNIT_RE, 'gi');
            (d.punkts || []).forEach(p => {
                const t = String(p.t || ''); let m; re.lastIndex = 0;
                while ((m = re.exec(t)) && out.length < 300) {
                    const label = m[1].replace(/^[\s,—–-]+/, '').trim(); if (label.length < 4 || /^\d+$/.test(label)) continue;
                    const v = ((m[2] ? m[2] + ' ' : '') + m[3]).trim();
                    out.push({ ru: label, uz: label, v: v, v_uz: v.replace(/^не более/i, "ko'pi bilan").replace(/^не менее/i, 'kamida'), unit: m[4].replace('мм', 'mm').replace('кН', 'kN').replace('МПа', 'MPa'), ctx_ru: '', ctx_uz: '', src: d.title + ', ' + p.n, src_uz: d.title + ', ' + p.n + (/^\d/.test(p.n) ? '-band' : ''), kw: '', d: { id: null, code: d.title }, auto: true });
                }
            });
            ndParamsCache[key] = out; return out;
        }
        (function () { ndSet = agmkExtend('ndSet', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R', ndSet, o => function (k) { if (k === ND_DOCS_KEY) ndParamsCache = {}; return o.apply(this, arguments); }); })();

        // ---------- AI: me'yorlar bo'yicha tezkor aniq javob ----------
        var GOST_ASK = /necha|nechi|nechchi|qancha|qanaqa|qanday|qaysi|o.?lcham|miqdor|qiymat|me.?yor|norma|ruxsat|chegara|kamida|ko.?pi bilan|maksimal|minimal|eng (kam|ko.?p|katta|kichik)|bo.?lishi kerak|сколько|какой|какая|какое|каков|размер|норм|допуск|допуст|не более|не менее|значени|gost|гост|33421/;
        var GOST_STOP = new Set(['va', 'bilan', 'uchun', 'ning', 'da', 'ga', 'dan', 'ni', 'mi', 'bu', 'shu', 'u', 'i', 'v', 'na', 'po', 's', 'dlya', 'pri', 'ne', 'ili', 'yoki', 'mm', 'kn', 'km']);
        var GOST_WEAK = new Set(['tormo', 'kolod', 'gost', '33421', 'kerak', 'bolis', 'bolsa', 'bolsi', 'qanch', 'necha', 'nechi', 'nechc', 'qanda', 'qanaq', 'qaysi', 'olcha', 'qiyma', 'meyor', 'norma', 'razme', 'skolk', 'kakoy', 'kakay', 'kakoe', 'kakov', 'stand', 'boyic', 'haqid', 'ruxsa', 'etila', 'etilg', 'etilm', 'kamid', 'kopi', 'kolod', 'bolad', 'dopus', 'znach', 'trebo', 'talab', 'dona', 'ta', 'shtuk']);
        var GOST_CTXW = new Set(['yuk', 'vagon', 'lokom', 'yolov', 'passa', 'gruzo', 'motor', 'harak', 'tarki', 'podvi', 'sosta', 'kompo', 'metal', 'grebe', 'blok', 'bloki', 'bloka', 'bloko', 'teplo', 'elekt']);
        function gTok(s) { return dbN(String(s || '').replace(/[ьъЬЪ'ʻʼ`’‘]/g, '')).split(/[^a-z0-9]+/).filter(w => w.length >= 2 && !GOST_STOP.has(w)).map(w => w.slice(0, 5)); }
        function gostParamSearch(q, k) {
            const qt = [...new Set(gTok(q))]; if (!qt.length) return [];
            const qs = new Set(qt), out = [];
            let auto = []; try { ndDocs().forEach(d => { auto = auto.concat(ndAutoParams(d)); }); } catch (e) {}
            const cov = lab => { const t = [...new Set(gTok(lab))].filter(w => !GOST_STOP.has(w)); if (!t.length) return 0; let c = 0; t.forEach(w => { if (qs.has(w)) c++; }); return c / t.length; };
            const scoreOf = (p, lab, main, ctx) => {
                const lt = new Set(gTok(lab)), mt = new Set(gTok(main)), ct = new Set(gTok(ctx)); let s = 0, strong = 0;
                qt.forEach(w => {
                    const weak = GOST_WEAK.has(w), cw = GOST_CTXW.has(w);
                    if ((lt.has(w) || mt.has(w)) && !weak && !cw) { s += lt.has(w) ? 3 : 2; strong++; }
                    else if (ct.has(w) || mt.has(w) || lt.has(w)) s += cw ? 1.5 : weak ? (lt.has(w) ? 0.8 : 0.2) : 1;
                });
                return { s: s, strong: strong };
            };
            const nq = aiNorm(q), per = /(qancha|necha|har necha|qanchada)\s*(muddat|oy|yil|vaqt)|davriylig|qay davr|периодичн|как часто|раз в/.test(nq);
            ND_BUILTIN.forEach(d => { if (d.topic && !d.topic.test(nq)) return; gostP(d).forEach(p => {
                const r = scoreOf(p, p.ru + ' ' + p.uz, p.kw.replace(/\|/g, ' '), p.ctx_ru + ' ' + p.ctx_uz + ' ' + p.src + ' ' + p.src_uz);
                if (r.strong) out.push(Object.assign({ d: d, s: r.s + 4 * Math.max(cov(p.uz), cov(p.ru)) + (per && /davriylig|периодичн/i.test(p.uz + ' ' + p.ru) ? 5 : 0), strong: r.strong }, p));
            }); });
            auto.forEach(p => { const r = scoreOf(p, p.ru, '', p.src); if (r.strong) out.push(Object.assign({ s: (r.s + 4 * cov(p.ru)) * 0.9, strong: r.strong }, p)); });
            out.sort((a, b) => b.s - a.s);
            return out.slice(0, k || 8);
        }
        function gostIsRu(q) { return (String(q).match(/[а-яё]/gi) || []).length > String(q).replace(/\s/g, '').length * 0.4; }
        function gostTableRow(d, tn, rn, lang) {
            const t = d.items.find(i => i.t === 'table' && String(i.n) === String(tn)); if (!t) return null;
            const html = lang === 'ru' ? t.ru : t.uz;
            const box = document.createElement('div'); box.innerHTML = html;
            const rows = [...box.querySelectorAll('tr')].map(tr => [...tr.children].map(c => c.textContent.replace(/\s+/g, ' ').trim()));
            if (!rn) return { t: t, rows: rows };
            const pre = String(rn).replace(/\.$/, '');
            const sel = []; let on = false;
            rows.forEach(r => { const f = r[0] || ''; const m = f.match(/^(\d+(?:\.\d+)*)\.?\s/); if (m) on = (m[1] === pre || m[1].indexOf(pre + '.') === 0); if (on && f) sel.push(r); });
            return { t: t, rows: sel };
        }
        function gostAnswer(q) {
            const n = aiNorm(q), ru = gostIsRu(q), d0 = ND_BUILTIN[0];
            const mentions = /gost|гост|33421|standart|стандарт|kolodk|колодк/.test(n);
            // 1) "8-jadval 7-punkt" / "таблица 8 п. 7"
            const tm = n.match(/(\d+)\s*-?\s*(?:jadval|жадвал)[a-zа-яё]*|(?:таблиц[а-яё]*|табл\.?|jadval[a-z]*)\s*№?\s*(\d+)/);
            if (tm && mentions) {
                const tn = tm[1] || tm[2];
                const pm = n.replace(tm[0], ' ').replace(/33421(-2015)?/g, ' ').match(/(\d+(?:\.\d+)*)\s*-?\s*(?:punkt|band|пункт|показател)|(?:punkt|band|пункт|п\.?|показатель|ko.?rsatkich)\s*(\d+(?:\.\d+)*)|(?:^|\s)(\d+(?:\.\d+)+)(?:\s|$)/);
                const rn = pm ? (pm[1] || pm[2] || pm[3]) : null;
                const r = gostTableRow(d0, tn, rn, ru ? 'ru' : 'uz');
                if (r && r.rows.length) {
                    const cap = ru ? r.t.cap_ru : r.t.cap_uz;
                    const head = (ru ? 'ГОСТ 33421-2015, таблица ' + tn : 'GOST 33421-2015, ' + tn + '-jadval') + (rn ? (ru ? ', п. ' + rn : ', ' + rn + '-band') : '') + ' — ' + cap + ':';
                    const lines = (rn ? r.rows : r.rows.slice(0, 14)).filter(x => x.join('').trim()).map(x => '• ' + x.filter(Boolean).join(' — '));
                    return head + '\n' + lines.slice(0, 18).join('\n') + (lines.length > 18 ? '\n…' : '') + '\n📚 Manba: ' + d0.code + (ru ? ' (официальный текст)' : " (to'liq jadval: Normativ hujjatlar → Standartlar)");
                }
            }
            // 2) "GOST 33421 5.3-band" — punkt matni
            const pn = mentions && n.replace(/33421(-2015)?/g, ' ').match(/(?:^|\s)(\d+\.\d+(?:\.\d+)*)\s*-?\s*(?:punkt|band|пункт)?|(?:punkt|band|пункт|п\.)\s*(\d+(?:\.\d+)*)/);
            if (pn && !tm) {
                const num = pn[1] || pn[2], it = d0.items.find(i => !i.pre && i.t === 'p' && i.n === num);
                if (it) return (ru ? it.ru : it.uz) + '\n📚 Manba: ' + d0.code + ', ' + (ru ? 'п. ' + num : num + '-band');
            }
            // 3) Raqamli me'yor
            if (!GOST_ASK.test(n)) return null;
            const ps = gostParamSearch(q, 30); if (!ps.length) return null;
            const top = ps[0]; if (top.s < 4 || (!mentions && top.strong < 2)) return null;
            let best = ps.filter(p => p.s >= top.s * 0.8 && p.strong >= top.strong);
            // asosiy ko'rsatkichdan boshqa, pastroq bahodagilari tushib qoladi
            const tl = best[0].uz; best = best.filter(p => p.uz === tl || p.s >= best[0].s * 0.92);
            // so'rovda tarkib turi aytilgan bo'lsa (yuk vagoni, lokomotiv...) — asosiy ko'rsatkichning faqat o'sha qiymati
            const qc = [...new Set(gTok(q))].filter(w => GOST_CTXW.has(w) && !/^(tormo|kompo|metal)$/.test(w));
            if (qc.length) { const f = best.filter(p => p.uz === tl && (s => qc.every(w => s.has(w)))(new Set(gTok(p.ctx_ru + ' ' + p.ctx_uz + ' ' + p.uz + ' ' + p.ru)))); if (f.length) best = f.concat(best.filter(p => p.uz !== tl)); }
            const lbl = p => ru ? p.ru : p.uz, ctx = p => ru ? p.ctx_ru : p.ctx_uz, val = p => (ru ? p.v : p.v_uz) + (p.unit && !String(ru ? p.v : p.v_uz).includes(p.unit) ? ' ' + p.unit : ''), src = p => ru ? p.src : p.src_uz;
            const same = best.every(p => lbl(p) === lbl(best[0]));
            let lines;
            if (same) lines = [ '📏 ' + lbl(best[0]) + ':' ].concat(best.slice(0, 8).map(p => '• ' + (ctx(p) ? ctx(p) + ': ' : '') + val(p) + ' (' + src(p) + ')'));
            else lines = best.slice(0, 6).map(p => '📏 ' + lbl(p) + (ctx(p) ? ' — ' + ctx(p) : '') + ': ' + val(p) + ' (' + src(p) + ')');
            if (best.length > 8 && same) lines.push(ru ? '… и ещё ' + (best.length - 8) + ' значений — уточните тип подвижного состава' : "… yana " + (best.length - 8) + " ta qiymat — harakatlanuvchi tarkib turini aniqlashtiring (yuk vagoni, lokomotiv...)");
            const code = top.d && top.d.code ? top.d.code : d0.code;
            if (/yoriq|sinib|otkol|трещин|скол/.test(n) && /kolodk|колодк/.test(n)) { const p53 = d0.items.find(i => !i.pre && i.n === '5.3'); if (p53) lines.unshift((ru ? p53.ru : p53.uz) + ' (' + (ru ? 'п. 5.3' : '5.3-band') + ')', ru ? 'Допускаемые отклонения (таблица 8):' : "Yo'l qo'yiladigan chetlanishlar (8-jadval):"); }
            return lines.join('\n') + '\n📚 Manba: ' + code;
        }
        (function () {
            aiStage('Korxona hujjatlari va GOST oʻlchamlari', function (q, next) {
                try {
                    const t = kbTeachFind(q);
                    if (!t) {
                        // Foydalanuvchi o'zi yuklagan hujjatda aniq mos punkt bo'lsa — u birinchi (korxona yo'riqnomasi aniqroq)
                        const u = kbSearch(q, 1)[0];
                        if (u && /^📚/.test(u.d.src) && !ND_BUILTIN.some(d => u.d.src.indexOf(d.code) >= 0) && u.cov >= 0.7 && u.s >= 3) return { t: kbSnippet(u.d.text, q, 420) + '\n📚 Manba: ' + u.d.src.replace(/^\S+\s/, ''), personal: false };
                        const sp = kbSp(q); if (sp) return { t: sp, personal: false };
                        const g = gostAnswer(q); if (g) return { t: g, personal: false };
                        // O'lcham/me'yor so'ralgan, lekin hech bir hujjatda yo'q — texnika ro'yxati o'rniga halol javob
                        const n = aiNorm(q);
                        if (/diametr|balandlig|qalinlig|kengligi|uzunligi|o.?lcham|og.?irlig|bosim|диаметр|высот|толщин|ширин|длин|размер|давлен/.test(n) && /necha|nechi|qancha|qanday|сколько|какой|какая|каков/.test(n) && !/\b\d{4,}\b/.test(n)) {
                            const k = kbSearch(q, 1)[0];
                            if (!(k && /^📚/.test(k.d.src) && k.cov >= 0.7)) return { t: "Bu o'lcham bo'yicha me'yor hali ilova bazasida yo'q.\nTegishli standart yoki hujjatni (masalan, g'ildirak juftligi, avtostsepka bo'yicha GOST) «Normativ hujjatlar → Hujjatlar bazasi»ga yuklang — AI undan aniq raqam va manba bilan javob beradi.", personal: false };
                        }
                    }
                } catch (e) { console.error(e); }
                return next(q);
            });
        })();
        // Bilim bazasi indeksiga standart matni (ikki tilda) qo'shiladi
        (function () {
            kbBuild = agmkExtend('kbBuild', '32-bosqich (1): Normativ hujjatlar — boʼlimlar (Vagon, Lokomotiv...), ichki standartlar (R · Bilim bazasi indeksiga standart matni (ikki tilda) qoʼshiladi', kbBuild, o => function () {
                const od = ndDocs;
                ndDocs = function () {
                    const l = od().slice();
                    ND_BUILTIN.forEach(d => {
                        const pu = [];
                        d.items.forEach(it => {
                            if (it.pre || it.t === 'h' || it.t === 'fig') return;
                            if (it.t === 'p') { if (it.n) pu.push({ n: it.n, t: it.uz + ' ' + it.ru }); else if (pu.length) pu[pu.length - 1].t += ' ' + it.uz + ' ' + it.ru; return; }
                            if (it.t === 'table') { const rows = gostTableRow(d, it.n, null, 'uz').rows; rows.slice(1).forEach(r => { if (r.join('').trim()) pu.push({ n: it.n + '-jadval', t: it.cap_uz + ': ' + r.filter(Boolean).join(' — ') }); }); }
                        });
                        l.push({ id: d.id, title: d.code, punkts: pu });
                    });
                    return l;
                };
                let r; try { r = o.apply(this, arguments); } finally { ndDocs = od; }
                try { const codes = ND_BUILTIN.map(d => d.code); KB.docs.forEach(x => { if (/^📚 /.test(x.src) && codes.some(c => x.src.indexOf('📚 ' + c + ',') === 0)) x.src = '🏛 ' + x.src.slice(3); }); } catch (e) {}
                return r;
            });
            KB.dirty = true;
        })();
        // Lug'atdagi GOST ta'rifi yangilanadi
        try { const g = KB_GLOSS.find(x => x[0][0] === 'gost'); if (g) g[1] = "GOST (ГОСТ) — davlatlararo standart. Ilovada to'liq matni bor: GOST 33421-2015 (tormoz kolodkalari) — ruscha asl va o'zbekcha tarjima, 10 ta jadval va me'yorlar. Masalan so'rang: «yuk vagoni kolodkasining Brinell qattiqligi qancha» yoki «GOST 33421 8-jadval 7-punkt»."; } catch (e) {}

