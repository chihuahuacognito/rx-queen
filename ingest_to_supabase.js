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
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,  // 10s to connect
    statement_timeout: 60000         // 60s max per query
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

            // 2. Upsert Snapshots (a game can appear in multiple charts: FREE, PAID, GROSSING)
            let snapshotsUpserted = 0;

            for (const game of data) {
                // Determine store_id (use appId field from scraper)
                let storeId = game.appId || game.id;
                if (!storeId && game.url) {
                    const match = game.url.match(/id=([^&]+)/);
                    if (match) storeId = match[1];
                }
                if (!storeId) continue;

                const gameId = gameIds[storeId];
                if (!gameId) continue;

                const country = game.country || 'US';
                const capturedAt = new Date().toISOString();

                // Determine which rank field to set based on collection type
                const rankFree = game.collection === 'TOP_FREE' ? game.rank : null;
                const rankPaid = game.collection === 'TOP_PAID' ? game.rank : null;
                const rankGrossing = game.collection === 'TOP_GROSSING' ? game.rank : null;

                // UPSERT: Insert new snapshot OR update existing one with the new rank field
                // Uses unique index: idx_snapshots_game_country_day_unique
                await client.query(`
                    INSERT INTO snapshots (
                        game_id, country_code, rank_free, rank_paid, rank_grossing, 
                        rating, reviews_count, revenue_estimate, downloads_estimate, captured_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (game_id, country_code, (date_trunc('day', captured_at AT TIME ZONE 'UTC')))
                    DO UPDATE SET
                        rank_free = COALESCE(snapshots.rank_free, EXCLUDED.rank_free),
                        rank_paid = COALESCE(snapshots.rank_paid, EXCLUDED.rank_paid),
                        rank_grossing = COALESCE(snapshots.rank_grossing, EXCLUDED.rank_grossing),
                        rating = COALESCE(EXCLUDED.rating, snapshots.rating)
                `, [
                    gameId, country,
                    rankFree, rankPaid, rankGrossing,
                    parseFloat(game.scoreText) || 0,
                    0, 0, 0, capturedAt
                ]);
                snapshotsUpserted++;
            }
            console.log(`   ✅ Snapshots upserted: ${snapshotsUpserted}`);
        }

        // Refresh Trends Cache (New Table Strategy)
        console.log('\n🔄 Refreshing Daily Trends Cache (Incremental)...');
        try {
            const { spawn } = require('child_process');
            const path = require('path');

            // Spawn internal script to handle refresh without timeouts
            const scriptPath = path.join(__dirname, 'scripts', 'refresh_trends_table.js');

            await new Promise((resolve, reject) => {
                const child = spawn('node', [scriptPath], {
                    stdio: 'inherit',
                    env: process.env
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        console.log('   ✅ Cache refresh successful');
                        resolve();
                    } else {
                        console.error(`   ❌ Cache refresh failed with code ${code}`);
                        resolve(); // Don't block ingestion
                    }
                });
            });

        } catch (refreshError) {
            console.log('   ⚠️ Refresh script error:', refreshError.message);
        }

    } catch (e) {
        console.error('❌ Error ingestion:', e);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
        console.log('\n🎉 Ingestion Complete!');
    }
}

ingestLatestFiles();
