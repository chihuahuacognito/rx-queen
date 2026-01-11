'use server'

import { query } from '@/lib/db';

export async function getGameDetails(gameId: string, currentCountry: string) {
    try {
        // 1. Game Metadata + Current Stats in country
        const gameRes = await query(`
            SELECT 
                g.id, g.name, g.publisher, g.genre, g.icon_url,
                dt.current_rank_free, dt.rank_change_free, dt.current_rank_grossing, dt.days_on_chart, dt.last_updated
            FROM games g
            LEFT JOIN daily_trends dt ON g.id = dt.game_id AND dt.country_code = $1
            WHERE g.id = $2
        `, [currentCountry, gameId]);

        if (gameRes.rows.length === 0) return null;

        // 2. History (Last 30 snapshots for chart)
        const historyRes = await query(`
            SELECT captured_at, rank_free, rank_paid, rank_grossing
            FROM snapshots
            WHERE game_id = $1 AND country_code = $2
            ORDER BY captured_at DESC
            LIMIT 30
        `, [gameId, currentCountry]);

        // 3. Global Presence (Best ranks in other countries)
        const globalRes = await query(`
            SELECT country_code, current_rank_free, current_rank_grossing
            FROM daily_trends 
            WHERE game_id = $1 
            AND (current_rank_free IS NOT NULL OR current_rank_grossing IS NOT NULL)
            ORDER BY COALESCE(current_rank_free, 999) ASC 
            LIMIT 8
        `, [gameId]);

        return {
            info: gameRes.rows[0],
            history: historyRes.rows.reverse(),
            global: globalRes.rows
        };
    } catch (e) {
        console.error("Error fetching game details:", e);
        return null;
    }
}
