"""HTTPS sertifikati. Shlyuz (nginx) shu sertifikat bilan ishlaydi; telefon ilovasi uni barmoq izi (SHA-256) boʻyicha taniydi.
4.1: server sertifikatini korxonaning oʻz ichki tasdiqlovchi markazi (CA) imzolaydi. CA ning ochiq sertifikati
kompyuterlarga bir marta oʻrnatiladi (panel → «💻 Kompyuterda ochish») — shundan keyin brauzerda manzil yonida qulf chiqadi,
«Xavfsiz emas» ogohlantirishi boʻlmaydi. Hammasi internetsiz; CA kaliti faqat serverdagi /certs da (chiqmaydi).
Eski (oʻz-oʻzidan imzolangan) sertifikat birinchi ishga tushishda CA imzolagani bilan almashtiriladi — telefonlar QR ni
bir marta qayta skanerlaydi. AGMK_TLS_CA=0 — eski tartib (almashtirilmaydi)."""
from __future__ import annotations

import datetime as dt
import ipaddress
import logging
import os

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import ExtendedKeyUsageOID, NameOID

from app.core.config import settings

log = logging.getLogger('agmk')


def make_cert(ips: list[str], cn: str = 'AGMK-STTB Server') -> tuple[str, str]:
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'AGMK STTB')])
    san: list[x509.GeneralName] = [x509.DNSName('localhost')]
    for ip in ips:
        try:
            san.append(x509.IPAddress(ipaddress.ip_address(ip)))
        except ValueError:
            san.append(x509.DNSName(ip))
    now = dt.datetime.now(dt.timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(now - dt.timedelta(days=1)).not_valid_after(now + dt.timedelta(days=3650))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=False)
            .add_extension(x509.KeyUsage(digital_signature=True, key_encipherment=True, content_commitment=False, data_encipherment=False,
                                         key_agreement=False, key_cert_sign=False, crl_sign=False, encipher_only=False, decipher_only=False), critical=True)
            .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
            .add_extension(x509.SubjectAlternativeName(san), critical=False)
            .sign(key, hashes.SHA256()))
    return (cert.public_bytes(serialization.Encoding.PEM).decode(),
            key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode())


def make_ca(cn: str = 'AGMK-STTB Ichki CA') -> tuple[str, str]:
    key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'AGMK STTB')])
    now = dt.datetime.now(dt.timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(now - dt.timedelta(days=1)).not_valid_after(now + dt.timedelta(days=7300))
            .add_extension(x509.BasicConstraints(ca=True, path_length=0), critical=True)
            .add_extension(x509.KeyUsage(digital_signature=False, key_encipherment=False, content_commitment=False, data_encipherment=False,
                                         key_agreement=False, key_cert_sign=True, crl_sign=True, encipher_only=False, decipher_only=False), critical=True)
            .add_extension(x509.SubjectKeyIdentifier.from_public_key(key.public_key()), critical=False)
            .sign(key, hashes.SHA256()))
    return (cert.public_bytes(serialization.Encoding.PEM).decode(),
            key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode())


def make_signed(ips: list[str], ca_pem: str, ca_key_pem: str, cn: str = 'AGMK-STTB Server') -> tuple[str, str]:
    """CA imzolagan server sertifikati (SAN: localhost + barcha IP / nomlar)."""
    ca = x509.load_pem_x509_certificate(ca_pem.encode())
    ca_key = serialization.load_pem_private_key(ca_key_pem.encode(), password=None)
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, cn), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'AGMK STTB')])
    san: list[x509.GeneralName] = [x509.DNSName('localhost')]
    for ip in ips:
        try:
            san.append(x509.IPAddress(ipaddress.ip_address(ip)))
        except ValueError:
            san.append(x509.DNSName(ip))
    now = dt.datetime.now(dt.timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(ca.subject).public_key(key.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(now - dt.timedelta(days=1)).not_valid_after(now + dt.timedelta(days=3650))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .add_extension(x509.KeyUsage(digital_signature=True, key_encipherment=True, content_commitment=False, data_encipherment=False,
                                         key_agreement=False, key_cert_sign=False, crl_sign=False, encipher_only=False, decipher_only=False), critical=True)
            .add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
            .add_extension(x509.SubjectAlternativeName(san), critical=False)
            .add_extension(x509.SubjectKeyIdentifier.from_public_key(key.public_key()), critical=False)
            .add_extension(x509.AuthorityKeyIdentifier.from_issuer_public_key(ca.public_key()), critical=False)  # type: ignore[arg-type]
            .sign(ca_key, hashes.SHA256()))  # type: ignore[arg-type]
    return (cert.public_bytes(serialization.Encoding.PEM).decode(),
            key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode())


def _covers(pem: str, hosts: list[str]) -> bool:
    try:
        c = x509.load_pem_x509_certificate(pem.encode())
        san = c.extensions.get_extension_for_class(x509.SubjectAlternativeName).value
        have = {str(x) for x in san.get_values_for_type(x509.IPAddress)} | set(san.get_values_for_type(x509.DNSName))
        return all(h in have for h in hosts)
    except Exception:  # noqa: BLE001
        return False


def _signed_by(pem: str, ca_pem: str) -> bool:
    try:
        c, ca = x509.load_pem_x509_certificate(pem.encode()), x509.load_pem_x509_certificate(ca_pem.encode())
        c.verify_directly_issued_by(ca)
        return True
    except Exception:  # noqa: BLE001
        return False


def fingerprint(pem: str) -> str:
    return x509.load_pem_x509_certificate(pem.encode()).fingerprint(hashes.SHA256()).hex()


class TLS:
    cert_pem: str = ''
    fp: str = ''
    ca_pem: str = ''

    @classmethod
    def load(cls) -> None:
        d = settings.certs_dir
        crt, key = d / 'server.crt', d / 'server.key'
        if not crt.exists() or not key.exists():
            log.info('Birinchi ishga tushirish: HTTPS sertifikat yaratilmoqda...')
            d.mkdir(parents=True, exist_ok=True)
            c, k = make_cert(list(dict.fromkeys(list(settings.public_hosts) + ['127.0.0.1'])))
            key.write_text(k)
            os.chmod(key, 0o600)
            crt.write_text(c)
        hosts = list(dict.fromkeys(list(settings.public_hosts) + ['127.0.0.1']))
        if os.environ.get('AGMK_TLS_CA', '1') != '0':
            ca_crt, ca_key = d / 'ca.crt', d / 'ca.key'
            if not ca_crt.exists() or not ca_key.exists():
                log.info('Ichki tasdiqlovchi markaz (CA) yaratilmoqda...')
                c, k = make_ca()
                ca_key.write_text(k)
                os.chmod(ca_key, 0o600)
                ca_crt.write_text(c)
            cls.ca_pem = ca_crt.read_text()
            cur = crt.read_text()
            if not _signed_by(cur, cls.ca_pem) or not _covers(cur, hosts):
                (d / ('server.crt.eski-' + dt.datetime.now().strftime('%Y%m%d-%H%M%S'))).write_text(cur)
                c, k = make_signed(hosts, cls.ca_pem, ca_key.read_text())
                key.write_text(k)
                os.chmod(key, 0o600)
                crt.write_text(c)
                log.warning('HTTPS sertifikat CA imzolagani bilan almashtirildi (%s) — telefonlar panel QR ini qayta skanerlasin; shlyuz qayta ishga tushirilsin', ', '.join(hosts))
        cls.cert_pem = crt.read_text()
        cls.fp = fingerprint(cls.cert_pem)
