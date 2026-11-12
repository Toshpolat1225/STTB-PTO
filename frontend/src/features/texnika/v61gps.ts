        // =====================================================================
        // 6.1 — 11-band (muallif 08:19 video: Mashinistlar → Jonli xarita, temir yoʻl demosi)
        //  a) Demo juda tez yurardi (har soniyada 10 soniyalik yoʻl). Endi tezlik tanlovi: ⏸ · 0,5× · 1× · 2× · 3×
        //     (1× — haqiqiy tezlik, standart); tanlov shu qurilmada eslab qolinadi. Avtotraktor demosiga ham tegishli.
        //  b) Lokomotiv yaqinlashtirilganda (zoom ≥ 16) uning vagonlari tartib boʻyicha orqasidan, yoʻl boʻylab egilib koʻrinadi
        //     (har vagon raqami bilan, bosilsa — pasport); uzoqdan — «🚃 N vagon» belgisi. Har demo lokomotivga parkdagi
        //     taʼmirda boʻlmagan 6–13 ta vagon beriladi (faqat koʻrinish — bazaga hech narsa yozilmaydi).
        //  c) Juda yaqinlashtirilganda sputnik xaritasi kulrang («Map data not yet available») boʻlib qolmaydi —
        //     oxirgi mavjud rasm kattalashtirib koʻrsatiladi (maxNativeZoom 17).
        // =====================================================================
        const G61: any = window as any;
        var G61S: any = { key: 'agmk_lv_demo_spd', lay: null };
        function g61Spd(): number { try { const v = parseFloat(localStorage.getItem(G61S.key) || '1'); return [0, 0.5, 1, 2, 3].indexOf(v) >= 0 ? v : 1; } catch (e) { return 1; } }
        function g61SetSpd(v: number): void { try { localStorage.setItem(G61S.key, String(v)); } catch (e) { /* */ } g61Bar(); }
        // a) jonli qadam: 6.0 gacha har soniyada lvDemoStep(10) chaqirilardi — endi tanlangan tezlik × 1 soniya
        if (typeof G61.lvDemoStep === 'function') {
            const _st = G61.lvDemoStep;
            G61.lvDemoStep = function (this: unknown, dt: number) { if (dt === 10) { const k = g61Spd(); if (!k) return; dt = k; } return _st.call(this, dt); };
        }
        function g61BarHtml(): string {
            const k = g61Spd(), b = (v: number, t: string) => `<button type="button" class="${k === v ? 'on' : ''}" onclick="g61SetSpd(${v})">${t}</button>`;
            return `<div class="g61-spd"><span>Tezlik:</span>${b(0, '⏸')}${b(0.5, '0,5×')}${b(1, '1×')}${b(2, '2×')}${b(3, '3×')}</div>`;
        }
        function g61Bar(): void {
            try { document.querySelectorAll('.lv-demo').forEach((d: any) => { const old = d.querySelector('.g61-spd'); const h = g61BarHtml(); if (old) old.outerHTML = h; else d.insertAdjacentHTML('beforeend', h); }); } catch (e) { /* */ }
        }
        if (typeof G61.lvList === 'function') G61.lvList = G61.agmkExtend('lvList', '6.1: demo tezligi', G61.lvList, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); g61Bar(); return r; });

        // b) demo lokomotiv vagonlari
        function g61Assign(): void {
            const D = G61.LVD; if (!D || !D.on || D.park !== 'rail' || !Array.isArray(D.items)) return;
            const all: any[] = (typeof vagonlarData !== 'undefined' && vagonlarData) || [];
            const used = new Set<any>(); D.items.forEach((d: any) => (d.g61v || []).forEach((id: any) => used.add(id)));
            const free = all.filter((v: any) => v && !v.kind && !used.has(v.id) && !(typeof G61.hrInRepair === 'function' && G61.hrInRepair(v)));
            let fi = 0;
            D.items.forEach((d: any) => {
                if (d.g61v || !d.v || d.v.kind !== 'lok') return;
                const n = 6 + (d.i * 5) % 8, L: any[] = []; for (let j = 0; j < n && fi < free.length; j++) L.push(free[fi++].id); d.g61v = L;
            });
        }
        // yoʻl boʻyicha orqaga — eski nuqtadan boshgacha (oxirgisi — lokomotiv)
        function g61Path(d: any): any[] {
            const L = G61.L; if (!L || !d.route || !d.cum) return [];
            const s = Math.max(0, Math.min(d.len, d.f * d.len)), back = 700, out: any[] = [];
            if (d.dir >= 0) { for (let i = 0; i < d.cum.length; i++) { if (d.cum[i] >= s) break; if (d.cum[i] >= s - back) out.push(L.latLng(d.route[i][0], d.route[i][1])); } }
            else { for (let i = d.cum.length - 1; i >= 0; i--) { if (d.cum[i] <= s) break; if (d.cum[i] <= s + back) out.push(L.latLng(d.route[i][0], d.route[i][1])); } }
            if (d.pos) out.push(L.latLng(d.pos.lat, d.pos.lon));
            return out;
        }
        function g61Tails(): void {
            try {
                try { g61Assign(); } catch (e) { /* */ }
                const m = G61.LV && G61.LV.map, L = G61.L; if (!m || !L) return;
                if (!G61S.lay || G61S.lay._map !== m) { G61S.lay = L.layerGroup().addTo(m); }
                G61S.lay.clearLayers();
                const D = G61.LVD; if (!D || !D.on || D.park !== 'rail' || typeof G61.xkDrawTail !== 'function') return;
                g61Assign();
                D.items.forEach((d: any) => { if (!d.g61v || !d.g61v.length) return; const p = g61Path(d); if (p.length < 2) return;
                    G61.xkDrawTail(G61S.lay, { id: 'demo' + d.i, vagonIds: d.g61v, lokId: d.v && d.v.id }, p, m); });
                G61S.lay.eachLayer((l: any) => { try { const el = l.getElement && l.getElement(); const bd = el && el.querySelector('.xk-vbadge'); if (bd) bd.removeAttribute('onclick'); } catch (e) { /* */ } });
            } catch (e) { console.error('6.1 demo vagonlari', e); }
        }
        if (typeof G61.lvDraw === 'function') { const _dr = G61.lvDraw; G61.lvDraw = function (this: unknown) { const r = _dr.apply(this, arguments); g61Tails(); return r; }; }
        (function () { const hook = () => { const m = G61.LV && G61.LV.map; if (m && !m._g61) { m._g61 = 1; m.on('zoomend', g61Tails); } }; setInterval(hook, 2500); })();
        if (typeof G61.lvDemoStop === 'function') { const _sp = G61.lvDemoStop; G61.lvDemoStop = function (this: unknown) { const r = _sp.apply(this, arguments); try { if (G61S.lay) G61S.lay.clearLayers(); } catch (e) { /* */ } return r; }; }

        // c) sputnik: oxirgi mavjud rasm kattalashtiriladi (Olmaliq atrofida Esri rasmi ~17-masshtabgacha)
        if (typeof G61.lvMapSet === 'function') {
            G61.lvMapSet = function (t: string): void {
                const LVM = G61.LVM, LV = G61.LV, L = G61.L;
                try { localStorage.setItem(LVM.key, t); } catch (e) { /* */ } const m = LV && LV.map; if (!m) return;
                LVM.base.forEach((l: any) => { try { m.removeLayer(l); } catch (e) { /* */ } }); LVM.base = [];
                const ES = 'agmk-tile://esri/', add = (u: string, o: any) => { const l = L.tileLayer(u, Object.assign({ maxZoom: 20, maxNativeZoom: 19 }, o)); l.addTo(m); try { l.bringToBack(); } catch (e) { /* */ } LVM.base.push(l); return l; };
                if (t === 'sxema') add('agmk-tile://osm/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
                else {
                    if (!m.getPane('lvLbl')) { m.createPane('lvLbl'); m.getPane('lvLbl').style.zIndex = 340; m.getPane('lvLbl').style.pointerEvents = 'none'; }
                    if (t === 'gibrid') { add(ES + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { pane: 'lvLbl', maxNativeZoom: 17 }); add(ES + 'Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', { pane: 'lvLbl', opacity: 0.9, maxNativeZoom: 17 }); }
                    add(ES + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri, Maxar, Earthstar', maxNativeZoom: 17 });
                }
                document.querySelectorAll('.lv-mt button').forEach((b: any) => b.classList.toggle('on', b.dataset.t === t));
            };
        }
        (function () {
            const st = document.createElement('style'); st.id = 'v61gpsCss';
            st.textContent = `.lv-demo{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
            .g61-spd{display:flex;align-items:center;gap:4px;flex:1 1 100%;margin-top:4px}
            .g61-spd span{font-size:12px;color:#fde68a;margin-right:2px}
            .g61-spd button{min-width:44px;height:32px;padding:0 8px;border-radius:10px;border:1px solid rgba(251,191,36,.45);background:rgba(15,23,42,.7);color:#fde68a;font-weight:700;font-size:13px;cursor:pointer}
            .g61-spd button.on{background:#f59e0b;color:#111827;border-color:#f59e0b}`;
            document.head.appendChild(st);
        })();
        Object.assign(G61, { g61SetSpd: g61SetSpd, g61Spd: g61Spd, g61Tails: g61Tails });
