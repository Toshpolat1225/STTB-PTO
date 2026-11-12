
        // =====================================================================
        // v3.0 — 📦 MTTB: KELGAN EHTIYOT QISMLAR (foto / PDF / fayl bilan) va ✅ QABUL QILINGANLAR
        //  • Kelganini rahbariyat, MTTB yoki ombor xodimi kiritadi: zapchastlar + suratlar/fayllar, har biriga izoh.
        //    Telegram'dagi yozuvni («Плунжерная пара д50.27 - 23 шт …») qo'yish mumkin — qatorlarga o'zi ajratiladi.
        //  • Bizdagi xodim «✅ Qabul qilish»: holati (to'liq/soni kam/kamchilik/shikastlangan), har qatorda qabul qilingan
        //    soni, o'z suratlari/fayllari (izoh bilan), umumiy izoh. Kim (lavozimi, familiyasi), sana va vaqt avtomatik.
        //  • Fayllar telefonda saqlanadi; korxona serveri bo'lsa bo'lim uchun serverga ham yuklanadi (boshqa qurilmalarda ochiladi).
        // =====================================================================
        var MT3 = { files: [], busy: 0 };
        var MT_HOLAT = { soz: ['✅', 'Toʻliq va soz'], kam: ['⚠️', 'Soni kam keldi'], nuq: ['⚠️', 'Kamchilik bor'], shk: ['⛔', 'Shikastlangan / yaroqsiz'] };
        function mtCanSend() { return canMT() || hasRole('rahbar'); }
        function mtMe() { return { t: meTabel(), n: (currentUser && currentUser.name) || '', r: (currentUser && currentUser.role && currentUser.role !== '—' ? currentUser.role : '') }; }
        function mtPerson(b) { if (!b) return '—'; return typeof polPerson === 'function' ? polPerson(b.n + (b.r ? ' (' + b.r + ')' : '')) : b.n; }
        // ---------- Telegram matnidan qatorlar ----------
        var MT_UNITS = { 'шт': 'dona', 'штук': 'dona', 'dona': 'dona', 'ta': 'dona', 'кг': 'kg', 'kg': 'kg', 'компл': 'komplekt', 'комплект': 'komplekt', 'к-т': 'komplekt', 'пар': 'juft', 'пара': 'juft', 'juft': 'juft', 'м': 'm', 'm': 'm', 'л': 'l', 'l': 'l', 'т': 't', 'tn': 't' };
        function mtParseText(txt) {
            const s = String(txt || '').replace(/\r/g, ''), out = { items: [], by: '' };
            const acc = s.match(/(?:қабул|кабул|qabul)\s*(?:қилинди|килинди|qilindi|qildim)\s*[:,-]?\s*([^\n]*)/i); if (acc) out.by = acc[1].trim();
            const body = acc ? s.slice(0, acc.index) + '\n' + s.slice(acc.index + acc[0].length) : s;
            const re = /([^\n]*?)\s*[-–—:]\s*(\d+(?:[.,]\d+)?)\s*(штук|шт|dona|ta|кг|kg|комплект|компл|к-т|пара|пар|juft|tn|м|m|л|l|т)(?![а-яёa-z])\.?/gi; let m;
            while ((m = re.exec(body))) { const n = m[1].replace(/^[\s,;.•\-–—]+|[\s,;.\-–—]+$/g, '').trim(); if (!n || !/[a-zа-яёʻ']/i.test(n)) continue; out.items.push({ n: n, q: m[2].replace('.', ','), u: MT_UNITS[m[3].toLowerCase()] || m[3] }); }
            return out;
        }
        // ---------- Fayllar (asl sifatda, 4096 px gacha; har biriga izoh) ----------
        async function mtImg(file) {
            const bmp = await new Promise((res, rej) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(u), 1000); }; im.onerror = rej; im.src = u; });
            const w = bmp.naturalWidth, h = bmp.naturalHeight, s = Math.min(1, 4096 / Math.max(w, h)); // v3.1: sifat birinchi — 4096 px gacha asl holicha
            const blob = s === 1 && file.size <= 25e6 ? file : await canvasToBlob(drawToCanvas(bmp, Math.round(w * s), Math.round(h * s)), 0.95);
            const t = Math.min(1, MT_TH / Math.max(w, h)), th = drawToCanvas(bmp, Math.max(1, Math.round(w * t)), Math.max(1, Math.round(h * t))).toDataURL('image/jpeg', 0.85); // v3.2.2: roʻyxatdagi kichik rasm ham tiniq (telefon ekrani zich)
            return { blob: blob, th: th };
        }
        async function mtAddFiles(inp, box) {
            const L = [...(inp.files || [])]; inp.value = ''; if (!L.length) return;
            MT3.busy++; mtFilesDraw(box);
            for (const f of L) {
                try {
                    if (f.size > 30e6) { alert('«' + f.name + '» juda katta (30 MB gacha).'); continue; }
                    const img = /^image\//.test(f.type) && !/svg/.test(f.type); let blob = f, th = '';
                    if (img) { try { const r = await mtImg(f); blob = r.blob; th = r.th; } catch (e) {} }
                    const keepMime = img && blob === f;
                    const id = 'mt:' + uid('f'), name = img && !keepMime ? String(f.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg' : (f.name || 'fayl'), mime = img && !keepMime ? 'image/jpeg' : (f.type || 'application/octet-stream');
                    await mediaSave(id, blob, { id: id, at: new Date().toISOString(), size: blob.size, name: name, mime: mime, mttb: true });
                    MT3.files.push({ id: id, name: name, mime: mime, size: blob.size, th: th, thv: 2, note: '' });
                } catch (e) { console.error(e); alert('Faylni qoʻshib boʻlmadi: ' + (f.name || '')); }
            }
            MT3.busy--; mtFilesDraw(box);
        }
        function mtFilesRead() { document.querySelectorAll('[data-mtfn]').forEach(el => { const f = MT3.files[+el.dataset.mtfn]; if (f) f.note = el.value; }); }
        function mtFilesDraw(box) {
            mtFilesRead(); const b = $id(box || 'mtFiles'); if (!b) return; const E = escapeHtml;
            b.innerHTML = MT3.files.map((f, i) => `<div class="mt3-f">${f.th ? `<img src="${f.th}">` : `<span class="mt3-ic">${/pdf/.test(f.mime) ? '📄' : '📎'}</span>`}<div><small>${E(f.name)} · ${Math.max(1, Math.round(f.size / 1024))} KB</small><input data-mtfn="${i}" placeholder="Izoh (masalan: qadoq ochilgan, 2 tasi zanglagan…)" value="${E(f.note || '')}"></div><b onclick="mtFilesRead(); MT3.files.splice(${i},1); mtFilesDraw('${box || 'mtFiles'}')">✕</b></div>`).join('')
                + (MT3.busy ? '<small class="mm-sub">⏳ Fayllar tayyorlanmoqda…</small>' : '');
        }
        function mtFilesPicker(box) {
            return `<div id="${box}"></div><div class="alb-btns"><label class="mini-btn">📷 Suratga olish<input type="file" accept="image/*" capture="environment" multiple hidden onchange="mtAddFiles(this,'${box}')"></label><label class="mini-btn">📎 Foto / PDF / fayl<input type="file" multiple hidden accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,*/*" onchange="mtAddFiles(this,'${box}')"></label></div>`;
        }
        // Serverga (bo'lim fayli) — tarmoq bo'lmasa keyinroq o'zi yuklanadi
        async function mtFilesUp(list) {
            if (typeof srvRaw !== 'function' || typeof syncReady !== 'function' || !syncReady()) return false; let all = true;
            for (const f of list) { if (f.srv) continue; try { const b = await mediaGetBlob(f.id); if (!b) continue; const r = await srvRaw('/api/files/v1?to=' + encodeURIComponent('*mttb') + '&name=' + encodeURIComponent(f.name) + '&mime=' + encodeURIComponent(f.mime), { method: 'POST', body: b }); f.srv = (await r.json()).id; } catch (e) { all = false; } }
            return all;
        }
        var MT_TH = 480;
        // Eski (160 px, xira) kichik rasmlarni asl rasmdan qayta yasash — asl fayl shu telefonda boʻlsa
        async function mtThumbsUpgrade() {
            const d = mtData(); let ch = false;
            for (const k of d.kir) for (const f of [].concat(k.files || [], (k.acc && k.acc.files) || [])) {
                if (!f || f.thv === 2 || !/^image\//.test(f.mime || '')) continue;
                let b = null; try { b = await mediaGetBlob(f.id); } catch (e) {} if (!b) continue;
                try { const u = URL.createObjectURL(b), im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; }); const w = im.naturalWidth, h = im.naturalHeight, t = Math.min(1, MT_TH / Math.max(w, h)); f.th = drawToCanvas(im, Math.max(1, Math.round(w * t)), Math.max(1, Math.round(h * t))).toDataURL('image/jpeg', 0.85); f.thv = 2; URL.revokeObjectURL(u); ch = true; k.upd = new Date().toISOString(); } catch (e) {}
            }
            if (ch) { mtSave(d); try { KV_SYNC.dirty = true; } catch (e) {} }
        }
        async function mtFilesSync() {
            try { await mtThumbsUpgrade(); } catch (e) {}
            const d = mtData(), me = meTabel(); let ch = false;
            for (const k of d.kir) { const sets = [k.files || []].concat(k.acc ? [k.acc.files || []] : []); for (const L of sets) { const mine = L.filter(f => !f.srv && f.up === me); if (mine.length) { await mtFilesUp(mine); if (mine.some(f => f.srv)) { ch = true; k.upd = new Date().toISOString(); } } } }
            if (ch) { mtSave(d); try { KV_SYNC.dirty = true; } catch (e) {} }
        }
        async function mtFileBlob(f) {
            let b = null; try { b = await mediaGetBlob(f.id); } catch (e) {}
            if (!b && f.srv && typeof srvFileGet === 'function') { b = await srvFileGet(f.srv, f.mime); try { await mediaSave(f.id, b, { id: f.id, at: new Date().toISOString(), size: b.size, name: f.name, mime: f.mime, mttb: true }); } catch (e) {} }
            return b;
        }
        function mtFind(kid, fid) { const k = mtData().kir.find(x => x.id === kid); if (!k) return null; return [].concat(k.files || [], (k.acc && k.acc.files) || []).find(f => f.id === fid) || null; }
        async function mtOpenFile(kid, fid) {
            const k = mtData().kir.find(x => x.id === kid), f = mtFind(kid, fid); if (!f) return;
            let b; try { b = await mtFileBlob(f); } catch (e) { alert('Faylni serverdan olib boʻlmadi: ' + agmkErrUz(e)); return; } if (!b) { alert('Fayl bu qurilmada yoʻq (korxona serveriga ulaning).'); return; }
            if (/^image\//.test(f.mime)) {
                const L = [].concat(k.files || [], (k.acc && k.acc.files) || []).filter(x => /^image\//.test(x.mime)); const urls = [], au = [];
                for (const x of L) { let bb = null; try { bb = x === f ? b : await mtFileBlob(x); } catch (e) {} if (!bb) continue; urls.push(URL.createObjectURL(bb)); au.push((x.note ? '📝 ' + x.note : '') + ((k.files || []).includes(x) ? '  · 📥 kelgan' : '  · ✅ qabul')); }
                openImageViewerModal(urls, au, Math.max(0, urls.length - 1 - [...L].reverse().findIndex(x => x === f))); return;
            }
            const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = f.name; a.target = '_blank'; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(u); }, 4000);
        }
        function mtFilesView(k, L) {
            const E = escapeHtml; if (!(L || []).length) return '';
            return `<div class="mt3-g">${L.map(f => `<div onclick="event.stopPropagation(); mtOpenFile('${k.id}','${f.id}')">${f.th ? `<img src="${f.th}">` : `<span class="mt3-ic">${/pdf/.test(f.mime) ? '📄' : '📎'}</span>`}<small>${E(f.note || (f.th ? '' : f.name))}</small></div>`).join('')}</div>`;
        }
        // ---------- Kelgan (kirim) — forma qo'shimchalari ----------
        function mtKPaste() {
            const t = ($id('mtk_txt') || {}).value || '', P = mtParseText(t); if (!P.items.length) { alert('Matndan zapchast qatorlari topilmadi. Namuna: «Плунжерная пара д50.27 - 23 шт».'); return; }
            mtRowsRead(); MTF.rows = MTF.rows.filter(r => r.n || r.q).concat(P.items); mtRowsDraw(); showToast('📋 ' + P.items.length + ' ta qator qoʻshildi' + (P.by ? ' · qabul qilgan: ' + P.by : ''));
            if (P.by) MT3.pasteBy = P.by;
        }
        // ---------- ✅ Qabul qilish ----------
        function mtAccForm(kid) {
            const k = mtData().kir.find(x => x.id === kid); if (!k) return; if (!(currentUser && currentUser.tabel)) { alert('Avval tizimga kiring.'); return; }
            const E = escapeHtml; MT3.files = []; MT3.kid = kid;
            mdl('mtModal', `<div class="px-h"><b>✅ Qabul qilish</b><button class="mini-btn" onclick="mdlClose('mtModal')">✕</button></div>
                <small class="mm-sub">📥 ${E(fmtDT(k.at))} · kiritdi: ${E(mtPerson(k.by))}${k.zno ? ' · zayavka №' + k.zno : ''}</small>
                ${mtFilesView(k, k.files)}
                <div class="mm-f"><label>Holati</label><div class="snd-chips" id="mta_h">${Object.keys(MT_HOLAT).map((h, i) => `<i class="${i ? '' : 'on'}" data-h="${h}" onclick="this.parentNode.querySelectorAll('i').forEach(x => x.classList.remove('on')); this.classList.add('on')">${MT_HOLAT[h][0]} ${E(MT_HOLAT[h][1])}</i>`).join('')}</div></div>
                <div class="mm-f"><label>Qabul qilingan soni (har qatorda)</label><div class="gt-scroll"><table class="mt-t"><tr><th>Nomi</th><th>Keldi</th><th>Qabul qilindi</th></tr>${k.items.map((i, n) => `<tr><td>${E(i.n)}</td><td>${E(String(i.q))} ${E(i.u || '')}</td><td><input data-mtq="${n}" inputmode="decimal" value="${E(String(i.q))}" style="width:80px"></td></tr>`).join('')}</table></div></div>
                <div class="mm-f"><label>Suratlar va fayllar (har biriga izoh)</label>${mtFilesPicker('mtAccFiles')}</div>
                <div class="mm-f"><label>Izoh</label><textarea id="mta_note" rows="2" placeholder="masalan: qadoqlar butun, 1-ПДГ halqalari toʻliq sanaldi"></textarea></div>
                <div class="nd-tip">Kim qabul qilgani (${E(mtPerson(mtMe()))}), sana va vaqt avtomatik yoziladi.</div>
                <button class="action-btn" onclick="mtAccSave()">✅ Qabul qildim — saqlash</button>`, true);
            mtFilesDraw('mtAccFiles');
        }
        async function mtAccSave() {
            if (MT3.busy) { alert('Fayllar hali tayyorlanmoqda — biroz kuting.'); return; }
            mtFilesRead(); const d = mtData(), k = d.kir.find(x => x.id === MT3.kid); if (!k) return;
            const h = (document.querySelector('#mta_h i.on') || {}).dataset; const hol = (h && h.h) || 'soz';
            const items = k.items.map((i, n) => { const el = document.querySelector('[data-mtq="' + n + '"]'); return { n: i.n, q: i.q, u: i.u, got: el ? el.value.trim() : String(i.q) }; });
            const note = ($id('mta_note').value || '').trim();
            if (hol !== 'soz' && !note && !MT3.files.some(f => f.note)) { alert('Kamchilik boʻlsa — izohda nima ekanini yozing (yoki suratga izoh qoʻshing).'); return; }
            const me = mtMe(), files = MT3.files.map(f => Object.assign({}, f, { up: me.t }));
            k.acc = { at: new Date().toISOString(), by: me, holat: hol, items: items, files: files, note: note }; k.upd = k.acc.at;
            mtSave(d); try { KV_SYNC.dirty = true; } catch (e) {} MT3.files = []; mdlClose('mtModal'); MT.tab = 'qab'; mtRender();
            showToast('✅ Qabul qilindi — ' + mtPerson(me));
            const txt = '✅ Qabul qilindi (' + MT_HOLAT[hol][1].toLowerCase() + '): ' + items.map(i => i.n + ' — ' + i.got + ' ' + (i.u || '')).join(', ') + ' · ' + mtPerson(me) + (note ? ' · Izoh: ' + note : '');
            try { if (k.by && k.by.t && k.by.t !== me.t) notify({ icon: '✅', text: txt, toTabel: k.by.t }); } catch (e) {}
            try { if (k.by && k.by.t && k.by.t !== me.t && syncReady()) await syncSendMsg({ tabel: k.by.t, name: k.by.n }, '📦 ' + txt); } catch (e) {}
            try { aiLog('MTTB qabul: ' + items.map(i => i.n + ' ' + i.got).join(', ')); } catch (e) {}
            mtFilesSync().catch(() => {});
        }
        // ---------- Ro'yxatlar ----------
        function mtKCard(k) {
            const E = escapeHtml, a = k.acc, H = a ? MT_HOLAT[a.holat] || MT_HOLAT.soz : null;
            return `<div class="mm-card ${a ? (a.holat === 'soz' ? 'ok' : 'bad') : 'warn'}"><b>📥 ${E(fmtDT(k.at))}${k.zno ? ' · zayavka №' + k.zno : ''} · ${a ? H[0] + ' qabul qilindi' : '⏳ qabul qilinmagan'}</b>
                <small>${k.items.map(i => E(i.n) + ' — ' + E(String(i.q)) + ' ' + E(i.u || '') + (mtNum(i.p) ? ' × ' + fmtSum(i.p) + ' soʻm' : '')).join('; ')}</small>
                <small>✍️ Kiritdi: ${E(mtPerson(k.by))}${k.doc ? ' · 📄 ' + E(k.doc) : ''}${k.note ? ' · ' + E(k.note) : ''}</small>
                ${mtFilesView(k, k.files)}
                ${a ? `<small>✅ Qabul qildi: <b>${E(mtPerson(a.by))}</b> · ${E(fmtDT(a.at))} · ${H[0]} ${E(H[1])}</small>` : `<button class="mini-btn" onclick="mtAccForm('${k.id}')">✅ Qabul qilish</button>`}</div>`;
        }
        function mtQabCard(k) {
            const E = escapeHtml, a = k.acc, H = MT_HOLAT[a.holat] || MT_HOLAT.soz, diff = a.items.filter(i => mtNum(i.got) !== mtNum(i.q));
            return `<div class="mm-card ${a.holat === 'soz' && !diff.length ? 'ok' : 'bad'}"><b>✅ ${E(fmtDT(a.at))} · ${H[0]} ${E(H[1])}</b>
                <small>👤 <b>${E(mtPerson(a.by))}</b> (tabel ${E(a.by.t || '')})</small>
                <small>${a.items.map(i => E(i.n) + ' — ' + E(String(i.got)) + ' ' + E(i.u || '') + (mtNum(i.got) !== mtNum(i.q) ? ' <span style="color:#fca5a5">(keldi ' + E(String(i.q)) + ')</span>' : '')).join('; ')}</small>
                ${a.note ? `<small>📝 ${E(a.note)}</small>` : ''}
                ${mtFilesView(k, a.files)}
                <small class="mm-sub">📥 Kelgan: ${E(fmtDT(k.at))} · kiritdi ${E(mtPerson(k.by))}${(k.files || []).length ? ' · ' + k.files.length + ' ta fayl' : ''}</small></div>`;
        }
        function mtQabHtml() {
            const d = mtData(), q = dbN(MT.q), E = escapeHtml;
            const l = d.kir.filter(k => k.acc).sort((a, b) => String(b.acc.at).localeCompare(String(a.acc.at))).filter(k => !q || dbN([k.acc.by && k.acc.by.n, k.acc.note, k.acc.by && k.acc.by.r].concat(k.acc.items.map(i => i.n), (k.acc.files || []).map(f => f.note)).join(' ')).includes(q));
            const wait = d.kir.filter(k => !k.acc).length;
            return `<div class="mm-flt"><input class="search-box" placeholder="🔎 Zapchast, xodim, izoh..." value="${E(MT.q)}" oninput="MT.q=this.value; clearTimeout(MT.tm); MT.tm=setTimeout(mtRender,250)"></div>
                ${wait ? `<div class="nd-tip" onclick="mtTab('kir')">⏳ Qabul qilinishi kutilayotgan: <b>${wait}</b> ta — «📥 Kelganlar» boʻlimida</div>` : ''}` + (l.map(mtQabCard).join('') || '<div class="xt-empty">Hali qabul qilinmagan</div>');
        }
        (function () {
            const c = document.createElement('style');
            c.textContent = '.mt3-f{display:flex;gap:8px;align-items:center;margin:6px 0;padding:6px;border:1px solid rgba(255,255,255,.08);border-radius:10px}.mt3-f img{width:56px;height:56px;object-fit:cover;border-radius:8px}.mt3-f>div{flex:1;min-width:0}.mt3-f input{width:100%;margin-top:3px}.mt3-f small{color:#94a3b8;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mt3-f b{cursor:pointer;color:#fca5a5;padding:4px}'
                + '.mt3-ic{width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:28px;background:rgba(255,255,255,.06);border-radius:8px}'
                + '.mt3-g{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.mt3-g>div{width:74px;cursor:pointer}.mt3-g img,.mt3-g .mt3-ic{width:74px;height:74px;object-fit:cover;border-radius:8px}.mt3-g small{display:block;font-size:10.5px;color:#cbd5e1;line-height:1.2;max-height:2.5em;overflow:hidden}';
            document.head.appendChild(c);
            try { SEC_EV.fns.push(function () { mtFilesSync().catch(() => {}); }); } catch (e) {}
        })();

