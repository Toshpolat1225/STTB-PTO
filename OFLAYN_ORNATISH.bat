@echo off
rem AGMK-STTB -- internetsiz o'rnatish va yangilash (Docker Desktop kerak). Sinov nusxa: OFLAYN_ORNATISH.bat sinov
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0windows\oflayn_ornatish.ps1" %1
