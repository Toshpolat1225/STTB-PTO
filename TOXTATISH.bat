@echo off
rem AGMK-STTB serverni toxtatish (malumotlar saqlanadi)
cd /d "%~dp0"
docker compose stop
echo.
echo Server toxtatildi. Malumotlar saqlangan. Qayta ishga tushirish: ISHGA_TUSHIRISH.bat
pause
