# IT boʻlimiga savollar

Ish shu javoblar kelishini kutmasdan boshlangan. Barcha qismlar standart qiymatlar bilan tayyor, ularning hammasini `.env` va `docker-compose.yml` orqali oʻzgartirish mumkin. Javoblar kelgach, kodga deyarli tegmasdan moslanadi.

| № | Savol | Hozir qabul qilingan standart |
|---|---|---|
| 1 | Server: qaysi OS? Docker va Docker Compose oʻrnatilganmi? Resurslar (CPU, RAM, disk)? | Linux, Docker Compose v2. Tavsiya: 4 yadro, 8 GB RAM, 100 GB disk |
| 2 | PostgreSQL: Docker ichida alohida konteynerdami yoki korxonaning mavjud PostgreSQL serveridami? Versiya? | Docker ichida, PostgreSQL 16, tashqi tarmoqqa chiqmaydi |
| 3 | Python framework: Starlette maqulmi yoki FastAPI/Django talab qilinadimi? | Starlette (FastAPI ham shu asosda qurilgan). Kam bogʻliqlik, kam hujum yuzasi |
| 4 | Agentlik git serveri (AGMK git): akkaunt, ombor, ulanish usuli (token/SSH), yuklash tartibi (main yoki merge request), Codex tekshiruvi talablari, ichki CI | Toza tarix bilan bitta boshlangʻich commit (`tools/agmk_eksport.sh`), keyingi oʻzgarishlar — merge request orqali |
| 5 | Paketlar manbai: internetdagi PyPI va npm ga ruxsat bormi yoki ichki koʻzgu (mirror) bormi? | Shart emas: oflayn paket (tayyor obrazlar, `docker load`) bilan oʻrnatiladi. Manbadan yigʻishda — internet yoki koʻzgu kerak; Python paketlari `requirements.txt` da qatʼiy, frontendda `package-lock.json` hali yoʻq (keyingi bosqich) |
| 6 | Tarmoq: telefonlar qaysi manzil orqali ulanadi (ichki IP yoki domen)? Tashqaridan kirish kerakmi (statik IP / VPN)? | Faqat 8443 port. Manzillar `.env` dagi `AGMK_PUBLIC_HOSTS` da |
| 7 | TLS: hozirgidek oʻz-oʻzidan imzolangan sertifikat va barmoq izi boʻyicha tanishmi yoki korxona tasdiqlovchi markazi (CA) sertifikatimi? | Oʻz-oʻzidan imzolangan. Eskisi koʻchiriladi, telefonlarni qayta ulash shart emas |
| 8 | Zaxira nusxalar qayerda saqlanadi (alohida disk / NAS)? Necha kun? Tiklash sinovi kim tomonidan? | Har kuni `pg_dump`, oxirgi 30 tasi, `AGMK_BACKUP_PATH` papkasida |
| 9 | Kirish: korxona domeni (Active Directory / LDAP) bilan bogʻlash kerakmi? | Hozircha tabel + parol (eski tizimdagidek) |
| 10 | Jurnallar va monitoring: syslog / ELK / Zabbix ga yuborish kerakmi? | Konteyner jurnallari (stdout). Audit jurnali bazada |
| 11 | Korxona maʼlumotnomalari (vagonlar bazasi, normativ hujjatlar, hujjatlardagi imzo qoʻyuvchilar F.I.Sh.) private repoda tursa boʻladimi yoki ular ham serverga koʻchirilsinmi? | Repoda (private). Shaxsiy maʼlumotlar (xodimlar roʻyxatlari, parol xeshlari) allaqachon ajratilgan va repoga tushmaydi |
| 12 | Telefonda oflayn ishlash uchun maʼlumot nusxasi saqlanadi. Bu qabul qilinadimi? | Ha, eski tizimdagidek. Keyingi bosqichda faqat kerakli qismi saqlanadigan qilish mumkin |
| 13 | Android ilova: imzolash kaliti kimda saqlanadi? APK ni kim yigʻadi? | Hozir kalit muallifda. Android manba loyihasini qayta tuzish rejada bor (`REJA.md`) |
| 14 | OCR (Tesseract) serverga oʻrnatilsinmi? | Ha (`AGMK_OCR=1`). Kerak boʻlmasa `0` |
| 15 | Boshqaruv paneli faqat server kompyuterining oʻzidan ochiladi (127.0.0.1:8080). Masofadan kerakmi (masalan, VPN orqali)? | Yoʻq, faqat mahalliy |
