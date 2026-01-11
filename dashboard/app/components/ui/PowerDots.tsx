import { clsx } from "clsx";

interface PowerDotsProps {
    score: number; // 0 to 100
    className?: string;
}

export function PowerDots({ score, className }: PowerDotsProps) {
    // Normalize 0-100 score to 1-5 dots
    const dots = Math.min(Math.max(Math.round((score / 100) * 5), 1), 5); // Ensure 1-5

    return (
        <div className={clsx("flex gap-1", className)} title={`Power Score: ${score}`}>
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={clsx(
                        "w-2 h-2 rounded-full",
                        i < dots
                            ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                            : "bg-slate-700/50"
                    )}
                />
            ))}
        </div>
    );
}
