        // =====================================================================
        // 5.9 — 13-band (muallif, 02.11.2026 10:42–11:24): Gmail (yoki boshqa ilova) → AGMK-STTB
        //  Gmail da faylni bosganda «Открыть в приложении» / «Поделиться» roʻyxatida AGMK-STTB chiqadi (APK 5.9).
        //  Fayl «Загрузки» ga tushmaydi — toʻgʻridan-toʻgʻri ilovaga keladi:
        //   • «📥 Kelgan fayllar» oynasi: fayllar roʻyxati, texnika turi (oxirgi tanlangan eslab qolinadi), master;
        //   • master ish turi boʻyicha oʻzi taniladi (spravka sarlavhasi: «Ремонт … колесной пары», «капитальный ремонт
        //     думпкар» …) — bir marta tasdiqlangach eslab qolinadi; topilmasa «Bu kimniki?» — roʻyxatdan tanlanadi;
        //   • «📊 Hisobot tekshiruviga» → odatdagi «📦 Oylik toʻplamni tekshirish» (oy, Forma-30, XODIM toʻldirilgan);
        //   • «⬇️ Faqat saqlash» → «Yuklab olinganlar» roʻyxatiga.
        //  9-band uchun: APK fayl saqlaganda uning manzilini (content://) beradi → «Yuklab olinganlar» dan ochish
        //  takroriy nusxa yaratmaydi (AgmkNative.openUri). Internetga hech narsa ketmaydi.
        // =====================================================================
        const IN9: any = window as any;
        var IN59: any = { files: [], cat: '', who: '', keys: [], saved: {} };
        var IN59_WHO = 'agmk_in59_who', IN59_CAT = 'agmk_in59_cat';
        function in59Kv(k: string, d: any): any { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
        function in59KvSet(k: string, v: any): void { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } }
        function in59B64(b64: string, mime: string): Blob { const s = atob(b64 || ''), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Blob([u], { type: mime || 'application/octet-stream' }); }
        // ish turi kaliti (spravka/defektovka sarlavhasidan): «remont-elv-kp», «kr-dumpkar», …
        function in59Key(t: string): string {
            const s = String(t || '').toLowerCase().replace(/ё/g, 'е');
            const what = /колесн/.test(s) ? 'kp' : /думпкар|вагон|хоппер|цистерн|платформ/.test(s) ? 'vag' : /кран|рукав|воздухораспр|главн/.test(s) ? 'tormoz' : /электровоз/.test(s) ? 'elv' : /тепловоз/.test(s) ? 'tep' : '';
            if (!what) return '';
            const how = /наплав|обточ/.test(s) ? 'nap' : /капиталь/.test(s) ? 'kr' : /деповск/.test(s) ? 'dr' : /освид|ремонт/.test(s) ? 'rem' : 'x';
            const loc = /электровоз/.test(s) ? '-elv' : /тепловоз/.test(s) ? '-tep' : '';
            return what + '-' + how + loc;
        }
        function in59KeysOf(P: any): string[] {
            const K = new Set<string>();
            (P && P.sheets || []).forEach((x: any) => { if (x.type !== 'spr' && x.type !== 'dv') return; (x.rows || []).slice(0, 60).forEach((r: any) => { const t = (r || []).filter((c: any) => c != null && c !== '').join(' '); if (/ремонт|освидет|наплав|обточ/i.test(t) && t.length < 200) { const k = in59Key(t); if (k) K.add(k); } }); });
            return Array.from(K);
        }
        function in59Guess(keys: string[]): string { const m = in59Kv(IN59_WHO, {}); for (const k of keys) if (m[k]) return m[k]; return ''; }
        function in59People(): string[] { try { return (IN9.allXodims() || []).map((r: any) => r.item && r.item.name).filter(Boolean); } catch (e) { return []; } }
        // APK dan kelgan fayllar
        function agmkIncomingPoll(): void {
            try {
                const N = IN9.AgmkNative; if (!N || typeof N.takeIncoming !== 'function') return;
                const s = N.takeIncoming(); if (!s) return;
                const L = JSON.parse(s); if (!Array.isArray(L) || !L.length) return;
                const files = L.map((x: any) => { const b = in59B64(x.b64, x.mime); try { return new File([b], String(x.name || 'fayl'), { type: b.type }); } catch (e) { (b as any).name = String(x.name || 'fayl'); return b; } });
                in59Open(files);
            } catch (e) { try { IN9.showToast('⚠️ Kelgan faylni oʻqib boʻlmadi'); } catch (x) { /* */ } }
        }
        function in59Open(files: any[]): void {
            if (!files || !files.length) return;
            if (typeof currentUser !== 'undefined' && !currentUser) { IN59.files = files; IN59.wait = 1; return; }
            IN59.files = files; IN59.cat = in59Kv(IN59_CAT, 'vagon');
            const E = IN9.escapeHtml, cats = (typeof HS_CATS !== 'undefined' ? HS_CATS : []) as any[];
            const ic = (n: string) => { const e = String(n).toLowerCase().split('.').pop() || ''; return /^xls/.test(e) ? '📊' : /^doc|rtf/.test(e) ? '📝' : e === 'pdf' ? '📄' : '📎'; };
            const sz = (n: number) => n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
            IN9.mdl('in59M', `<div class="px-h"><b>📥 Kelgan fayllar (${files.length})</b><button class="mini-btn" onclick="mdlClose('in59M')">✕</button></div>
                <div class="nd-tip">Fayllar boshqa ilovadan (masalan Gmail) toʻgʻridan-toʻgʻri keldi — «Загрузки» ga tushmadi.</div>
                <div class="in59-l">${files.map((f: any) => `<div class="in59-r"><i>${ic(f.name)}</i><b>${E(f.name)}</b><small>${sz(f.size || 0)}</small></div>`).join('')}</div>
                <div class="nd-f"><label>TEXNIKA TURI (boʻlim)</label><select id="in59Cat">${cats.map((c: any) => `<option value="${E(c.k)}"${c.k === IN59.cat ? ' selected' : ''}>${E(c.ic + ' ' + c.t)}</option>`).join('')}</select></div>
                <button class="action-btn" onclick="in59Go('chk')">📊 Hisobot tekshiruviga (oylik toʻplam)</button>
                <button class="action-btn sec" onclick="in59Go('save')">⬇️ Faqat saqlash («Yuklab olinganlar»)</button>`, true);
        }
        async function in59Go(a: string): Promise<void> {
            const files = IN59.files || []; if (!files.length) return;
            const cat = String((IN9.$id('in59Cat') || {}).value || IN59.cat || 'vagon'); in59KvSet(IN59_CAT, cat);
            IN9.mdlClose('in59M');
            if (a === 'save') {
                try { if (typeof IN9.dl59Rec === 'function') { const r = await IN9.dl59Rec(files.map((f: any) => ({ name: f.name, blob: f }))); if (r && typeof IN9.dl59Toast === 'function') IN9.dl59Toast(r, files.length); } } catch (e) { /* */ }
                return;
            }
            try { IN9.openHisob(); IN9.HS.tab = 'hisob'; IN9.HS.cat = cat; IN9.HS.chk = null; IN9.hsRender(); } catch (e) { /* */ }
            IN59.auto = 1; await IN9.hpStart(cat, files);
        }
        // «📦 Oylik toʻplam» oynasi: master ish turidan oʻzi; topilmasa — roʻyxatdan tanlash; tekshirilganda eslab qolinadi
        if (typeof IN9.hpDlg === 'function') IN9.hpDlg = IN9.agmkExtend('hpDlg', '5.9: master ish turi boʻyicha', IN9.hpDlg, (o: Function) => function (this: unknown) {
            try { const P = IN9.HPK && IN9.HPK.pend; if (P) { P.in59keys = in59KeysOf(P); if (!P.who) { const g = in59Guess(P.in59keys); if (g) { P.who = g; P.in59g = 1; } } } } catch (e) { /* */ }
            const r = o.apply(this, arguments);
            try {
                const P = IN9.HPK && IN9.HPK.pend, inp = IN9.$id('hp_who'); if (!P || !inp) return r;
                const ppl = in59People(); if (ppl.length && !IN9.$id('in59Ppl')) { const dl = document.createElement('datalist'); dl.id = 'in59Ppl'; dl.innerHTML = ppl.slice(0, 3000).map((n: string) => '<option value="' + IN9.escapeHtml(n) + '">').join(''); document.body.appendChild(dl); }
                inp.setAttribute('list', 'in59Ppl');
                const tip = document.createElement('div'); tip.className = 'in59-who';
                tip.innerHTML = P.in59g ? '👤 Master ish turi boʻyicha topildi: <b>' + IN9.escapeHtml(P.who) + '</b> — notoʻgʻri boʻlsa oʻzgartiring.' : (P.in59keys && P.in59keys.length ? '❓ <b>Bu kimniki?</b> Masterni tanlang — keyingi safar shu ish turi uchun oʻzi chiqadi.' : '');
                if (tip.innerHTML) { const f = inp.closest('.nd-2') || inp.parentElement; f.parentElement.insertBefore(tip, f.nextSibling); }
            } catch (e) { /* */ }
            return r;
        });
        if (typeof IN9.hpRun === 'function') IN9.hpRun = IN9.agmkExtend('hpRun', '5.9: master ish turini eslab qolish', IN9.hpRun, (o: Function) => async function (this: unknown) {
            try { const P = IN9.HPK && IN9.HPK.pend, w = String((IN9.$id('hp_who') || {}).value || '').trim(); if (P && w && P.in59keys && P.in59keys.length) { const m = in59Kv(IN59_WHO, {}); P.in59keys.forEach((k: string) => { m[k] = w; }); in59KvSet(IN59_WHO, m); } } catch (e) { /* */ }
            return o.apply(this, arguments);
        });
        // 9-band: APK saqlagan fayl manzili
        function agmkSaved(name: string, uri: string): void {
            try {
                IN59.saved[String(name)] = { uri: String(uri), at: Date.now() };
                const key = 'agmk_dl59'; const L = JSON.parse(localStorage.getItem(key) || '[]');
                const r = Array.isArray(L) ? L.find((x: any) => x && !x.uri && (x.name === name || String(x.name).replace(/[\\/:*?"<>|]/g, '_') === name) && Date.now() - Date.parse(x.at) < 120000) : null;
                if (r) { r.uri = String(uri); localStorage.setItem(key, JSON.stringify(L)); }
            } catch (e) { /* */ }
        }
        if (typeof IN9.dl59Open === 'function') IN9.dl59Open = IN9.agmkExtend('dl59Open', '5.9: APK — saqlangan faylni takroriy nusxasiz ochish', IN9.dl59Open, (o: Function) => async function (this: unknown, id: string) {
            try {
                const N = IN9.AgmkNative, r = (IN9.dl59All() || []).find((x: any) => x.id === id);
                let uri = r && r.uri; if (r && !uri) { const s = IN59.saved[r.name]; if (s && Math.abs(s.at - Date.parse(r.at)) < 120000) uri = s.uri; }
                if (uri && N && typeof N.openUri === 'function' && N.openUri(uri, r.mime || 'application/octet-stream')) return;
            } catch (e) { /* */ }
            return o.apply(this, arguments);
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v59inCss';
            st.textContent = `
            .in59-l{display:flex;flex-direction:column;gap:5px;margin:8px 0;max-height:40vh;overflow:auto}
            .in59-r{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;background:rgba(30,41,59,.75);border:1px solid rgba(255,255,255,.08)}
            .in59-r i{font-style:normal;font-size:20px}.in59-r b{flex:1;min-width:0;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.in59-r small{color:#94a3b8;font-size:11.5px}
            .in59-who{margin:4px 0 8px;padding:8px 10px;border-radius:10px;background:rgba(3,105,161,.25);border:1px solid rgba(56,189,248,.4);color:#e0f2fe;font-size:12.5px}
            `;
            document.head.appendChild(st);
        })();
        // ilova ochilganda / kirgandan keyin — kutib turgan fayllar
        setTimeout(agmkIncomingPoll, 2500);
        window.addEventListener('agmk:login', () => setTimeout(() => { agmkIncomingPoll(); if (IN59.wait && IN59.files.length) { IN59.wait = 0; in59Open(IN59.files); } }, 600));
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(agmkIncomingPoll, 400); });
        Object.assign(IN9, { IN59: IN59, agmkIncomingPoll: agmkIncomingPoll, agmkSaved: agmkSaved, in59Open: in59Open, in59Go: in59Go, in59Key: in59Key });
