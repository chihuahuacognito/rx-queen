const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: 'postgresql://postgres:admin123@localhost:5432/gaming_insights' });

(async () => {
    try {
        console.log("🛠️ Running Database Migration (Sprint 3.1)...");
        const sqlPath = path.join(__dirname, 'db', 'migration_subgenre.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log("✅ Migration applied successfully!");

    } catch (e) {
        console.error("❌ Migration failed:", e.message);
    } finally {
        pool.end();
    }
})();
