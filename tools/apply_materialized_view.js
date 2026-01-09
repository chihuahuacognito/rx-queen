/**
 * Apply Materialized View Migration to Supabase
 * Sprint 3.2.QA - Performance Fix
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const POOL_CONFIG = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
};

async function applyMigration() {
    console.log("🚀 Sprint 3.2.QA: Applying Materialized View Migration...\n");
    const pool = new Pool(POOL_CONFIG);

    try {
        // Step 1: Read and apply main migration
        const sqlPath = path.join(__dirname, '..', 'db', 'migration_materialized_trends.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("📜 Reading migration file...");
        console.log("⏳ Executing (this may take 30-60 seconds)...\n");

        const start = performance.now();
        await pool.query(sql);
        const duration = performance.now() - start;

        console.log(`✅ Migration applied in ${(duration / 1000).toFixed(1)} seconds.\n`);

        // Step 2: Verify the materialized view exists
        console.log("🔍 Verifying materialized view...");
        const checkRes = await pool.query(`
            SELECT matviewname FROM pg_matviews WHERE matviewname = 'daily_trends'
        `);

        if (checkRes.rows.length > 0) {
            console.log("✅ Materialized view 'daily_trends' exists.\n");
        } else {
            console.error("❌ Materialized view not found!");
            process.exit(1);
        }

        // Step 3: Count rows
        console.log("📊 Counting rows...");
        const countStart = performance.now();
        const countRes = await pool.query(`SELECT COUNT(*) as cnt FROM daily_trends`);
        const countDuration = performance.now() - countStart;

        console.log(`✅ Row count: ${countRes.rows[0].cnt} (query took ${countDuration.toFixed(0)}ms)\n`);

        // Step 4: Test query speed
        console.log("⚡ Testing query performance...");
        const queryStart = performance.now();
        await pool.query(`SELECT * FROM daily_trends WHERE country_code = 'US' LIMIT 10`);
        const queryDuration = performance.now() - queryStart;

        if (queryDuration < 2000) {
            console.log(`✅ Query time: ${queryDuration.toFixed(0)}ms (PASS: < 2000ms)\n`);
        } else {
            console.warn(`⚠️ Query time: ${queryDuration.toFixed(0)}ms (Target: < 2000ms)\n`);
        }

        console.log("🎉 Migration Complete!");
        console.log("   Next: Update ingest script with REFRESH logic.");

    } catch (err) {
        console.error("❌ Migration Error:", err.message);
        if (err.message.includes('already exists')) {
            console.log("\n💡 Hint: The materialized view may already exist. Try dropping it first:");
            console.log("   DROP MATERIALIZED VIEW IF EXISTS daily_trends;");
        }
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applyMigration();
