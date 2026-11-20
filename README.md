# AGMK STTB-AIT — Avtomatlashtirilgan Intellektual Tizim

(oldingi nomi: AGMK-STTB PTO)

«Olmaliq KMK» AJ Sanoat temir yoʻl transporti boshqarmasi (STTB) ishlab chiqarish-texnik boʻlimi (PTO) uchun ichki ilova: vagonlar va texnika pasportlari, taʼmir grafigi, dalolatnomalar, hisobot (Forma-30) tekshiruvi, MTTB va qabul qilingan ehtiyot qismlar, xodimlar, davomat, ichki elektron imzo.

- **Ilova:** TypeScript → bitta mustaqil HTML (telefon APK, kompyuter dasturi va brauzer uchun bir xil fayl).
- **Server:** Python 3.12 (Starlette + uvicorn), PostgreSQL 16, nginx shlyuz, Docker Compose.
- **Yopiq kontur:** ilova va server internetga murojaat qilmaydi — faqat korxona ichki tarmogʻi (`docs/YOPIQ_KONTUR_IT.md`).

## Tuzilma

```
backend/                 Server (Python)
  app/
    main.py              ishga tushirish (API + boshqaruv paneli)
    realtime.py          jonli joylashuv (faqat xotirada)
    core/                config, database, security, permissions, audit, http_utils, tls, utils
    api/                 HTTP yoʻllar: router (roʻyxat), auth, data, people, my, sign, attendance, admin
    services/            mantiq: org, roster, attendance, geo, legacy_migration
    migrations/          SQL migratsiyalar (0001…0008)
  tests/                 unit, db, contract, e2e
frontend/                Ilova (TypeScript)
  src/
    TARTIB.json          yigʻish tartibi (muhim — pastga qarang)
    features/<boʻlim>/   16 boʻlim: core, auth, vagonlar, texnika, temir_yol, hujjatlar, aktlar,
                         hisobot_tekshiruvi, iqtisod_buxgalteriya, mttb_ombor, xodimlar, imzo,
                         salohiyat, ai_ovoz, yozishmalar, _yangilanishlar (har birida README.md)
    boot/ styles/ markup/ data/ assets/ android/
  build.mjs              yigʻish (+ yopiq kontur tekshiruvi, CSP)
  check.mjs              turlar tekshiruvi (qadamli)
  tests/                 brauzer sinovlari (Playwright)
gateway/                 nginx (tashqariga faqat 8443 HTTPS)
desktop/                 Windows kompyuter dasturi (Electron)
tools/                   yordamchi skriptlar (APK yigʻish, koʻchirish)
windows/ *.bat           Windows serverda boshqarish (ishga tushirish, toʻxtatish, holat)
docs/                    hujjatlar (pastga qarang); docs/arxiv — tarixiy hujjatlar
```

## Tez boshlash

**Ilova (frontend):**
```bash
cd frontend
npm install
node check.mjs           # turlar: yangi xato boʻlmasligi shart (eski qarz types/baseline.json da)
node build.mjs           # → dist/agmk-sttb-pto.html
```

**Server:**
```bash
cp .env.example .env     # qiymatlarni toʻldiring (docs/OʻRNATISH.md)
docker compose up -d --build
```
Windows (Docker Desktop): `ISHGA_TUSHIRISH.bat`, `TOXTATISH.bat`, `HOLAT.bat`.

## Sinovlar

| Buyruq | Nima |
|---|---|
| `cd frontend && node check.mjs` | TypeScript turlari (qadamli: qarz faqat kamayadi) |
| `cd frontend && node build.mjs` | yigʻish + yopiq kontur tekshiruvi (tashqi manzil topilsa — yigʻish toʻxtaydi) |
| `node frontend/tests/<nom>.e2e.cjs frontend/dist/agmk-sttb-pto.html` | brauzer sinovlari (49 ta, soxta maʼlumot bilan) |
| `cd backend && PYTHONPATH=. python -m unittest discover -s tests/unit` | server unit sinovlari |
| `backend/tests/db`, `backend/tests/contract` | PostgreSQL bilan sinovlar (`docs/ARXITEKTURA.md`) |

## Ilova arxitekturasi haqida muhim

Ilova bosqichma-bosqich, «qatlamma-qatlam» yozilgan: keyingi fayl oldingi funksiyani `agmkExtend(nom, izoh, eski, yangi)` bilan oʻraydi. Shuning uchun **`TARTIB.json` dagi tartib muhim** va fayl nomlari oʻzgartirilmaydi. Yangi funksiya — boʻlim papkasiga yangi fayl va `TARTIB.json` dagi `mod` roʻyxatining oxiriga. Batafsil: `docs/ARXITEKTURA.md`.

## Maxfiylik

Repoda **yoʻq** va boʻlmasligi shart: `.env`, kalitlar va sertifikatlar, APK imzo kaliti, xodimlar roʻyxati, parol xeshlari, baza va zaxira fayllari (`.gitignore`). Shaxsiy roʻyxatlar yigʻishda `frontend/private/` dan qoʻshiladi (repoda faqat boʻsh namuna: `frontend/private.example/`). Batafsil: `docs/XAVFSIZLIK.md`.

## Hujjatlar

| Hujjat | Mazmuni |
|---|---|
| `docs/ARXITEKTURA.md` | tuzilma, qarorlar, sinovlar |
| `docs/XAVFSIZLIK.md` | maʼlumot darajalari, huquqlar, kalitlar, maʼlum cheklovlar |
| `docs/API.md` | server API roʻyxati |
| `docs/BAZA.md` | maʼlumotlar bazasi jadvallari |
| `docs/OʻRNATISH.md`, `docs/OFLAYN_ORNATISH.md` | oʻrnatish, yangilash, zaxira |
| `docs/YOPIQ_KONTUR_IT.md` | yopiq konturni IT mustaqil tekshirishi |
| `docs/HISOBOT_TEKSHIRUV.md`, `docs/NAZORAT.md` | boʻlimlar boʻyicha qoidalar |
| `docs/VERSIYALAR.md` | versiyalar tarixi |
| `docs/IT_SAVOLLAR.md` | IT bilan kelishiladigan savollar |
