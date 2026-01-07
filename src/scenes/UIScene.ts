/**
 * UI SCENE
 * Heads-up display overlay that runs in parallel with GameScene.
 * Displays: stage, combo, pressure bar, status text.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, CRUSHER, TIMING } from '../constants';

export class UIScene extends Phaser.Scene {
  // UI Elements
  private stageText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private pressureBar!: Phaser.GameObjects.Graphics;
  private pressureBarBg!: Phaser.GameObjects.Rectangle;
  
  // State
  private currentPressure: number = 0;
  private targetPressure: number = 0;
  private isPanicking: boolean = false;
  private isOverdrive: boolean = false;
  private currentCombo: number = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.createTopHUD();
    this.createComboDisplay();
    this.setupEventListeners();
  }

  private createTopHUD(): void {
    const progress = this.registry.get('playerProgress');
    
    // HUD Container background
    const hudBg = this.add.rectangle(GAME_WIDTH / 2, 50, 600, 80, 0x000000, 0.9)
      .setStrokeStyle(3, COLORS.TERMINAL_GREEN);

    // Stage indicator
    this.stageText = this.add.text(GAME_WIDTH / 2 - 250, 30, `CHANNEL ${progress.stage}`, {
      fontFamily: 'VT323, monospace',
      fontSize: '28px',
      color: COLORS.TERMINAL_GREEN_CSS,
    });
    this.stageText.setShadow(0, 0, COLORS.TERMINAL_GREEN_CSS, 5, true, true);

    // Status text
    this.statusText = this.add.text(GAME_WIDTH / 2 + 100, 30, 'STATUS: LIVE', {
      fontFamily: 'VT323, monospace',
      fontSize: '28px',
      color: COLORS.TERMINAL_GREEN_CSS,
    });

    // Pressure bar background
    this.pressureBarBg = this.add.rectangle(GAME_WIDTH / 2, 65, 500, 20, 0x111111)
      .setStrokeStyle(2, COLORS.UI_DIM);

    // Pressure bar fill (will be drawn with graphics for gradient effect)
    this.pressureBar = this.add.graphics();
    this.updatePressureBar(CRUSHER.INITIAL_Y_PERCENT);
  }

  private createComboDisplay(): void {
    this.comboText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 180, '', {
      fontFamily: 'VT323, monospace',
      fontSize: '48px',
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
      combo: number;
    }) => {
      this.targetPressure = data.percent;
      this.isPanicking = data.isPanicking;
      this.isOverdrive = data.isOverdrive;
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
      // Flash HUD red briefly
      this.cameras.main.flash(100, 255, 0, 0, false, (cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
        if (progress === 1) {
          this.statusText.setColor(COLORS.TERMINAL_GREEN_CSS);
        }
      });
    });
  }

  private updatePressureBar(percent: number): void {
    this.pressureBar.clear();
    
    const barX = GAME_WIDTH / 2 - 248;
    const barY = 56;
    const barWidth = 496;
    const barHeight = 18;
    const fillWidth = (percent / CRUSHER.KILL_ZONE_PERCENT) * barWidth;
    
    // Determine color based on state
    let fillColor = COLORS.TERMINAL_GREEN;
    if (this.isOverdrive) {
      fillColor = COLORS.OVERDRIVE_WHITE;
    } else if (this.isPanicking) {
      fillColor = COLORS.ERROR_RED;
    }
    
    this.pressureBar.fillStyle(fillColor, 1);
    this.pressureBar.fillRect(barX, barY, fillWidth, barHeight);
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
    if (this.isOverdrive) {
      this.statusText.setText('CRITICAL GAIN');
      this.statusText.setColor('#ffffff');
    } else if (this.isPanicking) {
      this.statusText.setText('COMPRESSION MAX');
      this.statusText.setColor('#ff0000');
      
      // Pulse animation when panicking
      if (!this.statusText.getData('pulsing')) {
        this.statusText.setData('pulsing', true);
        this.tweens.add({
          targets: this.statusText,
          alpha: { from: 1, to: 0.5 },
          duration: 200,
          yoyo: true,
          repeat: -1,
        });
      }
    } else {
      this.statusText.setText('STATUS: LIVE');
      this.statusText.setColor(COLORS.TERMINAL_GREEN_CSS);
      this.statusText.setAlpha(1);
      this.statusText.setData('pulsing', false);
      this.tweens.killTweensOf(this.statusText);
    }
  }

  update(time: number, delta: number): void {
    // Smooth pressure bar animation
    const lerpSpeed = 0.1;
    this.currentPressure = Phaser.Math.Linear(this.currentPressure, this.targetPressure, lerpSpeed);
    this.updatePressureBar(this.currentPressure);
  }
}
