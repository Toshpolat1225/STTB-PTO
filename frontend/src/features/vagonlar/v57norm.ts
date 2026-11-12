        // =====================================================================
        // 5.7 — Taʼmir grafigi: OYLIK NORMA (imkoniyat) boʻyicha (muallif videosi, 30.10.2026)
        //  Muammo: KR qoidasi «probeg ≥ 120k» yoqilganda meʼyordan oshgan YUZLAB vagon bitta oyga (joriy oy) KR ga tushardi.
        //  Haqiqatda oyiga 3–4 ta KR chiqariladi. Endi har oy uchun norma (KR va DR soni) beriladi:
        //   • oyda normadan ortiq vagon boʻlsa — eng zarurlari qoladi (eng koʻp yurgan / muddati eng oldin oʻtgan),
        //     qolganlari keyingi oyga koʻchadi (izoh: «norma toʻldi — oktyabrdan»), dekabrdan ortgani — keyingi yilga;
        //   • taʼmirda turgan va bajarilganlar ham normaga kiradi (joy band);
        //   • oʻtgan oylar oʻzgarmaydi; norma 0 — cheklanmagan.
        //  Standart: Vagon Xizmati (VX) — KR oyiga 4 ta, DR cheklanmagan. «📊 Oylik norma» oynasida oyma-oy oʻzgartiriladi.
        // =====================================================================
        const N57: any = window as any;
        var VG57_NORM = 'agmk_vg_norm';
        try { if (N57.KV_SYNC && Array.isArray(N57.KV_SYNC.keys) && !N57.KV_SYNC.keys.includes(VG57_NORM)) N57.KV_SYNC.keys.push(VG57_NORM); } catch (e) { /* */ }
        var VG57: any = { pl: 'VX' };
        const VG57_PL = ['VX', '2-TYS'];
        function vg57Def(): any { const z = () => Array(12).fill(0); return { VX: { KR: Array(12).fill(4), DR: z() }, '2-TYS': { KR: z(), DR: z() } }; }
        function vg57Norm(): any {
            const d = vg57Def(); let s: any = null; try { s = N57.kvGet(VG57_NORM, null); } catch (e) { s = null; }
            if (s) VG57_PL.forEach(p => ['KR', 'DR'].forEach(rt => { const a = s[p] && s[p][rt]; if (Array.isArray(a) && a.length === 12) d[p][rt] = a.map((x: any) => Math.max(0, Math.round(+x || 0))); }));
            return d;
        }
        function vg57Cap(pl: string, rt: string, m: string): number { const N = vg57Norm(); const a = N[pl] && N[pl][rt]; return a ? +a[+m.slice(5, 7) - 1] || 0 : 0; }
        function vg57Rt(key: string): string { return String(key || '').split('|')[2] === 'KR' ? 'KR' : 'DR'; }
        function vg57Fixed(x: any): boolean { return !!(x && (x.done || x.ghost || x.pin || (x.st && x.st !== 'late'))); }
        // qoʻlda oʻzgarishlar (barcha qurilmalarda bir xil): pin[№] = {m, rt, why, by, at}; del[№] = {m, rt, by, at}
        var VG57_ED = 'agmk_vg_edit';
        try { if (N57.KV_SYNC && Array.isArray(N57.KV_SYNC.keys) && !N57.KV_SYNC.keys.includes(VG57_ED)) N57.KV_SYNC.keys.push(VG57_ED); } catch (e) { /* */ }
        function vg57Ed(): any { let s: any = null; try { s = N57.kvGet(VG57_ED, null); } catch (e) { s = null; } return { pin: (s && s.pin) || {}, del: (s && s.del) || {} }; }
        function vg57EdPut(f: (E: any) => void, log: string): void {
            const E = vg57Ed(); f(E); N57.kvSet(VG57_ED, E);
            try { const L = N57.kvGet('agmk_vg_log', []) || []; L.push({ at: new Date().toISOString(), by: N57.vtWho ? N57.vtWho() : '', a: log }); N57.kvSet('agmk_vg_log', L.slice(-300)); } catch (e) { /* */ }
            try { N57.VG.stale = true; } catch (e) { /* */ }
        }
        function vg57Who(): string { try { return N57.vtWho(); } catch (e) { return ''; } }
        /** vagonni oyga qoʻlda qoʻyish (KR yoki DR) */
        function vg57Pin(no: any, m: string, rt: string, why?: string): string {
            const n = N57.pprNo(no); if (!n) return 'Vagon raqami notoʻgʻri';
            vg57EdPut(E => { E.pin[n] = { m: m, rt: rt, why: why || '', by: vg57Who(), at: new Date().toISOString() }; delete E.del[n]; }, '№' + n + ' → ' + N57.pprMName(m) + ' ' + rt + ' (qoʻlda)' + (why ? ': ' + why : ''));
            return '';
        }
        function vg57Del(no: any, m: string, rt: string): void { const n = N57.pprNo(no); vg57EdPut(E => { delete E.pin[n]; E.del[n] = { m: m, rt: rt, by: vg57Who(), at: new Date().toISOString() }; }, '№' + n + ' — ' + N57.pprMName(m) + ' ' + rt + ' dan olib tashlandi'); }
        function vg57Back(no: any): void { const n = N57.pprNo(no); vg57EdPut(E => { delete E.pin[n]; delete E.del[n]; }, '№' + n + ' — avtomatik rejaga qaytarildi'); }
        function vg57Mon(m: string): string { try { return N57.vtMonName(m); } catch (e) { return m; } }
        /** bitta yil grafigiga normani qoʻllash; carry — oldingi yildan oʻtgan vagonlar; qaytaradi — keyingi yilga oʻtadiganlar */
        function vg57Apply(d: any, carry: any[]): any[] {
            if (!d || !d.secs || !d.mon) return [];
            const y = +d.year, cur = N57.pprCurM(), out: any[] = [];
            const secOf = (key: string, place: string, title: string): number => {
                let i = d.secs.findIndex((s: any) => s.key === key); if (i >= 0) return i;
                d.secs.push({ place: place, key: key, kind: 'list', title: title, cells: Array.from({ length: 12 }, () => []) }); i = d.secs.length - 1;
                Object.keys(d.mon).forEach(m => { d.mon[m][i] = d.mon[m][i] || []; }); return i;
            };
            // oldingi yildan kelganlar — yanvarga (yoki joriy oyga, agar shu yil boʻlsa)
            const first = String(y) === cur.slice(0, 4) ? cur : y + '-01';
            const ED = vg57Ed(), pinNo = (x: any) => N57.pprNo(x.v);
            carry.forEach((c: any) => { const n = pinNo(c.x); if (ED.pin[n] || ED.del[n]) return; const si = secOf(c.key, c.place, c.title); d.mon[first] = d.mon[first] || {}; (d.mon[first][si] = d.mon[first][si] || []).push(c.x); });
            // qoʻlda oʻzgarishlar: 📌 qoʻlda qoʻyilgan (surish / qoʻshish / almashtirish) va 🗑 chetga olingan
            d.removed = [];
            const months = Object.keys(d.mon).filter(m => +m.slice(0, 4) === y);
            const strip = (n: string, rt?: string) => { let got: any = null; months.forEach(m => Object.keys(d.mon[m]).forEach((si: any) => { const s = d.secs[si]; if (!s) return; d.mon[m][si] = d.mon[m][si].filter((x: any) => { const hit = pinNo(x) === n && !vg57Fixed(x) && (!rt || vg57Rt(s.key) === rt); if (hit && !got) got = { x: x, s: s }; return !hit; }); })); return got; };
            Object.keys(ED.del).forEach(n => { const e = ED.del[n]; if (+String(e.m).slice(0, 4) !== y) return; const g = strip(n, e.rt); d.removed.push({ n: n, rt: e.rt, m: e.m, by: e.by, at: e.at, title: g ? g.s.title : '' }); });
            Object.keys(ED.pin).forEach(n => {
                const e = ED.pin[n]; if (+String(e.m).slice(0, 7).slice(0, 4) < y) return;
                const g = strip(n); if (+String(e.m).slice(0, 4) !== y) return;
                let ty = g ? String(g.s.key).split('|')[1] : '', pl = g ? g.s.place : '', vid: any = g ? g.x.vid : null, km = g ? g.x.km : 0;
                if (!ty) { try { const v = N57.onlyVagons().find((z: any) => N57.pprNo(N57.vagonNo(z)) === n); if (v) { ty = N57.vgType(v); pl = N57.vgPlace(v, ty); vid = v.id; km = typeof N57.pgKmOf === 'function' ? N57.pgKmOf(v) : 0; } } catch (er) { /* */ } }
                if (!ty) { ty = 'boshqa'; pl = 'VX'; }
                const key = pl + '|' + ty + '|' + e.rt, si = secOf(key, pl, N57.vgTitle ? N57.vgTitle(pl, ty, e.rt) : key);
                d.mon[e.m] = d.mon[e.m] || {}; (d.mon[e.m][si] = d.mon[e.m][si] || []).push({ v: g ? g.x.v : n, vid: vid, km: km, pin: 1, st: '', rule: 'qoʻlda', note: '📌 ' + (e.why || 'qoʻlda qoʻyildi') + (e.by ? ' · ' + e.by : '') });
            });
            d.norm = {};
            for (let k = 0; k < 12; k++) {
                const m = y + '-' + String(k + 1).padStart(2, '0'); if (m < cur) continue; const M = d.mon[m] || {}; d.norm[m] = {};
                VG57_PL.forEach(pl => ['KR', 'DR'].forEach(rt => {
                    const sis = d.secs.map((s: any, i: number) => [s, i]).filter((p: any) => p[0].place === pl && vg57Rt(p[0].key) === rt).map((p: any) => p[1]);
                    if (!sis.length) return;
                    const cap = vg57Cap(pl, rt, m); let fixed = 0; const plan: any[] = [];
                    sis.forEach((si: number) => (M[si] || []).forEach((x: any) => { if (vg57Fixed(x)) { if (!x.ghost) fixed++; } else plan.push({ si: si, x: x }); }));
                    d.norm[m][pl + '|' + rt] = { cap: cap, n: fixed + plan.length };
                    if (!cap || fixed + plan.length <= cap) return;
                    // eng zarurlari: muddati oʻtgan, keyin eng koʻp yurgan, keyin raqam
                    plan.sort((a: any, b: any) => (b.x.st === 'late' ? 1 : 0) - (a.x.st === 'late' ? 1 : 0) || (+b.x.km || 0) - (+a.x.km || 0) || String(a.x.v).localeCompare(String(b.x.v), undefined, { numeric: true }));
                    const keep = Math.max(0, cap - fixed), move = plan.slice(keep);
                    d.norm[m][pl + '|' + rt].n = fixed + keep; d.norm[m][pl + '|' + rt].moved = move.length;
                    move.forEach((p: any) => {
                        M[p.si] = M[p.si].filter((x: any) => x !== p.x);
                        const from = p.x.nFrom || m, x = Object.assign({}, p.x, { nFrom: from, st: '', note: 'norma toʻldi — ' + vg57Mon(from) + 'dan' });
                        if (k < 11) { const m2 = y + '-' + String(k + 2).padStart(2, '0'); d.mon[m2] = d.mon[m2] || {}; (d.mon[m2][p.si] = d.mon[m2][p.si] || []).push(x); }
                        else { const s = d.secs[p.si]; out.push({ key: s.key, place: s.place, title: s.title, x: x }); }
                    });
                }));
            }
            d.normNext = out.length;
            return out;
        }
        if (typeof N57.vgBuild === 'function') N57.vgBuild = N57.agmkExtend('vgBuild', '5.7: oylik norma (imkoniyat) boʻyicha', N57.vgBuild, (o: Function) => function (this: unknown, year: number) {
            const cy = +String(N57.pprCurM()).slice(0, 4);
            if (!(year >= cy)) return o.apply(this, arguments);
            let carry: any[] = [], d: any = null;
            for (let y = cy; y <= year && y <= cy + 5; y++) { d = o.call(this, y); carry = vg57Apply(d, carry); }
            return d;
        });
        // ---------- oyna: oylik norma ----------
        function vg57Open(pl?: string): void {
            if (pl) VG57.pl = pl; const N = vg57Norm(), p = VG57.pl, E = N57.escapeHtml, OY = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
            const row = (rt: string) => `<div class="vg57-r"><b>${rt === 'KR' ? '🔵 KR — kapital' : '🟢 DR — depo'}</b><label class="vg57-all">har oyga <input type="number" min="0" placeholder="—" onchange="vg57All('${rt}',this.value)"></label></div>
                <div class="vg57-g">${N[p][rt].map((v: number, i: number) => `<label><span>${E(OY[i])}</span><input type="number" min="0" value="${v || ''}" placeholder="∞" onchange="vg57Set('${rt}',${i},this.value)"></label>`).join('')}</div>`;
            N57.mdl('vg57M', `<div class="px-h"><b>📊 Oylik norma (imkoniyat)</b><button class="mini-btn" onclick="mdlClose('vg57M')">✕</button></div>
                <div class="bg-seg">${VG57_PL.map(x => `<button class="${x === p ? 'on' : ''}" onclick="vg57Open('${x}')">${x}</button>`).join('')}</div>
                <div class="nd-tip">Har oyda nechta vagon KR va DR dan chiqarila oladi. Normadan ortganlari — eng zarurlari qoladi (muddati oʻtgan, eng koʻp yurgan), qolganlari keyingi oyga koʻchadi. Boʻsh (∞) — cheklanmagan.</div>
                ${row('KR')}${row('DR')}
                <div class="nv-btns" style="margin-top:10px"><button onclick="vg57Save()">💾 Saqlash va grafikni yangilash</button></div>`, true);
        }
        function vg57Put(f: (N: any) => void): void { const N = vg57Norm(); f(N); N57.kvSet(VG57_NORM, N); }
        function vg57Set(rt: string, i: number, val: string): void { vg57Put(N => { N[VG57.pl][rt][i] = Math.max(0, Math.round(+val || 0)); }); }
        function vg57All(rt: string, val: string): void { vg57Put(N => { N[VG57.pl][rt] = Array(12).fill(Math.max(0, Math.round(+val || 0))); }); vg57Open(); }
        function vg57Save(): void { N57.mdlClose('vg57M'); try { N57.VG.stale = true; } catch (e) { /* */ } try { N57.showToast('💾 Oylik norma saqlandi'); } catch (e) { /* */ } try { if (N57.$id('pprModal')) N57.pprOpen(N57.PPRV.m); } catch (e) { /* */ } }
        function vg57Txt(): string {
            try {
                const d = N57.vgD(), m = N57.PPRV.m || N57.pprCurM(), pl = N57.PPRV.place || 'VX', I = (d && d.norm && d.norm[m]) || {};
                const s = (rt: string) => { const x = I[pl + '|' + rt], cap = vg57Cap(pl, rt, m); if (!x) return rt + ': ' + (cap ? '0/' + cap : '—'); return rt + ': ' + x.n + (cap ? '/' + cap : ' (cheklanmagan)') + (x.moved ? ' · ' + x.moved + ' ta keyingi oyga' : ''); };
                return '📊 Norma (' + vg57Mon(m) + ', ' + pl + ') — ' + s('KR') + ' · ' + s('DR') + (d && d.normNext && String(m).slice(0, 4) === String(d.year) ? ' · yil oxiridan ' + d.normNext + ' ta keyingi yilga' : '');
            } catch (e) { return ''; }
        }
        if (typeof N57.pprOpen === 'function') N57.pprOpen = N57.agmkExtend('pprOpen', '5.7: oylik norma tugmasi', N57.pprOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                if (!N57.VG || !N57.VG.on) return r; const c = document.querySelector('#pprModal .modal-content'), bar = c && c.querySelector('.vg-mode'); if (!bar) return r;
                if (!bar.querySelector('.vg57-btn')) bar.insertAdjacentHTML('beforeend', '<button class="vg52-btn vg57-btn" onclick="vg57Open()">📊 Oylik norma</button>');
                let t = c.querySelector('.vg57-sum'); if (!t) { const a = c.querySelector('.vg52-sum') || bar; a.insertAdjacentHTML('afterend', '<div class="nd-tip vg57-sum"></div>'); t = c.querySelector('.vg57-sum'); }
                if (t) t.innerHTML = N57.escapeHtml(vg57Txt()) + vg57Extra();
                c.querySelectorAll('.nd-tip').forEach((tp: any) => { if (/Vagonni bosing/.test(tp.textContent)) tp.innerHTML = 'Vagonni bosing — boshqa oyga qoʻyish (KR yoki DR), boshqa vagon bilan almashtirish yoki grafikdan olib tashlash. ➕ — vagon qoʻshish. Qoʻlda qoʻyilganlar 📌 bilan, normada joy egallaydi.'; else if (/Surish — pasportdagi sanani/.test(tp.innerHTML)) tp.innerHTML = tp.innerHTML.replace('Surish — pasportdagi sanani ham oʻzgartiradi.', 'Oyiga nechta vagon — «📊 Oylik norma».'); });
            } catch (e) { console.error(e); }
            return r;
        });
        (function () {
            const st = document.createElement('style');
            st.textContent = '.vg57-r{display:flex;align-items:center;justify-content:space-between;margin:12px 0 6px}.vg57-all input{width:70px;margin-left:6px}'
                + '.vg57-g{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.vg57-g label{display:flex;flex-direction:column;align-items:center;font-size:12px;gap:3px}'
                + '.vg57-st{display:inline-flex;align-items:center;gap:4px;margin:0 6px}.vg57-st button,.vg57-rm button{min-width:30px;padding:3px 8px;border-radius:8px;border:1px solid rgba(148,163,184,.45);background:rgba(2,6,23,.5);color:#f8fafc}.vg57-q,.vg57-rm{margin-top:6px}.vg57-ed{margin-top:10px}.vg57-row{display:flex;gap:6px}.vg57-row select{flex:1;padding:8px;border-radius:8px}#vg57why{width:100%;margin-top:6px;padding:8px;border-radius:8px;box-sizing:border-box}'
                + '.vg57-g input,.vg57-all input{padding:6px;border-radius:8px;border:1px solid rgba(148,163,184,.4);background:rgba(2,6,23,.5);color:#f8fafc;text-align:center;width:100%;box-sizing:border-box}';
            document.head.appendChild(st);
        })();

        // ---------- grafikda qoʻlda boshqarish: vagon oynasi, ➕ qoʻshish, norma ± ----------
        function vg57Ctx(si: number, j: number): any { try { const d = N57.vgD(), x = N57.pprList(d, N57.PPRV.m, si)[j], s = d.secs[si]; return x && s ? { d: d, x: x, s: s, rt: vg57Rt(s.key), n: N57.pprNo(x.v) } : null; } catch (e) { return null; } }
        if (typeof N57.vgItem === 'function') N57.vgItem = N57.agmkExtend('vgItem', '5.7: qoʻlda surish / almashtirish / olib tashlash (KR va DR)', N57.vgItem, (o: Function) => function (this: unknown, si: number, j: number) {
            const r = o.apply(this, arguments);
            try {
                const c = vg57Ctx(si, j), box = document.querySelector('#pprAct .modal-content'); if (!c || !box) return r;
                if (c.x.done || c.x.ghost) return r;
                // eski «surish» (faqat pasportdagi DR sanasi) oʻrniga — KR va DR uchun bir xil boshqaruv
                ['#vgTo', '#vgWhy'].forEach(q => { const e = box.querySelector(q); if (e) e.remove(); });
                box.querySelectorAll('.pp-lbl').forEach((e: any) => { if (/SURISH/.test(e.textContent)) e.remove(); });
                box.querySelectorAll('button').forEach((b: any) => { if (/vgMoveDo/.test(b.getAttribute('onclick') || '')) { const p = b.parentElement; b.remove(); if (p && !p.children.length) p.remove(); } });
                const E = N57.escapeHtml, opts: string[] = []; for (let k = -1; k <= 14; k++) { const m = N57.pprAddM(N57.pprCurM(), k); opts.push(`<option value="${m}" ${m === N57.PPRV.m ? 'selected' : ''}>${E(N57.pprMName(m))}</option>`); }
                const ed = vg57Ed(), pinned = !!ed.pin[c.n];
                box.insertAdjacentHTML('beforeend', `<div class="vg57-ed"><div class="pp-lbl">QOʻLDA OʻZGARTIRISH (${c.rt})</div>
                    <div class="vg57-row"><select id="vg57m">${opts.join('')}</select><select id="vg57rt"><option value="KR" ${c.rt === 'KR' ? 'selected' : ''}>KR</option><option value="DR" ${c.rt === 'DR' ? 'selected' : ''}>DR</option></select></div>
                    <input id="vg57why" placeholder="sabab (ixtiyoriy)">
                    <div class="nv-btns"><button onclick="vg57MoveDo('${E(c.n)}')">📅 Shu oyga qoʻyish</button><button onclick="vg57SwapDo('${E(c.n)}','${E(N57.PPRV.m)}','${c.rt}')">⇄ Boshqa vagon bilan almashtirish</button></div>
                    <div class="nv-btns"><button onclick="vg57DelDo('${E(c.n)}','${E(N57.PPRV.m)}','${c.rt}')">🗑 Grafikdan olib tashlash</button>${pinned ? `<button onclick="vg57BackDo('${E(c.n)}')">↩ Avtomatik rejaga qaytarish</button>` : ''}</div></div>`);
            } catch (e) { console.error(e); }
            return r;
        });
        function vg57Done(msg: string): void { try { N57.mdlClose('pprAct'); } catch (e) { /* */ } try { N57.showToast(msg); } catch (e) { /* */ } try { N57.pprOpen(N57.PPRV.m); } catch (e) { /* */ } }
        function vg57MoveDo(n: string): void { const m = (N57.$id('vg57m') || {}).value, rt = (N57.$id('vg57rt') || {}).value || 'KR', why = ((N57.$id('vg57why') || {}).value || '').trim(); if (!m) return; vg57Pin(n, m, rt, why || 'qoʻlda surildi'); vg57Done('📅 №' + n + ' → ' + N57.pprMName(m) + ' · ' + rt); }
        async function vg57SwapDo(n: string, m: string, rt: string): Promise<void> {
            let b: any = ''; try { b = await N57.uiPrompt('№' + n + ' oʻrniga qaysi vagon (raqam)? №' + n + ' esa oʻsha vagonning oʻrniga oʻtadi.', ''); } catch (e) { b = prompt('Qaysi vagon bilan almashtiriladi (raqam)?', ''); }
            const nb = N57.pprNo(b); if (!nb) return;
            // ikkinchi vagon grafikda qayerda turibdi (shu yil) — topilmasa, №n chetga olinadi
            let where: any = null; try { const d = N57.vgD(); Object.keys(d.mon).forEach((mm: string) => Object.keys(d.mon[mm]).forEach((si: any) => (d.mon[mm][si] || []).forEach((x: any) => { if (!where && N57.pprNo(x.v) === nb && !x.ghost && !x.done) where = { m: mm, rt: vg57Rt(d.secs[si].key) }; }))); } catch (e) { /* */ }
            vg57Pin(nb, m, rt, '№' + n + ' oʻrniga');
            if (where) vg57Pin(n, where.m, where.rt, '№' + nb + ' bilan almashtirildi'); else vg57Del(n, m, rt);
            vg57Done('⇄ №' + n + ' ↔ №' + nb);
        }
        async function vg57DelDo(n: string, m: string, rt: string): Promise<void> { let ok = true; try { ok = await N57.uiConfirm('№' + n + ' ' + N57.pprMName(m) + ' ' + rt + ' grafigidan olib tashlansinmi? Oʻrniga norma boʻyicha navbatdagi vagon tushadi (uni ham almashtirish mumkin).'); } catch (e) { ok = confirm('Olib tashlansinmi?'); } if (!ok) return; vg57Del(n, m, rt); vg57Done('🗑 №' + n + ' grafikdan olib tashlandi'); }
        function vg57BackDo(n: string): void { vg57Back(n); vg57Done('↩ №' + n + ' avtomatik rejaga qaytdi'); }
        if (typeof N57.pprAdd === 'function') N57.pprAdd = N57.agmkExtend('pprAdd', '5.7: qoʻshish — KR/DR boʻlimiga qoʻlda', N57.pprAdd, (o: Function) => function (this: unknown, si: number) {
            if (!N57.VG || !N57.VG.on) return o.apply(this, arguments);
            let s: any = null; try { s = N57.vgD().secs[si]; } catch (e) { s = null; } if (!s) return o.apply(this, arguments);
            const rt = vg57Rt(s.key), m = N57.PPRV.m;
            Promise.resolve(N57.uiPrompt('Qaysi vagon ' + N57.pprMName(m) + ' ' + rt + ' grafigiga qoʻshilsin (raqam)?', '')).then((v: any) => { const n = N57.pprNo(v); if (!n) return; vg57Pin(n, m, rt, 'grafikka qoʻshildi'); vg57Done('➕ №' + n + ' → ' + N57.pprMName(m) + ' · ' + rt); });
        });
        function vg57Step(rt: string, k: number): void { const m = N57.PPRV.m || N57.pprCurM(), pl = N57.PPRV.place || 'VX'; vg57Put(N => { const i = +m.slice(5, 7) - 1; N[pl][rt][i] = Math.max(0, (+N[pl][rt][i] || 0) + k); }); try { N57.VG.stale = true; } catch (e) { /* */ } try { N57.pprOpen(m); } catch (e) { /* */ } }
        function vg57Extra(): string {
            try {
                const d = N57.vgD(), m = N57.PPRV.m || N57.pprCurM(), pl = N57.PPRV.place || 'VX', E = N57.escapeHtml;
                const st = (rt: string) => `<span class="vg57-st">${rt}: <button onclick="vg57Step('${rt}',-1)">−</button><b>${vg57Cap(pl, rt, m) || '∞'}</b><button onclick="vg57Step('${rt}',1)">+</button></span>`;
                const R = (d && d.removed || []).filter((x: any) => x.m === m);
                return `<div class="vg57-q">Shu oy normasi (${E(pl)}): ${st('KR')} ${st('DR')}</div>` + (R.length ? `<div class="vg57-rm">🗑 Olib tashlanganlar: ${R.map((x: any) => `<button onclick="vg57BackDo('${E(x.n)}')" title="qaytarish">№${E(x.n)} ${x.rt} ↩</button>`).join(' ')}</div>` : '');
            } catch (e) { return ''; }
        }
        Object.assign(N57, { vg57Pin: vg57Pin, vg57Del: vg57Del, vg57Back: vg57Back, vg57Ed: vg57Ed, vg57MoveDo: vg57MoveDo, vg57SwapDo: vg57SwapDo, vg57DelDo: vg57DelDo, vg57BackDo: vg57BackDo, vg57Step: vg57Step });
        Object.assign(N57, { vg57Open: vg57Open, vg57Set: vg57Set, vg57All: vg57All, vg57Save: vg57Save, vg57Norm: vg57Norm, vg57Apply: vg57Apply });
