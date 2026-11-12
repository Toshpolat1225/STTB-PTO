        // =====================================================================
        // v2.6 — 1-bosqich: AI tugmasini surish; bog'lashda bekor qilish/tozalash; GPS tanlovni olib tashlash;
        //  topilmadan manba faylni o'sha qatorida ochish (shaffof rang bilan)
        // =====================================================================
        // ---------- 1) AI tugmasi — istalgan joyga surish ----------
        var AIPOS_KEY = 'agmk_ai_pos';
        function aiPosGet() { try { return JSON.parse(localStorage.getItem(AIPOS_KEY) || 'null'); } catch (e) { return null; } }
        function aiPosApply() {
            const b = $id('aiGlobal'); if (!b) return; const p = aiPosGet();
            if (!p) { b.style.left = b.style.top = ''; b.style.right = b.style.bottom = ''; return; }
            const W = window.innerWidth, H = window.innerHeight, w = b.offsetWidth || 64, h = b.offsetHeight || 64;
            const top = Math.max(60, Math.min(H - h - 70, p.y * H)), left = p.side === 'l' ? 12 : W - w - 12;
            b.style.right = 'auto'; b.style.bottom = 'auto'; b.style.left = left + 'px'; b.style.top = top + 'px';
        }
        // Uzoq bosilganda — kichik tezkor oyna: mikrofon («Ey AI») yoqish/o'chirish, sozlamalar, joyini tiklash
        function aiQuick() {
            let p = $id('aiQuick'); if (p) { p.remove(); return; }
            const b = $id('aiGlobal'); if (!b) return; const r = b.getBoundingClientRect(), on = typeof wakeGet === 'function' ? wakeGet() : false, sup = typeof wakeSupported === 'function' ? wakeSupported() : false;
            p = document.createElement('div'); p.id = 'aiQuick'; p.className = 'ai-quick';
            p.innerHTML = `<button class="${on ? 'on' : ''}" onclick="try{wakeSet(!wakeGet())}catch(e){} $id('aiQuick').remove(); showToast(wakeGet() ? '🎤 Mikrofon yoqildi — «Ey AI» deng' : '🔇 Mikrofon oʻchirildi')">${on ? '🎤 Mikrofon: YONIQ' : '🔇 Mikrofon: OʻCHIQ'}${sup ? '' : '<small>bu qurilmada ishlamaydi</small>'}</button><button onclick="$id('aiQuick').remove(); try{openAiCfg()}catch(e){}">⚙️ AI sozlamalari</button><button onclick="$id('aiQuick').remove(); aiPosReset()">↩️ Joyini tiklash</button><button onclick="$id('aiQuick').remove()">✕</button>`;
            document.body.appendChild(p);
            const W = window.innerWidth, left = r.left + r.width / 2 < W / 2 ? r.right + 8 : r.left - p.offsetWidth - 8;
            p.style.left = Math.max(8, Math.min(W - p.offsetWidth - 8, left)) + 'px'; p.style.top = Math.max(8, Math.min(window.innerHeight - p.offsetHeight - 8, r.top + r.height / 2 - p.offsetHeight / 2)) + 'px';
            setTimeout(() => document.addEventListener('pointerdown', function h(e) { const q = $id('aiQuick'); if (q && !q.contains(e.target) && e.target !== b) q.remove(); document.removeEventListener('pointerdown', h, true); }, true), 50);
        }
        function aiPosReset() { try { localStorage.removeItem(AIPOS_KEY); } catch (e) {} aiPosApply(); showToast('↩️ AI tugmasi asl joyiga qaytdi'); }
        (function () {
            const init = () => {
                const b = $id('aiGlobal'); if (!b || b._drag) return; b._drag = true; b.style.touchAction = 'none';
                let st = null, moved = false, lp = null;
                b.addEventListener('pointerdown', e => { const r = b.getBoundingClientRect(); st = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top }; moved = false;
                    clearTimeout(lp); lp = setTimeout(() => { if (st && !moved) { st = null; b._skip = Date.now() + 400; aiQuick(); } }, 650);
                    try { b.setPointerCapture(e.pointerId); } catch (x) {} });
                b.addEventListener('pointermove', e => { if (!st) return; const d = Math.hypot(e.clientX - st.x, e.clientY - st.y); if (!moved && d < 10) return; moved = true; clearTimeout(lp);
                    b.style.right = 'auto'; b.style.bottom = 'auto'; b.style.left = Math.max(0, Math.min(window.innerWidth - b.offsetWidth, e.clientX - st.dx)) + 'px'; b.style.top = Math.max(0, Math.min(window.innerHeight - b.offsetHeight, e.clientY - st.dy)) + 'px'; b.classList.add('ai-dragging'); });
                const end = e => { clearTimeout(lp); if (!st) return; const was = moved; st = null; b.classList.remove('ai-dragging');
                    if (was) { const r = b.getBoundingClientRect(), side = (r.left + r.width / 2) < window.innerWidth / 2 ? 'l' : 'r'; try { localStorage.setItem(AIPOS_KEY, JSON.stringify({ side: side, y: r.top / window.innerHeight })); } catch (x) {} aiPosApply(); b._skip = Date.now(); } };
                b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
                b.addEventListener('click', e => { if (b._skip && Date.now() - b._skip < 900) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
                aiPosApply();
            };
            setTimeout(init, 800); window.addEventListener('resize', () => aiPosApply());
        })();
        // ---------- 2) Bog'lash: oxirgisini bekor qilish / hammasini o'chirish ----------
        async function calUndo() { const g = ygGeo(); if (!g.pairs.length) return; if (!(await uiConfirm('Oxirgi (' + g.pairs.length + '-) juftlik bekor qilinsinmi?'))) return; g.pairs.pop(); g.at = new Date().toISOString(); kvSet(YG_GEO_KEY, g); calApply(); calDrawPairs(); showToast('↶ Oxirgi juftlik bekor qilindi'); }
        async function calClearAll() { const g = ygGeo(); if (!g.pairs.length) return; if (!(await uiConfirm('Barcha ' + g.pairs.length + ' ta juftlik oʻchirilsinmi? Sxema asl (bogʻlanmagan) holatiga qaytadi.'))) return; kvSet(YG_GEO_KEY, { pairs: [], cs: 'm2', at: new Date().toISOString(), by: String(currentUser && currentUser.tabel || '') }); calApply(); calDrawPairs(); showToast('🗑 Hammasi oʻchirildi'); }
        (function () {
            if (typeof calFoot === 'function') { calFoot = agmkExtend('calFoot', 'calFoot', calFoot, o => function () { o.apply(this, arguments); try { const f = $id('calFoot'), n = ygGeo().pairs.length; if (f && n) f.insertAdjacentHTML('beforeend', `<div class="cal-act cal-act2"><button onclick="calUndo()">↶ Oxirgisini bekor qilish</button><button class="danger" onclick="calClearAll()">🗑 Hammasini oʻchirish</button></div>`); } catch (e) {} }); }
            if (typeof ygPanelHtml === 'function') { ygPanelHtml = agmkExtend('ygPanelHtml', 'ygPanelHtml', ygPanelHtml, o => function () { let h = o.apply(this, arguments); try { if (isAdmin() && ygGeo().pairs.length) h = h.replace('<div class="yg-adm">', '<div class="yg-adm"><button onclick="calUndo().then(()=>renderLayerPanel())">↶ Oxirgisini bekor qilish</button>'); } catch (e) {} return h; }); }
        })();
        // ---------- 3) GPS: tanlovni olib tashlash ----------
        function gdUnsel() { GD.sel = null; try { mdlClose('gdModal'); } catch (e) {} GD.trains.concat(GD.statics || []).forEach(t => { t.key = ''; }); try { gdDraw(); } catch (e) {} }
        (function () {
            ['gdInfo', 'gdStaticInfo'].forEach(fn => { if (typeof window[fn] !== 'function') return; const o = window[fn]; window[fn] = function () { const r = o.apply(this, arguments); try { const m = $id('gdModal'), c = m && m.querySelector('.modal-content'); if (c && !c.querySelector('.gd-unsel')) c.insertAdjacentHTML('beforeend', '<button class="action-btn gd-unsel" onclick="gdUnsel()">✖ Belgini olib tashlash</button>'); } catch (e) {} return r; }; });
            if (typeof gdOpen === 'function') { gdOpen = agmkExtend('gdOpen', 'gdOpen', gdOpen, o => async function () { const r = await o.apply(this, arguments); try { if (GD.map && !GD.map._unselHook) { GD.map._unselHook = true; GD.map.on('click', () => { if (GD.sel !== null) gdUnsel(); }); } } catch (e) {} return r; }); }
        })();
        // ---------- 4) Topilmadan manba faylni o'sha qatorida ochish ----------
        var SRCV = { d: null, list: [], i: 0, lvl: '' };
        async function srcOpen(fi, si) {
            const d = SRCV.d || (typeof HS !== 'undefined' ? HS.data : null); if (!d) return; const f = SRCV.order[fi]; if (!f) return;
            SRCV.list = (f.src || []).filter(Boolean); SRCV.i = si || 0; SRCV.lvl = f.lvl; SRCV.f = f; await srcShow();
        }
        async function srcShow() {
            const z = SRCV.list[SRCV.i], d = SRCV.d, E = escapeHtml; if (!z) return;
            const fr = (d.files || []).find(x => x.name === z.f);
            let rows = null, err = '';
            try { if (!fr) throw new Error('Fayl saqlanmagan (eski tekshiruv)'); const b = await mediaGetBlob(fr.ref); if (!b) throw new Error('Fayl topilmadi'); SRCV.cache = SRCV.cache || {}; let bk = SRCV.cache[fr.ref]; if (!bk) { bk = await hpReadBook(new File([b], fr.name, { type: b.type || '' })); SRCV.cache[fr.ref] = bk; } const sh = bk.find(x => x.s === z.s) || bk[0]; rows = sh ? sh.rows : null; } catch (e) { err = agmkErrUz(e); }
            const cls = SRCV.lvl === 'red' ? 'sv-red' : SRCV.lvl === 'blue' ? 'sv-blue' : 'sv-info', r0 = z.r === undefined || z.r === null ? -1 : z.r;
            let tbl = '';
            if (rows) {
                const a = Math.max(0, r0 - 25), b2 = Math.min(rows.length, (r0 < 0 ? 40 : r0 + 26)), nc = Math.min(30, Math.max(1, ...rows.slice(a, b2).map(r => { let k = r.length; while (k > 0 && (r[k - 1] === '' || r[k - 1] === null)) k--; return k; })));
                // v3.2: oynadagi butunlay boʻsh ustunlar koʻrsatilmaydi (telefonda miqdor ustuni ekrandan chiqib ketmasin); topilgan qator — alohida, ustun harflari bilan
                const emp = v => v === undefined || v === null || String(v).trim() === '', cols = Array.from({ length: nc }, (_, j) => j).filter(j => rows.slice(a, b2).some(r => !emp(r[j])));
                const cell = v => E(emp(v) ? '' : typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v)), CL = j => typeof XLSX !== 'undefined' ? XLSX.utils.encode_col(j) : String(j + 1);
                const hit = r0 >= 0 && rows[r0] ? cols.filter(j => !emp(rows[r0][j])).map(j => `<span><small>${CL(j)}</small> ${cell(rows[r0][j])}</span>`).join('') : '';
                tbl = (hit ? `<div class="sv-hit ${cls}"><b>${r0 + 1}-qator:</b> ${hit}</div>` : '') + `<div class="sv-wrap" id="svWrap"><table class="sv-t"><tr><th></th>${cols.map(j => `<th>${E(CL(j))}</th>`).join('')}</tr>` +
                    rows.slice(a, b2).map((r, k) => { const i = a + k; return `<tr class="${i === r0 ? cls : ''}"${i === r0 ? ' id="svHit"' : ''}><th>${i + 1}</th>${cols.map(j => `<td>${cell(r[j])}</td>`).join('')}</tr>`; }).join('') + '</table></div>';
            }
            mdl('srcModal', `<div class="px-h"><b>👁 ${E(z.f || '')}</b><button class="mini-btn" onclick="mdlClose('srcModal')">✕</button></div>
                <div class="nd-tip">${E(z.s || '')}${r0 >= 0 ? ' · <b>' + (r0 + 1) + '-qator</b>' : ''} · ${SRCV.lvl === 'red' ? '❌ xato' : SRCV.lvl === 'blue' ? '🔷 tekshirish kerak' : 'ℹ️'}: ${E(SRCV.f.name || '')} — ${E(SRCV.f.msg || '')}</div>
                ${SRCV.list.length > 1 ? `<div class="sv-nav"><button ${SRCV.i ? '' : 'disabled'} onclick="SRCV.i--; srcShow()">◀</button><span>${SRCV.i + 1} / ${SRCV.list.length}</span><button ${SRCV.i < SRCV.list.length - 1 ? '' : 'disabled'} onclick="SRCV.i++; srcShow()">▶</button></div>` : ''}
                ${err ? `<div class="hs-r">⚠️ ${E(err)}. Tekshiruvni qayta yuklab o'tkazsangiz, fayl saqlanadi va shu yerda ochiladi.</div>` : tbl}`, true);
            setTimeout(() => { const h = $id('svHit'), w = $id('svWrap'); if (h && w) w.scrollTop = h.offsetTop - w.clientHeight / 2; }, 60);
        }
        (function () {
            if (typeof hpChkLoad !== 'function') return; hpChkLoad = agmkExtend('hpChkLoad', 'hpChkLoad', hpChkLoad, o => async function (x, d, box) {
                const r = await o.apply(this, arguments);
                try {
                    SRCV.d = d; SRCV.cache = {}; const secs = []; d.findings.forEach(f => { let s = secs.find(z => z.k === f.sec); if (!s) { s = { k: f.sec, L: [] }; secs.push(s); } s.L.push(f); });
                    SRCV.order = []; secs.forEach(s => s.L.forEach(f => SRCV.order.push(f)));
                    const host = box || document; const cards = host.querySelectorAll('.hs-f');
                    cards.forEach((c, fi) => { const f = SRCV.order[fi]; if (!f || !(f.src || []).length) return; const det = c.querySelector('details.hp-src'); if (!det) return;
                        det.querySelectorAll(':scope > div').forEach((dv, si) => { if (dv.querySelector('.sv-open')) return; dv.insertAdjacentHTML('beforeend', ` <button class="sv-open" onclick="event.stopPropagation(); srcOpen(${fi}, ${si})">👁 Ochish</button>`); });
                        const sm = det.querySelector('summary'); if (sm && !c.querySelector('.sv-open1')) det.insertAdjacentHTML('beforebegin', `<button class="sv-open sv-open1" onclick="srcOpen(${fi}, 0)">👁 Manbani ochish (qator belgilangan)</button>`); });
                } catch (e) { console.error(e); }
                return r;
            });
        })();

