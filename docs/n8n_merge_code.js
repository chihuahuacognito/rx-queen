// Debugging: Log what we received
console.log("Input Item:", items[0]);

const fs = require('fs');
const merged = {};

// Ensure stdout exists
if (!items[0].json || !items[0].json.stdout) {
    throw new Error("No stdout received from Scraper Node. Did it run successfully?");
}

const filePath = items[0].json.stdout.trim();
console.log("Looking for file at:", filePath);

// Check if file exists (requires $env:NODE_FUNCTION_ALLOW_BUILTIN="*")
try {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Scrape file not found at path: '${filePath}' Check permissions or path.`);
    }

    // Read the big file directly
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const rawData = JSON.parse(fileContent);

    // Process Data
    rawData.forEach(item => {
        const id = item.appId;
        const country = item.country || 'US';
        if (!id) return;

        const key = `${id}_${country}`;

        if (!merged[key]) {
            merged[key] = {
                store_id: item.appId,
                name: item.title,
                publisher: item.developer,
                genre: item.genre || 'Unknown',
                icon_url: item.icon,
                store_url: item.url,
                country_code: country,
                rank_free: null,
                rank_paid: null,
                rank_grossing: null,
                rating: item.score || 0,
                price: item.price || 0,
                captured_at: item.fetchedAt,
                last_updated: item.updated || null,
                current_version: item.version || null,
                recent_changes: item.recentChanges || null
            };
        }

        if (item.collection === 'TOP_FREE') merged[key].rank_free = item.rank;
        if (item.collection === 'TOP_PAID') merged[key].rank_paid = item.rank;
        if (item.collection === 'GROSSING' || item.collection === 'TOP_GROSSING') merged[key].rank_grossing = item.rank;
    });

    return Object.values(merged).map(i => ({ json: i }));

} catch (err) {
    throw new Error(`File System Error: ${err.message}. Ensure n8n is started with: $env:NODE_FUNCTION_ALLOW_BUILTIN="*"`);
}
