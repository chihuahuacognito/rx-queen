const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Use credentials found in db.ts
const connectionString = 'postgresql://postgres:admin123@localhost:5432/gaming_insights';

const pool = new Pool({
    connectionString
});

(async () => {
    try {
        console.log("🚀 Starting Manual Ingestion...");
        console.log(`🔌 DB: ${connectionString}`);

        // 1. Find Data File
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            throw new Error("Data directory not found");
        }

        const files = fs.readdirSync(dataDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length === 0) throw new Error("No scraper files found");

        const latestFile = path.join(dataDir, files[0]);
        console.log(`📂 Reading: ${files[0]}`);

        const content = fs.readFileSync(latestFile, 'utf8');
        const rawData = JSON.parse(content);
        console.log(`📊 Total Raw Items: ${rawData.length}`);

        // 2. Merge Logic (Replicating n8n)
        const merged = {};
        rawData.forEach(item => {
            const id = item.appId;
            const country = item.country || 'US';
            if (!id) return;

            const key = `${id}_${country}`;

            if (!merged[key]) {
                merged[key] = {
                    store_id: item.appId,
                    name: item.title,
                    publisher: item.developer,
                    genre: item.genre || 'Unknown',
                    icon_url: item.icon,
                    store_url: item.url,
                    country_code: country,
                    rank_free: null,
                    rank_paid: null,
                    rank_grossing: null,
                    rating: item.score || 0,
                    price: item.price || 0,
                    captured_at: item.fetchedAt || new Date().toISOString(),
                    last_updated: item.updated || null,
                    current_version: item.version || null,
                    recent_changes: item.recentChanges || null
                };
            }

            if (item.collection === 'TOP_FREE') merged[key].rank_free = item.rank;
            if (item.collection === 'TOP_PAID') merged[key].rank_paid = item.rank;
            if (item.collection === 'GROSSING' || item.collection === 'TOP_GROSSING') merged[key].rank_grossing = item.rank;
        });

        const items = Object.values(merged);
        console.log(`🔹 Processed into ${items.length} Unique Snapshots`);

        // 3. Batch Insert
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let gamesUpserted = 0;
            let snapshotsInserted = 0;

            for (const item of items) {
                // Upsert Game
                const gameRes = await client.query(`
                    INSERT INTO games (store_id, name, publisher, genre, icon_url, store_url, last_updated, current_version, recent_changes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (store_id) DO UPDATE 
                    SET 
                        name = EXCLUDED.name, 
                        genre = EXCLUDED.genre, 
                        icon_url = EXCLUDED.icon_url,
                        last_updated = EXCLUDED.last_updated,
                        current_version = EXCLUDED.current_version,
                        recent_changes = EXCLUDED.recent_changes
                    RETURNING id;
                `, [
                    item.store_id, item.name, item.publisher, item.genre, item.icon_url, item.store_url,
                    item.last_updated, item.current_version, item.recent_changes
                ]);

                const gameId = gameRes.rows[0].id;
                gamesUpserted++;

                // Insert Snapshot
                await client.query(`
                    INSERT INTO snapshots (game_id, country_code, rank_free, rank_paid, rank_grossing, rating, price, captured_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                `, [gameId, item.country_code, item.rank_free, item.rank_paid, item.rank_grossing, item.rating, item.price]);
                snapshotsInserted++;

                if (snapshotsInserted % 100 === 0) process.stdout.write('.');
            }

            await client.query('COMMIT');
            console.log("\n✅ COMMIT SUCCESS!");
            console.log(`   Games Processed: ${gamesUpserted}`);
            console.log(`   Snapshots Added: ${snapshotsInserted}`);

        } catch (dbErr) {
            await client.query('ROLLBACK');
            console.error("\n❌ Transaction Failed:", dbErr.message);
        } finally {
            client.release();
        }

    } catch (err) {
        console.error("🔥 Error:", err.message);
    } finally {
        await pool.end();
    }
})();
