const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gaming_insights',
});

(async () => {
    try {
        console.log("🔍 Checking for Duplicate Entries in Daily Trends View...");

        // Query to find games that appear more than once for the SAME rank type (free/grossing) in the SAME country
        // This usually happens if the JOINs in the view are fanning out
        const res = await pool.query(`
            SELECT 
                country_code, 
                game_id, 
                current_rank_free,
                COUNT(*) as count
            FROM daily_trends
            WHERE current_rank_free IS NOT NULL
            GROUP BY country_code, game_id, current_rank_free
            HAVING COUNT(*) > 1
        `);

        if (res.rows.length > 0) {
            console.log("⚠️  DUPLICATES FOUND!");
            console.table(res.rows.slice(0, 10)); // Show first 10

            console.log("\nInvestigating a sample duplicate...");
            const sample = res.rows[0];

            // Inspect RAW snapshots for this game/country to see if source data is duplicated
            const rawSnapshots = await pool.query(`
                SELECT id, game_id, country_code, rank_free, captured_at
                FROM snapshots 
                WHERE game_id = $1 
                AND country_code = $2
                AND rank_free = $3
                AND captured_at > NOW() - INTERVAL '24 hours'
            `, [sample.game_id, sample.country_code, sample.current_rank_free]);

            console.log("Raw Snapshots for this duplicate:");
            console.table(rawSnapshots.rows);

        } else {
            console.log("✅ No duplicates found in 'daily_trends' view.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
})();
