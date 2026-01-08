/**
 * Auto-Tag Subgenres using LLM (Gemini/OpenAI)
 * 
 * Usage: node tools/auto_tag_subgenres.js [limit]
 * 
 * Requires: GEMINI_API_KEY or OPENAI_API_KEY in environment
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Your taxonomy - edit this to match your classification system
const SUBGENRE_TAXONOMY = {
    'Action': ['Shooter', 'Beat-em-up', 'Platformer', 'Battle Royale', 'Fighting', 'Survival', 'Action RPG'],
    'Adventure': ['Point-and-Click', 'Visual Novel', 'Walking Simulator', 'Metroidvania', 'Open World'],
    'Arcade': ['Endless Runner', 'Retro', 'Emulator', 'Hypercasual'],
    'Board': ['Mahjong', 'Bingo', 'Chess', 'Classic Board'],
    'Card': ['Card Game', 'Solitaire', 'Poker', 'Deckbuilder', 'TCG'],
    'Casino': ['Slots', 'Table Games', 'Social Casino'],
    'Casual': ['Match-3', 'Merge', 'Clicker', 'Idle', 'Hidden Object', 'Decoration'],
    'Educational': ['Kids Learning', 'Language', 'Brain Training'],
    'Music': ['Rhythm', 'Music Creation'],
    'Puzzle': ['Match-3', 'Jigsaw', 'Logic', 'Physics', 'Escape Room', 'Solitaire', 'Word'],
    'Racing': ['Arcade Racing', 'Simulation Racing', 'Endless Racing'],
    'Role Playing': ['JRPG', 'ARPG', 'Roguelike', 'Gacha RPG', 'MMORPG', 'Idle RPG', 'Turn-based RPG'],
    'Simulation': ['Life Sim', 'Farming', 'Tycoon', 'Building', 'Vehicle Sim', 'Dating Sim'],
    'Sports': ['Soccer', 'Basketball', 'Golf', 'Pool/Billiards', 'Manager'],
    'Strategy': ['Tower Defense', '4X', 'RTS', 'Turn-based Strategy', 'Conquest', 'City Builder'],
    'Trivia': ['Quiz', 'Party Game']
};

const csvPath = path.join(__dirname, '..', 'data', 'subgenres.csv');
const suggestionsPath = path.join(__dirname, '..', 'data', 'subgenres_suggestions.csv');

async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not set. Set it in your environment.');
        process.exit(1);
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
            })
        }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text.trim();
    }
    return 'Unknown';
}

async function autoTagSubgenres(limit = 50) {
    console.log('🤖 Auto-Tagger: Starting...');

    if (!fs.existsSync(csvPath)) {
        console.error('❌ subgenres.csv not found.');
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const missing = records.filter(r => !r.subgenre || r.subgenre === 'TBD');
    const toProcess = missing.slice(0, limit);

    console.log(`📊 Found ${missing.length} games needing tags. Processing ${toProcess.length}...`);

    const suggestions = [];

    for (let i = 0; i < toProcess.length; i++) {
        const game = toProcess[i];
        const genre = game.genre || 'Unknown';
        const possibleSubgenres = SUBGENRE_TAXONOMY[genre] || ['General'];

        const prompt = `You are a mobile game taxonomy expert. 
Given this game: "${game.name}"
Genre: ${genre}
Possible subgenres for this genre: ${possibleSubgenres.join(', ')}

What is the most likely subgenre? Return ONLY the subgenre name, nothing else.
If unsure, return "General".`;

        try {
            const suggested = await callGemini(prompt);
            suggestions.push({
                store_id: game.store_id,
                name: game.name,
                genre: genre,
                suggested_subgenre: suggested,
                approved: 'false'
            });
            process.stdout.write(`\r  [${i + 1}/${toProcess.length}] ${game.name.substring(0, 30)}... → ${suggested}`);
        } catch (err) {
            console.error(`\n⚠️ Error for ${game.name}: ${err.message}`);
            suggestions.push({
                store_id: game.store_id,
                name: game.name,
                genre: genre,
                suggested_subgenre: 'Error',
                approved: 'false'
            });
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    console.log('\n');

    // Save suggestions
    const csvOutput = stringify(suggestions, { header: true });
    fs.writeFileSync(suggestionsPath, csvOutput);
    console.log(`✅ Saved ${suggestions.length} suggestions to: data/subgenres_suggestions.csv`);
    console.log('👉 Next step: Open tools/review_subgenres.html to approve/edit suggestions.');
}

const limit = parseInt(process.argv[2]) || 50;
autoTagSubgenres(limit);
