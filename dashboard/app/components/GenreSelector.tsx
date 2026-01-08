'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const GENRES = [
    'All Genres',
    'Action',
    'Adventure',
    'Arcade',
    'Board',
    'Card',
    'Casino',
    'Casual',
    'Educational',
    'Music',
    'Puzzle',
    'Racing',
    'Role Playing',
    'Simulation',
    'Sports',
    'Strategy',
    'Trivia',
    'Word'
];

export default function GenreSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentGenre = searchParams.get('genre') || 'All Genres';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const genre = e.target.value;
        const params = new URLSearchParams(searchParams);

        if (genre === 'All Genres') {
            params.delete('genre');
        } else {
            params.set('genre', genre);
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <select
            value={currentGenre}
            onChange={handleChange}
            className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
        >
            {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
            ))}
        </select>
    );
}
