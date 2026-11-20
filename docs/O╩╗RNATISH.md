# Oʻrnatish va eski serverdan koʻchirish

Barcha buyruqlar korxona serverida, repo papkasida bajariladi. Maʼlumot korxonadan tashqariga chiqmaydi.

## 1. Tayyorgarlik

```bash
git clone <korxona-repo> agmk-sttb && cd agmk-sttb
cp .env.example .env && chmod 600 .env   # AGMK_PUBLIC_HOSTS ga server IP manzilini yozing
# barcha kalitlar .env da (IT talabi) — har biriga yangi tasodifiy qiymat:
sed -i "s|^AGMK_DB_PASSWORD=.*|AGMK_DB_PASSWORD=$(openssl rand -hex 24)|; s|^AGMK_JWT_SECRET=.*|AGMK_JWT_SECRET=$(openssl rand -hex 48)|; s|^AGMK_ANON_KEY=.*|AGMK_ANON_KEY=agmk_$(openssl rand -hex 18)|" .env
mkdir -p company backups
sudo chown 10001 backups             # server konteyneri (uid 10001) zaxira yoza olsin
```

Korxona fayllarini `company/` papkasiga qoʻying. Ular faqat oʻqish uchun ulanadi va repoga tushmaydi:

```
company/xodimlar.json      (ITR shtat roʻyxati)
company/ishchilar.json     (3.18: ishchilar roʻyxati 1C dan — «Mening hodimlarim» va maxsus kiyim uchun; boʻlmasa faqat ITR chiqadi)
company/paketlar/  (huquq_guruhlari.json, kirish_kodlari.json, manzillar.json, mb_seed_2026.json, nar_tarif.json, temir_yol_sxemasi.agmkpack)
company/imzo_yuklash/  (ixtiyoriy)
```

Ilovadagi shaxsiy roʻyxatlarni `frontend/private/` ga qoʻying: `WRK_SEED.json`, `ROSTER.json`, `KIR_SEED.json`. Ular muallifdan olinadi va repoga tushmaydi. Ular boʻlmasa ham ilova yigʻiladi, lekin xodimlar daraxti boʻsh chiqadi.

## 2. Eski serverdan koʻchirish (bir marta)

Eski server (`ishga_tushirish.bat`) **toʻxtatilgan** boʻlsin. Uning papkasini (masalan, `/srv/eski/agmk-server`) serverga nusxalang, keyin:

```bash
docker compose build
docker compose up -d db
# 1) tekshirish — hech narsa yozilmaydi
docker compose run --rm --user root -v /srv/eski/agmk-server:/old:ro backend python -m app.migrate_legacy --old /old --dry-run
# 2) koʻchirish
docker compose run --rm --user root -v /srv/eski/agmk-server:/old:ro backend python -m app.migrate_legacy --old /old
```

Koʻchirish jadval boʻyicha hisobot chiqaradi: har jadvalda nechta yozuv koʻchgani va holati. Shu bilan birga quyidagilar ham koʻchadi:
- `jwt.secret` va `anon.key` — sessiyalar va shifrlangan imzolar ishlashda davom etadi. **Muhim:** kalitlar `.env` da boʻlgani uchun koʻchirishdan keyin eski qiymatlarni `.env` ga yozing (`AGMK_JWT_SECRET` = eski `data/jwt.secret`, `AGMK_ANON_KEY` = eski `data/anon.key`), aks holda eski imzolar ochilmaydi;
- `server.crt` va `server.key` — telefonlar QR ni qayta skanerlashi shart emas;
- `oklad.json` va tashqi manzil sozlamasi.

> Muhim: koʻchirishni **backend birinchi marta ishga tushishidan oldin** bajaring. Aks holda server yangi kalitlar yaratadi va koʻchirish ularni almashtirishdan bosh tortadi (`--force` bilan almashtiriladi).

Yangi oʻrnatishda (eski server boʻlmasa) bu bosqich tashlab ketiladi.

## 3. Ishga tushirish

```bash
docker compose up -d
docker compose ps                    # db, backend, gateway — healthy
docker compose logs -f backend       # «AGMK-STTB server 2.0.0 · … ta xodim shtatda …»
```

- Telefonlar: `https://<AGMK_PUBLIC_HOSTS>:8443`. Eski telefonlar oʻzi ulanadi.
- Boshqaruv paneli: faqat server kompyuterining oʻzidan, `http://127.0.0.1:8080`. U yerda QR kod, hisoblar, audit va zaxira bor.
- Brauzer versiyasi: `https://<server>:8443/`

## 4. Zaxira va tiklash

- Server har 24 soatda va ishga tushganda `pg_dump` bilan zaxira oladi. Nusxalar `backups/` papkasida, oxirgi 30 tasi (`AGMK_BACKUP_KEEP`). Paneldagi «Hozir zaxira olish» tugmasi ham shu ishni qiladi.
- Tiklash:
  ```bash
  docker compose stop backend
  docker compose exec -T db pg_restore -U agmk -d agmk --clean --if-exists < backups/agmk_YYYY-MM-DD_HH-MM-SS.dump
  docker compose start backend
  ```
- `pgdata`, `app_secrets` va `certs` hajmlarini ham server zaxira tizimiga qoʻshing.

## 5. Yangilash

**Asosiy qoida (6.2 dan):** server hech qachon GitHub'dan oʻzi yangilanmaydi. Tartib:

1. Muallif tuzatishni GitHub'da kiritadi → barcha testlar oʻtadi → yangi versiya ZIP paketi tayyorlanadi.
2. Paket **fleshkada** IT ga beriladi (Telegram/pochta orqali emas).
3. IT avval **zaxira** oladi (panel → «Hozir zaxira olish» yoki pastdagi buyruq), keyin oʻrnatadi.
4. Muammo boʻlsa — oldingi versiyaga qaytariladi (oldingi obraz tegi + zaxiradan tiklash, 4-boʻlim).

Muhim tuzatishlar — 1–2 kunda; mayda tuzatishlar — oyiga bir marta toʻplab.

```bash
docker compose exec -T db pg_dump -U agmk -d agmk -Fc > backups/oldin_$(date +%F_%H-%M).dump   # 1) zaxira
docker compose up -d --build                                                                   # 2) yangi versiya
```

**6.2 ga oʻtishda (bir marta):** SVO davomat kodi olib tashlandi, jadvallar bazada qoladi. Ularning alohida arxiv nusxasi:

```bash
docker compose exec -T db pg_dump -U agmk -d agmk -Fc -t dav_event -t dav_pattern -t dav_assign -t dav_reason > backups/svo_davomat_arxiv_2026-11-16.dump
```

Baza sxemasi oʻzi yangilanadi (`backend/app/migrations`).

## 6. Ishlab chiquvchi uchun sinovlar

```bash
cd backend
python -m unittest discover -s tests/unit
OLD_SRV=/yol/eski-server-demo PG_DSN='postgresql://postgres@/agmk_t?host=/var/run/postgresql' tests/contract/run_local.sh
```

Sinovlar faqat **soxta (demo)** xodimlar roʻyxati bilan ishlatiladi.


## 3.18: «Mening hodimlarim», maxsus kiyim, kadrlar importi

- **Ishchilar roʻyxati:** `company/ishchilar.json` (`{"v": "...", "rows": [[tabel, F.I.Sh., boʻlinma, kasb, uchastka], ...]}`) — 1C dan. Yangilansa, faylni almashtirish kifoya (server oʻzi qayta oʻqiydi).
- **Kim kimni koʻradi** — server tuzilma boʻyicha hisoblaydi (shtat jadvali + ilovadagi «🏛 Struktura»da xodimning oʻrni). Rahbar, oʻrinbosar yoki usta roʻyxati boʻsh boʻlsa — kadrlar uni strukturada toʻgʻri lavozim oʻrniga qoʻysin.
- **Rollar** (ilovada, administrator): «🧥 Maxsus kiyim beruvchi (ombor)» — kiyim berilganini kiritadi; «🗂 Kadrlar» — 1C dan Excel import qiladi (manzil, telefon, tugʻilgan sana, taʼtil oyi, razryad); «🦺 Mehnat muhofazasi» — kiyim normasini xodim uchun oʻzgartira oladi.
- **Shaxsiy maʼlumot** (manzil, telefon, tugʻilgan sana, taʼtil oyi) faqat PostgreSQL da (`hr_pd` jadvali); ilovaga (APK) joylanmaydi, telefonda saqlanmaydi. Koʻradi: oʻzi, uning rahbarlari, kadrlar, rahbariyat, administrator. Har bir koʻrish jurnalga yoziladi.
- Maxsus kiyim normalari: `backend/app/data/kiyim_normalari.json` (OʻzR 3617-son namunaviy normalari + xalqaro standartlar; loyiha — mehnat muhofazasi boʻlimi tasdiqlaydi).
