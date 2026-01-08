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

-- View: power_rankings
CREATE OR REPLACE VIEW power_rankings AS
SELECT 
    *,
    -- Power Score Calculation
    ROUND(
        (
            (201 - current_rank_free) / 2.0 * 0.7  -- Dominance Component (70%)
        ) + (
            -- Momentum Component (30%)
            -- Formula: (X + 20) * 2.5
            LEAST(GREATEST(COALESCE(rank_change_free, 0), -20), 20) + 20
        ) * 2.5 * 0.3
    , 1) as power_score
FROM daily_trends
WHERE current_rank_free IS NOT NULL;
