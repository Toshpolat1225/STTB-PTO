@echo off
rem AGMK-STTB TEST SERVERI -- sinov malumotlarini yuklash: 1) ilova qatlami (1,5 yil tamir tarixi, TMC) 2) ogir qatlam (kuniga 3x100 tamir, TMC)
rem Faqat TEST bazasiga: skriptlar bazada "sinov_server" belgisi bolmasa ishlamaydi. Natija: YUKLASH_NATIJA.txt
cd /d "%~dp0"
set N=YUKLASH_NATIJA.txt
echo ==== sinov malumotlari %date% %time% ==== > %N%
echo [1/3] Fayllar bazaga kochirilmoqda...
docker compose cp malumot\ilova.jsonl db:/tmp/ilova.jsonl >> %N% 2>&1 || goto xato
docker compose cp malumot\ilova_qatlam.sql db:/tmp/ilova_qatlam.sql >> %N% 2>&1 || goto xato
docker compose cp malumot\og_ir_qatlam.sql db:/tmp/og_ir_qatlam.sql >> %N% 2>&1 || goto xato
echo [2/3] Ilova qatlami yuklanmoqda...
docker compose exec -T db psql -U agmk -d agmk -f /tmp/ilova_qatlam.sql >> %N% 2>&1 || goto xato
echo [3/3] Ogir qatlam yaratilmoqda (1-2 daqiqa)...
docker compose exec -T db psql -U agmk -d agmk -f /tmp/og_ir_qatlam.sql >> %N% 2>&1 || goto xato
echo ==== TAYYOR ==== >> %N%
echo.
echo ==== TAYYOR ==== Claude ga "tayyor" deb yozing.
pause
exit /b 0
:xato
echo XATO >> %N%
echo XATO: yuklanmadi. Claude ga yozing.
pause
exit /b 1
