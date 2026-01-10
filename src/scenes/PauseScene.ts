/**
 * PAUSE SCENE
 * Overlay that appears when ESC is pressed during gameplay.
 * Provides options to resume, restart, or quit to hub.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SettingsManager } from '../systems/SettingsManager';
import { getScaledFontSize } from '../utils/fontScaling';

export class PauseScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Container[] = [];
  private selectedIndex: number = 0;
  private scaledTexts: { text: Phaser.GameObjects.Text; baseSize: number }[] = [];

  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    // Reset all state on scene entry
    this.selectedIndex = 0;
    this.buttons = [];
    this.scaledTexts = [];

    this.createOverlay();
    this.createTitle();
    this.createButtons();
    this.createFooter();
    this.setupInput();

    // Subscribe to font scale changes (returns unsubscribe function but we don't need it
    // as the scene will be destroyed and recreated each time)
    SettingsManager.onChange('fontScale', () => this.updateFontScales());
  }

  private updateFontScales(): void {
    this.scaledTexts.forEach(({ text, baseSize }) => {
      text.setFontSize(getScaledFontSize(baseSize));
    });
  }

  private trackScaledText(text: Phaser.GameObjects.Text, baseSize: number): void {
    this.scaledTexts.push({ text, baseSize });
  }

  private createOverlay(): void {
    // Semi-transparent background covering full screen
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);

    // Main container box
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 400, 320, 0x000000)
      .setStrokeStyle(4, COLORS.TERMINAL_GREEN);
  }

  private createTitle(): void {
    const title = this.add.text(GAME_WIDTH / 2, 200, 'PAUSED', {
      fontFamily: 'VT323, monospace',
      fontSize: '64px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    title.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 15, true, true);
  }

  private createButtons(): void {
    const startY = 280;
    const spacing = 55;

    const options = [
      { label: 'RESUME', action: () => this.resume() },
      { label: 'RESTART', action: () => this.restart() },
      { label: 'SETTINGS', action: () => this.openSettings() },
      { label: 'QUIT TO HUB', action: () => this.quitToHub() },
    ];

    options.forEach((opt, index) => {
      const button = this.createButton(GAME_WIDTH / 2, startY + index * spacing, opt.label, opt.action);
      this.buttons.push(button);
    });

    // Highlight first button
    this.updateSelection(0);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 260, 42, 0x000000)
      .setStrokeStyle(2, COLORS.TERMINAL_GREEN);

    // Button text (scaled)
    const label = this.add.text(0, 0, text, {
      fontFamily: 'VT323, monospace',
      fontSize: `${getScaledFontSize(26)}px`,
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);
    this.trackScaledText(label, 26);

    container.add([bg, label]);

    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        const idx = this.buttons.indexOf(container);
        this.updateSelection(idx);
      })
      .on('pointerdown', callback);

    // Store references for keyboard navigation
    container.setData('bg', bg);
    container.setData('label', label);
    container.setData('callback', callback);

    return container;
  }

  private updateSelection(index: number): void {
    this.selectedIndex = index;

    this.buttons.forEach((button, i) => {
      const bg = button.getData('bg') as Phaser.GameObjects.Rectangle;
      const label = button.getData('label') as Phaser.GameObjects.Text;

      if (i === index) {
        bg.setFillStyle(COLORS.TERMINAL_GREEN, 1);
        label.setColor('#000000');
        bg.setStrokeStyle(3, COLORS.OVERDRIVE_WHITE);
      } else {
        bg.setFillStyle(0x000000, 1);
        label.setColor(COLORS.TERMINAL_GREEN_CSS);
        bg.setStrokeStyle(2, COLORS.TERMINAL_GREEN);
      }
    });
  }

  private createFooter(): void {
    const hint = this.add.text(GAME_WIDTH / 2, 530, '[W/S or \u2191/\u2193] SELECT  \u2022  [ENTER] CONFIRM  \u2022  [ESC] RESUME', {
      fontFamily: 'VT323, monospace',
      fontSize: `${getScaledFontSize(16)}px`,
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.5);
    this.trackScaledText(hint, 16);
  }

  private setupInput(): void {
    // Navigation - UP
    const navigateUp = () => {
      const newIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateSelection(newIndex);
    };

    // Navigation - DOWN
    const navigateDown = () => {
      const newIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateSelection(newIndex);
    };

    // Activate selection
    const activateSelection = () => {
      const callback = this.buttons[this.selectedIndex].getData('callback') as () => void;
      callback();
    };

    // Arrow keys
    this.input.keyboard?.on('keydown-UP', navigateUp);
    this.input.keyboard?.on('keydown-DOWN', navigateDown);

    // WASD
    this.input.keyboard?.on('keydown-W', navigateUp);
    this.input.keyboard?.on('keydown-S', navigateDown);

    // Confirm
    this.input.keyboard?.on('keydown-ENTER', activateSelection);
    this.input.keyboard?.on('keydown-SPACE', activateSelection);

    // ESC to resume (quick resume without navigating)
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
  }

  private resume(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  private restart(): void {
    this.scene.stop();
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
    // UIScene will be launched by GameScene.create()
  }

  private quitToHub(): void {
    this.scene.stop();
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('BreakRoomScene');
  }

  private openSettings(): void {
    // Stop the pause overlay and game scenes, go to settings
    // Settings will return to BreakRoomScene (hub) when done
    this.scene.stop();
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('SettingsScene', { returnTo: 'BreakRoomScene' });
  }
}
