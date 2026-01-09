# SCOPE GAP ANALYSIS
## Design vs Implementation Status

**Date:** 2026-01-08
**Reference:** CORE_LOOP_SPEC.md, GAME_DESIGN.md, CLAUDE.md

---

## CORE LOOP

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Sequential letter guessing | ✓ | ✅ Done | - |
| Auto-skip spaces/punctuation | ✓ | ✅ Done | - |
| Correct = lift + pause | ✓ | ✅ Done | - |
| Wrong = drop + shake + penalty letter | ✓ | ✅ Done | - |
| Wrong-position highlighting | ✓ | ✅ Done | Highlight duration not upgradeable yet |
| Win = complete phrase | ✓ | ✅ Done | - |
| Lose = crusher hits fail zone | ✓ | ✅ Done | - |

---

## CRUSHER BEHAVIOR

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Graduated awakening (Dormant → Awakened) | ✓ | ✅ Done | - |
| Awakening threshold by difficulty | ✓ | ✅ Done | - |
| Penalty letters accelerate descent | ✓ | ✅ Done | - |
| Lift amount by difficulty | ✓ | ✅ Done | - |
| 200ms pause on correct | ✓ | ✅ Done | - |

---

## CAMPAIGN STRUCTURE

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Story → Chapter → Page hierarchy | ✓ | ✅ Done | - |
| Main campaign (10 chapters, ~61 pages) | ✓ | ✅ Done | - |
| Chapter boss (isBoss flag) | ✓ | ✅ Data | Boss not visually distinct |
| Story boss (final chapter) | ✓ | ✅ Data | No special treatment |
| Loss = restart chapter | ✓ | ✅ Done | - |
| Content scaling (words → sentences) | ✓ | ✅ Data | Difficulty curve not tuned |
| Workshop stories | Future | 📋 | Data structure ready |

---

## TUTORIAL

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| ON → START → OOPS sequence | ✓ | ✅ Done | - |
| OOPS teaches wrong-position | ✓ | ✅ Done | - |
| Impossible sentence (forces failure) | ✓ | ✅ Done | - |
| Pit introduction | ✓ | ✅ Done | - |
| Theme unlock purchase | ✓ | ✅ Done | - |
| "Figured Out the Impossible" achievement | ✓ | 🔴 Missing | Achievement system needed |

---

## CUBE SCRAP ECONOMY

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| 1 scrap per wrong letter | ✓ | ✅ Done | - |
| 5-10 scrap per chapter loss (bale) | ✓ | 🔴 Bug | Double-counting errors |
| Book completion bonus | ✓ | ❓ Unclear | Design says "based on performance" |
| Achievement bonuses | ✓ | 🔴 Missing | Achievements don't exist |
| Mutator bonus % | ✓ | 🔴 Missing | Mutators don't exist |
| Scrap spending UI | ✓ | 🔴 Missing | Pit shows stats, no shop |

---

## HELPERS (unlockable upgrades)

| Helper | Cost | Status | Gap |
|--------|------|--------|-----|
| Theme | 1 | 🟡 Partial | Unlockable in tutorial, but not shown in gameplay |
| Tag | 5 | 🔴 Data only | Helper exists, effect not implemented |
| Keep Highlight I | 10 | 🔴 Data only | Effect not implemented |
| Keep Highlight II | 25 | 🔴 Data only | Effect not implemented |
| Keep Highlight III | 50 | 🔴 Data only | Effect not implemented |
| Heavy Letters | 50 | 🔴 Data only | Effect not implemented |
| First Word Glow | 75 | 🔴 Data only | Effect not implemented |
| First Letter Focus | 100 | 🔴 Data only | Effect not implemented |
| Second Chance | 150 | 🔴 Data only | Effect not implemented |

**Summary:** Helper data exists in helpers.json. SaveManager can unlock/equip them. But GameScene doesn't check equipped helpers or apply their effects.

---

## SCORING

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Score per phrase | ✓ | ✅ Done | Basic score calc |
| Combo bonus | ✓ | ✅ Done | - |
| Overdrive (20-streak) | ✓ | ✅ Done | - |
| Two tracks (progression vs mastery) | ✓ | 🔴 Missing | Only one score |
| Helper penalty multiplier | ✓ | 🔴 Missing | No penalties |
| Adaptive baseline (WPM) | ✓ | 🔴 Missing | No baseline measurement |

---

## THE PIT

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Separate screen from hub | ✓ | ✅ Done | PitScene exists |
| Stores all wrong letters | ✓ | ✅ Done | SaveManager.failedLetters |
| The Bale on loss | ✓ | ✅ Done | compressIntoBale animation |
| Never shrinks | ✓ | ✅ Done | - |
| Visual pile (3pt font) | ✓ | 🔴 Missing | Shows stats, not visual |
| Scrap spending UI | ✓ | 🔴 Missing | No shop in Pit |

---

## BREAK ROOM HUB

| Fixture | Design | Status | Gap |
|---------|--------|--------|-----|
| Chair (start run) | ✓ | ✅ Done | - |
| Crack (Pit access) | ✓ | ✅ Done | - |
| Fridge (scoreboard) | Unlock @ 2ch | 🟡 Placeholder | Modal only |
| Bulletin (mutators) | Unlock @ 4ch | 🟡 Placeholder | Modal only |
| Microwave (quick play) | Unlock @ 6ch | 🟡 Placeholder | Modal only |
| Locker (loadout) | Unlock @ 8ch | 🟡 Placeholder | Modal only |
| Time Clock (daily) | Unlock @ story | 🟡 Placeholder | Modal only |
| Window (endless) | Unlock @ story | 🟡 Placeholder | Modal only |
| Environmental lore | ✓ | 🔴 Missing | No lore text |

---

## MUTATORS

| Mutator | Bonus | Status |
|---------|-------|--------|
| Foggy Lens | +20% | 🔴 Not implemented |
| Crumbling Type | +30% | 🔴 Not implemented |
| No Theme | +50% | 🔴 Not implemented |
| Mirror Shift | +25% | 🔴 Not implemented |
| Heavy Ink | +40% | 🔴 Not implemented |
| Sticky Keys | +35% | 🔴 Not implemented |

---

## VISUAL THEME

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Terry Gilliam / Victorian industrial | ✓ | 🔴 Missing | Terminal green placeholder |
| Charcoal/rust/brass palette | ✓ | 🔴 Missing | Using neon green |
| Factory floor setting | ✓ | 🔴 Missing | Abstract background |
| Crusher artwork | ✓ | 🔴 Missing | Gray rectangle |
| Letter block artwork | ✓ | 🔴 Missing | Simple rectangles |
| Steam/spark VFX | ✓ | 🔴 Missing | Basic particles |

---

## AUDIO

| Feature | Design | Status | Gap |
|---------|--------|--------|-----|
| Correct letter (rising pitch) | ✓ | 🔴 Missing | No audio |
| Error (metallic clang) | ✓ | 🔴 Missing | No audio |
| Word complete fanfare | ✓ | 🔴 Missing | No audio |
| Overdrive activation | ✓ | 🔴 Missing | No audio |
| Industrial ambient | ✓ | 🔴 Missing | No audio |

---

## PRIORITY SUMMARY

### 🔴 Bugs to Fix
1. Double-counting scrap on chapter failure (CampaignManager.calculateFailureScrap)

### 🟡 Core Gaps (needed for MVP feel)
1. **Helpers not functional** - Data exists, effects don't
2. **No scrap spending UI** - Pit shows stats but no shop
3. **No visual feedback** - Can't see scrap earned
4. **No audio** - Silent game

### 📋 Future Features (designed but not started)
1. Mutator system
2. Achievement system
3. Visual theme overhaul
4. Mastery scoring track
5. Break Room fixture functionality

---

---

## PLAYTEST NOTES (2026-01-08)

### Difficulty
**Bryan's feedback:** Game feels too easy right now with 4-error awakening threshold. Theme + Tag almost give it away.

**BUT:** This is intentional/good because:
- He knows the words and is good at guessing (not representative)
- Current difficulty feels right for kids/casual players (daughter, wife)
- Easier to tune UP than down
- Matches design goal: "A 6-year-old should be able to finish with enough helpers"

**Don't change difficulty yet.** The Expert mode (1 error = immediate motion) and naked runs (no helpers) exist for skilled players. Tune after more diverse playtesting.

### The Pit - Design Direction
**What's working:**
- Watching letters fall is satisfying
- Mistakes piling up feels good (core emotional hook)
- Letter frequency display is interesting

**Issues to address:**
- Left-side letter count hard to read at different resolutions/mobile
- May need separate detail screen, with just overall count + highlights on main view

**Future ideas (cosmetic purchases):**
- **Yeeters** - Mechanisms that fling letters around the pit
- **Treadmill upgrades** - Change how letters spread/distribute
- **Visual upgrades** - Fun cosmetic changes to the pit environment
- Could use a separate currency or scrap for Pit cosmetics
- Goal: Make watching the pit an idle/satisfying experience

---

## UI DESIGN SESSION (2026-01-09)

**Full spec saved to:** `docs/UI_SPEC.md`

### Key Decisions

| Topic | Decision |
|-------|----------|
| **Left Sidebar** | Chapter/Page progress (verbose) + Score only |
| **Right Sidebar** | Combo lights (glass indicator panel, pink→yellow→green) |
| **Score Philosophy** | "Whose Line" - flashy, meaningless, slot machine animation |
| **Removed from UI** | Pressure bar, status label, scrap, helpers during gameplay |
| **Error Count** | Keep, but as mechanical counter (machine aesthetic) |
| **Helpers** | Pause menu only, not during gameplay |
| **Core Principle** | Eyes on letters + crusher, nowhere else |

### Deferred Topics
- Scrap feedback system (needs separate 3-5 Q session)
- Score math formula details

---

## ACTIONABLE PLAN

### Bug Fix
1. Fix double-counting in CampaignManager.calculateFailureScrap()

### UI Implementation (per UI_SPEC.md)
2. Refactor UIScene for left/right sidebar zones
3. Chapter/Page verbose progress display
4. Score with slot machine animation
5. Remove pressure bar, status label from sidebar
6. Right sidebar combo light system (word progress bar + 3-column lights)

### Make Helpers Work
7. Add Theme/Tag display to GameScene (check SaveManager.isHelperEquipped)
8. Add Keep Highlight duration extension
9. Add First Letter Focus visual
10. Add First Word Glow visual

### Scrap UI
11. Error counter as mechanical element (not plain text)
12. Add spending UI to PitScene (list helpers, costs, unlock buttons)

### Stretch: Feel
13. Add basic audio (correct beep, error buzz)
14. Combo light audio feedback
