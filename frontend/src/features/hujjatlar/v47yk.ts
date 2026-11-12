        // =====================================================================
        // v4.7 — 📥 YUKLASH: saralab yuklab olish (muallif tasdiqlagan dizayn, 23.10)
        //  Har bir boʻlim sarlavhasida «📥 Yuklash» tugmasi → 3 qadam:
        //   1) Guruh/tur ✅ (Hammasini tanlash)   2) Roʻyxat: guruh + holat filtri, raqam/oraliq qidiruvi, ✅ har biri / hammasi
        //   3) Ustunlar ✅ (tayyor toʻplamlar, tartibni ◀ ▶ bilan oʻzgartirish)  →  Excel (rangli sarlavha, filtr, qotirilgan qator) / PDF / Word
        //  Boʻlimlar: Vagonlar parki · Lokomotivlar · Avtotraktor parki · Yoʻl texnikasi · Ehtiyot qismlar · Xodimlar.
        //  Xodimlar: oklad, telefon, manzil, tugʻilgan sana — eksportga HECH QACHON chiqmaydi (xavfsizlik qoidasi 3).
        // =====================================================================
        const YK: any = window as any;
        var YKS: any = { cfg: null, ty: new Set(), sel: new Set(), g: '', st: '', q: '', cols: [], lim: 200 };

        function ykE(s: unknown): string { return YK.escapeHtml(String(s == null ? '' : s)); }
        function ykD(iso: unknown): string { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : String(iso || ''); }
        function ykToday(): string { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
        var YK_ST: any = { soz: ['🟢', 'Soz'], yq: ['🟡', 'Yaqin'], md: ['🔴', 'Muddati kelgan'], tm: ['🔧', 'Taʼmirda'] };
        function ykSt(v: any): string { const s = String((v && v.status) || ''); if (/tamirda/i.test(s)) return 'tm'; if (/talab/i.test(s)) return 'md'; if (/yaqin/i.test(s)) return 'yq'; return 'soz'; }
        function ykNo(v: any): string { try { return String(YK.vagonNo(v)); } catch (e) { return String(v.num || ''); } }

        // ---------- 4.8: hisoblanadigan ustunlar ----------
        /** Oxirgi taʼmir turi: vagonlarda DR va KR sanalaridan kechrogʻi; boshqa texnikada — kiritilgan tur */
        function ykLastT(v: any): string { try { if (!v.kind && typeof YK.agmkLastRep === 'function') { const t = YK.agmkLastRep(v).t; return t === 'KR' ? 'Kapital taʼmir (KR)' : t === 'DR' ? 'Depo taʼmiri (DR)' : ''; } } catch (e) { /* */ } return v.tamirTuri || ''; }
        /** Keyingi DR probeg boʻyicha — taʼmir grafigining oʻsha hisobi (v43 pgDueISO); km maʼlumoti yoʻq boʻlsa «—» */
        function ykPgDue(v: any): string { try { if (v.kind || typeof YK.pgDueISO !== 'function') return ''; return ykD(YK.pgDueISO(v)) || '—'; } catch (e) { return '—'; } }
        /** Muddat uzaytirish: «№ 1025 · 30.04.2027» (hujjat raqami va qachongacha) */
        function ykUzay(v: any): string { if (v.kind) return ''; const n = String(v.tr || '').trim(), d = ykD(v.srokYil || v.srok); return n ? '№ ' + n + (d ? ' · ' + d : '') : (d ? d : ''); }
        /** Manbadagi «+» / «-» / «ГАЖК» → soʻz bilan */
        function ykProd(v: any): string { const s = String(v.prodlen == null ? '' : v.prodlen).trim(); if (!s) return '—'; if (s === '+') return 'Ha'; if (s === '-' || s === '−') return 'Yoʻq'; if (/гажк/i.test(s)) return 'Ha (ГАЖК)'; return ykD(s); }

        // ---------- ustunlar (texnika) ----------
        function ykTechCols(avto: boolean): any[] {
            const yr = (v: any) => { const y = parseInt(String(v.yil || '').slice(0, 4), 10); return y > 1900 ? new Date().getFullYear() - y : ''; };
            const tarkib = (v: any) => { try { if (typeof YK.xkVagWhere !== 'function') return ''; const w = YK.xkVagWhere(v); return w ? 'Tarkib №' + (w.t.no || '') + (w.lok ? ', ' + ykNo(w.lok) : '') : ''; } catch (e) { return ''; } };
            return [
                { k: 'n', t: 'Tartib №', g: (_: any, i: number) => i + 1 },
                { k: 'no', t: avto ? 'Davlat raqami' : 'Raqami', g: (v: any) => avto ? (v.gos || ykNo(v)) : ykNo(v) },
                { k: 'inv', t: 'Inventar №', g: (v: any) => v.inv || '' },
                { k: 'ty', t: 'Turi', g: (v: any) => { try { return (!v.kind && typeof YK.vTypeFull === 'function' ? YK.vTypeFull(v) : '') || v.type || v.naim || ''; } catch (e) { return v.type || ''; } } },
                { k: 'naim', t: 'Nomi', g: (v: any) => v.naim || '' },
                { k: 'model', t: 'Model', g: (v: any) => v.model || '' },
                { k: 'maker', t: 'Ishlab chiqaruvchi', g: (v: any) => v.maker || '' },
                { k: 'yil', t: 'Chiqarilgan yili', g: (v: any) => v.yil || '' },
                { k: 'vvod', t: 'Ishga tushgan sana', g: (v: any) => ykD(v.vvod) },
                { k: 'yosh', t: 'Yoshi', g: yr },
                { k: 'seh', t: 'Seh', g: (v: any) => v.seh || '' },
                { k: 'primen', t: 'Qoʻllanilishi', g: (v: any) => v.primen || '' },
                { k: 'dr', t: 'Oxirgi DR', g: (v: any) => ykD(v.tamirSanasi || v.drTxt) },
                { k: 'kr', t: 'Oxirgi KR', g: (v: any) => ykD(v.krTxt || v.kr) },
                { k: 'next', t: 'Keyingi DR (grafik PPR)', g: (v: any) => ykD(v.keyingi) }, // 4.8: taʼmir grafigi bilan bir manba (v.keyingi)
                { k: 'nextkr', t: 'Keyingi KR', g: (v: any) => v.kind ? '' : (v.nextKr ? ykD(v.nextKr) : '—') }, // KR qoidasi kiritilgach toʻldiriladi
                { k: 'nextpg', t: 'Keyingi DR (probeg)', g: ykPgDue },
                { k: 'tt', t: 'Oxirgi taʼmir turi', g: ykLastT }, // 4.8: DR/KR — qaysi biri kechroq
                { k: 'kun', t: 'Qolgan kun', g: (v: any) => (v.kun === null || v.kun === undefined || v.kun === '') ? '' : v.kun },
                { k: 'st', t: 'Holati', g: (v: any) => YK_ST[ykSt(v)][1] },
                { k: 'prod', t: 'Muddat uzaytirilgan', g: ykProd },
                { k: 'srok', t: 'Xizmat muddati', g: (v: any) => ykD(v.srokYil || v.srok) },
                { k: 'uzay', t: 'Texnik yechim (№ · … gacha)', g: ykUzay }, // 4.8: muddat uzaytirish — hujjat raqami va muddati bitta ustunda
                { k: 'tarkib', t: 'Qaysi tarkibda', g: tarkib },
                { k: 'note', t: 'Izoh', g: (v: any) => v.note || '' }
            ];
        }
        var YK_PRE_T: any = { 'Kartoteka': ['n', 'no', 'inv', 'ty', 'model', 'seh', 'dr', 'kr', 'next', 'nextkr'], 'Taʼmir': ['n', 'no', 'inv', 'ty', 'dr', 'kr', 'next', 'nextkr', 'nextpg', 'tt', 'kun', 'st'], 'Pasport': ['n', 'no', 'inv', 'ty', 'naim', 'model', 'maker', 'yil', 'vvod', 'yosh', 'seh', 'srok', 'prod', 'uzay'] };

        // ---------- boʻlimlar ----------
        function ykTech(title: string, file: string, items: () => any[], grp: (v: any) => string, avto?: boolean): any {
            return { title: title, file: file, items: items, grp: grp, st: true, id: (v: any) => String(v.id), lbl: (v: any) => avto ? (v.gos || ykNo(v)) : '№ ' + ykNo(v), sub: (v: any) => avto ? (v.model || '') : (v.inv ? 'inv ' + v.inv : ''),
                no: (v: any) => avto ? String(v.gos || ykNo(v)) : ykNo(v), cols: ykTechCols(!!avto), pre: YK_PRE_T, def: 'Kartoteka' };
        }
        function ykVD(): any[] { try { return ((vagonlarData as any) || []) as any[]; } catch (e) { return []; } } // let — window da yoʻq
        var YK_CFG: any = {
            'screen-vagonlar': () => ykTech('Vagonlar parki', 'Vagonlar', () => YK.onlyVagons(), (v: any) => { try { return YK.vTypeFull(v) || v.type || 'Boshqa'; } catch (e) { return v.type || 'Boshqa'; } }),
            'screen-lok': () => ykTech('Lokomotivlar', 'Lokomotivlar', () => YK.onlyLoks(), (v: any) => { let el = false; try { el = YK.hdKind(v) === 'el'; } catch (e) { /* */ } return (el ? 'Elektrovoz' : 'Teplovoz') + (v.model ? ' · ' + v.model : ''); }),
            'screen-avto': () => ykTech('Avtotraktor parki', 'Avtotraktor_parki', () => ykVD().filter((v: any) => v.kind === 'avto'), (v: any) => v.type || 'Boshqa', true),
            'screen-yol': () => ykTech('Yoʻl texnikasi', 'Yol_texnikasi', () => ykVD().filter((v: any) => v.kind === 'yol'), (v: any) => v.type || 'Boshqa'),
            'screen-sp': () => ({ title: 'Ehtiyot qismlar', file: 'Ehtiyot_qismlar', st: false,
                items: () => { const out: any[] = []; try { ((SP_SETS as any) || []).forEach((s: any) => ((spItems as any)(s.id) || []).forEach((x: any) => out.push(Object.assign({ _set: s.title, _id: s.id + ':' + x.no }, x)))); } catch (e) { /* */ } return out; },
                grp: (x: any) => x._set, id: (x: any) => x._id, lbl: (x: any) => x.n, sub: (x: any) => (x.q || '') + ' ' + (x.u || ''), no: (x: any) => String(x.no || ''),
                cols: [{ k: 'n', t: 'Tartib №', g: (_: any, i: number) => i + 1 }, { k: 'no', t: 'Pozitsiya №', g: (x: any) => x.no }, { k: 'nm', t: 'Nomi', g: (x: any) => x.n }, { k: 'u', t: 'Oʻlchov birligi', g: (x: any) => x.u || '' }, { k: 'q', t: 'Meʼyor (miqdor)', g: (x: any) => x.q || '' }, { k: 'alt', t: 'Muqobil', g: (x: any) => (x.alt || []).map((a: any) => a.n + (a.q ? ' — ' + a.q + ' ' + (a.u || '') : '')).join('; ') }, { k: 'set', t: 'Meʼyor toʻplami', g: (x: any) => x._set }],
                pre: { 'Asosiy': ['n', 'no', 'nm', 'u', 'q'], 'Toʻliq': ['n', 'no', 'nm', 'u', 'q', 'alt', 'set'] }, def: 'Asosiy' }),
            'screen-xt': () => ({ title: 'Xodimlar', file: 'Xodimlar', st: false,
                items: () => { try { return YK.allXodims().map((r: any) => r.item).filter((it: any) => it && it.name); } catch (e) { return []; } },
                grp: (it: any) => { try { const p = it.posNo ? (posByNo as any)(it.posNo) : null; return p ? (posPath as any)(p, true).split(' › ')[0] : 'Biriktirilmagan'; } catch (e) { return 'Biriktirilmagan'; } },
                id: (it: any) => String(it.id || it.tabel || it.name), lbl: (it: any) => it.name, sub: (it: any) => (it.tabel ? 'tabel ' + it.tabel : '') + (it.lavozim ? ' · ' + it.lavozim : ''), no: (it: any) => String(it.tabel || ''),
                // DIQQAT: oklad / telefon / manzil / tugʻilgan sana — ataylab yoʻq
                cols: [{ k: 'n', t: 'Tartib №', g: (_: any, i: number) => i + 1 }, { k: 'tab', t: 'Tabel №', g: (it: any) => it.tabel || '' }, { k: 'fio', t: 'F.I.Sh.', g: (it: any) => it.name }, { k: 'lav', t: 'Lavozimi', g: (it: any) => it.lavozim || '' },
                    { k: 'bol', t: 'Boʻlinma', g: (it: any) => { try { const p = it.posNo ? (posByNo as any)(it.posNo) : null; return p ? (posPath as any)(p, false) : ''; } catch (e) { return ''; } } }, { k: 'raz', t: 'Razryad', g: (it: any) => it.razryad || '' }, { k: 'sta', t: 'Stansiya', g: (it: any) => it.stansiya || '' }],
                pre: { 'Roʻyxat': ['n', 'tab', 'fio', 'lav', 'bol'], 'Toʻliq': ['n', 'tab', 'fio', 'lav', 'bol', 'raz', 'sta'] }, def: 'Roʻyxat' })
        };

        // ---------- holat ----------
        function ykAll(): any[] { return YKS.cfg ? YKS.cfg.items() : []; }
        function ykInTy(x: any): boolean { return YKS.ty.has(YKS.cfg.grp(x)); }
        function ykMatchQ(x: any): boolean {
            const q = String(YKS.q || '').trim(); if (!q) return true; const C = YKS.cfg, no = C.no(x).replace(/^0+/, ''), n = parseInt(no, 10), txt = (C.lbl(x) + ' ' + C.sub(x)).toLowerCase();
            return q.split(/[,;\s]+/).filter(Boolean).some(p => { const m = p.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m && isFinite(n)) return n >= +m[1] && n <= +m[2]; if (/^\d+$/.test(p)) return no === p.replace(/^0+/, '') || no.includes(p); return txt.includes(p.toLowerCase()); });
        }
        function ykList(): any[] { const C = YKS.cfg; return ykAll().filter(x => ykInTy(x) && (!YKS.g || C.grp(x) === YKS.g) && (!YKS.st || !C.st || ykSt(x) === YKS.st) && ykMatchQ(x)); }
        function ykOut(): any[] { const C = YKS.cfg; return ykAll().filter(x => ykInTy(x) && YKS.sel.has(C.id(x))); }

        function ykOpen(sid?: string): void {
            const id = sid || ((document.querySelector('.screen.active') || {}) as any).id, mk = YK_CFG[id]; if (!mk) return;
            const C = mk(); YKS.cfg = C; YKS.sid = id; const A = C.items();
            YKS.ty = new Set(A.map((x: any) => C.grp(x))); YKS.sel = new Set(A.map((x: any) => C.id(x))); YKS.g = ''; YKS.st = ''; YKS.q = ''; YKS.lim = 200;
            YKS.cols = ykSaved(id, C) || (C.pre[C.def] || C.cols.map((c: any) => c.k)).slice();
            YK.mdl('ykM', `<div class="px-h"><b>📥 Yuklash — ${ykE(C.title)}</b><button class="mini-btn" onclick="mdlClose('ykM')">✕</button></div><div id="ykB"></div>`, true);
            ykDraw();
        }
        function ykDraw(): void {
            const b = YK.$id('ykB'); if (!b || !YKS.cfg) return; const C = YKS.cfg, A = ykAll(), cnt: any = {}; A.forEach((x: any) => { const g = C.grp(x); cnt[g] = (cnt[g] || 0) + 1; });
            const G = Object.keys(cnt).sort(), tyAll = G.every(g => YKS.ty.has(g));
            // 1 — turlar
            let h = `<div class="yk-c"><div class="yk-h"><i>1</i><b>${C.st ? 'Turlar' : 'Guruhlar'}</b><small>${G.filter(g => YKS.ty.has(g)).length} / ${G.length} tanlandi</small></div>
                <div class="yk-all" onclick="ykTyAll()"><span class="yk-cb${tyAll ? ' on' : ''}">${tyAll ? '✓' : ''}</span>Hammasini tanlash<em>${A.length}</em></div>
                ${G.map((g, i) => `<div class="yk-r" onclick="ykTy(${i})"><span class="yk-cb${YKS.ty.has(g) ? ' on' : ''}">${YKS.ty.has(g) ? '✓' : ''}</span>${ykE(g)}<em>${cnt[g]}</em></div>`).join('')}</div>`;
            // 2 — roʻyxat
            const TG = G.filter(g => YKS.ty.has(g)), inTy = A.filter((x: any) => YKS.ty.has(C.grp(x))), base = inTy.filter((x: any) => !YKS.g || C.grp(x) === YKS.g), L = ykList();
            const stc: any = {}; base.forEach((x: any) => { const s = ykSt(x); stc[s] = (stc[s] || 0) + 1; });
            const selN = inTy.filter((x: any) => YKS.sel.has(C.id(x))).length, allOn = L.length > 0 && L.every((x: any) => YKS.sel.has(C.id(x)));
            h += `<div class="yk-c"><div class="yk-h"><i>2</i><b>Roʻyxat</b><small>${selN} / ${inTy.length} tanlandi</small></div>
                <div class="yk-l">${C.st ? 'Guruh' : 'Guruh'}</div><div class="yk-chips"><span class="yk-chip${!YKS.g ? ' a' : ''}" onclick="ykG(-1)">Tanlanganlar ${inTy.length}</span>${TG.map(g => `<span class="yk-chip${YKS.g === g ? ' a' : ''}" onclick="ykG(${G.indexOf(g)})">${ykE(g)} ${cnt[g]}</span>`).join('')}</div>
                ${C.st ? `<div class="yk-l">Holati</div><div class="yk-chips"><span class="yk-chip${!YKS.st ? ' a' : ''}" onclick="ykS('')">Barchasi ${base.length}</span>${Object.keys(YK_ST).map(k => `<span class="yk-chip${YKS.st === k ? ' a' : ''}" onclick="ykS('${k}')">${YK_ST[k][0]} ${YK_ST[k][1]} ${stc[k] || 0}</span>`).join('')}</div>` : ''}
                <input class="yk-q" id="ykQ" placeholder="🔍 ${C.st ? 'Raqam yoki oraliq: 8100-8199, 9171' : 'Qidirish: nomi, raqami…'}" value="${ykE(YKS.q)}" oninput="ykQ(this.value)">
                <div class="yk-all" onclick="ykSelAll()"><span class="yk-cb${allOn ? ' on' : ''}">${allOn ? '✓' : ''}</span>Hammasini tanlash<em>${L.length} ta</em></div>
                <div id="ykRows">${L.slice(0, YKS.lim).map((x: any) => { const on = YKS.sel.has(C.id(x)), s = C.st ? YK_ST[ykSt(x)] : null; return `<div class="yk-r" data-id="${ykE(C.id(x))}" onclick="ykOne(this)"><span class="yk-cb${on ? ' on' : ''}">${on ? '✓' : ''}</span><b>${ykE(C.lbl(x))}</b><span class="yk-sub">${ykE(C.sub(x))}</span>${s ? `<em>${s[0]} ${s[1]}</em>` : ''}</div>`; }).join('')}</div>
                ${L.length > YKS.lim ? `<div class="yk-more" onclick="ykMore()">… yana ${L.length - YKS.lim} ta — koʻrsatish</div>` : ''}
                <div class="yk-tip">Guruh yoki holat almashtirilganda belgilanganlar saqlanib qoladi.</div></div>`;
            // 3 — ustunlar
            const P = Object.keys(C.pre), same = (a: string[], b: string[]) => a.length === b.length && a.every((k, i) => k === b[i]);
            h += `<div class="yk-c"><div class="yk-h"><i>3</i><b>Ustunlar</b><small>${YKS.cols.length} / ${C.cols.length} tanlandi</small></div>
                <div class="yk-pre">${P.map(p => `<span class="${same(YKS.cols, C.pre[p]) ? 'a' : ''}" onclick="ykPre('${ykE(p)}')">${ykE(p)}</span>`).join('')}<span class="${YKS.cols.length === C.cols.length ? 'a' : ''}" onclick="ykPre('*')">☑ Hammasi</span></div>
                <div class="yk-grid">${C.cols.map((c: any) => { const on = YKS.cols.includes(c.k); return `<div class="yk-r" onclick="ykCol('${c.k}')"><span class="yk-cb${on ? ' on' : ''}">${on ? '✓' : ''}</span>${ykE(c.t)}</div>`; }).join('')}</div>
                <div class="yk-l">Ustunlar tartibi — ≡ ni ushlab suring yoki ⬆ ⬇ <span class="yk-std" onclick="ykStd()">↺ Standart tartib</span></div><div class="yk-ord" id="ykOrd">${YKS.cols.map((k: string, i: number) => { const c = C.cols.find((x: any) => x.k === k); return `<div class="yk-o" data-i="${i}"><b>${i + 1}</b><span>${ykE(c ? c.t : k)}</span><a onclick="ykMv(${i},-1)"${i ? '' : ' class="off"'}>⬆</a><a onclick="ykMv(${i},1)"${i < YKS.cols.length - 1 ? '' : ' class="off"'}>⬇</a><em class="yk-dh" onpointerdown="ykDrag(event,${i})">≡</em></div>`; }).join('')}</div>
                <div class="nd-tip">Tanlagan tartibingiz eslab qolinadi. Yangi belgilangan ustun oʻz joyiga (masalan, Oxirgi DR → Oxirgi KR → Keyingi DR → Keyingi KR) qoʻyiladi.</div></div>`;
            // natija
            const O = ykOut(), R = ykRows(O.slice(0, 3));
            h += `<div class="yk-c"><div class="yk-sum">📊 <b>${O.length} ta</b> · <b>${YKS.cols.length} ustun</b></div>
                <div class="yk-fmt"><button class="x" onclick="ykGo('xlsx')">📗 Excel</button><button class="p" onclick="ykGo('pdf')">📕 PDF</button><button class="w" onclick="ykGo('docx')">📘 Word</button></div>
                ${O.length ? `<div class="yk-pv"><table><tr>${R[0].map((t: any) => `<th>${ykE(t)}</th>`).join('')}</tr>${R.slice(1).map((r: any[]) => `<tr>${r.map(v => `<td>${ykE(v)}</td>`).join('')}</tr>`).join('')}</table></div><div class="yk-tip" style="text-align:center">Namuna koʻrinishi — fayl shu shaklda chiqadi</div>` : '<div class="yk-tip">Hech narsa tanlanmagan.</div>'}</div>`;
            b.innerHTML = h;
        }
        function ykRows(O: any[]): any[][] { const C = YKS.cfg, cs = YKS.cols.map((k: string) => C.cols.find((c: any) => c.k === k)).filter(Boolean); return [cs.map((c: any) => c.t)].concat(O.map((x, i) => cs.map((c: any) => { const v = c.g(x, i); return v == null ? '' : v; }))); }
        function ykGroups(): string[] { const C = YKS.cfg; return Array.from(new Set(ykAll().map((x: any) => C.grp(x)))).sort() as string[]; }
        function ykTy(i: number): void { const g = ykGroups()[i]; if (g === undefined) return; if (YKS.ty.has(g)) YKS.ty.delete(g); else YKS.ty.add(g); if (YKS.g && !YKS.ty.has(YKS.g)) YKS.g = ''; ykDraw(); }
        function ykTyAll(): void { const G = ykGroups(), all = G.every(g => YKS.ty.has(g)); YKS.ty = new Set(all ? [] : G); YKS.g = ''; ykDraw(); }
        function ykG(i: number): void { YKS.g = i < 0 ? '' : ykGroups()[i] || ''; YKS.lim = 200; ykDraw(); }
        function ykS(k: string): void { YKS.st = k; YKS.lim = 200; ykDraw(); }
        var YK_QT: any = 0;
        function ykQ(v: string): void { YKS.q = v; clearTimeout(YK_QT); YK_QT = setTimeout(() => { ykDraw(); const q = YK.$id('ykQ'); if (q) { q.focus(); try { q.setSelectionRange(q.value.length, q.value.length); } catch (e) { /* */ } } }, 300); }
        function ykSelAll(): void { const C = YKS.cfg, L = ykList(), all = L.length > 0 && L.every((x: any) => YKS.sel.has(C.id(x))); L.forEach((x: any) => { if (all) YKS.sel.delete(C.id(x)); else YKS.sel.add(C.id(x)); }); ykDraw(); }
        function ykOne(el: any): void { const id = el.getAttribute('data-id'); if (YKS.sel.has(id)) YKS.sel.delete(id); else YKS.sel.add(id); const sc = (YK.$id('ykB') || {}).parentElement; const t = sc ? sc.scrollTop : 0; ykDraw(); if (sc) sc.scrollTop = t; }
        function ykMore(): void { YKS.lim += 400; ykDraw(); }
        // 4.8: tanlangan ustunlar tartibi eslab qolinadi (shu qurilmada); yangi ustun standart oʻrniga qoʻyiladi; ≡ bilan sudrab koʻchirish
        function ykSaved(id: string, C: any): string[] | null { try { const a = JSON.parse(localStorage.getItem('agmk_yk_cols_' + id) || 'null'); const ks = C.cols.map((c: any) => c.k); return Array.isArray(a) && a.length ? a.filter((k: string) => ks.includes(k)) : null; } catch (e) { return null; } }
        function ykKeep(): void { try { localStorage.setItem('agmk_yk_cols_' + YKS.sid, JSON.stringify(YKS.cols)); } catch (e) { /* */ } }
        function ykPre(p: string): void { const C = YKS.cfg; YKS.cols = p === '*' ? C.cols.map((c: any) => c.k) : (C.pre[p] || []).slice(); ykKeep(); ykDraw(); }
        function ykCol(k: string): void {
            const i = YKS.cols.indexOf(k); if (i >= 0) { YKS.cols.splice(i, 1); ykKeep(); ykDraw(); return; }
            const ks = YKS.cfg.cols.map((c: any) => c.k), ci = ks.indexOf(k); let at = 0; // standart tartibdagi oʻzidan oldingi eng yaqin tanlangan ustundan keyin
            YKS.cols.forEach((x: string, j: number) => { if (ks.indexOf(x) < ci) at = j + 1; });
            YKS.cols.splice(at, 0, k); ykKeep(); ykDraw();
        }
        function ykStd(): void { const ks = YKS.cfg.cols.map((c: any) => c.k); YKS.cols.sort((a: string, b: string) => ks.indexOf(a) - ks.indexOf(b)); ykKeep(); ykDraw(); }
        function ykMv(i: number, d: number): void { const j = i + d; if (j < 0 || j >= YKS.cols.length) return; const t = YKS.cols[i]; YKS.cols[i] = YKS.cols[j]; YKS.cols[j] = t; ykKeep(); ykDraw(); }
        function ykDrag(ev: any, i: number): void {
            const box = YK.$id('ykOrd'); if (!box) return; ev.preventDefault(); const rows = Array.from(box.querySelectorAll('.yk-o')) as any[], me = rows[i]; let to = i;
            me.classList.add('drag');
            const mv = (e: any) => { const y = e.clientY; to = rows.length - 1; for (let k = 0; k < rows.length; k++) { const r = rows[k].getBoundingClientRect(); if (y < r.top + r.height / 2) { to = k > i ? k - 1 : k; break; } }
                rows.forEach((r, k) => r.classList.toggle('tgt', k === to && k !== i));
                const sc = box.closest('.modal-content'); if (sc) { const R = sc.getBoundingClientRect(); if (y < R.top + 40) sc.scrollTop -= 12; else if (y > R.bottom - 40) sc.scrollTop += 12; } };
            const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
                if (to !== i) { const k = YKS.cols.splice(i, 1)[0]; YKS.cols.splice(to, 0, k); ykKeep(); } ykDraw(); };
            document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
        }

        // ---------- fayllar ----------
        function ykColL(i: number): string { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
        function ykXlsx(rows: any[][], title: string, sheet: string): Blob {
            const X = (s: unknown) => YK.xmlEsc(s), n = Math.max(1, rows[0].length), wid: number[] = [];
            rows.forEach(r => r.forEach((v, i) => { wid[i] = Math.min(50, Math.max(wid[i] || 8, String(v == null ? '' : v).length + 3)); }));
            const cell = (v: any, ref: string, st: number) => (typeof v === 'number' && isFinite(v)) ? `<c r="${ref}" s="${st}"><v>${v}</v></c>` : `<c r="${ref}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${X(v)}</t></is></c>`;
            const hr = 3, last = ykColL(n - 1);
            // 4.9 b111: Tartib № va raqam/inventar ustunlari markazda — qoʻshni kataklar «18121» boʻlib qoʻshilib koʻrinmasin
            const ykMid = rows[0].map(h => /№|raqam|inventar/i.test(String(h == null ? '' : h)));
            if (/tartib|^№$/i.test(String(rows[0][0]))) wid[0] = Math.max(wid[0] || 8, 9);
            let data = `<row r="1" ht="22" customHeight="1">${cell(title, 'A1', 3)}</row><row r="2">${cell('Tuzilgan sana: ' + ykD(ykToday()) + ' · ' + (rows.length - 1) + ' ta qator · AGMK-STTB PTO', 'A2', 4)}</row>`;
            rows.forEach((r, ri) => { const R = ri + hr; data += `<row r="${R}"${ri === 0 ? ' ht="30" customHeight="1"' : ''}>` + r.map((v, ci) => cell(v, ykColL(ci) + R, ri === 0 ? 1 : (ykMid[ci] || typeof v === 'number') ? 5 : 2)).join('') + '</row>'; });
            const ws = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${hr}" topLeftCell="A${hr + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${wid.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${data}</sheetData><autoFilter ref="A${hr}:${last}${hr + rows.length - 1}"/><mergeCells count="2"><mergeCell ref="A1:${last}1"/><mergeCell ref="A2:${last}2"/></mergeCells><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
            const bd = '<border><left style="thin"><color rgb="FF9AAFC7"/></left><right style="thin"><color rgb="FF9AAFC7"/></right><top style="thin"><color rgb="FF9AAFC7"/></top><bottom style="thin"><color rgb="FF9AAFC7"/></bottom><diagonal/></border>';
            const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><color rgb="FF1E3A5F"/><name val="Times New Roman"/></font><font><b/><sz val="14"/><name val="Times New Roman"/></font><font><i/><sz val="10"/><color rgb="FF475569"/><name val="Times New Roman"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9E7F7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${bd}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="6"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
            const sh = X(String(sheet || 'Roʻyxat').slice(0, 31).replace(/[\\/?*[\]:]/g, ' '));
            return YK.zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
                { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sh}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${sh}'!$A$${hr}:$${last}$${hr + rows.length - 1}</definedName></definedNames></workbook>` },
                { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
                { name: 'xl/worksheets/sheet1.xml', data: ws }, { name: 'xl/styles.xml', data: styles }
            ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        }
        function ykHtml(rows: any[][], title: string): string {
            return `<h3 style="text-align:center">${ykE(title)}</h3><p style="text-align:center"><i>Tuzilgan sana: ${ykD(ykToday())} · ${rows.length - 1} ta qator</i></p><table style="width:100%;border-collapse:collapse"><tr>${rows[0].map(t => `<th style="background:#d9e7f7;border:1px solid #9aafc7">${ykE(t)}</th>`).join('')}</tr>${rows.slice(1).map(r => `<tr>${r.map(v => `<td style="border:1px solid #9aafc7">${ykE(v)}</td>`).join('')}</tr>`).join('')}</table>`;
        }
        function ykGo(kind: string): void {
            const C = YKS.cfg, O = ykOut(); if (!O.length) { YK.alert('Hech narsa tanlanmagan.'); return; } if (!YKS.cols.length) { YK.alert('Kamida bitta ustunni belgilang.'); return; }
            const rows = ykRows(O), tys = ykGroups().filter(g => YKS.ty.has(g)), title = C.title + (tys.length && tys.length < ykGroups().length ? ' — ' + tys.join(', ') : '') + ' (' + O.length + ' ta)';
            const base = (C.file + '_' + ykToday()).replace(/[^\p{L}\d_-]+/gu, '_'); let f: any;
            try {
                if (kind === 'xlsx') f = { name: base + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: ykXlsx(rows, title, C.title) };
                else { const h = '<div>' + ykHtml(rows, title) + '</div>'; f = kind === 'pdf' ? { name: base + '.pdf', mime: 'application/pdf', blob: YK.pdfBlobFromHtml(h) } : { name: base + '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', blob: YK.docxFromHtml(h) }; }
                try { if (YK.EXS) YK.EXS.set(f.blob, { rows: rows, title: title }); } catch (e) { /* */ }
                if (typeof YK.exOpen === 'function') YK.exOpen([f], { title: title, act: 'dl' }); else YK.docDownload([f]);
                try { YK.aiLog('Yuklash: ' + title + ' · ' + YKS.cols.length + ' ustun · ' + kind); } catch (e) { /* */ }
            } catch (e) { console.error(e); YK.alert('⚠️ ' + (YK.agmkErrUz ? YK.agmkErrUz(e) : String(e))); }
        }
        Object.assign(YK, { ykOpen: ykOpen, ykTy: ykTy, ykTyAll: ykTyAll, ykG: ykG, ykS: ykS, ykQ: ykQ, ykSelAll: ykSelAll, ykOne: ykOne, ykMore: ykMore, ykPre: ykPre, ykCol: ykCol, ykMv: ykMv, ykGo: ykGo });

        // ---------- sarlavhaga tugma ----------
        function ykBtn(sid: string): void {
            try { if (!YK_CFG[sid]) return; const s = YK.$id(sid); if (!s) return; const hd = s.querySelector('.inner-header'); if (!hd || hd.querySelector('.yk-btn')) return;
                const b = document.createElement('div'); b.className = 'yk-btn'; b.innerHTML = '📥 <span>Yuklash</span>'; b.title = 'Saralab yuklab olish: Excel / PDF / Word'; b.onclick = (e: any) => { e.stopPropagation(); ykOpen(sid); };
                const h2 = hd.querySelector('h2'); if (h2 && h2.nextSibling) hd.insertBefore(b, h2.nextSibling); else hd.appendChild(b); } catch (e) { console.warn(e); }
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = `.yk-btn{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border-radius:13px;padding:6px 9px;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 0 0 2px rgba(125,211,252,.35);white-space:nowrap;flex:none;margin-left:6px}
                .inner-header h2{min-width:0}.inner-header .back-btn{white-space:nowrap}@media(max-width:400px){.yk-btn span{display:none}.yk-btn{padding:7px 9px;font-size:16px}}
                .yk-c{background:rgba(22,33,56,.92);border:1px solid #2c3d5e;border-radius:16px;padding:12px;margin:10px 0;color:#e8eefc}
                .yk-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.yk-h i{font-style:normal;width:26px;height:26px;border-radius:50%;background:#2563eb;display:flex;align-items:center;justify-content:center;font-weight:700}.yk-h b{flex:1;font-size:16px}.yk-h small{color:#93c5fd}
                .yk-all,.yk-r{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:11px;background:#111c31;margin-bottom:5px;cursor:pointer;font-size:14px}.yk-all{background:#0f2a1c;border:1px solid rgba(34,197,94,.4);font-weight:600}
                .yk-all em,.yk-r em{margin-left:auto;font-style:normal;color:#94a3b8;font-size:12.5px;white-space:nowrap}.yk-all em{color:#86efac}.yk-sub{color:#94a3b8;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
                .yk-cb{width:21px;height:21px;border-radius:6px;border:2px solid #64748b;display:flex;align-items:center;justify-content:center;font-size:13px;flex:none;color:#fff}.yk-cb.on{background:#22c55e;border-color:#22c55e}
                .yk-l{font-size:12.5px;color:#93c5fd;font-weight:600;margin:6px 0 5px}.yk-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px}.yk-chip{padding:6px 10px;border-radius:999px;background:#111c31;border:1px solid #334155;font-size:13px;cursor:pointer}.yk-chip.a{background:#1e3a8a;border-color:#3b82f6}
                .yk-q{width:100%;box-sizing:border-box;margin:8px 0;padding:9px 12px;border-radius:11px;border:1px solid #334155;background:#0b1426;color:inherit;font:inherit}
                .yk-more{text-align:center;color:#93c5fd;padding:8px;cursor:pointer;font-size:13px}.yk-tip{font-size:12px;color:#94a3b8;margin-top:6px}
                .yk-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}.yk-grid .yk-r{margin:0;font-size:13px;padding:8px}
                .yk-pre{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.yk-pre span{flex:1;min-width:72px;text-align:center;padding:7px 4px;border-radius:10px;background:#1e293b;border:1px solid #334155;font-size:12.5px;cursor:pointer}.yk-pre span.a{background:#1e3a8a;border-color:#3b82f6}
                .yk-ord{display:flex;flex-direction:column;gap:4px}.yk-o{display:flex;align-items:center;gap:8px;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px 8px;font-size:14px;user-select:none}.yk-o b{min-width:22px;color:#93c5fd;font-size:12px}.yk-o span{flex:1}.yk-o a{cursor:pointer;padding:2px 7px;border-radius:7px;background:#0f172a;color:#7dd3fc}.yk-o a.off{opacity:.25;pointer-events:none}.yk-dh{font-style:normal;font-size:20px;color:#94a3b8;padding:0 6px;cursor:grab;touch-action:none}.yk-o.drag{opacity:.55;border-color:#38bdf8}.yk-o.tgt{border-color:#facc15;box-shadow:0 -3px 0 #facc15}.yk-std{margin-left:6px;font-size:12px;color:#fde047;cursor:pointer;white-space:nowrap}
                .yk-sum{background:#0f172a;border:1px dashed #3b82f6;border-radius:12px;padding:9px;text-align:center;margin-bottom:9px}
                .yk-fmt{display:flex;gap:8px}.yk-fmt button{flex:1;border:0;border-radius:13px;padding:12px 4px;font-weight:700;font-size:15px;color:#fff;cursor:pointer}.yk-fmt .x{background:#15803d}.yk-fmt .p{background:#b91c1c}.yk-fmt .w{background:#1d4ed8}
                .yk-pv{overflow-x:auto;margin-top:10px}.yk-pv table{border-collapse:collapse;font-size:11px;background:#fff;color:#111;min-width:100%}.yk-pv th{background:#d9e7f7;font-weight:700}.yk-pv td,.yk-pv th{border:1px solid #b6c3d4;padding:3px 5px;text-align:left;white-space:nowrap}`;
            document.head.appendChild(st);
            Object.keys(YK_CFG).forEach(ykBtn);
            if (typeof YK.openScreen === 'function') YK.openScreen = YK.agmkExtend('openScreen', 'v4.7: 📥 Yuklash tugmasi', YK.openScreen, (o: Function) => function (this: unknown, id: string) { const r = o.apply(this, arguments); try { ykBtn(id); } catch (e) { /* */ } return r; });
        })();
