# Implementation Plan - Gaming Insights Platform

## Product Market Fit & Strategy

### The Problem
The current gaming intelligence market is dominated by enterprise giants like **AppMagic**, **Data.ai**, **SensorTower**, and **Newzoo**.
- **High Barrier**: Costs often exceed **$10k-$50k/year**.
- **Opaque Pricing**: "Contact Sales" is the standard.
- **Overkill**: Indie developers and mid-sized studios don't need enterprise-grade precision; they need **trend spotting** and **competitor benchmarking**.

### The Solution: "Google Play Trend Tracker"
A robust, maintenance-free platform that tracks **Rank History** and **Emerging Hits** using public Google Play Store data. No logins, no bans, just data.

**Key Value Propositions:**
1.  **Reliability**: Using public data means zero downtime due to auth blocks or "human verification".
2.  **Trend Detection**: Detecting when a game jumps from Rank #100 to Rank #10 (aka "The Breakout").
3.  **Cross-Country Scouting**: Easily scouting Top Charts in geo-arbitrage regions (e.g., Vietnam, Turkey, Brazil).
4.  **Consolidated View**: "Top Grossing" vs "Top Free" correlation.

### Data Strategy (Pivot: Public Only)

| Source | Method | Feasibility | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Google Play** | **Scraping Lib** | High | **Primary** | `google-play-scraper` accesses public store pages. No login required. |
| **AppMagic** | **Auth** | Low | **Dropped** | Security barriers (Cloudflare) too high for stable automation. |
| **Data.ai** | **Auth** | Low | **Dropped** | Security barriers too high. |

---

## Technical Architecture

### 1. Data Ingestion (Node.js)
- **Script**: `scraper/google_play_fetch.js`
- **Schedule**: n8n runs this every 6 hours for key countries (US, UK, CA, DE, JP, KR).
- **Data Points**: Rank, Rating, Reviews, Downloads (Range), Developer, Genre.

### 1. Orchestration Engine (n8n)
- **Workflows**:
    1.  **Public Ingest (`workflow_public_ingest.json`)**: 
        - Runs every 6 hours.
        - Executes `scraper/google_play_fetch.js` to scrape Top Free, Paid, and Grossing charts.
        - Upserts Game Metadata to Postgres.
        - Inserts Rank Snapshots (Free, Paid, Grossing) to Postgres.

### 2. Database (PostgreSQL)
Stores the history that public stores don't show.
- `games`: Metadata (Name, ID, Genre, Icon).
- `snapshots`: Time-series data (Rank, Rating, Price, Date).

### 3. Frontend Dashboard (Web App)
A beautiful, "Game-fi" styled dashboard.
- **Tech Stack**: Next.js (App Router) + Tailwind CSS + Lucide Icons.
- **Features**:
    - **Market Pulse**: Displays "Top Movers" (games with rank changes).
    - **Live Data**: Fetches directly from local Postgres via Server Actions.
    - **Premium UI**: Glassmorphism, Dark Mode, Gradients.

---

## Sprint 1: The Engine & Dashboard (Completed)

We have successfully pivoted from a complex, unreliable "Premium API" scraper to a robust "Public Intelligence" platform.

### What We Built:
1.  **The Engine (n8n + Node.js)**: 
    - A scraper that bypasses auth by looking at public Google Play pages.
    - An automated pipeline that self-heals (upsert logic) and tracks history.
2.  **The Memory (PostgreSQL)**:
    - A structured database that currently holds ~300 top games.
    - SQL Views (`daily_trends`) that automatically calculate who is winning/losing.
3.  **The Face (Next.js Dashboard)**:
    - A stunning dark-mode interface.
    - "Top Movers" grid that highlights breakout hits immediately.
    - Zero-API-Latency: It talks directly to your database.

### Next Steps (Sprint 2):
1.  **Historical Charts**: Add sparkline charts to the cards to show 7-day trend.
2.  **Genre Filtering**: Allow users to see only "Action" or "Strategy" movers.
3.  **Deploy**: Move this from localhost to a VPS (optional).
