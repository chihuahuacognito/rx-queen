const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gaming_insights',
});

(async () => {
    try {
        console.log("🔍 Inspecting GAMES table for duplicates...");

        const res = await pool.query(`
            SELECT store_id, COUNT(*) as count, string_agg(id::text, ',') as ids
            FROM games
            GROUP BY store_id
            HAVING COUNT(*) > 1
        `);

        if (res.rows.length > 0) {
            console.log("⚠️  DUPLICATE GAMES FOUND!");
            console.table(res.rows);
        } else {
            console.log("✅ Games table is clean (Unique store_ids).");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
})();
