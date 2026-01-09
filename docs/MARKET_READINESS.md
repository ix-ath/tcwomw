# Market Readiness Analysis
## Current State vs. Shippable Indie Game

**Date:** 2026-01-09

---

## Executive Summary

You have a **solid vertical slice** with working core loop, campaign structure, and progression systems. What's missing is primarily **presentation layer** (audio, visuals, juice) and **platform integration** (Steam, achievements).

**Estimated gap:** ~40% complete toward shippable MVP.

---

## What You Have (Strong Foundation)

| Category | Status | Notes |
|----------|--------|-------|
| Core gameplay loop | ✅ Solid | Typing, crusher, win/lose - all working |
| Physics system | ✅ Working | Matter.js letters, penalty weights, coin-pusher |
| Campaign structure | ✅ Complete | 10 chapters, 61 pages, boss pages |
| Progression | ✅ Working | Chapter unlock, restart-on-loss |
| Economy skeleton | ✅ Working | Scrap earning, helper data exists |
| Settings system | ✅ Polished | 4 tabs, descriptions, persistence |
| Tutorial | ✅ Complete | ON→START→OOPS→Impossible→Pit flow |
| Hub world | ✅ Framework | Break Room with 8 fixtures |
| Save system | ✅ Working | LocalStorage persistence |
| Accessibility basics | ✅ Good | Colorblind, font scaling, mouse-only |
| Keyboard nav | ✅ Complete | WASD/arrows in all menus |

---

## What's Missing (By Priority)

### TIER 1: Required for ANY Release

| Gap | Impact | Effort | Notes |
|-----|--------|--------|-------|
| **Audio - ANY sounds** | Critical | Medium | Silent game = unshippable. Even placeholder beeps help. |
| **Helper effects working** | Critical | Medium | Data exists, GameScene doesn't apply effects |
| **Scrap spending UI** | Critical | Low | Can earn scrap, can't spend it (loop broken) |
| **Visual identity** | High | High | Terminal green placeholder ≠ Victorian industrial |

### TIER 2: Required for Steam Release

| Gap | Impact | Effort | Notes |
|-----|--------|--------|-------|
| **Electron wrapper** | Required | Low | npm package, straightforward |
| **Steam SDK** | Required | Medium | Greenworks or Steamworks.js |
| **Achievements** | Expected | Medium | ~20-30 achievements typical |
| **Cloud saves** | Expected | Low | Steam handles most of it |
| **Store assets** | Required | Medium | Capsules, screenshots, trailer |

### TIER 3: Expected by Players (Polish)

| Gap | Impact | Effort | Notes |
|-----|--------|--------|-------|
| **Juice/feedback** | High | Medium | Score animation, combo lights, screen effects |
| **Music** | High | Medium | At least ambient + tension layers |
| **Break Room functionality** | Medium | Medium | Fixtures are placeholder modals |
| **Mutator system** | Medium | Medium | 6 mutators defined, none implemented |
| **Statistics/tracking** | Medium | Low | WPM history, accuracy, etc. |

### TIER 4: Nice-to-Have (Differentiators)

| Gap | Impact | Effort | Notes |
|-----|--------|--------|-------|
| **Workshop support** | High long-term | High | User content = longevity |
| **Leaderboards** | Medium | Low | Steam handles backend |
| **Daily challenges** | Medium | Medium | Time Clock fixture ready |
| **Endless mode** | Low | Low | Window fixture ready |

---

## Comparison: Your Game vs. Typical Indie Release

| Aspect | Typical Indie | Your Current State | Gap |
|--------|---------------|-------------------|-----|
| **Core loop** | Solid, tested | ✅ Solid | None |
| **Content volume** | 2-4 hours | ~1-2 hours (10 chapters) | Acceptable for $5 |
| **Audio** | Full SFX + music | ❌ None | **Critical** |
| **Visuals** | Cohesive art style | ❌ Placeholder | **High** |
| **Achievements** | 20-40 | ❌ None | Medium |
| **Settings** | Basic | ✅ Comprehensive | Ahead of typical |
| **Accessibility** | Often ignored | ✅ Good foundation | Ahead of typical |
| **Tutorial** | Often weak | ✅ Solid | None |
| **Replayability** | Variable | 🟡 Helpers + mutators planned | Needs implementation |

---

## Suggested Ship Path

### MVP ($2.99-$4.99) - "Playable Product"

**Goal:** Core loop complete, basic presentation, Steam-ready.

1. **Audio pass** (1-2 weeks)
   - Correct/wrong sounds (procedural or Suno AI)
   - Ambient industrial loop
   - Word complete fanfare

2. **Helper implementation** (1 week)
   - Theme/Tag display working
   - Keep Highlight duration
   - First Letter/Word effects

3. **Scrap spending** (3 days)
   - Simple list UI in Pit
   - Buy/equip flow

4. **Steam integration** (1 week)
   - Electron wrapper
   - Basic achievements (10-15)
   - Cloud saves

5. **Store presence** (1 week)
   - Screenshots (current art is fine for EA)
   - Simple trailer (gameplay capture)
   - Description copy

**Total:** ~5-6 weeks to Early Access

### Full Release ($4.99-$9.99) - "Polished Product"

Add after MVP feedback:

6. **Visual overhaul** (2-4 weeks)
   - Victorian industrial art pass
   - Crusher artwork
   - Letter block sprites

7. **UI implementation** (1-2 weeks per UI_SPEC.md)
   - Score slot machine
   - Combo light panel
   - Error counter

8. **Mutator system** (1 week)
   - 6 mutators working
   - Stacking for challenge runs

9. **Break Room functionality** (2 weeks)
   - Fridge: real scoreboard
   - Locker: loadout management
   - Bulletin: mutator selection

10. **Workshop** (2-4 weeks)
    - Story upload/download
    - Steam Workshop integration

---

## What Makes Games Feel "Real"

### The Invisible 20%

Players don't consciously notice these, but their absence feels "off":

| Element | Your Status | Fix |
|---------|-------------|-----|
| **Feedback sounds** | ❌ Missing | Every button, every action needs audio |
| **Transition animations** | 🟡 Basic | Scene transitions, UI slides |
| **Loading states** | ❌ None | Even fake loading bars feel polished |
| **Error handling** | 🟡 Basic | Graceful failures, helpful messages |
| **Consistent timing** | ✅ Good | Your 200ms pause feels intentional |

### The "Juice" Checklist

- [ ] Button hover states
- [ ] Button click feedback (scale + sound)
- [ ] Text that animates in (not just appears)
- [ ] Numbers that roll/tick (not instant)
- [ ] Particles on success
- [ ] Screen shake on failure (you have this!)
- [ ] Color pulses for state changes
- [ ] Ambient movement (idle animations)

---

## Honest Assessment

**Strengths:**
- Core loop is genuinely fun (the clutch recovery feeling)
- Unusual concept (typing + horror + industrial)
- Strong accessibility foundation
- Clear design vision documented

**Risks:**
- Silent game is hard to evaluate feel
- Visual placeholder may undersell the concept
- Helper system is the progression hook - needs to work
- Solo dev = burnout risk on art/audio

**Recommendation:**
Ship MVP to Early Access with placeholder art but REAL audio. Audio sells the horror/tension better than visuals. Get feedback, then art pass.

---

## Quick Wins (Do This Week)

1. **Any audio** - Even free sfxr.me sounds
2. **Fix helper effects** - Theme/Tag display in GameScene
3. **Scrap spending** - Basic list in PitScene
4. **One achievement** - "First Crush" for dying once

These 4 things close the progression loop and make the game feel complete.
