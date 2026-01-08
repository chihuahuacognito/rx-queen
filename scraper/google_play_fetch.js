const gplay = require('google-play-scraper').default || require('google-play-scraper');

(async () => {
    // Arguments: 
    // node script.js [country_code_or_ALL] [limit]
    // Example: node script.js us 200
    // Example: node script.js ALL 200

    const argCountry = process.argv[2] || 'us';
    const limit = parseInt(process.argv[3]) || 200;

    // Define target countries
    let countries = [];
    if (argCountry.toUpperCase() === 'ALL') {
        countries = ['us', 'gb', 'ca', 'de', 'jp', 'br', 'in'];
    } else {
        countries = [argCountry];
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
