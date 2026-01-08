/**
 * MAIN ENTRY POINT
 * Initializes Phaser with Matter.js physics and registers all scenes.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, BACKGROUND_COLOR } from './constants';

// Scenes
import { BootScene } from '@scenes/BootScene';
import { PreloadScene } from '@scenes/PreloadScene';
import { MenuScene } from '@scenes/MenuScene';
import { BreakRoomScene } from '@scenes/BreakRoomScene';
import { TutorialScene } from '@scenes/TutorialScene';
import { GameScene } from '@scenes/GameScene';
import { UIScene } from '@scenes/UIScene';
import { ResultScene } from '@scenes/ResultScene';
import { PauseScene } from '@scenes/PauseScene';
import { SettingsScene } from '@scenes/SettingsScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: BACKGROUND_COLOR,
  
  // Scale to fit window while maintaining aspect ratio
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  
  // Matter.js physics for coin-pusher mechanics
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0 }, // No gravity - letters stay put until pushed
      debug: false, // Set to true during development to see physics bodies
    },
  },
  
  // All game scenes
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    BreakRoomScene,
    TutorialScene,
    GameScene,
    UIScene,
    ResultScene,
    PauseScene,
    SettingsScene,
  ],
  
  // Rendering
  render: {
    pixelArt: false,
    antialias: true,
  },
  
  // Input - mouse/touch enabled for mouse-only mode and UI
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
};

// Create game instance
const game = new Phaser.Game(config);

// Expose for debugging in development
// @ts-expect-error - Vite's import.meta.env types
if (import.meta.env?.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}

export default game;
