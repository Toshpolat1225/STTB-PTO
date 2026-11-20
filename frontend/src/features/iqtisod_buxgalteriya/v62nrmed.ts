        // =====================================================================
        // 6.2 — Normalarni hujjat sahifasining oʻzida tahrirlash (muallif, 17.11.2026)
        //  • «📚 Normativ hujjatlar» → «Meʼyor 2026 · 2VS-105» va h.k.: jadval endi normalar bazasidan (agmk_norm_v1) jonli olinadi —
        //    tahrirlangan miqdor shu yerda ham, hisobot tekshiruvida ham bir xil (avval sahifada eski raqam qolardi).
        //  • Huquqi borlar uchun (administrator, hisobot tekshiruvchi): «✏️ Tahrirlash» — miqdorni oʻzgartirish, ➕ yangi qator
        //    (ehtiyot qism / material), 🗑 qatorni olib tashlash; «➕ Yangi norma» — yangi tur (vagon turi, taʼmir, yil).
        //  • Har oʻzgarish: kim, qachon, sabab (buyruq raqami) — normaning tarixida; versiya raqami oshadi.
        //  • Tekshiruv algoritmi oʻsha bazani ishlatadi (nrmPick: tur · taʼmir · spravka yili) — alohida sozlash kerak emas.
        // =====================================================================
        const N62: any = window as any;
        function nrm62Seed(docId: string): any { const m = /^nrm52_(\d+)$/.exec(String(docId || '')); return m && N62.NRM52_SETS ? N62.NRM52_SETS[+m[1]] : null; }
        function nrm62Live(seed: any): any { try { const k = N62.nrmSetKey(seed); const L = N62.nrmDB().sets.filter((s: any) => N62.nrmSetKey(s) === k); return L[L.length - 1] || seed; } catch (e) { return seed; } }
        function nrm62Table(s: any): string {
            const E = (v: any) => N62.escapeHtml(String(v == null ? '' : v)), can = (() => { try { return N62.nrmCanEdit(); } catch (e) { return false; } })();
            let grp = '';
            const rows = (s.items || []).map((x: any, k: number) => {
                const g = x.grp && x.grp !== grp ? (grp = x.grp, `<tr><td colspan="4"><b>${E(x.grp)}</b></td></tr>`) : '';
                return g + `<tr${x.ed ? ' class="nr62-ed"' : ''}><td>${E(x.no || k + 1)}</td><td>${x.alt ? '↳ ' : ''}${E(x.name)}${x.add ? ' <small class="nr62-new">yangi</small>' : ''}</td><td>${E(x.unit)}</td><td>${E(x.q)}${x.ed ? ' ✏️' : ''}</td></tr>`;
            }).join('');
            const last = (s.hist || []).slice(-1)[0];
            const bar = `<div class="nr62-bar" data-set="${E(s.id)}"><span>v${E(s.ver || 1)}${last ? ' · oxirgi oʻzgarish: ' + E(String(last.at || '').slice(0, 10)) + ' — ' + E(last.by || '') : ' · asl nusxa'}${s.off ? ' · ⏸ tekshiruvdan chiqarilgan' : ''}</span>`
                + (can ? `<button type="button" onclick="nrm62Edit('${E(s.id)}')">✏️ Tahrirlash (miqdor, yangi qator)</button><button type="button" onclick="nrm62New()">➕ Yangi norma (yangi tur)</button>` : '')
                + `<button type="button" onclick="nrmHist('${E(s.id)}')">📜 Tarix (${(s.hist || []).length})</button></div>`;
            return bar + `<table><thead><tr><th>№</th><th>Номланиши / Наименование</th><th>Бирлиги</th><th>Миқдори</th></tr></thead><tbody>${rows}</tbody></table>`;
        }
        // hujjat sahifasi — har ochilganda bazadagi joriy holat bilan
        if (typeof N62.gostDoc === 'function') N62.gostDoc = N62.agmkExtend('gostDoc', '6.2: norma hujjati — bazadan jonli', N62.gostDoc, (o: Function) => function (this: unknown, id: string) {
            const d = o.apply(this, arguments); const seed = nrm62Seed(id); if (!d || !seed) return d;
            try { const s = nrm62Live(seed), t = d.items.find((i: any) => i.t === 'table'); if (t) { const h = nrm62Table(s); t.uz = h; t.ru = h; } } catch (e) { console.error(e); }
            return d;
        });
        function nrm62Refresh() { try { if (N62.ND && /^nrm52_/.test(String(N62.ND.gid || '')) && N62.$id('ndBody') && typeof N62.gostRender === 'function') N62.gostRender(); } catch (e) { /* */ } }
        if (typeof N62.nrmSaveDB === 'function') N62.nrmSaveDB = N62.agmkExtend('nrmSaveDB', '6.2: saqlangach hujjat sahifasi yangilanadi', N62.nrmSaveDB, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); setTimeout(nrm62Refresh, 0); return r; });
        function nrm62Edit(id: string) { N62.nrmView(id); }
        function nrm62Hist(s: any, a: string) { const now = new Date().toISOString(); s.hist = (s.hist || []).concat([{ at: now, by: N62.authorStr(), a }]); s.ver = (s.ver || 1) + 1; s.upd = now; }
        async function nrm62Add(id: string) {
            if (!N62.nrmCanEdit()) return; const db = N62.nrmDB(), s = db.sets.find((z: any) => z.id === id); if (!s) return;
            const name = await N62.uiPrompt('Yangi qator — ehtiyot qism yoki material nomi (spravkadagidek yozing)', ''); if (!name || !String(name).trim()) return;
            const unit = await N62.uiPrompt('Oʻlchov birligi (shт, кг, м, л ...)', 'шт'); if (unit === null || unit === undefined) return;
            const q = await N62.uiPrompt('Meʼyor (miqdor). Bir nechta birlik boʻlsa «/» bilan: 8/0,39', ''); if (!q || !/\d/.test(String(q))) { if (q) alert('Miqdor raqam boʻlishi kerak'); return; }
            const groups = [...new Set((s.items || []).map((x: any) => x.grp).filter(Boolean))];
            const grp = await N62.uiPrompt('Boʻlim (guruh)' + (groups.length ? ': ' + groups.join(' / ') : '') + ' — boʻsh qoldirsangiz oxirgisi', groups.length ? groups[groups.length - 1] : ''); if (grp === null || grp === undefined) return;
            const why = await N62.uiPrompt('Sabab (buyruq raqami) — ixtiyoriy', '');
            const it = { no: '', name: String(name).trim(), unit: String(unit || '').trim(), q: String(q).trim(), grp: String(grp || '').trim() || (groups[groups.length - 1] || ''), ed: 1, add: 1 };
            // guruhning oxiriga qoʻyiladi
            let at = -1; (s.items || []).forEach((x: any, i: number) => { if (x.grp === it.grp) at = i; }); s.items = s.items || []; if (at >= 0) s.items.splice(at + 1, 0, it); else s.items.push(it);
            nrm62Hist(s, '➕ Yangi qator: «' + it.name + '» — ' + it.q + ' ' + it.unit + (why ? ' (' + why + ')' : ''));
            if (N62.nrmSaveDB(db)) { N62.showToast('✅ Qoʻshildi — tekshiruvda shu meʼyor ishlatiladi'); N62.nrmView(id); }
        }
        async function nrm62Del(id: string, i: number) {
            if (!N62.nrmCanEdit()) return; const db = N62.nrmDB(), s = db.sets.find((z: any) => z.id === id); if (!s || !s.items[i]) return; const x = s.items[i];
            if (!(await N62.uiConfirm('«' + x.name + '» (' + x.q + ' ' + x.unit + ') normadan olib tashlansinmi?\nTarixda qoladi.'))) return;
            const why = await N62.uiPrompt('Sabab (buyruq raqami) — ixtiyoriy', '');
            s.items.splice(i, 1); nrm62Hist(s, '🗑 Olib tashlandi: «' + x.name + '» — ' + x.q + ' ' + x.unit + (why ? ' (' + why + ')' : ''));
            if (N62.nrmSaveDB(db)) { N62.showToast('✅ Olib tashlandi'); N62.nrmView(id); }
        }
        async function nrm62New() {
            if (!N62.nrmCanEdit()) return; const K = N62.NRM_KIND || {}, R = N62.NRM_RT || {};
            const kinds = Object.keys(K).filter(k => k).map(k => k + ' = ' + K[k]).join(', ');
            const kind = await N62.uiPrompt('Turi (kod yoki yangi tur nomi).\nMavjud: ' + kinds, '105'); if (kind === null || kind === undefined || !String(kind).trim()) return;
            const rt = await N62.uiPrompt('Taʼmir turi: KR (kapital), DR (depo), TR (joriy/VRP), FORM, FULL, SHORT', 'KR'); if (!rt) return;
            const year = parseInt(String(await N62.uiPrompt('Yil (qaysi yil spravkalari shu norma bilan tekshiriladi)', String(new Date().getFullYear() + 1)) || ''), 10); if (!year) return;
            const kk = String(kind).trim(), title = await N62.uiPrompt('Normaning nomi (buyruq/tasdiqlangan hujjat nomi)', (K[kk] || kk) + ' — ' + (R[String(rt).toUpperCase()] || rt) + ' meʼyori ' + year); if (!title) return;
            const db = N62.nrmDB(), s: any = { id: 'nu62_' + Date.now(), title: String(title), kind: kk, rt: String(rt).toUpperCase().trim(), year, file: 'Ilovada yaratilgan', sheet: '', items: [], ver: 1, hist: [] };
            if (!K[kk]) { try { N62.NRM_KIND[kk] = kk; } catch (e) { /* */ } }
            nrm62Hist(s, '➕ Yangi norma yaratildi'); s.ver = 1; db.sets.push(s);
            if (N62.nrmSaveDB(db)) { N62.showToast('✅ Yangi norma yaratildi — endi qatorlarini qoʻshing'); N62.nrmView(s.id); }
        }
        // «Tasdiqlangan normalar» oynasi: qator qoʻshish / olib tashlash, yangi norma
        if (typeof N62.nrmView === 'function') N62.nrmView = N62.agmkExtend('nrmView', '6.2: qator qoʻshish / olib tashlash', N62.nrmView, (o: Function) => function (this: unknown, id: string) {
            const r = o.apply(this, arguments);
            try {
                if (!N62.nrmCanEdit()) return r; const m = document.getElementById('nrmModal'); if (!m) return r;
                m.querySelectorAll('.nr-it em[onclick]').forEach((em: any) => {
                    const mm = /nrmEditQ\('([^']+)',\s*(\d+)\)/.exec(em.getAttribute('onclick') || ''); if (!mm || em.parentElement.querySelector('.nr62-del')) return;
                    const b = document.createElement('button'); b.type = 'button'; b.className = 'nr62-del'; b.title = 'Olib tashlash'; b.textContent = '🗑';
                    b.setAttribute('onclick', `event.stopPropagation();nrm62Del('${mm[1]}',${mm[2]})`); em.parentElement.appendChild(b);
                });
                const bt = m.querySelector('.nv-btns'); if (bt && !bt.querySelector('.nr62-add')) bt.insertAdjacentHTML('afterbegin', `<button class="nr62-add" onclick="nrm62Add('${N62.escapeHtml(String(id))}')">➕ Yangi qator</button>`);
            } catch (e) { console.error(e); }
            return r;
        });
        if (typeof N62.nrmOpen === 'function') N62.nrmOpen = N62.agmkExtend('nrmOpen', '6.2: yangi norma tugmasi', N62.nrmOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const bt = document.querySelector('#nrmModal .nv-btns'); if (bt && N62.nrmCanEdit() && !bt.querySelector('.nr62-new-b')) bt.insertAdjacentHTML('afterbegin', '<button class="nr62-new-b" onclick="nrm62New()">➕ Yangi norma</button>'); } catch (e) { /* */ }
            return r;
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v62nrmCss';
            st.textContent = `.nr62-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 10px}.nr62-bar span{flex:1;min-width:200px;font-size:12px;color:#94a3b8}
            .nr62-bar button{padding:7px 12px;border-radius:10px;border:1px solid rgba(56,189,248,.5);background:rgba(14,165,233,.15);color:#e0f2fe;font-weight:700;cursor:pointer}
            tr.nr62-ed td{background:rgba(250,204,21,.08)}.nr62-new{color:#86efac;font-weight:700}
            .nr-it .nr62-del{margin-left:6px;border:none;background:transparent;cursor:pointer;font-size:14px;opacity:.75}.nr-it .nr62-del:hover{opacity:1}`;
            document.head.appendChild(st);
        })();
        Object.assign(N62, { nrm62Edit, nrm62Add, nrm62Del, nrm62New });
