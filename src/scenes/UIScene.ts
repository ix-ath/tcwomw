/**
 * UI SCENE
 * Heads-up display overlay that runs in parallel with GameScene.
 * Left sidebar layout with: score, pressure bar, status, combo.
 */

import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, LAYOUT } from '../constants';

export class UIScene extends Phaser.Scene {
  // UI Elements
  private stageText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private pressureBar!: Phaser.GameObjects.Graphics;

  // State
  private currentPressure: number = 0;
  private targetPressure: number = 0;
  private isPanicking: boolean = false;
  private isOverdrive: boolean = false;
  private currentCombo: number = 0;
  private isDormant: boolean = true;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.createLeftSidebar();
    this.createComboDisplay();
    this.setupEventListeners();
  }

  private createLeftSidebar(): void {
    const progress = this.registry.get('playerProgress');
    const sidebarX = LAYOUT.SIDEBAR_X;

    // Sidebar background
    this.add.rectangle(
      sidebarX,
      GAME_HEIGHT / 2,
      LAYOUT.SIDEBAR_WIDTH - 20,
      GAME_HEIGHT - 40,
      0x000000,
      0.8
    ).setStrokeStyle(2, COLORS.UI_DIM);

    // Stage indicator at top
    this.stageText = this.add.text(sidebarX, 40, `CH ${progress.stage}`, {
      fontFamily: 'VT323, monospace',
      fontSize: '24px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);
    this.stageText.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 3, true, true);

    // Score label
    this.add.text(sidebarX, 90, 'SCORE', {
      fontFamily: 'VT323, monospace',
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);

    // Score value (will be dynamic later)
    this.add.text(sidebarX, 115, '0', {
      fontFamily: 'VT323, monospace',
      fontSize: '28px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);

    // Pressure label
    this.add.text(sidebarX, 170, 'PRESSURE', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);

    // Vertical pressure bar background
    this.add.rectangle(
      sidebarX,
      320,
      30,
      250,
      0x111111
    ).setStrokeStyle(2, COLORS.UI_DIM);

    // Pressure bar fill (drawn with graphics)
    this.pressureBar = this.add.graphics();
    this.updatePressureBar(0);

    // Status text
    this.statusText = this.add.text(sidebarX, 480, 'DORMANT', {
      fontFamily: 'VT323, monospace',
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5);

    // Mods placeholder
    this.add.text(sidebarX, 550, 'MODS', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#444444',
    }).setOrigin(0.5);

    this.add.rectangle(sidebarX, 610, 100, 80, 0x111111, 0.5)
      .setStrokeStyle(1, COLORS.UI_DIM);

    this.add.text(sidebarX, 610, 'NONE', {
      fontFamily: 'VT323, monospace',
      fontSize: '14px',
      color: '#333333',
    }).setOrigin(0.5);
  }

  private createComboDisplay(): void {
    // Combo display in the game area (not sidebar)
    this.comboText = this.add.text(LAYOUT.GAME_AREA_CENTER_X, 550, '', {
      fontFamily: 'VT323, monospace',
      fontSize: '36px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5).setAlpha(0);
  }

  private setupEventListeners(): void {
    // Listen to GameScene events
    const gameScene = this.scene.get('GameScene');

    gameScene.events.on('crusherUpdate', (data: {
      y: number;
      percent: number;
      isPanicking: boolean;
      isOverdrive: boolean;
      isDormant?: boolean;
      combo: number;
    }) => {
      this.targetPressure = data.percent;
      this.isPanicking = data.isPanicking;
      this.isOverdrive = data.isOverdrive;
      this.isDormant = data.isDormant ?? false;
      this.updateCombo(data.combo);
      this.updateStatus();
    });

    gameScene.events.on('correctLetter', () => {
      // Flash effect on combo
      if (this.currentCombo > 0) {
        this.tweens.add({
          targets: this.comboText,
          scale: { from: 1.3, to: 1 },
          duration: 150,
        });
      }
    });

    gameScene.events.on('wrongLetter', () => {
      // Brief flash on sidebar
      this.cameras.main.flash(100, 255, 0, 0, false);
    });
  }

  private updatePressureBar(percent: number): void {
    this.pressureBar.clear();

    const sidebarX = LAYOUT.SIDEBAR_X;
    const barWidth = 26;
    const barHeight = 246;
    const barTop = 197; // Top of bar
    const barBottom = barTop + barHeight;

    // Fill from bottom up (percent 0 = empty, 100 = full)
    const fillHeight = (percent / 100) * barHeight;
    const fillY = barBottom - fillHeight;

    // Determine color based on state
    let fillColor: number = COLORS.TERMINAL_GREEN;
    if (this.isOverdrive) {
      fillColor = COLORS.OVERDRIVE_WHITE;
    } else if (this.isPanicking) {
      fillColor = COLORS.ERROR_RED;
    } else if (this.isDormant) {
      fillColor = COLORS.UI_DIM;
    }

    this.pressureBar.fillStyle(fillColor, 1);
    this.pressureBar.fillRect(sidebarX - barWidth / 2, fillY, barWidth, fillHeight);
  }

  private updateCombo(combo: number): void {
    this.currentCombo = combo;
    
    if (combo > 0) {
      this.comboText.setText(`STREAK x${combo}`);
      this.comboText.setAlpha(1);
      
      // Color based on overdrive
      if (this.isOverdrive) {
        this.comboText.setColor('#ffffff');
        this.comboText.setShadow(0, 0, '#ffffff', 15, true, true);
      } else {
        this.comboText.setColor(COLORS.TERMINAL_GREEN_CSS);
        this.comboText.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 10, true, true);
      }
    } else {
      this.comboText.setAlpha(0);
    }
  }

  private updateStatus(): void {
    // Stop any existing pulse animation
    this.tweens.killTweensOf(this.statusText);
    this.statusText.setAlpha(1);

    if (this.isOverdrive) {
      this.statusText.setText('OVERDRIVE');
      this.statusText.setColor('#ffffff');
      this.statusText.setShadow(0, 0, '#ffffff', 8, true, true);
    } else if (this.isPanicking) {
      this.statusText.setText('CRITICAL');
      this.statusText.setColor('#ff0000');
      this.statusText.setShadow(0, 0, '#ff0000', 5, true, true);

      // Pulse animation when panicking
      this.tweens.add({
        targets: this.statusText,
        alpha: { from: 1, to: 0.5 },
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    } else if (this.isDormant) {
      this.statusText.setText('DORMANT');
      this.statusText.setColor('#666666');
      this.statusText.setShadow(0, 0, 'transparent', 0);
    } else {
      this.statusText.setText('DESCENDING');
      this.statusText.setColor(COLORS.TERMINAL_GREEN_CSS);
      this.statusText.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 3, true, true);
    }
  }

  update(): void {
    // Smooth pressure bar animation
    const lerpSpeed = 0.1;
    this.currentPressure = Phaser.Math.Linear(this.currentPressure, this.targetPressure, lerpSpeed);
    this.updatePressureBar(this.currentPressure);
  }
}
