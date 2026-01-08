-- Sprint 3 Migration
-- Goal: Add support for tracking game updates and version history
-- to correlate "Rank Changes" with "Game Updates" (LiveOps Intelligence).

-- 1. Add "Last Updated" timestamp (When the developer released the update)
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE;

-- 2. Add "Current Version" string (e.g., "1.2.4")
ALTER TABLE games ADD COLUMN IF NOT EXISTS current_version VARCHAR(100);

-- 3. Add "Recent Changes" text (The "What's New" blurb)
ALTER TABLE games ADD COLUMN IF NOT EXISTS recent_changes TEXT;

-- 4. Create an index on last_updated for faster queries on "Fresh Games"
CREATE INDEX IF NOT EXISTS idx_games_last_updated ON games(last_updated DESC);
