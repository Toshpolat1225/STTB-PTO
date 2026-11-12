
        // =====================================================================
        // v3.0 — 🖌 DIZAYN: fon rasmlari, logotip, bildirishnoma ovozi (har bir qurilma o'zi uchun)
        //  • Fon: asosiy fon, bosh sahifa yuqori foni, ichki sahifalar yuqori foni, kirish oynasi foni —
        //    o'z rasmingizni tanlab, qoraytirish / xiralashtirish / markazini surib tahrirlaysiz; «Asl holiga» — tiklanadi
        //  • Logotip: yashirish / qaytarish / o'z rasmingiz
        //  • Bildirishnoma ovozi: 4 ta ichki namuna (ilova o'zi yaratadi, fayl emas) yoki o'zingiz yuklagan MP3/OGG/WAV
        // =====================================================================
        var DSG_KEY = 'agmk_design_v1';
        var DSG_BG = [['bgB', 'Asosiy fon (sahifalar orqasi)', '--agmk-bgB'], ['bgH1', 'Bosh sahifa yuqori foni', '--agmk-bgH1'], ['bgH2', 'Ichki sahifalar yuqori foni', '--agmk-bgH2'], ['lock', 'Kirish oynasi foni', null]];
        var DSG = { urls: {}, ed: null };
        function dsgCfg() { try { return Object.assign({ bg: {}, logo: 'on', snd: 'bell', vol: 0.7 }, JSON.parse(localStorage.getItem(DSG_KEY) || '{}') || {}); } catch (e) { return { bg: {}, logo: 'on', snd: 'bell', vol: 0.7 }; } }
        function dsgSet(p) { const c = Object.assign(dsgCfg(), p); try { localStorage.setItem(DSG_KEY, JSON.stringify(c)); } catch (e) {} return c; }
        async function dsgUrl(ref) { if (DSG.urls[ref]) return DSG.urls[ref]; const b = await mediaGetBlob(ref); if (!b) return null; const u = URL.createObjectURL(b); DSG.urls[ref] = u; return u; }
        // Shrift o'lchami: Android ilovada — WebView matn masshtabi (hamma sahifa, oyna, jadvalda matn kattalashadi, joylashuv buzilmaydi);
        // kompyuter brauzerida — sahifa masshtabi.
        var DSG_FS = [[85, 'A− Kichik'], [100, 'A Oddiy'], [115, 'A+ Katta'], [130, 'A++ Juda katta'], [150, 'A+++ Eng katta']];
        function dsgFontApply(v) {
            v = Math.max(80, Math.min(170, +v || 100));
            let nat = false; try { if (window.AgmkNative && typeof AgmkNative.setTextZoom === 'function') { AgmkNative.setTextZoom(v); nat = true; } } catch (e) {}
            if (!nat) { try { // brauzer: butun sahifa masshtabi, eni/bo'yi ekranga moslanadi (o'ngga chiqib ketmaydi)
                const h = document.documentElement, bd = document.body, z = v / 100;
                if (v === 100) { h.style.zoom = ''; h.style.width = ''; h.style.height = ''; bd.style.width = ''; bd.style.height = ''; }
                else { h.style.zoom = String(z); h.style.width = (100 / z) + 'vw'; h.style.height = (100 / z) + 'vh'; bd.style.width = '100%'; bd.style.height = '100%'; }
            } catch (e) {} }
        }
        function dsgFont(v) { dsgSet({ fs: Math.max(80, Math.min(170, +v || 100)) }); dsgFontApply(dsgCfg().fs); try { dsgOpen(); } catch (e) {} showToast('🔠 Shrift: ' + dsgCfg().fs + '%'); }
        async function dsgApply() {
            try { dsgFontApply(dsgCfg().fs || 100); } catch (e) {}
            const c = dsgCfg();
            for (const [k, , v] of DSG_BG) {
                const u = c.bg[k] ? await dsgUrl('design:' + k + ':' + c.bg[k]).catch(() => null) : null;
                if (v) { if (u) document.documentElement.style.setProperty(v, 'url("' + u + '")'); else document.documentElement.style.removeProperty(v); }
                else { const el = document.querySelector('.lock-bg'); if (el) { if (!el.dataset.orig) el.dataset.orig = el.style.backgroundImage; el.style.backgroundImage = u ? 'url("' + u + '")' : el.dataset.orig; } }
            }
            const lg = document.querySelector('#screen-main .app-logo'); if (lg) { const img = lg.querySelector('img'); if (img && !img.dataset.orig) img.dataset.orig = img.src;
                lg.style.display = ''; lg.style.visibility = c.logo === 'off' ? 'hidden' : ''; /* v3.1: joyi saqlanadi — yuqori maydon balandligi o'zgarmaydi */ if (img) { const u = c.logo === 'custom' && c.logoV ? await dsgUrl('design:logo:' + c.logoV).catch(() => null) : null; img.src = u || img.dataset.orig; } }
        }
        // ---------- Oyna ----------
        function dsgOpen() {
            const c = dsgCfg(), E = escapeHtml;
            mdl('dsgModal', `<div class="px-h"><b>🖌 Shrift, fon, logotip va ovoz</b><button class="mini-btn" onclick="mdlClose('dsgModal')">✕</button></div>
                <div class="pp-lbl">SHRIFT OʻLCHAMI (butun ilova)</div>
                <div class="snd-chips">${DSG_FS.map(([v, t]) => `<i class="${(c.fs || 100) === v ? 'on' : ''}" onclick="dsgFont(${v})">${t}</i>`).join('')}</div>
                <div class="sg-tools"><small style="min-width:60px">${c.fs || 100}%</small><input type="range" min="80" max="170" step="5" value="${c.fs || 100}" onchange="dsgFont(+this.value)" style="flex:1"></div>
                <div class="pp-lbl">FON RASMLARI</div>
                ${DSG_BG.map(([k, t]) => `<div class="sg-row"><span style="flex:1">${E(t)}${c.bg[k] ? ' <small style="color:#86efac">· oʻzingizniki</small>' : ''}</span><label class="mini-btn" style="cursor:pointer">🖼 Tanlash<input type="file" accept="image/*" style="display:none" onchange="dsgPick('${k}', this)"></label>${c.bg[k] ? `<button class="mini-btn" onclick="dsgReset('${k}')">↩ Asl</button>` : ''}</div>`).join('')}
                <div class="pp-lbl">BOSH SAHIFA LOGOTIPI</div>
                <div class="snd-chips"><i class="${c.logo === 'on' ? 'on' : ''}" onclick="dsgSet({logo:'on'}); dsgApply(); dsgOpen()">✅ Asl logotip</i><i class="${c.logo === 'off' ? 'on' : ''}" onclick="dsgSet({logo:'off'}); dsgApply(); dsgOpen()">🚫 Olib tashlash</i><label class="${c.logo === 'custom' ? 'on' : ''}" style="cursor:pointer"><i class="${c.logo === 'custom' ? 'on' : ''}">🖼 Oʻz rasmim<input type="file" accept="image/*" style="display:none" onchange="dsgLogo(this)"></i></label></div>
                <div class="pp-lbl">BILDIRISHNOMA OVOZI</div>
                <div class="snd-chips">${[['none', '🔇 Ovozsiz'], ['bell', '🔔 Qoʻngʻiroqcha'], ['chime', '🎐 Chime'], ['ping', '📍 Ping'], ['soft', '🌙 Yumshoq']].map(([k, t]) => `<i class="${c.snd === k ? 'on' : ''}" onclick="dsgSet({snd:'${k}'}); nsPlay(true); dsgOpen()">${t}</i>`).join('')}<i class="${c.snd === 'custom' ? 'on' : ''}" onclick="${c.sndV ? `dsgSet({snd:'custom'}); nsPlay(true); dsgOpen()` : `$id('dsgSnd').click()`}">🎵 ${c.sndName ? E(c.sndName.slice(0, 22)) : 'Oʻz ovozim'}</i></div>
                <label class="action-btn sec" style="display:block;text-align:center;cursor:pointer">🎵 Ovoz faylini yuklash (MP3 / OGG / WAV, 1 MB gacha)<input id="dsgSnd" type="file" accept="audio/*" style="display:none" onchange="dsgSound(this)"></label>
                <div class="sg-tools"><small>Balandlik</small><input type="range" min="0.1" max="1" step="0.1" value="${c.vol}" onchange="dsgSet({vol:+this.value}); nsPlay(true)" style="flex:1"></div>
                <div class="pp-lbl">BOSH SAHIFA YUQORI TUGMALARI</div><div class="nd-tip" style="margin-top:0">Tugmani 3 soniya bosib turing — titraydi, keyin surib xohlagan joyga qoʻying.</div><button class="action-btn sec" onclick="drgReset()">↩ Tugmalar joyini tiklash</button>
                <div class="nd-tip">Bu sozlamalar faqat shu qurilmaga tegishli. Rasm va ovozlar qurilma xotirasida saqlanadi, hech qayerga yuborilmaydi.</div>`, true);
        }
        // Fon rasmi tahrirlagich: qoraytirish, xiralashtirish, markaz (qirqish nuqtasi)
        function dsgPick(k, inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            const im = new Image(); im.onload = () => { DSG.ed = { k: k, im: im, dim: 25, blur: 0, fy: 50 }; dsgEdit(); URL.revokeObjectURL(im.src); }; im.onerror = () => alert('Rasmni ochib boʻlmadi'); im.src = URL.createObjectURL(f);
        }
        function dsgEdit() {
            const D = DSG.ed; if (!D) return;
            mdl('dsgEd', `<div class="px-h"><b>🖼 ${escapeHtml((DSG_BG.find(x => x[0] === D.k) || [])[1] || 'Fon')}</b><button class="mini-btn" onclick="mdlClose('dsgEd')">✕</button></div>
                <canvas id="dsgCv" style="width:100%;border-radius:10px;background:#000"></canvas>
                <div class="sg-tools"><small style="min-width:92px">Qoraytirish</small><input type="range" min="0" max="80" value="${D.dim}" oninput="DSG.ed.dim=+this.value; dsgDraw()" style="flex:1"></div>
                <div class="sg-tools"><small style="min-width:92px">Xiralashtirish</small><input type="range" min="0" max="12" value="${D.blur}" oninput="DSG.ed.blur=+this.value; dsgDraw()" style="flex:1"></div>
                <div class="sg-tools"><small style="min-width:92px">Markaz ↕</small><input type="range" min="0" max="100" value="${D.fy}" oninput="DSG.ed.fy=+this.value; dsgDraw()" style="flex:1"></div>
                <div class="pk-btns"><button onclick="mdlClose('dsgEd')">Bekor</button><button class="pr" onclick="dsgSaveBg()">💾 Qoʻllash</button></div>`, true);
            dsgDraw();
        }
        function dsgRender(W) { // natija: header uchun 16:6, fon uchun — shu qurilma ekrani nisbatida (sifat pasaytirilmaydi)
            const D = DSG.ed, im = D.im, hdr = /^bgH/.test(D.k), ar = Math.max(0.5, Math.min(2.4, (window.innerHeight || 16) / (window.innerWidth || 9))), H = Math.round(W * (hdr ? 6 / 16 : ar));
            const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
            const sc = Math.max(W / im.width, H / im.height), dw = im.width * sc, dh = im.height * sc, dx = (W - dw) / 2, dy = (H - dh) * (D.fy / 100);
            g.filter = D.blur ? 'blur(' + (D.blur * W / 400) + 'px)' : 'none'; g.drawImage(im, dx, dy, dw, dh); g.filter = 'none';
            if (D.dim) { g.fillStyle = 'rgba(0,0,0,' + (D.dim / 100) + ')'; g.fillRect(0, 0, W, H); }
            return c;
        }
        function dsgDraw() { const cv = $id('dsgCv'); if (!cv) return; const r = dsgRender(360); cv.width = r.width; cv.height = r.height; cv.getContext('2d').drawImage(r, 0, 0); cv.style.maxHeight = '50vh'; cv.style.objectFit = 'contain'; }
        async function dsgSaveBg() {
            const D = DSG.ed; if (!D) return; const dpr = Math.max(1, window.devicePixelRatio || 1), scr = Math.round(Math.max(window.innerWidth || 0, (window.screen && screen.width) || 0) * dpr);
            const c = dsgRender(Math.min(3840, Math.max(2560, scr, D.im.naturalWidth || D.im.width))); // v3.1: yuqori aniqlik — ekran va rasm o'lchamidan kichraymaydi
            const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.95)), v = Date.now().toString(36), cfg = dsgCfg();
            if (cfg.bg[D.k]) { try { await mediaDelete('design:' + D.k + ':' + cfg.bg[D.k]); } catch (e) {} }
            await mediaSave('design:' + D.k + ':' + v, blob, { id: 'design:' + D.k + ':' + v, at: new Date().toISOString(), size: blob.size, name: D.k + '.jpg', mime: 'image/jpeg' });
            cfg.bg[D.k] = v; dsgSet({ bg: cfg.bg }); DSG.ed = null; mdlClose('dsgEd'); await dsgApply(); showToast('🖼 Fon oʻrnatildi'); dsgOpen();
        }
        async function dsgReset(k) { const cfg = dsgCfg(); if (cfg.bg[k]) { try { await mediaDelete('design:' + k + ':' + cfg.bg[k]); } catch (e) {} } delete cfg.bg[k]; dsgSet({ bg: cfg.bg }); await dsgApply(); showToast('↩ Asl fon qaytarildi'); dsgOpen(); }
        async function dsgLogo(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); }).catch(() => null); if (!im) { alert('Rasmni ochib boʻlmadi'); return; }
            const Z = Math.min(1024, Math.max(512, im.width, im.height)); const c = document.createElement('canvas'); c.width = c.height = Z; const s = Math.max(Z / im.width, Z / im.height); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, (Z - im.width * s) / 2, (Z - im.height * s) / 2, im.width * s, im.height * s);
            const blob = await new Promise(r => c.toBlob(r, 'image/png')), v = Date.now().toString(36), cfg = dsgCfg();
            if (cfg.logoV) { try { await mediaDelete('design:logo:' + cfg.logoV); } catch (e) {} }
            await mediaSave('design:logo:' + v, blob, { id: 'design:logo:' + v, at: new Date().toISOString(), size: blob.size, name: 'logo.png', mime: 'image/png' });
            dsgSet({ logo: 'custom', logoV: v }); await dsgApply(); showToast('🏷 Logotip oʻrnatildi'); dsgOpen();
        }
        async function dsgSound(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; if (f.size > 1.1e6) { alert('Ovoz fayli 1 MB dan katta — qisqaroq (1–3 soniyali) fayl tanlang.'); return; }
            const v = Date.now().toString(36), cfg = dsgCfg(); if (cfg.sndV) { try { await mediaDelete('design:snd:' + cfg.sndV); } catch (e) {} }
            await mediaSave('design:snd:' + v, f, { id: 'design:snd:' + v, at: new Date().toISOString(), size: f.size, name: f.name, mime: f.type || 'audio/mpeg' });
            dsgSet({ snd: 'custom', sndV: v, sndName: f.name }); nsPlay(true); dsgOpen();
        }
        // ---------- Bildirishnoma ovozi ----------
        var NS = { ctx: null, last: 0 };
        async function nsPlay(test) {
            const c = dsgCfg(); if (c.snd === 'none') return; if (!test && Date.now() - NS.last < 2500) return; NS.last = Date.now();
            try {
                if (c.snd === 'custom' && c.sndV) { const u = await dsgUrl('design:snd:' + c.sndV); if (u) { const a = new Audio(u); a.volume = c.vol; await a.play(); return; } }
                const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; NS.ctx = NS.ctx || new AC(); const ac = NS.ctx; if (ac.state === 'suspended') await ac.resume();
                const P = { bell: [[880, 0, 0.5], [1320, 0.02, 0.35]], chime: [[1046.5, 0, 0.35], [1318.5, 0.16, 0.35], [1568, 0.32, 0.6]], ping: [[1760, 0, 0.18]], soft: [[523.3, 0, 0.45], [659.3, 0.22, 0.6]] }[c.snd] || [[880, 0, 0.4]];
                const t0 = ac.currentTime + 0.02;
                P.forEach(([f, st, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = c.snd === 'soft' ? 'triangle' : 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + st); g.gain.exponentialRampToValueAtTime(0.35 * c.vol, t0 + st + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + st + d); o.connect(g).connect(ac.destination); o.start(t0 + st); o.stop(t0 + st + d + 0.05); });
            } catch (e) {}
        }
        (function () {
            const wk = $id('set-theme-sub') && $id('set-theme-sub').closest('.btn-card');
            if (wk && !$id('set-dsg-sub')) { const d = document.createElement('div'); d.className = 'btn-card'; d.onclick = dsgOpen; d.innerHTML = '<div class="btn-card-content"><span class="btn-icon">🖌</span><span class="btn-text">Shrift oʻlchami, fon, logotip, ovoz<span class="set-sub" id="set-dsg-sub">Matn kattaligi, oʻz rasmingiz va ovozingiz</span></span></div><span class="btn-arrow">›</span>'; wk.after(d); }
            setTimeout(() => dsgApply().catch(() => {}), 300);
        })();

