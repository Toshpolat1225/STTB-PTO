
        // =====================================================================
        // v3.5 — 📊 IQTISODIYOT («Buxgalteriya va iqtisodiyot» ekranidagi yangi yorliqlar)
        //  🔧 Tannarx — har vagon va har taʼmirning haqiqiy qiymati (material + ish haqi + yoqilgʻi + boshqa)
        //  ⏳ Turib qolish — dispetcherlikdagi turib qolish soatlari × vagon-soat narxi = soʻmdagi yoʻqotish
        //  🧠 Tahlil — bu oy oʻtgan oyga nisbatan: nima oshdi, nega (formula hisoblaydi, AI faqat tushuntiradi)
        //  Maʼlumot faqat buxgalteriya, rahbariyat va administratorga boradi (server ham tekshiradi).
        // =====================================================================
        var IQT_TUR = ['Depo taʼmiri (DR)', 'Kapital taʼmir (KR)', 'Joriy taʼmir (TR)', 'Avariyadan keyingi taʼmir', 'Boshqa'];
        var IQ = { m: '' };
        function iqtRe() { if ($id('screen-bux')) bxRender(); }
        function iqtS() { return agmkStore('iqt', { roles: ['bux', 'rahbar'] }); }
        function iqtCan() { try { return isAdmin() || hasRole('bux') || hasRole('rahbar'); } catch (e) { return false; } }
        function iqtOn() { return typeof flagOn === 'function' && flagOn('iqt') && iqtCan(); }
        function iqtRate() { const c = iqtS().get('_cfg'); return c && +c.rate > 0 ? +c.rate : 0; }
        function iqtSum(x) { return bxNum(x.mat) + bxNum(x.ish) + bxNum(x.yoq) + bxNum(x.bos); }
        function iqtAll(y) { return iqtS().all().filter(x => x.id !== '_cfg' && (!y || String(x.date).slice(0, 4) === String(y))).sort((a, b) => String(b.date).localeCompare(String(a.date))); }
        function iqtVag(no) { no = String(no || '').trim(); return no ? vagonlarData.find(v => !v.kind && vagonNo(v) === no) || null : null; }
        function iqtExpFor(no, y) { const re = new RegExp('(^|\\D)' + String(no).replace(/\D/g, '') + '(\\D|$)'); return bxData().exp.filter(e => String(e.date).slice(0, 4) === String(y) && e.unit && re.test(e.unit)); }
        // ---------- 🔧 Tannarx ----------
        function iqtTanHtml() {
            const L = iqtAll(BX.y), tot = L.reduce((a, x) => a + iqtSum(x), 0), ed = iqtS().canWrite();
            const byV = {}; L.forEach(x => { byV[x.vno] = (byV[x.vno] || 0) + iqtSum(x); });
            Object.keys(byV).forEach(no => { byV[no] += iqtExpFor(no, BX.y).reduce((a, e) => a + bxNum(e.sum), 0); });
            const top = Object.entries(byV).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const byT = {}; L.forEach(x => { const t = byT[x.tur] = byT[x.tur] || { n: 0, s: 0 }; t.n++; t.s += iqtSum(x); });
            return `<div class="mm-flt">${bxYearSel()}<button class="mini-btn" onclick="iqtExcel()">📊 Excel</button></div>
                ${ed ? '<div class="mm-tools"><button class="action-btn" onclick="iqtForm()">➕ Taʼmir tannarxini kiritish</button></div>' : ''}
                <div class="mm-sum"><i class="warn"><b>${fmtSum(tot)}</b>jami tannarx, soʻm</i><i class="no"><b>${L.length}</b>taʼmir</i><i class="ok"><b>${L.length ? fmtSum(tot / L.length) : '—'}</b>oʻrtacha, soʻm</i></div>
                ${Object.keys(byT).length ? `<div class="inf-sec">🔧 Taʼmir turlari boʻyicha</div><div class="gt-scroll"><table class="mt-t"><tr><th>Tur</th><th>Soni</th><th>Jami</th><th>Oʻrtacha</th></tr>${Object.entries(byT).sort((a, b) => b[1].s - a[1].s).map(([t, o]) => `<tr><td>${escapeHtml(t)}</td><td>${o.n}</td><td>${fmtSum(o.s)}</td><td>${fmtSum(o.s / o.n)}</td></tr>`).join('')}</table></div>` : ''}
                ${top.length ? `<div class="inf-sec">🔝 Eng qimmatga tushgan vagonlar (${BX.y})</div>` + top.map(([no, s]) => `<div class="mm-card"><b>Vagon №${escapeHtml(no)} · ${fmtSum(s)} soʻm</b><small>${escapeHtml((iqtVag(no) || {}).type || '')}${iqtExpFor(no, BX.y).length ? ' · 🧾 xarajatlar jurnalidagi yozuvlar ham qoʻshildi' : ''}</small></div>`).join('') : ''}
                <div class="inf-sec">📋 Kiritilgan taʼmirlar</div>
                ${L.slice(0, 60).map(x => `<div class="mm-card"><b>${escapeHtml(fmtD(x.date))} · Vagon №${escapeHtml(x.vno)} · ${fmtSum(iqtSum(x))} soʻm</b><small>${escapeHtml(x.tur)} · material ${fmtSum(x.mat)} · ish haqi ${fmtSum(x.ish)} · yoqilgʻi ${fmtSum(x.yoq)}${bxNum(x.bos) ? ' · boshqa ' + fmtSum(x.bos) : ''}</small>${x.izoh ? `<small>${escapeHtml(x.izoh)}</small>` : ''}${ed ? `<small><u onclick="iqtForm('${x.id}')">✏️ tahrirlash</u> · <u onclick="iqtDel('${x.id}')">🗑 oʻchirish</u></small>` : ''}</div>`).join('') || '<div class="nd-tip">Hali tannarx kiritilmagan. Har bir taʼmirdan keyin material, ish haqi va yoqilgʻi summasini kiriting — vagon va taʼmir turi boʻyicha tannarx oʻzi hisoblanadi.</div>'}`;
        }
        function iqtForm(id) {
            const x = id ? iqtS().get(id) : null, E = escapeHtml, f = (k, l) => `<div class="mm-f"><label>${l}</label><input id="iq_${k}" inputmode="decimal" value="${E(x ? String(x[k] || '') : '')}" placeholder="0"></div>`;
            mdl('iqModal', `<div class="px-h"><b>${x ? '✏️ Tannarxni tahrirlash' : '➕ Taʼmir tannarxi'}</b><button class="mini-btn" onclick="mdlClose('iqModal')">✕</button></div>
                <div class="mm-grid2"><div class="mm-f"><label>Vagon raqami</label><input id="iq_vno" value="${E(x ? x.vno : '')}" placeholder="masalan 8121"></div><div class="mm-f"><label>Sana</label><input type="date" id="iq_date" value="${E(x ? x.date : todayISO())}"></div></div>
                <div class="mm-f"><label>Taʼmir turi</label><select id="iq_tur">${IQT_TUR.map(t => `<option${x && x.tur === t ? ' selected' : ''}>${E(t)}</option>`).join('')}</select></div>
                <div class="mm-grid2">${f('mat', 'Material va ehtiyot qism, soʻm')}${f('ish', 'Ish haqi, soʻm')}</div><div class="mm-grid2">${f('yoq', 'Yoqilgʻi-moylash, soʻm')}${f('bos', 'Boshqa, soʻm')}</div>
                <div class="mm-f"><label>Izoh (hujjat, sabab)</label><input id="iq_izoh" value="${E(x ? x.izoh || '' : '')}"></div>
                <div class="pk-btns"><button onclick="mdlClose('iqModal')">Bekor</button><button class="pr" onclick="iqtSave(${x ? `'${x.id}'` : ''})">💾 Saqlash</button></div>`);
        }
        async function iqtSave(id) {
            const vno = $id('iq_vno').value.trim(), v = iqtVag(vno), o = { vno: vno, vid: v ? v.id : null, date: $id('iq_date').value, tur: $id('iq_tur').value, mat: bxNum($id('iq_mat').value), ish: bxNum($id('iq_ish').value), yoq: bxNum($id('iq_yoq').value), bos: bxNum($id('iq_bos').value), izoh: $id('iq_izoh').value.trim() };
            if (!vno || !o.date) { alert('Vagon raqami va sanani kiriting.'); return; }
            if (!v && !(await uiConfirm('№' + vno + ' raqamli vagon bazada topilmadi. Baribir saqlansinmi?'))) return;
            if (!(iqtSum(o) > 0)) { alert('Kamida bitta summani kiriting.'); return; }
            try { iqtS().put(Object.assign(id ? { id: id } : {}, o)); } catch (e) { alert(e.message); return; }
            mdlClose('iqModal'); iqtRe(); showToast('✅ Saqlandi');
        }
        async function iqtDel(id) { if (!await uiConfirm('Tannarx yozuvi oʻchirilsinmi?')) return; try { iqtS().del(id); } catch (e) { alert(e.message); return; } iqtRe(); }
        function iqtExcel() {
            const L = iqtAll(BX.y); xlsxDl([['Sana', 'Vagon', 'Taʼmir turi', 'Material', 'Ish haqi', 'Yoqilgʻi', 'Boshqa', 'Jami', 'Izoh']].concat(L.map(x => [x.date, x.vno, x.tur, bxNum(x.mat), bxNum(x.ish), bxNum(x.yoq), bxNum(x.bos), iqtSum(x), x.izoh || ''])), 'Tannarx ' + BX.y);
        }
        // ---------- ⏳ Turib qolish (soʻmda) ----------
        function iqtMonth() { return IQ.m || todayISO().slice(0, 7); }
        function iqtMonthSel() { const cur = iqtMonth(), L = Array.from({ length: 12 }, (_, i) => iqtShift(todayISO().slice(0, 7), -i)); return `<select onchange="IQ.m=this.value; bxRender()">${L.map(m => `<option value="${m}"${m === cur ? ' selected' : ''}>${m}</option>`).join('')}</select>`; }
        function iqtRange(m) { const a = new Date(m + '-01T00:00:00'), b = new Date(a); b.setMonth(b.getMonth() + 1); return [a.getTime(), Math.min(b.getTime(), Date.now())]; }
        function iqtIdleHtml() {
            if (typeof dispPeriod !== 'function') return '<div class="nd-tip">Dispetcherlik boʻlimi yoqilmagan.</div>';
            const m = iqtMonth(), [a, b] = iqtRange(m), P = dispPeriod(a, b), r = iqtRate(), ed = iqtS().canWrite();
            const S = Object.entries(P.sab).sort((x, y) => y[1] - x[1]), V = Object.entries(P.per).sort((x, y) => y[1] - x[1]).slice(0, 10);
            const vn = id => { const v = vagonlarData.find(x => String(x.id) === String(id)); return v ? hrName(v) : '№' + id; };
            return `<div class="mm-flt">${iqtMonthSel()}</div>
                <div class="mm-sum"><i class="warn"><b>${Math.round(P.tot)}</b>vagon-soat turib qolish</i><i class="${r ? 'bad' : 'no'}"><b>${r ? fmtSum(P.tot * r) : '—'}</b>yoʻqotish, soʻm</i></div>
                <div class="mm-card"><b>Vagon-soat narxi: ${r ? fmtSum(r) + ' soʻm' : 'kiritilmagan'}</b><small>Bir vagon bir soat bekor turganda korxonaga qanchaga tushadi (ijara narxi yoki soatlik amortizatsiya + saqlash). Iqtisodiyot boʻlimi belgilaydi.</small>${ed ? `<small><u onclick="iqtRateSet()">✏️ ${r ? 'oʻzgartirish' : 'kiritish'}</u></small>` : ''}</div>
                <div class="inf-sec">🧭 Sabablar boʻyicha</div>${S.length ? `<div class="gt-scroll"><table class="mt-t"><tr><th>Sabab</th><th>Vagon-soat</th>${r ? '<th>Soʻm</th>' : ''}</tr>${S.map(([k, h]) => `<tr><td>${escapeHtml(k)}</td><td>${Math.round(h)}</td>${r ? `<td>${fmtSum(h * r)}</td>` : ''}</tr>`).join('')}</table></div>` : '<div class="nd-tip">Bu oyda turib qolish qayd etilmagan (holatlar «Harakat tarkibi»da belgilanadi).</div>'}
                ${V.length ? '<div class="inf-sec">🔝 Eng koʻp turgan vagonlar</div>' + V.map(([id, h]) => `<div class="mm-card"><b>${escapeHtml(vn(id))}</b><small>${dispHrs(h)}${r ? ' · ' + fmtSum(h * r) + ' soʻm' : ''}</small></div>`).join('') : ''}`;
        }
        async function iqtRateSet() {
            const v = await uiPrompt('Bir vagon-soat narxi (soʻm):', String(iqtRate() || '')); if (v === null || v === undefined) return; const n = bxNum(v);
            if (!(n >= 0)) return; try { iqtS().put({ id: '_cfg', rate: n }); } catch (e) { alert(e.message); return; } iqtRe();
        }
        // ---------- 🧠 Tahlil: bu oy va oʻtgan oy ----------
        function iqtShift(m, k) { let y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 + k; y += Math.floor(mo / 12); mo = ((mo % 12) + 12) % 12; return y + '-' + String(mo + 1).padStart(2, '0'); } // mahalliy vaqt zonasiga bog'liq emas
        function iqtPrev(m) { return iqtShift(m, -1); }
        function iqtFacts(m) { return bxFact(m.slice(0, 4), m.slice(5, 7)); }
        function iqtAnalysis(m) {
            m = m || iqtMonth(); const p = iqtPrev(m), A = iqtFacts(m), B = iqtFacts(p), sum = o => Object.values(o).reduce((x, y) => x + y, 0);
            const ta = sum(A), tb = sum(B), cats = BUX_CATS.map(([id, t]) => ({ id: id, t: t, a: A[id] || 0, b: B[id] || 0, d: (A[id] || 0) - (B[id] || 0) })).filter(c => c.a || c.b).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
            const big = bxData().exp.filter(e => String(e.date).slice(0, 7) === m).sort((x, y) => bxNum(y.sum) - bxNum(x.sum)).slice(0, 5);
            const plan = bxData().plan[m.slice(0, 4)] || {}, mi = +m.slice(5, 7), ytd = {}; for (let i = 1; i <= mi; i++) { const f = bxFact(m.slice(0, 4), String(i).padStart(2, '0')); Object.keys(f).forEach(k => { ytd[k] = (ytd[k] || 0) + f[k]; }); }
            const over = BUX_CATS.filter(([id]) => bxNum(plan[id]) > 0 && (ytd[id] || 0) > bxNum(plan[id]) * mi / 12).map(([id, t]) => ({ t: t, f: ytd[id] || 0, p: bxNum(plan[id]) * mi / 12 }));
            let idle = null; if (typeof dispPeriod === 'function') { const [a, b] = iqtRange(m), P = dispPeriod(a, b); idle = { h: P.tot, s: iqtRate() ? P.tot * iqtRate() : 0 }; }
            const tan = iqtAll().filter(x => String(x.date).slice(0, 7) === m).reduce((x, y) => x + iqtSum(y), 0);
            return { m: m, p: p, ta: ta, tb: tb, cats: cats, big: big, over: over, idle: idle, tan: tan };
        }
        function iqtExplainText(R) {
            R = R || iqtAnalysis(); const pct = R.tb ? Math.round((R.ta - R.tb) / R.tb * 100) : null, L = [];
            L.push(`📊 ${R.m} xarajatlari: ${fmtSum(R.ta)} soʻm` + (R.tb ? `, oʻtgan oy (${R.p}) — ${fmtSum(R.tb)} soʻm: ${R.ta >= R.tb ? '+' : ''}${fmtSum(R.ta - R.tb)} soʻm (${pct >= 0 ? '+' : ''}${pct}%).` : '. Oʻtgan oy boʻyicha maʼlumot yoʻq.'));
            const up = R.cats.filter(c => c.d > 0).slice(0, 3), dn = R.cats.filter(c => c.d < 0).slice(0, 2);
            if (up.length) L.push('⬆️ Asosan oshgan: ' + up.map(c => `${c.t} (+${fmtSum(c.d)})`).join(', ') + '.');
            if (dn.length) L.push('⬇️ Kamaygan: ' + dn.map(c => `${c.t} (${fmtSum(c.d)})`).join(', ') + '.');
            if (R.big.length) L.push('🧾 Eng katta xarajatlar: ' + R.big.slice(0, 3).map(e => `${fmtSum(e.sum)} — ${bxCat(e.cat)}${e.unit ? ' (' + e.unit + ')' : ''}${e.note ? ', ' + e.note : ''}`).join('; ') + '.');
            if (R.over.length) L.push('⚠️ Yillik rejadan oshib ketayotgan moddalar (shu oygacha): ' + R.over.map(o => `${o.t} — ${fmtSum(o.f)} / reja ${fmtSum(o.p)}`).join('; ') + '.');
            if (R.idle && R.idle.h > 0) L.push(`⏳ Vagonlar ${Math.round(R.idle.h)} vagon-soat bekor turdi` + (R.idle.s ? ` ≈ ${fmtSum(R.idle.s)} soʻm yoʻqotish.` : ' (soʻmda hisoblash uchun vagon-soat narxini kiriting).'));
            if (R.tan) L.push(`🔧 Shu oy kiritilgan taʼmir tannarxi: ${fmtSum(R.tan)} soʻm.`);
            L.push('📚 Manba: xarajatlar jurnali, reja, dispetcherlik va tannarx yozuvlari (raqamlarni formula hisoblaydi).');
            return L.join('\n');
        }
        function iqtTahHtml() {
            const R = iqtAnalysis(), mx = Math.max(1, ...R.cats.map(c => Math.max(c.a, c.b)));
            return `<div class="mm-flt">${iqtMonthSel()}</div>
                <div class="mm-sum"><i class="warn"><b>${fmtSum(R.ta)}</b>${R.m}, soʻm</i><i class="no"><b>${fmtSum(R.tb)}</b>${R.p}, soʻm</i><i class="${R.ta > R.tb ? 'bad' : 'ok'}"><b>${R.tb ? (R.ta >= R.tb ? '+' : '') + Math.round((R.ta - R.tb) / R.tb * 100) + '%' : '—'}</b>oʻzgarish</i></div>
                <div class="mm-card iq-ex">${escapeHtml(iqtExplainText(R)).replace(/\n/g, '<br>')}</div>
                ${R.cats.length ? `<div class="inf-sec">Moddalar: bu oy va oʻtgan oy</div>` + R.cats.map(c => `<div class="iq-bar"><span>${escapeHtml(c.t)}</span><i style="width:${Math.round(c.b / mx * 100)}%" class="p"></i><i style="width:${Math.round(c.a / mx * 100)}%" class="c"></i><small>${fmtSum(c.b)} → <b>${fmtSum(c.a)}</b> (${c.d >= 0 ? '+' : ''}${fmtSum(c.d)})</small></div>`).join('') + '<div class="nd-tip">Kulrang — oʻtgan oy, koʻk — bu oy.</div>' : '<div class="nd-tip">Bu va oʻtgan oyda xarajat kiritilmagan.</div>'}`;
        }
        (function () {
            const st = document.createElement('style');
            st.textContent = '.iq-ex{line-height:1.55;font-size:13.5px}.iq-bar{margin:8px 0}.iq-bar span{display:block;font-size:12.5px;margin-bottom:3px}.iq-bar i{display:block;height:7px;border-radius:4px;margin:2px 0;min-width:2px}.iq-bar i.p{background:#64748b}.iq-bar i.c{background:#38bdf8}.iq-bar small{opacity:.8;font-size:11.5px}@media (min-width:720px){.iq-ex{font-size:15px}.iq-bar i{height:10px}}';
            document.head.appendChild(st);
            if (typeof agmkModule === 'function') agmkModule({ id: 'iqt', icon: '📊', title: 'Iqtisodiyot: tannarx va tahlil', search: 'iqtisodiyot tannarx tahlil xarajat oshdi turib qolish zarar', flag: 'iqt', def: 'pilot', roles: ['bux', 'rahbar'], card: false, desc: 'Buxgalteriya ekranida: taʼmir tannarxi, turib qolish soʻmda, oylik tahlil', open: () => openBux('tah') });
            // AI: «nega xarajat oshdi», «bu oy tahlil», «tannarx» — faqat vakolatli xodimga
            if (typeof aiStage === 'function') aiStage('Iqtisodiy tahlil (xarajat nega oshdi, tannarx, turib qolish zarari)', function (q, next) {
                try {
                    const n = String(q || '').toLowerCase();
                    if (!/(xarajat|harajat|tannarx|iqtisod|zarar|yo.?qotish)/.test(n) || !/(nega|nima uchun|sabab|osh|ko.?pay|kamay|tahlil|qancha|bu oy)/.test(n)) return next(q);
                    if (!iqtOn()) return next(q);
                    return { t: iqtExplainText(), personal: false };
                } catch (e) { return next(q); }
            });
        })();

