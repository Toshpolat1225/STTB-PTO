"""Sozlamalar — faqat muhit oʻzgaruvchilaridan (.env). Maxfiy kalitlar kodda yoki repoda saqlanmaydi."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

VERSION = '2.3.0'  # server versiyasi (… 2.3.0: nazorat (audit) jurnali, bogʻlanishlar, agmk_oqish; 2.1.0: kalitlar .env da, imzo navbatsiz → 2.2.0: Mening hodimlarim, maxsus kiyim, kadrlar importi)


def _env(name: str, default: str = '') -> str:
    return os.environ.get(name, default).strip()


def _bool(name: str) -> bool:
    return _env(name) in ('1', 'true', 'yes', 'ha')


@dataclass(frozen=True)
class Settings:
    # PostgreSQL ulanishi: postgresql://foydalanuvchi:parol@host:5432/baza (parol .env da yoki AGMK_DB_PASSWORD_FILE da)
    db_url: str = field(default_factory=lambda: _env('AGMK_DB_URL', 'postgresql://agmk@localhost:5432/agmk'))
    db_password_file: str = field(default_factory=lambda: _env('AGMK_DB_PASSWORD_FILE'))
    db_password: str = field(default_factory=lambda: _env('AGMK_DB_PASSWORD'))  # IT talabi: barcha kalitlar .env da (fayl — zaxira usul)
    # Maxfiy kalitlar papkasi: jwt.secret, anon.key (birinchi ishga tushishda yaratiladi; eski serverdan koʻchiriladi)
    secrets_dir: Path = field(default_factory=lambda: Path(_env('AGMK_SECRETS_DIR', '/secrets')))
    # TLS sertifikati (shlyuz bilan umumiy): server.crt, server.key — telefonlar barmoq izi boʻyicha taniydi
    certs_dir: Path = field(default_factory=lambda: Path(_env('AGMK_CERTS_DIR', '/certs')))
    # Korxona fayllari (faqat oʻqish): xodimlar.json, paketlar/*, imzo_yuklash/
    company_dir: Path = field(default_factory=lambda: Path(_env('AGMK_COMPANY_DIR', '/company')))
    # Ilova (frontend yigʻilgan HTML) — brauzer versiyasi shu manzildan ochiladi
    app_html: Path = field(default_factory=lambda: Path(_env('AGMK_APP_HTML', '/app/ilova/index.html')))
    backup_dir: Path = field(default_factory=lambda: Path(_env('AGMK_BACKUP_DIR', '/backups')))
    host: str = field(default_factory=lambda: _env('AGMK_HOST', '0.0.0.0'))
    api_port: int = field(default_factory=lambda: int(_env('AGMK_API_PORT', '8000')))        # ichki (shlyuz orqasida)
    admin_port: int = field(default_factory=lambda: int(_env('AGMK_ADMIN_PORT', '8080')))    # boshqaruv paneli
    public_port: int = field(default_factory=lambda: int(_env('AGMK_PUBLIC_PORT', '8443')))  # telefonlar ulanadigan port
    # Telefonlar ulanadigan manzillar (QR uchun), vergul bilan: «192.168.1.10,10.0.0.5»
    public_hosts: tuple[str, ...] = field(default_factory=lambda: tuple(x.strip() for x in _env('AGMK_PUBLIC_HOSTS').split(',') if x.strip()))
    admin_tabel: str = field(default_factory=lambda: _env('AGMK_ADMIN', ''))  # majburiy: .env dagi AGMK_ADMIN
    seed_off: bool = field(default_factory=lambda: _bool('AGMK_SEED_OFF'))
    trk_days: int = field(default_factory=lambda: int(_env('AGMK_TRK_DAYS', '90') or 90))
    backup_keep: int = field(default_factory=lambda: int(_env('AGMK_BACKUP_KEEP', '30') or 30))
    tesseract: str = field(default_factory=lambda: _env('AGMK_TESSERACT'))
    # Panelga faqat shu manzillar orqali kirish mumkin (Host sarlavhasi)
    admin_hosts: tuple[str, ...] = field(default_factory=lambda: tuple(x.strip() for x in _env('AGMK_ADMIN_HOSTS', 'localhost,127.0.0.1').split(',') if x.strip()))
    # API ni toʻgʻridan-toʻgʻri HTTPS da berish (shlyuzsiz oʻrnatish yoki sinov uchun). Odatda — shlyuz (nginx) TLS ni beradi.
    api_tls: bool = field(default_factory=lambda: _bool('AGMK_API_TLS'))
    log_level: str = field(default_factory=lambda: _env('AGMK_LOG_LEVEL', 'info'))

    @property
    def dsn(self) -> str:
        url = self.db_url
        pw = self.db_password or (Path(self.db_password_file).read_text().strip() if self.db_password_file and Path(self.db_password_file).exists() else '')
        if pw:
            from urllib.parse import quote, urlsplit, urlunsplit
            p = urlsplit(url)
            user = p.username or 'agmk'
            netloc = '%s:%s@%s' % (quote(user, safe=''), quote(pw, safe=''), p.hostname + (':%d' % p.port if p.port else ''))
            url = urlunsplit((p.scheme, netloc, p.path, p.query, p.fragment))
        return url

    @property
    def paket_dir(self) -> Path:
        return self.company_dir / 'paketlar'


settings = Settings()
