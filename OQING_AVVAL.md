# AGMK STTB-AIT 7.0 — IT ga topshirish (17.11.2026)

**AGMK STTB-AIT — Avtomatlashtirilgan Intellektual Tizim** (oldingi nomi: AGMK-STTB PTO).
Muallif: A.A. Tojimurodov, ICHTB. Server faqat korxona ichki tarmogʻida ishlaydi.

## Paket tarkibi

| Papka | Nima |
|---|---|
| `backend/` | server (Python, Starlette, PostgreSQL) |
| `frontend/` | ilova manbalari (TypeScript) → bitta HTML |
| `gateway/` | HTTPS shlyuz (faqat 443/8443) |
| `docker-compose.yml` | serverni ishga tushirish |
| `docs/` | oʻrnatish, xavfsizlik, API, baza tuzilmasi |
| `windows/`, `*.bat` | Windows kompyuterda internetsiz oʻrnatish va yangilash |

Shaxsiy maʼlumotlar (shtat, kirish kodlari, normalar) va kalitlar paketda **yoʻq** — ular `company/`, `frontend/private/`, `.env` da, faqat server kompyuterida, fleshka orqali beriladi.

## Oʻrnatish

`docs/OʻRNATISH.md` (Linux/docker) yoki `docs/OFLAYN_ORNATISH.md` (Windows, internetsiz). Qisqasi:

1. `.env` — har bir kalitga yangi tasodifiy qiymat (`docs/OʻRNATISH.md`, 1-boʻlim).
2. `docker compose up -d --build`
3. Boshqaruv paneli — faqat server kompyuterining oʻzidan: `http://127.0.0.1:8080`.

## 7.0 da oʻzgargan narsalar

- Yangi nom: **AGMK STTB-AIT**.
- «Dalolatnoma va hujjatlar tayyorlash» — ICHTB ning 10 ta yoʻnalishi, har birida 3 tugma; faqat ICHTB xodimlari (serverda ham tekshiriladi).
- Haftalik rasxod — 5 ta yoʻnalish uchun alohida skladlar va ШПЗ qoidasi.
- Normalarni hujjat sahifasida tahrirlash (miqdor, yangi qator, yangi norma) — hisobot tekshiruvi shu bazadan.
- «Orqaga» — bir qadam orqaga; telefonda sarlavha toʻgʻrilandi.
- Xavfsizlik: yuklangan fayllar ilova ichida ishga tushmaydi; server xato tafsilotini koʻrsatmaydi; «tashqi manzil» oʻchirildi; tashqi AI butunlay oʻchirildi; SVO davomat kodi olib tashlandi (jadvallar bazada qoladi — arxiv nusxasi buyrugʻi `docs/OʻRNATISH.md`, 5-boʻlim).
- Batafsil xavfsizlik hisoboti: `docs/XAVFSIZLIK.md`, 8-boʻlim.

## Yangilash tartibi

Server GitHub'dan oʻzi yangilanmaydi. Har yangi versiya: testlar → ZIP → fleshka → **zaxira** → oʻrnatish → muammo boʻlsa oldingi versiyaga qaytish. Batafsil: `docs/OʻRNATISH.md`, 5-boʻlim.

## Tekshiruv uchun

- 51+ avtomatik ilova testi (`frontend/tests/*.e2e.cjs`), server testlari (`backend/tests`).
- Ilova yigʻuvchisi tashqi internet murojaatini topsa versiya chiqmaydi (`frontend/build.mjs`, «YOPIQ KONTUR»).
- IT xavfsizlik boʻlimining mustaqil tekshiruvi va yozma xulosasi tavsiya etiladi; ICHTB da 1–2 hafta sinov.
