/**
 * Step 5: Switch from Materialized View to "Cached Table" strategy
 * 
 * Problem: Materialized View refresh times out because it processes all countries at once.
 * Solution: 
 * 1. Create a regular table `daily_trends_cache` to store the calculated stats.
 * 2. Create a standard VIEW `daily_trends` that joins the cache with game details (to match old interface).
 * 3. Populate the cache table incrementally (country by country) to avoid timeouts.
 */

const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: SUPABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function migrateToCachedTable() {
    console.log('🔄 Migrating from Materialized View to Cached Table strategy...\n');

    try {
        // 1. Drop the old Materialized View
        console.log('   Dropping old daily_trends materialized view...');
        await pool.query('DROP MATERIALIZED VIEW IF EXISTS daily_trends CASCADE');
        await pool.query('DROP VIEW IF EXISTS daily_trends CASCADE'); // In case it was a regular view

        // 2. Create the Cache Table
        console.log('   Creating table daily_trends_cache...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_trends_cache (
                game_id INTEGER,
                country_code TEXT,
                current_rank_free INTEGER,
                rank_change_free INTEGER,
                current_rank_paid INTEGER,
                rank_change_paid INTEGER,
                current_rank_grossing INTEGER,
                rank_change_grossing INTEGER,
                days_on_chart INTEGER,
                is_new_entry BOOLEAN,
                last_updated TIMESTAMPTZ,
                PRIMARY KEY (game_id, country_code)
            )
        `);

        // Index for performance
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_trends_cache_country 
            ON daily_trends_cache(country_code)
        `);

        // 3. Create the standard View (Interface for Frontend)
        console.log('   Creating view daily_trends (wrapper)...');
        await pool.query(`
            CREATE VIEW daily_trends AS
            SELECT 
                c.game_id,
                g.name,
                g.store_id,
                g.genre,
                g.publisher,
                g.icon_url,
                c.country_code,
                c.current_rank_free,
                c.rank_change_free,
                c.current_rank_paid,
                c.rank_change_paid,
                c.current_rank_grossing,
                c.rank_change_grossing,
                c.days_on_chart,
                c.is_new_entry,
                c.last_updated
            FROM daily_trends_cache c
            JOIN games g ON c.game_id = g.id
        `);

        console.log('✅ Migration complete. Structure is ready.');
        console.log('   Now running population script (incremental)...');

        // 4. Run the population logic immediately
        await populateCacheIncrementally();

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        pool.end();
    }
}

async function populateCacheIncrementally() {
    console.log('\n📊 Populating cache incrementally (Country by Country)...');

    // Get list of active countries
    const countries = await pool.query(`
        SELECT DISTINCT country_code FROM snapshots 
        WHERE captured_at > NOW() - INTERVAL '3 days'
    `);

    console.log(`   Found ${countries.rows.length} countries to process.`);
    const client = await pool.connect();

    try {
        // Clear old cache first (optional, or use upsert)
        await client.query('TRUNCATE daily_trends_cache');

        for (const row of countries.rows) {
            const country = row.country_code;
            process.stdout.write(`   Processing ${country}... `);

            const start = Date.now();

            // The heavy query, filtered by country
            await client.query(`
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

            console.log(`Done (${Date.now() - start}ms)`);
        }
        console.log('✅ Cache population complete!');

    } catch (e) {
        console.error('❌ Error during population:', e.message);
    } finally {
        client.release();
    }
}

migrateToCachedTable();
