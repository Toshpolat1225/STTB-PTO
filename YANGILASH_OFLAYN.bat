@echo off
rem AGMK-STTB -- internetsiz tezkor yangilash (faqat server Python fayllari ozgarganda). Natija: YANGILASH_OFLAYN_NATIJA.txt
cd /d "%~dp0"
set N=YANGILASH_OFLAYN_NATIJA.txt
echo ==== oflayn yangilash %date% %time% ==== > %N%
echo [1/3] Server obrazi yangilanmoqda (internetsiz)...
docker build --pull=false -t agmk-sttb/backend:local -f windows\Dockerfile.yamoq . >> %N% 2>&1 || goto xato
for /f "tokens=2 delims=:, " %%v in ('findstr /c:"agmkVersion" frontend\package.json') do docker image tag agmk-sttb/backend:local agmk-sttb/backend:%%~v >> %N% 2>&1
echo [2/3] Server qayta ishga tushirilmoqda...
docker compose up -d >> %N% 2>&1 || goto xato
echo [3/3] Server tayyor bolishini kutyapman (1 daqiqa)...
timeout /t 45 /nobreak > nul
docker compose ps >> %N% 2>&1
docker compose exec -T db psql -U agmk -d agmk -c "SELECT name FROM schema_migrations ORDER BY 1" -c "SELECT jami, buzilgan FROM nazorat.tekshir()" -c "SELECT count(*) AS boglanishlar, count(*) FILTER (WHERE tekshirilgan) AS tekshirilgan FROM nazorat.boglanishlar" -c "SELECT manba, shtatda, count(*) FROM xodimlar GROUP BY 1,2" >> %N% 2>&1
docker compose logs --tail 30 backend >> %N% 2>&1
echo ==== TAYYOR ==== >> %N%
echo.
echo ==== TAYYOR ==== Claude ga "tayyor" deb yozing.
pause
exit /b 0
:xato
echo XATO >> %N%
echo.
echo XATO: yangilanmadi, eski server ishlashda davom etadi. Claude ga yozing.
pause
exit /b 1
