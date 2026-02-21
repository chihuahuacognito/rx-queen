/**
 * Refresh Daily Trends Cache (v2 - Optimized)
 * 
 * Fix for GitHub Actions timeout (Feb 2026)
 * 
 * Problem: distinct_daily_snapshots VIEW scans the ENTIRE snapshots table
 *          with ROW_NUMBER() OVER (...). At 500K+ rows × 26 countries, this hangs.
 * 
 * Solution: Use raw SQL that filters to last 2 days FIRST, then deduplicates.
 *           This reduces the working set from 500K to ~26K rows.
 */

const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 120000 // 2 min per query max
});

async function refreshCache() {
    console.log('🔄 Refreshing Daily Trends Cache (v2 - Optimized)...');
    const overallStart = Date.now();
    const client = await pool.connect();

    try {
        // 1. Get active countries (from last 2 days only)
        const countries = await client.query(`
            SELECT DISTINCT country_code FROM snapshots 
            WHERE captured_at > NOW() - INTERVAL '2 days'
        `);

        console.log(`   Targets: ${countries.rows.length} countries`);

        // 2. Clear all old cache first
        await client.query('DELETE FROM daily_trends_cache');

        let totalUpdated = 0;

        for (const row of countries.rows) {
            const country = row.country_code;
            const start = Date.now();

            // Optimized: Filter to last 2 days FIRST, then deduplicate
            // This avoids scanning the entire snapshots table
            const res = await client.query(`
                INSERT INTO daily_trends_cache
                WITH recent_snaps AS (
                    -- STEP 1: Only look at last 2 days of data for this country
                    SELECT 
                        id, game_id, country_code, rank_free, rank_paid, rank_grossing,
                        captured_at,
                        date_trunc('day', captured_at AT TIME ZONE 'UTC') as day_bucket,
                        ROW_NUMBER() OVER (
                            PARTITION BY game_id, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                            ORDER BY captured_at DESC
                        ) as rn
                    FROM snapshots
                    WHERE country_code = $1
                    AND captured_at > NOW() - INTERVAL '2 days'
                ),
                deduped AS (
                    -- STEP 2: Keep only the latest snapshot per game per day
                    SELECT * FROM recent_snaps WHERE rn = 1
                ),
                day_bounds AS (
                    -- STEP 3: Find today and yesterday for this country
                    SELECT MAX(day_bucket) as latest_day
                    FROM deduped
                ),
                today AS (
                    SELECT d.* FROM deduped d, day_bounds b
                    WHERE d.day_bucket = b.latest_day
                ),
                yesterday AS (
                    SELECT d.* FROM deduped d, day_bounds b
                    WHERE d.day_bucket = b.latest_day - INTERVAL '1 day'
                ),
                chart_days AS (
                    -- STEP 4: Count days on chart (use index on game_id + country_code)
                    SELECT game_id, country_code,
                           COUNT(DISTINCT date_trunc('day', captured_at AT TIME ZONE 'UTC')) AS days_count
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
                    COALESCE(d.days_count, 1) AS days_on_chart,
                    (y.game_id IS NULL) AS is_new_entry,
                    t.captured_at AS last_updated
                FROM today t
                LEFT JOIN yesterday y ON t.game_id = y.game_id 
                LEFT JOIN chart_days d ON t.game_id = d.game_id AND t.country_code = d.country_code
                WHERE t.rank_free IS NOT NULL 
                   OR t.rank_paid IS NOT NULL 
                   OR t.rank_grossing IS NOT NULL
            `, [country]);

            totalUpdated += res.rowCount;
            const elapsed = Date.now() - start;

            // Log if any country takes > 5s (warning sign)
            if (elapsed > 5000) {
                console.log(`   ⚠️ ${country}: ${res.rowCount} rows (${(elapsed / 1000).toFixed(1)}s - SLOW)`);
            }
        }

        const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(1);
        console.log(`\n✅ Refreshed ${totalUpdated} rows across ${countries.rows.length} countries in ${totalElapsed}s.`);

    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

refreshCache();
