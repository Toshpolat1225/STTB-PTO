# Baza tuzilmasi va nazorat (audit) — 4.2 dan

Bazadagi har bir oʻzgarish yoziladi: kim, qachon, ilovadanmi yoki qoʻldan (DBeaver, psql), qaysi kompyuterdan. Yozuvni ilova orqali ham, toʻgʻridan-toʻgʻri bazaga kirib ham «jim» oʻchirib boʻlmaydi.

## 1. Ierarxiya

```
agmk (PostgreSQL 16 bazasi)
├── public — ilova jadvallari
│   ├── xodimlar (SHTAT, PK tabel) — tabel raqami bor HAMMA jadval shunga bogʻlangan (ON DELETE RESTRICT)
│   │   ├── users.tabel
│   │   ├── hr_pd.tabel, oklad.tabel, kiy_person.tabel, kiy_issue.tabel, my_rel.tabel / boss, kir_alt.tabel, kir_seed.xodim
│   │   ├── audit.tabel, vt_act.a / b, sign_docs.created_by
│   │   └── «kim qildi»: records.updated_by, history.updated_by, *.by_tabel, *.cancel_by, vt_act.created_by
│   ├── users (xodim hisobi, PK tabel)
│   │   ├── refresh      sessiyalar            FK tabel → users   ON DELETE CASCADE
│   │   ├── sign_acts    imzolar               FK tabel → users   ON DELETE RESTRICT (imzo — dalil)
│   │   ├── sign_seen    «tanishdi»            FK tabel → users   CASCADE
│   │   ├── messages     xabarlar              FK from_tabel, to_tabel → users   CASCADE
│   │   ├── files        fayllar               FK owner → users   CASCADE
│   │   └── trk          yoʻl izlari (GPS)     FK tabel → users   CASCADE
│   ├── sign_docs (imzo hujjati, PK id)
│   │   ├── sign_acts, sign_seen, vt_act     FK doc_id → sign_docs   CASCADE
│   ├── records (sinxronlanadigan yozuvlar: vagon, akt, xodim …, PK id)
│   │   └── history      har bir versiya       FK id → records   RESTRICT
│   └── settings, schema_migrations — tizim jadvallari (tabel yoʻq, bogʻlanmaydi)
├── nazorat — audit
│   ├── ozgarishlar      jurnal (faqat qoʻshiladi, xesh-zanjir)
│   ├── maxfiy           oqish koʻrinishlari yashiradigan kalitlar (server acl.py dan yangilaydi)
│   ├── boglanishlar     barcha FOREIGN KEY va ularning holati (koʻrinish)
│   ├── v_ozgarishlar    jurnal — oʻqishga qulay (manba: ilova / qoʻlda)
│   └── funksiyalar: yoz(), yoz_truncate(), zanjir(), xesh(), taqiq(), ddl_yoz(), tekshir(), pd_tozala(), xodim_kafolat(), kir_seed_kafolat()
└── oqish — auditor (agmk_oqish) uchun faqat oʻqish koʻrinishlari
    xodimlar, foydalanuvchilar, yozuvlar, tarix, hujjatlar, imzolar, tanishdi, vaqtincha_tayinlash, xabarlar,
    fayllar, kirishlar, biriktirish, kiyim_berilgan, ozgarishlar, boglanishlar, jadvallar_hajmi, zanjir_tekshir()
```

Jami **34 ta bogʻlanish** (FOREIGN KEY). Bogʻlanmagan jadval faqat ikkita: `settings` va `schema_migrations`. Bular tizim jadvallari, ularda tabel yoʻq.

**xodimlar (shtat) jadvali.** Server uni har daqiqada `company/xodimlar.json` (ITR) va `ishchilar.json` (1C) dan yangilaydi. Unga faqat F.I.Sh., lavozim va boʻlinma yoziladi; oylik va shaxsiy maʼlumot yozilmaydi.
- Shtatdan chiqqan xodim oʻchirilmaydi, unda `shtatda = false` boʻladi. Xodimni oʻchirish taqiqlangan, shuning uchun tarix va dalillar yoʻqolmaydi.
- Roʻyxatda yoʻq tabel uchrasa (eski yozuv, demo hisob, notoʻgʻri tabel bilan kirishga urinish), u avtomatik qoʻshiladi: `manba = 'avto:<jadval>'`, `shtatda = false`. Shu tufayli ilova hech qachon toʻxtab qolmaydi, auditor esa bunday tabellarni alohida koʻradi.

**Nega `records` bitta jadval.** Telefonlar internetsiz ishlaydi va keyin sinxronlanadi. Shuning uchun yozuvlar hujjat koʻrinishida (`data` JSON) saqlanadi, har bir versiyasi `history` da qoladi. Ilova yozuvni oʻchirmaydi, faqat `deleted = true` deb belgilaydi.

## 2. Nima, qanday yoziladi

| Jadval | Yoziladi | Jurnalga tushmaydi |
|---|---|---|
| users | barcha oʻzgarishlar | `salt`, `hash`, `sig`, `sigpin` (parol va imzo) |
| records, messages, sign_docs, sign_acts, sign_seen, vt_act, settings, my_rel, kiy_issue, kiy_person | barcha oʻzgarishlar (eski va yangi qiymat) | `files.data`, `sign_docs.html`, `sign_acts.png` |
| hr_pd, oklad | faqat kim, qachon, qaysi ustun | qiymatlar (shaxsiy maʼlumot, oylik) |
| trk | faqat oʻchirish | GPS nuqtalari |
| history, audit, nazorat.ozgarishlar | — | **oʻzgartirish va oʻchirish taqiqlangan** |
| barcha jadvallar | TRUNCATE | — |
| sxema | CREATE / ALTER / DROP, trigger oʻchirish (DDL) | parol soʻzi bor buyruqlar |

- Yangi yozuv (INSERT) — faqat kaliti, chunki toʻliq nusxa jadvalning oʻzida.
- O‘zgartirish (UPDATE) — faqat oʻzgargan ustunlar: eski va yangi qiymati bilan.
- O‘chirish (DELETE) — butun eski yozuv.
- `dastur = 'agmk-backend'` — oʻzgarishni ilova qilgan. Boshqa nom (DBeaver, psql) — qoʻlda qilingan, bu holda bajarilgan SQL buyrugʻi ham yoziladi.

**Xesh-zanjir.** Har bir yozuvda `xesh = sha256(oldingi yozuv xeshi + shu yozuv)` saqlanadi. Oʻrtadan yozuv oʻchirilsa yoki oʻzgartirilsa, `nazorat.tekshir()` qaysi yozuvdan boshlab zanjir uzilganini koʻrsatadi. Zaxiradan tiklanganda zanjir oʻzgarmaydi (sinovda tekshirilgan).

**Cheklov (rostini aytganda).** `agmk` — baza egasi (superuser). Qasddan harakat qilgan superuser himoyani oʻchirishi mumkin. Lekin:
1. Triggerni oʻchirish ham jurnalga yoziladi (DDL).
2. Zanjir uziladi va `tekshir()` buni koʻrsatadi.
3. Har kungi zaxiralar (30 kun, IT NAS ga koʻchiradi) bilan solishtirib aniqlanadi.

Shuning uchun `agmk` paroli faqat muallifda turadi. IT va auditor `agmk_oqish` bilan ishlaydi.

## 3. Auditor uchun tayyor soʻrovlar

```sql
-- Zanjir butunmi (buzilgan = 0 boʻlishi kerak)
SELECT * FROM oqish.zanjir_tekshir();

-- Oxirgi 100 ta oʻzgarish
SELECT seq, at, jadval, amal, kalit, ustunlar, db_user, dastur, manzil FROM oqish.ozgarishlar ORDER BY seq DESC LIMIT 100;

-- Ilovadan tashqarida (qoʻlda) qilingan hamma oʻzgarishlar
SELECT * FROM oqish.ozgarishlar WHERE dastur IS DISTINCT FROM 'agmk-backend' ORDER BY seq DESC;

-- Bitta yozuvning (masalan, vagon) toʻliq tarixi: kim, qachon, nima qildi
SELECT seq, updated_at, updated_by, deleted, data FROM oqish.tarix WHERE id = 'v:…' ORDER BY seq;

-- Oʻchirilgan deb belgilangan yozuvlar va kim oʻchirgani
SELECT id, kind, updated_at, updated_by FROM oqish.yozuvlar WHERE deleted ORDER BY updated_at DESC;

-- Hujjat imzolari (kim, qachon, qaysi qurilma, hujjat xeshi)
SELECT h.title, i.tabel, i.action, i.at, i.device, i.hash = h.hash AS hujjat_ozgarmagan
  FROM oqish.imzolar i JOIN oqish.hujjatlar h ON h.id = i.doc_id ORDER BY i.at DESC;

-- Shtatda yoʻq, lekin bazada uchragan tabellar (notoʻgʻri tabel bilan kirishga urinish va h.k.)
SELECT * FROM oqish.xodimlar WHERE NOT shtatda ORDER BY manba;

-- Bogʻlanishlar va baza hajmi
SELECT * FROM oqish.boglanishlar;
SELECT * FROM oqish.jadvallar_hajmi;
```

Muallif (`agmk`) toʻliq qiymatlarni `nazorat.v_ozgarishlar` da koʻradi: `eski`, `yangi` va `sql` ustunlari.

## 4. agmk_oqish — faqat oʻqish

- Server kompyuterida `OQISH_PAROLI.bat` ni ishga tushiring. 1-bandni tanlab, parol qoʻying. Parol ekranda koʻrinmaydi, hech qayerga yozilmaydi.
- DBeaver: Host `127.0.0.1`, Port `5432`, Baza `agmk`, Foydalanuvchi `agmk_oqish`. Faqat `oqish` sxemasi koʻrinadi.
- Bu foydalanuvchi hech narsani yoza olmaydi (`default_transaction_read_only`). Unga `public`, `hr_pd`, `oklad`, parollar, imzo rasmlari, GPS va xabar matnlari yopiq. Xodim yozuvlaridan shaxsiy maʼlumot, maxfiy yozuvlardan (FOT, buxgalteriya) esa mazmun olib tashlangan.
- Kirishni oʻchirish: `OQISH_PAROLI.bat` → 2-band.
- Baza tarmoqqa ochilmaydi. 5432 port faqat `127.0.0.1` da, faqat noutbukdagi `docker-compose.override.yml` orqali ochiladi.

## 5. Ilovadagi oʻzgarishlar (4.2)

- Panel → «parolni tiklash» endi hisobni **oʻchirmaydi**. Hisob «reset» holatiga oʻtadi: rol, imzo, xabarlar va hujjatlar saqlanadi. Xodim ilovada «Roʻyxatdan oʻtish» orqali yangi parol qoʻyadi, administrator yana tasdiqlaydi.
- Imzo chekkan xodimning hisobini oʻchirib boʻlmaydi. Panel buni aytadi va oʻrniga «Bloklangan» holatini taklif qiladi.
- Sinov: `backend/tests/db/test_nazorat.py` (12 ta holat, jumladan zaxira → tiklash, qasddan buzishni aniqlash va hamma jadvalning bogʻlanganligi).
