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
        // Check ALL country codes in snapshots (raw data)
        const snapCountries = await pool.query(`
            SELECT country_code, COUNT(*) as cnt, MAX(captured_at) as latest
            FROM snapshots 
            GROUP BY country_code
            ORDER BY cnt DESC
        `);
        console.log('📋 Countries in SNAPSHOTS table:');
        snapCountries.rows.forEach(r => console.log(`  ${r.country_code}: ${r.cnt} rows (latest: ${r.latest})`));

        // Check if US exists at all
        const usCount = await pool.query(`
            SELECT COUNT(*) FROM snapshots WHERE country_code = 'US'
        `);
        console.log('\n🇺🇸 US snapshots:', usCount.rows[0].count);

        // Check if GB exists at all
        const gbCount = await pool.query(`
            SELECT COUNT(*) FROM snapshots WHERE country_code = 'GB'
        `);
        console.log('🇬🇧 GB snapshots:', gbCount.rows[0].count);

        // Check recent ingestion (last hour)
        const recent = await pool.query(`
            SELECT country_code, COUNT(*) 
            FROM snapshots 
            WHERE captured_at > NOW() - INTERVAL '2 hours'
            GROUP BY country_code
        `);
        console.log('\n⏰ Snapshots from last 2 hours:');
        if (recent.rows.length === 0) {
            console.log('  None!');
        } else {
            recent.rows.forEach(r => console.log(`  ${r.country_code}: ${r.count}`));
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
})();
