# features/core

**Yadro: ishga tushish, saqlash, menyu, dizayn, server rejimi, oflayn, umumiy interfeys.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 1 | `000_yadro.ts` | Ilova bosqichma-bosqich kengaygan: ayrim funksiyalarga keyingi boʻlimlar qoʻshimcha qadam qoʻshadi. |
| 2 | `001_11_bosqich_oq_tizim_oynalari_alert_confirm_promp.ts` | YANGI (11-bosqich): oq tizim oynalari (alert / confirm / prompt) o'rniga dastur oynasi |
| 3 | `002_qoshimchalar_ortga_oldinga_joyi_parametrlar_shta.ts` | YANGI QO'SHIMCHALAR: ortga/oldinga joyi, Parametrlar, Shtatlar ro'yxati, |
| 5 | `004_3_bosqich_rasmlar_indexeddbda_10_mb_gacha_asl_si.ts` | YANGI (3-bosqich): rasmlar IndexedDB'da (10 MB gacha asl sifat), |
| 9 | `008_7_bosqich_adashib_yuklangan_rasmni_ochirish_lavo.ts` | YANGI (7-bosqich): adashib yuklangan rasmni o'chirish, lavozimni ro'yxatdan tanlash |
| 69 | `068_v2_0_parametrlar_asosiy_sahifa_bolimlari_yashiri.ts` | v2.0 — Parametrlar → «🧩 Asosiy sahifa boʻlimlari»: yashirish / koʻrsatish / tartib |
| 71 | `070_v2_0_korxona_serveri_ichki_tarmoq_ofis_kompyuter.ts` | v2.0 — KORXONA SERVERI (ichki tarmoq, ofis kompyuteri) ga QR orqali ulanish |
| 83 | `082_v2_4_holatni_kochirish_paketi_agmk.ts` | v2.4 — 📦 HOLATNI KO'CHIRISH PAKETI (.agmk) |
| 90 | `089_v2_5_mayda_tuzatishlar.ts` | v2.5 — mayda tuzatishlar |
| 101 | `v61yk.ts` | 6.1 (138) — 🔒 YOPIQ KONTUR (muallif tasdiqladi, 04.11.2026; IT talabi: «xavfsizlik birinchi oʻrinda») |
| 102 | `core.ts` | v3.4 — ILOVA YADROSI («suyak»): modullar, sinov guruhi, sinxron to'plamlar, xatolar jurnali |
| 103 | `srv.ts` | v3.0 — SERVER REJIMI (noutbuk / korxona serveri, agmk-server) |
| 104 | `fix_xlsx.ts` | v3.0 — Excel o'qish: yashirilgan (скрытые / filtr bilan berkitilgan) qatorlarni aniqlash |
| 114 | `design.ts` | v3.0 — 🖌 DIZAYN: fon rasmlari, logotip, bildirishnoma ovozi (har bir qurilma o'zi uchun) |
| 117 | `drag.ts` | v3.0 — ↔️ BOSH SAHIFA YUQORI TUGMALARINI SURISH |
| 118 | `backup.ts` | v3.0 — 💾 TO'LIQ ZAXIRA NUSXA (hamma narsa: baza, aktlar, hisobotlar, MTTB, polojeniya, sozlamalar, rasmlar va fayllar) |
| 123 | `offline.ts` | v3.2.1 — 📴 SERVER BILAN HAM, SERVERSIZ HAM |
| 128 | `integ.ts` | v3.6 — 🔗 BO'LIMLAR INTEGRATSIYASI (real vaqtda, bitta manba) |
| 130 | `menu.ts` | v3.6.1 — 🧭 BOSH MENYU: yangi tartib va guruhlar |
| 134 | `zamsync.ts` | v3.2.2 — 🚨 ZAMECHANIYA RASMLARI VA OVOZLARI BOSHQA TELEFONLARDA HAM |
| 146 | `v3104.ts` | v3.10.3 — Bosh sahifa va bo'limlar: belgilar o'rniga rasmlar; Lokomotivlar → 🚂 Teplovozlar / ⚡ Elektrovozlar |
| 147 | `ver.ts` | v3.0 — Versiya va «Nima yangi» |
| 149 | `k02_lpfix.ts` | oxirgi bosilgan kartochka — sozlama oynasiga ikonka tugmasini qoʻshish uchun |
| 158 | `k11_fix_guruh_sahifasidagi_kartoch.ts` | Bosh sahifadagi ayrim kartochkalarning bosish amali JS orqali berilgan (onclick xususiyati) — guruh sahifasiga nusxa oli |
| 161 | `k14_openall_ilova_yakunlanguncha_h.ts` | Istisno (faqat haqiqiy administrator): foydalanuvchi / rol / parol boshqaruvi, xavfsizlik va kalit sozlamalari; oklad (m |
| 175 | `v3191.ts` | v3.19.1–3.19.2 — bosh sahifa tartibi va bildirishnomalar (docs/KAMCHILIKLAR.md) |
| 177 | `v3193img.ts` | v3.19.3 — boʻlim ikonkalari (192 px JPEG): Ishchi xodimlar guruhi (original chizma), Mening ishchilarim, |
| 179 | `v3194img.ts` | v3.19.4 — rasmlar (muallif bergan): Ishchi xodimlar (bosh sahifa, K-50), Sex va boʻlinma ishchilari (K-51). 192 px, toʻl |
| 180 | `v3194.ts` | v3.19.4 — roʻyxat koʻrinishi, bosh sahifa qidiruvi, nomlar va rasmlar (docs/KAMCHILIKLAR.md K-47–K-51) |
| 214 | `v57sess.ts` | 5.7 — «Ilova oʻzidan-oʻzi chiqib ketyapti» (muallif, 30.10.2026) |
| 215 | `v58ui.ts` | 5.8 — muallif roʻyxati (30.10.2026), 1–4-bandlar: |
| 219 | `v59net.ts` | 5.9 — 1-band: server ulanmaganda tugmalar qotmasin (muallif videosi, 02.11.2026 08:08) |
| 220 | `v59ui.ts` | 5.9 — 2–6-bandlar (muallif, 02.11.2026): koʻrinish |
| 221 | `v59menu.ts` | 5.9 — 8-band (muallif, 02.11.2026): Web (≥ 1200 px) — chapdagi doimiy boʻlimlar paneli doim ochiq turmaydi. |
| 223 | `v59fs.ts` | 5.9 — 11-band (muallif, 02.11.2026 10:08): barcha uzun roʻyxatlarda «tez surish» tugmasi |
| 225 | `v59dl.ts` | 5.9 — 9-band (muallif, 02.11.2026 09:39): «⬇️ Yuklab olinganlar» (brauzerdagi kabi) |
| 228 | `v59hdr.ts` | 6.0 (muallif tasdiqlagan namuna, 02.11.2026 — docs: HASAN_SARLAVHA_DIZAYN): ichki oraliq sahifalarning |
| 229 | `v60ui.ts` | 6.0 — mayda tuzatishlar (muallif, 02.11.2026; docs/REJA_6.0.md) |
| 230 | `v60touch.ts` | 6.0 — 5-6-bandlar (muallif videolari 15:26, 15:30): telefondagi ILOVADA (APK) «tez surish» tugmasi va AI tugmasi |
| 232 | `v60hdr.ts` | 6.0 — 1, 14, 15, 16-bandlar (muallif tanlovi: D2, 02.11.2026): BOSH SAHIFA TEPASI — yangi dizayn |
| 234 | `v61hdr.ts` | 6.1 — 6, 9, 10, 13-bandlar (muallif tasdiqlagan namunalar «tepa_E3», «tepa_W1»; 03.11.2026): BOSH SAHIFA TEPASI «E» |
| 235 | `v61thm.ts` | 6.1 — 20-band (muallif 10:00 / 10:06, namuna «fon_poly.png»): ikkita qoʻshimcha mavzu |
| 236 | `v61ui.ts` | 6.1 — 7, 8, 12, 15-bandlar (muallif 03.11.2026) |
| 238 | `v61data.ts` | 6.1 — 14 va 16-bandlar (muallif 03.11.2026) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_accounts`, `agmk_ai_pos`, `agmk_alive`, `agmk_allow_hosts`, `agmk_calc_del`, `agmk_current_user`, `agmk_db_v2`, `agmk_design_v1`, `agmk_dl59`, `agmk_dr_months`, `agmk_dv_nd_hide_`, `agmk_errlog`, `agmk_f30`, `agmk_flags`, `agmk_formulas`, `agmk_fot_mig3151`, `agmk_gps_dev`, `agmk_harakat`, `agmk_hdr_pos`, `agmk_hisob_set`, `agmk_home_my`, `agmk_home_vis`, `agmk_infra_geo`, `agmk_m_`, `agmk_map_georef`, `agmk_map_yig`, `agmk_media`, `agmk_menu_grp`, `agmk_nd_akts`, `agmk_nd_docs`, `agmk_nd_sign41`, `agmk_nd_signers`, `agmk_net_block`, `agmk_off_signup`, `agmk_open_all`, `agmk_shtat_list`, `agmk_shtat_lock`, `agmk_shtat_pw`, `agmk_shtat_rahbar`, `agmk_shtat_tree`, `agmk_tiles_on`, `agmk_tj60`, `agmk_toliq_zaxira_`, `agmk_ver_seen`

## Server API

`/api/files/v1`, `/api/files/v1/`, `/api/log/v1`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
| 252 | `v62yopiq.ts` | 6.2 (146) — 🔒 Yopiq kontur, yakuniy: tashqi sunʼiy intellekt butunlay oʻchirilgan |
