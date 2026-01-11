'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SignalCardProps {
    title: string;
    icon: ReactNode;
    variant: 'rising' | 'falling' | 'hot' | 'cold';
    children: ReactNode;
    onClick?: () => void;
}

// Per ui_design_plan.md Section 2.4
const variantStyles = {
    rising: {
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-400',
        hoverGlow: 'hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)]',
    },
    falling: {
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]',
        iconBg: 'bg-rose-500/10',
        iconColor: 'text-rose-400',
        hoverGlow: 'hover:shadow-[0_0_50px_-10px_rgba(244,63,94,0.5)]',
    },
    hot: {
        border: 'border-orange-500/30',
        glow: 'shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)]',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-400',
        hoverGlow: 'hover:shadow-[0_0_50px_-10px_rgba(249,115,22,0.5)]',
    },
    cold: {
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]',
        iconBg: 'bg-cyan-500/10',
        iconColor: 'text-cyan-400',
        hoverGlow: 'hover:shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)]',
    },
};

export function SignalCard({ title, icon, variant, children, onClick }: SignalCardProps) {
    const styles = variantStyles[variant];

    return (
        <div
            onClick={onClick}
            className={clsx(
                // Glass Effect per ui_design_plan.md Section 2.3
                'relative overflow-hidden rounded-xl border',
                'bg-[rgba(15,23,42,0.6)] backdrop-blur-[16px]',
                'border-[rgba(255,255,255,0.05)]',
                'p-4',
                // Transitions and hover
                'transition-all duration-300',
                'hover:scale-[1.01]',
                // Variant-specific glow
                styles.border,
                styles.glow,
                styles.hoverGlow,
                onClick && 'cursor-pointer'
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className={clsx('p-2 rounded-lg', styles.iconBg)}>
                    <span className={styles.iconColor}>{icon}</span>
                </div>
                {/* Label: 11px, muted per design plan */}
                <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {title}
                </h3>
            </div>

            {/* Content */}
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}
