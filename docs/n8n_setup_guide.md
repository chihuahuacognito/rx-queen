# n8n Ingestion Pipeline Verification Guide

This guide will walk you through setting up the n8n workflow to ingest Google Play data into your local PostgreSQL database.

## Prerequisites
1.  **n8n Installed & Running**: You should be able to access `http://localhost:5678`.
2.  **PostgreSQL Running**: Ensure your database server is active.
3.  **Database Created**: You need a database (e.g., `gaming_insights`) where we will run the schema.

---

## Step 1: Initialize Database
Before running n8n, we need to create the tables.

1.  Open your SQL tool (pgAdmin, DBeaver, or terminal).
2.  Connect to your database.
3.  Run the contents of `db/schema.sql`.
4.  Run the contents of `db/views.sql`.

*Verify*: You should see `games`, `snapshots` tables and `daily_trends` view.

---

## Step 2: Import Workflow into n8n
1.  Open n8n (`http://localhost:5678`).
2.  Click **"Add Workflow"** (top right) -> **"Import from..."** -> **"From File"**.
3.  Select the file:
    `C:\Users\Hyprbolictimechamber\2026projects\Rx Queen\workflow_public_ingest.json`
4.  The workflow diagram should appear.

---

## Step 3: Configure Credentials (Critical)
The imported workflow uses placeholder credentials. You must update them.

1.  Double-click the **"Upsert Games"** (Postgres) node.
2.  Under **Credential to connect with**, select **"Create New"** (or select your existing Postgres credential).
3.  Fill in your details:
    - **Host**: `localhost`
    - **Database**: (e.g., `gaming_insights`)
    - **User**: (e.g., `postgres`)
    - **Password**: (your password)
    - **Port**: `5432`
4.  **Save** the credential.
5.  **Repeat** this for the **"Insert Snapshots"** node (select the same credential).

---

## Step 4: Verify Script Path
1.  Double-click the **"Fetch Google Play"** node.
2.  Check the **Command** field.
    - It should point to: `node C:/Users/Hyprbolictimechamber/2026projects/Rx\ Queen/scraper/google_play_fetch.js us`
    - Ensure `node` is in your system PATH, or provide the full path to `node.exe`.

---

## Step 5: Test Execution
1.  Click **"Execute Workflow"** (bottom center).
2.  Watch the nodes turn green.
    - **Fetch Google Play**: Should output a large JSON array.
    - **Merge & Format**: Should transform it into cleaner objects.
    - **Upsert Games**: Should write ~100-200 rows to DB.
    - **Insert Snapshots**: Should add history records.

---

## Step 6: Verify Data
Go back to your SQL Tool and run:

```sql
-- Check if games exist
SELECT count(*) FROM games; 

-- Check Trend View (might be empty if only 1 snapshot, but check structures)
SELECT * FROM distinct_daily_snapshots;
```

If you see rows, **Success!** 🎉
## Troubleshooting
### "Unrecognized node type" Error
If you get an error about `executeCommand` when importing:
1.  **Delete** the "Fetch Google Play" node from the canvas.
2.  Click the **+** button (Add Node) on the right.
3.  Search for **"Execute Command"** and add it.
4.  Connect it between **Schedule** and **Merge & Format**.
5.  Double-click it to configure:
    - **Command**: `node "C:/Users/Hyprbolictimechamber/2026projects/Rx Queen/scraper/google_play_fetch.js" us`
    (Using quotes fixes the space in 'Rx Queen').

### "Operation Upsert not supported" Error
The Postgres node interface varies by version. The most reliable fix is to use raw SQL.

**Option A: Fix the Node UI**
1.  Set **Operation** to `Execute Query`.
2.  In the **Query** field, paste this:
    ```sql
    INSERT INTO games (store_id, name, publisher, genre, icon_url, store_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (store_id) 
    DO UPDATE SET 
        name = EXCLUDED.name,
        publisher = EXCLUDED.publisher,
        genre = EXCLUDED.genre,
        updated_at = NOW();
    ```
3.  Scroll down to **Query Parameters**.
4.  Enter: `{{$json["store_id"]}}, {{$json["name"]}}, {{$json["publisher"]}}, {{$json["genre"]}}, {{$json["icon_url"]}}, {{$json["store_url"]}}`
5.  (Ensure you separate them with commas).

**Updating the Snapshot Node**
If the "Insert Snapshots" node is outdated:
1.  **Delete** the old node.
2.  **Add** a new Postgres node.
3.  Set **Operation** to `Execute Query`.
4.  Paste the SQL Query:
    ```sql
    INSERT INTO snapshots (game_id, rank_free, rank_paid, rank_grossing, rating, price, captured_at)
    SELECT id, $1, $2, $3, $4, $5, NOW()
    FROM games WHERE store_id = $6;
    ```
5.  In **Query Parameters**, verify the drag-and-drop expressions for:
    `{{ $json.rank_free || null }}`, `{{ $json.rank_paid || null }}`, `{{ $json.rank_grossing || null }}`, `{{ $json.rating }}`, `{{ $json.price }}`, `{{ $json.store_id }}`.
6.  Execute!


