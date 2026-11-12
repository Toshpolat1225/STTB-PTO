@echo off
rem AGMK-STTB -- IT uchun holat hisoboti: IT_HISOBOT.txt (parol, kalit va shaxsiy malumot YOZILMAYDI)
cd /d "%~dp0"
set N=IT_HISOBOT.txt
(
echo ==== AGMK-STTB holat hisoboti %date% %time% ====
findstr /c:"agmkVersion" frontend\package.json
echo ==== Konteynerlar
docker compose ps
echo ==== Obrazlar
docker image ls agmk-sttb/backend
echo ==== Tinglanayotgan portlar: 5432 baza, 8080 panel, 8443 telefonlar
netstat -ano -p tcp | findstr LISTENING | findstr ":5432 :8080 :8443"
echo ==== Zaxira nusxalar
dir /o-d backups\*.dump
)> %N% 2>&1
docker compose cp windows\it_hisobot.sql db:/tmp/it_hisobot.sql >nul 2>&1
docker compose exec -T db psql -U agmk -d agmk -f /tmp/it_hisobot.sql >> %N% 2>&1
(
echo ==== Server jurnali: zaxira va xatolar
docker compose logs --tail 400 backend | findstr /i "zaxira xato warn error"
)>> %N% 2>&1
echo Tayyor: IT_HISOBOT.txt
notepad %N%
