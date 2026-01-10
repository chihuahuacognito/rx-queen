const gplay = require('google-play-scraper').default || require('google-play-scraper');

// Enable throttling to prevent rate limiting (max 10 requests/second)
if (gplay.memoized) {
    gplay.memoized({ throttle: 10 });
}

(async () => {
    // Arguments: 
    // node script.js [country_code_or_ALL] [limit]
    // Example: node script.js us 500
    // Example: node script.js ALL 500

    const argCountry = process.argv[2] || 'us';
    const limit = parseInt(process.argv[3]) || 500;

    // Define target countries (26 total - see docs/country_selection_analysis.md)
    let countries = [];
    if (argCountry.toUpperCase() === 'ALL') {
        countries = [
            // Tier 1: Revenue (7)
            'us', 'jp', 'kr', 'de', 'gb', 'fr', 'tw',
            // Tier 2: Soft Launch (6)
            'ca', 'au', 'nz', 'ph', 'sg', 'fi',
            // Tier 3: Dev Hubs (5)
            'il', 'vn', 'se', 'tr', 'hk',
            // Tier 4: Emerging (4)
            'br', 'in', 'id', 'sa',
            // Additional (4)
            'mx', 'th', 'my', 'ae'
        ];
    } else {
        // Normalize to lowercase (google-play-scraper expects lowercase)
        countries = [argCountry.toLowerCase()];
    }

    const category = 'GAME';
    let allResults = [];

    // console.error(`Starting scrape for: ${countries.join(', ')} with limit ${limit}`);

    for (const country of countries) {
        try {
            // console.error(`Fetching ${country}...`);
            // 1. Fetch Lists
            const [topFree, topPaid, topGrossing] = await Promise.all([
                gplay.list({ category, collection: gplay.collection.TOP_FREE, num: limit, country }),
                gplay.list({ category, collection: gplay.collection.TOP_PAID, num: limit, country }),
                gplay.list({ category, collection: gplay.collection.GROSSING, num: limit, country })
            ]);

            // 2. Helper to attach metadata
            const attachMeta = (items, type) => items.map((i, index) => ({
                ...i,
                rank: index + 1,
                collection: type,
                country: country.toUpperCase(),
                fetchedAt: new Date().toISOString()
            }));

            const rawItems = [
                ...attachMeta(topFree, 'TOP_FREE'),
                ...attachMeta(topPaid, 'TOP_PAID'),
                ...attachMeta(topGrossing, 'TOP_GROSSING')
            ];

            // 3. Deduplicate IDs to minimize fetching
            const uniqueIds = [...new Set(rawItems.map(i => i.appId))];
            console.error(`    Found ${uniqueIds.length} unique games. Fetching details...`);

            // 4. Batch Fetch Details (Chunks of 10)
            const detailsMap = {};
            const chunkSize = 10;

            for (let i = 0; i < uniqueIds.length; i += chunkSize) {
                const chunk = uniqueIds.slice(i, i + chunkSize);
                const promises = chunk.map(id =>
                    gplay.app({ appId: id, country })
                        .catch(e => ({ appId: id, genre: 'Unknown' })) // Fallback on error
                );

                const results = await Promise.all(promises);
                results.forEach(r => {
                    if (r.appId) detailsMap[r.appId] = r;
                });

                // Small delay to be polite
                if (i % 50 === 0) await new Promise(res => setTimeout(res, 500));
            }

            // 5. Merge Details back into items
            const enrichedItems = rawItems.map(item => {
                const details = detailsMap[item.appId] || {};
                return {
                    ...item,
                    genre: details.genre || 'Unknown',
                    updated: details.updated ? new Date(details.updated).toISOString() : null, // Convert timestamp to ISO
                    version: details.version || null,
                    recentChanges: details.recentChanges || null
                };
            });

            allResults.push(...enrichedItems);

        } catch (error) {
            console.error(`Error fetching ${country}: ${error.message}`);
            // Continue to next country even if one fails
        }
    }

    // Instead of logging massive JSON to stdout, write to a file
    const fs = require('fs');
    const path = require('path');

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const filename = `scrape_result_${Date.now()}.json`;
    const filePath = path.join(dataDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(allResults));

    // Output only the filepath so n8n can pick it up
    console.log(filePath);

})();
