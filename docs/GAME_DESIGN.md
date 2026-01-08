# GAME DESIGN DOCUMENT
## The Crushing Weight of My Words

**Version**: 0.1.0  
**Status**: In Development

---

## 1. THE PILLARS

### The Weight of Language
Words have physical mass and friction. This isn't just a typing game—it's a physics simulation where your keystrokes have tangible consequences.

### Mechanical Integrity
The player's job is to repair a failing machine through linguistic precision. The industrial setting reinforces the weight and consequence of every action.

### The Inevitability of Failure
Mistakes are not just score penalties; they are physical entities (Scrap) that clutter the workspace. The game acknowledges that perfection is impossible—what matters is how you manage imperfection.

---

## 2. CORE GAMEPLAY LOOP

```
┌─────────────────────────────────────────────────────┐
│                    WORK ORDER                        │
│         (Phrase appears, Crusher descends)          │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │     TYPE LETTERS      │
            └───────────┬───────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
    ┌──────────┐               ┌──────────┐
    │ CORRECT  │               │  ERROR   │
    │  +Lift   │               │  +Drop   │
    │  +Combo  │               │  +Scrap  │
    │  +Score  │               │  -Combo  │
    └────┬─────┘               └────┬─────┘
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   PHRASE COMPLETE?  │
         └─────────┬───────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌─────────┐        ┌──────────┐
    │   WIN   │        │  CRUSHER │
    │ +Scrip  │        │ HIT ZONE │
    │ +Repair │        │  = LOSE  │
    └─────────┘        └──────────┘
```

---

## 3. THE CRUSHER (16-Ton Weight)

### Behavior
- **Persistent Descent**: Constant downward movement. Does not reset between words.
- **Speed Scaling**: Increases with stage and difficulty tier.

### Player Interactions
| Action | Effect |
|--------|--------|
| Correct Letter | Marginal upward lift |
| Error | Spawns penalty letter, drops crusher |
| Word Complete | 10% "Vent" lift + clearance shockwave |
| 20-Streak | Kinetic Battery: 25% pulse lift |

### Kill Zone
When the Crusher reaches 85% screen height, the player loses unless they have Hydraulic Buffers remaining.

---

## 4. THE LETTER BOARD

### Visual Design
Letters from the target phrase are scattered across the playing field in a grid pattern with random offsets and rotations (±15° max for readability).

### Physics (Future)
- Letters are physics-enabled bodies
- They pile and collide as the Crusher descends ("Coin-Pusher" mechanic)
- Penalty letters have 3x mass

### Letter States
1. **Inactive**: Scattered on board, waiting
2. **Near Crusher**: Highlighted (radioactive glow)
3. **Typed**: Fades out, appears in Result Bar
4. **Penalty**: Red, heavy, persists on board

---

## 5. COMBO / STREAK SYSTEM

### Mechanics
- Each correct letter increments combo
- Combo provides bonus lift per letter
- Any error resets combo to 0

### Overdrive (Kinetic Battery)
- Triggered at 20-streak
- Provides massive 25% vertical lift
- Visual: Screen flash, inverted colors
- Duration: 3 seconds of reversed crusher movement

### Audio Escalation
- Pitch increases with each correct letter
- Resets after 12 letters or on error
- Creates tension through audio feedback

---

## 6. PROGRESSION SYSTEM

### Campaign: Books & Chapters

**Structure:**
- **Campaign** = ~40 Books
- **Book** = 3-5 Chapters (thematic unit, micro-story)
- **Chapter** = 5-10 words/phrases/sentences

**Content scales with progression:**
- Books 1-5: Single words (4-6 letters)
- Books 6-15: Longer words, 2-word phrases
- Books 16-30: Phrases, 3-5 words
- Books 31-40: Full sentences, story beats

**Loss = restart chapter** (not entire book). Early chapters ~30 sec, later chapters ~2 min.

### Cube Scrap Economy

**Currency:** Cube Scrap (earned from failures)

| Source | Scrap |
|--------|-------|
| Wrong letter | 1 |
| Lost chapter | 5-10 |
| Book completion | Bonus |

**Spend on helpers:** Theme (1), Tag (5), Keep Highlight (10-25), Heavy Letters (50), etc.

### Helper Philosophy

**Accessibility first:** All helpers equippable simultaneously. A child can finish the campaign by unlocking enough helpers.

**Mastery track:** Score multiplier decreases with helper count. Naked runs = 1.5x multiplier.

### The Break Room Hub

Depressing workplace break room. Fixtures unlock with book completions:

| Fixture | Unlock | Function |
|---------|--------|----------|
| Chair | Start | Start a run |
| Crack in tile | Start | The Pit, spend scrap |
| Fridge | 5 books | Scoreboard |
| Locker | 20 books | Loadout |
| Window | 40 books | Endless mode |

See `CORE_LOOP_SPEC.md` for full campaign details.

---

## 7. FAILURE & THE PIT

### The Compaction (Loss State)
On loss, the Crusher performs a final stomp:
1. All loose letters fuse into a "Trash Cube" (The Bale)
2. The Bale falls into The Pit
3. Player restarts the current chapter (not the whole book)
4. Cube Scrap earned from all mistakes during the failed attempt

### The Pit of Failure
- Persistent visual vault (separate screen from Break Room)
- Stores every missed letter and Bale in career
- **Never shrinks** - permanent monument to all failures
- Lifetime count is spendable as Cube Scrap
- Uses 3pt font for massive scale (10,000+ letters)
- Static batching for performance

---

## 8. DIFFICULTY TIERS

| Tier | Content | Speed | Lift |
|------|---------|-------|------|
| 1 - Easy | Sight words (K) | 0.8x | 1.2x |
| 2 - Medium | Single industrial words | 1.0x | 1.0x |
| 3 - Hard | 2-3 word phrases | 1.3x | 0.9x |
| 4 - Expert | Full sentences (future) | 1.5x | 0.8x |

---

## 9. ADAPTIVE SCORING

### Personal Baseline
During the "Maintenance Phase" (tutorial), the game secretly measures player's WPM to establish a baseline.

### Relative Mastery
```
FinalScore = (SessionWPM / BaselineWPM) * BasePoints * AccuracyMultiplier
```

This ensures fairness—a 30 WPM player improving to 35 WPM is celebrated as much as a 90 WPM player hitting 95 WPM.

### Anti-Sandbagging
(Future) Detect intentionally poor baseline performance and adjust.

---

## 10. AUDIO-VISUAL IDENTITY

### Visual Aesthetic: "Monty Python Industrial"
- **Broken State**: Rust (#8b4513), Oxide Green (#4a5d23), Soot (#2b2b2b)
- **Fixed State**: Polished Brass (#b5a642), Mahogany (#420d09), Gold accents
- **Typography**: VT323 (terminal), JetBrains Mono (code)

### Audio Design
- **Dial Tone**: Rising pitch per correct letter
- **Fail Jolt**: Heavy metallic CLANG
- **Victory Chime**: Three-beat "Done-Done-Done"
- **Ambient**: Industrial hum, steam venting

### VFX
- Sparks from damaged machine nodes
- Continuous low-opacity steam venting
- Screen shake on errors
- Particle bursts on correct letters
