/**
 * Refresh Daily Trends Cache
 * 
 * Replaces: REFRESH MATERIALIZED VIEW CONCURRENTLY daily_trends
 * Strategy: Updates daily_trends_cache table country-by-country to avoid timeouts.
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

async function refreshCache() {
    console.log('🔄 Refreshing Daily Trends Cache...');
    const client = await pool.connect();

    try {
        // 1. Get countries changed today (or all items for full refresh)
        // For simplicity, we refresh all active countries
        const countries = await client.query(`
            SELECT DISTINCT country_code FROM snapshots 
            WHERE captured_at > NOW() - INTERVAL '2 days'
        `);

        console.log(`   Targets: ${countries.rows.length} countries`);

        // 2. Refresh each country
        let totalUpdated = 0;

        for (const row of countries.rows) {
            const country = row.country_code;
            const start = Date.now();

            // Clear data for this country first (to handle removed items)
            await client.query('DELETE FROM daily_trends_cache WHERE country_code = $1', [country]);

            // Insert recalculation
            const res = await client.query(`
                INSERT INTO daily_trends_cache
                WITH country_stats AS (
                    SELECT 
                        $1::text as country_code,
                        MAX(day_bucket) AS latest_day
                    FROM distinct_daily_snapshots
                    WHERE country_code = $1
                ),
                today AS (
                    SELECT s.game_id, s.country_code, s.rank_free, s.rank_paid, s.rank_grossing, s.captured_at, s.day_bucket
                    FROM distinct_daily_snapshots s
                    JOIN country_stats cs ON s.country_code = cs.country_code AND s.day_bucket = cs.latest_day
                    WHERE s.country_code = $1
                ),
                yesterday AS (
                    SELECT s.game_id, s.country_code, s.rank_free, s.rank_paid, s.rank_grossing
                    FROM distinct_daily_snapshots s
                    JOIN country_stats cs ON s.country_code = cs.country_code AND s.day_bucket = (cs.latest_day - INTERVAL '1 day')
                    WHERE s.country_code = $1
                ),
                chart_days AS (
                    SELECT game_id, country_code, COUNT(DISTINCT date_trunc('day', captured_at AT TIME ZONE 'UTC')) AS days_count
                    FROM snapshots
                    WHERE country_code = $1
                    GROUP BY game_id, country_code
                )
                SELECT 
                    t.game_id,
                    t.country_code,
                    t.rank_free AS current_rank_free,
                    (y.rank_free - t.rank_free) AS rank_change_free,
                    t.rank_paid AS current_rank_paid,
                    (y.rank_paid - t.rank_paid) AS rank_change_paid,
                    t.rank_grossing AS current_rank_grossing,
                    (y.rank_grossing - t.rank_grossing) AS rank_change_grossing,
                    d.days_count AS days_on_chart,
                    (y.game_id IS NULL) AS is_new_entry,
                    t.captured_at AS last_updated
                FROM today t
                LEFT JOIN yesterday y ON t.game_id = y.game_id 
                LEFT JOIN chart_days d ON t.game_id = d.game_id
                WHERE t.rank_free IS NOT NULL 
                   OR t.rank_paid IS NOT NULL 
                   OR t.rank_grossing IS NOT NULL
            `, [country]);

            totalUpdated += res.rowCount;
            // process.stdout.write('.'); // Minimalism
        }

        console.log(`\n✅ Refreshed ${totalUpdated} rows across ${countries.rows.length} countries.`);

    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

refreshCache();
