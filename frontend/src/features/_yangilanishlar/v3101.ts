        // =====================================================================
        // v3.10.0 (2-qism)
        //  10) «📤 Hujjat yuklash va imzoga yuborish» (Dalolatnoma va hisobotlar): PDF / Word / rasm → ilova familiyalarni
        //      oʻzi topadi va shtatdan aniqlaydi → siz tekshirasiz, toʻldirasiz, tartibni belgilaysiz → «✅ Tasdiqlayman, yuborish».
        //  11) Rasm → skaner (chetlarini toʻgʻrilash, qirqish, tiniqlashtirish) → server matnni oʻqiydi (OCR) → tekshirish va tuzatish
        //      → qaytadan terilgan toza PDF yoki Word → imzoga.
        // =====================================================================
        var UP = { st: 'home', file: '', title: '', kind: '', pages: [], html: '', rows: [], scans: [], ocr: null, busy: false, pdfText: '', lang: 'uzb+uzb_cyrl+rus+eng' };
        function upReset() { Object.assign(UP, { st: 'home', file: '', title: '', kind: '', pages: [], html: '', rows: [], scans: [], ocr: null, busy: false, pdfText: '' }); }
        // ---------------- Hisobotlar ekraniga yangi yorliq ----------------
        var UP_TABS = [['akt', '📄 Dalolatnomalar'], ['hisob', '📊 Hisobotlar'], ['haft', '📅 Haftalik achot'], ['up', '📤 Imzoga yuborish']];
        if (typeof hsRender === 'function') hsRender = agmkExtend('hsRender', 'v3.10: hujjat yuklash va imzoga yuborish', hsRender, o => function () {
            if (HS.tab === 'up') { secTabs('screen-hisob', UP_TABS, 'up', 'hsTab'); upRender(); return; }
            const r = o.apply(this, arguments); try { secTabs('screen-hisob', UP_TABS, HS.tab, 'hsTab'); } catch (e) {} return r;
        });
        function upBusy(t) { const b = secBody('screen-hisob'); if (b) b.innerHTML = `<div class="up-busy"><div class="up-spin"></div><b>${escapeHtml(t)}</b></div>`; }
        function upRender() {
            const b = secBody('screen-hisob'); if (!b) return; const E = escapeHtml;
            if (UP.st === 'home') {
                b.innerHTML = `<div class="hs-box"><div class="hs-h">📤 Hujjat yuklash va imzoga yuborish</div>
                    <div class="nd-tip">Ilovada shabloni yoʻq istalgan hujjat: yuklang — ilova familiyalarni oʻzi topib, shtatdan xodimlarni aniqlaydi. Siz tekshirib, kerak boʻlsa toʻldirib, tasdiqlaysiz.</div>
                    <label class="up-big"><span>📄</span><div><b>PDF yoki Word fayl</b><small>kompyuterda tayyorlangan hujjat</small></div><input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="display:none" onchange="upFile(this)"></label>
                    <label class="up-big"><span>📷</span><div><b>Rasmga olish (skaner)</b><small>qogʻozdagi hujjat → toza PDF / Word</small></div><input type="file" accept="image/*" capture="environment" style="display:none" onchange="upImgs(this)"></label>
                    <label class="up-big"><span>🖼</span><div><b>Rasmlardan (galereya)</b><small>bir yoki bir nechta sahifa</small></div><input type="file" accept="image/*" multiple style="display:none" onchange="upImgs(this)"></label></div>
                    <div class="hs-box"><div class="hs-h">📨 Men yuborgan hujjatlar</div><div id="upSent"><small style="color:#94a3b8">⏳</small></div></div>`;
                upSentLoad(); return;
            }
            if (UP.st === 'scan') { upScanRender(); return; }
            if (UP.st === 'ocr') { upOcrRender(); return; }
            if (UP.st === 'review') { upReviewRender(); return; }
        }
        async function upSentLoad() {
            const box = $id('upSent'); if (!box) return;
            if (!(typeof sigSrv === 'function' && sigSrv())) { box.innerHTML = '<small style="color:#94a3b8">📴 Server ulanmagan — yuborilgan hujjatlar server ulanganda koʻrinadi.</small>'; return; }
            let L = []; try { L = (await sigApi('/api/sign/v1/inbox')) || []; } catch (e) {}
            const me = sigMe(), E = escapeHtml; L = L.filter(d => d.created_by === me).slice(0, 30);
            box.innerHTML = L.length ? L.map(d => { const n = d.signers.length, s = d.signers.filter(x => x.state === 'sign').length, rj = d.signers.some(x => x.state === 'reject');
                return `<div class="hs-row" onclick="sigOpenDoc('${E(d.id)}')"><b>${E(d.title)}</b><small>${d.status === 'done' ? '✅ Hamma imzoladi' : d.status === 'cancelled' ? '✖ Bekor qilingan' : rj ? '❌ Rad etilgan' : '⏳ ' + s + ' / ' + n + ' imzoladi'} · ${E(fmtDT(d.created_at))}</small></div>`; }).join('') : '<small style="color:#94a3b8">Hali hujjat yuborilmagan.</small>';
        }
        // ---------------- 10) PDF va Word ----------------
        async function upFile(inp) {
            const f = (inp.files || [])[0]; inp.value = ''; if (!f) return; upReset(); UP.file = f.name; UP.title = f.name.replace(/\.(pdf|docx)$/i, '');
            try {
                if (/\.docx$/i.test(f.name)) { upBusy('📝 Word oʻqilmoqda…'); const t = await docToText(f); UP.kind = 'docx'; UP.html = upTextHtml(t); }
                else { upBusy('📄 PDF oʻqilmoqda…'); await upPdf(f); }
                if (UP.kind === 'scan') { UP.st = 'scan'; upRender(); return; }
                upFindSigners(); UP.st = 'review'; upRender();
            } catch (e) { console.error(e); alert('⚠️ Faylni oʻqib boʻlmadi: ' + agmkErrUz(e)); UP.st = 'home'; upRender(); }
        }
        function upTextHtml(t) { const E = escapeHtml; return String(t || '').split(/\n/).map(s => s.replace(/\s+$/, '')).filter((s, i, a) => s || (a[i - 1] && a[i - 1].trim())).map(s => s.trim() ? `<p>${E(s)}</p>` : '<p>&nbsp;</p>').join(''); }
        async function upPdf(f) {
            const lib = hsPdfLib(), pdf = await lib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise, N = Math.min(pdf.numPages, 30); let txt = 0;
            for (let i = 1; i <= N; i++) {
                upBusy('📄 Sahifa ' + i + ' / ' + N + '…'); const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: 1 }), sc = Math.min(2, 1400 / vp.width), v2 = pg.getViewport({ scale: sc });
                const c = document.createElement('canvas'); c.width = Math.round(v2.width); c.height = Math.round(v2.height); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
                await pg.render({ canvasContext: g, viewport: v2 }).promise;
                const tc = await pg.getTextContent(), items = [];
                tc.items.forEach(it => { const s = String(it.str || ''); if (!s.trim()) return; const t = it.transform, fs = Math.hypot(t[2], t[3]) || Math.abs(t[3]) || 10; items.push({ x: +t[4].toFixed(1), y: +(vp.height - t[5]).toFixed(1), fs: +fs.toFixed(1), s: s }); txt += s.length; });
                UP.pages.push({ w: vp.width, h: vp.height, img: c.toDataURL('image/jpeg', 0.72), items: items });
            }
            if (txt < 20) { // matnsiz (skanerlangan) PDF — rasm sifatida skanerga
                UP.kind = 'scan'; const P = UP.pages; UP.pages = []; for (let i = 0; i < P.length; i++) { upBusy('🖨 Skanerga tayyorlanmoqda: ' + (i + 1) + ' / ' + P.length); UP.scans.push(await upScanAdd(P[i].img, true)); } return;
            }
            UP.kind = 'pdf'; UP.html = upPdfHtml(); UP.pdfText = upPdfLines();
        }
        function upPdfHtml() {
            const E = escapeHtml;
            return `<div class="agmk-updoc" data-v="1">` + UP.pages.map(p => `<div class="up-pg" data-w="${p.w}" data-h="${p.h}" data-src="${p.img}">` + p.items.map(it => `<p data-x="${it.x}" data-y="${it.y}" data-fs="${it.fs}">${E(it.s)}</p>`).join('') + '</div>').join('') + '</div>';
        }
        // ---------------- Familiyalarni topish va shtatdan aniqlash ----------------
        function upSur(n) { const p = String(n || '').replace(/[.,]/g, ' ').trim().split(/\s+/).filter(w => w.length > 2); return p[0] || ''; }
        function upFindSigners() {
            let names = []; try { names = sigNamesFromHtml(UP.pdfText ? UP.pdfText : UP.html.replace(/data-src="[^"]*"/g, '')); } catch (e) {}
            const X = allXodims(), rows = [];
            names.forEach(n => {
                const k = sigKey(n.sur), L = X.filter(r => sigKey(upSur(r.item.name)) === k);
                const i1 = (typeof normTxt === 'function' ? normTxt(n.i1 || '') : String(n.i1 || '').toLowerCase()).charAt(0);
                let C = L; if (L.length > 1 && i1) { const f = L.filter(r => (typeof normTxt === 'function' ? normTxt(String(r.item.name).split(/\s+/)[1] || '') : '').charAt(0) === i1); if (f.length) C = f; }
                const i2 = n.i2 ? (typeof normTxt === 'function' ? normTxt(n.i2) : String(n.i2).toLowerCase()).charAt(0) : ''; // 3.16.2: ikkinchi bosh harf (otasining ismi) ham
                if (C.length > 1 && i2) { const f = C.filter(r => (typeof normTxt === 'function' ? normTxt(String(r.item.name).split(/\s+/)[2] || '') : '').charAt(0) === i2); if (f.length) C = f; }
                const one = C.length === 1 ? C[0].item : null;
                if (rows.some(r => one && r.tabel === cleanTabel(one.tabel))) return;
                rows.push({ label: n.label, tabel: one ? cleanTabel(one.tabel) : '', name: one ? one.name : '', lav: one ? one.lavozim || '' : '', alt: C.length > 1 ? C.map(r => ({ t: cleanTabel(r.item.tabel), n: r.item.name, l: r.item.lavozim || '', su: r.su })) : null, sign: !!n.sign, st: one ? 'ok' : C.length > 1 ? 'many' : 'none', on: !!one });
            });
            // imzo qatoridagilar oldin, keyin qolganlari; «TASDIQLAYMAN» egasi — oxirida
            rows.sort((a, b) => (b.sign ? 1 : 0) - (a.sign ? 1 : 0));
            UP.rows = rows;
        }
        function upReviewRender() {
            const b = secBody('screen-hisob'), E = escapeHtml, R = UP.rows, srv = typeof sigSrv === 'function' && sigSrv();
            const prev = UP.pages.length ? UP.pages.slice(0, 6).map((p, i) => `<img src="${p.img}" onclick="openImgFiles(UP.pages.map(x=>({src:x.img})),${i})">`).join('') : '';
            b.innerHTML = `<div class="hs-box"><div class="hs-h">📄 Hujjat</div>
                <div class="form-group"><label>Nomi</label><input id="upTitle" value="${E(UP.title)}" oninput="UP.title=this.value"></div>
                ${prev ? `<div class="up-prev">${prev}${UP.pages.length > 6 ? `<small>+${UP.pages.length - 6} sahifa</small>` : ''}</div>` : `<div class="up-doc">${UP.html}</div>`}
                <small style="color:#94a3b8">${UP.kind === 'pdf' ? '📄 PDF · ' + UP.pages.length + ' sahifa — koʻrinishi aynan saqlanadi' : UP.kind === 'imgpdf' ? '🖨 Skaner · ' + UP.pages.length + ' sahifa — rasm koʻrinishida (matnsiz). Imzolovchilarni qoʻlda qoʻshing; imzolar oxirgi betga qoʻyiladi.' : UP.kind === 'docx' ? '📝 Word — hujjat qaytadan teriladi' : '🖨 Skanerdan qaytadan terilgan hujjat (toza matn)'}</small>
                ${UP.kind !== 'pdf' ? `<div class="ms-b2" style="margin-top:6px"><button onclick="upExport('pdf')">📄 PDF yuklab olish</button>${UP.kind !== 'imgpdf' ? `<button onclick="upExport('docx')">📝 Word yuklab olish</button>` : ''}</div>` : ''}</div>
                <div class="hs-box"><div class="hs-h">✍️ Imzolovchilar (${R.filter(r => r.on && r.tabel).length})</div>
                <div class="nd-tip">Ilova hujjatdagi familiyalarni topdi va shtat roʻyxatidan aniqladi. <b>Tekshiring</b>: notoʻgʻrisini olib tashlang, ikki xil boʻlsa — toʻgʻrisini tanlang, yetishmaganini qoʻshing. Tartib — imzolash ketma-ketligi.</div>
                ${R.map((r, i) => `<div class="up-row ${r.st}${r.on ? '' : ' off'}"><input type="checkbox" ${r.on ? 'checked' : ''} ${r.tabel ? '' : 'disabled'} onchange="UP.rows[${i}].on=this.checked; upReviewRender()">
                    <div class="up-who">${r.tabel ? `<b>${E(r.name)}</b><small>${E(r.lav)} · ${E(r.tabel)}</small>` : r.st === 'many' ? `<b>⚠️ «${E(r.label)}» — ${r.alt.length} ta xodim</b><select onchange="upPickAlt(${i}, this.value)"><option value="">— qaysi biri? —</option>${r.alt.map(a => `<option value="${E(a.t)}">${E(a.n)} · ${E(a.l)} · ${E(a.su)}</option>`).join('')}</select>` : `<b>❓ «${E(r.label)}»</b><small>shtatda topilmadi (tashqi odam boʻlishi mumkin)</small>`}
                    ${r.label && r.tabel ? `<small class="up-lbl">hujjatda: ${E(r.label)}</small>` : ''}</div>
                    <span class="up-mv"><button onclick="upMove(${i},-1)">↑</button><button onclick="upMove(${i},1)">↓</button><button onclick="UP.rows.splice(${i},1); upReviewRender()">✕</button></span></div>`).join('') || '<div class="hs-ok">Hujjatda familiya topilmadi — xodimlarni qoʻlda qoʻshing.</div>'}
                <button class="action-btn sec" onclick="upAdd()">➕ Xodim qoʻshish</button></div>
                ${srv ? '' : '<div class="hp-warn">📴 Imzoga yuborish korxona serveri orqali ishlaydi — serverga ulaning.</div>'}
                <div class="pk-btns"><button onclick="upReset(); upRender()">Bekor</button><button class="pr" onclick="upSend()" ${srv ? '' : 'disabled'}>✅ Tasdiqlayman, imzoga yuborish</button></div>`;
        }
        function upPickAlt(i, t) { const r = UP.rows[i], a = r && r.alt && r.alt.find(x => x.t === t); if (!a) return; Object.assign(r, { tabel: a.t, name: a.n, lav: a.l, st: 'ok', on: true }); upReviewRender(); }
        function upMove(i, d) { const j = i + d; if (j < 0 || j >= UP.rows.length) return; const t = UP.rows[i]; UP.rows[i] = UP.rows[j]; UP.rows[j] = t; upReviewRender(); }
        async function upAdd() { const p = await pickPerson({ title: 'Imzolovchini qoʻshish', needRole: false }); if (!p) return; let t = cleanTabel(p.t || ''), it = t ? xodimByTabel(t) : null;
            if (!it) { const L = allXodims().filter(r => sigKey(upSur(r.item.name)) === sigKey(upSur(p.n))); if (L.length === 1) { it = L[0].item; t = cleanTabel(it.tabel); } }
            if (!it) { alert('Bu xodim shtat roʻyxatida topilmadi — tabel raqami yoki familiyasi bilan qidiring.'); return; }
            if (UP.rows.some(r => r.tabel === t)) { showToast('Bu xodim roʻyxatda bor'); return; }
            UP.rows.push({ label: '', tabel: t, name: it.name, lav: it.lavozim || '', st: 'ok', on: true, sign: true }); upReviewRender(); }
        async function upSend() {
            const S = UP.rows.filter(r => r.on && r.tabel).map(r => ({ tabel: r.tabel, label: r.label || sgShort(r.name) }));
            if (!S.length) { alert('Kamida bitta imzolovchini tanlang.'); return; }
            if (UP.rows.some(r => r.st === 'many' && !r.tabel)) { if (!(await uiConfirm('Ayrim qatorlarda xodim tanlanmagan — ular imzoga bormaydi. Davom etilsinmi?'))) return; }
            const title = (UP.title || 'Hujjat').trim().slice(0, 190); let html = UP.html;
            if (html.length > 14e6) { alert('⚠️ Hujjat juda katta (' + (html.length / 1048576).toFixed(1) + ' MB). Sahifalar sonini kamaytiring.'); return; }
            if (!(await uiConfirm('«' + title + '» ' + S.length + ' kishiga imzoga yuborilsinmi?\n\n' + S.map((x, i) => (i + 1) + '. ' + x.label).join('\n')))) return;
            try { upBusy('📤 Yuborilmoqda…'); const r = await sigApi('/api/sign/v1/docs', 'POST', { title: title, html: html, hash: await sigSha(html), signers: S });
                try { if (typeof audLog === 'function') audLog('imzo', 'Hujjat imzoga yuborildi: ' + title + ' → ' + S.length + ' kishi'); } catch (e) {}
                showToast('✍️ Imzoga yuborildi: ' + S.length + ' kishi'); upReset(); upRender(); sigPoll(true); sigOpenDoc(r.id);
            } catch (e) { alert('⚠️ Yuborilmadi: ' + agmkErrUz(e)); upReviewRender(); }
        }
        async function upExport(fmt) {
            const nm = (UP.title || 'Hujjat').replace(/[^\p{L}\d]+/gu, '_').slice(0, 60) || 'Hujjat';
            const box = document.createElement('div'); box.className = 'nd-page pdf-src'; box.style.cssText = 'position:absolute; left:-99999px; top:0; width:794px;'; box.innerHTML = UP.html; document.body.appendChild(box);
            try { let blob; if (fmt === 'docx') blob = docxFromEl(box); else if (UP.kind === 'imgpdf') { PDFK.f = null; const r = await dxFromSigHtml(UP.html); blob = pdfBuild(r.lay); } else { PDFK.f = null; blob = pdfBuild(pdfLayoutAkt(box)); }
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm + (fmt === 'docx' ? '.docx' : '.pdf'); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 30000);
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } finally { box.remove(); }
        }
        // ---------------- Imzolash: yuklangan PDF aynan koʻrinishda (sahifa rasmi + koʻrinmas matn — imzo familiya yoniga) ----------------
        if (typeof dxFromSigHtml === 'function') dxFromSigHtml = agmkExtend('dxFromSigHtml', 'v3.10: yuklangan PDF', dxFromSigHtml, o => async function (html) {
            if (!/class="agmk-updoc"/.test(String(html || ''))) return o.apply(this, arguments);
            const box = document.createElement('div'); box.innerHTML = html; const P = [...box.querySelectorAll('.up-pg')]; if (!P.length) return null;
            const W = +P[0].dataset.w || 595, H = +P[0].dataset.h || 842, pages = [];
            for (const pg of P) {
                const src = pg.dataset.src, im = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
                const ops = []; if (im) { const b = atob(src.split(',')[1]), a = new Uint8Array(b.length); for (let k = 0; k < b.length; k++) a[k] = b.charCodeAt(k); ops.push({ k: 'img', bg: 1, x: 0, y: 0, w: +pg.dataset.w || W, h: +pg.dataset.h || H, data: a, pw: im.naturalWidth, ph: im.naturalHeight, cv: im }); }
                pg.querySelectorAll('p').forEach(p => ops.push({ k: 't', x: +p.dataset.x, y: +p.dataset.y, s: p.textContent, st: 'Regular', fs: +p.dataset.fs || 10, inv: 1 }));
                pages.push(ops);
            }
            return { lay: { P: { W: W, H: H, L: 36, R: 36 }, pages: pages } };
        });
        // koʻrinmas matn (faqat joylashuv uchun) chizilmaydi
        if (typeof dxCanvas === 'function') { const _dc = dxCanvas; dxCanvas = function (lay, ops, S) { return _dc.call(this, lay, (ops || []).filter(o => !o.inv), S); }; }
        if (typeof pdfBuild === 'function') { const _pb = pdfBuild; pdfBuild = function (lay) { return _pb.call(this, Object.assign({}, lay, { pages: lay.pages.map(ops => ops.filter(o => !o.inv)) })); }; }
        // sahifa rasmi (fon) doim birinchi chiziladi — imzolar uning ustida koʻrinadi; matnsiz (skaner) hujjatda imzolar oxirgi betda
        if (typeof sigLayout === 'function') sigLayout = agmkExtend('sigLayout', 'v3.10: yuklangan PDF imzolari', sigLayout, o => async function (d) {
            const lay = await o.apply(this, arguments);
            try {
                if (!/class="agmk-updoc"/.test(String(d.html || ''))) return lay;
                lay.pages = lay.pages.map(ops => ops.filter(x => x.bg).concat(ops.filter(x => !x.bg)));
                if (!/<p data-x=/.test(d.html)) {
                    const S = d.signers.filter(x => x.state === 'sign' && x.png), imgs = await Promise.all(S.map(x => new Promise(r => sigJpeg(x.png, r))));
                    let last = lay.pages[lay.pages.length - 1], y = Math.max(60, ...last.map(z => z.k === 'img' ? z.y + z.h : z.k === 't' ? z.y : 0)) + 18; const L = lay.P.L;
                    S.forEach((x, i) => { const im = imgs[i]; if (!im) return; if (y > lay.P.H - 70) { lay.pages.push([]); last = lay.pages[lay.pages.length - 1]; y = 60; }
                        let h = 30, w = h * im.w / im.h; if (w > 120) { w = 120; h = w * im.h / im.w; }
                        last.push({ k: 't', x: L, y: y + h * 0.7, s: g47Safe((x.name || x.label) + ' (tabel ' + x.tabel + ')'), st: 'Regular', fs: 10 }, { k: 'img', x: L + 300, y: y, w: w, h: h, data: im.data, pw: im.w, ph: im.h, cv: im.el }); y += h + 12; });
                }
            } catch (e) { console.warn(e); }
            return lay;
        });
        // PDF matni qatorlarga yigʻiladi (familiya va bosh harflar alohida boʻlaklarda boʻlsa ham topilsin)
        function upPdfLines() {
            const E = escapeHtml; let h = '';
            UP.pages.forEach(p => { const L = []; p.items.slice().sort((a, b) => a.y - b.y || a.x - b.x).forEach(it => { const l = L.find(z => Math.abs(z.y - it.y) < Math.max(2, it.fs * 0.4)); if (l) l.a.push(it); else L.push({ y: it.y, a: [it] }); });
                L.forEach(l => { h += '<p>' + E(l.a.sort((a, b) => a.x - b.x).map(z => z.s).join(' ').replace(/\s+/g, ' ')) + '</p>'; }); });
            return h;
        }

        // =====================================================================
        // 11) SKANER: rasm → chetlarini topish → toʻgʻrilash (perspektiva) → tiniqlashtirish
        // =====================================================================
        function upLoadImg(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('Rasmni ochib boʻlmadi (JPEG yoki PNG boʻlsin)')); im.src = src; }); }
        function upFileUrl(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }
        async function upScanAdd(src, flat) {
            const im = await upLoadImg(src), M = 2400, k = Math.min(1, M / Math.max(im.naturalWidth, im.naturalHeight));
            const cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
            const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(im, 0, 0, cv.width, cv.height);
            const s = { cv: cv, w: cv.width, h: cv.height, mode: 'bw', out: null };
            s.q = flat ? upFull(s) : upDetect(cv); s.src = cv.toDataURL('image/jpeg', 0.85); return s;
        }
        function upFull(s) { return [[0, 0], [s.w, 0], [s.w, s.h], [0, s.h]]; }
        // Hujjat chegarasi: kichraytirilgan rasmda Otsu boʻsagʻasi → eng katta yorugʻ maydon → 4 burchak (x+y va x−y chekkalari)
        function upDetect(cv) {
            const W0 = cv.width, H0 = cv.height, k = 320 / Math.max(W0, H0), w = Math.max(8, Math.round(W0 * k)), h = Math.max(8, Math.round(H0 * k));
            const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(cv, 0, 0, w, h);
            const d = g.getImageData(0, 0, w, h).data, N = w * h, L = new Uint8Array(N), hist = new Array(256).fill(0);
            for (let i = 0; i < N; i++) { const v = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) | 0; L[i] = v; hist[v]++; }
            let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i]; let sB = 0, wB = 0, best = 0, thr = 128;
            for (let t = 0; t < 256; t++) { wB += hist[t]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += t * hist[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; thr = t; } }
            const lab = new Int32Array(N).fill(-1), st = new Int32Array(N); let bestN = 0, bestId = -1, id = 0;
            for (let i = 0; i < N; i++) { if (L[i] <= thr || lab[i] >= 0) continue; let n = 0, sp = 0; st[sp++] = i; lab[i] = id;
                while (sp) { const p = st[--sp]; n++; const x = p % w, y = (p / w) | 0; const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]; for (const q of nb) if (q >= 0 && lab[q] < 0 && L[q] > thr) { lab[q] = id; st[sp++] = q; } }
                if (n > bestN) { bestN = n; bestId = id; } id++; }
            const full = [[0, 0], [W0, 0], [W0, H0], [0, H0]], r = bestN / N; if (r < 0.12 || r > 0.97) return full;
            let tl = [0, 0, 1e9], tr = [0, 0, -1e9], br = [0, 0, -1e9], bl = [0, 0, 1e9];
            for (let i = 0; i < N; i++) { if (lab[i] !== bestId) continue; const x = i % w, y = (i / w) | 0;
                if (x + y < tl[2]) tl = [x, y, x + y]; if (x + y > br[2]) br = [x, y, x + y]; if (x - y > tr[2]) tr = [x, y, x - y]; if (x - y < bl[2]) bl = [x, y, x - y]; }
            const q = [tl, tr, br, bl].map(p => [Math.min(W0, Math.max(0, (p[0] + 0.5) / k)), Math.min(H0, Math.max(0, (p[1] + 0.5) / k))]);
            return upQuadArea(q) / (W0 * H0) < 0.1 ? full : q;
        }
        function upQuadArea(q) { let a = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4]; a += p[0] * n[1] - n[0] * p[1]; } return Math.abs(a) / 2; }
        // 4 nuqta → 4 nuqta gomografiyasi (chiqish (u,v) → manba (x,y))
        function upHomo(dst, src) {
            const A = [], b = [];
            for (let i = 0; i < 4; i++) { const [u, v] = dst[i], [x, y] = src[i]; A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]); b.push(x); A.push([0, 0, 0, u, v, 1, -u * y, -v * y]); b.push(y); }
            for (let c = 0; c < 8; c++) { let m = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]]; [b[c], b[m]] = [b[m], b[c]];
                const p = A[c][c] || 1e-12; for (let r = 0; r < 8; r++) { if (r === c) continue; const f = A[r][c] / p; if (!f) continue; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; } }
            return b.map((x, i) => x / (A[i][i] || 1e-12)).concat([1]);
        }
        function upWarp(s) {
            const q = s.q, dd = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), qw = (dd(q[0], q[1]) + dd(q[3], q[2])) / 2, qh = (dd(q[0], q[3]) + dd(q[1], q[2])) / 2;
            const ow = 1654, oh = Math.max(200, Math.min(4000, Math.round(ow * qh / Math.max(1, qw))));
            const H = upHomo([[0, 0], [ow, 0], [ow, oh], [0, oh]], q), sd = s.cv.getContext('2d').getImageData(0, 0, s.w, s.h).data, SW = s.w, SH = s.h;
            const oc = document.createElement('canvas'); oc.width = ow; oc.height = oh; const og = oc.getContext('2d'), od = og.createImageData(ow, oh), o = od.data;
            for (let v = 0; v < oh; v++) for (let u = 0; u < ow; u++) {
                const z = H[6] * u + H[7] * v + 1, x = (H[0] * u + H[1] * v + H[2]) / z, y = (H[3] * u + H[4] * v + H[5]) / z, oi = (v * ow + u) * 4;
                const x0 = Math.max(0, Math.min(SW - 2, x | 0)), y0 = Math.max(0, Math.min(SH - 2, y | 0)), fx = Math.max(0, Math.min(1, x - x0)), fy = Math.max(0, Math.min(1, y - y0));
                const i00 = (y0 * SW + x0) * 4, i10 = i00 + 4, i01 = i00 + SW * 4, i11 = i01 + 4;
                for (let c = 0; c < 3; c++) o[oi + c] = (sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx) * (1 - fy) + (sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx) * fy;
                o[oi + 3] = 255;
            }
            upEnhance(od, s.mode); og.putImageData(od, 0, 0); return oc;
        }
        // Tiniqlashtirish: qogʻoz fonini (soya, sargʻish rang) tekislash → fon oq, matn qora
        function upEnhance(img, mode) {
            const W = img.width, H = img.height, d = img.data, B = 40, gw = Math.ceil(W / B), gh = Math.ceil(H / B), G = new Float32Array(gw * gh);
            for (let by = 0; by < gh; by++) for (let bx = 0; bx < gw; bx++) { const hs = new Uint32Array(64); let n = 0;
                for (let y = by * B; y < Math.min(H, by * B + B); y += 2) for (let x = bx * B; x < Math.min(W, bx * B + B); x += 2) { const i = (y * W + x) * 4; hs[((d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0) >> 2]++; n++; }
                let acc = 0, t = 63; for (; t > 0; t--) { acc += hs[t]; if (acc >= n * 0.1) break; } G[by * gw + bx] = t * 4 + 2; } // blokdagi eng yorugʻ 10% — qogʻoz foni
            const G2 = new Float32Array(gw * gh); for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { let m = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) m = Math.max(m, G[yy * gw + xx]); } G2[y * gw + x] = Math.max(40, m); }
            for (let y = 0; y < H; y++) { const gy = Math.max(0, Math.min(gh - 1.001, y / B - 0.5)), y0 = gy | 0, fy = gy - y0;
                for (let x = 0; x < W; x++) { const gx = Math.max(0, Math.min(gw - 1.001, x / B - 0.5)), x0 = gx | 0, fx = gx - x0, y1 = Math.min(gh - 1, y0 + 1), x1 = Math.min(gw - 1, x0 + 1);
                    const bg = (G2[y0 * gw + x0] * (1 - fx) + G2[y0 * gw + x1] * fx) * (1 - fy) + (G2[y1 * gw + x0] * (1 - fx) + G2[y1 * gw + x1] * fx) * fy, i = (y * W + x) * 4;
                    if (mode === 'bw') { const l = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) * 255 / bg; let v = (l - 75) * 255 / 150; v = v < 0 ? 0 : v > 255 ? 255 : v; d[i] = d[i + 1] = d[i + 2] = v; }
                    else for (let c = 0; c < 3; c++) { let v = (d[i + c] * 255 / bg - 30) * 255 / 215; d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v; } } }
        }
        async function upImgs(inp) {
            const F = [...(inp.files || [])].slice(0, 20), add = inp.dataset.add === '1' && UP.st === 'scan'; inp.value = ''; if (!F.length) return;
            if (!add) { upReset(); UP.kind = 'img'; UP.title = 'Skaner hujjat ' + (typeof todayISO === 'function' ? todayISO() : ''); }
            try { for (let i = 0; i < F.length; i++) { upBusy('🖨 Rasm ' + (i + 1) + ' / ' + F.length + ' — hujjat chegarasi aniqlanmoqda…'); UP.scans.push(await upScanAdd(await upFileUrl(F[i]))); } }
            catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
            UP.st = UP.scans.length ? 'scan' : 'home'; upRender();
        }
        var UP_LANGS = [['uzb+uzb_cyrl+rus+eng', 'Aralash (oʻzb. lotin, kirill, rus)'], ['uzb', 'Oʻzbek (lotin)'], ['uzb_cyrl', 'Ўзбек (кирилл)'], ['rus', 'Русский'], ['eng', 'English']];
        function upScanRender() {
            const b = secBody('screen-hisob'), E = escapeHtml, S = UP.scans;
            b.innerHTML = `<div class="hs-box"><div class="hs-h">🖨 Skaner — ${S.length} sahifa</div>
                <div class="nd-tip">Koʻk burchaklarni hujjat chetlariga suring (ilova oʻzi topishga harakat qildi). Qiyshiq rasm toʻgʻrilanadi, soya va xiralik tozalanadi.</div>
                ${S.map((s, i) => `<div class="up-sc"><div class="up-sc-h"><b>${i + 1}-sahifa</b><span><button onclick="upRot(${i})">↻</button><button onclick="upScanFull(${i})">⬜ Butun rasm</button><button onclick="upScanMode(${i})">${s.mode === 'bw' ? '⚫ Oq-qora' : '🎨 Rangli'}</button><button onclick="upScanMv(${i},-1)">↑</button><button onclick="UP.scans.splice(${i},1); UP.scans.length ? upScanRender() : (upReset(), upRender())">🗑</button></span></div>
                    <div class="up-sc-ed" id="upEd${i}"><img src="${s.src}"><svg viewBox="0 0 ${s.w} ${s.h}" preserveAspectRatio="none"><polygon points="${s.q.map(p => p.join(',')).join(' ')}"/>${s.q.map((p, k) => `<circle data-k="${k}" cx="${p[0]}" cy="${p[1]}" r="${Math.max(s.w, s.h) * 0.028}"/>`).join('')}</svg></div>
                    ${s.out ? `<div class="up-sc-res"><small>Natija:</small><img src="${s.out}" onclick="openImgFiles([{src:UP.scans[${i}].out}],0)"></div>` : ''}</div>`).join('')}
                <label class="action-btn sec" style="display:block;text-align:center">➕ Yana sahifa qoʻshish<input type="file" accept="image/*" multiple data-add="1" style="display:none" onchange="upImgs(this)"></label></div>
                <div class="hs-box"><div class="hs-h">🔤 Matnni oʻqish</div><div class="form-group"><label>Hujjat tili</label><select onchange="UP.lang=this.value">${UP_LANGS.map(l => `<option value="${l[0]}"${UP.lang === l[0] ? ' selected' : ''}>${E(l[1])}</option>`).join('')}</select></div>
                <div class="nd-tip">Server rasmni matnga aylantiradi, siz rasm bilan solishtirib tuzatasiz — natija qaytadan terilgan <b>toza PDF yoki Word</b> boʻladi (oddiy rasm rasmiy hujjat emas).</div></div>
                <div class="pk-btns"><button onclick="upReset(); upRender()">Bekor</button><button class="pr" onclick="upScanGo()">🔤 Skanerlash va matnni oʻqish</button></div>
                <button class="action-btn sec" onclick="upScanImgPdf()">📄 Matnsiz, rasm koʻrinishida PDF (OCR siz)</button>`;
            S.forEach((s, i) => upEdBind(i));
        }
        function upEdBind(i) {
            const box = $id('upEd' + i), svg = box && box.querySelector('svg'), s = UP.scans[i]; if (!svg) return; let k = -1;
            const pt = e => { const r = svg.getBoundingClientRect(); return [Math.max(0, Math.min(s.w, (e.clientX - r.left) * s.w / r.width)), Math.max(0, Math.min(s.h, (e.clientY - r.top) * s.h / r.height))]; };
            svg.addEventListener('pointerdown', e => { const p = pt(e); let bd = 1e18; s.q.forEach((q, j) => { const dd = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2; if (dd < bd) { bd = dd; k = j; } }); if (bd > (Math.max(s.w, s.h) * 0.12) ** 2) { k = -1; return; } try { svg.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
            svg.addEventListener('pointermove', e => { if (k < 0) return; s.q[k] = pt(e); s.out = null; svg.querySelector('polygon').setAttribute('points', s.q.map(p => p.join(',')).join(' ')); const c = svg.querySelectorAll('circle')[k]; c.setAttribute('cx', s.q[k][0]); c.setAttribute('cy', s.q[k][1]); e.preventDefault(); });
            const up = () => { k = -1; }; svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
        }
        function upRot(i) { const s = UP.scans[i], c = document.createElement('canvas'); c.width = s.h; c.height = s.w; const g = c.getContext('2d'); g.translate(s.h, 0); g.rotate(Math.PI / 2); g.drawImage(s.cv, 0, 0);
            const q = s.q.map(p => [s.h - p[1], p[0]]); Object.assign(s, { cv: c, w: c.width, h: c.height, src: c.toDataURL('image/jpeg', 0.85), out: null, q: [q[3], q[0], q[1], q[2]] }); upScanRender(); }
        function upScanFull(i) { const s = UP.scans[i]; s.q = upFull(s); s.out = null; upScanRender(); }
        function upScanMode(i) { const s = UP.scans[i]; s.mode = s.mode === 'bw' ? 'color' : 'bw'; s.out = null; upScanRender(); }
        function upScanMv(i, d) { const j = i + d; if (j < 0 || j >= UP.scans.length) return; const t = UP.scans[i]; UP.scans[i] = UP.scans[j]; UP.scans[j] = t; upScanRender(); }
        async function upScanProc() {
            for (let i = 0; i < UP.scans.length; i++) { const s = UP.scans[i]; if (s.out) continue; upBusy('🖨 Skanerlanmoqda: ' + (i + 1) + ' / ' + UP.scans.length + ' (toʻgʻrilash, tozalash)…'); await new Promise(r => setTimeout(r, 30));
                const c = upWarp(s); s.ow = c.width; s.oh = c.height; s.out = c.toDataURL('image/jpeg', 0.85); }
        }
        function upB64Blob(u) { const b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], { type: 'image/jpeg' }); }
        async function upOcrOk() { if (!(typeof sigSrv === 'function' && sigSrv())) return 'Server ulanmagan'; try { const r = await sbFetch('/api/ocr/v1', { method: 'GET' }); return r && r.ok ? '' : 'Serverda matn oʻqish dasturi (Tesseract-OCR) oʻrnatilmagan'; } catch (e) { return 'Server javob bermadi: ' + agmkErrUz(e); } }
        async function upScanGo() {
            try { await upScanProc(); } catch (e) { alert('⚠️ Skanerlashda xato: ' + agmkErrUz(e)); upScanRender(); return; }
            const why = await upOcrOk();
            if (why) { if (await uiConfirm('🔤 Matnni oʻqib boʻlmaydi: ' + why + '.\n\nHozircha hujjatni rasm koʻrinishidagi PDF qilib (matnsiz) imzoga yuborasizmi? Imzolovchilarni qoʻlda tanlaysiz.')) upScanImgPdf(); else upScanRender(); return; }
            const R = [];
            try { for (let i = 0; i < UP.scans.length; i++) { upBusy('🔤 Matn oʻqilmoqda: ' + (i + 1) + ' / ' + UP.scans.length + ' (har bir sahifa 10–40 soniya)…');
                    const r = await window.srvRaw('/api/ocr/v1?l=' + encodeURIComponent(UP.lang), { method: 'POST', body: upB64Blob(UP.scans[i].out), headers: { 'Content-Type': 'image/jpeg' } }); R.push(await r.json()); } }
            catch (e) { alert('⚠️ Matnni oʻqib boʻlmadi: ' + agmkErrUz(e)); upScanRender(); return; }
            UP.ocr = R; UP.ocrHtml = R.map((p, i) => upOcrHtml(p, true)).join('<p class="ni up-pb">&nbsp;</p>');
            const t = /<p class="a-title">([^<]{3,120})<\/p>/.exec(UP.ocrHtml.replace(/<\/?mark[^>]*>/g, '')); if (t && /^Skaner hujjat/.test(UP.title)) UP.title = t[1].replace(/&[a-z]+;/g, ' ').trim();
            UP.st = 'ocr'; upRender();
        }
        async function upScanImgPdf() {
            try { await upScanProc(); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            const pw = 595.28; UP.kind = 'imgpdf';
            UP.html = `<div class="agmk-updoc" data-v="1">` + UP.scans.map(s => `<div class="up-pg" data-w="${pw}" data-h="${(pw * s.oh / s.ow).toFixed(2)}" data-src="${s.out}"></div>`).join('') + '</div>';
            UP.pages = UP.scans.map(s => ({ w: pw, h: pw * s.oh / s.ow, img: s.out, items: [] })); UP.rows = []; UP.st = 'review'; upRender();
        }
        // OCR natijasi → qaytadan terilgan hujjat (sarlavha markazda, imzo qatorlari jadvalda, xatboshi saqlanadi)
        function upOcrHtml(p, marks, S = null) { // 3.18.1: S — butun sahifa oʻlchamlari (sahifa rasm/chizma bilan boʻlaklarga boʻlinganda)
            const E = escapeHtml, Ls = (p.lines || []).filter(l => l.words && l.words.length).sort((a, b) => a.y - b.y || a.x - b.x); if (!Ls.length) return '';
            const hs = Ls.map(l => l.h).sort((a, b) => a - b), xs = Ls.map(l => l.x).sort((a, b) => a - b), xe = Ls.map(l => l.x + l.w).sort((a, b) => a - b);
            const h = S ? S.h : hs[hs.length >> 1] || 20, left = S ? S.left : xs[Math.floor(xs.length * 0.1)], right = S ? S.right : xe[Math.floor(xe.length * 0.9)], tw = Math.max(1, right - left), mid = (left + right) / 2;
            const wd = w => marks && w.c < 70 ? `<mark class="up-lc">${E(w.s)}</mark>` : E(w.s), txt = ws => ws.map(wd).join(' ');
            const out = []; let para = null, tab = null;
            const flush = () => { if (para) { out.push(`<p${para.ni ? ' class="ni"' : ''}>${para.t}</p>`); para = null; } if (tab) { const n = Math.max(...tab.map(r => r.length)); out.push('<table class="nb">' + tab.map(r => '<tr>' + r.map((c, i) => `<td${i === r.length - 1 && r.length < n ? ` colspan="${n - r.length + 1}"` : ''}>${c}</td>`).join('') + '</tr>').join('') + '</table>'); tab = null; } };
            let prev = null;
            Ls.forEach(l => {
                const W = l.words.slice().sort((a, b) => a.x - b.x), seg = [[W[0]]];
                for (let i = 1; i < W.length; i++) { const g = W[i].x - (W[i - 1].x + W[i - 1].w); if (g > Math.max(tw * 0.06, h * 3)) seg.push([W[i]]); else seg[seg.length - 1].push(W[i]); }
                const plain = W.map(w => w.s).join(' '), cx = l.x + l.w / 2, gap = prev ? l.y - (prev.y + prev.h) : 0;
                if (seg.length > 1) { if (para) { const t = tab; tab = null; flush(); tab = t; } (tab || (tab = [])).push(seg.map(txt)); prev = l; return; }
                if (tab) { const t = para; para = null; flush(); para = t; }
                const isC = Math.abs(cx - mid) < tw * 0.06 && l.w < tw * 0.8 && l.x > left + tw * 0.08, isR = !isC && l.x > left + tw * 0.45;
                if (isC || isR) { flush(); const up = (plain.match(/[A-ZА-ЯЁЎҚҒҲ]/g) || []).length, lo = (plain.match(/[a-zа-яёўқғҳ]/g) || []).length;
                    out.push(isC && up > lo * 2 && up >= 3 ? `<p class="a-title">${txt(W)}</p>` : `<p style="text-align:${isC ? 'center' : 'right'}">${txt(W)}</p>`); prev = l; return; }
                // 3.18.1 (K-21): gap qatorga sigʻmay keyingi qatorga oʻtgan boʻlsa — bitta xatboshi (kichik harf bilan boshlansa
                // yoki oldingi qator gap tugamagan holda raqam bilan davom etsa), OCR uni boshqa blok deb bersa ham
                const ind = l.x > left + h * 1.2, prevEnd = para ? String(para.t).replace(/<[^>]+>/g, '').trim() : '';
                const sem = !!para && !!prev && gap < h * 2 && (/^[a-zа-яёўқғҳ]/.test(plain) || (/^\d/.test(plain) && !/[.!?:;]$/.test(prevEnd)));
                const cont = para && ((!ind && gap < h * 0.9 && prev && prev.b === l.b && prev.p === l.p) || sem);
                if (cont) { para.t = /-$/.test(para.t) && /^[a-zа-яёўқғҳ]/.test(plain) ? para.t.replace(/-$/, '') + txt(W) : para.t + ' ' + txt(W); }
                else { flush(); para = { t: txt(W), ni: !ind }; }
                prev = l;
            });
            flush(); return out.join('');
        }
        function upOcrRender() {
            const b = secBody('screen-hisob'), n = (UP.ocrHtml.match(/<mark/g) || []).length;
            b.innerHTML = `<div class="hs-box"><div class="hs-h">🔍 Tekshirish va tuzatish</div>
                <div class="nd-tip">Skanerlangan rasm va qaytadan terilgan matn yonma-yon (telefonda — avval rasm, ostida matn). <mark class="up-lc">Sariq</mark> soʻzlarni ilova ishonchsiz oʻqidi (${n} ta) — rasm bilan solishtirib, toʻgʻrilang. Matnni bosib istalgan joyini tahrirlash mumkin.</div>
                <div class="up-ocr"><div class="up-ocr-img">${UP.scans.map((s, i) => `<img src="${s.out}" onclick="openImgFiles(UP.scans.map(x=>({src:x.out})),${i})">`).join('')}</div>
                <div class="up-ocr-txt" id="upOcrEd" contenteditable="true" spellcheck="false">${UP.ocrHtml}</div></div></div>
                <div class="pk-btns"><button onclick="UP.st='scan'; upRender()">‹ Skanerga</button><button class="pr" onclick="upOcrDone()">✅ Matn toʻgʻri — davom etish</button></div>`;
            const ed = $id('upOcrEd'); ed.addEventListener('input', () => { UP.ocrHtml = ed.innerHTML; });
            ed.addEventListener('click', e => { const m = e.target.closest && e.target.closest('mark.up-lc'); if (m) m.classList.add('seen'); });
        }
        function upClean(html) { // tahrirdan keyin: belgilar olib tashlanadi, faqat hujjat teglari qoladi
            const box = document.createElement('div'); box.innerHTML = html;
            box.querySelectorAll('mark,span,font,b,i,u,strong,em').forEach(m => { if (/^(B|STRONG)$/.test(m.tagName)) return; m.replaceWith(...m.childNodes); });
            box.querySelectorAll('div').forEach(d => { const p = document.createElement('p'); p.innerHTML = d.innerHTML; d.replaceWith(p); });
            box.querySelectorAll('*').forEach(el => { const al = el.style && el.style.textAlign; [...el.attributes].forEach(a => { if (!['class', 'colspan'].includes(a.name)) el.removeAttribute(a.name); }); if (al) el.style.textAlign = al;
                if (el.hasAttribute('class')) { const c = [...el.classList].filter(x => ['a-title', 'ni', 'nb'].includes(x)); if (c.length) el.className = c.join(' '); else el.removeAttribute('class'); } });
            box.querySelectorAll('p').forEach(p => { if (!p.textContent.trim() && !p.querySelector('br')) p.innerHTML = '&nbsp;'; });
            return box.innerHTML.replace(/<p class="ni">&nbsp;<\/p>(\s*<p class="ni">&nbsp;<\/p>)+/g, '<p class="ni">&nbsp;</p>');
        }
        function upOcrDone() { const ed = $id('upOcrEd'); if (ed) UP.ocrHtml = ed.innerHTML; UP.html = upClean(UP.ocrHtml); if (!UP.html.replace(/<[^>]+>|&nbsp;/g, '').trim()) { alert('Matn boʻsh.'); return; } UP.kind = 'ocr'; upFindSigners(); UP.st = 'review'; upRender(); }

        // ---------------- AI: yangi boʻlim boʻyicha bilim ----------------
        if (typeof AI_FAQ !== 'undefined') AI_FAQ.unshift(
            { s: 1, re: /skaner|rasm\w* (pdf|word|matn)|hujjat\w* rasm\w*|rasmdan (pdf|word|matn)|ocr|matnga (aylantir|o.gir)/, a: () => '🖨 Qogʻozdagi hujjatni skanerlash: «📊 Dalolatnoma va hisobotlar» → «📤 Imzoga yuborish» → «📷 Rasmga olish» yoki «🖼 Rasmlardan». Ilova hujjat chetlarini topadi (koʻk burchaklarni surib toʻgʻrilash mumkin), qiyshiqlikni toʻgʻrilaydi, soya va xiralikni tozalaydi. Soʻng server matnni oʻqiydi: chapda rasm, oʻngda matn — sariq soʻzlarni tekshirib tuzatasiz. Natija — qaytadan terilgan toza PDF yoki Word; xohlasangiz shu yerdan imzoga yuborasiz (familiyalarni ilova oʻzi topadi).' });

        // ---------------- Koʻrinish ----------------
        (function () { const st = document.createElement('style'); st.textContent = `
            .up-busy{display:flex;flex-direction:column;align-items:center;gap:14px;padding:50px 16px;color:#cbd5e1;text-align:center}.up-spin{width:42px;height:42px;border-radius:50%;border:4px solid #334155;border-top-color:#60a5fa;animation:upSp 0.9s linear infinite}@keyframes upSp{to{transform:rotate(360deg)}}
            .up-big{display:flex;align-items:center;gap:12px;padding:14px;margin:8px 0;border-radius:14px;background:#0f172a;border:1px solid #334155;cursor:pointer}.up-big>span{font-size:28px}.up-big b{display:block;color:#f1f5f9}.up-big small{color:#94a3b8}.up-big:active{background:#1e293b}
            .up-row{display:flex;align-items:center;gap:8px;padding:9px;margin:6px 0;border-radius:12px;background:#0f172a;border:1px solid #334155}.up-row.many{border-color:#f59e0b}.up-row.none{border-color:#64748b;opacity:.85}.up-row.off{opacity:.5}
            .up-who{flex:1;min-width:0}.up-who b{display:block;color:#f1f5f9;font-size:14px}.up-who small{color:#94a3b8;display:block}.up-who select{width:100%;margin-top:4px}.up-lbl{color:#64748b!important;font-size:11px}
            .up-mv{display:flex;gap:3px}.up-mv button{width:30px;height:30px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0}
            .up-prev{display:flex;gap:8px;overflow-x:auto;padding:6px 0}.up-prev img{height:150px;border-radius:6px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4)}.up-prev small{align-self:center;color:#94a3b8}
            .up-doc{max-height:300px;overflow:auto;background:#fff;color:#111;border-radius:8px;padding:12px;font-family:'Times New Roman',serif;font-size:13px}.up-doc p{margin:0 0 4px}.up-doc .a-title{text-align:center;font-weight:700}.up-doc table{width:100%}
            .up-sc{margin:10px 0;padding:8px;border-radius:12px;background:#0f172a;border:1px solid #334155}.up-sc-h{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;color:#e2e8f0}.up-sc-h span{display:flex;gap:4px;flex-wrap:wrap}.up-sc-h button{padding:6px 8px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px}
            .up-sc-ed{position:relative;touch-action:none;user-select:none}.up-sc-ed img{display:block;width:100%;border-radius:6px}.up-sc-ed svg{position:absolute;inset:0;width:100%;height:100%}.up-sc-ed polygon{fill:rgba(59,130,246,.15);stroke:#3b82f6;stroke-width:0.6%}.up-sc-ed circle{fill:rgba(255,255,255,.85);stroke:#2563eb;stroke-width:0.6%}
            .up-sc-res{margin-top:6px}.up-sc-res img{width:100%;border-radius:6px;background:#fff}
            .up-ocr{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:760px){.up-ocr{grid-template-columns:1fr 1fr}}.up-ocr-img{max-height:70vh;overflow:auto;display:flex;flex-direction:column;gap:8px}.up-ocr-img img{width:100%;background:#fff;border-radius:6px}
            .up-ocr-txt{max-height:70vh;overflow:auto;background:#fff;color:#111;border-radius:6px;padding:14px;font-family:'Times New Roman',serif;font-size:14px;line-height:1.45;outline:2px solid transparent}.up-ocr-txt:focus{outline-color:#3b82f6}.up-ocr-txt p{margin:0 0 6px;text-align:justify}.up-ocr-txt .a-title{text-align:center;font-weight:700}.up-ocr-txt table{width:100%;border-collapse:collapse}.up-ocr-txt td{padding:2px 4px;vertical-align:top}
            #screen-hisob .sec-tabs{flex-wrap:wrap}mark.up-lc{background:#fde047;color:#111;border-radius:3px;padding:0 1px}mark.up-lc.seen{background:#bbf7d0}`; document.head.appendChild(st); })();

