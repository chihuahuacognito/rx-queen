'use server';

import { query } from '../../lib/db';

interface Mover {
    gameName: string;
    rankChange: number;
    currentRank: number;
    genre: string;
    iconUrl: string | null;
    gameId: string;
}

interface GenreData {
    genre: string;
    velocity: number;
    gameCount: number;
}

interface PulseData {
    riser: Mover | null;
    faller: Mover | null;
    hotGenres: GenreData[];
    coldGenres: GenreData[];
}

export async function getPulseData(country: string = 'US'): Promise<PulseData> {
    try {
        // Get biggest riser (positive rank change = went UP in rank, which is good)
        const riserResult = await query(`
            SELECT 
                g.id as game_id,
                g.name as game_name,
                g.genre,
                g.icon_url,
                dt.current_rank_free as current_rank,
                dt.rank_change_free as rank_change
            FROM daily_trends dt
            JOIN games g ON dt.game_id = g.id
            WHERE dt.country_code = $1
              AND dt.rank_change_free > 0
              AND dt.current_rank_free IS NOT NULL
            ORDER BY dt.rank_change_free DESC
            LIMIT 1
        `, [country.toUpperCase()]);

        // Get biggest faller (negative rank change = went DOWN in rank, which is bad)
        const fallerResult = await query(`
            SELECT 
                g.id as game_id,
                g.name as game_name,
                g.genre,
                g.icon_url,
                dt.current_rank_free as current_rank,
                dt.rank_change_free as rank_change
            FROM daily_trends dt
            JOIN games g ON dt.game_id = g.id
            WHERE dt.country_code = $1
              AND dt.rank_change_free < 0
              AND dt.current_rank_free IS NOT NULL
            ORDER BY dt.rank_change_free ASC
            LIMIT 1
        `, [country.toUpperCase()]);

        // Get hottest genres (average positive velocity)
        const hotGenresResult = await query(`
            SELECT 
                g.genre,
                AVG(dt.rank_change_free) as velocity,
                COUNT(*) as game_count
            FROM daily_trends dt
            JOIN games g ON dt.game_id = g.id
            WHERE dt.country_code = $1
              AND dt.rank_change_free IS NOT NULL
              AND g.genre IS NOT NULL
            GROUP BY g.genre
            HAVING AVG(dt.rank_change_free) > 0
            ORDER BY AVG(dt.rank_change_free) DESC
            LIMIT 3
        `, [country.toUpperCase()]);

        // Get coldest genres (average negative velocity)
        const coldGenresResult = await query(`
            SELECT 
                g.genre,
                AVG(dt.rank_change_free) as velocity,
                COUNT(*) as game_count
            FROM daily_trends dt
            JOIN games g ON dt.game_id = g.id
            WHERE dt.country_code = $1
              AND dt.rank_change_free IS NOT NULL
              AND g.genre IS NOT NULL
            GROUP BY g.genre
            HAVING AVG(dt.rank_change_free) < 0
            ORDER BY AVG(dt.rank_change_free) ASC
            LIMIT 3
        `, [country.toUpperCase()]);

        // Format riser
        const riser = riserResult.rows.length > 0 ? {
            gameId: String(riserResult.rows[0].game_id),
            gameName: riserResult.rows[0].game_name,
            genre: riserResult.rows[0].genre || 'Unknown',
            iconUrl: riserResult.rows[0].icon_url,
            currentRank: Number(riserResult.rows[0].current_rank),
            rankChange: Number(riserResult.rows[0].rank_change),
        } : null;

        // Format faller
        const faller = fallerResult.rows.length > 0 ? {
            gameId: String(fallerResult.rows[0].game_id),
            gameName: fallerResult.rows[0].game_name,
            genre: fallerResult.rows[0].genre || 'Unknown',
            iconUrl: fallerResult.rows[0].icon_url,
            currentRank: Number(fallerResult.rows[0].current_rank),
            rankChange: Number(fallerResult.rows[0].rank_change),
        } : null;

        // Format hot genres
        const hotGenres = hotGenresResult.rows.map((r: { genre: string; velocity: string; game_count: string }) => ({
            genre: r.genre,
            velocity: Number(r.velocity),
            gameCount: Number(r.game_count),
        }));

        // Format cold genres
        const coldGenres = coldGenresResult.rows.map((r: { genre: string; velocity: string; game_count: string }) => ({
            genre: r.genre,
            velocity: Number(r.velocity),
            gameCount: Number(r.game_count),
        }));

        return { riser, faller, hotGenres, coldGenres };

    } catch (error) {
        console.error('Error fetching pulse data:', error);
        return {
            riser: null,
            faller: null,
            hotGenres: [],
            coldGenres: [],
        };
    }
}
