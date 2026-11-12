-- 4.2: NAZORAT (audit). Bazadagi har bir oʻzgarish — kim, qachon, qaysi dasturdan, qaysi manzildan — oʻchirib boʻlmaydigan
-- jurnalga yoziladi (ilova orqali ham, DBeaver/psql orqali toʻgʻridan-toʻgʻri ham). Jadvallar orasiga bogʻlanishlar (FOREIGN KEY)
-- va indekslar qoʻshiladi. IT/auditor uchun faqat oʻqish huquqli «agmk_oqish» roli va shaxsiy maʼlumotsiz koʻrinishlar (oqish.*).
--
-- Ierarxiya:
--   agmk (baza)
--   ├─ public   — ilova jadvallari (users → sessiyalar, imzolar, xabarlar …; sign_docs → imzolar, tanishuv, vaqtincha tayinlash;
--   │             records → history)
--   ├─ nazorat  — oʻzgarishlar jurnali (ozgarishlar), uning funksiyalari va himoyasi
--   └─ oqish    — auditor koʻrinishlari (shaxsiy maʼlumot, oylik, parol, imzo rasmi va GPS yoʻq)

CREATE SCHEMA IF NOT EXISTS nazorat;
COMMENT ON SCHEMA nazorat IS 'Audit: bazadagi barcha oʻzgarishlar jurnali (oʻzgartirib/oʻchirib boʻlmaydi, xesh-zanjir bilan)';

-- ------------------------------------------------------------------ 1. Jurnal jadvali
CREATE TABLE nazorat.ozgarishlar (
    seq      bigint PRIMARY KEY,                                   -- tartib raqami (zanjir tartibi, triggerda beriladi)
    at       timestamptz NOT NULL DEFAULT clock_timestamp(),        -- qachon
    jadval   text NOT NULL,                                         -- qaysi jadval (sxema.jadval) yoki DDL obyekti
    amal     text NOT NULL CHECK (amal IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'DDL')),
    kalit    jsonb,                                                 -- yozuvning asosiy kaliti (PRIMARY KEY qiymatlari)
    ustunlar text[],                                                -- oʻzgargan ustunlar
    eski     jsonb,                                                 -- oʻzgarishdan oldingi qiymatlar (maxfiy ustunlarsiz)
    yangi    jsonb,                                                 -- yangi qiymatlar (UPDATE da)
    db_user  text NOT NULL DEFAULT session_user,                    -- bazaga kim nomidan ulangan
    dastur   text DEFAULT current_setting('application_name', true), -- agmk-backend = ilova; boshqasi (DBeaver, psql) = qoʻlda
    manzil   inet DEFAULT inet_client_addr(),                       -- ulangan kompyuter manzili (127.0.0.1 = shu kompyuter)
    sql      text,                                                  -- ilovadan tashqaridagi oʻzgarishda — bajarilgan buyruq
    oldingi  text NOT NULL,                                         -- oldingi yozuvning xeshi
    xesh     text NOT NULL                                          -- sha256(oldingi + shu yozuv) — oʻrtadan oʻchirilsa zanjir uziladi
);
CREATE SEQUENCE nazorat.ozgarishlar_seq;
CREATE INDEX ozgarishlar_jadval ON nazorat.ozgarishlar (jadval, seq);
CREATE INDEX ozgarishlar_at ON nazorat.ozgarishlar (at);
COMMENT ON TABLE nazorat.ozgarishlar IS 'Har bir INSERT/UPDATE/DELETE/TRUNCATE va sxema oʻzgarishi. Faqat qoʻshiladi; oʻzgartirish va oʻchirish taqiqlangan';

-- Yozuv xeshi (tekshirishda ham aynan shu funksiya ishlatiladi)
CREATE FUNCTION nazorat.xesh(r nazorat.ozgarishlar) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
    SELECT encode(sha256(convert_to(concat_ws('|', r.oldingi, r.seq, (extract(epoch FROM r.at) * 1000000)::bigint, r.jadval, r.amal,
        r.kalit::text, array_to_string(r.ustunlar, ','), r.eski::text, r.yangi::text, r.db_user, r.dastur, host(r.manzil), r.sql), 'UTF8')), 'hex')
$$;

-- Zanjir: har yangi yozuv oldingisining xeshiga bogʻlanadi. Qulf — yozuvlar qatʼiy ketma-ket boʻlishi uchun.
CREATE FUNCTION nazorat.zanjir() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE p text;
BEGIN
    PERFORM pg_advisory_xact_lock(7351002);
    NEW.seq := nextval('nazorat.ozgarishlar_seq');
    SELECT o.xesh INTO p FROM nazorat.ozgarishlar o ORDER BY o.seq DESC LIMIT 1;
    NEW.oldingi := coalesce(p, '0');
    NEW.xesh := nazorat.xesh(NEW);
    RETURN NEW;
END $$;
CREATE TRIGGER zanjir BEFORE INSERT ON nazorat.ozgarishlar FOR EACH ROW EXECUTE FUNCTION nazorat.zanjir();

-- ------------------------------------------------------------------ 2. Himoya: jurnallarni oʻzgartirish/oʻchirish taqiqlangan
CREATE FUNCTION nazorat.taqiq() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'AGMK nazorat: «%» jadvalidagi yozuvlarni oʻzgartirish va oʻchirish taqiqlangan (audit jurnali)', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME
        USING ERRCODE = 'insufficient_privilege';
END $$;

CREATE TRIGGER taqiq BEFORE UPDATE OR DELETE ON nazorat.ozgarishlar FOR EACH ROW EXECUTE FUNCTION nazorat.taqiq();
CREATE TRIGGER taqiq_truncate BEFORE TRUNCATE ON nazorat.ozgarishlar FOR EACH STATEMENT EXECUTE FUNCTION nazorat.taqiq();
-- ilova tarixi (history) va kirishlar jurnali (audit) ham faqat qoʻshiladi
CREATE TRIGGER taqiq BEFORE UPDATE OR DELETE ON public.history FOR EACH ROW EXECUTE FUNCTION nazorat.taqiq();
CREATE TRIGGER taqiq_truncate BEFORE TRUNCATE ON public.history FOR EACH STATEMENT EXECUTE FUNCTION nazorat.taqiq();
CREATE TRIGGER taqiq BEFORE UPDATE OR DELETE ON public.audit FOR EACH ROW EXECUTE FUNCTION nazorat.taqiq();
CREATE TRIGGER taqiq_truncate BEFORE TRUNCATE ON public.audit FOR EACH STATEMENT EXECUTE FUNCTION nazorat.taqiq();

-- ------------------------------------------------------------------ 3. Kuzatuvchi: jadval oʻzgarishlarini jurnalga yozadi
-- TG_ARGV[0]: 'toliq' — qiymatlar bilan; 'yashirin' — faqat kalit va ustun nomlari (oylik, shaxsiy maʼlumot)
-- TG_ARGV[1]: jurnalga yozilmaydigan maxfiy ustunlar, masalan '{salt,hash}'
CREATE FUNCTION nazorat.yoz() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    rejim  text := coalesce(TG_ARGV[0], 'toliq');
    yashir text[] := coalesce(nullif(TG_ARGV[1], ''), '{}')::text[];
    o jsonb; n jsonb; k jsonb; u text[]; pk text[]; q text;
BEGIN
    IF TG_OP <> 'INSERT' THEN o := to_jsonb(OLD); END IF;
    IF TG_OP <> 'DELETE' THEN n := to_jsonb(NEW); END IF;
    SELECT array_agg(a.attname::text ORDER BY a.attnum) INTO pk
      FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
     WHERE i.indrelid = TG_RELID AND i.indisprimary;
    SELECT jsonb_object_agg(c, coalesce(n, o) -> c) INTO k FROM unnest(pk) c;
    IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(e.key ORDER BY e.key) INTO u FROM jsonb_each(n) e WHERE e.value IS DISTINCT FROM o -> e.key;
        IF u IS NULL THEN RETURN NULL; END IF;                 -- hech narsa oʻzgarmagan
        SELECT jsonb_object_agg(c, o -> c), jsonb_object_agg(c, n -> c) INTO o, n FROM unnest(u) c;
    ELSIF TG_OP = 'INSERT' THEN
        SELECT array_agg(x ORDER BY x) INTO u FROM jsonb_object_keys(n) x;
        n := NULL;                                             -- yangi yozuvning toʻliq nusxasi jadvalning oʻzida
    ELSE
        SELECT array_agg(x ORDER BY x) INTO u FROM jsonb_object_keys(o) x;
    END IF;
    IF rejim = 'yashirin' THEN
        o := NULL; n := NULL;
    ELSE
        o := o - yashir; n := n - yashir;
    END IF;
    IF coalesce(current_setting('application_name', true), '') <> 'agmk-backend' THEN
        q := left(current_query(), 2000);
        IF q ~* 'password|parol|pin' OR rejim = 'yashirin' THEN q := '(maxfiy — yozilmadi)'; END IF;
    END IF;
    INSERT INTO nazorat.ozgarishlar (jadval, amal, kalit, ustunlar, eski, yangi, sql)
    VALUES (TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME, TG_OP, k, u, o, n, q);
    RETURN NULL;
END $$;

CREATE FUNCTION nazorat.yoz_truncate() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO nazorat.ozgarishlar (jadval, amal, sql) VALUES (TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME, 'TRUNCATE', left(current_query(), 2000));
    RETURN NULL;
END $$;

-- Kuzatiladigan jadvallar. refresh (sessiya tokenlari) va trk yangilanishlari (GPS nuqtalari) yozilmaydi — faqat oʻchirish.
DO $$
DECLARE t record;
BEGIN
    FOR t IN SELECT * FROM (VALUES
        ('users',      'toliq',    '{salt,hash,sig,sigpin}'),
        ('records',    'toliq',    ''),
        ('messages',   'toliq',    ''),
        ('files',      'toliq',    '{data}'),
        ('sign_docs',  'toliq',    '{html}'),
        ('sign_acts',  'toliq',    '{png}'),
        ('sign_seen',  'toliq',    ''),
        ('vt_act',     'toliq',    ''),
        ('kir_seed',   'toliq',    '{ch}'),
        ('kir_alt',    'toliq',    '{salt,hash}'),
        ('settings',   'toliq',    ''),
        ('my_rel',     'toliq',    ''),
        ('kiy_issue',  'toliq',    ''),
        ('kiy_person', 'toliq',    ''),
        ('oklad',      'yashirin', ''),
        ('hr_pd',      'yashirin', '')
    ) v(jadval, rejim, yashir) LOOP
        EXECUTE format('CREATE TRIGGER nazorat AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION nazorat.yoz(%L, %L)', t.jadval, t.rejim, t.yashir);
        EXECUTE format('CREATE TRIGGER nazorat_truncate AFTER TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION nazorat.yoz_truncate()', t.jadval);
    END LOOP;
END $$;
CREATE TRIGGER nazorat AFTER DELETE ON public.trk FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('yashirin', '');
CREATE TRIGGER nazorat_truncate AFTER TRUNCATE ON public.trk FOR EACH STATEMENT EXECUTE FUNCTION nazorat.yoz_truncate();
CREATE TRIGGER nazorat_truncate AFTER TRUNCATE ON public.refresh FOR EACH STATEMENT EXECUTE FUNCTION nazorat.yoz_truncate();

-- ------------------------------------------------------------------ 4. Bogʻlanishlar (FOREIGN KEY) va indekslar
-- Tabel oʻzgarsa (retabel) — bogʻliq yozuvlar ham oʻzi yangilanadi (ON UPDATE CASCADE).
-- Imzo chekkan xodimning hisobini oʻchirib boʻlmaydi (RESTRICT) — imzo dalil sifatida qoladi.
-- Eski bazada «yetim» yozuv boʻlsa, bogʻlanish NOT VALID holatda qoladi (yangi yozuvlar baribir tekshiriladi);
-- holatini nazorat.boglanishlar koʻrinishi koʻrsatadi.
CREATE INDEX IF NOT EXISTS sign_acts_tabel ON public.sign_acts (tabel);
CREATE INDEX IF NOT EXISTS sign_seen_tabel ON public.sign_seen (tabel);
CREATE INDEX IF NOT EXISTS sign_docs_created_by ON public.sign_docs (created_by);
CREATE INDEX IF NOT EXISTS messages_from ON public.messages (from_tabel);
CREATE INDEX IF NOT EXISTS files_owner ON public.files (owner);
CREATE INDEX IF NOT EXISTS audit_at ON public.audit (at);

DO $$
DECLARE f record;
BEGIN
    FOR f IN SELECT * FROM (VALUES
        ('refresh',   'refresh_tabel_fk',    'tabel',      'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('sign_acts', 'sign_acts_tabel_fk',  'tabel',      'users',     'tabel', 'CASCADE',  'RESTRICT'),
        ('sign_seen', 'sign_seen_tabel_fk',  'tabel',      'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('trk',       'trk_tabel_fk',        'tabel',      'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('messages',  'messages_from_fk',    'from_tabel', 'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('messages',  'messages_to_fk',      'to_tabel',   'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('files',     'files_owner_fk',      'owner',      'users',     'tabel', 'CASCADE',  'CASCADE'),
        ('sign_acts', 'sign_acts_doc_fk',    'doc_id',     'sign_docs', 'id',    'CASCADE',  'CASCADE'),
        ('sign_seen', 'sign_seen_doc_fk',    'doc_id',     'sign_docs', 'id',    'CASCADE',  'CASCADE'),
        ('vt_act',    'vt_act_doc_fk',       'doc_id',     'sign_docs', 'id',    'CASCADE',  'CASCADE'),
        ('history',   'history_records_fk',  'id',         'records',   'id',    'NO ACTION', 'RESTRICT')
    ) v(t, n, c, rt, rc, upd, del) LOOP
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I (%I) ON UPDATE %s ON DELETE %s NOT VALID',
                       f.t, f.n, f.c, f.rt, f.rc, f.upd, f.del);
        BEGIN
            EXECUTE format('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', f.t, f.n);
        EXCEPTION WHEN foreign_key_violation THEN
            RAISE NOTICE 'Bogʻlanish % — eski «yetim» yozuvlar bor, NOT VALID holatda qoldi', f.n;
        END;
    END LOOP;
END $$;

-- Bogʻlanishlar va ularning holati (auditor uchun)
CREATE VIEW nazorat.boglanishlar AS
SELECT c.conrelid::regclass::text AS jadval, c.conname AS nomi, pg_get_constraintdef(c.oid) AS tavsif, c.convalidated AS tekshirilgan
  FROM pg_constraint c JOIN pg_namespace s ON s.oid = c.connamespace
 WHERE c.contype = 'f' AND s.nspname IN ('public', 'nazorat')
 ORDER BY 1, 2;

-- ------------------------------------------------------------------ 5. Tekshirish: zanjir butunmi
CREATE FUNCTION nazorat.tekshir() RETURNS TABLE (jami bigint, buzilgan bigint, birinchi_buzilgan bigint, oxirgi_xesh text)
LANGUAGE plpgsql STABLE AS $$
DECLARE r nazorat.ozgarishlar; p text := '0'; n bigint := 0; b bigint := 0; f bigint;
BEGIN
    FOR r IN SELECT * FROM nazorat.ozgarishlar ORDER BY seq LOOP
        n := n + 1;
        IF r.oldingi <> p OR r.xesh <> nazorat.xesh(r) THEN
            b := b + 1;
            IF f IS NULL THEN f := r.seq; END IF;
        END IF;
        p := r.xesh;
    END LOOP;
    RETURN QUERY SELECT n, b, f, p;
END $$;
COMMENT ON FUNCTION nazorat.tekshir() IS 'Jurnal zanjirini tekshiradi: buzilgan = 0 boʻlsa, hech bir yozuv oʻchirilmagan va oʻzgartirilmagan';

-- Oʻqish uchun qulay koʻrinish: kim (ism bilan), qachon, qaysi dasturdan
CREATE VIEW nazorat.v_ozgarishlar AS
SELECT o.seq, o.at, o.jadval, o.amal, o.kalit, o.ustunlar, o.db_user,
       CASE WHEN o.dastur = 'agmk-backend' THEN 'ilova' ELSE coalesce(nullif(o.dastur, ''), 'nomaʼlum') || ' (qoʻlda)' END AS manba,
       host(o.manzil) AS manzil,
       coalesce(o.yangi ->> 'updated_by', o.eski ->> 'updated_by', o.yangi ->> 'by_tabel', o.yangi ->> 'cancel_by') AS ilova_tabel,
       o.eski, o.yangi, o.sql
  FROM nazorat.ozgarishlar o;

-- ------------------------------------------------------------------ 6. Auditor (faqat oʻqish) — oqish sxemasi
-- Maxfiy yozuvlar va shaxsiy maʼlumot kalitlari roʻyxati server ishga tushganda acl.py dan yangilanadi (KV_ACL, PD_KEYS).
CREATE TABLE nazorat.maxfiy (
    tur   text NOT NULL CHECK (tur IN ('id', 'id_boshi', 'pd')),
    qiymat text NOT NULL,
    PRIMARY KEY (tur, qiymat)
);
INSERT INTO nazorat.maxfiy (tur, qiymat) VALUES
    ('id', 'kv:agmk_bux'), ('id', 'kv:agmk_fot_cfg_v1'), ('id', 'kv:agmk_fot_hist_v1'), ('id', 'kv:agmk_nar_v1'), ('id', 'kv:agmk_nar_chk_v1'),
    ('id', 'kv:agmk_nar_wag_v1'), ('id', 'kv:agmk_nar_vt_v1'), ('id', 'kv:agmk_nar_vt_cfg'), ('id', 'kv:agmk_audit_v1'), ('id_boshi', 'm:iqt:'),
    ('pd', 'birthDate'), ('pd', 'yil'), ('pd', 'oilaviy'), ('pd', 'oilaAzolari'), ('pd', 'spravka'), ('pd', 'workHistory'), ('pd', 'yutuqlar'),
    ('pd', 'hafsanalar'), ('pd', 'tatillar'), ('pd', 'izoh'), ('pd', 'passport'), ('pd', 'address'), ('pd', 'manzil'), ('pd', 'oklad'),
    ('pd', 'photo'), ('pd', 'gallery'), ('pd', 'email');

CREATE FUNCTION nazorat.pd_tozala(kind text, id text, d json) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, nazorat AS $$
    SELECT CASE
        WHEN EXISTS (SELECT 1 FROM nazorat.maxfiy m WHERE (m.tur = 'id' AND m.qiymat = id) OR (m.tur = 'id_boshi' AND left(id, length(m.qiymat)) = m.qiymat))
            THEN NULL
        WHEN kind = 'xodim' AND jsonb_typeof(d::jsonb) = 'object'
            THEN d::jsonb - coalesce((SELECT array_agg(qiymat) FROM nazorat.maxfiy WHERE tur = 'pd'), '{}')
        ELSE d::jsonb
    END
$$;

CREATE SCHEMA IF NOT EXISTS oqish;
COMMENT ON SCHEMA oqish IS 'Auditor/IT uchun faqat oʻqish koʻrinishlari: parol, imzo rasmi, oylik, shaxsiy maʼlumot va GPS yoʻq';

CREATE VIEW oqish.foydalanuvchilar WITH (security_barrier) AS
    SELECT tabel, name, lavozim, role, status, created_at, last_login, device, demo, must_change FROM public.users;
CREATE VIEW oqish.yozuvlar WITH (security_barrier) AS
    SELECT id, kind, nazorat.pd_tozala(kind, id, data) AS data, deleted, updated_at, updated_by FROM public.records;
CREATE VIEW oqish.tarix WITH (security_barrier) AS
    SELECT seq, id, kind, nazorat.pd_tozala(kind, id, data) AS data, deleted, updated_at, updated_by FROM public.history;
CREATE VIEW oqish.hujjatlar WITH (security_barrier) AS
    SELECT id, title, hash, created_by, created_at, status, signers, done_at, demo FROM public.sign_docs;
CREATE VIEW oqish.imzolar WITH (security_barrier) AS
    SELECT id, doc_id, tabel, action, reason, hash, at, device FROM public.sign_acts;
CREATE VIEW oqish.tanishdi WITH (security_barrier) AS SELECT doc_id, tabel, at FROM public.sign_seen;
CREATE VIEW oqish.vaqtincha_tayinlash WITH (security_barrier) AS SELECT * FROM public.vt_act;
CREATE VIEW oqish.xabarlar WITH (security_barrier) AS
    SELECT id, from_tabel, to_tabel, created_at, coalesce(json_array_length(files), 0) AS fayllar_soni FROM public.messages;
CREATE VIEW oqish.fayllar WITH (security_barrier) AS SELECT id, owner, to_tabel, name, mime, size, created_at FROM public.files;
CREATE VIEW oqish.kirishlar WITH (security_barrier) AS SELECT seq, at, tabel, action, detail, ip FROM public.audit;
CREATE VIEW oqish.biriktirish WITH (security_barrier) AS SELECT * FROM public.my_rel;
CREATE VIEW oqish.kiyim_berilgan WITH (security_barrier) AS SELECT * FROM public.kiy_issue;
CREATE VIEW oqish.ozgarishlar WITH (security_barrier) AS
    SELECT seq, at, jadval, amal, kalit, ustunlar, db_user, dastur, host(manzil) AS manzil, oldingi, xesh FROM nazorat.ozgarishlar;
CREATE VIEW oqish.boglanishlar AS SELECT * FROM nazorat.boglanishlar;
CREATE VIEW oqish.jadvallar_hajmi AS
    SELECT n.nspname || '.' || c.relname AS jadval, c.reltuples::bigint AS taxminiy_qatorlar,
           pg_size_pretty(pg_total_relation_size(c.oid)) AS hajm, pg_total_relation_size(c.oid) AS bayt
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'r' AND n.nspname IN ('public', 'nazorat')
     ORDER BY pg_total_relation_size(c.oid) DESC;
CREATE FUNCTION oqish.zanjir_tekshir() RETURNS TABLE (jami bigint, buzilgan bigint, birinchi_buzilgan bigint, oxirgi_xesh text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, nazorat AS $$ SELECT * FROM nazorat.tekshir() $$;

-- Rol: kirish paroli keyin alohida beriladi (OQISH_PAROLINI_ORNATISH.bat). Huquq yetmasa (oddiy foydalanuvchi) — oʻtkazib yuboriladi.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agmk_oqish') THEN
        CREATE ROLE agmk_oqish NOLOGIN;
    END IF;
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO agmk_oqish', current_database());
    REVOKE ALL ON SCHEMA public FROM agmk_oqish;
    GRANT USAGE ON SCHEMA oqish TO agmk_oqish;
    GRANT SELECT ON ALL TABLES IN SCHEMA oqish TO agmk_oqish;
    REVOKE ALL ON FUNCTION oqish.zanjir_tekshir() FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION oqish.zanjir_tekshir() TO agmk_oqish;
    ALTER ROLE agmk_oqish SET default_transaction_read_only = on;
    ALTER ROLE agmk_oqish SET search_path = oqish;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'agmk_oqish roli yaratilmadi (huquq yetmaydi)';
END $$;
-- public sxemasidan hammaga beriladigan standart huquqlar ham olinadi
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- ------------------------------------------------------------------ 7. Sxema oʻzgarishlari (DDL) ham jurnalga
-- Masalan: kimdir triggerni oʻchirsa (ALTER TABLE … DISABLE TRIGGER) yoki jadvalni oʻchirsa — bu ham yoziladi.
CREATE FUNCTION nazorat.ddl_yoz() RETURNS event_trigger
LANGUAGE plpgsql AS $$
DECLARE r record; q text := left(current_query(), 2000);
BEGIN
    IF q ~* 'password|parol' THEN q := '(maxfiy — yozilmadi)'; END IF;
    IF TG_EVENT = 'sql_drop' THEN
        FOR r IN SELECT * FROM pg_event_trigger_dropped_objects() WHERE NOT is_temporary AND object_type IN ('table', 'trigger', 'schema', 'function', 'view', 'table constraint', 'index') LOOP
            INSERT INTO nazorat.ozgarishlar (jadval, amal, kalit, sql) VALUES (coalesce(r.object_identity, '?'), 'DDL', jsonb_build_object('buyruq', 'DROP', 'tur', r.object_type), q);
        END LOOP;
    ELSE
        FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE schema_name IS DISTINCT FROM 'pg_temp' AND NOT in_extension LOOP
            INSERT INTO nazorat.ozgarishlar (jadval, amal, kalit, sql) VALUES (coalesce(r.object_identity, '?'), 'DDL', jsonb_build_object('buyruq', r.command_tag, 'tur', r.object_type), q);
        END LOOP;
    END IF;
END $$;

DO $$
BEGIN
    CREATE EVENT TRIGGER nazorat_ddl ON ddl_command_end EXECUTE FUNCTION nazorat.ddl_yoz();
    CREATE EVENT TRIGGER nazorat_drop ON sql_drop EXECUTE FUNCTION nazorat.ddl_yoz();
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'DDL kuzatuvchisi yaratilmadi (superuser huquqi kerak)';
END $$;

-- Boshlangʻich yozuv: zanjirning birinchi halqasi
INSERT INTO nazorat.ozgarishlar (jadval, amal, kalit, sql) VALUES ('nazorat', 'DDL', '{"buyruq": "0004_nazorat oʻrnatildi"}', NULL);
