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
        console.log('🔍 Checking data types in live database...');

        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'games' AND column_name = 'id';
        `);

        if (res.rows.length > 0) {
            console.log(`✅ games.id type is: ${res.rows[0].data_type.toUpperCase()}`);
        } else {
            console.log('❌ Could not find games table!');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        pool.end();
    }
})();
