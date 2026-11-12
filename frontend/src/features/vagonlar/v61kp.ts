        // =====================================================================
        // 6.1 (140) — 🛞 GʻILDIRAK JUFTLIKLARI (muallif, 04.11.2026)
        //  • Boʻlim «🛞 Gʻildirak juftliklari»: har juftlik — raqami, turi, zavod, yili, oʻlchovlar (prokat, greben, gʻildirak qalinligi),
        //    oxirgi taʼmir (turi, sana), qaysi vagonda va qaysi oʻqda (1–6) yoki omborda; har koʻchirish tarixda.
        //  • «📥 Roʻyxatni yuklash» (Excel/CSV, sarlavha boʻyicha), «📄 Namuna fayl», «🧪 10 ta namuna qoʻshish» (NAMUNA belgili — tahrirlab asl raqam yoziladi).
        //  • Vagon pasportida «🛞 Gʻildirak juftliklari» tugmasi: shu vagondagilar, tahrirlash, almashtirish, olib qoʻyish
        //    (har taʼmirda gʻildiraklar oʻzgaradi — tarix saqlanadi).
        // =====================================================================
        const KP: any = window as any;
        var KPF: any = { q: '', f: 'all' };
        function kpS(): any { return KP.agmkStore('kp', { roles: ['mttb', 'rahbar'] }); }
        function kpCan(): boolean { try { return KP.isAdmin() || ['mttb', 'rahbar'].some((r: string) => KP.hasRole(r)); } catch (e) { return false; } }
        function kpE(s: any): string { return KP.escapeHtml(String(s == null ? '' : s)); }
        function kpVag(id: any): any { try { return KP.onlyVagons().find((v: any) => String(v.id) === String(id)) || null; } catch (e) { return null; } }
        function kpVNo(v: any): string { return v ? String(v.num || v.raqam || v.inv || v.id) : ''; }
        function kpAxles(v: any): number { return /2VS-105|Q-?115/i.test(String(v && v.type || '')) ? 6 : 4; } // 2VS-105 — 6 oʻqli (ikki 3 oʻqli aravacha); 6VS-60 va boshqalar — 4 oʻqli
        function kpOf(vid: any): any[] { return kpS().all().filter((k: any) => String(k.vid || '') === String(vid)).sort((a: any, b: any) => (+a.pos || 9) - (+b.pos || 9)); }
        var KP_FIELDS: any[] = [['no', 'Juftlik raqami'], ['tip', 'Turi (RU1-950 …)'], ['zavod', 'Zavod'], ['year', 'Ishlab chiqarilgan yili'], ['prokat', 'Prokat, mm'], ['greben', 'Greben, mm'], ['obod', 'Gʻildirak qalinligi, mm'], ['rep', 'Oxirgi taʼmir turi'], ['repD', 'Oxirgi taʼmir sanasi'], ['note', 'Izoh']];
        var KP_HDR: any = { no: /(juftlik|пар[аы]?)\s*(raqam|№|номер)|^№\s*(к\.?\s*п|kp)|номер колесн|raqami$/i, tip: /^(turi|тип)/i, zavod: /zavod|завод|изготов/i, year: /yil|год/i, prokat: /prokat|прокат/i, greben: /greben|гребн/i, obod: /qalinlig|толщин|обод/i, rep: /taʼmir turi|ta'mir turi|вид ремонт|ремонт$/i, repD: /taʼmir sana|ta'mir sana|дата ремонт|последн/i, vag: /vagon|вагон/i, pos: /oʻq|o'q|ось|позиц/i, note: /izoh|примеч/i };

        function kpOpen(): void { KP.secScreen('screen-kp', '🛞 Gʻildirak juftliklari', "openScreen('screen-main')"); KP.openScreen('screen-kp'); kpDraw(); }
        function kpDraw(): void {
            const b = KP.secBody('screen-kp'); if (!b) return;
            const L = kpS().all(), q = KPF.q.toLowerCase();
            const F = L.filter((k: any) => (KPF.f === 'all' || (KPF.f === 'on' ? k.vid : !k.vid)) && (!q || [k.no, k.tip, k.zavod, kpVNo(kpVag(k.vid))].join(' ').toLowerCase().indexOf(q) >= 0)).sort((a: any, c: any) => String(a.no).localeCompare(String(c.no), undefined, { numeric: true }));
            const on = L.filter((k: any) => k.vid).length, sam = L.filter((k: any) => k.sample).length;
            b.innerHTML = `<div class="qb">
              <div class="qb-bar">${[['all', 'Hammasi ' + L.length], ['on', 'Vagonda ' + on], ['off', 'Omborda ' + (L.length - on)]].map(([k, t]) => `<button class="pg-c${KPF.f === k ? ' on' : ''}" onclick="KPF.f='${k}'; kpDraw()">${t}</button>`).join('')}<span class="qb-sp"></span>
                ${kpCan() ? `<label class="mini-btn">📥 Roʻyxatni yuklash<input type="file" accept=".xlsx,.xls,.csv" hidden onchange="kpImport(this)"></label><button class="mini-btn" onclick="kpTemplate()">📄 Namuna fayl</button>${L.length ? '' : '<button class="mini-btn" onclick="kpSamples()">🧪 10 ta namuna qoʻshish</button>'}<button class="qb-new" onclick="kpEdit()">＋ Juftlik</button>` : ''}</div>
              ${sam ? `<div class="sl-warn">🧪 ${sam} ta yozuv — NAMUNA (soxta raqam). Har birini oching va asl raqamini yozing — «NAMUNA» belgisi oʻzi olinadi.</div>` : ''}
              <input class="qb-q" placeholder="🔍 Juftlik raqami, turi, zavod yoki vagon raqami…" value="${kpE(KPF.q)}" oninput="KPF.q=this.value; clearTimeout(KPF.t); KPF.t=setTimeout(kpDraw,300)">
              <div class="qb-tw"><table class="qb-t v"><tr><th>Juftlik №</th><th>Turi</th><th>Zavod · yil</th><th>Prokat</th><th>Greben</th><th>Qalinlik</th><th>Oxirgi taʼmir</th><th>Qayerda</th></tr>
              ${F.map((k: any) => { const v = kpVag(k.vid); return `<tr onclick="kpEdit('${k.id}')" style="cursor:pointer"><td><b>${kpE(k.no)}</b>${k.sample ? ' <span class="qb-st w">NAMUNA</span>' : ''}</td><td>${kpE(k.tip)}</td><td>${kpE(k.zavod)} ${kpE(k.year)}</td><td class="r">${kpE(k.prokat)}</td><td class="r">${kpE(k.greben)}</td><td class="r">${kpE(k.obod)}</td><td>${kpE(k.rep)} ${kpE(k.repD ? KP.fmtISO(k.repD) : '')}</td><td>${v ? '🚃 № ' + kpE(kpVNo(v)) + (k.pos ? ' · ' + kpE(k.pos) + '-oʻq' : '') : '🏬 omborda'}</td></tr>`; }).join('') || '<tr><td colspan="8">Yozuv yoʻq</td></tr>'}</table></div>
              <div class="nd-tip">ℹ️ Har taʼmirda gʻildiraklar almashadi: vagon pasportidagi «🛞 Gʻildirak juftliklari» tugmasi orqali almashtiring — qachon, qaysi vagondan qaysi vagonga oʻtgani tarixda qoladi.</div></div>`;
        }
        function kpEdit(id?: string, vid?: string, pos?: number): void {
            const k = id ? kpS().get(id) : { vid: vid || '', pos: pos || '' };
            if (!k) return; const ed = kpCan(), dis = ed ? '' : ' disabled';
            const V = KP.onlyVagons().slice().sort((a: any, b: any) => kpVNo(a).localeCompare(kpVNo(b), undefined, { numeric: true }));
            const hist = (k.hist || []).slice().reverse().map((h: any) => `<div class="kp-h">${kpE(KP.fmtDT(h.at))} · ${h.from ? '№ ' + kpE(h.from) : 'ombor'} → ${h.to ? '№ ' + kpE(h.to) : 'ombor'}${h.pos ? ' (' + kpE(h.pos) + '-oʻq)' : ''} · ${kpE(h.by || '')}${h.note ? ' · ' + kpE(h.note) : ''}</div>`).join('');
            KP.mdl('kpE', `<div class="px-h"><b>🛞 Gʻildirak juftligi ${kpE(k.no || '(yangi)')}</b><button class="mini-btn" onclick="mdlClose('kpE')">✕</button></div>
              <div class="qb-g">${KP_FIELDS.map(([f, t]) => `<label class="qb-f"><small>${t}</small><input id="kpF_${f}" ${f === 'repD' ? 'type="date"' : ''} value="${kpE(k[f] || '')}"${dis}></label>`).join('')}</div>
              <div class="qb-g" style="margin-top:8px"><label class="qb-f"><small>Qaysi vagonda</small><select id="kpF_vid"${dis}><option value="">🏬 Omborda</option>${V.map((v: any) => `<option value="${kpE(v.id)}"${String(v.id) === String(k.vid || '') ? ' selected' : ''}>№ ${kpE(kpVNo(v))} · ${kpE(v.type || '')}</option>`).join('')}</select></label>
                <label class="qb-f"><small>Oʻq (1–6)</small><input id="kpF_pos" type="number" min="1" max="6" value="${kpE(k.pos || '')}"${dis}></label><label class="qb-f"><small>Almashtirish sababi (tarix uchun)</small><input id="kpF_why" placeholder="masalan: DR, obtochka"${dis}></label></div>
              ${hist ? `<div class="qb-h">🕓 Tarix</div>${hist}` : ''}
              ${ed ? `<div class="pk-btns">${id ? `<button onclick="kpDel('${id}')">🗑</button>` : ''}<button onclick="mdlClose('kpE')">Bekor</button><button class="pr" onclick="kpSave('${id || ''}')">💾 Saqlash</button></div>` : ''}`, true);
        }
        function kpMove(k: any, vid: string, pos: any, why: string): void {
            const from = kpVNo(kpVag(k.vid)), to = kpVNo(kpVag(vid));
            if (String(k.vid || '') !== String(vid || '') || String(k.pos || '') !== String(pos || '')) { let by = ''; try { by = KP.authorStr(); } catch (e) { /* */ } (k.hist = k.hist || []).push({ at: new Date().toISOString(), from: from, to: to, pos: pos || '', by: by, note: why || '' }); }
            k.vid = vid || ''; k.pos = vid ? (pos || '') : '';
        }
        function kpSave(id: string): void {
            if (!kpCan()) return; const k = id ? kpS().get(id) : {}; if (id && !k) return;
            const g = (f: string) => String((KP.$id('kpF_' + f) || {}).value || '').trim();
            const no = g('no'); if (!no) { KP.alert('Juftlik raqamini kiriting.'); return; }
            const dup = kpS().all().find((x: any) => x.id !== id && String(x.no).trim() === no); if (dup) { KP.alert('№ ' + no + ' allaqachon bor.'); return; }
            const wasNo = k.no; KP_FIELDS.forEach(([f]) => { k[f] = g(f); }); if (k.sample && wasNo !== no) delete k.sample;
            const vid = g('vid'), pos = g('pos');
            if (vid && pos) { const busy = kpOf(vid).find((x: any) => x.id !== id && String(x.pos) === pos); if (busy) { KP.alert(pos + '-oʻqda № ' + busy.no + ' turibdi — avval uni olib qoʻying yoki boshqa oʻq tanlang.'); return; } }
            kpMove(k, vid, pos, g('why'));
            try { kpS().put(k); } catch (e) { KP.alert('⚠️ ' + ((e as any).message || e)); return; }
            KP.mdlClose('kpE'); KP.showToast('💾 Saqlandi: № ' + no); try { kpDraw(); } catch (e) { /* */ } kpPassRefresh();
        }
        function kpDel(id: string): void { KP.uiConfirm('Bu juftlik oʻchirilsinmi?').then((ok: boolean) => { if (!ok) return; kpS().del(id); KP.mdlClose('kpE'); try { kpDraw(); } catch (e) { /* */ } kpPassRefresh(); }); }
        function kpSamples(): void {
            if (!kpCan()) return; const V = KP.onlyVagons().filter((v: any) => /2VS-105/.test(String(v.type || ''))).slice(0, 1);
            for (let i = 1; i <= 10; i++) { const v = i <= 6 && V[0]; const k: any = { no: 'NAMUNA-' + String(i).padStart(3, '0'), tip: 'RU1-950', zavod: 'Namuna zavodi', year: String(2015 + (i % 8)), prokat: String(2 + (i % 4)), greben: String(28 + (i % 4)), obod: String(50 + i * 2), rep: i % 3 ? 'Obtochka' : 'Oʻrta taʼmir', repD: '2026-0' + (1 + (i % 9)) + '-15', sample: true, vid: '', pos: '' };
                if (v) kpMove(k, v.id, i, 'namuna'); kpS().put(k); }
            KP.showToast('🧪 10 ta namuna qoʻshildi — asl raqamlarni yozib chiqing'); kpDraw();
        }
        function kpTemplate(): void {
            const rows = [['Juftlik raqami', 'Turi', 'Zavod', 'Ishlab chiqarilgan yili', 'Prokat, mm', 'Greben, mm', 'Gʻildirak qalinligi, mm', 'Oxirgi taʼmir turi', 'Oxirgi taʼmir sanasi', 'Vagon raqami', 'Oʻq', 'Izoh']];
            for (let i = 1; i <= 10; i++) rows.push(['NAMUNA-' + String(i).padStart(3, '0'), 'RU1-950', 'Namuna zavodi', String(2015 + (i % 8)), String(2 + (i % 4)), String(28 + (i % 4)), String(50 + i * 2), 'Obtochka', '15.0' + (1 + (i % 9)) + '.2026', '', '', 'asl raqamni yozing']);
            const q = (s: any) => '"' + String(s).replace(/"/g, '""') + '"', blob = new Blob(['﻿' + rows.map(r => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Gildirak_juftliklari_namuna.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
        }
        async function kpImport(inp: any): Promise<void> {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f || !kpCan()) return;
            let rows: any[] = [];
            try { if (/\.csv$/i.test(f.name)) { const t = await f.text(); const sep = (t.split('\n')[0].match(/;/g) || []).length >= (t.split('\n')[0].match(/,/g) || []).length ? ';' : ','; rows = t.replace(/^﻿/, '').split(/\r?\n/).filter((l: string) => l.trim()).map((l: string) => (l.match(new RegExp('("([^"]|"")*"|[^' + sep + ']*)(' + sep + '|$)', 'g')) || []).slice(0, -1).map((c: string) => c.replace(new RegExp(sep + '$'), '').replace(/^"|"$/g, '').replace(/""/g, '"').trim())); }
                  else { const r = await KP.hsReadAny(f); rows = r.rows || []; } } catch (e) { KP.alert('⚠️ Faylni oʻqib boʻlmadi: ' + ((e as any).message || e)); return; }
            let h = -1, map: any = {};
            for (let i = 0; i < Math.min(rows.length, 15) && h < 0; i++) { const m: any = {}; (rows[i] || []).forEach((c: any, j: number) => { const s = String(c || '').trim(); Object.keys(KP_HDR).forEach(k => { if (m[k] == null && s && KP_HDR[k].test(s)) m[k] = j; }); }); if (m.no != null) { h = i; map = m; } }
            if (h < 0) { KP.alert('Sarlavha topilmadi: «Juftlik raqami» ustuni kerak. «📄 Namuna fayl» ni yuklab, shu shaklda toʻldiring.'); return; }
            const V = KP.onlyVagons(), byNo: any = {}; kpS().all().forEach((k: any) => { byNo[String(k.no).trim()] = k; });
            const cell = (r: any[], k: string) => map[k] == null ? '' : String(r[map[k]] == null ? '' : r[map[k]]).trim();
            const dt = (s: string) => { const m = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(s); return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : (/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : ''); };
            let add = 0, upd = 0, miss: string[] = [];
            for (const r of rows.slice(h + 1)) {
                const no = cell(r, 'no'); if (!no) continue;
                const k = byNo[no] || {}; const isNew = !k.id;
                ['tip', 'zavod', 'year', 'prokat', 'greben', 'obod', 'rep', 'note'].forEach(f => { const v = cell(r, f); if (v) k[f] = v; }); const d = dt(cell(r, 'repD')); if (d) k.repD = d; k.no = no; if (!/^NAMUNA/.test(no)) delete k.sample;
                const vn = cell(r, 'vag').replace(/\D/g, ''); if (vn) { const v = V.find((x: any) => kpVNo(x).replace(/\D/g, '') === vn); if (v) kpMove(k, v.id, cell(r, 'pos'), 'roʻyxatdan'); else miss.push(vn); }
                kpS().put(k); byNo[no] = k; if (isNew) add++; else upd++;
            }
            KP.alert('📥 Yuklandi: yangi ' + add + ', yangilandi ' + upd + (miss.length ? '\nTopilmagan vagonlar: ' + Array.from(new Set(miss)).slice(0, 10).join(', ') : ''));
            kpDraw();
        }
        // ---------- vagon pasportida ----------
        var KPV: any = { id: '' };
        function kpCurV(): any { return KPV.id ? kpVag(KPV.id) : null; }
        function kpPassBtn(): void {
            try {
                const v = kpCurV(), t = KP.$id('pasportMainTitle'), host = t && t.closest('.passport-container'), old = KP.$id('kp61Box');
                if (!v || !host) { if (old) old.remove(); return; }
                const L = kpOf(v.id), box = old || document.createElement('div'); box.id = 'kp61Box'; box.className = 'kp-box';
                box.innerHTML = `<button class="kp-b" onclick="kpPass()">🛞 Gʻildirak juftliklari <b>${L.length}/${kpAxles(v)}</b></button><small>${L.length ? L.map((k: any) => (k.pos ? k.pos + ': ' : '') + kpE(k.no)).join(' · ') : 'kiritilmagan'}</small>`;
                const ti = host.querySelector('.passport-title'); if (!old || box.parentNode !== host) ti.parentNode.insertBefore(box, ti.nextSibling);
            } catch (e) { console.error('6.1 gʻildirak', e); }
        }
        function kpPassRefresh(): void { try { kpPassBtn(); if (KP.$id('kpP') && !KP.$id('kpP').classList.contains('hidden')) kpPass(); } catch (e) { /* */ } }
        function kpPass(): void {
            const v = kpCurV(); if (!v) return;
            const n = kpAxles(v), L = kpOf(v.id), ed = kpCan(), free = kpS().all().filter((k: any) => !k.vid);
            const rows = Array.from({ length: n }, (_, i) => { const k = L.find((x: any) => +x.pos === i + 1); return `<div class="kp-ax"><span class="kp-n">${i + 1}-oʻq</span>${k ? `<div class="kp-i" onclick="kpEdit('${k.id}')"><b>№ ${kpE(k.no)}</b>${k.sample ? ' <span class="qb-st w">NAMUNA</span>' : ''}<small>${kpE(k.tip)} · prokat ${kpE(k.prokat || '—')} · greben ${kpE(k.greben || '—')} · qalinlik ${kpE(k.obod || '—')} · ${kpE(k.rep || '')} ${kpE(k.repD ? KP.fmtISO(k.repD) : '')}</small></div>${ed ? `<button class="mini-btn" onclick="kpOff('${k.id}')">↩ Olib qoʻyish</button>` : ''}` : `<div class="kp-i e">— boʻsh —</div>${ed ? `<button class="mini-btn" onclick="kpPut('${v.id}',${i + 1})">＋ Oʻrnatish</button>` : ''}`}</div>`; }).join('');
            const extra = L.filter((k: any) => !(+k.pos >= 1 && +k.pos <= n));
            KP.mdl('kpP', `<div class="px-h"><b>🛞 Vagon № ${kpE(kpVNo(v))} — gʻildirak juftliklari</b><button class="mini-btn" onclick="mdlClose('kpP')">✕</button></div>
              <div class="nd-tip">${kpE(v.type || '')} · ${n} ta oʻq. Har taʼmirda almashtirilganda shu yerda oʻzgartiring — tarix saqlanadi.${free.length ? ' Omborda: ' + free.length + ' ta.' : ''}</div>${rows}
              ${extra.length ? `<div class="qb-h">Oʻqi koʻrsatilmagan</div>${extra.map((k: any) => `<div class="kp-ax"><div class="kp-i" onclick="kpEdit('${k.id}')"><b>№ ${kpE(k.no)}</b></div></div>`).join('')}` : ''}`, true);
        }
        function kpPut(vid: string, pos: number): void {
            const free = kpS().all().filter((k: any) => !k.vid).sort((a: any, b: any) => String(a.no).localeCompare(String(b.no), undefined, { numeric: true }));
            KP.mdl('kpK', `<div class="px-h"><b>${pos}-oʻqqa oʻrnatish</b><button class="mini-btn" onclick="mdlClose('kpK')">✕</button></div>
              ${free.length ? free.slice(0, 60).map((k: any) => `<div class="qb-row" onclick="kpPutGo('${k.id}','${vid}',${pos})"><div class="qb-mid"><b>№ ${kpE(k.no)}</b><small>${kpE(k.tip)} · ${kpE(k.zavod)} ${kpE(k.year)} · prokat ${kpE(k.prokat || '—')}</small></div></div>`).join('') : '<div class="xt-empty">Omborda juftlik yoʻq.</div>'}
              <div class="pk-btns"><button class="pr" onclick="mdlClose('kpK'); kpEdit('', '${vid}', ${pos})">＋ Yangi juftlik kiritish</button></div>`, true);
        }
        function kpPutGo(id: string, vid: string, pos: number): void { const k = kpS().get(id); if (!k) return; kpMove(k, vid, pos, 'oʻrnatildi'); kpS().put(k); KP.mdlClose('kpK'); KP.showToast('🛞 № ' + k.no + ' oʻrnatildi'); kpPassRefresh(); }
        function kpOff(id: string): void { const k = kpS().get(id); if (!k) return; kpMove(k, '', '', 'olib qoʻyildi'); kpS().put(k); KP.showToast('↩ № ' + k.no + ' omborga'); kpPassRefresh(); }
        if (typeof KP.openPassport === 'function') KP.openPassport = KP.agmkExtend('openPassport', '6.1: gʻildirak juftliklari', KP.openPassport, (o: Function) => function (this: unknown, id: any) { KPV.id = id; const r = o.apply(this, arguments); setTimeout(kpPassBtn, 60); return r; });
        try { KP.agmkModule({ id: 'kp', icon: '🛞', title: 'Gʻildirak juftliklari', search: 'gildirak juftligi kolesa kolyosa kolesnaya para kp prokat greben obtochka vagon oq', desc: 'Raqamlar, oʻlchovlar, qaysi vagonda, tarix', open: () => kpOpen() }); } catch (e) { console.error('6.1 kp', e); }
        (function () {
            const st = document.createElement('style'); st.id = 'v61kpCss';
            st.textContent = `.kp-box{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0;padding:10px 12px;border-radius:14px;background:rgba(59,130,246,.1);border:1px solid rgba(96,165,250,.35)}.kp-box small{color:#94a3b8;font-size:12px}
            .kp-b{padding:8px 13px;border-radius:11px;border:1px solid #3b82f6;background:rgba(37,99,235,.3);color:#fff;font-weight:700;cursor:pointer}.kp-ax{display:flex;align-items:center;gap:8px;margin:6px 0}.kp-n{width:48px;font-weight:700;color:#93c5fd;font-size:12.5px}
            .kp-i{flex:1;padding:8px 10px;border-radius:11px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);cursor:pointer}.kp-i small{display:block;color:#94a3b8;font-size:11.5px}.kp-i.e{color:#64748b;cursor:default}.kp-h{font-size:12px;color:#cbd5e1;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06)}`;
            document.head.appendChild(st);
        })();
        Object.assign(KP, { KPF: KPF, KPV: KPV, kpOpen: kpOpen, kpDraw: kpDraw, kpEdit: kpEdit, kpSave: kpSave, kpDel: kpDel, kpSamples: kpSamples, kpTemplate: kpTemplate, kpImport: kpImport, kpPass: kpPass, kpPassBtn: kpPassBtn, kpPut: kpPut, kpPutGo: kpPutGo, kpOff: kpOff, kpOf: kpOf });
