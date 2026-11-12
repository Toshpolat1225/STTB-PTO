        // =====================================================================
        // v2.9 — 📑 KALKULYATSIYA: vagon yoki inventar raqami yozilishi bilan hammasi o'zi to'ladi
        //  • Pasportdan: zavod №, inventar №, turi, sarlavha
        //  • Materiallar: tekshirilgan oylik to'plamlardagi SPRAVKA-RASCHETDAN (shu vagon raqami yozilgan blok) →
        //    nomi/miqdori, narxi Forma-30 dan (talabnoma № + ШПЗ bo'yicha). Farqlar ogohlantiriladi.
        //  • Material nomini yozganda Forma-30 dan taklif (narxi bilan); ish turi taklifi (avtosцепka → «Замена автосцепки»)
        // =====================================================================
        var CX47 = { t: null, fc: {}, idx: null, idxAt: 0, f30: {}, info: '' };
        function cx47Digits(s) { return String(s || '').replace(/\D/g, ''); }
        function cx47Find(q) {
            const s = cx47Digits(q); if (s.length < 3) return [];
            const z = s.replace(/^0+/, ''), inv = /^31000\d+/.test(s) ? s.slice(5) : null;
            const L = (vagonlarData || []).filter(v => !v.kind && (cx47Digits(vagonNo(v)).replace(/^0+/, '') === z || (v.inv && (cx47Digits(v.inv) === s || (inv && cx47Digits(v.inv) === inv)))));
            return L;
        }
        function cx47Fill(v) {
            const doc = CXV.cur; doc.vid = v.id; doc.zav = String(vagonNo(v)); doc.inv = String(v.inv || '');
            doc.model = /105/.test(v.type) ? '2ВС-105' : /115/.test(v.type) ? '2ВС-115' : /60/.test(v.type) ? '6ВС-60' : (v.type || '');
            doc.title = doc.type === 'calc' ? `капитальный ремонт замена запасных частей на думпкара типа ${doc.model} зав.№${doc.zav} инв№${doc.inv}` : `Думпкар ${doc.model} №${doc.zav}`;
            if (doc.type === 'nosoz') { doc.model = /105/.test(v.type) ? '2VS-105' : /60/.test(v.type) ? '6VS-60' : v.type; doc.dr = v.tamirSanasi && /DR|депо/i.test(v.tamirTuri || '') ? fmtISO(v.tamirSanasi) : (doc.dr || ''); doc.kr = v.kr ? fmtISO(v.kr) : (v.krTxt || doc.kr || ''); doc.yil = v.yil || ''; }
            if (doc.type === 'razuk') doc.vvod = v.vvod || '';
        }
        function cx47Live(q, from) {
            clearTimeout(CX47.t); CX47.t = setTimeout(() => {
                const doc = CXV.cur; if (!doc) return; const L = cx47Find(q);
                if (L.length !== 1) { cx47Info(L.length > 1 ? `⚠️ Bu raqamda ${L.length} ta vagon: ${L.slice(0, 5).map(v => escapeHtml(String(vagonNo(v)) + ' (' + (v.type || '') + ')')).join(', ')} — toʻliq raqamni yozing.` : (cx47Digits(q).length >= 4 ? 'ℹ️ Pasportda topilmadi (yozishda davom eting).' : '')); return; }
                const v = L[0]; if (doc.vid === v.id) return;
                cx47Fill(v); CX47.info = '✅ Pasportdan: zav.№ ' + escapeHtml(doc.zav) + ', inv.№ ' + escapeHtml(doc.inv || '—') + ', ' + escapeHtml(v.type || '');
                const ae = document.activeElement, key = ae && ae.id === 'cxV' ? 'cxV' : 'inv', pos = ae && ae.value !== undefined ? ae.value.length : 0;
                cxForm();
                try { const el = key === 'cxV' ? $id('cxV') : document.querySelector('#cxModal input[onchange*="CXV.cur[\'inv\']"]'); if (el) { if (key === 'cxV') el.value = q; el.focus(); const p = el.value.length; el.setSelectionRange(p, p); } } catch (e) {}
                if (doc.type === 'calc' || doc.type === 'priem') cx47Spr(false);
            }, 450);
        }
        function cx47Info(h) { CX47.info = h; const b = $id('cx47info'); if (b) b.innerHTML = h; }
        // ---------- Saqlangan to'plamlardagi spravkalar ----------
        async function cx47SprIndex() {
            if (CX47.idx && Date.now() - CX47.idxAt < 180000) return CX47.idx;
            const out = [], seen = new Set(); const recs = (hsChecks() || []).filter(r => r.kind === 'pkg').slice(0, 60);
            for (const r of recs) {
                let d = null; try { d = await hsJsonGet(r.dref); } catch (e) {} if (!d || !d.files) continue;
                for (const f of d.files) {
                    if (!CX47.fc[f.ref]) { const bl = []; try { const b = await mediaGetBlob(f.ref); if (b && /\.(xlsx?|xlsm|ods)$/i.test(f.name)) { const bk = await hpReadBook(new File([b], f.name)); bk.forEach(sh => { if (hpClassify(sh.rows) === 'spr') { try { hpParseSpr(sh.rows, { f: f.name, s: sh.s }).forEach(x => bl.push(x)); } catch (e) {} } }); } } catch (e) {} CX47.fc[f.ref] = bl; }
                    CX47.fc[f.ref].forEach(b => { const k = b.src.f + '|' + b.src.s + '|' + b.src.r + '|' + b.month; if (seen.has(k)) return; seen.add(k); out.push(Object.assign({ chkMonth: d.month || '' }, b)); });
                }
            }
            CX47.idx = out; CX47.idxAt = Date.now(); return out;
        }
        async function cx47F30(month) {
            if (CX47.f30[month]) return CX47.f30[month];
            const L = typeof hsF30Of === 'function' ? hsF30Of('vagon') : []; const rec = L.find(x => x.month === month); if (!rec) return null;
            let f = null; try { f = await hpF30FromStored(rec); } catch (e) {} if (f) CX47.f30[month] = f; return f;
        }
        async function cx47Spr(force) {
            const doc = CXV.cur; if (!doc || !doc.zav) return; cx47Info((CX47.info ? CX47.info + '<br>' : '') + '⏳ Spravka-raschetlardan qidirilmoqda...');
            const base = CX47.info.split('<br>⏳')[0], w = hpWag(cx47Digits(doc.zav));
            let idx = []; try { idx = await cx47SprIndex(); } catch (e) {}
            const B = idx.filter(b => b.wagons.indexOf(w) >= 0 && b.items.some(it => (it.fakt || 0) > 0)).sort((a, b) => ((b.month === doc.month) - (a.month === doc.month)) || String(b.month).localeCompare(String(a.month)));
            if (!B.length) { cx47Info(base + '<br>⚠️ Bu vagon tekshirilgan toʻplamlardagi spravka-raschetlarda topilmadi. Materiallarni «📥 Forma-30 dan» yoki qoʻlda qoʻshing.'); return; }
            CX47.cand = B;
            if (B.length > 1 || (doc.mats && doc.mats.length && !force)) { cx47Info(base + `<br>📑 Spravkada ${B.length} ta blok topildi — tanlang:<div class="cx47-bl">${B.map((b, i) => `<button onclick="cx47Use(${i})">${escapeHtml((b.title || 'Blok').slice(0, 70))} · ${escapeHtml(b.monthTxt || b.month || '')} · ШПЗ ${escapeHtml(b.shpz || '—')} · ${b.items.filter(x => (x.fakt || 0) > 0).length} material</button>`).join('')}</div>`); return; }
            cx47Use(0);
        }
        async function cx47Use(i) {
            const doc = CXV.cur, b = (CX47.cand || [])[i]; if (!doc || !b) return; const E = escapeHtml, base = CX47.info.split('<br>')[0];
            const month = b.month || doc.month; if (b.month && b.month !== doc.month) doc.month = b.month;
            const f30 = await cx47F30(month), warn = [], mats = [];
            if (b.wagons.length > 1) warn.push('Blokda ' + b.wagons.length + ' ta vagon (№ ' + b.wagons.join(', ') + ') — miqdorlar butun blok uchun, shu vagonga tegishlisini tekshiring.');
            if (!f30) warn.push(hsMon(month) + ' uchun Forma-30 yuklanmagan — narxlar qoʻyilmadi (Hisobotlar → Vagon → Forma-30).');
            b.items.filter(it => (it.fakt || 0) > 0).forEach(it => {
                let rows = []; if (f30) rows = f30.items.filter(x => !x.pogr && x.tid && it.ids.indexOf(x.tid) >= 0 && (!b.shpz || x.shpz === b.shpz) && (!b.ceh || String(x.sklad).indexOf(b.ceh) >= 0) && hpScore(it.name, x.name) > 0);
                const src = 'Spravka ' + (b.monthTxt || month) + ' · ' + b.src.f + ' › ' + (it.src.r + 1) + '-qator';
                if (!rows.length) { mats.push({ name: it.name, unit: it.unit || 'шт', qty: it.fakt, price: 0, shpz: b.shpz, src: src + ' · ⚠️ Forma-30 da topilmadi' }); if (f30) warn.push('«' + it.name + '» (talabnoma ' + (it.ids.join(', ') || '—') + ', ШПЗ ' + (b.shpz || '—') + ') Forma-30 da topilmadi — narxni kiriting.'); return; }
                const q = rows.reduce((a, x) => a + (x.qty || 0), 0);
                if (Math.abs(q - it.fakt) < 1e-6) rows.forEach(x => mats.push({ name: x.name, unit: x.unit || it.unit || 'шт', qty: x.qty, price: x.price || 0, shpz: x.shpz, src: src + ' · F30 треб.№' + x.tid }));
                else { const prices = Array.from(new Set(rows.map(x => x.price))); const pr = prices.length === 1 ? prices[0] : r2(rows.reduce((a, x) => a + (x.sum || 0), 0) / (q || 1)); mats.push({ name: rows[0].name, unit: rows[0].unit || it.unit || 'шт', qty: it.fakt, price: pr || 0, shpz: b.shpz, src: src + ' · F30 треб.№' + rows.map(x => x.tid).join(',') }); warn.push('«' + it.name + '»: spravkada ' + hpF(it.fakt) + ', Forma-30 da (talabnoma ' + it.ids.join(', ') + ') ' + hpF(q) + ' ' + (rows[0].unit || '') + (prices.length > 1 ? '; narxlar har xil — oʻrtacha olindi' : '') + '.'); }
            });
            doc.mats = mats; doc.sprSrc = { f: b.src.f, r: b.src.r, month: month, shpz: b.shpz };
            CX47.info = base + '<br>📑 Spravkadan: ' + E((b.title || '').slice(0, 80)) + ' · ШПЗ ' + E(b.shpz || '—') + ' · ' + mats.length + ' ta material' + (warn.length ? '<div class="cx47-w">' + warn.map(x => '⚠️ ' + E(x)).join('<br>') + '</div>' : '');
            cxForm();
        }
        // ---------- Ish turi taklifi ----------
        var CX47_WK = [[/авто?с?цеп/i, 3], [/колес\w*\s*пар/i, 1], [/свалочн\w*\s*цилиндр/i, 2], [/кронштейн/i, 7], [/поглощ|фрикцион/i, 8], [/систем\w*\s*сход|рубильник/i, 6], [/тормозн\w*\s*тяг|тяг\w*\s*тормоз/i, 4]];
        function cx47Sugg() { const doc = CXV.cur, d = cxDB(); if (!doc || !(doc.mats || []).length) return ''; const have = new Set((doc.works || []).map(x => x.n)), out = []; CX47_WK.forEach(([re, n]) => { if (have.has(n) || out.indexOf(n) >= 0) return; if (doc.mats.some(m => re.test(hpLow(m.name)))) out.push(n); }); return out.map(n => { const w = d.works.find(z => z.n === n); return w ? `<button onclick="CXV.cur.works.push({n:${n},cnt:1}); cxForm()">💡 ${escapeHtml(w.name)} ＋</button>` : ''; }).join(''); }
        // ---------- Formaga ulash ----------
        (function () {
            if (typeof cxForm !== 'function') return; cxForm = agmkExtend('cxForm', '---------- Formaga ulash ----------', cxForm, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const doc = CXV.cur, v = $id('cxV'); if (!doc || !v) return r;
                    v.setAttribute('inputmode', 'numeric'); v.addEventListener('input', () => cx47Live(v.value, 'zav'));
                    const inv = document.querySelector('#cxModal input[onchange*="CXV.cur[\'inv\']"]'); if (inv) inv.addEventListener('input', () => cx47Live(inv.value, 'inv'));
                    const row = v.closest('.nd-2'); if (row && !$id('cx47info')) row.insertAdjacentHTML('afterend', `<div class="cx47-info" id="cx47info">${CX47.info || '<small>Vagon yoki inventar raqamini yozing — pasport, spravka-raschet va Forma-30 dan oʻzi toʻldiriladi.</small>'}</div>`);
                    if ((doc.type === 'calc' || doc.type === 'priem')) {
                        const bar = [...document.querySelectorAll('#cxModal .nv-btns')].find(b => /Forma-30 dan/.test(b.textContent)); if (bar && doc.zav) bar.insertAdjacentHTML('beforeend', '<button onclick="cx47Spr(true)">📑 Spravkadan (vagon boʻyicha)</button>');
                        const sg = cx47Sugg(); const wb = [...document.querySelectorAll('#cxModal .nv-btns')].find(b => /Ish turi/.test(b.textContent)); if (sg && wb) wb.insertAdjacentHTML('beforebegin', `<div class="cx47-sg">${sg}</div>`);
                        // material nomi: Forma-30 dan taklif (narxi bilan)
                        cx47F30(doc.month).then(f => { if (!f || !$id('cxModal')) return; if (!$id('cx47dl')) { const dl = document.createElement('datalist'); dl.id = 'cx47dl'; const seen = new Set(); dl.innerHTML = f.items.filter(x => x.name && !x.pogr && !seen.has(x.name) && seen.add(x.name)).slice(0, 3000).map(x => `<option value="${escapeHtml(x.name)}">${escapeHtml((x.unit || '') + ' · ' + cxFmt(x.price) + ' · ШПЗ ' + (x.shpz || ''))}</option>`).join(''); $id('cxModal').appendChild(dl); }
                            document.querySelectorAll('#cxModal .cx-mats .cx-m').forEach((m, i) => { const n = m.querySelector('input'); if (!n || n.dataset.c47) return; n.dataset.c47 = 1; n.setAttribute('list', 'cx47dl'); n.addEventListener('change', () => { const x = f.items.find(z => z.name === n.value.trim() && !z.pogr); const mm = CXV.cur.mats[i]; if (!x || !mm) return; if (!(+mm.price)) mm.price = x.price || 0; mm.unit = x.unit || mm.unit; mm.shpz = x.shpz; mm.src = 'F30 ' + (doc.month || '') + ' · ШПЗ ' + (x.shpz || '') + ' · треб. №' + (x.tid || ''); cxForm(); }); }); });
                    }
                } catch (e) { console.error(e); }
                return r;
            });
            const oo = typeof cxOpen === 'function' ? cxOpen : null; if (oo) cxOpen = function () { CX47.info = ''; return oo.apply(this, arguments); };
            const on = typeof cxNew === 'function' ? cxNew : null; if (on) cxNew = function () { CX47.info = ''; return on.apply(this, arguments); };
            const oe = typeof cxEdit === 'function' ? cxEdit : null; if (oe) cxEdit = function () { CX47.info = ''; return oe.apply(this, arguments); };
        })();

