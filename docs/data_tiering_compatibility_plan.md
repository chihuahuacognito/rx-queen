# Data Tiering Compatibility Plan

## Overview

This document ensures all current and planned features work seamlessly with our data tiering system:
- **Hot Data**: Raw snapshots (21 days in Supabase)
- **Warm Data**: Weekly summaries (forever in Supabase)
- **Cold Data**: Game lifetime stats (forever in Supabase)
- **Archive**: Full raw data (forever on local PC)

---

## Data Architecture

### Table 1: `snapshots` (Hot - 21 Day Retention)

| Column | Type | Description |
|:-------|:-----|:------------|
| id | UUID | Primary key |
| game_id | UUID | FK to games |
| country_code | TEXT | 2-letter code |
| rank_free | INT | Free chart position |
| rank_paid | INT | Paid chart position |
| rank_grossing | INT | Grossing chart position |
| captured_at | TIMESTAMPTZ | Timestamp |

**Retention**: Rolling 21 days. Older data archived to local, then deleted.

---

### Table 2: `weekly_summaries` (Warm - Forever)

| Column | Type | Description |
|:-------|:-----|:------------|
| game_id | UUID | FK to games |
| country_code | TEXT | 2-letter code |
| week_start | DATE | Monday of that week |
| avg_rank_free | NUMERIC | Average rank |
| best_rank_free | INT | Best rank that week |
| worst_rank_free | INT | Worst rank that week |
| avg_rank_grossing | NUMERIC | Grossing average |
| best_rank_grossing | INT | Grossing peak |
| days_on_chart | INT | Days appeared (0-7) |
| volatility_score | NUMERIC | Std deviation of rank |

**Populated By**: Weekly scheduled job (Sunday night)

---

### Table 3: `game_stats` (Cold - Forever)

| Column | Type | Description |
|:-------|:-----|:------------|
| game_id | UUID | Primary key, FK to games |
| first_seen_at | TIMESTAMPTZ | When we first tracked this game |
| last_seen_at | TIMESTAMPTZ | Most recent appearance |
| all_time_best_rank_free | INT | Historical peak (Free) |
| all_time_best_rank_grossing | INT | Historical peak (Grossing) |
| all_time_best_rank_free_date | DATE | When peak occurred |
| total_days_on_chart | INT | Cumulative days appeared |
| total_weeks_tracked | INT | Weeks in our database |
| peak_power_score | NUMERIC | Highest power score ever |
| best_country_code | TEXT | Country where it ranked highest |

**Updated By**: Daily job after ingestion

---

## Feature Compatibility Matrix

### Current Features (Sprint 1-2)

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Live Rankings List** | Current rank by country | `snapshots` (today) | ✅ Works |
| **Rank Change (24h)** | Today vs yesterday rank | `snapshots` (2 days) | ✅ Works |
| **Days on Chart** | First appearance date | `game_stats.first_seen_at` | ✅ Works |
| **New Entry Badge** | Is this game new? | `game_stats.first_seen_at` | ✅ Works |
| **Genre Filter** | Filter by genre | `games.genre` | ✅ Works |
| **Country Selector** | Switch countries | `snapshots.country_code` | ✅ Works |

---

### Sprint 3.1: Market Pulse UI

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Fastest Riser** | Max positive rank change | `snapshots` (2 days) | ✅ Works |
| **Biggest Faller** | Max negative rank change | `snapshots` (2 days) | ✅ Works |
| **Sector Heat** | Avg velocity by genre | `snapshots` (7 days) | ✅ Works |
| **Power Score** | Current rank + velocity | `snapshots` (2 days) | ✅ Works |

---

### Sprint 3.2: Revenue & Ad Intelligence

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Ad Dependency Score** | Free rank / Grossing rank | `snapshots` (today) | ✅ Works |
| **Revenue Band Estimate** | Current grossing rank | `snapshots` (today) | ✅ Works |

---

### Product 1: Nano-Trend Velocity Index (NTVI)

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **7-Day Tag Velocity** | Rank changes over 7 days | `snapshots` (7 days) | ✅ Works |
| **Monthly Trend Comparison** | Month-over-month | `weekly_summaries` | ✅ Works |
| **Lifecycle Stage (Emergent/Peak/Saturated)** | 4-week trend | `weekly_summaries` (4 weeks) | ✅ Works |
| **Historical Trend (Year)** | 52-week comparison | `weekly_summaries` (52 weeks) | ✅ Works |

---

### Product 2: Visual Fatigue Heatmap

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Art Style Rank Decay (30 days)** | Rank over 30 days | ⚠️ Need 30 days | Use `weekly_summaries` |
| **Fatigue Coefficient** | Survival rate in Top 200 | `weekly_summaries` (4 weeks) | ✅ Works |
| **Blue Ocean Matrix** | Saturation vs velocity | `weekly_summaries` + current `snapshots` | ✅ Works |

**Mitigation**: For 30-day decay, use weekly averages instead of daily. Precision reduced slightly but insight preserved.

---

### Product 3: LiveOps X-Ray

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Update Impact (7 days)** | Pre/post update ranks | `snapshots` (14 days) | ✅ Works |
| **Pulse Score Calculation** | Rank lift area under curve | `snapshots` (14 days) | ✅ Works |
| **Cadence Analysis (3 months)** | Update frequency patterns | `weekly_summaries` (12 weeks) | ✅ Works |

---

### Product 4: Global Breakout Engine

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Cross-Country Correlation** | Multi-market trends | `snapshots` (14 days) | ✅ Works |
| **Lead-Lag Analysis (6 months)** | Historical cross-market | `weekly_summaries` (24 weeks) | ✅ Works |
| **Soft Launch Validator** | Historical conversion rates | `weekly_summaries` + `game_stats` | ✅ Works |

---

### Product 5: True-LTV Valuation

| Feature | Data Required | Data Source | Status |
|:--------|:--------------|:------------|:-------|
| **Ad Dependency Ratio** | Current Free vs Grossing | `snapshots` (today) | ✅ Works |
| **Rank Stability (90 days)** | Volatility over quarter | `weekly_summaries` (12 weeks) | ✅ Works |
| **All-Time Best Rank** | Historical peak | `game_stats.all_time_best_rank_free` | ✅ Works |
| **Investment Signal** | Combined metrics | All tables | ✅ Works |

---

## Features Requiring Adjustment

| Feature | Original Need | Adjusted Approach | Impact |
|:--------|:--------------|:------------------|:-------|
| **30-Day Decay Curve** | Daily data × 30 days | Weekly averages × 4 weeks | Minor precision loss |
| **Hourly Volatility** | Hourly snapshots | Not supported | ❌ Future upgrade |
| **Raw Historical Queries** | Full history | Query local archive | Manual process |

---

## Implementation Checklist

### Phase 1: Database Schema (Day 1)

- [ ] Create `weekly_summaries` table
- [ ] Create `game_stats` table
- [ ] Add indexes for performance
- [ ] Create views for backward compatibility

### Phase 2: Aggregation Jobs (Day 2)

- [ ] Create `aggregate_weekly_summary()` function
- [ ] Create `update_game_stats()` function
- [ ] Schedule weekly summary job (Sunday night)
- [ ] Schedule daily stats update (after ingestion)

### Phase 3: Cleanup Jobs (Day 3)

- [ ] Create `archive_old_snapshots()` function
- [ ] Create local archive script
- [ ] Schedule cleanup job (weekly, after archive)
- [ ] Test archive/restore process

### Phase 4: Feature Migration (Day 4-5)

- [ ] Update `daily_trends` view to use new tables
- [ ] Update dashboard queries
- [ ] Add fallback logic for missing data
- [ ] Test all existing features

### Phase 5: Verification (Day 6)

- [ ] Verify all current features work
- [ ] Verify new features have data access
- [ ] Monitor storage usage
- [ ] Document any edge cases

---

## SQL Schema

```sql
-- Weekly Summaries Table
CREATE TABLE weekly_summaries (
    game_id UUID REFERENCES games(id),
    country_code TEXT NOT NULL,
    week_start DATE NOT NULL,
    avg_rank_free NUMERIC,
    best_rank_free INT,
    worst_rank_free INT,
    avg_rank_grossing NUMERIC,
    best_rank_grossing INT,
    days_on_chart INT DEFAULT 0,
    volatility_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (game_id, country_code, week_start)
);

-- Game Lifetime Stats Table
CREATE TABLE game_stats (
    game_id UUID PRIMARY KEY REFERENCES games(id),
    first_seen_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    all_time_best_rank_free INT,
    all_time_best_rank_grossing INT,
    all_time_best_rank_free_date DATE,
    all_time_best_rank_grossing_date DATE,
    total_days_on_chart INT DEFAULT 0,
    total_weeks_tracked INT DEFAULT 0,
    peak_power_score NUMERIC,
    best_country_code TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_weekly_summaries_week ON weekly_summaries(week_start);
CREATE INDEX idx_weekly_summaries_game ON weekly_summaries(game_id);
CREATE INDEX idx_game_stats_best_rank ON game_stats(all_time_best_rank_free);
```

---

## Conclusion

**All 5 planned products and all current features are compatible** with the data tiering system.

Minor adjustments:
- 30-day analysis uses weekly averages (4 data points instead of 30)
- Deep historical queries require local archive access

No features are blocked or impossible.
