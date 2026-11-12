# Hisobot tekshiruvi — amaldagi tartib (5.2 holatiga, 28.10.2026)

> Bu hujjat ilova kodidan yozildi: ilova **hozir aynan shunday ishlaydi**. Muallif koʻrib chiqadi: toʻgʻri boʻlsa — oʻz holicha qoladi, oʻzgartirish kerak boʻlsa — aytadi va qoidaga qoʻshiladi.
> Oxirida — **ochiq savollar** (har biriga taklif qilingan javob bilan).

---

## 1. Umumiy tamoyillar

1. **Hisob — faqat formula bilan**, telefonning oʻzida. AI hisoblamaydi va qaror qilmaydi.
2. Fayllar, narx va summalar **tashqariga yuborilmaydi** (bitta istisno bor — 9-savol).
3. Har bir topilma **manbasi bilan** chiqadi: *fayl › varaq › qator*.
4. Topilmalar uch darajada:
   - ❌ **qizil** — aniq xato (pulga yoki hujjatga taʼsiri bor);
   - 🔷 **koʻk** — tekshirish kerak (xato boʻlishi mumkin);
   - ℹ️ **maʼlumot** — ogohlantirish.

   Bulardan tashqari 🟠 **yashirilgan qatorlar** alohida boʻlimda koʻrsatiladi (xato emas).
5. **Oxirgi soʻz — tekshiruvchi xodimda**: u har topilmani ✅ «Tasdiqlandi (xato)» yoki ✖ «Xato emas» deb belgilaydi.
6. Kim tekshira oladi: administrator yoki «Hisobotlar» huquqi berilgan xodim.

## 2. Qayerda va qanday boshlanadi

«📊 Dalolatnoma va hisobotlar» → **Hisobotlar** → tur tanlanadi: 🚃 Vagonlar · 🚗 Avtopark · 🚂 Teplovozlar · ⚡ Elektrovozlar va h.k.

Tur ichida ikki narsa bor:

1. **📋 Forma-30 (norma shabloni)** — oyma-oy yuklanadi (1C dan Excel). Har yuklashda tarix saqlanadi: kim, qachon, nechta qator, summa. «Omborlar» filtri bor: Forma-30 dan faqat koʻrsatilgan omborlar olinadi.
2. **🔍 Hisobotni tekshirish** — usta olib kelgan fayl(lar) yuklanadi. Turlari: Excel, Word, PDF yoki rasm.
   - **Bir nechta fayl** yoki ichida spravka / defekt vedomost / naryad / lom akti boʻlgan Excel → **📦 Oylik toʻplam tekshiruvi** (3-boʻlim).
   - **Bitta oddiy roʻyxat** (material, miqdor, summa) → **oddiy tekshiruv** (4-boʻlim).

## 3. 📦 Oylik toʻplam tekshiruvi (ustaning bir oylik hujjatlari birga)

**Tekshiruv zanjiri:** Defekt vedomost (ВУ-22) → Talabnoma (Требование) → Forma-30 → Spravka-raschet (limitka) → Normalar → Metallolom akti → Naryad.

### 3.1. Varaqlarni tanish (avtomatik, xodim oʻzgartira oladi)

| Varaq | Qanday taniladi (sarlavhadagi soʻzlar) |
|---|---|
| Forma-30 | «Требование» + «Номенклатура» + «Количество» |
| Spravka-raschet | «Справка-расчет» + «№ треб.» |
| Defekt vedomost | «Дефектная ведомость» |
| Metallolom akti | «Разбраковка» + «износ» |
| Naryad | «Наряд» + «Норма на штуку» |
| Normalar | «Нормы … расхода» yoki «Наименование / Ед.изм / Кол-во» (narxsiz), oʻzbekcha «Меъёри / Номланиши / Бирлиги» |

- Ekranda har varaq turi koʻrsatiladi; notoʻgʻri boʻlsa — xodim tanlaydi.
- **Oy** spravkalardagi oydan taxmin qilinadi (eng koʻp qator qaysi oyda boʻlsa). Xodim oʻzgartira oladi.
- **Forma-30**: toʻplam ichida boʻlsa — oʻsha; boʻlmasa — boʻlimda saqlangan, shu oyniki.

### 3.2. Spravka-raschet — ichki hisob va Forma-30 bilan solishtirish

Har spravka blokidan olinadi:
- oy, Вид операции, Склад, Цех, ШПЗ;
- sarlavhadan: taʼmir turi (KR / DR / TR), obyekt (2ВС-105, xopper…), vagon raqamlari;
- har qator: nom, birlik, talabnoma №, 1 birlik normasi, N birlik normasi, Факт.

Qoidalar:

1. **Boshqa oy bloki** → ℹ️. Solishtirilmaydi.
2. **Vagonlar soni**: sarlavhadagi vagonlar soni ≠ «на N ед.» → 🔷 (KR dan tashqari).
3. **Norma ustuni**: `1 birlik × N` ≠ yozilgan N-birlik normasi → Факт bor boʻlsa ❌, boʻlmasa 🔷.
4. **Normadan oshish**: Факт > norma → ❌.
5. **Talabnoma № yoʻq**, lekin Факт bor → 🔷 (Forma-30 bilan solishtirib boʻlmaydi).
6. **Forma-30 bilan solishtirish.** Talabnoma № boʻyicha qidiriladi: shu sex skladi, shu ШПЗ, «Погрешность» qatorlarisiz. Nomlar soʻz oʻzagi va raqamlar boʻyicha solishtiriladi. Natijalar:
   - miqdor teng → xato yoʻq;
   - **Факт ≠ Forma-30** → ❌, farq soʻmda (oʻrtacha narx bilan). Farqqa teng qator boshqa talabnomada boʻlsa — shu haqda maslahat;
   - **nomi boshqa, miqdor teng** → 🔷 «bir xil material ekanini tasdiqlang»;
   - **boshqa oʻlcham / nom chiqarilgan** → ❌;
   - **talabnoma boshqa sklad (sex)da** → ❌;
   - **Forma-30 da topilmadi** → ❌ (shu sex va ШПЗ dagi oʻxshashlari koʻrsatiladi);
   - **ШПЗ mos emas** → ❌. Istisno: spravkada `222182`, Forma-30 da guruh kodi `222000` boʻlsa — 🔷 «guruh kodi bilan chiqarilgan». Sozlamada «qatʼiy» qilinsa — ❌.
7. **Spravka blokidagi ШПЗ Forma-30 da umuman yoʻq** → ❌.
8. **Forma-30 da bor, hech bir spravkaga kirmagan** (shu sex + ШПЗ) → 🔷 «boshqa spravkaga tegishli boʻlsa — oʻsha faylni yuklang».

### 3.3. Tasdiqlangan norma (📐 «Tasdiqlangan normalar» boʻlimi)

- Normalar fayldan yuklanadi va ilova ichida tahrirlanadi (tarix bilan). Turi (2ВС-105, 6ВС-60, xopper, sisterna, platforma, gʻildirak, elektrovoz), KR/DR va yili sarlavhadan olinadi.
- Spravka yiliga mos norma olinadi. Shu yilniki yoʻq boʻlsa — eng yaqin oldingi yilniki (⚠️ belgisi bilan).
- Qoidalar:
  - spravkadagi **1 birlik normasi > tasdiqlangan** → Факт bor boʻlsa ❌, boʻlmasa 🔷;
  - **Факт > tasdiqlangan × N** → ❌;
  - **kam boʻlsa — hech narsa** (xato emas);
  - **nom normada aniq topilmasa** → 🔷 «🔗 Moslashtirish»: bir marta bogʻlanadi, keyin eslab qolinadi;
  - «Normada yoʻq» deb belgilangan material chiqarilgan boʻlsa → 🔷.
- Oʻlchov birligi: kg ↔ t aylantiriladi. Normada oraliq boʻlsa («5/0,6-1») — eng katta qiymat olinadi.

### 3.4. Defekt vedomost ↔ spravka

1. Vagonlar zavod № va taʼmir turi boʻyicha bogʻlanadi.
2. Spravkadagi vagon uchun **defekt vedomost yuklanmagan** → 🔷. Solishtirish faqat borlari boʻyicha.
3. **Spravka Факт > defekt vedomostlar jami** → ❌ «asoslanganidan koʻp chiqarilgan».
4. **Spravka Факт < defekt vedomostlar jami** → 🔷 «qolgani b/u qism bilan almashtirilganmi».
5. **Faqat defekt vedomostda bor** material → 🔷.
6. **Spravkalararo oʻtish**: bir spravkada +X, boshqasida −X (jami 0) → 🔷 «boshqa spravkaga yozilgan — toʻgʻri spravkaga oʻtkazing».
7. **Spravkasiz vagonlar** (defekt vedomosti bor, spravkada yoʻq) → 🔷.
8. **«Группа работ»**: ehtiyot qism odatda boshqa guruhda boʻlsa → 🔷. «Xato emas» desangiz, bu guruh eslab qolinadi.
9. **«Время окончания ремонта»** sanasi aniq yozilgan boʻlsa → vagon pasportidagi DR yoki KR sanasiga **avtomatik** yoziladi (bir marta). «↩ Bekor qilish» mumkin. Sana taxmin qilinmaydi: noaniq boʻlsa kiritilmaydi va sababi koʻrsatiladi.

### 3.5. Metallolom akti

1. Har qator: `soni × 1 dona vazni × (1 − eskirish %)` ≠ umumiy vazn (0,006 kg dan ortiq) → ❌. Qaysi foizga toʻgʻri kelishi ham aytiladi.
2. **ИТОГО ≠ qatorlar yigʻindisi** → ❌.
3. **Xulosadagi kg ≠ ИТОГО** → ❌.
4. **Poʻlat list**: aktdagi kg ≠ spravkalardagi Факт → 🔷.
5. **Ehtiyot qismlar (dona)**: spravkada almashtirilgan (Факт, «зап.» guruhi) ↔ aktdagi soni → 🔷.
   - Aktda topilmasa → 🔷.
   - Metall boʻlmaganlar (rezina, boʻyoq, moy, lampa…) hisobga olinmaydi.

### 3.6. Naryad

1. **Годных > Задано** → ❌.
2. **Norma vaqti**: `годных × норма на штуку` ≠ yozilgan (0,011 dan ortiq) → ❌.
3. **Ish haqi**: `годных × расценка` ≠ начислено (0,021 soʻmdan ortiq) → ❌.
4. **Н вр. jami ≠ qatorlar yigʻindisi** (0,05 dan ortiq) → ❌.
5. Н вр. ga **soatbay qatorlar** (haydovchi, usta) qoʻshilgan → 🔷: ular bilan va ularsiz bajarilish foizi koʻrsatiladi.
6. **Bajarilish %** ≠ `Н вр. ÷ Ф вр. × 100` → ❌.
7. **«Утверждаю к оплате» ≠ qatorlar yigʻindisi** (0,5 soʻmdan ortiq) → ❌.
8. **Soatiga ish haqi** ≠ `toʻlov ÷ Ф вр.` → 🔷.
9. **Naryad ↔ spravka (DR vagonlari)**: birida bor, boshqasida yoʻq → 🔷.

### 3.7. Boshqa

- **Yashirilgan qatorlar** (Excel'da yashirilgan, chop etilmaydi): asosiy tekshiruvga **kirmaydi**, 🟠 boʻlimda roʻyxat boʻlib chiqadi. Sarlavha, jami va blok boshi qatorlari yashirilgan boʻlsa ham olinadi.
- **Spravka yuklanmagan** yoki **oy koʻrsatilmagan** → ogohlantirish (ham oynada, ham natijada).
- **Forma-30 yoʻq** → ℹ️ «faqat ichki hisob va oʻzaro moslik tekshirildi».
- **Elektrovoz** (ПЭ2М) uchun qoʻshimcha qoidalar bor:
  - ТО-2/ТО-3/ТР/КР normalari ilova ichida;
  - elektrod va ГСМ limitlari;
  - lom bazasidagi 1 dona vazni;
  - hujjatlardagi taʼmirlar soni bir xilligi.

## 4. Oddiy tekshiruv (bitta roʻyxat fayli)

1. Ustunlar avtomatik aniqlanadi (nomenklatura raqami, nomi, birlik, miqdor, narx, summa, talabnoma, ombor). Xodim **tasdiqlaydi** yoki oʻzgartiradi.
2. **Miqdor × narx ≠ summa** → ❌. Ruxsat etilgan farq: 1 soʻm yoki summaning 0,05 % (qaysi katta boʻlsa).
3. **Bir xil qator takrorlangan** (hujjat + material + miqdor + narx + summa + ombor) → 🔷.
4. **«Jami» ≠ qatorlar yigʻindisi** → ❌.
5. Forma-30 bilan (nomenklatura raqami, boʻlmasa nomi boʻyicha):
   - **Forma-30 da yoʻq material** → ❌;
   - **hisobotda koʻp** → ❌;
   - **hisobotda kam** → 🔷;
   - **miqdor teng, summa farq** → ❌;
   - **narx farq** (0,5 % dan ortiq) → 🔷;
   - **oʻlchov birligi farq** → 🔷;
   - **Forma-30 da bor, hisobotda yoʻq** → 🔷. 25 tadan koʻp boʻlsa — bitta umumiy topilma va «Omborlar filtrini kiriting» maslahati;
   - «Погрешность» qatorlari hisobga olinmaydi.

## 5. Natijadan keyin

1. Har topilma: ✅ **Tasdiqlandi** yoki ✖ **Xato emas** (kim, qachon — tarixga yoziladi).
2. **📝 Zamechaniya PDF** — hisobot egasiga. Faqat tasdiqlangan xatolar, manbasi bilan.
3. **🔄 Qayta tekshirish** — usta tuzatgan faylni yuklaysiz. Natija: ✅ tuzatildi · ❌ qoldi · 🆕 yangi.
4. **Yakunlash**. Koʻrib chiqilmagan ❌ boʻlsa — soʻraydi. Yakunlangan tekshiruvni faqat administrator qayta ochadi (tarixga yoziladi).
5. Excel natija, PDF'da belgilash (chizish, izoh), tekshiruvlar tarixi (oxirgi 300 ta).
6. Yakunlanmagan tekshiruvlar «Mening ishlarim»da eslatiladi. Oyning 5-sanasidan keyin yangi oy Forma-30 yuklanmagan boʻlsa — u ham eslatiladi.

---

## 6. Ochiq savollar — muallif javobi kutilmoqda (28.10.2026)

> Savollar muallifga qayta yuborildi, javobi kutilmoqda. «Qaror» ustunida — taklif qilingan javob. **1** va **9** kodda oldindan bajarildi (5.2, `frontend/src/features/hisobot_tekshiruvi/v52hs.ts`, sinov `tests/v52hs.e2e.cjs`); muallif boshqacha desa — qaytariladi. Qolganlari hozircha amaldagi qoida boʻyicha ishlaydi.

| № | Savol | Qaror (taklif) | Kodda |
|---|---|---|---|
| 1 | Forma-30 oyi «01.05.2025 - 31.05.2025» shaklida oʻqilmasdi | **Ikkala shakl oʻqiladi**: «2025/05/01 - 2025/05/31» va «01.05.2025 - 31.05.2025» — oddiy tekshiruvda (yuklash oynasidagi oy taklifi) va oylik toʻplamda | ✅ 5.2 |
| 2 | Spravka Факт ↔ Forma-30 farqi | **Qatʼiy — farq 0** (moddiy hisob aniq boʻlishi kerak) | oʻzgarmadi |
| 3 | Normadan kam chiqarilsa | **Xato emas** — hech narsa deyilmaydi | oʻzgarmadi |
| 4 | ШПЗ guruh kodi (222000 ↔ 222182) | **🔷 tekshirish kerak**; qatʼiy rejim (❌) sozlamada qoladi | oʻzgarmadi |
| 5 | Talabnoma № yozilmagan material | **🔷** — Forma-30 bilan solishtirib boʻlmagani aytiladi | oʻzgarmadi |
| 6 | Naryad: soatbay qatorlar Н вр. ga qoʻshiladimi | **🔷** — ikkala foiz koʻrsatiladi; iqtisodchi qoidasi aniq boʻlganda qatʼiy qilinadi | oʻzgarmadi |
| 7 | Defekt vedomostdan DR/KR sanasi pasportga | **Avtomatik** (faqat aniq yozilgan sana, bir marta; «↩ Bekor qilish» bor) | oʻzgarmadi |
| 8 | Chegaralar | **Narx — 0,5 %; arifmetika — 1 soʻm yoki 0,05 %** (qaysi katta) | oʻzgarmadi |
| 9 | Rasm (foto) hisobot internetli AI orqali | **Oʻchirildi** — rasm qabul qilinmaydi, «Excel yoki PDF yuklang; qogʻozni avval 📷 Skaner bilan PDF qiling» deyiladi. Hech narsa tashqariga yuborilmaydi | ✅ 5.2 |
| 10 | Yashirilgan qatorlar | **Tekshiruvga kirmaydi**, 🟠 roʻyxat boʻlib chiqadi | oʻzgarmadi |
| 11 | Boshqa oy spravka bloki | **ℹ️** — solishtirilmaydi | oʻzgarmadi |
| 12 | Boshqa turlar uchun tasdiqlangan normalar | Norma boʻlmasa — ℹ️ (tekshiruv oʻtkazib yuboriladi). **Normalar fayllari kelganda yuklanadi** | fayl kutilmoqda |

**Qoʻshimcha (koʻrib chiqishda topildi, oʻzgartirilmadi):** internetli AI yana ikki joyda bor — «🤖 Rasmdan akt» (nosozlik rasmi → akt) va pasportni rasmdan toʻldirish. Ikkalasi ham faqat «Parametrlar → AI ulanishi» yoqilgan boʻlsa va rozilik bilan ishlaydi. Yopiq kontur uchun ularni ham oʻchirish kerakmi — muallif hal qiladi.
