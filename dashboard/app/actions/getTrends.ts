'use server'

import { query } from '@/lib/db';

export async function getTrendingGames(
    country: string = 'US',
    category: 'free' | 'grossing' = 'grossing',
    limit: number = 25,
    offset: number = 0,
    genre?: string
) {
    try {
        // Debug: Check if we can connect
        console.log('[getTrends] Starting query for', country, category);
        console.log('[getTrends] DATABASE_URL exists:', !!process.env.DATABASE_URL);

        // Dynamic Sort Column based on Category
        const rankCol = category === 'grossing' ? 'current_rank_grossing' : 'current_rank_free';
        const changeCol = category === 'grossing' ? 'rank_change_grossing' : 'rank_change_free';

        // We want to return the LIST ordered by Rank 1 -> 200
        // The View already has the calculated fields
        const result = await query(`
            SELECT 
                game_id, name, publisher, genre, icon_url, 
                country_code,
                ${rankCol} as rank,
                ${changeCol} as rank_change,
                days_on_chart,
                is_new_entry,
                last_updated
            FROM daily_trends 
            WHERE country_code = $1
            AND ${rankCol} IS NOT NULL
            AND ($4::text IS NULL OR genre = $4)
            ORDER BY ${rankCol} ASC
            LIMIT $2 OFFSET $3;
        `, [country, limit, offset, genre || null]);

        console.log('[getTrends] Query returned', result.rows.length, 'rows');
        return result.rows;
    } catch (error) {
        console.error('[getTrends] Database Error:', error);
        // Re-throw so Vercel shows error instead of empty page
        throw error;
    }
}

