/**
 * Test Script: Security Validation
 * Tests: No hardcoded credentials in codebase
 * 
 * Run: node tests/test_security.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');

// Patterns to search for (old credentials that should NOT exist)
const FORBIDDEN_PATTERNS = [
    'QIoZLh3xkrcvUG',  // Old Supabase password (redacted portion)
    'fakdvsdjraxwxpidpbhz:Q',  // Password in connection string format
];

// Files to skip (gitignored or this file)
const SKIP_PATTERNS = [
    'node_modules',
    '.git',
    'test_security.js',  // This file itself
    '.env',
    '.env.local',
    'check_',  // Local check scripts (gitignored)
    'migrate_to_supabase.js',  // Local migration script (gitignored)
    'resume_migration.js',  // Local migration script (gitignored)
];

function shouldSkip(filePath) {
    return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function searchFile(filePath, pattern) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.includes(pattern);
    } catch (e) {
        return false;
    }
}

function walkDir(dir, callback) {
    if (shouldSkip(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (shouldSkip(filePath)) continue;

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else if (stat.isFile()) {
            callback(filePath);
        }
    }
}

function runTests() {
    console.log('🔒 Security Validation Tests\n');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;
    const violations = [];

    // S31-07: Check for hardcoded credentials
    console.log('\n🔍 Scanning for hardcoded credentials...\n');

    walkDir(PROJECT_ROOT, (filePath) => {
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (searchFile(filePath, pattern)) {
                const relativePath = path.relative(PROJECT_ROOT, filePath);
                violations.push({ file: relativePath, pattern: pattern.substring(0, 10) + '...' });
            }
        }
    });

    if (violations.length === 0) {
        console.log('✅ S31-07: No Hardcoded Credentials - PASSED');
        console.log('   No forbidden patterns found in codebase.');
        passed++;
    } else {
        console.log('❌ S31-07: No Hardcoded Credentials - FAILED');
        console.log('   Found credentials in:');
        violations.forEach(v => console.log(`      - ${v.file}`));
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📋 Results: ${passed} passed, ${failed} failed`);

    if (failed > 0) {
        console.log('\n⚠️  Security issue detected! Remove hardcoded credentials.');
        process.exit(1);
    } else {
        console.log('\n🎉 All security tests passed!');
        process.exit(0);
    }
}

runTests();
