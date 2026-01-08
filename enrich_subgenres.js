/**
 * enrich_subgenres.js - Thorough Subgenre Classification
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const INPUT = path.join(__dirname, 'data', 'subgenres.csv');
const OUTPUT = path.join(__dirname, 'data', 'subgenres_enriched.csv');
const GAMES_JSON = path.join(__dirname, 'data', 'all_games.json');

// Load full game data to get publisher
const allGames = JSON.parse(fs.readFileSync(GAMES_JSON, 'utf8'));
const gameMeta = {};
allGames.forEach(g => { gameMeta[g.store_id] = g; });

const allCategories = {
    // Action sub-categories
    'Battle Royale': ['fortnite', 'free fire', 'pubg', 'warzone', 'battle royale'],
    'Shooter': ['call of duty', 'shooter', 'sniper', 'gun', 'hitman', 'fps', 'tps', 'drone', 'robots', 'modern arena', 'strike ops', 'bullet', 'sniper'],
    'MOBA': ['mobile legends', 'brawl stars', 'wild rift', 'honor of kings', 'pokemon unite', 'bang bang'],
    'Fighting': ['dragon ball legends', 'contest of champions', 'shadow fight', 'street fighter', 'mortal combat', 'supreme duelist', 'spider fighter', 'kof', 'king of fighters'],
    'Platformer': ['super mario', 'geometry dash', 'level devil', 'dead cells', 'castlevania', 'blasphemous', 'limbo', 'vector', 'meat boy'],
    'Action RPG': ['archero', 'wuthering waves', 'genshin', 'solo leveling', 'punishing gray raven', 'dokkan battle', 'dblegends', 'brotato'],
    'Stealth / Horror': ['five nights', 'fnaf', 'poppy playtime', 'sister location', 'ultimate custom night', 'murder', 'horror', 'bendy', 'scary', 'stealth', 'unsolved'],
    'Sandbox Action': ['grand theft auto', 'san andreas', 'red dead redemption', 'rdr', 'gta'],
    'Arcade Action': ['aquapark.io', 'kick the buddy', 'snake.io', 'food run', 'crowd control', 'going balls', 'bridge race', 'count masters', 'mob control'],

    // Puzzle sub-categories
    'Match-3': ['candy crush', 'royal match', 'fishdom', 'gardenscapes', 'homescapes', 'puzzles & spells', 'clockmaker', 'matchington', 'tile club', 'tile explorer', 'toy blast', 'toon blast', 'best fiends', 'swap', 'match-3'],
    'Merge': ['merge mansion', 'travel town', 'gossip harbor', 'seaside escape', 'merge dragons', 'merge gardens', 'matching story', 'star merge', 'tasty travels', 'jigmerge', 'fatmerge', 'matching'],
    'Logic': ['the room', 'da vinci', 'monument valley', 'sudoku', 'nonogram', 'block blast', 'wood block', 'brain puzzle', 'braindom', 'brainy master', 'tick tock', 'nonogram.com', 'logic', 'crossword'],
    'Hidden Object': ['june\'s journey', 'manor matters', 'unsolved', 'seek it', 'spot it', 'find hidden'],
    'Physics': ['human fall flat', 'brick blast', 'rope escape', 'sand loop', 'sugar, sugar', 'antistress', 'osmose'],
    'Art Puzzle': ['art puzzle', 'pixel art', 'color by number', 'coloring', 'happy color', 'paint by number'],
    'Sort Puzzle': ['water sort', 'sort master', 'goods puzzle', 'hexa sort', 'coin merge', 'organize', 'tidy up', 'tap out', 'screw master'],

    // Casual / Social
    'Social Casino': ['monopoly go', 'coin master', 'dice dreams', 'animals & coins', 'piggy kingdom', 'dice dreams', 'crazy fox', 'fish of fortune', 'bingo aloha', 'bingo blitz', 'dice'],
    'Idle Tycoon': ['my perfect hotel', 'pizza ready', 'truck star', 'gym idle', 'idle landlord', 'hotelmaster', 'prison life', 'idle vlogger', 'tycoon', 'manager'],
    'Life Sim': ['toca boca', 'avatar world', 'township', 'talking tom', 'talking angela', 'talking friends', 'hay day', 'family island', 'yoya', 'bluey', 'sims'],
    'Runner': ['subway surfers', 'going balls', 'bridge race', 'count masters', 'sled surfers', 'race master', 'run'],
    'Social Deduction': ['among us', 'spacemafia', 'goose goose duck', 'werewolf', 'mafia'],

    // Card / Board
    'Solitaire': ['solitaire', 'tripeaks', 'grand harvest', 'tiki solitaire', 'daily classic', 'klondike'],
    'Battle Card (CCG)': ['pokemon tcg', 'mtg arena', 'marvel snap', 'hearthstone', 'dawncaster', 'slay the spire', 'balatro', 'cultist simulator', 'deckbuilding', 'magic: the gathering'],
    'Casino Card': ['poker', 'wsop', 'zynga poker', 'uno', 'phase 10', 'spades', 'cribbage', 'blackjack', 'card'],
    'Board Game': ['monopoly', 'ludo', 'chess', 'scrabble', 'clue', 'yahtzee', 'battleship', 'carcassonne'],

    // Strategy
    '4X / Grand Strategy': ['whiteout survival', 'rise of kingdoms', 'evony', 'lords mobile', 'age of origins', 'last war', 'clash of clans', 'last shelter', 'whiteout', 'puzzles & survival', 'puzzles & chaos', 'state of survival', 'top war', 'conquer', 'empire'],
    'Tower Defense': ['bloons', 'kingdom rush', 'rush rush', 'tower war', 'defense legend', 'raid rush', 'trap master', 'bloon'],
    'Tactical / Auto-Battler': ['tft', 'teamfight', 'battlegrounds', 'xcom', 'tacticus', 'fire emblem', 'company of heroes', 'rome: total war', 'warhammer', 'tactical'],

    // Adventure / RPG
    'Creative Sandbox': ['roblox', 'minecraft', 'meta horizon', 'sandbox'],
    'Open World RPG / MMORPG': ['genshin', 'honkai', 'star rail', 'wuthering waves', 'aion', 'albion', 'evertale', 'mmorpg'],
    'Survival Adventure': ['don\'t starve', 'terraria', 'zombie waves', '60 seconds', 'survival', 'death road to canada', 'last day on earth'],
    'Point & Click / Narrative': ['broken sword', 'rusty lake', 'the past within', 'machinarium', 'layton', 'mystery', 'hidden mystery', 'unpacking', 'incoherence', 'chapters', 'bitlife'],

    // Simulation / Sports / Racing
    'Job Sim': ['farming simulator', 'aerofly', 'american farming', 'fishing clash', 'driving simulator', 'real flight', 'referee simulator', 'teacher simulator', 'mudrunner', 'airplane chefs', 'simulator'],
    'Racing': ['csr', 'asphalt', 'rush rally', 'wreckfest', 'top drives', 'extreme car', 'race master', 'madout', 'drift', 'racing', 'race'],
    'Sports': ['fifa', 'efootball', 'soccer', 'football chairman', 'soccer superstar', 'top eleven', 'goal battle', 'mrracer', '8 ball pool', 'golf clash', 'golf rival', 'darts club', 'snooker blitz', 'wwe supercard', 'sports']
};

const publisherMap = {
    'VOODOO': 'Hybrid-Casual',
    'SayGames Ltd': 'Hybrid-Casual',
    'CrazyLabs LTD': 'Hyper-Casual',
    'Lion Studios': 'Hyper-Casual',
    'Azur Interactive Games Limited': 'Hybrid-Casual',
    'Supercell': 'Midcore Strategy',
    'King': 'Match-3 Puzzle',
    'Playrix': 'Match-3 / Merge',
    'Moon Active': 'Social Casino',
    'Scopely': 'Social Casino / Midcore',
    'KEMCO': 'Retro RPG',
    'Level Infinite': 'Midcore / Hardcore',
    'Electronic Arts': 'Sports / Action',
    'SQUARE ENIX Co.,Ltd.': 'JRPG / RPG'
};

function classify(name, genre, publisher) {
    const n = name.toLowerCase();
    const g = genre.toLowerCase();
    const p = publisher ? publisher.toLowerCase() : '';

    // 1. Keyword Overrides (Strongest match)
    for (const [sub, terms] of Object.entries(allCategories)) {
        if (terms.some(t => n.includes(t))) {
            // User rule: Shooter must be Action. If this is a shooter and not in Action genre, we still label it Shooter.
            return sub;
        }
    }

    // 2. Publisher Heuristics (Fallback)
    for (const [pub, sub] of Object.entries(publisherMap)) {
        if (p.includes(pub.toLowerCase())) return sub;
    }

    // 3. Genre Fallbacks
    if (g.includes('casino')) return 'Social Casino';
    if (g.includes('educational')) return 'Educational';
    if (g.includes('trivia')) return 'Trivia';
    if (g.includes('music')) return 'Music / Rhythm';
    if (n.includes('premium')) return 'Premium / Retro';

    return 'TBD';
}

async function run() {
    const fileContent = fs.readFileSync(INPUT, 'utf8');
    const records = parse(fileContent, { columns: true });

    const enriched = records.map(record => {
        const meta = gameMeta[record.store_id] || {};
        const sub = classify(record.name, record.genre, meta.publisher);
        return {
            ...record,
            subgenre: sub
        };
    });

    const outputCsv = stringify(enriched, { header: true });
    fs.writeFileSync(OUTPUT, outputCsv);

    const classifiedCount = enriched.filter(r => r.subgenre !== 'TBD').length;
    console.log(`✅ Success! Enriched file saved to: ${OUTPUT}`);
    console.log(`📊 Stats: Classified: ${classifiedCount} | TBD: ${enriched.length - classifiedCount}`);
}

run().catch(err => console.error(err));
