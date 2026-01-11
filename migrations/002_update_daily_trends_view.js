/**
 * Step 3: Update daily_trends view to include rank_paid
 * 
 * Current issues:
 * 1. View doesn't output current_rank_paid
 * 2. WHERE clause excludes paid-only games
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

async function updateView() {
    console.log('🔧 Updating daily_trends MATERIALIZED VIEW to include rank_paid...\n');

    try {
        // Extend statement timeout to 5 minutes for this heavy operation
        console.log('   Setting statement timeout to 5 minutes...');
        await pool.query('SET statement_timeout = 300000');

        // Drop existing materialized view first
        console.log('   Dropping existing materialized view...');
        await pool.query(`DROP MATERIALIZED VIEW IF EXISTS daily_trends CASCADE`);

        // Create new materialized view WITH NO DATA initially to avoid timeout
        console.log('   Creating new materialized view structure...');
        await pool.query(`
            CREATE MATERIALIZED VIEW daily_trends AS
            WITH country_stats AS (
                SELECT 
                    country_code,
                    MAX(day_bucket) AS latest_day
                FROM distinct_daily_snapshots
                GROUP BY country_code
            ),
            today AS (
                SELECT 
                    s.id,
                    s.game_id,
                    s.country_code,
                    s.rank_free,
                    s.rank_paid,
                    s.rank_grossing,
                    s.captured_at,
                    s.day_bucket
                FROM distinct_daily_snapshots s
                JOIN country_stats cs ON s.country_code = cs.country_code AND s.day_bucket = cs.latest_day
            ),
            yesterday AS (
                SELECT 
                    s.id,
                    s.game_id,
                    s.country_code,
                    s.rank_free,
                    s.rank_paid,
                    s.rank_grossing,
                    s.captured_at,
                    s.day_bucket
                FROM distinct_daily_snapshots s
                JOIN country_stats cs ON s.country_code = cs.country_code AND s.day_bucket = (cs.latest_day - INTERVAL '1 day')
            ),
            chart_days AS (
                SELECT 
                    game_id,
                    country_code,
                    COUNT(DISTINCT date_trunc('day', captured_at AT TIME ZONE 'UTC')) AS days_count
                FROM snapshots
                GROUP BY game_id, country_code
            )
            SELECT 
                t.game_id,
                g.name,
                g.store_id,
                g.genre,
                g.publisher,
                g.icon_url,
                t.country_code,
                -- Free chart
                t.rank_free AS current_rank_free,
                (y.rank_free - t.rank_free) AS rank_change_free,
                -- Paid chart (ADDED)
                t.rank_paid AS current_rank_paid,
                (y.rank_paid - t.rank_paid) AS rank_change_paid,
                -- Grossing chart
                t.rank_grossing AS current_rank_grossing,
                (y.rank_grossing - t.rank_grossing) AS rank_change_grossing,
                -- Metadata
                d.days_count AS days_on_chart,
                (y.game_id IS NULL) AS is_new_entry,
                t.captured_at AS last_updated
            FROM today t
            JOIN games g ON t.game_id = g.id
            LEFT JOIN yesterday y ON t.game_id = y.game_id AND t.country_code = y.country_code
            LEFT JOIN chart_days d ON t.game_id = d.game_id AND t.country_code = d.country_code
            WHERE t.rank_free IS NOT NULL 
               OR t.rank_paid IS NOT NULL 
               OR t.rank_grossing IS NOT NULL
            WITH NO DATA
        `);

        // Create unique index needed for concurrent refresh
        console.log('   Creating unique index...');
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_trends_unique 
            ON daily_trends (game_id, country_code)
        `);

        // Now populating data (this might still take time, but is separate step)
        console.log('   Populating data (REFRESH MATERIALIZED VIEW)...');
        await pool.query('REFRESH MATERIALIZED VIEW daily_trends');


        console.log('✅ daily_trends materialized view updated successfully!');
        console.log('   Added: current_rank_paid, rank_change_paid');
        console.log('   Fixed: WHERE clause now includes rank_paid');

        // Verify
        const verify = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'daily_trends'
            ORDER BY ordinal_position
        `);

        console.log('\n📊 View columns:');
        verify.rows.forEach(r => console.log(`   - ${r.column_name}`));

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        pool.end();
    }
}

updateView();
