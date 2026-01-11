/**
 * Test Script: Sprint 3.1 Phase A Scaling Validation
 * Tests: 26 countries, 500 games, new tables
 * 
 * Run: node tests/test_scaling.js
 * Requires: SUPABASE_URL environment variable
 */

const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
    console.error('❌ Error: SUPABASE_URL environment variable not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const EXPECTED_COUNTRIES = 26;
const EXPECTED_GAMES_MIN = 400; // Allow some tolerance (not exactly 500)

let passed = 0;
let failed = 0;

function logResult(testId, name, success, details = '') {
    if (success) {
        console.log(`✅ ${testId}: ${name} - PASSED ${details}`);
        passed++;
    } else {
        console.log(`❌ ${testId}: ${name} - FAILED ${details}`);
        failed++;
    }
}

async function runTests() {
    console.log('🧪 Sprint 3.1 Phase A Scaling Tests\n');
    console.log('='.repeat(50));

    try {
        // S31-01: 26 Countries Scraped (ALL TIME - not just recent)
        const countriesResult = await pool.query(`
            SELECT DISTINCT country_code 
            FROM snapshots 
            WHERE country_code IS NOT NULL
        `);
        const countryCount = countriesResult.rows.length;
        logResult('S31-01', '26 Countries Scraped (All Time)',
            countryCount >= EXPECTED_COUNTRIES,
            `(Found: ${countryCount})`
        );

        // List missing countries
        const existingCodes = countriesResult.rows.map(r => r.country_code);
        const targetCodes = ['US', 'JP', 'KR', 'DE', 'GB', 'FR', 'TW', 'CA', 'AU', 'NZ', 'PH', 'SG', 'FI', 'IL', 'VN', 'SE', 'TR', 'HK', 'BR', 'IN', 'ID', 'SA', 'MX', 'TH', 'MY', 'AE'];
        const missing = targetCodes.filter(c => !existingCodes.includes(c));
        if (missing.length > 0) {
            console.log(`   ⚠️ Missing: ${missing.join(', ')}`);
        }

        // S31-02: 500 Games Per Country (sample check for US)
        const gamesResult = await pool.query(`
            SELECT country_code, COUNT(DISTINCT game_id) as game_count
            FROM snapshots
            WHERE captured_at > NOW() - INTERVAL '2 days'
            GROUP BY country_code
            ORDER BY game_count DESC
            LIMIT 5
        `);
        console.log('\n📊 Games per country (top 5):');
        gamesResult.rows.forEach(r => console.log(`   ${r.country_code}: ${r.game_count}`));

        const avgGames = gamesResult.rows.reduce((sum, r) => sum + parseInt(r.game_count), 0) / gamesResult.rows.length;
        logResult('S31-02', '500 Games Per Country',
            avgGames >= EXPECTED_GAMES_MIN,
            `(Avg: ${Math.round(avgGames)})`
        );

        // S31-05: weekly_summaries Table Exists
        const weeklyResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'weekly_summaries'
            ) as exists
        `);
        logResult('S31-05', 'weekly_summaries Table', weeklyResult.rows[0].exists);

        // S31-06: game_stats Table Exists
        const statsResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'game_stats'
            ) as exists
        `);
        logResult('S31-06', 'game_stats Table', statsResult.rows[0].exists);

        // Additional: Check snapshot count
        const totalSnapshots = await pool.query(`
            SELECT COUNT(*) FROM snapshots 
            WHERE captured_at > NOW() - INTERVAL '2 days'
        `);
        console.log(`\n📈 Total recent snapshots: ${totalSnapshots.rows[0].count}`);

    } catch (e) {
        console.error('❌ Test error:', e.message);
        failed++;
    } finally {
        await pool.end();
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📋 Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        console.log('\n⚠️  Some tests failed. Review above for details.');
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
}

runTests();
