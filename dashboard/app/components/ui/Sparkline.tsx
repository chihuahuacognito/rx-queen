export function Sparkline({ data, color = "currentColor", width = 64, height = 24 }: { data: number[], color?: string, width?: number, height?: number }) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Scale points to fit SVG
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        // Invert Y because SVG 0 is top
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-70">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End point dot */}
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                fill={color}
            />
        </svg>
    );
}
