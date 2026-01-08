# Sprint 2: The "Billboard" Redesign & Deep Data

**Goal**: Transform the dashboard from a "Game Gallery" into a professional "Market Intelligence Chart" (Billboard Style) and expand data coverage to the Top 200.

## 1. Design & UX Overhaul ("The Billboard")
*   **Objective**: Switch from **Grid View** (Zig-Zag scan) to **List View** (Linear scan) to emphasize ranking hierarchy.
*   **Specs**:
    *   **Layout**: Single-column vertical list.
    *   **Columns**:
        1.  **Rank** (Primary Visual): Big, bold Typography. #1, #2, #3 get premium styling.
        2.  **Entity**: Game Icon (64px), Title (Bold), Publisher (Subtext), Genre (Badge).
        3.  **Velocity**: Rank Change indicator (Green Arrow +5 / Red Arrow -2).
    *   **Interaction**: "Load More" button at the bottom of the list (loads next 50/100 items).

## 2. Technical Implementation Tasks

### 2.1 Frontend Components
*   [ ] **Create `ChartRow.tsx`**: A table-row style component optimized for density.
*   [ ] **Update `page.tsx`**:
    *   Remove CSS Grid.
    *   Implement "Load More" logic (Client Component wrapper for valid Server Action state).
    *   Add Sticky Header row.

### 2.2 Data Pipeline (The "Deep Dragnet")
*   [ ] **Pagination Support**: Update `getTrends.ts` to accept `limit` and `offset` params.
*   [ ] **Scraper Limit**: Update `scraper/google_play_fetch.js` to fetch Top 200 items (up from 100).
*   [ ] **Database**: Verify `games` table handles 200+ items per country without view lag.

### 2.3 Genre Data (The "Genre Fix")
*   [ ] **View Update**: Add `genre` column to `daily_trends` SQL view.
*   [ ] **UI Integration**: Pass `genre` string to the new `ChartRow` component.

---

## 3. Actionable Checklist (Sprint 2)

## 3. Actionable Checklist (Sprint 2)

## 3. Actionable Checklist (Sprint 2)

## 3. Actionable Checklist (Sprint 2)

### Phase 1: Database & Backend (Data Model)
*   [x] **View Migration**: Run `db/migration_genre_country_fix.sql`.
    *   *Update*: Modify this SQL to also calculate:
        *   `days_on_chart`: `COUNT(*)` from snapshots (Cumulative days ranked).
        *   `is_new_entry`: Boolean check (`yesterday.rank IS NULL`).
    *   *Purpose*: Powers the "NEW" badge and "Days on Chart" metric.
*   [x] **Data Verification**: Confirm `days_on_chart` increments correctly.

### Phase 2: Visuals & Components (The "Billboard" Clone) **[P0]**
*   [x] **ChartRow Component** (`ChartRow.tsx`):
    *   *Layout*: Single-row Flexbox (Height: ~80px).
    *   *Typography*: 
        *   Rank: **Extra Bold / Black** (Size 24px+). 
        *   Title: **Bold** (Size 16px).
        *   Subtitle: **Light/Regular** (Size 14px) for Publisher & Genre. (No "Badge").
    *   *Metrics Column*:
        *   **"LAST WEEK"**: Rank number from yesterday.
        *   **"DAYS ON CHART"**: Integer count.
        *   **"STATUS"**: 'NEW' Badge or Green/Red arrow.
*   [x] **Filter Controls**: Toggle [Top Free | Top Grossing].
*   [x] **Sticky Header**: Labels for "RANK", "TITLE", "LAST WEEK", "DAYS ON CHART".

### Phase 3: Logic & Integration
*   [x] **Server Action Update** (`getTrends.ts`):
    *   *Logic*: Fetch `days_on_chart`, `is_new_entry`.
    *   *Pagination*: `limit` = 25.
    *   *Sorting*: Sort by Rank Free/Grossing.
*   [x] **Page Refactor** (`page.tsx`):
    *   *Layout*: Stacked Flex Container (No Grid).
    *   *Initial Load*: 25 rows.

### Phase 4: Polish
*   [x] **The #1 Spot**: Distinct "Cyan/Gold" highlight for Rank 1 (Background tint or Border).
*   [ ] **QA**: Verify the "New Entry" logic.
    *   *Issue Found*: Duplicate entries observed in list (Data Deduplication needed in Sprint 3).
