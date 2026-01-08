# implementation_plan_sprint_3_1.md

## Sprint 3.1: Market Pulse & Command Center UI

**Goal**: Transform the dashboard home page from a simple data list into a "Command Center" that highlights critical market movements immediately.

**Design Philosophy**: "Minimalist Glass Command". Dark backgrounds, neon accents for signals (Green/Red), bento-box grid layout for high data density without clutter.

---

## 1. The "Power Score" Formula
*Refined for Rx Queen context.*

We define **Rx Power** (0-100) to identify "Important Games moving Fast".
It is a composite of **Dominance** (Rank) and **Momentum** (Velocity).

$$
\text{Power Score} = (0.7 \times \text{RankWeight}) + (0.3 \times \text{VelocityWeight})
$$

Where:
*   **RankWeight**: `(201 - Rank) / 2` (Rank #1 = 100 pts, Rank #200 = 0 pts)
*   **VelocityWeight**: Sigmoid function of `RankChange`.
    *   +20 spots = 100 pts
    *   0 spots = 50 pts
    *   -20 spots = 0 pts

*This ensures a game at Rank #1 is always "Powerful", but a game shooting up from #100 to #50 gets a massive boost.*

---

## 2. UI Components (The "Bento Grid")

The Home Page will feature a **Hero Section** above the main chart list.

### Panel A: "The Movers" (Left Col)
*   **Fastest Rising Game**: Large Card. Show Icon, Name, and giant green `+N` number.
*   **Biggest Faller**: Smaller Card below. Red `-N` number.

### Panel B: "Sector Radar" (Center Col)
*   **Hot Genre**: The Genre with the highest `AVG(RankChange)` today.
*   **Strongest Genre**: The Genre with the highest `AVG(InvRank)` (Best average positions).
*   **Hot Subgenre**: Same for Subgenre.

### Panel C: "Trending Now" (Right Col)
*   **High Power Score**: Top 3 games by "Power Score" described above.
*   **Visual**: Mini-list with sparklines (if we had history, for now just delta arrows).

---

## 3. Technical Implementation

### 3.1 Database Views (`db/views_pulse.sql`)
We need aggregate views to fetch this data instantly.

**View 1: `genre_stats`**
```sql
SELECT 
    genre,
    COUNT(*) as game_count,
    AVG(rank) as avg_rank,
    AVG(rank_change) as avg_velocity
FROM daily_trends
WHERE country_code = 'US' -- Default to US for global pulse
GROUP BY genre
```

**View 2: `power_rankings`**
```sql
SELECT 
    *,
    ((201 - rank) * 0.7) + (LEAST(GREATEST(rank_change, -20), 20) + 20) * 2.5 * 0.3 as power_score
FROM daily_trends
```

### 3.2 Server Actions (`actions/getMarketPulse.ts`)
New server action to fetch all "Pulse" data in parallel.
*   `getBiggestMover()`
*   `getGenreStats()`
*   `getPowerLeaders()`

### 3.3 Frontend Components
*   `components/pulse/PulseGrid.tsx`: Main container.
*   `components/pulse/MoverCard.tsx`: Reusable card for Single Game (Riser/Faller).
*   `components/pulse/StatsCard.tsx`: For Genre stats.
*   `components/pulse/PowerList.tsx`: List of power leaders.

---

## 4. Execution Steps

1.  **Database**: Create `genre_stats` and `power_rankings` views/logic.
2.  **Backend**: Implement `getMarketPulse` server action.
3.  **Frontend**: Build `PulseGrid` and its sub-components.
4.  **Integration**: Add `PulseGrid` to `page.tsx`.
5.  **Styling**: Apply "Glassmorphism" design tokens.

---

## 5. Mockup Description
*   **Background**: Deep slate gray / black.
*   **Cards**: Semi-transparent `bg-white/5` with `backdrop-blur-md`.
*   **Accents**: 
    *   Rise: Neon Green (`#10B981`) text shadow.
    *   Fall: Rose Red (`#F43F5E`).
    *   Power: Electric Purple (`#8B5CF6`).
