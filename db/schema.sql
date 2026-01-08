-- Games Table: Stores static metadata
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    store_id TEXT NOT NULL UNIQUE, -- e.g., 'com.package.name' or '123456' (Steam AppID)
    name TEXT NOT NULL,
    publisher TEXT,
    genre TEXT,
    platform TEXT CHECK (platform IN ('android', 'ios', 'steam')),
    store_url TEXT,
    thumbnail_url TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Snapshots Table: Stores time-series data points
CREATE TABLE IF NOT EXISTS snapshots (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    
    -- Ranks
    rank_free INTEGER,
    rank_paid INTEGER,
    rank_grossing INTEGER,
    
    -- Calculated/Scraped Estimates (Premium Data)
    revenue_estimate NUMERIC(14, 2), 
    downloads_estimate INTEGER,
    
    -- Public Metrics
    rating NUMERIC(3, 2),
    reviews_count INTEGER,
    price NUMERIC(10, 2),
    
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast querying of history and trends
CREATE INDEX idx_snapshots_game_id ON snapshots(game_id);
CREATE INDEX idx_snapshots_captured_at ON snapshots(captured_at);
CREATE INDEX idx_games_store_id ON games(store_id);
