-- Migration: Add country_code to snapshots
ALTER TABLE snapshots 
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT 'US';

-- Update the unique constraint or index if necessary
-- (Ideally we strictly index by game_id + country_code + time, but for now just adding the column is enough)
CREATE INDEX IF NOT EXISTS idx_snapshots_country ON snapshots(country_code);

-- Update the distinct_daily_snapshots VIEW to include country
DROP VIEW IF EXISTS daily_trends;
DROP VIEW IF EXISTS distinct_daily_snapshots;

CREATE OR REPLACE VIEW distinct_daily_snapshots AS
SELECT 
    DISTINCT ON (game_id, country_code, date_trunc('day', captured_at)) 
    id,
    game_id,
    country_code,
    rank_free,
    rank_paid,
    rank_grossing,
    captured_at
FROM snapshots
ORDER BY game_id, country_code, date_trunc('day', captured_at), captured_at DESC;

-- Re-create daily_trends with country support
CREATE OR REPLACE VIEW daily_trends AS
WITH today AS (
    SELECT * FROM distinct_daily_snapshots 
    WHERE captured_at >= NOW() - INTERVAL '24 hours'
),
yesterday AS (
    SELECT * FROM distinct_daily_snapshots 
    WHERE captured_at >= NOW() - INTERVAL '48 hours' 
    AND captured_at < NOW() - INTERVAL '24 hours'
)
SELECT 
    t.game_id,
    g.name,
    g.store_id,
    g.genre,
    g.icon_url,
    t.country_code,
    
    -- Current Ranks
    t.rank_free as current_rank_free,
    t.rank_grossing as current_rank_grossing,
    
    -- Rank Changes (Previous - Current)
    (y.rank_free - t.rank_free) as rank_change_free,
    (y.rank_grossing - t.rank_grossing) as rank_change_grossing,
    
    t.captured_at as last_updated
FROM today t
JOIN games g ON t.game_id = g.id
LEFT JOIN yesterday y ON t.game_id = y.game_id AND t.country_code = y.country_code
WHERE t.rank_free IS NOT NULL OR t.rank_grossing IS NOT NULL;
