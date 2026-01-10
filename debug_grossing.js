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
        // Check grossing vs free data
        const result = await pool.query(`
            SELECT 
                country_code, 
                COUNT(*) as total_snapshots,
                COUNT(CASE WHEN rank_grossing IS NOT NULL THEN 1 END) as grossing_count,
                COUNT(CASE WHEN rank_free IS NOT NULL THEN 1 END) as free_count
            FROM snapshots 
            WHERE captured_at > NOW() - INTERVAL '3 days' 
            GROUP BY country_code 
            ORDER BY country_code
        `);

        console.log('📊 Snapshot breakdown (last 3 days):');
        console.table(result.rows);

        // Sample grossing data
        const sample = await pool.query(`
            SELECT g.name, s.country_code, s.rank_grossing, s.rank_free
            FROM snapshots s
            JOIN games g ON s.game_id = g.id
            WHERE s.rank_grossing IS NOT NULL 
            AND s.captured_at > NOW() - INTERVAL '1 day'
            ORDER BY s.rank_grossing
            LIMIT 10
        `);

        console.log('\n💰 Top 10 Grossing (sample):');
        console.table(sample.rows);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
