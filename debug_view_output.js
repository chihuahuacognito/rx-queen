const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gaming_insights',
});

(async () => {
    try {
        console.log("🔍 Checking Daily Trends View Output by Country...");

        const res = await pool.query(`
            SELECT country_code, COUNT(*) as count, MAX(last_updated) as latest_in_view
            FROM daily_trends
            GROUP BY country_code
        `);

        console.table(res.rows);

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
})();
