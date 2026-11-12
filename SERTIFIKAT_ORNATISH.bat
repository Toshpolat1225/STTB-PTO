@echo off
rem AGMK-STTB -- SHU (server) kompyuterida ichki CA sertifikatini ishonchli qilish. Boshqa kompyuterlar uchun: panel -> "Kompyuterda ochish".
rem Windows bitta tasdiq oynasini chiqaradi -- "Da / Yes" ni bosing. Administrator huquqi shart emas.
cd /d "%~dp0"
set F=%TEMP%\agmk-sttb-ca.crt
docker compose exec -T backend cat /certs/ca.crt > "%F%"
if errorlevel 1 ( echo Server ishlamayapti. Avval SERVERNI YOQISH ni bosing. & pause & exit /b 1 )
certutil -user -addstore Root "%F%"
del "%F%"
echo.
echo Tayyor. Chrome / Edge ni yopib qayta oching va https://127.0.0.1:8443 manzilini oching.
pause
