/**
 * Step 1: Create unique constraint for UPSERT support
 * 
 * This allows ON CONFLICT to work properly when a game appears
 * in multiple charts (FREE, PAID, GROSSING)
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

async function createConstraint() {
    console.log('🔧 Creating unique constraint for UPSERT support...\n');

    try {
        // First check if it already exists
        const existing = await pool.query(`
            SELECT indexname FROM pg_indexes 
            WHERE tablename = 'snapshots' 
            AND indexname = 'idx_snapshots_game_country_day_unique'
        `);

        if (existing.rows.length > 0) {
            console.log('✅ Constraint already exists');
            return;
        }

        // Create the unique index
        // Using expression index on date_trunc for day-level uniqueness
        await pool.query(`
            CREATE UNIQUE INDEX idx_snapshots_game_country_day_unique 
            ON snapshots (game_id, country_code, (date_trunc('day', captured_at AT TIME ZONE 'UTC')))
        `);

        console.log('✅ Created unique index: idx_snapshots_game_country_day_unique');
        console.log('   This enables UPSERT for game+country+day combinations');

    } catch (e) {
        if (e.message.includes('duplicate key')) {
            console.log('⚠️ Cannot create unique index - duplicate data exists');
            console.log('   Need to clean up duplicates first');

            // Show duplicate count
            const dupes = await pool.query(`
                SELECT game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC') as day, COUNT(*) as cnt
                FROM snapshots
                GROUP BY game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                HAVING COUNT(*) > 1
                LIMIT 5
            `);
            console.log('   Sample duplicates:', dupes.rows);
        } else {
            console.error('❌ Error:', e.message);
        }
    } finally {
        pool.end();
    }
}

createConstraint();
