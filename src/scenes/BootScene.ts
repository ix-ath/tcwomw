/**
 * BOOT SCENE
 * First scene that runs. Sets up global game settings and moves to Preload.
 */

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Set up any global registry data
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

    this.registry.set('gameConfig', {
      difficulty: 'EASY',
      soundEnabled: true,
      musicEnabled: true,
      screenShakeEnabled: true,
      highContrastMode: false,
      reducedMotion: false,
    });

    // Move to preload
    this.scene.start('PreloadScene');
  }
}
