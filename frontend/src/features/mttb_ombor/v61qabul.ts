        // =====================================================================
        // 6.1 (139) — 📁 QABUL QILINGAN EHTIYOT QISMLAR — elektron papka (muallif, 04.11.2026; 1-bosqich)
        //  Avval qogʻoz dalolatnomalar bitta papkaga tikilardi. Endi:
        //   • Qabul dalolatnomasi: sana, yetkazib beruvchi, schyot-faktura, shartnoma, nakladnoy, MTTB zayavka, kafolat,
        //     komissiya, qatorlar (nomi, nomenklatura, birlik, hujjatda / qabul qilindi, narx, summa, partiya, sertifikat).
        //     MTTB kirimidan bir tugma bilan toʻldiriladi.
        //   • Har dalolatnoma — alohida papka: dalolatnoma PDF, schyot-faktura, sertifikat, nakladnoy, foto hisobot
        //     (telefondan suratga olish — vaqt va kim olgani yoziladi). Fayllar korxona serveriga ham yoziladi.
        //   • «✍️ Imzoga yuborish» — mavjud elektron imzo; hamma imzolagach — holati «imzolangan», tahrir yopiladi,
        //     imzolangan PDF papkaga qoʻshiladi va yillik hisobotga kiradi.
        //   • Yillik hisobot: oylar, mahsulotlar, yetkazib beruvchilar, nuqsonli qabul; material boʻyicha tarix; Excel (CSV) va PDF.
        //  Yoʻnalish: hozir faqat 🚃 Vagonlar (boshqalari — keyin, xuddi shu tuzilma, d.dir bilan).
        //  Qoida: qabul — bu kirim (xarid), vagon xarajati emas (xarajat — 1C rasxodi + spravka orqali, 2-bosqich).
        // =====================================================================
        const QB: any = window as any;
        var QB_DIRS: any[] = [['vagon', '🚃', 'Vagonlar', true], ['teplovoz', '🚂', 'Teplovozlar', false], ['elektrovoz', '⚡', 'Elektrovozlar', false], ['yol', '🛤', 'Yoʻl', false]];
        var QB_KINDS: any = { pdf: ['📄', 'Dalolatnoma PDF'], sf: ['🧾', 'Schyot-faktura'], cert: ['🏅', 'Sertifikat'], nakl: ['📑', 'Nakladnoy'], foto: ['📷', 'Foto hisobot'], boshqa: ['📎', 'Boshqa hujjat'] };
        var QB_ST: any = { draft: ['📝', 'Qoralama', 'w'], imzoda: ['✍️', 'Imzoda', 'w'], imzolangan: ['✅', 'Imzolangan', 'g'], rad: ['❌', 'Rad etilgan', 'r'] };
        var QB_COM_DEF = [['Rais', 'Bosh muhandis'], ['Aʼzo', 'MTTB boshligʻi'], ['Aʼzo', 'Omborchi (moddiy javobgar)'], ['Aʼzo', 'Usta (texnik koʻrik)'], ['Aʼzo', 'Buxgalter']];
        var QBF: any = { y: 0, dir: 'vagon', q: '', tab: 'list' };
        function qbS(): any { return QB.agmkStore('qabul', { roles: ['mttb', 'bux', 'rahbar'] }); }
        function qbCan(): boolean { try { return QB.isAdmin() || ['mttb', 'bux', 'rahbar'].some((r: string) => QB.hasRole(r)); } catch (e) { return false; } }
        function qbN(x: any): number { const v = parseFloat(String(x == null ? '' : x).replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : 0; }
        function qbF(v: number, d?: number): string { return (Math.round(v * Math.pow(10, d == null ? 2 : d)) / Math.pow(10, d == null ? 2 : d)).toLocaleString('ru-RU'); }
        function qbM(v: number): string { return v >= 1e9 ? qbF(v / 1e9, 2) + ' mlrd' : v >= 1e6 ? qbF(v / 1e6, 1) + ' mln' : qbF(v, 0); }
        function qbE(s: any): string { return QB.escapeHtml(String(s == null ? '' : s)); }
        function qbSum(d: any): number { return (d.items || []).reduce((a: number, it: any) => a + qbN(it.q) * qbN(it.price), 0); }
        function qbBad(d: any): number { return (d.items || []).filter((it: any) => qbN(it.qDoc) > 0 && qbN(it.q) < qbN(it.qDoc)).length; }
        function qbAll(): any[] { return qbS().all().filter((d: any) => (d.dir || 'vagon') === QBF.dir).sort((a: any, b: any) => String(b.sana || '').localeCompare(String(a.sana || '')) || String(b.no || '').localeCompare(String(a.no || ''))); }
        function qbYear(d: any): number { return +(String(d.sana || '').slice(0, 4)) || 0; }
        function qbNextNo(y: number): string { let mx = 0; qbS().all().forEach((d: any) => { const m = /^QD-(\d{4})-(\d+)$/.exec(String(d.no || '')); if (m && +m[1] === y) mx = Math.max(mx, +m[2]); }); return 'QD-' + y + '-' + String(mx + 1).padStart(3, '0'); }
        function qbTitle(d: any): string { const it = d.items || []; return it.length ? qbE(it[0].n) + (it.length > 1 ? ' va yana ' + (it.length - 1) + ' ta' : '') : '—'; }

        // ---------- bosh sahifa ----------
        function qbOpen(): void {
            QB.secScreen('screen-qb', '📁 Qabul qilingan ehtiyot qismlar', "openScreen('screen-main')"); QB.openScreen('screen-qb');
            if (!QBF.y) QBF.y = +QB.todayISO().slice(0, 4); qbDraw();
        }
        function qbDraw(): void {
            const b = QB.secBody('screen-qb'); if (!b) return;
            const L = qbAll(), ys = Array.from(new Set(L.map(qbYear).concat([+QB.todayISO().slice(0, 4)]))).filter(Boolean).sort((a: any, c: any) => c - a) as number[];
            const Y = L.filter(d => qbYear(d) === QBF.y), q = QBF.q.toLowerCase();
            const F = q ? Y.filter(d => [d.no, d.supplier, d.sf, d.nakl, d.contract].concat((d.items || []).map((i: any) => i.n + ' ' + (i.nom || '') + ' ' + (i.party || ''))).join(' ').toLowerCase().indexOf(q) >= 0) : Y;
            const ok = Y.filter(d => d.st === 'imzolangan'), sum = ok.reduce((a, d) => a + qbSum(d), 0), pos = ok.reduce((a, d) => a + (d.items || []).length, 0), wait = Y.filter(d => d.st === 'imzoda').length, bad = Y.filter(d => qbBad(d) > 0).length;
            const dirs = QB_DIRS.map(([k, i, t, on]) => `<button class="qb-dir${QBF.dir === k ? ' on' : ''}${on ? '' : ' off'}" ${on ? `onclick="QBF.dir='${k}'; qbDraw()"` : 'disabled'}>${i} ${t}${on ? '' : ' · keyin'}</button>`).join('');
            b.innerHTML = `<div class="qb">
              <div class="qb-dirs">${dirs}</div>
              <div class="qb-bar">${ys.map(y => `<button class="pg-c${QBF.y === y ? ' on' : ''}" onclick="QBF.y=${y}; qbDraw()">${y}</button>`).join('')}
                <span class="qb-sp"></span><button class="mini-btn" onclick="qbReport()">📊 Yillik hisobot</button><button class="mini-btn" onclick="qbCsv()">📥 Excel</button>${qbCan() ? '<button class="qb-new" onclick="qbEdit()">＋ Qabul dalolatnomasi</button>' : ''}</div>
              <div class="qb-kpi"><div><small>Imzolangan dalolatnomalar</small><b>${ok.length}</b><i>${Y.length} ta jami</i></div><div><small>Qabul qilingan pozitsiyalar</small><b>${pos}</b></div>
                <div><small>Jami summa</small><b>${qbM(sum)}</b><i>soʻm</i></div><div><small>Imzoda turibdi</small><b class="w">${wait}</b><i>hisobotga hali kirmagan</i></div><div><small>Nuqsonli / kam keldi</small><b class="r">${bad}</b></div></div>
              <input class="qb-q" placeholder="🔍 Kolodka, № dalolatnoma, yetkazib beruvchi, partiya…" value="${qbE(QBF.q)}" oninput="QBF.q=this.value; clearTimeout(QBF.t); QBF.t=setTimeout(qbDraw,300)">
              <div class="qb-list">${F.length ? F.map(d => { const s = QB_ST[d.st || 'draft'] || QB_ST.draft, nf = (d.files || []).length; return `<div class="qb-row" onclick="qbView('${d.id}')"><div class="qb-no"><b>📂 ${qbE(d.no)}</b><small>${qbE(QB.fmtISO(d.sana || ''))}</small></div>
                <div class="qb-mid"><b>${qbTitle(d)}</b><small>${qbE(d.supplier || '—')}${d.sf ? ' · schyot-faktura № ' + qbE(d.sf) : ''}${nf ? ' · 📎 ' + nf : ''}</small></div>
                <div class="qb-sum"><b>${qbF(qbSum(d), 0)}</b><small>${(d.items || []).length} pozitsiya</small></div><span class="qb-st ${s[2]}">${s[0]} ${s[1]}${qbBad(d) ? ' · nuqson' : ''}</span></div>`; }).join('') : `<div class="xt-empty">${QBF.y} yilda dalolatnoma yoʻq${qbCan() ? ' — «＋ Qabul dalolatnomasi» bilan boshlang' : ''}.</div>`}</div>
              <div class="nd-tip">ℹ️ Qabul — bu kirim (xarid). Vagonlarga ketgan xarajat 1C rasxodi va spravka orqali hisoblanadi. Hisobotga faqat <b>imzolangan</b> dalolatnomalar kiradi.</div></div>`;
        }

        // ---------- dalolatnoma: tuzish / tahrirlash ----------
        var QBE: any = null;
        function qbEdit(id?: string): void {
            if (!qbCan()) { QB.alert('Dalolatnomani MTTB, buxgalteriya, rahbariyat yoki administrator tuzadi.'); return; }
            const o = id ? qbS().get(id) : null;
            if (o && o.st && o.st !== 'draft') { QB.alert('Imzoga yuborilgan dalolatnomani oʻzgartirib boʻlmaydi.'); return; }
            QBE = o ? JSON.parse(JSON.stringify(o)) : { dir: QBF.dir, sana: QB.todayISO(), items: [{ n: '', nom: '', u: 'dona', qDoc: '', q: '', price: '', party: '', cert: false }], com: QB_COM_DEF.map(c => ({ r: c[0], l: c[1], n: '' })), st: 'draft', files: [] };
            qbEditDraw();
        }
        function qbEditDraw(): void {
            const d = QBE, inp = (k: string, ph: string, t?: string) => `<label class="qb-f"><small>${ph}</small><input data-k="${k}" type="${t || 'text'}" value="${qbE(d[k] || '')}" oninput="QBE['${k}']=this.value"></label>`;
            const rows = d.items.map((it: any, i: number) => `<tr><td><input value="${qbE(it.n)}" placeholder="Nomi" oninput="QBE.items[${i}].n=this.value"></td><td><input value="${qbE(it.nom)}" placeholder="Nomenkl." oninput="QBE.items[${i}].nom=this.value" style="width:80px"></td>
              <td><input value="${qbE(it.u)}" oninput="QBE.items[${i}].u=this.value" style="width:52px"></td><td><input value="${qbE(it.qDoc)}" inputmode="decimal" oninput="QBE.items[${i}].qDoc=this.value; qbEditSum()" style="width:64px"></td>
              <td><input value="${qbE(it.q)}" inputmode="decimal" oninput="QBE.items[${i}].q=this.value; qbEditSum()" style="width:64px"></td><td><input value="${qbE(it.price)}" inputmode="decimal" oninput="QBE.items[${i}].price=this.value; qbEditSum()" style="width:86px"></td>
              <td><input value="${qbE(it.party)}" placeholder="Partiya" oninput="QBE.items[${i}].party=this.value" style="width:76px"></td><td style="text-align:center"><input type="checkbox" ${it.cert ? 'checked' : ''} onchange="QBE.items[${i}].cert=this.checked"></td>
              <td><button class="mini-btn" onclick="QBE.items.splice(${i},1); if(!QBE.items.length) QBE.items.push({n:'',u:'dona'}); qbEditDraw()">✕</button></td></tr>`).join('');
            const com = d.com.map((c: any, i: number) => `<div class="qb-com"><input value="${qbE(c.r)}" oninput="QBE.com[${i}].r=this.value" style="width:70px"><input value="${qbE(c.l)}" placeholder="Lavozim" oninput="QBE.com[${i}].l=this.value"><input value="${qbE(c.n)}" placeholder="Familiya I.O." oninput="QBE.com[${i}].n=this.value"><button class="mini-btn" onclick="QBE.com.splice(${i},1); qbEditDraw()">✕</button></div>`).join('');
            QB.mdl('qbE', `<div class="px-h"><b>📄 Qabul dalolatnomasi ${qbE(d.no || '(yangi)')}</b><button class="mini-btn" onclick="mdlClose('qbE')">✕</button></div>
              <div class="qb-g">${inp('sana', 'Sana', 'date')}${inp('supplier', 'Yetkazib beruvchi')}${inp('sf', 'Schyot-faktura №')}${inp('sfDate', 'Schyot-faktura sanasi', 'date')}${inp('contract', 'Shartnoma №')}${inp('nakl', 'Nakladnoy №')}${inp('zay', 'MTTB zayavka №')}${inp('warranty', 'Kafolat (oy)')}</div>
              <div class="qb-h">📦 Qabul qilinganlar <button class="mini-btn" onclick="qbFromMttb()">📦 MTTB kirimidan toʻldirish</button></div>
              <div class="qb-tw"><table class="qb-t"><tr><th>Nomi</th><th>Nomenkl.</th><th>Birlik</th><th>Hujjatda</th><th>Qabul qilindi</th><th>Narx</th><th>Partiya</th><th>Sertifikat</th><th></th></tr>${rows}</table></div>
              <div class="qb-row2"><button class="mini-btn" onclick="QBE.items.push({n:'',nom:'',u:'dona',qDoc:'',q:'',price:'',party:'',cert:false}); qbEditDraw()">＋ Qator</button><b id="qbESum"></b></div>
              <div class="qb-h">👥 Komissiya (imzolaydiganlar)</div>${com}<button class="mini-btn" onclick="QBE.com.push({r:'Aʼzo',l:'',n:''}); qbEditDraw()">＋ Aʼzo</button>
              <label class="qb-f" style="margin-top:8px"><small>Izoh (nuqson, kam kelgan, qaytarilgan)</small><input value="${qbE(d.note || '')}" oninput="QBE.note=this.value"></label>
              <div class="pk-btns"><button onclick="mdlClose('qbE')">Bekor</button><button class="pr" onclick="qbEditSave()">💾 Saqlash</button></div>`, true);
            qbEditSum();
        }
        function qbEditSum(): void { const el = QB.$id('qbESum'); if (el) el.textContent = 'Jami: ' + qbF(qbSum(QBE), 0) + ' soʻm'; }
        function qbFromMttb(): void {
            let d: any = null; try { d = QB.mtData(); } catch (e) { /* */ }
            const used = new Set(qbS().all().map((x: any) => x.kirId).filter(Boolean));
            const K = d ? (d.kir || []).filter((k: any) => !used.has(k.id)).slice(-40).reverse() : [];
            if (!K.length) { QB.alert('MTTB da dalolatnomaga kiritilmagan kirim topilmadi.'); return; }
            QB.mdl('qbK', `<div class="px-h"><b>📦 MTTB kirimini tanlang</b><button class="mini-btn" onclick="mdlClose('qbK')">✕</button></div>
              ${K.map((k: any) => `<div class="qb-row" onclick="qbKirPick('${k.id}')"><div class="qb-mid"><b>${qbE(QB.fmtDT(k.at))}</b><small>${(k.items || []).map((i: any) => qbE(i.n) + ' ' + qbE(i.q) + ' ' + qbE(i.u || '')).join(', ')}</small></div></div>`).join('')}`, true);
        }
        function qbKirPick(id: string): void {
            const d = QB.mtData(), k = (d.kir || []).find((x: any) => x.id === id); if (!k) return;
            QBE.kirId = k.id; if (k.doc && !QBE.nakl) QBE.nakl = k.doc;
            QBE.items = (k.items || []).map((i: any, n: number) => { const got = k.acc && k.acc.items && k.acc.items[n] ? k.acc.items[n].got : i.q; return { n: i.n, nom: i.nom || '', u: i.u || 'dona', qDoc: i.q, q: got, price: i.p || i.price || '', party: '', cert: false }; });
            QB.mdlClose('qbK'); qbEditDraw();
        }
        function qbEditSave(): void {
            const d = QBE; d.items = d.items.filter((it: any) => String(it.n || '').trim());
            if (!d.sana || !/^\d{4}-\d{2}-\d{2}$/.test(d.sana)) { QB.alert('Sanani kiriting.'); return; }
            if (!d.items.length) { QB.alert('Kamida bitta qabul qilingan mahsulotni kiriting.'); d.items.push({ n: '', u: 'dona' }); return; }
            const badQ = d.items.find((it: any) => !(qbN(it.q) > 0)); if (badQ) { QB.alert('«' + badQ.n + '»: qabul qilingan sonini kiriting.'); return; }
            if (!d.no) d.no = qbNextNo(+d.sana.slice(0, 4));
            d.com = (d.com || []).filter((c: any) => String(c.n || '').trim() || String(c.l || '').trim());
            if (!d.at) { d.at = new Date().toISOString(); try { d.byN = QB.authorStr(); } catch (e) { /* */ } }
            try { const x = qbS().put(d); QB.mdlClose('qbE'); QB.showToast('💾 Saqlandi: ' + x.no); QBF.y = +x.sana.slice(0, 4); qbDraw(); qbView(x.id); } catch (e) { QB.alert('⚠️ ' + ((e as any).message || e)); }
        }

        // ---------- papka ----------
        var QB_URLS: string[] = [];
        async function qbView(id: string): Promise<void> {
            const d = qbS().get(id); if (!d) return; QB_URLS.forEach(u => URL.revokeObjectURL(u)); QB_URLS = [];
            const s = QB_ST[d.st || 'draft'] || QB_ST.draft, ed = qbCan() && (d.st || 'draft') === 'draft', sum = qbSum(d);
            const info = [['Sana', QB.fmtISO(d.sana)], ['Yetkazib beruvchi', d.supplier], ['Schyot-faktura', (d.sf ? '№ ' + d.sf : '') + (d.sfDate ? ' · ' + QB.fmtISO(d.sfDate) : '')], ['Shartnoma', d.contract], ['Nakladnoy', d.nakl], ['MTTB zayavka', d.zay], ['Kafolat', d.warranty ? d.warranty + ' oy' : ''], ['Tuzgan', d.byN || d.by]].filter(x => String(x[1] || '').trim());
            const items = (d.items || []).map((it: any) => { const bad = qbN(it.qDoc) > 0 && qbN(it.q) < qbN(it.qDoc); return `<tr class="${bad ? 'bad' : ''}"><td>${qbE(it.n)}${it.cert ? ' <span class="qb-c">🏅</span>' : ''}</td><td>${qbE(it.nom)}</td><td class="r">${qbE(it.qDoc)}</td><td class="r"><b>${qbE(it.q)}</b> ${qbE(it.u)}</td><td class="r">${qbF(qbN(it.price), 0)}</td><td class="r">${qbF(qbN(it.q) * qbN(it.price), 0)}</td><td>${qbE(it.party)}</td></tr>`; }).join('');
            const files = (d.files || []).map((f: any, i: number) => { const k = QB_KINDS[f.kind] || QB_KINDS.boshqa; return `<div class="qb-fi" onclick="qbFileOpen('${d.id}',${i})"><div class="qb-th" id="qbTh${i}">${k[0]}</div><b>${qbE(f.name)}</b><small>${k[1]} · ${qbE(QB.fmtDT(f.at))}${f.srv ? ' · 🖥 serverda' : ' · 📱 shu qurilmada'}</small></div>`; }).join('');
            QB.mdl('qbV', `<div class="px-h"><b>📂 ${qbE(d.no)} · ${qbTitle(d)}</b><button class="mini-btn" onclick="mdlClose('qbV')">✕</button></div>
              <div class="qb-sth"><span class="qb-st ${s[2]}">${s[0]} ${s[1]}</span>${d.sig && d.sig.done ? ' <small>' + qbE(QB.fmtDT(d.sig.done)) + '</small>' : ''}<b class="qb-tot">${qbF(sum, 0)} soʻm</b></div>
              <div class="qb-info">${info.map(x => `<div><small>${x[0]}</small><b>${qbE(x[1])}</b></div>`).join('')}</div>
              <div class="qb-tw"><table class="qb-t v"><tr><th>Nomi</th><th>Nomenkl.</th><th>Hujjatda</th><th>Qabul qilindi</th><th>Narx</th><th>Summa</th><th>Partiya</th></tr>${items}</table></div>
              ${d.note ? `<div class="nd-tip">📝 ${qbE(d.note)}</div>` : ''}
              ${d.com && d.com.length ? `<div class="qb-h">👥 Komissiya</div><div class="qb-coml">${d.com.map((c: any) => `<span>${qbE(c.l)}: <b>${qbE(c.n || '—')}</b></span>`).join('')}</div>` : ''}
              <div class="qb-h">🗂 Papka ichida (${(d.files || []).length})</div><div class="qb-fg">${files || '<div class="xt-empty">Hali fayl yoʻq — schyot-faktura, sertifikat va rasmlarni qoʻshing.</div>'}</div>
              <div class="qb-btns">
                <label class="mini-btn">📷 Rasm olish<input type="file" accept="image/*" capture="environment" multiple hidden onchange="qbAdd('${d.id}', this, 'foto')"></label>
                <label class="mini-btn">📎 Fayl qoʻshish<input type="file" accept=".pdf,image/*,.doc,.docx,.xls,.xlsx" multiple hidden onchange="qbAddAsk('${d.id}', this)"></label>
                <button class="mini-btn" onclick="qbPdf('${d.id}')">🖨 Dalolatnoma PDF</button>
                ${ed ? `<button class="mini-btn" onclick="qbEdit('${d.id}')">✏️ Tahrirlash</button><button class="qb-new" onclick="qbSign('${d.id}')">✍️ Imzoga yuborish</button>` : ''}
                ${d.st === 'imzoda' || d.st === 'rad' ? `<button class="mini-btn" onclick="qbSigCheck('${d.id}', true)">🔄 Imzo holati</button>` : ''}
                ${d.sig && d.sig.id ? `<button class="mini-btn" onclick="sigOpenDoc('${d.sig.id}')">✍️ Imzo varagʻi</button>` : ''}
                ${ed && QB.isAdmin() ? `<button class="mini-btn" onclick="qbDel('${d.id}')">🗑</button>` : ''}</div>`, true);
            (d.files || []).forEach(async (f: any, i: number) => { if (f.kind !== 'foto' && !/^image\//.test(f.mime || '')) return; try { const bl = await qbBlob(f); if (!bl) return; const u = URL.createObjectURL(bl); QB_URLS.push(u); const el = QB.$id('qbTh' + i); if (el) el.innerHTML = `<img src="${u}" alt="">`; } catch (e) { /* */ } });
            if (d.st === 'imzoda') qbSigCheck(d.id, false);
        }
        async function qbBlob(f: any): Promise<Blob | null> {
            try { const b = await QB.mediaGetBlob(f.id); if (b) return b; } catch (e) { /* */ }
            if (f.srv && typeof QB.srvFileGet === 'function') { try { const b = await QB.srvFileGet(f.srv, f.mime); if (b) { try { await QB.mediaSave(f.id, b, { id: f.id, at: f.at, name: f.name, mime: f.mime, size: b.size }); } catch (e) { /* */ } return b; } } catch (e) { /* */ } }
            return null;
        }
        function qbAddAsk(id: string, inp: any): void {
            const files = Array.from(inp.files || []); inp.value = ''; if (!files.length) return;
            QB.mdl('qbK', `<div class="px-h"><b>📎 Bu qanday hujjat?</b><button class="mini-btn" onclick="mdlClose('qbK')">✕</button></div><div class="nd-tip">${files.map((f: any) => qbE(f.name)).join(', ')}</div>
              <div class="qb-kinds">${Object.keys(QB_KINDS).filter(k => k !== 'pdf').map(k => `<button class="mini-btn" onclick="qbAddKind('${id}','${k}')">${QB_KINDS[k][0]} ${QB_KINDS[k][1]}</button>`).join('')}</div>`, true);
            QB.__qbPend = files;
        }
        function qbAddKind(id: string, k: string): void { const f = QB.__qbPend || []; QB.__qbPend = null; QB.mdlClose('qbK'); qbAddFiles(id, f, k); }
        function qbAdd(id: string, inp: any, kind: string): void { const f = Array.from(inp.files || []); inp.value = ''; qbAddFiles(id, f, kind); }
        async function qbAddFiles(id: string, files: any[], kind: string, keepOpen?: boolean): Promise<void> {
            const d = qbS().get(id); if (!d || !files.length) return;
            let by = ''; try { by = QB.authorStr(); } catch (e) { /* */ }
            d.files = d.files || []; let up = 0;
            for (const f of files) {
                if (f.size > 30e6) { QB.alert(f.name + ': 30 MB dan katta'); continue; }
                const fid = 'qb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at = new Date().toISOString();
                try { await QB.mediaSave(fid, f, { id: fid, at: at, name: f.name, mime: f.type, size: f.size }); QB.mediaKeep(fid); } catch (e) { QB.alert('⚠️ Saqlab boʻlmadi: ' + f.name); continue; }
                const rec: any = { id: fid, name: f.name || (kind === 'foto' ? 'rasm.jpg' : 'fayl'), mime: f.type || 'application/octet-stream', size: f.size, kind: kind, at: at, by: by };
                try { if (typeof QB.srvOn === 'function' && QB.srvOn() && typeof QB.srvRaw === 'function') { const r = await QB.srvRaw('/api/files/v1?to=' + encodeURIComponent('*mttb') + '&name=' + encodeURIComponent(rec.name) + '&mime=' + encodeURIComponent(rec.mime), { method: 'POST', body: f }); const j = await r.json(); if (j && j.id) { rec.srv = j.id; up++; } } } catch (e) { /* server yoʻq — keyin */ }
                d.files.push(rec);
            }
            try { qbS().put(d); } catch (e) { QB.alert('⚠️ ' + ((e as any).message || e)); return; }
            QB.showToast('📎 Papkaga qoʻshildi: ' + files.length + (up ? ' (serverga: ' + up + ')' : ''));
            if (!keepOpen) qbView(id);
        }
        async function qbFileOpen(id: string, i: number): Promise<void> {
            const d = qbS().get(id), f = d && (d.files || [])[i]; if (!f) return;
            const b = await qbBlob(f); if (!b) { QB.alert('Fayl bu qurilmada yoʻq va serverdan olib boʻlmadi (server ulanmagan).'); return; }
            const u = URL.createObjectURL(b); QB_URLS.push(u);
            if (/^image\//.test(f.mime || '')) { QB.mdl('qbI', `<div class="px-h"><b>${qbE(f.name)}</b><button class="mini-btn" onclick="mdlClose('qbI')">✕</button></div><img src="${u}" style="width:100%;border-radius:10px"><div class="nd-tip">${qbE((QB_KINDS[f.kind] || QB_KINDS.boshqa)[1])} · ${qbE(QB.fmtDT(f.at))} · ${qbE(f.by || '')}</div>`, true); return; }
            const a = document.createElement('a'); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000);
        }
        function qbDel(id: string): void { const d = qbS().get(id); if (!d || (d.st && d.st !== 'draft')) return; QB.uiConfirm('Qoralama ' + d.no + ' oʻchirilsinmi?').then((ok: boolean) => { if (!ok) return; qbS().del(id); QB.mdlClose('qbV'); qbDraw(); }); }

        // ---------- dalolatnoma matni va PDF ----------
        function qbHtml(d: any, photos?: string[]): string {
            const E = qbE, sum = qbSum(d);
            return `<div style="font-family:Arial;font-size:12px;color:#000"><div style="text-align:right">«Tasdiqlayman»<br>____________________</div>
              <h2 style="text-align:center;margin:10px 0 2px">EHTIYOT QISMLARNI QABUL QILISH DALOLATNOMASI № ${E(d.no)}</h2><p style="text-align:center;margin:0 0 10px">${E(QB.fmtISO(d.sana))} · AGMK STTB</p>
              <p>Komissiya tarkibi: ${(d.com || []).map((c: any) => E(c.r + ' — ' + c.l + ' ' + (c.n || ''))).join('; ')}.</p>
              <p>Yetkazib beruvchi: <b>${E(d.supplier || '—')}</b>. Asos: ${d.sf ? 'schyot-faktura № ' + E(d.sf) + (d.sfDate ? ' (' + E(QB.fmtISO(d.sfDate)) + ')' : '') : '—'}${d.contract ? ', shartnoma № ' + E(d.contract) : ''}${d.nakl ? ', nakladnoy № ' + E(d.nakl) : ''}${d.zay ? ', MTTB zayavka № ' + E(d.zay) : ''}.</p>
              <p>Komissiya quyidagi mahsulotlarni koʻrikdan oʻtkazib qabul qildi:</p>
              <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%"><tr><th>№</th><th>Nomi</th><th>Nomenkl.</th><th>Birlik</th><th>Hujjatda</th><th>Qabul qilindi</th><th>Narx</th><th>Summa</th><th>Partiya / sertifikat</th></tr>
              ${(d.items || []).map((it: any, i: number) => `<tr><td>${i + 1}</td><td>${E(it.n)}</td><td>${E(it.nom)}</td><td>${E(it.u)}</td><td>${E(it.qDoc)}</td><td>${E(it.q)}</td><td>${qbF(qbN(it.price), 2)}</td><td>${qbF(qbN(it.q) * qbN(it.price), 2)}</td><td>${E(it.party)}${it.cert ? ' · sertifikat bor' : ''}</td></tr>`).join('')}
              <tr><td colspan="7"><b>JAMI</b></td><td><b>${qbF(sum, 2)}</b></td><td></td></tr></table>
              ${d.warranty ? `<p>Kafolat muddati: ${E(d.warranty)} oy.</p>` : ''}${d.note ? `<p>Izoh: ${E(d.note)}</p>` : ''}
              <p>Xulosa: koʻrsatilgan mahsulotlar soni va sifati boʻyicha qabul qilindi${qbBad(d) ? ' (kam kelgan / nuqsonli qatorlar izohda koʻrsatilgan)' : ''}.</p>
              <table style="width:100%;margin-top:14px">${(d.com || []).map((c: any) => `<tr><td style="padding:8px 0">${E(c.l)}</td><td>____________</td><td>${E(c.n || '')}</td></tr>`).join('')}</table>
              ${photos && photos.length ? `<div style="page-break-before:always"><h3>Foto hisobot</h3>${photos.map(u => `<img src="${u}" style="width:48%;margin:1%;border:1px solid #999">`).join('')}</div>` : ''}</div>`;
        }
        async function qbPdf(id: string): Promise<void> {
            const d = qbS().get(id); if (!d) return;
            const ph: string[] = [];
            for (const f of (d.files || []).filter((x: any) => x.kind === 'foto').slice(0, 8)) { try { const b = await qbBlob(f); if (b) ph.push(await new Promise<string>(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result)); fr.readAsDataURL(b); })); } catch (e) { /* */ } }
            try { QB.pdfFromHtml(qbHtml(d, ph), d.no + '_qabul_dalolatnomasi.pdf'); } catch (e) { QB.alert('⚠️ PDF tayyorlanmadi: ' + ((e as any).message || e)); }
        }

        // ---------- elektron imzo ----------
        async function qbSign(id: string): Promise<void> {
            const d = qbS().get(id); if (!d) return;
            if (!(d.com || []).some((c: any) => String(c.n || '').trim())) { QB.alert('Komissiya aʼzolarining familiyasini kiriting (✏️ Tahrirlash).'); return; }
            QB.__qbSignFor = id;
            await QB.sigSendOpen({ html: qbHtml(d), title: 'Qabul dalolatnomasi ' + d.no });
            try { if (QB.SIG && QB.SIG.pend) QB.SIG.pend.meta = { kind: 'qabul', qid: id, no: d.no }; } catch (e) { /* */ }
        }
        if (typeof QB.sigApi === 'function') QB.sigApi = QB.agmkExtend('sigApi', '6.1: qabul dalolatnomasi imzosi', QB.sigApi, (o: Function) => async function (this: unknown, path: string, method: string, body: any) {
            const r = await o.apply(this, arguments);
            try {
                if (method === 'POST' && path === '/api/sign/v1/docs' && body && body.meta && body.meta.kind === 'qabul' && r && r.id) {
                    const d = qbS().get(body.meta.qid); if (d) { d.st = 'imzoda'; d.sig = { id: r.id, sent: new Date().toISOString() }; qbS().put(d); try { qbDraw(); } catch (e) { /* */ } }
                }
            } catch (e) { console.error('6.1 qabul imzo', e); }
            return r;
        });
        async function qbSigCheck(id: string, loud: boolean): Promise<void> {
            const d = qbS().get(id); if (!d || !d.sig || !d.sig.id) return;
            let s: any; try { s = await QB.sigApi('/api/sign/v1/docs/' + d.sig.id); } catch (e) { if (loud) QB.alert('⚠️ Imzo holatini olib boʻlmadi: ' + ((e as any).message || e)); return; }
            const rej = (s.signers || []).find((x: any) => x.state === 'reject');
            const n = (s.signers || []).filter((x: any) => x.state === 'sign').length, all = (s.signers || []).length;
            if (s.status === 'done' && d.st !== 'imzolangan') {
                d.st = 'imzolangan'; d.sig.done = s.done_at || new Date().toISOString(); d.sig.signers = (s.signers || []).map((x: any) => ({ n: x.name || x.label, at: x.at }));
                qbS().put(d);
                try { const pb = await QB.sigPdfBlob(s); if (pb) { const f = new File([pb], d.no + '_imzolangan.pdf', { type: 'application/pdf' }); await qbAddFiles(id, [f], 'pdf', true); } } catch (e) { console.error('6.1 qabul pdf', e); }
                QB.showToast('✅ ' + d.no + ' — hamma imzoladi, papkaga va yillik hisobotga qoʻshildi'); qbView(id); try { qbDraw(); } catch (e) { /* */ } return;
            }
            if ((rej || s.status === 'cancelled') && d.st !== 'rad') { d.st = 'rad'; d.sig.reason = rej ? (rej.reason || '') : 'bekor qilindi'; qbS().put(d); qbView(id); return; }
            if (loud) QB.showToast('✍️ Imzolar: ' + n + ' / ' + all);
        }

        // ---------- yillik hisobot ----------
        function qbAgg(y: number): any {
            const L = qbAll().filter(d => qbYear(d) === y && d.st === 'imzolangan'), mon = new Array(12).fill(0), prod: any = {}, sup: any = {};
            L.forEach(d => { const m = +String(d.sana).slice(5, 7) - 1, s = qbSum(d); mon[m] += s; const k = d.supplier || '—'; sup[k] = sup[k] || { s: 0, n: 0, bad: 0 }; sup[k].s += s; sup[k].n++; if (qbBad(d)) sup[k].bad++;
                (d.items || []).forEach((it: any) => { const key = String(it.nom || it.n).trim().toLowerCase(); const p = prod[key] = prod[key] || { n: it.n, u: it.u, q: 0, s: 0, docs: 0, pr: [] }; p.q += qbN(it.q); p.s += qbN(it.q) * qbN(it.price); p.docs++; p.pr.push(qbN(it.price)); }); });
            return { L: L, mon: mon, prod: Object.values(prod).sort((a: any, b: any) => b.s - a.s), sup: Object.entries(sup).sort((a: any, b: any) => b[1].s - a[1].s), tot: mon.reduce((a, b) => a + b, 0) };
        }
        function qbReport(): void {
            const y = QBF.y, A = qbAgg(y), mx = Math.max(1, ...A.mon), MN = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
            QB.mdl('qbR', `<div class="px-h"><b>📊 Qabul qilingan mahsulotlar — ${y} · ${QB_DIRS.find(x => x[0] === QBF.dir)[2]}</b><button class="mini-btn" onclick="mdlClose('qbR')">✕</button></div>
              <div class="qb-kpi"><div><small>Jami qabul qilindi</small><b>${qbM(A.tot)}</b><i>soʻm</i></div><div><small>Dalolatnomalar</small><b>${A.L.length}</b></div><div><small>Mahsulot turlari</small><b>${A.prod.length}</b></div><div><small>Yetkazib beruvchilar</small><b>${A.sup.length}</b></div></div>
              <div class="qb-h">📅 Oylar boʻyicha</div><div class="qb-mon">${A.mon.map((v: number, i: number) => `<div><i style="height:${Math.round(v / mx * 100)}%"></i><small>${MN[i]}</small><b>${v ? qbM(v) : ''}</b></div>`).join('')}</div>
              <div class="qb-h">📦 Mahsulotlar boʻyicha</div><div class="qb-tw"><table class="qb-t v"><tr><th>Mahsulot</th><th>Soni</th><th>Summa</th><th>Dalolatnoma</th><th>Narx (min–max)</th></tr>${A.prod.slice(0, 40).map((p: any) => `<tr onclick="qbItem('${qbE(String(p.n).replace(/'/g, ''))}')" style="cursor:pointer"><td>${qbE(p.n)}</td><td class="r">${qbF(p.q)} ${qbE(p.u)}</td><td class="r">${qbF(p.s, 0)}</td><td class="r">${p.docs}</td><td class="r">${qbF(Math.min(...p.pr), 0)} – ${qbF(Math.max(...p.pr), 0)}</td></tr>`).join('') || '<tr><td colspan="5">Imzolangan dalolatnoma yoʻq</td></tr>'}</table></div>
              <div class="qb-h">🏭 Yetkazib beruvchilar</div><div class="qb-tw"><table class="qb-t v"><tr><th>Yetkazib beruvchi</th><th>Dalolatnoma</th><th>Summa</th><th>Nuqsonli qabul</th></tr>${A.sup.map(([k, v]: any) => `<tr><td>${qbE(k)}</td><td class="r">${v.n}</td><td class="r">${qbF(v.s, 0)}</td><td class="r">${v.bad ? '❌ ' + v.bad : '—'}</td></tr>`).join('')}</table></div>
              <div class="pk-btns"><button onclick="qbCsv()">📥 Excel</button><button class="pr" onclick="qbReportPdf()">📄 Rahbarga PDF</button></div>`, true);
        }
        function qbReportPdf(): void {
            const y = QBF.y, A = qbAgg(y), E = qbE, MN = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
            const h = `<div style="font-family:Arial;font-size:12px;color:#000"><h2 style="text-align:center">AGMK STTB · ${y} yilda qabul qilingan ehtiyot qismlar (${E(QB_DIRS.find(x => x[0] === QBF.dir)[2])})</h2>
              <p><b>Jami: ${qbF(A.tot, 0)} soʻm</b> · ${A.L.length} ta imzolangan dalolatnoma · ${A.prod.length} xil mahsulot · ${A.sup.length} ta yetkazib beruvchi.</p>
              <h3>Oylar boʻyicha</h3><table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%">${A.mon.map((v: number, i: number) => v ? `<tr><td>${MN[i]}</td><td style="text-align:right">${qbF(v, 0)}</td></tr>` : '').join('')}</table>
              <h3>Eng koʻp mablagʻ sarflangan mahsulotlar</h3><table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%"><tr><th>Mahsulot</th><th>Soni</th><th>Summa, soʻm</th></tr>${A.prod.slice(0, 15).map((p: any) => `<tr><td>${E(p.n)}</td><td>${qbF(p.q)} ${E(p.u)}</td><td style="text-align:right">${qbF(p.s, 0)}</td></tr>`).join('')}</table>
              <h3>Yetkazib beruvchilar</h3><table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%"><tr><th>Yetkazib beruvchi</th><th>Dalolatnoma</th><th>Summa, soʻm</th><th>Nuqsonli</th></tr>${A.sup.map(([k, v]: any) => `<tr><td>${E(k)}</td><td>${v.n}</td><td style="text-align:right">${qbF(v.s, 0)}</td><td>${v.bad || ''}</td></tr>`).join('')}</table>
              <p style="margin-top:14px;color:#444">Manba: ilovadagi imzolangan qabul dalolatnomalari (har biri elektron papkada PDF, schyot-faktura, sertifikat va rasmlar bilan). Tayyorlangan: ${E(QB.fmtDT(new Date().toISOString()))}.</p></div>`;
            try { QB.pdfFromHtml(h, 'Qabul_hisoboti_' + y + '.pdf'); } catch (e) { QB.alert('⚠️ ' + ((e as any).message || e)); }
        }
        function qbItem(name: string): void {
            const key = String(name).toLowerCase(), R: any[] = [];
            qbAll().forEach(d => (d.items || []).forEach((it: any) => { if (String(it.n).toLowerCase() === key) R.push({ d: d, it: it }); }));
            QB.mdl('qbM', `<div class="px-h"><b>🧱 ${qbE(name)} — qabul tarixi</b><button class="mini-btn" onclick="mdlClose('qbM')">✕</button></div>
              <div class="qb-tw"><table class="qb-t v"><tr><th>№</th><th>Sana</th><th>Yetkazib beruvchi</th><th>Soni</th><th>Narx</th><th>Holat</th></tr>${R.map(r => `<tr onclick="mdlClose('qbM'); qbView('${r.d.id}')" style="cursor:pointer"><td>${qbE(r.d.no)}</td><td>${qbE(QB.fmtISO(r.d.sana))}</td><td>${qbE(r.d.supplier)}</td><td class="r">${qbE(r.it.q)} ${qbE(r.it.u)}</td><td class="r">${qbF(qbN(r.it.price), 0)}</td><td>${(QB_ST[r.d.st || 'draft'] || QB_ST.draft)[0]}</td></tr>`).join('')}</table></div>`, true);
        }
        function qbCsv(): void {
            const y = QBF.y, L = qbAll().filter(d => qbYear(d) === y), q = (s: any) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
            const rows = [['Dalolatnoma', 'Sana', 'Holat', 'Yetkazib beruvchi', 'Schyot-faktura', 'Shartnoma', 'Nakladnoy', 'Nomi', 'Nomenklatura', 'Birlik', 'Hujjatda', 'Qabul qilindi', 'Narx', 'Summa', 'Partiya', 'Sertifikat', 'Fayllar']];
            L.forEach(d => (d.items || []).forEach((it: any) => rows.push([d.no, d.sana, (QB_ST[d.st || 'draft'] || QB_ST.draft)[1], d.supplier, d.sf, d.contract, d.nakl, it.n, it.nom, it.u, it.qDoc, it.q, String(qbN(it.price)).replace('.', ','), String(Math.round(qbN(it.q) * qbN(it.price) * 100) / 100).replace('.', ','), it.party, it.cert ? 'bor' : '', String((d.files || []).length)])));
            const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Qabul_' + y + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
        }

        try { QB.agmkModule({ id: 'qabul', icon: '📁', title: 'Qabul qilingan ehtiyot qismlar', search: 'qabul dalolatnoma ehtiyot qism zapchast kolodka schyot faktura sertifikat foto hisobot papka yillik hisobot mttb kirim yetkazib beruvchi', desc: 'Dalolatnomalar, elektron papka, foto hisobot, yillik hisobot', open: () => qbOpen() }); } catch (e) { console.error('6.1 qabul', e); }
        (function () {
            const st = document.createElement('style'); st.id = 'v61qabulCss';
            st.textContent = `.qb-dirs{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 10px}.qb-dir{padding:8px 12px;border-radius:12px;border:1px solid rgba(147,197,253,.3);background:rgba(255,255,255,.05);color:inherit;font-weight:700}.qb-dir.on{background:#2563eb;border-color:#3b82f6;color:#fff}.qb-dir.off{opacity:.45;font-weight:500}
            .qb-bar{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.qb-sp{flex:1}.qb-new{padding:9px 14px;border-radius:12px;border:0;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700;cursor:pointer}
            .qb-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:10px 0}.qb-kpi>div{padding:10px 12px;border-radius:14px;background:rgba(10,16,32,.45);border:1px solid rgba(147,197,253,.2)}.qb-kpi small{display:block;color:#94a3b8;font-size:11.5px}.qb-kpi b{font-size:21px;display:block}.qb-kpi b.w{color:#fcd34d}.qb-kpi b.r{color:#fca5a5}.qb-kpi i{font-style:normal;color:#94a3b8;font-size:11.5px}
            .qb-q{width:100%;padding:10px 12px;border-radius:12px;margin-bottom:8px}.qb-row{display:flex;gap:10px;align-items:center;padding:10px 12px;margin:6px 0;border-radius:14px;background:rgba(10,16,32,.45);border:1px solid rgba(147,197,253,.18);cursor:pointer}
            .qb-row small{display:block;color:#94a3b8;font-size:11.5px}.qb-no{min-width:110px}.qb-mid{flex:1;min-width:0}.qb-mid b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qb-sum{text-align:right}.qb-st{font-size:11.5px;padding:3px 8px;border-radius:8px;white-space:nowrap;border:1px solid}
            .qb-st.g{color:#86efac;border-color:rgba(34,197,94,.45);background:rgba(34,197,94,.12)}.qb-st.w{color:#fcd34d;border-color:rgba(245,158,11,.45);background:rgba(245,158,11,.12)}.qb-st.r{color:#fca5a5;border-color:rgba(239,68,68,.45);background:rgba(239,68,68,.12)}
            .qb-g,.qb-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.qb-f{display:block}.qb-f small,.qb-info small{display:block;color:#94a3b8;font-size:11.5px}.qb-f input{width:100%;padding:8px;border-radius:9px}.qb-info>div{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
            .qb-h{font-weight:700;margin:12px 0 6px;display:flex;gap:8px;align-items:center}.qb-tw{overflow-x:auto}.qb-t{width:100%;border-collapse:collapse;font-size:12.5px}.qb-t th{text-align:left;color:#94a3b8;padding:5px;border-bottom:1px solid rgba(255,255,255,.12)}.qb-t td{padding:4px 5px;border-bottom:1px solid rgba(255,255,255,.06)}.qb-t input{padding:6px;border-radius:7px;width:100%}.qb-t .r{text-align:right}.qb-t tr.bad td{color:#fca5a5}
            .qb-row2{display:flex;justify-content:space-between;align-items:center;margin:6px 0}.qb-com{display:flex;gap:6px;margin:4px 0}.qb-com input{flex:1;padding:7px;border-radius:8px;min-width:0}.qb-coml{display:flex;flex-wrap:wrap;gap:6px}.qb-coml span{font-size:12px;padding:4px 8px;border-radius:8px;background:rgba(255,255,255,.05)}
            .qb-sth{display:flex;align-items:center;gap:8px;margin-bottom:8px}.qb-tot{margin-left:auto;font-size:17px}.qb-fg{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}.qb-fi{padding:8px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);cursor:pointer;font-size:12px}
            .qb-fi b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qb-fi small{color:#94a3b8;font-size:10.5px}.qb-th{height:78px;border-radius:9px;display:grid;place-items:center;font-size:30px;background:rgba(255,255,255,.05);margin-bottom:6px;overflow:hidden}.qb-th img{width:100%;height:100%;object-fit:cover}
            .qb-btns,.qb-kinds{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.qb-c{font-size:11px}.qb-mon{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;height:130px;align-items:end}.qb-mon>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:10px}.qb-mon i{display:block;width:70%;background:#3b82f6;border-radius:4px 4px 0 0;min-height:2px}.qb-mon small{color:#94a3b8}.qb-mon b{font-size:9.5px}`;
            document.head.appendChild(st);
        })();
        Object.assign(QB, { QBF: QBF, qbOpen: qbOpen, qbDraw: qbDraw, qbEdit: qbEdit, qbEditDraw: qbEditDraw, qbEditSum: qbEditSum, qbEditSave: qbEditSave, qbFromMttb: qbFromMttb, qbKirPick: qbKirPick, qbView: qbView, qbAdd: qbAdd, qbAddAsk: qbAddAsk, qbAddKind: qbAddKind, qbAddFiles: qbAddFiles, qbFileOpen: qbFileOpen, qbDel: qbDel, qbPdf: qbPdf, qbHtml: qbHtml, qbSign: qbSign, qbSigCheck: qbSigCheck, qbReport: qbReport, qbReportPdf: qbReportPdf, qbItem: qbItem, qbCsv: qbCsv, qbAgg: qbAgg, qbSum: qbSum });
