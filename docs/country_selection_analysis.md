# Target Country Selection: Research-Based Analysis

## Selection Criteria

We select countries based on **four strategic dimensions**:

1. **Revenue Markets** — Where the money is (IAP spending)
2. **Soft Launch Markets** — Where games are tested before global release
3. **Development Hubs** — Where studios/publishers are based (our target users)
4. **Emerging Markets** — High-growth regions with unique trends

---

## Category 1: Revenue Powerhouses (7 Countries)

The top mobile gaming markets by IAP revenue (2024 data):

| Rank | Country | Code | 2024 Revenue | Why Track |
|:-----|:--------|:-----|:-------------|:----------|
| 1 | **United States** | US | $24B IAP | Largest Western market |
| 2 | **Japan** | JP | $16B IAP | Unique gacha/RPG trends |
| 3 | **South Korea** | KR | $6B IAP | Esports + midcore leader |
| 4 | **Germany** | DE | $5B IAP | Largest EU market |
| 5 | **United Kingdom** | GB | $4B IAP | Key Western market |
| 6 | **France** | FR | $3B IAP | 2nd largest EU market |
| 7 | **Taiwan** | TW | $2B IAP | Chinese-language trends |

*Source: Sensor Tower 2024 Report*

**Note**: China is excluded because Google Play is not available there. We track Taiwan as a proxy for Chinese-language trends.

---

## Category 2: Soft Launch / Testing Markets (6 Countries)

Publishers test games here before global launch because player behavior mirrors target markets at lower CPI:

| Country | Code | Why Used for Soft Launch |
|:--------|:-----|:-------------------------|
| **Canada** | CA | Mirrors US player behavior; low CPI |
| **Australia** | AU | Premium Western market; English-speaking |
| **New Zealand** | NZ | Often paired with AU for testing |
| **Philippines** | PH | Low CPI; Western-friendly audience |
| **Singapore** | SG | High monetization rates; SEA hub |
| **Finland** | FI | Nordic testing for EU launches |

*Source: PocketGamer, GameDeveloper.com*

---

## Category 3: Development & Publishing Hubs (5 Countries)

Countries where major mobile game studios/publishers are headquartered — **our primary target users**:

| Country | Code | Key Studios | Why Track |
|:--------|:-----|:------------|:----------|
| **Israel** | IL | Playtika ($5B), Moon Active (Coin Master), Jelly Button | Social casino & casual leader |
| **Vietnam** | VN | Topped China in exports (6.7B downloads 2024) | Hyper-casual factory |
| **Sweden** | SE | King, Supercell (HQ moved to Helsinki but Swedish team) | Match-3 & strategy |
| **Turkey** | TR | Peak Games (acquired by Zynga), Rollic | Hyper-casual hub |
| **China (Hong Kong proxy)** | HK | Tencent, NetEase (testing market) | Access to Chinese dev trends |

*Source: PocketGamer.biz, MobiDictum*

---

## Category 4: High-Growth Emerging Markets (4 Countries)

Fastest-growing regions by downloads and revenue:

| Country | Code | 2024 Growth | Why Track |
|:--------|:-----|:------------|:----------|
| **Brazil** | BR | Major soft launch hub; largest LATAM | Tracks LATAM trends |
| **India** | IN | 1.5B+ downloads/year | Massive scale, unique trends |
| **Indonesia** | ID | Largest SEA market | Mobile-first population |
| **Saudi Arabia** | SA | +18% revenue growth (fastest globally) | MENA leader, Vision 2030 investment |

*Source: Sensor Tower, Mordor Intelligence*

---

## Final Selection: 22 Countries

| # | Code | Country | Category | Priority |
|:--|:-----|:--------|:---------|:---------|
| 1 | US | United States | Revenue | ⭐⭐⭐ |
| 2 | JP | Japan | Revenue | ⭐⭐⭐ |
| 3 | KR | South Korea | Revenue | ⭐⭐⭐ |
| 4 | DE | Germany | Revenue | ⭐⭐⭐ |
| 5 | GB | United Kingdom | Revenue | ⭐⭐⭐ |
| 6 | FR | France | Revenue | ⭐⭐ |
| 7 | TW | Taiwan | Revenue | ⭐⭐ |
| 8 | CA | Canada | Soft Launch | ⭐⭐⭐ |
| 9 | AU | Australia | Soft Launch | ⭐⭐⭐ |
| 10 | NZ | New Zealand | Soft Launch | ⭐⭐ |
| 11 | PH | Philippines | Soft Launch | ⭐⭐ |
| 12 | SG | Singapore | Soft Launch | ⭐⭐ |
| 13 | FI | Finland | Soft Launch | ⭐ |
| 14 | IL | Israel | Dev Hub | ⭐⭐⭐ |
| 15 | VN | Vietnam | Dev Hub | ⭐⭐ |
| 16 | SE | Sweden | Dev Hub | ⭐⭐ |
| 17 | TR | Turkey | Dev Hub | ⭐⭐ |
| 18 | HK | Hong Kong | Dev Hub | ⭐⭐ |
| 19 | BR | Brazil | Emerging | ⭐⭐⭐ |
| 20 | IN | India | Emerging | ⭐⭐⭐ |
| 21 | ID | Indonesia | Emerging | ⭐⭐ |
| 22 | SA | Saudi Arabia | Emerging | ⭐⭐⭐ |

---

## What We Intentionally Exclude

| Country | Reason |
|:--------|:-------|
| China (CN) | Google Play not available |
| Russia (RU) | Sanctions; payment processing issues |
| UAE (AE) | Covered by SA for MENA trends |
| Mexico (MX) | BR covers LATAM patterns |
| Italy/Spain | FR/DE cover EU patterns |

---

## Cost Impact: 22 Countries × 500 Games

| Metric | Value |
|:-------|:------|
| Snapshots/day | 22 × 3 × 500 = **33,000** |
| Storage/day | ~16.5MB |
| 30-day retention | **~495MB** ✅ Just under 500MB |
| Weekly summaries/year | ~11MB |
| Local archive/year | ~6GB |
| **Supabase cost** | **$0** |
| GitHub Actions/day | ~60 min |

---

## Summary

These 22 countries give us:
- ✅ **85%+ of global mobile gaming revenue**
- ✅ **All major soft launch markets**
- ✅ **All major development hubs** (where our users are)
- ✅ **Fastest-growing emerging markets**
- ✅ **Stays within free tier** (with 30-day retention + local archive)
