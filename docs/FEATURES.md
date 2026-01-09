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
- [✅] FB.40: Matter.js letter bodies
- [✅] FB.41: Letter collision and piling
- [✅] FB.42: Crusher as physics body (kinematic)
- [✅] FB.43: Penalty letter spawning (3x mass)
- [✅] FB.44: Readability guard (±15° constraint)
- [📋] FB.45: Clearance blast physics (shockwave)

### The Pit of Failure
- [✅] FB.50: Pit scene (PitScene.ts)
- [✅] FB.51: Letter frequency tracking (SaveManager.failedLetters)
- [📋] FB.52: Static batching for pit letters
- [📋] FB.53: 3pt font rendering (visual pile)
- [✅] FB.54: The Bale (compressIntoBale animation on loss)
- [✅] FB.55: Persistent pit state across sessions
- [💭] FB.56: Simplified mobile view (overall count + highlights vs full letter list)
- [💭] FB.57: Yeeters - purchasable mechanisms that fling letters
- [💭] FB.58: Treadmill upgrades - change letter distribution behavior
- [💭] FB.59: Pit cosmetics - visual upgrades for idle enjoyment

---

## PHASE 3: CAMPAIGN & PROGRESSION

### Tutorial System
- [✅] FB.60: Tutorial scene (ON → START → OOPS sequence)
- [✅] FB.61: OOPS scramble mechanic (teaches wrong-position)
- [✅] FB.62: Impossible sentence (forces first failure)
- [✅] FB.63: Pit introduction screen
- [✅] FB.64: Theme unlock purchase (1 scrap)
- [📋] FB.65: "Figured Out the Impossible" achievement

### Campaign Structure
- [✅] FB.70: Story/Chapter/Page data structure (CampaignManager.ts)
- [✅] FB.71: Chapter progression (5-12 pages per chapter)
- [✅] FB.72: Main campaign (10 chapters, 61 pages)
- [✅] FB.73: Loss = restart chapter (not story)
- [✅] FB.74: Content scaling (words → phrases → sentences)
- [✅] FB.75: Boss page per chapter (isBoss flag)
- [💭] FB.76: Paragraph mode (split into half-lines)

### Cube Scrap Economy
- [✅] FB.80: Cube Scrap currency system (SaveManager.ts)
- [✅] FB.81: Scrap earned on wrong letter (1 each)
- [✅] FB.82: Scrap earned on chapter loss (5-10 + errors)
- [🚧] FB.83: Chapter/Story completion bonuses (partial - see ECONOMY_ISSUES)
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
- [✅] FB.100: Break Room scene
- [✅] FB.101: Chair fixture (start runs)
- [✅] FB.102: Crack in tile (Pit access) - placeholder modal
- [✅] FB.103: Fridge (scoreboard) - placeholder modal, unlock at 2 chapters
- [✅] FB.104: Bulletin Board (mutators) - placeholder modal, unlock at 4 chapters
- [✅] FB.105: Microwave (quick play) - placeholder modal, unlock at 6 chapters
- [✅] FB.106: Locker (loadout) - placeholder modal, unlock at 8 chapters
- [✅] FB.107: Time Clock (daily challenge) - placeholder modal, unlock at story complete
- [✅] FB.108: Window (endless/ending) - placeholder modal, unlock at story complete
- [✅] FB.109: Keyboard navigation (arrows/WASD to select, Enter to interact)
- [💭] FB.110: Environmental lore per fixture

### Mutator System
- [📋] FB.120: Mutator unlock progression
- [📋] FB.121: Foggy Lens mutator (+20% scrap)
- [📋] FB.122: Crumbling Type mutator (+30% scrap)
- [📋] FB.123: No Theme mutator (+50% scrap)
- [📋] FB.124: Mirror Shift mutator (+25% scrap)
- [📋] FB.125: Heavy Ink mutator (+40% scrap)
- [📋] FB.126: Sticky Keys mutator (+35% scrap)
- [📋] FB.127: Mutator stacking (late game)

---

## PHASE 4: AUDIO

### Audio System (Framework Complete)
- [✅] FB.120: Procedural audio generation (Web Audio API fallbacks)
- [✅] FB.121: Pitch scaling system (combo-based)
- [✅] FB.122: Volume mixing (respects SettingsManager)
- [✅] FB.123: Mute controls (via SettingsManager)
- [✅] FB.124: Audio manifest system (src/data/audio-manifest.json)

### Sound Effects (Procedural Placeholders)
- [✅] FB.100: Correct letter sound (pitch escalation) - procedural blip
- [✅] FB.101: Error sound - procedural buzz
- [✅] FB.102: Victory fanfare - procedural 4-note
- [✅] FB.103: Overdrive activation - procedural powerup
- [🟡] FB.104: Crusher impact sounds - procedural thud (needs real asset)
- [📋] FB.105: UI feedback sounds - defined in manifest, not wired up

### Music
- [📋] FB.110: Ambient industrial loop
- [📋] FB.111: Tension escalation layer
- [📋] FB.112: Victory music
- [📋] FB.113: Loss music
- [💭] FB.114: Breakroom ambient

*Note: All sounds use procedural fallbacks. To add real assets, update paths in `src/data/audio-manifest.json`.*

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
- [✅] FB.144: Colorblind palettes (Protanopia, Deuteranopia, Tritanopia)
- [📋] FB.145: Screen reader support

### Quality of Life
- [✅] FB.150: Settings menu (Visual/Audio/Controls/Gameplay tabs)
- [✅] FB.151: Key rebinding (Pause key)
- [📋] FB.152: Save/load system
- [📋] FB.153: Statistics tracking
- [✅] FB.154: Pause menu (ESC in GameScene)
- [✅] FB.155: Keyboard navigation (WASD + arrows in all menus)
- [✅] FB.156: Consistent control hints (footer in each scene)
- [✅] FB.157: Mouse-only mode (click letters for tablet/accessibility)
- [✅] FB.158: Screen shake toggle
- [✅] FB.159: UI font scaling (Small/Medium/Large)
- [✅] FB.160a: Settings descriptions/tooltips for all options
- [✅] FB.160b: Settings access from PauseScene
- [✅] FB.160c: Visual feedback (toast notifications) for setting changes

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
| HOLE.10 | Economy Balance | See `docs/ECONOMY_ANALYSIS.md` | **In Progress:** Double-counting bug, missing story bonus |
| HOLE.11 | Skilled Player Scrap | Should perfect players unlock all helpers in one run? | Open |
| HOLE.12 | Achievement Scrap | Which achievements give scrap bonuses? | Open |
