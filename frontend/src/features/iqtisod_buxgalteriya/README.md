# features/iqtisod_buxgalteriya

**FOT tahlili, jirovka, tasdiqlangan normalar, ОС-3, xarajatlar.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 53 | `052_33_bosqich_4_buxgalteriya_va_iqtisodiyot_xarajat.ts` | 4 buxgalteriya va iqtisodiyot xarajat |
| 84 | `083_v2_4_hisob_kitob_formulalari_bazasi_buxgalteriya.ts` | v2.4 — 🧮 HISOB-KITOB FORMULALARI BAZASI (buxgalteriya, normalar, hisobot tekshiruvi) |
| 96 | `095_v2_9_tasdiqlangan_norma_rasxod.ts` | v2.9 — 📐 TASDIQLANGAN NORMA RASXOD (МЕЪЁРИ / НОРМЫ) |
| 125 | `iqt.ts` | v3.5 — 📊 IQTISODIYOT («Buxgalteriya va iqtisodiyot» ekranidagi yangi yorliqlar) |
| 150 | `k03_fot_xato.ts` | ФОТ tahlili — iqtisodchi javoblari (05.10.2026): |
| 151 | `k04_fotlay_sex_varaqlarini_1_namun.ts` | Iqtisodchi ЖДЦ-1 varag'ida Excel'da «Январь…Июль» ustunlarini (B:AB) o'chirib, «Август»dan boshlanadigan ko'rinish qilga |
| 152 | `k05_prz_buxgalteriya.ts` | «Сведение по фактическим затратам» (masalan ВС УПЖТ, 92-sex) → «Общий производственные расходы %» (kalkulyatsiyadagi «Пр |
| 153 | `k06_jir_iqtisodiyot_jirovka_tekshi.ts` | Ikki oy jirovkasi (oʻtgan va joriy) — ishchining premiyasi qolib ketmaganmi (ФОТ tahliliga aloqasi yoʻq): |
| 160 | `k13_fotper_prognozi_ikkinchi_progn.ts` | Har oy 2 ta prognoz fayli: 1) ishlab chiqarish qismi (avvalgidek); 2) «… РАСХОДУ ПЕРИОД» — «Расходы периода» qatorlari s |
| 165 | `v3163.ts` | v3.16.3 — FOT tahlili: «Расходы периода» prognozi oʻzi tekshiradi va oʻzini moslaydi |
| 200 | `v50os3.ts` | 5.0 — 📊 ОС-3 (думпкар kapital taʼmiri xarajatlari) — bitta tugma bilan (muallif soʻrovi, 28.10.2026) |
| 205 | `v52nrm.ts` | 5.2 — Tasdiqlangan normalar 2026 va 2027 ilova ichida (muallif, 29.10.2026; docs/REJA_5.2.md 7–8-band) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_bux`, `agmk_formulas`, `agmk_fot_sprav_cfg`, `agmk_norm_v1`, `agmk_os3_list`, `agmk_prz_v1`

## Server API

`/api/roster/v1/oklad`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
