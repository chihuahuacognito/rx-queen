'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const COUNTRIES = [
    // Tier 1: Revenue Markets
    { code: 'US', name: 'United States', tier: 'Revenue' },
    { code: 'JP', name: 'Japan', tier: 'Revenue' },
    { code: 'KR', name: 'South Korea', tier: 'Revenue' },
    { code: 'DE', name: 'Germany', tier: 'Revenue' },
    { code: 'GB', name: 'United Kingdom', tier: 'Revenue' },
    { code: 'FR', name: 'France', tier: 'Revenue' },
    { code: 'TW', name: 'Taiwan', tier: 'Revenue' },
    // Tier 2: Soft Launch
    { code: 'CA', name: 'Canada', tier: 'Soft Launch' },
    { code: 'AU', name: 'Australia', tier: 'Soft Launch' },
    { code: 'NZ', name: 'New Zealand', tier: 'Soft Launch' },
    { code: 'PH', name: 'Philippines', tier: 'Soft Launch' },
    { code: 'SG', name: 'Singapore', tier: 'Soft Launch' },
    { code: 'FI', name: 'Finland', tier: 'Soft Launch' },
    // Tier 3: Dev Hubs
    { code: 'IL', name: 'Israel', tier: 'Dev Hubs' },
    { code: 'VN', name: 'Vietnam', tier: 'Dev Hubs' },
    { code: 'SE', name: 'Sweden', tier: 'Dev Hubs' },
    { code: 'TR', name: 'Turkey', tier: 'Dev Hubs' },
    { code: 'HK', name: 'Hong Kong', tier: 'Dev Hubs' },
    // Tier 4: Emerging
    { code: 'BR', name: 'Brazil', tier: 'Emerging' },
    { code: 'IN', name: 'India', tier: 'Emerging' },
    { code: 'ID', name: 'Indonesia', tier: 'Emerging' },
    { code: 'SA', name: 'Saudi Arabia', tier: 'Emerging' },
    // Additional
    { code: 'MX', name: 'Mexico', tier: 'Additional' },
    { code: 'TH', name: 'Thailand', tier: 'Additional' },
    { code: 'MY', name: 'Malaysia', tier: 'Additional' },
    { code: 'AE', name: 'UAE', tier: 'Additional' },
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
