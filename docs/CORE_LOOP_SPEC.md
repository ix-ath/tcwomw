# CORE LOOP SPECIFICATION
## The Crushing Weight of My Words

**Version**: 0.2.0
**Status**: Approved for Implementation
**Date**: 2026-01-07

---

## The Game

**"The Crushing Weight of My Words"** - A psychological horror typing/word-guessing game where your mistakes literally crush you.

**Core Fantasy:** "I must be perfect. Every imperfection is shoved in my face."

**Emotional Peak:** The clutch recovery. Being an inch from crushing, then typing your way back. This feeling of ultimate relief is what makes the game compelling.

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

### Graduated Awakening ("Loosening Up")
Heavy thing needs multiple shoves to get moving:

| State | Trigger | Behavior |
|-------|---------|----------|
| **Dormant** | Game start | Stationary, no movement |
| **Stirring** | 1st mistake | Shove + short slide, then stops |
| **Loosening** | 2nd mistake | Shove + longer slide, then stops |
| **Awakened** | 3rd+ mistake | Continuous descent (adaptive speed) |

### Awakening Threshold by Difficulty
| Difficulty | Mistakes before continuous descent |
|------------|-----------------------------------|
| Easy | 4 |
| Medium | 3 |
| Hard | 2 |
| Expert | 1 (first mistake = immediate motion) |

### Adaptive Descent
Once awakened, each penalty weight on crusher accelerates descent speed.
- Creates snowball effect: mistakes compound the dread
- Correct inputs provide lift + brief pause (200ms relief)

**Perfect run** = crusher never moves = achievement badge

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

**Aesthetic:** Terry Gilliam / Monty Python collage-cutout style meets Victorian industrial horror.

**Setting:** Dimly lit factory floor. The player is a hopeless worker at a dangerous machine. One wrong keystroke and everything comes crashing down.

**Color Palette:**
- Deep shadows, soot-stained surfaces, charcoal grays
- Tarnished brass, dirty rust where light catches edges
- Harsh industrial light cutting through smoke
- NOT sepia, NOT terminal-green-on-black
- Think coal dust and machine grease

**Mood:** Dark, grungy, claustrophobic. A night shift that never ends. Destitute, oppressive, no escape.

**References:** Terry Gilliam animations, Victorian factory engravings, workhouse horror, Dickensian poverty, dangerous machinery, dimly lit foundries.

**Technical:**
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
| Upgrade balancing | How much do upgrades help? | Playtest |
| Early game sameness | Books 1-15 lack variety (no mutators/helpers yet) | Needs design |
| Theme+Tag balance | May be too easy once unlocked - test and tune | Playtest |
| Economy values | Scrap costs are placeholder - tune after loop is solid | Playtest |

---

## Campaign Structure & Game Flow

**Design Session:** 2026-01-07

### Philosophy

**Roguelike structure with grind elements.** Each run is a book. Failure has consequences (restart chapter) but funds progression (cube scrap). Both success and failure have value.

**You type the story.** The words/phrases/sentences the player types ARE the narrative. No cutscenes—the story unfolds through what you're asked to type.

**Difficulty and helpers scale together.** Early game is simple words with no helpers. Late game is full sentences, but you have a full toolkit. You need the upgrades to handle harder content.

**Accessibility over gatekeeping.** All helpers can be equipped. A 6-year-old should be able to finish the campaign by unlocking enough helpers. Score penalties exist for completionists, but don't block progress.

---

### Tutorial Flow

The tutorial teaches mechanics organically through gameplay:

| Step | Player Types | What Happens |
|------|--------------|--------------|
| 1 | "ON" | Machine powers up. Simple success. Teaches basic input. |
| 2 | "START" | Machine starts. Simple success. Reinforces input. |
| 3 | "OOPS" (shown as OOSP) | Crusher activates. Player types O, O correctly. Types S, fails (expected P). Letter highlights. Types P. **Teaches wrong-position mechanic.** |
| 4 | Impossible sentence | No Theme or Tag available. Player will fail. Earns first cube scrap. Pit fills. **Teaches failure has value.** |
| 5 | Pit screen | "Your failures have value. Spend 1 cube scrap to unlock THEME." |
| 6 | Same sentence (Theme enabled) | Player completes it. **Full economy loop taught.** |

**Achievement edge case:** If player somehow guesses the impossible sentence, award 1 scrap anyway ("Figured Out the Impossible"). They can still buy Theme and experience the Pit.

---

### Campaign Structure: Stories, Chapters & Pages

**Target scope:** 1-2 hour campaign, $2.99-$8.99 price point.

**Hierarchy:**
- **Campaign** = The main story (~8-10 chapters)
- **Story/Book** = A complete narrative arc (main campaign OR user-uploaded Workshop content)
- **Chapter** = A thematic unit with 5-10 pages + chapter boss
- **Page** = A single word/phrase/sentence to complete

**Boss structure:**
- **Chapter Boss:** Challenging word/phrase at end of each chapter
- **Story Boss:** Final boss at end of last chapter (hardest content in that story)

**Loss behavior:**
- Lose a page = restart that chapter (lose ~30 sec to 2 min of progress)
- Do NOT lose the whole story
- Early chapters: short, quick retry
- Later chapters: longer, higher stakes

**Content progression:**

| Phase | Chapters | Content Type | Pages per Chapter |
|-------|----------|--------------|-------------------|
| **Learning** | 1-2 | Single words (4-6 letters) | 5 pages, ~30 sec |
| **Growing** | 3-5 | Longer words, 2-word phrases | 6-8 pages, ~1 min |
| **Challenging** | 6-8 | Phrases, 3-5 words | 8-10 pages, ~1.5 min |
| **Mastery** | 9-10 | Full sentences, story beats | 10+ pages, ~2 min |
| **Endgame** | Workshop | Paragraphs (split into half-lines) | Variable |

**Chapter structure:**
- Warmup: 1-2 easy pages (get in rhythm)
- Core: 3-6 themed pages (the meat)
- Chapter Boss: 1 challenging page (climax)

**Workshop:** Users can upload their own Stories (books) for others to play.

---

### The Typed Story

The words themselves ARE the narrative. Page curation is critical.

**Example progression:**

| Chapter | Sample Pages | Narrative Beat |
|---------|--------------|----------------|
| 1 | "HELLO" → "WORKER" → "NEW" → "SHIFT" → "BEGINS" | Player arrives |
| 4 | "THE MACHINE HUMS" → "FEED IT WORDS" → "IT IS HUNGRY" | Machine awakens |
| 7 | "OTHERS CAME BEFORE" → "THEIR WORDS FILL THE PIT" → "YOU ARE NOT THE FIRST" | Dread builds |
| 10 | Full sentences revealing the ending + Story Boss | Resolution |

**AI-assisted writing:** Story content will be generated with AI assistance, then curated for pacing and theming.

---

### Cube Scrap Economy

**Currency name:** Cube Scrap (fits factory/industrial theme)

**Sources:**

| Source | Scrap Earned |
|--------|--------------|
| Wrong letter | 1 |
| Lost chapter (bale created) | 5-10 |
| Book completion bonus | Based on performance |
| Achievements | One-time bonuses |
| Optional mutator challenges | Bonus % |

**Sinks:**

| Unlock | Scrap Cost | Effect |
|--------|------------|--------|
| Theme | 1 (tutorial) | Shows word category |
| Tag | 5 | Shows first tag hint |
| Keep Highlight I | 10 | Wrong-position glow lasts longer |
| Keep Highlight II | 25 | Even longer |
| Heavy Letters | 50 | Certain letters pause crusher |
| First Word Glow | 75 | All letters of first word glow blue |
| First Letter Focus | 100 | First letter slightly larger |
| Later upgrades | 100-500 | Increasingly powerful |

**Economy philosophy:**
- Early upgrades cheap → fast early progression
- Later upgrades expensive → requires grinding or intentional failure
- All upgrades equippable simultaneously (accessibility)
- Score penalties for using many helpers (completionist challenge)

---

### Upgrade Framework

**Style:** Balatro-inspired—impactful and fun, not +5% stat boosts.

**Categories:**

| Category | Examples |
|----------|----------|
| **Vision** | Theme, Tag, First Letter Focus, First Word Glow |
| **Timing** | Keep Highlight I/II/III, Heavy Letters (pause crusher) |
| **Forgiveness** | Second Chance (one free mistake per chapter) |
| **Endgame/Idle** | Auto-type assists, full automation (unlocked very late) |

**Loadout:** No limits. Equip everything you've unlocked. Score multiplier decreases with more helpers active.

**Ultimate form:** Player can eventually unlock enough automation to idle through content. Satisfies the "endless grind" desire while keeping core game intact for purists.

---

### Mutators (Challenge Modifiers)

**Unlocked through progression.** Not available at start.

**Purpose:** Add variety and replayability. Optional challenge for bonus scrap.

| Mutator | Effect | Scrap Bonus |
|---------|--------|-------------|
| Foggy Lens | Letters briefly obscure every few seconds | +20% |
| Crumbling Type | Letters fall off board over time | +30% |
| No Theme | Theme hint disabled | +50% |
| Mirror Shift | Board flips halfway through | +25% |
| Heavy Ink | Some letters take 2 presses | +40% |
| Sticky Keys | Wrong guesses lock input for 0.5s | +35% |

**Stacking:** Later books may have 2-3 mutators active for significant challenge.

---

### Break Room Hub (Expanded)

**Aesthetic:** Depressing workplace break room. Grimy, fluorescent-lit, sad.

**Fixture unlock progression:**

| Fixture | Unlock Condition | Function |
|---------|------------------|----------|
| Chair | Start | Sit to start a run |
| Crack in tile | Start | Access The Pit, spend scrap |
| Fridge | 2 chapters complete | Scoreboard, stats, leaderboards |
| Bulletin Board | 4 chapters complete | View unlocked mutators |
| Microwave | 6 chapters complete | Quick play (random chapter) |
| Locker | 8 chapters complete | Upgrade loadout customization |
| Time Clock | Complete main story | Daily challenge access |
| Window | Complete main story | Endless mode? Story ending? |

**Lore integration:** Each fixture reveals environmental storytelling when unlocked. Notes from previous workers. The clock frozen at a specific time. Old lunches in the fridge with names on them.

---

### Scoring Philosophy

**Two tracks:**

1. **Progression score:** Lets everyone finish. Helpers reduce this but don't block progress.
2. **Mastery score:** For completionists. Penalized by helper usage.

**Mastery penalties (example):**

| Helpers Active | Score Multiplier |
|----------------|------------------|
| 0 (naked run) | 1.5x |
| 1-2 | 1.0x |
| 3-5 | 0.8x |
| 6+ | 0.5x |

**Achievements for naked runs:** "Perfect Shift" = complete book with no helpers, no mistakes.

---

### Price Point & Scope

| Target | Hours | Price |
|--------|-------|-------|
| MVP | 1-2 hours | $2.99 |
| Full | 2-4 hours | $4.99-$8.99 |

**Replayability extends value:**
- Mutator challenges
- Score chasing
- Naked runs
- Endless mode
- Workshop content (post-launch)
