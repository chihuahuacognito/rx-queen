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
        // Check if US data joins with games table
        const joinCheck = await pool.query(`
            SELECT COUNT(*) as total
            FROM distinct_daily_snapshots d 
            JOIN games g ON d.game_id = g.id 
            WHERE d.country_code = 'US'
        `);
        console.log('US snapshots that JOIN with games:', joinCheck.rows[0].total);

        // Check if there are orphan snapshots (no matching game)
        const orphans = await pool.query(`
            SELECT COUNT(*) as total
            FROM distinct_daily_snapshots d 
            LEFT JOIN games g ON d.game_id = g.id 
            WHERE d.country_code = 'US' AND g.id IS NULL
        `);
        console.log('US orphan snapshots (no game):', orphans.rows[0].total);

        // Check the "today" CTE manually for US
        const todayCTE = await pool.query(`
            WITH country_stats AS (
                SELECT country_code, MAX(day_bucket) as latest_day 
                FROM distinct_daily_snapshots
                GROUP BY country_code
            ),
            today AS (
                SELECT s.* 
                FROM distinct_daily_snapshots s
                JOIN country_stats cs ON s.country_code = cs.country_code 
                AND s.day_bucket = cs.latest_day
            )
            SELECT COUNT(*) FROM today WHERE country_code = 'US'
        `);
        console.log('US rows in "today" CTE:', todayCTE.rows[0].count);

        // If today has data, check the full view join
        const fullJoin = await pool.query(`
            WITH country_stats AS (
                SELECT country_code, MAX(day_bucket) as latest_day 
                FROM distinct_daily_snapshots
                GROUP BY country_code
            ),
            today AS (
                SELECT s.* 
                FROM distinct_daily_snapshots s
                JOIN country_stats cs ON s.country_code = cs.country_code 
                AND s.day_bucket = cs.latest_day
            )
            SELECT t.game_id, g.name, t.rank_free, t.rank_grossing
            FROM today t
            JOIN games g ON t.game_id = g.id
            WHERE t.country_code = 'US'
            LIMIT 5
        `);
        console.log('\nSample US data with full join:');
        fullJoin.rows.forEach(r => console.log(`  ${r.name}: Free=${r.rank_free}, Grossing=${r.rank_grossing}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
