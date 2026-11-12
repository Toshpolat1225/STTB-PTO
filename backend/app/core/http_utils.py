"""HTTP yordamchilari: JSON javoblar, xatolar, soʻrov tanasini chegara bilan oʻqish."""
from __future__ import annotations

import json
from typing import Any

from starlette.requests import Request
from starlette.responses import Response


class TooBig(Exception):
    pass


class BadJson(Exception):
    pass


def dumps(o: Any) -> str:
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))


_MAX_SAFE = 2 ** 53


def js_norm(o: Any) -> Any:
    """Sonlarni JavaScript (JSON.parse → JSON.stringify) qanday saqlasa, shunday qiladi:
    1.0 → 1, 2^53 dan katta butun son → yaxlitlangan, Infinity/NaN → null. Eski server bilan bir xil natija uchun."""
    if isinstance(o, dict):
        return {k: js_norm(v) for k, v in o.items()}
    if isinstance(o, list):
        return [js_norm(v) for v in o]
    if isinstance(o, bool) or o is None or isinstance(o, str):
        return o
    if isinstance(o, int):
        return o if -_MAX_SAFE <= o <= _MAX_SAFE else int(float(o))
    if isinstance(o, float):
        if o != o or o in (float('inf'), float('-inf')):
            return None
        return int(o) if o.is_integer() and abs(o) < 1e21 else o
    return o


def send(code: int, obj: Any = None, extra: dict | None = None, raw: str | None = None) -> Response:
    """JSON javob (keshlanmaydi). raw — tayyor JSON matn."""
    body = raw if raw is not None else ('' if obj is None else dumps(obj))
    h = {'Cache-Control': 'no-store'}
    if extra:
        h.update(extra)
    return Response(body.encode('utf8'), status_code=code, media_type='application/json; charset=utf-8', headers=h)


def err(code: int, msg: str, extra: dict | None = None) -> Response:
    o = {'error': msg, 'message': msg, 'msg': msg, 'error_description': msg}
    if extra:
        o.update(extra)
    return send(code, o)


async def read_raw(req: Request, limit: int) -> bytes:
    size = 0
    chunks: list[bytes] = []
    async for c in req.stream():
        size += len(c)
        if size > limit:
            raise TooBig('too_big')
        chunks.append(c)
    return b''.join(chunks)


async def read_body(req: Request, limit: int) -> Any:
    raw = await read_raw(req, limit)
    if not raw:
        return None
    try:
        return json.loads(raw.decode('utf8'))
    except Exception as e:  # noqa: BLE001
        raise BadJson('bad_json') from e


def body_obj(b: Any) -> dict:
    """Node dagi «await readBody(...) || {}» — obyekt boʻlmasa ham xavfsiz .get() uchun."""
    return b if isinstance(b, dict) else {}


def client_ip(req: Request) -> str | None:
    return req.client.host if req.client else None


def ua(req: Request) -> str:
    return req.headers.get('user-agent', '')
