        // =====================================================================
        // v3.8.0
        //  16) Imzolovchilar: shablonda lavozim; familiya — hujjat tuzilayotgan kuni shtatdan (👤 hozirgi shtat bo'yicha)
        //      yoki 🔄 vaqtincha bajaruvchi (v.b. — istalgan xodim, qidirib) yoki ✍️ qo'lda (lavozim + familiya)
        //  15) Xizmat xati — chiziqsiz: hamma joy ma'lumot bilan, imtihonlardan faqat topshirilganlari, imzo joylari bo'sh
        // =====================================================================

        // ---------------- Qisqa ism: «A.A.Familiya» (uz) · «Фамилия А.А.» (ru) ----------------
        function sgShort(full, lang) {
            const s = String(full || '').trim(); if (!s) return '';
            if (/^[A-ZА-ЯЁ][a-zа-яё]?\.\s*([A-ZА-ЯЁ][a-zа-яё]?\.)?\s*\S/.test(s) || (/\S\s+[A-ZА-ЯЁ]\.\s*([A-ZА-ЯЁ]\.)?$/.test(s) && s.split(/\s+/).length <= 3)) return lang === 'ru' && typeof trName === 'function' ? trName(s, 'ru') : s;
            const p = s.split(/\s+/).filter(w => !/^(o.g.li|qizi|ugli|kizi|угли|кизи|оглы|кызы)$/i.test(w)); if (p.length < 2) return s;
            const ini = w => { if (!w) return ''; const m = /^(sh|ch|ye|yo|yu|ya|o[ʻ'’`]|g[ʻ'’`])/i.exec(w); const h = m ? m[1] : w.charAt(0); return h.charAt(0).toUpperCase() + h.slice(1).toLowerCase().replace(/[’`]/, 'ʻ') + '.'; }, uz = ini(p[1]) + ini(p[2]) + p[0];
            return lang === 'ru' ? (typeof trName === 'function' ? trName(uz, 'ru') : p[0] + ' ' + ini(p[1]) + ini(p[2])) : uz;
        }
        if (typeof ppShort === 'function') ppShort = function (full, lang) { return sgShort(full, lang); };

        // ---------------- Lavozim → shtatdagi egasi ----------------
        function sgBase(r) { return String(r || '').replace(/\s+v\.?\s?b\.?\s*$/i, '').replace(/^\s*и\.?\s?о\.?\s*/i, '').trim(); }
        function sgVbLabel(base, lang) { return lang === 'ru' ? 'И.о. ' + base.charAt(0).toLowerCase() + base.slice(1) : base + ' v.b.'; }
        var SG_RULES = [
            [/^(sttb |упжт )?bosh muhandis(i)?$|^главный инженер/i, { l: /^bosh muhandis$/i, su: /^Boshqarma/ }],
            [/boshqarma boshlig|^sttb boshlig|^начальник упжт/i, { l: /boshqarma boshlig/i }],
            [/bosh energetik|главный энергетик/i, { l: /bosh energetik/i }],
            [/^bosh mexanik$|главн\S* механик/i, { l: /^bosh mexanik$/i }],
            [/bosh muhandis(ning)?\s.*(o.rinbosar)|mm, xt va hx/i, { l: /bosh muhandis o.rinbosari/i }],
            [/^bosh buxgalter|главный бухгалтер/i, { l: /^bosh buxgalter$/i }],
            [/^(ichtb|ичтб) boshlig|^начальник пто|ishlab chiqarish-texnik bo.limi boshlig/i, { l: /^bo.lim boshlig.i$/i, b: /Ishlab chiqarish-texnik/i }],
            [/mte va ih|mehnatni tashkil.*boshlig/i, { l: /^bo.lim boshlig.i$/i, b: /Mehnatni tashkil/i }],
            [/kadrlar bo.limi boshlig|начальник отдела кадров/i, { l: /^bo.lim boshlig.i$/i, b: /Kadrlar/i }],
            [/vagonlar bo.yicha muhandis|инженер по вагонам/i, { l: /harakat tarkibi i-toifali muhandisi|vagon parkini saqlash/i, b: /Ishlab chiqarish-texnik/i }],
            [/^(\d)-tys boshlig/i, m => ({ l: /^sex boshlig.i$/i, su: new RegExp('TYS-' + m[1]) })],
            [/^(\d)-tys uchastka ustasi/i, m => ({ l: /^uchastka ustasi$/i, su: new RegExp('TYS-' + m[1]) })],
            [/mehnat bo.yicha .*iqtisodchi/i, { l: /mehnat bo.yicha .*iqtisodchi/i, ctx: 'su' }]
        ];
        function sgRuleOf(base) { for (const [re, sp] of SG_RULES) { const m = re.exec(base); if (m) return typeof sp === 'function' ? sp(m) : sp; } return null; }
        function sgSurKey(n) { const s = String(n || '').trim(); let w = s; const m = s.match(/^[A-ZА-ЯЁ][a-zа-яё]?\.\s*(?:[A-ZА-ЯЁ][a-zа-яё]?\.)?\s*(\S+)$/); if (m) w = m[1]; else w = s.split(/\s+/)[0]; return typeof sigKey === 'function' ? sigKey(w) : normTxt(w); }
        // ctx: { su, b } — bo'linmaga bog'liq lavozimlar uchun (masalan, bo'lim boshlig'i, mehnat bo'yicha iqtisodchi)
        function sgHolders(base, ctx) {
            const sp = sgRuleOf(base), L = typeof allXodims === 'function' ? allXodims() : [];
            const nb = normTxt(base);
            let H = sp ? L.filter(r => sp.l.test(String(r.item.lavozim || '').trim()) && (!sp.su || sp.su.test(r.su)) && (!sp.b || sp.b.test(r.item.bolim || ''))) : L.filter(r => normTxt(r.item.lavozim || '') === nb);
            if (sp && sp.ctx === 'su' && ctx && ctx.su) { const f = H.filter(r => r.su === ctx.su); if (f.length) H = f; }
            if (ctx && ctx.boss) { // «{BOLIM} boshlig'i» — asosiy xodim bo'linmasining rahbari
                H = L.filter(r => /^(bo.lim|sex|xizmat) boshlig.i$|deposi boshlig|^bosh energetik/i.test(String(r.item.lavozim || '')) && ((ctx.b && r.item.bolim === ctx.b) || (!ctx.b && ctx.su && r.su === ctx.su && !/o.rinbosar/i.test(r.item.lavozim))));
            }
            return H;
        }
        function sgResolve(row, ctx) { // → { it, many }
            const H = sgHolders(row.base || sgBase(row.r), ctx), hk = row.hint ? sgSurKey(row.hint) : '';
            if (H.length === 1) return { it: H[0].item, many: H };
            if (hk) { const f = H.filter(r => sgSurKey(r.item.name) === hk); if (f.length === 1) return { it: f[0].item, many: H }; }
            return { it: null, many: H };
        }
        // Shablon yozuvidan qator: { r, n, t, m: 'shtat'|'vb'|'qolda', base, hint, nf }
        function sgFromTpl(x, lang, ctx) {
            const base = sgBase(x.r), row = { base: base, hint: x.n || '', m: 'shtat', r: base, n: x.n || '', t: '' };
            return sgApply(row, lang, ctx);
        }
        function sgApply(row, lang, ctx) {
            if (row.m !== 'shtat') return row;
            const R = sgResolve(row, ctx);
            if (R.it) { row.n = sgShort(R.it.name, lang); row.t = cleanTabel(R.it.tabel); row.nf = 0; }
            else { row.nf = 1; row.t = ''; if (!row.n) row.n = ''; }
            row.r = row.base; return row;
        }

        // ---------------- Qator ko'rinishi va tugmalar (umumiy) ----------------
        var SG = { cb: {} };
        // ns: 'ap' — akt tasdiqlovchisi, 'com' — akt komissiyasi, 'vt' — xizmat xati imzolovchilari
        function sgAcc(ns) {
            if (ns === 'ap') return { lang: ndLang(), get: () => ND.form.apObj ? [ND.form.apObj] : [], set: a => { ND.form.apObj = a[0] || null; }, sync: () => ndFormSync(), re: () => ndRender(), ctx: {} };
            if (ns === 'com') return { lang: ndLang(), get: () => ND.form.com, set: a => { ND.form.com = a; }, sync: () => ndFormSync(), re: () => ndRender(), ctx: {} };
            return { lang: 'uz', get: () => NARV.f.sig || [], set: a => { NARV.f.sig = a; }, sync: () => narVtKeep(), re: () => narRender(), ctx: narVtCtx() };
        }
        function sgBadge(x) {
            if (x.m === 'vb') return '<span class="sg-bd vb">🔄 v.b.</span>';
            if (x.m === 'qolda') return '<span class="sg-bd ql">✍️ qoʻlda' + (x.t ? ' · 🔗' : '') + '</span>';
            if (x.nf) return '<span class="sg-bd nf">⚠️ shtatda topilmadi</span>';
            return '<span class="sg-bd sh">👤 shtat</span>';
        }
        function sgRowsHtml(ns, rows, extra) {
            const E = escapeHtml;
            return rows.map((x, k) => `<div class="nd-signer sg-row"><span class="nd-ed" onclick="sgTpl('${ns}',${k})">${E(x.r)} — <b>${E(x.n || '— tanlang')}</b> ${sgBadge(x)}</span>
                <span class="sg-btns"><button class="sg-b1" onclick="sgTpl('${ns}',${k})">📋 Shablon</button><button class="sg-b2" onclick="sgMan('${ns}',${k})">✍️ Qoʻlda</button>${ns !== 'ap' ? `<button onclick="sgMove('${ns}',${k},-1)">▲</button>` : ''}<button onclick="sgDel('${ns}',${k})">✕</button></span></div>`).join('') + (extra || '');
        }
        function sgDel(ns, k) { const A = sgAcc(ns); A.sync(); const a = A.get().slice(); a.splice(k, 1); A.set(a); A.re(); }
        function sgMove(ns, k, d) { const A = sgAcc(ns); A.sync(); const a = A.get().slice(); if (k + d < 0 || k + d >= a.length) return; [a[k], a[k + d]] = [a[k + d], a[k]]; A.set(a); A.re(); }
        function sgPut(ns, k, row) { const A = sgAcc(ns); const a = A.get().slice(); if (k >= a.length) a.push(row); else a[k] = row; A.set(a); A.re(); }
        // 📋 Shablon asosida: hozirgi shtat bo'yicha · vaqtincha bajaruvchi (v.b.) · boshqa shablon lavozimi
        function sgTpl(ns, k) {
            const A = sgAcc(ns); A.sync(); const x = A.get()[k] || { r: '', base: '', m: 'shtat' }, E = escapeHtml, base = x.base || sgBase(x.r);
            const R = base ? sgResolve(Object.assign({}, x, { base: base }), A.ctx) : { it: null, many: [] };
            const many = R.it ? [] : R.many.slice(0, 12);
            SG.cur = { ns: ns, k: k, base: base, many: many, it: R.it };
            const tpl = ns === 'vt' ? narVtCfg().sig.map(s => sgBase(s[0])) : ndSigners().filter(s => s.l === A.lang && (ns === 'ap' ? s.ap : !s.ap)).map(s => sgBase(s.r));
            SG.tpl = Array.from(new Set(tpl.filter(t => t && t.indexOf('{') < 0)));
            mdl('sgTplM', `<div class="px-h"><b>📋 ${E(base || 'Lavozim')}</b><button class="mini-btn" onclick="mdlClose('sgTplM')">✕</button></div>
                <div class="sg-opt${x.m === 'shtat' ? ' on' : ''}" onclick="sgPickShtat()"><b>👤 Hozirgi shtat boʻyicha</b><small>${R.it ? E(R.it.name) + ' · tab.№ ' + E(cleanTabel(R.it.tabel)) + ' · ' + E(R.it.lavozim || '') : many.length ? 'Bu lavozimda bir nechta xodim — pastdan tanlang' : '⚠️ Shtatda bu lavozim egasi topilmadi — «v.b.» yoki «Qoʻlda» tanlang'}</small></div>
                ${many.map((r, i) => `<div class="sg-opt sm" onclick="sgPickMany(${i})">👤 ${E(r.item.name)}<small>${E(r.item.lavozim || '')} · ${E(r.su)} · tab.№ ${E(cleanTabel(r.item.tabel))}</small></div>`).join('')}
                <div class="sg-opt${x.m === 'vb' ? ' on' : ''}" onclick="sgPickVb()"><b>🔄 Vaqtincha bajaruvchi (v.b.)</b><small>Roʻyxatdagi istalgan xodim — familiya yoki tabel boʻyicha qidiring. Hujjatda «${E(sgVbLabel(base || 'Lavozim', A.lang))}» boʻlib chiqadi${x.m === 'vb' && x.n ? '. Hozir: ' + E(x.n) : ''}.</small></div>
                ${SG.tpl.length > 1 ? `<details class="sg-more"><summary>Boshqa shablon lavozimi</summary>${SG.tpl.map((t, i) => `<div class="sg-opt sm" onclick="sgPickBase(${i})">${E(t)}</div>`).join('')}</details>` : ''}`, true);
        }
        function sgPickShtat() { const c = SG.cur, A = sgAcc(c.ns); mdlClose('sgTplM'); const x = Object.assign({}, A.get()[c.k] || {}, { base: c.base, m: 'shtat' }); sgPut(c.ns, c.k, sgApply(x, A.lang, A.ctx)); }
        function sgPickMany(i) { const c = SG.cur, A = sgAcc(c.ns), r = c.many[i]; if (!r) return; mdlClose('sgTplM'); sgPut(c.ns, c.k, { base: c.base, r: c.base, n: sgShort(r.item.name, A.lang), t: cleanTabel(r.item.tabel), m: 'shtat', hint: r.item.name, nf: 0 }); }
        function sgPickBase(i) { const c = SG.cur, A = sgAcc(c.ns), b = SG.tpl[i]; if (!b) return; mdlClose('sgTplM'); sgPut(c.ns, c.k, sgApply({ base: b, r: b, n: '', m: 'shtat', hint: '' }, A.lang, A.ctx)); }
        async function sgPickVb() {
            const c = SG.cur, A = sgAcc(c.ns); mdlClose('sgTplM');
            const p = await pickPerson({ title: 'Vaqtincha bajaruvchi — ' + (c.base || ''), r: '', n: '', lang: A.lang, needRole: false });
            if (!p) return; sgPut(c.ns, c.k, { base: c.base, r: sgVbLabel(c.base, A.lang), n: sgShort(p.full || p.n, A.lang), t: p.t || '', m: 'vb', hint: '' });
        }
        // ✍️ Qo'lda: lavozim va familiya qo'lda yoziladi; shtatdagi xodimga mos kelsa — bog'lash taklif qilinadi
        function sgMan(ns, k) {
            const A = sgAcc(ns); A.sync(); const x = A.get()[k] || {}, E = escapeHtml; SG.cur = { ns: ns, k: k };
            mdl('sgManM', `<div class="px-h"><b>✍️ Qoʻlda kiritish</b><button class="mini-btn" onclick="mdlClose('sgManM')">✕</button></div>
                <div class="mm-f"><label>Lavozim</label><input id="sgmR" value="${E(x.r || '')}" placeholder="masalan: Bosh muhandis v.b."></div>
                <div class="mm-f"><label>F.I.Sh. (hujjatda qanday chiqishi kerak boʻlsa)</label><input id="sgmN" value="${E(x.n || '')}" placeholder="${A.lang === 'ru' ? '@@N:341@@' : '@@N:347@@'}" oninput="sgManLink()"></div>
                <div id="sgmL"></div>
                <div class="pk-btns"><button onclick="mdlClose('sgManM')">Bekor</button><button class="pr" onclick="sgManOk()">💾 Saqlash</button></div>`, true);
            sgManLink();
        }
        function sgManLink() {
            const n = ($id('sgmN') || {}).value || '', box = $id('sgmL'); if (!box) return; const k = sgSurKey(n); SG.link = null;
            const L = k && k.length > 2 && typeof allXodims === 'function' ? allXodims().filter(r => sgSurKey(r.item.name) === k) : [];
            if (L.length === 1) { SG.link = L[0].item; box.innerHTML = `<label class="sg-link"><input type="checkbox" id="sgmLk" checked> 🔗 Shtatdagi <b>${escapeHtml(L[0].item.name)}</b> (tab.№ ${escapeHtml(cleanTabel(L[0].item.tabel))}) bilan bogʻlash — imzo soʻrovi unga boradi</label>`; }
            else box.innerHTML = n.trim() ? '<div class="nd-tip">Shtatda aniq mos xodim topilmadi — bu qator qogʻozda imzolanadi.</div>' : '';
        }
        function sgManOk() {
            const r = ($id('sgmR').value || '').trim(), n = ($id('sgmN').value || '').trim(); if (!r || !n) { alert('Lavozim va F.I.Sh. ni yozing.'); return; }
            const lk = SG.link && $id('sgmLk') && $id('sgmLk').checked ? SG.link : null, c = SG.cur; mdlClose('sgManM');
            sgPut(c.ns, c.k, { base: sgBase(r), r: r, n: n, t: lk ? cleanTabel(lk.tabel) : '', m: 'qolda', hint: '' });
        }
        function sgWarn(rows) { const b = rows.filter(x => x && x.m === 'shtat' && x.nf); return b.length ? b.map(x => '• ' + x.r + (x.n ? ' (' + x.n + ' — tekshirilmagan)' : '')).join('\n') : ''; }

        // ---------------- Aktlar: tasdiqlovchi va komissiya ----------------
        ndDefApObj = function () { const i = ndDefAp(), s = ndSigners()[i]; return s ? sgFromTpl(s, ndLang(), {}) : null; };
        ndApSet = function (i) { ndFormSync(); const s = ndSigners()[i]; if (s) ND.form.apObj = sgFromTpl(s, ndLang(), {}); ndRender(); };
        ndComAdd = function (i) { ndFormSync(); const s = ndSigners()[i]; if (s) ND.form.com.push(sgFromTpl(s, ndLang(), {})); ndRender(); };
        ndComCustom = function () { ndFormSync(); ND.form.com.push({ base: '', r: '', n: '', m: 'qolda', t: '' }); sgMan('com', ND.form.com.length - 1); };
        if (typeof ndRenderAkt === 'function') ndRenderAkt = agmkExtend('ndRenderAkt', 'v3.8: imzolovchilar — shablon / v.b. / qoʻlda', ndRenderAkt, o => function () {
            const r = o.apply(this, arguments);
            try {
                const f = ND.form, l = ndLang(), seen = new Set(), S = ndSigners().map((x, i) => ({ x: x, i: i })).filter(z => { if (z.x.l !== l) return false; const k = (z.x.ap ? 'a|' : 'c|') + normTxt(sgBase(z.x.r)); if (seen.has(k)) return false; seen.add(k); return true; }), E = escapeHtml;
                // eski shakldagi (familiya bilan saqlangan) qatorlar — shablon yozuvi sifatida qayta hisoblanadi
                // eski shakldagi (arxivdan ochilgan yoki tashqaridan berilgan) qatorlar — oʻzgartirilmaydi, «qoʻlda» deb belgilanadi
                const keep = c => c.m ? c : Object.assign({ base: sgBase(c.r), m: 'qolda', t: c.t || '' }, c);
                if (f.apObj) f.apObj = keep(f.apObj); f.com = (f.com || []).map(keep);
                const box = Array.from(document.querySelectorAll('#ndBody .nd-f')).filter(b => /TASDIQLOVCHI|KOMISSIYA/.test((b.querySelector('label') || {}).textContent || ''));
                const ap = box.find(b => /TASDIQLOVCHI/.test(b.querySelector('label').textContent)), cm = box.find(b => /KOMISSIYA/.test(b.querySelector('label').textContent));
                if (ap) ap.innerHTML = `<label>TASDIQLOVCHI («Tasdiqlayman» qismi)</label><div class="nd-signers">${f.apObj ? sgRowsHtml('ap', [f.apObj]) : '<div class="nd-tip">— tasdiqlovchi tanlanmagan</div>'}</div>
                    <div class="nd-chips">${S.filter(z => z.x.ap && !(f.apObj && normTxt(f.apObj.base || '') === normTxt(sgBase(z.x.r)))).map(z => `<i onclick="ndApSet(${z.i})">＋ ${E(sgBase(z.x.r))}</i>`).join('')}<i class="sg-sh" onclick="sgShtat('ap')">👤 Shtatdan tanlash</i><i onclick="ndFormSync(); ND.form.apObj={base:'',r:'',n:'',m:'qolda',t:''}; sgMan('ap',0)">＋ Qoʻlda</i></div>`;
                if (cm) cm.innerHTML = `<label>KOMISSIYA AʼZOLARI (imzo chekuvchilar)</label><div class="nd-signers">${sgRowsHtml('com', f.com) || '<div class="nd-tip">— hali hech kim qoʻshilmagan</div>'}</div>
                    <div class="nd-chips">${S.filter(z => !z.x.ap && !f.com.some(c => normTxt(c.base || '') === normTxt(sgBase(z.x.r)))).map(z => `<i onclick="ndComAdd(${z.i})">＋ ${E(sgBase(z.x.r))}</i>`).join('')}<i class="sg-sh" onclick="sgShtat('com')">👤 Shtatdan tanlash</i><i onclick="ndComCustom()">＋ Qoʻlda qoʻshish</i></div>`;
            } catch (e) { console.error(e); }
            return r;
        });
        // Akt tuzish / PDF / saqlashdan oldin — shtatdan tasdiqlanmagan qatorlar haqida ogohlantirish
        ['ndGenerate', 'aktPdf', 'ndSaveAkt'].forEach(fn => { try { const o = window[fn]; if (typeof o !== 'function') return; window[fn] = function () { try { ndFormSync(); } catch (e) {} const w = ND.form ? sgWarn([ND.form.apObj].concat(ND.form.com || [])) : '', self = this, args = arguments; if (!w) return o.apply(self, args); return (async () => { if (await uiConfirm('⚠️ Quyidagi lavozimlar egasi shtatdan topilmadi:\n' + w + '\n\n«📋 Shablon → v.b.» yoki «✍️ Qoʻlda» bilan toʻgʻrilashingiz mumkin. Shunday davom etilsinmi?')) return o.apply(self, args); })(); }; } catch (e) {} });

        // ---------------- Xizmat xati: imzolovchilar va chiziqsiz hujjat ----------------
        NAR_VT_SIG.splice(0, NAR_VT_SIG.length, ['Bosh muhandis', '@@N:293@@'], ['Bosh energetik-ETX boshligʻi', '@@N:335@@'], ['Bosh mexanik', '@@N:291@@'], ['Bosh muhandisning MM, XT va HX boʻyicha oʻrinbosari', '@@N:285@@'], ['Bosh buxgalter', ''], ['MTE va IH boʻlimi boshligʻi', '@@N:361@@'], ['Kadrlar boʻlimi boshligʻi', '@@N:292@@'], ['{BOLIM} boshligʻi', '{BOSHLIQ}'], ['Mehnat boʻyicha iqtisodchi', '']);
        function narVtCtx() { const f = NARV.f || {}, a = f.a || {}; let su = '', b = ''; try { const r = a.tabel ? (findXodimsByTabel(a.tabel) || [])[0] : null; if (r) { su = r.su; b = r.item.bolim || ''; } } catch (e) {} return { su: su, b: b, unit: f.unit || a.unit || '' }; }
        function narVtSigInit(f, force) {
            if (!f || (f.sig && f.sig.length && !force)) return; const c = narVtCfg(), ctx = narVtCtx();
            f.sig = c.sig.map(([t, n]) => {
                if (/\{BOLIM\}/.test(t)) { const lb = (ctx.b || f.unit || 'Boʻlim') + ' boshligʻi'; const row = { base: lb, r: lb, n: '', m: 'shtat', hint: f.bosh || '' }; const H = sgHolders(lb, { boss: 1, su: ctx.su, b: ctx.b }); if (H.length === 1) { row.n = sgShort(H[0].item.name, 'uz'); row.t = cleanTabel(H[0].item.tabel); } else row.nf = 1; row.boss = 1; return row; }
                return sgFromTpl({ r: t, n: n }, 'uz', ctx);
            });
        }
        function narVtSigRefresh() { const f = NARV.f; if (!f || !f.sig) return; const ctx = narVtCtx(); f.sig = f.sig.map(x => { if (x.m !== 'shtat') return x; if (x.boss) { const lb = (ctx.b || f.unit || 'Boʻlim') + ' boshligʻi', H = sgHolders(lb, { boss: 1, su: ctx.su, b: ctx.b }); return Object.assign({}, x, { base: lb, r: lb, n: H.length === 1 ? sgShort(H[0].item.name, 'uz') : x.n, t: H.length === 1 ? cleanTabel(H[0].item.tabel) : '', nf: H.length === 1 ? 0 : 1 }); } return sgApply(Object.assign({}, x), 'uz', ctx); }); }
        narVtNew = agmkExtend('narVtNew', 'v3.8: imzolovchilar', narVtNew, o => function () { const r = o.apply(this, arguments); narVtSigInit(NARV.f, true); return r; });
        narVtOpen = agmkExtend('narVtOpen', 'v3.8: imzolovchilar', narVtOpen, o => function () { const r = o.apply(this, arguments); if (NARV.f && !NARV.f.sig) { narVtSigInit(NARV.f, true); narRender(); } return r; });
        narVtSet = agmkExtend('narVtSet', 'v3.8: asosiy xodim oʻzgarsa — boʻlim rahbari qayta', narVtSet, o => function (side) { const r = o.apply(this, arguments); if (side === 'a') { narVtSigRefresh(); narRender(); } return r; });
        narVtFormHtml = agmkExtend('narVtFormHtml', 'v3.8: imzolovchilar qatori', narVtFormHtml, o => function () {
            let h = o.apply(this, arguments); const f = NARV.f; if (!f) return h; narVtSigInit(f);
            h = h.replace(/<div class="nar-grid" style="grid-template-columns:1fr 1fr"><div class="mm-f"><label>Boʻlim boshligʻi lavozimi[\s\S]*?<\/div><div class="mm-f">[\s\S]*?<\/div><\/div>/, '');
            const sec = `<div class="mm-f"><label>IMZO CHEKUVCHILAR — har qatorda: 📋 shablon (hozirgi shtat yoki v.b.) yoki ✍️ qoʻlda</label><div class="nd-signers">${sgRowsHtml('vt', f.sig, '')}</div><div class="nd-chips"><i class="sg-sh" onclick="sgShtat('vt')">👤 Shtatdan tanlash</i><i onclick="narVtKeep(); NARV.f.sig.push({base:'',r:'',n:'',m:'qolda',t:''}); sgMan('vt', NARV.f.sig.length-1)">＋ Qator qoʻshish</i><i onclick="narVtKeep(); narVtSigInit(NARV.f, true); narRender()">↺ Shablon boʻyicha qayta</i></div></div>`;
            return h.replace('<div class="hs-acts">', sec + '<div class="hs-acts">');
        });
        function narVtTo() { const c = narVtCfg(); let n = c.toName; try { const H = sgHolders(sgBase(c.to)); if (H.length === 1) n = sgShort(H[0].item.name, 'uz') + 'ga'; } catch (e) {} return { to: c.to, name: n }; }
        // 15) Chiziqsiz hujjat: hamma joy to'ldirilgan; bo'sh bandlar chiqarilmaydi; imzo joylari bo'sh (elektron imzo qo'yiladi)
        narVtDoc = function (f) {
            const E = escapeHtml, T = narVtTo(), sg = (f.sig && f.sig.length ? f.sig : (narVtSigInit(f, true), f.sig)) || [];
            const why = (f.why === 'boshqa sabab' ? (f.whyX || 'boshqa sabab') : f.why) + ' (' + narDmy(f.from) + ' dan ' + narDmy(f.to) + ' gacha)';
            const exs = NAR_VT_EX.filter(([k]) => String(f.ex[k] || '').trim()).map(([k, t]) => E(t) + ' — ' + E(f.ex[k])).join('; ');
            const P = (s, ind) => `<p style="text-align:justify;margin:0 0 4px;${ind === false ? '' : 'text-indent:1.25cm'}">${s}</p>`, val = (v, tx) => String(v || '').trim() ? P(tx + ' ' + E(String(v).trim()).replace(/\.$/, '') + '.') : '';
            const row = (l, n) => `<tr style="height:30px"><td style="width:50%;vertical-align:bottom">${E(l)}</td><td style="width:6%"></td><td style="width:44%;text-align:right;vertical-align:bottom;white-space:nowrap">${E(n)}</td></tr>`;
            const blName = (f.unit || '').trim();
            return (`<div style="font-family:AGMKSerif,'Times New Roman',serif;font-size:13.5pt;line-height:1.45;color:#000;max-width:720px;margin:0 auto">
                <p style="text-align:right;margin:0"><b>${E(T.to)}</b><br>${E(T.name)}</p><br>
                <p style="text-align:center;margin:0"><b>Muhandis-texnik xodimni vaqtincha tayinlashga taqdim etish toʻgʻrisida</b><br><b>xizmat xati</b></p><br>
                ${P(`${blName ? E(blName) + ' maʼmuriyati ' : ''}${E(f.b.lav ? f.b.lav + ' ' : '')}<b>${E(f.b.name)}</b>ni${f.b.tabel ? ' (tab.№ ' + E(f.b.tabel) + ')' : ''} <b>${E(f.a.lav || '')}</b> lavozimiga vaqtincha tayinlashga taqdim etadi.`)}
                ${P(`Asosiy xodim ${E(f.a.name)}${f.a.tabel ? ' (tab.№ ' + E(f.a.tabel) + ')' : ''}ning ${E(why)} davriga.`)}
                ${P(`${String(f.raz || '').trim() ? 'Lavozim razryadi ' + E(f.raz) + ', b' : 'B'}ajarilgan ishga muvofiq avvalgi oylik ish haqidan kam boʻlmagan miqdorda maosh toʻlash asosida.`)}
                ${val(f.zax, 'Lavozim zaxirasiga kiritilganligi haqida maʼlumot:')}${val(f.mod, 'Moddiy javobgarlik haqida maʼlumot:')}
                ${String(f.hisob || '').trim() ? P('“Olmaliq KMK” AJning “Hisob siyosati” (tegishli qismi boʻyicha) bilan ' + E(f.hisob) + '.') : ''}
                ${P('Imtihonlardan oʻtganligi haqidagi qayd (bayonnoma raqami va sanasi): ' + (exs || 'talab etilmaydi') + '.')}
                <table class="a-sign" style="width:100%;border-collapse:collapse;font-size:13.5pt;margin-top:8px">${row('Xodim roziligi (' + narDmy(f.date || todayISO()) + ')', sgShort(f.b.name, 'uz'))}${sg.filter(x => x && (x.n || x.r)).map(x => row(x.r, x.n)).join('')}</table></div>`).replace(/([OoGg])(?:'|&#39;|’|`)/g, '$1ʻ');
        };
        if (typeof narVtCheck === 'function') narVtCheck = agmkExtend('narVtCheck', 'v3.8: imzolovchilar tekshiruvi', narVtCheck, o => function () { const r = o.apply(this, arguments); if (!r) return r; const f = NARV.f, w = f && f.sig ? sgWarn(f.sig) : ''; if (w) { f._warn = w; } return r; });
        // Imzoga yuborish: tabeli ma'lum qatorlar — o'sha xodimga; qolganlari — familiya bo'yicha
        narVtSend = async function () {
            const f = narVtSave(false); if (!f) return;
            if (f._warn && !(await uiConfirm('⚠️ Quyidagi lavozimlar egasi shtatdan topilmadi:\n' + f._warn + '\n\nShunday yuborilsinmi?'))) return;
            if (typeof sigSendOpen !== 'function') { alert('Imzolash moduli topilmadi'); return; }
            const all = narVtList(), rr = all.find(z => z.id === f.id); if (rr) { rr.sent = new Date().toISOString(); kvSet(NAR_VT_KEY, all); }
            await Promise.resolve(sigSendOpen({ html: narVtDoc(f), title: narVtTitle(f) }));
            if (!SIG.pend) return; const U = SIG.users || [], sur = n => String(n || '').replace(/^.*\./, '').trim();
            const byT = t => t ? U.find(u => cleanTabel(u.tabel) === cleanTabel(t)) : null, byN = n => { const k = sigKey(sur(n)); const L = U.filter(u => sigKey(String(u.name).split(/\s+/)[0]) === k); return L.length === 1 ? L[0] : null; };
            const rows = [], ub = byT(f.b.tabel) || byN(f.b.name);
            rows.push({ label: sgShort(f.b.name, 'uz') + ' (xodim roziligi)', tabel: ub ? ub.tabel : '', on: !!ub, sign: true });
            (f.sig || []).forEach(x => { if (!x.n) return; const u = byT(x.t) || (x.m === 'qolda' && !x.t ? null : byN(x.n)); rows.push({ label: x.r + ' — ' + x.n, tabel: u ? u.tabel : '', on: !!u, sign: true }); });
            SIG.pend.rows = rows; sigSendRender();
        };

        (function () { const st = document.createElement('style'); st.textContent = `.sg-row{flex-wrap:wrap;gap:6px}.sg-row .nd-ed{flex:1 1 100%}.sg-btns{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}.sg-btns button{padding:6px 10px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#f8fafc;font-size:12.5px}.sg-btns .sg-b1{border-color:#38bdf8}.sg-btns .sg-b2{border-color:#a78bfa}
            .sg-bd{display:inline-block;font-size:11px;padding:1px 7px;border-radius:9px;margin-left:4px;vertical-align:middle}.sg-bd.sh{background:rgba(34,197,94,.18);color:#86efac}.sg-bd.vb{background:rgba(56,189,248,.18);color:#7dd3fc}.sg-bd.ql{background:rgba(167,139,250,.18);color:#c4b5fd}.sg-bd.nf{background:rgba(239,68,68,.2);color:#fca5a5}
            .sg-opt{border:1px solid #334155;border-radius:12px;padding:10px;margin:6px 0;background:#0f172a;color:#e2e8f0;cursor:pointer}.sg-opt.on{border-color:#38bdf8;background:rgba(56,189,248,.12)}.sg-opt small{display:block;color:#94a3b8;margin-top:3px}.sg-opt.sm{padding:7px 10px;margin-left:14px}.sg-more summary{cursor:pointer;color:#94a3b8;margin:8px 0}.sg-link{display:block;padding:8px;border:1px solid #22c55e;border-radius:10px;margin:6px 0;color:#bbf7d0}`; document.head.appendChild(st); })();

        // ---------------- 6) 🦺 Mehnat muhofazasi — pasportdan alohida kartochka ----------------
        //  Pasportda faqat shaxsiy maʼlumotlar; MM — alohida tugma/kartochka (bosilganda alohida oynada ochiladi)
        function mmpWorst(item) { try { const s = mmStat(item), K = ['bilim', 'tibbiy', 'davriy'].filter(k => s[k] && !s[k].na); let w = null; K.forEach(k => { const x = s[k], r = { bad: 0, warn: 1, no: 2, ok: 3 }[mmpSt(x.left)]; if (!w || r < w.r) w = { r: r, k: k, x: x }; }); return w; } catch (e) { return null; } }
        mmpRefresh = function () {
            try {
                ['mmpBox', 'mmpCardBtn'].forEach(id => { const o = $id(id); if (o && !o.closest('.modal-overlay')) o.remove(); });
                if (typeof currentSectionType === 'undefined' || currentSectionType !== 'xodim') return; const item = getActiveItem(); if (!item || !item.tabel) return;
                if (!(canMMView() || (typeof isOwnItem === 'function' && isOwnItem(item)))) return;
                const g = $id('item-passport-grid'); if (!g) return; const w = mmpWorst(item), lb = { bilim: 'Bilim sinovi', tibbiy: 'Tibbiy koʻrik', davriy: 'Yoʻl-yoʻriq' };
                const st = w ? mmpSt(w.x.left) : 'no', txt = w ? lb[w.k] + ': ' + mmpLeftTxt(w.x.left) : 'maʼlumot yoʻq';
                g.insertAdjacentHTML('afterend', `<div class="mmp-card ${st}" id="mmpCardBtn" onclick="mmpOpen()"><span>🦺</span><div><b>Mehnat muhofazasi</b><small>${escapeHtml(txt)}</small></div><i>›</i></div>`);
                const m = $id('mmpM'); if (m && !m.classList.contains('hidden')) mmpOpen(true);
            } catch (e) { console.error(e); }
        };
        function mmpOpen(keep) {
            const item = getActiveItem(); if (!item) return;
            const h = mmpHtml(item).replace('id="mmpBox"', 'id="mmpBoxM"');
            mdl('mmpM', `<div class="px-h"><b>🦺 ${escapeHtml(shortName(item.name))}</b><button class="mini-btn" onclick="mdlClose('mmpM')">✕</button></div>${h}`, true);
        }
        (function () { const st = document.createElement('style'); st.textContent = `.mmp-card{display:flex;align-items:center;gap:12px;margin:12px 0;padding:14px;border-radius:14px;border:1.5px solid #475569;background:rgba(30,41,59,.85);cursor:pointer}.mmp-card>span{font-size:26px}.mmp-card div{flex:1}.mmp-card b{display:block;color:#f8fafc;font-size:15px}.mmp-card small{color:#cbd5e1}.mmp-card i{font-style:normal;font-size:22px;color:#94a3b8}.mmp-card.bad{border-color:#ef4444;background:rgba(127,29,29,.45)}.mmp-card.warn{border-color:#eab308;background:rgba(113,63,18,.45)}.mmp-card.ok{border-color:#3b82f6}`; document.head.appendChild(st); })();

        // ---------------- 8) 👑 Rahbar maqomi — 3 daraja (faqat administrator belgilaydi) ----------------
        //  1 — mutlaq rahbar: koʻradi va zamechaniya beradi · 2 — vaqtincha rahbar: xuddi shunday, muddat bilan (tugasa oʻzi oʻchadi)
        //  3 — kuzatuvchi: rahbar bilan bir xil koʻradi, lekin tahrirlay olmaydi (zamechaniya bermaydi, qabul qilmaydi)
        //  Saqlanishi: rollar roʻyxatida ('rl1', 'rl2@YYYY-MM-DD', 'rl3') — faqat admin yozadi, serverga sinxronlanadi
        function rlLevel(t) {
            t = cleanTabel(t || meTabel()); const L = typeof rolesOf === 'function' ? rolesOf(t) : [], today = todayISO();
            if (L.includes('rl1')) return 1;
            const v = L.find(x => /^rl2@/.test(x)); if (v && v.slice(4) >= today) return 2;
            if (L.includes('rl3')) return 3;
            return 0;
        }
        const _isRahbarLegacy = typeof isRahbar === 'function' ? isRahbar : () => false;
        isRahbar = function () { if (!currentUser) return false; const l = rlLevel(); return l === 1 || l === 2 || (l === 0 && _isRahbarLegacy()); };
        function isRahbarView() { return isAdmin() || isRahbar() || rlLevel() === 3; }
        function rlSet(t, lv, to) {
            if (!isAdminReal()) { alert('Rahbar maqomini faqat administrator belgilaydi.'); return; }
            const a = rolesAll(), k = cleanTabel(t); let l = (a[k] || []).filter(x => !/^rl[123]/.test(x));
            if (lv === 1) l.push('rl1'); else if (lv === 2) l.push('rl2@' + to); else if (lv === 3) l.push('rl3');
            if (l.length) a[k] = l; else delete a[k]; a._by = ADMIN_TABEL; a._at = new Date().toISOString(); kvSet(ROLE_KEY, a);
            try { audLog('👑 Rahbar maqomi: ' + (xodimByTabel(k) || {}).name + ' → ' + (lv ? ['', 'mutlaq rahbar', 'vaqtincha rahbar (' + fmtD(to) + ' gacha)', 'kuzatuvchi'][lv] : 'olib tashlandi')); } catch (e) {}
            rolesRender();
        }
        async function rlAdd(lv) {
            let to = '';
            if (lv === 2) { to = await uiPrompt('Vaqtincha rahbar — qaysi sanagacha? (YYYY-MM-DD)', mmAddMonths(todayISO(), 1)); if (!to) return; to = String(to).trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(to) || to < todayISO()) { alert('Sanani YYYY-MM-DD koʻrinishida, bugundan keyingi kun qilib yozing.'); return; } }
            pickXodim(['', '👑 Mutlaq rahbar', '⏳ Vaqtincha rahbar', '👁 Kuzatuvchi'][lv] + ' — xodimni tanlang', it => rlSet(it.tabel, lv, to));
        }
        if (typeof rolesRender === 'function') rolesRender = agmkExtend('rolesRender', 'v3.8: rahbar maqomi 3 daraja', rolesRender, o => function () {
            const r = o.apply(this, arguments); const b = $id('rolesBody'); if (!b) return r; const a = rolesAll(), E = escapeHtml, today = todayISO();
            const rows = Object.keys(a).filter(k => k[0] !== '_').map(k => ({ k: k, l: a[k] || [] })).filter(x => x.l.some(z => /^rl[123]/.test(z)));
            const lvOf = x => x.l.includes('rl1') ? 1 : x.l.some(z => /^rl2@/.test(z)) ? 2 : 3;
            b.insertAdjacentHTML('afterbegin', `<div class="rl-sec"><div class="rl-t">👑 Rahbar maqomi (zamechaniya)</div><small>1 — mutlaq rahbar: koʻradi va zamechaniya beradi · 2 — vaqtincha rahbar: xuddi shunday, belgilangan sanagacha (keyin oʻzi oʻchadi) · 3 — kuzatuvchi: rahbar bilan bir xil koʻradi, tahrirlay olmaydi. Faqat siz belgilaysiz.</small>
                <div class="ui-row" style="margin:8px 0"><button onclick="rlAdd(1)">➕ 👑 Mutlaq rahbar</button><button onclick="rlAdd(2)">➕ ⏳ Vaqtincha rahbar</button><button onclick="rlAdd(3)">➕ 👁 Kuzatuvchi</button></div>
                ${rows.map(x => { const it = xodimByTabel(x.k), lv = lvOf(x), to = (x.l.find(z => /^rl2@/.test(z)) || '').slice(4), exp = lv === 2 && to < today; return `<div class="rl-row"><span>${['', '👑', '⏳', '👁'][lv]} ${E(it ? it.name : 'tabel ' + x.k)}<small>${['', 'mutlaq rahbar', 'vaqtincha rahbar · ' + E(fmtD(to)) + ' gacha' + (exp ? ' — ⌛ muddati tugagan' : ''), 'kuzatuvchi'][lv]} · ${E(x.k)}</small></span><button class="mini-btn" onclick="rlSet('${x.k}',0)">✕</button></div>`; }).join('') || '<div class="rl-empty">Hali hech kim yoʻq — hozircha Shtatdagi 👑 lavozimlar rahbar hisoblanadi</div>'}</div>`);
            return r;
        });

        // ---------------- 7) Zamechaniya — faqat oʻsha boʻlimga biriktirilgan xodim va rahbar maqomidagilar koʻradi ----------------
        var ZV_MAP = { vagon: v => [v.seh || '', 'VH/ВС'], lok: () => ['TYS-3/ЖДЦ-3', 'TYS-1/ЖДЦ-1', 'TYS-2/ЖДЦ-2'], avto: () => ['TYS-3/ЖДЦ-3'], yol: () => ['TYS-3/ЖДЦ-3', 'TYS-4/ЖДЦ-4'], infra: () => ['TYS-4/ЖДЦ-4', 'SMBvaAX / СЦБ', 'ET/ЭС'] };
        function zvMine() { try { const r = (findXodimsByTabel(meTabel()) || [])[0]; return r ? { su: r.su, b: r.item.bolim || '' } : null; } catch (e) { return null; } }
        function zamCanSee(v, z) {
            if (!currentUser) return false; if (isAdmin() || isRahbarView()) return true;
            const me = meTabel(); if (z && ((z.by && cleanTabel(z.by.tabel) === me) || (z.attempts || []).some(a => a.by && cleanTabel(a.by.tabel) === me))) return true;
            const m = zvMine(); if (!m) return false;
            if (m.su === 'Boshqarma' && /Ishlab chiqarish-texnik|Bosh mexanik/i.test(m.b)) return true; // PTO va bosh mexanik — barcha texnika
            const f = ZV_MAP[v && v.kind ? v.kind : 'vagon'] || ZV_MAP.vagon; return f(v || {}).filter(Boolean).includes(m.su);
        }
        if (typeof renderZams === 'function') renderZams = agmkExtend('renderZams', 'v3.8: zamechaniya — faqat boʻlim va rahbariyat', renderZams, o => function (v) {
            if (v && $id('zam-box') && !zamCanSee(v)) { $id('zamTitle').innerText = '🚨 Rahbariyat nazorati — zamechaniyalar'; const f = $id('zamForm'); if (f) f.innerHTML = ''; $id('zamList').innerHTML = '<div class="zam-note">🔒 Zamechaniyalarni faqat shu texnika biriktirilgan boʻlim xodimlari va rahbar maqomidagilar koʻradi.</div>'; return; }
            return o.apply(this, arguments);
        });
        if (typeof openRN === 'function') openRN = function () { if (!isRahbarView()) { alert('🔒 Bu boʻlim faqat rahbar maqomidagilar uchun (administrator belgilaydi).'); return; } openScreen('screen-rn'); renderRN(); };
        if (typeof renderRN === 'function') renderRN = agmkExtend('renderRN', 'v3.8: kuzatuvchi va rahbar — hammasini koʻradi', renderRN, o => function () {
            const oIs = isZamOwner; isZamOwner = z => oIs(z) || ((isRahbarView() && !isAdmin()) && rnAllMode()); try { return o.apply(this, arguments); } finally { isZamOwner = oIs; try { const s = $id('rnStats'); if (s && isRahbarView() && !isAdmin() && !$id('rnMode')) s.insertAdjacentHTML('beforebegin', `<div id="rnMode" class="ui-row" style="margin:6px 0"><button class="${rnAllMode() ? '' : 'on'}" onclick="RNM.all=false; renderRN()">Mening zamechaniyalarim</button><button class="${rnAllMode() ? 'on' : ''}" onclick="RNM.all=true; renderRN()">Barcha boʻlimlar</button></div>`); else if ($id('rnMode')) $id('rnMode').querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', (i === 1) === rnAllMode())); } catch (e) {} }
        });
        var RNM = { all: null }; function rnAllMode() { return RNM.all === null ? rlLevel() === 3 : RNM.all; }
        if (typeof zamCanReview === 'function') zamCanReview = agmkExtend('zamCanReview', 'v3.8: kuzatuvchi tahrirlamaydi', zamCanReview, o => function (z) { if (rlLevel() === 3 && !isAdmin() && !isRahbar()) return false; return o.apply(this, arguments); });

        // ---------------- 11) «Kim nima qildi» jurnali (faqat administrator koʻradi) ----------------
        var AUD_KEY = 'agmk_audit_v1';
        function audLog(a, extra) {
            try { const l = kvGet(AUD_KEY, []) || []; l.push(Object.assign({ at: new Date().toISOString(), by: authorStr(), byT: meTabel(), a: String(a).slice(0, 300) }, extra || {})); kvSet(AUD_KEY, l.slice(-3000)); } catch (e) {}
        }
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(AUD_KEY)) KV_SYNC.keys.push(AUD_KEY); } catch (e) {}
        function audOpen() {
            if (!isAdmin()) { alert('Jurnal faqat administrator uchun.'); return; }
            const E = escapeHtml, l = (kvGet(AUD_KEY, []) || []).slice().reverse();
            mdl('audM', `<div class="px-h"><b>📜 Kim nima qildi</b><button class="mini-btn" onclick="mdlClose('audM')">✕</button></div>
                <input class="search-box" placeholder="🔎 Qidirish (ism, tabel, amal)..." oninput="const q=this.value.toLowerCase(); document.querySelectorAll('#audL .aud-r').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none')">
                <div id="audL" style="max-height:60vh;overflow:auto">${l.map(x => `<div class="aud-r"><small>${E(fmtDT(x.at))} · ${E(x.by || '')}</small><div>${E(x.a)}</div></div>`).join('') || '<div class="xt-empty">Hali yozuv yoʻq.</div>'}</div>
                <button class="mini-btn" onclick="xlsxDl([['Vaqt','Kim','Tabel','Amal']].concat((kvGet(AUD_KEY, [])||[]).map(x=>[fmtDT(x.at), x.by||'', x.byT||'', x.a])), 'Jurnal ' + fmtD(todayISO()))">📤 Yuklab olish</button>`, true);
        }
        if (typeof rolesRender === 'function') rolesRender = agmkExtend('rolesRender', 'v3.8: jurnal tugmasi', rolesRender, o => function () { const r = o.apply(this, arguments); const b = $id('rolesBody'); if (b && isAdmin()) b.insertAdjacentHTML('afterbegin', '<button class="action-btn sec" onclick="audOpen()">📜 Kim nima qildi — jurnal</button>'); return r; });
        if (typeof roleSet === 'function') roleSet = agmkExtend('roleSet', 'v3.8: jurnalga', roleSet, o => function (t, r, on) { const x = o.apply(this, arguments); try { if (isAdminReal()) audLog('👥 Rol: ' + ((xodimByTabel(t) || {}).name || t) + ' — ' + r + (on ? ' berildi' : ' olindi')); } catch (e) {} return x; });
        (function () { const st = document.createElement('style'); st.textContent = `.aud-r{border-bottom:1px solid #1e293b;padding:7px 2px;font-size:13px;color:#e2e8f0}.aud-r small{color:#94a3b8}`; document.head.appendChild(st); })();

        // ---------------- 4) Bosh kartochka — hammaga; oklad — faqat oʻziniki (hammaniki — admin va «📂» roli) ----------------
        try { if (typeof ROLE_DEF !== 'undefined' && !ROLE_DEF.some(x => x[0] === 'okl')) ROLE_DEF.push(['okl', '📂', 'Xodimlar ichki sahifasi va oklad', 'Barcha xodimlarning ichki sahifasi (yopiq maʼlumotlari) va okladini koʻradi']); } catch (e) {}
        if (typeof okCan === 'function') okCan = function () { try { return isAdmin() || hasRole('okl'); } catch (e) { return false; } };
        if (typeof isPriv === 'function') isPriv = agmkExtend('isPriv', 'v3.8: «📂» roli', isPriv, o => function () { try { return o.apply(this, arguments) || hasRole('okl'); } catch (e) { return false; } });
        if (typeof okLoad === 'function') okLoad = async function (silent) { // oddiy xodimga server faqat oʻz okladini qaytaradi
            if (typeof sbFetch !== 'function' || !(typeof sigSrv === 'function' && sigSrv())) return 0;
            try { const r = await sbFetch('/api/roster/v1/oklad'); if (!r || !r.list) return 0; const M = new Map(r.list.map(x => [cleanTabel(x.tabel), x])); let n = 0;
                allXodims().forEach(z => { const t = cleanTabel(z.item.tabel), x = M.get(t); if (!x) { if (!okCan() && t !== meTabel() && z.item.oklad) { delete z.item.oklad; n++; } return; } if (x.oklad && z.item.oklad !== x.oklad) { z.item.oklad = x.oklad; n++; } if (x.razryad && !z.item.razryad) z.item.razryad = x.razryad; });
                if (n) saveDB(false); if (!silent) showToast('💰 Oklad yangilandi: ' + n + ' ta'); return n; } catch (e) { return 0; }
        };
        if (typeof xtXodimCard === 'function') xtXodimCard = agmkExtend('xtXodimCard', 'v3.8: oklad — faqat oʻziniki', xtXodimCard, o => function (r) {
            const own = r && r.item && cleanTabel(r.item.tabel) === meTabel(); if (okCan() || !r || !r.item || !r.item.oklad) return o.apply(this, arguments);
            const ok = r.item.oklad; if (!own) { r.item.oklad = undefined; try { return o.apply(this, arguments); } finally { r.item.oklad = ok; } }
            let h = o.apply(this, arguments); if (!/Oklad/.test(h)) h = h.replace('<button class="details-btn"', `<div class="card-row"><span>💰 Oklad: <span>${escapeHtml(okFmt(ok))}</span></span></div><button class="details-btn"`); return h;
        });

        // ---------------- 12) Ishdan boʻshagan xodim — hisob yopiladi (kadrlar yoki admin belgilaydi), maʼlumotlari saqlanadi ----------------
        var FIRED_KEY = 'agmk_fired';
        try { if (typeof KV_SYNC !== 'undefined' && !KV_SYNC.keys.includes(FIRED_KEY)) KV_SYNC.keys.push(FIRED_KEY); } catch (e) {}
        function firedOf(t) { const m = kvGet(FIRED_KEY, {}) || {}; return m[cleanTabel(t)] || null; }
        async function firedSet(t, on) {
            if (!(isAdmin() || hasRole('kadr'))) { alert('Faqat kadrlar boʻlimi yoki administrator.'); return; }
            const it = xodimByTabel(t), m = kvGet(FIRED_KEY, {}) || {}, k = cleanTabel(t); if (k === ADMIN_TABEL) return;
            if (on) { const d = await uiPrompt('Ishdan boʻshagan sana (YYYY-MM-DD):', todayISO()); if (!d) return; m[k] = { at: String(d).trim(), by: authorStr(), byT: meTabel() }; }
            else delete m[k];
            kvSet(FIRED_KEY, m); audLog((on ? '🚪 Ishdan boʻshagan deb belgilandi: ' : '↩ Boʻshagan belgisi olindi: ') + ((it || {}).name || k)); showToast(on ? '🚪 Hisob yopildi' : '↩ Hisob tiklandi');
            try { refreshCurrentScreen(); } catch (e) {}
        }
        if (typeof lookupXodim === 'function') lookupXodim = agmkExtend('lookupXodim', 'v3.8: boʻshagan xodim kira olmaydi', lookupXodim, o => function (t) { const r = o.apply(this, arguments); if (r && r.rec && firedOf(t)) return { err: 'Hisobingiz yopilgan (ishdan boʻshagan: ' + fmtD(firedOf(t).at) + '). Kadrlar boʻlimiga murojaat qiling.' }; return r; });
        if (typeof xtXodimCard === 'function') xtXodimCard = agmkExtend('xtXodimCard', 'v3.8: boʻshagan belgisi', xtXodimCard, o => function (r) {
            let h = o.apply(this, arguments); try { const t = cleanTabel(r.item.tabel), f = firedOf(t);
                if (f) h = h.replace('<div class="vagon-header-row">', `<div class="hp-warn">🚪 Ishdan boʻshagan: ${escapeHtml(fmtD(f.at))} — hisobi yopilgan</div><div class="vagon-header-row">`);
                if ((isAdmin() || hasRole('kadr')) && t && t !== ADMIN_TABEL) h = h.replace('<button class="details-btn"', `<button class="mini-btn" style="margin:6px 0" onclick="event.stopPropagation(); firedSet('${t}', ${f ? 'false' : 'true'})">${f ? '↩ Hisobni tiklash' : '🚪 Ishdan boʻshagan deb belgilash'}</button><button class="details-btn"`);
            } catch (e) {} return h;
        });
        // Joriy sessiya: belgilangan zahoti chiqariladi
        setInterval(() => { try { if (currentUser && currentUser.tabel && !isAdmin() && firedOf(currentUser.tabel) && !document.body.classList.contains('locked')) { alert('Hisobingiz yopildi (ishdan boʻshagan).'); if (typeof lockApp === 'function') lockApp(); else location.reload(); } } catch (e) {} }, 30000);

        // ---------------- 9) Vaqtincha tayinlash: xizmat xati toʻliq imzolansa — vakolatlar oʻzi oʻtadi, muddat tugasa qaytadi ----------------
        //  Server tasdiqlangan (hamma imzolagan) xatlarni roʻyxatga oladi: /api/vt/v1/active. Telefon oxirgi roʻyxatni saqlab qoladi (oflaynda ham).
        var VTA_KEY = 'agmk_vt_active';
        function vtActive(day) { day = day || todayISO(); const l = kvGet(VTA_KEY, []) || []; return (Array.isArray(l) ? l : []).filter(x => !x.cancelled && x.from <= day && x.to >= day); }
        async function vtLoad() { try { if (!(typeof sigSrv === 'function' && sigSrv())) return; const r = await sbFetch('/api/vt/v1/active'); if (Array.isArray(r)) { localStorage.setItem(VTA_KEY, JSON.stringify(r)); } } catch (e) {} }
        window.addEventListener('agmk:login', () => setTimeout(vtLoad, 2000)); setInterval(vtLoad, 10 * 60000);
        const _rolesOf = rolesOf;
        rolesOf = function (t) {
            const k = cleanTabel(t), base = _rolesOf(k); if (k === ADMIN_TABEL) return base;
            try { const A = vtActive(); if (A.some(x => x.a === k)) return base.filter(r => /^rl3$/.test(r)); // asl xodim — shu muddatga vakolatsiz (kuzatuv qoladi)
                const inh = A.filter(x => x.b === k).reduce((s, x) => s.concat(_rolesOf(x.a)), []); return inh.length ? Array.from(new Set(base.concat(inh))) : base; } catch (e) { return base; }
        };
        // Lavozim egasi vaqtincha yoʻq boʻlsa — shablon qatori oʻzi «v.b.» ga oʻtadi
        sgApply = agmkExtend('sgApply', 'v3.8: tasdiqlangan xizmat xati — v.b.', sgApply, o => function (row, lang, ctx) {
            const r = o.apply(this, arguments); try { if (r.m === 'shtat' && r.t) { const x = vtActive().find(z => z.a === cleanTabel(r.t)); if (x) { const it = xodimByTabel(x.b); if (it) { r.m = 'vb'; r.r = sgVbLabel(r.base, lang); r.n = sgShort(it.name, lang); r.t = cleanTabel(it.tabel); r.auto = 'vt'; } } } } catch (e) {} return r;
        });
        // Xizmat xati imzoga ketganda — server uchun meta (kim, kimning oʻrniga, qachondan qachongacha)
        narVtSend = agmkExtend('narVtSend', 'v3.8: vakolat oʻtkazish uchun meta', narVtSend, o => async function () {
            const r = await o.apply(this, arguments); try { const f = NARV.f; if (SIG.pend && f && f.a && f.b && f.a.tabel && f.b.tabel) SIG.pend.meta = { vt: { a: cleanTabel(f.a.tabel), b: cleanTabel(f.b.tabel), from: f.from, to: f.to, why: f.why === 'boshqa sabab' ? f.whyX : f.why, vid: f.id } }; } catch (e) {} return r;
        });

