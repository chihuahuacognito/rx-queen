# Strategic Product Roadmap: Rx Queen 2026
**Last Updated**: Jan 9, 2026

---

## 1. Executive Summary

### The Market Gap ("Blue Ocean")
The Mobile Market Intelligence (MMI) sector is a **"Red Ocean"** dominated by SensorTower, Data.ai, and AppMagic. They compete on *revenue accuracy* and *data volume*—a losing battle without $10M+ in infrastructure.

**Our Positioning**: We don't compete on data volume. We compete on:
1.  **Velocity Intelligence**: "Who is moving fastest?" not "Who is #1?"
2.  **AI-Enriched Taxonomy**: LLM-generated subgenres, themes, and art styles that stores don't provide.
3.  **Causal Insights**: "Why is this game spiking?" not just "It's spiking."
4.  **Cross-Market Arbitrage**: Track trends across 7 economies to predict global breakouts.

---

## 2. The Five Core Data Products

Based on deep market research, we will build **5 distinct data products** that solve specific, expensive problems for our target audiences.

### Product 1: Nano-Trend Velocity Index (NTVI)
| Attribute | Detail |
|:----------|:-------|
| **Problem** | "Fast-Follower Fallacy" — Studios identify trends too late, after CPI has spiked and the market is saturated. |
| **Solution** | Track aggregate rank velocity by **Tag Cluster** (Subgenre + Theme + Art Style), not individual games. Detect "Emergent" trends before they hit Top 10. |
| **Key Metric** | Trend Momentum Score per tag cluster |
| **Presentation** | "Trend Futures" ticker, "Pivot Simulator" tool, Regional Heatmap |
| **Target Audience** | Game Designers, Producers |
| **Status** | 📋 Planned (Sprint 4) |

### Product 2: Visual Saturation & Fatigue Heatmap
| Attribute | Detail |
|:----------|:-------|
| **Problem** | "Visual Fatigue" — Choosing an art style based on current hits without knowing the audience is tired of it. |
| **Solution** | Correlate Art Style tags with Rank Decay metrics to calculate "Fatigue Coefficient". Plot on "Blue Ocean Matrix" (Saturation vs Performance). |
| **Key Metric** | Fatigue Coefficient, "Golden Zone" identification |
| **Presentation** | "White Space" Visualizer, Competitor Gallery with Art Style grouping |
| **Target Audience** | UA Managers, Art Directors, Creative Producers |
| **Status** | 📋 Planned (Sprint 5) |

### Product 3: LiveOps ROAS Simulator (Competitor X-Ray)
| Attribute | Detail |
|:----------|:-------|
| **Problem** | Competitor LiveOps success is a "black box". Teams don't know which event types (Battle Pass, Tournament, Sale) drive the highest ROI. |
| **Solution** | Parse "What's New" text with LLM, classify event types, correlate with rank volatility to calculate "LiveOps Pulse Score". |
| **Key Metric** | Pulse Score = (Rank Lift AUC) / (Complexity Index) |
| **Presentation** | Competitor Timeline with event icons, "ROI Benchmarker" tool, Cadence Analyzer |
| **Target Audience** | Product Managers, LiveOps Leads |
| **Status** | 📋 Planned (Sprint 6) |

### Product 4: Global Breakout Probability Engine
| Attribute | Detail |
|:----------|:-------|
| **Problem** | "Soft Launch Gamble" — Assuming soft launch success predicts global success. Brazil ≠ US. |
| **Solution** | Lead-Lag Cross-Correlation across 7 economies. Calculate "Arbitrage Score" for global success probability. |
| **Key Metric** | P(success) = V(soft_launch) * α(genre) - S(target_market) * β |
| **Presentation** | "Global Scout" Map, "Crystal Ball" predictive list, Soft Launch Validator |
| **Target Audience** | Publishers, Executives |
| **Status** | 📋 Planned (Sprint 7) |

### Product 5: True-LTV Valuation Model ("Ad-Farm" Detector)
| Attribute | Detail |
|:----------|:-------|
| **Problem** | "Fake Rich" valuations — Games with high downloads but zero profit (Ad Farms). Investors can't distinguish. |
| **Solution** | Analyze divergence between Free Rank (Downloads) and Grossing Rank (Revenue). High gap = Ad Dependent. |
| **Key Metric** | Ad Dependency Ratio = Rank(Free) / Rank(Grossing) |
| **Presentation** | "Due Diligence" Dashboard, Buy/Sell Signal, "Hollow Shell" Alert |
| **Target Audience** | Investors, M&A Teams, Publisher Scouts |
| **Status** | 🚧 Partially Started (Ad Dependency Score in Sprint 3.2) |

---

## 3. The "Unfair Advantage" (Unique Capabilities)

### A. AI Taxonomist (Hybrid LLM Tagging)
*   **Granular Subgenres**: "Screw Puzzle", "4X Strategy", "Bullet Heaven"
*   **Thematic Analysis**: "Sci-Fi", "Medieval", "Anime", "Post-Apocalyptic"
*   **Art Style Detection**: "Low Poly", "Voxel", "Hyper-Realistic", "Pixel Art"
*   **Status**: ✅ Implemented via `tools/auto_tag_subgenres.js`

### B. High-Frequency Rank Volatility (HFRV)
*   **Scope**: Top 200 games × 7 economies (US, UK, JP, IN, BR, DE, CA)
*   **Granularity**: Daily snapshots (scalable to hourly)
*   **Derived Metrics**: Rank Delta, Power Score, Days on Chart
*   **Status**: ✅ Implemented

### C. Synthetic Scoring Engines
*   **Power Score**: Dominance (Rank) + Momentum (Velocity)
*   **Ad Dependency Score**: Free Rank / Grossing Rank
*   **Genre Health Index**: Aggregate rank velocity by tag cluster
*   **LiveOps Pulse**: Update correlation with rank spikes
*   **Status**: 🚧 Power Score done, others planned

---

## 4. Monetization Model (Updated)

| Tier | Price | Features | Target |
|:-----|:------|:---------|:-------|
| **Free** | $0 | Top 50 (US only), 7-day history, Basic charts | Hobbyists |
| **Pro** | $49/mo | All countries, Top 200, 90-day history, Power Score, Genre Heat | Indie Devs |
| **Business** | $199/mo | NTVI Trend Radar, Visual Fatigue Heatmap, Competitor X-Ray | Studios, Publishers |
| **Enterprise** | Custom | Global Breakout Engine, True-LTV Valuator, API Access, Custom Reports | Investors, M&A |

---

## 5. Sprint History & Roadmap

### ✅ Completed Sprints

#### Sprint 1: Foundation (Jan 3)
- [x] Genre Fix: Added `genre` to views and UI
- [x] Deep Dragnet: Scraper fetches Top 200
- [x] Multi-Country: US, GB, CA, DE, JP, BR, IN

#### Sprint 2: Billboard Redesign (Jan 5)
- [x] UI Pivot: Grid → List View (ChartRow)
- [x] Days on Chart, New Entry Badge
- [x] Sticky Header, Rank #1 Highlight

### 🚧 Current Sprint

#### Sprint 3.1: Market Pulse UI (Jan 8-12)
**Phase A: Data Infrastructure**
- [x] `genre_stats` & `power_rankings` SQL views
- [ ] Create `weekly_summaries` table
- [ ] Create `game_stats` table (lifetime aggregates)
- [ ] Implement data tiering (21-day retention + weekly rollups)
- [ ] Local archive script for cold storage

**Phase B: Signal Cards (Command Deck)**
- [ ] Fastest Rising Game (daily/weekly/monthly toggle)
- [ ] Biggest Falling Game (daily/weekly/monthly toggle)
- [ ] Hottest Rising Genre (Sector Heat)
- [ ] Coldest Falling Genre
- [ ] Power Score leader display

**Phase C: Game View Panel**
- [ ] Slide-out panel on game click
- [ ] Game metadata (Developer, Genre, Subgenre)
- [ ] Historical stats (All-time best rank, Days on chart)
- [ ] Rank within subgenre
- [ ] Trend sparkline (7-day + 30-day)
- [ ] Placeholder for Theme and Art Style (future AI tagging)

**Phase D: UI Integration**
- [ ] Command Deck Bento layout
- [ ] Power Score dots indicator
- [ ] Responsive design testing

#### Sprint 3.2: Revenue & Ad Intelligence (Jan 11-15)
- [ ] Revenue Band Function
- [ ] **Ad Dependency Score** (Product 5 foundation)
- [ ] UI badges for revenue/ad metrics

### 📋 Upcoming Sprints

#### Sprint 4: Nano-Trend Velocity Index (Jan 16-22)
- [ ] Tag Cluster aggregation logic
- [ ] Trend Momentum Score calculation
- [ ] "Trend Futures" ticker UI
- [ ] Lifecycle tagging (Emergent → Growth → Peak → Saturated)

#### Sprint 5: Visual Fatigue Heatmap (Jan 23-29)
- [ ] Art Style tag enrichment
- [ ] Fatigue Coefficient calculation
- [ ] "Blue Ocean Matrix" visualization
- [ ] Creative Refresh Alerts

#### Sprint 6: LiveOps Intelligence (Jan 30 - Feb 5)
- [ ] "What's New" scraper for update text
- [ ] LLM event classification
- [ ] LiveOps Pulse Score calculation
- [ ] Competitor X-Ray Timeline

#### Sprint 7: Global Breakout Engine (Feb 6-12)
- [ ] Lead-Lag cross-correlation model
- [ ] Arbitrage Score calculation
- [ ] "Global Scout" predictive map
- [ ] Soft Launch Validator tool

---

## 6. Infrastructure Status

| Component | Status | Notes |
|:----------|:-------|:------|
| **Database** | ✅ Supabase | PostgreSQL in cloud, 90K+ snapshots |
| **Dashboard** | ✅ Vercel | Next.js deployed, live at [URL] |
| **Scraper** | ✅ GitHub Actions | Daily at 6 AM UTC |
| **Ingestion** | ✅ Direct to Supabase | No git conflicts |
| **Notifications** | ✅ ntfy.sh | Push alerts on scrape complete |
| **AI Tagging** | ✅ Gemini API | Auto-tag with human review |

---

## 7. Key Research Documents

| Document | Purpose |
|:---------|:--------|
| `docs/rxqueenmarket.txt` | 5 Data Product concepts with packaging |
| `docs/mobilegamesolutions.txt` | Deep technical specifications for each product |
| `docs/ui_design_plan.md` | UI component specifications & design system |
| `docs/data_tiering_compatibility_plan.md` | Data architecture & feature compatibility |
| `docs/country_selection_analysis.md` | Research-based 22-country selection |
| `docs/scraping_expansion_plan.md` | Scaling plan & cost analysis |
| `docs/engineering_handbook.md` | Technical lessons learned |
| `docs/research_brief_dashboard_value.md` | Problem statement & capabilities |

---

## 8. Summary: The Strategic Moat

| Product | Critical Question Answered | Target Audience |
|:--------|:---------------------------|:----------------|
| **NTVI** | "What specific mechanic should I build next?" | Game Designers |
| **Visual Fatigue** | "What art style will lower my CPI?" | UA Managers |
| **LiveOps X-Ray** | "What event type drives the highest revenue lift?" | Product Managers |
| **Global Breakout** | "Is my soft launch predicting global success?" | Publishers |
| **True-LTV** | "Is this studio a sound investment or an ad farm?" | Investors |

**The "Secret Weapon"**: Cross-correlation of LLM Tags + Volatility to reveal causal mechanisms of market success.

---

*This document is the single source of truth for Rx Queen product strategy. Last major update: Jan 9, 2026.*
