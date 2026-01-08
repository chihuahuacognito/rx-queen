# Product Design Review: "The Billboard Chart" Pivot

## 1. Executive Summary
**Current Status**: The app currently uses a "Card Grid" layout (Netflix style).
**Critique**: While visually rich, a Grid is **incorrect** for a "Leaderboard" or "Chart" use case. Users looking for market intelligence need to scan **Ranks** (1, 2, 3) linearly to understand hierarchy. A grid forces a "Zig-Zag" scan pattern (Z-pattern) which increases cognitive load when comparing Rank #4 vs Rank #8.

## 2. UI/UX Analysis (The "Billboard" Standard)

### Issue A: The Scan Pattern (Grid vs List)
*   **Current (Grid)**: Users see 4 items per row. To find the Top 10, the eye must travel Left->Right, Down, Left->Right.
*   **Problem**: It destroys the "Ladder" feeling of a chart.
*   **Fix**: **Vertical List View**. Rank #1 is at the top, Rank #100 is at the bottom. Single axis of hierarchy.

### Issue B: Visual Hierarchy & Data Density
*   **Current**: The `GameCard` emphasizes the **Icon** (Visual) over the **Data** (Rank/Change). The "Rank" is hidden in small text.
*   **Problem**: For an analytics tool, the **Rank Position** and **Velocity (Change)** are the primary data points. The Icon is secondary (recognition only).
*   **Fix**:
    *   **Column 1 (The Anchor)**: Massive, bold Rank Number (#1, #2).
    *   **Column 2 (The Identity)**: Smaller Icon + Title + Genre badge.
    *   **Column 3 (The Metric)**: Bright Green/Red indicators for Rank Change.
    *   **Density**: We can fit 10-15 rows per screen in List View, vs only 6-8 cards in Grid View.

### Issue C: Pagination & flow
*   **Current**: Single page load (Top 50?). No way to see the "Long Tail".
*   **Fix**: Infinite Scroll or "Load More" pattern. The user mentioned "See the next 100".
    *   *Interaction*: User scrolls to #100, hits a "Load Ranks 101-200" separator or it auto-loads.

---

## 3. Actionable Items for Sprint 2 (The Rewrite)

### 3.1 Frontend Overhaul
1.  **Component Swap**: Deprecate `GameCard` (Grid). Build `ChartRow` (List Item).
    *   *Design Specs*: Height ~64px-80px. Sticky Header bar ("Rank", "Game", "Trend").
2.  **Layout Change**: `page.tsx` switches from CSS Grid to Flex Column.
3.  **Visuals**: Implement "Billboard" styling.
    *   *Rank #1-3*: Special styling (Gold/Silver/Bronze effects or larger font).
    *   *Ranks 4+*: Standard tabular styling.

### 3.2 Data Piping
1.  **Pagination API**: Update `getTrends` server action to accept `offset` and `limit`.
    *   *Default*: Load 50 items.
    *   *Action*: `Load More` fetches items 51-100.
2.  **Infinite Scroll Client**: Implement a client-side wrapper to handle the "Load More" state without full page refreshes (using Server Actions + React State).

### 3.3 Genre Integration (Retained from Optimization Plan)
*   The "Genre" badge fits perfectly in the new `ChartRow` component (next to the Title).
