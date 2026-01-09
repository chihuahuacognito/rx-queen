# Rx Queen UI Design Plan: "Command Center"
**Version**: 1.0 | **Date**: January 9, 2026
**Design Philosophy**: "Tactical Glass" — Bloomberg Terminal meets Linear.app

---

## 1. Executive Summary

This document outlines a world-class UI design for the Rx Queen dashboard, synthesizing best practices from:
- **Fintech Dashboards**: High data density, dark mode, actionable insights
- **Linear/Vercel Design Systems**: Minimalism, consistency, purposeful whitespace
- **Bloomberg Terminal**: Function over form, hiding complexity, multi-panel layouts
- **Gaming Analytics**: Leaderboards, real-time updates, contextual rankings

**Core Principle**: Every pixel must answer a user question. No decorative elements.

---

## 2. Design System Foundation

### 2.1 Color Palette

| Token | Value | Usage |
|:------|:------|:------|
| `--bg-primary` | `#0F172A` | Main background (Slate 900) |
| `--bg-card` | `rgba(15,23,42,0.6)` | Glass card backgrounds |
| `--text-primary` | `#F1F5F9` | Main text (Slate 100) |
| `--text-muted` | `#94A3B8` | Secondary text (Slate 400) |
| `--accent-rise` | `#10B981` | Positive movement (Emerald 500) |
| `--accent-fall` | `#F43F5E` | Negative movement (Rose 500) |
| `--accent-power` | `#8B5CF6` | Power score indicator (Violet 500) |
| `--accent-hot` | `#F97316` | "Hot" genre indicator (Orange 500) |
| `--border-subtle` | `rgba(255,255,255,0.05)` | Card borders |

### 2.2 Typography

| Element | Font | Size | Weight |
|:--------|:-----|:-----|:-------|
| Hero Numbers | Inter | 48-64px | 700 (Bold) |
| Card Titles | Inter | 14px | 600 (Semibold) |
| Body Text | Inter | 13px | 400 (Regular) |
| Micro Labels | Inter | 11px | 500 (Medium) |
| Monospace Data | JetBrains Mono | 12px | 500 |

### 2.3 Glass Effect (Glassmorphism)

```css
.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
```

### 2.4 Glow Effects (Signal States)

```css
/* Rising Game Glow */
.glow-rise {
  box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.4);
}

/* Falling Game Glow */
.glow-fall {
  box-shadow: 0 0 40px -10px rgba(244, 63, 94, 0.4);
}

/* Power Leader Glow */
.glow-power {
  box-shadow: 0 0 40px -10px rgba(139, 92, 246, 0.4);
}
```

---

## 3. Page Layout Architecture

### 3.1 Overall Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Navigation + Country Selector)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│  │   SIGNAL CARD   │ │   SIGNAL CARD   │ │  SIGNAL CARD   │ │
│  │   (Riser)       │ │   (Faller)      │ │  (Genre Heat)  │ │
│  └─────────────────┘ └─────────────────┘ └────────────────┘ │
│                                                              │
│  COMMAND DECK (40% viewport height)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  LIVE RANKINGS TABLE (Billboard Style)                  ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ # │ GAME INFO │ TREND │ ΔRANK │ GENRE │ POWER     │  ││
│  │  ├───────────────────────────────────────────────────┤  ││
│  │  │ 1 │ Block Blast │ ▲▲▲  │ +142  │ Puzzle│ ●●●●○    │  ││
│  │  │ 2 │ Fortnite    │ ——   │ 0     │ Action│ ●●●●●    │  ││
│  │  │...│ ...         │ ...  │ ...   │ ...   │ ...      │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  DATA GRID (60% viewport height, scrollable)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Signal Card: "The Mover"

**Purpose**: Instantly highlight the most significant rank change.

**Layout**:
```
┌────────────────────────────────────────┐
│  ● FASTEST RISER                       │  ← Label (11px, muted)
│                                        │
│  ┌──────┐                              │
│  │ ICON │   Game Name                  │  ← Icon 48x48, Name 16px bold
│  └──────┘   Developer Name             │  ← Developer 12px muted
│                                        │
│           ┌──────────┐                 │
│           │   +142   │                 │  ← Hero Number (48px, green)
│           └──────────┘                 │
│                                        │
│  ───────────────────── (sparkline)     │  ← 7-day trend micro-chart
│                                        │
│  Genre: Puzzle  •  US  •  2h ago       │  ← Context pills
└────────────────────────────────────────┘
```

**Specifications**:
- **Green Glow Border**: Applied when card represents "riser"
- **Red Glow Border**: Applied when card represents "faller"
- **Sparkline**: Line sparkline showing 7-day rank trajectory (no axes, pure shape)
- **Animation**: Number counts up from 0 on page load (subtle, 600ms)

---

### 4.2 Signal Card: "Sector Heat"

**Purpose**: Show which genres are moving fastest (aggregate velocity).

**Layout**:
```
┌────────────────────────────────────────┐
│  ● SECTOR HEAT                         │
│                                        │
│  Arcade      ██████████████  +17.3 🔥  │  ← Bar width = relative velocity
│  Music       █████████       +15.7     │
│  Sports      ████████        +12.1     │
│  Puzzle      ██████          +8.4      │
│  Strategy    ███             +3.2      │
│                                        │
│  Coldest: Card  •  -4.2 avg            │  ← Inline "worst performer"
└────────────────────────────────────────┘
```

**Specifications**:
- **Bars**: Horizontal bars with gradient fills (hot = orange→red, cold = blue→cyan)
- **🔥 Icon**: Only on the #1 hottest genre
- **Hover State**: Show top moving game in that genre

---

### 4.3 Power Score Indicator

**Purpose**: Visualize the composite "Dominance + Momentum" score.

**Options** (ranked by minimalism):

**Option A: Dot Scale (Recommended)**
```
Power: ●●●●○  (4/5 dots filled)
```
- 5 circles, filled proportionally to score
- Color: Violet gradient

**Option B: Bar Gauge**
```
Power: [█████████░░] 85
```
- Horizontal bar with numeric value

**Option C: Circular Ring** (More complex, but visually striking)
```
   ╭───╮
  │ 85 │  ← Centered number
   ╰───╯
```
- SVG ring showing percentage fill

**Recommendation**: Option A for table rows (minimal space), Option C for standalone cards.

---

### 4.4 Data Table: Billboard Rankings

**Purpose**: High-density scannable list of top games.

**Columns**:

| Column | Width | Content |
|:-------|:------|:--------|
| **Rank** | 48px | `#1`, `#2`, etc. Gold/Silver/Bronze for top 3 |
| **Trend** | 40px | Sparkline (7-day) OR directional arrows |
| **Game** | flex | Icon (32x32) + Name + Developer (stacked) |
| **Δ Rank** | 80px | `+142` (green) or `-23` (red) with arrow |
| **Genre** | 100px | Pill badge (e.g., "Puzzle") |
| **Power** | 80px | Dot scale ●●●●○ |

**Row Styling**:
- **Zebra Striping**: Subtle alternating rows (`bg-white/[0.02]`)
- **Rank #1 Special**: Faint gold left border accent
- **Hover**: Slight glow, reveal "View Details" action
- **New Entry Badge**: Small "NEW" tag in accent color

---

### 4.5 Sparkline Micro-Chart

**Purpose**: Show trend shape without numbers.

**Specifications**:
- **Size**: 64px wide × 24px tall (max)
- **Type**: Line (continuous data) or Column (discrete comparisons)
- **Color**: Single color (Slate 500), no fill
- **Markers**: Only on first/last point (optional)
- **No Axes**: Pure shape

**Implementation**: Use simple SVG path or a lightweight library like `sparkline.js`.

```html
<svg viewBox="0 0 64 24" class="sparkline">
  <path d="M0,20 L10,18 L20,12 L30,15 L40,8 L50,10 L60,4" 
        fill="none" stroke="currentColor" stroke-width="2"/>
</svg>
```

---

## 5. Interaction Patterns

### 5.1 Micro-Interactions

| Element | Trigger | Animation |
|:--------|:--------|:----------|
| Hero Number | Page Load | Count up from 0 (600ms, ease-out) |
| Signal Card | Hover | Subtle scale (1.01), glow intensify |
| Table Row | Hover | Background brighten, reveal tooltip |
| Genre Pill | Click | Filter table to that genre |
| Power Dots | Hover | Show exact score (e.g., "84/100") |

### 5.2 Loading States

- **Skeleton Loaders**: Animated shimmer effect matching card shapes
- **Staggered Load**: Cards animate in left-to-right with 50ms delay each

---

## 6. Responsive Breakpoints

| Breakpoint | Layout Changes |
|:-----------|:---------------|
| **Desktop (≥1280px)** | 3-column signal cards, full table |
| **Tablet (768-1279px)** | 2-column signal cards, hide Power column |
| **Mobile (≤767px)** | 1-column signal cards (vertically stacked), simplified table |

---

## 7. Implementation Priority

### Phase 1: Foundation (Day 1-2)
1. Update `globals.css` with design tokens
2. Create `SignalCard` component (reusable for Riser/Faller/Heat)
3. Implement sparkline SVG component

### Phase 2: Command Deck (Day 3-4)
4. Create `CommandDeck` grid layout
5. Implement "Mover" card with real data
6. Implement "Sector Heat" card with genre aggregates

### Phase 3: Table Upgrade (Day 5-6)
7. Enhance `ChartRow` with Power Score dots
8. Add sparkline to each row
9. Refine typography and spacing

### Phase 4: Polish (Day 7)
10. Add micro-interactions (hover, load animations)
11. Responsive adjustments
12. Performance optimization

---

## 8. Accessibility Considerations

- **Color Blind Safe**: Green/Red supplemented by icons (↑/↓)
- **Contrast Ratios**: All text passes WCAG AA (4.5:1 minimum)
- **Screen Readers**: ARIA labels on all interactive elements
- **Keyboard Navigation**: Full tab-through support

---

## 9. Inspiration References

| Product | What to Learn |
|:--------|:--------------|
| **Linear.app** | Minimal UI, no visual noise, keyboard-first |
| **Bloomberg Terminal** | Data density, function over form, consistent layout |
| **Vercel Dashboard** | Clean grids, purposeful whitespace, dark mode done right |
| **Superhuman** | Speed perception, instant feedback, premium feel |
| **Stripe Dashboard** | Data visualization clarity, progressive disclosure |

---

## 10. Files to Create/Modify

| File | Purpose |
|:-----|:--------|
| `dashboard/app/globals.css` | Add design tokens, glass effect, glow utilities |
| `dashboard/app/components/pulse/SignalCard.tsx` | Reusable signal card |
| `dashboard/app/components/pulse/SectorHeat.tsx` | Genre heat bars |
| `dashboard/app/components/pulse/CommandDeck.tsx` | Grid container |
| `dashboard/app/components/ui/Sparkline.tsx` | SVG micro-chart |
| `dashboard/app/components/ui/PowerDots.tsx` | Power score indicator |
| `dashboard/app/page.tsx` | Integrate CommandDeck above ChartList |
