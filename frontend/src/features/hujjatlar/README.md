# features/hujjatlar

**Normativ hujjatlar, Word/PDF/Excel eksporti, hujjat tili, yuklab olish.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 22 | `021_22_bosqich_normativ_huquqiy_hujjatlar_va_ai_akt.ts` | YANGI (22-bosqich): NORMATIV-HUQUQIY HUJJATLAR va AI AKT (DALOLATNOMA) TUZISH. |
| 39 | `038_gost_33421_2015_toliq_matn_ru_asl_nusxa_uz_tarji.ts` | gost 33421 2015 toliq matn ru asl nusxa uz tarji |
| 40 | `039_32_bosqich_1_normativ_hujjatlar_bolimlar_vagon_l.ts` | Akt havolalaridagi GOST 33421 — endi to'liq matn bor |
| 42 | `041_32_bosqich_mehnat_muhofazasi_hujjatlari_skanerda.ts` | mehnat muhofazasi hujjatlari skanerda |
| 48 | `047_standart_sahifasi_faqat_ozbekcha_hujjatlar_mm_uc.ts` | Standart sahifasi: faqat o'zbekcha hujjatlar (MM) uchun moslash |
| 49 | `048_33_bosqich_bolim_sahifalari_uchun_umumiy_qism_se.ts` | bolim sahifalari uchun umumiy qism se |
| 65 | `064_v2_0_dalolatnomalar_foydalanuvchi_bergan_tayyor.ts` | v2.0 — DALOLATNOMALAR: foydalanuvchi bergan tayyor shablonlar bo'yicha |
| 68 | `067_v2_0_dalolatnoma_va_hisobotlar_bolimi.ts` | v2.0 — «📊 DALOLATNOMA VA HISOBOTLAR» bo'limi |
| 89 | `088_v2_5_qollanmalar_amaliyot_bor_har_bir_sahifa_bur.ts` | v2.5 — ℹ️ QO'LLANMALAR: amaliyot bor har bir sahifa burchagida kichik ℹ️ tugma → batafsil qo'llanma |
| 95 | `094_v2_9_hujjat_eksporti_katakcha_tori_grid_excel_bi.ts` | v2.9 — Hujjat eksporti: «katakcha to'ri» (grid) → Excel (birlashtirilgan, chegarali kataklar), PDF, JPG |
| 108 | `dxt.ts` | v3.0 — 📄 WORD SHABLON MEXANIZMI (DXT) |
| 109 | `dxt_tpl.ts` | dxt tpl |
| 110 | `docs.ts` | v3.0 — HUJJATLAR korxona blankasi bo'yicha (DXT shablonlari) |
| 122 | `docbar.ts` | v3.2 — 📄 HUJJAT TUGMALARI (har bir hujjatda bir xil joyda, bitta qatorda): |
| 188 | `v47yk.ts` | v4.7 — 📥 YUKLASH: saralab yuklab olish (muallif tasdiqlagan dizayn, 23.10) |
| 194 | `v49ed.ts` | 4.9 b115 — Tayyor hujjat koʻrinishi: yaqinlashtirish va qoʻlda tahrirlash (muallif soʻrovi, 26.10.2026) |
| 197 | `v49til.ts` | 4.9 b117 — Hujjat tili: O'zbek (lotin) · Ўзбек (кирилл) · Русский (muallif, 26.10.2026) |
| 201 | `v51nav.ts` | 5.1 — «📊 Dalolatnoma va hisobotlar» ga har yangidan kirganda umumiy sahifa (muallif, 28.10.2026) |
| 226 | `v59in.ts` | 5.9 — 13-band (muallif, 02.11.2026 10:42–11:24): Gmail (yoki boshqa ilova) → AGMK-STTB |
| 227 | `v59stpdf.ts` | Oldin PDF chop etish oynasi orqali rasm kabi chiqar edi: Android’da kichik yozuvlar bir-biriga minar, |
| 233 | `v60bulk.ts` | 6.0 — 4-band (muallif, 02.11.2026 19:51 / 20:07): «📥 UMUMIY YUKLASH — hamma masterlar» |
| 239 | `v61pdf.ts` | 6.1 — 18 va 19-bandlar (muallif 08:59, 09:04, 09:09) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_akt_mode`, `agmk_bux`, `agmk_dl59`, `agmk_f30`, `agmk_gj_v1`, `agmk_gost_lang`, `agmk_harakat`, `agmk_hisob`, `agmk_hisob_set`, `agmk_in59_cat`, `agmk_in59_who`, `agmk_media_keep`, `agmk_mm`, `agmk_mttb`, `agmk_nd_akts`, `agmk_nd_docs`, `agmk_nd_sign41`, `agmk_nd_signers`, `agmk_p8_cfg61`, `agmk_roles`, `agmk_sec_cfg`, `agmk_sklad_master`, `agmk_til_nosoz`, `agmk_til_yk`, `agmk_yk_cols_`

## Server API

`/api/sign/v1/docs`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
