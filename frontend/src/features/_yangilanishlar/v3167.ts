        // =====================================================================
        // v3.16.7 — boʻlimlar bir-biriga bogʻlandi
        //  OYLIK: 01.05.2026 dan 15% oshdi — okladlar korxona serverida (xodimlar.json), ishchilar tarif stavkasi ilovada
        //    (iqtisodchi yoki administrator telefonida bir marta, avtomatik: may oyidan yangi stavka)
        //  XODIMLAR ↔ STRUKTURA
        //    • Yangi xodim («Ishchi xodimlar» → ➕) lavozimi boʻyicha strukturadagi oʻz oʻrnida paydo boʻladi
        //      (shtatda bunday kasb boʻlmasa — sexda yangi kasb sifatida ochiladi); lavozimi tahrirlansa — oʻrni ham oʻzgaradi
        //    • Strukturada boʻsh oʻringa «➕ Yangi xodim qabul qilish» — «Ishchi xodimlar»dagi aynan oʻsha anketa
        //    • Strukturadan xodimni oʻchirish — u hamma joydan (roʻyxat, pasport, struktura) oʻchadi
        //  VAGON TAʼMIRI ↔ PASPORT ↔ GRAFIK
        //    • Rejali taʼmir (DR / KR) → pasport sanasi va grafikdagi «bajarildi» — avvaldan bor (k15, integ, defekt vedomost);
        //      shu versiyada sinov bilan tasdiqlandi
        //    • Nosozlik tufayli taʼmir: sababi majburiy, pasportda «🛠 Nosozliklar tarixi» (sana, sabab, uchastka, chiqqan kuni);
        //      rejali grafik oʻzgarmaydi (keyingi rejali taʼmir sanasi surilmaydi)
        //  BOʻLIMLAR KOʻRINISHI: administrator telefoni bosh sahifa boʻlimlari roʻyxatini serverga beradi —
        //    boshqaruv paneli xodimni tasdiqlashda shu roʻyxatdan qaysi boʻlimlarni koʻrishini tanlaydi
        // =====================================================================

        const V7: any = window as any;
        var V7_RAISE_FROM = '2026-05-01', V7_RAISE = 1.15;

        // ---------- 1) tarif stavkalari +15% (01.05.2026 dan) ----------
        function v7TarFix(): void {
            try {
                if (typeof V7.narCanEdit !== 'function' || !V7.narCanEdit() || typeof V7.narDB !== 'function') return;
                if (localStorage.getItem('agmk_v7_tar') === '1') return;
                const db = JSON.parse(JSON.stringify(V7.narDB(), (k, v) => k === 'toks' ? undefined : v));
                const T: any[] = (db.tariffs || []).slice().sort((a: any, b: any) => String(a.from).localeCompare(String(b.from)));
                if (!T.length) return; // tariflar hali kiritilmagan — keyinroq yana tekshiriladi
                const pre = T.filter(t => t.from < V7_RAISE_FROM).pop();
                if (!pre) { localStorage.setItem('agmk_v7_tar', '1'); return; }
                const same = (t: any) => Object.keys(pre.r).every(k => !t.r[k] || Math.abs(+t.r[k] - +pre.r[k]) < 0.011);
                const up = () => { const r: Record<string, number> = {}; Object.keys(pre.r).forEach(k => { r[k] = V7.narR(+pre.r[k] * V7_RAISE, 2); }); return r; };
                const post = T.filter(t => t.from >= V7_RAISE_FROM); let n = 0;
                if (!post.length) { db.tariffs.push({ from: V7_RAISE_FROM, r: up(), by: 'Avtomatik: oylik 01.05.2026 dan 15% oshdi', at: new Date().toISOString() }); n++; }
                else post.forEach(t => { if (same(t)) { const x = db.tariffs.find((z: any) => z.from === t.from); if (x) { x.r = up(); x.by = 'Avtomatik: oylik 01.05.2026 dan 15% oshdi'; x.at = new Date().toISOString(); n++; } } });
                if (n) {
                    db.tariffs.sort((a: any, b: any) => String(a.from).localeCompare(String(b.from)));
                    db.log = (db.log || []).concat([{ at: new Date().toISOString(), by: V7.authorStr(), a: 'Tarif stavkalari 01.05.2026 dan 15% oshirildi (5-razryad ' + V7.narF(pre.r['5']) + ' → ' + V7.narF(V7.narR(+pre.r['5'] * V7_RAISE, 2)) + ')' }]).slice(-300);
                    V7.narSaveDB(db); V7.showToast('💵 Tarif stavkalari 01.05.2026 dan 15% oshirildi');
                }
                localStorage.setItem('agmk_v7_tar', '1');
            } catch (e) { console.error('v3.16.7 tarif', e); }
        }

        // ---------- 2) xodimlar ↔ struktura ----------
        function v7UnitOfKey(key: string): any { const T: any = shtatTree as any; return T && T.units ? T.units.find((u: any) => u.key === key) || null : null; }
        /** Xodimni lavozimi boʻyicha strukturadagi oʻringa qoʻyadi (yoʻq boʻlsa — sexda yangi kasb ochiladi) */
        function v7AutoPlace(it: any): boolean {
            const T: any = shtatTree as any; if (!it || !T || !T.pos) return false;
            const r = V7.allXodims().find((z: any) => z.item === it); if (!r) return false;
            const u = v7UnitOfKey(r.su) || v7UnitOfKey(it.seh); if (!u) return false;
            const lv = V7.normTxt(it.lavozim || ''); if (!lv || lv === '—') return false;
            const cur = it.posNo ? (posByNo as any)(it.posNo) : null;
            if (cur && cur.u === u.id && V7.normTxt(cur.name) === lv) return false; // oʻz oʻrnida
            const L = T.pos.filter((p: any) => p.u === u.id && V7.normTxt(p.name) === lv);
            let p = L.find((x: any) => (V7.stAt(x.no) || []).length < (Number(x.cnt) || 0)) || L[0] || null, created = false;
            if (!p) { p = { no: T.pos.reduce((m: number, x: any) => Math.max(m, x.no), 0) + 1, name: it.lavozim, cnt: 1, cat: 'ishchi', u: u.id, g: null }; T.pos.push(p); created = true; }
            V7.stPlace(r, p);
            if (created || V7.stAt(p.no).length > (Number(p.cnt) || 0) && p.cat === 'ishchi') { p.cnt = Math.max(Number(p.cnt) || 0, V7.stAt(p.no).length); }
            try { V7.stTreeSave(); } catch (e) { }
            return true;
        }
        if (typeof V7.saveNewItem === 'function') V7.saveNewItem = V7.agmkExtend('saveNewItem', 'v3.16.7: yangi xodim strukturada', V7.saveNewItem, (o: Function) => async function (this: unknown, ...a: unknown[]) {
            const isX = currentSectionType === 'xodim', t = isX ? V7.cleanTabel(((V7.$id('ai-tabel') || {}) as HTMLInputElement).value) : '';
            const r = await o.apply(this, a);
            try { if (isX && t) { const it = V7.xodimByTabel(t); if (it && v7AutoPlace(it)) { V7.saveDB(false); try { V7.xtRender(); } catch (e) { } } } } catch (e) { console.error('v3.16.7 joylash', e); }
            return r;
        });
        if (typeof V7.saveXodimEdit === 'function') V7.saveXodimEdit = V7.agmkExtend('saveXodimEdit', 'v3.16.7: lavozim oʻzgarsa strukturadagi oʻrni ham', V7.saveXodimEdit, (o: Function) => async function (this: unknown, ...a: unknown[]) {
            const it = V7.getActiveItem(); const r = await o.apply(this, a);
            try { if (it && v7AutoPlace(it)) V7.saveDB(false); } catch (e) { console.error('v3.16.7 tahrir', e); }
            return r;
        });
        /** Strukturadagi boʻsh oʻringa — «Ishchi xodimlar»dagi aynan oʻsha anketa */
        function v7Hire(no: number): void {
            const p = (posByNo as any)(no); if (!p || !V7.stEdit()) return;
            V7.mdlClose('stMdl'); currentSectionType = 'xodim'; currentSubUnit = (unitById as any)(p.u).key;
            V7.openAddItemModal(); (XT as any).addPos = p;
            const c = V7.$id('aiCombo'), f = V7.$id('aiPosFixed'); if (c) c.classList.add('hidden');
            if (f) { f.classList.remove('hidden'); f.innerHTML = '№' + p.no + '. ' + V7.escapeHtml(p.name) + '<small>' + V7.escapeHtml(V7.posPath(p, false)) + '</small>'; }
            const lv = V7.$id('ai-lavozim'), ls = V7.$id('aiLavozimSearch'); if (lv) lv.value = p.name; if (ls) ls.value = p.name;
        }
        async function v7StDel(id: string): Promise<void> {
            if (!V7.stEdit()) return; const r = V7.stFind(id); if (!r) return;
            if (!(await V7.uiConfirm('«' + r.item.name + '» roʻyxatdan butunlay oʻchirilsinmi?\nU «Ishchi xodimlar», pasport va strukturadan oʻchadi. Ishdan boʻshagan boʻlsa — shu yoʻl.'))) return;
            (sectionItemsDB.xodim as any)[r.su] = ((sectionItemsDB.xodim as any)[r.su] || []).filter((x: any) => x !== r.item);
            V7.mdlClose('stMdl'); V7.stSaved('Oʻchirildi: ' + r.item.name);
        }
        if (typeof V7.stVacant === 'function') V7.stVacant = V7.agmkExtend('stVacant', 'v3.16.7: bir xil anketa', V7.stVacant, (o: Function) => function (this: unknown, no: number) {
            const r = o.call(this, no);
            try {
                const nf = document.querySelector('#stMdl .st-nf'); if (nf && V7.stEdit()) {
                    nf.outerHTML = `<button class="action-btn" onclick="v7Hire(${Number(no)})">➕ Yangi xodim qabul qilish (toʻliq anketa)</button>`;
                }
            } catch (e) { }
            return r;
        });
        if (typeof V7.stPerson === 'function') V7.stPerson = V7.agmkExtend('stPerson', 'v3.16.7: strukturadan oʻchirish', V7.stPerson, (o: Function) => function (this: unknown, id: string) {
            const r = o.call(this, id);
            try { const b = document.querySelector('#stMdl .st-btns'); if (b && V7.stEdit() && !b.querySelector('.v7-del')) b.insertAdjacentHTML('beforeend', `<button class="v7-del" style="color:#fca5a5" onclick="v7StDel('${V7.escapeHtml(String(id))}')">🗑 Roʻyxatdan oʻchirish</button>`); } catch (e) { }
            return r;
        });

        // ---------- 3) vagon taʼmiri ↔ pasport ↔ grafik ----------
        var V7P: { a: any; vid: unknown; noMove: boolean } = { a: null, vid: null, noMove: false };
        if (typeof V7.polAskDone === 'function') V7.polAskDone = V7.agmkExtend('polAskDone', 'v3.16.7: nosozlik sababi majburiy', V7.polAskDone, (o: Function) => function (this: unknown, ok: unknown) {
            const A = V7.POL && V7.POL.ask;
            if (ok && A && A.rt === 'NS' && !String(A.why || '').trim()) { alert('Nosozlik sababini yozing (masalan: gʻildirak yeyilgan, tormoz ishlamaydi).'); try { const i = V7.$id('polAskWhy'); if (i) i.focus(); } catch (e) { } return; }
            return o.call(this, ok);
        });
        if (typeof V7.polAskRepair === 'function') V7.polAskRepair = V7.agmkExtend('polAskRepair', 'v3.16.7: sabab saqlanadi', V7.polAskRepair, (o: Function) => async function (this: unknown, v: any) {
            const a = await o.call(this, v); V7P.a = a; V7P.vid = v ? v.id : null; V7P.noMove = !!(a && a.rt && a.rt !== 'DR' && a.rt !== 'KR'); return a;
        });
        if (typeof V7.pprMove === 'function') V7.pprMove = V7.agmkExtend('pprMove', 'v3.16.7: nosozlik grafikni surmaydi', V7.pprMove, (o: Function) => function (this: unknown, ...a: unknown[]) {
            if (V7P.noMove && /nosozlik/.test(String(a[3] || ''))) return 'nosozlik — rejali grafik oʻzgarmaydi';
            return o.apply(this, a);
        });
        if (typeof V7.markVagonAsTamirda === 'function') V7.markVagonAsTamirda = V7.agmkExtend('markVagonAsTamirda', 'v3.16.7: nosozlik sababi pasportda', V7.markVagonAsTamirda, (o: Function) => async function (this: unknown, ...x: unknown[]) {
            V7P.a = null; V7P.noMove = false; let r: unknown;
            try { r = await o.apply(this, x); } finally { V7P.noMove = false; }
            try {
                const A = V7P.a, v = ((vagonlarData as any) || []).find((z: any) => z.id === V7P.vid);
                if (A && v && v.status === 'Tamirda') {
                    const why = String(A.why || '').trim();
                    if (why && v.history && v.history[0] && v.history[0].ev === 'in' && v.history[0].type.indexOf('sabab:') < 0) { v.history[0].type += ' — sabab: ' + why; v.history[0].why = why; }
                    if (v.pol) v.pol.why = why;
                    if (A.rt === 'NS' || A.rt === 'TR') { v.nosoz = v.nosoz || []; v.nosoz.unshift({ d: V7.todayISO(), rt: A.rt, why: why, uch: A.uch || '', by: V7.authorStr() }); v.nosoz = v.nosoz.slice(0, 100); }
                    V7.saveDB();
                }
            } catch (e) { console.error('v3.16.7 nosozlik', e); }
            V7P.a = null; return r;
        });
        if (typeof V7.polRelease === 'function') V7.polRelease = V7.agmkExtend('polRelease', 'v3.16.7: nosozlikdan chiqqan kun', V7.polRelease, (o: Function) => async function (this: unknown, vid: unknown) {
            const v = ((vagonlarData as any) || []).find((x: any) => String(x.id) === String(vid)), rt = v && v.pol ? v.pol.rt : '', since = v && v.pol ? v.pol.since : '', why = v && v.pol ? v.pol.why : '';
            const ok = await o.call(this, vid);
            try {
                if (ok && v) {
                    const d = V7.todayISO(); let ch = false;
                    if ((rt === 'NS' || rt === 'TR') && v.nosoz && v.nosoz[0] && !v.nosoz[0].out && v.nosoz[0].d === since) { v.nosoz[0].out = d; ch = true; }
                    else if ((rt === 'NS' || rt === 'TR') && since) { v.nosoz = v.nosoz || []; v.nosoz.unshift({ d: since, rt: rt, why: why || '', uch: '', out: d, by: V7.authorStr() }); ch = true; }
                    if (ch) { V7.saveDB(); try { V7.filterVagonlar(); } catch (e) { } }
                }
            } catch (e) { console.error('v3.16.7 chiqish', e); }
            return ok;
        });
        // Pasportda nosozliklar tarixi
        if (typeof V7.openPassport === 'function') V7.openPassport = V7.agmkExtend('openPassport', 'v3.16.7: nosozliklar tarixi', V7.openPassport, (o: Function) => function (this: unknown, id: unknown) {
            const r = o.call(this, id);
            try {
                const v = ((vagonlarData as any) || []).find((x: any) => String(x.id) === String(id)), box = V7.$id('p-extra'); if (!v || !box) return r;
                const old = document.getElementById('v7-nosoz'); if (old) old.remove();
                const L: any[] = v.nosoz || []; if (!L.length) return r;
                const E = V7.escapeHtml;
                box.insertAdjacentHTML('afterend', `<div id="v7-nosoz" class="passport-container" style="margin-top:10px"><div style="font-weight:700;margin-bottom:6px">🛠 Nosozliklar tarixi (${L.length})</div>${L.slice(0, 20).map(x => `<div class="mm-card bad"><b>${E(V7.fmtISO(x.d))} — ${x.rt === 'TR' ? 'Joriy taʼmir' : 'Nosozlik'}</b><small>Sabab: ${E(x.why || 'koʻrsatilmagan')}${x.uch ? ' · ' + E(x.uch) : ''}</small><small>${x.out ? '✅ Taʼmirdan chiqdi: ' + E(V7.fmtISO(x.out)) : '🔧 Hozir taʼmirda'}</small></div>`).join('')}<div class="nd-tip">Nosozlik tufayli taʼmir rejali taʼmir grafigini oʻzgartirmaydi.</div></div>`);
            } catch (e) { console.error('v3.16.7 pasport', e); }
            return r;
        });

        // ---------- 4) bosh sahifa boʻlimlari roʻyxati — boshqaruv paneli uchun (administrator telefonidan) ----------
        try { if (V7.KV_SYNC && !V7.KV_SYNC.keys.includes('agmk_home_list')) V7.KV_SYNC.keys.push('agmk_home_list'); } catch (e) { }
        let v7HomeSent = '';  // 4.2: xotiradagi oxirgi yuborilgan roʻyxat — localStorage toʻlib qolsa ham har 20 soniyada qayta saqlanmasin
        function v7HomeList(): void {
            try {
                if (typeof V7.isAdminReal !== 'function' || !V7.isAdminReal() || typeof V7.homeCards !== 'function') return;
                const L = V7.homeCards().map((c: Element) => { const id = V7.homeId(c), lb = V7.homeLabel(c); return { id: id, t: lb.t, ic: lb.ic, lock: V7.homeLocked(id) ? 1 : 0 }; }).filter((x: any) => x.t);
                if (!L.length) return; const cur = V7.kvGet('agmk_home_list', null), sL = JSON.stringify(L);
                if (sL === v7HomeSent) return;
                const cl = cur && (cur.l || (cur.v && cur.v.l));
                if (cl && JSON.stringify(cl) === sL) { v7HomeSent = sL; return; }
                V7.kvSet('agmk_home_list', { l: L, at: new Date().toISOString() }); v7HomeSent = sL;
            } catch (e) { console.error('v3.16.7 boʻlimlar', e); }
        }
        try { V7.SEC_EV.fns.push(function v7Tick() { v7TarFix(); v7HomeList(); }); } catch (e) { }
        try { window.addEventListener('agmk:login', () => setTimeout(() => { v7TarFix(); v7HomeList(); }, 4000)); } catch (e) { }
