        // =====================================================================
        // 6.2 (141) — 🔒 HISOBOT TEKSHIRUVLARI AKKAUNT BOʻYICHA (muallif, 08.11.2026)
        //  Avval: tekshiruvlar tarixi faqat oʻsha qurilmada qolardi (planshetda tekshirilgani noutbukda koʻrinmasdi).
        //  Endi: har xodimning OʻZ tekshiruvlari shaxsiy kalitda («agmk_u_<tabel>_hisob») serverga sinxronlanadi —
        //  shu akkaunt bilan kirilgan barcha qurilmalarda koʻrinadi, boshqa akkauntlarga (administratorga ham) yuborilmaydi
        //  (server: app/core/permissions.py → kv_owner). Batafsil natija (JSON) serverga «faqat oʻzimga» fayl sifatida yoziladi
        //  va boshqa qurilmada birinchi ochilganda yuklab olinadi.
        // =====================================================================
        const OW2: any = window as any;
        function ow2Me(): string { try { const t = OW2.cleanTabel(OW2.meTabel()); return /^\d{1,12}$/.test(t) ? t : ''; } catch (e) { return ''; } }
        function ow2Key(): string { const t = ow2Me(); return t ? 'agmk_u_' + t + '_hisob' : ''; }
        function ow2Ensure(): void {
            try {
                if (!OW2.KV_SYNC || !Array.isArray(OW2.KV_SYNC.keys)) return;
                const k = ow2Key();
                OW2.KV_SYNC.keys = OW2.KV_SYNC.keys.filter((x: string) => !/^agmk_u_\d+_hisob$/.test(x) || x === k);
                if (k && OW2.KV_SYNC.keys.indexOf(k) < 0) OW2.KV_SYNC.keys.push(k);
            } catch (e) { /* */ }
        }
        function ow2Mine(L: any[]): any[] { const me = ow2Me(); return (L || []).filter((r: any) => r && (!r.byT || OW2.cleanTabel(r.byT) === me)); }
        var OW2_BUSY = false;
        // mahalliy roʻyxat oʻzgarsa — oʻz yozuvlarim shaxsiy kalitga (va batafsil natija serverga)
        function ow2Mirror(L: any[]): void {
            const k = ow2Key(); if (!k || OW2_BUSY) return;
            OW2_BUSY = true;
            try { OW2.kvSet(k, ow2Mine(L).slice(0, 300)); } finally { OW2_BUSY = false; }
            setTimeout(ow2Upload, 50);
        }
        async function ow2Upload(): Promise<void> {
            const k = ow2Key(), me = ow2Me(); if (!k || !me || typeof OW2.srvOn !== 'function' || !OW2.srvOn() || typeof OW2.srvRaw !== 'function') return;
            const L = OW2.kvGet(OW2.HS_CHK_KEY, []); let changed = false;
            for (const r of ow2Mine(L)) {
                if (!r.dref || r.srvD) continue;
                try {
                    const b = await OW2.mediaGetBlob(r.dref); if (!b) continue;
                    const res = await OW2.srvRaw('/api/files/v1?to=' + encodeURIComponent(me) + '&name=' + encodeURIComponent('tekshiruv_' + r.id + '.json') + '&mime=application%2Fjson', { method: 'POST', body: b });
                    const j = await res.json(); if (j && j.id) { r.srvD = j.id; changed = true; }
                } catch (e) { break; } // server yoʻq — keyingi safar
            }
            if (changed) OW2.kvSet(OW2.HS_CHK_KEY, L);
        }
        if (typeof OW2.kvSet === 'function') OW2.kvSet = OW2.agmkExtend('kvSet', '6.2: hisobot tekshiruvlari akkaunt boʻyicha', OW2.kvSet, (o: Function) => function (this: unknown, k: any, v: any) {
            const r = o.apply(this, arguments);
            if (k === OW2.HS_CHK_KEY && Array.isArray(v)) { try { ow2Mirror(v); } catch (e) { /* */ } }
            return r;
        });
        // serverdan kelgan shaxsiy roʻyxat — mahalliy roʻyxatga qoʻshiladi (id boʻyicha, yangisi ustun)
        if (typeof OW2.syncApply === 'function') OW2.syncApply = OW2.agmkExtend('syncApply', '6.2: shaxsiy tekshiruvlar', OW2.syncApply, (o: Function) => function (this: unknown, rec: any) {
            const r = o.apply(this, arguments);
            try {
                const k = ow2Key();
                if (k && rec && rec.kind === 'kv' && rec.data && rec.data.k === k && Array.isArray(rec.data.v)) {
                    const cur = OW2.kvGet(OW2.HS_CHK_KEY, []), by: any = {};
                    cur.forEach((x: any) => { if (x && x.id) by[x.id] = x; });
                    rec.data.v.forEach((x: any) => { if (x && x.id && (!by[x.id] || String(x.at || '') >= String(by[x.id].at || '') || (x.srvD && !by[x.id].srvD))) by[x.id] = Object.assign({}, by[x.id] || {}, x); });
                    const L = Object.keys(by).map(i => by[i]).sort((a: any, b: any) => String(b.at || '').localeCompare(String(a.at || ''))).slice(0, 300);
                    try { localStorage.setItem(OW2.HS_CHK_KEY, JSON.stringify(L)); } catch (e) { /* */ }
                }
            } catch (e) { /* */ }
            return r;
        });
        // boshqa qurilmada: batafsil natija bu yerda yoʻq boʻlsa — serverdan («faqat oʻzimga» fayl)
        if (typeof OW2.hsJsonGet === 'function') OW2.hsJsonGet = OW2.agmkExtend('hsJsonGet', '6.2: natija serverdan', OW2.hsJsonGet, (o: Function) => async function (this: unknown, ref: any) {
            const d = await o.apply(this, arguments); if (d) return d;
            try {
                const x = OW2.kvGet(OW2.HS_CHK_KEY, []).find((r: any) => r && r.dref === ref && r.srvD);
                if (!x || typeof OW2.srvFileGet !== 'function') return null;
                const b = await OW2.srvFileGet(x.srvD, 'application/json'); if (!b) return null;
                try { await OW2.mediaSave(ref, b, { id: ref, at: new Date().toISOString(), mime: 'application/json', size: b.size }); } catch (e) { /* */ }
                return JSON.parse(await b.text());
            } catch (e) { return null; }
        });
        window.addEventListener('agmk:login', () => { ow2Ensure(); try { ow2Mirror(OW2.kvGet(OW2.HS_CHK_KEY, [])); } catch (e) { /* */ } });
        setTimeout(ow2Ensure, 0);
