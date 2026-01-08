const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = process.argv[2];

if (!WORKFLOW_FILE) {
    console.error("Usage: node n8n_debugger.js <path_to_workflow.json>");
    process.exit(1);
}

const absolutePath = path.resolve(WORKFLOW_FILE);

console.log(`\n🕵️  Analyzing n8n Workflow: ${path.basename(absolutePath)}`);
console.log(`    Path: ${absolutePath}\n`);

if (!fs.existsSync(absolutePath)) {
    console.error(`❌ File not found: ${absolutePath}`);
    process.exit(1);
}

let workflow;
try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    workflow = JSON.parse(content);
} catch (e) {
    console.error(`❌ Failed to parse JSON: ${e.message}`);
    process.exit(1);
}

const nodes = workflow.nodes || [];
let issuesFound = 0;

console.log(`🔍 Scanning ${nodes.length} nodes...\n`);

nodes.forEach(node => {
    // Check 1: Execute Command Nodes
    if (node.type === 'n8n-nodes-base.executeCommand') {
        const command = node.parameters?.command || "";
        console.log(`[Execute Command] "${node.name}":`);

        // Extract potential file paths (simple regex for absolute paths starting with drive letter)
        const pathRegex = /[a-zA-Z]:\\[^"'\n\r\t]+\.[a-zA-Z0-9]+/g;
        const matches = command.match(pathRegex);

        if (matches) {
            matches.forEach(matchedPath => {
                // Check if path exists
                if (fs.existsSync(matchedPath)) {
                    console.log(`   ✅ Path exists: ${matchedPath}`);
                } else {
                    // Try to see if it's just a quoting issue (path with spaces?)
                    // If the match was partial because of a space, the full path might exist but we missed it.
                    // But simpler check:
                    console.log(`   ⚠️  Path might be invalid or unreachable: ${matchedPath}`);
                    issuesFound++;
                }

                // Check for Space Safety (Quoting)
                // If path has spaces and is NOT surrounded by quotes in the command string...
                const quotedRegex = new RegExp(`["']${matchedPath.replace(/\\/g, '\\\\')}["']`);
                if (matchedPath.includes(' ') && !command.match(quotedRegex)) {
                    console.log(`   ❌  CRITICAL: Path contains spaces but is not quoted!`);
                    console.log(`       Fix: "${matchedPath}"`);
                    issuesFound++;
                }
            });
        } else {
            console.log(`   ℹ️  No absolute file paths detected in command.`);
        }
    }

    // Check 2: Postgres Nodes
    if (node.type === 'n8n-nodes-base.postgres') {
        // console.log(`[Postgres] "${node.name}":`);
        const operation = node.parameters?.operation;

        if (operation === 'upsert') {
            console.log(`[Postgres] "${node.name}":`);
            console.log(`   ⚠️  Warning: using 'upsert' operation.`);
            console.log(`       This is known to be flaky/unsupported in some n8n versions.`);
            console.log(`       Recommendation: Use 'executeQuery' with raw SQL INSERT ... ON CONFLICT.`);
            issuesFound++;
        }
    }

    // Check 3: Google Play Scraper Specifics (Heuristic)
    if (node.name.toLowerCase().includes('google') || node.name.toLowerCase().includes('fetch')) {
        const command = node.parameters?.command || "";
        if (command.includes('node ') && !command.includes('node.exe') && !command.includes('node"')) {
            // Check if 'node' is globally available isn't easy here without running it, 
            // but we can warn if they rely on PATH which might fail in some n8n environments (e.g. Docker vs Native).
            // console.log(`   ℹ️  Relies on global 'node' executable.`);
        }
    }
});

console.log(`\n---------------------------------------------------`);
if (issuesFound === 0) {
    console.log(`✅ No obvious configuration bugs found! Good job.`);
} else {
    console.log(`❌ Found ${issuesFound} potential issues.`);
    console.log(`   Please review the warnings above.`);
}
console.log(`---------------------------------------------------\n`);
