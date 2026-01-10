# Scrap Spending UI Implementation Plan
## PitScene Shop System

**Date:** 2026-01-09
**Priority:** CRITICAL (closes progression loop)
**Estimated Effort:** Medium (2-3 hours)

---

## Context

From MARKET_READINESS.md:
> "Can earn scrap, can't spend it (loop broken)"

The player earns Cube Scrap from mistakes and chapter failures, but there's no way to spend it on Helpers. This breaks the core progression loop.

---

## Current PitScene Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  < BACK                        THE PIT                                    │
├──────────────┬───────────────────────────────────────────────────────────┤
│ LETTER LOG   │                                    ┌─ INTAKE ───────────┐ │
│              │                                    │ [conveyor belt]    │ │
│  A: 15  ███  │                                    └────────────────────┘ │
│  B: 3   █    │                                                           │
│  C: 8   ██   │         ┌─────────────────────────┐                      │
│  ...         │         │ LETTERS TO PROCESS: 847 │                      │
│              │         └─────────────────────────┘                      │
│              │                                                           │
│              │                                                           │
│              │            [falling letters animation]                    │
│              │                                                           │
│              │                                                           │
│              │     ░░░▓▓░░░▓░▓░░░▓▓░░░░▓░░░░                           │
│              │   ▓░▓░░░░▓▓░░▓░░░░▓▓░▓░░░░░▓░░                          │
│              │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                         │
├──────────────┴───────────────────────────────────────────────────────────┤
│    TOTAL ERRORS: 847  |  BALES CREATED: 12  |  LIFETIME SCRAP: 892       │
│                     [ESC] or [BACKSPACE] to return                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Gap:** No shop. "LETTERS TO PROCESS" counter provides no gameplay value.

---

## Proposed Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  < BACK                        THE PIT                                    │
├──────────────┬────────────────────────────────────┬──────────────────────┤
│ LETTER LOG   │                                    │      FOUNDRY        │
│              │  ┌─ INTAKE ───────────────┐       │  ═══════════════════ │
│  A: 15  ███  │  │ [conveyor belt]        │       │  SCRAP: ◈ 47         │
│  B: 3   █    │  └────────────────────────┘       │  ───────────────────  │
│  C: 8   ██   │                                   │                      │
│  ...         │                                   │  ▶ Theme         ◈1  │
│              │                                   │    [EQUIPPED]        │
│              │      [falling letters]            │                      │
│              │                                   │    Tag           ◈5  │
│              │                                   │    [LOCKED]          │
│              │                                   │                      │
│              │                                   │    Keep Highlight I  │
│              │     ░░░▓▓░░░▓░▓░░░░               │    ◈10 [BUY]        │
│              │   ▓░▓░░░░▓▓░░▓░░░░░               │                      │
│              │  ░░░░░░░░░░░░░░░░░░               │    (scroll for more) │
├──────────────┴────────────────────────────────────┴──────────────────────┤
│                     [ESC] Back  [↑↓] Navigate  [ENTER] Select            │
└──────────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. Added "FOUNDRY" shop panel on right side (replaces queue counter)
2. Prominent scrap balance display
3. Scrollable helper list with status indicators
4. Keyboard navigation hints in footer

---

## Design Decisions

### 1. Shop Name: "FOUNDRY"
Fits industrial theme. "Forge your failures into tools."

### 2. Helper Item States

| State | Visual | Action |
|-------|--------|--------|
| **LOCKED** | Dimmed, cost shown | Cannot interact (missing prereq or funds) |
| **AFFORDABLE** | Normal, cost shown | [BUY] button |
| **UNLOCKED** | Bright, checkmark | [EQUIP] toggle |
| **EQUIPPED** | Highlighted, gear icon | [UNEQUIP] toggle |

### 3. Prerequisite Display
If a helper requires another helper first, show:
> "Requires: Theme"

Dimmed and non-selectable until prerequisite is met.

### 4. Categories
Group by category (VISION, TIMING, FORGIVENESS) with dividers:
```
─── VISION ───
  Theme         ◈1  [EQUIPPED]
  Tag           ◈5  [BUY]
─── TIMING ───
  Keep Highlight I  ◈10  [BUY]
```

### 5. Keyboard Navigation
- **↑/↓** or **W/S**: Navigate helper list
- **Enter/Space**: Buy/Equip/Unequip selected helper
- **ESC/Backspace**: Return to Break Room

### 6. Audio Feedback
- `ui_select`: Navigating list
- `purchase` (new): Buying a helper
- `equip` (new): Equipping/unequipping
- `error` (existing): Insufficient funds or missing prerequisite

---

## Helpers Data (from helpers.json)

| ID | Name | Cost | Category | Prerequisite |
|----|------|------|----------|--------------|
| theme | Theme | 1 | VISION | - |
| tag | Tag | 5 | VISION | theme |
| keep-highlight-1 | Keep Highlight I | 10 | TIMING | - |
| keep-highlight-2 | Keep Highlight II | 25 | TIMING | keep-highlight-1 |
| keep-highlight-3 | Keep Highlight III | 50 | TIMING | keep-highlight-2 |
| heavy-letters | Heavy Letters | 50 | TIMING | - |
| first-word-glow | First Word Glow | 75 | VISION | - |
| first-letter-focus | First Letter Focus | 100 | VISION | - |
| second-chance | Second Chance | 150 | FORGIVENESS | - |

---

## Implementation Steps

### Step 1: Shop Panel Container
Add right sidebar panel to PitScene with industrial styling:
- Dark metal background (0x1a1612)
- Rust-colored border (0x8b4513)
- Corner rivets (consistent with letter log panel)
- Title: "FOUNDRY"

### Step 2: Scrap Balance Display
Prominent display at top of shop panel:
- Large font size for number
- Cube scrap icon (◈ or custom)
- Updates in real-time when spending

### Step 3: Helper List
Create interactive list component:
- Load helpers from `helpers.json`
- Calculate status for each helper
- Render with appropriate styling per status
- Show cost, name, and action button

### Step 4: Purchase/Equip Logic
Wire up to SaveManager:
```typescript
// Buy helper
if (SaveManager.spendScrap(helper.cost)) {
  SaveManager.unlockHelper(helper.id);
  SaveManager.equipHelper(helper.id); // Auto-equip on purchase
  // Play success sound
} else {
  // Play error sound, show "Insufficient scrap" message
}

// Toggle equip
if (SaveManager.isHelperEquipped(helper.id)) {
  SaveManager.unequipHelper(helper.id);
} else {
  SaveManager.equipHelper(helper.id);
}
```

### Step 5: Keyboard Navigation
- Track `selectedIndex` for current helper
- Arrow keys / WASD to navigate
- Enter/Space to interact
- Visual highlight on selected item

### Step 6: Audio Feedback
Add to AudioManager or use existing sounds:
- `ui_hover` for navigation
- `correct_letter` for successful purchase (reuse)
- `wrong_letter` for failed purchase (reuse)

### Step 7: Visual Feedback
- Flash balance when spending
- Animate status change on purchase
- Toast notification: "Theme unlocked!"

---

## File Changes

| File | Change |
|------|--------|
| `src/scenes/PitScene.ts` | Add shop panel, helper list, keyboard nav |
| `src/data/audio-manifest.json` | Add ui_hover, purchase sounds (optional) |
| `docs/SCOPE_GAP_ANALYSIS.md` | Mark scrap spending as complete |
| `docs/MARKET_READINESS.md` | Mark scrap spending as complete |
| `docs/FEATURES.md` | Update FB.85 status |

---

## Future Enhancements

1. **Helper Details Panel**: Hover/select to see full description
2. **Category Filters**: Show only VISION, only TIMING, etc.
3. **Sort Options**: By cost, by owned status
4. **Animations**: Helper items slide in, purchase celebration

---

## Success Criteria

- [x] Player can see current scrap balance in Pit
- [x] Player can see all helpers with costs
- [x] Player can purchase helpers with scrap
- [x] Player can equip/unequip owned helpers
- [x] Prerequisites are enforced
- [x] Keyboard navigation works
- [x] Audio feedback on actions
- [x] Progression loop is closed

---

## Notes

- This is the last "Critical" gap from MARKET_READINESS.md
- After this, the game has a complete core loop
- The 4 unimplemented helper effects (Heavy Letters, First Word Glow, First Letter Focus, Second Chance) can be purchased but won't do anything yet - that's acceptable for MVP
