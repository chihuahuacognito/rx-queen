/**
 * Ingest Scraped Data to Supabase
 * 
 * Usage: node ingest_to_supabase.js
 * Requires: SUPABASE_URL env var
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Use existing connection string or env var
const connectionString = process.env.SUPABASE_URL;

if (!connectionString) {
    console.error('❌ SUPABASE_URL environment variable is missing.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const DATA_DIR = path.join(__dirname, 'data');

async function ingestLatestFiles() {
    console.log('🚀 Starting Supabase Ingestion...');

    // Find all scrape result JSONs
    const files = fs.readdirSync(DATA_DIR)
        .filter(f => f.startsWith('scrape_result_') && f.endsWith('.json'))
        .sort()
        .reverse(); // Newest first

    // Limit to recent files (e.g., last 5) to avoid re-ingesting everything
    const recentFiles = files.slice(0, 5);

    if (recentFiles.length === 0) {
        console.log('No data files found.');
        return;
    }

    console.log(`Found ${recentFiles.length} recent files to check.`);

    const client = await pool.connect();

    try {
        for (const file of recentFiles) {
            console.log(`\n📄 Processing: ${file}`);
            const filePath = path.join(DATA_DIR, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // 1. Upsert Games
            let gamesUpdated = 0;
            const gameIds = {}; // store_id -> db_id

            for (const game of data) {
                // Determine store_id (use appId field from scraper)
                let storeId = game.appId || game.id;
                if (!storeId && game.url) {
                    const match = game.url.match(/id=([^&]+)/);
                    if (match) storeId = match[1];
                }
                if (!storeId) {
                    console.warn(`Skipping game with no ID: ${game.title}`);
                    continue;
                }

                // Determine Subgenre (if any)
                // In a real scenario, we might want to fetch existing subgenre first to not overwrite it with null
                // For now, we only update static metadata

                const gameRes = await client.query(`
                    INSERT INTO games (store_id, name, publisher, genre, store_url, thumbnail_url, icon_url, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    ON CONFLICT (store_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        publisher = EXCLUDED.publisher,
                        genre = EXCLUDED.genre,
                        icon_url = EXCLUDED.icon_url,
                        updated_at = NOW()
                    RETURNING id
                `, [storeId, game.title, game.developer, game.genre, game.url, game.icon, game.icon]);

                gameIds[storeId] = gameRes.rows[0].id;
                gamesUpdated++;
            }
            console.log(`   ✅ Games processed: ${gamesUpdated}`);

            // 2. Insert Snapshots
            let snapshotsInserted = 0;
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            for (const game of data) {
                // Determine store_id (use appId field from scraper)
                let storeId = game.appId || game.id;
                if (!storeId && game.url) {
                    const match = game.url.match(/id=([^&]+)/);
                    if (match) storeId = match[1];
                }
                if (!storeId) continue;

                const gameId = gameIds[storeId];
                if (!gameId) continue; // Should not happen

                const country = game.country || 'US';
                const capturedAt = new Date().toISOString();

                // Estimates (Simple logic for now, similar to ingest_backfill.js)
                const revenue = 0; // Placeholder
                const downloads = 0; // Placeholder

                // Avoid duplicate snapshots for same day (idempotency)
                // We check if a snapshot exists for this game+country+today
                const exists = await client.query(`
                    SELECT id FROM snapshots 
                    WHERE game_id = $1 
                    AND country_code = $2 
                    AND date_trunc('day', captured_at AT TIME ZONE 'UTC') = date_trunc('day', $3::timestamp AT TIME ZONE 'UTC')
                `, [gameId, country, capturedAt]);

                if (exists.rows.length === 0) {
                    // Determine rank fields based on collection type
                    const rankFree = game.collection === 'TOP_FREE' ? game.rank : null;
                    const rankGrossing = game.collection === 'TOP_GROSSING' ? game.rank : null;

                    await client.query(`
                        INSERT INTO snapshots (
                            game_id, country_code, rank_grossing, rank_free, 
                            rating, reviews_count, revenue_estimate, downloads_estimate, captured_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    `, [
                        gameId, country,
                        rankGrossing,
                        rankFree,
                        parseFloat(game.scoreText) || 0,
                        0, // reviews count
                        revenue, downloads, capturedAt
                    ]);
                    snapshotsInserted++;
                }
            }
            console.log(`   ✅ Snapshots inserted: ${snapshotsInserted}`);
        }

        // Refresh Views (Optional but good)
        // await client.query('REFRESH MATERIALIZED VIEW ...'); 

    } catch (e) {
        console.error('❌ Error ingestion:', e);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

ingestLatestFiles();
