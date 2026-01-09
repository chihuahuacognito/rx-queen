/**
 * Test: Rank Accuracy Verification
 * Sprint 3.2.QA
 * 
 * Validates that the daily_trends view correctly calculates rank_change
 * by comparing it against raw snapshot data.
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.fakdvsdjraxwxpidpbhz:QIoZLh3xkrcvUG@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
});

async function verifyRankMath() {
    console.log("TEST START: Rank Accuracy Verification (Supabase)");
    console.log("=".repeat(60));

    let allPassed = true;

    try {
        console.log("\nConnecting to DB...");
        await pool.query('SELECT 1');
        console.log("✅ Connection established.\n");

        // 1. Get 5 games with rank changes from the view
        // We need games where rank_change_free is NOT NULL and NOT 0
        const gamesRes = await pool.query(`
            SELECT game_id, name, country_code, current_rank_free, rank_change_free 
            FROM daily_trends 
            WHERE rank_change_free IS NOT NULL 
            AND rank_change_free != 0
            LIMIT 5
        `);

        const games = gamesRes.rows;
        console.log(`Found ${games.length} games with rank changes to verify.\n`);

        if (games.length === 0) {
            console.warn("⚠️ No games with rank changes found. This could mean:");
            console.warn("   - All games have stable ranks");
            console.warn("   - Only one day of data exists (no 'yesterday' to compare)");
            console.warn("   - View needs to be refreshed");
            return;
        }

        for (const game of games) {
            console.log(`\n📊 Analyzing: ${game.name} (${game.country_code})`);
            console.log(`   Game ID: ${game.game_id}`);

            // 2. Fetch the distinct_daily_snapshots for this game 
            // to understand the day buckets
            const snapshotsRes = await pool.query(`
                SELECT 
                    rank_free, 
                    day_bucket,
                    captured_at
                FROM distinct_daily_snapshots 
                WHERE game_id = $1 AND country_code = $2
                ORDER BY day_bucket DESC 
                LIMIT 2
            `, [game.game_id, game.country_code]);

            const snaps = snapshotsRes.rows;

            if (snaps.length < 2) {
                console.warn(`   ⚠️ Not enough daily data. Found ${snaps.length} day bucket(s).`);
                console.warn("   (Need at least 2 days to calculate change)");
                continue;
            }

            const todaySnap = snaps[0];
            const yesterdaySnap = snaps[1];

            console.log(`   Today (${todaySnap.day_bucket.toISOString().split('T')[0]}): Rank ${todaySnap.rank_free}`);
            console.log(`   Yesterday (${yesterdaySnap.day_bucket.toISOString().split('T')[0]}): Rank ${yesterdaySnap.rank_free}`);

            // 3. Calculate expected change
            // Formula: Yesterday - Today (positive = improved, negative = dropped)
            const calculatedChange = yesterdaySnap.rank_free - todaySnap.rank_free;
            const viewChange = game.rank_change_free;

            console.log(`   Expected Change: ${yesterdaySnap.rank_free} - ${todaySnap.rank_free} = ${calculatedChange}`);
            console.log(`   View Shows: ${viewChange}`);

            if (calculatedChange === viewChange) {
                console.log("   ✅ MATCH: Calculation is correct!");
            } else {
                console.error("   ❌ MISMATCH: View calculation differs from expected.");
                allPassed = false;
            }
        }

        console.log("\n" + "=".repeat(60));
        if (allPassed) {
            console.log("🎉 TEST PASSED: All rank changes verified correctly!");
        } else {
            console.log("❌ TEST FAILED: Some rank calculations did not match.");
        }

    } catch (e) {
        console.error("Error:", e);
        allPassed = false;
    } finally {
        await pool.end();
        console.log("\nTEST END");
        if (!allPassed) process.exit(1);
    }
}

verifyRankMath();
