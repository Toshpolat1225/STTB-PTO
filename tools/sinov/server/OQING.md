# AGMK-STTB — TEST serveri

Haqiqiy serverdan **butunlay alohida**: oʻz bazasi, kalitlari, sertifikati va zaxiralari. Bir xil obrazda ishlaydi.

| | Haqiqiy server | TEST serveri |
|---|---|---|
| Papka | `C:\AGMK\AGMK-STTB` | `C:\AGMK\AGMK-STTB-SINOV` |
| Telefonlar | 8443 | **9443** |
| Panel | http://127.0.0.1:8080 | **http://127.0.0.1:9080** |
| DBeaver | 127.0.0.1:5432 | **127.0.0.1:5433** |

1. `SINOV_YOQISH.bat` — serverni yoqadi va bazani «TEST serveri» deb belgilaydi.
2. `SINOV_MALUMOT_YUKLASH.bat` — sinov maʼlumotlarini yuklaydi:
   - **ilova qatlami**: 1 216 texnika, 1,5 yillik taʼmir tarixi (≈9 300 taʼmir, 26 000 voqea), TMC (MTTB: berilgan, kelgan, zayavkalar), buxgalteriya;
   - **ogʻir qatlam**: `sinov` sxemasida kuniga TR, DR va KR dan 100 tadan, ya'ni 162 000 taʼmir va ≈1,4 mln TMC qatori. Hammasi bogʻlanish (FK) va indekslar bilan, hisobot koʻrinishlari: `sinov.v_oylik`, `sinov.v_texnika`, `sinov.v_tmc_sarf`.
3. Telefonda: kirish oynasi → «📡 Serverga ulanish» → **9080** paneldagi QR. Hisob va parollar haqiqiy server bilan bir xil boshlangʻich kodlar.
4. `SINOV_TOXTATISH.bat` — toʻxtatadi (maʼlumotlar saqlanadi).

Sinov maʼlumotlaridagi barcha ism-familiyalar soxta («SINOV …»). Yuklash skriptlari bazada `sinov_server` belgisi boʻlmasa ishlamaydi, shuning uchun haqiqiy bazaga tasodifan ham yuklanmaydi.
