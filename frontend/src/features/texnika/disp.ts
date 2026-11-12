
        // =====================================================================
        // v3.5 — 🚦 DISPETCHERLIK («Harakat tarkibi» ustiga)
        //  Har bir holat o'zgarishi vaqti bilan yoziladi (d.ev) → vagon qancha turib qolgani, nega, kim belgilagani.
        //  Chegara (standart 24 soat) oshsa — ogohlantirish. Hisobot: turib qolish soatlari, sabablar, eng ko'p turgan vagonlar.
        //  Maʼlumot barcha telefonlarda bir xil (server orqali, har vagon bo'yicha eng yangi holat).
        // =====================================================================
        var DISP_IDLE = ['kutish', 'bosh'];
        var DISP_SABAB = ['Yuk yoʻq', 'Lokomotiv yoʻq', 'Yuklash / tushirish navbati', 'Taʼmir kutmoqda', 'Hujjat rasmiylashtirilmoqda', 'Yoʻl band', 'Rezerv (reja boʻyicha)', 'Boshqa'];
        var DISP_H = { harak: '🚆 Harakatda', ishda: '🟢 Ishda', yuklash: '🟠 Yuklanmoqda', kutish: '🟡 Kutishda', bosh: '⚪ Boʻsh / rezerv', tamirda: '🔧 Taʼmirda' };
        var DP = { tab: 'now', days: 7 };
        function dispDay(t) { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); } // mahalliy kun (UTC emas)
        function dispTH(h) { return h === 'yukli' || h === 'yuksiz' ? 'harak' : h === 'yuklash' ? 'yuklash' : 'kutish'; } // tarkib holati → vagon holati
        function dispLim() { const c = (hrDB().cfg || {}); return +c.lim > 0 ? +c.lim : 24; }
        function dispHrs(h) { return h < 1 ? Math.round(h * 60) + ' daq' : h < 48 ? Math.round(h) + ' soat' : Math.floor(h / 24) + ' kun ' + Math.round(h % 24) + ' soat'; }
        function dispEv(d, vid, h, joy, s) {
            d.ev = d.ev || []; const last = [...d.ev].reverse().find(e => e.vid === vid);
            if (last && last.h === h && last.joy === joy && last.s === s) return;
            d.ev.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), vid: vid, h: h, joy: joy || '', s: s || '', at: new Date().toISOString(), by: typeof meTabel === 'function' ? meTabel() : '' });
            if (d.ev.length > 6000) d.ev = d.ev.slice(-6000);
        }
        // Hozir qancha turibdi (soat) — faqat kutish / bo'sh holatida va vaqti ma'lum bo'lsa
        function dispIdleH(v, s) {
            if (!s) return null;
            if (s.k === 'tarkib') { if (!s.t || s.t.holat !== 'kutish' || !s.t.updAt) return null; return (Date.now() - Date.parse(s.t.updAt)) / 36e5; }
            if (!DISP_IDLE.includes(s.k)) return null;
            const d = hrDB(), u = d.units[v.id]; const at = u && (u.since || u.updAt); if (!at) return null;
            return Math.max(0, (Date.now() - Date.parse(at)) / 36e5);
        }
        // Serverdan kelgan va telefondagi ma'lumotni birlashtirish: har vagon/tarkib — eng yangisi; jurnal va hodisalar — birlashma
        function dispMerge(cur, inc) {
            cur = cur || {}; inc = inc || {}; const out = Object.assign({}, cur, inc);
            const newer = (a, b, k) => (!a ? b : !b ? a : String(b[k] || '') >= String(a[k] || '') ? b : a);
            out.units = {}; new Set(Object.keys(cur.units || {}).concat(Object.keys(inc.units || {}))).forEach(id => { out.units[id] = newer((cur.units || {})[id], (inc.units || {})[id], 'updAt'); });
            const tdel = new Map(); (cur.tdel || []).concat(inc.tdel || []).forEach(x => { if (x && x.id && (!tdel.has(x.id) || x.at > tdel.get(x.id).at)) tdel.set(x.id, x); });
            const T = new Map(); (cur.tarkiblar || []).concat(inc.tarkiblar || []).forEach(t => { if (t && t.id) T.set(t.id, newer(T.get(t.id), t, 'updAt')); });
            out.tarkiblar = [...T.values()].filter(t => !(tdel.has(t.id) && String(tdel.get(t.id).at) >= String(t.updAt || ''))); out.tdel = [...tdel.values()].slice(-300);
            const uni = (a, b, key, cap, asc) => { const m = new Map(); (a || []).concat(b || []).forEach(x => { if (x) m.set(key(x), x); }); const L = [...m.values()].sort((x, y) => String(asc ? x.at : y.at).localeCompare(String(asc ? y.at : x.at))); return asc ? L.slice(-cap) : L.slice(0, cap); };
            out.log = uni(cur.log, inc.log, x => x.at + '|' + x.text, 400, false);
            out.ev = uni(cur.ev, inc.ev, x => x.id || (x.at + x.vid), 6000, true);
            out.cfg = newer(cur.cfg, inc.cfg, 'at') || undefined; if (!out.cfg) delete out.cfg;
            out.seq = Math.max(+cur.seq || 0, +inc.seq || 0);
            return out;
        }
        // Hozirgi holat: barcha vagonlar
        function dispNow() {
            const d = hrSanitize(), L = onlyVagons().map(v => { const s = hrState(v, d); return { v: v, s: s, h: dispIdleH(v, s) }; });
            const cnt = {}; L.forEach(x => { if (x.s.k === 'bosh' && !x.s.at) { cnt.nomalum = (cnt.nomalum || 0) + 1; return; } const k = x.s.k === 'tarkib' ? (x.s.t && x.s.t.holat === 'kutish' ? 'kutish' : x.s.t && x.s.t.holat === 'yuklash' ? 'yuklash' : 'harak') : x.s.k; cnt[k] = (cnt[k] || 0) + 1; });
            const idle = L.filter(x => x.h !== null).sort((a, b) => b.h - a.h), lim = dispLim(), over = idle.filter(x => x.h >= lim);
            const known = L.filter(x => x.s.at || x.s.k === 'tamirda' || x.s.k === 'tarkib').length;
            return { d: d, L: L, cnt: cnt, idle: idle, over: over, lim: lim, known: known, avg: idle.length ? idle.reduce((a, x) => a + x.h, 0) / idle.length : 0 };
        }
        // Davr bo'yicha turib qolish (hodisalar tarixidan): vagon-soat, sabab bo'yicha, vagon bo'yicha
        function dispPeriod(fromMs, toMs) {
            const d = hrDB(), by = new Map(); (d.ev || []).forEach(e => { if (!by.has(e.vid)) by.set(e.vid, []); by.get(e.vid).push(e); });
            const per = {}, sab = {}, days = {}; let tot = 0;
            by.forEach((L, vid) => {
                L.sort((a, b) => String(a.at).localeCompare(String(b.at)));
                L.forEach((e, i) => {
                    if (!DISP_IDLE.includes(e.h)) return;
                    const a = Math.max(Date.parse(e.at), fromMs), b = Math.min(i + 1 < L.length ? Date.parse(L[i + 1].at) : Date.now(), toMs); if (!(b > a)) return;
                    const h = (b - a) / 36e5; tot += h; per[vid] = (per[vid] || 0) + h; const k = e.s || 'Sababi koʻrsatilmagan'; sab[k] = (sab[k] || 0) + h;
                    for (let t = a; t < b;) { const dd = new Date(t); dd.setHours(24, 0, 0, 0); const e2 = Math.min(b, dd.getTime()), key = dispDay(t); days[key] = (days[key] || 0) + (e2 - t) / 36e5; t = e2; }
                });
            });
            return { tot: tot, per: per, sab: sab, days: days };
        }
        // ---------- Ekran ----------
        // Dispetcherlik bosh sahifasi (eski «Harakat tarkibi») tepasida: qisqa holat va «Turib qolish nazorati»
        function dispHomeBlock(d) {
            let N = null; try { N = dispNow(); } catch (e) { return ''; }
            const k = (n, l, cls) => `<div class="dp-kpi" onclick="openDisp('now')"><b class="${cls || ''}">${n}</b><span>${l}</span></div>`;
            return `<div class="inf-sec">🚦 Bugungi holat</div><div class="dp-kpis dp-home3">${k((N.cnt.harak || 0) + (N.cnt.ishda || 0), 'Harakatda')}${k((N.cnt.kutish || 0) + (N.cnt.bosh || 0), 'Turibdi')}${k(N.over.length, N.lim + ' soatdan ortiq', N.over.length ? 'dp-over' : '')}</div>`
                + `<div class="btn-card inf-card dp-home" onclick="krOpen()"><div class="btn-card-content"><span class="btn-icon">🤖</span><span class="btn-text">Avtomatik rejalash (demo)<small>Karyer → bunker: qaysi tarkib qaysi ekskavatorga — hozirgi usul va avtomatik solishtirma</small></span></div><span class="btn-arrow">›</span></div>`
                + `<div class="btn-card inf-card dp-home" onclick="openDisp()"><div class="btn-card-content"><span class="btn-icon">⏳</span><span class="btn-text">Turib qolish nazorati<small>${N.over.length ? '⚠️ ' + N.over.length + ' ta vagon ' + N.lim + ' soatdan ortiq turibdi' : 'Turib qolgan vagonlar, sabablar, hisobot, Excel'}</small></span></div><span class="btn-arrow">›</span></div>`;
        }
        function openDisp(tab) { secScreen('screen-disp', '⏳ Turib qolish nazorati', 'openHR()'); if (tab) DP.tab = tab; openScreen('screen-disp'); dispRender(); }
        function dispTab(t) { DP.tab = t; dispRender(); }
        function dispRender() {
            secTabs('screen-disp', [['now', '📍 Hozir'], ['idle', '⏳ Turib qolganlar'], ['rep', '📊 Hisobot']], DP.tab, 'dispTab');
            const b = secBody('screen-disp'); b.innerHTML = ({ now: dispNowHtml, idle: dispIdleHtml, rep: dispRepHtml })[DP.tab]();
        }
        function dispRow(x) {
            const v = x.v, s = x.s, over = x.h !== null && x.h >= dispLim();
            return `<div class="mm-card dp-row${over ? ' dp-bad' : ''}" onclick="${canHR() && s.k !== 'tamirda' && s.k !== 'tarkib' ? `hrEditUnit(${v.id})` : `openPassport(${v.id})`}"><b>${escapeHtml(hrName(v))}${x.h !== null ? ` <span class="${over ? 'dp-over' : 'dp-idle'}">⏳ ${dispHrs(x.h)}</span>` : ''}</b>
                <small>${escapeHtml(v.type || '')} · ${s.k === 'tarkib' ? 'Tarkib №' + escapeHtml(s.t.no) : escapeHtml(DISP_H[s.k] || s.k)} · ${escapeHtml(hrPlace(s.joy || (s.t && s.t.joy)))}</small>${s.sabab ? `<small>Sabab: ${escapeHtml(s.sabab)}</small>` : (x.h !== null ? '<small class="dp-miss">Sababi koʻrsatilmagan</small>' : '')}</div>`;
        }
        function dispNowHtml() {
            const N = dispNow(), c = N.cnt, K = (k, lbl, n, cls) => `<div class="dp-kpi" onclick="${k ? `DP.tab='idle';dispRender()` : ''}"><b>${n}</b><span>${lbl}</span>${cls || ''}</div>`;
            return `<div class="dp-kpis">${K(0, 'Harakatda', (c.harak || 0) + (c.ishda || 0))}${K(0, 'Yuklanmoqda', c.yuklash || 0)}${K(1, 'Kutishda', c.kutish || 0)}${K(1, 'Boʻsh / rezerv', c.bosh || 0)}${K(0, 'Taʼmirda', c.tamirda || 0)}${K(1, N.lim + ' soatdan ortiq', N.over.length, N.over.length ? '<em>diqqat</em>' : '<em class="ok">yoʻq</em>')}</div>
                <div class="mm-sum"><i class="${N.avg >= N.lim ? 'bad' : 'warn'}"><b>${N.idle.length ? dispHrs(N.avg) : '—'}</b>oʻrtacha turish (hozir)</i><i class="no"><b>${N.known} / ${N.L.length}</b>holati belgilangan</i></div>
                ${N.over.length ? `<div class="inf-sec">⚠️ ${N.lim} soatdan ortiq turganlar</div>` + N.over.slice(0, 15).map(dispRow).join('') : '<div class="nd-tip">✅ Belgilangan chegaradan ortiq turgan vagon yoʻq.</div>'}
                ${N.known < N.L.length ? `<div class="nd-tip">ℹ️ ${N.L.length - N.known} ta vagonning holati hali belgilanmagan. Holat «Dispetcherlik → Vagonlar»da yoki shu yerda vagonni bosib kiritiladi; har oʻzgarish vaqti bilan yoziladi va turib qolish oʻzi hisoblanadi.</div>` : ''}
                ${canHR() ? `<div class="mm-tools"><button class="mini-btn" onclick="dispCfg()">⚙️ Chegara: ${N.lim} soat</button><button class="mini-btn" onclick="openHrList('vag')">🚃 Vagon holatini kiritish</button></div>` : ''}`;
        }
        function dispIdleHtml() {
            const N = dispNow();
            return `<div class="mm-card"><b>Hozir turgan: ${N.idle.length} ta vagon</b><small>Eng uzoq turganidan boshlab. Bosing — holat, joy va sababni oʻzgartirish.</small></div>` + (N.idle.map(dispRow).join('') || '<div class="xt-empty">Kutishda yoki boʻsh turgan (vaqti belgilangan) vagon yoʻq.</div>');
        }
        function dispRepHtml() {
            const to = Date.now(), from = to - DP.days * 864e5, P = dispPeriod(from, to), S = Object.entries(P.sab).sort((a, b) => b[1] - a[1]), V = Object.entries(P.per).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const days = Array.from({ length: DP.days }, (_, i) => dispDay(to - (DP.days - 1 - i) * 864e5)), mx = Math.max(1, ...days.map(k => P.days[k] || 0));
            const vn = id => { const v = vagonlarData.find(x => String(x.id) === String(id)); return v ? hrName(v) : '№' + id; };
            return `<div class="mm-flt"><select onchange="DP.days=+this.value; dispRender()">${[7, 30, 90].map(n => `<option value="${n}"${DP.days === n ? ' selected' : ''}>Oxirgi ${n} kun</option>`).join('')}</select><button class="mini-btn" onclick="dispExcel()">📊 Excel</button></div>
                <div class="mm-sum"><i class="warn"><b>${Math.round(P.tot)}</b>vagon-soat turib qolish</i><i class="no"><b>${Object.keys(P.per).length}</b>vagon</i></div>
                <div class="inf-sec">📅 Kunlar boʻyicha (vagon-soat)</div><div class="bx-bars">${days.map(k => `<div class="bx-b"><i style="height:${Math.round((P.days[k] || 0) / mx * 100)}%" title="${Math.round(P.days[k] || 0)} vagon-soat"></i><small>${k.slice(8)}</small></div>`).join('')}</div>
                <div class="inf-sec">🧭 Sabablar</div>${S.length ? `<div class="gt-scroll"><table class="mt-t"><tr><th>Sabab</th><th>Vagon-soat</th><th>Ulushi</th></tr>${S.map(([k, h]) => `<tr><td>${escapeHtml(k)}</td><td>${Math.round(h)}</td><td>${P.tot ? Math.round(h / P.tot * 100) : 0}%</td></tr>`).join('')}</table></div>` : '<div class="nd-tip">Bu davrda turib qolish qayd etilmagan.</div>'}
                <div class="inf-sec">🔝 Eng koʻp turgan vagonlar</div>${V.map(([id, h]) => `<div class="mm-card" onclick="openPassport(${JSON.stringify(isNaN(+id) ? id : +id)})"><b>${escapeHtml(vn(id))}</b><small>${dispHrs(h)} turgan</small></div>`).join('') || '<div class="nd-tip">—</div>'}
                <div class="nd-tip">Hisob holat oʻzgarishlari tarixidan: «Kutishda» va «Boʻsh / rezerv» holatidagi vaqt. Taʼmirdagi va harakatdagi vaqt kirmaydi.</div>`;
        }
        function dispExcel() {
            const to = Date.now(), P = dispPeriod(to - DP.days * 864e5, to), vn = id => { const v = vagonlarData.find(x => String(x.id) === String(id)); return v ? hrName(v) : '№' + id; };
            const rows = [['Turib qolish hisoboti — oxirgi ' + DP.days + ' kun'], [], ['Sabab', 'Vagon-soat']].concat(Object.entries(P.sab).sort((a, b) => b[1] - a[1]).map(([k, h]) => [k, Math.round(h * 10) / 10]), [[], ['Vagon', 'Vagon-soat']], Object.entries(P.per).sort((a, b) => b[1] - a[1]).map(([id, h]) => [vn(id), Math.round(h * 10) / 10]));
            xlsxDl(rows, 'Turib qolish ' + DP.days + ' kun');
        }
        async function dispCfg() {
            if (!canHR()) return; const v = await uiPrompt('Necha soatdan ortiq tursa ogohlantirish chiqsin?', String(dispLim())); const n = parseFloat(String(v || '').replace(',', '.'));
            if (!(n > 0)) return; const d = hrDB(); d.cfg = Object.assign({}, d.cfg, { lim: n, at: new Date().toISOString() }); hrSave(d); dispRender(); showToast('⚙️ Chegara: ' + n + ' soat');
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = '.dp-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 10px}.dp-over{color:#f87171;font-weight:700}.dp-idle{color:#fbbf24}.dp-miss{color:#fb923c}.dp-row.dp-bad{border-left:3px solid #ef4444}.dp-home .btn-text small{display:block}.dp-home3{grid-template-columns:repeat(3,minmax(0,1fr))!important}@media (min-width:720px){.dp-kpis{grid-template-columns:repeat(6,minmax(0,1fr))}.dp-kpi b{font-size:24px}}';
            document.head.appendChild(st);
            if (typeof agmkModule === 'function') agmkModule({ id: 'disp', icon: '🚦', title: 'Turib qolish nazorati', search: 'turib qolish prostoy', flag: 'disp', def: 'pilot', card: false, desc: 'Vagonlar holati vaqti bilan, turib qolish va sabablari, ogohlantirish, hisobot', open: () => openDisp() });
            // Ogohlantirish: bosh sahifaga kirganda (dispetcher va rahbariyat), kuniga ko'pi bilan 3 marta
            window.addEventListener('agmk:login', () => setTimeout(dispNotify, 6000));
            setInterval(dispNotify, 30 * 60e3);
        })();
        function dispNotify() {
            try {
                if (!currentUser || !flagOn('disp') || !canHR()) return; const n = dispNow().over.length; if (!n) return;
                const k = 'agmk_disp_ntf_' + todayISO(), c = +(localStorage.getItem(k) || 0); if (c >= 3) return; localStorage.setItem(k, String(c + 1));
                showToast('🚦 ' + n + ' ta vagon ' + dispLim() + ' soatdan ortiq turibdi — «Dispetcherlik»');
            } catch (e) {}
        }

