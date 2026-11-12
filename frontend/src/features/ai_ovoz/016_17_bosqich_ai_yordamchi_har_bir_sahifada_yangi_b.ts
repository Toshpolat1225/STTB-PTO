        // =====================================================================
        // YANGI (17-bosqich): 🫧 AI yordamchi har bir sahifada, yangi bo'limlarni tushunadi;
        // texnika yoshi; qidiruv mikrofoni zaxira yo'li.
        // =====================================================================
        const AI_SEC_NAME = { 'screen-lok': 'Lokomotivlar', 'screen-avto': 'Avtotraktor parki', 'screen-yol': "Yo'l texnikalari", 'screen-xt': 'Ishchi xodimlar',
            'screen-shtat': 'Shtatlar', 'screen-nd': 'Normativ hujjatlar', 'screen-sp': 'Ehtiyot qismlar', 'screen-profile': 'Profil', 'screen-hr': 'Harakat tarkibi', 'screen-hr-list': 'Harakat tarkibi', 'screen-map': "Temir yo'l xaritasi", 'screen-infra-list': "Temir yo'l xaritasi", 'screen-infra-obj': "Temir yo'l xaritasi", 'screen-infra-topic': "Temir yo'l xaritasi", 'screen-rn': 'Rahbariyat nazorati', 'screen-settings': 'Parametrlar', 'screen-item-pasport': 'Pasport' };
        function aiKindOf(v) { return !v ? 'vag' : v.kind === 'infra' ? 'all' : v.kind === 'lok' ? 'lok' : v.kind === 'avto' ? 'avto' : v.kind === 'yol' ? 'yol' : 'vag'; }
        const AI_KIND_NAME = { vag: 'Vagonlar parki', lok: 'Lokomotivlar', avto: 'Avtotraktor parki', yol: "Yo'l texnikalari" };
        function aiSecFor(el) {
            if (el.id === 'screen-vagon-pasport') {
                const v = vagonlarData.find(x => x.id === activeVagonId);
                return v ? (v.kind === 'infra' ? "Temir yo'l xaritasi" : AI_KIND_NAME[aiKindOf(v)]) + ' · ' + unitLabel(v) : 'Pasport';
            }
            if ((el.id === 'screen-infra-obj' || el.id === 'screen-infra-topic') && typeof INFNAV !== 'undefined' && INFNAV.obj && INFRA_BY[INFNAV.obj]) return "Temir yo'l xaritasi · " + INFRA_BY[INFNAV.obj].uz;
            const h = el.querySelector('h2');
            return AI_SEC_NAME[el.id] || (h && h.innerText.trim()) || 'Ilova';
        }
        function ensureAiBtn(el) {
            if (!el || el.id === 'screen-main' || el.id === 'screen-vagonlar') return; // bu ikkisida tugma avvaldan bor
            if (el.querySelector('.ai-auto')) return;
            const b = document.createElement('button');
            b.className = 'ai-fab-btn ai-auto'; b.textContent = '🫧'; b.title = 'AI Yordamchi';
            b.onclick = () => { openAiChat(aiSecFor(el)); aiHint(); };
            const sw = el.querySelector('.search-wrap');
            if (sw && sw.parentElement && !sw.closest('.hidden')) {
                const row = document.createElement('div'); row.className = 'ai-row';
                sw.parentElement.insertBefore(row, sw); row.appendChild(sw); row.appendChild(b);
            } else { b.classList.add('ai-float'); el.appendChild(b); }
        }
        let aiLastHint = '';
        function aiHint() {
            const sid = ((document.querySelector('.screen.active') || {}).id) || '';
            const k = aiScreenKind(sid);
            if (aiLastHint === aiContext) return;
            aiLastHint = aiContext;
            const ex = { lok: "«ta'mir talab lokomotivlar», «ТЭМ2 nechta», «6463»", avto: "«yaqin texnikalar», «traktorlar», «10-935ЕА»", yol: "«hozir ta'mirdagi drezinalar», «УК-25 keyingi ta'miri», «3918»",
                vag: "«nechta vagon», «ta'mir talab», «8113»", all: "«statistika», «bugungi hisobot», «Qalmoqqirdan Svinsovayagacha», «xavfli joylar», «Kolsevayani ko'rsat», «zamechaniyasi bor joylar xaritada»" }[k];
            const m = $id('aiMessages');
            m.innerHTML += `<div class="ai-msg bot">📍 Bo'lim: ${escapeHtml(aiContext)}. Masalan so'rang: ${escapeHtml(ex)}.</div>`;
            m.scrollTop = m.scrollHeight;
        }
        function aiScreenKind(sid) {
            if (sid === 'screen-vagon-pasport') return aiKindOf(vagonlarData.find(x => x.id === activeVagonId));
            return { 'screen-lok': 'lok', 'screen-avto': 'avto', 'screen-yol': 'yol', 'screen-vagonlar': 'vag' }[sid] || 'all';
        }
        function aiNorm(s) { return String(s || '').toLowerCase().replace(/[ʻʼ'`’‘]/g, ''); }
        function aiUnitLine(v) {
            const age = unitAge(v), nx = v.ppr ? pprNext(v) : null;
            const kun = v.kun !== null && v.kun !== undefined ? (v.kun < 0 ? ", " + Math.abs(v.kun) + " kun o'tdi" : ", " + v.kun + " kun qoldi") : '';
            const open = (v.zams || []).filter(z => z.status !== 'yopildi').length;
            return unitLabel(v) + " — " + v.type + (age !== null ? ", " + age + " yosh" : "") + ". Holat: " + v.status + kun +
                ". Keyingi: " + ((nx && nx.label) || v.nextLabel || fmtISO(v.keyingi) || (v.kind === 'yol' ? 'reja 30.09.2026 gacha kiritilgan' : '—')) + "." + (open ? " Ochiq zamechaniya: " + open + " ta." : "");
        }
        function aiListTxt(l, fn) { const s = l.slice(0, 25).map(fn).join(", "); return s + (l.length > 25 ? " ... va yana " + (l.length - 25) + " ta" : ""); }
        function aiReplyX(qRaw) {
            const q = aiNorm(qRaw);
            if (/^\s*(salom|assalom|rahmat)/.test(q)) return null;
            const sid = ((document.querySelector('.screen.active') || {}).id) || '';
            if (typeof aiSmartReply === 'function') { const sr = aiSmartReply(q, sid); if (sr) return sr; }
            if (typeof aiMapReply === 'function') { const mr = aiMapReply(q, sid); if (mr) return mr; }
            let kind = null;
            const KW = [['yol', /drezin|motovoz|avtomotris|yotqizuvchi|platforma|yol texnika|shpal|прм|впр|мшсу|ук-25|дгку|дмм|арв|адм|мпт/],
                        ['lok', /lokomotiv|teplovoz|elektrovoz|тэм|тэ116|пэ2|pe2/],
                        ['avto', /avtotraktor|traktor|yuklagich|pogruz|погруз|avtobus|vaxtovka|avtomobil|nexia|damas|labo|kamaz|камаз|buldozer|ekskavator|mototsikl|tirkama|pritsep|прицеп|texnikalar/],
                        ['vag', /vagon|dumpkar|sisterna|цистерн|хоппер|dumpkarlar/]];
            for (const [k, re] of KW) if (re.test(q)) { kind = k; break; }
            if (!kind) kind = aiScreenKind(sid);
            const P = { vag: onlyVagons(), lok: onlyLoks(), avto: onlyAvto(), yol: onlyYol() };
            const NAME = { vag: 'vagon', lok: 'lokomotiv', avto: 'avtotraktor texnikasi', yol: "yo'l texnikasi" };
            const scope = kind === 'all' ? vagonlarData.slice() : P[kind];
            scope.forEach(recalcVagonStatus);
            // 1) Raqam / marka bo'yicha qidirish
            const toks = q.split(/[\s,;?!]+/).map(t => t.replace(/\.+$/, '')).filter(t => /\d/.test(t) && t.length >= 2 && !/^\d{1,2}$/.test(t));
            if (toks.length) {
                const key = v => [vagonNo(v), v.inv, v.gos, v.zav, v.marka, v.model].map(x => aiNorm(x));
                const pick = list => {
                    const ex = list.filter(v => toks.some(t => key(v).some(x => x && x === t)));
                    if (ex.length) return ex;
                    return list.filter(v => toks.some(t => t.length >= 3 && key(v).some(x => x && x.includes(t))));
                };
                let found = pick(scope); if (!found.length && kind !== 'all') found = pick(vagonlarData);
                if (found.length) { found.forEach(recalcVagonStatus); return found.length === 1 ? aiUnitLine(found[0]) : "Topildi " + found.length + " ta:\n• " + found.slice(0, 10).map(aiUnitLine).join("\n• ") + (found.length > 10 ? "\n... va yana " + (found.length - 10) + " ta" : ""); }
                return "Kechirasiz, «" + toks.join(' ') + "» bo'yicha " + (kind === 'all' ? 'texnika' : NAME[kind]) + " topilmadi.";
            }
            // 2) Pasport ichida — shu texnika haqida
            if (sid === 'screen-vagon-pasport' && /keyingi|qachon|holat|yosh|malumot|haqida|bu /.test(q)) {
                const v = vagonlarData.find(x => x.id === activeVagonId); if (v) { recalcVagonStatus(v); return aiUnitLine(v); }
            }
            // 3) Toifa bo'yicha filtr (drezinalar, kranlar, traktorlar...)
            const STOP = /^(tamir|talab|yaqin|soz|tamirda|hozir|hozirda|nechta|qancha|holat|holati|keyingi|qachon|royxat|barcha|hammasi|korsat|statistika|soni|hisobot|muddati|texnika|qaysi|bormi|kerak)$/;
            const stems = q.split(/[\s,;?!.]+/).map(t => { let s = t; for (let i = 0; i < 3; i++) s = s.replace(/(lari|lar|ning|dagi|dan|ni|da|ga)$/, ''); return s; }).filter(s => s.length >= 4 && !STOP.test(s));
            let list = scope, sub = '';
            if (stems.length) {
                const hay = v => aiNorm(v.type + ' ' + v.naim + ' ' + (v.marka || '') + ' ' + (v.model || ''));
                const f = scope.filter(v => stems.some(s => hay(v).includes(s)));
                if (f.length && f.length < scope.length) { list = f; sub = ' (' + stems.filter(s => scope.some(v => hay(v).includes(s))).join(', ') + ')'; }
            }
            const nm = (kind === 'all' ? 'texnika' : NAME[kind]) + sub;
            const lbl = v => kind === 'vag' ? "№" + vagonNo(v) : unitLabel(v);
            if (q.includes("tamir talab") || q.includes("qizil")) {
                const l = list.filter(v => v.status === "Ta'mir talab");
                return l.length ? "Ta'mir talab " + nm + " (" + l.length + " ta): " + aiListTxt(l, v => lbl(v) + (v.kun !== null ? " (" + (v.kun < 0 ? Math.abs(v.kun) + " kun o'tdi" : v.kun + " kun") + ")" : "")) + "." : "Ta'mir talab " + nm + " yo'q. ✅";
            }
            if (q.includes("yaqin") || q.includes("sariq")) {
                const l = list.filter(v => v.status === "Yaqin");
                return l.length ? "Muddati yaqin " + nm + " (" + l.length + " ta): " + aiListTxt(l, v => lbl(v) + " (" + v.kun + " kun)") + "." : "Muddati yaqin " + nm + " yo'q. ✅";
            }
            if (q.includes("tamirda") || q.includes("kok")) {
                const l = list.filter(v => v.status === "Tamirda" || (v.ppr && v.ppr.events && (pprNext(v) || {}).ongoing));
                return l.length ? "Hozir ta'mirdagi " + nm + " (" + l.length + " ta): " + aiListTxt(l, v => { const n = v.ppr && v.ppr.events ? pprNext(v) : null; return lbl(v) + (n && n.ongoing ? " — " + n.label : ""); }) + "." : "Hozir ta'mirda " + nm + " yo'q.";
            }
            if (/\bsoz\b/.test(q)) { const l = list.filter(v => v.status === 'Soz'); return "Soz " + nm + ": " + l.length + " ta."; }
            if (/nechta|statistika|soni|hisobot|qancha|holat/.test(q) || sub) {
                const st = l => "Jami: " + l.length + " · Soz: " + l.filter(v => v.status === 'Soz').length + " · Yaqin: " + l.filter(v => v.status === 'Yaqin').length + " · Ta'mir talab: " + l.filter(v => v.status === "Ta'mir talab").length + " · Tamirda: " + l.filter(v => v.status === 'Tamirda').length;
                if (kind === 'all' && !sub) return "📊 Umumiy statistika:\n" + ['vag', 'lok', 'avto', 'yol'].map(k => "• " + AI_KIND_NAME[k] + " — " + st(P[k])).join("\n");
                return "📊 " + (sub ? nm.charAt(0).toUpperCase() + nm.slice(1) : AI_KIND_NAME[kind]) + ":\n" + st(list);
            }
            if (kind === 'vag') return null; // eski vagon javoblari
            return "Quyidagilarni so'rashingiz mumkin:\n• «nechta» / «statistika»\n• «ta'mir talab» / «yaqin» / «tamirda»\n• toifa: «drezinalar», «traktorlar», «teplovozlar»...\n• raqam yoki marka: «3918», «УК-25», «10-935ЕА»";
        }

        // Texnika yoshi (xodimlardagi kabi): aniq sana bo'lsa kun-oygacha, faqat yil bo'lsa — yil bo'yicha
        function unitAge(v) {
            const s = String(v && v.yil !== undefined && v.yil !== null ? v.yil : '').trim();
            let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (m) return computeAgeFromDate(m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'));
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) return computeAgeFromDate(s.slice(0, 10));
            m = s.match(/^(\d{4})$/);
            if (m) { const a = new Date().getFullYear() - parseInt(m[1], 10); return a >= 0 && a < 200 ? a : null; }
            return null;
        }

        // Qidiruv mikrofoni: avval ruxsat so'raladi; telefon baribir bloklasa — klaviatura mikrofoni
        let micBlocked = false, micPrimed = false;
        try { micBlocked = sessionStorage.getItem('agmk_mic_blocked') === '1'; } catch (e) {}
        function micFallback(inputId) {
            const inp = $id(inputId);
            if (inp) { try { inp.focus(); inp.click(); } catch (e) {} }
            showToast("🎤 Klaviaturadagi mikrofonni bosib gapiring");
        }
        function micPrime() {
            micPrimed = true;
            const md = navigator.mediaDevices;
            if (!md || !md.getUserMedia) return Promise.resolve();
            return md.getUserMedia({ audio: true }).then(s => { s.getTracks().forEach(t => t.stop()); }).catch(() => {});
        }

        // Rahbar tekshirgach, shu zamechaniya bo'yicha "tekshiring" so'rovi o'qilgan bo'ladi
        function markZamNotifsRead(vid, no) {
            const l = getNotifs(), t = cleanTabel(currentUser && currentUser.tabel); let ch = false;
            l.forEach(n => { if (n.vid === vid && n.zno === no && n.icon === '🛠' && !(n.read || []).includes(t)) { n.read = (n.read || []).concat(t); ch = true; } });
            if (ch) { saveNotifs(l); updateRnBadges(); }
        }


