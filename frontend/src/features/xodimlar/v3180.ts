        // =====================================================================
        // v3.18.0 — «👷 Mening hodimlarim» va «🧥 Maxsus kiyim» (docs/TALABLAR_3.18.md)
        //  • Har bir rahbar oʻzidan pastdagilarni koʻradi (tuzilma boʻyicha, server hisoblaydi); oʻrinbosar — oʻzidan keyingilarni;
        //    usta — oʻz uchastkasi ishchilarini. Qoʻshimcha: qoʻlda biriktirish / olib tashlash (komandirovka, prikaz) — sabab va muddat bilan.
        //  • Ikki koʻrinish: 📋 Roʻyxat va 🏛 Struktura (faqat oʻzi va oʻzidan pastdagilar).
        //  • Qisqa pasport: tabel, tugʻilgan sana, razryad, manzil, telefon, TB imtihonlari, maxsus kiyim, taʼtil oyi.
        //    Shaxsiy maʼlumot (manzil, telefon, tugʻilgan sana, taʼtil) ilovaga joylanmaydi — serverdan, faqat ruxsati borga.
        //  • Maxsus kiyim: OʻzR 3617-son namunaviy normalari + xalqaro standartlar; ombor kiritadi, xodim «Oldim» deb tasdiqlaydi,
        //    rahbar va TB koʻradi; muddati kelganlar roʻyxati.
        //  • Kadrlar (1C) Excel importi: manzil, telefon, tugʻilgan sana, taʼtil oyi, razryad.
        // =====================================================================
        const VA: any = window as any;
        var MY: any = { d: null, view: 'list', q: '', f: '', at: 0, kn: null };
        var KY: any = { t: '', d: null };

        function myE(s: unknown): string { return VA.escapeHtml(String(s == null ? '' : s)); }
        function myMsg(e: any): string { return String((e && e.message) || e || 'Xato').replace(/^Server \d+:\s*/, ''); }
        async function myApi(path: string, method?: string, body?: unknown): Promise<any> { return VA.sbFetch(path, { method: method || 'GET', body: body }); }
        function myD(iso: unknown): string { const s = String(iso || ''); const m = s.match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? m[3] + '.' + m[2] + '.' + m[1] : (s || '—'); }
        function myAge(iso: unknown): string { const m = String(iso || '').match(/^(\d{4})-(\d\d)-(\d\d)/); if (!m) return ''; const n = new Date(), b = new Date(+m[1], +m[2] - 1, +m[3]); let a = n.getFullYear() - b.getFullYear(); if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--; return a > 0 && a < 100 ? ' (' + a + ' yosh)' : ''; }
        var MY_OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        function myIsRole(r: string): boolean { try { return VA.isAdmin() || VA.hasRole(r); } catch (e) { return false; } }
        function myLeader(): boolean {
            try { if (myIsRole('rahbar') || myIsRole('kadr')) return true; const it = VA.xodimByTabel(VA.meTabel()); const r = typeof VA.v9Rank === 'function' && it ? VA.v9Rank(it.lavozim) : 6; return r <= 5; } catch (e) { return false; }
        }
        try { if (typeof VA.ROLE_DEF !== 'undefined' && !VA.ROLE_DEF.some((x: any) => x[0] === 'ombor')) VA.ROLE_DEF.push(['ombor', '🧥', 'Maxsus kiyim beruvchi (ombor)', 'Xodimlarga berilgan maxsus kiyimni kiritadi, muddati kelganlar roʻyxatini koʻradi']); } catch (e) { /* */ }

        // ---------------------------------------------------------------- Mening hodimlarim
        async function myOpen(): Promise<void> {
            VA.secScreen('screen-my', '👷 Mening hodimlarim'); VA.openScreen('screen-my');
            const b = VA.secBody('screen-my'); if (!MY.d) b.innerHTML = '<div class="nd-tip">⏳ Roʻyxat serverdan olinmoqda…</div>';
            try { MY.d = await myApi('/api/my/v1'); MY.at = Date.now(); myRender(); }
            catch (e) { b.innerHTML = '<div class="nd-tip">⚠️ ' + myE(myMsg(e)) + '<br>Bu boʻlim korxona serveriga ulanganda ishlaydi.</div><button class="action-btn sec" onclick="myOpen()">🔄 Qayta urinish</button>'; }
        }
        function myFilt(): any[] {
            const q = VA.normTxt ? VA.normTxt(MY.q || '') : String(MY.q || '').toLowerCase();
            return (MY.d.list || []).filter((x: any) => {
                if (MY.f === 'kiy' && !(x.kiy && (x.kiy.due || x.kiy.soon))) return false;
                if (MY.f === 'add' && x.via !== 'add') return false;
                if (!q) return true; const s = [x.name, x.tabel, x.lav, x.unitN, x.grpN, x.uch].join(' ');
                return (VA.normTxt ? VA.normTxt(s) : s.toLowerCase()).indexOf(q) >= 0;
            });
        }
        function myBadges(x: any): string {
            let h = '';
            if (x.kiy && x.kiy.due) h += `<span class="my-b bad">🧥 ${x.kiy.due}</span>`; else if (x.kiy && x.kiy.soon) h += `<span class="my-b warn">🧥 ${x.kiy.soon}</span>`;
            if (x.via === 'add') h += `<span class="my-b add" title="${myE(x.rel && x.rel.why)}">✈️ ${x.rel && x.rel.to ? myD(x.rel.to) + ' gacha' : 'biriktirilgan'}</span>`;
            return h;
        }
        function myRow(x: any): string {
            return `<div class="my-row" onclick="myPass('${myE(x.tabel)}')"><div class="my-n"><b>${myE(x.name)}</b><small>${myE(x.lav)}${x.grpN ? ' · ' + myE(x.grpN) : x.unitN ? ' · ' + myE(x.unitN) : ''} · ${myE(x.tabel)}</small></div><div class="my-bs">${myBadges(x)}</div></div>`;
        }
        function myRender(): void {
            const b = VA.secBody('screen-my'); if (!b || !MY.d) return; const d = MY.d, L = myFilt();
            const kiyN = (d.list || []).filter((x: any) => x.kiy && x.kiy.due).length, addN = (d.list || []).filter((x: any) => x.via === 'add').length;
            let h = `<div class="my-head"><div><b>${myE(d.me.name || '')}</b><small>${myE(d.me.lav || '')}${d.me.grpN ? ' · ' + myE(d.me.grpN) : d.me.unitN ? ' · ' + myE(d.me.unitN) : ''}</small></div><span class="my-cnt">${d.n} ta</span></div>
                <div class="my-tabs"><button class="${MY.view === 'list' ? 'on' : ''}" onclick="MY.view='list';myRender()">📋 Roʻyxat</button><button class="${MY.view === 'st' ? 'on' : ''}" onclick="MY.view='st';myRender()">🏛 Struktura</button></div>
                <div class="my-tools"><button class="mini-btn" onclick="myAdd()">➕ Biriktirish</button><button class="mini-btn" onclick="kiyOpen('')">🧥 Mening kiyimim</button>${d.can && (d.can.ombor || d.can.kiy) ? '<button class="mini-btn" onclick="kiyOmbor()">📦 Muddati kelganlar</button>' : ''}${d.can && d.can.hr ? '<button class="mini-btn" onclick="hrImport()">🗂 Kadrlar Excel</button>' : ''}${d.n ? '<button class="mini-btn" onclick="myXlsx()">⬇️ Roʻyxat</button>' : ''}</div>`;
            if (!d.n) {
                h += `<div class="nd-tip">Sizga hozircha hech kim biriktirilmagan.<br>• Rahbar, oʻrinbosar va ustalarga qoʻl ostidagilar tuzilma boʻyicha oʻzi chiqadi — buning uchun kadrlar «🏛 Struktura»da sizni toʻgʻri lavozim oʻrniga qoʻygan boʻlishi kerak.<br>• Vaqtincha (komandirovka, prikaz) xodimni «➕ Biriktirish» bilan oʻzingiz qoʻshing.</div>`;
            } else if (MY.view === 'list') {
                h += `<input class="search-box" id="myQ" placeholder="🔎 Ism, tabel, lavozim, uchastka…" value="${myE(MY.q)}" oninput="MY.q=this.value;clearTimeout(MY.tm);MY.tm=setTimeout(myRender,250)">
                    <div class="my-flt"><button class="${!MY.f ? 'on' : ''}" onclick="MY.f='';myRender()">Hammasi ${d.n}</button><button class="${MY.f === 'kiy' ? 'on' : ''}" onclick="MY.f='kiy';myRender()">🧥 Kiyim muddati ${kiyN}</button>${addN ? `<button class="${MY.f === 'add' ? 'on' : ''}" onclick="MY.f='add';myRender()">✈️ Biriktirilgan ${addN}</button>` : ''}</div>
                    <div class="my-list">${L.slice(0, 400).map(myRow).join('') || '<div class="nd-tip">Topilmadi</div>'}${L.length > 400 ? `<div class="nd-tip">Yana ${L.length - 400} ta — qidiruvdan foydalaning</div>` : ''}</div>`;
            } else h += myTree();
            const R = (d.rels || []);
            if (R.length) h += `<details class="hs-box my-rels"><summary>✈️ Qoʻlda biriktirish va olib tashlashlar (${R.length})</summary>${R.map((r: any) => `<div class="my-rel${r.cancelled ? ' off' : ''}"><div><b>${r.op === 'add' ? '➕' : '➖'} ${myE(r.name || r.tabel)}</b><small>${myE(r.why)} · ${myD(r.from)}${r.to ? ' – ' + myD(r.to) : ' dan'}${r.cancelled ? ' · bekor qilingan' : ''}</small></div>${r.cancelled ? '' : `<button class="mini-btn" onclick="myRelCancel(${r.id})">Bekor</button>`}</div>`).join('')}</details>`;
            h += `<div class="nd-tip">Roʻyxat tuzilma boʻyicha server tomonidan hisoblanadi. Manzil, telefon va tugʻilgan sana faqat sizga boʻysunuvchi xodimlarniki koʻrinadi va telefonda saqlanmaydi.</div>`;
            b.innerHTML = h;
            if (MY.view === 'list' && MY.q) { const i = VA.$id('myQ'); if (i && document.activeElement !== i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) { /* */ } } }
        }
        // Struktura: men → (boʻlinma) → uchastka/boʻlim → lavozim → xodimlar
        function myTree(): string {
            const d = MY.d, L = d.list || [];
            const by = (arr: any[], k: (x: any) => string) => { const m = new Map<string, any[]>(); arr.forEach(x => { const key = k(x); if (!m.has(key)) m.set(key, []); (m.get(key) as any[]).push(x); }); return m; };
            const lavBox = (arr: any[]) => Array.from(by(arr.slice().sort((a, b) => a.rank - b.rank || String(a.lav).localeCompare(String(b.lav))), x => x.lav).entries()).map(([lav, xs]) =>
                `<details class="my-tn lv"${xs.length <= 6 ? ' open' : ''}><summary><span>${myE(lav)}</span><em>${xs.length}</em></summary>${xs.map((x: any) => `<div class="my-tp" onclick="myPass('${myE(x.tabel)}')"><b>${myE(x.name)}</b><small>${myE(x.tabel)}</small>${myBadges(x)}</div>`).join('')}</details>`).join('');
            const grpBox = (arr: any[]) => Array.from(by(arr, x => x.grpN || '').entries()).sort((a, b) => (a[0] ? 1 : 0) - (b[0] ? 1 : 0) || a[0].localeCompare(b[0])).map(([g, xs]) =>
                g ? `<details class="my-tn gr"><summary><span>📍 ${myE(g)}</span><em>${xs.length}</em></summary>${lavBox(xs)}</details>` : lavBox(xs)).join('');
            const units = by(L, x => x.unitN || '—'), multi = units.size > 1;
            const body = multi ? Array.from(units.entries()).map(([u, xs]) => `<details class="my-tn un"><summary><span>🏢 ${myE(u)}</span><em>${xs.length}</em></summary>${grpBox(xs)}</details>`).join('') : grpBox(L);
            return `<div class="my-tree"><div class="my-root"><b>👤 ${myE(d.me.name || '')}</b><small>${myE(d.me.lav || '')}</small><em>${d.n} ta xodim</em></div><div class="my-kids">${body}</div></div>`;
        }
        function myXlsx(): void {
            const L = myFilt(), rows: any[] = [['Mening hodimlarim — ' + (MY.d.me.name || '') + ' · ' + new Date().toLocaleDateString('ru-RU')], [], ['№', 'Tabel', 'F.I.Sh.', 'Lavozim', 'Boʻlinma', 'Uchastka / boʻlim', 'Maxsus kiyim (muddati kelgan)', 'Izoh']];
            L.forEach((x: any, i: number) => rows.push([i + 1, x.tabel, x.name, x.lav, x.unitN, x.grpN || x.uch || '', x.kiy && x.kiy.due ? x.kiy.due + ' ta' : '', x.via === 'add' ? 'Biriktirilgan: ' + ((x.rel && x.rel.why) || '') : '']));
            VA.xlsxDl(rows, 'Mening hodimlarim');
        }

        // ---------------------------------------------------------------- qisqa pasport
        async function myPass(t: string): Promise<void> {
            VA.mdl('myPass', '<div class="nd-tip">⏳ Yuklanmoqda…</div>', true);
            let p: any; try { p = await myApi('/api/my/v1/p?t=' + encodeURIComponent(t)); } catch (e) { VA.mdl('myPass', `<div class="px-h"><b>Pasport</b><button class="mini-btn" onclick="mdlClose('myPass')">✕</button></div><div class="nd-tip">⚠️ ${myE(myMsg(e))}</div>`, true); return; }
            const x = (MY.d && (MY.d.list || []).find((z: any) => z.tabel === t)) || {}, k = p.kiy || { rows: [] };
            const due = (k.rows || []).filter((r: any) => r.st === 'kech' || r.st === 'kerak'), soon = (k.rows || []).filter((r: any) => r.st === 'yaqin');
            const tel = p.phone ? String(p.phone).split(/[,;]/).map((s: string) => s.trim()).filter(Boolean) : [];
            const row = (l: string, v: string) => `<div class="my-pr"><span>${l}</span><b>${v}</b></div>`;
            VA.mdl('myPass', `<div class="px-h"><b>🪪 ${myE(p.name)}</b><button class="mini-btn" onclick="mdlClose('myPass')">✕</button></div>
                <div class="my-ps">${row('Tabel', myE(p.tabel))}${row('Lavozim', myE(p.lav))}${row('Ish joyi', myE([p.unitN, p.grpN || p.uch].filter(Boolean).join(' · ')) || '—')}
                ${row('Tugʻilgan sana', p.birth ? myD(p.birth) + myAge(p.birth) : '—')}${row('Razryad', p.razryad ? myE(p.razryad) : '—')}
                ${row('Manzil', p.address ? myE(p.address) : '—')}${row('Telefon', tel.length ? tel.map((s: string) => `<a href="tel:${myE(s.replace(/[^\d+]/g, ''))}">${myE(s)}</a>`).join(', ') : '—')}
                ${row('Mehnat taʼtili', p.tatil ? MY_OY[p.tatil - 1] + ' oyida' : '—')}</div>
                ${!p.hrAt && !p.phone ? '<div class="nd-tip">Manzil, telefon va taʼtil oyi kadrlar boʻlimi 1C dan Excel import qilgach chiqadi.</div>' : ''}
                <div class="my-sec"><b>📘 Mehnat muhofazasi — imtihonlar</b>${myTbHtml(p.tabel)}</div>
                <div class="my-sec"><b>🧥 Maxsus kiyim</b><small>${myE(k.grpNom || '')}</small>
                    <div class="my-kch">${due.length ? due.map((r: any) => `<span class="my-b bad">${myE(r.nom)}${r.next ? ' · ' + myD(r.next) : ' · olinmagan'}</span>`).join('') : '<span class="my-b ok">✓ Muddati oʻtgan yoʻq</span>'}${soon.map((r: any) => `<span class="my-b warn">${myE(r.nom)} · ${myD(r.next)}</span>`).join('')}</div>
                    <button class="action-btn sec" onclick="kiyOpen('${myE(p.tabel)}')">🧥 Maxsus kiyim — tarix va norma</button></div>
                <div class="my-acts">${x.via === 'add' && x.rel ? `<button class="action-btn sec" onclick="myRelCancel(${x.rel.id})">✈️ Biriktirishni bekor qilish</button>` : x.via === 'auto' ? `<button class="action-btn sec" onclick="myDel('${myE(p.tabel)}')">➖ Roʻyxatimdan olib tashlash</button>` : ''}</div>`, true);
        }
        function myTbHtml(t: string): string {
            try {
                const pid = 't:' + VA.cleanTabel(t); let h = '';
                if (typeof VA.mbTypesOf === 'function' && typeof VA.mbStat === 'function' && typeof VA.mbBadge === 'function') { const d = VA.mbData(); h += VA.mbTypesOf(pid, d).map((ty: string) => VA.mbBadge(ty, VA.mbStat(pid, ty, d))).join(''); }
                const it = typeof VA.xodimByTabel === 'function' ? VA.xodimByTabel(t) : null;
                if (it && typeof VA.mmStat === 'function' && typeof VA.mmBadge === 'function') { const s = VA.mmStat(it); ['davriy', 'tibbiy'].forEach(k2 => { if (s[k2]) h += VA.mmBadge(k2, s[k2]); }); }
                return h ? `<div class="mm-badges my-tb">${h}</div>` : '<div class="nd-tip">Imtihon sanalari kiritilmagan</div>';
            } catch (e) { return '<div class="nd-tip">—</div>'; }
        }

        // ---------------------------------------------------------------- qoʻlda biriktirish
        function myAdd(pre?: string): void {
            const today = new Date().toISOString().slice(0, 10);
            const subs = ((MY.d && MY.d.list) || []).filter((x: any) => x.rank <= 5 && x.itr);
            VA.mdl('myAddM', `<div class="px-h"><b>➕ Xodim biriktirish</b><button class="mini-btn" onclick="mdlClose('myAddM')">✕</button></div>
                <div class="nd-tip">Komandirovka yoki prikaz bilan vaqtincha biriktirilgan xodim. Muddat tugagach roʻyxatdan oʻzi chiqadi.</div>
                <div class="mm-f"><label>Xodim (ism yoki tabel)</label><input class="search-box" id="myAddQ" placeholder="🔎 kamida 2 harf" oninput="clearTimeout(MY.ft);MY.ft=setTimeout(myFind,300)" value="${myE(pre || '')}"></div>
                <div id="myAddR" class="my-find"></div><input type="hidden" id="myAddT">
                ${subs.length ? `<div class="mm-f"><label>Kimga biriktiriladi</label><select id="myAddB"><option value="">Oʻzimga</option>${subs.map((x: any) => `<option value="${myE(x.tabel)}">${myE(x.name)} — ${myE(x.lav)}</option>`).join('')}</select></div>` : ''}
                <div class="mm-f"><label>Sabab (komandirovka, prikaz №…)</label><input class="search-box" id="myAddW" maxlength="300"></div>
                <div class="my-2"><div class="mm-f"><label>Boshlanishi</label><input type="date" id="myAddF" value="${today}"></div><div class="mm-f"><label>Tugashi (ixtiyoriy)</label><input type="date" id="myAddTo"></div></div>
                <button class="action-btn" onclick="myAddSave()">✅ Biriktirish</button>`, true);
            if (pre) myFind();
        }
        async function myFind(): Promise<void> {
            const q = (VA.$id('myAddQ') || {}).value || '', box = VA.$id('myAddR'); if (!box) return; if (q.trim().length < 2) { box.innerHTML = ''; return; }
            try { const L = await myApi('/api/my/v1/find?q=' + encodeURIComponent(q.trim())); box.innerHTML = (L || []).map((x: any) => `<div class="my-row sm" onclick="myPick('${myE(x.tabel)}',this)"><div class="my-n"><b>${myE(x.name)}</b><small>${myE(x.lav)} · ${myE(x.unitN)}${x.grpN ? ' · ' + myE(x.grpN) : ''} · ${myE(x.tabel)}</small></div></div>`).join('') || '<div class="nd-tip">Topilmadi</div>'; }
            catch (e) { box.innerHTML = '<div class="nd-tip">⚠️ ' + myE(myMsg(e)) + '</div>'; }
        }
        function myPick(t: string, el: any): void { (VA.$id('myAddT') as any).value = t; document.querySelectorAll('#myAddR .my-row').forEach(r => r.classList.toggle('on', r === el)); }
        async function myAddSave(): Promise<void> {
            const t = (VA.$id('myAddT') || {}).value, w = ((VA.$id('myAddW') || {}).value || '').trim();
            if (!t) { VA.showToast('Avval xodimni tanlang'); return; } if (!w) { VA.showToast('Sababini yozing'); return; }
            try { await myApi('/api/my/v1/rel', 'POST', { tabel: t, boss: (VA.$id('myAddB') || {}).value || '', op: 'add', why: w, from: (VA.$id('myAddF') || {}).value, to: (VA.$id('myAddTo') || {}).value });
                VA.mdlClose('myAddM'); VA.showToast('✅ Biriktirildi'); myOpen(); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function myDel(t: string): Promise<void> {
            const w = await VA.uiPrompt('Nima uchun roʻyxatingizdan olib tashlanadi? (masalan: boshqa uchastkaga oʻtkazilgan, prikaz №)', ''); if (!w || !String(w).trim()) return;
            try { await myApi('/api/my/v1/rel', 'POST', { tabel: t, op: 'del', why: String(w).trim() }); VA.mdlClose('myPass'); VA.showToast('➖ Olib tashlandi'); myOpen(); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function myRelCancel(id: number): Promise<void> {
            if (!(await VA.uiConfirm('Biriktirish / olib tashlash bekor qilinsinmi?'))) return;
            try { await myApi('/api/my/v1/rel/cancel', 'POST', { id: id }); VA.mdlClose('myPass'); VA.showToast('Bekor qilindi'); myOpen(); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }

        // ---------------------------------------------------------------- kadrlar (1C) Excel importi
        function hrImport(): void {
            VA.mdl('hrImp', `<div class="px-h"><b>🗂 Kadrlar maʼlumoti (1C Excel)</b><button class="mini-btn" onclick="mdlClose('hrImp')">✕</button></div>
                <div class="nd-tip">Excel faylda ustunlar: <b>Tabel</b> (shart), Tugʻilgan sana, Telefon, Manzil, Taʼtil oyi, Razryad. Sarlavhalar oʻzbekcha yoki ruscha boʻlishi mumkin (Табельный №, Дата рождения, Телефон, Адрес, Отпуск, Разряд). Boʻsh katak avvalgi qiymatni oʻchirmaydi.</div>
                <input type="file" id="hrFile" accept=".xlsx,.xls,.csv" onchange="hrRead(this)"><div id="hrPrev"></div>`, true);
        }
        function hrDate(v: any): string {
            if (v === '' || v == null) return '';
            if (typeof v === 'number' && v > 1000 && v < 80000) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000); return d.toISOString().slice(0, 10); }
            const s = String(v).trim(); let m = s.match(/^(\d{4})-(\d\d)-(\d\d)/); if (m) return m[0];
            m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
            return '';
        }
        var HR_RU_OY = ['январ', 'феврал', 'март', 'апрел', 'ма', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
        function hrMonth(v: any): number | '' {
            if (v === '' || v == null) return ''; if (typeof v === 'number') { if (v >= 1 && v <= 12) return Math.round(v); const d = hrDate(v); return d ? +d.slice(5, 7) : ''; }
            const s = String(v).trim().toLowerCase(); if (/^\d{1,2}$/.test(s) && +s >= 1 && +s <= 12) return +s; const d = hrDate(s); if (d) return +d.slice(5, 7);
            for (let i = 0; i < 12; i++) { if (s.startsWith(MY_OY[i].slice(0, 3)) || (i === 4 ? /^ма[йя]/.test(s) : s.startsWith(HR_RU_OY[i]))) return i + 1; }
            return '';
        }
        var HR_COLS: any = { tabel: /tabel|табел|таб\.?\s*№|таб\.?\s*номер|^таб/, birth: /tug.?il|рожд|birth/, phone: /tel|телеф|моб/, address: /manzil|адрес|yashash|прожив/, tatil: /ta.?til|tatil|отпуск/, razryad: /razryad|разряд/ };
        var HRI: any = { rows: null, src: '' };
        async function hrRead(inp: any): Promise<void> {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return; const box = VA.$id('hrPrev'); box.innerHTML = '⏳ Oʻqilmoqda…';
            try {
                const book = VA.narReadBookBs(VA.narBinStr(await f.arrayBuffer())); let out: any[] = [], cols: any = null;
                for (const sh of book) {
                    for (let i = 0; i < Math.min(15, sh.rows.length) && !cols; i++) { const r = sh.rows[i].map((c: any) => String(c || '').toLowerCase()); const c: any = {}; Object.keys(HR_COLS).forEach(k => { const j = r.findIndex((s: string) => HR_COLS[k].test(s)); if (j >= 0) c[k] = j; }); if (c.tabel !== undefined && Object.keys(c).length >= 2) { cols = c; cols._r = i; } }
                    if (cols) { for (let i = cols._r + 1; i < sh.rows.length; i++) { const r = sh.rows[i], t = VA.cleanTabel(r[cols.tabel]); if (!/^\d{1,12}$/.test(t)) continue;
                        out.push({ tabel: t, birth: cols.birth !== undefined ? hrDate(r[cols.birth]) : '', phone: cols.phone !== undefined ? String(r[cols.phone] || '').trim() : '', address: cols.address !== undefined ? String(r[cols.address] || '').trim() : '', tatil: cols.tatil !== undefined ? hrMonth(r[cols.tatil]) : '', razryad: cols.razryad !== undefined ? r[cols.razryad] : '' }); } break; }
                }
                if (!cols) throw new Error('Sarlavhada «Tabel» ustuni topilmadi');
                HRI.rows = out; HRI.src = f.name;
                const has = (k: string) => out.filter(x => x[k]).length;
                box.innerHTML = `<div class="nd-tip">«${myE(f.name)}»: ${out.length} ta xodim. Topilgan: tugʻilgan sana ${has('birth')}, telefon ${has('phone')}, manzil ${has('address')}, taʼtil oyi ${has('tatil')}, razryad ${has('razryad')}.</div><button class="action-btn" onclick="hrSend()">⬆️ Serverga yuklash</button>`;
            } catch (e) { box.innerHTML = '<div class="nd-tip">⚠️ ' + myE(myMsg(e)) + '</div>'; }
        }
        async function hrSend(): Promise<void> {
            if (!HRI.rows || !HRI.rows.length) return;
            try { const r = await myApi('/api/hr/v1/import', 'POST', { src: HRI.src, rows: HRI.rows }); VA.$id('hrPrev').innerHTML = `<div class="nd-tip">✅ ${r.n} ta xodim maʼlumoti saqlandi.${r.nUnknown ? ' ⚠️ ' + r.nUnknown + ' ta tabel shtat/ishchilar roʻyxatida yoʻq: ' + myE((r.unknown || []).slice(0, 10).join(', ')) : ''}${(r.badDate || []).length ? ' Sanasi oʻqilmadi: ' + myE(r.badDate.slice(0, 10).join(', ')) : ''}</div>`; HRI.rows = null; }
            catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }

        // ---------------------------------------------------------------- maxsus kiyim
        var KY_ST: any = { kech: ['bad', 'Muddati oʻtgan'], kerak: ['bad', 'Olinmagan'], yaqin: ['warn', '30 kun ichida'], ok: ['ok', 'Muddati bor'], navb: ['nv', 'Navbatchi (ish joyida)'] };
        function kyTerm(oy: number): string { return oy === 0 ? 'yaroqsiz boʻlguncha' : oy % 12 === 0 ? (oy === 12 ? 'har yili' : (oy / 12) + ' yilda 1') : oy + ' oyda 1'; }
        var KY_SHN: any = { karyer: 'razrez/karyer', elektrovoz: 'elektrovoz', TXP: 'texnik xizmat punkti', shovqin: 'shovqinli ish', temirchi: 'temirchi', 'nam ish': 'nam ish', 'kimyoviy ombor': 'kimyoviy ombor', 'chang/gaz': 'chang/gaz' };
        async function kiyOpen(t: string): Promise<void> {
            KY.t = t || ''; VA.mdl('kiyM', '<div class="nd-tip">⏳ Yuklanmoqda…</div>', true);
            try { KY.d = await myApi('/api/kiy/v1/p' + (t ? '?t=' + encodeURIComponent(t) : '')); kiyRender(); }
            catch (e) { VA.mdl('kiyM', `<div class="px-h"><b>🧥 Maxsus kiyim</b><button class="mini-btn" onclick="mdlClose('kiyM')">✕</button></div><div class="nd-tip">⚠️ ${myE(myMsg(e))}</div>`, true); }
        }
        function kiyRender(): void {
            const d = KY.d, p = d.person, pl = d.plan, c = d.can || {}, sz = d.size || {};
            const unack = (d.hist || []).filter((h: any) => !h.ack && !h.cancelled);
            const rows = pl.rows.map((r: any) => { const s = KY_ST[r.st] || ['', r.st];
                return `<tr class="${s[0]}"><td>${myE(r.nom)}${r.soni > 1 ? ' — ' + r.soni + ' juft' : ''}${r.mavsum === 'qish' ? ' <i class="my-w">qishki</i>' : ''}<small>${myE(r.std)}${r.manba && r.manba.indexOf('korxona') === 0 ? ' · korxona taklifi' : ''}</small></td><td>${kyTerm(r.oy)}<small>${r.last ? 'oxirgi: ' + myD(r.last) : r.navb ? '' : 'olinmagan'}</small></td><td><span class="my-b ${s[0]}">${r.next ? myD(r.next) : s[1]}</span></td></tr>`; }).join('');
            const hist = (d.hist || []).map((h: any) => `<div class="my-kh${h.cancelled ? ' off' : ''}"><div><b>${myD(h.date)} · ${myE(h.nom)}${h.qty > 1 ? ' ×' + h.qty : ''}${h.size ? ' · ' + myE(h.size) : ''}</b><small>${myE(h.byN || h.by)}${h.note ? ' · ' + myE(h.note) : ''}${h.cancelled ? ' · ❌ bekor: ' + myE(h.cancelWhy || '') : h.ack ? ' · ✅ oldi ' + myD(h.ack) : ' · ⏳ tasdiqlanmagan'}</small></div>${c.issue && !h.cancelled ? `<button class="mini-btn" onclick="kiyCancel(${h.id})">❌</button>` : ''}</div>`).join('') || '<div class="nd-tip">Hali hech narsa berilmagan</div>';
            VA.mdl('kiyM', `<div class="px-h"><b>🧥 ${myE(p.name)}</b><button class="mini-btn" onclick="mdlClose('kiyM')">✕</button></div>
                <div class="my-kh0"><small>${myE(p.lav)} · ${myE(p.tabel)}</small><div><b>Norma:</b> ${myE(pl.grpNom)} <small>(${myE(pl.band || '')}${pl.auto ? ', lavozimdan avtomatik' : ', qoʻlda belgilangan'})</small></div>${pl.shart && pl.shart.length ? `<div><b>Sharoit:</b> ${pl.shart.map((s: string) => myE(KY_SHN[s] || s)).join(', ')}</div>` : ''}
                ${c.grp ? `<details><summary>Normani oʻzgartirish</summary><select id="kyGrp"><option value="">Lavozimdan avtomatik</option>${d.grps.map((g: any) => `<option value="${g.id}"${!pl.auto && g.id === pl.grp ? ' selected' : ''}>${myE(g.nom)}</option>`).join('')}</select><div class="my-chk">${Object.keys(KY_SHN).map(k => `<label><input type="checkbox" data-sh="${k}"${(pl.shart || []).indexOf(k) >= 0 ? ' checked' : ''}> ${myE(KY_SHN[k])}</label>`).join('')}</div><button class="mini-btn" onclick="kiyGrpSave()">💾 Saqlash</button></details>` : ''}</div>
                ${c.ack && unack.length ? `<div class="my-ack">📦 Sizga ${unack.length} ta buyum berilgan deb yozildi: ${unack.map((h: any) => myE(h.nom)).join(', ')}.<button class="action-btn" onclick="kiyAck()">✅ Oldim — tasdiqlayman</button></div>` : ''}
                <div class="my-sz"><b>Oʻlchamlar</b>${['boy:Boʻyi', 'kiyim:Kiyim', 'poyabzal:Poyabzal', 'bosh:Bosh'].map(z => { const [k, l] = z.split(':'); return `<label>${l}<input id="kySz_${k}" value="${myE(sz[k] || '')}" ${c.size ? '' : 'disabled'} maxlength="20"></label>`; }).join('')}${c.size ? '<button class="mini-btn" onclick="kiySizeSave()">💾</button>' : ''}</div>
                <div class="my-kt"><table><thead><tr><th>Buyum</th><th>Muddat</th><th>Keyingi</th></tr></thead><tbody>${rows}</tbody></table></div>
                ${c.issue ? `<button class="action-btn" onclick="kiyIssueForm()">➕ Kiyim berish (ombor)</button>` : ''}
                <div class="my-sec"><b>📜 Berilganlar tarixi</b>${hist}</div>
                <div class="my-acts"><button class="action-btn sec" onclick="kiyCard()">⬇️ Shaxsiy kartochka</button><button class="action-btn sec" onclick="kiyNorma()">📖 Normalar va qoidalar</button></div>`, true);
        }
        function kiyIssueForm(): void {
            const d = KY.d, sz = d.size || {}, today = new Date().toISOString().slice(0, 10);
            const szOf = (b: string) => { const k = (d.plan.rows.find((r: any) => r.b === b) || {}).b || b; return /botinka|etik/.test(k) ? sz.poyabzal || '' : /kaska|kepka/.test(k) ? sz.bosh || '' : /qolqop|kozoynak|niqob|respirator|protivogaz|quloqchin|belbog|diel/.test(k) ? '' : sz.kiyim || ''; };
            const items = d.plan.rows.filter((r: any) => !r.navb);
            VA.mdl('kiyIss', `<div class="px-h"><b>➕ Kiyim berish — ${myE(d.person.name)}</b><button class="mini-btn" onclick="mdlClose('kiyIss')">✕</button></div>
                <div class="nd-tip">Muddati kelganlar oldindan belgilangan. Bergan buyumlarni belgilang — xodim ilovada «Oldim» deb tasdiqlaydi.</div>
                <div class="my-iss">${items.map((r: any) => `<label class="my-ir"><input type="checkbox" data-b="${r.b}"${r.st === 'kech' || r.st === 'kerak' ? ' checked' : ''}><span>${myE(r.nom)}<small>${(KY_ST[r.st] || ['', ''])[1]}${r.next ? ' · ' + myD(r.next) : ''}</small></span><input class="q" type="number" min="1" max="20" value="${r.soni || 1}" data-q="${r.b}"><input class="s" placeholder="oʻlcham" value="${myE(szOf(r.b))}" data-s="${r.b}" maxlength="20"></label>`).join('')}</div>
                <div class="my-2"><div class="mm-f"><label>Berilgan sana</label><input type="date" id="kyIssD" value="${today}" max="${today}"></div><div class="mm-f"><label>Izoh (ixtiyoriy)</label><input id="kyIssN" maxlength="300"></div></div>
                <button class="action-btn" onclick="kiyIssueSave()">✅ Saqlash</button>`, true);
        }
        async function kiyIssueSave(): Promise<void> {
            const items: any[] = []; document.querySelectorAll('#kiyIss input[data-b]').forEach((i: any) => { if (i.checked) { const b = i.getAttribute('data-b'); items.push({ b: b, qty: +((document.querySelector('#kiyIss input[data-q="' + b + '"]') as any) || {}).value || 1, size: ((document.querySelector('#kiyIss input[data-s="' + b + '"]') as any) || {}).value || '' }); } });
            if (!items.length) { VA.showToast('Hech narsa belgilanmagan'); return; }
            try { await myApi('/api/kiy/v1/issue', 'POST', { tabel: KY.d.person.tabel, date: (VA.$id('kyIssD') || {}).value, note: (VA.$id('kyIssN') || {}).value, items: items }); VA.mdlClose('kiyIss'); VA.showToast('✅ ' + items.length + ' ta buyum yozildi'); kiyOpen(KY.d.person.tabel); MY.d = null; }
            catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function kiyCancel(id: number): Promise<void> {
            const w = await VA.uiPrompt('Yozuv nima uchun bekor qilinadi? (masalan: xato kiritilgan)', ''); if (!w || !String(w).trim()) return;
            try { await myApi('/api/kiy/v1/cancel', 'POST', { id: id, why: String(w).trim() }); kiyOpen(KY.d.person.tabel); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function kiyAck(): Promise<void> {
            const ids = (KY.d.hist || []).filter((h: any) => !h.ack && !h.cancelled).map((h: any) => h.id);
            try { const r = await myApi('/api/kiy/v1/ack', 'POST', { ids: ids }); VA.showToast('✅ Tasdiqlandi: ' + r.n + ' ta'); kiyOpen(KY.t); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function kiySizeSave(): Promise<void> {
            const b: any = { tabel: KY.d.person.tabel }; ['boy', 'kiyim', 'poyabzal', 'bosh'].forEach(k => { b[k] = (VA.$id('kySz_' + k) || {}).value || ''; });
            try { await myApi('/api/kiy/v1/person', 'POST', b); VA.showToast('💾 Oʻlchamlar saqlandi'); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        async function kiyGrpSave(): Promise<void> {
            const sh: string[] = []; document.querySelectorAll('#kiyM input[data-sh]').forEach((i: any) => { if (i.checked) sh.push(i.getAttribute('data-sh')); });
            try { await myApi('/api/kiy/v1/person', 'POST', { tabel: KY.d.person.tabel, grp: (VA.$id('kyGrp') || {}).value || '', shart: sh }); VA.showToast('💾 Norma saqlandi'); kiyOpen(KY.d.person.tabel); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        // Shaxsiy kartochka (maxsus kiyim hisobi) — Excel / PDF / Word / JPG (yagona qoida: ⬇️ 🖨 📤)
        function kiyCard(): void {
            const d = KY.d, p = d.person, sz = d.size || {};
            const rows: any[] = [['MAXSUS KIYIM, MAXSUS POYABZAL VA SHAXSIY HIMOYA VOSITALARI HISOBI SHAXSIY KARTOCHKASI'], [], ['F.I.Sh.', p.name, '', 'Tabel', p.tabel], ['Lavozim', p.lav, '', 'Boʻlinma', [p.unitN, p.grpN].filter(Boolean).join(' · ')],
                ['Norma', d.plan.grpNom + ' (' + (d.plan.band || '') + ')'], ['Oʻlchamlar', 'boʻyi ' + (sz.boy || '—') + ', kiyim ' + (sz.kiyim || '—') + ', poyabzal ' + (sz.poyabzal || '—') + ', bosh ' + (sz.bosh || '—')], [],
                ['NORMA BOʻYICHA'], ['Buyum', 'Standart', 'Muddat', 'Oxirgi olgan', 'Keyingi']];
            d.plan.rows.forEach((r: any) => rows.push([r.nom + (r.mavsum === 'qish' ? ' (qishki)' : '') + (r.navb ? ' (navbatchi)' : ''), r.std, kyTerm(r.oy), r.last ? myD(r.last) : '—', r.next ? myD(r.next) : (KY_ST[r.st] || ['', ''])[1]]));
            rows.push([], ['BERILGANLAR'], ['Sana', 'Buyum', 'Soni', 'Oʻlcham', 'Berdi', 'Oldi (tasdiq)']);
            (d.hist || []).filter((h: any) => !h.cancelled).forEach((h: any) => rows.push([myD(h.date), h.nom, h.qty, h.size || '', h.byN || h.by, h.ack ? myD(h.ack) : '']));
            VA.xlsxDl(rows, 'Maxsus kiyim kartochkasi ' + p.tabel);
        }
        async function kiyNorma(): Promise<void> {
            try { const n = MY.kn || (MY.kn = await myApi('/api/kiy/v1/norma')); const K: any = {}; n.katalog.forEach((k: any) => { K[k.kod] = k; });
                VA.mdl('kiyNor', `<div class="px-h"><b>📖 Maxsus kiyim normalari</b><button class="mini-btn" onclick="mdlClose('kiyNor')">✕</button></div>
                    <div class="nd-tip">${myE((n.manba || []).join(' · '))}</div>
                    ${n.guruhlar.map((g: any) => `<details class="hs-box"><summary>${myE(g.nom)} <small>${myE(g.band || '')}</small></summary>${g.qator.map((r: any) => `<div class="my-nr"><span>${myE(K[r.b].nom)}${r.soni > 1 ? ' — ' + r.soni + ' juft' : ''}${r.mavsum === 'qish' ? ' · qishki' : ''}${r.navb ? ' · navbatchi' : ''}${r.shart ? ' · ' + myE(KY_SHN[r.shart] || r.shart) : ''}</span><b>${kyTerm(r.oy)}</b></div>`).join('')}</details>`).join('')}
                    <details class="hs-box" open><summary>Berish qoidalari</summary><ol class="my-rules">${n.qoidalar.map((q: string) => `<li>${myE(q)}</li>`).join('')}</ol></details>`, true);
            } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
        // Ombor: muddati kelganlar (butun korxona) yoki rahbar uchun — oʻz hodimlari
        async function kiyOmbor(): Promise<void> {
            VA.secScreen('screen-kiy', '🧥 Maxsus kiyim — muddati kelganlar', "openScreen('screen-main')"); VA.openScreen('screen-kiy');
            const b = VA.secBody('screen-kiy'); b.innerHTML = '<div class="nd-tip">⏳ Hisoblanmoqda…</div>';
            try { KY.due = await myApi('/api/kiy/v1/due'); kiyDueRender(); } catch (e) { b.innerHTML = '<div class="nd-tip">⚠️ ' + myE(myMsg(e)) + '</div>'; }
        }
        function kiyDueRender(): void {
            const b = VA.secBody('screen-kiy'), D = KY.due, q = VA.normTxt ? VA.normTxt(KY.q || '') : String(KY.q || '').toLowerCase();
            const units = Array.from(new Set((D.list || []).map((x: any) => x.unitN))).sort() as string[];
            const L = (D.list || []).filter((x: any) => (!KY.u || x.unitN === KY.u) && (!KY.only || x.items.some((i: any) => i.st !== 'yaqin')) && (!q || (VA.normTxt ? VA.normTxt([x.name, x.tabel, x.lav, x.grpN].join(' ')) : '').indexOf(q) >= 0));
            const cnt = (st: string) => L.reduce((s: number, x: any) => s + x.items.filter((i: any) => st === 'yaqin' ? i.st === 'yaqin' : i.st !== 'yaqin').length, 0);
            b.innerHTML = `<div class="my-tools"><button class="mini-btn" onclick="kiyFindOpen()">🔎 Xodimni topish</button><button class="mini-btn" onclick="kiyDueXlsx()">⬇️ Roʻyxat (Excel/PDF)</button><button class="mini-btn" onclick="kiyNorma()">📖 Normalar</button></div>
                <div class="my-head"><div><b>${L.length} ta xodim</b><small>${D.all ? 'butun korxona' : 'faqat mening hodimlarim'} · muddati oʻtgan/olinmagan: ${cnt('kech')} · 30 kun ichida: ${cnt('yaqin')}</small></div></div>
                <input class="search-box" placeholder="🔎 Ism, tabel, lavozim…" value="${myE(KY.q || '')}" oninput="KY.q=this.value;clearTimeout(KY.tm);KY.tm=setTimeout(kiyDueRender,250)">
                <div class="my-flt"><select onchange="KY.u=this.value;kiyDueRender()"><option value="">Barcha boʻlinmalar</option>${units.map(u => `<option${KY.u === u ? ' selected' : ''}>${myE(u)}</option>`).join('')}</select><button class="${KY.only ? 'on' : ''}" onclick="KY.only=!KY.only;kiyDueRender()">Faqat muddati oʻtgan</button></div>
                <div class="my-list">${L.slice(0, 300).map((x: any) => `<div class="my-row" onclick="kiyOpen('${myE(x.tabel)}')"><div class="my-n"><b>${myE(x.name)}</b><small>${myE(x.lav)} · ${myE(x.unitN)}${x.grpN ? ' · ' + myE(x.grpN) : ''} · ${myE(x.tabel)}</small><div class="my-kch">${x.items.map((i: any) => `<span class="my-b ${i.st === 'yaqin' ? 'warn' : 'bad'}">${myE(i.nom)}</span>`).join('')}</div></div></div>`).join('') || '<div class="nd-tip">Muddati kelgan kiyim yoʻq</div>'}${L.length > 300 ? `<div class="nd-tip">Yana ${L.length - 300} ta — qidiruv yoki boʻlinma boʻyicha toraytiring</div>` : ''}</div>`;
        }
        function kiyDueXlsx(): void {
            const D = KY.due, rows: any[] = [['Maxsus kiyim — muddati kelganlar · ' + new Date().toLocaleDateString('ru-RU')], [], ['№', 'Tabel', 'F.I.Sh.', 'Lavozim', 'Boʻlinma', 'Uchastka', 'Buyum', 'Holat', 'Muddat']];
            let i = 0; (D.list || []).filter((x: any) => !KY.u || x.unitN === KY.u).forEach((x: any) => x.items.forEach((it: any) => rows.push([++i, x.tabel, x.name, x.lav, x.unitN, x.grpN || x.uch || '', it.nom, (KY_ST[it.st] || ['', it.st])[1], it.next ? myD(it.next) : ''])));
            VA.xlsxDl(rows, 'Maxsus kiyim muddati kelganlar');
        }
        function kiyFindOpen(): void {
            VA.mdl('kiyFind', `<div class="px-h"><b>🔎 Xodimni topish</b><button class="mini-btn" onclick="mdlClose('kiyFind')">✕</button></div><input class="search-box" id="kyFq" placeholder="Ism yoki tabel" oninput="clearTimeout(KY.ft);KY.ft=setTimeout(kiyFind,300)"><div id="kyFr" class="my-find"></div>`, true);
            setTimeout(() => { try { VA.$id('kyFq').focus(); } catch (e) { /* */ } }, 100);
        }
        async function kiyFind(): Promise<void> {
            const q = ((VA.$id('kyFq') || {}).value || '').trim(), box = VA.$id('kyFr'); if (!box) return; if (q.length < 2) { box.innerHTML = ''; return; }
            try { const L = await myApi('/api/my/v1/find?q=' + encodeURIComponent(q)); box.innerHTML = (L || []).map((x: any) => `<div class="my-row sm" onclick="mdlClose('kiyFind');kiyOpen('${myE(x.tabel)}')"><div class="my-n"><b>${myE(x.name)}</b><small>${myE(x.lav)} · ${myE(x.unitN)} · ${myE(x.tabel)}</small></div></div>`).join('') || '<div class="nd-tip">Topilmadi</div>'; }
            catch (e) { box.innerHTML = '<div class="nd-tip">⚠️ ' + myE(myMsg(e)) + '</div>'; }
        }

        // ---------------------------------------------------------------- integratsiya
        function myCards(): void {
            try {
                const list = VA.$id('main-card-list'); if (!list || !((currentUser as any) && (currentUser as any).tabel)) return;
                const add = (id: string, icon: string, text: string, sub: string, search: string, fn: () => void) => {
                    if (VA.$id(id)) return; const c = document.createElement('div'); c.className = 'btn-card'; c.id = id; c.setAttribute('data-search', search); c.onclick = fn;
                    c.innerHTML = `<div class="btn-card-content"><span class="btn-icon">${icon}</span><span class="btn-text">${text}<small style="display:block;font-size:11px;opacity:.75">${sub}</small></span></div><span class="btn-arrow">›</span>`;
                    const ref = VA.$id('v9ScanCard') || VA.$id('sgCard'); if (ref && ref.parentNode === list) ref.insertAdjacentElement('afterend', c); else list.insertBefore(c, list.firstChild);
                };
                if (myLeader()) add('myCard', '👷', 'Mening ishchilarim', 'roʻyxat · struktura · qisqa pasport', 'mening hodimlarim ishchilarim qol ostidagi struktura pasport', () => { myOpen(); });
                // 3.19.2: «🧥 Maxsus kiyim» bosh sahifada emas — MTTB → «🧥 Maxsus kiyim» va xodim pasporti tagida
                try { if (typeof VA.menuArrange === 'function') VA.menuArrange(); } catch (e) { /* */ }
            } catch (e) { /* */ }
        }
        window.addEventListener('agmk:login', () => setTimeout(myCards, 800));
        if (typeof VA.hideLock === 'function') VA.hideLock = VA.agmkExtend('hideLock', 'v3.18.0: Mening hodimlarim / Maxsus kiyim kartalari', VA.hideLock, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(myCards, 900); return r; });
        setTimeout(myCards, 2800);
        // Xodim pasportida «🧥 Maxsus kiyim» tugmasi
        if (typeof VA.openItemPasport === 'function') VA.openItemPasport = VA.agmkExtend('openItemPasport', 'v3.18.0: maxsus kiyim tugmasi', VA.openItemPasport, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const old = VA.$id('kiyPassBtn'); if (old) old.remove();
                const xe = VA.$id('xodim-extra-container'); if (xe && xe.style.display !== 'none') { const it = VA.getActiveItem(), t = it && VA.cleanTabel(it.tabel), g = VA.$id('item-passport-grid');
                    if (t && g) { const own = t === VA.meTabel(), mine = !!(MY.d && (MY.d.list || []).some((x: any) => x.tabel === t));
                        if (own || mine || myIsRole('ombor') || myIsRole('mm') || myIsRole('rahbar') || myIsRole('kadr')) { const d = document.createElement('div'); d.id = 'kiyPassBtn'; d.className = 'my-pbtn'; d.innerHTML = `<div class="btn-card kiy-pcard" onclick="kiyOpen('${myE(t)}')"><div class="btn-card-content"><span class="btn-icon">🧥</span><span class="btn-text">Maxsus kiyim<small style="display:block;font-size:11px;opacity:.75">norma · berilganlar · keyingi olish sanasi</small></span></div><span class="btn-arrow">›</span></div>${mine ? `<button class="action-btn sec" onclick="myPass('${myE(t)}')">🪪 Qisqa pasport</button>` : ''}`; g.insertAdjacentElement('afterend', d); } } }
            } catch (e) { /* */ }
            return r;
        });
        // Kirgandan keyin: oʻz kiyimim boʻyicha eslatma (muddati kelgan, tasdiqlanmagan)
        window.addEventListener('agmk:login', () => setTimeout(async () => {
            try { const d = await myApi('/api/kiy/v1/p'); const un = (d.hist || []).filter((h: any) => !h.ack && !h.cancelled).length, due = d.plan.due, soon = d.plan.soon;
                if (un) VA.showToast('🧥 Sizga ' + un + ' ta maxsus kiyim berildi — «Mening kiyimim»da «Oldim» deb tasdiqlang');
                else if (due || soon) VA.showToast('🧥 Maxsus kiyim: ' + (due ? due + ' ta buyum olish vaqti keldi' : soon + ' ta buyum muddati 30 kun ichida'));
            } catch (e) { /* server yoʻq — jim */ }
        }, 6000));

        (function () {
            const st = document.createElement('style');
            st.textContent = `.my-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;background:rgba(15,23,42,.85);border:1px solid #334155;margin-bottom:8px}.my-head small{display:block;opacity:.75;font-size:12px}.my-cnt{font-weight:800;font-size:18px;white-space:nowrap}
.my-tabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px}.my-tabs button,.my-flt button{border:1.5px solid #475569;background:rgba(30,41,59,.8);color:inherit;border-radius:12px;padding:9px;font-weight:700;font-size:14px}.my-tabs button.on,.my-flt button.on{border-color:#f59e0b;background:rgba(120,53,15,.55)}
.my-tools{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.my-flt{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.my-flt button{padding:6px 10px;font-size:12.5px}.my-flt select{border-radius:10px;padding:6px;background:#1e293b;color:inherit;border:1px solid #475569;max-width:100%}
.my-list{display:grid;gap:6px}.my-row{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:9px 11px;border-radius:12px;border:1px solid #334155;background:rgba(30,41,59,.75);cursor:pointer}.my-row.sm{padding:7px 9px}.my-row.on{border-color:#22c55e;background:rgba(20,83,45,.5)}
.my-n{min-width:0}.my-n b{display:block;word-break:break-word}.my-n small{display:block;opacity:.75;font-size:11.5px;word-break:break-word}.my-bs{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
.my-b{display:inline-block;font-size:11px;font-weight:700;border-radius:8px;padding:2px 7px;white-space:nowrap}.my-b.bad{background:#7f1d1d;color:#fecaca}.my-b.warn{background:#713f12;color:#fde68a}.my-b.ok{background:#14532d;color:#bbf7d0}.my-b.add{background:#1e3a8a;color:#bfdbfe}.my-b.nv{background:#334155;color:#cbd5e1}
.my-tree{padding:4px 0}.my-root{padding:10px 12px;border-radius:14px;border:2px solid #f59e0b;background:rgba(120,53,15,.35);margin-bottom:6px}.my-root small,.my-root em{display:block;font-size:12px;opacity:.85;font-style:normal}.my-kids{margin-left:10px;padding-left:10px;border-left:2px solid #475569;display:grid;gap:5px}
.my-tn{border-radius:12px;border:1px solid #334155;background:rgba(15,23,42,.7)}.my-tn>summary{display:flex;justify-content:space-between;gap:8px;padding:8px 10px;cursor:pointer;font-weight:700;list-style:none}.my-tn>summary em{font-style:normal;opacity:.8;white-space:nowrap}.my-tn>*:not(summary){margin:0 8px 6px 14px}.my-tn.un>summary{color:#fcd34d}.my-tn.gr>summary{color:#93c5fd}.my-tn.lv>summary{font-weight:600;font-size:13.5px}
.my-tp{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:6px 8px;border-radius:10px;background:rgba(30,41,59,.8);margin-bottom:4px;cursor:pointer}.my-tp small{opacity:.7;font-size:11px}
.my-ps{display:grid;gap:4px;margin:6px 0}.my-pr{display:grid;grid-template-columns:120px 1fr;gap:8px;padding:6px 0;border-bottom:1px dashed #334155;font-size:14px}.my-pr span{opacity:.75}.my-pr b{word-break:break-word;font-weight:600}.my-pr a{color:#93c5fd}
.my-sec{margin:10px 0;padding:10px;border-radius:14px;border:1px solid #334155;background:rgba(15,23,42,.6)}.my-sec>b{display:block;margin-bottom:6px}.my-sec>small{display:block;opacity:.75;margin:-4px 0 6px}.my-kch{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px}.my-tb{display:flex;flex-wrap:wrap;gap:4px}
.my-acts{display:grid;gap:6px;margin-top:8px}.my-pbtn{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.my-pbtn .action-btn{flex:1;min-width:140px}
.my-rels{margin-top:10px}.my-rel{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 0;border-bottom:1px dashed #334155}.my-rel small{display:block;opacity:.75;font-size:11.5px}.my-rel.off{opacity:.5}
.my-find{display:grid;gap:5px;max-height:240px;overflow:auto;margin:6px 0}.my-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.my-2 input{width:100%;box-sizing:border-box}
.my-kh0{display:grid;gap:4px;font-size:13.5px;margin-bottom:8px}.my-kh0 small{opacity:.75}.my-kh0 select{width:100%;margin:6px 0;padding:6px;border-radius:10px;background:#1e293b;color:inherit;border:1px solid #475569}.my-chk{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;margin-bottom:6px}
.my-ack{padding:10px;border-radius:12px;border:1.5px solid #22c55e;background:rgba(20,83,45,.45);margin:8px 0;display:grid;gap:8px}
.my-sz{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-end;margin:6px 0 10px;font-size:12px}.my-sz>b{width:100%}.my-sz label{display:grid;gap:2px}.my-sz input{width:70px;padding:5px;border-radius:8px;border:1px solid #475569;background:#1e293b;color:inherit}
.my-kt{overflow-x:auto;margin-bottom:8px}.my-kt table{border-collapse:collapse;width:100%;font-size:12.5px}.my-kt th{text-align:left;font-size:11px;opacity:.75;padding:4px;border-bottom:1px solid #475569}.my-kt td{padding:5px 4px;border-bottom:1px solid #334155;vertical-align:top}.my-kt td small{display:block;opacity:.6;font-size:10.5px}.my-kt td:nth-child(2){white-space:nowrap;font-size:12px}.my-kt .my-b{white-space:nowrap}.my-kt td:last-child{width:1%}.my-kt td:first-child{width:52%}
.my-w{font-style:normal;font-size:10px;background:#1e3a8a;color:#bfdbfe;border-radius:6px;padding:0 5px}
.my-kh{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 0;border-bottom:1px dashed #334155;font-size:13px}.my-kh small{display:block;opacity:.75;font-size:11.5px}.my-kh.off{opacity:.5;text-decoration:line-through}
.my-iss{display:grid;gap:5px;max-height:50vh;overflow:auto;margin:6px 0}.my-ir{display:grid;grid-template-columns:auto 1fr 52px 78px;gap:6px;align-items:center;padding:6px;border-radius:10px;background:rgba(30,41,59,.8);font-size:13px}.my-ir small{display:block;opacity:.7;font-size:11px}.my-ir input.q,.my-ir input.s{width:100%;box-sizing:border-box;padding:5px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:inherit}
.ex-act:has(.ex-chat){grid-template-columns:repeat(4,1fr)}.my-nr{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px dashed #334155;font-size:12.5px}.my-nr b{white-space:nowrap}.my-rules{margin:6px 0;padding-left:20px;display:grid;gap:4px;font-size:12.5px}`;
            document.head.appendChild(st);
        })();

        // ---------------------------------------------------------------- yagona qoida: barcha «📊 Excel» roʻyxatlari ham bitta oynada
        //  Avval «📊 Excel» tugmalari eski oynani (Excel/Word/PDF) ochardi, «Saqlash»dan keyin yana format oynasi chiqardi.
        //  Endi toʻgʻridan-toʻgʻri yagona oyna: PDF · Word · Excel · JPG va ⬇️ 🖨 📤 + «💬 Xodimga (ilova ichida)».
        var MYX: any = { chat: false };
        if (typeof VA.xlsxDl === 'function' && typeof VA.exOpen === 'function') {
            VA.xlsxDl = function (rows: any[], title: unknown): void {
                const t = String(title || 'Roʻyxat'), base = t.replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'Royxat';
                MYX.chat = true; try { VA.docDownload([{ name: base + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: VA.xlsxFromRows(rows, t.slice(0, 30)) }]); } finally { MYX.chat = false; }
            };
            VA.exOpen = VA.agmkExtend('exOpen', 'v3.18.0: roʻyxatlar — xodimga yuborish ham', VA.exOpen, (o: Function) => function (this: unknown, files: any[], opt?: any) { if (MYX.chat) opt = Object.assign({}, opt || {}, { chat: true }); return o.call(this, files, opt); });
            VA.exRender = VA.agmkExtend('exRender', 'v3.18.0: «💬 Xodimga» tugmasi', VA.exRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try { if (VA.EX && VA.EX.opt && VA.EX.opt.chat && typeof VA.expToChat === 'function') { const a = document.querySelector('#exSheet .ex-act'); if (a && !a.querySelector('.ex-chat')) { const btn = document.createElement('button'); btn.className = 'ex-chat'; btn.innerHTML = '<i>💬</i>Xodimga'; btn.onclick = () => { myExChat(); }; a.appendChild(btn); } } } catch (e) { /* */ }
                return r;
            });
        }
        async function myExChat(): Promise<void> {
            try { VA.showToast('⏳ Tayyorlanmoqda…'); const out = await VA.exConvertAll(VA.EX.files, VA.EX.fmt); VA.mdlClose('exSheet'); VA.expToChat(out); } catch (e) { VA.alert('⚠️ ' + myMsg(e)); }
        }
