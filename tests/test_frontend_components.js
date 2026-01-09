const fs = require('fs');
const path = require('path');

console.log("TEST START: Frontend Component Verification");

const baseDir = path.join(__dirname, '..', 'dashboard', 'app');

const expectedComponents = [
    'components/ChartFilters.tsx',
    'components/ChartHeader.tsx',
    'components/ChartList.tsx',
    'components/ChartRow.tsx',
    'components/CountrySelector.tsx',
    'components/GameCard.tsx',
    // Sprint 3.1 Components (Expected to be missing)
    'components/pulse/PulseGrid.tsx',
    'components/pulse/MoverCard.tsx',
    'components/pulse/StatsCard.tsx',
    'components/pulse/PowerList.tsx'
];

let missingSprint3 = [];
let missingCore = [];

expectedComponents.forEach(comp => {
    const fullPath = path.join(baseDir, comp);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Found: ${comp}`);
    } else {
        if (comp.includes('pulse')) {
            missingSprint3.push(comp);
            console.warn(`⚠️ Missing (Sprint 3.1): ${comp}`);
        } else {
            missingCore.push(comp);
            console.error(`❌ Missing (Core): ${comp}`);
        }
    }
});

if (missingCore.length > 0) {
    console.error(`\nFE-04 FAIL: Missing ${missingCore.length} CORE components.`);
    process.exit(1);
} else {
    console.log("\nFE-04 PASS: All Core components present.");
}

if (missingSprint3.length > 0) {
    console.log(`\nNOTE: ${missingSprint3.length} Sprint 3.1 components are not yet implemented (Expected).`);
}

console.log("TEST END");
