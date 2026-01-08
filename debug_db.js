const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gaming_insights'
});

(async () => {
    try {
        console.log("Checking database...");

        // 1. Check Country Distribution
        const res = await pool.query(`SELECT country_code, COUNT(*) FROM snapshots GROUP BY country_code`);
        console.log("Current Snapshot Counts:");
        console.table(res.rows);

        // 2. Check if we have ANY data for other countries
        const jpCheck = await pool.query(`SELECT * FROM snapshots WHERE country_code = 'JP' LIMIT 1`);
        if (jpCheck.rows.length === 0) {
            console.log("No JP data found. Attempting manual insert...");

            // Find a game
            const game = await pool.query(`SELECT id, store_id FROM games LIMIT 1`);
            if (game.rows.length > 0) {
                const gameId = game.rows[0].id;
                const storeId = game.rows[0].store_id;

                console.log(`Inserting fake JP snapshot for Game ID ${gameId} (${storeId})...`);

                await pool.query(`
                INSERT INTO snapshots (game_id, country_code, rank_free, captured_at)
                VALUES ($1, 'JP', 99, NOW())
            `, [gameId]);

                console.log("Insert successful! Run the check again.");
            } else {
                console.log("No games found in DB to attach snapshot to.");
            }
        } else {
            console.log("JP Data exists! Here is a sample:");
            console.log(jpCheck.rows[0]);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
})();
