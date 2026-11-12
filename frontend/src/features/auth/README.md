# features/auth

**Kirish (tabel, parol, PIN), rollar va huquqlar.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 4 | `003_2_bosqich_tabel_orqali_kirish_qulf_oynasi_paroln.ts` | YANGI (2-bosqich): tabel orqali kirish, qulf oynasi, parolni tiklash, |
| 6 | `005_4_bosqich_heic_pin_kod_bilan_kirish_yutuq_hayfsa.ts` | YANGI (4-bosqich): HEIC, PIN-kod bilan kirish, yutuq/hayfsan fayllari |
| 44 | `043_13_rollar_va_huquqlar.ts` | 13) ROLLAR VA HUQUQLAR |
| 56 | `055_34_bosqich_v1_8_butun_ilova_boyicha_huquqlar_bit.ts` | Admin (tabel 2582) — hamma narsa. Boshqa hisoblar — faqat quyidagi jadvalda ruxsat berilgan amallar. |
| 116 | `sec.ts` | v3.0 — 🔒 XAVFSIZLIK (administrator boshqaradi; server orqali barcha qurilmalarga tarqaladi) |
| 140 | `kir_seed.ts` | AVTOMATIK (build.py): boshlangʻich parollar xeshi (PBKDF2-SHA256) va huquq guruhlari. Asl parollar yoʻq. |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_accounts`, `agmk_admin_seeded`, `agmk_bundle_applied`, `agmk_current_user`, `agmk_login_lock`, `agmk_mic_blocked`, `agmk_pw_log`, `agmk_roles`, `agmk_sec_cfg`, `agmk_session`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
