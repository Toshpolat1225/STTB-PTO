"""Ishga tushirish: API (shlyuz orqasida, ichki port) va boshqaruv paneli (faqat 127.0.0.1) bitta jarayonda.
Bitta jarayon — chunki jonli joylashuv va xato urinishlar hisobi xotirada saqlanadi (diskka yozilmaydi).

    python -m app            # yoki: docker compose up
"""
from __future__ import annotations

import asyncio
import contextlib
import logging
import time

import uvicorn

from app.api import admin
from app.api import router as api
from app.core import database as db
from app.core.permissions import KV_ACL, MOD_ACL, PD_KEYS
from app.services.org import xodimlar_sync
from app.core.config import VERSION, settings
from app.services.roster import ROSTER, groups_load, kir_seed_apply, roster_load
from app.realtime import trk_clean
from app.core.security import Keys
from app.core.tls import TLS

log = logging.getLogger('agmk')


async def startup() -> None:
    Keys.load()
    TLS.load()
    await db.open_pool()
    applied = await db.migrate()
    if applied:
        log.info('Baza sxemasi yangilandi: %s', ', '.join(applied))
    await db.nazorat_sync(KV_ACL, PD_KEYS, ['kv:agmk_audit_v1'], ['m:%s:' % k for k in MOD_ACL])
    await roster_load()
    groups_load()
    await kir_seed_apply()
    await admin.sig_seed()
    with contextlib.suppress(Exception):
        await xodimlar_sync()
    n = (await db.one("SELECT COUNT(*)::int AS n FROM users WHERE status = 'active'"))['n']
    log.info('AGMK-STTB server %s · %d ta xodim shtatda · %d ta faol hisob · sertifikat %s…', VERSION, len(ROSTER), n, TLS.fp[:16])
    if not settings.admin_tabel:
        log.warning('AGMK_ADMIN (.env) belgilanmagan — boshlangʻich administrator tayinlanmaydi.')
    if not n:
        log.info("Hali faol foydalanuvchi yo'q. Telefondan ro'yxatdan o'ting va panelda o'zingizni ADMINISTRATOR qilib tasdiqlang.")


async def periodic() -> None:
    """Imzo fayllari (har daqiqa), eskirgan sessiyalar va yoʻl izlari (har 6 soat), zaxira nusxa (har 24 soat)."""
    last_clean = last_backup = 0.0
    first_backup = time.time() + 3
    while True:
        await asyncio.sleep(60)
        now = time.time()
        with contextlib.suppress(Exception):
            await admin.sig_seed()
        try:
            await xodimlar_sync()
        except Exception as e:  # noqa: BLE001
            log.warning('Shtat jadvali yangilanmadi: %s', e)
        if now - last_clean > 6 * 3600:
            last_clean = now
            with contextlib.suppress(Exception):
                await trk_clean()
                await db.run('DELETE FROM refresh WHERE expires < %s', int(now * 1000))
        if now >= first_backup and now - last_backup > 24 * 3600:
            last_backup = now
            try:
                await admin.backup_now('kunlik' if first_backup < now - 120 else 'ishga tushirish')
            except Exception as e:  # noqa: BLE001
                log.warning('Zaxira xatosi: %s', e)


async def serve() -> None:
    logging.basicConfig(level=settings.log_level.upper(), format='[%(asctime)s] %(message)s', datefmt='%H:%M:%S')
    await startup()
    cfg = dict(log_level=settings.log_level, proxy_headers=True, forwarded_allow_ips='*', server_header=False, date_header=False)
    tls = dict(ssl_certfile=str(settings.certs_dir / 'server.crt'), ssl_keyfile=str(settings.certs_dir / 'server.key')) if settings.api_tls else {}
    s_api = uvicorn.Server(uvicorn.Config(api.app, host=settings.host, port=settings.api_port, lifespan='off', **cfg, **tls))
    s_adm = uvicorn.Server(uvicorn.Config(admin.app, host=settings.host, port=settings.admin_port, lifespan='off', **cfg))
    bg = asyncio.create_task(periodic())
    try:
        await asyncio.gather(s_api.serve(), s_adm.serve())
    finally:
        bg.cancel()
        await db.close_pool()


def main() -> None:
    asyncio.run(serve())


if __name__ == '__main__':
    main()
