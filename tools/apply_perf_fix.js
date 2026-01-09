require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const POOL_CONFIG = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
};

async function applyIndices() {
    console.log("🚀 Applying Performance Indices to Supabase...");
    const pool = new Pool(POOL_CONFIG);

    try {
        const sqlPath = path.join(__dirname, '..', 'db', 'migration_perf_indices.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Reading SQL...");
        // Split by semicolon? No, usually fine to run block if simple.

        console.log("Executing...");
        const start = performance.now();
        await pool.query(sql);
        const duration = performance.now() - start;

        console.log(`✅ Indices Applied successfully in ${duration.toFixed(0)}ms.`);

    } catch (err) {
        console.error("❌ Error applying indices:", err.message);
    } finally {
        await pool.end();
    }
}

applyIndices();
