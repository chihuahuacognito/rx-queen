-- FIX: Per-Country "Latest Date" Logic
-- Calculating MAX(date) globally hides countries that haven't updated yet.
-- We must determine the "Current Day" for EACH country individually.

DROP VIEW IF EXISTS daily_trends;
DROP VIEW IF EXISTS distinct_daily_snapshots;

-- 1. Base View: Deduplicate per Logical Day (UTC)
CREATE OR REPLACE VIEW distinct_daily_snapshots AS
WITH ranked_snaps AS (
    SELECT 
        id,
        game_id,
        country_code,
        rank_free,
        rank_paid,
        rank_grossing,
        captured_at,
        -- Logical Day in UTC
        date_trunc('day', captured_at AT TIME ZONE 'UTC') as day_bucket,
        ROW_NUMBER() OVER (
            PARTITION BY game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC') 
            ORDER BY captured_at DESC
        ) as rn
    FROM snapshots
)
SELECT id, game_id, country_code, rank_free, rank_paid, rank_grossing, captured_at, day_bucket
FROM ranked_snaps 
WHERE rn = 1;

-- 2. Daily Trends View (Per-Country Latest vs Previous)
CREATE OR REPLACE VIEW daily_trends AS
WITH country_stats AS (
    -- Find the LATEST snapshot date for EACH country
    SELECT country_code, MAX(day_bucket) as latest_day 
    FROM distinct_daily_snapshots
    GROUP BY country_code
),
today AS (
    SELECT s.* 
    FROM distinct_daily_snapshots s
    JOIN country_stats cs ON s.country_code = cs.country_code 
    AND s.day_bucket = cs.latest_day
),
yesterday AS (
    SELECT s.* 
    FROM distinct_daily_snapshots s
    JOIN country_stats cs ON s.country_code = cs.country_code 
    AND s.day_bucket = cs.latest_day - INTERVAL '1 day'
),
chart_days AS (
    SELECT 
        s.game_id, 
        s.country_code,
        COUNT(DISTINCT date_trunc('day', s.captured_at AT TIME ZONE 'UTC')) as days_count
    FROM snapshots s
    GROUP BY s.game_id, s.country_code
)
SELECT 
    t.game_id,
    g.name,
    g.store_id,
    g.genre,
    g.publisher,
    g.icon_url,
    t.country_code,
    
    t.rank_free as current_rank_free,
    t.rank_grossing as current_rank_grossing,
    
    (y.rank_free - t.rank_free) as rank_change_free,
    (y.rank_grossing - t.rank_grossing) as rank_change_grossing,
    
    d.days_count as days_on_chart,
    (y.game_id IS NULL) as is_new_entry,
    
    t.captured_at as last_updated
FROM today t
JOIN games g ON t.game_id = g.id
LEFT JOIN yesterday y ON t.game_id = y.game_id AND t.country_code = y.country_code
LEFT JOIN chart_days d ON t.game_id = d.game_id AND t.country_code = d.country_code
WHERE t.rank_free IS NOT NULL OR t.rank_grossing IS NOT NULL;
