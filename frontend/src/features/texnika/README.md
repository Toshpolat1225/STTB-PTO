# features/texnika

**Lokomotivlar, teplovozlar, elektrovozlar, avtotraktor parki, mashinistlar, dispetcherlik, GPS.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 13 | `012_13_bosqich_lokomotivlar_tortuvchi_agregatlar_exc.ts` | YANGI (13-bosqich): LOKOMOTIVLAR — tortuvchi agregatlar (Excel: "Парк приписки ... на 01.04.2023") |
| 14 | `013_14_bosqich_teplovozlar_2026_excel.ts` | YANGI (14-bosqich): TEPLOVOZLAR — "Годовой график ППР тепловозов на 2026 г." (Excel) |
| 15 | `014_15_bosqich_avtotraktor_parki.ts` | YANGI (15-bosqich): AVTOTRAKTOR PARKI — "График ППР автотракторной и специальной техники |
| 21 | `020_21_bosqich_temir_yol_harakat_tarkibi.ts` | YANGI (21-bosqich): TEMIR YO'L HARAKAT TARKIBI. |
| 72 | `071_v2_0_texnikalar_gps_kuzatuvi_poydevor_keyinchali.ts` | v2.0 — TEXNIKALAR GPS KUZATUVI: poydevor (keyinchalik rivojlantirish uchun) |
| 78 | `077_v2_4_texnika_chizmalari_ozimiz_chizgan_svg_tashq.ts` | v2.4 — TEXNIKA CHIZMALARI (o'zimiz chizgan SVG; tashqi rasm ishlatilmaydi) |
| 79 | `078_v2_4_harakat_tarkibi_holat_belgilarining_izohi.ts` | v2.4 — Harakat tarkibi: holat belgilarining izohi |
| 80 | `079_v2_5_harakat_tarkibi_gps_demo_alohida_ekran.ts` | v2.5 — 📡 HARAKAT TARKIBI · GPS (DEMO) — alohida ekran |
| 81 | `080_v2_4_avtotraktor_gps_navigator_poydevor.ts` | v2.4 — 🧭 AVTOTRAKTOR GPS-NAVIGATOR (poydevor) |
| 87 | `086_v2_5_navigator_faqat_bosib_otilgan_yol_tezlikka.ts` | v2.5 — 🧭 NAVIGATOR: faqat bosib o'tilgan yo'l (tezlikka qarab rangli), to'xtashlar (3 daqiqadan ortiq), |
| 124 | `disp.ts` | v3.5 — 🚦 DISPETCHERLIK («Harakat tarkibi» ustiga) |
| 126 | `karyer.ts` | v3.6 — 🤖 KARYER → BUNKER: TARKIBLAR HARAKATINI AVTOMATIK REJALASH (DEMO) |
| 127 | `mash.ts` | v3.6 — 🚂 MASHINISTLAR VA ❗ UNDOV (nosozlik / avariya signali) |
| 131 | `gdx.ts` | v3.6.1 — 📡 GPS SXEMA: tanlangan tarkib rejimi, harakat tarixi, panelni yashirish, yozuvlar ustma-ust chiqmaydi; |
| 145 | `v3103.ts` | v3.10.2 — jonli xarita |
| 157 | `k10_elv_elektrovoz_tortuv_agregati.ts` | Vagonlardagi «📦 Oylik toʻplam» tekshiruvining oʻzi: Hisobotlar → ⚡ Elektrovozlar → hisobot fayllarini yuklash. |
| 237 | `v61gps.ts` | 6.1 — 11-band (muallif 08:19 video: Mashinistlar → Jonli xarita, temir yoʻl demosi) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_avto_import_2027`, `agmk_disp_ntf_`, `agmk_gd_hide`, `agmk_gd_view`, `agmk_gps_dev`, `agmk_harakat`, `agmk_lok_import_2023`, `agmk_lv_demo_spd`, `agmk_nv_routes`, `agmk_tep_import_2026`

## Server API

`/api/geo/v1/rev`, `/api/gps/v1/last`, `/api/pos/v1`, `/api/trk/v1`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
