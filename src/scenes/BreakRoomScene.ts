/**
 * BREAK ROOM SCENE
 * The hub area between runs. A depressing workplace break room.
 * Fixtures unlock with progression and provide access to game features.
 *
 * Aesthetic: Grimy, fluorescent-lit, sad. A night shift that never ends.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SaveManager } from '../systems/SaveManager';

/** Fixture definition with unlock requirements */
interface Fixture {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unlockRequirement: () => boolean;
  lockedMessage: string;
  action: () => void;
}

export class BreakRoomScene extends Phaser.Scene {
  private fixtures: Fixture[] = [];
  private fixtureContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private tooltipContainer!: Phaser.GameObjects.Container;
  private selectedFixtureIndex: number = 0;
  private activeModal: Phaser.GameObjects.Text | null = null;
  private modalDismissHandler: (() => void) | null = null;

  constructor() {
    super({ key: 'BreakRoomScene' });
  }

  create(): void {
    this.createBackground();
    this.createAmbience();
    this.defineFixtures();
    this.createFixtures();
    this.createHUD();
    this.createTooltip();
    this.setupInput();
  }

  private createBackground(): void {
    // Grimy floor - dark concrete
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a1a);

    // Floor tiles (subtle grid)
    const tileSize = 80;
    for (let x = 0; x < GAME_WIDTH; x += tileSize) {
      for (let y = 0; y < GAME_HEIGHT; y += tileSize) {
        // Slightly varied tile colors for grime
        const grime = Phaser.Math.Between(0, 15);
        const color = Phaser.Display.Color.GetColor(26 + grime, 26 + grime, 26 + grime);
        this.add.rectangle(x + tileSize / 2, y + tileSize / 2, tileSize - 2, tileSize - 2, color)
          .setAlpha(0.3);
      }
    }

    // Walls (darker at top)
    this.add.rectangle(GAME_WIDTH / 2, 60, GAME_WIDTH, 120, 0x0d0d0d);

    // Baseboard
    this.add.rectangle(GAME_WIDTH / 2, 118, GAME_WIDTH, 4, 0x2a2a2a);

    // Fluorescent light fixtures (placeholder rectangles)
    this.createFluorescentLight(320, 50);
    this.createFluorescentLight(640, 50);
    this.createFluorescentLight(960, 50);

    // Room title
    this.add.text(GAME_WIDTH / 2, 30, 'BREAK ROOM', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: '#444444',
    }).setOrigin(0.5).setAlpha(0.6);
  }

  private createFluorescentLight(x: number, y: number): void {
    // Light fixture
    this.add.rectangle(x, y, 120, 20, 0x333333);

    // Light glow (flickering)
    const glow = this.add.rectangle(x, y, 100, 12, 0xffffee, 0.8);

    // Flicker effect
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.6, to: 0.9 },
      duration: Phaser.Math.Between(100, 300),
      yoyo: true,
      repeat: -1,
      repeatDelay: Phaser.Math.Between(2000, 5000),
    });

    // Light cone on floor (subtle)
    this.add.rectangle(x, 400, 200, 500, 0xffffee, 0.02);
  }

  private createAmbience(): void {
    // Dust particles (very subtle)
    for (let i = 0; i < 20; i++) {
      const dust = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(120, GAME_HEIGHT),
        Phaser.Math.Between(1, 2),
        0xffffff,
        0.1
      );

      // Slow drift
      this.tweens.add({
        targets: dust,
        x: dust.x + Phaser.Math.Between(-50, 50),
        y: dust.y + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(8000, 15000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private defineFixtures(): void {
    this.fixtures = [
      {
        id: 'chair',
        name: 'CHAIR',
        description: 'Sit down. Start your shift.',
        x: 200,
        y: 450,
        width: 80,
        height: 100,
        unlockRequirement: () => true, // Always available
        lockedMessage: '',
        action: () => this.startGame(),
      },
      {
        id: 'crack',
        name: 'THE CRACK',
        description: 'Peer into The Pit. Spend your failures.',
        x: 400,
        y: 550,
        width: 60,
        height: 30,
        unlockRequirement: () => true, // Always available
        lockedMessage: '',
        action: () => this.openPit(),
      },
      {
        id: 'fridge',
        name: 'FRIDGE',
        description: 'Check the scoreboard. Old lunches inside.',
        x: 640,
        y: 350,
        width: 100,
        height: 160,
        unlockRequirement: () => SaveManager.getStats().chaptersCompleted >= 2,
        lockedMessage: 'Complete 2 chapters to unlock',
        action: () => this.openScoreboard(),
      },
      {
        id: 'bulletin',
        name: 'BULLETIN BOARD',
        description: 'View available mutators. Memos from... before.',
        x: 850,
        y: 250,
        width: 120,
        height: 100,
        unlockRequirement: () => SaveManager.getStats().chaptersCompleted >= 4,
        lockedMessage: 'Complete 4 chapters to unlock',
        action: () => this.openMutators(),
      },
      {
        id: 'microwave',
        name: 'MICROWAVE',
        description: 'Quick play. Random chapter.',
        x: 1050,
        y: 350,
        width: 70,
        height: 50,
        unlockRequirement: () => SaveManager.getStats().chaptersCompleted >= 6,
        lockedMessage: 'Complete 6 chapters to unlock',
        action: () => this.quickPlay(),
      },
      {
        id: 'locker',
        name: 'LOCKER',
        description: 'Equip your helpers. Loadout customization.',
        x: 1100,
        y: 500,
        width: 60,
        height: 140,
        unlockRequirement: () => SaveManager.getStats().chaptersCompleted >= 8,
        lockedMessage: 'Complete 8 chapters to unlock',
        action: () => this.openLoadout(),
      },
      {
        id: 'timeclock',
        name: 'TIME CLOCK',
        description: 'Daily challenge. Punch in.',
        x: 100,
        y: 250,
        width: 50,
        height: 80,
        unlockRequirement: () => SaveManager.getStats().storiesCompleted >= 1,
        lockedMessage: 'Complete the main story to unlock',
        action: () => this.dailyChallenge(),
      },
      {
        id: 'window',
        name: 'WINDOW',
        description: 'Look outside. Is there an outside?',
        x: 500,
        y: 200,
        width: 140,
        height: 100,
        unlockRequirement: () => SaveManager.getStats().storiesCompleted >= 1,
        lockedMessage: 'Complete the main story to unlock',
        action: () => this.openEndless(),
      },
    ];
  }

  private createFixtures(): void {
    this.fixtures.forEach((fixture) => {
      const isUnlocked = fixture.unlockRequirement();
      const container = this.add.container(fixture.x, fixture.y);

      // Background shape
      const bg = this.add.rectangle(0, 0, fixture.width, fixture.height, 0x2a2a2a)
        .setStrokeStyle(2, isUnlocked ? COLORS.TERMINAL_GREEN : 0x444444);

      // Fixture label
      const label = this.add.text(0, fixture.height / 2 + 15, fixture.name, {
        fontFamily: 'VT323, monospace',
        fontSize: '14px',
        color: isUnlocked ? COLORS.TERMINAL_GREEN_CSS : '#444444',
      }).setOrigin(0.5);

      // Lock icon if locked
      let lockIcon: Phaser.GameObjects.Text | null = null;
      if (!isUnlocked) {
        lockIcon = this.add.text(0, 0, '🔒', {
          fontSize: '24px',
        }).setOrigin(0.5);
      }

      // Placeholder icon (will be replaced with sprites later)
      const icon = this.add.text(0, 0, this.getFixtureIcon(fixture.id), {
        fontSize: '32px',
      }).setOrigin(0.5).setAlpha(isUnlocked ? 1 : 0.3);

      container.add([bg, icon, label]);
      if (lockIcon) container.add(lockIcon);

      // Interactivity
      bg.setInteractive({ useHandCursor: isUnlocked })
        .on('pointerover', () => this.showTooltip(fixture, isUnlocked))
        .on('pointerout', () => this.hideTooltip())
        .on('pointerdown', () => {
          if (isUnlocked) {
            this.fixtureClick(fixture);
          } else {
            this.showLockedMessage(fixture);
          }
        });

      // Hover effect for unlocked fixtures
      if (isUnlocked) {
        bg.on('pointerover', () => {
          bg.setFillStyle(0x3a3a3a);
          bg.setStrokeStyle(3, COLORS.TERMINAL_GREEN);
        });
        bg.on('pointerout', () => {
          bg.setFillStyle(0x2a2a2a);
          bg.setStrokeStyle(2, COLORS.TERMINAL_GREEN);
        });
      }

      this.fixtureContainers.set(fixture.id, container);
    });
  }

  private getFixtureIcon(id: string): string {
    const icons: Record<string, string> = {
      chair: '🪑',
      crack: '⬛',
      fridge: '🧊',
      bulletin: '📋',
      microwave: '📦',
      locker: '🚪',
      timeclock: '⏰',
      window: '🪟',
    };
    return icons[id] || '❓';
  }

  private createHUD(): void {
    // Cube Scrap display (top right)
    this.add.rectangle(GAME_WIDTH - 100, 30, 180, 40, 0x000000, 0.8)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    this.add.text(GAME_WIDTH - 180, 30, 'CUBE SCRAP:', {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0, 0.5);

    this.add.text(GAME_WIDTH - 30, 30, SaveManager.getCubeScrap().toString(), {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(1, 0.5);

    // Menu button (top left)
    const menuBtn = this.add.text(20, 30, '[ MENU ]', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0, 0.5);

    menuBtn.setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuBtn.setColor('#ffffff'))
      .on('pointerout', () => menuBtn.setColor(COLORS.TERMINAL_GREEN_CSS))
      .on('pointerdown', () => this.scene.start('MenuScene'));

    // Instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '[\u2190/\u2192 or A/D] SELECT  \u2022  [ENTER] INTERACT  \u2022  [ESC] MENU', {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);
  }

  private createTooltip(): void {
    this.tooltipContainer = this.add.container(0, 0).setVisible(false).setDepth(100);

    const bg = this.add.rectangle(0, 0, 250, 60, 0x000000, 0.95)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN)
      .setOrigin(0, 0);

    const title = this.add.text(10, 8, '', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setName('title');

    const desc = this.add.text(10, 30, '', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#aaaaaa',
      wordWrap: { width: 230 },
    }).setName('desc');

    this.tooltipContainer.add([bg, title, desc]);
  }

  private showTooltip(fixture: Fixture, isUnlocked: boolean): void {
    const title = this.tooltipContainer.getByName('title') as Phaser.GameObjects.Text;
    const desc = this.tooltipContainer.getByName('desc') as Phaser.GameObjects.Text;

    title.setText(fixture.name);
    desc.setText(isUnlocked ? fixture.description : fixture.lockedMessage);

    // Position near fixture but within screen bounds
    let x = fixture.x + fixture.width / 2 + 10;
    let y = fixture.y - fixture.height / 2;

    if (x + 250 > GAME_WIDTH) x = fixture.x - 260;
    if (y < 80) y = 80;
    if (y + 60 > GAME_HEIGHT) y = GAME_HEIGHT - 70;

    this.tooltipContainer.setPosition(x, y).setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipContainer.setVisible(false);
  }

  private fixtureClick(fixture: Fixture): void {
    // Visual feedback
    const container = this.fixtureContainers.get(fixture.id);
    if (container) {
      this.tweens.add({
        targets: container,
        scale: { from: 1, to: 0.95 },
        duration: 50,
        yoyo: true,
        onComplete: () => fixture.action(),
      });
    }
  }

  private showLockedMessage(fixture: Fixture): void {
    // Flash the locked message
    const container = this.fixtureContainers.get(fixture.id);
    if (container) {
      this.tweens.add({
        targets: container,
        x: { from: fixture.x - 5, to: fixture.x + 5 },
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
    }

    // Show temporary message
    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, fixture.lockedMessage.toUpperCase(), {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: '#ff4444',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 30,
      duration: 1500,
      onComplete: () => msg.destroy(),
    });
  }

  private setupInput(): void {
    // ESC to go to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      // If modal is open, let modal handler deal with ESC
      if (this.activeModal) return;
      this.scene.start('MenuScene');
    });

    // Fixture navigation - cycle through fixtures
    const navigatePrev = () => {
      if (this.activeModal) return;
      this.updateFixtureSelection(this.selectedFixtureIndex - 1);
    };

    const navigateNext = () => {
      if (this.activeModal) return;
      this.updateFixtureSelection(this.selectedFixtureIndex + 1);
    };

    // Arrow keys
    this.input.keyboard?.on('keydown-LEFT', navigatePrev);
    this.input.keyboard?.on('keydown-RIGHT', navigateNext);
    this.input.keyboard?.on('keydown-UP', navigatePrev);
    this.input.keyboard?.on('keydown-DOWN', navigateNext);

    // WASD
    this.input.keyboard?.on('keydown-A', navigatePrev);
    this.input.keyboard?.on('keydown-D', navigateNext);
    this.input.keyboard?.on('keydown-W', navigatePrev);
    this.input.keyboard?.on('keydown-S', navigateNext);

    // Activate selected fixture
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.activeModal) return;
      this.activateSelectedFixture();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.activeModal) return;
      this.activateSelectedFixture();
    });

    // Initialize selection visual on first fixture
    this.time.delayedCall(100, () => {
      this.updateFixtureSelection(0);
    });
  }

  // ===========================================================================
  // MODAL HELPERS
  // ===========================================================================

  /** Show a modal with proper dismiss handling */
  private showModal(content: string): void {
    // Clean up any existing modal first
    this.dismissModal();

    const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, content, {
      fontFamily: 'VT323, monospace',
      fontSize: '20px',
      color: COLORS.TERMINAL_GREEN_CSS,
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 40, y: 30 },
    }).setOrigin(0.5).setDepth(200);

    this.activeModal = msg;

    // Create dismiss handler with proper cleanup
    const dismiss = () => {
      this.dismissModal();
    };

    this.modalDismissHandler = dismiss;
    this.input.on('pointerdown', dismiss);
    this.input.keyboard?.on('keydown-ESC', dismiss);
    this.input.keyboard?.on('keydown-ENTER', dismiss);
    this.input.keyboard?.on('keydown-SPACE', dismiss);
  }

  /** Dismiss the active modal and clean up listeners */
  private dismissModal(): void {
    if (this.activeModal && this.activeModal.active) {
      this.activeModal.destroy();
    }
    this.activeModal = null;

    if (this.modalDismissHandler) {
      this.input.off('pointerdown', this.modalDismissHandler);
      this.input.keyboard?.off('keydown-ESC', this.modalDismissHandler);
      this.input.keyboard?.off('keydown-ENTER', this.modalDismissHandler);
      this.input.keyboard?.off('keydown-SPACE', this.modalDismissHandler);
      this.modalDismissHandler = null;
    }
  }

  // ===========================================================================
  // FIXTURE SELECTION
  // ===========================================================================

  /** Update visual highlight for selected fixture */
  private updateFixtureSelection(newIndex: number): void {
    // Wrap around
    if (newIndex < 0) newIndex = this.fixtures.length - 1;
    if (newIndex >= this.fixtures.length) newIndex = 0;

    const oldIndex = this.selectedFixtureIndex;
    this.selectedFixtureIndex = newIndex;

    // Update old fixture visual (if different)
    if (oldIndex !== newIndex) {
      const oldFixture = this.fixtures[oldIndex];
      const oldContainer = this.fixtureContainers.get(oldFixture.id);
      if (oldContainer) {
        const bg = oldContainer.list[0] as Phaser.GameObjects.Rectangle;
        const isUnlocked = oldFixture.unlockRequirement();
        bg.setStrokeStyle(2, isUnlocked ? COLORS.TERMINAL_GREEN : 0x444444);
        oldContainer.setScale(1);
      }
    }

    // Update new fixture visual
    const newFixture = this.fixtures[newIndex];
    const newContainer = this.fixtureContainers.get(newFixture.id);
    if (newContainer) {
      const bg = newContainer.list[0] as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(3, COLORS.OVERDRIVE_WHITE);
      newContainer.setScale(1.05);

      // Show tooltip for selected fixture
      const isUnlocked = newFixture.unlockRequirement();
      this.showTooltip(newFixture, isUnlocked);
    }
  }

  /** Activate the currently selected fixture */
  private activateSelectedFixture(): void {
    const fixture = this.fixtures[this.selectedFixtureIndex];
    const isUnlocked = fixture.unlockRequirement();

    if (isUnlocked) {
      this.fixtureClick(fixture);
    } else {
      this.showLockedMessage(fixture);
    }
  }

  // ===========================================================================
  // FIXTURE ACTIONS
  // ===========================================================================

  private startGame(): void {
    // Check if tutorial completed
    if (!SaveManager.isTutorialCompleted()) {
      console.log('[BreakRoom] Starting tutorial...');
      this.scene.start('TutorialScene');
      return;
    }

    // Normal game start
    this.registry.set('playerProgress', {
      totalScore: 0,
      stage: 1,
      wordsCompleted: 0,
      hydraulicsRepair: 0,
      steamVentRepair: 0,
      brassGearsRepair: 0,
    });

    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }

  private openPit(): void {
    console.log('[BreakRoom] Opening The Pit...');
    this.scene.start('PitScene');
  }

  private openScoreboard(): void {
    // TODO: Create ScoreboardScene
    console.log('[BreakRoom] Opening scoreboard...');

    const stats = SaveManager.getStats();
    this.showModal(
      `SCOREBOARD\n\nChapters: ${stats.chaptersCompleted}\nStories: ${stats.storiesCompleted}\nBest WPM: ${stats.bestWPM}\nPerfect Runs: ${stats.perfectChapters}\nTotal Errors: ${stats.totalErrors}\nBales Created: ${stats.balesCreated}\n\n[Coming Soon]\n\n[Click or ESC to close]`
    );
  }

  private openMutators(): void {
    console.log('[BreakRoom] Opening mutators...');

    this.showModal(
      'MUTATORS\n\n[Coming Soon]\n\nChallenge modifiers that\nincrease difficulty for\nbonus Cube Scrap.\n\n[Click or ESC to close]'
    );
  }

  private quickPlay(): void {
    console.log('[BreakRoom] Quick play...');

    this.showModal(
      'QUICK PLAY\n\n[Coming Soon]\n\nJump into a random\nchapter for practice.\n\n[Click or ESC to close]'
    );
  }

  private openLoadout(): void {
    console.log('[BreakRoom] Opening loadout...');

    const unlocked = SaveManager.getUnlockedHelpers();
    const equipped = SaveManager.getEquippedHelpers();

    this.showModal(
      `LOADOUT\n\nUnlocked Helpers: ${unlocked.length}\nEquipped: ${equipped.length}\n\n${unlocked.join(', ') || 'None yet'}\n\n[Coming Soon]\n\n[Click or ESC to close]`
    );
  }

  private dailyChallenge(): void {
    console.log('[BreakRoom] Daily challenge...');

    this.showModal(
      'DAILY CHALLENGE\n\n[Coming Soon]\n\nNew challenge every day.\nCompete on the leaderboard.\n\n[Click or ESC to close]'
    );
  }

  private openEndless(): void {
    console.log('[BreakRoom] Endless mode...');

    this.showModal(
      'THE WINDOW\n\n[Coming Soon]\n\nEndless mode.\nHow long can you last?\n\n[Click or ESC to close]'
    );
  }
}
