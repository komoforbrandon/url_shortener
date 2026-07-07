-- ==========================================
-- LINKS
-- ==========================================
INSERT INTO
    links (
        code,
        target_url,
        created_at,
        expires_at,
        click_count
    )
VALUES
    (
        'google',
        'https://www.google.com',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        NULL,
        5
    ),
    (
        'github',
        'https://github.com',
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        NULL,
        3
    ),
    (
        'chatgpt',
        'https://chat.openai.com',
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        NULL,
        8
    ),
    (
        'postgres',
        'https://www.postgresql.org',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        NULL,
        2
    ),
    (
        'expired',
        'https://example.com',
        CURRENT_TIMESTAMP - INTERVAL '30 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        0
    );

-- ==========================================
-- CLICKS
-- ==========================================
INSERT INTO
    clicks (link_id, clicked_at, referrer, user_agent)
VALUES
    (
        1,
        CURRENT_TIMESTAMP - INTERVAL '9 days',
        'https://facebook.com',
        'Chrome'
    ),
    (
        1,
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        'https://twitter.com',
        'Firefox'
    ),
    (
        1,
        CURRENT_TIMESTAMP - INTERVAL '7 days',
        NULL,
        'Safari'
    ),
    (
        1,
        CURRENT_TIMESTAMP - INTERVAL '6 days',
        'https://linkedin.com',
        'Edge'
    ),
    (
        1,
        CURRENT_TIMESTAMP - INTERVAL '5 days',
        'https://google.com',
        'Chrome'
    ),
    (
        2,
        CURRENT_TIMESTAMP - INTERVAL '4 days',
        'https://google.com',
        'Chrome'
    ),
    (
        2,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        'https://reddit.com',
        'Firefox'
    ),
    (
        2,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        NULL,
        'Safari'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '24 hours',
        'https://google.com',
        'Chrome'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '12 hours',
        'https://bing.com',
        'Edge'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '8 hours',
        'https://facebook.com',
        'Chrome'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '4 hours',
        'https://reddit.com',
        'Firefox'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '2 hours',
        NULL,
        'Safari'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '30 minutes',
        'https://google.com',
        'Chrome'
    ),
    (
        3,
        CURRENT_TIMESTAMP - INTERVAL '5 minutes',
        'https://twitter.com',
        'Edge'
    ),
    (
        4,
        CURRENT_TIMESTAMP - INTERVAL '20 hours',
        'https://google.com',
        'Chrome'
    ),
    (
        4,
        CURRENT_TIMESTAMP - INTERVAL '6 hours',
        NULL,
        'Firefox'
    );