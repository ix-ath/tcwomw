# AI Prompts

Reusable prompts for generating assets, content, and other AI-assisted work.

---

## Main Game Screen Concept Art

**Last updated:** 2026-01-07

**Use for:** Generating concept art for the main gameplay screen layout.

---

Create concept art for the main game screen of "The Crushing Weight of My Words" - a psychological horror typing game set in a dimly lit Victorian industrial factory.

**VISUAL STYLE:**
Terry Gilliam / Monty Python collage/cutout aesthetic. Victorian-era industrial imagery, layered paper textures, mechanical engravings. Grimy, dark, oppressive.

**COLOR PALETTE:**
Dimly lit factory floor. Deep shadows, soot-stained surfaces, charcoal grays, tarnished brass, dirty rust where light catches edges. Harsh industrial light cutting through smoke. NOT sepia - think coal dust and machine grease.

---

**SCREEN LAYOUT (1280x720):**

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP STRIP - "STAGING AREA"                                              │
│ (Where wrong letters appear briefly before falling as weights)         │
├─────────────┬──────────────────────────────────────────┬───────────────┤
│             │                                          │               │
│  LEFT       │        CENTER PLAY AREA                  │    RIGHT      │
│  SIDEBAR    │                                          │    SIDEBAR    │
│  160px      │   ┌──────────────────────────────┐      │    320px      │
│             │   │      THE CRUSHER             │      │               │
│  SCORE:     │   │   (descends from top)        │      │  Atmospheric  │
│  1,250      │   │   Heavy iron press, 800px   │      │  factory      │
│             │   │   wide, rivets, rust         │      │  elements:    │
│  PRESSURE   │   └──────────────────────────────┘      │               │
│  [██████░░] │              ↓ ↓ ↓                       │  - Pipes      │
│  (vertical  │                                          │  - Gears      │
│   meter)    │      S    A           P                  │  - Steam      │
│             │         N     D        L                 │  - Shadows    │
│  STATUS:    │      B     O   X    E                    │  - Decay      │
│  DESCENDING │           W                              │               │
│             │   (Letter blocks scattered randomly,     │               │
│             │    chunky metal type, slight rotation,   │               │
│             │    ~750px wide zone under crusher)       │               │
│             │                                          │               │
│             │   ════════════════════════════════════   │               │
│             │   (FAIL ZONE - red danger line)          │               │
│             │                                          │               │
│             │         PLACES • beach                   │               │
│             │      ┌─┬─┬─┬─┬─┐ ┌─┬─┬─┬─┬─┐            │               │
│             │      │S│A│N│D│Y│ │B│E│A│C│H│            │               │
│             │      └─┴─┴─┴─┴─┘ └─┴─┴─┴─┴─┘            │               │
│             │      (Word blanks - player fills these)  │               │
└─────────────┴──────────────────────────────────────────┴───────────────┘
```

---

**HOW THE GAME WORKS (for visual context):**

1. **THE CRUSHER** sits at top of center area. Heavy Victorian industrial press - iron plates, rivets, chains or hydraulics. It slowly descends toward the letters below.

2. **LETTER BLOCKS** are scattered in the play area beneath the crusher. These are the EXACT letters needed to spell the answer (like metal type blocks or factory stamps). Example: if the answer is "SANDY BEACH", blocks showing S, A, N, D, Y, B, E, A, C, H are scattered randomly.

3. **Player types letters in order.** When correct, that letter block DISAPPEARS from the scattered pile and APPEARS in the blanks at bottom.

4. **Wrong guesses** cause the typed letter to appear as a RED WEIGHT that falls onto the crusher, making it heavier and faster.

5. **THE CRUSHER DESCENDS** as mistakes pile up, pushing toward the fail zone. It physically pushes the remaining letter blocks as it comes down.

---

**SPECIFIC ELEMENTS TO SHOW:**

| Element | Location | Sample Text/Visual |
|---------|----------|-------------------|
| Score | Left sidebar, top | "SCORE: 1,250" |
| Pressure meter | Left sidebar, middle | Vertical bar gauge, fills with danger |
| Status | Left sidebar, lower | "DORMANT" or "DESCENDING" or "CRITICAL" |
| Crusher | Center, top | Wide iron press spanning ~800px |
| Letter blocks | Center, scattered | Individual blocks: "A" "B" "S" etc. |
| Fail zone | Center, lower | Red line or hazard marking |
| Theme + hint | Center, above blanks | "PLACES • beach" |
| Word blanks | Center, bottom | Boxes showing "S A N D Y   B E A C H" |
| Atmosphere | Right sidebar | Pipes, gears, steam, grime |

---

**MOOD:**
Dark, grungy, claustrophobic. A night shift that never ends. The crusher is HEAVY and INEVITABLE. Every mistake adds weight. The ceiling closing in.

**STYLE REFERENCES:**
Terry Gilliam animations, Victorian factory engravings, workhouse horror, dangerous machinery, dimly lit foundries, soot and grime

---

## Game Description (Short)

**Use for:** Store descriptions, social media, quick pitches.

---

"The Crushing Weight of My Words" is a psychological horror typing game about perfectionism. Players guess hidden words while a massive industrial crusher threatens from above. Every mistake becomes a weight that pushes the crusher closer. Every correct letter buys a moment of relief. The core fantasy: "I must be perfect - every imperfection is shoved in my face."

---

## Future Prompts

Add new prompts below as needed:

- [ ] Menu screen concept art
- [ ] "The Pit" screen concept art
- [ ] "The Break Room" hub concept art
- [ ] Sound effect descriptions
- [ ] Music/atmosphere descriptions
- [ ] Individual asset prompts (crusher, letter blocks, etc.)

---

## Game Loop Expansion Session

**Use after /clear to continue work on menus and game flow.**

---

I want to expand the game beyond "1 level + stats screen." Currently the core gameplay loop (typing words, crusher mechanics) feels solid at ~75%. Now I need to build out:

1. **Menu flow** - Main menu, difficulty select, settings, how these connect
2. **Round progression** - Multiple rounds? Endless mode? Campaign stages?
3. **Between-round moments** - What happens after you win a round?
4. **The hub ("Break Room")** - Where does the player go between sessions?
5. **Progression systems** - Unlocks, The Pit economy, helpers/boosts

Please do a planning session with me. Ask me questions to understand what I want, then help me design the flow. Start by asking about my vision for how a full play session should feel - from launching the game to quitting.
