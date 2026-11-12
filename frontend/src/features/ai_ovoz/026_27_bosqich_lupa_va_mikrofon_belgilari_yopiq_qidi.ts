        // =====================================================================
        // YANGI (27-bosqich): lupa va mikrofon belgilari, yopiq qidiruv,
        // mikrofon animatsiyasi, Profil sahifasi, aqlli mikrofon
        // =====================================================================
        // ---------- Rasmlar ----------
        AI_ICO = '<img class="ai-img" src="' + AGMK_IMG.sphPurple + '" alt="AI">';
        AI_ICO_S = '<img class="ai-img-s" src="' + AGMK_IMG.sphBlue + '" alt="AI">';
        function imgFill(root) { (root || document).querySelectorAll('img[data-img]').forEach(i => { const s = AGMK_IMG[i.getAttribute('data-img')]; if (s && i.src !== s) i.src = s; }); }
        var MIC_IMG = '<img class="mic-img" src="' + AGMK_IMG.mic + '" alt="🎤">';
        var LUPA_IMG = '<img src="' + AGMK_IMG.lupa + '" alt="🔍">';

        // ---------- Qidiruv: yopiq holatda, Enter yoki lupa bilan bajariladi ----------
        var SRCH = { pass: false };
        function srchCommit(inp) { if (!inp) return; SRCH.pass = true; try { inp.dispatchEvent(new Event('input', { bubbles: true })); } finally { SRCH.pass = false; } }
        function srchOpen(w) { if (!w || w.classList.contains('open')) return; w.classList.add('open'); const i = w.querySelector('.search-box'); setTimeout(() => { try { i.focus(); } catch (e) {} }, 60); }
        function srchClose(w) { if (!w) return; const i = w.querySelector('.search-box'); const had = i.value !== ''; i.value = ''; w.classList.remove('open'); if (had) srchCommit(i); try { i.blur(); } catch (e) {} }
        function srchInit() {
            document.querySelectorAll('.search-wrap').forEach(w => {
                if (w.classList.contains('srch')) return;
                const inp = w.querySelector('.search-box'); if (!inp) return;
                w.classList.add('srch');
                inp.setAttribute('enterkeyhint', 'search');
                const mic = w.querySelector('.mic-btn');
                if (mic) mic.innerHTML = MIC_IMG;
                const x = document.createElement('button'); x.type = 'button'; x.className = 'srch-btn srch-x'; x.title = 'Tozalash'; x.innerText = '✕';
                x.addEventListener('mousedown', e => e.preventDefault()); x.addEventListener('click', () => srchClose(w));
                const go = document.createElement('button'); go.type = 'button'; go.className = 'srch-btn srch-go'; go.title = 'Qidirish'; go.innerHTML = LUPA_IMG;
                go.addEventListener('mousedown', e => e.preventDefault());
                go.addEventListener('click', () => { if (!w.classList.contains('open')) srchOpen(w); else { srchCommit(inp); try { inp.blur(); } catch (e) {} } });
                if (mic) { w.insertBefore(x, mic); w.insertBefore(go, mic); } else { w.appendChild(x); w.appendChild(go); }
                if (inp.value) w.classList.add('open');
                inp.addEventListener('blur', () => setTimeout(() => { if (!inp.value && document.activeElement !== inp) w.classList.remove('open'); }, 200));
            });
        }
        // Harf yozilganda emas — Enter yoki lupa bosilganda qidiriladi (maydon tozalansa ro'yxat darhol qaytadi)
        document.addEventListener('input', e => {
            const t = e.target;
            if (SRCH.pass || !t || !t.classList || !t.classList.contains('search-box') || !t.closest('.search-wrap.srch')) return;
            if (t.value === '') return;
            e.stopImmediatePropagation();
        }, true);
        document.addEventListener('keydown', e => {
            const t = e.target;
            if (e.key !== 'Enter' || !t || !t.classList || !t.classList.contains('search-box') || !t.closest('.search-wrap.srch')) return;
            e.preventDefault(); srchCommit(t); try { t.blur(); } catch (er) {}
        }, true);
        // Ovozli qidiruv maydonni ochib qo'yadi (klaviatura mikrofoni uchun ham)
        (function () {
            micFallback = agmkExtend('micFallback', 'Ovozli qidiruv maydonni ochib qoʼyadi (klaviatura mikrofoni uchun ham)', micFallback, of => function (id) { const i = $id(id), w = i && i.closest('.search-wrap.srch'); if (w) srchOpen(w); return of.apply(this, arguments); });
            startVoiceSearch = agmkExtend('startVoiceSearch', 'startVoiceSearch', startVoiceSearch, ov => function (id, cb) { const i = $id(id), w = i && i.closest('.search-wrap.srch'); if (w) srchOpen(w); return ov.apply(this, arguments); });
        })();

        // ---------- Aqlli mikrofon: fayl sifatida ochilganda — klaviatura mikrofoni ----------
        var MIC_ENV = { secure: !!window.isSecureContext, sr: !!(window.SpeechRecognition || window.webkitSpeechRecognition), android: /android/i.test(navigator.userAgent || '') };
        if (!MIC_ENV.secure) { try { micBlocked = true; } catch (e) {} }
        (function () {
            micFallback = agmkExtend('micFallback', 'micFallback', micFallback, of => function (id) {
                of.apply(this, arguments);
                if (!MIC_ENV.secure) showToast("🎤 Klaviaturadagi mikrofonni bosing va gapiring — so'ng ↵ (Qidirish)");
            });
        })();
        function micDiag() {
            const L = [];
            L.push((MIC_ENV.secure ? '✅' : '❌') + ' Xavfsiz ochilish (https / ilova): ' + (MIC_ENV.secure ? 'ha' : "yo'q — fayl sifatida ochilgan (" + String(location.protocol).replace(':', '') + ')'));
            L.push((MIC_ENV.sr ? '✅' : '❌') + ' Ovozni matnga aylantirish: ' + (MIC_ENV.sr ? 'bor' : "yo'q"));
            L.push(((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? '✅' : '❌') + ' Mikrofonga kirish: ' + ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? 'bor' : "yo'q (brauzer bermaydi)"));
            L.push((navigator.onLine !== false ? '✅' : '⚠️') + ' Internet: ' + (navigator.onLine !== false ? 'bor' : "yo'q"));
            let v = '';
            if (!MIC_ENV.secure) v = "Dastur fayl sifatida ochilgani uchun Chrome dasturning o'z mikrofonini bermaydi. Hozircha: qidiruv yoki savol maydonini ochib, klaviaturadagi 🎤 tugmasini bosing.\n\nTo'liq ishlashi (to'lqin animatsiyasi bilan) uchun dasturni https server orqali yoki APK ilova qilib o'rnatish kerak — kod tayyor.";
            else if (!MIC_ENV.sr) v = "Bu brauzer ovozni matnga aylantira olmaydi. Chrome'ni yangilang yoki klaviatura mikrofonidan foydalaning.";
            else v = "Mikrofon ishlashi kerak. Birinchi marta «Ruxsat berish»ni bosing. Agar oldin rad etilgan bo'lsa: Chrome → ⋮ → Sozlamalar → Sayt sozlamalari → Mikrofon.";
            alert("🎤 Mikrofon tekshiruvi\n\n" + L.join('\n') + "\n\n" + v);
        }

        // ---------- Mikrofon animatsiyasi (neon doira + ovozga qarab tebranadigan to'lqinlar) ----------
        var MOV = { on: false, rec: null, lvl: 0.04, tgt: 0.04, speak: false, last: 0, raf: 0, t: 0, an: null, stream: null, ctx: null, parts: [], ext: 0 };
        // APK / tashqi manba uchun ulagich: window.agmkMicLevel(0..1)
        window.agmkMicLevel = function (v) { MOV.ext = Date.now(); MOV.tgt = Math.max(0, Math.min(1, +v || 0)); };
        function micOvShow(rec) {
            if (typeof AILIVE !== 'undefined' && AILIVE.on) return; // jonli suhbatda shar ko'rsatadi
            MOV.on = true; MOV.rec = rec; MOV.lvl = 0.05; MOV.tgt = 0.05; MOV.speak = false; MOV.last = Date.now();
            const img = $id('micOvImg'); if (img && !img.src) img.src = AGMK_IMG.neonmic;
            $id('micOvTxt').innerText = 'Gapiring...'; $id('micOv').classList.remove('hidden');
            micLevelStart();
            if (!MOV.raf) MOV.raf = requestAnimationFrame(micOvLoop);
        }
        function micOvHide() { MOV.on = false; MOV.rec = null; micLevelStop(); const o = $id('micOv'); if (o) o.classList.add('hidden'); }
        function micOvStop() { try { MOV.rec && MOV.rec.stop(); } catch (e) {} setTimeout(micOvHide, 250); }
        // Haqiqiy ovoz kuchi: faqat telefon ruxsat bersa va bu Android emas (Android'da mikrofonni ikki joy bir vaqtda ishlata olmaydi)
        function micLevelStart() {
            if (!MIC_ENV.secure || MIC_ENV.android || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) return;
            navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
                if (!MOV.on) { s.getTracks().forEach(t => t.stop()); return; }
                const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), src = ctx.createMediaStreamSource(s), an = ctx.createAnalyser();
                an.fftSize = 512; src.connect(an); MOV.stream = s; MOV.ctx = ctx; MOV.an = an; MOV.buf = new Uint8Array(an.fftSize);
            }).catch(() => {});
        }
        function micLevelStop() { try { MOV.stream && MOV.stream.getTracks().forEach(t => t.stop()); } catch (e) {} try { MOV.ctx && MOV.ctx.close(); } catch (e) {} MOV.stream = MOV.ctx = MOV.an = null; }
        function micLevelRead() {
            if (MOV.an) { MOV.an.getByteTimeDomainData(MOV.buf); let s = 0; for (let i = 0; i < MOV.buf.length; i++) { const d = (MOV.buf[i] - 128) / 128; s += d * d; } const rms = Math.sqrt(s / MOV.buf.length); MOV.tgt = Math.min(1, rms * 5); return; }
            if (Date.now() - MOV.ext < 400) return; // tashqi manba (APK)
            // Hodisalarga qarab: gapirayotganda tirik tebranish, jim bo'lsa sokinlashadi
            if (MOV.speak && Date.now() - MOV.last < 900) { if (Math.random() < 0.18) MOV.tgt = 0.35 + Math.random() * 0.6; }
            else MOV.tgt = 0.04;
        }
        function micOvLoop(ts) {
            MOV.raf = 0; if (!MOV.on) return;
            const cv = $id('micOvCv'), c = $id('micOv').querySelector('.mo-center');
            const dpr = Math.min(window.devicePixelRatio || 1, 2.5), W = cv.clientWidth, H = cv.clientHeight;
            if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
            const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
            micLevelRead(); MOV.lvl += (MOV.tgt - MOV.lvl) * 0.16; MOV.t += 0.016 + MOV.lvl * 0.05;
            const r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, R = r.width * 0.43, L = MOV.lvl, t = MOV.t;
            // fon zarrachalari
            while (MOV.parts.length < 60) MOV.parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.3, v: Math.random() * 0.3 + 0.05, a: Math.random() });
            MOV.parts.forEach(p => { p.y -= p.v * (1 + L * 3); if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } p.a += 0.02; x.fillStyle = `rgba(${p.r > 1.2 ? '236,72,153' : '56,189,248'},${0.25 + 0.35 * Math.abs(Math.sin(p.a))})`; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill(); });
            // ikki yondagi to'lqinlar
            const grad = (x0, x1) => { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(56,189,248,0)'); g.addColorStop(0.35, 'rgba(56,189,248,0.9)'); g.addColorStop(0.7, 'rgba(168,85,247,0.95)'); g.addColorStop(1, 'rgba(236,72,153,0.95)'); return g; };
            const amp = 5 + L * Math.min(H * 0.24, 150);
            [[-1, 0, cx - R - 4], [1, W, cx + R + 4]].forEach(([dir, xEdge, xIn]) => {
                x.strokeStyle = dir < 0 ? grad(0, xIn) : (() => { const g = x.createLinearGradient(W, 0, xIn, 0); g.addColorStop(0, 'rgba(236,72,153,0)'); g.addColorStop(0.35, 'rgba(236,72,153,0.9)'); g.addColorStop(0.7, 'rgba(168,85,247,0.95)'); g.addColorStop(1, 'rgba(56,189,248,0.95)'); return g; })();
                for (let k = 0; k < 14; k++) {
                    x.globalAlpha = 0.3 + 0.07 * (k % 4); x.lineWidth = k % 5 === 0 ? 1.8 : 0.9; x.beginPath();
                    const len = Math.abs(xIn - xEdge), ph = k * 0.45;
                    for (let s = 0; s <= 90; s++) {
                        const u = s / 90, px = xIn + (xEdge - xIn) * u, env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 1.3) * (1 - u * 0.55);
                        const y = cy + amp * env * (0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + k * 0.7))) * Math.sin(u * len / 26 + t * 5 * dir + ph) * (k % 2 ? 1 : -0.8);
                        s ? x.lineTo(px, y) : x.moveTo(px, y);
                    }
                    x.stroke();
                }
                x.globalAlpha = 0.9; x.lineWidth = 1.6; x.beginPath(); x.moveTo(xIn, cy); x.lineTo(xEdge, cy); x.strokeStyle = dir < 0 ? grad(0, xIn) : 'rgba(236,72,153,0.5)'; x.stroke();
            });
            // doira atrofidagi to'lqinsimon halqa
            x.globalAlpha = 1;
            for (let k = 0; k < 10; k++) {
                x.beginPath();
                for (let s = 0; s <= 120; s++) {
                    const a = s / 120 * 6.2832, n = Math.sin(a * 5 + t * 3 + k * 0.6) * 0.5 + Math.sin(a * 9 - t * 4 + k) * 0.3 + Math.sin(a * 2 + t * 1.7) * 0.2;
                    const rr = R * 1.02 + 3 + k * 1.1 + L * (14 + k * 2.2) * (0.6 + 0.4 * n);
                    const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; s ? x.lineTo(px, py) : x.moveTo(px, py);
                }
                x.strokeStyle = k < 5 ? `rgba(96,165,250,${0.32 - k * 0.03})` : `rgba(236,72,153,${0.3 - (k - 5) * 0.04})`; x.lineWidth = 0.8; x.stroke();
            }
            const gl = x.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * (1.5 + L * 0.5)); gl.addColorStop(0, `rgba(168,85,247,${0.18 + L * 0.25})`); gl.addColorStop(1, 'rgba(168,85,247,0)');
            x.fillStyle = gl; x.beginPath(); x.arc(cx, cy, R * (1.5 + L * 0.5), 0, 6.283); x.fill();
            c.style.transform = 'scale(' + (1 + L * 0.06).toFixed(3) + ')';
            MOV.raf = requestAnimationFrame(micOvLoop);
        }
        // Barcha ovozli tanishlarga ulanish (qidiruv, AI, zamechaniya) — kodni har joyda o'zgartirmasdan
        (function () {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR || !SR.prototype || SR.prototype.__agmk) return;
            const os = SR.prototype.start;
            SR.prototype.__agmk = true;
            SR.prototype.start = function () {
                const me = this;
                if (typeof me.addEventListener === 'function' && !me.__agmkHooked) {
                    me.__agmkHooked = true;
                    const on = (ev, fn) => me.addEventListener(ev, fn);
                    on('audiostart', () => micOvShow(me));
                    on('speechstart', () => { MOV.speak = true; MOV.last = Date.now(); MOV.tgt = 0.6; });
                    on('soundstart', () => { MOV.speak = true; MOV.last = Date.now(); });
                    on('speechend', () => { MOV.speak = false; MOV.tgt = 0.04; });
                    on('soundend', () => { MOV.speak = false; MOV.tgt = 0.04; });
                    on('result', e => { MOV.speak = true; MOV.last = Date.now(); MOV.tgt = 0.55 + Math.random() * 0.4; try { let s = ''; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; if (s && MOV.rec === me) $id('micOvTxt').innerText = s; } catch (er) {} });
                    on('end', () => { if (MOV.rec === me) setTimeout(micOvHide, 350); });
                    on('error', () => { if (MOV.rec === me) micOvHide(); });
                }
                return os.apply(this, arguments);
            };
        })();
        document.addEventListener('visibilitychange', () => { if (document.hidden && MOV.on) micOvStop(); });

        // ---------- Profil sahifasi ----------
        function myXodim() { try { const lk = lookupXodim(currentUser.tabel); return lk.rec ? lk.rec : null; } catch (e) { return null; } }
        function profInitials(n) { const p = String(n || '').trim().split(/\s+/).filter(Boolean); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); }
        function openProfile() { openScreen('screen-profile'); renderProfile(); }
        function renderProfile() {
            const r = myXodim(), it = r ? r.item : {}, t = cleanTabel(currentUser.tabel), acc = (getAccounts() || {})[t] || {};
            const photo = it.photo && it.photo.src ? imgSrc(it.photo) : '';
            const place = r && typeof dbPlaceOf === 'function' ? dbPlaceOf(r) : (r ? r.su : '');
            const ph = [it.phone].concat((it.phones2 || []).map(p => p.num + (p.note ? ' (' + p.note + ')' : ''))).filter(Boolean);
            const row = (v, l) => `<div class="pf-row"><b>${escapeHtml(v || '—')}</b><small>${escapeHtml(l)}</small></div>`;
            const hasPin = !!acc.pin;
            $id('profBody').innerHTML = `<div class="pf-top">
                    <div class="pf-av" onclick="profPhotoPick()">${photo ? `<img src="${photo}" alt="">` : `<span class="pf-ini">${escapeHtml(profInitials(currentUser.name))}</span>`}<span class="pf-cam">📷</span></div>
                    <div class="pf-name">${escapeHtml(currentUser.name || '—')}</div>
                    <div class="pf-role">${escapeHtml(currentUser.role || '')}</div>
                    <div class="pf-on">🟢 tizimda${isAdminReal() ? ' · administrator' : (typeof isRahbar === 'function' && isRahbar() ? ' · rahbar' : '')}</div>
                    ${photo ? `<div class="pf-del" onclick="profPhotoDel()">Rasmni o'chirish</div>` : ''}</div>
                <div class="pf-acts"><button onclick="profPhotoPick()"><span>📷</span>Rasm belgilash</button><button onclick="profEdit()"><span>✏️</span>Ma'lumotni tahrirlash</button><button onclick="openSettings()"><span>⚙️</span>Parametrlar</button></div>
                <div class="pf-card"><h4>MA'LUMOTLAR</h4>
                    ${row(t, 'Tabel raqami')}${row(currentUser.role, 'Lavozim')}${row(place, 'Ish joyi (seh / bo\'lim)')}
                    ${row(ph.join(', ') || "kiritilmagan — «Ma'lumotni tahrirlash» orqali qo'shing", 'Telefon')}
                    ${row(it.birthDate ? fmtISO(it.birthDate) : '', "Tug'ilgan sana")}${row(acc.created ? fmtDateTime(acc.created) : '', "Ro'yxatdan o'tgan")}</div>
                <div class="pf-card"><h4>HISOB</h4>
                    <div class="pf-link" onclick="openPinSetup()">🔢 PIN-kod bilan kirish<i>${hasPin ? 'yoqilgan' : "o'chiq"} ›</i></div>
                    <div class="pf-link" onclick="openAccPw()">🔐 Hisob parolini o'zgartirish<i>›</i></div>
                    <div class="pf-link" onclick="sigOpenMine()">✍️ Mening imzom<i>koʻrish / oʻzgartirish ›</i></div>
                    <div class="pf-link" onclick="micDiag()">🎤 Mikrofonni tekshirish<i>›</i></div>
                    <div class="pf-link red" onclick="logout()">🚪 Hisobdan chiqish<i>›</i></div></div>`;
        }
        function profPhotoPick() { if (!myXodim()) { alert("Xodimlar bazasida hisobingiz topilmadi."); return; } $id('profPhotoInput').click(); }
        function profPhotoSelected(input) {
            const r = myXodim(); if (!r || !input.files || !input.files[0]) { input.value = ''; return; }
            processImage(input.files[0], src => {
                if (!src) return;
                r.item.photo = { src: src, author: authorStr() }; saveDB(); renderProfile(); setTimeout(renderProfile, 600); showToast('📷 Rasm saqlandi');
            });
            input.value = '';
        }
        async function profPhotoDel() { const r = myXodim(); if (!r) return; if (!await uiConfirm("Profil rasmi o'chirilsinmi?")) return; r.item.photo = null; saveDB(); renderProfile(); }
        async function profEdit() {
            const r = myXodim(); if (!r) { alert("Xodimlar bazasida hisobingiz topilmadi."); return; }
            const v = await uiPrompt("📞 Telefon raqamingiz:\n(F.I.Sh., tabel va lavozimni faqat administrator o'zgartiradi)", r.item.phone || '+998 ');
            if (v === null) return;
            const s = String(v).trim(); if (s && !/^[+\d][\d\s()\-]{6,}$/.test(s)) { alert("Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67"); return; }
            r.item.phone = s === '+998' ? '' : s; saveDB(); renderProfile(); showToast('✅ Saqlandi');
        }

        // ---------- Suhbatdagi shar: rasm taglik va shisha qatlami ----------
        (function () {
            aisDraw = agmkExtend('aisDraw', '---------- Suhbatdagi shar: rasm taglik va shisha qatlami ----------', aisDraw, od => function (cv, rot, o) { if (cv && cv.id === 'aiSphBig') o = Object.assign({}, o || {}, { nobase: true }); return od.call(this, cv, rot, o); });
            const cv = $id('aiSphBig');
            if (cv && !cv.parentElement.classList.contains('ai-sph-stage')) {
                const st = document.createElement('div'); st.className = 'ai-sph-stage';
                cv.parentElement.insertBefore(st, cv);
                const pl = document.createElement('img'); pl.className = 'ai-plat'; pl.src = AGMK_IMG.platform; pl.alt = '';
                const gl = document.createElement('img'); gl.className = 'ai-glass'; gl.src = AGMK_IMG.sphGlass; gl.alt = '';
                st.appendChild(pl); st.appendChild(cv); st.appendChild(gl);
            }
            const b = $id('aiGlobal');
            if (b) b.innerHTML = '<img class="ai-glob-img" src="' + AGMK_IMG.sphBlue + '" alt=""><span class="ai-sph-lbl">AI</span>';
            const am = $id('ai-mic-btn'); if (am) am.innerHTML = MIC_IMG;
        })();
        srchInit(); imgFill();

        __lzVar('AGMK_PDF_FONT');
        // Interfeys tarjimalari: o'zbekcha → [inglizcha, ruscha, xitoycha]
        var I18N_D = {
            "Orqaga": ["Back", "Назад", "返回"], "Saqlash": ["Save", "Сохранить", "保存"], "Bekor qilish": ["Cancel", "Отмена", "取消"], "Yopish": ["Close", "Закрыть", "关闭"],
            "O'chirish": ["Delete", "Удалить", "删除"], "Qo'shish": ["Add", "Добавить", "添加"], "Tahrirlash": ["Edit", "Редактировать", "编辑"], "Qidirish": ["Search", "Поиск", "搜索"],
            "Qidirish...": ["Search...", "Поиск...", "搜索..."], "Tozalash": ["Clear", "Очистить", "清除"], "Barchasi": ["All", "Все", "全部"], "Kirish": ["Sign in", "Войти", "登录"],
            "Ha": ["Yes", "Да", "是"], "Yo'q": ["No", "Нет", "否"], "Jami": ["Total", "Всего", "总计"], "Soz": ["OK", "Исправен", "正常"], "Yaqin": ["Due soon", "Скоро", "临近"],
            "Ta'mir talab": ["Repair due", "Требует ремонта", "需维修"], "Tamirda": ["In repair", "В ремонте", "维修中"], "Hozirda Tamirda": ["Now in repair", "Сейчас в ремонте", "正在维修"],
            "Ta'mir sanasi kiritilmagan": ["Repair date not set", "Дата ремонта не указана", "未填写维修日期"],
            "Ishchi xodimlar": ["Employees", "Сотрудники", "员工"], "Seh va uchastkalar": ["Shops and sections", "Цеха и участки", "车间与工段"],
            "Vagonlar parki (Barcha turlar)": ["Wagon fleet (all types)", "Вагонный парк (все типы)", "车辆（全部类型）"], "Vagonlar Parki": ["Wagon Fleet", "Вагонный парк", "车辆车队"], "Vagonlar parki": ["Wagon fleet", "Вагонный парк", "车辆车队"],
            "Temir yo'l harakat tarkibi": ["Railway rolling stock", "Ж/д подвижной состав", "铁路机车车辆"], "Lokomotivlar (Tortuvchi tarkib)": ["Locomotives (traction)", "Локомотивы (тяговый состав)", "机车（牵引）"],
            "Lokomotivlar": ["Locomotives", "Локомотивы", "机车"], "Temir yo'l xaritasi va Stansiyalar": ["Railway map & stations", "Карта ж/д и станции", "铁路地图与车站"], "Temir yo'l xaritasi": ["Railway map", "Карта ж/д", "铁路地图"],
            "Yo'l qurilishi va ta'mirlash": ["Track construction & repair", "Строительство и ремонт пути", "线路建设与维修"], "Infratuzilma: Tayanch va Strelkalar": ["Infrastructure: supports & switches", "Инфраструктура: опоры и стрелки", "基础设施：支柱与道岔"],
            "Avtotraktor parki": ["Vehicle & tractor fleet", "Автотракторный парк", "汽车拖拉机车队"], "Avtotraktor": ["Vehicles", "Автотракторная техника", "汽车拖拉机"], "Avtotraktor texnikasi": ["Vehicles & tractors", "Автотракторная техника", "汽车拖拉机设备"],
            "Yo'l texnikasi": ["Track machinery", "Путевая техника", "线路机械"], "Temir yo'l texnikasi": ["Railway track machinery", "Железнодорожная путевая техника", "铁路线路机械"], "Yo'l texnikalari": ["Track machinery", "Путевая техника", "线路机械"], "Ekskavatorlar parki": ["Excavator fleet", "Парк экскаваторов", "挖掘机车队"],
            "Uskunalar va texnikalar": ["Equipment & machinery", "Оборудование и техника", "设备与机械"], "Kranlar va maxsus texnikalar": ["Cranes & special machinery", "Краны и спецтехника", "起重机与专用机械"],
            "Normativ-huquqiy hujjatlar va aktlar": ["Regulations & acts", "Нормативные документы и акты", "法规文件与记录"], "Normativ hujjatlar": ["Regulations", "Нормативные документы", "法规文件"],
            "Normativ hujjatlar bazasi": ["Regulations database", "База нормативных документов", "法规数据库"], "Ehtiyot qismlar": ["Spare parts", "Запасные части", "备件"],
            "Parametrlar": ["Settings", "Параметры", "设置"], "Profil": ["Profile", "Профиль", "个人资料"], "Profil va parametrlar": ["Profile & settings", "Профиль и параметры", "个人资料与设置"],
            "Shikoyat va takliflar": ["Complaints & suggestions", "Жалобы и предложения", "投诉与建议"], "Umumiy Rahbariyat Nazorati": ["Management oversight", "Контроль руководства", "管理层监督"],
            "Bildirishnomalar": ["Notifications", "Уведомления", "通知"], "Eslatmalar": ["Reminders", "Напоминания", "提醒"], "Harakat tarkibi": ["Rolling stock", "Подвижной состав", "机车车辆"],
            "Harakat jurnali": ["Movement log", "Журнал движения", "运行日志"], "Tarkiblar (poyezdlar)": ["Consists (trains)", "Составы (поезда)", "编组（列车）"], "Stansiyalar kesimida": ["By station", "По станциям", "按车站"],
            "Qaysi stansiya va peregonda nima turibdi": ["What stands at which station and section", "Что на какой станции и перегоне", "各车站及区间的车辆情况"],
            "Vagonlar": ["Wagons", "Вагоны", "车辆"], "Nima qidiryapsiz?...": ["What are you looking for?...", "Что ищете?...", "您要找什么？..."],
            "Vagon raqami, Inventar yoki Tartib №...": ["Wagon no., inventory or order no....", "№ вагона, инвентарный или порядковый №...", "车号、资产号或序号..."],
            "Zavod №, inventar №, seriya yoki yil...": ["Serial no., inventory no., series or year...", "Заводской №, инв. №, серия или год...", "出厂号、资产号、系列或年份..."],
            "Davlat raqami, inventar, marka yoki yil...": ["Plate, inventory, make or year...", "Госномер, инвентарный, марка или год...", "车牌、资产号、品牌或年份..."],
            "Marka, zavod №, inventar yoki yil...": ["Make, serial no., inventory or year...", "Марка, заводской №, инв. или год...", "品牌、出厂号、资产号或年份..."],
            "Stansiya yoki peregon nomi...": ["Station or section name...", "Название станции или перегона...", "车站或区间名称..."], "Nomi bo'yicha qidirish...": ["Search by name...", "Поиск по названию...", "按名称搜索..."],
            "Raqam, nomi yoki joyi...": ["Number, name or place...", "Номер, название или место...", "编号、名称或位置..."], "Hujjat, punkt yoki akt bo'yicha qidirish...": ["Search documents, clauses or acts...", "Поиск по документу, пункту или акту...", "搜索文件、条款或记录..."],
            "Nomi, o'lchami (M20, Ø50, δ14)...": ["Name, size (M20, Ø50, δ14)...", "Название, размер (M20, Ø50, δ14)...", "名称、尺寸（M20, Ø50, δ14）..."], "Lavozimni qidirish...": ["Search positions...", "Поиск должности...", "搜索职位..."],
            "Xodim: F.I.O, tabel, telefon yoki lavozim...": ["Employee: name, ID, phone or position...", "Сотрудник: ФИО, табель, телефон или должность...", "员工：姓名、工号、电话或职位..."],
            "Raqam, lavozim yoki bo'lim bo'yicha qidiring...": ["Search by number, position or department...", "Поиск по номеру, должности или отделу...", "按编号、职位或部门搜索..."],
            "Pasport, Rasmlar va Ta'mirlar Tarixi": ["Passport, photos & repair history", "Паспорт, фото и история ремонтов", "档案、照片与维修记录"],
            "Inventar:": ["Inventory:", "Инв.:", "资产号："], "Model:": ["Model:", "Модель:", "型号："], "Seh:": ["Shop:", "Цех:", "车间："], "Yoshi:": ["Age:", "Возраст:", "年限："], "Seriya:": ["Series:", "Серия:", "系列："],
            "Qurilgan:": ["Built:", "Построен:", "制造："], "Ishga tushgan:": ["Commissioned:", "Введён:", "投运："], "Keyingi:": ["Next:", "Следующий:", "下次："], "Oxirgi DR:": ["Last DR:", "Последний ДР:", "上次DR："],
            "Oxirgi ta'mir:": ["Last repair:", "Последний ремонт:", "上次维修："], "Xizmat muddati:": ["Service life:", "Срок службы:", "使用期限："], "Yili:": ["Year:", "Год:", "年份："], "Reg:": ["Reg.:", "Рег.:", "登记："], "Yuk:": ["Load:", "Груз:", "载重："],
            "Keyingi (PPR):": ["Next (PPR):", "Следующий (ППР):", "下次（计划）："], "Keyingi (reja):": ["Next (plan):", "Следующий (план):", "下次（计划）："],
            "Ehtiyot qismlar": ["Spare parts", "Запасные части", "备件"], "Tahrirlash": ["Edit", "Редактировать", "编辑"], "Tamirga yuborish": ["Send to repair", "Отправить в ремонт", "送修"],
            "Vagon Pasporti va Holati": ["Wagon passport & status", "Паспорт и состояние вагона", "车辆档案与状态"], "Lokomotiv Pasporti va Holati": ["Locomotive passport & status", "Паспорт и состояние локомотива", "机车档案与状态"],
            "Texnika Pasporti va Holati": ["Machine passport & status", "Паспорт и состояние техники", "设备档案与状态"], "Kartoteka ma'lumotlari (Excel)": ["Card index data (Excel)", "Данные картотеки (Excel)", "档案数据（Excel）"],
            "Vagon Rasmlari Galereyasi": ["Wagon photo gallery", "Галерея фото вагона", "车辆照片库"], "Lokomotiv Rasmlari Galereyasi": ["Locomotive photo gallery", "Галерея фото локомотива", "机车照片库"], "Texnika Rasmlari Galereyasi": ["Machine photo gallery", "Галерея фото техники", "设备照片库"],
            "Barcha O'tkazilgan Ta'mirlar Tarixi (Jurnal)": ["Full repair history (log)", "История всех ремонтов (журнал)", "全部维修记录（日志）"], "Yangi Ta'mirni Tarixga Kiritish": ["Add repair to history", "Внести ремонт в историю", "添加维修记录"],
            "Ta'mirni Tarixga Saqlash": ["Save repair to history", "Сохранить ремонт в историю", "保存维修记录"], "Tarix mavjud emas": ["No history", "Истории нет", "无记录"], "Rasmlar yo'q": ["No photos", "Нет фото", "无照片"],
            "Fayllarni tanlash": ["Choose files", "Выбрать файлы", "选择文件"], "Kamera": ["Camera", "Камера", "相机"], "Fayl": ["File", "Файл", "文件"],
            "Ta'mir turi": ["Repair type", "Вид ремонта", "维修类型"], "Ta'mirlangan sana": ["Repair date", "Дата ремонта", "维修日期"], "Zamechaniya berish": ["Issue a remark", "Выдать замечание", "提出整改意见"],
            "Rahbariyat nazorati — zamechaniyalar": ["Management oversight — remarks", "Контроль руководства — замечания", "管理层监督 — 整改意见"], "Bu vagon bo'yicha zamechaniya yo'q.": ["No remarks for this wagon.", "По этому вагону замечаний нет.", "该车辆无整改意见。"],
            "INVENTAR №:": ["INVENTORY NO.:", "ИНВ. №:", "资产号："], "VAGON MODELI": ["WAGON MODEL", "МОДЕЛЬ ВАГОНА", "车辆型号"], "ISHLAB CHIQARILGAN YILI:": ["YEAR BUILT:", "ГОД ВЫПУСКА:", "制造年份："], "SEH:": ["SHOP:", "ЦЕХ:", "车间："],
            "OXIRGI TA'MIR TURI:": ["LAST REPAIR TYPE:", "ПОСЛЕДНИЙ РЕМОНТ:", "上次维修类型："], "OXIRGI TA'MIR SANASI:": ["LAST REPAIR DATE:", "ДАТА ПОСЛ. РЕМОНТА:", "上次维修日期："], "HOLAT:": ["STATUS:", "СОСТОЯНИЕ:", "状态："],
            "KEYINGI TA'MIR SANASI:": ["NEXT REPAIR DATE:", "ДАТА СЛЕД. РЕМОНТА:", "下次维修日期："], "NOMI VA TURI:": ["NAME & TYPE:", "НАИМЕНОВАНИЕ И ТИП:", "名称与类型："], "MODEL:": ["MODEL:", "МОДЕЛЬ:", "型号："],
            "ISHLAB CHIQARUVCHI:": ["MANUFACTURER:", "ИЗГОТОВИТЕЛЬ:", "制造商："], "ZAVOD / BORT №:": ["SERIAL NO.:", "ЗАВОДСКОЙ №:", "出厂号："], "QO'LLANILISHI:": ["APPLICATION:", "ПРИМЕНЕНИЕ:", "用途："],
            "OXIRGI KAPITAL TA'MIR (KR):": ["LAST OVERHAUL (KR):", "ПОСЛЕДНИЙ КР:", "上次大修（KR）："], "DR DAVRIYLIGI:": ["DR INTERVAL:", "ПЕРИОДИЧНОСТЬ ДР:", "DR周期："],
            "Vagon Pasportini Tahrirlash": ["Edit wagon passport", "Редактирование паспорта вагона", "编辑车辆档案"], "Vagon Raqami (ID):": ["Wagon number (ID):", "Номер вагона (ID):", "车号（ID）："],
            "Inventar №:": ["Inventory no.:", "Инвентарный №:", "资产号："], "Vagon Modeli:": ["Wagon model:", "Модель вагона:", "车辆型号："], "Vagon Holati (Guruh):": ["Wagon status (group):", "Состояние вагона (группа):", "车辆状态（组）："],
            "Ishlab chiqarilgan yili:": ["Year built:", "Год выпуска:", "制造年份："], "Oxirgi ta'mir turi:": ["Last repair type:", "Вид последнего ремонта:", "上次维修类型："], "Oxirgi ta'mir sanasi:": ["Last repair date:", "Дата последнего ремонта:", "上次维修日期："],
            "Keyingi ta'mir sanasi:": ["Next repair date:", "Дата следующего ремонта:", "下次维修日期："], "Yangi Vagon Qo'shish": ["Add new wagon", "Добавить вагон", "添加新车辆"],
            "Yangi lokomotiv qo'shish": ["Add new locomotive", "Добавить локомотив", "添加新机车"], "Seriyasi:": ["Series:", "Серия:", "系列："], "Zavod (bort) №:": ["Serial no.:", "Заводской №:", "出厂号："],
            "Qurilgan yili:": ["Year built:", "Год постройки:", "制造年份："], "Foydalanishga kiritilgan yili:": ["Year commissioned:", "Год ввода:", "投运年份："], "Seh / uchastka:": ["Shop / section:", "Цех / участок:", "车间/工段："], "Holati:": ["Status:", "Состояние:", "状态："],
            "Profil": ["Profile", "Профиль", "个人资料"], "Rasm belgilash": ["Set photo", "Установить фото", "设置头像"], "Ma'lumotni tahrirlash": ["Edit info", "Изменить данные", "编辑资料"], "Rasmni o'chirish": ["Remove photo", "Удалить фото", "删除照片"],
            "MA'LUMOTLAR": ["DETAILS", "ДАННЫЕ", "资料"], "HISOB": ["ACCOUNT", "АККАУНТ", "账户"], "Tabel raqami": ["Employee ID", "Табельный номер", "工号"], "Lavozim": ["Position", "Должность", "职位"],
            "Ish joyi (seh / bo'lim)": ["Workplace (shop / dept.)", "Место работы (цех / отдел)", "工作单位（车间/部门）"], "Telefon": ["Phone", "Телефон", "电话"], "Tug'ilgan sana": ["Date of birth", "Дата рождения", "出生日期"],
            "Ro'yxatdan o'tgan": ["Registered", "Зарегистрирован", "注册时间"], "PIN-kod bilan kirish": ["PIN sign-in", "Вход по PIN-коду", "PIN码登录"], "Hisob parolini o'zgartirish": ["Change account password", "Изменить пароль", "修改账户密码"],
            "Mikrofonni tekshirish": ["Check microphone", "Проверить микрофон", "检查麦克风"], "Hisobdan chiqish": ["Sign out", "Выйти из аккаунта", "退出账户"],
            "Shtatlar ro'yxati": ["Staff list", "Штатное расписание", "编制名单"], "Shtatlar uchun parol o'rnatish": ["Set staff list password", "Установить пароль для штатов", "设置编制密码"], "Shtatlar parolini o'zgartirish": ["Change staff list password", "Изменить пароль штатов", "修改编制密码"],
            "Tabel raqamini o'zgartirish": ["Change employee ID", "Изменить табельный номер", "修改工号"], "Parol va tug'ilgan sana bilan tasdiqlanadi": ["Confirmed by password and date of birth", "Подтверждается паролем и датой рождения", "需密码和出生日期确认"],
            "Tarqatish uchun fayl": ["Distribution file", "Файл для рассылки", "分发文件"], "Parollar jurnali": ["Password log", "Журнал паролей", "密码日志"], "Aloqa ma'lumotlari": ["Contact details", "Контактные данные", "联系方式"],
            "Sun'iy intellekt (AI) ulanishi": ["Artificial intelligence (AI) connection", "Подключение ИИ", "人工智能（AI）连接"], "Xavfsizlik jurnali": ["Security log", "Журнал безопасности", "安全日志"],
            "Ma'lumotlar: eksport va zaxira": ["Data: export & backup", "Данные: экспорт и резерв", "数据：导出与备份"], "Vagonlar — Excel (CSV)": ["Wagons — Excel (CSV)", "Вагоны — Excel (CSV)", "车辆 — Excel（CSV）"],
            "Barcha vagonlar ro'yxatini Excel faylga yuklab olish": ["Download the full wagon list to Excel", "Скачать список вагонов в Excel", "将全部车辆导出为Excel"], "Zaxira nusxa": ["Backup", "Резервная копия", "备份"],
            "Barcha ma'lumotlarni faylga saqlash": ["Save all data to a file", "Сохранить все данные в файл", "将全部数据保存为文件"], "Zaxiradan tiklash": ["Restore from backup", "Восстановить из резерва", "从备份恢复"],
            "Ovozli qidiruv nima uchun ishlamasligini aniqlash": ["Find out why voice search does not work", "Узнать, почему не работает голосовой поиск", "排查语音搜索问题"],
            "Til": ["Language", "Язык", "语言"], "Interfeys tili": ["Interface language", "Язык интерфейса", "界面语言"],
            "AI Yordamchi": ["AI Assistant", "ИИ-помощник", "AI助手"], "Salom! Qanday yordam kerak?": ["Hello! How can I help?", "Здравствуйте! Чем помочь?", "您好！需要什么帮助？"],
            "Savol yozing...": ["Type a question...", "Напишите вопрос...", "输入问题..."], "Tez savollar": ["Quick questions", "Быстрые вопросы", "快捷问题"], "Ovozli javob": ["Voice reply", "Голосовой ответ", "语音回复"], "Ovozsiz": ["Muted", "Без звука", "静音"],
            "Mahalliy AI · internetsiz, xavfsiz": ["Local AI · offline, secure", "Локальный ИИ · без интернета, безопасно", "本地AI · 离线、安全"], "Jonli suhbat": ["Live conversation", "Живой диалог", "实时对话"],
            "Xodimlar, texnika, ta'mir muddatlari, normativlar, ehtiyot qismlar — bazadan topib beraman. Yozing yoki 🎙 bosib gapiring.": ["Employees, machinery, repair dates, regulations, spare parts — I will find them in the database. Type or tap 🎙 and speak.", "Сотрудники, техника, сроки ремонта, нормативы, запчасти — найду в базе. Напишите или нажмите 🎙 и говорите.", "员工、设备、维修期限、法规、备件——我都能在数据库中找到。请输入或点击🎙说话。"],
            "Gapiring...": ["Speak...", "Говорите...", "请说话..."], "To'xtatish": ["Stop", "Стоп", "停止"],
            "Akt / dalolatnoma tuzish (AI)": ["Draw up an act (AI)", "Составить акт (ИИ)", "编制记录（AI）"], "Akt / dalolatnoma tuzish": ["Draw up an act", "Составление акта", "编制记录"], "Akt tuzish (AI)": ["Act drafting (AI)", "Составление акта (ИИ)", "编制记录（AI）"],
            "Aktlar arxivi": ["Acts archive", "Архив актов", "记录档案"], "Imzo chekuvchilar": ["Signatories", "Подписанты", "签署人"], "AI bilan akt tuzish": ["Draft the act with AI", "Составить акт с ИИ", "用AI编制记录"],
            "AKT TURI": ["ACT TYPE", "ТИП АКТА", "记录类型"], "TASDIQLOVCHI («Tasdiqlayman» qismi)": ["APPROVER («I approve» block)", "УТВЕРЖДАЮЩИЙ (блок «Утверждаю»)", "批准人（“批准”栏）"],
            "KOMISSIYA A'ZOLARI (imzo chekuvchilar)": ["COMMISSION MEMBERS (signatories)", "ЧЛЕНЫ КОМИССИИ (подписанты)", "委员会成员（签署人）"], "Chop etish": ["Print", "Печать", "打印"],
            "PDF yuklab olish": ["Download PDF", "Скачать PDF", "下载PDF"], "Arxivga saqlash": ["Save to archive", "Сохранить в архив", "保存到档案"], "AI bilan matnni mukammallashtirish": ["Polish the text with AI", "Улучшить текст с ИИ", "用AI润色文本"],
            "Namunani qo'yish": ["Insert sample", "Вставить образец", "插入示例"], "Tasdiqlovchi": ["Approver", "Утверждающий", "批准人"],
            "Materiallar va ehtiyot qismlar sarfi me'yori": ["Material & spare parts consumption norms", "Нормы расхода материалов и запчастей", "材料与备件消耗定额"], "Me'yor hali kiritilmagan": ["Norms not entered yet", "Нормы ещё не внесены", "尚未录入定额"],
            "Nechta dumpkar ta'miri uchun?": ["For how many dump cars?", "На сколько думпкаров?", "多少辆自翻车？"], "Zayavka / PDF": ["Request / PDF", "Заявка / PDF", "申请单 / PDF"],
            "Eksport": ["Export", "Экспорт", "导出"], "Tiklash": ["Restore", "Восстановить", "恢复"], "Yangi lokomotiv": ["New locomotive", "Новый локомотив", "新机车"],
            "Lokomotivlar: ta'mir muddati": ["Locomotives: repair due", "Локомотивы: сроки ремонта", "机车：维修期限"], "Ro'yxatda ko'rsatish": ["Show in list", "Показать в списке", "在列表中显示"],
            "Tizimga kirish": ["Sign in", "Вход в систему", "登录系统"], "Tabel raqami:": ["Employee ID:", "Табельный номер:", "工号："], "Parol:": ["Password:", "Пароль:", "密码："], "Parolni unutdingizmi?": ["Forgot password?", "Забыли пароль?", "忘记密码？"],
            "Ro'yxatdan o'tish": ["Register", "Регистрация", "注册"], "PIN-kodni kiriting": ["Enter PIN", "Введите PIN-код", "输入PIN码"], "Boshqa hisob": ["Other account", "Другой аккаунт", "其他账户"], "PIN-kodni unutdingizmi?": ["Forgot PIN?", "Забыли PIN-код?", "忘记PIN码？"],
            "Qatlamlar": ["Layers", "Слои", "图层"], "Bo'limlar": ["Sections", "Разделы", "分区"], "yuqoriga suring": ["swipe up", "проведите вверх", "向上滑动"], "Markaziy uchastka": ["Central section", "Центральный участок", "中央区段"],
            "Umumiy ma'lumot": ["General information", "Общие сведения", "概况"], "Belgilar izohi": ["Legend", "Условные обозначения", "图例"], "Kirish yo'llari va depolar": ["Access tracks & depots", "Подъездные пути и депо", "专用线与车库"],
            "Men qayerdaman / eng yaqin stansiya": ["Where am I / nearest station", "Где я / ближайшая станция", "我的位置/最近车站"], "Aylanib chiqish (obxod) rejimi": ["Inspection walk mode", "Режим обхода", "巡检模式"],
            "Harakat": ["Movement", "Движение", "运行"], "Joylashuv va holat": ["Location & status", "Местоположение и состояние", "位置与状态"], "Nazorat": ["Control", "Контроль", "监控"], "Ta'minot": ["Supply", "Снабжение", "供应"],
            "Ovozli qidiruv": ["Voice search", "Голосовой поиск", "语音搜索"], "Ortga qaytarish": ["Undo", "Отменить", "撤销"], "Oldinga qaytarish": ["Redo", "Повторить", "重做"],
            "Metall prokat": ["Rolled metal", "Металлопрокат", "金属型材"], "Mahkamlagichlar": ["Fasteners", "Крепёж", "紧固件"], "Vtulka va valiklar": ["Bushings & pins", "Втулки и валики", "衬套与销轴"], "Tormoz va pnevmatika": ["Brakes & pneumatics", "Тормоза и пневматика", "制动与气动"],
            "Elektr": ["Electrical", "Электрика", "电气"], "Payvandlash va sarf": ["Welding & consumables", "Сварка и расходники", "焊接与耗材"], "Boshqa": ["Other", "Прочее", "其他"],
            "Dumpkar 2VS-105": ["Dump car 2VS-105", "Думпкар 2ВС-105", "自翻车2VS-105"], "Dumpkar 6VS-60": ["Dump car 6VS-60", "Думпкар 6ВС-60", "自翻车6VS-60"], "Yopiq yuk vagoni": ["Covered wagon", "Крытый вагон", "棚车"],
            "Poluvagon": ["Gondola", "Полувагон", "敞车"], "Sisterna": ["Tank car", "Цистерна", "罐车"], "Platforma": ["Flat car", "Платформа", "平车"], "Xopper": ["Hopper", "Хоппер", "漏斗车"], "Izotermik/ Refrijeratli vagon": ["Isothermal / reefer", "Изотермический / рефрижератор", "保温/冷藏车"], "Yo'lovchi vagoni": ["Passenger car", "Пассажирский вагон", "客车"],
            "Frontal yuklagichlar": ["Front loaders", "Фронтальные погрузчики", "前装载机"], "Vilkali yuklagichlar": ["Forklifts", "Вилочные погрузчики", "叉车"], "Buldozer va ekskavator": ["Bulldozers & excavators", "Бульдозеры и экскаваторы", "推土机与挖掘机"], "Traktorlar": ["Tractors", "Тракторы", "拖拉机"],
            "Tirkamalar": ["Trailers", "Прицепы", "挂车"], "Yuk avtomobillari": ["Trucks", "Грузовики", "卡车"], "Avtobus va vaxtovkalar": ["Buses & crew vehicles", "Автобусы и вахтовки", "客车与通勤车"], "Yengil avtomobillar": ["Cars", "Легковые автомобили", "轿车"], "Maxsus texnika": ["Special machinery", "Спецтехника", "专用机械"], "Mototsikllar": ["Motorcycles", "Мотоциклы", "摩托车"],
            "Rahbariyat nazorati": ["Management oversight", "Контроль руководства", "管理层监督"], "tizimda": ["online", "в системе", "在线"], "rahbar": ["manager", "руководитель", "负责人"], "administrator": ["administrator", "администратор", "管理员"],
            "Bosing — savol · Ushlab turing — jonli suhbat": ["Tap — question · Hold — live conversation", "Нажмите — вопрос · Удерживайте — живой диалог", "点按 — 提问 · 长按 — 实时对话"], "Rejani tahrirlash": ["Edit plan", "Редактировать план", "编辑计划"], "Qator qo'shish": ["Add row", "Добавить строку", "添加行"],
            "Ta'mir talab: ": ["Repair due: ", "Требует ремонта: ", "需维修："], "Tamirga": ["To repair", "В ремонт", "送修"]
        };
        // Takrorlanuvchi (raqamli) iboralar
        var I18N_R = [
            [/^(Soz|Yaqin|Ta'mir talab) \((\d+) kun\)$/, (m, L) => ({ 'Soz': ['OK', 'Исправен', '正常'], 'Yaqin': ['Due soon', 'Скоро', '临近'], "Ta'mir talab": ['Repair due', 'Требует ремонта', '需维修'] }[m[1]][L] + ' (' + [m[2] + ' days', m[2] + ' дн.', m[2] + '天'][L] + ')')],
            [/^Ta'mir talab \((\d+) kun o'tdi\)$/, (m, L) => ['Repair due (' + m[1] + ' days overdue)', 'Требует ремонта (просрочено ' + m[1] + ' дн.)', '需维修（逾期' + m[1] + '天）'][L]],
            [/^Ta'mir talab \((\d+) kun qoldi\)$/, (m, L) => ['Repair due (' + m[1] + ' days left)', 'Требует ремонта (осталось ' + m[1] + ' дн.)', '需维修（剩余' + m[1] + '天）'][L]],
            [/^Topildi: (\d+) ta vagon \((\d+) tasi ko'rsatilmoqda\)$/, (m, L) => ['Found: ' + m[1] + ' wagons (showing ' + m[2] + ')', 'Найдено: ' + m[1] + ' вагонов (показано ' + m[2] + ')', '找到：' + m[1] + '辆（显示' + m[2] + '辆）'][L]],
            [/^Topildi: (\d+) ta vagon$/, (m, L) => ['Found: ' + m[1] + ' wagons', 'Найдено: ' + m[1] + ' вагонов', '找到：' + m[1] + '辆'][L]],
            [/^Topildi: (\d+) ta tortuvchi agregat$/, (m, L) => ['Found: ' + m[1] + ' traction units', 'Найдено: ' + m[1] + ' тяговых агрегатов', '找到：' + m[1] + '台牵引机组'][L]],
            [/^Topildi: (\d+) ta texnika$/, (m, L) => ['Found: ' + m[1] + ' machines', 'Найдено: ' + m[1] + ' ед. техники', '找到：' + m[1] + '台设备'][L]],
            [/^Topildi: (\d+) ta$/, (m, L) => ['Found: ' + m[1], 'Найдено: ' + m[1], '找到：' + m[1]][L]],
            [/^Vagon № (.+)$/, (m, L) => ['Wagon No. ', 'Вагон № ', '车辆 № '][L] + m[1]],
            [/^\| (.+):$/, (m, L) => { const t = i18nWord(m[1] + ':', L); return t ? '| ' + t : null; }],
            [/^Bo'lim: (.+)$/, (m, L) => ['Section: ', 'Раздел: ', '分区：'][L] + (i18nWord(m[1], L) || m[1])],
            [/^Yana ko'rsatish \((\d+)\)$/, (m, L) => ['Show more (' + m[1] + ')', 'Показать ещё (' + m[1] + ')', '显示更多（' + m[1] + '）'][L]],
            [/^(\d+) ta tuzilgan akt$/, (m, L) => [m[1] + ' acts drawn up', 'Составлено актов: ' + m[1], '已编制' + m[1] + '份记录'][L]],
            [/^Ta'mir talab: (\d+) ta · Muddati yaqin: (\d+) ta$/, (m, L) => ['Repair due: ' + m[1] + ' · Due soon: ' + m[2], 'Требуют ремонта: ' + m[1] + ' · Скоро: ' + m[2], '需维修：' + m[1] + ' · 临近：' + m[2]][L]]
        ];
