# Sprint 3.1: Market Pulse UI — Component Specifications

**Sprint Duration**: Jan 8-12, 2026
**Goal**: Transform the home page into a "Command Center" with actionable insights

---

## Phase B: Signal Cards (Command Deck)

### Overview

Signal Cards are high-visibility panels that answer ONE question at a glance. They sit in a Bento-style grid above the main rankings list.

---

### Signal Card 1: Fastest Rising Game

**Question Answered**: "Which game is gaining the most momentum right now?"

| Attribute | Specification |
|:----------|:--------------|
| **Data Source** | `snapshots` — max(rank_change) where rank_change > 0 |
| **Time Toggles** | Daily (24h) / **Weekly (7d)** [default] / Monthly (30d) |
| **Display Elements** | |
| — Game Icon | 48×48px |
| — Game Name | 16px bold |
| — Rank Change | Hero number (+142) in green |
| — Current Rank | e.g., "Now #23" |
| — Genre Pill | e.g., "Puzzle" |
| **Visual** | Green glow border, ↑ arrow icon |
| **Interaction** | Click opens Game View Panel |

---

### Signal Card 2: Biggest Falling Game

**Question Answered**: "Which game is losing ground fastest?"

| Attribute | Specification |
|:----------|:--------------|
| **Data Source** | `snapshots` — min(rank_change) where rank_change < 0 |
| **Time Toggles** | Daily / **Weekly** [default] / Monthly |
| **Display Elements** | Same as Rising, but red accents |
| **Visual** | Red glow border, ↓ arrow icon |

---

### Signal Card 3: Hottest Rising Genre (Sector Heat)

**Question Answered**: "Which genre is on fire right now?"

| Attribute | Specification |
|:----------|:--------------|
| **Data Source** | `genre_stats` — max(avg_velocity) |
| **Display** | |
| — Genre Name | e.g., "Arcade" with 🔥 icon |
| — Velocity Score | e.g., "+17.3 avg" |
| — Games Tracked | e.g., "23 games" |
| — Top Mover | Best game in that genre |
| **Visual** | Orange/amber glow, animated pulse |
| **Interaction** | Click filters rankings to that genre |

---

### Signal Card 4: Coldest Falling Genre

**Question Answered**: "Which genre is cooling off?"

| Attribute | Specification |
|:----------|:--------------|
| **Data Source** | `genre_stats` — min(avg_velocity) |
| **Display** | Same structure, blue/cyan accents |
| **Visual** | Ice blue glow, ❄️ icon |

---

### ~~Signal Card 5: Power Score Leader~~ (DISCARDED)

*Concept discarded — will revisit in future sprint.*

---

### Signal Card Layout (Bento Grid)

```
┌─────────────────────────────────┬─────────────────────────────────┐
│   🔥 FASTEST RISER              │   ❄️ BIGGEST FALLER             │
│                                 │                                 │
│   Block Blast                   │   Candy Crush                   │
│   +142 ▲  •  Now #23            │   -87 ▼  •  Now #45             │
│   [Puzzle]                      │   [Casual]                      │
└─────────────────────────────────┴─────────────────────────────────┘
┌─────────────────────────────────┬─────────────────────────────────┐
│   🔥 HOTTEST GENRE              │   ❄️ COLDEST GENRE              │
│                                 │                                 │
│   Arcade  ████████████  +17.3   │   Card   ████       -4.2        │
│   Music   █████████     +15.7   │   Board  ███        -3.1        │
│   Sports  ████████      +12.1   │   Trivia ██         -2.8        │
└─────────────────────────────────┴─────────────────────────────────┘
```

---

## Phase C: Game View Panel

### Overview

When a user clicks on any game row in the rankings, a slide-out panel opens showing comprehensive game details.

**Inspiration**: SensorTower/Data.ai app pages, Steam game pages, IMDb movie pages

---

### Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [X Close]                                            GAME VIEW │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────┐                                                        │
│  │ ICON │   Block Blast! Adventure Master                       │
│  │64x64 │   by Hungry Studio                                     │
│  └──────┘   ★★★★☆ (4.5)                                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  CLASSIFICATION                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Genre: Puzzle          Subgenre: Match-3                    ││
│  │ Theme: [TBD]           Art Style: [TBD]                     ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  CURRENT STATUS                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Rank     │  │ Change   │  │ Power    │  │ Days On  │         │
│  │   #3     │  │  +142    │  │   94     │  │  Chart   │         │
│  │ (Free)   │  │ (24h)    │  │ ●●●●●    │  │   47     │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  HISTORICAL PERFORMANCE                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ All-Time Best Rank (Free):       #1  (Dec 15, 2025)         ││
│  │ All-Time Best Rank (Grossing):   #5  (Dec 20, 2025)         ││
│  │ Peak Power Score:                98  (Dec 18, 2025)         ││
│  │ First Seen:                      Nov 3, 2025                ││
│  │ Weeks Tracked:                   9                          ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  TREND CHART                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [7 Day] [30 Day] [90 Day]                                  ││
│  │                                                              ││
│  │      ╭──────────────────╮                                    ││
│  │     ╱                    ╲                                   ││
│  │    ╱                      ────────                           ││
│  │   ╱                                                          ││
│  │  ─                                                           ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  SUBGENRE RANKING                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Within "Match-3" games:                                      ││
│  │ Rank #2 of 45 tracked games                                  ││
│  │ Top 5% performer in subgenre                                 ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  MULTI-COUNTRY PRESENCE                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🇺🇸 US: #3  🇬🇧 GB: #5  🇯🇵 JP: #12  🇩🇪 DE: #8              ││
│  │ 🇧🇷 BR: #1  🇮🇳 IN: #2  🇰🇷 KR: #45  🇫🇷 FR: #7              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

### Game View Panel Data Requirements

| Section | Data Source | Notes |
|:--------|:------------|:------|
| **Header** | `games` table | name, developer, icon_url |
| **Classification** | `games` table | genre, subgenre, theme (TBD), art_style (TBD) |
| **Current Status** | `daily_trends` view | current_rank, rank_change, power_score |
| **Current Status (Days)** | `game_stats` table | Calculated from first_seen_at |
| **Historical** | `game_stats` table | all_time_best_rank_*, first_seen_at, etc. |
| **Trend Chart** | `snapshots` (21 days) + `weekly_summaries` (beyond) | SVG line chart |
| **Subgenre Ranking** | Query: rank within same subgenre | Real-time calculation |
| **Multi-Country** | `daily_trends` grouped by country | Top 8 countries |

---

### Fields Marked as TBD

| Field | Status | Plan |
|:------|:-------|:-----|
| **Theme** | TBD | Sprint 4+ — Extend AI tagging to detect themes |
| **Art Style** | TBD | Sprint 5+ — Extend AI tagging to detect visual style |
| **Rating** | Optional | Already in scraped data, not currently stored |
| **Recent Changes** | Optional | "What's New" text from store (LiveOps X-Ray prerequisite) |

---

## Component Files to Create

| File | Purpose |
|:-----|:--------|
| `dashboard/app/components/pulse/SignalCard.tsx` | Reusable card component |
| `dashboard/app/components/pulse/RiserCard.tsx` | Fastest rising game |
| `dashboard/app/components/pulse/FallerCard.tsx` | Biggest falling game |
| `dashboard/app/components/pulse/GenreHeatCard.tsx` | Sector heat display |
| `dashboard/app/components/pulse/PowerLeaderCard.tsx` | Power score leader |
| `dashboard/app/components/pulse/CommandDeck.tsx` | Bento grid container |
| `dashboard/app/components/game/GameViewPanel.tsx` | Slide-out detail panel |
| `dashboard/app/components/game/TrendChart.tsx` | Historical sparkline/chart |
| `dashboard/app/components/ui/Sparkline.tsx` | Micro-chart SVG |
| `dashboard/app/components/ui/PowerDots.tsx` | ●●●●○ indicator |

---

## API Endpoints Needed

| Endpoint | Returns |
|:---------|:--------|
| `GET /api/pulse/movers` | Fastest riser & biggest faller |
| `GET /api/pulse/genres` | Genre heat scores |
| `GET /api/pulse/power-leader` | Top power score game |
| `GET /api/game/[id]` | Full game detail for panel |
| `GET /api/game/[id]/history` | Historical rank data for chart |

---

## Implementation Priority

1. **Day 1**: Create database tables (`weekly_summaries`, `game_stats`)
2. **Day 2**: Build `SignalCard` base component + `RiserCard`
3. **Day 3**: Build `FallerCard`, `GenreHeatCard`, `CommandDeck` layout
4. **Day 4**: Build `GameViewPanel` structure + data fetching
5. **Day 5**: Polish, animations, responsive testing
