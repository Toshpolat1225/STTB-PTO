-- 3.18: «Mening hodimlarim» va maxsus kiyim.

-- Kadrlar (1C) dan import qilinadigan shaxsiy maʼlumotlar — faqat serverda, rolga qarab beriladi (APK ga tushmaydi)
CREATE TABLE IF NOT EXISTS hr_pd (
    tabel     text PRIMARY KEY,
    birth     date,
    phone     text,
    address   text,
    tatil     smallint CHECK (tatil BETWEEN 1 AND 12),   -- mehnat taʼtiliga chiqish oyi
    razryad   smallint,
    src       text,                                       -- qaysi fayldan
    at        timestamptz NOT NULL DEFAULT now(),
    by_tabel  text
);

-- Qoʻlda biriktirish / olib tashlash (komandirovka, prikaz bilan bir necha oyga). Muddat tugasa — oʻzi kuchini yoʻqotadi.
CREATE TABLE IF NOT EXISTS my_rel (
    id         bigserial PRIMARY KEY,
    boss       text NOT NULL,
    tabel      text NOT NULL,
    op         text NOT NULL CHECK (op IN ('add', 'del')),
    why        text NOT NULL,
    dfrom      date NOT NULL,
    dto        date,
    by_tabel   text NOT NULL,
    at         timestamptz NOT NULL DEFAULT now(),
    cancelled  timestamptz,
    cancel_by  text
);
CREATE INDEX IF NOT EXISTS my_rel_boss ON my_rel (boss);
CREATE INDEX IF NOT EXISTS my_rel_tabel ON my_rel (tabel);

-- Maxsus kiyim: berilganlar tarixi (ombor kiritadi, xodim «Oldim» deb tasdiqlaydi)
CREATE TABLE IF NOT EXISTS kiy_issue (
    id         bigserial PRIMARY KEY,
    tabel      text NOT NULL,
    item       text NOT NULL,
    qty        smallint NOT NULL DEFAULT 1 CHECK (qty BETWEEN 1 AND 20),
    size       text,
    issued     date NOT NULL,
    note       text,
    by_tabel   text NOT NULL,
    at         timestamptz NOT NULL DEFAULT now(),
    ack_at     timestamptz,
    cancelled  timestamptz,
    cancel_by  text,
    cancel_why text
);
CREATE INDEX IF NOT EXISTS kiy_issue_tabel ON kiy_issue (tabel, item);

-- Oʻlchamlar va normaning xodimga xos sozlamasi (guruhni almashtirish, qoʻshimcha shartlar)
CREATE TABLE IF NOT EXISTS kiy_person (
    tabel     text PRIMARY KEY,
    boy       text,
    kiyim     text,
    poyabzal  text,
    bosh      text,
    grp       text,
    shart     json,
    at        timestamptz NOT NULL DEFAULT now(),
    by_tabel  text
);
