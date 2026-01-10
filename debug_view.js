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

(async () => {
    try {
        // Check distinct_daily_snapshots for US
        const dds = await pool.query(`
            SELECT country_code, MAX(day_bucket) as latest, COUNT(*) as cnt
            FROM distinct_daily_snapshots 
            GROUP BY country_code
            ORDER BY latest DESC
        `);
        console.log('📋 distinct_daily_snapshots by country:');
        dds.rows.forEach(r => console.log(`  ${r.country_code}: ${r.cnt} rows, latest: ${r.latest}`));

        // Check if US has rank_free or rank_grossing
        const usRanks = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(rank_free) as has_free,
                COUNT(rank_grossing) as has_grossing
            FROM distinct_daily_snapshots
            WHERE country_code = 'US'
        `);
        console.log('\n🇺🇸 US rank data:');
        console.log('  Total:', usRanks.rows[0].total);
        console.log('  Has rank_free:', usRanks.rows[0].has_free);
        console.log('  Has rank_grossing:', usRanks.rows[0].has_grossing);

        // Check the WHERE clause in daily_trends - does US appear?
        const dtUS = await pool.query(`
            SELECT COUNT(*) FROM daily_trends WHERE country_code = 'US'
        `);
        console.log('\n📊 US in daily_trends:', dtUS.rows[0].count);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
