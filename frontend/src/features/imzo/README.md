# features/imzo

**Ichki elektron imzo (korxona ichidagi tasdiqlash).**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 111 | `sign.ts` | v3.0 — ✍️ ICHKI ELEKTRON IMZO (korxona ichidagi tasdiqlash; E-IMZO emas) |
| 121 | `aisend.ts` | v3.1 — 📤 HUJJATNI ISTALGAN XODIMGA YUBORISH va ✍️ AVTOMATIK IMZOGA YUBORISH |
| 170 | `v3168.ts` | v3.16.8 — elektron imzo paketi |
| 245 | `v62sigoff.ts` | 6.2 (141) — ✍️ IMZOLANGAN HUJJAT OFLAYNDA HAM OCHILADI (muallif, 08.11.2026) |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_sig_`, `agmk_sig_auto`, `agmk_sig_cache_`, `agmk_sig_rem_`, `agmk_sig_snap_`, `agmk_sigoff_idx`

## Server API

`/api/sig/v1/me`, `/api/sign/v1/docs`, `/api/sign/v1/docs/`, `/api/sign/v1/inbox`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
