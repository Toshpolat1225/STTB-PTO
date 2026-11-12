        // =====================================================================
        // 4.9 b119 — 🎂 Tugʻilgan kunlar (muallif soʻrovi, 27.10.2026)
        //  • Xodimning tugʻilgan kunidan 1 kun oldin («ertaga») va oʻsha kuni («bugun») — 🔔 bildirishnoma.
        //    Har bir rahbarga — faqat oʻziga boʻysunuvchilar (tuzilma + qoʻlda biriktirilganlar).
        //  • Administrator, kadrlar boʻlimi, STTB rahbariyati — «Ishchi xodimlar» sahifasida yonib turgan 🎂 tugma: soni va roʻyxat (hamma).
        //  Xavfsizlik: tugʻilgan sana ilovaga kelmaydi — server faqat «bugun» / «ertaga» belgisini va ism, lavozim, boʻlinmani beradi
        //  (/api/my/v1/tk). Roʻyxat faqat xotirada turadi; 🔔 roʻyxatiga (agmk_notifs) yozilmaydi — faqat «oʻqildi» belgilari saqlanadi.
        // =====================================================================
        const TK9: any = window as any;
        var TK: any = { d: null, at: 0, fail: 0, day: '', busy: false };
        const TK_READ = 'agmk_tk_read';
        function tkE(s: any): string { return TK9.escapeHtml(String(s == null ? '' : s)); }
        function tkMe(): string { try { const u: any = typeof currentUser !== "undefined" ? currentUser : null; return TK9.cleanTabel(u && u.tabel); } catch (e) { return ''; } }
        function tkReadIds(): string[] { try { return JSON.parse(localStorage.getItem(TK_READ) || '[]') || []; } catch (e) { return []; } }
        function tkReadSave(a: string[]): void { try { localStorage.setItem(TK_READ, JSON.stringify(Array.from(new Set(a)).slice(-400))); } catch (e) { /* */ } }
        function tkWho(x: any): string { return x.name + (x.lav ? ' (' + x.lav + (x.unitN ? ', ' + x.unitN : '') + ')' : x.unitN ? ' (' + x.unitN + ')' : ''); }
        // 🔔 uchun: faqat oʻziga boʻysunuvchilar (mine)
        function tkNotifs(): any[] {
            const d = TK.d, me = tkMe(); if (!d || !me || !Array.isArray(d.list)) return [];
            const R = tkReadIds();
            return d.list.filter((x: any) => x.mine).map((x: any) => {
                const id = 'tk:' + d.date + ':' + x.kun + ':' + x.tabel;
                return { id: id, icon: '🎂', tk: 1, at: d.date + 'T00:00:00', byTabel: 'sys', toTabel: me, read: R.includes(id) ? [me] : [],
                    text: (x.kun === 'bugun' ? 'Bugun — ' : 'Ertaga — ') + tkWho(x) + ' tugʻilgan kuni.' + (x.kun === 'bugun' ? ' Tabriklashni unutmang!' : '') };
            });
        }
        // 🔔 roʻyxatiga qoʻshish: getNotifs — xotiradagi 🎂 xabarlar bilan; saveNotifs — ularni ajratib, faqat «oʻqildi» belgisini saqlaydi
        if (typeof TK9.getNotifs === 'function') TK9.getNotifs = TK9.agmkExtend('getNotifs', '4.9 b119: 🎂 tugʻilgan kunlar', TK9.getNotifs, (o: Function) => function (this: unknown) {
            const l = o.apply(this, arguments); try { return (l || []).concat(tkNotifs()); } catch (e) { return l; }
        });
        if (typeof TK9.saveNotifs === 'function') TK9.saveNotifs = TK9.agmkExtend('saveNotifs', '4.9 b119: 🎂 xabarlar serverga/xotiraga yozilmaydi', TK9.saveNotifs, (o: Function) => function (this: unknown, l: any[]) {
            try { const me = tkMe(), R = tkReadIds(); (l || []).forEach((n: any) => { if (n && n.tk && (n.read || []).includes(me)) R.push(n.id); }); tkReadSave(R); } catch (e) { /* */ }
            return o.call(this, (l || []).filter((n: any) => !(n && n.tk)));
        });
        if (typeof TK9.openNotif === 'function') TK9.openNotif = TK9.agmkExtend('openNotif', '4.9 b119: 🎂 xabar — roʻyxat', TK9.openNotif, (o: Function) => function (this: unknown, id: string) {
            const r = o.apply(this, arguments); try { if (/^tk:/.test(String(id))) tkOpen(); } catch (e) { /* */ } return r;
        });
        // Serverdan olish: kuniga yangilanadi, 30 daqiqada bir tekshiriladi; server boʻlmasa — jim
        async function tkLoad(force?: boolean): Promise<void> {
            const me = tkMe(); if (!me || TK.busy || typeof TK9.sbFetch !== 'function') return;
            // 5.9: server manzili sozlanmagan boʻlsa (oflayn / sinov) — soʻrov yuborilmaydi (oldin file:///api/… xatosi konsolga chiqar edi)
            try { const c = typeof TK9.syncCfg === 'function' ? TK9.syncCfg() : null; if (!c || !c.url) return; } catch (e) { return; }
            const day = new Date().toDateString();
            if (!force && TK.day === day && Date.now() - TK.at < 30 * 60000) return;
            if (!force && TK.fail && Date.now() - TK.at < 10 * 60000) return;
            TK.busy = true;
            try {
                const before = new Set(tkNotifs().map((n: any) => n.id));
                const d = await TK9.sbFetch('/api/my/v1/tk', { method: 'GET' });
                if (d && Array.isArray(d.list)) { TK.d = d; TK.fail = 0; TK.day = day; TK.me = me; }
                TK.at = Date.now();
                const fresh = tkNotifs().filter((n: any) => !before.has(n.id) && !n.read.length);
                try { TK9.updateRnBadges(); } catch (e) { /* */ }
                if (fresh.length) { try { if (typeof TK9.nsPlay === 'function') TK9.nsPlay(); } catch (e) { /* */ } }
                tkCardRefresh();
            } catch (e) { TK.fail = 1; TK.at = Date.now(); }
            finally { TK.busy = false; }
        }
        // Boshqa foydalanuvchi kirsa — eski roʻyxat koʻrinmasin
        function tkTick(): void { const me = tkMe(); if (TK.me && TK.me !== me) { TK.d = null; TK.me = ''; TK.day = ''; } if (me) tkLoad(); }
        setTimeout(tkTick, 6000); setInterval(tkTick, 60000);

        // ---- Roʻyxat oynasi
        function tkOpen(): void {
            const d = TK.d, L = d && Array.isArray(d.list) ? d.list : [];
            const grp = (k: string, t: string) => { const xs = L.filter((x: any) => x.kun === k); return `<div class="kq-h">${t} — ${xs.length}</div>` + (xs.map((x: any) => `<div class="kq-p tk-p" onclick="tkPass('${tkE(x.tabel)}')"><span><b>🎂 ${tkE(x.name)}</b><small>${tkE(x.lav || '')}${x.unitN ? ' · ' + tkE(x.unitN) : ''}${x.grpN ? ' · ' + tkE(x.grpN) : ''}</small></span><em>${tkE(x.tabel)}</em></div>`).join('') || '<div class="nd-tip">— yoʻq</div>'); };
            TK9.mdl('tkM', `<div class="px-h"><b>🎂 Tugʻilgan kunlar${d && d.all ? ' — butun STTB' : ''}</b><button class="mini-btn" onclick="mdlClose('tkM')">✕</button></div>
                ${d ? grp('bugun', 'Bugun') + grp('ertaga', 'Ertaga') : '<div class="nd-tip">⏳ Roʻyxat serverdan olinmoqda… Bu boʻlim korxona serveriga ulanganda ishlaydi.</div>'}
                <div class="nd-tip" style="margin-top:10px">Tugʻilgan sana ilovada saqlanmaydi — server faqat bugun va ertaga tugʻilgan kuni boʻlganlarni koʻrsatadi.</div>`, true);
            if (!d) tkLoad(true).then(() => { if (TK.d && TK9.$id('tkM')) tkOpen(); });
        }
        function tkPass(t: string): void { try { if (typeof TK9.myPass === 'function') { TK9.mdlClose('tkM'); TK9.myPass(t); } } catch (e) { console.error(e); } }

        // ---- «Ishchi xodimlar»: administrator, kadrlar, rahbariyat uchun yonib turgan 🎂 tugma
        function tkCardHtml(): string {
            const d = TK.d; if (!d || !d.all) return '';
            const b = d.list.filter((x: any) => x.kun === 'bugun').length, e = d.list.filter((x: any) => x.kun === 'ertaga').length, n = b + e;
            return `<div class="btn-card xt-unit tk-card${n ? ' on' : ''}" id="tkCard" onclick="tkOpen()"><div class="btn-card-content"><span class="btn-text">🎂 Tugʻilgan kunlar<span class="xt-sub">Bugun: ${b} · Ertaga: ${e}</span></span></div><span class="tk-n">${n}</span></div>`;
        }
        function tkCardRefresh(): void { const c = TK9.$id('tkCard'), h = tkCardHtml(); if (c) { if (h) c.outerHTML = h; else c.remove(); } else if (h) { const X: any = typeof XT !== "undefined" ? XT : {}, hd = document.querySelector('#xtList .xt-head'), q = TK9.$id('xtSearch'); if (hd && !X.u && !X.g && !X.pos && !X.w && !X.none && !(q && q.value.trim())) hd.insertAdjacentHTML('afterend', h); } }
        if (typeof TK9.xwRoot === 'function') TK9.xwRoot = TK9.agmkExtend('xwRoot', '4.9 b119: 🎂 tugʻilgan kunlar tugmasi', TK9.xwRoot, (o: Function) => function (this: unknown) {
            let h = o.apply(this, arguments); try { const c = tkCardHtml(); if (c) { const i = h.indexOf('</div>', h.indexOf('class="xt-head"')); if (i > 0) h = h.slice(0, i + 6) + c + h.slice(i + 6); } tkLoad(); } catch (e) { console.error(e); } return h;
        });
        Object.assign(TK9, { tkLoad: tkLoad, tkOpen: tkOpen, tkPass: tkPass, tkNotifs: tkNotifs, TK: TK });
        (function () { const st = document.createElement('style'); st.textContent = '.tk-card{position:relative}.tk-card .tk-n{min-width:34px;height:34px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-weight:800;background:rgba(128,128,128,.25);margin-left:8px}.tk-card.on{border-color:#f59e0b!important;box-shadow:0 0 0 2px rgba(245,158,11,.35),0 0 18px rgba(245,158,11,.45);animation:tkGlow 1.6s ease-in-out infinite}.tk-card.on .tk-n{background:#f59e0b;color:#111}@keyframes tkGlow{50%{box-shadow:0 0 0 3px rgba(245,158,11,.6),0 0 26px rgba(245,158,11,.7)}}.tk-p{cursor:pointer}.tk-p em{font-style:normal;opacity:.6;font-size:12px}'; document.head.appendChild(st); })();
