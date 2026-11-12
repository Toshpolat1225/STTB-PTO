        // =========================================================
        // 9) VAGON ESLATMA ALBOMI — holatni darhol rasmga olish, vaqt tarixi, dalolatnomaga o'tkazish
        // =========================================================
        var ALB_KEY = 'agmk_album';
        function albAll() { return kvGet(ALB_KEY, {}); }
        function albOf(vid) { return (albAll()[vid] || []).slice().sort((a, b) => String(b.at).localeCompare(String(a.at))); }
        function albSaveList(vid, l) { const a = albAll(); a[vid] = l; kvSet(ALB_KEY, a); }
        var ALB = { sel: new Set(), url: {} };
        // JPEG ichidagi olingan vaqt (EXIF DateTimeOriginal)
        async function exifTime(file) {
            try {
                const buf = new DataView(await file.slice(0, 131072).arrayBuffer());
                if (buf.getUint16(0) !== 0xFFD8) return null;
                let o = 2;
                while (o < buf.byteLength - 4) {
                    const mk = buf.getUint16(o), len = buf.getUint16(o + 2);
                    if (mk === 0xFFE1 && buf.getUint32(o + 4) === 0x45786966) {
                        const t = o + 10, le = buf.getUint16(t) === 0x4949, g16 = p => buf.getUint16(p, le), g32 = p => buf.getUint32(p, le);
                        const rd = (ifd, want) => { const n = g16(t + ifd); for (let i = 0; i < n; i++) { const e = t + ifd + 2 + i * 12; if (g16(e) === want) return e; } return null; };
                        const str = e => { const c = g32(e + 4), off = g32(e + 8); let s = ''; for (let i = 0; i < c - 1; i++) s += String.fromCharCode(buf.getUint8(t + off + i)); return s; };
                        const ifd0 = g32(t + 4); let dt = null;
                        const ex = rd(ifd0, 0x8769); if (ex) { const e2 = rd(g32(ex + 8), 0x9003); if (e2) dt = str(e2); }
                        if (!dt) { const e3 = rd(ifd0, 0x0132); if (e3) dt = str(e3); }
                        const m = dt && dt.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
                        if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).toISOString();
                        return null;
                    }
                    if ((mk & 0xFF00) !== 0xFF00) break; o += 2 + len;
                }
            } catch (e) {}
            return null;
        }
        function albResize(file, max) {
            return new Promise(res => {
                const u = URL.createObjectURL(file), im = new Image();
                im.onload = () => { let w = im.naturalWidth, h = im.naturalHeight; const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k); const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u); c.toBlob(b => res(b || file), 'image/jpeg', 0.84); };
                im.onerror = () => { URL.revokeObjectURL(u); res(file); };
                im.src = u;
            });
        }
        async function albFiles(input, cam) {
            const item = albUnit(), files = Array.from(input.files || []); input.value = ''; if (!item || !files.length) return;
            showToast('⏳ Rasm saqlanmoqda...');
            const l = albAll()[item.id] || []; let n = 0;
            for (const f of files) {
                const shot = cam ? new Date().toISOString() : (await exifTime(f)) || (f.lastModified ? new Date(f.lastModified).toISOString() : new Date().toISOString());
                const blob = await albResize(f, 1800), ref = uid('alb_');
                try { await mediaSave(ref, blob, { id: ref, at: new Date().toISOString(), size: blob.size, name: f.name || 'rasm.jpg', mime: 'image/jpeg', album: true }); mediaKeep(ref); } catch (e) { alert("⚠️ Rasm saqlanmadi: " + agmkErrUz(e)); continue; }
                l.push({ id: uid('a'), ref: ref, at: shot, saved: new Date().toISOString(), src: cam ? 'kamera' : (shot ? 'fayl' : ''), by: authorStr(), byT: meTabel(), note: '' }); n++;
            }
            albSaveList(item.id, l); albRender();
            if (n) { showToast('✅ ' + n + ' ta rasm albomga qoʻshildi'); const last = albOf(item.id)[0]; if (n === 1 && last) setTimeout(() => albNote(last.id), 350); }
        }
        async function albUrl(ref) { if (ALB.url[ref]) return ALB.url[ref]; const b = await mediaGetBlob(ref); if (!b) return ''; ALB.url[ref] = URL.createObjectURL(b); return ALB.url[ref]; }
        function albUnit() { return typeof activeVagonId !== 'undefined' ? vagonlarData.find(v => v.id === activeVagonId) || null : null; }
        function albBox() {
            let box = $id('alb-box'); if (box) return box;
            box = document.createElement('div'); box.id = 'alb-box'; box.className = 'passport-container alb-box';
            const g = $id('pasportGalTitle') && $id('pasportGalTitle').closest('.passport-container');
            if (g) g.parentNode.insertBefore(box, g); else $id('screen-vagon-pasport').appendChild(box);
            return box;
        }
        async function albRender() {
            const item = albUnit(), box = albBox();
            const show = !!item && item.kind !== 'infra';
            box.style.display = show ? '' : 'none'; if (!show) return;
            const l = albOf(item.id);
            box.innerHTML = `<div class="passport-title"><span>📸 Eslatma albomi — nosozlik, avariya, ish toʻxtashi</span></div>
                <div class="alb-act"><label class="alb-btn cam">📷 Holatni rasmga olish<input type="file" accept="image/*" capture="environment" onchange="albFiles(this, true)"></label><label class="alb-btn">🖼 Galereyadan<input type="file" accept="image/*" multiple onchange="albFiles(this, false)"></label></div>
                <div class="nd-tip">Har bir rasmga olingan kun va soat, kim kiritgani avtomatik yoziladi. Kerakli rasmlarni belgilab «Dalolatnoma tuzish»ni bosing — ular aktga ilova boʻladi.</div>
                ${l.length ? `<div class="alb-grid">${l.map(x => `<div class="alb-it${ALB.sel.has(x.id) ? ' sel' : ''}" data-id="${x.id}"><div class="alb-img" onclick="albView('${x.id}')"><img data-ref="${x.ref}" alt=""><b class="alb-chk" onclick="event.stopPropagation(); albToggle('${x.id}')">${ALB.sel.has(x.id) ? '✓' : ''}</b></div><div class="alb-m"><b>🕒 ${escapeHtml(fmtDT(x.at))}</b>${x.note ? `<span>${escapeHtml(x.note)}</span>` : `<span class="alb-nn" onclick="albNote('${x.id}')">✏️ izoh qoʻshish</span>`}<small>${escapeHtml(x.by || '')}${x.ai ? ' · 🤖 AI tahlili bor' : ''}</small></div></div>`).join('')}</div>
                <div class="alb-foot"><button class="action-btn" onclick="albAkt()">📄 Dalolatnoma tuzish${ALB.sel.size ? ' (' + ALB.sel.size + ' ta rasm)' : ''}</button></div>` : '<div class="xt-empty">Hali rasm yoʻq. Nosozlik boʻlsa darhol «📷 Holatni rasmga olish»ni bosing.</div>'}`;
            box.querySelectorAll('img[data-ref]').forEach(async im => { im.src = await albUrl(im.dataset.ref); });
        }
        function albToggle(id) { if (ALB.sel.has(id)) ALB.sel.delete(id); else ALB.sel.add(id); albRender(); }
        function albFind(id) { const item = albUnit(); const l = albAll()[item.id] || []; return { item: item, l: l, x: l.find(z => z.id === id) }; }
        async function albNote(id) {
            const r = albFind(id); if (!r.x) return;
            const t = await uiPrompt("📝 Rasmga qisqa izoh (masalan: «avtostsepka korpusida yoriq»):", r.x.note || ''); if (t === null) return;
            r.x.note = t.trim(); r.x.upd = new Date().toISOString(); albSaveList(r.item.id, r.l); albRender();
        }
        async function albView(id) {
            const r = albFind(id); if (!r.x) return; const src = await albUrl(r.x.ref);
            const canDel = isAdmin() || r.x.byT === meTabel();
            mdl('albModal', `<div class="px-h"><b>📸 ${escapeHtml(fmtDT(r.x.at))}</b><button class="mini-btn" onclick="mdlClose('albModal')">✕</button></div>
                <img src="${src}" class="alb-full" onclick="openImageViewerModal(['${src}'],['${escapeHtml(fmtDT(r.x.at))}'],0)">
                <div class="alb-meta">📅 Olingan: <b>${escapeHtml(fmtDT(r.x.at))}</b><br>💾 Kiritilgan: ${escapeHtml(fmtDT(r.x.saved))} · ${escapeHtml(r.x.by || '')}<br>📝 Izoh: ${escapeHtml(r.x.note || '—')}${r.x.ai ? '<br>🤖 AI: ' + escapeHtml(r.x.ai) : ''}</div>
                <div class="alb-btns"><button class="mini-btn" onclick="mdlClose('albModal'); albNote('${id}')">✏️ Izoh</button><button class="mini-btn" onclick="albAi('${id}')">🤖 AI tahlili</button>${canDel ? `<button class="mini-btn" onclick="albDel('${id}')">🗑 Oʻchirish</button>` : ''}</div>`);
        }
        async function albDel(id) { if (!await uiConfirm("Rasm albomdan oʻchirilsinmi?")) return; const r = albFind(id); albSaveList(r.item.id, r.l.filter(z => z.id !== id)); ALB.sel.delete(id); mdlClose('albModal'); albRender(); }
        // Rasmni AI tahlil qilishi (faqat internetli AI ulanganda; faqat rasm yuboriladi)
        async function albAi(id) {
            const r = albFind(id); if (!r.x) return;
            if (!(typeof aiCloudReady === 'function' && aiCloudReady())) { alert("🤖 Rasmni tahlil qilish uchun internetli AI kerak.\n\nParametrlar → AI sozlamalarida Claude yoki Gemini kalitini kiriting va yoqing. Unda faqat rasmning oʻzi yuboriladi (xodimlar maʼlumoti yuborilmaydi).\n\nInternetsiz: rasm ostiga «izoh» yozing yoki ayting — AI akt matnini oʻsha izohdan tuzadi."); return; }
            showToast('🤖 AI rasmni koʻryapti...');
            try {
                const b = await mediaGetBlob(r.x.ref), b64 = await blobB64(b);
                const t = await aiVision(b64, "Bu temir yoʻl harakat tarkibi (vagon, dumpkar yoki uning qismi) rasmi. Rasmda koʻrinayotgan texnik nosozlik yoki shikastlanishni oʻzbek tilida, rasmiy-texnik uslubda 1–3 qisqa gapda yoz: qaysi qism (masalan, avtostsepka, tormoz kolodkasi, gʻildirak, aravacha, rama), nosozlik turi (yoriq, sinish, deformatsiya, yeyilish, otkol) va joylashuvi. Faqat rasmda aniq koʻrinadigan narsani yoz, oʻylab topma. Aniq boʻlmasa «rasmdan aniq aniqlab boʻlmaydi» de.");
                r.x.ai = t; r.x.upd = new Date().toISOString(); if (!r.x.note) r.x.note = t.split('\n')[0].slice(0, 200); albSaveList(r.item.id, r.l); albView(id); albRender();
            } catch (e) { alert('⚠️ AI tahlil qilmadi: ' + agmkErrUz(e)); }
        }
        async function aiVision(b64, prompt) {
            const c = aicGet(); if (!c.key) throw new Error('API kalit kiritilmagan');
            if (c.prov === 'claude') {
                const r = await fetch(agmkNoNet('Tashqi AI'), { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': c.key.trim(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: aiModelOf(c), max_tokens: 400, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: prompt }] }] }) });
                const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
                return (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n').trim();
            }
            const r = await fetch(agmkNoNet('Tashqi AI') + encodeURIComponent(aiModelOf(c)) + ':generateContent?key=' + encodeURIComponent(c.key.trim()), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ inline_data: { mime_type: 'image/jpeg', data: b64 } }, { text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 400 } }) });
            const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(aiErrText(r.status, (j.error && j.error.message) || ''));
            const cand = (j.candidates || [])[0]; return ((cand && cand.content && cand.content.parts) || []).map(p => p.text || '').join('').trim();
        }
        // Tanlangan rasmlardan dalolatnoma
        function albAkt() {
            const item = albUnit(); if (!item) return;
            let l = albOf(item.id); if (ALB.sel.size) l = l.filter(x => ALB.sel.has(x.id));
            if (!l.length) { alert('Avval albomga rasm qoʻshing.'); return; }
            l = l.slice().sort((a, b) => String(a.at).localeCompare(String(b.at)));
            const no = typeof vagonNo === 'function' ? vagonNo(item) : (item.num || item.name);
            const first = l[0].at.slice(0, 10), dd = first.split('-');
            const lines = ['vagon ' + no, 'sana ' + dd[2] + '.' + dd[1] + '.' + dd[0]].concat(l.filter(x => x.note).map(x => x.note));
            ND.albumPhotos = l.map(x => ({ ref: x.ref, at: x.at, note: x.note || '' }));
            ND.albumUnit = no;
            showToast('⏳ Rasmlar aktga tayyorlanmoqda...');
            albAnnexHtml(ND.albumPhotos, no).then(h => {
                ND.albumHtml = h; ALB.pending = true;
                try { openND('akt'); } catch (e) {}
                setTimeout(() => { try { ALB.pending = true; ndWizStart(lines.join('\n'), false); } catch (e) { console.error(e); } }, 400);
                showToast('📄 ' + l.length + ' ta rasm dalolatnomaga ilova qilinadi');
            });
        }
        // Akt ga "Ilova: fotosuratlar" (PDF ichiga ham rasm bo'lib tushadi)
        async function albAnnexHtml(ph, unit) {
            let s = `<div class="alb-annex"><div class="a-title">ILOVA: FOTOSURATLAR${unit ? ' (№' + escapeHtml(unit) + ')' : ''}</div>`;
            for (let i = 0; i < ph.length; i++) {
                const b = await mediaGetBlob(ph[i].ref); if (!b) continue;
                let w = 1200, h = 900; try { const bm = await createImageBitmap(b); w = bm.width; h = bm.height; bm.close && bm.close(); } catch (e) {}
                const d = 'data:image/jpeg;base64,' + await blobB64(b);
                s += `<div class="alb-fig"><img src="${d}" data-w="${w}" data-h="${h}" alt=""><p class="ni">${i + 1}-rasm. Olingan vaqti: ${escapeHtml(fmtDT(ph[i].at))}${ph[i].note ? '. ' + escapeHtml(ph[i].note) : ''}</p></div>`;
            }
            return s + '</div>';
        }
        (function () {
            ndGenerate = agmkExtend('ndGenerate', 'ndGenerate', ndGenerate, og => function () {
                const r = og.apply(this, arguments);
                const add = () => { try { if (ND.albumHtml && ND.html && ND.html.indexOf('alb-annex') < 0) { ND.html += ND.albumHtml; ndRender(); } } catch (e) {} };
                if (r && typeof r.then === 'function') return r.then(v => { add(); return v; });
                add(); return r;
            });
            ndWizStart = agmkExtend('ndWizStart', 'ndWizStart', ndWizStart, ow => function () { if (!ALB.pending) { ND.albumHtml = null; ND.albumPhotos = null; } ALB.pending = false; return ow.apply(this, arguments); });
        })();
        (function () {
            openPassport = agmkExtend('openPassport', 'openPassport', openPassport, o => function (id) { const prev = typeof activeVagonId !== 'undefined' ? activeVagonId : null; const r = o.apply(this, arguments); if (prev !== id) ALB.sel = new Set(); try { albRender(); } catch (e) { console.error(e); } return r; });
        })();

