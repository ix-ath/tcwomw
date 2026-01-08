# FEATURE BACKLOG
## The Crushing Weight of My Words

Status Legend:
- ✅ Complete
- 🚧 In Progress
- 📋 Planned
- 💭 Idea (needs design)

---

## PHASE 1: CORE LOOP

### Input & Validation
- [✅] FB.01: Sequential index validator
- [✅] FB.02: Flow auto-fill (punctuation/space bypass)
- [📋] FB.03: Maintenance phase diagnostic (WPM baseline)
- [💭] FB.03a: Sandbagging prevention

### The Crusher
- [✅] FB.10: Constant velocity descent controller
- [✅] FB.11: Marginal lift logic (correct input)
- [✅] FB.12: Penalty drop on error (visual only)
- [📋] FB.12a: Penalty letter spawner (physics)
- [✅] FB.13: Overdrive/Kinetic pulse (20-streak)
- [📋] FB.13a: Pneumatic vent (10% reset + shockwave)

### Visual Feedback
- [✅] FB.20: Letter pool display (scattered letters)
- [✅] FB.21: Letter proximity highlighting
- [✅] FB.22: Target display (word boxes)
- [✅] FB.23: Particle system (correct/error)
- [✅] FB.24: Screen shake on error
- [✅] FB.25: Combo display

### Game Flow
- [✅] FB.30: Menu scene with difficulty selection
- [✅] FB.31: Game scene with full loop
- [✅] FB.32: Result scene (win/lose)
- [✅] FB.33: Stage progression
- [✅] FB.34: Career score tracking

---

## PHASE 2: PHYSICS ENHANCEMENT

### Coin-Pusher Mechanics
- [📋] FB.40: Matter.js letter bodies
- [📋] FB.41: Letter collision and piling
- [📋] FB.42: Crusher as physics body
- [📋] FB.43: Penalty letter spawning (3x mass)
- [📋] FB.44: Readability guard (±15° constraint)
- [📋] FB.45: Clearance blast physics (shockwave)

### The Pit of Failure
- [📋] FB.50: Pit visual zone
- [📋] FB.51: Letter fall into pit on error
- [📋] FB.52: Static batching for pit letters
- [📋] FB.53: 3pt font rendering
- [📋] FB.54: The Bale (trash cube on loss)
- [📋] FB.55: Persistent pit state across sessions

---

## PHASE 3: CAMPAIGN & PROGRESSION

### Tutorial System
- [📋] FB.60: Tutorial scene (ON → START → OOPS sequence)
- [📋] FB.61: OOPS scramble mechanic (teaches wrong-position)
- [📋] FB.62: Impossible sentence (forces first failure)
- [📋] FB.63: Pit introduction screen
- [📋] FB.64: Theme unlock purchase (1 scrap)
- [📋] FB.65: "Figured Out the Impossible" achievement

### Campaign Structure
- [📋] FB.70: Book/Chapter data structure
- [📋] FB.71: Chapter progression (5-10 items per chapter)
- [📋] FB.72: Book progression (~40 books total)
- [📋] FB.73: Loss = restart chapter (not book)
- [📋] FB.74: Content scaling (words → phrases → sentences)
- [📋] FB.75: Boss word/sentence per chapter
- [💭] FB.76: Paragraph mode (split into half-lines)

### Cube Scrap Economy
- [📋] FB.80: Cube Scrap currency system
- [📋] FB.81: Scrap earned on wrong letter (1 each)
- [📋] FB.82: Scrap earned on chapter loss (5-10)
- [📋] FB.83: Book completion bonuses
- [📋] FB.84: Scrap display in HUD
- [📋] FB.85: Scrap spending UI (in Pit)

### Helper/Upgrade System
- [📋] FB.90: Theme unlock (1 scrap)
- [📋] FB.91: Tag unlock (5 scrap)
- [📋] FB.92: Keep Highlight I/II/III (10/25/50 scrap)
- [📋] FB.93: Heavy Letters upgrade (50 scrap)
- [📋] FB.94: First Word Glow (75 scrap)
- [📋] FB.95: First Letter Focus (100 scrap)
- [📋] FB.96: Helper loadout (all equippable)
- [📋] FB.97: Score multiplier penalty for helpers
- [💭] FB.98: Endgame auto-type assists
- [💭] FB.99: Full automation (idle mode)

### Break Room Hub
- [📋] FB.100: Break Room scene
- [📋] FB.101: Chair fixture (start runs)
- [📋] FB.102: Crack in tile (Pit access)
- [📋] FB.103: Fridge (scoreboard) - unlock at 5 books
- [📋] FB.104: Bulletin Board (mutators) - unlock at 10 books
- [📋] FB.105: Microwave (quick play) - unlock at 15 books
- [📋] FB.106: Locker (loadout) - unlock at 20 books
- [📋] FB.107: Time Clock (daily challenge) - unlock at 30 books
- [📋] FB.108: Window (endless/ending) - unlock at 40 books
- [💭] FB.109: Environmental lore per fixture

### Mutator System
- [📋] FB.110: Mutator unlock progression
- [📋] FB.111: Foggy Lens mutator (+20% scrap)
- [📋] FB.112: Crumbling Type mutator (+30% scrap)
- [📋] FB.113: No Theme mutator (+50% scrap)
- [📋] FB.114: Mirror Shift mutator (+25% scrap)
- [📋] FB.115: Heavy Ink mutator (+40% scrap)
- [📋] FB.116: Sticky Keys mutator (+35% scrap)
- [📋] FB.117: Mutator stacking (late game)

---

## PHASE 4: AUDIO

### Sound Effects
- [📋] FB.100: Correct letter sound (pitch escalation)
- [📋] FB.101: Error sound (metallic clang)
- [📋] FB.102: Word complete fanfare
- [📋] FB.103: Overdrive activation
- [📋] FB.104: Crusher impact sounds
- [📋] FB.105: UI feedback sounds

### Music
- [📋] FB.110: Ambient industrial loop
- [📋] FB.111: Tension escalation layer
- [📋] FB.112: Victory music
- [📋] FB.113: Loss music
- [💭] FB.114: Breakroom ambient

### Audio System
- [📋] FB.120: Procedural audio generation
- [📋] FB.121: Pitch scaling system
- [📋] FB.122: Volume mixing
- [📋] FB.123: Mute controls

---

## PHASE 5: POLISH & ACCESSIBILITY

### Visual Polish
- [📋] FB.130: Machine sprite states
- [📋] FB.131: Steam VFX
- [📋] FB.132: Spark VFX
- [📋] FB.133: Gear animations
- [📋] FB.134: CRT shader effects
- [📋] FB.135: Background parallax

### Accessibility
- [📋] FB.140: Motor skill calibration
- [📋] FB.141: Adaptive scoring toggle
- [📋] FB.142: High contrast mode
- [📋] FB.143: Reduced motion mode
- [📋] FB.144: Colorblind palettes
- [📋] FB.145: Screen reader support

### Quality of Life
- [📋] FB.150: Settings menu
- [📋] FB.151: Key rebinding
- [📋] FB.152: Save/load system
- [📋] FB.153: Statistics tracking
- [📋] FB.154: Pause menu

---

## PHASE 6: PLATFORM & RELEASE

### Steam Integration
- [📋] FB.160: Electron wrapper
- [📋] FB.161: Steam SDK integration
- [📋] FB.162: Achievements
- [📋] FB.163: Leaderboards
- [📋] FB.164: Cloud saves
- [📋] FB.165: Trading cards (if approved)

### Store Presence
- [📋] FB.170: Store page assets
- [📋] FB.171: Trailer video
- [📋] FB.172: Screenshots
- [📋] FB.173: Capsule images
- [📋] FB.174: Description copy

---

## FUTURE / POST-LAUNCH

### Content Expansion
- [💭] FB.200: Public domain literature mode
- [💭] FB.201: Steam Workshop support
- [💭] FB.202: Custom phrase imports
- [💭] FB.203: Daily challenges
- [💭] FB.204: Endless mode

### Multiplayer (Maybe)
- [💭] FB.210: Ghost racing
- [💭] FB.211: Versus mode
- [💭] FB.212: Co-op typing

---

## KNOWN HOLES (Design Decisions Needed)

| ID | Topic | Question | Status |
|----|-------|----------|--------|
| HOLE.01 | Punctuation | How to handle leading/trailing punctuation? | Open |
| HOLE.02 | Sandbagging | How to detect/prevent baseline manipulation? | Open |
| HOLE.03 | Penalty Persistence | How long do penalty letters stay on board? | Open |
| HOLE.04 | Shockwave Physics | Radial vs. linear force for clearance blast? | Open |
| HOLE.05 | Scrap Ratio | What's the error → scrap conversion rate? | **Resolved:** 1 scrap per wrong letter, 5-10 per lost chapter |
| HOLE.06 | Buffer Reset | Clear board or keep rubble on buffer use? | Open |
| HOLE.07 | Tier Progression | Linear unlock path or branching tree? | **Resolved:** Linear books, all helpers equippable |
| HOLE.08 | Loss Scope | Restart word, chapter, or book on loss? | **Resolved:** Restart chapter only |
| HOLE.09 | Helper Limits | Loadout restrictions? | **Resolved:** No limits, score penalty instead |
