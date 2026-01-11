/**
 * Step 4: Add Performance Indexes & Refresh
 * 
 * The Daily Trends view refresh is timing out.
 * We need indexes specifically for the joins in the view.
 */

const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addIndexes() {
    console.log('🚀 Adding performance indexes...\n');

    try {
        // 1. Index for country + captured_at (filtering by date)
        console.log('   Creating idx_snapshots_country_date...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_snapshots_country_date_brin 
            ON snapshots USING brin(captured_at)
        `);
        // Note: BRIN is great for time-series append-only data like this

        // 2. Index for game_id + country (joining yesterday/today)
        console.log('   Creating idx_snapshots_composite...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_snapshots_lookup_perf
            ON snapshots (game_id, country_code, captured_at DESC)
        `);

        console.log('✅ Indexes created.');

        // 3. Try Refresh again
        console.log('\n🔄 Attempting to refresh daily_trends view...');
        const start = Date.now();
        await pool.query('REFRESH MATERIALIZED VIEW daily_trends');
        console.log(`✅ Success! Refreshed in ${((Date.now() - start) / 1000).toFixed(1)}s`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        pool.end();
    }
}

addIndexes();
