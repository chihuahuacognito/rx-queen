# Strategic Product Roadmap: Rx Queen 2026
**Last Updated**: Jan 7, 2026

---

## 1. Executive Summary

### The Market Gap ("Blue Ocean")
The Mobile Market Intelligence (MMI) sector is a **"Red Ocean"** dominated by SensorTower, Data.ai, and AppMagic. They compete on *revenue accuracy* and *data volume*—a losing battle without $10M+ in infrastructure.

**Our Positioning**: We don't compete on accuracy. We compete on:
1.  **Speed of Trend Detection**: "Who is moving fastest?" not "Who is #1?"
2.  **Narrative Intelligence**: "Why is this game falling?" not just "It's falling."
3.  **Calibrated Revenue Proxies**: Tiered bands ($5k-$20k) instead of false precision.
4.  **Low Friction**: Stripe checkout, not sales calls.

---

## 2. Core Value Propositions

### A. "The Velocity Radar" (Moneyball for Games)
*   **USP**: Flag games moving from Rank #800 → #200 in 24h.
*   **Metric**: Volatility Index score.
*   **Status**: ✅ Implemented (Rank Change column).

### B. "Calibrated Revenue Estimation"
*   **Method**: Power Law curve calibrated with public anchors (dev post-mortems, user's own app data).
*   **Output**: Tiered Bands: `<$5k`, `$5k-$20k`, `$20k-$100k`, `$100k-$500k`, `$500k+`.
*   **Status**: 🚧 Sprint 3.

### C. "Ad Dependency Score"
*   **Logic**: Games ranked high on "Free" but low on "Grossing" are likely ad-dependent.
*   **Formula**: `Score = (Grossing Rank / Free Rank) * Genre_Weight`.
*   **Status**: 🚧 Sprint 3.

### D. "Contextual LiveOps Intelligence"
*   **USP**: Correlate "Last Updated Date" + "Review Sentiment Shifts".
*   **Insight**: "Game X dropped because version 1.2 caused 'Crash' keyword spike."
*   **Status**: 📋 Sprint 5 (Planned).

### E. "Self-Hosted / Open-Source Appeal"
*   **Target**: Studios paranoid about data privacy or wanting custom SQL access.
*   **Status**: ✅ Native PostgreSQL support.

---

## 3. Monetization Model

| Tier | Price | Features |
|:-----|:------|:---------|
| **Hobbyist** | Free | Top 50 (US only), 7-day history, Revenue Bands *blurred*. |
| **Professional** | $49/mo | All Countries, Top 200, 90+ day history, Revenue Bands, Ad Score. |
| **Enterprise** | Custom | API Access, Raw Data Export, Custom Integrations. |

---

## 4. Sprint History & Status

### Sprint 1: Foundation ✅ (Completed Jan 3)
*   [x] Genre Fix: Added `genre` to views and UI.
*   [x] Deep Dragnet: Scraper fetches Top 200.
*   [x] Multi-Country: Added US, GB, CA, DE, JP, BR, IN.

### Sprint 2: "Billboard" Redesign ✅ (Completed Jan 5)
*   [x] UI Pivot: Grid → List View (ChartRow component).
*   [x] Days on Chart: Calculated from snapshot history.
*   [x] New Entry Badge: Flags games with no prior data.
*   [x] Sticky Header: Billboard-style column labels.
*   [x] Rank #1 Highlight: Special styling for top position.
*   [ ] *Open Issue*: Duplicate entries (deduplication needed).

### Sprint 3: Data Reliability & Revenue Proxies 🚧 (In Progress Jan 7-14)
*   [x] Manual Scrape: Ran scraper, ingested Jan 7 data.
*   [ ] **Scheduled Scraper**: Set up daily automation (see Section 6).
*   [ ] Revenue Band Function: `estimate_revenue_band(rank, country)`.
*   [ ] Ad Dependency Function: `calculate_ad_dependency(...)`.
*   [ ] UI: Display revenue bands on ChartRow.

### Sprint 4: "Market Pulse" Dashboard (Planned)
*   **Sector Heatmap**: Aggregate volatility by Genre/Subgenre.
*   **Fastest Movers Feed**: Games with >20 rank delta.
*   **Subgenre Ingestion**: Update scraper to capture subgenre.

### Sprint 5: LiveOps Intelligence (Planned)
*   **"What's New" Scraper**: Fetch update text from store pages.
*   **Review Sentiment**: Scan for "Crash", "Freeze", "Lag" keywords.
*   **"Why?" Badge**: Display correlation insights per game.

---

## 5. Future Features (Competitor Inspiration)

### From IMDb/Rotten Tomatoes:
*   **Release Date Column**: Distinguish "New Viral Hits" vs "Legacy Games".
*   **"Weeks on Chart" Badge**: Identify sticky games.

### From SteamDB:
*   **"Trending" Indicator**: Fire icon for >20 spot jumps.

### From Power Users:
*   **View Toggles**: Billboard View (rich) vs Data Grid (dense/sortable).

---

## 6. Data Automation Options (Cloud Scheduler)

> **User Question**: "Will a Windows Task Scheduler run if my PC is off?"

**Answer**: No. Windows Task Scheduler requires your PC to be powered on. Here are alternatives:

### Option A: n8n Cloud ($20/mo)
*   **How**: Host your n8n workflow on [n8n.cloud](https://n8n.cloud).
*   **Trigger**: Set a Cron node to run `run_scraper.bat` equivalent (via HTTP node calling a cloud function).
*   **Effort**: Medium (need to refactor scraper to run in cloud).

### Option B: GitHub Actions (Free)
*   **How**: Create a `.github/workflows/scrape.yml` that runs `node scraper/google_play_fetch.js` on a schedule.
*   **Trigger**: `schedule: cron: '0 6 * * *'` (6 AM UTC daily).
*   **Pros**: Free, reliable, no PC needed.
*   **Cons**: Need to push scraper code to GitHub and handle secrets for DB connection.

### Option C: Railway / Render / Fly.io (Free Tier)
*   **How**: Deploy a simple Node.js cron job to a free-tier cloud provider.
*   **Trigger**: Use `node-cron` library to schedule scraping.
*   **Pros**: Simple, always-on, free.
*   **Cons**: May need to expose DB or use a cloud DB (e.g., Supabase/Neon).

### Option D: Supabase + Edge Functions (Recommended for Scale)
*   **How**: Migrate PostgreSQL to Supabase (free tier: 500MB).
*   **Trigger**: Supabase Scheduled Functions (cron) to run scraper.
*   **Pros**: DB + Scheduler + Auth all in one. Free tier generous.
*   **Cons**: Migration effort.

### Recommendation:
1.  **Short-Term**: Use **GitHub Actions** (free, reliable, easy to set up).
2.  **Long-Term**: Migrate to **Supabase** for integrated cloud DB + scheduling.

---

## 7. Reusable Asset Inventory

| Asset | Status | Notes |
|:------|:-------|:------|
| **Scraper** (`google_play_fetch.js`) | 🟢 Core | Fetches Top 200 x 7 countries. |
| **Ingestion** (`manual_ingest_all.js`) | 🟢 Solid | Needs subgenre mapping. |
| **DB Views** (`migration_genre_country_fix.sql`) | 🟢 Gold | Powers `daily_trends`. |
| **UI** (`ChartRow.tsx`, `ChartList.tsx`) | 🟢 Premium | Billboard-style list view. |
| **Visual System** (`globals.css`) | 🟢 Premium | Glassmorphism/Neon aesthetic. |

---

## 8. New Tools (Created Jan 7)

### GitHub Actions
- **[`.github/workflows/daily_scrape.yml`]**: Runs scraper daily at 6 AM UTC. Push to GitHub to activate.

### Subgenre Tagging (Hybrid Workflow)
1. **`tools/list_missing_subgenres.js`**: Shows games needing subgenre tags.
2. **`tools/auto_tag_subgenres.js`**: Uses Gemini AI to suggest subgenres. Requires `GEMINI_API_KEY`.
3. **`tools/review_subgenres.html`**: Local UI to approve/edit AI suggestions.
4. **`tools/import_subgenres.js`**: Imports approved subgenres to database.

### Daily Workflow
```
1. node tools/list_missing_subgenres.js     # See what's missing
2. $env:GEMINI_API_KEY="your-key"           # Set API key (PowerShell)
3. node tools/auto_tag_subgenres.js 100     # Auto-tag 100 games
4. Open tools/review_subgenres.html         # Approve/edit suggestions
5. node tools/import_subgenres.js           # Import to DB
```

---

## 9. Immediate Next Actions (This Week)

1.  [ ] **Set up GitHub Actions** for scheduled scraping (see Section 6).
2.  [ ] **Create `migration_revenue_bands.sql`** with revenue band function.
3.  [ ] **Update `daily_trends` view** to include `estimated_revenue`.
4.  [ ] **Update `ChartRow.tsx`** to display revenue badge.
5.  [ ] **Run `ingest_backfill.js`** to fill any missing historical data.

---

This document consolidates all strategy, sprints, and research. Older documents (`sprint_optimization.md`, `design_review_sprint_2.md`, `future_features_analysis.md`) are retained for historical reference but this file is the **single source of truth**.
