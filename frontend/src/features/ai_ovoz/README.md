# features/ai_ovoz

**Mahalliy yordamchi va ovozli buyruqlar (tashqi AI xizmatlari yopiq kontur sababli oʻchirilgan).**

## Fayllar (yigʻish tartibida)

| # | Fayl | Tavsif |
|---|---|---|
| 17 | `016_17_bosqich_ai_yordamchi_har_bir_sahifada_yangi_b.ts` | YANGI (17-bosqich): 🫧 AI yordamchi har bir sahifada, yangi bo'limlarni tushunadi; |
| 23 | `022_23_bosqich.ts` | YANGI (23-bosqich): |
| 24 | `023_24_bosqich_ai_belgisi_doimiy_va_jonli_ai_tugmasi.ts` | YANGI (24-bosqich): AI belgisi, doimiy va jonli AI tugmasi |
| 25 | `024_25_bosqich_haqiqiy_ai_ulanishi_gemini_claude_3d.ts` | YANGI (25-bosqich): Haqiqiy AI ulanishi (Gemini / Claude) + 3D sharcha |
| 26 | `025_26_bosqich_mahalliy_ai_bazadan_aqlli_qidiruv_xav.ts` | YANGI (26-bosqich): mahalliy AI (bazadan aqlli qidiruv), xavfsizlik, |
| 27 | `026_27_bosqich_lupa_va_mikrofon_belgilari_yopiq_qidi.ts` | YANGI (27-bosqich): lupa va mikrofon belgilari, yopiq qidiruv, |
| 28 | `027_28_bosqich_4_til_bitta_mikrofon_qongiroq_joyi_pp.ts` | YANGI (28-bosqich): 4 til, bitta mikrofon, qo'ng'iroq joyi, PPR tahrirlash, |
| 29 | `028_29_bosqich_dizayn_mavzulari_bosh_sahifa_paneli.ts` | dizayn mavzulari bosh sahifa paneli |
| 30 | `029_29_bosqich_2_ai_savol_tahlili_filtrlar_muddatlar.ts` | vagon turlari (bazadagi type bilan) |
| 35 | `034_30_bosqich_4_ey_ai_ovozli_chaqiruv_va_agent_buyr.ts` | Hujjat yuborish |
| 36 | `035_31_bosqich_1_3_salom_ey_ai_signalsiz_labbay_aziz.ts` | Ism + otasining ismi (hurmat shakli): "Abdurauf o'g'li" -> "Abduraufovich", "Karim qizi" -> "Karimovna" |
| 37 | `036_31_bosqich_4_ai_bilim_bazasi_indeks_hujjat_yukla.ts` | 4 ai bilim bazasi indeks hujjat yukla |
| 38 | `037_31_bosqich_5_server_bilan_sinxronlash_supabase.ts` | 5 server bilan sinxronlash supabase |
| 41 | `040_32_bosqich_3_4_suhbat_paytida_chaqiruv_tinglovch.ts` | 3 4 suhbat paytida chaqiruv tinglovch |
| 43 | `042_33_bosqich_ovozli_suhbat_rollar_va_huquqlar_yozi.ts` | ovozli suhbat rollar va huquqlar yozi |
| 46 | `045_1_3_ovozli_suhbat_ai_oynasida_mikrofon.ts` | 1-3) OVOZLI SUHBAT: AI oynasida mikrofon = uzluksiz suhbat, to'liq ekranli oyna ochilmaydi |
| 47 | `046_10_ovozda_buzilgan_atamalarni_togrilash_standart.ts` | 10) Ovozda buzilgan atamalarni to'g'rilash + standart haqida umumiy savol |
| 54 | `053_34_bosqich_v1_8_sof_ozbekcha_talaffuz_oqib_beray.ts` | v1 8 sof ozbekcha talaffuz oqib beray |
| 55 | `054_34_bosqich_v1_8_ai_xatlar_yopish_buyruqlari_suhb.ts` | v1 8 ai xatlar yopish buyruqlari suhb |
| 61 | `060_v1_9_ovozli_ishni_toxtatish_akt_ustasida_mikrofo.ts` | Ovozli buyruq bilan to'xtatish |
| 70 | `069_v2_0_mening_ishlarim_ai_ishni_ozi_topadi_va_tayy.ts` | v2.0 — «🤖 MENING ISHLARIM»: AI ishni o'zi topadi va tayyorlab qo'yadi, xodim faqat tekshirib tasdiqlaydi |
| 77 | `076_v2_4_ai_google_qidiruvi_gemini_grounding_va_tezl.ts` | v2.4 — AI: Google qidiruvi (Gemini grounding) va tezlik |
| 91 | `090_v2_6_1_bosqich_ai_tugmasini_surish_boglashda_bek.ts` | v2.6 — 1-bosqich: AI tugmasini surish; bog'lashda bekor qilish/tozalash; GPS tanlovni olib tashlash; |
| 100 | `099_v2_9_ai_tugmasi_bosilganda_jim_ochiladi_labbay_d.ts` | v2.9 — AI tugmasi bosilganda: jim ochiladi («Labbay» demaydi, mikrofon o'zi yoqilmaydi). |
| 106 | `aiflow.ts` | v3.0 — 🎙 AI ISH OQIMI (ovoz yoki yozma buyruq bilan) |
| 107 | `ai.ts` | v3.0 — AI: NOTO'G'RI JAVOB BERMASLIK (asosiy qoida: javob bo'lmagani noto'g'ri javobdan yaxshi) |
| 135 | `ainorm.ts` | v3.0 — 🧠 SAVOLNI TUSHUNISH: bir savol turli xil so'ralsa ham bir xil tushuniladi |

## Saqlash kalitlari (localStorage / sinxron)

`agmk_addr_`, `agmk_ai_cfg`, `agmk_ai_log`, `agmk_ai_pos`, `agmk_ai_teach`, `agmk_ai_voice`, `agmk_lang`, `agmk_mic_blocked`, `agmk_mic_tip`, `agmk_ops_day_`, `agmk_outbox_`, `agmk_read_mode`, `agmk_reminders`, `agmk_sec_aioff`, `agmk_sec_block`, `agmk_sec_log`, `agmk_sp_user`, `agmk_sync_cfg`, `agmk_sync_ses`, `agmk_sync_state`, `agmk_theme_`, `agmk_tts_cloud`, `agmk_voice_pause`, `agmk_wake`

## Qoidalar

- Fayl nomi oʻzgartirilmaydi (yigʻilgan ilovadagi belgilar shu nomga bogʻlangan).
- Yangi fayl — shu papkaga va `TARTIB.json` dagi `mod` roʻyxatining oxiriga.
- Mavjud funksiyani oʻzgartirish — `agmkExtend` bilan oʻrash orqali.
