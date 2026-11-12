        // =====================================================================
        // 5.9 — 1-band: server ulanmaganda tugmalar qotmasin (muallif videosi, 02.11.2026 08:08)
        //  Avval: server oʻchiq / telefon boshqa tarmoqda boʻlsa, har bir soʻrov 7–20 soniya kutardi
        //  («Imzolash» ~7 s da ochilardi, ichidagi tugmalar ham qotardi).
        //  Endi:
        //   • ilova serverni orqa fonda tekshiradi (/health, 2,5 s): ochilganda, har 30 s da, tarmoq qaytganda,
        //     ilova oldinga chiqqanda;
        //   • server javob bermasa — 60 s «oflayn» deb eslab qoladi va shu vaqt ichida soʻrovlar KUTMASDAN
        //     darhol «server ulanmagan» xatosini qaytaradi (sahifalar oxirgi saqlangan maʼlumotni koʻrsatadi);
        //   • oddiy GET soʻrovning kutish vaqti 20 s → 6 s (imzo/fayl yuborish — avvalgidek 60 s);
        //   • «✍️ Imzolash» oynasi darhol ochiladi (oxirgi maʼlumot bilan), yangisi orqa fonda keladi.
        //  Server yoniq boʻlsa — hech narsa oʻzgarmaydi.
        // =====================================================================
        const N59: any = window as any;
        var NET59: any = { off: 0, at: 0, busy: false, last: 0 };
        function n59On(): boolean { try { return typeof N59.srvOn === 'function' && !!N59.srvOn(); } catch (e) { return false; } }
        function n59Offline(): boolean { return NET59.off > Date.now(); }
        function n59Url(): string { try { const c = N59.syncCfg(); return String((c && c.url) || '').replace(/\/+$/, ''); } catch (e) { return ''; } }
        function n59NetErr(): any { const x: any = new Error('📴 Server ulanmagan — oxirgi saqlangan maʼlumot koʻrsatilmoqda. Telefon korxona Wi-Fi siga ulanganini va server yoqilganini tekshiring.'); x.net = true; x.offline = true; return x; }
        function n59IsNet(e: any): boolean { return !!e && (e.net || e.name === 'AbortError' || /failed to fetch|networkerror|load failed|network request failed|ulanib bo.lmadi|aborted/i.test(String(e.message || ''))); }
        async function n59Probe(): Promise<boolean> {
            if (!n59On() || NET59.busy) return !n59Offline();
            const u = n59Url(); if (!u) return false;
            NET59.busy = true; NET59.last = Date.now();
            const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) { /* */ } }, 2500);
            let ok = false;
            try { const r = await fetch(u + '/health', { cache: 'no-store', signal: ctl ? ctl.signal : undefined }); ok = r.ok; } catch (e) { ok = false; }
            finally { clearTimeout(tm); NET59.busy = false; }
            const was = n59Offline();
            NET59.off = ok ? 0 : Date.now() + 60000; NET59.at = Date.now();
            if (was && ok) { try { N59.showToast('🟢 Server ulandi'); } catch (e) { /* */ } }
            return ok;
        }
        // sbFetch: oflayn boʻlsa — darhol xato; GET kutishi 6 s
        if (typeof N59.sbFetch === 'function') N59.sbFetch = N59.agmkExtend('sbFetch', '5.9: server oʻchiq boʻlsa kutmasdan', N59.sbFetch, (o: Function) => async function (this: unknown, path: any, opt: any) {
            opt = opt || {};
            if (n59On() && n59Offline() && !opt.noOff) { if (Date.now() - NET59.last > 10000) n59Probe(); throw n59NetErr(); }
            if (!opt.timeout && !/^(POST|PUT|PATCH|DELETE)$/i.test(opt.method || 'GET')) opt = Object.assign({}, opt, { timeout: 6000 });
            try { const r = await o.call(this, path, opt); NET59.off = 0; return r; }
            catch (e) { if (n59IsNet(e) && n59On()) { NET59.off = Date.now() + 60000; } throw e; }
        });
        // srvRaw (fayllar, rasm) — kutish vaqtisiz edi: oflayn boʻlsa darhol xato
        if (typeof N59.srvRaw === 'function') { const _r = N59.srvRaw; N59.srvRaw = async function (this: unknown) {
            if (n59On() && n59Offline()) { if (Date.now() - NET59.last > 10000) n59Probe(); throw n59NetErr(); }
            try { const r = await _r.apply(this, arguments); NET59.off = 0; return r; } catch (e) { if (n59IsNet(e) && n59On()) NET59.off = Date.now() + 60000; throw e; }
        }; }
        // «✍️ Imzolash»: oyna darhol, yangilanish orqa fonda
        var SG59: any = { tab: 'in', bg: 0 };
        if (typeof N59.sigOpenList === 'function') N59.sigOpenList = N59.agmkExtend('sigOpenList', '5.9: darhol ochiladi', N59.sigOpenList, (o: Function) => async function (this: unknown, tab: any) {
            if (tab === 'naz' || typeof N59.sigPoll !== 'function') return o.apply(this, arguments);
            SG59.tab = typeof tab === 'string' ? tab : 'in';
            const real = N59.sigPoll, self = this, args = arguments;
            N59.sigPoll = async function () { /* oxirgi maʼlumot bilan darhol */ };
            let r: any; try { r = await o.apply(self, args); } finally { N59.sigPoll = real; }
            n59Mark();
            if (n59On() && !n59Offline()) {
                const id = ++SG59.bg, before = JSON.stringify((N59.SIG && N59.SIG.inbox) || []);
                Promise.resolve(real(true)).then(async () => {
                    if (id !== SG59.bg) return; const m = N59.$id('sgList'); if (!m || m.classList.contains('hidden')) return;
                    if (JSON.stringify((N59.SIG && N59.SIG.inbox) || []) === before) return;
                    N59.sigPoll = async function () { /* */ }; try { await o.call(self, SG59.tab); } finally { N59.sigPoll = real; } n59Mark();
                }).catch(() => { n59Mark(); });
            }
            return r;
        });
        function n59Mark(): void {
            try { const m = N59.$id('sgList'); if (!m) return; const box = m.querySelector('.modal-content, .px-body') || m.firstElementChild || m;
                const w = m.querySelector('.n59-off'); if (n59Offline() && !w && !m.querySelector('.hp-warn')) { const d = document.createElement('div'); d.className = 'hp-warn n59-off'; d.textContent = '📴 Server ulanmagan — oxirgi maʼlumot koʻrsatilmoqda. Imzolash server ulanganda ishlaydi.'; const tabs = m.querySelector('.sg-tabs'); if (tabs && tabs.parentElement) tabs.parentElement.insertBefore(d, tabs); else box.appendChild(d); }
                if (!n59Offline() && w) w.remove(); } catch (e) { /* */ }
        }
        // orqa fondagi tekshiruv
        (function () {
            setTimeout(() => { n59Probe(); }, 1500);
            setInterval(() => { if (document.visibilityState !== 'hidden') n59Probe(); }, 30000);
            window.addEventListener('online', () => { NET59.off = 0; n59Probe(); });
            window.addEventListener('offline', () => { if (n59On()) NET59.off = Date.now() + 60000; });
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') n59Probe(); });
            window.addEventListener('agmk:login', () => setTimeout(n59Probe, 300));
        })();
        Object.assign(N59, { NET59: NET59, n59Probe: n59Probe, n59Offline: n59Offline });
