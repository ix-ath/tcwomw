# The Crushing Weight of My Words

A physics-driven typing game where every mistake has physical consequences. You don't just lose points—you lose space.

## 🎮 Concept

As a shift-worker in a massive, rusted industrial machine, your job is to type with precision to keep the "16-Ton Weight" (the Crusher) from crushing your terminal. Every correct keystroke provides lift; every mistake adds weight.

## 🛠 Tech Stack

- **Game Engine**: Phaser 3.80+
- **Physics**: Matter.js (built into Phaser)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Desktop Wrapper**: Electron (for Steam deployment)

## 📁 Project Structure

```
tcwomw/
├── src/
│   ├── main.ts              # Game entry point & Phaser config
│   ├── constants.ts         # All tunable game values
│   ├── types.ts             # TypeScript interfaces & enums
│   ├── scenes/
│   │   ├── BootScene.ts     # Initial setup
│   │   ├── PreloadScene.ts  # Asset loading
│   │   ├── MenuScene.ts     # Title & difficulty select
│   │   ├── GameScene.ts     # Core gameplay
│   │   ├── UIScene.ts       # HUD overlay
│   │   └── ResultScene.ts   # Win/lose screen
│   ├── systems/             # (Future) Modular game systems
│   ├── entities/            # (Future) Game entity classes
│   ├── ui/                  # (Future) UI components
│   ├── utils/
│   │   └── wordUtils.ts     # Phrase data & scrambling
│   └── assets/              # Game assets (audio, sprites, fonts)
├── docs/                    # Design documentation
├── public/                  # Static files
├── index.html               # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tcwomw

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000`

### Building for Production

```bash
# Build web version
npm run build

# Build Electron app (for Steam)
npm run electron:build
```

## 🎯 Core Mechanics

### The Crusher
- Descends constantly at a base speed
- Speed increases with stage and difficulty
- Correct letters provide upward lift
- Errors cause it to drop

### Combo System
- Consecutive correct letters build combo
- Higher combo = more lift per letter
- 20-streak triggers "Overdrive" (Kinetic Battery pulse)
- Any error resets combo to 0

### Difficulty Tiers
- **Easy**: Single words (5 letters), slower descent
- **Medium**: Short phrases, normal speed
- **Hard**: Long sentences, faster descent

## 🗺 Roadmap

### Phase 1: Core Loop ✅
- [x] Basic typing mechanics
- [x] Crusher descent/lift
- [x] Combo system
- [x] Win/lose conditions
- [x] Visual feedback (particles, shake)

### Phase 2: Physics Enhancement
- [ ] Matter.js coin-pusher physics for letters
- [ ] Physical penalty letters on errors
- [ ] Letter collision and piling
- [ ] The Pit of Failure (letter graveyard)

### Phase 3: Economy & Progression
- [ ] Scrap currency from errors
- [ ] Machine repair system
- [ ] Hydraulic Buffers (extra lives)
- [ ] Dictionary tier unlocks

### Phase 4: Polish
- [ ] Procedural audio system
- [ ] Full art asset integration
- [ ] Steam integration
- [ ] Achievements

## 🎨 Art Style

"Monty Python Industrial" - A rusty, Victorian-era machine aesthetic that evolves from broken to polished as you progress.

### Placeholder Assets
Currently using programmatically generated shapes. AI-generated assets will be added later.

### Asset Requirements (Future)
See `docs/ASSET_SPEC.md` (to be created) for detailed asset specifications.

## 📝 Design Documents

The full game design is documented in:
- `docs/GAME_DESIGN.md` - Core mechanics and feel
- `docs/ARCHITECTURE.md` - Technical systems
- `docs/FEATURES.md` - Feature backlog with status
- `docs/DECISIONS.md` - Design decision log

## 🤝 Development Notes

### Modularity
The codebase is designed for easy expansion:
- Systems are decoupled via Phaser events
- Constants are centralized for easy tuning
- Types are strictly defined for safety

### Adding New Features
1. Define types in `src/types.ts`
2. Add constants to `src/constants.ts`
3. Create system in `src/systems/`
4. Wire up events in the relevant scene

## 📄 License

MIT

---

Built with 🎮 Phaser and ☕ determination.
