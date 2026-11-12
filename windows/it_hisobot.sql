\pset footer off
\echo '==== Baza'
SELECT version();
SELECT pg_size_pretty(pg_database_size(current_database())) AS baza_hajmi, current_database() AS baza, now() AS vaqt;
SELECT name AS migratsiya, at FROM schema_migrations ORDER BY 1;
\echo '==== Jadvallar: qatorlar va hajm'
SELECT s.schemaname || '.' || s.relname AS jadval,
       (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) AS c FROM %I.%I', s.schemaname, s.relname), false, true, '')))[1]::text::bigint AS qatorlar,
       pg_size_pretty(pg_total_relation_size(s.relid)) AS hajm
  FROM pg_stat_user_tables s ORDER BY pg_total_relation_size(s.relid) DESC;
\echo '-- history: oxirgi 24 soatda eng koʻp saqlangan yozuvlar (faqat id va soni)'
SELECT id, kind, count(*) AS saqlandi, min(updated_at) AS birinchi, max(updated_at) AS oxirgi
  FROM history WHERE updated_at > to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS') GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10;
\echo '==== Bogʻlanishlar (FOREIGN KEY)'
SELECT count(*) AS jami, count(*) FILTER (WHERE tekshirilgan) AS tekshirilgan FROM nazorat.boglanishlar;
SELECT c.relname AS bogʻlanmagan_jadval FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT EXISTS (SELECT 1 FROM pg_constraint k WHERE k.contype = 'f' AND (k.conrelid = c.oid OR k.confrelid = c.oid));
\echo '==== Indekslar, triggerlar, funksiyalar'
SELECT (SELECT count(*) FROM pg_indexes WHERE schemaname IN ('public', 'nazorat')) AS indekslar,
       (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace WHERE NOT t.tgisinternal AND n.nspname IN ('public', 'nazorat')) AS triggerlar,
       (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace WHERE NOT t.tgisinternal AND t.tgenabled = 'D' AND n.nspname IN ('public', 'nazorat')) AS ochirilgan_triggerlar,
       (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname IN ('nazorat', 'oqish')) AS funksiyalar;
SELECT evtname AS ddl_kuzatuvchi, evtevent, evtenabled FROM pg_event_trigger;
\echo '==== Nazorat jurnali'
SELECT * FROM nazorat.tekshir();
SELECT amal, count(*) FROM nazorat.ozgarishlar GROUP BY 1 ORDER BY 1;
SELECT CASE WHEN dastur = 'agmk-backend' THEN 'ilova' ELSE coalesce(dastur, '?') END AS manba, count(*) FROM nazorat.ozgarishlar GROUP BY 1 ORDER BY 2 DESC;
\echo '-- ilovadan tashqarida (qoʻlda) qilingan oxirgi 20 oʻzgarish (qiymatlarsiz)'
SELECT seq, at, jadval, amal, ustunlar, db_user, dastur, host(manzil) AS manzil FROM nazorat.ozgarishlar
 WHERE dastur IS DISTINCT FROM 'agmk-backend' ORDER BY seq DESC LIMIT 20;
\echo '==== Shtat va hisoblar'
SELECT manba, shtatda, count(*) FROM xodimlar GROUP BY 1, 2 ORDER BY 3 DESC;
SELECT role, status, count(*) FROM users GROUP BY 1, 2 ORDER BY 1, 2;
\echo '==== Baza rollari'
SELECT rolname, rolsuper AS superuser, rolcanlogin AS kira_oladi, (rolpassword IS NOT NULL) AS paroli_bor FROM pg_authid WHERE rolname NOT LIKE 'pg\_%' ORDER BY 1;
SELECT r.rolname, array_agg(DISTINCT n.nspname) AS sxemalar FROM pg_roles r CROSS JOIN pg_namespace n
 WHERE r.rolname = 'agmk_oqish' AND has_schema_privilege(r.oid, n.oid, 'USAGE') AND n.nspname NOT LIKE 'pg\_%' GROUP BY 1;
SELECT has_table_privilege('agmk_oqish', 'public.hr_pd', 'SELECT') AS oqish_hr_pd_koradimi, has_table_privilege('agmk_oqish', 'public.users', 'SELECT') AS oqish_users_koradimi;
