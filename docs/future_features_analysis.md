# Future Features Analysis (Competitor Inspiration)

Based on a detailed analysis of market leaders (IMDb, Billboard, Rotten Tomatoes, SteamDB), we have identified key features to evolve Rx Queen into a world-class intelligence platform.

## 1. The "Context" Layer (Rotten Tomatoes / IMDb Inspiration)
*Current Gap*: We show Rank, but not *why* (Age/Recency).
*   **[P0] Release Date Column**:
    *   *Inspiration*: Rotten Tomatoes "Opening Date".
    *   *Value*: Helps users instantly distinguish "New Viral Hits" vs "Legacy Games that updated".
    *   *Implementation*: Scrape `released` date from Google Play.
*   **[P1] "Weeks on Chart" Badge**:
    *   *Inspiration*: Billboard Hot 100.
    *   *Value*: Identifies "Sticky" games (High Retention) vs "Flash in the Pan" (High UA Spend, low retention).
    *   *Implementation*: Query DB history count for each game ID.

## 2. The "Momentum" Layer (SteamDB Inspiration)
*Current Gap*: We show Rank Change, but not *Growth Rate*.
*   **[P1] "Trending" Indicator**:
    *   *Inspiration*: SteamDB Green/Red highlights.
    *   *Value*: A "Fire" icon for games that jumped >20 spots in 24h.
*   **[P2] "New Entry" Badge**:
    *   *Inspiration*: Billboard "NEW".
    *   *Value*: Critical for spotting breakouts the *moment* they enter the Top 200.

## 3. The "Density" Layer (Power User Features)
*   **[P2] View Toggles**:
    *   *Option A*: **Billboard View** (Rich, Icons, Genre Badges).
    *   *Option B*: **Data Grid** (Excel-style, dense text, sortable columns).
    *   *Value*: Analysts need Option B; Executives need Option A.

## 4. Proposed Schema Updates (To Support These)
To enable these features, we need to add the following columns to our `games` table:
1.  `released_at` (Date) - For Release Date column.
2.  `rating_count` (BigInt) - For "Hype" measurement.
3.  `weeks_on_chart` (Derived View) - Calculated from snapshot history.
