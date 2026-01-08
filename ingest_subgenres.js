const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const pool = new Pool({ connectionString: 'postgresql://postgres:admin123@localhost:5432/gaming_insights' });
const CSV_FILE = path.join(__dirname, 'data', 'subgenres_enriched.csv');

(async () => {
    try {
        console.log("🚀 Starting Subgenre Backfill...");

        if (!fs.existsSync(CSV_FILE)) {
            throw new Error(`CSV file not found: ${CSV_FILE}`);
        }

        const content = fs.readFileSync(CSV_FILE, 'utf8');
        const records = parse(content, { columns: true });

        console.log(`📊 Found ${records.length} records to process.`);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let updatedCount = 0;
            let skippedCount = 0;

            for (const row of records) {
                const { store_id, subgenre } = row;

                // Only update if subgenre is not TBD/empty
                if (!subgenre || subgenre === 'TBD') {
                    skippedCount++;
                    continue;
                }

                const res = await client.query(`
                    UPDATE games 
                    SET subgenre = $1 
                    WHERE store_id = $2
                `, [subgenre, store_id]);

                if (res.rowCount > 0) updatedCount++;

                if (updatedCount % 100 === 0) process.stdout.write('.');
            }

            await client.query('COMMIT');
            console.log("\n✅ Ingestion Complete!");
            console.log(`   Updated Games: ${updatedCount}`);
            console.log(`   Skipped (TBD): ${skippedCount}`);

        } catch (dbErr) {
            await client.query('ROLLBACK');
            console.error("\n❌ Transaction Failed:", dbErr.message);
        } finally {
            client.release();
        }

    } catch (e) {
        console.error("🔥 Error:", e.message);
    } finally {
        pool.end();
    }
})();
