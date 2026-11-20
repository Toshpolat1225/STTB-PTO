# Xavfsizlik

Bu hujjat kodni tekshiruvchi (IT, Codex) uchun: maʼlumot qayerda turadi, kim nimani koʻradi, kalitlar qayerda, va **maʼlum cheklovlar** — halol roʻyxat.

## 1. Tarmoq va yopiq kontur

- Tashqariga faqat **8443 (HTTPS)** ochiq, nginx shlyuz orqali (`gateway/nginx.conf`): TLS, soʻrovlar chegarasi (kirish 10/daqiqa, API 20/soniya), hajm chegarasi 52 MB, `HSTS`, `nosniff`, `no-referrer`.
- Backend va PostgreSQL ichki Docker tarmoqlarida; baza tashqariga ochilmaydi.
- Boshqaruv paneli faqat server kompyuterining oʻzidan: `127.0.0.1:8080` (`app/api/admin.py`, `AGMK_ADMIN_HOSTS`).
- Ilova internetga murojaat qilmaydi: tarmoq qoʻriqchisi (`frontend/src/features/core/v61yk.ts`), CSP va yigʻishdagi tekshiruv (`frontend/build.mjs`) — tashqi manzil topilsa, versiya yigʻilmaydi. Mustaqil tekshirish: `docs/YOPIQ_KONTUR_IT.md`.

## 2. Autentifikatsiya

| Narsa | Qanday | Kod |
|---|---|---|
| Parol | scrypt + tuz (salt); xato urinishlar soni cheklanadi | `app/core/security.py` |
| Sessiya | HS256 JWT, kalit faqat serverda (`secrets` hajmi) | `app/core/security.py`, `app/core/audit.py` |
| Imzo PIN kodi va fayllar | AES-256-GCM | `app/core/security.py`, `app/api/data.py` |
| Boshlangʻich parollar | ilovaga faqat **xesh** (PBKDF2-SHA256) bilan, `frontend/private/` dan yigʻishda; asl parollar hech qayerda yoʻq | `frontend/src/features/auth/kir_seed.ts` |

Algoritmlar eski (Node.js) server bilan bayt-baraybar mos — koʻchirishda parollar va sessiyalar saqlangan (`backend/tests/unit/test_security.py`).

## 3. Avtorizatsiya (huquqlar)

- **Haqiqiy tekshiruv serverda.** Har soʻrovda sessiya roli olinadi va `app/core/permissions.py` qoidalari qoʻllanadi:
  - `ADMIN_IDS`, `ADMIN_KINDS` — xavfsizlik sozlamalarini faqat administrator yozadi;
  - `KV_ACL`, `MOD_ACL` — buxgalteriya, ish haqi, naryad maʼlumotlari faqat tegishli rollarga;
  - `PD_KEYS`, `PD_ROLES` — shaxsiy maʼlumot maydonlari boshqalarga yuborilishdan oldin olib tashlanadi (`pd_strip`).
- Ilovadagi huquq tekshiruvlari (`isAdmin()`, tugmalarni yashirish) — **faqat interfeys qulayligi uchun**. Ularni chetlab oʻtish serverdagi maʼlumotga ruxsat bermaydi.
- Administrator tabeli kodda yozilmagan: server — `.env` dagi `AGMK_ADMIN`; ilova — yigʻishda shu qiymat qoʻyiladi (`build.mjs`, `@@ADMIN_TABEL@@`).

## 4. Maʼlumot darajalari

| Daraja | Misol | Qayerda turadi |
|---|---|---|
| 🛡️ Faqat server | manzil, telefon, tugʻilgan sana, oklad (`hr_pd`, `oklad`) | PostgreSQL; telefonga yozilmaydi, APK va HTML da yoʻq. Koʻrish — vakolat va audit bilan (`/api/my/v1/tel`) |
| 🌐 Umumiy | vagonlar, taʼmir sanalari, aktlar, qabul dalolatnomalari, imzolangan hujjatlar | Server + har qurilmada sinxron nusxa (oflayn ishlash uchun) |
| 🔒 Shaxsiy | qoralamalar, hisobot tekshiruvlari tarixi | hozir faqat qurilmada (maʼlum cheklov, 7-boʻlim) |

Jonli joylashuv va xato urinishlar hisobi diskka yozilmaydi — faqat server xotirasida (`app/realtime.py`).

## 5. Kalitlar va maxfiy fayllar

- Repoda yoʻq: `.env`, `secrets/`, `*.key`, `*.pem`, `*.crt`, `*.jks`, `company/`, `frontend/private/`, `backups/`, baza fayllari (`.gitignore`).
- Server kalitlari (JWT, shifrlash) — Docker hajmi `secrets`; birinchi ishga tushishda tasodifiy yaratiladi.
- Baza uchun alohida «faqat oʻqish» foydalanuvchisi (`agmk_oqish`) — IT/auditor uchun (`OQISH_PAROLI.bat`).
- APK imzo kaliti repoda yoʻq; topshirish dalolatnomasi bilan alohida beriladi.

## 6. Audit

Kirish, parol oʻzgarishi, imzolash, shaxsiy maʼlumotni koʻrish, administrator amallari — `audit` jadvaliga yoziladi (`app/core/audit.py`).

## 7. Maʼlum cheklovlar (halol roʻyxat)

| № | Cheklov | Sabab | Reja |
|---|---|---|---|
| 1 | CSP da `'unsafe-inline'` va `'unsafe-eval'` | ilova bitta mustaqil HTML (APK ichida `file://` dan ochiladi), skriptlar ichki | skriptlarni alohida fayllarga ajratish — keyingi bosqich |
| 2 | Ilova «qatlamma-qatlam»: funksiyalar `agmkExtend` bilan oʻraladi, global funksiyalar koʻp | ilova 100+ bosqichda, ishlayotgan holda rivojlangan | boʻlimlarni modullarga (`import/export`) oʻtkazish — IT bilan kelishib |
| 3 | Eski koddagi TypeScript turlar qarzi (5916) | eski JavaScript dan oʻtkazilgan | `check.mjs` qarzning oshishiga yoʻl qoʻymaydi; yangi kod toʻliq turlangan |
| 4 | Umumiy maʼlumot nusxasi telefonda `localStorage`/IndexedDB da shifrlanmagan | oflayn ishlash talabi | qurilma shifrlash (Android) + nusxani faqat kerakli qism bilan cheklash |
| 5 | Shaxsiy maʼlumot darajasi (hisobot tekshiruvlari) akkaunt boʻyicha sinxronlanmaydi | hozir faqat qurilmada | serverda egasi boʻyicha saqlash |
| 6 | Imzolangan hujjat matni oflaynda ochilmaydi (roʻyxat ochiladi) | hujjat har safar serverdan olinadi | oflayn faqat-oʻqish nusxasi |
| 7 | Backend bitta nusxada ishlaydi | jonli joylashuv faqat xotirada | ataylab (maxfiylik talabi) |
| 8 | Tahrirlash huquqi bor xodim umumiy (ACL siz) yozuvlarni oʻzgartira oladi | yozuvlar boʻlimlarga hali toʻliq ajratilmagan | har oʻzgarish `history` jadvalida va auditda (kim, qachon) — qaytarish mumkin; yoʻnalishlar boʻyicha yozish huquqi — keyingi yangilanish |

## 8. 6.2 (build 146, 16.11.2026) — yakuniy tekshiruv va tuzatishlar

| Yoʻnalish | Holat |
|---|---|
| Avtorizatsiya | Har bir soʻrov **serverda** tekshiriladi: kirish tokeni (HMAC, muddatli) → rol → maxfiy yozuvlar ACL. Interfeysdagi yashirish — qoʻshimcha, asosiy himoya emas |
| Parollar | scrypt (N=16384), tuz bilan; 5 xato urinishdan keyin 15 s → 5 daq qulf; yangi hisob — administrator tasdiqlaguncha `pending` |
| Shaxsiy maʼlumot | oklad, manzil, tugʻilgan sana va h.k. — faqat kadrlar, rahbariyat va egasining oʻziga (serverda kesiladi) |
| Fayllar | bazada shifrlangan; faqat egasi va qabul qiluvchi. **6.2:** rasm/PDF/audio/video dan boshqa fayllar faqat yuklab olinadi (`application/octet-stream`, `Content-Disposition: attachment`, `nosniff`, `CSP: sandbox`) — yuklangan HTML/SVG/skript ilova ichida ishga tushmaydi |
| Xato xabarlari | **6.2:** server xatosi tafsiloti foydalanuvchiga qaytmaydi — faqat server jurnaliga |
| Tarmoq | **6.2:** «tashqi manzil» (statik IP orqali internetdan ulanish) funksiyasi oʻchirildi — server faqat ichki tarmoqda. Server tashqariga soʻrov yubormaydi; ilova yigʻuvchisi tashqi murojaatlarni topsa versiya chiqmaydi |
| Tashqi AI | **6.2:** butunlay oʻchirilgan (`v62yopiq.ts`): `aiCloudReady()` — har doim yoʻq, `aiCloudCall()` — «Yopiq kontur» xatosi; sozlama tugmasi yashirilgan. «Intellektual» funksiyalar — ilovaning oʻz algoritmlari |
| Keraksiz kod | **6.2:** SVO davomat (server: `/api/dav/v1/*`, `attendance.py`; ilova: 3 modul) olib tashlandi — arxiv: `arxiv/svo-davomat` tarmogʻi. Jadvallar (`dav_*`) bazada qoladi |
| «Supabase» nomli modul | nomi tarixiy: ilova oʻz serveri bilan Supabase-uslubidagi REST protokolida sinxronlanadi; tashqi Supabase xizmatiga ulanish yoʻq |
| Yoʻnalishlar boʻlimi | **6.2:** `kv:agmk_yon_*` yozuvlari serverda faqat ICHTB xodimlari (shtat tuzilmasidagi oʻrni boʻyicha), rahbariyat va administratorga |
