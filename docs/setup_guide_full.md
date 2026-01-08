# Complete Infrastructure Setup Guide

Since you are starting from scratch, we will set up the core infrastructure: **PostgreSQL** (Database) and **n8n** (Automation Server).

---

## Part 1: Install PostgreSQL (Database)

1.  **Download**:
    - Go to [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/).
    - Click **"Download the installer"** (by EDB).
    - Download the latest version (e.g., 16.x or 17.x).

2.  **Install**:
    - Run the installer (`postgresql-xx.x-windows-x64.exe`).
    - **Step 1**: Uncheck "Stack Builder" (we don't need it right now).
    - **Step 2 (Critical)**: When asked for a **Password** for the `postgres` user, choose something simple like `admin123` (since this is local). **Write it down!**
    - **Step 3**: Keep the default Port (`5432`).
    - **Step 4**: Finish the installation.

3.  **Verify & Create DB**:
    - Search Windows for **pgAdmin 4** (it comes with the installer) and open it.
    - Double-click "PostgreSQL 16" (or your version) under "Servers".
    - Enter the password you set (`admin123`).
    - Right-click **Databases** -> **Create** -> **Database...**
    - Name it: `gaming_insights`
    - Click **Save**.

4.  **Run Schema Scripts**:
    - In pgAdmin, right-click your new `gaming_insights` database -> **Query Tool**.
    - Open the file `C:\Users\Hyprbolictimechamber\2026projects\Rx Queen\db\schema.sql`.
    - Copy the content, paste it into the Query Tool, and click the **Play** button (Execute).
    - Repeat for `C:\Users\Hyprbolictimechamber\2026projects\Rx Queen\db\views.sql`.

---

## Part 2: Install n8n (Automation)

Since you have Node.js installed (we used it for the scraper), installing n8n is easy.

1.  **Open PowerShell** (Terminal).
2.  Run this command to install n8n globally:
    ```powershell
    npm install n8n -g
    ```
3.  **Start n8n (Important Security Setting)**:
    By default, n8n disables the `Execute Command` node for security. We need to enable it.
    Run this command in PowerShell to start it:
    ```powershell
    $env:NODES_EXCLUDE="[]"; n8n start
    ```
    *Wait a few seconds until it says "Editor is now accessible via...*
4.  **Open Browser**: Go to `http://localhost:5678`.
5.  **Setup**: It might ask you to create an owner account. Just sign up (it saves locally).

---

## Part 3: Connect the Pipeline

1.  **Import Workflow**:
    - In n8n (`localhost:5678`), click **Add Workflow** -> **Import from File**.
    - Select: `C:\Users\Hyprbolictimechamber\2026projects\Rx Queen\workflow_public_ingest.json`.

2.  **Configure Credentials**:
    - Double-click the **"Upsert Games"** node.
    - Under **Credential**, select **Create New** -> **Postgres**.
    - **Host**: `localhost`
    - **Database**: `gaming_insights`
    - **User**: `postgres`
    - **Password**: `admin123` (or whatever you set).
    - Click **Save**.
    - **Important**: Do the same for the **"Insert Snapshots"** node (select the saved credential).

3.  **Run It!**:
    - Click **"Execute Workflow"** at the bottom.
    - If green checks appear, you have successfully scraped Google Play and saved it to your own database!

---

## Part 4: Verify
Go back to **pgAdmin**:
- Right-click `games` table -> **View/Edit Data** -> **All Rows**.
- You should see ~100 games listed with their icons and genres.
