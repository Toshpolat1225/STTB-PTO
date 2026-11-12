        // =====================================================================
        // 5.2 — «⚠️ Noxush hodisalar» (muallif, 29.10.2026; docs/REJA_5.2.md 9-band)
        //  «📄 Dalolatnomalar» ichida yangi boʻlim: hodisa bir marta kiritiladi → hammasi shundan:
        //   • Gʻildirak juftligi sinishi → «СТТБда YYYY йилда ғилдирак жуфтлигининг синганлиги тўғрисида Маълумот» (reestr,
        //     ilovadagi GJ26 jadvali bilan bitta) + «Oʻq sinishi» dalolatnomasi (mavjud akt, reestrdan oʻzi toʻladi)
        //     + «Вагон таъмири тўғрисида Маълумот» (har hodisaga).
        //   • 🔍 Oʻzaro tekshiruv: reestr ↔ dalolatnomalar (ilovadagi arxiv va yuklangan Word fayllar) ↔ vagon pasporti.
        //  Hujjatlar namunadagidek (kirill), Excel va PDF. Hisob/qaror yoʻq — faqat maʼlumot yigʻish va solishtirish.
        // =====================================================================
        const NX: any = window as any;
        var NX_SET = 'agmk_nx_set';
        try { if (NX.KV_SYNC && Array.isArray(NX.KV_SYNC.keys)) ['agmk_gj_v1'].forEach(k => { if (!NX.KV_SYNC.keys.includes(k)) NX.KV_SYNC.keys.push(k); }); } catch (e) { /* */ }
        var NXS: any = { y: '', edit: -1, chk: null };
        /** jadvalni ilovaga oʻrnatish (boʻsh roʻyxat ham — oxirgi qator oʻchirilsa jadval boʻshaydi) */
        function nxApply(N: any[]): void { const L = nxReg(); if (typeof NX.GJ26 === 'undefined' || !Array.isArray(L)) return; L.length = 0; N.forEach((x: any) => L.push(x)); }
        // 5.2: avvalgi versiyalarda ilovaga namuna (2026, 6 ta hodisa) qoʻshilgan va sinxron orqali saqlangan boʻlishi mumkin —
        // muallif: «u faqat namuna edi, tarixga joylanmasin» → aynan oʻsha namuna boʻlsa, qurilmadan va sinxrondan olib tashlanadi.
        //  (kodda namunaning oʻzi yoʻq — faqat «vagon|sana» kalitlaridan olingan iz: sha256, 16 belgi)
        (async function () {
            try {
                const d = NX.kvGet('agmk_gj_v1', null); if (!d || !Array.isArray(d.rows) || !d.rows.length || !(window.crypto && crypto.subtle)) return;
                const k = d.rows.map((x: any) => String(x.vagon || '').replace(/^0+/, '') + '|' + String(x.sana || '')).sort().join('\n');
                const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(k)); const hx = Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 16);
                if (hx === 'dfee8b9b5d3472f5') { NX.kvSet('agmk_gj_v1', { rows: [], file: '', at: new Date().toISOString(), by: 'Ilova 5.2 (namuna olib tashlandi)' }); nxApply([]); }
            } catch (e) { /* */ }
        })();
        function nxE(s: any): string { return NX.escapeHtml(String(s == null ? '' : s)); }
        function nxNo(x: any): string { return String(x == null ? '' : x).replace(/\D/g, '').replace(/^0+(?=\d)/, ''); }
        function nxReg(): any[] { return typeof NX.GJ26 !== 'undefined' && Array.isArray(NX.GJ26) ? NX.GJ26 : []; }
        function nxV(no: any): any { const n = nxNo(no); return n ? NX.onlyVagons().find((v: any) => nxNo(NX.vagonNo(v)) === n) || null : null; }
        function nxDmy(iso: any): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); }
        function nxIso(dmy: any): string { const s = String(dmy || ''); if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); const m = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/); return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : ''; }
        function nxYear(r: any): string { return (nxIso(r.sana) || '').slice(0, 4); }
        /** pasportdan: oxirgi taʼmirlar (Prof = VRP), ishlab chiqarilgan yil */
        function nxRep(v: any): any {
            const o: any = { KR: '', DR: '', VRP: '', yil: '' }; if (!v) return o;
            try { (typeof NX.slRepEv === 'function' ? NX.slRepEv(v) : []).forEach((e: any) => { if (o[e.rt] !== undefined && e.d > o[e.rt]) o[e.rt] = e.d; }); } catch (e) { /* */ }
            if (!o.DR && v.tamirSanasi) o.DR = String(v.tamirSanasi).slice(0, 10); if (!o.KR && v.kr) o.KR = String(v.kr).slice(0, 10);
            o.yil = String(v.yil || v.year || v.ishlabChiqarilgan || '').match(/\d{4}/) ? String(v.yil || v.year || v.ishlabChiqarilgan).match(/\d{4}/)![0] : '';
            return o;
        }
        function nxSet(): any { return NX.kvGet(NX_SET, null) || { boss: '', bossL: 'ИЧТБ бошлиғи' }; }
        function nxOut(name: string, xlsxRows: any[], w: number[], html: string, title: string, kind: string): void {
            try {
                const f = kind === 'xlsx' ? { name: name + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: NX.fotXlsxBook([{ name: 'Маълумот', rows: xlsxRows, head: 2, w: w }]) }
                    : { name: name + '.pdf', mime: 'application/pdf', blob: NX.pdfBlobFromHtml(html) };
                if (typeof NX.exOpen === 'function') NX.exOpen([f], { title: title, act: 'dl' }); else NX.docDownload([f]);
            } catch (e) { console.error(e); NX.alert('⚠️ ' + String((e as any) && (e as any).message || e)); }
        }
        function nxHtml(t1: string, head: string[], rows: any[][], foot: string): string {
            return `<div style="font-family:'Times New Roman',serif;font-size:12pt;color:#000"><div style="text-align:center;font-weight:bold">${nxE(t1)}</div><div style="text-align:center;font-weight:bold;margin-bottom:8px">Маълумот</div>
                <table style="width:100%;border-collapse:collapse;font-size:10pt" border="1" cellpadding="3"><tr>${head.map(h => `<th style="border:1px solid #000">${nxE(h)}</th>`).join('')}</tr>
                ${rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #000;text-align:center">${nxE(c).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')}</table>
                <div style="margin-top:22px;display:flex;justify-content:space-between"><span>${nxE(foot.split('|')[0])}</span><span>${nxE(foot.split('|')[1] || '')}</span></div></div>`;
        }
        function nxFoot(): string { const S = nxSet(); return (S.bossL || 'ИЧТБ бошлиғи') + '|' + (S.boss || '____________'); }

        // ---------- 1) Gʻildirak juftligi sinishi: reestr qatori ----------
        var NX_F = [['sana', 'Sinish sanasi', 'date'], ['agregat', 'Tortuv agregati raqami', ''], ['vagon_joyi', 'Vagonning sostavdagi joyi', '', '12-чи вагон'], ['vagon', 'Vagon raqami', '', '00013404'],
            ['gildirak', 'Gʻildirak juftligi raqami', '', '52960'], ['gl_tamir', 'Gʻildirakning oxirgi taʼmirlangan sanasi', 'date'], ['joy', 'Singan joyi', 'sel:Шейка қисми|Ўрта қисми|Бошқа'],
            ['qoyilgan', 'Gʻildirak qoʻyilgan joy', 'sel:ВХ|1-ТЙЦ|2-ТЙЦ'], ['defekt', 'Defektoskopdan oʻtgan sana', 'date'], ['kim', 'Kim tomonidan tekshirilgan', '', 'Familiya I.'], ['muddat', 'Gʻildirak ishlash muddati, yil', '', '16']];
        function nxNew(i?: number): void {
            NXS.edit = i == null ? -1 : i; const r: any = i != null && nxReg()[i] ? nxReg()[i] : { muddat: '16', qoyilgan: 'ВХ' };
            const inp = (f: any[]) => { const v = f[2] === 'date' ? nxIso(r[f[0]]) : String(r[f[0]] == null ? '' : r[f[0]]);
                if (String(f[2]).indexOf('sel:') === 0) { const O = f[2].slice(4).split('|'); if (v && O.indexOf(v) < 0) O.push(v); return `<label class="kq-l">${nxE(f[1])}<select id="nx_${f[0]}">${O.map((o: string) => `<option${o === v ? ' selected' : ''}>${nxE(o)}</option>`).join('')}</select></label>`; }
                return `<label class="kq-l">${nxE(f[1])}<input id="nx_${f[0]}" ${f[2] === 'date' ? 'type="date"' : ''} value="${nxE(v)}" placeholder="${nxE(f[3] || '')}"${f[0] === 'vagon' ? ' onchange="nxPass()"' : ''}></label>`; };
            NX.mdl('nxM', `<div class="px-h"><b>⚙️ Gʻildirak juftligi sinishi${i != null ? ' — tahrir' : ''}</b><button class="mini-btn" onclick="mdlClose('nxM')">✕</button></div>
                <div class="nd-tip">Bir marta kiriting — jadval (Маълумот), «Oʻq sinishi» dalolatnomasi va «Вагон таъмири» maʼlumotnomasi shundan tuziladi. Vagon raqami yozilganda pasportdan ishlab chiqarilgan yil va oxirgi taʼmir oʻzi qoʻyiladi.</div>
                ${NX_F.map(inp).join('')}<div id="nxPassI" class="nd-tip"></div>
                <div class="nv-btns"><button onclick="nxSave()">💾 Saqlash</button>${i != null ? `<button style="background:#b91c1c" onclick="nxDel(${i})">🗑 Oʻchirish</button>` : ''}</div>`, true);
            nxPass();
        }
        function nxPass(): void { const box = NX.$id('nxPassI'); if (!box) return; const v = nxV((NX.$id('nx_vagon') || {}).value); if (!v) { box.innerHTML = (NX.$id('nx_vagon') || {}).value ? '⚠️ Bu raqamli vagon pasportda topilmadi' : ''; return; } const R = nxRep(v); box.innerHTML = `Pasportdan: ${nxE(v.type || '')} · ishlab chiqarilgan ${nxE(R.yil || '—')} · oxirgi DR ${nxE(nxDmy(R.DR) || '—')} · KR ${nxE(nxDmy(R.KR) || '—')}`; }
        function nxSave(): void {
            const g = (k: string) => String((NX.$id('nx_' + k) || {}).value || '').trim(), L = nxReg();
            if (!g('sana') || !g('vagon')) { NX.alert('Sinish sanasi va vagon raqamini kiriting.'); return; }
            const v = nxV(g('vagon')), R = nxRep(v), lr = R.DR || R.KR ? (R.KR > R.DR ? 'КР ' + nxDmy(R.KR) : 'ДР ' + nxDmy(R.DR)) : '';
            const old = NXS.edit >= 0 ? L[NXS.edit] : null;
            const r: any = Object.assign({}, old || {}, { sana: nxDmy(g('sana')), agregat: g('agregat'), vagon_joyi: g('vagon_joyi'), vagon: g('vagon'), gildirak: g('gildirak'), gl_tamir: nxDmy(g('gl_tamir')), joy: g('joy'), qoyilgan: g('qoyilgan'), defekt: nxDmy(g('defekt')), kim: g('kim'), muddat: g('muddat') || '16' });
            if (!r.vag_tamir || !old) r.vag_tamir = lr; if (!r.yil || !old) r.yil = R.yil || r.yil || '';
            const y = +String(nxIso(r.sana)).slice(0, 4); r.ishlagan = r.yil && y ? String(y - +r.yil) : (r.ishlagan || '');
            const N = L.slice(); if (old) N[NXS.edit] = r; else N.push(r);
            N.sort((a: any, b: any) => String(nxIso(a.sana)).localeCompare(String(nxIso(b.sana)))); N.forEach((x: any, k: number) => { x.n = k + 1; });
            NX.kvSet('agmk_gj_v1', { rows: N, file: 'ilova (Noxush hodisalar)', at: new Date().toISOString(), by: NX.authorStr() }); nxApply(N);
            NX.mdlClose('nxM'); try { NX.showToast('💾 Jadvalga yozildi: ' + r.vagon + ' — ' + r.sana); } catch (e) { /* */ }
            const k = nxReg().indexOf(r); nxRow(k >= 0 ? k : nxReg().length - 1);
        }
        async function nxDel(i: number): Promise<void> { const L = nxReg(), r = L[i]; if (!r) return; if (!(await NX.uiConfirm('Jadvaldan oʻchirilsinmi: ' + r.vagon + ' — ' + r.sana + '?'))) return; const N = L.filter((x: any, k: number) => k !== i); N.forEach((x: any, k: number) => { x.n = k + 1; }); NX.kvSet('agmk_gj_v1', { rows: N, file: 'ilova (Noxush hodisalar)', at: new Date().toISOString(), by: NX.authorStr() }); nxApply(N); NX.mdlClose('nxM'); nxRefresh(); }
        function nxRow(i: number): void {
            const r = nxReg()[i]; if (!r) { nxRefresh(); return; }
            NX.mdl('nxR', `<div class="px-h"><b>⚙️ ${nxE(r.sana)} · vagon ${nxE(r.vagon)}</b><button class="mini-btn" onclick="mdlClose('nxR')">✕</button></div>
                <div class="nd-tip">Gʻildirak ${nxE(r.gildirak || '—')} · ${nxE(r.joy || '')} · agregat ${nxE(r.agregat || '—')} ${nxE(r.vagon_joyi || '')}</div>
                <div class="ms-big" onclick="mdlClose('nxR');nxAkt(${i})"><span>📄</span><div><b>Dalolatnoma — oʻq sinishi</b><small>«noxush hodisadan keyingi texnik holati toʻgʻrisida» — jadvaldan oʻzi toʻladi</small></div></div>
                <div class="ms-big" onclick="nxVtm(${i},'xlsx')"><span>📊</span><div><b>Вагон таъмири тўғрисида Маълумот — Excel</b><small>agregat, joyi, vagon, yil, gʻildirak va KR sanasi</small></div></div>
                <div class="ms-big" onclick="nxVtm(${i},'pdf')"><span>📄</span><div><b>Вагон таъмири тўғрисида Маълумот — PDF</b></div></div>
                <div class="nv-btns"><button onclick="mdlClose('nxR');nxNew(${i})">✏️ Tahrirlash</button></div>`, true);
            nxRefresh();
        }
        function nxAkt(i: number): void {
            const r = nxReg()[i]; if (!r) return;
            try { NX.hsNewAkt('oq_sinish'); const f = NX.ND && NX.ND.form; if (f) { f.vag = r.vagon; const s = nxIso(r.sana); if (s) { f.sana = s; } } if (typeof NX.ndRender === 'function') NX.ndRender(); } catch (e) { console.error(e); }
            setTimeout(() => { try { const el = NX.$id('ndVag'); if (el) { el.value = r.vagon; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } } catch (e) { /* */ } }, 150);
        }
        // ---------- 2) Jadval: «СТТБда YYYY йилда ғилдирак жуфтлигининг синганлиги тўғрисида Маълумот» ----------
        var NX_RH = ['Т/р', 'Ғилдиракнинг синган санаси', 'Тортув агрегати рақами', 'Вагон составдаги жойлашуви', 'Вагон рақами', 'Вагоннинг охирги таьмирланган санаси', 'Ишлаб чиқарилган санаси, йил', 'Ғилдирак ишлаш муддати, йил', 'Ғилдирак ишлаган вақти, йил', 'Ғилдирак рақами', 'Ғилдиракнинг охирги таьмирланган санаси', 'Синган жойи', 'Ғилдирак қўйилган жой', 'Дефектоскопдан ўтилган ёки ўтилмаган', 'Ким томондан текширилган'];
        function nxRegRows(y: string): any[][] { return nxReg().filter((r: any) => !y || nxYear(r) === y).map((r: any, k: number) => [k + 1, r.sana, r.agregat, r.vagon_joyi, r.vagon, r.vag_tamir, r.yil, r.muddat, r.ishlagan, r.gildirak, r.gl_tamir, r.joy, r.qoyilgan, r.defekt, r.kim]); }
        function nxRegOut(kind: string): void {
            const y = NXS.y || String(new Date().getFullYear()), t1 = 'СТТБда ' + y + ' йилда ғилдирак жуфтлигининг синганлиги тўғрисида', R = nxRegRows(y), F = nxFoot().split('|');
            nxOut('Gildirak_sinishlari_' + y, [[t1], ['Маълумот'], NX_RH].concat(R).concat([[], ['', F[0], '', '', '', '', '', '', '', F[1]]]), [5, 12, 10, 12, 11, 14, 10, 9, 9, 13, 13, 12, 10, 13, 16], nxHtml(t1, NX_RH, R, nxFoot()), 'Gʻildirak sinishlari — ' + y, kind);
        }
        function nxVtm(i: number, kind: string): void {
            const r = nxReg()[i]; if (!r) return; const v = nxV(r.vagon), R = nxRep(v), t1 = 'Вагон таъмири тўғрисида';
            const H = ['Т/р', 'Тортув агрегати рақами', 'Вагон составдаги жойлашуви', 'Вагон рақами', 'Ишлаб чиқарилган санаси, йил', 'Ғилдиракнинг охирги таьмирланган санаси', 'Охирги таьмирланган КР санаси'];
            const row = [1, r.agregat, r.vagon_joyi, r.vagon, r.yil || R.yil, r.gl_tamir, nxDmy(R.KR)];
            const F = nxFoot().split('|');
            nxOut('Vagon_tamiri_' + nxNo(r.vagon) + '_' + String(nxIso(r.sana)), [[t1], ['Маълумот'], H, row, [], ['', F[0], '', '', '', F[1]]], [5, 12, 14, 12, 12, 16, 16], nxHtml(t1, H, [row], nxFoot()), 'Vagon taʼmiri — ' + r.vagon, kind);
        }
        // ---------- 4) Oʻzaro tekshiruv ----------
        function nxParseAkt(t: string, name: string): any {
            const s = String(t || '').replace(/\s+/g, ' '), g = (re: RegExp) => { const m = s.match(re); return m ? m[1] : ''; };
            return { name: name, doc: g(/(?:Olmaliq|Олмалиқ)\s*sh?\.?\s*([\d.]{8,10})/i), hs: g(/shu haqidaki,?\s*([\d.]{8,10})/i), vagon: g(/zavod raqami\s*(\d{3,})\s*bo.lgan vagon/i), gj: g(/(\d{3,})\s*-?\s*raqamli g.ildirak/i),
                vx: g(/oxirgi marta\s*([\d.]{8,10})/i), yil: g(/topshirilgan yili\s*(\d{4})/i), korr: g(/yuzasining\s*(\d+)\s*%/i), joy: g(/o.qning\s+(\S+)\s+qismi/i), body: s.replace(/«\s*\d+\s*»|Olmaliq sh\.?\s*[\d.]+-?y?\.?/gi, '').slice(0, 1500) };
        }
        async function nxDocxText(file: any): Promise<string> {
            const z = await NX.hsZipFiles(await file.arrayBuffer()); if (!z['word/document.xml']) throw new Error('Word fayl emas'); const xml = new TextDecoder().decode(await z['word/document.xml']());
            const d = new DOMParser().parseFromString(xml, 'application/xml'), W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
            return Array.from(d.getElementsByTagNameNS(W, 'p')).map((p: any) => Array.from(p.getElementsByTagNameNS(W, 't')).map((t: any) => t.textContent).join('')).join('\n');
        }
        async function nxChkFiles(inp: any): Promise<void> {
            const F = Array.from(inp.files || []) as any[]; inp.value = ''; const A: any[] = [];
            for (const f of F) { try { A.push(nxParseAkt(await nxDocxText(f), f.name)); } catch (e) { A.push({ name: f.name, err: String((e as any) && (e as any).message || e) }); } }
            NXS.chk = A; nxChk();
        }
        function nxCheck(up: any[]): any[] {
            const out: any[] = [], add = (lvl: string, t: string) => out.push({ lvl: lvl, t: t }), reg = nxReg(), y = NXS.y;
            const app = (typeof NX.ndAkts === 'function' ? NX.ndAkts() : []).filter((a: any) => a.tur === 'oq_sinish').map((a: any) => Object.assign(nxParseAkt(a.text || '', '📱 arxiv: ' + (a.title || '').slice(0, 40) + ' (' + nxDmy(a.sana) + ')'), { app: 1 }));
            const akts = app.concat((up || []).filter((a: any) => !a.err));
            (up || []).filter((a: any) => a.err).forEach((a: any) => add('blue', '📄 ' + a.name + ': oʻqilmadi (' + a.err + ')'));
            const R = reg.filter((r: any) => !y || nxYear(r) === y), key = (no: any, d: any) => nxNo(no) + '|' + nxIso(d);
            R.forEach((r: any) => {
                const v = nxV(r.vagon), P = nxRep(v), mine = akts.filter((a: any) => nxNo(a.vagon) === nxNo(r.vagon) && (!a.hs || nxIso(a.hs) === nxIso(r.sana)));
                if (!mine.length) add('blue', `📋 Jadval ${r.n}-qator (${r.sana}, vagon ${r.vagon}): dalolatnomasi topilmadi`);
                mine.forEach((a: any) => { const cmp = (lab: string, x: any, z: any) => { if (x && z && nxNo(x) !== nxNo(z) && String(x).trim() !== String(z).trim()) add('red', `${a.name}: ${lab} — aktda «${x}», jadvalda «${z}» (vagon ${r.vagon}, ${r.sana})`); };
                    cmp('gʻildirak raqami', a.gj, r.gildirak); cmp('oʻq yili', a.yil, r.yil); if (a.vx && r.gl_tamir && nxIso(a.vx) !== nxIso(r.gl_tamir)) add('red', `${a.name}: gʻildirakning oxirgi taʼmiri — aktda ${a.vx}, jadvalda ${r.gl_tamir}`); });
                if (r.defekt && r.gl_tamir && nxIso(r.defekt) !== nxIso(r.gl_tamir)) add('blue', `📋 Jadval ${r.n}-qator (vagon ${r.vagon}): defektoskopiya ${r.defekt}, gʻildirak taʼmiri ${r.gl_tamir} — bir xil boʻlishi kutiladi, tekshiring`);
                if (r.qoyilgan && !/^(ВХ|1-ТЙЦ|2-ТЙЦ)$/i.test(String(r.qoyilgan).trim())) add('blue', `📋 Jadval ${r.n}-qator (vagon ${r.vagon}): «Ғилдирак қўйилган жой» = «${r.qoyilgan}» — VX / 1-TYS / 2-TYS emas (yozuv xatosi?)`);
                if (v && P.yil && r.yil && P.yil !== String(r.yil).trim()) add('blue', `📋 Jadval ${r.n}-qator: vagon ${r.vagon} ishlab chiqarilgan yili jadvalda ${r.yil}, pasportda ${P.yil}`);
                if (!v) add('blue', `📋 Jadval ${r.n}-qator: vagon ${r.vagon} pasportda topilmadi`);
            });
            akts.forEach((a: any) => { if (!a.vagon) { add('blue', `${a.name}: vagon raqami matndan topilmadi`); return; } if (!R.some((r: any) => key(r.vagon, r.sana) === key(a.vagon, a.hs || a.doc)) && (!y || String(nxIso(a.hs || a.doc)).slice(0, 4) === y)) add('blue', `${a.name}: hodisa (${a.hs || a.doc}, vagon ${a.vagon}) jadvalda yoʻq`); });
            // bir xil matnli aktlar (nusxa)
            const seen: any = {}; akts.forEach((a: any) => { const k = a.body; if (!k) return; if (seen[k]) add('red', `${a.name}: matni «${seen[k].name}» bilan aynan bir xil (sana ${a.hs || '—'}, vagon ${a.vagon}) — boshqa hodisa uchun nusxalanib, oʻzgartirilmagan boʻlishi mumkin`); else seen[k] = a; });
            up.forEach((a: any) => { const m = String(a.name || '').match(/(\d{2})\.(\d{2})\.(\d{2,4})/); if (m && a.hs) { const fy = m[3].length === 2 ? '20' + m[3] : m[3]; if (nxIso(a.hs) !== fy + '-' + m[2] + '-' + m[1]) add('blue', `${a.name}: fayl nomidagi sana ${m[0]}, matndagi hodisa sanasi ${a.hs}`); } });
            return out;
        }
        function nxChk(): void {
            const F = nxCheck(NXS.chk || []), red = F.filter(f => f.lvl === 'red').length;
            NX.mdl('nxC', `<div class="px-h"><b>🔍 Oʻzaro tekshiruv${NXS.y ? ' · ' + nxE(NXS.y) : ''}</b><button class="mini-btn" onclick="mdlClose('nxC')">✕</button></div>
                <div class="nd-tip">Jadval (${nxReg().filter((r: any) => !NXS.y || nxYear(r) === NXS.y).length} qator) ↔ ilovadagi «Oʻq sinishi» dalolatnomalari ↔ ${NXS.chk ? NXS.chk.length + ' ta yuklangan Word fayl ↔ ' : ''}vagon pasporti.</div>
                <label class="alb-btn">📥 Dalolatnoma fayllarini qoʻshish (Word, bir nechta)<input type="file" multiple accept=".docx" style="display:none" onchange="nxChkFiles(this)"></label>
                <div class="kq-h">${F.length ? (red ? '❌ ' + red + ' ta xato · ' : '') + '🔷 ' + (F.length - red) + ' ta tekshirish kerak' : '✅ Nomuvofiqlik topilmadi'}</div>
                ${F.map(f => `<div class="nx-f ${f.lvl}">${f.lvl === 'red' ? '❌' : '🔷'} ${nxE(f.t)}</div>`).join('')}`, true);
        }
        // ---------- 5) Boʻlim: «📄 Dalolatnomalar» → «⚠️ Noxush hodisalar» ----------
        function nxRefresh(): void { try { if (NX.HS && NX.HS.akt === 'noxush') NX.hsRender(); } catch (e) { /* */ } }
        function nxBoss(): void { // 5.8: imzo chekuvchi — Kolodka dalolatnomasidagi oyna bilan (seh → lavozim → xodim)
            if (typeof NX.agmkPickPerson === 'function') { NX.agmkPickPerson('👤 Maʼlumotnoma tagidagi imzo', (pp: any) => { NX.kvSet(NX_SET, Object.assign({}, nxSet(), { bossL: (pp.l || '').trim() || 'ИЧТБ бошлиғи', boss: (pp.n || '').trim() })); nxRefresh(); }, 'uz'); return; }
            const S = nxSet(); const b = prompt('Maʼlumotnoma tagidagi imzo (lavozim | F.I.Sh.):', (S.bossL || 'ИЧТБ бошлиғи') + ' | ' + (S.boss || '')); if (b == null) return; const p = b.split('|'); NX.kvSet(NX_SET, { bossL: (p[0] || '').trim() || 'ИЧТБ бошлиғи', boss: (p[1] || '').trim() }); nxRefresh(); }
        (function () {
            try { if (Array.isArray(NX.HS_AKT) && !NX.HS_AKT.some((c: any) => c.k === 'noxush')) NX.HS_AKT.push({ k: 'noxush', ic: '⚠️', t: 'Noxush hodisalar (gʻildirak juftligi sinishi)', types: [] }); } catch (e) { /* */ }
            if (typeof NX.hsRender === 'function') NX.hsRender = NX.agmkExtend('hsRender', '5.2: Noxush hodisalar', NX.hsRender, (o: Function) => function (this: unknown) {
                const r = o.apply(this, arguments);
                try {
                    const HS = NX.HS; if (!HS || HS.tab !== 'akt') return r; const b = NX.secBody ? NX.secBody('screen-hisob') : null; if (!b) return r;
                    if (!HS.akt) { b.querySelectorAll('.hs-grid .hs-card').forEach((c: any) => { if (/HS\.akt='noxush'/.test(c.getAttribute('onclick') || '')) { const s = c.querySelector('small'); if (s) s.textContent = nxReg().length + ' ta sinish'; } }); return r; }
                    if (HS.akt !== 'noxush') return r;
                    const years = Array.from(new Set(nxReg().map(nxYear).filter(Boolean))).sort().reverse();
                    if (!NXS.y) NXS.y = years[0] || String(new Date().getFullYear());
                    const R = nxReg().map((x: any, i: number) => [x, i]).filter((p: any) => nxYear(p[0]) === NXS.y), S = nxSet();
                    const card = (oc: string, t: string) => `<div class="db-two" onclick="${oc}"><button class="action-btn" onclick="event.stopPropagation();${oc}">${t}</button></div>`;
                    const back = b.querySelector('.hs-back');
                    b.innerHTML = (back ? back.outerHTML : '') + `<div class="hs-new card-list h9-list">${card('nxNew()', '➕ Gʻildirak juftligi sinishi — yangi hodisa')}${card('NXS.chk=null;nxChk()', '🔍 Oʻzaro tekshiruv (jadval ↔ dalolatnomalar ↔ pasport)')}</div>
                        <div class="bg-seg nx-yr">${years.concat(years.indexOf(NXS.y) < 0 ? [NXS.y] : []).map(y => `<button class="${y === NXS.y ? 'on' : ''}" onclick="NXS.y='${y}';hsRender()">${y}</button>`).join('')}</div>
                        <div class="hs-box"><div class="hs-h">⚙️ Gʻildirak juftligi sinishlari · ${nxE(NXS.y)} (${R.length})</div>
                            ${R.length ? '<div class="hs-list">' + R.map((p: any) => `<div class="hs-row" onclick="nxRow(${p[1]})"><b>${nxE(p[0].sana)} · vagon ${nxE(p[0].vagon)}</b><small>gʻildirak ${nxE(p[0].gildirak || '—')} · ${nxE(p[0].joy || '')} · agregat ${nxE(p[0].agregat || '—')} ${nxE(p[0].vagon_joyi || '')}</small></div>`).join('') + '</div>' : '<div class="nd-tip">Bu yil hodisa yoʻq.</div>'}
                            <div class="nv-btns"><button onclick="nxRegOut('xlsx')">📊 Маълумот — Excel</button><button onclick="nxRegOut('pdf')">📄 PDF</button></div>
                            <label class="alb-btn">🔄 Jadvalni Excel dan yangilash<input type="file" accept=".xls,.xlsx" style="display:none" onchange="gjImport(this)"></label></div>
                        <div class="nd-tip">Maʼlumotnomalar tagidagi imzo: <b>${nxE(S.bossL || 'ИЧТБ бошлиғи')} ${nxE(S.boss || '________')}</b> <button class="mini-btn" onclick="nxBoss()">✏️</button></div>`;
                    try { if (typeof NX.h9Tpl === 'function') NX.h9Tpl(b); } catch (e) { /* */ }
                } catch (e) { console.error(e); }
                return r;
            });
            const st = document.createElement('style');
            st.textContent = '.nx-f{padding:8px 10px;margin:5px 0;border-radius:10px;font-size:13px;border:1px solid rgba(148,163,184,.3)}.nx-f.red{border-color:#ef4444;background:rgba(239,68,68,.12)}.nx-f.blue{border-color:#38bdf8;background:rgba(56,189,248,.08)}.nx-yr{margin:10px 0}';
            document.head.appendChild(st);
        })();
        Object.assign(NX, { NXS: NXS, nxNew: nxNew, nxPass: nxPass, nxSave: nxSave, nxDel: nxDel, nxRow: nxRow, nxAkt: nxAkt, nxRegOut: nxRegOut, nxVtm: nxVtm, nxChk: nxChk, nxChkFiles: nxChkFiles, nxCheck: nxCheck, nxParseAkt: nxParseAkt, nxBoss: nxBoss, nxRep: nxRep });
