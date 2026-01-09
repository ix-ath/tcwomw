# CUBE SCRAP ECONOMY - Corrected Analysis

**Date:** 2026-01-08

---

## Design Intent (from CORE_LOOP_SPEC.md)

**Two currencies, two purposes:**
| Currency | Source | Unlocks |
|----------|--------|---------|
| **Wins** | Completing pages/chapters/stories | Features, content, themes |
| **Failures** | Wrong letters, lost chapters (Pit) | Helpers, boosts, upgrades |

**Scrap = failure currency.** You earn it by messing up. This is intentional.

**Philosophy:**
- Struggling players earn more scrap → unlock more helpers → can finish campaign
- Skilled players earn less scrap → but don't NEED helpers
- "Accessibility over gatekeeping" - helpers let anyone finish
- "Mastery track" - score penalties for using helpers, not progress blocks

---

## Scrap Sources (per design)

| Source | Scrap | Notes |
|--------|-------|-------|
| Wrong letter | 1 | Immediate, during play |
| Lost chapter (bale) | 5-10 | On chapter failure |
| Book completion bonus | ? | "Based on performance" - unclear if this is scrap or score |
| Achievements | One-time | Not specified how much |
| Mutator bonus | +X% | Percentage bonus to scrap earned |

---

## Current Implementation Issue

**Bug: Double-counting errors on failure**

In `CampaignManager.calculateFailureScrap()`:
```typescript
const errorScrap = this.state.errorsThisChapter;  // WRONG - already awarded
const baleBonus = 5 + Math.floor(Math.random() * 6);
return errorScrap + baleBonus;  // Double-counts errors
```

Errors are already awarded 1 scrap each during play via `SaveManager.recordError()`. The failure calculation should ONLY be the bale bonus.

**Fix:**
```typescript
private calculateFailureScrap(): number {
  const baleBonus = 5 + Math.floor(Math.random() * 6); // 5-10
  return baleBonus;
}
```

---

## Open Questions (for Bryan)

1. **"Book completion bonus based on performance"** - Is this scrap or score? The design mentions it as a scrap source but doesn't specify amounts.

2. **Achievement scrap amounts** - Which achievements give scrap? How much?

3. **Mutator scrap bonus** - The +20%/+30%/etc bonuses - do these apply to all scrap earned during a mutator run, or just failure scrap?

---

## What's Working

- 1 scrap per wrong letter ✅
- 5-10 scrap bale bonus on chapter fail ✅ (after fix)
- Scrap persisted in SaveManager ✅
- Scrap displayed in BreakRoomScene ✅

## What's Missing (Not Bugs)

- Achievement scrap bonuses (achievements don't exist yet)
- Mutator scrap bonuses (mutators don't exist yet)
- Scrap spending UI in The Pit
- Visual feedback when scrap is earned
