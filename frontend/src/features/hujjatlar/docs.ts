
        // =====================================================================
        // v3.0 — HUJJATLAR korxona blankasi bo'yicha (DXT shablonlari)
        //  • Razukomplektovanie akti (Pril. 5), Qabul qilish ishchi komissiyasi akti (Pril. 4), Nosozlik dalolatnomasi
        //    endi korxonaning o'z Word blankasidan tuziladi: Word — asl shakl, PDF/JPG — xuddi shu blankadan chiziladi
        //  • Hisob-kitob formula bilan (qora lom = massa × (100 − chegirma)% × narx; ROUND 2), hech narsa to'qilmaydi:
        //    kiritilmagan maydon bo'sh chiziq bo'lib qoladi va ro'yxatda «to'ldirilmagan» deb ko'rsatiladi
        // =====================================================================
        function cxDxId(doc) { return doc && CX_T[doc.type] && CX_T[doc.type][3] || null; }
        function cxNum(v) { if (v === '' || v === null || v === undefined) return null; const n = +String(v).replace(/\s/g, '').replace(',', '.'); return isFinite(n) ? n : null; }
        function cxMoney(v) { const n = cxNum(v); return n === null ? '' : cxFmt(n); }
        function cxInvFull(inv) { const s = String(inv || '').replace(/\D/g, ''); if (/^\d{5}$/.test(s)) return '31000' + s; return s; }
        function cxDmy(v) { const s = String(v || '').trim().replace(/-?y\.?,?$/i, '').trim(); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? fmtISO(s) : s; }
        var CX_NOSOZ_SG = [["ICHTB boshlig‘i", '@@N:359@@'], ['1-TYS harakatlanuvchi sostavlarni ta’mirlash|boshlig‘i o’rinbosari', '@@N:386@@'], ['ICHTB vagonlar bo’yicha muhandisi', '@@N:371@@'], ['1-TYS VTP ustasi', '__________']];
        var CX_NOSOZ_MEM = "ICHTB boshlig‘i @@N:359@@, 1-TYS harakatlanuvchi sostavlarni ta’mirlash bo’yicha o’rinbosari @@N:386@@, ICHTB vagonlar bo’yicha muhandisi @@N:371@@, 1-TYS VTP ustasi __________";
        function cxNosozXul(doc) {
            const z = doc.zav || '______', old = String(doc.oldVag || '').trim(), pm = String(doc.planMonth || '').trim(), c = String(doc.cause || '').trim();
            let t = "Ushbu vagon nosozliklarni 1-TYS VTP da ta’mirlash ishlarini amalga oshirish imkoni yo’qligi bois, hamda 1-TYSda rejaviy yuk tashishni o’z vaqtida vagonlar bilan ta’minlash va vagon yetishmovchiligini oldini olish maqsadida, ";
            if (old && pm) t += `**${pm}** uchun rejalashtirilgan depo turidagi ta’mir jadvalidagi ${old} raqamli vagon o’rniga **${z}** raqamli vagonni Vagon xizmatiga yuborish va depo ta’mirini o‘tkazish zarur.`;
            else t += `**${z}** raqamli vagonni Vagon xizmatiga yuborish va depo ta’mirini o‘tkazish zarur.`;
            if (c) t += ` ${z} raqamli vagonning ${c}`;
            return t;
        }
        function cxDxData(doc) {
            const d = cxDB(), S = d.sign || {}, y = String(doc.month || doc.date || todayISO()).slice(0, 4), mm = String(doc.month || '').slice(5, 7);
            if (doc.type === 'razuk') {
                const mass = cxNum(doc.mass), ded = cxNum(doc.ded) === null ? 20 : cxNum(doc.ded), pr = cxNum(doc.lomPrice);
                const lom = mass === null ? null : r2(mass * (100 - ded) / 100), sum = lom === null || pr === null ? null : r2(lom * pr);
                return { year: y, akt_no: doc.aktNo || '', _w_akt_no: 13, sost_date: doc.sostDate || ('___.' + (mm || '__') + '.' + y + ' г.'),
                    os_name: doc.title || ('Думпкар ' + (doc.model || '') + ' №' + (doc.zav || '')), bal: cxMoney(doc.bal), izn: cxMoney(doc.izn), god: cxDmy(doc.god || doc.vvod), vvod: cxDmy(doc.vvod), inv: doc.invFull || cxInvFull(doc.inv),
                    p_bal: cxMoney(doc.pBal), p_izn: cxMoney(doc.pIzn), prikaz1: doc.prikaz1 || S.razPrikaz1 || 'от 30 июнь 2025 г. №00940', prikaz2: doc.prikaz2 || S.razPrikaz2 || 'от 15 июль 2025 г. №910',
                    mass: mass === null ? '' : cxFmt(mass), reason: doc.reason || '', state: doc.state || 'ремонт не подлежит.', writeoff: doc.writeoff || '', docs: doc.docs || 'протокол технические совет №80, Акт в рабочей комиссии по приёмке.',
                    lom_kg: lom === null ? '' : cxFmt(lom), lom_price: pr === null ? '' : cxFmt(pr), lom_sum: sum === null ? '' : cxFmt(sum) };
            }
            if (doc.type === 'priem') {
                const C = cxCalc(doc, d);
                const pz = String(S.prikaz || '').replace(/^\s*Приказом\s*/i, ''), pts = (String(S.pts || '').match(/№\s*\d+.*$/) || [S.pts || ''])[0];
                const parts = doc.parts || (doc.mats || []).map(m => String(m.name || '').trim().toLowerCase()).filter(Boolean).join(', ');
                const pq = doc.partsQty || (doc.mats || []).filter(m => m.name).map(m => String(m.name).trim() + ' – ' + String(m.qty).replace('.', ',') + ' ' + (m.unit || 'шт') + '.').join(', ');
                return { year: y, prikaz: pz, parts: parts, model: doc.model || '', zav: doc.zav || '', inv: String(doc.inv || ''), inv_full: doc.invFull || cxInvFull(doc.inv), pts: pts, parts_qty: pq, total: C.total ? cxFmt(C.total) : '' };
            }
            if (doc.type === 'nosoz') {
                const sg = (doc.sg && doc.sg.length ? doc.sg : CX_NOSOZ_SG).concat([['', ''], ['', ''], ['', ''], ['', '']]).slice(0, 4), o = {};
                sg.forEach((x, i) => { const r = String(x[0] || '').split('|'); o['s' + (i + 1) + 'r'] = r[0] || ''; if (i === 1) o.s2r2 = r[1] || ''; o['s' + (i + 1) + 'n'] = x[1] || ''; });
                const defs = String(doc.defects || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => /^[-–•]/.test(x) ? x.replace(/^[–•]\s*/, '- ') : '- ' + x).join('\n');
                return Object.assign(o, { date: doc.date ? fmtISO(doc.date) : '', ap_date: doc.date ? nd41ApDate(doc.date, 'uz') : '«___» __________ ' + y + '-y.', model: doc.model || '2VS-105', members: doc.members || CX_NOSOZ_MEM, zav: doc.zav || '',
                    defects: defs, dr: cxDmy(doc.dr), kr: cxDmy(doc.kr), yil: String(doc.yil || ''), xulosa: doc.xulosaManual ? doc.xulosa : cxNosozXul(doc) });
            }
            return {};
        }
        // To'ldirilmagan (bo'sh) maydonlar — foydalanuvchiga ko'rsatiladi
        var CX_DX_LBL = { akt_no: 'akt raqami', bal: 'balans qiymati', izn: 'jamgʻarilgan eskirish', god: 'ishlab chiqarilgan yil', vvod: 'foydalanishga kiritilgan sana', inv: 'inventar raqami', p_bal: 'qism: balans qiymati', p_izn: 'qism: eskirish', mass: 'massa', reason: 'sababi', writeoff: 'spisat (nima)', lom_price: 'qora lom narxi', lom_kg: 'qora lom (kg)', lom_sum: 'qora lom summasi',
            parts: 'almashtirilgan qismlar', zav: 'zavod raqami', model: 'vagon turi', inv_full: 'inventar (toʻliq)', parts_qty: 'qabulga taqdim etilgan', total: 'umumiy summa', date: 'sana', defects: 'nosozliklar', dr: 'depo taʼmiri sanasi', kr: 'kapital taʼmiri sanasi', yil: 'foydalanishga topshirilgan yil' };
        function cxDxMissing(data) { return Object.keys(CX_DX_LBL).filter(k => k in data && !String(data[k] || '').trim()).map(k => CX_DX_LBL[k]); }
        async function cxDxFiles(doc, fmts) { return dxFiles(cxDxId(doc), cxDxData(doc), cxName(), fmts.filter(f => f !== 'xlsx')); }
        // Imzolash tizimi uchun: shablon + ma'lumotlar (server shu matnni saqlaydi, hujjat izi shundan olinadi)
        async function cxDxSigHtml(doc) {
            const id = cxDxId(doc), data = cxDxData(doc), R = await dxRender(id, data);
            const txt = dxPlainHtml(R.M);
            return `<div class="dxt-doc" data-dxt="${escapeHtml(id)}" data-dxd="${escapeHtml(btoa(unescape(encodeURIComponent(JSON.stringify(data)))))}">${txt}</div>`;
        }
        // Model → oddiy HTML (imzo chekuvchilarni topish va zaxira ko'rinish uchun)
        function dxPlainHtml(M) {
            const E = escapeHtml, pt = b => b.runs.map(r => r.tab ? ' ' : r.br ? '<br>' : r.t !== undefined ? E(r.t) : '').join('').replace(/ /g, ' ');
            const blk = L => L.map(b => b.k === 'p' ? '<p>' + (b.label ? E(b.label.t) + ' ' : '') + pt(b) + '</p>' : '<table>' + b.rows.map(r => '<tr>' + r.cells.map(c => '<td>' + blk(c.blocks) + '</td>').join('') + '</tr>').join('') + '</table>').join('');
            return blk(M.blocks);
        }
        async function dxFromSigHtml(html) { // imzolash: saqlangan hujjatdan qayta chizish
            const m = /data-dxt="([^"]+)"[^>]*data-dxd="([^"]+)"/.exec(html); if (!m) return null;
            const id = m[1].replace(/&quot;/g, '"'), data = JSON.parse(decodeURIComponent(escape(atob(m[2].replace(/&#39;/g, "'").replace(/&amp;/g, '&')))));
            if (!DXT.tpl[id]) return null; return dxRender(id, data);
        }
        // =====================================================================
        // O'q sinishi dalolatnomasi: «G'ildirak juftligi sinishlari» reestri — manba va nazorat
        //  • Reestr Excel faylini yuklash (yangi qatorlar qo'shiladi) — ilovadagi ichki jadval yangilanadi
        //  • Dalolatnoma tuzilganda vagon raqami bo'yicha reestr qatori topiladi: bo'sh maydonlar to'ldiriladi,
        //    qo'lda kiritilgan qiymat reestrdan farq qilsa — qizil ogohlantirish (qaysi maydon, nima kiritilgan, reestrda nima)
        //  • Hodisa sanasi — reestrdagi «синган санаси» (hujjat tuzilgan sana emas)
        // =====================================================================
        var GJ_KEY = 'agmk_gj_v1';
        function gjDate(v) { if (typeof v === 'number' && v > 20000 && v < 80000) { const d = new Date(Math.round((v - 25569) * 86400000)); return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear(); } const s = String(v == null ? '' : v).trim(); const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : s; }
        function gjParse(rows) {
            const low = x => String(x == null ? '' : x).toLowerCase().replace(/\s+/g, ' ').trim();
            let hi = -1; for (let i = 0; i < Math.min(rows.length, 30); i++) { const r = (rows[i] || []).map(low); if (r.some(c => /синган санаси/.test(c)) && r.some(c => /вагон рақами/.test(c))) { hi = i; break; } }
            if (hi < 0) return null;
            const H = (rows[hi] || []).map(low), col = re => H.findIndex(c => re.test(c));
            const C = { n: col(/^т\/р|^№/), sana: col(/синган санаси/), agregat: col(/тортув агрегат/), vagon: col(/^вагон рақами/), vag_tamir: col(/вагоннинг охирги/), yil: col(/ишлаб чиқарилган/), muddat: col(/ишлаш муддати/), ishlagan: col(/ишлаган вақти/), gildirak: col(/^ғилдирак рақами/), gl_tamir: col(/ғилдиракнинг охирги/), joy: col(/синган жойи/), qoyilgan: col(/қўйилган жой/), defekt: col(/дефектоскоп/), kim: col(/ким томондан/) };
            if (C.sana < 0 || C.vagon < 0) return null;
            const out = [];
            for (let i = hi + 1; i < rows.length; i++) {
                const r = rows[i] || []; const vg = String(r[C.vagon] == null ? '' : r[C.vagon]).replace(/\s/g, ''); if (!/^\d{3,}$/.test(vg)) continue;
                const g = k => C[k] >= 0 ? r[C[k]] : '';
                out.push({ n: +g('n') || out.length + 1, sana: gjDate(g('sana')), agregat: String(g('agregat') || '').trim(), vagon_joyi: C.agregat >= 0 ? String(r[C.agregat + 1] || '').trim() : '', vagon: vg, vag_tamir: String(g('vag_tamir') || '').trim(),
                    yil: String(g('yil') || '').trim(), muddat: String(g('muddat') || '').trim(), ishlagan: String(g('ishlagan') || '').trim(), gildirak: String(g('gildirak') == null ? '' : g('gildirak')).trim(), gl_tamir: gjDate(g('gl_tamir')), joy: String(g('joy') || '').trim(), qoyilgan: String(g('qoyilgan') || '').trim(), defekt: gjDate(g('defekt')), kim: String(g('kim') || '').trim() });
            }
            return out;
        }
        function gjApply(list) { if (typeof GJ26 === 'undefined' || !list || !list.length) return; GJ26.length = 0; list.forEach(x => GJ26.push(x)); }
        (function () { try { const d = kvGet(GJ_KEY, null); if (d && d.rows && d.rows.length) gjApply(d.rows); } catch (e) {} })();
        async function gjImport(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
            let bk; try { bk = await hpReadBook(f); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            let rows = null; for (const sh of bk) { const r = gjParse(sh.rows); if (r && r.length && (!rows || r.length > rows.length)) rows = r; }
            if (!rows) { alert("⚠️ Faylda «Ғилдиракнинг синган санаси … Вагон рақами» sarlavhali jadval topilmadi."); return; }
            const old = GJ26.slice(), key = x => String(x.vagon).replace(/^0+/, '') + '|' + x.sana;
            const add = rows.filter(x => !old.some(o => key(o) === key(x))), chg = rows.filter(x => old.some(o => key(o) === key(x) && JSON.stringify(o) !== JSON.stringify(Object.assign({}, o, x))));
            if (!(await uiConfirm(`📥 Gʻildirak juftligi sinishlari jadvali: ${rows.length} ta qator.\nYangi: ${add.length}${add.length ? ' (' + add.map(x => x.vagon + ' — ' + x.sana).join(', ') + ')' : ''}\nOʻzgargan: ${chg.length}\n\nIlovadagi jadval shu fayl bilan almashtirilsinmi?`))) return;
            kvSet(GJ_KEY, { rows: rows, file: f.name, at: new Date().toISOString(), by: authorStr() }); gjApply(rows);
            try { aiLog('Gʻildirak sinishlari jadvali yangilandi: ' + f.name + ' (' + rows.length + ' qator)'); } catch (e) {}
            showToast('✅ Jadval yangilandi: ' + rows.length + ' ta holat'); try { ndRender(); } catch (e) {}
        }
        // Reestr bilan solishtirish: bo'shlarni to'ldiradi, farqlarni qaytaradi
        function nd41OqAuto(f) {
            const q = ndOq(), g = ndOqFind(), out = { src: g, conf: [], info: [] }; if (!g) return out;
            const iso = nd41Iso, norm = s => String(s || '').toLowerCase().replace(/[^a-zа-яё0-9ўқғҳ]/g, '');
            const exp = {
                gj: [g.gildirak, 'Gʻildirak juftligi raqami'], vx: [iso(g.gl_tamir), 'Gʻildirak oxirgi taʼmirlangan sana', 1], defS: [iso(g.defekt), 'ВУ-53: defektoskopiya sanasi', 1],
                defK: [g.kim ? nd41Lat(g.kim).trim().replace(/^(\S+)\s+(\S+?)\.?$/, (m, a, b) => b.charAt(0).toUpperCase() + b.slice(1) + '.' + a.charAt(0).toUpperCase() + a.slice(1)) : '', 'Operator defektoskopist'],
                yil: [g.yil, 'Oʻqning yili'], joyS: [/шейк/i.test(g.joy) ? 'sheyka qismi' : /ўрта|урта|орта/i.test(g.joy) ? 'o‘rta qismi' : '', 'Sinish joyi'],
                ornJ: [/^В[СХ]$/i.test(String(g.qoyilgan).trim()) ? 'VX' : /1-ТЙЦ/i.test(g.qoyilgan) ? '1-TYS VTP' : '', 'Qayerda oʻrnatilgan']
            };
            const fmt = (v, d) => d && /^\d{4}-\d{2}-\d{2}$/.test(v) ? fmtISO(v) : v;
            Object.keys(exp).forEach(k => { const [v, lab, isD] = exp[k]; if (!v) return; const cur = String(q[k] || '').trim();
                if (!cur) { q[k] = v; out.info.push(lab + ': ' + fmt(v, isD) + ' (jadvaldan)'); }
                else if ((isD ? cur !== v : norm(cur) !== norm(v)) && !(k === 'ornJ' && norm(cur).indexOf(norm(v)) === 0) && !(k === 'defK' && norm(cur).indexOf(norm(v).slice(2)) >= 0)) out.conf.push(lab + ': kiritilgan «' + fmt(cur, isD) + '», jadvalda «' + fmt(v, isD) + '»'); });
            const gs = iso(g.sana);
            if (gs) { if (f.hsSame !== false) { if (gs !== f.sana) { f.hsSame = false; f.hs = gs; out.info.push('Hodisa sanasi jadvaldan: ' + g.sana + ' (hujjat sanasi ' + fmtISO(f.sana) + ')'); } } else if (f.hs && f.hs !== gs) out.conf.push('Hodisa sanasi: kiritilgan «' + fmtISO(f.hs) + '», jadvalda «' + g.sana + '»'); }
            if (!q.orn && /^\s*ДР\s*\d{2}\.\d{2}\.\d{4}/i.test(g.vag_tamir || '') && /^В[СХ]$/i.test(String(g.qoyilgan).trim())) out.info.push('Oʻrnatilgan sana jadvalda yoʻq. Vagonning oxirgi taʼmiri: ' + g.vag_tamir.trim() + ' — agar gʻildirak shu taʼmirda qoʻyilgan boʻlsa, shu sanani kiriting');
            if (!q.tip) { const v = onlyVagons().find(x => String(vagonNo(x)).replace(/^0+/, '') === String(g.vagon).replace(/^0+/, '')); const t = v ? (nd41Tip(v) || (/105/.test(v.type || '') ? '2VS-105' : /60/.test(v.type || '') ? '6VS-60' : '')) : ''; if (t) { q.tip = t; out.info.push('Vagon tipi pasportdan: ' + t); } }
            ND.oqSrc = g; return out;
        }
        // Ta'mir grafigi → nosozlik dalolatnomasi: nosoz vagon jadvaldagi vagon o'rniga yuboriladi (namunadagi xulosa bilan)
        async function pprNosoz(oldV) {
            const no = await uiPrompt('Qaysi nosoz vagon ' + oldV + ' oʻrniga yuboriladi (raqami)?', ''); if (!no || !String(no).trim()) return;
            const m = PPRV.m, a = m.split('-'); mdlClose('pprAct'); mdlClose('pprModal');
            cxOpen('nosoz'); cxNew('nosoz'); Object.assign(CXV.cur, { oldVag: String(oldV), planMonth: a[0] + '-yil ' + (PPR_OY[+a[1] - 1] || '') + ' oyi' });
            const L = cx47Find(no); if (L.length === 1) { cx47Fill(L[0]); CX47.info = '✅ Pasportdan: zav.№ ' + escapeHtml(CXV.cur.zav); } else { CXV.cur.zav = String(no).trim(); CX47.info = L.length > 1 ? '⚠️ Bu raqamda bir nechta vagon — toʻliq raqamni yozing.' : 'ℹ️ Pasportda topilmadi — DR/KR sanalarini qoʻlda kiriting.'; }
            cxForm(); showToast('📝 Nosozliklarni yozing va tekshiring. Grafikdagi almashtirishni «⇄ Almashtirish» bilan alohida tasdiqlang.');
        }

