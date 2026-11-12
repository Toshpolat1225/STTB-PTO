        // =====================================================================
        // v2.0 — VIDEO VA ISTALGAN FAYL: nosozlik albomi va texnika galereyasiga
        // Fayllar qurilmaning o'zida (IndexedDB) saqlanadi; serverga/internetga yuborilmaydi.
        // =====================================================================
        var VF_KEY = 'agmk_vfiles';
        var VF_MAX = 400 * 1024 * 1024;
        function vfAll() { return kvGet(VF_KEY, {}); }
        function vfOf(vid) { return (vfAll()[vid] || []).slice().sort((a, b) => String(b.at).localeCompare(String(a.at))); }
        function vfSaveList(vid, l) { const a = vfAll(); a[vid] = l; kvSet(VF_KEY, a); }
        function vfSize(n) { n = +n || 0; return n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
        function vfIcon(x) { const m = String(x.mime || ''), n = String(x.name || '').toLowerCase(); return x.kind === 'video' || /^video\//.test(m) ? '🎥' : /pdf/.test(m) || /\.pdf$/.test(n) ? '📕' : /word|\.docx?$/.test(m + n) ? '📘' : /sheet|excel|\.xlsx?$/.test(m + n) ? '📗' : /^audio\//.test(m) ? '🎙' : /^image\//.test(m) ? '🖼' : /zip|rar|7z/.test(m + n) ? '🗜' : '📄'; }
        // Videodan kichik muqova rasmi (1-soniya)
        function vfThumb(blob) {
            return new Promise(res => {
                let done = false; const fin = v => { if (done) return; done = true; try { URL.revokeObjectURL(u); } catch (e) {} res(v); };
                const u = URL.createObjectURL(blob), v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.src = u;
                v.onloadeddata = () => { try { v.currentTime = Math.min(1, (v.duration || 2) / 3); } catch (e) { fin(null); } };
                v.onseeked = () => { try { const k = Math.min(1, 360 / Math.max(v.videoWidth, v.videoHeight, 1)), c = document.createElement('canvas'); c.width = Math.round(v.videoWidth * k) || 320; c.height = Math.round(v.videoHeight * k) || 180; c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); fin({ src: c.toDataURL('image/jpeg', 0.7), dur: Math.round(v.duration || 0), w: v.videoWidth, h: v.videoHeight }); } catch (e) { fin(null); } };
                v.onerror = () => fin(null); setTimeout(() => fin(null), 8000);
            });
        }
        async function vfStore(files, cam) {
            const out = [];
            for (const f of files) {
                if (f.size > VF_MAX) { alert('⚠️ «' + (f.name || 'fayl') + '» juda katta (' + vfSize(f.size) + '). Eng koʻpi ' + vfSize(VF_MAX) + '.'); continue; }
                const isV = /^video\//.test(f.type) || /\.(mp4|3gp|mov|mkv|webm)$/i.test(f.name || '');
                const ref = uid(isV ? 'vid_' : 'fil_');
                try { await mediaSave(ref, f, { id: ref, at: new Date().toISOString(), size: f.size, name: f.name || (isV ? 'video.mp4' : 'fayl'), mime: f.type || '', vfile: true }); mediaKeep(ref); }
                catch (e) { alert('⚠️ Saqlanmadi: ' + agmkErrUz(e) + '\nQurilma xotirasini tekshiring.'); continue; }
                const th = isV ? await vfThumb(f) : null;
                out.push({ id: uid('f'), ref: ref, kind: isV ? 'video' : 'file', name: f.name || (isV ? 'video.mp4' : 'fayl'), mime: f.type || '', size: f.size,
                    at: cam ? new Date().toISOString() : (f.lastModified ? new Date(f.lastModified).toISOString() : new Date().toISOString()), saved: new Date().toISOString(),
                    src: cam ? 'kamera' : 'fayl', by: authorStr(), byT: meTabel(), note: '', thumb: th ? th.src : '', dur: th ? th.dur : 0 });
            }
            return out;
        }
        async function vfOpenBlob(x) {
            const b = await mediaGetBlob(x.ref); if (!b) { alert('⚠️ Fayl qurilmada topilmadi.'); return null; } return b;
        }
        async function vfDownload(x) {
            const b = await vfOpenBlob(x); if (!b) return;
            const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = x.name || 'fayl'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
        }
        async function vfView(x, delJs) {
            const b = await vfOpenBlob(x); if (!b) return;
            const u = URL.createObjectURL(b), E = escapeHtml;
            const canDel = isAdmin() || x.byT === meTabel();
            const isV = x.kind === 'video', isImg = /^image\//.test(x.mime || ''), isPdf = /pdf/.test(x.mime || '') || /\.pdf$/i.test(x.name || '');
            mdl('vfModal', `<div class="px-h"><b>${vfIcon(x)} ${E(x.name || '')}</b><button class="mini-btn" onclick="mdlClose('vfModal')">✕</button></div>
                ${isV ? `<video class="vf-video" src="${u}" controls playsinline preload="metadata"></video>` : isImg ? `<img class="alb-full" src="${u}">` : `<div class="vf-big">${vfIcon(x)}<b>${E(x.name || '')}</b><small>${vfSize(x.size)}${isPdf ? ' · PDF' : ''}</small></div>`}
                <div class="alb-meta">📅 ${E(fmtDT(x.at))} · 💾 ${vfSize(x.size)}${x.dur ? ' · ⏱ ' + Math.floor(x.dur / 60) + ':' + String(x.dur % 60).padStart(2, '0') : ''}<br>👤 ${E(x.by || '')}<br>📝 Izoh: ${E(x.note || '—')}</div>
                <div class="alb-btns"><button class="mini-btn" onclick="vfDlId('${x.id}')">⬇️ ${isV ? 'Saqlash' : 'Ochish / saqlash'}</button><button class="mini-btn" onclick="vfNoteId('${x.id}')">✏️ Izoh</button>${canDel && delJs ? `<button class="mini-btn" onclick="${delJs}">🗑 Oʻchirish</button>` : ''}</div>`);
            const m = $id('vfModal'); if (m) { const obs = new MutationObserver(() => { if (m.classList.contains('hidden')) { const v = m.querySelector('video'); if (v) v.pause(); URL.revokeObjectURL(u); obs.disconnect(); } }); obs.observe(m, { attributes: true, attributeFilter: ['class'] }); }
        }
        // id bo'yicha topish (albom yoki galereya fayllari)
        function vfFind(id) {
            const item = typeof albUnit === 'function' ? albUnit() : null; if (!item) return null;
            let l = (albAll()[item.id] || []); let x = l.find(z => z.id === id); if (x) return { where: 'alb', item: item, l: l, x: x };
            l = (vfAll()[item.id] || []); x = l.find(z => z.id === id); if (x) return { where: 'vf', item: item, l: l, x: x };
            return null;
        }
        function vfDlId(id) { const r = vfFind(id); if (r) vfDownload(r.x); }
        async function vfNoteId(id) {
            const r = vfFind(id); if (!r) return;
            const t = await uiPrompt('📝 Qisqa izoh:', r.x.note || ''); if (t === null) return;
            r.x.note = t.trim(); r.x.upd = new Date().toISOString();
            if (r.where === 'alb') { albSaveList(r.item.id, r.l); albRender(); } else { vfSaveList(r.item.id, r.l); vfRender(); }
            mdlClose('vfModal');
        }

        // ---------- 1) Nosozlik albomi: video va fayl ----------
        async function albVf(input, cam) {
            const item = albUnit(), files = Array.from(input.files || []); input.value = ''; if (!item || !files.length) return;
            showToast('⏳ Saqlanmoqda...');
            const add = await vfStore(files, cam); if (!add.length) return;
            const l = albAll()[item.id] || []; add.forEach(x => l.push(x)); albSaveList(item.id, l); albRender();
            showToast('✅ ' + add.length + ' ta ' + (add[0].kind === 'video' ? 'video' : 'fayl') + ' albomga qoʻshildi');
            if (add.length === 1) setTimeout(() => vfNoteId(add[0].id), 350);
        }
        (function () {
            albRender = agmkExtend('albRender', 'albRender', albRender, oR => function () {
                const r = oR.apply(this, arguments);
                try {
                    const box = $id('alb-box'), item = albUnit(); if (!box || !item) return r;
                    const act = box.querySelector('.alb-act');
                    if (act && !act.querySelector('.vf-b')) act.insertAdjacentHTML('beforeend', `<label class="alb-btn vf-b">🎥 Video<input type="file" accept="video/*" capture="environment" onchange="albVf(this, true)"></label><label class="alb-btn vf-b">📎 Fayl<input type="file" multiple onchange="albVf(this, false)"></label>`);
                    const tip = box.querySelector('.nd-tip'); if (tip && !/video/.test(tip.textContent)) tip.textContent += ' Video va har qanday faylni ham qoʻshish mumkin — dalolatnomaga ilova roʻyxati sifatida kiradi.';
                    const l = albAll()[item.id] || [];
                    box.querySelectorAll('.alb-it').forEach(el => {
                        const x = l.find(z => z.id === el.dataset.id); if (!x || !x.kind) return;
                        const im = el.querySelector('.alb-img'); if (!im) return;
                        const chk = im.querySelector('.alb-chk'); const ch = chk ? chk.outerHTML : '';
                        im.setAttribute('onclick', "vfViewAlb('" + x.id + "')");
                        im.innerHTML = (x.thumb ? `<img src="${x.thumb}" alt="">` : `<div class="vf-ic">${vfIcon(x)}<small>${escapeHtml(String(x.name || '').slice(0, 26))}</small></div>`) + `<span class="vf-badge">${vfIcon(x)}${x.dur ? ' ' + Math.floor(x.dur / 60) + ':' + String(x.dur % 60).padStart(2, '0') : ''}</span>` + ch;
                    });
                } catch (e) { console.error(e); }
                return r;
            });
            albView = agmkExtend('albView', 'albView', albView, oV => function (id) { const r0 = vfFind(id); if (r0 && r0.x.kind) return vfViewAlb(id); return oV.apply(this, arguments); });
            albAi = agmkExtend('albAi', 'albAi', albAi, oA => function (id) { const r0 = vfFind(id); if (r0 && r0.x.kind) { alert('🤖 AI tahlili faqat rasmlar uchun.'); return; } return oA.apply(this, arguments); });
            // Akt ilovasi: rasmlar — rasm bo'lib, video va fayllar — ro'yxat bo'lib
            albAnnexHtml = agmkExtend('albAnnexHtml', 'Akt ilovasi: rasmlar — rasm boʼlib, video va fayllar — roʼyxat boʼlib', albAnnexHtml, oX => async function (ph, unit) {
                const all = albAll(); const kindOf = ref => { for (const k in all) { const x = (all[k] || []).find(z => z.ref === ref); if (x) return x; } return null; };
                const img = [], other = [];
                (ph || []).forEach(p => { const x = kindOf(p.ref); if (x && x.kind) other.push(x); else img.push(p); });
                let h = img.length ? await oX.call(this, img, unit) : '';
                if (other.length) {
                    const li = other.map((x, i) => `<p class="ni">${i + 1}) ${x.kind === 'video' ? 'Video' : 'Fayl'}: «${escapeHtml(x.name || '')}» — ${vfSize(x.size)}${x.dur ? ', ' + Math.floor(x.dur / 60) + ' daq ' + (x.dur % 60) + ' s' : ''}, ${escapeHtml(fmtDT(x.at))}${x.note ? '. ' + escapeHtml(x.note) : ''}</p>`).join('');
                    const blk = `<p class="a-sec">Ilova: video va fayllar roʻyxati${unit ? ' (№' + escapeHtml(unit) + ')' : ''} — elektron shaklda saqlanadi:</p>${li}`;
                    // ro'yxat asosiy matnga (imzolar ostiga) qo'shiladi, rasmlar ilovasi alohida varaqda qoladi
                    h = `<div class="vf-list">${blk}</div>` + h;
                }
                return h;
            });
        })();
        function vfViewAlb(id) { const r = vfFind(id); if (!r) return; vfView(r.x, `vfDelAlb('${id}')`); }
        async function vfDelAlb(id) { const r = vfFind(id); if (!r) return; if (!await uiConfirm('«' + (r.x.name || '') + '» oʻchirilsinmi?')) return; albSaveList(r.item.id, r.l.filter(z => z.id !== id)); ALB.sel.delete(id); mdlClose('vfModal'); albRender(); }
        // .vf-list bloki PDF/Word uchun oddiy matn bo'lib chiqishi uchun — bo'laklarga ajratiladi
        (function () {
            ndGenerate = agmkExtend('ndGenerate', '.vf-list bloki PDF/Word uchun oddiy matn boʼlib chiqishi uchun — boʼlaklarga ajr', ndGenerate, oG => function () {
                const r = oG.apply(this, arguments);
                const fix = () => { try { if (ND.html && ND.html.indexOf('vf-list') >= 0) { ND.html = ND.html.replace(/<div class="vf-list">([\s\S]*?)<\/div>/g, '$1'); ndRender(); } } catch (e) {} };
                if (r && typeof r.then === 'function') return r.then(v => { fix(); return v; }); fix(); return r;
            });
        })();

        // ---------- 2) Texnika galereyasi: «🎥 Video va fayllar» bo'limi ----------
        function vfBox() {
            let b = $id('vf-box'); if (b) return b;
            const g = $id('pasportGalTitle') && $id('pasportGalTitle').closest('.passport-container'); if (!g) return null;
            b = document.createElement('div'); b.id = 'vf-box'; b.className = 'passport-container vf-box'; g.parentNode.insertBefore(b, g.nextSibling); return b;
        }
        async function vfRender() {
            const item = typeof albUnit === 'function' ? albUnit() : null, box = vfBox(); if (!box) return;
            if (!item) { box.style.display = 'none'; return; } box.style.display = '';
            const l = vfOf(item.id), E = escapeHtml;
            box.innerHTML = `<div class="passport-title"><span>🎥 Video va fayllar</span></div>
                <div class="alb-act"><label class="alb-btn cam">🎥 Video olish<input type="file" accept="video/*" capture="environment" onchange="vfAdd(this, true)"></label><label class="alb-btn">📎 Fayl / hujjat / video<input type="file" multiple onchange="vfAdd(this, false)"></label></div>
                ${l.length ? `<div class="vf-list2">${l.map(x => `<div class="vf-row" onclick="vfViewG('${x.id}')">${x.thumb ? `<img src="${x.thumb}" alt="">` : `<i>${vfIcon(x)}</i>`}<div><b>${E(x.name || '')}</b><small>${vfIcon(x)} ${vfSize(x.size)}${x.dur ? ' · ' + Math.floor(x.dur / 60) + ':' + String(x.dur % 60).padStart(2, '0') : ''} · ${E(fmtDT(x.at))} · ${E(x.by || '')}</small>${x.note ? `<span>${E(x.note)}</span>` : ''}</div></div>`).join('')}</div>` : '<div class="xt-empty">Hali video yoki fayl yoʻq. PDF, Word, Excel, video, rasm — istalgan faylni yuklash mumkin.</div>'}
                <div class="nd-tip">🔒 Fayllar faqat shu qurilmada saqlanadi, internetga yuborilmaydi.</div>`;
        }
        async function vfAdd(input, cam) {
            const item = albUnit(), files = Array.from(input.files || []); input.value = ''; if (!item || !files.length) return;
            showToast('⏳ Saqlanmoqda...');
            const add = await vfStore(files, cam); if (!add.length) return;
            const l = vfAll()[item.id] || []; add.forEach(x => l.push(x)); vfSaveList(item.id, l); vfRender();
            showToast('✅ ' + add.length + ' ta fayl qoʻshildi');
        }
        function vfViewG(id) { const r = vfFind(id); if (!r) return; vfView(r.x, `vfDelG('${id}')`); }
        async function vfDelG(id) { const r = vfFind(id); if (!r) return; if (!await uiConfirm('«' + (r.x.name || '') + '» oʻchirilsinmi?')) return; vfSaveList(r.item.id, r.l.filter(z => z.id !== id)); mdlClose('vfModal'); vfRender(); }
        (function () {
            openPassport = agmkExtend('openPassport', 'openPassport', openPassport, o => function () { const r = o.apply(this, arguments); try { vfRender(); } catch (e) { console.error(e); } return r; });
        })();

