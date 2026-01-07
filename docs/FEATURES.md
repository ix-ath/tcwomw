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

## PHASE 3: ECONOMY & PROGRESSION

### Scrap Economy
- [📋] FB.60: Scrap conversion system
- [📋] FB.61: Scrap display in HUD
- [📋] FB.62: Conversion ratio tuning
- [💭] FB.63: Scrap multipliers (streaks, etc.)

### Machine Repair
- [📋] FB.70: Repair tracking system (3 components)
- [📋] FB.71: Scrip shop UI
- [📋] FB.72: Component visual states (broken → polished)
- [📋] FB.73: Win condition check (100% all)
- [📋] FB.74: Breakroom unlock

### Hydraulic Buffers
- [📋] FB.80: Buffer system (extra lives)
- [📋] FB.81: 50% height reset on buffer use
- [💭] FB.82: Reset state (clear board vs. keep rubble)
- [📋] FB.83: Buffer purchase in shop

### Dictionary Tiers
- [📋] FB.90: Tier unlock system
- [📋] FB.91: Industrial word list
- [📋] FB.92: Scientific word list
- [📋] FB.93: Gothic word list
- [💭] FB.94: Progression path (linear vs. tree)

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

| ID | Topic | Question |
|----|-------|----------|
| HOLE.01 | Punctuation | How to handle leading/trailing punctuation? |
| HOLE.02 | Sandbagging | How to detect/prevent baseline manipulation? |
| HOLE.03 | Penalty Persistence | How long do penalty letters stay on board? |
| HOLE.04 | Shockwave Physics | Radial vs. linear force for clearance blast? |
| HOLE.05 | Scrap Ratio | What's the error → scrap conversion rate? |
| HOLE.06 | Buffer Reset | Clear board or keep rubble on buffer use? |
| HOLE.07 | Tier Progression | Linear unlock path or branching tree? |
