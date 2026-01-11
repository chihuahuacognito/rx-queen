'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { CountrySelector } from './CountrySelector';
import GenreSelector from './GenreSelector';

export function ChartFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get('category') || 'free'; // Default to 'free' per user request
    const country = searchParams.get('country') || 'US';

    const handleCategory = (cat: 'free' | 'grossing' | 'paid') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', cat);
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 relative z-20">
            {/* Title / Context */}
            <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                    Top 200 Charts
                    <span className="text-base font-normal text-slate-500 border-l border-white/10 pl-3">
                        {country}
                    </span>
                </h2>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 bg-[#1a1b2e] p-1.5 rounded-xl border border-white/5 shadow-xl">

                {/* Category Toggle */}
                <div className="flex bg-black/20 rounded-lg p-1 relative">
                    <button
                        onClick={() => handleCategory('grossing')}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-bold rounded-md transition-all",
                            currentCategory === 'grossing'
                                ? "bg-white text-black shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        Top Grossing
                    </button>
                    <button
                        onClick={() => handleCategory('paid')}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-bold rounded-md transition-all",
                            currentCategory === 'paid'
                                ? "bg-white text-black shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        Top Paid
                    </button>
                    <button
                        onClick={() => handleCategory('free')}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-bold rounded-md transition-all",
                            currentCategory === 'free'
                                ? "bg-white text-black shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                    >
                        Top Free
                    </button>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Country Selector */}
                <div className="w-px h-6 bg-white/10" />

                {/* Genre Selector */}
                <GenreSelector />

                <div className="w-px h-6 bg-white/10" />

                {/* Country Selector */}
                <CountrySelector />
            </div>
        </div>
    );
}
