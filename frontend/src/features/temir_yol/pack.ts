
        // =====================================================================
        // v3.0 — 🗺 TEMIR YO'L SXEMASI — ixtiyoriy paket (ilovaga kiritilmagan)
        //  Sxema maxfiy va katta (≈12 MB) — shuning uchun faqat kerak bo'lgan xodim korxona serveridan
        //  (tabel/parol bilan kirgan holda) «Yuklab olish» tugmasi bilan oladi; xohlagan payt o'chiradi.
        //  Paket telefonning ichki xotirasida (IndexedDB) saqlanadi.
        // =====================================================================
        var SXP = { ref: 'pack:sxema', loaded: false, p: null };
        var SXEMA_MSG = "🗺 Temir yoʻl sxemasi bu qurilmaga yuklanmagan. «Parametrlar → 🗺 Temir yoʻl sxemasi» dan yuklab oling (korxona serveri orqali).";
        async function sxPackGet() { try { return await mediaGetBlob(SXP.ref); } catch (e) { return null; } }
        async function sxPackApply(blob) {
            const txt = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text(), j = JSON.parse(txt);
            if (!j || j.kind !== 'agmk-sxema' || !j.yig || !j.yig.master) throw new Error('Bu temir yoʻl sxemasi paketi emas');
            Object.assign(YIG_SVG, j.yig); ND_FIGS.st_sxema = Object.assign(ND_FIGS.st_sxema || {}, j.figs || {}); SXP.loaded = true; return j;
        }
        function sxPackEnsure() { if (SXP.loaded) return Promise.resolve(true); if (!SXP.p) SXP.p = sxPackGet().then(b => b ? sxPackApply(b).then(() => true) : false).catch(e => { console.error(e); SXP.p = null; return false; }); return SXP.p; }
        async function sxPackStore(blob, src) { await sxPackApply(blob); await mediaSave(SXP.ref, blob, { id: SXP.ref, at: new Date().toISOString(), size: blob.size, name: 'temir_yol_sxemasi.agmkpack', src: src }); try { localStorage.setItem('agmk_sxema_info', JSON.stringify({ at: new Date().toISOString(), size: blob.size, src: src })); } catch (e) {} YG.txt = {}; YG.urls = {}; }
        async function sxPackDownload() {
            if (!(typeof srvOn === 'function' && srvOn())) { alert('Sxema korxona serveridan yuklanadi. Avval «📡 Serverga ulanish» orqali ulaning va kiring.'); return; }
            try { showToast('⏳ Temir yoʻl sxemasi yuklanmoqda (≈12 MB)...'); const c = syncCfg(), s = syncGet(SYNC_SES, null);
                let r = await fetch(c.url.replace(/\/+$/, '') + '/api/pack/v1/sxema', { headers: { apikey: c.key, Authorization: 'Bearer ' + (s && s.access) } });
                if (r.status === 401 && await sbRefresh()) { const s2 = syncGet(SYNC_SES, null); r = await fetch(c.url.replace(/\/+$/, '') + '/api/pack/v1/sxema', { headers: { apikey: c.key, Authorization: 'Bearer ' + (s2 && s2.access) } }); }
                if (!r.ok) { let t = ''; try { t = (await r.json()).message || ''; } catch (e) {} if (r.status === 404 && (!t || t === 'Topilmadi')) t = 'Kompyuterdagi server eski versiya — sxemani bermaydi.\n\nNoutbukda yangi serverni (agmk-server 1.3.2) oching: eski papkadagi «data» va «zaxira»ni yangisiga koʻchiring. Boshqaruv paneli tepasida «Versiya 1.3.2» chiqishi kerak.'; throw new Error(t || ('Server ' + r.status)); }
                await sxPackStore(await r.blob(), 'server'); showToast('✅ Temir yoʻl sxemasi yuklandi'); sxPackUi();
            } catch (e) { alert('⚠️ Yuklab boʻlmadi: ' + agmkErrUz(e)); }
        }
        async function sxPackFile(inp) { const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; if (!isAdmin()) { alert('Fayldan faqat administrator yuklaydi.'); return; } try { await sxPackStore(f, 'fayl'); showToast('✅ Sxema fayldan yuklandi'); sxPackUi(); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } }
        async function sxPackDelete() { if (!(await uiConfirm('Temir yoʻl sxemasi bu qurilmadan oʻchirilsinmi? Keyin yana yuklab olish mumkin.'))) return; try { await mediaDelete(SXP.ref); } catch (e) {} try { localStorage.removeItem('agmk_sxema_info'); } catch (e) {} Object.keys(YIG_SVG).forEach(k => delete YIG_SVG[k]); ND_FIGS.st_sxema = {}; SXP.loaded = false; SXP.p = null; YG.txt = {}; YG.urls = {}; showToast('🗑 Sxema oʻchirildi'); sxPackUi(); }
        function sxPackInfo() { try { return JSON.parse(localStorage.getItem('agmk_sxema_info') || 'null'); } catch (e) { return null; } }
        function sxPackOpen() {
            const i = sxPackInfo(), E = escapeHtml;
            mdl('sxPack', `<div class="px-h"><b>🗺 Temir yoʻl sxemasi</b><button class="mini-btn" onclick="mdlClose('sxPack')">✕</button></div>
                <div class="nd-tip">${i ? '✅ Yuklangan: ' + E(fmtDT(i.at)) + ' · ' + (i.size / 1048576).toFixed(1) + ' MB (' + (i.src === 'server' ? 'korxona serveridan' : 'fayldan') + ')' : '⚪ Yuklanmagan. Sxema maxfiy va katta boʻlgani uchun ilovaga kiritilmagan — kerak boʻlsa yuklab oling.'}</div>
                <button class="action-btn" onclick="sxPackDownload()">⬇️ ${i ? 'Qayta yuklab olish' : 'Serverdan yuklab olish'} (≈12 MB)</button>
                ${isAdmin() ? '<label class="action-btn sec" style="display:block;text-align:center;cursor:pointer">📂 Fayldan (.agmkpack) — administrator<input type="file" accept=".agmkpack" style="display:none" onchange="sxPackFile(this)"></label>' : ''}
                ${i ? '<button class="action-btn sec" style="border-color:#ef4444;color:#fca5a5" onclick="sxPackDelete()">🗑 Bu qurilmadan oʻchirish</button>' : ''}`, true);
        }
        function sxPackUi() { const s = $id('set-sxema-sub'); if (s) { const i = sxPackInfo(); s.textContent = i ? 'Yuklangan · ' + (i.size / 1048576).toFixed(1) + ' MB' : 'Yuklanmagan (ixtiyoriy)'; } if ($id('sxPack') && !$id('sxPack').classList.contains('hidden')) sxPackOpen(); }
        (function () {
            // Parametrlar → karta
            const wk = $id('set-theme-sub') && $id('set-theme-sub').closest('.btn-card');
            if (wk && !$id('set-sxema-sub')) { const d = document.createElement('div'); d.className = 'btn-card'; d.onclick = sxPackOpen; d.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🗺</span><span class="btn-text">Temir yoʻl sxemasi<span class="set-sub" id="set-sxema-sub"></span></span></div><span class="btn-arrow">›</span>'; wk.after(d); }
            sxPackUi();
            // yuklangan bo'lsa — fonda tayyorlab qo'yiladi (hujjatlar bo'limidagi sxema rasmlari uchun)
            setTimeout(() => { if (sxPackInfo()) sxPackEnsure(); }, 4000);
        })();

