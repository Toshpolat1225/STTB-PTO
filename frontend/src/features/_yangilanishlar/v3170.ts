        // =====================================================================
        // v3.17.0 — sinovdagi kamchiliklar (docs/KAMCHILIKLAR.md, 1–18) va yagona qoida
        //  • Oynalar: har ochilgan oyna eng ustida (hujjat roʻyxat orqasida qolib ketmaydi) — 5, 10
        //  • Imzolash: majburiy navbat yoʻq (tartib faqat koʻrsatish uchun) — 15; roʻyxat hujjatdagi kabi,
        //    rahbariyat tepada, quyi lavozimlar pastda, raqam pastdan yuqoriga — 16; «B» dizayn (navbat chizigʻi) — 3;
        //    3 bosqich: ✓ Yuborildi · ✓✓ Tanishdi · ✍️ Imzoladi — 11; uzun nomlar — 1, 2, 6
        //  • Hujjat koʻruvchisi (kattalashtirish, sahifama-sahifa) — 7; elektron tasdiq jurnali faqat ilovada — 9
        //  • YAGONA QOIDA: ilova qayerda fayl tayyorlamasin — ⬇️ Yuklab olish · 🖨 Chop etish · 📤 Yuborish,
        //    format tanlanadi: PDF · Word · Excel · JPG — 8, 13, 14, 17
        // =====================================================================

        const V9: any = window as any;
        var V9S: any = { busy: false };

        function v9E(s: unknown): string { return V9.escapeHtml(String(s == null ? '' : s)); }
        function v9Me(): string { return V9.cleanTabel((typeof V9.sigMe === 'function' && V9.sigMe()) || (typeof V9.meTabel === 'function' ? V9.meTabel() : '')); }
        function v9Pretty(t: unknown): string { return String(t || 'Hujjat').replace(/\.(pdf|docx?|xlsx?|jpe?g|png|heic)$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Hujjat'; }
        function v9T(iso: unknown): string { try { return iso ? V9.fmtDT(iso) : '—'; } catch (e) { return String(iso || '—'); } }
        function v9Lav(t: unknown): string { try { const it = V9.xodimByTabel(V9.cleanTabel(t)); return it ? String(it.lavozim || '') : ''; } catch (e) { return ''; } }

        // ---------- 5, 10) har ochilgan oyna eng ustida ----------
        if (typeof V9.mdl === 'function') V9.mdl = V9.agmkExtend('mdl', 'v3.17.0: oyna eng ustida', V9.mdl, (o: Function) => function (this: unknown) {
            const m = o.apply(this, arguments);
            try { if (m && m.parentNode === document.body && document.body.lastElementChild !== m) document.body.appendChild(m); } catch (e) { /* */ }
            return m;
        });

        // ---------- 1, 6) hujjat nomi: fayl nomi koʻrinishidan odamga oʻqiladigan koʻrinishga ----------
        if (typeof V9.sigApi === 'function') V9.sigApi = V9.agmkExtend('sigApi', 'v3.17.0: hujjat nomlari', V9.sigApi, (o: Function) => async function (this: unknown, path: string, method: string, body: any) {
            if (method === 'POST' && path === '/api/sign/v1/docs' && body && body.title) body = Object.assign({}, body, { title: v9Pretty(body.title) });
            const r = await o.call(this, path, method, body);
            try {
                if ((!method || method === 'GET') && /\/api\/sign\/v1\/(inbox|docs\/)/.test(String(path))) {
                    if (Array.isArray(r)) r.forEach((d: any) => { if (d) d.title = v9Pretty(d.title); });
                    else if (r && r.title) r.title = v9Pretty(r.title);
                }
            } catch (e) { /* */ }
            return r;
        });

        // ---------- 15) majburiy navbat yoʻq ----------
        V9.v8Blocker = function (): null { return null; };
        V9.v8Tools = function (ctx: string): HTMLElement {
            const R = V9.v8Rows(ctx), nt = R.filter((r: any) => r.on && r.tabel && r.kind === 'tan').length, ns = R.filter((r: any) => r.on && r.tabel && r.kind !== 'tan').length;
            const w = document.createElement('div'); w.className = 'v8-tools';
            w.innerHTML = `<button class="action-btn sec" type="button" onclick="v8GrpOpen('${ctx}')">👥 Guruhni qoʻshish (sex / uchastka / lavozim)</button>
                <div class="nd-tip">🔢 Roʻyxat hujjatdagi kabi: <b>rahbariyat tepada</b>, quyi lavozimlar pastda. Raqam — tavsiya etilgan navbat (pastdan yuqoriga). Hujjat <b>hammaga bir vaqtda</b> boradi — kim tayyor boʻlsa, imzolaydi.</div>
                <div class="v8-cnt">✍️ Imzolovchi: <b>${ns}</b> · 👁 Tanishuvchi: <b>${nt}</b></div>`;
            return w;
        };

        // ---------- 16) tartib: hujjatdagi kabi (rahbariyat tepada), qoʻshilganlar lavozimiga qarab oʻz joyiga ----------
        V9.v8BottomUp = function (rows: any[]): any[] { return rows; };
        function v9Rank(lav: unknown): number {
            const s = String(lav || '').toLowerCase();
            if (/o.rinbosar|заместител/.test(s)) return 3;
            if (/bosh muhandis|главный инженер|boshqarma boshlig|direktor|директор|начальник управления|rahbar|руководител/.test(s)) return 1;
            if (/boshlig|начальник|mudir|заведующ/.test(s)) return 2;
            if (/muhandis|инженер|mutaxassis|специалист|ekonomist|экономист|buxgalter|бухгалтер|texnolog|технолог|inspektor|инспектор|dispetcher|диспетчер|revizor|ревизор/.test(s)) return 4;
            if (/usta|мастер|brigadir|бригадир/.test(s)) return 5;
            return 6;
        }
        function v9RowLav(ctx: string, r: any): string { return ctx === 'pend' ? v9Lav(r.tabel) : String(r.lav || v9Lav(r.tabel)); }
        function v9PlaceNew(ctx: string, before: number): void {
            const R = V9.v8Rows(ctx); if (R.length <= before) return;
            const added = R.splice(before);
            added.forEach((r: any) => { const k = v9Rank(v9RowLav(ctx, r)); let i = R.findIndex((z: any) => v9Rank(v9RowLav(ctx, z)) > k); if (i < 0) i = R.length; R.splice(i, 0, r); });
        }
        if (typeof V9.upAdd === 'function') V9.upAdd = V9.agmkExtend('upAdd', 'v3.17.0: lavozimiga qarab joyiga', V9.upAdd, (o: Function) => async function (this: unknown) {
            const n = ((V9.UP || {}).rows || []).length; const r = await o.apply(this, arguments);
            try { if (V9.UP.rows.length > n) { v9PlaceNew('up', n); V9.upReviewRender(); } } catch (e) { /* */ }
            return r;
        });
        if (typeof V9.v8GrpAdd === 'function') V9.v8GrpAdd = V9.agmkExtend('v8GrpAdd', 'v3.17.0: lavozimiga qarab joyiga', V9.v8GrpAdd, (o: Function) => async function (this: unknown) {
            const ctx = V9.V8G.ctx, n = V9.v8Rows(ctx).length; const r = await o.apply(this, arguments);
            try { if (V9.v8Rows(ctx).length > n) { v9PlaceNew(ctx, n); if (ctx === 'pend') V9.sigSendRender(); else V9.upReviewRender(); } } catch (e) { /* */ }
            return r;
        });
        if (typeof V9.upSend === 'function') V9.upSend = V9.agmkExtend('upSend', 'v3.17.0: hujjat nomi', V9.upSend, (o: Function) => function (this: unknown) {
            try { if (V9.UP) V9.UP.title = v9Pretty(V9.UP.title); } catch (e) { /* */ } return o.apply(this, arguments);
        });

        // ---------- 3) «B» dizayn: navbat chizigʻi (yuborish oynalarida) ----------
        function v9Nums(R: any[]): any[] { // raqam pastdan yuqoriga: eng pastdagi imzolovchi = 1
            const act = R.map((r: any, i: number) => ({ r, i })).filter(x => x.r.on && x.r.tabel && x.r.kind !== 'tan'); const out: any[] = [];
            act.forEach((x, k) => { out[x.i] = act.length - k; }); return out;
        }
        function v9Tag(R: any[], i: number, nums: any[]): string {
            const r = R[i]; if (r.kind === 'tan') return '<div class="v9-tag t">Tanishadi · istalgan vaqtda</div>';
            const n = nums[i], mx = Math.max(0, ...nums.filter(Boolean)); if (!n || mx < 2) return '';
            return n === mx ? '<div class="v9-tag">Rahbariyat · oxirida imzolaydi</div>' : n === 1 ? '<div class="v9-tag">Ijrochi · birinchi imzolaydi</div>' : '';
        }
        function v9Card(ctx: string, i: number, r: any, nums: any[], R: any[], mid: string): string {
            const tan = r.kind === 'tan', off = !r.on, n = nums[i];
            const no = tan ? '👁' : n ? String(n) : '·';
            return `<div class="v9-c${tan ? ' tan' : ''}${off ? ' off' : ''}"><div class="v9-no${tan ? ' t' : ''}">${no}</div>${v9Tag(R, i, nums)}
                <div class="v9-top"><label class="v9-chk"><input type="checkbox" ${r.on ? 'checked' : ''} ${r.tabel ? '' : 'disabled'} onchange="v9RowOn('${ctx}',${i},this.checked)"></label><div class="v9-nm">${mid}</div></div>
                <div class="v9-act"><button type="button" class="v9-chip${tan ? ' t' : ''}" onclick="v8Kind('${ctx}',${i})">${tan ? '👁 Tanishadi' : '✍️ Imzolaydi'}</button><span class="v9-sp"></span>
                <button type="button" class="v9-ib" onclick="v9RowMv('${ctx}',${i},-1)">↑</button><button type="button" class="v9-ib" onclick="v9RowMv('${ctx}',${i},1)">↓</button><button type="button" class="v9-ib x" onclick="v9RowDel('${ctx}',${i})">✕</button></div></div>`;
        }
        function v9RowOn(ctx: string, i: number, on: boolean): void { const r = V9.v8Rows(ctx)[i]; if (r) r.on = on; if (ctx === 'pend') V9.sigSendRender(); else V9.upReviewRender(); }
        function v9RowMv(ctx: string, i: number, d: number): void { const R = V9.v8Rows(ctx), j = i + d; if (j < 0 || j >= R.length) return; const t = R[i]; R[i] = R[j]; R[j] = t; if (ctx === 'pend') V9.sigSendRender(); else V9.upReviewRender(); }
        function v9RowDel(ctx: string, i: number): void { V9.v8Rows(ctx).splice(i, 1); if (ctx === 'pend') V9.sigSendRender(); else V9.upReviewRender(); }
        function v9UpMid(r: any, i: number): string {
            if (r.tabel) return `<b>${v9E(r.name)}</b><small>${v9E(r.lav || v9Lav(r.tabel))}${r.lav || v9Lav(r.tabel) ? ' · ' : ''}${v9E(r.tabel)}</small>${r.label ? `<small class="v9-lbl">hujjatda: ${v9E(r.label)}</small>` : ''}`;
            if (r.st === 'many' && r.alt) return `<b>⚠️ «${v9E(r.label)}» — ${r.alt.length} ta xodim</b><select onchange="upPickAlt(${i}, this.value)"><option value="">— qaysi biri? —</option>${r.alt.map((a: any) => `<option value="${v9E(a.t)}">${v9E(a.n)} · ${v9E(a.l)} · ${v9E(a.su)}</option>`).join('')}</select>`;
            return `<b>❓ «${v9E(r.label)}»</b><small>shtatda topilmadi (tashqi odam boʻlishi mumkin)</small>`;
        }
        if (typeof V9.upReviewRender === 'function') V9.upReviewRender = V9.agmkExtend('upReviewRender', 'v3.17.0: B dizayn', V9.upReviewRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const rows = Array.from(document.querySelectorAll('.up-row')) as any[]; if (!rows.length && !(V9.UP.rows || []).length) return r;
                const R = V9.UP.rows, nums = v9Nums(R), tl = document.createElement('div'); tl.className = 'v9-tl';
                tl.innerHTML = R.map((x: any, i: number) => v9Card('up', i, x, nums, R, v9UpMid(x, i))).join('');
                const anchor = rows[0] || document.querySelector('button[onclick="upAdd()"]'); if (!anchor) return r;
                anchor.parentNode.insertBefore(tl, anchor); rows.forEach(e => e.remove());
                const tip = tl.parentNode && tl.parentNode.querySelector('.nd-tip'); if (tip) tip.innerHTML = 'Ilova hujjatdagi familiyalarni topdi va shtat roʻyxatidan aniqladi. <b>Tekshiring</b>: notoʻgʻrisini olib tashlang, ikki xil boʻlsa — toʻgʻrisini tanlang, yetishmaganini qoʻshing.';
                document.querySelectorAll('.v8-ord').forEach(e => e.remove());
            } catch (e) { console.warn(e); }
            return r;
        });
        if (typeof V9.sigSendRender === 'function') V9.sigSendRender = V9.agmkExtend('sigSendRender', 'v3.17.0: B dizayn', V9.sigSendRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const box = V9.$id('sgSend'), P = V9.SIG.pend; if (!box || !P) return r;
                const els = Array.from(box.querySelectorAll('.sg-row')) as any[], R = P.rows, nums = v9Nums(R), U = V9.SIG.users || [];
                const opts = (sel: string) => '<option value="">— hisob tanlanmagan —</option>' + U.map((u: any) => `<option value="${v9E(u.tabel)}"${u.tabel === sel ? ' selected' : ''}>${v9E(u.name)} · ${v9E(u.tabel)}${u.has_sig ? '' : ' · (imzosi yoʻq)'}</option>`).join('');
                const tl = document.createElement('div'); tl.className = 'v9-tl';
                tl.innerHTML = R.map((x: any, i: number) => v9Card('pend', i, x, nums, R, `<b>${v9E(x.label || '—')}</b><small>${v9E(v9Lav(x.tabel))}${x.sign === false ? ' · imzo qatorida emas' : ''}</small><select onchange="SIG.pend.rows[${i}].tabel=this.value; SIG.pend.rows[${i}].on=!!this.value; sigSendRender()">${opts(x.tabel)}</select>`)).join('');
                const anchor = els[0] || (Array.from(box.querySelectorAll('button')) as any[]).find(b => /Imzo chekuvchi qoʻshish/.test(b.textContent)); if (!anchor) return r;
                anchor.parentNode.insertBefore(tl, anchor); els.forEach(e => e.remove());
                const tip = box.querySelector('.nd-tip'); if (tip) tip.innerHTML = 'Ilova hujjatdagi imzo chekuvchilarni oʻqidi va hisoblariga moslashtirdi. Tekshiring: har qatorda toʻgʻri odam tanlangan boʻlsin. Hujjat <b>hammaga bir vaqtda</b> boradi.';
            } catch (e) { console.warn(e); }
            return r;
        });

        // ---------- 11) 3 bosqich: ✓ Yuborildi · ✓✓ Tanishdi · ✍️ Imzoladi ----------
        function v9Steps(d: any, x: any): string {
            const tan = x.kind === 'tan', seen = x.seen || (x.state !== 'wait' ? x.at : null);
            const last = x.state === 'reject' ? ['rej', '❌ Rad etdi', x.at] : x.state === 'sign' ? ['ok', tan ? '👁 Tasdiqladi' : '✍️ Imzoladi', x.at] : ['', tan ? '👁 Tasdiqlash' : '✍️ Imzolash', null];
            const st = (cls: string, t: string, at: any) => `<div class="v9-s ${cls}">${t}<i>${at ? v9E(v9T(at)) : '—'}</i></div>`;
            return `<div class="v9-steps">${st('ok', '✓ Yuborildi', d.created_at)}${st(seen ? (x.state === 'wait' ? 'on' : 'ok') : '', '✓✓ Tanishdi', seen)}${st(last[0] as string, last[1] as string, last[2])}</div>${x.state === 'reject' && x.reason ? `<div class="v9-rej">Sabab: ${v9E(x.reason)}</div>` : ''}`;
        }
        function v9DocTl(d: any): string {
            const S = d.signers || [], act = S.map((x: any, i: number) => ({ x, i })).filter((z: any) => z.x.kind !== 'tan'), nums: any[] = [];
            act.forEach((z: any, k: number) => { nums[z.i] = act.length - k; });
            const mx = act.length, me = v9Me();
            return `<div class="v9-tl">` + S.map((x: any, i: number) => {
                const tan = x.kind === 'tan', n = nums[i], done = x.state === 'sign', rej = x.state === 'reject';
                const tag = tan ? '<div class="v9-tag t">Tanishadi · istalgan vaqtda</div>' : mx > 1 && n === mx ? '<div class="v9-tag">Rahbariyat</div>' : mx > 1 && n === 1 ? '<div class="v9-tag">Ijrochi</div>' : '';
                return `<div class="v9-c${tan ? ' tan' : ''}${V9.cleanTabel(x.tabel) === me ? ' me' : ''}"><div class="v9-no${tan ? ' t' : done ? ' ok' : rej ? ' rej' : ''}">${tan ? '👁' : done ? '✓' : rej ? '✕' : n}</div>${tag}
                    <div class="v9-nm"><b>${v9E(x.name || x.label)}</b><small>${[v9Lav(x.tabel) || '', 'tabel ' + x.tabel, x.later ? 'hali roʻyxatdan oʻtmagan' : ''].filter(Boolean).map(v9E).join(' · ')}</small></div>${v9Steps(d, x)}</div>`;
            }).join('') + `</div>`;
        }
        function v9Sum(d: any): string {
            const S = d.signers || [], n = S.length, seen = S.filter((x: any) => x.seen || x.state !== 'wait').length, sg = S.filter((x: any) => x.state === 'sign').length, rj = S.filter((x: any) => x.state === 'reject').length;
            return `<div class="v9-sum"><span class="g">✓ ${n} yuborildi</span><span class="b">✓✓ ${seen} tanishdi</span><span class="gr">✍️ ${sg} imzoladi</span>${rj ? `<span class="r">❌ ${rj} rad</span>` : ''}</div>
                <div class="v9-bar"><i class="gr" style="width:${n ? sg * 100 / n : 0}%"></i><i class="r" style="width:${n ? rj * 100 / n : 0}%"></i><i class="b" style="width:${n ? Math.max(0, seen - sg - rj) * 100 / n : 0}%"></i></div>`;
        }
        // 9) elektron tasdiq jurnali — faqat ilovada
        function v9Journal(d: any): string {
            const S = d.signers || [];
            return `<details class="v9-jr"><summary>🔐 Elektron tasdiq (faqat ilovada, PDF ga tushmaydi)</summary>` + S.map((x: any) => `<div>${x.state === 'sign' ? (x.kind === 'tan' ? '👁 Tanishganini tasdiqladi' : '✍️ Imzoladi') : x.state === 'reject' ? '❌ Rad etdi' : '⏳ Kutilmoqda'}: ${v9E(x.name || x.label)} (tabel ${v9E(x.tabel)})${x.at ? ', ' + v9E(v9T(x.at)) : ''}${x.reason ? ' — ' + v9E(x.reason) : ''}</div>`).join('') +
                `<div class="v9-hash">Hujjat izi SHA-256: ${v9E(d.hash)}</div><div class="v9-hash">Yubordi: tabel ${v9E(d.created_by)} · ${v9E(v9T(d.created_at))}</div></details>`;
        }

        // ---------- hujjat oynasi (eng ustida, darhol «Ochilmoqda…») ----------
        async function v9OpenDoc(id: string): Promise<void> {
            V9.mdl('sgDoc', `<div class="px-h"><b>✍️ Hujjat</b><button class="mini-btn" onclick="mdlClose('sgDoc')">✕</button></div><div class="xt-empty">⏳ Ochilmoqda…</div>`, true);
            let d: any; try { d = await V9.sigApi('/api/sign/v1/docs/' + id); } catch (e) { V9.mdlClose('sgDoc'); alert('⚠️ ' + V9.agmkErrUz(e)); return; }
            V9.SIG.cur = d; V9.SIG.lay = null; const me = v9Me(), mine = (d.signers || []).find((x: any) => V9.cleanTabel(x.tabel) === me);
            let hOk = true; try { hOk = (await V9.sigSha(d.html)) === d.hash && (d.signers || []).every((x: any) => x.state !== 'sign' || x.hash === d.hash); } catch (e) { hOk = true; }
            const wait = mine && mine.state === 'wait' && d.status === 'open', tan = mine && mine.kind === 'tan';
            V9.mdl('sgDoc', `<div class="px-h"><b class="v9-title">✍️ ${v9E(d.title)}</b><button class="mini-btn" onclick="mdlClose('sgDoc')">✕</button></div>
                ${d.demo ? '<div class="hp-warn">🎭 DEMO: hujjatda demo hisob ishtirok etmoqda — bu haqiqiy hujjat emas.</div>' : ''}
                <div class="v9-st">${d.status === 'done' ? '✅ Toʻliq imzolangan' : d.status === 'cancelled' ? '✖ Bekor qilingan' : '⏳ Jarayonda'} · yubordi ${v9E(d.created_by)} · ${v9E(v9T(d.created_at))}</div>
                ${v9Sum(d)}${v9DocTl(d)}
                ${hOk ? '' : '<div class="hp-warn">⚠️ Hujjat izi mos kelmaydi — imzolar bekor (hujjat oʻzgartirilgan).</div>'}
                <div class="v9-acts"><button onclick="v9ViewDoc()">👁 Koʻzdan kechirish</button><button onclick="v9DocAct('dl')">⬇️ Yuklab olish</button><button onclick="v9DocAct('print')">🖨 Chop etish</button><button onclick="v9DocAct('share')">📤 Yuborish</button></div>
                <div class="sg-view" id="sgView"><small style="color:#64748b">⏳ Hujjat chizilmoqda…</small></div>
                ${v9Journal(d)}
                <div class="pk-btns">${wait ? `<button class="pr" onclick="sigDoSign()">${tan ? '👁 Tanishdim' : '✍️ Imzolash'}</button><button onclick="sigDoReject()">❌ Rad etish</button>` : ''}
                ${d.created_by === me && d.status === 'open' ? `<button onclick="sigCancel()">✖ Bekor qilish</button>` : ''}</div>`, true);
            try {
                const lay = await V9.sigLayout(d), v = V9.$id('sgView'); if (!v || V9.SIG.cur !== d) return;
                try { await Promise.all([(document as any).fonts.load('16px AGMKSerif'), (document as any).fonts.load('bold 16px AGMKSerif')]); } catch (e) { /* */ }
                v.innerHTML = ''; lay.pages.forEach((ops: any[], i: number) => { const c = V9.dxCanvas(lay, ops, 1.6); c.className = 'dx-pg'; c.title = 'Kattalashtirish uchun bosing'; c.onclick = () => v9ViewDoc(i); v.appendChild(c); }); V9.SIG.lay = lay;
            } catch (e) { console.error(e); const v = V9.$id('sgView'); if (v) v.innerHTML = '<div class="hp-warn">⚠️ Hujjatni chizib boʻlmadi: ' + v9E(V9.agmkErrUz(e)) + '</div>'; }
        }
        V9.sigOpenDoc = v9OpenDoc;
        async function v9DocLay(): Promise<any> { const d = V9.SIG.cur; if (!d) return null; if (V9.SIG.lay) return V9.SIG.lay; V9.SIG.lay = await V9.sigLayout(d); return V9.SIG.lay; }
        async function v9DocFiles(): Promise<any[]> {
            const d = V9.SIG.cur, lay = await v9DocLay(); V9.PDFK.f = null;
            const blob = V9.pdfBuild(lay), f = { name: v9FileName(d.title) + (d.status === 'done' ? '_imzolangan' : '') + '.pdf', mime: 'application/pdf', blob: blob };
            EXS.set(blob, { lay: lay, title: d.title }); return [f];
        }
        async function v9DocAct(a: string): Promise<void> { try { V9.showToast('⏳ Tayyorlanmoqda…'); exOpen(await v9DocFiles(), { act: a, title: V9.SIG.cur.title }); } catch (e) { alert('⚠️ ' + V9.agmkErrUz(e)); } }
        V9.sigPdf = function (): Promise<void> { return v9DocAct('dl'); };
        async function v9ViewDoc(page?: number): Promise<void> {
            const d = V9.SIG.cur; if (!d) return;
            v9Viewer(d.title, async () => { const lay = await v9DocLay(); return lay.pages.map((ops: any[]) => V9.dxCanvas(lay, ops, 3.2).toDataURL('image/jpeg', 0.93)); }, typeof page === 'number' ? page : 0, () => v9DocFiles());
        }

        // ---------- roʻyxat va nazorat: B dizayn, jamlanma ----------
        V9.v8Naz = async function (f?: string): Promise<void> {
            if (typeof f === 'string') V9.V8N.f = f;
            if (V9.sigSrv()) { try { await V9.sigPoll(true); } catch (e) { /* */ } }
            const D = V9.v8NazDocs(), F = [['all', 'Hammasi'], ['open', '⏳ Jarayonda'], ['done', '✅ Yakunlangan'], ['rej', '❌ Rad etilgan']];
            V9.mdl('sgList', `<div class="px-h"><b>📊 Imzolash nazorati</b><button class="mini-btn" onclick="mdlClose('sgList')">✕</button></div>
                <div class="sg-tabs"><button onclick="sigOpenList('in')">← Imzolash</button>${F.map(([k, t]) => `<button class="${V9.V8N.f === k ? 'on' : ''}" onclick="v8Naz('${k}')">${t}</button>`).join('')}</div>
                <div class="v9-acts"><button onclick="v8NazXls()">📊 Excel</button><button onclick="v8NazPdf()">📄 PDF</button></div>
                ${D.map((d: any) => `<details class="v8-nd"><summary><b class="v9-title">${v9E(d.title)}</b><small>${V9.v8DocSt(d)} · ${v9E(v9T(d.created_at))}${d.created_by !== v9Me() ? ' · yubordi ' + v9E(d.created_by) : ''}</small>${v9Sum(d)}</summary>
                    ${v9DocTl(d)}<button class="mini-btn" onclick="sigOpenDoc('${v9E(d.id)}')">📄 Hujjatni ochish</button></details>`).join('') || '<div class="xt-empty">Siz yuborgan hujjat yoʻq.</div>'}`, true);
        };

        // =====================================================================
        // 8, 13, 14, 17) YAGONA QOIDA: ⬇️ Yuklab olish · 🖨 Chop etish · 📤 Yuborish + format: PDF · Word · Excel · JPG
        // =====================================================================
        var EXS: WeakMap<Blob, any> = new WeakMap();
        var EX: any = { pass: 0, files: [], opt: {}, fmt: '' };
        const EX_FMT: any = { pdf: ['📄', 'PDF', 'application/pdf'], docx: ['📝', 'Word', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], xlsx: ['📊', 'Excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], jpg: ['🖼', 'JPG', 'image/jpeg'] };
        function v9FileName(t: unknown): string { return String(v9Pretty(t)).replace(/[^\p{L}\d]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'Hujjat'; }
        function exKind(f: any): string { const n = String(f && f.name || '').toLowerCase(), m = String(f && f.mime || ''); if (/\.pdf$/.test(n) || /pdf/.test(m)) return 'pdf'; if (/\.docx$/.test(n) || /word/.test(m)) return 'docx'; if (/\.xlsx$/.test(n) || /sheet/.test(m)) return 'xlsx'; if (/\.(jpe?g|png|webp)$/.test(n) || /^image\//.test(m)) return 'jpg'; return ''; }
        function exIsDoc(files: any[]): boolean { return Array.isArray(files) && files.length > 0 && files.every(f => f && f.blob && exKind(f)); }
        // manbalarni eslab qolish: HTML (dalolatnoma, jadval), qatorlar (Excel), sahifa joylashuvi (imzo hujjati)
        if (typeof V9.pdfBlobFromHtml === 'function') { const _p = V9.pdfBlobFromHtml; V9.pdfBlobFromHtml = function (html: string) { const b = _p.apply(this, arguments); try { EXS.set(b, { html: html }); } catch (e) { /* */ } return b; }; }
        if (typeof V9.docxFromHtml === 'function') { const _d = V9.docxFromHtml; V9.docxFromHtml = function (html: string) { const b = _d.apply(this, arguments); try { EXS.set(b, { html: html }); } catch (e) { /* */ } return b; }; }
        if (typeof V9.xlsxFromRows === 'function') { const _x = V9.xlsxFromRows; V9.xlsxFromRows = function (rows: any[], sheet: string) { const b = _x.apply(this, arguments); try { EXS.set(b, { rows: rows, title: sheet }); } catch (e) { /* */ } return b; }; }
        if (typeof V9.xlsxFromHtmlTable === 'function') { const _t = V9.xlsxFromHtmlTable; V9.xlsxFromHtmlTable = function (html: string) { const b = _t.apply(this, arguments); try { EXS.set(b, { html: html }); } catch (e) { /* */ } return b; }; }
        function exRowsHtml(rows: any[][], title?: string): string {
            const E = v9E, td = 'border:1px solid #000;padding:3px 5px;font-size:10pt';
            return `<div style="font-family:'Times New Roman',serif;color:#000">${title ? `<h3 style="text-align:center">${E(title)}</h3>` : ''}<table style="border-collapse:collapse;width:100%">` + rows.map((r, i) => `<tr>${(r || []).map(v => `<${i === 0 ? 'th' : 'td'} style="${td}">${E(v)}</${i === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('') + '</table></div>';
        }
        function exB64U8(u: string): Uint8Array { const b = atob(u.split(',')[1] || ''), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
        function exBlobUrl(b: Blob): Promise<string> { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(b); }); }
        async function exImgDims(u: string): Promise<any> { return new Promise(res => { const im = new Image(); im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => res({ w: 1240, h: 1754 }); im.src = u; }); }
        async function exJpegUrl(u: string): Promise<string> { // har qanday rasm → JPEG (oq fon)
            if (/^data:image\/jpeg/.test(u)) return u;
            return new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0); res(c.toDataURL('image/jpeg', 0.92)); }; im.onerror = () => res(u); im.src = u; });
        }
        // sahifa rasmlari va matn qatorlari (har qanday manbadan)
        async function exPages(f: any): Promise<any> {
            const src = EXS.get(f.blob) || {}, k = exKind(f);
            if (src.imgs) return { imgs: src.imgs, rows: [] };
            if (src.lay) { const lay = src.lay; return { imgs: lay.pages.map((ops: any[]) => V9.dxCanvas(lay, ops, 3).toDataURL('image/jpeg', 0.93)), rows: exLayRows(lay) }; }
            if (src.html) { const L = await V9.jpgFromHtml(src.html); const imgs: string[] = []; for (const b of L) imgs.push(await exBlobUrl(b)); return { imgs: imgs, rows: exHtmlRows(src.html) }; }
            if (src.rows) { const L = await V9.jpgFromHtml(exRowsHtml(src.rows, src.title)); const imgs: string[] = []; for (const b of L) imgs.push(await exBlobUrl(b)); return { imgs: imgs, rows: src.rows }; }
            if (k === 'jpg') return { imgs: [await exJpegUrl(await exBlobUrl(f.blob))], rows: [] };
            if (k === 'pdf') return exPdfPages(f.blob);
            throw new Error('Bu faylni boshqa formatga oʻtkazib boʻlmaydi');
        }
        function exLines(items: any[], gap: number): any[][] { // [{x,y,s,w}] → qatorlar, katakchalar (oraliq boʻyicha)
            const L: any[] = [];
            items.filter(it => String(it.s || '').trim()).sort((a, b) => a.y - b.y || a.x - b.x).forEach(it => { const l = L.find(z => Math.abs(z.y - it.y) < 3); if (l) l.a.push(it); else L.push({ y: it.y, a: [it] }); });
            return L.map(l => { const a = l.a.sort((p: any, q: any) => p.x - q.x), cells: string[] = []; let cur = '', endX = -1e9;
                a.forEach((it: any) => { if (cur && it.x - endX > gap) { cells.push(cur.trim()); cur = ''; } cur += (cur ? ' ' : '') + it.s; endX = it.x + (it.w || 0); }); if (cur) cells.push(cur.trim()); return cells; });
        }
        function exLayRows(lay: any): any[][] { const out: any[][] = []; lay.pages.forEach((ops: any[]) => { const it = ops.filter(o => o.k === 't').map(o => ({ x: o.x, y: o.y, s: o.s, w: (() => { try { return V9.pdfW(o.st, o.s, o.fs); } catch (e) { return String(o.s).length * o.fs * 0.5; } })() })); exLines(it, 14).forEach(r => out.push(r)); }); return out; }
        function exHtmlRows(html: string): any[][] {
            const box = document.createElement('div'); box.innerHTML = html; const out: any[][] = [];
            const walk = (el: any) => { Array.from(el.children || []).forEach((c: any) => { if (c.tagName === 'TABLE') Array.from(c.rows).forEach((r: any) => out.push(Array.from(r.cells).map((td: any) => td.textContent.replace(/\s+/g, ' ').trim())));
                else if (/^(P|H[1-6]|LI)$/.test(c.tagName)) { const t = c.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push([t]); } else walk(c); }); };
            walk(box); if (!out.length) box.textContent.split(/\n+/).map(s => s.trim()).filter(Boolean).forEach(s => out.push([s])); return out;
        }
        async function exPdfPages(blob: Blob): Promise<any> {
            const lib = V9.hsPdfLib(), pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise, imgs: string[] = [], rows: any[][] = [];
            for (let i = 1; i <= Math.min(pdf.numPages, 60); i++) {
                const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: 2 }), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
                const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: g, viewport: vp }).promise; imgs.push(c.toDataURL('image/jpeg', 0.9));
                try { const tc = await pg.getTextContent(), H = pg.getViewport({ scale: 1 }).height; exLines(tc.items.map((t: any) => ({ x: t.transform[4], y: H - t.transform[5], s: t.str, w: t.width })), 14).forEach(r => rows.push(r)); } catch (e) { /* matnsiz */ }
            }
            return { imgs: imgs, rows: rows };
        }
        // rasmlardan Word (har sahifa — alohida bet) va Excel (rasm + matn qatorlari)
        async function exDocxImgs(imgs: string[]): Promise<Blob> {
            const media: any[] = [], W = 6480000; let body = '';
            for (let i = 0; i < imgs.length; i++) { const u = await exJpegUrl(imgs[i]), dm = await exImgDims(u); let cx = W, cy = Math.round(W * dm.h / dm.w); if (cy > 9300000) { cy = 9300000; cx = Math.round(cy * dm.w / dm.h); }
                media.push({ name: 'word/media/image' + (i + 1) + '.jpeg', data: exB64U8(u) });
                body += `<w:p><w:pPr><w:jc w:val="center"/>${i < imgs.length - 1 ? '' : ''}</w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${i + 1}" name="Sahifa ${i + 1}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${i + 1}" name="image${i + 1}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIm${i + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>${i < imgs.length - 1 ? '<w:r><w:br w:type="page"/></w:r>' : ''}</w:p>`;
            }
            const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;
            return V9.zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
                { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + media.map((m, i) => `<Relationship Id="rIm${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.jpeg"/>`).join('') + '</Relationships>' },
                { name: 'word/document.xml', data: doc }
            ].concat(media), EX_FMT.docx[2]);
        }
        async function exXlsx(rows: any[][], imgs: string[], title: string): Promise<Blob> {
            const X = (s: unknown) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]);
            const col = (i: number) => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
            const R = rows && rows.length ? rows : [[v9Pretty(title)]], ncol = Math.max(1, ...R.map(r => r.length)), wid: number[] = [];
            R.forEach(r => r.forEach((v, i) => { wid[i] = Math.min(70, Math.max(wid[i] || 8, String(v == null ? '' : v).length + 2)); }));
            const data = R.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t xml:space="preserve">${X(v)}</t></is></c>`).join('') + '</row>').join('');
            const media: any[] = []; let anchors = '', rowAt = R.length + 2;
            for (let i = 0; i < (imgs || []).length; i++) { const u = await exJpegUrl(imgs[i]), dm = await exImgDims(u), cx = 6000000, cy = Math.round(cx * dm.h / dm.w), nRows = Math.ceil(cy / 190500) + 2;
                media.push({ name: 'xl/media/image' + (i + 1) + '.jpeg', data: exB64U8(u) });
                anchors += `<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${rowAt}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${i + 2}" name="Sahifa ${i + 1}"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIm${i + 1}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
                rowAt += nRows; }
            const hasImg = media.length > 0;
            const ws = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><cols>${Array.from({ length: ncol }, (_, i) => `<col min="${i + 1}" max="${i + 1}" width="${wid[i] || 10}" customWidth="1"/>`).join('')}</cols><sheetData>${data}</sheetData>${hasImg ? '<drawing r:id="rD1"/>' : ''}</worksheet>`;
            const files: any[] = [
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' + (hasImg ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : '') + '</Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${X(v9Pretty(title).slice(0, 30).replace(/[\\/?*[\]:]/g, ' ')) || 'Hujjat'}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
                { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
                { name: 'xl/worksheets/sheet1.xml', data: ws }
            ];
            if (hasImg) files.push(
                { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rD1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>' },
                { name: 'xl/drawings/drawing1.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${anchors}</xdr:wsDr>` },
                { name: 'xl/drawings/_rels/drawing1.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + media.map((m, i) => `<Relationship Id="rIm${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i + 1}.jpeg"/>`).join('') + '</Relationships>' });
            return V9.zipBlob(files.concat(media), EX_FMT.xlsx[2]);
        }
        async function exPdfImgs(imgs: string[]): Promise<Blob> {
            const W = 595.28, H = 841.89, M = 20, pages: any[] = [];
            for (const u0 of imgs) { const u = await exJpegUrl(u0), dm = await exImgDims(u); let w = W - 2 * M, h = w * dm.h / dm.w; if (h > H - 2 * M) { h = H - 2 * M; w = h * dm.w / dm.h; }
                pages.push([{ k: 'img', x: (W - w) / 2, y: (H - h) / 2, w: w, h: h, data: exB64U8(u), pw: dm.w, ph: dm.h }]); }
            V9.PDFK.f = null; return V9.pdfBuild({ P: { W: W, H: H, L: M, R: M, T: M, B: M }, pages: pages });
        }
        // bitta faylni kerakli formatga oʻtkazish
        async function exConvert(f: any, fmt: string): Promise<any[]> {
            const k = exKind(f), base = String(f.name || 'Hujjat').replace(/\.\w+$/, ''), src = EXS.get(f.blob) || {};
            if (k === fmt) return [f];
            if (src.html && fmt === 'xlsx' && !/<table/i.test(src.html)) return [{ name: base + '.xlsx', mime: EX_FMT.xlsx[2], blob: await exXlsx(exHtmlRows(src.html), [], base) }];
            if (src.html && typeof V9.docMake === 'function') return V9.docMake(src.html, base, [fmt]);
            if (src.rows && fmt !== 'xlsx') return V9.docMake(exRowsHtml(src.rows, src.title), base, [fmt]);
            const P = await exPages(f);
            if (fmt === 'jpg') { const out: any[] = []; P.imgs.forEach((u: string, i: number) => out.push({ name: base + (P.imgs.length > 1 ? '_' + (i + 1) : '') + '.jpg', mime: 'image/jpeg', blob: new Blob([exB64U8(u) as any], { type: 'image/jpeg' }) })); return out; }
            if (fmt === 'pdf') return [{ name: base + '.pdf', mime: EX_FMT.pdf[2], blob: src.lay ? (V9.PDFK.f = null, V9.pdfBuild(src.lay)) : await exPdfImgs(P.imgs) }];
            if (fmt === 'docx') return [{ name: base + '.docx', mime: EX_FMT.docx[2], blob: await exDocxImgs(P.imgs) }];
            if (fmt === 'xlsx') return [{ name: base + '.xlsx', mime: EX_FMT.xlsx[2], blob: await exXlsx(P.rows, P.rows.length >= 2 ? [] : P.imgs, base) }];
            return [f];
        }
        async function exConvertAll(files: any[], fmt: string): Promise<any[]> { const out: any[] = []; for (const f of files) (await exConvert(f, fmt)).forEach(x => out.push(x)); return out; }
        // chop etish: sahifa rasmlari → tizim chop etish oynasi (telefonda Android, kompyuterda brauzer)
        async function exPrint(files: any[], title: string): Promise<void> {
            const imgs: string[] = []; for (const f of files) { const P = await exPages(f); P.imgs.forEach((u: string) => imgs.push(u)); }
            if (!imgs.length) throw new Error('Chop etiladigan sahifa yoʻq');
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${v9E(title)}</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}img{display:block;width:100%;height:auto;page-break-after:always;break-after:page}img:last-child{page-break-after:auto;break-after:auto}</style></head><body>${imgs.map(u => `<img src="${u}">`).join('')}</body></html>`;
            const N = V9.AgmkNative; if (N && typeof N.print === 'function') { N.print(html, v9Pretty(title)); return; }
            const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(fr);
            fr.onload = () => { setTimeout(() => { try { (fr.contentWindow as any).focus(); (fr.contentWindow as any).print(); } catch (e) { alert('⚠️ Chop etib boʻlmadi'); } setTimeout(() => fr.remove(), 60000); }, 300); };
            (fr as any).srcdoc = html;
        }
        // umumiy oyna
        function exFmtGet(def: string): string { try { const v = localStorage.getItem('agmk_ex_fmt'); return v && EX_FMT[v] ? v : def; } catch (e) { return def; } }
        function exOpen(files: any[], opt?: any): void {
            EX.files = files; EX.opt = opt || {}; EX.fmt = exFmtGet(exKind(files[0]) || 'pdf');
            const title = EX.opt.title || v9Pretty(files[0] && files[0].name);
            exRender(title);
        }
        function exRender(title?: string): void {
            const t = title || EX.opt.title || v9Pretty(EX.files[0] && EX.files[0].name), a = EX.opt.act || '';
            V9.mdl('exSheet', `<div class="px-h"><b class="v9-title">📄 ${v9E(t)}</b><button class="mini-btn" onclick="mdlClose('exSheet')">✕</button></div>
                <div class="ex-files">${EX.files.map((f: any) => `${EX_FMT[exKind(f)] ? EX_FMT[exKind(f)][0] : '📎'} ${v9E(f.name)}`).join('<br>')}</div>
                <div class="pp-lbl">FORMATNI TANLANG</div>
                <div class="ex-fmt">${Object.keys(EX_FMT).map(k => `<button class="${EX.fmt === k ? 'on' : ''}" onclick="EX.fmt='${k}'; exRender()"><i>${EX_FMT[k][0]}</i>${EX_FMT[k][1]}</button>`).join('')}</div>
                <div class="ex-act"><button class="${a === 'dl' ? 'hi' : ''}" onclick="exGo('dl')"><i>⬇️</i>Yuklab olish</button><button class="${a === 'print' ? 'hi' : ''}" onclick="exGo('print')"><i>🖨</i>Chop etish</button><button class="${a === 'share' ? 'hi' : ''}" onclick="exGo('share')"><i>📤</i>Yuborish</button></div>
                <div class="nd-tip">Yuborish — Telegram, pochta va telefondagi istalgan ilova orqali. Chop etish — telefonga ulangan (Wi-Fi yoki Type-C) yoki kompyuterdagi printerga.</div>`, false);
        }
        async function exGo(a: string): Promise<void> {
            if (V9S.busy) return; V9S.busy = true; const t = EX.opt.title || v9Pretty(EX.files[0] && EX.files[0].name);
            try {
                V9.showToast(a === 'print' ? '🖨 Chop etishga tayyorlanmoqda…' : '⏳ ' + EX_FMT[EX.fmt][1] + ' tayyorlanmoqda…');
                if (a === 'print') { await exPrint(EX.files, t); V9.mdlClose('exSheet'); return; }
                try { localStorage.setItem('agmk_ex_fmt', EX.fmt); } catch (e) { /* */ }
                const out = await exConvertAll(EX.files, EX.fmt); EX.pass++;
                try {
                    if (a === 'dl') { V9.docDownload(out); V9.showToast('⬇️ Saqlandi: «Загрузки» (Downloads) papkasi · ' + out.map((f: any) => f.name).join(', ')); }
                    else await V9.docShare(out, Object.assign({ via: 'any', subject: t }, EX.opt.share || {}));
                } finally { setTimeout(() => { EX.pass = Math.max(0, EX.pass - 1); }, 1500); }
                V9.mdlClose('exSheet');
            } catch (e) { console.error(e); alert('⚠️ ' + V9.agmkErrUz(e)); } finally { V9S.busy = false; }
        }
        if (typeof V9.docDownload === 'function') V9.docDownload = V9.agmkExtend('docDownload', 'v3.17.0: yagona qoida (format va amal tanlash)', V9.docDownload, (o: Function) => function (this: unknown, files: any[]) {
            if (EX.pass || !exIsDoc(files)) return o.apply(this, arguments);
            exOpen(files, { act: 'dl' });
        });
        if (typeof V9.docShare === 'function') V9.docShare = V9.agmkExtend('docShare', 'v3.17.0: yagona qoida (format va amal tanlash)', V9.docShare, (o: Function) => async function (this: unknown, files: any[], opt: any) {
            if (EX.pass || !exIsDoc(files)) return o.apply(this, arguments);
            exOpen(files, { act: 'share', share: opt || {}, title: opt && opt.subject }); return true;
        });

        // =====================================================================
        // 18) 📷 SKANER — alohida vosita: rasm → toʻgʻrilash, tozalash → OCR → PDF · Word · Excel · JPG (imzolashga bogʻliq emas)
        // =====================================================================
        function v9ScanOpen(): void {
            try { V9.upReset(); } catch (e) { /* */ }
            V9.UP.mode = 'scan'; V9.openHisob('up');
        }
        if (typeof V9.hsTab === 'function') V9.hsTab = V9.agmkExtend('hsTab', 'v3.17.0: skaner rejimi faqat skaner tugmasidan', V9.hsTab, (o: Function) => function (this: unknown) { if (V9.UP) V9.UP.mode = ''; return o.apply(this, arguments); });
        if (typeof V9.upRender === 'function') V9.upRender = V9.agmkExtend('upRender', 'v3.17.0: skaner', V9.upRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const UP = V9.UP, b = V9.secBody('screen-hisob'); if (!b) return r;
                if (UP.st === 'home' && UP.mode === 'scan') {
                    const box = b.querySelector('.hs-box'); if (box) { const h = box.querySelector('.hs-h'), t = box.querySelector('.nd-tip'); if (h) h.textContent = '📷 Skaner — qogʻozdagi hujjatdan namunali fayl';
                        if (t) t.innerHTML = 'Hujjatni rasmga oling yoki galereyadan tanlang. Ilova chetlarini topadi, toʻgʻrilaydi, tozalaydi; server matnni oʻqiydi — natija: <b>PDF, Word, Excel yoki JPG</b>. Keyin yuklab olish, chop etish yoki yuborish.';
                        const lb = box.querySelectorAll('label.up-big'); if (lb[0]) (lb[0] as any).style.display = 'none'; }
                    const sent = V9.$id('upSent'); if (sent && sent.closest('.hs-box')) sent.closest('.hs-box').remove();
                    const back = document.createElement('button'); back.className = 'action-btn sec'; back.textContent = '✍️ Hujjatni imzoga yuborishga oʻtish'; back.onclick = () => { V9.UP.mode = ''; V9.upRender(); }; b.appendChild(back);
                } else if (UP.st === 'home' && !b.querySelector('.v9-scan')) {
                    const box = b.querySelector('.hs-box'); if (box) { const l = document.createElement('div'); l.className = 'up-big v9-scan'; l.innerHTML = '<span>🧾</span><div><b>Faqat skanerlash</b><small>imzosiz: rasm → PDF / Word / Excel / JPG</small></div>'; l.onclick = () => { V9.UP.mode = 'scan'; V9.upRender(); }; box.appendChild(l); }
                }
                if (UP.st === 'scan' && UP.mode === 'scan') { const bt = Array.from(b.querySelectorAll('button')).find((x: any) => /Matnsiz, rasm/.test(x.textContent)) as any; if (bt) bt.textContent = '🖼 Matnsiz — rasm koʻrinishida (PDF / Word / Excel / JPG)'; }
                if (UP.st === 'ocr' && UP.mode === 'scan') { const bt = Array.from(b.querySelectorAll('button')).find((x: any) => /davom etish/.test(x.textContent)) as any; if (bt) bt.textContent = '✅ Matn toʻgʻri — faylni tayyorlash'; }
            } catch (e) { console.warn(e); }
            return r;
        });
        async function v9ScanImgs(): Promise<void> {
            const UP = V9.UP; await V9.upScanProc(); const imgs = UP.scans.map((x: any) => x.out), t = v9Pretty(UP.title || 'Skaner hujjat');
            const blob = await exPdfImgs(imgs); EXS.set(blob, { imgs: imgs }); UP.st = 'scan'; V9.upRender();
            exOpen([{ name: v9FileName(t) + '.pdf', mime: 'application/pdf', blob: blob }], { title: t });
        }
        if (typeof V9.upScanImgPdf === 'function') V9.upScanImgPdf = V9.agmkExtend('upScanImgPdf', 'v3.17.0: skaner — rasmli fayl', V9.upScanImgPdf, (o: Function) => async function (this: unknown) {
            if (V9.UP.mode !== 'scan') return o.apply(this, arguments);
            try { await v9ScanImgs(); } catch (e) { alert('⚠️ ' + V9.agmkErrUz(e)); V9.upRender(); }
        });
        if (typeof V9.upScanGo === 'function') V9.upScanGo = V9.agmkExtend('upScanGo', 'v3.17.0: skaner — OCR boʻlmasa rasmli fayl', V9.upScanGo, (o: Function) => async function (this: unknown) {
            if (V9.UP.mode !== 'scan') return o.apply(this, arguments);
            const why = await V9.upOcrOk();
            if (why) { if (await V9.uiConfirm('🔤 Matnni oʻqib boʻlmaydi: ' + why + '.\n\nHujjatni rasm koʻrinishida (tozalangan) PDF / Word / Excel / JPG qilib tayyorlaymi?')) { try { await v9ScanImgs(); } catch (e) { alert('⚠️ ' + V9.agmkErrUz(e)); V9.upRender(); } } return; }
            return o.apply(this, arguments);
        });
        if (typeof V9.upOcrDone === 'function') V9.upOcrDone = V9.agmkExtend('upOcrDone', 'v3.17.0: skaner — namunali fayl', V9.upOcrDone, (o: Function) => async function (this: unknown) {
            const UP = V9.UP; if (UP.mode !== 'scan') return o.apply(this, arguments);
            const ed = V9.$id('upOcrEd'); if (ed) UP.ocrHtml = ed.innerHTML; UP.html = V9.upClean(UP.ocrHtml);
            if (!UP.html.replace(/<[^>]+>|&nbsp;/g, '').trim()) { alert('Matn boʻsh.'); return; }
            const t = v9Pretty(UP.title || 'Skaner hujjat'), html = `<div style="font-family:'Times New Roman',serif">${UP.html}</div>`;
            try { const L = await V9.docMake(html, v9FileName(t), ['pdf']); L.forEach((f: any) => EXS.set(f.blob, { html: html })); exOpen(L, { title: t }); } catch (e) { alert('⚠️ ' + V9.agmkErrUz(e)); }
        });
        // bosh sahifada «📷 Skaner» kartasi
        // 3.19.2: hujjat skaneri bosh sahifada emas — «📊 Dalolatnoma va hisobotlar» ichida (mod/v3191.ts)

        // =====================================================================
        // 7) HUJJAT KOʻRUVCHISI — butun ekran, ikki barmoq bilan kattalashtirish, sahifama-sahifa
        // =====================================================================
        var VW: any = { z: 1, files: null };
        function v9Viewer(title: string, getImgs: () => Promise<string[]>, page: number, getFiles?: () => Promise<any[]>): void {
            let el = V9.$id('v9View'); if (el) el.remove();
            el = document.createElement('div'); el.id = 'v9View';
            el.innerHTML = `<div class="vw-h"><button class="vw-b" onclick="v9ViewClose()">←</button><div class="vw-t"><b>${v9E(v9Pretty(title))}</b><small>Hujjatni koʻzdan kechirish · <span id="vwPg">1</span></small></div>
                ${getFiles ? '<button class="vw-b" onclick="v9ViewAct(\'dl\')">⬇️</button><button class="vw-b" onclick="v9ViewAct(\'print\')">🖨</button><button class="vw-b" onclick="v9ViewAct(\'share\')">📤</button>' : ''}</div>
                <div class="vw-z"><span id="vwZ">100%</span><button onclick="v9Zoom(1)" title="Sahifa kengligiga moslash">⤢</button></div>
                <div class="vw-s" id="vwS"><div class="vw-in" id="vwIn"><div class="xt-empty" style="color:#94a3b8">⏳ Sahifalar tayyorlanmoqda…</div></div></div>
                <button class="vw-top" onclick="v9ViewTop()">⌃</button>`;
            document.body.appendChild(el); VW.z = 1; VW.files = getFiles || null;
            const S = V9.$id('vwS'), IN = V9.$id('vwIn');
            getImgs().then(imgs => {
                IN.innerHTML = imgs.map((u, i) => `<div class="vw-p"><img src="${u}" draggable="false"><small>${i + 1}/${imgs.length}</small></div>`).join('');
                VW.n = imgs.length; v9PgUpd();
                if (page > 0) setTimeout(() => { const p = IN.children[page] as any; if (p) S.scrollTop = p.offsetTop - 8; }, 60);
            }).catch(e => { IN.innerHTML = '<div class="hp-warn">⚠️ ' + v9E(V9.agmkErrUz(e)) + '</div>'; });
            S.addEventListener('scroll', v9PgUpd, { passive: true });
            // ikki barmoq: kattalashtirish; ikki marta bosish: tez kattalashtirish / qaytarish
            let d0 = 0, z0 = 1, mx = 0, my = 0, lastTap = 0;
            const dist = (t: any) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
            S.addEventListener('touchstart', (e: any) => {
                if (e.touches.length === 2) { d0 = dist(e.touches); z0 = VW.z; const r = S.getBoundingClientRect(); mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left; my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top; }
                else if (e.touches.length === 1) { const now = Date.now(); if (now - lastTap < 300) { const r = S.getBoundingClientRect(); v9Zoom(VW.z > 1.2 ? 1 : 2.2, e.touches[0].clientX - r.left, e.touches[0].clientY - r.top); e.preventDefault(); } lastTap = now; }
            }, { passive: false });
            S.addEventListener('touchmove', (e: any) => { if (e.touches.length === 2 && d0) { e.preventDefault(); v9Zoom(z0 * dist(e.touches) / d0, mx, my); } }, { passive: false });
            S.addEventListener('touchend', (e: any) => { if (e.touches.length < 2) d0 = 0; });
            S.addEventListener('wheel', (e: any) => { if (e.ctrlKey) { e.preventDefault(); const r = S.getBoundingClientRect(); v9Zoom(VW.z * (e.deltaY < 0 ? 1.1 : 0.9), e.clientX - r.left, e.clientY - r.top); } }, { passive: false });
        }
        function v9Zoom(z: number, cx?: number, cy?: number): void {
            const S = V9.$id('vwS'), IN = V9.$id('vwIn'); if (!S || !IN) return;
            z = Math.max(0.75, Math.min(4, z)); const old = VW.z; if (Math.abs(z - old) < 0.001) return;
            const px = typeof cx === 'number' ? cx : S.clientWidth / 2, py = typeof cy === 'number' ? cy : S.clientHeight / 2;
            const fx = (S.scrollLeft + px) / old, fy = (S.scrollTop + py) / old;
            VW.z = z; IN.style.width = (z * 100) + '%';
            S.scrollLeft = fx * z - px; S.scrollTop = fy * z - py;
            const b = V9.$id('vwZ'); if (b) b.textContent = Math.round(z * 100) + '%';
        }
        function v9PgUpd(): void { const S = V9.$id('vwS'), IN = V9.$id('vwIn'), l = V9.$id('vwPg'); if (!S || !IN || !l) return; let k = 0; Array.from(IN.children).forEach((p: any, i: number) => { if (p.offsetTop - 40 <= S.scrollTop) k = i; }); l.textContent = (k + 1) + '/' + (VW.n || 1); }
        function v9ViewTop(): void { const S = V9.$id('vwS'); if (S) S.scrollTo({ top: 0, behavior: 'smooth' }); }
        function v9ViewClose(): void { const el = V9.$id('v9View'); if (el) el.remove(); }
        async function v9ViewAct(a: string): Promise<void> { if (!VW.files) return; try { const f = await VW.files(); v9ViewClose(); exOpen(f, { act: a }); } catch (e) { alert('⚠️ ' + V9.agmkErrUz(e)); } }
        // «orqaga» tugmasi koʻruvchini yopadi
        window.addEventListener('popstate', () => { if (V9.$id('v9View')) v9ViewClose(); });

        (function () {
            const st = document.createElement('style');
            st.textContent = `
                .sg-tabs{flex-wrap:wrap!important;overflow:visible!important}.sg-tabs button{flex:1 1 30%;min-width:0}
                .sg-doc b,.v9-title,.v8-nd summary b,#sgDoc .px-h b,.ex-files{overflow-wrap:anywhere;word-break:break-word;white-space:normal;min-width:0}
                #sgDoc .px-h,#sgList .px-h,#exSheet .px-h{gap:8px;align-items:flex-start}
                .v9-tl{position:relative;padding-left:42px;margin:8px 0}
                .v9-tl:before{content:'';position:absolute;left:17px;top:18px;bottom:18px;width:2px;background:linear-gradient(#475569,#38bdf8 50%,#22c55e)}
                .v9-c{position:relative;background:#0f172a;border:1px solid #2a3a5c;border-radius:14px;padding:10px 12px;margin-bottom:9px}
                .v9-c.tan{border-color:#0ea5e9}.v9-c.off{opacity:.5}.v9-c.me{box-shadow:0 0 0 2px rgba(250,204,21,.45)}
                .v9-no{position:absolute;left:-40px;top:10px;width:30px;height:30px;border-radius:50%;background:#7c3aed;color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 0 4px #111a2e}
                .v9-no.t{background:#0ea5e9}.v9-no.ok{background:#16a34a}.v9-no.rej{background:#dc2626}
                .v9-tag{font-size:11px;color:#a5b4fc;text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px}.v9-tag.t{color:#7dd3fc}
                .v9-top{display:flex;gap:8px;align-items:flex-start}.v9-chk input{width:20px;height:20px;margin-top:2px}
                .v9-nm{flex:1;min-width:0}.v9-nm b{display:block;font-size:15px;line-height:1.25;overflow-wrap:anywhere}.v9-nm small{display:block;color:#94a3b8;font-size:12.5px;margin-top:2px;line-height:1.3}
                .v9-nm select{width:100%;margin-top:6px}.v9-lbl{color:#64748b!important}
                .v9-act{display:flex;gap:6px;align-items:center;margin-top:8px}.v9-sp{flex:1}
                .v9-chip{border:1px solid #7c3aed;background:rgba(124,58,237,.18);border-radius:18px;padding:5px 11px;font-size:13px;color:inherit;white-space:nowrap}.v9-chip.t{border-color:#0ea5e9;background:rgba(14,165,233,.18)}
                .v9-ib{width:34px;height:32px;border-radius:9px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:15px}.v9-ib.x{color:#fca5a5}
                .v9-steps{display:flex;margin-top:9px}.v9-s{flex:1;text-align:center;font-size:11.5px;color:#64748b;position:relative;padding-top:18px}
                .v9-s:before{content:'';position:absolute;top:5px;left:50%;width:11px;height:11px;margin-left:-5.5px;border-radius:50%;background:#334155;z-index:1}
                .v9-s:after{content:'';position:absolute;top:10px;left:-50%;width:100%;height:2px;background:#334155}.v9-s:first-child:after{display:none}
                .v9-s.ok{color:#e2e8f0}.v9-s.ok:before,.v9-s.ok:after{background:#22c55e}.v9-s.on{color:#e2e8f0}.v9-s.on:before,.v9-s.on:after{background:#38bdf8}
                .v9-s.rej{color:#fca5a5}.v9-s.rej:before{background:#ef4444}.v9-s i{display:block;font-style:normal;color:#94a3b8;font-size:10.5px}
                .v9-rej{font-size:12px;color:#fca5a5;margin-top:4px}
                .v9-sum{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;margin-top:6px}.v9-sum .g{color:#94a3b8}.v9-sum .b{color:#38bdf8}.v9-sum .gr{color:#22c55e}.v9-sum .r{color:#f87171}
                .v9-bar{display:flex;height:6px;border-radius:3px;background:#1e293b;overflow:hidden;margin:6px 0 4px}.v9-bar i{display:block}.v9-bar .gr{background:#22c55e}.v9-bar .r{background:#ef4444}.v9-bar .b{background:#38bdf8}
                .v9-st{font-size:13px;color:#cbd5e1;margin:2px 0 4px}
                .v9-acts,.ex-act{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.v9-acts button,.ex-act button{min-height:46px;border-radius:11px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:12px;font-weight:600;padding:4px}
                .ex-act{grid-template-columns:repeat(3,1fr)}.ex-act button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:58px}.ex-act i{font-style:normal;font-size:20px}.ex-act button.hi{border-color:#38bdf8;background:#0c4a6e}
                .ex-fmt{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0}.ex-fmt button{min-height:56px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#cbd5e1;font-size:12.5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
                .ex-fmt i{font-style:normal;font-size:20px}.ex-fmt button.on{border-color:#a78bfa;background:rgba(124,58,237,.25);color:#fff}
                .ex-files{font-size:12.5px;color:#94a3b8;margin:4px 0 8px;max-height:90px;overflow:auto}
                .v9-jr{margin:8px 0;border:1px dashed #334155;border-radius:10px;padding:8px;font-size:12px;color:#94a3b8}.v9-jr summary{cursor:pointer;color:#cbd5e1}.v9-jr div{margin-top:4px}.v9-hash{word-break:break-all;font-size:11px}
                #sgView canvas{cursor:zoom-in}
                #v9View{position:fixed;inset:0;z-index:100000;background:#0b1220;display:flex;flex-direction:column}
                .vw-h{display:flex;align-items:center;gap:6px;padding:8px;background:#111a2e;border-bottom:1px solid #23314f}
                .vw-b{width:40px;height:40px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:18px;flex:none}
                .vw-t{flex:1;min-width:0}.vw-t b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;color:#fff}.vw-t small{color:#94a3b8;font-size:12px}
                .vw-z{position:absolute;right:12px;top:66px;z-index:2;display:flex;gap:6px;align-items:center;background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:20px;padding:4px 6px 4px 12px;color:#fff;font-size:13px}
                .vw-z button{width:30px;height:30px;border-radius:50%;border:0;background:#1e293b;color:#fff;font-size:15px}
                .vw-s{flex:1;overflow:auto;touch-action:pan-x pan-y;-webkit-overflow-scrolling:touch;background:#0b1220}
                .vw-in{width:100%;padding:8px 6px 70px;box-sizing:border-box}
                .vw-p{background:#fff;margin:0 auto 10px;box-shadow:0 2px 10px rgba(0,0,0,.4)}.vw-p img{display:block;width:100%;height:auto;user-select:none}
                .vw-p small{display:block;text-align:right;color:#475569;font-size:11px;padding:2px 6px;background:#f1f5f9}
                .vw-top{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:44px;height:44px;border-radius:50%;border:1px solid #334155;background:rgba(30,41,59,.9);color:#fff;font-size:20px}`;
            document.head.appendChild(st);
        })();
