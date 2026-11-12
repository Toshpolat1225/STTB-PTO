        // =====================================================================
        // YANGI (22-bosqich): NORMATIV-HUQUQIY HUJJATLAR va AI AKT (DALOLATNOMA) TUZISH.
        // Namuna: foydalanuvchi yuborgan 4 ta akt (27.08.2026, 02.09.2026, 03.09.2026, defekt akt №8121).
        // Punktlar o'ylab topilmaydi: faqat aktlaringizdagi havolalar va kiritilgan hujjatlar ishlatiladi.
        // =====================================================================
        const ND_DOCS_KEY = 'agmk_nd_docs', ND_SIGN_KEY = 'agmk_nd_signers', ND_AKT_KEY = 'agmk_nd_akts';
        // Aktlaringizdagi normativ havolalar (hujjat matni hali kiritilmagan — faqat havola)
        const ND_REFS = [
            { id: 'g33421', kw: ['kolod|колод', 'yori|sinq|sini|otkol|скол|трещ|раскол|emiril|chuqurlik|yaroqsiz|откол'], title: 'GOST 33421-2015 «Temir yo\'l harakatlanuvchi sostavlarining kompozit va keramik metalli kolodkalarining umumiy texnik talablari»',
              uz: "33421-2015-sonli «Temir yo'l harakatlanuvchi sostavlarining kompozit va keramik metalli kolodkalarining umumiy texnik talablari»ning 8-jadvaldagi 7-punktida ko'rsatilgan nosozliklar mavjud", ru: 'ГОСТ 33421-2015, табл. 8, п. 7', src: '02.09.2026 dalolatnoma' },
            { id: 'g33421g', kw: ['kolod|колод', 'geometr|o.lcham|размер'], title: 'GOST 33421-2015 (geometrik o\'lchamlar)', uz: "GOST 33421-2015 talablariga muvofiq", ru: 'ГОСТ 33421-2015', src: '27.08.2026 va 03.09.2026 dalolatnomalar' },
            { id: 'pte193', kw: ['nadressor|надрессор|bokovin|боковин'], title: 'ПТЭ, гл. 11, п. 193', uz: 'PTE 11-bob, 193-band', ru: 'ПТЭ гл. 11, п. 193', src: 'Defekt akt (vagon №8121)' },
            { id: 'p2731', kw: ['buks|букс'], title: 'Протокол заседания от 16-17 октября 2012 г., п. 27.3.1', uz: '16-17 oktyabr 2012-y. yig\'ilish bayonnomasi, 27.3.1-band', ru: 'протокол заседания от 16-17 октября 2012 г., п. 27.3.1', src: 'Defekt akt (vagon №8121)' },
            { id: 'p25132', kw: ['o.q|ось|оси', 'protert|протерт|yeyil'], title: 'Протокол заседания от 16-17 октября 2012 г., п. 25.1.3.2', uz: '16-17 oktyabr 2012-y. yig\'ilish bayonnomasi, 25.1.3.2-band', ru: 'протокол заседания от 16-17 октября 2012 г., п. 25.1.3.2', src: 'Defekt akt (vagon №8121)' },
            { id: 'p251216', kw: ['obod|обод|gardish'], title: 'Протокол заседания от 16-17 октября 2012 г., п. 25.1.2.16', uz: '16-17 oktyabr 2012-y. yig\'ilish bayonnomasi, 25.1.2.16-band', ru: 'протокол заседания от 16-17 октября 2012 г., п. 25.1.2.16', src: 'Defekt akt (vagon №8121)' },
            { id: 'dump75', kw: ['xrebtov|хребтов|upor|упор|shkvorn|шкворн'], title: '«Эксплуатация и ремонт думпкаров», п. 2, стр. 75', uz: '«Эксплуатация и ремонт думпкаров» qo\'llanmasi, 2-band, 75-bet', ru: '«Эксплуатация и ремонт думпкар» п. 2, стр. 75', src: 'Defekt akt (vagon №8121)' },
            { id: 'p2010', kw: ['avtos|автосцеп|scepk|сцепк|poglosh|поглощ|yutuvchi'], title: 'Протокол от 20-21 октября 2010 г., приложение №3', uz: '20-21 oktyabr 2010-y. bayonnomasi, 3-ilova', ru: 'протокол от 20-21 октября 2010 г., приложение №3', src: 'Defekt akt (vagon №8121)' },
            { id: 'p59', kw: ['telej|тележ|aravach', 'srok|срок|muddat'], title: 'Протокол № 59 от «20» ноября (yilini aniqlang)', uz: '«20» noyabrdagi 59-sonli bayonnoma (yilini aniqlang)', ru: 'протокол от «20» ноября (год уточнить) № 59', src: 'Defekt akt (vagon №8121)', check: true },
            { id: 'r310', kw: ['srok slujb|срок служб|xizmat muddati'], title: '№310 (hujjat nomini aniqlang)', uz: '№310 (hujjat nomini aniqlang)', ru: '№310 (уточнить наименование документа)', src: 'Defekt akt (vagon №8121) — rasmdagi yozuv to\'liq o\'qilmadi', check: true }
        ];
        const ND_SIGN_DEF = [
            { l: 'uz', r: 'STTB bosh muhandisi v.b.', n: '@@N:367@@', ap: true },
            { l: 'uz', r: "ICHTB boshlig'i", n: '@@N:342@@' }, { l: 'uz', r: "2-TYS boshlig'i", n: '@@N:375@@' },
            { l: 'uz', r: "ICHTB vagonlar bo'yicha muhandisi", n: '@@N:380@@' }, { l: 'uz', r: '2-TYS uchastka ustasi v.b.', n: '@@N:348@@' },
            { l: 'uz', r: '2-TYS uchastka ustasi', n: '@@N:381@@' }, { l: 'uz', r: "2-TYS vagonlarni ko'rikdan o'tkazuvchi chilangar", n: '@@N:384@@' },
            { l: 'ru', r: 'Начальник отдела железнодорожного транспорта и логистики АО "Алмалыкский ГМК"', n: '@@N:295@@', ap: true },
            { l: 'ru', r: 'Начальник УПЖТ', n: '@@N:319@@' }, { l: 'ru', r: 'Главный инженер УПЖТ', n: '@@N:297@@' },
            { l: 'ru', r: 'И.о. главного механика УПЖТ', n: '@@N:318@@' }, { l: 'ru', r: 'Главный энергетик УПЖТ', n: '@@N:366@@' },
            { l: 'ru', r: 'Начальник ПТО', n: '@@N:316@@' }, { l: 'ru', r: 'Инженер по вагонам ПТО', n: '@@N:354@@' }
        ];
        const ND_TYPES = {
            ornatish: { l: 'uz', t: "Sinovdan o'tkazish uchun o'rnatilganligi to'g'risida dalolatnoma", ex: "“EVRO PLAST TASHKENT” MCHJ firmasi M-659.000 tipidagi 32 dona kompozitli tormoz kolodkalari 00018479 va 00018499 vagonlarga o'rnatildi\nkolodkalar texnik ko'rikdan o'tkazildi, geometrik o'lchamlari GOST 33421-2015 ga mos\nkolodkalarning yon tomoni oq rangga bo'yaldi\no'rnatishda qiyinchilik bo'lmadi, klinlar oson o'rnashdi\ntormoz richag uzatmalari sozlandi, vagonlar 2-TYSga ekspluatatsiyaga chiqarildi" },
            holat: { l: 'uz', t: "Sinovdagi holati to'g'risida dalolatnoma", ex: "27-avgust kuni 00018479 va 00018499 vagonlarga 32 dona M659.000 kolodka o'rnatilgan\n29-avgust kuni 00018479 vagonda 1 dona kolodka 4-marta yuk tashishda yorildi, yon qismida 3 mm dan oshiq otkol\n30-avgust kuni 2 dona kolodka 5-marta yuk tashishda yorildi\n02-sentyabr kuni 3 dona kolodka 11-marta yuk tashishda sindi, ishchi qismi 40 mm dan oshiq emirilgan" },
            defekt: { l: 'ru', t: 'Дефектный акт', ex: "просрочен срок службы тележки более 30 лет\nсуммарная трещина надрессорной балки более 6 мм\nтрещина и отколы в корпусах букс колесных пар\nналичие трещины хребтовой балки длиной 480 мм\nтрещина в зоне изгиба хвостовика автосцепки" },
            umumiy: { l: 'uz', t: 'Dalolatnoma (umumiy)', ex: "tormoz kolodkasi 1000 km yurgandan so'ng yeyilmasdan yorildi va sindi\nkolodka ishchi qismida yoriqlar va siniqlar aniqlandi" },
            umumiy_ru: { l: 'ru', t: 'Акт (общий)', ex: 'после пробега 1000 км тормозная колодка без износа получила трещины и сколы' }
        };
        const OY_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
        const OY_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        const ND = { view: 'home', form: null, html: '', used: [], openAkt: null };
        function ndGet(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
        function ndSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert("⚠️ Xotira to'ldi — saqlanmadi."); return false; } }
        function ndSigners() { return ndGet(ND_SIGN_KEY, null) || ND_SIGN_DEF.slice(); }
        function ndDocs() { return ndGet(ND_DOCS_KEY, []); }
        function ndAkts() { return ndGet(ND_AKT_KEY, []); }
        function openND(view) { ND.view = view || 'home'; $id('ndSearch').value = ''; openScreen('screen-nd'); ndRender(); }
        function ndGoBack() { if (ND.view === 'home') openScreen('screen-main'); else if (ND.view === 'doc') { ND.view = 'docs'; ndRender(); } else { ND.view = 'home'; ndRender(); } }
        function ndQ() { return aiNorm(($id('ndSearch') || {}).value || '').trim(); }
        function ndRender() {
            const v = ND.view, b = $id('ndBody');
            $id('ndSearchWrap').style.display = (v === 'akt') ? 'none' : '';
            if (typeof ndAiPos === 'function') ndAiPos(v === 'akt');
            $id('ndTitle').innerText = { home: 'Normativ hujjatlar', akt: 'Akt tuzish (AI)', docs: 'Hujjatlar bazasi', doc: 'Hujjat', arch: 'Aktlar arxivi', sign: "Imzo chekuvchilar" }[v] || 'Normativ hujjatlar';
            if (v === 'home') {
                const q = ndQ();
                if (q) { b.innerHTML = ndSearchHtml(q); return; }
                const card = (ic, t, s, on) => `<div class="btn-card inf-card" onclick="${on}"><div class="btn-card-content"><span class="btn-icon">${ic}</span><span class="btn-text">${escapeHtml(t)}<small>${escapeHtml(s)}</small></span></div><span class="btn-arrow">›</span></div>`;
                b.innerHTML = `<div class="card-list">` +
                    card(AI_ICO, 'Akt / dalolatnoma tuzish (AI)', "Qisqa mazmun va imzo chekuvchilarni kiriting — AI rasmiy akt tayyorlaydi, PDF / chop etish", "if (typeof dbSetMode === 'function') dbSetMode('ai'); ndOpenAkt()") +
                    card('✍️', 'Akt — qoʻlda (tez)', "Matnni oʻzingiz yozasiz — AI kutilmaydi, hujjat bir zumda tayyor. Shoshilinch paytlar uchun", "if (typeof dbSetMode === 'function') dbSetMode('man'); ndOpenAkt()") +
                    card('📚', 'Normativ hujjatlar bazasi', (ndDocs().length + ND_REFS.length) + ' ta: aktlaringizdagi havolalar va kiritilgan hujjatlar', "ND.view='docs'; ndRender()") +
                    card('🗂', 'Aktlar arxivi', ndAkts().length + ' ta tuzilgan akt', "ND.view='arch'; ndRender()") +
                    card('👥', 'Imzo chekuvchilar', ndSigners().length + " ta lavozim va F.I.Sh. (tahrirlash mumkin)", "ND.view='sign'; ndRender()") + `</div>`;
                return;
            }
            if (v === 'akt') { ndRenderAkt(); return; }
            if (v === 'docs') { ndRenderDocs(); return; }
            if (v === 'doc') { ndRenderDoc(); return; }
            if (v === 'arch') { ndRenderArch(); return; }
            if (v === 'sign') { ndRenderSign(); return; }
        }
        // ---- Qidiruv: hujjat punktlari, havolalar, aktlar ----
        function ndStems(s) { return aiNorm(s).split(/[^a-zа-яё0-9'ʻ]+/i).filter(w => w.length >= 4).map(w => w.slice(0, 5)); }
        function ndPunktMatches(text, limit) {
            const st = new Set(ndStems(text)), out = [];
            if (!st.size) return out;
            ndDocs().forEach(d => (d.punkts || []).forEach(p => { const ps = ndStems(p.t); let sc = 0; ps.forEach(w => { if (st.has(w)) sc++; }); if (sc >= 2) out.push({ d: d, p: p, sc: sc }); }));
            return out.sort((a, b) => b.sc - a.sc).slice(0, limit || 5);
        }
        function ndRefFor(line) { const q = aiNorm(line); return ND_REFS.filter(r => r.kw.every(k => new RegExp(k, 'i').test(q))); }
        function ndSearchHtml(q) {
            const refs = ND_REFS.filter(r => aiNorm(r.title + ' ' + r.uz).includes(q) || r.kw.some(k => new RegExp(k, 'i').test(q)));
            const pm = ndPunktMatches(q, 20).concat([]);
            const docs = ndDocs().flatMap(d => (d.punkts || []).filter(p => aiNorm(p.t).includes(q)).map(p => ({ d: d, p: p }))).slice(0, 30);
            const ak = ndAkts().filter(a => aiNorm(a.title + ' ' + a.text).includes(q));
            let h = '';
            if (refs.length) h += `<div class="inf-sec">📌 Aktlaringizdagi havolalar</div>` + refs.map(r => `<div class="nd-doc"><b>${escapeHtml(r.title)}</b>${r.check ? '<span class="nd-badge ref">aniqlash kerak</span>' : ''}<div class="p">${escapeHtml(r.uz)}</div><small style="color:#94a3b8">Manba: ${escapeHtml(r.src)}</small></div>`).join('');
            const seen = new Set(), all = docs.concat(pm).filter(x => { const k = x.d.id + x.p.n; if (seen.has(k)) return false; seen.add(k); return true; });
            if (all.length) h += `<div class="inf-sec">📚 Hujjat punktlari</div>` + all.map(x => `<div class="nd-doc"><b>${escapeHtml(x.d.title)}</b> — ${escapeHtml(x.p.n)}<div class="p">${escapeHtml(x.p.t.slice(0, 400))}</div></div>`).join('');
            if (ak.length) h += `<div class="inf-sec">🗂 Aktlar</div>` + ak.map(a => `<div class="nd-doc" onclick="ndOpenArch('${a.id}')" style="cursor:pointer"><b>${escapeHtml(a.title)}</b><br><small style="color:#94a3b8">${escapeHtml(fmtDateTime(a.at))}</small></div>`).join('');
            return h || '<div class="xt-empty">Hech narsa topilmadi</div>';
        }
        // ---- Hujjatlar bazasi ----
        function ndRenderDocs() {
            const q = ndQ(), docs = ndDocs().filter(d => !q || aiNorm(d.title + ' ' + d.code).includes(q));
            let h = `<div class="nd-form"><h4>➕ Hujjat qo'shish</h4>
                <div class="nd-f"><label>NOMI</label><input id="ndDTitle" placeholder="masalan: GOST 33421-2015 Kolodkalar. Umumiy texnik talablar"></div>
                <div class="nd-f"><label>MATNI (nusxa ko'chirib qo'ying yoki .txt fayl tanlang)</label><textarea id="ndDText" placeholder="1.1 ...&#10;1.2 ...&#10;8-jadval ..."></textarea>
                <input type="file" id="ndDFile" accept=".txt,text/plain" style="margin-top:6px;" onchange="ndLoadTxt(this)"></div>
                <div class="nd-tip">Matn avtomatik punktlarga (1.1, 3.2.4, 7. ...) bo'linadi va AI akt tuzishda shu punktlardan foydalanadi. PDF/Word hujjatlarni menga yuborsangiz — o'zim punktlarga ajratib ilovaga joylayman.</div>
                <button class="action-btn" style="margin-top:8px;" onclick="ndAddDoc()">💾 Qo'shish</button></div>`;
            h += `<div class="inf-sec">📌 Aktlaringizdagi havolalar (${ND_REFS.length})</div>` + ND_REFS.filter(r => !q || aiNorm(r.title).includes(q)).map(r => `<div class="nd-doc"><b>${escapeHtml(r.title)}</b><span class="nd-badge ref">${r.check ? 'aniqlash kerak' : 'faqat havola'}</span><div class="p">${escapeHtml(r.uz)}</div><small style="color:#94a3b8">Manba: ${escapeHtml(r.src)} · to'liq matni hali kiritilmagan</small></div>`).join('');
            h += `<div class="inf-sec">📚 Kiritilgan hujjatlar (${docs.length})</div>` + (docs.map(d => `<div class="nd-doc" style="cursor:pointer" onclick="ND.doc='${d.id}'; ND.view='doc'; ndRender()"><b>${escapeHtml(d.title)}</b><span class="nd-badge ok">${(d.punkts || []).length} punkt</span><br><small style="color:#94a3b8">${escapeHtml(fmtDateTime(d.at))} · ${escapeHtml(d.by || '')}</small></div>`).join('') || '<div class="xt-empty">Hali hujjat kiritilmagan</div>');
            $id('ndBody').innerHTML = h;
        }
        function ndSplitPunkts(text) {
            const lines = String(text || '').replace(/\r/g, '').split('\n'), out = []; let cur = null;
            lines.forEach(l => { const s = l.trim(); if (!s) return;
                const m = s.match(/^((?:\d+\.)*\d+)[.)]?\s+(.+)$/) || s.match(/^((?:\d+-(?:jadval|bob|band|modda))|(?:Таблица|Глава|Статья|Раздел|jadval|bob)\s*\d+[.:]?)\s*(.*)$/i);
                if (m) { cur = { n: m[1], t: m[2] || '' }; out.push(cur); } else if (cur) cur.t += ' ' + s; else { cur = { n: '—', t: s }; out.push(cur); } });
            return out.filter(p => p.t.trim());
        }
        function ndAddDoc() {
            const t = $id('ndDTitle').value.trim(), tx = $id('ndDText').value.trim();
            if (!t || !tx) { alert('Hujjat nomi va matnini kiriting.'); return; }
            const d = ndDocs(); d.push({ id: 'd' + Date.now().toString(36), title: t, code: '', at: new Date().toISOString(), by: authorStr(), punkts: ndSplitPunkts(tx) });
            if (ndSet(ND_DOCS_KEY, d)) { showToast('📚 Hujjat qo\'shildi: ' + d[d.length - 1].punkts.length + ' punkt'); ndRender(); }
        }
        function ndRenderDoc() {
            const d = ndDocs().find(x => x.id === ND.doc); if (!d) { ND.view = 'docs'; ndRender(); return; }
            const q = ndQ();
            $id('ndBody').innerHTML = `<div class="nd-doc"><b>${escapeHtml(d.title)}</b><span class="nd-badge ok">${d.punkts.length} punkt</span>${isAdmin() ? ` <button class="mini-btn" style="float:right" onclick="ndDelDoc('${d.id}')">🗑</button>` : ''}</div>` +
                d.punkts.filter(p => !q || aiNorm(p.n + ' ' + p.t).includes(q)).map(p => `<div class="nd-doc"><b>${escapeHtml(p.n)}</b><div class="p">${escapeHtml(p.t)}</div></div>`).join('');
        }
        async function ndDelDoc(id) { if (!await uiConfirm("Hujjat o'chirilsinmi?")) return; ndSet(ND_DOCS_KEY, ndDocs().filter(x => x.id !== id)); ND.view = 'docs'; ndRender(); }
        // ---- Imzo chekuvchilar ----
        function ndRenderSign() {
            const s = ndSigners();
            $id('ndBody').innerHTML = `<div class="nd-form"><h4>➕ Qo'shish</h4><div class="nd-row"><div class="nd-f"><label>LAVOZIM</label><input id="ndSR" class="pk-tap" readonly onclick="ndSignPick()" placeholder="👤 Bosing"></div><div class="nd-f"><label>F.I.SH.</label><input id="ndSN" class="pk-tap" readonly onclick="ndSignPick()" placeholder="tabel, familiya yoki ism"></div></div>
                <div class="nd-row"><div class="nd-f"><label>TIL</label><select id="ndSL"><option value="uz">O'zbekcha</option><option value="ru">Ruscha</option></select></div><div class="nd-f"><label>&nbsp;</label><select id="ndSA"><option value="">Komissiya a'zosi</option><option value="1">Tasdiqlovchi</option></select></div></div>
                <button class="action-btn" onclick="ndAddSigner()">💾 Qo'shish</button></div>` +
                ['uz', 'ru'].map(l => `<div class="inf-sec">${l === 'uz' ? "🇺🇿 O'zbekcha aktlar uchun" : '🇷🇺 Для актов на русском'}</div><div class="nd-signers">` + s.map((x, i) => x.l !== l ? '' : `<div class="nd-signer"><span class="nd-ed" onclick="ndEditSigner(${i})">${x.ap ? '✍️ <i>Tasdiqlovchi</i> · ' : ''}${escapeHtml(x.r)} — <b>${escapeHtml(x.n)}</b></span><button onclick="ndEditSigner(${i})">✏️</button><button onclick="ndDelSigner(${i})">🗑</button></div>`).join('') + `</div>`).join('');
        }
        function ndAddSigner() { const r = $id('ndSR').value.trim(), n = $id('ndSN').value.trim(); if (!r || !n) { alert('Lavozim va F.I.Sh. kiriting.'); return; } const s = ndSigners(); s.push({ l: $id('ndSL').value, r: r, n: n, ap: !!$id('ndSA').value }); ndSet(ND_SIGN_KEY, s); ndRender(); }
        async function ndDelSigner(i) { if (!await uiConfirm("O'chirilsinmi?")) return; const s = ndSigners(); s.splice(i, 1); ndSet(ND_SIGN_KEY, s); ndRender(); }
        // ---- AKT TUZISH ----
        function ndOpenAkt(prefill) {
            const t = new Date();
            ND.form = ND.form || { tur: 'umumiy', sana: todayISO(), hs: '', hsSame: true, orn: '', joy: '', obj: '', vag: '', text: '', ap: -1, apObj: null, com: [] };
            if (prefill) { ND.form.text = prefill; ND.form.tur = ndGuessType(prefill); ND.form.com = []; ND.form._init = false; }
            if (!ND.form._init) { ND.form.apObj = ndDefApObj(); ND.form._init = true; }
            ND.html = ''; ND.view = 'akt'; if (!$id('screen-nd').classList.contains('active')) { $id('ndSearch').value = ''; openScreen('screen-nd'); } ndRender();
        }
        function ndGuessType(s) { const q = aiNorm(s); if (/sinov.*o.rnat|o.rnatil.*sinov/.test(q)) return 'ornatish'; if (/sinov|yaroqsiz holat|marta yuk/.test(q)) return 'holat'; if (/[а-яё]/.test(q) && /трещ|износ|срок|балк|букс/.test(q)) return 'defekt'; if (/[а-яё]{4}/.test(q)) return 'umumiy_ru'; return 'umumiy'; }
        function ndDefAp() { const l = ND_TYPES[ND.form.tur].l; return ndSigners().findIndex(x => x.l === l && x.ap); }
        function ndLang() { return ND_TYPES[ND.form.tur].l; }
        function ndFormSync() {
            const f = ND.form; if (!$id('ndTur')) return;
            f.tur = $id('ndTur').value; f.sana = $id('ndSana').value; f.joy = $id('ndJoy').value; f.obj = $id('ndObj').value; f.vag = $id('ndVag').value; f.text = $id('ndText').value;
            f.hsSame = !!($id('ndHsSame') && $id('ndHsSame').checked); f.hs = f.hsSame ? f.sana : (($id('ndHs') || {}).value || ''); if ($id('ndOrn')) f.orn = $id('ndOrn').value;
        }
        function ndRenderAkt() {
            const f = ND.form, l = ndLang(), S = ndSigners().map((x, i) => ({ x: x, i: i })).filter(o => o.x.l === l);
            const st = typeof INFRA_BY !== 'undefined' ? Object.values(INFRA_BY).filter(o => o.kind === 'st').map(o => infraShort(o)) : [];
            let h = `<div class="nd-form"><h4>${AI_ICO_S}Akt / dalolatnoma tuzish</h4>
                <div class="nd-f"><label>AKT TURI</label><select id="ndTur" onchange="ndFormSync(); ND.form.com=[]; ND.form.apObj=ndDefApObj(); ndRender()">${Object.keys(ND_TYPES).map(k => `<option value="${k}"${f.tur === k ? ' selected' : ''}>${ND_TYPES[k].l === 'ru' ? '🇷🇺' : '🇺🇿'} ${escapeHtml(ND_TYPES[k].t)}</option>`).join('')}</select></div>
                <div class="nd-f"><label>📄 DALOLATNOMA SANASI</label><input type="date" id="ndSana" value="${escapeHtml(f.sana)}" onchange="if ($id('ndHsSame') && $id('ndHsSame').checked) $id('ndHs').value = this.value"><div class="nd-tip">Akt tuzilib, imzolanadigan kun — hujjat boshida («Olmaliq sh. ${escapeHtml(fmtISO(f.sana) || '__.__.____')}-y.») chiqadi.</div></div>
                ${(() => { const D = { ornatish: ["🔧 O'RNATILGAN KUN", "Detal / mahsulot vagonga sinov uchun o'rnatilgan kun — matnda «… kuni … o'rnatildi» bo'lib chiqadi."], holat: ["🔍 TEKSHIRUV O'TKAZILGAN KUN", "Texnik holat tekshirilgan (ko'rik o'tkazilgan) kun — matnda «… kuni texnik holati tekshirilganda» bo'lib chiqadi."], defekt: ["🔍 KO'RIK O'TKAZILGAN KUN", "Vagon ko'rikdan o'tkazilgan kun. Dalolatnoma kunidan farq qilsa, matnda «проведённого …» deb ko'rsatiladi."] }[f.tur] || ["⚠️ HODISA SODIR BO'LGAN (ANIQLANGAN) KUN", "Aktda qayd etilayotgan holat sodir bo'lgan yoki aniqlangan kun. Dalolatnoma kunidan farq qilsa, matnda alohida ko'rsatiladi."]; const same = f.hsSame !== false; return `<div class="nd-f"><label>${D[0]}</label><input type="date" id="ndHs" value="${escapeHtml(same ? f.sana : (f.hs || f.sana))}"${same ? ' disabled' : ''}><label class="nd-chk"><input type="checkbox" id="ndHsSame"${same ? ' checked' : ''} onchange="ndFormSync(); ndRender()"> Dalolatnoma sanasi bilan bir xil</label><div class="nd-tip">${D[1]}</div></div>`; })()}
                ${f.tur === 'holat' ? `<div class="nd-f"><label>🔧 O'RNATILGAN KUN (sinov boshlangan)</label><input type="date" id="ndOrn" value="${escapeHtml(f.orn || '')}"><div class="nd-tip">Ixtiyoriy: detal qachon o'rnatilgan edi — matnda «… kuni sinov uchun o'rnatilgan» deb ko'rsatiladi.</div></div>` : ''}
                <div class="nd-tip" style="margin:-4px 0 10px">ℹ️ Aktni kim va qachon ilovaga kiritgani avtomatik saqlanadi — arxivda «Kiritdi» deb ko'rinadi.</div>
                <div class="nd-f"><label>JOY (stansiya)</label><input id="ndJoy" value="${escapeHtml(f.joy)}" placeholder="Olmaliq"></div>
                <div class="nd-f"><label>${f.tur === 'defekt' ? 'VAGON RAQAMI (bazadan avtomatik to\'ldiriladi)' : 'VAGON(LAR) RAQAMLARI (ixtiyoriy)'}</label><input id="ndVag" value="${escapeHtml(f.vag)}" placeholder="${f.tur === 'defekt' ? '8121' : '00018479, 00018499'}"></div>
                <div class="nd-f"><label>${f.tur === 'defekt' ? 'OBYEKT (bo\'sh qolsa vagon ma\'lumotidan olinadi)' : 'MAVZU / FIRMA VA MAHSULOT'}</label><input id="ndObj" value="${escapeHtml(f.obj)}" placeholder="${f.tur === 'defekt' ? 'Вагон-самосвал 2ВС-105' : '“EVRO PLAST TASHKENT” MCHJ firmasi kompozitsion tormoz kolodkalari'}"></div>
                <div class="nd-f"><label>QISQA MAZMUN — har bir qatorda bitta holat / fakt</label><textarea id="ndText" placeholder="${escapeHtml(ND_TYPES[f.tur].ex)}">${escapeHtml(f.text)}</textarea>
                <div class="nd-tip">💡 Qisqa yozing — AI rasmiy uslubga keltiradi va mos normativ punktlarni qo'shadi. <a style="color:#7dd3fc; cursor:pointer" onclick="$id('ndText').value=ND_TYPES[$id('ndTur').value].ex">Namunani qo'yish</a></div></div>
                <div class="nd-f"><label>TASDIQLOVCHI («Tasdiqlayman» qismi)</label><div class="nd-signers">${f.apObj ? `<div class="nd-signer"><span class="nd-ed" onclick="ndPickAp()">✍️ ${escapeHtml(f.apObj.r)} — <b>${escapeHtml(f.apObj.n)}</b></span><button onclick="ndPickAp()">✏️</button><button onclick="ndFormSync(); ND.form.apObj=null; ndRender()">✕</button></div>` : '<div class="nd-tip">— tasdiqlash qismisiz —</div>'}</div>
                <div class="nd-chips">${S.filter(o => o.x.ap && !(f.apObj && f.apObj.r === o.x.r && f.apObj.n === o.x.n)).map(o => `<i onclick="ndApSet(${o.i})">＋ ${escapeHtml(o.x.r)} — ${escapeHtml(o.x.n)}</i>`).join('')}<i onclick="ndPickAp()">＋ ${f.apObj ? 'Boshqa xodimni tanlash' : 'Tasdiqlovchini tanlash'} (tabel, ism yoki lavozim)</i></div></div>
                <div class="nd-f"><label>KOMISSIYA A'ZOLARI (imzo chekuvchilar)</label><div class="nd-signers">${f.com.map((c, k) => `<div class="nd-signer"><span class="nd-ed" onclick="ndComEdit(${k})">${escapeHtml(c.r)} — <b>${escapeHtml(c.n)}</b></span><button onclick="ndComEdit(${k})">✏️</button><button onclick="ndComMove(${k},-1)">▲</button><button onclick="ndComDel(${k})">✕</button></div>`).join('') || '<div class="nd-tip">Quyidan tanlang yoki o\'zingiz qo\'shing</div>'}</div>
                <div class="nd-chips">${S.filter(o => !o.x.ap && !f.com.some(c => c.r === o.x.r && c.n === o.x.n)).map(o => `<i onclick="ndComAdd(${o.i})">＋ ${escapeHtml(o.x.r)} — ${escapeHtml(o.x.n)}</i>`).join('')}<i onclick="ndComCustom()">＋ Xodim qo'shish (tabel, ism yoki lavozim)</i></div></div>
                <button class="action-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7); margin-top:6px;" onclick="ndGenerate()">${AI_ICO_S}AI bilan akt tuzish</button></div>`;
            if (ND.html) {
                h += `<div class="nd-form"><h4>📌 Qo'llanilgan normativ asoslar</h4><div class="nd-refs">${ND.used.map(u => `<div><span>✅</span><span>${escapeHtml(u.title)}${u.check ? ' <span class="nd-badge ref">aniqlash kerak</span>' : ''}<small>Manba: ${escapeHtml(u.src || '')}</small></span></div>`).join('') || '<div class="nd-tip">Mos havola topilmadi — kerak bo\'lsa matnga o\'zingiz qo\'shing.</div>'}</div>
                    ${ND.sugg && ND.sugg.length ? `<div class="nd-tip" style="margin-top:8px">📚 Kiritilgan hujjatlardan tavsiya:</div><div class="nd-refs">${ND.sugg.map((s, k) => `<div><input type="checkbox" id="ndSg${k}" ${s.on ? 'checked' : ''} onchange="ND.sugg[${k}].on=this.checked; ndGenerate(true)"><span>${escapeHtml(s.d.title)}, ${escapeHtml(s.p.n)}<small>${escapeHtml(s.p.t.slice(0, 160))}</small></span></div>`).join('')}</div>` : ''}</div>
                    <div class="nd-tip" style="margin-bottom:6px;">✏️ Hujjatni bevosita shu yerda tahrirlashingiz mumkin (matn ustiga bosing).</div>
                    <div class="nd-page" id="ndPage" contenteditable="true">${ND.html}</div>
                    ${typeof aiPolishBtn === 'function' ? aiPolishBtn() : ''}<div class="nd-acts"><button class="action-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="aktPdf()">📄 PDF yuklab olish</button><button class="action-btn" onclick="ndPrint()">🖨 Chop etish</button><button class="action-btn" style="background:#0f766e" onclick="ndSaveAkt()">💾 Arxivga saqlash</button></div>`;
            }
            $id('ndBody').innerHTML = h;
            if (typeof sugAttach === 'function') sugAttach($id('ndJoy'), () => st);
        }
        function ndComAdd(i) { ndFormSync(); const s = ndSigners()[i]; if (s) ND.form.com.push({ r: s.r, n: s.n }); ndRender(); }
        function ndComDel(k) { ndFormSync(); ND.form.com.splice(k, 1); ndRender(); }
        function ndComMove(k, d) { ndFormSync(); const c = ND.form.com; if (k + d < 0) return; [c[k], c[k + d]] = [c[k + d], c[k]]; ndRender(); }
        async function ndComCustom() { ndFormSync(); const p = await ndPickSigner(null); if (!p) return; ND.form.com.push(p); ndRender(); }
        function ndDateWords(iso, l) { const d = new Date((iso || todayISO()) + 'T00:00:00'); return l === 'ru' ? '«' + String(d.getDate()).padStart(2, '0') + '» ' + OY_RU[d.getMonth()] + ' ' + d.getFullYear() + ' г.' : d.getFullYear() + '-yilning ' + String(d.getDate()).padStart(2, '0') + ' ' + OY_UZ[d.getMonth()]; }
        function ndFmtLine(s, l) { s = s.trim().replace(/\s+/g, ' ').replace(/[;.,]+$/, ''); if (!s) return ''; return s.charAt(0).toLocaleUpperCase(l === 'ru' ? 'ru' : 'uz') + s.slice(1); }
        function ndGenerate(keepSugg) {
            ndFormSync(); const f = ND.form, l = ndLang(), E = escapeHtml;
            const lines = f.text.split('\n').map(x => x.trim()).filter(Boolean);
            if (!lines.length) { alert('Qisqa mazmunni kiriting (har bir qatorda bitta holat).'); return; }
            if (!f.com.length) { alert("Kamida bitta komissiya a'zosini (imzo chekuvchini) tanlang."); return; }
            const used = [], useRef = r => { if (!used.includes(r)) used.push(r); return r; };
            const refTxt = (line, style) => { const rs = ndRefFor(line); if (!rs.length) return ''; rs.forEach(useRef); return style === 'ru' ? ' [' + rs.map(r => r.ru).join('; ') + ']' : ' (' + rs.map(r => r.uz).join('; ') + ')'; };
            if (!keepSugg) ND.sugg = ndPunktMatches(f.text, 4).map(x => Object.assign(x, { on: false }));
            const extra = (ND.sugg || []).filter(s => s.on);
            const ap = f.apObj && f.apObj.n ? f.apObj : null;
            const d = new Date((f.sana || todayISO()) + 'T00:00:00'), dnum = String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
            const joy = f.joy.trim(), hs = (f.hsSame !== false || !f.hs) ? f.sana : f.hs, hsDiff = hs !== f.sana;
            let h = '';
            if (ap) h += l === 'ru' ? `<div class="a-approve">«Утверждаю»<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()} г.</div>`
                : `<div class="a-approve">“TASDIQLAYMAN”<br>${E(ap.r)}<br>______________ ${E(ap.n)}<br>«____» ______________ ${d.getFullYear()}-y.</div>`;
            h += l === 'ru' ? `<div class="a-head"><span>г. Алмалык</span><span>от ${ndDateWords(f.sana, 'ru')}</span></div>` : `<div class="a-head"><span>Olmaliq sh.</span><span>${dnum}-y.</span></div>`;
            const com = f.com, comTxt = com.map(c => c.r + ' ' + c.n).join(', ');
            const tail = f.vag.trim() ? f.vag.trim() : '';
            if (f.tur === 'ornatish' || f.tur === 'holat') {
                const obj = f.obj.trim();
                h += `<div class="a-title">${E(obj ? obj + (f.tur === 'ornatish' ? "ni sinovdan o'tkazish uchun o'rnatilganligi to'g'risida" : 'ning sinovdagi holati to\'g\'risida') : (f.tur === 'ornatish' ? "Sinovdan o'tkazish uchun o'rnatilganligi to'g'risida" : "Sinovdagi holati to'g'risida"))}<br>DALOLATNOMA</div>`;
                if (f.tur === 'ornatish') {
                    h += `<p>Biz quyida imzo chekuvchilar, ${ndDateWords(hs, 'uz')} kuni${joy ? ' “' + E(joy) + '” stansiyasida' : ''} ${E(lines[0].replace(/[.;]+$/, ''))}${tail && !lines[0].includes(tail.split(/[, ]+/)[0]) ? ' (vagonlar: ' + E(tail) + ')' : ''} haqida ushbu dalolatnomani tuzdik.</p>`;
                    if (lines.length > 1) { h += `<p>O'rnatish vaqtida quyidagilarga ahamiyat berildi:</p>`; lines.slice(1).forEach((x, i) => { h += `<p>${i + 1}. ${E(ndFmtLine(x, 'uz'))}${E(refTxt(x, 'uz'))}.</p>`; }); }
                } else {
                    h += `<p>Biz quyidagi imzo chekuvchilar: ${E(comTxt)} tuzilayotgan dalolatnoma shu haqidaki, ${E(lines[0].replace(/[.;]+$/, ''))}${tail && !lines[0].includes(tail.split(/[, ]+/)[0]) ? ' (vagonlar: ' + E(tail) + ')' : ''}.</p>`;
                    if (f.orn) h += `<p>${obj ? E(obj) + ' ' : ''}${ndDateWords(f.orn, 'uz')} kuni sinov uchun o'rnatilgan.</p>`;
                    h += `<p>${ndDateWords(hs, 'uz')} kuni ${obj ? E(obj.charAt(0).toLowerCase() + obj.slice(1)) + 'ning' : ''} texnik holati tekshirilganda, quyidagilar aniqlandi:</p>`;
                    let tot = 0;
                    lines.slice(1).forEach(x => { const m = x.match(/(\d+)\s*dona/); if (m) tot += +m[1]; h += `<p>- ${E(ndFmtLine(x, 'uz'))}${E(refTxt(x, 'uz'))}.</p>`; });
                    if (tot) h += `<p>Hozirgi kungacha jami <b>${tot} dona</b> ${/kolod/i.test(f.text) ? 'kolodka' : 'detal'} nosoz holatga kelganligi sababli, vagonlardan yechilgan.</p>`;
                }
            } else if (f.tur === 'defekt') {
                const v = onlyVagons().find(x => vagonNo(x) === f.vag.trim() || String(x.inv) === f.vag.trim());
                const name = f.obj.trim() || (v ? (v.naim || 'Вагон') : 'Вагон');
                const age = v ? unitAge(v) : null;
                h += `<div class="a-title">Дефектный акт<br>${E(name)} №${E(v ? vagonNo(v) : f.vag.trim())}</div>`;
                h += `<p>Мы, нижеподписавшиеся, комиссия в составе: ${E(comTxt)} составили настоящий акт о том, что в результате осмотра ${E(name.charAt(0).toLowerCase() + name.slice(1))} зав. № ${E(v ? vagonNo(v) : f.vag.trim())}${v && v.inv ? ' инв. № ' + E(v.inv) : ''}${v && v.yil ? ' постройки ' + E(v.yil) + ' г.' : ''}${joy ? ' на ст. ' + E(joy) : ''}${hsDiff ? ', проведённого ' + ndDateWords(hs, 'ru') + ',' : ''} было выявлено следующее:</p>`;
                if (age !== null && age >= 30 && !lines.some(x => /срок служб/i.test(x) && !/тележ/i.test(x))) { const r = ND_REFS.find(x => x.id === 'r310'); useRef(r); h += `<p class="ni"><b>просрочен срок службы</b> ${E(name.charAt(0).toLowerCase() + name.slice(1))} — <b>более ${age} лет</b> [${E(r.ru)}];</p>`; }
                const G = [['Ходовая часть:', /тележ|букс|ось|оси|колес|обод|надрессор|боковин|пружин|рессор/i], ['Нижняя рама и кузов:', /рам|кузов|хребтов|шкворн|пятник|заклеп|балк|стенк/i], ['Тормозное, пневматическое оборудование и ударно-тяговые устройства:', /тормоз|автосцеп|упор|поглощ|пневм|колод|сцеп/i]];
                const done = new Set();
                G.forEach(([t, re]) => { const ls = lines.filter(x => !done.has(x) && re.test(x)); if (!ls.length) return; h += `<p class="a-sec">${t}</p>`; ls.forEach(x => { done.add(x); h += `<p class="ni">- ${E(x.replace(/[;.]+$/, ''))}${E(refTxt(x, 'ru'))};</p>`; }); });
                const rest = lines.filter(x => !done.has(x)); if (rest.length) { h += `<p class="a-sec">Прочее:</p>`; rest.forEach(x => { h += `<p class="ni">- ${E(x.replace(/[;.]+$/, ''))}${E(refTxt(x, 'ru'))};</p>`; }); }
            } else {
                const ru = l === 'ru', obj = f.obj.trim();
                h += `<div class="a-title">${E(obj ? obj + (ru ? '' : " to'g'risida") : '')}${obj ? '<br>' : ''}${ru ? 'АКТ' : 'DALOLATNOMA'}</div>`;
                h += ru ? `<p>Мы, нижеподписавшиеся: ${E(comTxt)}, составили настоящий акт ${ndDateWords(f.sana, 'ru')}${joy ? ' на ст. ' + E(joy) : ''} о нижеследующем${hsDiff ? ' (имевшем место ' + ndDateWords(hs, 'ru') + ')' : ''}${tail ? ' (вагоны: ' + E(tail) + ')' : ''}:</p>`
                    : `<p>Biz quyida imzo chekuvchilar: ${E(comTxt)}, ${ndDateWords(f.sana, 'uz')} kuni${joy ? ' “' + E(joy) + '” stansiyasida' : ''} quyidagilar${tail ? ' (vagonlar: ' + E(tail) + ')' : ''}${hsDiff ? ' (' + ndDateWords(hs, 'uz') + ' kuni sodir bo\'lgan / aniqlangan)' : ''} haqida ushbu dalolatnomani tuzdik:</p>`;
                lines.forEach((x, i) => { h += `<p>${i + 1}. ${E(ndFmtLine(x, l))}${E(refTxt(x, ru ? 'ru' : 'uz'))}.</p>`; });
                const bad = /yori|sinq|sini|otkol|трещ|скол|излом|nosoz|yaroqsiz|брак/i.test(f.text);
                if (bad) h += ru ? `<p>Выявленные дефекты не соответствуют требованиям нормативно-технической документации. Комиссия считает необходимым предъявить претензию (рекламацию) поставщику/изготовителю в установленном порядке.</p>`
                    : `<p>Aniqlangan nuqsonlar normativ-texnik hujjatlar talablariga mos kelmaydi. Komissiya belgilangan tartibda yetkazib beruvchi (ishlab chiqaruvchi)ga da'vo (reklamatsiya) bildirishni lozim deb topdi.</p>`;
            }
            if (extra.length) h += `<p class="a-sec">${l === 'ru' ? 'Нормативное основание:' : 'Normativ asos:'}</p>` + extra.map(s => `<p class="ni">- ${E(s.d.title)}, ${E(s.p.n)}: ${E(s.p.t.slice(0, 300))}</p>`).join('');
            h += `<table class="a-sign">${com.map(c => `<tr><td class="l">${E(c.r)}</td><td class="m"></td><td class="r">${E(c.n)}</td></tr>`).join('')}</table>`;
            ND.html = h; ND.used = used.concat(extra.map(s => ({ title: s.d.title + ', ' + s.p.n, src: "Kiritilgan hujjat" })));
            ndRender();
            setTimeout(() => { const p = $id('ndPage'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
        }
        function ndPrint() {
            const p = $id('ndPage'); if (!p) return;
            const pr = $id('ndPrint'); pr.innerHTML = `<div class="nd-page">${p.innerHTML}</div>`;
            document.body.classList.add('nd-printing');
            const done = () => { document.body.classList.remove('nd-printing'); window.removeEventListener('afterprint', done); };
            window.addEventListener('afterprint', done);
            setTimeout(() => { try { window.print(); } catch (e) { alert("Chop etish oynasini ochib bo'lmadi."); } setTimeout(done, 1500); }, 60);
        }
        function ndSaveAkt() {
            const p = $id('ndPage'); if (!p) return;
            const t = (p.querySelector('.a-title') || {}).innerText || ND_TYPES[ND.form.tur].t;
            const a = ndAkts(); a.unshift({ id: 'a' + Date.now().toString(36), at: new Date().toISOString(), by: authorStr(), tur: ND.form.tur, sana: ND.form.sana, hs: ND.form.hsSame !== false ? ND.form.sana : (ND.form.hs || ND.form.sana), title: t.replace(/\s+/g, ' ').trim(), html: p.innerHTML, text: p.innerText.slice(0, 2000) });
            if (ndSet(ND_AKT_KEY, a.slice(0, 200))) showToast('💾 Akt arxivga saqlandi');
        }
        function ndRenderArch() {
            const q = ndQ(), a = ndAkts().filter(x => !q || aiNorm(x.title + ' ' + x.text).includes(q));
            $id('ndBody').innerHTML = a.map(x => `<div class="nd-doc" style="cursor:pointer" onclick="ndOpenArch('${x.id}')"><b>${escapeHtml(x.title)}</b><br><small style="color:#94a3b8">${x.sana ? '📄 Akt sanasi: ' + escapeHtml(fmtISO(x.sana)) + '<br>' : ''}✍️ Kiritdi: ${escapeHtml(x.by || '—')} — ${escapeHtml(fmtDateTime(x.at))}</small></div>`).join('') || '<div class="xt-empty">Arxiv bo\'sh</div>';
        }
        function ndOpenArch(id) {
            const x = ndAkts().find(a => a.id === id); if (!x) return;
            ND.view = 'arch1'; $id('ndTitle').innerText = 'Akt'; $id('ndSearchWrap').style.display = 'none'; if (typeof ndAiPos === 'function') ndAiPos(true);
            $id('ndBody').innerHTML = `<div class="nd-tip" style="margin-bottom:8px">${x.sana ? '📄 Akt sanasi: ' + escapeHtml(fmtISO(x.sana)) + (x.hs && x.hs !== x.sana ? ' · 📅 Voqea kuni: ' + escapeHtml(fmtISO(x.hs)) : '') + '<br>' : ''}✍️ Kiritdi: ${escapeHtml(x.by || '—')} — ${escapeHtml(fmtDateTime(x.at))}</div><div class="nd-page" id="ndPage" contenteditable="true">${x.html}</div><div class="nd-acts"><button class="action-btn" style="background:linear-gradient(135deg,#7c3aed,#a855f7)" onclick="aktPdf()">📄 PDF yuklab olish</button><button class="action-btn" onclick="ndPrint()">🖨 Chop etish</button><button class="action-btn" style="background:#b91c1c" onclick="ndDelAkt('${id}')">🗑 O'chirish</button></div>`;
        }
        async function ndDelAkt(id) { if (!await uiConfirm("Akt arxivdan o'chirilsinmi?")) return; ndSet(ND_AKT_KEY, ndAkts().filter(a => a.id !== id)); ND.view = 'arch'; ndRender(); }
        // AI chat: "akt tuz: ..." / "dalolatnoma ..."
        function ndAiReply(q, raw) {
            if (!/\bakt\b|dalolatnoma|акт\b|reklamats|рекламац/.test(q)) return null;
            if (/normativ|punkt|qaysi band|qaysi punkt/.test(q) && !/tuz|yoz|tayyorla/.test(q)) {
                const rs = ndRefFor(q), pm = ndPunktMatches(q, 3);
                return rs.length || pm.length ? '📌 Mos normativ asoslar:\n' + rs.map(r => '• ' + r.title + (r.check ? ' (aniqlash kerak)' : '')).concat(pm.map(x => '• ' + x.d.title + ', ' + x.p.n)).join('\n') : "Mos punkt topilmadi. Hujjatlarni «Normativ hujjatlar» bo'limiga kiriting.";
            }
            const body = String(raw || '').replace(/^.*?(akt|dalolatnoma|акт)[^:]*:\s*/i, '').trim();
            setTimeout(() => { $id('aiChatModal').classList.add('hidden'); ndOpenAkt(body && body !== raw ? body.replace(/\.\s+/g, '.\n') : ''); }, 700);
            return "📝 Akt tuzish oynasi ochilmoqda" + (body && body !== raw ? " — mazmun qo'yildi. Imzo chekuvchilarni tanlab «AI bilan akt tuzish»ni bosing." : ". Qisqa mazmunni yozing, imzo chekuvchilarni tanlang.");
        }


