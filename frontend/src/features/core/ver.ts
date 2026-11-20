
        // =====================================================================
        // v3.0 — Versiya va «Nima yangi»
        // =====================================================================
        var AGMK_VERSION = '7.0', AGMK_BUILD = 150; // har tuzatishlar toʻplami — yangi versiya (4.5, 4.6, 4.7 …), build — har yigʻishda +1
        var AGMK_NEWS = [
            ['🚀', 'AGMK STTB-AIT 7.0', 'Yangi nom va yangi versiya: Avtomatlashtirilgan Intellektual Tizim. Yoʻnalishlar boʻyicha boʻlimlar, har yoʻnalish uchun haftalik rasxod, normalarni hujjat sahifasida tahrirlash, xavfsizlik tuzatishlari — yakuniy kod korxona serveri uchun.'],
            ['📐', 'Normalarni hujjat sahifasida tahrirlash', 'Normativ hujjatlar → «Meʼyor 2026 · 2VS-105» va h.k.: «✏️ Tahrirlash» — miqdorni oʻzgartirish, yangi ehtiyot qism/material qatori, qatorni olib tashlash; «➕ Yangi norma» — yangi tur. Har oʻzgarish sababi bilan tarixda, hisobot tekshiruvi darhol yangi meʼyor bilan ishlaydi.'],
            ['↩️', '«Orqaga» — bir qadam orqaga', 'Dalolatnoma va hujjatlar tayyorlash boʻlimida «‹ Orqaga» (ekrandagi va telefondagi) endi bosh sahifaga emas, bir qadam orqaga qaytaradi: ichki sahifa → yoʻnalish → yoʻnalishlar roʻyxati → bosh sahifa. Telefonda sarlavha «AGMK STTB-AIT» tugmalar orqasida qolmaydi.'],
            ['📂', 'Dalolatnoma va hujjatlar tayyorlash — yoʻnalishlar boʻyicha', 'Boʻlimga kirilganda ICHTB ning 10 ta yoʻnalishi chiqadi. Har yoʻnalishda 3 tugma: «Dalolatnoma tayyorlash» (hujjat yuklash va imzoga yuborish shu ichida), «Hisobotlar», «Haftalik rasxod». Boʻlim faqat ICHTB xodimlari, rahbariyat va administrator uchun.'],
            ['📅', 'Haftalik rasxod — har yoʻnalish uchun alohida', 'Har yoʻnalishning oʻz skladlari va oʻz haftalari tarixi: temir yoʻl harakat tarkibi, lokomotivlar (tortuv agregatlari), temir yoʻl qurilishi, avtomatlashtirish (faqat ШПЗ 221000), teplovozlar. Qoʻlqop, perchatka, sovun, vetosh hech qayerda qoʻshilmaydi. Umumiy skladlar (3330, 3380 va h.k.) alohida satrda koʻrsatiladi.'],
            ['🔒', 'Xavfsizlik — yakuniy tekshiruv', 'SVO davomat va tashqi AI yakuniy koddan olib tashlandi; yuklangan fayllar ilova ichida ishga tushmaydi (faqat yuklab olinadi); server xato tafsilotini foydalanuvchiga koʻrsatmaydi; tashqi manzil oʻchirildi — faqat ichki tarmoq.'],
            ['🏷', 'Yangi nom — AGMK STTB-AIT', 'Ilova endi «AGMK STTB-AIT — Avtomatlashtirilgan Intellektual Tizim» deb ataladi. Barcha maʼlumotlar, akkauntlar va hujjatlar oʻz joyida qoladi.'],
            ['🧾', 'Hisobot tekshiruvi — kir sovun, qoʻlqop xato emas', 'Master hisobotida 1C ga urilgan, lekin spravka-raschetda yoʻq materiallar ШПЗ 221, 222, 08100 dan boshqa boʻlsa (kir sovun, qoʻlqop, respirator) — qizil xato emas, koʻk izoh: tekshirib qoʻying.'],
            ['📅', 'Haftalik achot — faqat ШПЗ 221, 222, 08100', 'Haftalik achot summasiga faqat ШПЗ kodi 221, 222 yoki 08100 bilan boshlanadigan qatorlar kiradi. Qoʻlqop, kir sovun kabi boshqa ШПЗ dagi materiallar hisobga olinmaydi va alohida koʻrsatiladi.'],
            ['📁', 'Qabul qilingan ehtiyot qismlar — MTTB ichida', 'Bosh sahifadan «MTTB — Moddiy-texnik taʼminot» guruhi ichiga koʻchirildi, yangi rasm bilan.'],
            ['🛞', 'Gʻildirak juftliklari — Vagonlar parki ichida', 'Bosh sahifadan Texnika → STTB texnikalari → Vagonlar parki ichiga koʻchirildi, yangi rasm bilan.'],
            ['✍️', 'Imzolangan hujjat oflaynda ham ochiladi', 'Server bilan bir marta ochilgan hujjat (matni, imzolari bilan) shu qurilmada saqlanadi. Server oʻchsa — «📴 Oflayn nusxa» belgisi bilan koʻrish mumkin; imzolash va rad etish — server ulanganda.'],
            ['🔒', 'Hisobot tekshiruvlari — akkauntingiz boʻyicha', 'Oʻzingiz tekshirgan hisobotlar shu akkaunt bilan kirilgan barcha qurilmalarda (planshet, noutbuk, telefon) koʻrinadi. Boshqa akkauntlarga koʻrinmaydi.'],
            ['📁', 'Qabul: rasmlar siqiladi, takroriy SF va narx farqi', 'Katta rasmlar avtomatik siqiladi (server diskini tejaydi). Shu schyot-faktura boshqa dalolatnomada boʻlsa yoki narx oldingilardan 30% dan koʻp farq qilsa — ogohlantiradi. Roʻyxatda 🟢🟡🔴 — papkadagi hujjatlar toʻliqligi.'],
            ['🗂', 'Kod IT ga topshirishga tayyor', 'Ilova va server kodi boʻlimlar boʻyicha tartiblandi, IT uchun hujjatlar yozildi. Administrator tabeli endi kodda emas, server sozlamasida.'],
            ['🛞', 'Gʻildirak juftliklari', 'Yangi boʻlim: har juftlik raqami, turi, oʻlchovlari, oxirgi taʼmiri va qaysi vagonning qaysi oʻqida turgani (2VS-105 — 6 ta, 6VS-60 — 4 ta). Roʻyxat Excel/CSV dan yuklanadi (namuna fayl bor). Vagon pasportida «🛞 Gʻildirak juftliklari» tugmasi — almashtirish va tarix.'],
            ['📁', 'Qabul qilingan ehtiyot qismlar — elektron papka', 'Qabul dalolatnomasi (MTTB kirimidan toʻldiriladi) → komissiya elektron imzolaydi → avtomatik papkaga va yillik hisobotga. Har dalolatnoma — alohida papka: PDF, schyot-faktura, sertifikat, nakladnoy, foto hisobot. Yillik hisobot: oylar, mahsulotlar, yetkazib beruvchilar; Excel va rahbarga PDF.'],
            ['🔒', 'Yopiq kontur — doimiy', 'Ilova faqat korxona serveri va ichki tarmoq bilan ishlaydi: tashqi AI, internet xaritalari va boshqa tashqi xizmatlar koddan olib tashlandi; tashqi manzilga har qanday murojaat bloklanadi. Xarita fonlari — korxona serveridan (boʻlmasa toʻq fon, ustida sxema va GPS).'],
            ['🧾', 'Hisobot tekshiruvi: 1C ga urilgan, spravkada yoʻq', 'Forma-30 da master skladiga urilgan har bir talabnoma spravka-raschetda bormi — tekshiriladi. Yoʻq boʻlsa ❌ qizil xato: talabnoma raqami, materiallar, summa va ШПЗ bilan (boshqa ШПЗ bilan urilgani ham). Oxirida — jami nechta talabnoma va necha soʻm.'],
            ['⛰️', 'Ruda tashish — sof ruda 38 mln t, vskrysha 13 mln t', 'Ishlab chiqarish koʻrsatkichlari → Ruda tashish: sof ruda salohiyati yiliga 38 mln t (→ KKD) yil, oy, kunga taqsimlanadi, taʼmirdagi vagonlar ayiriladi; 36 dan kam boʻlsa ogohlantirish. Vskrysha (ustki boʻsh qatlam) → Nakpaysay — 13 mln t, jami 51 mln t. Avval ~58 mln t chiqardi. Har yil uchun «✏️ Oʻzgartirish».'],
            ['📞', 'Xodimga qoʻngʻiroq', 'Xodim pasportida «📞 Qoʻngʻiroq»: raqam korxona serveridan olinadi va telefonning qoʻngʻiroq oynasi raqam terilgan holda ochiladi. Ilova faylida raqam saqlanmaydi; koʻradi — admin, kadrlar, rahbariyat, oklad roli.'],
            ['🏠', 'Bosh sahifa — yangi tepa qism', 'Tepada ↶ ↷, ⓘ Maʼlumot, 🔔, ⋮. Banner ichida, F.I.Sh. ostida — Chat, Vazifalar, Nosozlik, Yuklangan, Qidiruv, Skaner tugmalari. «Qidiruv» bosilsa — banner ostida qidiruv maydoni. Kompyuterda tugmalar oʻngda 3 × 2, kartochkalar 3 ustun, Ctrl+K — qidiruv.'],
            ['🎨', 'Ikki yangi dizayn: STTB Klassik 2 va Vitrina 2', 'Parametrlar → Dizayn mavzusi. Orqada butun ekranda bitta toʻq koʻk «poligon» rasm, ustida shaffof shisha kartochkalar — barcha sahifalarda shu bitta rasm.'],
            ['🏷', 'QR yorliqlar — A4 da 35 tadan', 'Roʻyxatni yuklash → Ustunlar → «🏷 Faqat QR»: har biri 4 × 4 sm, 5 × 7 joylashuv, qirqish chiziqlari bilan, bitta PDF. Vagon pasporti PDF ida ham QR kod; qaysi maʼlumot chiqishini belgilab tanlash («Komissiya uchun qisqa» va boshqalar).'],
            ['✉️', 'Shikoyat va takliflar adminga yetib boradi', 'Xabar korxona serveriga yoziladi; faqat administrator va rahbar koʻradi, yuboruvchi — oʻz xabari holatini («Qabul qilindi» / «Koʻrib chiqildi»).'],
            ['🏬', 'Hisobot tekshiruvi — skladlarni tanlash', 'Odatda ilova skladlarni oʻzi aniqlaydi. Kerak boʻlsa — «🏬 Skladlar: tanlash»: Forma-30 dagi skladlar Excel filtri kabi roʻyxat (qator soni va summa bilan).'],
            ['📡', 'GPS demo — tezlik va vagonlar', 'Tezlik: ⏸ · 0,5× · 1× · 2× · 3×. Lokomotiv yaqinlashtirilsa — vagonlari tartib bilan orqasidan; juda yaqinda xarita kulrang boʻlib qolmaydi.'],
            ['📷', 'Server QR — jonli skaner', 'Parametrlar → Server: «📷 QR kodni skanerlash» endi ilovaning jonli skanerini ochadi (kamera QR ni oʻzi taniydi).'],
            ['🧹', 'Tozalash', 'Suv belgisi olib tashlandi; Struktura orqasidagi shaffof qoramtir oynalar yoʻq; Buxgalteriya va Iqtisodiyot sahifalarida anʼanaviy kartochka va sarlavha; «Kamchilik» → «Nosozlik».']
        ];
        function verNews() {
            const E = escapeHtml;
            mdl('verModal', `<div class="px-h"><b>🆕 AGMK STTB-AIT ${AGMK_VERSION} — nima yangi</b><button class="mini-btn" onclick="mdlClose('verModal')">✕</button></div>
                ${AGMK_NEWS.map(n => `<div class="ver-n"><span>${n[0]}</span><div><b>${E(n[1])}</b><small>${E(n[2])}</small></div></div>`).join('')}
                <div class="nd-tip">Versiya ${AGMK_VERSION} (${AGMK_BUILD}). Maʼlumotlaringiz yangilashda saqlanadi.</div>`, true);
        }
        (function () {
            const c = document.createElement('style'); c.textContent = '.ver-n{display:flex;gap:10px;padding:8px 2px;border-bottom:1px solid rgba(255,255,255,.07)}.ver-n>span{font-size:22px}.ver-n b{display:block;color:#f8fafc;font-size:14px}.ver-n small{color:#94a3b8;font-size:12.5px;line-height:1.35}.ver-foot{text-align:center;color:#64748b;font-size:12px;margin:14px 0 4px;cursor:pointer}';
            document.head.appendChild(c);
            const wk = $id('set-theme-sub') && $id('set-theme-sub').closest('.btn-card');
            if (wk && !$id('verFoot')) { const d = document.createElement('div'); d.id = 'verFoot'; d.className = 'ver-foot'; d.onclick = verNews; d.textContent = 'AGMK STTB-AIT · versiya ' + AGMK_VERSION + ' · 🆕 nima yangi'; wk.parentNode.appendChild(d); }
            // Yangilangandan keyin birinchi kirishda — bir marta «nima yangi»
            let had = false; try { had = !!localStorage.getItem('agmk_accounts') || !!localStorage.getItem('agmk_db_v2'); } catch (e) {} // yangi o'rnatishda emas — yangilanganda
            try { if (typeof SEC_EV !== 'undefined') SEC_EV.fns.push(function verOnce() { let s = ''; try { s = localStorage.getItem('agmk_ver_seen') || ''; } catch (e) {} if (s === AGMK_VERSION) return; try { localStorage.setItem('agmk_ver_seen', AGMK_VERSION); } catch (e) {} if (had) setTimeout(verNews, 1200); }); } catch (e) {}
        })();

