# Agentic Automation Strategy

You asked for clarity on how these agents work, how they are triggered, and how we handle critical changes. This document outlines the two distinct types of automation we are building.

## 1. The "Inspector" (Static Agent) - *Ready Now*
**Status**: 🟢 **Deployed** (`tools/n8n_debugger.js`)

This is a script you run **manually** before you deploy or when you are stuck. Think of it like a "Spellchecker" for your workflow.

*   **Trigger**: **Manual**. You type `node tools/n8n_debugger.js` in your terminal.
*   **What it Automates**:
    *   Verifies file paths (e.g., "Does `scraper/google_play_fetch.js` actually exist?").
    *   Checks for syntax errors in commands (e.g., missing quotes around paths with spaces).
    *   Flags risky configurations (e.g., using unreliable `upsert` operations).
*   **Critical Changes**: It **never** changes your code. It only reports issues. It is purely read-only.
*   **Deployability**: **Immediate**. It is already installed in your project. It has zero risk because it doesn't touch your database or live workflows.

## 2. The "Sentinel" (Runtime Agent) - *Future Upgrade*
**Status**: ⚪ **Concept** (Requires n8n configuration)

This is a background process that lives *inside* n8n. Think of it like a "Security Guard" or "Co-pilot" that watches the workflow while it runs at 3 AM.

*   **Trigger**: **Automatic**. It wakes up *only* when an error occurs in your main workflow.
*   **What it Automates**:
    *   **Level 1 (Notifier)**: "Hey, the scraper failed because Google blocked the IP." (Sends a Slack/Discord/Email alert).
    *   **Level 2 (Self-Healing)**: "The database connection dropped. I retried 3 times and it worked." (Auto-retry).
    *   **Level 3 (Coder)**: "The SQL insertion failed because the table is missing a column. I have drafted a fix."
*   **Notifications & Frequency**:
    *   **Routine Issues**: You receive a daily digest (e.g., "3 transient network errors, all auto-resolved").
    *   **Critical Issues**: You receive an **immediate** alert (Phone/Email).
*   **Governance: What is a "Critical Change"?**
    *   The Agent should **NEVER** automatically perform a Critical Change. It must pause and ask for your approval.
    *   **Critical**:
        *   ❌ Dropping/Deleting tables.
        *   ❌ Changing database schema (adding columns).
        *   ❌ Sending emails/messages to real users.
        *   ❌ Spending money (e.g., spinning up paid API instances).
    *   **Non-Critical (Safe to Auto-fix)**:
        *   ✅ Retrying a failed HTTP request.
        *   ✅ Formatting a JSON date string that failed parsing.
        *   ✅ Restarting a stuck workflow.

## Comparison: Which one first?

| Feature | The Inspector (Static) | The Sentinel (Runtime) |
| :--- | :--- | :--- |
| **Availability** | **Ready Now** | Needs Setup |
| **Trigger** | Manual (You run it) | Automatic (On Error) |
| **Complextiy** | Low (Simple Script) | High (LLM + API integration) |
| **Risk** | Zero (Read-only) | Moderate (Could loop if misconfigured) |
| **Best For** | Fixing bugs *while building* | Handling failures *in production* |

### Recommendation
**Start with the Inspector (Static Agent).**
It answers your immediate need ("Creating an agent that helps fix bugs") without needing complex infrastructure. It catches the typos, path errors, and configuration mistakes that have been eating up your time.

Once your workflow is stable and running daily, we can install the Sentinel to watch it for you.
