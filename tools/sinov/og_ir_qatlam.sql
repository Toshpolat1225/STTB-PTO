-- AGMK-STTB — TEST bazasi uchun OGʻIR QATLAM (faqat TEST serveri, haqiqiy bazaga hech qachon yuklanmaydi).
-- Bazani yuk ostida sinash: kuniga TR, DR, KR — har biridan 100 ta, 540 kun (≈162 000 taʼmir) va har bir taʼmirga TMC
-- (ehtiyot qismlar, ≈5 qator → ≈800 000). Hammasi alohida «sinov» sxemasida, bogʻlanishlar (FK) va indekslar bilan.
-- Ustalar soxta (SINOV …) — haqiqiy xodimlarga soxta taʼmir yozilmaydi. Takroriy ishga tushirilsa — sinov sxemasi qayta yaratiladi.
\set ON_ERROR_STOP on
\timing on
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'sinov_server') THEN
        RAISE EXCEPTION 'Bu TEST serveri emas — ogʻir qatlam faqat test serveriga yuklanadi';
    END IF;
END $$;

DROP SCHEMA IF EXISTS sinov CASCADE;
CREATE SCHEMA sinov;
COMMENT ON SCHEMA sinov IS 'TEST: ogʻir yuk maʼlumotlari (soxta). Haqiqiy serverda boʻlmaydi';
SELECT setseed(0.42);

-- 1) Texnika — ilova yozuvlaridan (u:*)
CREATE TABLE sinov.texnika (
    id      integer PRIMARY KEY,
    raqam   text NOT NULL,
    tur     text NOT NULL CHECK (tur IN ('vag', 'lok', 'avto', 'yol')),
    model   text,
    seh     text
);
INSERT INTO sinov.texnika (id, raqam, tur, model, seh)
SELECT (substr(id, 3))::int, coalesce(data->>'num', data->>'inv', id), coalesce(nullif(data->>'kind', ''), 'vag'), data->>'type', data->>'seh'
  FROM records WHERE kind = 'unit' AND NOT deleted AND coalesce(nullif(data->>'kind', ''), 'vag') IN ('vag', 'lok', 'avto', 'yol');

-- 2) Soxta ustalar
CREATE TABLE sinov.usta (
    id      integer PRIMARY KEY,
    fio     text NOT NULL,
    uchastka text NOT NULL
);
INSERT INTO sinov.usta
SELECT g, 'SINOV Usta ' || g, (ARRAY['1-TYS VTP', '2-TYS', 'Depo uchastka', 'Kapital uchastka'])[1 + (g % 4)] FROM generate_series(1, 40) g;

-- 3) TMC nomenklaturasi
CREATE TABLE sinov.tmc_nom (
    id      integer PRIMARY KEY,
    nom     text NOT NULL UNIQUE,
    birlik  text NOT NULL,
    narx    numeric(14, 2) NOT NULL CHECK (narx > 0),
    guruh   text NOT NULL CHECK (guruh IN ('vag', 'lok', 'avto', 'yol'))
);
INSERT INTO sinov.tmc_nom (id, nom, birlik, narx, guruh)
SELECT row_number() OVER (), x.n, x.u, x.p, x.g FROM (VALUES
    ('Тормозная колодка композиционная', 'dona', 185000, 'vag'), ('Подшипник буксовый 42726', 'dona', 2650000, 'vag'), ('Подшипник буксовый 232726', 'dona', 2480000, 'vag'),
    ('Автосцепка СА-3', 'dona', 9800000, 'vag'), ('Поглощающий аппарат Ш-1-ТМ', 'dona', 7200000, 'vag'), ('Колесная пара РУ1Ш-957', 'dona', 46000000, 'vag'),
    ('Тормозной цилиндр 188Б', 'dona', 3100000, 'vag'), ('Воздухораспределитель 483', 'dona', 4300000, 'vag'), ('Рукав соединительный Р17', 'dona', 165000, 'vag'),
    ('Кран концевой 4304', 'dona', 690000, 'vag'), ('Цилиндр опрокидывания 2ВС-105', 'dona', 14500000, 'vag'), ('Пружина рессорная', 'dona', 240000, 'vag'),
    ('Клин фрикционный', 'dona', 310000, 'vag'), ('Болт с гайкой М20', 'dona', 9000, 'vag'), ('Масло буксовое ЖРО', 'kg', 52000, 'vag'),
    ('Краска эмаль ПФ-115', 'kg', 38000, 'vag'), ('Электроды УОНИ 13/55', 'kg', 41000, 'vag'), ('Лист стальной 10 мм', 'kg', 13500, 'vag'),
    ('Щетка электрографитная ЭГ-61', 'dona', 145000, 'lok'), ('Фильтр масляный дизеля', 'dona', 320000, 'lok'), ('Фильтр топливный', 'dona', 210000, 'lok'),
    ('Масло дизельное М-14В2', 'l', 26000, 'lok'), ('Колодка тормозная чугунная', 'dona', 98000, 'lok'), ('Подшипник моторно-осевой', 'dona', 5200000, 'lok'),
    ('Предохранитель ПК-45', 'dona', 85000, 'lok'), ('Контактор ПК-1146', 'dona', 6700000, 'lok'), ('Кабель ППСРВМ 50', 'm', 61000, 'lok'),
    ('Фильтр масляный (авто)', 'dona', 145000, 'avto'), ('Фильтр воздушный', 'dona', 260000, 'avto'), ('Масло моторное 15W-40', 'l', 48000, 'avto'),
    ('Шина 23.5R25', 'dona', 21500000, 'avto'), ('Аккумулятор 6СТ-190', 'dona', 3600000, 'avto'), ('Тормозные накладки', 'kompl', 420000, 'avto'),
    ('Ремень генератора', 'dona', 115000, 'avto'), ('Антифриз', 'l', 29000, 'avto'),
    ('Фильтр масляный (путевая)', 'dona', 135000, 'yol'), ('Масло гидравлическое МГЕ-46', 'l', 31000, 'yol'), ('Подшипник 3612', 'dona', 690000, 'yol'),
    ('Рукав высокого давления', 'dona', 380000, 'yol'), ('Масло моторное М-10Г2к', 'l', 27000, 'yol'), ('Колодка тормозная (путевая)', 'dona', 95000, 'yol')
) x(n, u, p, g);

-- 4) Taʼmirlar: kuniga har turdan 100 ta, oxirgi 540 kun
CREATE TABLE sinov.tamir (
    id          bigint PRIMARY KEY,
    texnika_id  integer NOT NULL REFERENCES sinov.texnika (id) ON DELETE RESTRICT,
    rt          text NOT NULL CHECK (rt IN ('TR', 'DR', 'KR')),
    uchastka    text NOT NULL,
    kirdi       date NOT NULL,
    chiqdi      date,
    usta_id     integer NOT NULL REFERENCES sinov.usta (id),
    akt_no      text NOT NULL UNIQUE,
    sabab       text,
    CHECK (chiqdi IS NULL OR chiqdi >= kirdi)
);
WITH t AS (SELECT array_agg(id ORDER BY id) a, count(*) n FROM sinov.texnika),
     g AS (SELECT row_number() OVER () AS id, d::date AS kun, rt, i
             FROM generate_series(current_date - 540, current_date - 1, interval '1 day') d,
                  unnest(ARRAY['TR', 'DR', 'KR']) rt, generate_series(1, 100) i)
INSERT INTO sinov.tamir (id, texnika_id, rt, uchastka, kirdi, chiqdi, usta_id, akt_no, sabab)
SELECT g.id, t.a[1 + floor(random() * t.n)::int],
       g.rt,
       CASE g.rt WHEN 'KR' THEN 'Kapital uchastka' WHEN 'DR' THEN 'Depo uchastka' ELSE (ARRAY['1-TYS VTP', '2-TYS'])[1 + floor(random() * 2)::int] END,
       g.kun,
       CASE WHEN g.kun + CASE g.rt WHEN 'TR' THEN 1 + floor(random() * 2) WHEN 'DR' THEN 3 + floor(random() * 6) ELSE 12 + floor(random() * 19) END::int >= current_date
            THEN NULL ELSE g.kun + CASE g.rt WHEN 'TR' THEN 1 + floor(random() * 2) WHEN 'DR' THEN 3 + floor(random() * 6) ELSE 12 + floor(random() * 19) END::int END,
       1 + floor(random() * 40)::int,
       'SINOV-' || g.rt || '-' || to_char(g.kun, 'YYMMDD') || '-' || lpad(g.i::text, 3, '0'),
       CASE WHEN g.rt = 'TR' AND random() < 0.4 THEN (ARRAY['tormoz kolodkasi yeyilgan', 'avtostsepka nosoz', 'gʻildirak juftligi: prokat', 'pnevmatik tizim havo oʻtkazadi', 'buksa qizigan', 'kuzov deformatsiyasi'])[1 + floor(random() * 6)::int] END
  FROM g, t;

-- 5) TMC sarfi: TR 2–5, DR 6–12, KR 12–18 qator (texnika guruhiga mos nomenklatura)
CREATE TABLE sinov.tmc (
    id        bigserial PRIMARY KEY,
    tamir_id  bigint NOT NULL REFERENCES sinov.tamir (id) ON DELETE CASCADE,
    nom_id    integer NOT NULL REFERENCES sinov.tmc_nom (id),
    soni      numeric(12, 2) NOT NULL CHECK (soni > 0),
    narx      numeric(14, 2) NOT NULL,
    summa     numeric(16, 2) GENERATED ALWAYS AS (round(soni * narx, 2)) STORED
);
INSERT INTO sinov.tmc (tamir_id, nom_id, soni, narx)
SELECT tm.id, n.id,
       CASE WHEN n.birlik IN ('dona', 'kompl') THEN 1 + floor(random() * CASE tm.rt WHEN 'KR' THEN 8 ELSE 4 END) ELSE round((2 + random() * 30)::numeric, 1) END,
       n.narx
  FROM sinov.tamir tm
  JOIN sinov.texnika tx ON tx.id = tm.texnika_id
  CROSS JOIN LATERAL (
      SELECT z.id, z.birlik, z.narx FROM sinov.tmc_nom z
       WHERE z.guruh = tx.tur AND tm.id > 0
       ORDER BY random()
       LIMIT CASE tm.rt WHEN 'TR' THEN 2 + (tm.id % 4) WHEN 'DR' THEN 6 + (tm.id % 7) ELSE 12 + (tm.id % 7) END
  ) n;

-- 6) Indekslar (bogʻlangan ustunlar va hisobot soʻrovlari)
CREATE INDEX tamir_texnika ON sinov.tamir (texnika_id);
CREATE INDEX tamir_kirdi ON sinov.tamir (kirdi, rt);
CREATE INDEX tamir_usta ON sinov.tamir (usta_id);
CREATE INDEX tamir_ochiq ON sinov.tamir (rt) WHERE chiqdi IS NULL;
CREATE INDEX tmc_tamir_ix ON sinov.tmc (tamir_id);
CREATE INDEX tmc_nom_ix ON sinov.tmc (nom_id);
ANALYZE sinov.texnika, sinov.usta, sinov.tmc_nom, sinov.tamir, sinov.tmc;

-- 7) Hisobot koʻrinishlari
CREATE VIEW sinov.v_oylik AS
WITH s AS (SELECT m.tamir_id, sum(m.summa) AS summa FROM sinov.tmc m GROUP BY 1)
SELECT date_trunc('month', t.kirdi)::date AS oy, t.rt, count(*) AS tamirlar,
       round(avg(t.chiqdi - t.kirdi), 1) AS ortacha_kun, count(*) FILTER (WHERE t.chiqdi IS NULL) AS hali_tamirda,
       round(sum(s.summa) / 1e6, 1) AS tmc_mln_som
  FROM sinov.tamir t LEFT JOIN s ON s.tamir_id = t.id GROUP BY 1, 2 ORDER BY 1, 2;
CREATE VIEW sinov.v_texnika AS
SELECT x.id, x.raqam, x.tur, x.model, count(t.*) AS tamirlar, count(t.*) FILTER (WHERE t.rt = 'KR') AS kr, count(t.*) FILTER (WHERE t.rt = 'DR') AS dr,
       count(t.*) FILTER (WHERE t.rt = 'TR') AS tr, max(t.kirdi) AS oxirgi
  FROM sinov.texnika x LEFT JOIN sinov.tamir t ON t.texnika_id = x.id GROUP BY x.id ORDER BY tamirlar DESC;
CREATE VIEW sinov.v_tmc_sarf AS
SELECT date_trunc('month', t.kirdi)::date AS oy, n.nom, n.birlik, sum(m.soni) AS soni, round(sum(m.summa) / 1e6, 2) AS mln_som
  FROM sinov.tmc m JOIN sinov.tamir t ON t.id = m.tamir_id JOIN sinov.tmc_nom n ON n.id = m.nom_id GROUP BY 1, 2, 3 ORDER BY 1, 5 DESC;

-- auditor ham koʻra olsin (faqat oʻqish)
DO $$ BEGIN
    GRANT USAGE ON SCHEMA sinov TO agmk_oqish;
    GRANT SELECT ON ALL TABLES IN SCHEMA sinov TO agmk_oqish;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Natija
SELECT 'texnika' AS jadval, count(*) FROM sinov.texnika UNION ALL SELECT 'tamir', count(*) FROM sinov.tamir
UNION ALL SELECT 'tmc', count(*) FROM sinov.tmc UNION ALL SELECT 'ochiq (hali taʼmirda)', count(*) FROM sinov.tamir WHERE chiqdi IS NULL;
SELECT pg_size_pretty(pg_total_relation_size('sinov.tamir') + pg_total_relation_size('sinov.tmc')) AS sinov_hajmi;
