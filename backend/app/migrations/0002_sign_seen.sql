-- 3.17.0: hujjatni imzolovchi birinchi marta ochgan vaqt («✓✓ Tanishdi»)
CREATE TABLE IF NOT EXISTS sign_seen (
    doc_id  text NOT NULL,
    tabel   text NOT NULL,
    at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (doc_id, tabel)
);
