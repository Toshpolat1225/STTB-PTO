#!/usr/bin/env bash
# Shartnoma va koʻchirish sinovlari (ishlab chiquvchi kompyuterida):
#   1) eski Node server (OLD_SRV papkasidagi server.js) va yangi Python server bir xil boshlangʻich holatda,
#      bir xil soxta (demo) xodimlar roʻyxati bilan ishga tushiriladi; scenario.py javoblarni solishtiradi;
#   2) eski serverning bazasi migrate_legacy bilan yangi PostgreSQL bazasiga koʻchiriladi va readonly.py
#      ikkala serverdagi maʼlumot bir xilligini tekshiradi (eski server bergan tokenlar bilan).
#
#   OLD_SRV=/yol/agmk-server-demo PG_DSN='postgresql://postgres@/agmk_t?host=/var/run/postgresql' tests/contract/run_local.sh
# Talab: node 22+, PostgreSQL (sinov bazalari agmk_t va agmk_t2 qayta yaratiladi), Python paketlari (requirements.txt).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$(cd "$HERE/../.." && pwd)"
: "${OLD_SRV:?OLD_SRV — eski server papkasi (demo maʼlumotlar bilan)}"
: "${PG_DSN:?PG_DSN — sinov bazasi}"
W="${WORK:-$(mktemp -d)}"
echo "Ish papkasi: $W"
mkdir -p "$W"
cleanup() { for p in ${PY_PID:-} ${PY2_PID:-} ${NODE_PID:-}; do kill "$p" 2>/dev/null || true; done; }
trap cleanup EXIT
export PYTHONPATH="${PYTHONPATH:-}:$BACKEND"

newdb() {
  python3 -c '
import sys, psycopg
from urllib.parse import urlsplit, urlunsplit
u = urlsplit(sys.argv[1]); name = u.path.strip("/")
admin = urlunsplit((u.scheme, u.netloc, "/postgres", u.query, ""))
with psycopg.connect(admin, autocommit=True) as c:
    c.execute("DROP DATABASE IF EXISTS \"%s\"" % name); c.execute("CREATE DATABASE \"%s\"" % name)
' "$1"
}

# 1) korxona fayllari (demo) — bitta tabelda qoʻshimcha kirish (kir_alt) ham sinalsin
cp -r "$OLD_SRV" "$W/node"
python3 -c '
import json, sys
p = sys.argv[1]; k = json.load(open(p, encoding="utf8"))
k["takror"] = {"0011": [{"n": "Dispetcher A"}, {"n": "Alt Xodim", "kod": "555555"}]}
json.dump(k, open(p, "w", encoding="utf8"), ensure_ascii=False)
' "$W/node/paketlar/kirish_kodlari.json"
mkdir -p "$W/py/secrets" "$W/py/certs" "$W/py/backups"
cp -r "$W/node" "$W/py/company"

# 2) bir xil maxfiy kalitlar va sertifikat
export AGMK_SECRETS_DIR="$W/py/secrets" AGMK_CERTS_DIR="$W/py/certs"
python3 -c "from app.core.security import Keys; from app.core.tls import TLS; Keys.load(); TLS.load()"
mkdir -p "$W/node/data"
cp "$W/py/secrets/jwt.secret" "$W/py/secrets/anon.key" "$W/py/certs/server.crt" "$W/py/certs/server.key" "$W/node/data/"
APIKEY="$(cat "$W/py/secrets/anon.key")"

# 3) eski server
pushd "$W/node" >/dev/null
AGMK_PORT=18443 AGMK_ADMIN_PORT=18080 AGMK_NO_BROWSER=1 AGMK_DEV=1 AGMK_ADMIN=0001 node server.js > "$W/node.log" 2>&1 &
NODE_PID=$!
popd >/dev/null

# 4) yangi server (toza baza)
export AGMK_DB_URL="$PG_DSN" AGMK_COMPANY_DIR="$W/py/company" AGMK_BACKUP_DIR="$W/py/backups" AGMK_ADMIN=0001
export AGMK_HOST=127.0.0.1 AGMK_API_PORT=18000 AGMK_ADMIN_PORT=18081 AGMK_PUBLIC_HOSTS=127.0.0.1 AGMK_PUBLIC_PORT=18443 AGMK_APP_HTML="$W/yoq.html"
newdb "$PG_DSN"
python3 -m app > "$W/py.log" 2>&1 &
PY_PID=$!
for i in $(seq 1 90); do
  curl -sk https://127.0.0.1:18443/health >/dev/null 2>&1 && curl -s http://127.0.0.1:18000/health >/dev/null 2>&1 && break
  sleep 1
done
sleep 2
python3 "$HERE/scenario.py" --old https://127.0.0.1:18443 --old-admin http://127.0.0.1:18080 --new http://127.0.0.1:18000 --new-admin http://127.0.0.1:18081 \
  --apikey "$APIKEY" --dump "$W/javoblar.json"

# 5) koʻchirish sinovi: eski serverning bazasi → yangi (boʻsh) PostgreSQL bazasi → ikkinchi Python server
PG2="${PG_DSN/agmk_t/agmk_t2}"
newdb "$PG2"
mkdir -p "$W/py2/secrets" "$W/py2/certs"
export AGMK_DB_URL="$PG2" AGMK_SECRETS_DIR="$W/py2/secrets" AGMK_CERTS_DIR="$W/py2/certs"
python3 -m app.services.legacy_migration --old "$W/node"
AGMK_API_PORT=18002 AGMK_ADMIN_PORT=18083 python3 -m app > "$W/py2.log" 2>&1 &
PY2_PID=$!
for i in $(seq 1 60); do curl -s http://127.0.0.1:18002/health >/dev/null 2>&1 && break; sleep 1; done
sleep 1
cd "$HERE" && python3 readonly.py --old https://127.0.0.1:18443 --old-admin http://127.0.0.1:18080 --new http://127.0.0.1:18002 --new-admin http://127.0.0.1:18083 --apikey "$APIKEY"
