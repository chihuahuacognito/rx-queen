# Scraping Expansion Plan: Games & Countries

## Current State

| Metric | Current Value |
|:-------|:--------------|
| **Games per Country** | 200 (Top Free + Top Paid + Top Grossing) |
| **Countries Scraped** | 4 (US, GB, JP, IN) |
| **Collections** | 3 (TOP_FREE, TOP_PAID, TOP_GROSSING) |
| **Total Games/Run** | ~800-1200 (after deduplication) |
| **Frequency** | Daily at 6 AM UTC |

---

## Question 1: Why 200 Games? What's the Limit?

### Current Limit: 200 per list
The `200` was chosen as a safe default. The actual limits are:

| Method | Max Limit | Notes |
|:-------|:----------|:------|
| `gplay.list()` (charts) | **~550** | Google Play returns max ~550 per chart |
| `gplay.search()` (keyword) | **250** | Hard limit per search query |
| `gplay.app()` (details) | **Unlimited** | But rate-limited by Google |

### The Real Constraint: Rate Limiting
Google Play will throttle or block if you make too many requests:
- **503 errors** after ~100-200 detail requests without delays
- **IP bans** (temporary, ~1 hour) if aggressive
- The `google-play-scraper` library has a `throttle` option to manage this

### Expansion Options for Game Count

| Option | Games/Country | Est. Time | Risk |
|:-------|:--------------|:----------|:-----|
| **Current** | 200 | ~2 min | ✅ Safe |
| **Moderate** | 300 | ~3 min | ✅ Safe |
| **Aggressive** | 500 | ~5 min | ⚠️ May need throttling |
| **Maximum** | 550 | ~6 min | ⚠️ Requires throttle config |

**Recommendation**: Expand to **500 games/country** with throttling enabled.

---

## Question 2: How Many Countries Can We Expand To?

### Google Play Supported Countries
Google Play operates in **175+ countries**. The `google-play-scraper` supports any valid 2-letter country code.

### Currently Tracked (4)
| Code | Country | Market Size (Games) |
|:-----|:--------|:-------------------|
| US | United States | Tier 1 (Largest) |
| GB | United Kingdom | Tier 1 |
| JP | Japan | Tier 1 (Unique trends) |
| IN | India | Tier 2 (High growth) |

### Recommended Expansion (Total: 15)

#### Tier 1 Markets (High Revenue)
| Code | Country | Rationale |
|:-----|:--------|:----------|
| US | United States | ✅ Already tracking |
| GB | United Kingdom | ✅ Already tracking |
| JP | Japan | ✅ Already tracking |
| KR | South Korea | Major gaming market, K-pop IPs |
| DE | Germany | Largest EU market |
| FR | France | 2nd largest EU market |
| CA | Canada | Soft launch market |

#### Tier 2 Markets (High Growth / Soft Launch)
| Code | Country | Rationale |
|:-----|:--------|:----------|
| IN | India | ✅ Already tracking |
| BR | Brazil | Largest LATAM, soft launch proxy |
| MX | Mexico | 2nd largest LATAM |
| ID | Indonesia | SEA powerhouse |
| PH | Philippines | Soft launch testing |

#### Tier 3 Markets (Leading Indicators)
| Code | Country | Rationale |
|:-----|:--------|:----------|
| AU | Australia | Premium market, soft launch |
| SG | Singapore | SEA hub, English-speaking |
| TW | Taiwan | Chinese-language trends |

### Constraints on Country Expansion

| Factor | Impact |
|:-------|:-------|
| **GitHub Actions Time** | Free tier: 6 hours/month. Each country ~3-5 min. 15 countries = 45-75 min/day |
| **Supabase Storage** | Free tier: 500MB. At ~1KB/snapshot, 15 countries × 500 games × 3 lists = ~22KB/day = ~660KB/month |
| **Rate Limiting** | More countries = more sequential requests = longer runtime |

### Execution Time Estimates

| Countries | Games/Country | Est. Runtime | Monthly Actions Cost |
|:----------|:--------------|:-------------|:---------------------|
| 4 | 200 | ~8 min | Free tier OK |
| 10 | 200 | ~20 min | Free tier OK |
| 15 | 200 | ~30 min | Free tier OK |
| 15 | 500 | ~75 min | May exceed free tier |

---

## Proposed Expansion Plan

### Phase 1: Immediate (This Week)
- Increase game limit from 200 → **300**
- Add **3 countries**: KR, DE, BR (Total: 7)
- Add throttling to prevent rate limits

### Phase 2: Next Week
- Increase game limit to **500**
- Add **5 more countries**: FR, CA, MX, ID, PH (Total: 12)

### Phase 3: Future
- Add remaining Tier 3: AU, SG, TW (Total: 15)
- Implement parallel scraping with multiple GitHub Action jobs

---

## Full System Impact Analysis

### Scenario: Current → Expanded
| Metric | Current (4 countries × 200) | Expanded (15 countries × 300) | Change |
|:-------|:----------------------------|:------------------------------|:-------|
| **Games scraped/day** | ~800 | ~4,500 | **+463%** |
| **Unique games tracked** | ~1,500 | ~8,000+ | **+433%** |
| **Snapshots/day** | ~2,400 (3 lists × 4 × 200) | ~13,500 (3 lists × 15 × 300) | **+463%** |

---

### 1. GitHub Actions Impact

| Metric | Current | Expanded | Free Tier Limit | Status |
|:-------|:--------|:---------|:----------------|:-------|
| **Runtime/day** | ~8 min | ~45-60 min | 2,000 min/month | ✅ Safe (~1,800 min/month) |
| **Parallel jobs** | 1 | 1 (could split to 3) | 20 concurrent | ✅ Safe |
| **Artifact storage** | 0 (no artifacts) | 0 | 500MB | ✅ Safe |

**Risk**: At 60 min/day × 30 days = 1,800 min/month = **90% of free tier**.
**Mitigation**: Split into 3 parallel jobs (5 countries each) to reduce wall-clock time.

---

### 2. Supabase Database Impact

#### Storage
| Metric | Current | Expanded (1 month) | Expanded (1 year) | Free Tier |
|:-------|:--------|:-------------------|:------------------|:----------|
| **Snapshots/month** | ~72,000 | ~405,000 | ~4.8M | No row limit |
| **Storage (est.)** | ~50MB | ~280MB/month | ~3.3GB/year | 500MB |

**Risk**: Will exceed 500MB free tier in **~2 months**.
**Mitigation**: 
- Upgrade to Pro ($25/mo) for 8GB, OR
- Implement **data retention policy** (delete snapshots older than 90 days)

#### Query Performance
| Query Type | Current | Expanded | Impact |
|:-----------|:--------|:---------|:-------|
| `daily_trends` view | <100ms | ~200-500ms | ⚠️ Noticeable |
| Dashboard load (25 rows) | <200ms | ~300-500ms | ⚠️ Noticeable |
| Genre aggregations | <150ms | ~400-800ms | ⚠️ May need indexes |

**Mitigation**: 
- Add indexes on `(country_code, captured_at)`
- Implement **materialized views** for heavy aggregations
- Cache results with Vercel Edge caching

---

### 3. Vercel Dashboard Impact

| Metric | Current | Expanded | Impact |
|:-------|:--------|:---------|:-------|
| **Initial load time** | ~1.5s | ~2-3s | ⚠️ Noticeable |
| **Country dropdown** | 4 options | 15 options | ✅ Minimal |
| **Data transfer/page** | ~50KB | ~50KB (same, paginated) | ✅ Same |
| **Edge function time** | <1s | <2s | ✅ Within limits |

**Mitigation**:
- Implement **server-side pagination** (already done)
- Add **loading skeletons** for perceived performance
- Use **ISR (Incremental Static Regeneration)** for popular views

---

### 4. Ingestion Pipeline Impact

| Metric | Current | Expanded | Impact |
|:-------|:--------|:---------|:-------|
| **Ingestion time** | ~30s | ~3-5 min | ⚠️ Longer |
| **DB writes/run** | ~2,400 | ~13,500 | ⚠️ More transactions |
| **Error probability** | Low | Medium | Need better error handling |

**Mitigation**:
- Batch inserts (already doing 100/batch)
- Add **retry logic** with exponential backoff
- Implement **partial failure recovery**

---

### 5. AI Tagging (Gemini) Impact

| Metric | Current | Expanded | Impact |
|:-------|:--------|:---------|:-------|
| **New games/day** | ~20-50 | ~100-300 | ⚠️ More API calls |
| **Gemini API cost** | Free tier | Free tier (1M tokens/day) | ✅ Safe |
| **Tagging time** | ~2 min | ~10-15 min | ⚠️ Longer |

**Mitigation**: Tag only high-rank games (Top 100) to reduce volume.

---

### 6. Network/Rate Limiting Risk

| Metric | Current | Expanded | Risk Level |
|:-------|:--------|:---------|:-----------|
| **Google Play requests/run** | ~1,200 | ~6,750 | ⚠️ High |
| **Requests/second** | ~5-10 | ~5-10 (throttled) | ✅ Safe if throttled |
| **IP ban probability** | Low | Medium | Need throttling |

**Mitigation**:
- Enable `throttle: 10` in scraper (max 10 req/s)
- Add **exponential backoff** on 503 errors
- Consider **rotating user agents**

---

## Summary: Go/No-Go Assessment

| System | 15 Countries × 300 | Verdict |
|:-------|:-------------------|:--------|
| **GitHub Actions** | 90% of free tier | ✅ GO (monitor usage) |
| **Supabase Storage** | Exceeds in ~2 months | ⚠️ PLAN for upgrade or retention |
| **Supabase Queries** | 2-3x slower | ⚠️ Add indexes |
| **Vercel Dashboard** | Slightly slower | ✅ GO (acceptable) |
| **Ingestion** | 5x longer | ✅ GO (runs overnight) |
| **AI Tagging** | 5x more games | ✅ GO (within free tier) |
| **Rate Limiting** | Medium risk | ⚠️ Requires throttling |

### Recommendation

**Proceed with Phase 1** (7 countries × 300 games) to validate assumptions, then expand to Phase 2 after:
1. ✅ Adding scraper throttling
2. ✅ Adding database indexes
3. ✅ Planning Supabase upgrade or retention policy

---

## Changes Required

### 1. Update Scraper Script
```javascript
// Add throttle option to prevent rate limiting
const gplay = require('google-play-scraper');
gplay.memoized({ throttle: 10 }); // Max 10 requests/second
```

### 2. Update GitHub Actions Workflow
```yaml
- name: Run Scraper (All Markets)
  run: |
    node scraper/google_play_fetch.js US 300
    node scraper/google_play_fetch.js GB 300
    node scraper/google_play_fetch.js JP 300
    node scraper/google_play_fetch.js IN 300
    node scraper/google_play_fetch.js KR 300
    node scraper/google_play_fetch.js DE 300
    node scraper/google_play_fetch.js BR 300
```

### 3. Update Dashboard Country Selector
Add new country options to the UI dropdown.

---

## Decision Points

Before implementing, please confirm:

1. **Game Count**: Stick with 200 or expand to 300/500?
2. **Country Priority**: Which countries matter most for your use case?
3. **Timing**: Implement Phase 1 now, or wait?
