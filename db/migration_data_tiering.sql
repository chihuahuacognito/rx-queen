-- Sprint 3.1: Data Tiering Tables
-- Run this in Supabase SQL Editor

-- =====================================================
-- Table 1: Weekly Summaries (Warm Data - Forever)
-- =====================================================
-- Aggregated weekly stats for historical trend analysis

CREATE TABLE IF NOT EXISTS weekly_summaries (
    id SERIAL PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    country_code TEXT NOT NULL,
    week_start DATE NOT NULL,
    
    -- Free chart metrics
    avg_rank_free NUMERIC,
    best_rank_free INT,
    worst_rank_free INT,
    
    -- Grossing chart metrics
    avg_rank_grossing NUMERIC,
    best_rank_grossing INT,
    worst_rank_grossing INT,
    
    -- Engagement metrics
    days_on_chart INT DEFAULT 0,
    volatility_score NUMERIC,  -- Std deviation of rank changes
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT weekly_summaries_unique UNIQUE (game_id, country_code, week_start)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week 
    ON weekly_summaries(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_game 
    ON weekly_summaries(game_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_country_week 
    ON weekly_summaries(country_code, week_start DESC);


-- =====================================================
-- Table 2: Game Stats (Cold Data - Forever)
-- =====================================================
-- Lifetime aggregates per game

CREATE TABLE IF NOT EXISTS game_stats (
    game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
    
    -- Temporal tracking
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    
    -- All-time best ranks
    all_time_best_rank_free INT,
    all_time_best_rank_free_date DATE,
    all_time_best_rank_free_country TEXT,
    
    all_time_best_rank_grossing INT,
    all_time_best_rank_grossing_date DATE,
    all_time_best_rank_grossing_country TEXT,
    
    -- Cumulative metrics
    total_days_on_chart INT DEFAULT 0,
    total_weeks_tracked INT DEFAULT 0,
    total_countries_appeared INT DEFAULT 0,
    
    -- Peak performance
    peak_power_score NUMERIC,
    peak_power_score_date DATE,
    
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_game_stats_best_rank 
    ON game_stats(all_time_best_rank_free);


-- =====================================================
-- Function: Update Game Stats After Ingestion
-- =====================================================
-- Call this after each daily ingestion to update lifetime stats

CREATE OR REPLACE FUNCTION update_game_stats()
RETURNS void AS $$
BEGIN
    -- Insert or update game_stats for all games
    INSERT INTO game_stats (
        game_id,
        first_seen_at,
        last_seen_at,
        all_time_best_rank_free,
        all_time_best_rank_free_date,
        total_days_on_chart,
        updated_at
    )
    SELECT 
        g.id,
        MIN(s.captured_at),
        MAX(s.captured_at),
        MIN(s.rank_free),
        (SELECT captured_at::date FROM snapshots WHERE game_id = g.id AND rank_free = MIN(s.rank_free) LIMIT 1),
        COUNT(DISTINCT s.captured_at::date),
        NOW()
    FROM games g
    JOIN snapshots s ON g.id = s.game_id
    GROUP BY g.id
    ON CONFLICT (game_id) DO UPDATE SET
        last_seen_at = EXCLUDED.last_seen_at,
        all_time_best_rank_free = LEAST(game_stats.all_time_best_rank_free, EXCLUDED.all_time_best_rank_free),
        total_days_on_chart = EXCLUDED.total_days_on_chart,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- Function: Generate Weekly Summary
-- =====================================================
-- Call this weekly (Sunday night) to aggregate the past week

CREATE OR REPLACE FUNCTION generate_weekly_summary(target_week_start DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO weekly_summaries (
        game_id,
        country_code,
        week_start,
        avg_rank_free,
        best_rank_free,
        worst_rank_free,
        avg_rank_grossing,
        best_rank_grossing,
        worst_rank_grossing,
        days_on_chart,
        volatility_score
    )
    SELECT 
        game_id,
        country_code,
        target_week_start,
        AVG(rank_free),
        MIN(rank_free),
        MAX(rank_free),
        AVG(rank_grossing),
        MIN(rank_grossing),
        MAX(rank_grossing),
        COUNT(DISTINCT captured_at::date),
        STDDEV(rank_free)
    FROM snapshots
    WHERE captured_at >= target_week_start 
      AND captured_at < target_week_start + INTERVAL '7 days'
    GROUP BY game_id, country_code
    ON CONFLICT (game_id, country_code, week_start) DO UPDATE SET
        avg_rank_free = EXCLUDED.avg_rank_free,
        best_rank_free = EXCLUDED.best_rank_free,
        worst_rank_free = EXCLUDED.worst_rank_free,
        avg_rank_grossing = EXCLUDED.avg_rank_grossing,
        best_rank_grossing = EXCLUDED.best_rank_grossing,
        worst_rank_grossing = EXCLUDED.worst_rank_grossing,
        days_on_chart = EXCLUDED.days_on_chart,
        volatility_score = EXCLUDED.volatility_score;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these after creating tables to verify:

-- SELECT COUNT(*) FROM weekly_summaries;
-- SELECT COUNT(*) FROM game_stats;
-- SELECT * FROM game_stats ORDER BY all_time_best_rank_free LIMIT 10;
