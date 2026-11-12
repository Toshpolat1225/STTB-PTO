@echo off
rem AGMK-STTB TEST SERVERI -- yoqish (haqiqiy serverga tegmaydi). Telefonlar: 9443, panel: http://127.0.0.1:9080
cd /d "%~dp0"
echo ==== TEST serveri yoqilmoqda ====
docker compose up -d || goto xato
echo Server tayyor bolishini kutyapman...
set i=0
:kut
set /a i+=1
if %i% gtr 60 goto xato
timeout /t 5 /nobreak > nul
docker compose exec -T db psql -U agmk -d agmk -tAc "SELECT 1 FROM schema_migrations WHERE name = '0005_xodimlar.sql'" 2>nul | findstr 1 >nul || goto kut
rem bu bazani TEST serveri deb belgilash (sinov malumotlari faqat shunday bazaga yuklanadi)
docker compose exec -T db psql -U agmk -d agmk -qc "INSERT INTO settings (key, value) VALUES ('sinov_server', json_build_object('admin', '2582')) ON CONFLICT (key) DO NOTHING"
docker compose ps
echo.
echo ==== TEST serveri TAYYOR ==== Panel: http://127.0.0.1:9080
start http://127.0.0.1:9080
pause
exit /b 0
:xato
echo XATO: test serveri yoqilmadi. Docker Desktop ishlayaptimi?
pause
exit /b 1
