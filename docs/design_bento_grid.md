# Design Concept: The "Command Center" Bento Grid

**Goal**: A hyper-premium, "information-dense" visual header for the Rx Queen dashboard. It must feel like a tactical HUD for a market analyst.

## 1. The Layout (The Grid)
We use a **CSS Grid** layout with `gap-4`. 

### Desktop Layout
```
[  Hero Riser (2x2)  ] [  Sector Radar (1x2)  ] [  Power Leader (1x2)  ]
[  Start (1x1)     ] [  Faller (1x1)      ] [  Live Feed (1x2)     ]
```
*(Alternative: A cleaner 3-column layout)*

**Final Selection: The "3-Panel Hero"**
1.  **Left (40%): The Mover Spotlight** (Split top/bottom for Riser/Faller).
2.  **Center (30%): Sector Intelligence** (Radar/Heatmap).
3.  **Right (30%): Power Feed** (High Power Score Leaderboard).

---

## 2. Visual Style: "Tactical Glass"

*   **Glass Panels**: `bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl`.
*   **Glow Effects**:
    *   **Riser**: `shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]` (Emerald Glow).
    *   **Faller**: `shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]` (Rose Glow).
    *   **Power**: `shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]` (Violet Glow).

---

## 3. Component Details (Micro-Interactions)

### A. The "Hyper-Riser" Card
*   **Content**: Iconic Game Image + Giant Numbers.
*   **Animation**: The number counts up on load (`+0` -> `+42`).
*   **Background**: Use the game's icon as a massive, blurred background image (opacity 20%) to fill the card with color sans-distraction.
*   **Detail**: A sleek SVG Sparkline curve overlaying the bottom.

### B. The "Sector Radar"
*   **Visualization**: Instead of a text list, use a horizontal bar chart where bars are gradients.
    *   **Arcade**: Gradient Orange -> Red.
    *   **Strategy**: Gradient Blue -> Cyan.
*   **Interaction**: Hovering a bar highlights the "Top Mover" in that genre.

### C. The "Power Score" Gauge
*   **Visual**: A circular SVG progress ring (donut chart).
    *   **Track**: Dark Grey (`bg-white/10`).
    *   **Fill**: Electric Purple Gradient.
*   **Center Text**: The Score (e.g., "94").

---

## 4. Nano Banana AI Prompt (Updated)

**Copy and paste this into the image generator:**

> **UI Design Mockup, Full Desktop Page, Dark Mode, Analytics Dashboard.**
>
> **Project**: "Rx Queen" - Mobile Game Market Intelligence.
>
> **Layout Composition**:
> The screen is split into two distinct sections:
>
> **1. TOP SECTION (The "Command Deck" - 40% Height):**
> A 3-column "Bento Grid" layout floating on a deep slate background.
> *   **Left Card (Hero Riser)**: Large glass card. Glowing Green border. Shows game icon + giant "+142" text. Sparkline chart in background.
> *   **Center Card (Sector Radar)**: Glass card. Horizontal glowing bars showing "Arcade" (Hot) vs "Strategy" (Cold).
> *   **Right Card (Power Feed)**: Glass card. Vertical list of 3 games with Purple circular progress rings.
>
> **2. BOTTOM SECTION (The "Data Grid" - 60% Height):**
> A high-density data table labeled "Live Rankings (Top 25)".
> *   **Style**: Minimalist rows, dark grey vs black zebra striping.
> *   **Columns**: Rank (#1, #2), Game Info (Icon + Name), Trend Graph (Mini curve), Rating (Star), Genre pill.
> *   **Visual Bridge**: The table header uses the same "frosted glass" effect as the top cards to unify the design.
>
> **Aesthetic Details**:
> *   **Palette**: Deep Slate (#0F172A), Neon Green, Neon Red, Electric Purple.
> *   **Vibe**: Tactical, Expensive, Professional (Bloomberg Terminal meets Linear.app).
> *   **Lighting**: Cinematic lighting highlighting the glass textures of the top cards.
