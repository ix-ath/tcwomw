# Crusher Awakening System
## Current Implementation & Proposed Redesign

**Date:** 2026-01-10
**Status:** Current system documented, redesign proposed

---

## CURRENT SYSTEM (v1.0 - For Rollback Reference)

### Overview

The crusher uses a "Graduated Awakening" system where multiple errors are required before continuous descent begins. This was designed to give new players breathing room.

### State Machine

```
DORMANT → STIRRING → LOOSENING → AWAKENED
   ↑          ↑           ↑          ↑
 Start    1st error   2nd error  3rd+ error
```

| State | Behavior | Visual |
|-------|----------|--------|
| **DORMANT** | Crusher doesn't move at all | Static, no threat |
| **STIRRING** | Small shove + short slide, then STOPS | Brief movement, relief |
| **LOOSENING** | Bigger shove + longer slide, then STOPS | More movement, building tension |
| **AWAKENED** | Continuous descent begins | Constant pressure |

### Awakening Thresholds (by Difficulty)

From `src/constants.ts`:

```typescript
AWAKENING_THRESHOLD: {
  EASY: 4,      // 4 mistakes before continuous descent
  MEDIUM: 3,    // 3 mistakes (default)
  HARD: 2,      // 2 mistakes
  EXPERT: 1,    // 1 mistake = immediate motion
}
```

### Error Response Mechanics

Each error triggers:
1. **Instant shove** - 2.5% of runway dropped immediately
2. **Slide behavior** - Varies by state:
   - STIRRING: 1.25% slide, then stops
   - LOOSENING: 2.5% slide, then stops
   - AWAKENED: Continuous descent at base speed

### Current Implementation Location

- **State machine**: `src/scenes/GameScene.ts` in `processCrusherState()`
- **Constants**: `src/constants.ts` in `CRUSHER.AWAKENING` object
- **Threshold lookup**: `CRUSHER.AWAKENING_THRESHOLD[difficulty]`

### Code Reference

```typescript
// From constants.ts
AWAKENING: {
  SHOVE_DROP_PERCENT: 2.5,        // Instant drop on each mistake
  STIRRING_SLIDE_PERCENT: 1.25,   // 1st mistake slide
  LOOSENING_SLIDE_PERCENT: 2.5,   // 2nd mistake slide
  SLIDE_SPEED_PERCENT: 3,         // How fast slides happen
},

AWAKENING_THRESHOLD: {
  EASY: 4,
  MEDIUM: 3,
  HARD: 2,
  EXPERT: 1,
}
```

### Design Rationale (Original)

- "Heavy thing needs multiple shoves to get moving"
- Gives new players grace period to learn
- Creates tension through anticipation
- Expert mode provides challenge for skilled players

### Problems Identified

1. **Too easy for returning players** - Bryan's playtest noted game feels too easy
2. **Removes tension** - DORMANT state has no threat at all
3. **Progression feels weak** - Helpers add power but baseline is already forgiving
4. **No meaningful early upgrades** - Cheapest helper (Theme @ 1 scrap) is informational, not protective

---

## PROPOSED SYSTEM (v2.0)

### Core Philosophy Change

> "Start hard, earn your safety nets"

Instead of giving players multiple free mistakes, make the first error meaningful. Then sell the safety nets as upgrades, creating real progression.

### New Default Behavior

**After tutorial completion:**
- First error = crusher immediately AWAKENED (continuous descent)
- No free STIRRING/LOOSENING phases
- Equivalent to current EXPERT difficulty for everyone

### New Helper: "Failsafe" Tier

Add purchasable awakening threshold upgrades:

| Helper | Cost | Effect | Prerequisite |
|--------|------|--------|--------------|
| **Failsafe I** | 3 | First error only stirs (no continuous descent) | None |
| **Failsafe II** | 8 | Second error only loosens | Failsafe I |
| **Failsafe III** | 15 | Third error required for awakening | Failsafe II |
| **Failsafe IV** | 30 | Fourth error required (current EASY equivalent) | Failsafe III |

### Upgrade Costs Rationale

- **Failsafe I (3 scrap)**: Cheap, attainable in ~3 errors. Immediate relief for struggling players.
- **Failsafe II (8 scrap)**: One chapter failure worth of scrap. Meaningful but achievable.
- **Failsafe III (15 scrap)**: Requires some grinding or intentional failure. Comfortable buffer.
- **Failsafe IV (30 scrap)**: Luxury tier. Makes game very forgiving.

**Total to max out Failsafe tree: 56 scrap** (about 5-6 chapter failures worth)

### Implementation Plan

#### 1. Update Constants

```typescript
// New default - immediate awakening
AWAKENING_THRESHOLD: {
  EASY: 1,      // Was 4, now 1 (Failsafe upgrades restore old behavior)
  MEDIUM: 1,    // Was 3, now 1
  HARD: 1,      // Was 2, now 1
  EXPERT: 1,    // Unchanged
}
```

#### 2. Add Failsafe Helpers to helpers.json

```json
{
  "id": "failsafe-1",
  "name": "Failsafe I",
  "description": "First error only stirs the crusher. Doesn't start continuous descent.",
  "cost": 3,
  "category": "FORGIVENESS",
  "tier": 1
},
{
  "id": "failsafe-2",
  "name": "Failsafe II",
  "description": "Second error only loosens the crusher. Still no continuous descent.",
  "cost": 8,
  "category": "FORGIVENESS",
  "prerequisite": "failsafe-1",
  "tier": 2
},
{
  "id": "failsafe-3",
  "name": "Failsafe III",
  "description": "Third error required before crusher begins continuous descent.",
  "cost": 15,
  "category": "FORGIVENESS",
  "prerequisite": "failsafe-2",
  "tier": 3
},
{
  "id": "failsafe-4",
  "name": "Failsafe IV",
  "description": "Four errors required before crusher awakens. Maximum protection.",
  "cost": 30,
  "category": "FORGIVENESS",
  "prerequisite": "failsafe-3",
  "tier": 4
}
```

#### 3. Modify GameScene Awakening Logic

```typescript
private getAwakeningThreshold(): number {
  // Check equipped Failsafe helpers
  if (SaveManager.isHelperEquipped('failsafe-4')) return 4;
  if (SaveManager.isHelperEquipped('failsafe-3')) return 3;
  if (SaveManager.isHelperEquipped('failsafe-2')) return 2;
  if (SaveManager.isHelperEquipped('failsafe-1')) return 1;

  // Default: immediate awakening (threshold of 0 means first error awakens)
  return 0;
}
```

#### 4. Tutorial Adjustment

The OOPS tutorial phase should:
- Still teach wrong-position highlighting
- Still force the "impossible sentence" failure
- Player experiences immediate awakening (learns the real threat)
- Earns enough scrap from tutorial to buy Failsafe I if desired

#### 5. Kid-Friendly Mode (Separate Feature)

Implement as a Settings toggle, NOT a helper:

```typescript
// In SettingsManager
gameplay: {
  showLetterOrder: false,
  randomWordMode: false,
  kidFriendlyMode: false,  // NEW: Disables crusher entirely
}
```

**Kid-Friendly Mode Behavior:**
- Crusher never descends
- Errors still tracked (for Pit/scrap)
- Can be suggested after 3+ consecutive chapter failures
- Clearly labeled as "practice mode" or similar

---

## DIFFICULTY SCALING WITH NEW SYSTEM

### Before (Current)

| Difficulty | Threshold | Feel |
|------------|-----------|------|
| EASY | 4 errors | Very forgiving |
| MEDIUM | 3 errors | Forgiving |
| HARD | 2 errors | Some pressure |
| EXPERT | 1 error | Challenging |

### After (Proposed)

| Difficulty | Base Threshold | With Failsafe IV |
|------------|----------------|------------------|
| EASY | 0 (immediate) | 4 errors |
| MEDIUM | 0 (immediate) | 4 errors |
| HARD | 0 (immediate) | 4 errors |
| EXPERT | 0 (immediate) | 4 errors |

**Note:** Difficulty now primarily affects descent SPEED and lift amounts, not awakening threshold. Failsafe helpers become the primary way to control forgiveness.

---

## ECONOMIC IMPACT

### Early Game Flow (New)

1. **Tutorial**: Player learns mechanics, earns ~5 scrap from forced failures
2. **Chapter 1**: Player struggles, earns scrap from errors
3. **After 1-2 failures**: Player can afford Failsafe I (3 scrap)
4. **Choice point**: Buy Failsafe I for safety OR save for Theme (1) + Tag (5)

### Scrap Earning Rates (Reference)

- 1 scrap per wrong letter
- 5-10 scrap per chapter failure (bale)
- ~3-8 errors per chapter for average player

### Progression Path Options

**Path A: Safety First**
1. Failsafe I (3) → Failsafe II (8) → Theme (1) → Tag (5)
2. Total: 17 scrap, very safe gameplay, limited hints

**Path B: Information First**
1. Theme (1) → Tag (5) → Failsafe I (3) → Keep Highlight I (10)
2. Total: 19 scrap, better guessing, less protection

**Path C: Balanced**
1. Failsafe I (3) → Theme (1) → Tag (5) → Failsafe II (8)
2. Total: 17 scrap, reasonable safety + hints

---

## MIGRATION CONSIDERATIONS

### Existing Save Data

Players with existing saves should:
- Retain all unlocked/equipped helpers
- NOT automatically get Failsafe helpers
- Experience the harder baseline (intentional - they've already beaten content)

### Version Flag

Add migration check:
```typescript
// In SaveManager
if (saveData.version < '2.0.0') {
  // Existing players start with no Failsafe helpers
  // New players also start with none
  // No automatic grants
}
```

---

## TESTING CHECKLIST

When implementing:

- [ ] Default threshold is 0 (immediate awakening)
- [ ] Failsafe I adds 1 to threshold
- [ ] Failsafe II adds another 1 (total 2)
- [ ] Failsafe III adds another 1 (total 3)
- [ ] Failsafe IV adds another 1 (total 4)
- [ ] Tutorial still teaches mechanics properly
- [ ] Tutorial awards enough scrap for Failsafe I
- [ ] THE FOUNDRY shows new Failsafe helpers
- [ ] Prerequisites work (can't buy II without I)
- [ ] Kid-Friendly mode completely disables descent
- [ ] Suggestion prompt appears after 3 consecutive failures

---

## ROLLBACK INSTRUCTIONS

If this change proves too punishing:

1. Revert `AWAKENING_THRESHOLD` values in `constants.ts`:
   ```typescript
   AWAKENING_THRESHOLD: {
     EASY: 4,
     MEDIUM: 3,
     HARD: 2,
     EXPERT: 1,
   }
   ```

2. Keep Failsafe helpers in game (they become "extra" protection)

3. Or remove Failsafe helpers entirely and return to pure difficulty-based thresholds

---

## RELATED DOCUMENTS

- `docs/CORE_LOOP_SPEC.md` - Full crusher mechanics
- `docs/SCOPE_GAP_ANALYSIS.md` - Feature status
- `docs/MARKET_READINESS.md` - MVP checklist
- `src/constants.ts` - All tunable values
- `src/data/helpers.json` - Helper definitions
