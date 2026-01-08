/**
 * List Missing Subgenres
 * Shows games that need subgenre tagging (TBD or null)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(__dirname, '..', 'data', 'subgenres.csv');

function listMissingSubgenres() {
    if (!fs.existsSync(csvPath)) {
        console.error('❌ subgenres.csv not found. Run scraper first.');
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const missing = records.filter(r => !r.subgenre || r.subgenre === 'TBD');
    const tagged = records.filter(r => r.subgenre && r.subgenre !== 'TBD');

    console.log('📊 Subgenre Tagging Status');
    console.log('==========================');
    console.log(`Total Games: ${records.length}`);
    console.log(`✅ Tagged: ${tagged.length}`);
    console.log(`❌ Missing (TBD): ${missing.length}`);
    console.log('');

    // Group missing by genre
    const byGenre = {};
    missing.forEach(g => {
        if (!byGenre[g.genre]) byGenre[g.genre] = [];
        byGenre[g.genre].push(g);
    });

    console.log('Missing by Genre:');
    Object.keys(byGenre).sort().forEach(genre => {
        console.log(`  ${genre}: ${byGenre[genre].length} games`);
    });

    console.log('');
    console.log('Sample TBD Games (First 10):');
    missing.slice(0, 10).forEach((g, i) => {
        console.log(`  ${i + 1}. ${g.name} (${g.genre})`);
    });

    // Write missing list to file
    const missingPath = path.join(__dirname, '..', 'data', 'subgenres_missing.json');
    fs.writeFileSync(missingPath, JSON.stringify(missing, null, 2));
    console.log(`\n📁 Full list saved to: data/subgenres_missing.json`);
}

listMissingSubgenres();
