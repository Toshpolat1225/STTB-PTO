        // =====================================================================
        // 6.2 (141) — ✍️ IMZOLANGAN HUJJAT OFLAYNDA HAM OCHILADI (muallif, 08.11.2026)
        //  Avval: server oʻchsa, «Imzolash» roʻyxati koʻrinardi, lekin hujjatning oʻzi ochilmasdi (har safar serverdan olinardi).
        //  Endi: hujjat server bilan ochilganda (matn, imzolar va imzo rasmlari bilan) shu qurilmada, shu akkaunt uchun saqlanadi.
        //  Server boʻlmasa — saqlangan nusxa «📴 Oflayn nusxa» belgisi bilan FAQAT OʻQISH uchun ochiladi:
        //  imzolash, rad etish, bekor qilish tugmalari yashiriladi (imzo faqat serverda tasdiqlanadi). Yaxlitlik (SHA-256) baribir tekshiriladi.
        //  Saqlash: IndexedDB (mediaSave), id «mt:sigdoc:<tabel>:<hujjat>» — «mt:» oldi qoʻshimchasi rasmlarni tozalashdan himoyalangan.
        //  Har akkaunt faqat oʻz nusxalarini koʻradi; eng koʻpi SO2_MAX ta (eskilari oʻchiriladi).
        // =====================================================================
        const SO2: any = window as any;
        var SO2_MAX = 300, SO2_IDX = 'agmk_sigoff_idx';
        function so2Me(): string { try { return SO2.cleanTabel(SO2.sigMe() || SO2.meTabel()) || '0'; } catch (e) { return '0'; } }
        function so2Ref(id: string): string { return 'mt:sigdoc:' + so2Me() + ':' + id; }
        function so2Idx(): any { try { return JSON.parse(localStorage.getItem(SO2_IDX + '_' + so2Me()) || '{}') || {}; } catch (e) { return {}; } }
        function so2IdxSet(o: any): void { try { localStorage.setItem(SO2_IDX + '_' + so2Me(), JSON.stringify(o)); } catch (e) { /* */ } }
        async function so2Save(d: any): Promise<void> {
            if (!d || !d.id || typeof SO2.mediaSave !== 'function') return;
            const ref = so2Ref(d.id), at = new Date().toISOString();
            const blob = new Blob([JSON.stringify(d)], { type: 'application/json' });
            await SO2.mediaSave(ref, blob, { id: ref, at: at, name: 'sigdoc.json', type: 'application/json', size: blob.size });
            const I = so2Idx(); I[d.id] = { at: at, title: d.title || '', status: d.status || '' };
            const ids = Object.keys(I).sort((a, b) => String(I[b].at).localeCompare(String(I[a].at)));
            for (const old of ids.slice(SO2_MAX)) { delete I[old]; try { await SO2.mediaDelete(so2Ref(old)); } catch (e) { /* */ } }
            so2IdxSet(I);
        }
        async function so2Load(id: string): Promise<any> {
            if (typeof SO2.mediaGetBlob !== 'function') return null;
            const b = await SO2.mediaGetBlob(so2Ref(id)); if (!b) return null;
            try { const d = JSON.parse(await b.text()); d._offline = so2Idx()[id] ? so2Idx()[id].at : true; return d; } catch (e) { return null; }
        }
        function so2DocPath(p: any): string { const m = /^\/api\/sign\/v1\/docs\/([A-Za-z0-9_-]+)$/.exec(String(p || '')); return m ? m[1] : ''; }
        // Hujjatni olish: server bilan — saqlab qoʻyiladi; serversiz — saqlangan nusxa
        if (typeof SO2.sigApi === 'function') SO2.sigApi = SO2.agmkExtend('sigApi', '6.2: imzolangan hujjat oflayn nusxasi', SO2.sigApi, (o: Function) => async function (this: unknown, path: any, method: any) {
            const id = (!method || method === 'GET') ? so2DocPath(path) : '';
            if (!id) return o.apply(this, arguments);
            try {
                const d = await o.apply(this, arguments);
                if (d && d.id) { try { await so2Save(d); } catch (e) { console.warn('sigoff', e); } }
                return d;
            } catch (e) {
                const c = await so2Load(id);
                if (c) return c;
                throw e;
            }
        });
        // Oflayn nusxa: belgi qoʻyiladi, amal tugmalari yashiriladi
        function so2Mark(): void {
            const d = SO2.SIG && SO2.SIG.cur, box = SO2.$id && SO2.$id('sgDoc'); if (!d || !d._offline || !box) return;
            if (!box.querySelector('.so2-off')) {
                const at = typeof d._offline === 'string' ? d._offline : '', w = document.createElement('div');
                w.className = 'hp-warn so2-off';
                w.textContent = '📴 Oflayn nusxa' + (at ? ' (' + SO2.fmtDT(at) + ' holati)' : '') + ' — faqat koʻrish uchun. Imzolash, rad etish va yangi holat — server ulanganda.';
                const h = box.querySelector('.px-h'); if (h && h.parentNode) h.parentNode.insertBefore(w, h.nextSibling); else box.prepend(w);
            }
            box.querySelectorAll('.pk-btns button').forEach((b: any) => { if (/Imzolash|Tanishdim|Rad etish|Bekor qilish/.test(b.textContent || '')) b.style.display = 'none'; });
        }
        if (typeof SO2.sigOpenDoc === 'function') SO2.sigOpenDoc = SO2.agmkExtend('sigOpenDoc', '6.2: oflayn nusxa belgisi', SO2.sigOpenDoc, (o: Function) => async function (this: unknown) {
            const r = await o.apply(this, arguments);
            try { so2Mark(); } catch (e) { /* */ }
            return r;
        });
        // Roʻyxatda (serversiz): saqlangan nusxasi bor hujjat bosilganda ochiladi va 📴 belgisi bilan koʻrsatiladi.
        // Roʻyxat qatorida hujjat raqami yoʻq (v3.7) — nom boʻyicha moslanadi; bir xil nomlilar roʻyxat tartibida.
        function so2ListFix(): void {
            if (SO2.sigSrv()) return;
            const I = so2Idx(), box = SO2.$id('sgList'); if (!box) return;
            let L: any[] = []; try { L = JSON.parse(localStorage.getItem('agmk_sig_cache_' + (SO2.meTabel() || '0')) || '[]') || []; } catch (e) { L = []; }
            const used: any = {};
            box.querySelectorAll('.sg-doc').forEach((el: any) => {
                const t = ((el.querySelector('b') || {}).textContent || '').trim();
                const d = L.find((x: any) => I[x.id] && !used[x.id] && String(x.title || '').trim() === t); if (!d) return;
                used[d.id] = 1; el.removeAttribute('onclick'); el.onclick = () => SO2.sigOpenDoc(d.id);
                if (!el.querySelector('.so2-b')) { const s = document.createElement('span'); s.className = 'so2-b'; s.textContent = ' 📴'; s.title = 'Oflayn nusxa — koʻrish mumkin'; (el.querySelector('b') || el).appendChild(s); }
            });
        }
        if (typeof SO2.sigOpenList === 'function') SO2.sigOpenList = SO2.agmkExtend('sigOpenList', '6.2: oflayn nusxalarni ochish', SO2.sigOpenList, (o: Function) => async function (this: unknown) {
            const r = await o.apply(this, arguments);
            try { so2ListFix(); } catch (e) { /* */ }
            return r;
        });
