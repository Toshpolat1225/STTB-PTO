        // =====================================================================
        // v3.6.1 — 📡 GPS SXEMA: tanlangan tarkib rejimi, harakat tarixi, panelni yashirish, yozuvlar ustma-ust chiqmaydi;
        //          tarkib sahifasi; harakat jurnalidan sahifaga o'tish; «+ Yangi tarkib» joyida
        // =====================================================================
        var GX = { f: null, follow: true, dcAt: 0, hideKey: 'agmk_gd_hide' };
        function gxHidden() { try { return localStorage.getItem(GX.hideKey) === '1'; } catch (e) { return false; } }
        function gxSetHidden(h) { try { localStorage.setItem(GX.hideKey, h ? '1' : '0'); } catch (e) {} gxPanelState(); }
        function gxPanelState() {
            const p = $id('gdPanel'), v = $id('gdView'); if (!p || !v) return; const h = gxHidden();
            p.classList.toggle('gx-hid', h); let hb = $id('gxHandle');
            if (!hb) { hb = document.createElement('div'); hb.id = 'gxHandle'; hb.className = 'gx-handle'; hb.onclick = () => gxSetHidden(false); v.appendChild(hb); }
            hb.classList.toggle('hidden', !h); hb.innerHTML = `⬆ Panel <small>${($id('gdTime') || {}).textContent || ''}</small>`;
            setTimeout(() => { try { GD.map && GD.map.invalidateSize(); } catch (e) {} }, 50);
        }
        // ---------- Joy → sxema koordinatasi (stansiya yoki peregon o'rtasi) ----------
        function gxPlaceXY(id) {
            try { const S = NET41.stations; if (S[id] && S[id].anchor) return S[id].anchor; const o = INFRA_BY[id]; if (o && o.a && o.b && S[o.a] && S[o.b] && S[o.a].anchor && S[o.b].anchor) return [(S[o.a].anchor[0] + S[o.b].anchor[0]) / 2, (S[o.a].anchor[1] + S[o.b].anchor[1]) / 2]; } catch (e) {}
            return null;
        }
        // ---------- Tanlangan tarkib rejimi ----------
        // f = { kind: 'demo', no } — sxemadagi demo tarkib;  f = { kind: 'real', tid } — dispetcher kiritgan tarkib (mashinist GPS yoki joyi)
        function gxFocus(f) { GX.f = f; GX.follow = true; GX.trk = null; GX.trkAt = 0; if (f && f.kind === 'demo') GD.sel = f.no; gxDrawFocus(true); gxStrip(); if (f && f.kind === 'real') gxLoadTrk(); }
        function gxAll() { GX.f = null; GD.sel = null; if (GD.fxLay) GD.fxLay.clearLayers(); gxStrip(); try { gdDraw(); } catch (e) {} showToast('👥 Hamma harakat qatnashchilari'); }
        function gxDemoT() { return GX.f && GX.f.kind === 'demo' ? GD.trains.find(t => t.no === GX.f.no) : null; }
        function gxReal() { if (!GX.f || GX.f.kind !== 'real') return null; return hrDB().tarkiblar.find(t => t.id === GX.f.tid) || null; }
        function gxRealSm(t) { try { return typeof msActive === 'function' ? msActive().find(s => s.tarkibId === t.id || (t.lokId && s.unitId === t.lokId)) : null; } catch (e) { return null; } }
        function gxRealLL(t) {
            const sm = gxRealSm(t), p = sm && typeof MS !== 'undefined' ? (MS.pos || []).find(x => x.tabel === sm.tabel) : null; if (p) return { ll: L.latLng(p.lat, p.lon), src: 'gps' };
            const xy = gxPlaceXY(t.joy); return xy ? { ll: ygToLL(xy[0], xy[1]), src: 'joy' } : null;
        }
        async function gxLoadTrk() { const t = gxReal(); if (!t || !t.lokId) return; try { const L0 = await sbFetch('/api/trk/v1?uid=' + encodeURIComponent(String(t.lokId)) + '&day=' + msDay()) || []; GX.trk = [].concat(...L0.map(x => x.pts)).sort((a, b) => a[0] - b[0]); GX.trkAt = Date.now(); gxDrawFocus(false); } catch (e) {} }
        function gxDrawFocus(fit) {
            const m = GD.map; if (!m) return; if (!GD.fxLay) GD.fxLay = L.layerGroup().addTo(m); GD.fxLay.clearLayers(); const f = GX.f; if (!f) return;
            let head = null, path = [];
            if (f.kind === 'demo') { const t = gxDemoT(); if (!t) return; path = (t.hist || []).map(h => ygToLL(h[1], h[2])); const p = gdPos(t); head = ygToLL(p.x, p.y); }
            else { const t = gxReal(); if (!t) return; const g = gxRealLL(t); if (GX.trk && GX.trk.length) path = GX.trk.map(p => L.latLng(p[1], p[2])); if (g) head = g.ll;
                if (head) L.marker(head, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="gx-real">🚂 Tarkib №${escapeHtml(t.no)}<small>${g.src === 'gps' ? '📍 GPS' : '🚉 ' + escapeHtml(hrPlace(t.joy))}</small></div>`, iconSize: [0, 0] }), zIndexOffset: 1500 }).addTo(GD.fxLay); }
            if (head && path.length) path = path.concat([head]);
            if (path.length > 1) { L.polyline(path, { color: '#0f172a', weight: 9, opacity: .65, interactive: false }).addTo(GD.fxLay); L.polyline(path, { color: '#38bdf8', weight: 5, opacity: .95, interactive: false }).addTo(GD.fxLay);
                L.marker(path[0], { icon: L.divIcon({ className: 'gd-ic', html: '<div class="trk-pin">🟢 boshlanish</div>', iconSize: [0, 0] }), zIndexOffset: 1400 }).addTo(GD.fxLay); }
            if (head && (fit || GX.follow)) { if (fit) { let z = Math.max(m.getZoom(), 16); m.setView(head, z, { animate: false }); for (let i = 0; i < 6 && gdPxPerPt() < 7; i++) m.setView(head, ++z, { animate: false }); } else if (!m.getBounds().pad(-0.25).contains(head)) m.panTo(head, { animate: false }); }
            if (!head && fit && f.kind === 'real') showToast('📍 Bu tarkibning joyi ham, GPS maʼlumoti ham yoʻq');
        }
        function gxStrip() {
            const v = $id('gdView'); if (!v) return; let s = $id('gxStrip'); if (!s) { s = document.createElement('div'); s.id = 'gxStrip'; s.className = 'gx-strip hidden'; const bar = $id('gdVbar'); bar && bar.parentNode ? bar.parentNode.insertBefore(s, bar.nextSibling) : v.appendChild(s); }
            const f = GX.f; s.classList.toggle('hidden', !f); v.classList.toggle('gx-on', !!f); if (!f) return; const E = escapeHtml;
            const bar = $id('gdVbar'); if (bar) s.style.top = (bar.offsetTop + bar.offsetHeight + 6) + 'px';
            let h = '';
            if (f.kind === 'demo') { const t = gxDemoT(); if (!t) return; const st = (typeof GD_ST !== 'undefined' && GD_ST[gdState(t)]) || ['', '']; const km = Math.round((t.km || 0) * 10) / 10;
                h = `<b>🚂 Tarkib №${t.no} <em class="ns-demo">DEMO</em></b><span>${E(hrName(t.lok))} · ${st[0]} ${E(st[1])}${t.blk ? ' · ⛔ yoʻl band' : ''}</span><span>${E(typeof gdWhereTrain === 'function' ? gdWhereTrain(t) : '')}</span>`; }
            else { const t = gxReal(); if (!t) return; const sm = gxRealSm(t);
                h = `<b>🚂 Tarkib №${E(t.no)}</b><span>${HR_T[t.holat][0]} ${E(HR_T[t.holat][1])} · ${E(hrPlace(t.joy))}</span><span>👤 ${E(t.mashinist || '—')}${sm && typeof msTripTxt === 'function' ? ' · ' + E(msTripTxt(sm)) : ''}</span>`; }
            s.innerHTML = `<div class="gx-i">${h}</div><div class="gx-b"><button onclick="gxPageCur()">📄 Batafsil</button><button class="${GX.follow ? 'on' : ''}" onclick="GX.follow=!GX.follow; gxStrip(); gxDrawFocus(false)">🎯 Kuzatish</button><button onclick="gxAll()">👥 Hammasi</button></div>`;
        }
        function gxPageCur() { const f = GX.f; if (!f) return; if (f.kind === 'real') { gdClose(true); trkPage(f.tid); } else gxDemoPage(f.no); }
        function gxDemoPage(no) {
            const t = GD.trains.find(x => x.no === no); if (!t) return; const E = escapeHtml, st = (GD_ST[gdState(t)] || ['', '']);
            const vt = {}; (t.vags || []).forEach(v => { vt[v.type] = (vt[v.type] || 0) + 1; });
            mdl('gdModal', `<div class="px-h"><b>🚂 Tarkib №${t.no} <em class="ns-demo">DEMO</em></b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>
                <div class="ns-grid"><div><span>🚂 Lokomotiv</span><b>${E(hrName(t.lok))}</b><small>${E(t.lok.type || '')}</small></div><div><span>📋 Holati</span><b>${st[0]} ${E(st[1])}</b><small>${t.blk ? '⛔ yoʻl band — kutmoqda' : ''}</small></div>
                <div><span>🚃 Tarkibda</span><b>${(t.vags || []).length} ta vagon</b><small>${Object.keys(vt).map(k => E(k) + ': ' + vt[k]).join(', ')}</small></div><div><span>📍 Hozir</span><b>${E(typeof gdWhereTrain === 'function' ? gdWhereTrain(t) : '')}</b></div></div>
                ${typeof hdTrain === 'function' ? hdTrain(t.lok, t.vags || []) : ''}
                <div class="nd-tip">🧪 Namunaviy harakat. Lokomotiv yoki vagonni bossangiz — pasporti ochiladi.</div>
                <div class="ns-acts"><button onclick="mdlClose('gdModal'); gxFocus({kind:'demo', no:${t.no}})">📍 Sxemada</button><button onclick="mdlClose('gdModal'); openPassport(${JSON.stringify(t.lok.id)})">📄 Lokomotiv pasporti</button><button onclick="mdlClose('gdModal'); gxAll()">👥 Hammasi</button></div>`, true);
        }
        // ---------- Yozuvlar ustma-ust chiqmaydi: muhimrog'i qoladi, qolgani yashiriladi (yaqinlashtirsangiz chiqadi) ----------
        var GX_PRI = [['.ms-mk.l-j,.ms-mk.l-o,.ms-mk.l-y', 9], ['.gx-real', 8], ['.bf-mk.sel', 8], ['.ms-mk', 7], ['.bf-lb', 6], ['.gd-lbl.sel,.gd-dot.sel', 6], ['.gd-lbl', 4], ['.kr-mk.res', 3], ['.kr-mk', 2], ['.gd-q', 2], ['.trk-pin', 5]];
        function gxDeclutter() {
            const root = $id('gdMap'); if (!root) return; const all = [];
            GX_PRI.forEach(([sel, pr]) => root.querySelectorAll(sel).forEach(el => { if (el._gxp === undefined || el._gxp < pr) el._gxp = pr; }));
            root.querySelectorAll('.ms-mk,.gx-real,.bf-lb,.gd-lbl,.kr-mk,.gd-q,.trk-pin').forEach(el => { el.classList.remove('gx-dc'); const r = el.getBoundingClientRect(); if (r.width && r.height) all.push({ el: el, r: r, p: el._gxp || 1 }); el._gxp = undefined; });
            all.sort((a, b) => b.p - a.p); const keep = [];
            all.forEach(o => { const r = o.r, hit = keep.some(k => !(r.right - 2 < k.left || r.left + 2 > k.right || r.bottom - 2 < k.top || r.top + 2 > k.bottom)); if (hit) o.el.classList.add('gx-dc'); else keep.push(r); });
        }
        // ---------- Tarkib sahifasi (dispetcher kiritgan tarkib) ----------
        function trkPage(tid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid); if (!t) { showToast('Tarkib topilmadi (tarqatilgan boʻlishi mumkin)'); return; } GX.page = tid;
            const E = escapeHtml, lok = vagonlarData.find(x => x.id === t.lokId), vs = t.vagonIds.map(id => vagonlarData.find(x => x.id === id)).filter(Boolean), sm = gxRealSm(t);
            const x = sm && typeof findXodimsByTabel === 'function' ? (findXodimsByTabel(sm.tabel)[0] || {}).item : null;
            const warn = vs.filter(v => v.status === "Ta'mir talab"), ns = typeof nsAll === 'function' ? nsAll().filter(n => !n.demo && n.st !== 'hal' && (n.unitId === t.lokId || t.vagonIds.includes(n.unitId))) : [];
            const tw = (t.tow || []).map(id => vagonlarData.find(v => v.id === id)).filter(Boolean);
            const re = new RegExp('№' + String(t.no).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\D|$)'), log = d.log.filter(l => re.test(l.text) || (lok && l.text.includes(hrName(lok)))).slice(0, 30);
            secScreen('screen-trk', '🚂 Tarkib', "openHrList('tarkib')"); openScreen('screen-trk'); $id('screen-trk').querySelector('.sec-title').textContent = '🚂 Tarkib №' + t.no;
            secBody('screen-trk').innerHTML = `<div class="ns-hero" style="--nc:${t.holat === 'yukli' ? '#22c55e' : t.holat === 'yuksiz' ? '#38bdf8' : t.holat === 'yuklash' ? '#f97316' : '#eab308'}"><div class="ns-hl">${HR_T[t.holat][0]}</div><div><b>${E(HR_T[t.holat][1])} — ${E(hrPlace(t.joy))}</b><small>${t.from || t.to ? 'Yoʻnalish: ' + E(hrPlace(t.from)) + ' → ' + E(hrPlace(t.to)) + ' · ' : ''}${t.yuk ? 'Yuk: ' + E(t.yuk) + ' · ' : ''}yangilangan ${E(hrAgo(t.updAt))}</small></div></div>
                <div class="ns-grid">
                    <div><span>🚂 Lokomotiv</span><b>${lok ? E(hrName(lok)) : 'yoʻq'}</b><small>${lok ? E(lok.type || '') : ''}</small></div>
                    <div><span>👤 Mashinist</span><b>${E(t.mashinist || '—')}</b><small>${x ? E(x.lavozim || '') : ''}${x && x.phone ? ` · <a class="tel-link" href="${telHref(x.phone)}">📞 ${E(x.phone)}</a>` : ''}</small></div>
                    <div><span>⏱ Smena</span><b>${sm ? E(msHM(sm.start)) + ' dan' : '—'}</b><small>${sm && typeof msTripTxt === 'function' ? E(msTripTxt(sm)) : 'smena ochilmagan'}</small></div>
                    <div><span>🚃 Tarkibda</span><b>${vs.length} ta vagon${tw.length ? ' + ' + tw.length + ' lok.' : ''}</b><small>${E(Object.entries(vs.reduce((a, v) => (a[v.type] = (a[v.type] || 0) + 1, a), {})).map(([k, n]) => k + ': ' + n).join(', '))}</small></div>
                </div>
                ${typeof hdTrain === 'function' && lok ? hdTrain(lok, tw.concat(vs)) : ''}
                ${tw.map(v => `<div class="trk-tow"><div>🔧 <b>${E(hrName(v))}</b> — taʼmirga tortib ketilmoqda${t.towTo ? ' → ' + E(hrPlace(t.towTo)) : ''}</div>${trkCanTow(t) ? `<button onclick="trkTowArrive('${E(t.id)}', ${v.id})">✅ Yetib keldi — taʼmirga topshirish</button>` : ''}</div>`).join('')}
                ${warn.length ? `<div class="hr-warn">⚠️ ${warn.length} ta vagonning DR muddati «Taʼmir talab»: ${warn.slice(0, 12).map(v => '№' + E(vagonNo(v))).join(', ')}</div>` : ''}
                ${ns.length ? ns.map(n => `<div class="nd-tip" onclick="nsDetail('${n.id}')" style="cursor:pointer;border-left:4px solid ${NS_LVL[n.lvl].c}">${NS_LVL[n.lvl].ic} Ochiq nosozlik: ${E(n.izoh || NS_LVL[n.lvl].d)} — ${E(n.unitName || '')} ›</div>`).join('') : ''}
                <div class="ns-acts"><button onclick="trkShowOnMap('${E(t.id)}')">📍 Sxemada koʻrsatish</button><button onclick="trkShowOnMap('${E(t.id)}', true)">🕘 Harakat tarixi</button>${canHR() ? `<button onclick="hrQuick('${E(t.id)}')">🔄 Holat</button>` : ''}</div>
                <div class="ms-b2">${canHR() ? `<button onclick="hrEditTarkib('${E(t.id)}')">✏️ Tahrirlash</button>` : ''}${trkCanTow(t) ? `<button onclick="trkTowAsk('${E(t.id)}')">🔧 Buzilgan lokomotivni ulash</button>` : ''}</div>
                <div class="inf-sec">📜 Holatlar tarixi</div>${log.map(l => `<div class="hr-log">${l.icon || '📝'} ${E(l.text)}<small>${E(fmtDateTime(l.at))} · ${E(l.by ? meLabel(l.by) : '')}</small></div>`).join('') || '<div class="xt-empty">Yozuv yoʻq</div>'}`;
        }
        // ---------- Buzilgan lokomotivni tarkibga ulab, taʼmirga tortib kelish ----------
        function trkCanTow(t) { try { if (canHR()) return true; const sm = typeof mySmena === 'function' ? mySmena() : null; return !!sm && (sm.tarkibId === t.id || sm.unitId === t.lokId); } catch (e) { return false; } }
        function trkTowAsk(tid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid); if (!t || !trkCanTow(t)) return; const E = escapeHtml, used = new Set(); d.tarkiblar.forEach(x => { if (x.lokId) used.add(x.lokId); (x.tow || []).forEach(i => used.add(i)); });
            GX.towQ = ''; const draw = () => { const q = aiNorm(GX.towQ || ''), l = onlyLoks().filter(v => !used.has(v.id) && (!q || aiNorm(hrName(v) + ' ' + (v.inv || '')).includes(q))).slice(0, 60);
                mdl('trkTow', `<div class="px-h"><b>🔧 Buzilgan lokomotivni ulash — tarkib №${E(t.no)}</b><button class="mini-btn" onclick="mdlClose('trkTow')">✕</button></div>
                    <div class="nd-tip">Teplovoz yoki elektrovoz taʼmir uchun stansiya yoki sexga tortib boriladi. Yetib kelgach «✅ Taʼmirga topshirish» bosiladi — pasport, taʼmir tarixi va dispetcherda bir vaqtda.</div>
                    <div class="hr-f"><label>QAYERGA TORTIB BORILADI</label><select id="towTo">${hrPlaceOpts(t.towTo || '', '—')}</select></div>
                    <input class="ns-ta" placeholder="🔍 Lokomotiv raqami…" value="${E(GX.towQ)}" oninput="GX.towQ=this.value; clearTimeout(GX.tq2); GX.tq2=setTimeout(GX.towDraw,250)">
                    <div class="ms-pl">${l.map(v => `<div onclick="trkTowAdd('${E(tid)}', ${v.id})"><b>${E(hrName(v))}</b><small>${E(v.type || '')} · ${E(v.status || '')}${hrInRepair(v) ? " · 🔧 ta'mirda" : ''}</small></div>`).join('') || '<div class="nd-tip">Topilmadi</div>'}</div>`); };
            GX.towDraw = draw; draw();
        }
        function trkTowAdd(tid, lid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid), v = vagonlarData.find(x => x.id === lid); if (!t || !v) return; const to = ($id('towTo') || {}).value || '';
            t.tow = (t.tow || []).filter(i => i !== lid).concat(lid); t.towTo = to || t.towTo || ''; t.updAt = new Date().toISOString(); t.updBy = authorStr(); delete d.units[lid];
            hrLog(d, `🔧 Tarkib №${t.no}: ${hrName(v)} taʼmirga tortib ketilmoqda${t.towTo ? ' → ' + hrPlace(t.towTo) : ''}`, '🔧'); hrSave(d);
            v.history = v.history || []; v.history.unshift({ date: todayISO(), type: `🔧 Tortib ketilmoqda (taʼmirga): tarkib №${t.no}${t.towTo ? ' → ' + hrPlace(t.towTo) : ''} (${nowHM()})`, author: authorStr(), src: 'pol' }); saveDB(false);
            mdlClose('trkTow'); showToast('🔧 ' + hrName(v) + ' tarkibga ulandi'); trkRefresh(tid);
        }
        async function trkTowArrive(tid, lid) {
            const d = hrDB(), t = d.tarkiblar.find(x => x.id === tid), v = vagonlarData.find(x => x.id === lid); if (!t || !v) return;
            openPassport(lid); await markVagonAsTamirda(); // taʼmir turi va uchastka so'raladi; pasport, tarix, polojeniya, tarkib — bir vaqtda
            if (v.status !== 'Tamirda') return; const d2 = hrDB(), t2 = d2.tarkiblar.find(x => x.id === tid); if (t2) { t2.tow = (t2.tow || []).filter(i => i !== lid); if (!t2.tow.length) t2.towTo = ''; t2.updAt = new Date().toISOString(); hrLog(d2, `✅ Tarkib №${t2.no}: ${hrName(v)} taʼmirga topshirildi${t.towTo ? ' — ' + hrPlace(t.towTo) : ''}`, '✅'); hrSave(d2); }
            trkRefresh(tid);
        }
        function trkRefresh(tid) { try { if ($id('screen-trk') && $id('screen-trk').classList.contains('active')) trkPage(tid); else if ($id('screen-mash') && $id('screen-mash').classList.contains('active') && typeof mashRender === 'function') mashRender(); } catch (e) {} }
        async function trkShowOnMap(tid, hist) { await gdOpen(); gxFocus({ kind: 'real', tid: tid }); if (hist) showToast('🕘 Bugungi yoʻl — mashinist GPS maʼlumotidan'); }
        // ---------- Harakat jurnali: yozuv bosilsa — tegishli sahifa ----------
        function hrLogTarget(x, d) {
            const tx = x.text || ''; let m = tx.match(/(?:Yangi tarkib|Tarkib) №([^\s:,]+)/);
            if (x.tid) { const t = d.tarkiblar.find(z => z.id === x.tid); if (t) return { k: 'trk', id: t.id }; }
            if (m) { const t = d.tarkiblar.find(z => String(z.no) === m[1]); return t ? { k: 'trk', id: t.id } : { k: 'gone', no: m[1] }; }
            if (/🆘|Nosozlik/.test(tx) && typeof nsAll === 'function') { const n = nsAll().filter(n => !n.demo && Math.abs(new Date(n.at) - new Date(x.at)) < 5 * 60e3)[0]; if (n) return { k: 'ns', id: n.id }; }
            const u = vagonlarData.filter(v => v.kind && v.kind !== 'infra' && tx.includes(hrName(v))).sort((a, b) => hrName(b).length - hrName(a).length)[0]; if (u) return { k: 'unit', id: u.id };
            return null;
        }
        function hrLogGo(i) {
            const d = hrDB(), x = (GX.logL || [])[i]; if (!x) return; const g = hrLogTarget(x, d); if (!g) return;
            if (g.k === 'trk') trkPage(g.id); else if (g.k === 'ns') nsDetail(g.id); else if (g.k === 'unit') openPassport(g.id);
            else { const E = escapeHtml, re = new RegExp('№' + g.no.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\D|$)'); mdl('gdModal', `<div class="px-h"><b>🗃 Tarkib №${E(g.no)} — tarqatilgan</b><button class="mini-btn" onclick="mdlClose('gdModal')">✕</button></div>${d.log.filter(l => re.test(l.text)).map(l => `<div class="hr-log">${l.icon || '📝'} ${E(l.text)}<small>${E(fmtDateTime(l.at))} · ${E(l.by ? meLabel(l.by) : '')}</small></div>`).join('')}`, true); }
        }
        (function () {
            // 1) Yaqinlashtirganda harakatdagi tarkib yo'qolmaydi: markazi ekrandan tashqarida bo'lsa ham, biror qismi ko'rinsa — chiziladi
            const ALLB = () => GX.allb || (GX.allb = L.latLngBounds([[-89, -179], [89, 179]]));
            if (typeof gdDrawOne === 'function') gdDrawOne = agmkExtend('gdDrawOne', 'v3.6.1: qisman koʻrinsa ham chiziladi', gdDrawOne, o => function (t, mode, bnd, k) {
                try { if (mode >= 1 && bnd && !gdHideQ(t)) { const p = gdPos(t); if (!bnd.contains(ygToLL(p.x, p.y))) { const U = gdUnitsPos(t); if (U.some(z => bnd.contains(ygToLL(z.q.x, z.q.y)))) bnd = ALLB(); } } } catch (e) {}
                const r = o.call(this, t, mode, bnd, k);
                try { const f = GX.f, dim = f && !(f.kind === 'demo' && !t.static && t.no === f.no); [t.mk].concat(t.parts || []).concat(t.body ? [t.body] : []).forEach(x => { const el = x && (x.getElement ? x.getElement() : x._path); if (el) el.style.opacity = dim ? '0.28' : ''; }); } catch (e) {}
                return r;
            });
            // 2) Demo tarkiblar yo'li (tanlanganda chiziladi) — har 60 sekundda nuqta
            if (typeof gdStep === 'function') { const oS = gdStep; gdStep = function (dt) { const r = oS.apply(this, arguments); try { if (GD.kr) { const T = Math.floor(GD.t / 60); if (GX.lastT !== T) { GX.lastT = T; GD.trains.forEach(t => { if (t.route === 'zax' || !t.leg) return; const p = gdPos(t); const h = t.hist = t.hist || []; const l = h[h.length - 1]; if (l) t.km = (t.km || 0) + Math.hypot(p.x - l[1], p.y - l[2]) * (typeof GD_M_PER_PT !== 'undefined' ? GD_M_PER_PT : 1) / 1000; h.push([GD.t, p.x, p.y]); if (h.length > 1500) h.shift(); }); } } } catch (e) {} return r; }; }
            // 3) Sxemadagi tarkib bosilsa — shu tarkib rejimi (hammasi tugmasi bilan odatiy kuzatuvga qaytiladi)
            gdInfo = function (no) { gxFocus({ kind: 'demo', no: no }); };
            if (typeof gdDraw === 'function') { const oD = gdDraw; gdDraw = function () { const r = oD.apply(this, arguments); try { if (GX.f) { gxDrawFocus(false); if (GX.f.kind === 'real' && Date.now() - (GX.trkAt || 0) > 60000) gxLoadTrk(); } const n = Date.now(); if (n - GX.dcAt > 350) { GX.dcAt = n; requestAnimationFrame(gxDeclutter); } } catch (e) { console.error(e); } return r; }; }
            if (typeof gdPanel === 'function') { const oP = gdPanel; gdPanel = function () { const r = oP.apply(this, arguments); try { const p = $id('gdPanel'); if (p && !p.querySelector('.gx-hb')) p.insertAdjacentHTML('afterbegin', '<button class="gx-hb" onclick="gxSetHidden(true)" title="Panelni yashirish — xarita toʻliq ekranda">⬇ Yashirish</button>'); gxPanelState(); gxStrip(); } catch (e) {} return r; }; }
            // tarkibdagi tortilayotgan lokomotiv boshqa yo'l bilan taʼmirga topshirilgan bo'lsa — ro'yxatdan chiqadi
            if (typeof hrSanitize === 'function') { const oSan = hrSanitize; hrSanitize = function () { const d = oSan.apply(this, arguments); try { let ch = false; (d.tarkiblar || []).forEach(t => { if (!t.tow || !t.tow.length) return; const k = t.tow.filter(id => { const v = vagonlarData.find(x => x.id === id); return v && !hrInRepair(v); }); if (k.length !== t.tow.length) { t.tow = k; t.updAt = new Date().toISOString(); ch = true; } }); if (ch) hrSave(d); } catch (e) {} return d; }; }
            // Avtotraktor xaritasi (navigator): ham panelni yashirish — xarita to'liq ekranda
            if (typeof nvOpen === 'function') { const oN = nvOpen; nvOpen = async function () { const r = await oN.apply(this, arguments); try { const v = $id('nvView'), top = v && v.querySelector('.nv-top'); if (top && !$id('nvHideB')) { const b = document.createElement('button'); b.id = 'nvHideB'; b.title = 'Panelni yashirish'; b.onclick = () => { v.classList.toggle('nv-full'); b.textContent = v.classList.contains('nv-full') ? '⬆' : '⬇'; setTimeout(() => NV.map && NV.map.invalidateSize(), 60); }; b.textContent = '⬇'; top.appendChild(b); } } catch (e) {} return r; }; }
            if (typeof gdClose === 'function') { const oC = gdClose; gdClose = function () { GX.f = null; return oC.apply(this, arguments); }; }
            // 4) Tarkib kartochkasi bosilsa — sahifasi; «+ Yangi tarkib» ro'yxat tepasida
            if (typeof hrTarkibCard === 'function') hrTarkibCard = agmkExtend('hrTarkibCard', 'v3.6.1: sahifaga oʻtish', hrTarkibCard, o => function (t) { const tw = (t.tow || []).map(id => vagonlarData.find(v => v.id === id)).filter(Boolean); return o.apply(this, arguments).replace(/(<div class="hr-i">)/, tw.length ? '<div class="hr-warn" style="color:#fdba74">🔧 Tortib ketilmoqda: ' + tw.map(v => escapeHtml(hrName(v))).join(', ') + (t.towTo ? ' → ' + escapeHtml(hrPlace(t.towTo)) : '') + '</div>$1' : '$1').replace('<div class="hr-card ', `<div onclick="trkPage('${escapeHtml(t.id)}')" style="cursor:pointer" class="hr-card `).replace('<div class="hr-acts">', '<div class="hr-acts" onclick="event.stopPropagation()">').replace(/<div class="hr-chips">/, '<div class="hr-chips" onclick="event.stopPropagation()">'); });
            if (typeof renderHrList === 'function') renderHrList = agmkExtend('renderHrList', 'v3.6.1: yangi tarkib tugmasi tepada, jurnal havolalari', renderHrList, o => function () {
                try { const tp = $id('screen-trk'); if (tp && tp.classList.contains('active') && GX.page) { trkPage(GX.page); } } catch (e) {}
                if (!HR.kind || (HR.kind !== 'st' && HR.kind !== 'log' && HR.kind !== 'tarkib' && !HR_KIND[HR.kind])) return;
                const r = o.apply(this, arguments);
                try { const el = $id('hrList');
                    if (HR.kind === 'tarkib') { const b = el.querySelector('.hr-add'); if (b) { b.classList.add('hr-add-top'); el.insertBefore(b, el.firstChild); } }
                    if (HR.kind === 'log' && HR.view !== 'place') { const d = hrDB(); GX.logL = d.log.filter(x => hrMatch(x.text + ' ' + (x.by ? x.by.name : ''))).slice(0, 200);
                        el.querySelectorAll('.hr-log').forEach((n, i) => { const x = GX.logL[i]; if (!x || !hrLogTarget(x, d)) return; n.classList.add('hr-log-go'); n.setAttribute('onclick', 'hrLogGo(' + i + ')'); n.insertAdjacentHTML('beforeend', '<span class="hr-log-ar">›</span>'); }); }
                } catch (e) { console.error(e); }
                return r;
            });
            const st = document.createElement('style');
            st.textContent = `.gx-dc{opacity:0!important;pointer-events:none!important}
.gd-panel.gx-hid{display:none!important}.gx-handle{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1100;background:rgba(15,23,42,.92);border:1px solid rgba(125,211,252,.45);color:#e2e8f0;border-radius:18px;padding:7px 18px;font-weight:800;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.5);cursor:pointer}.gx-handle small{opacity:.75;margin-left:6px}.gx-handle.hidden{display:none}
.gx-hb{float:right;margin:-2px 0 4px 8px;border-radius:10px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:5px 10px;font-size:12px;font-weight:700}
.gx-strip{position:absolute;left:8px;right:8px;top:112px;z-index:1050;background:rgba(15,23,42,.94);border:1.5px solid #38bdf8;border-radius:14px;padding:8px 10px;box-shadow:0 6px 18px rgba(0,0,0,.5)}.gx-strip.hidden{display:none}
.gx-strip .gx-i b{display:block;font-size:14px}.gx-strip .gx-i span{display:block;font-size:12px;opacity:.88}.gx-strip .gx-b{display:flex;gap:6px;margin-top:6px}.gx-strip .gx-b button{flex:1;border-radius:10px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;padding:7px 4px;font-size:12px;font-weight:700}.gx-strip .gx-b button.on{background:#0ea5e9;border-color:#38bdf8}
.gx-real{transform:translate(-50%,-125%);width:max-content;background:#0ea5e9;color:#fff;border:2px solid #fff;border-radius:10px;padding:3px 9px;font-weight:800;font-size:12px;box-shadow:0 0 0 4px rgba(14,165,233,.35)}.gx-real small{display:block;font-size:10.5px;font-weight:600}
.trk-tow{border:1px solid #9a3412;background:rgba(124,45,18,.35);border-radius:12px;padding:8px 10px;margin:8px 0}.trk-tow button{margin-top:6px;width:100%;border-radius:10px;border:1px solid #15803d;background:#15803d;color:#fff;padding:9px;font-weight:800}#nvView.nv-full .nv-card,#nvView.nv-full .nv-list{display:none!important}#nvView.nv-full .nv-map{flex:1;height:auto}.hr-add.hr-add-top{position:static!important;margin:0 0 10px!important}
.hr-log.hr-log-go{cursor:pointer;position:relative;padding-right:26px}.hr-log-ar{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:20px;opacity:.6}`;
            document.head.appendChild(st);
        })();

