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
import { GameScene } from '@scenes/GameScene';
import { UIScene } from '@scenes/UIScene';
import { ResultScene } from '@scenes/ResultScene';

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
  
  // Matter.js physics (for future coin-pusher mechanics)
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 1 },
      debug: false, // Set to true during development to see physics bodies
    },
  },
  
  // All game scenes
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    UIScene,
    ResultScene,
  ],
  
  // Rendering
  render: {
    pixelArt: false,
    antialias: true,
  },
  
  // Input
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
  },
};

// Create game instance
const game = new Phaser.Game(config);

// Expose for debugging in development
if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}

export default game;
