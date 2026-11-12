@echo off
rem AGMK-STTB holati -- natijani HOLAT.txt ga yozadi (Claude ga yuborish uchun)
cd /d "%~dp0"
echo ==== docker compose ps ==== > HOLAT.txt
docker compose ps >> HOLAT.txt 2>&1
echo. >> HOLAT.txt
echo ==== oxirgi jurnal ==== >> HOLAT.txt
docker compose logs --tail 150 >> HOLAT.txt 2>&1
notepad HOLAT.txt
