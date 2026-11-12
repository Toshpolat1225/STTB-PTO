# features/_yangilanishlar

**Bir nechta boʻlimni birdan oʻzgartirgan versiya paketlari.**

Bu papkadagi fayllar ilovaning turli versiyalarida bir nechta boʻlimga birdan kiritilgan oʻzgarishlar paketidir. Ular oldingi funksiyalarni `agmkExtend` bilan oʻraydi, shuning uchun boʻlimlarga boʻlinmagan va **yigʻish tartibi (`TARTIB.json`) saqlanishi shart**.

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 133 | `fin.ts` | v3.6.2 — yakunlash paketi: |
| 136 | `v365.ts` | v3.6.4 — taqdimotdan keyingi tuzatishlar (13 band) |
| 137 | `fix366.ts` | v3.6.6 — 3.6.5 ustidan tuzatishlar (xavfsizlik va barqarorlik) |
| 138 | `v370.ts` | v3.7.0 |
| 139 | `v380.ts` | v3.8.0 |
| 141 | `v390.ts` | v3.9.0 |
| 142 | `v3100.ts` | v3.10.0 |
| 143 | `v3101.ts` | v3.10.0 (2-qism) |
| 144 | `v3102.ts` | v3.10.1 |
| 148 | `k01_v3110.ts` | v3.11.0 |
| 164 | `v3162.ts` | v3.16.2 — 3.16.1 (boshqa sessiya) asl manbaga birlashtirildi; kuzatilgan kamchiliklar tuzatildi |
| 169 | `v3167.ts` | v3.16.7 — boʻlimlar bir-biriga bogʻlandi |
| 171 | `v3170.ts` | v3.17.0 — sinovdagi kamchiliklar (docs/KAMCHILIKLAR.md, 1–18) va yagona qoida |
| 173 | `v3181.ts` | v3.18.1 — sinovdagi kamchiliklar (docs/KAMCHILIKLAR.md, 3.18 boʻlimi) |
| 181 | `v40.ts` | v4.0 — Skaner: «toza hujjat» (docs/KAMCHILIKLAR.md K-52) |
| 182 | `v47.ts` | v4.7 — tuzatishlar toʻplami |
| 189 | `v48.ts` | v4.8 — muallif kamchiliklari (23.10.2026) |
| 190 | `v49.ts` | v4.9 — muallif «oltin qoidasi» (24.10.2026) |
| 212 | `v57web.ts` | 5.7 — muallif kamchiliklar roʻyxati (30.10.2026): |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_audit_v1`, `agmk_backfab_pos`, `agmk_bk_last`, `agmk_bk_snooze`, `agmk_card_alpha`, `agmk_dsn_base`, `agmk_dsn_pend`, `agmk_dsn_pub`, `agmk_ex_fmt`, `agmk_fired`, `agmk_fot_cfg_v1`, `agmk_fot_hist_v1`, `agmk_geozones`, `agmk_h8_srok_`, `agmk_home_list`, `agmk_hr_park`, `agmk_icons_v1`, `agmk_img_orig`, `agmk_kir_lock`, `agmk_kir_ovr`, `agmk_kir_pick`, `agmk_lv_maptype`, `agmk_lv_note_hide`, `agmk_mb_dig_`, `agmk_mb_ntf_`, `agmk_mm_bs_v1`, `agmk_mm_req`, `agmk_my_trail`, `agmk_nar_chk_v1`, `agmk_nar_v1`, `agmk_nar_vt_cfg`, `agmk_nar_vt_v1`, `agmk_nar_wag_v1`, `agmk_nv_base`, `agmk_offchip_hide`, `agmk_offchip_pos`, `agmk_offpill_day`, `agmk_open_all`, `agmk_resume`, `agmk_sig_`, `agmk_sig_cache_`, `agmk_sig_pend_`, `agmk_sigpin`, `agmk_sigpin_lock`, `agmk_sync_base`, `agmk_trk_q`, `agmk_ui1_`, `agmk_v7_tar`, `agmk_view`, `agmk_vt_active`

## Server API

`/api/adm/v1/pw`, `/api/ocr/v1`, `/api/pack/v1/sxema`, `/api/pos/v1`, `/api/pos/v1/trail`, `/api/roster/v1/oklad`, `/api/seed/v1/mbs`, `/api/seed/v1/nartar`, `/api/sig/v1/me`, `/api/sig/v1/pin`, `/api/sign/v1/docs`, `/api/sign/v1/docs/`, `/api/sign/v1/inbox`, `/api/trk/v1`, `/api/vt/v1/active`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
