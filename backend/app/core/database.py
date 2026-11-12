"""PostgreSQL ulanishlari va sxema migratsiyalari."""
from __future__ import annotations

import logging
from pathlib import Path

from psycopg import AsyncConnection
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from app.core.config import settings

log = logging.getLogger('agmk')
MIGRATIONS = Path(__file__).resolve().parents[1] / 'migrations'

pool: AsyncConnectionPool | None = None
# 4.2: nazorat jurnali shu nom boʻyicha ilova oʻzgarishlarini qoʻlda (DBeaver, psql) qilinganlardan ajratadi
APP_NAME = 'agmk-backend'


async def open_pool() -> AsyncConnectionPool:
    global pool
    pool = AsyncConnectionPool(settings.dsn, min_size=1, max_size=10, open=False, kwargs={'row_factory': dict_row, 'autocommit': True, 'application_name': APP_NAME})
    await pool.open(wait=True, timeout=60)
    return pool


async def close_pool() -> None:
    if pool:
        await pool.close()


def conn():
    """Oddiy (avtomatik tasdiqlanadigan) ulanish: async with conn() as c: await c.execute(...)"""
    assert pool is not None, 'baza ulanmagan'
    return pool.connection()


async def one(sql: str, *args):
    async with conn() as c:
        cur = await c.execute(sql, args)
        return await cur.fetchone()


async def all_(sql: str, *args) -> list[dict]:
    async with conn() as c:
        cur = await c.execute(sql, args)
        return await cur.fetchall()


async def run(sql: str, *args) -> int:
    async with conn() as c:
        cur = await c.execute(sql, args)
        return cur.rowcount


async def migrate() -> list[str]:
    """migrations/NNNN_*.sql fayllarini tartib bilan, har birini alohida tranzaksiyada qoʻllaydi."""
    applied: list[str] = []
    async with await AsyncConnection.connect(settings.dsn, row_factory=dict_row, autocommit=True, application_name=APP_NAME) as c:
        await c.execute('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())')
        # bir vaqtda ikki nusxa ishga tushsa ham migratsiya bir marta bajarilsin
        await c.execute('SELECT pg_advisory_lock(7351001)')
        try:
            done = {r['name'] for r in await (await c.execute('SELECT name FROM schema_migrations')).fetchall()}
            for f in sorted(MIGRATIONS.glob('*.sql')):
                if f.name in done:
                    continue
                async with c.transaction():
                    await c.execute(f.read_text(encoding='utf8'))
                    await c.execute('INSERT INTO schema_migrations (name) VALUES (%s)', (f.name,))
                applied.append(f.name)
                log.info('Migratsiya qoʻllandi: %s', f.name)
        finally:
            await c.execute('SELECT pg_advisory_unlock(7351001)')
    return applied


async def nazorat_sync(kv_acl: dict, pd_keys: list[str], extra_ids: list[str], id_prefixes: list[str]) -> None:
    """oqish.* koʻrinishlari yashiradigan maxfiy yozuvlar va shaxsiy maʼlumot kalitlari — acl.py bilan bir xil boʻlsin."""
    want = {('id', i) for i in list(kv_acl) + extra_ids} | {('id_boshi', p) for p in id_prefixes} | {('pd', k) for k in pd_keys}
    async with conn() as c:
        if not (await (await c.execute("SELECT to_regclass('nazorat.maxfiy') AS r")).fetchone())['r']:
            return
        have = {(r['tur'], r['qiymat']) for r in await (await c.execute('SELECT tur, qiymat FROM nazorat.maxfiy')).fetchall()}
        if have == want:
            return
        async with c.transaction():
            await c.execute('DELETE FROM nazorat.maxfiy')
            for t, q in sorted(want):
                await c.execute('INSERT INTO nazorat.maxfiy (tur, qiymat) VALUES (%s, %s)', (t, q))
    log.info('Nazorat: maxfiy roʻyxat yangilandi (%d ta)', len(want))
