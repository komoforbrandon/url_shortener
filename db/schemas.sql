DROP TABLE IF EXISTS clicks CASCADE;

DROP TABLE IF EXISTS links CASCADE;

CREATE TABLE
    IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(16) NOT NULL UNIQUE,
        target_url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOT NULL DEFAULT now (),
        expires_at TIMESTAMPTZ,
        click_count INT NOT NULL DEFAULT 0 CHECK (click_count >= 0)
    );

CREATE TABLE
    IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        link_id INTEGER NOT NULL REFERENCES links (id) ON DELETE CASCADE,
        clicked_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        refferer TEXT,
        user_agent TEXT
    );

CREATE INDEX IF NOT EXISTS idx_links_code ON links (code);

CREATE INDEX IF NOT EXISTS idx_clicks_link_time ON clicks (link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_links_expiry ON links (expires_at);