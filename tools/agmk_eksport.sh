#!/usr/bin/env bash
# AGMK git (agentlik serveri) uchun toza nusxa: joriy shoxobchaning oxirgi holati, tarixsiz, bitta boshlangʻich commit bilan.
# Ichki tarixiy hujjatlar (docs/arxiv) va .gitignore dagi hamma narsa kirmaydi.
#
#   tools/agmk_eksport.sh <chiqish_papkasi> "<Ism Familiya>" <ish_pochtasi>
#
# Keyin (chiqish papkasida, IT bergan manzil bilan):
#   git remote add agmk <AGMK git manzili>
#   git push -u agmk main
set -euo pipefail
OUT="${1:?chiqish papkasi}"; NAME="${2:?muallif ismi}"; EMAIL="${3:?muallif pochtasi}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
[ -e "$OUT" ] && { echo "XATO: $OUT allaqachon bor — boshqa papka tanlang"; exit 1; }
mkdir -p "$OUT"
git -C "$ROOT" archive --format=tar HEAD | tar -x -C "$OUT"
rm -rf "$OUT/docs/arxiv"
# Xavfsizlik tekshiruvi: maxfiy fayllar va kalitlar nusxaga tushmagan boʻlishi shart
BAD=$(cd "$OUT" && find . \( -name '.env' -o -name '*.jks' -o -name '*.keystore' -o -name '*.key' -o -name '*.pem' -o -name '*.crt' -o -name '*.dump' -o -path './company/*' -o -path './frontend/private/*' -o -path './backups/*' \) -print | head -20)
[ -n "$BAD" ] && { echo "XATO: maxfiy fayllar topildi:"; echo "$BAD"; exit 1; }
if grep -rIlE --exclude=agmk_eksport.sh -- '-----BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{30,}|github_pat_|sk-ant-[A-Za-z0-9]' "$OUT" >/dev/null; then echo "XATO: kalitga oʻxshash matn topildi"; exit 1; fi
cd "$OUT"
git init -q -b main
git add -A
GIT_AUTHOR_NAME="$NAME" GIT_AUTHOR_EMAIL="$EMAIL" GIT_COMMITTER_NAME="$NAME" GIT_COMMITTER_EMAIL="$EMAIL" \
  git commit -q -m "AGMK-STTB PTO — boshlangʻich topshirish (ilova, server, hujjatlar)"
echo "✅ Tayyor: $OUT ($(git ls-files | wc -l) fayl, 1 commit). Keyingi qadam: git remote add agmk <manzil> && git push -u agmk main"
