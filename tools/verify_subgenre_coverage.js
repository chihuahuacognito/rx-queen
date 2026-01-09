/**
 * Verify games missing subgenres and send notification
 * 
 * Usage: node tools/verify_subgenre_coverage.js
 * Requires: SUPABASE_URL, NTFY_TOPIC env vars
 */

const { Pool } = require('pg');

const connectionString = process.env.SUPABASE_URL;
const ntfyTopic = process.env.NTFY_TOPIC;

if (!connectionString) {
    console.error('❌ SUPABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function verifySubgenreCoverage() {
    try {
        // Count games missing subgenre
        const result = await pool.query(`
            SELECT COUNT(*) as missing_count
            FROM games 
            WHERE subgenre IS NULL OR subgenre = ''
        `);

        const missingCount = parseInt(result.rows[0].missing_count);
        console.log(`📊 Games missing subgenre: ${missingCount}`);

        // Get total game count
        const totalResult = await pool.query(`SELECT COUNT(*) as total FROM games`);
        const totalCount = parseInt(totalResult.rows[0].total);

        // Output for GitHub Actions
        console.log(`MISSING_COUNT=${missingCount}`);
        console.log(`TOTAL_COUNT=${totalCount}`);

        // Send notification if there are missing subgenres
        if (ntfyTopic && missingCount > 0) {
            const message = `🏷️ ${missingCount} games need subgenre tagging (${totalCount} total tracked)`;

            await fetch(`https://ntfy.sh/${ntfyTopic}`, {
                method: 'POST',
                headers: {
                    'Title': 'Rx Queen: Tagging Needed',
                    'Priority': missingCount > 50 ? 'high' : 'default',
                    'Tags': 'label,warning'
                },
                body: message
            });

            console.log('✅ Notification sent');
        } else if (missingCount === 0) {
            console.log('✅ All games have subgenres!');
        }

        return missingCount;

    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    } finally {
        pool.end();
    }
}

verifySubgenreCoverage();
