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
        // Check countries
        const countries = await pool.query(`
            SELECT country_code, COUNT(*) as cnt 
            FROM daily_trends 
            GROUP BY country_code
        `);
        console.log('📍 Countries in daily_trends:');
        countries.rows.forEach(r => console.log(`  ${r.country_code}: ${r.cnt} rows`));

        // Check rank types
        const ranks = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE current_rank_free IS NOT NULL) as has_free,
                COUNT(*) FILTER (WHERE current_rank_grossing IS NOT NULL) as has_grossing
            FROM daily_trends
        `);
        console.log('\n📊 Rank types:');
        console.log('  Free ranks:', ranks.rows[0].has_free);
        console.log('  Grossing ranks:', ranks.rows[0].has_grossing);

        // Sample of US data
        const sample = await pool.query(`
            SELECT name, current_rank_free, current_rank_grossing, country_code
            FROM daily_trends 
            WHERE country_code = 'US'
            LIMIT 5
        `);
        console.log('\n🎮 Sample US data:');
        sample.rows.forEach(r => console.log(`  ${r.name}: Free=${r.current_rank_free}, Grossing=${r.current_rank_grossing}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
