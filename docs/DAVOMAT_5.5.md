# 5.5 — 🛡 SVO: davomat (turniket kirish-chiqishi)

Muallif soʻrovi (29–30.10.2026). Dizayn rasmlari muallif bilan kelishilgan.

## Kim koʻradi
- **SVO** (ichki qoʻriqlash, rol `svo`), **rahbariyat** (`rahbar`), **administrator** — hamma ishchilar.
- **Sex / boʻlim boshligʻi, usta** — faqat oʻziga boʻysunuvchilar (tuzilma + qoʻlda biriktirilganlar, «Mening hodimlarim» bilan bir xil).
- Qolganlar — boʻlim koʻrinmaydi. Huquqni server tekshiradi (`backend/app/api/attendance.py`).
- Turniket faylini faqat SVO va administrator yuklaydi; grafik va sababni SVO yoki oʻsha ishchining rahbari kiritadi.

## Xavfsizlik
Kirish-chiqish vaqtlari — shaxsiy maʼlumot: faqat serverda (`dav_event`), APK / HTML ga va telefon xotirasiga yozilmaydi. Har oʻzgarish `audit` va nazorat jurnaliga tushadi.

## Grafiklar (kodlar)
| Kod | Vaqt | Kim |
|---|---|---|
| I | 07:30–16:30 (5/2) | ITR — rahbariyat, muhandislar, mutaxassislar. Grafik berilmagan ITR — avtomatik shu |
| W | 07:00–16:00 (5/2) | oddiy ishchilar, 8 soat |
| D | 07:00–19:00 | 12 soatlik den |
| N | 19:00–07:00 (ertasi kuni) | 12 soatlik noch |
| V | — | dam / otsypnoy — «kelmagan» hisoblanmaydi |

Tayyor grafiklar: `itr52`, `w52`, `dnvv` (Den–Noch–Dam–Dam), `nnvv` (2 Noch–2 Dam), `ddvv` (2 Den–2 Dam). Yangisi — «➕ Yangi grafik» (`dav_pattern`).
Biriktirish (`dav_assign`): sikl «1-kun» sanasi (anchor), dan–gacha. Grafiksiz ishchi — smena birinchi kirish vaqtidan taxmin qilinadi («taxmin»), kelmasa «❔ grafik yoʻq» (sababsizlarga tushmaydi).

## Hisob (`backend/app/services/attendance.py`)
- Smena oynasi: boshlanishdan 3 soat oldin — tugashdan 5 soat keyin. Birinchi kirish → «keldi», oxirgi chiqish → «ketdi».
- Kech / erta: 5 daqiqadan koʻp boʻlsa. 12 soatlik ishchi 9 soat ishlab ketsa — «3 s erta».
- Holatlar: ishda, ketgan, sababli (`dav_reason`), sababsiz, dam, kutish (smena hali boshlanmagan), grafiksiz.
- Tabel katagi: ishlagan soat (0,5 ga yaxlit), V, B, PR; kech/erta boʻlgan kun sariq.

## Maʼlumot manbai
Hozir — PERCo-Web eksporti (Excel / CSV): «📥 Turniket maʼlumotini yuklash». Ustunlar avtomatik topiladi: Таб. №, Дата/Время (birga yoki alohida), Событие/Направление (вход/выход), Точка доступа/турникет. Takror yozuvlar qoʻshilmaydi. Turniket nomi 16 obyektdan biriga moslanadi.
Keyingi bosqich — PERCo-Web bilan toʻgʻridan-toʻgʻri ulanish (IT bilan kelishiladi).

## Ekranlar
`frontend/src/features/xodimlar/v55dav.ts`: Bugun (raqamlar, filtr tugmalari, sex/smena/turniket, qidiruv, Excel), ishchi kuni, Smenalar, Sabablar, Tabel, Turniketlar; 🖥 Monitoring oynasi (kompyuter: chap menyu, hamma panel, har daqiqa yangilanadi). Server ulanmagan boʻlsa — «🧪 Namuna» (soxta maʼlumot).
Sinovlar: `frontend/tests/v55dav.e2e.cjs`, `backend/tests/unit/test_dav.py`.
