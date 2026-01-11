'use client';

import { TrendingUp } from 'lucide-react';
import { SignalCard } from './SignalCard';
import { Sparkline } from '../ui/Sparkline';
import { useEffect, useState } from 'react';

interface RiserCardProps {
    gameName: string;
    developerName?: string;
    rankChange: number;
    currentRank: number;
    genre: string;
    country?: string;
    iconUrl?: string | null;
    sparklineData?: number[];
    onClick?: () => void;
}

// Hero number count-up animation (600ms, ease-out per design plan)
function AnimatedNumber({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 600;
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out curve
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(startValue + (value - startValue) * easeOut);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <span>+{displayValue}</span>;
}

export function RiserCard({
    gameName,
    developerName,
    rankChange,
    currentRank,
    genre,
    country = 'US',
    iconUrl,
    sparklineData,
    onClick
}: RiserCardProps) {
    return (
        <SignalCard
            title="Fastest Riser"
            icon={<TrendingUp size={18} />}
            variant="rising"
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Game Icon 48x48 per design plan */}
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt={gameName}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                        🎮
                    </div>
                )}

                {/* Game Info */}
                <div className="flex-1 min-w-0">
                    {/* Name 16px bold per design plan */}
                    <h4 className="font-bold text-base text-white truncate">{gameName}</h4>
                    {/* Developer 12px muted per design plan */}
                    {developerName && (
                        <p className="text-xs text-slate-400 truncate">{developerName}</p>
                    )}
                </div>

                {/* Hero Number 48px per design plan */}
                <div className="text-right">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400 tabular-nums">
                        <AnimatedNumber value={rankChange} />
                    </div>
                    <div className="text-xs text-slate-500">Now #{currentRank}</div>
                </div>
            </div>

            {/* Sparkline: 7-day trend micro-chart */}
            {sparklineData && sparklineData.length > 1 && (
                <div className="mt-3 border-t border-slate-700/50 pt-3">
                    <Sparkline data={sparklineData} width={120} height={24} />
                </div>
            )}

            {/* Context pills per design plan */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/50">
                    {genre}
                </span>
                <span className="text-slate-600">•</span>
                <span>{country}</span>
                <span className="text-slate-600">•</span>
                <span>Today</span>
            </div>
        </SignalCard>
    );
}
