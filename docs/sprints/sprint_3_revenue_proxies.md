# Sprint 3: Data Reliability & Revenue Proxies

**Duration**: Jan 7 - Jan 14, 2026  
**Goal**: Ensure consistent data ingestion, implement revenue band estimates, and add ad dependency scoring.

---

## 1. Data Pipeline Stability

### 1.1 Scheduled Scraper [P0]
- [ ] **Create Scheduled Task**: Use Windows Task Scheduler to run `run_scraper.bat` daily at 6:00 AM UTC.
- [ ] **Verify Cron**: Set up n8n workflow with `Cron` trigger as backup.
- [ ] **Alert on Failure**: Add simple logging to detect if scraper fails.

### 1.2 Automated Ingestion [P0]
- [ ] **Post-Scrape Ingest**: Modify `run_scraper.bat` to automatically run `node dashboard/manual_ingest_all.js` after scraping.
- [ ] **Backfill Missing Data**: Run `node ingest_backfill.js` once to ensure all historical JSON files are in DB.

---

## 2. Revenue Band Estimation

### 2.1 Database Function [P0]
Create a SQL function that returns a revenue band based on Grossing Rank:

```sql
CREATE OR REPLACE FUNCTION estimate_revenue_band(rank_grossing INTEGER, country_code TEXT)
RETURNS TEXT AS $$
BEGIN
    -- US Market Calibration (Power Law Approximation)
    -- Based on public studies: Top 1% = 94% revenue
    IF rank_grossing IS NULL THEN RETURN 'N/A'; END IF;
    
    IF rank_grossing <= 10 THEN RETURN '$500k+/mo';
    ELSIF rank_grossing <= 50 THEN RETURN '$100k-$500k/mo';
    ELSIF rank_grossing <= 100 THEN RETURN '$20k-$100k/mo';
    ELSIF rank_grossing <= 200 THEN RETURN '$5k-$20k/mo';
    ELSE RETURN '<$5k/mo';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 View Update [P1]
- [ ] Add `estimated_revenue` column to `daily_trends` view using the function.

### 2.3 UI Display [P1]
- [ ] Update `ChartRow.tsx` to display revenue band badge (color-coded).

---

## 3. Ad Dependency Score

### 3.1 Database Function [P0]
Create a SQL function that estimates ad dependency:

```sql
CREATE OR REPLACE FUNCTION calculate_ad_dependency(rank_free INTEGER, rank_grossing INTEGER, genre TEXT)
RETURNS NUMERIC AS $$
DECLARE
    ratio NUMERIC;
    genre_weight NUMERIC;
BEGIN
    IF rank_free IS NULL OR rank_grossing IS NULL THEN RETURN NULL; END IF;
    
    -- Ratio: If free rank is much better than grossing, likely ad-dependent
    ratio := COALESCE(rank_grossing::NUMERIC / NULLIF(rank_free, 0), 1);
    
    -- Genre weights (Hypercasual = high ads, RPG = low ads)
    genre_weight := CASE
        WHEN genre ILIKE '%casual%' THEN 1.5
        WHEN genre ILIKE '%puzzle%' THEN 1.2
        WHEN genre ILIKE '%arcade%' THEN 1.2
        WHEN genre ILIKE '%rpg%' THEN 0.5
        WHEN genre ILIKE '%strategy%' THEN 0.6
        ELSE 1.0
    END;
    
    -- Score: 0 = IAP-heavy, 100 = Ad-heavy
    RETURN LEAST(100, GREATEST(0, (ratio * genre_weight * 10)));
END;
$$ LANGUAGE plpgsql;
```

### 3.2 View Update [P1]
- [ ] Add `ad_dependency_score` column to `daily_trends` view.

### 3.3 UI Display [P2]
- [ ] Show "Ad-Heavy" or "IAP-Heavy" badge on ChartRow.

---

## 4. Validation & QA

- [ ] **Verify Days on Chart**: Confirm values update correctly after multiple days of scraping.
- [ ] **Spot Check Revenue Bands**: Compare 5 games to AppMagic free tier estimates.
- [ ] **Test Edge Cases**: Games with NULL grossing rank, new entries.

---

## 5. Definition of Done

- [ ] Scraper runs automatically daily.
- [ ] DB has 7+ days of continuous data.
- [ ] Revenue bands display on dashboard.
- [ ] Ad dependency score displays on dashboard (optional for this sprint).
