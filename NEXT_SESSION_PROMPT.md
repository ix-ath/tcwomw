# Next Session: UI Implementation

## Reference
- **Full spec:** `docs/UI_SPEC.md` - All design decisions documented
- **Current code:** `src/scenes/UIScene.ts` - Needs refactoring

---

## Implementation Plan

### Phase 1: Left Sidebar Refactor

**Goal:** Strip down to Chapter/Page + Score only.

**Remove:**
- Pressure bar (lines 72-86, 161-186)
- Status text (lines 92-96, 208-238)
- MODS placeholder (lines 98-112)

**Keep/Modify:**
- Stage text → Change to verbose format: "Chapter 3 • Page 4/8"
- Score → Keep, will add animation in Phase 2

**Files to modify:**
- `src/scenes/UIScene.ts` - Main refactor
- `src/constants.ts` - May need new LAYOUT values for right sidebar

---

### Phase 2: Score Animation ("Slot Machine")

**Goal:** Score that feels alive, erupts after word completion.

**New behaviors:**
1. Numbers roll/tick up on each correct letter
2. Visible modifier deductions (−5 flash for errors)
3. After word complete, brief pause then "eruption" animation
4. Rolling digit effect (like an odometer)

**Implementation approach:**
```typescript
// New ScoreDisplay class or methods in UIScene:
- animateScoreChange(from: number, to: number, duration: number)
- showModifier(text: string, color: number) // "+10" or "-5" floating
- triggerEruption() // Called after word complete, disrupts calm
```

**Events to listen for:**
- `correctLetter` → tick score up
- `wrongLetter` → show "-5" modifier, tick score appropriately
- `wordComplete` → eruption animation

---

### Phase 3: Right Sidebar - Combo Light Panel

**Goal:** Industrial glass indicator lights showing combo progress.

**Layout (from spec):**
```
┌─────────────────────┐
│ [=====>    ] WORD   │  ← Progress bar fills as you type
├─────────────────────┤
│  PINK  YELLOW GREEN │
│   ●      ○      ○   │  ← Lights fill downward
│   ●      ○      ○   │
│   ○      ○      ○   │
└─────────────────────┘
```

**New constants needed:**
```typescript
// In constants.ts
LAYOUT: {
  // ... existing
  RIGHT_SIDEBAR_WIDTH: 160,
  RIGHT_SIDEBAR_X: 1200, // 1280 - 80
}

COMBO_LIGHTS: {
  ROWS: 3,
  COLUMNS: 3, // Pink, Yellow, Green
  LIGHT_SIZE: 24,
  LIGHT_SPACING: 8,
  COLORS: {
    PINK: 0xff69b4,
    YELLOW: 0xffd700,
    GREEN: 0x00ff41,
    OFF: 0x333333,
  }
}
```

**New class:** `ComboLightPanel`
- `wordProgressBar` - Graphics object, fills left-to-right
- `lights[3][3]` - 2D array of circle graphics
- `updateWordProgress(percent: number)`
- `lightUp(column: number, row: number)`
- `reset()`

**Combo logic (TBD - needs design clarification):**
- Complete word without errors → light one pink
- Fill pink column → start yellow (5x?)
- Fill yellow column → start green (25x?)
- Any error → reset? Or just stop progress?

---

### Phase 4: Error Counter (Machine Aesthetic)

**Goal:** Mechanical counter that clicks up on errors.

**Visual idea:** Old taxi meter / factory production counter
- Displayed on right sidebar (below combo lights?)
- Or integrated into crusher area

**Implementation:**
- Counter digits that "flip" like an analog counter
- Click/tick sound on increment
- Grungy industrial styling

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/scenes/UIScene.ts` | Major refactor - strip sidebar, add score animation |
| `src/constants.ts` | Add RIGHT_SIDEBAR, COMBO_LIGHTS constants |
| `src/ui/ScoreDisplay.ts` | NEW - Slot machine score component |
| `src/ui/ComboLightPanel.ts` | NEW - Glass light panel component |
| `src/ui/ErrorCounter.ts` | NEW - Mechanical counter component |

---

## Events Needed from GameScene

Current events:
- `crusherUpdate` - Has combo count
- `correctLetter` - Triggered on correct
- `wrongLetter` - Triggered on error

May need new events:
- `wordComplete` - For score eruption timing
- `pageProgress` - Current letter index / total for word progress bar

---

## Quick Start Command

```bash
npm run dev
```

Then in browser, play a round to see current UI. Start by stripping the left sidebar in Phase 1.

---

## Design Questions to Resolve During Implementation

1. **Combo light reset:** Does any error reset all lights, or just stop progress?
2. **Score eruption timing:** How long after word complete? 200ms pause then erupt?
3. **Error counter placement:** Right sidebar below lights, or near crusher?
4. **Audio:** What sounds for lights turning on, score rolling?
