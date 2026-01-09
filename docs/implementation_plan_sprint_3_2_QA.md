# Sprint 3.2.QA: Performance & Accuracy Validation
**Date**: January 9, 2026  
**Status**: ⚠️ Blocking Issue Identified  
**Priority**: CRITICAL (Blocks Sprint 3.1 UI and all future features)

---

## 1. Problem Statement

### Symptom
The `daily_trends` view (core data source for the dashboard) takes **>20 seconds** to query, causing:
- Dashboard load timeouts
- QA inability to verify rank accuracy
- Blocked deployment of Sprint 3.1 "Market Pulse" features

### Root Cause Analysis (Corrected)
The original plan attributed slowness to "missing indices". Upon reviewing `db/migration_genre_country_fix.sql`, the **actual** bottleneck is:

1. **Triple Self-Join on Heavy CTE**: The view calls `distinct_daily_snapshots` **three times** (for `country_stats`, `today`, and `yesterday`).
2. **Window Function on Full Table**: `ROW_NUMBER() OVER (PARTITION BY game_id, country_code, day_bucket ORDER BY captured_at DESC)` computes across the *entire* `snapshots` table before filtering.
3. **Full-Table Scan for `chart_days`**: The `COUNT(DISTINCT date_trunc(...))` in `chart_days` CTE scans all 90,000+ snapshots per game.

**Indices help marginally but cannot fix the core architectural issue.**

---

## 2. Revised Remediation Plan

### Step 1: Materialized View (Priority 1 - REQUIRED)
Convert `daily_trends` from a regular VIEW to a **Materialized View** that is refreshed periodically (e.g., after each scrape).

**SQL Migration** (`db/migration_materialized_trends.sql`):
```sql
-- Drop old view
DROP VIEW IF EXISTS daily_trends;

-- Create Materialized View (same logic, but cached)
CREATE MATERIALIZED VIEW daily_trends AS
WITH country_stats AS (
    SELECT country_code, MAX(day_bucket) as latest_day 
    FROM distinct_daily_snapshots
    GROUP BY country_code
),
today AS (
    SELECT s.* 
    FROM distinct_daily_snapshots s
    JOIN country_stats cs ON s.country_code = cs.country_code 
    AND s.day_bucket = cs.latest_day
),
yesterday AS (
    SELECT s.* 
    FROM distinct_daily_snapshots s
    JOIN country_stats cs ON s.country_code = cs.country_code 
    AND s.day_bucket = cs.latest_day - INTERVAL '1 day'
),
chart_days AS (
    SELECT 
        s.game_id, 
        s.country_code,
        COUNT(DISTINCT date_trunc('day', s.captured_at AT TIME ZONE 'UTC')) as days_count
    FROM snapshots s
    GROUP BY s.game_id, s.country_code
)
SELECT 
    t.game_id, g.name, g.store_id, g.genre, g.publisher, g.icon_url, t.country_code,
    t.rank_free as current_rank_free, t.rank_grossing as current_rank_grossing,
    (y.rank_free - t.rank_free) as rank_change_free,
    (y.rank_grossing - t.rank_grossing) as rank_change_grossing,
    d.days_count as days_on_chart, (y.game_id IS NULL) as is_new_entry,
    t.captured_at as last_updated
FROM today t
JOIN games g ON t.game_id = g.id
LEFT JOIN yesterday y ON t.game_id = y.game_id AND t.country_code = y.country_code
LEFT JOIN chart_days d ON t.game_id = d.game_id AND t.country_code = d.country_code
WHERE t.rank_free IS NOT NULL OR t.rank_grossing IS NOT NULL;

-- Create index on the materialized view for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_trends_country ON daily_trends (country_code);
CREATE INDEX IF NOT EXISTS idx_daily_trends_game ON daily_trends (game_id);

-- Initial refresh
REFRESH MATERIALIZED VIEW daily_trends;
```

### Step 2: Automate Refresh in Ingestion Pipeline
Update `ingest_to_supabase.js` (or GitHub Actions workflow) to run:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_trends;
```
...after each data ingestion completes.

**Note**: `CONCURRENTLY` requires a unique index. We may need:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_trends_pk ON daily_trends (game_id, country_code);
```

### Step 3: Indices for Base Table (Secondary)
These are supplementary and were already applied:
- `idx_snapshots_country_date`
- `idx_snapshots_game_id`
- `idx_snapshots_composite_lookup`

### Step 4: Rank Accuracy Verification
Once the materialized view is in place and returns in <2 seconds:
1. Run `node tests/test_rank_accuracy.js`
2. Verify for 5 games: `Calculated Change == View Value`

---

## 3. Execution Steps

| # | Task | Owner | Tool/Script |
|---|------|-------|-------------|
| 1 | Create `db/migration_materialized_trends.sql` | Agent | Manual |
| 2 | Apply migration to Supabase | Agent | `tools/apply_perf_fix.js` (updated) |
| 3 | Update `ingest_to_supabase.js` with REFRESH logic | Agent | Code Edit |
| 4 | Validate view speed | Agent | `debug_daily_trends.js` |
| 5 | Run Rank Accuracy Test | Agent | `tests/test_rank_accuracy.js` |
| 6 | Test Dashboard Load Time | User | Browser Dev Tools |

---

## 4. Acceptance Criteria

| Metric | Target | Stretch Goal |
|--------|--------|--------------|
| `daily_trends` query time | < 2 seconds | < 500ms |
| Rank accuracy (5 games) | 100% match | — |
| Dashboard load (ChartList) | < 3 seconds | < 1 second |
| Ingestion refresh overhead | < 30 seconds | < 10 seconds |

---

## 5. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `REFRESH MATERIALIZED VIEW` takes too long | Medium | Use `CONCURRENTLY` option (requires unique index) |
| View data staleness during refresh | Low | Refresh runs immediately after ingestion; staleness window is <1 min |
| Supabase free tier limits | Low | Monitor usage; consider upgrade if exceeding |

---

## 6. References
- `db/migration_genre_country_fix.sql` — Original view definition
- `docs/engineering_handbook.md` — Debug scripts inventory (Section 4.5)
- `docs/product_strategy_2026.md` — Sprint status (Section 4)
- `docs/playbook.md` — Raw SQL Protocol (Rule 2.2)

---

## 7. Post-Completion
Once this sprint passes:
1. Update `docs/QA_Report.md` with PASS status for accuracy.
2. Proceed with **Sprint 3.1 UI** implementation (blocked until this is resolved).
3. Mark "Open Issue: Duplicate entries" from Sprint 2 as resolved if the view deduplication works correctly.

---

## 8. Sprint Completion Checklist
> **Instructions**: Only the USER may mark these items as complete. The sprint is considered DONE only when ALL items are checked.

### Database Tasks
- [ ] Migration file `db/migration_materialized_trends.sql` created
- [ ] Migration applied to Supabase successfully
- [ ] Unique index for CONCURRENTLY refresh created
- [ ] Base table indices verified

### Pipeline Integration
- [ ] `ingest_to_supabase.js` updated with REFRESH logic
- [ ] GitHub Actions workflow updated (if applicable)

### Validation Tasks
- [ ] `daily_trends` query returns in < 2 seconds
- [ ] `test_rank_accuracy.js` passes (5 games verified)
- [ ] Dashboard `ChartList` loads without timeout

### Live Store Validation (LV-01) ✨ NEW
- [ ] Run `node tests/test_live_comparison.js` and note rankings
- [ ] Compare with live Google Play Store (US market)
- [ ] Achieved ≥80% match rate (8/10 games in correct positions)

### Final Sign-off
- [ ] QA Report updated with PASS status
- [ ] QA Test Plan updated with Live Validation procedure
- [ ] Ready to proceed with Sprint 3.1 UI

---
**Sprint Status**: 🟡 VALIDATION PENDING  
**Last Updated**: January 9, 2026
