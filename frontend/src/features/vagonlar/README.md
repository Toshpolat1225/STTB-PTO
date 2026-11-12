# features/vagonlar

**Vagonlar bazasi va pasporti, taʼmir grafigi, probeg, QR yorliqlar, gʻildirak juftliklari.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 12 | `011_12_bosqich_vagonlar_bazasi_vagonlar_pasport_kart.ts` | YANGI (12-bosqich): VAGONLAR BAZASI — "УПЖТ vagonlar pasport kartotekasi" Excel faylidan |
| 50 | `049_9_vagon_eslatma_albomi_holatni_darhol_rasmga_oli.ts` | 9) VAGON ESLATMA ALBOMI — holatni darhol rasmga olish, vaqt tarixi, dalolatnomaga o'tkazish |
| 57 | `056_v1_8_1_vagon_modellari_texnik_tavsifi_internetda.ts` | v1 8 1 vagon modellari texnik tavsifi internetda |
| 58 | `057_v1_8_1_vagon_modellari_texnik_tavsifi_ai_javobla.ts` | Model aliaslari |
| 82 | `081_v2_4_pasport_toldirish.ts` | v2.4 — 📋 PASPORT TO'LDIRISH |
| 85 | `084_v2_5_vagon_raqamini_bolaklab_aytilgan_yozilgan_h.ts` | v2.5 — Vagon raqamini bo'laklab aytilgan/yozilgan holda yig'ish |
| 88 | `087_v2_5_pasport_bolimlar_tartibi_toliqlik_chizigi_s.ts` | v2.5 — PASPORT: bo'limlar tartibi, to'liqlik chizig'i sarlavha ostida (to'liq kenglikda), |
| 94 | `093_v2_7_tamir_grafigi_yillik_ppr_oylik_jadval.ts` | v2.7 — 🗓 TA'MIR GRAFIGI (yillik PPR → oylik jadval) |
| 98 | `097_v2_9_tamir_grafigi_kochirilgan_vagon_izi_namunad.ts` | v2.9 — 🗓 TA'MIR GRAFIGI: ko'chirilgan vagon izi + namunadagi («31-17-18») aniq eksport |
| 132 | `vimg.ts` | v3.6.2 — vagon rasmlari (yon koʻrinish, bort yozuvlari tozalangan) va OSM temir yoʻl geometriyasi (© OpenStreetMap hissa |
| 162 | `k15_vtamir_vagon_ta_miri_bosqichla.ts` | • Pasportda rangli tugmalar; «🗑 Oʻchirish» — ✏️ Tahrirlash oynasining pastida |
| 163 | `k16_vgraf_ta_mir_grafigi_vagon_pas.ts` | • Yillik va oylik grafik — har vagon pasportidagi «Keyingi taʼmir sanasi» dan; Excel shart emas, hamma telefonda bir xil |
| 167 | `v3165.ts` | v3.16.5 — vagon guruhlari va 2ВС-105 (Q-115) muddati |
| 174 | `v3190.ts` | v3.19.0 — Vagonga QR yorliq (docs/REJA.md, gʻoyalar zaxirasi 1-navbat) |
| 176 | `v3192.ts` | v3.19.2 — QR havola, maxsus kiyim (ombor), server QR skaneri |
| 178 | `v3193.ts` | v3.19.3 — jonli QR skaner, server QR havolasi, maxsus kiyim shtat boʻyicha, pasport sarlavhasi (docs/KAMCHILIKLAR.md K-4 |
| 185 | `v44.ts` | v4.4 — 🛤 PROBEG INTEGRATSIYASI: mashinist xodkasi → har vagon km, ruda tonnasi, pasport kartochkasi |
| 203 | `v52ui.ts` | 5.2 — Vagon pasporti: sarlavha tugmalari kartochkaga sigʻadi; «📣 Bildirgi» zamechaniyalardan oldinga (muallif, 29.10.202 |
| 204 | `v52kr.ts` | 5.2 — Taʼmir grafigi: KR va DR alohida, qoidani muallif tanlaydi (29.10.2026, docs/REJA_5.2.md 6-band) |
| 213 | `v57norm.ts` | 5.7 — Taʼmir grafigi: OYLIK NORMA (imkoniyat) boʻyicha (muallif videosi, 30.10.2026) |
| 216 | `v58sig.ts` | 5.8 — Taʼmir grafigi: imzo chekuvchilar grafik oynasining oʻzida tanlanadi (Kolodka dalolatnomasidagi usul) |
| 222 | `v59vag.ts` | 5.9 — 10-band (muallif, 02.11.2026 09:52): Vagonlar parki |
| 244 | `v61kp.ts` | 6.1 (140) — 🛞 GʻILDIRAK JUFTLIKLARI (muallif, 04.11.2026) |
| 248 | `v62kpnav.ts` | 6.2 (142) — 🛞 GʻILDIRAK JUFTLIKLARI «VAGONLAR PARKI» ICHIDA (muallif, 10.11.2026) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_album`, `agmk_dr_months`, `agmk_ppr_sig`, `agmk_ppr_v1`, `agmk_vagon_import_2026`, `agmk_vg_edit`, `agmk_vg_log`, `agmk_vg_norm`, `agmk_vg_plan`, `agmk_vg_rule`

## Server API

`/api/pack/v1/sxema`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
