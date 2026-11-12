        /* ===== 34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yo'l-yo'riq, aktni ichki yozishmaga yuborish, tushunmasa — takliflar ===== */
        var AI38 = { sugg: null, suggAt: 0, pend: null, seq: 0 };
        function ai38N(q) { return aiNorm(q).replace(/[?!.,;:«»"]/g, ' ').replace(/\s+/g, ' ').trim(); }
        function ai38Me() { return (typeof meTabel === 'function') ? meTabel() : cleanTabel(currentUser && currentUser.tabel); }
        function ai38Weekday(d) { return ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'][d.getDay()]; }
        function ai38DateStr(d) { return d.getFullYear() + '-yil ' + d.getDate() + '-' + UZ_MON[d.getMonth()] + ', ' + ai38Weekday(d); }
        function ai38Addr() { try { const a = userAddress(); return a ? ', ' + a : ''; } catch (e) { return ''; } }

        // ---------- 1) Xatlar: "Rahbardan xat keldimi?", "Kim xat yozdi?" ----------
        function ai38IsBoss(p) {
            if (!p) return false;
            try { if (isRahbarLavozim(p.role)) return true; } catch (e) {}
            try { if (p.tabel && rolesOf(p.tabel).includes('rahbar')) return true; } catch (e) {}
            if (p.tabel && cleanTabel(p.tabel) === ADMIN_TABEL) return true;
            return /boshli|rahbar|direktor|muhandis|nachalnik|начальник|директор|инженер|раҳбар/i.test(p.role || '');
        }
        function ai38Inbox() {
            const out = []; let a = {}; try { a = chatAll() || {}; } catch (e) {}
            Object.keys(a).forEach(k => { const c = a[k]; (c.msgs || []).forEach(m => { if (!m.me) out.push({ k: k, p: c.p || {}, m: m }); }); });
            return out.sort((x, y) => String(y.m.at).localeCompare(String(x.m.at)));
        }
        function ai38MsgLine(x) { const t = x.m.akt ? '📄 ' + (x.m.t || 'Akt') : (x.m.t || ((x.m.files || [])[0] ? '📎 ' + x.m.files[0].name : '')); return '• ' + x.p.name + (x.p.role ? ' (' + x.p.role + ')' : '') + ' — ' + fmtDateTime(x.m.at) + ': «' + String(t).replace(/\s+/g, ' ').slice(0, 90) + (String(t).length > 90 ? '…' : '') + '»'; }
        var MAIL38_Q = /(xat|xabar|maktub|pismo|письм|сообщен|sms|yozishma|message)/;
        var MAIL38_ASK = /(keldi|kelganmi|kelibdimi|kelmadimi|bormi|bor mi|yozdimi|yozibdimi|yozganmi|yozgan|yozdi|kim|yangi|oqilmagan|nechta|qanaqa|qanday|nima)/;
        function ai38Mail(q) {
            const n = ai38N(q);
            const kimYozdi = /\bkim\b.*\b(yozdi|yozgan|xat|xabar)/.test(n) || /(menga|meni) kim/.test(n);
            if (!(MAIL38_Q.test(n) && MAIL38_ASK.test(n)) && !kimYozdi) return null;
            if (/(yubor|jonat|yozib ber|yoz\b|tuz)/.test(n) && !/(keldi|kelgan|bormi|kim)/.test(n)) return null;
            if (!currentUser || !currentUser.tabel) return null;
            if (typeof CHS !== 'undefined' && CHS.locked) return { t: "🔒 Yozishmalaringiz shifrlangan. Ularni oʻqish uchun ilovaga bir marta tabel va parol bilan kiring.", personal: true };
            let L = ai38Inbox(), who = '';
            const boss = /(rahbar|boshliq|boshlig|nachalnik|начальник|direktor|директор|bosh muhandis)/.test(n);
            if (boss) { L = L.filter(x => ai38IsBoss(x.p)); who = 'Rahbariyatdan'; }
            else {
                const rest = n.replace(/\b(xat\w*|xabar\w*|maktub\w*|yozishma\w*|sms|keldi\w*|kelgan\w*|kelib\w*|kelma\w*|bormi|bor|mi|yozdi\w*|yozib\w*|yozgan\w*|kim|kimdan|yangi|oqilmagan|nechta|qanaqa|qanday|nima|menga|meni|mening|dan|ey|ai|salom|bugun|hozir|yoq|ekan|chi)\b/g, ' ').trim();
                if (rest.length >= 3) { const P = pplFind(rest); if (P.length) { const ks = P.map(p => ctKey(p)); L = L.filter(x => ks.includes(x.k) || P.some(p => dbN(p.name) === dbN(x.p.name))); who = (P.length === 1 ? P[0].name : P.map(p => p.name).slice(0, 3).join(', ')) + 'dan'; } }
            }
            const un = L.filter(x => !x.m.read);
            let t;
            if (un.length) t = '📬 ' + (who || 'Sizga') + ' ' + un.length + ' ta yangi (oʻqilmagan) xat bor:\n' + un.slice(0, 5).map(ai38MsgLine).join('\n') + (un.length > 5 ? '\n… va yana ' + (un.length - 5) + ' ta' : '') + '\n\n«Xatni och» yoki «xatni oʻqib ber» deng.';
            else if (L.length) t = '📭 ' + (who || 'Sizga') + ' yangi xat yoʻq. Oxirgi xat:\n' + ai38MsgLine(L[0]);
            else t = '📭 ' + (who ? who + ' hali xat kelmagan.' : 'Hali sizga xat kelmagan.');
            try { const nn = myUnreadNotifs().length; if (nn) t += '\n🔔 Yana ' + nn + ' ta oʻqilmagan bildirishnoma bor — «bildirishnomalarni ayt» deng.'; } catch (e) {}
            AI38.lastMail = un[0] || L[0] || null;
            return { t: t, personal: true };
        }
        function ai38MailOpenRead(q) {
            const n = ai38N(q);
            if (!/(xat|xabar|maktub)\w*/.test(n)) return null;
            const open = /\b(och|ochib|ko.?rsat|kir)\w*/.test(n), read = /\b(oqi|oqib|ayt|aytib)\w*/.test(n);
            if (!open && !read) return null;
            if (/(yubor|jonat|yoz\b)/.test(n)) return null;
            const L = ai38Inbox(); const x = (AI38.lastMail && L.find(y => y.m.id === AI38.lastMail.m.id)) || L.find(y => !y.m.read) || L[0];
            if (!x) return { t: '📭 Ochadigan xat yoʻq.', personal: true };
            if (open) { setTimeout(() => { try { aicClose(); } catch (e) {} openChats(x.p); }, 500); return { t: '💬 ' + x.p.name + ' bilan yozishma ochilmoqda.', personal: true }; }
            return { t: '✉️ ' + x.p.name + (x.p.role ? ' (' + x.p.role + ')' : '') + ', ' + fmtDateTime(x.m.at) + ':\n' + (x.m.akt ? '📄 ' + x.m.t + ' — akt yubordi.' : (x.m.t || '📎 fayl')), personal: true };
        }
        function ai38Notif(q) {
            const n = ai38N(q);
            if (!/(bildirishnoma|xabarnoma|уведомл|notif|eslatma)/.test(n)) return null;
            if (/\b(och|ko.?rsat)\w*/.test(n) && !/(bormi|nechta|nima|ayt)/.test(n)) return null;
            let l = []; try { l = myUnreadNotifs().slice().reverse(); } catch (e) {}
            if (!l.length) return { t: "🔔 Yangi bildirishnoma yoʻq.", personal: true };
            return { t: '🔔 ' + l.length + ' ta oʻqilmagan bildirishnoma:\n' + l.slice(0, 5).map(x => '• ' + (x.icon || '🔔') + ' ' + String(x.text).slice(0, 110) + ' — ' + fmtDateTime(x.at)).join('\n') + (l.length > 5 ? '\n… va yana ' + (l.length - 5) + ' ta' : ''), personal: true };
        }

        // ---------- 2) Oddiy suhbat va ilova bo'yicha yo'l-yo'riq ----------
        var TALK38 = [
            [/^(assalomu? ?alaykum|assalom|salom|salom alaykum|salomat|xayrli (tong|kun|kech)|hayrli (tong|kun|kech)|привет|здравствуй[а-яё]*|добрый (день|вечер)|доброе утро)( (ey |hey )?(ai|ay|aka|opa|dost|dostim|yordamchi))*$/, () => { const h = new Date().getHours(); return (h < 11 ? 'Xayrli tong' : h < 17 ? 'Assalomu alaykum' : 'Xayrli kech') + ai38Addr() + '! Qanday yordam kerak? Texnika, xodimlar, muddatlar, normativlar yoki xatlaringiz — soʻrang.'; }],
            [/(qalaysan|qalaysiz|yaxshimisan|yaxshimisiz|ishlar qalay|ahvol\w* qalay|kayfiyat\w* qalay|nima gap|как дела|как ты)/, () => 'Rahmat, yaxshi! Ishlashga tayyorman' + ai38Addr() + '. Sizga qanday yordam bera olaman?'],
            [/^(rahmat|raxmat|katta rahmat|tashakkur|minnatdorman|спасибо|благодарю)( sizga| senga| ai)?$/, () => 'Arzimaydi' + ai38Addr() + '! Yana savol boʻlsa, bemalol soʻrang.'],
            [/(sen kimsan|siz kimsiz|kimsan|kimsiz|isming nima|ismingiz nima|oʻzingni tanishtir|ozingni tanishtir|ozingizni tanishtiring|кто ты)/, () => "Men AGMK-STTB PTO platformasining AI yordamchisiman. Texnika (vagon, lokomotiv, avtotraktor, yoʻl texnikasi) holati va taʼmir muddatlari, xodimlar, normativ hujjatlar, mehnat muhofazasi muddatlari, MTTB zayavkalari va xatlaringiz boʻyicha maʼlumot topib beraman, ovoz bilan oʻqib beraman, akt tayyorlab, kerakli xodimga yuboraman. Ilova sozlamalari va huquqlarini oʻzgartira olmayman."],
            [/(nima(lar)? qila olasan|nimalar qilasan|nima(lar)? qila olasiz|nimalarni bilasan|qanday yordam bera olasan|imkoniyat\w*|^yordam( ber)?$|^help$|что умеешь|что ты умеешь)/, () => "Men quyidagilarni qila olaman:\n• Texnika: «8121 vagon», «taʼmir talab vagonlar», «ТЭМ2 nechta», «yaqin texnikalar»\n• Xodimlar: «Karimov telefoni», «xodimlar roʻyxati»\n• Xatlar: «rahbardan xat keldimi», «kim xat yozdi», «xatni oʻqib ber»\n• Normativ: «kolodka qalinligi meʼyori», «instruktaj davriyligi»\n• Mehnat muhofazasi: «mening muddatlarim»\n• MTTB: «zayavka tuz: kolodka 20 ta», «omborda nima qoldi»\n• Akt: «akt tuz», «oxirgi aktni boshliqqa yubor»\n• Sahifalar: «vagonlarni och», «parametrlarni och», «sahifani yop»"],
            [/(soat nech(a|i)|hozir soat|vaqt nech|qancha vaqt boldi|который час|сколько времени)/, () => { const d = new Date(); return '🕒 Hozir soat ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '.'; }],
            [/(bugun (qaysi kun|necha|nechanchi|qanaqa kun|sana)|bugungi sana|sana nech|bugun nima kun|hafta(ning)? qaysi kuni|какое сегодня число|какой сегодня день)/, () => '📅 Bugun ' + ai38DateStr(new Date()) + '.'],
            [/(ertaga (qaysi kun|necha|nechanchi|sana)|ertangi sana)/, () => { const d = new Date(); d.setDate(d.getDate() + 1); return '📅 Ertaga ' + ai38DateStr(d) + '.'; }],
            [/(kecha (qaysi kun|necha|nechanchi|sana)|kechagi sana)/, () => { const d = new Date(); d.setDate(d.getDate() - 1); return '📅 Kecha ' + ai38DateStr(d) + ' edi.'; }],
            [/(hazil|latifa|kuldir|анекдот|шутк)/, () => "😄 Bir master shogirdiga: «Vagonni koʻrib chiqdingmi?» — «Ha, usta, ikki marta!» — «Nega ikki marta?» — «Birinchisida taʼmir muddati qachonligini, ikkinchisida — nega ilovadan soʻramaganimni oʻyladim!»"],
            [/(charchadim|zerikdim|ishim kop|holim yoq|toliqdim)/, () => "Tushunaman" + ai38Addr() + ". Biroz dam oling, bir piyola choy iching. Maʼlumot kerak boʻlsa, men shu yerdaman — ovoz bilan soʻrasangiz ham boʻladi."],
            [/^(bazada |ilovada |jami )?(nechta|qancha) (xodim|ishchi|hodim)\w*( bor| ishlaydi)?( ekan)?$/, () => { try { const L = allXodims().filter(r => r.item && r.item.name); const by = {}; L.forEach(r => { by[r.su] = (by[r.su] || 0) + 1; }); const top = Object.entries(by).sort((a, b) => b[1] - a[1]); return '👥 Bazada jami ' + L.length + ' ta xodim, ' + top.length + ' ta boʻlinmada:\n' + top.slice(0, 6).map(([k, v]) => '• ' + k + ' — ' + v + ' ta').join('\n') + (top.length > 6 ? '\n… va yana ' + (top.length - 6) + ' ta boʻlinma' : ''); } catch (e) { return null; } }],
            [/(meni qanday chaqir|menga qanday murojaat|ismimni bilasanmi|men kimman)/, () => { try { return 'Siz — ' + currentUser.name + (currentUser.role ? ', ' + currentUser.role : '') + '. Sizga «' + labbayText().replace(/^Labbay,?\s*/, '').replace(/!$/, '') + '» deb murojaat qilaman. Oʻzgartirish: Profil → «AI murojaati».'; } catch (e) { return null; } }]
        ];
        var HOWTO38 = [
            [/parol/, /(ozgartir|almashtir|yangila|qanday|qanaqa|unutdim|esimdan)/, () => "🔑 Parolni oʻzgartirish: Bosh sahifa → «Parametrlar» → «Hisob parolini oʻzgartirish». Parolni unutgan boʻlsangiz — kirish oynasida «Parolni tiklash» (tabel va tugʻilgan sana bilan)."],
            [/\bpin\b|pin ?kod/, /(qoy|ornat|ozgartir|qanday|olib tashla|ochir)/, () => "🔢 PIN-kod: «Parametrlar» → «PIN-kod bilan kirish». 4 xonali kod qoʻyasiz — keyingi safar parolsiz, PIN bilan kirasiz."],
            [/(mavzu|dizayn|\btema\b|\bfon\b|fonni)/, /(ozgartir|almashtir|qanday)/, () => "🎨 «Parametrlar» → «Dizayn mavzusi» — mavzuni tanlang."],
            [/\btil(ni|i)?\b|ruscha|inglizcha|xitoycha/, /(ozgartir|almashtir|qanday|qil)/, () => "🌐 «Parametrlar» → «Til» — oʻzbek, rus, ingliz yoki xitoy tilini tanlang."],
            [/(ey ai|kalit soz|ovozimni|ovoz namuna|chaqiruv|salom ey)/, /(orgat|sozla|qanday|ochir|yoq|ishlamay|ozi ochil|ochilib qol)/, () => "🎙 «Parametrlar» → «Ovoz bilan chaqirish («Ey AI»)». «Salom, Ey AI» iborasini 3–5 marta aytib ovozingizni oʻrgating. Chaqirmagan paytda oyna chiqsa — «🚫 Men chaqirmadim» tugmasini bosing: ilova shu ovozni eslab qoladi va keyin javob bermaydi. Sezgirlikni ham shu yerda kamaytirish mumkin."],
            [/(ovoz chiqarib|oqib ber|ovozli javob|ovozda javob)/, /(sozla|ochir|yoq|qanday|kerak emas|doim)/, () => "🔊 «Parametrlar» → «Javobni ovoz chiqarib oʻqish»: har safar soʻrash (Ha / Yoʻq), har doim oʻqish yoki oʻqimaslik."],
            [/(\bakt|dalolatnoma)/, /(qanday|qanaqa|qayerda|qayerdan)/, () => "📄 Akt tuzish: Bosh sahifa → «Normativ-huquqiy hujjatlar va aktlar» → akt turini tanlang. Yoki menga «akt tuz» deng — savollar berib, aktni bosqichma-bosqich tayyorlayman. Tayyor aktni «oxirgi aktni boshliqqa yubor» deb ichki yozishmaga yuborasiz."],
            [/(zayavka|заявк|buyurtma)/, /(qanday|qanaqa|qayerda|qayerdan)/, () => "📦 Zayavka: Bosh sahifa → «MTTB — Moddiy-texnik taʼminot» → «Zayavkalar» → «+ Yangi». Yoki ayting: «zayavka tuz: tormoz kolodkasi 20 ta»."],
            [/(xabar|xat)/, /(qanday yoz|qanday yubor|qayerdan yoz)/, () => "💬 Xabar yozish: bosh sahifadagi yuqori chap burchakdagi 💬 tugmasi → xodimni qidiring → yozing. Yoki menga ayting: «Karimovga xabar yoz»."],
            [/(bildirishnoma|xabarnoma)/, /(qayerda|qanday|qayerdan)/, () => "🔔 Bildirishnomalar — bosh sahifa yuqorisidagi qoʻngʻiroqcha. Menga «bildirishnomalarni ayt» desangiz, oʻqib beraman."],
            [/(server|sinxron|internet orqali)/, /(qanday|ulash|ulayman|sozla|kerak)/, () => "🔄 «Parametrlar» → «Server (sinxronlash)» — administrator bir marta sozlaydi. Shundan keyin xabarlar, aktlar va bildirishnomalar telefonlar oʻrtasida oʻzi yetib boradi."],
            [/(rol|huquq|ruxsat)/, /(qanday|kim ber|olish|beradi)/, () => "👥 Rollar va huquqlarni faqat administrator beradi: «Parametrlar» → «Rollar va huquqlar». U yerda «📋 Huquqlar jadvali»da kim nima qila olishi koʻrsatilgan."],
            [/(albom|rasm|surat|foto)/, /(qanday qosh|qanday yukla|qayerga)/, () => "📸 Vagon pasportini oching → «Eslatma albomi» → 📷 kamera yoki 🖼 galereya. Rasmga izoh yozish va AI tahlili ham shu yerda."],
            [/(profil|rasmim|telefonim)/, /(ozgartir|qanday|qosh)/, () => "👤 Bosh sahifadagi ⋮ (AGMK-STTB yozuvi) → Profil: rasmingizni va telefon raqamingizni oʻzgartirasiz."]
        ];
        function ai38Talk(q) {
            const n = ai38N(q); if (!n || n.length > 90) return null;
            for (const [re, fn] of TALK38) if (re.test(n)) { const t = fn(); if (t) return { t: t, personal: false }; }
            if (n.split(' ').length <= 12) for (const [a, b, fn] of HOWTO38) if (a.test(n) && b.test(n)) return { t: fn(), personal: false };
            return null;
        }
        // Yangi sahifalarni ovoz bilan ochish
        try {
            if (typeof AG_OPEN !== 'undefined') {
                AG_OPEN.unshift(
                    [/mehnat muhofaz|\bmm\b|instruktaj|инструктаж/, () => openMM(), 'Mehnat muhofazasi'],
                    [/\bmttb\b|taminot|ombor|zayavka|склад/, () => openMTTB(), 'MTTB — Moddiy-texnik taʼminot'],
                    [/buxgalter|iqtisod|xarajat/, () => openBux(), 'Buxgalteriya va iqtisodiyot'],
                    [/normativ|me.?yoriy|gost|hujjatlar/, () => openND('docs'), 'Normativ hujjatlar']
                );
            }
        } catch (e) {}

        // ---------- 3) Tushunmasa — 2–3 ta taklif ----------
        var SUG38 = ["taʼmir talab vagonlar", "nechta vagon bor", "taʼmir talab lokomotivlar", "yaqin texnikalar", "bugungi hisobot", "xodimlar roʻyxati", "rahbardan xat keldimi", "kim xat yozdi", "bildirishnomalarni ayt", "mening muddatlarim", "mening zayavkalarim", "omborda nima qoldi", "shu oy xarajatlar", "akt tuz", "oxirgi aktni boshliqqa yubor", "kolodka qalinligi meʼyori", "instruktaj davriyligi", "bilim sinovi qachon", "parolni qanday oʻzgartiraman", "vagonlarni och", "parametrlarni och", "nima qila olasan", "soat necha", "bugun qaysi kun"];
        function ai38Stem(w) { return w.length > 5 ? w.slice(0, 5) : w; }
        function ai38Suggest(q) {
            const toks = dbN(q).split(' ').filter(w => w.length >= 3).map(ai38Stem);
            const sc = SUG38.map(s => { const w = dbN(s).split(' ').filter(x => x.length >= 3).map(ai38Stem); let k = 0; toks.forEach(t => { if (w.some(x => x === t || (t.length >= 4 && (x.startsWith(t.slice(0, 4)) || t.startsWith(x.slice(0, 4)))))) k++; }); return { s: s, k: k }; }).filter(x => x.k > 0).sort((a, b) => b.k - a.k);
            const out = sc.slice(0, 3).map(x => x.s);
            ['nima qila olasan', 'taʼmir talab vagonlar', 'rahbardan xat keldimi'].forEach(d => { if (out.length < 3 && !out.includes(d)) out.push(d); });
            return out.slice(0, 3);
        }
        (function () {
            aiClarify = agmkExtend('aiClarify', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', aiClarify, o => function () {
                const q = (typeof AI_LAST_RAW !== 'undefined' && AI_LAST_RAW) || AI38.lastQ || '';
                if (!q) return o.apply(this, arguments);
                const s = ai38Suggest(q); AI38.sugg = s; AI38.suggAt = Date.now(); AI38.suggFresh = true;
                return "🤔 Savolni aniq tushunmadim. Balki shulardan birini nazarda tutdingiz:\n" + s.map((x, i) => (i + 1) + ') ' + x).join('\n') + "\nRaqamini ayting («birinchisi») yoki bosing.";
            });
        })();
        function ai38Pick(q) {
            if (!AI38.sugg || Date.now() - AI38.suggAt > 180000) return null;
            const n = ai38N(q); const m = n.match(/^(1|2|3|bir(inchi\w*)?|ikki(nchi\w*)?|uch(inchi\w*)?|birinchi|ikkinchi|uchinchi|первы\w*|втор\w*|трет\w*)( variant\w*| savol\w*)?$/);
            if (!m) return null;
            const i = /^(1|bir|первы)/.test(m[1]) ? 0 : /^(2|ikki|втор)/.test(m[1]) ? 1 : 2;
            const s = AI38.sugg[i]; AI38.sugg = null; if (!s) return null;
            const r = aiLocalAnswer(s); if (r && r.t) r.t = '➡️ «' + s + '»\n' + (r.help ? aiClarify() : r.t); return r;
        }
        function ai38SuggChips(el) {
            if (!AI38.suggFresh || !AI38.sugg || !el) return; AI38.suggFresh = false;
            const d = document.createElement('div'); d.className = 'sug38';
            AI38.sugg.forEach(s => { const b = document.createElement('button'); b.innerText = s; b.onclick = () => { AI38.sugg = null; d.remove(); aiSendText(s).then(a => { if (a) read38Offer(a); }); }; d.appendChild(b); });
            el.appendChild(d);
        }

        // ---------- 4) Aktni ovoz bilan ichki yozishmaga yuborish ----------
        var AKT38_OUT = function () { return 'agmk_outbox_' + ai38Me(); };
        function akt38Find(n) {
            const pg = $id('ndPage'), onNd = pg && $id('screen-nd') && $id('screen-nd').classList.contains('active');
            const arch = (typeof ndAkts === 'function' ? ndAkts() : []);
            const num = (n.match(/\b\d{3,8}\b/) || [])[0];
            if (num && !/oxirgi|shu|joriy|hozirgi|tayyorlangan|tuzilgan/.test(n)) { const a = arch.find(x => aiNorm(x.title + ' ' + (x.text || '')).includes(num)); if (a) return { a: a }; }
            if (onNd && pg && ND.view !== 'arch1') return { html: pg.innerHTML, title: (typeof ndCurTitle === 'function' ? ndCurTitle() : 'Akt') };
            if (onNd && pg && ND.view === 'arch1') { const t = aiNorm(pg.innerText.slice(0, 300)); const a = arch.find(x => aiNorm((x.text || '').slice(0, 300)) === t) || arch[0]; if (a) return { a: a }; }
            if (ND.html && !arch.some(x => x.html === ND.html)) return { html: ND.html, title: ((ND.html.match(/<div class="a-title">([\s\S]*?)<\/div>/) || [, 'Akt'])[1] || 'Akt').replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() };
            return arch[0] ? { a: arch[0] } : null;
        }
        function akt38Recipients(n) {
            const me = ai38Me();
            const boss = /(boshliq|boshlig|boshligimga|nachalnik|начальник|rahbar\w*|раҳбар)/.test(n);
            if (boss) {
                let su = ''; try { const r = findXodimsByTabel(me)[0]; su = r ? r.su : ''; } catch (e) {}
                const all = allXodims().filter(r => cleanTabel(r.item.tabel) !== me);
                let L = all.filter(r => su && r.su === su && isRahbarLavozim(r.item.lavozim));
                if (!L.length) L = all.filter(r => su && r.su === su && r.item.tabel && rolesOf(r.item.tabel).includes('rahbar'));
                if (!L.length) L = all.filter(r => r.item.tabel && rolesOf(r.item.tabel).includes('rahbar'));
                if (!L.length) L = all.filter(r => isRahbarLavozim(r.item.lavozim));
                const seen = {}; return L.map(r => xodimPerson(r.item)).filter(p => { const k = p.tabel || p.name; if (seen[k]) return false; seen[k] = 1; return true; });
            }
            const who = n.replace(/\b(oxirgi|shu|ushbu|bu|joriy|hozirgi|tayyorlangan|tuzilgan|akt\w*|dalolatnoma\w*|hujjat\w*|ni|ga|ichki|yozishma\w*|chat\w*|ilova\w*|orqali|yubor\w*|jonat\w*|joʻnat\w*|ber\w*|iltimos|ey|ai|salom|va|ham|menga|vagon\w*|lokomotiv\w*|\d+)\b/g, ' ').trim();
            if (who.length < 3) return [];
            return pplFind(who).filter(p => cleanTabel(p.tabel) !== me);
        }
        function akt38Ask(q) {
            const n = ai38N(q);
            if (!/(yubor|jonat|joʻnat|отправ|перешл)/.test(n) || !/(akt|dalolatnoma|акт)/.test(n)) return null;
            if (/(telegram|pochta|email|e mail|mail|sms|смс|почт|телеграм)/.test(n)) return null; // tashqi yo'l — eski agent
            if (!currentUser || !currentUser.tabel) return null;
            const src = akt38Find(n);
            if (!src) return { t: "📄 Yuboriladigan akt topilmadi. Avval akt tuzing: «akt tuz».", personal: false };
            const title = src.a ? src.a.title + ' ' + fmtISO((src.a.at || '').slice(0, 10)) : src.title;
            const R = akt38Recipients(n);
            if (!R.length) return { t: "👤 Kimga yuborishni aniqlay olmadim. Ayting: «aktni boshliqqa yubor» yoki «aktni Karimovga yubor».", personal: true };
            if (R.length > 1) {
                AI38.pend = { kind: 'pick', src: src, title: title, R: R.slice(0, 6), at: Date.now(), id: ++AI38.seq, fresh: true };
                return { t: "👥 Bir nechta xodim mos keldi. Kimga yuboray?\n" + R.slice(0, 6).map((p, i) => (i + 1) + ') ' + p.name + (p.role ? ' — ' + p.role : '')).join('\n') + "\nRaqamini ayting yoki bosing.", personal: true };
            }
            AI38.pend = { kind: 'confirm', src: src, title: title, to: R[0], at: Date.now(), id: ++AI38.seq, fresh: true };
            return { t: '📤 «' + title + '» — ' + R[0].name + (R[0].role ? ' (' + R[0].role + ')' : '') + " ichki yozishmasiga yuborilsinmi?", personal: true };
        }
        function akt38PendAnswer(q) {
            const P = AI38.pend; if (!P || Date.now() - P.at > 180000) return null;
            const n = ai38N(q);
            if (P.kind === 'pick') {
                const m = n.match(/^(1|2|3|4|5|6|bir\w*|ikki\w*|uch\w*|tort\w*|besh\w*|olti\w*)( ?chi\w*)?$/);
                let i = -1; if (m) i = /^(1|bir)/.test(m[1]) ? 0 : /^(2|ikki)/.test(m[1]) ? 1 : /^(3|uch)/.test(m[1]) ? 2 : /^(4|tort)/.test(m[1]) ? 3 : /^(5|besh)/.test(m[1]) ? 4 : 5;
                else { const f = pplFind(n); if (f.length === 1) i = P.R.findIndex(p => (p.tabel && p.tabel === f[0].tabel) || p.name === f[0].name); }
                if (/^(yoq|bekor|kerak emas|нет)/.test(n)) { AI38.pend = null; return { t: '❌ Yuborish bekor qilindi.', personal: true }; }
                if ((i < 0 || !P.R[i]) && yn38Parse(n) === true) { P.at = Date.now(); P.fresh = true; return { t: '👥 Kimga yuboray? Raqamini ayting:\n' + P.R.map((p, k) => (k + 1) + ') ' + p.name + (p.role ? ' — ' + p.role : '')).join('\n'), personal: true }; }
                if (i < 0 || !P.R[i]) return null;
                AI38.pend = { kind: 'confirm', src: P.src, title: P.title, to: P.R[i], at: Date.now(), id: ++AI38.seq, fresh: true };
                return { t: '📤 «' + P.title + '» — ' + P.R[i].name + (P.R[i].role ? ' (' + P.R[i].role + ')' : '') + " ichki yozishmasiga yuborilsinmi?", personal: true };
            }
            if (n.split(' ').length > 5) return null;
            const v = yn38Parse(n); if (v === null) return null;
            AI38.pend = null;
            if (!v) return { t: '❌ Yuborish bekor qilindi.', personal: true };
            setTimeout(() => akt38Exec(P), 450);
            return { t: '📤 ' + P.to.name + 'ga yuborilmoqda…', personal: true };
        }
        function akt38Yes(id) { const P = AI38.pend; if (!P || P.id !== id) return; AI38.pend = null; akt38Btns(id, '✅ Tasdiqlandi'); aicAdd('bot', escapeHtml('📤 ' + P.to.name + 'ga yuborilmoqda…')); akt38Exec(P); }
        function akt38No(id) { const P = AI38.pend; if (P && P.id === id) AI38.pend = null; akt38Btns(id, '❌ Bekor qilindi'); }
        function akt38PickBtn(id, i) { const P = AI38.pend; if (!P || P.id !== id || !P.R[i]) return; akt38Btns(id, '👤 ' + P.R[i].name); aiSendText(String(i + 1)).then(t => { if (t) read38Offer(t); }); }
        function akt38Btns(id, txt) { const r = $id('ak38_' + id); if (r) r.innerHTML = '<span class="ak38-done">' + escapeHtml(txt) + '</span>'; }
        function akt38Uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
        async function akt38Exec(P) {
            try {
                let a = P.src.a;
                if (!a) {
                    const div = document.createElement('div'); div.innerHTML = P.src.html;
                    a = { id: 'a' + Date.now().toString(36), at: new Date().toISOString(), by: (typeof authorStr === 'function' ? authorStr() : (currentUser.name || '')), title: String(P.src.title || 'Akt').replace(/\s+\d{2}\.\d{2}\.\d{4}$/, '').trim(), html: P.src.html, text: (div.innerText || '').slice(0, 2000) };
                    const l = ndAkts(); l.unshift(a); ndSet(ND_AKT_KEY, l.slice(0, 200));
                }
                const uid = akt38Uid(), to = P.to;
                const text = '📄 Akt: ' + P.title;
                const wire = text + '\n[[AKT38:' + a.id + '|' + uid + ']]';
                await chatAddMsg(to, { me: true, t: text, via: 'app' });
                akt38MarkLast(to, { akt: { id: a.id, uid: uid, title: P.title }, st: 'q' });
                let sent = false, err = '';
                if (typeof syncReady === 'function' && syncReady() && navigator.onLine !== false && to.tabel) {
                    try { await syncNow(true); } catch (e) {}
                    try { await syncSendMsg(to, wire); sent = true; } catch (e) { err = agmkErrUz(e); }
                }
                if (!sent) { const q = kvGet(AKT38_OUT(), []); q.push({ to: { name: to.name, role: to.role || '', tabel: cleanTabel(to.tabel) }, text: wire, uid: uid, at: new Date().toISOString() }); try { localStorage.setItem(AKT38_OUT(), JSON.stringify(q.slice(-200))); } catch (e) {} }
                else akt38SetSt(uid, 's');
                try { sendLog({ to: to.name, via: 'app', files: [P.title], subject: P.title }); } catch (e) {}
                const msg = sent ? '✅ Akt ' + to.name + 'ning ichki yozishmasiga yetkazildi. U ochib koʻrganda sizga «👁 Koʻrildi» belgisi keladi.'
                    : !to.tabel ? '⚠️ ' + to.name + 'ning tabel raqami bazada yoʻq — ichki yozishma ishlamaydi. Xodim kartasiga tabelni kiriting.'
                    : "⏳ Akt navbatga qoʻyildi" + (err ? ' (' + err + ')' : '') + ". Server " + ((typeof syncReady === 'function' && syncReady()) ? 'bilan aloqa tiklanganda' : 'ulanganda') + " avtomatik yetkaziladi. Yozishmada «⏳ Navbatda» deb turadi.";
                const el = aicAdd('bot', escapeHtml(msg) + '<small class="ai-src">💬 Ichki yozishma</small>');
                if (Date.now() < V38.voiceUntil || (typeof AILIVE !== 'undefined' && AILIVE.on)) { if (!(typeof AILIVE !== 'undefined' && AILIVE.on)) speakAiText(msg); }
                return el;
            } catch (e) { console.error(e); aicAdd('bot', escapeHtml('⚠️ Yuborib boʻlmadi: ' + agmkErrUz(e))); }
        }
        function akt38FindMsg(pred) { const a = chatAll(); for (const k of Object.keys(a)) { const l = a[k].msgs || []; for (let i = l.length - 1; i >= 0; i--) if (pred(l[i])) return { a: a, c: a[k], m: l[i] }; } return null; }
        function akt38MarkLast(p, extra) { const a = chatAll(), c = a[chatId(p)]; if (!c || !c.msgs || !c.msgs.length) return; Object.assign(c.msgs[c.msgs.length - 1], extra); chatSave(a); }
        function akt38SetSt(uid, st, at) { const r = akt38FindMsg(m => m.me && m.akt && m.akt.uid === uid); if (!r) return; if (r.m.st === 'seen' && st !== 'seen') return; r.m.st = st; if (at) r.m.seenAt = at; chatSave(r.a); try { if ($id('screen-chat').classList.contains('active')) chatRender(); } catch (e) {} }
        // Navbatdagilarni yuborish
        async function akt38Flush() {
            if (typeof syncReady !== 'function' || !syncReady() || navigator.onLine === false) return;
            const q = kvGet(AKT38_OUT(), []); if (!q.length) return;
            const left = [];
            for (const x of q) { try { await syncSendMsg(x.to, x.text); if (x.uid) akt38SetSt(x.uid, 's'); } catch (e) { left.push(x); } }
            try { localStorage.setItem(AKT38_OUT(), JSON.stringify(left)); } catch (e) {}
        }
        (function () { if (typeof syncNow !== 'function') return; syncNow = agmkExtend('syncNow', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', syncNow, o => async function () { const r = await o.apply(this, arguments); try { await akt38Flush(); } catch (e) {} return r; }); })();
        // Qabul qiluvchi: akt kartasi, bildirishnoma, "ko'rildi" belgisi
        (function () {
            chatAddMsg = agmkExtend('chatAddMsg', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish · Qabul qiluvchi: akt kartasi, bildirishnoma, "koʼrildi" belgisi', chatAddMsg, o => async function (p, m) {
                if (m && m.me === false && typeof m.t === 'string') {
                    const s = m.t.match(/^\s*\[\[AKT38:SEEN:([\w]+)(?:\|([^\]]*))?\]\]\s*$/);
                    if (s) { akt38SetSt(s[1], 'seen', s[2] || new Date().toISOString()); return; }
                    const k = m.t.match(/\[\[AKT38:([\w-]+)\|([\w]+)\]\]/);
                    if (k) {
                        const clean = m.t.replace(/\s*\[\[AKT38:[^\]]+\]\]\s*/, '').trim() || '📄 Akt';
                        const r = await o.call(this, p, Object.assign({}, m, { t: clean }));
                        akt38MarkLast(p, { akt: { id: k[1], uid: k[2], title: clean.replace(/^📄\s*Akt:\s*/, '') } });
                        try { notify({ icon: '📄', text: (p.name || 'Xodim') + ' sizga akt yubordi: ' + clean.replace(/^📄\s*Akt:\s*/, ''), toTabel: ai38Me(), byTabel: cleanTabel(p.tabel) || 'x', aktOpen: k[1], aktUid: k[2], fromTabel: cleanTabel(p.tabel) }); } catch (e) {}
                        return r;
                    }
                }
                return o.apply(this, arguments);
            });
            showToast = agmkExtend('showToast', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', showToast, oT => function (msg) { const s = String(msg || ''); if (/\[\[AKT38:SEEN:/.test(s)) return; return oT.call(this, s.replace(/\s*\[\[AKT38:[^\]]+\]\]/g, '')); });
        })();
        function akt38Open(aktId, uid) {
            const x = (ndAkts() || []).find(a => a.id === aktId);
            // qabul qiluvchi ochdi — yuboruvchiga "ko'rildi"
            try {
                const r = akt38FindMsg(m => !m.me && m.akt && m.akt.uid === uid);
                if (r && x && !r.m.seenSent) {
                    r.m.seenSent = 1; chatSave(r.a);
                    const to = r.c.p, wire = '[[AKT38:SEEN:' + uid + '|' + new Date().toISOString() + ']]';
                    const send = async () => { try { await syncSendMsg(to, wire); } catch (e) { const q = kvGet(AKT38_OUT(), []); q.push({ to: { name: to.name, role: to.role || '', tabel: cleanTabel(to.tabel) }, text: wire, at: new Date().toISOString() }); try { localStorage.setItem(AKT38_OUT(), JSON.stringify(q)); } catch (x2) {} } };
                    if (typeof syncReady === 'function' && syncReady()) send(); else { const q = kvGet(AKT38_OUT(), []); q.push({ to: { name: to.name, role: to.role || '', tabel: cleanTabel(to.tabel) }, text: wire, at: new Date().toISOString() }); try { localStorage.setItem(AKT38_OUT(), JSON.stringify(q)); } catch (e) {} }
                }
            } catch (e) {}
            if (!x) { if (typeof syncReady === 'function' && syncReady()) { showToast('⏳ Akt serverdan yuklanmoqda…'); syncNow(true).then(() => { if ((ndAkts() || []).some(a => a.id === aktId)) akt38Open(aktId, uid); else alert('⚠️ Akt hali serverga yetib kelmagan. Birozdan keyin qayta oching.'); }); } else alert('⚠️ Bu akt telefoningizda topilmadi. Server ulanganda avtomatik keladi.'); return; }
            try { const m = $id('notifListModal'); if (m) m.classList.add('hidden'); } catch (e) {}
            openND('arch'); ndOpenArch(aktId);
        }
        (function () {
            if (typeof openNotif !== 'function') return;
            openNotif = agmkExtend('openNotif', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', openNotif, o => function (id) { let n = null; try { n = getNotifs().find(x => x.id === id); } catch (e) {} const r = o.apply(this, arguments); if (n && n.aktOpen) setTimeout(() => akt38Open(n.aktOpen, n.aktUid), 100); return r; });
        })();
        // Yozishmada akt kartasi va holati
        (function () {
            chatRender = agmkExtend('chatRender', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish · Yozishmada akt kartasi va holati', chatRender, o => function () {
                const r = o.apply(this, arguments);
                try {
                    if (!CHAT.cur) return r;
                    const c = chatAll()[CHAT.cur]; if (!c) return r;
                    const els = $id('chatBody').querySelectorAll('.chat-m');
                    (c.msgs || []).forEach((m, i) => {
                        if (!m.akt || !els[i] || els[i].querySelector('.ak38c')) return;
                        const st = m.me ? (m.st === 'seen' ? '👁 Koʻrildi' + (m.seenAt ? ' · ' + fmtDateTime(m.seenAt) : '') : m.st === 's' ? '✓ Yetkazildi' : '⏳ Navbatda — server ulanganda yuboriladi') : (m.seenSent ? '👁 Siz koʻrdingiz' : '🆕 Yangi akt');
                        const d = document.createElement('div'); d.className = 'ak38c' + (m.st === 'seen' ? ' seen' : '');
                        d.innerHTML = `<button class="ak38-open" onclick="akt38Open('${escapeHtml(m.akt.id)}','${escapeHtml(m.akt.uid)}')">👁 Aktni ochish</button><small>${escapeHtml(st)}</small>`;
                        els[i].insertBefore(d, els[i].querySelector('.chat-s'));
                    });
                } catch (e) { console.error(e); }
                return r;
            });
        })();

        // ---------- 5) "Sahifani yop", "bo'ldi", "tamom" — AI oynasini yopadi ----------
        var CLOSE38 = /^(yop|yoping|yopgin|yopib qoy\w*|yopib qo\w*|sahifa\w* yop\w*|oyna\w* yop\w*|chat\w* yop\w*|ai\w* yop\w*|suhbat\w* yop\w*|yopil\w*|boldi|bo ldi|bo.?ldi|tamom|tamom boldi|boldi rahmat|rahmat boldi|chiq|chiqib ket|закрой\w*|закрыть|выйди|хватит|всё|все)( (rahmat|iltimos|endi|ai|ey ai))*$/;
        (function () {
            aiSendText = agmkExtend('aiSendText', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', aiSendText, o => function (q) {
                const n = ai38N(q);
                AI38.lastQ = String(q || '');
                if (CLOSE38.test(n)) {
                    aicAdd('user', escapeHtml(String(q).trim()));
                    const t = /[а-яё]/i.test(q) ? 'Хорошо, закрываю.' : 'Xoʻp, yopdim. Kerak boʻlsam — «Salom, Ey AI» deng.';
                    aicAdd('bot', escapeHtml(t));
                    try { aiLiveStop(); } catch (e) {}
                    const fin = () => { try { aicClose(); } catch (e) {} };
                    if (aiVoiceOutputEnabled && (Date.now() < V38.voiceUntil)) { try { speakAiText(/[а-яё]/i.test(q) ? 'Хорошо' : 'Xoʻp', () => setTimeout(fin, 200)); } catch (e) { setTimeout(fin, 600); } setTimeout(fin, 2500); }
                    else setTimeout(fin, 700);
                    return Promise.resolve('');
                }
                return o.apply(this, arguments).then(t => {
                    try {
                        const bots = $id('aiMessages').querySelectorAll('.ai-msg.bot'), el = bots[bots.length - 1];
                        ai38SuggChips(el);
                        const P = AI38.pend;
                        if (P && P.fresh && el) {
                            P.fresh = false;
                            const d = document.createElement('div'); d.className = 'ak38'; d.id = 'ak38_' + P.id;
                            d.innerHTML = P.kind === 'pick' ? P.R.map((p, i) => `<button onclick="akt38PickBtn(${P.id},${i})">${i + 1}) ${escapeHtml(p.name)}</button>`).join('') : yn38Html(`akt38Yes(${P.id})`, `akt38No(${P.id})`);
                            el.appendChild(d); V38.noOffer = Date.now();
                            // Ovoz bilan so'ralgan bo'lsa — javobni ham ovoz bilan kutadi (jonli suhbatda keyingi gap o'zi javob bo'ladi)
                            if (P.kind === 'confirm' && Date.now() < V38.voiceUntil && !(typeof AILIVE !== 'undefined' && AILIVE.on)) {
                                const id = P.id; V38.skipSpeak = Date.now();
                                speakAiText(t + ' Ha yoki yoʻq?', () => { if (!AI38.pend || AI38.pend.id !== id) return; yn38Listen(5000).then(v => { if (!AI38.pend || AI38.pend.id !== id) return; if (v === true) akt38Yes(id); else if (v === false) { akt38No(id); aicAdd('bot', escapeHtml('❌ Yuborish bekor qilindi.')); } }); });
                            }
                        }
                    } catch (e) { console.error(e); }
                    return t;
                });
            });
        })();
        // O'qib beraymi / avtomatik o'qish — tasdiqlash savolida ikki marta gapirmasin
        (function () {
            read38Offer = agmkExtend('read38Offer', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish · Oʼqib beraymi / avtomatik oʼqish — tasdiqlash savolida ikki marta gapirmasin', read38Offer, oR => function () { if (V38.noOffer && Date.now() - V38.noOffer < 3000) { V38.noOffer = 0; return; } V38.noOffer = 0; return oR.apply(this, arguments); });
            speakAiText = agmkExtend('speakAiText', '34-bosqich (v1.8): AI — xatlar, yopish buyruqlari, suhbat, yoʼl-yoʼriq, aktni ichki yozish', speakAiText, oS => function (t) { if (V38.skipSpeak && Date.now() - V38.skipSpeak < 1500 && !/ Ha yoki yoʻq\?$/.test(String(t))) { V38.skipSpeak = 0; const cb = arguments[1]; if (cb) try { cb(); } catch (e) {} return; } return oS.apply(this, arguments); });
        })();

        // Sahifa ochish buyrug'i boshqa bo'limlar javobidan oldin
        function ai38Open(q) {
            const n = ai38N(q);
            if (!/\b(och|ochib ber|ochgin|oching|korsat|kir|ot)\w*\b/.test(n) || n.split(' ').length > 5 || /(qachon|nechta|qaysi|xat|xabar|maktub|otgan|otib|muddat|kimlar|royxat|qancha|\d{3,})/.test(n)) return null; // «o'tganlar», «muddati» — bu maʼlumot soʻrovi, sahifa ochish emas
            try { const a = aiAgent(q); if (a) return { t: a, personal: false }; } catch (e) {}
            return null;
        }
        // "Mening muddatlarim" — mehnat muhofazasi muddatlari
        function ai38MyDeadlines(q) {
            const n = ai38N(q);
            if (!/(mening|menga|ozimning)\b.*\b(muddat\w*)|\bmuddatlarim\b/.test(n)) return null;
            try { const a = mmAnswer('mening muddatlarim mehnat muhofazasi'); if (a) return { t: a, personal: true }; } catch (e) {}
            return null;
        }
        var SYN38 = [[/^\s*(barcha|hamma|butun) vagonlar\s*$/i, "vagonlar ro'yxati"], [/ta[ʻʼ'`’‘]?mirga muhtoj|ta[ʻʼ'`’‘]?mir kerak bo[ʻʼ'`’‘]?lgan|ta[ʻʼ'`’‘]?mirlanishi kerak bo[ʻʼ'`’‘]?lgan|ta[ʻʼ'`’‘]?mirlanishi kerak/gi, "ta'mir talab"]];
        // ---------- 6) Javoblar tartibi: tasdiq → tanlov → yopish → xatlar → suhbat → yuborish → qolganlari ----------
        (function () {
            aiStage('Aktlar, pochta, bildirishnomalar, muddatlar', function (q, next) {
                const fns = [akt38PendAnswer, ai38Pick, ai38Open, ai38Talk, ai38MailOpenRead, ai38Mail, ai38Notif, akt38Ask, ai38MyDeadlines];
                for (const f of fns) { try { const r = f(q); if (r) { V38.lastPersonal = !!r.personal; return r; } } catch (e) { console.error(e); } }
                let q2 = String(q || ''); SYN38.forEach(([re, to]) => { q2 = q2.replace(re, to); });
                const r = next(q2); try { V38.lastPersonal = !!(r && r.personal); } catch (e) {} return r;
            });
        })();

