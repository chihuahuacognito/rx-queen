-- Performance Indices for Reporting Views

-- 1. Index for identifying latest snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_country_date 
ON snapshots (country_code, captured_at DESC);

-- 2. Index for joining games
CREATE INDEX IF NOT EXISTS idx_snapshots_game_id 
ON snapshots (game_id);

-- 3. Composite for specific lookups
CREATE INDEX IF NOT EXISTS idx_snapshots_composite_lookup
ON snapshots (game_id, country_code, captured_at DESC);

-- Analyze to update query planner statistics
ANALYZE snapshots;
