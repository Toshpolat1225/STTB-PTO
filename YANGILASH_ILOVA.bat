@echo off
rem AGMK-STTB -- ilovani (telefon/brauzer sahifasini) internetsiz yangilash. Natija: YANGILASH_ILOVA_NATIJA.txt
rem Yangilash paketi "fayllar" papkasi bilan keladi: avval fayllar loyiha papkasiga ko'chiriladi.
set R=C:\AGMK\AGMK-STTB
set N=%R%\YANGILASH_ILOVA_NATIJA.txt
if exist "%~dp0fayllar" (
  echo [0/4] Yangi fayllar loyiha papkasiga ko'chirilmoqda...
  xcopy "%~dp0fayllar\*" "%R%\" /E /Y /I /Q > nul || goto xato0
)
cd /d "%R%"
echo ==== ilova yangilash %date% %time% ==== > %N%
if not exist ilova_yangi\index_shablon.html goto yoq
echo [1/4] Ilova sahifasi tayyorlanmoqda (shaxsiy ma'lumotlar shu kompyuterda qo'shiladi)...
docker run --rm -u 0 -v "%R%":/w -w /w --entrypoint python agmk-sttb/backend:local windows/ilova_birlashtir.py >> %N% 2>&1 || goto xato
echo [2/4] Server obrazi yangilanmoqda (internetsiz)...
docker build --pull=false -t agmk-sttb/backend:local -f windows\Dockerfile.ilova . >> %N% 2>&1 || goto xato
for /f "tokens=2 delims=:, " %%v in ('findstr /c:"agmkVersion" frontend\package.json') do docker image tag agmk-sttb/backend:local agmk-sttb/backend:%%~v >> %N% 2>&1
echo [3/4] Server qayta ishga tushirilmoqda...
docker compose up -d >> %N% 2>&1 || goto xato
echo [4/4] Tekshiruv (1 daqiqa)...
timeout /t 45 /nobreak > nul
docker compose ps >> %N% 2>&1
docker compose exec -T backend python -c "import re;h=open('/app/ilova/index.html',encoding='utf-8').read();m=re.search(r\"AGMK_VERSION = '([0-9.]+)'\",h);print('ILOVA VERSIYASI:',m and m.group(1),'| hajm',len(h)//1024,'KB')" >> %N% 2>&1
docker compose logs backend 2>&1 | findstr /c:"Migratsiya" /c:"sxemasi yangilandi" >> %N%
docker compose logs --tail 20 backend >> %N% 2>&1
echo ==== TAYYOR ==== >> %N%
echo.
echo ==== TAYYOR ==== Claude ga "tayyor" deb yozing.
pause
exit /b 0
:yoq
echo XATO: ilova_yangi\index_shablon.html topilmadi >> %N%
echo XATO: ilova_yangi\index_shablon.html topilmadi. Claude ga yozing.
pause
exit /b 1
:xato0
echo XATO: fayllarni ko'chirib bo'lmadi. Claude ga yozing.
pause
exit /b 1
:xato
echo XATO >> %N%
echo.
echo XATO: yangilanmadi, eski server ishlashda davom etadi. Claude ga yozing.
pause
exit /b 1
