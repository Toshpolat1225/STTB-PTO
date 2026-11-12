# Maʼlumotlar bazasi (PostgreSQL 16)

Migratsiyalar: `backend/app/migrations/0001…0008.sql`. Server ishga tushganda yangilarini oʻzi qoʻllaydi (`app/core/database.py`), qoʻllanganlari `schema_migrations` da qayd etiladi.

## Sxemalar

```
agmk (baza)
├─ public   — ilova jadvallari
├─ nazorat  — oʻzgarishlar jurnali (oʻchirib boʻlmaydigan, xesh zanjiri bilan)
└─ oqish    — IT/auditor uchun koʻrinishlar (shaxsiy maʼlumot, oylik, parol, imzo rasmi va GPS yoʻq); rol: agmk_oqish
```

## Jadvallar

| Jadval | Migratsiya | Mazmuni |
|---|---|---|
| `users` | 0001 | hisoblar: tabel, rol, parol xeshi (scrypt), holat |
| `records` | 0001 | ilova yozuvlari (sinxronlash). `data` — `json` (kalitlar tartibi saqlanadi), `updated_at` — doim oʻsuvchi vaqt belgisi |
| `history` | 0001 | yozuvlar tarixi |
| `messages` | 0001 | ichki xabarlar |
| `files` | 0001 | fayllar (mazmuni AES-256-GCM bilan shifrlangan) |
| `refresh` | 0001 | sessiyalarni yangilash tokenlari |
| `sign_docs`, `sign_acts` | 0001 | ichki elektron imzo: hujjat (SHA-256 izi bilan) va imzolar |
| `vt_act` | 0001 | vaqtincha tayinlash |
| `trk`, `audit`, `kir_seed`, `kir_alt`, `oklad`, `settings` | 0001 | joylashuv yigʻindisi, audit, boshlangʻich parollar xeshi, oklad, sozlamalar |
| `sign_seen` | 0002 | imzolovchi hujjatni birinchi ochgan vaqt |
| `hr_pd` | 0003 | **shaxsiy maʼlumot** (1C kadrlar): faqat serverda, rolga qarab |
| `my_rel` | 0003 | xodimni qoʻlda biriktirish (muddatli) |
| `kiy_issue`, `kiy_person` | 0003 | maxsus kiyim: berilganlar va xodim sozlamasi |
| `nazorat.ozgarishlar` | 0004 | har oʻzgarish: kim, qachon, qaysi dastur, qaysi manzil; xesh zanjiri |
| `xodimlar` | 0005 | yagona shtat jadvali; tabel raqami bor hamma jadval unga FOREIGN KEY bilan bogʻlangan |
| `oqish.*` koʻrinishlar | 0006, 0007 | mashinist xodkalari va naryad koʻchirmasi (probeg) — faqat oʻqish |
| `dav_event`, `dav_pattern`, `dav_assign`, `dav_reason` | 0008 | davomat: turniket hodisalari, grafiklar, biriktirish, sabablar |

Batafsil: har migratsiya faylining boshidagi izoh; huquqlar — `docs/XAVFSIZLIK.md`, nazorat jurnali — `docs/NAZORAT.md`.
