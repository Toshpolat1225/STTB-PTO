        // =====================================================================
        // v2.7 — 📑 KALKULYATSIYA va unga bog'liq aktlar (namunalar asosida)
        //  • Kalkulyatsiya: materiallar (Forma-30 dan ШПЗ bo'yicha: miqdor × narx) + mehnat (norma × tarif; qo'shimcha %, ijt. sug'urta %, boshqa %)
        //    Formulalar namunadagi Excel bilan bir xil: ROUND(…,2). Stavkalar (%) har oy tahrirlanadi, qaysi oyda qaysi stavka ishlatilgani saqlanadi.
        //  • Qabul qilish ishchi komissiyasi akti (Приложение 4) — kalkulyatsiya summasi va qismlar ro'yxatidan
        //  • Razukomplektovanie akti (Приложение 5) — qora lom = massa × (1 − 20%) × narx
        //  • Nosozlik dalolatnomasi (2VS-105) — pasportdan DR/KR sanalari, yil
        //  • Kalkulyatsiya faylini tekshirish — qator summasi, ИТОГО diapazoni, mehnat zanjiri, umumiy summa
        //  Hisobni FORMULA qiladi; AI hisoblamaydi. Hech narsa to'qib chiqarilmaydi — bo'sh maydon bo'sh qoladi.
        // =====================================================================
        var CX_KEY = 'agmk_calc_v1';
        function r2(v) { return Math.round(Number((Number(v) * 100).toPrecision(15))) / 100; }
        function cxFmt(v) { if (v === '' || v === null || v === undefined || isNaN(v)) return ''; return Number(v).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ /g, ' '); }
        function cxDefaults() {
            return {
                rates: { dop: 164.5, soc: 12, proch: 235.07, rateNote: '01.05.2026', monthNote: 'за июль' },
                works: [ // «НОРМЫ ВРЕМЕНИ И РАСЦЕНКИ … бригадой текущего ремонта ВРП ЖДЦ-2 на 01.01.2026» (namunadan)
                    { n: 1, name: 'Замена колёсных пар', raz: 4, tarif: 17368.34, norm: 4.05 }, { n: 2, name: 'Замена свалочного цилиндра', raz: 5, tarif: 19026.14, norm: 1.19 },
                    { n: 3, name: 'Замена автосцепки', raz: 5, tarif: 19026.14, norm: 0.75 }, { n: 4, name: 'Разъединение тяг тормозной и рычажной передачи', raz: 3, tarif: 15793.62, norm: 1.9 },
                    { n: 5, name: 'Выгрузка и погрузка колесной пары на платформу', raz: 2, tarif: 14354.23, norm: 1.85 }, { n: 6, name: 'Снятие и установка системы схода', raz: 4, tarif: 17368.34, norm: 2.13 },
                    { n: 7, name: 'Замена кронштейна', raz: 4, tarif: 17368.34, norm: 0.68 }, { n: 8, name: 'Ремонт фрикционного аппарата', raz: 4, tarif: 17368.34, norm: 1.78 }],
                sign: { agree: 'И.о.главного механика УПЖТ|@@N:318@@', approve: 'Главный инженер УПЖТ|@@N:297@@', calc: ['Начальник ВС|@@N:328@@', 'Зам. начальник ВС|@@N:338@@', 'Инженер по вагонам ПТО|@@N:354@@', 'Бухгалтер|@@N:287@@', 'Экономист|@@N:336@@', 'Мастер ВС|'],
                    prikaz: 'Приказом от 27.02.2026г. № 287', pts: 'протокола ПТС АО «Алмалыкский ГМК» №80 от 31.05.2024г.',
                    kom: ['Зам. начальника по производству и внешней логистике|@@N:300@@', 'Зам. гл. инженера по ОТ, ТБ и БД УПЖТ|@@N:288@@', 'Главный механик УПЖТ|@@N:310@@', 'Главный энергетик УПЖТ|@@N:332@@', 'Начальник ПТО|@@N:315@@'], prin: 'Начальник ЖДЦ-1|@@N:350@@' },
                docs: [], rateLog: []
            };
        }
        function cxDB() { const d = kvGet(CX_KEY, null); if (d && d.rates) return d; return cxDefaults(); }
        function cxSave(d) { kvSet(CX_KEY, d); }
        function cxLabor(w, rates, cnt) {
            const ras = r2(w.norm * w.tarif), osn = ras, dop = r2(osn * rates.dop / 100), it = r2(osn + dop), soc = r2(it * rates.soc / 100), pr = r2(it * rates.proch / 100), all = r2(it + soc + pr);
            return { ras: ras, osn: osn, dop: dop, it: it, soc: soc, pr: pr, all: all, cnt: cnt || 1, sum: r2(all * (cnt || 1)) };
        }
        function cxCalc(doc, d) {
            d = d || cxDB(); const rates = doc.rates || d.rates;
            const mats = (doc.mats || []).map(m => Object.assign({}, m, { sum: r2((+m.qty || 0) * (+m.price || 0)) }));
            const mSum = r2(mats.reduce((a, m) => a + m.sum, 0));
            const labs = (doc.works || []).map(x => { const w = d.works.find(z => z.n === x.n) || x.w; return w ? Object.assign({ w: w }, cxLabor(w, rates, x.cnt)) : null; }).filter(Boolean);
            const lSum = r2(labs.reduce((a, l) => a + l.sum, 0));
            return { rates: rates, mats: mats, mSum: mSum, labs: labs, lSum: lSum, total: r2(mSum + lSum) };
        }
        var CX_MON = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        function cxMonRu(m) { const a = String(m || '').split('-'); return a.length === 2 ? CX_MON[+a[1] - 1] + ' ' + a[0] + 'г.' : ''; }
        function cxSig(s) { const [a, b] = String(s || '|').split('|'); return { t: a || '', n: b || '' }; }
        // ---------- HTML (chop etish / PDF / Word / Excel / JPG) ----------
        function cxHtmlCalc(doc) {
            const d = cxDB(), C = cxCalc(doc, d), E = escapeHtml, S = d.sign, ag = cxSig(S.agree), ap = cxSig(S.approve), R = C.rates;
            const td = 'border:1px solid #000;padding:3px 5px;', tdr = td + 'text-align:right;';
            let h = `<table class="nb" style="width:100%;font-size:11pt"><tr><td>«СОГЛАСОВАНО»<br>${E(ag.t)}<br>__________ ${E(ag.n)}<br>«____» __________ ${E((doc.month || '').slice(0, 4))} г.</td><td style="text-align:right">«УТВЕРЖДАЮ»<br>${E(ap.t)}<br>__________ ${E(ap.n)}<br>«____» __________ ${E((doc.month || '').slice(0, 4))} г.</td></tr></table>
                <h3 style="text-align:center;margin:10px 0 2px">КАЛЬКУЛЯЦИЯ</h3><div style="text-align:center"><b>${E(doc.title || '')}</b><br>на ${E(cxMonRu(doc.month))}</div>
                <p><b>1. Материалы:</b></p><table style="border-collapse:collapse;width:100%;font-size:10.5pt"><tr><th style="${td}">№ п/п</th><th style="${td}">Наименование материалы</th><th style="${td}">Ед. изм.</th><th style="${td}">Кол-во</th><th style="${td}">Цена, сум</th><th style="${td}">Сумма, сум</th></tr>`;
            C.mats.forEach((m, i) => { h += `<tr><td style="${td}text-align:center">${i + 1}</td><td style="${td}">${E(m.name)}</td><td style="${td}text-align:center">${E(m.unit || '')}</td><td style="${tdr}">${E(String(m.qty))}</td><td style="${tdr}">${cxFmt(m.price)}</td><td style="${tdr}">${cxFmt(m.sum)}</td></tr>`; });
            h += `<tr><td style="${td}"></td><td style="${td}" colspan="4"><b>ИТОГО:</b></td><td style="${tdr}"><b>${cxFmt(C.mSum)}</b></td></tr></table>`;
            C.labs.forEach((l, i) => {
                h += `<p><b>${i === 0 ? '2. Трудозатраты на установка:' : ''}</b> ${E(l.w.name)}${l.cnt > 1 ? ' × ' + l.cnt : ''}</p><table style="border-collapse:collapse;width:80%;font-size:10.5pt">
                    <tr><td style="${td}">Норма времени текущий ремонт пункт №${l.w.n}, чел.час</td><td style="${tdr}">${E(String(l.w.norm))}</td></tr><tr><td style="${td}">Разряд выполняемых работ:</td><td style="${tdr}">${E(String(l.w.raz))}</td></tr>
                    <tr><td style="${td}">Норма расценка на ${E(R.rateNote || '')}</td><td style="${tdr}">${cxFmt(l.ras)}</td></tr><tr><td style="${td}">Основная зарплата</td><td style="${tdr}">${cxFmt(l.osn)}</td></tr>
                    <tr><td style="${td}">Доп. зарплата ${E(String(R.dop).replace('.', ','))}% (${E(R.monthNote || '')})</td><td style="${tdr}">${cxFmt(l.dop)}</td></tr><tr><td style="${td}">Итого: сум</td><td style="${tdr}">${cxFmt(l.it)}</td></tr>
                    <tr><td style="${td}">Соц.страх ${E(String(R.soc).replace('.', ','))}%</td><td style="${tdr}">${cxFmt(l.soc)}</td></tr><tr><td style="${td}">Прочие затраты ${E(String(R.proch).replace('.', ','))}% (${E(R.monthNote || '')})</td><td style="${tdr}">${cxFmt(l.pr)}</td></tr>
                    <tr><td style="${td}"><b>Всего трудозатраты на 1 ед., сум:</b></td><td style="${tdr}"><b>${cxFmt(l.all)}</b></td></tr>${l.cnt > 1 ? `<tr><td style="${td}">× ${l.cnt} ед.</td><td style="${tdr}"><b>${cxFmt(l.sum)}</b></td></tr>` : ''}</table>`;
            });
            h += `<p style="font-size:11.5pt"><b>Всего материалы и трудозатраты ${E(doc.unitWord || 'думпкара')} на зав.№${E(doc.zav || '')}, сум: ${cxFmt(C.total)}</b></p><table class="nb" style="width:100%;margin-top:14px;font-size:10.5pt">`;
            (S.calc || []).forEach(s => { const x = cxSig(s); h += `<tr><td style="padding:6px 0">${E(x.t)}</td><td>________________</td><td>${E(x.n || '______________')}</td></tr>`; });
            return h + '</table>';
        }
        function cxHtmlPriem(doc) {
            const d = cxDB(), C = cxCalc(doc, d), E = escapeHtml, S = d.sign, ap = cxSig(S.approve), y = (doc.month || '').slice(0, 4), parts = cxPartsText(doc);
            const obj = `думпкара типа ${E(doc.model || '')} зав.№ ${E(doc.zav || '')} (инв. № ${E(doc.invFull || doc.inv || '')})`;
            let h = `<div style="text-align:right">Приложение 4</div><div style="text-align:right">«УТВЕРЖДАЮ»<br>${E(ap.t)}<br>АО «Алмалыкский ГМК»<br>__________ ${E(ap.n)}<br>«____» __________ ${y}г.</div>
                <h3 style="text-align:center">А К Т<br>РАБОЧЕЙ КОМИССИИ ПО ПРИЕМКЕ В ЭКСПЛУАТАЦИЮ<br>ТРАНСПОРТНЫХ ЗАПАСНЫХ ЧАСТЕЙ, ОБОРУДОВАНИЯ И Т. Д.</h3>
                <p>г. Алмалык <span style="float:right">«____» __________ ${y}г.</span></p>
                <p>Рабочая комиссия УПЖТ АО «Алмалыкский ГМК», назначенная ${E(S.prikaz || '')}, руководствуясь правилами, изложенными в ШНК 3.01.04-04,</p><p><b>УСТАНОВИЛА:</b></p>
                <p>1. УПЖТ АО «Алмалыкский ГМК» (хоз. способ). Предъявлено к приемке «Капитальный ремонт после замены ${E(parts)} ${obj}».</p>
                <p>2. Строительство произведено на основании решения ${E(S.pts || '')}.</p>
                <p>4. Рабочей комиссии представлена следующая документация: акт технического состояния, калькуляция.</p>
                <p>5. Предъявленное к приемке в эксплуатацию: ${E(cxPartsQty(doc))}.</p>
                <p>7. Общая стоимость объекта в текущих ценах всего: <b>${cxFmt(C.total)} сум</b>, в том числе стоимость оборудования, инструмента и инвентаря ${cxFmt(C.total)} сум.</p>
                <p>8. Фактическая стоимость основных фондов, принимаемых в эксплуатацию, всего: <b>${cxFmt(C.total)} сум</b>.</p>
                <p><b>РЕШЕНИЕ РАБОЧЕЙ КОМИССИИ:</b> Предъявленное к приемке «Капитальный ремонт после замены ${E(parts)} ${obj}» — <b>ПРИНЯТЬ В ЭКСПЛУАТАЦИЮ.</b></p>
                <p>Члены комиссии (сдали):</p><table class="nb" style="width:100%">`;
            (S.kom || []).forEach(s => { const x = cxSig(s); h += `<tr><td style="padding:5px 0">${E(x.t)}</td><td>__________</td><td>${E(x.n)}</td></tr>`; });
            const pr = cxSig(S.prin); return h + `</table><p>Приняли (материально-ответственные лица):</p><table class="nb" style="width:100%"><tr><td>${E(pr.t)}</td><td>__________</td><td>${E(pr.n)}</td></tr></table>`;
        }
        function cxPartsText(doc) { const n = (doc.mats || []).map(m => String(m.name || '').replace(/\s+/g, ' ').trim()).filter(Boolean); return n.length ? n.join(', ') : '________'; }
        function cxPartsQty(doc) { return (doc.mats || []).map(m => String(m.name || '').trim() + ' — ' + m.qty + ' ' + (m.unit || 'шт')).join('; ') || '________'; }
        function cxHtmlRazuk(doc) {
            const E = escapeHtml, mass = +doc.mass || 0, ded = doc.ded === undefined ? 20 : +doc.ded, lom = r2(mass * (100 - ded) / 100), sum = r2(lom * (+doc.lomPrice || 0)), y = (doc.month || '').slice(0, 4);
            return `<div style="text-align:right">ПРИЛОЖЕНИЕ №5<br>к Положению о порядке списания с баланса основных средств</div>
                <h3 style="text-align:center">Акт № ____ о разукомплектовании (частичном демонтаже) основных средств</h3>
                <p>Предприятие, организация: УПЖТ</p><p>Комиссия произвела осмотр ${E(doc.title || '')}. В результате осмотра комиссия установила:</p>
                <p>1. Поступил в организацию ${E(doc.vvod || '________')}.<br>2. Масса объекта по паспорту ${cxFmt(mass)} кг.<br>4. Причина списания: ${E(doc.reason || '________')}.<br>5. Техническое состояние: ${E(doc.state || 'ремонт не подлежит')}.</p>
                <p>Заключение комиссии: списать ${E(doc.writeoff || '________')}.</p>
                <p>Подлежат оприходованию: Чер.лом — ${cxFmt(lom)} кг (${cxFmt(mass)} кг × (1 − ${ded}%)) × ${cxFmt(+doc.lomPrice || 0)} сум = <b>${cxFmt(sum)} сум</b></p>
                <p style="font-size:9pt">Masalan namunada: 5 578,88 kg × 0,8 = 4 463,10 kg × 1 565,18 = 6 985 554,86 so‘m.</p><p>${y} г.</p>`;
        }
        function cxHtmlNosoz(doc) {
            const E = escapeHtml, dt = doc.date || '';
            return `<div style="text-align:right">«TASDIQLAYMAN»<br>STTB bosh muhandisi<br>_________ @@N:286@@<br>«${E(dt.slice(8, 10))}» ${E(typeof OY_UZ !== 'undefined' ? (OY_UZ[+dt.slice(5, 7) - 1] || '') : '')} ${E(dt.slice(0, 4))}-y.</div>
                <p>Olmaliq sh. <span style="float:right">${E(dt.split('-').reverse().join('.'))}-y.</span></p>
                <h3 style="text-align:center">${E(doc.model || '2VS-105')} tipli vagon-samosvalning mavjud nosozliklari to‘g‘risida<br>DALOLATNOMA</h3>
                <p>Biz quyidagi imzo chekuvchilar: ${E(doc.members || '________')}, tuzilayotgan dalolatnoma shu haqidaki, zavod raqami ${E(doc.zav || '')} bo‘lgan vagon-samosvalda quyidagi nosozliklar aniqlandi:</p>
                <p>${E(doc.defects || '- ________').replace(/\n/g, '<br>')}</p>
                <p>- Vagonning oxirgi rejali ta’mir vaqtlari:<br>&nbsp;&nbsp;depo ta’miri ${E(doc.dr || '________')},<br>&nbsp;&nbsp;kapital ta’miri ${E(doc.kr || '________')},<br>&nbsp;&nbsp;foydalanishga topshirilgan yili ${E(doc.yil || '____')}-y.</p>
                <p><b>Xulosa:</b> ${E(doc.xulosa || '')}</p><table class="nb" style="width:100%">${String(doc.signers || '').split('\n').filter(Boolean).map(s => `<tr><td style="padding:5px 0">${E(s)}</td></tr>`).join('')}</table>`;
        }
        var CX_T = { calc: ['📑', 'Kalkulyatsiya', cxHtmlCalc], priem: ['📝', 'Qabul qilish ishchi komissiyasi akti', cxHtmlPriem, 'priem'], razuk: ['♻️', 'Razukomplektovanie akti (Pril. 5)', cxHtmlRazuk, 'razuk'], nosoz: ['⚠️', 'Nosozlik dalolatnomasi', cxHtmlNosoz, 'nosoz'] }; // 4-element: korxona Word blankasi (DXT shablon)
        // ---------- Ro'yxat va tahrir ----------
        function cxOpen(tab) {
            const d = cxDB(), E = escapeHtml; CXV.tab = tab || CXV.tab || 'calc';
            const L = d.docs.filter(x => x.type === CXV.tab).sort((a, b) => String(b.at).localeCompare(String(a.at)));
            mdl('cxModal', `<div class="px-h"><b>${CX_T[CXV.tab][0]} ${E(CX_T[CXV.tab][1])}</b><button class="mini-btn" onclick="mdlClose('cxModal')">✕</button></div>
                <div class="cx-tabs">${Object.keys(CX_T).map(k => `<button class="${k === CXV.tab ? 'on' : ''}" onclick="cxOpen('${k}')">${CX_T[k][0]} ${E(CX_T[k][1].split(' ')[0])}</button>`).join('')}</div>
                <div class="nv-btns"><button class="on" onclick="cxNew('${CXV.tab}')">＋ Yangi</button>${CXV.tab === 'calc' ? '<button onclick="cxRates()">⚙️ Oylik stavkalar</button><label class="cx-lbl">🔍 Faylni tekshirish<input type="file" accept=".xls,.xlsx" style="display:none" onchange="cxCheckFile(this)"></label>' : ''}<button onclick="helpOpen(\'calc\')">ℹ️</button></div>
                <div class="hs-list">${L.map(x => `<div class="hs-row" onclick="cxEdit('${x.id}')"><b>${E(x.title || x.zav || 'Hujjat')}</b><small>${E(x.month || x.date || '')}${x.type === 'calc' ? ' · ' + cxFmt(cxCalc(x, d).total) + ' soʻm' : ''} · 👤 ${E(x.by || '')}</small></div>`).join('') || '<div class="xt-empty">Hali hujjat yoʻq.</div>'}</div>`, true);
        }
        var CXV = { tab: 'calc', cur: null };
        function cxMonth() { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); }
        function cxNew(type) {
            const id = 'cx' + Date.now().toString(36);
            CXV.cur = { id: id, type: type, month: cxMonth(), date: new Date().toISOString().slice(0, 10), mats: [], works: type === 'calc' ? [{ n: 3, cnt: 1 }] : [], unitWord: 'думпкара', ded: 20, state: type === 'razuk' ? 'ремонт не подлежит.' : '', members: type === 'nosoz' ? CX_NOSOZ_MEM : '', sg: type === 'nosoz' ? CX_NOSOZ_SG.map(x => x.slice()) : undefined };
            cxForm();
        }
        function cxEdit(id) { const d = cxDB(), x = d.docs.find(z => z.id === id); if (!x) return; CXV.cur = JSON.parse(JSON.stringify(x)); cxForm(); }
        function cxVagon(q) {
            const doc = CXV.cur; let v = null; try { const r = numResolve(q); if (r && r.hits.length) v = r.hits[0]; } catch (e) {}
            if (!v) { const s = String(q || '').replace(/\s/g, ''); v = vagonlarData.find(x => String(vagonNo(x)) === s) || vagonlarData.find(x => String(vagonNo(x)).replace(/^0+/, '') === s.replace(/^0+/, '')); }
            if (!v) { showToast('Vagon topilmadi'); return; }
            doc.vid = v.id; doc.zav = String(vagonNo(v)); doc.inv = String(v.inv || ''); doc.model = String(v.type || '').replace(/Dumpkar\s*/i, '').trim() ? (typeof isQ115 === 'function' && isQ115(v) ? '2ВС-105 (Q-115)' : /105/.test(v.type) ? '2ВС-105' : /115/.test(v.type) ? '2ВС-115' : /60/.test(v.type) ? '6ВС-60' : v.type) : v.type;
            doc.title = doc.type === 'calc' ? `капитальный ремонт замена запасных частей на думпкара типа ${doc.model} зав.№${doc.zav} инв№${doc.inv}` : `Думпкар ${doc.model} №${doc.zav}`;
            if (doc.type === 'nosoz') { doc.model = /105/.test(v.type) ? '2VS-105' : /60/.test(v.type) ? '6VS-60' : v.type; doc.dr = v.tamirSanasi && /DR|депо/i.test(v.tamirTuri || '') ? fmtISO(v.tamirSanasi) : (doc.dr || ''); doc.kr = v.kr ? fmtISO(v.kr) : (v.krTxt || doc.kr || ''); doc.yil = v.yil || ''; }
            if (doc.type === 'razuk') { doc.vvod = v.vvod || ''; }
            cxForm();
        }
        function cxForm() {
            const doc = CXV.cur, d = cxDB(), E = escapeHtml, t = doc.type, f = (k, lab, ph, ty) => `<div class="nd-f"><label>${lab}</label><input ${ty ? 'type="' + ty + '"' : ''} value="${E(doc[k] === undefined ? '' : String(doc[k]))}" placeholder="${E(ph || '')}" onchange="CXV.cur['${k}']=this.value; cxPrev()"></div>`;
            let h = `<div class="px-h"><b>${CX_T[t][0]} ${E(CX_T[t][1])}</b><button class="mini-btn" onclick="cxOpen('${t}')">‹</button></div>
                <div class="nd-2"><div class="nd-f"><label>VAGON RAQAMI (boʻlaklab ham boʻladi)</label><input id="cxV" value="${E(doc.zav || '')}" placeholder="masalan 00000562"></div><div class="nd-f"><label>&nbsp;</label><button class="action-btn" onclick="cxVagon($id('cxV').value)">🔎 Pasportdan olish</button></div></div>
                <div class="nd-2">${f('month', 'OY', '2026-08', 'month')}${t === 'nosoz' ? f('date', 'SANA', '', 'date') : f('inv', 'INVENTAR №')}</div>${f('title', 'SARLAVHA / OBYEKT')}`;
            if (t === 'calc' || t === 'priem') {
                h += `<div class="hs-h">1. Materiallar</div><div class="cx-mats">${(doc.mats || []).map((m, i) => `<div class="cx-m"><input value="${E(m.name)}" onchange="CXV.cur.mats[${i}].name=this.value; cxPrev()"><input class="s" value="${E(m.unit || '')}" onchange="CXV.cur.mats[${i}].unit=this.value; cxPrev()"><input class="n" inputmode="decimal" value="${E(String(m.qty))}" onchange="CXV.cur.mats[${i}].qty=+String(this.value).replace(',','.')||0; cxPrev()"><input class="p" inputmode="decimal" value="${E(String(m.price))}" onchange="CXV.cur.mats[${i}].price=+String(this.value).replace(/\\s/g,'').replace(',','.')||0; cxPrev()"><button onclick="CXV.cur.mats.splice(${i},1); cxForm()">✕</button>${m.src ? `<small>📋 ${E(m.src)}</small>` : ''}</div>`).join('') || '<div class="xt-empty">Material yoʻq.</div>'}</div>
                    <div class="nv-btns"><button onclick="CXV.cur.mats.push({name:'',unit:'шт',qty:1,price:0}); cxForm()">＋ Qoʻlda</button><button onclick="cxFromF30()">📥 Forma-30 dan (ШПЗ boʻyicha)</button></div>`;
                h += `<div class="hs-h">2. Mehnat xarajatlari (norma boʻyicha)</div><div class="cx-mats">${(doc.works || []).map((x, i) => `<div class="cx-m"><select onchange="CXV.cur.works[${i}].n=+this.value; cxPrev()">${d.works.map(w => `<option value="${w.n}"${w.n === x.n ? ' selected' : ''}>${w.n}. ${E(w.name)} (${w.norm} ch·s, ${w.raz}-raz.)</option>`).join('')}</select><input class="n" type="number" min="1" value="${x.cnt || 1}" title="soni" onchange="CXV.cur.works[${i}].cnt=Math.max(1,+this.value||1); cxPrev()"><button onclick="CXV.cur.works.splice(${i},1); cxForm()">✕</button></div>`).join('')}</div>
                    <div class="nv-btns"><button onclick="CXV.cur.works.push({n:3,cnt:1}); cxForm()">＋ Ish turi</button></div>`;
            }
            if (t === 'razuk') h += `<div class="nd-2">${f('aktNo', 'AKT №', '')}${f('sostDate', 'TUZILGAN SANA (jadvalda)', '___.07.2026 г.')}</div>
                <div class="nd-2">${f('invFull', 'INVENTAR № (toʻliq, 10 xona)', cxInvFull(doc.inv))}${f('vvod', 'FOYDALANISHGA KIRITILGAN SANA', '01.12.2011')}</div>${f('god', 'ISHLAB CHIQARILGAN (qurilgan) SANA', 'boʻsh qolsa — kiritilgan sana')}
                <div class="hs-h">Asosiy vosita (1C maʼlumoti)</div><div class="nd-2">${f('bal', 'BALANS QIYMATI, soʻm', '956 899 756,64')}${f('izn', 'JAMGʻARILGAN ESKIRISH, soʻm', '956 899 756,64')}</div>
                <div class="hs-h">Demontaj qilinadigan qism (1C maʼlumoti)</div><div class="nd-2">${f('pBal', 'BALANS QIYMATI, soʻm', '86 120 978,10')}${f('pIzn', 'ESKIRISH, soʻm', '86 120 978,10')}</div>
                <div class="nd-2">${f('mass', 'QISM MASSASI (pasport), kg', '5578.88')}${f('ded', 'CHEGIRMA %', '20')}</div>${f('lomPrice', 'QORA LOM NARXI, soʻm/kg', '1565.18')}
                ${f('reason', 'SABABI (4-band)', 'Трещина колесная пара-6шт.')}${f('state', 'TEXNIK HOLATI (5-band)', 'ремонт не подлежит.')}${f('writeoff', 'XULOSA: СПИСАТЬ …', 'колесная пара-6шт.')}${f('docs', 'ILOVA QILINADIGAN HUJJATLAR', 'протокол технические совет №80, Акт в рабочей комиссии по приёмке.')}
                <div class="nd-2">${f('prikaz1', 'AJ BUYRUGʻI', 'от 30 июнь 2025 г. №00940')}${f('prikaz2', 'UPJT BUYRUGʻI', 'от 15 июль 2025 г. №910')}</div>`;
            if (t === 'priem') h += `${f('parts', 'KAPITAL TAʼMIR: «…замены [nimalar]» (qaratqich kelishigida)', 'автосцепок')}${f('partsQty', '5-BAND: QABULGA TAQDIM ETILGAN', 'автосцепка СА-3 – 2 шт.')}`;
            if (t === 'nosoz') { const sg = (doc.sg && doc.sg.length ? doc.sg : CX_NOSOZ_SG); h += `${f('model', 'TURI', '2VS-105')}<div class="nd-f"><label>AʼZOLAR (matndagi roʻyxat)</label><textarea rows="3" onchange="CXV.cur.members=this.value; cxPrev()">${E(doc.members || CX_NOSOZ_MEM)}</textarea></div><div class="nd-f"><label>NOSOZLIKLAR (har biri yangi qatorda)</label><textarea rows="3" placeholder="pastki ramada va plechosida 400 mmli yoriq mavjud;" onchange="CXV.cur.defects=this.value; cxPrev()">${E(doc.defects || '')}</textarea></div><div class="nd-2">${f('dr', 'DEPO TAʼMIRI (pasportdan)')}${f('kr', 'KAPITAL TAʼMIRI (pasportdan)')}</div>${f('yil', 'FOYDALANISHGA TOPSHIRILGAN YIL')}
                <div class="hs-h">Xulosa</div><div class="nd-2">${f('oldVag', 'JADVALDAGI QAYSI VAGON OʻRNIGA', '20569')}${f('planMonth', 'QAYSI OY JADVALI', '2026-yil sentyabr oyi')}</div>${f('cause', 'SABABI (…raqamli vagonning …)', 'pastki rama va plechosi sinishiga doimiy taʼsir qiluvchi yuk va metall charchashi sabab boʻlgan.')}
                <div class="nd-f"><label>XULOSA MATNI <small>(${doc.xulosaManual ? 'qoʻlda tahrirlangan · <a onclick="CXV.cur.xulosaManual=false; cxForm()">avtomatikka qaytarish</a>' : 'yuqoridagi maydonlardan avtomatik; **qalin**'})</small></label><textarea rows="4" onchange="CXV.cur.xulosa=this.value; CXV.cur.xulosaManual=true; cxPrev()">${E(doc.xulosaManual ? doc.xulosa || '' : cxNosozXul(doc))}</textarea></div>
                <div class="hs-h">Imzolar (lavozim | ism)</div>${sg.map((x, i) => `<div class="nd-2"><div class="nd-f"><input value="${E(x[0])}" onchange="CXV.cur.sg=(CXV.cur.sg||CX_NOSOZ_SG.map(z=>z.slice())); CXV.cur.sg[${i}][0]=this.value; cxPrev()"></div><div class="nd-f" style="display:flex;gap:6px"><input style="flex:1" value="${E(x[1])}" onchange="CXV.cur.sg=(CXV.cur.sg||CX_NOSOZ_SG.map(z=>z.slice())); CXV.cur.sg[${i}][1]=this.value; cxPrev()"><button class="mini-btn" title="Shtatdan tanlash (seh → xodim)" onclick="cxSgPick(${i})">👤</button></div></div>`).join('')}<div class="nd-chips"><i class="sg-sh" onclick="cxSgPick(-1)">👤 Shtatdan qoʻshish</i></div>`; }
            h += `<div class="cx-sum" id="cxSum"></div><div class="nd-page cx-page" id="cxPage"></div>
                <div class="cx-bar"><button class="on" onclick="cxStore()">💾 Saqlash</button><button onclick="dbPhone('cx')">📥 Telefonga</button><button onclick="dbTg('cx')">✈️ Telegram</button><button class="sg" onclick="dbSign('cx')">✍️ Imzoga</button><button onclick="cxExport('docx')">📝 Word</button><button onclick="cxExport('xlsx')">📊 Excel</button><button onclick="cxExport('jpg')">🖼 JPG</button><button onclick="cxPrint()">🖨 Chop etish</button><button onclick="cxSend()">📤 Yuborish</button>${t === 'calc' ? '<button onclick="cxToPriem()">📝 → Qabul akti</button>' : ''}${doc.at ? '<button class="danger" onclick="cxDel()">🗑</button>' : ''}</div>`;
            mdl('cxModal', h, true); cxPrev();
        }
        function cxPrev() { const doc = CXV.cur, p = $id('cxPage'); if (!p) return; const dx = cxDxId(doc);
            if (dx) { const data = cxDxData(doc), miss = cxDxMissing(data); clearTimeout(CXV.pt); CXV.pt = setTimeout(() => dxPreview(p, dx, data).catch(e => { p.innerHTML = '<div class="hp-warn">⚠️ ' + escapeHtml(agmkErrUz(e)) + '</div>'; }), 250); let w = $id('cxMiss'); if (!w) { w = document.createElement('div'); w.id = 'cxMiss'; p.before(w); } w.className = miss.length ? 'hp-warn' : 'nd-tip'; w.innerHTML = miss.length ? '✏️ Toʻldirilmagan (blankada boʻsh chiziq qoladi): ' + escapeHtml(miss.join(', ')) : '✅ Barcha maydonlar toʻldirilgan. Koʻrinish — korxona blankasi (Word/PDF aynan shunday).'; }
            else p.innerHTML = CX_T[doc.type][2](doc); const s = $id('cxSum'); if (s && (doc.type === 'calc' || doc.type === 'priem')) { const C = cxCalc(doc); s.innerHTML = `Materiallar: <b>${cxFmt(C.mSum)}</b> · Mehnat: <b>${cxFmt(C.lSum)}</b> · <b>Jami: ${cxFmt(C.total)} soʻm</b> <small>(stavkalar: ${C.rates.dop}% · ${C.rates.soc}% · ${C.rates.proch}%)</small>`; } }
        function cxStore() { const d = cxDB(), doc = CXV.cur; doc.at = doc.at || new Date().toISOString(); doc.upd = new Date().toISOString(); doc.by = authorStr(); if (doc.type === 'calc' && !doc.rates) doc.rates = Object.assign({}, d.rates); const i = d.docs.findIndex(x => x.id === doc.id); if (i >= 0) d.docs[i] = doc; else d.docs.push(doc); cxSave(d); try { aiLog('Hujjat saqlandi: ' + CX_T[doc.type][1] + ' — ' + (doc.title || '')); } catch (e) {} showToast('💾 Saqlandi'); cxForm(); }
        async function cxDel() { if (!(await uiConfirm('Hujjat oʻchirilsinmi?'))) return; const d = cxDB(); d.docs = d.docs.filter(x => x.id !== CXV.cur.id); cxSave(d); cxOpen(CXV.cur.type); }
        function cxHtml() { return `<div style="font-family:'Times New Roman',serif;font-size:11pt;color:#000">${CX_T[CXV.cur.type][2](CXV.cur)}</div>`; }
        function cxName() { const doc = CXV.cur; return CX_T[doc.type][1] + ' ' + (doc.zav || '') + ' ' + ((doc.type === 'nosoz' ? fmtISO(doc.date) : doc.month) || doc.date || ''); }
        async function cxExport(fmt) { try { const doc = CXV.cur; if (cxDxId(doc) && fmt === 'xlsx') { alert('Bu hujjat korxonaning Word blankasi — Excel shakli yoʻq. PDF yoki Word ni tanlang.'); return; } const files = cxDxId(doc) ? await cxDxFiles(doc, [fmt]) : await docMake(cxHtml(), cxName(), [fmt]); docDownload(files); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } }
        async function cxPrint() { const pr = $id('ndPrint'); if (!pr) { alert('Chop etish moduli topilmadi'); return; } const doc = CXV.cur; if (cxDxId(doc)) { const R = await dxRender(cxDxId(doc), cxDxData(doc)); pr.innerHTML = R.lay.pages.map(ops => `<img src="${dxCanvas(R.lay, ops, 2.4).toDataURL('image/png')}" style="width:100%;display:block;page-break-after:always">`).join(''); } else pr.innerHTML = `<div class="nd-page">${cxHtml()}</div>`; document.body.classList.add('nd-printing'); const done = () => { document.body.classList.remove('nd-printing'); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done); setTimeout(() => { try { window.print(); } catch (e) {} setTimeout(done, 1500); }, 60); }
        async function cxSend() { try { const doc = CXV.cur; if (cxDxId(doc)) { const snap = JSON.parse(JSON.stringify(doc)); sendOpen({ html: await cxDxSigHtml(doc), title: cxName(), lang: 'ru', fmts: ['pdf'], make: fmts => cxDxFiles(snap, fmts) }); } else sendOpen({ html: cxHtml(), title: cxName(), lang: 'ru', fmts: ['pdf'] }); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); } }
        function cxToPriem() { const c = CXV.cur, id = 'cx' + Date.now().toString(36); CXV.cur = Object.assign(JSON.parse(JSON.stringify(c)), { id: id, type: 'priem', at: null, title: c.title }); showToast('📝 Kalkulyatsiyadan qabul akti tayyorlandi — tekshirib saqlang'); cxForm(); }
        // ---------- Forma-30 dan materiallar (ШПЗ bo'yicha) ----------
        async function cxFromF30() {
            const E = escapeHtml, L = (typeof hsF30Of === 'function' ? hsF30Of('vagon') : []);
            if (!L.length) { alert('Forma-30 hali yuklanmagan (Hisobotlar → Vagon → «Forma-30 ni yuklash»).'); return; }
            const rec = L.find(x => x.month === CXV.cur.month) || L[0]; let items = [];
            try { const f = await hpF30FromStored(rec); items = f ? f.items : []; } catch (e) {}
            if (!items.length) { try { items = await hsF30Rows(rec, 'vagon'); } catch (e) {} }
            CXV.f30 = items; CXV.f30m = rec.month;
            const shpzs = Array.from(new Set(items.map(x => x.shpz).filter(Boolean))).sort();
            mdl('cxF30', `<div class="px-h"><b>📥 Forma-30 (${E(hsMon(rec.month))})</b><button class="mini-btn" onclick="mdlClose('cxF30')">✕</button></div>
                <div class="nd-2"><div class="nd-f"><label>ШПЗ</label><select id="cxShpz" onchange="cxF30List()"><option value="">— hammasi —</option>${shpzs.map(s => `<option>${E(s)}</option>`).join('')}</select></div><div class="nd-f"><label>QIDIRUV (nomi)</label><input id="cxQ" oninput="cxF30List()" placeholder="Автосцепка"></div></div>
                <div id="cxF30L" class="hs-list"></div><button class="action-btn" onclick="cxF30Add()">✅ Belgilanganlarni qoʻshish</button>`, true);
            cxF30List();
        }
        function cxF30List() { const E = escapeHtml, s = ($id('cxShpz') || {}).value || '', q = String(($id('cxQ') || {}).value || '').toLowerCase(); const L = (CXV.f30 || []).map((x, i) => [x, i]).filter(([x]) => (!s || x.shpz === s) && (!q || String(x.name).toLowerCase().includes(q))).slice(0, 200);
            $id('cxF30L').innerHTML = L.map(([x, i]) => `<label class="hs-row"><input type="checkbox" data-i="${i}" style="width:auto"> <b>${E(x.name)}</b><small>ШПЗ ${E(x.shpz || '—')} · треб. №${E(x.tid || '')} · ${x.qty} ${E(x.unit || '')} × ${cxFmt(x.price)} = ${cxFmt(r2((x.qty || 0) * (x.price || 0)))}</small></label>`).join('') || '<div class="xt-empty">Topilmadi</div>'; }
        function cxF30Add() { const add = [...document.querySelectorAll('#cxF30L input:checked')].map(c => CXV.f30[+c.dataset.i]); add.forEach(x => CXV.cur.mats.push({ name: x.name, unit: x.unit || 'шт', qty: x.qty || 0, price: x.price || 0, shpz: x.shpz, src: 'F30 ' + (CXV.f30m || '') + ' · ШПЗ ' + (x.shpz || '') + ' · треб. №' + (x.tid || '') })); mdlClose('cxF30'); cxForm(); }
        // ---------- Oylik stavkalar ----------
        function cxRates() {
            const d = cxDB(), R = d.rates, E = escapeHtml;
            mdl('cxF30', `<div class="px-h"><b>⚙️ Oylik stavkalar va normalar</b><button class="mini-btn" onclick="mdlClose('cxF30')">✕</button></div>
                <div class="nd-2"><div class="nd-f"><label>QOʻSHIMCHA ISH HAQI, %</label><input id="cr_dop" value="${R.dop}"></div><div class="nd-f"><label>BOSHQA XARAJATLAR, %</label><input id="cr_pr" value="${R.proch}"></div></div>
                <div class="nd-2"><div class="nd-f"><label>IJTIMOIY SUGʻURTA, %</label><input id="cr_soc" value="${R.soc}"></div><div class="nd-f"><label>QAYSI OY UCHUN (matn)</label><input id="cr_mn" value="${E(R.monthNote || '')}" placeholder="за июль"></div></div>
                <div class="nd-f"><label>RASTSENKA SANASI</label><input id="cr_rn" value="${E(R.rateNote || '')}"></div>
                <div class="hs-h">Normalar va tarif stavkalari</div><div class="cx-mats">${d.works.map((w, i) => `<div class="cx-m"><input value="${E(w.name)}" data-k="name" data-i="${i}"><input class="s" value="${w.raz}" data-k="raz" data-i="${i}" title="razryad"><input class="p" value="${w.tarif}" data-k="tarif" data-i="${i}" title="tarif"><input class="n" value="${w.norm}" data-k="norm" data-i="${i}" title="norma, ch·s"><small>= ${cxFmt(r2(w.norm * w.tarif))}</small></div>`).join('')}</div>
                <div class="nd-tip">Oʻzgarish faqat yangi saqlanadigan kalkulyatsiyalarga taʼsir qiladi; saqlanganlari oʻz stavkasi bilan qoladi. Tarix jurnalga yoziladi.</div>
                <button class="action-btn" onclick="cxRatesSave()">💾 Saqlash</button><div class="nd-tip">${(d.rateLog || []).slice(-5).reverse().map(l => E(l)).join('<br>')}</div>`, true);
        }
        function cxRatesSave() {
            const d = cxDB(), n = id => +String(($id(id) || {}).value || '').replace(',', '.'); const nr = { dop: n('cr_dop'), proch: n('cr_pr'), soc: n('cr_soc'), monthNote: $id('cr_mn').value, rateNote: $id('cr_rn').value };
            if (![nr.dop, nr.proch, nr.soc].every(x => isFinite(x) && x >= 0 && x < 1000)) { alert('Foizlar notoʻgʻri'); return; }
            document.querySelectorAll('#cxF30 .cx-m input').forEach(inp => { const w = d.works[+inp.dataset.i], k = inp.dataset.k; if (!w) return; w[k] = k === 'name' ? inp.value : (+String(inp.value).replace(',', '.') || w[k]); });
            d.rateLog = (d.rateLog || []).concat([new Date().toLocaleString() + ' · ' + authorStr() + ': qoʻsh. ' + nr.dop + '%, boshqa ' + nr.proch + '%, ijt. ' + nr.soc + '%']);
            d.rates = nr; cxSave(d); mdlClose('cxF30'); showToast('✅ Stavkalar saqlandi');
        }
        // ---------- Kalkulyatsiya faylini tekshirish ----------
        async function cxCheckFile(inp) {
            const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; let bk; try { bk = await hpReadBook(f); } catch (e) { alert('⚠️ ' + agmkErrUz(e)); return; }
            const out = [], num = v => typeof v === 'number' ? v : hsN(v), d = cxDB();
            bk.forEach(sh => {
                const R = sh.rows; if (!R.some(r => (r || []).some(c => /КАЛЬКУЛЯЦИЯ/i.test(String(c))))) return;
                const find = re => R.findIndex(r => (r || []).some(c => re.test(String(c))));
                const h = find(/Наименование материал/i); if (h < 0) return; let it = -1; for (let i = h + 1; i < R.length; i++) { if ((R[i] || []).some(x => /^\s*ИТОГО\s*:?\s*$/.test(String(x)))) { it = i; break; } } if (it < 0) return;
                const hr = R[h], ci = re => hr.findIndex(c => re.test(String(c))), cq = ci(/Кол-?во/i), cp = ci(/Цена/i), cs = ci(/Сумма/i);
                let sum = 0; const iss = [];
                for (let i = h + 1; i < it; i++) { const r = R[i] || [], q = num(r[cq]), p = num(r[cp]), s = num(r[cs]); if (q === null && p === null) continue; const exp = r2((q || 0) * (p || 0)); sum = r2(sum + (s === null ? 0 : s)); if (s === null || Math.abs(exp - s) > 0.011) iss.push(`${i + 1}-qator «${String(r.find(c => typeof c === 'string' && c.trim().length > 2) || '').trim()}»: ${q} × ${cxFmt(p)} = ${cxFmt(exp)}, yozilgan ${s === null ? '—' : cxFmt(s)}`); }
                const itv = num((R[it] || [])[cs]); if (itv === null || Math.abs(itv - sum) > 0.011) iss.push(`ИТОГО (${it + 1}-qator): qatorlar yigʻindisi ${cxFmt(sum)}, yozilgan ${cxFmt(itv)} — ${itv !== null && itv < sum ? 'ayrim qatorlar ИТОГО ga kirmagan' : 'farq bor'}`);
                const lab = re => { const i = find(re); if (i < 0) return null; const r = R[i]; for (let j = r.length - 1; j >= 0; j--) { const v = num(r[j]); if (v !== null && j > 0 && j < 6) return v; } const v = num(r[2]); return v; };
                const osn = lab(/Основная зарплата/i), dop = lab(/Доп\.?\s*Зарплата/i), itg = lab(/^\s*Итого:?\s*сум/i), soc = lab(/Соц\.?\s*страх/i), pr = lab(/Прочие затраты/i), vs = lab(/Всего трудозатраты/i);
                const pct = re => { const i = find(re); if (i < 0) return null; const m = String((R[i] || []).join(' ')).match(/(\d+[.,]?\d*)\s*%/); return m ? +m[1].replace(',', '.') : null; };
                const pd = pct(/Доп\.?\s*Зарплата/i), ps = pct(/Соц\.?\s*страх/i), pp = pct(/Прочие затраты/i);
                const chk = (nm, got, exp) => { if (got === null || exp === null) return; if (Math.abs(got - exp) > 0.011) iss.push(`${nm}: formula boʻyicha ${cxFmt(exp)}, yozilgan ${cxFmt(got)}`); };
                if (osn !== null) { chk('Qoʻshimcha ish haqi ' + pd + '%', dop, pd !== null ? r2(osn * pd / 100) : null); const e1 = dop !== null ? r2(osn + dop) : null; chk('Itogo', itg, e1); if (itg !== null) { chk('Ijt. sugʻurta ' + ps + '%', soc, ps !== null ? r2(itg * ps / 100) : null); chk('Boshqa xarajatlar ' + pp + '%', pr, pp !== null ? r2(itg * pp / 100) : null); if (soc !== null && pr !== null) chk('Jami mehnat', vs, r2(itg + soc + pr)); } }
                const ti = find(/Всего материалы и трудозатраты/i); if (ti >= 0 && vs !== null) { const tv = (R[ti] || []).map(num).filter(v => v !== null)[0]; const exp = r2(sum + vs); if (tv !== undefined && Math.abs(tv - exp) > 0.011) iss.push(`Umumiy summa: materiallar ${cxFmt(sum)} + mehnat ${cxFmt(vs)} = ${cxFmt(exp)}, yozilgan ${cxFmt(tv)}`); }
                if (pd !== null && pd !== d.rates.dop) iss.push(`ℹ️ Faylda qoʻshimcha ish haqi ${pd}%, sozlamada ${d.rates.dop}%`); if (pp !== null && pp !== d.rates.proch) iss.push(`ℹ️ Faylda boshqa xarajatlar ${pp}%, sozlamada ${d.rates.proch}%`);
                out.push({ s: sh.s, iss: iss, sum: sum });
            });
            const E = escapeHtml, bad = out.filter(o => o.iss.some(x => !/^ℹ️/.test(x))).length;
            mdl('cxF30', `<div class="px-h"><b>🔍 ${E(f.name)}</b><button class="mini-btn" onclick="mdlClose('cxF30')">✕</button></div><div class="nd-tip">${out.length} ta kalkulyatsiya varagʻi tekshirildi · ${bad ? '❌ ' + bad + ' tasida xato' : '✅ xato topilmadi'}</div>
                ${out.map(o => `<div class="hs-f ${o.iss.some(x => !/^ℹ️/.test(x)) ? 'red' : 'blue hp-info'}"><div class="hs-fh"><b>${o.iss.some(x => !/^ℹ️/.test(x)) ? '❌' : '✅'} Varaq «${E(o.s)}»</b></div>${o.iss.map(x => `<div>• ${E(x)}</div>`).join('') || '<div>Formulalar toʻgʻri.</div>'}</div>`).join('') || '<div class="xt-empty">Faylda «КАЛЬКУЛЯЦИЯ» varagʻi topilmadi.</div>'}`, true);
            try { aiLog('Kalkulyatsiya fayli tekshirildi: ' + f.name + ' — ' + bad + ' varaqda xato'); } catch (e) {}
        }
        // ---------- Dalolatnoma bo'limiga tugmalar ----------
        (function () {
            if (typeof hsRender !== 'function') return; hsRender = agmkExtend('hsRender', '---------- Dalolatnoma boʼlimiga tugmalar ----------', hsRender, o => function () { const r = o.apply(this, arguments); try { if (HS.tab === 'akt' && !HS.akt) { const b = secBody('screen-hisob'); if (b && !b.querySelector('.cx-cards')) b.insertAdjacentHTML('afterbegin', `<div class="cx-cards"><div class="hs-h">🆕 Namunali hujjatlar</div><div class="hs-grid">${Object.keys(CX_T).map(k => `<div class="hs-card" onclick="cxOpen('${k}')"><b>${CX_T[k][0]}</b><span>${escapeHtml(CX_T[k][1])}</span><small>${cxDB().docs.filter(x => x.type === k).length} ta</small></div>`).join('')}<div class="hs-card" onclick="pprOpen()"><b>🗓</b><span>Taʼmir grafigi (PPR)</span><small>oylik jadval</small></div></div></div>`); } } catch (e) { console.error(e); } return r; });
        })();
        // Hisobot tekshiruvi: spravkadagi ШПЗ Forma-30 da bo'lishi kerak (2-qoida)
        (function () {
            if (typeof hpCheck !== 'function') return; hpCheck = agmkExtend('hpCheck', 'Hisobot tekshiruvi: spravkadagi ШПЗ Forma-30 da boʼlishi kerak (2-qoida)', hpCheck, o => function (pkg) { const res = o.apply(this, arguments); try { const F = res && res.findings, f30 = pkg.f30; if (!F || !f30 || !f30.items) return res; const have = new Set(f30.items.map(x => String(x.shpz || '').trim()).filter(Boolean)); if (!have.size) return res;
                pkg.sheets.filter(x => x.type === 'spr' && x.data).forEach(x => x.data.forEach(b => { const s = String(b.shpz || '').trim(); if (s && !have.has(s)) F.push({ id: 'ps' + F.length, st: '', t: 'shpzmiss', lvl: 'red', sec: 'ШПЗ tekshiruvi', name: 'ШПЗ ' + s + ' Forma-30 da yoʻq', msg: 'Spravka blokidagi ШПЗ ' + s + ' Forma-30 dagi ШПЗ lar orasida topilmadi (Forma-30 da: ' + Array.from(have).slice(0, 8).join(', ') + (have.size > 8 ? '…' : '') + ').', src: [b.src] }); })); } catch (e) {} return res; });
        })();
        try { Object.assign(HELP, {
            calc: { t: '📑 Kalkulyatsiya va aktlar', b: `<ol><li>«📄 Dalolatnomalar» → «🆕 Namunali hujjatlar» → <b>📑 Kalkulyatsiya</b> → «＋ Yangi».</li><li>Vagon raqamini yozing (boʻlaklab ham boʻladi) → «🔎 Pasportdan olish» — zavod №, inventar, turi oʻzi qoʻyiladi.</li><li><b>Materiallar:</b> «📥 Forma-30 dan (ШПЗ boʻyicha)» — ШПЗ ni tanlang (masalan 081000), keraklilarini belgilang: miqdor va narx Forma-30 dan olinadi. Qoʻlda ham qoʻshish mumkin.</li><li><b>Mehnat:</b> ish turini tanlang (norma jadvalidan: masalan «Замена автосцепки» 0,75 kishi-soat, 5-razryad).</li><li>Hisob namunadagi formulalar bilan: asosiy = norma × tarif; qoʻshimcha = asosiy × %; itogo; ijt. sugʻurta = itogo × %; boshqa = itogo × %; jami mehnat = itogo + ijt. + boshqa; <b>umumiy = materiallar + mehnat</b>.</li><li>«⚙️ Oylik stavkalar» — foizlar (164,5% · 12% · 235,07%) va normalarni har oy oʻzgartirasiz; saqlangan kalkulyatsiyalar oʻz stavkasi bilan qoladi.</li><li>«📝 → Qabul akti» — kalkulyatsiyadan <b>Qabul qilish ishchi komissiyasi akti</b> tayyorlanadi (summa va qismlar oʻzi qoʻyiladi).</li><li>«🔍 Faylni tekshirish» — mavjud kalkulyatsiya Excel faylidagi xatolarni topadi: qator summasi, ИТОГО ga kirmagan qatorlar, foizlar, umumiy summa.</li></ol>` },
            ppr: { t: '🗓 Taʼmir grafigi', b: `<ol><li>Yillik grafik (Excel) va oldingi oylar jadvallarini birga yuklang.</li><li>Oyni ◀ ▶ bilan tanlang, joyni (VX, 2-TYS…) tanlang.</li><li>Vagonni bosing: ➡️ boshqa oyga surish, ⇄ boshqa vagon bilan almashtirish, 🗑 olib tashlash. ＋ — qoʻshish.</li><li>Vagon «🔧 Tamirga yuborish» bilan toʻsatdan taʼmirga ketsa — kelgusi oydagi oʻrnidan joriy oyga oʻzi oʻtadi («nosozlik tufayli»).</li><li>AI ga: «16148 ni kelgusi oyga sur», «4364 va 9171 ni almashtir» — tasdiqlasangiz saqlanadi.</li><li>📄 PDF · 📝 Word · 📊 Excel · 🖼 JPG · 🖨 · 📤 — namunadagi oylik jadval shaklida. Barcha oʻzgarishlar «📜 Tarix» da.</li></ol>` } }); } catch (e) {}

