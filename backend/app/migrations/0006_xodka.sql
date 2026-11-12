-- 4.4: PROBEG INTEGRATSIYASI — mashinist xodkalari (m:xodka:<id>) va smenalar (m:smena:<id>) uchun
-- IT / DBeaver uchun faqat oʻqish koʻrinishlari. Maʼlumot oʻzi public.records da (ilova sinxroni), bu yerda — ustunlarga ajratilgan.
-- Shaxsiy maʼlumot yoʻq: faqat tabel, F.I.Sh. (mashinist), lokomotiv, vagonlar, km, tonna. GPS nuqtalari saqlanmaydi (faqat jami masofa).
-- Notoʻgʻri yozuv (sana / son formati buzilgan) koʻrinishni toʻxtatmaydi — oʻsha maydon NULL boʻladi.

CREATE INDEX IF NOT EXISTS records_mod_xodka ON public.records (id text_pattern_ops) WHERE id LIKE 'm:%';

CREATE FUNCTION oqish.son(t text) RETURNS numeric LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN t ~ '^-?[0-9]+(\.[0-9]+)?$' THEN t::numeric END $$;
CREATE FUNCTION oqish.kun(t text) RETURNS date LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN t ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN substr(t, 1, 10)::date END $$;
CREATE FUNCTION oqish.vaqt(t text) RETURNS timestamptz LANGUAGE sql STABLE AS
$$ SELECT CASE WHEN t ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z?$' THEN t::timestamptz END $$;

CREATE VIEW oqish.xodkalar WITH (security_barrier) AS
    SELECT substr(r.id, 9) AS id,
           oqish.kun(r.data->>'sana') AS sana,
           oqish.vaqt(r.data->>'at') AS vaqt,
           r.data->>'tabel' AS tabel,
           r.data->>'name' AS mashinist,
           r.data->>'lokId' AS lokomotiv_id,
           r.data->>'lokName' AS lokomotiv,
           r.data->>'tarkibNo' AS tarkib,
           CASE r.data->>'mz' WHEN 'kkd' THEN 'KKD (fabrika)' WHEN 'nak' THEN 'Nakpaysay (zaxira)' WHEN 'bosh' THEN 'Boʻsh jins' ELSE r.data->>'mz' END AS manzil,
           oqish.son(r.data->>'soni') AS xodka_soni,
           nullif(oqish.son(r.data->>'tn'), 0) AS nakladnoy_t,
           CASE WHEN json_typeof(r.data->'vag') = 'array' THEN json_array_length(r.data->'vag') END AS vagonlar_soni,
           r.data->>'smId' AS smena_id,
           r.updated_at, r.updated_by
      FROM public.records r
     WHERE r.id LIKE 'm:xodka:%' AND NOT r.deleted AND coalesce(r.data->>'del', 'false') <> 'true';
COMMENT ON VIEW oqish.xodkalar IS '4.4: mashinist kiritgan xodkalar (manzil, soni, nakladnoy tonnasi)';

CREATE VIEW oqish.vagon_xodka WITH (security_barrier) AS
    SELECT x.id AS xodka_id, x.sana, x.manzil, x.xodka_soni, x.lokomotiv, x.mashinist, v.vagon_id
      FROM oqish.xodkalar x
      JOIN public.records r ON r.id = 'm:xodka:' || x.id
      CROSS JOIN LATERAL json_array_elements_text(CASE WHEN json_typeof(r.data->'vag') = 'array' THEN r.data->'vag' ELSE '[]'::json END) AS v(vagon_id);
COMMENT ON VIEW oqish.vagon_xodka IS '4.4: qaysi vagon qaysi xodkada boʻlgan (tarkib roʻyxati — xodka kiritilgan paytdagi)';

CREATE VIEW oqish.smenalar WITH (security_barrier) AS
    SELECT substr(r.id, 9) AS id,
           r.data->>'tabel' AS tabel,
           r.data->>'name' AS xodim,
           r.data->>'kind' AS turi,
           r.data->>'unitId' AS texnika_id,
           r.data->>'unitName' AS texnika,
           oqish.vaqt(r.data->>'start') AS boshlandi,
           oqish.vaqt(r.data->>'end') AS tugadi,
           round(coalesce(oqish.son(r.data->>'m'), 0) / 1000, 2) AS gps_km,
           r.updated_at
      FROM public.records r
     WHERE r.id LIKE 'm:smena:%' AND NOT r.deleted AND coalesce(r.data->>'del', 'false') <> 'true';
COMMENT ON VIEW oqish.smenalar IS '4.4: smenalar (GPS jami masofa, nuqtalar yoʻq)';

DO $$
BEGIN
    GRANT SELECT ON oqish.xodkalar, oqish.vagon_xodka, oqish.smenalar TO agmk_oqish;
    GRANT EXECUTE ON FUNCTION oqish.son(text), oqish.kun(text), oqish.vaqt(text) TO agmk_oqish;
EXCEPTION WHEN undefined_object OR insufficient_privilege THEN
    RAISE NOTICE 'agmk_oqish huquqlari berilmadi';
END $$;
