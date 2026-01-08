/**
 * MENU SCENE
 * Title screen with main navigation.
 * Styled to match the CRT terminal aesthetic.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { Difficulty } from '../types';
import { SaveManager } from '../systems/SaveManager';

export class MenuScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Container[] = [];
  private selectedIndex: number = 0;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.createTitle();
    this.createDifficultyButtons();
    this.createFooter();
    this.setupInput();
  }

  private createTitle(): void {
    const centerX = GAME_WIDTH / 2;

    // Main title
    const title = this.add.text(centerX, 120, 'THE CRUSHING\nWEIGHT OF\nMY WORDS', {
      fontFamily: 'VT323, monospace',
      fontSize: '72px',
      color: COLORS.TERMINAL_GREEN_CSS,
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5);

    // Add glow effect via shadow
    title.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 10, true, true);

    // Tagline
    this.add.text(centerX, 300, '"TYPE THE TRUTH OR BE ERASED"', {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.7);
  }

  private createDifficultyButtons(): void {
    const centerX = GAME_WIDTH / 2;
    const startY = 380;
    const spacing = 60;

    // Check if player has any progress
    const stats = SaveManager.getStats();
    const hasProgress = stats.chaptersCompleted > 0 || stats.totalPlayTime > 0;

    // Main menu options
    const options: { label: string; action: () => void }[] = [];

    if (hasProgress) {
      options.push({
        label: 'CONTINUE',
        action: () => this.goToBreakRoom(),
      });
    }

    options.push({
      label: 'NEW SHIFT',
      action: () => this.goToBreakRoom(),
    });

    options.push({
      label: 'QUICK PLAY',
      action: () => this.startGame(Difficulty.MEDIUM),
    });

    // Create buttons
    options.forEach((opt, index) => {
      const button = this.createButton(centerX, startY + index * spacing, opt.label, opt.action);
      this.buttons.push(button);
    });

    // Highlight first button
    this.updateSelection(0);
  }

  private goToBreakRoom(): void {
    this.scene.start('BreakRoomScene');
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 280, 50, 0x000000)
      .setStrokeStyle(3, COLORS.TERMINAL_GREEN);

    // Button text
    const label = this.add.text(0, 0, text, {
      fontFamily: 'VT323, monospace',
      fontSize: '32px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

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
        
        // Add selection indicator
        bg.setStrokeStyle(4, COLORS.OVERDRIVE_WHITE);
      } else {
        bg.setFillStyle(0x000000, 1);
        label.setColor(COLORS.TERMINAL_GREEN_CSS);
        bg.setStrokeStyle(3, COLORS.TERMINAL_GREEN);
      }
    });
  }

  private createFooter(): void {
    const centerX = GAME_WIDTH / 2;

    this.add.text(centerX, GAME_HEIGHT - 50, '[ TRANSMIT TO SURVIVE ]', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.4);

    // Controls hint
    this.add.text(centerX, GAME_HEIGHT - 25, '↑↓ SELECT  •  ENTER START', {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0.3);
  }

  private setupInput(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => {
      const newIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateSelection(newIndex);
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      const newIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateSelection(newIndex);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      const callback = this.buttons[this.selectedIndex].getData('callback') as () => void;
      callback();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      const callback = this.buttons[this.selectedIndex].getData('callback') as () => void;
      callback();
    });
  }

  private startGame(difficulty: Difficulty): void {
    // Store selected difficulty
    this.registry.set('selectedDifficulty', difficulty);
    
    // Reset progress for new game
    this.registry.set('playerProgress', {
      totalScore: 0,
      stage: 1,
      wordsCompleted: 0,
      hydraulicsRepair: 0,
      steamVentRepair: 0,
      brassGearsRepair: 0,
      scrip: 0,
      scrapCollected: 0,
    });

    // Start game scene with UI overlay
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
