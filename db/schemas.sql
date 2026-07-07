DROP TABLE IF EXISTS clicks CASCADE;

DROP TABLE IF EXISTS links CASCADE;

CREATE TABLE
    links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(32) UNIQUE NOT NULL,
        target_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        expires_at TIMESTAMPTZ,
        click_count INTEGER NOT NULL DEFAULT 0 CHECK (click_count >= 0)
    );

CREATE TABLE
    clicks (
        id SERIAL PRIMARY KEY,
        link_id INTEGER NOT NULL REFERENCES links (id) ON DELETE CASCADE,
        clicked_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        referrer TEXT,
        user_agent TEXT
    );

CREATE INDEX idx_links_code ON links (code);

CREATE INDEX idx_clicks_link_time ON clicks (link_id, clicked_at DESC);

CREATE INDEX idx_links_expiry ON links (expires_at);