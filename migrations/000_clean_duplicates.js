/**
 * Step 1a: Clean duplicates - SIMPLER VERSION
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

async function cleanDuplicates() {
    console.log('🧹 Cleaning duplicate snapshots (v2)...\n');

    const client = await pool.connect();

    try {
        // Count duplicates
        const dupeCount = await client.query(`
            SELECT COUNT(*) as total FROM (
                SELECT game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC') as day
                FROM snapshots
                GROUP BY game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                HAVING COUNT(*) > 1
            ) sub
        `);

        console.log(`📊 Found ${dupeCount.rows[0].total} duplicate groups`);

        if (parseInt(dupeCount.rows[0].total) === 0) {
            console.log('✅ No duplicates!');
            return;
        }

        // Direct delete using window function - keep row with LOWEST id per group
        console.log('🔧 Deleting duplicates (keeping lowest ID per group)...');

        const deleteResult = await client.query(`
            DELETE FROM snapshots 
            WHERE id IN (
                SELECT id FROM (
                    SELECT id,
                           ROW_NUMBER() OVER (
                               PARTITION BY game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                               ORDER BY id ASC
                           ) as rn
                    FROM snapshots
                ) sub
                WHERE rn > 1
            )
        `);

        console.log(`✅ Deleted ${deleteResult.rowCount} duplicate rows`);

        // Verify
        const verify = await client.query(`
            SELECT COUNT(*) as remaining FROM (
                SELECT game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                FROM snapshots
                GROUP BY game_id, country_code, date_trunc('day', captured_at AT TIME ZONE 'UTC')
                HAVING COUNT(*) > 1
            ) sub
        `);

        console.log(`📊 Remaining duplicates: ${verify.rows[0].remaining}`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        client.release();
        pool.end();
    }
}

cleanDuplicates();
