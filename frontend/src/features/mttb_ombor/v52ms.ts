        // =====================================================================
        // 5.2 — 10-band (muallif namunalari, 29.10.2026; docs/REJA_5.2.md)
        //  (A) «⚠️ Nosozlik dalolatnomasi» namunaga tekislandi: taʼmir vaqtlari bitta qator
        //      («-Vagonning oxirgi taʼmir vaqtlari: depo taʼmir …, kapital taʼmir …, foydalanishga topshirilgan yil …») — blankada;
        //      xulosa varianti: «VX ga yuborish (jadvaldagi vagon oʻrniga)» yoki «VX ga tushiriladi … (otstoy) turadi».
        //  (B) «🧪 Mahalliylashtirilgan mahsulot sinovi» — jurnal: mahsulot (kuzov, yon bort, rama …) → oʻrnatilgan vagon →
        //      sinov boshlanishi → oraliq tekshiruvlar → yakuniy xulosa. Har bosqichga dalolatnoma (namunadagi shaklda):
        //      «…синов жараёнларини амалга ошириш тўғрисида» va «…синов жараёнлари босқичида техник ҳолатини текширувдан ўтказиш тўғрисида».
        //      Til: Ўзбек (кирилл) / Oʻzbek (lotin) / Русский. Imzo chekuvchilar shtatdan. PDF / Word.
        //  Namunadagi ism-shariflar kodda yoʻq.
        // =====================================================================
        const MS52: any = window as any;
        // ---------- (A) nosozlik: xulosa varianti ----------
        if (typeof MS52.cxNosozXul === 'function') MS52.cxNosozXul = MS52.agmkExtend('cxNosozXul', '5.2: xulosa — otstoy varianti', MS52.cxNosozXul, (o: Function) => function (this: unknown, doc: any) {
            if (!doc || doc.xulVar !== 'otstoy') return o.apply(this, arguments);
            const c = String(doc.cause || '').trim();
            return 'Ushbu vagon nosozliklari 1-TYS VTP da ta’mirlash ishlarini amalga oshirish imkoni yo’qligi bois, VX ga tushiriladi va keyingi rejali ta’mir vaqtigacha foydalanilmasdan (otstoy) turadi.' + (c ? ' Vagonning ' + c : '');
        });
        if (typeof MS52.cxForm === 'function') MS52.cxForm = MS52.agmkExtend('cxForm', '5.2: nosozlik xulosa varianti', MS52.cxForm, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            try {
                const d = MS52.CXV && MS52.CXV.cur; if (!d || d.type !== 'nosoz' || document.getElementById('cxXulVar')) return r;
                const ta = Array.from(document.querySelectorAll('.nd-f label')).find((l: any) => /XULOSA MATNI/.test(l.textContent || '')) as any; if (!ta) return r;
                const w = document.createElement('div'); w.className = 'nd-f'; w.id = 'cxXulVar';
                w.innerHTML = `<label>XULOSA TURI</label><select onchange="CXV.cur.xulVar=this.value; CXV.cur.xulosaManual=false; cxForm()"><option value="">VX ga yuborish va depo taʼmiri (jadvaldagi vagon oʻrniga)</option><option value="otstoy"${d.xulVar === 'otstoy' ? ' selected' : ''}>VX ga tushiriladi — keyingi rejali taʼmirgacha foydalanilmasdan (otstoy)</option></select>`;
                ta.parentElement.parentElement.insertBefore(w, ta.parentElement);
            } catch (e) { console.error(e); }
            return r;
        });
        // ---------- 9(A) «Oʻq sinishi»: hodisa joyi namunalardagidek ----------
        //  Namunalarda: «Razvyazka bekatida», «Qolmaqir stansiyasi 1-yoʻlida», «1-TYSda», «1-Yoshlik (37-ekskavator yoni)da».
        //  Ilova doim «… bekatida» yozardi → joy yoʻl / TYS / «yoni» bilan yozilsa — shundayligicha + «da».
        function msOqJoy(raw: string): string {
            const j = String(raw || '').trim(); if (!j) return '';
            if (/(da|ida|lida)$/i.test(j)) return j;
            if (/yo.l|йўл|TYS|ТЙЦ|yoni|ёни|\)$/i.test(j)) return j.replace(/yo([’'ʻʼ‘`])li?$/i, 'yo$1li') + 'da';
            return '';
        }
        if (typeof MS52.nd41BuildOq === 'function') MS52.nd41BuildOq = MS52.agmkExtend('nd41BuildOq', '5.2: hodisa joyi (yoʻl, TYS)', MS52.nd41BuildOq, (o: Function) => function (this: unknown, f: any) {
            const R = o.apply(this, arguments);
            try { const raw = String(f && f.joy || '').trim(), alt = msOqJoy(raw); if (alt && R && R.html) { const st = raw.replace(/\s+(bekati|stansiyasi|st\.?)$/i, ''); R.html = R.html.replace(MS52.escapeHtml(st) + ' bekatida', MS52.escapeHtml(alt)); } } catch (e) { /* */ }
            return R;
        });
        // ---------- (B) Mahalliylashtirilgan mahsulot sinovi ----------
        var MS_KEY = 'agmk_ms_v1', MS_SIG = 'agmk_ms_sig';
        try { if (MS52.KV_SYNC && Array.isArray(MS52.KV_SYNC.keys) && !MS52.KV_SYNC.keys.includes(MS_KEY)) MS52.KV_SYNC.keys.push(MS_KEY); } catch (e) { /* */ }
        var MS_OY = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        var MS_OYR = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        var MSS: any = { t: null, st: null, til: 'uzc' };
        var MS_PROD = ['2ВС-105 типдаги думпкар кузови', '2ВС-105 типдаги думпкар ён борти', '2ВС-105 типдаги думпкар пастки рамаси', '6ВС-60 типдаги думпкар кузови', '6ВС-60 типдаги думпкар ён борти'];
        var MS_DEF: any = {
            start: { ap: { l: 'СТТБ бош муҳандиси', n: '' }, km: [{ l: 'Вагон хизмати бошлиғи', n: '' }, { l: 'Вагон хизмати бошлиғи ўринбосари', n: '' }, { l: 'ИЧТБ вагонлар бўйича муҳандиси', n: '' }, { l: 'Вагон хизмати устаси', n: '' }] },
            chk: { ap: { l: 'СТТБ бош муҳандиси', n: '' }, km: [{ l: '1-ТЙЦ бошлиғи ўринбосари', n: '' }, { l: 'ИЧТБ бошлиғи', n: '' }, { l: 'ИЧТБ вагонлар бўйича муҳандиси', n: '' }, { l: '1-ТЙЦ участка устаси', n: '' }] }
        };
        function msE(s: any): string { return MS52.escapeHtml(String(s == null ? '' : s)); }
        function msDmy(iso: any): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); }
        function msL(): any[] { return MS52.kvGet(MS_KEY, null) || []; }
        function msSave(L: any[]): void { MS52.kvSet(MS_KEY, L.slice(0, 500)); }
        function msSig(k: string): any { const S = MS52.kvGet(MS_SIG, null) || {}; return JSON.parse(JSON.stringify(S[k] || MS_DEF[k])); }
        function msSigKeep(k: string, s: any): void { const S = MS52.kvGet(MS_SIG, null) || {}; S[k] = { ap: s.ap, km: s.km }; MS52.kvSet(MS_SIG, S); }
        function msStat(t: any): string { const f = (t.st || []).find((s: any) => s.k === 'final'); return f ? (f.ok === false ? '❌ yaroqsiz' : '✅ yaroqli — sinov yakunlandi') : '🧪 sinovda'; }
        // matn (kirill asosida); lotin — tlC2L, rus — alohida shablon
        function msTxt(t: any, s: any): any {
            const P = t.prod || '…', Pni = P + 'ни', Png = P + 'нинг', xz = t.xiz || 'Вагон хизмати', who = s.km.map((p: any) => ((p.l || '') + ' ' + (p.n || '')).trim()).filter(Boolean).join(', ');
            if (s.k === 'start') return {
                title: `СТТБ ${xz}да маҳаллийлаштирилган ${Pni} синов жараёнларини амалга ошириш тўғрисида`,
                p: [`Биз қуйидаги имзо чекувчилар: ${who} тузилаётган далолатнома шу ҳақидаким, ${xz}да ишлаб чиқарилган ${t.soni || 1}-дона ${Pni} синов тариқасида завод рақами ${t.zav || '______'} бўлган ${t.vtip || '2ВС-105'} типдаги думпкарга ${t.tamir || 'капитал таъмирда'} ўрнатилди. Ушбу думпкар доимий назорат остида СТТБ ${t.sex || '1-ТЙЦ'}да эксплуатация жараёнларида барча шароитларда фойдаланилиб кўрилиб сифат даражаси аниқланади.`] };
            const fin = s.k === 'final';
            const p = [`Биз қуйида имзоловчилар: ${who}, тузилаётган далолатнома шу ҳақдаки, ${msDmy(s.sana)}-й. ${s.joy || '______'} станциясида ${t.vtip || '2ВС-105'} типидаги завод рақами ${t.zav || '______'} вагон-думпкарга ўрнатилган ${t.soni || 1}-дона ${Png} техник ҳолатини текширилди.`,
                s.holat || `${Png} техник ҳолати соз, ҳеч қандай механик эгилишлар ва ёриқлар юзага келмаганлиги ҳамда эксплуатация жараёнида у ўрнатилган думпкар билан боғлиқ ҳеч қандай нохуш ҳодисалар юзага келмади.`,
                `${msDmy(s.dan || t.start)} й.дан ${msDmy(s.sana)} й.гача ${s.yukJ || 'тоғ маъданларини МБФга етказишдаги'} ҳар қандай ҳолатларни инобатга олган ҳолда думпкарга ${s.yMin || 90} т.дан ${s.yMax || 140} т.гача юк ортилган ҳолда назорат остида юк ташилди. Ушбу синов жараёнларида юк ташиш ва тўкиш вақтларида ҳеч қандай носозликлар кузатилмади.`];
            const xul = s.xul || (fin ? (s.ok === false ? `Юқоридагиларни инобатга олган ҳолда ${xz}да синов тариқасида ишлаб чиқарилган ${P} синов жараёнларидан ўтмади ва эксплуатация учун яроқсиз деб топилди.`
                : `Юқоридагиларни инобатга олган ҳолда ${xz}да синов тариқасида ишлаб чиқарилган ${P} барча юкламали ҳолатлардан ижобий ўтганлиги, эксплуатацияда ноқулайликлар юзага келмаганлиги ва айни вақтда техник ҳолатида ўзгаришлар бўлмаганлиги сабабли синов жараёнлари муваффақиятли ўтган деб топилиб, эксплуатация учун яроқли деб топилди.`)
                : `Юқоридагиларни инобатга олган ҳолда ${P} техник ҳолати соз; синов жараёнлари давом эттирилади.`);
            return { title: `СТТБ ${xz}да маҳаллийлаштирилган ${Pni} синов жараёнлари босқичида техник ҳолатини текширувдан ўтказиш тўғрисида`, p: p, xul: xul };
        }
        function msTxtRu(t: any, s: any): any {
            const P = t.prodRu || t.prod || '…', xz = t.xizRu || 'Вагонной службе', who = s.km.map((p: any) => ((p.l || '') + ' ' + (p.n || '')).trim()).filter(Boolean).join(', ');
            if (s.k === 'start') return { title: `О проведении испытаний локализованного изделия (${P}) в ${xz} УПЖТ`,
                p: [`Мы, нижеподписавшиеся: ${who}, составили настоящий акт о том, что изготовленное в ${xz} изделие «${P}» в количестве ${t.soni || 1} шт. в порядке испытания установлено на думпкар типа ${t.vtip || '2ВС-105'} заводской № ${t.zav || '______'} при ${t.tamirRu || 'капитальном ремонте'}. Думпкар эксплуатируется в ${t.sex || '1-ТЙЦ'} УПЖТ под постоянным контролем во всех условиях; качество изделия определяется в процессе эксплуатации.`] };
            const fin = s.k === 'final';
            return { title: `О проверке технического состояния локализованного изделия (${P}) на этапе испытаний`,
                p: [`Мы, нижеподписавшиеся: ${who}, составили настоящий акт о том, что ${msDmy(s.sana)} г. на станции ${s.joy || '______'} проверено техническое состояние изделия «${P}» (${t.soni || 1} шт.), установленного на вагон-думпкар типа ${t.vtip || '2ВС-105'} заводской № ${t.zav || '______'}.`,
                    s.holatRu || 'Техническое состояние исправное, механических деформаций и трещин не выявлено; в процессе эксплуатации каких-либо происшествий, связанных с думпкаром, не произошло.',
                    `С ${msDmy(s.dan || t.start)} г. по ${msDmy(s.sana)} г. думпкар под контролем перевозил груз массой от ${s.yMin || 90} до ${s.yMax || 140} т; при погрузке и разгрузке неисправностей не наблюдалось.`],
                xul: s.xulRu || (fin ? (s.ok === false ? 'Изделие испытания не выдержало и признано непригодным к эксплуатации.' : 'Изделие успешно прошло испытания при всех режимах нагрузки и признано пригодным к эксплуатации.') : 'Техническое состояние исправное; испытания продолжаются.') };
        }
        function msHtml(t: any, s: any, til: string): string {
            const ru = til === 'ru', T = ru ? msTxtRu(t, s) : msTxt(t, s), d = String(s.sana || '').slice(0, 10).split('-'), lat = til === 'uz' && typeof MS52.tlC2L === 'function' ? (x: string) => MS52.tlC2L(x) : (x: string) => x;
            const oy = ru ? MS_OYR[+d[1] - 1] || '' : MS_OY[+d[1] - 1] || '';
            const H = `<div class="kn-akt" style="font-family:'Times New Roman',serif;font-size:13pt;color:#000;line-height:1.35">
                <div style="margin-left:50%">${ru ? '«УТВЕРЖДАЮ»' : '«ТАСДИҚЛАЙМАН»'}<br>${msE(s.ap.l)}<br>__________ ${msE(s.ap.n)}<br>«${msE(d[2] || '__')}» ${msE(oy)} ${msE(d[0] || '')}${ru ? ' г.' : '-й.'}</div>
                <div style="display:flex;justify-content:space-between;margin:14px 0 10px"><span>${ru ? 'г. Алмалык' : 'Олмалиқ ш.'}</span><span>${msE(msDmy(s.sana))}${ru ? ' г.' : '-й.'}</span></div>
                <div style="text-align:center;font-weight:bold">${msE(T.title)}</div><div style="text-align:center;font-weight:bold;margin:6px 0 10px">${ru ? 'АКТ' : 'ДАЛОЛАТНОМА'}</div>
                ${T.p.map((x: string) => `<p style="text-indent:36px;text-align:justify">${msE(x)}</p>`).join('')}${T.xul ? `<p style="text-indent:36px;text-align:justify"><b>${ru ? 'Заключение:' : 'Хулоса:'}</b> ${msE(T.xul)}</p>` : ''}
                <table style="width:100%;margin-top:22px;border:0">${s.km.map((p: any) => `<tr><td style="border:0;padding:6px 0">${msE(p.l)}</td><td style="border:0;text-align:right">${msE(p.n)}</td></tr>`).join('')}</table></div>`;
            if (til !== 'uz') return H;
            const box = document.createElement('div'); box.innerHTML = H; const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT); const N: any[] = []; while (w.nextNode()) N.push(w.currentNode); N.forEach(n => { n.nodeValue = lat(n.nodeValue); }); return box.innerHTML;
        }
        // ---------- jurnal UI ----------
        function msNew(id?: string): void {
            const t = id ? msL().find(x => x.id === id) : null;
            MSS.t = t ? JSON.parse(JSON.stringify(t)) : { id: 'ms' + Date.now().toString(36), prod: MS_PROD[0], soni: 1, xiz: 'Вагон хизмати', vtip: '2ВС-105', zav: '', tamir: 'капитал таъмирда', sex: '1-ТЙЦ', start: MS52.todayISO(), st: [] };
            msForm();
        }
        function msForm(): void {
            const t = MSS.t, f = (k: string, l: string, ph?: string, ty?: string) => `<label class="kq-l">${l}<input ${ty ? 'type="' + ty + '"' : ''} ${k === 'prod' ? 'list="msProd"' : ''} value="${msE(t[k])}" placeholder="${msE(ph || '')}" onchange="MSS.t.${k}=this.value${k === 'zav' ? ';msForm()' : ''}"></label>`;
            const v = t.zav && typeof MS52.onlyVagons === 'function' ? MS52.onlyVagons().find((x: any) => String(MS52.vagonNo(x)).replace(/^0+/, '') === String(t.zav).replace(/^0+/, '')) : null;
            MS52.mdl('msF', `<div class="px-h"><b>🧪 Sinovga qoʻyish — mahsulot</b><button class="mini-btn" onclick="mdlClose('msF')">✕</button></div>
                <datalist id="msProd">${MS_PROD.map(p => `<option value="${msE(p)}">`).join('')}</datalist>
                ${f('prod', 'Mahsulot (bosh kelishikda, kirill)', '2ВС-105 типдаги думпкар кузови')}${f('prodRu', 'Mahsulot — ruscha (ruscha akt uchun)', 'кузов думпкара 2ВС-105')}
                <div class="h8-row">${f('soni', 'Soni, dona', '1', 'number')}${f('xiz', 'Ishlab chiqargan', 'Вагон хизмати')}</div>
                <div class="h8-row">${f('vtip', 'Vagon turi', '2ВС-105')}${f('zav', 'Vagon zavod raqami', '24583')}</div><small>${v ? '✅ Pasportda bor: ' + msE(v.type || '') : t.zav ? '⚠️ Pasportda topilmadi' : ''}</small>
                <div class="h8-row">${f('tamir', 'Qachon oʻrnatildi', 'капитал таъмирда')}${f('sex', 'Sinov joyi (seh)', '1-ТЙЦ')}</div>
                ${f('start', 'Oʻrnatilgan (sinov boshlangan) sana', '', 'date')}
                <div class="nv-btns"><button onclick="msStore()">💾 Saqlash</button>${t.st.length ? '' : '<button onclick="msStore(1)">💾 Saqlash va boshlanish dalolatnomasi</button>'}</div>`, true);
        }
        function msStore(act?: number): void {
            const t = MSS.t; if (!t.prod || !t.zav) { MS52.alert('Mahsulot va vagon raqamini kiriting.'); return; }
            t.at = t.at || new Date().toISOString(); t.by = t.by || MS52.authorStr(); const L = msL().filter(x => x.id !== t.id); L.unshift(JSON.parse(JSON.stringify(t))); msSave(L);
            MS52.mdlClose('msF'); if (act) msStage(t.id, 'start'); else msOpen(t.id); msRefresh();
        }
        function msOpen(id: string): void {
            const t = msL().find(x => x.id === id); if (!t) { msRefresh(); return; } const K: any = { start: '🟢 Sinov boshlandi', mid: '🔎 Oraliq tekshiruv', final: '🏁 Yakuniy tekshiruv' };
            const fin = t.st.some((s: any) => s.k === 'final');
            MS52.mdl('msO', `<div class="px-h"><b>🧪 ${msE(t.prod)}</b><button class="mini-btn" onclick="mdlClose('msO')">✕</button></div>
                <div class="nd-tip">Vagon ${msE(t.vtip)} № ${msE(t.zav)} · ${msE(t.soni)} dona · oʻrnatilgan ${msE(msDmy(t.start))} · ${msE(msStat(t))}</div>
                <div class="hs-list">${t.st.map((s: any, i: number) => `<div class="hs-row" onclick="msView('${msE(t.id)}',${i})"><b>${K[s.k]} · ${msE(msDmy(s.sana))}</b><small>${s.k === 'start' ? msE(t.tamir || '') : msE(s.joy || '') + (s.k === 'final' ? ' · ' + (s.ok === false ? 'yaroqsiz' : 'yaroqli') : '')}</small></div>`).join('') || '<div class="nd-tip">Hali dalolatnoma yoʻq.</div>'}</div>
                <div class="nv-btns">${t.st.some((s: any) => s.k === 'start') ? '' : `<button onclick="msStage('${msE(t.id)}','start')">🟢 Boshlanish dalolatnomasi</button>`}${fin ? '' : `<button onclick="msStage('${msE(t.id)}','mid')">🔎 Oraliq tekshiruv</button><button onclick="msStage('${msE(t.id)}','final')">🏁 Yakuniy xulosa</button>`}
                <button onclick="mdlClose('msO');msNew('${msE(t.id)}')">✏️ Mahsulot</button><button style="background:#b91c1c" onclick="msDel('${msE(t.id)}')">🗑</button></div>`, true);
        }
        async function msDel(id: string): Promise<void> { if (!(await MS52.uiConfirm('Sinov yozuvi (barcha dalolatnomalari bilan) oʻchirilsinmi?'))) return; msSave(msL().filter(x => x.id !== id)); MS52.mdlClose('msO'); msRefresh(); }
        function msStage(id: string, k: string, i?: number): void {
            const t = msL().find(x => x.id === id); if (!t) return; const old = i != null ? t.st[i] : null, last = t.st.filter((s: any) => s.k !== 'start').slice(-1)[0], sg = msSig(k === 'start' ? 'start' : 'chk');
            MSS.st = old ? JSON.parse(JSON.stringify(old)) : { k: k, sana: k === 'start' ? String(t.start || MS52.todayISO()).slice(0, 10) : MS52.todayISO(), joy: last ? last.joy : '', dan: k === 'start' ? '' : String(t.start || '').slice(0, 10), yMin: 90, yMax: 140, ok: true, ap: sg.ap, km: sg.km };
            MSS.tid = id; MSS.si = i == null ? -1 : i; msStForm();
        }
        function msStForm(): void {
            const s = MSS.st, f = (k: string, l: string, ph?: string, ty?: string) => `<label class="kq-l">${l}<input ${ty ? 'type="' + ty + '"' : ''} value="${msE(s[k])}" placeholder="${msE(ph || '')}" onchange="MSS.st.${k}=this.value"></label>`;
            const ta = (k: string, l: string, ph: string) => `<label class="kq-l">${l}<textarea rows="3" placeholder="${msE(ph)}" onchange="MSS.st.${k}=this.value">${msE(s[k] || '')}</textarea></label>`;
            const sg = (p: any, j: number) => `<div class="kn-sg"><span><b>${msE(p.l)}</b><br>${msE(p.n || '— tanlanmagan —')}</span><span><button class="mini-btn" onclick="msPick(${j})">✎</button>${j > 0 ? `<button class="mini-btn" onclick="MSS.st.km.splice(${j - 1},1);msStForm()">✕</button>` : ''}</span></div>`;
            const N: any = { start: '🟢 Sinov boshlanishi', mid: '🔎 Oraliq tekshiruv', final: '🏁 Yakuniy tekshiruv va xulosa' };
            MS52.mdl('msS', `<div class="px-h"><b>${N[s.k]}</b><button class="mini-btn" onclick="mdlClose('msS')">✕</button></div>
                ${f('sana', 'Dalolatnoma sanasi', '', 'date')}
                ${s.k === 'start' ? '' : `${f('joy', 'Tekshiruv joyi (stansiya)', 'Кальмакир')}<div class="h8-row">${f('dan', 'Sinov davri — dan', '', 'date')}${f('yMin', 'Yuk, t (dan)', '90', 'number')}${f('yMax', 'Yuk, t (gacha)', '140', 'number')}</div>
                    ${ta('holat', 'Texnik holati (boʻsh qolsa — namunadagi «соз» matni)', 'кузовда ҳеч қандай механик эгилишлар ва ёриқлар юзага келмади')}
                    ${s.k === 'final' ? `<label class="kq-l">Natija<select onchange="MSS.st.ok=this.value==='1'"><option value="1">✅ Yaroqli — sinov muvaffaqiyatli</option><option value="0"${s.ok === false ? ' selected' : ''}>❌ Yaroqsiz</option></select></label>` : ''}
                    ${ta('xul', 'Xulosa (boʻsh qolsa — namunadagi matn)', '')}`}
                <div class="kq-h">✍️ Tasdiqlovchi</div>${sg(s.ap, 0)}<div class="kq-h">👥 Imzo chekuvchilar</div>${s.km.map((p: any, j: number) => sg(p, j + 1)).join('')}
                <button class="kq-add" onclick="MSS.st.km.push({l:'',n:''});msPick(MSS.st.km.length)">➕ Aʼzo qoʻshish</button>
                <div class="nv-btns"><button onclick="msStSave()">💾 Saqlash va koʻrish</button></div>`, true);
        }
        function msPick(j: number): void { const s = MSS.st; MS52.agmkPickPerson(j === 0 ? '✍️ Tasdiqlovchi' : '👥 Imzo chekuvchi', (p0: any) => { const c = (x: any, nm?: boolean) => { const v = String(x || ''); return typeof MS52.tlL2C === 'function' && /[a-z]/i.test(v) ? MS52.tlL2C(v, nm) : v; }, p = { l: c(p0.l), n: c(p0.n, true) }; if (j === 0) s.ap = { l: p.l || s.ap.l, n: p.n }; else s.km[j - 1] = { l: p.l || (s.km[j - 1] || {}).l || '', n: p.n }; msStForm(); }, 'uz'); }
        function msStSave(): void {
            const L = msL(), t = L.find(x => x.id === MSS.tid); if (!t) return; const s = JSON.parse(JSON.stringify(MSS.st)); s.yMin = +s.yMin || 90; s.yMax = +s.yMax || 140; s.at = new Date().toISOString(); s.by = MS52.authorStr();
            if (MSS.si >= 0) t.st[MSS.si] = s; else t.st.push(s); t.st.sort((a: any, b: any) => (a.k === 'start' ? -1 : 0) - (b.k === 'start' ? -1 : 0) || String(a.sana).localeCompare(String(b.sana)));
            if (s.k === 'start') t.start = s.sana; msSave(L); msSigKeep(s.k === 'start' ? 'start' : 'chk', s); MS52.mdlClose('msS'); msView(t.id, t.st.indexOf(t.st.find((x: any) => x.at === s.at))); msRefresh();
        }
        function msView(id: string, i: number): void {
            const t = msL().find(x => x.id === id), s = t && t.st[i]; if (!s) return; MSS.vid = id; MSS.vi = i;
            MS52.mdl('msV', `<div class="px-h"><b>📄 ${msE(msDmy(s.sana))} · ${msE(t.zav)}</b><button class="mini-btn" onclick="mdlClose('msV');msOpen('${msE(id)}')">✕</button></div>
                <div class="bg-seg">${[['uzc', 'Кирилл'], ['uz', 'Lotin'], ['ru', 'Русский']].map(x => `<button class="${MSS.til === x[0] ? 'on' : ''}" onclick="MSS.til='${x[0]}';msView('${msE(id)}',${i})">${x[1]}</button>`).join('')}</div>
                <div class="nd-tip">Matnni shu yerda tuzatish mumkin — PDF / Word tuzatilgani bilan chiqadi.</div>
                <div class="kn-paper" id="msPage" contenteditable="true">${msHtml(t, s, MSS.til)}</div>
                <div class="nv-btns"><button onclick="msOut('pdf')">📄 PDF</button><button onclick="msOut('docx')">📝 Word</button><button onclick="mdlClose('msV');msStage('${msE(id)}','${s.k}',${i})">✏️ Tahrirlash</button><button style="background:#b91c1c" onclick="msStDel('${msE(id)}',${i})">🗑</button></div>`, true);
        }
        async function msStDel(id: string, i: number): Promise<void> { if (!(await MS52.uiConfirm('Dalolatnoma oʻchirilsinmi?'))) return; const L = msL(), t = L.find(x => x.id === id); if (!t) return; t.st.splice(i, 1); msSave(L); MS52.mdlClose('msV'); msOpen(id); msRefresh(); }
        function msOut(kind: string): void {
            const t = msL().find(x => x.id === MSS.vid), s = t && t.st[MSS.vi], p = MS52.$id('msPage'); if (!s || !p) return; const base = 'Sinov_' + s.k + '_' + String(t.zav) + '_' + String(s.sana).slice(0, 10);
            try { const f = kind === 'pdf' ? { name: base + '.pdf', mime: 'application/pdf', blob: MS52.pdfBlobFromHtml(p.innerHTML) } : { name: base + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: MS52.docxFromHtml(p.innerHTML) };
                if (MS52.exOpen) MS52.exOpen([f], { title: 'Mahsulot sinovi dalolatnomasi', act: 'dl' }); else MS52.docDownload([f]); } catch (e) { console.error(e); MS52.alert('⚠️ ' + String((e as any) && (e as any).message || e)); }
        }
        function msRefresh(): void { try { if (MS52.HS && MS52.HS.akt === 'mahsinov') MS52.hsRender(); } catch (e) { /* */ } }
        (function () {
            try { if (Array.isArray(MS52.HS_AKT) && !MS52.HS_AKT.some((c: any) => c.k === 'mahsinov')) MS52.HS_AKT.push({ k: 'mahsinov', ic: '🧪', t: 'Mahalliylashtirilgan mahsulot sinovi', types: [] }); } catch (e) { /* */ }
            if (typeof MS52.hsRender === 'function') MS52.hsRender = MS52.agmkExtend('hsRender', '5.2: mahsulot sinovi', MS52.hsRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try {
                    const HS = MS52.HS; if (!HS || HS.tab !== 'akt') return r; const b = MS52.secBody ? MS52.secBody('screen-hisob') : null; if (!b) return r;
                    if (!HS.akt) { b.querySelectorAll('.hs-grid .hs-card').forEach((c: any) => { if (/HS\.akt='mahsinov'/.test(c.getAttribute('onclick') || '')) { const s = c.querySelector('small'); if (s) { const L = msL(); s.textContent = L.filter(t => !t.st.some((x: any) => x.k === 'final')).length + ' ta sinovda · ' + L.length + ' ta jami'; } } }); return r; }
                    if (HS.akt !== 'mahsinov') return r;
                    const L = msL(), act = L.filter(t => !t.st.some((x: any) => x.k === 'final')), done = L.filter(t => t.st.some((x: any) => x.k === 'final'));
                    const row = (t: any) => `<div class="hs-row" onclick="msOpen('${msE(t.id)}')"><b>${msE(t.prod)}</b><small>vagon № ${msE(t.zav)} · ${msE(msDmy(t.start))} dan · ${t.st.length} ta dalolatnoma · ${msE(msStat(t))}</small></div>`;
                    const back = b.querySelector('.hs-back');
                    b.innerHTML = (back ? back.outerHTML : '') + `<div class="hs-new card-list h9-list"><div class="db-two" onclick="msNew()"><button class="action-btn" onclick="event.stopPropagation();msNew()">➕ Sinovga qoʻyish — yangi mahsulot</button></div></div>
                        <div class="hs-box"><div class="hs-h">🧪 Sinovda (${act.length})</div>${act.length ? '<div class="hs-list">' + act.map(row).join('') + '</div>' : '<div class="nd-tip">Hozir sinovda mahsulot yoʻq.</div>'}</div>
                        ${done.length ? `<div class="hs-box"><div class="hs-h">🏁 Yakunlangan (${done.length})</div><div class="hs-list">${done.map(row).join('')}</div></div>` : ''}`;
                    try { if (typeof MS52.h9Tpl === 'function') MS52.h9Tpl(b); } catch (e) { /* */ }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        Object.assign(MS52, { msOqJoy: msOqJoy, MSS: MSS, msNew: msNew, msForm: msForm, msStore: msStore, msOpen: msOpen, msDel: msDel, msStage: msStage, msStForm: msStForm, msPick: msPick, msStSave: msStSave, msView: msView, msStDel: msStDel, msOut: msOut, msHtml: msHtml });
