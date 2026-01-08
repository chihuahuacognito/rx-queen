/**
 * Import Subgenres to Database
 * 
 * Reads the approved subgenres CSV and updates the games table.
 * 
 * Usage: node tools/import_subgenres.js [csv_path]
 * Default: data/subgenres_approved.csv
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('csv-parse/sync');

const connectionString = 'postgresql://postgres:admin123@localhost:5432/gaming_insights';
const pool = new Pool({ connectionString });

async function importSubgenres(csvPath) {
    console.log('📥 Import Subgenres: Starting...');

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ File not found: ${csvPath}`);
        console.log('Run the auto-tagger and review tool first, then export the approved CSV.');
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    console.log(`📊 Found ${records.length} records to import.`);

    const client = await pool.connect();
    let updated = 0;
    let notFound = 0;

    try {
        await client.query('BEGIN');

        for (const record of records) {
            const result = await client.query(`
                UPDATE games 
                SET subgenre = $1 
                WHERE store_id = $2
                RETURNING id
            `, [record.subgenre, record.store_id]);

            if (result.rowCount > 0) {
                updated++;
            } else {
                notFound++;
            }
        }

        await client.query('COMMIT');
        console.log(`✅ Import complete!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Not found in DB: ${notFound}`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}

const csvPath = process.argv[2] || path.join(__dirname, '..', 'data', 'subgenres_approved.csv');
importSubgenres(csvPath);
