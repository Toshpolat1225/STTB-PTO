        // =====================================================================
        // 6.2 (141) — 📁 QABUL: rasm siqish, takroriy schyot-faktura, narx farqi, hujjatlar toʻliqligi
        //  (muallif, 07–08.11.2026; Husan takliflari):
        //   1) Rasmlar siqiladi: 0.6 MB dan katta rasm — eng uzun tomoni 1920 px, JPEG 80% (server diski 10 GB). Asl oʻlcham saqlanmaydi.
        //   2) Takroriy schyot-faktura: shu yetkazib beruvchining shu raqamli schyot-fakturasi boshqa dalolatnomada boʻlsa — saqlashdan oldin soʻraladi.
        //   3) Narx farqi: mahsulot narxi oldingi dalolatnomalardagi oʻrtachadan 30% dan koʻp farq qilsa — ogohlantirish (saqlashda va papkada).
        //   4) Hujjatlar toʻliqligi: papkada schyot-faktura, sertifikat, foto bormi — roʻyxatda 🟢 / 🟡 / 🔴 belgisi.
        // =====================================================================
        const QX: any = window as any;
        var QX_MAXB = 600 * 1024, QX_PX = 1920, QX_Q = 0.8, QX_DEV = 0.3;
        function qxN(x: any): number { const v = parseFloat(String(x == null ? '' : x).replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : 0; }
        function qxKey(s: any): string { return String(s || '').toLowerCase().replace(/[«»"'ʻʼ`‘’]/g, '').replace(/\s+/g, ' ').trim(); }
        // ---------- 1) rasm siqish ----------
        async function qxShrink(f: any): Promise<any> {
            if (!f || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type || '') || f.size <= QX_MAXB || typeof createImageBitmap !== 'function') return f;
            try {
                const bm = await createImageBitmap(f), k = Math.min(1, QX_PX / Math.max(bm.width, bm.height));
                const c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
                const g = c.getContext('2d'); if (!g) return f; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bm, 0, 0, c.width, c.height);
                const b: Blob | null = await new Promise(res => c.toBlob(res, 'image/jpeg', QX_Q));
                if (!b || b.size >= f.size) return f;
                const nm = String(f.name || 'rasm').replace(/\.[a-z0-9]+$/i, '') + '.jpg';
                return new File([b], nm, { type: 'image/jpeg', lastModified: Date.now() });
            } catch (e) { return f; }
        }
        if (typeof QX.qbAddFiles === 'function') QX.qbAddFiles = QX.agmkExtend('qbAddFiles', '6.2: rasmlar siqiladi', QX.qbAddFiles, (o: Function) => async function (this: unknown, id: any, files: any[], kind: any, keepOpen: any) {
            const out: any[] = []; let saved = 0;
            for (const f of (files || [])) { const g = await qxShrink(f); if (g !== f) saved += f.size - g.size; out.push(g); }
            const r = await o.call(this, id, out, kind, keepOpen);
            if (saved > 0) { try { QX.showToast('🗜 Rasmlar siqildi: ' + (saved / 1048576).toFixed(1) + ' MB tejaldi'); } catch (e) { /* */ } }
            return r;
        });
        // ---------- 2) takroriy schyot-faktura · 3) narx farqi ----------
        function qxDupSf(d: any): any {
            const sf = qxKey(d.sf), sup = qxKey(d.supplier); if (!sf) return null;
            return QX.qbS().all().find((x: any) => x.id !== d.id && qxKey(x.sf) === sf && (!sup || !qxKey(x.supplier) || qxKey(x.supplier) === sup)) || null;
        }
        function qxAvg(name: any, exceptId: any): number {
            const k = qxKey(name); let s = 0, n = 0;
            QX.qbS().all().forEach((x: any) => { if (x.id === exceptId) return; (x.items || []).forEach((it: any) => { const p = qxN(it.price); if (p > 0 && qxKey(it.n) === k) { s += p; n++; } }); });
            return n ? s / n : 0;
        }
        function qxPriceOff(d: any): any[] {
            const out: any[] = [];
            (d.items || []).forEach((it: any) => { const p = qxN(it.price), a = qxAvg(it.n, d.id); if (p > 0 && a > 0 && Math.abs(p - a) / a > QX_DEV) out.push({ n: it.n, p: p, a: a, r: (p - a) / a }); });
            return out;
        }
        function qxPct(r: number): string { return (r > 0 ? '+' : '') + Math.round(r * 100) + '%'; }
        var QX_OK: any = null; // foydalanuvchi «baribir saqlash» degan dalolatnoma
        if (typeof QX.qbEditSave === 'function') QX.qbEditSave = QX.agmkExtend('qbEditSave', '6.2: takroriy SF va narx farqi', QX.qbEditSave, (o: Function) => function (this: unknown) {
            const d = QX.QBE; if (!d || QX_OK === d) { QX_OK = null; return o.apply(this, arguments); }
            const msgs: string[] = [], dup = qxDupSf(d), off = qxPriceOff(d);
            if (dup) msgs.push('🧾 Schyot-faktura № ' + d.sf + ' avval ' + dup.no + ' (' + QX.fmtISO(dup.sana || '') + ') dalolatnomasida qabul qilingan.');
            off.slice(0, 5).forEach((x: any) => msgs.push('💰 «' + x.n + '»: narx ' + Math.round(x.p).toLocaleString('ru-RU') + ' — oldingi oʻrtacha ' + Math.round(x.a).toLocaleString('ru-RU') + ' (' + qxPct(x.r) + ')'));
            if (!msgs.length) return o.apply(this, arguments);
            const self = this, args = arguments;
            Promise.resolve(QX.uiConfirm('Tekshirib koʻring:\n\n' + msgs.join('\n') + '\n\nBaribir saqlansinmi?')).then((yes: any) => { if (yes) { QX_OK = d; o.apply(self, args); } });
        });
        // ---------- 4) hujjatlar toʻliqligi ----------
        function qxFull(d: any): any {
            const k: any = {}; (d.files || []).forEach((f: any) => { k[f.kind] = 1; });
            const need = [['sf', 'schyot-faktura'], ['cert', 'sertifikat'], ['foto', 'foto']], miss = need.filter(x => !k[x[0]]).map(x => x[1]);
            return { lvl: !miss.length ? 'g' : miss.length === need.length ? 'r' : 'y', miss: miss };
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = '.qx-l{margin-left:6px;font-size:13px}.qx-warn{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(245,158,11,.14);border:1px solid rgba(245,158,11,.45);font-size:13px}';
            document.head.appendChild(st);
        })();
        if (typeof QX.qbDraw === 'function') QX.qbDraw = QX.agmkExtend('qbDraw', '6.2: hujjatlar toʻliqligi', QX.qbDraw, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const S = QX.qbS();
                document.querySelectorAll('#screen-qb .qb-row').forEach((el: any) => {
                    const m = /qbView\('([^']+)'\)/.exec(el.getAttribute('onclick') || ''); const d = m && S.get(m[1]); if (!d || el.querySelector('.qx-l')) return;
                    const f = qxFull(d), s = document.createElement('span'); s.className = 'qx-l';
                    s.textContent = f.lvl === 'g' ? '🟢' : f.lvl === 'y' ? '🟡' : '🔴'; s.title = f.miss.length ? 'Yetishmaydi: ' + f.miss.join(', ') : 'Hujjatlar toʻliq';
                    const b = el.querySelector('.qb-no b'); if (b) b.appendChild(s);
                });
            } catch (e) { /* */ }
            return r;
        });
        if (typeof QX.qbView === 'function') QX.qbView = QX.agmkExtend('qbView', '6.2: papkada ogohlantirishlar', QX.qbView, (o: Function) => async function (this: unknown, id: any) {
            const r = await o.apply(this, arguments);
            try {
                const d = QX.qbS().get(id), box = QX.$id('qbV'); if (!d || !box || box.querySelector('.qx-warn')) return r;
                const f = qxFull(d), off = qxPriceOff(d), dup = qxDupSf(d), L: string[] = [];
                if (f.miss.length) L.push((f.lvl === 'r' ? '🔴' : '🟡') + ' Papkada yetishmaydi: ' + f.miss.join(', '));
                if (dup) L.push('🧾 Shu schyot-faktura ' + dup.no + ' dalolatnomasida ham bor');
                off.slice(0, 5).forEach((x: any) => L.push('💰 «' + x.n + '»: oldingi oʻrtachadan ' + qxPct(x.r)));
                if (L.length) { const w = document.createElement('div'); w.className = 'qx-warn'; w.innerHTML = L.map(x => QX.escapeHtml(x)).join('<br>'); const h = box.querySelector('.px-h'); if (h && h.parentNode) h.parentNode.insertBefore(w, h.nextSibling); }
            } catch (e) { /* */ }
            return r;
        });
