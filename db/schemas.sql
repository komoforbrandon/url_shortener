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

