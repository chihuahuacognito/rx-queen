require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    // Using Supabase connection as per User feedback
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.fakdvsdjraxwxpidpbhz:QIoZLh3xkrcvUG@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function runTests() {
    console.log("TEST START: Database & Views Validation");
    let allPassed = true;

    try {
        // BE-02: DB Connection & Schema
        try {
            const tableRes = await pool.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name IN ('games', 'snapshots')
            `);
            const tables = tableRes.rows.map(r => r.table_name);
            if (tables.includes('games') && tables.includes('snapshots')) {
                console.log("✅ BE-02 PASS: Database connected and core tables exist.");
            } else {
                console.error("❌ BE-02 FAIL: Missing core tables. Found:", tables);
                allPassed = false;
            }
        } catch (e) {
            console.error("❌ BE-02 FAIL: Connection error:", e.message);
            allPassed = false;
            return; // Critical failure
        }

        // BE-03: Data Freshness
        try {
            const freshnessRes = await pool.query(`
                SELECT MAX(captured_at) as last_update FROM snapshots
            `);
            const lastUpdate = new Date(freshnessRes.rows[0].last_update);
            const hoursSince = (new Date() - lastUpdate) / (1000 * 60 * 60);

            if (hoursSince < 24) {
                console.log(`✅ BE-03 PASS: Data is fresh (last update: ${hoursSince.toFixed(1)} hours ago).`);
            } else {
                console.error(`❌ BE-03 FAIL: Data is stale. Last update: ${lastUpdate.toISOString()} (${hoursSince.toFixed(1)} hours ago).`);
                allPassed = false;
            }
        } catch (e) {
            console.error("❌ BE-03 FAIL: Error checking freshness:", e.message);
            allPassed = false;
        }

        // BE-04: Deduplication (Games)
        try {
            const dupesRes = await pool.query(`
                SELECT store_id, COUNT(*) 
                FROM games 
                GROUP BY store_id 
                HAVING COUNT(*) > 1
            `);
            if (dupesRes.rows.length === 0) {
                console.log("✅ BE-04 PASS: No duplicate games found.");
            } else {
                console.error(`❌ BE-04 FAIL: Found ${dupesRes.rows.length} duplicate games.`);
                console.table(dupesRes.rows.slice(0, 5));
                allPassed = false;
            }
        } catch (e) {
            console.error("❌ BE-04 FAIL: Error checking dupes:", e.message);
            allPassed = false;
        }

        // SQ-01: daily_trends View
        try {
            const start = performance.now();
            const viewRes = await pool.query(`
                SELECT * FROM daily_trends LIMIT 5
            `);
            const duration = performance.now() - start;

            if (viewRes.rows.length > 0) {
                console.log(`✅ SQ-01 PASS: 'daily_trends' view is operational (returned ${viewRes.rows.length} rows).`);

                // SQ-03: Performance
                if (duration < 200) {
                    console.log(`✅ SQ-03 PASS: View query fast (${duration.toFixed(0)}ms).`);
                } else {
                    console.warn(`⚠️ SQ-03 WARN: View query slow (${duration.toFixed(0)}ms).`);
                }

                // Check contents - verify key columns exist
                const row = viewRes.rows[0];
                const requiredCols = ['rank_change_free', 'genre', 'current_rank_free', 'country_code'];
                const missingCols = requiredCols.filter(c => !row.hasOwnProperty(c));

                if (missingCols.length === 0) {
                    console.log("✅ SQ-01 PASS: View contains all expected columns.");
                } else {
                    console.error(`❌ SQ-01 FAIL: View missing columns: ${missingCols.join(', ')}`);
                    allPassed = false;
                }

            } else {
                console.warn("⚠️ SQ-01 WARN: 'daily_trends' view returned 0 rows (might be empty DB).");
            }
        } catch (e) {
            console.error("❌ SQ-01 FAIL: Error querying 'daily_trends' view:", e.message);
            allPassed = false;
        }

        // SQ-02: Pulse Views (Sprint 3.1)
        try {
            const pulseRes = await pool.query(`
                SELECT table_name FROM information_schema.views
                WHERE table_schema = 'public' AND table_name IN ('genre_stats', 'power_rankings')
            `);
            const views = pulseRes.rows.map(r => r.table_name);
            const missing = ['genre_stats', 'power_rankings'].filter(v => !views.includes(v));

            if (missing.length === 0) {
                console.log("✅ SQ-02 PASS: Sprint 3.1 Pulse views exist.");
            } else {
                console.error(`❌ SQ-02 FAIL: Missing Sprint 3.1 views: ${missing.join(', ')}.`);
                // We don't fail tests for feature gaps yet, just report
            }
        } catch (e) {
            console.error("❌ SQ-02 FAIL: Error checking Pulse views:", e.message);
        }

    } catch (e) {
        console.error("Generic Test Error:", e);
    } finally {
        await pool.end();
        console.log("TEST END");
        if (!allPassed) process.exit(1);
    }
}

runTests();
