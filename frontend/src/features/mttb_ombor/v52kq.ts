        // =====================================================================
        // 5.2 — «📦 Kirish nazorati» — UMTS da qabul qilingan ehtiyot qismlar (muallif, 29.10.2026; docs/REJA_5.2.md 11-band)
        //  Korxona namunasi: «…МЧЖ дан қабул қилиб олинган … техник ҳолати тўғрисида Далолатнома» (22 ta, 2026, kirill)
        //  va «YYYY йилда вагонлар учун УМТСда қабул килинган эхтиёт қисмлар рўйхати» (Excel, oylar boʻyicha).
        //  • Dalolatnoma: yetkazib beruvchi, qismlar (nomi roʻyxatdan), soni, nimaga mos (chizma / GOST), natija:
        //    «соз» yoki qismi «яроқсиз» (nuqsonlar bilan) → ikkinchi dalolatnoma ham oʻzi tuziladi.
        //    Imzo chekuvchilar shtatdan (tasdiqlovchi + komissiya), shu qurilmada eslab qolinadi. PDF va Word.
        //  • Roʻyxat (Excel dan yuklanadi): akt saqlanganda qabul qilingan soni shu oy ustuniga oʻzi qoʻshiladi.
        //  • 🔍 Oʻzaro tekshiruv: roʻyxat ↔ dalolatnomalar (ilovadagilar va yuklangan Word fayllar):
        //    oy ustuni akt sanasiga mos emas, akti yoʻq, roʻyxatda yoʻq, rejadan ortiq, takror nom,
        //    akt ichida son farqi (asosiy matn ↔ xulosa), boshqa aktdan qolgan soʻz (nusxa), fayl nomi sanasi, raqam oraligʻi.
        //  Hech qanday tashqi xizmat yoʻq. Namunadagi ism-shariflar kodda yoʻq — imzo chekuvchilar shtatdan tanlanadi.
        // =====================================================================
        const KN52: any = window as any;
        var KN_REG = 'agmk_kn_reg', KN_AKT = 'agmk_kn_akt', KN_SIG = 'agmk_kn_sig';
        try { if (KN52.KV_SYNC && Array.isArray(KN52.KV_SYNC.keys)) [KN_REG, KN_AKT].forEach(k => { if (!KN52.KV_SYNC.keys.includes(k)) KN52.KV_SYNC.keys.push(k); }); } catch (e) { /* */ }
        var KN_OY = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        var KN_OYU = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        var KNS: any = { y: '', f: null, chk: null, view: null };
        function knE(s: any): string { return KN52.escapeHtml(String(s == null ? '' : s)); }
        function knN(v: any): number { if (typeof v === 'number') return isFinite(v) ? v : 0; const s = String(v == null ? '' : v).trim(); if (/^=?[\d\s.+]+$/.test(s) && /\d/.test(s)) return s.replace(/^=/, '').split('+').reduce((a, x) => a + (+x.replace(/\s/g, '') || 0), 0); const n = +s.replace(/\s/g, '').replace(',', '.'); return isFinite(n) ? n : 0; }
        function knDmy(iso: any): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); }
        function knMonOf(s: string): number { const t = String(s || '').toLowerCase(); const S = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']; const L = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek']; let i = S.findIndex(p => t.indexOf(p) === 0); if (i < 0 && t.indexOf('мая') === 0) i = 4; if (i < 0) i = L.findIndex(p => t.indexOf(p) === 0); return i; }
        // ---------- nomlarni solishtirish (kirill/lotin aralash, qoʻshimchalar: «колодкалари» = «колодка») ----------
        var KN_LAT: any = { a: 'а', c: 'с', e: 'е', k: 'к', o: 'о', p: 'р', x: 'х', y: 'у', m: 'м', t: 'т', h: 'н', b: 'в' };
        var KN_STOP = /^(вагон|учун|мўлжал|типид|дона|ларнинг|лари|маркал|сборе|ва|шт|усл)/;
        function knWords(s: any): any { const w: string[] = [], n: string[] = [];
            String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/(\d)([а-яa-zўқғҳ])/g, '$1 $2').replace(/([а-яa-zўқғҳ])(\d)/g, '$1 $2').split(/[^a-zа-яўқғҳ0-9]+/).forEach(x => {
                if (!x) return; if (/^\d+$/.test(x)) { if (x.length >= 3) n.push(x.replace(/^0+(?=\d)/, '')); return; }
                if (/[а-яўқғҳ]/.test(x)) x = x.replace(/[a-z]/g, (c: string) => KN_LAT[c] || c);
                if (x.length >= 4 && !KN_STOP.test(x)) w.push(x); });
            return { w: w, n: n }; }
        function knWEq(a: string, b: string): boolean { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; const s = Math.min(a.length, b.length); return i >= Math.min(s, 8) || (i >= 5 && a.length - i <= 3 && b.length - i <= 3); }
        function knScore(a: any, b: any): number { const A = knWords(a), B = knWords(b); let s = 0; A.w.forEach((x: string) => { if (B.w.some((y: string) => knWEq(x, y))) s++; }); A.n.forEach((x: string) => { if (B.n.indexOf(x) >= 0) s++; }); return s; }
        /** akt nomi → roʻyxat qatori: mos soʻzlar + bosh soʻz (birinchi ot) mos boʻlsa +2, qatordagi ortiqcha soʻz −0,5 */
        function knRowScore(a: any, b: any): number { const s = knScore(a, b); if (!s) return 0; const A = knWords(a), B = knWords(b); const head = A.w[0] && B.w[0] && knWEq(A.w[0], B.w[0]) ? 2 : 0; const extra = B.w.filter((y: string) => !A.w.some((x: string) => knWEq(x, y))).length; return s + head - 0.5 * extra; }
        function knRowKey(r: any): string { return String(r.name || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim(); }
        function knRows(y: string): any[] { const R = knRegY(y), out: any[] = []; if (R) R.groups.forEach((g: any, gi: number) => g.rows.forEach((r: any, ri: number) => out.push({ g: gi, r: ri, row: r, grp: g.name }))); return out; }
        function knMatch(y: string, name: string): any { let best: any = null, bs = 0, nb = 0; const own = knWords(name).w.length + knWords(name).n.length;
            knRows(y).forEach(x => { const s = knScore(name, x.row.name) ? knRowScore(name, x.row.name) : 0; if (s > bs) { bs = s; best = x; nb = 1; } else if (s === bs && s > 0) nb++; });
            const hd = (x: any) => { const A = knWords(name).w, B = knWords(x).w; return !!(A[0] && B[0] && knWEq(A[0], B[0])); };
            return best && (knScore(name, best.row.name) >= 2 || (knScore(name, best.row.name) >= 1 && (own <= 1 || hd(best.row.name)))) && bs > 0 ? Object.assign({ sc: bs, tie: nb > 1 }, best) : null; }
        // ---------- Roʻyxat (reestr) ----------
        function knReg(): any { return KN52.kvGet(KN_REG, null) || { years: {} }; }
        function knRegY(y: string): any { return knReg().years[y] || null; }
        function knRegSet(R: any): void { KN52.kvSet(KN_REG, R); }
        function knParseSheet(sn: string, rows: any[][]): any {
            let hi = -1; for (let i = 0; i < Math.min(rows.length, 15); i++) { const t = (rows[i] || []).map((c: any) => String(c || '').toLowerCase()); if (t.some((c: string) => /қисм номи|кисм номи|номи/.test(c)) && t.filter((c: string) => knMonOf(c) >= 0).length >= 6) { hi = i; break; } }
            if (hi < 0) return null; const H = rows[hi].map((c: any) => String(c || '').toLowerCase().trim());
            const ci = (re: RegExp) => H.findIndex((c: string) => re.test(c)), cN = ci(/номи/), cP = ci(/миқдори|микдори/), cU = ci(/бирлиги/), cO = ci(/буюртма/), cR = ci(/нархи/);
            const cM: number[] = []; H.forEach((c: string, i: number) => { const m = knMonOf(c); if (m >= 0 && cM[m] === undefined && !/умумий/.test(c)) cM[m] = i; });
            let y = (String(sn).match(/^\s*(20\d\d)\s*$/) || [])[1] || ''; if (!y) for (let i = 0; i < hi; i++) { const m = (rows[i] || []).join(' ').match(/(20\d\d)\s*йил/); if (m) { y = m[1]; break; } }
            const title = (rows.slice(0, hi).map(r => (r || []).filter((c: any) => String(c || '').trim()).join(' ')).find(t => t.trim()) || '').trim();
            const groups: any[] = []; let g: any = null;
            for (let i = hi + 1; i < rows.length; i++) {
                const r = rows[i] || [], nm = String(r[cN] == null ? '' : r[cN]).trim(), first = String(r.find((c: any) => String(c || '').trim()) || '').trim();
                if (/^жами|^умумий/i.test(first)) { if (/умумий/i.test(first)) break; continue; }
                const nums = cM.map(k => knN(r[k])), plan = knN(r[cP]);
                if (nm && !/^\d+$/.test(nm) && (plan || nums.some(x => x))) { if (!g) { g = { name: '', rows: [] }; groups.push(g); } g.rows.push({ id: 'r' + i, n: String(r[0] || '').trim(), name: nm, plan: plan, unit: String(r[cU] || 'шт').trim(), m: nums, oy: cO >= 0 ? String(r[cO] || '').trim() : '', price: cR >= 0 ? knN(r[cR]) : 0 }); continue; }
                if (first && /буюртма|бўйича|буйича/i.test(first) && r.filter((c: any) => String(c || '').trim()).length === 1) { g = { name: first, rows: [] }; groups.push(g); }
            }
            const rc = groups.reduce((a, x) => a + x.rows.length, 0); return rc && y ? { y: y, title: title, groups: groups.filter(x => x.rows.length), sheet: sn } : null;
        }
        async function knImport(inp: any): Promise<void> {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            let bk: any; try { void KN52.XLSX; bk = await KN52.hpReadBook(f); } catch (e) { KN52.alert('⚠️ ' + (KN52.agmkErrUz ? KN52.agmkErrUz(e) : e)); return; }
            const P: any = {}; (bk || []).forEach((sh: any) => { const p = knParseSheet(sh.s, sh.rows); if (!p) return; const exact = /^\s*20\d\d\s*$/.test(sh.s); if (!P[p.y] || (exact && !P[p.y].exact)) P[p.y] = Object.assign(p, { exact: exact }); });
            const ys = Object.keys(P).sort(); if (!ys.length) { KN52.alert('⚠️ Faylda «Эҳтиёт қисм номи · Миқдори · январ … декабр» sarlavhali jadval topilmadi.'); return; }
            const R = knReg(); const old = ys.filter(y => R.years[y]);
            if (!(await KN52.uiConfirm('📥 ' + f.name + '\n' + ys.map(y => y + '-yil: ' + P[y].groups.reduce((a: number, g: any) => a + g.rows.length, 0) + ' ta qism').join('\n') + (old.length ? '\n\n' + old.join(', ') + '-yil roʻyxati shu fayl bilan almashtiriladi.' : '')))) return;
            ys.forEach(y => { const p = P[y]; R.years[y] = { title: p.title, groups: p.groups, file: f.name, sheet: p.sheet, at: new Date().toISOString(), by: KN52.authorStr() }; });
            knRegSet(R); KNS.y = ys[ys.length - 1]; try { KN52.showToast('✅ Roʻyxat yuklandi: ' + ys.join(', ')); } catch (e) { /* */ } knRefresh();
        }
        function knRegOut(): void {
            const y = KNS.y, R = knRegY(y); if (!R) return; const H = ['№', 'Эҳтиёт қисм номи', 'Миқдори', 'Бирлиги'].concat(KN_OY.map(m => m.replace(/ь$/, ''))).concat(['Умумий келгани', 'Қайси йилнинг буюртмаси билан', 'УМТСга келмагани']);
            const rows: any[] = [[R.title || (y + ' йилда вагонлар учун УМТСда қабул қилинган эҳтиёт қисмлар рўйхати')], H];
            R.groups.forEach((g: any) => { if (g.name) rows.push([g.name]); g.rows.forEach((r: any, k: number) => { const s = r.m.reduce((a: number, x: number) => a + x, 0); rows.push([r.n || k + 1, r.name, r.plan, r.unit].concat(r.m.map((x: number) => x || '')).concat([s || '', r.oy, r.plan ? r.plan - s : ''])); }); });
            try { const b = KN52.fotXlsxBook([{ name: String(y), rows: rows, head: 1, w: [5, 46, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 10, 12, 11] }]); const f = { name: 'Ehtiyot_qismlar_qabul_' + y + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: b }; if (KN52.exOpen) KN52.exOpen([f], { title: 'Qabul qilingan ehtiyot qismlar — ' + y, act: 'dl' }); else KN52.docDownload([f]); } catch (e) { console.error(e); KN52.alert('⚠️ ' + String((e as any) && (e as any).message || e)); }
        }
        function knRowEdit(gi: number, ri: number): void {
            const R = knRegY(KNS.y), r = R && R.groups[gi] && R.groups[gi].rows[ri]; if (!r) return;
            const A = knAkts().filter(a => String(a.sana).slice(0, 4) === KNS.y), lst: string[] = [];
            A.forEach(a => (a.items || []).forEach((it: any) => { const m = knMatch(KNS.y, it.name); if (m && m.g === gi && m.r === ri) lst.push(knDmy(a.sana) + ' · ' + it.q + ' ' + (it.unit || 'дона') + ' · ' + a.sup); }));
            KN52.mdl('knRow', `<div class="px-h"><b>${knE(r.name)}</b><button class="mini-btn" onclick="mdlClose('knRow')">✕</button></div>
                <div class="nd-tip">Reja: ${knE(r.plan)} ${knE(r.unit)} · keldi: ${r.m.reduce((a: number, x: number) => a + x, 0)} · buyurtma yili: ${knE(r.oy || '—')}</div>
                <div class="kn-mg">${KN_OYU.map((m, k) => `<label class="kq-l">${m}<input type="number" min="0" id="knm${k}" value="${r.m[k] || ''}"></label>`).join('')}</div>
                <div class="kq-h">Dalolatnomalar (${lst.length})</div>${lst.map(t => `<div class="nd-tip">📄 ${knE(t)}</div>`).join('') || '<div class="nd-tip">Bu qism boʻyicha ilovada akt yoʻq.</div>'}
                <div class="nv-btns"><button onclick="knRowSave(${gi},${ri})">💾 Saqlash</button></div>`, true);
        }
        function knRowSave(gi: number, ri: number): void { const Rg = knReg(), r = Rg.years[KNS.y].groups[gi].rows[ri]; r.m = KN_OY.map((x, k) => knN((KN52.$id('knm' + k) || {}).value)); knRegSet(Rg); KN52.mdlClose('knRow'); knRefresh(); }
        // ---------- Dalolatnoma ----------
        function knAkts(): any[] { return KN52.kvGet(KN_AKT, null) || []; }
        function knSig(): any { return KN52.kvGet(KN_SIG, null) || { ap: { l: 'СТТБ бош муҳандиси', n: '' }, km: [{ l: 'ИЧТБ бошлиғи', n: '' }, { l: 'ВХ бошлиғи ўринбосари', n: '' }, { l: 'ИЧТБ вагонлар бўйича муҳандиси', n: '' }, { l: 'Ускуналар ва материаллар комплектацияси бўйича муҳандиси', n: '' }] }; }
        function knNew(id?: string): void {
            const a = id ? knAkts().find(x => x.id === id) : null, S = knSig();
            KNS.f = a ? JSON.parse(JSON.stringify(a)) : { id: 'kn' + Date.now().toString(36), sana: KN52.todayISO(), sup: '', org: 'МЧЖ', pur: '2ВС-105 типидаги вагонлар учун мўлжалланган', std: 'чизмага', items: [{ name: '', q: '', unit: 'дона' }], rej: [], ap: S.ap, km: S.km, reg: true };
            knForm();
        }
        function knForm(): void {
            const f = KNS.f, y = String(f.sana).slice(0, 4), R = knRows(y), sups = Array.from(new Set(knAkts().map(a => a.sup).filter(Boolean)));
            const it = (L: any[], key: string, rej: boolean) => L.map((x: any, k: number) => { const m = x.name ? knMatch(y, x.name) : null;
                return `<div class="bg-d"><label class="kq-l">Nomi<input list="knNames" value="${knE(x.name)}" onchange="KNS.f.${key}[${k}].name=this.value;knForm()"></label>
                <div class="h8-row"><label class="kq-l">Soni<input type="number" min="0" value="${knE(x.q)}" onchange="KNS.f.${key}[${k}].q=this.value"></label><label class="kq-l">Birlik<input value="${knE(x.unit || 'дона')}" onchange="KNS.f.${key}[${k}].unit=this.value"></label></div>
                ${rej ? `<label class="kq-l">Aniqlangan nuqsonlar<textarea rows="2" onchange="KNS.f.rej[${k}].why=this.value" placeholder="4 дона … ёриқлар ва ўйиқлар мавжуд эканлиги">${knE(x.why || '')}</textarea></label>` : ''}
                <small>${x.name ? (m ? '📋 Roʻyxatda: ' + knE(m.row.name) + (m.tie ? ' (⚠️ bir nechtasiga oʻxshaydi)' : '') : (R.length ? '⚠️ ' + y + '-yil roʻyxatida topilmadi' : '')) : ''}</small>
                ${L.length > 1 || rej ? ` <button class="mini-btn" onclick="KNS.f.${key}.splice(${k},1);knForm()">✕</button>` : ''}</div>`; }).join('');
            const sg = (p: any, k: number) => `<div class="kn-sg"><span><b>${knE(p.l)}</b><br>${knE(p.n || '— tanlanmagan —')}</span><span><button class="mini-btn" onclick="knSigPick(${k})">✎</button>${k > 0 ? `<button class="mini-btn" onclick="knSigMv(${k})">▲</button><button class="mini-btn" onclick="KNS.f.km.splice(${k - 1},1);knForm()">✕</button>` : ''}</span></div>`;
            KN52.mdl('knF', `<div class="px-h"><b>📦 Kirish nazorati — dalolatnoma</b><button class="mini-btn" onclick="mdlClose('knF')">✕</button></div>
                <datalist id="knNames">${R.map(x => `<option value="${knE(x.row.name)}">`).join('')}</datalist><datalist id="knSups">${sups.map(s => `<option value="${knE(s)}">`).join('')}</datalist>
                <label class="kq-l">Sana<input type="date" value="${knE(String(f.sana).slice(0, 10))}" onchange="KNS.f.sana=this.value;knForm()"></label>
                <div class="h8-row"><label class="kq-l">Yetkazib beruvchi<input list="knSups" value="${knE(f.sup)}" placeholder="TOP PROJECT" onchange="KNS.f.sup=this.value"></label><label class="kq-l">Shakli<select onchange="KNS.f.org=this.value">${['МЧЖ', 'ООО', 'АЖ', 'ХК'].map(o => `<option${o === f.org ? ' selected' : ''}>${o}</option>`).join('')}</select></label></div>
                <label class="kq-l">Nima uchun moʻljallangan<input value="${knE(f.pur)}" onchange="KNS.f.pur=this.value" placeholder="2ВС-105 типидаги вагонлар учун мўлжалланган"></label>
                <label class="kq-l">Nimaga mos (chizma / GOST)<input value="${knE(f.std)}" onchange="KNS.f.std=this.value" placeholder="чизмага · ГОСТ 33421-2015 га · 522.00.00 чизмасига"></label>
                <div class="kq-h">✅ Qabul qilindi (soz)</div>${it(f.items, 'items', false)}<button class="kq-add" onclick="KNS.f.items.push({name:'',q:'',unit:'дона'});knForm()">➕ Qism qoʻshish</button>
                <div class="kq-h">❌ Yaroqsiz deb topildi ${f.rej.length ? '' : '(yoʻq)'}</div>${it(f.rej, 'rej', true)}<button class="kq-add" onclick="KNS.f.rej.push({name:'',q:'',unit:'дона',why:''});knForm()">➕ Yaroqsiz qism (alohida dalolatnoma)</button>
                <div class="kq-h">✍️ Tasdiqlovchi</div>${sg(f.ap, 0)}
                <div class="kq-h">👥 Komissiya</div>${f.km.map((p: any, k: number) => sg(p, k + 1)).join('')}<button class="kq-add" onclick="KNS.f.km.push({l:'',n:''});knSigPick(KNS.f.km.length)">➕ Aʼzo qoʻshish</button>
                <label class="kn-ck"><input type="checkbox" ${f.reg ? 'checked' : ''} onchange="KNS.f.reg=this.checked"> Qabul qilingan sonini roʻyxatga (${KN_OYU[+String(f.sana).slice(5, 7) - 1] || ''} ustuniga) qoʻshish</label>
                <div class="nv-btns"><button onclick="knSave()">💾 Saqlash va koʻrish</button></div>`, true);
        }
        function knSigPick(k: number): void { const f = KNS.f; KN52.agmkPickPerson(k === 0 ? '✍️ Tasdiqlovchi' : '👥 Komissiya aʼzosi', (p0: any) => { const c = (t: any, nm?: boolean) => { const v = String(t || ''); return typeof KN52.tlL2C === 'function' && /[a-z]/i.test(v) ? KN52.tlL2C(v, nm) : v; }, p = { l: c(p0.l), n: c(p0.n, true) }; if (k === 0) f.ap = { l: p.l || f.ap.l, n: p.n }; else f.km[k - 1] = { l: p.l || (f.km[k - 1] || {}).l || '', n: p.n }; knForm(); }, 'uz'); }
        function knSigMv(k: number): void { const L = KNS.f.km, i = k - 1; if (i < 1) return; const t = L[i]; L[i] = L[i - 1]; L[i - 1] = t; knForm(); }
        function knRegApply(a: any, sign: number): void {
            if (!a || !a.regAdd || !a.regAdd.length) return; const R = knReg();
            a.regAdd.forEach((x: any) => { try { const r = R.years[x.y].groups[x.g].rows[x.r]; if (r) r.m[x.mi] = Math.max(0, (r.m[x.mi] || 0) + sign * x.q); } catch (e) { /* */ } });
            knRegSet(R);
        }
        function knSave(): void {
            const f = KNS.f; f.items = f.items.filter((x: any) => x.name || x.q); f.rej = f.rej.filter((x: any) => x.name || x.q);
            if (!f.sup || (!f.items.length && !f.rej.length)) { if (!f.items.length) f.items = [{ name: '', q: '', unit: 'дона' }]; KN52.alert('Yetkazib beruvchi va kamida bitta qismni kiriting.'); return; }
            const L = knAkts(), old = L.find(x => x.id === f.id); if (old) knRegApply(old, -1);
            const y = String(f.sana).slice(0, 4), mi = +String(f.sana).slice(5, 7) - 1; f.regAdd = [];
            if (f.reg) f.items.forEach((x: any) => { const m = knMatch(y, x.name), q = knN(x.q); if (m && q) f.regAdd.push({ y: y, g: m.g, r: m.r, mi: mi, q: q }); });
            f.at = new Date().toISOString(); f.by = KN52.authorStr();
            const N = L.filter(x => x.id !== f.id); N.unshift(JSON.parse(JSON.stringify(f))); KN52.kvSet(KN_AKT, N.slice(0, 1000)); knRegApply(f, 1);
            KN52.kvSet(KN_SIG, { ap: f.ap, km: f.km });
            KN52.mdlClose('knF'); try { KN52.showToast('💾 Saqlandi' + (f.regAdd.length ? ' · roʻyxatga qoʻshildi' : '')); } catch (e) { /* */ } knView(f.id);
        }
        async function knDel(id: string): Promise<void> { const L = knAkts(), a = L.find(x => x.id === id); if (!a || !(await KN52.uiConfirm('Dalolatnoma oʻchirilsinmi?' + (a.regAdd && a.regAdd.length ? '\nRoʻyxatga qoʻshilgan soni ham ayriladi.' : '')))) return; knRegApply(a, -1); KN52.kvSet(KN_AKT, L.filter(x => x.id !== id)); KN52.mdlClose('knV'); knRefresh(); }
        function knList(L: any[]): string { const s = L.map((x: any) => (x.q ? x.q + ' ' + (x.unit || 'дона') + ' ' : '') + x.name); return s.length > 1 ? s.slice(0, -1).join(', ') + ' ва ' + s[s.length - 1] : s.join(''); }
        function knNames(L: any[]): string { const s = L.map((x: any) => x.name); return s.length > 1 ? s.slice(0, -1).join(', ') + ' ва ' + s[s.length - 1] : s.join(''); }
        function knHtml(a: any, rej: boolean): string {
            const d = String(a.sana).slice(0, 10).split('-'), oy = KN_OY[+d[1] - 1] || '', sup = '«' + a.sup + '» ' + (a.org || 'МЧЖ'), L = rej ? a.rej : a.items, pur = a.pur ? a.pur + ' ' : '';
            const who = a.km.map((p: any) => ((p.l || '') + ' ' + (p.n || '')).trim()).filter(Boolean).join(', '), suf = (t: string) => /[а-яўқғҳ]$/.test(t) ? t + 'нинг' : t + ' нинг';
            const body = rej ? `Биз қуйида имзо чекувчилар: ${who} тузилаётган далолатнома шу ҳақидаки, ${sup} дан қабул қилиб олинган ${pur}${knList(L)} техник кўрикдан ўтказилди. Текширув жараёнида ${L.map((x: any) => x.why).filter(Boolean).join('; ') || '…'} аниқланди.`
                : `Биз қуйида имзо чекувчилар: ${who} тузилаётган далолатнома шу ҳақидаки, ${sup} дан қабул қилиб олинган ${pur}${knList(L)} техник кўрикдан ўтказилди ва ${a.std || 'чизмага'} геометрик ўлчамлари мос келиши аниқланди. Ҳолати янги ва ҳеч қандай носозликлар аниқланмади.`;
            const xul = rej ? `${sup} томонидан келган ${pur}${knList(L)} СТТБга мос эмаслиги ва яроқсиз деб топилди.` : `${sup} дан қабул қилиб олинган ${pur}${knList(L)} соз ҳолатда ва ишлаш сифати эксплуатация даврида аниқланади.`;
            return `<div class="kn-akt" style="font-family:'Times New Roman',serif;font-size:13pt;color:#000;line-height:1.35">
                <div style="margin-left:50%">«ТАСДИҚЛАЙМАН»<br>${knE(a.ap.l)}<br>__________ ${knE(a.ap.n)}<br>« ____» ${knE(oy)} ${knE(d[0])}-йил.</div>
                <div style="display:flex;justify-content:space-between;margin:14px 0 10px"><span>Олмалиқ ш.</span><span>«${knE(d[2])}» ${knE(oy)} ${knE(d[0])}-йил.</span></div>
                <div style="text-align:center;font-weight:bold">${knE(sup)} ${rej ? 'томонидан келган' : 'дан қабул қилиб олинган'} ${knE(pur)}${knE(suf(knNames(L)))} техник ҳолати тўғрисида${rej ? 'ги' : ''}</div>
                <div style="text-align:center;font-weight:bold;margin:6px 0 10px">Далолатнома</div>
                <p style="text-indent:36px;text-align:justify">${knE(body)}</p><p style="text-indent:36px;text-align:justify"><b>Хулоса:</b> ${knE(xul)}</p>
                <table style="width:100%;margin-top:22px;border:0">${a.km.map((p: any) => `<tr><td style="border:0;padding:6px 0">${knE(p.l)}</td><td style="border:0;text-align:right">${knE(p.n)}</td></tr>`).join('')}</table></div>`;
        }
        function knView(id: string): void {
            const a = knAkts().find(x => x.id === id); if (!a) { knRefresh(); return; } KNS.view = id;
            const H = (a.items.length ? knHtml(a, false) : '') + (a.rej.length ? (a.items.length ? '<div style="page-break-before:always;break-before:page;height:16px"></div>' : '') + knHtml(a, true) : '');
            KN52.mdl('knV', `<div class="px-h"><b>📄 ${knE(knDmy(a.sana))} · ${knE(a.sup)}</b><button class="mini-btn" onclick="mdlClose('knV');knRefresh()">✕</button></div>
                <div class="nd-tip">Matnni shu yerda tuzatish mumkin — PDF / Word tuzatilgani bilan chiqadi.${a.regAdd && a.regAdd.length ? ' · 📋 Roʻyxatga qoʻshildi: ' + a.regAdd.map((x: any) => x.q).join(' + ') + ' (' + KN_OYU[a.regAdd[0].mi] + ')' : ''}</div>
                <div class="kn-paper" id="knPage" contenteditable="true">${H}</div>
                <div class="nv-btns"><button onclick="knOut('pdf')">📄 PDF</button><button onclick="knOut('docx')">📝 Word</button><button onclick="mdlClose('knV');knNew('${knE(a.id)}')">✏️ Tahrirlash</button><button style="background:#b91c1c" onclick="knDel('${knE(a.id)}')">🗑</button></div>`, true);
        }
        function knOut(kind: string): void {
            const a = knAkts().find(x => x.id === KNS.view), p = KN52.$id('knPage'); if (!a || !p) return; const base = 'Dalolatnoma_kirish_' + String(a.sana).slice(0, 10) + '_' + String(a.sup).replace(/[^A-Za-z0-9А-Яа-яЎўҚқҒғҲҳ]+/g, '_').slice(0, 30);
            try { const f = kind === 'pdf' ? { name: base + '.pdf', mime: 'application/pdf', blob: KN52.pdfBlobFromHtml(p.innerHTML) } : { name: base + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: KN52.docxFromHtml(p.innerHTML) };
                if (KN52.exOpen) KN52.exOpen([f], { title: 'Kirish nazorati dalolatnomasi', act: 'dl' }); else KN52.docDownload([f]); } catch (e) { console.error(e); KN52.alert('⚠️ ' + String((e as any) && (e as any).message || e)); }
        }
        // ---------- Oʻzaro tekshiruv ----------
        function knItems(s: string): any[] { const out: any[] = []; const re = /(\d[\d\s]*?)\s*дона\s+(.+?)(?=,\s*\d+\s*дона|\s+ва\s+\d+\s*дона|\s+техник\s+кўрик|\s+соз\s+ҳолат|\s+СТТБга|\s*$)/gi; let m: any;
            while ((m = re.exec(s))) out.push({ q: +m[1].replace(/\s/g, ''), name: m[2].replace(/[\s,.;]+$/, '').replace(/(ларни(нг)?|ларнинг|лари)$/i, '').trim() }); return out; }
        function knParseText(t: string, name: string): any[] {
            const parts = String(t || '').split(/(?=«?\s*ТАСДИҚЛАЙМАН)/).filter(p => /Далолатнома/i.test(p)), out: any[] = [];
            (parts.length ? parts : [t]).forEach((p, k) => {
                const s = p.replace(/\s+/g, ' '), dm = s.match(/Олмалиқ ш\.?\s*[“"«]?\s*(\d{1,2}|_+)?\s*[”"»]?\s*([А-Яа-яЎўҚқҒғҲҳ]+)\s*(\d{4})/);
                let fd = ''; String(name).replace(/(\d{1,2})\.(\d{2})\.(\d{2,4})(?!\d)/g, (m0: string, d: string, mo: string, yy: string) => { if (+d >= 1 && +d <= 31 && +mo >= 1 && +mo <= 12) fd = (yy.length === 2 ? '20' + yy : yy) + '-' + mo + '-' + d.padStart(2, '0'); return m0; });
                const mi = dm ? knMonOf(dm[2]) : -1, noDay = !!dm && !/\d/.test(dm[1] || ''), ym = dm && mi >= 0 ? dm[3] + '-' + String(mi + 1).padStart(2, '0') : '';
                const sana = ym ? ym + '-' + (noDay ? (fd.slice(0, 7) === ym ? fd.slice(8) : '01') : dm![1].padStart(2, '0')) : '';
                const sanaM = sana && fd && fd.slice(5, 7) === sana.slice(5, 7) && fd.slice(0, 4) !== sana.slice(0, 4) ? fd : sana;
                const sm = s.match(/«\s*([^»]+?)\s*»\s*(МЧЖ|ООО|OOO|MCHJ|АЖ)/i), bi = s.search(/шу ҳа[қк]/i), xi = s.search(/Хулоса\s*:/i);
                const body = bi >= 0 ? s.slice(bi, xi > bi ? xi : undefined) : '', bodyI = body.split(/техник\s+кўрик/i)[0], xul = xi >= 0 ? s.slice(xi) : '';
                const rej = /яроқсиз|мос эмас/i.test(xul), its = knItems(bodyI), xits = knItems(xul.replace(/^Хулоса\s*:\s*/i, ''));
                const hm = body.match(/\.\s*([^.]{0,80}?)\s+ҳолати\s+янги/i);
                out.push({ src: name + (parts.length > 1 ? ' (' + (k + 1) + '-akt)' : ''), file: name, sana: sanaM, sanaT: sana, fd: fd, noDay: noDay, sup: sm ? sm[1] : '', items: rej ? [] : its, rej: rej ? its : [], xits: xits, holat: hm ? hm[1].trim() : '' });
            });
            return out;
        }
        async function knDocxText(file: any): Promise<string> {
            const z = await KN52.hsZipFiles(await file.arrayBuffer()); if (!z['word/document.xml']) throw new Error('Word (.docx) fayl emas'); const xml = new TextDecoder().decode(await z['word/document.xml']());
            const d = new DOMParser().parseFromString(xml, 'application/xml'), W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
            return Array.from(d.getElementsByTagNameNS(W, 'p')).map((p: any) => Array.from(p.getElementsByTagNameNS(W, 't')).map((t: any) => t.textContent).join('')).join('\n');
        }
        async function knChkFiles(inp: any): Promise<void> {
            const F = Array.from(inp.files || []) as any[]; inp.value = ''; const A: any[] = KNS.chk || [];
            for (const f of F) { if (A.some(a => a.file === f.name)) continue; try { knParseText(await knDocxText(f), f.name).forEach(x => A.push(x)); } catch (e) { A.push({ src: f.name, file: f.name, err: String((e as any) && (e as any).message || e) }); } }
            KNS.chk = A; if (!KNS.y) { const y = A.map(a => String(a.sana || '').slice(0, 4)).filter(Boolean).sort().pop(); if (y) KNS.y = y; } knChk();
        }
        function knCheck(y: string, up: any[]): any[] {
            const out: any[] = [], add = (lvl: string, t: string) => out.push({ lvl: lvl, t: t }), R = knRegY(y);
            const app = knAkts().filter(a => String(a.sana).slice(0, 4) === y).map(a => ({ src: '📱 ' + knDmy(a.sana) + ' ' + a.sup, sana: String(a.sana).slice(0, 10), sup: a.sup, items: a.items.map((x: any) => ({ q: knN(x.q), name: x.name })), rej: a.rej.map((x: any) => ({ q: knN(x.q), name: x.name })), app: 1 }));
            const sig = (a: any) => a.sana + '|' + knWords(a.sup).w.join(' ') + '|' + a.items.map((x: any) => x.q).sort().join(',') + '|' + a.rej.map((x: any) => x.q).sort().join(','), sigs = (a: any) => [sig(a), sig({ sana: a.sana, sup: a.sup, items: a.items, rej: [] }), sig({ sana: a.sana, sup: a.sup, items: [], rej: a.rej })];
            (up || []).filter(a => a.err).forEach(a => add('blue', '📄 ' + a.src + ': oʻqilmadi (' + a.err + ')'));
            const U = (up || []).filter(a => !a.err && String(a.sana || '').slice(0, 4) === y && !app.some(p => sigs(p).indexOf(sig(a)) >= 0));
            (up || []).filter(a => !a.err && !a.sana).forEach(a => add('blue', '📄 ' + a.src + ': sana topilmadi («Олмалиқ ш. “dd” oy yyyy»)'));
            const A = app.concat(U);
            // akt ichidagi tekshiruvlar
            (up || []).filter(a => !a.err && a.sana && !app.some(p => sigs(p).indexOf(sig(a)) >= 0)).forEach(a => {
                if (a.noDay) add('red', `${a.src}: sanada kun yozilmagan («__» ${KN_OY[+String(a.sanaT).slice(5, 7) - 1] || ''} ${String(a.sanaT).slice(0, 4)})${a.fd ? ' — fayl nomi boʻyicha ' + knDmy(a.fd) + ' deb olindi' : ''}`);
                else if (a.fd && a.fd !== a.sanaT) add(a.fd.slice(0, 7) === String(a.sanaT).slice(0, 7) ? 'blue' : 'red', `${a.src}: fayl nomidagi sana ${knDmy(a.fd)}, matnda ${knDmy(a.sanaT)}${a.sana !== a.sanaT ? ' (yil xatosi boʻlsa kerak — ' + knDmy(a.sana) + ' deb olindi)' : ''}`);
                if (String(a.sana).slice(0, 4) !== y) return;
                const b = a.items.concat(a.rej).map((x: any) => x.q).sort().join(','), x = a.xits.map((z: any) => z.q).sort().join(',');
                if (a.xits.length && b !== x) add('red', `${a.src}: asosiy matnda ${b || '—'} dona, xulosada ${x} dona — mos emas`);
                if (a.holat && !/^(хамда|ҳамда|уларнинг|барча)$/i.test(a.holat) && knWords(a.holat).w.length && !a.items.concat(a.rej).some((it: any) => knScore(a.holat, it.name) > 0)) add('red', `${a.src}: «${a.holat} ҳолати янги» — bu aktdagi qism (${a.items.map((z: any) => z.name).join(', ')}) emas; boshqa aktdan nusxa qolgan boʻlishi mumkin`);
                if (!a.items.length && !a.rej.length) add('blue', `${a.src}: qismlar soni («… дона …») topilmadi`);
            });
            const nums = Array.from(new Set((up || []).map(a => +((String(a.file).match(/^\s*(\d+)\s*\./) || [])[1] || 0)).filter(n => n > 0))).sort((p: any, q: any) => p - q) as number[];
            if (nums.length > 2) { const miss: number[] = []; for (let i = nums[0]; i <= nums[nums.length - 1]; i++) if (nums.indexOf(i) < 0) miss.push(i); if (miss.length) add('blue', `Fayl raqamlarida oraliq: ${miss.join(', ')}-raqamli dalolatnoma(lar) yuklanmagan`); }
            A.forEach(a => a.rej.forEach((x: any) => add('blue', `${a.src}: ${x.q} dona ${x.name} — yaroqsiz deb topilgan (roʻyxatga qoʻshilmasligi kerak)`)));
            if (!R) { add('blue', y + '-yil roʻyxati ilovada yoʻq — «📥 Roʻyxatni Excel dan yuklash». Hozir faqat dalolatnomalar tekshirildi.'); return out; }
            // akt → roʻyxat qatori, oy boʻyicha
            const cell: any = {}, hit: any = {};
            A.forEach(a => { const mi = +String(a.sana).slice(5, 7) - 1; a.items.forEach((x: any) => { const m = knMatch(y, x.name); if (!m) { add('blue', `${a.src}: «${x.name}» (${x.q} dona) — ${y}-yil roʻyxatida topilmadi`); return; } const k = knRowKey(m.row); (cell[k] = cell[k] || [])[mi] = ((cell[k] || [])[mi] || 0) + x.q; (hit[k] = hit[k] || []).push({ a: a, mi: mi, q: x.q }); }); });
            R.groups.forEach((g: any, gi: number) => {
                const seen: any = {}; g.rows.forEach((r: any, ri: number) => {
                    const k = knRowKey(r), C = cell[k] || [], nm = k, tot = r.m.reduce((s: number, x: number) => s + x, 0);
                    if (seen[nm]) { add('blue', `📋 «${r.name}» roʻyxatda ikki marta (${seen[nm]} va ${r.n || ri + 1}-qator) — biri «левая» boʻlishi kerakmi?`); return; } seen[nm] = r.n || String(ri + 1); const RM = KN_OY.map((z, mi) => R.groups.reduce((s0: number, g2: any) => s0 + g2.rows.filter((r2: any) => knRowKey(r2) === k).reduce((s1: number, r2: any) => s1 + (r2.m[mi] || 0), 0), 0));
                    if (r.plan && tot > r.plan) add('blue', `📋 «${r.name}»: keldi ${tot}, buyurtma ${r.plan} ${r.unit} — rejadan ${tot - r.plan} ortiq`);
                    for (let mi = 0; mi < 12; mi++) {
                        const rv = RM[mi] || 0, av = C[mi] || 0; if (rv === av) continue;
                        if (!A.length) continue;
                        if (rv && !av) { const nb = [mi - 1, mi + 1].find(j => j >= 0 && j < 12 && (C[j] || 0) === rv && !(RM[j] || 0)); if (nb !== undefined) { const h = (hit[k] || []).find((z: any) => z.mi === nb); add('red', `📋 «${r.name}»: ${rv} ${r.unit} roʻyxatda ${KN_OYU[mi]} ustunida, dalolatnoma esa ${h ? knDmy(h.a.sana) : KN_OYU[nb]} (${KN_OYU[nb]})`); } else add('blue', `📋 «${r.name}»: ${KN_OYU[mi]} — ${rv} ${r.unit} keldi, dalolatnomasi topilmadi`); continue; }
                        if (av && !rv) { const nb = [mi - 1, mi + 1].find(j => j >= 0 && j < 12 && (RM[j] || 0) === av && !(C[j] || 0)); if (nb !== undefined) continue; const h = (hit[k] || []).filter((z: any) => z.mi === mi).map((z: any) => knDmy(z.a.sana) + ' ' + z.q).join(', '); add('red', `📋 «${r.name}»: dalolatnoma (${h}) bor, roʻyxatning ${KN_OYU[mi]} ustuni boʻsh`); continue; }
                        add('red', `📋 «${r.name}»: ${KN_OYU[mi]} — roʻyxatda ${rv}, dalolatnomalarda ${av} (${(hit[k] || []).filter((z: any) => z.mi === mi).map((z: any) => knDmy(z.a.sana) + ': ' + z.q).join(', ')})`);
                    }
                });
            });
            return out;
        }
        function knChk(): void {
            if (!KNS.y) KNS.y = String(new Date().getFullYear()); const up = KNS.chk || [], F = knCheck(KNS.y, up), red = F.filter(f => f.lvl === 'red').length;
            const nu = up.filter((a: any) => !a.err).length;
            KN52.mdl('knC', `<div class="px-h"><b>🔍 Oʻzaro tekshiruv · ${knE(KNS.y)}</b><button class="mini-btn" onclick="mdlClose('knC')">✕</button></div>
                <div class="nd-tip">Roʻyxat (${knRows(KNS.y).length} qism) ↔ ilovadagi dalolatnomalar (${knAkts().filter(a => String(a.sana).slice(0, 4) === KNS.y).length})${nu ? ' ↔ yuklangan ' + nu + ' ta dalolatnoma' : ''}.</div>
                <label class="alb-btn">📥 Dalolatnoma fayllarini qoʻshish (Word, bir nechta)<input type="file" multiple accept=".docx" style="display:none" onchange="knChkFiles(this)"></label>
                ${nu ? `<button class="kq-add" onclick="knChkKeep()">💾 Yuklangan dalolatnomalarni ilovaga saqlash (tarix uchun)</button>` : ''}
                <div class="kq-h">${F.length ? (red ? '❌ ' + red + ' ta xato · ' : '') + '🔷 ' + (F.length - red) + ' ta tekshirish kerak' : '✅ Nomuvofiqlik topilmadi'}</div>
                ${F.map(f => `<div class="nx-f ${f.lvl}">${f.lvl === 'red' ? '❌' : '🔷'} ${knE(f.t)}</div>`).join('')}`, true);
        }
        async function knChkKeep(): Promise<void> {
            const up = (KNS.chk || []).filter((a: any) => !a.err && a.sana && a.sup), L = knAkts(), S = knSig();
            const sig = (a: any) => String(a.sana).slice(0, 10) + '|' + knWords(a.sup).w.join(' ') + '|' + a.items.concat(a.rej).map((x: any) => knN(x.q)).sort().join(',');
            const add = up.filter((a: any) => !L.some(x => sig(x) === sig(a)));
            if (!add.length) { KN52.alert('Hammasi ilovada bor.'); return; }
            if (!(await KN52.uiConfirm(add.length + ' ta dalolatnoma ilovaga saqlansinmi? (roʻyxat ustunlari oʻzgarmaydi)'))) return;
            add.forEach((a: any, k: number) => L.unshift({ id: 'kn' + Date.now().toString(36) + k, sana: a.sana, sup: a.sup, org: 'МЧЖ', pur: '', std: 'чизмага', items: a.items.map((x: any) => ({ name: x.name, q: x.q, unit: 'дона' })), rej: a.rej.map((x: any) => ({ name: x.name, q: x.q, unit: 'дона', why: '' })), ap: S.ap, km: S.km, reg: false, regAdd: [], file: a.file, at: new Date().toISOString(), by: KN52.authorStr() }));
            KN52.kvSet(KN_AKT, L.slice(0, 1000)); KNS.chk = null; try { KN52.showToast('💾 ' + add.length + ' ta saqlandi'); } catch (e) { /* */ } knChk(); knRefresh();
        }
        // ---------- Boʻlim: «📄 Dalolatnomalar» → «📦 Kirish nazorati» ----------
        function knRefresh(): void { try { if (KN52.HS && KN52.HS.akt === 'kirish') KN52.hsRender(); } catch (e) { /* */ } }
        (function () {
            try { if (Array.isArray(KN52.HS_AKT) && !KN52.HS_AKT.some((c: any) => c.k === 'kirish')) KN52.HS_AKT.push({ k: 'kirish', ic: '📦', t: 'Kirish nazorati (qabul qilingan ehtiyot qismlar)', types: [] }); } catch (e) { /* */ }
            if (typeof KN52.hsRender === 'function') KN52.hsRender = KN52.agmkExtend('hsRender', '5.2: Kirish nazorati', KN52.hsRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try {
                    const HS = KN52.HS; if (!HS || HS.tab !== 'akt') return r; const b = KN52.secBody ? KN52.secBody('screen-hisob') : null; if (!b) return r;
                    if (!HS.akt) { b.querySelectorAll('.hs-grid .hs-card').forEach((c: any) => { if (/HS\.akt='kirish'/.test(c.getAttribute('onclick') || '')) { const s = c.querySelector('small'); if (s) s.textContent = knAkts().length + ' ta dalolatnoma · ' + Object.keys(knReg().years).length + ' yillik roʻyxat'; } }); return r; }
                    if (HS.akt !== 'kirish') return r;
                    const years = Array.from(new Set(Object.keys(knReg().years).concat(knAkts().map(a => String(a.sana).slice(0, 4))).filter(Boolean))).sort().reverse();
                    if (!KNS.y) KNS.y = years[0] || String(new Date().getFullYear());
                    const A = knAkts().filter(a => String(a.sana).slice(0, 4) === KNS.y).sort((p, q) => String(q.sana).localeCompare(String(p.sana))), R = knRegY(KNS.y);
                    const card = (oc: string, t: string) => `<div class="db-two" onclick="${oc}"><button class="action-btn" onclick="event.stopPropagation();${oc}">${t}</button></div>`;
                    const back = b.querySelector('.hs-back');
                    b.innerHTML = (back ? back.outerHTML : '') + `<div class="hs-new card-list h9-list">${card('knNew()', '➕ Yangi dalolatnoma — qabul qilingan qismlar')}${card('KNS.chk=null;knChk()', '🔍 Oʻzaro tekshiruv (roʻyxat ↔ dalolatnomalar)')}</div>
                        <div class="bg-seg nx-yr">${years.concat(years.indexOf(KNS.y) < 0 ? [KNS.y] : []).map(y => `<button class="${y === KNS.y ? 'on' : ''}" onclick="KNS.y='${y}';hsRender()">${y}</button>`).join('')}</div>
                        <div class="hs-box"><div class="hs-h">📄 Dalolatnomalar · ${knE(KNS.y)} (${A.length})</div>
                            ${A.length ? '<div class="hs-list">' + A.map(a => `<div class="hs-row" onclick="knView('${knE(a.id)}')"><b>${knE(knDmy(a.sana))} · ${knE(a.sup)}</b><small>${knE(knList(a.items))}${a.rej.length ? ' · ❌ yaroqsiz: ' + knE(knList(a.rej)) : ''}</small></div>`).join('') + '</div>' : '<div class="nd-tip">Bu yil dalolatnoma yoʻq.</div>'}</div>
                        <div class="hs-box"><div class="hs-h">📋 UMTS da qabul qilingan ehtiyot qismlar roʻyxati · ${knE(KNS.y)}</div>
                            ${R ? `<div class="nd-tip">${knE(R.file || '')} · ${knE(KN52.fmtDateTime ? KN52.fmtDateTime(R.at) : R.at)}</div>` + R.groups.map((g: any, gi: number) => `${g.name ? `<div class="kq-h">${knE(g.name)}</div>` : ''}<div class="hs-list">${g.rows.map((x: any, ri: number) => { const s = x.m.reduce((p: number, q: number) => p + q, 0); return `<div class="hs-row" onclick="knRowEdit(${gi},${ri})"><b>${knE(x.name)}</b><small>reja ${knE(x.plan)} · keldi ${s}${x.plan ? ' · qoldi ' + (x.plan - s) : ''}${s ? ' · ' + x.m.map((q: number, k: number) => q ? KN_OYU[k].slice(0, 3) + ' ' + q : '').filter(Boolean).join(', ') : ''}</small></div>`; }).join('')}</div>`).join('') + `<div class="nv-btns"><button onclick="knRegOut()">📊 Excel</button></div>` : '<div class="nd-tip">Roʻyxat yuklanmagan.</div>'}
                            <label class="alb-btn">📥 Roʻyxatni Excel dan yuklash / yangilash<input type="file" accept=".xls,.xlsx" style="display:none" onchange="knImport(this)"></label></div>`;
                    try { if (typeof KN52.h9Tpl === 'function') KN52.h9Tpl(b); } catch (e) { /* */ }
                } catch (e) { console.error(e); }
                return r;
            });
            const st = document.createElement('style');
            st.textContent = '.kn-mg{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 8px}.kn-sg{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;margin:4px 0;border:1px solid rgba(148,163,184,.3);border-radius:10px}.kn-sg span:last-child{display:flex;gap:4px;flex:0 0 auto}.kn-ck{display:flex;gap:8px;align-items:center;margin:10px 0}.kn-paper{background:#fff!important;color:#000!important;padding:14px;border-radius:8px;margin:8px 0;overflow-wrap:anywhere}.kn-paper *{color:#000!important}.kn-paper .kn-akt{font-size:12px!important}'
                + '.nx-f{padding:8px 10px;margin:5px 0;border-radius:10px;font-size:13px;border:1px solid rgba(148,163,184,.3)}.nx-f.red{border-color:#ef4444;background:rgba(239,68,68,.12)}.nx-f.blue{border-color:#38bdf8;background:rgba(56,189,248,.08)}.nx-yr{margin:10px 0}';
            document.head.appendChild(st);
        })();
        Object.assign(KN52, { KNS: KNS, knNew: knNew, knForm: knForm, knSigPick: knSigPick, knSigMv: knSigMv, knSave: knSave, knDel: knDel, knView: knView, knOut: knOut, knImport: knImport, knRegOut: knRegOut, knRowEdit: knRowEdit, knRowSave: knRowSave, knChk: knChk, knChkFiles: knChkFiles, knChkKeep: knChkKeep, knCheck: knCheck, knParseText: knParseText, knParseSheet: knParseSheet, knMatch: knMatch, knRefresh: knRefresh });
