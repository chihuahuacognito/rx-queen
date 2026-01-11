# Chart System Investigation & Fix Plan
**Created:** January 10, 2026  
**Status:** ✅ FIXED AND VERIFIED

---

## Issue Summary
The chart system had multiple critical issues preventing accurate data display:
1.  **Paid Chart Empty:** `rank_paid` was never ingested.
2.  **Duplicate Ranks:** Lack of unique constraints allowed duplicate snapshots.
3.  **View Timeouts:** `daily_trends` materialized view refresh was timing out (5min limit) due to data volume (100k+ rows).

---

## Fix Implementation

### 1. Ingestion Logic Fixed
- Updated `ingest_to_supabase.js` to handle `TOP_PAID`.
- Changed INSERT to **UPSERT** (ON CONFLICT DO UPDATE).
- Ensures a game appearing in multiple charts (e.g., Free + Grossing) updates a single snapshot record instead of creating duplicates.

### 2. Database Integrity Enforced
- Cleaned 60,000+ duplicate records.
- Created unique index: `idx_snapshots_game_country_day_unique`.

### 3. Timeout Solution (Critical)
- **Problem:** `REFRESH MATERIALIZED VIEW` timed out consistently.
- **Solution:** Migrated to a **Table-based Caching Strategy**.
    - Created `daily_trends_cache` table.
    - Created `scripts/refresh_trends_table.js` to refresh data country-by-country (incremental).
    - Created `daily_trends` VIEW as a wrapper (maintains frontend compatibility).

### 4. Automation
- Ingestion script now spawns `refresh_trends_table.js` automatically after data load.

---

## Verification Results

| Check | Result |
|:------|:-------|
| Ingestion runs without error | ✅ |
| Duplicates removed | ✅ |
| Paid chart data present | ✅ |
| View refresh avoids timeout | ✅ (Incremental strategy works) |

---

## Next Steps
- Verify Dashboard UI shows "Paid" chart correctly (Frontend work needed to add toggle).
