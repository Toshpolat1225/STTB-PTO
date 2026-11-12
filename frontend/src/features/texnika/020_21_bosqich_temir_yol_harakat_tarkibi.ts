        // =====================================================================
        // YANGI (21-bosqich): TEMIR YO'L HARAKAT TARKIBI.
        // Tarkiblar (lokomotiv + vagonlar), vagon/lokomotiv/avtotraktor/yo'l texnikasi joylashuvi va holati.
        // Boshqa bo'limlar bilan bog'langan: ta'mirdagi texnika harakatda ko'rsatilmaydi.
        // =====================================================================
        const HR_KEY = 'agmk_harakat';
        const HR_STALE_H = 12;
        const HR_T = { yukli: ['🟢', 'Yuk bilan harakatda'], yuksiz: ['🔵', 'Yuksiz harakatda'], kutish: ['🟡', 'Kutishda'], yuklash: ['🟠', 'Yuklanmoqda / tushirilmoqda'] };
        const HR_U = { tarkib: ['🚂', 'Tarkibda'], ishda: ['🟢', 'Ishda'], kutish: ['🟡', 'Kutishda'], yuklash: ['🟠', 'Yuklanmoqda / tushirilmoqda'], bosh: ['⚪', "Bo'sh / rezervda"], tamirda: ['🔧', "Ta'mirda"] };
        const HR_GROUPS = { vag: ['tarkib', 'kutish', 'yuklash', 'bosh', 'tamirda'], lok: ['tarkib', 'kutish', 'bosh', 'tamirda'], avto: ['ishda', 'kutish', 'bosh', 'tamirda'], yol: ['ishda', 'kutish', 'bosh', 'tamirda'] };
        const HR_KIND = { vag: ['🚃', 'Vagonlar'], lok: ['🚂', 'Lokomotivlar'], avto: ['🚜', 'Avtotraktor texnikasi'], yol: ['🛤️', "Temir yo'l texnikasi"] };
        const HR = { view: 'home', kind: null, tab: 'all', page: 1, place: null, edit: null, sel: [] };
        function hrDB() { let d = null; try { d = JSON.parse(localStorage.getItem(HR_KEY) || 'null'); } catch (e) {} d = d || {}; d.tarkiblar = d.tarkiblar || []; d.units = d.units || {}; d.log = d.log || []; d.seq = d.seq || 0; return d; }
        function hrSave(d) { try { localStorage.setItem(HR_KEY, JSON.stringify(d)); try { KV_SYNC.dirty = true; if (typeof storePush === 'function') storePush(); } catch (e) {} } catch (e) { alert("⚠️ Xotira to'ldi — harakat ma'lumoti saqlanmadi."); } }
        function canHR() { return !!currentUser && (isAdmin() || isRahbar() || /dispetch|диспетч|navbatchi|дежур/i.test(currentUser.role || '') || (typeof hasRole === 'function' && hasRole('hr'))); }
        function hrLog(d, text, icon) { d.log.unshift({ at: new Date().toISOString(), by: meObj(), text: text, icon: icon || '📝', gps: typeof curGpsFix === 'function' ? curGpsFix() : null }); d.log = d.log.slice(0, 400); }
        function hrKindOf(v) { return !v.kind ? 'vag' : v.kind === 'lok' ? 'lok' : v.kind === 'avto' ? 'avto' : v.kind === 'yol' ? 'yol' : null; }
        function hrList(kind) { return kind === 'vag' ? onlyVagons() : kind === 'lok' ? onlyLoks() : kind === 'avto' ? onlyAvto() : onlyYol(); }
        function hrName(v) { return !v ? '—' : !v.kind ? 'Vagon №' + vagonNo(v) : unitLabel(v); }
        function hrPlace(id) { const o = id && typeof INFRA_BY !== 'undefined' ? INFRA_BY[id] : null; return o ? (typeof infraShort === 'function' ? infraShort(o) : o.uz) : (id ? id : "joyi ko'rsatilmagan"); }
        function hrInRepair(v) { if (!v) return false; if (v.status === 'Tamirda') return true; if (v.kind === 'yol' && typeof pprNext === 'function') { const n = pprNext(v); if (n && n.ongoing) return true; } return false; }
        function hrStale(at) { return at && (Date.now() - new Date(at).getTime()) > HR_STALE_H * 3600000; }
        function hrAgo(at) { if (!at) return ''; const m = Math.round((Date.now() - new Date(at).getTime()) / 60000); return m < 60 ? m + ' daq oldin' : m < 1440 ? Math.round(m / 60) + ' soat oldin' : Math.round(m / 1440) + ' kun oldin'; }
        // Ta'mirga ketgan texnikani tarkiblardan chiqarish, noto'g'ri holatlarni tuzatish (yolg'on ma'lumot bo'lmasin)
        function hrSanitize() {
            const d = hrDB(); let ch = false; vagonlarData.forEach(v => { if (v.kind === 'yol') recalcVagonStatus(v); });
            const byId = id => vagonlarData.find(x => x.id === id);
            d.tarkiblar.forEach(t => {
                const lok = byId(t.lokId);
                if (t.lokId && (!lok || hrInRepair(lok))) { hrLog(d, 'Tarkib №' + t.no + ': lokomotiv ' + hrName(lok) + " ta'mirga ketgani uchun tarkibdan chiqarildi", '🔧'); t.lokId = null; ch = true; }
                const bad = t.vagonIds.filter(id => { const v = byId(id); return !v || hrInRepair(v); });
                if (bad.length) { t.vagonIds = t.vagonIds.filter(id => !bad.includes(id)); hrLog(d, 'Tarkib №' + t.no + ': ' + bad.map(id => hrName(byId(id))).join(', ') + " ta'mirda — tarkibdan chiqarildi", '🔧'); ch = true; }
                if ((t.holat === 'yukli' || t.holat === 'yuksiz') && !t.lokId) { t.holat = 'kutish'; hrLog(d, 'Tarkib №' + t.no + ': lokomotivsiz — holati «Kutishda»ga o\'zgartirildi', '⚠️'); ch = true; }
                if (t.holat === 'yukli' && !t.vagonIds.length) { t.holat = 'kutish'; ch = true; }
            });
            Object.keys(d.units).forEach(id => { const v = byId(+id); if (!v) { delete d.units[id]; ch = true; } else if (hrInRepair(v) && d.units[id].holat !== 'tamirda') { delete d.units[id]; ch = true; } });
            if (ch) hrSave(d);
            return d;
        }
        function hrOnTamir(v) { hrSanitize(); }
        function hrState(v, d) {
            if (hrInRepair(v)) return { k: 'tamirda' };
            const t = d.tarkiblar.find(x => x.lokId === v.id || x.vagonIds.includes(v.id));
            if (t) return { k: 'tarkib', t: t, joy: t.joy, at: t.updAt };
            const u = d.units[v.id]; if (u) return { k: u.holat, joy: u.joy, at: u.updAt, izoh: u.izoh, by: u.by, sabab: u.sabab || '' };
            return { k: 'bosh' };
        }
        function openHR() { hrSanitize(); HR.view = 'home'; openScreen('screen-hr'); renderHrHome(); }
        function renderHrHome() {
            const d = hrSanitize(), T = d.tarkiblar;
            const mov = T.filter(t => t.holat === 'yukli' || t.holat === 'yuksiz').length, vagIn = T.reduce((s, t) => s + t.vagonIds.length, 0);
            $id('hrSum').innerHTML = `<span>🚂 Tarkiblar: ${T.length}</span><span>🟢 Harakatda: ${mov}</span><span>🟡 Kutishda: ${T.filter(t => t.holat === 'kutish').length}</span><span>🚃 Tarkibdagi vagonlar: ${vagIn}</span>` + (canHR() ? '' : '<span>👁 Faqat ko\'rish</span>');
            const cnt = kind => { const l = hrList(kind), g = {}; l.forEach(v => { const k = hrState(v, d).k; g[k] = (g[k] || 0) + 1; }); return g; };
            const card = (ic, t, sub, on) => `<div class="btn-card inf-card" onclick="${on}"><div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${escapeHtml(t)}<small>${escapeHtml(sub)}</small></span></div><span class="btn-arrow">›</span></div>`;
            const sub = kind => { const g = cnt(kind); return HR_GROUPS[kind].filter(k => g[k]).map(k => HR_U[k][0] + ' ' + (HR_SHORT[k] || '') + ' ' + g[k]).join(' · ') || '—'; };
            const stale = T.filter(t => hrStale(t.updAt)).length;
            $id('hrHome').innerHTML =
                (typeof flagOn === 'function' && flagOn('disp') ? dispHomeBlock(d) : '') +
                hrLegendHtml() +
                `<div class="inf-sec">🚆 Harakat tarkibi — temir yoʻl</div>` +
                card('🚂', 'Tarkiblar (poyezdlar)', T.length + ' ta · ' + Object.keys(HR_T).map(k => HR_T[k][0] + ' ' + (HR_TSHORT[k] || '') + ' ' + T.filter(t => t.holat === k).length).join(' · ') + (stale ? ' · ⏱ eskirgan ' + stale : ''), "openHrList('tarkib')") +
                card('🚉', 'Stansiyalar kesimida', "Qaysi stansiya va peregonda nima turibdi", "openHrList('st')") +
                card('📡', 'GPS — sxemada jonli harakat', (typeof gdStatusTxt === 'function' ? gdStatusTxt() : 'Tarkiblar sxemada'), "gdOpen()") +
                ['vag', 'lok', 'yol'].map(k => card(HR_KIND[k][0], HR_KIND[k][1], (k === 'yol' ? 'drezina, motovoz, kran, yoʻl mashinalari · ' : '') + hrList(k).length + ' ta · ' + sub(k), `openHrList('${k}')`)).join('') +
                `<div class="inf-sec">🚚 Avtotraktor texnikasi</div>` +
                card(HR_KIND.avto[0], HR_KIND.avto[1], 'avtomobil, traktor, yuklagich, ekskavator, avtobus · ' + hrList('avto').length + ' ta · ' + sub('avto'), "openHrList('avto')") +
                card('🧭', 'GPS-navigator', "Texnikalar xaritada, yoʻnalish, iz va masofa", "nvOpen()") +
                `<div class="inf-sec">📜 Nazorat</div>` + card('📜', 'Harakat jurnali', d.log.length + ' ta yozuv · oxirgisi: ' + (d.log[0] ? hrAgo(d.log[0].at) : '—'), "openHrList('log')") +
                `<div class="inf-sec">🔩 Ta'minot</div>` + card('🔩', 'Ehtiyot qismlar', "Materiallar va ehtiyot qismlar sarfi me'yori", "openSP(null,'hr')");
        }
        function hrBack() { if (HR.view === 'place') { HR.view = 'st'; HR.kind = 'st'; HR.tab = 'all'; renderHrList(); return; } openHR(); }
        function openHrList(kind) { HR.view = kind; HR.kind = kind; HR.tab = 'all'; HR.page = 1; HR.place = null; $id('hrSearch').value = ''; openScreen('screen-hr-list'); renderHrList(); }
        function setHrTab(t) { HR.tab = t; HR.page = 1; renderHrList(); }
        function hrMatch(s) { const q = aiNorm($id('hrSearch').value || '').trim(); return !q || q.split(/\s+/).every(t => aiNorm(s).includes(t)); }
        function hrTabsHtml(list) { return list.map(([k, l, n]) => `<div class="tab${HR.tab === k ? ' active' : ''}" onclick="setHrTab('${k}')">${l}<span class="tab-cnt">${n}</span></div>`).join(''); }
        function renderHrList() {
            const d = hrSanitize(), kind = HR.kind, el = $id('hrList');
            if (kind === 'tarkib') {
                $id('hrListTitle').innerText = 'Tarkiblar';
                const T = d.tarkiblar;
                $id('hrTabs').innerHTML = hrTabsHtml([['all', 'Barchasi', T.length]].concat(Object.keys(HR_T).map(k => [k, HR_T[k][0] + ' ' + HR_T[k][1].split(' ')[0] + (k === 'yukli' ? ' bilan' : ''), T.filter(t => t.holat === k).length])));
                const l = T.filter(t => (HR.tab === 'all' || t.holat === HR.tab) && hrMatch(t.no + ' ' + hrName(vagonlarData.find(x => x.id === t.lokId)) + ' ' + hrPlace(t.joy) + ' ' + (t.yuk || '')));
                el.innerHTML = (l.map(t => hrTarkibCard(t)).join('') || '<div class="xt-empty">Tarkib yo\'q' + (canHR() ? '. «+ Yangi tarkib» tugmasini bosing.' : '.') + '</div>') +
                    (canHR() ? `<button class="action-btn hr-add" onclick="hrEditTarkib(null)">＋ Yangi tarkib</button>` : '');
                return;
            }
            if (kind === 'st' || HR.view === 'place') { renderHrPlaces(d); return; }
            if (kind === 'log') {
                $id('hrListTitle').innerText = 'Harakat jurnali'; $id('hrTabs').innerHTML = '';
                const l = d.log.filter(x => hrMatch(x.text + ' ' + (x.by ? x.by.name : '')));
                el.innerHTML = l.slice(0, 200).map(x => `<div class="hr-log">${x.icon || '📝'} ${escapeHtml(x.text)}<small>${escapeHtml(fmtDateTime(x.at))} · ${escapeHtml(x.by ? meLabel(x.by) : '')}${x.gps ? ' · 📍 ' + x.gps.lat.toFixed(5) + ', ' + x.gps.lon.toFixed(5) : ''}</small></div>`).join('') || '<div class="xt-empty">Jurnal bo\'sh</div>';
                return;
            }
            // vag / lok / avto / yol
            $id('hrListTitle').innerText = HR_KIND[kind][1];
            const all = hrList(kind).map(v => ({ v: v, s: hrState(v, d) }));
            $id('hrTabs').innerHTML = hrTabsHtml([['all', 'Barchasi', all.length]].concat(HR_GROUPS[kind].map(k => [k, HR_U[k][0] + ' ' + HR_U[k][1].split(' /')[0], all.filter(x => x.s.k === k).length])));
            const l = all.filter(x => (HR.tab === 'all' || x.s.k === HR.tab) && hrMatch(hrName(x.v) + ' ' + (x.v.inv || '') + ' ' + (x.v.type || '') + ' ' + hrPlace(x.s.joy) + ' ' + (x.s.t ? x.s.t.no : '')));
            const shown = l.slice(0, HR.page * 60);
            el.innerHTML = `<div class="vg-count">Topildi: ${l.length} ta</div>` + shown.map(x => hrUnitCard(x.v, x.s)).join('') +
                (l.length > shown.length ? `<button class="action-btn" onclick="HR.page++; renderHrList()">Yana ko'rsatish (${l.length - shown.length})</button>` : '');
        }
        function hrUnitCard(v, s) {
            const st = HR_U[s.k] || ['•', s.k], warn = !v.kind && v.status === "Ta'mir talab" ? "⚠️ DR muddati: ta'mir talab" : '';
            let info = `Turi: <span>${escapeHtml(v.type || '')}</span>${v.inv ? ' | Inv: <span>' + escapeHtml(v.inv) + '</span>' : ''}`;
            if (s.k === 'tarkib') info += `<br>Tarkib: <span>№${escapeHtml(s.t.no)}</span> · ${HR_T[s.t.holat][0]} ${HR_T[s.t.holat][1]} · Joyi: <span>${escapeHtml(hrPlace(s.t.joy))}</span>`;
            else if (s.k === 'tamirda') info += `<br><span>🔧 Ta'mirda</span> — ${v.kind === 'yol' ? 'rejali ta\'mir (PPR)' : 'pasportda «Tamirda» belgilangan'}`;
            else if (s.joy || s.izoh) info += `<br>Joyi: <span>${escapeHtml(hrPlace(s.joy))}</span>${s.izoh ? ' · ' + escapeHtml(s.izoh) : ''}`;
            try { const h = dispIdleH(v, s); if (h !== null) info += `<br><span class="${h >= dispLim() ? 'dp-over' : 'dp-idle'}">⏳ ${dispHrs(h)} turibdi${s.sabab ? ' · ' + escapeHtml(s.sabab) : ' · sababi koʻrsatilmagan'}</span>`; } catch (e) {}
            return `<div class="hr-card h-${s.k}"><div class="hr-h"><b>${escapeHtml(hrName(v))}</b><span class="hr-st">${st[0]} ${escapeHtml(st[1])}</span></div>
                <div class="hr-i">${info}</div>${warn ? `<div class="hr-warn">${warn}</div>` : ''}
                ${s.at ? `<div class="${hrStale(s.at) ? 'hr-stale' : 'hr-warn'}" style="${hrStale(s.at) ? '' : 'color:#94a3b8'}">${hrStale(s.at) ? '⏱ Eskirgan: ' : '🕒 '}${hrAgo(s.at)} yangilangan</div>` : ''}
                <div class="hr-acts"><button onclick="openPassport(${v.id})">📄 Pasport</button>${canHR() && s.k !== 'tamirda' && s.k !== 'tarkib' ? `<button onclick="hrEditUnit(${v.id})">✏️ Holat / joy</button>` : ''}${canHR() && s.k === 'tarkib' ? `<button onclick="hrEditTarkib('${s.t.id}')">🚂 Tarkib №${escapeHtml(s.t.no)}</button>` : ''}</div></div>`;
        }
        function hrTarkibCard(t) {
            const lok = vagonlarData.find(x => x.id === t.lokId), vs = t.vagonIds.map(id => vagonlarData.find(x => x.id === id)).filter(Boolean);
            const types = {}; vs.forEach(v => { types[v.type] = (types[v.type] || 0) + 1; });
            const warn = vs.filter(v => v.status === "Ta'mir talab").length;
            return `<div class="hr-card h-${t.holat}"><div class="hr-h"><b>🚂 Tarkib №${escapeHtml(t.no)}</b><span class="hr-st">${HR_T[t.holat][0]} ${HR_T[t.holat][1]}</span></div>
                <div class="hr-i">Lokomotiv: <span>${lok ? escapeHtml(hrName(lok)) : "yo'q"}</span> · Mashinist: <span>${escapeHtml(t.mashinist || '—')}</span>
                <br>Joyi: <span>${escapeHtml(hrPlace(t.joy))}</span>${t.from || t.to ? ` · Yo'nalish: <span>${escapeHtml(hrPlace(t.from))} → ${escapeHtml(hrPlace(t.to))}</span>` : ''}
                <br>Vagonlar: <span>${vs.length} ta</span>${Object.keys(types).length ? ' (' + Object.keys(types).map(k => escapeHtml(k) + ': ' + types[k]).join(', ') + ')' : ''}${t.yuk ? ' · Yuk: <span>' + escapeHtml(t.yuk) + '</span>' : ''}</div>
                ${vs.length ? `<div class="hr-chips">${vs.slice(0, 30).map(v => `<i class="${v.status === "Ta'mir talab" ? 'w' : ''}">№${escapeHtml(vagonNo(v))}</i>`).join('')}${vs.length > 30 ? '<i>+' + (vs.length - 30) + '</i>' : ''}</div>` : ''}
                ${warn ? `<div class="hr-warn">⚠️ ${warn} ta vagonning DR muddati «Ta'mir talab»</div>` : ''}
                <div class="${hrStale(t.updAt) ? 'hr-stale' : 'hr-warn'}" style="${hrStale(t.updAt) ? '' : 'color:#94a3b8'}">${hrStale(t.updAt) ? '⏱ Eskirgan: ' : '🕒 '}${hrAgo(t.updAt)} · ${escapeHtml(t.updBy || '')}</div>
                ${canHR() ? `<div class="hr-acts"><button onclick="hrQuick('${t.id}')">🔄 Holatni o'zgartirish</button><button onclick="hrEditTarkib('${t.id}')">✏️ Tahrirlash</button><button class="del" onclick="hrDelTarkib('${t.id}')">🗑</button></div>` : ''}</div>`;
        }
        function renderHrPlaces(d) {
            const el = $id('hrList');
            const items = [];
            d.tarkiblar.forEach(t => items.push({ joy: t.joy, html: hrTarkibCard(t), q: 'tarkib ' + t.no }));
            ['vag', 'lok', 'avto', 'yol'].forEach(k => hrList(k).forEach(v => { const s = hrState(v, d); if (s.k !== 'tarkib' && s.joy) items.push({ joy: s.joy, html: hrUnitCard(v, s), q: hrName(v) }); }));
            if (HR.view === 'place') {
                $id('hrListTitle').innerText = hrPlace(HR.place); $id('hrTabs').innerHTML = '';
                const l = items.filter(x => x.joy === HR.place && hrMatch(x.q));
                el.innerHTML = l.map(x => x.html).join('') || '<div class="xt-empty">Bu joyda hozir hech narsa belgilanmagan</div>';
                return;
            }
            $id('hrListTitle').innerText = 'Stansiyalar kesimida'; $id('hrTabs').innerHTML = '';
            const by = {}; items.forEach(x => { if (x.joy) by[x.joy] = (by[x.joy] || 0) + 1; });
            const places = typeof INFRA_BY !== 'undefined' ? Object.values(INFRA_BY) : [];
            const l = places.filter(o => hrMatch(o.uz + ' ' + o.ru)).sort((a, b) => (by[b.id] || 0) - (by[a.id] || 0));
            el.innerHTML = `<div class="card-list">` + l.map(o => `<div class="btn-card inf-card" onclick="HR.view='place'; HR.place='${o.id}'; renderHrList()"><div class="btn-card-content"><span class="btn-icon">${o.kind === 'pr' ? '🛤️' : o.kind === 'ob' ? '🔀' : '🚉'}</span><span class="btn-text">${escapeHtml(o.uz)}<small>${escapeHtml(o.ru)}</small></span></div>${by[o.id] ? `<span class="inf-cnt">${by[o.id]}</span>` : ''}<span class="btn-arrow">›</span></div>`).join('') + `</div>`;
        }
        // ---- Tahrirlash oynalari ----
        function hrPlaceOpts(cur, empty) {
            const P = typeof INFRA_BY !== 'undefined' ? Object.values(INFRA_BY) : [];
            const grp = (t, l) => `<optgroup label="${t}">` + l.map(o => `<option value="${o.id}"${o.id === cur ? ' selected' : ''}>${escapeHtml(o.uz)}</option>`).join('') + `</optgroup>`;
            return `<option value="">${empty || '— tanlang —'}</option>` + grp('Stansiyalar', P.filter(o => o.kind === 'st')) + grp('Peregonlar', P.filter(o => o.kind === 'pr')) + grp("Kirish yo'llari / depolar", P.filter(o => o.kind === 'ob'));
        }
        function hrCloseModal() { $id('hrModal').classList.add('hidden'); }
        function hrEditUnit(vid) {
            if (!canHR()) return;
            const v = vagonlarData.find(x => x.id === vid); if (!v) return;
            const d = hrDB(), s = hrState(v, d), kind = hrKindOf(v);
            if (s.k === 'tamirda') { alert("🔧 " + hrName(v) + " ta'mirda — harakat holatini o'zgartirib bo'lmaydi."); return; }
            const opts = HR_GROUPS[kind].filter(k => k !== 'tarkib' && k !== 'tamirda');
            $id('hrModalBody').innerHTML = `<h3>✏️ ${escapeHtml(hrName(v))}</h3>
                <div class="hr-f"><label>HOLATI</label><select id="hrUHol" onchange="$id('hrUSabW').style.display = DISP_IDLE.includes(this.value) ? '' : 'none'">${opts.map(k => `<option value="${k}"${s.k === k ? ' selected' : ''}>${HR_U[k][0]} ${HR_U[k][1]}</option>`).join('')}</select></div>
                <div class="hr-f" id="hrUSabW" style="${DISP_IDLE.includes(s.k) ? '' : 'display:none'}"><label>NEGA TURIBDI (sabab)</label><select id="hrUSab"><option value="">— tanlang —</option>${DISP_SABAB.map(x => `<option${s.sabab === x ? ' selected' : ''}>${escapeHtml(x)}</option>`).join('')}</select></div>
                <div class="hr-f"><label>JOYI (stansiya / peregon)</label><select id="hrUJoy">${hrPlaceOpts(s.joy)}</select></div>
                <div class="hr-f"><label>IZOH</label><input id="hrUIz" value="${escapeHtml(s.izoh || '')}" placeholder="masalan: 5-yo'lda, yuk: ruda"></div>
                <div class="hr-btns"><button class="action-btn" style="background:#475569" onclick="hrCloseModal()">Bekor</button><button class="action-btn" onclick="hrSaveUnit(${vid})">💾 Saqlash</button></div>`;
            $id('hrModal').classList.remove('hidden');
        }
        function hrSaveUnit(vid) {
            const v = vagonlarData.find(x => x.id === vid), d = hrDB(); if (!v || hrInRepair(v)) { hrCloseModal(); return; }
            const hol = $id('hrUHol').value, joy = $id('hrUJoy').value, iz = $id('hrUIz').value.trim(), sab = DISP_IDLE.includes(hol) ? (($id('hrUSab') || {}).value || '') : '';
            if (hol !== 'bosh' && !joy) { alert('Joyini tanlang (stansiya yoki peregon).'); return; }
            const prev = d.units[vid], same = prev && prev.holat === hol && prev.joy === joy; // holat o'zgarmasa — turib qolish vaqti davom etadi
            d.units[vid] = { holat: hol, joy: joy, izoh: iz, sabab: sab, updAt: new Date().toISOString(), since: same ? (prev.since || prev.updAt) : new Date().toISOString(), by: authorStr() };
            if (!same) dispEv(d, vid, hol, joy, sab);
            hrLog(d, hrName(v) + ': ' + HR_U[hol][1] + (joy ? ' — ' + hrPlace(joy) : '') + (iz ? ' (' + iz + ')' : ''), HR_U[hol][0]);
            hrSave(d); hrCloseModal(); if (HR.kind) renderHrList(); showToast('✅ Saqlandi'); // dispetcher panelidan saqlanganda ro'yxat ochilmagan bo'lishi mumkin
            try { const sd = $id('screen-disp'); if (sd && sd.classList.contains('active')) dispRender(); } catch (e) {}
        }
        function hrEditTarkib(tid) {
            if (!canHR()) return;
            const d = hrSanitize(), t = tid ? d.tarkiblar.find(x => x.id === tid) : null;
            HR.edit = tid; HR.sel = t ? t.vagonIds.slice() : [];
            const busyLok = new Set(d.tarkiblar.filter(x => x !== t && x.lokId).map(x => x.lokId));
            const loks = onlyLoks().map(v => { const dis = hrInRepair(v) ? "ta'mirda" : busyLok.has(v.id) ? 'boshqa tarkibda' : ''; return `<option value="${v.id}"${t && t.lokId === v.id ? ' selected' : ''}${dis ? ' disabled' : ''}>${escapeHtml(hrName(v))}${dis ? ' — ' + dis : v.status === "Ta'mir talab" ? ' ⚠️' : ''}</option>`; }).join('');
            const xs = typeof allXodims === 'function' ? allXodims().map(r => r.item).filter(it => it && it.name) : [];
            xs.sort((a, b) => (/mashinist/i.test(b.lavozim || '') ? 1 : 0) - (/mashinist/i.test(a.lavozim || '') ? 1 : 0));
            $id('hrModalBody').innerHTML = `<h3>🚂 ${t ? 'Tarkib №' + escapeHtml(t.no) : 'Yangi tarkib'}</h3>
                <div class="hr-f"><label>TARKIB RAQAMI</label><input id="hrTNo" value="${escapeHtml(t ? t.no : String((d.seq || 0) + 1))}"></div>
                <div class="hr-f"><label>HOLATI</label><select id="hrTHol">${Object.keys(HR_T).map(k => `<option value="${k}"${(t ? t.holat : 'kutish') === k ? ' selected' : ''}>${HR_T[k][0]} ${HR_T[k][1]}</option>`).join('')}</select></div>
                <div class="hr-f"><label>LOKOMOTIV</label><select id="hrTLok"><option value="">— lokomotivsiz —</option>${loks}</select></div>
                <div class="hr-f"><label>MASHINIST</label><input id="hrTMash" class="pk-tap" readonly onclick="hrPickMash()" value="${escapeHtml(t ? t.mashinist || '' : '')}" placeholder="👤 Bosing — tabel, familiya yoki ism bo'yicha tanlash"></div>
                <div class="hr-f"><label>HOZIRGI JOYI</label><select id="hrTJoy">${hrPlaceOpts(t ? t.joy : '')}</select></div>
                <div class="hr-f"><label>YO'NALISH: QAYERDAN</label><select id="hrTFrom">${hrPlaceOpts(t ? t.from : '', '—')}</select></div>
                <div class="hr-f"><label>YO'NALISH: QAYERGA</label><select id="hrTTo">${hrPlaceOpts(t ? t.to : '', '—')}</select></div>
                <div class="hr-f"><label>YUK (turi / izoh)</label><input id="hrTYuk" value="${escapeHtml(t ? t.yuk || '' : '')}" placeholder="masalan: ruda, 60 t"></div>
                <div class="hr-f"><label>VAGONLAR (<span id="hrSelN">${HR.sel.length}</span> ta tanlandi)</label><div class="hr-sel" id="hrSel"></div>
                    <input id="hrVQ" placeholder="🔍 Vagon raqami yoki turi..." oninput="hrRenderPick()" style="margin-top:6px;"><div class="hr-pick" id="hrPick"></div></div>
                <div class="hr-btns"><button class="action-btn" style="background:#475569" onclick="hrCloseModal()">Bekor</button><button class="action-btn" onclick="hrSaveTarkib()">💾 Saqlash</button></div>`;
            hrRenderPick(); $id('hrModal').classList.remove('hidden');
        }
        function hrRenderPick() {
            const d = hrDB(), q = aiNorm(($id('hrVQ') || {}).value || '').trim();
            const busy = {}; d.tarkiblar.forEach(t => { if (t.id !== HR.edit) t.vagonIds.forEach(id => { busy[id] = t.no; }); });
            $id('hrSel').innerHTML = HR.sel.map(id => { const v = vagonlarData.find(x => x.id === id); return v ? `<i onclick="hrTog(${id})">№${escapeHtml(vagonNo(v))} ✕</i>` : ''; }).join('');
            $id('hrSelN').innerText = HR.sel.length;
            const l = onlyVagons().filter(v => !q || q.split(/\s+/).every(t => aiNorm(vagonNo(v) + ' ' + v.inv + ' ' + v.type).includes(t))).slice(0, 60);
            $id('hrPick').innerHTML = l.map(v => {
                const why = hrInRepair(v) ? "🔧 ta'mirda" : busy[v.id] ? 'tarkib №' + busy[v.id] : v.status === "Ta'mir talab" ? "⚠️ ta'mir talab" : '';
                const dis = hrInRepair(v) || busy[v.id];
                return `<div class="${dis ? 'dis' : ''}" onclick="${dis ? '' : 'hrTog(' + v.id + ')'}"><input type="checkbox" ${HR.sel.includes(v.id) ? 'checked' : ''} ${dis ? 'disabled' : ''} style="width:auto; pointer-events:none;"> №${escapeHtml(vagonNo(v))} <small>${escapeHtml(v.type)}${why ? '<br>' + why : ''}</small></div>`;
            }).join('') || '<div>Topilmadi</div>';
        }
        function hrTog(id) { const i = HR.sel.indexOf(id); if (i >= 0) HR.sel.splice(i, 1); else HR.sel.push(id); hrRenderPick(); }
        function hrSaveTarkib() {
            const d = hrSanitize(), no = $id('hrTNo').value.trim(), hol = $id('hrTHol').value, lokId = +$id('hrTLok').value || null, joy = $id('hrTJoy').value;
            if (!no) { alert('Tarkib raqamini kiriting.'); return; }
            if (d.tarkiblar.some(x => x.no === no && x.id !== HR.edit)) { alert('№' + no + ' raqamli tarkib allaqachon bor.'); return; }
            if ((hol === 'yukli' || hol === 'yuksiz') && !lokId) { alert("🚂 Lokomotivsiz tarkib harakatda bo'la olmaydi. Lokomotivni tanlang yoki holatni «Kutishda» qiling."); return; }
            if (hol === 'yukli' && !HR.sel.length) { alert("Yuk bilan harakatlanish uchun kamida bitta vagon tanlang."); return; }
            if (!joy) { alert('Tarkibning hozirgi joyini tanlang.'); return; }
            const lok = vagonlarData.find(x => x.id === lokId);
            if (lok && hrInRepair(lok)) { alert("🔧 Bu lokomotiv ta'mirda."); return; }
            const busy = new Set(); d.tarkiblar.forEach(t => { if (t.id !== HR.edit) { t.vagonIds.forEach(i => busy.add(i)); if (t.lokId) busy.add(t.lokId); } });
            if (lokId && busy.has(lokId)) { alert('Bu lokomotiv boshqa tarkibda.'); return; }
            const bad = HR.sel.filter(id => busy.has(id) || hrInRepair(vagonlarData.find(x => x.id === id)));
            if (bad.length) { alert("Ayrim vagonlar ta'mirda yoki boshqa tarkibda — ular olib tashlandi."); HR.sel = HR.sel.filter(id => !bad.includes(id)); hrRenderPick(); return; }
            let t = HR.edit ? d.tarkiblar.find(x => x.id === HR.edit) : null; const isNew = !t;
            if (!t) { d.seq = (d.seq || 0) + 1; t = { id: 't' + Date.now().toString(36), vagonIds: [] }; d.tarkiblar.push(t); }
            const old = JSON.stringify([t.holat, t.joy, t.lokId, t.vagonIds.length]);
            Object.assign(t, { no: no, holat: hol, lokId: lokId, joy: joy, from: $id('hrTFrom').value, to: $id('hrTTo').value, mashinist: $id('hrTMash').value.trim(), yuk: $id('hrTYuk').value.trim(), vagonIds: HR.sel.slice(), updAt: new Date().toISOString(), updBy: authorStr() });
            HR.sel.concat(lokId ? [lokId] : []).forEach(id => { delete d.units[id]; });
            if (old !== JSON.stringify([t.holat, t.joy, t.lokId, t.vagonIds.length])) t.vagonIds.forEach(id => dispEv(d, id, dispTH(hol), joy, ''));
            hrLog(d, (isNew ? 'Yangi tarkib №' : 'Tarkib №') + no + ': ' + HR_T[hol][1] + ' — ' + hrPlace(joy) + (lok ? ', ' + hrName(lok) : '') + ', ' + t.vagonIds.length + ' vagon' + (!isNew && old === JSON.stringify([t.holat, t.joy, t.lokId, t.vagonIds.length]) ? ' (tahrir)' : ''), HR_T[hol][0]);
            hrSave(d); hrCloseModal(); renderHrList(); showToast('✅ Tarkib №' + no + ' saqlandi');
        }
        function hrQuick(tid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid); if (!t || !canHR()) return;
            $id('hrModalBody').innerHTML = `<h3>🔄 Tarkib №${escapeHtml(t.no)}</h3>
                <div class="hr-f"><label>HOLATI</label><select id="hrQHol">${Object.keys(HR_T).map(k => `<option value="${k}"${t.holat === k ? ' selected' : ''}>${HR_T[k][0]} ${HR_T[k][1]}</option>`).join('')}</select></div>
                <div class="hr-f"><label>HOZIRGI JOYI</label><select id="hrQJoy">${hrPlaceOpts(t.joy)}</select></div>
                <div class="hr-btns"><button class="action-btn" style="background:#475569" onclick="hrCloseModal()">Bekor</button><button class="action-btn" onclick="hrQuickSave('${tid}')">💾 Saqlash</button></div>`;
            $id('hrModal').classList.remove('hidden');
        }
        function hrQuickSave(tid) {
            const d = hrSanitize(), t = d.tarkiblar.find(x => x.id === tid); if (!t) return;
            const hol = $id('hrQHol').value, joy = $id('hrQJoy').value;
            if ((hol === 'yukli' || hol === 'yuksiz') && !t.lokId) { alert("🚂 Lokomotivsiz tarkib harakatda bo'la olmaydi."); return; }
            if (hol === 'yukli' && !t.vagonIds.length) { alert('Tarkibda vagon yo\'q.'); return; }
            if (!joy) { alert('Joyini tanlang.'); return; }
            if (t.holat !== hol || t.joy !== joy) t.vagonIds.forEach(id => dispEv(d, id, dispTH(hol), joy, ''));
            t.holat = hol; t.joy = joy; t.updAt = new Date().toISOString(); t.updBy = authorStr();
            hrLog(d, 'Tarkib №' + t.no + ': ' + HR_T[hol][1] + ' — ' + hrPlace(joy), HR_T[hol][0]);
            hrSave(d); hrCloseModal(); renderHrList();
        }
        async function hrDelTarkib(tid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid); if (!t || !canHR()) return;
            if (!await uiConfirm('Tarkib №' + t.no + " tarqatilsinmi?\nVagonlar va lokomotiv «Bo'sh» holatiga o'tadi.")) return;
            d.tarkiblar = d.tarkiblar.filter(x => x !== t); (d.tdel = d.tdel || []).push({ id: t.id, at: new Date().toISOString() }); d.tdel = d.tdel.slice(-300);
            t.vagonIds.forEach(id => dispEv(d, id, 'bosh', t.joy, ''));
            hrLog(d, 'Tarkib №' + t.no + ' tarqatildi (' + t.vagonIds.length + ' vagon)', '🗑');
            hrSave(d); renderHrList();
        }
        // Xarita sxemasida: har bir joydagi tarkiblar soni
        function hrMapBadges() {
            const svg = $id('mapSvg'); if (!svg || typeof INFRA_POS === 'undefined') return;
            svg.querySelectorAll('.hr-b').forEach(e => e.remove());
            const root = $id('mapRoot'); if (!root) return;
            const by = {}; hrDB().tarkiblar.forEach(t => { if (t.joy) by[t.joy] = (by[t.joy] || 0) + 1; });
            Object.keys(by).forEach(id => {
                let p = INFRA_POS[id]; const o = INFRA_BY[id];
                if (!p && o && o.kind === 'pr' && INFRA_POS[o.a] && INFRA_POS[o.b]) p = [(INFRA_POS[o.a][0] + INFRA_POS[o.b][0]) / 2, (INFRA_POS[o.a][1] + INFRA_POS[o.b][1]) / 2];
                if (!p) return;
                const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tx.setAttribute('class', 'hr-b'); tx.setAttribute('x', p[0] + 14); tx.setAttribute('y', p[1] + 26); tx.textContent = '🚂' + by[id];
                root.appendChild(tx);
            });
        }
        // AI: harakat haqida
        function hrAiReply(q) {
            if (!/tarkib|poyezd|harakat|qayerda turibdi|kutishda/.test(q)) return null;
            const d = hrSanitize(), T = d.tarkiblar;
            if (!T.length) return "🚂 Hozircha tarkiblar kiritilmagan. «Harakat tarkibi» bo'limida dispetcher «+ Yangi tarkib» orqali kiritadi.";
            const num = q.match(/(\d+)/);
            if (num) { const t = T.find(x => x.no === num[1]); if (t) { const lok = vagonlarData.find(x => x.id === t.lokId); return '🚂 Tarkib №' + t.no + ': ' + HR_T[t.holat][1] + ', joyi: ' + hrPlace(t.joy) + (t.to ? ', yo\'nalish: ' + hrPlace(t.from) + ' → ' + hrPlace(t.to) : '') + ', lokomotiv: ' + (lok ? hrName(lok) : "yo'q") + ', vagonlar: ' + t.vagonIds.length + ' ta. Yangilangan: ' + hrAgo(t.updAt) + '.'; } }
            return "🚦 Harakat holati:\n" + Object.keys(HR_T).map(k => HR_T[k][0] + ' ' + HR_T[k][1] + ': ' + T.filter(t => t.holat === k).length).join('\n') +
                "\n🚃 Tarkiblardagi vagonlar: " + T.reduce((s, t) => s + t.vagonIds.length, 0) + (T.some(t => hrStale(t.updAt)) ? "\n⏱ Eskirgan (12 soatdan ortiq yangilanmagan): " + T.filter(t => hrStale(t.updAt)).map(t => '№' + t.no).join(', ') : '');
        }
        // Xarita balandligi: "Bo'limlar" ishorasi birinchi ekranda ko'rinsin
        function fitMapHeight() {
            const w = $id('mapWrap'), b = document.querySelector('#screen-map .set-body'); if (!w || !b || !$id('screen-map').classList.contains('active')) return;
            const top = b.getBoundingClientRect().top + 12 - b.scrollTop * 0;
            const h = Math.max(320, Math.round(window.innerHeight - top - 132));
            w.style.height = h + 'px';
            Object.values((typeof MAPG !== 'undefined' && MAPG.lf) || {}).forEach(m => { try { m.invalidateSize(); } catch (e) {} });
        }
        window.addEventListener('resize', () => { if ($id('screen-map') && $id('screen-map').classList.contains('active')) { fitMapHeight(); } });


