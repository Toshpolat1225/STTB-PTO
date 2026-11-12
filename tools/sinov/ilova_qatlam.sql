-- AGMK-STTB — TEST bazasiga ILOVA QATLAMINI yuklash (gen_app.js natijasi, /tmp/ilova.jsonl). Faqat TEST serveri.
-- Har bir qator — ilova serverga yuboradigan yozuv {id, kind, data}. records ga yoziladi (bor boʻlsa — yangilanadi) va history ga.
-- updated_at — hozirgi vaqtdan oʻsuvchi: telefonlar keyingi sinxronda hammasini oladi.
\set ON_ERROR_STOP on
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'sinov_server') THEN
        RAISE EXCEPTION 'Bu TEST serveri emas — sinov maʼlumotlari faqat test serveriga yuklanadi';
    END IF;
END $$;
CREATE TEMP TABLE imp (line text);
\copy imp FROM '/tmp/ilova.jsonl' WITH (FORMAT csv, QUOTE E'\x01', DELIMITER E'\x02')
DELETE FROM imp WHERE btrim(line) = '';
CREATE TEMP TABLE imp2 AS
SELECT row_number() OVER () AS n, line::json AS j FROM imp;
CREATE TEMP TABLE imp3 AS
SELECT n, j->>'id' AS id, j->>'kind' AS kind, (j->'data') AS data,
       to_char((SELECT greatest(now(), coalesce(max(updated_at)::timestamptz, now())) FROM records) AT TIME ZONE 'UTC' + n * interval '1 microsecond', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS st
  FROM imp2;
INSERT INTO records (id, kind, data, deleted, updated_at, updated_by)
SELECT id, kind, data, false, st, (SELECT value->>'admin' FROM settings WHERE key = 'sinov_server') FROM imp3
ON CONFLICT (id) DO UPDATE SET kind = excluded.kind, data = excluded.data, deleted = false, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
INSERT INTO history (id, kind, data, deleted, updated_at, updated_by)
SELECT id, kind, data, false, st, (SELECT value->>'admin' FROM settings WHERE key = 'sinov_server') FROM imp3;
SELECT kind, count(*) AS yuklandi FROM imp3 GROUP BY 1 ORDER BY 1;
