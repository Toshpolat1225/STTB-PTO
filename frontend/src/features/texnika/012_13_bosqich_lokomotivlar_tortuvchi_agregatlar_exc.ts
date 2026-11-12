        // =====================================================================
        // YANGI (13-bosqich): LOKOMOTIVLAR — tortuvchi agregatlar (Excel: "Парк приписки ... на 01.04.2023")
        // 52 ta: ПЭ2М (23), ПЭ2У (26), МПЭ2У (2), ЕЛ-1 (1). Pasport, rasmlar, ta'mir tarixi va zamechaniyalar
        // vagonlar bilan bir xil mexanizmda ishlaydi (kind: 'lok').
        // =====================================================================
        const LOK_2023 = [[1, "ПЭ2М", "171", "37070", 1975, "1976", 9], [2, "ПЭ2М", "210", "50507", 1977, "1978", 10], [3, "ПЭ2М", "223", "37086", 1978, "1978", 11], [4, "ПЭ2М", "251", "37435", 1979, "1979", 12], [5, "ПЭ2М", "261", "37073", 1980, "1980", 13], [6, "ПЭ2М", "258", "37075", 1980, "1981", 14], [7, "ПЭ2М", "291", "37077", 1981, "1981", 15], [8, "ПЭ2М", "298", "37076", 1981, "1981", 16], [9, "ПЭ2М", "299", "37078", 1981, "1981", 17], [10, "ПЭ2М", "319", "37088", 1982, "1982", 18], [11, "ПЭ2М", "328", "37089", 1982, "1982", 19], [12, "ПЭ2М", "340", "37090", 1982, "1982", 20], [13, "ПЭ2М", "348", "37079", 1982, "1982", 21], [14, "ПЭ2М", "353", "37080", 1983, "1983", 22], [15, "ПЭ2М", "356", "37081", 1983, "1983", 23], [16, "ПЭ2М", "360", "37082", 1983, "1983", 24], [17, "ПЭ2М", "361", "37092", 1983, "1983", 25], [18, "ПЭ2М", "387", "37083", 1984, "1984", 26], [19, "ПЭ2М", "405", "37091", 1984, "1984", 27], [20, "ПЭ2М", "414", "37093", 1984, "1984", 28], [21, "ПЭ2М", "421", "37094", 1985, "1985", 29], [22, "ПЭ2М", "434", "37799", 1985, "1985", 30], [23, "ПЭ2М", "439", "37800", 1985, "1985", 31], [24, "ПЭ2У", "449", "37829", 1985, "1985", 32], [25, "ПЭ2У", "032", "37896", 1986, "1986", 33], [26, "ПЭ2У", "074", "38782", 1987, "2006", 34], [27, "ПЭ2У", "068", "37917", 1988, "1988", 35], [28, "ПЭ2У", "085", "37919", 1989, "1989", 36], [29, "ПЭ2У", "089", "37924", 1989, "1989", 37], [30, "ПЭ2У", "094", "37920", 1989, "1989", 38], [31, "ПЭ2У", "095", "38781", 1989, "2006", 39], [32, "ПЭ2У", "102", "37921", 1989, "1990", 40], [33, "ПЭ2У", "111", "37923", 1990, "1990", 41], [34, "ПЭ2У", "113", "38065", 1990, "1990", 42], [35, "ПЭ2У", "115", "37840", 1990, "1990", 43], [36, "ПЭ2У", "117", "37841", 1990, "1990", 44], [37, "ПЭ2У", "120", "38092", 1991, "1991", 45], [38, "ПЭ2У", "143", "37174", 1993, "2005", 46], [39, "ПЭ2У", "144", "37096", 1993, "2003", 47], [40, "ПЭ2У", "145", "37097", 1993, "2004", 48], [41, "ПЭ2У", "160", "38808", 2010, "2011", 49], [42, "ПЭ2У", "161", "38809", 2010, "2011", 50], [43, "ПЭ2У", "162", "38908", 2011, "2011", 51], [44, "ПЭ2У", "163", "38909", 2011, "2011", 52], [45, "ПЭ2У", "164", "38910", 2011, "2011", 53], [46, "ПЭ2У", "165", "38911", 2011, "2011", 54], [47, "ПЭ2У", "166", "38912", 2011, "2012", 55], [48, "ПЭ2У", "167", "38913", 2011, "2012", 56], [49, "ПЭ2У", "168", "38914", 2011, "2012", 57], [50, "МПЭ2У", "001", "38390", 2020, "2020", 58], [51, "МПЭ2У", "002", "38402", 2021, "2021", 59], [52, "ЕЛ-1", "691", "37071", 1976, "1976", 60]];   // [№, seriya, zavod №, inventar №, qurilgan yili, foydalanishga kiritilgan, qator]
        const LOK_IMPORT_KEY = 'agmk_lok_import_2023';
        const LOK_TYPES = ['ПЭ2М', 'ПЭ2У', 'МПЭ2У', 'ЕЛ-1'];
        const LOK_NAME = { 'ПЭ2М': 'Tortuvchi agregat ПЭ2М', 'ПЭ2У': 'Tortuvchi agregat ПЭ2У', 'МПЭ2У': 'Tortuvchi agregat МПЭ2У', 'ЕЛ-1': 'Elektrovoz ЕЛ-1' };
        let lokFilter = 'Barchasi';
        let lokStatusFilter = 'Barchasi';
        function setLokStatus(s) { lokStatusFilter = lokStatusFilter === s && s !== 'Barchasi' ? 'Barchasi' : s; renderLok(); }

        function isLok(v) { return !!v && v.kind === 'lok'; }
        function onlyVagons() { return vagonlarData.filter(v => { if (v.kind) return false; if (typeof vTypeNorm === 'function' && VTYPE_REN[v.type]) vTypeNorm(v); return true; }); }
        function onlyLoks() { return vagonlarData.filter(isLok); }
        function unitLabel(v) { return v && v.kind === 'infra' ? v.naim : v && v.kind === 'yol' ? (v.naim + " " + v.marka + " №" + v.zav) : v && v.kind === 'avto' ? (v.naim + " (" + vagonNo(v) + ")") : ((isLok(v) ? v.type : "Vagon") + " №" + vagonNo(v)); }

        function importLok2023() {
            if (localStorage.getItem(LOK_IMPORT_KEY)) return false;
            if (onlyLoks().length) { try { localStorage.setItem(LOK_IMPORT_KEY, '1'); } catch (e) {} return false; }
            let id = vagonlarData.reduce((m, v) => Math.max(m, v.id), 0);
            LOK_2023.forEach(r => {
                vagonlarData.push({
                    id: ++id, kind: 'lok', num: String(r[2]), inv: String(r[3]), type: r[1], model: r[1], naim: LOK_NAME[r[1]] || r[1],
                    maker: '', yil: r[4], vvod: String(r[5]), seh: '', primen: '',
                    tamirTuri: '', tamirSanasi: '', keyingi: '', drAuto: false, status: 'Auto', kun: null,
                    sortOrder: r[0], src: 'Лист1:' + r[6], srcNo: String(r[0]),
                    history: [], gallery: [], rahbarIzoh: '', rahbarImgs: [], zams: []
                });
            });
            vagonlarData.forEach(recalcVagonStatus);
            saveDB(false);
            try { localStorage.setItem(LOK_IMPORT_KEY, '1'); } catch (e) {}
            return true;
        }

        function openLokScreen() { openScreen('screen-lok'); renderLok(); }
        function setLokFilter(t) { lokFilter = t; renderLok(); }
        function lokAge(v) { const y = parseInt(v.yil, 10); return y ? (new Date().getFullYear() - y) : null; }
        function renderLok() {
            const all = onlyLoks();
            const cnt = {}; all.forEach(v => { cnt[v.type] = (cnt[v.type] || 0) + 1; });
            $id('lokTabs').innerHTML = `<div class="tab${lokFilter === 'Barchasi' ? ' active' : ''}" onclick="setLokFilter('Barchasi')">Barchasi<span class="tab-cnt">${all.length}</span></div>` +
                LOK_TYPES.concat(Object.keys(cnt).filter(t => !LOK_TYPES.includes(t))).filter(t => cnt[t]).map(t => `<div class="tab${lokFilter === t ? ' active' : ''}" onclick="setLokFilter('${t}')">${escapeHtml(t)}<span class="tab-cnt">${cnt[t]}</span></div>`).join('');
            const q = ($id('lokSearch').value || '').toLowerCase().trim();
            const scope = all.filter(v => lokFilter === 'Barchasi' || v.type === lokFilter);
            const sc = st => scope.filter(v => v.status === st).length;
            const box = (key, label, cls, n) => `<div class="stat-box${lokStatusFilter === key ? ' on' : ''}" onclick="setLokStatus('${key.replace(/'/g, "\\'")}')"><div class="stat-label">${label}</div><div class="stat-num ${cls}">${n}</div></div>`;
            $id('lokStats').innerHTML = box('Barchasi', 'Jami', 'jami', scope.length) + box('Soz', 'Soz', 'soz', sc('Soz')) + box('Yaqin', 'Yaqin', 'yaqin', sc('Yaqin')) +
                box("Ta'mir talab", "Ta'mir talab", 'tamir', sc("Ta'mir talab")) + box('Tamirda', 'Tamirda', 'tamirda', sc('Tamirda'));
            const list = all.filter(v => (lokFilter === 'Barchasi' || v.type === lokFilter) && (lokStatusFilter === 'Barchasi' || v.status === lokStatusFilter) && (!q || q.split(/\s+/).every(t => (vagonNo(v) + ' ' + v.inv + ' ' + v.type + ' ' + v.yil + ' ' + (v.seh || '')).toLowerCase().includes(t))))
                .sort((a, b) => a.sortOrder - b.sortOrder);
            $id('lokList').innerHTML = `<div class="vg-count">Topildi: ${list.length} ta tortuvchi agregat</div>` + (list.map(v => {
                const age = lokAge(v);
                let cls = 'badge-soz', txt = 'Soz';
                if (v.status === 'Tamirda') { cls = 'badge-tamirda'; txt = 'Hozirda Tamirda'; }
                else if (v.kun !== null && v.status === "Ta'mir talab") { cls = 'badge-tamir'; txt = v.kun < 0 ? "Ta'mir talab (" + Math.abs(v.kun) + " kun o'tdi)" : (v.ppr ? "Shu oy: " + (pprNext(v) || {}).type : "Ta'mir talab (" + v.kun + " kun)"); }
                else if (v.kun !== null && v.status === 'Yaqin') { cls = 'badge-yaqin'; txt = 'Yaqin (' + v.kun + ' kun)'; }
                else if (v.kun !== null) txt = 'Soz (' + v.kun + ' kun)';
                else { cls = 'badge-nodate'; txt = v.ppr ? "2026 grafigi tugagan" : "Ta'mir sanasi kiritilmagan"; }
                return `<div class="vagon-card">
                    <div class="vagon-header-row">
                        <div class="vagon-num-container"><span class="card-order-badge" style="display:inline-flex; align-items:center; justify-content:center;">${escapeHtml(v.sortOrder)}</span>
                            <div><div class="vagon-num">${escapeHtml(v.type)} № ${escapeHtml(vagonNo(v))}</div><div class="vg-sub">${escapeHtml(v.naim || '')}</div></div></div>
                        <div class="vagon-badge ${cls}">${escapeHtml(txt)}</div>
                    </div>
                    <div class="vagon-info" style="margin-top:10px;">Inventar: <span>${escapeHtml(v.inv)}</span> | Seriya: <span>${escapeHtml(v.type)}</span> | Seh: <span>${escapeHtml(v.seh || '—')}</span> | Qurilgan: <span>${escapeHtml(v.yil)}</span>${v.vvod ? ` | Ishga tushgan: <span>${escapeHtml(v.vvod)}</span>` : ''}${age !== null ? ` | Yoshi: <span>${age}</span>` : ''}
                        ${v.ppr ? `<br>Oxirgi ta'mir: <span>${escapeHtml((pprPrev(v) || {}).label || fmtISO(v.tamirSanasi) || '—')}</span> | Keyingi: <span>${escapeHtml(v.nextLabel || (fmtISO(v.keyingi) || '2026 grafigida qolmagan'))}</span> | Xizmat muddati: <span>${escapeHtml(v.srokIstek || '—')}</span>`
                          : `<br>Oxirgi ta'mir: <span>${escapeHtml(fmtISO(v.tamirSanasi) || '—')}</span> | Keyingi: <span>${escapeHtml(fmtISO(v.keyingi) || '—')}</span>`}
                        ${v.expired ? `<br><span class="vg-flag">⚠️ Xizmat muddati tugagan (${escapeHtml(v.srokIstek)})</span>` : ''}</div>
                    <button class="details-btn" onclick="openPassport(${v.id})">Pasport, Rasmlar va Ta'mirlar Tarixi</button>
                </div>`;
            }).join('') || '<div class="xt-empty">Hech narsa topilmadi</div>');
        }
        function passportBack() { const v = vagonlarData.find(x => x.id === activeVagonId); if (isLok(v)) openLokScreen(); else if (v && v.kind === 'avto') openAvtoScreen(); else if (v && v.kind === 'yol') openYolScreen(); else if (v && v.kind === 'infra') openInfraObj(v.infraId); else openScreen('screen-vagonlar'); }
        // Tahrirlash oynasida lokomotiv seriyasi ro'yxatda bo'lishi uchun
        function ensureTypeOption(type) {
            const sel = $id('edit-model'); if (!sel || !type) return;
            if (![...sel.options].some(o => o.value === type)) { const o = document.createElement('option'); o.value = type; o.textContent = type; o.dataset.lok = '1'; sel.appendChild(o); }
        }


