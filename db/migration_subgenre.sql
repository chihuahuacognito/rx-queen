-- Add subgenre column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS subgenre VARCHAR(100);

-- Add index for performance on filtering by subgenre
CREATE INDEX IF NOT EXISTS idx_games_subgenre ON games(subgenre);
