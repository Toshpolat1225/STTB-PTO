#!/usr/bin/env bash
# AGMK-STTB PTO — Windows (kompyuter) versiyasini yigʻish.
#   bash desktop/yigish_desktop.sh <ilova.html> <versiya>   →  out/AGMK-STTB-PTO-v<versiya>-Windows.zip
# Electron rasmiy relizi GitHub dan olinadi va SHA-256 bilan tekshiriladi. Ilova HTML — frontend/dist (private bilan yigʻilgan).
# Natija zip korxona maʼlumotini (xodimlar roʻyxati, normalar) oʻz ichiga oladi — gitga, Telegram guruhlariga qoʻyilmaydi.
set -euo pipefail
HTML="$1"; VER="$2"; EV="33.2.1"; HERE="$(cd "$(dirname "$0")" && pwd)"; W="$(mktemp -d)"
Z="electron-v$EV-win32-x64.zip"; U="https://github.com/electron/electron/releases/download/v$EV"
curl -sSL -o "$W/$Z" "$U/$Z"; curl -sSL -o "$W/SHASUMS256.txt" "$U/SHASUMS256.txt"
(cd "$W" && grep " \*$Z\$" SHASUMS256.txt | sed 's/ \*/  /' | sha256sum -c -)
A="$W/AGMK-STTB PTO"; mkdir -p "$A" && (cd "$A" && unzip -q "$W/$Z")
mv "$A/electron.exe" "$A/AGMK-STTB PTO.exe"; rm -f "$A/resources/default_app.asar"; mkdir -p "$A/resources/app"
cp "$HERE/main.js" "$HERE/package.json" "$HERE/icon.png" "$A/resources/app/"; cp "$HTML" "$A/resources/app/index.html"
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VER.0\"/" "$A/resources/app/package.json"
mkdir -p "$HERE/../out"; (cd "$W" && zip -qr -9 "$HERE/../out/AGMK-STTB-PTO-v$VER-Windows.zip" "AGMK-STTB PTO"); rm -rf "$W"
echo "✅ out/AGMK-STTB-PTO-v$VER-Windows.zip"
