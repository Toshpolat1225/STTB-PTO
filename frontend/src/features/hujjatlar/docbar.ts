
        // =====================================================================
        // v3.2 — 📄 HUJJAT TUGMALARI (har bir hujjatda bir xil joyda, bitta qatorda):
        //   💾 Saqlash · 📥 Telefonga (PDF — telefon xotirasiga) · ✈️ Telegram (PDF) · ✍️ Imzoga (hammaga birdan)
        //  • ✍️ Imzoga: hujjatdagi tasdiqlovchi va komissiya aʼzolari shtat roʻyxatidan (tabel bilan) aniq topiladi va
        //    hammasining hisobiga birdan yuboriladi. Hali roʻyxatdan oʻtmagan xodim hisob ochgach «Imzolash»da koʻradi (server 1.3).
        //  • Akt: 🤖 AI yordamida yoki ✍️ Qoʻlda (tez) — qoʻlda rejimda matn qanday yozilsa, shunday hujjat boʻladi (AI, tarjima,
        //    normativ qidiruv ishlamaydi — shoshilinch paytda bir necha soniyada tayyor).
        //  • Imzo chekuvchilar shablondagidek tartiblanadi: boshqarma rahbariyati → boʻlim/sex boshliqlari → oʻrinbosarlar →
        //    boshqarma mutaxassislari → ustalar → boshqalar (lavozim shtat roʻyxatidan olinadi).
        // =====================================================================
        var DBAR = { mode: null, busy: false };
        (function () {
            const c = document.createElement('style');
            c.textContent = `.dbar{position:sticky;bottom:0;z-index:5;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px 0 6px;margin:10px 0 4px;background:linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,.96) 30%)}
                .dbar.n3{grid-template-columns:repeat(3,1fr)}
                .dbar button{min-height:52px;border:0;border-radius:12px;padding:6px 4px;font-size:12.5px;font-weight:600;line-height:1.2;color:#fff;background:#1e293b;border:1px solid #334155;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
                .dbar button i{font-style:normal;font-size:19px}
                .dbar .db-save{background:#0f766e;border-color:#14b8a6}.dbar .db-ph{background:#1d4ed8;border-color:#3b82f6}.dbar .db-tg{background:#0284c7;border-color:#38bdf8}.dbar .db-sg{background:linear-gradient(135deg,#7c3aed,#a855f7);border-color:#a78bfa}
                .dbar button:active{transform:scale(.97)}
                .dbar-more{margin:4px 0 8px}.dbar-more>summary{cursor:pointer;color:#94a3b8;font-size:13px;padding:6px 2px}
                .db-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:4px 0 12px}.db-mode button{padding:11px 6px;border-radius:12px;border:1px solid #334155;background:#0f172a;color:#cbd5e1;font-size:13.5px;font-weight:600}
                .db-mode button.on{border-color:#a78bfa;background:rgba(124,58,237,.22);color:#fff}.db-mode button.on.m{border-color:#22c55e;background:rgba(34,197,94,.18)}
                .db-man-go{background:linear-gradient(135deg,#15803d,#22c55e)!important;margin-top:6px}
                .db-two{display:flex;gap:6px}.db-two .action-btn{flex:1}.db-two .db-m{flex:0 0 auto;background:#15803d}
                .db-res .sg-row small{color:#94a3b8}.cx-bar .sg{background:linear-gradient(135deg,#7c3aed,#a855f7)!important;color:#fff!important}`;
            document.head.appendChild(c);
        })();
        // ---------- Imzo chekuvchini shtat roʻyxatidan aniqlash ----------
        function dbPx(r) { const it = r.item; return { tabel: cleanTabel(it.tabel), name: it.name, lavozim: it.lavozim || '', pos: it.posNo ? posByNo(it.posNo) : null }; }
        function dbPerson(s) {
            if (!s) return null;
            const t = cleanTabel(s.t || s.tabel || '');
            if (t) { const f = findXodimsByTabel(t); if (f.length === 1) return dbPx(f[0]); }
            const raw = String(s.n || s.label || s.name || '').replace(/\(.*?\)/g, ' ').replace(/[«»"“”]/g, ' ').trim(); if (!raw) return null;
            const toks = raw.split(/[\s.]+/).filter(Boolean); if (!toks.length) return null;
            let sur, ini = '';
            if (toks[0].length <= 2) { sur = toks.find(w => w.length > 2); ini = toks[0]; } else { sur = toks[0]; ini = toks[1] || ''; }
            if (!sur) return null;
            const k = rsSur(sur), i1 = normTxt(ini).replace(/[^a-z]/g, '').charAt(0);
            let L = allXodims().filter(r => r.item.name && rsSur(r.item.name) === k && cleanTabel(r.item.tabel));
            if (L.length > 1 && i1) { const f = L.filter(r => rsIni(r.item.name) === i1); if (f.length) L = f; }
            if (L.length > 1 && s.r) { const rw = normTxt(s.r).split(' ').filter(w => w.length > 3); const sc = r => rw.filter(w => normTxt(r.item.lavozim + ' ' + (r.item.bolim || '')).includes(w)).length; const best = Math.max(...L.map(sc)); const f = L.filter(r => sc(r) === best); if (best > 0) L = f; }
            if (L.length > 1) { const f = L.filter(r => r.item.roster); if (f.length === 1) L = f; }
            return L.length === 1 ? dbPx(L[0]) : null;
        }
        function dbRank(s) {
            const p = dbPerson(s);
            if (p && p.pos) {
                const pos = p.pos, nm = normTxt(pos.name), rah = /rah/.test(pos.cat || ''), dep = /orinbosar/.test(nm);
                let k;
                if (pos.u === 'u1' && !pos.g && rah) k = 0;                                                        // boshqarma rahbariyati
                else if (rah && !dep && /boshlig|bosh mexanik|bosh energetik|bosh buxgalter|bosh muhandis/.test(nm)) k = pos.u === 'u1' ? 1 : 2; // bo'lim / sex, xizmat boshliqlari
                else if (rah && dep) k = 3;                                                                       // o'rinbosarlar
                else if (pos.u === 'u1') k = 4;                                                                   // boshqarma mutaxassislari
                else if (rah) k = 5; else k = 6;                                                                  // ustalar; boshqalar
                return k * 1000 + pos.no;
            }
            const role = normTxt((s && s.r) || '');
            if (/boshliq|boshlig|начальник|nachalnik|glavn|главн|bosh muhandis/.test(role)) return /orinbosar|заместит|zamestit/.test(role) ? 3500 : 1500;
            if (/muhandis|инженер|inzhener|injener|mutaxassis/.test(role)) return 4500;
            if (/usta|мастер|master/.test(role)) return 5500;
            return 6500;
        }
        function dbSortCom(list) { return (list || []).map((c, i) => ({ c: c, i: i, k: dbRank(c) })).sort((a, b) => a.k - b.k || a.i - b.i).map(x => x.c); }
        // ---------- Akt: rejim (AI / qo'lda) ----------
        function dbMode() { if (ND.form && ND.form.mode) return ND.form.mode; let m = ''; try { m = localStorage.getItem('agmk_akt_mode') || ''; } catch (e) {} return m === 'man' ? 'man' : 'ai'; }
        function dbSetMode(m) {
            try { localStorage.setItem('agmk_akt_mode', m); } catch (e) {}
            if (ND.form) { if (typeof ndFormSync === 'function' && $id('ndTur')) ndFormSync(); ND.form.mode = m; }
            if (m === 'man') { try { if (typeof W !== 'undefined') { if (W.rec) W.rec.stop(); W.on = false; } } catch (e) {} }
            if (ND.view === 'akt' && $id('screen-nd') && $id('screen-nd').classList.contains('active')) ndRender();
        }
        function dbAktSigners() { const f = ND.form || {}, out = []; if (f.apObj && f.apObj.n) out.push({ r: f.apObj.r, n: f.apObj.n, t: f.apObj.t || '', ap: 1 }); (f.com || []).forEach(c => out.push({ r: c.r, n: c.n, t: c.t || '' })); return out; }
        function dbManBuild() {
            ndFormSync(); const f = ND.form, l = ndLang(), E = escapeHtml;
            f.mTitle = ($id('dbMT') || {}).value !== undefined ? $id('dbMT').value : (f.mTitle || ''); f.mBody = ($id('dbMB') || {}).value !== undefined ? $id('dbMB').value : (f.mBody || '');
            const paras = String(f.mBody || '').split('\n').map(x => x.trim()).filter(Boolean);
            if (!paras.length) { alert('Hujjat matnini yozing (har bir xatboshi yangi qatordan).'); return; }
            if (!f.com.length) { alert("Kamida bitta komissiya aʼzosini (imzo chekuvchini) tanlang."); return; }
            const ap = f.apObj && f.apObj.n ? f.apObj : null, d = new Date((f.sana || todayISO()) + 'T00:00:00'), dnum = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
            let h = '';
            if (ap) h += l === 'ru' ? `<div class="a-approve">«Утверждаю»<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()} г.</div>` : `<div class="a-approve">“TASDIQLAYMAN”<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()}-y.</div>`;
            h += l === 'ru' ? `<div class="a-head"><span>г. Алмалык</span><span>от ${ndDateWords(f.sana, 'ru')}</span></div>` : `<div class="a-head"><span>${E(f.joy && f.joy.trim() ? f.joy.trim() : 'Olmaliq sh.')}</span><span>${dnum}-y.</span></div>`;
            const tt = String(f.mTitle || '').trim();
            h += `<div class="a-title">${tt ? E(tt) + '<br>' : ''}${l === 'ru' ? 'АКТ' : 'DALOLATNOMA'}</div>`;
            paras.forEach(x => { h += `<p>${E(x)}</p>`; });
            h += `<table class="a-sign">${f.com.map(c => `<tr><td class="l">${E(c.r)}</td><td class="m"></td><td class="r">${E(c.n)}</td></tr>`).join('')}</table>`;
            ND.html = h; ND.used = []; ND.sugg = []; ND.trInfo = null; ND.manual = true;
            ndRender(); setTimeout(() => { const p = $id('ndPage'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
        }
        // ---------- Umumiy: fayllar va manba ----------
        function dbAktSave(silent) {
            const p = $id('ndPage'); if (!p) return null;
            if (ND.savedFor === p.innerHTML && ND.savedId && ndAkts().some(a => a.id === ND.savedId)) { if (!silent) showToast('💾 Bu akt allaqachon saqlangan'); return ND.savedId; }
            ndSaveAkt();
            const L = ndAkts(), a = L[0]; if (!a) return null;
            a.sg = dbAktSigners(); a.mode = dbMode(); ndSet(ND_AKT_KEY, L);
            ND.savedId = a.id; ND.savedFor = p.innerHTML; return a.id;
        }
        async function dbSrc(kind) {
            if (kind === 'akt') {
                const p = $id('ndPage'); if (!p) return null;
                const arch = ND.view !== 'akt' && ND.archId ? ndAkts().find(a => a.id === ND.archId) : null;
                return { html: p.innerHTML, title: arch ? arch.title : ndCurTitle(), key: 'akt:' + (arch ? arch.id : (ND.savedId || 'x')), signers: arch ? (arch.sg || null) : dbAktSigners(),
                    files: async () => docMake(p.innerHTML, arch ? arch.title : ndCurTitle(), ['pdf']) };
            }
            if (kind === 'cx') {
                const doc = CXV.cur; if (!doc) return null; const snap = JSON.parse(JSON.stringify(doc)), dx = cxDxId(doc);
                return { html: dx ? await cxDxSigHtml(doc) : cxHtml(), title: cxName(), key: 'cx:' + doc.id, signers: null, files: async () => dx ? cxDxFiles(snap, ['pdf']) : docMake(cxHtml(), cxName(), ['pdf']) };
            }
            return null;
        }
        async function dbPhone(kind) {
            try {
                if (kind === 'akt') await ndExport('pdf');
                else if (kind === 'cx') await cxExport('pdf');
                else { const s = await dbSrc(kind); if (!s) return; docDownload(await s.files()); }
                showToast(window.AgmkNative ? '📥 Telefon xotirasiga saqlandi: Yuklanmalar › AGMK-STTB' : '📥 PDF yuklab olindi');
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        }
        async function dbTg(kind) {
            try { const s = await dbSrc(kind); if (!s) return; showToast('⏳ PDF tayyorlanmoqda…'); const files = await s.files(); await docShare(files, { via: 'telegram', subject: s.title, text: '📄 ' + s.title }); try { aiLog('Telegram orqali yuborildi: ' + s.title); } catch (e) {} }
            catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        }
        // ---------- ✍️ Imzoga: hammaga birdan ----------
        async function dbSign(kind) {
            if (DBAR.busy) return;
            if (!(typeof sigSrv === 'function' && sigSrv())) { alert('✍️ Imzolash korxona serveri orqali ishlaydi.\n\nKirish oynasida «📡 Serverga ulanish» orqali ulaning va tabel/parol bilan kiring. Hozircha hujjatni «✈️ Telegram» orqali yuborishingiz mumkin.'); return; }
            if (kind === 'akt' && ND.view === 'akt') dbAktSave(true);
            DBAR.busy = true;
            try {
                const s = await dbSrc(kind); if (!s || !s.html) { alert('Hujjat topilmadi'); return; }
                const list = s.signers && s.signers.length ? s.signers : sigNamesFromHtml(s.html).filter(n => n.sign).map(n => ({ n: n.label }));
                const rows = [], miss = [];
                dbSortCom(list).forEach(x => { const p = dbPerson(x); if (p && p.tabel) { if (!rows.some(r => r.tabel === p.tabel)) rows.push({ tabel: p.tabel, label: p.name, lav: p.lavozim }); } else miss.push(x.n || x.label || ''); });
                let users = []; try { users = await sigUsers(true); } catch (e) {}
                if (miss.length && users.length) for (const m of miss.slice()) { const n = sigNamesFromHtml('<p>' + escapeHtml(m) + '</p>')[0]; const u = n ? sigMatch(n, users.filter(z => !z.demo)) : null; if (u && !rows.some(r => r.tabel === u.tabel)) { rows.push({ tabel: u.tabel, label: u.name, lav: u.lavozim }); miss.splice(miss.indexOf(m), 1); } }
                if (!rows.length) { alert('Hujjatda imzo chekuvchi topilmadi (yoki ular shtat roʻyxatida yoʻq). Keyingi oynada qoʻlda tanlang.'); sigSendOpen({ html: s.html, title: s.title }); return; }
                const sent = kvGet(SIG_AUTO_KEY, {});
                if (sent[s.key] && !s.key.endsWith(':x') && !(await uiConfirm('Bu hujjat ' + fmtDT(sent[s.key]) + ' da imzoga yuborilgan. Yana yuborilsinmi?'))) return;
                showToast('⏳ Imzoga yuborilmoqda: ' + rows.length + ' kishi…');
                const res = await sigApi('/api/sign/v1/docs', 'POST', { title: s.title, html: s.html, hash: await sigSha(s.html), signers: rows.map(r => ({ tabel: r.tabel, label: r.label })) });
                sent[s.key] = new Date().toISOString(); kvSet(SIG_AUTO_KEY, sent);
                const reg = new Set(users.map(u => u.tabel)), got = new Map(((res && res.signers) || []).map(x => [x.tabel, x]));
                const skipped = res && res.skipped ? new Set(res.skipped) : new Set(res && res.signers ? [] : rows.filter(r => !reg.has(r.tabel)).map(r => r.tabel));
                const E = escapeHtml;
                const line = r => { const g = got.get(r.tabel); const later = g ? g.later : !reg.has(r.tabel); const sk = skipped.has(r.tabel); return `<div class="sg-row">${sk ? '⚠️' : later ? '⏳' : '✅'} <span><b>${E(r.label)}</b> · ${E(r.tabel)}<br><small>${E(r.lav || '')}${sk ? ' — server qabul qilmadi (xodim hali roʻyxatdan oʻtmagan; serverni 1.3 ga yangilang)' : later ? ' — hali hisob ochmagan: ochgach «Imzolash»da koʻradi' : ''}</small></span></div>`; };
                mdl('dbRes', `<div class="px-h"><b>✍️ Imzoga yuborildi</b><button class="mini-btn" onclick="mdlClose('dbRes')">✕</button></div><div class="db-res">
                    <div class="snd-doc">📄 ${E(s.title)}</div><div class="nd-tip">Hujjat quyidagilarga <b>bir vaqtda</b> ketdi (shablondagi tartibda). Har kim oʻz familiyasi qatoriga imzo qoʻyadi; hammasi imzolagach — imzolar bilan PDF.</div>
                    ${rows.map(line).join('')}
                    ${miss.length ? `<div class="hp-warn">❔ Shtat roʻyxatidan topilmadi: ${miss.map(E).join(', ')} — ularga bormadi.</div><button class="mini-btn" onclick="mdlClose('dbRes'); sigSendOpen({ html: DBAR.last.html, title: DBAR.last.title })">✏️ Qoʻlda tanlab qoʻshimcha yuborish</button>` : ''}</div>
                    <div class="pk-btns"><button onclick="mdlClose('dbRes')">Yopish</button>${res && res.id ? `<button class="pr" onclick="mdlClose('dbRes'); sigOpenDoc('${E(res.id)}')">📄 Holatini koʻrish</button>` : ''}</div>`, true);
                DBAR.last = { html: s.html, title: s.title };
                try { aiLog('Imzoga yuborildi: ' + s.title + ' → ' + rows.map(r => r.label).join(', ')); } catch (e) {} try { sigPoll(true); } catch (e) {}
            } catch (e) { console.error(e); alert('⚠️ Yuborilmadi: ' + agmkErrUz(e)); }
            finally { DBAR.busy = false; }
        }
        function dbBarHtml(kind, save) {
            return `<div class="dbar${save ? '' : ' n3'}">${save ? `<button class="db-save" onclick="${save}"><i>💾</i>Saqlash</button>` : ''}<button class="db-ph" onclick="dbPhone('${kind}')"><i>📥</i>Telefonga</button><button class="db-tg" onclick="dbTg('${kind}')"><i>✈️</i>Telegram</button><button class="db-sg" onclick="dbSign('${kind}')"><i>✍️</i>Imzoga</button></div>`;
        }
        // Eski tugmalar («Word, JPG, chop etish, boshqa kanal») — «⋯ Boshqa» ichiga
        function dbFold(root, after) {
            const acts = Array.from(root.querySelectorAll('.nd-acts')).filter(a => !a.querySelector('.ai-pol') && !a.closest('.dbar-more'));
            if (!acts.length) return;
            const d = document.createElement('details'); d.className = 'dbar-more'; d.innerHTML = '<summary>⋯ Boshqa: Word, rasm, chop etish, boshqa kanallar</summary>';
            (after || acts[0]).after(d); acts.forEach(a => d.appendChild(a)); d.querySelectorAll('button').forEach(b => { if (/ndSaveAkt\(/.test(b.getAttribute('onclick') || '')) b.remove(); });
        }
        // ---------- Ulanishlar ----------
        (function () {
            // Akt oynasi: rejim tanlash, qo'lda maydonlar, pastda tugmalar qatori
            ndRenderAkt = agmkExtend('ndRenderAkt', 'v3.2: AI / qoʼlda rejim · hujjat tugmalari (saqlash, telefonga, Telegram, imzoga)', ndRenderAkt, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const f = ND.form, body = $id('ndBody'), form = body && body.querySelector('.nd-form'); if (!f || !form) return r;
                    const man = dbMode() === 'man'; f.mode = f.mode || dbMode();
                    if (!form.querySelector('.db-mode')) { const m = document.createElement('div'); m.className = 'db-mode'; m.innerHTML = `<button class="${man ? '' : 'on'}" onclick="dbSetMode('ai')">🤖 AI yordamida</button><button class="${man ? 'on m' : ''}" onclick="dbSetMode('man')">✍️ Qoʻlda (tez)</button>`; const h4 = form.querySelector('h4'); if (h4) h4.after(m); else form.prepend(m); }
                    if (man) {
                        const hideF = id => { const e = $id(id); const g = e && e.closest('.nd-f'); if (g) g.style.display = 'none'; };
                        ['ndText', 'ndObj', 'ndVag', 'ndHs', 'ndOrn'].forEach(hideF);
                        const w = $id('ndwBox'); if (w) w.style.display = 'none';
                        form.querySelectorAll('button').forEach(b => { if (/ndGenerate\(/.test(b.getAttribute('onclick') || '')) b.style.display = 'none'; });
                        form.querySelectorAll('.nd-tip').forEach(t => { if (/AI rasmiy uslubga|Qisqa yozing|avtomatik tarjima/.test(t.textContent)) t.style.display = 'none'; }); if ($id('ndTitle')) $id('ndTitle').innerText = 'Akt tuzish (qoʻlda)';
                        if (!$id('dbMT')) {
                            const ap = Array.from(form.querySelectorAll('.nd-f')).find(g => /TASDIQLOVCHI/.test((g.querySelector('label') || {}).textContent || ''));
                            const box = document.createElement('div'); box.className = 'db-manf';
                            box.innerHTML = `<div class="nd-f"><label>SARLAVHA (masalan: «… vagonning texnik holati toʻgʻrisida»)</label><input id="dbMT" value="${escapeHtml(f.mTitle || '')}" oninput="ND.form.mTitle=this.value" placeholder="ixtiyoriy"></div>
                                <div class="nd-f"><label>MATN — har bir xatboshi yangi qatordan (qanday yozsangiz, shunday chiqadi)</label><textarea id="dbMB" rows="8" oninput="ND.form.mBody=this.value" placeholder="Biz quyida imzo chekuvchilar ... ushbu dalolatnomani tuzdik.&#10;1. ...&#10;2. ...">${escapeHtml(f.mBody || '')}</textarea><div class="nd-tip">✍️ Qoʻlda rejim: AI, tarjima va normativ qidiruv ishlamaydi — hujjat bir zumda tayyor boʻladi.</div></div>`;
                            if (ap) ap.before(box); else form.appendChild(box);
                            const go = document.createElement('button'); go.className = 'action-btn db-man-go'; go.textContent = '📄 Hujjatni tayyorlash'; go.onclick = dbManBuild; form.appendChild(go);
                        }
                        body.querySelectorAll('.nd-form').forEach(x => { if (x !== form && /Qoʻllanilgan|Qo'llanilgan|normativ asoslar/.test((x.querySelector('h4') || {}).textContent || '')) x.style.display = 'none'; });
                        body.querySelectorAll('.ai-pol').forEach(b => { const a = b.closest('.nd-acts'); if (a) a.style.display = 'none'; });
                    }
                    const p = $id('ndPage');
                    if (p && !body.querySelector('.dbar')) {
                        const acts = Array.from(body.querySelectorAll('.nd-acts')).filter(a => !a.querySelector('.ai-pol'));
                        const anchor = acts[0] || p; const wrap = document.createElement('div'); wrap.innerHTML = dbBarHtml('akt', 'dbAktSave()');
                        (acts[0] ? acts[0].before(wrap.firstChild) : p.after(wrap.firstChild));
                        dbFold(body, body.querySelector('.dbar'));
                    }
                } catch (e) { console.error(e); }
                return r;
            });
            // Arxivdagi akt: telefonga, Telegram, imzoga
            ndOpenArch = agmkExtend('ndOpenArch', 'v3.2: arxivdagi akt — hujjat tugmalari', ndOpenArch, o => function (id) {
                const r = o.apply(this, arguments);
                try { ND.archId = id; const body = $id('ndBody'), p = $id('ndPage'); if (p && body && !body.querySelector('.dbar')) { const w = document.createElement('div'); w.innerHTML = dbBarHtml('akt', ''); p.after(w.firstChild); dbFold(body, body.querySelector('.dbar')); } } catch (e) { console.error(e); }
                return r;
            });
            // Yangi akt — oldingi saqlash belgisi tozalanadi
            ndGenerate = agmkExtend('ndGenerate', 'v3.2: yangi akt — saqlash belgisi', ndGenerate, o => function () { ND.savedId = null; ND.savedFor = null; ND.manual = false; return o.apply(this, arguments); });
            // Imzo chekuvchilar qo'shilganda — shablondagi tartib
            const sortCom = () => { try { if (ND.form && ND.form.com && ND.form.com.length > 1) ND.form.com = dbSortCom(ND.form.com); } catch (e) {} };
            ndComAdd = agmkExtend('ndComAdd', 'v3.2: imzo chekuvchilar shablon tartibida', ndComAdd, o => function () { const r = o.apply(this, arguments); sortCom(); ndRender(); return r; });
            ndComCustom = agmkExtend('ndComCustom', 'v3.2: imzo chekuvchilar shablon tartibida', ndComCustom, o => async function () { const r = await o.apply(this, arguments); sortCom(); ndRender(); return r; });
        })();
        // ---------- Achotlar: PDF bir bosishda (telefonga yoki Telegram) ----------
        function dbPdfTable(title, sub, head, rows, foot) {
            const E = escapeHtml;
            return `<div class="a-head"><span>“Olmaliq KMK” AJ STTB</span><span>${E(fmtISO(todayISO()))}-y.</span></div><div class="a-title">${E(title)}</div>${sub ? `<p class="ni">${E(sub)}</p>` : ''}
                <table><tr>${head.map(h => `<th>${E(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${E(String(c))}</td>`).join('')}</tr>`).join('')}</table>${foot ? `<p class="ni">${E(foot)}</p>` : ''}`;
        }
        async function wkPdf(id, share) {
            let rec = wkDB().list.find(x => x.id === id); if (!rec) return; const sel = wkSel(wkDB(), rec); rec = Object.assign({}, rec, { skl: sel, tot: wkTot(rec, sel) }); const cols = WK_B.filter(([k]) => k !== 'b5' || rec.tot.b5);
            const rows = rec.skl.map(k => { const R = rec.res[k] || {}; return [k].concat(cols.map(([b]) => wkMoney(R[b])), [wkMoney(R.all)]); }); rows.push(['Jami'].concat(cols.map(([b]) => wkMoney(rec.tot[b])), [wkMoney(rec.tot.all)]));
            const t = 'Haftalik achot (Forma-30) — ' + fmtISO(rec.ref);
            const html = dbPdfTable(t, (rec.per ? 'Davr: ' + fmtISO(rec.per.a) + ' – ' + fmtISO(rec.per.b) + '. ' : '') + 'Summa prixod sanasiga («Дата партии») qarab guruhlangan, soʻm.', ['Sklad'].concat(cols.map(c => c[1]), ['Jami']), rows, 'Manba: ' + rec.file + ' · Tayyorladi: ' + authorStr());
            const files = await docMake(html, 'Haftalik_achot_' + rec.ref, ['pdf']);
            if (share) await docShare(files, { via: 'telegram', subject: t, text: '📅 ' + t }); else { docDownload(files); showToast(window.AgmkNative ? '📥 Telefon xotirasiga saqlandi: Yuklanmalar › AGMK-STTB' : '📥 PDF yuklab olindi'); }
        }
        async function polPdf(share) {
            const d = POL.date || todayISO(), txt = polText(d), E = escapeHtml, t = 'Polojeniya — ' + fmtISO(d);
            const html = `<div class="a-head"><span>“Olmaliq KMK” AJ STTB</span><span>${E(fmtISO(d))}-y.</span></div><div class="a-title">${E(t)}</div>` + txt.split('\n').slice(1).map(l => l.trim() ? `<p class="ni">${E(l)}</p>` : '').join('') + `<p class="ni">Tayyorladi: ${E(authorStr())}</p>`;
            const files = await docMake(html, 'Polojeniya_' + d, ['pdf']);
            if (share) await docShare(files, { via: 'telegram', subject: t, text: '📋 ' + t }); else { docDownload(files); showToast(window.AgmkNative ? '📥 Telefon xotirasiga saqlandi: Yuklanmalar › AGMK-STTB' : '📥 PDF yuklab olindi'); }
        }
        async function hsPdfQuick(id) { // belgilangan hisobot PDF — ko'rish oynasini ochmasdan
            showToast('⏳ PDF tayyorlanmoqda…');
            try { await hsPdfOpen(id); await hsPdfExport(); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } finally { const m = $id('hsPdf'); if (m) m.classList.add('hidden'); }
        }
        // AI xodim qidiruvi: akt imzo chekuvchilari roʻyxatidagi «@@N:342@@» kabi yozuvlar — shtat roʻyxatidagi odamning takrori boʻlsa chiqarilmaydi
        (function () {
            if (typeof dbPeople === 'function') dbPeople = agmkExtend('dbPeople', 'v3.2: imzo chekuvchi yozuvlari shtat roʻyxatidagi odam bilan takrorlanmaydi', dbPeople, o => function () {
                return o.apply(this, arguments).filter(r => !(r.su === 'Akt imzo chekuvchisi' && dbPerson({ n: r.item.name, r: r.item.lavozim })));
            });
        })();
        // AI: shtat roʻyxatidagi xodim haqidagi savollar boshqa bosqichlarga (lugʻat, buxgalteriya xarajatlari) ketib qolmasin:
        // «ПТО начальник», «bosh buxgalter», «kadrlar boʻlimi boshligʻi», familiya + ism («Kurbonov Zuxriddin»)
        (function () {
            if (typeof aiStage !== 'function') return;
            aiStage('Shtat roʻyxatidan xodim (lavozim + boʻlinma, familiya + ism)', function (q, next) {
                try {
                    const n = dbN(q), toks = n.split(' ').filter(Boolean);
                    if (/(akt|dalolatnoma|hisobot|achot|xarajat|vagon|lokomotiv|grafik|polojeniya|zayavka|yubor|jo.?nat|pechat|chop|pdf|excel|zapchast|ombor|sklad|norma|gost|forma)/.test(n)) return next(q);
                    const role = DB_ROLES.some(r => toks.some(t => r[0].test(t))), unit = DB_ABBR.some(a => a[0].test(n)) || /\b[1-9]\s*-?\s*(tys|sex|seh)\b/.test(n) || /\bbosh (buxgalter|muhandis|mexanik|energetik)/.test(n);
                    let hit = role && (unit || allXodims().some(r => r.item.stansiya && toks.some(t => t.length >= 5 && dbN(r.item.stansiya).includes(t.slice(0, 6)))));
                    if (!hit && toks.length >= 2 && toks.length <= 4 && toks.every(t => /^[a-z'-]+$/.test(t))) { // faqat F.I.Sh.
                        const L = allXodims().filter(r => r.item.roster && toks.filter(t => t.length >= 3).every(t => dbN(r.item.name).split(' ').some(w => w === t || (t.length >= 5 && w.startsWith(t.slice(0, t.length - 1))))));
                        hit = L.length >= 1 && L.length <= 3;
                    }
                    if (hit) { const r = dbPeopleReply(/\bkim\b|telefon|tabel|lavozim/.test(n) ? q : q + ' kim'); if (r) return { t: typeof r === 'string' ? r + (/Manba:/.test(r) ? '' : '\n📚 Manba: shtat roʻyxati (' + fmtISO(ROSTER_V) + ')') : r.t, personal: false }; }
                } catch (e) { console.error(e); }
                return next(q);
            });
        })();
        // Imzo chekuvchi tanlashda lavozim hujjatdagidek aniq: umumiy nomlarga joyi qoʻshiladi
        // («Boʻlim boshligʻi (Ishlab chiqarish-texnik boʻlimi)», «Sex boshligʻi (2-TYS)», «Uchastka ustasi (2-TYS, Vagonlarni taʼmirlash parki)»)
        function dbRoleFull(it) {
            const pos = it && it.posNo ? posByNo(it.posNo) : null; if (!pos) return (it && it.lavozim) || '';
            const nm = pos.name, u = unitById(pos.u), g = pos.g ? groupById(pos.g) : null;
            if (!/^(bo.?lim boshlig.?i|sex boshlig.?i|xizmat boshlig.?i|xizmat boshlig.?i o.?rinbosari|uchastka ustasi|usta|smena ustasi|katta yo.?l ustasi|yo.?l ustasi|bosh muhandis|mexanik|energetik|elektromexanik|katta elektromexanik|i-toifali buxgalter|yetakchi buxgalter|mehnat bo.?yicha i-toifali iqtisodchi)$/i.test(nm)) return nm;
            const place = pos.u === 'u1' ? (g ? g.name : '') : [u ? u.short : '', g ? g.name : ''].filter(Boolean).join(', ');
            return place ? nm + ' (' + place + ')' : nm;
        }
        (function () {
            if (typeof ppPeople === 'function') ppPeople = agmkExtend('ppPeople', 'v3.2: lavozim — joyi bilan (shtat roʻyxatidan)', ppPeople, o => function () {
                return o.apply(this, arguments).map(p => { if (p.t) { const f = findXodimsByTabel(p.t); if (f.length === 1 && f[0].item.posNo) return Object.assign({}, p, { r: dbRoleFull(f[0].item) }); } return p; });
            });
        })();

