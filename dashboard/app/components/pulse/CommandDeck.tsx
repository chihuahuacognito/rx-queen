'use client';

import { RiserCard } from './RiserCard';
import { FallerCard } from './FallerCard';
import { GenreHeatCard } from './GenreHeatCard';

interface Mover {
    gameName: string;
    developerName?: string;
    rankChange: number;
    currentRank: number;
    genre: string;
    iconUrl?: string | null;
    gameId: string;
    sparklineData?: number[];
}

interface GenreData {
    genre: string;
    velocity: number;
    gameCount: number;
}

interface CommandDeckProps {
    riser: Mover | null;
    faller: Mover | null;
    hotGenres: GenreData[];
    coldGenres: GenreData[];
    country?: string;
    onGameClick?: (gameId: string) => void;
    onGenreClick?: (genre: string) => void;
}

export function CommandDeck({
    riser,
    faller,
    hotGenres,
    coldGenres,
    country = 'US',
    onGameClick,
    onGenreClick
}: CommandDeckProps) {
    return (
        <section className="mb-8">
            {/* Section Title */}
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Command Deck
            </h2>

            {/* 2x2 Bento Grid per design plan Section 3.1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Riser & Faller */}
                {riser ? (
                    <RiserCard
                        gameName={riser.gameName}
                        developerName={riser.developerName}
                        rankChange={riser.rankChange}
                        currentRank={riser.currentRank}
                        genre={riser.genre}
                        country={country}
                        iconUrl={riser.iconUrl}
                        sparklineData={riser.sparklineData}
                        onClick={() => onGameClick?.(riser.gameId)}
                    />
                ) : (
                    <div className="h-40 rounded-xl border border-slate-700/30 bg-[rgba(15,23,42,0.4)] backdrop-blur-sm flex items-center justify-center text-slate-500 text-sm">
                        No rising games today
                    </div>
                )}

                {faller ? (
                    <FallerCard
                        gameName={faller.gameName}
                        developerName={faller.developerName}
                        rankChange={faller.rankChange}
                        currentRank={faller.currentRank}
                        genre={faller.genre}
                        country={country}
                        iconUrl={faller.iconUrl}
                        sparklineData={faller.sparklineData}
                        onClick={() => onGameClick?.(faller.gameId)}
                    />
                ) : (
                    <div className="h-40 rounded-xl border border-slate-700/30 bg-[rgba(15,23,42,0.4)] backdrop-blur-sm flex items-center justify-center text-slate-500 text-sm">
                        No falling games today
                    </div>
                )}

                {/* Row 2: Genre Heat */}
                <GenreHeatCard
                    variant="hot"
                    genres={hotGenres}
                    onGenreClick={onGenreClick}
                />

                <GenreHeatCard
                    variant="cold"
                    genres={coldGenres}
                    onGenreClick={onGenreClick}
                />
            </div>
        </section>
    );
}
