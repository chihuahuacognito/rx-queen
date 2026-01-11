'use client';

export function ChartHeader() {
    return (
        <div className="sticky top-0 z-10 flex items-center w-full h-[40px] px-6 bg-[#0f172a]/95 backdrop-blur-md border-b border-indigo-500/10 text-[10px] font-bold tracking-widest text-slate-500 uppercase shadow-sm">

            <div className="w-16 mr-6 text-center">
                Rank
            </div>

            <div className="flex-1 mr-8">
                Title
            </div>

            <div className="hidden md:flex items-center gap-8 text-right justify-end">
                {/* <div className="w-24 text-center">Trend</div> */}
                <div className="w-24 text-left">Genre</div>
                {/* <div className="w-20 text-right hidden lg:block">Power</div> */}
                <div className="w-20 text-right">Days</div>
            </div>

        </div>
    );
}
