-- 5.5: SVO — davomat (turniket kirish-chiqishi), smena grafiklari, sabablar.
-- Kirish-chiqish vaqtlari — xodimning shaxsiy maʼlumoti: faqat serverda, faqat ruxsati borlarga (SVO, rahbariyat, administrator;
-- sex / boʻlim boshligʻi — faqat oʻziga boʻysunuvchilar). Ilovaga (APK) yozilmaydi.

-- Turniket hodisalari (PERCo eksporti yoki keyinchalik toʻgʻridan-toʻgʻri ulanish). Vaqt — mahalliy (Toshkent), zonasiz.
CREATE TABLE IF NOT EXISTS dav_event (
    id        bigserial PRIMARY KEY,
    tabel     text NOT NULL,
    at        timestamp NOT NULL,
    dir       smallint NOT NULL DEFAULT 0 CHECK (dir IN (-1, 0, 1)),   -- 1 kirdi, -1 chiqdi, 0 nomaʼlum
    obj       text NOT NULL DEFAULT '',                                 -- turniket / obyekt nomi
    src       text,
    by_tabel  text,
    imported  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tabel, at, dir, obj)
);
CREATE INDEX IF NOT EXISTS dav_event_at ON dav_event (at);
CREATE INDEX IF NOT EXISTS dav_event_tabel ON dav_event (tabel, at);

-- Qoʻshimcha (oʻzimiz tuzgan) grafiklar. Tayyorlari kodda: itr52, w52, dnvv, nnvv, ddvv.
CREATE TABLE IF NOT EXISTS dav_pattern (
    id        text PRIMARY KEY,
    name      text NOT NULL,
    cycle     json NOT NULL,          -- ["D","N","V","V"] — kodlar: D, N, I, W, V
    by_tabel  text,
    at        timestamptz NOT NULL DEFAULT now(),
    deleted   boolean NOT NULL DEFAULT false
);

-- Xodimni grafikka biriktirish: sikl «anchor» kunidan boshlanadi; dfrom..dto oraligʻida amal qiladi.
CREATE TABLE IF NOT EXISTS dav_assign (
    id         bigserial PRIMARY KEY,
    tabel      text NOT NULL,
    pattern    text NOT NULL,
    anchor     date NOT NULL,
    dfrom      date NOT NULL,
    dto        date,
    by_tabel   text NOT NULL,
    at         timestamptz NOT NULL DEFAULT now(),
    cancelled  timestamptz
);
CREATE INDEX IF NOT EXISTS dav_assign_tabel ON dav_assign (tabel, dfrom);

-- Sabablar: balnichniy, taʼtil, komandirovka, oʻqish, dam olish, boshqa — butun muddati bilan bir marta.
CREATE TABLE IF NOT EXISTS dav_reason (
    id         bigserial PRIMARY KEY,
    tabel      text NOT NULL,
    kind       text NOT NULL,
    dfrom      date NOT NULL,
    dto        date NOT NULL,
    note       text,
    by_tabel   text NOT NULL,
    at         timestamptz NOT NULL DEFAULT now(),
    cancelled  timestamptz
);
CREATE INDEX IF NOT EXISTS dav_reason_tabel ON dav_reason (tabel, dfrom, dto);

-- Nazorat jurnali: grafik, sabab va biriktirish oʻzgarishlari toʻliq; turniket hodisalari — faqat oʻchirilganda (koʻp qator).
DO $$
BEGIN
    IF to_regprocedure('nazorat.yoz()') IS NOT NULL OR EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'nazorat' AND p.proname = 'yoz') THEN
        CREATE TRIGGER nazorat AFTER INSERT OR UPDATE OR DELETE ON public.dav_assign FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('toliq', '');
        CREATE TRIGGER nazorat AFTER INSERT OR UPDATE OR DELETE ON public.dav_reason FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('toliq', '');
        CREATE TRIGGER nazorat AFTER INSERT OR UPDATE OR DELETE ON public.dav_pattern FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('toliq', '');
        CREATE TRIGGER nazorat AFTER DELETE ON public.dav_event FOR EACH ROW EXECUTE FUNCTION nazorat.yoz('yashirin', '');
    END IF;
END $$;
