# The Rx Queen Playbook (Knowledge Base)

This document serves as the central "Technical Constitution" for the Rx Queen project. It consolidates our Learnings, Development Protocols, and Automation Strategies.

---

## 1. Project Learnings (The "Why")
*Retrospective on failed approaches and successful pivots.*

### 1.1 Data Strategy: The "Public First" Pivot
*   **Lesson**: "Core Intelligence" > "Hard Access".
*   **The Problem:** We initially wasted weeks trying to use Puppeteer to log in to premium sites (Data.ai/AppMagic) and kept getting banned by Cloudflare.
*   **The Pivot:** We realized 80% of value (Rank, Rating, Downloads) is public on the Google Play Store web pages.
*   **Rule:** **Always scrape public pages anonymously first.** Zero-Auth > Auth.

### 1.2 Infrastructure Risks (n8n & Scrapers)
*   **Batch Size Limits**: We crashed Postgres by trying to "Upsert" 3,600 rows at once where some rows were duplicates of each other (e.g. Clash of Clans in US and UK lists).
    *   *Fix*: **Batch Size = 1** is mandatory for multi-country sources.
*   **Windows Pathing**: Passing paths with spaces (`Rx Queen`) to n8n "Execute Command" nodes fails silently or with confusing errors.
    *   *Fix*: **Always quote paths** in command arguments.

---

## 2. Development Protocols (The "How", Enforced)
*These rules are vetted by the Static Inspector Agent.*

### Rule 2.1: The "No-Space" Mandate (Critical)
*   **Context**: Windows path spaces break scripts.
*   **Protocol**: All file paths in n8n "Execute Command" nodes MUST be wrapped in escaped quotes (`\"`).
*   **Enforcement**: Check with `node tools/n8n_debugger.js`.

### Rule 2.2: The "Raw SQL" Standard
*   **Context**: The GUI "Upsert" operation in Postgres nodes is flaky.
*   **Protocol**: ANY insertion logic must use the "Execute Query" mode with explicit `INSERT ... ON CONFLICT` SQL.

### Rule 2.3: Data Handoffs
*   **Context**: Passing large JSONs via `stdout` crashes n8n memory.
*   **Protocol**: Scrapers (Node.js) write to `data/[file].json` and return only the *filepath*. n8n reads the file via `fs`.

---

## 3. Automation Strategy
*How we maintain the system without manual labor.*

### 3.1 The Inspector (Static Agent)
*   **Location**: `tools/n8n_debugger.js`
*   **Trigger**: Manual run before deploying.
*   **Goal**: Catches syntax, pathing, and config errors.

### 3.2 The Sentinel (Runtime Agent) - *Planned*
*   **Goal**: Auto-retries database connections; alerts user to changes in Google's HTML structure.
*   **Architecture**:
    1.  **Error Trigger Node**: Added to workflows to catch failures.
    2.  **LLM Brain**: Webhook to OpenAI/Anthropic.
    3.  **Payload Structure**:
        ```json
        {
          "model": "gpt-4",
          "messages": [
            { "role": "system", "content": "You are an n8n expert. Analyze this error." },
            { "role": "user", "content": "Workflow: {{ $execution.id }}\nNode: {{ $node.name }}\nError: {{ $json.message }}" }
          ]
        }
        ```
    4.  **Action**: Returns a fix suggestion to Slack/Email.

---

## 4. Past Sprint Logs

### Sprint 1: Foundation (Completed Jan 2026)
*   **Achievements**:
    *   Built `scraper/google_play_fetch.js` (Public Data).
    *   Built `workflow_public_ingest.json` (Orchestration).
    *   Built `dashboard/` (Next.js App).
*   **Retrospective**: 50% of time was wasted on simple pathing/config bugs, which lead to the creation of the *Inspector Agent*.

### Sprint 2: Optimization (Current Focus)
*   **Goal**: Expand from Top 100 to Top 200; Add "Genre" tags.
*   **Active Tasks**:
    *   [ ] Fix Genre View (DB change).
    *   [ ] Increase Scraper Limit to 200.
    *   [ ] Enable Multi-Country Loop (US, GB, CA, DE, JP, BR).

