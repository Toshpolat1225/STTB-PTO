        // =====================================================================
        // 6.0 — 4-band (muallif, 02.11.2026 19:51 / 20:07): «📥 UMUMIY YUKLASH — hamma masterlar»
        //  Oy oxirida hamma masterlarning limitka, spravka, hisobotlari va BITTA umumiy Forma-30 bir martada yuklanadi;
        //  ilova har faylni masterga oʻzi ajratadi va har birini alohida tekshiradi (anʼanaviy «📦 Oylik toʻplam» qoidalari
        //  bilan — oʻsha tekshiruv funksiyasi chaqiriladi). Natija: umumiy jadval + har master alohida tekshiruv.
        //  Masterni aniqlash (birinchi topilgani):
        //   1) hujjat ichida yoki fayl nomida yozilgan F.I.Sh. (masterlar endi oʻz ismini yozib keladi) — maʼlum masterlar
        //      roʻyxati boʻyicha (lotin/kirill farqi hisobga olinadi);
        //   2) spravkadagi «Цех/объект» (sklad) kodi → «Sklad ↔ master» jadvali (muallif belgilaydi, serverga sinxron);
        //   3) ish turi (5.9 da eslab qolingan «ish turi → master»);
        //   aks holda — «❓ Kimniki?» (bitta tanlov bilan biriktiriladi, keyin eslab qolinadi).
        //  Forma-30 hammaga umumiy: har master tekshiruvida faqat oʻz sklad/ШПЗ va talabnomalari solishtiriladi.
        //  Kirish: Hisobotlar → «📥 Umumiy yuklash»; boshqa ilovadan (Gmail) kelgan fayllar — «📥 Umumiy yuklashga qoʻshish»
        //  (ekran sakramaydi, fayllar paketda yigʻiladi). Hammasi telefon/server ichida, internetga hech narsa ketmaydi.
        // =====================================================================
        const B60: any = window as any;
        var BK60_SKL = 'agmk_sklad_master';
        var BK60: any = { cat: 'vagon', items: [], f30: [], month: '', basket: [] };
        try { if (B60.KV_SYNC && Array.isArray(B60.KV_SYNC.keys) && B60.KV_SYNC.keys.indexOf(BK60_SKL) < 0) B60.KV_SYNC.keys.push(BK60_SKL); } catch (e) { /* */ }
        function bk60Skl(): any { try { const m = B60.kvGet(BK60_SKL, null); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; } catch (e) { return {}; } }
        function bk60E(s: any): string { return B60.escapeHtml ? B60.escapeHtml(String(s == null ? '' : s)) : String(s); }
        // lotin ↔ kirill: solishtirish uchun hammasi lotinga
        var BK60_CYR: any = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
        function bk60L(s: any): string { return String(s || '').toLowerCase().replace(/[а-яёўқғҳ]/g, (c: string) => BK60_CYR[c] != null ? BK60_CYR[c] : c).replace(/[ʻʼ'`‘’]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
        function bk60Masters(): string[] {
            const s = new Set<string>();
            try { Object.values(bk60Skl()).forEach((v: any) => { if (v) s.add(String(v).trim()); }); } catch (e) { /* */ }
            try { if (typeof B60.in59Kv === 'function') Object.values(B60.in59Kv(B60.IN59_WHO || 'agmk_in59_who', {})).forEach((v: any) => { if (v) s.add(String(v).trim()); }); } catch (e) { /* */ }
            try { (B60.hsChecks() || []).slice(0, 120).forEach((x: any) => { if (x && x.who) s.add(String(x.who).trim()); }); } catch (e) { /* */ }
            BK60.items.forEach((x: any) => { if (x.who) s.add(x.who); });
            return Array.from(s).filter(Boolean).sort((a, b) => a.localeCompare(b));
        }
        // matnda master ismi bormi (familiya — asosiy belgi; ism ham boʻlsa — ishonchliroq)
        function bk60NameIn(txt: string, M: string[]): string {
            let best = '', sc = 0;
            M.forEach(m => { const w = bk60L(m).split(' ').filter(x => x.length >= 3); if (!w.length) return; const fam = w[0].replace(/(ov|ev|ova|eva)$/, '');
                if (fam.length < 3 || txt.indexOf(fam) < 0) return; let s = 2 + (txt.indexOf(w[0]) >= 0 ? 1 : 0) + (w[1] && txt.indexOf(w[1]) >= 0 ? 2 : 0); if (s > sc) { sc = s; best = m; } });
            return sc >= 3 ? best : '';
        }
        function bk60Ceh(sheets: any[]): string[] {
            const out: string[] = [];
            sheets.forEach((x: any) => { if (x.type !== 'spr') return; try { (B60.hpParseSheet(x.rows, 'spr', { f: x.f, s: x.s }) || []).forEach((b: any) => { if (b && b.ceh) out.push(String(b.ceh).trim()); }); } catch (e) { /* */ }
                // zaxira: «Цех, объект» ustuni sarlavhasi ostidagi qiymat (ayrim spravka turlarida tahlilchi uni olmaydi)
                try { const R = x.rows || []; for (let i = 0; i < Math.min(R.length, 400); i++) { const j = B60.hpFind(R[i], /^цех/); if (j < 0) continue; let k = i + 1; while (k < R.length && !B60.hpRowTxt(R[k])) k++; const v = String((R[k] || [])[j] == null ? '' : (R[k] || [])[j]).trim().replace(/\.0+$/, ''); if (/^\d{3,6}$/.test(v)) out.push(v); } } catch (e) { /* */ } });
            return Array.from(new Set(out));
        }
        function bk60Guess(it: any): void {
            const M = bk60Masters(), txt = bk60L(it.f + ' ' + it.sheets.map((x: any) => (x.rows || []).slice(0, 120).map((r: any) => (r || []).join(' ')).join(' ')).join(' '));
            let w = bk60NameIn(txt, M), how = w ? 'ism' : '';
            if (!w) { const S = bk60Skl(); for (const c of bk60Ceh(it.sheets)) { const o = typeof B60.ceh59Code === 'function' ? B60.ceh59Code(c) : ''; const v = S[c] || (o && Object.keys(S).find(k => String(k).replace(/\s/g, '').endsWith(o)) ? S[Object.keys(S).find(k => String(k).replace(/\s/g, '').endsWith(o)) as string] : ''); if (v) { w = v; how = 'sklad ' + c; break; } } }
            if (!w && typeof B60.in59KeysOf === 'function' && typeof B60.in59Guess === 'function') { try { const g = B60.in59Guess(B60.in59KeysOf({ sheets: it.sheets })); if (g) { w = g; how = 'ish turi'; } } catch (e) { /* */ } }
            it.who = w; it.how = how;
        }
        async function bk60Read(files: any[]): Promise<void> {
            for (const f of files) {
                if (BK60.items.some((x: any) => x.f === f.name && x.size === f.size) || BK60.f30.some((x: any) => x.f === f.name && x.size === f.size)) continue;
                let sheets: any[] = [];
                try { sheets = (await B60.hpReadBook(f)).map((x: any) => ({ file: f, f: f.name, s: x.s, rows: x.rows, type: B60.hpClassify(x.rows) })); }
                catch (e) { sheets = [{ file: f, f: f.name, s: '', rows: [], type: '', err: B60.agmkErrUz ? B60.agmkErrUz(e) : String(e) }]; }
                const it: any = { file: f, f: f.name, size: f.size, sheets: sheets };
                if (sheets.length && sheets.every((x: any) => x.type === 'f30')) { BK60.f30.push(it); continue; }
                bk60Guess(it); BK60.items.push(it);
            }
            try { if (!BK60.month) { const all = BK60.items.concat(BK60.f30).reduce((a: any[], x: any) => a.concat(x.sheets), []); BK60.month = B60.hpGuessMonth({ sheets: all }) || ''; } } catch (e) { /* */ }
        }
        async function bk60Start(files: any, cat?: string): Promise<void> {
            files = Array.from(files || []).filter(Boolean); if (cat) BK60.cat = cat; else if (B60.HS && B60.HS.cat) BK60.cat = B60.HS.cat;
            if (files.length) { B60.showToast('⏳ ' + files.length + ' ta fayl oʻqilmoqda…'); await bk60Read(files); }
            bk60Dlg();
        }
        // boshqa ilovadan kelgan fayllar — paketga (ekran sakramaydi)
        async function bk60Add(files: any): Promise<void> {
            files = Array.from(files || []).filter(Boolean); if (!files.length) return;
            try { B60.mdlClose('in59M'); } catch (e) { /* */ }
            const c = (B60.$id('in59Cat') || {}).value; if (c) BK60.cat = c;
            await bk60Read(files); B60.showToast('📥 Umumiy yuklash paketida: ' + (BK60.items.length + BK60.f30.length) + ' ta fayl — «Hisobotlar» → «📥 Umumiy yuklash»dan tekshiring');
        }
        function bk60Groups(): any[] {
            const g: any = {}; BK60.items.forEach((x: any, i: number) => { const k = x.who || ''; (g[k] = g[k] || []).push(i); });
            return Object.keys(g).sort((a, b) => (a ? 1 : 0) - (b ? 1 : 0) || a.localeCompare(b)).map(k => ({ who: k, idx: g[k] }));
        }
        function bk60Dlg(): void {
            const E = bk60E, M = bk60Masters(), T: any = B60.HP_TYPES || {};
            const opt = (sel: string) => `<option value="">❓ Kimniki?</option>${M.map(m => `<option${m === sel ? ' selected' : ''}>${E(m)}</option>`).join('')}<option value="__new">➕ Yangi master…</option>`;
            const G = bk60Groups(), n = BK60.items.length;
            const grp = G.map(g => `<div class="bk60-g${g.who ? '' : ' unk'}"><div class="bk60-gh"><b>${g.who ? '👤 ' + E(g.who) : '❓ Kimniki? — masterni tanlang'}</b><span>${g.idx.length} ta fayl</span></div>
                ${g.idx.map((i: number) => { const x = BK60.items[i]; const ty = Array.from(new Set(x.sheets.map((s: any) => T[s.type] || (s.err ? '⚠️ oʻqilmadi' : '— nomaʼlum')))).join(', ');
                    return `<div class="bk60-f"><div><b>${E(x.f)}</b><small>${E(ty)}${x.how ? ' · aniqlandi: ' + E(x.how) : ''}</small></div><select onchange="bk60Who(${i}, this.value)">${opt(x.who)}</select><button class="mini-btn" title="Olib tashlash" onclick="bk60Del(${i})">✕</button></div>`; }).join('')}</div>`).join('');
            const f30 = BK60.f30.length ? BK60.f30.map((x: any, i: number) => `<div class="bk60-f"><div><b>📋 ${E(x.f)}</b><small>Umumiy Forma-30 — hamma masterlar uchun</small></div><button class="mini-btn" onclick="bk60Del(${i}, 1)">✕</button></div>`).join('') : '<div class="nd-tip">Forma-30 yuklanmagan — boʻlimda saqlangani boʻlsa, oʻsha olinadi; boʻlmasa faqat ichki hisob tekshiriladi.</div>';
            const ready = G.filter(g => g.who).length;
            B60.mdl('bk60M', `<div class="px-h"><b>📥 Umumiy yuklash — hamma masterlar</b><button class="mini-btn" onclick="mdlClose('bk60M')">✕</button></div>
                <div class="nd-tip">Hamma masterlarning limitka, spravka va hisobotlari hamda <b>bitta umumiy Forma-30</b>. Ilova har faylni masterga oʻzi ajratadi (fayldagi F.I.Sh., sklad, ish turi boʻyicha) va har birini alohida tekshiradi. Notoʻgʻri boʻlsa — roʻyxatdan tanlang.</div>
                <label class="alb-btn cam">➕ Yana fayl qoʻshish<input type="file" multiple accept=".xls,.xlsx,.xlsm,.ods,.pdf,.docx,.doc,.rtf" onchange="const f=[...this.files]; this.value=''; bk60Start(f)"></label>
                <div class="nd-2"><div class="nd-f"><label>OY (YYYY-MM)</label><input id="bk60Month" value="${E(BK60.month)}" placeholder="2026-10" onchange="BK60.month=this.value.trim()"></div><div class="nd-f"><label>&nbsp;</label><button class="action-btn sec" onclick="bk60SklDlg()">⚙️ Sklad ↔ master</button></div></div>
                <div class="pp-lbl">FORMA-30</div>${f30}
                <div class="pp-lbl">MASTERLAR (${ready}) · FAYLLAR (${n})</div>${grp || '<div class="nd-tip">Hali fayl yoʻq — «➕ Yana fayl qoʻshish».</div>'}
                <button class="action-btn" onclick="bk60Run()"${ready ? '' : ' disabled'}>✅ Hammasini tekshirish — ${ready} ta master</button>
                ${n ? '<button class="action-btn sec" onclick="bk60Clear()">🗑 Paketni tozalash</button>' : ''}`, true);
        }
        async function bk60Who(i: number, v: string): Promise<void> {
            if (v === '__new') { const n = typeof B60.uiPrompt === 'function' ? await B60.uiPrompt('Master F.I.Sh.:', '') : prompt('Master F.I.Sh.:'); v = String(n || '').trim(); if (!v) { bk60Dlg(); return; } }
            const x = BK60.items[i]; if (x) { x.who = v; x.how = v ? 'qoʻlda' : ''; }
            // xuddi shu sklad / nom boʻyicha aniqlanmagan boshqa fayllar ham shu masterga
            if (v && x) { const c = bk60Ceh(x.sheets); BK60.items.forEach((y: any) => { if (!y.who && c.length && bk60Ceh(y.sheets).some((k: string) => c.indexOf(k) >= 0)) { y.who = v; y.how = 'sklad (shu master)'; } }); }
            bk60Dlg();
        }
        function bk60Del(i: number, f30?: number): void { if (f30) BK60.f30.splice(i, 1); else BK60.items.splice(i, 1); bk60Dlg(); }
        function bk60Clear(): void { BK60.items = []; BK60.f30 = []; BK60.month = ''; bk60Dlg(); }
        // «Sklad ↔ master» jadvali
        function bk60SklDlg(): void {
            const S = bk60Skl(), E = bk60E, rows = Object.keys(S).map(k => [k, S[k]]).concat([['', '']]);
            B60.mdl('bk60S', `<div class="px-h"><b>⚙️ Sklad ↔ master</b><button class="mini-btn" onclick="mdlClose('bk60S')">✕</button></div>
                <div class="nd-tip">Har bir sklad (spravkadagi «Цех/объект» kodi yoki 1C ombor kodi, masalan 9232 yoki 31 18 9205) qaysi masterniki. Umumiy yuklashda fayl shu boʻyicha masterga ajratiladi. Server orqali hamma telefonga boradi.</div>
                <div id="bk60SL">${rows.map(r => `<div class="nd-2 bk60-sr"><div class="nd-f"><input placeholder="Sklad kodi" value="${E(r[0])}"></div><div class="nd-f"><input placeholder="Master F.I.Sh." value="${E(r[1])}"></div></div>`).join('')}</div>
                <button class="action-btn sec" onclick="document.getElementById('bk60SL').insertAdjacentHTML('beforeend', '<div class=&quot;nd-2 bk60-sr&quot;><div class=&quot;nd-f&quot;><input placeholder=&quot;Sklad kodi&quot;></div><div class=&quot;nd-f&quot;><input placeholder=&quot;Master F.I.Sh.&quot;></div></div>')">➕ Qator</button>
                <button class="action-btn" onclick="bk60SklSave()">💾 Saqlash</button>`, true);
        }
        function bk60SklSave(): void {
            const m: any = {}; document.querySelectorAll('#bk60SL .bk60-sr').forEach((r: any) => { const i = r.querySelectorAll('input'); const k = String(i[0].value || '').trim(), v = String(i[1].value || '').trim(); if (k && v) m[k] = v; });
            try { B60.kvSet(BK60_SKL, m); if (B60.KV_SYNC) B60.KV_SYNC.dirty = true; } catch (e) { /* */ }
            B60.mdlClose('bk60S'); BK60.items.forEach((x: any) => { if (!x.who || /^sklad/.test(x.how || '')) bk60Guess(x); }); B60.showToast('💾 Sklad ↔ master saqlandi'); if (B60.$id('bk60M') && !B60.$id('bk60M').classList.contains('hidden')) bk60Dlg();
        }
        // tekshiruv — har master uchun anʼanaviy «Oylik toʻplam» (hpRun) chaqiriladi
        async function bk60Run(): Promise<void> {
            const G = bk60Groups().filter(g => g.who); if (!G.length) return;
            const mi = B60.$id('bk60Month'); if (mi) BK60.month = String(mi.value || '').trim();
            if (BK60.month && !/^20\d{2}-(0[1-9]|1[0-2])$/.test(BK60.month)) { alert('Oy notoʻgʻri: masalan 2026-10'); return; }
            B60.mdlClose('bk60M');
            const res: any[] = [], f30sh = BK60.f30.reduce((a: any[], x: any) => a.concat(x.sheets.filter((s: any) => s.type === 'f30')), []);
            const oldConfirm = B60.uiConfirm; B60.uiConfirm = async () => true; // oy farqi soʻrovi — paketda bir marta yetarli
            try {
                for (const g of G) {
                    const its = g.idx.map((i: number) => BK60.items[i]), sheets = its.reduce((a: any[], x: any) => a.concat(x.sheets), []).concat(f30sh);
                    if (!sheets.some((s: any) => B60.hpIsPkgType(s.type))) { res.push({ who: g.who, n: its.length, skip: 'spravka / defekt vedomost / akt / naryad topilmadi' }); continue; }
                    const f30i = sheets.findIndex((s: any) => s.type === 'f30');
                    B60.HPK.pend = { cat: BK60.cat, files: its.map((x: any) => x.file).concat(BK60.f30.map((x: any) => x.file)), sheets: sheets, month: BK60.month, who: g.who, f30sel: f30i >= 0 ? 'pkg:' + f30i : '' };
                    if (f30i < 0) { try { const st = B60.hsF30Of(BK60.cat).find((x: any) => x.month === BK60.month); if (st) B60.HPK.pend.f30sel = 'st:' + st.id; } catch (e) { /* */ } }
                    // hpRun oynadagi maydonlardan oʻqiydi — yashirin maydonlar
                    let box = B60.$id('bk60Hid'); if (!box) { box = document.createElement('div'); box.id = 'bk60Hid'; box.style.display = 'none'; document.body.appendChild(box); }
                    const hm = B60.$id('hpModal'); if (hm) { const c = hm.querySelector('.modal-content'); if (c) c.innerHTML = ''; }
                    box.innerHTML = `<input id="hp_month"><input id="hp_who"><input id="hp_f30">`;
                    (B60.$id('hp_month') as any).value = BK60.month; (B60.$id('hp_who') as any).value = g.who; (B60.$id('hp_f30') as any).value = B60.HPK.pend.f30sel;
                    const before = (B60.hsChecks()[0] || {}).id;
                    try { await B60.hpRun(); } catch (e) { console.error(e); }
                    const rec = B60.hsChecks()[0] || {};
                    res.push(rec.id && rec.id !== before ? { who: g.who, n: its.length, id: rec.id, red: rec.red || 0, blue: rec.blue || 0, sum: rec.sum || 0 } : { who: g.who, n: its.length, skip: 'tekshirilmadi' });
                    box.innerHTML = '';
                }
            } finally { B60.uiConfirm = oldConfirm; }
            BK60.last = res; BK60.items = BK60.items.filter((x: any) => !x.who); BK60.f30 = [];
            bk60Res();
        }
        function bk60Res(): void {
            const R = BK60.last || [], E = bk60E;
            const t = (r: any) => r.skip ? `<td colspan="3" class="l">⚠️ ${E(r.skip)}</td>` : `<td class="${r.red ? 'r' : ''}">${r.red ? '❌ ' + r.red : '✅ 0'}</td><td>${r.blue ? '🔵 ' + r.blue : '—'}</td><td>${r.sum ? (B60.fmtSum ? B60.fmtSum(r.sum) : r.sum) : '—'}</td>`;
            B60.mdl('bk60R', `<div class="px-h"><b>📊 Umumiy natija — ${R.length} ta master</b><button class="mini-btn" onclick="mdlClose('bk60R')">✕</button></div>
                <div class="nd-tip">Har master alohida tekshirildi va «Hisobotlar» roʻyxatiga yozildi. Qatorni bossangiz — oʻsha masterning toʻliq natijasi ochiladi.</div>
                <table class="bk60-t"><tr><th>Master</th><th>Fayl</th><th>Xato</th><th>Tekshirish</th><th>Summa</th></tr>${R.map((r: any) => `<tr${r.id ? ` onclick="mdlClose('bk60R'); HS.chk='${E(r.id)}'; HS.tab='hisob'; hsRender()"` : ''}><td class="l">${E(r.who)}</td><td>${r.n}</td>${t(r)}</tr>`).join('')}</table>
                <button class="action-btn sec" onclick="bk60Xlsx()">📥 Umumiy jadval (Excel)</button>
                ${BK60.items.length ? `<button class="action-btn sec" onclick="mdlClose('bk60R'); bk60Dlg()">❓ Masteri aniqlanmagan ${BK60.items.length} ta fayl qoldi</button>` : ''}`, true);
            const red = R.reduce((a: number, r: any) => a + (r.red || 0), 0); B60.showToast(red ? '❌ Jami ' + red + ' ta xato (' + R.length + ' master)' : '✅ ' + R.length + ' ta master — jiddiy xato yoʻq');
        }
        function bk60Xlsx(): void {
            const rows = [['Master', 'Fayllar', 'Xato', 'Tekshirish kerak', 'Summa (soʻm)', 'Izoh']].concat((BK60.last || []).map((r: any) => [r.who, r.n, r.red || 0, r.blue || 0, r.sum || 0, r.skip || '']));
            try { B60.xlsxDl(rows, 'Umumiy tekshiruv ' + (BK60.month || '')); } catch (e) { console.error(e); }
        }
        // kirish: Hisobotlar → «Oylik toʻplam» qutisi ostida
        if (typeof B60.hsRender === 'function') B60.hsRender = B60.agmkExtend('hsRender', '6.0: umumiy yuklash tugmasi', B60.hsRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const b = B60.$id('hpBox'); if (b && !b.querySelector('.bk60-in')) b.insertAdjacentHTML('beforeend', `<label class="alb-btn bk60-in">📥 Umumiy yuklash — hamma masterlar (limitka, hisobot, bitta Forma-30)<input type="file" multiple accept=".xls,.xlsx,.xlsm,.ods,.pdf,.docx,.doc,.rtf" onchange="const f=[...this.files]; this.value=''; bk60Start(f, HS.cat)"></label>${(BK60.items.length + BK60.f30.length) ? `<button class="action-btn sec bk60-op" onclick="bk60Start([], HS.cat)">📦 Paketda ${BK60.items.length + BK60.f30.length} ta fayl — ochish</button>` : ''}<button class="mini-btn bk60-skl" onclick="bk60SklDlg()">⚙️ Sklad ↔ master</button>`); } catch (e) { /* */ }
            return r;
        });
        // kirish: boshqa ilovadan kelgan fayllar oynasi
        if (typeof B60.in59Open === 'function') B60.in59Open = B60.agmkExtend('in59Open', '6.0: umumiy yuklashga qoʻshish', B60.in59Open, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try { const m = B60.$id('in59M'), b = m && m.querySelector('.action-btn'); if (b && !m.querySelector('.bk60-add')) b.insertAdjacentHTML('beforebegin', '<button class="action-btn bk60-add" onclick="bk60Add(IN59.files)">📥 Umumiy yuklashga qoʻshish (hamma masterlar)</button>'); } catch (e) { /* */ }
            return r;
        });
        (function () {
            const st = document.createElement('style'); st.id = 'v60bulkCss';
            st.textContent = `
            .hs-box .alb-btn.bk60-in{background:linear-gradient(135deg,rgba(37,99,235,.35),rgba(30,64,175,.35))!important;border:1px solid rgba(96,165,250,.6)!important;color:#e0f2fe!important}
            .bk60-skl{margin-top:8px}
            #bk60M .alb-btn{display:flex!important;align-items:center;justify-content:center;width:100%;box-sizing:border-box;min-height:44px;margin:10px 0!important;position:relative!important;float:none!important;text-align:center}
            #bk60M .alb-btn input[type=file]{position:absolute!important;inset:0;opacity:0;width:100%;height:100%}
            .bk60-f .mini-btn{flex:0 0 34px!important;width:34px!important;min-width:34px;height:34px;padding:0!important;margin:0!important}
            .bk60-f select{flex:0 0 44%;width:44%!important;max-width:none!important}
            .bk60-g{border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:8px 10px;margin:8px 0;background:rgba(15,23,42,.5)}
            .bk60-g.unk{border-color:rgba(251,191,36,.55);background:rgba(120,53,15,.25)}
            .bk60-gh{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px}.bk60-gh b{color:#f8fafc}.bk60-gh span{color:#94a3b8;font-size:12px}
            .bk60-f{display:flex;align-items:center;gap:6px;padding:6px 0;border-top:1px solid rgba(255,255,255,.07)}
            .bk60-f > div{flex:1;min-width:0}.bk60-f b{display:block;font-size:13px;word-break:break-all}.bk60-f small{color:#94a3b8;font-size:11.5px}
            .bk60-f select{max-width:44%;font-size:12px}
            .bk60-t{width:100%;border-collapse:collapse;margin:8px 0;font-size:13px}.bk60-t th,.bk60-t td{padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.1);text-align:center}
            .bk60-t td.l{text-align:left}.bk60-t td.r{color:#fca5a5;font-weight:700}.bk60-t tr[onclick]{cursor:pointer}.bk60-t tr[onclick]:hover{background:rgba(255,255,255,.05)}
            `;
            document.head.appendChild(st);
        })();
        Object.assign(B60, { BK60: BK60, bk60Start: bk60Start, bk60Add: bk60Add, bk60Dlg: bk60Dlg, bk60Who: bk60Who, bk60Del: bk60Del, bk60Clear: bk60Clear, bk60SklDlg: bk60SklDlg, bk60SklSave: bk60SklSave, bk60Run: bk60Run, bk60Xlsx: bk60Xlsx, bk60Masters: bk60Masters, bk60L: bk60L });
