        // =====================================================================
        // v3.11.0
        //  1) Xato xabarlari — doim oʻzbek tilida (brauzer/tizimning inglizcha matnlari tarjima qilinadi)
        //  2) Jonli xarita: «Server ulanmagan» eslatmasini ✕ bilan yopish — xarita boʻshagan joyni egallaydi
        //  3) Bosh sahifa pastki foni — yangi rasm (Parametrlar → Fon dan alohida almashtiriladi)
        //  4) Rasm kesish oynasi (Telegram uslubida): barcha fonlar, logotip va menyu ikonkalari
        //     Menyu ikonkasini 3 soniya bosib turing → rasm tanlang → kerakli qismini kesing
        //  5) Yuqori tugmalar 3 soniya bosilgach — AI tugmasi kabi butun ekran boʻylab erkin suriladi
        //  6) Dizayn namunasi: administrator tayyorlaydi → hammaga (server yoki fayl orqali) → «Namunaga qaytarish»
        //  7) Qatlamlar: ilova standarti ← administrator namunasi ← xodimning oʻz oʻzgarishlari
        //     (xodimning oʻzi oʻzgartirgani yangilanishda saqlanadi, tegmagan joylari namunadan oladi)
        // =====================================================================

        // ---------------------------------------------------------------- 1) XATOLAR — OʻZBEKCHA
        var ERRUZ = [
            [/signal is aborted|aborted without reason|the user aborted|operation was aborted|aborterror|request aborted|\babort(ed)?\b.*\b(request|signal|fetch)\b|timed? ?out|timeout/i,
                "server javob bermadi (kutish vaqti tugadi). Korxona Wi-Fi tarmogʻiga ulanganingizni tekshirib, qayta urinib koʻring."],
            [/failed to fetch|networkerror|network ?error|load failed|network request failed|err_(internet|network|connection|name|address)|net::|could not connect|connection (refused|reset|closed)|econn/i,
                "serverga ulanib boʻlmadi. Internet yoki korxona Wi-Fi tarmogʻini tekshiring."],
            [/quota ?exceeded|quotaexceedederror|exceeded the quota|storage.*full|disk.*full/i,
                "telefon xotirasi toʻlgan. Keraksiz rasm va fayllarni oʻchirib, qayta urinib koʻring."],
            [/^server 401\b|unauthori[sz]ed|jwt expired|invalid (jwt|token)|token (is )?expired/i, "kirish muddati tugagan. Ilovadan chiqib, qayta kiring."],
            [/^server 403\b|forbidden|permission denied for/i, "bu amal uchun huquqingiz yoʻq."],
            [/^server 404\b|not found$/i, "serverda topilmadi (server eski versiya boʻlishi mumkin)."],
            [/^server 413\b|payload too large|entity too large|request too large/i, "fayl juda katta — server qabul qilmadi. Kichikroq fayl yuboring."],
            [/^server 429\b|too many requests|rate limit/i, "juda koʻp soʻrov yuborildi. Biroz kutib, qayta urinib koʻring."],
            [/^server 5\d\d\b|internal server error|bad gateway|service unavailable|gateway time/i, "serverda xato yuz berdi. Birozdan keyin qayta urinib koʻring."],
            [/unexpected token|unexpected end of json|json\.parse|is not valid json|syntaxerror: json/i, "serverdan notoʻgʻri javob keldi. Qayta urinib koʻring."],
            [/notallowederror|permission (was )?denied|not allowed by the user agent|denied permission/i, "ruxsat berilmagan (mikrofon, kamera yoki joylashuv). Telefon sozlamalaridan ilovaga ruxsat bering."],
            [/notfounderror|requested device not found|no (audio|video) ?input/i, "kerakli qurilma topilmadi (mikrofon yoki kamera)."],
            [/notreadableerror|could not start (audio|video) source|device in use/i, "qurilma band — boshqa ilova ishlatayapti. Uni yopib, qayta urinib koʻring."],
            [/notsupportederror|not supported/i, "bu telefon ushbu imkoniyatni qoʻllab-quvvatlamaydi."],
            [/securityerror|insecure|mixed content/i, "xavfsizlik cheklovi tufayli bajarilmadi."],
            [/invalidstateerror|invalid state/i, "amalni hozir bajarib boʻlmaydi. Qayta urinib koʻring."],
            [/encodingerror|decod(e|ing) (error|failed)|unable to decode|image.*(corrupt|broken)/i, "faylni ochib boʻlmadi — fayl shikastlangan yoki formati notoʻgʻri."],
            [/out of memory|allocation failed|maximum call stack/i, "telefonda tezkor xotira yetmadi. Ilovani yopib, qayta oching."],
            [/(cannot|can't) read propert|is not a function|is not defined|undefined is not|null is not|typeerror|referenceerror|rangeerror/i, "ilovada ichki xato yuz berdi."]
        ];
        // Inglizcha xato matnimi? (oʻzbekcha lotin matnini adashtirmaslik uchun — inglizcha soʻzlar boʻyicha)
        var ERRUZ_EN = /\b(the|is|was|not|failed|failure|error|invalid|cannot|could|unable|unexpected|denied|without|reason|request|response|network|undefined|null|object|property|function|expected|exceeded|unknown|missing|refused|aborted)\b/i;
        function errUzText(m) {
            m = String(m == null ? '' : m).trim(); if (!m) return 'Nomaʼlum xato yuz berdi.';
            for (const [re, uz] of ERRUZ) if (re.test(m)) { const t = uz.charAt(0).toUpperCase() + uz.slice(1); return t; }
            // «Server 4xx: oʻzbekcha izoh» — server bergan izoh qoladi
            const sm = /^Server (\d{3})(?::\s*(.*))?$/.exec(m); if (sm) return (sm[2] && !ERRUZ_EN.test(sm[2]) ? sm[2] : 'Server xatosi') + ' (kod ' + sm[1] + ')';
            const en = (m.match(new RegExp(ERRUZ_EN.source, 'gi')) || []).length;
            if (en >= 2 || (/^[\x20-\x7e]+$/.test(m) && en >= 1 && !/[ʻʼ‘’'](?=[a-z])/i.test(m) && /\b(error|failed|invalid|cannot|unable|unexpected|denied|undefined)\b/i.test(m)))
                return 'Kutilmagan xato yuz berdi. (Texnik maʼlumot: ' + m.slice(0, 140) + ')';
            return m;
        }
        function agmkErrUz(e) {
            if (e && typeof e === 'object') { if (e.name === 'AbortError' || e.name === 'TimeoutError') return errUzText('timeout'); if (e.name === 'QuotaExceededError') return errUzText('quota exceeded'); }
            return errUzText(e && e.message !== undefined ? e.message : e);
        }
        // Matn ichidagi inglizcha boʻlakni tarjima qilish: «⚠️ Yuborilmadi: signal is aborted…» → «⚠️ Yuborilmadi: server javob bermadi…»
        function uzMsg(s) {
            if (typeof s !== 'string' || !s || !/[a-z]{3}/i.test(s)) return s;
            try {
                const hit = tail => !!tail.trim() && (/^Server \d{3}\b/.test(tail) || (ERRUZ.some(([re]) => re.test(tail)) && (ERRUZ_EN.test(tail) || /error|abort|fetch|quota|json|timeout/i.test(tail))) || (tail.match(new RegExp(ERRUZ_EN.source, 'gi')) || []).length >= 2);
                return s.split('\n').map(line => {
                    // birinchi «: » dan boshlab — inglizcha qism qayerdan boshlansa, oʻsha yerdan tarjima
                    const cuts = [0]; let i = -1; while ((i = line.indexOf(': ', i + 1)) >= 0) cuts.push(i + 2);
                    for (const c of cuts) { const head = line.slice(0, c), tail = line.slice(c); if (c === 0 && cuts.length > 1) continue; if (!hit(tail)) continue;
                        const t = errUzText(tail); return head ? head + (t.charAt(0).toLowerCase() + t.slice(1)) : t; }
                    return line;
                }).join('\n');
            } catch (e) { return s; }
        }
        (function () {
            // barcha oynalar (alert / tasdiq / soʻrov), qisqa xabarchalar va AI javobi — oxirgi himoya
            if (typeof uidPush === 'function') uidPush = agmkExtend('uidPush', 'v3.11: xatolar oʻzbekcha', uidPush, o => function (type, msg, def) { return o.call(this, type, typeof msg === 'string' ? uzMsg(msg) : msg, def); });
            if (typeof showToast === 'function') showToast = agmkExtend('showToast', 'v3.11: xatolar oʻzbekcha', showToast, o => function (msg) { const a = Array.from(arguments); if (typeof a[0] === 'string') a[0] = uzMsg(a[0]); return o.apply(this, a); });
            if (typeof aifSay === 'function') aifSay = agmkExtend('aifSay', 'v3.11: xatolar oʻzbekcha', aifSay, o => function (t) { const a = Array.from(arguments); if (typeof a[0] === 'string') a[0] = uzMsg(a[0]); return o.apply(this, a); });
            // Server soʻrovlari: inglizcha xato oʻrniga — oʻzbekcha; imzoga yuboriladigan katta hujjatlarga koʻproq vaqt
            if (typeof sbFetch === 'function') sbFetch = agmkExtend('sbFetch', 'v3.11: oʻzbekcha xato, imzo uchun 60 s', sbFetch, o => async function (path, opt) {
                opt = opt || {};
                if (!opt.timeout && /^\/api\/(sign|sig|files|mt|zam|pack)\//.test(String(path || '')) && /^(POST|PUT)$/i.test(opt.method || 'GET')) opt = Object.assign({}, opt, { timeout: 60000 });
                try { return await o.call(this, path, opt); }
                catch (e) { if (e && (e.name === 'AbortError' || ERRUZ.some(([re]) => re.test(String(e.message || ''))) && ERRUZ_EN.test(String(e.message || '')))) { const x = new Error(agmkErrUz(e)); x.net = true; x.orig = e; throw x; } throw e; }
            });
            if (typeof srvRaw === 'function') { const _sr = srvRaw; window.srvRaw = srvRaw = async function () { try { return await _sr.apply(this, arguments); } catch (e) { if (e && (e.name === 'AbortError' || /failed to fetch|networkerror|load failed/i.test(e.message || ''))) { const x = new Error(agmkErrUz(e)); x.net = true; throw x; } throw e; } }; }
        })();

        // ---------------------------------------------------------------- 2) JONLI XARITA — eslatmani yopish
        var LVOFF_KEY = 'agmk_lv_note_hide';
        function lvNoteHidden() { try { return JSON.parse(localStorage.getItem(LVOFF_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function lvNoteFix() {
            const n = document.querySelector('.lv-wrap > .lv-off'); const map = $id('lvMap'); if (!n || !map) return;
            const st = n.classList.contains('ok') ? 'ok' : 'off', H = lvNoteHidden();
            const grow = px => { map.style.height = 'calc(52vh + ' + Math.round(px) + 'px)'; setTimeout(() => { try { LV.map && LV.map.invalidateSize(); } catch (e) {} }, 60); };
            if (H[st]) { const h = H[st].h || 46; n.remove(); grow(h); return; }
            if (n.querySelector('.lv-x')) return;
            n.style.position = 'relative'; n.style.paddingRight = '38px';
            const x = document.createElement('button'); x.type = 'button'; x.className = 'lv-x'; x.textContent = '✕'; x.title = 'Yopish';
            x.onclick = e => { e.stopPropagation(); const h = n.getBoundingClientRect().height + 8; const o = lvNoteHidden(); o[st] = { at: Date.now(), h: h }; delete o[st === 'ok' ? 'off' : 'ok']; try { localStorage.setItem(LVOFF_KEY, JSON.stringify(o)); } catch (z) {} n.remove(); grow(h); };
            n.appendChild(x);
        }
        if (typeof lvRender === 'function') lvRender = agmkExtend('lvRender', 'v3.11: eslatmani yopish', lvRender, o => function () { const r = o.apply(this, arguments); try { lvNoteFix(); } catch (e) {} return r; });
        (function () { const c = document.createElement('style'); c.textContent = '.lv-x{position:absolute;right:6px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.25);color:#fff;font:700 14px/26px system-ui;padding:0;cursor:pointer}'; document.head.appendChild(c); })();

        // ---------------------------------------------------------------- 3) BOSH SAHIFA PASTKI FONI
        (function () {
            try { if (typeof DSG_BG !== 'undefined' && !DSG_BG.some(x => x[0] === 'bgM')) DSG_BG.splice(1, 0, ['bgM', 'Bosh sahifa pastki foni', '--agmk-bgM']); } catch (e) {}
            // bosh sahifa kartochkalari orqasi — oʻz oʻzgaruvchisi --agmk-bgM (boshqa sahifalarga taʼsir qilmaydi; standart rasm — <head> dagi :root da)
            setTimeout(() => { try { dsgApply(); } catch (e) {} }, 400);
        })();

        // ---------------------------------------------------------------- 4) RASM KESISH OYNASI (Telegram uslubida)
        //  cropOpen(fayl, { aspect: eni/boʻyi, outW: natija eni (px), round: doira ramka, title }) → Promise<canvas | null>
        //  Ramka qotib turadi; rasm ostida: 1 barmoq — surish, 2 barmoq — yaqinlashtirish/uzoqlashtirish (kompyuterda — gʻildirak).
        //  Rasm ramkadan chiqib ketmaydi (boʻsh joy qolmaydi). ⟲ — 90° burish, ⇋ — koʻzgu.
        var CROP = null;
        async function cropLoad(src) {
            let blob = src;
            if (src instanceof Blob) { try { if (typeof looksHeic === 'function' && await looksHeic(src) && typeof convertHeic === 'function') blob = await convertHeic(src); } catch (e) {} }
            return await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Rasmni ochib boʻlmadi — fayl shikastlangan yoki rasm emas.')); i.src = blob instanceof Blob ? URL.createObjectURL(blob) : String(blob); });
        }
        function cropOpen(src, opt) {
            opt = Object.assign({ aspect: 1, outW: 1080, round: false, title: 'Rasmni joylashtiring' }, opt || {});
            return new Promise(async resolve => {
                let im; try { im = await cropLoad(src); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); resolve(null); return; }
                const ov = document.createElement('div'); ov.id = 'cropOv'; ov.className = 'crop-ov';
                ov.innerHTML = `<div class="crop-top"><button class="crop-b" data-a="x" title="Bekor">✕</button><b>${escapeHtml(opt.title)}</b><span class="crop-hint">surib · ikki barmoq bilan kattalashtiring</span></div>
                    <div class="crop-st"><canvas></canvas></div>
                    <div class="crop-bot"><div class="crop-z"><span>－</span><input type="range" min="0" max="1000" value="0"><span>＋</span><small>100%</small></div>
                    <div class="crop-tools"><button class="crop-b" data-a="rot" title="90° burish">⟲</button><button class="crop-b" data-a="flip" title="Koʻzgu">⇋</button><button class="crop-b" data-a="fit" title="Asl holiga">↺</button><span style="flex:1"></span><button class="crop-ok" data-a="ok" title="Tayyor">✓</button></div></div>`;
                document.body.appendChild(ov);
                const stEl = ov.querySelector('.crop-st'), cv = stEl.querySelector('canvas'), g = cv.getContext('2d'), zr = ov.querySelector('input[type=range]'), zl = ov.querySelector('.crop-z small');
                const S = CROP = { im: im, rot: 0, flip: false, s: 1, cx: 0, cy: 0, f: null, min: 1, P: new Map(), pin: null, opt: opt };
                const iw = () => (S.rot % 180 ? im.height : im.width), ih = () => (S.rot % 180 ? im.width : im.height);
                function layout() {
                    const W = stEl.clientWidth, H = stEl.clientHeight, d = Math.min(2, window.devicePixelRatio || 1);
                    cv.width = Math.round(W * d); cv.height = Math.round(H * d); cv.style.width = W + 'px'; cv.style.height = H + 'px'; g.setTransform(d, 0, 0, d, 0, 0);
                    const m = 22, a = opt.aspect; let fw = W - 2 * m, fh = fw / a; if (fh > H - 2 * m) { fh = H - 2 * m; fw = fh * a; }
                    const old = S.f; S.f = { x: (W - fw) / 2, y: (H - fh) / 2, w: fw, h: fh };
                    S.min = Math.max(fw / iw(), fh / ih());
                    if (!old) { S.s = S.min; S.cx = W / 2; S.cy = H / 2; } else { const k = fw / old.w; S.s *= k; S.cx = S.f.x + (S.cx - old.x) * k; S.cy = S.f.y + (S.cy - old.y) * k; }
                    clamp(); draw();
                }
                function clamp() {
                    S.s = Math.max(S.min, Math.min(S.min * 10, S.s));
                    const hw = iw() * S.s / 2, hh = ih() * S.s / 2, f = S.f;
                    S.cx = Math.min(f.x + hw, Math.max(f.x + f.w - hw, S.cx)); S.cy = Math.min(f.y + hh, Math.max(f.y + f.h - hh, S.cy));
                    zr.value = Math.round(Math.log(S.s / S.min) / Math.log(10) * 1000); zl.textContent = Math.round(S.s / S.min * 100) + '%';
                }
                function paint(ctx, s, cx, cy) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(S.rot * Math.PI / 180); ctx.scale(S.flip ? -1 : 1, 1); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, -im.width * s / 2, -im.height * s / 2, im.width * s, im.height * s); ctx.restore(); }
                function draw() {
                    const W = stEl.clientWidth, H = stEl.clientHeight, f = S.f; g.clearRect(0, 0, W, H); paint(g, S.s, S.cx, S.cy);
                    g.save(); g.fillStyle = 'rgba(0,0,0,.62)'; g.beginPath(); g.rect(0, 0, W, H);
                    if (opt.round) { g.moveTo(f.x + f.w, f.y + f.h / 2); g.ellipse(f.x + f.w / 2, f.y + f.h / 2, f.w / 2, f.h / 2, 0, 0, Math.PI * 2); } else if (opt.radius && g.roundRect) g.roundRect(f.x, f.y, f.w, f.h, opt.radius); else g.rect(f.x, f.y, f.w, f.h);
                    g.fill('evenodd'); g.restore();
                    g.save(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 2; g.beginPath(); if (opt.round) g.ellipse(f.x + f.w / 2, f.y + f.h / 2, f.w / 2, f.h / 2, 0, 0, Math.PI * 2); else if (opt.radius && g.roundRect) g.roundRect(f.x, f.y, f.w, f.h, opt.radius); else g.rect(f.x, f.y, f.w, f.h); g.stroke();
                    if (S.P.size) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 1; i < 3; i++) { g.moveTo(f.x + f.w * i / 3, f.y); g.lineTo(f.x + f.w * i / 3, f.y + f.h); g.moveTo(f.x, f.y + f.h * i / 3); g.lineTo(f.x + f.w, f.y + f.h * i / 3); } g.stroke(); }
                    g.restore();
                }
                function zoomAt(ns, px, py) { const k = Math.max(S.min, Math.min(S.min * 10, ns)) / S.s; S.cx = px + (S.cx - px) * k; S.cy = py + (S.cy - py) * k; S.s *= k; clamp(); draw(); }
                const pt = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
                cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch (x) {} S.P.set(e.pointerId, pt(e)); S.pin = null; draw(); });
                cv.addEventListener('pointermove', e => {
                    if (!S.P.has(e.pointerId)) return; const p = pt(e), prev = S.P.get(e.pointerId); S.P.set(e.pointerId, p);
                    if (S.P.size === 1) { S.cx += p.x - prev.x; S.cy += p.y - prev.y; clamp(); draw(); return; }
                    const [a, b] = Array.from(S.P.values()), d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                    if (S.pin) { S.cx += mx - S.pin.mx; S.cy += my - S.pin.my; zoomAt(S.s * d / Math.max(1, S.pin.d), mx, my); }
                    S.pin = { d: d, mx: mx, my: my };
                });
                const up = e => { S.P.delete(e.pointerId); S.pin = null; draw(); };
                cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
                cv.addEventListener('wheel', e => { e.preventDefault(); const p = pt(e); zoomAt(S.s * Math.exp(-e.deltaY / 400), p.x, p.y); }, { passive: false });
                cv.addEventListener('dblclick', e => { const p = pt(e); zoomAt(S.s > S.min * 1.05 ? S.min : S.min * 2, p.x, p.y); });
                zr.addEventListener('input', () => { const f = S.f; if (!f) return; zoomAt(S.min * Math.pow(10, +zr.value / 1000), f.x + f.w / 2, f.y + f.h / 2); });
                const done = res => { window.removeEventListener('resize', layout); CROP = null; ov.remove(); try { URL.revokeObjectURL(im.src); } catch (e) {} resolve(res); };
                ov.addEventListener('click', e => {
                    const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a; if (k !== 'x' && !S.f) return; // 3.16.2: oyna joylashmasdan bosilsa — xato chiqmasin
                    if (k === 'x') done(null);
                    else if (k === 'rot') { S.rot = (S.rot + 270) % 360; S.min = Math.max(S.f.w / iw(), S.f.h / ih()); S.s = Math.max(S.s, S.min); clamp(); draw(); }
                    else if (k === 'flip') { S.flip = !S.flip; draw(); }
                    else if (k === 'fit') { S.rot = 0; S.flip = false; S.min = Math.max(S.f.w / iw(), S.f.h / ih()); S.s = S.min; S.cx = S.f.x + S.f.w / 2; S.cy = S.f.y + S.f.h / 2; clamp(); draw(); }
                    else if (k === 'ok') {
                        const f = S.f, src = f.w / S.s; // ramka ichidagi asl piksellar soni — keraksiz kattalashtirilmaydi
                        const ow = Math.round(Math.min(opt.outW, Math.max(Math.min(opt.outW, 256), src))), oh = Math.max(1, Math.round(ow / opt.aspect)), k2 = ow / f.w;
                        const out = document.createElement('canvas'); out.width = ow; out.height = oh; const o = out.getContext('2d');
                        if (opt.bg) { o.fillStyle = opt.bg; o.fillRect(0, 0, ow, oh); }
                        o.setTransform(k2, 0, 0, k2, -f.x * k2, -f.y * k2); paint(o, S.s, S.cx, S.cy); done(out);
                    }
                });
                window.addEventListener('resize', layout);
                requestAnimationFrame(layout);
            });
        }
        function cropBlob(cv, mime, q) { return new Promise(r => cv.toBlob(r, mime || 'image/jpeg', q || 0.9)); }
        function cropScreenAspect() { return Math.max(0.42, Math.min(2.4, (window.innerWidth || 9) / (window.innerHeight || 16))); }
        function cropOutW(aspect, base) { const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1)); const w = Math.round((window.innerWidth || 400) * dpr); return Math.min(base || 1600, Math.max(720, aspect >= 1 ? Math.round(w * 1.2) : w)); }
        (function () {
            const c = document.createElement('style');
            c.textContent = `.crop-ov{position:fixed;inset:0;z-index:2147483646;background:#000;display:flex;flex-direction:column;color:#fff;font-family:system-ui;touch-action:none;user-select:none}
                .crop-top{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 8px}.crop-top b{font-size:16px}.crop-hint{margin-left:auto;font-size:11.5px;color:#94a3b8}
                .crop-st{flex:1;position:relative;overflow:hidden}.crop-st canvas{position:absolute;inset:0;touch-action:none;cursor:grab}
                .crop-bot{padding:10px 14px calc(env(safe-area-inset-bottom,0px) + 14px)}.crop-z{display:flex;align-items:center;gap:10px;color:#cbd5e1}.crop-z input{flex:1;accent-color:#fff}.crop-z small{min-width:44px;text-align:right}
                .crop-tools{display:flex;align-items:center;gap:10px;margin-top:12px}.crop-b{width:46px;height:46px;border-radius:50%;border:none;background:rgba(255,255,255,.12);color:#fff;font:600 21px/46px system-ui;padding:0;cursor:pointer}
                .crop-ok{width:58px;height:58px;border-radius:50%;border:none;background:#3390ec;color:#fff;font:700 27px/58px system-ui;padding:0;cursor:pointer;box-shadow:0 4px 14px rgba(51,144,236,.5)}`;
            document.head.appendChild(c);
        })();

        // ---- 4a) Fon rasmlari (Parametrlar → Fon): avval kesish, keyin qoraytirish / xiralashtirish
        if (typeof dsgPick === 'function') dsgPick = agmkExtend('dsgPick', 'v3.11: rasm kesish oynasi', dsgPick, o => async function (k, inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            const hdr = /^bgH/.test(k), a = hdr ? 16 / 6 : cropScreenAspect(); const t = ((DSG_BG.find(x => x[0] === k) || [])[1]) || 'Fon';
            const cv = await cropOpen(f, { aspect: a, outW: hdr ? 2000 : cropOutW(a, 1800), title: t }); if (!cv) return;
            const im = await cropLoad(await cropBlob(cv, 'image/jpeg', 0.93));
            DSG.ed = { k: k, im: im, dim: 0, blur: 0, fy: 50, cropped: true }; dsgEdit();
        });
        if (typeof dsgEdit === 'function') dsgEdit = agmkExtend('dsgEdit', 'v3.11: kesilgan rasmda «Markaz» kerak emas', dsgEdit, o => function () { const r = o.apply(this, arguments); try { if (DSG.ed && DSG.ed.cropped) { const m = $id('dsgEd'); m && m.querySelectorAll('.sg-tools').forEach(x => { if (/Markaz/.test(x.textContent)) x.remove(); }); } } catch (e) {} return r; });
        // ---- 4b) Logotip — doira ramka
        if (typeof dsgLogo === 'function') dsgLogo = agmkExtend('dsgLogo', 'v3.11: logotipni kesish', dsgLogo, o => async function (inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            const cv = await cropOpen(f, { aspect: 1, outW: 512, round: true, title: 'Logotip' }); if (!cv) return;
            const blob = await cropBlob(cv, 'image/png'), v = Date.now().toString(36), cfg = dsgCfg();
            if (cfg.logoV) { try { await mediaDelete('design:logo:' + cfg.logoV); } catch (e) {} }
            await mediaSave('design:logo:' + v, blob, { id: 'design:logo:' + v, at: new Date().toISOString(), size: blob.size, name: 'logo.png', mime: 'image/png' });
            dsgSet({ logo: 'custom', logoV: v }); await dsgApply(); showToast('🏷 Logotip oʻrnatildi'); dsgOpen();
        });
        // ---- 4c) Har sahifaning ⚙️ sozlamasidagi yuqori / pastki fon — oʻsha joyning shaklida ramka
        if (typeof uiSetImg === 'function') uiSetImg = agmkExtend('uiSetImg', 'v3.11: rasm kesish oynasi', uiSetImg, o => async function (k, inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f || !UI.edit) return; const ed = UI.edit;
            try {
                const s = uiScr(), p = s ? uiParts(s) : {}, el = k === 'hi' ? p.head : p.body;
                let a = el && el.clientWidth && el.clientHeight ? el.clientWidth / el.clientHeight : (k === 'hi' ? 16 / 6 : cropScreenAspect()); a = Math.max(0.35, Math.min(6, a));
                const cv = await cropOpen(f, { aspect: a, outW: k === 'hi' ? 1800 : cropOutW(a, 1600), title: k === 'hi' ? 'Yuqori fon (sarlavha)' : 'Pastki fon (sahifa orqasi)' }); if (!cv) return;
                const blob = await cropBlob(cv, 'image/jpeg', 0.88), ref = 'uibg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
                await mediaSave(ref, blob, { id: ref, at: new Date().toISOString(), size: blob.size, name: (f.name || 'fon') + '.jpg', mime: 'image/jpeg', ui: true }); try { mediaKeep(ref); } catch (e) {}
                UI.edit = ed; uiPut(P => { P[k] = ref; }); try { uiApply(); } catch (e) {} uiSetOpen(ed.t, ed.key); showToast('🖼 Fon rasmi qoʻyildi');
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        });

        // ---- 4d) Menyu ikonkalari: ikonkani 3 soniya bosib turish → rasm tanlash → kesish
        var ICN_KEY = 'agmk_icons_v1', ICN = { url: {}, orig: new WeakMap(), lp: null, eat: 0, cur: null };
        function icMap() { try { return JSON.parse(localStorage.getItem(ICN_KEY) || '{}') || {}; } catch (e) { return {}; } }
        function icMapSet(m) { try { localStorage.setItem(ICN_KEY, JSON.stringify(m)); } catch (e) { alert('⚠️ Telefon xotirasi toʻlgan — ikonka saqlanmadi.'); } }
        function icHash(s) { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
        function icKey(c) {
            if (!c) return ''; let k = ''; try { k = typeof mkKey === 'function' ? mkKey(c) || '' : ''; } catch (e) {}
            if (k) return 'mk:' + k; if (c.dataset.mn) return 'mn:' + c.dataset.mn; const s = c.getAttribute('data-sec'); if (s) return 'sec:' + s; if (c.id) return 'id:' + c.id;
            const t = (c.getAttribute('onclick') || '') || ((c.querySelector('.btn-text') || c).textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60); return t ? 'h:' + icHash(t) : '';
        }
        async function icUrl(ref) { if (ICN.url[ref]) return ICN.url[ref]; try { const b = await mediaGetBlob(ref); if (b) return (ICN.url[ref] = URL.createObjectURL(b)); } catch (e) {} return ''; }
        async function icApply(root) {
            const M = icMap(), R = root || document.querySelector('.screen.active') || document; if (!R) return;
            for (const c of R.querySelectorAll('.btn-card')) {
                const ic = c.querySelector('.btn-icon'); if (!ic) continue; const k = icKey(c), ref = k && M[k];
                if (ref) {
                    if (ic.querySelector('img[data-icr="' + ref + '"]')) continue; const u = await icUrl(ref); if (!u) continue;
                    if (!ICN.orig.has(ic)) ICN.orig.set(ic, { h: ic.innerHTML, mk: ic.classList.contains('mk-ic') });
                    ic.classList.add('mk-ic', 'ic-own'); ic.innerHTML = '<img src="' + u + '" alt="" data-icr="' + ref + '">';
                } else if (ic.classList.contains('ic-own')) {
                    const o = ICN.orig.get(ic); ic.classList.remove('ic-own'); if (o) { ic.innerHTML = o.h; if (!o.mk) ic.classList.remove('mk-ic'); ICN.orig.delete(ic); }
                    delete ic.dataset.mk; try { if (typeof mkDecorate === 'function') mkDecorate(c.parentNode || document); } catch (e) {}
                }
            }
        }
        (function () {
            let t = 0; const run = () => { t = 0; icApply().catch(() => {}); };
            try { new MutationObserver(ms => { if (t) return; if (ms.every(m => m.target && m.target.closest && (m.target.closest('.leaflet-container') || m.target.closest('.modal-overlay') || m.target.closest('.crop-ov')))) return; t = setTimeout(run, 90); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
            setTimeout(run, 1500);
            if (typeof openScreen === 'function') openScreen = agmkExtend('openScreen', 'v3.11: oʻz ikonkalari', openScreen, o => function () { const r = o.apply(this, arguments); setTimeout(run, 40); return r; });
            // 3 soniya bosib turish (faqat ikonka ustida — kartochkaning qolgan qismi avvalgidek: kartochka sozlamasi)
            const cancel = () => { if (ICN.lp) { clearTimeout(ICN.lp.t); clearTimeout(ICN.lp.t2); ICN.lp.ic.classList.remove('ic-lp-wait'); } ICN.lp = null; };
            window.addEventListener('pointerdown', e => {
                cancel(); const ic = e.target.closest && e.target.closest('.btn-card .btn-icon'); if (!ic) return; const c = ic.closest('.btn-card');
                if (!c || !c.closest('.screen.active') || c.closest('.modal-overlay') || document.body.classList.contains('locked')) return;
                e.stopPropagation(); // kartochka sozlamasining 3 soniyalik bosishi ishga tushmasin
                ICN.lp = { ic: ic, c: c, x: e.clientX, y: e.clientY, t2: setTimeout(() => ic.classList.add('ic-lp-wait'), 700), t: setTimeout(() => { const L = ICN.lp; ICN.lp = null; if (!L) return; ic.classList.remove('ic-lp-wait'); ICN.eat = Date.now(); try { if (window.AgmkNative && AgmkNative.vibrate) AgmkNative.vibrate(60); else if (navigator.vibrate) navigator.vibrate(60); } catch (x) {} icSheet(c); }, 3000) };
            }, true);
            window.addEventListener('pointermove', e => { const L = ICN.lp; if (L && (Math.abs(e.clientX - L.x) > 12 || Math.abs(e.clientY - L.y) > 12)) cancel(); }, true);
            ['pointerup', 'pointercancel'].forEach(n => window.addEventListener(n, cancel, true)); document.addEventListener('scroll', cancel, true);
            window.addEventListener('click', e => { if (ICN.eat && Date.now() - ICN.eat < 1500) { ICN.eat = 0; e.stopPropagation(); e.preventDefault(); } }, true);
            window.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('.btn-card .btn-icon')) e.preventDefault(); }, true);
            const st = document.createElement('style'); st.textContent = '.btn-card .btn-icon{-webkit-touch-callout:none;user-select:none}.ic-lp-wait{transition:transform 2.3s ease;transform:scale(.82)}.btn-icon.ic-own img{width:100%;height:100%;object-fit:cover;display:block}.ic-prev{width:84px;height:84px;border-radius:18px;overflow:hidden;margin:6px auto 12px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;box-shadow:0 4px 16px rgba(0,0,0,.4)}.ic-prev img{width:100%;height:100%;object-fit:cover}'; document.head.appendChild(st);
        })();
        function icSheet(c) {
            const k = icKey(c); if (!k) return; ICN.cur = { k: k, c: c }; const M = icMap(), ic = c.querySelector('.btn-icon'), tx = c.querySelector('.btn-text') || c, nm = (Array.from(tx.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').trim() || (tx.textContent || '').trim()).replace(/\s+/g, ' ').slice(0, 40);
            mdl('icSheet', `<div class="px-h"><b>🖼 Ikonka — ${escapeHtml(nm)}</b><button class="mini-btn" onclick="mdlClose('icSheet')">✕</button></div>
                <div class="ic-prev">${ic ? ic.innerHTML : ''}</div>
                <label class="action-btn" style="display:block;text-align:center;cursor:pointer">📷 Galereyadan rasm tanlash<input type="file" accept="image/*" style="display:none" onchange="icPick(this)"></label>
                ${M[k] ? `<button class="action-btn sec" onclick="icReset()">↺ Asl ikonkaga qaytarish</button>` : ''}
                <div class="nd-tip">Rasm tanlangach — ramka ichida kerakli qismini surib, ikki barmoq bilan kattalashtirib joylang. Ikonka faqat sizda almashadi (administrator uni dizayn namunasiga kiritsa — hammada).</div>`, true);
        }
        async function icPick(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; const C = ICN.cur; if (!f || !C) return; mdlClose('icSheet');
            const cv = await cropOpen(f, { aspect: 1, outW: 256, radius: 26, bg: '#ffffff', title: 'Ikonka' }); if (!cv) return;
            const blob = await cropBlob(cv, 'image/jpeg', 0.9), ref = 'design:ic:' + icHash(C.k) + ':' + Date.now().toString(36), M = icMap();
            await mediaSave(ref, blob, { id: ref, at: new Date().toISOString(), size: blob.size, name: 'ikonka.jpg', mime: 'image/jpeg' });
            const old = M[C.k]; M[C.k] = ref; icMapSet(M); if (old) dsnMediaDrop(old);
            await icApply(); showToast('🖼 Ikonka almashtirildi');
        }
        function icReset() { const C = ICN.cur; if (!C) return; const M = icMap(), old = M[C.k]; delete M[C.k]; icMapSet(M); if (old) dsnMediaDrop(old); mdlClose('icSheet'); icApply(); showToast('↺ Asl ikonka qaytarildi'); }

        // ---------------------------------------------------------------- 5) YUQORI TUGMALAR — AI TUGMASI KABI ERKIN SURISH
        //  3 soniya bosib turing → titraydi → barmoqni qoʻymay butun ekran boʻylab suring (sahifa aylanib ketmaydi).
        //  Joy ekranning eni/boʻyiga nisbatan (%) saqlanadi — turli telefonlarda bir xil joyda turadi.
        (function () {
            if (typeof DRG === 'undefined') return;
            try { document.removeEventListener('pointerdown', drgDown, true); document.removeEventListener('pointermove', drgMove, { capture: true, passive: false }); document.removeEventListener('pointerup', drgUp, true); document.removeEventListener('pointercancel', drgUp, true); } catch (e) {}
            const A = () => $id('screen-main');
            const els = () => DRG_SEL.map(s => [s, document.querySelector(s)]).filter(x => x[1]);
            // eski format {x: sarlavha eniga nisbat, y: px} → yangi {fx, fy} (bosh sahifa eni/boʻyiga nisbat)
            function pos() { const P = drgPos(), a = A(); if (!a) return P; const ar = a.getBoundingClientRect(); let ch = false;
                Object.keys(P).forEach(k => { const p = P[k]; if (p && p.fx == null && p.x != null && ar.width) { const H = drgHost(), hr = H ? H.getBoundingClientRect() : ar; P[k] = { fx: (hr.left - ar.left + p.x * hr.width) / ar.width, fy: (hr.top - ar.top + p.y) / ar.height }; ch = true; } });
                if (ch) { try { localStorage.setItem(DRG_KEY, JSON.stringify(P)); } catch (e) {} } return P; }
            function place(el, ax, ay) { // ax, ay — bosh sahifa ichidagi koordinata
                const a = A(); if (!a) return { x: 0, y: 0 }; const ar = a.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
                ax = Math.max(0, Math.min(ax, ar.width - w)); ay = Math.max(0, Math.min(ay, ar.height - h));
                const op = (el.offsetParent || a).getBoundingClientRect(); el.style.left = (ar.left + ax - op.left) + 'px'; el.style.top = (ar.top + ay - op.top) + 'px'; return { x: ax, y: ay };
            }
            drgApply = function () {
                const P = pos(), H = drgHost(), a = A(); if (!H || !a) return; const ar = a.getBoundingClientRect(); if (!ar.width) return;
                if (Object.keys(P).length) { H.style.position = 'relative'; H.style.overflow = 'visible'; }
                els().forEach(([s, el]) => { const p = P[s];
                    if (p && p.fx != null) { el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.zIndex = 60; el.dataset.drg = '1'; place(el, p.fx * ar.width, p.fy * ar.height); }
                    else if (el.dataset.drg) { ['position', 'left', 'top', 'right', 'bottom', 'zIndex'].forEach(k => el.style[k] = ''); delete el.dataset.drg; } });
            };
            drgReset = function () { try { localStorage.removeItem(DRG_KEY); } catch (e) {} drgApply(); const H = drgHost(); if (H) { H.style.position = ''; H.style.overflow = ''; } showToast('↩ Tugmalar asl joyiga qaytdi'); };
            const D = { el: null, t: 0, on: false, sx: 0, sy: 0, ox: 0, oy: 0, id: null, hp: null };
            const stop = () => { clearTimeout(D.t); const el = D.el; D.el = null; if (!el) return; if (D.on) { D.on = false; el.classList.remove('drg-on'); try { el.releasePointerCapture(D.id); } catch (e) {}
                const a = A(), ar = a.getBoundingClientRect(), P = pos(), k = drgKey(el); if (k && D.hp) { P[k] = { fx: D.hp.x / ar.width, fy: D.hp.y / ar.height }; try { localStorage.setItem(DRG_KEY, JSON.stringify(P)); } catch (e) {} }
                showToast('📌 Tugma joyi saqlandi'); DRG.eat = true; setTimeout(() => { DRG.eat = false; }, 450); } };
            document.addEventListener('pointerdown', e => {
                const el = e.target.closest && DRG_SEL.map(s => document.querySelector(s)).find(x => x && x.contains(e.target)); if (!el || !el.closest('#screen-main.active, #screen-main')) return;
                clearTimeout(D.t); D.el = el; D.on = false; D.sx = e.clientX; D.sy = e.clientY; D.id = e.pointerId;
                D.t = setTimeout(() => { if (D.el !== el) return; D.on = true; DRG.eat = true; drgBuzz(); el.classList.add('drg-on'); try { el.setPointerCapture(D.id); } catch (x) {}
                    const H = drgHost(); H.style.position = 'relative'; H.style.overflow = 'visible'; const r = el.getBoundingClientRect(), ar = A().getBoundingClientRect();
                    el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.zIndex = 60; el.dataset.drg = '1';
                    D.hp = place(el, r.left - ar.left, r.top - ar.top); D.ox = D.sx - r.left; D.oy = D.sy - r.top; }, 3000);
            }, true);
            document.addEventListener('pointermove', e => {
                if (!D.el) return; if (!D.on) { if (Math.abs(e.clientX - D.sx) > 10 || Math.abs(e.clientY - D.sy) > 10) { clearTimeout(D.t); D.el = null; } return; }
                e.preventDefault(); const ar = A().getBoundingClientRect(); D.hp = place(D.el, e.clientX - D.ox - ar.left, e.clientY - D.oy - ar.top);
            }, { capture: true, passive: false });
            document.addEventListener('pointerup', stop, true); document.addEventListener('pointercancel', stop, true);
            document.addEventListener('touchmove', e => { if (D.on) e.preventDefault(); }, { capture: true, passive: false }); // surish paytida sahifa aylanmaydi
            const c = document.createElement('style'); c.textContent = DRG_SEL.join(',') + '{touch-action:none!important}.drg-on{transition:none!important}'; document.head.appendChild(c);
            setTimeout(drgApply, 700);
        })();

        // ---------------------------------------------------------------- 6–7) DIZAYN NAMUNASI VA QATLAMLAR
        //  Dizayn = fonlar, logotip, shrift, ovoz, har sahifa/kartochka sozlamasi, yuqori tugmalar joyi, mavzu,
        //  shaffoflik, AI va «‹» tugmalari joyi, menyu ikonkalari. Har biri alohida «yoʻl» (path) sifatida solishtiriladi.
        //  • Administrator «Namuna qilish» — oʻz telefonidagi joriy dizayn asl nusxa boʻladi (eskisi oʻrnini bosadi) va
        //    server orqali hammaga ketadi (serversiz — fayl).
        //  • Yangi namuna kelganda: xodim oʻzi tegmagan joylar — darhol namunadagidek; oʻzi oʻzgartirgan joylar boʻlsa —
        //    soʻraladi («Ha» / «Keyinroq»). Ilova yangilanganda xodimning oʻz dizayni saqlanadi (bu yerda hech narsa oʻchmaydi).
        //  • «Namunaga qaytarish» — butun ilova yoki faqat shu sahifa.
        var DSN = { pubKey: 'agmk_dsn_pub', baseKey: 'agmk_dsn_base', pendKey: 'agmk_dsn_pend', fileExt: '.agmkd', busy: false };
        var DSN_DEF = { '["G","logo"]': 'on', '["G","snd"]': 'bell', '["G","vol"]': 0.7, '["G","fs"]': 100 };
        function dsnJ(v) { return JSON.stringify(v === undefined ? null : v); }
        function dsnBase() { try { return JSON.parse(localStorage.getItem(DSN.baseKey) || 'null'); } catch (e) { return null; } }
        function dsnBaseSet(b) { try { if (b) localStorage.setItem(DSN.baseKey, JSON.stringify(b)); else localStorage.removeItem(DSN.baseKey); } catch (e) {} }
        function dsnPend() { try { return JSON.parse(localStorage.getItem(DSN.pendKey) || 'null'); } catch (e) { return null; } }
        function dsnPendSet(p) { try { if (p) localStorage.setItem(DSN.pendKey, JSON.stringify(p)); else localStorage.removeItem(DSN.pendKey); } catch (e) {} }
        function dsnLS(k) { try { const v = localStorage.getItem(k); return v === null ? null : JSON.parse(v); } catch (e) { return null; } }
        // Joriy (amaldagi) dizayn → tekis xarita { '["G","bg","bgM"]': qiymat, … }
        function dsnRead() {
            const F = {}, put = (p, v) => { if (v === undefined || v === null || v === '' || v === false) return; const k = JSON.stringify(p); if (k in DSN_DEF && dsnJ(DSN_DEF[k]) === dsnJ(v)) return; F[k] = v; };
            const G = dsnLS(DSG_KEY) || {}; Object.keys(G).forEach(k => { if (k === 'bg') Object.keys(G.bg || {}).forEach(b => put(['G', 'bg', b], G.bg[b])); else put(['G', k], G[k]); });
            try { const U = uiData(); ['p', 'c'].forEach(t => Object.keys(U[t] || {}).forEach(pg => Object.keys(U[t][pg] || {}).forEach(f => put(['U', t, pg, f], U[t][pg][f])))); } catch (e) {}
            const H = dsnLS(DRG_KEY) || {}; Object.keys(H).forEach(s => put(['H', s], H[s]));
            try { const t = localStorage.getItem(AGMK_THEME_KEY); if (t && t !== (window.AGMK_THEME_DEFAULT || 'classic')) put(['T', 'theme'], t); } catch (e) {}
            try { const a = cardAGet(); if (a !== null && !isNaN(a)) put(['T', 'calpha'], a); } catch (e) {}
            put(['T', 'aipos'], dsnLS(AIPOS_KEY)); put(['T', 'backfab'], typeof NAVFAB_KEY !== 'undefined' ? dsnLS(NAVFAB_KEY) : null);
            const I = icMap(); Object.keys(I).forEach(k => put(['I', k], I[k]));
            return F;
        }
        // Tekis xaritani joriy dizayn qilib yozish (toʻliq) va ekranga qoʻllash
        async function dsnWrite(F) {
            const G = {}, U = { p: {}, c: {} }, H = {}, I = {}, T = {};
            Object.keys(F).forEach(ks => { let p; try { p = JSON.parse(ks); } catch (e) { return; } const v = F[ks];
                if (p[0] === 'G') { if (p[1] === 'bg') (G.bg = G.bg || {})[p[2]] = v; else G[p[1]] = v; }
                else if (p[0] === 'U' && (p[1] === 'p' || p[1] === 'c')) (U[p[1]][p[2]] = U[p[1]][p[2]] || {})[p[3]] = v;
                else if (p[0] === 'H') H[p[1]] = v; else if (p[0] === 'I') I[p[1]] = v; else if (p[0] === 'T') T[p[1]] = v; });
            G.bg = G.bg || {}; Object.keys(DSN_DEF).forEach(k => { const p = JSON.parse(k); if (G[p[1]] === undefined) G[p[1]] = DSN_DEF[k]; });
            try { localStorage.setItem(DSG_KEY, JSON.stringify(G)); } catch (e) {}
            try { const d = uiData(); d.p = U.p; d.c = U.c; uiSave(d); } catch (e) {}
            try { if (Object.keys(H).length) localStorage.setItem(DRG_KEY, JSON.stringify(H)); else localStorage.removeItem(DRG_KEY); } catch (e) {}
            icMapSet(I);
            try { if (T.theme) localStorage.setItem(AGMK_THEME_KEY, T.theme); else localStorage.removeItem(AGMK_THEME_KEY); themeApply(themeGet(), false); } catch (e) {}
            try { if (T.calpha != null) localStorage.setItem(CARDA_KEY, String(T.calpha)); else localStorage.removeItem(CARDA_KEY); cardAApply(cardAGet()); } catch (e) {}
            try { if (T.aipos) localStorage.setItem(AIPOS_KEY, JSON.stringify(T.aipos)); else localStorage.removeItem(AIPOS_KEY); aiPosApply(); } catch (e) {}
            try { if (typeof NAVFAB_KEY !== 'undefined') { if (T.backfab) localStorage.setItem(NAVFAB_KEY, JSON.stringify(T.backfab)); else localStorage.removeItem(NAVFAB_KEY); } } catch (e) {}
            try { DSG.urls = {}; await dsgApply(); } catch (e) {}
            try { await uiApply(); } catch (e) {}
            try { const Hh = drgHost(); if (Hh && !Object.keys(H).length) { Hh.style.position = ''; Hh.style.overflow = ''; } drgApply(); } catch (e) {}
            try { await icApply(); } catch (e) {}
        }
        // Rasm/ovoz fayli qaysi yoʻlga tegishli
        function dsnRefOf(p, v) {
            if (!v || typeof v !== 'string' && typeof v !== 'number') return null;
            if (p[0] === 'G' && p[1] === 'bg') return 'design:' + p[2] + ':' + v;
            if (p[0] === 'G' && p[1] === 'logoV') return 'design:logo:' + v;
            if (p[0] === 'G' && p[1] === 'sndV') return 'design:snd:' + v;
            if (p[0] === 'U' && (p[3] === 'hi' || p[3] === 'bi')) return String(v);
            if (p[0] === 'I') return String(v);
            return null;
        }
        function dsnRefs(F) { const s = new Set(); Object.keys(F || {}).forEach(k => { try { const r = dsnRefOf(JSON.parse(k), F[k]); if (r) s.add(r); } catch (e) {} }); return s; }
        // Namunadagi fayllar oʻchirib yuborilmaydi (xodim oʻz fonini almashtirsa ham — «Namunaga qaytarish» uchun kerak)
        if (typeof mediaDelete === 'function') mediaDelete = agmkExtend('mediaDelete', 'v3.11: namuna fayllari himoyasi', mediaDelete, o => function (id) { try { const b = dsnBase(); if (b && dsnRefs(b.flat).has(id)) return Promise.resolve(); } catch (e) {} return o.apply(this, arguments); });
        function dsnMediaDrop(ref) { try { const p = mediaDelete(ref); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
        async function dsnGc(oldFlat) { const keep = new Set([...dsnRefs(dsnRead()), ...dsnRefs((dsnBase() || {}).flat)]); for (const r of dsnRefs(oldFlat)) if (!keep.has(r)) dsnMediaDrop(r); }
        // Namuna uchun fayllarni yengillashtirish (fon — 1600 px gacha JPEG; ikonka va ovoz — oʻzicha)
        async function dsnShrink(b, ref) {
            if (!b || !/^image\//.test(b.type || '') || /^design:ic:/.test(ref) || b.size < 380000) return b;
            try { const im = await cropLoad(b), png = /png/.test(b.type), mx = png ? 512 : 1600, sc = Math.min(1, mx / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
                c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); try { URL.revokeObjectURL(im.src); } catch (e) {} const r = await cropBlob(c, png ? 'image/png' : 'image/jpeg', 0.85); return r && r.size < b.size ? r : b; } catch (e) { return b; }
        }
        async function dsnBuild() {
            const F = dsnRead(), media = {};
            for (const ref of dsnRefs(F)) { let b = null; try { b = await mediaGetBlob(ref); } catch (e) {} if (!b) continue; b = await dsnShrink(b, ref); media[ref] = { t: b.type || '', d: bnB64(new Uint8Array(await b.arrayBuffer())) }; }
            return { app: 'AGMK-STTB PTO', kind: 'agmk-dizayn', v: Date.now().toString(36), at: new Date().toISOString(), by: meTabel(), byName: (currentUser && currentUser.name) || '', ver: typeof AGMK_VERSION !== 'undefined' ? AGMK_VERSION : '', flat: F, media: media };
        }
        function dsnSize(pkg) { try { return (JSON.stringify(pkg).length / 1048576).toFixed(1) + ' MB'; } catch (e) { return ''; } }
        // ---------- Administrator: namuna qilish va hammaga yuborish ----------
        async function dsnPublish() {
            if (!isAdmin()) { alert('Dizayn namunasini faqat administrator tayyorlaydi.'); return; }
            const old = dsnBase();
            if (!(await uiConfirm('🎨 Hozirgi dizayningiz (fonlar, ikonkalar, tugmalar joyi, ranglar, shrift) ASOSIY NAMUNA boʻladi va hammaga yuboriladi.' + (old ? '\n\nOldingi namuna (' + fmtDT(old.at) + ') oʻchiriladi.' : '') + '\n\nXodimlar: dizaynga tegmagan joylari darhol yangilanadi; oʻzi oʻzgartirgan joylari boʻlsa — oʻzidan soʻraladi.\n\nDavom etilsinmi?'))) return;
            if (DSN.busy) return; DSN.busy = true; showToast('⏳ Dizayn namunasi tayyorlanmoqda...');
            try {
                const pkg = await dsnBuild();
                try { localStorage.setItem(DSN.pubKey, JSON.stringify(pkg)); } catch (e) { throw new Error('telefon xotirasi toʻlgan — namuna saqlanmadi'); }
                dsnBaseSet({ v: pkg.v, at: pkg.at, by: pkg.by, byName: pkg.byName, flat: pkg.flat }); dsnPendSet(null);
                if (old) dsnGc(old.flat);
                let srv = false; try { if (typeof KV_SYNC !== 'undefined') KV_SYNC.dirty = true; if (typeof srvOn === 'function' && srvOn() && typeof syncNow === 'function') { await syncNow(); srv = !(typeof SYNC !== 'undefined' && SYNC.err); } } catch (e) {}
                try { if (typeof audLog === 'function') audLog('dizayn', 'Dizayn namunasi yuborildi (' + dsnSize(pkg) + ')'); } catch (e) {}
                mdl('dsnDone', `<div class="px-h"><b>🎨 Namuna tayyor</b><button class="mini-btn" onclick="mdlClose('dsnDone')">✕</button></div>
                    <div class="nd-tip">${srv ? '✅ Server orqali hammaga yuborildi — xodimlarning telefoni serverga ulanganda oʻzi oladi.' : '📴 Server ulanmagan — namuna telefonda saqlandi va server topilishi bilan oʻzi yuboriladi.'}<br>Hajmi: ${dsnSize(pkg)}.</div>
                    <button class="action-btn sec" onclick="dsnFileOut()">📄 Fayl qilib yuborish (Telegram, ShareIt)</button>
                    <div class="pk-btns"><button class="pr" onclick="mdlClose('dsnDone')">Tushunarli</button></div>`, true);
                try { dsgOpen(); } catch (e) {}
            } catch (e) { alert('⚠️ Namuna tayyorlanmadi: ' + agmkErrUz(e)); } finally { DSN.busy = false; }
        }
        function dsnFileOut() {
            const pkg = dsnLS(DSN.pubKey); if (!pkg) { alert('Hali namuna yoʻq. Avval «Namuna qilish» tugmasini bosing.'); return; }
            const name = 'agmk-dizayn-' + String(pkg.at || new Date().toISOString()).slice(0, 10) + DSN.fileExt;
            docDownload([{ name: name, mime: 'application/octet-stream', blob: new Blob([JSON.stringify(pkg)], { type: 'application/octet-stream' }) }]);
        }
        async function dsnFileIn(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; let pkg = null;
            try { pkg = JSON.parse(await f.text()); } catch (e) {}
            if (!pkg || pkg.kind !== 'agmk-dizayn' || !pkg.flat) { alert('⚠️ Bu dizayn namunasi fayli emas.'); return; }
            const b = dsnBase(); if (b && b.v === pkg.v) { alert('Bu namuna allaqachon oʻrnatilgan.'); return; }
            if (!(await uiConfirm('🎨 Dizayn namunasi: ' + (pkg.byName || 'administrator') + ' · ' + fmtDT(pkg.at) + '\n\nOʻrnatilsinmi? Siz oʻzgartirgan joylar boʻlsa — alohida soʻraladi.'))) return;
            await dsnIncoming(pkg, { file: true });
        }
        // ---------- Xodim: yangi namuna keldi ----------
        async function dsnIncoming(pkg, o) {
            o = o || {}; if (!pkg || pkg.kind !== 'agmk-dizayn' || !pkg.flat || typeof pkg.flat !== 'object') return;
            const base = dsnBase(); if (base && base.v === pkg.v) return;
            if (isAdmin() && base && base.at && pkg.at && base.at > pkg.at) return; // administratorning oʻzida yangisi bor
            // fayllar (faqat rasm / ovoz; nomi — dizayn yoki sahifa foni)
            for (const ref of Object.keys(pkg.media || {})) {
                const m = pkg.media[ref]; if (!m || !/^(design:[a-zA-Z0-9]+:|uibg_)[\w:.-]+$/.test(ref) || !/^(image\/(jpeg|png|webp)|audio\/[\w.+-]+)$/.test(m.t || '')) continue;
                try { const blob = new Blob([bnU8(m.d)], { type: m.t }); await mediaSave(ref, blob, { id: ref, at: new Date().toISOString(), size: blob.size, name: ref, mime: m.t, ui: true }); if (!/^design:/.test(ref)) { try { mediaKeep(ref); } catch (e) {} } } catch (e) {}
            }
            const E = dsnRead(), B = (base && base.flat) || {}, N = pkg.flat;
            const C = new Set(Object.keys(Object.assign({}, E, B)).filter(k => dsnJ(E[k]) !== dsnJ(B[k]))); // xodim oʻzi oʻzgartirgan yoʻllar
            const E2 = Object.assign({}, E);
            Object.keys(Object.assign({}, N, B)).forEach(k => { if (C.has(k)) return; if (k in N) E2[k] = N[k]; else delete E2[k]; }); // tegmagan joylar — namunadan
            const conflict = Array.from(C).filter(k => dsnJ(E[k]) !== dsnJ(N[k]));
            await dsnWrite(E2);
            dsnBaseSet({ v: pkg.v, at: pkg.at, by: pkg.by, byName: pkg.byName, flat: N });
            if (base) dsnGc(base.flat);
            if (!conflict.length) { dsnPendSet(null); showToast('🎨 Yangi dizayn namunasi qoʻllandi'); return; }
            dsnPendSet({ v: pkg.v, at: pkg.at, n: conflict.length });
            dsnAsk();
        }
        function dsnAsk() {
            const p = dsnPend(), b = dsnBase(); if (!p || !b || p.v !== b.v || document.body.classList.contains('locked')) return;
            mdl('dsnAsk', `<div class="px-h"><b>🎨 Yangi dizayn namunasi keldi</b><button class="mini-btn" onclick="dsnLater()">✕</button></div>
                <div class="nd-tip">${escapeHtml(b.byName || 'Administrator')} · ${escapeHtml(fmtDT(b.at))}<br><br>Siz tegmagan joylar allaqachon yangilandi. Lekin <b>oʻzingiz oʻzgartirgan ${p.n} ta sozlama</b> bor (fon, rang, tugma joyi va h.k.).<br><br><b>«Ha, qoʻllash»</b> — ular ham namunadagidek boʻladi.<br><b>«Keyinroq»</b> — oʻzingizniki qoladi. Keyin xohlagan payt: Parametrlar → 🖌 Fon → «Namunaga qaytarish».</div>
                <div class="pk-btns"><button onclick="dsnLater()">Keyinroq</button><button class="pr" onclick="mdlClose('dsnAsk'); dsnRevert()">✅ Ha, qoʻllash</button></div>`, true);
        }
        function dsnLater() { mdlClose('dsnAsk'); dsnPendSet(null); showToast('👌 Oʻz dizayningiz qoldi'); }
        // «Namunaga qaytarish»: pk berilmasa — butun ilova; berilsa — faqat shu sahifa
        async function dsnRevert(pk) {
            const b = dsnBase(); if (!b) { alert('Hali administrator dizayn namunasini yubormagan.'); return; }
            const N = b.flat || {}, E = dsnRead(); let F;
            if (!pk) F = Object.assign({}, N);
            else {
                const mine = k => { try { const p = JSON.parse(k); if (p[0] === 'U' && p[1] === 'p' && p[2] === pk) return true; if (p[0] === 'U' && p[1] === 'c' && String(p[2]).startsWith(pk + '|')) return true;
                    if (pk === 'screen-main' && (p[0] === 'H' || (p[0] === 'G' && p[1] === 'bg' && (p[2] === 'bgM' || p[2] === 'bgH1')))) return true; } catch (e) {} return false; };
                F = {}; Object.keys(E).forEach(k => { if (!mine(k)) F[k] = E[k]; }); Object.keys(N).forEach(k => { if (mine(k)) F[k] = N[k]; });
            }
            await dsnWrite(F); if (!pk) dsnPendSet(null);
            showToast(pk ? '↩ Sahifa namunadagidek boʻldi' : '↩ Dizayn namunadagidek boʻldi'); try { if ($id('dsgModal') && !$id('dsgModal').classList.contains('hidden')) dsgOpen(); } catch (e) {}
        }
        function dsnMineCount() { const b = dsnBase(); if (!b) return 0; const E = dsnRead(), N = b.flat || {}; return Object.keys(Object.assign({}, E, N)).filter(k => dsnJ(E[k]) !== dsnJ(N[k])).length; }
        // ---------- Server orqali tarqatish (faqat administrator yozadi) ----------
        (function () {
            try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(DSN.pubKey)) KV_SYNC.keys.push(DSN.pubKey); } catch (e) {}
            if (typeof syncLocal === 'function') syncLocal = agmkExtend('syncLocal', 'v3.11: dizayn namunasini faqat administrator yuboradi', syncLocal, o => function () { const L = o.apply(this, arguments); return isAdminReal() ? L : (L || []).filter(x => !(x && x.id === 'kv:' + DSN.pubKey)); });
            if (typeof syncApply === 'function') syncApply = agmkExtend('syncApply', 'v3.11: dizayn namunasi', syncApply, o => function (rec) {
                if (rec && rec.kind === 'kv' && rec.data && rec.data.k === DSN.pubKey) {
                    if (String(rec.data.by) !== ADMIN_TABEL) return null; const pkg = rec.data.v; if (!pkg || pkg.kind !== 'agmk-dizayn') return null;
                    if (!isAdminReal()) { try { localStorage.setItem(DSN.pubKey, JSON.stringify(pkg)); } catch (e) {} setTimeout(() => { dsnIncoming(pkg).catch(e => console.warn('dizayn', e)); }, 400); }
                    return 'kv';
                }
                return o.apply(this, arguments);
            });
            // kirgandan keyin: javob berilmagan namuna boʻlsa — yana soʻraladi
            if (typeof hideLock === 'function') hideLock = agmkExtend('hideLock', 'v3.11: dizayn namunasi soʻrovi', hideLock, o => function () { const r = o.apply(this, arguments); setTimeout(() => { try { dsnAsk(); } catch (e) {} }, 2500); return r; });
        })();
        // ---------- Parametrlar → 🖌 Fon oynasiga «Dizayn namunasi» qismi ----------
        if (typeof dsgOpen === 'function') dsgOpen = agmkExtend('dsgOpen', 'v3.11: dizayn namunasi', dsgOpen, o => function () {
            const r = o.apply(this, arguments);
            try {
                const m = $id('dsgModal'), box = m && m.querySelector('.modal-content'); if (!box || box.querySelector('.dsn-sec')) return r;
                const b = dsnBase(), mine = b ? dsnMineCount() : 0, E = escapeHtml, d = document.createElement('div'); d.className = 'dsn-sec';
                d.innerHTML = `<div class="pp-lbl">🎨 DIZAYN NAMUNASI</div>
                    <div class="nd-tip" style="margin-top:0">${b ? `Asosiy namuna: <b>${E(b.byName || 'administrator')}</b> · ${E(fmtDT(b.at))}<br>${mine ? `Siz oʻzingizga moslagan: <b>${mine}</b> ta sozlama.` : 'Dizayningiz namunadagidek.'}` : 'Administrator hali dizayn namunasini yubormagan — hozir ilovaning standart dizayni.'}</div>
                    ${b && mine ? `<button class="action-btn sec" onclick="dsnRevertAsk()">↩ Namunaga qaytarish (butun ilova)</button>` : ''}
                    ${isAdminReal() ? `<button class="action-btn" onclick="dsnPublish()">💾 Hozirgi dizaynni namuna qilish va hammaga yuborish</button>${dsnLS(DSN.pubKey) ? `<button class="action-btn sec" onclick="dsnFileOut()">📄 Namunani fayl qilib yuborish</button>` : ''}` : ''}
                    <label class="action-btn sec" style="display:block;text-align:center;cursor:pointer">📥 Dizayn faylini ochish (${DSN.fileExt})<input type="file" accept="${DSN.fileExt},application/octet-stream,application/json" style="display:none" onchange="dsnFileIn(this)"></label>`;
                const tip = Array.from(box.querySelectorAll('.nd-tip')).pop(); if (tip) { tip.textContent = 'Oʻzgartirishlaringiz faqat sizda. Administrator dizayn namunasini yuborsa — siz tegmagan joylar namunadagidek boʻladi, oʻzingiz moslaganlar saqlanadi (soʻraladi).'; box.insertBefore(d, tip); } else box.appendChild(d);
            } catch (e) { console.warn(e); }
            return r;
        });
        async function dsnRevertAsk() { if (!(await uiConfirm('↩ Butun ilova dizayni administrator namunasidagidek boʻlsinmi?\n\nOʻzingiz qoʻygan fon, ikonka, rang va tugma joylari namunadagisiga almashadi.'))) return; dsnRevert(); }
        // Har sahifaning ⚙️ sozlamasida — «Namunaga qaytarish (shu sahifa)»
        if (typeof uiSetOpen === 'function') uiSetOpen = agmkExtend('uiSetOpen', 'v3.11: sahifani namunaga qaytarish', uiSetOpen, o => function (t) {
            const r = o.apply(this, arguments);
            try { if (t === 'p' && dsnBase()) { const m = $id('uiSet'), btns = m && m.querySelector('.pk-btns'); if (btns && !m.querySelector('.dsn-pg')) { const x = document.createElement('button'); x.className = 'action-btn sec dsn-pg'; x.style.marginTop = '10px'; x.textContent = '↩ Namunaga qaytarish (shu sahifa)'; x.onclick = () => { const pk = uiPageKey(); UI.edit = null; mdlClose('uiSet'); dsnRevert(pk); }; btns.parentNode.insertBefore(x, btns); } } } catch (e) {}
            return r;
        });
        (function () { const c = document.createElement('style'); c.textContent = '.dsn-sec .action-btn{margin-top:8px}'; document.head.appendChild(c); })();

        // ---------------------------------------------------------------- 8) SHTAT: har boʻlim tagida «➕ Shtat qoʻshish»
        function shtAddAt(uid, gid) {
            if (typeof shtatUnlocked !== 'undefined' && !shtatUnlocked) { openShtPos(null); return; }
            openShtPos(null);
            try { const m = $id('shtPosModal'); if (!m || m.classList.contains('hidden')) return;
                $id('spUnit').value = uid; spFillGroups(gid || ''); SHT.open.add(uid);
                const g = gid ? groupById(gid) : null, u = typeof unitById === 'function' ? unitById(uid) : null;
                $id('spTitle').innerText = "➕ Lavozim qo'shish — " + ((g && g.name) || (u && u.name) || '');
                setTimeout(() => { try { $id('spName').focus(); } catch (e) {} }, 80); } catch (e) { console.warn(e); }
        }
        if (typeof renderShtatList === 'function') renderShtatList = agmkExtend('renderShtatList', 'v3.11: har boʻlim tagida «Shtat qoʻshish»', renderShtatList, o => function () {
            const r = o.apply(this, arguments);
            try {
                document.querySelectorAll('#shtatListContainer .sht-unit').forEach(un => {
                    const h = un.querySelector('.sht-unit-h'), m = /shtToggleUnit\('([^']+)'\)/.exec((h && h.getAttribute('onclick')) || ''), body = un.querySelector('.sht-unit-b'); if (!m || !body) return; const uid = m[1];
                    const mk = gid => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sht-add'; b.textContent = "➕ Shtat qoʻshish"; b.onclick = e => { e.stopPropagation(); shtAddAt(uid, gid); }; return b; };
                    let gid = null; const kids = Array.from(body.children);
                    kids.forEach(k => { if (k.classList.contains('sht-group-h')) { body.insertBefore(mk(gid), k); const g = /shtRenameGroup\('([^']+)'\)/.exec(k.innerHTML); gid = g ? g[1] : null; } });
                    body.appendChild(mk(gid));
                });
            } catch (e) { console.warn(e); }
            return r;
        });
        (function () { const c = document.createElement('style'); c.textContent = '.sht-add{display:block;width:100%;margin:6px 0 12px;padding:10px;border-radius:12px;border:1.5px dashed rgba(56,189,248,.6);background:rgba(56,189,248,.08);color:#7dd3fc;font:600 14px system-ui;cursor:pointer;text-align:center}.sht-add:active{background:rgba(56,189,248,.2)}'; document.head.appendChild(c); })();

        // ---------------------------------------------------------------- 9) 📴 SERVER BELGISI: surish, ✕ bilan yopish, kerak boʻlganda ogohlantirish
        //  • Belgini AI tugmasi kabi xohlagan joyga surish mumkin (joyi eslab qolinadi).
        //  • ✕ — belgi yopiladi va keyingi ogohlantirishgacha chiqmaydi.
        //  • Siz biror amal qilganingizda (yuborish, saqlash, yuklash) server bilan aloqa boʻlmasa — ogohlantirish chiqadi va belgi qaytadi.
        var OFC = { posKey: 'agmk_offchip_pos', hideKey: 'agmk_offchip_hide', act: 0, warned: 0 };
        function ofcHidden() { try { return localStorage.getItem(OFC.hideKey) === '1'; } catch (e) { return false; } }
        function ofcHide(v) { try { if (v) localStorage.setItem(OFC.hideKey, '1'); else localStorage.removeItem(OFC.hideKey); } catch (e) {} }
        function ofcPlace(c) { let p = null; try { p = JSON.parse(localStorage.getItem(OFC.posKey) || 'null'); } catch (e) {} if (!p || !c) return; const W = window.innerWidth, H = window.innerHeight, w = c.offsetWidth || 44, h = c.offsetHeight || 44;
            c.style.right = 'auto'; c.style.bottom = 'auto'; c.style.left = Math.max(4, Math.min(W - w - 4, p.x * W)) + 'px'; c.style.top = Math.max(4, Math.min(H - h - 4, p.y * H)) + 'px'; }
        function ofcDrag(c) {
            if (c._ofc) return; c._ofc = true; c.style.touchAction = 'none'; let st = null, moved = false;
            const x = document.createElement('span'); x.className = 'ofc-x'; x.textContent = '✕'; x.title = 'Yopish (keyingi ogohlantirishgacha)'; c.appendChild(x);
            x.addEventListener('pointerdown', e => e.stopPropagation()); x.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); ofcHide(true); c.remove(); showToast('📴 Belgi yopildi — keyingi ogohlantirishgacha chiqmaydi'); });
            c.addEventListener('pointerdown', e => { const r = c.getBoundingClientRect(); st = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top }; moved = false; try { c.setPointerCapture(e.pointerId); } catch (z) {} });
            c.addEventListener('pointermove', e => { if (!st) return; if (!moved && Math.hypot(e.clientX - st.x, e.clientY - st.y) < 10) return; moved = true;
                c.style.right = 'auto'; c.style.bottom = 'auto'; c.style.left = Math.max(0, Math.min(window.innerWidth - c.offsetWidth, e.clientX - st.dx)) + 'px'; c.style.top = Math.max(0, Math.min(window.innerHeight - c.offsetHeight, e.clientY - st.dy)) + 'px'; });
            const end = () => { if (!st) return; st = null; if (moved) { const r = c.getBoundingClientRect(); try { localStorage.setItem(OFC.posKey, JSON.stringify({ x: r.left / window.innerWidth, y: r.top / window.innerHeight })); } catch (z) {} c._skip = Date.now(); } };
            c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
            c.addEventListener('click', e => { if (e.target === x) return; if (c._skip && Date.now() - c._skip < 700) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
            ofcPlace(c);
        }
        if (typeof offChip === 'function') offChip = agmkExtend('offChip', 'v3.11: surish va ✕', offChip, o => function (on) {
            if (on && ofcHidden()) { const c = $id('offChip'); if (c) c.remove(); return; }
            const r = o.apply(this, arguments); const c = $id('offChip'); if (c) ofcDrag(c); return r;
        });
        window.addEventListener('resize', () => ofcPlace($id('offChip')));
        // Foydalanuvchi oʻzi bajargan amal paytida aloqa yoʻqligi — ogohlantirish (fondagi avtomatik sinxronlash — jim)
        ['pointerdown', 'keydown'].forEach(n => document.addEventListener(n, () => { OFC.act = Date.now(); }, true));
        function ofcWarn(msg) {
            if (Date.now() - OFC.act > 8000 || Date.now() - OFC.warned < 15000) return; OFC.warned = Date.now();
            ofcHide(false); try { offChip(true); } catch (e) {}
            showToast('📴 ' + (msg || 'Server bilan aloqa yoʻq — amal serverga yetib bormadi. Korxona Wi-Fi tarmogʻini tekshiring.'));
        }
        if (typeof sbFetch === 'function') sbFetch = agmkExtend('sbFetch', 'v3.11: aloqa yoʻqligi haqida ogohlantirish', sbFetch, o => async function () {
            try { const r = await o.apply(this, arguments); return r; }
            catch (e) { if (e && e.net) ofcWarn(); throw e; }
        });
        (function () { const c = document.createElement('style'); c.textContent = '#offChip{overflow:visible}#offChip .ofc-x{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;background:#0f172a;border:1px solid #fb923c;color:#fdba74;font:700 11px/18px system-ui;text-align:center;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.5)}'; document.head.appendChild(c); })();


    

