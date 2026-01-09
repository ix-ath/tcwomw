# Tomorrow's Tasks

**Reference:** `docs/SCOPE_GAP_ANALYSIS.md` for full breakdown

---

## Priority 1: Fix the Bug

**Double-counting scrap on chapter failure**

In `src/systems/CampaignManager.ts`, line ~280:

```typescript
// CURRENT (wrong):
private calculateFailureScrap(): number {
  const errorScrap = this.state.errorsThisChapter;  // Already awarded during play!
  const baleBonus = 5 + Math.floor(Math.random() * 6);
  return errorScrap + baleBonus;
}

// FIX:
private calculateFailureScrap(): number {
  const baleBonus = 5 + Math.floor(Math.random() * 6); // 5-10
  return baleBonus;
}
```

---

## Priority 2: Make Helpers Actually Work

Helpers are defined in `src/data/helpers.json` and SaveManager tracks unlocked/equipped state. But GameScene doesn't USE them.

### Theme Helper
Show the theme hint when Theme helper is equipped:
- Check `SaveManager.isHelperEquipped('theme')`
- Display `phrase.category` somewhere visible

### Tag Helper
Show first tag when Tag helper is equipped:
- Check `SaveManager.isHelperEquipped('tag')`
- Display `phrase.tag` below theme

### Keep Highlight I/II/III
Extend wrong-position highlight duration:
- Base: 1 second
- I: 1.5 seconds
- II: 2 seconds
- III: permanent until typed

### First Letter Focus
Make first letter slightly larger on board.

### First Word Glow
All letters of first word glow blue.

---

## Priority 3: Scrap Spending UI

PitScene exists but only shows stats. Need a shop UI:
- List available helpers with costs
- Show which are unlocked/equipped
- Buy button (spends scrap via SaveManager.spendScrap)
- Equip/unequip toggle

---

## Files to Reference

- `src/systems/CampaignManager.ts` - Fix the bug here
- `src/scenes/GameScene.ts` - Add helper effects here
- `src/scenes/PitScene.ts` - Add shop UI here
- `src/systems/SaveManager.ts` - Has isHelperEquipped(), unlockHelper(), etc.
- `src/data/helpers.json` - Helper definitions

---

## What NOT to Do

- Don't add scrap for winning pages (scrap = failure currency)
- Don't add chapter completion scrap bonuses (that's score, not scrap)
- Don't change the economy philosophy
