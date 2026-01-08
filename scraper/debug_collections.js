const gplay = require('google-play-scraper').default || require('google-play-scraper');

(async () => {
    const country = 'US';
    console.log(`🔍 Testing Collections for ${country}...`);

    // 1. Test TOP_GROSSING
    try {
        console.log("\nAttempting TOP_GROSSING...");
        const grossing = await gplay.list({
            category: gplay.category.GAME,
            collection: gplay.collection.GROSSING, // accurately GROSSING
            num: 5,
            country: country
        });
        console.log(`✅ GROSSING returned ${grossing.length} items.`);
        if (grossing.length > 0) console.log(grossing[0]);
    } catch (e) {
        console.log(`❌ GROSSING failed: ${e.message}`);
    }

    // 2. Test TRENDING / NEW (Potential "Featured")
    // Note: google-play-scraper has TOP_FREE, TOP_PAID, GROSSING.
    // Let's check NEW_FREE and NEW_PAID if they exist in the enum, or just try them.

    const collectionsToTest = ['NEW_FREE', 'NEW_PAID', 'TRENDING'];

    for (const colName of collectionsToTest) {
        try {
            const col = gplay.collection[colName];
            if (!col) {
                console.log(`\n⚠️ Collection ${colName} is not defined in the library constants.`);
                continue;
            }
            console.log(`\nAttempting ${colName}...`);
            const results = await gplay.list({
                category: gplay.category.GAME,
                collection: col,
                num: 5,
                country: country
            });
            console.log(`✅ ${colName} returned ${results.length} items.`);
            if (results.length > 0) console.log(results[0]);
        } catch (e) {
            console.log(`❌ ${colName} failed: ${e.message}`);
        }
    }

})();
