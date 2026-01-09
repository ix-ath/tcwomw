# Next Session Prompt
**Copy everything below the line after /clear**

---

Continue developing my Phaser 3 typing game.

## Reference Docs (read these first)
- `CLAUDE.md` - Full game design overview
- `docs/CORE_LOOP_SPEC.md` - Core mechanics, campaign structure, economy
- `docs/SCOPE_GAP_ANALYSIS.md` - Current implementation status and gaps
- `docs/GAME_DESIGN.md` - Visual style, scoring philosophy

## Current State
Campaign skeleton is working: Break Room → Tutorial → Chapter progression → Death/Restart. CampaignManager handles story/chapter/page flow. Scrap economy tracks errors.

## This Session: UI Pass for GameScene

**Goal:** Add left sidebar UI during gameplay showing stats, progress, and game state.

**Before implementing anything, ask me 8-10 questions to understand my vision for:**
- What stats/info should show on the left sidebar during gameplay
- How scoring should feel and display
- Visual style for the UI elements
- What information is critical vs nice-to-have
- How the UI should respond to game events (errors, combos, crusher state)
- Any existing systems I want surfaced (scrap, helpers, chapter progress)

**Relevant current systems to reference:**
- `UIScene.ts` - Existing HUD overlay (combo, score, status)
- `GameScene.ts` - Core gameplay, crusher state machine
- `SaveManager.ts` - Scrap, helpers, progress tracking
- `CampaignManager.ts` - Chapter/page progression
- `constants.ts` - LAYOUT zones, COLORS

**Layout zones from CORE_LOOP_SPEC:**
```
┌─────────────────────────────────────────────────────────────────┐
│ STAGING AREA (wrong letters animate here before falling)        │
├──────────┬─────────────────────────────────────┬────────────────┤
│          │  GAME AREA                          │                │
│  SCORE   │  ┌─────────────────────────────┐   │  ANIMATED      │
│  MODS    │  │ CRUSHER (weight piles here) │   │  ARTWORK       │
│  BUTTONS │  ├─────────────────────────────┤   │  JUICY STUFF   │
│          │  │   SCRAMBLED LETTERS         │   │                │
│          │  │   (coin-push physics)       │   │                │
│          │  ├─────────────────────────────┤   │                │
│          │  │ FAIL ZONE (game over line)  │   │                │
│          │  │ ___ ____ ___ + THEME        │   │                │
└──────────┴─────────────────────────────────────┴────────────────┘
```

Start by asking the questions, then we'll implement based on my answers.
