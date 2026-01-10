# QA Master Test Plan: Rx Queen
**Date:** January 10, 2026  
**Version:** 3.0  
**Scope:** Validation of Sprint 1, 2, 3.2.QA, and **Sprint 3.1 Phase A (Scaling)** deliverables.

## 1. Context & Objectives
Rx Queen is a mobile market intelligence platform. The objective of this QA cycle is to validate the reliability of the "Public Intelligence" engine, the integrity of the data pipeline, and the functionality of the current dashboard components.

**Key Features to Validate:**
*   **Data Ingestion**: Scraping accuracy, multi-country support, and database upserts.
*   **Data Integrity**: Handling of duplicates, nulls, and historical rank tracking.
*   **Database Views**: Correctness of `daily_trends` and performance of aggregation queries.
*   **Live Store Validation**: Accuracy compared to real Google Play Store data.
*   **Dashboard UI**: Rendering of charts, filtering logic (Country/Category/Genre), and responsiveness.

---

## 2. Test Environment
*   **OS**: Windows
*   **Database**: Supabase (PostgreSQL)
*   **Frontend**: Next.js 15 (Localhost / Vercel)
*   **Runtime**: Node.js v20+
*   **Browser**: For live validation tests

---

## 3. Test Cases

### 3.1 Backend & Data Pipeline (Priority: Critical)

| ID | Test Case | Description | Expected Result | Script |
| :--- | :--- | :--- | :--- | :--- |
| **BE-01** | **Scraper Execution** | Run `scraper/google_play_fetch.js` manually. | Script fetches Top 200 games and returns valid JSON. | `tests/test_scraper.js` |
| **BE-02** | **Database Connection** | Connect to Supabase via utility script. | Connection successful; core tables exist. | `tests/test_db_and_views.js` |
| **BE-03** | **Data Freshness** | Check `captured_at` timestamps. | Data should be < 24 hours old. | `tests/test_db_and_views.js` |
| **BE-04** | **Deduplication Logic** | Scan `games` table for duplicate `store_id`. | No duplicates should exist. | `tests/test_db_and_views.js` |
| **BE-05** | **Rank Change Math** | Verify day-over-day calculation. | `rank_change_free` = Yesterday - Today. | `tests/test_rank_accuracy.js` |

### 3.2 Database Views & Performance (Priority: High)

| ID | Test Case | Description | Expected Result | Script |
| :--- | :--- | :--- | :--- | :--- |
| **SQ-01** | **`daily_trends` View** | Query the materialized view. | Returns rows with all expected columns. | `tests/test_db_and_views.js` |
| **SQ-02** | **Pulse Views** | Check `genre_stats` and `power_rankings`. | Views exist and are queryable. | `tests/test_db_and_views.js` |
| **SQ-03** | **Performance** | Measure query time for `daily_trends`. | Query executes in < 500ms. | `tests/test_db_and_views.js` |

### 3.3 Live Store Validation (Priority: High) ✨ NEW

| ID | Test Case | Description | Expected Result | Method |
| :--- | :--- | :--- | :--- | :--- |
| **LV-01** | **Live Data Comparison** | Compare DB rankings with live Google Play Store. | ≥80% of Top 10 games should match (allowing for natural movement). | `tests/test_live_comparison.js` + Browser |
| **LV-02** | **Store ID Verification** | Verify `store_id` matches actual app ID on Play Store. | All store IDs should be valid and resolvable. | Manual / Browser |
| **LV-03** | **Multi-Country Validation** | Spot-check rankings for non-US markets (GB, JP, IN). | Rankings should reflect actual regional charts. | Manual / Browser |

### 3.4 Frontend Dashboard (Priority: Medium)

| ID | Test Case | Description | Expected Result | Script |
| :--- | :--- | :--- | :--- | :--- |
| **FE-01** | **Build Validation** | Run `npm run build` in `dashboard/`. | Build completes without errors. | Manual |
| **FE-02** | **Component Existence** | Check for core and Sprint 3.1 components. | Core components present. | `tests/test_frontend_components.js` |
| **FE-03** | **Filtering Logic** | Test country/category filters. | Filters return correct data. | Manual / Browser |

### 3.5 Sprint 3.1 Phase A: Scaling (Priority: High) ✨ NEW

| ID | Test Case | Description | Expected Result | Script/Method |
| :--- | :--- | :--- | :--- | :--- |
| **S31-01** | **26 Countries Scraped** | Verify workflow scraped all 26 countries. | `SELECT DISTINCT country_code FROM snapshots` returns 26 rows. | `tests/test_scaling.js` |
| **S31-02** | **500 Games Per Country** | Check games scraped per country. | Each country has ~500 games in latest batch. | `tests/test_scaling.js` |
| **S31-03** | **UI Country Selector** | Open dashboard, check country dropdown. | All 26 countries visible in dropdown. | Manual / Browser |
| **S31-04** | **UI Header Text** | Check chart header. | Header says "Top 500 Charts". | Manual / Browser |
| **S31-05** | **weekly_summaries Table** | Verify table exists. | Table exists and is queryable. | `tests/test_scaling.js` |
| **S31-06** | **game_stats Table** | Verify table exists. | Table exists and is queryable. | `tests/test_scaling.js` |
| **S31-07** | **Environment Variables** | Verify no hardcoded Supabase credentials in repo. | `grep` for old password returns 0 matches. | `tests/test_security.js` |
| **S31-08** | **Workflow Success** | GitHub Actions completes without error. | Workflow run status is "success". | GitHub UI |
| **S31-09** | **Materialized View Graceful Timeout** | Ingestion doesn't fail if view refresh times out. | Log shows "View refresh timed out" but script exits 0. | GitHub Actions Log |

---

## 4. Test Scripts Inventory

| Script | Purpose | Command |
| :--- | :--- | :--- |
| `tests/test_scraper.js` | Validates scraper execution | `node tests/test_scraper.js` |
| `tests/test_db_and_views.js` | DB connection, freshness, views, performance | `node tests/test_db_and_views.js` |
| `tests/test_rank_accuracy.js` | Verifies day-over-day rank math | `node tests/test_rank_accuracy.js` |
| `tests/test_frontend_components.js` | Checks component file existence | `node tests/test_frontend_components.js` |
| `tests/test_live_comparison.js` | Outputs DB rankings for live comparison | `node tests/test_live_comparison.js` |
| `tests/test_scaling.js` | **NEW** - Validates 26 countries, 500 games, new tables | `node tests/test_scaling.js` |
| `tests/test_security.js` | **NEW** - Checks for hardcoded credentials | `node tests/test_security.js` |

---

## 5. Live Validation Procedure (LV-01)

### Automated Part:
1. Run `node tests/test_live_comparison.js` to get current DB rankings.
2. Note the Top 10 games and their positions.

### Manual/Browser Part:
3. Open: https://play.google.com/store/games?hl=en_US&gl=US
4. Navigate to "Top charts" → "Top free" section.
5. Compare the live rankings against the script output.
6. Document any discrepancies.

### Acceptance Criteria:
- **≥80% match** for Top 10 positions (8 out of 10).
- Any mismatches should be explainable by natural chart movement (time delta).
- If <80% match, investigate scraper or ingestion issues.

---

## 6. Reporting
A final `QA_Report.md` will be generated summarizing:
*   Pass/Fail status of each test case.
*   Live Store Validation results.
*   List of Blocking Issues (Bugs).
*   Missing Features (vs Sprint Plan).
*   Recommendations for remediation.

---

## 7. Recurring Test Schedule

| Frequency | Tests | Owner |
| :--- | :--- | :--- |
| **After Each Scrape** | BE-03 (Freshness), SQ-03 (Performance) | Automated |
| **Weekly** | Full Suite (all tests) | Manual |
| **Monthly** | LV-01, LV-02, LV-03 (Live Validation) | Manual + Browser |
| **After Code Changes** | FE-01, FE-02 | Developer |

---

**Last Updated:** January 10, 2026  
**Version:** 3.0 (Added Sprint 3.1 Phase A Scaling Tests)
