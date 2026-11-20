# features/hisobot_tekshiruvi

**Oylik toʻplam va 1C (Forma-30) bilan spravka-raschet tekshiruvi, haftalik achot.**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 74 | `073_v2_4_oylik_toplamni_tekshirish_bir_xodimning_bir.ts` | v2.4 — OYLIK TO'PLAMNI TEKSHIRISH (bir xodimning bir oylik hujjatlari birga) |
| 75 | `074_tekshiruv.ts` | TEKSHIRUV |
| 76 | `075_v2_4_oylik_toplam_ekran_qismi_bir_necha_fayl_tur.ts` | v2.4 — Oylik to'plam: ekran qismi (bir necha fayl, turini aniqlash, natija) |
| 97 | `096_v2_9_hisobot_tekshiruviga_qoshimchalar.ts` | v2.9 — Hisobot tekshiruviga qo'shimchalar |
| 105 | `report.ts` | v3.0 — HISOBOT TEKSHIRUVIGA QO'SHIMCHALAR |
| 119 | `weekly.ts` | v3.1 — 📅 HAFTALIK ACHOT (Forma-30 dan) — «Dalolatnoma va hisobotlar» bo'limida |
| 202 | `v52hs.ts` | 5.2 — Hisobot tekshiruvi: ochiq savollar yopildi (muallif, 28.10.2026; docs/HISOBOT_TEKSHIRUV.md, 6-boʻlim) |
| 211 | `v56chk.ts` | 5.6 — Hisobot (achot) tekshiruvi: aniqlik (muallif, 30.10.2026 — taqdimot oldidan) |
| 218 | `v58word.ts` | 5.8 — Hisobot (achot) tekshiruvi: Word hujjatlar (muallif, 30.10.2026, 8-band) |
| 224 | `v59chk.ts` | 5.9 — 12-band (muallif, 02.11.2026 10:29–11:19): hisobot tekshiruvidagi notoʻgʻri zamechaniyalar |
| 242 | `v61f30.ts` | 6.1 (138) — 1C (Forma-30) ga urilgan, lekin spravka-raschetda yoʻq talabnomalar (buxgalter savoli, 04.11.2026) |
| 246 | `v62own.ts` | 6.2 (141) — 🔒 HISOBOT TEKSHIRUVLARI AKKAUNT BOʻYICHA (muallif, 08.11.2026) |
| 251 | `v62hsshpz.ts` | 6.2 (144) — 🧾 MASTER HISOBOTI: ШПЗ 221, 222, 08100 DAN TASHQARI MATERIALLAR — KOʻK (muallif, 13.11.2026) |
| 250 | `v62wkshpz.ts` | 6.2 (144) — 📅 HAFTALIK ACHOT: FAQAT ШПЗ 221, 222, 08100 (muallif, 13.11.2026) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_ceh_map`, `agmk_dvgrp_v1`, `agmk_dvpass_v1`, `agmk_hp3`, `agmk_u_`, `agmk_weekly_v1`

## Server API

`/api/files/v1`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
| 254 | `v62yonwk.ts` | 6.2 (146) — 📅 HAFTALIK RASXOD — har bir yoʻnalish uchun alohida skladlar, tarix, ШПЗ qoidasi (muallif, 16.11.2026) |
