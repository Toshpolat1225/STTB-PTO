-- 4.2: XODIMLAR — bazadagi yagona shtat jadvali. Tabel raqami bor HAMMA jadval unga bogʻlanadi (FOREIGN KEY):
-- users, hr_pd, oklad, maxsus kiyim, biriktirish, kirishlar (audit), qoʻshimcha kirishlar, imzo hujjati muallifi,
-- vaqtincha tayinlash, yozuvlar va tarixdagi «kim oʻzgartirdi» (updated_by), «kim bergan / bekor qilgan» (by_tabel, cancel_by).
--
-- Manba: server ishga tushganda va har daqiqada company/xodimlar.json (ITR) + ishchilar.json (1C) dan yangilanadi
-- (faqat F.I.Sh., lavozim, boʻlinma — oylik va shaxsiy maʼlumot BU YERGA YOZILMAYDI).
-- Roʻyxatda yoʻq tabel uchramasa (masalan, eski yozuv, demo hisob, notoʻgʻri tabel bilan kirishga urinish) — u ham
-- avtomatik qoʻshiladi (shtatda = false, manba = 'avto:<jadval>'), shuning uchun ilova hech qachon toʻxtab qolmaydi.
-- Xodim shtatdan chiqsa — oʻchirilmaydi, shtatda = false boʻladi (tarix va dalillar saqlanadi).

CREATE TABLE public.xodimlar (
    tabel     text PRIMARY KEY,
    fio       text,
    lavozim   text,
    bolinma   text,                        -- tuzilmadagi boʻlinma (id)
    uchastka  text,
    itr       boolean,                     -- true — ITR (shtat roʻyxati), false — ishchi (1C), null — nomaʼlum
    shtatda   boolean NOT NULL DEFAULT false,
    manba     text NOT NULL DEFAULT 'shtat',
    yangilandi timestamptz NOT NULL DEFAULT now(),
    CHECK (tabel <> '')
);
CREATE INDEX xodimlar_shtatda ON public.xodimlar (shtatda);
COMMENT ON TABLE public.xodimlar IS 'Shtat: barcha tabel raqamlari. Hamma tabelli jadvallar shu jadvalga bogʻlangan. Oylik va shaxsiy maʼlumot yoʻq';
CREATE TRIGGER nazorat AFTER INSERT OR UPDATE OR DELETE ON public.xodimlar FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('toliq', '');
CREATE TRIGGER nazorat_truncate AFTER TRUNCATE ON public.xodimlar FOR EACH STATEMENT EXECUTE FUNCTION nazorat.yoz_truncate();
CREATE TRIGGER taqiq_delete BEFORE DELETE ON public.xodimlar FOR EACH ROW EXECUTE FUNCTION nazorat.taqiq();

-- Kafolat: yozuvdagi tabel xodimlar da boʻlmasa — qoʻshiladi; boʻsh matn ('') — NULL ga aylanadi.
-- TG_ARGV — tekshiriladigan ustunlar.
CREATE FUNCTION nazorat.xodim_kafolat() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE c text; v text; j jsonb := to_jsonb(NEW); bosh jsonb := '{}';
BEGIN
    FOREACH c IN ARRAY TG_ARGV LOOP
        v := j ->> c;
        IF v IS NULL THEN CONTINUE; END IF;
        IF btrim(v) = '' THEN
            bosh := bosh || jsonb_build_object(c, NULL);
            CONTINUE;
        END IF;
        INSERT INTO public.xodimlar (tabel, shtatda, manba) VALUES (v, false, 'avto:' || TG_TABLE_NAME) ON CONFLICT (tabel) DO NOTHING;
    END LOOP;
    IF bosh <> '{}' THEN
        NEW := jsonb_populate_record(NEW, bosh);
    END IF;
    RETURN NEW;
END $$;

-- kir_seed kaliti «tabel» yoki «tabel#raqam» — bogʻlanish uchun alohida ustun
ALTER TABLE public.kir_seed ADD COLUMN xodim text GENERATED ALWAYS AS (split_part(tabel, '#', 1)) STORED;

-- Mavjud maʼlumotdagi barcha tabellar oldindan qoʻshiladi (bogʻlanish darhol tekshirilgan holatda boʻlsin)
DO $$
DECLARE f record; n bigint;
BEGIN
    FOR f IN SELECT * FROM (VALUES
        ('users', 'tabel'), ('hr_pd', 'tabel'), ('hr_pd', 'by_tabel'), ('oklad', 'tabel'), ('oklad', 'by_tabel'),
        ('kiy_person', 'tabel'), ('kiy_person', 'by_tabel'), ('kiy_issue', 'tabel'), ('kiy_issue', 'by_tabel'), ('kiy_issue', 'cancel_by'),
        ('my_rel', 'boss'), ('my_rel', 'tabel'), ('my_rel', 'by_tabel'), ('my_rel', 'cancel_by'), ('kir_alt', 'tabel'), ('kir_seed', 'xodim'),
        ('audit', 'tabel'), ('sign_docs', 'created_by'), ('vt_act', 'a'), ('vt_act', 'b'), ('vt_act', 'created_by'),
        ('records', 'updated_by'), ('history', 'updated_by')
    ) v(t, c) LOOP
        -- boʻsh matn → NULL (faqat NULL boʻlishi mumkin boʻlgan ustunlarda; history oʻzgartirilmaydi — unda boʻsh qiymat qolsa, bogʻlanish NOT VALID qoladi)
        IF f.t NOT IN ('history', 'kir_seed') AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = f.t AND column_name = f.c AND is_nullable = 'YES') THEN
            EXECUTE format('UPDATE public.%I SET %I = NULL WHERE btrim(%I) = %L', f.t, f.c, f.c, '') ;
        END IF;
        EXECUTE format('INSERT INTO public.xodimlar (tabel, shtatda, manba) SELECT DISTINCT %I, false, %L FROM public.%I WHERE %I IS NOT NULL AND btrim(%I) <> %L ON CONFLICT (tabel) DO NOTHING',
                       f.c, 'avto:' || f.t, f.t, f.c, f.c, '');
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.xodimlar (tabel) ON UPDATE NO ACTION ON DELETE RESTRICT NOT VALID',
                       f.t, f.t || '_' || f.c || '_xodim_fk', f.c);
        BEGIN
            EXECUTE format('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', f.t, f.t || '_' || f.c || '_xodim_fk');
        EXCEPTION WHEN foreign_key_violation THEN
            RAISE NOTICE 'Bogʻlanish %.% — eski boʻsh qiymatlar bor, NOT VALID holatda qoldi', f.t, f.c;
        END;
        IF f.t <> 'kir_seed' THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE OF %I ON public.%I FOR EACH ROW EXECUTE FUNCTION nazorat.xodim_kafolat(%L)',
                           'xodim_' || f.c, f.c, f.t, f.c);
        END IF;
    END LOOP;
END $$;
-- kir_seed: kafolat «xodim» (hisoblanadigan) ustuni boʻyicha emas, tabel boʻyicha
CREATE FUNCTION nazorat.kir_seed_kafolat() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.xodimlar (tabel, shtatda, manba) VALUES (split_part(NEW.tabel, '#', 1), false, 'avto:kir_seed') ON CONFLICT (tabel) DO NOTHING;
    RETURN NEW;
END $$;
CREATE TRIGGER xodim_tabel BEFORE INSERT OR UPDATE OF tabel ON public.kir_seed FOR EACH ROW EXECUTE FUNCTION nazorat.kir_seed_kafolat();

-- indekslar (bogʻlangan ustunlar boʻyicha qidiruv va RESTRICT tekshiruvi tez boʻlsin)
CREATE INDEX IF NOT EXISTS hr_pd_by ON public.hr_pd (by_tabel);
CREATE INDEX IF NOT EXISTS oklad_by ON public.oklad (by_tabel);
CREATE INDEX IF NOT EXISTS kiy_person_by ON public.kiy_person (by_tabel);
CREATE INDEX IF NOT EXISTS kiy_issue_by ON public.kiy_issue (by_tabel);
CREATE INDEX IF NOT EXISTS my_rel_by ON public.my_rel (by_tabel);
CREATE INDEX IF NOT EXISTS kir_seed_xodim ON public.kir_seed (xodim);
CREATE INDEX IF NOT EXISTS vt_act_a ON public.vt_act (a);
CREATE INDEX IF NOT EXISTS vt_act_b ON public.vt_act (b);
CREATE INDEX IF NOT EXISTS records_updated_by ON public.records (updated_by);
CREATE INDEX IF NOT EXISTS history_updated_by ON public.history (updated_by);

-- auditor uchun: shtat (oylik va shaxsiy maʼlumotsiz)
CREATE VIEW oqish.xodimlar WITH (security_barrier) AS
    SELECT tabel, fio, lavozim, bolinma, uchastka, itr, shtatda, manba, yangilandi FROM public.xodimlar;
DO $$ BEGIN
    GRANT SELECT ON oqish.xodimlar TO agmk_oqish;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
