# AGMK-STTB PTO — yopiq kontur: IT uchun tekshiruv koʻrsatmasi (6.1, build 138)

Maqsad: maʼlumot korxonadan tashqariga chiqmasligini **ishonch bilan emas, oʻz qoʻlingiz bilan tekshirish**.
Quyidagi har bir bandni ilova muallifisiz, mustaqil bajarish mumkin.

## 1. Ilovada nima qilindi

| № | Chora | Qayerda (kod) |
|---|---|---|
| 1 | Tashqi xizmatlar **koddan olib tashlandi**: tashqi AI (Anthropic Claude, Google Gemini), Microsoft ovoz xizmati, OpenStreetMap soʻrovi, OSRM marshruti, xarita kutubxonasini internetdan (unpkg, jsdelivr) yuklash. Ularning oʻrnida `agmkNoNet()` — chaqirilsa xato beradi, tarmoqqa hech narsa ketmaydi | `frontend/src/features/` dagi `024_…`, `025_…`, `049_…`, `053_…`, `066_…`, `085_…`, `018_…` fayllari, `frontend/src/features/texnika/mash.ts` |
| 2 | Bulut AI sozlamasi yashirildi va hech qachon yoqilmaydi (`aicGet` → kalit boʻsh, `aiCloudReady` → har doim yoʻq) | `frontend/src/features/core/v61yk.ts` |
| 3 | Xarita fonlari internetdan olinmaydi: `agmk-tile://…` manzili korxona serveridagi `/tiles/` papkaga yoʻnaltiriladi (IT xarita joylasa), boʻlmasa — boʻsh toʻq fon | `frontend/src/features/core/v61yk.ts` |
| 4 | **Tarmoq qoʻriqchisi** — `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, rasm manzillari, `window.open`: faqat ichki tarmoq (10.\*, 172.16–31.\*, 192.168.\*, 127.\*, \*.local, \*.lan) va sozlangan korxona serveri. Boshqasi bloklanadi va hisobga yoziladi (faqat host nomi) | `frontend/src/features/core/v61yk.ts` |
| 5 | **CSP** (brauzer darajasidagi taqiq): tashqi skript, shrift, freym, obyekt yuklanmaydi | `frontend/build.mjs` |
| 6 | **Yigʻishdagi tekshiruv**: yigʻilgan faylda tashqi manzilga murojaat qiladigan kod (fetch, xarita foni, WebSocket, XHR, `<script src>`, `<link>`, CSS `@import`) yoki taqiqlangan xizmat nomi topilsa — `node build.mjs` xato bilan toʻxtaydi, versiya chiqmaydi | `frontend/build.mjs` |
| 7 | Kompyuter dasturi (Electron) — avvaldan internetga chiqishni bloklaydi | `desktop/main.js` (`allowed`, `onBeforeRequest`) |
| 8 | Avtomatik sinov: tashqi soʻrovlar bloklanishi, ichki tarmoq ishlashi, sahifa ochilganda internetga **birorta ham** soʻrov ketmasligi | `frontend/tests/v61yk.e2e.cjs` |

## 2. Oʻzingiz tekshiring

1. **Kodni oʻqing.** Toʻliq kod: `C:\AGMK\AGMK-STTB` (va GitHub, muallif oʻqish huquqi beradi).
   Qidiring: `findstr /s /i "anthropic googleapis openai arcgisonline openstreetmap" frontend\src\*.ts` — natija faqat izohlarda boʻlishi kerak.
2. **Yigʻish tekshiruvi:** `cd C:\AGMK\AGMK-STTB\frontend` → `node build.mjs` → «🔒 Yopiq kontur tekshiruvi: tashqi murojaat yoʻq».
   Sinab koʻring: biror `.ts` faylga `fetch('https://example.com')` qoʻshib yigʻing — yigʻish toʻxtashi kerak.
3. **Internetsiz ishlash:** serverni va telefonlarni internetsiz tarmoqqa ulang (faqat lokal) — ilova toʻliq ishlashi kerak.
4. **Firewall (eng ishonchli):** server kompyuterida chiquvchi ulanishlarni faqat ichki tarmoqqa ruxsat bering
   (Windows Defender Firewall → Outbound rules → «Block» hammasi, «Allow» faqat korxona subtarmoqlari). Ilova ishlashda davom etishi kerak.
5. **Trafikni yozib koʻring:** Wireshark bilan bir ish kuni davomida server va bitta telefon trafigini yozing,
   filtr `not (ip.dst == 10.0.0.0/8 or ip.dst == 172.16.0.0/12 or ip.dst == 192.168.0.0/16)` — ilova tomonidan tashqi manzil boʻlmasligi kerak.
6. **Ilova ichidagi hisob:** brauzer konsolida `agmkNetReport()` — bloklangan urinishlar soni va hostlari (boʻsh yoki faqat havolalar).

## 3. Ishlab chiqish tartibi (tashkiliy)

- Ilovani rivojlantirish **faqat soxta (namuna) maʼlumot** bilan: haqiqiy roʻyxat, telefonlar, toʻliq 1C fayllar, ismli ekran rasmlari tashqi vositalarga berilmaydi.
- Haqiqiy maʼlumotli **server kompyuteri** ishlab chiqish vositalariga ulanmaydi (alohida kompyuter boʻlishi tavsiya etiladi).
- Yangi versiya — faqat `node build.mjs` dan (yopiq kontur tekshiruvi bilan), sinovlar (`tests\*.e2e.cjs`) oʻtgandan keyin.

## 4. Ochiq savollar IT ga

- Server uchun doimiy IP va ichki DNS nomi (`AGMK_PUBLIC_HOSTS`).
- Xarita kerak boʻlsa — korxona hududi xaritasini (offline tile) serverga `/tiles/` ga joylash.
- Firewall qoidalarini IT oʻzi qoʻyishi va nazorat qilishi.
