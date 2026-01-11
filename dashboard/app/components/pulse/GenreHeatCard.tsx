'use client';

import { Flame, Snowflake } from 'lucide-react';
import { SignalCard } from './SignalCard';

interface GenreData {
    genre: string;
    velocity: number;
    gameCount: number;
}

interface GenreHeatCardProps {
    variant: 'hot' | 'cold';
    genres: GenreData[];
    onGenreClick?: (genre: string) => void;
}

export function GenreHeatCard({ variant, genres, onGenreClick }: GenreHeatCardProps) {
    const isHot = variant === 'hot';
    const title = isHot ? 'Sector Heat' : 'Coldest Sectors';
    const icon = isHot ? <Flame size={18} /> : <Snowflake size={18} />;

    // Normalize velocity for bar width (0-100%)
    const maxAbsVelocity = Math.max(...genres.map(g => Math.abs(g.velocity)), 1);

    return (
        <SignalCard
            title={title}
            icon={icon}
            variant={variant}
        >
            <div className="space-y-3">
                {genres.slice(0, 5).map((g, i) => {
                    const barWidth = (Math.abs(g.velocity) / maxAbsVelocity) * 100;
                    const isTopHot = isHot && i === 0;

                    return (
                        <button
                            key={g.genre}
                            onClick={() => onGenreClick?.(g.genre)}
                            className="w-full text-left group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                    {g.genre}
                                </span>
                                <span className={`text-sm font-bold flex items-center gap-1 ${isHot ? 'text-orange-400' : 'text-cyan-400'
                                    }`}>
                                    {g.velocity > 0 ? '+' : ''}{g.velocity.toFixed(1)}
                                    {/* 🔥 Icon only on #1 hottest per design plan */}
                                    {isTopHot && <span className="text-orange-500">🔥</span>}
                                </span>
                            </div>
                            {/* Horizontal bars with gradient fills per design plan */}
                            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isHot
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                                        }`}
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Inline "worst performer" for hot section per design plan */}
            {isHot && genres.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                    Coldest: {genres[genres.length - 1]?.genre || 'N/A'} • {genres[genres.length - 1]?.velocity.toFixed(1)} avg
                </div>
            )}
        </SignalCard>
    );
}
