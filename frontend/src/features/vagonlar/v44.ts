        // =====================================================================
        // v4.4 — 🛤 PROBEG INTEGRATSIYASI: mashinist xodkasi → har vagon km, ruda tonnasi, pasport kartochkasi
        //  • Mashinist (lokomotiv smenasi) har xodkani kiritadi: manzil (⛏ KKD · 🟡 Nakpaysay · ⛰ boʻsh jins),
        //    soni (0,5 qadam: 1,5 — ikkinchisi yoʻl yarmida topshirildi), [ixtiyoriy] nakladnoy tonnasi.
        //    Yozuvda tarkibdagi vagonlar roʻyxati (oʻsha paytdagi) saqlanadi — keyin vagon uzilsa ham km toʻgʻri qoladi.
        //  • KM: smena GPS masofasi boʻlsa — GPS (xodkalarga meʼyor ulushida, boʻsh jinsga — qolgani);
        //    GPS yoʻq — xodka × 2 × yoʻnalish km (KKD ≈ 15,134; Nakpaysay ≈ 13,29). Boʻsh jins GPS siz — 0 (belgi bilan).
        //  • TONNA: nakladnoy boʻlsa — nakladnoy; yoʻq — (vagonlar yuk koʻtarishi + motor-dumpkarlar) × xodka (xira — hisob).
        //  • Vagon hisoblagichi: integratsiya boshlangan kungacha — meʼyoriy hisob, keyin — faqat haqiqiy xodkalar.
        //  • XODKA VA RUDA — FAQAT 2VS-105. Boshqa turlar (6VS-60, sisterna, platforma, xopper) xodka qilmaydi, ruda tashimaydi:
        //    ularning km — tortuvchi texnika (elektrovoz, teplovoz, motovoz, drezina …) naryadidan koʻchirma: smena davomida tarkibda turgan boʻlagidagi GPS masofasi
        //    (smenada tarkib oʻzgarsa — har boʻlak alohida: sm.seg = [{a, m, vag}], m — oʻsha paytdagi smena metri).
        //  • Maʼlumot serverda: m:xodka:<id> (records), DBeaver uchun oqish.xodkalar / oqish.vagon_xodka koʻrinishlari.
        // =====================================================================
        const XK: any = window as any;
        var XK_MZ: any = {
            kkd: { i: '⛏', t: 'Ruda → KKD (fabrika)', s: 'KKD', c: '#3b82f6' },
            nak: { i: '🟡', t: 'Balansdan tashqari ruda → Nakpaysay (zaxira)', s: 'Nakpaysay', c: '#eab308' },
            bosh: { i: '⛰', t: 'Boʻsh jins (vskrysha)', s: 'Boʻsh jins', c: '#94a3b8' },
            nar: { i: '🚂', t: 'Tortuvchi texnika naryadi (GPS)', s: 'Naryad', c: '#22c55e' }
        };
        var XK_GPS_MAX = 400; // bir smenada bundan koʻp GPS km — xato (sakrash) deb olinadi, meʼyor ishlatiladi
        /** vagonlarData / activeVagonId — let bilan eʼlon qilingan (window da yoʻq), shuning uchun toʻgʻridan-toʻgʻri */
        function xkVD(): any[] { return vagonlarData as any; }
        function xkAct(): any { return activeVagonId; }
        function xkS(): any { return XK.agmkStore('xodka'); }
        function xkSmS(): any { return XK.agmkStore('smena'); }
        function xkCfg(): any { return typeof XK.pgCfg === 'function' ? XK.pgCfg() : { kkdKm: 15.134, nakKm: 13.29, motorN: 2, motorT: 50, t: {} }; }
        function xkT(s: string): number { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN; }
        function xkISO(t: number): string { return new Date(t).toISOString().slice(0, 10); }
        function xkLocalISO(at?: string): string { const d = at ? new Date(at) : new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        function xkN(x: number, d?: number): string { return (+x || 0).toLocaleString('ru-RU', { maximumFractionDigits: d == null ? 0 : d }); }
        function xkSoni(x: number): string { return (+x || 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 }); }

        // ---------- kesh ----------
        var XKC: any = null;
        function xkReset(): void { XKC = null; }
        try { xkS().on(xkReset); xkSmS().on(xkReset); } catch (e) { /* */ }
        function xkRouteKm(mz: string): number { const C = xkCfg(); return mz === 'kkd' ? +C.kkdKm || 0 : mz === 'nak' ? +C.nakKm || 0 : 0; }
        /** tortuvchi texnika: lokomotiv (elektrovoz, teplovoz) yoki temir yoʻl texnikasi (motovoz, drezina, motrisa …) */
        function xkIsTr(v: any): boolean { try { return !!v && (v.kind === 'lok' || (typeof XK.onlyYol === 'function' && XK.onlyYol().includes(v))); } catch (e) { return false; } }
        /** naryad smenasi: tarkib biriktirilgan (lokomotiv yoki boshqa tortuvchi) */
        function xkSmTr(sm: any): boolean { return !!sm && (sm.kind === 'lok' || (sm.kind === 'yol' && !!sm.tarkibId)); }
        /** xodka va ruda hisobi qoʻllanadigan vagon — faqat 2VS-105 (Q-115 ham shu tur) */
        function xkIsXk(v: any): boolean { return !!v && /2VS-105/.test(String(v.type || '')); }
        function xkVagTn(id: any): number { try { const v = xkVD().find((x: any) => x.id === id); if (!v || !xkIsXk(v)) return 0; const T = XK.pgTy ? XK.pgTy(v) : { tn: 0 }; return +T.tn || 0; } catch (e) { return 0; } }
        /** bitta xodka (soni = 1) meʼyoriy yuki: vagonlar yuk koʻtarishi + motor-dumpkarlar */
        function xkTnNorm(r: any): number { const C = xkCfg(); return (r.vag || []).reduce((a: number, id: any) => a + xkVagTn(id), 0) + (+C.motorN || 0) * (+C.motorT || 0); }
        function xkBuild(): any {
            if (XKC) return XKC;
            const R = xkS().all().filter((r: any) => r && r.sana && +r.soni > 0), bySm: any = {}, C: any = { rows: R, km: new Map(), vag: new Map(), start: '', bySm: bySm };
            R.forEach((r: any) => { const k = r.smId || ('x' + r.id); (bySm[k] = bySm[k] || []).push(r); if (!C.start || r.sana < C.start) C.start = r.sana; });
            Object.keys(bySm).forEach(k => {
                const L = bySm[k], sm = L[0].smId ? xkSmS().get(L[0].smId) : null, G = sm && sm.end && +sm.m > 0 ? sm.m / 1000 : 0, gpsOk = G > 0 && G < XK_GPS_MAX;
                const norm = (r: any) => (+r.soni || 0) * 2 * xkRouteKm(r.mz), nb = L.filter((r: any) => r.mz !== 'bosh'), bo = L.filter((r: any) => r.mz === 'bosh');
                const nS = nb.reduce((a: number, r: any) => a + norm(r), 0);
                if (gpsOk) {
                    const sc = !nS ? 0 : bo.length ? Math.min(1, G / nS) : G / nS; let used = 0;
                    nb.forEach((r: any) => { const km = norm(r) * sc; used += km; C.km.set(r.id, { km: km, src: 'gps' }); });
                    const rest = Math.max(0, G - used), bx = bo.reduce((a: number, r: any) => a + (+r.soni || 0), 0) || 1;
                    bo.forEach((r: any) => C.km.set(r.id, { km: rest * (+r.soni || 0) / bx, src: 'gps' }));
                } else {
                    nb.forEach((r: any) => C.km.set(r.id, { km: norm(r), src: 'norm' }));
                    bo.forEach((r: any) => C.km.set(r.id, { km: 0, src: 'none' }));
                }
            });
            const VB: any = {}; xkVD().forEach((v: any) => { VB[v.id] = v; });
            const push = (id: any, o: any) => { let a = C.vag.get(id); if (!a) C.vag.set(id, a = []); a.push(o); };
            R.forEach((r: any) => { const k = C.km.get(r.id) || { km: 0 }, t = xkT(r.sana); (r.vag || []).forEach((id: any) => { if (xkIsXk(VB[id])) push(id, { t: t, km: k.km, r: r }); }); });
            // naryad koʻchirmasi (2VS-105 dan boshqa turlar): yopilgan lokomotiv smenalari boʻlaklari
            C.nStart = ''; C.nar = [];
            xkSmS().all().forEach((sm: any) => {
                if (!xkSmTr(sm) || !sm.end || !Array.isArray(sm.seg) || !sm.seg.length) return;
                const G = (+sm.m || 0) / 1000, d = xkLocalISO(sm.start); if (!C.nStart || d < C.nStart) C.nStart = d;
                const ok = G > 0 && G < XK_GPS_MAX; C.nar.push({ sm: sm, ok: ok, km: G });
                const S = sm.seg.slice().sort((x: any, y: any) => (+x.m || 0) - (+y.m || 0)), t = xkT(d);
                S.forEach((g: any, i: number) => {
                    const km = ok ? Math.max(0, ((i + 1 < S.length ? +S[i + 1].m : +sm.m) - (+g.m || 0)) / 1000) : 0; if (!(km > 0)) return;
                    const r = { id: 'n:' + sm.id + ':' + i, sana: d, at: g.a || sm.start, name: sm.name, lokName: sm.unitName, lokId: sm.unitId, mz: 'nar', soni: 0, smId: sm.id };
                    C.km.set(r.id, { km: km, src: 'gps' });
                    (g.vag || []).forEach((id: any) => { if (VB[id] && !xkIsXk(VB[id])) push(id, { t: t, km: km, r: r }); });
                });
            });
            C.vag.forEach((a: any[]) => a.sort((x, y) => x.t - y.t));
            XKC = C; return C;
        }
        function xkKm(r: any): any { return xkBuild().km.get(r.id) || { km: 0, src: 'none' }; }
        /** xodka tonnasi: {tn, src: 'n' nakladnoy | 'h' hisob | '-' boʻsh jins} */
        function xkTn(r: any): any { if (+r.tn > 0) return { tn: +r.tn, src: 'n' }; if (r.mz === 'bosh' || r.mz === 'nar') return { tn: 0, src: '-' }; return { tn: xkTnNorm(r) * (+r.soni || 0), src: 'h' }; }
        /** vagon km: iso dan bugungacha — {jami, fakt, hisob, n, start}; integratsiyagacha — meʼyor, keyin — xodkalar */
        function vgKmSince(v: any, iso: string): any {
            if (!v || !iso) return null; const a = xkT(iso), today = xkT(XK.todayISO()); if (isNaN(a)) return null;
            const C = xkBuild(), st = xkStart(v), I0 = st ? xkT(st) : today + 864e5, b = Math.min(I0, today + 864e5);
            let hisob = 0; if (b > a && typeof XK.pgRate === 'function') { const days = (b - a) / 864e5, rep = typeof XK.pgRep === 'function' ? XK.pgRep(v, a, b) : 0; hisob = Math.max(0, days - rep) * XK.pgRate(v); }
            let fakt = 0, n = 0; (C.vag.get(v.id) || []).forEach((x: any) => { if (x.t >= a) { fakt += x.km; n += x.r.mz === 'nar' ? 1 : +x.r.soni || 0; } });
            return { jami: hisob + fakt, fakt: fakt, hisob: hisob, n: n, start: st, nar: !xkIsXk(v) };
        }
        /** haqiqiy hisob boshlangan sana: 2VS-105 — birinchi xodka, boshqalar — birinchi naryad (boʻlakli smena) */
        function xkStart(v: any): string { const C = xkBuild(); return xkIsXk(v) ? C.start : C.nStart; }
        /** oylik / kunlik yigʻindi (salohiyat uchun) */
        function xkAgg(): any {
            const C = xkBuild(); if (C.agg) return C.agg; const M: any = {}, D: any = {};
            C.rows.forEach((r: any) => {
                const m = r.sana.slice(0, 7), T = xkTn(r), k = xkKm(r), o = M[m] = M[m] || { kkd: { x: 0, tn: 0, tnN: 0, xN: 0 }, nak: { x: 0, tn: 0, tnN: 0, xN: 0 }, bosh: { x: 0, km: 0 }, n: 0 };
                const z = o[r.mz] || o.kkd; z.x += +r.soni || 0; o.n++;
                if (r.mz === 'bosh') z.km += k.km; else { z.tn += T.tn; if (T.src === 'n') { z.tnN += T.tn; z.xN += +r.soni || 0; } const d = D[r.sana] = D[r.sana] || { kkd: 0, nak: 0 }; d[r.mz] += T.tn; }
            });
            C.agg = { m: M, d: D }; return C.agg;
        }

        // ---------- MASHINIST: xodka kiritish ----------
        var XKF: any = { mz: 'kkd', soni: 1, tn: '', edit: '' };
        function xkMine(sm: any): any[] { return sm ? xkS().all().filter((r: any) => r.smId === sm.id).sort((a: any, b: any) => String(a.at).localeCompare(String(b.at))) : []; }
        function xkCanEdit(r: any): boolean { try { if (XK.isAdmin() || XK.hasRole('dispetcher')) return true; return r.tabel === XK.meTabel() && Date.now() - new Date(r.at).getTime() < 36 * 36e5; } catch (e) { return false; } }
        function xkSmenaCard(sm: any): string {
            if (!sm || sm.kind !== 'lok') return ''; const E = XK.escapeHtml, L = xkMine(sm);
            const sum: any = { kkd: 0, nak: 0, bosh: 0 }; let tn = 0; L.forEach((r: any) => { sum[r.mz] = (sum[r.mz] || 0) + (+r.soni || 0); tn += xkTn(r).tn; });
            return `<div class="xk-card"><div class="xk-h"><b>📝 Xodkalar — shu smena</b><button onclick="xkAsk()">➕ Xodka kiritish</button></div>
                ${L.length ? `<div class="xk-sum">${Object.keys(XK_MZ).filter(k => sum[k]).map(k => `<span style="--c:${XK_MZ[k].c}">${XK_MZ[k].i} ${XK_MZ[k].s}: <b>${xkSoni(sum[k])}</b></span>`).join('')}${tn ? `<span>⚖️ <b>${xkN(tn)}</b> t</span>` : ''}</div>
                <div class="xk-l">${L.map((r: any) => { const T = xkTn(r); return `<div class="xk-r" onclick="xkAsk('${E(r.id)}')"><i style="background:${XK_MZ[r.mz].c}"></i><span>${XK.msHM ? XK.msHM(r.at) : ''} · ${XK_MZ[r.mz].i} ${E(XK_MZ[r.mz].s)} · <b>${xkSoni(r.soni)}</b> xodka</span><em>${T.src === 'n' ? '⚖️ ' + xkN(T.tn) + ' t' : T.src === 'h' ? '≈ ' + xkN(T.tn) + ' t' : ''} · ${(r.vag || []).length} vag.</em></div>`; }).join('')}</div>`
                    : '<div class="nd-tip">Har xodkadan keyin kiriting: manzil, soni (1,5 — ikkinchisi yoʻl yarmida topshirildi) va nakladnoy ogʻirligi. Shundan vagonlar probegi va ruda hisoboti oʻzi toʻladi.</div>'}</div>`;
        }
        function xkAsk(id?: string, after?: Function): void {
            const sm = typeof XK.mySmena === 'function' ? XK.mySmena() : null, r = id ? xkS().get(id) : null;
            if (!r && (!sm || sm.kind !== 'lok')) { XK.alert('Xodka — lokomotiv smenasida kiritiladi.'); return; }
            if (r && !xkCanEdit(r)) { XK.alert('Bu yozuvni faqat kiritgan mashinist (36 soat ichida) yoki dispetcher oʻzgartiradi.'); return; }
            const skip = XKF.skip; XKF = r ? { mz: r.mz, soni: +r.soni, tn: r.tn || '', edit: r.id } : { mz: XKF.mz || 'kkd', soni: 1, tn: '', edit: '' }; XKF.after = after || null; XKF.skip = skip; // after — faqat smenani topshirish eslatmasidan (oyna yopilsa — bekor)
            xkDraw();
        }
        function xkVags(): any[] {
            if (XKF.edit) { const r = xkS().get(XKF.edit); return r ? r.vag || [] : []; }
            try { const t = XK.msTarkib(XK.hrDB(), XK.mySmena()); return t ? t.vagonIds.slice() : []; } catch (e) { return []; }
        }
        function xkDraw(): void {
            const E = XK.escapeHtml, V = xkVags(), C = xkCfg(), est = (V.reduce((a: number, id: any) => a + xkVagTn(id), 0) + (+C.motorN || 0) * (+C.motorT || 0)) * XKF.soni;
            XK.mdl('xkM', `<div class="px-h"><b>📝 ${XKF.edit ? 'Xodkani tahrirlash' : 'Xodka kiritish'}</b><button class="mini-btn" onclick="mdlClose('xkM')">✕</button></div>
                <div class="xk-f"><label>MANZIL</label>${Object.keys(XK_MZ).map(k => `<button class="xk-mz${XKF.mz === k ? ' on' : ''}" style="--c:${XK_MZ[k].c}" onclick="XKF.mz='${k}'; xkDraw()">${XK_MZ[k].i} ${E(XK_MZ[k].t)}</button>`).join('')}</div>
                <div class="xk-f"><label>XODKA SONI (0,5 qadam)</label><div class="xk-st"><button onclick="XKF.soni=Math.max(0.5,XKF.soni-0.5); xkDraw()">−</button><b>${xkSoni(XKF.soni)}</b><button onclick="XKF.soni=Math.min(6,XKF.soni+0.5); xkDraw()">+</button></div><small>1,5 — ikkinchi xodka yoʻl yarmida keyingi smenaga topshirildi</small></div>
                ${XKF.mz === 'bosh' ? '<div class="nd-tip">Boʻsh jins — tonna kiritilmaydi; probeg smena GPS masofasidan olinadi.</div>'
                    : `<div class="xk-f"><label>NAKLADNOY (tarozi) OGʻIRLIGI, t — ${xkSoni(XKF.soni)} xodka jami</label><input id="xkTn" type="number" inputmode="decimal" step="1" placeholder="masalan ${xkN(1550 * XKF.soni)}" value="${E(String(XKF.tn || ''))}" oninput="XKF.tn=this.value"><small>Boʻsh qolsa — hisob: ${V.length} vagon + ${C.motorN} motor-dumpkar ≈ <b>${xkN(est)}</b> t</small></div>`}
                <div class="xk-f"><label>TARKIBDAGI VAGONLAR (${V.length})</label><div class="xk-vs">${V.map((id: any) => { const v = xkVD().find((x: any) => x.id === id); return v ? '№' + E(XK.vagonNo(v)) : ''; }).filter(Boolean).join(' · ') || '<em>Tarkibda vagon yoʻq — avval vagonlarni qoʻshing</em>'}</div></div>
                <div class="nv-btns">${XKF.edit ? `<button class="del" onclick="xkDel('${E(XKF.edit)}')">🗑 Oʻchirish</button>` : ''}<button onclick="xkSave()">💾 Saqlash</button></div>`);
        }
        function xkSave(): void {
            const sm = XK.mySmena ? XK.mySmena() : null, inp = XK.$id('xkTn'), tn = XKF.mz === 'bosh' ? 0 : +((inp && inp.value) || XKF.tn || 0);
            if (!(XKF.soni > 0) || XKF.soni % 0.5) { XK.alert('Xodka soni 0,5 qadam bilan'); return; }
            if (tn < 0 || !isFinite(tn) || tn > 6000 * XKF.soni) { XK.alert('Nakladnoy ogʻirligi notoʻgʻri'); return; }
            try {
                if (XKF.edit) {
                    const r = xkS().get(XKF.edit); if (!r || !xkCanEdit(r)) return;
                    const old = { mz: r.mz, soni: r.soni, tn: r.tn || 0 };
                    xkS().put(Object.assign({}, r, { mz: XKF.mz, soni: XKF.soni, tn: tn || 0, tz: (r.tz || []).concat([{ at: new Date().toISOString(), by: XK.authorStr ? XK.authorStr() : '', old: old }]).slice(-20) }));
                } else {
                    if (!sm || sm.kind !== 'lok') return; const V = xkVags(); if (!V.length && XKF.mz !== 'bosh' && !tn) { XK.alert('Tarkibda vagon yoʻq. Avval vagonlarni qoʻshing.'); return; }
                    let t: any = null; try { t = XK.msTarkib(XK.hrDB(), sm); } catch (e) { /* */ }
                    const now = new Date().toISOString();
                    xkS().put({ sana: xkLocalISO(now), at: now, smId: sm.id, tabel: sm.tabel, name: sm.name, lokId: sm.unitId, lokName: sm.unitName, tarkibId: t ? t.id : '', tarkibNo: t ? t.no : '', vag: V, mz: XKF.mz, soni: XKF.soni, tn: tn || 0 });
                }
            } catch (e: any) { XK.alert(e && e.message ? e.message : String(e)); return; }
            xkReset(); XK.mdlClose('xkM'); XK.showToast('✅ Xodka saqlandi'); try { if (typeof XK.mashRender === 'function' && XK.$id('screen-mash') && XK.$id('screen-mash').classList.contains('active')) XK.mashRender(); } catch (e) { /* */ }
            if (XKF.after) { const f = XKF.after; XKF.after = null; setTimeout(f, 300); }
        }
        async function xkDel(id: string): Promise<void> {
            const r = xkS().get(id); if (!r || !xkCanEdit(r)) return; if (!await XK.uiConfirm('Xodka yozuvi oʻchirilsinmi?')) return;
            xkS().del(id); xkReset(); XK.mdlClose('xkM'); XK.showToast('🗑 Oʻchirildi'); try { XK.mashRender(); } catch (e) { /* */ }
        }
        // Smena kartasi tagida — xodkalar; smenani topshirishda xodka kiritilmagan boʻlsa — eslatma
        if (typeof XK.mashSmenaHtml === 'function') XK.mashSmenaHtml = XK.agmkExtend('mashSmenaHtml', 'v4.4: xodka kiritish', XK.mashSmenaHtml, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const h = o.apply(this, a); try { const sm = XK.mySmena(); if (!sm || sm.kind !== 'lok') return h; const i = h.indexOf('<button class="ms-sos"'); const c = xkSmenaCard(sm); return i > 0 ? h.slice(0, i) + c + h.slice(i) : h + c; } catch (e) { return h; }
        });
        if (typeof XK.mashEnd === 'function') XK.mashEnd = XK.agmkExtend('mashEnd', 'v4.4: xodka eslatmasi', XK.mashEnd, (o: Function) => async function (this: unknown, ...a: unknown[]) {
            try {
                const sm = XK.mySmena(); if (sm && sm.kind === 'lok' && !xkMine(sm).length && !XKF.skip) {
                    if (await XK.uiConfirm('Bu smenada xodka kiritilmagan.\nHozir kiritasizmi? (vagonlar probegi va ruda hisoboti shundan olinadi)')) { xkAsk(undefined, () => { XKF.skip = true; Promise.resolve(XK.mashEnd()).finally(() => { XKF.skip = false; }); }); return; }
                }
            } catch (e) { /* */ }
            xkSegNote(); return o.apply(this, a);
        });

        // ---------- NARYAD BOʻLAKLARI: smenada tarkib oʻzgarsa — yangi boʻlak (oʻsha paytdagi GPS metri bilan) ----------
        function xkSegNote(): void {
            try {
                if (typeof XK.msTrackSave === 'function') XK.msTrackSave();
                const sm = XK.mySmena ? XK.mySmena() : null; if (!xkSmTr(sm) || sm.end) return;
                const t = XK.msTarkib(XK.hrDB(), sm), V = t ? t.vagonIds.slice().sort() : [], S = Array.isArray(sm.seg) ? sm.seg : [], last = S[S.length - 1];
                if (last && JSON.stringify((last.vag || []).slice().sort()) === JSON.stringify(V)) return;
                const m = Math.round(+sm.m || 0), g = { a: new Date().toISOString(), m: m, vag: V }, N = last && Math.abs((+last.m || 0) - m) < 50 ? S.slice(0, -1).concat([g]) : S.concat([g]); // masofa oʻzgarmagan boʻlsa — oxirgi boʻlak almashtiriladi
                xkSmS().put(Object.assign({}, sm, { seg: N.slice(-200) })); xkReset();
            } catch (e) { console.error('v4.4 naryad boʻlagi', e); }
        }
        /** temir yoʻl texnikasi (motovoz, drezina …) ham vagon tortadi — smenada unga ham tarkib ochiladi (lokomotiv kabi) */
        function xkYolTarkib(): void {
            try {
                const sm = XK.mySmena ? XK.mySmena() : null; if (!sm || sm.kind !== 'yol' || sm.tarkibId || sm.end) return;
                const d = XK.hrDB(), now = new Date().toISOString(); let t = d.tarkiblar.find((x: any) => x.lokId === sm.unitId);
                if (!t) { d.seq = (d.seq || 0) + 1; t = { id: 't' + Date.now().toString(36), no: String(d.seq), holat: 'kutish', lokId: sm.unitId, joy: (d.units[sm.unitId] || {}).joy || '', from: '', to: '', yuk: '', vagonIds: [] }; d.tarkiblar.push(t); }
                Object.assign(t, { mashinist: sm.name, updAt: now, updBy: XK.authorStr ? XK.authorStr() : '' }); XK.hrSave(d);
                xkSmS().put(Object.assign({}, sm, { tarkibId: t.id }));
            } catch (e) { console.error('v4.4 texnika tarkibi', e); }
        }
        ['mashTake', 'mashMut'].forEach(fn => {
            if (typeof XK[fn] !== 'function') return;
            XK[fn] = XK.agmkExtend(fn, 'v4.4: naryad boʻlagi', XK[fn], (o: Function) => function (this: unknown, ...a: unknown[]) {
                const r = o.apply(this, a), after = () => { if (fn === 'mashTake') { xkYolTarkib(); try { if (XK.mashRender) XK.mashRender(); } catch (e) { /* */ } } xkSegNote(); };
                if (r && typeof (r as any).then === 'function') return (r as any).then((x: any) => { after(); return x; }); after(); return r;
            });
        });


        // ---------- MASHINIST: tarkibga vagon biriktirish — 1) vagon turi, 2) vagon raqami → tarkib oynasi (poyezd koʻrinishi) ----------
        //  Har qanday tortuvchi (elektrovoz, teplovoz, motovoz, drezina …) smenasida. Saqlanganda naryad boʻlagi yoziladi (probeg).
        var XKT: any = { on: false, ty: '' };
        function xkHR(): any { return HR; }
        function xkTyList(): any[] { const C: any = {}; XK.onlyVagons().forEach((v: any) => { const t = String(v.type || 'Boshqa'); C[t] = (C[t] || 0) + 1; }); return Object.keys(C).sort((a, b) => C[b] - C[a]).map(t => [t, C[t]]); }
        function xkNumOpts(ty: string, curT: any): string {
            if (!ty) return '<option value="">— avval vagon turini tanlang —</option>';
            const E = XK.escapeHtml, d = XK.hrDB(), busy = xkWhere(d, curT ? curT.id : undefined), nm = (o: any) => 'tarkib №' + o.no + (o.lok ? ', ' + o.lok : '');
            const L = XK.onlyVagons().filter((v: any) => String(v.type || 'Boshqa') === ty).sort((a: any, b: any) => String(XK.vagonNo(a)).localeCompare(String(XK.vagonNo(b)), undefined, { numeric: true }));
            return `<option value="">— vagon raqamini tanlang (${L.length}) —</option>` + L.map((v: any) => { const rep = XK.hrInRepair(v), mine = curT && curT.vagonIds.includes(v.id); return `<option value="${v.id}"${rep || mine ? ' disabled' : ''}>№${E(XK.vagonNo(v))}${rep ? ' — 🔧 taʼmirda' : mine ? ' — ✅ tarkibingizda' : busy[v.id] ? ' — ' + E(nm(busy[v.id])) : v.status === "Ta'mir talab" ? ' — ⚠️ taʼmir talab' : ''}</option>`; }).join('');
        }
        function xkPickHtml(t: any): string {
            const E = XK.escapeHtml;
            return `<div class="xk-pick"><label>➕ VAGON BIRIKTIRISH</label>
                <select id="xkTy" onchange="XKT.ty=this.value; $id('xkNo').innerHTML=xkNumOpts(this.value, xkCurT())"><option value="">— vagon turini tanlang —</option>${xkTyList().map(([ty, n]) => `<option value="${E(ty)}"${XKT.ty === ty ? ' selected' : ''}>${E(ty)} (${n})</option>`).join('')}</select>
                <select id="xkNo" onchange="if(this.value) xkTarkibEdit(+this.value)">${xkNumOpts(XKT.ty, t)}</select>
                <input id="xkNoQ" inputmode="numeric" placeholder="🔍 yoki vagon raqamini yozing (masalan 8121)" oninput="xkNoFind(this.value)"><div class="xk-sug" id="xkNoL"></div>
                <button class="xk-tedit" onclick="xkTarkibEdit()">✏️ Tarkib vagonlari — roʻyxat va tartib</button></div>`;
        }
        /** raqam boʻyicha tezkor qidiruv — mos vagonlar katta tugmalar boʻlib chiqadi, bosilsa — tarkib oynasi */
        function xkNoFind(q: string): void {
            const box = XK.$id('xkNoL'); if (!box) return; q = String(q || '').trim().replace(/^0+/, ''); if (!q) { box.innerHTML = ''; return; }
            const E = XK.escapeHtml, t = xkCurT(), W = xkWhere(XK.hrDB(), t ? t.id : undefined), L = XK.onlyVagons().filter((v: any) => (!XKT.ty || String(v.type || 'Boshqa') === XKT.ty) && String(XK.vagonNo(v)).replace(/^0+/, '').includes(q)).slice(0, 12);
            box.innerHTML = L.map((v: any) => { const rep = XK.hrInRepair(v), mine = t && t.vagonIds.includes(v.id); const w = !rep && !mine ? W[v.id] : null; return `<button ${rep || mine ? 'disabled' : `onclick="xkTarkibEdit(${v.id})"`}>№${E(XK.vagonNo(v))}<small>${E(String(v.type || '').replace('Dumpkar ', ''))}${rep ? ' · 🔧 taʼmirda' : mine ? ' · ✅ sizda' : w ? ' · tarkib №' + E(w.no) + (w.lok ? ', ' + E(w.lok) : '') : ' · boʻsh'}</small></button>`; }).join('') || '<em>Topilmadi</em>';
        }
        function xkCurT(): any { try { return XK.msTarkib(XK.hrDB(), XK.mySmena()); } catch (e) { return null; } }
        /** tarkib oynasi (dispetcher oynasi kabi): poyezd koʻrinishi, tez qoʻshish, tanlanganlar, turi boʻyicha roʻyxat */
        function xkTarkibEdit(addId?: number): void {
            const sm = XK.mySmena ? XK.mySmena() : null, t = xkCurT(); if (!sm || !t) { XK.alert('Avval smenani qabul qiling.'); return; }
            const H = xkHR(), E = XK.escapeHtml; H.edit = t.id; H.sel = t.vagonIds.slice(); XKT.on = true;
            if (addId) { const v = xkVD().find((x: any) => x.id === addId); if (v && !XK.hrInRepair(v) && !H.sel.includes(addId)) H.sel.push(addId); }
            try { (window as any).HDE.sel = null; } catch (e) { /* */ }
            XK.$id('hrModalBody').innerHTML = `<h3>🚂 Tarkib №${E(t.no)} — ${E(sm.unitName)}</h3>
                <input type="hidden" id="hrTLok" value="${t.lokId || ''}">
                <div class="hr-f"><label>VAGON TURI</label><select id="xkTy2" onchange="XKT.ty=this.value; hrRenderPick()"><option value="">Barcha turlar</option>${xkTyList().map(([ty, n]) => `<option value="${E(ty)}"${XKT.ty === ty ? ' selected' : ''}>${E(ty)} (${n})</option>`).join('')}</select></div>
                <div class="hr-f"><label>VAGONLAR (<span id="hrSelN">${H.sel.length}</span> ta tanlandi)</label>
                  <div id="hdEdTrain" class="hd-edbox"></div><div class="hd-rng"><input id="hdRange" placeholder="Tez qoʻshish: 1201-1214, 1220" onkeydown="if(event.key==='Enter')hdEdRange()"><button onclick="hdEdRange()">➕</button></div>
                  <div class="hr-sel" id="hrSel"></div>
                  <input id="hrVQ" placeholder="🔍 Vagon raqami…" inputmode="numeric" oninput="hrRenderPick()" style="margin-top:6px;"><div class="hr-pick" id="hrPick"></div></div>
                <div class="hr-btns"><button class="action-btn" style="background:#475569" onclick="xkTarkibClose()">Bekor</button><button class="action-btn" onclick="xkTarkibSave()">💾 Saqlash</button></div>`;
            XK.hrRenderPick(); XK.$id('hrModal').classList.remove('hidden');
        }
        function xkTarkibClose(): void { XKT.on = false; XK.hrCloseModal(); }
        /** dispetcher roʻyxati oʻrniga — tur boʻyicha, taʼmirdagilar yopiq, boshqa tarkibdagi — «olinadi» */
        /** vagon qayerda: { no, lok, mash } — boshqa tarkibda boʻlsa (oʻzi tahrirlanayotgan tarkibdan tashqari) */
        function xkWhere(d: any, skipId?: string): any {
            const W: any = {}; d.tarkiblar.forEach((t: any) => { if (t.id === skipId) return; const L = t.lokId ? xkVD().find((x: any) => x.id === t.lokId) : null;
                const o = { no: t.no, lok: L ? (XK.hrName ? XK.hrName(L) : XK.vagonNo(L)) : '', mash: t.mashinist || '' }; t.vagonIds.forEach((id: any) => { W[id] = o; }); });
            return W;
        }
        function xkWhereTxt(o: any, E: Function): string { return o ? '🚂 Tarkib №' + E(o.no) + (o.lok ? ' · ' + E(o.lok) : '') + (o.mash ? ' · ' + E(o.mash) : '') : ''; }
        function xkPickList(disp?: boolean): void {
            const box = XK.$id('hrPick'); if (!box) return; const H = xkHR(), E = XK.escapeHtml, d = XK.hrDB(), q = String((XK.$id('hrVQ') || {}).value || '').trim();
            const busy = xkWhere(d, H.edit);
            const ty = disp ? '' : XKT.ty, L = XK.onlyVagons().filter((v: any) => (!ty || String(v.type || 'Boshqa') === ty) && (!q || (disp && q.split(/\s+/).every(w => (String(XK.vagonNo(v)) + ' ' + (v.inv || '') + ' ' + (v.type || '')).toLowerCase().includes(w.toLowerCase()))) || String(XK.vagonNo(v)).includes(q) || String(v.inv || '').includes(q))).sort((a: any, b: any) => String(XK.vagonNo(a)).localeCompare(String(XK.vagonNo(b)), undefined, { numeric: true })); // cheklovsiz — turdagi barcha vagonlar (2VS-105 — 699 ta)
            const nRep = L.filter((v: any) => XK.hrInRepair(v)).length, nBusy = L.filter((v: any) => !XK.hrInRepair(v) && busy[v.id]).length, nFree = L.length - nRep - nBusy;
            const dis = (v: any) => XK.hrInRepair(v);
            box.innerHTML = `<p class="xk-cnt">${ty ? E(ty) : 'Barcha turlar'}: <b>${L.length}</b> ta${q ? ' («' + E(q) + '» boʻyicha)' : ''} · boʻsh <b>${nFree}</b> · boshqa tarkibda <b>${nBusy}</b> (olsa boʻladi) · taʼmirda <b>${nRep}</b></p>` + L.map((v: any) => { const rep = dis(v), why = XK.hrInRepair(v) ? '🔧 taʼmirda' : busy[v.id] ? xkWhereTxt(busy[v.id], E) + (H.sel.includes(v.id) ? ' → sizga oʻtadi' : '') : v.status === "Ta'mir talab" ? '⚠️ taʼmir talab' : '';
                return `<div class="${rep ? 'dis' : ''}" onclick="${rep ? '' : 'hrTog(' + v.id + ')'}"><input type="checkbox" ${H.sel.includes(v.id) ? 'checked' : ''} ${rep ? 'disabled' : ''} style="width:auto; pointer-events:none;"> №${E(XK.vagonNo(v))} <small>${E(v.type || '')}${why ? '<br>' + why : ''}</small></div>`; }).join('') || '<div>Topilmadi</div>';
        }
        if (typeof XK.hrRenderPick === 'function') XK.hrRenderPick = XK.agmkExtend('hrRenderPick', 'v4.4: mashinist tarkib oynasi (tur boʻyicha); belgilaganda roʻyxat tepaga sakramaydi', XK.hrRenderPick, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const pk = XK.$id('hrPick'), st = pk ? pk.scrollTop : 0, q = String((XK.$id('hrVQ') || {}).value || ''), keep = XKT.lastQ === q; XKT.lastQ = q;
            const r = o.apply(this, a); try { if (XKT.on && XK.$id('xkTy2')) xkPickList(); else if (XK.$id('hrTNo') && XK.$id('hrPick')) xkPickList(true); } catch (e) { console.error(e); } // dispetcher oynasida ham — 60 ta cheklovsiz
            try { const p2 = XK.$id('hrPick'); if (p2 && keep) p2.scrollTop = st; const n = XK.$id('hrSelN'); if (n) { n.textContent = String(xkHR().sel.length); n.parentElement.classList.toggle('xk-has', xkHR().sel.length > 0); } } catch (e) { /* */ }
            return r; });
        function xkTarkibSave(): void {
            const H0 = xkHR(), t0 = xkCurT(); if (t0 && !H0.sel.length && !t0.vagonIds.length) { XK.alert('Hech bir vagon tanlanmadi.\nRoʻyxatdagi vagonni bosing — ✓ belgisi chiqadi va tepada poyezdga qoʻshiladi. Keyin «Saqlash».'); return; }
            if (t0 && JSON.stringify(t0.vagonIds) === JSON.stringify(H0.sel)) { XKT.on = false; XK.hrCloseModal(); XK.showToast('Oʻzgarish yoʻq'); return; }
            const H = xkHR(), sel = H.sel.filter((id: any) => { const v = xkVD().find((x: any) => x.id === id); return v && !XK.hrInRepair(v); });
            XK.mashMut((d: any, t: any) => {
                const old = t.vagonIds.slice(), add = sel.filter((id: any) => !old.includes(id)), del = old.filter((id: any) => !sel.includes(id));
                if (!add.length && !del.length && JSON.stringify(old) === JSON.stringify(sel)) return false;
                XKT.took = 0; add.forEach((id: any) => { const o = d.tarkiblar.find((x: any) => x !== t && x.vagonIds.includes(id)); if (o) { XKT.took++; const vv = xkVD().find((x: any) => x.id === id); XK.hrLog(d, `🔁 Vagon №${vv ? XK.vagonNo(vv) : id} tarkib №${o.no} dan tarkib №${t.no} ga olindi`, '🔁'); o.vagonIds = o.vagonIds.filter((i: any) => i !== id); o.updAt = new Date().toISOString(); o.updBy = XK.authorStr(); } delete d.units[id]; XK.dispEv(d, id, XK.dispTH(t.holat), t.joy, ''); });
                del.forEach((id: any) => { d.units[id] = { holat: 'kutish', joy: t.joy || '', izoh: '', sabab: '', updAt: new Date().toISOString(), since: new Date().toISOString(), by: XK.authorStr() }; XK.dispEv(d, id, 'kutish', t.joy, ''); });
                t.vagonIds = sel.slice();
                const nm = (L: any[]) => L.map((id: any) => { const v = xkVD().find((x: any) => x.id === id); return v ? '№' + XK.vagonNo(v) : id; }).slice(0, 12).join(', ') + (L.length > 12 ? ' …' : '');
                XK.hrLog(d, `🚃 Tarkib №${t.no} (${(XK.mySmena() || {}).name || ''}): ${add.length ? '+' + add.length + ' (' + nm(add) + ')' : ''}${add.length && del.length ? ', ' : ''}${del.length ? '−' + del.length + ' (' + nm(del) + ')' : ''}${!add.length && !del.length ? 'tartib oʻzgardi' : ''}`, '🔗');
            });
            XKT.on = false; XK.hrCloseModal(); XK.showToast('✅ Tarkib saqlandi: ' + sel.length + ' ta vagon' + (XKT.took ? ' · ' + XKT.took + ' tasi boshqa tarkibdan olindi' : '')); XKT.took = 0;
        }
        // dispetcher oynasida ham boshqa tarkibdagi vagonni olsa boʻladi: saqlashdan oldin u eski tarkibidan chiqariladi (jurnalga yoziladi)
        if (typeof XK.hrSaveTarkib === 'function') XK.hrSaveTarkib = XK.agmkExtend('hrSaveTarkib', 'v4.4: boshqa tarkibdagi vagonni olish', XK.hrSaveTarkib, (o: Function) => function (this: unknown, ...a: unknown[]) {
            try {
                const H = xkHR(), d = XK.hrDB(), no = String((XK.$id('hrTNo') || {}).value || '').trim(); let n = 0;
                // asl tekshiruvlar oʻtmasa — hech narsa koʻchirilmaydi (vagon «osilib» qolmasin)
                const hol = String((XK.$id('hrTHol') || {}).value || ''), lokId = +((XK.$id('hrTLok') || {}).value || 0) || null, joy = String((XK.$id('hrTJoy') || {}).value || ''), lok = lokId ? xkVD().find((x: any) => x.id === lokId) : null;
                const lokBusy = !!lokId && d.tarkiblar.some((t: any) => t.id !== H.edit && t.lokId === lokId);
                if (!no || !joy || d.tarkiblar.some((x: any) => x.no === no && x.id !== H.edit) || ((hol === 'yukli' || hol === 'yuksiz') && !lokId) || (hol === 'yukli' && !H.sel.length) || (lok && XK.hrInRepair(lok)) || lokBusy) return o.apply(this, a);
                d.tarkiblar.forEach((t: any) => { if (t.id === H.edit) return; const mv = t.vagonIds.filter((id: any) => H.sel.includes(id)); if (!mv.length) return; n += mv.length; t.vagonIds = t.vagonIds.filter((id: any) => !H.sel.includes(id)); t.updAt = new Date().toISOString(); t.updBy = XK.authorStr();
                    XK.hrLog(d, `🔁 ${mv.length} ta vagon tarkib №${t.no} dan tarkib №${no} ga olindi`, '🔁'); });
                if (n) XK.hrSave(d);
            } catch (e) { console.error(e); }
            return o.apply(this, a);
        });
        // smena oynasida eski «VAGON QOʻSHISH» qidiruvi oʻrniga — tur + raqam tanlovi
        if (typeof XK.mashSmenaHtml === 'function') XK.mashSmenaHtml = XK.agmkExtend('mashSmenaHtml', 'v4.4: vagon turi va raqami bilan biriktirish', XK.mashSmenaHtml, (o: Function) => function (this: unknown, ...a: unknown[]) {
            let h = o.apply(this, a); try { const i = h.indexOf('<div class="hr-f"><label>➕ VAGON QOʻSHISH'), j = h.indexOf('<div class="hr-pick" id="msVL"></div>'); if (i >= 0 && j > i) h = h.slice(0, i) + xkPickHtml(xkCurT()) + h.slice(j + '<div class="hr-pick" id="msVL"></div>'.length); } catch (e) { /* */ } return h;
        });


        // ---------- 📡 GPS XARITA: tarkib vagonlari oʻz lokomotivi orqasidan yuradi ----------
        //  Mashinist oʻziga biriktirgan vagonlar — lokomotiv GPS izidan (oxirgi nuqtalar) orqaga, haqiqiy uzunlik boʻyicha joylashadi.
        //  Iz yetmasa — oxirgi yoʻnalish boʻyicha davom ettiriladi (taxminiy). Kichik masshtabda — «+N vagon» belgisi.
        var XKH: any = {};  // tabel → [{lat, lon, t}] — lokomotiv izi (xaritani ochib turganda yigʻiladi)
        function xkLenM(u: any): number { try { const k = XK.hdKind(u); let m = (XK.GD_LEN_M || {})[k] || 14; if (k === 'dump' && /60/.test(String(u.type))) m = 12.5; return m; } catch (e) { return 14; } }
        function xkVagCol(v: any): string { try { return XK.msVC(v); } catch (e) { return '#64748b'; } }
        /** iz (eskidan → yangiga, oxirgisi — bosh) boʻyicha orqaga d metr: {ll, ang (daraja), est} */
        function xkBack(path: any[], d: number): any {
            let rest = d; for (let i = path.length - 1; i > 0; i--) { const a = path[i], b = path[i - 1], seg = a.distanceTo(b); if (seg <= 0.5) continue;
                if (rest <= seg) { const f = rest / seg; return { ll: XK.L.latLng(a.lat + (b.lat - a.lat) * f, a.lng + (b.lng - a.lng) * f), a: a, b: b, est: false }; } rest -= seg; }
            // iz tugadi — oxirgi yoʻnalishda davom (taxminiy)
            const n = path.length; if (n < 2) return null; let i = 1; while (i < n && path[n - 1].distanceTo(path[n - 1 - i]) < 3) i++; const h = path[n - 1], q = path[Math.max(0, n - 1 - i)], sg = Math.max(1, h.distanceTo(q)), k = d / sg;
            return { ll: XK.L.latLng(h.lat + (q.lat - h.lat) * k, h.lng + (q.lng - h.lng) * k), a: h, b: q, est: true };
        }
        function xkDrawTail(lay: any, t: any, path: any[], m: any): void {
            const L = XK.L, E = XK.escapeHtml, V = (t.vagonIds || []).map((id: any) => xkVD().find((x: any) => x.id === id)).filter(Boolean); if (!V.length || !path.length) return;
            const head = path[path.length - 1], z = m.getZoom();
            if (z < 16 || path.length < 2) { L.marker(head, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="xk-vbadge" onclick="gxFocus({kind:'real',tid:'${E(t.id)}'})">🚃 ${V.length} vagon${path.length < 2 ? '<small>yoʻnalish hali nomaʼlum</small>' : ''}</div>`, iconSize: [0, 0] }), zIndexOffset: 900, interactive: true }).addTo(lay); return; }
            const lok = t.lokId ? xkVD().find((x: any) => x.id === t.lokId) : null; let off = lok ? xkLenM(lok) : 18;
            const pxm = (() => { const a = m.latLngToContainerPoint(head), b = m.latLngToContainerPoint(L.latLng(head.lat + 0.0001, head.lng)); return Math.abs(a.y - b.y) / 11.1; })();
            V.forEach((v: any) => {
                const len = xkLenM(v), c = xkBack(path, off + len / 2); off += len + 1; if (!c) return;
                const pa = m.latLngToContainerPoint(c.a), pb = m.latLngToContainerPoint(c.b), ang = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI, w = Math.max(6, len * pxm), h = Math.max(4, Math.min(12, 3.2 * pxm));
                L.marker(c.ll, { icon: L.divIcon({ className: 'gd-ic', html: `<div class="xk-vg${c.est ? ' est' : ''}" style="width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;background:${xkVagCol(v)};transform:translate(-50%,-50%) rotate(${ang.toFixed(1)}deg)" title="№${E(XK.vagonNo(v))}" onclick="openPassport(${JSON.stringify(v.id)})">${w > 34 ? '<i>' + E(XK.vagonNo(v)) + '</i>' : ''}</div>`, iconSize: [0, 0] }), zIndexOffset: 800 }).addTo(lay);
            });
        }
        function xkTailsAll(): void {
            const G = (window as any).GD, m = G && G.map; if (!m || !G.on || typeof XK.L === 'undefined') return;
            if (!G.xkLay) G.xkLay = XK.L.layerGroup().addTo(m); G.xkLay.clearLayers();
            const d = XK.hrDB(), now = Date.now(), focusTid = (window as any).GX && (window as any).GX.f && (window as any).GX.f.kind === 'real' ? (window as any).GX.f.tid : null;
            (XK.MS && XK.MS.pos || []).forEach((p: any) => {
                const h = XKH[p.tabel] = XKH[p.tabel] || [], l = h[h.length - 1]; if (!l || l.lat !== p.lat || l.lon !== p.lon) h.push({ lat: p.lat, lon: p.lon, t: now - (p.ago || 0) * 1000 }); if (h.length > 400) h.shift();
                const sm = XK.msActive().find((s: any) => s.tabel === p.tabel); if (!sm || !sm.tarkibId) return; const t = d.tarkiblar.find((x: any) => x.id === sm.tarkibId); if (!t || t.id === focusTid) return;
                xkDrawTail(G.xkLay, t, h.map((q: any) => XK.L.latLng(q.lat, q.lon)), m);
            });
        }
        if (typeof XK.msMapDraw === 'function') XK.msMapDraw = XK.agmkExtend('msMapDraw', 'v4.4: tarkib vagonlari lokomotiv orqasidan', XK.msMapDraw, (o: Function) => function (this: unknown, ...a: unknown[]) { const r = o.apply(this, a); try { xkTailsAll(); } catch (e) { console.error('v4.4 vagonlar', e); } return r; });
        // tanlangan tarkib rejimi: kunlik GPS izi (serverdan) boʻyicha — aniqroq
        if (typeof XK.gxDrawFocus === 'function') XK.gxDrawFocus = XK.agmkExtend('gxDrawFocus', 'v4.4: tanlangan tarkib vagonlari', XK.gxDrawFocus, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const r = o.apply(this, a);
            try { const G = (window as any).GD, X = (window as any).GX, m = G && G.map; if (!m || !X || !X.f || X.f.kind !== 'real') return r; const t = XK.gxReal(); if (!t) return r; const g = XK.gxRealLL(t); if (!g || g.src !== 'gps') return r;
                const sm = XK.gxRealSm(t), mine = sm ? (XKH[sm.tabel] || []).map((q: any) => XK.L.latLng(q.lat, q.lon)) : [], trk = (X.trk || []).map((q: any) => XK.L.latLng(q[1], q[2]));
                const path = (trk.length >= mine.length ? trk : mine).concat([g.ll]); xkDrawTail(G.fxLay, t, path, m); } catch (e) { console.error('v4.4 vagonlar', e); }
            return r;
        });
        try { const G0 = (window as any).GD; if (G0) { const zf = () => { try { xkTailsAll(); if ((window as any).GX && (window as any).GX.f) XK.gxDrawFocus(false); } catch (e) { /* */ } }; const hook = () => { if (G0.map && !G0._xkZ) { G0._xkZ = 1; G0.map.on('zoomend', zf); } }; setInterval(hook, 3000); } } catch (e) { /* */ }
        /** vagon hozir qayerda: tarkib, lokomotiv, mashinist, GPS */
        function xkVagWhere(v: any): any {
            try { const d = XK.hrDB(), t = d.tarkiblar.find((x: any) => (x.vagonIds || []).includes(v.id)); if (!t) return null; const lok = t.lokId ? xkVD().find((x: any) => x.id === t.lokId) : null, sm = XK.gxRealSm ? XK.gxRealSm(t) : null, p = sm && XK.MS ? (XK.MS.pos || []).find((x: any) => x.tabel === sm.tabel) : null;
                return { t: t, lok: lok, sm: sm, p: p, n: t.vagonIds.indexOf(v.id) + 1 }; } catch (e) { return null; }
        }
        // ---------- PASPORT: 🛤 Probeg kartochkasi («Taʼmirga yuborish» tagida) ----------
        function xkLokSm(id: any): any[] { return xkSmS().all().filter((s: any) => s.unitId === id && xkSmTr(s)).sort((a: any, b: any) => String(b.start).localeCompare(String(a.start))); }
        function xkPassCard(v: any): string {
            if (!v) return ''; const E = XK.escapeHtml, iso30 = xkISO(xkT(XK.todayISO()) - 30 * 864e5);
            if (xkIsTr(v)) {
                const S = xkLokSm(v.id), km30 = S.filter((s: any) => String(s.start).slice(0, 10) >= iso30).reduce((a: number, s: any) => a + (+s.m || 0) / 1000, 0);
                const X = xkS().all().filter((r: any) => r.lokId === v.id && r.sana >= iso30), xs = X.reduce((a: number, r: any) => a + (+r.soni || 0), 0);
                return `<div class="xk-pc" onclick="vpgOpen(${JSON.stringify(v.id)})"><div class="xk-pch"><b>🛤 Probeg (GPS)</b><span>›</span></div><div class="xk-pk"><div><small>30 kun, GPS</small><b>${xkN(km30)}</b> km</div><div><small>Xodka (30 kun)</small><b>${xkSoni(xs)}</b></div><div><small>Smenalar</small><b>${S.length}</b></div></div></div>`;
            }
            if (typeof XK.pgCalc !== 'function') return '';
            const D = v.tamirSanasi ? vgKmSince(v, v.tamirSanasi) : null, K = v.kr ? vgKmSince(v, v.kr) : null, M = vgKmSince(v, iso30);
            const f = (o: any) => o ? `<b>${xkN(o.jami)}</b> km<em>${o.fakt > 0 ? 'haqiqiy ' + xkN(o.fakt) + (o.hisob > 0 ? ' + hisob ' + xkN(o.hisob) : '') : 'meʼyoriy hisob'}</em>` : '<em>sana yoʻq</em>';
            return `<div class="xk-pc" onclick="vpgOpen(${JSON.stringify(v.id)})"><div class="xk-pch"><b>🛤 Probeg</b><span>›</span></div><div class="xk-pk"><div><small>DR dan keyin (${E(XK.fmtISO ? XK.fmtISO(String(v.tamirSanasi || '').slice(0, 10)) : '')})</small>${f(D)}</div><div><small>KR dan keyin</small>${f(K)}</div><div><small>Oxirgi 30 kun</small>${M && M.fakt > 0 ? '<b>' + xkN(M.fakt) + '</b> km<em>' + (M.nar ? M.n + ' naryad' : xkSoni(M.n) + ' xodka') + '</em>' : '<b>—</b><em>' + (M && M.nar ? 'naryad yoʻq' : 'xodka kiritilmagan') + '</em>'}</div></div></div>`;
        }
        function xkPassPut(v: any): void {
            try {
                const old = XK.$id('xkPassCard'); if (old) old.remove(); if (!v) return;
                const btn = XK.$id('btn-mark-tamirda') || XK.$id('btn-restore-auto'), bar = btn && btn.parentElement; if (!bar) return;
                let h = xkPassCard(v); if (!h) return; const w = v.kind !== 'lok' ? xkVagWhere(v) : null, E = XK.escapeHtml;
                if (w) h = `<div class="xk-where" onclick="event.stopPropagation(); gdOpen().then(()=>setTimeout(()=>gxFocus({kind:'real',tid:'${E(w.t.id)}'}),500))"><b>📍 Tarkib №${E(w.t.no)}</b> · ${w.n}-vagon${w.lok ? ' · 🚂 ' + E(XK.hrName ? XK.hrName(w.lok) : '') : ''}${w.t.mashinist ? ' · 👤 ' + E(w.t.mashinist) : ''}<small>${w.p ? '📡 lokomotiv GPS bilan — xaritada koʻrish ›' : w.t.joy ? '🚉 ' + E(XK.hrPlace ? XK.hrPlace(w.t.joy) : '') + ' — xaritada koʻrish ›' : 'joyi kiritilmagan'}</small></div>` + h;
                const d = document.createElement('div'); d.id = 'xkPassCard'; d.innerHTML = h; bar.insertAdjacentElement('afterend', d);
            } catch (e) { console.error('v4.4 probeg kartasi', e); }
        }
        if (typeof XK.openPassport === 'function') XK.openPassport = XK.agmkExtend('openPassport', 'v4.4: probeg kartochkasi', XK.openPassport, (o: Function) => function (this: unknown, ...a: any[]) {
            const r = o.apply(this, a); try { const id = a[0] != null ? a[0] : xkAct(); xkPassPut(xkVD().find((x: any) => x.id === id) || xkVD().find((x: any) => x.id === xkAct())); } catch (e) { /* */ } return r;
        });

        // ---------- 🛤 PROBEG SAHIFASI (vagon yoki lokomotiv) ----------
        var VPG: any = { id: null };
        function vpgOpen(id: any): void {
            VPG.id = id; const v = xkVD().find((x: any) => x.id === id); if (!v) return;
            XK.secScreen('screen-vprobeg', 'Probeg', 'vpgBack()'); const s = XK.$id('screen-vprobeg'); const h2 = s && s.querySelector('.sec-title'); if (h2) h2.textContent = '🛤 Probeg — ' + (xkIsTr(v) ? (XK.hrName ? XK.hrName(v) : XK.vagonNo(v)) : '№ ' + XK.vagonNo(v));
            XK.openScreen('screen-vprobeg'); vpgDraw();
        }
        function vpgBack(): void { try { XK.openPassport(VPG.id); } catch (e) { XK.openScreen('screen-main'); } }
        /** oxirgi 12 oy: [{m, fakt, hisob, x}] */
        function vpgMonths(v: any): any[] {
            const t = XK.todayISO(), y = +t.slice(0, 4), mo = +t.slice(5, 7), out: any[] = [], C = xkBuild(), st0 = xkStart(v), I0 = st0 ? xkT(st0) : Infinity;
            for (let k = 11; k >= 0; k--) {
                const d = new Date(Date.UTC(y, mo - 1 - k, 1)), a = d.getTime(), e = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1), b = Math.min(e, xkT(t) + 864e5), m = xkISO(a).slice(0, 7);
                let fakt = 0, x = 0, hisob = 0;
                if (xkIsTr(v)) { xkLokSm(v.id).forEach((s: any) => { if (String(s.start).slice(0, 7) === m) fakt += (+s.m || 0) / 1000; }); xkS().all().forEach((r: any) => { if (r.lokId === v.id && r.sana.slice(0, 7) === m) x += +r.soni || 0; }); }
                else {
                    (C.vag.get(v.id) || []).forEach((q: any) => { if (q.t >= a && q.t < e) { fakt += q.km; x += +q.r.soni || 0; } });
                    const hb = Math.min(b, I0); if (hb > a && typeof XK.pgRate === 'function') hisob = Math.max(0, (hb - a) / 864e5 - (XK.pgRep ? XK.pgRep(v, a, hb) : 0)) * XK.pgRate(v);
                }
                out.push({ m: m, fakt: fakt, hisob: hisob, x: x });
            }
            return out;
        }
        function vpgRows(v: any): any[] {
            if (xkIsTr(v)) return xkLokSm(v.id).slice(0, 300).map((s: any) => ({ d: String(s.start).slice(0, 10), t: (XK.msHM ? XK.msHM(s.start) : '') + (s.end ? '–' + (XK.msHM ? XK.msHM(s.end) : '') : ' (davom etmoqda)'), who: s.name, km: (+s.m || 0) / 1000, x: xkS().all().filter((r: any) => r.smId === s.id).reduce((a: number, r: any) => a + (+r.soni || 0), 0), src: 'GPS' }));
            return (xkBuild().vag.get(v.id) || []).slice().reverse().slice(0, 300).map((q: any) => { const k = xkKm(q.r), T = xkTn(q.r); return { d: q.r.sana, t: (XK.msHM ? XK.msHM(q.r.at) : ''), who: q.r.name + (q.r.lokName ? ' · ' + q.r.lokName : ''), km: q.km, x: +q.r.soni || 0, mz: q.r.mz, src: k.src === 'gps' ? 'GPS' : k.src === 'norm' ? 'meʼyor' : 'GPS yoʻq', tn: T }; });
        }
        function vpgDraw(): void {
            const v = xkVD().find((x: any) => x.id === VPG.id), b = XK.secBody('screen-vprobeg'); if (!v || !b) return; const E = XK.escapeHtml, lok = xkIsTr(v);
            const M = vpgMonths(v), mx = Math.max(1, ...M.map(o => o.fakt + o.hisob)), R = vpgRows(v);
            const bars = M.map(o => { const hf = o.fakt / mx * 100, hh = o.hisob / mx * 100; return `<div class="vpg-b"><div class="vpg-c"><i class="h" style="height:${hh}%"></i><i class="f" style="height:${hf}%"></i></div><b>${o.fakt + o.hisob ? xkN((o.fakt + o.hisob) / 1000, 1) : ''}</b><small>${(XK.PG_MON || [])[+o.m.slice(5, 7) - 1] || o.m.slice(5)}</small></div>`; }).join('');
            let kpi = '';
            if (lok) { const t = M.reduce((a, o) => a + o.fakt, 0); kpi = `<div><small>12 oy, GPS</small><b>${xkN(t)}</b> km</div><div><small>Xodka (12 oy)</small><b>${xkSoni(M.reduce((a, o) => a + o.x, 0))}</b></div><div><small>Smenalar</small><b>${xkLokSm(v.id).length}</b></div>`; }
            else { const D = v.tamirSanasi ? vgKmSince(v, v.tamirSanasi) : null, K = v.kr ? vgKmSince(v, v.kr) : null, f = (o: any) => o ? `<b>${xkN(o.jami)}</b> km<em>haqiqiy ${xkN(o.fakt)} · hisob ${xkN(o.hisob)}</em>` : '<b>—</b><em>sana yoʻq</em>'; kpi = `<div><small>DR dan keyin</small>${f(D)}</div><div><small>KR dan keyin</small>${f(K)}</div><div><small>km/kun (meʼyor)</small><b>${XK.pgRate ? Math.round(XK.pgRate(v)) : '—'}</b></div>`; }
            const st = xkStart(v), nar = !lok && !xkIsXk(v);
            b.innerHTML = `<div class="pg vpg"><div class="sl-kpi">${kpi}</div>
                <div class="sl-card"><h3>Oylar boʻyicha, ming km — oxirgi 12 oy</h3><div class="vpg-ch">${bars}</div>
                  <div class="pg-lg in"><span><u style="background:#22c55e"></u>${lok ? 'GPS (smenalar)' : nar ? 'haqiqiy (tortuvchi naryadi)' : 'haqiqiy (xodkalar)'}</span>${lok ? '' : '<span><u style="background:#22c55e;opacity:.3"></u>meʼyoriy hisob (integratsiyagacha)</span>'}</div>
                  ${lok ? '' : nar ? `<p>Bu turdagi vagon xodka qilmaydi va ruda tashimaydi: haqiqiy km — tortuvchi texnikaga (elektrovoz, teplovoz, motovoz, drezina …) biriktirilgan vaqtdagi naryaddan koʻchirma (smena GPS masofasi, tarkibda turgan boʻlagi)${st ? ', ' + XK.fmtISO(st) + ' dan' : ''}. Undan oldin — meʼyor: ${XK.pgRate ? Math.round(XK.pgRate(v)) : ''} km/kun.</p>` : `<p>Haqiqiy km ${st ? XK.fmtISO(st) + ' dan' : 'mashinistlar xodka kirita boshlagach'} — tarkibdagi har vagonga yoziladi. Undan oldin — ${xkSoni(XK.pgTy ? XK.pgTy(v).x : 0)} xodka × ${XK.pgTy ? XK.pgTy(v).km : ''} km meʼyori.</p>`}</div>
                <div class="sl-card"><div class="sl-ch"><h3>${lok ? 'Smenalar' : nar ? 'Naryadlar' : 'Xodkalar'} (${R.length})</h3><button class="pg-c" onclick="vpgXls()">📊 Excel</button></div>
                  <table class="sl-t"><tr><th>Sana</th><th>${lok ? 'Mashinist' : 'Manzil'}</th><th>Xodka</th><th>km</th><th>${lok ? 'Manba' : 'Tonna'}</th></tr>${R.slice(0, 120).map(r => `<tr><td>${E(XK.fmtISO(r.d))}<small> ${E(r.t)}</small></td><td>${lok ? E(r.who) : (XK_MZ[r.mz] ? XK_MZ[r.mz].i + ' ' + E(XK_MZ[r.mz].s) : '') + '<br><small>' + E(r.who) + '</small>'}</td><td>${xkSoni(r.x)}</td><td><b>${xkN(r.km, 1)}</b>${lok ? '' : '<small> ' + E(r.src) + '</small>'}</td><td>${lok ? r.src : r.tn.src === 'n' ? '⚖️ ' + xkN(r.tn.tn) : r.tn.src === 'h' ? '≈ ' + xkN(r.tn.tn) : '—'}</td></tr>`).join('') || '<tr><td colspan="5">Hali yozuv yoʻq</td></tr>'}</table>
                  ${lok ? '' : '<p>⚖️ — nakladnoy (tarkib jami), ≈ — hisob. GPS — smena masofasi xodkalarga taqsimlangan; meʼyor — GPS boʻlmaganda xodka × 2 × yoʻnalish.</p>'}</div></div>`;
        }
        function vpgXls(): void {
            const v = xkVD().find((x: any) => x.id === VPG.id); if (!v) return; const lok = xkIsTr(v), R = vpgRows(v);
            const rows: any[] = [lok ? ['Sana', 'Vaqt', 'Mashinist', 'Xodka', 'GPS km'] : ['Sana', 'Vaqt', 'Manzil', 'Mashinist / lokomotiv', 'Xodka', 'km', 'Manba', 'Tonna (tarkib)', 'Tonna manbasi']];
            R.forEach(r => rows.push(lok ? [r.d, r.t, r.who, r.x, Math.round(r.km * 10) / 10] : [r.d, r.t, XK_MZ[r.mz] ? XK_MZ[r.mz].s : '', r.who, r.x, Math.round(r.km * 10) / 10, r.src, Math.round(r.tn.tn), r.tn.src === 'n' ? 'nakladnoy' : r.tn.src === 'h' ? 'hisob' : '']));
            XK.xlsxDl(rows, 'Probeg ' + (lok ? (XK.hrName ? XK.hrName(v) : XK.vagonNo(v)) : XK.vagonNo(v)));
        }

        // ---------- 🔎 ANIQLIK NAZORATI ----------
        function xkCheck(): any[] {
            const C = xkBuild(), out: any[] = [], now = Date.now(), E = XK.escapeHtml;
            // 1) vagon bir kunda ikki xil lokomotiv xodkasida (bir vaqtda 2 tarkibda)
            C.vag.forEach((L: any[], id: any) => { const byD: any = {}; L.forEach(q => { if (q.r.mz === 'nar') return; const k = q.r.sana; (byD[k] = byD[k] || new Set()).add(q.r.lokId); }); Object.keys(byD).forEach(d => { if (byD[d].size > 1) { const v = xkVD().find((x: any) => x.id === id); out.push({ k: 'w', t: `Vagon №${E(v ? XK.vagonNo(v) : id)} — ${XK.fmtISO(d)} da ${byD[d].size} ta lokomotiv xodkasida`, id: id }); } }); });
            // 2) kuniga > 150 km
            C.vag.forEach((L: any[], id: any) => { const byD: any = {}; L.forEach(q => { byD[q.r.sana] = (byD[q.r.sana] || 0) + q.km; }); Object.keys(byD).forEach(d => { if (byD[d] > 150) { const v = xkVD().find((x: any) => x.id === id); out.push({ k: 'w', t: `Vagon №${E(v ? XK.vagonNo(v) : id)} — ${XK.fmtISO(d)}: ${xkN(byD[d])} km (> 150)`, id: id }); } }); });
            // 3) yopilmagan smena > 16 soat
            xkSmS().all().filter((s: any) => !s.end && now - new Date(s.start).getTime() > 16 * 36e5).forEach((s: any) => out.push({ k: 'x', t: `Smena yopilmagan: ${E(s.name)} · ${E(s.unitName)} — ${XK.fmtISO(String(s.start).slice(0, 10))} dan` }));
            // 4) GPS siz boʻsh jins xodkasi (probeg 0)
            C.rows.filter((r: any) => r.mz === 'bosh' && xkKm(r).src === 'none').forEach((r: any) => out.push({ k: 'i', t: `Boʻsh jins xodkasi GPS siz: ${E(r.name)} · ${XK.fmtISO(r.sana)} — vagonlarga km yozilmadi` }));
            // 5) yopilgan lokomotiv smenasi — xodka kiritilmagan (oxirgi 30 kun)
            const iso30 = xkISO(xkT(XK.todayISO()) - 30 * 864e5);
            xkSmS().all().filter((s: any) => s.kind === 'lok' && s.end && String(s.start).slice(0, 10) >= iso30 && (+s.m || 0) > 2000 && !C.bySm[s.id] && (s.seg || []).some((g: any) => (g.vag || []).some((id: any) => xkIsXk(xkVD().find((x: any) => x.id === id))))).forEach((s: any) => out.push({ k: 'i', t: `Xodka kiritilmagan smena: ${E(s.name)} · ${E(s.unitName)} — ${XK.fmtISO(String(s.start).slice(0, 10))}, GPS ${xkN((+s.m || 0) / 1000)} km` }));
            // 6) naryad: GPS notoʻgʻri (0 yoki juda katta) — 6VS-60 va boshqalarga km yozilmadi
            (C.nar || []).filter((n: any) => !n.ok && String(n.sm.start).slice(0, 10) >= iso30).forEach((n: any) => out.push({ k: 'w', t: `Naryad GPS siz yoki notoʻgʻri (${xkN(n.km)} km): ${E(n.sm.name)} · ${E(n.sm.unitName)} — ${XK.fmtISO(String(n.sm.start).slice(0, 10))}; tarkibdagi 2VS-105 dan boshqa vagonlarga km yozilmadi` }));
            return out;
        }
        function xkCheckOpen(): void {
            const L = xkCheck(), ic: any = { x: '🔴', w: '⚠️', i: 'ℹ️' };
            XK.mdl('xkChk', `<div class="px-h"><b>🔎 Probeg aniqligi nazorati</b><button class="mini-btn" onclick="mdlClose('xkChk')">✕</button></div>
                <div class="nd-tip">Xodka yozuvlari va smenalar tekshiriladi: vagon bir kunda 2 lokomotiv xodkasida, kuniga 150 km dan koʻp, yopilmagan smena, GPS siz boʻsh jins, xodkasiz smena (2VS-105 tarkibi), GPS siz naryad.</div>
                ${L.length ? '<div class="xk-chk">' + L.slice(0, 200).map(x => `<div class="${x.k}"${x.id != null ? ` onclick="mdlClose('xkChk'); openPassport(${JSON.stringify(x.id)})"` : ''}>${ic[x.k]} ${x.t}</div>`).join('') + '</div>' : '<div class="hs-ok">✅ Muammo topilmadi</div>'}`, true);
        }


        // ---------- 🗺 TEMIR YOʻL SXEMASI: bir bosishda, foizli yuklab olish; xarita ochilganda oʻzi yuklanadi ----------
        var SXD: any = { busy: false, pct: 0, msg: '', err: '' };
        function sxdUi(): void {
            const t = XK.$id('sxdBox'); if (!t) return; const E = XK.escapeHtml;
            t.innerHTML = SXD.busy ? `<div class="sxd-bar"><i style="width:${SXD.pct}%"></i></div><div class="sxd-t">⏳ ${E(SXD.msg)} — ${SXD.pct}%</div>` : SXD.err ? `<div class="sxd-err">⚠️ ${SXD.err}</div>` : '';
            try { const m = XK.$id('lfYigMsg'); if (m && SXD.busy) m.innerHTML = `⏳ Temir yoʻl sxemasi yuklanmoqda — ${SXD.pct}%`; } catch (e) { /* */ }
        }
        async function sxdFetch(): Promise<Response> {
            const c = XK.syncCfg(), go = (s: any) => { const ac = new AbortController(); SXD.ac = ac; const tm = setTimeout(() => ac.abort(), 180000); return fetch(c.url.replace(/\/+$/, '') + '/api/pack/v1/sxema', { headers: { apikey: c.key, Authorization: 'Bearer ' + (s && s.access) }, signal: ac.signal }).finally(() => clearTimeout(tm)); };
            let r = await go(XK.syncGet(XK.SYNC_SES, null));
            if (r.status === 401 && typeof XK.sbRefresh === 'function' && await XK.sbRefresh()) r = await go(XK.syncGet(XK.SYNC_SES, null));
            return r;
        }
        async function sxdGo(quiet?: boolean): Promise<boolean> {
            if (SXD.busy) return false; SXD.err = '';
            if (!(typeof XK.srvOn === 'function' && XK.srvOn())) { SXD.err = 'Telefon korxona serveriga ulanmagan. Kirish oynasidagi <b>«📡 Serverga ulanish»</b> orqali ulaning (QR kod yoki manzil), tabel va parol bilan kiring — keyin shu tugmani qayta bosing.'; sxdUi(); if (!quiet) XK.alert('Sxema korxona serveridan yuklanadi. Avval «📡 Serverga ulanish» orqali ulaning va kiring.'); return false; }
            const s = XK.syncGet(XK.SYNC_SES, null); if (!s || !s.access) { SXD.err = 'Serverga tabel va parol bilan kirilmagan. Chiqib, qaytadan kiring — keyin qayta bosing.'; sxdUi(); return false; }
            SXD.busy = true; SXD.pct = 0; SXD.msg = 'Serverdan olinmoqda'; sxdUi();
            try {
                const r = await sxdFetch();
                if (!r.ok) { let t = ''; try { t = (await r.json()).message || ''; } catch (e) { /* */ }
                    throw new Error(r.status === 404 ? (t && t !== 'Topilmadi' ? t : 'Serverda sxema paketi topilmadi (company\\paketlar\\temir_yol_sxemasi.agmkpack).') : r.status === 401 || r.status === 403 ? 'Kirish muddati tugagan — ilovadan chiqib, qayta kiring.' : r.status === 429 ? 'Server band — 1 daqiqadan keyin qayta urinib koʻring.' : 'Server javobi: ' + r.status + (t ? ' — ' + t : '')); }
                const tot = +(r.headers.get('content-length') || 0) || 11953316, rd = r.body && r.body.getReader ? r.body.getReader() : null; let blob: Blob;
                if (rd) { const parts: any[] = []; let got = 0; for (;;) { const x = await rd.read(); if (x.done) break; parts.push(x.value); got += x.value.length; const p = Math.min(99, Math.floor(got / tot * 100)); if (p !== SXD.pct) { SXD.pct = p; sxdUi(); } } blob = new Blob(parts); }
                else blob = await r.blob();
                SXD.msg = 'Telefonga saqlanmoqda'; SXD.pct = 99; sxdUi();
                await XK.sxPackStore(blob, 'server');
                SXD.busy = false; SXD.pct = 100; sxdUi(); XK.showToast('✅ Temir yoʻl sxemasi yuklandi');
                try { XK.sxPackUi(); } catch (e) { /* */ }
                try { const Y = (window as any).YG; if (Y && Y.map && Y.base && typeof XK.ygSvgUrl === 'function') XK.ygSvgUrl('master', 'dark', false).then((u: string) => { Y.base.items[0].el.src = u; const m = XK.$id('lfYigMsg'); if (m) m.innerText = ''; try { XK.ygRefresh(); } catch (e) { /* */ } }); } catch (e) { /* */ }
                return true;
            } catch (e: any) {
                SXD.busy = false; const m = e && e.name === 'AbortError' ? 'Internet / Wi-Fi sekin — 3 daqiqada yuklanmadi. Korxona Wi-Fi siga ulanib, qayta bosing.' : /Failed to fetch|NetworkError|network/i.test(String(e && e.message)) ? 'Serverga yetib boʻlmadi — telefon korxona tarmogʻidami (Wi-Fi)? Server kompyuteri yoqilganmi?' : XK.escapeHtml(e && e.message ? e.message : String(e));
                SXD.err = m; sxdUi(); if (!quiet) XK.alert('⚠️ Yuklab boʻlmadi: ' + m.replace(/<[^>]+>/g, '')); return false;
            }
        }
        // Parametrlar → 🗺 Temir yoʻl sxemasi: yuklanmagan boʻlsa — ochilishi bilan yuklash boshlanadi
        if (typeof XK.sxPackOpen === 'function') XK.sxPackOpen = XK.agmkExtend('sxPackOpen', 'v4.4: sxema — bir bosishda, foiz bilan', XK.sxPackOpen, (o: Function) => function (this: unknown, ...a: unknown[]) {
            const r = o.apply(this, a);
            try { const c = document.querySelector('#sxPack .modal-content'); if (c && !XK.$id('sxdBox')) { const b = c.querySelector('button.action-btn'); const d = document.createElement('div'); d.id = 'sxdBox'; if (b) b.insertAdjacentElement('beforebegin', d); else c.appendChild(d); if (b) b.setAttribute('onclick', 'sxdGo()'); }
                sxdUi(); if (!XK.sxPackInfo() && !SXD.busy) sxdGo(true); } catch (e) { /* */ }
            return r;
        });
        XK.sxPackDownload = function () { return sxdGo(); };
        // xarita ochilganda: sxema yoʻq va server ulangan boʻlsa — oʻzi yuklab oladi
        if (typeof XK.ygInit === 'function') XK.ygInit = XK.agmkExtend('ygInit', 'v4.4: sxemani oʻzi yuklash', XK.ygInit, (o: Function) => async function (this: unknown, ...a: unknown[]) {
            const r = await o.apply(this, a); try { if (!XK.sxPackInfo() && !SXD.busy && typeof XK.srvOn === 'function' && XK.srvOn()) setTimeout(() => sxdGo(true), 300); } catch (e) { /* */ } return r;
        });
        // ---------- ⚙️ sahifa / kartochka sozlamasi (rang, shaffoflik, shrift) — 4.3/4.4 kartochkalariga ham ----------
        try { if (typeof XK.UI_CARDS === 'string' && XK.UI_CARDS.indexOf('.xk-card') < 0) { XK.UI_CARDS += ',.ms-card,.xk-card,.xk-pc,.sl-card,.sl-kpi>div,.pgr,.pg-ov,.pg-sec,.vgm-c'; setTimeout(() => { try { XK.uiApply(); } catch (e) { /* */ } }, 1500); } } catch (e) { /* */ }
        // ---------- uslub ----------
        (function () {
            const st = document.createElement('style'); st.id = 'v44-css';
            st.textContent = `
            .xk-card{margin:10px 0;padding:12px;border-radius:14px;background:rgba(15,23,42,.55);border:1px solid rgba(148,163,184,.25)}
            .xk-h{display:flex;align-items:center;justify-content:space-between;gap:8px}.xk-h b{font-size:15px}
            .xk-h button{padding:9px 12px;border-radius:10px;border:0;background:#2563eb;color:#fff;font-weight:700}
            .xk-sum{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.xk-sum span{padding:4px 8px;border-radius:8px;background:rgba(255,255,255,.06);border-left:3px solid var(--c,#64748b);font-size:13px}
            .xk-l .xk-r{display:flex;align-items:center;gap:8px;padding:7px 4px;border-top:1px solid rgba(148,163,184,.15);font-size:13px;cursor:pointer}
            .xk-r i{width:8px;height:8px;border-radius:50%;flex:none}.xk-r span{flex:1}.xk-r em{font-style:normal;color:#93a3c4;font-size:12px}
            .xk-f{margin:10px 0}.xk-f label{display:block;font-size:11px;letter-spacing:.04em;color:#93a3c4;margin-bottom:5px}.xk-f small{display:block;color:#93a3c4;margin-top:4px}
            .xk-f input{width:100%;padding:10px;border-radius:10px;font-size:16px}
            .xk-mz{display:block;width:100%;text-align:left;margin:4px 0;padding:10px;border-radius:10px;border:1px solid rgba(148,163,184,.3);background:transparent;color:inherit;border-left:4px solid var(--c)}
            .xk-mz.on{background:rgba(37,99,235,.18);border-color:var(--c);font-weight:700}
            .xk-st{display:flex;align-items:center;gap:14px}.xk-st button{width:46px;height:46px;border-radius:12px;font-size:22px;border:0;background:#334155;color:#fff}.xk-st b{font-size:24px;min-width:48px;text-align:center}
            .xk-vs{font-size:12px;line-height:1.6;color:#cbd5e1;max-height:90px;overflow:auto}
            .nv-btns .del{background:#7f1d1d!important}
            .xk-pc{margin:10px 0;padding:10px 12px;border-radius:14px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.35);cursor:pointer}
            .xk-pch{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.xk-pch span{font-size:20px;color:#86efac}
            .xk-pk{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.xk-pk small{display:block;font-size:10.5px;color:#93a3c4}.xk-pk b{font-size:16px}.xk-pk em{display:block;font-style:normal;font-size:10.5px;color:#93a3c4}
            .vpg-ch{display:flex;align-items:flex-end;gap:4px;height:150px;padding-top:14px}.vpg-b{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}
            .vpg-c{flex:1;width:100%;display:flex;flex-direction:column-reverse}.vpg-c i{display:block;width:100%}.vpg-c .f{background:#22c55e;border-radius:3px 3px 0 0}.vpg-c .h{background:rgba(34,197,94,.3)}
            .vpg-b b{font-size:10px;margin-top:2px}.vpg-b small{font-size:10px;color:#93a3c4}
            .xk-chk div{padding:8px;border-radius:8px;margin:4px 0;background:rgba(255,255,255,.04);font-size:13px;cursor:pointer}.xk-chk .x{border-left:3px solid #ef4444}.xk-chk .w{border-left:3px solid #facc15}.xk-chk .i{border-left:3px solid #64748b}
            .sl-mz td:first-child{white-space:nowrap}
            .xk-vg{position:absolute;border-radius:2px;border:1px solid rgba(0,0,0,.65);box-shadow:0 0 0 1px rgba(255,255,255,.25);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:hidden}.xk-vg.est{opacity:.55;border-style:dashed}.xk-vg i{font-style:normal;font-size:8px;font-weight:800;color:#fff;text-shadow:0 0 2px #000}.xk-vbadge{transform:translate(-50%,14px);white-space:nowrap;padding:3px 8px;border-radius:10px;background:rgba(180,83,9,.92);color:#fff;font-weight:800;font-size:12px;cursor:pointer}.xk-vbadge small{display:block;font-weight:400;font-size:10px}.xk-where{margin:10px 0;padding:10px 12px;border-radius:14px;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.4);cursor:pointer}.xk-where small{display:block;color:#7dd3fc;margin-top:3px}
            .sxd-bar{height:10px;border-radius:6px;background:#1e293b;overflow:hidden;margin:8px 0 4px}.sxd-bar i{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#4ade80);transition:width .2s}.sxd-t{font-size:13px;color:#cbd5e1}.sxd-err{margin:8px 0;padding:10px;border-radius:10px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);font-size:13px;line-height:1.45}
            .ms-sos:not(.small){display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;column-gap:12px;justify-content:center;align-items:center;padding:8px 14px;margin:10px 0;border-width:2px;border-radius:16px;box-shadow:0 4px 14px rgba(220,38,38,.35)}.ms-sos:not(.small) b{grid-row:1/3;font-size:26px!important}.ms-sos:not(.small) span{font-size:16px;letter-spacing:1.5px;text-align:left}.ms-sos:not(.small) small{font-size:11px;text-align:left}
            .xk-pick{margin:10px 0;display:grid;gap:8px}.xk-pick input{width:100%;padding:12px;border-radius:12px;font-size:15px}.xk-sug{display:flex;flex-wrap:wrap;gap:6px}.xk-sug button{padding:9px 12px;border-radius:10px;border:1px solid #2563eb;background:rgba(37,99,235,.15);color:inherit;font-weight:700;font-size:15px}.xk-sug button small{display:block;font-weight:400;font-size:11px;color:#93a3c4}.xk-sug button:disabled{opacity:.45}#hrModal .hr-pick{max-height:38vh}#hrModal .hr-btns{position:sticky;bottom:-1px;z-index:2;background:#0f172a;padding:8px 0 4px;margin-bottom:-4px}#hrModal .hr-pick div{padding:11px 10px;font-size:14px}#hrModal .hr-pick input[type=checkbox]{transform:scale(1.35)}#hrModal .hr-pick p.xk-cnt{margin:0;padding:8px 10px;font-size:12px;color:#93a3c4;position:sticky;top:0;background:#0f172a;z-index:1}.xk-has{color:#4ade80!important}.xk-pick label{font-size:11px;letter-spacing:.04em;color:#93a3c4}.xk-pick select{width:100%;padding:12px;border-radius:12px;font-size:15px}.xk-tedit{padding:11px;border-radius:12px;border:1px solid #2563eb;background:rgba(37,99,235,.15);color:inherit;font-weight:700}
            `;
            document.head.appendChild(st);
        })();
