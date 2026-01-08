'use client';

import { useState } from 'react';
import { ChartRow } from './ChartRow';
import { getTrendingGames } from '../actions/getTrends';
import { Loader2 } from 'lucide-react';

interface Game {
    rank: number;
    name: string;
    publisher?: string;
    genre?: string;
    icon_url: string;
    rank_change: number;
    days_on_chart: number;
    is_new_entry: boolean;
    // ... any other fields
}

interface ChartListProps {
    initialGames: Game[];
    currentCountry: string;
    currentCategory: 'free' | 'grossing';
    currentGenre?: string;
}

export function ChartList({ initialGames, currentCountry, currentCategory, currentGenre }: ChartListProps) {
    const [games, setGames] = useState<Game[]>(initialGames);
    const [offset, setOffset] = useState(25); // Start after the first 25
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const newGames = await getTrendingGames(currentCountry, currentCategory, 25, offset, currentGenre); // Fetch next 25

            if (newGames.length === 0) {
                setHasMore(false);
            } else {
                setGames(prev => [...prev, ...newGames]);
                setOffset(prev => prev + 25);
            }
        } catch (error) {
            console.error("Failed to load more", error);
        } finally {
            setLoading(false);
        }
    };

    // If initial games change (e.g. filter change), reset state
    // Note: Since this is a Client Component mounted by a Server Component with a key, 
    // simply changing the key in the parent will reset this, which is the preferred way.
    // So we don't need a useEffect for prop changes if Page passes a unique key.

    return (
        <div className="flex flex-col w-full pb-20">
            {games.map((game, index) => (
                <ChartRow
                    key={`${game.rank}-${game.name}-${index}`}
                    {...game}
                />
            ))}

            <div className="mt-8 flex justify-center">
                {hasMore ? (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full font-bold text-slate-300 border border-white/10 transition-all disabled:opacity-50"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {loading ? 'Loading Charts...' : 'Load Next 25'}
                    </button>
                ) : (
                    <span className="text-slate-600 font-medium">End of Charts</span>
                )}
            </div>
        </div>
    );
}
