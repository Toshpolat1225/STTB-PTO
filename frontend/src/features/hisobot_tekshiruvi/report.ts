
        // =====================================================================
        // v3.0 — HISOBOT TEKSHIRUVIGA QO'SHIMCHALAR
        //  1) Yashirilgan qatorlar (spravka, defekt vedomost): asosiy tekshiruvga kirmaydi, alohida 🟠 bo'limda
        //  2) ШПЗ guruh kodi (222000 ↔ 222182): 🔷 «guruh kodi bilan chiqarilgan» (sozlama: qat'iy rejimda ❌)
        //  3) Metallolom akti ↔ spravkadagi ehtiyot qismlar (dona bo'yicha, 🔷)
        //  4) 📝 Zamechaniya PDF — hisobot egasiga (faqat tasdiqlangan xatolar, manbasi bilan)
        //  5) 🔄 Qayta tekshirish — shu fayllar yoki tuzatilgan fayllar: ✅ tuzatildi / ❌ qoldi / 🆕 yangi
        // =====================================================================
        var HP3 = { KEY: 'agmk_hp3', NONMETAL: /композ|ком-е ваг|резин|манжет|шланг|рукав|прокладк|уплотн|кольцо резин|ремен|лента|краск|эмал|грунт|олиф|смазк|масл|солидол|ветош|бумаг|картон|стекл|пластмас|полиэтил|паронит|войлок|кож|ткан|лампа|провод|кабел|изолент|электрод|кислород|пропан|ацетилен|карбид|диск отрез|круг|сверл/i };
        function hp3Cfg() { try { return JSON.parse(localStorage.getItem(HP3.KEY) || '{}') || {}; } catch (e) { return {}; } }
        function hp3CfgSet(c) { try { localStorage.setItem(HP3.KEY, JSON.stringify(c)); } catch (e) {} }
        // Himoyalangan qatorlar (yashirilgan bo'lsa ham o'chirilmaydi — sarlavha, jami, blok boshi)
        var HP3_KEEP = /итого|всего|наимен|кол-?во|ед\.?\s*изм|№\s*треб|материал|группа работ|время окончания|справка.?расч|вид операц|склад|цех|шифр затрат|ремонт\s+(думп|ваг|хоп|цист|плат)|деповск|капитал|утверждаю|согласовано|дефектн/i;
        (function () {
            if (typeof hpParseSheet !== 'function') return;
            hpParseSheet = agmkExtend('hpParseSheet', 'hpParseSheet', hpParseSheet, o => function (rows, type, src) {
                const H = rows && rows.__hid;
                if (!H || !H.size || (type !== 'spr' && type !== 'dv')) return o.apply(this, arguments);
                const R = rows.slice(), hid = [];
                // Defekt vedomost: «Группа работ» ustuni — yashirin qatorda guruh nomi bo'lsa, u saqlanadi (keyingi qatorlar guruhi buzilmasin)
                const gcol = []; if (type === 'dv') { let g = -1; for (let i = 0; i < rows.length; i++) { const r = rows[i] || []; const jm = hpFind(r, /материал/), jg = hpFind(r, /группа работ/); if (jm >= 0 && jg >= 0) g = jg; gcol[i] = g; } }
                H.forEach(i => {
                    const r = rows[i] || [], t = hpRowTxt(r); if (!t) return;
                    if (HP3_KEEP.test(t)) return; // sarlavha va xizmat qatorlari tegilmaydi
                    const nr = []; if (type === 'dv' && gcol[i] >= 0 && hpS(r[gcol[i]])) nr[gcol[i]] = r[gcol[i]];
                    R[i] = nr; hid.push({ r: i, t: t.slice(0, 220), src: Object.assign({}, src, { r: i }) });
                });
                const res = o.call(this, R, type, src);
                if (res && typeof res === 'object') { hid.sort((a, b) => a.r - b.r); Object.defineProperty(res, '__hidRows', { value: hid, enumerable: false }); }
                return res;
            });
        })();
        function hp3Sim(a, b) { // nomlar o'xshashligi: so'z o'zaklari (4 harf) ulushi, raqamlar mos bo'lishi shart
            const A = hpToks(a), B = hpToks(b), st = L => new Set(L.filter(w => w.length >= 3).map(w => w.slice(0, 4))), W = st(A.w), V = st(B.w);
            if (!W.size || !V.size) return 0; let n = 0; W.forEach(x => { if (V.has(x)) n++; });
            if (A.n.size && B.n.size && ![...A.n].some(x => B.n.has(x))) return 0;
            return n / Math.min(W.size, V.size);
        }
        function hp3ShpzGroup(sp, codes) { // spravka kodi (222182) Forma-30 dagi guruh kodiga (222000) tegishlimi
            const s = String(sp || '').replace(/\D/g, ''); if (s.length < 6) return false;
            return codes.length && codes.every(c => { const d = String(c).replace(/\D/g, ''); return d.length === s.length && /000$/.test(d) && d.slice(0, 3) === s.slice(0, 3) && d !== s; });
        }
        (function () {
            if (typeof hpCheck !== 'function') return;
            hpCheck = agmkExtend('hpCheck', 'hpCheck', hpCheck, o => function (pkg) {
                const R = o.apply(this, arguments);
                try {
                    const F = R.findings, add = x => { x.id = 'p' + (F.length + 1) + 'h'; x.st = ''; x.src = (x.src || []).filter(Boolean); F.push(x); return x; };
                    // 2) ШПЗ guruh kodi
                    if (!hp3Cfg().shpzStrict) F.forEach(f => {
                        if (f.t !== 'shpz' || f.lvl !== 'red') return;
                        const m = String(f.msg).match(/spravka\s+(\d+),\s*Forma-30 da\s+([\d,\s]+)/); if (!m) return;
                        const codes = m[2].split(/[,\s]+/).filter(Boolean);
                        if (hp3ShpzGroup(m[1], codes)) { f.lvl = 'blue'; f.t = 'shpzgrp'; f.msg = 'ШПЗ guruh kodi bilan chiqarilgan: spravkada ' + m[1] + ', Forma-30 da ' + codes.join(', ') + ' (guruh). Agar Forma-30 da aniq kod bo\'lishi shart bo\'lsa — xato; tekshiring. ' + String(f.msg).replace(/^[^.]*\.\s*/, ''); }
                    });
                    // 3) Metallolom akti ↔ spravkadagi ehtiyot qismlar (dona)
                    const S = t => pkg.sheets.filter(x => x.type === t && x.data);
                    const M = pkg.month || (pkg.f30 && pkg.f30.month) || '';
                    const blocks = []; S('spr').forEach(x => x.data.forEach(b => { if (!M || !b.month || b.month === M) blocks.push(b); }));
                    const loms = S('lom').map(x => x.data).filter(Boolean);
                    if (loms.length && blocks.length) {
                        const sec = 'Metallolom akti ↔ spravka (ehtiyot qismlar, dona)';
                        const parts = []; blocks.forEach(b => b.items.forEach(it => { if (it.fakt !== null && it.fakt > 0 && /зап/i.test(it.grp || '') && /шт|компл|пар/i.test(it.unit || '') && !HP3.NONMETAL.test(it.name)) parts.push(it); }));
                        const lomIt = []; loms.forEach(L => L.items.forEach(x => { if (/шт|компл|пар/i.test(x.unit || '') && x.qty) lomIt.push(x); }));
                        const byLom = new Map(), miss = [];
                        parts.forEach(it => {
                            let best = null, bs = 0; lomIt.forEach(x => { const s = hp3Sim(it.name, x.name); if (s > bs) { bs = s; best = x; } });
                            if (best && bs >= 0.67) { const a = byLom.get(best) || []; a.push(it); byLom.set(best, a); } else miss.push(it);
                        });
                        byLom.forEach((L, x) => { const tot = L.reduce((a, it) => a + it.fakt, 0); if (Math.abs(tot - x.qty) > 1e-6) add({ t: 'lomqty', lvl: 'blue', sec: sec, name: x.name, msg: 'Metallolom aktida ' + hpF(x.qty) + ' ' + (x.unit || 'шт') + ', spravkalarda shu qism bo\'yicha Факт ' + L.map(it => hpF(it.fakt)).join(' + ') + ' = ' + hpF(tot) + ' ' + (L[0].unit || 'шт') + '. Almashtirilgan eski qism lomga to\'liq topshirilganini tekshiring.', src: [x.src].concat(L.map(it => it.src)) }); });
                        if (lomIt.length) {
                            const g = {}; miss.forEach(it => { const k = hpLow(it.name); (g[k] = g[k] || []).push(it); });
                            const keys = Object.keys(g);
                            if (keys.length > 25) add({ t: 'lommiss', lvl: 'blue', sec: sec, name: 'Aktda topilmagan qismlar', msg: keys.length + ' ta ehtiyot qism spravkada almashtirilgan (Факт bor), lekin metallolom aktida topilmadi: ' + keys.slice(0, 40).map(k => g[k][0].name + ' (' + hpF(g[k].reduce((a, it) => a + it.fakt, 0)) + ')').join(', ') + (keys.length > 40 ? ' …' : '') + '. Metall boʻlmaganlari yoki lomga topshirilmaydiganlari boʻlsa — «Xato emas».', src: miss.slice(0, 40).map(it => it.src) });
                            else keys.forEach(k => { const L = g[k], tot = L.reduce((a, it) => a + it.fakt, 0); add({ t: 'lommiss', lvl: 'blue', sec: sec, name: L[0].name, msg: 'Spravkada almashtirilgan (Факт ' + hpF(tot) + ' ' + (L[0].unit || 'шт') + '), metallolom aktida bu qism topilmadi. Metall boʻlmasa yoki lomga topshirilmasa — «Xato emas».', src: L.map(it => it.src) }); });
                        }
                    }
                    // 1) Yashirilgan qatorlar — alohida bo'lim (xato emas, ko'zdan kechirish uchun)
                    pkg.sheets.forEach(x => {
                        const H = x.data && x.data.__hidRows; if (!H || !H.length) return;
                        add({ t: 'hidden', lvl: 'hid', sec: '🟠 Yashirilgan qatorlar (xato emas — koʻzdan kechiring)', name: x.f + (x.s ? ' › ' + x.s : ''), msg: 'Excel\'da ' + H.length + ' ta qator yashirilgan (chop etilmaydi). Ular asosiy tekshiruvga va Forma-30 bilan solishtirishga kiritilmadi.', src: H.map(h => h.src), hrows: H.map(h => ({ r: h.r, t: h.t })) });
                    });
                    if (R.stats) R.stats.hid = F.filter(f => f.lvl === 'hid').reduce((a, f) => a + (f.hrows || []).length, 0);
                } catch (e) { console.error('hp3', e); }
                return R;
            });
        })();
        // ---------- Natija ekrani: yashirin qatorlar ko'rinishi, qayta tekshiruv farqlari, tugmalar ----------
        (function () {
            const css = document.createElement('style');
            css.textContent = `.hs-f.hid{background:rgba(251,146,60,0.13);border-color:rgba(251,146,60,0.55)}.hs-f.hid .hp3-hl{margin-top:6px;max-height:40vh;overflow:auto;font-size:11.5px;color:#fed7aa}.hs-f.hid .hp3-hl div{padding:3px 0;border-bottom:1px dashed rgba(251,146,60,0.25)}
                .hp3-rc{border:1px solid #334155;border-radius:12px;padding:10px;margin-bottom:10px;background:#0f172a;font-size:12.5px;color:#e2e8f0}.hp3-rc b{color:#f8fafc}.hp3-rc .ok{color:#86efac}.hp3-rc .no{color:#fca5a5}.hp3-rc .nw{color:#fde68a}
                .hp3-tag{display:inline-block;font-size:10.5px;padding:1px 7px;border-radius:10px;margin-left:6px;vertical-align:middle}.hp3-tag.no{background:rgba(239,68,68,.2);color:#fca5a5}.hp3-tag.nw{background:rgba(250,204,21,.2);color:#fde68a}
                .hp3-fx{opacity:.75;text-decoration:line-through;text-decoration-color:rgba(134,239,172,.6)}`;
            document.head.appendChild(css);
        })();
        function hp3Key(f) { return [f.t, hsNorm(f.name || ''), f.nom || '', hsNorm(f.sec || '')].join('|'); }
        (function () {
            if (typeof hpChkLoad !== 'function') return;
            hpChkLoad = agmkExtend('hpChkLoad', 'hpChkLoad', hpChkLoad, o => async function (x, d, box) {
                const r = await o.apply(this, arguments);
                try {
                    const E = escapeHtml;
                    // findings DOM tartibi: bo'limlar (birinchi uchragan tartibda) → ichidagi topilmalar
                    const secs = []; d.findings.forEach(f => { let s = secs.find(z => z.k === f.sec); if (!s) { s = { k: f.sec, L: [] }; secs.push(s); } s.L.push(f); });
                    const order = []; secs.forEach(s => s.L.forEach(f => order.push(f)));
                    const els = box.querySelectorAll('.hs-f');
                    const rc = d.recheck || null, remain = new Set((rc && rc.remain) || []), fresh = new Set((rc && rc.fresh) || []);
                    els.forEach((el, i) => {
                        const f = order[i]; if (!f) return;
                        if (f.lvl === 'hid') {
                            const b = el.querySelector('.hs-fh b'); if (b) b.textContent = '🟠 ' + (f.name || '');
                            const hl = document.createElement('details'); hl.innerHTML = `<summary>👁 Yashirilgan qatorlarni ko'rish (${(f.hrows || []).length})</summary><div class="hp3-hl">${(f.hrows || []).map(h => `<div><b>${h.r + 1}-qator:</b> ${E(h.t)}</div>`).join('')}</div>`;
                            const srcD = el.querySelector('.hp-src'); if (srcD) srcD.remove();
                            el.insertBefore(hl, el.querySelector('.hs-fb') || null);
                        }
                        if (rc) { const k = hp3Key(f); const b = el.querySelector('.hs-fh b'); if (b && f.lvl !== 'info' && f.lvl !== 'hid') b.insertAdjacentHTML('beforeend', fresh.has(k) ? '<span class="hp3-tag nw">🆕 yangi</span>' : remain.has(k) ? '<span class="hp3-tag no">❌ tuzatilmagan</span>' : ''); }
                    });
                    // bo'lim sarlavhasiga 🟠 soni
                    box.querySelectorAll('.hp-sec').forEach(s => { const h = s.querySelector('.hp-sech small'); const n = s.querySelectorAll('.hs-f.hid').length; if (h && n) h.insertAdjacentHTML('beforeend', ' 🟠 ' + n); });
                    if (rc) {
                        const fx = rc.fixed || [];
                        box.insertAdjacentHTML('afterbegin', `<div class="hp3-rc"><b>🔄 Qayta tekshiruv natijasi</b> <small>(oldingi: ${E(rc.prevAt ? fmtDT(rc.prevAt) : '')})</small><br>
                            <span class="ok">✅ Tuzatilgan: ${fx.length}</span> · <span class="no">❌ Tuzatilmagan: ${remain.size}</span> · <span class="nw">🆕 Yangi: ${fresh.size}</span>
                            ${fx.length ? `<details><summary>✅ Tuzatilgan zamechaniyalar (${fx.length})</summary>${fx.map(f => `<div class="hp3-fx">✅ ${E(f.name || '')} — ${E(String(f.msg || '').slice(0, 180))}</div>`).join('')}</details>` : ''}</div>`);
                    }
                } catch (e) { console.error('hp3 render', e); }
                return r;
            });
        })();
        (function () {
            if (typeof hsChkHtml !== 'function') return;
            hsChkHtml = agmkExtend('hsChkHtml', 'hsChkHtml', hsChkHtml, o => function () {
                let h = o.apply(this, arguments);
                try {
                    const x = hsRec(HS.chk); if (!x || x.kind !== 'pkg') return h;
                    const btns = `<button class="action-btn" style="background:linear-gradient(135deg,#b45309,#f59e0b)" onclick="hp3ZamOpen('${x.id}')">📝 Zamechaniya (egasiga, PDF)</button>` +
                        (hsCan() ? `<button class="action-btn" style="background:#334155" onclick="hp3ReOpen('${x.id}')">🔄 Qayta tekshirish</button>` : '') +
                        (x.prev ? `<button class="action-btn" style="background:#1e293b" onclick="HS.chk='${x.prev}'; hsRender()">⏮ Oldingi tekshiruv</button>` : '');
                    h = h.replace('<div class="hs-acts">', '<div class="hs-acts">' + btns);
                } catch (e) {}
                return h;
            });
        })();
        // ---------- 📝 Zamechaniya ----------
        var HP3Z = { id: null };
        function hp3Fix(f) {
            const t = f.t || '';
            if (t === 'fakt' || t === 'namediff' || t === 'size') return 'Факт Forma-30 da shu talabnoma(lar) boʻyicha chiqarilgan miqdor va nomga mos boʻlishi kerak.';
            if (t === 'notin' || t === 'notreb') return 'Talabnoma raqami toʻgʻri koʻrsatilishi va material Forma-30 da boʻlishi kerak.';
            if (t === 'shpz' || t === 'shpzgrp') return 'ШПЗ (xarajat kodi) Forma-30 dagi kod bilan bir xil boʻlishi kerak.';
            if (t === 'sklad') return 'Material spravkadagi sex (sklad) boʻyicha chiqarilgan boʻlishi kerak.';
            if (t === 'over' || t === 'normval') return 'Sarf tasdiqlangan normadan oshmasligi kerak.';
            if (/^lom/.test(t)) return 'Metallolom akti: hisob-kitob (miqdor × vazn × eskirish) va spravka bilan moslik toʻgʻri boʻlishi kerak.';
            if (/^dv/.test(t)) return 'Defekt vedomost va spravka-raschet oʻzaro mos boʻlishi kerak.';
            if (/^nar/.test(t)) return 'Naryad hisob-kitobi toʻgʻri boʻlishi kerak.';
            if (t === 'count') return 'Vagonlar soni va norma hisoblangan birliklar soni mos boʻlishi kerak.';
            return 'Koʻrsatilgan qiymatni asl hujjat boʻyicha tekshirib, toʻgʻrilang.';
        }
        async function hp3ZamOpen(id) {
            const x = hsRec(id); if (!x) return; const d = await hsJsonGet(x.dref); if (!d) return;
            HP3Z.id = id; HP3Z.d = d; HP3Z.blue = false;
            const due = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), E = escapeHtml;
            const ok = d.findings.filter(f => f.st === 'ok').length, bl = d.findings.filter(f => f.lvl === 'blue' && f.st !== 'no' && f.st !== 'ok').length;
            mdl('hp3Zam', `<div class="px-h"><b>📝 Zamechaniya — hisobot egasiga</b><button class="mini-btn" onclick="mdlClose('hp3Zam')">✕</button></div>
                <div class="nd-tip">Faqat <b>✅ Tasdiqlayman</b> deb belgilangan xatolar kiradi (${ok} ta). «✖ Xato emas» deb belgilanganlar kirmaydi. Har bir bandda: nima notoʻgʻri, qayerda (fayl › varaq › qator) va qanday boʻlishi kerak.</div>
                <div class="nd-f"><label>KIMGA (hisobot egasi F.I.Sh.)</label><input id="hp3To" value="${E(x.who || d.who || '')}" placeholder="Masalan: @@N:352@@"></div>
                <div class="nd-2"><div class="nd-f"><label>TUZATIB QAYTA TOPSHIRISH MUDDATI</label><input type="date" id="hp3Due" value="${due}"></div><div class="nd-f"><label>OY</label><input id="hp3M" value="${E(d.month || '')}" readonly></div></div>
                <label class="nr-irow" style="cursor:pointer"><input type="checkbox" id="hp3Blue"> <span>🔷 «Tekshirish kerak» bandlarini ham qoʻshish (${bl} ta, «Xato emas» belgilanmaganlari)</span></label>
                <button class="action-btn" onclick="hp3ZamGo('send')">📤 Tayyorlash va yuborish</button>
                <button class="action-btn sec" onclick="hp3ZamGo('pdf')">📄 Faqat PDF yuklab olish</button>`, true);
        }
        function hp3ZamHtml(x, d, to, due, withBlue, withRed) { // withRed: formula bilan aniqlangan (qizil) xatolar ham kiradi — «Xato emas» deb belgilanganlari kirmaydi
            const E = escapeHtml, L = d.findings.filter(f => f.st === 'ok' || (withRed && f.lvl === 'red' && f.st !== 'no') || (withBlue && f.lvl === 'blue' && f.st !== 'no'));
            const me = (typeof currentUser !== 'undefined' && currentUser) || {}, dd = s => s ? s.split('-').reverse().join('.') : '____________';
            const month = d.month ? hsMon(d.month) : '';
            let h = `<h3 style="text-align:center">Hisobot boʻyicha zamechaniyalar (tuzatish uchun)</h3>
                <p><b>Kimga:</b> ${E(to || '____________________')}</p><p><b>Hisobot davri:</b> ${E(month)} · <b>Fayllar:</b> ${E((x.files || []).join(', ').slice(0, 300))}</p>
                <p><b>Tekshiruv sanasi:</b> ${E(fmtDT(x.at))}. Quyidagi kamchiliklarni tuzatib, hisobotni belgilangan muddatda qayta topshiring.</p>
                <table style="width:100%"><tr><th>№</th><th>Nima notoʻgʻri</th><th>Qayerda (manba)</th><th>Qanday boʻlishi kerak</th></tr>`;
            L.forEach((f, i) => { h += `<tr><td>${i + 1}</td><td>${E((f.name ? f.name + ': ' : '') + f.msg)}</td><td>${E((f.src || []).slice(0, 4).map(hpSrc).join('; ') + ((f.src || []).length > 4 ? ' …' : ''))}</td><td>${E(hp3Fix(f))}</td></tr>`; });
            h += `</table><p><b>Jami zamechaniyalar:</b> ${L.length} ta.</p><p><b>Tuzatib qayta topshirish muddati:</b> ${E(dd(due))}</p>
                <table class="nb" style="width:100%"><tr><td>Tekshiruvchi: ${E(me.role || '')}</td><td>__________</td><td>${E(me.name || '')}</td></tr><tr><td>Tanishdim (hisobot egasi):</td><td>__________</td><td>${E(to || '')}</td></tr></table>
                <p>Sana: «____» ______________ ${new Date().getFullYear()} y.</p>`;
            return { html: h, n: L.length, ids: L.map(f => f.id) };
        }
        async function hp3ZamGo(mode) {
            const x = hsRec(HP3Z.id), d = HP3Z.d; if (!x || !d) return;
            const to = ($id('hp3To').value || '').trim(), due = $id('hp3Due').value, blue = $id('hp3Blue').checked;
            const Z = hp3ZamHtml(x, d, to, due, blue);
            if (!Z.n) { alert("Zamechaniyaga kiradigan band yoʻq.\n\nAvval natijadagi xatolarni «✅ Tasdiqlayman (xato)» bilan belgilang (yoki 🔷 larni qoʻshish belgisini qoʻying)."); return; }
            mdlClose('hp3Zam');
            const title = 'Zamechaniya ' + (to || '') + ' ' + (d.month || '');
            const all = hsChecks(), rr = all.find(z => z.id === x.id);
            if (rr) { rr.zam = (rr.zam || []).concat([{ at: new Date().toISOString(), to: to, due: due, n: Z.n, ids: Z.ids, by: authorStr() }]); hsLog(rr, '📝 Zamechaniya tayyorlandi: ' + Z.n + ' ta band' + (to ? ', kimga: ' + to : '') + (due ? ', muddat: ' + due : '')); kvSet(HS_CHK_KEY, all); }
            if (mode === 'pdf') { try { const files = await docMake(Z.html, title, ['pdf']); docDownload(files); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } return; }
            let p = null; try { if (to) { const L = pplFind(to); p = L && L.length ? L[0] : { name: to, role: '' }; } } catch (e) {}
            sendOpen({ html: Z.html, title: title, lang: 'uz', fmts: ['pdf'], to: p });
        }
        // ---------- 🔄 Qayta tekshirish ----------
        async function hp3ReOpen(id) {
            const x = hsRec(id); if (!x) return;
            mdl('hp3Re', `<div class="px-h"><b>🔄 Qayta tekshirish</b><button class="mini-btn" onclick="mdlClose('hp3Re')">✕</button></div>
                <div class="nd-tip">Eski natija, belgilar («Tasdiqlayman», «Xato emas») va yuborilgan zamechaniyalar oʻchmaydi — tarixda qoladi. Yangi natijada: ✅ tuzatilgan, ❌ tuzatilmagan, 🆕 yangi xatolar koʻrsatiladi.</div>
                <button class="action-btn" onclick="mdlClose('hp3Re'); hp3ReRun('${id}', null)">♻️ Shu fayllarni qaytadan (hozirgi qoidalar, normalar va moslashtirishlar bilan)</button>
                <label class="action-btn sec" style="display:block;text-align:center;cursor:pointer">📂 Xodimning tuzatilgan fayllarini yuklash<input type="file" multiple accept=".xls,.xlsx,.xlsm,.pdf,.docx" style="display:none" onchange="mdlClose('hp3Re'); hp3ReRun('${id}', this.files)"></label>`, true);
        }
        async function hp3ReRun(id, newFiles) {
            const x = hsRec(id); if (!x) return; const d = await hsJsonGet(x.dref); if (!d) { alert('⚠️ Oldingi tekshiruv maʼlumoti topilmadi'); return; }
            showToast('⏳ Qayta tekshirilmoqda...');
            const old = [];
            for (const fr of (d.files || [])) { try { const b = await mediaGetBlob(fr.ref); if (b) old.push(new File([b], fr.name, { type: b.type || '' })); } catch (e) {} }
            let files = newFiles ? Array.from(newFiles) : old;
            if (!files.length) { alert("⚠️ Fayllar topilmadi. «Xodimning tuzatilgan fayllarini yuklash» orqali qayta tanlang."); return; }
            const sheets = [];
            for (const f of files) { try { const bk = await hpReadBook(f); bk.forEach(s => sheets.push({ file: f, f: f.name, s: s.s, rows: s.rows, type: hpClassify(s.rows) })); } catch (e) { console.error(e); } }
            // Forma-30: yangi fayllarda bo'lmasa — oldingi tekshiruvdagisi
            let f30 = null;
            const inNew = sheets.find(s => s.type === 'f30');
            try {
                if (inNew) f30 = hpParseF30(inNew.rows, { f: inNew.f, s: inNew.s });
                else if (x.f30 && x.f30.id && x.f30.id !== 'pkg') { const rec = hsF30Of(x.cat).find(z => z.id === x.f30.id); if (rec) f30 = await hpF30FromStored(rec); }
                else if (x.f30 && newFiles) { for (const f of old) { const bk = await hpReadBook(f); for (const s of bk) if (!f30 && hpClassify(s.rows) === 'f30') f30 = hpParseF30(s.rows, { f: f.name, s: s.s }); } }
            } catch (e) { console.error(e); }
            if (x.f30 && !f30) { alert('⚠️ Oldingi tekshiruvdagi Forma-30 topilmadi. Uni ham fayllar qatoriga qoʻshib yuklang.'); return; }
            if (!sheets.some(s => hpIsPkgType(s.type))) { alert('⚠️ Fayllarda spravka, defekt vedomost, lom akti yoki naryad topilmadi.'); return; }
            const parsed = sheets.filter(s => hpIsPkgType(s.type) || s.type === 'norma').map(s => { let data = null; try { data = hpParseSheet(s.rows, s.type, { f: s.f, s: s.s }); } catch (e) { console.error(e); } return { f: s.f, s: s.s, type: s.type, data: data }; });
            let R; try { R = hpCheck({ sheets: parsed, f30: f30, month: d.month || (f30 && f30.month) || '' }); } catch (e) { alert('⚠️ Tekshiruvda xato: ' + agmkErrUz(e)); return; }
            const F = R.findings, OK = f => f.lvl !== 'info' && f.lvl !== 'hid';
            const oldMap = new Map(); d.findings.filter(OK).forEach(f => oldMap.set(hp3Key(f), f));
            const newKeys = new Set(F.filter(OK).map(hp3Key));
            F.forEach(f => { const p = oldMap.get(hp3Key(f)); if (p && p.st) { f.st = p.st; f.by = p.by; f.at = p.at; } });
            const recheck = { prev: x.id, prevAt: x.at, fixed: [...oldMap.entries()].filter(([k]) => !newKeys.has(k)).map(([, f]) => ({ t: f.t, name: f.name, msg: f.msg, st: f.st })), remain: [...newKeys].filter(k => oldMap.has(k)), fresh: [...newKeys].filter(k => !oldMap.has(k)) };
            const frefs = [];
            for (const f of files) { const ref = uid('pkgf_'); try { await mediaSave(ref, f, { id: ref, at: new Date().toISOString(), name: f.name, mime: f.type, size: f.size }); mediaKeep(ref); frefs.push({ ref: ref, name: f.name }); } catch (e) {} }
            if (newFiles && f30 && !inNew) (d.files || []).forEach(fr => { if (!frefs.some(z => z.name === fr.name) && old.some(o => o.name === fr.name)) frefs.push(fr); });
            const nid = uid('chk_'), dref = uid('chkd_');
            await hsJsonSave(dref, { kind: 'pkg', findings: F, stats: R.stats, files: frefs, norms: d.norms || [], who: d.who, month: d.month, f30: f30 ? { month: f30.month, n: f30.items.length, src: f30.src } : null, ann: [], recheck: recheck });
            const red = F.filter(f => f.lvl === 'red').length, blue = F.filter(f => f.lvl === 'blue').length, money = F.filter(f => f.lvl === 'red' && f.diff).reduce((a, f) => a + Math.abs(f.diff), 0);
            const rec = Object.assign({}, x, { id: nid, dref: dref, at: new Date().toISOString(), by: authorStr(), byT: meTabel(), file: (newFiles ? '🔄 Tuzatilgan: ' : '🔄 Qayta: ') + files.length + ' ta fayl' + (x.who ? ' · ' + x.who : ''), files: files.map(f => f.name), status: 'draft', red: red, blue: blue, sum: money, prev: x.id, log: [], zam: [] });
            delete rec.next;
            hsLog(rec, '🔄 Qayta tekshirildi (' + (newFiles ? 'tuzatilgan fayllar' : 'shu fayllar') + '): ✅ ' + recheck.fixed.length + ' tuzatildi, ❌ ' + recheck.remain.length + ' qoldi, 🆕 ' + recheck.fresh.length + ' yangi');
            const all = hsChecks(); const ox = all.find(z => z.id === x.id); if (ox) { ox.next = nid; hsLog(ox, '🔄 Qayta tekshiruv oʻtkazildi → yangi natija (' + fmtDT(rec.at) + ')'); }
            all.unshift(rec); kvSet(HS_CHK_KEY, all.slice(0, 300));
            HS.chk = nid; hsRender();
            showToast('🔄 Qayta tekshirildi: ✅ ' + recheck.fixed.length + ' · ❌ ' + recheck.remain.length + ' · 🆕 ' + recheck.fresh.length);
        }
        // Sozlama: ШПЗ qat'iy rejimi (hisobotlar ekranida)
        function hp3ShpzToggle() { const c = hp3Cfg(); c.shpzStrict = !c.shpzStrict; hp3CfgSet(c); showToast(c.shpzStrict ? '❌ ШПЗ: qatʼiy — guruh kodi ham xato' : '🔷 ШПЗ: guruh kodi (222000) — «tekshirish kerak»'); try { hsRender(); } catch (e) {} }
        (function () {
            if (typeof hsRender !== 'function') return; hsRender = agmkExtend('hsRender', 'hsRender', hsRender, o => function () { const r = o.apply(this, arguments); try { const hb = $id('hpBox'); if (hb && !$id('hp3Shpz') && hsCan()) { const c = hp3Cfg(); hb.insertAdjacentHTML('beforeend', `<div class="nd-tip" id="hp3Shpz" style="cursor:pointer" onclick="hp3ShpzToggle()">⚙️ ШПЗ guruh kodi (masalan Forma-30 da 222000, spravkada 222182): <b>${c.shpzStrict ? '❌ xato deb hisoblanadi' : '🔷 «tekshirish kerak»'}</b> — oʻzgartirish uchun bosing</div>`); } } catch (e) {} return r; });
        })();

