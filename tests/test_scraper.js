const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("TEST START: BE-01 Scraper Execution");

// Run scraper for US, limit 1 to save time/bandwidth
// We must run inside 'scraper' dir so it finds node_modules there
const cmd = 'node google_play_fetch.js us 1';
const scraperDir = path.join(__dirname, '..', 'scraper');

exec(cmd, { cwd: scraperDir }, (error, stdout, stderr) => {
    if (error) {
        console.error(`TEST FAIL: Scraper exited with error: ${error.message}`);
        console.error(stderr);
        process.exit(1);
    }

    // stdout should contain the filepath
    const outputLine = stdout.trim().split('\n').pop().trim();
    console.log(`Scraper Output Path: ${outputLine}`);

    if (!fs.existsSync(outputLine)) {
        console.error(`TEST FAIL: Output file does not exist: ${outputLine}`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(outputLine, 'utf8');
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
            console.error("TEST FAIL: Output is not an array");
            process.exit(1);
        }

        if (data.length === 0) {
            console.error("TEST FAIL: Output array is empty");
            process.exit(1);
        }

        const firstItem = data[0];
        if (!firstItem.appId || !firstItem.title) {
            console.error("TEST FAIL: Item missing required fields (appId, title)");
            console.log("Item:", firstItem);
            process.exit(1);
        }

        console.log("TEST PASS: Scraper fetched data successfully.");
        console.log(`Fetched ${data.length} items. Sample: ${firstItem.title}`);

        // Cleanup
        fs.unlinkSync(outputLine);
        console.log("Cleanup: Deleted temp file.");

    } catch (e) {
        console.error(`TEST FAIL: Error reading/parsing output file: ${e.message}`);
        process.exit(1);
    }
});
