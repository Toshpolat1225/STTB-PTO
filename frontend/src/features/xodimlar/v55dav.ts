        // =====================================================================
        // 5.5 — 🛡 SVO: davomat (turniket kirish-chiqishi) nazorati (muallif soʻrovi, 30.10.2026)
        //  • Kim: SVO («svo» roli), rahbariyat, administrator — hamma; sex / boʻlim boshligʻi — faqat oʻz ishchilari (server tekshiradi).
        //  • Grafiklar: 5/2 ITR 07:30–16:30, 5/2 ishchilar 07:00–16:00 (8 soat); 12 soat — den 07:00–19:00, noch 19:00–07:00
        //    (Den–Noch–Dam–Dam, 2 Noch–2 Dam, 2 Den–2 Dam …). Kech / erta — ishchining OʻZ smenasi boʻyicha; dam kuni «kelmagan» emas.
        //  • Kelmaganlar: 🔵 sababli (balnichniy, taʼtil …) va 🔴 sababsiz — alohida; filtrlar vagonlardagidek.
        //  • 🖥 Monitoring oynasi — kompyuterda bitta katta oyna: chap menyu, hamma panel bir joyda, har daqiqa yangilanadi.
        //  Xavfsizlik: kirish-chiqish vaqtlari faqat serverda (/api/dav/v1/*); ilova ularni saqlamaydi (faqat ochiq sahifa xotirasida).
        //  Server ulanmagan boʻlsa — «🧪 Namuna» (soxta maʼlumot) bilan koʻrish mumkin.
        // =====================================================================
        const DV9: any = window as any;
        var DV: any = { tab: 'bugun', d: '', f: 'all', unit: '', code: '', obj: '', q: '', cfg: null, day: null, demo: false, busy: false, p: null, pt: '', pd: '', mon: null, monF: 'dash', tm: 0, m: '' };
        const DV_CAN = 'agmk_dav_can';
        const DV_OBJ = ['Ст. Отвальная', 'Ст. Породная', 'Ст. Колсевая', 'Сл. СЦБ и связь', 'ЖДЦ-2 Раскомандировка', 'ВРП ЖДЦ-2', 'Ст. Фабричная', 'Ст. Медная', 'Смотровая диспетчерской здания ЖДЦ-1', 'К-сеть', 'Ст. Предгорная', 'АБК УПЖТ', 'ЖДЦ-3', 'КНСМ', 'ЖДЦ-1', 'Вагонная служба'];
        const DV_PT: any[] = [
            { id: 'itr52', name: '5/2 · ITR 07:30–16:30', cycle: ['I', 'I', 'I', 'I', 'I', 'V', 'V'], builtin: true },
            { id: 'w52', name: '5/2 · ishchilar 07:00–16:00', cycle: ['W', 'W', 'W', 'W', 'W', 'V', 'V'], builtin: true },
            { id: 'dnvv', name: 'Den–Noch–Dam–Dam · 12 soat', cycle: ['D', 'N', 'V', 'V'], builtin: true },
            { id: 'nnvv', name: '2 Noch – 2 Dam · 12 soat', cycle: ['N', 'N', 'V', 'V'], builtin: true },
            { id: 'ddvv', name: '2 Den – 2 Dam · 12 soat', cycle: ['D', 'D', 'V', 'V'], builtin: true }];
        const DV_RS = [{ k: 'bol', n: '🩺 Balnichniy' }, { k: 'tat', n: '🏖 Taʼtil' }, { k: 'kom', n: '✈️ Komandirovka' }, { k: 'oqi', n: '📚 Oʻqish' }, { k: 'dam', n: '🏠 Dam olish' }, { k: 'boshqa', n: '📝 Boshqa' }];
        const DV_CODE: any = { D: ['☀', 'Den 07:00–19:00'], N: ['🌙', 'Noch 19:00–07:00'], I: ['I', 'ITR 07:30–16:30'], W: ['8', '07:00–16:00'], V: ['V', 'Dam'] };
        const DV_ST: any = { ishda: ['🟢', 'ishda', 'st-g'], ketgan: ['✅', 'ketdi', 'st-g'], kech: ['🟡', 'kech', 'st-y'], erta: ['🟠', 'erta ketdi', 'st-o'], sababli: ['🔵', 'sababli', 'st-b'], sababsiz: ['🔴', 'sababsiz', 'st-r'], dam: ['⚪', 'dam (grafik)', 'st-n'], kutish: ['⚪', 'smenasi kutilmoqda', 'st-n'], grafiksiz: ['❔', 'grafik yoʻq', 'st-n'], nodata: ['⚫', 'turniket maʼlumoti yoʻq', 'st-n'] }; // 5.6: maʼlumot yuklanmagan kun — sababsiz emas
        const DV_CHIPS = [['all', 'Hammasi', ''], ['ishda', '🟢 Ishda', 'g'], ['kech', '🟡 Kech', 'y'], ['erta', '🟠 Erta ketgan', 'o'], ['sababli', '🔵 Sababli', 'bl'], ['sababsiz', '🔴 Sababsiz', 'r'], ['dam', '⚪ Dam / kutish', ''], ['grafiksiz', '❔ Grafik yoʻq', '']];
        function dvE(s: any): string { return DV9.escapeHtml(String(s == null ? '' : s)); }
        function dvMe(): string { try { const u: any = typeof currentUser !== 'undefined' ? currentUser : null; return String((u && u.tabel) || ''); } catch (e) { return ''; } }
        function dvToday(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function dvAddDay(s: string, n: number): string { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function dvDmy(s: string): string { return s ? s.slice(8, 10) + '.' + s.slice(5, 7) + '.' + s.slice(0, 4) : ''; }
        function dvHm(s: any): string { return s ? String(s).slice(11, 16) : '—'; }
        function dvMin(m: number): string { m = Math.round(+m || 0); if (!m) return '0'; const h = Math.floor(m / 60), r = m % 60; return h ? h + ' s' + (r ? ' ' + r + ' d' : '') : r + ' daq'; }
        function dvSrv(): boolean { try { const c = DV9.syncCfg(); return !!(c && c.on && c.url); } catch (e) { return false; } }
        function dvRoleOk(): boolean { try { return !!(DV9.isAdmin() || DV9.hasRole('svo') || DV9.hasRole('rahbar')); } catch (e) { return false; } }
        function dvCanCached(): boolean { try { const o = JSON.parse(localStorage.getItem(DV_CAN) || '{}'); return !!o[dvMe()]; } catch (e) { return false; } }
        function dvCanSave(v: boolean): void { try { const o = JSON.parse(localStorage.getItem(DV_CAN) || '{}'); o[dvMe()] = v ? 1 : 0; localStorage.setItem(DV_CAN, JSON.stringify(o)); } catch (e) { /* */ } }

        // ---------------- server / namuna ----------------
        async function dvApi(path: string, opt?: any): Promise<any> {
            if (DV.demo) return dvDemo(path, opt);
            if (!dvSrv()) throw new Error('Server ulanmagan');
            return DV9.sbFetch(path, opt || { method: 'GET' });
        }
        // Soxta maʼlumot (namuna rejimi). Haqiqiy ism yoʻq.
        var DVD: any = null;
        function dvDemoBuild(): any {
            const F = ['Aliyev', 'Karimov', 'Rasulov', 'Nazarov', 'Tursunov', 'Yusupov', 'Qodirov', 'Ergashev', 'Hamidov', 'Sobirov', 'Mirzayev', 'Saidov', 'Ahmedov', 'Usmonov', 'Rahimov', 'Olimov', 'Jurayev', 'Normatov', 'Xolmatov', 'Sharipov'];
            const I = ['Botir', 'Dilshod', 'Sardor', 'Jasur', 'Akmal', 'Anvar', 'Otabek', 'Umid', 'Farrux', 'Kamol', 'Bekzod', 'Sherzod', 'Ravshan', 'Nodir', 'Ilhom'];
            const U = [['ЖДЦ-1', 'teplovoz mashinisti'], ['ЖДЦ-2', 'sostavitel'], ['ЖДЦ-3', 'monter'], ['КНСМ', 'mashinist'], ['Сл. СЦБ', 'elektromexanik'], ['Vagon xizmati', 'slesar'], ['АБК УПЖТ', 'muhandis']];
            let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
            const P: any[] = [];
            for (let i = 0; i < 64; i++) {
                const u = U[i % U.length], itr = u[0] === 'АБК УПЖТ', pat = itr ? 'itr52' : ['dnvv', 'nnvv', 'ddvv', 'w52', 'dnvv'][i % 5];
                P.push({ tabel: String(990100 + i), name: F[i % F.length] + ' ' + I[(i * 7) % I.length], lav: u[1], unitN: u[0], grpN: (i % 3 + 1) + '-brigada', itr: itr, pat: pat, anchor: dvAddDay(dvToday(), -(i % 4)), obj: DV_OBJ[(i * 5) % DV_OBJ.length], r: rnd() });
            }
            return { P: P };
        }
        function dvDemoDay(d: string): any {
            if (!DVD) DVD = dvDemoBuild();
            const now = new Date(), isToday = d === dvToday(), list: any[] = [], cnt: any = {}, ins: any = {};
            DVD.P.forEach((x: any, i: number) => {
                const pt = DV_PT.find(p => p.id === x.pat), k = Math.round((new Date(d + 'T12:00:00').getTime() - new Date(x.anchor + 'T12:00:00').getTime()) / 864e5);
                const code = pt.cycle[((k % pt.cycle.length) + pt.cycle.length) % pt.cycle.length], plan = code === 'D' ? ['07:00', '19:00'] : code === 'N' ? ['19:00', '07:00'] : code === 'I' ? ['07:30', '16:30'] : code === 'W' ? ['07:00', '16:00'] : null;
                const r = Math.floor(x.r * 100 + (d.charCodeAt(9) || 0) * 13 + i) % 100, s: any = { code: code, guess: false, plan: plan, in: null, out: null, late: 0, early: 0, inside: false, work: 0, objs: {}, n_out: 0, st: '', pat: x.pat, obj: '' };
                if (!plan) s.st = 'dam';
                else if (isToday && (now.getHours() * 60 + now.getMinutes()) < (+plan[0].slice(0, 2)) * 60 + (+plan[0].slice(3)) + 5) s.st = 'kutish';
                else if (r < 6) { s.st = 'sababli'; s.reason = { kind: 'bol', name: '🩺 Balnichniy', from: dvAddDay(d, -2), to: dvAddDay(d, 4) }; }
                else if (r < 10) s.st = 'sababsiz';
                else {
                    const h0 = +plan[0].slice(0, 2), m0 = +plan[0].slice(3), late = r < 22 ? 7 + (r * 3) % 40 : 0, early = r > 90 ? 30 + (r % 5) * 40 : 0;
                    const tin = h0 * 60 + m0 - 8 + late + (late ? 8 : 0), dur = (code === 'D' || code === 'N' ? 720 : 540) + 8 - early - late;
                    s.in = d + 'T' + String(Math.floor(tin / 60) % 24).padStart(2, '0') + ':' + String(tin % 60).padStart(2, '0'); s.late = late; s.obj = x.obj;
                    const endM = tin + dur, nowM = isToday ? now.getHours() * 60 + now.getMinutes() + (code === 'N' && now.getHours() < 12 ? 1440 : 0) : 99999;
                    if (endM <= nowM) { s.out = d + 'T' + String(Math.floor(endM / 60) % 24).padStart(2, '0') + ':' + String(endM % 60).padStart(2, '0'); s.early = early; s.st = 'ketgan'; s.work = dur; }
                    else { s.inside = true; s.st = 'ishda'; s.work = Math.max(0, nowM - tin); }
                    s.n_out = Math.floor(r) % 3; s.objs[x.obj] = s.work;
                }
                const tags = [s.st].concat(s.late ? ['kech'] : [], s.early ? ['erta'] : []); tags.forEach((t: string) => { cnt[t] = (cnt[t] || 0) + 1; });
                if (s.inside) ins[x.obj] = (ins[x.obj] || 0) + 1;
                list.push(Object.assign({ tabel: x.tabel, name: x.name, lav: x.lav, unitN: x.unitN, grpN: x.grpN, itr: x.itr }, s, { tags: tags }));
            });
            return { date: d, all: true, list: list, cnt: cnt, inside: ins, last: dvToday() + 'T' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') };
        }
        function dvDemo(path: string, opt?: any): any {
            const q: any = {}; (path.split('?')[1] || '').split('&').forEach(kv => { const a = kv.split('='); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ''); });
            if (path.indexOf('/cfg') > 0) return { all: true, imp: true, can: true, n: 64, objects: DV_OBJ, patterns: DV_PT, reasons: DV_RS.map(r => ({ k: r.k, n: r.n })) };
            if (path.indexOf('/day') > 0) return dvDemoDay(q.d || dvToday());
            if (path.indexOf('/p?') > 0) {
                const x = dvDemoDay(q.d || dvToday()).list.find((z: any) => z.tabel === q.t) || {}; const ev: any[] = [];
                if (x.in) { const o = x.obj || DV_OBJ[0]; ev.push({ at: x.in, dir: 1, obj: o }); if (x.n_out) { const t0 = new Date(x.in + ':00').getTime(), f = (ms: number) => { const z = new Date(ms); return z.getFullYear() + '-' + String(z.getMonth() + 1).padStart(2, '0') + '-' + String(z.getDate()).padStart(2, '0') + 'T' + String(z.getHours()).padStart(2, '0') + ':' + String(z.getMinutes()).padStart(2, '0'); }; ev.push({ at: f(t0 + 3 * 36e5), dir: -1, obj: o }); ev.push({ at: f(t0 + 3 * 36e5 + 35 * 6e4), dir: 1, obj: 'Ст. Медная' }); x.objs = {}; x.objs[o] = 180; x.objs['Ст. Медная'] = Math.max(0, x.work - 215); } if (x.out) ev.push({ at: x.out, dir: -1, obj: o }); }
                return { p: { tabel: x.tabel, name: x.name, lav: x.lav, unitN: x.unitN, grpN: x.grpN }, days: [Object.assign({}, x, { date: q.d || dvToday(), ev: ev })], pattern: { id: x.pat, name: (DV_PT.find(p => p.id === x.pat) || {}).name, anchor: '', from: '' }, reasons: x.reason ? [Object.assign({ id: 1 }, x.reason)] : [] };
            }
            if (path.indexOf('/reasons') > 0) return { list: dvDemoDay(q.d || dvToday()).list.filter((x: any) => x.reason).map((x: any) => Object.assign({ id: 1, kind: x.reason.kind, rname: x.reason.name, from: x.reason.from, to: x.reason.to }, x)) };
            if (path.indexOf('/objects') > 0) return { list: DV_OBJ.map((o, i) => ({ obj: o, last: i === 9 ? null : dvToday() + 'T06:1' + (i % 10), n24: 100 + i * 17 })) };
            if (path.indexOf('/tabel') > 0) {
                const m = q.m || dvToday().slice(0, 7), nd = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate(), rows: any[] = [];
                if (!DVD) DVD = dvDemoBuild();
                DVD.P.slice(0, 30).forEach((x: any) => { const c: string[] = []; let h = 0, ke = 0, pr = 0; for (let i = 1; i <= nd; i++) { const d = m + '-' + String(i).padStart(2, '0'); if (d > dvToday()) { c.push(''); continue; } const s = dvDemoDay(d).list.find((z: any) => z.tabel === x.tabel); const mk = s.st === 'dam' ? 'V' : s.st === 'sababli' ? 'B' : s.st === 'sababsiz' ? 'PR' : (s.st === 'ishda' || s.st === 'ketgan') ? String(Math.round(s.work / 30) / 2).replace('.', ',') : ''; if (s.st === 'ishda' || s.st === 'ketgan') h += s.work; if (s.late || s.early) ke++; if (s.st === 'sababsiz') pr++; c.push(mk + ((s.late || s.early) && /\d/.test(mk) ? '*' : '')); } rows.push({ tabel: x.tabel, name: x.name, lav: x.lav, unitN: x.unitN, c: c, h: Math.round(h / 6) / 10, ke: ke, pr: pr }); });
                return { m: m, days: nd, rows: rows };
            }
            if (opt && opt.method === 'POST') return { ok: true, n: 1, id: 1, dup: 0, unknown: 0 };
            return {};
        }

        // ---------------- kirish: bosh sahifa kartasi (faqat ruxsati borlarga) ----------------
        try { if (typeof DV9.ROLE_DEF !== 'undefined' && !DV9.ROLE_DEF.some((x: any) => x[0] === 'svo')) DV9.ROLE_DEF.push(['svo', '🛡', 'Ichki qoʻriqlash xizmati (SVO)', 'Turniket kirish-chiqishini koʻradi va yuklaydi, smena grafigi va sabab kiritadi']); } catch (e) { /* */ }
        if (typeof DV9.modAllowed === 'function') DV9.modAllowed = DV9.agmkExtend('modAllowed', '5.5: SVO davomat — rol yoki boʻysunuvchilar', DV9.modAllowed, (o: Function) => function (this: unknown, m: any) {
            if (m && m.id === 'dav') { try { return dvRoleOk() || dvCanCached(); } catch (e) { return false; } }
            return o.apply(this, arguments);
        });
        try { DV9.agmkModule({ id: 'dav', icon: '🛡', title: 'SVO — Davomat (turniket)', search: 'svo davomat turniket kirish chiqish kelmagan sababsiz sababli kech kelgan erta ketgan smena grafik tabel balnichniy qoriqlash perco', desc: 'Kirish-chiqish, kech / erta, sababli / sababsiz, smena grafiklari, tabel', open: () => dvOpen() }); } catch (e) { /* */ }
        async function dvCfg(force?: boolean): Promise<any> {
            if (DV.cfg && !force) return DV.cfg;
            try { DV.cfg = await dvApi('/api/dav/v1/cfg'); dvCanSave(!!DV.cfg.can); } catch (e) { DV.cfg = null; throw e; }
            try { DV9.modRefresh(); } catch (e) { /* */ }
            return DV.cfg;
        }
        // kirgandan keyin bir marta: boʻlim boshligʻiga karta chiqishi uchun
        setTimeout(() => { if (dvMe() && dvSrv()) dvCfg().catch(() => { /* */ }); }, 9000);

        // ---------------- ekran ----------------
        const DV_TABS = [['bugun', '📊 Bugun'], ['smena', '🔄 Smenalar'], ['sabab', '🩺 Sabablar'], ['tabel', '📅 Tabel'], ['obyekt', '🚧 Turniketlar']];
        async function dvOpen(tab?: string): Promise<void> {
            DV9.secScreen('screen-dav', '🛡 SVO — Davomat', "openScreen('screen-main')"); DV9.openScreen('screen-dav');
            if (tab) DV.tab = tab; if (!DV.d) DV.d = dvToday();
            const b = DV9.secBody('screen-dav');
            if (!DV.demo && !dvSrv()) { b.innerHTML = `<div class="dv-box">📡 Bu boʻlim korxona serveriga ulanganda ishlaydi: turniket maʼlumoti faqat serverda saqlanadi.</div><button class="dv-btn" onclick="dvDemoOn()">🧪 Namuna (soxta maʼlumot) bilan koʻrish</button>`; return; }
            try { await dvCfg(); } catch (e: any) { b.innerHTML = `<div class="dv-box">⚠️ ${dvE(e && e.message)}</div><button class="dv-btn" onclick="dvDemoOn()">🧪 Namuna bilan koʻrish</button>`; return; }
            if (!DV.cfg.can) { b.innerHTML = '<div class="dv-box">🔒 Bu boʻlim SVO, rahbariyat va boʻlim boshliqlari uchun.</div>'; return; }
            dvRender();
        }
        function dvDemoOn(): void { DV.demo = true; DV.cfg = null; DVD = null; dvOpen(); }
        function dvTab(t: string): void { DV.tab = t; dvRender(); }
        async function dvRender(): Promise<void> {
            DV9.secTabs('screen-dav', DV_TABS, DV.tab, 'dvTab');
            const b = DV9.secBody('screen-dav'), top = `${DV.demo ? '<div class="dv-demo">🧪 Namuna rejimi — soxta maʼlumot. Server ulanganda haqiqiy turniket maʼlumoti chiqadi.</div>' : ''}<div class="dv-acts"><button class="mini-btn" onclick="dvMonOpen()">🖥 Monitoring oynasi</button>${DV.cfg && DV.cfg.imp ? '<button class="mini-btn" onclick="dvImpOpen()">📥 Turniket maʼlumotini yuklash</button>' : ''}</div>`;
            b.innerHTML = top + '<div id="dvBody"><div class="nd-tip">⏳ Yuklanmoqda…</div></div>';
            const box = DV9.$id('dvBody');
            try {
                if (DV.tab === 'bugun') { box.innerHTML = await dvBugunHtml(); dvList(); }
                else if (DV.tab === 'smena') box.innerHTML = dvSmenaHtml();
                else if (DV.tab === 'sabab') box.innerHTML = await dvSababHtml();
                else if (DV.tab === 'tabel') box.innerHTML = await dvTabelHtml();
                else if (DV.tab === 'obyekt') box.innerHTML = await dvObjHtml();
            } catch (e: any) { box.innerHTML = `<div class="dv-box">⚠️ ${dvE(e && e.message)}</div>`; }
        }

        // ---------------- Bugun ----------------
        async function dvDay(force?: boolean): Promise<any> {
            if (!force && DV.day && DV.day.date === DV.d && Date.now() - DV.day._at < 60000) return DV.day;
            const d = await dvApi('/api/dav/v1/day?d=' + DV.d); d._at = Date.now(); DV.day = d; return d;
        }
        function dvFilter(L: any[], f: string): any[] {
            return L.filter((x: any) => {
                if (f === 'dam') { if (x.st !== 'dam' && x.st !== 'kutish') return false; } else if (f !== 'all' && x.tags.indexOf(f) < 0 && !(f === 'ishda' && x.st === 'ishda')) return false;
                if (DV.unit && x.unitN !== DV.unit) return false;
                if (DV.code && x.code !== DV.code) return false;
                if (DV.obj && x.obj !== DV.obj) return false;
                if (DV.q) { const q = DV.q.toLowerCase(); if ((x.name + ' ' + x.tabel + ' ' + x.lav).toLowerCase().indexOf(q) < 0) return false; }
                return true;
            });
        }
        // 5.8 (muallif buyrugʻi): kartochkalar — filtr (bosilganda roʻyxat shu holat boʻyicha), yozuvli tugmalar (dvChips) koʻrsatilmaydi;
        //  «Dam / kutish» va «Grafik yoʻq» ham kartochka, «Jami» — hammasi. fn berilmasa — eski (faqat son) koʻrinish.
        function dvKpi(c: any, n: number, fn?: string): string {
            if (fn) {
                const K = [['ishda', 'g', c.ishda, '🟢 Ishda'], ['kech', 'y', c.kech, '🟡 Kech'], ['erta', 'o', c.erta, '🟠 Erta ketgan'], ['sababli', 'bl', c.sababli, '🔵 Sababli'],
                    ['sababsiz', 'r', c.sababsiz, '🔴 Sababsiz'], ['dam', 'w', (c.dam || 0) + (c.kutish || 0), '⚪ Dam / kutish'], ['grafiksiz', 'w', c.grafiksiz, '❔ Grafik yoʻq'], ['all', '', n, '👥 Jami']];
                return `<div class="dv-kpi dv-kf">${K.map(x => `<i class="${x[1]}${DV.f === x[0] ? ' on' : ''}" onclick="${fn}('${x[0]}')"><b>${x[2] || 0}</b>${x[3]}</i>`).join('')}</div>`;
            }
            return `<div class="dv-kpi"><i class="g"><b>${c.ishda || 0}</b>🟢 Ishda</i><i class="y"><b>${c.kech || 0}</b>🟡 Kech</i><i class="o"><b>${c.erta || 0}</b>🟠 Erta ketgan</i><i class="bl"><b>${c.sababli || 0}</b>🔵 Sababli</i><i class="r"><b>${c.sababsiz || 0}</b>🔴 Sababsiz</i><i><b>${n}</b>👥 Jami</i></div>`;
        }
        function dvChips(c: any, n: number, fn: string): string {
            return `<div class="dv-chips">${DV_CHIPS.map(x => { const k = x[0], v = k === 'all' ? n : k === 'dam' ? (c.dam || 0) + (c.kutish || 0) : (c[k] || 0); return `<span class="${DV.f === k ? 'on ' + x[2] : ''}" onclick="${fn}('${k}')">${x[1]}<em>${v}</em></span>`; }).join('')}</div>`;
        }
        function dvSel(id: string, lab: string, cur: string, opts: string[][], fn: string): string {
            return `<label class="dv-fs"><small>${lab}</small><select onchange="${fn}('${id}',this.value)"><option value="">Hammasi</option>${opts.map(o => `<option value="${dvE(o[0])}"${o[0] === cur ? ' selected' : ''}>${dvE(o[1])}</option>`).join('')}</select></label>`;
        }
        function dvFilters(L: any[], fn: string): string {
            const units = Array.from(new Set(L.map((x: any) => x.unitN).filter(Boolean))).sort() as string[];
            const objs = Array.from(new Set(DV_OBJ.concat(L.map((x: any) => x.obj).filter(Boolean))));
            return `<div class="dv-f">${dvSel('unit', 'Sex / boʻlim', DV.unit, units.map(u => [u, u]), fn)}${dvSel('code', 'Smena', DV.code, [['D', '☀ Den 07–19'], ['N', '🌙 Noch 19–07'], ['W', '5/2 ishchi 07–16'], ['I', '5/2 ITR 07:30–16:30'], ['V', 'Dam']], fn)}${dvSel('obj', 'Turniket', DV.obj, objs.map(o => [o, o]), fn)}</div>
                <input class="dv-q" placeholder="🔎 Ism, tabel yoki lavozim" value="${dvE(DV.q)}" oninput="DV.q=this.value;clearTimeout(DV.qt);DV.qt=setTimeout(()=>${fn === 'dvSet' ? 'dvList()' : 'dvMonDraw()'},250)">`;
        }
        function dvStatus(x: any): string {
            const parts: string[] = [];
            if (x.st === 'sababli') { const r = x.reason || {}; parts.push(`<span class="dv-st st-b">${dvE(r.name || '🔵 sababli')}<br>${dvDmy(r.from).slice(0, 5)}–${dvDmy(r.to).slice(0, 5)}</span>`); }
            else if (x.st === 'sababsiz') parts.push('<span class="dv-st st-r">🔴 sababsiz<br>kelmadi</span>');
            else if (x.st === 'ishda') parts.push(`<span class="dv-st st-g">🟢 ichkarida<br>${dvHm(x.in)} dan</span>`);
            else if (x.st === 'ketgan') parts.push(`<span class="dv-st st-g">✅ ${dvHm(x.in)}–${dvHm(x.out)}</span>`);
            else if (x.st === 'dam') parts.push('<span class="dv-st st-n">⚪ dam<br>(grafik)</span>');
            else if (x.st === 'nodata') parts.push('<span class="dv-st st-n">⚫ turniket<br>maʼlumoti yoʻq</span>');
            else if (x.st === 'kutish') parts.push(`<span class="dv-st st-n">⚪ smenasi<br>${x.plan ? x.plan[0] : ''} da</span>`);
            else parts.push('<span class="dv-st st-n">❔ grafik<br>yoʻq</span>');
            if (x.late) parts.push(`<span class="dv-st st-y">🟡 +${dvMin(x.late)}</span>`);
            if (x.early) parts.push(`<span class="dv-st st-o">🟠 −${dvMin(x.early)}</span>`);
            return parts.join('');
        }
        function dvRowHtml(x: any): string {
            const ini = String(x.name || '?').split(/\s+/).map((w: string) => w[0] || '').join('').slice(0, 2).toUpperCase(), c = DV_CODE[x.code] || null;
            return `<div class="dv-row" onclick="dvPerson('${dvE(x.tabel)}')"><div class="av">${dvE(ini)}</div><div class="tx"><b>${dvE(x.name)}</b><small>${dvE(x.tabel)} · ${dvE(x.unitN)} · ${dvE(x.lav)}</small><small>${c ? c[0] + ' ' + (x.plan ? x.plan.join('–') : c[1]) : '—'}${x.guess ? ' (taxmin)' : ''}${x.obj ? ' · 🚧 ' + dvE(x.obj) : ''}${x.n_out ? ' · ↔ ' + x.n_out : ''}</small></div><div class="dv-sts">${dvStatus(x)}</div></div>`;
        }
        async function dvBugunHtml(): Promise<string> {
            const d = await dvDay(), L = d.list || [], n = L.length;
            return `<div class="dv-dt"><button class="mini-btn" onclick="dvDate(-1)">‹</button><input type="date" value="${DV.d}" onchange="DV.d=this.value;dvRender()"><button class="mini-btn" onclick="dvDate(1)">›</button><span>${d.last ? 'oxirgi turniket maʼlumoti: ' + dvDmy(String(d.last).slice(0, 10)) + ' ' + dvHm(d.last) : 'turniket maʼlumoti hali yuklanmagan'}</span></div>
                ${d.nodata ? '<div class="dv-box" style="background:#fff7ed;border-color:#fdba74;color:#9a3412">⚫ <b>Bu kun uchun turniket maʼlumoti yuklanmagan.</b> Shuning uchun hech kim «sababsiz» deb belgilanmadi. SVO «📥 Turniket maʼlumotini yuklash» orqali yuklasa — hisob avtomatik chiqadi.</div>' : ''}${dvKpi(d.cnt || {}, n, 'dvF')}${dvFilters(L, 'dvSet')}<div id="dvList"></div>`;
        }
        function dvList(): void {
            const box = DV9.$id('dvList'); if (!box || !DV.day) return; const L = dvFilter(DV.day.list || [], DV.f);
            const order: any = { sababsiz: 0, ishda: 2, ketgan: 3, sababli: 4, kutish: 5, nodata: 5, dam: 6, grafiksiz: 7 };
            L.sort((a: any, b: any) => (order[a.st] - order[b.st]) || (b.late + b.early - a.late - a.early) || String(a.name).localeCompare(String(b.name)));
            box.innerHTML = (L.length ? L.slice(0, 400).map(dvRowHtml).join('') + (L.length > 400 ? `<div class="nd-tip">… yana ${L.length - 400} kishi — filtrni toraytiring</div>` : '') : '<div class="nd-tip">— roʻyxat boʻsh</div>')
                + (L.length ? `<button class="dv-btn" onclick="dvListXlsx()">📥 Roʻyxatni Excel qilib olish (${L.length})</button>` : '');
        }
        function dvF(f: string): void { DV.f = f; document.querySelectorAll('#dvBody .dv-chips span').forEach((s: any, i: number) => { const x = DV_CHIPS[i]; s.className = x[0] === f ? 'on ' + x[2] : ''; }); document.querySelectorAll('.dv-kf i').forEach((e: any) => { const m = /dvF\('(\w+)'\)/.exec(e.getAttribute('onclick') || ''); e.classList.toggle('on', !!m && m[1] === f); }); dvList(); }
        function dvSet(k: string, v: string): void { DV[k] = v; dvList(); }
        function dvDate(n: number): void { DV.d = dvAddDay(DV.d || dvToday(), n); dvRender(); }
        function dvListXlsx(): void {
            if (!DV.day) return; const L = dvFilter(DV.day.list || [], DV.f), S: any = DV_ST;
            const rows = [['Davomat — ' + dvDmy(DV.d)], [], ['Tabel', 'F.I.Sh.', 'Sex / boʻlim', 'Lavozim', 'Smena', 'Reja', 'Keldi', 'Ketdi', 'Kech, daq', 'Erta, daq', 'Holat', 'Sabab', 'Turniket']];
            L.forEach((x: any) => rows.push([x.tabel, x.name, x.unitN, x.lav, (DV_CODE[x.code] || ['', ''])[1], x.plan ? x.plan.join('–') : '', dvHm(x.in), x.out ? dvHm(x.out) : '', x.late || '', x.early || '', (S[x.st] || ['', x.st])[1], x.reason ? x.reason.name + ' ' + dvDmy(x.reason.from) + '–' + dvDmy(x.reason.to) : '', x.obj || '']));
            DV9.xlsxDl(rows, 'Davomat ' + dvDmy(DV.d));
        }
        // ---------------- Ishchi kuni ----------------
        async function dvPerson(t: string, d?: string): Promise<void> {
            DV.pt = t; DV.pd = d || DV.d || dvToday();
            DV9.mdl('dvP', '<div class="nd-tip">⏳ Yuklanmoqda…</div>', true);
            try {
                const r = await dvApi('/api/dav/v1/p?t=' + encodeURIComponent(t) + '&d=' + DV.pd); DV.p = r;
                const s = r.days[r.days.length - 1] || {}, p = r.p || {}, c = DV_CODE[s.code] || null;
                const tl = (s.ev || []).map((e: any, i: number, A: any[]) => { const nx = A[i + 1]; const gap = e.dir === -1 && nx ? Math.round((new Date(nx.at).getTime() - new Date(e.at).getTime()) / 60000) : 0; return `<div class="${e.dir === -1 ? 'out' : ''}"><b>${dvHm(e.at)} ${e.dir === -1 ? '⬅️ CHIQDI' : e.dir === 1 ? '➡️ KIRDI' : '↔'}</b><small>🚧 ${dvE(e.obj || '—')}</small>${gap > 0 ? `<span class="gap">⏸ tashqarida ${dvMin(gap)}</span>` : ''}</div>`; }).join('');
                const objs = Object.keys(s.objs || {}).map(k => dvE(k) + ' (' + dvMin(s.objs[k]) + ')').join(' · ');
                DV9.mdl('dvP', `<div class="px-h"><b>👤 ${dvE(p.name)}</b><button class="mini-btn" onclick="mdlClose('dvP')">✕</button></div>
                    <div class="dv-box"><small>${dvE(p.tabel)} · ${dvE(p.unitN)} · ${dvE(p.lav)}</small><br><small>Grafik: ${dvE(r.pattern ? r.pattern.name : (s.guess ? 'belgilanmagan (taxmin)' : 'belgilanmagan'))}${c ? ' · bugun ' + c[0] + ' ' + (s.plan ? s.plan.join('–') : c[1]) : ''}</small></div>
                    <div class="dv-dt"><button class="mini-btn" onclick="dvPerson('${dvE(t)}','${dvAddDay(DV.pd, -1)}')">‹</button><b>${dvDmy(DV.pd)}</b><button class="mini-btn" onclick="dvPerson('${dvE(t)}','${dvAddDay(DV.pd, 1)}')">›</button></div>
                    <div class="dv-kpi"><i class="g"><b>${dvMin(s.work || 0)}</b>ichkarida</i><i class="y"><b>${s.late ? dvMin(s.late) : 0}</b>kech</i><i class="o"><b>${s.early ? dvMin(s.early) : 0}</b>erta</i></div>
                    <div class="dv-sts" style="justify-content:flex-start">${dvStatus(s)}</div>
                    ${tl ? `<div class="dv-box"><div class="dv-tl">${tl}</div></div>` : '<div class="nd-tip">Bu kuni turniketdan oʻtmagan.</div>'}
                    ${objs ? `<div class="dv-box" style="font-size:12.5px">📍 ${objs}</div>` : ''}
                    <div class="dv-acts"><button class="mini-btn" onclick="mdlClose('dvP');dvReasonForm('${dvE(t)}')">🩺 Sabab kiritish</button><button class="mini-btn" onclick="mdlClose('dvP');dvAssignForm(['${dvE(t)}'])">🔄 Grafik / smena</button></div>`, true);
            } catch (e: any) { DV9.mdl('dvP', `<div class="px-h"><b>👤</b><button class="mini-btn" onclick="mdlClose('dvP')">✕</button></div><div class="dv-box">⚠️ ${dvE(e && e.message)}</div>`, true); }
        }

        // ---------------- Smenalar: grafiklar va biriktirish ----------------
        function dvStrip(cyc: string[], n?: number, start?: string): string {
            const N = n || 14, cells: string[] = [], heads: string[] = [];
            for (let i = 0; i < N; i++) { const k = cyc[i % cyc.length]; heads.push(`<th>${start ? dvAddDay(start, i).slice(8, 10) : i + 1}</th>`); cells.push(`<td class="c${k}">${(DV_CODE[k] || [k])[0]}</td>`); }
            return `<table class="dv-t dv-strip"><tr>${heads.join('')}</tr><tr>${cells.join('')}</tr></table>`;
        }
        function dvPts(): any[] { return (DV.cfg && DV.cfg.patterns) || DV_PT; }
        function dvSmenaHtml(): string {
            return `<div class="dv-h">🗓 Smena grafiklari</div>${dvPts().map((p: any) => `<div class="dv-box"><b>${dvE(p.name)}</b><small style="display:block;color:#94a3b8;margin:2px 0 6px">${p.cycle.map((k: string) => (DV_CODE[k] || [k])[0]).join(' ')} · sikl ${p.cycle.length} kun</small>${dvStrip(p.cycle)}</div>`).join('')}
                <button class="dv-btn" onclick="dvAssignForm([])">👥 Ishchi / brigadani grafikka biriktirish</button>
                ${DV.cfg && (DV.cfg.all || DV.cfg.imp) ? '<button class="dv-btn sec" onclick="dvPatForm()">➕ Yangi grafik tuzish</button>' : ''}
                <div class="dv-box" style="font-size:12.5px">Grafik bir marta beriladi va takrorlanib ketaveradi. «V» (dam / otsypnoy) kuni kelmagan ishchi <b>sababsizlarga tushmaydi</b>. Grafik berilmagan ITR — 5/2 ITR (07:30–16:30) hisoblanadi; grafik berilmagan ishchining smenasi birinchi kirish vaqtidan taxmin qilinadi.</div>`;
        }
        async function dvAssignForm(pre: string[]): Promise<void> {
            let L: any[] = []; try { L = (await dvDay()).list || []; } catch (e) { /* */ }
            DV.asel = new Set(pre); DV.aq = ''; DV.au = '';
            const units = Array.from(new Set(L.map((x: any) => x.unitN).filter(Boolean))).sort() as string[];
            DV9.mdl('dvA', `<div class="px-h"><b>👥 Grafikka biriktirish</b><button class="mini-btn" onclick="mdlClose('dvA')">✕</button></div>
                <div class="dv-lb">Grafik</div><select id="dvAp" class="dv-in" onchange="dvAPrev()">${dvPts().map((p: any) => `<option value="${dvE(p.id)}">${dvE(p.name)}</option>`).join('')}</select>
                <div class="dv-lb">Sikl qaysi kundan boshlanadi (1-kun)</div><input id="dvAa" class="dv-in" type="date" value="${dvToday()}" onchange="dvAPrev()">
                <div class="dv-lb">Amal qiladi: dan — gacha (gacha boʻsh — muddatsiz)</div><div style="display:flex;gap:6px"><input id="dvAf" class="dv-in" type="date" value="${dvToday()}"><input id="dvAt" class="dv-in" type="date"></div>
                <div id="dvApv"></div>
                <div class="dv-lb">Ishchilar</div><div class="dv-f" style="grid-template-columns:1fr 1fr">${`<label class="dv-fs"><small>Sex / boʻlim</small><select onchange="DV.au=this.value;dvAList()"><option value="">Hammasi</option>${units.map(u => `<option>${dvE(u)}</option>`).join('')}</select></label>`}<input class="dv-q" placeholder="🔎 qidiruv" oninput="DV.aq=this.value;dvAList()"></div>
                <div id="dvAl" class="dv-al"></div>
                <button class="dv-btn" onclick="dvAssignSave()">✅ Biriktirish</button>`, true);
            DV.alist = L; dvAPrev(); dvAList();
        }
        function dvAPrev(): void { const p = dvPts().find((x: any) => x.id === (DV9.$id('dvAp') || {}).value) || dvPts()[0], a = (DV9.$id('dvAa') || {}).value || dvToday(); const el = DV9.$id('dvApv'); if (el && p) el.innerHTML = dvStrip(p.cycle, 14, a); }
        function dvAList(): void {
            const el = DV9.$id('dvAl'); if (!el) return; const q = String(DV.aq || '').toLowerCase();
            const L = (DV.alist || []).filter((x: any) => (!DV.au || x.unitN === DV.au) && (!q || (x.name + ' ' + x.tabel + ' ' + (x.grpN || '')).toLowerCase().indexOf(q) >= 0));
            el.innerHTML = `<div class="dv-ck" onclick="dvAAll()"><i class="${L.length && L.every((x: any) => DV.asel.has(x.tabel)) ? '' : 'no'}">✓</i><b>Hammasini belgilash (${L.length})</b></div>` + L.slice(0, 300).map((x: any) => `<div class="dv-ck" onclick="dvATog('${dvE(x.tabel)}')"><i class="${DV.asel.has(x.tabel) ? '' : 'no'}">✓</i>${dvE(x.name)} · <small>${dvE(x.unitN)} ${dvE(x.grpN || '')}</small></div>`).join('');
            const b = document.querySelector('#dvA .dv-btn'); if (b) b.textContent = '✅ ' + DV.asel.size + ' kishini biriktirish';
        }
        function dvATog(t: string): void { if (DV.asel.has(t)) DV.asel.delete(t); else DV.asel.add(t); dvAList(); }
        function dvAAll(): void { const q = String(DV.aq || '').toLowerCase(); const L = (DV.alist || []).filter((x: any) => (!DV.au || x.unitN === DV.au) && (!q || (x.name + ' ' + x.tabel).toLowerCase().indexOf(q) >= 0)); const all = L.every((x: any) => DV.asel.has(x.tabel)); L.forEach((x: any) => all ? DV.asel.delete(x.tabel) : DV.asel.add(x.tabel)); dvAList(); }
        async function dvAssignSave(): Promise<void> {
            const ts = Array.from(DV.asel); if (!ts.length) { DV9.showToast('Ishchi tanlang'); return; }
            try { const r = await dvApi('/api/dav/v1/assign', { method: 'POST', body: { tabels: ts, pattern: DV9.$id('dvAp').value, anchor: DV9.$id('dvAa').value, from: DV9.$id('dvAf').value, to: DV9.$id('dvAt').value || null } });
                DV9.mdlClose('dvA'); DV9.showToast('✅ ' + (r.n || ts.length) + ' kishi grafikka biriktirildi'); DV.day = null; dvRender(); } catch (e: any) { alert('⚠️ ' + (e && e.message)); }
        }
        function dvPatForm(): void {
            DV.pc = ['D', 'N', 'V', 'V'];
            DV9.mdl('dvG', `<div class="px-h"><b>➕ Yangi grafik</b><button class="mini-btn" onclick="mdlClose('dvG')">✕</button></div>
                <div class="dv-lb">Nomi</div><input id="dvGn" class="dv-in" placeholder="masalan: 3 Den – 3 Dam · 12 soat">
                <div class="dv-lb">Kunlarni ketma-ket bosing</div><div class="dv-sm">${['D', 'N', 'W', 'I', 'V'].map(k => `<span onclick="DV.pc.push('${k}');dvGPrev()">${DV_CODE[k][0]}<small>${DV_CODE[k][1]}</small></span>`).join('')}</div>
                <div id="dvGp"></div><div class="dv-acts"><button class="mini-btn" onclick="DV.pc.pop();dvGPrev()">⌫ Oxirgisini oʻchirish</button><button class="mini-btn" onclick="DV.pc=[];dvGPrev()">Tozalash</button></div>
                <button class="dv-btn" onclick="dvPatSave()">💾 Saqlash</button>`, true);
            dvGPrev();
        }
        function dvGPrev(): void { const el = DV9.$id('dvGp'); if (el) el.innerHTML = DV.pc.length ? dvStrip(DV.pc, Math.max(14, DV.pc.length)) : '<div class="nd-tip">— kun tanlanmagan</div>'; }
        async function dvPatSave(): Promise<void> {
            const n = DV9.$id('dvGn').value.trim(); if (!n || !DV.pc.length) { DV9.showToast('Nomi va kunlarini kiriting'); return; }
            try { await dvApi('/api/dav/v1/pattern', { method: 'POST', body: { name: n, cycle: DV.pc } }); DV9.mdlClose('dvG'); DV9.showToast('✅ Grafik saqlandi'); await dvCfg(true); dvRender(); } catch (e: any) { alert('⚠️ ' + (e && e.message)); }
        }

        // ---------------- Sabablar ----------------
        async function dvSababHtml(): Promise<string> {
            const r = await dvApi('/api/dav/v1/reasons?d=' + (DV.d || dvToday())), L = r.list || [];
            const by: any = {}; L.forEach((x: any) => { by[x.kind] = (by[x.kind] || 0) + 1; });
            return `<button class="dv-btn" onclick="dvReasonForm('')">🩺 Sabab kiritish (balnichniy, taʼtil, komandirovka …)</button>
                <div class="dv-h">Hozirgi sabablar — ${L.length} (${dvDmy(DV.d || dvToday())})</div>
                <div class="dv-chips">${DV_RS.map(x => `<span>${x.n}<em>${by[x.k] || 0}</em></span>`).join('')}</div>
                ${L.map((x: any) => `<div class="dv-row"><div class="tx" onclick="dvPerson('${dvE(x.tabel)}')"><b>${dvE(x.name)}</b><small>${dvE(x.tabel)} · ${dvE(x.unitN)} · ${dvE(x.lav)}</small><small>${dvDmy(x.from)} – ${dvDmy(x.to)}${x.note ? ' · ' + dvE(x.note) : ''}</small></div><span class="dv-st st-b">${dvE(x.rname)}</span><button class="mini-btn" onclick="dvReasonDel(${+x.id})">✕</button></div>`).join('') || '<div class="nd-tip">— yoʻq</div>'}`;
        }
        async function dvReasonForm(t: string): Promise<void> {
            let L: any[] = []; try { L = (await dvDay()).list || []; } catch (e) { /* */ }
            DV.rk = 'bol'; DV.rt = t; DV.rlist = L;
            const x = L.find((z: any) => z.tabel === t);
            DV9.mdl('dvR', `<div class="px-h"><b>🩺 Sabab kiritish</b><button class="mini-btn" onclick="mdlClose('dvR')">✕</button></div>
                <div class="dv-lb">Ishchi</div><input class="dv-in" id="dvRq" placeholder="🔎 ism yoki tabel" value="${x ? dvE(x.name + ' · ' + x.tabel) : ''}" oninput="dvRFind(this.value)"><div id="dvRl" class="dv-al"></div>
                <div class="dv-lb">Sabab</div><div class="dv-sm dv-rk" style="grid-template-columns:repeat(3,1fr)">${DV_RS.map(r => `<span class="${r.k === 'bol' ? 'on' : ''}" onclick="DV.rk='${r.k}';document.querySelectorAll('.dv-rk span').forEach(s=>s.classList.remove('on'));this.classList.add('on')">${r.n}</span>`).join('')}</div>
                <div class="dv-lb">Muddat</div><div style="display:flex;gap:6px"><input id="dvRf" class="dv-in" type="date" value="${DV.d || dvToday()}"><input id="dvRt" class="dv-in" type="date" value="${DV.d || dvToday()}"></div>
                <div class="dv-lb">Izoh (varaqa №, buyruq № …)</div><input id="dvRn" class="dv-in">
                <button class="dv-btn" onclick="dvReasonSave()">💾 Saqlash — butun muddat «🔵 Sababli»</button>`, true);
        }
        function dvRFind(q: string): void {
            const el = DV9.$id('dvRl'); if (!el) return; q = String(q || '').toLowerCase(); DV.rt = '';
            const L = q.length < 2 ? [] : (DV.rlist || []).filter((x: any) => (x.name + ' ' + x.tabel).toLowerCase().indexOf(q) >= 0).slice(0, 8);
            el.innerHTML = L.map((x: any) => `<div class="dv-ck" onclick="DV.rt='${dvE(x.tabel)}';$id('dvRq').value=this.textContent;$id('dvRl').innerHTML=''">${dvE(x.name)} · ${dvE(x.tabel)} · ${dvE(x.unitN)}</div>`).join('');
        }
        async function dvReasonSave(): Promise<void> {
            let t = DV.rt; if (!t) { const m = String(DV9.$id('dvRq').value).match(/\d{4,}/); t = m ? m[0] : ''; }
            if (!t) { DV9.showToast('Ishchini tanlang'); return; }
            try { await dvApi('/api/dav/v1/reason', { method: 'POST', body: { tabel: t, kind: DV.rk, from: DV9.$id('dvRf').value, to: DV9.$id('dvRt').value, note: DV9.$id('dvRn').value } });
                DV9.mdlClose('dvR'); DV9.showToast('✅ Sabab saqlandi'); DV.day = null; dvRender(); } catch (e: any) { alert('⚠️ ' + (e && e.message)); }
        }
        async function dvReasonDel(id: number): Promise<void> { if (!confirm('Sabab bekor qilinsinmi?')) return; try { await dvApi('/api/dav/v1/reason/cancel', { method: 'POST', body: { id: id } }); DV.day = null; dvRender(); } catch (e: any) { alert('⚠️ ' + (e && e.message)); } }

        // ---------------- Tabel ----------------
        async function dvTabelHtml(): Promise<string> {
            if (!DV.m) DV.m = (DV.d || dvToday()).slice(0, 7);
            const r = await dvApi('/api/dav/v1/tabel?m=' + DV.m); DV.tb = r;
            const units = Array.from(new Set((r.rows || []).map((x: any) => x.unitN).filter(Boolean))).sort() as string[];
            const rows = (r.rows || []).filter((x: any) => !DV.unit || x.unitN === DV.unit);
            const cls = (c: string) => c === 'V' ? 'cV' : c === 'B' ? 'cB' : c === 'PR' ? 'cP' : /\*/.test(c) ? 'cK' : c ? 'c8' : '';
            return `<div class="dv-dt"><input type="month" value="${DV.m}" onchange="DV.m=this.value;dvRender()"><label class="dv-fs" style="flex:1"><small>Sex / boʻlim</small><select onchange="DV.unit=this.value;dvRender()"><option value="">Hammasi</option>${units.map(u => `<option${u === DV.unit ? ' selected' : ''}>${dvE(u)}</option>`).join('')}</select></label></div>
                <div class="dv-box dv-scroll"><table class="dv-t"><tr><th>Ishchi</th>${Array.from({ length: r.days }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>Soat</th><th>K/E</th><th>PR</th></tr>
                ${rows.map((x: any) => `<tr><td class="n">${dvE(x.name)}<br><small>${dvE(x.tabel)}</small></td>${x.c.map((c: string) => `<td class="${cls(c)}">${dvE(c.replace('*', ''))}</td>`).join('')}<td>${x.h}</td><td>${x.ke}</td><td>${x.pr}</td></tr>`).join('')}</table>
                <div style="font-size:11px;margin-top:6px;color:#cbd5e1">🟩 soat — ishlagan · 🟨 kech/erta boʻlgan kun · ⬜ V — dam (grafik) · 🟦 B — sababli · 🟥 PR — sababsiz</div></div>
                <button class="dv-btn" onclick="dvTabelXlsx()">📥 Tabel — Excel</button>`;
        }
        function dvTabelXlsx(): void {
            const r = DV.tb; if (!r) return; const rows: any[] = [['Tabel (turniket boʻyicha) — ' + r.m], [], ['Tabel', 'F.I.Sh.', 'Sex / boʻlim'].concat(Array.from({ length: r.days }, (_, i) => String(i + 1))).concat(['Soat', 'Kech/erta', 'Sababsiz'])];
            (r.rows || []).filter((x: any) => !DV.unit || x.unitN === DV.unit).forEach((x: any) => rows.push([x.tabel, x.name, x.unitN].concat(x.c.map((c: string) => c.replace('*', ''))).concat([x.h, x.ke, x.pr])));
            DV9.xlsxDl(rows, 'Tabel ' + r.m);
        }

        // ---------------- Turniketlar ----------------
        async function dvObjHtml(): Promise<string> {
            const d = await dvDay(); let O: any[] = [];
            try { O = (await dvApi('/api/dav/v1/objects')).list || []; } catch (e) { O = DV_OBJ.map(o => ({ obj: o })); }
            const now = Date.now();
            return `<div class="dv-h">🚧 Turniketlar — hozir ichkarida</div><div class="dv-obj">${O.map((o: any, i: number) => { const n = (d.inside || {})[o.obj] || 0, age = o.last ? (now - new Date(o.last).getTime()) / 60000 : 1e9; return `<div onclick="DV.obj='${dvE(o.obj)}';DV.f='all';DV.tab='bugun';dvRender()"><em>${n}</em><b>${i + 1}. ${dvE(o.obj)}</b><small>${o.last ? (age > 60 ? '⚠️ ' : '🟢 ') + 'oxirgi: ' + dvHm(o.last) : '⚪ maʼlumot yoʻq'}${o.n24 ? ' · 24 soatda ' + o.n24 : ''}</small></div>`; }).join('')}</div>
                <div class="dv-box" style="font-size:12.5px">Obyektni bossangiz — oʻsha turniketdagi ishchilar roʻyxati. Turniketdan uzoq vaqt (60 daqiqadan koʻp) maʼlumot kelmasa — ⚠️, shunda «kelmagan» roʻyxatiga ehtiyot boʻlib qarang.</div>`;
        }

        // ---------------- Import (PERCo eksporti) ----------------
        function dvImpOpen(): void {
            DV9.mdl('dvI', `<div class="px-h"><b>📥 Turniket maʼlumotini yuklash</b><button class="mini-btn" onclick="mdlClose('dvI')">✕</button></div>
                <div class="dv-box" style="font-size:12.5px">PERCo-Web → «Журнал событий» (yoki «Отчет о событиях») → Excel / CSV ga eksport. Faylda ustunlar: <b>Таб. №</b>, <b>Дата / Время</b>, <b>Направление</b> (вход / выход) yoki hodisa nomi, <b>Точка доступа / турникет</b>. Bir faylni qayta yuklasangiz — takrorlar qoʻshilmaydi.</div>
                <label class="alb-btn" style="display:block">📂 Fayl tanlash (.xlsx, .xls, .csv)<input type="file" accept=".xlsx,.xls,.csv,.txt" style="display:none" onchange="dvImpFile(this)"></label><div id="dvIr"></div>`, true);
        }
        function dvHdr(s: any): string { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim(); }
        function dvParseRows(rows: any[][]): any {
            let hi = -1, M: any = {};
            for (let i = 0; i < Math.min(rows.length, 40); i++) {
                const h = rows[i].map(dvHdr), m: any = {};
                h.forEach((c: string, j: number) => {
                    if (m.t === undefined && /таб|tabel|табель/.test(c)) m.t = j;
                    else if (m.dt === undefined && /дата.*врем|время.*дата|date.*time/.test(c)) m.dt = j;
                    else if (m.d === undefined && /^дата|^date|^sana/.test(c)) m.d = j;
                    else if (m.tm === undefined && /^время|^time|^vaqt/.test(c)) m.tm = j;
                    else if (m.dir === undefined && /направл|событ|event|yoʻnal|тип/.test(c)) m.dir = j;
                    else if (m.obj === undefined && /точк|турник|устройств|место|зона|контроллер|считыват|device|obyekt|helper/.test(c)) m.obj = j;
                });
                if (m.t !== undefined && (m.dt !== undefined || m.d !== undefined)) { hi = i; M = m; break; }
            }
            if (hi < 0) return { err: 'Sarlavha topilmadi: «Таб. №» va «Дата / Время» ustunlari kerak' };
            const toIso = (v: any, t?: any): string => {
                if (typeof v === 'number') { const ms = Math.round((v - 25569) * 864e5); const d = new Date(ms); return d.toISOString().slice(0, 16); }
                let s = String(v || '').trim(); if (t !== undefined && t !== null && t !== '') { if (typeof t === 'number') { const mm = Math.round(t * 1440) % 1440; s += ' ' + String(Math.floor(mm / 60)).padStart(2, '0') + ':' + String(mm % 60).padStart(2, '0'); } else s += ' ' + String(t).trim(); }
                let m = s.match(/(\d{4})-(\d{2})-(\d{2})[T ]+(\d{1,2}):(\d{2})/); if (m) return m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4].padStart(2, '0') + ':' + m[5];
                m = s.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})\D+(\d{1,2}):(\d{2})/); if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') + 'T' + m[4].padStart(2, '0') + ':' + m[5]; }
                return '';
            };
            const out: any[] = []; let bad = 0;
            for (let i = hi + 1; i < rows.length; i++) {
                const r = rows[i]; if (!r || !r.length) continue;
                const t = String(r[M.t] == null ? '' : r[M.t]).replace(/\D/g, ''); const at = M.dt !== undefined ? toIso(r[M.dt]) : toIso(r[M.d], M.tm !== undefined ? r[M.tm] : null);
                if (!t || !at) { bad++; continue; }
                const dv = dvHdr(M.dir !== undefined ? r[M.dir] : ''); const dir = /выход|exit|chiq|out/.test(dv) ? -1 : /вход|entr|kir|\bin\b/.test(dv) ? 1 : 0;
                out.push({ t: t, at: at, dir: dir, obj: M.obj !== undefined ? String(r[M.obj] || '') : '' });
            }
            return { rows: out, bad: bad };
        }
        async function dvImpFile(inp: any): Promise<void> {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; const box = DV9.$id('dvIr'); box.innerHTML = '<div class="nd-tip">⏳ Oʻqilmoqda…</div>';
            try {
                let rows: any[][] = [];
                if (/\.(csv|txt)$/i.test(f.name)) { const tx = await f.text(), sep = (tx.split('\n')[0].match(/;/g) || []).length > (tx.split('\n')[0].match(/,/g) || []).length ? ';' : (tx.indexOf('\t') >= 0 ? '\t' : ','); rows = tx.split(/\r?\n/).map((l: string) => l.split(sep).map((c: string) => c.replace(/^"|"$/g, ''))); }
                else { const wb = DV9.XLSX.read(DV9.narBinStr(await f.arrayBuffer()), { type: 'binary' }); const ws = wb.Sheets[wb.SheetNames[0]]; rows = DV9.XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }); }
                const P = dvParseRows(rows); if (P.err) { box.innerHTML = `<div class="dv-box">⚠️ ${dvE(P.err)}</div>`; return; }
                let ok = 0, dup = 0, unk = 0;
                for (let i = 0; i < P.rows.length; i += 20000) { box.innerHTML = `<div class="nd-tip">⏳ Yuborilmoqda: ${i} / ${P.rows.length}</div>`; const r = await dvApi('/api/dav/v1/import', { method: 'POST', body: { rows: P.rows.slice(i, i + 20000), src: f.name }, timeout: 120000 }); ok += r.ok || 0; dup += r.dup || 0; unk += r.unknown || 0; }
                box.innerHTML = `<div class="dv-box">✅ ${ok} ta yangi yozuv · ${dup} ta takror · ${unk} ta nomaʼlum tabel${P.bad ? ' · ' + P.bad + ' ta qator oʻqilmadi' : ''}</div>`;
                DV.day = null; if (DV9.$id('screen-dav') && DV9.$id('screen-dav').classList.contains('active')) dvRender();
            } catch (e: any) { box.innerHTML = `<div class="dv-box">⚠️ ${dvE(e && e.message)}</div>`; }
        }

        // ---------------- 🖥 Monitoring oynasi (kompyuter) ----------------
        const DV_MENU = [['dash', '🖥', 'Umumiy nazorat'], ['kirish', '🛂', 'Kirish-chiqish (hammasi)'], ['sababsiz', '🔴', 'Sababsiz kelmaganlar'], ['kecherta', '🟡', 'Kech kelgan / erta ketgan'], ['sababli', '🔵', 'Sababli (balnichniy …)'], ['smena', '🔄', 'Smena grafiklari'], ['obyekt', '🚧', 'Turniketlar — 16 obyekt'], ['tabel', '📅', 'Oylik tabel']];
        async function dvMonOpen(): Promise<void> {
            try { await dvCfg(); } catch (e) { if (!DV.demo) { DV.demo = true; DV.cfg = null; await dvCfg(); } }
            let w = DV9.$id('dvMon'); if (!w) { w = document.createElement('div'); w.id = 'dvMon'; document.body.appendChild(w); }
            w.innerHTML = `<aside class="dm-side"><div class="dm-logo">🛡 SVO · Davomat</div>${DV_MENU.map(m => `<div class="dm-mi${DV.monF === m[0] ? ' on' : ''}" data-k="${m[0]}" onclick="dvMonGo('${m[0]}')"><span>${m[1]}</span>${m[2]}<em id="dmc_${m[0]}"></em></div>`).join('')}
                <div class="dm-sp"></div>${DV.cfg && DV.cfg.imp ? '<div class="dm-mi" onclick="dvImpOpen()"><span>📥</span>Turniket faylini yuklash</div>' : ''}<div class="dm-mi" onclick="dvMonClose()"><span>✕</span>Yopish</div></aside>
                <main class="dm-main"><header class="dm-top"><b id="dmTitle"></b><span class="dm-dt"><button onclick="dvMonDate(-1)">‹</button><input type="date" value="${DV.d || dvToday()}" onchange="DV.d=this.value;dvMonLoad()"><button onclick="dvMonDate(1)">›</button></span><span id="dmClock" class="dm-clock"></span><span id="dmLast" class="dm-last"></span>${DV.demo ? '<span class="dm-demo">🧪 namuna</span>' : ''}</header><div id="dmBody" class="dm-body"></div></main>`;
            document.body.classList.add('dv-mon-on'); DV.d = DV.d || dvToday(); await dvMonLoad();
            clearInterval(DV.tm); DV.tm = setInterval(() => { if (!DV9.$id('dvMon')) { clearInterval(DV.tm); return; } dvMonClock(); if (new Date().getSeconds() < 2 || Date.now() - ((DV.day && DV.day._at) || 0) > 60000) dvMonLoad(); }, 1000);
        }
        function dvMonClose(): void { clearInterval(DV.tm); const w = DV9.$id('dvMon'); if (w) w.remove(); document.body.classList.remove('dv-mon-on'); }
        // 5.7: «Orqaga» (telefon tugmasi ham, suzuvchi ‹ ham) — monitoring oynasi ochiq boʻlsa, avval uni yopadi
        (function (): void {
            const shut = (): boolean => { if (!DV9.$id('dvMon')) return false; dvMonClose(); setTimeout(() => { try { if (typeof DV9.navFab === 'function') DV9.navFab(); } catch (e) { /* */ } }, 50); return true; };
            if (typeof DV9.agmkBack === 'function') { const ob = DV9.agmkBack; DV9.agmkBack = function (this: unknown) { if (shut()) return true; return ob.apply(this, arguments); }; }
            if (typeof DV9.navStep === 'function') DV9.navStep = DV9.agmkExtend('navStep', '5.7: SVO monitoring oynasi', DV9.navStep, (o: Function) => function (this: unknown) { if (shut()) return true; return o.apply(this, arguments); });
            if (typeof DV9.navFab === 'function') DV9.navFab = DV9.agmkExtend('navFab', '5.7: monitoring ochiq — ‹ koʻrinadi', DV9.navFab, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); try { const f = DV9.$id('navBackFab'); if (f && DV9.$id('dvMon')) f.classList.add('on'); } catch (e) { /* */ } return r; });
        })();
        function dvMonClock(): void { const c = DV9.$id('dmClock'); if (c) c.textContent = '🕒 ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
        function dvMonDate(n: number): void { DV.d = dvAddDay(DV.d || dvToday(), n); const i = document.querySelector('#dvMon .dm-dt input') as any; if (i) i.value = DV.d; dvMonLoad(); }
        function dvMonGo(k: string): void { DV.monF = k; document.querySelectorAll('#dvMon .dm-mi[data-k]').forEach((e: any) => e.classList.toggle('on', e.dataset.k === k)); if (k === 'sababsiz' || k === 'sababli') DV.f = k; else if (k === 'kirish' || k === 'dash') DV.f = DV.f || 'all'; dvMonDraw(); }
        async function dvMonLoad(): Promise<void> { try { await dvDay(true); } catch (e: any) { const b = DV9.$id('dmBody'); if (b) b.innerHTML = `<div class="dv-box">⚠️ ${dvE(e && e.message)}</div>`; return; } dvMonDraw(); }
        function dvMonTable(L: any[], cols?: string): string {
            const S: any = DV_ST;
            return `<table class="dm-t"><tr><th>Tabel</th><th>F.I.Sh.</th><th>Sex / boʻlim</th><th>Lavozim</th><th>Smena</th><th>Reja</th><th>Keldi</th><th>Ketdi</th><th>Kech</th><th>Erta</th><th>↔</th><th>Turniket</th><th>Holat</th></tr>
                ${L.slice(0, 600).map((x: any) => `<tr class="h-${x.st}" onclick="dvPerson('${dvE(x.tabel)}')"><td>${dvE(x.tabel)}</td><td class="l">${dvE(x.name)}</td><td class="l">${dvE(x.unitN)}</td><td class="l">${dvE(x.lav)}</td><td>${(DV_CODE[x.code] || ['—'])[0]}${x.guess ? '?' : ''}</td><td>${x.plan ? x.plan.join('–') : ''}</td><td>${dvHm(x.in)}</td><td>${x.out ? dvHm(x.out) : x.inside ? '🟢' : ''}</td><td class="${x.late ? 'k' : ''}">${x.late ? dvMin(x.late) : ''}</td><td class="${x.early ? 'e' : ''}">${x.early ? dvMin(x.early) : ''}</td><td>${x.n_out || ''}</td><td class="l">${dvE(x.obj || '')}</td><td class="l">${(S[x.st] || ['', ''])[0]} ${x.st === 'sababli' && x.reason ? dvE(x.reason.name) : (S[x.st] || ['', x.st])[1]}</td></tr>`).join('')}</table>${L.length > 600 ? `<div class="nd-tip">… yana ${L.length - 600} — filtrni toraytiring</div>` : ''}`;
        }
        async function dvMonDraw(): Promise<void> {
            const b = DV9.$id('dmBody'), d = DV.day; if (!b || !d) return; const L = d.list || [], c = d.cnt || {}, n = L.length, k = DV.monF;
            const t = DV9.$id('dmTitle'); if (t) t.textContent = (DV_MENU.find(m => m[0] === k) || DV_MENU[0])[2] + ' — ' + dvDmy(DV.d);
            const lt = DV9.$id('dmLast'); if (lt) lt.textContent = d.last ? 'turniket: ' + dvDmy(String(d.last).slice(0, 10)) + ' ' + dvHm(d.last) : 'turniket maʼlumoti yoʻq'; if (lt && d.nodata) lt.textContent += ' · ⚫ bu kunga yuklanmagan — sababsiz hisoblanmaydi';
            const set = (id: string, v: any) => { const e = DV9.$id('dmc_' + id); if (e) e.textContent = v ? String(v) : ''; };
            set('sababsiz', c.sababsiz); set('kecherta', (c.kech || 0) + (c.erta || 0)); set('sababli', c.sababli); set('kirish', n);
            const objs = () => `<div class="dm-objs">${DV_OBJ.map((o, i) => `<div onclick="DV.obj='${dvE(o)}';dvMonGo('kirish')"><em>${(d.inside || {})[o] || 0}</em><b>${i + 1}. ${dvE(o)}</b></div>`).join('')}</div>`;
            const red = L.filter((x: any) => x.st === 'sababsiz'), ke = L.filter((x: any) => x.late || x.early).sort((a: any, b2: any) => (b2.late + b2.early) - (a.late + a.early));
            if (k === 'dash') {
                b.innerHTML = `${dvKpi(c, n, 'dvMonF')}<div class="dm-grid"><section class="dm-p dm-wide"><h3>🛂 Kirish-chiqish ${DV.f !== 'all' ? '· filtr' : ''}</h3>${dvFilters(L, 'dvMonSet')}<div class="dm-scroll">${dvMonTable(dvFilter(L, DV.f))}</div></section>
                    <section class="dm-p"><h3>🔴 Sababsiz — ${red.length}</h3><div class="dm-scroll s">${red.map((x: any) => `<div class="dm-li" onclick="dvPerson('${dvE(x.tabel)}')"><b>${dvE(x.name)}</b><small>${dvE(x.unitN)} · ${(DV_CODE[x.code] || [''])[0]} ${x.plan ? x.plan[0] : ''}</small></div>`).join('') || '<div class="nd-tip">— yoʻq</div>'}</div></section>
                    <section class="dm-p"><h3>🟡 Kech / 🟠 erta — ${ke.length}</h3><div class="dm-scroll s">${ke.map((x: any) => `<div class="dm-li" onclick="dvPerson('${dvE(x.tabel)}')"><b>${dvE(x.name)}</b><small>${dvE(x.unitN)} · ${x.late ? '🟡 +' + dvMin(x.late) : ''} ${x.early ? '🟠 −' + dvMin(x.early) : ''}</small></div>`).join('') || '<div class="nd-tip">— yoʻq</div>'}</div></section>
                    <section class="dm-p dm-wide"><h3>🚧 Turniketlar — hozir ichkarida</h3>${objs()}</section></div>`;
            } else if (k === 'kirish' || k === 'sababsiz' || k === 'sababli') {
                if (k !== 'kirish') DV.f = k;
                b.innerHTML = `${dvKpi(c, n, 'dvMonF')}<section class="dm-p">${dvFilters(L, 'dvMonSet')}<div class="dm-scroll xl">${dvMonTable(dvFilter(L, DV.f))}</div><button class="dv-btn" onclick="dvListXlsx()">📥 Excel</button></section>`;
            } else if (k === 'kecherta') {
                b.innerHTML = `${dvKpi(c, n)}<section class="dm-p"><div class="dm-scroll xl">${dvMonTable(ke)}</div></section>`;
            } else if (k === 'obyekt') {
                b.innerHTML = `<section class="dm-p"><h3>🚧 Turniketlar</h3>${await dvObjHtml()}</section>`;
            } else if (k === 'smena') {
                b.innerHTML = `<section class="dm-p">${dvSmenaHtml()}</section>`;
            } else if (k === 'tabel') {
                b.innerHTML = `<section class="dm-p">${await dvTabelHtml()}</section>`;
            }
        }
        function dvMonF(f: string): void { DV.f = f; if (DV.monF === 'sababsiz' || DV.monF === 'sababli') DV.monF = 'kirish'; dvMonDraw(); }
        function dvMonSet(k: string, v: string): void { DV[k] = v; dvMonDraw(); }

        Object.assign(DV9, { DV: DV, dvOpen: dvOpen, dvTab: dvTab, dvRender: dvRender, dvF: dvF, dvSet: dvSet, dvDate: dvDate, dvList: dvList, dvListXlsx: dvListXlsx, dvPerson: dvPerson, dvDemoOn: dvDemoOn,
            dvAssignForm: dvAssignForm, dvAPrev: dvAPrev, dvAList: dvAList, dvATog: dvATog, dvAAll: dvAAll, dvAssignSave: dvAssignSave, dvPatForm: dvPatForm, dvGPrev: dvGPrev, dvPatSave: dvPatSave,
            dvReasonForm: dvReasonForm, dvRFind: dvRFind, dvReasonSave: dvReasonSave, dvReasonDel: dvReasonDel, dvTabelXlsx: dvTabelXlsx, dvImpOpen: dvImpOpen, dvImpFile: dvImpFile, dvParseRows: dvParseRows,
            dvMonOpen: dvMonOpen, dvMonClose: dvMonClose, dvMonGo: dvMonGo, dvMonDate: dvMonDate, dvMonLoad: dvMonLoad, dvMonDraw: dvMonDraw, dvMonF: dvMonF, dvMonSet: dvMonSet, dvDemoDay: dvDemoDay });
        (function () {
            const st = document.createElement('style'); st.textContent = `
            .dv-demo{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(234,179,8,.18);border:1px solid rgba(234,179,8,.5);color:#fde68a;font-size:12.5px}
            .dv-acts{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
            .dv-dt{display:flex;align-items:center;gap:6px;margin:8px 0;color:#cbd5e1;font-size:12px;flex-wrap:wrap}.dv-dt input{flex:1;min-width:0;padding:7px 8px;border-radius:10px;border:0;font-weight:700}.dv-dt .mini-btn{width:auto!important;flex:0 0 auto;padding:6px 14px}.dv-dt>span{flex-basis:100%}.dv-acts .mini-btn{width:auto!important;flex:1 1 auto}
            .dv-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
            .dv-kpi i{font-style:normal;display:flex;flex-direction:column;align-items:center;padding:10px 4px;border-radius:14px;background:rgba(20,30,45,.78);border:1px solid rgba(255,255,255,.14);color:#cbd5e1;font-size:12px}
            .dv-kpi i b{font-size:22px;color:#fff;margin-bottom:2px}.dv-kpi .g b{color:#4ade80}.dv-kpi .y b{color:#facc15}.dv-kpi .o b{color:#fb923c}.dv-kpi .bl b{color:#60a5fa}.dv-kpi .r b{color:#f87171}
            .dv-kf{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.dv-kf i{cursor:pointer;user-select:none;transition:transform .1s,box-shadow .15s;text-align:center;line-height:1.1;padding:6px 3px 7px;border-radius:11px;font-size:11px;white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis}.dv-kf i b{font-size:19px;margin-bottom:1px;font-variant-numeric:tabular-nums;letter-spacing:-.3px}@media (min-width:720px){.dv-kf i{font-size:13px;padding:8px 6px}.dv-kf i b{font-size:22px}}.dv-kf i:active{transform:scale(.96)}.dv-kf i.on{border:2px solid #f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.25);background:rgba(30,41,59,.95)}.dv-kpi .w b{color:#e2e8f0}
            .dv-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
            .dv-chips span{cursor:pointer;padding:7px 11px;border-radius:999px;background:rgba(20,30,45,.8);border:1px solid rgba(255,255,255,.18);color:#e2e8f0;font-size:13px;font-weight:600}
            .dv-chips span em{font-style:normal;margin-left:5px;padding:1px 7px;border-radius:9px;background:rgba(255,255,255,.15)}
            .dv-chips span.on{background:#3b82f6;border-color:#93c5fd;color:#fff}.dv-chips span.on.r{background:#dc2626;border-color:#fca5a5}.dv-chips span.on.bl{background:#2563eb}.dv-chips span.on.y{background:#ca8a04}.dv-chips span.on.o{background:#ea580c}.dv-chips span.on.g{background:#16a34a}
            .dv-f{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:6px 0}
            .dv-fs{display:block;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.92);color:#0f172a}.dv-fs small{display:block;color:#64748b;font-size:10px}.dv-fs select{width:100%;border:0;background:transparent;font-weight:700;font-size:12px;color:#0f172a}
            .dv-q{width:100%;box-sizing:border-box;padding:9px 11px;border-radius:10px;border:0;margin:4px 0 8px;font-size:13px;background:#fff!important;color:#0f172a!important}
            .dv-row{display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border-radius:14px;background:rgba(20,30,45,.82);border:1px solid rgba(255,255,255,.13);color:#fff;cursor:pointer}
            .dv-row .av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;background:#e2e8f0;color:#0f172a;flex:0 0 auto}
            .dv-row .tx{flex:1;min-width:0}.dv-row .tx b{display:block;font-size:14px}.dv-row .tx small{display:block;color:#94a3b8;font-size:11.5px;margin-top:1px}
            .dv-sts{display:flex;flex-direction:column;gap:3px;align-items:flex-end}
            .dv-st{font-size:11px;font-weight:700;padding:4px 8px;border-radius:8px;white-space:nowrap;text-align:center;display:inline-block}
            .st-g{background:rgba(34,197,94,.2);color:#86efac;border:1px solid rgba(34,197,94,.5)}.st-y{background:rgba(234,179,8,.2);color:#fde047;border:1px solid rgba(234,179,8,.5)}
            .st-o{background:rgba(249,115,22,.2);color:#fdba74;border:1px solid rgba(249,115,22,.5)}.st-b{background:rgba(59,130,246,.22);color:#93c5fd;border:1px solid rgba(59,130,246,.5)}
            .st-r{background:rgba(239,68,68,.25);color:#fca5a5;border:1px solid rgba(239,68,68,.6)}.st-n{background:rgba(148,163,184,.15);color:#cbd5e1;border:1px solid rgba(148,163,184,.35)}
            .dv-h{color:#fde68a;font-weight:800;margin:14px 2px 4px;font-size:14px;text-shadow:0 1px 3px #000}
            .dv-box{padding:12px;border-radius:16px;background:rgba(15,23,42,.86);border:1px solid rgba(255,255,255,.15);color:#e2e8f0;margin:8px 0}
            .dv-box b{color:#fff}.dv-scroll{overflow-x:auto}
            .dv-tl{position:relative;margin-left:8px;padding-left:20px;border-left:3px solid rgba(255,255,255,.25)}
            .dv-tl div{position:relative;padding:6px 0 10px}.dv-tl div:before{content:'';position:absolute;left:-28px;top:9px;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid #0f172a}
            .dv-tl div.out:before{background:#f97316}.dv-tl b{font-size:15px;color:#fff}.dv-tl small{display:block;color:#94a3b8}.dv-tl span.gap{display:inline-block;margin-top:4px;font-size:11px;color:#fdba74}
            .dv-t{width:100%;border-collapse:collapse;font-size:11px;color:#e2e8f0}.dv-t th,.dv-t td{border:1px solid rgba(255,255,255,.18);padding:4px 3px;text-align:center}
            .dv-t th{background:rgba(59,130,246,.35);color:#fff}.dv-t td.n{text-align:left;white-space:nowrap}
            .c8,.cW,.cI{background:rgba(34,197,94,.3)}.cD{background:#facc15;color:#111}.cN{background:#4338ca;color:#fff}.cK{background:rgba(234,179,8,.35)}.cB{background:rgba(59,130,246,.4)}.cP{background:rgba(239,68,68,.45)}.cV{background:rgba(148,163,184,.2)}
            .dv-btn{display:block;width:100%;padding:13px;border:0;border-radius:14px;background:linear-gradient(90deg,#2563eb,#3b82f6);color:#fff;font-weight:800;font-size:15px;margin-top:10px;cursor:pointer}.dv-btn.sec{background:rgba(255,255,255,.12)}
            .dv-ck{display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.08);cursor:pointer}
            .dv-ck i{width:20px;height:20px;border-radius:6px;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;color:#fff;flex:0 0 auto}.dv-ck i.no{background:transparent;border:2px solid #64748b;color:transparent}
            .dv-al{max-height:40vh;overflow:auto}
            .dv-obj{display:grid;grid-template-columns:1fr 1fr;gap:8px}
            .dv-obj div{padding:10px;border-radius:14px;background:rgba(20,30,45,.82);border:1px solid rgba(255,255,255,.14);color:#fff;cursor:pointer}
            .dv-obj b{display:block;font-size:13px}.dv-obj small{color:#94a3b8;font-size:11px}.dv-obj em{float:right;font-style:normal;font-weight:800;color:#4ade80;font-size:18px}
            .dv-in{display:block;width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:0;background:#fff;color:#0f172a;font-weight:600;margin:4px 0 8px}
            .dv-lb{font-size:12px;color:#94a3b8;margin-top:6px}
            .dv-sm{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:6px 0}
            .dv-sm span{cursor:pointer;text-align:center;padding:9px 2px;border-radius:10px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);font-size:12px;font-weight:700}
            .dv-sm span small{display:block;font-weight:400;font-size:10px;color:#94a3b8}.dv-sm span.on{background:#2563eb;border-color:#93c5fd}
            /* 🖥 monitoring */
            body.dv-mon-on{overflow:hidden}
            #dvMon{position:fixed;inset:0;z-index:9000;display:flex;background:#0b1220;color:#e2e8f0;font-size:13px}
            #dvMon .dm-side{width:250px;flex:0 0 250px;background:#0f172a;border-right:1px solid rgba(255,255,255,.1);padding:12px 8px;display:flex;flex-direction:column;overflow:auto}
            #dvMon .dm-logo{font-weight:800;font-size:17px;color:#fff;padding:6px 10px 14px}
            #dvMon .dm-mi{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;color:#cbd5e1;font-weight:600}
            #dvMon .dm-mi:hover{background:rgba(255,255,255,.06)}#dvMon .dm-mi.on{background:#2563eb;color:#fff}
            #dvMon .dm-mi em{margin-left:auto;font-style:normal;background:rgba(255,255,255,.15);padding:1px 8px;border-radius:9px;font-size:12px}#dvMon .dm-mi em:empty{display:none}
            #dvMon .dm-sp{flex:1}
            #dvMon .dm-main{flex:1;min-width:0;display:flex;flex-direction:column}
            #dvMon .dm-top{display:flex;align-items:center;gap:14px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.1);background:#111a2e}
            #dvMon .dm-top b{font-size:17px;color:#fff}#dvMon .dm-dt{display:flex;gap:4px;align-items:center}
            #dvMon .dm-dt button{padding:5px 10px;border-radius:8px;border:0;background:rgba(255,255,255,.12);color:#fff;cursor:pointer}#dvMon .dm-dt input{padding:5px 8px;border-radius:8px;border:0}
            #dvMon .dm-clock{margin-left:auto;font-weight:800;color:#fff;font-size:16px}#dvMon .dm-last{color:#94a3b8;font-size:12px}#dvMon .dm-demo{color:#fde68a}
            #dvMon .dm-body{flex:1;overflow:auto;padding:12px 18px}
            #dvMon .dv-kpi{grid-template-columns:repeat(6,1fr)}
            #dvMon .dm-grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1.15fr);gap:12px}
            #dvMon .dm-p{background:#111a2e;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:10px 12px;min-width:0}
            #dvMon .dm-p h3{margin:2px 0 8px;font-size:14px;color:#fde68a}
            #dvMon .dm-grid .dm-wide{grid-column:1/2;grid-row:1/3}#dvMon .dm-grid .dm-wide:last-child{grid-column:1/3;grid-row:auto}#dvMon .dm-grid>section:nth-child(2) .dm-scroll.s,#dvMon .dm-grid>section:nth-child(3) .dm-scroll.s{max-height:26vh}
            #dvMon .dm-scroll{max-height:52vh;overflow:auto}#dvMon .dm-scroll.s{max-height:24vh}#dvMon .dm-scroll.xl{max-height:68vh}
            #dvMon .dm-t{width:100%;border-collapse:collapse;font-size:12px}
            #dvMon .dm-t th{position:sticky;top:0;background:#1e3a8a;color:#fff;padding:6px 5px;text-align:center;font-weight:700}
            #dvMon .dm-t td{padding:5px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center;white-space:nowrap}#dvMon .dm-t td.l{text-align:left}
            #dvMon .dm-t tr{cursor:pointer}#dvMon .dm-t tr:hover td{background:rgba(255,255,255,.06)}
            #dvMon .dm-t tr.h-sababsiz td{background:rgba(239,68,68,.16)}#dvMon .dm-t tr.h-sababli td{background:rgba(59,130,246,.12)}
            #dvMon .dm-t td.k{color:#facc15;font-weight:700}#dvMon .dm-t td.e{color:#fb923c;font-weight:700}
            #dvMon .dm-li{padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.07);cursor:pointer}#dvMon .dm-li b{display:block;color:#fff}#dvMon .dm-li small{color:#94a3b8}
            #dvMon .dm-objs{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
            #dvMon .dm-objs div{padding:8px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);cursor:pointer}#dvMon .dm-objs b{display:block;font-size:11.5px}#dvMon .dm-objs em{float:right;font-style:normal;font-weight:800;color:#4ade80;font-size:18px}
            #dvMon .dv-f{max-width:720px}#dvMon .dv-q{max-width:720px}
            #dvMon .dv-obj{grid-template-columns:repeat(4,1fr)}
            @media (max-width:900px){#dvMon .dm-side{width:64px;flex-basis:64px}#dvMon .dm-mi{font-size:0;justify-content:center}#dvMon .dm-mi span{font-size:20px}#dvMon .dm-logo{font-size:0}#dvMon .dm-grid{grid-template-columns:1fr}#dvMon .dm-grid .dm-wide{grid-column:auto;grid-row:auto}#dvMon .dv-kpi{grid-template-columns:repeat(3,1fr)}#dvMon .dm-objs{grid-template-columns:repeat(2,1fr)}}
            `; document.head.appendChild(st);
        })();
