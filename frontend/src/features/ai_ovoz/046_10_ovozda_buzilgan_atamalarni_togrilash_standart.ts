        // =========================================================
        // 10) Ovozda buzilgan atamalarni to'g'rilash + standart haqida umumiy savol
        // =========================================================
        var VFIX = [
            [/^[kк][aoао][lл][aoао][tdтд][kк]/i, 'kolodk'], [/^[kк][aoао][lл][aoао][dд][kк]/i, 'kolodk'],
            [/^[aа][vв][tт][oaоа][sс][eэе]?[tт]?[sс]?[eэе][pп][kк]/i, 'avtostsepk'], [/^[aа][vв][tт][oaоа][sс][cц][eэе][pп][kк]/i, 'avtostsepk'],
            [/^[tт][aа][rр][mм][oо][zз]/i, 'tormoz'], [/^[lл][aа][kк][aoао][mм][aoао][tт][iи][vв]/i, 'lokomotiv'], [/^[lл][oо][kк][oо][mм][aа][tт][iи][vв]/i, 'lokomotiv'],
            [/^[tт][eэе][pп][lл][uу][vв][oо][zз]/i, 'teplovoz'], [/^[bб][uу][xх][sс]/i, 'buks'], [/^[nн][aа][dд][rр][eэе][sс][oо][rр]/i, 'nadressor'],
            [/^[dд][aа][mм][pп][kк][aа][rр]/i, 'dumpkar'], [/^[gг][oо][sс][tт]/i, 'gost'], [/^[bб][oо][bб][iы][sс][hш]?[kк]/i, 'bobishk'], [/^[bб][aа][sс][hш][mм][aа][kк]/i, 'bashmak']
        ];
        function vFix(s) {
            return String(s || '').replace(/[\p{L}ʻʼ'’]+/gu, w => { for (const [re, rep] of VFIX) { if (re.test(w)) { const m = w.match(re)[0]; if (m.toLowerCase() === rep) return w; return rep + w.slice(m.length); } } return w; });
        }
        // Standart / hujjat haqida umumiy savol
        var STD_TOPIC = [[/kolod|колод|tormoz kolod|тормозн/, 'gost33421'], [/o.?qit|bilim(lar)?(ni)? sin|imtihon|instruktaj|инструктаж|yo.?l-?yo.?riq|stajirovka|guvohnoma/, 'mm_nizom_oqitish'], [/mehnat(ni)? muhofaza|mehnat muhofaz|охрана труда|xavfsizlik texnika|\bmm\b/, 'mm_nizom_tashkil'], [/yo.?riqnoma|temirchi|stropal|frezalov|gilyotin|press|elektrokar/, 'mm_yoriqnomalar']];
        function stdOverview(q) {
            const n = aiNorm(q);
            if (!/standart|стандарт|gost|гост|nizom|низом|положени|yo.?riqnoma|hujjat|инструкци/.test(n)) return null;
            if (/\d+\s*-?\s*(jadval|band|punkt)|таблиц|пункт/.test(n)) return null;
            const t = STD_TOPIC.find(x => x[0].test(n)); if (!t) return null;
            const d = gostDoc(t[1]); if (!d) return null;
            const tables = d.items.filter(i => i.t === 'table' && i.n), heads = d.items.filter(i => i.t === 'h' && i.n && !i.pre);
            const scope = d.items.find(i => !i.pre && i.t === 'p' && (i.n === '1' || /^1\.?$/.test(i.n)));
            const L = ['📘 ' + d.code + ' — ' + d.title.uz + '.'];
            if (scope) L.push((scope.uz || '').slice(0, 320));
            if (heads.length) L.push("Boʻlimlari: " + heads.slice(0, 12).map(h => h.uz).join('; ') + (heads.length > 12 ? '…' : '') + '.');
            if (tables.length) L.push("Jadvallari: " + tables.slice(0, 10).map(x => x.n + '-jadval — ' + (x.cap_uz || '').slice(0, 60)).join('; ') + '.');
            if (d.id === 'gost33421') L.push("Aniq soʻrang, masalan: «yuk vagoni kolodkasining Brinell qattiqligi qancha», «metall spinka qalinligi», «8-jadval 7-punkt», «kolodkada yoriq boʻlsa ruxsat etiladimi».");
            else if (d.id === 'mm_nizom_oqitish') L.push("Aniq soʻrang, masalan: «davriy yoʻl-yoʻriq qancha muddatda», «ishchilar bilim sinovi necha oyda», «stajirovka necha smena».");
            else if (d.id === 'mm_nizom_tashkil') L.push("Aniq soʻrang, masalan: «uch bosqichli nazorat qanday», «II bosqich nazorat necha marta», «kim ishdan chetlatiladi».");
            else L.push("Yoʻriqnomalar roʻyxati va amal qilish muddatlari: Normativ hujjatlar → 🦺 Mehnat muhofazasi.");
            GOST_LAST_CONF = !!d.conf;
            return L.join('\n') + '\n📚 Manba: ' + d.code + " (toʻliq matn: Normativ hujjatlar → Standartlar)";
        }
        var GOST_LAST_CONF = false;
        // Har bir hujjat faqat o'z mavzusidagi savollarga javob beradi
        (function () {
            const T = { gost33421: /kolod|колод|tormoz|тормоз|gost|гост|33421|bashmak|башмак|cheka|чека|bobish|бобыш|greben|гребен|brinel|бринел|ishqalanish|трени/,
                mm: /instruktaj|инструктаж|yo.?l-?yo.?riq|bilim|sinov|imtihon|экзамен|tibbiy|медосмотр|mehnat|охран|guvohnoma|удостовер|stajirov|стажиров|xavfsiz|безопас|jurnal|журнал|nizom|положен|komissiya|комисси|attestat|аттестац|yo.?riqnoma|инструкци|bosqichli nazorat|baxtsiz|несчастн|ishdan chetlat|dfk|o.?qit|обучен|\bmm\b/ };
            ND_BUILTIN.forEach(d => { d.topic = d.cat === 'mm' ? T.mm : (T[d.id] || null); });
            kbSearch = agmkExtend('kbSearch', 'kbSearch', kbSearch, oS => function (q, k) { const n = aiNorm(q); return oS.call(this, q, (k || 5) + 8).filter(r => { if (!/^🏛/.test(r.d.src)) return true; const d = ND_BUILTIN.find(x => r.d.src.indexOf(x.code) >= 0); return !d || !d.topic || d.topic.test(n); }).slice(0, k || 5); });
        })();
        (function () {
            gostAnswer = agmkExtend('gostAnswer', 'gostAnswer', gostAnswer, oG => function (q) {
                GOST_LAST_CONF = false;
                const r = oG.apply(this, arguments);
                try { if (r) { const src = (r.match(/📚 Manba: ([^\n(]+)/) || [])[1] || ''; const d = ND_BUILTIN.find(x => src.indexOf(x.code) >= 0); if (d && d.conf) GOST_LAST_CONF = true; } } catch (e) {}
                return r;
            });
            aiStage('Ovozdan xato tuzatish, GOST va standartlar', function (q, next) {
                const q2 = vFix(q); if (q2 !== q) { try { AI_LAST_RAW = q2; } catch (e) {} }
                try {
                    if (!kbTeachFind(q2)) {
                        const u = kbSearch(q2, 1)[0];
                        if (u && /^📚/.test(u.d.src) && !ND_BUILTIN.some(d => u.d.src.indexOf(d.code) >= 0) && u.cov >= 0.7 && u.s >= 3) return next(q2);
                        const g = gostAnswer(q2); if (g) return { t: g, personal: GOST_LAST_CONF };
                        const s = stdOverview(q2); if (s) return { t: s, personal: GOST_LAST_CONF };
                    }
                } catch (e) { console.error(e); }
                return next(q2);
            });
            if (typeof wUser === 'function') { wUser = agmkExtend('wUser', 'wUser', wUser, ow => function (t) { return ow.call(this, vFix(t)); }); }
        })();
        // Maxfiy (korxona ichki) hujjatlar bulutli AI'ga yuborilmaydi
        (function () {
            if (typeof aiCtx !== 'function') return;
            aiCtx = agmkExtend('aiCtx', 'aiCtx', aiCtx, o => function (q, local, sec) { if (GOST_LAST_CONF) local = "(korxona ichki hujjatidan javob — maxfiy, yuborilmadi)"; return o.call(this, q, local, sec); });
        })();

        // Bo'lim tanlanganda (Vagondan boshqa) akt havolalari ro'yxati yashiriladi
        (function () {
            ndRenderDocs = agmkExtend('ndRenderDocs', 'Boʼlim tanlanganda (Vagondan boshqa) akt havolalari roʼyxati yashiriladi', ndRenderDocs, o => function () {
                const r = o.apply(this, arguments);
                try {
                    if (ND.cat && ND.cat !== 'vagon') {
                        const secs = Array.from(document.querySelectorAll('#ndBody .inf-sec'));
                        const ref = secs.find(x => /📌/.test(x.textContent));
                        if (ref) { let el = ref.nextElementSibling; while (el && !el.classList.contains('inf-sec')) { const nx = el.nextElementSibling; el.remove(); el = nx; } ref.remove(); }
                    }
                    const std = Array.from(document.querySelectorAll('#ndBody .inf-sec')).find(x => /🏛/.test(x.textContent));
                    if (std && ND.cat) std.scrollIntoView({ block: 'start' });
                } catch (e) {}
                return r;
            });
        })();
