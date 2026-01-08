const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Setup DB connection
const connectionString = 'postgresql://postgres:admin123@localhost:5432/gaming_insights';
const pool = new Pool({ connectionString });

// Target files for missing dates (Jan 4th and 5th 2026 primarily)
// Timestamps for Jan 4th start approx 1767552000000
// We'll just look for all recent scraped files and ingest them safely (on conflict do nothing for snapshots to avoid dupes if any)
// Actually snapshots are unique by (game_id, country_code, captured_at). 
// Since captured_at varies by ms, we might insert dupes if we re-run.
// We should check if a snapshot for that game+country+date exists.

(async () => {
    try {
        console.log("🚀 Starting Historical Backfill...");

        const dataDir = path.join(__dirname, 'data');
        const files = fs.readdirSync(dataDir)
            .filter(f => f.startsWith('scrape_result_') && f.endsWith('.json'))
            .sort(); // Oldest first

        console.log(`📂 Found ${files.length} crawl files.`);

        const client = await pool.connect();

        for (const file of files) {
            const filePath = path.join(dataDir, file);
            console.log(`Processing: ${file}`);

            const content = fs.readFileSync(filePath, 'utf8');
            let rawData;
            try {
                rawData = JSON.parse(content);
            } catch (e) {
                console.error(`Skipping invalid JSON: ${file}`);
                continue;
            }

            if (!Array.isArray(rawData) || rawData.length === 0) continue;

            const gamesToIngest = [];
            // De-duplicate within the file
            const map = new Map();
            for (const item of rawData) {
                if (!item.appId) continue;
                const country = item.country || 'US'; // Default to US if missing
                const key = `${item.appId}_${country}`;

                if (!map.has(key)) {
                    map.set(key, {
                        store_id: item.appId,
                        name: item.title,
                        publisher: item.developer,
                        genre: item.genre || 'Unknown',
                        icon_url: item.icon,
                        store_url: item.url,
                        country_code: country,
                        rank: item.rank,
                        collection: item.collection,
                        rating: item.score || 0,
                        price: item.price || 0,
                        // Use file timestamp or item timestamp
                        captured_at: item.fetchedAt || new Date(parseInt(file.match(/\d+/)[0])).toISOString(),
                        last_updated: item.updated || null,
                        current_version: item.version || null,
                        recent_changes: item.recentChanges || null
                    });
                }
            }

            // Upsert Logic
            let inserted = 0;

            // Start transaction per file
            await client.query('BEGIN');

            try {
                for (const item of map.values()) {
                    // Update Game Info (Always take latest info if newer, but here we just ensure it exists)
                    const gameRes = await client.query(`
                        INSERT INTO games (store_id, name, publisher, genre, icon_url, store_url, last_updated, current_version, recent_changes)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (store_id) DO UPDATE 
                        SET 
                            last_updated = COALESCE(EXCLUDED.last_updated, games.last_updated),
                            current_version = COALESCE(EXCLUDED.current_version, games.current_version),
                            recent_changes = COALESCE(EXCLUDED.recent_changes, games.recent_changes)
                        RETURNING id;
                    `, [
                        item.store_id, item.name, item.publisher, item.genre, item.icon_url, item.store_url,
                        item.last_updated, item.current_version, item.recent_changes
                    ]);

                    const gameId = gameRes.rows[0].id;

                    // Rank mapping
                    let rank_free = null, rank_paid = null, rank_grossing = null;
                    if (item.collection === 'TOP_FREE') rank_free = item.rank;
                    if (item.collection === 'TOP_PAID') rank_paid = item.rank;
                    if (item.collection === 'GROSSING' || item.collection === 'TOP_GROSSING') rank_grossing = item.rank;

                    // Insert Snapshot - We use a rough "hour-based" duplicate check or just insert.
                    // To avoid exploding DB size with partial dupes, let's check if we have a snapshot for this game+country in this hour.
                    // Actually, simple way: Just Insert. We want the data points.
                    await client.query(`
                        INSERT INTO snapshots (game_id, country_code, rank_free, rank_paid, rank_grossing, rating, price, captured_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [gameId, item.country_code, rank_free, rank_paid, rank_grossing, item.rating, item.price, item.captured_at]);

                    inserted++;
                }

                await client.query('COMMIT');
                // process.stdout.write(`+${inserted} `);

            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Failed file ${file}:`, err.message);
            }
        }

        console.log("\n✅ Backfill Complete.");
        client.release();

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
})();
