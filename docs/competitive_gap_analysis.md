# Rx Queen: Competitive Gap Analysis & Market State

## 1. Market State: The "Red Ocean" vs. Our Opportunity

The current Mobile Market Intelligence (MMI) landscape is crowded with giants (SensorTower, Data.ai) competing on **Revenue Accuracy** and **Data Volume**. This is a "Red Ocean" where we cannot compete directly on resources.

**Our "Blue Ocean" Strategy:**
Instead of raw data volume, we compete on **Velocity, Narrative, and "Why"**.
*   **Competitors**: "Game X made $100k yesterday." (Lagging Indicator)
*   **Rx Queen**: "Game X's rank dropped 50 spots because of a crash spike in version 1.2." (Leading Indicator / Actionable Insight)

## 2. Missing Capabilities (The Gap)

To execute this strategy, specifically the user's request for "Fastest Fallers/Risers by Subgenre", we have identified specific gaps in our current implementation.

### A. Data Level (Critical) | **[MISSING]**
*   **Subgenre Ingestion Context**: While the database schema (`games` table) has a `subgenre` column, **it is currently empty**.
    *   *Observation*: The `manual_ingest_all.js` script maps `genre` but explicitly ignores/misses `subgenre`.
    *   *Impact*: We cannot perform "RPG vs. Strategy" volatility analysis until this is fixed.
*   **Theme/Tag Data**: The current scraper/database does not support "Themes" (e.g., "Sci-Fi", "Medieval", "Anime").
    *   *Impact*: "Theme Analysis" requested by the user is currently impossible without schema and scraper updates.

### B. Analytical Level (The "Fastest Fallers" Logic) | **[Not Started]**
Currently, we track Rank Delta for *individual games*. We lack the *derivative* layer to track volatility for *groups*.

**We need to build:**
1.  **Sector Volatility Index**: A query that aggregates rank changes by Genre/Subgenre.
    *   *Example Insight*: "Turn-based RPGs are down -15% avg rank this week."
2.  **"Storm Watch" (The Fallers/Risers)**:
    *   *Identify games moving *against* their sector trend (e.g., An RPG rising while the sector falls).
    *   Identify sectors that are collectively "crashing" (indicating a macro trend or competitor domination).

### C. Timeframe Flexibility | **[Limited]**
*   **Current**: `today` vs `yesterday` (24h delta).
*   **Needed**: Dynamic windows (7d, 30d, 90d, custom).
    *   *Requirement*: Efficient historical snapshot queries (Window Functions).

## 3. Feature Proposal: "Market Pulse"

We propose a new section in the dashboard called **"Market Pulse"**.

### Widget 1: "Sector Heatmap" (The Macro View)
*   **Visual**: A bar chart or heatmap of Genres/Subgenres.
*   **Metric**: "Net Rank Velocity" (Sum of rank gains minus rank losses for top 100 games in that genre).
*   **Insight**: "Match-3 is heating up (+400 net ranks), Strategy is cooling (-200)."

### Widget 2: "Fastest Movers" (The Micro View)
*   **Filter**: By Genre/Subgenre.
*   **Columns**:
    *   **Rocket** (Biggest Gainers): `Rank Delta > +10`
    *   **Anchor** (Biggest Fallers): `Rank Delta < -10`
*   **Context**: "Game X rose 50 spots (Subgenre: 4X Strategy)."

### Widget 3: "Theme Trends" (Future)
*   *Prerequisite*: Need to update scraper to fetch tags/themes (or use LLM to infer from description).
*   *Value*: "Sci-Fi themes are trending up in RPGs."

---

## 4. Technical Roadmap to Close Gaps

1.  **Immediate Fix**: Update ingestion scripts to capture `subgenre`.
2.  **Schema Update**: Add `themes` (array) to `games` table.
3.  **Analytics Layer**: Create SQL Views for `genre_volatility_daily` and `genre_volatility_weekly`.
4.  **UI Implementation**: Build the "Market Pulse" page.
