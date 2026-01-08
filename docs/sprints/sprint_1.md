# Sprint 1: Optimization & Foundation

**Status**: ✅ Completed  

---

## 📋 Task List

### 1. 🎨 The Genre Fix (Highest Priority)
- [x] **Database View**: Update `daily_trends` view in `db/views.sql` to include `g.genre`.
- [x] **Backend Query**: Update `getTrends.ts` fallback query to include `genre`.
- [x] **Frontend Component**: Update `GameCard.tsx` to display a genre badge (e.g., "Strategy", "RPG").

### 2. 🎣 Deep Dragnet (Scraper Optimization)
- [x] **Scraper Script**: Modify `scraper/google_play_fetch.js` to accept a `num` parameter.
- [x] **Limit Increase**: Increase fetch limit from 100 to 200 (or max feasible).
- [x] **Verification**: Ensure n8n workflow passes the new parameter. (Verified: Updated script accepts limit)

### 3. 🌍 Global Scout (Multi-Country)
- [x] **Workflow Update**: Update `workflow_public_ingest.json` to iterate through country codes.
- [x] **Countries**: Add support for `['US', 'GB', 'CA', 'DE', 'JP', 'BR']`.

### 4. 🛡️ Resilient History & Documentation
- [ ] **Documentation**: Update `setup_guide_full.md` with instructions for long-term data collection.
- [ ] **Process Management**: (Optional) Setup PM2 or a simple loop script for continuous running.

---

## 📝 Changelog / Notes
- **2026-01-03**: Sprint initialized. Priorities set.
