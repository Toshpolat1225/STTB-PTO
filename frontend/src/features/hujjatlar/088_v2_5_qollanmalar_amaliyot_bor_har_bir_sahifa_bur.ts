        // =====================================================================
        // v2.5 — ℹ️ QO'LLANMALAR: amaliyot bor har bir sahifa burchagida kichik ℹ️ tugma → batafsil qo'llanma
        // =====================================================================
        var HELP = {
            hisob: { t: '📊 Hisobot (achot) tekshiruvi', b: `
<p><b>Nima qiladi:</b> xodimning oylik hisoboti (Spravka-raschet, Ведомость, лимитка, наряд, lom) Forma-30 va normativlar bilan solishtiriladi. Hisob-kitobni <b>formulalar</b> qiladi, AI faqat yordamchi. Yakuniy qarorni xodim tasdiqlaydi.</p>
<h4>1. Bitta xodimning hamma fayllarini birga yuboring</h4>
<ol><li>«📊 Hisobotlar» → kerakli toifa → <b>«📦 Oylik toʻplamni tekshirish» → «📂 Fayllarni tanlash (bir nechta)»</b>.</li>
<li>Fayl tanlash oynasida <b>bir nechta faylni birga</b> belgilang (birinchisini uzoq bosib turing, soʻng qolganlarini belgilang): Forma-30, Справка-расчет (Лимитка), Дефектная ведомость, metallolom akti, naryad, norma — qaysi biri bor boʻlsa.</li>
<li>«📦 Oylik toʻplamni tekshirish» oynasida ilova har bir varaqning turini oʻzi aniqlab koʻrsatadi. Notoʻgʻri boʻlsa — yonidagi roʻyxatdan turini oʻzgartiring; keraksiz varaq — «tekshiruvga kirmaydi».</li>
<li><b>OY</b> (masalan 2026-08) va solishtirish uchun <b>Forma-30</b> ni tekshiring → «✅ Tekshirishni boshlash».</li></ol>
<p>Bitta fayl boʻlsa — «📤 Hisobot faylini yuklash» ham ishlaydi.</p>
<h4>2. Natijani oʻqish</h4>
<ul><li>❌ <b>Qizil</b> — aniq xato: fakt Forma-30 dagidan koʻp, normadan oshgan, jami notoʻgʻri, DV dagidan koʻp.</li>
<li>🔷 <b>Koʻk</b> — tekshirib koʻring: nomi farq qiladi (masalan «Патрубок/ПАТРУБОК»), boshqa ШПЗ dagi qator, oy mos emas.</li>
<li>Har bir topilma yonida: qaysi fayl, qaysi qator, qancha farq va qanday hisoblangani (formula) yoziladi.</li></ul>
<h4>3. Ogohlantirishlar</h4>
<ul><li>⚠️ <b>«Spravka-raschet yuklanmagan — solishtirish uchun asos yoʻq»</b> — paketda spravka yoʻq: faqat qolgan fayllar oʻzaro solishtiriladi. Spravkani qoʻshib qayta yuboring.</li>
<li>⚠️ <b>«Oy boʻsh»</b> — faylda oy/sana topilmadi yoki qatorlar boʻsh: Forma-30 bilan qaysi oy solishtirilayotganini tekshiring.</li></ul>
<h4>4. Ustunlarni tanlash oynasi</h4>
<p>Ilova jadval sarlavhasini topa olmasa — ustunlar oynasi chiqadi. Namunada <b>sarlavha qatorini bosing</b>, soʻng «Nomi», «Miqdor», «Summa» ustunlarini tanlang. Tanlov shu shakldagi fayllar uchun <b>eslab qolinadi</b> — keyingi safar soʻralmaydi.</p>
<h4>5. Yakunlash</h4>
<p>«🖍 Belgilangan PDF» — xatolar belgilangan nusxa; «📊 Natija — Excel» — hamma topilmalar jadvali. Tekshiruv saqlanadi va jurnalda kim, qachon koʻrgani yoziladi.</p>` },
            ustun: { t: '🧭 Ustunlarni tanlash', b: `<p>Jadval sarlavhasi avtomatik topilmaganda chiqadi.</p><ol><li>Pastdagi namunada <b>sarlavha qatorini</b> (Наименование, Кол-во ... yozilgan qator) bosing.</li><li>Har bir maydon uchun mos ustunni tanlang: <b>Nomi</b>, <b>Birlik</b>, <b>Miqdor</b>, <b>Narx</b>, <b>Summa</b>. Kerak boʻlmagani boʻsh qolishi mumkin.</li><li>«Davom etish» — tanlov shu shakl uchun eslab qolinadi.</li></ol><p>Agar fayl hisobotga aloqasi yoʻq boʻlsa — «Bekor» ni bosing.</p>` },
            f30: { t: '📗 Forma-30 yuklash', b: `<ol><li>«📊 Hisobotlar» → toifa → <b>«📥 Yangi oy Forma-30 ni yuklash (Excel)»</b> (administrator yoki «Hisobotlar» roli).</li><li>Yuklangan Forma-30 boʻlimda saqlanadi, oldingilari «🗂 Tarix» da turadi (kim, qachon yuklagani bilan).</li><li>Kerak boʻlsa «OMBORLAR» maydoniga ombor raqamlarini yozing — Forma-30 dan faqat shu omborlar olinadi.</li><li>Shundan keyin hisobotlar Forma-30 bilan solishtiriladi: nomenklatura, miqdor, ШПЗ.</li></ol><p>💡 Forma-30 ni hisobot paketi bilan <b>birga</b> ham yuborish mumkin — ilova uni oʻzi ajratadi.</p>` },
            akt: { t: '📄 Dalolatnoma (akt) tuzish', b: `<ol><li>«📄 Dalolatnomalar» → kerakli akt toifasini tanlang (har kartada nechta akt borligi yozilgan).</li><li>Yangi akt tuzing yoki pasportdan / «📸 Eslatma albomi» dan «📄 Dalolatnoma tuzish» ni bosing — vagon maʼlumotlari oʻzi qoʻyiladi.</li><li>Sana, komissiya va matnni tekshirib tahrirlang.</li><li>Saqlangan akt arxivda turadi; PDF/Word qilib yuklash yoki yuborish mumkin.</li></ol><p>Shablonlar (kolodka, gʻildirak ...) namunalaringiz kelgach qoʻshiladi.</p>` },
            rasmakt: { t: '🤖 Rasmdan akt', b: `<ol><li>Pasport → «📸 Eslatma albomi» ga nosozlik rasmlarini qoʻshing.</li><li>Kerakli rasmlarni belgilang → <b>«🤖 AI: rasmdan akt»</b>.</li><li>AI rasmdagi nosozlikni tavsiflaydi va akt qoralamasini tuzadi (internet va AI kaliti kerak; rozilik soʻraladi).</li><li><b>Hamma matnni oʻzingiz tekshirasiz</b> — AI taxmin qilgan joylar belgilangan. Soʻng saqlang.</li></ol><p>🔒 Rasmda odamlarning yuzi/shaxsiy maʼlumotlari boʻlmasin.</p>` },
            pasport: { t: '📋 Pasportni toʻldirish', b: `<ul><li><b>Toʻliqlik chizigʻi</b> — qaysi asosiy maydonlar boʻshligini koʻrsatadi.</li><li><b>✏️ Toʻldirish</b> — qoʻlda tahrirlash oynasi.</li><li><b>📸 Rasmdan toʻldirish</b> — qogʻoz pasport yoki kartochkani suratga oling. AI rasmni <b>2 marta</b> oʻqiydi; ikki oʻqishda bir xil chiqqan qiymatlargina taklif qilinadi. Roʻyxatda har birini belgilab tasdiqlaysiz. Asosiy maydonlar (inventar, yil, seh, taʼmir sanalari) va kartoteka (model, ishlab chiqaruvchi, oxirgi KR, xizmat muddati, texnik yechim №) toʻldiriladi. Saqlanganlar yonida <b>«📸 rasmdan (sana)»</b> belgisi turadi.</li><li><b>Excel'dan koʻplab</b> — Parametrlar → Pasportlarni toʻldirish: raqam boʻyicha moslab, faqat boʻsh maydonlarni toʻldiradi.</li></ul>` },
            tarkib: { t: '🚃 Tarkib tuzish', b: `<ol><li>«Harakat tarkibi» → «Yangi tarkib» yoki mavjud tarkibni tahrirlash.</li><li>Lokomotivni tanlang, soʻng vagonlarni belgilang. Qidiruvga raqamni <b>boʻlaklab</b> ham yozish/aytish mumkin: «363 46 756», «3 ta nol 24 85» — ilova oʻzi birlashtiradi va «🔎 … → …» deb koʻrsatadi.</li><li>Tarkib rasmida vagonni bosib tanlang: «◀ Oldinga» / «Orqaga ▶» — oʻrnini surish, «✕ Chiqarish» — olib tashlash.</li><li>Taʼmirdagi yoki boshqa tarkibdagi vagonni tanlab boʻlmaydi (sababi yonida yozilgan).</li></ol>` },
            gps: { t: '📡 Harakat tarkibi · GPS (demo)', b: `<ul><li><b>DEMO</b> — sunʼiy harakat; bazaga hech narsa yozilmaydi. Haqiqiy GPS ulanganda shu koʻrinish ishlatiladi.</li><li>Tarkiblar faqat sxemadagi yoʻllar boʻylab yuradi. <b>Blok tizimi:</b> bir yoʻlga qarama-qarshi yoʻnalishda kirilmaydi — biri stansiyada kutadi (⛔), ikkinchisi oʻtadi.</li><li>Yaqinlashtiring: nuqta → tarkib chizigʻi → lokomotiv va vagonlar raqamlari bilan. Vagonni bossangiz — pasporti ochiladi.</li><li>«+N tarkib» — stansiyada navbatdagilar; bossangiz roʻyxat.</li><li>Svinsovaya — teplovozga ulangan sisterna tarkiblari, 4-TYS — xopper-dozator va platformalar (turibdi).</li><li><b>📐 Sxema / 🛰 Real</b>: Real — sputnik surat ustida temir yoʻl (sxema joyga bogʻlangan boʻlishi kerak). Sxemani «xira» yoki «yashirin» qilish mumkin.</li><li>Stansiyani bosib varaq ochish — «Temir yoʻl xaritasi» boʻlimida.</li></ul>` },
            navi: { t: '🧭 Avtotraktor navigatori', b: `<ul><li>Texnikani tanlang — xarita unga ergashadi.</li><li>Chiziq — <b>faqat bosib oʻtilgan yoʻl</b>, tezlikka qarab rangli (yashil &lt;20, sariq 20–35, toʻq sariq — chegaragacha, qizil — chegaradan oshgan).</li><li>⏸ — <b>3 daqiqadan uzoq toʻxtashlar</b>: vaqti va davomiyligi (08:12–08:26 · 14 daqiqa).</li><li>Kun vaqt chizigʻi: harakat va toʻxtashlar ketma-ket, joy — eng yaqin maʼlum obyekt nomi (boʻlmasa koordinata). Bosilsa — xaritada koʻrsatadi.</li><li>📅 Sana tanlab oldingi kunlarni koʻrish; 📄 PDF / 📊 Excel — kunlik hisobot.</li><li>🔒 Koordinatalar hech qanday tashqi marshrut xizmatiga yuborilmaydi.</li></ul>` },
            paket: { t: '📦 Holat paketi (.agmk)', b: `<ol><li><b>Yaratish</b> (admin): Parametrlar → «Holatni koʻchirish paketi» → nimalar kirishini belgilang → parol qoʻying → .agmk fayl.</li><li>Faylni Telegram/ShareIt orqali yuboring; <b>parolni alohida</b> (ogʻzaki yoki boshqa kanal) ayting.</li><li><b>Ochish</b>: Parametrlar → «Paketni ochish» → faylni tanlang → parol. Maʼlumotlar id boʻyicha birlashtiriladi.</li></ol><p>🔒 AES-256 bilan shifrlanadi. Parollar va AI kaliti hech qachon paketga kirmaydi.</p>` },
            formula: { t: '🧮 Formulalar', b: `<ul><li>Buxgalteriya/normativ formulalari: nomi, ifoda (masalan <code>miqdor * narx * 1.12</code>), oʻzgaruvchilar izohi.</li><li>Formulani oching — qiymatlarni kiriting, natija formula boʻyicha darhol chiqadi (AI hisoblamaydi). «📊 Excel» — natijani yuklab olish.</li><li>Yangi formula — «＋ Yangi formula», oʻzgartirish — «✏️ Tahrirlash», «💾 Saqlash». Xato ifoda saqlanmaydi.</li><li>Formulalarni AI yordamchisi ham ishlatadi — lekin raqamni formula hisoblaydi.</li></ul>` },
            cal: { t: '📍 Sxemani joyga bogʻlash', b: `<ol><li>Ekran ikkiga boʻlingan: <b>tepada sxema</b>, <b>pastda sputnik</b>.</li><li>Tepada aniq nuqtani bosing (stansiya binosi, strelka, koʻprik). Stansiya tugmalari sxemani oʻsha joyga olib boradi.</li><li>Pastda xuddi shu joyni sputnik suratda bosing (yoki «🚉 OSM stansiyalari» — belgini bosib tanlang; tasdiqlash sizda).</li><li>«✅ Juftlikni saqlash». <b>2 ta</b> juftlik yetadi, <b>3 ta</b> aniqroq: har biri uchun farq (±m) chiqadi. Farqi katta (qizil) juftlikni oʻchirib qayta qoʻying.</li><li>Uchlarini sxemaning turli chetlaridan tanlang (masalan Qalmoqqir, Kolsevaya, Izvestkovaya).</li></ol><p>🔒 Sxema hech qayerga yuklanmaydi.</p>` },
            ai: { t: '🤖 AI sozlamasi', b: `<ul><li><b>Ichki AI</b> — internetsiz, ilova bazasi boʻyicha javob beradi.</li><li><b>Internetli AI</b> — kalit kerak (Google Gemini yoki Claude). Kalit faqat shu telefonda saqlanadi, hech qayerga yozilmaydi.</li><li><b>Internetdan qidirish</b> — ob-havo, yangiliklar kabi savollarga manba bilan javob.</li><li><b>Tezkor rejim</b> — tezroq, qisqaroq javob.</li><li>AI ilova parametrlarini oʻzgartira olmaydi. MM hujjatlari va xodimlarning shaxsiy maʼlumotlari AI ga yuborilmaydi.</li></ul>` }
        };
        function helpOpen(k) {
            const h = HELP[k]; if (!h) return;
            mdl('helpModal', `<div class="px-h"><b>ℹ️ ${escapeHtml(h.t)}</b><button class="mini-btn" onclick="mdlClose('helpModal')">✕</button></div><div class="help-body">${h.b}</div>`, true);
            const m = $id('helpModal'); if (m) m.style.zIndex = 10050;
        }
        function helpBtn(k, cls) { return `<button type="button" class="help-i${cls ? ' ' + cls : ''}" data-hk="${k}" onclick="event.stopPropagation(); helpOpen('${k}')" title="Qoʻllanma">ℹ️</button>`; }
        var HELP_RULES = [
            ['#hpModal .px-h', 'hisob'], ['#hsMapModal .px-h', 'ustun'], ['#fxModal .px-h', 'formula'], ['#psModal .px-h', 'pasport'],
            ['#bnModal .px-h', 'paket'], ['#aiCfgBody', 'ai', 'top'], ['#hrModalBody', 'tarkib', 'top'], ['#alb-box .passport-title', 'rasmakt'],
            ['#screen-vagon-pasport .ps-bar .ps-h', 'pasport'], ['#nvView .nv-top', 'navi'], ['#bnCardE .btn-text', 'paket'],
            ['#screen-hisob .sec-body', () => (typeof HS !== 'undefined' && HS.tab === 'akt') ? 'akt' : 'hisob', 'top']
        ];
        function helpScan() {
            HELP_RULES.forEach(([sel, k, pos]) => {
                const el = document.querySelector(sel); if (!el) return; const key = typeof k === 'function' ? k() : k;
                const ex = el.querySelector(':scope > .help-i, :scope > .help-top .help-i');
                if (ex) { if (ex.getAttribute('data-hk') === key) return; (ex.closest('.help-top') || ex).remove(); }
                if (pos === 'top') { const d = document.createElement('div'); d.className = 'help-top'; d.innerHTML = key === 'hisob' ? helpBtn('hisob') + helpBtn('f30', 'sm') : helpBtn(key); el.insertBefore(d, el.firstChild); }
                else { const close = el.querySelector(':scope > .mini-btn:last-child'); const tmp = document.createElement('span'); tmp.innerHTML = helpBtn(key); const b = tmp.firstChild; if (close) el.insertBefore(b, close); else el.appendChild(b); }
            });
        }
        (function () {
            let pend = false;
            const run = () => { pend = false; try { helpScan(); } catch (e) {} };
            try { new MutationObserver(ms => { if (pend) return; if (ms.every(m => m.target && m.target.closest && m.target.closest('.leaflet-container'))) return; pend = true; setTimeout(run, 300); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
            setTimeout(run, 1500);
        })();

