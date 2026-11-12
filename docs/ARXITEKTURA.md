# Arxitektura

```
 Telefonlar (APK) / brauzer
          │  HTTPS 8443 (sertifikat barmoq izi boʻyicha)
          ▼
 ┌──────────────────────┐
 │ gateway (nginx)      │  TLS, soʻrovlar chegarasi (kirish: 10/daqiqa), hajm chegarasi, xavfsizlik sarlavhalari
 └──────────┬───────────┘
            │ edge tarmogʻi (ichki)
 ┌──────────▼───────────┐        127.0.0.1:8080 ── boshqaruv paneli (faqat server kompyuteridan)
 │ backend (Python)     │
 │  Starlette + uvicorn │  API, sinxronlash, imzolash, fayllar (AES-256-GCM), audit, zaxira (pg_dump)
 └──────────┬───────────┘
            │ internal tarmogʻi (tashqariga chiqmaydi)
 ┌──────────▼───────────┐
 │ db (PostgreSQL 16)   │
 └──────────────────────┘
```

## Asosiy qarorlar

- **API eski server bilan bayt-baraybar mos.** Telefonlardagi 3.16.x ilova hech qanday oʻzgarishsiz yangi serverda ishlaydi. Bu shartnoma sinovi bilan tekshirilgan: eski va yangi serverga bir xil 172 ta soʻrov yuborilganda javoblar bir xil (`backend/tests/contract`).
- **Parollar, tokenlar va shifrlash algoritmlari bir xil:** scrypt, HS256 JWT, AES-256-GCM. Shu sabab koʻchirishda:
  - parollar oʻzgarmaydi;
  - ochiq sessiyalar saqlanadi;
  - shifrlangan imzolar va fayllar ochiladi;
  - telefonlarni qayta ulash shart emas, chunki sertifikat va server kaliti ham koʻchiriladi.
- **`records.data` ustuni `json` turida (`jsonb` emas).** Ilova yuborgan kalitlar tartibi aynan saqlanadi. Ilova roʻyxatlarni shu tartibda koʻrsatadi.
- **Yozuvlarning vaqt belgisi** mikrosoniya aniqligida va doim oʻsib boradi. Yozish `pg_advisory_xact_lock` bilan ketma-ket bajariladi, shuning uchun sinxronlashda hech bir yozuv tushib qolmaydi.
- **Bitta jarayon.** Jonli joylashuv va xato urinishlar hisobi diskka yozilmaydi va faqat xotirada turadi (maxfiylik talabi). Shuning uchun backend bitta nusxada ishlaydi.
- **Maxfiy maʼlumotlar repoda yoʻq:**
  - `.env` faylida faqat oddiy sozlamalar turadi;
  - parollar va kalitlar Docker secrets va hajmlarda (volume) saqlanadi;
  - xodimlar roʻyxati korxona papkasida turadi va faqat oʻqish uchun ulanadi;
  - ilovadagi shaxsiy roʻyxatlar `frontend/private/` da, u `.gitignore` da.

## Backend tuzilmasi

| Papka | Mazmuni |
|---|---|
| `app/main.py` | ishga tushirish: API (ichki port) va boshqaruv paneli (faqat 127.0.0.1) bitta jarayonda |
| `app/core/` | `config` (faqat `.env`), `database` (ulanishlar, migratsiyalar), `security` (scrypt, JWT, AES-GCM), `permissions` (rollar va maxfiy kalitlar), `audit` (sessiyalar, audit), `http_utils`, `tls`, `utils` |
| `app/api/` | `router` (barcha yoʻllar jadvali `ROUTES`), `auth`, `data` (sinxronlash, fayllar), `people`, `my`, `sign`, `attendance`, `admin` |
| `app/services/` | `org` (boʻysunish), `roster` (shtat), `attendance` (davomat hisobi — toza funksiyalar), `geo` (internetsiz geokodlash), `legacy_migration` |
| `app/realtime.py` | jonli joylashuv (faqat xotirada) |

API roʻyxati — `docs/API.md`, jadvallar — `docs/BAZA.md`.

## Frontend

- Manba: `frontend/src/features/<boʻlim>/` — 16 boʻlim, 244 ta `.ts` fayl (har boʻlimda `README.md`: fayllar, saqlash kalitlari, API).
- `build.mjs` fayllarni `TARTIB.json` boʻyicha TypeScript kompilyatori orqali bitta HTML ga yigʻadi. APK, kompyuter dasturi va brauzerga xuddi shu fayl beriladi.
- **Tartib muhim.** Ilova «qatlamma-qatlam» rivojlangan: keyingi fayl oldingi global funksiyani `agmkExtend(nom, izoh, eski, yangi)` bilan oʻraydi. Shuning uchun `TARTIB.json` tartibi oʻzgartirilmaydi, yangi fayl `mod` roʻyxatining oxiriga qoʻshiladi.
- `_yangilanishlar/` — bir nechta boʻlimni birdan oʻzgartirgan versiya paketlari (ajratilmagan).
- Saqlash: `kvGet/kvSet` (localStorage + IndexedDB zaxirasi, `boot/storage.ts`), `agmkStore(nom)` (yozuvlar toʻplami), sinxronlanadigan kalitlar `KV_SYNC.keys`.
- Turlar qarzi `types/baseline.json` da (5916 ta, fayl boʻyicha); `check.mjs` uning oshishiga yoʻl qoʻymaydi.
- 09.11.2026: fayllar `main/`, `mod/` dan boʻlimlarga koʻchirildi; yigʻilgan ilova **bayt-baraybar bir xil** (SHA-256 oldin va keyin) — koʻchirish funksiyani oʻzgartirmaganining isboti.

## Sinovlar

| Sinov | Nima tekshiriladi | Natija |
|---|---|---|
| `backend/tests/unit` | scrypt, JWT, AES-GCM — Node.js bilan bayt-baraybar; davomat, tashkiliy tuzilma | OK |
| `backend/tests/contract/scenario.py` | eski va yangi server: 172 qadam (kirish, roʻyxat, oklad, imzo, yozuvlar va huquqlar, xabarlar, fayllar, imzolash, joylashuv, panel) | 172/172 |
| `backend/tests/contract/readonly.py` | eski bazani koʻchirgandan keyin ikkala server bir xil maʼlumot beradi; eski server bergan token yangisida ishlaydi | 68/68 |
| `backend/tests/e2e/app_e2e.js` | TypeScript dan yigʻilgan haqiqiy ilova yangi serverda: kirish, 3800+ yozuv sinxroni, xabar va fayl | OK |
| `backend/tests/e2e/qr_e2e.js` + `qr_decode.py` | QR yorliq va skaner (3.19.0); yorliq PDF lari OpenCV QR oʻquvchisi bilan haqiqatan oʻqiladi | OK |
| `frontend/check.mjs` | turlar tekshiruvi (yangi xato yoʻq) | OK |
| `frontend/tests/*.e2e.cjs` | brauzer sinovlari (49 ta): boʻlimlar, hisobot tekshiruvi, qabul, imzo, yopiq kontur | OK |

Docker obrazlari va nginx bu ishlab chiqish muhitida ishga tushirib koʻrilmagan, chunki muhitda Docker xizmati yoʻq. `docker compose config` tekshiruvidan oʻtgan. Birinchi ishga tushirish IT serverida tekshiriladi (`OʻRNATISH.md`).
