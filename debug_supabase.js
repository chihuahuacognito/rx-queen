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
        // Check views
        const views = await pool.query(`
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public'
        `);
        console.log('📋 Views in Supabase:');
        views.rows.forEach(r => console.log('  -', r.table_name));

        // Check snapshots count
        const snapCount = await pool.query('SELECT COUNT(*) FROM snapshots');
        console.log('\n📊 Snapshot count:', snapCount.rows[0].count);

        // Check if daily_trends view exists
        const hasDailyTrends = views.rows.some(r => r.table_name === 'daily_trends');
        if (!hasDailyTrends) {
            console.log('\n⚠️  daily_trends VIEW is MISSING!');
        }

        // Check sample of latest snapshots
        const sample = await pool.query(`
            SELECT s.id as snap_id, g.name, s.country_code, s.captured_at 
            FROM snapshots s 
            JOIN games g ON s.game_id = g.id 
            ORDER BY s.captured_at DESC 
            LIMIT 5
        `);
        console.log('\n🕐 Latest snapshots:');
        sample.rows.forEach(r => console.log(`  ${r.name} (${r.country_code}) - ${r.captured_at}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
