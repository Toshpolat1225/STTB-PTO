# features/temir_yol

**Temir yoʻl xaritasi, uchastkalar, stansiya sxemalari, yoʻl uzunliklari.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 16 | `015_16_bosqich_yol_qurilishi_va_tamirlash_2026_yil_3.ts` | YANGI (16-bosqich): YO'L QURILISHI VA TA'MIRLASH — "2026-yil 3-TYS temir yo'l texnikalari va |
| 18 | `017_18_bosqich_temir_yol_xaritasi.ts` | YANGI (18-bosqich): TEMIR YO'L XARITASI — "Технический паспорт подъездного пути" |
| 19 | `018_19_bosqich_temir_yol_bolimlar_uchastka_obyekt_ma.ts` | YANGI (19-bosqich): TEMIR YO'L — bo'limlar (uchastka → obyekt → mavzu) va |
| 20 | `019_20_bosqich_aqlli_xarita_ai_gps.ts` | YANGI (20-bosqich): AQLLI XARITA — AI + GPS. |
| 59 | `058_v1_9_stansiyalar_sxemalari_okolotkalar_boyicha_p.ts` | v1 9 stansiyalar sxemalari okolotkalar boyicha p |
| 60 | `059_v1_9_okolotkalar_boyicha_temir_yol_uzunligi_2025.ts` | v1 9 okolotkalar boyicha temir yol uzunligi 2025 |
| 62 | `061_v1_9_okolotkalar_uzunligi_va_gildirak_sinishlari.ts` | G'ildirak juftligi sinishlari |
| 63 | `062_v2_0_yigma_sxema_marksheyderlik_bolimining_asl_v.ts` | v2.0 — YIG'MA SXEMA: marksheyderlik bo'limining asl vektorli varaqlari (16 ta) |
| 64 | `063_v2_0_oddiy_sxema_asl_sxema_schema_sttb_2026_shak.ts` | v2.0 — «ODDIY SXEMA» asl sxema («Schema STTB 2026») shaklida: |
| 86 | `085_v2_5_oson_boglash_sxema_joy_va_sxema_real_korini.ts` | v2.5 — 📍 OSON BOG'LASH (sxema ↔ joy) va 📐 Sxema / 🛰 Real ko'rinish |
| 115 | `pack.ts` | v3.0 — 🗺 TEMIR YO'L SXEMASI — ixtiyoriy paket (ilovaga kiritilmagan) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_infra_geo`, `agmk_infra_import_2023`, `agmk_map_georef`, `agmk_map_layers`, `agmk_map_v2`, `agmk_map_yig`, `agmk_obxod_log`, `agmk_sxema_info`, `agmk_yol_import_2026`

## Server API

`/api/pack/v1/sxema`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
