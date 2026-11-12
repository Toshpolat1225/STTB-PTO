
        // =====================================================================
        // v3.0 — 🎙 AI ISH OQIMI (ovoz yoki yozma buyruq bilan)
        //  «Bildirishnomalarimga nima keldi?» → yangi bildirishnomalar ro'yxati (raqamlangan, ovoz bilan o'qiladi)
        //  «Almatovning achotini tekshir» / «2-sini tekshir» → shu odamdan kelgan oxirgi hisobot fayllari avtomatik tekshiriladi
        //  «Natijani Almatovga qaytarib yubor, xatolari bor ekan deb yoz» → zamechaniya PDF + izoh o'sha odamga yuboriladi
        //  Odam ismi bo'yicha o'zi topiladi (xodimlar bazasi + yozishmalar; lotin/kirill farqisiz). Ikki odam mos kelsa — so'raydi.
        //  Hisob-kitob va tekshiruv — ilovaning formulalari; AI hech narsani o'ylab topmaydi.
        // =====================================================================
        var AIF = { list: [], last: null, busy: false };
        function aifSay(t, html) { // keyingi (kechiktirilgan) javob: suhbat oynasiga yoziladi va ovoz yoqilgan bo'lsa o'qiladi
            try { if (typeof aicAdd === 'function' && $id('aiMessages')) aicAdd('bot', (html || escapeHtml(t)) + '<small class="ai-src">🔒 Mahalliy AI · ilova amali</small>'); } catch (e) {}
            try { if (typeof speakAiText === 'function' && typeof aiVoiceOutputEnabled !== 'undefined' && aiVoiceOutputEnabled) { const L = typeof AILIVE !== 'undefined' && AILIVE.on; if (L && AILIVE.rec) { try { AILIVE.rec.abort(); } catch (e) {} } speakAiText(t, () => { if (L && AILIVE.on) setTimeout(aiLiveListen, 450); }); } } catch (e) {}
            try { showToast(t.split('\n')[0].slice(0, 120)); } catch (e) {}
        }
        // So'z oxiridagi qo'shimchalar: Almatovning, Almatovga, Almatovdan, achotini …
        function aifStem(w) { return String(w || '').toLowerCase().replace(/[ʻʼ'`‘’]/g, '').replace(/(larning|larini|lariga|laridan|ning|niki|dagi|dan|ga|ni|da|ka|ning)$/, ''); }
        function aifKey(w) { return typeof sigKey === 'function' ? sigKey(aifStem(w)) : aifStem(w); }
        // Odamlar: yozishmalardagilar (ular bilan aloqa bor) + xodimlar bazasi
        function aifPeople() {
            const out = [], seen = new Set();
            try { Object.values(chatAll()).forEach(c => { if (!c || !c.p || !c.p.name) return; const k = (c.p.tabel || '') + '|' + c.p.name; if (seen.has(k)) return; seen.add(k); out.push(Object.assign({ chat: c }, c.p)); }); } catch (e) {}
            try { pplList().forEach(p => { const k = (p.tabel || '') + '|' + p.name; if (seen.has(k) || out.some(o => o.tabel && o.tabel === p.tabel)) return; seen.add(k); out.push(p); }); } catch (e) {}
            return out;
        }
        function aifFind(q, pool) {
            const toks = String(q || '').split(/[\s,.;:!?«»"]+/).filter(w => w.length >= 3 && !/^\d+$/.test(w)).map(aifKey).filter(k => k.length >= 3);
            const STOP = new Set(['achat', 'hisabat', 'natija', 'tekshir', 'yabar', 'qaytar', 'kaytar', 'izah', 'xatalar', 'hatalar', 'bildirishnama', 'fayl', 'deb', 'yazib', 'ekan', 'bar'].map(x => aifKey(x)));
            const T = toks.filter(k => !STOP.has(k)); if (!T.length) return [];
            const sc = (pool || aifPeople()).map(p => { const W = String(p.name).split(/[\s.]+/).filter(w => w.length >= 3).map(aifKey); let s = 0; T.forEach(t => { if (W[0] && W[0] === t) s += 3; else if (W.slice(1).includes(t)) s += 2; }); return { p: p, s: s }; }).filter(x => x.s > 0);
            const mx = Math.max(0, ...sc.map(x => x.s)); return sc.filter(x => x.s === mx).map(x => x.p);
        }
        // Shu odamdan kelgan oxirgi hisobot (Excel/PDF) xabari
        function aifLastReport(p) {
            const c = p.chat || Object.values(chatAll()).find(x => x.p && ((p.tabel && cleanTabel(x.p.tabel) === cleanTabel(p.tabel)) || x.p.name === p.name)); if (!c) return null;
            const M = (c.msgs || []).filter(m => !m.me && (m.files || []).some(f => f.ref && /\.(xlsx?|xlsm|ods|pdf|docx?)$/i.test(f.name))); return M.length ? { c: c, m: M[M.length - 1] } : null;
        }
        function aifNotifList() {
            const t = cleanTabel(currentUser && currentUser.tabel);
            return getNotifs().filter(notifForMe).filter(n => !(n.read || []).includes(t)).reverse().slice(0, 12);
        }
        function aifFmtList(L) { return L.map((n, i) => (i + 1) + '. ' + (n.icon || '🔔') + ' ' + n.text + ' (' + fmtDT(n.at) + ')').join('\n'); }
        // ---------- Asosiy: buyruqni tanish (sinxron javob; og'ir ish fonda) ----------
        function aifCmd(q) {
            const s = ai3Norm(q);
            // 0) Chop etish
            if (/(pechat|pechot|chop et|распечат|печат|print)/.test(s) && !/(kolonka|kalonka)/.test(s)) return aifPrintCmd(q);
            // 1) Bildirishnomalar
            if (/(bildirishnoma|уведомлен|xabarlar|nima(lar)? kel|yangi nima|nima yangilik)/.test(s) && !/(yubor|jo.?nat|qaytar|tekshir)/.test(s)) {
                const L = aifNotifList(); AIF.list = L;
                if (!L.length) return { t: '🔔 Yangi bildirishnoma yoʻq.', personal: true };
                return { t: '🔔 ' + L.length + ' ta yangi bildirishnoma:\n' + aifFmtList(L) + '\n\nMasalan: «' + (L.findIndex(n => n.chatTabel && n.files && n.files.length) + 1 || 1) + '-sini tekshir» yoki «Almatovning achotini tekshir».', personal: true };
            }
            // 2) Hisobotni tekshirish
            if (/(tekshir|провер)/.test(s) && /(achot|hisobot|otchot|отч|fayl|[0-9]+.?(chi|sini|si)\b|birinchi|ikkinchi|uchinchi|oxirgi|kelgan)/.test(s) || (/(tekshir|провер)/.test(s) && aifFind(q).length)) {
                let p = null;
                const num = (s.match(/(\d+)\s*-?\s*(chi|sini|si|raqamli)/) || [])[1] || ({ birinchi: 1, ikkinchi: 2, uchinchi: 3, tortinchi: 4, beshinchi: 5 })[(s.match(/(birinchi|ikkinchi|uchinchi|tortinchi|beshinchi)/) || [])[1]];
                if (num && AIF.list[num - 1]) { const n = AIF.list[num - 1]; if (n.chatTabel) p = aifPeople().find(x => cleanTabel(x.tabel) === n.chatTabel) || { name: n.chatName, tabel: n.chatTabel }; }
                if (!p) { const senders = aifPeople().filter(x => aifLastReport(x)); const F = aifFind(q, senders); const A = F.length ? F : aifFind(q);
                    if (A.length > 1) return { t: '❓ Qaysi biri: ' + A.slice(0, 5).map(x => x.name + (x.role ? ' (' + x.role + ')' : '')).join('; ') + '? Toʻliq ism bilan ayting.', personal: true };
                    p = A[0] || null;
                    if (!p && /(oxirgi|kelgan)/.test(s)) { const L = senders.map(x => ({ x: x, r: aifLastReport(x) })).sort((a, b) => String(b.r.m.at).localeCompare(String(a.r.m.at))); p = L[0] ? L[0].x : null; } }
                if (!p) return { t: '❓ Kimning hisobotini tekshiray? Ismini ayting (masalan «Almatovning achotini tekshir») yoki avval «bildirishnomalarimga nima keldi» deb soʻrang.', personal: true };
                const R = aifLastReport(p);
                if (!R) return { t: '📭 ' + p.name + 'dan hisobot fayli kelmagan (Yozishmalarda Excel/PDF yoʻq).', personal: true };
                if (AIF.busy) return { t: '⏳ Oldingi tekshiruv hali tugamadi.', personal: true };
                setTimeout(() => aifRunCheck(p, R), 300);
                return { t: '⏳ ' + p.name + 'ning hisoboti tekshirilmoqda: ' + R.m.files.map(f => f.name).join(', ') + ' (' + fmtDT(R.m.at) + ')…', personal: true };
            }
            // 3) Natijani qaytarib yuborish (izoh bilan)
            if (/(qaytar|yubor|jo.?nat|отправ|верн)/.test(s) && /(natija|zamechan|замечан|xato|izoh|tekshiruv|achot|hisobot)/.test(s)) {
                if (!AIF.last) return { t: '❓ Avval hisobotni tekshiring: masalan «Almatovning achotini tekshir».', personal: true };
                let p = AIF.last.p; const F = aifFind(q); if (F.length === 1) p = F[0]; else if (F.length > 1 && !F.some(x => x.name === p.name)) return { t: '❓ Kimga yuboray: ' + F.slice(0, 5).map(x => x.name).join('; ') + '?', personal: true };
                const cm = aifComment(q);
                setTimeout(() => aifSendBack(p, AIF.last.chk, cm), 200);
                return { t: '📤 ' + p.name + 'ga natija (zamechaniya PDF) tayyorlanmoqda' + (cm ? ', izoh: «' + cm + '»' : '') + '…', personal: true };
            }
            return null;
        }
        function aifComment(q) {
            const t = String(q || '').replace(/\s+/g, ' ');
            const m = t.match(/(?:izoh(?:ga)?|tagi(?:dan|ga)|ostiga)\s*(?:izoh\s*)?(?:yoz\w*\s*|qo.?sh\w*\s*)?[:,-]?\s*(.+?)\s+deb\b/i) || t.match(/[,:]\s*([^,:]+?)\s+deb\s+(?:yoz|izoh|qo.?y)/i) || t.match(/izoh[:\s-]+(.+)$/i);
            let c = m ? m[1].trim() : ''; c = c.replace(/^(izoh|yoz\w*)\s+/i, '').replace(/\s*(ham|xam)$/i, '');
            if (!c) return ''; c = c.charAt(0).toUpperCase() + c.slice(1); if (!/[.!?]$/.test(c)) c += '.'; return c.replace(/^Hato/, 'Xato');
        }
        async function aifRunCheck(p, R) {
            AIF.busy = true;
            try {
                const files = [];
                for (const f of R.m.files) { if (!f.ref) continue; const b = await mediaGetBlob(f.ref); if (b) files.push(new File([b], f.name, { type: f.mime || b.type })); }
                if (!files.length) { aifSay('⚠️ ' + p.name + 'dan kelgan fayllar telefonda topilmadi.'); return; }
                const before = (hsChecks()[0] || {}).id;
                await hpStart('vagon', files); await new Promise(r => setTimeout(r, 200));
                const who = $id('hp_who'); if (who) who.value = p.name;
                await hpRun(); await new Promise(r => setTimeout(r, 400));
                const rec = hsChecks()[0]; if (!rec || rec.id === before) { aifSay('⚠️ Tekshiruv boshlanmadi: toʻplamda spravka, defekt vedomost yoki akt topilmadi (' + files.map(f => f.name).join(', ') + ').'); try { if ($id('hpModal') && !$id('hpModal').classList.contains('hidden')) showToast('Varaq turlarini tekshiring'); } catch (e) {} return; }
                const d = await hsJsonGet(rec.dref), F = (d && d.findings) || [], red = F.filter(f => f.lvl === 'red'), blue = F.filter(f => f.lvl === 'blue'), hid = F.filter(f => f.lvl === 'hid');
                AIF.last = { chk: rec.id, p: p, at: Date.now() };
                let t = '📊 ' + p.name + 'ning hisoboti tekshirildi' + (d && d.month ? ' (' + hsMon(d.month) + ')' : '') + ': ' + (red.length ? red.length + ' ta xato' : 'jiddiy xato yoʻq') + (blue.length ? ', ' + blue.length + ' ta tekshirish kerak' : '') + (hid.length ? ', yashirin qatorlar bor' : '') + '.';
                if (red.length) t += '\n' + red.slice(0, 3).map((f, i) => (i + 1) + ') ' + (f.name ? f.name + ': ' : '') + String(f.msg || '').replace(/\s+/g, ' ').slice(0, 160)).join('\n') + (red.length > 3 ? '\n… va yana ' + (red.length - 3) + ' ta.' : '');
                if (red.length) t += '\n\nQaytarish uchun: «natijani ' + p.name.split(' ')[0] + 'ga qaytarib yubor, xatolari bor deb yoz».';
                aifSay(t);
                try { openHisob('hisob'); HS.chk = rec.id; hsRender(); } catch (e) {}
            } catch (e) { console.error(e); aifSay('⚠️ Tekshirishda xato: ' + agmkErrUz(e)); }
            finally { AIF.busy = false; }
        }
        async function aifSendBack(p, chkId, comment) {
            try {
                const x = hsRec(chkId), d = x && await hsJsonGet(x.dref); if (!x || !d) { aifSay('⚠️ Tekshiruv natijasi topilmadi.'); return; }
                const due = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10), Z = hp3ZamHtml(x, d, p.name, due, false, true);
                if (!Z.n) { aifSay('ℹ️ Natijada xato yoʻq — zamechaniya tuzilmadi. Faqat izoh yuborilsinmi? Yozishmalar orqali yuboring.'); return; }
                const title = 'Zamechaniya ' + p.name + ' ' + (d.month || ''), files = await docMake(Z.html, title, ['pdf']);
                const text = comment || 'Hisobotda xatolar bor — zamechaniyani koʻrib, tuzatib qayta yuboring.';
                const all = hsChecks(), rr = all.find(z => z.id === x.id); if (rr) { rr.zam = (rr.zam || []).concat([{ at: new Date().toISOString(), to: p.name, due: due, n: Z.n, ids: Z.ids, by: authorStr(), via: 'ai' }]); hsLog(rr, '📝 Zamechaniya (AI buyrugʻi bilan) ' + p.name + 'ga yuborildi: ' + Z.n + ' ta band; izoh: «' + text + '»'); kvSet(HS_CHK_KEY, all); }
                if (typeof syncReady === 'function' && syncReady() && p.tabel && typeof syncSendMsg === 'function') {
                    await syncSendMsg(p, text, files); await chatAddMsg(p, { me: true, t: text, files: files, via: 'app' });
                    aifSay('✅ ' + p.name + 'ga yuborildi (ilova ichida): zamechaniya PDF — ' + Z.n + ' ta band, izoh: «' + text + '».');
                } else {
                    await chatAddMsg(p, { me: true, t: text, files: files, via: 'telegram' });
                    await docShare(files, { via: 'telegram', to: p, subject: title, text: text });
                    aifSay('📤 ' + p.name + ' ilovada serverga ulanmagan — zamechaniya Telegram orqali yuborish uchun ochildi (' + Z.n + ' ta band).');
                }
            } catch (e) { console.error(e); aifSay('⚠️ Yuborilmadi: ' + agmkErrUz(e)); }
        }
        // =====================================================================
        // 🖨 «PECHAT QIL» — hujjatni topib chop etish
        //  «20.09 dagi gʻildirak sinishi dalolatnomasini pechat qil», «00000563 likvidatsiya aktini chop et», «sentyabr grafigini pechat qil»
        //  yoki ochiq turgan hujjat. Topilgani aytiladi: «Namunani koʻrsataymi?» (ovoz + yozma). 3 soniyada javob boʻlmasa — chop etiladi.
        //  «ha / koʻrsat» — oldin koʻrsatadi; «yoʻq / darhol» — darhol chop etadi; «bekor» — toʻxtatadi.
        //  Kompyuterda (yorliq --kiosk-printing bilan) printerga toʻgʻridan-toʻgʻri; telefonda Android chop etish oynasi ochiladi.
        // =====================================================================
        var AIF_PT = [
            ['oq', /(g.?ildirak|o.?q\b|o.?qning|oq sinish|ось|колесн|noxush hodisa)/, t => /oq_sinish/.test(t.tur || '')],
            ['sinov', /(kolodk|колодк|sinov)/, t => /sinov/.test(t.tur || '') || /kolodk|колодк/i.test(t.text || '')],
            ['razuk', /(likvid|разукомп|razukomp|spisan|списан|pril.* ?5|приложение ?5)/, t => t.cx === 'razuk'],
            ['priem', /(qabul|pri[eyo]m|приём|прием|rabochey|ishchi komissiya|pril.* ?4)/, t => t.cx === 'priem'],
            ['calc', /(kalkul|калькул)/, t => t.cx === 'calc'],
            ['nosoz', /(nosoz|неисправ)/, t => t.cx === 'nosoz' || /nosozlik/i.test(t.title || '')],
            ['ppr', /(grafig|grafik|jadval|график)/, t => t.kind === 'ppr'],
            ['defekt', /(defekt|дефект)/, t => /defekt/.test(t.tur || '') || /дефект/i.test(t.title || '')]
        ];
        function aifDocs() {
            const L = [];
            try { ndAkts().forEach(a => L.push({ kind: 'akt', ref: a.id, tur: a.tur, title: a.title || 'Akt', date: a.hs || a.sana || String(a.at || '').slice(0, 10), date2: a.sana, at: a.at, text: (a.title || '') + ' ' + (a.text || ''), a: a })); } catch (e) {}
            try { cxDB().docs.forEach(d => L.push({ kind: 'cx', cx: d.type, ref: d.id, title: CX_T[d.type][1] + ' ' + (d.zav || ''), date: d.type === 'nosoz' ? d.date : (d.month || '') + '-01', at: d.upd || d.at, text: [d.title, d.zav, d.inv, d.reason].join(' '), d: d })); } catch (e) {}
            try { const P = pprDB(); if (P) { const M = new Set(Object.keys(P.mon || {})); for (let k = 1; k <= 12; k++) M.add(P.year + '-' + String(k).padStart(2, '0')); Array.from(M).forEach(m => Array.from(new Set(P.secs.map(s => s.place))).forEach(pl => L.push({ kind: 'ppr', ref: m + '|' + pl, title: pl + ' taʼmir jadvali ' + pprMName(m), date: m + '-01', at: m, text: pl, m: m, pl: pl }))); } } catch (e) {}
            return L;
        }
        function aifDateQ(s) { // so'rovdagi sana: {d:'2026-09-20'} yoki {m:'2026-09'}
            const y0 = new Date().getFullYear(); let m = s.match(/\b(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?\b/);
            if (m && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) { const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : y0; return { d: y + '-' + String(+m[2]).padStart(2, '0') + '-' + String(+m[1]).padStart(2, '0') }; }
            const OY = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'], RU = ['январ', 'феврал', 'март', 'апрел', 'ма[йя]', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
            for (let i = 0; i < 12; i++) { const re = new RegExp('(?:(\\d{1,2})\\s*-?\\s*)?(?:' + OY[i] + '|' + RU[i] + ')\\w*(?:\\s*(20\\d{2}))?'); const mm = s.match(re); if (mm) { const y = mm[2] ? +mm[2] : y0, mo = String(i + 1).padStart(2, '0'); return mm[1] ? { d: y + '-' + mo + '-' + String(+mm[1]).padStart(2, '0') } : { m: y + '-' + mo }; } }
            return null;
        }
        function aifFindDoc(q) {
            const s = ai3Norm(q), types = AIF_PT.filter(t => t[1].test(s)), dq = aifDateQ(s), nums = (s.match(/\b\d{3,}\b/g) || []).filter(n => !/^20\d{2}$/.test(n) || n.length > 4);
            const cur = aifOpenDoc();
            if (!types.length && !dq && !nums.length) return cur ? { doc: cur, more: 0 } : null;
            let L = aifDocs();
            if (types.length) L = L.filter(d => types.some(t => t[2](d)));
            if (dq) L = L.filter(d => dq.d ? (d.date === dq.d || d.date2 === dq.d) : String(d.date || '').slice(0, 7) === dq.m || String(d.date2 || '').slice(0, 7) === dq.m);
            if (nums.length) L = L.filter(d => nums.some(n => String(d.text || '').replace(/\s/g, '').indexOf(n.replace(/^0+/, '')) >= 0));
            if (types.length === 1 && types[0][0] === 'ppr' && L.length > 1) { const pl = /2.?tys|2.?тйс/i.test(s) ? '2-TYS' : 'VX'; const f = L.filter(d => d.pl === pl); if (f.length) L = f; }
            L.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.at || '').localeCompare(String(a.at || '')));
            return L.length ? { doc: L[0], more: L.length - 1 } : { none: true, types: types.map(t => t[0]), dq: dq, nums: nums };
        }
        function aifOpenDoc() { // hozir ochiq turgan hujjat
            const vis = id => { const e = $id(id); return e && !e.classList.contains('hidden'); };
            if (vis('cxModal') && CXV.cur && $id('cxPage')) return { kind: 'cx', cx: CXV.cur.type, title: cxName(), d: CXV.cur, open: true };
            if (vis('pprModal') && typeof PPRV !== 'undefined') return { kind: 'ppr', title: PPRV.place + ' taʼmir jadvali ' + pprMName(PPRV.m), m: PPRV.m, pl: PPRV.place, open: true };
            const nd = $id('screen-nd'); if (nd && nd.classList.contains('active') && $id('ndPage')) return { kind: 'html', title: typeof ndCurTitle === 'function' ? ndCurTitle() : 'Akt', html: $id('ndPage').innerHTML, open: true };
            return null;
        }
        async function aifPrintPages(doc) { // → {html} yoki {imgs}
            if (doc.kind === 'akt') return { html: doc.a.html };
            if (doc.kind === 'html') return { html: doc.html };
            if (doc.kind === 'ppr') { const o = { m: PPRV.m, p: PPRV.place }; PPRV.m = doc.m; PPRV.place = doc.pl; try { return { html: pprHtml() }; } finally { PPRV.m = o.m; PPRV.place = o.p; } }
            if (doc.kind === 'cx') { const d = doc.d; if (cxDxId(d)) { const R = await dxRender(cxDxId(d), cxDxData(d)); return { imgs: R.lay.pages.map(ops => dxCanvas(R.lay, ops, 2.4).toDataURL('image/png')) }; } return { html: `<div style="font-family:'Times New Roman',serif;font-size:11pt;color:#000">${CX_T[d.type][2](d)}</div>` }; }
            throw new Error('Nomaʼlum hujjat');
        }
        async function aifPrintNow(doc) {
            const P = await aifPrintPages(doc), pr = $id('ndPrint'); if (!pr) throw new Error('Chop etish moduli topilmadi');
            pr.innerHTML = P.imgs ? P.imgs.map(u => `<img src="${u}" style="width:100%;display:block;page-break-after:always">`).join('') : `<div class="nd-page">${P.html}</div>`;
            document.body.classList.add('nd-printing'); const done = () => { document.body.classList.remove('nd-printing'); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done);
            setTimeout(() => { try { window.print(); } catch (e) { alert("Chop etish oynasini ochib boʻlmadi."); } setTimeout(done, 1500); }, 80);
            try { aiLog('Chop etildi: ' + doc.title); } catch (e) {}
        }
        async function aifPreview(doc) {
            if (doc.open) { showToast('👁 Hujjat ekranda ochiq'); return; }
            if (doc.kind === 'akt') { try { aicClose(); } catch (e) {} openND('arch'); setTimeout(() => ndOpenArch(doc.ref), 80); return; }
            if (doc.kind === 'cx') { try { aicClose(); } catch (e) {} cxOpen(doc.cx); cxEdit(doc.ref); return; }
            if (doc.kind === 'ppr') { try { aicClose(); } catch (e) {} PPRV.place = doc.pl; pprOpen(doc.m); PPRV.place = doc.pl; pprOpen(doc.m); }
        }
        // Tasdiq oynasi: 3 soniya; ovoz bilan ham javob berish mumkin
        function aifPrintAsk(doc, more) {
            const E = escapeHtml, q = '🖨 Topdim: «' + doc.title + '»' + (doc.date && doc.kind !== 'ppr' ? ' (' + fmtISO(String(doc.date).slice(0, 10)) + ')' : '') + (more ? '. Mos keladigan yana ' + more + ' ta bor — eng oxirgisi olindi' : '') + '. Namunani koʻrsataymi? Javob boʻlmasa 3 soniyadan keyin chop etaman.';
            AIF.pr = { doc: doc, t: 0, left: 3, hold: false };
            mdl('aifPr', `<div class="px-h"><b>🖨 Chop etish</b><button class="mini-btn" onclick="aifPrDo('cancel')">✕</button></div><div class="nd-tip">${E(q)}</div>
                <div class="aif-cd"><i id="aifCdBar"></i></div><div id="aifCdTxt" style="text-align:center;font-size:13px;color:#cbd5e1;margin:6px 0">⏳ 3</div>
                <div class="pk-btns"><button onclick="aifPrDo('cancel')">✖ Bekor</button><button onclick="aifPrDo('show')">👁 Ha, koʻrsat</button><button class="pr" onclick="aifPrDo('print')">🖨 Darhol chop et</button></div>`);
            const tick = () => { const P = AIF.pr; if (!P) return; if (P.hold) { P.t = setTimeout(tick, 250); return; } P.left -= 0.25; const b = $id('aifCdBar'), tx = $id('aifCdTxt'); if (b) b.style.width = Math.max(0, P.left / 3 * 100) + '%'; if (tx) tx.textContent = '⏳ ' + Math.ceil(Math.max(0, P.left)); if (P.left <= 0) aifPrDo('print'); else P.t = setTimeout(tick, 250); };
            const start = () => { if (!AIF.pr) return; AIF.pr.t = setTimeout(tick, 250); aifPrListen(); };
            const voice = typeof aiVoiceOutputEnabled !== 'undefined' && aiVoiceOutputEnabled && typeof speakAiText === 'function';
            try { if (typeof AILIVE !== 'undefined' && AILIVE.rec) { AIF.prLive = AILIVE.on; AILIVE.on = false; try { AILIVE.rec.abort(); } catch (e) {} } else AIF.prLive = typeof AILIVE !== 'undefined' && AILIVE.on; if (AIF.prLive) AILIVE.on = false; } catch (e) {}
            if (voice) { let st = false; const go = () => { if (!st) { st = true; start(); } }; speakAiText('Topdim. ' + doc.title + '. Namunani koʻrsataymi?', go); setTimeout(go, 6000); } else start();
            return q;
        }
        function aifPrListen() { // qisqa ovozli javob: ha / koʻrsat / yoʻq / bekor
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR || !AIF.pr) return;
            if (!(typeof aiVoiceOutputEnabled !== 'undefined' && aiVoiceOutputEnabled) && !AIF.prLive) return;
            try { const r = new SR(); r.lang = 'uz-UZ'; r.interimResults = true; r.continuous = false; r._quiet = true; let got = '';
                r.onresult = e => { if (AIF.pr) AIF.pr.hold = true; got = Array.from(e.results).map(x => x[0].transcript).join(' '); };
                r.onend = () => { if (!AIF.pr) return; AIF.pr.hold = false; const s = ai3Norm(got); if (/(bekor|to.?xta|kerak emas|отмен|стоп)/.test(s)) aifPrDo('cancel'); else if (/(^|\s)(ha|xa|ko.?rsat|показ|да)(\s|$)/.test(s)) aifPrDo('show'); else if (/(yo.?q|darhol|chop et|pechat|нет|печат)/.test(s)) aifPrDo('print'); };
                r.onerror = () => { if (AIF.pr) AIF.pr.hold = false; }; r.start(); AIF.pr.rec = r; } catch (e) {}
        }
        async function aifPrDo(a) {
            const P = AIF.pr; if (!P) return; AIF.pr = null; clearTimeout(P.t); try { P.rec && P.rec.abort(); } catch (e) {} mdlClose('aifPr');
            const resume = () => { try { if (AIF.prLive && typeof aiLiveStart === 'function') { AIF.prLive = false; setTimeout(aiLiveStart, 400); } } catch (e) {} };
            try {
                if (a === 'cancel') { showToast('✖ Chop etish bekor qilindi'); resume(); return; }
                if (a === 'show') { await aifPreview(P.doc); showToast('👁 Namuna ochildi — chop etish uchun «pechat qil» deng yoki 🖨 tugmasini bosing'); return; }
                await aifPrintNow(P.doc); showToast('🖨 Chop etishga yuborildi: ' + P.doc.title);
            } catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
            resume();
        }
        (function () { const c = document.createElement('style'); c.textContent = '.aif-cd{height:6px;border-radius:4px;background:#1e293b;overflow:hidden;margin-top:6px}.aif-cd i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#38bdf8,#22c55e);transition:width .25s linear}'; document.head.appendChild(c); })();
        function aifPrintCmd(q) {
            const R = aifFindDoc(q);
            if (!R) return { t: '❓ Qaysi hujjatni chop etay? Masalan: «20.09 dagi gʻildirak sinishi dalolatnomasini pechat qil», «00000563 likvidatsiya aktini pechat qil», «sentyabr grafigini pechat qil».', personal: true };
            if (R.none) return { t: '📭 Soʻralgan hujjat topilmadi' + (R.dq ? ' (' + (R.dq.d ? fmtISO(R.dq.d) : hsMon(R.dq.m)) + ')' : '') + (R.nums.length ? ' (№ ' + R.nums.join(', ') + ')' : '') + '. Arxivdagi dalolatnomalar, hujjatlar va grafiklar ichidan qidirdim.', personal: true };
            setTimeout(() => aifPrintAsk(R.doc, R.more), 250);
            return { t: '🖨 Topdim: «' + R.doc.title + '». Namunani koʻrsataymi? 3 soniyada javob boʻlmasa chop etaman.', personal: true };
        }

