import { ChartFilters } from './components/ChartFilters';
import { ChartHeader } from './components/ChartHeader';
import { ChartList } from './components/ChartList';
import { getTrendingGames } from './actions/getTrends';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams; // Next.js 15 requires awaiting searchParams
  const country = (sp.country as string) || 'US';
  const category = (sp.category as 'free' | 'grossing') || 'free';
  const genre = (sp.genre as string) || undefined;

  // Initial Fetch (Server Side)
  const initialGames = await getTrendingGames(country, category, 25, 0, genre);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0f172a] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-5xl mx-auto">

        {/* 1. Header & Controls */}
        <ChartFilters />

        {/* 2. Sticky Column Labels */}
        <ChartHeader />

        {/* 3. Infinite List */}
        <div className="bg-[#0f172a]/50 backdrop-blur-xl border border-indigo-500/10 rounded-b-xl shadow-[0_0_50px_-12px_rgba(79,70,229,0.1)] min-h-[500px]">
          {initialGames.length > 0 ? (
            /* Key ensures component resets when filters change */
            <ChartList
              key={`${country}-${category}-${genre}`}
              initialGames={initialGames}
              currentCountry={country}
              currentCategory={category}
              currentGenre={genre}
            />
          ) : (
            <div className="p-12 text-center text-slate-500">
              No chart data found for {country}.
              <br />
              <span className="text-sm opacity-50">Try running the scraper for this region.</span>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
