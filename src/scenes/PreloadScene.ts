/**
 * PRELOAD SCENE
 * Loads all game assets and displays a loading bar.
 * Assets are organized by type for easy management.
 */

import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';

export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingUI();
    this.loadAssets();
    this.setupLoadingEvents();
  }

  private createLoadingUI(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x333333, 1);
    this.loadingBar.fillRect(centerX - 200, centerY - 15, 400, 30);

    // Loading text
    this.loadingText = this.add.text(centerX, centerY - 50, 'INITIALIZING TERMINAL...', {
      fontFamily: 'VT323, monospace',
      fontSize: '32px',
      color: COLORS.TERMINAL_GREEN_CSS,
    }).setOrigin(0.5);
  }

  private loadAssets(): void {
    // ==========================================================================
    // PLACEHOLDER ASSETS
    // These will be replaced with AI-generated assets later.
    // For now, we generate simple graphics at runtime.
    // ==========================================================================

    // Generate placeholder textures programmatically
    this.generatePlaceholderTextures();

    // ==========================================================================
    // AUDIO PLACEHOLDERS
    // Using Web Audio API for procedural audio until real assets exist
    // ==========================================================================
    
    // We'll generate audio procedurally in the AudioSystem
    // No files to load for now
  }

  private generatePlaceholderTextures(): void {
    // Crusher texture (simple rectangle)
    const crusherGraphics = this.make.graphics({ x: 0, y: 0 });
    crusherGraphics.fillStyle(COLORS.TERMINAL_GREEN, 1);
    crusherGraphics.fillRect(0, 0, 800, 40);
    crusherGraphics.lineStyle(4, COLORS.GREEN_LIGHT, 1);
    crusherGraphics.strokeRect(0, 0, 800, 40);
    crusherGraphics.generateTexture('crusher', 800, 40);
    crusherGraphics.destroy();

    // Particle texture (small square)
    const particleGraphics = this.make.graphics({ x: 0, y: 0 });
    particleGraphics.fillStyle(COLORS.TERMINAL_GREEN, 1);
    particleGraphics.fillRect(0, 0, 8, 8);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // Error particle (red)
    const errorParticleGraphics = this.make.graphics({ x: 0, y: 0 });
    errorParticleGraphics.fillStyle(COLORS.ERROR_RED, 1);
    errorParticleGraphics.fillRect(0, 0, 8, 8);
    errorParticleGraphics.generateTexture('particle_error', 8, 8);
    errorParticleGraphics.destroy();

    // Letter block texture (background for physics letters)
    const letterBlockSize = 64;
    const letterBlockGraphics = this.make.graphics({ x: 0, y: 0 });
    letterBlockGraphics.fillStyle(0x0a0a0a, 1);
    letterBlockGraphics.fillRoundedRect(0, 0, letterBlockSize, letterBlockSize, 8);
    letterBlockGraphics.lineStyle(2, COLORS.TERMINAL_GREEN, 0.6);
    letterBlockGraphics.strokeRoundedRect(0, 0, letterBlockSize, letterBlockSize, 8);
    letterBlockGraphics.generateTexture('letter_block', letterBlockSize, letterBlockSize);
    letterBlockGraphics.destroy();

    // Penalty letter block (red border)
    const penaltyBlockGraphics = this.make.graphics({ x: 0, y: 0 });
    penaltyBlockGraphics.fillStyle(0x1a0505, 1);
    penaltyBlockGraphics.fillRoundedRect(0, 0, letterBlockSize, letterBlockSize, 8);
    penaltyBlockGraphics.lineStyle(3, COLORS.ERROR_RED, 0.8);
    penaltyBlockGraphics.strokeRoundedRect(0, 0, letterBlockSize, letterBlockSize, 8);
    penaltyBlockGraphics.generateTexture('penalty_block', letterBlockSize, letterBlockSize);
    penaltyBlockGraphics.destroy();
  }

  private setupLoadingEvents(): void {
    this.load.on('progress', (value: number) => {
      // Update loading bar
      this.loadingBar.clear();
      this.loadingBar.fillStyle(0x333333, 1);
      this.loadingBar.fillRect(GAME_WIDTH / 2 - 200, GAME_HEIGHT / 2 - 15, 400, 30);
      this.loadingBar.fillStyle(COLORS.TERMINAL_GREEN, 1);
      this.loadingBar.fillRect(GAME_WIDTH / 2 - 198, GAME_HEIGHT / 2 - 13, 396 * value, 26);
    });

    this.load.on('complete', () => {
      this.loadingText.setText('TERMINAL READY');
    });
  }

  create(): void {
    // Initialize audio system (uses Web Audio API with procedural fallbacks)
    AudioManager.init();

    // Brief delay before menu for effect
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
