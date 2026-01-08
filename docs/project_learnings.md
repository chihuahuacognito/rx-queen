# Project Learnings & Technical Retrospective
**Project:** Rx Queen (Gaming Insights Platform)
**Date:** January 2026

This document captures the key strategic and technical lessons learned during the development of the Rx Queen platform. These insights are intended to guide future projects and serve as a reference for maintaining the current stack.

---

## 1. Data Strategy: The "Public First" Pivot
**Context:** We initially attempted to access premium data sources (AppMagic, Data.ai) using automated login scripts (Puppeteer).
**The Blocker:** Modern bot protections (Cloudflare Turnstile, shape detection) made persistent authentication extremely brittle. Maintenance cost would have been higher than development cost.
**The Pivot:** We switched to scraping public Google Play Store pages (`google-play-scraper`).
**Lesson:**
*   **Always audit public data availability first.** If 80% of the value (Rank, Downloads Range, Rating) is public, grab that first.
*   **Avoid "Assisted Login" workflows** unless absolutely necessary. They are intrinsically unstable.
*   **Zero-Auth > Auth:** A scraper that runs anonymously is infinitely more reliable than one that requires a session cookie.

---

## 2. Infrastructure: n8n Automation Quirks
**Context:** We used n8n to orchestrate the polling of data every 6 hours.
**Key Learnings:**
*   **Execute Command Security:** In n8n v1.0+, the `Execute Command` node is disabled by default.
    *   *Fix:* Must run with environment variable `$env:NODES_EXCLUDE="[]"; n8n start`.
*   **Node Versioning Matters:** Importing workflows from older n8n versions causes "Unrecognized Node" errors or UI mismatches (e.g., missing "Upsert" dropdowns).
    *   *Fix*: Open the workflow in UI, delete the old node, adding a new one from the palette, and re-connecting it. Or manually update `typeVersion` in JSON if you know the schema.
*   **Postgres Batch Upserts**: When processing data that contains duplicate keys in a single batch (e.g., the same Game `store_id` appearing in US, UK, and JP lists), Postgres will throw a "Cardinality Violation" or "tuple to be updated was already modified" error if you try to Upsert them all in one SQL transaction.
    *   *Fix*: Set the **Batch Size** to `1` in the Postgres Node options. This forces sequential processing, handling the updates correctly one by one.

---

## 🛑 Sprint 1 Retrospective (The "Global Scout" Ingestion)
**Issue**: We spent excessive time debugging the n8n <-> Postgres ingestion pipeline for multi-country data.
**Root Causes**:
1.  **The "Duplicate Key in Batch" Trap**: We tried to upsert 3,600 items in large batches. Since games like *Clash of Clans* appeared in multiple lists (US, GB, JP), the batches contained duplicate `store_id` keys. Postgres rejects `ON CONFLICT` updates if the same row is modified twice in a single statement.
2.  **Over-reliance on GUI Debugging**: We trusted n8n's "green checkmarks" (which sometimes mask partial failures or accepted the first batch only) instead of verifying the database state immediately with a script.
3.  **Windows Pathing Hell**: Passing arguments to scripts via n8n on Windows with spaces in the path (`Rx Queen`) caused silent failures where the scraper defaulted to 'US' instead of 'ALL'.

**Corrective Actions (How to avoid this next time)**:
1.  **Script First, Pipeline Second**: Before building a complex workflow, write a standalone `manual_ingest.js` script. If the logic holds there, the database schema is proven. This isolates "Logic" bugs from "Tooling" bugs.
2.  **File-Based Handoffs**: Do not rely on `stdout` for moving data. Write to a standard file location (`data/latest.json`). It bypasses memory buffer limits and allows for easy inspection of what *actually* happened.
3.  **Batch Size 1 Strategy**: For any "Upsert" operation involving potential duplicates in the source stream, always defaults to **Batch Size: 1** (or distinct deduplication logic) to prevent atomic transaction failures.
4.  **Wrapper Scripts**: On Windows, never call `node script.js` directly in n8n if parameters are complex. Create a simple `.bat` file to handle the quoting and paths reliably.

---
*   **Postgres Update Logic:** The "Upsert" operation in the Postgres node can be flaky across versions.
    *   *Reliable Pattern:* Use the **"Execute Query"** operation with raw SQL:
        ```sql
        INSERT INTO table (id, val) VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET val = EXCLUDED.val;
        ```
    *   This bypasses UI limitations and works 100% of the time.

---

## 3. Database: PostgreSQL Patterns
**Context:** Storing time-series ranking data.
**Key Learnings:**
*   **Separation of Concerns:** Split data into:
    *   `games`: Static metadata (Name, Icon, Developer) - Updated rarely (Upsert).
    *   `snapshots`: Dynamic history (Rank, Price) - Inserted constantly (Append-only).
*   **Logic in Views:** Instead of calculating "Day-over-Day Change" in Javascript/Python, we created a SQL View (`daily_trends`).
    *   *Benefit:* The dashboard simply runs `SELECT * FROM daily_trends`. The database handles the heavy lifting of date comparison.
*   **Handling Nulls:** Postgres is strict about types. Sending `"null"` (string) to an Integer column causes crashes.
    *   *Fix:* Explicitly cast in SQL: `NULLIF($1, 'null')::integer`.

---

## 4. Frontend: Next.js App Router
**Context:** Building a fast, SEO-friendly dashboard.
**Key Learnings:**
*   **Server Actions for Data:** We didn't need to build a REST API (`/api/games`). We fetched data directly in the Server Component (`page.tsx`) using a helper function (`getTrends`).
    *   *Benefit:* Zero network latency between backend content and frontend rendering.
*   **Tailwind Configuration:** To use dynamic classes (like changing colors based on rank change), `clsx` and `tailwind-merge` are essential utilities.
*   **External Images:** Next.js requires explicit permission to load images from external domains (`play-lh.googleusercontent.com`).
    *   *Fix:* Update `remotePatterns` in `next.config.ts`.

---

## 5. General Best Practices
*   **Defensive Coding:** The scraper occasionally returns items with missing IDs. Adding a simple `if (!id) return;` filter in the processing pipeline saved the database from crashing on constraint violations.
*   **Environment Isolation:** Keeping the scraper (Node.js script) decoupled from the dashboard means we can rewrite the scraper in Python later without breaking the UI.
