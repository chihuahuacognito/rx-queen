const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/gaming_insights'
});

(async () => {
    try {
        console.log("🔍 Debugging Ingestion Data...");

        // 1. Find Data File
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            console.error("❌ Data directory not found!");
            return;
        }

        const files = fs.readdirSync(dataDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length === 0) {
            console.error("❌ No scraper JSON files found.");
            return;
        }

        const latestFile = path.join(dataDir, files[0]);
        console.log(`📂 Analyzing latest file: ${files[0]}`);

        const content = fs.readFileSync(latestFile, 'utf8');
        const data = JSON.parse(content);

        console.log(`📊 Total Items: ${data.length}`);

        // 2. Breakdown by Country
        const counts = {};
        data.forEach(d => {
            const c = d.country || d.country_code || 'UNKNOWN';
            counts[c] = (counts[c] || 0) + 1;
        });
        console.table(counts);

        // 3. Check for non-US data
        const foreignItem = data.find(d => d.country && d.country !== 'US');

        if (!foreignItem) {
            console.error("❌ File contains ONLY US data. Scraper argument likely failed.");
        } else {
            console.log("✅ File contains global data. Scraper is fine.");

            // 4. Try Manual Insert
            console.log("🧪 Attempting Manual Insert of 1 Foreign Item...");
            const client = await pool.connect();
            try {
                // Ensure game exists
                const storeId = foreignItem.appId || foreignItem.store_id;
                console.log(`   Upserting Game: ${storeId}`);

                const gameRes = await client.query(`
                    INSERT INTO games (store_id, name, publisher, genre, icon_url, store_url)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (store_id) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id;
                `, [storeId, foreignItem.title, foreignItem.developer, foreignItem.genre, foreignItem.icon, foreignItem.url]);

                const gameId = gameRes.rows[0].id;
                console.log(`   Game ID: ${gameId}`);

                // Insert Snapshot
                console.log(`   Inserting Snapshot for ${foreignItem.country}...`);
                await client.query(`
                    INSERT INTO snapshots (game_id, country_code, rank_free, rating, captured_at)
                    VALUES ($1, $2, $3, $4, NOW())
                `, [gameId, foreignItem.country, foreignItem.rank || null, foreignItem.score || 0]);

                console.log("✅ Manual Insert SUCCESS! Database allows global data.");
            } catch (dbErr) {
                console.error("❌ Database Insert Failed:", dbErr.message);
            } finally {
                client.release();
            }
        }

    } catch (err) {
        console.error("🔥 Script Error:", err);
    } finally {
        await pool.end();
    }
})();
