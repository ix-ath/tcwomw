# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"The Crushing Weight of My Words" is a psychological horror word-guessing game built with Phaser 3 and TypeScript. Players guess unknown words/phrases (Hangman-style) while a "Crusher" threatens from above. The game targets Steam deployment via Electron.

**Core Fantasy:** "Overwhelming sense of 'I must be perfect' - every imperfection shoved in player's face. Mistakes literally crush you."

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

### Economy (Future)
- Wins unlock features
- Losses/letter misses accumulate in "The Pit" - used for helpers/boosts

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
BootScene → PreloadScene → MenuScene → GameScene ↔ UIScene
                              ↑               │
                              └─────── ResultScene
```

GameScene and UIScene run in parallel during gameplay. Scenes communicate via:
- **Registry**: Shared state (progress, config, selectedDifficulty)
- **Events**: Cross-scene events via `scene.events` using `GameEvents` enum
- **Data**: Passed via `scene.start(key, data)`

### Core Files

- `src/constants.ts` - All tunable game values (speeds, lift amounts, colors, timing). Adjust these to change game feel.
- `src/types.ts` - TypeScript interfaces, enums (`Difficulty`, `GameEvents`, `WordTier`), and event payload types.
- `src/main.ts` - Phaser config with Matter.js physics enabled. Exposes `window.game` in dev mode.

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

## Design Reference

Detailed specifications in `/docs/`:
- `CORE_LOOP_SPEC.md` - **Primary reference** for core gameplay mechanics (from design session)
- `GAME_DESIGN.md` - Core mechanics, combo system, progression
- `ARCHITECTURE.md` - Technical systems, data schemas
- `FEATURES.md` - Feature backlog with status markers
