# UI SPECIFICATION
## The Crushing Weight of My Words

**Version**: 0.1.0
**Status**: Design Complete, Awaiting Implementation
**Date**: 2026-01-09

---

## Design Session Summary

This spec was derived from a 10-question Q&A session focused on the left sidebar UI during gameplay.

**Core Principle:** Eyes on letters + crusher, nowhere else. All other UI should be peripheral, not demanding attention.

---

## Layout Zones

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGING AREA (wrong letters animate here before falling)        │
├──────────┬─────────────────────────────────────────┬────────────┤
│          │  GAME AREA                              │            │
│  INFO    │  ┌─────────────────────────────────┐   │  FEEDBACK  │
│  TEXT    │  │ CRUSHER (weight piles here)     │   │  LIGHTS    │
│  NUMBERS │  ├─────────────────────────────────┤   │  GLOWS     │
│          │  │   SCRAMBLED LETTERS             │   │  COMBO     │
│          │  │   (coin-push physics)           │   │            │
│          │  └─────────────────────────────────┘   │            │
│          │  ─────────────────────────────────     │            │
│          │  ___ ____ ___ + THEME                  │            │
└──────────┴─────────────────────────────────────────┴────────────┘
```

### Zone Assignments

| Zone | Purpose | Content Type |
|------|---------|--------------|
| **Left Sidebar** | Information | Text, numbers, progress - read at a glance |
| **Right Sidebar** | Feedback | Visual glows, combo lights, machine response |
| **Game Area** | Focus | Letters, crusher, penalty blocks - eyes here |

**Key Asymmetry:** Left = brain reads. Right = eyes feel.

---

## Left Sidebar: Information Panel

### Content (Final)

| Element | Show | Notes |
|---------|------|-------|
| Chapter/Page Progress | YES | Full verbose: "Chapter 3 • Page 4/8" |
| Score | YES | Slot machine style animation |
| Pressure Bar | NO | Crusher itself tells this story |
| Status Label (DORMANT/DESCENDING) | NO | Will be visual object on game screen later |
| Equipped Helpers | NO | Accessible via pause menu only |
| Scrap Balance | NO | Not displayed during gameplay |
| Error Count | YES* | But as machine interface, not plain text |

*Error count was initially removed, then reconsidered. See Machine Counter section.

### Progress Format

**Full verbose display.** Player should know exactly where they are.

> "If the player has six hundred words to type out of a legit book, I want them to know they have a LONG way to go."

**Format:** `Chapter 3 • Page 4/8`

### Score Display Philosophy: "Whose Line Is It Anyway"

Score is **prominent, flashy, juicy, but completely meaningless** for progression.

**Design:**
- Score = "WPM minus modifiers" - a mastery rating
- Decoupled from Scrap (failure currency) and WPM (raw metric)
- Small base numbers (e.g., 100 points for perfect word)
- Visible deductions: -5 per mistake, -10% for helpers, etc.
- Slot machine animation style - numbers rolling, modifiers visually applying

**Behavior:**
- Always visible, updating in real-time
- After completing a word, there's a brief pause/calm moment
- Score **disrupts that calm** - erupts with animation to keep player on edge
- The moment you think you can breathe, the score reminds you there's no peace

> "I want the score to feel like a slot machine wheel that is paying out every second."

### Density & Animation

**Dynamic.** Text pulses/animates when values change, then settles.

Score animation specifically:
- Doesn't need to draw the eye constantly
- Visual representation of every modifier applied in real-time
- When you glance over, something satisfying is happening

---

## Right Sidebar: Feedback Panel

### Purpose

The right sidebar is the player's "personal space" with the machine. It lights up as you perform well, like a factory status panel coming alive.

> "Knowing their combo count doesn't really matter because score doesn't matter, but typing letters and seeing them light up (like they were doing a good job at work) their boring dark machine..."

### Combo System: Glass Light Panel

**No numbers.** Combo is displayed through visual feedback.

**Design:** Industrial glass indicator lights, like a machine status panel.

```
┌─────────────────────┐
│ [=====>    ] WORD   │  ← Progress bar fills as you type current word
├─────────────────────┤
│  PINK  YELLOW GREEN │
│   ●      ○      ○   │  ← Column 1: Words (fills downward)
│   ●      ○      ○   │  ← Column 2: 5x (Sentences? TBD)
│   ○      ○      ○   │  ← Column 3: 25x (Pages? TBD)
└─────────────────────┘
```

**Mechanics:**
1. Progress bar represents current word - fills as you type each letter
2. Complete a perfect word → first pink light turns on
3. Continue combo → next pink light below
4. Complete a perfect set (words/page/sentence TBD) → yellow column starts (5x multiplier)
5. Continue further → green column (25x multiplier)

**Visual style:** Glass indicator lights. Industrial. Binary-ish escalation. Very satisfying to watch fill up.

**Audio is critical.** "I want to hear the combo."

### Machine Error Counter

*Reconsidered during session - now included.*

The error count IS displayed, but integrated into the machine aesthetic rather than as plain text.

**Goal:** Helpless employee constantly reminded of failure.

**Implementation idea:** Mechanical counter (like an old taxi meter or factory production counter) that clicks up with each mistake.

> "I think seeing the # of incorrect letters go up as well as them falling would add weight. I want this number to be part of the interface or machine though."

---

## Removed From Gameplay UI

These elements will NOT appear during gameplay:

| Element | Reason | Alternative |
|---------|--------|-------------|
| Pressure bar | Crusher tells this story visually | - |
| Status label (DORMANT/CRITICAL) | Will be animated visual object later | Color-changing crusher? |
| Scrap balance | Penalty letters piling = the feedback | Results screen |
| Helpers list | Clutters view, distracts from letters | Pause menu access |

### Helpers Access

**Pause menu only.** Not during active gameplay.

Future idea: "Periodic table" display in the Break Room's Locker fixture for loadout management, not during gameplay.

---

## Error Feedback

When player makes a mistake:

1. **Visual cue** - TBD (flash, shake)
2. **Audio cue** - TBD (metallic clang)
3. **Letter animation** - Disappears from staging, particle effect, moves up to crusher
4. **Score deduction** - Counted instantly, visible on score
5. **Machine counter** - Clicks up (mechanical counter aesthetic)
6. **Penalty block** - Falls onto crusher as weight

> "My goal is for the player to imagine themselves as this helpless employee who is constantly reminded of their failure."

---

## Scrap Feedback (Deferred)

This topic needs a separate 3-5 question design session.

**Current instinct:** The physical pile of penalty letters IS the feedback, not a number.

**Open question:** Should "+1 scrap" appear on error, or is that noise?

**Noted considerations:**
- Most players would want it displayed
- Bryan wants emotional weight from visual pile, not numbers
- May need different treatment during gameplay vs results

---

## Implementation Priority

### Phase 1: Core Layout
1. Establish left/right sidebar zones
2. Chapter/Page progress display (verbose format)
3. Basic score display

### Phase 2: Score Animation
1. Slot machine rolling effect
2. Modifier visualization
3. Post-word eruption timing

### Phase 3: Right Sidebar Combo System
1. Word progress bar
2. 3-column glass light grid
3. Light-up animations (pink → yellow → green)

### Phase 4: Machine Aesthetic
1. Error counter as mechanical element
2. Crusher status integration (visual, not text)
3. "Personal space with machine" feel

---

## Technical Notes

### Existing Systems to Reference

- `UIScene.ts` - Current HUD overlay (will need refactoring)
- `GameScene.ts` - Core gameplay, crusher state machine
- `SaveManager.ts` - Scrap, helpers, progress tracking
- `CampaignManager.ts` - Chapter/page progression
- `constants.ts` - LAYOUT zones, COLORS

### Layout Constants (from constants.ts)

```typescript
LAYOUT: {
  LEFT_SIDEBAR_WIDTH: 120,
  RIGHT_SIDEBAR_WIDTH: 120,
  GAME_AREA_LEFT: 120,
  GAME_AREA_RIGHT: 680,
  // etc.
}
```

---

## Open Questions

| Topic | Question | Status |
|-------|----------|--------|
| Combo units | What resets combo columns? Word? Sentence? Page? | Needs design |
| Scrap feedback | "+1" on error or only visual pile? | Needs separate session |
| Error counter style | Mechanical taxi meter? Factory counter? | Visual design needed |
| Score formula | Base - mistakes - helper % = final? Details? | Needs math session |
| Audio | What sounds for combo lights, score eruption? | Needs audio design |

---

## Next Steps

1. **Scrap System Q&A** - Separate 3-5 question session to nail down scrap feedback
2. **Score Math Session** - Define the actual formula and modifiers
3. **Implementation** - Build the left sidebar with score + progress first
