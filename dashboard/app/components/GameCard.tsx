'use client'

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Image from 'next/image';

interface GameProps {
    name: string;
    icon_url: string;
    rank: number;
    genre?: string;
    change: number;
    type: 'Free' | 'Grossing';
}

export function GameCard({ name, icon_url, rank, change, type, genre }: GameProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel p-4 rounded-xl flex items-center space-x-4 transition-colors hover:bg-slate-800/50"
        >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg border border-white/10 flex-shrink-0">
                <Image
                    src={icon_url}
                    alt={name}
                    fill
                    className="object-cover"
                    unoptimized // Google Play images are external
                />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold truncate">{name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-400">#{rank}</span>
                    {genre && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-slate-400 border border-white/5">
                            {genre}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end">
                <div className={`flex items-center font-bold ${change > 0 ? 'text-emerald-400' :
                    change < 0 ? 'text-rose-400' : 'text-slate-500'
                    }`}>
                    {change > 0 && <ArrowUp size={16} className="mr-1" />}
                    {change < 0 && <ArrowDown size={16} className="mr-1" />}
                    {change === 0 && <Minus size={16} className="mr-1" />}
                    <span>{Math.abs(change)}</span>
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Change</span>
            </div>
        </motion.div>
    );
}
