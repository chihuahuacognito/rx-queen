/**
 * Fix existing snapshots with NULL ranks
 * Reads recent JSON files and updates the rank columns
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Use environment variable - set SUPABASE_URL before running
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('❌ Error: SUPABASE_URL environment variable not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const DATA_DIR = path.join(__dirname, 'data');

async function fixRanks() {
    console.log('🔧 Fixing NULL ranks in existing snapshots...');

    // Get files from today
    const files = fs.readdirSync(DATA_DIR)
        .filter(f => f.startsWith('scrape_result_') && f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 10); // Last 10 files

    const client = await pool.connect();
    let totalUpdated = 0;

    try {
        for (const file of files) {
            console.log(`\n📄 Processing: ${file}`);
            const filePath = path.join(DATA_DIR, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let updated = 0;

            for (const game of data) {
                const storeId = game.appId || game.id;
                if (!storeId) continue;

                const country = game.country || 'US';
                const rankFree = game.collection === 'TOP_FREE' ? game.rank : null;
                const rankGrossing = game.collection === 'TOP_GROSSING' ? game.rank : null;

                if (!rankFree && !rankGrossing) continue;

                // Get game_id
                const gameRes = await client.query(
                    'SELECT id FROM games WHERE store_id = $1',
                    [storeId]
                );
                if (gameRes.rows.length === 0) continue;
                const gameId = gameRes.rows[0].id;

                // Update the snapshot for today
                const result = await client.query(`
                    UPDATE snapshots 
                    SET 
                        rank_free = COALESCE($3, rank_free),
                        rank_grossing = COALESCE($4, rank_grossing)
                    WHERE game_id = $1 
                    AND country_code = $2
                    AND date_trunc('day', captured_at AT TIME ZONE 'UTC') = date_trunc('day', NOW() AT TIME ZONE 'UTC')
                    AND (rank_free IS NULL OR rank_grossing IS NULL)
                `, [gameId, country, rankFree, rankGrossing]);

                if (result.rowCount > 0) updated++;
            }

            console.log(`   ✅ Updated: ${updated} snapshots`);
            totalUpdated += updated;
        }

        console.log(`\n🎉 Total updated: ${totalUpdated}`);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        client.release();
        pool.end();
    }
}

fixRanks();
