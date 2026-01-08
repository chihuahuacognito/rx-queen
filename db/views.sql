-- View: distinct_daily_snapshots
-- Gets the latest snapshot per game per day to handle multiple scrapes
CREATE OR REPLACE VIEW distinct_daily_snapshots AS
SELECT 
    DISTINCT ON (game_id, date_trunc('day', captured_at)) 
    id,
    game_id,
    rank_free,
    rank_paid,
    rank_grossing,
    captured_at
FROM snapshots
ORDER BY game_id, date_trunc('day', captured_at), captured_at DESC;

-- View: daily_trends
-- Compares 'Today' vs 'Yesterday' ranks
DROP VIEW IF EXISTS daily_trends;
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
    
    -- Current Ranks
    t.rank_free as current_rank_free,
    t.rank_grossing as current_rank_grossing,
    
    -- Rank Changes (Previous - Current). Positive means rank went UP (e.g. 50 -> 10 = +40)
    (y.rank_free - t.rank_free) as rank_change_free,
    (y.rank_grossing - t.rank_grossing) as rank_change_grossing,
    
    t.captured_at as last_updated
FROM today t
JOIN games g ON t.game_id = g.id
LEFT JOIN yesterday y ON t.game_id = y.game_id
WHERE t.rank_free IS NOT NULL OR t.rank_grossing IS NOT NULL;
