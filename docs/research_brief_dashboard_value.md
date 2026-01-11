# Research Brief: Optimizing the Rx Queen "Command Center"

**Objective**: determine the highest-impact visual components for the "Rx Queen" dashboard home page.
**Target Audience**: Game Developers, Publishers, Investors.
**Goal**: Move beyond generic "Bento Grids" to purpose-built analytical tools that solve specific user pain points.

---

## 1. The Problem Statement: "Signal in the Noise"

The mobile gaming market is a "Red Ocean" with 500,000+ active games. Traditional intelligence tools (Data.ai, SensorTower) focus on **"Who is #1?"** (Static Dominance).

But for 99% of the industry, knowing who is #1 is useless—they can't compete with Roblox or Candy Crush.

**The Real Pain Points:**
1.  **Invisible Velocity**: A game jumping from Rank #800 to #200 is a massive signal of a new trend, but it is invisible on a "Top Charts" list.
2.  **Campaign Forensics**: "Why did my competitor suddenly spike yesterday?" Was it an update? A feature? An ad push? 
3.  **Genre Saturation**: "Is the 'Merge' subgenre cooling down? Should I pivot my prototype to 'Match-3'?"

**Our Value Proposition**: Rx Queen is the **Volatility Radar**. We don't just show *where* games are; we show *how fast they are moving*.

---

## 2. Target Personas & Critical Questions

| Persona | The "Wake Up" Question | What They Need on the Home Page |
|:---|:---|:---|
| **Game Developer** | "Did my competitor's update yesterday work?" | Immediate view of specific competitors' rank delta + version update text. |
| **Publisher / Scout** | "What is the next breakout hit *before* it hits the Top 10?" | A "Radar" showing high-velocity games in the Rank #500-#100 band. |
| **Investor** | "Is this entire genre crashing?" | Aggregate health metrics for genres (e.g., "RPG is down 15% this week"). |

---

## 3. The "Unfair Advantage" (Our Capabilities)

We are not just a scraper. We have an **AI Enrichment Layer** that competitors lack.

### A. The "AI Taxonomist" (Hybrid LLM Tagging)
Public stores only have broad genres ("Action").
**We have:**
*   **Granular Subgenres**: "Identify '4X Strategy' vs 'Tower Defense'."
*   **Thematic Analysis**: "Is this game 'Sci-Fi', 'Medieval', or 'Anime'?"
*   **Art Style Detection** (Planned): "Identify 'Pixel Art' vs 'Low Poly'."

**Why this matters**:
An investor doesn't ask "How is Action doing?". They ask "Is the *Anime 4X Strategy* market saturated?" **Only we can answer this.**

### B. Synthetic Scoring Engines
We can define complex logic to create proprietary indices:
*   **"Ad Dependency Score"**: (Free Rank / Grossing Rank) ratios.
*   **"LiveOps Pulse"**: Correlating "Last Update Date" with "Rank Volatility".
*   **"Rx Power Score"**: Dominance + Momentum composite.

### C. The Real-Time Dragnet
*   **Scope**: Top 200 games x 7 Major Economies (US, UK, JP, IN, BR, DE, CA).
*   **Granularity**: Daily snapshots (scalable to hourly).

---

## 4. The Challenge: Moving Beyond "Charts" to "Solutions"

We don't just want pretty UI components. We want **Product Solutions**.
A "Chart" shows data. A "Solution" answers a burning business question.

**The Research Ask:**
Given our **AI Tagging** + **Volatility Data**, what unique data products should we build?

**We are interesting in:**
1.  **Trend Prediction**: Can we flagging a "rising theme" (e.g., "Vampire Survivors-likes") *before* the market realizes it?
2.  **Competitor X-Ray**: Can we use our tagging to generate a "Similar Games Report" that is better than the App Store's recommendation engine?
3.  **Investment Signals**: How do we package "Power Score" into a weekly "Buy/Sell" signal for investors?

---

## 5. Prompt for Deep Research (NotebookLM / Perplexity)

*Feed this prompt to your research tool to get actionable Product Concepts:*

> "I am building a next-gen market intelligence platform for mobile games ('Rx Queen').
>
> **My Secret Weapon**: I use LLMs to auto-tag every game with granular metadata (Subgenre, Theme, Art Style) that Google Play doesn't show. I combine this with real-time Rank Volatility data across 7 countries.
>
> **My Audience**: Game Publishers, Developers, and Investors.
>
> **Task**: Propose 3 unique **'Solutions' or 'Data Products'** I can build using this unique dataset.
> *   Do not just suggest dashboard widgets (e.g. 'a pie chart').
> *   Suggest **valuable insights** I can sell. (e.g., 'The Genre Saturation Index: predicting when a subgenre is too crowded to enter').
> *   For each solution:
>     1. **The Problem**: What expensive mistake does it solve?
>     2. **The Logic**: How do I calculate it using Rank + AI Tags?
>     3. **The Presentation**: How should the user experience this? (A report? A standalone tool? A notification?)"
