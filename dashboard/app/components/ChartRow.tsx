'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkline } from './ui/Sparkline';
import { PowerDots } from './ui/PowerDots';

interface ChartRowProps {
    game_id: number;
    rank: number;
    name: string;
    publisher?: string;
    genre?: string;
    icon_url: string;

    // Metrics
    last_week_rank?: number | null;
    days_on_chart: number;
    is_new_entry: boolean;
    rank_change: number;

    className?: string;
}

export function ChartRow({
    game_id,
    rank,
    name,
    publisher = 'Unknown',
    genre,
    icon_url,
    last_week_rank,
    days_on_chart,
    is_new_entry,
    rank_change,
    className
}: ChartRowProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Rank Hierarchy Logic
    const isRank1 = rank === 1;
    const isRank2 = rank === 2;
    const isRank3 = rank === 3;
    const isTop3 = rank <= 3;

    const handleClick = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('game', String(game_id));
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    // Dynamic Styles based on Rank
    const rankColor = isRank1 ? "text-[#FFD700] drop-shadow-[0_4px_8px_rgba(255,215,0,0.4)]" :
        isRank2 ? "text-[#E2E8F0] drop-shadow-[0_2px_4px_rgba(226,232,240,0.3)]" :
            isRank3 ? "text-[#F59E0B] drop-shadow-[0_2px_4px_rgba(245,158,11,0.3)]" :
                "text-slate-400 group-hover:text-white transition-colors duration-300";

    const rowBackground = isRank1 ? "bg-gradient-to-r from-yellow-500/10 via-[#0f172a] to-[#0f172a] border-l-4 border-l-[#FFD700]" :
        isRank2 ? "bg-gradient-to-r from-slate-400/10 via-[#0f172a] to-[#0f172a] border-l-4 border-l-[#E2E8F0]" :
            isRank3 ? "bg-gradient-to-r from-orange-500/10 via-[#0f172a] to-[#0f172a] border-l-4 border-l-[#F59E0B]" :
                "bg-[#0f172a] border-b border-indigo-500/5 hover:bg-white/[0.02]";

    return (
        <div
            onClick={handleClick}
            className={twMerge(
                "group relative flex items-center w-full h-[88px] px-6 transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:z-10 hover:border-indigo-500/20 cursor-pointer",
                rowBackground,
                className
            )}>

            {/* 1. RANK COLUMN */}
            <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center mr-6">
                <span className={clsx(
                    "text-4xl font-black tracking-tighter transition-all duration-300",
                    rankColor
                )}>
                    {rank}
                </span>

                {/* Trend Arrow */}
                <div className="mt-1 transform group-hover:scale-110 transition-transform">
                    {is_new_entry ? (
                        <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded shadow-lg shadow-blue-900/20 tracking-wider">
                            NEW
                        </span>
                    ) : (
                        <div className={clsx("flex items-center text-xs font-bold",
                            rank_change > 0 ? "text-emerald-400 drop-shadow-sm" :
                                rank_change < 0 ? "text-rose-400" : "text-slate-700"
                        )}>
                            {rank_change > 0 ? <ArrowUp size={14} strokeWidth={3} /> :
                                rank_change < 0 ? <ArrowDown size={14} strokeWidth={3} /> : <Minus size={14} />}
                            {Math.abs(rank_change) > 0 && <span>{Math.abs(rank_change)}</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. ENTITY COLUMN */}
            <div className="flex-1 flex items-center min-w-0 mr-8">
                {/* Icon with Glow for Top 3 */}
                <div className={clsx(
                    "relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 mr-5 border border-white/10 shadow-2xl transition-all duration-300 group-hover:shadow-white/5",
                    isRank1 && "ring-2 ring-[#FFD700] shadow-[#FFD700]/20",
                    isRank2 && "ring-2 ring-[#C0C0C0] shadow-[#C0C0C0]/20",
                    isRank3 && "ring-2 ring-[#CD7F32] shadow-[#CD7F32]/20"
                )}>
                    <Image
                        src={icon_url}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                    />
                </div>

                {/* Text Stack */}
                <div className="flex flex-col truncate">
                    <h3 className={clsx(
                        "text-lg truncate leading-tight transition-colors duration-300",
                        isTop3 ? "font-black text-white" : "font-bold text-slate-200 group-hover:text-white"
                    )}>
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <span className="font-medium truncate max-w-[200px] text-slate-500 group-hover:text-slate-300 transition-colors">{publisher}</span>
                    </div>
                </div>
            </div>

            {/* 3. METRICS COLUMN */}
            <div className="hidden md:flex items-center gap-8 text-right justify-end">
                {/* Trend Graph (Hidden) */}
                {/* <div className="w-24 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkline
                        data={[
                            rank + (rank_change || 0),
                            rank + ((rank_change || 0) * 0.5) + ((rank % 2 === 0 ? 1 : -1) * 2),
                            rank
                        ].map(r => 200 - r)} // Invert rank so #1 is high
                        color={rank_change > 0 ? "#10B981" : rank_change < 0 ? "#F43F5E" : "#64748B"}
                        width={60}
                        height={20}
                    />
                </div> */}

                {/* Genre Column */}
                <div className="w-24 text-left flex items-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-white/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                        {genre || 'Unknown'}
                    </span>
                </div>

                {/* Power Score (Hidden) */}
                {/* <div className="w-20 hidden lg:flex flex-col items-end justify-center">
                    <PowerDots
                        score={Math.min(100, Math.max(1, 100 - (rank / 2) + ((rank_change || 0) * 0.5)))}
                    />
                </div> */}

                {/* Days on Chart (Just Number) */}
                <div className="w-20 flex flex-col items-end opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="font-serif text-2xl text-slate-200 leading-none">
                        {days_on_chart}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">DAYS</span>
                </div>
            </div>

        </div>
    );
}
