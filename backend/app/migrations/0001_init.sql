-- AGMK-STTB PTO — boshlangʻich sxema (eski SQLite bazasi bilan bir xil mazmun, PostgreSQL turlari bilan)
-- Eslatma: records.data va history.data — json (jsonb emas): ilova yuborgan kalitlar tartibi aynan saqlanadi.

CREATE TABLE users (
    tabel        text PRIMARY KEY,
    name         text,
    lavozim      text,
    salt         text NOT NULL,
    hash         text NOT NULL,
    role         text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked', 'reset')),
    created_at   timestamptz NOT NULL DEFAULT now(),
    last_login   timestamptz,
    device       text,
    demo         boolean NOT NULL DEFAULT false,
    must_change  boolean NOT NULL DEFAULT false,
    sig          text,          -- imzo rasmi, AES-256-GCM bilan shifrlangan («e1:…»)
    sigpin       text           -- imzo kodi xeshi: {"s": tuz, "h": xesh}
);

-- Ilova yozuvlari (sinxronlash). updated_at — mikrosoniya aniqligidagi, doim oʻsuvchi ISO matn:
-- ilova «updated_at > oxirgi koʻrgani» bilan soʻraydi, shuning uchun matn koʻrinishi aynan saqlanadi.
CREATE TABLE records (
    id          text PRIMARY KEY,
    kind        text NOT NULL,
    data        json NOT NULL,
    deleted     boolean NOT NULL DEFAULT false,
    updated_at  text NOT NULL,
    updated_by  text
);
CREATE INDEX records_upd ON records (updated_at);

CREATE TABLE history (
    seq         bigserial PRIMARY KEY,
    id          text NOT NULL,
    kind        text,
    data        json,
    deleted     boolean,
    updated_at  text,
    updated_by  text
);
CREATE INDEX history_id ON history (id);

CREATE TABLE messages (
    id          bigserial PRIMARY KEY,
    from_tabel  text NOT NULL,
    from_name   text,
    to_tabel    text NOT NULL,
    text        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    files       json
);
CREATE INDEX messages_to ON messages (to_tabel, id);

-- Xabar va boʻlim fayllari (mazmuni AES-256-GCM bilan shifrlangan)
CREATE TABLE files (
    id          text PRIMARY KEY,
    owner       text NOT NULL,
    to_tabel    text NOT NULL,
    name        text,
    mime        text,
    size        integer,
    data        bytea NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX files_to ON files (to_tabel);

CREATE TABLE refresh (
    token    text PRIMARY KEY,
    tabel    text NOT NULL,
    expires  bigint NOT NULL       -- millisoniya (Unix)
);
CREATE INDEX refresh_tabel ON refresh (tabel);

-- Ichki elektron imzolash
CREATE TABLE sign_docs (
    id          text PRIMARY KEY,
    title       text,
    html        text NOT NULL,
    hash        text NOT NULL,
    created_by  text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'cancelled')),
    signers     json NOT NULL,
    done_at     timestamptz,
    demo        boolean NOT NULL DEFAULT false,
    meta        json
);
CREATE INDEX sign_docs_created ON sign_docs (created_at DESC);

CREATE TABLE sign_acts (
    id      bigserial PRIMARY KEY,
    doc_id  text NOT NULL,
    tabel   text NOT NULL,
    action  text NOT NULL CHECK (action IN ('sign', 'reject')),
    reason  text,
    png     text,
    hash    text,
    at      timestamptz NOT NULL DEFAULT now(),
    device  text
);
CREATE INDEX sign_acts_doc ON sign_acts (doc_id);

-- Vaqtincha tayinlash (xizmat xati toʻliq imzolangach kuchga kiradi)
CREATE TABLE vt_act (
    doc_id      text PRIMARY KEY,
    a           text NOT NULL,
    b           text NOT NULL,
    dfrom       date NOT NULL,
    dto         date NOT NULL,
    why         text,
    created_by  text,
    done_at     timestamptz,
    cancelled   timestamptz
);

-- Bosib oʻtilgan yoʻl (smena davomida), kun boʻyicha; AGMK_TRK_DAYS kundan keyin oʻchiriladi
CREATE TABLE trk (
    tabel  text NOT NULL,
    uid    text NOT NULL,
    day    date NOT NULL,
    unit   text,
    pts    json NOT NULL,
    upd    bigint NOT NULL,
    PRIMARY KEY (tabel, uid, day)
);

CREATE TABLE audit (
    seq     bigserial PRIMARY KEY,
    at      timestamptz NOT NULL DEFAULT now(),
    tabel   text,
    action  text NOT NULL,
    detail  text,
    ip      text
);
CREATE INDEX audit_tabel ON audit (tabel, seq);

-- Boshlangʻich parollar (paketlar/kirish_kodlari.json) qoʻllangani belgisi
CREATE TABLE kir_seed (
    tabel  text PRIMARY KEY,
    ch     text NOT NULL,
    at     timestamptz
);
-- Bitta tabeldagi qoʻshimcha kirishlar (bir lavozimda bir necha kishi)
CREATE TABLE kir_alt (
    tabel  text NOT NULL,
    i      integer NOT NULL,
    name   text,
    salt   text NOT NULL,
    hash   text NOT NULL,
    PRIMARY KEY (tabel, i)
);

-- Ilovada (iqtisodchi / administrator) oʻzgartirilgan oklad va razryad — xodimlar.json qayta yuklansa ham saqlanadi
CREATE TABLE oklad (
    tabel    text PRIMARY KEY,
    oklad    bigint,
    razryad  integer,
    at       timestamptz NOT NULL DEFAULT now(),
    by_tabel text
);

-- Server sozlamalari (tashqi manzil va h.k.)
CREATE TABLE settings (
    key    text PRIMARY KEY,
    value  json NOT NULL,
    at     timestamptz NOT NULL DEFAULT now()
);
