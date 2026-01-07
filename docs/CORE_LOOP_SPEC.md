# CORE LOOP SPECIFICATION
## The Crushing Weight of My Words

**Version**: 0.2.0
**Status**: Approved for Implementation
**Date**: 2026-01-07

---

## The Game

**"The Crushing Weight of My Words"** - A psychological horror typing/word-guessing game where your mistakes literally crush you.

**Core Fantasy:** "I must be perfect. Every imperfection is shoved in my face."

**Mastery Goal:** Perfect run with no helpers on hardest difficulty.

---

## Core Loop

1. Player sees **theme** + **scrambled letters** + **blank spaces** (`___ ____`)
2. Player **guesses letters in order** (like Hangman meets Wheel of Fortune)
3. **Correct guess:** Letter disappears from board → appears in blank → crusher jolts UP → brief pause (relief)
4. **Wrong guess (not in word):** Instant crusher drop + feedback (shake/flash) → letter animates from staging to above crusher as weight
5. **Wrong guess (in word, wrong position):** Same as above, BUT the letter on the board **highlights** to show "I'm here, just not yet"
6. **Win:** Complete the word/phrase
7. **Lose:** Crusher reaches fail zone

---

## Crusher Behavior

| State | Behavior |
|-------|----------|
| **Dormant** | Stationary until first mistake |
| **Awakened** | Slow passive descent + weight-based drops |
| **Correct input** | Fixed lift amount + brief pause |
| **Wrong input** | Instant drop + weight added above |

- **First mistake awakens it** → slow passive descent begins
- **Perfect run** = crusher never moves = achievement badge

---

## Game Board Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ STAGING AREA (wrong letters animate here before falling)        │
├──────────┬─────────────────────────────────────┬────────────────┤
│          │  GAME AREA                          │                │
│  SCORE   │  ┌─────────────────────────────┐   │  ANIMATED      │
│  MODS    │  │ CRUSHER (weight piles here) │   │  ARTWORK       │
│  BUTTONS │  ├─────────────────────────────┤   │  JUICY STUFF   │
│          │  │                             │   │                │
│          │  │   SCRAMBLED LETTERS         │   │                │
│          │  │   (static, slight rotation) │   │                │
│          │  │   (coin-push physics)       │   │                │
│          │  │                             │   │                │
│          │  ├─────────────────────────────┤   │                │
│          │  │ FAIL ZONE (game over line)  │   │                │
│          │  ├─────────────────────────────┤   │                │
│          │  │ ___ ____ ___ + THEME        │   │                │
│          │  └─────────────────────────────┘   │                │
└──────────┴─────────────────────────────────────┴────────────────┘
```

### Zone Descriptions

| Zone | Purpose |
|------|---------|
| **Staging Area** | Top header - wrong letters appear/animate here before affecting crusher |
| **Left Sidebar** | Score, modifiers, buttons, UI |
| **Game Area** | Main play zone with crusher, letters, fail line |
| **Right Sidebar** | Animated artwork, decorative elements, "juicy stuff" |
| **Blank Display** | Bottom - `___ ____` reveal + theme display |

---

## Scrambled Letters

- **Content:** Exact match only - exactly the letters needed to spell the answer (including duplicates)
- **Spawn:** Static positions with slight rotation for visual interest
- **Legibility:** Always readable - legibility over chaos
- **Physics:** Coin-pusher style when crusher interacts
  - Gentle push/slide
  - Stay upright and stable
  - Not chaotic bulldozer physics

### Letter States

| State | Appearance | Behavior |
|-------|------------|----------|
| **Default** | Normal | Static, scannable |
| **Highlighted** | Glowing | Valid letter typed in wrong position (upgrade extends duration) |
| **Typed** | Disappears | Animates to blank display at bottom |

---

## Input & Feedback

### Correct Guess
| Timing | What Happens |
|--------|--------------|
| **Instant** | Crusher lifts (fixed amount) + brief pause |
| **Cosmetic** | Letter disappears from board → pops into blank (animate travel later) |

### Wrong Guess (not in word)
| Timing | What Happens |
|--------|--------------|
| **Instant** | Crusher drops + screen shake/flash |
| **Cosmetic** | Letter animates from staging → above crusher as weight |

### Wrong Guess (valid letter, wrong position)
| Timing | What Happens |
|--------|--------------|
| **Instant** | Same as wrong guess above |
| **Additional** | Letter on board highlights to indicate "I'm here, just not now" |

---

## The Pit

- **Contains:** All wrong letters + bales from lost rounds
- **Permanent:** Never shrinks - visual monument to all failures
- **Currency:** Lifetime count is spendable, but pit keeps growing
- **Scale:** Thousands of letters eventually (3pt font, static batching)
- **Location:** Separate screen accessed from hub

---

## Hub: The Break Room

Depressing workplace break room aesthetic.

| Starting | Unlockable |
|----------|------------|
| Chair | Fridge (scoreboard) |
| Crack in tile (The Pit) | Microwave, Sink, etc. |

Each fixture = a feature/system.

---

## Progression & Currency

| Currency | Source | Unlocks |
|----------|--------|---------|
| **Wins** | Completing words/rounds | Features, content, themes |
| **Failures** | Wrong letters, lost rounds (Pit count) | Helpers, boosts, upgrades |

Both success and failure have value.

---

## Upgrades

**Framework:** Build to support many, implement few initially.

**Style:** Incremental/Balatro-inspired - impactful and fun, not +5% stat boosts.

### Example Upgrades
| Name | Effect |
|------|--------|
| Keep Highlight I/II/III | Valid-but-wrong letters glow longer |
| First Letter Focus | First letter slightly larger |
| Heavy Letters | Certain letters pause crusher momentarily |
| First Word Glow | All letters of first word glow blue |

---

## Game Modes

| Mode | Crusher Start | Round Behavior |
|------|---------------|----------------|
| **Campaign** | Dormant | Fresh each round |
| **Speed/Book** | Continuous | Multiple words, space shrinks as crusher descends |

---

## Word/Phrase System

### Data Structure
```json
{
  "text": "RESTAURANT",
  "theme": "Places",
  "tags": ["food", "building", "social"],
  "difficulty": "medium"
}
```

### Display
- Word boundaries visible: `___ ____ ___`
- Theme shown to player
- Tags provide additional hints

### Sources
- **Curated:** Hand-crafted for campaign
- **Generated:** AI-assisted for volume
- **Workshop:** Steam Workshop for user content

---

## Visual Theme

- **Style:** Monty Python collage/cutout aesthetic (inspired by, not copying)
- **Architecture:** Skinnable/themeable (separate assets from logic)
- **Workshop:** Theme packs = asset folder + config
- **Animation:** Spritesheet-based, potentially Spine/DragonBones for complex stuff

---

## Vertical Slice Definition

**"Done" when:**

- [ ] Game board matches layout sketch
- [ ] One round plays correctly
- [ ] Unknown word guessing with scrambled letters (exact match)
- [ ] Failures accumulate above crusher visually
- [ ] Crusher dormant until first mistake, then descends
- [ ] Win by completing word
- [ ] **Feel is right:**
  - [ ] Instant feedback on input
  - [ ] Pause/relief on correct
  - [ ] Jolt/dread on wrong
  - [ ] Valid-wrong-position highlights letter

---

## Implementation Priority

1. **Game board layout** - Match sketch, establish all zones
2. **Crusher behavior** - Dormant → awakens on mistake, weight above
3. **The feel** - Instant feedback, pause on correct, jolt on wrong, all tuned

---

## Open Questions / Future Decisions

| Topic | Question | Status |
|-------|----------|--------|
| Word memorization | How to prevent trivializing via memorization? | Massive pools + Workshop |
| Speed mode specifics | Exact mechanics of shrinking space | Future |
| Inter-round campaign | What happens between rounds? | Future |
| Upgrade balancing | How much do upgrades help? | Playtest |
