# Product Retrospective & Strategy
*Consolidated learnings, future sprints, and strategic pivots.*

## 1. Project Learnings (Technical & Strategic)

### What Went Well? ("The Wins")
1.  **Public Data Pivot**: Moving from paid/blocked APIs (AppMagic) to "Public Scraping" (`google-play-scraper`) was a game changer.
    *   **Result**: Zero blocks, infinite free data, no authentication headers to maintain.
2.  **Direct-to-DB Dashboard**: Using Next.js Server Actions to read Postgres directly (bypassing a REST API layer) made the frontend extremely fast and simple to build.
3.  **Modular Scrapers**: Keeping the scraping logic in external Node.js scripts (instead of inside n8n Function nodes) made debugging easier and kept the workflow clean.

### What Went Wrong? ("The Frictions")
1.  **Windows Pathing Hell**: ~30% of Sprint 1 was lost debugging "Command Not Found" errors because of the space in the folder name `Rx Queen`.
    *   *Lesson*: **Always Quote Paths** in CLI arguments.
2.  **Postgres "Upsert" Flakiness**: The n8n Postgres node's "Upsert" mode proved unreliable across versions, often failing silently.
    *   *Lesson*: **Use Raw SQL** (`INSERT ... ON CONFLICT`) for all writes.
3.  **Data Volume Crashes**: Passing 10MB JSON files through n8n's memory caused crashes.
    *   *Lesson*: **Use File-Based Handoffs** (Write to disk -> Pass path -> Read from disk).
4.  **The UTC Truncation Trap**: We found duplicate chart entries because `date_trunc('day', ...)` defaults to the *session* timezone (IST), causing snapshots from the same UTC day to be split into two different local days.
    *   *Lesson*: **Always force Timezone**: `date_trunc('day', timestamp AT TIME ZONE 'UTC')`.

---

## 2. Sprint Logs

### Sprint 1: Foundation (Completed - Jan 2026)
*   **Goal**: Establish the "Core Engine" (Scrape -> DB -> Dashboard).
*   **Status**: ✅ Complete.

### Sprint 2: The Billboard Redesign (Completed - Jan 2026)
*   **Goal**: Transform UI to "Royal Navy" Billboard style & fix data integrity.
*   **Status**: ✅ Complete.
*   **Key Deliverables**:
    *   **Visuals**: Deep Navy Theme, Gold/Silver/Bronze gradients, Glassmorphism accents.
    *   **Data**: Deduplicated Views (UTC fix), "Days on Chart" metric, "New Entry" badges.
    *   **UX**: Infinite Scroll (25 items/page), Dynamic Filters (Country + Category).
*   **Tasks**:
    1.  [ ] **The Visuals**: Switch from Grid --> List View (Status: P0).
    2.  **The Context**: Add "Days on Chart" and "New Entry" badges (replaces "Weeks on Chart").
    3.  **The Filters**: Add [Top Free | Top Grossing] toggle.
    4.  **The Data**: Expand scraper to Top 200.

### Sprint 3: The Context Layer (Future)
*   **Concept**: Adding the "Why" behind the rank.
*   **Features**:
    *   **Release Date Intellingence**: Scrape `released` date to distinguish "New Viral Hits" vs "Legacy Updates".
    *   **Density Toggles**: Allow "Analyst View" (Excel-style) vs "Executive View" (Billboard-style).
    *   **Momentum**: "Fire" icons for >20 spot jumps.

---

## 3. Product Roadmap
*   **Phase 1 (Now)**: Reliability & The "Billboard" Aesthetics.
*   **Phase 2**: Intelligence (Release Dates, Retention estimation via 'Days on Chart').
*   **Phase 3**: Monetization (Analyst View & Export to CSV).
