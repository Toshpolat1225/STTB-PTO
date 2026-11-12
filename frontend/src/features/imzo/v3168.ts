        // =====================================================================
        // v3.16.8 — elektron imzo paketi
        //  1) 🔔 Bildirishnoma (ovoz bilan): yangi hujjat / navbatingiz keldi, imzoladi, rad etdi, hammasi imzoladi,
        //     bekor qilindi va kunlik eslatma (2 kundan beri kutayotgan hujjatlar)
        //  2) Ikki xil qabul qiluvchi: ✍️ imzolovchi (navbat bilan) va 👁 tanishuvchi («Tanishdim», istalgan tartibda)
        //  3) 👥 Guruhga yuborish: sex / uchastka / lavozim boʻyicha bir tugmada
        //  4) 📊 Nazorat: kim imzoladi, kim kutmoqda, kim rad etdi — Excel va PDF
        //  5) Tekshirish oraligʻi 30 → 10 soniya
        //  6) Tasdiq — kirish paroli (4 xonali imzo kodi olib tashlandi); hujjatga bir marta chizilgan
        //     (yoki rasmga olingan) imzo namunasi qoʻyiladi. Parolni server tekshiradi.
        // =====================================================================

        const V8: any = window as any;
        var V8S: any = { ctx: '' };
        var V8G: any = { su: '', uch: '', lav: '', kind: 'tan', ctx: 'up' };
        var V8N: any = { f: 'all' };

        function v8Me(): string { return V8.cleanTabel((typeof V8.sigMe === 'function' && V8.sigMe()) || (typeof V8.meTabel === 'function' ? V8.meTabel() : '')); }
        function v8E(s: unknown): string { return V8.escapeHtml(String(s == null ? '' : s)); }
        function v8Mine(d: any, me?: string): any { const t = me || v8Me(); return (d && d.signers || []).find((x: any) => V8.cleanTabel(x.tabel) === t) || null; }
        function v8Blocker(d: any, x: any): any {
            if (!x || x.kind === 'tan' || !x.o) return null;
            return (d.signers || []).find((z: any) => z.o && z.o < x.o && z.state !== 'sign') || null;
        }
        function v8Turn(d: any, x: any): boolean { return !!x && d.status === 'open' && x.state === 'wait' && !v8Blocker(d, x); }
        function v8Name(x: any): string { return String(x && (x.name || x.label) || ('tabel ' + (x && x.tabel))); }

        // ---------- 6) kirish paroli bilan tasdiqlash ----------
        V8.sigPinOk = function (): Promise<boolean> {
            if (typeof V8.sigSrv === 'function' && !V8.sigSrv()) { alert('✍️ Imzolash korxona serveri orqali ishlaydi — avval serverga ulaning.'); return Promise.resolve(false); }
            return new Promise(res => {
                V8.SIG._pw = (v: boolean) => { V8.SIG._pw = null; V8.mdlClose('sgPw'); res(v); };
                V8.mdl('sgPw', `<div class="px-h"><b>🔐 Imzoni tasdiqlash</b><button class="mini-btn" onclick="SIG._pw && SIG._pw(false)">✕</button></div>
                    <div class="nd-tip">Hujjatni aynan siz imzolayotganingizni tasdiqlash uchun ilovaga <b>kirish parolingizni</b> kiriting. Parolni korxona serveri tekshiradi.</div>
                    <input id="sgPwIn" type="password" class="search-box" autocomplete="current-password" placeholder="Kirish paroli" onkeydown="if(event.key==='Enter') v8PwGo()">
                    <div id="sgPwErr" style="color:#fca5a5;font-size:13px;min-height:18px"></div>
                    <div class="pk-btns"><button onclick="SIG._pw && SIG._pw(false)">Bekor</button><button class="pr" onclick="v8PwGo()">✅ Tasdiqlash</button></div>`, true);
                setTimeout(() => { const i = V8.$id('sgPwIn'); if (i) i.focus(); }, 100);
            });
        };
        async function v8PwGo(): Promise<void> {
            const i = V8.$id('sgPwIn'), v = String(i && i.value || '');
            if (!v) { const e = V8.$id('sgPwErr'); if (e) e.textContent = 'Parolni kiriting.'; return; }
            V8.SIG.pwD = (await V8.sha256hex('agmk:' + v8Me() + ':' + v)).slice(0, 40);
            if (V8.SIG._pw) V8.SIG._pw(true);
        }
        // soʻrovlarga qoʻshiladi: imzolashda — parol, yuborishda — tanishuvchilar va navbat
        if (typeof V8.sigApi === 'function') V8.sigApi = V8.agmkExtend('sigApi', 'v3.16.8: parol, tanishuvchi, navbat', V8.sigApi, (o: Function) => async function (this: unknown, path: string, method: string, body: any) {
            const p = String(path || '');
            if (method === 'POST' && /\/api\/sign\/v1\/docs\/[^/]+\/sign$/.test(p)) {
                V8.SIG.pinD = null;
                if (V8.SIG.pwD) { body = Object.assign({}, body || {}, { pw: V8.SIG.pwD }); delete body.pin; V8.SIG.pwD = null; }
            }
            if (method === 'POST' && p === '/api/sign/v1/docs' && body && Array.isArray(body.signers) && V8S.ctx) {
                const pend = V8S.ctx === 'pend', rows: any[] = pend ? ((V8.SIG.pend || {}).rows || []) : ((V8.UP || {}).rows || []);
                const find = (s: any) => rows.find((r: any) => r.tabel && V8.cleanTabel(r.tabel) === V8.cleanTabel(s.tabel));
                if (rows.length && body.signers.every((s: any) => find(s))) {
                    const seq = pend ? !!(V8.SIG.pend || {}).seq : (V8.UP || {}).seq !== false;
                    body = Object.assign({}, body, { seq: seq ? 1 : undefined, signers: body.signers.map((s: any) => { const r = find(s); return r && r.kind === 'tan' ? Object.assign({}, s, { kind: 'tan' }) : s; }) });
                }
                V8S.ctx = '';
            }
            try { return await o.call(this, path, method, body); }
            catch (e: any) { // serverning aniq javobi umumiy «huquqingiz yoʻq» ga aylanib ketmasin
                const m = String(e && e.message || '');
                if (/\/sign$/.test(p) && /paroli/i.test(m)) throw new Error('🔐 Kirish paroli notoʻgʻri — qaytadan urinib koʻring');
                if (/\/sign$/.test(p) && /Navbat/.test(m)) throw new Error(m.replace(/^Server \d{3}:\s*/, '⏳ '));
                throw e;
            }
        });

        // ---------- 2) holat yozuvlari, navbat, «Tanishdim» ----------
        V8.sigStateTxt = function (x: any): string {
            const n = v8E(v8Name(x)), no = x.o ? x.o + '. ' : '';
            if (x.state === 'reject') return `<span class="no">❌ ${no}${n} — rad: ${v8E(x.reason || '')}</span>`;
            if (x.kind === 'tan') return x.state === 'sign' ? `<span class="ok">👁 ${n} · tanishdi · ${v8E(V8.fmtDT(x.at))}</span>` : `<span class="w">👁 ${n} · tanishishi kutilmoqda</span>`;
            return x.state === 'sign' ? `<span class="ok">✅ ${no}${n} · ${v8E(V8.fmtDT(x.at))}</span>` : `<span class="w">⏳ ${no}${n}</span>`;
        };
        V8.sigWaitOf = function (L: any[], me: string): any[] {
            const t = V8.cleanTabel(me);
            return (L || []).filter((d: any) => d.status === 'open' && (d.signers || []).some((x: any) => V8.cleanTabel(x.tabel) === t && v8Turn(d, x)));
        };
        if (typeof V8.sigBadge === 'function') V8.sigBadge = V8.agmkExtend('sigBadge', 'v3.16.8: faqat navbati kelganlar', V8.sigBadge, (o: Function) => function (this: unknown) { return o.call(this, undefined); });
        if (typeof V8.sigDoSign === 'function') V8.sigDoSign = V8.agmkExtend('sigDoSign', 'v3.16.8: navbat va «Tanishdim»', V8.sigDoSign, (o: Function) => async function (this: unknown, ...a: unknown[]) {
            const d = V8.SIG.cur; if (!d) return; const m = v8Mine(d), b = v8Blocker(d, m);
            if (m && m.state === 'wait' && b) { alert('⏳ Navbatingiz hali kelmagan: avval ' + v8Name(b) + ' imzolashi kerak. Navbatingiz kelganda bildirishnoma keladi.'); return; }
            if (m && m.kind === 'tan') {
                if (!(await V8.uiConfirm('«' + d.title + '» hujjati bilan tanishdingizmi?\n\nTasdiqlash uchun kirish parolingiz soʻraladi.'))) return;
                if (!(await V8.sigPinOk())) return;
                try { await V8.sigApi('/api/sign/v1/docs/' + d.id + '/sign', 'POST', { hash: d.hash }); V8.showToast('👁 Tanishganingiz qayd etildi'); await V8.sigPoll(true); V8.sigOpenDoc(d.id); } catch (e) { alert('⚠️ ' + V8.agmkErrUz(e)); }
                return;
            }
            return o.apply(this, a);
        });
        function v8DocFix(id: string): void {
            const d = V8.SIG.cur, box = V8.$id('sgDoc'); if (!d || d.id !== id || !box) return;
            const m = v8Mine(d); if (!m || m.state !== 'wait' || d.status !== 'open') return;
            const btns = Array.from(box.querySelectorAll('.pk-btns button')) as any[];
            const sb = btns.find(b => /Imzolash/.test(b.textContent) && /sigDoSign/.test(b.getAttribute('onclick') || ''));
            if (!sb || sb._v8) return; sb._v8 = true;
            const bl = v8Blocker(d, m);
            if (bl) { sb.disabled = true; sb.textContent = '⏳ Navbatingiz kelmagan'; const t = document.createElement('div'); t.className = 'hp-warn'; t.textContent = '⏳ Imzolash navbat bilan: avval ' + v8Name(bl) + ' imzolashi kerak. Navbatingiz kelganda bildirishnoma keladi.'; sb.parentNode.insertAdjacentElement('beforebegin', t); }
            else if (m.kind === 'tan') sb.textContent = '👁 Tanishdim';
        }
        if (typeof V8.sigOpenDoc === 'function') V8.sigOpenDoc = V8.agmkExtend('sigOpenDoc', 'v3.16.8: navbat va tanishuvchi', V8.sigOpenDoc, (o: Function) => async function (this: unknown, id: string) {
            [150, 500, 1200].forEach(t => setTimeout(() => v8DocFix(id), t));
            const r = await o.apply(this, arguments); v8DocFix(id); return r;
        });
        if (typeof V8.sigLayout === 'function') V8.sigLayout = V8.agmkExtend('sigLayout', 'v3.16.8: tanishuvchilar jurnalda', V8.sigLayout, (o: Function) => async function (this: unknown, d: any) {
            const lay = await o.apply(this, arguments);
            try {
                const T = (d && d.signers || []).filter((x: any) => x.kind === 'tan');
                if (T.length && lay && lay.pages) lay.pages.forEach((ops: any[]) => ops.forEach((op: any) => {
                    if (op.k === 't' && typeof op.s === 'string' && op.s.indexOf('Imzoladi: ') === 0 && T.some((x: any) => op.s.indexOf('(tabel ' + x.tabel + ')') > 0)) op.s = 'Tanishdi: ' + op.s.slice(10);
                }));
            } catch (e) { /* jurnal oʻzgarishsiz */ }
            return lay;
        });

        // ---------- 1) bildirishnomalar va 5) 10 soniya ----------
        try { V8.SIG.seen = new Proxy({}, { get: () => 1, set: () => true }); } catch (e) { /* eski brauzer — eski xabar qoladi */ }
        function v8N(icon: string, text: string, id: string): void {
            try { V8.notify({ icon: icon, text: text, toTabel: v8Me(), byTabel: 'sys', sigDoc: id }); } catch (e) { /* bildirishnoma yozilmadi */ }
            try { V8.showToast(icon + ' ' + text); } catch (e) { /* */ }
        }
        function v8Scan(): void {
            const me = v8Me(), L: any[] = V8.SIG && V8.SIG.inbox; if (!me || !Array.isArray(L)) return;
            const K = 'agmk_sig_snap_' + me; let prev: any = null;
            try { prev = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) { prev = null; }
            const cur: any = {};
            L.forEach(d => { const s: any = {}; (d.signers || []).forEach((x: any) => { s[x.tabel] = x.state; }); const m = v8Mine(d, me); cur[d.id] = { st: d.status, s: s, t: m && v8Turn(d, m) ? 1 : 0 }; });
            if (prev) L.forEach(d => {
                const p = prev[d.id] || null, c = cur[d.id], m = v8Mine(d, me), T = '«' + d.title + '»';
                if (m && c.t && !(p && p.t)) v8N(m.kind === 'tan' ? '👁' : '✍️', (m.kind === 'tan' ? 'Tanishish uchun hujjat: ' : 'Imzolashingiz kerak: ') + T + (p ? ' — navbatingiz keldi' : ''), d.id);
                if (d.created_by === me && p) {
                    if (c.st === 'done' && p.st !== 'done') v8N('✅', 'Hamma imzoladi: ' + T + ' — PDF tayyor', d.id);
                    (d.signers || []).forEach((x: any) => {
                        const ps = p.s[x.tabel] || 'wait'; if (ps === x.state) return;
                        if (x.state === 'reject') v8N('❌', v8Name(x) + ' rad etdi: ' + T + (x.reason ? ' — ' + x.reason : ''), d.id);
                        else if (x.state === 'sign' && c.st !== 'done' && (d.signers || []).length <= 10) v8N(x.kind === 'tan' ? '👁' : '✍️', v8Name(x) + (x.kind === 'tan' ? ' tanishdi: ' : ' imzoladi: ') + T, d.id);
                    });
                }
                if (m && d.created_by !== me && p && p.st === 'open' && c.st === 'cancelled') v8N('✖', 'Imzolash bekor qilindi: ' + T, d.id);
            });
            try { localStorage.setItem(K, JSON.stringify(cur)); } catch (e) { /* joy yoʻq */ }
            // kunlik eslatma
            const RK = 'agmk_sig_rem_' + me, today = new Date().toISOString().slice(0, 10);
            if (localStorage.getItem(RK) === today) return;
            localStorage.setItem(RK, today);
            const old = (t: string) => Date.now() - Date.parse(t || '') > 2 * 864e5;
            const W = L.filter(d => { const m = v8Mine(d, me); return m && v8Turn(d, m) && old(d.created_at); });
            if (W.length) v8N('⏰', 'Eslatma: ' + W.length + ' ta hujjat 2 kundan beri imzolashingizni (tanishishingizni) kutmoqda', W[0].id);
            const O = L.filter(d => d.created_by === me && d.status === 'open' && old(d.created_at));
            if (O.length) v8N('📤', 'Eslatma: siz yuborgan ' + O.length + ' ta hujjat hali toʻliq imzolanmagan — «📊 Nazorat»da kim kutayotganini koʻring', O[0].id);
        }
        if (typeof V8.sigPoll === 'function') V8.sigPoll = V8.agmkExtend('sigPoll', 'v3.16.8: bildirishnomalar', V8.sigPoll, (o: Function) => async function (this: unknown) {
            const r = await o.apply(this, arguments);
            try { if (V8.sigSrv()) { v8Scan(); V8.sigBadge(); } } catch (e) { /* keyingi tekshiruvda */ }
            return r;
        });
        if (typeof V8.openNotif === 'function') V8.openNotif = V8.agmkExtend('openNotif', 'v3.16.8: imzo hujjati ochiladi', V8.openNotif, (o: Function) => function (this: unknown, id: string) {
            let n: any = null; try { n = V8.getNotifs().find((x: any) => x.id === id); } catch (e) { n = null; }
            const r = o.apply(this, arguments);
            if (n && n.sigDoc) setTimeout(() => { if (V8.sigSrv()) V8.sigOpenDoc(n.sigDoc); else V8.sigOpenList(); }, 100);
            return r;
        });
        try { clearInterval(V8.SIG.timer); } catch (e) { /* */ }
        V8.SIG.timer = setInterval(() => { if (!document.hidden) V8.sigPoll(); }, 10000);

        // ---------- 2–3) yuborish oynalari: imzolovchi / tanishuvchi, navbat, guruh ----------
        function v8Rows(ctx: string): any[] { return ctx === 'pend' ? ((V8.SIG.pend || {}).rows || []) : ((V8.UP || {}).rows || []); }
        function v8ReRender(ctx: string): void { if (ctx === 'pend') V8.sigSendRender(); else V8.upReviewRender(); }
        function v8Kind(ctx: string, i: number): void { const r = v8Rows(ctx)[i]; if (!r) return; r.kind = r.kind === 'tan' ? '' : 'tan'; v8ReRender(ctx); }
        function v8Seq(ctx: string, on: boolean): void { if (ctx === 'pend') { if (V8.SIG.pend) V8.SIG.pend.seq = on; } else if (V8.UP) V8.UP.seq = on; }
        function v8KindBtn(ctx: string, i: number, r: any): HTMLElement {
            const b = document.createElement('button'); b.className = 'v8-k' + (r.kind === 'tan' ? ' tan' : ''); b.type = 'button';
            b.textContent = r.kind === 'tan' ? '👁 Tanishadi' : '✍️ Imzolaydi'; b.title = 'Bosing: imzolovchi ↔ tanishuvchi';
            b.onclick = (e: Event) => { e.stopPropagation(); v8Kind(ctx, i); }; return b;
        }
        function v8Tools(ctx: string, seq: boolean): HTMLElement {
            const R = v8Rows(ctx), nt = R.filter((r: any) => r.on && r.tabel && r.kind === 'tan').length, ns = R.filter((r: any) => r.on && r.tabel && r.kind !== 'tan').length;
            const w = document.createElement('div'); w.className = 'v8-tools';
            w.innerHTML = `<button class="action-btn sec" type="button" onclick="v8GrpOpen('${ctx}')">👥 Guruhni qoʻshish (sex / uchastka / lavozim)</button>
                <label class="v8-seq"><input type="checkbox" ${seq ? 'checked' : ''} onchange="v8SeqSet('${ctx}', this.checked)"> 🔢 Imzolovchilar <b>navbat bilan</b> (roʻyxat tartibida; tanishuvchilar — istalgan vaqtda)</label>
                <div class="v8-cnt">✍️ Imzolovchi: <b>${ns}</b> · 👁 Tanishuvchi: <b>${nt}</b></div>`;
            return w;
        }
        if (typeof V8.upReviewRender === 'function') V8.upReviewRender = V8.agmkExtend('upReviewRender', 'v3.16.8: tanishuvchi, navbat, guruh', V8.upReviewRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); V8S.ctx = 'up';
            try {
                const R = v8Rows('up'), rows = document.querySelectorAll('.up-row');
                rows.forEach((el: any, i: number) => { if (R[i] && R[i].tabel && !el.querySelector('.v8-k')) { const mv = el.querySelector('.up-mv'); const b = v8KindBtn('up', i, R[i]); if (mv) mv.insertAdjacentElement('beforebegin', b); else el.appendChild(b); } });
                const add = document.querySelector('button[onclick="upAdd()"]');
                if (add && !document.querySelector('.v8-tools')) add.insertAdjacentElement('afterend', v8Tools('up', (V8.UP || {}).seq !== false));
            } catch (e) { /* asl koʻrinish qoladi */ }
            return r;
        });
        if (typeof V8.sigSendRender === 'function') V8.sigSendRender = V8.agmkExtend('sigSendRender', 'v3.16.8: tanishuvchi, navbat, guruh', V8.sigSendRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments); V8S.ctx = 'pend';
            try {
                const box = V8.$id('sgSend'), R = v8Rows('pend'); if (!box) return r;
                box.querySelectorAll('.sg-row').forEach((el: any, i: number) => { if (R[i] && !el.querySelector('.v8-k')) el.appendChild(v8KindBtn('pend', i, R[i])); });
                const add = (Array.from(box.querySelectorAll('button')) as any[]).find(b => /Imzo chekuvchi qoʻshish/.test(b.textContent));
                if (add && !box.querySelector('.v8-tools')) add.insertAdjacentElement('afterend', v8Tools('pend', !!(V8.SIG.pend || {}).seq));
            } catch (e) { /* asl koʻrinish qoladi */ }
            return r;
        });
        // ---------- 3.16.9: korxona tartibi — imzolash pastdan yuqoriga ----------
        // Hujjatda rahbariyat tepada, kichik lavozimlar pastda. Imzolash eng pastdagidan (ijrochi, muhandis) boshlanadi,
        // keyin boʻlim boshligʻi va yuqoriroq lavozimlar, eng oxirida «Tasdiqlayman» egasi. Imzo qatoridagilar va matndagi
        // boshqa familiyalar alohida-alohida teskari tartibga qoʻyiladi (imzo qatoridagilar oldin).
        function v8BottomUp(rows: any[]): any[] {
            const s = rows.filter((r: any) => r.sign), n = rows.filter((r: any) => !r.sign);
            return s.reverse().concat(n.reverse());
        }
        if (typeof V8.upFindSigners === 'function') V8.upFindSigners = V8.agmkExtend('upFindSigners', 'v3.16.9: imzolash pastdan yuqoriga', V8.upFindSigners, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { if (V8.UP && Array.isArray(V8.UP.rows)) { V8.UP.rows = v8BottomUp(V8.UP.rows); V8.UP.seq = true; } } catch (e) { /* hujjat tartibi qoladi */ }
            return r;
        });
        if (typeof V8.sigSendRender === 'function') V8.sigSendRender = V8.agmkExtend('sigSendRender', 'v3.16.9: imzolash pastdan yuqoriga', V8.sigSendRender, (o: Function) => function (this: unknown) {
            const P = V8.SIG.pend;
            if (P && !P._v8r && Array.isArray(P.rows)) { P._v8r = 1; P.rows = v8BottomUp(P.rows); if (P.seq === undefined) P.seq = true; }
            const r = o.apply(this, arguments);
            try { const tip = V8.$id('sgSend') && V8.$id('sgSend').querySelector('.nd-tip'); if (tip && P && P.seq) tip.innerHTML = 'Ilova hujjatdagi imzo chekuvchilarni oʻqidi va hisoblariga moslashtirdi. Tekshiring: har qatorda toʻgʻri odam boʻlsin. <b>Imzolash pastdan yuqoriga</b>: roʻyxatdagi 1-odam (hujjatda eng pastdagi) birinchi imzolaydi, eng oxirida rahbariyat. Kerak boʻlsa ↑ ↓ bilan oʻzgartiring.'; } catch (e) { /* */ }
            return r;
        });
        // navbat raqami har qatorda koʻrinadi
        function v8NumRows(ctx: string, sel: string, root: any): void {
            const R = v8Rows(ctx), seq = ctx === 'pend' ? !!(V8.SIG.pend || {}).seq : (V8.UP || {}).seq !== false; let k = 0;
            (root || document).querySelectorAll(sel).forEach((el: any, i: number) => {
                const r = R[i]; let b = el.querySelector('.v8-no'); if (!b) { b = document.createElement('span'); b.className = 'v8-no'; el.insertBefore(b, el.firstChild); }
                const on = r && r.on && r.tabel && r.kind !== 'tan'; b.textContent = seq && on ? (++k) + '' : r && r.kind === 'tan' ? '👁' : '·';
            });
        }
        if (typeof V8.upReviewRender === 'function') V8.upReviewRender = V8.agmkExtend('upReviewRender', 'v3.16.9: navbat raqami', V8.upReviewRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { v8NumRows('up', '.up-row', null); const t = document.querySelector('.v8-tools'); if (t && !t.querySelector('.v8-ord')) { const d = document.createElement('div'); d.className = 'v8-ord nd-tip'; d.innerHTML = '🔢 <b>Imzolash pastdan yuqoriga</b>: 1-raqamli xodim birinchi imzolaydi (hujjatda eng pastdagi — ijrochi), eng oxirida rahbariyat («Tasdiqlayman»). Kerak boʻlsa ↑ ↓ bilan oʻzgartiring.'; t.insertBefore(d, t.firstChild); } } catch (e) { /* */ }
            return r;
        });
        if (typeof V8.sigSendRender === 'function') V8.sigSendRender = V8.agmkExtend('sigSendRender', 'v3.16.9: navbat raqami', V8.sigSendRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const box = V8.$id('sgSend'); v8NumRows('pend', '.sg-row', box); if (box) box.querySelectorAll('.sg-row').forEach((el: any, i: number) => { if (el.querySelector('.v8-mv')) return; const m = document.createElement('span'); m.className = 'v8-mv'; m.innerHTML = `<button type="button" onclick="v8PendMove(${i},-1)">↑</button><button type="button" onclick="v8PendMove(${i},1)">↓</button>`; el.appendChild(m); }); } catch (e) { /* */ }
            return r;
        });
        // navbat belgisini almashtirganda raqamlar yangilanadi
        function v8SeqSet(ctx: string, on: boolean): void { v8Seq(ctx, on); v8ReRender(ctx); }
        function v8PendMove(i: number, d: number): void { const R = v8Rows('pend'), j = i + d; if (j < 0 || j >= R.length) return; const t = R[i]; R[i] = R[j]; R[j] = t; V8.sigSendRender(); }

        // guruh tanlash
        function v8GrpPeople(): any[] { try { return V8.allXodims().filter((r: any) => r.item && r.item.tabel && !r.item.ketgan1c); } catch (e) { return []; } }
        function v8GrpSel(): any[] {
            return v8GrpPeople().filter((r: any) => (!V8G.su || r.su === V8G.su) && (!V8G.uch || r.item.uchastka1c === V8G.uch) && (!V8G.lav || String(r.item.lavozim || '') === V8G.lav));
        }
        function v8GrpOpen(ctx: string): void { V8G.ctx = ctx === 'pend' ? 'pend' : 'up'; v8GrpRender(); }
        function v8GrpRender(): void {
            const X = v8GrpPeople(), uniq = (a: string[]) => Array.from(new Set(a.filter(Boolean))).sort((x, y) => x.localeCompare(y));
            const A = X.filter((r: any) => !V8G.su || r.su === V8G.su), B = A.filter((r: any) => !V8G.uch || r.item.uchastka1c === V8G.uch);
            const opt = (L: string[], v: string, all: string) => `<option value="">${all}</option>` + L.map(x => `<option value="${v8E(x)}"${x === v ? ' selected' : ''}>${v8E(x)}</option>`).join('');
            const S = v8GrpSel();
            V8.mdl('sgGrp', `<div class="px-h"><b>👥 Guruhga yuborish</b><button class="mini-btn" onclick="mdlClose('sgGrp')">✕</button></div>
                <div class="nd-tip">Hujjat tanlangan guruhdagi har bir xodimga boradi. Odatda guruh <b>tanishuvchi</b> boʻladi («Tanishdim» bosadi); kerak boʻlsa — imzolovchi.</div>
                <div class="form-group"><label>Sex / boʻlinma</label><select onchange="V8G.su=this.value; V8G.uch=''; V8G.lav=''; v8GrpRender()">${opt(uniq(X.map((r: any) => r.su)), V8G.su, '— hammasi —')}</select></div>
                <div class="form-group"><label>Uchastka</label><select onchange="V8G.uch=this.value; V8G.lav=''; v8GrpRender()">${opt(uniq(A.map((r: any) => String(r.item.uchastka1c || ''))), V8G.uch, '— hammasi —')}</select></div>
                <div class="form-group"><label>Lavozim</label><select onchange="V8G.lav=this.value; v8GrpRender()">${opt(uniq(B.map((r: any) => String(r.item.lavozim || ''))), V8G.lav, '— hammasi —')}</select></div>
                <div class="form-group"><label>Kim sifatida</label><select onchange="V8G.kind=this.value"><option value="tan"${V8G.kind === 'tan' ? ' selected' : ''}>👁 Tanishuvchi</option><option value=""${V8G.kind !== 'tan' ? ' selected' : ''}>✍️ Imzolovchi</option></select></div>
                <div class="v8-cnt">Tanlandi: <b>${S.length}</b> kishi</div>
                <div class="pk-btns"><button onclick="mdlClose('sgGrp')">Bekor</button><button class="pr" onclick="v8GrpAdd()" ${S.length ? '' : 'disabled'}>➕ ${S.length} kishini qoʻshish</button></div>`, true);
        }
        async function v8GrpAdd(): Promise<void> {
            const S = v8GrpSel(); if (!S.length) return;
            if (!V8G.su && !V8G.uch && !V8G.lav && !(await V8.uiConfirm('Filtr tanlanmagan — butun korxona (' + S.length + ' kishi) qoʻshilsinmi?'))) return;
            const ctx = V8G.ctx, R = v8Rows(ctx); let n = 0;
            if (ctx === 'pend' && !V8.SIG.pend) return;
            S.forEach((x: any) => {
                const t = V8.cleanTabel(x.item.tabel); if (R.some((r: any) => r.tabel && V8.cleanTabel(r.tabel) === t)) return; n++;
                if (ctx === 'pend') R.push({ label: x.item.name, tabel: t, on: true, sign: false, kind: V8G.kind });
                else R.push({ label: '', tabel: t, name: x.item.name, lav: x.item.lavozim || '', st: 'ok', on: true, sign: false, kind: V8G.kind });
            });
            V8.mdlClose('sgGrp'); V8.showToast('👥 Qoʻshildi: ' + n + ' kishi' + (S.length > n ? ' (' + (S.length - n) + ' tasi roʻyxatda bor edi)' : '')); v8ReRender(ctx);
        }

        // ---------- 4) 📊 Nazorat ----------
        function v8DocSt(d: any): string {
            const rej = (d.signers || []).some((x: any) => x.state === 'reject');
            return d.status === 'done' ? '✅ Yakunlandi' : d.status === 'cancelled' ? '✖ Bekor qilingan' : rej ? '❌ Rad etilgan' : '⏳ Jarayonda';
        }
        function v8Cnt(d: any): any {
            const c: any = { sign: 0, tan: 0, wait: 0, rej: 0 };
            (d.signers || []).forEach((x: any) => { if (x.state === 'reject') c.rej++; else if (x.state === 'sign') { if (x.kind === 'tan') c.tan++; else c.sign++; } else c.wait++; });
            return c;
        }
        function v8NazDocs(): any[] {
            const me = v8Me(), adm = typeof V8.isAdminReal === 'function' && V8.isAdminReal();
            const L = ((V8.SIG && V8.SIG.inbox) || []).filter((d: any) => d.created_by === me || adm);
            const f = V8N.f;
            return L.filter((d: any) => f === 'all' || (f === 'open' && d.status === 'open') || (f === 'done' && d.status === 'done') || (f === 'rej' && (d.signers || []).some((x: any) => x.state === 'reject')));
        }
        function v8SgLine(d: any, x: any): string {
            const t = x.kind === 'tan' ? 'tanishuvchi' : 'imzolovchi' + (x.o ? ' №' + x.o : '');
            const st = x.state === 'sign' ? (x.kind === 'tan' ? '👁 tanishdi' : '✅ imzoladi') + ' · ' + v8E(V8.fmtDT(x.at)) : x.state === 'reject' ? '❌ rad etdi · ' + v8E(V8.fmtDT(x.at)) + (x.reason ? ' — ' + v8E(x.reason) : '') : v8Turn(d, x) ? '⏳ kutilmoqda' : '🕓 navbati kelmagan';
            return `<div class="v8-sl ${x.state}"><span>${v8E(v8Name(x))} <small>${v8E(x.tabel)} · ${t}</small></span><span>${st}</span></div>`;
        }
        async function v8Naz(f?: string): Promise<void> {
            if (typeof f === 'string') V8N.f = f;
            if (V8.sigSrv()) { try { await V8.sigPoll(true); } catch (e) { /* oxirgi maʼlumot */ } }
            const D = v8NazDocs(), F = [['all', 'Hammasi'], ['open', '⏳ Jarayonda'], ['done', '✅ Yakunlangan'], ['rej', '❌ Rad etilgan']];
            V8.mdl('sgList', `<div class="px-h"><b>📊 Imzolash nazorati</b><button class="mini-btn" onclick="mdlClose('sgList')">✕</button></div>
                <div class="sg-tabs"><button onclick="sigOpenList('in')">← Imzolash</button>${F.map(([k, t]) => `<button class="${V8N.f === k ? 'on' : ''}" onclick="v8Naz('${k}')">${t}</button>`).join('')}</div>
                <div class="ms-b2" style="margin:6px 0"><button onclick="v8NazXls()">📊 Excel</button><button onclick="v8NazPdf()">📄 PDF</button></div>
                ${D.map((d: any) => { const c = v8Cnt(d), n = (d.signers || []).length; return `<details class="v8-nd"><summary><b>${v8E(d.title)}</b><small>${v8DocSt(d)} · ${v8E(V8.fmtDT(d.created_at))}${d.created_by !== v8Me() ? ' · yubordi ' + v8E(d.created_by) : ''}</small>
                    <span class="v8-bar"><i class="s" style="width:${n ? (c.sign + c.tan) * 100 / n : 0}%"></i><i class="r" style="width:${n ? c.rej * 100 / n : 0}%"></i></span>
                    <small>✅ ${c.sign} imzoladi · 👁 ${c.tan} tanishdi · ⏳ ${c.wait} kutilmoqda · ❌ ${c.rej} rad · jami ${n}</small></summary>
                    ${(d.signers || []).map((x: any) => v8SgLine(d, x)).join('')}<button class="mini-btn" onclick="sigOpenDoc('${v8E(d.id)}')">📄 Hujjatni ochish</button></details>`; }).join('') || '<div class="xt-empty">Siz yuborgan hujjat yoʻq.</div>'}`, true);
        }
        function v8NazRows(): unknown[][] {
            const rows: unknown[][] = [['№', 'Hujjat', 'Yuborilgan', 'Yubordi (tabel)', 'Hujjat holati', 'Xodim', 'Tabel', 'Turi', 'Holati', 'Sana', 'Izoh']]; let i = 0;
            v8NazDocs().forEach((d: any) => (d.signers || []).forEach((x: any) => rows.push([++i, d.title, V8.fmtDT(d.created_at), d.created_by, v8DocSt(d).replace(/^\S+\s/, ''), v8Name(x), x.tabel,
                x.kind === 'tan' ? 'tanishuvchi' : 'imzolovchi' + (x.o ? ' №' + x.o : ''), x.state === 'sign' ? (x.kind === 'tan' ? 'tanishdi' : 'imzoladi') : x.state === 'reject' ? 'rad etdi' : v8Turn(d, x) ? 'kutilmoqda' : 'navbati kelmagan', x.at ? V8.fmtDT(x.at) : '', x.reason || ''])));
            return rows;
        }
        function v8NazXls(): void { const R = v8NazRows(); if (R.length < 2) { alert('Maʼlumot yoʻq.'); return; } V8.xlsxDl(R, 'Imzolash nazorati ' + new Date().toISOString().slice(0, 10)); }
        function v8NazPdf(): void {
            const D = v8NazDocs(); if (!D.length) { alert('Maʼlumot yoʻq.'); return; }
            const td = 'border:1px solid #000;padding:2px 4px;font-size:10pt';
            const html = `<div style="font-family:'Times New Roman',serif;color:#000"><h3 style="text-align:center">Elektron imzolash nazorati — ${v8E(V8.fmtDT(new Date().toISOString()))}</h3>` + D.map((d: any) => { const c = v8Cnt(d);
                return `<p><b>${v8E(d.title)}</b> — ${v8E(v8DocSt(d).replace(/^\S+\s/, ''))}; yuborilgan ${v8E(V8.fmtDT(d.created_at))}; imzoladi ${c.sign}, tanishdi ${c.tan}, kutilmoqda ${c.wait}, rad ${c.rej}</p>
                <table style="border-collapse:collapse;width:100%"><tr><th style="${td}">№</th><th style="${td}">Xodim</th><th style="${td}">Tabel</th><th style="${td}">Turi</th><th style="${td}">Holati</th><th style="${td}">Sana</th></tr>` +
                (d.signers || []).map((x: any, i: number) => `<tr><td style="${td}">${i + 1}</td><td style="${td}">${v8E(v8Name(x))}</td><td style="${td}">${v8E(x.tabel)}</td><td style="${td}">${x.kind === 'tan' ? 'tanishuvchi' : 'imzolovchi'}</td><td style="${td}">${x.state === 'sign' ? (x.kind === 'tan' ? 'tanishdi' : 'imzoladi') : x.state === 'reject' ? 'rad etdi' + (x.reason ? ': ' + v8E(x.reason) : '') : 'kutilmoqda'}</td><td style="${td}">${x.at ? v8E(V8.fmtDT(x.at)) : ''}</td></tr>`).join('') + '</table>'; }).join('') + '</div>';
            try { V8.docDownload([{ name: 'Imzolash_nazorati_' + new Date().toISOString().slice(0, 10) + '.pdf', mime: 'application/pdf', blob: V8.pdfBlobFromHtml(html) }]); V8.showToast('📄 PDF tayyorlandi'); } catch (e) { alert('PDF tayyorlab boʻlmadi: ' + V8.agmkErrUz(e)); }
        }
        if (typeof V8.sigOpenList === 'function') V8.sigOpenList = V8.agmkExtend('sigOpenList', 'v3.16.8: nazorat va navbatdagilar', V8.sigOpenList, (o: Function) => async function (this: unknown, tab: unknown) {
            if (tab === 'naz') return v8Naz();
            const r = await o.apply(this, arguments);
            try {
                const box = V8.$id('sgList'); if (!box) return r;
                const tabs = box.querySelector('.sg-tabs'), me = v8Me(), L: any[] = (V8.SIG && V8.SIG.inbox) || [];
                const adm = typeof V8.isAdminReal === 'function' && V8.isAdminReal();
                if (tabs && !tabs.querySelector('.v8-naz') && (adm || L.some(d => d.created_by === me))) { const b = document.createElement('button'); b.className = 'v8-naz'; b.textContent = '📊 Nazorat'; b.onclick = () => v8Naz(); tabs.appendChild(b); }
                if ((typeof tab !== 'string' || tab === 'in') && V8.sigSrv()) {
                    const Q = L.filter(d => { const m = v8Mine(d, me); return d.status === 'open' && m && m.state === 'wait' && !v8Turn(d, m); });
                    if (Q.length) { const w = document.createElement('div'); w.className = 'v8-q'; w.innerHTML = '<div class="pp-lbl">🕓 NAVBATDA (oldingilar imzolagach ochiladi)</div>' + Q.map(d => { const b = v8Blocker(d, v8Mine(d, me)); return `<div class="sg-doc" onclick="sigOpenDoc('${v8E(d.id)}')"><b>${v8E(d.title)}</b><small>avval: ${v8E(v8Name(b))} · ${v8E(V8.fmtDT(d.created_at))}</small></div>`; }).join(''); const last = box.querySelector('.action-btn.sec'); if (last) last.insertAdjacentElement('beforebegin', w); else box.appendChild(w); }
                }
            } catch (e) { /* asl roʻyxat qoladi */ }
            return r;
        });
        // «Mening imzom»: endi kod emas — kirish paroli
        if (typeof V8.sigOpenMine === 'function') V8.sigOpenMine = V8.agmkExtend('sigOpenMine', 'v3.16.8: parol bilan tasdiq', V8.sigOpenMine, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const cur = V8.$id('sgCur'); if (cur && !V8.$id('v8PwTip')) { const d = document.createElement('div'); d.id = 'v8PwTip'; d.className = 'nd-tip'; d.textContent = '🔐 Har bir hujjatni imzolashda ilovaga kirish parolingiz soʻraladi — hujjatga shu namunadagi imzongiz qoʻyiladi.'; cur.parentNode.insertBefore(d, cur.nextSibling); } } catch (e) { /* */ }
            return r;
        });
        // ---------- mahalliy AI: imzolash haqidagi savollar ----------
        function v8AiSign(q: string): any {
            const n = String(q || '').toLowerCase().replace(/[ʻʼ'`’‘]/g, "'");
            if (!/(imzo|tanish)/.test(n) || !/(kerak|kut|bormi|bor mi|qancha|nechta|hujjat|nazorat|yubor|holat|kim)/.test(n)) return null;
            const me = v8Me(), L: any[] = (V8.sigSrv && V8.sigSrv() ? V8.SIG.inbox : (typeof V8.sigCacheGet === 'function' ? V8.sigCacheGet() : [])) || [];
            const off = V8.sigSrv && V8.sigSrv() ? '' : '\n📴 Server ulanmagan — oxirgi maʼlumot.';
            if (/(nazorat|yubor|yuborgan|kim imzola|kim kut)/.test(n)) {
                const S = L.filter(d => d.created_by === me && d.status === 'open');
                if (!S.length) return { t: '📤 Siz yuborgan, hali yakunlanmagan hujjat yoʻq.' + off, personal: true };
                return { t: '📊 Siz yuborgan jarayondagi hujjatlar (' + S.length + '):\n' + S.slice(0, 8).map(d => { const c = v8Cnt(d), w = (d.signers || []).filter((x: any) => x.state === 'wait').slice(0, 3).map(v8Name).join(', ');
                    return '• «' + d.title + '» — ✅ ' + (c.sign + c.tan) + ' / ' + (d.signers || []).length + (c.rej ? ', ❌ rad ' + c.rej : '') + (w ? '; kutilmoqda: ' + w + (c.wait > 3 ? ' va yana ' + (c.wait - 3) : '') : ''); }).join('\n') + '\nBatafsil: ✍️ Imzolash → 📊 Nazorat.' + off, personal: true };
            }
            const W = V8.sigWaitOf(L, me);
            if (!W.length) return { t: '✍️ Hozir imzolashingiz yoki tanishishingiz kerak boʻlgan hujjat yoʻq.' + off, personal: true };
            return { t: '✍️ Sizni kutayotgan hujjatlar (' + W.length + '):\n' + W.slice(0, 8).map(d => { const m = v8Mine(d, me); return '• «' + d.title + '» — ' + (m && m.kind === 'tan' ? 'tanishish' : 'imzolash') + ', yubordi ' + d.created_by + ', ' + V8.fmtDT(d.created_at); }).join('\n') + '\nOchish: ✍️ Imzolash → 🆕 yangi.' + off, personal: true };
        }
        if (typeof V8.aiStage === 'function') V8.aiStage('Imzolash: kutayotgan hujjatlar va nazorat (3.16.8)', function (q: string, next: Function) {
            try { const r = v8AiSign(q); if (r) return r; } catch (e) { console.error(e); }
            return next(q);
        });
        (function () {
            const st = document.createElement('style');
            st.textContent = `#spRow{display:none!important}
                .v8-k{margin-left:6px;padding:4px 8px;border-radius:8px;border:1px solid #7c3aed;background:rgba(124,58,237,.15);color:inherit;font-size:12px;white-space:nowrap}
                .v8-k.tan{border-color:#0ea5e9;background:rgba(14,165,233,.15)}
                .v8-tools{margin-top:8px;display:flex;flex-direction:column;gap:6px}.v8-seq{font-size:13px;display:flex;gap:6px;align-items:flex-start}.v8-cnt{font-size:13px;color:#94a3b8}
                .v8-nd{border:1px solid rgba(148,163,184,.3);border-radius:10px;padding:8px;margin:6px 0}.v8-nd summary{cursor:pointer;display:flex;flex-direction:column;gap:2px}
                .v8-bar{display:flex;height:6px;border-radius:3px;background:rgba(148,163,184,.25);overflow:hidden}.v8-bar .s{background:#22c55e}.v8-bar .r{background:#ef4444}
                .v8-sl{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:3px 0;border-bottom:1px dashed rgba(148,163,184,.25)}.v8-sl.sign span:last-child{color:#86efac}.v8-sl.reject span:last-child{color:#fca5a5}
                .v8-q{margin-top:10px}
                .v8-no{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:11px;background:#7c3aed;color:#fff;font-size:12px;font-weight:700;margin-right:6px;flex:none}
                .v8-mv{display:inline-flex;gap:2px;margin-left:4px}.v8-mv button{padding:2px 6px;border-radius:6px;border:1px solid rgba(148,163,184,.4);background:transparent;color:inherit}`;
            document.head.appendChild(st);
        })();
