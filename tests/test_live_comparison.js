/**
 * Test: Live Store Comparison (LV-01)
 * QA Master Test Plan v2.0
 * 
 * Purpose: Outputs database rankings for comparison with live Google Play Store
 * 
 * Usage:
 *   node tests/test_live_comparison.js [country]
 *   
 * Examples:
 *   node tests/test_live_comparison.js        # Default: US
 *   node tests/test_live_comparison.js GB     # Great Britain
 *   node tests/test_live_comparison.js JP     # Japan
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.fakdvsdjraxwxpidpbhz:QIoZLh3xkrcvUG@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

const COUNTRY = process.argv[2]?.toUpperCase() || 'US';

// Google Play Store URLs by country
const STORE_URLS = {
    'US': 'https://play.google.com/store/games?hl=en_US&gl=US',
    'GB': 'https://play.google.com/store/games?hl=en_GB&gl=GB',
    'JP': 'https://play.google.com/store/games?hl=ja&gl=JP',
    'IN': 'https://play.google.com/store/games?hl=en_IN&gl=IN',
    'DE': 'https://play.google.com/store/games?hl=de&gl=DE',
    'BR': 'https://play.google.com/store/games?hl=pt_BR&gl=BR',
    'CA': 'https://play.google.com/store/games?hl=en_CA&gl=CA'
};

async function getDbRankings() {
    console.log("╔════════════════════════════════════════════════════════════════════╗");
    console.log("║       LIVE STORE VALIDATION TEST (LV-01)                           ║");
    console.log("╚════════════════════════════════════════════════════════════════════╝");
    console.log(`\n📍 Country: ${COUNTRY}`);
    console.log(`📅 Current Time: ${new Date().toISOString()}`);

    try {
        // Get Top 15 Free Games for the specified country
        const res = await pool.query(`
            SELECT 
                name, 
                store_id,
                current_rank_free, 
                rank_change_free,
                last_updated 
            FROM daily_trends 
            WHERE country_code = $1
            AND current_rank_free IS NOT NULL
            AND current_rank_free <= 15
            ORDER BY current_rank_free ASC
        `, [COUNTRY]);

        if (res.rows.length === 0) {
            console.error(`\n❌ No data found for country: ${COUNTRY}`);
            console.log("Available countries: US, GB, JP, IN, DE, BR, CA");
            process.exit(1);
        }

        const lastUpdate = res.rows[0]?.last_updated;
        const hoursSinceUpdate = ((new Date() - new Date(lastUpdate)) / (1000 * 60 * 60)).toFixed(1);

        console.log(`📊 Data Age: ${hoursSinceUpdate} hours old`);
        console.log(`📆 Last Scraped: ${new Date(lastUpdate).toISOString()}\n`);

        console.log("┌──────┬────────────────────────────────────────┬────────────────────────────────────────┐");
        console.log("│ Rank │ Game Name                              │ Store ID                               │");
        console.log("├──────┼────────────────────────────────────────┼────────────────────────────────────────┤");

        res.rows.forEach(g => {
            const rank = String(g.current_rank_free).padStart(4);
            const name = g.name.substring(0, 38).padEnd(38);
            const storeId = g.store_id.substring(0, 38).padEnd(38);
            console.log(`│ ${rank} │ ${name} │ ${storeId} │`);
        });

        console.log("└──────┴────────────────────────────────────────┴────────────────────────────────────────┘");

        // Instructions
        console.log("\n╔════════════════════════════════════════════════════════════════════╗");
        console.log("║  MANUAL VALIDATION STEPS                                           ║");
        console.log("╠════════════════════════════════════════════════════════════════════╣");
        console.log("║  1. Open: " + (STORE_URLS[COUNTRY] || STORE_URLS['US']).padEnd(56) + " ║");
        console.log("║  2. Navigate to 'Top charts' → 'Top free' section                  ║");
        console.log("║  3. Compare positions with the table above                         ║");
        console.log("║  4. Count matches: ≥80% (12/15) = PASS                             ║");
        console.log("╚════════════════════════════════════════════════════════════════════╝");

        console.log("\n📝 Validation Checklist:");
        console.log("   [ ] Opened Google Play Store for " + COUNTRY);
        console.log("   [ ] Found 'Top charts' section");
        console.log("   [ ] Compared Top 10 rankings");
        console.log("   [ ] Counted matching positions: ___/10");
        console.log("   [ ] Result: PASS (≥8) / FAIL (<8)");

        console.log("\n💡 Tip: Minor position swaps (±1-2 ranks) are expected due to");
        console.log("   natural chart movement since last scrape.");

    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

getDbRankings();
