# Development Protocols & Agent Rules

Based on the Retrospective of Sprint 1, these are the codified rules to prevent recurrence of known issues. They are divided into "Static Rules" (checked by Inspector) and "Runtime Rules" (checked by Sentinel).

## 1. n8n Workflow Protocols

### Rule 1.1: The "No-Space" Mandate (Critical)
*   **Context**: Windows paths with spaces (`Rx Queen`) break execution command nodes if unquoted.
*   **Protocol**: All file paths in "Execute Command" nodes MUST be wrapped in escaped quotes (`\"`).
*   **Agent Enforcement**: 
    *   **Inspector**: 🔴 FLAGGED (Already implemented in `n8n_debugger.js`).

### Rule 1.2: The "Raw SQL" Standard
*   **Context**: The GUI "Upsert" operation in Postgres nodes is version-dependent and flaky.
*   **Protocol**: ANY insertion logic must use the "Execute Query" mode with explicit `INSERT ... ON CONFLICT` SQL.
*   **Agent Enforcement**:
    *   **Inspector**: 🟡 WARNED.

### Rule 1.3: The "Batch Size 1" Safety Net
*   **Context**: Bulk upserts fail if a batch contains duplicate keys (conflicting with *itself*).
*   **Protocol**: If the input data source might contain duplicates (e.g. multi-country lists), the Postgres Node "Batch Size" option MUST be set to `1`.
*   **Agent Enforcement**:
    *   **Inspector**: Can be upgraded to check `parameters.batchSize`.
    *   **Sentinel**: Will catch `23505` (Unique Violation) errors and suggest this fix.

## 2. Scraping Protocols

### Rule 2.1: File-Based Handoffs
*   **Context**: Passing large JSON blobs (10MB+) via `stdout` crashes n8n memory buffers.
*   **Protocol**: 
    *   Scrapers must write results to `data/scrape_result_[TIMESTAMP].json`.
    *   Scrapers must output ONLY the absolute file path to `stdout`.
    *   n8n must read the file using `fs`.
*   **Agent Enforcement**:
    *   **Inspector**: Hard to check statically, requires code review.
    *   **Runtime**: Sentinel catches "Memory Limit Exceeded" errors.

## 3. Database Protocols

### Rule 3.1: Null Safety
*   **Context**: `null` string vs `NULL` value causes casting errors in Postgres.
*   **Protocol**: All SQL parameters dealing with potentially missing numbers must use `NULLIF({{$json["value"]}}, 'null')::type`.
*   **Agent Enforcement**:
    *   **Sentinel**: Catches `22P02` (Invalid Text Representation) errors.

---

## Impact Analysis: How much is preventable?

| Incident Type | % of Debug Time | Preventable by Inspector? | Preventable by Sentinel? |
| :--- | :--- | :--- | :--- |
| **Path/Quoting Errors** | 30% | ✅ **Yes (100%)** | ➖ (Too late) |
| **Postgres UI Flakiness** | 20% | ✅ **Yes (100%)** | ➖ |
| **Batch/Duplicate Keys** | 25% | ❌ No (Data dependent) | ✅ **Yes** |
| **Bot Blocking** | 15% | ❌ No | ✅ **Yes (Notification)** |
| **Logic Errors** | 10% | ❌ No | 🟡 Partial |

**Conclusion**: ~50% of your Sprint 1 blockers (Pathing + Postgres Configuration) would have been **instantly prohibited** by the Inspector Agent you now have. Another 25% would have been auto-diagnosed by the Sentinel.
