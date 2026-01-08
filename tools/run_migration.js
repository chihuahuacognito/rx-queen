require('dotenv').config({ path: 'dashboard/.env.local' }); // Load env from dashboard
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gaming_insights',
});

async function run() {
    const sqlPath = process.argv[2];
    if (!sqlPath) {
        console.error("Please provide SQL file path");
        process.exit(1);
    }

    console.log(`Running migration: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await pool.query(sql);
        console.log("✅ Migration Success!");
    } catch (e) {
        console.error("❌ Migration Failed:", e);
    } finally {
        await pool.end();
    }
}

run();
