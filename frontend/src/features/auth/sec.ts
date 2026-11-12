
        // =====================================================================
        // v3.0 — 🔒 XAVFSIZLIK (administrator boshqaradi; server orqali barcha qurilmalarga tarqaladi)
        //  • «Yopiq kontur»: ilova faqat korxona serveri bilan ishlaydi — tashqi internet (bulut AI, xarita
        //    plitkalari, qidiruv) brauzer darajasida (CSP) taqiqlanadi. Maʼlumot korxonadan tashqariga chiqmaydi.
        //  • Skrinshot / ekran yozuvi taqiqi: admin tanlagan bo'limlarda (xodimlar, temir yo'l sxemasi, hisobotlar,
        //    imzolash …) Android ekranni suratga olishni bloklaydi (FLAG_SECURE). Kompyuter/brauzerda buni to'liq
        //    taqiqlab bo'lmaydi — shuning uchun o'sha bo'limlarda ekran bo'ylab suv belgisi: F.I.O., tabel, vaqt.
        //  • Tarqatish faylida shaxsiy maʼlumotlar (tug'ilgan sana, telefon, oila) va AI kaliti bo'lmaydi.
        // =====================================================================
        var SEC_KEY = 'agmk_sec_cfg';
        var SEC_SECT = [
            ['xodim', '👷 Ishchi xodimlar, shtat, kadrlar'], ['sxema', '🗺 Temir yoʻl xaritasi va sxemalari'], ['hisob', '📊 Hisobotlar, buxgalteriya'],
            ['imzo', '✍️ Imzolash va imzo'], ['vagon', '🚃 Vagon pasportlari'], ['hujjat', '📚 Meʼyoriy hujjatlar va aktlar']
        ];
        var SEC = { on: null, wm: null };
        function secCfg() { const c = kvGet(SEC_KEY, null); return Object.assign({ closed: false, secure: ['xodim', 'sxema', 'hisob', 'imzo'], wm: true, adminToo: false }, c || {}); }
        function sec3Closed() { return !!secCfg().closed; }
        function secVis(id) { const e = $id(id); return !!e && !e.classList.contains('hidden'); }
        function secWhere() { // hozir ochiq bo'lim(lar)
            const a = (document.querySelector('.screen.active') || {}).id || '', out = new Set();
            const xod = typeof currentSectionType !== 'undefined' && currentSectionType === 'xodim';
            if (/^screen-(hr|hr-list|shtat)$/.test(a) || (xod && /^screen-(section-items|item-pasport)$/.test(a))) out.add('xodim');
            if (/^screen-(map|yol|infra-list|infra-obj|infra-topic)$/.test(a) || (a === 'screen-nd' && typeof ND !== 'undefined' && ND.gid === 'st_sxema')) out.add('sxema');
            if (/^screen-(hisob|bux)$/.test(a)) out.add('hisob');
            if (secVis('sgDoc') || secVis('sgMine') || secVis('sgList')) out.add('imzo');
            if (/^screen-(vagonlar|vagon-pasport)$/.test(a)) out.add('vagon');
            if (a === 'screen-nd') out.add('hujjat');
            return out;
        }
        function secTick() {
            if (!document.body || document.body.classList.contains('locked')) { secShield(false); return; }
            const c = secCfg(); if (isAdminReal() && !c.adminToo) { secShield(false); return; } // asoschi (administrator) uchun cheklov yoʻq — agar oʻzi yoqmagan boʻlsa
            const w = secWhere(), on = c.secure.some(k => w.has(k)); secShield(on, c.wm);
        }
        function secShield(on, wm) {
            if (SEC.on !== on) { SEC.on = on; try { if (window.AgmkNative && typeof AgmkNative.setSecure === 'function') AgmkNative.setSecure(!!on); } catch (e) {} }
            const show = !!(on && wm && typeof currentUser !== 'undefined' && currentUser && currentUser.tabel);
            let el = $id('secWm'); if (!show) { if (el) el.style.display = 'none'; return; }
            const txt = (String(currentUser.name || '').split(/\s+/).slice(0, 2).join(' ') + ' · ' + currentUser.tabel + ' · ' + fmtDT(new Date().toISOString())).replace(/</g, '');
            if (!el) { el = document.createElement('div'); el.id = 'secWm'; document.body.appendChild(el); }
            if (SEC.wm !== txt) { SEC.wm = txt; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200"><text x="10" y="120" transform="rotate(-24 180 100)" fill="rgba(148,163,184,0.16)" font-family="Arial" font-size="15">${txt.replace(/&/g, '&amp;')}</text></svg>`; el.style.backgroundImage = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")'; }
            el.style.display = 'block';
        }
        // ---------- Yopiq kontur: CSP (faqat ilova va korxona serveri) ----------
        (function () {
            if (!sec3Closed()) return;
            let srv = ''; try { const c = syncCfg(); srv = c && c.url ? new URL(c.url).origin : ''; } catch (e) {}
            const self = location.protocol === 'file:' ? '' : location.origin;
            const allow = ["'self'", 'data:', 'blob:', self, srv].filter(Boolean).join(' ');
            const m = document.createElement('meta'); m.httpEquiv = 'Content-Security-Policy';
            m.content = `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ${self}; connect-src ${allow}; img-src ${allow}; media-src ${allow}; font-src ${allow}; frame-src 'none'; object-src 'none'`;
            document.head.appendChild(m);
        })();
        // ---------- Admin oynasi ----------
        function secOpen() {
            if (!isAdminReal()) { alert('Xavfsizlik sozlamalarini faqat administrator oʻzgartiradi.'); return; }
            const c = secCfg(), E = escapeHtml;
            mdl('secModal', `<div class="px-h"><b>🔒 Xavfsizlik</b><button class="mini-btn" onclick="mdlClose('secModal')">✕</button></div>
                <label class="dvp-row"><input type="checkbox" id="secClosed" ${c.closed ? 'checked' : ''}><div><b>Yopiq kontur</b><br><small>Ilova faqat korxona serveri bilan ishlaydi. Bulut AI, internet xaritalari va tashqi manzillar taqiqlanadi (qurilmada ilova qayta ochilganda kuchga kiradi).</small></div></label>
                <div class="pp-lbl">SKRINSHOT VA EKRAN YOZUVI TAQIQLANGAN BOʻLIMLAR</div>
                ${SEC_SECT.map(([k, t]) => `<label class="dvp-row"><input type="checkbox" data-sec="${k}" ${c.secure.includes(k) ? 'checked' : ''}><div>${E(t)}</div></label>`).join('')}
                <label class="dvp-row"><input type="checkbox" id="secWmOn" ${c.wm ? 'checked' : ''}><div><b>Suv belgisi</b><br><small>Himoyalangan boʻlimlarda ekran boʻylab F.I.O., tabel va vaqt (suratga olinsa ham kimdan chiqqani koʻrinadi).</small></div></label>
                <label class="dvp-row"><input type="checkbox" id="secAdminToo" ${c.adminToo ? 'checked' : ''}><div><b>Administratorga ham qoʻllash</b><br><small>Oʻchiq boʻlsa — sizning (asoschi) telefoningizda skrinshot taqiqi va suv belgisi boʻlmaydi.</small></div></label>
                <div class="nd-tip">Sozlama korxona serveri orqali barcha xodimlar qurilmasiga tarqaladi. Android ilovada himoyalangan boʻlimni suratga olib boʻlmaydi (ekran qora chiqadi); kompyuter brauzerida — suv belgisi.</div>
                <button class="action-btn" onclick="secSave()">💾 Saqlash</button>`, true);
        }
        function secSave() {
            const c = { closed: !!$id('secClosed').checked, secure: [...document.querySelectorAll('#secModal [data-sec]:checked')].map(x => x.dataset.sec), wm: !!$id('secWmOn').checked, adminToo: !!$id('secAdminToo').checked, by: meTabel(), at: new Date().toISOString() };
            const was = secCfg().closed; kvSet(SEC_KEY, c); try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; syncNow && syncReady && syncReady() && syncNow(true); } catch (e) {}
            try { aiLog('Xavfsizlik sozlamasi: yopiq kontur ' + (c.closed ? 'yoqildi' : 'oʻchirildi') + '; himoyalangan: ' + c.secure.join(', ')); } catch (e) {}
            mdlClose('secModal'); secTick(); showToast('🔒 Saqlandi');
            if (was !== c.closed && confirm('Yopiq kontur oʻzgarishi ilova qayta ochilganda kuchga kiradi. Hozir qayta yuklansinmi?')) location.reload();
        }
        (function () {
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(SEC_KEY)) KV_SYNC.keys.push(SEC_KEY); } catch (e) {}
            const c = document.createElement('style'); c.textContent = '#secWm{position:fixed;inset:0;z-index:2147483000;pointer-events:none;display:none;background-repeat:repeat}';
            document.head.appendChild(c);
            // bo'lim/oyna o'zgarganda (class) — himoya holatini yangilash
            let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { secTick(); upd(); }, 60); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
            setInterval(secTick, 30000); // suv belgisidagi vaqt
            const wk = $id('set-theme-sub') && $id('set-theme-sub').closest('.btn-card');
            if (wk && !$id('secCard')) { const d = document.createElement('div'); d.className = 'btn-card'; d.id = 'secCard'; d.onclick = secOpen; d.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🔒</span><span class="btn-text">Xavfsizlik (administrator)<span class="set-sub" id="set-sec3-sub"></span></span></div><span class="btn-arrow">›</span>'; wk.parentNode.appendChild(d); }
            const upd = () => { const s = $id('set-sec3-sub'), c = secCfg(); txtSet(s, (c.closed ? '🟢 Yopiq kontur' : '⚪ Yopiq kontur oʻchiq') + ' · ' + c.secure.length + ' boʻlim himoyada'); const d = $id('secCard'), v = isAdminReal() ? '' : 'none'; if (d && d.style.display !== v) d.style.display = v; };
            upd(); setInterval(upd, 5000);
        })();

