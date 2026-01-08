const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'data', 'all_games.json');
const outputPath = path.join(__dirname, 'data', 'subgenres.csv');

if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
let games;
try {
    games = JSON.parse(raw);
} catch (e) {
    console.error('Failed to parse JSON:', e);
    process.exit(1);
}

function inferSubgenre(game) {
    const name = game.name.toLowerCase();
    const genre = game.genre.toLowerCase();
    // Action heuristics
    if (genre === 'action') {
        if (/shooter|sniper|call of duty|fortnite|pubg|battle|war|gun|shoot|kill|combat/.test(name)) return 'Shooter';
        if (/rpg|role[- ]playing/.test(name)) return 'Action RPG';
        if (/platform/.test(name)) return 'Platformer';
        if (/battle royale/.test(name)) return 'Battle Royale';
    }
    // Puzzle heuristics
    if (genre === 'puzzle') {
        if (/match[- ]?3|candy|tiles/.test(name)) return 'Match-3';
        if (/solitaire/.test(name)) return 'Solitaire';
        if (/word/.test(name)) return 'Word Puzzle';
        if (/jigsaw/.test(name)) return 'Jigsaw';
    }
    // Arcade heuristics
    if (genre === 'arcade') {
        if (/runner/.test(name)) return 'Endless Runner';
        if (/rhythm/.test(name)) return 'Rhythm';
        if (/shoot/.test(name)) return 'Arcade Shooter';
        if (/puzzle/.test(name)) return 'Arcade Puzzle';
    }
    // Strategy heuristics
    if (genre === 'strategy') {
        if (/tower[- ]?defense/.test(name)) return 'Tower Defense';
        if (/simulation/.test(name)) return 'Simulation';
        if (/management/.test(name)) return 'Management';
        if (/card/.test(name)) return 'Card Strategy';
    }
    // Adventure heuristics
    if (genre === 'adventure') {
        if (/rpg|role[- ]playing/.test(name)) return 'RPG';
        if (/open[- ]world/.test(name)) return 'Open World';
        if (/story|narrative/.test(name)) return 'Narrative Adventure';
    }
    // Card heuristics (if separate genre)
    if (genre === 'card') {
        if (/solitaire/.test(name)) return 'Solitaire';
        if (/poker/.test(name)) return 'Poker';
        if (/blackjack/.test(name)) return 'Blackjack';
        return 'Card Game';
    }
    // Default
    return 'TBD';
}

const lines = [];
lines.push('store_id,name,genre,subgenre');
for (const game of games) {
    const sub = inferSubgenre(game);
    // Escape commas in name
    const safeName = '"' + game.name.replace(/"/g, '""') + '"';
    const safeGenre = '"' + game.genre.replace(/"/g, '""') + '"';
    lines.push(`${game.store_id},${safeName},${safeGenre},${sub}`);
}

fs.writeFileSync(outputPath, lines.join('\n'));
console.log('CSV generated at', outputPath);
