# features/xodimlar

**Shtat, xodimlar, davomat (SVO), mehnat muhofazasi, polojeniya, tugʻilgan kunlar.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 7 | `006_5_bosqich_pastki_qism_shikoyat_takliflar_aloqa_m.ts` | YANGI (5-bosqich): pastki qism, shikoyat-takliflar, aloqa ma'lumotlari, telefonlar |
| 8 | `007_6_bosqich_rahbar_lavozimlari_sinov_rahbari_tabel.ts` | YANGI (6-bosqich): rahbar lavozimlari, sinov rahbari, tabelni o'zgartirish, eslatmalar |
| 10 | `009_8_bosqich_shtatlar_jadvali_2026_yil_1_maydan_bol.ts` | YANGI (8-bosqich): SHTATLAR JADVALI (2026-yil 1-maydan) — bo'linma › bo'lim › lavozim |
| 11 | `010_9_bosqich_rahbariyat_nazorati_zamechaniya_bartar.ts` | YANGI (9-bosqich): RAHBARIYAT NAZORATI — zamechaniya › bartaraf qilish › qabul / qaytarish |
| 51 | `050_33_bosqich_5_mehnat_muhofazasi_instruktaj_bilim.ts` | Davriylik FAQAT korxona hujjatlaridan olingan (o'ylab topilmagan): |
| 112 | `pol.ts` | v3.0 — 📋 KUNLIK POLOJENIYA (Vagon xizmati) — «Seh va uchastkalar» bo'limida |
| 120 | `roster.ts` | v3.2 — 👷 SHTAT ROʻYXATI (20.05.2026): barcha xodimlar tabel raqami bilan |
| 129 | `mmpass.ts` | v3.6 — 🦺 MEHNAT MUHOFAZASI → XODIM PASPORTIDA (imtihonlar tarixi va keyingi muddatlar) |
| 154 | `k07_xodimlar_itr_va_ishchilar_aloh.ts` | • «Ishchi xodimlar» sahifasi ikki qism: ITR (rahbar, mutaxassis, texnik xodim) va 👷 Ishchilar (sex › kasb › ishchi). |
| 155 | `k08_mbfix_bilimlar_sinovi_sanalari.ts` | Sabab: jadval serverdan (/api/seed/v1/mbs) olinishi kerak edi, lekin korxona serverida bu manzil yoʻq — sanalar yuklanma |
| 156 | `k09_wrkseed_ishchilar_ro_yxati_1c_.ts` | Har bir telefonda bir marta oʻzi joylanadi: sex › kasb › ishchi (ITR larga tegilmaydi). Keyin kadrlar yangi roʻyxatni im |
| 159 | `k12_stpdf_struktura_sxemasini_yukl.ts` | k12 stpdf struktura sxemasini yukl |
| 166 | `v3164.ts` | v3.16.4 — 🦺 Mehnat muhofazasi: xodimning ALOHIDA kartochkasi (toʻliq ekran), hamma maʼlumot ochiq, sanalar shu yerning o |
| 168 | `v3166.ts` | v3.16.6 — xodimlarning yangi roʻyxati (1C, 13.10.2026) va 🦺 mehnat muhofazasi qoʻshimchalari |
| 172 | `v3180.ts` | v3.18.0 — «👷 Mening hodimlarim» va «🧥 Maxsus kiyim» (docs/TALABLAR_3.18.md) |
| 199 | `v49tk.ts` | 4.9 b119 — 🎂 Tugʻilgan kunlar (muallif soʻrovi, 27.10.2026) |
| 209 | `v55dav.ts` | 5.5 — 🛡 SVO: davomat (turniket kirish-chiqishi) nazorati (muallif soʻrovi, 30.10.2026) |
| 210 | `v55davimg.ts` | 5.5 — 🛡 SVO — Davomat: bosh sahifa kartasi boshqa boʻlimlardek rasmli (oʻzimiz chizgan: turniket, qalqon, soat). 192 px |
| 217 | `v58demo.ts` | 5.8 — Taqdimot demolari (server ulangan boʻlsa ham): 🦺 Mehnat muhofazasi (TB) va 🧥 Maxsus kiyim |
| 231 | `v60mon.ts` | 6.0 — 8-band (muallif videosi 15:38): SVO «🖥 Monitoring oynasi» telefonda kompyuter maketi siqilib chiqar edi |
| 240 | `v61tel.ts` | 6.1 — xodim pasportida «📞 Qoʻngʻiroq» (muallif 13:36, namuna «qongiroq_namuna.png» — tasdiqlangan) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_contacts`, `agmk_current_user`, `agmk_dav_can`, `agmk_feedback`, `agmk_kirfix_1994`, `agmk_mm`, `agmk_mm_jad_cfg`, `agmk_mm_nhh_v1`, `agmk_mm_ntf_`, `agmk_notifs`, `agmk_pol_cfg`, `agmk_pol_seen`, `agmk_pol_v1`, `agmk_roster_rep`, `agmk_roster_v`, `agmk_shtat_rahbar`, `agmk_shtat_tree`, `agmk_tk_read`, `agmk_v6_ntf_`, `agmk_v6_post`, `agmk_warn_seen`, `agmk_wrk_fix1`, `agmk_wrk_seed`, `agmk_zam_seq`

## Server API

`/api/dav/v1/assign`, `/api/dav/v1/cfg`, `/api/dav/v1/day`, `/api/dav/v1/import`, `/api/dav/v1/objects`, `/api/dav/v1/p`, `/api/dav/v1/pattern`, `/api/dav/v1/reason`, `/api/dav/v1/reason/cancel`, `/api/dav/v1/reasons`, `/api/dav/v1/tabel`, `/api/files/v1`, `/api/hr/v1/import`, `/api/kiy/v1/ack`, `/api/kiy/v1/cancel`, `/api/kiy/v1/due`, `/api/kiy/v1/issue`, `/api/kiy/v1/norma`, `/api/kiy/v1/p`, `/api/kiy/v1/person`, `/api/my/v1`, `/api/my/v1/find`, `/api/my/v1/p`, `/api/my/v1/rel`, `/api/my/v1/rel/cancel`, `/api/my/v1/tel`, `/api/my/v1/tk`, `/api/roster/v1/oklad`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
