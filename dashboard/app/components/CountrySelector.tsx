'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
];

export function CountrySelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCode = searchParams.get('country') || 'US';
    const [isOpen, setIsOpen] = useState(false);

    const currentCountry = COUNTRIES.find(c => c.code === currentCode) || COUNTRIES[0];

    const handleSelect = (code: string) => {
        router.push(`/?country=${code}`);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                title="Select Region"
            >
                <Globe size={16} className="text-slate-400" />
                <span className="font-bold text-violet-300">{currentCountry.name}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    {COUNTRIES.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => handleSelect(c.code)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between
                                ${currentCode === c.code ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-400'}
                            `}
                        >
                            {c.name}
                            {currentCode === c.code && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
