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
    console.log('🔧 Creating daily_trends VIEW in Supabase...');

    try {
        await pool.query(`
            CREATE OR REPLACE VIEW daily_trends AS
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
            ),
            yesterday AS (
                SELECT s.* 
                FROM distinct_daily_snapshots s
                JOIN country_stats cs ON s.country_code = cs.country_code 
                AND s.day_bucket = cs.latest_day - INTERVAL '1 day'
            ),
            chart_days AS (
                SELECT 
                    s.game_id, 
                    s.country_code,
                    COUNT(DISTINCT date_trunc('day', s.captured_at AT TIME ZONE 'UTC')) as days_count
                FROM snapshots s
                GROUP BY s.game_id, s.country_code
            )
            SELECT 
                t.game_id,
                g.name,
                g.store_id,
                g.genre,
                g.publisher,
                g.icon_url,
                t.country_code,
                
                t.rank_free as current_rank_free,
                t.rank_grossing as current_rank_grossing,
                
                (y.rank_free - t.rank_free) as rank_change_free,
                (y.rank_grossing - t.rank_grossing) as rank_change_grossing,
                
                d.days_count as days_on_chart,
                (y.game_id IS NULL) as is_new_entry,
                
                t.captured_at as last_updated
            FROM today t
            JOIN games g ON t.game_id = g.id
            LEFT JOIN yesterday y ON t.game_id = y.game_id AND t.country_code = y.country_code
            LEFT JOIN chart_days d ON t.game_id = d.game_id AND t.country_code = d.country_code
            WHERE t.rank_free IS NOT NULL OR t.rank_grossing IS NOT NULL;
        `);

        console.log('✅ daily_trends VIEW created!');

        // Test it
        const test = await pool.query('SELECT COUNT(*) FROM daily_trends');
        console.log('📊 Rows in daily_trends:', test.rows[0].count);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        pool.end();
    }
})();
