# I built a "Company" of AI Agents to build my product for me. Here's how. 🤖 🏭

Most people use AI to write code. 
I used AI to **verify** it.

While building **Rx Queen** (a public market intelligence tool for mobile/indie games), I realized that simply "generating code" wasn't enough. The system was fragile. 

So I stopped acting like a coder and started acting like a **Process Engineer**. 
I built a factory of specialized agents—some active, some passive—to ensure quality at every step.

### 1. The Strategy: Active vs. Passive Agents ☯️
I split my automated workforce into two distinct roles:

*   **⚡ The Active Agents (The Doers):**
    *   These are the scrapers and data pipelines (running on **n8n** + **Node.js**).
    *   They wake up every 6 hours, scouring the Google Play Store for "Breakout Hits" and verifying rank data.
    *   They are aggressive, fetching data across US 🇺🇸, JP 🇯🇵, and KR 🇰🇷.

*   **🛡️ The Passive Agents (The Watchers):**
    *   This was the game changer. I built "QA Agents" whose *only* job is to watch the Active Agents.
    *   **"The Inspector":** A static analysis script that "lints" the JSON workflows before they ever run. It catches "Windows Pathing" bugs and "Upsert" failures before they happen.
    *   **"The Sentinel":** A parallel process that validates the data integrity labeled by the Active Agents.

### 2. The Playbook: "Process > Code" 📘
I didn't just write scripts; I wrote **Playbooks**.
We created a "Dev Protocol" that the AI follows:
*   **The "Raw SQL" Mandate:** Banning flaky GUI nodes in favor of raw logic.
*   **The "Batch Size 1" Rule:** Enforcing strict transaction limits to prevent data collisions.
*   **The "File-Based Handoff":** A strict protocol for passing data between agents to avoid memory crashes.

### 3. The Result: A "Self-Healing" System 🏥
By focusing on the **QA Tools** and **Verification Processes** first, the product built itself.
*   The Dashboard (Next.js) is just a reflection of a healthy database.
*   The Charts are accurate because the Passive Agents rejected the bad data.
*   The "Top 100" list is actually trustworthy.

### Why this matters
In the age of AI coding, the human advantage isn't syntax—it's **Architecture** and **QA**.
We need to stop being "Prompt Engineers" and start being "System Architects" who design the playbooks that the agents follow.

I'm documenting this entire "Agentic QA" framework in my engineering handbook. 

👇 **How are you using AI for QA? Are you building "Watcher" agents yet?**

#ProcessEngineering #AI #AgenticWorkflows #QA #n8n #Automation #IndieDev #BuildInPublic #TechStrategies
