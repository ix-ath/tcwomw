/**
 * BOOT SCENE
 * First scene that runs. Sets up global game settings and moves to Preload.
 */

import Phaser from 'phaser';
import { SettingsManager } from '@systems/SettingsManager';
import { applyColorblindFilter } from '@utils/colorblindFilter';

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

    // Apply initial colorblind filter from settings
    applyColorblindFilter(SettingsManager.getColorblindMode());

    // Subscribe to colorblind mode changes
    SettingsManager.onChange('colorblindMode', (mode) => {
      applyColorblindFilter(mode as Parameters<typeof applyColorblindFilter>[0]);
    });

    // Move to preload
    this.scene.start('PreloadScene');
  }
}
