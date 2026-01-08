# Revenue Estimation: Competitor Methodologies & Rx Queen Strategy

## 1. How Competitors Estimate Revenue (The "Black Box" Declassified)

Through market research and technical analysis of **AppMagic**, **SensorTower**, and **Data.ai**, we have identified their core methodologies. They do not have "actual" data for every app; they use a **"Ground Truth + Extrapolation"** model.

### A. The "Ground Truth" Layer (Calibration Data)
These platforms require a subset of *real, 100% accurate data* to calibrate their models. They get this from:
1.  **Connected Accounts**: Publishers connect their App Store Connect / Google Play Console to the tool (in exchange for free "Premium" analytics). This gives the tool accurate `Rank vs Revenue` and `Rank vs Downloads` data points for specific apps.
2.  **Consumer Panels**: Apps (VPNs, Ad Blockers, Utility apps) owned by these companies that track user behavior (screen time, app usage) on millions of devices (SensorTower claims diverse panels).
3.  **Third-Party Data Buying**: Purchasing anonymized credit card/transaction datasets.

### B. The Extrapolation Layer (The Model)
Once they know that "Rank #50 RPG in US = $50k/day" (from a connected client), they apply this to *other* games at Rank #50.

**The Power Law Curve:**
Revenue and Downloads follow a "Power Law" distribution relative to Rank.
`Revenue = Baseline_Constant * (Rank ^ -Decay_Factor)`

> **External Validation**: Studies consistently show this "Winner Take All" distribution.
> *   *Carare (2012)*: Top 25 devs earn 50% of revenue ([Forbes](https://www.forbes.com/)).
> *   *Roma & Ragaglia (2016)*: App Store Revenue follows a Pareto/Power-Law distribution.
> *   *SensorTower (2024)*: Top 1% of publishers generate 94% of revenue.

*   **Grossing Rank** is the primary signal for IAP Revenue.
*   **Free Rank** is the primary signal for Downloads.
*   **Modifiers**:
    *   **Country Tier**: (US Rank #1 >> India Rank #1).
    *   **Category**: (Casino Rank #10 >> Puzzle Rank #10).
    *   **Seasonality**: (Christmas Rank #10 > July Rank #10).

### C. Ad Revenue (The Hard Problem)
AppMagic and others openly admit Ad Revenue is "Hardly Reliable" or exclude it entirely.
**Methodology**: `Downloads * Retention * Ads_Per_Session * eCPM`.
*   *Downloads*: Estimated from Free Rank.
*   *Retention/Ads_Per_Session*: Guessed based on Genre benchmarks (e.g., Hypercasual = High ads).
*   *eCPM*: Benchmark averages per Country (e.g., US Rewarded Video = ~$15).

---

## 2. A Feasible Strategy for Rx Queen (The "Proxy" Model)

We cannot afford "Consumer Panels" or "Buying Credit Card Data". However, we **can** replicate the **Power Law Model** using *Public Anchors*.

### Strategy: "The Calibrated Curve"

#### Step 1: Establish Anchors (The "Knowns")
We need ~5-10 data points of "Rank vs Revenue" to draw our curve.
*   **Source 1: Your App**: We will use your live app's performance (US Rank vs daily revenue) as a **High-Fidelity Anchor**.
*   **Source 2: Public Reports**: Game dev post-mortems on Reddit/Medium/Twitter.
*   **Source 3: Competitor Free Tiers**: Rough checks on SensorTower Free view.

#### Step 2: Build the Curve (The Algorithm)
We implement a simple logarithmic regression model in our backend.
*   *Input*: Daily Rank (from our DB).
*   *Function*: `Estimated_Revenue = A * ln(Rank) + B` (calibrated per Country/Genre).
*   *Output*: **Tiered Ranges** (Vague by design, per user feedback).
    *   Instead of "$12,432", show:
    *   `Band 1: < $5k / mo`
    *   `Band 2: $5k - $20k / mo`
    *   `Band 3: $20k - $100k / mo`
    *   `Band 4: $100k - $500k / mo`
    *   `Band 5: $500k+ / mo`

#### Step 3: The "Ad-Intensity" Tag (Our Unique Value)
Since we can't measure *actual* ad views, we measure **Ad Potential**.
*   **Scan**: Does the specific game store page say "Contains Ads"?
*   **Genre Weight**: Hypercasual (1.0), Puzzle (0.6), RPG (0.1).
*   **Metric**: `Ad_Dependency_Score`.
    *   *High*: Game has high Downloads (Free Rank) but low IAP (Grossing Rank).
    *   *Low*: Game has high Grossing Rank.

## 3. Validation Plan

1.  **Ingest Internal Data**:
    *   Add your app's "Rank History" and "Real Revenue History" to a private table `internal_benchmarks`.
2.  **Backtest the Curve**:
    *   Run our `estimate_revenue(rank)` function on your app's rank history.
    *   Compare the result against your *Real Revenue*.
    *   Adjust the `Decay_Factor` until the estimated range matches reality ~80% of the time.
3.  **Cross-Check**:
    *   Find 3 public "Indie Dev Post-mortems" from 2024/2025.
    *   Check if our model puts them in the correct "Band".

This gives us a scientifically grounded "Guesstimate" that adds massive value without promising false precision.
