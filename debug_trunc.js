const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gaming_insights',
});

(async () => {
    try {
        console.log("🔍 Deep debugging duplicates...");

        const inspector = await pool.query(`
            SELECT 
                id, 
                game_id, 
                country_code, 
                captured_at,
                date_trunc('day', captured_at) as trunc_day
            FROM snapshots
            WHERE game_id = 10 AND country_code = 'US'
            ORDER BY captured_at DESC
        `);

        console.table(inspector.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
})();
