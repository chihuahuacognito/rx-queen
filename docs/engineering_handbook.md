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
