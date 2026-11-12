# AGMK-STTB server obrazi. Yigʻish konteksti — repo ildizi (docker compose buni oʻzi beradi).
#   1-bosqich: ilova (frontend) TypeScript dan bitta HTML ga yigʻiladi
#   2-bosqich: Python server + yigʻilgan ilova
# Shaxsiy maʼlumotlar (frontend/private/) faqat korxona serverida mavjud boʻladi va obrazga shu yerda qoʻshiladi;
# ular repoga va obrazlar omboriga (registry) yuklanmaydi.

FROM node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY frontend/ ./
# Administrator tabeli (.env dagi AGMK_ADMIN) — kodda emas, yigʻishda qoʻyiladi
ARG AGMK_ADMIN=
RUN node check.mjs && AGMK_ADMIN="$AGMK_ADMIN" node build.mjs --out /out/index.html && (cp private/NAMES.json /out/NAMES.json 2>/dev/null || echo "{}" > /out/NAMES.json)

FROM python:3.12-slim-bookworm@sha256:34386ef0cb081344d7ec1c103ba398e6e9f64e9ab3a1509accc92a4e24a07258
ARG OCR=1
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
# pg_dump — zaxira nusxa uchun; tesseract — hujjat rasmini matnga oʻgirish (ixtiyoriy, OCR=0 bilan oʻchiriladi)
# pg_dump baza (postgres:16) bilan bir xil asosiy versiyada boʻlishi shart: Debian 12 dagi postgresql-client — 15,
# u 16-serverdan zaxira olmaydi («server version mismatch»). Shuning uchun 16-mijoz PostgreSQL ning rasmiy omboridan.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && install -d /usr/share/postgresql-common/pgdg \
 && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
 && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client-16 \
 && pg_dump --version | grep -q ' 16\.' \
 && if [ "$OCR" = "1" ]; then apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-rus tesseract-ocr-eng tesseract-ocr-uzb tesseract-ocr-uzb-cyrl; fi \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/app ./app
COPY --from=frontend /out/index.html /out/NAMES.json ./ilova/
RUN useradd --system --uid 10001 --home /app agmk && mkdir -p /secrets /certs /backups && chown agmk /secrets /certs /backups
USER agmk
ENV AGMK_APP_HTML=/app/ilova/index.html AGMK_SECRETS_DIR=/secrets AGMK_CERTS_DIR=/certs AGMK_COMPANY_DIR=/company AGMK_BACKUP_DIR=/backups
EXPOSE 8000 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD curl -fsS http://127.0.0.1:8000/health || exit 1
CMD ["python", "-m", "app"]
