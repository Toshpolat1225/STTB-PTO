        // =====================================================================
        // v4.8 — muallif kamchiliklari (23.10.2026)
        //  1) Taʼmir tarixi: har yozuvda koʻrinadigan «✏️ Tahrirlash» / 🗑 — tahrir oynasi (kalendar, tur, texnik yechim, izoh, «tahrirladi»).
        //     Sana/tur oʻzgarsa pasportdagi oxirgi DR / KR va keyingi DR qayta hisoblanadi. «📘 Manba: vagon pasporti» (src:'pasp') belgisi.
        //  2) 📄 Pasportni PDF qilib yuklab olish — 🎨 rangli yoki ⬜ rangsiz (pechat uchun), A4; sigʻmasa 2-varaqqa davom etadi.
        //     Muallif tasdiqlagan namuna (Pasport_namuna_24604) asosida. Xodimda oklad, telefon, manzil, tugʻilgan sana — CHIQMAYDI.
        // =====================================================================
        const H8: any = window as any;

        function h8E(s: unknown): string { return H8.escapeHtml(String(s == null ? '' : s)); }
        /** istalgan sana yozuvi → ISO (YYYY-MM-DD); tanilmasa '' */
        function h8Iso(s: unknown): string {
            const t = String(s || '').trim(); let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return m[1] + '-' + m[2] + '-' + m[3];
            m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/); if (m) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
            return '';
        }
        function h8Dmy(iso: unknown): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); }
        function h8Today(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function h8IsKR(t: unknown): boolean { return /(^|[^A-Za-z])KR([^A-Za-z]|$)|kapital|капитальн/i.test(String(t || '')); }
        function h8IsDR(t: unknown): boolean { return !h8IsKR(t) && /(^|[^A-Za-z])DR([^A-Za-z]|$)|depo|деповск/i.test(String(t || '')); }
        function h8V(): any { try { return ((vagonlarData as any) || []).find((x: any) => x.id === (activeVagonId as any)); } catch (e) { return null; } }

        // ---------- 1) TAʼMIR TARIXI: tahrirlash ----------
        var H8T: string[] = ['Depo taʼmiri (DR)', 'Kapital taʼmir (KR)', 'Joriy taʼmir (TR)'];
        var H8S: any = { i: -1, d: '', g: '' };
        function h8DateF(k: string, label: string, v: string): string {
            return `<label class="kq-l">${label}<span class="kq-d"><input class="kq-dt" readonly tabindex="-1" value="${h8E(h8Dmy(v))}" placeholder="kk.oo.yyyy"><span class="kq-di">📅</span><input type="date" class="kq-dn" value="${h8E(v || '')}" onchange="h8DateSet('${k}', this.value, this)" onclick="try{this.showPicker()}catch(e){}"></span></label>`;
        }
        function h8DateSet(k: string, v: string, el: any): void {
            H8S[k] = v || ''; const w = el && el.closest ? el.closest('.kq-d') : null; if (!w) return;
            const t = w.querySelector('.kq-dt'); if (t) t.value = h8Dmy(v);
        }
        function h8Edit(i: number): void {
            const v = h8V(); if (!v || !v.history || !v.history[i]) return; const h = v.history[i];
            H8S.i = i; H8S.d = h8Iso(h.date) || h8Today(); H8S.g = h8Iso(h.tyGacha);
            const cur = String(h.type || ''), known = H8T.find(t => t === cur) || (h8IsKR(cur) ? H8T[1] : '');
            const opts = H8T.map(t => `<option${t === known ? ' selected' : ''}>${h8E(t)}</option>`).join('') + `<option value="__"${known ? '' : ' selected'}>Boshqa (oʻz matni)</option>`;
            const by = h.edited ? `<div class="h8-ed">✏️ Oxirgi tahrir: ${h8E(h.edited.by)} · ${h8E(h8Dmy(String(h.edited.at || '').slice(0, 10)))}</div>` : '';
            H8.mdl('h8Ed', `<div class="px-h"><b>✏️ Taʼmir yozuvini tahrirlash</b><button class="mini-btn" onclick="mdlClose('h8Ed')">✕</button></div>
                <div class="h8-f">${h8DateF('d', 'Sana', H8S.d)}
                <label class="kq-l">Taʼmir turi<select id="h8Ty" class="custom-select" onchange="document.getElementById('h8TyO').style.display=this.value==='__'?'':'none'">${opts}</select></label>
                <input id="h8TyO" class="custom-select" style="${known ? 'display:none' : ''}" value="${h8E(known ? '' : cur)}" placeholder="Taʼmir nomi">
                <div class="h8-row"><label class="kq-l">Texnik yechim №<input id="h8Ty1" class="custom-select" value="${h8E(h.ty || '')}" placeholder="masalan, 22"></label>${h8DateF('g', 'Xizmat muddati … gacha', H8S.g)}</div>
                <label class="kq-l">Izoh<textarea id="h8Iz" class="custom-select" rows="2" placeholder="ixtiyoriy">${h8E(h.izoh || '')}</textarea></label>
                <div class="h8-ed">Kiritdi: ${h8E(h.author || '—')}</div>${by}
                <button class="action-btn" style="width:100%;margin-top:10px" onclick="h8Save()">💾 Saqlash</button></div>`);
        }
        /** pasportdagi oxirgi DR / KR ni tarix bilan moslashtirish (faqat oʻzgargan yozuvga tegishli joyni) */
        function h8Sync(v: any, old: any, now: any): void {
            const maxOf = (f: (t: unknown) => boolean) => (v.history || []).filter((x: any) => f(x.type)).map((x: any) => h8Iso(x.date)).filter(Boolean).sort().pop() || '';
            const od = old ? h8Iso(old.date) : '';
            [[h8IsDR, 'tamirSanasi'], [h8IsKR, 'kr']].forEach(([f, k]: any) => {
                const was = old && f(old.type) && od && String(v[k] || '').slice(0, 10) === od, isNow = now && f(now.type) && h8Iso(now.date);
                if (was) { const m = maxOf(f); if (m) v[k] = m; else if (!isNow) { /* tarixda boshqa yozuv yoʻq — pasport sanasi saqlanadi */ } }
                if (isNow && h8Iso(now.date) > String(v[k] || '').slice(0, 10) && h8Iso(now.date) <= h8Today()) v[k] = h8Iso(now.date);
            });
            if (old && old._dr !== v.tamirSanasi && !v.vgMove) v.drAuto = true; // oxirgi DR oʻzgardi — keyingisi qayta hisoblanadi
            if (old && old._kr !== v.kr) { v.krTxt = ''; if (!v.vgMove) v.drAuto = true; }
            try { H8.recalcVagonStatus(v); } catch (e) { /* */ }
        }
        function h8Refresh(v: any): void { try { H8.saveDB(); } catch (e) { /* */ } try { H8.openPassport(v.id); } catch (e) { try { H8.renderTamirHistory(v); } catch (x) { /* */ } } }
        function h8Save(): void {
            const v = h8V(); if (!v || !v.history || !v.history[H8S.i]) { H8.mdlClose('h8Ed'); return; } const h = v.history[H8S.i];
            const sel = (H8.$id('h8Ty') || {}).value, other = String((H8.$id('h8TyO') || {}).value || '').trim(), type = sel === '__' ? other : sel;
            if (!H8S.d) { H8.alert('Sanani tanlang.'); return; } if (!type) { H8.alert('Taʼmir turini yozing.'); return; }
            const old = Object.assign({}, h, { _dr: v.tamirSanasi, _kr: v.kr });
            h.date = H8S.d; h.type = type; h.ty = String((H8.$id('h8Ty1') || {}).value || '').trim(); h.tyGacha = H8S.g || '';
            h.izoh = String((H8.$id('h8Iz') || {}).value || '').trim(); h.edited = { by: H8.authorStr(), at: new Date().toISOString() };
            ['ty', 'tyGacha', 'izoh'].forEach(k => { if (!h[k]) delete h[k]; });
            h8Sync(v, old, h); H8.mdlClose('h8Ed'); h8Refresh(v);
            try { H8.aiLog('Taʼmir tarixi tahrirlandi: ' + H8.vagonNo(v) + ' · ' + h8Dmy(h.date) + ' · ' + type); } catch (e) { /* */ }
        }
        async function h8Del(i: number): Promise<void> {
            const v = h8V(); if (!v || !v.history || !v.history[i]) return; const h = v.history[i];
            if (!await H8.uiConfirm('Bu yozuv oʻchirilsinmi?\n' + h8Dmy(h8Iso(h.date) || h.date) + ' — ' + (h.type || ''))) return;
            const old = Object.assign({}, h, { _dr: v.tamirSanasi, _kr: v.kr }); v.history.splice(i, 1); h8Sync(v, old, null); h8Refresh(v);
        }
        if (typeof H8.editTamirEntry === 'function') H8.editTamirEntry = function (i: number) { h8Edit(i); };
        if (typeof H8.deleteTamirEntry === 'function') H8.deleteTamirEntry = function (i: number) { return h8Del(i); };
        function h8Decor(v: any): void {
            const c = H8.$id('tamir-history-list'); if (!c || !v || !v.history) return; const items = c.querySelectorAll('.history-item');
            v.history.forEach((h: any, i: number) => {
                const el = items[i]; if (!el) return;
                const a = el.querySelector('.hist-actions'); if (a) a.innerHTML = `<button class="h8-b" onclick="editTamirEntry(${i})">✏️ Tahrirlash</button><button class="h8-b h8-x" onclick="deleteTamirEntry(${i})" title="Oʻchirish">🗑</button>`;
                if (h.src === 'pasp' && !el.querySelector('.hs-tag')) { el.classList.add('hs-src-pasp'); el.insertAdjacentHTML('afterbegin', '<span class="hs-tag">📘 Manba: vagon pasporti</span>'); }
                const ex: string[] = [];
                if (h.ty) ex.push('📑 Texnik yechim № ' + h8E(h.ty) + (h.tyGacha ? ' — ' + h8E(h8Dmy(h.tyGacha)) + ' gacha' : ''));
                if (h.izoh) ex.push('📝 ' + h8E(h.izoh));
                if (h.edited) ex.push('✏️ tahrirladi: ' + h8E(h.edited.by) + ' · ' + h8E(h8Dmy(String(h.edited.at || '').slice(0, 10))));
                if (ex.length) el.insertAdjacentHTML('beforeend', ex.map(t => `<div class="h8-x1">${t}</div>`).join(''));
            });
        }
        if (typeof H8.renderTamirHistory === 'function') H8.renderTamirHistory = H8.agmkExtend('renderTamirHistory', 'v4.8: tahrirlash tugmalari', H8.renderTamirHistory, (o: Function) => function (this: unknown, v: any) { const r = o.apply(this, arguments); try { h8Decor(v); } catch (e) { console.error(e); } return r; });

        // ---------- 2) PASPORT → PDF (rangli / rangsiz) ----------
        var P8_PD = /oklad|оклад|telefon|телефон|tel\.|manzil|адрес|tug.?ilgan|tugilgan|рожден/i; // xavfsizlik qoidasi 3
        function p8Pairs(sel: string): any[] {
            const out: any[] = [];
            document.querySelectorAll(sel).forEach((d: any) => {
                if (d.offsetParent === null && !d.closest('.screen.active')) return;
                const t = String(d.textContent || '').replace(/\s+/g, ' ').trim(), k = t.indexOf(':'); if (k < 1) return;
                const l = t.slice(0, k).trim(), val = t.slice(k + 1).trim(); if (!l || P8_PD.test(l)) return;
                out.push([l.charAt(0) + l.slice(1).toLowerCase(), val || '—']);
            });
            return out;
        }
        function p8Img(sel: string): string {
            try { const e = document.querySelector(sel) as any; if (!e) return ''; if (e.tagName === 'IMG') return /^data:image/.test(e.src) ? e.src : '';
                const m = String(getComputedStyle(e).backgroundImage || '').match(/url\(["']?(data:image[^"')]+)["']?\)/); return m ? m[1] : ''; } catch (e) { return ''; }
        }
        function p8Src(h: any): string { return ({ man: 'Qoʻlda', auto: 'Avtomatik', dv: 'Achotdan', ppr: 'Reja', ns: 'Nosozlik', pol: 'Polojeniya', pasp: 'Vagon pasporti' } as any)[h.src] || (h.src ? h.src : 'Qoʻlda yozuv'); }
        /** ochiq pasportdan PDF maʼlumotlari */
        function p8Collect(): any {
            const act = document.querySelector('.screen.active') as any; const id = act ? act.id : '';
            if (id === 'screen-vagon-pasport') {
                const v = h8V(); if (!v) return null; const lok = (() => { try { return typeof H8.qrIsLok === 'function' && !!H8.qrIsLok(v); } catch (e) { return false; } })(), rail = !v.kind && !lok, no = (() => { try { return String(H8.vagonNo(v)); } catch (e) { return String(v.num || v.id); } })();
                const lr = rail && typeof H8.agmkLastRep === 'function' ? H8.agmkLastRep(v) : { d: v.tamirSanasi, t: '' };
                const S: any[] = [];
                const ex = p8Pairs('#p-extra > div'); if (ex.length) S.push({ t: 'Kartoteka maʼlumotlari', f: ex });
                if (rail) {
                    let pg = ''; try { pg = typeof H8.pgDueISO === 'function' ? H8.pgDueISO(v) : ''; } catch (e) { /* */ }
                    S.push({ t: 'Taʼmir holati', f: [['Oxirgi taʼmir turi', lr.t === 'KR' ? 'Kapital taʼmir (KR)' : lr.t === 'DR' ? 'Depo taʼmiri (DR)' : (v.tamirTuri || '—')], ['Oxirgi taʼmir sanasi', h8Dmy(lr.d) || '—'],
                        ['Oxirgi DR', h8Dmy(v.tamirSanasi) || v.drTxt || '—'], ['Oxirgi KR', h8Dmy(v.kr) || v.krTxt || '—'], ['Keyingi DR (grafik PPR)', h8Dmy(v.keyingi) || '—'], ['Keyingi DR (probeg)', h8Dmy(pg) || '—'],
                        ['Qolgan kun', v.kun == null || v.kun === '' ? '—' : String(v.kun) + ' kun']] });
                }
                const pk: any[] = []; document.querySelectorAll('#xkPassCard .xk-pk > div').forEach((d: any) => {
                    const ns = Array.from(d.childNodes) as any[], l0 = ns.findIndex(n => n.tagName === 'SMALL'); if (l0 < 0) return;
                    const rest = ns.slice(l0 + 1), last = rest.length && /^(SMALL|EM|I)$/.test(rest[rest.length - 1].tagName || '') ? rest.pop() : null;
                    pk.push([String(ns[l0].textContent || '').trim(), rest.map(n => String(n.textContent || '').trim()).filter(Boolean).join(' ') || '—', last ? String(last.textContent || '').trim() : '']);
                });
                if (pk.length) S.push({ t: 'Probeg', k: pk });
                const H = (v.history || []).map((h: any) => [h8Dmy(h8Iso(h.date)) || String(h.date || ''), String(h.type || ''), p8Src(h), String(h.author || '').replace(/\s*\(.*\)$/, '')]);
                if (H.length) S.push({ t: 'Taʼmir tarixi', tb: { h: ['Sana', 'Taʼmir', 'Manba', 'Kiritdi'], r: H } });
                const st = (H8.$id('p-holat') || {}).textContent || v.status || '';
                return { kind: rail ? 'VAGON PASPORTI' : lok ? 'LOKOMOTIV PASPORTI' : 'TEXNIKA PASPORTI', no: (H8.$id('pasport-header-title') || {}).textContent || ('№ ' + no), sub: (H8.$id('p-model') || {}).textContent || v.type || '', st: String(st).replace(/[🟢🟡🟠🔴🔧🟤⚪]/gu, '').trim(),
                    ok: /soz/i.test(st), img: p8Img('#vgHero .vgi'), main: p8Pairs('#screen-vagon-pasport .passport-grid > div').filter(x => !/^holat$/i.test(x[0])), S: S, file: (rail ? 'Vagon_' : lok ? 'Lokomotiv_' : 'Texnika_') + no.replace(/[^\p{L}\d_-]+/gu, '_') };
            }
            if (id === 'screen-item-pasport') {
                let it: any = null; try { it = H8.getActiveItem(); } catch (e) { /* */ } if (!it) return null;
                const xod = (() => { try { return (currentSectionType as any) === 'xodim'; } catch (e) { return false; } })(), S: any[] = [];
                if (xod && (it.workHistory || []).length) S.push({ t: 'Mehnat faoliyati', tb: { h: ['Boshlangan', 'Tugagan', 'Seh', 'Lavozim'], r: it.workHistory.map((w: any) => [h8Dmy(w.start), w.end ? h8Dmy(w.end) : 'hozirda', w.seh || '', w.lavozim || '']) } });
                if (!xod && (it.history || []).length) S.push({ t: 'Taʼmir tarixi', tb: { h: ['Sana', 'Taʼmir', 'Manba', 'Kiritdi'], r: it.history.map((h: any) => [h8Dmy(h8Iso(h.date)) || h.date, h.type || '', p8Src(h), String(h.author || '').replace(/\s*\(.*\)$/, '')]) } });
                return { kind: xod ? 'XODIM PASPORTI' : 'PASPORT', no: it.name || '', sub: xod ? (it.lavozim || '') : (it.inv ? 'inv. ' + it.inv : ''), st: '', ok: true, img: xod ? p8Img('#xodim-photo-preview img') : '',
                    main: p8Pairs('#item-passport-grid > div'), S: S, file: (xod ? 'Xodim_' : 'Pasport_') + String(it.name || it.id).replace(/[^\p{L}\d_-]+/gu, '_') };
            }
            return null;
        }
        var P8_CSS = `.p8{width:794px;height:1123px;padding:36px 40px 0;box-sizing:border-box;font-family:Roboto,'DejaVu Sans','Noto Sans',Arial,sans-serif;font-size:12px;line-height:1.28;position:relative;overflow:hidden}
.p8 *{box-sizing:border-box;margin:0;padding:0}
.p8 .hd{padding:9px 18px 10px;border-radius:10px;margin-bottom:8px}.p8 .org{font-size:10px;letter-spacing:.8px;font-weight:700}.p8 .hr{display:flex;justify-content:space-between;align-items:flex-end;margin-top:5px}
.p8 .tt{font-size:13px;font-weight:700;letter-spacing:2.5px}.p8 .no{font-size:29px;font-weight:800;line-height:1.08}.p8 .sb{font-size:12px}.p8 .st{text-align:right;font-weight:700;font-size:14px}.p8 .st small{display:block;font-weight:400;font-size:10px;margin-top:2px}
.p8 .hero{display:flex;gap:14px;align-items:center;padding:8px 12px;border-radius:10px;margin-bottom:8px}.p8 .hero .im{width:38%;flex:none}.p8 .hero .im img{width:100%;display:block}.p8 .hero .gr{flex:1}
.p8 .sec{margin-bottom:8px;padding:7px 12px 8px;border-radius:10px}.p8 h2{font-size:12.5px;margin-bottom:4px;display:flex;align-items:center;gap:7px}.p8 h2 i{font-style:normal;display:inline-flex;width:18px;height:18px;border-radius:50%;align-items:center;justify-content:center;font-size:10px}
.p8 .gr{display:flex;flex-wrap:wrap;column-gap:18px}.p8 .f{width:calc(50% - 9px);display:flex;flex-direction:column;padding:2px 0}.p8 .f.w{width:100%}.p8 .l{font-size:9.6px;text-transform:uppercase;letter-spacing:.4px}.p8 .v{font-size:12.6px}
.p8 table{width:100%;border-collapse:collapse;margin-top:3px}.p8 th,.p8 td{padding:3px 7px;text-align:left;font-size:11.4px;vertical-align:top}
.p8 .pk{display:flex;gap:10px}.p8 .pk div{flex:1;display:flex;flex-direction:column;border-radius:8px;padding:6px 9px}.p8 .pk b{font-size:15px}
.p8 .sg{display:flex;gap:40px;margin-top:14px;font-size:12px}.p8 .sg div{flex:1;display:flex;align-items:flex-end;gap:8px}.p8 .sg span{flex:1;border-bottom:1px solid #444;height:16px}
.p8 .ft{position:absolute;left:40px;right:40px;bottom:16px;display:flex;justify-content:space-between;font-size:9.4px}
.p8.c{background:#0b1324;color:#e8eefb}.p8.c .hd{background:linear-gradient(120deg,#13284f,#1d4ed8);border:1px solid #3b82f6}.p8.c .org{color:#93c5fd}.p8.c .tt{color:#bfdbfe}.p8.c .no{color:#fff}.p8.c .sb{color:#c7d6f3}
.p8.c .st{color:#4ade80}.p8.c .st.bad{color:#fb923c}.p8.c .st small{color:#a7f3d0}.p8.c .hero,.p8.c .sec{background:#111c34;border:1px solid #23365e}.p8.c h2{color:#7dd3fc}.p8.c h2 i{background:#1d4ed8;color:#fff}
.p8.c .l{color:#8ea3c8}.p8.c .v{color:#f1f5ff;font-weight:600}.p8.c th{background:#1b2c52;color:#bcd2fb;border-bottom:1px solid #2f4677}.p8.c td{border-bottom:1px solid #1f3058;color:#e3eafa}.p8.c td.kr{color:#fbbf24;font-weight:700}.p8.c td.dr{color:#38bdf8;font-weight:700}
.p8.c .pk div{background:#0d1830;border:1px solid #23365e}.p8.c .pk b{color:#fff}.p8.c .pk small{color:#8ea3c8}.p8.c .sg{color:#c7d6f3}.p8.c .sg span{border-color:#8ea3c8}.p8.c .ft{color:#8ea3c8}
.p8.b{background:#fff;color:#000}.p8.b .hd{border:1.5px solid #000;border-radius:0}.p8.b .hero,.p8.b .sec{border:1px solid #000;border-radius:0}.p8.b .hero .im img{filter:grayscale(1) contrast(1.1)}
.p8.b h2{border-bottom:1px solid #000;padding-bottom:3px}.p8.b h2 i{border:1px solid #000}.p8.b .l{font-weight:700;color:#000}.p8.b .v{font-weight:400;color:#000}.p8.b th{border:1px solid #000;font-weight:700}.p8.b td{border:1px solid #000}
.p8.b .pk div{border:1px solid #000}.p8.b .pk b{font-weight:400}.p8.b .ft{color:#000}`;
        function p8Grid(f: any[]): string { return '<div class="gr">' + f.map(([l, v]) => `<div class="f${String(v).length > 38 ? ' w' : ''}"><span class="l">${h8E(l)}</span><span class="v">${h8E(v)}</span></div>`).join('') + '</div>'; }
        /** bloklar (HTML qismlar) — sahifalarga taqsimlash uchun */
        function p8Blocks(D: any): any[] {
            const B: any[] = [];
            B.push({ h: `<div class="hd"><div class="org">«OLMALIQ KMK» AJ · SANOAT TEMIR YOʻL TRANSPORTI BOSHQARMASI</div><div class="hr"><div><div class="tt">${h8E(D.kind)}</div><div class="no">${h8E(D.no)}</div><div class="sb">${h8E(D.sub)}</div></div>${D.st ? `<div class="st${D.ok ? '' : ' bad'}">${h8E(D.st)}</div>` : ''}</div></div>` });
            B.push({ h: `<div class="hero">${D.img ? `<div class="im"><img src="${D.img}"/></div>` : ''}${p8Grid(D.main)}</div>` });
            D.S.forEach((s: any, i: number) => {
                const hd = `<h2><i>${i + 1}</i>${h8E(s.t)}</h2>`;
                if (s.f) B.push({ h: `<div class="sec">${hd}${p8Grid(s.f)}</div>` });
                else if (s.k) B.push({ h: `<div class="sec">${hd}<div class="pk">${s.k.map(([a, b, c]: any) => `<div><small>${h8E(a)}</small><b>${h8E(b)}</b>${c ? `<small>${h8E(c)}</small>` : ''}</div>`).join('')}</div></div>` });
                else if (s.tb) B.push({ tb: s.tb, hd: hd });
            });
            B.push({ h: `<div class="sg"><div>Tuzdi: <span></span></div><div>Tekshirdi: <span></span></div></div>` });
            return B;
        }
        function p8Th(tb: any): string { return '<tr><th>№</th>' + tb.h.map((x: string) => `<th>${h8E(x)}</th>`).join('') + '</tr>'; }
        function p8Tr(r: any[], n: number): string { return `<tr><td>${n}</td>` + r.map((x: string, j: number) => `<td${j === 1 ? (h8IsKR(x) ? ' class="kr"' : h8IsDR(x) ? ' class="dr"' : '') : ''}>${h8E(x)}</td>`).join('') + '</tr>'; }
        /** oʻlchab, A4 sahifalarga boʻlish (jadval qatorlari boʻyicha; sarlavha har sahifada takrorlanadi) */
        function p8Paginate(D: any, cls: string): string[] {
            const B = p8Blocks(D), host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden';
            host.innerHTML = `<style>${P8_CSS}</style><div class="p8 ${cls}" style="height:auto"></div>`; document.body.appendChild(host);
            const pg = host.querySelector('.p8') as any, LIM = 1123 - 36 - 46, pages: string[][] = [[]]; let used = 0;
            const meas = (h: string) => { pg.innerHTML = h; const e = pg.firstElementChild as any; const cs = getComputedStyle(e); return e.getBoundingClientRect().height + parseFloat(cs.marginBottom || '0'); };
            const add = (h: string, hh: number) => { if (used + hh > LIM && used > 0) { pages.push([]); used = 0; } pages[pages.length - 1].push(h); used += hh; };
            B.forEach(b => {
                if (!b.tb) { add(b.h, meas(b.h)); return; }
                const tb = b.tb, rows = tb.r.map((r: any[], i: number) => p8Tr(r, i + 1));
                const tab = (i: number, k: number) => `<div class="sec">${i === 0 ? b.hd : b.hd.replace('</h2>', ' <small>(davomi)</small></h2>')}<table>${p8Th(tb)}${rows.slice(i, k).join('')}</table></div>`;
                let i = 0;
                while (i < rows.length) {
                    const room = LIM - used; let k = i;
                    while (k < rows.length && meas(tab(i, k + 1)) <= room) k++;
                    if (k === i) { if (used > 0) { pages.push([]); used = 0; continue; } k = i + 1; } // boʻsh sahifaga ham sigʻmasa — bitta qator majburan
                    const h = tab(i, k); add(h, meas(h)); i = k;
                }
            });
            host.remove();
            return pages.map(p => p.join(''));
        }
        function p8Svg(inner: string, cls: string, n: number, N: number, foot: string): string {
            const d = document.createElement('div'); d.innerHTML = `<div class="p8 ${cls}"><style>${P8_CSS}</style>${inner}<div class="ft"><span>${h8E(foot)}</span><span>${n} / ${N} varaq</span></div></div>`;
            const x = new XMLSerializer().serializeToString(d.firstElementChild as any);
            return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123"><foreignObject width="100%" height="100%">${x}</foreignObject></svg>`;
        }
        async function p8Raster(svg: string): Promise<string> {
            const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await im.decode();
            const c = document.createElement('canvas'), k = 2; c.width = 794 * k; c.height = 1123 * k; const g = c.getContext('2d') as any; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.scale(k, k); g.drawImage(im, 0, 0);
            return c.toDataURL('image/jpeg', 0.9);
        }
        async function p8Make(mode: string): Promise<void> {
            H8.mdlClose('p8M'); const D = p8Collect(); if (!D) { H8.alert('Pasport ochiq emas.'); return; }
            const cls = mode === 'bw' ? 'b' : 'c', foot = 'AGMK STTB-AIT · ' + D.no + ' · tuzilgan: ' + h8Dmy(h8Today());
            try {
                const P = p8Paginate(D, cls), imgs: string[] = [];
                for (let i = 0; i < P.length; i++) imgs.push(await p8Raster(p8Svg(P[i], cls, i + 1, P.length, foot)));
                const W = 595.28, Hh = 841.89; H8.PDFK.f = null;
                const blob = H8.pdfBuild({ P: { W: W, H: Hh, L: 0, R: 0, T: 0, B: 0 }, pages: imgs.map(u => [{ k: 'img', x: 0, y: 0, w: W, h: Hh, data: H8.exB64U8(u), pw: 794 * 2, ph: 1123 * 2 }]) });
                try { if (H8.EXS) H8.EXS.set(blob, { imgs: imgs, title: D.kind + ' ' + D.no }); } catch (e) { /* */ }
                const f = { name: D.file + (mode === 'bw' ? '_rangsiz' : '_rangli') + '.pdf', mime: 'application/pdf', blob: blob };
                const title = D.kind.charAt(0) + D.kind.slice(1).toLowerCase() + ' — ' + D.no + (mode === 'bw' ? ' (rangsiz)' : ' (rangli)');
                if (typeof H8.exOpen === 'function') H8.exOpen([f], { title: title, act: 'dl' }); else H8.docDownload([f]);
                try { H8.aiLog('Pasport PDF: ' + D.no + ' · ' + mode + ' · ' + P.length + ' varaq'); } catch (e) { /* */ }
            } catch (e) { console.error(e); H8.alert('⚠️ PDF tayyorlab boʻlmadi: ' + ((e as any) && (e as any).message || e)); }
        }
        function p8Open(): void {
            H8.mdl('p8M', `<div class="px-h"><b>📄 Pasportni PDF qilib yuklash</b><button class="mini-btn" onclick="mdlClose('p8M')">✕</button></div>
                <div class="ms-big" onclick="p8Make('c')"><span>🎨</span><div><b>Rangli</b><small>ekrandagidek</small></div></div>
                <div class="ms-big" onclick="p8Make('bw')"><span>⬜</span><div><b>Rangsiz</b><small>pechat uchun — oq qogʻoz, qora matn</small></div></div>
                <div class="nd-tip">A4 · sigʻmasa taʼmir tarixi 2-varaqqa davom etadi.${(document.querySelector('.screen.active') || {} as any).id === 'screen-item-pasport' ? ' Xodimda oklad, telefon, manzil, tugʻilgan sana chiqmaydi.' : ''}</div>`);
        }
        function p8Btn(): void {
            try {
                const put = (host: any, id: string) => { if (!host || H8.$id(id)) return; const b = document.createElement('button'); b.id = id; b.className = 'p8-pb'; b.innerHTML = '📄 <span>PDF</span>'; b.title = 'Pasportni PDF qilib yuklash'; b.onclick = p8Open; const ed = host.querySelector('button'); host.insertBefore(b, ed); };
                const t1 = H8.$id('pasportMainTitle'); if (t1) put(t1.parentElement, 'p8PassB');
                const g = H8.$id('item-passport-grid'), t2 = g && g.parentElement ? g.parentElement.querySelector('.passport-title') : null; if (t2) put(t2, 'p8ItemB');
            } catch (e) { console.error(e); }
        }
        /** pasportda «Oxirgi taʼmir turi / sanasi» — vagonda DR va KR dan kechrogʻi (muallif qoidasi) */
        function h8LastFields(): void {
            try { const v = h8V(); if (!v || v.kind || typeof H8.agmkLastRep !== 'function') return; const lr = H8.agmkLastRep(v); if (lr.t !== 'KR') return;
                const t = H8.$id('p-tamir-turi'), d = H8.$id('p-tamir-sanasi'); if (t) t.textContent = 'Kapital taʼmir (KR)'; if (d) d.textContent = h8Dmy(lr.d); } catch (e) { /* */ }
        }
        if (typeof H8.openPassport === 'function') H8.openPassport = H8.agmkExtend('openPassport', 'v4.8: pasport PDF tugmasi, oxirgi taʼmir', H8.openPassport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); h8LastFields(); p8Btn(); return r; });
        if (typeof H8.openItemPasport === 'function') H8.openItemPasport = H8.agmkExtend('openItemPasport', 'v4.8: pasport PDF tugmasi', H8.openItemPasport, (o: Function) => function (this: unknown) { const r = o.apply(this, arguments); p8Btn(); return r; });

        (function () {
            const st = document.createElement('style');
            st.textContent = `.h8-b{background:rgba(56,189,248,.14);border:1px solid #38bdf8;color:#7dd3fc;border-radius:8px;font-size:12px;font-weight:700;padding:3px 9px;margin-left:6px;cursor:pointer;letter-spacing:0}.h8-b.h8-x{background:rgba(239,68,68,.14);border-color:#ef4444;color:#fca5a5;padding:3px 7px}
.h8-x1{font-size:11.5px;opacity:.85;margin-top:3px}.hs-src-pasp .hs-tag{background:#1e40af!important}.h8-f{display:flex;flex-direction:column;gap:8px}.h8-f .kq-l{display:flex;flex-direction:column;gap:4px;font-size:12px}.h8-row{display:flex;gap:8px}.h8-row>*{flex:1}.h8-ed{font-size:11.5px;opacity:.75}
.p8-pb{display:inline-flex;align-items:center;gap:5px;background:rgba(250,204,21,.12);border:1px solid #facc15;color:#fde047;border-radius:999px;font-size:14px;font-weight:700;padding:3px 12px;margin-left:auto;margin-right:8px;cursor:pointer}
#p8PassB+.qr-pb,#p8PassB~.qr-pb{margin-left:0}`;
            document.head.appendChild(st);
        })();

        // ---------- 3) ⏳ XIZMAT MUDDATI (texnik yechim) — eslatma ----------
        //  Firma diagnostikadan soʻng taʼmir uchun 6 oy muhlat beradi, texnik yechim taʼmirdan keyin kuchga kiradi →
        //  yangi texnik yechim uchun murojaat 9 oy oldin boshlanadi. Bosqichlar: 9 oy, 6 oy (oxirgi muhlat), 1 oy, tugagan.
        var H8_RU_M: any = { 'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'ма': 5, 'июн': 6, 'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12 };
        /** vagonning xizmat muddati tugash sanasi (ISO) — «30.04.2027», «2027-04-30», «сентябрь 2026г.», «09.2026»; tanilmasa '' */
        function h8Srok(v: any): string {
            const t = String((v && (v.srokYil || v.srok)) || '').trim(); if (!t) return ''; const iso = h8Iso(t); if (iso) return iso;
            const last = (y: number, m: number) => y + '-' + String(m).padStart(2, '0') + '-' + String(new Date(y, m, 0).getDate()).padStart(2, '0');
            let m = t.match(/^(\d{1,2})[./](\d{4})/); if (m) return last(+m[2], +m[1]);
            m = t.toLowerCase().match(/([а-я]+)\s*(\d{4})/); if (m) { const k = Object.keys(H8_RU_M).sort((a, b) => b.length - a.length).find(x => m![1].indexOf(x) === 0); if (k) return last(+m[2], H8_RU_M[k]); }
            return '';
        }
        function h8SrokLvl(left: number): number { return left < 0 ? 4 : left <= 31 ? 3 : left <= 183 ? 2 : left <= 274 ? 1 : 0; }
        function h8SrokList(): any[] {
            let A: any[] = []; try { A = H8.onlyVagons().filter((v: any) => !v.kind); } catch (e) { return []; }
            return A.map((v: any) => { const d = h8Srok(v); if (!d) return null; const left = H8.daysTo ? H8.daysTo(d) : Math.round((new Date(d + 'T00:00:00').getTime() - Date.now()) / 864e5); return { v: v, d: d, left: left, lvl: h8SrokLvl(left) }; })
                .filter((x: any) => x && x.lvl > 0).sort((a: any, b: any) => a.left - b.left);
        }
        function h8SrokNotify(): void {
            const me = H8.meTabel ? H8.meTabel() : ''; if (!me || typeof H8.notify !== 'function') return;
            let can = false; try { can = (typeof H8.p38Can === 'function' && H8.p38Can('tech_edit')) || H8.isAdmin(); } catch (e) { /* */ } if (!can) return;
            const L = h8SrokList(); if (!L.length) return;
            const sig = L.map(x => H8.vagonNo(x.v) + ':' + x.lvl).join(','), key = 'agmk_h8_srok_' + me;
            try { if (localStorage.getItem(key) === sig) return; } catch (e) { /* */ } // faqat bosqich oʻzgarganda (yangi vagon yoki keyingi bosqich)
            const T: any = { 4: '🔴 tugagan', 3: '🟠 1 oy ichida', 2: '🟡 6 oy ichida — oxirgi muhlat (firma taʼmirga 6 oy beradi)', 1: '🔵 9 oy ichida — firmaga murojaat vaqti' }, parts: string[] = [];
            [4, 3, 2, 1].forEach(l => { const g = L.filter(x => x.lvl === l); if (!g.length) return; parts.push(T[l] + ' — ' + g.length + ' ta: ' + g.slice(0, 6).map(x => '№ ' + H8.vagonNo(x.v) + (x.v.tr ? ' (TY № ' + x.v.tr + ')' : '') + ' ' + h8Dmy(x.d)).join(', ') + (g.length > 6 ? ' va yana ' + (g.length - 6) + ' ta' : '')); });
            H8.notify({ icon: '⏳', text: 'Vagonlar xizmat muddati (texnik yechim): ' + parts.join('. ') + '. Yangi texnik yechim olinsa — pasportda muddat va hujjat raqamini yangilang.', toTabel: me, byTabel: 'sys' });
            try { localStorage.setItem(key, sig); } catch (e) { /* */ }
        }
        try { if (typeof H8.SEC_EV !== 'undefined') H8.SEC_EV.fns.push(function h8SrokTick() { try { h8SrokNotify(); } catch (e) { console.error('4.8 xizmat muddati eslatmasi', e); } }); } catch (e) { /* */ }
