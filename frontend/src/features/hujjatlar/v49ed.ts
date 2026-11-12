        // =====================================================================
        // 4.9 b115 — Tayyor hujjat koʻrinishi: yaqinlashtirish va qoʻlda tahrirlash (muallif soʻrovi, 26.10.2026)
        //  • Hujjat koʻrinishi tepasida: 🔍＋ / 🔍－ / ⤢ (asl oʻlcham) va ikki barmoq bilan yaqinlashtirish (pinch).
        //    Yaqinlashtirilganda sahifa aniqroq qayta chiziladi, surib oʻqiladi.
        //  • «✏️ Tahrirlash»: hujjat matni oq varaqda ochiladi — istalgan soʻz yoniga soʻz yozish, keraksizini oʻchirish mumkin.
        //    Saqlansa: oʻzgarish faqat oʻzgargan joyga yoziladi (atrofdagi shrift, qalinlik, tab, chiziqlar oʻzgarmaydi) va
        //    Word, PDF, imzoga yuborilgan hujjat — hammasi shu tahrirlangan matn bilan chiqadi. «↺ Asl holiga» — tahrir bekor.
        //    Kolodka qabul dalolatnomasi va korxona blankasidagi hujjatlarda (kalkulyatsiya aktlari, nosozlik) ishlaydi.
        //  • AI / qoʻlda tuzilgan aktlar (HTML) — ham yaqinlashtirish, ham «✏️ Tahrirlash» (toʻgʻridan-toʻgʻri varaq ustida).
        // =====================================================================
        const ED9: any = window as any;
        function edE(s: unknown): string { return ED9.escapeHtml(String(s == null ? '' : s)); }
        function edUnx(s: string): string { return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&'); }
        function edX(s: string): string { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        // ---- Word paragrafi: belgilar (har biri oʻz formati bilan) ----
        function edParse(p: string): any {
            const open = (p.match(/^<w:p\b[^>]*>/) || ['<w:p>'])[0], pPr = (p.slice(open.length).match(/^<w:pPr>[\s\S]*?<\/w:pPr>/) || [''])[0], ch: any[] = [];
            for (const m of p.matchAll(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g)) {
                const body = m[1], rpr = (body.match(/<w:rPr>[\s\S]*?<\/w:rPr>/) || [''])[0];
                for (const t of body.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)) {
                    if (t[1] !== undefined) edUnx(t[1]).split('').forEach(c => ch.push({ c: c, r: rpr })); else ch.push({ c: /tab/.test(t[0]) ? '\t' : '\n', r: rpr });
                }
            }
            return { open: open, pPr: pPr, ch: ch, t: ch.map(z => z.c).join(''), lock: /<w:drawing|<w:pict|w:fldChar|<w:object/.test(p) };
        }
        function edBuild(P: any): string {
            let runs = '', i = 0; const ch = P.ch;
            while (i < ch.length) { const r = ch[i].r; let s = '', buf = ''; const fl = () => { if (buf) { s += '<w:t xml:space="preserve">' + edX(buf) + '</w:t>'; buf = ''; } };
                while (i < ch.length && ch[i].r === r) { const c = ch[i].c; if (c === '\t') { fl(); s += '<w:tab/>'; } else if (c === '\n') { fl(); s += '<w:br/>'; } else buf += c; i++; } fl(); runs += '<w:r>' + r + s + '</w:r>'; }
            return P.open + P.pPr + runs + '</w:p>';
        }
        // Faqat oʻzgargan oʻrta qism almashtiriladi (boshi va oxiri — asl formatda)
        function edApplyPara(p: string, o: string, n: string): string | null {
            const P = edParse(p); if (P.lock || P.t !== o) return null; if (o === n) return p;
            let a = 0; while (a < o.length && a < n.length && o[a] === n[a]) a++;
            let b = 0; while (b < o.length - a && b < n.length - a && o[o.length - 1 - b] === n[n.length - 1 - b]) b++;
            const r = (P.ch[a - 1] || P.ch[a] || P.ch[0] || { r: '' }).r;
            P.ch.splice(a, o.length - a - b, ...n.slice(a, n.length - b).split('').map(c => ({ c: c, r: r })));
            return edBuild(P);
        }
        function edParas(xml: string): { pos: number[][], P: string[] } { const re = /<w:p\b[\s\S]*?<\/w:p>/g, P: string[] = [], pos: number[][] = []; let m: any; while ((m = re.exec(xml))) { P.push(m[0]); pos.push([m.index, m.index + m[0].length]); } return { pos: pos, P: P }; }
        function edApply(xml: string, ed: any): string {
            if (!ed || typeof ed !== 'object' || !Object.keys(ed).length) return xml;
            const S = edParas(xml); let res = '', at = 0, miss = 0;
            S.P.forEach((p, i) => { let q = p; const e = ed[i]; if (e && typeof e.o === 'string' && typeof e.n === 'string') { const v = edApplyPara(p, e.o, e.n); if (v == null) miss++; else q = v; } res += xml.slice(at, S.pos[i][0]) + q; at = S.pos[i][1]; });
            ED9.ED_MISS = miss; return res + xml.slice(at);
        }
        if (typeof ED9.dxFillXml === 'function') ED9.dxFillXml = ED9.agmkExtend('dxFillXml', '4.9 b115: qoʻlda tahrir', ED9.dxFillXml, (o: Function) => function (this: unknown, xml: string, data: any) {
            const r = o.apply(this, arguments); try { return data && data._ed ? edApply(r, data._ed) : r; } catch (e) { console.error(e); return r; }
        });
        // Maʼlumotga tahrirlar qoʻshiladi (kolodka — KQ._ed, blanka hujjatlari — CXV.cur._ed)
        if (typeof ED9.kqData === 'function') ED9.kqData = ED9.agmkExtend('kqData', '4.9 b115: tahrir', ED9.kqData, (o: Function) => function (this: unknown) { const d = o.apply(this, arguments); try { const K = typeof KQ !== 'undefined' ? KQ : null; if (K && K._ed && d) d._ed = K._ed; } catch (e) { /* */ } return d; });
        if (typeof ED9.cxDxData === 'function') ED9.cxDxData = ED9.agmkExtend('cxDxData', '4.9 b115: tahrir', ED9.cxDxData, (o: Function) => function (this: unknown, doc: any) { const d = o.apply(this, arguments); try { if (doc && doc._ed && d && typeof d === 'object') d._ed = doc._ed; } catch (e) { /* */ } return d; });

        // ---- Qaysi hujjat: tahrir qayerga saqlanadi ----
        function edCtx(el: any): any {
            if (!el) return null;
            try { const X = ED9.ED_CTX && ED9.ED_CTX[el.id]; if (X) return X; } catch (e) { /* */ } // boshqa modullar oʻz hujjatini roʻyxatdan oʻtkazadi
            if (el.id === 'kqPrev') return { get: () => (typeof KQ !== 'undefined' ? KQ : null), save: () => { try { kqSave(); } catch (e) { /* */ } }, redraw: () => { try { ED9.kqPrev(); } catch (e) { /* */ } } };
            if (el.id === 'cxPage') return { get: () => (ED9.CXV ? ED9.CXV.cur : null), save: () => { /* «💾 Saqlash» bilan saqlanadi */ }, redraw: () => { try { ED9.cxPrev(); } catch (e) { /* */ } } };
            return null;
        }
        // ---- Yaqinlashtirish ----
        var ED: any = { R: new WeakMap(), z: new WeakMap() };
        function edZoomSet(el: any, z: number, hi?: boolean): void {
            if (el && el.id === 'ndPage') { z = Math.max(1, Math.min(3, z)); ED.z.set(el, z); el.style.zoom = z > 1.01 ? String(z) : ''; const lb = el._bar && el._bar.querySelector('.ed-zl'); if (lb) lb.textContent = Math.round(z * 100) + '%'; return; } // HTML akt — CSS zoom
            z = Math.max(1, Math.min(4, Math.round(z * 100) / 100)); ED.z.set(el, z);
            el.classList.toggle('ed-zoomed', z > 1.01);
            el.querySelectorAll('canvas.dx-pg').forEach((c: any) => { c.style.width = (z * 100) + '%'; });
            const lab = el._bar && el._bar.querySelector('.ed-zl'); if (lab) lab.textContent = Math.round(z * 100) + '%';
            if (hi) edHiRes(el);
        }
        function edHiRes(el: any): void {
            const R = ED.R.get(el), z = ED.z.get(el) || 1; if (!R || typeof ED9.dxCanvas !== 'function') return;
            const S = Math.min(5, 1.6 * Math.max(1, z * 0.9)); if (el.dataset.s && Math.abs(+el.dataset.s - S) < 0.2) return; el.dataset.s = String(S);
            const cs = el.querySelectorAll('canvas.dx-pg'); R.lay.pages.forEach((ops: any, i: number) => { const c = ED9.dxCanvas(R.lay, ops, S); c.className = 'dx-pg'; c.style.width = (z * 100) + '%'; if (cs[i]) cs[i].replaceWith(c); });
        }
        function edPinch(el: any): void {
            if (el._edp) return; el._edp = true; let d0 = 0, z0 = 1;
            const dist = (t: any) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
            el.addEventListener('touchstart', (e: any) => { if (e.touches.length === 2) { d0 = dist(e.touches); z0 = ED.z.get(el) || 1; } }, { passive: true });
            el.addEventListener('touchmove', (e: any) => { if (e.touches.length === 2 && d0) { e.preventDefault(); edZoomSet(el, z0 * dist(e.touches) / d0); } }, { passive: false });
            el.addEventListener('touchend', (e: any) => { if (d0 && e.touches.length < 2) { d0 = 0; edHiRes(el); } }, { passive: true });
        }
        function edBar(el: any, editable: boolean, html?: boolean): void {
            let b = el._bar; if (!b) { b = document.createElement('div'); b.className = 'ed-bar'; el._bar = b; } if (b.nextElementSibling !== el && el.parentNode) el.parentNode.insertBefore(b, el);
            const z = ED.z.get(el) || 1, o: any = editable ? edCtx(el) : null, has = o && o.get() && o.get()._ed && Object.keys(o.get()._ed).length;
            b.innerHTML = `<button type="button" data-a="m" title="Uzoqlashtirish">🔍－</button><span class="ed-zl">${Math.round(z * 100)}%</span><button type="button" data-a="p" title="Yaqinlashtirish">🔍＋</button><button type="button" data-a="r" title="Asl oʻlcham">⤢</button>`
                + (editable || html ? `<button type="button" data-a="e" class="ed-eb">✏️ Tahrirlash</button>` : '') + (has ? `<button type="button" data-a="x" title="Tahrirni bekor qilish">↺ Asl holiga</button>` : '')
                + (has && ED9.ED_MISS ? `<span class="ed-w">⚠️ ${ED9.ED_MISS} ta tahrir qoʻllanmadi (maydon oʻzgargan) — qayta tahrirlang</span>` : '');
            b.onclick = (e: any) => { const t = e.target.closest('button'); if (!t) return; const a = t.dataset.a, zz = ED.z.get(el) || 1;
                if (a === 'p') edZoomSet(el, zz + 0.5, true); else if (a === 'm') edZoomSet(el, zz - 0.5, true); else if (a === 'r') edZoomSet(el, 1, true);
                else if (a === 'e') { if (html) edHtmlToggle(el, t); else edOpen(el); } else if (a === 'x') edReset(el); };
        }
        if (typeof ED9.dxPreview === 'function') ED9.dxPreview = ED9.agmkExtend('dxPreview', '4.9 b115: yaqinlashtirish va tahrir', ED9.dxPreview, (o: Function) => async function (this: unknown, el: any, id: string, data: any) {
            ED9.ED_MISS = 0; const R = await o.apply(this, arguments);
            try { if (el && R) { ED.R.set(el, R); el.dataset.s = ''; el.dataset.dxid = id; edBar(el, !!edCtx(el)); edPinch(el); const z = ED.z.get(el) || 1; if (z > 1.01) { edZoomSet(el, z); edHiRes(el); } } } catch (e) { console.error(e); }
            return R;
        });
        // ---- Tahrir oynasi (Word blankasi asosidagi hujjat) ----
        var EDS: any = null;
        async function edOpen(el: any): Promise<void> {
            const C = edCtx(el), src = C && C.get(), id = el.dataset.dxid; if (!C || !src || !id) return;
            const data = C.data ? C.data() : el.id === 'kqPrev' ? ED9.kqData() : ED9.cxDxData(src); const base = Object.assign({}, data); delete base._ed;
            let R: any; try { R = await ED9.dxRender(id, base); } catch (e) { ED9.alert('⚠️ ' + String(e)); return; }
            const xml = new TextDecoder().decode(R.files['word/document.xml']), S = edParas(xml), ed = src._ed || {};
            EDS = { el: el, C: C, rows: [] };
            const rows = S.P.map((p, i) => { const P = edParse(p); return { i: i, o: P.t, lock: P.lock, jc: (P.pPr.match(/<w:jc w:val="(\w+)"/) || [])[1] || '', b: /<w:b\/>|<w:b w:val="(1|true)"\/>/.test((P.ch[0] || {}).r || '') }; }).filter(r => r.o.replace(/[\s _]/g, '').length || r.o.includes('_'));
            EDS.rows = rows;
            ED9.mdl('edModal', `<div class="px-h"><b>✏️ Hujjatni tahrirlash</b><button class="mini-btn" onclick="mdlClose('edModal')">✕</button></div>
                <div class="nd-tip">Istalgan joyga bosib yozing yoki oʻchiring. Shrift, qalinlik va joylashuv oʻzgarmaydi — faqat siz oʻzgartirgan soʻzlar almashadi. Avval maydonlarni toʻldirib, tahrirni oxirida qiling.</div>
                <div class="ed-page">${rows.map((r: any) => { const cur = ed[r.i] && ed[r.i].o === r.o ? ed[r.i].n : r.o; return `<div class="ed-p${r.lock ? ' lock' : ''}${r.b ? ' b' : ''}" style="text-align:${r.jc === 'center' ? 'center' : r.jc === 'right' ? 'right' : r.jc === 'both' ? 'justify' : 'left'}" data-i="${r.i}" ${r.lock ? '' : 'contenteditable="true"'}>${edE(cur)}</div>`; }).join('')}</div>
                <div class="nv-btns"><button class="on" onclick="edSave()">💾 Saqlash</button><button onclick="mdlClose('edModal')">Bekor qilish</button></div>`, true);
        }
        function edSave(): void {
            if (!EDS) return; const src = EDS.C.get(); if (!src) return; const ed: any = {};
            document.querySelectorAll('#edModal .ed-p[contenteditable]').forEach((d: any) => { const i = +d.dataset.i, r = EDS.rows.find((x: any) => x.i === i); if (!r) return;
                const n = String(d.innerText || '').replace(/ /g, ' ').replace(/\n$/, ''); if (n !== r.o) ed[i] = { o: r.o, n: n }; });
            if (Object.keys(ed).length) src._ed = ed; else delete src._ed;
            EDS.C.save(); ED9.mdlClose('edModal'); EDS.C.redraw(); try { ED9.showToast(Object.keys(ed).length ? '✏️ Tahrir saqlandi — Word, PDF va imzoga shu matn ketadi' : 'Oʻzgarish yoʻq'); } catch (e) { /* */ }
        }
        async function edReset(el: any): Promise<void> { const C = edCtx(el), s = C && C.get(); if (!s || !(await ED9.uiConfirm('Qoʻlda kiritilgan tahrirlar bekor qilinsinmi?'))) return; delete s._ed; C.save(); C.redraw(); }
        // ---- HTML aktlar (AI / qoʻlda): varaq ustida tahrir ----
        function edHtmlToggle(el: any, btn: any): void {
            if (!el._edOn) { el._edOn = true; el._edWas = el.getAttribute('contenteditable'); el.setAttribute('contenteditable', 'true'); el.classList.add('ed-live'); btn.textContent = '💾 Tahrirni saqlash'; el.focus(); return; }
            el._edOn = false; if (el._edWas == null) el.removeAttribute('contenteditable'); else el.setAttribute('contenteditable', el._edWas); el.classList.remove('ed-live'); btn.textContent = '✏️ Tahrirlash';
            try { const N: any = typeof ND !== 'undefined' ? ND : null; if (N && el.id === 'ndPage') { N.html = el.innerHTML; N.savedId = null; } ED9.showToast('✏️ Tahrir saqlandi'); } catch (e) { console.error(e); }
        }
        if (typeof ED9.ndRender === 'function') ED9.ndRender = ED9.agmkExtend('ndRender', '4.9 b115: akt — yaqinlashtirish va tahrir', ED9.ndRender, (o: Function) => function (this: unknown) {
            const r = o.apply(this, arguments);
            const put = () => { try { const p = ED9.$id('ndPage'); if (p) { edBar(p, false, true); const z = ED.z.get(p) || 1; p.style.zoom = z > 1.01 ? String(z) : ''; edHtmlPinch(p); } } catch (e) { console.error(e); } };
            put(); setTimeout(put, 60); // ba'zi qismlar varaqni keyinroq koʻchiradi
            return r;
        });
        function edHtmlPinch(p: any): void {
            if (p._edp) return; p._edp = true; let d0 = 0, z0 = 1; const dist = (t: any) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
            p.addEventListener('touchstart', (e: any) => { if (e.touches.length === 2) { d0 = dist(e.touches); z0 = ED.z.get(p) || 1; } }, { passive: true });
            p.addEventListener('touchmove', (e: any) => { if (e.touches.length === 2 && d0) { e.preventDefault(); const z = Math.max(1, Math.min(3, z0 * dist(e.touches) / d0)); ED.z.set(p, z); p.style.zoom = String(z); } }, { passive: false });
            p.addEventListener('touchend', () => { d0 = 0; }, { passive: true });
        }
        Object.assign(ED9, { edSave: edSave, edApply: edApply, edApplyPara: edApplyPara });
        (function () {
            const st = document.createElement('style');
            st.textContent = '.ed-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 6px}.ed-bar button{border:1px solid rgba(125,211,252,.4);background:rgba(14,165,233,.12);color:#e0f2fe;border-radius:10px;padding:8px 10px;font:700 13px/1 inherit;cursor:pointer}.ed-bar .ed-eb{background:rgba(34,197,94,.16);border-color:rgba(74,222,128,.5);color:#dcfce7}.ed-zl{min-width:44px;text-align:center;font:700 12px/1 inherit;opacity:.85}.ed-w{flex-basis:100%;font-size:12px;color:#fde68a}'
                + '.dx-prev.ed-zoomed{overflow:auto;align-items:flex-start;touch-action:pan-x pan-y}.dx-prev.ed-zoomed .dx-pg{max-width:none}.dx-prev{touch-action:pan-y}'
                + '.ed-page{background:#fff;color:#000;font-family:"Times New Roman",serif;font-size:15px;line-height:1.45;padding:18px 16px;border-radius:8px;max-height:62vh;overflow:auto}.ed-p{white-space:pre-wrap;padding:4px 6px;margin:2px 0;border-radius:4px;outline:none;tab-size:4}.ed-p.b{font-weight:700}.ed-p[contenteditable]:focus{background:#fef9c3;box-shadow:0 0 0 2px #facc15}.ed-p.lock{color:#64748b}'
                + '#ndPage.ed-live{outline:3px dashed #facc15;outline-offset:4px}';
            document.head.appendChild(st);
        })();
