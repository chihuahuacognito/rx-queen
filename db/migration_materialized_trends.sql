-- Sprint 3.2.QA: Materialized View Migration
-- Purpose: Convert daily_trends to a Materialized View for performance
-- Date: January 9, 2026

-- Step 1: Drop existing view (CASCADE drops dependent views like genre_stats, power_rankings)
DROP VIEW IF EXISTS daily_trends CASCADE;
DROP MATERIALIZED VIEW IF EXISTS daily_trends CASCADE;

-- Step 2: Create Materialized View (same logic, but cached)
CREATE MATERIALIZED VIEW daily_trends AS
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

-- Step 3: Create unique index (REQUIRED for CONCURRENTLY refresh)
CREATE UNIQUE INDEX idx_daily_trends_pk ON daily_trends (game_id, country_code);

-- Step 4: Create additional indices for query performance
CREATE INDEX idx_daily_trends_country ON daily_trends (country_code);
CREATE INDEX idx_daily_trends_rank ON daily_trends (current_rank_free);

-- Step 5: Initial data population (will take time on first run)
-- Note: REFRESH is implicit on CREATE, so data is already populated

-- Step 6: Recreate dependent views (Sprint 3.1 Pulse Views)
-- These were dropped by CASCADE

CREATE OR REPLACE VIEW genre_stats AS
SELECT 
    genre,
    COUNT(*) as game_count,
    ROUND(AVG(current_rank_free), 1) as avg_rank,
    ROUND(AVG(rank_change_free), 1) as avg_velocity,
    -- Calculate "Heat" (Weighted Velocity)
    (AVG(rank_change_free) * LOG(COUNT(*) + 1)) as heat_score,
    MAX(last_updated) as last_updated
FROM daily_trends
WHERE country_code = 'US' 
AND current_rank_free IS NOT NULL
AND genre IS NOT NULL
GROUP BY genre
HAVING COUNT(*) >= 3 
ORDER BY heat_score DESC;

CREATE OR REPLACE VIEW power_rankings AS
SELECT 
    *,
    -- Power Score Calculation
    ROUND(
        (
            (201 - current_rank_free) / 2.0 * 0.7  -- Dominance Component (70%)
        ) + (
            -- Momentum Component (30%)
            LEAST(GREATEST(COALESCE(rank_change_free, 0), -20), 20) + 20
        ) * 2.5 * 0.3
    , 1) as power_score
FROM daily_trends
WHERE current_rank_free IS NOT NULL;

-- Verification query (run this to confirm)
-- SELECT COUNT(*) FROM daily_trends;
