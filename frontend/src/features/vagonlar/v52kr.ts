        // =====================================================================
        // 5.2 — Taʼmir grafigi: KR va DR alohida, qoidani muallif tanlaydi (29.10.2026, docs/REJA_5.2.md 6-band)
        //  Avval: grafik hamma vagonni DR ga qoʻyardi (KR boʻlimlariga vagon tushmasdi).
        //  Endi KR uchun ham, DR uchun ham qoida tanlanadi (bir nechtasi birga):
        //   (a) probeg — oxirgi taʼmirdan beri km meʼyori (DR: 110 000, KR: 120 000 — tahrirlanadi)
        //   (b) muddat — oxirgi taʼmirdan beri N yil (DR: N boʻsh boʻlsa — pasportdagi «Keyingi taʼmir sanasi»)
        //   (c) reja roʻyxati — qoʻlda (maxsus oyna: oy → KR/DR → vagon raqamlari, roʻyxatdan, Excel dan)
        //   (d) qaysi biri birinchi kelsa — belgilanganlarning eng ertasi (oʻchiq boʻlsa: reja → muddat → probeg)
        //  KR muddati DR dan oldin yoki bir oyda boʻlsa — vagon faqat KR boʻlimida (DR ham shu taʼmirda bajariladi).
        //  Qoida va qoʻlda reja barcha qurilmalarda bir xil (sinxron kalitlar).
        // =====================================================================
        const K52: any = window as any;
        var VG52_RULE = 'agmk_vg_rule', VG52_PLAN = 'agmk_vg_plan';
        try { if (K52.KV_SYNC && Array.isArray(K52.KV_SYNC.keys)) [VG52_RULE, VG52_PLAN].forEach(k => { if (!K52.KV_SYNC.keys.includes(k)) K52.KV_SYNC.keys.push(k); }); } catch (e) { /* */ }
        var VG52: any = { rt: 'KR', pm: '', prt: 'KR', q: '' };
        const VG52_OPT: any[] = [['a', '🛤 Probeg boʻyicha', 'oxirgi taʼmirdan beri km meʼyorga yetsa'], ['b', '📅 Muddat (yil) boʻyicha', 'oxirgi taʼmirdan beri belgilangan yil oʻtsa'], ['c', '📝 Reja roʻyxati — qoʻlda', 'vagonlarni oyma-oy oʻzingiz kiritasiz (maxsus oyna)'], ['d', '⏱ Qaysi biri birinchi kelsa', 'belgilangan qoidalardan eng ertasi olinadi']];
        function vg52Def(): any { let dr = 110000; try { dr = +K52.pgCfg().drKm || 110000; } catch (e) { /* */ } return { DR: { a: 1, b: 1, c: 1, d: 1, km: dr, yr: 0 }, KR: { a: 0, b: 0, c: 1, d: 1, km: 120000, yr: 0 } }; }
        function vg52Rule(): any { const d = vg52Def(), s = K52.kvGet(VG52_RULE, null) || {}; ['DR', 'KR'].forEach(k => { d[k] = Object.assign(d[k], s[k] || {}); }); return d; }
        function vg52Plan(): any { return K52.kvGet(VG52_PLAN, null) || {}; }
        function vg52No(x: any): string { return String(x == null ? '' : x).trim().replace(/^0+(?=\d)/, ''); }
        function vg52M(iso: string): string { return String(iso || '').slice(0, 7); }
        function vg52AddY(iso: string, y: number): string { const d = new Date(String(iso).slice(0, 10) + 'T00:00:00'); if (isNaN(+d)) return ''; d.setMonth(d.getMonth() + Math.round(y * 12)); return d.toISOString().slice(0, 10); }
        function vg52Ming(km: number): string { return Math.round(km / 1000) + 'k'; }
        /** qoʻlda reja: shu vagon qaysi oyda (rt boʻyicha) */
        function vg52Manual(no: string, rt: string): string { const P = vg52Plan(), n = vg52No(no); let out = ''; Object.keys(P).sort().forEach(m => { const L = (P[m] && P[m][rt]) || []; if (L.some((x: any) => vg52No(x) === n)) out = out || m; }); return out; }
        /** bitta vagon uchun reja(lar): [{m, rt, note, rule, km}] */
        function vgPlans(v: any, base: any, Rov?: any): any[] {
            const R = Rov || vg52Rule(), raw = vg52M(v.keyingi), cur = base.cur || K52.pprCurM(), no = K52.vagonNo(v); let x: any = null;
            try { x = K52.pgCalc(v); } catch (e) { x = null; }
            const rate = x && x.rate > 0 ? x.rate : 0, now = Date.now();
            const kmDue = (kSince: any, norm: number) => { if (kSince == null || !rate || !(norm > 0)) return null; if (kSince >= norm) return { m: cur, over: true }; return { m: vg52M(new Date(now + (norm - kSince) / rate * 86400000).toISOString()), over: false }; };
            const pick = (rt: string): any => {
                const r = R[rt], C: any[] = [];
                if (r.c) { const m = vg52Manual(no, rt); if (m) C.push({ k: 'c', m: m, rule: rt + ' · reja', note: '📝 reja (qoʻlda)' }); }
                if (r.b) {
                    if (rt === 'DR') {
                        if (+r.yr > 0) { const lr = typeof K52.agmkLastRep === 'function' ? K52.agmkLastRep(v).d : (v.tamirSanasi || ''); const d = lr ? vg52AddY(lr, +r.yr) : ''; if (d) C.push({ k: 'b', m: vg52M(d), rule: 'DR · ' + r.yr + ' yil', note: '' }); }
                        else if (raw) C.push({ k: 'b', m: raw, rule: 'DR · muddat', note: base.own ? 'reja qoʻlda qoʻyilgan' : '' });
                    } else if (+r.yr > 0 && v.kr) { const d = vg52AddY(v.kr, +r.yr); if (d) C.push({ k: 'b', m: vg52M(d), rule: 'KR · ' + r.yr + ' yil', note: '' }); }
                }
                if (r.a) { const kS = x ? (rt === 'DR' ? x.kD : x.kK) : null, q = kmDue(kS, +r.km); if (q) C.push({ k: 'a', m: q.m < cur ? cur : q.m, rule: rt + ' · ' + vg52Ming(+r.km) + ' km', note: '🛤 probeg ' + vg52Ming(kS) + (q.over ? ' ≥ ' : ' → ') + vg52Ming(+r.km), km: kS }); }
                if (!C.length) return null;
                // qoʻlda surilgan DR (pasportdagi sana qoʻlda oʻzgartirilgan) — odam qarori saqlanadi
                if (rt === 'DR' && base.own) { const own = C.find(z => z.k === 'b'); if (own) return own; }
                if (r.d) return C.slice().sort((p: any, q: any) => String(p.m).localeCompare(String(q.m)))[0];
                return ['c', 'b', 'a'].map(k => C.find(z => z.k === k)).find(Boolean) || null;
            };
            const kr = pick('KR'), dr = pick('DR');
            if (kr && dr && kr.m <= dr.m) { kr.note = (kr.note ? kr.note + ' · ' : '') + 'DR ham shu taʼmirda'; return [Object.assign(kr, { rt: 'KR' })]; }
            const out: any[] = []; if (dr) out.push(Object.assign(dr, { rt: 'DR' })); if (kr) out.push(Object.assign(kr, { rt: 'KR' }));
            return out;
        }
        // ---------- qoida tanlash oynasi (tasdiqlovchi / stansiya tanlashdagi kabi roʻyxat) ----------
        function vg52Count(rt: string, k: string): number {
            try { const R = vg52Rule(), only: any = { DR: { a: 0, b: 0, c: 0, d: 0, km: R.DR.km, yr: R.DR.yr }, KR: { a: 0, b: 0, c: 0, d: 0, km: R.KR.km, yr: R.KR.yr } }; only[rt][k] = 1;
                const y = +String((K52.PPRV && K52.PPRV.m) || K52.pprCurM()).slice(0, 4); let n = 0;
                K52.onlyVagons().forEach((v: any) => { if (typeof K52.vtStage === 'function' && K52.vtStage(v)) return; const P = vgPlans(v, { cur: K52.pprCurM() }, only); if (P.some((p: any) => p.rt === rt && +String(p.m).slice(0, 4) === y)) n++; });
                return n; } catch (e) { return 0; }
        }
        function vg52Open(rt?: string): void {
            if (rt) VG52.rt = rt; const R = vg52Rule(), r = R[VG52.rt], E = K52.escapeHtml, y = String((K52.PPRV && K52.PPRV.m) || K52.pprCurM()).slice(0, 4);
            const opt = (o: any[]) => { const on = !!r[o[0]], n = o[0] === 'd' ? null : vg52Count(VG52.rt, o[0]);
                return `<div class="vg52-o${on ? ' on' : ''}" onclick="vg52Tog('${o[0]}')"><span class="vg52-ck">${on ? '✓' : ''}</span><div><b>${o[1]}</b><small>${E(o[2])}${n != null ? ` · ${y}-yilda <b>${n}</b> ta vagon` : ''}</small></div></div>`
                    + (o[0] === 'a' ? `<label class="kq-l vg52-in">${VG52.rt} km meʼyori<input type="number" id="vg52km" value="${E(String(r.km || ''))}" onchange="vg52Set('km',this.value)"></label>` : '')
                    + (o[0] === 'b' ? `<label class="kq-l vg52-in">Necha yil${VG52.rt === 'DR' ? ' (boʻsh — pasportdagi «Keyingi taʼmir sanasi»)' : ''}<input type="number" step="0.5" id="vg52yr" value="${+r.yr > 0 ? E(String(r.yr)) : ''}" placeholder="${VG52.rt === 'DR' ? 'pasportdagi sana' : 'masalan, 8'}" onchange="vg52Set('yr',this.value)"></label>` : '')
                    + (o[0] === 'c' ? `<button class="kq-add vg52-in" onclick="vg52POpen('${VG52.rt}')">📝 Reja roʻyxatini ochish (${vg52PCount(VG52.rt)} ta vagon)</button>` : ''); };
            K52.mdl('vg52M', `<div class="px-h"><b>⚙️ Taʼmir grafigi — qoida</b><button class="mini-btn" onclick="mdlClose('vg52M')">✕</button></div>
                <div class="bg-seg"><button class="${VG52.rt === 'KR' ? 'on' : ''}" onclick="vg52Open('KR')">🔵 KR — kapital taʼmir</button><button class="${VG52.rt === 'DR' ? 'on' : ''}" onclick="vg52Open('DR')">🟢 DR — depo taʼmiri</button></div>
                <div class="nd-tip">${VG52.rt} boʻlimiga vagon qaysi qoida bilan tushishini belgilang (bir nechtasi mumkin). KR muddati DR dan oldin kelsa — vagon faqat KR da boʻladi.</div>
                <div class="nv-btns"><button onclick="vg52All()">☑️ Barchasini tanlash</button><button onclick="vg52None()">☐ Hammasini olib tashlash</button></div>
                ${VG52_OPT.map(opt).join('')}
                <div class="nv-btns" style="margin-top:10px"><button onclick="vg52Save()">💾 Saqlash va grafikni yangilash</button></div>`, true);
        }
        function vg52Tog(k: string): void { const R = vg52Rule(); R[VG52.rt][k] = R[VG52.rt][k] ? 0 : 1; K52.kvSet(VG52_RULE, R); if (k === 'c' && R[VG52.rt].c) { vg52POpen(VG52.rt); return; } vg52Open(); }
        function vg52Set(f: string, val: string): void { const R = vg52Rule(), n = +val; R[VG52.rt][f] = isFinite(n) && n > 0 ? n : 0; K52.kvSet(VG52_RULE, R); vg52Open(); }
        function vg52All(): void { const R = vg52Rule(); ['a', 'b', 'c', 'd'].forEach(k => { R[VG52.rt][k] = 1; }); K52.kvSet(VG52_RULE, R); vg52Open(); }
        function vg52None(): void { const R = vg52Rule(); ['a', 'b', 'c', 'd'].forEach(k => { R[VG52.rt][k] = 0; }); K52.kvSet(VG52_RULE, R); vg52Open(); }
        function vg52Save(): void { K52.mdlClose('vg52M'); try { K52.VG.stale = true; } catch (e) { /* */ } try { K52.showToast('💾 Qoida saqlandi'); } catch (e) { /* */ } try { if (K52.$id('pprModal')) K52.pprOpen(K52.PPRV.m); } catch (e) { /* */ } }
        function vg52Txt(): string { const R = vg52Rule(), s = (rt: string) => { const r = R[rt], L: string[] = []; if (r.c) L.push('reja'); if (r.b) L.push(+r.yr > 0 ? r.yr + ' yil' : 'muddat'); if (r.a) L.push(vg52Ming(+r.km) + ' km'); return rt + ': ' + (L.length ? L.join(' + ') + (r.d && L.length > 1 ? ' (birinchi kelgani)' : '') : '— oʻchiq'); }; return s('KR') + ' · ' + s('DR'); }
        // ---------- (c) qoʻlda reja — maxsus oyna ----------
        function vg52PCount(rt: string): number { const P = vg52Plan(); return Object.keys(P).reduce((a, m) => a + (((P[m] || {})[rt]) || []).length, 0); }
        function vg52POpen(rt?: string): void {
            if (rt) VG52.prt = rt; if (!VG52.pm) VG52.pm = (K52.PPRV && K52.PPRV.m) || K52.pprCurM();
            const E = K52.escapeHtml, P = vg52Plan(), L: string[] = ((P[VG52.pm] || {})[VG52.prt]) || [], V = K52.onlyVagons();
            const nm = (no: string) => { const v = V.find((z: any) => vg52No(K52.vagonNo(z)) === vg52No(no)); return v ? String(v.type || '').replace(/^Dumpkar\s*/i, '') : '⚠️ pasportda yoʻq'; };
            K52.mdl('vg52P', `<div class="px-h"><b>📝 Reja roʻyxati — qoʻlda</b><button class="mini-btn" onclick="mdlClose('vg52P')">✕</button></div>
                <div class="bg-seg"><button class="${VG52.prt === 'KR' ? 'on' : ''}" onclick="vg52POpen('KR')">🔵 KR</button><button class="${VG52.prt === 'DR' ? 'on' : ''}" onclick="vg52POpen('DR')">🟢 DR</button></div>
                <label class="kq-l">Oy<input type="month" id="vg52pm" value="${E(VG52.pm)}" onchange="VG52.pm=this.value;vg52POpen()"></label>
                <div class="kq-h">${E(K52.pprMName(VG52.pm))} · ${VG52.prt} — ${L.length} ta vagon</div>
                <div class="vg52-chips">${L.map((no: string) => `<span class="vg52-chip">${E(no)} <small>${E(nm(no))}</small><button onclick="vg52PDel('${E(no)}')">✕</button></span>`).join('') || '<i>hali boʻsh</i>'}</div>
                <label class="kq-l">Vagon raqamlari (vergul, boʻsh joy yoki yangi qator bilan)<textarea id="vg52pt" rows="3" placeholder="00000604, 24602, 4422"></textarea></label>
                <div class="nv-btns"><button onclick="vg52PAdd()">➕ Qoʻshish</button><label class="kq-add" style="cursor:pointer;text-align:center">📊 Excel dan<input type="file" accept=".xls,.xlsx" style="display:none" onchange="vg52PXls(this)"></label></div>
                <input id="vg52pq" class="kq-q" placeholder="🔍 roʻyxatdan qidirish (raqam)" oninput="vg52PFind(this.value)" value="${E(VG52.q || '')}"><div id="vg52pf" class="vg52-chips"></div>
                <div class="nd-tip">Vagon bitta oyda turadi: boshqa oyga qoʻshsangiz — eski oyidan olinadi. Qoida oynasida «📝 Reja roʻyxati» belgilangan boʻlsa grafikka tushadi.</div>
                <div class="nv-btns"><button onclick="mdlClose('vg52P');vg52Save()">💾 Tayyor — grafikni yangilash</button></div>`, true);
            if (VG52.q) vg52PFind(VG52.q);
        }
        function vg52PPut(nos: string[]): number {
            const P = vg52Plan(), m = VG52.pm, rt = VG52.prt; let n = 0;
            nos.map(vg52No).filter(Boolean).forEach(no => {
                Object.keys(P).forEach(k => { if (P[k] && P[k][rt]) P[k][rt] = P[k][rt].filter((x: any) => vg52No(x) !== no); });
                P[m] = P[m] || {}; P[m][rt] = P[m][rt] || []; const v = K52.onlyVagons().find((z: any) => vg52No(K52.vagonNo(z)) === no); P[m][rt].push(v ? String(K52.vagonNo(v)) : no); n++;
            });
            K52.kvSet(VG52_PLAN, P); try { K52.VG.stale = true; } catch (e) { /* */ } return n;
        }
        function vg52PAdd(): void { const t = String((K52.$id('vg52pt') || {}).value || ''), L = t.split(/[\s,;]+/).filter((x: string) => /\d/.test(x)); if (!L.length) return; const n = vg52PPut(L); try { K52.showToast('➕ ' + n + ' ta vagon qoʻshildi'); } catch (e) { /* */ } vg52POpen(); }
        function vg52PDel(no: string): void { const P = vg52Plan(), L = ((P[VG52.pm] || {})[VG52.prt]) || []; P[VG52.pm][VG52.prt] = L.filter((x: any) => vg52No(x) !== vg52No(no)); K52.kvSet(VG52_PLAN, P); try { K52.VG.stale = true; } catch (e) { /* */ } vg52POpen(); }
        function vg52PFind(q: string): void {
            VG52.q = q; const box = K52.$id('vg52pf'); if (!box) return; const s = String(q || '').replace(/\D/g, ''), E = K52.escapeHtml;
            if (s.length < 2) { box.innerHTML = ''; return; }
            const L = K52.onlyVagons().filter((v: any) => String(K52.vagonNo(v)).includes(s) || vg52No(K52.vagonNo(v)).includes(s)).slice(0, 40);
            box.innerHTML = L.map((v: any) => `<span class="vg52-chip add" onclick="vg52PPut(['${E(String(K52.vagonNo(v)))}']);vg52POpen()">＋ ${E(String(K52.vagonNo(v)))} <small>${E(String(v.type || '').replace(/^Dumpkar\s*/i, ''))}</small></span>`).join('') || '<i>topilmadi</i>';
        }
        async function vg52PXls(inp: any): Promise<void> {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            try { void K52.XLSX; const u8 = new Uint8Array(await f.arrayBuffer()); let bs = ''; for (let i = 0; i < u8.length; i += 32768) bs += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + 32768)));
                const wb = K52.XLSX.read(bs, { type: 'binary' }), known = new Set(K52.onlyVagons().map((v: any) => vg52No(K52.vagonNo(v)))), got: string[] = [];
                wb.SheetNames.forEach((sn: string) => { (K52.XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '' }) as any[]).forEach((r: any[]) => r.forEach(c => { const t = String(c || '').trim(); if (/^\d{2,9}$/.test(t) && known.has(vg52No(t)) && !got.includes(vg52No(t))) got.push(vg52No(t)); })); });
                if (!got.length) { K52.alert('Faylda pasportdagi vagon raqamlari topilmadi.'); return; }
                if (!confirm(f.name + ': ' + got.length + ' ta vagon raqami topildi. ' + K52.pprMName(VG52.pm) + ' · ' + VG52.prt + ' rejasiga qoʻshilsinmi?')) return;
                const n = vg52PPut(got); try { K52.showToast('📊 ' + n + ' ta vagon qoʻshildi'); } catch (e) { /* */ } vg52POpen();
            } catch (e) { console.error(e); K52.alert('⚠️ Excel oʻqilmadi: ' + String((e as any) && (e as any).message || e)); }
        }
        // ---------- grafik oynasiga: qoida tugmalari va har vagon yonida qoida ----------
        if (typeof K52.pprOpen === 'function') K52.pprOpen = K52.agmkExtend('pprOpen', '5.2: KR/DR qoidasi', K52.pprOpen, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                if (!K52.VG || !K52.VG.on) return r; const c = document.querySelector('#pprModal .modal-content'), bar = c && c.querySelector('.vg-mode'); if (!bar) return r;
                if (!bar.querySelector('.vg52-btn')) bar.insertAdjacentHTML('beforeend', '<button class="vg52-btn" onclick="vg52Open()">⚙️ KR / DR qoidasi</button><button class="vg52-btn" onclick="vg52POpen()">📝 Reja (qoʻlda)</button>');
                let t = c.querySelector('.vg52-sum'); if (!t) { bar.insertAdjacentHTML('afterend', '<div class="nd-tip vg52-sum"></div>'); t = c.querySelector('.vg52-sum'); }
                if (t) t.innerHTML = '⚙️ Qoida — ' + K52.escapeHtml(vg52Txt());
                const d = K52.vgD();
                c.querySelectorAll('.pp-c').forEach((ch: any) => { const m = String(ch.getAttribute('onclick') || '').match(/\((\d+),\s*(\d+)\)/); if (!m) return; const x = K52.pprList(d, K52.PPRV.m, +m[1])[+m[2]]; if (x && x.rule && !ch.querySelector('.vg52-r')) ch.insertAdjacentHTML('beforeend', '<small class="vg52-r">' + K52.escapeHtml(x.rule) + '</small>'); });
            } catch (e) { console.error(e); }
            return r;
        });
        (function () {
            const st = document.createElement('style');
            st.textContent = '.vg52-o{display:flex;gap:10px;align-items:center;padding:10px;margin:6px 0;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(2,6,23,.35);cursor:pointer}'
                + '.vg52-o.on{border-color:#22c55e;background:rgba(34,197,94,.12)}.vg52-o b{display:block}.vg52-o small{opacity:.85}'
                + '.vg52-ck{flex:0 0 26px;height:26px;border-radius:8px;border:2px solid #64748b;display:flex;align-items:center;justify-content:center;font-weight:800;color:#22c55e}.vg52-o.on .vg52-ck{border-color:#22c55e}'
                + '.vg52-in{margin:0 0 6px 36px}.vg52-sum{margin:4px 0}.vg52-r{display:block;font-size:10.5px;opacity:.8;color:#93c5fd}'
                + '.vg52-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.vg52-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 8px;border-radius:999px;border:1px solid #334155;background:#0f172a;font-size:13px}'
                + '.vg52-chip small{opacity:.7}.vg52-chip button{border:0;background:none;color:#fca5a5;cursor:pointer}.vg52-chip.add{cursor:pointer;border-color:#0ea5e9}';
            document.head.appendChild(st);
        })();
        Object.assign(K52, { VG52: VG52, vgPlans: vgPlans, vg52Open: vg52Open, vg52Tog: vg52Tog, vg52Set: vg52Set, vg52All: vg52All, vg52None: vg52None, vg52Save: vg52Save, vg52POpen: vg52POpen, vg52PAdd: vg52PAdd, vg52PDel: vg52PDel, vg52PFind: vg52PFind, vg52PXls: vg52PXls, vg52PPut: vg52PPut, vg52Rule: vg52Rule, vg52Txt: vg52Txt });
