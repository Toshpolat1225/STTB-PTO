        // =====================================================================
        // 6.2 — «Dalolatnoma va hujjatlar tayyorlash»: yoʻnalishlar boʻyicha boʻlimlar (muallif, 16.11.2026)
        //  • Boʻlimga kirilganda tepada yorliqlar yoʻq — ICHTB ning 10 ta yoʻnalishi roʻyxati.
        //  • Yoʻnalishga kirilganda 3 ta tugma: «📄 Dalolatnoma tayyorlash», «📊 Hisobotlar», «📅 Haftalik rasxod».
        //    Alohida «Imzoga yuborish» tugmasi yoʻq — hujjat yuklash va imzoga yuborish «Dalolatnoma tayyorlash» ichida.
        //  • Muallifning hozirgi dalolatnomalari — «Temir yoʻl harakat tarkibi» yoʻnalishida.
        //  • Kirish: ICHTB xodimlari (vaqtincha buyruqlar sababli hamma yoʻnalishni koʻradi), rahbariyat va administrator.
        //    ICHTB ga tegishli boʻlmagan xodim kira olmaydi. Yoʻnalish maʼlumotlari (kv:agmk_yon_*) serverda ham faqat shu rollarga.
        // =====================================================================
        const Y62: any = window as any;
        var YON_LIST = [
            { k: 'vag', ic: '🚃', t: 'Temir yoʻl harakat tarkibi', cat: 'vagon' },
            { k: 'smb', ic: '📡', t: 'Avtomatlashtirish (SMB va aloqa)' },
            { k: 'qur', ic: '🛤', t: 'Temir yoʻl qurilishi' },
            { k: 'tep', ic: '🚂', t: 'Lokomotivlar (teplovozlar)', cat: 'tep' },
            { k: 'tor', ic: '⚡', t: 'Lokomotivlar (tortuv agregatlari)' },
            { k: 'tex', ic: '🚜', t: 'Temir yoʻl texnikalari' },
            { k: 'avt', ic: '🚗', t: 'Avtotransport', cat: 'avto' },
            { k: 'met', ic: '📏', t: 'Metrologiya' },
            { k: 'kon', ic: '🔌', t: 'Kontakt tarmogʻi' },
            { k: 'tjn', ic: '🧭', t: 'Texnologik jarayon nazorati' },
        ];
        var YON_TABS = [['akt', '📄 Dalolatnoma tayyorlash'], ['hisob', '📊 Hisobotlar'], ['haft', '📅 Haftalik rasxod']];
        var YON_LAST = 'vag';
        var YON_TITLE = '📄 Dalolatnoma va hujjatlar tayyorlash';
        function yonGet(k?: string): any { return YON_LIST.find(x => x.k === (k || (Y62.HS && Y62.HS.yon))) || null; }
        // ICHTB aʼzosimi — shtat tuzilmasidagi oʻrni boʻyicha (serverda ham xuddi shunday tekshiriladi)
        function yonIchtb(): boolean | null {
            try {
                const u: any = Y62.currentUser || {}, tb = typeof Y62.cleanTabel === 'function' ? Y62.cleanTabel(u.tabel) : String(u.tabel || '');
                const T: any = typeof Y62.shtatTree !== 'undefined' ? Y62.shtatTree : (typeof shtatTree !== 'undefined' ? shtatTree : null);
                const X = typeof Y62.allXodims === 'function' ? Y62.allXodims() : [];
                if (!T || !T.pos || !X || !X.length) return null; // tuzilma yoʻq — aniqlab boʻlmaydi
                const x = X.find((z: any) => z && z.item && (typeof Y62.cleanTabel === 'function' ? Y62.cleanTabel(z.item.tabel) : String(z.item.tabel)) === tb);
                if (!x || !x.item.posNo) return null;
                const p = T.pos.find((q: any) => String(q.no) === String(x.item.posNo)); if (!p) return null;
                const g = p.g ? (T.groups || []).find((q: any) => q.id === p.g) : null, un = (T.units || []).find((q: any) => q.id === p.u);
                const s = [(g && g.name) || '', (un && (un.name || '')) || '', (un && (un.short || '')) || ''].join(' | ');
                return /ishlab\s*chiqarish.{0,3}texnik|\bichtb\b|\bичтб\b|\bпто\b/i.test(s);
            } catch (e) { return null; }
        }
        function yonOk(): boolean {
            try { if (typeof Y62.isAdminReal === 'function' && Y62.isAdminReal()) return true; } catch (e) { /* */ }
            try { if (typeof Y62.hasRoleReal === 'function' && Y62.hasRoleReal('rahbar')) return true; } catch (e) { /* */ }
            const r = yonIchtb();
            return r !== false; // aniqlab boʻlmasa (tuzilma yuklanmagan) — server baribir maʼlumotni tekshiradi
        }
        function yonPick(k: string) {
            const H = Y62.HS; if (!H) return;
            H.yon = k; YON_LAST = k; H.tab = 'akt'; H.akt = null; H.chk = null; H.cat = null;
            try { if (typeof Y62.aiLog === 'function') Y62.aiLog('Yoʻnalish ochildi: ' + (yonGet(k) || {}).t); } catch (e) { /* */ }
            Y62.hsRender();
        }
        function yonBack() { const H = Y62.HS; if (!H) return; H.yon = null; H.akt = null; H.chk = null; H.cat = null; Y62.hsRender(); }
        function yonTab(t: string) {
            const H = Y62.HS; if (!H) return; const Yc = yonGet();
            if (typeof Y62.hsTab === 'function') Y62.hsTab(t); else { H.tab = t; H.akt = null; H.chk = null; H.cat = null; Y62.hsRender(); }
            if (t === 'hisob' && Yc && Yc.cat && !H.cat) { H.cat = Yc.cat; Y62.hsRender(); }
        }
        // «‹ Orqaga» (ekrandagi tugma ham, telefonning orqaga tugmasi ham) — bir qadam orqaga:
        //  ichki sahifa (akt turi, tekshiruv, kategoriya) → yoʻnalish sahifasi → yoʻnalishlar roʻyxati → bosh sahifa
        function yonStep() {
            const H = Y62.HS, scr = Y62.$id && Y62.$id('screen-hisob');
            try {
                const hb: any = scr && scr.querySelector('.sec-body .hs-back');
                if (hb && hb.offsetParent !== null && (H.akt || H.chk || H.cat)) { hb.click(); return; }
                if (H && (H.akt || H.chk || H.cat)) { H.akt = null; H.chk = null; H.cat = null; Y62.hsRender(); return; }
                if (H && H.tab === 'up') { if (Y62.UP && Y62.UP.st && Y62.UP.st !== 'home') { Y62.UP.st = 'home'; Y62.hsRender(); return; } yonTab('akt'); return; }
                if (H && H.yon) { yonBack(); return; }
            } catch (e) { console.error(e); }
            Y62.openScreen('screen-main');
        }
        function yonBackBtn() {
            try { const bb: any = document.querySelector('#screen-hisob .back-btn'); if (bb && bb.getAttribute('onclick') !== 'yonStep()') bb.setAttribute('onclick', 'yonStep()'); } catch (e) { /* */ }
        }
        function yonTitle() { yonBackBtn(); try { const t = document.querySelector('#screen-hisob .sec-title'); if (t && t.textContent !== YON_TITLE) t.textContent = YON_TITLE; } catch (e) { /* */ } }
        function yonListHtml(): string {
            const E = Y62.escapeHtml;
            return `<div class="yon62"><div class="yon62-tip">Yoʻnalishni tanlang. Har bir yoʻnalishda: dalolatnoma tayyorlash, hisobotlar va haftalik rasxod.</div>
                <div class="yon62-grid">${YON_LIST.map(x => `<div class="yon62-c" data-yon="${x.k}" onclick="yonPick('${x.k}')"><b>${x.ic}</b><span>${E(x.t)}</span><i>›</i></div>`).join('')}</div>
                <div class="yon62-foot">🔒 Boʻlim faqat ICHTB xodimlari uchun. Har bir oʻzgarish kim va qachon kiritgani bilan saqlanadi.</div></div>`;
        }
        function yonCrumb(): string {
            const Yc = yonGet(), E = Y62.escapeHtml; if (!Yc) return '';
            return `<div class="yon62-crumb" onclick="yonBack()">‹ Yoʻnalishlar <b>${Yc.ic} ${E(Yc.t)}</b></div>`;
        }
        function yonUpCard(): string {
            return `<div class="yon62-up" onclick="yonTab('up')"><b>📤</b><div><span>Hujjat yuklash va imzoga yuborish</span><small>Word, PDF yoki rasm — familiyalar va sanalar topiladi, tekshirib imzoga yuborasiz</small></div><i>›</i></div>`;
        }
        if (typeof Y62.hsRender === 'function') Y62.hsRender = Y62.agmkExtend('hsRender', '6.2: yoʻnalishlar boʻyicha boʻlimlar', Y62.hsRender, (o: Function) => function (this: unknown) {
            const H = Y62.HS, scr = Y62.$id && Y62.$id('screen-hisob'); if (!H || !scr) return o.apply(this, arguments);
            yonTitle();
            const tabsEl = scr.querySelector('.sec-tabs'), body = Y62.secBody('screen-hisob');
            if (!yonOk()) { if (tabsEl) tabsEl.innerHTML = ''; body.innerHTML = '<div class="yon62-lock">🔒 Bu boʻlim faqat ICHTB (Ishlab chiqarish-texnik boʻlimi) xodimlari uchun.</div>'; return; }
            if (!H.yon && (H.akt || H.chk || H.cat || H.pend || H.tab === 'up')) H.yon = YON_LAST; // ichki holat oldindan qoʻyilgan (bildirishnoma, AI, Mening ishlarim) — oxirgi yoʻnalishda
            if (!H.yon) { if (tabsEl) tabsEl.innerHTML = ''; body.innerHTML = yonListHtml(); return; }
            const Yc = yonGet();
            if (Yc && Yc.k !== 'vag' && H.tab === 'akt' && !H.akt) { // boshqa yoʻnalishlar: oʻz shablonlari hujjatlari kelgach qoʻshiladi
                Y62.secTabs('screen-hisob', YON_TABS, 'akt', 'yonTab');
                body.innerHTML = yonCrumb() + yonUpCard() + `<div class="nd-tip">«${Y62.escapeHtml(Yc.t)}» yoʻnalishining dalolatnoma shablonlari yoʻnalish hujjatlari asosida qoʻshiladi. Hozircha istalgan hujjatni yuklab, tahrirlab, imzoga yuborishingiz mumkin.</div>`;
                return;
            }
            const r = o.apply(this, arguments);
            try {
                Y62.secTabs('screen-hisob', YON_TABS, H.tab === 'up' ? 'akt' : H.tab, 'yonTab');
                if (body && !body.querySelector('.yon62-crumb')) body.insertAdjacentHTML('afterbegin', yonCrumb() + (H.tab === 'akt' && !H.akt ? yonUpCard() : ''));
            } catch (e) { /* */ }
            return r;
        });
        if (typeof Y62.openHisob === 'function') Y62.openHisob = Y62.agmkExtend('openHisob', '6.2: yoʻnalishlar roʻyxatidan boshlanadi', Y62.openHisob, (o: Function) => function (this: unknown, tab?: string) {
            try {
                const H = Y62.HS;
                if (H) { // chaqiruvchi aniq joyni koʻrsatgan boʻlsa (Mening ishlarim, AI, bildirishnoma) — oxirgi yoʻnalishda ochiladi
                    const deep = !!(tab || H.keep || H.akt || H.chk || H.pend);
                    H.yon = deep ? (H.yon || YON_LAST) : null;
                }
            } catch (e) { /* */ }
            return o.apply(this, arguments);
        });
        try { // bosh sahifa kartasi va menyudagi nom
            const fix = () => document.querySelectorAll('[data-sec="hisob"] .btn-text').forEach((el: any) => { if (/Dalolatnoma va hisobotlar/.test(el.textContent)) el.firstChild.textContent = 'Dalolatnoma va hujjatlar tayyorlash'; });
            fix(); setTimeout(fix, 1500);
        } catch (e) { /* */ }
        (function () {
            const st = document.createElement('style'); st.id = 'v62yonCss';
            st.textContent = `.yon62-tip{color:#94a3b8;font-size:13px;margin:4px 2px 12px}
            .yon62-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}
            .yon62-c{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.25);cursor:pointer}
            .yon62-c:hover{border-color:#38bdf8}.yon62-c b{font-size:26px;width:40px;text-align:center}.yon62-c span{flex:1;font-weight:700;color:#f1f5f9}.yon62-c i{color:#94a3b8;font-style:normal}
            .yon62-foot{margin-top:14px;font-size:12px;color:#94a3b8}
            .yon62-crumb{display:inline-flex;gap:8px;align-items:center;margin:2px 0 12px;padding:8px 12px;border-radius:10px;background:rgba(56,189,248,.12);color:#7dd3fc;cursor:pointer;font-size:14px}
            .yon62-crumb b{color:#f1f5f9}
            .yon62-up{display:flex;align-items:center;gap:12px;padding:12px 16px;margin:0 0 12px;border-radius:14px;background:rgba(14,165,233,.14);border:1px solid rgba(56,189,248,.45);cursor:pointer}
            .yon62-up b{font-size:24px}.yon62-up div{flex:1;display:flex;flex-direction:column}.yon62-up span{font-weight:700;color:#f1f5f9}.yon62-up small{color:#94a3b8}.yon62-up i{color:#7dd3fc;font-style:normal}
            .yon62-lock{padding:28px 18px;text-align:center;color:#fca5a5;font-weight:700}`;
            document.head.appendChild(st);
        })();
        Y62.yonStep = yonStep; Y62.yonPick = yonPick; Y62.yonBack = yonBack; Y62.yonTab = yonTab; Y62.YON_LIST = YON_LIST;
