# Engineering Handbook & Agent Protocols
*Technical standards, testing tools, and automation agents.*

## 1. The "Agent" Ecosystem
We use two types of automated agents to maintain code quality.

### 1.1 The Inspector (Static Analysis)
*   **What it is**: A script that "lints" your workflow files before deployment.
*   **Location**: `tools/n8n_debugger.js`
*   **How to Run**:
    ```bash
    node tools/n8n_debugger.js [workflow_file.json]
    ```
*   **What it Checks (The Heuristics)**:
    1.  **Path Safety**: Are file paths quoted? (Prevents Windows bugs).
    2.  **Referential Integrity**: Do the referenced scripts (`.js`) actually exist on disk?
    3.  **Operation Safety**: Is the flaky `upsert` mode being used? (Warns to use Raw SQL).

### 1.2 The Sentinel (Runtime Monitoring) - *Planned*
*   **What it is**: An n8n workflow that watches *other* workflows.
*   **Trigger**: Fires automatically when a workflow node errors.
*   **Capabilities**:
    *   **Auto-Retry**: For transient network errors (HTTP 502/503).
    *   **Alerting**: Sends a Slack/Email notification with the error log and a GPT-4 suggested fix.
    *   **Self-Healing**: Can truncate data if it exceeds column limits (Level 2).

---

## 2. Development Protocols (What Agents Look For)
*If you violate these, the Inspector will fail.*

### Protocol A: The "Raw SQL" Mandate
The GUI "Upsert" operation in n8n is banned.
*   **Correct**: Use "Execute Query" node.
    ```sql
    INSERT INTO games (id, val) VALUES ($1, $2) 
    ON CONFLICT (id) DO UPDATE SET val = EXCLUDED.val;
    ```
*   **Why**: Reliability across n8n versions.

### Protocol B: The "File-Based Handoff"
Do not pass large data (>2MB) between nodes via JSON.
*   **Correct**: 
    1.  Node A writes to `data/temp_123.json`.
    2.  Node A returns `{ "file": "data/temp_123.json" }`.
    3.  Node B reads from disk.
*   **Why**: Prevents "Memory Limit Exceeded" crashes in n8n.

### Protocol C: The "Batch Size 1" Rule
For multi-country ingestion with potential overlapping keys (e.g. Clash of Clans in US & UK):
*   **Correct**: Set Postgres Node Batch Size to `1`.
*   **Why**: Prevents "Duplicate Key" transaction rollbacks.

---

## 3. Testing Tools Inventory

### Tool 1: `n8n_debugger.js`
*   **Purpose**: Static analysis of `.json` workflow files.
*   **Usage**: `node tools/n8n_debugger.js workflow.json`

### Tool 2: `manual_ingest_all.js` (Concept)
*   **Purpose**: A standalone script to run the full pipeline *outside* of n8n.
*   **Usage**: Used to verify scraper <-> DB logic without the n8n UI overhead.

### Tool 3: `debug_db.js`
*   **Purpose**: Verifies database connection and schema state.
*   **Usage**: `node debug_db.js`

### Tool 4: `debug_duplicates.js`
*   **Purpose**: Detects if the `daily_trends` view is returning duplicate rows (often due to TZ truncation issues).
*   **Usage**: `node debug_duplicates.js`

---

## 4. Cloud Deployment Lessons Learned (Jan 2026)

This section documents critical issues encountered during the Supabase migration, Vercel deployment, and GitHub Actions automation setup.

### 4.1 Database Migration: Local PostgreSQL → Supabase

#### Issue: Nested Git Repository (Submodule Problem)
**Symptom**: `dashboard` folder appeared on GitHub but was not clickable (grayed out icon).

**Cause**: The `dashboard` folder had its own `.git` directory, making Git treat it as a submodule.

**Fix**:
```powershell
Remove-Item -Path "dashboard\.git" -Recurse -Force
git rm --cached dashboard
git add dashboard/
git commit -m "Fix nested dashboard repo"
git push
```

**Prevention**: Always check for nested `.git` folders before initial commit.

---

#### Issue: Missing Database Views After Migration
**Symptom**: Dashboard showed "No chart data found" even though snapshots existed (90K+ rows).

**Cause**: The `daily_trends` VIEW was not created in Supabase. Only `distinct_daily_snapshots` existed.

**Fix**: Run the view creation SQL manually:
```javascript
// create_views_supabase.js
await pool.query(`CREATE OR REPLACE VIEW daily_trends AS ...`);
```

**Prevention**: After any migration, verify all views exist:
```sql
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
```

---

### 4.2 Data Ingestion: Scraper JSON → Supabase

#### Issue: NULL Rank Values in Snapshots
**Symptom**: US/GB data existed in `snapshots` but not appearing in `daily_trends` view.

**Root Cause**: The ingestion script used wrong field names:
- Script expected: `game.rank_free`, `game.rank_grossing`
- Actual JSON had: `game.rank`, `game.collection` (e.g., `"TOP_FREE"`)

**Fix** (in `ingest_to_supabase.js`):
```javascript
// WRONG
game.rank_grossing || null,
game.rank_free || null,

// CORRECT
const rankFree = game.collection === 'TOP_FREE' ? game.rank : null;
const rankGrossing = game.collection === 'TOP_GROSSING' ? game.rank : null;
```

---

#### Issue: Wrong Game ID Field
**Symptom**: `null value in column "store_id" of relation "games" violates not-null constraint`

**Root Cause**: Script used `game.id` but scraper outputs `game.appId`.

**Fix**:
```javascript
// WRONG
let storeId = game.id;

// CORRECT
let storeId = game.appId || game.id;
```

**Lesson**: Always inspect actual JSON structure before writing ingestion logic:
```powershell
Get-Content data\scrape_result_*.json | Select-Object -First 100
```

---

### 4.3 Vercel Deployment

#### Issue: TypeScript Build Error - Missing Type Definitions
**Symptom**: Vercel build failed with `Could not find a declaration file for module 'pg'`

**Fix**:
```bash
cd dashboard
npm install --save-dev @types/pg
```

---

#### Issue: Empty Dashboard Despite Valid Connection
**Symptom**: Logs showed `DATABASE_URL exists: true` and `Query returned 0 rows`.

**Debugging Steps**:
1. Add logging to `getTrends.ts`:
   ```typescript
   console.log('[getTrends] DATABASE_URL exists:', !!process.env.DATABASE_URL);
   console.log('[getTrends] Query returned', result.rows.length, 'rows');
   ```
2. Check Vercel → Your Project → **Logs** to see server-side output.
3. Verify data exists in the view, not just the base table.

---

### 4.4 GitHub Actions: Automated Scraping

#### Issue: Push Rejected (Race Condition)
**Symptom**: 
```
error: failed to push some refs to '...'
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**Cause**: Multiple pushes happening simultaneously (local development + Actions).

**Fix** (in `daily_scrape.yml`):
```yaml
- name: Commit New Data
  run: |
    git config user.name "GitHub Actions"
    git config user.email "actions@github.com"
    git add data/
    if git diff --staged --quiet; then
      echo "No changes to commit"
    else
      git commit -m "Daily scrape - $(date +%Y-%m-%d)"
      # Retry loop for race conditions
      for i in 1 2 3; do
        git fetch origin main
        git rebase origin/main && git push && break
        echo "Push attempt $i failed, retrying..."
        sleep 5
      done
    fi
```

---

#### Issue: Submodule Checkout Error
**Symptom**: `fatal: No url found for submodule path 'dashboard' in .gitmodules`

**Cause**: Residual submodule metadata after fixing the nested git issue.

**Fix**: Disable submodule processing in checkout:
```yaml
- uses: actions/checkout@v4
  with:
    submodules: false
```

---

#### Issue: Permission Denied on Push
**Symptom**: `remote: Permission to ... denied to github-actions[bot]`

**Fix**: Go to Repository → Settings → Actions → General → Workflow permissions → Select **"Read and write permissions"**.

---

### 4.5 Debugging Toolkit (New Scripts)

| Script | Purpose | Usage |
|:-------|:--------|:------|
| `debug_supabase.js` | Check views and snapshot counts | `node debug_supabase.js` |
| `debug_daily_trends.js` | Verify country/rank distribution in view | `node debug_daily_trends.js` |
| `debug_us_gb.js` | Check if US/GB data exists in raw snapshots | `node debug_us_gb.js` |
| `debug_join.js` | Test the JOIN logic between snapshots and games | `node debug_join.js` |
| `debug_view.js` | Check distinct_daily_snapshots for issues | `node debug_view.js` |
| `fix_ranks.js` | Update existing NULL ranks with correct values | `node fix_ranks.js` |
| `create_views_supabase.js` | Create missing views in Supabase | `node create_views_supabase.js` |

---

### 4.6 Environment Variable Checklist

#### GitHub Secrets (for Actions)
| Name | Purpose |
|:-----|:--------|
| `SUPABASE_URL` | PostgreSQL connection string for ingestion |
| `GEMINI_API_KEY` | AI-powered subgenre auto-tagging |
| `NTFY_TOPIC` | Push notifications on scrape completion |

#### Vercel Environment Variables
| Name | Purpose |
|:-----|:--------|
| `DATABASE_URL` | PostgreSQL connection string for dashboard |

**Note**: Both use the same Supabase pooler connection string:
```
postgresql://postgres.[project-ref]:[password]@aws-[region].pooler.supabase.com:6543/postgres
```

---

### 4.7 Quick Diagnostic Commands

```bash
# Check if views exist in Supabase
node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:'YOUR_URL',ssl:{rejectUnauthorized:false}}); p.query('SELECT table_name FROM information_schema.views WHERE table_schema=\\'public\\'').then(r=>{console.log(r.rows);p.end()});"

# Check snapshot counts by country
node debug_us_gb.js

# Verify dashboard data
node debug_daily_trends.js

# Test ingestion script locally
$env:SUPABASE_URL="YOUR_CONNECTION_STRING"; node ingest_to_supabase.js
```

