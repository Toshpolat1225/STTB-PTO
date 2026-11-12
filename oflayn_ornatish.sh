#!/usr/bin/env bash
# AGMK-STTB — INTERNETSIZ oʻrnatish va yangilash (Linux: Docker Engine + Docker Compose v2).
#   sudo ./oflayn_ornatish.sh          — oʻrnatish / yangi versiyaga oʻtish (baza saqlanadi)
#   sudo ./oflayn_ornatish.sh sinov    — alohida sinov nusxasi (loyiha agmk-sinov, portlar 9443/9080)
# Yangilash: yangi paket papkasiga eski .env, company/ va backups/ ni koʻchiring va shu skriptni ishga tushiring.
# Orqaga qaytish: .env dagi AGMK_IMAGE_TAG ni oldingi versiyaga qaytaring va «docker compose up -d --no-build --pull never».
# Hech qachon «docker compose down -v» ishlatilmaydi (baza oʻchadi).
set -euo pipefail
cd "$(dirname "$0")"
ROOT=$(pwd); LOG="$ROOT/JURNAL.txt"
SINOV=0; [ "${1:-}" = "sinov" ] && SINOV=1
PROJ=agmk-sttb; [ $SINOV = 1 ] && PROJ=agmk-sinov
say() { printf '%s\n' "$*"; printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*" >> "$LOG"; }
fail() { say ""; say "XATO: $*"; say "JURNAL.txt faylini masʼulga yuboring."; exit 1; }
run() { say ">> $1"; shift; "$@" 2>&1 | tee -a "$LOG" || fail "bajarilmadi: $*"; }
rnd() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }

say "==== AGMK-STTB oflayn oʻrnatish ($PROJ) ===="
docker version --format '{{.Server.Version}}' >/dev/null 2>&1 || fail "Docker ishlamayapti (systemctl start docker)"
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 yoʻq (docker compose plugin)"

[ -f VERSIYA.txt ] && [ -f obrazlar.tar ] || fail "Paket toʻliq emas: VERSIYA.txt va obrazlar.tar kerak"
TAG=$(sed -n 's/^AGMK_IMAGE_TAG=//p' VERSIYA.txt | tr -d '\r'); [ -n "$TAG" ] || fail "VERSIYA.txt da AGMK_IMAGE_TAG yoʻq"
IMGS=$(sed -n 's/^OBRAZLAR=//p' VERSIYA.txt | tr -d '\r')
if [ -f SHA256SUMS.txt ]; then
  say ">> Nazorat summasi (obrazlar.tar)"
  tr -d '\r' < SHA256SUMS.txt | grep '  obrazlar\.tar$' | sha256sum -c - >/dev/null || fail "obrazlar.tar buzilgan — paketni qayta koʻchiring"
  say "Paket butun"
fi

MISS=0; for i in $IMGS; do docker image inspect "$i" >/dev/null 2>&1 || MISS=1; done
if [ $MISS = 1 ]; then run "Obrazlar yuklanmoqda (2-5 daqiqa)" docker load -i obrazlar.tar; else say "Obrazlar allaqachon yuklangan"; fi

mkdir -p company/imzo_yuklash backups
[ -f company/xodimlar.json ] || say "Ogohlantirish: company/xodimlar.json yoʻq — server ishlaydi, lekin xodimlar roʻyxati boʻlmaydi"
# backend konteyneri uid 10001 nomidan ishlaydi: zaxira papkasiga yozish huquqi
chown -R 10001 backups 2>/dev/null || chmod 777 backups

IP=$(hostname -I 2>/dev/null | awk '{print $1}'); [ -n "$IP" ] || IP=127.0.0.1
if [ ! -f .env ]; then
  PP=8443; AP=8080; [ $SINOV = 1 ] && PP=9443 && AP=9080
  umask 077
  cat > .env <<EOF
# AGMK-STTB sozlamalari (oflayn oʻrnatish yaratdi). Bu faylni hech kimga bermang: ichida kalitlar bor.
AGMK_DB_PASSWORD=$(rnd 24)
AGMK_JWT_SECRET=$(rnd 48)
AGMK_ANON_KEY=agmk_$(rnd 18)
AGMK_PUBLIC_HOSTS=$IP
AGMK_PUBLIC_PORT=$PP
AGMK_ADMIN_HOST_PORT=$AP
AGMK_ADMIN=2582
AGMK_COMPANY_PATH=./company
AGMK_BACKUP_PATH=./backups
AGMK_BACKUP_KEEP=30
AGMK_TRK_DAYS=90
AGMK_OCR=1
AGMK_LOG_LEVEL=info
AGMK_IMAGE_TAG=$TAG
EOF
  say "Sozlamalar va kalitlar yaratildi (.env) — IP: $IP (boshqa boʻlsa AGMK_PUBLIC_HOSTS ni tuzating)"
else
  if grep -q '^AGMK_IMAGE_TAG=' .env; then sed -i "s/^AGMK_IMAGE_TAG=.*/AGMK_IMAGE_TAG=$TAG/" .env; else echo "AGMK_IMAGE_TAG=$TAG" >> .env; fi
  say "Mavjud .env saqlandi (kalitlar oʻzgarmadi), versiya: $TAG"
fi
AP=$(sed -n 's/^AGMK_ADMIN_HOST_PORT=//p' .env | tr -d '\r'); AP=${AP:-8080}

run "Server ishga tushirilmoqda ($TAG)" docker compose -p "$PROJ" up -d --no-build --pull never
say "Server tayyor boʻlishini kutyapman (1-2 daqiqa)..."
for _ in $(seq 60); do sleep 3; curl -fsS -o /dev/null "http://127.0.0.1:$AP/" 2>/dev/null && OK=1 && break; done
if [ "${OK:-0}" != 1 ]; then docker compose -p "$PROJ" ps; docker compose -p "$PROJ" logs --tail 80 2>&1 | tee -a "$LOG"; fail "Server 3 daqiqada ishga tushmadi"; fi
docker compose -p "$PROJ" restart gateway >/dev/null 2>&1 || true   # sertifikat yangilangan bo'lishi mumkin (ichki CA)
date '+%Y-%m-%d %H:%M' > backups/.ornatildi
say ""
say "==== TAYYOR ($TAG) ===="
say "Boshqaruv paneli: http://127.0.0.1:$AP (faqat shu serverdan; QR kod shu yerda)"
