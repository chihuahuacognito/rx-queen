'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X, Globe, Trophy, TrendingUp, Calendar, Hash } from 'lucide-react';
import { getGameDetails } from '../../actions/getGameDetails';
import { clsx } from 'clsx';

export function GameViewPanel() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('game');
    const country = searchParams.get('country') || 'US';

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (gameId) {
            setIsVisible(true);
            setLoading(true);
            getGameDetails(gameId, country)
                .then(res => setData(res))
                .finally(() => setLoading(false));

            // Lock body scroll
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            setData(null);
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [gameId, country]);

    const close = () => {
        setIsVisible(false);
        // Remove 'game' param
        const params = new URLSearchParams(searchParams.toString());
        params.delete('game');
        setTimeout(() => {
            router.push(`/?${params.toString()}`, { scroll: false });
        }, 300); // Wait for animation
    };

    if (!gameId && !isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={close}
            />

            {/* Panel */}
            <div
                className={clsx(
                    "fixed top-0 right-0 h-screen w-full md:w-[600px] bg-[#0f172a] border-l border-white/10 z-50 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto",
                    isVisible ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={close}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-50"
                >
                    <X size={20} />
                </button>

                {loading || !data ? (
                    <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                        Loading Game Data...
                    </div>
                ) : (
                    <div className="p-8 space-y-8">
                        {/* Header */}
                        <div className="flex gap-6 items-start">
                            <div className="w-24 h-24 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0">
                                <Image src={data.info.icon_url} alt={data.info.name} fill className="object-cover" unoptimized />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-white leading-tight mb-2">{data.info.name}</h2>
                                <div className="text-slate-400 font-medium mb-4">{data.info.publisher}</div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                                        {data.info.genre}
                                    </span>
                                    {data.info.current_rank_free <= 10 && (
                                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30 flex items-center gap-1">
                                            <Trophy size={12} /> Top 10
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Current Status Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Rank</div>
                                <div className="text-3xl font-black text-white">#{data.info.current_rank_free || '-'}</div>
                                <div className="text-xs text-slate-400">{country} Free</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Change</div>
                                <div className={clsx("text-3xl font-black", (data.info.rank_change_free || 0) > 0 ? "text-emerald-400" : (data.info.rank_change_free || 0) < 0 ? "text-rose-400" : "text-slate-400")}>
                                    {data.info.rank_change_free > 0 ? '+' : ''}{data.info.rank_change_free || '-'}
                                </div>
                                <div className="text-xs text-slate-400">24h</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
                                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Duration</div>
                                <div className="text-3xl font-black text-white">{data.info.days_on_chart || '0'}</div>
                                <div className="text-xs text-slate-400">Days</div>
                            </div>
                        </div>

                        {/* Simple Chart (History) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={16} /> 30-Day Trend
                            </h3>
                            <div className="h-40 bg-white/[0.02] rounded-xl border border-white/5 relative flex items-end p-4 gap-1">
                                {data.history.map((pt: any, i: number) => {
                                    // Rank 1 is tall (100%), Rank 200 is short (5%)
                                    const h = Math.max(5, (200 - (pt.rank_free || 200)) / 200 * 100);
                                    return (
                                        <div
                                            key={i}
                                            className="flex-1 bg-indigo-500/50 hover:bg-indigo-400 min-w-[4px] rounded-t-sm transition-all relative group"
                                            style={{ height: `${h}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10 border border-white/20">
                                                #{pt.rank_free} on {new Date(pt.captured_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Global Presence */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Globe size={16} /> Global Presence
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {data.global.map((g: any) => (
                                    <div key={g.country_code} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">
                                                {/* Simple flag mapping or just code */}
                                                {getFlagEmoji(g.country_code)}
                                            </span>
                                            <span className="font-bold text-sm text-slate-300">{g.country_code}</span>
                                        </div>
                                        <div className="font-mono font-bold text-white">#{g.current_rank_free}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
