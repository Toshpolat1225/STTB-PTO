        // =====================================================================
        // v2.0 — DALOLATNOMALAR: foydalanuvchi bergan tayyor shablonlar bo'yicha
        //  • "O'q sinishi (noxush hodisadan keyingi texnik holat)" — 5/6/7-AKT namunasi
        //  • "Sinov jarayonlari" — OOO «GOODWILL BEARINGS» namunasi
        //  • «TASDIQLAYMAN» sanasi avtomatik, sanalar mosligini tekshirish, «v.b.» belgisi
        //  • Word/PDF: Times New Roman 12, shablondagi hoshiyalar, «–» ro'yxat, rasmlar har biri alohida varaqda
        // =====================================================================
        // ---------- Shablonlardagi imzo chekuvchilar (ro'yxatda yo'q bo'lsa qo'shiladi) ----------
        (function () {
            try {
                if (localStorage.getItem('agmk_nd_sign41') === '1') return;
                const add = [
                    { l: 'uz', r: 'STTB bosh muhandisi', n: '@@N:293@@', ap: true },
                    { l: 'uz', r: "VX boshlig‘i o‘rinbosari", n: '@@N:373@@' },
                    { l: 'uz', r: "ICHTB boshlig‘i v.b.", n: '@@N:306@@' },
                    { l: 'uz', r: "ICHTB t/y harakat tarkibi bo‘yicha muhandisi", n: 'A.Tojimurodov' },
                    { l: 'uz', r: '2-TYS uchastka ustasi', n: '@@N:333@@' }
                ];
                const key = n => String(n || '').toLowerCase().replace(/^[a-z]{1,2}\.\s*([a-z]\.\s*)?/, '').replace(/[^a-z]/g, '');
                const has = (list, x) => list.some(s => s.l === x.l && key(s.n) === key(x.n));
                add.forEach(x => { if (!has(ND_SIGN_DEF, x)) ND_SIGN_DEF.push(x); });
                const cur = ndGet(ND_SIGN_KEY, null);
                if (cur) { add.forEach(x => { if (!has(cur, x)) cur.push(x); }); ndSet(ND_SIGN_KEY, cur); }
                localStorage.setItem('agmk_nd_sign41', '1');
            } catch (e) { console.error(e); }
        })();

        // ---------- Yangi turlar ----------
        ND_TYPES.oq_sinish = { l: 'uz', t: "O‘q sinishi — noxush hodisadan keyingi texnik holat to‘g‘risida", ex: '' };
        ND_TYPES.sinov = { l: 'uz', t: "Sinov jarayonlari to‘g‘risida", ex: "14-sentyabr kuni “Fabrichnaya” stansiyasida 18-texnologik sostavga M-659.000 tipidagi 192 dona kompozitsion tormoz kolodkasi o‘rnatildi\n15-sentyabr kuni 00018458, 00019431 vagonlarida har biridan 4 dona kolodka yechib olindi, **umumiy bosib o‘tilgan masofa 720 km**, texnik nosozlik aniqlanmadi" };
        var OQ_JOY = ["o‘rta qismi", 'sheyka qismi', "gupchak osti qismi", "gupchak oldi qismi"];
        var OQ_XUL = "Yuqoridagi ma’lumotlarga asoslangan holda, tekshiruv a’zolari o‘qning sinishining asosiy sababi g‘ildirak juftligiga doimiy ta’sir qiluvchi siklik yuklar va o‘q metalining charchashi deb hisoblanadi.";
        function oqDef() { return { tip: '', gj: '', joyS: OQ_JOY[0], korr: '', vx: '', defS: '', defK: '', dfM: 'УД4-Т', dfN: '11115', yil: '', orn: '', ornJ: '', xul: OQ_XUL, annex: true }; }
        function ndOq() { const f = ND.form; if (!f.oq) f.oq = oqDef(); return f.oq; }
        function ndSin() { const f = ND.form; if (!f.sin) f.sin = { intro: '', xul: '' }; return f.sin; }
        const ND41_IDS = ['tip', 'gj', 'joyS', 'korr', 'vx', 'defS', 'defK', 'dfM', 'dfN', 'yil', 'orn', 'ornJ', 'xul'];
        (function () {
            ndFormSync = agmkExtend('ndFormSync', 'ndFormSync', ndFormSync, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const f = ND.form; if (!f) return r;
                    if ($id('ndOq_gj')) { const q = ndOq(); ND41_IDS.forEach(k => { const e = $id('ndOq_' + k); if (e) q[k] = e.value; }); const a = $id('ndOq_annex'); if (a) q.annex = a.checked; }
                    if ($id('ndSin_xul')) { const s = ndSin(); s.xul = $id('ndSin_xul').value; }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // Kirill -> lotin (GJ26 jadvalidagi yozuvlar uchun)
        function nd41Lat(s) { try { return typeof trC2L === 'function' ? trC2L(s) : s; } catch (e) { return s; } }
        function nd41Iso(d) { const m = String(d || '').match(/(\d{2})\.(\d{2})\.(\d{4})/); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }
        function ndOqFind() {
            const f = ND.form, no = String(f.vag || '').replace(/\D/g, '').replace(/^0+/, '');
            const L = (typeof GJ26 !== 'undefined' ? GJ26 : []);
            let c = no ? L.filter(x => String(x.vagon).replace(/^0+/, '') === no) : [];
            if (!c.length && f.sana) c = L.filter(x => nd41Iso(x.sana) === (f.hsSame !== false ? f.sana : (f.hs || f.sana)));
            if (c.length > 1 && f.sana) c.sort((a, b) => Math.abs(new Date(nd41Iso(a.sana)) - new Date(f.sana)) - Math.abs(new Date(nd41Iso(b.sana)) - new Date(f.sana)));
            return c[0] || null;
        }
        function ndOqFill() {
            ndFormSync(); const f = ND.form, q = ndOq(), g = ndOqFind();
            if (!g) { alert("2026-yil gʻildirak juftligi sinishlari jadvalida bu vagon (yoki shu sana) topilmadi.\nMaʼlumotlarni qoʻlda kiriting."); return; }
            if (!f.vag) f.vag = g.vagon;
            if (!f.hsSame && !f.hs) f.hs = nd41Iso(g.sana);
            if (f.hsSame !== false && nd41Iso(g.sana) && f.sana !== nd41Iso(g.sana)) { f.hsSame = false; f.hs = nd41Iso(g.sana); }
            q.gj = g.gildirak || q.gj;
            q.joyS = /шейк/i.test(g.joy) ? 'sheyka qismi' : /ўрта|урта|орта/i.test(g.joy) ? "o‘rta qismi" : (nd41Lat(g.joy || '').toLowerCase() || q.joyS);
            q.vx = nd41Iso(g.gl_tamir) || q.vx; q.defS = nd41Iso(g.defekt) || q.defS;
            q.defK = g.kim ? nd41Lat(g.kim).trim().replace(/^(\S+)\s+(\S+?)\.?$/, (m, f, i) => i.charAt(0).toUpperCase() + i.slice(1) + '.' + f.charAt(0).toUpperCase() + f.slice(1)) : q.defK;
            q.yil = g.yil || q.yil;
            q.ornJ = /^В[СХ]$/i.test(String(g.qoyilgan).trim()) ? 'VX' : /1-ТЙЦ/i.test(g.qoyilgan) ? '1-TYS VTP' : (nd41Lat(g.qoyilgan || '') || q.ornJ);
            const v = onlyVagons().find(x => String(vagonNo(x)).replace(/^0+/, '') === String(g.vagon).replace(/^0+/, ''));
            if (!q.tip) q.tip = nd41Tip(v) || '2VS-105';
            ND.oqSrc = g; ndRender();
            showToast('✅ Jadvaldan toʻldirildi: ' + g.sana + ', vagon ' + g.vagon + ', gʻildirak ' + g.gildirak + " — oʻrnatilgan sanani tekshiring");
        }
        function nd41Tip(v) { if (!v) return ''; const s = String(v.model || v.naim || v.tip || ''); const m = s.match(/\d\s*[ВвVv][СсSs]\s*-?\s*\d{2,3}[A-Za-zА-Яа-я]?/); return m ? m[0].replace(/\s+/g, '').replace(/В/g, 'V').replace(/С/g, 'S').replace(/(\d)VS-?/, '$1VS-') : ''; }
        (function () {
            ndRenderAkt = agmkExtend('ndRenderAkt', 'ndRenderAkt', ndRenderAkt, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const f = ND.form; if (!f) return r;
                    const ta = $id('ndText'), ob = $id('ndObj');
                    if (f.tur === 'oq_sinish') {
                        const q = ndOq();
                        if (ta) ta.closest('.nd-f').style.display = 'none'; if (ob) ob.closest('.nd-f').style.display = 'none';
                        const vg = $id('ndVag'); if (vg) vg.placeholder = '00013412';
                        const E = escapeHtml, inp = (k, lab, ph, type) => `<div class="nd-f"><label>${lab}</label><input id="ndOq_${k}" ${type ? 'type="' + type + '"' : ''} value="${E(q[k] || '')}" placeholder="${E(ph || '')}"></div>`;
                        const box = document.createElement('div'); box.className = 'nd-oq';
                        box.innerHTML = `<div class="nd-oq-h">⚙️ Gʻildirak juftligi va oʻq maʼlumotlari <button type="button" class="nd-oq-fill" onclick="ndOqFill()">📥 Sinishlar jadvalidan toʻldirish</button> <label class="nd-oq-fill" style="cursor:pointer">🔄 Jadvalni yangilash (Excel)<input type="file" accept=".xls,.xlsx" style="display:none" onchange="gjImport(this)"></label></div>
                            ${inp('tip', 'VAGON TIPI', '2VS-105')}${inp('gj', 'GʻILDIRAK JUFTLIGI RAQAMI', '0005425180')}
                            <div class="nd-f"><label>SINISH JOYI (oʻqning)</label><select id="ndOq_joyS">${OQ_JOY.concat(OQ_JOY.includes(q.joyS) ? [] : [q.joyS]).map(x => `<option${x === q.joyS ? ' selected' : ''}>${E(x)}</option>`).join('')}</select></div>
                            ${inp('korr', 'KORROZIYA — ko‘ndalang kesim yuzasining % yoki «bor» (bo‘sh qolsa band chiqmaydi)', '10')}
                            ${inp('vx', 'VX DA OXIRGI TAʼMIRLANGAN SANA', '', 'date')}
                            ${inp('defS', 'ВУ-53 JURNALI: DEFEKTOSKOPIYA SANASI', '', 'date')}${inp('defK', 'OPERATOR DEFEKTOSKOPIST', '@@N:363@@')}
                            <div class="nd-2">${inp('dfM', 'DEFEKTOSKOP', 'УД4-Т')}${inp('dfN', 'ZAVOD RAQAMI', '11115')}</div>
                            ${inp('yil', 'OʻQNING FOYDALANISHGA TOPSHIRILGAN YILI', '2022')}
                            <div class="nd-2">${inp('orn', 'VAGONGA OʻRNATILGAN SANA', '', 'date')}${inp('ornJ', 'QAYERDA OʻRNATILGAN', 'VX / 1-TYS VTP')}</div>
                            <div class="nd-f"><label>XULOSA</label><textarea id="ndOq_xul" rows="3">${E(q.xul || '')}</textarea></div>
                            <label class="nd-chk"><input type="checkbox" id="ndOq_annex" ${q.annex !== false ? 'checked' : ''}> 📎 Ilova: RD (2012) dan koʻchirma — 25.1-jadval (3.23–3.25) va «Приложение Ж» (4 varaq)</label>
                            ${ND.oqSrc ? `<div class="nd-tip">📥 Manba: «2026-yil gʻildirak juftligi sinishlari» jadvali, ${E(ND.oqSrc.n)}-qator (${E(ND.oqSrc.sana)}). Oʻrnatilgan sana jadvalda yoʻq — qoʻlda kiriting.</div>` : ''}`;
                        const anchor = vg ? vg.closest('.nd-f') : null; if (anchor) anchor.after(box);
                        const btn = [...document.querySelectorAll('#ndBody .action-btn')].find(b => /AI bilan akt tuzish/.test(b.textContent)); if (btn) btn.innerHTML = '📄 Dalolatnomani shablon boʻyicha tuzish';
                    } else if (f.tur === 'sinov') {
                        const s = ndSin();
                        if (ta) { const lb = ta.closest('.nd-f').querySelector('label'); if (lb) lb.textContent = "SINOV BOSQICHLARI — har qatorda bitta (sana bilan). **qalin** — qalin yoziladi"; }
                        if (ob) { const lb = ob.closest('.nd-f').querySelector('label'); if (lb) lb.textContent = 'SINALGAN MAHSULOT VA FIRMA'; ob.placeholder = 'OOO “GOODWILL BEARINGS” firmasi kompozitsion tormoz kolodkalari'; }
                        const box = document.createElement('div'); box.className = 'nd-f';
                        box.innerHTML = `<label>XULOSA (normativ hujjat bilan)</label><textarea id="ndSin_xul" rows="4" placeholder="OOO “GOODWILL BEARINGS” firmasi kompozitsion tormoz kolodkalarini oʻtkazilgan sinov jarayonlari **334211-2015-sonli «…» talablari** ga muvofiq ...">${escapeHtml(s.xul || '')}</textarea>`;
                        if (ta) ta.closest('.nd-f').after(box);
                    }
                    // «v.b.» (vazifasini bajaruvchi) belgisi — tasdiqlovchi va komissiya a'zolari uchun
                    const lists = document.querySelectorAll('#ndBody .nd-signers');
                    const vb = (el, on, js) => { if (!el || el.querySelector('.nd-vb')) return; const b = document.createElement('button'); b.className = 'nd-vb' + (on ? ' on' : ''); b.title = 'vazifasini bajaruvchi'; b.textContent = 'v.b.'; b.setAttribute('onclick', js); const x = el.querySelector('button'); if (x) el.insertBefore(b, x); else el.appendChild(b); };
                    if (lists[0] && f.apObj) vb(lists[0].querySelector('.nd-signer'), /\sv\.b\.$/.test(f.apObj.r), 'nd41Vb(-1)');
                    if (lists[1]) lists[1].querySelectorAll('.nd-signer').forEach((el, k) => { if (f.com[k]) vb(el, /\sv\.b\.$/.test(f.com[k].r), 'nd41Vb(' + k + ')'); });
                    const ww = $id('ndDateWarn'); if (ww) ww.remove();
                    if (ND.html) { const iss = nd41DateIssues(ND.html); if (iss.length) { const d = document.createElement('div'); d.id = 'ndDateWarn'; d.className = 'nd-trinfo warn'; d.innerHTML = '⚠️ ' + iss.map(escapeHtml).join('<br>⚠️ '); const pg = $id('ndPage'); if (pg) pg.before(d); } }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        function nd41Vb(k) {
            ndFormSync(); const f = ND.form, t = k < 0 ? f.apObj : f.com[k]; if (!t) return;
            t.r = /\sv\.b\.$/.test(t.r) ? t.r.replace(/\s+v\.b\.$/, '') : t.r.replace(/\s+$/, '') + ' v.b.';
            ndRender();
        }
        // ---------- Sanalar ----------
        const OY41 = { uz: OY_UZ, ru: OY_RU };
        function nd41ApDate(iso, l) { const d = new Date((iso || todayISO()) + 'T00:00:00'); return l === 'ru' ? '«' + String(d.getDate()).padStart(2, '0') + '» ' + OY_RU[d.getMonth()] + ' ' + d.getFullYear() + ' г.' : '«' + String(d.getDate()).padStart(2, '0') + '» ' + OY_UZ[d.getMonth()] + ' ' + d.getFullYear() + '-y.'; }
        // Hujjatdagi «TASDIQLAYMAN» sanasi va sarlavha sanasi bir-biriga mosmi?
        function nd41DateIssues(html) {
            const box = document.createElement('div'); box.innerHTML = html; const out = [];
            const ap = box.querySelector('.a-approve'), hd = box.querySelector('.a-head');
            const hdT = hd ? hd.textContent : '';
            let hdD = null; const m1 = hdT.match(/(\d{2})\.(\d{2})\.(\d{4})/); if (m1) hdD = m1[3] + '-' + m1[2] + '-' + m1[1];
            if (!hdD) { const m2 = hdT.match(/«?(\d{1,2})»?\s+([a-zа-яё‘’']+)\s+(\d{4})/i); if (m2) { const i = OY_UZ.concat(OY_RU).findIndex(o => o.toLowerCase() === m2[2].toLowerCase()); if (i >= 0) hdD = m2[3] + '-' + String(i % 12 + 1).padStart(2, '0') + '-' + String(m2[1]).padStart(2, '0'); } }
            if (ap) { const m = ap.textContent.match(/«\s*(\d{1,2})\s*»\s*([a-zа-яё‘’']+)\s+(\d{4})/i);
                if (m) { const i = OY_UZ.concat(OY_RU).findIndex(o => o.toLowerCase() === m[2].toLowerCase()); const apD = i >= 0 ? m[3] + '-' + String(i % 12 + 1).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0') : null;
                    if (apD && hdD && apD !== hdD) out.push('«TASDIQLAYMAN» sanasi (' + fmtISO(apD) + ') hujjat sanasidan (' + fmtISO(hdD) + ') farq qiladi.'); } }
            // Matn ichidagi eng katta sana hujjat sanasidan keyin bo'lmasligi kerak
            if (hdD) { const all = [...box.textContent.matchAll(/\b(\d{2})\.(\d{2})\.(\d{4})\b/g)].map(m => m[3] + '-' + m[2] + '-' + m[1]).filter(d => d > hdD); if (all.length) out.push('Matnda hujjat sanasidan keyingi sana bor: ' + fmtISO(all.sort().pop()) + '.'); }
            return out;
        }
        async function nd41DateOk() {
            const p = $id('ndPage'); if (!p) return true; const iss = nd41DateIssues(p.innerHTML); if (!iss.length) return true;
            return await uiConfirm('⚠️ Sanalarni tekshiring:\n\n' + iss.join('\n') + '\n\nBaribir davom etilsinmi?');
        }

        // ---------- Shablon bo'yicha HTML ----------
        function nd41Sign(f) { return `<table class="a-sign">${f.com.map(c => `<tr><td class="l">${escapeHtml(c.r)}</td><td class="m"></td><td class="r">${escapeHtml(c.n)}</td></tr>`).join('')}</table>`; }
        function nd41Head(f) {
            const E = escapeHtml, ap = f.apObj && f.apObj.n ? f.apObj : null; let h = '';
            if (ap) h += `<div class="a-approve">“TASDIQLAYMAN”<br>${E(ap.r)}<br>_________ ${E(ap.n)}<br>${nd41ApDate(f.sana, 'uz')}</div>`;
            h += `<div class="a-head"><span>Olmaliq sh.</span><span>${fmtISO(f.sana)}-y.</span></div>`;
            return h;
        }
        function nd41Bold(s) { return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
        function nd41BuildOq(f) {
            const q = ndOq(), E = escapeHtml, miss = [], v = (x, lab) => { if (String(x || '').trim()) return E(String(x).trim()); miss.push(lab); return '______'; };
            const dd = (iso, lab) => { if (iso) return fmtISO(iso) + '-y.'; miss.push(lab); return '__.__.____-y.'; };
            const hs = f.hsSame !== false || !f.hs ? f.sana : f.hs;
            const joy = String(f.joy || '').trim().replace(/\s+(bekati|stansiyasi|st\.?)$/i, '');
            let h = nd41Head(f);
            h += `<p class="a-ctr">${v(q.tip, 'vagon tipi')} tipidagi vagon-samosvalning noxush hodisadan keyingi texnik holati to‘g‘risida</p><div class="a-title">DALOLATNOMA</div>`;
            h += `<p>Biz quyidagi imzo chekuvchilar: ${E(f.com.map(c => c.r + ' ' + c.n).join(', '))}, tuzilayotgan dalolatnoma shu haqidaki, ${fmtISO(hs)}-y. ${joy ? E(joy) + ' bekatida' : v('', 'bekat') + ' bekatida'} zavod raqami ${v(f.vag, 'vagon zavod raqami')} bo‘lgan vagon-samosvalning o‘qning ${E(q.joyS || OQ_JOY[0])} singandan keyin ${v(q.gj, 'gʻildirak juftligi raqami')}-raqamli g‘ildirak juftligining ta’mirlash hujjatlarini tekshirish va texnik holatini ko‘rikdan o‘tkazishda quyidagilar aniqlandi:</p>`;
            const li = [];
            const kr = String(q.korr || '').trim().replace(/%$/, ''); if (/^\d+([.,]\d+)?$/.test(kr)) li.push(`Sinish joyida korroziya mavjud va sinish nuqtasi ko‘ndalang kesim yuzasining ${E(kr)}% tashkil qiladi.`); else if (kr && !/^(yo.q|yoq|aniqlanmadi|нет)$/i.test(kr)) li.push(`Sinish joyida korroziya mavjud${/^(bor|mavjud|ha)$/i.test(kr) ? '' : ' (' + E(kr) + ')'}.`);
            li.push(`${v(q.gj, 'gʻildirak juftligi raqami')}-raqamli g‘ildirak juftligi VX da oxirgi marta ${dd(q.vx, 'VX taʼmir sanasi')} ta’mirlangan.`);
            li.push(`ВУ-53 jurnaliga ko‘ra ${dd(q.defS || q.vx, 'defektoskopiya sanasi')} da nuqsonlarni aniqlash operator defektoskopisti ${v(q.defK, 'defektoskopist')} tomonidan qayd etilgan va nosozlik aniqlanmagan.`);
            li.push(`Zavod raqami ${v(q.dfN, 'defektoskop raqami')} bo‘lgan ${v(q.dfM, 'defektoskop')} nuqsonlarni aniqlash avtomatik taxlil va ishlov berish defektoskopi bilan tekshirilgan. Shuningdek, nuqsonlarni aniqlash defektoskopida elektron ma’lumotlar va ushbu ${v(q.gj, 'gʻildirak juftligi raqami')}-raqamli o‘qni tekshiruvi o‘tkazilganligi versiyasi mavjud.`);
            li.push(`O‘qning foydalanishga topshirilgan yili ${v(q.yil, 'oʻq yili')}-y.`);
            li.push(`Ushbu g‘ildirak juftligi ${dd(q.orn, 'oʻrnatilgan sana')} da ${q.ornJ ? E(q.ornJ.trim()) + (/da$/i.test(q.ornJ.trim()) ? '' : 'da') : v('', 'oʻrnatilgan joy')} zavod raqami ${v(f.vag, 'vagon zavod raqami')} vagon-samosvalga o‘rnatilgan.`);
            h += li.map(x => `<p class="a-li">${x}</p>`).join('');
            h += `<p>${nd41Bold(q.xul || OQ_XUL)}</p>`;
            h += nd41Sign(f);
            if (q.annex !== false && typeof ND_OQ_ANNEX !== 'undefined') h += `<div class="alb-annex nd-norm"><div class="a-title">ILOVA: NORMATIV HUJJATDAN KOʻCHIRMA</div><p class="a-ctr">«Руководящий документ по ремонту и техническому обслуживанию колесных пар с буксовыми узлами грузовых вагонов магистральных железных дорог колеи 1520 (1524 мм)», 2012</p>${ND_OQ_ANNEX.map((a, i) => `<div class="alb-fig"><img src="${a.src}" data-w="${a.w}" data-h="${a.h}" alt=""><p class="ni">${i + 1}-varaq. ${E(a.t)}</p></div>`).join('')}</div>`;
            return { html: h, miss: [...new Set(miss)] };
        }
        function nd41BuildSin(f, lines) {
            const s = ndSin(), E = escapeHtml; let h = nd41Head(f);
            const obj = String(f.obj || '').trim();
            h += `<p class="a-ctr">${obj ? E(obj) + 'ni ' : ''}o‘tkazilgan sinov jarayonlari to‘g‘risida</p><div class="a-title">DALOLATNOMA</div>`;
            const vg = String(f.vag || '').trim();
            h += `<p>Biz quyida imzo chekuvchilar, ${E(f.com.map(c => c.r + ' ' + c.n).join(', '))}, ushbu dalolatnomani tuzdik shu haqidaki, ${nd41ApDate(f.hsSame !== false || !f.hs ? f.sana : f.hs, 'uz').replace(/[«»]/g, '').replace(/^(\d+) (\S+) (\d{4})-y\.$/, '$3-yil $1-$2')} kuni${f.joy ? ' “' + E(f.joy.trim()) + '” stansiyasida' : ''}${vg ? ' ' + E(vg) + ' raqamli vagon(lar)da' : ''} ${obj ? E(obj) + 'ning' : 'mahsulotning'} sinov jarayonida texnik holati tekshiruvdan o‘tkazilganda quyidagilar aniqlandi.</p>`;
            h += lines.map(x => `<p class="a-li a-dot">${nd41Bold(ndFmtLine(x, 'uz'))}.</p>`).join('');
            if (String(s.xul || '').trim()) h += `<p><b>Xulosa:</b> ${nd41Bold(s.xul.trim())}</p>`;
            h += nd41Sign(f);
            return h;
        }
        // Barcha dalolatnomalarda «TASDIQLAYMAN» sanasi hujjat sanasi bilan to'ldiriladi (shablondagidek)
        function nd41FillAp(html, f, l) {
            return html.replace(/«____» ______________ (\d{4})-y\./, () => nd41ApDate(f.sana, 'uz')).replace(/«____» ______________ (\d{4}) г\./, () => nd41ApDate(f.sana, 'ru'));
        }
        (function () {
            ndGenerate = agmkExtend('ndGenerate', 'ndGenerate', ndGenerate, o => async function (keepSugg) {
                ndFormSync(); const f = ND.form;
                if (f && (f.tur === 'oq_sinish' || f.tur === 'sinov')) {
                    f.lang = 'uz';
                    if (!f.com.length) { alert("Kamida bitta komissiya aʼzosini (imzo chekuvchini) tanlang."); return; }
                    let used = [];
                    if (f.tur === 'oq_sinish') {
                        const au = nd41OqAuto(f); const b = nd41BuildOq(f); ND.html = b.html; ND.sugg = []; ND.oqAu = au;
                        used = [{ title: "«Руководящий документ по ремонту и техническому обслуживанию колесных пар…», 2012 — 25.1-jadval (3.23–3.25), «Приложение Ж»", src: '5/6/7-AKT namunalari (foydalanuvchi shabloni)' }];
                        if (ND.oqSrc) used.push({ title: "2026-yil gʻildirak juftligi sinishlari jadvali, " + ND.oqSrc.n + '-qator', src: 'Kiritilgan jadval' });
                        const parts = []; if (au.conf.length) parts.push('❌ <b>Gʻildirak sinishlari jadvali bilan mos emas</b> (tekshiring!):<br>• ' + au.conf.map(escapeHtml).join('<br>• ')); if (b.miss.length) parts.push("⚠️ Toʻldirilmagan maʼlumotlar «______» bilan qoldirildi: " + escapeHtml(b.miss.join(', ')) + '. Hujjat ustiga bosib yozishingiz yoki yuqorida kiritib qayta tuzishingiz mumkin.'); if (au.info.length) parts.push('📥 ' + au.info.map(escapeHtml).join('<br>📥 '));
                        ND.trInfo = parts.length ? { warn: au.conf.concat(b.miss), html: parts.join('<br><br>') } : null;
                    } else {
                        const lines = f.text.split('\n').map(x => x.trim()).filter(Boolean);
                        if (!lines.length) { alert('Sinov bosqichlarini kiriting (har bir qatorda bitta).'); return; }
                        ND.html = nd41BuildSin(f, lines); ND.sugg = []; ND.trInfo = null;
                        used = /334211|33421/.test(ndSin().xul || '') ? [{ title: 'GOST 33421-2015 (kompozit va keramik metalli kolodkalar — umumiy texnik talablar)', src: 'GOODWILL BEARINGS dalolatnomasi namunasi' }] : [];
                    }
                    ND.used = used;
                    if (ND.albumHtml && ND.html.indexOf('ILOVA: FOTOSURATLAR') < 0 && ND.html.indexOf('vf-list') < 0) { const k = ND.html.indexOf('<div class="alb-annex nd-norm"'); ND.html = k >= 0 ? ND.html.slice(0, k) + ND.albumHtml + ND.html.slice(k) : ND.html + ND.albumHtml; }
                    ndRender(); setTimeout(() => { const p = $id('ndPage'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
                    return;
                }
                const r = await o.apply(this, arguments);
                try { if (ND.html && f) { const h2 = nd41FillAp(ND.html, f, typeof ndLang === 'function' ? ndLang() : 'uz'); if (h2 !== ND.html) { ND.html = h2; ndRender(); } } } catch (e) { console.error(e); }
                return r;
            });
        })();
        // Tur o'zgarganda (select) — yangi turlar uchun o'zbek tili
        (function () {
            ndGuessType = agmkExtend('ndGuessType', 'Tur oʼzgarganda (select) — yangi turlar uchun oʼzbek tili', ndGuessType, o => function (s) { const q = (typeof aiNorm === 'function' ? aiNorm(s) : String(s).toLowerCase()); if (/o.q\w*\s+(sin|sind)|o.qning.*sin|излом\w* ос|ось.*слом|g.ildirak juftlig\w* .*sin/.test(q)) return 'oq_sinish'; return o.apply(this, arguments); });
        })();

        // ---------- Sarlavha (fayl nomi, arxiv) — yangi shablonda sarlavha ikki qismdan ----------
        function ndTitleTxt(p) {
            const t = ((p.querySelector('.a-title') || {}).innerText || '').replace(/\s+/g, ' ').trim();
            const c = p.querySelector('.a-ctr'); const ct = c ? c.innerText.replace(/\s+/g, ' ').trim() : '';
            return ct && /^DALOLATNOMA$|^АКТ$/i.test(t) ? (ct.length > 70 ? ct.slice(0, 70) + '…' : ct) + ' — ' + t : (t || 'Akt');
        }
        ndCurTitle = function () { const p = $id('ndPage'); return p ? ndTitleTxt(p) + ' ' + fmtISO(todayISO()) : 'Akt'; };
        aktPdf = async function () {
            const p = $id('ndPage'); if (!p) return; if (!(await nd41DateOk())) return;
            const t = ndTitleTxt(p).slice(0, 60).replace(/[^\p{L}\d]+/gu, '_');
            pdfFromHtml(p.innerHTML, t + '_' + todayISO() + '.pdf');
        };
        ndSaveAkt = function () {
            const p = $id('ndPage'); if (!p) return;
            const iss = nd41DateIssues(p.innerHTML); if (iss.length) showToast('⚠️ ' + iss[0]);
            const a = ndAkts(); a.unshift({ id: 'a' + Date.now().toString(36), at: new Date().toISOString(), by: authorStr(), tur: ND.form.tur, sana: ND.form.sana, hs: ND.form.hsSame !== false ? ND.form.sana : (ND.form.hs || ND.form.sana), title: ndTitleTxt(p), html: p.innerHTML, text: p.innerText.slice(0, 2000) });
            if (ndSet(ND_AKT_KEY, a.slice(0, 200))) showToast('💾 Akt arxivga saqlandi');
        };
        (function () {
            if (typeof ndExport === 'function') { ndExport = agmkExtend('ndExport', 'ndExport', ndExport, o => async function () { if (!(await nd41DateOk())) return; return o.apply(this, arguments); }); }
            if (typeof ndPrint === 'function') { ndPrint = agmkExtend('ndPrint', 'ndPrint', ndPrint, o => async function () { if (!(await nd41DateOk())) return; return o.apply(this, arguments); }); }
            if (typeof ndSend === 'function') { ndSend = agmkExtend('ndSend', 'ndSend', ndSend, o => async function () { if ($id('ndPage') && !(await nd41DateOk())) return; return o.apply(this, arguments); }); }
        })();

        // ---------- WORD (.docx): shablon formati + rasmlar ----------
        docxFromEl = function (root) {
            const akt = !!root.querySelector('.a-approve, .a-title, .a-head');
            const TW = akt ? 9355 : 9355, run = (t, b) => `<w:r><w:rPr>${b ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${xmlEsc(t)}</w:t></w:r>`;
            const runsOf = (el, bold) => { let o = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' '); if (t) o += run(t, bold); } else if (n.nodeName === 'BR') o += '<w:r><w:br/></w:r>'; else if (n.nodeType === 1) o += runsOf(n, bold || /^(B|STRONG|TH)$/.test(n.nodeName)); }); return o; };
            const para = (inner, pPr) => `<w:p><w:pPr>${pPr || ''}</w:pPr>${inner}</w:p>`;
            const lines = el => { const out = [[]]; el.childNodes.forEach(n => { if (n.nodeName === 'BR') out.push([]); else out[out.length - 1].push(n); }); return out.map(ns => { const d = document.createElement('span'); ns.forEach(n => d.appendChild(n.cloneNode(true))); return d; }); };
            const media = []; let body = '', pid = 1;
            const pic = (img, maxWtw, maxHtw) => {
                const src = img.getAttribute('src') || ''; const m = src.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/); if (!m) return '';
                const bin = atob(m[2]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
                const ext = m[1] === 'png' ? 'png' : 'jpeg', n = media.length + 1; media.push({ name: 'word/media/image' + n + '.' + ext, data: u8, ext: ext, id: 'rIdImg' + n });
                const iw = +img.dataset.w || 1200, ih = +img.dataset.h || 900; let w = maxWtw, h = w * ih / iw; if (h > maxHtw) { h = maxHtw; w = h * iw / ih; }
                const cx = Math.round(w * 635), cy = Math.round(h * 635), k = pid++;
                return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${k}" name="Rasm ${k}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${k}" name="rasm${k}.${ext}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
            };
            const PB = '<w:r><w:br w:type="page"/></w:r>';
            const dxFlat = els => { const o = []; els.forEach(el => { const blk = Array.from(el.children || []).some(k => /^(P|TABLE|DIV|H[1-6])$/.test(k.tagName)), txtN = Array.from(el.childNodes || []).some(n => n.nodeType === 3 && n.textContent.trim()); if (el.tagName === 'DIV' && !/a-approve|a-head|a-title|alb-annex/.test(el.className) && blk && !txtN) o.push(...dxFlat(Array.from(el.children))); else o.push(el); }); return o; };
            const alOf = el => { const a = (el.style && el.style.textAlign) || el.getAttribute('align') || ''; return /center/.test(a) ? 'center' : /right/.test(a) ? 'right' : ''; };
            dxFlat([...root.children]).forEach(el => {
                const c = el.classList;
                if (c.contains('a-approve')) lines(el).forEach(l => { body += para(runsOf(l), '<w:jc w:val="right"/><w:spacing w:after="0" w:line="276" w:lineRule="auto"/>'); });
                else if (c.contains('a-head')) { const s = el.querySelectorAll('span'); body += para(run(s[0] ? s[0].textContent : '') + '<w:r><w:tab/></w:r>' + run(s[1] ? s[1].textContent : ''), `<w:tabs><w:tab w:val="right" w:pos="${TW}"/></w:tabs><w:spacing w:before="240" w:after="240"/>`); }
                else if (c.contains('a-title')) lines(el).forEach(l => { body += para(runsOf(l, true), '<w:jc w:val="center"/><w:spacing w:after="0" w:line="276" w:lineRule="auto"/>'); });
                else if (c.contains('alb-annex')) {
                    let first = true;
                    [...el.children].forEach(ch => {
                        if (ch.classList.contains('a-title')) { body += para(PB + runsOf(ch, true), '<w:jc w:val="center"/><w:spacing w:after="120"/>'); first = false; return; }
                        if (ch.tagName === 'P') { body += para(runsOf(ch), '<w:jc w:val="center"/><w:spacing w:after="120"/>'); return; }
                        const im = ch.querySelector('img'); if (!im) return;
                        body += para((first ? PB : '') + pic(im, TW, 12600), '<w:jc w:val="center"/><w:spacing w:after="60"/>'); first = true;
                        const cp = ch.querySelector('p'); if (cp) body += para(runsOf(cp), '<w:jc w:val="center"/><w:spacing w:after="0"/><w:rPr><w:sz w:val="20"/></w:rPr>');
                    });
                }
                else if (/^H[1-6]$/.test(el.tagName)) lines(el).forEach(l => { body += para(runsOf(l, true), '<w:jc w:val="' + (alOf(el) || 'center') + '"/><w:spacing w:before="120" w:after="60"/>'); });
                else if ((el.tagName === 'P' || el.tagName === 'DIV') && !c.contains('a-ctr') && !c.contains('a-li') && alOf(el)) lines(el).forEach(l => { body += para(runsOf(l), '<w:jc w:val="' + alOf(el) + '"/><w:spacing w:after="0"/>'); });
                else if (el.tagName === 'TABLE' && !c.contains('a-sign')) {
                    const nb = c.contains('nb'), rows = [...el.rows], sp = td => Math.max(1, td.colSpan || 1), ncol = Math.max(...rows.map(r => [...r.cells].reduce((a, td) => a + sp(td), 0)));
                    let w = Array(ncol).fill(Math.floor(TW / ncol)); const cg = [...el.querySelectorAll('col')]; if (cg.length === ncol) { const pc = cg.map(q => parseFloat(q.style.width) || 0); if (pc.every(x => x > 0)) { const t = pc.reduce((a, b) => a + b, 0); w = pc.map(x => Math.floor(TW * x / t)); } }
                    const b = nb ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' : '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders>';
                    body += `<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/>${b}<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
                        rows.map(r => { let ci = 0; return `<w:tr>${[...r.cells].map(td => { const s2 = sp(td), al = alOf(td) || (td.tagName === 'TH' ? 'center' : ''), ww = w.slice(ci, ci + s2).reduce((a, b) => a + b, 0) || w[0] * s2; ci += s2; return `<w:tc><w:tcPr><w:tcW w:w="${ww}" w:type="dxa"/>${s2 > 1 ? `<w:gridSpan w:val="${s2}"/>` : ''}</w:tcPr>${lines(td).map(l => para(runsOf(l, td.tagName === 'TH').replace(/<w:rPr>/g, '<w:rPr><w:sz w:val="22"/>'), (al ? '<w:jc w:val="' + al + '"/>' : '') + '<w:spacing w:after="0"/>')).join('')}</w:tc>`; }).join('')}</w:tr>`; }).join('') + '</w:tbl>' + para('', '<w:spacing w:after="0"/>');
                }
                else if (el.tagName === 'P' && c.contains('a-ctr')) body += para(runsOf(el), '<w:jc w:val="center"/><w:spacing w:after="0" w:line="276" w:lineRule="auto"/>');
                else if (el.tagName === 'P' && c.contains('a-li')) body += para(run(c.contains('a-dot') ? '•' : '-') + '<w:r><w:tab/></w:r>' + runsOf(el), '<w:tabs><w:tab w:val="left" w:pos="1077"/></w:tabs><w:ind w:left="1077" w:hanging="357"/><w:jc w:val="both"/><w:spacing w:after="0" w:line="276" w:lineRule="auto"/>');
                else if (el.tagName === 'P') body += para(runsOf(el, c.contains('a-sec')), '<w:jc w:val="both"/>' + (c.contains('ni') || c.contains('a-sec') ? '' : '<w:ind w:firstLine="709"/>') + '<w:spacing w:after="60" w:line="276" w:lineRule="auto"/>');
                else if (el.tagName === 'TABLE') {
                    const sign = c.contains('a-sign'), rows = [...el.querySelectorAll('tr')];
                    const ncol = Math.max(...rows.map(r => r.children.length)), w = sign ? [5400, 1100, 2855] : Array(ncol).fill(Math.floor(TW / ncol));
                    const b = sign ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>' : '<w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders>';
                    body += (sign ? para('', '<w:spacing w:after="0"/>') : '') + `<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/>${sign ? '<w:tblInd w:w="567" w:type="dxa"/>' : ''}${b}</w:tblPr><w:tblGrid>${w.map(x => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>` +
                        rows.map(r => `<w:tr>${[...r.children].map((td, i) => `<w:tc><w:tcPr><w:tcW w:w="${w[i] || w[0]}" w:type="dxa"/></w:tcPr>${para(runsOf(td, td.tagName === 'TH'), (sign ? '<w:spacing w:before="300" w:after="0"/>' : '<w:spacing w:after="0"/>') + (sign ? '' : '<w:rPr><w:sz w:val="22"/></w:rPr>'))}</w:tc>`).join('')}</w:tr>`).join('') + '</w:tbl>' + para('', '<w:spacing w:after="0"/>');
                } else body += para(runsOf(el), '<w:jc w:val="both"/>');
            });
            // Shablon: A4, chap 3 sm, o'ng 1,5 sm, yuqori 1 sm, pastki 1,5 sm; Times New Roman 12
            const mar = akt ? '<w:pgMar w:top="567" w:right="851" w:bottom="851" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/>' : '<w:pgMar w:top="1134" w:right="851" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/>';
            const sz = akt ? 24 : 28;
            const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>${mar}</w:sectPr></w:body></w:document>`;
            const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/><w:lang w:val="uz-Latn-UZ"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`;
            const exts = [...new Set(media.map(m => m.ext))];
            return zipBlob([
                { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' + exts.map(e => `<Default Extension="${e}" ContentType="image/${e}"/>`).join('') + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>' },
                { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
                { name: 'word/_rels/document.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' + media.map(m => `<Relationship Id="${m.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${m.name.replace('word/', '')}"/>`).join('') + '</Relationships>' },
                { name: 'word/document.xml', data: doc }, { name: 'word/styles.xml', data: styles }
            ].concat(media.map(m => ({ name: m.name, data: m.data }))), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        };

