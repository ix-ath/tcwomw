# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"The Crushing Weight of My Words" is a psychological horror word-guessing game built with Phaser 3 and TypeScript. Players guess unknown words/phrases (Hangman-style) while a "Crusher" threatens from above. The game targets Steam deployment via Electron.

**Core Fantasy:** "Overwhelming sense of 'I must be perfect' - every imperfection shoved in player's face. Mistakes literally crush you."

**Emotional Peak:** The clutch recovery - being an inch from crushing, then typing your way back to safety. This ultimate relief is the game's hook.

## Core Loop Design

**See `docs/CORE_LOOP_SPEC.md` for full specification.**

### Game Mechanics (Hangman-style)
- Player sees: scrambled letters on board + blank spaces at bottom + theme hint
- Letters on board are EXACT MATCH of phrase letters (no extras)
- Player guesses letters sequentially to fill blanks
- Correct: letter disappears from board → appears in blank → crusher lifts
- Wrong: letter appears ABOVE crusher as weight → falls onto crusher → instant drop

### Crusher State Machine (Graduated Awakening)
Heavy thing needs multiple shoves to get moving:
- **DORMANT**: Crusher starts still. No movement until first mistake. Perfect run = crusher never moves.
- **STIRRING**: 1st mistake - small shove + short slide, then stops.
- **LOOSENING**: 2nd mistake - bigger shove + longer slide, then stops.
- **AWAKENED**: 3rd+ mistake (varies by difficulty) - continuous descent begins.

Correct inputs lift + pause (200ms relief). Each penalty weight accelerates descent (adaptive snowball).

### Visual Feedback
- **Wrong (not in word)**: Screen shake, red flash, penalty letter animates from staging area
- **Wrong (valid but wrong position)**: Same as above + highlights matching letter on board (yellow glow, 1 sec)
- **Correct**: Lift, brief pause, particles, letter vanishes

### Layout Zones (see `LAYOUT` in constants.ts)
- Staging area (top): Where error letters appear before falling
- Left sidebar: Score, pressure bar, status (DORMANT/DESCENDING/CRITICAL/OVERDRIVE), mods
- Center game area: Crusher, scattered letters, fail zone
- Bottom: Blank display + theme label

### Word Data System
Words are stored in JSON files at `src/data/words/`:
```json
{
  "text": "APPLE",
  "theme": "FOOD",
  "tags": ["fruit", "red", "crunch"],
  "difficulty": "EASY",
  "audience": "KIDS 5+",
  "hints": ["Keeps the doctor away"]
}
```
- **theme**: Category shown to player
- **tags**: First tag shown as hint (e.g., "FOOD • fruit")
- **difficulty**: EASY | MEDIUM | HARD | EXPERT
- **audience**: Age range for future filtering
- **hints**: Optional hint phrases for hint system

### Campaign Structure

**See `docs/CORE_LOOP_SPEC.md` "Campaign Structure & Game Flow" section for full details.**

**Hierarchy:** Story → Chapter → Page
- **Story/Book**: Complete narrative arc (~8-10 chapters). Main campaign or Workshop uploads.
- **Chapter**: Thematic unit with 5-10 pages + chapter boss
- **Page**: Single word/phrase/sentence to complete

**Bosses:** Chapter boss at end of each chapter. Story boss at end of final chapter.
**Loss:** Restart current chapter (not entire story)
**Workshop:** Users can upload their own Stories for others to play.
**Tutorial:** ON → START → OOPS (teaches mechanics) → Impossible sentence (teaches economy)

### Cube Scrap Economy

- **Currency**: Cube Scrap (earned from failures)
- **Sources**: 1 scrap per wrong letter, 5-10 per lost chapter, book completion bonuses
- **Sinks**: Helpers/upgrades (Theme, Tag, Keep Highlight, Heavy Letters, etc.)
- **The Pit**: Permanent monument to failures, lifetime count is spendable
- **Philosophy**: All helpers equippable (accessibility), score penalty for using many (mastery)

### Helper Design Decisions

Helpers must provide real value. The following were considered and **rejected**:
- **Auto-Punctuation**: Rejected - punctuation already auto-fills by default (player only types alphanumeric)
- **Breather**: Rejected - crusher starts DORMANT, so a pause at game start is useless
- **Word Preview**: Rejected - letters aren't "scrambled" in a sequence, they're spatially scattered on a board

Current helpers in `src/data/helpers.json`:
- **VISION**: Theme, Tag, First Word Glow, First Letter Focus
- **TIMING**: Keep Highlight I/II/III (tiered), Heavy Letters
- **FORGIVENESS**: Second Chance

### Break Room Hub

Depressing workplace break room. Fixtures unlock with book completions:
- Chair (start), Crack in tile (Pit access), Fridge (scoreboard), Locker (loadouts), etc.

## Git Config

This repo uses personal credentials:
- **Name:** Bryan W
- **Email:** bw@pixeltools.us

If commits show wrong author, run:
```bash
git config user.name "Bryan W"
git config user.email "bw@pixeltools.us"
```

## Commands

```bash
# Development
npm run dev              # Vite dev server at localhost:3000 (hot reload)
npm run typecheck        # TypeScript validation
npm run lint             # ESLint

# Production
npm run build            # Build web version to /dist
npm run preview          # Preview production build

# Electron (Steam)
npm run electron:dev     # Dev with Electron wrapper
npm run electron:build   # Package for distribution
```

## Architecture

### Scene Flow
```
BootScene → PreloadScene → MenuScene → BreakRoomScene → TutorialScene (first time)
                               │            │                │
                               ↓            ↓                ↓
                         SettingsScene  GameScene ←─────────┘
                               │       ↕ (parallel)
                               │      UIScene
                               │         │
                               │    ESC ───→ PauseScene (overlay)
                               │         │
                               ↓         ↓
                            MenuScene  ResultScene
                                         │
                                         ↓
                                   BreakRoomScene (loop)
```

- **BreakRoomScene**: Hub with clickable fixtures and keyboard navigation. Checks tutorial completion.
- **TutorialScene**: Scripted tutorial using ScriptedEvent framework.
- **PauseScene**: Overlay launched via ESC during gameplay. Resume/Restart/Settings/Quit options.
- **SettingsScene**: Full settings menu accessible from MenuScene and PauseScene. Visual/Audio/Controls/Gameplay tabs with descriptions.
- **GameScene** and **UIScene** run in parallel during gameplay. Scenes communicate via:
- **Registry**: Shared state (progress, config, selectedDifficulty)
- **Events**: Cross-scene events via `scene.events` using `GameEvents` enum
- **Data**: Passed via `scene.start(key, data)`

### Core Files

- `src/constants.ts` - All tunable game values (speeds, lift amounts, colors, timing). Adjust these to change game feel.
- `src/types.ts` - TypeScript interfaces, enums (`Difficulty`, `GameEvents`, `WordTier`), campaign types, economy types.
- `src/main.ts` - Phaser config with Matter.js physics enabled. Exposes `window.game` in dev mode.
- `src/scenes/PauseScene.ts` - Pause overlay with Resume/Restart/Quit. Launched via ESC from GameScene.

### Key Systems

- `src/systems/SaveManager.ts` - LocalStorage persistence singleton. Handles economy (scrap), helpers (unlock/equip), progress tracking, stats.
- `src/systems/SettingsManager.ts` - User preferences persistence (separate from save data). Handles visual, audio, controls, and gameplay settings.
- `src/systems/ScriptedEvent.ts` - Data-driven framework for scripted sequences (tutorials, cutscenes, story beats). Step types: `dialogue`, `page`, `wait`, `award`, `overlay`, `branch`, `goto`, `end`.

### Data Files

- `src/data/stories/` - Campaign JSON files. Each story is its own file (Workshop-ready).
- `src/data/helpers.json` - Helper definitions with costs, prerequisites, and tiers.
- `src/data/scripts/` - Scripted event definitions (tutorial.json, etc.).

### Event-Driven Architecture

Systems are decoupled via the `GameEvents` enum. The pattern:
1. Input triggers event (e.g., `CORRECT_LETTER`)
2. Multiple systems respond independently (combo, crusher, audio, UI)
3. Systems emit their own events for cascading effects

Key events: `CORRECT_LETTER`, `WRONG_LETTER`, `WORD_COMPLETE`, `CRUSHER_LIFT`, `CRUSHER_DROP`, `COMBO_INCREMENT`, `KINETIC_PULSE`

### Path Aliases

Configured in vite.config.ts:
- `@` → `src/`
- `@scenes` → `src/scenes/`
- `@systems` → `src/systems/`
- `@entities` → `src/entities/`
- `@ui` → `src/ui/`
- `@utils` → `src/utils/`

### Input Mechanics

Located in `GameScene.processInput()`:
- Sequential letter guessing (typedIndex tracks position in phrase)
- Auto-completion for spaces/punctuation (player only types alphanumeric)
- Valid-but-wrong-position detection highlights letter on board
- Combo system with overdrive trigger at 20 correct letters
- Crusher state machine: DORMANT → AWAKENED on first mistake
- Lift/drop/pause calculations use constants from `CRUSHER` object

### Keyboard Controls

All menu scenes support both arrow keys and WASD for navigation:

| Scene | Controls |
|-------|----------|
| MenuScene | W/S/Up/Down to navigate, Enter/Space to confirm |
| SettingsScene | Tab/Q/E to switch tabs, W/S to select item, A/D to adjust, ESC to back |
| BreakRoomScene | Arrows/WASD to select fixture, Enter/Space to interact, ESC for menu |
| GameScene | Type letters to play (or click in mouse-only mode), ESC/Pause key to pause, R to restart, M to mute |
| PauseScene | W/S/Up/Down to navigate, Enter/Space to confirm, ESC to resume |
| ResultScene | Space/Enter to continue, ESC for menu |

Footer hints are displayed at the bottom of each scene showing available controls.

### Physics System

Letters are Matter.js bodies that get pushed by the descending crusher:
- `createLetterBodies()` spawns physics-enabled letter blocks
- `createBoundaries()` creates invisible walls and floor to contain letters
- `syncLetterVisuals()` keeps container visuals aligned with physics bodies
- Rotation is constrained to ±15° for readability
- Penalty letters spawn on errors with 3x mass (red blocks)
- On loss, `compressIntoBale()` animates letters compressing into "The Bale"

Key physics constants in `PHYSICS` object:
- `LETTER_BLOCK_SIZE`: 64px blocks
- `PENALTY_LETTER_MASS`: 3 (vs normal mass of 1)
- Floor/fail zone now uses `LAYOUT.FAIL_ZONE_Y` (560px)

## Visual Style Direction

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

See `docs/PROMPTS.md` for reusable AI art prompts.

## Designer Philosophy (Bryan's Preferences)

**Hidden Delights & Secrets:**
- Hidden achievements that reward exploration/curiosity
- Interesting interactables with no obvious purpose (Diablo's clickable diamond)
- Background elements that respond to interaction (birds fly away when clicked)
- Easter eggs and surprises that make players feel clever

**Achievements:**
- Comprehensive achievement system
- Mix of obvious and hidden achievements
- Achievements that encourage different playstyles
- "Figured Out the Impossible" already planned for tutorial edge case

**Accessibility & QOL (High Priority):**
- Goal: Make the game playable by everyone without gatekeeping
- Tooltips everywhere
- Hotkey support and rebinding
- Settings menu with comprehensive options

**Settings Menu Spec (✅ Implemented):**

| Category | Setting | Status |
|----------|---------|--------|
| **Visual** | Colorblind modes (Protanopia, Deuteranopia, Tritanopia) | ✅ CSS filter |
| **Visual** | Font scaling (Small/Medium/Large) | ✅ UI only |
| **Visual** | Screen shake toggle | ✅ Default ON |
| **Audio** | Music volume | ✅ Slider (ready for audio system) |
| **Audio** | SFX volume | ✅ Slider |
| **Audio** | UI sounds volume | ✅ Slider |
| **Audio** | Mute all | ✅ Toggle |
| **Controls** | Key rebinding (Pause/Restart/Mute) | ✅ Configurable |
| **Controls** | Mouse-only mode | ✅ Click letters for tablet play |
| **Gameplay** | Show letter order | ✅ Debug assist, highlights next letter |

Settings persist to LocalStorage separately from save data (survives save resets).
Access via SETTINGS button in MenuScene, or import `SettingsManager` singleton.

*Note: Most gameplay assists (slower crusher, hints, etc.) will be in-game Helpers/Modifiers, not settings. Settings are for accessibility/preference, not difficulty cheats.*

**Future Planning Sessions Needed:**
- [ ] Achievement system design
- [ ] Hidden interactables placement (Break Room secrets, clickable background elements)
- [ ] "Balloon Pop" kids mode - letters are balloons, click/tap to pop them. Different theme, same mechanics. (Bryan's daughter loves popping!)

*Bryan notes: "I know what I need but need guidance to verbalize it" - use design sessions to help articulate these requirements.*

## Design Reference

Detailed specifications in `/docs/`:
- `CORE_LOOP_SPEC.md` - **Primary reference** for core gameplay mechanics (from design session)
- `GAME_DESIGN.md` - Core mechanics, combo system, progression
- `ARCHITECTURE.md` - Technical systems, data schemas
- `FEATURES.md` - Feature backlog with status markers
- `PROMPTS.md` - Reusable AI prompts for art, assets, content
