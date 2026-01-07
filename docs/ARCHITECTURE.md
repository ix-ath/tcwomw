# TECHNICAL ARCHITECTURE
## The Crushing Weight of My Words

---

## 1. TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|------------|---------|
| Game Engine | Phaser 3.80+ | Rendering, scene management, input |
| Physics | Matter.js (via Phaser) | Coin-pusher mechanics |
| Language | TypeScript | Type safety, better tooling |
| Build | Vite | Fast dev server, optimized builds |
| Desktop | Electron | Steam/standalone deployment |
| Audio | Web Audio API | Procedural sound generation |

---

## 2. PROJECT STRUCTURE

```
src/
├── main.ts                 # Entry point, Phaser config
├── constants.ts            # All tunable values
├── types.ts                # TypeScript definitions
│
├── scenes/                 # Phaser scenes (game states)
│   ├── BootScene.ts        # Initial setup
│   ├── PreloadScene.ts     # Asset loading
│   ├── MenuScene.ts        # Title screen
│   ├── GameScene.ts        # Core gameplay
│   ├── UIScene.ts          # HUD overlay
│   └── ResultScene.ts      # Win/lose screen
│
├── systems/                # Modular game logic (future)
│   ├── InputSystem.ts      # Keyboard handling
│   ├── CrusherSystem.ts    # Crusher physics/behavior
│   ├── ComboSystem.ts      # Streak tracking
│   ├── ScoreSystem.ts      # Point calculation
│   ├── AudioSystem.ts      # Sound management
│   └── ParticleSystem.ts   # VFX management
│
├── entities/               # Game object classes (future)
│   ├── Crusher.ts
│   ├── Letter.ts
│   ├── PenaltyLetter.ts
│   └── Bale.ts
│
├── ui/                     # UI components (future)
│   ├── Button.ts
│   ├── PressureBar.ts
│   └── ComboDisplay.ts
│
├── utils/                  # Helper functions
│   └── wordUtils.ts        # Phrase data & scrambling
│
└── assets/                 # Game assets
    ├── audio/
    ├── sprites/
    └── fonts/
```

---

## 3. SCENE ARCHITECTURE

### Scene Flow
```
BootScene → PreloadScene → MenuScene ─┬→ GameScene ←→ UIScene
                              ↑       │      │
                              │       │      ↓
                              └───────┴─ ResultScene
```

### Scene Responsibilities

| Scene | Purpose | Runs Parallel |
|-------|---------|---------------|
| BootScene | Registry setup, config | No |
| PreloadScene | Asset loading | No |
| MenuScene | Title, difficulty select | No |
| GameScene | Core gameplay loop | Yes (with UI) |
| UIScene | HUD overlay | Yes (with Game) |
| ResultScene | Stats, continue/retry | No |

### Scene Communication
Scenes communicate via:
1. **Registry**: Shared state (progress, config)
2. **Events**: Cross-scene events via `scene.events`
3. **Data**: Passed via `scene.start(key, data)`

---

## 4. EVENT SYSTEM

### Custom Events
```typescript
enum GameEvents {
  // Input
  CORRECT_LETTER = 'correct_letter',
  WRONG_LETTER = 'wrong_letter',
  WORD_COMPLETE = 'word_complete',
  
  // Crusher
  CRUSHER_LIFT = 'crusher_lift',
  CRUSHER_DROP = 'crusher_drop',
  CRUSHER_PANIC = 'crusher_panic',
  CRUSHER_OVERDRIVE = 'crusher_overdrive',
  
  // Combo
  COMBO_INCREMENT = 'combo_increment',
  COMBO_RESET = 'combo_reset',
  KINETIC_PULSE = 'kinetic_pulse',
  
  // VFX
  SPAWN_PARTICLES = 'spawn_particles',
  SCREEN_SHAKE = 'screen_shake',
}
```

### Event Flow Example
```
KeyPress → InputSystem → CORRECT_LETTER event
                              │
              ┌───────────────┼───────────────┐
              ↓               ↓               ↓
         ComboSystem    CrusherSystem    AudioSystem
         (increment)      (lift)        (play sound)
              │               │
              ↓               ↓
        COMBO_INCREMENT  CRUSHER_LIFT
              │               │
              ↓               ↓
          UIScene         VFX emit
         (update)        particles
```

---

## 5. DATA SCHEMAS

### Player Progress
```typescript
interface PlayerProgress {
  totalScore: number;
  stage: number;
  wordsCompleted: number;
  
  // Machine repair (0-100)
  hydraulicsRepair: number;
  steamVentRepair: number;
  brassGearsRepair: number;
  
  // Economy
  scrip: number;
  scrapCollected: number;
}
```

### Game Stats (per round)
```typescript
interface GameStats {
  score: number;
  accuracy: number;      // 0-100
  time: number;          // seconds
  wpm: number;
  errors: number;
  maxCombo: number;
  lettersTyped: number;
}
```

### Save Data (future)
```typescript
interface SaveData {
  version: string;
  progress: PlayerProgress;
  config: GameConfig;
  stats: CareerStats;
  pitState: PitData;      // The Pit of Failure
}
```

---

## 6. PHYSICS ARCHITECTURE (Phase 2)

### Matter.js Integration
Phaser's Matter.js wrapper provides:
- Rigid body physics
- Collision detection
- Constraints and joints

### Letter Bodies
```typescript
// Each letter on the board
matter.add.gameObject(letterSprite, {
  shape: 'rectangle',
  mass: PHYSICS.LETTER_MASS,
  restitution: PHYSICS.RESTITUTION,
  friction: PHYSICS.FRICTION,
  angle: initialRotation,
  angularDamping: 0.9,  // Readability guard
});
```

### Crusher Body
```typescript
// The 16-ton weight
matter.add.gameObject(crusherSprite, {
  shape: 'rectangle',
  isStatic: false,
  mass: 100,  // Heavy
  friction: 0.5,
});

// Constraint to only move vertically
matter.add.constraint(crusher, anchor, {
  stiffness: 1,
  length: 0,
  pointA: { x: 0, y: 0 },
});
```

### Collision Groups
```typescript
const GROUPS = {
  CRUSHER: 0x0001,
  LETTER: 0x0002,
  PENALTY: 0x0004,
  PIT_WALL: 0x0008,
};
```

---

## 7. AUDIO ARCHITECTURE (Phase 4)

### Procedural Audio
Using Web Audio API for dynamic sound:

```typescript
class AudioSystem {
  private context: AudioContext;
  private currentPitch: number = 1.0;
  
  playCorrect(): void {
    const osc = this.context.createOscillator();
    osc.frequency.value = 440 * this.currentPitch;
    // ... envelope, connect, play
    
    this.currentPitch += AUDIO.PITCH_INCREMENT;
    if (this.currentPitch > AUDIO.MAX_PITCH) {
      this.currentPitch = AUDIO.BASE_PITCH;
    }
  }
  
  playError(): void {
    // Noise burst + low frequency thud
    this.currentPitch = AUDIO.BASE_PITCH; // Reset
  }
}
```

### Sound Categories
| Category | Generation | Notes |
|----------|------------|-------|
| Correct | Sine wave, rising pitch | Musical scale |
| Error | Noise + low sine | Metallic clang |
| Fanfare | 3x sine hits | Staccato brass |
| Ambient | Filtered noise | Industrial hum |

---

## 8. PERFORMANCE CONSIDERATIONS

### The Pit Optimization
For 10,000+ letters in The Pit:

1. **Static Batching**: Combine letter sprites into single texture
2. **3pt Font**: Tiny size allows dense packing
3. **Culling**: Only render visible portion
4. **LOD**: Simplify distant letters to dots

### Physics Optimization
- Sleep bodies when stationary
- Limit active physics bodies (clear old penalty letters)
- Use simple collision shapes

### Rendering
- Particle pooling (max 100 particles)
- Texture atlases for sprites
- Minimize draw calls with batching

---

## 9. BUILD & DEPLOYMENT

### Development
```bash
npm run dev          # Vite dev server (hot reload)
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
```

### Production
```bash
npm run build        # Web build to /dist
npm run preview      # Preview production build
```

### Electron (Steam)
```bash
npm run electron:dev    # Dev with Electron
npm run electron:build  # Package for distribution
```

### Steam Deployment
1. Build Electron app
2. Configure `steamworks_sdk`
3. Upload via Steam partner tools
4. Set up achievements/leaderboards

---

## 10. FUTURE CONSIDERATIONS

### Workshop Integration
- Custom phrase packs as JSON
- Steam Workshop API for sharing
- Validation/sanitization of imports

### Multiplayer (Maybe)
- WebSocket server for versus mode
- Ghost data stored locally for racing
- Simple state sync (positions, scores)

### Mobile (Maybe)
- Touch keyboard support
- Responsive UI scaling
- Simplified physics for performance
