# AGMK-STTB — internetsiz (oflayn) oʻrnatish

Bu papka — tayyor server: Docker obrazlari (`obrazlar.tar`) ichida, **internet kerak emas**, hech narsa yigʻilmaydi.

## Ichida nima bor

| Fayl | Nima |
|---|---|
| `obrazlar.tar` | 3 ta Docker obrazi: `agmk-sttb/backend:<versiya>` (server + ilova), `postgres:16-alpine` (baza), `nginx:1.27-alpine` (shlyuz) |
| `VERSIYA.txt` | versiya va obrazlar roʻyxati |
| `SHA256SUMS.txt` | nazorat summalari — paket koʻchirilganda buzilmaganini tekshirish uchun |
| `docker-compose.yml`, `gateway/nginx.conf` | konteynerlar sozlamasi (manbadagi bilan bir xil) |
| `OFLAYN_ORNATISH.bat`, `windows/oflayn_ornatish.ps1` | Windows uchun oʻrnatish |
| `oflayn_ornatish.sh` | Linux uchun oʻrnatish |
| `HOLAT.bat`, `TOXTATISH.bat` | holatni koʻrish, toʻxtatish (Windows) |
| `company/` | korxona fayllari: `xodimlar.json`, `ishchilar.json`, `paketlar/`. **Maxfiy.** Paketda boʻsh boʻlishi mumkin — muallif alohida beradi |
| `IT_QOLLANMA.md` | IT uchun umumiy yoʻriqnoma (tarmoq, xavfsizlik, zaxira) |

Paketga **kirmaydi**: `.env` (kalitlar — oʻrnatishda yangi yaratiladi), baza, zaxira nusxalar.

## Oʻrnatish

**Windows** (Docker Desktop oʻrnatilgan, «Engine running» yashil):

1. Papkani `C:\AGMK\` ga koʻchiring (masalan `C:\AGMK\AGMK-STTB-4.0`).
2. `company\` ichiga muallif bergan `xodimlar.json`, `ishchilar.json` va `paketlar\` ni qoʻying.
3. `OFLAYN_ORNATISH.bat` ni ikki marta bosing.
4. Oxirida «==== TAYYOR ====» va boshqaruv paneli (`http://127.0.0.1:8080`, QR kod) ochiladi.

**Linux** (Docker Engine + Compose v2):

```bash
cd /srv/AGMK-STTB-4.0
sudo ./oflayn_ornatish.sh
```

Skript: paket butunligini tekshiradi → obrazlarni yuklaydi (`docker load`) → `.env` ni yaratadi (tasodifiy kalitlar, server IP) → `docker compose up -d --no-build --pull never` → panel javob berishini kutadi.

Server IP boshqacha boʻlsa (yoki domen boʻlsa): `.env` → `AGMK_PUBLIC_HOSTS=<IP yoki domen>` → skriptni qayta ishga tushiring.

## Yangi versiyaga oʻtish (baza saqlanadi)

1. Yangi paket papkasini yoniga koʻchiring (masalan `AGMK-STTB-4.1`).
2. Eski papkadan **`.env`**, **`company\`** va **`backups\`** ni yangisiga koʻchiring (kalitlar oʻzgarmasligi shart — aks holda telefonlar va imzolar ishlamaydi).
3. Eski papkada `TOXTATISH.bat` (yoki `docker compose stop`).
4. Yangi papkada `OFLAYN_ORNATISH.bat` (yoki `sudo ./oflayn_ornatish.sh`). Baza Docker hajmida (`agmk-sttb_pgdata`) — oʻzgarmaydi.

## Orqaga qaytish (yangi versiyada muammo boʻlsa)

Oldingi versiya obrazi Docker da qoladi. `.env` da `AGMK_IMAGE_TAG=<oldingi versiya>` deb yozing va:

```
docker compose up -d --no-build --pull never
```

## Sinov nusxasi (ishlab turgan serverga tegmasdan)

`OFLAYN_ORNATISH.bat sinov` (Linux: `./oflayn_ornatish.sh sinov`) — alohida loyiha `agmk-sinov`, portlar **9443/9080**, alohida baza. Toʻxtatish: `docker compose -p agmk-sinov stop`.

## Taqiqlar

- **Hech qachon** `docker compose down -v` — bazani oʻchiradi.
- 8080 (panel) tarmoqqa ochilmaydi — faqat `127.0.0.1`. Tashqariga faqat 8443, faqat korxona ichki tarmogʻiga.
- `.env` va `company\` — maxfiy. Ularni chatlarga, pochtaga, GitHubga yuklamang.

## Paketni tayyorlash (muallif)

Muallif kompyuterida: «SERVERNI YOQISH» (server yigʻiladi) → `OFLAYN_PAKET.bat` → `_oflayn\AGMK-STTB-<versiya>\`. `company` papkasini qoʻshish soʻraladi — faqat IT serveriga berilayotganda «HA».
