        /* ===== 31-bosqich (4): AI bilim bazasi — indeks, hujjat yuklash, lug'at, o'rgatish, tahlil ===== */
        // ---------- Atamalar lug'ati (umumiy ta'riflar; normativ punktlar bu yerda yo'q) ----------
        var KB_GLOSS = [
            [['dr', 'depo tamiri', 'деповской ремонт'], "DR — depo ta'miri (деповской ремонт): vagonni depoda davriy ta'mirlash. Muddati texnika turiga qarab belgilanadi."],
            [['kr', 'kapital tamir', 'капитальный ремонт'], "KR — kapital ta'mir (капитальный ремонт): texnikaning asosiy qism va agregatlarini to'liq tiklash bilan bog'liq eng katta hajmli ta'mir."],
            [['tr', 'joriy tamir', 'текущий ремонт'], "TR — joriy ta'mir (текущий ремонт): ishlash davomida paydo bo'lgan nosozliklarni bartaraf etuvchi rejali ta'mir. Lokomotivlarda TR-1, TR-2, TR-3 bosqichlari bor."],
            [['to', 'texnik xizmat', 'техническое обслуживание', 'to-1', 'to-2', 'to-3'], "TO — texnik xizmat ko'rsatish (техническое обслуживание): ko'rik, sozlash va moylash ishlari. TO-1, TO-2, TO-3 — hajmi bo'yicha bosqichlar."],
            [['ppr', 'rejali ogohlantiruvchi', 'планово-предупредительный'], "PPR — rejali-ogohlantiruvchi ta'mir tizimi (планово-предупредительный ремонт): ta'mirlar oldindan tuzilgan jadval bo'yicha o'tkaziladi."],
            [['pto', 'ichtb', 'пункт технического обслуживания'], "PTO / ICHTB — vagonlarga texnik xizmat ko'rsatish bo'limi (пункт технического обслуживания): vagonlarni ko'rikdan o'tkazish va joriy ta'mirlash."],
            [['upjt', 'упжт', 'sttb'], "UPJT (УПЖТ) / STTB — AGMK sanoat temir yo'l transporti boshqarmasi: kombinat korxonalari o'rtasida yuk tashishni ta'minlaydi."],
            [['dumpkar', 'думпкар', 'вагон-самосвал'], "Dumpkar (вагон-самосвал) — yukni yon tomonga o'zi ag'daradigan vagon. Pnevmatik ag'darish silindrlari bilan jihozlangan (masalan, 2ВС-105)."],
            [['sisterna', 'цистерна'], "Sisterna (цистерна) — suyuq va gazsimon yuklar uchun vagon."],
            [['xopper', 'хоппер'], "Xopper (хоппер) — sochiluvchan yuklar uchun, pastdan bo'shatiladigan vagon."],
            [['platforma', 'платформа'], "Platforma — ochiq, bortsiz yoki past bortli yuk vagoni."],
            [['kolodka', 'колодка', 'tormoz kolodkasi'], "Tormoz kolodkasi (тормозная колодка) — g'ildirak yuzasiga bosilib tormozlashni ta'minlovchi detal. Cho'yan yoki kompozitsion bo'ladi."],
            [['avtostsepka', 'автосцепка'], "Avtostsepka (автосцепка) — vagon va lokomotivlarni avtomatik ulash qurilmasi."],
            [['yutuvchi apparat', 'поглощающий аппарат'], "Yutuvchi apparat (поглощающий аппарат) — avtostsepka tizimida zarb va tortish kuchlarini yumshatuvchi qurilma."],
            [['nadressor', 'надрессорная балка'], "Nadressor balka (надрессорная балка) — aravacha prujinalari ustida joylashgan, kuzov og'irligini aravachaga uzatuvchi balka."],
            [['bokovina', 'боковина'], "Bokovina (боковина) — aravachaning yon ramasi."],
            [['buksa', 'букса'], "Buksa (букса) — g'ildirak juftligi o'qining uchidagi podshipnikli uzel."],
            [['gildirak juftligi', 'колесная пара'], "G'ildirak juftligi (колесная пара) — o'qqa mahkam o'rnatilgan ikkita g'ildirak."],
            [['xrebtov', 'хребтовая балка'], "Xrebtov balka (хребтовая балка) — vagon ramasining bo'ylama asosiy balkasi."],
            [['shkvorn', 'шкворень'], "Shkvorn (шкворень) — kuzovni aravachaga burilish imkoni bilan bog'lovchi o'q."],
            [['pyatnik', 'пятник'], "Pyatnik (пятник) — kuzov og'irligini aravachaga uzatuvchi tayanch."],
            [['triangel', 'триангель'], "Triangel (триангель) — tormoz richag tizimidagi kolodkalarni ushlab turuvchi uch burchakli detal."],
            [['havo taqsimlagich', 'воздухораспределитель'], "Havo taqsimlagich (воздухораспределитель) — tormoz magistralidagi bosim o'zgarishiga qarab tormoz silindrini to'ldiruvchi yoki bo'shatuvchi asbob."],
            [['teplovoz', 'тепловоз', 'tem2', 'тэм2', 'tem-18', 'тэм18'], "Teplovoz (тепловоз) — dizel dvigatelli lokomotiv. Bazada ТЭМ2, ТЭМ-18ДМ, 2ТЭ116 seriyalari bor."],
            [['tortuvchi agregat', 'тяговый агрегат', 'pe2m', 'пэ2м', 'pe2u', 'пэ2у'], "Tortuvchi agregat (тяговый агрегат) — karyer temir yo'llarida og'ir yuk poyezdlarini tortuvchi elektr lokomotiv majmuasi (ПЭ2М, ПЭ2У seriyalari)."],
            [['drezina', 'дрезина', 'avtodrezina'], "Avtodrezina (автодрезина) — yo'l ta'mirlash brigadalari va materiallarni tashish uchun o'ziyurar temir yo'l mashinasi."],
            [['motovoz', 'мотовоз'], "Motovoz (мотовоз) — kichik quvvatli, manevr ishlari uchun ichki yonuv dvigatelli lokomotiv."],
            [['avtomotrisa', 'автомотриса'], "Avtomotrisa (автомотриса) — o'ziyurar temir yo'l vagoni: yo'lovchi yoki xizmat xodimlarini tashish uchun."],
            [['peregon', 'перегон'], "Peregon (перегон) — ikki qo'shni stansiya (razyezd) orasidagi yo'l qismi."],
            [['razyezd', 'разъезд'], "Razyezd (разъезд) — bir yo'lli liniyada poyezdlarni o'tkazib yuborish uchun ajratilgan punkt."],
            [['strelka', 'стрелочный перевод', 'strelochniy'], "Strelka (стрелочный перевод) — harakat tarkibini bir yo'ldan boshqasiga o'tkazuvchi qurilma."],
            [['zamechaniya', 'замечание'], "Zamechaniya — rahbariyat tomonidan aniqlangan kamchilik bo'yicha yozma ko'rsatma. Ilovada rasm, ovoz va matn bilan beriladi va bartaraf etilgach yopiladi."],
            [['defekt akt', 'дефектный акт'], "Defekt akt (дефектный акт) — komissiya tomonidan texnikaning nosozliklarini qayd etuvchi hujjat."],
            [['reklamatsiya', 'рекламация'], "Reklamatsiya — yetkazib beruvchiga sifatsiz mahsulot bo'yicha rasmiy da'vo."],
            [['gost', 'гост'], "GOST (ГОСТ) — davlatlararo standart. Aniq talablar faqat ilovaga kiritilgan hujjat matnidan olinadi."],
            [['pte', 'пте'], "PTE (ПТЭ) — temir yo'llarni texnik ekspluatatsiya qilish qoidalari. Punktlarni ilovaga PTE matnini yuklaganingizdan keyin keltira olaman."]
        ];
        // ---------- Tokenlash ----------
        var KB_STOP = new Set(['va', 'bilan', 'uchun', 'haqida', 'nima', 'qanday', 'qaysi', 'kim', 'qachon', 'menga', 'ber', 'bering', 'ayt', 'ayting', 'iltimos', 'bu', 'shu', 'ushbu', 'u', 'bor', 'mi', 'ham', 'da', 'ni', 'ga', 'dan', 'ning', 'haqidagi', 'malumot', 'ma', 'lumot', 'и', 'в', 'на', 'с', 'по', 'о', 'об', 'что', 'как', 'для', 'это', 'the', 'what']);
        function kbToks(s) { return dbN(String(s || '').replace(/[ьъЬЪ'ʻʼ`’‘]/g, '')).split(/[^a-z0-9]+/).filter(w => w.length >= 2 && !KB_STOP.has(w)).map(w => w.length > 6 ? w.slice(0, 6) : w); }
        // ---------- O'rgatilgan javoblar ----------
        var KB_TEACH_KEY = 'agmk_ai_teach';
        function kbTeachAll() { try { return JSON.parse(localStorage.getItem(KB_TEACH_KEY) || '[]') || []; } catch (e) { return []; } }
        function kbTeachSave(l) { try { localStorage.setItem(KB_TEACH_KEY, JSON.stringify(l)); } catch (e) {} KB.dirty = true; }
        function kbTeachFind(q) {
            const t = new Set(kbToks(q)); if (!t.size) return null; let best = null, bs = 0;
            kbTeachAll().forEach(x => { const u = new Set(kbToks(x.q)); let inter = 0; t.forEach(w => { if (u.has(w)) inter++; }); const s = inter / Math.max(t.size, u.size); if (s > bs) { bs = s; best = x; } });
            return bs >= 0.6 ? best : null;
        }
        async function kbTeach(q) {
            if (!isAdmin()) { alert("AI'ga javob o'rgatish faqat admin uchun."); return; }
            const a = await uiPrompt("📝 «" + q + "» savoliga to'g'ri javobni yozing:", ''); if (!a || !a.trim()) return;
            const l = kbTeachAll().filter(x => dbN(x.q) !== dbN(q)); l.unshift({ id: 't' + Date.now().toString(36), q: q, a: a.trim(), by: (currentUser && currentUser.name) || '', at: new Date().toISOString() });
            kbTeachSave(l.slice(0, 500)); showToast("✅ AI o'rgandi — keyingi safar shu javobni beradi");
        }
        // ---------- Indeks (BM25) ----------
        var KB = { docs: [], df: new Map(), avg: 1, dirty: true, t: 0 };
        function kbStrip(h) { const d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
        function kbBuild() {
            const docs = [];
            const add = (src, title, text, open) => { const t = String(text || '').trim(); if (t) docs.push({ src: src, title: title, text: t, open: open || null }); };
            try { ndDocs().forEach(d => (d.punkts || []).forEach(p => add('📚 ' + d.title + ', ' + p.n + (/^\d/.test(p.n) ? '-band' : ''), d.title, p.t))); } catch (e) {}
            try { ND_REFS.forEach(r => add('📌 ' + r.title, r.title, r.uz + ' ' + r.ru)); } catch (e) {}
            try { ndAkts().forEach(a => add("🗂 Aktlar arxivi: " + a.title + ' (' + fmtISO((a.at || '').slice(0, 10)) + ')', a.title, kbStrip(a.html).slice(0, 3000))); } catch (e) {}
            try { SP_SETS.forEach(st => (SP_DATA[st.id] || []).forEach(x => add("🔩 Ehtiyot qismlar — " + st.title + " (2ВС-105 KR)", x.n, x.n + ' — ' + x.q + ' ' + (x.u || '') + " (1 vagon uchun)" + (x.alt ? '; ' + x.alt.map(a => a.n + ' ' + a.q + ' ' + a.u).join('; ') : '')))); } catch (e) {}
            try { INFRA_2023.items.forEach(o => { const tp = o.topics || {}; Object.keys(tp).forEach(k => { const p = (tp[k].p || []).join(' '); add("🛤️ Temir yo'l pasporti (2023): " + (o.uz || o.ru), o.uz, (o.ru || '') + '. ' + (o.note || '') + ' ' + p); }); if (o.note && !Object.keys(tp).length) add("🛤️ Temir yo'l pasporti (2023): " + o.uz, o.uz, o.note); }); } catch (e) {}
            KB_GLOSS.forEach(g => add("📖 Atamalar lug'ati", g[0][0], g[0].join(' ') + ' — ' + g[1]));
            kbTeachAll().forEach(x => add("📝 O'rgatilgan javob (" + (x.by || 'admin') + ')', x.q, x.q + ' — ' + x.a));
            KB.docs = docs.map(d => { const tk = kbToks(d.title + ' ' + d.text); const tf = new Map(); tk.forEach(w => tf.set(w, (tf.get(w) || 0) + 1)); return Object.assign(d, { tf: tf, len: tk.length }); });
            KB.df = new Map(); KB.docs.forEach(d => d.tf.forEach((_, w) => KB.df.set(w, (KB.df.get(w) || 0) + 1)));
            KB.avg = KB.docs.reduce((a, d) => a + d.len, 0) / Math.max(1, KB.docs.length); KB.dirty = false; KB.t = Date.now();
        }
        function kbSearch(q, k) {
            if (KB.dirty || Date.now() - KB.t > 120000) kbBuild();
            const qt = [...new Set(kbToks(q))]; if (!qt.length) return [];
            const N = KB.docs.length, k1 = 1.4, b = 0.7;
            const res = KB.docs.map(d => { let s = 0, hit = 0; qt.forEach(w => { const f = d.tf.get(w); if (!f) return; hit++; const df = KB.df.get(w) || 1, idf = Math.log(1 + (N - df + 0.5) / (df + 0.5)); s += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * d.len / KB.avg)); }); return { d: d, s: s, cov: hit / qt.length }; }).filter(x => x.s > 0);
            res.sort((a, c) => c.s - a.s); return res.slice(0, k || 5);
        }
        function kbSnippet(text, q, max) {
            const qt = kbToks(q), sents = String(text).split(/(?<=[.!?;])\s+/);
            let best = sents[0] || '', bs = -1;
            sents.forEach(s => { const t = new Set(kbToks(s)); let c = 0; qt.forEach(w => { if (t.has(w)) c++; }); if (c > bs) { bs = c; best = s; } });
            return best.length > max ? best.slice(0, max) + '…' : best;
        }
        function kbAnswer(q) {
            const tch = kbTeachFind(q); if (tch) return tch.a + "\n📚 Manba: o'rgatilgan javob (" + (tch.by || 'admin') + ')';
            const n = aiNorm(q);
            // "X nima" — lug'at
            const gm = n.match(/^(.+?)\s+(nima|degani nima|nimani anglatadi|что такое|это что)\??$/) || n.match(/^(что такое)\s+(.+)$/);
            const term = gm ? (gm[1] === 'что такое' ? gm[2] : gm[1]) : null;
            if (term) { const tt = dbN(term); const g = KB_GLOSS.find(x => x[0].some(k => dbN(k) === tt || tt.includes(dbN(k)) && dbN(k).length >= 3)); if (g) return g[1] + "\n📚 Manba: atamalar lug'ati"; }
            const r = kbSearch(q, 3); if (!r.length) return null;
            const top = r[0]; if (top.cov < 0.5 || top.s < 2.2) return null;
            let t = kbSnippet(top.d.text, q, 420);
            const more = r.slice(1).filter(x => x.cov >= 0.5 && x.d.src !== top.d.src).slice(0, 2);
            return t + '\n📚 Manba: ' + top.d.src.replace(/^\S+\s/, '') + (more.length ? '\n🔎 Yana: ' + more.map(x => x.d.src.replace(/^\S+\s/, '')).join('; ') : '');
        }
        // ---------- Texnika bo'yicha batafsil savollar va tahlil ----------
        var KB_FIELDS = [[/seh|sex|tys|biriktir/, 'seh', 'Seh'], [/inventar/, 'inv', 'Inventar raqami'], [/qurilgan|ishlab chiqarilgan|yili|necha yosh|yoshi/, 'yil', 'Ishlab chiqarilgan yili'], [/zavod|ishlab chiqaruvchi|maker|kim ishlab/, 'maker', 'Ishlab chiqaruvchi'], [/model/, 'model', 'Model'], [/ishga tushgan|foydalanishga/, 'vvod', 'Foydalanishga kiritilgan'], [/xizmat muddati|srok/, 'srok', 'Xizmat muddati'], [/qo.?llanil|ishlatil|qayerda/, 'primen', "Qo'llanilishi"], [/izoh|eslatma/, 'note', 'Izoh']];
        function kbUnitDetail(q) {
            const n = aiNorm(q); if (typeof aiqParse !== 'function') return null;
            const P = aiqParse(q); const u = aiqFind(P); if (!u) return null;
            if (/necha marta|nechta marta|tarix|jurnal|qachon(lar)? ta.?mirlan/.test(n) && !/keyingi/.test(n)) {
                const h = (u.history || []); const tm = h.filter(x => /ta.?mir|ремонт|dr|kr|tr/i.test(x.type || ''));
                const ym = n.match(/oxirgi (\d+) yil/); const from = ym ? (new Date().getFullYear() - +ym[1]) + '' : '';
                const l = from ? tm.filter(x => String(x.date || '') >= from) : tm;
                return unitLabel(u) + ": " + (ym ? 'oxirgi ' + ym[1] + ' yilda ' : '') + "ta'mir tarixida " + l.length + ' ta yozuv' + (l.length ? ':\n' + l.slice(0, 8).map(x => '• ' + fmtISO(x.date) + ' — ' + String(x.type || '').replace(/\s*\(\d\d:\d\d\)/, '')).join('\n') : '.') + (u.tamirSanasi ? "\nPasportdagi oxirgi ta'mir: " + fmtISO(u.tamirSanasi) + (u.tamirTuri ? ' (' + u.tamirTuri + ')' : '') : '') + '\n📚 Manba: texnika pasporti';
            }
            for (const [re, f, lb] of KB_FIELDS) if (re.test(n) && u[f] !== undefined && u[f] !== '') { const v = u[f]; return unitLabel(u) + ' — ' + lb + ': ' + (f === 'yil' && unitAge(u) !== null ? v + ' (' + unitAge(u) + ' yosh)' : v) + '\n📚 Manba: texnika pasporti'; }
            return null;
        }
        function kbKindOf(n) { return /xodim|ishchi|shtat|сотрудник|работник/.test(n) ? 'ppl' : /lokomotiv|teplovoz|локомотив/.test(n) ? 'lok' : /drezina|motovoz|avtomotrisa|yo.?l texnika|путев/.test(n) ? 'yol' : /avtotraktor|traktor|avtomobil|avtobus|yuklagich|avto ?texnika/.test(n) ? 'avto' : /vagon|dumpkar|sisterna|platforma|xopper|вагон/.test(n) ? 'vag' : null; }
        function kbPool(kind) { return kind === 'vag' ? onlyVagons() : vagonlarData.filter(v => v.kind === kind); }
        var KB_KN = { vag: 'Vagonlar', lok: 'Lokomotivlar', yol: "Yo'l texnikalari", avto: 'Avtotraktor texnikasi', ppl: 'Xodimlar' };
        function kbListRows(kind, list) {
            if (kind === 'ppl') return [['№', 'F.I.Sh.', 'Lavozim', 'Bo\'lim', 'Tabel']].concat(list.map((p, i) => [i + 1, p.name, p.role, p.place || '', p.tabel || '']));
            return [['№', 'Texnika', 'Turi', 'Seh', 'Yili', 'Holati', "Oxirgi ta'mir", "Keyingi ta'mir"]].concat(list.map((v, i) => [i + 1, unitLabel(v), v.type || v.naim || '', v.seh || '', v.yil || '', v.status || '', v.tamirSanasi ? fmtISO(v.tamirSanasi) : '', v.nextLabel || (v.keyingi ? fmtISO(v.keyingi) : '')]));
        }
        function kbList(q) {
            const n = aiNorm(q);
            if (!/ro.?yxat|список|перечень|hammasi|barchasi|hamma\b|jami/.test(n)) return null;
            if (typeof aiqParse === 'function') { const P = aiqParse(q); if (P.st || P.overdue || P.win || P.age || P.yil || P.sup || P.seh || P.series.length || P.sub.length || (P.vtype && P.vtype !== 'Dumpkar*')) return null; }
            const kind = kbKindOf(n); if (!kind) return null;
            const list = kind === 'ppl' ? pplList() : kbPool(kind);
            const excel = /excel|exel|xlsx|эксел/.test(n), pdf = /\bpdf\b|пдф/.test(n);
            if (excel || pdf) {
                const rows = kbListRows(kind, list), title = KB_KN[kind] + " ro'yxati " + fmtISO(todayISO());
                if (excel) { docDownload([{ name: title.replace(/[^\p{L}\d]+/gu, '_') + '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', blob: xlsxFromRows(rows, KB_KN[kind]) }]); }
                else { const html = `<div class="a-head"><span>Olmaliq sh.</span><span>${fmtISO(todayISO())}-y.</span></div><div class="a-title">${escapeHtml(KB_KN[kind])} ro'yxati<br>MA'LUMOTNOMA</div><p class="ni">Jami: ${list.length} ta. Manba: «AGMK-STTB PTO» dasturi bazasi.</p><table>${rows.map((r, i) => '<tr>' + r.map(c => i ? '<td>' + escapeHtml(String(c)) + '</td>' : '<th>' + escapeHtml(String(c)) + '</th>').join('') + '</tr>').join('')}</table>`; setTimeout(() => pdfFromHtml(html, title.replace(/[^\p{L}\d]+/gu, '_') + '.pdf'), 300); }
                return '📄 ' + KB_KN[kind] + " ro'yxati (" + list.length + ' ta) ' + (excel ? 'Excel' : 'PDF') + ' faylga tayyorlanmoqda.';
            }
            if (kind === 'ppl') { const by = {}; list.forEach(p => { const k = (p.place || '').split(' — ')[0] || 'Boshqa'; by[k] = (by[k] || 0) + 1; }); return '👥 Xodimlar: jami ' + list.length + ' ta.\n' + Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => '• ' + k + ': ' + c).join('\n') + "\nTo'liq ro'yxat: «xodimlar ro'yxatini Excel qil» yoki «PDF qil».\n📚 Manba: xodimlar bazasi"; }
            const st = {}; list.forEach(v => { st[v.status] = (st[v.status] || 0) + 1; });
            const ty = {}; list.forEach(v => { const t = v.type || v.naim || '—'; ty[t] = (ty[t] || 0) + 1; });
            return '📋 ' + KB_KN[kind] + ': jami ' + list.length + ' ta.\nHolati: ' + Object.entries(st).map(([k, c]) => k + ' — ' + c).join(', ') + '\nTurlari: ' + Object.entries(ty).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => k + ' — ' + c).join(', ') + '\n' + list.slice(0, 10).map(v => '• ' + unitLabel(v) + ' — ' + v.status).join('\n') + (list.length > 10 ? "\n... va yana " + (list.length - 10) + " ta. To'liq ro'yxat: «" + KB_KN[kind].toLowerCase() + " ro'yxatini Excel qil» yoki «PDF qil»." : '') + '\n📚 Manba: texnika bazasi';
        }
        function kbAnalytics(q) {
            const n = aiNorm(q), kind = kbKindOf(n) || (/texnika/.test(n) ? 'all' : null); if (!kind || kind === 'ppl') return null;
            const pool = kind === 'all' ? vagonlarData.filter(v => v.kind !== 'infra') : kbPool(kind), nm = kind === 'all' ? 'Texnika' : KB_KN[kind];
            let m;
            if ((m = n.match(/(seh|sex|tys|tur|turi|holat|yil|marka|seriya)\w*\s+(bo.?yicha|kesimida|bo.?lib)/))) {
                const key = /seh|sex|tys/.test(m[1]) ? 'seh' : /holat/.test(m[1]) ? 'status' : /yil/.test(m[1]) ? 'yil' : 'type', lb = { seh: 'seh', status: 'holat', yil: 'ishlab chiqarilgan yil', type: 'tur' }[key];
                const g = {}; pool.forEach(v => { const k = String(v[key] || v.naim || '—').trim() || '—'; g[k] = g[k] || { n: 0, bad: 0 }; g[k].n++; if (v.status === "Ta'mir talab") g[k].bad++; });
                const rows = Object.entries(g).sort((a, b) => b[1].n - a[1].n);
                return '📊 ' + nm + ' — ' + lb + ' bo\'yicha (' + pool.length + ' ta):\n' + rows.slice(0, 15).map(([k, x]) => '• ' + k + ': ' + x.n + (x.bad ? " (ta'mir talab " + x.bad + ')' : '')).join('\n') + (rows.length > 15 ? '\n... va yana ' + (rows.length - 15) + ' guruh' : '') + '\n📚 Manba: texnika bazasi';
            }
            if (/o.?rtacha yosh|средний возраст/.test(n)) {
                const ag = pool.map(v => unitAge(v)).filter(x => x !== null); if (!ag.length) return null;
                const g = {}; pool.forEach(v => { const a = unitAge(v); if (a === null) return; const k = v.type || v.naim || '—'; g[k] = g[k] || []; g[k].push(a); });
                return '📊 ' + nm + " — o'rtacha yosh: " + (ag.reduce((a, b) => a + b, 0) / ag.length).toFixed(1) + ' yil (' + ag.length + ' ta)\n' + Object.entries(g).sort((a, b) => b[1].length - a[1].length).slice(0, 10).map(([k, l]) => '• ' + k + ': ' + (l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) + ' yil (' + l.length + ' ta)').join('\n') + '\n📚 Manba: texnika bazasi';
            }
            if ((m = n.match(/(keyingi|kelgusi|kelasi)\s+(\d+|bir|ikki|uch|to.?rt|besh|olti)\s*oy/)) || /prognoz|reja.*ta.?mir.*oy/.test(n)) {
                const W = { bir: 1, ikki: 2, uch: 3, 'to\'rt': 4, tort: 4, besh: 5, olti: 6 }; const k = m ? (+m[2] || W[m[2]] || 3) : 3;
                const t = new Date(); const out = [];
                for (let i = 0; i < k; i++) { const d = new Date(t.getFullYear(), t.getMonth() + i, 1), key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); const c = pool.filter(v => String(v.keyingi || '').slice(0, 7) === key); out.push('• ' + (typeof OY_UZ !== 'undefined' ? OY_UZ[d.getMonth()] : key) + ' ' + d.getFullYear() + ': ' + c.length + ' ta'); }
                const over = pool.filter(v => typeof v.kun === 'number' && v.kun < 0 && v.status !== 'Tamirda').length;
                return '📈 ' + nm + " — keyingi " + k + " oyda ta'mirga tushadiganlar (keyingi ta'mir sanasi bo'yicha):\n" + out.join('\n') + (over ? "\n⚠️ Bundan tashqari muddati o'tganlari: " + over + ' ta' : '') + '\n📚 Manba: texnika bazasi';
            }
            if (/(shu|bu) oy.*(o.?tgan|oldingi) oy|o.?tgan oy.*(shu|bu) oy|taqqosla/.test(n)) {
                const t = new Date(), a = todayISO().slice(0, 7), pd = new Date(t.getFullYear(), t.getMonth() - 1, 1), b = pd.getFullYear() + '-' + String(pd.getMonth() + 1).padStart(2, '0');
                const ca = pool.filter(v => String(v.tamirSanasi || '').slice(0, 7) === a).length, cb = pool.filter(v => String(v.tamirSanasi || '').slice(0, 7) === b).length;
                const na = pool.filter(v => String(v.keyingi || '').slice(0, 7) === a).length, nb2 = pool.filter(v => String(v.keyingi || '').slice(0, 7) === b).length;
                return '📊 ' + nm + " — shu oy va o'tgan oy:\n• Ta'mirlangan: " + ca + ' / ' + cb + "\n• Ta'mir muddati to'g'ri kelgan: " + na + ' / ' + nb2 + '\n📚 Manba: texnika bazasi';
            }
            return null;
        }
        // Ehtiyot qism me'yori — aniq yil bo'yicha (2022 / 2024 / 2027) va yillar taqqoslash
        function kbSp(q) {
            const n = aiNorm(q); const ym = n.match(/\b(2022|2024|2027)\b/g); if (!ym || !/(me.?yor|kerak|sarf|qancha|norma|ehtiyot|farq)/.test(n)) return null;
            const qt = kbToks(n.replace(/\b(2022|2024|2027)\b|me.?yor\w*|kerak|sarf|qancha|norma|ehtiyot|qism\w*|farq\w*|yil\w*|va|bilan/g, ' ')); if (!qt.length) return null;
            const sets = [...new Set(ym)].map(y => 'y' + y).filter(k => SP_DATA[k]);
            const find = k => (SP_DATA[k] || []).filter(x => { const t = new Set(kbToks(x.n)); return qt.every(w => [...t].some(z => z.length >= 4 && w.length >= 4 && (z.startsWith(w.slice(0, 5)) || w.startsWith(z.slice(0, 5))))); });
            const lines = []; sets.forEach(k => { const f = find(k); const st = SP_SETS.find(s => s.id === k); lines.push('📅 ' + (st ? st.title : k) + ':' + (f.length ? '\n' + f.slice(0, 6).map(x => '• ' + x.n + ' — ' + x.q + ' ' + (x.u || '')).join('\n') : " mos pozitsiya topilmadi")); });
            return lines.length ? "🔩 2ВС-105 KR, 1 ta vagon uchun:\n" + lines.join('\n') + "\n📚 Manba: ehtiyot qismlar me'yorlari" : null;
        }
        // ---------- Javob zanjiriga ulash ----------
        (function () {
            aiStage('Oʻrgatilgan javoblar, hujjatlar bazasi, roʻyxat va tahlil', function (q, next) {
                try {
                    const t = kbTeachFind(q); if (t) return { t: t.a + "\n📚 Manba: o'rgatilgan javob (" + (t.by || 'admin') + ')', personal: false };
                    const sp = kbSp(q); if (sp) return { t: sp, personal: false };
                    // Yuklangan hujjatlarda aniq mos punkt bo'lsa — birinchi o'rinda
                    const top = kbSearch(q, 1)[0];
                    if (top && /^📚/.test(top.d.src) && top.cov >= 0.7 && top.s >= 3) return { t: kbSnippet(top.d.text, q, 420) + '\n📚 Manba: ' + top.d.src.replace(/^\S+\s/, ''), personal: false };
                    const l = kbList(q); if (l) return { t: l, personal: /Xodimlar/.test(l) };
                    const a = kbAnalytics(q); if (a) return { t: a, personal: false };
                    const u = kbUnitDetail(q); if (u) return { t: u, personal: false };
                } catch (e) { console.error(e); }
                const r = next(q);
                try {
                    if (r && (r.help || /^🤔|Quyidagilarni so.rashingiz mumkin|topilmadi/.test(r.t || ''))) { const k = kbAnswer(q); if (k) return { t: k, personal: false }; }
                    if (r && r.help) { r.t = AI_NOT_UNDERSTOOD; r.teach = true; }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        // Tushunmagan javob ostida "O'rgatish" tugmasi (admin)
        (function () {
            aicAdd = agmkExtend('aicAdd', '31-bosqich (4): AI bilim bazasi — indeks, hujjat yuklash, lugʼat, oʼrgatish, tahlil · Tushunmagan javob ostida "Oʼrgatish" tugmasi (admin)', aicAdd, o => function (cls, html) {
                const r = o.apply(this, arguments);
                try {
                    if (/bot/.test(cls) && String(html).indexOf(escapeHtml(AI_NOT_UNDERSTOOD)) === 0 && isAdmin()) {
                        const msgs = document.querySelectorAll('#aiMessages .ai-msg.user'), q = msgs.length ? msgs[msgs.length - 1].innerText : '';
                        const last = [...document.querySelectorAll('#aiMessages .ai-msg.bot')].pop();
                        if (last && q) { const b = document.createElement('button'); b.className = 'mini-btn kb-teach'; b.innerText = "📝 O'rgatish"; b.onclick = () => kbTeach(q); last.appendChild(b); }
                    }
                } catch (e) {}
                return r;
            });
        })();
        // Indeksni yangilash
        (function () { saveDB = agmkExtend('saveDB', '31-bosqich (4): AI bilim bazasi — indeks, hujjat yuklash, lugʼat, oʼrgatish, tahlil · Indeksni yangilash', saveDB, o => function () { KB.dirty = true; return o.apply(this, arguments); }); })();
        (function () { ndSet = agmkExtend('ndSet', '31-bosqich (4): AI bilim bazasi — indeks, hujjat yuklash, lugʼat, oʼrgatish, tahlil · Indeksni yangilash', ndSet, o => function () { KB.dirty = true; return o.apply(this, arguments); }); })();

        // ---------- Hujjat yuklash: Word, Excel, PDF, TXT ----------
        async function unzipEntries(buf) {
            const u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let eo = -1;
            for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
            if (eo < 0) throw new Error('ZIP emas');
            const cnt = dv.getUint16(eo + 10, true); let p = dv.getUint32(eo + 16, true); const out = {};
            for (let k = 0; k < cnt; k++) {
                const meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
                const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
                const lnl = dv.getUint16(lo + 26, true), lxl = dv.getUint16(lo + 28, true), ds = lo + 30 + lnl + lxl, data = u8.subarray(ds, ds + csz);
                out[name] = { meth: meth, data: data };
            }
            return {
                names: Object.keys(out),
                text: async n => { const e = out[n]; if (!e) return null; if (e.meth === 0) return new TextDecoder().decode(e.data); const s = new Blob([e.data]).stream().pipeThrough(new DecompressionStream('deflate-raw')); return await new Response(s).text(); }
            };
        }
        async function docToText(file) {
            const nm = file.name.toLowerCase(), buf = await file.arrayBuffer();
            if (/\.docx$/.test(nm)) {
                const z = await unzipEntries(buf), x = await z.text('word/document.xml'); if (!x) throw new Error("Word ichida matn topilmadi");
                return x.replace(/<w:tab\/>/g, '\t').replace(/<w:br\/>/g, '\n').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n');
            }
            if (/\.xlsx$/.test(nm)) {
                const z = await unzipEntries(buf), ss = await z.text('xl/sharedStrings.xml'), strs = [];
                if (ss) ss.replace(/<si>([\s\S]*?)<\/si>/g, (m, a) => { strs.push(a.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')); return m; });
                const sheets = z.names.filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)); let out = '';
                for (const s of sheets) { const x = await z.text(s); x.replace(/<row[^>]*>([\s\S]*?)<\/row>/g, (m, r) => { const cells = []; r.replace(/<c([^>]*)>([\s\S]*?)<\/c>/g, (mm, at, inner) => { const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1], is = (inner.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1]; cells.push(/t="s"/.test(at) ? strs[+v] || '' : is !== undefined ? is : v || ''); return mm; }); if (cells.some(c => String(c).trim())) out += cells.join('\t') + '\n'; return m; }); }
                return out;
            }
            if (/\.pdf$/.test(nm)) return await pdfToText(new Uint8Array(buf));
            return new TextDecoder('utf-8').decode(buf);
        }
        async function pdfToText(u8) {
            const bin = Array.from(u8, c => String.fromCharCode(c)).join(''); let out = '';
            const re = /stream\r?\n/g; let m;
            while ((m = re.exec(bin))) {
                const st = m.index + m[0].length, en = bin.indexOf('endstream', st); if (en < 0) break;
                const dict = bin.slice(Math.max(0, m.index - 400), m.index);
                let data = u8.subarray(st, en), txt = null;
                try { if (/FlateDecode/.test(dict.slice(dict.lastIndexOf('<<')))) { const s = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate')); const b = new Uint8Array(await new Response(s).arrayBuffer()); txt = Array.from(b, c => String.fromCharCode(c)).join(''); } else txt = Array.from(data, c => String.fromCharCode(c)).join(''); } catch (e) { txt = null; }
                if (!txt || !/T[jJ]/.test(txt)) continue;
                txt.replace(/\[(.*?)\]\s*TJ|\((.*?)(?<!\\)\)\s*Tj|(T\*|Td|TD|')/g, (mm, arr, one, br) => { if (br) { out += '\n'; return mm; } const src = arr !== undefined ? (arr.match(/\((?:\\.|[^\\)])*\)/g) || []).map(x => x.slice(1, -1)).join('') : one; out += src.replace(/\\([nrt()\\])/g, (a, c) => ({ n: '\n', r: '', t: '\t', '(': '(', ')': ')', '\\': '\\' })[c]).replace(/\\(\d{3})/g, (a, o) => String.fromCharCode(parseInt(o, 8))); return mm; });
                out += '\n';
            }
            const clean = out.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
            const letters = (clean.match(/[A-Za-zА-Яа-яЁё]/g) || []).length;
            if (letters < 40) throw new Error("Bu PDF'dan matn o'qib bo'lmadi (skaner qilingan yoki maxsus shrift). Matnli nusxasini (Word yoki TXT) yuklang.");
            return clean;
        }
        async function ndLoadTxt(inp) {
            const f = inp.files && inp.files[0]; if (!f) return; inp.value = '';
            showToast('⏳ ' + f.name + ' o\'qilmoqda...');
            try { const t = await docToText(f); $id('ndDText').value = t; if (!$id('ndDTitle').value) $id('ndDTitle').value = f.name.replace(/\.[^.]+$/, ''); showToast('✅ Matn olindi: ' + ndSplitPunkts(t).length + ' punkt'); }
            catch (e) { alert('⚠️ ' + agmkErrUz(e)); }
        };
        (function () {
            ndRenderDocs = agmkExtend('ndRenderDocs', '31-bosqich (4): AI bilim bazasi — indeks, hujjat yuklash, lugʼat, oʼrgatish, tahlil', ndRenderDocs, o => function () {
                const r = o.apply(this, arguments);
                try {
                    const i = $id('ndDFile'); if (i) i.setAttribute('accept', '.txt,.docx,.xlsx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    const lb = i && i.closest('.nd-f') && i.closest('.nd-f').querySelector('label'); if (lb) lb.textContent = "MATNI (nusxa ko'chirib qo'ying yoki Word / Excel / PDF / TXT fayl tanlang)";
                    const tip = document.querySelector('#ndBody .nd-form .nd-tip'); if (tip) tip.textContent = "Matn avtomatik punktlarga (1.1, 3.2.4, 7. ...) bo'linadi. AI savollarga javob berishda va akt tuzishda shu punktlardan foydalanadi, javobda manbani ko'rsatadi. Skaner qilingan PDF'dan matn olinmaydi.";
                    if (isAdmin()) { const l = kbTeachAll(); const box = document.createElement('div'); box.innerHTML = `<div class="inf-sec">📝 AI'ga o'rgatilgan javoblar (${l.length})</div>` + (l.map(x => `<div class="nd-doc"><b>${escapeHtml(x.q)}</b><button class="mini-btn" style="float:right" onclick="kbTeachDel('${x.id}')">🗑</button><div class="p">${escapeHtml(x.a)}</div><small style="color:#94a3b8">${escapeHtml(x.by || '')} · ${escapeHtml(fmtISO((x.at || '').slice(0, 10)))}</small></div>`).join('') || '<div class="nd-tip">Hali yo\'q. AI tushunmagan savol ostidagi «📝 O\'rgatish» tugmasi orqali qo\'shiladi.</div>'); $id('ndBody').appendChild(box); }
                } catch (e) { console.error(e); }
                return r;
            });
        })();
        async function kbTeachDel(id) { if (!await uiConfirm("O'rgatilgan javob o'chirilsinmi?")) return; kbTeachSave(kbTeachAll().filter(x => x.id !== id)); ndRender(); }

