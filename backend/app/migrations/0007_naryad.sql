-- 4.4: NARYAD KOʻCHIRMASI — 2VS-105 dan boshqa vagonlar (6VS-60, sisterna, platforma, xopper) probegi.
-- Tortuvchi texnika (elektrovoz, teplovoz, motovoz, drezina …) smenasida tarkib oʻzgargan har boʻlak:
-- smena yozuvidagi seg = [{a: vaqt, m: oʻsha paytdagi GPS metri, vag: [vagon id]}]; boʻlak km = keyingi boʻlak m (yoki smena oxiri) − m.
-- Faqat yopilgan smenalar. GPS 0 yoki 400 km dan koʻp boʻlsa — km NULL (ilova ham yozmaydi). Faqat oʻqish (agmk_oqish).

CREATE VIEW oqish.naryad_bolaklari WITH (security_barrier) AS
    WITH s AS (
        SELECT substr(r.id, 9) AS smena_id, r.data, oqish.son(r.data->>'m') AS m_jami
          FROM public.records r
         WHERE r.id LIKE 'm:smena:%' AND NOT r.deleted AND coalesce(r.data->>'del', 'false') <> 'true'
           AND r.data->>'end' IS NOT NULL AND json_typeof(r.data->'seg') = 'array'
    ), g AS (
        SELECT s.smena_id, s.data, s.m_jami, e.n, e.val, oqish.son(e.val->>'m') AS m0
          FROM s CROSS JOIN LATERAL json_array_elements(s.data->'seg') WITH ORDINALITY AS e(val, n)
    ), k AS (
        SELECT g.*, coalesce(lead(g.m0) OVER (PARTITION BY g.smena_id ORDER BY g.m0, g.n), g.m_jami) AS m1 FROM g
    )
    SELECT k.smena_id, k.n AS bolak,
           oqish.vaqt(k.val->>'a') AS boshlandi,
           oqish.kun(k.data->>'start') AS sana,
           k.data->>'name' AS mashinist,
           k.data->>'unitName' AS texnika,
           CASE WHEN k.m_jami > 0 AND k.m_jami < 400000 THEN round(greatest(k.m1 - k.m0, 0) / 1000, 3) END AS km,
           CASE WHEN json_typeof(k.val->'vag') = 'array' THEN json_array_length(k.val->'vag') END AS vagonlar_soni,
           k.val->'vag' AS vagonlar
      FROM k;
COMMENT ON VIEW oqish.naryad_bolaklari IS '4.4: smena boʻlaklari — tarkibda turgan vagonlar va shu boʻlakdagi GPS km';

CREATE VIEW oqish.vagon_naryad WITH (security_barrier) AS
    SELECT b.smena_id, b.bolak, b.sana, b.mashinist, b.texnika, b.km, v.vagon_id
      FROM oqish.naryad_bolaklari b
      CROSS JOIN LATERAL json_array_elements_text(CASE WHEN json_typeof(b.vagonlar) = 'array' THEN b.vagonlar ELSE '[]'::json END) AS v(vagon_id);
COMMENT ON VIEW oqish.vagon_naryad IS '4.4: har vagon — qaysi naryad boʻlagida, necha km (2VS-105 lar xodka orqali — oqish.vagon_xodka)';

DO $$
BEGIN
    GRANT SELECT ON oqish.naryad_bolaklari, oqish.vagon_naryad TO agmk_oqish;
EXCEPTION WHEN undefined_object OR insufficient_privilege THEN
    RAISE NOTICE 'agmk_oqish huquqlari berilmadi';
END $$;
